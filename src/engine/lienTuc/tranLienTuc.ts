import {
  buocTiep,
  type CauHinhTran,
  type KetCucPhaV6,
  taoTran,
  tongPhutTran,
  type TrangThaiTran,
} from '../tran'
import { hatGiongDong, RUT_MOI_MOC } from './hatGiong'
import {
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  BUOC_MOI_PHUT,
  laMocThuong,
  SO_THUC_THE,
} from './moc'
import {
  ghiMoc,
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
    tran: { ...tran, hatGiong: hatGiongDong(cauHinh.maTran, 1) },
    maTran: cauHinh.maTran,
    chiSoMoc: 0,
  }
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
    Phát mốc. Hôm nay chỉ phát mốc THƯỜNG (bước chẵn, 1 giây một mốc); mốc lẻ
    của tình huống quan trọng là T731, và nó là quyết định CHỈ Ở ĐẦU RA nên nó
    không dịch một lần rút nào.
  */
  const rutMoiMoc: number[] = []
  const mocDau = ttVao.chiSoMoc
  for (let b = 0; b < BUOC_MOI_PHUT; b += 1) {
    if (!laMocThuong(b)) continue
    const chiSoMoc = mocDau + b

    /*
      Số lần rút dòng cơ học mà mốc này tiêu. Hôm nay là 0 — chuyển động chưa
      tồn tại — và `tranLienTuc.test.ts` khẳng định đúng con số 0 ấy, CỐ Ý: khi
      Phase 54 làm nó khác 0 thì phép kiểm kia đỏ và buộc người sửa nhìn lại
      ngưỡng `RUT_MOI_MOC`. Một ngưỡng không ai canh là một ngưỡng vô dụng.
    */
    const daRut = 0
    if (daRut > RUT_MOI_MOC) {
      throw new Error(
        `mốc ${chiSoMoc} tiêu ${daRut} lần rút, quá dải ${RUT_MOI_MOC}`,
      )
    }
    rutMoiMoc.push(daRut)

    ghiMoc(lo, chiSoMoc, KHONG_AI_GIU, cacThucTheCuaMoc(tranSau))
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
