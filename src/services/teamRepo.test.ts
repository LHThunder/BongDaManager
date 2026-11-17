import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  laySoDo,
  soDoTheoQuanSo,
  SO_DO_MAC_DINH,
} from '../domain/formations'
import { sinhDoi } from '../domain/generator'
import { KHO_TEN_VIET } from '../domain/tenNgauNhien'
import type { Rng } from '../domain/types'
import { cacXungDot, THU_TU_CHI_THI } from '../domain/instructions'
import { vaiTroApDungDuoc } from '../domain/roles'
import type { Player } from '../domain/types'
import { DB_NAME, dongDb, moDb } from '../storage/db'
import { LoiUngDung } from './errors'
import * as tacticRepo from './tacticRepo'
import * as teamRepo from './teamRepo'

function xoaDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const yc = indexedDB.deleteDatabase(DB_NAME)
    yc.onsuccess = () => resolve()
    yc.onblocked = () => resolve()
    yc.onerror = () => reject(yc.error)
  })
}

beforeEach(async () => {
  await dongDb()
  await xoaDatabase()
})

function cauThuMau(teamId: string, so: number, anhId: string | null): Player {
  const bayGio = Date.now()
  return {
    id: crypto.randomUUID(),
    teamId,
    name: `Cầu thủ ${so}`,
    shirtNumber: so,
    age: 25,
    preferredFoot: 'phai',
    positions: ['DC'],
    attributes: {},
    gkAttributes: null,
    portraitImageId: anhId,
    createdAt: bayGio,
    updatedAt: bayGio,
  }
}

async function themCauThu(
  teamId: string,
  so: number,
  coAnh = false,
): Promise<Player> {
  const db = await moDb()
  const anhId = coAnh ? crypto.randomUUID() : null
  if (anhId) {
    await db.put('images', {
      id: anhId,
      blob: new Blob(['anh-gia'], { type: 'image/jpeg' }),
      width: 64,
      height: 64,
      byteSize: 7,
    })
  }
  const p = cauThuMau(teamId, so, anhId)
  await db.put('players', p)
  return p
}

describe('tạo đội (AC-1.2, AC-1.3)', () => {
  it('tạo được đội với tên hợp lệ', async () => {
    const doi = await teamRepo.create({ name: 'Đội của tôi' })
    expect(doi.id).toBeTruthy()
    expect(doi.name).toBe('Đội của tôi')
    expect(doi.logoImageId).toBeNull()
    expect(doi.primaryColor).toBe(teamRepo.MAU_AO_MAC_DINH.chinh)
  })

  it('cắt khoảng trắng hai đầu của tên', async () => {
    const doi = await teamRepo.create({ name: '  Sông Lam  ' })
    expect(doi.name).toBe('Sông Lam')
  })

  it('từ chối tên rỗng', async () => {
    await expect(teamRepo.create({ name: '' })).rejects.toThrow(LoiUngDung)
    await expect(teamRepo.create({ name: '' })).rejects.toMatchObject({
      ma: 'EmptyName',
    })
  })

  it('từ chối tên chỉ gồm khoảng trắng', async () => {
    await expect(teamRepo.create({ name: '   ' })).rejects.toMatchObject({
      ma: 'EmptyName',
    })
  })

  it('cho phép hai đội trùng tên', async () => {
    await teamRepo.create({ name: 'Trùng tên' })
    await teamRepo.create({ name: 'Trùng tên' })
    expect(await teamRepo.findByName('Trùng tên')).toHaveLength(2)
  })
})

describe('danh sách đội (AC-1.4)', () => {
  it('đội mới chưa có cầu thủ thì đếm ra 0', async () => {
    await teamRepo.create({ name: 'Đội A' })
    const ds = await teamRepo.list()
    expect(ds).toHaveLength(1)
    expect(ds[0]?.soCauThu).toBe(0)
  })

  it('đếm đúng số cầu thủ của từng đội', async () => {
    const a = await teamRepo.create({ name: 'Đội A' })
    const b = await teamRepo.create({ name: 'Đội B' })
    await themCauThu(a.id, 1)
    await themCauThu(a.id, 2)
    await themCauThu(b.id, 1)

    const ds = await teamRepo.list()
    const theoTen = new Map(ds.map((d) => [d.name, d.soCauThu]))
    expect(theoTen.get('Đội A')).toBe(2)
    expect(theoTen.get('Đội B')).toBe(1)
  })

  it('sắp xếp theo tên', async () => {
    await teamRepo.create({ name: 'Xuân Thành' })
    await teamRepo.create({ name: 'An Giang' })
    const ds = await teamRepo.list()
    expect(ds.map((d) => d.name)).toEqual(['An Giang', 'Xuân Thành'])
  })

  it('chưa có đội nào thì trả danh sách rỗng (AC-1.1)', async () => {
    expect(await teamRepo.list()).toEqual([])
  })
})

