import { describe, expect, it } from 'vitest'
import { CHI_THI, THU_TU_CHI_THI } from '../../domain/instructions'
import { POSITIONS } from '../../domain/positions'
import type { NgonNgu } from '../../services/tuyChonRepo'
import { BO_CHUOI } from './index'

/*
  Nhãn hiển thị của lớp dữ liệu bóng đá (T310, quyết định D68).

  Những phép kiểm này TRƯỚC ĐÂY nằm trong `domain/*.test.ts` và khẳng định
  trên `.ten`. Nhãn rời khỏi `domain/` thì phép kiểm **đi theo nhãn** sang
  đây — không bị xoá. Rủi ro R31 của plan nói đúng chỗ này: xoá là cách dễ
  nhất để test xanh trở lại, và cũng là cách mất luôn phép kiểm.

  Khác với bản cũ ở một điểm: giờ mỗi phép chạy cho **cả hai** ngôn ngữ.
*/

const CAC_NGON_NGU: readonly NgonNgu[] = ['vi', 'en']

describe('nhãn vị trí phủ đủ và không rỗng, ở cả hai ngôn ngữ', () => {
  it('mỗi vị trí có tên và tên viết tắt không rỗng', () => {
    for (const ngonNgu of CAC_NGON_NGU) {
      const bang = BO_CHUOI[ngonNgu].NHAN_VI_TRI
      for (const p of POSITIONS) {
        const nhan = bang[p.id]
        expect(nhan, `${ngonNgu}: thiếu hẳn vị trí ${p.id}`).toBeDefined()
        expect(nhan.ten.trim(), `${ngonNgu}: vị trí ${p.id} thiếu tên`).not.toBe('')
        expect(
          nhan.vietTat.trim(),
          `${ngonNgu}: vị trí ${p.id} thiếu viết tắt`,
        ).not.toBe('')
      }
    }
  })

  /*
    Hai ngôn ngữ phải phủ đúng cùng một tập id. Kiểu `Record<PositionId, …>`
    đã chặn việc thiếu, nhưng không chặn được việc bảng này có thêm một khoá
    lạ mà bảng kia không có — nên đếm.
  */
  it('hai bảng phủ đúng cùng một tập vị trí', () => {
    const khoaVi = Object.keys(BO_CHUOI.vi.NHAN_VI_TRI).sort()
    const khoaEn = Object.keys(BO_CHUOI.en.NHAN_VI_TRI).sort()
    expect(khoaEn).toEqual(khoaVi)
    expect(khoaVi).toHaveLength(POSITIONS.length)
  })

  /*
    Tên tiếng Anh phải KHÁC tên tiếng Việt. Nghe thừa, nhưng đây đúng là chỗ
    một bản dịch bỏ quên sẽ lộ ra: chép bảng tiếng Việt sang rồi quên dịch
    thì kiểu vẫn xanh, test phủ khoá vẫn xanh, chỉ phép này đỏ.
  */
  it('tên vị trí tiếng Anh khác tên tiếng Việt', () => {
    for (const p of POSITIONS) {
      expect(
        BO_CHUOI.en.NHAN_VI_TRI[p.id].ten,
        `vị trí ${p.id} chưa được dịch`,
      ).not.toBe(BO_CHUOI.vi.NHAN_VI_TRI[p.id].ten)
    }
  })
})

describe('nhãn chỉ thị và câu đánh đổi (AC-7.2), ở cả hai ngôn ngữ', () => {
  it('mọi mức của mọi chỉ thị đều có tên và câu đánh đổi không rỗng', () => {
    for (const ngonNgu of CAC_NGON_NGU) {
      const bang = BO_CHUOI[ngonNgu].NHAN_CHI_THI
      for (const id of THU_TU_CHI_THI) {
        expect(bang[id].ten.trim(), `${ngonNgu}: chỉ thị ${id}`).not.toBe('')
        for (const m of CHI_THI[id].cacMuc) {
          const nhan = (bang[id].cacMuc as Record<string, { ten: string; danhDoi: string }>)[m.muc]
          expect(nhan, `${ngonNgu}: thiếu mức ${id}/${m.muc}`).toBeDefined()
          expect(nhan.ten.trim(), `${ngonNgu}: ${id}/${m.muc}`).not.toBe('')
          expect(nhan.danhDoi.trim(), `${ngonNgu}: ${id}/${m.muc}`).not.toBe('')
        }
      }
    }
  })

  /*
    AC-7.2 đòi mỗi mức nói rõ ĐƯỢC gì MẤT gì, nên hai mức của cùng một chỉ
    thị mà có chung một câu thì một trong hai đang nói dối. Phép này theo
    nguyên văn từ `domain/instructions.test.ts` sang, nay chạy cho cả hai
    ngôn ngữ.
  */
  it('câu đánh đổi không trùng nhau giữa các mức của cùng chỉ thị', () => {
    for (const ngonNgu of CAC_NGON_NGU) {
      const bang = BO_CHUOI[ngonNgu].NHAN_CHI_THI
      for (const id of THU_TU_CHI_THI) {
        const cau = Object.values(
          bang[id].cacMuc as Record<string, { danhDoi: string }>,
        ).map((m) => m.danhDoi)
        expect(new Set(cau).size, `${ngonNgu}: ${id}`).toBe(cau.length)
      }
    }
  })

  it('tên chỉ thị tiếng Anh khác tiếng Việt', () => {
    for (const id of THU_TU_CHI_THI) {
      expect(
        BO_CHUOI.en.NHAN_CHI_THI[id].ten,
        `chỉ thị ${id} chưa được dịch`,
      ).not.toBe(BO_CHUOI.vi.NHAN_CHI_THI[id].ten)
    }
  })
})
