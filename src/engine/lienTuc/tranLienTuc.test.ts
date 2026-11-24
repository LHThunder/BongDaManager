import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import {
  cauHinhDauLai,
  chayHetTran,
  dongSuKien,
  PHIEN_BAN_ENGINE,
  taoTran,
  tongPhutTran,
} from '../tran'
import { hatGiongDong, RUT_MOI_MOC } from './hatGiong'
import { docMoc } from './loMoc'
import { BUOC_MOI_CHUOI } from './dienPha'
import { DAI_SAN, RONG_SAN, trongSan } from '../hinhHocSan'
import { dieuKienTuMaTran } from './dieuKien'
import {
  TOC_DO_CHUYEN_DAI_CAO,
  TOC_DO_CHUYEN_NGAN_THAP,
  Z_DANH_DAU_CAO,
  Z_DANH_DAU_THAP,
} from './vatLyBong'
import {
  GIA_TOC_TOI_DA,
  KHOANG_TRONG_TAI,
  LE_DO_TRE_TRONG_TAI,
  LE_DUONG_BIEN_TRO_LY,
  TRAN_TOC_DO_TUYET_DOI,
} from './coHoc'
import {
  BUOC_MOI_PHUT,
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  MOC_MOI_PHUT,
  SO_THUC_THE,
} from './moc'
import {
  buocPhutLienTuc,
  chayHetTranLienTuc,
  cheDoCuaTrangThai,
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

/*
  Trạng thái tự nói nó do engine nào sinh ra (T709 phần 3, D122).

  Ca quan trọng nhất là cái cuối, và nó TRÔNG NHƯ SAI: một cấu hình khai
  `cheDoMoPhong: 'lien-tuc'` đưa cho `taoTran` vẫn đọc ra `'co-dien'`. Đúng như
  vậy. Chế độ của bản ghi phải nói **engine nào đã chạy**, không nói người dùng
  đã bấm gì — vì chính `phienBanEngine` ấy là thứ quyết định trận còn đấu lại
  được hay không. Ghi lựa chọn của người dùng vào thì sẽ có bản ghi mang nhãn
  "liên tục" cùng số 6, và nó **không đấu lại được**: một bản ghi nói dối về
  chính nó.
*/
describe('cheDoCuaTrangThai — dẫn xuất từ phienBanEngine (T709)', () => {
  it('trạng thái liên tục mang 101, khác hẳn số của v6', () => {
    const lt = taoTranLienTuc(cauHinhMau(MA))
    expect(lt.tran.phienBanEngine).toBe(PHIEN_BAN_ENGINE_LIEN_TUC)
    expect(lt.tran.phienBanEngine).not.toBe(PHIEN_BAN_ENGINE)
    expect(cheDoCuaTrangThai(lt.tran)).toBe('lien-tuc')
  })

  it('trạng thái v6 đọc ra co-dien', () => {
    const v6 = taoTran(cauHinhMau(MA))
    expect(v6.phienBanEngine).toBe(PHIEN_BAN_ENGINE)
    expect(cheDoCuaTrangThai(v6)).toBe('co-dien')
  })

  it('số 101 SỐNG SÓT qua cả trận, không bị một bước nào xoá', () => {
    /*
      `buocTiep` dựng trạng thái mới bằng cách trải trạng thái cũ. Nếu một ngày
      nó dựng lại từ đầu thì số phiên bản rơi về 6 giữa chừng, và bản ghi lưu ra
      lúc hết trận sẽ sai — mà mọi phép kiểm khác vẫn xanh.
    */
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const xong = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(ma)))
      expect(xong.tran.ketThuc, ma).toBe(true)
      expect(xong.tran.phienBanEngine, ma).toBe(PHIEN_BAN_ENGINE_LIEN_TUC)
      expect(cheDoCuaTrangThai(xong.tran), ma).toBe('lien-tuc')
    }
  })

  it('đấu lại một trận liên tục ra một cấu hình liên tục', () => {
    const xong = chayHetTranLienTuc(taoTranLienTuc(cauHinhMau(MA)))
    const lai = cauHinhDauLai(
      xong.tran,
      MA,
      cheDoCuaTrangThai(xong.tran),
    )
    expect(lai.cheDoMoPhong).toBe('lien-tuc')

    // Và một trận cổ điển vẫn ra cấu hình cổ điển — khoá không lan ra.
    const coDien = chayHetTran(taoTran(cauHinhMau(MA)))
    expect(
      cauHinhDauLai(coDien, MA, cheDoCuaTrangThai(coDien)).cheDoMoPhong,
    ).toBe('co-dien')
  })

  it('BẪY: cấu hình khai liên tục mà chạy bằng taoTran vẫn đọc ra co-dien', () => {
    /*
      Hôm nay `batDauTranNgay` gọi `taoTran` cho CẢ HAI chế độ — engine liên tục
      chưa được nối vào giao diện (T733). Nên một trận người dùng bấm "liên tục"
      thật sự chạy bằng v6, và bản ghi phải nói đúng điều đó.

      Ca này sẽ đổi vế khi T733 đến. Lúc ấy nó là chỗ nhắc rằng đường nối đã xong.
    */
    const tt = taoTran({
      ...cauHinhMau(MA),
      cheDoMoPhong: 'lien-tuc',
    })
    expect(cheDoCuaTrangThai(tt)).toBe('co-dien')
  })
})

