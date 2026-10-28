import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { laySoDo, SO_DO_MAC_DINH } from '../domain/formations'
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
