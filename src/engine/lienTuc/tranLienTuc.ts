import { RONG_SAN, TAM_X, TAM_Y } from '../hinhHocSan'
import {
  buocCoHoc,
  tachChen,
  TRAN_TOC_DO_TUYET_DOI,
  type Diem,
  type TrangThaiCoHoc,
} from './coHoc'
import { choDungMet, dichNguoiKhongBong, tamVungMet } from './viTriMet'
import {
  buocTiep,
  type CauHinhTran,
  CHE_DO_MAC_DINH,
  type CheDoMoPhong,
  doiHinhTrenSan,
  type KetCucPhaV6,
  taoTran,
  tongPhutTran,
  type TrangThaiTran,
} from '../tran'
import {
  BUOC_MOI_CHUOI,
  dienChuoiRaMoc,
  type TenPhaCon,
} from './dienPha'
import { hatGiongDong, RUT_MOI_MOC } from './hatGiong'
import {
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  BUOC_MOI_PHUT,
  SO_THUC_THE,
} from './moc'
import {
  KHONG_AI_GIU,
  type LoMoc,
  taoLoMoc,
  type ThucTheTaiMoc,
} from './loMoc'

/*
  Vòng ngoài của engine liên tục: MỘT PHÚT một bước (T704, D119 + D136).

  CÁCH NÓ CHẠY, và vì sao không có một dòng luật nào ở đây:

  `taoTranLienTuc` gọi `taoTran` của v6 rồi đặt `hatGiong` về **dòng rút 1**
  (`hatGiongDong(ma, 1)`). `buocPhutLienTuc` gọi thẳng `buocTiep`, kèm một
  **callback quan sát** nhận `KetCucPhaV6` của từng pha bóng.

  Nhờ vậy hai chế độ chạy **cùng một code luật** trên **hai dòng rút khác
  nhau**: mọi luật — huỷ trận (AC-14.5), dòng riêng cho huỷ trận (AC-14.6),
  hết hiệp, kiệt sức, thẻ, thống kê — là đúng code của v6, không phải một bản
  gần giống rồi sẽ trôi. Và vì hai dòng rút khác nhau, một trận cụ thể ra tỉ số
  khác — đúng như **AC-45.3** phát biểu.

  Vì sao đặt hạt giống được: `maTran` chỉ dùng để rút ở **đúng một chỗ** trong
  `tran.ts` (`taoTran`), còn `buocTiep` lấy hạt giống **thuần từ `tt.hatGiong`**.
  Nên bù giờ và dòng mở đầu giống chế độ phút (cùng độ dài trận), còn từ pha
  bóng đầu tiên thì hai chế độ rẽ nhau.

  ⚠️ CHUYỂN ĐỘNG CHƯA CÓ Ở ĐÂY. Vị trí thực thể đến từ Phase 54 (cơ học) và
  T706 (bốn pha con lấp 20 giây). T704 dựng **lưới mốc, lô, đồng hồ và dòng
  rút**; mốc phát ra hôm nay mang toạ độ 0 và chỉ `coMat` là thật. Trường
  `rutMoiMoc` dưới đây là **dụng cụ đo** cho dải rút, cài sẵn từ bây giờ để khi
  chuyển động đến thì ngưỡng 64 có người canh.
*/

/** Engine liên tục mang số phiên bản RIÊNG, không đụng `PHIEN_BAN_ENGINE`. */
export const PHIEN_BAN_ENGINE_LIEN_TUC = 101

