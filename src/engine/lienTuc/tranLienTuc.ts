import {
  buocTiep,
  type CauHinhTran,
  CHE_DO_MAC_DINH,
  type CheDoMoPhong,
  type KetCucPhaV6,
  taoTran,
  tongPhutTran,
  type TrangThaiTran,
} from '../tran'
import { BUOC_MOI_CHUOI, dienChuoiRaMoc } from './dienPha'
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
  }
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

  for (let i = 0; i < cacPha.length; i += 1) {
    const pha = cacPha[i]!
    const truocKhiGhi = lo.soMocDaGhi
    dienChuoiRaMoc(pha, mocDau + i * BUOC_MOI_CHUOI, lo, oCuaNguoiGiu(pha), coMat)

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
