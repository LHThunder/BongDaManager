import { describe, expect, it } from 'vitest'
import { aoDangDung, mauAoRaSan, type DoiCoMauAo } from './mauAo'

/*
  AC-3.7 — hai đội trùng màu áo chính thì một đội phải đổi sang áo phụ, và
  người dùng phải được nói rõ đội nào đổi.

  Phần này rời khỏi `engine/` ở Giai đoạn 4 (quyết định D39): màu áo không
  phải luật bóng đá nên theo P2 nó không có việc gì trong engine, và trường
  `mauAoDangDung` cũ **luôn bằng `'chinh'`** vì chưa có chỗ nào đặt.
*/

function doi(ten: string, chinh: string, phu: string): DoiCoMauAo {
  return { name: ten, primaryColor: chinh, secondaryColor: phu }
}

const XANH = '#1d4ed8'
const XANH_GAN_GIONG = '#1e4fd4'
const DO = '#dc2626'

describe('chọn áo cho một cặp đấu (AC-3.7)', () => {
  it('hai màu khác nhau thì không bên nào phải đổi', () => {
    const kq = aoDangDung(doi('A', XANH, '#ffffff'), doi('B', DO, '#000000'))
    expect(kq).toEqual({ nha: 'chinh', khach: 'chinh', doiDoiAo: null })
  })

  it('trùng màu thì ĐỘI KHÁCH đổi, và nêu đúng tên đội đó', () => {
    const kq = aoDangDung(
      doi('Sông Hàn', XANH, '#f8fafc'),
      doi('Hải Phòng', XANH, '#111827'),
    )
    expect(kq.nha).toBe('chinh')
    expect(kq.khach).toBe('phu')
    expect(kq.doiDoiAo).toBe('Hải Phòng')
  })

  it('hai màu gần giống nhau cũng tính là trùng', () => {
    const kq = aoDangDung(
      doi('A', XANH, '#ffffff'),
      doi('B', XANH_GAN_GIONG, '#000000'),
    )
    expect(kq.khach).toBe('phu')
  })

  it('đúng một bên đổi áo, không bao giờ cả hai', () => {
    const kq = aoDangDung(doi('A', XANH, '#fff'), doi('B', XANH, '#000'))
    const soDoi = [kq.nha, kq.khach].filter((x) => x === 'phu').length
    expect(soDoi).toBe(1)
  })
})

describe('màu ra sân thật của một đội', () => {
  it('áo chính lấy màu chính, áo phụ lấy màu phụ', () => {
    const d = doi('A', XANH, DO)
    expect(mauAoRaSan(d, 'chinh')).toBe(XANH)
    expect(mauAoRaSan(d, 'phu')).toBe(DO)
  })

  it('cặp đấu trùng màu thì hai màu ra sân khác nhau', () => {
    const nha = doi('A', XANH, '#f8fafc')
    const khach = doi('B', XANH, '#111827')
    const kq = aoDangDung(nha, khach)

    expect(mauAoRaSan(nha, kq.nha)).not.toBe(mauAoRaSan(khach, kq.khach))
  })
})
