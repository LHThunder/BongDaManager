import { describe, expect, it } from 'vitest'
import {
  LoiUngDung,
  chuanHoaLoiLuuTru,
  laLoi,
  laLoiUngDung,
} from './errors'

/*
  Lỗi hết dung lượng phải được quy về đúng MỘT mã, vì AC-4.7 chỉ xử lý một mã
  ở một chỗ. Nếu lỗi của IndexedDB lọt ra nguyên dạng thì cảnh báo "thay đổi
  chưa được lưu" sẽ không bao giờ hiện, và người dùng mất dữ liệu mà không
  biết — đúng thứ P3 cấm.
*/

/** Lỗi mà IndexedDB ném ra khi hết chỗ. */
function loiHetDungLuong(): Error {
  const loi = new Error('The quota has been exceeded.')
  loi.name = 'QuotaExceededError'
  return loi
}

describe('chuanHoaLoiLuuTru', () => {
  it('quy lỗi hết dung lượng của trình duyệt về mã QuotaExceeded', () => {
    const daQuy = chuanHoaLoiLuuTru(loiHetDungLuong())
    expect(daQuy).toBeInstanceOf(LoiUngDung)
    expect(daQuy.ma).toBe('QuotaExceeded')
  })

  it('giữ nguyên nguyên nhân gốc để còn lần được khi gỡ lỗi', () => {
    const goc = loiHetDungLuong()
    expect(chuanHoaLoiLuuTru(goc).cause).toBe(goc)
  })

  it('lỗi lạ khác thì quy về StorageUnavailable, không âm thầm bỏ qua', () => {
    expect(chuanHoaLoiLuuTru(new Error('mất kết nối')).ma).toBe(
      'StorageUnavailable',
    )
    expect(chuanHoaLoiLuuTru('một chuỗi').ma).toBe('StorageUnavailable')
    expect(chuanHoaLoiLuuTru(undefined).ma).toBe('StorageUnavailable')
  })

  it('lỗi đã là LoiUngDung thì đi qua nguyên vẹn, không bị quy lại', () => {
    const goc = new LoiUngDung('DuplicateShirtNumber', { giaTri: 7 })
    expect(chuanHoaLoiLuuTru(goc)).toBe(goc)
  })

  it('luôn TRẢ VỀ một lỗi chứ không trả undefined', () => {
    for (const thu of [null, 0, '', false, {}]) {
      expect(chuanHoaLoiLuuTru(thu)).toBeInstanceOf(LoiUngDung)
    }
  })
})

describe('nhận diện lỗi', () => {
  it('laLoiUngDung phân biệt được lỗi của ứng dụng', () => {
    expect(laLoiUngDung(new LoiUngDung('NotFound'))).toBe(true)
    expect(laLoiUngDung(new Error('khác'))).toBe(false)
    expect(laLoiUngDung(null)).toBe(false)
  })

  it('laLoi so đúng mã', () => {
    const loi = new LoiUngDung('QuotaExceeded')
    expect(laLoi(loi, 'QuotaExceeded')).toBe(true)
    expect(laLoi(loi, 'NotFound')).toBe(false)
    expect(laLoi(new Error('x'), 'QuotaExceeded')).toBe(false)
  })

  it('mã QuotaExceeded và StorageUnavailable là hai mã mà AC-4.7 cần bắt', () => {
    // Hai mã này được `ghiNhanLoiLuuTru` dùng để quyết định có hiện cảnh báo
    // tập trung hay không; test này giữ cho chúng không bị đổi tên âm thầm.
    expect(new LoiUngDung('QuotaExceeded').ma).toBe('QuotaExceeded')
    expect(new LoiUngDung('StorageUnavailable').ma).toBe('StorageUnavailable')
  })

  it('chi tiết lỗi được giữ lại để giao diện ghép câu cụ thể', () => {
    const loi = new LoiUngDung('InvalidAttributeValue', {
      truong: 'Dứt điểm',
      giaTri: 25,
    })
    expect(loi.chiTiet).toEqual({ truong: 'Dứt điểm', giaTri: 25 })
  })
})