/**
 * Chế độ mô phỏng đã sinh ra một trạng thái trận.
 *
 * **Dẫn xuất, không cất.** `TrangThaiTran` đóng băng ở đúng 16 trường (D119),
 * nên chế độ không vào được trạng thái; và cất nó ở store sẽ là nguồn sự thật
 * thứ hai. `phienBanEngine` đã có sẵn trong trạng thái, đã đi vào bản ghi, và
 * **đã là** thứ `lyDoKhongDauLai` so — nên nó là chỗ hợp lẽ nhất để hỏi.
 *
 * Hệ quả cố ý: bản ghi nói ĐÚNG engine nào đã chạy, chứ không nói người dùng
 * đã bấm gì. Hôm nay `batDauTranNgay` còn gọi `taoTran` cho cả hai chế độ, nên
 * một trận người dùng chọn "liên tục" vẫn lưu ra `co-dien` — và đó là sự thật,
 * vì engine liên tục chưa được nối vào giao diện (T733). Nếu thay vào đó ta ghi
 * thẳng lựa chọn của người dùng thì bản ghi sẽ nói "liên tục" trong khi mang số
 * 6, và nó **không đấu lại được** — một bản ghi nói dối về chính nó.
 */
export function cheDoCuaTrangThai(tt: TrangThaiTran): CheDoMoPhong {
  return tt.phienBanEngine === PHIEN_BAN_ENGINE_LIEN_TUC
    ? 'lien-tuc'
    : CHE_DO_MAC_DINH
}

/** Trạng thái trận ở chế độ liên tục: **bọc** trạng thái v6, thêm đồng hồ mốc. */
export interface TrangThaiLienTuc {
  /** Trạng thái v6, nhưng chạy trên dòng rút 1. */
  readonly tran: TrangThaiTran
  readonly maTran: string
  /** Số nửa giây đã trôi từ tiếng còi khai cuộc. */
  readonly chiSoMoc: number
  /**
   * Trạng thái cơ học của **26 thực thể**, mang qua từng phút (T725).
   *
   * Phải sống ở đây chứ không dựng lại mỗi phút: một người đang chạy 7 m/s ở
   * giây cuối của phút 10 vẫn đang chạy 7 m/s ở giây đầu của phút 11. Dựng lại
   * từ 0 mỗi phút là cho cả sân **đứng khựng rồi lao đi** 90 lần một trận, và
   * phép kẹp gia tốc của AC-38.2 sẽ vỡ ở đúng ranh giới phút.
   *
   * KHÔNG vào bản ghi trận: AC-45.4 nói rõ vị trí **không được lưu**, nó sinh
   * lại từ mã trận. Đây là trạng thái lúc chạy, không phải dữ liệu.
   */
  readonly coHoc: readonly TrangThaiCoHoc[]
}

/** Một phút đã mô phỏng: trạng thái sau, lô mốc, và số lần rút mỗi mốc. */
export interface MotPhutLienTuc {
  readonly tt: TrangThaiLienTuc
  readonly lo: LoMoc
  /** Số lần rút dòng CƠ HỌC mà mỗi mốc trong lô đã tiêu. */
  readonly rutMoiMoc: readonly number[]
  /** Kết cục ba pha bóng của phút này, theo đúng thứ tự. */
  readonly cacPha: readonly KetCucPhaV6[]
}

export function taoTranLienTuc(cauHinh: CauHinhTran): TrangThaiLienTuc {
  const tran = taoTran(cauHinh)
  return {
    /*
      ⚠️ `phienBanEngine` phải đổi theo, không chỉ `hatGiong`.

      Bản đầu của T704 chỉ đè hạt giống, nên trạng thái liên tục mang số **6**
      của v6. Mà `phienBanEngineHienTaiCua('lien-tuc')` trả **101** và
      `lyDoKhongDauLai` so bằng `!==` — nên MỌI trận liên tục vừa lưu xong là
      mất ngay nút đấu lại, đúng thứ mà hai số phiên bản riêng sinh ra để
      tránh. Phép kiểm ở `matchRepo.test.ts` đã ĐỎ trước khi dòng này tồn tại.

      Và nó là chỗ DUY NHẤT nói "trạng thái này do engine nào sinh ra":
      `TrangThaiTran` đóng băng ở đúng 16 trường (D119) nên không nhận thêm
      một trường chế độ, còn nhớ chế độ ở store là dựng nguồn sự thật thứ
      hai — rồi hai nguồn ấy lệch nhau mà không ai biết.
    */
    tran: {
      ...tran,
      hatGiong: hatGiongDong(cauHinh.maTran, 1),
      phienBanEngine: PHIEN_BAN_ENGINE_LIEN_TUC,
    },
    maTran: cauHinh.maTran,
    chiSoMoc: 0,
    coHoc: coHocXuatPhat(tran),
  }
}


