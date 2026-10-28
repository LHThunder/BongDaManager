import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { laySoDo, SO_DO_MAC_DINH } from '../domain/formations'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { vaiTroMacDinh } from '../domain/roles'
import type { Player, Tactic } from '../domain/types'
import { DB_NAME, dongDb, moDb } from '../storage/db'
import { laLoi, LoiUngDung } from './errors'
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

async function themCauThu(teamId: string, so: number): Promise<Player> {
  const bayGio = Date.now()
  const cauThu: Player = {
    id: crypto.randomUUID(),
    teamId,
    name: `Cầu thủ ${so}`,
    shirtNumber: so,
    age: 25,
    preferredFoot: 'phai',
    positions: ['DC'],
    attributes: {},
    gkAttributes: null,
    portraitImageId: null,
    createdAt: bayGio,
    updatedAt: bayGio,
  }
  const db = await moDb()
  await db.add('players', cauThu)
  return cauThu
}

/** Id của ô trung vệ đầu tiên trong sơ đồ mặc định. */
const O_TRUNG_VE = laySoDo(SO_DO_MAC_DINH).oVien.find(
  (o) => o.viTri === 'DC',
)!.slotId

function datCauThuVaoO(
  chienThuat: Tactic,
  slotId: string,
  playerId: string | null,
): Tactic {
  return {
    ...chienThuat,
    oVien: chienThuat.oVien.map((o) =>
      o.slotId === slotId ? { ...o, playerId } : o,
    ),
  }
}

describe('bộ chiến thuật đang dùng (AC-5.10)', () => {
  it('đội chưa có bộ nào thì nhận một bộ mặc định', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const chienThuat = await tacticRepo.layChienThuatDangDung(doi.id)

    expect(chienThuat.teamId).toBe(doi.id)
    expect(chienThuat.ten).toBeNull()
    expect(chienThuat.formationId).toBe(SO_DO_MAC_DINH)
    expect(chienThuat.oVien).toHaveLength(11)
    expect(chienThuat.chiThi).toEqual(CHI_THI_MAC_DINH)
  })

  it('gọi lần thứ hai trả về đúng bộ đó, không tạo thêm', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const a = await tacticRepo.layChienThuatDangDung(doi.id)
    const b = await tacticRepo.layChienThuatDangDung(doi.id)

    expect(b.id).toBe(a.id)
    const db = await moDb()
    expect(await db.count('tactics')).toBe(1)
  })

  it('activeTacticId của đội trỏ đúng vào bộ đó', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const chienThuat = await tacticRepo.layChienThuatDangDung(doi.id)

    expect((await teamRepo.get(doi.id)).activeTacticId).toBe(chienThuat.id)
  })

  it('activeTacticId trỏ vào bản ghi không còn tồn tại thì tạo bộ mới', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const cu = await tacticRepo.layChienThuatDangDung(doi.id)

    const db = await moDb()
    await db.delete('tactics', cu.id)

    const moi = await tacticRepo.layChienThuatDangDung(doi.id)
    expect(moi.id).not.toBe(cu.id)
    expect((await teamRepo.get(doi.id)).activeTacticId).toBe(moi.id)
  })

  it('đội không tồn tại thì NotFound', async () => {
    await expect(
      tacticRepo.layChienThuatDangDung('khong-co-doi-nay'),
    ).rejects.toSatisfy((loi) => laLoi(loi, 'NotFound'))
  })
})

