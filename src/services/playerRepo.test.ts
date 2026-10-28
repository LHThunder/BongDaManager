import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { ATTRIBUTES, GK_CHI_SO_CHUNG } from '../domain/attributes'
import type {
  AttributeValues,
  GkAttributeValues,
  PositionId,
} from '../domain/types'
import { laySoDo } from '../domain/formations'
import { DB_NAME, dongDb, moDb } from '../storage/db'
import * as playerRepo from './playerRepo'
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

let teamId = ''
let teamId2 = ''

beforeEach(async () => {
  await dongDb()
  await xoaDatabase()
  teamId = (await teamRepo.create({ name: 'Đội A' })).id
  teamId2 = (await teamRepo.create({ name: 'Đội B' })).id
})

function chiSoSan(giaTri = 12): AttributeValues {
  const ra: Record<string, number> = {}
  for (const a of ATTRIBUTES) ra[a.id] = giaTri
  return ra as AttributeValues
}

function chiSoThuMonChung(giaTri = 12): AttributeValues {
  const ra: Record<string, number> = {}
  for (const id of GK_CHI_SO_CHUNG) ra[id] = giaTri
  return ra as AttributeValues
}

const CHI_SO_THU_MON_RIENG: GkAttributeValues = {
  'phan-xa': 16,
  'bat-bong': 15,
  'phat-dong': 12,
}

function input(ghiDe: Partial<playerRepo.LuuCauThuInput> = {}) {
  return {
    teamId,
    name: 'Nguyễn Văn A',
    shirtNumber: 5,
    age: 25,
    preferredFoot: 'phai' as const,
    positions: ['DC'] as PositionId[],
    attributes: chiSoSan(),
    gkAttributes: null,
    ...ghiDe,
  }
}

describe('lưu cầu thủ', () => {
  it('thêm mới và đọc lại được', async () => {
    const p = await playerRepo.save(input())
    expect(p.id).toBeTruthy()
    expect(p.name).toBe('Nguyễn Văn A')
    expect(await playerRepo.get(p.id)).toMatchObject({ shirtNumber: 5 })
  })

  it('cắt khoảng trắng ở tên và từ chối tên rỗng', async () => {
    const p = await playerRepo.save(input({ name: '  Trần B  ' }))
    expect(p.name).toBe('Trần B')
    await expect(playerRepo.save(input({ name: '   ' }))).rejects.toMatchObject({
      ma: 'EmptyName',
    })
  })

  it('sửa cầu thủ giữ nguyên createdAt và cập nhật updatedAt', async () => {
    const p = await playerRepo.save(input())
    const sua = await playerRepo.save(input({ id: p.id, name: 'Tên mới' }))
    expect(sua.id).toBe(p.id)
    expect(sua.createdAt).toBe(p.createdAt)
    expect(sua.updatedAt).toBeGreaterThanOrEqual(p.updatedAt)
    expect(sua.name).toBe('Tên mới')
  })

  it('cho lưu hồ sơ còn thiếu chỉ số (AC-2.10)', async () => {
    const p = await playerRepo.save(input({ attributes: { 'toc-do': 14 } }))
    expect(Object.keys(p.attributes)).toEqual(['toc-do'])
  })

  it('cho lưu hồ sơ không có chỉ số nào', async () => {
    const p = await playerRepo.save(input({ attributes: {} }))
    expect(p.attributes).toEqual({})
  })
})

describe('số áo trùng trong cùng đội (AC-2.5)', () => {
  it('chặn khi số áo đã có người khác trong đội dùng', async () => {
    await playerRepo.save(input({ shirtNumber: 7 }))
    await expect(
      playerRepo.save(input({ name: 'Người khác', shirtNumber: 7 })),
    ).rejects.toMatchObject({ ma: 'DuplicateShirtNumber' })
  })

  it('lỗi nêu đúng số áo đang trùng', async () => {
    await playerRepo.save(input({ shirtNumber: 9 }))
    await expect(
      playerRepo.save(input({ name: 'Khác', shirtNumber: 9 })),
    ).rejects.toMatchObject({ chiTiet: { giaTri: 9 } })
  })

  it('cho phép cùng số áo ở hai đội khác nhau', async () => {
    await playerRepo.save(input({ shirtNumber: 10 }))
    const p = await playerRepo.save(
      input({ teamId: teamId2, name: 'Đội khác', shirtNumber: 10 }),
    )
    expect(p.shirtNumber).toBe(10)
  })

  it('sửa chính cầu thủ đó mà giữ nguyên số áo thì không bị chặn', async () => {
    const p = await playerRepo.save(input({ shirtNumber: 4 }))
    const sua = await playerRepo.save(
      input({ id: p.id, shirtNumber: 4, name: 'Vẫn là tôi' }),
    )
    expect(sua.name).toBe('Vẫn là tôi')
  })
})