/*
  ====================================================================
  NỐI CƠ HỌC VÀO VÒNG PHÚT (T725).
  ====================================================================

  Trước lát này, `dienChuoiRaMoc` ghi vào lô bằng `thucTheRong` — 26 ô mang
  `x = y = 0` ở **mọi** mốc. Cả lớp cơ học của Phase 54 (`coHoc.ts`) không có
  một người gọi nào: `grep -rn "buocCoHoc" src/` ngoài chính file nó và test
  của nó ra **rỗng**. Ba thứ đứng trên chỗ nối này — điều kiện ra của **T716**,
  vòng rAF của **T733**, và phép đo của **T742**.

  ⚠️ **Mô hình đích ở đây là TỐI THIỂU có chủ ý** — xem khối chú thích đầu
  `viTriMet.ts`. Hình khối đội hình là **US-40 của spec 009**.
*/

/**
 * Số ô NGƯỜI trong lô: 22, tức 11 mỗi bên.
 *
 * Dẫn xuất từ chỉ số ô trọng tài chứ không gõ tay 22: bố cục 26 ô là quy ước
 * của `moc.ts`, và viết lại một con số của nó ở đây là dựng nguồn sự thật thứ
 * hai — đúng thứ sẽ lệch ở lần sửa bố cục sau.
 */
const SO_NGUOI_TREN_SAN = CHI_SO_TRONG_TAI

/** Bước tích phân, nửa giây — đúng lưới mốc của D119. */
const DT_MOC = 0.5

/**
 * Trần tốc độ của quả bóng, m/s — **tạm, cho tới T720**.
 *
 * AC-38.1 (9 m/s) nói về **cầu thủ**; một quả bóng đi nhanh hơn thế là bóng đá
 * thật. Vật lý bóng — `z`, `vz`, `thoiGianBay = d/v` — là **T720**, nên ở đây
 * quả bóng chỉ cần một trần đủ rộng để nó theo kịp pha bóng.
 */
const TRAN_TOC_DO_BONG = 25

/** Một thực thể đứng yên tại chỗ, hướng nhìn về phía trước sân. */
function dung(x: number, y: number, huong = 0): TrangThaiCoHoc {
  return { x, y, vx: 0, vy: 0, huong }
}

/**
 * Chỗ đứng xuất phát của 26 thực thể, theo sơ đồ hai đội.
 *
 * Ô 0–10 đội nhà, 11–21 đội khách, 22–24 trọng tài, 25 quả bóng — đúng bố cục
 * mà `moc.ts` đặt. Ô của người đã rời sân vẫn có chỗ đứng; `coMat` mới là thứ
 * nói họ có trên sân hay không.
 */
function coHocXuatPhat(tran: TrangThaiTran): readonly TrangThaiCoHoc[] {
  const ra: TrangThaiCoHoc[] = []
  for (const ben of ['nha', 'khach'] as const) {
    const doiHinh = doiHinhTrenSan(tran.ben[ben])
    for (let o = 0; o < 11; o += 1) {
      const v = doiHinh[o]
      const cho = v
        ? choDungMet(v.viTriO, ben)
        : { x: ben === 'nha' ? 1 : DAI_SAN_TAM * 2 - 1, y: TAM_Y }
      ra.push(dung(cho.x, cho.y, ben === 'nha' ? 0 : 180))
    }
  }
  // Trọng tài chính giữa sân; hai trợ lý trên hai đường biên dọc. T716 thay.
  ra.push(dung(TAM_X, TAM_Y))
  ra.push(dung(TAM_X, 0))
  ra.push(dung(TAM_X, RONG_SAN))
  // Quả bóng ở chấm giao bóng.
  ra.push(dung(TAM_X, TAM_Y))
  return ra
}

