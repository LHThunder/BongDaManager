import { describe, expect, it } from 'vitest'
import {
  laThuMonThucThu,
  MUC_TRU_HIEU_SUAT,
  mucSaiViTri,
  THU_TU_MUC_SAI,
  type MucSai,
} from './misplacement'
import { POSITIONS } from './positions'

describe('mức sai vị trí (AC-5.5)', () => {
  it('đứng đúng vị trí sở trường là dung', () => {
    expect(mucSaiViTri('DC', ['DC'])).toBe('dung')
    expect(mucSaiViTri('GK', ['GK'])).toBe('dung')
  })

  it('hậu vệ phải đá hậu vệ trái là nhe — cùng tuyến, lệch bên', () => {
    expect(mucSaiViTri('DL', ['DR'])).toBe('nhe')
  })

  it('trung vệ đá hậu vệ cánh cũng là nhe', () => {
    expect(mucSaiViTri('DL', ['DC'])).toBe('nhe')
  })

  it('tiền vệ trụ đá trung vệ là vua — lệch một tuyến', () => {
    expect(mucSaiViTri('DC', ['DM'])).toBe('vua')
  })

  it('tiền đạo đá trung vệ là nang — lệch hai tuyến', () => {
    expect(mucSaiViTri('DC', ['ST'])).toBe('nang')
  })

  it('người không phải thủ môn đứng khung thành là nang', () => {
    for (const p of POSITIONS) {
      if (p.id !== 'GK') {
        expect(mucSaiViTri('GK', [p.id]), p.id).toBe('nang')
      }
    }
  })

  it('thủ môn đá vị trí sân là nang, kể cả vị trí gần nhất', () => {
    expect(mucSaiViTri('DC', ['GK'])).toBe('nang')
    expect(mucSaiViTri('ST', ['GK'])).toBe('nang')
  })

  it('ô trống tính như nang — không có vị trí sở trường nào', () => {
    expect(mucSaiViTri('DC', [])).toBe('nang')
  })
})

describe('cầu thủ nhiều vị trí lấy mức nhẹ nhất (AC-5.5)', () => {
  it('người đá được cả trung vệ và tiền vệ trụ đứng trung vệ là dung', () => {
    expect(mucSaiViTri('DC', ['DM', 'DC'])).toBe('dung')
    expect(mucSaiViTri('DC', ['DC', 'DM'])).toBe('dung')
  })

  it('thứ tự liệt kê vị trí không làm đổi kết quả', () => {
    expect(mucSaiViTri('DL', ['ST', 'DR'])).toBe('nhe')
    expect(mucSaiViTri('DL', ['DR', 'ST'])).toBe('nhe')
  })

  it('lấy mức nhẹ nhất chứ không phải mức của vị trí đầu danh sách', () => {
    // ST đứng DC là nang, DM đứng DC là vua -> phải ra vua.
    expect(mucSaiViTri('DC', ['ST', 'DM'])).toBe('vua')
  })
})

describe('mức trừ hiệu suất (chuẩn bị cho AC-8.5)', () => {
  it('có đúng một con số cho mỗi mức', () => {
    expect(Object.keys(MUC_TRU_HIEU_SUAT).sort()).toEqual(
      [...THU_TU_MUC_SAI].sort(),
    )
  })

  it('đúng vị trí thì không bị trừ gì', () => {
    expect(MUC_TRU_HIEU_SUAT.dung).toBe(0)
  })

  it('tăng dần theo mức sai và không bao giờ trừ hết', () => {
    for (let i = 1; i < THU_TU_MUC_SAI.length; i += 1) {
      const truoc = MUC_TRU_HIEU_SUAT[THU_TU_MUC_SAI[i - 1] as MucSai]
      const sau = MUC_TRU_HIEU_SUAT[THU_TU_MUC_SAI[i] as MucSai]
      expect(sau).toBeGreaterThan(truoc)
    }
    for (const muc of THU_TU_MUC_SAI) {
      expect(MUC_TRU_HIEU_SUAT[muc]).toBeLessThan(1)
    }
  })
})

describe('nhận biết thủ môn (AC-5.7)', () => {
  it('đúng với cầu thủ có vị trí GK', () => {
    expect(laThuMonThucThu(['GK'])).toBe(true)
  })

  it('sai với cầu thủ sân và với ô trống', () => {
    expect(laThuMonThucThu(['DC', 'DM'])).toBe(false)
    expect(laThuMonThucThu([])).toBe(false)
  })
})
