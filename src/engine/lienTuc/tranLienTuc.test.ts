import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import {
  chayHetTran,
  dongSuKien,
  taoTran,
  tongPhutTran,
} from '../tran'
import { hatGiongDong, RUT_MOI_MOC } from './hatGiong'
import { docMoc } from './loMoc'
import { BUOC_MOI_CHUOI } from './dienPha'
import { BUOC_MOI_PHUT, MOC_MOI_PHUT, SO_THUC_THE } from './moc'
import {
  buocPhutLienTuc,
  chayHetTranLienTuc,
  PHIEN_BAN_ENGINE_LIEN_TUC,
  taoTranLienTuc,
} from './tranLienTuc'

/*
  Vòng ngoài theo phút (T704, D119 + D136).

  Phép kiểm nặng nhất là cái cuối: DẢI RÚT MỖI MỐC. Nó có hai mệnh đề, và mệnh
  đề thứ hai CỐ Ý sẽ đỏ khi Phase 54 đến — đọc chú thích ở đó.
*/

const MA = MA_TRAN_CO_DINH[0]!

describe('phiên bản engine riêng, không đụng v6', () => {
  it('engine liên tục mang số 101', () => {
    expect(PHIEN_BAN_ENGINE_LIEN_TUC).toBe(101)
  })
})

describe('taoTranLienTuc bọc trạng thái v6 và đặt hạt giống về dòng 1', () => {
  it('hạt giống xuất phát là hạt giống dòng 1, không phải dòng 0', () => {
    const lt = taoTranLienTuc(cauHinhMau(MA))
    expect(lt.tran.hatGiong).toBe(hatGiongDong(MA, 1))
    expect(lt.tran.hatGiong).not.toBe(taoTran(cauHinhMau(MA)).hatGiong)
  })

  it('mọi thứ khác của trạng thái v6 giữ nguyên — cùng độ dài trận', () => {
    const v6 = taoTran(cauHinhMau(MA))
    const lt = taoTranLienTuc(cauHinhMau(MA))
    expect(tongPhutTran(lt.tran)).toBe(tongPhutTran(v6))
    expect(lt.tran.buGio).toEqual(v6.buGio)
    expect(lt.tran.quanSo).toBe(v6.quanSo)
    expect(lt.maTran).toBe(MA)
    expect(lt.chiSoMoc).toBe(0)
  })
})

describe('hai chế độ ra HAI trận khác nhau — AC-45.3 đúng từng chữ', () => {
  it('cùng mã trận, cùng hai đội, nhưng tỉ số không bắt buộc giống', () => {
    let khac = 0
    for (const ma of MA_TRAN_CO_DINH) {
      const v6 = chayHetTran(taoTran(cauHinhMau(ma)))
      const lt = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(ma)))
      if (
        v6.tiSo.nha !== lt.tran.tiSo.nha ||
        v6.tiSo.khach !== lt.tran.tiSo.khach
      ) {
        khac += 1
      }
    }
    // Hai dòng rút khác nhau thì phần lớn mã trận phải ra tỉ số khác.
    expect(khac).toBeGreaterThan(MA_TRAN_CO_DINH.length / 2)
  })

  it('nhưng cả hai đều là một trận THẬT: có kết thúc và có dòng sự kiện', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const lt = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(ma)))
      expect(lt.tran.ketThuc, ma).toBe(true)
      expect(dongSuKien(lt.tran).length, ma).toBeGreaterThan(0)
    }
  })

  it('và chế độ liên tục tự tái lập: chạy hai lần ra một kết quả', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const a = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(ma)))
      const b = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(ma)))
      expect(b.tran.tiSo, ma).toEqual(a.tran.tiSo)
      expect(dongSuKien(b.tran), ma).toEqual(dongSuKien(a.tran))
    }
  })
})

