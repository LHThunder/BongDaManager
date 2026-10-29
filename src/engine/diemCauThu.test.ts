import { describe, expect, it } from 'vitest'
import type { PositionId } from '../domain/types'
import {
  chamDiem,
  DIEM_NEN,
  DIEM_TOI_DA,
  DIEM_TOI_THIEU,
  tiLeChuyen,
} from './diemCauThu'
import { THONG_KE_CAU_THU_RONG, type ThongKeCauThu } from './tran'

/*
  Chấm điểm cầu thủ (AC-11.3, quyết định D49).

  Bốn phép mà `plan.md` mục IV.6 đòi, cộng một phép thứ năm: tổng bảng thành
  phần phải bằng ĐÚNG điểm cuối. Phép đó là thứ bắt được lỗi khó thấy nhất —
  kẹp điểm âm thầm. Một người đáng 11,2 điểm hiện ra 10 với bảng cộng lại
  thành 11,2 thì bảng đang nói dối, dù con số điểm trông vẫn hợp lý.
*/

function tk(phan: Partial<ThongKeCauThu> = {}): ThongKeCauThu {
  return { ...THONG_KE_CAU_THU_RONG, ...phan }
}

/** Tổng phần cộng/trừ của bảng thành phần. */
function tongThanhPhan(viTri: PositionId, t: ThongKeCauThu): number {
  const kq = chamDiem(t, viTri)
  return Math.round((DIEM_NEN + sum(kq)) * 10) / 10
}

function sum(kq: ReturnType<typeof chamDiem>): number {
  return kq.cacThanhPhan.reduce((s, x) => s + x.diemCong, 0)
}

describe('điểm nền và dải 1–10 (AC-11.3)', () => {
  it('mọi số liệu bằng 0 thì đúng 6.0 và bảng rỗng', () => {
    for (const viTri of ['GK', 'DC', 'MC', 'ST'] as PositionId[]) {
      const kq = chamDiem(tk(), viTri)
      expect(kq.diem, viTri).toBe(DIEM_NEN)
      expect(kq.cacThanhPhan, viTri).toHaveLength(0)
    }
  })

  it('số liệu cực đoan vẫn cho điểm trong 1–10', () => {
    const cucTot = tk({
      banThang: 9,
      kienTao: 7,
      sutTrungDich: 20,
      cuopBong: 40,
      canCuu: 30,
      chuyenThanhCong: 200,
      chuyenHong: 0,
    })
    const cucTe = tk({
      matBong: 60,
      phamLoi: 25,
      chuyenThanhCong: 1,
      chuyenHong: 99,
    })

    for (const viTri of ['GK', 'DC', 'MC', 'ST'] as PositionId[]) {
      for (const t of [cucTot, cucTe]) {
        const { diem } = chamDiem(t, viTri)
        expect(diem, viTri).toBeGreaterThanOrEqual(DIEM_TOI_THIEU)
        expect(diem, viTri).toBeLessThanOrEqual(DIEM_TOI_DA)
      }
    }
  })
})

describe('bảng thành phần giải thích đúng con số (AC-11.3)', () => {
  it('tổng các thành phần cộng với điểm nền bằng đúng điểm cuối', () => {
    const cacMau: readonly ThongKeCauThu[] = [
      tk(),
      tk({ banThang: 1, sutTrungDich: 2, chuyenThanhCong: 30, chuyenHong: 5 }),
      tk({ kienTao: 2, cuopBong: 6, matBong: 4, phamLoi: 1 }),
      tk({ canCuu: 5, chuyenThanhCong: 12, chuyenHong: 9 }),
      // Hai mẫu dưới đây CHẮC CHẮN bị kẹp, để kiểm luôn hai khoá kẹp điểm.
      tk({ banThang: 9, kienTao: 7, cuopBong: 40, canCuu: 30 }),
      tk({ matBong: 60, phamLoi: 25, chuyenThanhCong: 1, chuyenHong: 99 }),
    ]

    for (const viTri of ['GK', 'DL', 'DC', 'DM', 'MC', 'AM', 'ST'] as PositionId[]) {
      for (const [i, t] of cacMau.entries()) {
        const kq = chamDiem(t, viTri)
        expect(tongThanhPhan(viTri, t), `${viTri}/mẫu ${i}`).toBe(kq.diem)
      }
    }
  })

  it('mỗi thành phần mang số liệu thật, không chỉ mang điểm', () => {
    const kq = chamDiem(tk({ banThang: 2, cuopBong: 5 }), 'DC')
    const ban = kq.cacThanhPhan.find((x) => x.tieuChi === 'ban-thang')
    const cuop = kq.cacThanhPhan.find((x) => x.tieuChi === 'cuop-bong')

    expect(ban?.soLieu).toBe(2)
    expect(cuop?.soLieu).toBe(5)
  })

  it('phần bị kẹp được ghi thành một thành phần riêng', () => {
    const kq = chamDiem(tk({ banThang: 9, kienTao: 7, cuopBong: 40 }), 'DC')
    expect(kq.diem).toBe(DIEM_TOI_DA)
    expect(kq.cacThanhPhan.some((x) => x.tieuChi === 'tran-diem')).toBe(true)
  })

  it('tỉ lệ chuyền hiện ra dạng phần trăm', () => {
    const kq = chamDiem(tk({ chuyenThanhCong: 9, chuyenHong: 1 }), 'MC')
    const chuyen = kq.cacThanhPhan.find((x) => x.tieuChi === 'ti-le-chuyen')
    expect(chuyen?.soLieu).toBe(90)
    expect(chuyen?.diemCong).toBeGreaterThan(0)
  })

  it('chuyền kém mức nền thì bị trừ', () => {
    const kq = chamDiem(tk({ chuyenThanhCong: 5, chuyenHong: 5 }), 'MC')
    const chuyen = kq.cacThanhPhan.find((x) => x.tieuChi === 'ti-le-chuyen')
    expect(chuyen?.diemCong).toBeLessThan(0)
  })
})

