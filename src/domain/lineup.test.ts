import { describe, expect, it } from 'vitest'
import { ATTRIBUTES, GK_ATTRIBUTES, GK_CHI_SO_CHUNG } from './attributes'
import { laySoDo, type FormationId } from './formations'
import {
  tinhTrangDoiHinh,
  xepLaiKhiDoiSoDo,
  type CauThuDeKiem,
  type CauThuDeXep,
  type OTrongDoiHinh,
} from './lineup'
import { MUC_TRU_HIEU_SUAT, mucSaiViTri } from './misplacement'
import type {
  AttributeValues,
  GkAttributeValues,
  PositionId,
} from './types'

const NGUON_SOURCE = import.meta.glob('./lineup.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function ct(id: string, ...positions: PositionId[]): CauThuDeXep {
  return { id, positions }
}

/** Đội hình xuất phát của một sơ đồ: ô thứ i nhận cầu thủ thứ i. */
function xepTheoSoDo(
  soDo: FormationId,
  cacCauThu: readonly CauThuDeXep[],
): OTrongDoiHinh[] {
  return laySoDo(soDo).oVien.map((o, i) => ({
    slotId: o.slotId,
    playerId: cacCauThu[i]?.id ?? null,
  }))
}

/** 11 cầu thủ khớp đúng từng ô của một sơ đồ. */
function doiHinhKhop(soDo: FormationId): CauThuDeXep[] {
  return laySoDo(soDo).oVien.map((o, i) => ct(`p${i + 1}`, o.viTri))
}

function tongChiPhi(
  soDo: FormationId,
  oVien: readonly OTrongDoiHinh[],
  cacCauThu: readonly CauThuDeXep[],
): number {
  const theoId = new Map(cacCauThu.map((c) => [c.id, c]))
  const theoSlot = new Map(oVien.map((o) => [o.slotId, o.playerId]))
  return laySoDo(soDo).oVien.reduce((tong, o) => {
    const id = theoSlot.get(o.slotId)
    if (!id) return tong
    const cauThu = theoId.get(id)
    if (!cauThu) return tong
    return tong + MUC_TRU_HIEU_SUAT[mucSaiViTri(o.viTri, cauThu.positions)]
  }, 0)
}