/*
  Lô mốc mang toạ độ THẬT (T725).

  Trước lát này mọi ô mang `x = y = 0` ở mọi mốc, và cả lớp cơ học của Phase 54
  không có một người gọi nào. Bốn khẳng định dưới đây là điều kiện ra của T725.

  ⚠️ **Δt giữa hai mốc ĐÃ GHI là 1 giây, không phải 0,5.** Vòng tích phân chạy
  120 bước mỗi phút nhưng `laMocThuong` chỉ ghi 60 — mốc lẻ của tình huống quan
  trọng là T731. Chia cho 0,5 là đọc ra gia tốc **gấp đôi** sự thật; suýt nữa
  tôi báo 7,33 m/s² trong khi con số thật là 3,66.
*/
describe('lô mốc mang toạ độ thật (T725)', () => {
  const SO_MA_DO = 10
  const DT_GIUA_HAI_MOC = 1

  /*
    ⚠️ Lề của phép so phải cỡ **một ULP của Float32**, không phải 1e-9.

    `oLieu` của lô mốc là `Float32Array`, và khoảng cách giữa hai số float32
    liền nhau quanh 9 là **7,63e-7**. Engine kẹp tốc độ đúng 9 trong float64,
    nhưng ghi ra rồi đọc lại thì nó thành **9,000000508** — đo được. Dùng lề
    1e-9 ở đây là đỏ vì **chỗ lưu**, không vì mô hình sai.

    Đây cũng là lý do `loMoc.ts` dặn engine **không bao giờ đọc lại vận tốc từ
    lô**: trạng thái cơ học sống trong float64 ở `TrangThaiLienTuc`, lô chỉ là
    đầu ra. Đọc lại là tích luỹ sai số float32 qua 11.400 bước một trận.
  */
  const LE_FLOAT32 = 1e-6

  it('10 mã trận: không ô nào ở gốc, không ai ra ngoài sân, không ai vượt trần',
    () => {
      let oCoMatMaOGoc = 0
      let oNgoaiSan = 0
      let tocMax = 0
      let giaTocMax = 0
      let soMoc = 0
      let soODaDo = 0

      for (const ma of MA_TRAN_CO_DINH) {
        let lt = taoTranLienTuc({
          ...cauHinhMau(ma),
          cheDoMoPhong: 'lien-tuc',
        })
        const vanTocTruoc = new Map<number, { vx: number; vy: number }>()

        for (let p = 0; p < tongPhutTran(lt.tran) + 2 && !lt.tran.ketThuc; p += 1) {
          const phut = buocPhutLienTuc(lt)
          for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
            const moc = docMoc(phut.lo, m)
            if (!moc) continue
            soMoc += 1
            moc.cacThucThe.forEach((t, o) => {
              soODaDo += 1
              if (t.coMat === 0) return
              if (t.x === 0 && t.y === 0) oCoMatMaOGoc += 1
              if (!trongSan(t.x, t.y)) oNgoaiSan += 1
              if (o >= CHI_SO_TRONG_TAI) return
              tocMax = Math.max(tocMax, Math.hypot(t.vx, t.vy))
              const tr = vanTocTruoc.get(o)
              if (tr) {
                giaTocMax = Math.max(
                  giaTocMax,
                  Math.hypot(t.vx - tr.vx, t.vy - tr.vy) / DT_GIUA_HAI_MOC,
                )
              }
              vanTocTruoc.set(o, { vx: t.vx, vy: t.vy })
            })
          }
          lt = phut.tt
        }
      }

      // (a) Không ô nào CÓ MẶT mà còn nằm ở gốc toạ độ.
      expect(oCoMatMaOGoc, 'ô có mặt mà x = y = 0').toBe(0)
      // (b) Mọi ô có mặt đều ở trong sân.
      expect(oNgoaiSan, 'ô có mặt mà ra ngoài sân').toBe(0)
      // (c) và (d) — trần của AC-38.1 và AC-38.2, chỉ cho ô NGƯỜI.
      expect(tocMax, 'tốc độ lớn nhất của người').toBeLessThanOrEqual(
        TRAN_TOC_DO_TUYET_DOI + LE_FLOAT32,
      )
      expect(giaTocMax, 'gia tốc lớn nhất của người').toBeLessThanOrEqual(
        8 + LE_FLOAT32,
      )

      /*
        ⚠️ CHỐNG RỖNG, và ở task này nó là khẳng định quan trọng nhất: nếu lô
        trống thì cả ba khẳng định trên xanh mà không chứng minh gì — đúng trạng
        thái trước T725, nơi mọi ô mang 0 và không ai gọi lớp cơ học.
      */
      expect(soMoc, 'số mốc đã đọc').toBeGreaterThan(SO_MA_DO * 5_000)
      expect(soODaDo, 'số ô đã đo').toBeGreaterThan(SO_MA_DO * 100_000)
      expect(tocMax, 'phải có người thật sự chạy').toBeGreaterThan(5)
    },
  )
})

