import { describe, expect, it } from 'vitest'
import { ATTRIBUTES, GK_CHI_SO_CHUNG } from './attributes'
import { chiSoCanCo, daDien, hoSoHoanTat } from './completeness'
import type { AttributeValues, GkAttributeValues, PositionId } from './types'

function dayDuChiSoSan(giaTri = 12): AttributeValues {
  const ra: Record<string, number> = {}
  for (const a of ATTRIBUTES) ra[a.id] = giaTri
  return ra as AttributeValues
}

function dayDuChiSoThuMonChung(giaTri = 12): AttributeValues {
  const ra: Record<string, number> = {}
  for (const id of GK_CHI_SO_CHUNG) ra[id] = giaTri
  return ra as AttributeValues
}

const DU_CHI_SO_THU_MON: GkAttributeValues = {
  'phan-xa': 15,
  'bat-bong': 14,
  'phat-dong': 11,
}

describe('chiSoCanCo (AC-2.3, AC-2.1b)', () => {
  it('cầu thủ sân cần đúng 15 chỉ số và không chỉ số thủ môn nào', () => {
    const canCo = chiSoCanCo(['DC'])
    expect(canCo.attributes).toHaveLength(15)
    expect(canCo.gkAttributes).toHaveLength(0)
  })

  it('cầu thủ sân nhiều vị trí vẫn cần đúng 15 chỉ số', () => {
    expect(chiSoCanCo(['DC', 'DM', 'MC']).attributes).toHaveLength(15)
  })

  it('thủ môn cần đúng 8 chỉ số chung và 3 chỉ số riêng', () => {
    const canCo = chiSoCanCo(['GK'])
    expect(canCo.attributes).toHaveLength(8)
    expect(canCo.attributes).toEqual(GK_CHI_SO_CHUNG)
    expect(canCo.gkAttributes).toHaveLength(3)
  })

  it('thủ môn không cần những chỉ số mà AC-2.3 nói phải ẩn', () => {
    const canCo = chiSoCanCo(['GK'])
    expect(canCo.attributes).not.toContain('dut-diem')
    expect(canCo.attributes).not.toContain('tac-bong')
    expect(canCo.attributes).not.toContain('nhan-quan')
  })

  /*
    Đây là điểm mà /analyze bắt được: trước khi có AC-2.1b, tổ hợp
    [thủ môn + vị trí sân] không có lời giải nào đúng. Giờ nó bị chặn thẳng,
    nên không tồn tại "trường hợp thứ ba" cho hàm này phải đoán.
  */
  it('tổ hợp thủ môn kiêm vị trí sân bị từ chối, không trả bộ chỉ số nào', () => {
    expect(() => chiSoCanCo(['GK', 'DC'])).toThrow()
    expect(() => chiSoCanCo(['ST', 'GK'])).toThrow()
  })

  it('danh sách vị trí rỗng bị từ chối', () => {
    expect(() => chiSoCanCo([])).toThrow()
  })
})

describe('daDien', () => {
  it('nhận số nguyên trong 1..20', () => {
    for (const v of [1, 10, 20]) expect(daDien(v)).toBe(true)
  })

  it('từ chối ô chưa có giá trị', () => {
    expect(daDien(undefined)).toBe(false)
  })

  it('từ chối giá trị ngoài khoảng và số không nguyên', () => {
    for (const v of [0, 21, -3, 12.5, Number.NaN]) {
      expect(daDien(v), `giá trị ${v}`).toBe(false)
    }
  })
})

describe('hoSoHoanTat (AC-2.10)', () => {
  it('cầu thủ sân điền đủ 15 ô thì hoàn tất', () => {
    const kq = hoSoHoanTat({
      positions: ['DC'],
      attributes: dayDuChiSoSan(),
      gkAttributes: null,
    })
    expect(kq.hoanTat).toBe(true)
    expect(kq.soChiSoThieu).toBe(0)
  })

  it('thiếu một ô thì chưa hoàn tất và nêu đúng ô đó', () => {
    const chiSo = dayDuChiSoSan()
    delete (chiSo as Record<string, number | undefined>)['dut-diem']

    const kq = hoSoHoanTat({
      positions: ['DC'],
      attributes: chiSo,
      gkAttributes: null,
    })
    expect(kq.hoanTat).toBe(false)
    expect(kq.thieuChiSo).toEqual(['dut-diem'])
    expect(kq.soChiSoThieu).toBe(1)
  })

  it('hồ sơ trống thì thiếu đủ 15 ô', () => {
    const kq = hoSoHoanTat({
      positions: ['ST'],
      attributes: {},
      gkAttributes: null,
    })
    expect(kq.soChiSoThieu).toBe(15)
  })

  it('giá trị THẤP không bị coi là thiếu', () => {
    const chiSo = dayDuChiSoSan(1)
    const kq = hoSoHoanTat({
      positions: ['DC'],
      attributes: chiSo,
      gkAttributes: null,
    })
    expect(kq.hoanTat).toBe(true)
  })

  it('giá trị ngoài khoảng bị coi là thiếu', () => {
    const chiSo = dayDuChiSoSan()
    ;(chiSo as Record<string, number>)['toc-do'] = 25

    const kq = hoSoHoanTat({
      positions: ['DC'],
      attributes: chiSo,
      gkAttributes: null,
    })
    expect(kq.hoanTat).toBe(false)
    expect(kq.thieuChiSo).toEqual(['toc-do'])
  })

  it('thủ môn điền đủ 8 + 3 thì hoàn tất', () => {
    const kq = hoSoHoanTat({
      positions: ['GK'],
      attributes: dayDuChiSoThuMonChung(),
      gkAttributes: DU_CHI_SO_THU_MON,
    })
    expect(kq.hoanTat).toBe(true)
  })

  it('thủ môn thiếu chỉ số riêng thì nêu đúng chỉ số riêng còn thiếu', () => {
    const kq = hoSoHoanTat({
      positions: ['GK'],
      attributes: dayDuChiSoThuMonChung(),
      gkAttributes: { 'phan-xa': 15 },
    })
    expect(kq.hoanTat).toBe(false)
    expect(kq.thieuChiSoThuMon).toEqual(['bat-bong', 'phat-dong'])
  })

  it('thủ môn không bị tính thiếu những chỉ số chung vốn không hiện cho họ', () => {
    const kq = hoSoHoanTat({
      positions: ['GK'],
      attributes: dayDuChiSoThuMonChung(),
      gkAttributes: DU_CHI_SO_THU_MON,
    })
    expect(kq.thieuChiSo).not.toContain('dut-diem')
  })

  it('tổ hợp vị trí sai thì ném lỗi thay vì báo hoàn tất', () => {
    expect(() =>
      hoSoHoanTat({
        positions: ['GK', 'ST'] as PositionId[],
        attributes: dayDuChiSoSan(),
        gkAttributes: DU_CHI_SO_THU_MON,
      }),
    ).toThrow()
  })
})