describe('giá trị chỉ số ngoài khoảng (AC-2.4)', () => {
  it('từ chối giá trị lớn hơn 20', async () => {
    await expect(
      playerRepo.save(input({ attributes: { 'toc-do': 25 } })),
    ).rejects.toMatchObject({ ma: 'InvalidAttributeValue' })
  })

  it('từ chối giá trị nhỏ hơn 1 và số không nguyên', async () => {
    for (const v of [0, -2, 12.5]) {
      await expect(
        playerRepo.save(input({ attributes: { 'toc-do': v } })),
      ).rejects.toMatchObject({ ma: 'InvalidAttributeValue' })
    }
  })

  it('lỗi nêu tên chỉ số bằng tiếng Việt để giao diện chỉ đúng ô', async () => {
    await expect(
      playerRepo.save(input({ attributes: { 'dut-diem': 99 } })),
    ).rejects.toMatchObject({ chiTiet: { truong: 'Dứt điểm' } })
  })

  it('từ chối chỉ số riêng của thủ môn ngoài khoảng', async () => {
    await expect(
      playerRepo.save(
        input({
          positions: ['GK'],
          attributes: chiSoThuMonChung(),
          gkAttributes: { 'phan-xa': 30 },
        }),
      ),
    ).rejects.toMatchObject({ ma: 'InvalidAttributeValue' })
  })
})

describe('tổ hợp vị trí (AC-2.1b)', () => {
  it('chặn lưu thủ môn kiêm vị trí sân dù giao diện đã chặn trước', async () => {
    await expect(
      playerRepo.save(input({ positions: ['GK', 'DC'] })),
    ).rejects.toMatchObject({ ma: 'InvalidPositions' })
  })

  it('chặn lưu khi chưa chọn vị trí nào', async () => {
    await expect(
      playerRepo.save(input({ positions: [] })),
    ).rejects.toMatchObject({ ma: 'InvalidPositions' })
  })

  it('cho lưu nhiều vị trí sân (AC-2.6)', async () => {
    const p = await playerRepo.save(input({ positions: ['DC', 'DM', 'MC'] }))
    expect(p.positions).toEqual(['DC', 'DM', 'MC'])
  })

  it('thủ môn lưu được với 8 chỉ số chung và 3 chỉ số riêng', async () => {
    const p = await playerRepo.save(
      input({
        positions: ['GK'],
        attributes: chiSoThuMonChung(),
        gkAttributes: CHI_SO_THU_MON_RIENG,
      }),
    )
    expect(Object.keys(p.attributes)).toHaveLength(8)
    expect(p.gkAttributes).toEqual(CHI_SO_THU_MON_RIENG)
  })
})

describe('lọc chỉ số theo vị trí (trường hợp biên spec mục 5)', () => {
  it('lưu thủ môn thì bỏ những chỉ số chung không dành cho thủ môn', async () => {
    const p = await playerRepo.save(
      input({
        positions: ['GK'],
        attributes: chiSoSan(), // đủ 15 ô, trong đó có ô không dành cho thủ môn
        gkAttributes: CHI_SO_THU_MON_RIENG,
      }),
    )
    expect(p.attributes['dut-diem']).toBeUndefined()
    expect(p.attributes['tac-bong']).toBeUndefined()
    expect(p.attributes['chuyen-ngan']).toBe(12)
  })

  it('đổi một cầu thủ sân thành thủ môn thì chỉ số không còn dùng bị bỏ', async () => {
    const p = await playerRepo.save(input())
    expect(p.attributes['dut-diem']).toBe(12)

    const sau = await playerRepo.save(
      input({
        id: p.id,
        positions: ['GK'],
        attributes: p.attributes,
        gkAttributes: CHI_SO_THU_MON_RIENG,
      }),
    )
    expect(sau.attributes['dut-diem']).toBeUndefined()
    expect(sau.gkAttributes).toEqual(CHI_SO_THU_MON_RIENG)
  })

  it('lưu cầu thủ sân thì không giữ chỉ số thủ môn', async () => {
    const p = await playerRepo.save(
      input({ positions: ['ST'], gkAttributes: CHI_SO_THU_MON_RIENG }),
    )
    expect(p.gkAttributes).toBeNull()
  })
})