describe('lưu rồi đọc lại (AC-5.10)', () => {
  it('đổi sơ đồ, xếp người và đổi chỉ thị thì đọc lại ra đúng như vậy', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const cauThu = await themCauThu(doi.id, 4)
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)

    const soDoMoi = laySoDo('4-3-3')
    const oDuocXep = soDoMoi.oVien.find((o) => o.viTri === 'DC')!.slotId
    const sua: Tactic = {
      ...goc,
      formationId: '4-3-3',
      oVien: soDoMoi.oVien.map((o) => ({
        slotId: o.slotId,
        playerId: o.slotId === oDuocXep ? cauThu.id : null,
        roleId: vaiTroMacDinh(o.viTri),
      })),
      chiThi: { ...CHI_THI_MAC_DINH, 'do-cao-doi-hinh': 'cao' },
    }
    await tacticRepo.luu(sua)

    await dongDb()
    const docLai = await tacticRepo.layChienThuatDangDung(doi.id)

    expect(docLai.id).toBe(goc.id)
    expect(docLai.formationId).toBe('4-3-3')
    expect(docLai.chiThi['do-cao-doi-hinh']).toBe('cao')
    expect(
      docLai.oVien.filter((o) => o.playerId === cauThu.id),
    ).toHaveLength(1)
  })

  it('luu cập nhật updatedAt', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)
    const daGhi = await tacticRepo.luu({ ...goc, updatedAt: 0 })

    expect(daGhi.updatedAt).toBeGreaterThan(0)
  })
})

describe('bộ sai hình dạng bị từ chối (AC-5.10)', () => {
  it('không đủ 11 ô', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)

    await expect(
      tacticRepo.luu({ ...goc, oVien: goc.oVien.slice(0, 10) }),
    ).rejects.toSatisfy((loi) => laLoi(loi, 'InvalidTactic'))
  })

  it('ô không thuộc sơ đồ', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)
    const sai = {
      ...goc,
      oVien: goc.oVien.map((o, i) =>
        i === 0 ? { ...o, slotId: 'o-khong-ton-tai' } : o,
      ),
    }

    await expect(tacticRepo.luu(sai)).rejects.toSatisfy((loi) =>
      laLoi(loi, 'InvalidTactic'),
    )
  })

  it('ô xếp cầu thủ của đội khác', async () => {
    const doiA = await teamRepo.create({ name: 'Đội A' })
    const doiB = await teamRepo.create({ name: 'Đội B' })
    const cauThuB = await themCauThu(doiB.id, 7)

    const goc = await tacticRepo.layChienThuatDangDung(doiA.id)

    await expect(
      tacticRepo.luu(datCauThuVaoO(goc, O_TRUNG_VE, cauThuB.id)),
    ).rejects.toSatisfy((loi) => laLoi(loi, 'InvalidTactic'))
  })

  it('vai trò không áp dụng được cho vị trí của ô', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)
    const sai = {
      ...goc,
      oVien: goc.oVien.map((o) =>
        o.slotId === O_TRUNG_VE
          ? { ...o, roleId: 'tien-dao-cat-mat' as const }
          : o,
      ),
    }

    await expect(tacticRepo.luu(sai)).rejects.toSatisfy((loi) =>
      laLoi(loi, 'InvalidTactic'),
    )
  })

  it('một cầu thủ bị xếp vào hai ô', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const cauThu = await themCauThu(doi.id, 5)
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)

    const haiO = laySoDo(SO_DO_MAC_DINH)
      .oVien.filter((o) => o.viTri === 'DC')
      .map((o) => o.slotId)
    let sai = datCauThuVaoO(goc, haiO[0], cauThu.id)
    sai = datCauThuVaoO(sai, haiO[1], cauThu.id)

    await expect(tacticRepo.luu(sai)).rejects.toSatisfy((loi) =>
      laLoi(loi, 'InvalidTactic'),
    )
  })

  it('bộ bị từ chối thì bản đang lưu không bị sửa (P3)', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const goc = await tacticRepo.layChienThuatDangDung(doi.id)

    try {
      await tacticRepo.luu({
        ...goc,
        formationId: '4-3-3',
        oVien: goc.oVien.slice(0, 10),
      })
      expect.unreachable('phải ném InvalidTactic')
    } catch (loi) {
      expect(loi).toBeInstanceOf(LoiUngDung)
    }

    const conNguyen = await tacticRepo.layChienThuatDangDung(doi.id)
    expect(conNguyen.formationId).toBe(SO_DO_MAC_DINH)
    expect(conNguyen.oVien).toHaveLength(11)
  })
})