describe('xếp lại người khi đổi sơ đồ — không mất ai (AC-5.8)', () => {
  const CAC_CAP: [FormationId, FormationId][] = [
    ['4-4-2', '4-3-3'],
    ['4-4-2', '3-5-2'],
    ['4-3-3', '5-3-2'],
    ['3-4-3', '4-2-3-1'],
    ['5-3-2', '4-1-4-1'],
    ['4-4-1-1', '3-4-3'],
  ]

  it('người trên sân cộng người bị đẩy ra luôn đúng bằng người ban đầu', () => {
    for (const [cu, moi] of CAC_CAP) {
      const cacCauThu = doiHinhKhop(cu)
      const ketQua = xepLaiKhiDoiSoDo(moi, xepTheoSoDo(cu, cacCauThu), cacCauThu)

      const trenSan = ketQua.oVien
        .map((o) => o.playerId)
        .filter((id): id is string => id !== null)

      expect(new Set([...trenSan, ...ketQua.nguoiBiDayRa]), `${cu}→${moi}`)
        .toEqual(new Set(cacCauThu.map((c) => c.id)))
    }
  })

  it('không ai bị xếp vào hai ô cùng lúc', () => {
    for (const [cu, moi] of CAC_CAP) {
      const cacCauThu = doiHinhKhop(cu)
      const ketQua = xepLaiKhiDoiSoDo(moi, xepTheoSoDo(cu, cacCauThu), cacCauThu)
      const trenSan = ketQua.oVien
        .map((o) => o.playerId)
        .filter((id): id is string => id !== null)
      expect(new Set(trenSan).size, `${cu}→${moi}`).toBe(trenSan.length)
    }
  })

  it('kết quả luôn có đúng số ô của sơ đồ mới', () => {
    for (const [cu, moi] of CAC_CAP) {
      const cacCauThu = doiHinhKhop(cu)
      const ketQua = xepLaiKhiDoiSoDo(moi, xepTheoSoDo(cu, cacCauThu), cacCauThu)
      expect(ketQua.oVien.map((o) => o.slotId)).toEqual(
        laySoDo(moi).oVien.map((o) => o.slotId),
      )
    }
  })

  it('đổi 4-4-2 sang 4-3-3 thì trung vệ vẫn ở ô trung vệ', () => {
    const cacCauThu = doiHinhKhop('4-4-2')
    const ketQua = xepLaiKhiDoiSoDo(
      '4-3-3',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    const theoSlot = new Map(ketQua.oVien.map((o) => [o.slotId, o.playerId]))
    const oTrungVe = laySoDo('4-3-3').oVien.filter((o) => o.viTri === 'DC')
    const idTrungVeCu = new Set(
      doiHinhKhop('4-4-2')
        .filter((c) => c.positions[0] === 'DC')
        .map((c) => c.id),
    )

    expect(oTrungVe).toHaveLength(2)
    for (const o of oTrungVe) {
      expect(idTrungVeCu.has(theoSlot.get(o.slotId) ?? ''), o.slotId).toBe(true)
    }
  })

  it('thủ môn vẫn ở khung thành sau khi đổi sơ đồ', () => {
    const cacCauThu = doiHinhKhop('4-4-2')
    const ketQua = xepLaiKhiDoiSoDo(
      '3-5-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )
    const oThuMon = laySoDo('3-5-2').oVien.find((o) => o.viTri === 'GK')
    const trongKhung = ketQua.oVien.find((o) => o.slotId === oThuMon?.slotId)
    expect(trongKhung?.playerId).toBe('p1')
  })
})

/*
  Sơ đồ mới ít ô ở một tuyến thì chuyện xảy ra là ai đó bị XẾP SAI VỊ TRÍ, chứ
  chưa tới mức bị đẩy ra: hai sơ đồ đều có 11 ô, và mức `vua` (lệch một tuyến)
  vẫn xếp được. Bị đẩy ra chỉ xảy ra khi mọi ô còn lại đều là mức `nang` —
  xem phần đầu `lineup.ts`.
*/
describe('tuyến bị hụt ô, và người bị đẩy ra (AC-5.8)', () => {
  it('4-4-2 sang 3-5-2 hụt một ô phòng ngự: có người bị xếp sai, không ai bị đẩy ra', () => {
    const cacCauThu = doiHinhKhop('4-4-2')
    const ketQua = xepLaiKhiDoiSoDo(
      '3-5-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    expect(ketQua.nguoiBiDayRa).toEqual([])
    expect(ketQua.nguoiXepSai.length).toBeGreaterThan(0)
    for (const sai of ketQua.nguoiXepSai) {
      expect(sai.mucSai).not.toBe('dung')
      expect(sai.mucSai).not.toBe('nang')
    }
  })

  it('đội hình có hai thủ môn thì một người bị đẩy ra và được nêu tên', () => {
    const cacCauThu = [
      ct('gk1', 'GK'),
      ct('gk2', 'GK'),
      ct('dc1', 'DC'),
      ct('dc2', 'DC'),
    ]
    const ketQua = xepLaiKhiDoiSoDo(
      '4-4-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    expect(ketQua.nguoiBiDayRa).toEqual(['gk2'])

    const trenSan = ketQua.oVien
      .map((o) => o.playerId)
      .filter((id): id is string => id !== null)
    expect(trenSan.sort()).toEqual(['dc1', 'dc2', 'gk1'])
  })

  it('không xếp cầu thủ sân vào khung thành, dù khung đang trống', () => {
    const cacCauThu = [ct('dc1', 'DC'), ct('st1', 'ST')]
    const ketQua = xepLaiKhiDoiSoDo(
      '4-4-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    const oThuMon = laySoDo('4-4-2').oVien.find((o) => o.viTri === 'GK')
    const trongKhung = ketQua.oVien.find((o) => o.slotId === oThuMon?.slotId)
    expect(trongKhung?.playerId).toBeNull()
    expect(ketQua.nguoiBiDayRa).toEqual([])
  })

  it('ô trỏ tới cầu thủ không còn tồn tại thì bị bỏ qua, không ném lỗi', () => {
    const cacCauThu = [ct('dc1', 'DC')]
    const oVienCu: OTrongDoiHinh[] = [
      { slotId: 'o1', playerId: 'khong-con-nguoi-nay' },
      { slotId: 'o3', playerId: 'dc1' },
    ]
    const ketQua = xepLaiKhiDoiSoDo('4-4-2', oVienCu, cacCauThu)

    const trenSan = ketQua.oVien
      .map((o) => o.playerId)
      .filter((id): id is string => id !== null)
    expect(trenSan).toEqual(['dc1'])
    expect(ketQua.nguoiBiDayRa).toEqual([])
  })
})

describe('tất định, không dùng nguồn ngẫu nhiên (P1)', () => {
  it('gọi hai lần với cùng đầu vào cho ra kết quả giống hệt', () => {
    const cacCauThu = doiHinhKhop('4-4-2')
    const oVienCu = xepTheoSoDo('4-4-2', cacCauThu)

    const a = xepLaiKhiDoiSoDo('4-2-3-1', oVienCu, cacCauThu)
    const b = xepLaiKhiDoiSoDo('4-2-3-1', oVienCu, cacCauThu)
    expect(a).toEqual(b)
  })

  it('không gọi Math.random, Date.now hay crypto bên trong', () => {
    const source = Object.values(NGUON_SOURCE)[0]
    expect(source, 'không đọc được source của lineup.ts').toBeTruthy()

    const chiCode = (source ?? '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    expect(chiCode).not.toContain('Math.random')
    expect(chiCode).not.toContain('Date.now')
    expect(chiCode).not.toContain('crypto.getRandomValues')
  })
})

/*
  Quyết định D14: lượt tham lam đi theo thứ tự ô, nên nó có thể trao ô đầu cho
  một cầu thủ đa năng và để lại cầu thủ chuyên biệt không còn ô đúng. Đây là
  tình huống cụ thể mà lượt đổi cặp cứu được — nếu bỏ lượt đó thì test này đỏ.
*/
describe('lượt đổi cặp cải thiện được so với tham lam thuần (D14)', () => {
  const DA_NANG = ct('da-nang', 'DC', 'MC')
  const CHUYEN_BIET = ct('chuyen-biet', 'DC')
  const CAC_CAU_THU = [DA_NANG, CHUYEN_BIET]
  const O_VIEN_CU: OTrongDoiHinh[] = [
    { slotId: 'o3', playerId: DA_NANG.id },
    { slotId: 'o4', playerId: CHUYEN_BIET.id },
  ]

  it('không ai còn ngồi ô hậu vệ trái mà tham lam đã trao sai', () => {
    const ketQua = xepLaiKhiDoiSoDo('4-4-2', O_VIEN_CU, CAC_CAU_THU)
    const theoSlot = new Map(ketQua.oVien.map((o) => [o.slotId, o.playerId]))

    /*
      Lượt tham lam đi tới ô o2 (hậu vệ trái) trước ô trung vệ, thấy cả hai
      cầu thủ đều ở mức `nhe` nên trao o2 cho người đứng trước — 'da-nang'.
      Lượt đổi cặp phát hiện chuyển 'da-nang' sang một ô trung vệ còn trống
      thì rẻ hơn, nên o2 phải trống lại. Bỏ lượt đổi cặp là test này đỏ.
    */
    expect(theoSlot.get('o2')).toBeNull()
    expect(theoSlot.get('o3')).toBe('chuyen-biet')
    expect(theoSlot.get('o4')).toBe('da-nang')
  })

  it('không còn ai bị xếp sai, tổng mức trừ hiệu suất bằng 0', () => {
    const ketQua = xepLaiKhiDoiSoDo('4-4-2', O_VIEN_CU, CAC_CAU_THU)
    expect(ketQua.nguoiXepSai).toEqual([])
    expect(tongChiPhi('4-4-2', ketQua.oVien, CAC_CAU_THU)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Tình trạng đội hình (AC-5.7)
// ---------------------------------------------------------------------------

function chiSoDay(): AttributeValues {
  const attributes: Record<string, number> = {}
  for (const a of ATTRIBUTES) {
    attributes[a.id] = 12
  }
  return attributes as AttributeValues
}

function chiSoThuMonDay(): { attributes: AttributeValues; gk: GkAttributeValues } {
  const attributes: Record<string, number> = {}
  for (const id of GK_CHI_SO_CHUNG) {
    attributes[id] = 12
  }
  const gk: Record<string, number> = {}
  for (const a of GK_ATTRIBUTES) {
    gk[a.id] = 12
  }
  return {
    attributes: attributes as AttributeValues,
    gk: gk as GkAttributeValues,
  }
}

function kiem(id: string, viTri: PositionId, hoanTat = true): CauThuDeKiem {
  if (viTri === 'GK') {
    const { attributes, gk } = chiSoThuMonDay()
    const thieu = { ...gk }
    if (!hoanTat) {
      delete thieu['phan-xa']
    }
    return { id, positions: ['GK'], attributes, gkAttributes: thieu }
  }

  const attributes = { ...chiSoDay() }
  if (!hoanTat) {
    delete attributes['dut-diem']
  }
  return { id, positions: [viTri], attributes, gkAttributes: null }
}

function doiHinhDuDieuKien(soDo: FormationId): {
  oVien: OTrongDoiHinh[]
  cacCauThu: CauThuDeKiem[]
} {
  const cacCauThu = laySoDo(soDo).oVien.map((o, i) =>
    kiem(`p${i + 1}`, o.viTri),
  )
  return { oVien: xepTheoSoDo(soDo, cacCauThu), cacCauThu }
}

describe('tình trạng đội hình (AC-5.7)', () => {
  it('đội hình đủ 11 người, có thủ môn, hồ sơ đủ thì đủ điều kiện', () => {
    const { oVien, cacCauThu } = doiHinhDuDieuKien('4-4-2')
    const tinhTrang = tinhTrangDoiHinh('4-4-2', oVien, cacCauThu)

    expect(tinhTrang.duDieuKien).toBe(true)
    expect(tinhTrang.cacLyDo).toEqual([])
  })

  it('thiếu người thì nêu lý do thiếu người kèm số ô đã có người', () => {
    const { oVien, cacCauThu } = doiHinhDuDieuKien('4-4-2')
    const thieu = oVien.map((o, i) =>
      i >= 9 ? { slotId: o.slotId, playerId: null } : o,
    )

    const tinhTrang = tinhTrangDoiHinh('4-4-2', thieu, cacCauThu)
    expect(tinhTrang.duDieuKien).toBe(false)
    expect(tinhTrang.cacLyDo).toContainEqual({
      loai: 'thieu-nguoi',
      soONhanNguoi: 9,
    })
  })

  it('ô thủ môn trống thì nêu lý do thiếu thủ môn', () => {
    const { oVien, cacCauThu } = doiHinhDuDieuKien('4-4-2')
    const khongThuMon = oVien.map((o, i) =>
      i === 0 ? { slotId: o.slotId, playerId: null } : o,
    )

    const tinhTrang = tinhTrangDoiHinh('4-4-2', khongThuMon, cacCauThu)
    expect(tinhTrang.cacLyDo).toContainEqual({ loai: 'thieu-thu-mon' })
  })

  it('cầu thủ sân đứng khung thành cũng tính là thiếu thủ môn', () => {
    const cacCauThu = laySoDo('4-4-2').oVien.map((o, i) =>
      kiem(`p${i + 1}`, i === 0 ? 'DC' : o.viTri),
    )
    const tinhTrang = tinhTrangDoiHinh(
      '4-4-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    expect(tinhTrang.duDieuKien).toBe(false)
    expect(tinhTrang.cacLyDo).toContainEqual({ loai: 'thieu-thu-mon' })
  })

  it('có cầu thủ hồ sơ chưa hoàn tất thì nêu tên đúng người đó', () => {
    const cacCauThu = laySoDo('4-4-2').oVien.map((o, i) =>
      kiem(`p${i + 1}`, o.viTri, i !== 10),
    )
    const tinhTrang = tinhTrangDoiHinh(
      '4-4-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    expect(tinhTrang.duDieuKien).toBe(false)
    expect(tinhTrang.cacLyDo).toContainEqual({
      loai: 'ho-so-chua-hoan-tat',
      cacPlayerId: ['p11'],
    })
  })

  it('thủ môn thiếu chỉ số thủ môn cũng bị nêu', () => {
    const cacCauThu = laySoDo('4-4-2').oVien.map((o, i) =>
      kiem(`p${i + 1}`, o.viTri, i !== 0),
    )
    const tinhTrang = tinhTrangDoiHinh(
      '4-4-2',
      xepTheoSoDo('4-4-2', cacCauThu),
      cacCauThu,
    )

    expect(tinhTrang.cacLyDo).toContainEqual({
      loai: 'ho-so-chua-hoan-tat',
      cacPlayerId: ['p1'],
    })
  })

  it('nêu đủ cả ba lý do cùng lúc, không dừng ở lý do đầu', () => {
    const cacCauThu = laySoDo('4-4-2').oVien.map((o, i) =>
      kiem(`p${i + 1}`, o.viTri, i !== 5),
    )
    const oVien = xepTheoSoDo('4-4-2', cacCauThu).map((o, i) =>
      i === 0 || i === 10 ? { slotId: o.slotId, playerId: null } : o,
    )

    const tinhTrang = tinhTrangDoiHinh('4-4-2', oVien, cacCauThu)
    const cacLoai = tinhTrang.cacLyDo.map((l) => l.loai)

    expect(cacLoai).toContain('thieu-nguoi')
    expect(cacLoai).toContain('thieu-thu-mon')
    expect(cacLoai).toContain('ho-so-chua-hoan-tat')
  })
})