describe('đọc và đổi tên đội (AC-1.5)', () => {
  it('get trả đúng đội', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    expect((await teamRepo.get(doi.id)).name).toBe('Đội A')
  })

  it('get báo NotFound với id lạ', async () => {
    await expect(teamRepo.get('khong-ton-tai')).rejects.toMatchObject({
      ma: 'NotFound',
    })
  })

  it('đổi tên và tên mới được lưu lại', async () => {
    const doi = await teamRepo.create({ name: 'Tên cũ' })
    const sau = await teamRepo.rename(doi.id, 'Tên mới')
    expect(sau.name).toBe('Tên mới')
    expect((await teamRepo.get(doi.id)).name).toBe('Tên mới')
  })

  it('đổi tên có cập nhật updatedAt', async () => {
    const doi = await teamRepo.create({ name: 'Tên cũ' })
    const sau = await teamRepo.rename(doi.id, 'Tên mới')
    expect(sau.updatedAt).toBeGreaterThanOrEqual(doi.updatedAt)
    expect(sau.createdAt).toBe(doi.createdAt)
  })

  it('đổi tên thành rỗng bị từ chối', async () => {
    const doi = await teamRepo.create({ name: 'Tên cũ' })
    await expect(teamRepo.rename(doi.id, '  ')).rejects.toMatchObject({
      ma: 'EmptyName',
    })
    expect((await teamRepo.get(doi.id)).name).toBe('Tên cũ')
  })

  it('đổi tên đội không tồn tại báo NotFound', async () => {
    await expect(teamRepo.rename('khong-co', 'Tên')).rejects.toMatchObject({
      ma: 'NotFound',
    })
  })
})

describe('xoá đội (AC-1.6) — không để lại dữ liệu mồ côi', () => {
  it('trả về số cầu thủ đã xoá', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await themCauThu(doi.id, 1)
    await themCauThu(doi.id, 2)
    await themCauThu(doi.id, 3)

    expect(await teamRepo.remove(doi.id)).toEqual({ removedPlayers: 3 })
  })

  it('xoá sạch cầu thủ và ảnh chân dung của đội', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const p1 = await themCauThu(doi.id, 1, true)
    const p2 = await themCauThu(doi.id, 2, true)

    await teamRepo.remove(doi.id)

    const db = await moDb()
    expect(await db.get('players', p1.id)).toBeUndefined()
    expect(await db.get('players', p2.id)).toBeUndefined()
    expect(await db.count('players')).toBe(0)
    expect(await db.count('images')).toBe(0)
    expect(await db.count('teams')).toBe(0)
  })

  it('không chạm tới cầu thủ của đội khác', async () => {
    const a = await teamRepo.create({ name: 'Đội A' })
    const b = await teamRepo.create({ name: 'Đội B' })
    await themCauThu(a.id, 1, true)
    const cuaB = await themCauThu(b.id, 1, true)

    await teamRepo.remove(a.id)

    const db = await moDb()
    expect(await db.get('players', cuaB.id)).toBeDefined()
    expect(await db.count('players')).toBe(1)
    expect(await db.count('images')).toBe(1)
  })

  it('xoá đội không tồn tại báo NotFound', async () => {
    await expect(teamRepo.remove('khong-co')).rejects.toMatchObject({
      ma: 'NotFound',
    })
  })
})

describe('xoá đội thì dọn cả chiến thuật (AC-1.6)', () => {
  it('bộ đang dùng và các bộ có tên của đội đều bị xoá', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await tacticRepo.layChienThuatDangDung(doi.id)
    await tacticRepo.luuThanhBo(doi.id, 'Bộ 1')
    await tacticRepo.luuThanhBo(doi.id, 'Bộ 2')

    const db = await moDb()
    expect(await db.count('tactics')).toBe(3)

    await teamRepo.remove(doi.id)

    expect(await db.count('tactics')).toBe(0)
  })

  it('không chạm chiến thuật của đội khác', async () => {
    const a = await teamRepo.create({ name: 'Đội A' })
    const b = await teamRepo.create({ name: 'Đội B' })
    await tacticRepo.layChienThuatDangDung(a.id)
    await tacticRepo.luuThanhBo(b.id, 'Của B')

    await teamRepo.remove(a.id)

    const db = await moDb()
    const conLai = await db.getAll('tactics')
    expect(conLai.every((c) => c.teamId === b.id)).toBe(true)
    expect(conLai).toHaveLength(2)
  })

  it('đội không có chiến thuật nào thì vẫn xoá được bình thường', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await expect(teamRepo.remove(doi.id)).resolves.toEqual({
      removedPlayers: 0,
    })
  })
})