describe('buocPhutLienTuc trả lô của đúng một phút', () => {
  it('một phút phát đúng MOC_MOI_PHUT mốc thường', () => {
    const phut = buocPhutLienTuc(taoTranLienTuc(cauHinhMau(MA)))
    expect(phut.lo.soMocDaGhi).toBe(MOC_MOI_PHUT)
  })

  it('đồng hồ mốc tiến đúng BUOC_MOI_PHUT mỗi phút', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))
    for (let p = 1; p <= 3; p += 1) {
      lt = buocPhutLienTuc(lt).tt
      expect(lt.chiSoMoc).toBe(p * BUOC_MOI_PHUT)
      expect(lt.tran.phut).toBe(p)
    }
  })

  it('chiSoMoc của mốc trong lô là số nửa giây TUYỆT ĐỐI, chẵn, tăng dần', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))
    lt = buocPhutLienTuc(lt).tt
    const phut2 = buocPhutLienTuc(lt)

    const cac: number[] = []
    for (let i = 0; i < phut2.lo.soMocDaGhi; i += 1) {
      cac.push(docMoc(phut2.lo, i).chiSoMoc)
    }
    expect(cac[0]).toBe(BUOC_MOI_PHUT)
    expect(cac[cac.length - 1]).toBe(2 * BUOC_MOI_PHUT - 2)
    for (let i = 0; i < cac.length; i += 1) {
      expect(cac[i]! % 2, `mốc thứ ${i}`).toBe(0)
      if (i > 0) expect(cac[i]! - cac[i - 1]!).toBe(2)
    }
  })

  it('mỗi mốc có đúng 26 thực thể, và ba pha bóng được quan sát', () => {
    const phut = buocPhutLienTuc(taoTranLienTuc(cauHinhMau(MA)))
    expect(phut.cacPha).toHaveLength(3)
    for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
      expect(docMoc(phut.lo, i).cacThucThe, `mốc ${i}`).toHaveLength(SO_THUC_THE)
    }
  })

  it('trận đã kết thúc thì trả lô rỗng, không ném lỗi', () => {
    const xong = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(MA)))
    const them = buocPhutLienTuc(xong)
    expect(them.lo.soMocDaGhi).toBe(0)
    expect(them.cacPha).toHaveLength(0)
    expect(them.tt.chiSoMoc).toBe(xong.chiSoMoc)
  })
})

describe('chayHetTranLienTuc có chặn cứng, không vòng lặp vô tận', () => {
  it('chạy hết trận và đồng hồ mốc khớp số phút đã chạy', () => {
    const lt = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(MA)))
    expect(lt.tran.ketThuc).toBe(true)
    expect(lt.chiSoMoc).toBe(lt.tran.phut * BUOC_MOI_PHUT)
    expect(lt.tran.phut).toBeLessThanOrEqual(tongPhutTran(lt.tran) + 2)
  })
})

/*
  DẢI RÚT MỖI MỐC — phép kiểm mà `plan.md` mục 7 đòi, đo trên một trận THẬT.

  Hai mệnh đề, và mệnh đề thứ hai là một cái bẫy CỐ Ý đặt cho chính mình:

  1. Không mốc nào tiêu quá `RUT_MOI_MOC` lần rút. Đây là bất biến thật, và nó
     sẽ bắt đầu có nội dung khi Phase 54 cho chuyển động rút số.

  2. Hôm nay con số ấy đúng bằng **0**, và phép kiểm khẳng định thế. Nghe như
     một phép kiểm rỗng — nó đúng là rỗng, và đó là lý do nó có mặt: khi Phase
     54 làm nó khác 0 thì **dòng này đỏ**, và người sửa buộc phải nhìn lại
     ngưỡng 64 thay vì đi qua một màu xanh không có nghĩa.

  Một ngưỡng không ai canh là một ngưỡng vô dụng; một phép kiểm xanh suốt ba
  phase mà không ai biết nó có cắn hay không thì tệ hơn thế.
*/
describe('dải rút mỗi mốc (plan mục 7, AC-37.5)', () => {
  it('không mốc nào tiêu quá RUT_MOI_MOC lần rút, trên một trận thật', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))
    let soMocDaXem = 0

    for (let p = 0; p < tongPhutTran(lt.tran) + 2 && !lt.tran.ketThuc; p += 1) {
      const phut = buocPhutLienTuc(lt)
      for (const daRut of phut.rutMoiMoc) {
        expect(daRut).toBeLessThanOrEqual(RUT_MOI_MOC)
      }
      soMocDaXem += phut.rutMoiMoc.length
      lt = phut.tt
    }

    // Phép kiểm phải thật sự đi qua mọi mốc của trận, không phải một phút.
    expect(soMocDaXem).toBe(lt.tran.phut * MOC_MOI_PHUT)
    expect(soMocDaXem).toBeGreaterThan(5_000)
  })

  it('và hôm nay con số ấy là 0 — dòng này CỐ Ý đỏ khi Phase 54 đến', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))
    let lonNhat = 0
    for (let p = 0; p < 10; p += 1) {
      const phut = buocPhutLienTuc(lt)
      for (const daRut of phut.rutMoiMoc) lonNhat = Math.max(lonNhat, daRut)
      lt = phut.tt
    }
    expect(
      lonNhat,
      'Chuyển động đã bắt đầu rút số: hãy đo lại dải RUT_MOI_MOC = 64 rồi sửa dòng này',
    ).toBe(0)
  })
})

