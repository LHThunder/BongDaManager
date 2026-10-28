import { describe, expect, it } from 'vitest'
import { ATTRIBUTES } from '../domain/attributes'
import type { AttributeValues, PositionId } from '../domain/types'
import {
  heSoSanNha,
  heSoTheLuc,
  LOI_THE_SAN_NHA,
  nenTheoVaiTro,
  sucManhCauThu,
  type BoiCanhSucManh,
  type HoSoCauThu,
} from './sucManh'
import { NGUONG_KIET_SUC, THE_LUC_DAY } from './theLuc'

function chiSo(giaTri: number): AttributeValues {
  const ra: Record<string, number> = {}
  for (const a of ATTRIBUTES) ra[a.id] = giaTri
  return ra as AttributeValues
}

function cauThu(
  positions: readonly PositionId[],
  giaTri = 12,
  ghiDe: AttributeValues = {},
): HoSoCauThu {
  return {
    id: 'ct',
    positions,
    attributes: { ...chiSo(giaTri), ...ghiDe },
    gkAttributes: null,
  }
}

function boiCanh(ghiDe: Partial<BoiCanhSucManh> = {}): BoiCanhSucManh {
  return {
    viTriO: 'ST',
    roleId: 'tien-dao-cat-mat',
    theLuc: THE_LUC_DAY,
    laChuNha: false,
    sanTrungLap: false,
    ...ghiDe,
  }
}

describe('nền sức mạnh tính theo VAI TRÒ (quyết định D25)', () => {
  it('cùng một cầu thủ ở hai vai trò khác nhau ra hai số khác nhau', () => {
    // Tiền đạo mục tiêu cần Không chiến + Sức mạnh; tiền đạo cắt mặt cần
    // Dứt điểm + Tốc độ. Cầu thủ này khoẻ nhưng chậm.
    const khoeMaCham = cauThu(['ST'], 10, {
      'khong-chien': 18,
      'suc-manh': 18,
      'dut-diem': 6,
      'toc-do': 4,
    })

    const mucTieu = nenTheoVaiTro(khoeMaCham, 'tien-dao-muc-tieu')
    const catMat = nenTheoVaiTro(khoeMaCham, 'tien-dao-cat-mat')

    expect(mucTieu).toBeGreaterThan(catMat)
  })

  it('nền nằm trong 0..1, chỉ số thấp nhất ra 0 và cao nhất ra 1', () => {
    expect(nenTheoVaiTro(cauThu(['ST'], 1), 'tien-dao-cat-mat')).toBeCloseTo(0)
    expect(nenTheoVaiTro(cauThu(['ST'], 20), 'tien-dao-cat-mat')).toBeCloseTo(1)
  })

  it('chỉ số chưa điền thì tính như mức thấp nhất, không ném lỗi', () => {
    const thieu: HoSoCauThu = {
      id: 'x',
      positions: ['ST'],
      attributes: {},
      gkAttributes: null,
    }
    expect(() => nenTheoVaiTro(thieu, 'tien-dao-cat-mat')).not.toThrow()
    expect(nenTheoVaiTro(thieu, 'tien-dao-cat-mat')).toBeCloseTo(0)
  })

  it('vai trò thủ môn đọc được chỉ số riêng của thủ môn', () => {
    const thuMon: HoSoCauThu = {
      id: 'tm',
      positions: ['GK'],
      attributes: chiSo(10),
      gkAttributes: { 'phan-xa': 20, 'bat-bong': 20, 'phat-dong': 20 },
    }
    const kem: HoSoCauThu = {
      ...thuMon,
      gkAttributes: { 'phan-xa': 2, 'bat-bong': 2, 'phat-dong': 2 },
    }
    expect(nenTheoVaiTro(thuMon, 'thu-mon-truyen-thong')).toBeGreaterThan(
      nenTheoVaiTro(kem, 'thu-mon-truyen-thong'),
    )
  })
})

