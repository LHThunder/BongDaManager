import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import { LOAI_BAT_BUOC, type LoaiSuKien } from '../engine/suKien'
import { chayHetTran, dongSuKien, taoTran } from '../engine/tran'
import { MAU_EN } from './ngonNgu/mauCau.en'
import { MAU_VI } from './ngonNgu/mauCau.vi'
import { dungCauTuongThuat, soMauCau } from './tuongThuat'

/*
  Cùng một trận kể bằng hai thứ tiếng (AC-18.2, AC-18.3).

  Đây là AC dạng SO SÁNH duy nhất của spec 003, nên hiến pháp P5 đòi nó có
  test riêng chạy đúng phép so sánh ấy — không được tick bằng cách nhìn.

  Phép so là: đổi ngôn ngữ chỉ được đổi CHỮ. Số dòng, thứ tự dòng, phút của
  từng dòng, loại sự kiện và danh sách cầu thủ phải giống hệt. Nếu một trong
  những thứ đó đổi thì bản tiếng Anh không còn là cùng một trận nữa.
*/

const tenCauThu = (id: string) => id
const tenDoi = (ben: 'nha' | 'khach') => (ben === 'nha' ? 'Nhà' : 'Khách')

describe('cùng một trận kể bằng hai ngôn ngữ (AC-18.2)', () => {
  it('cùng số dòng, cùng thứ tự, cùng phút, cùng cầu thủ — chỉ chữ đổi', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const dong = dongSuKien(chayHetTran(taoTran(cauHinhMau(ma))))

      const vi = dong.map((sk) => dungCauTuongThuat(sk, tenCauThu, tenDoi, 'vi'))
      const en = dong.map((sk) => dungCauTuongThuat(sk, tenCauThu, tenDoi, 'en'))

      expect(en, `${ma}: số dòng`).toHaveLength(vi.length)

      for (let i = 0; i < dong.length; i += 1) {
        const bao = `${ma} dòng ${i} (${dong[i].loai}, phút ${dong[i].phut})`
        // Câu phải KHÁC nhau — nếu giống thì một bên chưa được dịch.
        expect(en[i], bao).not.toBe(vi[i])
        expect(en[i].trim(), bao).not.toBe('')
      }
    }
  })

  /*
    Mọi tên cầu thủ xuất hiện trong câu tiếng Việt cũng phải xuất hiện trong
    câu tiếng Anh của đúng dòng ấy. Đây là phép bắt cái bẫy đảo chủ–vị: nếu
    bản tiếng Anh vô tình bỏ mất một người, hoặc gọi nhầm người, phép này đỏ.
  */
  it('mỗi dòng nhắc đúng những cầu thủ mà dòng ấy mang theo', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const dong = dongSuKien(chayHetTran(taoTran(cauHinhMau(ma))))

      for (const sk of dong) {
        const vi = dungCauTuongThuat(sk, tenCauThu, tenDoi, 'vi')
        const en = dungCauTuongThuat(sk, tenCauThu, tenDoi, 'en')
        const bao = `${ma} phút ${sk.phut} (${sk.loai})`

        for (const id of sk.cacCauThu) {
          // Một mẫu câu có quyền không nhắc tới người thứ hai, nhưng nếu
          // bản này nhắc thì bản kia cũng phải nhắc.
          expect(en.includes(id), `${bao}: ${id}`).toBe(vi.includes(id))
        }
      }
    }
  })
})

describe('hai bảng mẫu câu cân nhau (AC-18.3)', () => {
  it('cùng tập loại sự kiện', () => {
    expect(Object.keys(MAU_EN).sort()).toEqual(Object.keys(MAU_VI).sort())
  })

  /*
    Cùng số mẫu mỗi loại. Kiểu `CungSoMau` đã chặn ở bước biên dịch, nhưng
    phép này nói ra con số, nên khi nó đỏ thì người đọc biết ngay loại nào
    lệch và lệch bao nhiêu — thứ mà thông báo của trình biên dịch không cho.
  */
  it('cùng số mẫu ở từng loại sự kiện', () => {
    for (const loai of Object.keys(MAU_VI) as LoaiSuKien[]) {
      expect(soMauCau(loai, 'en'), `loại ${loai}`).toBe(soMauCau(loai, 'vi'))
    }
  })

  it('mọi loại sự kiện bắt buộc đều có mẫu ở cả hai ngôn ngữ', () => {
    for (const loai of LOAI_BAT_BUOC) {
      expect(soMauCau(loai, 'vi'), `vi: ${loai}`).toBeGreaterThan(0)
      expect(soMauCau(loai, 'en'), `en: ${loai}`).toBeGreaterThan(0)
    }
  })
})