describe('danh sách và xoá cầu thủ (AC-2.7)', () => {
  it('listByTeam chỉ trả cầu thủ của đội đó, sắp theo số áo', async () => {
    await playerRepo.save(input({ name: 'Số 9', shirtNumber: 9 }))
    await playerRepo.save(input({ name: 'Số 2', shirtNumber: 2 }))
    await playerRepo.save(input({ teamId: teamId2, name: 'Đội B', shirtNumber: 1 }))

    const ds = await playerRepo.listByTeam(teamId)
    expect(ds.map((p) => p.shirtNumber)).toEqual([2, 9])
  })

  it('đội chưa có cầu thủ thì trả danh sách rỗng', async () => {
    expect(await playerRepo.listByTeam(teamId)).toEqual([])
  })

  it('xoá cầu thủ thì cầu thủ đó biến mất khỏi danh sách', async () => {
    const p = await playerRepo.save(input())
    await playerRepo.remove(p.id)
    expect(await playerRepo.listByTeam(teamId)).toEqual([])
  })

  it('xoá cầu thủ thì ảnh chân dung của họ cũng bị xoá', async () => {
    const db = await moDb()
    await db.put('images', {
      id: 'anh-1',
      blob: new Blob(['x'], { type: 'image/jpeg' }),
      width: 64,
      height: 64,
      byteSize: 1,
    })
    const p = await playerRepo.save(input({ portraitImageId: 'anh-1' }))

    await playerRepo.remove(p.id)
    expect(await db.get('images', 'anh-1')).toBeUndefined()
  })

  it('xoá cầu thủ không tồn tại báo NotFound', async () => {
    await expect(playerRepo.remove('khong-co')).rejects.toMatchObject({
      ma: 'NotFound',
    })
  })
})

describe('xoá cầu thủ thì ô đội hình của họ thành trống (AC-2.7)', () => {
  /** Hai id ô trung vệ của bộ đang dùng. */
  function oTrungVe(formationId: Parameters<typeof laySoDo>[0]): string[] {
    return laySoDo(formationId)
      .oVien.filter((o) => o.viTri === 'DC')
      .map((o) => o.slotId)
  }

  /** Xếp một cầu thủ vào ô trung vệ đầu tiên của bộ đang dùng. */
  async function xepVaoDoiHinh(doiId: string, playerId: string) {
    const bo = await tacticRepo.layChienThuatDangDung(doiId)
    const slotId = oTrungVe(bo.formationId)[0]
    return tacticRepo.luu({
      ...bo,
      oVien: bo.oVien.map((o) => (o.slotId === slotId ? { ...o, playerId } : o)),
    })
  }

  it('ô trong bộ đang dùng và trong bộ có tên đều thành trống', async () => {
    const cauThu = await playerRepo.save(input({ shirtNumber: 4 }))

    await xepVaoDoiHinh(teamId, cauThu.id)
    await tacticRepo.luuThanhBo(teamId, 'Bộ đã lưu')

    await playerRepo.remove(cauThu.id)

    const db = await moDb()
    const cacBo = await db.getAllFromIndex('tactics', 'byTeam', teamId)
    expect(cacBo).toHaveLength(2)
    for (const bo of cacBo) {
      expect(
        bo.oVien.filter((o) => o.playerId === cauThu.id),
        bo.ten ?? 'bộ đang dùng',
      ).toEqual([])
    }
  })

  it('bộ chiến thuật vẫn nạp lại được, không ném InvalidTactic', async () => {
    const cauThu = await playerRepo.save(input({ shirtNumber: 4 }))
    const bo = await xepVaoDoiHinh(teamId, cauThu.id)

    await playerRepo.remove(cauThu.id)

    const docLai = await tacticRepo.layChienThuatDangDung(teamId)
    expect(docLai.id).toBe(bo.id)
    await expect(tacticRepo.luu(docLai)).resolves.toBeTruthy()
  })

  it('cầu thủ khác trong cùng đội vẫn ở đúng ô của họ', async () => {
    const a = await playerRepo.save(input({ shirtNumber: 4 }))
    const b = await playerRepo.save(input({ shirtNumber: 5 }))

    const bo = await tacticRepo.layChienThuatDangDung(teamId)
    const [o1, o2] = oTrungVe(bo.formationId)
    await tacticRepo.luu({
      ...bo,
      oVien: bo.oVien.map((o) => {
        if (o.slotId === o1) return { ...o, playerId: a.id }
        if (o.slotId === o2) return { ...o, playerId: b.id }
        return o
      }),
    })

    await playerRepo.remove(a.id)

    const docLai = await tacticRepo.layChienThuatDangDung(teamId)
    expect(docLai.oVien.find((o) => o.slotId === o2)?.playerId).toBe(b.id)
    expect(docLai.oVien.find((o) => o.slotId === o1)?.playerId).toBeNull()
  })

  it('không chạm chiến thuật của đội khác', async () => {
    const cuaA = await playerRepo.save(input({ shirtNumber: 4 }))
    await xepVaoDoiHinh(teamId, cuaA.id)
    const boB = await tacticRepo.layChienThuatDangDung(teamId2)

    await playerRepo.remove(cuaA.id)

    const db = await moDb()
    expect(await db.get('tactics', boB.id)).toEqual(boB)
  })

  it('cầu thủ không nằm trong đội hình nào thì không bộ nào bị ghi lại', async () => {
    const cauThu = await playerRepo.save(input({ shirtNumber: 9 }))
    const bo = await tacticRepo.layChienThuatDangDung(teamId)

    await playerRepo.remove(cauThu.id)

    const db = await moDb()
    expect(await db.get('tactics', bo.id)).toEqual(bo)
  })
})