describe('trừ theo mức sai vị trí (AC-8.5, dùng lại bảng của AC-5.5)', () => {
  it('bốn mức sai cho bốn số giảm dần nghiêm ngặt', () => {
    const nguoi = (viTri: PositionId) => cauThu([viTri], 15)

    // Ô là tiền đạo. Đúng vị trí / lệch bên cùng tuyến / lệch một tuyến /
    // lệch hai tuyến.
    const dung = sucManhCauThu(nguoi('ST'), boiCanh({ viTriO: 'ST' }))
    const nhe = sucManhCauThu(nguoi('AML'), boiCanh({ viTriO: 'AMR' }))
    const vua = sucManhCauThu(nguoi('MC'), boiCanh({ viTriO: 'ST' }))
    const nang = sucManhCauThu(nguoi('DC'), boiCanh({ viTriO: 'ST' }))

    expect(dung).toBeGreaterThan(nhe)
    expect(nhe).toBeGreaterThan(vua)
    expect(vua).toBeGreaterThan(nang)
  })

  it('cùng cầu thủ, chỉ đổi ô, thì chênh lệch đúng bằng bảng mức trừ', () => {
    const nguoi = cauThu(['ST'], 15)
    const dung = sucManhCauThu(nguoi, boiCanh({ viTriO: 'ST' }))
    const nang = sucManhCauThu(nguoi, boiCanh({ viTriO: 'DC' }))
    // Sai nặng trừ 45% theo MUC_TRU_HIEU_SUAT.
    expect(nang / dung).toBeCloseTo(0.55, 5)
  })
})

describe('hệ số thể lực', () => {
  it('thể lực đầy cho hệ số 1', () => {
    expect(heSoTheLuc(THE_LUC_DAY)).toBeCloseTo(1)
  })

  it('thể lực càng thấp hệ số càng nhỏ', () => {
    expect(heSoTheLuc(90)).toBeLessThan(heSoTheLuc(THE_LUC_DAY))
    expect(heSoTheLuc(60)).toBeLessThan(heSoTheLuc(90))
  })

  it('qua ngưỡng kiệt sức thì tụt thêm một bậc rõ rệt (AC-8.7)', () => {
    const vuaDu = heSoTheLuc(NGUONG_KIET_SUC)
    const vuaThieu = heSoTheLuc(NGUONG_KIET_SUC - 1)
    // Không chỉ giảm đều: phải có một bước hụt khi qua ngưỡng.
    expect(vuaDu - vuaThieu).toBeGreaterThan(0.1)
  })

  it('thể lực ngoài khoảng bị kẹp lại', () => {
    expect(heSoTheLuc(999)).toBeCloseTo(heSoTheLuc(THE_LUC_DAY))
    expect(heSoTheLuc(-10)).toBe(heSoTheLuc(0))
  })
})

describe('lợi thế sân nhà (AC-8.14, quyết định D29)', () => {
  it('chỉ áp cho đội chủ nhà', () => {
    expect(heSoSanNha(true, false)).toBe(LOI_THE_SAN_NHA)
    expect(heSoSanNha(false, false)).toBe(1)
  })

  it('sân trung lập thì bằng đúng 1 cho cả hai đội', () => {
    expect(heSoSanNha(true, true)).toBe(1)
    expect(heSoSanNha(false, true)).toBe(1)
  })

  it('cùng cầu thủ, đá sân nhà mạnh hơn đá sân khách', () => {
    const nguoi = cauThu(['ST'], 14)
    const nha = sucManhCauThu(nguoi, boiCanh({ laChuNha: true }))
    const khach = sucManhCauThu(nguoi, boiCanh({ laChuNha: false }))
    expect(nha).toBeGreaterThan(khach)
  })

  it('bật sân trung lập thì lợi thế biến mất hoàn toàn', () => {
    const nguoi = cauThu(['ST'], 14)
    const nha = sucManhCauThu(
      nguoi,
      boiCanh({ laChuNha: true, sanTrungLap: true }),
    )
    const khach = sucManhCauThu(
      nguoi,
      boiCanh({ laChuNha: false, sanTrungLap: true }),
    )
    expect(nha).toBe(khach)
  })
})

describe('bốn yếu tố cùng tác dụng', () => {
  it('cầu thủ giỏi, đúng vị trí, sung sức, sân nhà là mạnh nhất', () => {
    const gioi = cauThu(['ST'], 18)
    const kem = cauThu(['DC'], 5)

    const totNhat = sucManhCauThu(
      gioi,
      boiCanh({ viTriO: 'ST', laChuNha: true, theLuc: THE_LUC_DAY }),
    )
    const teNhat = sucManhCauThu(
      kem,
      boiCanh({ viTriO: 'ST', laChuNha: false, theLuc: 10 }),
    )

    expect(totNhat).toBeGreaterThan(teNhat * 3)
  })

  it('sức mạnh không bao giờ âm', () => {
    const nguoi = cauThu(['GK'], 1)
    expect(
      sucManhCauThu(nguoi, boiCanh({ viTriO: 'ST', theLuc: 0 })),
    ).toBeGreaterThanOrEqual(0)
  })
})