/*
  ====================================================================
  AC-38.10 TRÊN MỘT TRẬN THẬT — mệnh đề (d), (c) và "không teleport" (T716).
  ====================================================================

  Ba mệnh đề đầu của AC-38.10 là tính chất của một hàm thuần và được canh ở
  `coHoc.test.ts`. Khối này canh những thứ **chỉ thấy được khi trận chạy**:

    - **(d)** khoảng cách thật trọng tài–bóng lệch khỏi 25 m không quá 20 m;
    - **(c)** độ trễ của hai trợ lý so với hậu vệ cuối cùng, nêu bằng số;
    - ba điểm ấy **không teleport** — gia tốc trong trần của AC-38.2.

  ⚠️ **20 mã, không 10.** `tasks.md` của T716 đòi "trên 20 mã"; `MA_TRAN_CO_DINH`
  chỉ có 10, nên 10 mã còn lại là **mã đảo ngược** của chúng — vẫn 10 ký tự
  cùng bộ chữ, và quan trọng hơn: **vẫn tất định**.

  ⚠️ **Δt giữa hai mốc ĐÃ GHI là 1 giây**, không phải 0,5 — `laMocThuong` chỉ
  ghi 60 trong 120 bước tích phân mỗi phút. Chia cho 0,5 là đọc ra gia tốc gấp
  đôi sự thật, đúng chỗ T725 suýt báo sai.
*/
const HAI_MUOI_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => [...ma].reverse().join('')),
]

/** Sai số của mệnh đề (c), nêu bằng số — đo được 13,31 m, nêu 14 m. */
const LECH_TRO_LY_TOI_DA = 14