/** Tâm sân theo trục dọc, để khỏi import thêm một hằng số chỉ dùng một lần. */
const DAI_SAN_TAM = TAM_X

/**
 * Đích của quả bóng ở một pha con.
 *
 * `lenBong` nhắm bước đầu của chuỗi, `chuoi` đi lần lượt qua các bước, còn
 * `ketCuc` và `bongChet` đứng ở vùng kết thúc. Vùng tính theo hướng tấn công
 * của **đội tổ chức pha** — đúng quy ước `dai` của `vung.ts`.
 */
function dichBong(
  pha: KetCucPhaV6,
  phaCon: TenPhaCon,
  phan: number,
): Diem {
  const cac = pha.kq.cacHanhDong
  if (phaCon === 'ketCuc' || phaCon === 'bongChet' || cac.length === 0) {
    return tamVungMet(pha.kq.vungKetThuc, pha.doi)
  }
  if (phaCon === 'lenBong') return tamVungMet(cac[0]!.vung, pha.doi)
  const i = Math.min(cac.length - 1, Math.floor(phan * cac.length))
  return tamVungMet(cac[i]!.vung, pha.doi)
}
/**
 * Ô của người đang giữ bóng trong một pha, theo bố cục 26 ô của `loMoc`.
 *
 * Ô 0–10 là người trên sân của đội NHÀ, 11–21 của đội KHÁCH. Tra trong
 * `pha.benCong.trenSan` — tức đội hình **lúc pha ấy diễn ra** — chứ không
 * trong trạng thái cuối phút: một thẻ đỏ ở chuỗi thứ nhất sẽ làm danh sách
 * cuối phút ngắn hơn, và tra ở đó là tra lệch ô.
 *
 * Không tìm thấy thì trả `KHONG_AI_GIU`: người kết thúc có thể là `null` khi
 * danh sách ứng viên rỗng — `nguoiTaiVung` trả `null` trước khi rút, đúng lý
 * do loại (c) của D118.
 */
function oCuaNguoiGiu(pha: KetCucPhaV6): number {
  const id = pha.gan.nguoiKetThuc
  if (id === null) return KHONG_AI_GIU

  const viTri = pha.benCong.trenSan.indexOf(id)
  if (viTri < 0 || viTri >= 11) return KHONG_AI_GIU
  return pha.doi === 'nha' ? viTri : 11 + viTri
}

/** Thực thể chưa có chuyển động: đứng ở gốc, chỉ `coMat` là thật. */
function thucTheRong(coMat: number): ThucTheTaiMoc {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat }
}

/**
 * 26 thực thể của một mốc.
 *
 * Ô 0–10 là người trên sân của đội nhà, 11–21 của đội khách, 22–24 ba trọng
 * tài, 25 quả bóng. `coMat = 0` ở ô không có ai — sau một thẻ đỏ thì một ô của
 * bên ấy tắt, và đó là thứ duy nhất ở mốc hôm nay mang tin thật.
 */
