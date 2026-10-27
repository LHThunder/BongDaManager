import { describe, expect, it } from 'vitest'
import {
  LoiMauKhongHopLe,
  MAU_CHU_SANG,
  MAU_CHU_TOI,
  NGUONG_TRUNG_MAU_AO,
  TUONG_PHAN_TOI_THIEU,
  docMau,
  dongChuDocDuoc,
  khoangCachMau,
  laMauHopLe,
  mauChuTuongPhan,
  nenDamBaoTuongPhan,
  tiLeTuongPhan,
  trungMauAo,
} from './colors'

describe('đọc mã màu', () => {
  it('nhận mã 6 ký tự có dấu thăng, không phân biệt chữ hoa thường', () => {
    expect(docMau('#1E40AF')).toEqual({ r: 30, g: 64, b: 175 })
    expect(docMau('#1e40af')).toEqual({ r: 30, g: 64, b: 175 })
    expect(docMau('  #FFFFFF  ')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('từ chối mã không hợp lệ', () => {
    for (const xau of ['', '#FFF', 'FFFFFF', '#GGGGGG', '#12345', 'đỏ']) {
      expect(laMauHopLe(xau), `"${xau}"`).toBe(false)
      expect(() => docMau(xau)).toThrow(LoiMauKhongHopLe)
    }
  })
})

describe('tỉ lệ tương phản theo WCAG', () => {
  it('đen trên trắng là 21:1', () => {
    expect(tiLeTuongPhan('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  it('một màu với chính nó là 1:1', () => {
    expect(tiLeTuongPhan('#1E40AF', '#1E40AF')).toBeCloseTo(1, 5)
  })

  it('không phụ thuộc thứ tự hai màu', () => {
    expect(tiLeTuongPhan('#1E40AF', '#FFFFFF')).toBeCloseTo(
      tiLeTuongPhan('#FFFFFF', '#1E40AF'),
      5,
    )
  })
})

describe('màu chữ tương phản (AC-3.8)', () => {
  it('nền tối thì dùng chữ sáng', () => {
    for (const nen of ['#000000', '#1E40AF', '#7F1D1D', '#15803D']) {
      expect(mauChuTuongPhan(nen), `nền ${nen}`).toBe(MAU_CHU_SANG)
    }
  })

  it('nền sáng thì dùng chữ tối', () => {
    for (const nen of ['#FFFFFF', '#F8FAFC', '#FDE047', '#A7F3D0']) {
      expect(mauChuTuongPhan(nen), `nền ${nen}`).toBe(MAU_CHU_TOI)
    }
  })

  /*
    Hai màu khó nhất mà spec mục 5 và T035 nêu tên: vàng nhạt và xám trung
    tính. Vàng nhạt là bẫy kinh điển — nhìn thì "đậm" nhưng độ sáng rất cao
    nên chữ trắng trên đó không đọc được.
  */
  it('vàng nhạt vẫn đọc được nhờ chọn đúng màu chữ', () => {
    const vangNhat = '#FDE047'
    expect(mauChuTuongPhan(vangNhat)).toBe(MAU_CHU_TOI)
    expect(tiLeTuongPhan(vangNhat, MAU_CHU_SANG)).toBeLessThan(
      TUONG_PHAN_TOI_THIEU,
    )
    expect(dongChuDocDuoc(vangNhat)).toBe(true)
  })

  it('xám trung tính vẫn đọc được nhờ chọn đúng màu chữ', () => {
    expect(dongChuDocDuoc('#6B7280')).toBe(true)
    expect(dongChuDocDuoc('#9CA3AF')).toBe(true)
  })

  it('màu chữ được chọn luôn đạt tối thiểu 4.5:1 trên một dải màu rộng', () => {
    const khong_dat: string[] = []
    for (let r = 0; r <= 255; r += 51) {
      for (let g = 0; g <= 255; g += 51) {
        for (let b = 0; b <= 255; b += 51) {
          const nen = `#${[r, g, b]
            .map((v) => v.toString(16).padStart(2, '0'))
            .join('')}`
          if (!dongChuDocDuoc(nen)) khong_dat.push(nen)
        }
      }
    }

    // Có một dải màu xám giữa mà cả chữ trắng và chữ đen đều không đạt 4.5:1.
    // Test này ghi lại đúng dải đó để nó không âm thầm rộng ra.
    expect(
      khong_dat.length,
      `các màu chưa đạt: ${khong_dat.join(', ')}`,
    ).toBeLessThanOrEqual(20)
  })
})

describe('nền đảm bảo tương phản (AC-3.8)', () => {
  it('màu đã đạt chuẩn thì không bị điều chỉnh', () => {
    const kq = nenDamBaoTuongPhan('#1E40AF')
    expect(kq.daDieuChinh).toBe(false)
    expect(kq.nen).toBe('#1E40AF')
    expect(tiLeTuongPhan(kq.nen, kq.chu)).toBeGreaterThanOrEqual(
      TUONG_PHAN_TOI_THIEU,
    )
  })

  it('màu thuộc dải không đạt thì được điều chỉnh cho đạt', () => {
    const kq = nenDamBaoTuongPhan('#0077DD')
    expect(kq.daDieuChinh).toBe(true)
    expect(tiLeTuongPhan(kq.nen, kq.chu)).toBeGreaterThanOrEqual(
      TUONG_PHAN_TOI_THIEU,
    )
  })

  it('mọi màu trong không gian RGB đều ra được cặp nền/chữ đạt chuẩn', () => {
    const thatBai: string[] = []
    for (let r = 0; r <= 255; r += 17) {
      for (let g = 0; g <= 255; g += 17) {
        for (let b = 0; b <= 255; b += 17) {
          const nen = `#${[r, g, b]
            .map((v) => v.toString(16).padStart(2, '0'))
            .join('')}`
          const kq = nenDamBaoTuongPhan(nen)
          if (tiLeTuongPhan(kq.nen, kq.chu) < TUONG_PHAN_TOI_THIEU) {
            thatBai.push(nen)
          }
        }
      }
    }
    expect(thatBai, `màu không xử lý được: ${thatBai.join(', ')}`).toEqual([])
  })

  it('điều chỉnh giữ nguyên sắc màu, chỉ đổi đậm nhạt', () => {
    // #0077DD là xanh dương: sau điều chỉnh, kênh xanh dương vẫn phải trội.
    const kq = nenDamBaoTuongPhan('#0077DD')
    const sau = docMau(kq.nen)
    expect(sau.b).toBeGreaterThan(sau.r)
    expect(sau.b).toBeGreaterThan(sau.g)
  })
})

describe('trùng màu áo (AC-3.7)', () => {
  it('hai màu giống hệt thì trùng', () => {
    expect(trungMauAo('#1E40AF', '#1E40AF')).toBe(true)
  })

  it('hai sắc xanh gần nhau thì trùng', () => {
    expect(trungMauAo('#1E40AF', '#1E3A8A')).toBe(true)
  })

  it('hai sắc trắng gần nhau thì trùng', () => {
    expect(trungMauAo('#FFFFFF', '#F8FAFC')).toBe(true)
  })

  it('xanh với đỏ thì không trùng', () => {
    expect(trungMauAo('#1E40AF', '#DC2626')).toBe(false)
  })

  it('trắng với đen thì không trùng', () => {
    expect(trungMauAo('#FFFFFF', '#000000')).toBe(false)
  })

  it('xanh dương với xanh lá thì không trùng', () => {
    expect(trungMauAo('#1E40AF', '#15803D')).toBe(false)
  })

  it('khoảng cách màu không phụ thuộc thứ tự', () => {
    expect(khoangCachMau('#1E40AF', '#DC2626')).toBeCloseTo(
      khoangCachMau('#DC2626', '#1E40AF'),
      5,
    )
  })

  it('ngưỡng nằm giữa cặp trùng rõ nhất và cặp khác rõ nhất', () => {
    expect(khoangCachMau('#1E40AF', '#1E3A8A')).toBeLessThan(
      NGUONG_TRUNG_MAU_AO,
    )
    expect(khoangCachMau('#1E40AF', '#DC2626')).toBeGreaterThan(
      NGUONG_TRUNG_MAU_AO,
    )
  })

  it('màu không hợp lệ thì ném lỗi chứ không trả kết quả đoán', () => {
    expect(() => trungMauAo('#FFF', '#000000')).toThrow(LoiMauKhongHopLe)
  })
})
