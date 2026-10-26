import { describe, expect, it } from 'vitest'
import { GK_CHI_SO_CHUNG } from './attributes'
import { chiSoTongTheoViTri, viTriTotNhat } from './rating'
import type { AttributeValues, GkAttributeValues } from './types'

/** Một trung vệ thực thụ: mạnh phòng ngự, yếu tấn công. */
const TRUNG_VE_GIOI: AttributeValues = {
  'tac-bong': 18,
  'kem-nguoi': 18,
  'khong-chien': 18,
  'doc-tinh-huong': 16,
  'suc-manh': 16,
  'chuyen-ngan': 12,
  'the-luc': 12,
  'toc-do': 10,
  'quyet-doan': 12,
  'dut-diem': 4,
  'sut-xa': 4,
  're-dat': 5,
  'khong-che-bong': 6,
  'tat-chuyen-dai': 6,
  'nhan-quan': 6,
}

describe('chỉ số tổng theo vị trí (AC-2.11)', () => {
  it('cùng một cầu thủ cho ra hai con số khác nhau ở hai vị trí', () => {
    const o_trung_ve = chiSoTongTheoViTri(
      { attributes: TRUNG_VE_GIOI, gkAttributes: null },
      'DC',
    )
    const o_tien_dao = chiSoTongTheoViTri(
      { attributes: TRUNG_VE_GIOI, gkAttributes: null },
      'ST',
    )

    expect(o_trung_ve.tinhDuoc).toBe(true)
    expect(o_tien_dao.tinhDuoc).toBe(true)
    if (!o_trung_ve.tinhDuoc || !o_tien_dao.tinhDuoc) return

    expect(o_trung_ve.diem).not.toBe(o_tien_dao.diem)
  })

  it('trung vệ chỉ số cao KHÔNG bị chấm cao ở vị trí tiền đạo', () => {
    const o_trung_ve = chiSoTongTheoViTri(
      { attributes: TRUNG_VE_GIOI, gkAttributes: null },
      'DC',
    )
    const o_tien_dao = chiSoTongTheoViTri(
      { attributes: TRUNG_VE_GIOI, gkAttributes: null },
      'ST',
    )
    if (!o_trung_ve.tinhDuoc || !o_tien_dao.tinhDuoc) {
      throw new Error('phải tính được')
    }

    // Số cụ thể để nếu ai đó sửa bảng trọng số thì test này lên tiếng.
    expect(o_trung_ve.diem).toBe(16)
    expect(o_tien_dao.diem).toBe(8.9)
    expect(o_trung_ve.diem - o_tien_dao.diem).toBeGreaterThan(5)
  })

  it('điểm luôn nằm trong thang 1..20', () => {
    for (const viTri of ['DC', 'ST', 'MC', 'DM'] as const) {
      const kq = chiSoTongTheoViTri(
        { attributes: TRUNG_VE_GIOI, gkAttributes: null },
        viTri,
      )
      if (!kq.tinhDuoc) throw new Error('phải tính được')
      expect(kq.diem).toBeGreaterThanOrEqual(1)
      expect(kq.diem).toBeLessThanOrEqual(20)
    }
  })

  it('hồ sơ thiếu chỉ số thì KHÔNG trả số, mà nêu rõ còn thiếu gì', () => {
    const thieu = { ...TRUNG_VE_GIOI }
    delete (thieu as Record<string, number | undefined>)['tac-bong']

    const kq = chiSoTongTheoViTri({ attributes: thieu, gkAttributes: null }, 'DC')
    expect(kq.tinhDuoc).toBe(false)
    if (kq.tinhDuoc) return
    expect(kq.thieu).toContain('tac-bong')
  })

  it('hồ sơ trống thì không tính được', () => {
    const kq = chiSoTongTheoViTri({ attributes: {}, gkAttributes: null }, 'DC')
    expect(kq.tinhDuoc).toBe(false)
  })

  it('thiếu chỉ số không liên quan tới vị trí thì vẫn tính được', () => {
    // Trung vệ không dùng Sút xa, nên thiếu ô đó không chặn việc chấm điểm DC.
    const thieu = { ...TRUNG_VE_GIOI }
    delete (thieu as Record<string, number | undefined>)['sut-xa']

    const kq = chiSoTongTheoViTri({ attributes: thieu, gkAttributes: null }, 'DC')
    expect(kq.tinhDuoc).toBe(true)
  })
})

describe('chỉ số tổng của thủ môn', () => {
  const chung: Record<string, number> = {}
  for (const id of GK_CHI_SO_CHUNG) chung[id] = 12
  const chiSoChung = chung as AttributeValues

  const riengTot: GkAttributeValues = {
    'phan-xa': 18,
    'bat-bong': 18,
    'phat-dong': 14,
  }
  const riengYeu: GkAttributeValues = {
    'phan-xa': 6,
    'bat-bong': 6,
    'phat-dong': 8,
  }

  it('thủ môn phản xạ tốt được chấm cao hơn thủ môn phản xạ kém', () => {
    const tot = chiSoTongTheoViTri(
      { attributes: chiSoChung, gkAttributes: riengTot },
      'GK',
    )
    const yeu = chiSoTongTheoViTri(
      { attributes: chiSoChung, gkAttributes: riengYeu },
      'GK',
    )
    if (!tot.tinhDuoc || !yeu.tinhDuoc) throw new Error('phải tính được')
    expect(tot.diem).toBeGreaterThan(yeu.diem)
  })

  it('thiếu chỉ số riêng thì không tính được và nêu đúng chỉ số riêng', () => {
    const kq = chiSoTongTheoViTri(
      { attributes: chiSoChung, gkAttributes: { 'phan-xa': 18 } },
      'GK',
    )
    expect(kq.tinhDuoc).toBe(false)
    if (kq.tinhDuoc) return
    expect(kq.thieu).toContain('bat-bong')
    expect(kq.thieu).toContain('phat-dong')
  })
})

describe('viTriTotNhat', () => {
  it('chọn vị trí mà cầu thủ được chấm cao nhất', () => {
    const kq = viTriTotNhat({ attributes: TRUNG_VE_GIOI, gkAttributes: null }, [
      'DC',
      'ST',
      'MC',
    ])
    expect(kq?.viTri).toBe('DC')
  })

  it('hồ sơ chưa đủ chỉ số thì trả null', () => {
    expect(
      viTriTotNhat({ attributes: {}, gkAttributes: null }, ['DC']),
    ).toBeNull()
  })
})