function cacThucTheCuaMoc(tran: TrangThaiTran): readonly ThucTheTaiMoc[] {
  const ra: ThucTheTaiMoc[] = []
  for (const ben of [tran.ben.nha, tran.ben.khach]) {
    for (let i = 0; i < 11; i += 1) {
      ra.push(thucTheRong(i < ben.trenSan.length ? 1 : 0))
    }
  }
  /*
    Ba trọng tài và quả bóng. Khẳng định chỉ số từng ô thay vì chỉ `push`: nó
    biến bố cục lô thành một bất biến ĐƯỢC KIỂM, nên nếu ai đổi một hằng số ở
    `moc.ts` mà quên chỗ này thì nó ném lỗi ngay thay vì ghi lệch ô.
  */
  for (const chiSo of [
    CHI_SO_TRONG_TAI,
    CHI_SO_TRO_LY_1,
    CHI_SO_TRO_LY_2,
    CHI_SO_BONG,
  ]) {
    if (ra.length !== chiSo) {
      throw new Error(
        `ô thứ ${ra.length} không khớp hằng số ${chiSo} của moc.ts`,
      )
    }
    ra.push(thucTheRong(1))
  }

  if (ra.length !== SO_THUC_THE) {
    throw new Error(`dựng ${ra.length} thực thể, phải đúng ${SO_THUC_THE}`)
  }
  return ra
}

/**
 * Mô phỏng MỘT phút trận và trả lô mốc của phút ấy.
 *
 * Trận đã kết thúc thì trả lô rỗng, đúng khuôn `buocTiep` trả `ttVao` khi
 * `ketThuc` — không ném lỗi, để vòng ngoài khỏi phải kiểm hai lần.
 */