describe('bộ chiến thuật có tên (AC-7.5, AC-7.6)', () => {
  it('luuThanhBo nhân bản bộ đang dùng mà không làm đổi bộ đang dùng', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const dangDung = await tacticRepo.layChienThuatDangDung(doi.id)

    const bo = await tacticRepo.luuThanhBo(doi.id, 'Phòng ngự chắc')

    expect(bo.id).not.toBe(dangDung.id)
    expect(bo.ten).toBe('Phòng ngự chắc')
    expect(bo.formationId).toBe(dangDung.formationId)
    expect(bo.oVien).toEqual(dangDung.oVien)

    const sau = await tacticRepo.layChienThuatDangDung(doi.id)
    expect(sau.id).toBe(dangDung.id)
    expect(sau.ten).toBeNull()
    expect((await teamRepo.get(doi.id)).activeTacticId).toBe(dangDung.id)
  })

  it('tên để trống bị từ chối', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await expect(tacticRepo.luuThanhBo(doi.id, '   ')).rejects.toSatisfy(
      (loi) => laLoi(loi, 'InvalidTactic'),
    )
  })

  it('danhSachBo chỉ trả các bộ có tên', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await tacticRepo.layChienThuatDangDung(doi.id)
    await tacticRepo.luuThanhBo(doi.id, 'Bộ 1')
    await tacticRepo.luuThanhBo(doi.id, 'Bộ 2')

    const danhSach = await tacticRepo.danhSachBo(doi.id)
    expect(danhSach.map((b) => b.ten).sort()).toEqual(['Bộ 1', 'Bộ 2'])

    const db = await moDb()
    expect(await db.count('tactics')).toBe(3)
  })

  it('danhSachBo không trả bộ của đội khác', async () => {
    const doiA = await teamRepo.create({ name: 'Đội A' })
    const doiB = await teamRepo.create({ name: 'Đội B' })
    await tacticRepo.luuThanhBo(doiA.id, 'Của A')
    await tacticRepo.luuThanhBo(doiB.id, 'Của B')

    expect((await tacticRepo.danhSachBo(doiA.id)).map((b) => b.ten)).toEqual([
      'Của A',
    ])
  })

  it('apDungBo đổi activeTacticId sang bộ được chọn', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    const dangDung = await tacticRepo.layChienThuatDangDung(doi.id)
    const bo = await tacticRepo.luuThanhBo(doi.id, 'Tấn công')

    await tacticRepo.apDungBo(doi.id, bo.id)

    expect((await teamRepo.get(doi.id)).activeTacticId).toBe(bo.id)
    const sau = await tacticRepo.layChienThuatDangDung(doi.id)
    expect(sau.id).toBe(bo.id)
    expect(sau.ten).toBe('Tấn công')

    // Bộ không tên ban đầu vẫn còn trong database, chỉ thôi được trỏ tới.
    const db = await moDb()
    expect(await db.get('tactics', dangDung.id)).toBeTruthy()
  })

  it('không áp dụng được bộ của đội khác', async () => {
    const doiA = await teamRepo.create({ name: 'Đội A' })
    const doiB = await teamRepo.create({ name: 'Đội B' })
    const boB = await tacticRepo.luuThanhBo(doiB.id, 'Của B')

    await expect(tacticRepo.apDungBo(doiA.id, boB.id)).rejects.toSatisfy(
      (loi) => laLoi(loi, 'InvalidTactic'),
    )
    expect((await teamRepo.get(doiA.id)).activeTacticId).not.toBe(boB.id)
  })

  it('bộ không tồn tại thì NotFound', async () => {
    const doi = await teamRepo.create({ name: 'Đội A' })
    await expect(
      tacticRepo.apDungBo(doi.id, 'khong-co-bo-nay'),
    ).rejects.toSatisfy((loi) => laLoi(loi, 'NotFound'))
  })
})