describe('cùng số liệu, khác vị trí thì khác điểm (AC-11.3)', () => {
  /*
    Đây là phần "các tiêu chí được cân theo vị trí cầu thủ đã đá" của AC.
    `viTriDaDa` là vị trí của Ô, không phải sở trường: một tiền đạo bị xếp làm
    trung vệ được chấm theo thước của trung vệ, vì đó là việc họ đã phải làm.
  */
  it('một bàn thắng của trung vệ đáng hơn một bàn của tiền đạo', () => {
    const motBan = tk({ banThang: 1 })
    expect(chamDiem(motBan, 'DC').diem).toBeGreaterThan(
      chamDiem(motBan, 'ST').diem,
    )
  })

  it('cướp bóng được chấm nặng hơn ở hàng phòng ngự', () => {
    const cuop = tk({ cuopBong: 10 })
    expect(chamDiem(cuop, 'DC').diem).toBeGreaterThan(
      chamDiem(cuop, 'ST').diem,
    )
  })

  it('đường chuyền chính xác được chấm nặng nhất ở tuyến giữa', () => {
    const chuyen = tk({ chuyenThanhCong: 95, chuyenHong: 5 })
    const giua = chamDiem(chuyen, 'MC').diem
    expect(giua).toBeGreaterThan(chamDiem(chuyen, 'ST').diem)
    expect(giua).toBeGreaterThan(chamDiem(chuyen, 'DC').diem)
  })

  it('bốn tuyến cho bốn con số khác nhau với cùng bộ số liệu', () => {
    const t = tk({
      banThang: 1,
      kienTao: 1,
      sutTrungDich: 2,
      cuopBong: 4,
      matBong: 3,
      phamLoi: 1,
      chuyenThanhCong: 40,
      chuyenHong: 6,
    })
    const diem = (['GK', 'DC', 'MC', 'ST'] as PositionId[]).map(
      (v) => chamDiem(t, v).diem,
    )
    expect(new Set(diem).size).toBeGreaterThan(1)
  })

  it('chỉ thủ môn được cộng điểm cứu thua', () => {
    const cuu = tk({ canCuu: 6 })
    expect(chamDiem(cuu, 'GK').diem).toBeGreaterThan(DIEM_NEN)
    for (const viTri of ['DC', 'MC', 'ST'] as PositionId[]) {
      expect(chamDiem(cuu, viTri).diem, viTri).toBe(DIEM_NEN)
    }
  })
})

describe('tỉ lệ chuyền', () => {
  it('chưa chuyền quả nào thì không xác định, và không cộng không trừ', () => {
    expect(tiLeChuyen(tk())).toBeNull()
    const kq = chamDiem(tk(), 'MC')
    expect(kq.cacThanhPhan.some((x) => x.tieuChi === 'ti-le-chuyen')).toBe(
      false,
    )
  })

  it('tính đúng tỉ lệ', () => {
    expect(tiLeChuyen(tk({ chuyenThanhCong: 3, chuyenHong: 1 }))).toBe(0.75)
  })
})