export function buocPhutLienTuc(ttVao: TrangThaiLienTuc): MotPhutLienTuc {
  const lo = taoLoMoc(BUOC_MOI_PHUT)

  if (ttVao.tran.ketThuc) {
    return { tt: ttVao, lo, rutMoiMoc: [], cacPha: [] }
  }

  const cacPha: KetCucPhaV6[] = []
  const tranSau = buocTiep(ttVao.tran, (pha) => {
    cacPha.push(pha)
  })

  /*
    Phát mốc, một cửa sổ chuỗi mỗi lần, qua `dienChuoiRaMoc` của T706.

    Hôm nay chỉ phát mốc THƯỜNG (bước chẵn, 1 giây một mốc); mốc lẻ của tình
    huống quan trọng là T731, và nó là quyết định CHỈ Ở ĐẦU RA nên nó không dịch
    một lần rút nào.
  */
  const rutMoiMoc: number[] = []
  const mocDau = ttVao.chiSoMoc
  const coMat = cacThucTheCuaMoc(tranSau).map((t) => t.coMat)

  /*
    Chỗ đứng theo sơ đồ của 22 ô người, tính MỘT lần cho cả phút.

    Lấy từ đội hình **sau** khi phút ấy chạy xong: một người bị thẻ đỏ giữa
    phút không còn trong danh sách, và ô của anh ta rơi về chỗ đứng cũ — đúng,
    vì `coMat` mới là thứ nói anh ta còn trên sân hay không.
  */
  const choDung: Diem[] = []
  for (const ben of ['nha', 'khach'] as const) {
    const doiHinh = doiHinhTrenSan(tranSau.ben[ben])
    for (let o = 0; o < 11; o += 1) {
      const v = doiHinh[o]
      choDung.push(
        v ? choDungMet(v.viTriO, ben) : { x: TAM_X, y: TAM_Y },
      )
    }
  }

  /** Trạng thái cơ học đang chạy — bước qua từng mốc, mang sang phút sau. */
  let coHoc = [...ttVao.coHoc]

  /**
   * Một mốc: tính đích cho 26 ô, bước cơ học, tách chen, trả thực thể.
   *
   * Thứ tự ba việc là có nghĩa. `tachChen` chạy **sau** phép bước, vì nó sửa
   * chỗ đứng chứ không sửa ý định — đặt nó trước thì phép bước lại dồn người
   * vào nhau ngay trong cùng một mốc. Và nó chỉ chạy trên **ô người**: đẩy quả
   * bóng ra xa chân người là xoá đúng thứ AC-37.6 nói.
   */
  function thucTheTaiMoc(
    pha: KetCucPhaV6,
    phaCon: TenPhaCon,
    nguoiGiu: number,
    phan: number,
  ): readonly ThucTheTaiMoc[] {
    const dBong = dichBong(pha, phaCon, phan)
    const sau: TrangThaiCoHoc[] = coHoc.map((tt, o) => {
      if (o === CHI_SO_BONG) {
        return buocCoHoc(tt, dBong, TRAN_TOC_DO_BONG, DT_MOC)
      }
      if (o >= SO_NGUOI_TREN_SAN) return tt
      const dich =
        o === nguoiGiu
          ? dBong
          : dichNguoiKhongBong(choDung[o] ?? { x: TAM_X, y: TAM_Y }, dBong)
      return buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, DT_MOC)
    })

    const daTach = tachChen(sau.slice(0, SO_NGUOI_TREN_SAN))
    for (let o = 0; o < SO_NGUOI_TREN_SAN; o += 1) {
      const d = daTach[o]!
      sau[o] = { ...sau[o]!, x: d.x, y: d.y }
    }

    coHoc = sau
    return sau.map((t, o) => ({
      x: t.x,
      y: t.y,
      z: 0,
      vx: t.vx,
      vy: t.vy,
      vz: 0,
      huong: t.huong,
      coMat: coMat[o] ?? 1,
    }))
  }

  for (let i = 0; i < cacPha.length; i += 1) {
    const pha = cacPha[i]!
    const truocKhiGhi = lo.soMocDaGhi
    const mocDauChuoi = mocDau + i * BUOC_MOI_CHUOI
    dienChuoiRaMoc(
      pha,
      mocDauChuoi,
      lo,
      oCuaNguoiGiu(pha),
      coMat,
      (chiSoMoc, phaCon, nguoiGiu) =>
        thucTheTaiMoc(
          pha,
          phaCon,
          nguoiGiu,
          (chiSoMoc - mocDauChuoi) / BUOC_MOI_CHUOI,
        ),
    )

    /*
      Số lần rút dòng cơ học mà mỗi mốc vừa ghi đã tiêu. Hôm nay là 0 — chuyển
      động chưa tồn tại — và `tranLienTuc.test.ts` khẳng định đúng con số 0 ấy,
      CỐ Ý: khi Phase 54 làm nó khác 0 thì phép kiểm kia đỏ và buộc người sửa
      nhìn lại ngưỡng `RUT_MOI_MOC`. Một ngưỡng không ai canh là ngưỡng vô dụng.
    */
    for (let m = truocKhiGhi; m < lo.soMocDaGhi; m += 1) {
      const daRut = 0
      if (daRut > RUT_MOI_MOC) {
        throw new Error(
          `mốc thứ ${m} tiêu ${daRut} lần rút, quá dải ${RUT_MOI_MOC}`,
        )
      }
      rutMoiMoc.push(daRut)
    }
  }

  return {
    tt: {
      tran: tranSau,
      maTran: ttVao.maTran,
      chiSoMoc: mocDau + BUOC_MOI_PHUT,
      coHoc,
    },
    lo,
    rutMoiMoc,
    cacPha,
  }
}

/**
 * Chạy hết trận ở chế độ liên tục.
 *
 * Chặn cứng `tongPhutTran + 2`, **dùng nguyên khuôn** `chayHetTran` của v6: một
 * vòng `for` có trần chứ không `while (!ketThuc)`, nên một lỗi trong điều kiện
 * dừng là một trận dài hơn hai phút, không phải một vòng lặp vô tận.
 *
 * KHÔNG giữ lô: lô là đầu ra của từng phút, và giữ cả trận là đúng hình dạng bộ
 * đệm 3,4 MB mà D119 đã loại. Ai cần lô thì gọi `buocPhutLienTuc` từng phút.
 */
export function chayHetTranLienTuc(tt: TrangThaiLienTuc): TrangThaiLienTuc {
  let hienTai = tt
  const chanCung = tongPhutTran(tt.tran) + 2
  for (let i = 0; i < chanCung && !hienTai.tran.ketThuc; i += 1) {
    hienTai = buocPhutLienTuc(hienTai).tt
  }
  return hienTai
}
