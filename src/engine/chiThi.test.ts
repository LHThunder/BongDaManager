import { describe, expect, it } from 'vitest'
import {
  CHI_THI,
  CHI_THI_MAC_DINH,
  THU_TU_CHI_THI,
  type BoChiThi,
} from '../domain/instructions'
import {
  CAC_KHOA_HE_SO,
  HE_SO_TRUNG_TINH,
  heSoCuaBo,
  heSoCuaMuc,
} from './chiThi'

function voi(thayDoi: Partial<BoChiThi>): BoChiThi {
  return { ...CHI_THI_MAC_DINH, ...thayDoi }
}

describe('bảng hệ số chỉ thị (quyết định D24)', () => {
  it('mỗi mức của cả 6 chỉ thị đều có một bộ hệ số đầy đủ', () => {
    for (const id of THU_TU_CHI_THI) {
      for (const m of CHI_THI[id].cacMuc) {
        const heSo = heSoCuaMuc(id, m.muc as never)
        for (const khoa of CAC_KHOA_HE_SO) {
          expect(
            typeof heSo[khoa],
            `${id}/${m.muc}/${khoa}`,
          ).toBe('number')
        }
      }
    }
  })

  it('không hệ số nào bằng 0 hay âm — chỉ thị làm hiếm đi, không cấm hẳn', () => {
    for (const id of THU_TU_CHI_THI) {
      for (const m of CHI_THI[id].cacMuc) {
        const heSo = heSoCuaMuc(id, m.muc as never)
        for (const khoa of CAC_KHOA_HE_SO) {
          expect(heSo[khoa], `${id}/${m.muc}/${khoa}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('bộ chỉ thị mặc định cho hệ số trung tính ở mọi hướng', () => {
    expect(heSoCuaBo(CHI_THI_MAC_DINH)).toEqual(HE_SO_TRUNG_TINH)
  })

  it('mỗi chỉ thị đều có ít nhất một mức làm đổi hệ số', () => {
    // Một chỉ thị mà mọi mức đều trung tính thì nó không tác dụng gì —
    // người dùng đặt nó cũng như không.
    for (const id of THU_TU_CHI_THI) {
      const coTacDung = CHI_THI[id].cacMuc.some((m) => {
        const heSo = heSoCuaMuc(id, m.muc as never)
        return CAC_KHOA_HE_SO.some((k) => heSo[k] !== 1)
      })
      expect(coTacDung, id).toBe(true)
    }
  })
})

describe('hệ số phục vụ đúng AC đòi hỏi', () => {
  it('tấn công biên đẩy mạnh cả hướng biên lẫn tạt cánh (AC-8.3)', () => {
    const bien = heSoCuaBo(voi({ 'huong-tan-cong': 'bien' }))
    const trungLo = heSoCuaBo(voi({ 'huong-tan-cong': 'trung-lo' }))

    expect(bien.huongBien).toBeGreaterThan(trungLo.huongBien)
    expect(bien.tatCanh).toBeGreaterThan(trungLo.tatCanh)
    // Chênh lệch phải đủ lớn để AC-8.3 đòi +50% là với tới được.
    expect(bien.tatCanh / trungLo.tatCanh).toBeGreaterThan(2)
  })

  it('pressing cao đẩy mạnh CẢ HAI chiều ngược nhau (AC-8.4)', () => {
    const cao = heSoCuaBo(voi({ 'cuong-do-pressing': 'cao' }))
    const thap = heSoCuaBo(voi({ 'cuong-do-pressing': 'thap' }))

    expect(cao.cuopBongDaiCao).toBeGreaterThan(thap.cuopBongDaiCao)
    expect(cao.biThoatXuong).toBeGreaterThan(thap.biThoatXuong)
  })

  it('pressing cao không phải món lợi suông — có cái mất đi kèm', () => {
    const cao = heSoCuaBo(voi({ 'cuong-do-pressing': 'cao' }))
    expect(cao.cuopBongDaiCao).toBeGreaterThan(1)
    expect(cao.biThoatXuong).toBeGreaterThan(1)
  })

  it('chuyền bóng nhanh thì lên bóng nhanh hơn nhưng giữ bóng kém hơn', () => {
    const nhanh = heSoCuaBo(voi({ 'toc-do-chuyen-bong': 'nhanh' }))
    const cham = heSoCuaBo(voi({ 'toc-do-chuyen-bong': 'cham' }))

    expect(nhanh.lenBongNhanh).toBeGreaterThan(cham.lenBongNhanh)
    expect(nhanh.giuBong).toBeLessThan(cham.giuBong)
  })

  it('đội hình hẹp làm bóng ít ra biên hơn đội hình rộng', () => {
    const hep = heSoCuaBo(voi({ 'do-rong-doi-hinh': 'hep' }))
    const rong = heSoCuaBo(voi({ 'do-rong-doi-hinh': 'rong' }))
    expect(hep.huongBien).toBeLessThan(rong.huongBien)
  })
})

describe('ghép nhiều chỉ thị', () => {
  it('hai chỉ thị cùng đẩy một hướng thì nhân dồn', () => {
    const motCai = heSoCuaBo(voi({ 'huong-tan-cong': 'bien' }))
    const haiCai = heSoCuaBo(
      voi({ 'huong-tan-cong': 'bien', 'do-rong-doi-hinh': 'rong' }),
    )
    expect(haiCai.huongBien).toBeGreaterThan(motCai.huongBien)
  })

  it('hai chỉ thị ngược nhau thì triệt tiêu bớt', () => {
    const chiBien = heSoCuaBo(voi({ 'huong-tan-cong': 'bien' }))
    const bienMaHep = heSoCuaBo(
      voi({ 'huong-tan-cong': 'bien', 'do-rong-doi-hinh': 'hep' }),
    )
    expect(bienMaHep.huongBien).toBeLessThan(chiBien.huongBien)
    // Nhưng vẫn phải còn thiên về biên hơn bộ mặc định.
    expect(bienMaHep.huongBien).toBeGreaterThan(1)
  })

  it('kết quả tất định, không phụ thuộc thứ tự khoá của bộ chỉ thị', () => {
    const xuoi: BoChiThi = {
      'do-cao-doi-hinh': 'cao',
      'do-rong-doi-hinh': 'rong',
      'toc-do-chuyen-bong': 'nhanh',
      'cuong-do-pressing': 'cao',
      'huong-tan-cong': 'bien',
      'bay-viet-vi': 'bat',
    }
    const nguoc: BoChiThi = {
      'bay-viet-vi': 'bat',
      'huong-tan-cong': 'bien',
      'cuong-do-pressing': 'cao',
      'toc-do-chuyen-bong': 'nhanh',
      'do-rong-doi-hinh': 'rong',
      'do-cao-doi-hinh': 'cao',
    }
    expect(heSoCuaBo(nguoc)).toEqual(heSoCuaBo(xuoi))
  })

  it('mọi hệ số tổng vẫn dương với bộ chỉ thị cực đoan nhất', () => {
    const cucDoan = heSoCuaBo({
      'do-cao-doi-hinh': 'thap',
      'do-rong-doi-hinh': 'hep',
      'toc-do-chuyen-bong': 'cham',
      'cuong-do-pressing': 'thap',
      'huong-tan-cong': 'trung-lo',
      'bay-viet-vi': 'tat',
    })
    for (const khoa of CAC_KHOA_HE_SO) {
      expect(cucDoan[khoa], khoa).toBeGreaterThan(0)
    }
  })
})