describe('đội mới có sẵn bộ chỉ thị cân bằng (AC-7.4)', () => {
  it('tạo đội là có ngay một chiến thuật, activeTacticId trỏ đúng vào nó', async () => {
    const doi = await teamRepo.create({ name: 'Đội mới' })

    expect(doi.activeTacticId).toBeTruthy()

    const db = await moDb()
    const cuaDoi = await db.getAllFromIndex('tactics', 'byTeam', doi.id)
    expect(cuaDoi).toHaveLength(1)
    expect(cuaDoi[0].id).toBe(doi.activeTacticId)
  })

  it('chiến thuật đó dùng được ngay: đủ 11 ô, vai trò mặc định hợp lệ', async () => {
    const doi = await teamRepo.create({ name: 'Đội mới' })
    const db = await moDb()
    const bo = (await db.getAllFromIndex('tactics', 'byTeam', doi.id))[0]

    expect(bo.formationId).toBe(SO_DO_MAC_DINH)
    expect(bo.oVien).toHaveLength(11)

    const viTriTheoSlot = new Map(
      laySoDo(bo.formationId).oVien.map((o) => [o.slotId, o.viTri]),
    )
    for (const o of bo.oVien) {
      const viTri = viTriTheoSlot.get(o.slotId)
      expect(viTri, o.slotId).toBeDefined()
      expect(vaiTroApDungDuoc(o.roleId, viTri!), o.slotId).toBe(true)
    }
  })

  it('bộ chỉ thị của đội mới không sinh xung đột nào', async () => {
    const doi = await teamRepo.create({ name: 'Đội mới' })
    const db = await moDb()
    const bo = (await db.getAllFromIndex('tactics', 'byTeam', doi.id))[0]

    expect(Object.keys(bo.chiThi).sort()).toEqual([...THU_TU_CHI_THI].sort())
    expect(cacXungDot(bo.chiThi)).toEqual([])
  })

  it('đọc lại đội từ database cũng thấy activeTacticId', async () => {
    const doi = await teamRepo.create({ name: 'Đội mới' })
    await dongDb()
    expect((await teamRepo.get(doi.id)).activeTacticId).toBe(doi.activeTacticId)
  })
})

/*
  Lưu một đội vừa SINH RA (T408, AC-24.4, AC-24.7).

  Phép kiểm quan trọng nhất ở đây là phép kiểm thất bại. "Tất cả hoặc không
  gì" là một tuyên bố về đường HỎNG, và đường hỏng thì không bao giờ tự chạy
  qua trong lúc dùng thử — nó chỉ chạy đúng một lần, trên máy người dùng,
  khi lưu trữ đầy. Nên nó phải bị ép chạy ở đây.
*/
function rngGia(hatGiong: number): Rng {
  let s = hatGiong >>> 0
  return {
    next() {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    },
  }
}