describe('AC-38.10 trên trận thật — ba điểm trọng tài (T716)', () => {
  const DT_GIUA_HAI_MOC = 1

  it('20 mã: (d) ≤ 20 m, (c) ≤ 14 m, và ba điểm không teleport', () => {
    let soMoc = 0
    let doTreLonNhat = 0
    let lechTroLyLonNhat = 0
    let giaTocLonNhat = 0
    let soMocCoBongXa = 0

    for (const ma of HAI_MUOI_MA) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      const vanTocTruoc = new Map<number, { vx: number; vy: number }>()

      for (let p = 0; p < tongPhutTran(lt.tran) + 2 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
          const moc = docMoc(phut.lo, m)
          if (!moc) continue
          soMoc += 1

          const bong = moc.cacThucThe[CHI_SO_BONG]!
          const trongTai = moc.cacThucThe[CHI_SO_TRONG_TAI]!
          const d = Math.hypot(trongTai.x - bong.x, trongTai.y - bong.y)
          doTreLonNhat = Math.max(doTreLonNhat, Math.abs(d - KHOANG_TRONG_TAI))
          if (d > KHOANG_TRONG_TAI) soMocCoBongXa += 1

          /*
            Hậu vệ **thứ hai** từ dưới lên, vì người sâu nhất là thủ môn — đúng
            đường việt vị của bóng đá thật, và đúng thứ `hangThuCuoiCua` lấy.
          */
          const xNha = moc.cacThucThe
            .slice(0, 11)
            .map((t) => t.x)
            .sort((a, b) => a - b)
          const xKhach = moc.cacThucThe
            .slice(11, 22)
            .map((t) => t.x)
            .sort((a, b) => b - a)
          lechTroLyLonNhat = Math.max(
            lechTroLyLonNhat,
            Math.abs(moc.cacThucThe[CHI_SO_TRO_LY_1]!.x - (xNha[1] ?? 0)),
            Math.abs(moc.cacThucThe[CHI_SO_TRO_LY_2]!.x - (xKhach[1] ?? 0)),
          )

          for (const o of [CHI_SO_TRONG_TAI, CHI_SO_TRO_LY_1, CHI_SO_TRO_LY_2]) {
            const t = moc.cacThucThe[o]!
            const truoc = vanTocTruoc.get(o)
            if (truoc) {
              giaTocLonNhat = Math.max(
                giaTocLonNhat,
                Math.hypot(t.vx - truoc.vx, t.vy - truoc.vy) / DT_GIUA_HAI_MOC,
              )
            }
            vanTocTruoc.set(o, { vx: t.vx, vy: t.vy })
          }
        }
        lt = phut.tt
      }
    }

    // (d) — con số người dùng chốt ngày 2026-11-24.
    expect(doTreLonNhat, 'độ trễ lớn nhất, mét').toBeLessThanOrEqual(
      LE_DO_TRE_TRONG_TAI,
    )
    // (c) — sai số nêu bằng số.
    expect(lechTroLyLonNhat, 'trợ lý lệch lớn nhất, mét').toBeLessThanOrEqual(
      LECH_TRO_LY_TOI_DA,
    )
    /*
      Không teleport. Trần lấy **gia tốc tăng tốc** của chính lớp cơ học chứ
      không gõ 6 tay: ba điểm trọng tài đi qua CHÍNH `buocCoHoc`, nên trần của
      chúng là trần của mọi người.
    */
    expect(giaTocLonNhat, 'gia tốc lớn nhất, m/s²').toBeLessThanOrEqual(
      GIA_TOC_TOI_DA + 1e-6,
    )

    /*
      ⚠️ CHỐNG RỖNG, ba lớp. Không có chúng thì cả ba khẳng định trên xanh trên
      một lô trống, đúng trạng thái trước T716 khi ba ô này mang (0, 0).
    */
    expect(soMoc, 'số mốc đã đọc').toBeGreaterThan(100_000)
    expect(doTreLonNhat, 'phải có độ trễ THẬT, không đứng yên').toBeGreaterThan(1)
    expect(soMocCoBongXa, 'số mốc trọng tài ở xa hơn 25 m').toBeGreaterThan(
      10_000,
    )
  })

  /*
    Hai trợ lý chạy trên hai đường biên dọc, lùi vào trong `LE_DUONG_BIEN_TRO_LY`
    mét. Lùi vào chứ không đứng đúng trên biên: `buocCoHoc` xoay vector vận tốc
    ở cổng quay mà giữ nguyên độ lớn, nên một trợ lý đổi chiều sẽ có thành phần
    vận tốc vuông góc với biên trong vài bước — và nó mang ô ấy **ra ngoài sân**,
    đo được 292 mốc như thế trước khi có lề này.
  */
  it('và hai trợ lý ở lại trên hai đường biên dọc của mình', () => {
    let soMoc = 0
    let lechBienLonNhat = 0
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
          const moc = docMoc(phut.lo, m)
          if (!moc) continue
          soMoc += 1
          const ar1 = moc.cacThucThe[CHI_SO_TRO_LY_1]!
          const ar2 = moc.cacThucThe[CHI_SO_TRO_LY_2]!
          expect(trongSan(ar1.x, ar1.y)).toBe(true)
          expect(trongSan(ar2.x, ar2.y)).toBe(true)
          lechBienLonNhat = Math.max(
            lechBienLonNhat,
            Math.abs(ar1.y - LE_DUONG_BIEN_TRO_LY),
            Math.abs(ar2.y - (RONG_SAN - LE_DUONG_BIEN_TRO_LY)),
          )
        }
        lt = phut.tt
      }
    }
    expect(lechBienLonNhat, 'trợ lý rời biên dọc, mét').toBeLessThan(
      LE_DUONG_BIEN_TRO_LY,
    )
    expect(soMoc, 'số mốc đã đọc').toBeGreaterThan(15_000)
  })
})