/*
  AI ĐANG GIỮ BÓNG Ở TỪNG MỐC (AC-37.6) — thứ mà T706 cắm vào mang lại.

  Trước T706, mọi mốc ghi `KHONG_AI_GIU` vì chưa có bố cục thời gian. Nay
  `dienChuoiRaMoc` chia cửa sổ thành bốn pha con, nên trong `bongChet` thì
  không ai giữ, còn ba pha con kia thì người của bên tổ chức giữ.

  Hai phép kiểm chống tầm thường ở đây: (1) phải CÓ mốc có người giữ, nếu
  không thì "không ai giữ ở mọi mốc" cũng xanh; (2) ô người giữ phải nằm đúng
  nửa của bên tổ chức — 0–10 cho nhà, 11–21 cho khách — nếu không thì một
  phép tra lệch ô cũng xanh.
*/
describe('ai đang giữ bóng ở từng mốc (AC-37.6, T706)', () => {
  it('có mốc có người giữ, và có mốc không ai giữ', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))
    let coNguoi = 0
    let khongAi = 0

    for (let p = 0; p < 20; p += 1) {
      const phut = buocPhutLienTuc(lt)
      for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
        const moc = docMoc(phut.lo, i)
        if (moc.nguoiGiu === -1) khongAi += 1
        else coNguoi += 1
      }
      lt = phut.tt
    }

    expect(coNguoi).toBeGreaterThan(0)
    expect(khongAi).toBeGreaterThan(0)
  })

  it('ô người giữ luôn nằm trong nửa của bên tổ chức', () => {
    let lt = taoTranLienTuc(cauHinhMau(MA))

    for (let p = 0; p < 10; p += 1) {
      const phut = buocPhutLienTuc(lt)
      for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
        const moc = docMoc(phut.lo, i)
        if (moc.nguoiGiu === -1) continue
        expect(moc.nguoiGiu, `mốc ${moc.chiSoMoc}`).toBeGreaterThanOrEqual(0)
        expect(moc.nguoiGiu, `mốc ${moc.chiSoMoc}`).toBeLessThan(22)

        // Và ô ấy phải là một người CÓ MẶT trên sân.
        expect(
          moc.cacThucThe[moc.nguoiGiu]!.coMat,
          `ô ${moc.nguoiGiu} ở mốc ${moc.chiSoMoc}`,
        ).toBe(1)
      }
      lt = phut.tt
    }
  })

  it('bố cục bốn pha con phủ kín cửa sổ của từng chuỗi', () => {
    const phut = buocPhutLienTuc(taoTranLienTuc(cauHinhMau(MA)))

    // Ba chuỗi, mỗi chuỗi 20 mốc thường, không lỗ và không trùng.
    expect(phut.lo.soMocDaGhi).toBe(3 * (BUOC_MOI_CHUOI / 2))
    const cac: number[] = []
    for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
      cac.push(docMoc(phut.lo, i).chiSoMoc)
    }
    expect(new Set(cac).size).toBe(cac.length)
    for (let i = 1; i < cac.length; i += 1) {
      expect(cac[i]! - cac[i - 1]!).toBe(2)
    }
  })
})