describe('lưu đội sinh ra (AC-24.4, AC-24.7)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function doiSinhRa(quanSo = 11, soDuBi = 7) {
    const soDo = soDoTheoQuanSo(quanSo)[0]
    if (!soDo) throw new Error(`không có sơ đồ cho quân số ${quanSo}`)
    return {
      soDo,
      cacCauThu: sinhDoi(
        { muc: 'kha', kho: KHO_TEN_VIET, soDo, soDuBi },
        rngGia(7),
      ),
    }
  }

  it('lưu đủ đội, cầu thủ và chiến thuật', async () => {
    const { soDo, cacCauThu } = doiSinhRa()
    const doi = await teamRepo.taoDoiSinhRa({
      name: 'Đội sinh ra',
      cacCauThu,
      formationId: soDo.id,
    })

    const db = await moDb()
    expect(await db.get('teams', doi.id)).toBeTruthy()
    expect(await db.getAllFromIndex('players', 'byTeam', doi.id)).toHaveLength(
      18,
    )

    const cacBo = await db.getAllFromIndex('tactics', 'byTeam', doi.id)
    expect(cacBo).toHaveLength(1)
    expect(doi.activeTacticId).toBe(cacBo[0]?.id)
    expect(cacBo[0]?.formationId).toBe(soDo.id)
  })

  it('bộ chiến thuật sinh kèm đã xếp ĐỦ ô — đội đá được ngay (AC-24.4)', async () => {
    for (let quanSo = 5; quanSo <= 11; quanSo += 1) {
      await dongDb()
      await xoaDatabase()

      const { soDo, cacCauThu } = doiSinhRa(quanSo)
      const doi = await teamRepo.taoDoiSinhRa({
        name: `Đội ${quanSo}`,
        cacCauThu,
        formationId: soDo.id,
      })

      const db = await moDb()
      const bo = (await db.getAllFromIndex('tactics', 'byTeam', doi.id))[0]
      expect(bo?.oVien, `quân số ${quanSo}`).toHaveLength(soDo.oVien.length)
      for (const o of bo?.oVien ?? []) {
        expect(o.playerId, `quân số ${quanSo}, ô ${o.slotId}`).not.toBeNull()
      }
      // Không ai được xếp vào hai ô cùng lúc.
      const daXep = (bo?.oVien ?? []).map((o) => o.playerId)
      expect(new Set(daXep).size).toBe(daXep.length)
    }
  })

  it('mỗi ô có vai trò mặc định của chính vị trí ô đó', async () => {
    const { soDo, cacCauThu } = doiSinhRa()
    const doi = await teamRepo.taoDoiSinhRa({
      name: 'Đội vai trò',
      cacCauThu,
      formationId: soDo.id,
    })
    const db = await moDb()
    const bo = (await db.getAllFromIndex('tactics', 'byTeam', doi.id))[0]
    soDo.oVien.forEach((o, i) => {
      const oBo = bo?.oVien[i]
      expect(oBo?.slotId).toBe(o.slotId)
      expect(oBo?.roleId, o.slotId).toBeDefined()
      expect(vaiTroApDungDuoc(oBo!.roleId, o.viTri), o.slotId).toBe(true)
    })
  })

  it('cầu thủ sinh ra KHÔNG mang ảnh nào', async () => {
    const { soDo, cacCauThu } = doiSinhRa()
    const doi = await teamRepo.taoDoiSinhRa({
      name: 'Đội không ảnh',
      cacCauThu,
      formationId: soDo.id,
    })
    const db = await moDb()
    for (const p of await db.getAllFromIndex('players', 'byTeam', doi.id)) {
      expect(p.portraitImageId).toBeNull()
    }
    expect(await db.getAll('images')).toHaveLength(0)
  })

  it('hỏng giữa chừng thì KHÔNG để lại đội, cầu thủ hay chiến thuật nào (AC-24.7)', async () => {
    const { soDo, cacCauThu } = doiSinhRa()

    /*
      Ép hỏng bằng cách cho mọi id trùng nhau: `add` của store `players` ném
      ConstraintError ở người thứ hai, tức giữa transaction — sau khi đội đã
      được ghi. Đây đúng hình dạng của một lần ghi thất bại thật.
    */
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111',
    )

    await expect(
      teamRepo.taoDoiSinhRa({
        name: 'Đội hỏng',
        cacCauThu,
        formationId: soDo.id,
      }),
    ).rejects.toBeInstanceOf(LoiUngDung)

    vi.restoreAllMocks()

    const db = await moDb()
    expect(await db.getAll('teams')).toHaveLength(0)
    expect(await db.getAll('players')).toHaveLength(0)
    expect(await db.getAll('tactics')).toHaveLength(0)
  })

  it('tên rỗng bị từ chối TRƯỚC khi ghi gì', async () => {
    const { soDo, cacCauThu } = doiSinhRa()
    await expect(
      teamRepo.taoDoiSinhRa({
        name: '   ',
        cacCauThu,
        formationId: soDo.id,
      }),
    ).rejects.toBeInstanceOf(LoiUngDung)

    const db = await moDb()
    expect(await db.getAll('teams')).toHaveLength(0)
    expect(await db.getAll('players')).toHaveLength(0)
  })

  it('đội sinh ra là bản ghi BÌNH THƯỜNG — list và get đọc được như mọi đội', async () => {
    const { soDo, cacCauThu } = doiSinhRa()
    const doi = await teamRepo.taoDoiSinhRa({
      name: 'Đội bình thường',
      cacCauThu,
      formationId: soDo.id,
    })

    const danh = await teamRepo.list()
    expect(danh.find((d) => d.id === doi.id)?.soCauThu).toBe(18)
    expect((await teamRepo.get(doi.id)).name).toBe('Đội bình thường')
  })
})