/*
  ====================================================================
  QUẢ BÓNG TRONG LÔ MỐC ĐI THEO VẬT LÝ CỦA NÓ (T726, AC-38.5 + AC-38.6).
  ====================================================================

  Trước lát này ô bóng bước qua `buocCoHoc` và bị kẹp **9 m/s**, còn cột `z`/`vz`
  là **0 ở mọi mốc**. Khối này canh bốn điều mà chỉ thấy được khi trận chạy:

    - tốc độ quả bóng nằm trong dải của **AC-38.6**, và **không đường chuyền nào
      dưới sàn 12 m/s** — đúng món nợ mà **T706** ghi là điều kiện ra của T720;
    - `z` **thật sự** lớn hơn 0 ở các quả tạt, và rơi trong dải đánh đầu;
    - quả bóng **không teleport**: giữa hai mốc đã ghi nó đi không quá
      `TOC_DO_CHUYEN_DAI_CAO × 1 giây`;
    - và điều kiện trận **mang theo** đúng thứ mã trận sinh ra.
*/
/**
 * Lề so sánh **trên lô mốc**, quanh giá trị `v` — `soUlp` bước float32.
 *
 * 🐞 **Hằng số `LE_FLOAT32 = 1e-6` gõ tay của T725 KHÔNG đủ ở đây, và phép kiểm
 * đã đỏ đúng vì thế.** Bước float32 không phải một con số cố định mà **tỉ lệ
 * với giá trị**: quanh 9 nó là 9,5e-7 (nên 1e-6 vừa đủ), nhưng quanh 30 nó là
 * 1,9e-6 và quanh 105 là 7,6e-6. Một khoảng cách dựng từ hai hiệu toạ độ còn
 * cộng dồn vài bước nữa — đo được **5,1e-6** ở phép so quãng nhảy.
 *
 * Nên lề ở đây **dẫn xuất** từ chính giá trị đang so, không gõ tay. Nó vẫn chặt
 * tới mức vô hại: một vi phạm thật của những mệnh đề này tính bằng **mét**, còn
 * lề này cỡ **một phần trăm milimét**.
 */
function leLo(v: number, soUlp = 4): number {
  return Math.abs(v) * 2 ** -23 * soUlp
}

describe('quả bóng đi theo vật lý của nó (T726)', () => {
  it('10 mã: tốc độ bóng trong dải AC-38.6, và không pha nào dưới sàn 12 m/s', () => {
    let soMoc = 0
    let soMocBongChay = 0
    let soMocReBong = 0
    let vMax = 0
    const duoiSan: number[] = []

    for (const ma of MA_TRAN_CO_DINH) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      for (let p = 0; p < tongPhutTran(lt.tran) + 2 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
          const moc = docMoc(phut.lo, m)
          if (!moc) continue
          soMoc += 1
          const b = moc.cacThucThe[CHI_SO_BONG]!
          const v = Math.hypot(b.vx, b.vy)
          vMax = Math.max(vMax, v)
          if (v <= 0.01) continue
          soMocBongChay += 1
          /*
            Hai lớp tốc độ, và chỉ hai: quả bóng **trong chân người dẫn** đi
            đúng tốc độ NGƯỜI, còn quả bóng **được đánh đi** nằm trong dải của
            AC-38.6. Một con số nằm giữa hai lớp ấy là một lỗi.
          */
          if (Math.abs(v - TRAN_TOC_DO_TUYET_DOI) < leLo(TRAN_TOC_DO_TUYET_DOI)) {
            soMocReBong += 1
            continue
          }
          if (v < TOC_DO_CHUYEN_NGAN_THAP - leLo(TOC_DO_CHUYEN_NGAN_THAP)) {
            duoiSan.push(v)
          }
          expect(v, `mốc ${m}`).toBeLessThanOrEqual(
            TOC_DO_CHUYEN_DAI_CAO + leLo(TOC_DO_CHUYEN_DAI_CAO),
          )
        }
        lt = phut.tt
      }
    }

    // ⚠️ Món nợ của T706, trả ở đây: không một đường bóng ĐƯỢC ĐÁNH nào dưới sàn.
    expect(duoiSan, 'các tốc độ dưới sàn 12 m/s').toEqual([])
    // Và trần của AC-38.6 thật sự được chạm tới, không phải chỉ không bị vượt.
    expect(vMax, 'tốc độ bóng lớn nhất').toBeCloseTo(TOC_DO_CHUYEN_DAI_CAO, 1)

    /*
      ⚠️ CHỐNG RỖNG ba lớp. Không có chúng thì một quả bóng **đứng im cả trận**
      cũng xanh mọi mệnh đề trên — đúng trạng thái trước T726, nơi ô bóng mang
      0 ở mọi mốc.
    */
    expect(soMoc, 'số mốc đã đọc').toBeGreaterThan(50_000)
    expect(soMocBongChay, 'số mốc bóng đang chạy').toBeGreaterThan(5_000)
    expect(soMocReBong, 'số mốc bóng trong chân người dẫn').toBeGreaterThan(100)
  })

  it('và quả bóng KHÔNG teleport: mỗi giây đi không quá 30 m', () => {
    let nhayLonNhat = 0
    let soBo = 0
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      let truoc: { x: number; y: number } | null = null
      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
          const moc = docMoc(phut.lo, m)
          if (!moc) continue
          const b = moc.cacThucThe[CHI_SO_BONG]!
          if (truoc) {
            nhayLonNhat = Math.max(
              nhayLonNhat,
              Math.hypot(b.x - truoc.x, b.y - truoc.y),
            )
            soBo += 1
          }
          truoc = { x: b.x, y: b.y }
        }
        lt = phut.tt
      }
    }
    /*
      Trần là `tốc độ lớn nhất × Δt`, và Δt giữa hai mốc ĐÃ GHI là **1 giây**
      chứ không phải 0,5 — `laMocThuong` chỉ ghi 60 trong 120 bước mỗi phút.
    */
    expect(nhayLonNhat, 'bóng nhảy xa nhất giữa hai mốc, mét').toBeLessThanOrEqual(
      TOC_DO_CHUYEN_DAI_CAO + leLo(DAI_SAN),
    )
    expect(soBo, 'số cặp mốc đã so').toBeGreaterThan(25_000)
  })

  it('quả tạt CÓ độ cao thật, và nó rơi trong dải đánh đầu', () => {
    let soMocCoZ = 0
    let soMocTrongDai = 0
    let zLonNhat = 0
    let soMocAm = 0
    for (const ma of MA_TRAN_CO_DINH) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let m = 0; m < MOC_MOI_PHUT; m += 1) {
          const moc = docMoc(phut.lo, m)
          if (!moc) continue
          const z = moc.cacThucThe[CHI_SO_BONG]!.z
          if (z < 0) soMocAm += 1
          if (z > 0) soMocCoZ += 1
          if (z >= Z_DANH_DAU_THAP && z <= Z_DANH_DAU_CAO) soMocTrongDai += 1
          zLonNhat = Math.max(zLonNhat, z)
          // Chỉ ô BÓNG có độ cao; 25 ô còn lại là người, và người ở trên mặt đất.
          moc.cacThucThe.forEach((t, o) => {
            if (o !== CHI_SO_BONG) expect(t.z, `ô ${o}`).toBe(0)
          })
        }
        lt = phut.tt
      }
    }
    expect(soMocAm, 'mốc có z âm').toBe(0)
    /*
      ⚠️ CHỐNG RỖNG, và ở đây nó là mệnh đề quan trọng nhất: `z ≥ 0` xanh y hệt
      trên một lô mà mọi `z` đều bằng 0 — tức đúng trạng thái trước T726.
    */
    expect(soMocCoZ, 'số mốc quả bóng ở trên không').toBeGreaterThan(100)
    expect(soMocTrongDai, 'số mốc bóng ở tầm đánh đầu').toBeGreaterThan(50)
    // Và không quả tạt nào bay cao như một quả phát bóng của thủ môn.
    expect(zLonNhat, 'độ cao lớn nhất, mét').toBeLessThan(10)
  })

  it('điều kiện trận mang theo đúng thứ mã trận sinh ra, và sống qua từng phút', () => {
    const ma = MA_TRAN_CO_DINH[0]!
    let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
    expect(lt.dieuKien).toEqual(dieuKienTuMaTran(ma))
    for (let p = 0; p < 5; p += 1) {
      lt = buocPhutLienTuc(lt).tt
      expect(lt.dieuKien, `phút ${p}`).toEqual(dieuKienTuMaTran(ma))
    }
  })
})
