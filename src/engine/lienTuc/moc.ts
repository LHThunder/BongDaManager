import {
  SO_CHUOI_MOI_PHUT,
  tongPhutHiep1,
  tongPhutTran,
  type TrangThaiTran,
} from '../tran'

/*
  Lưới mốc của engine liên tục (T704 của spec 007, quyết định D119, mục 0 của
  plan). Đây là chỗ bốn con số của lưới sống, và chỉ một chỗ.

  BA ĐẠI LƯỢNG KHÁC NHAU, ĐỪNG LẪN:

  • **Bước tích phân** — `BUOC_MOI_PHUT = 120`, tức 0,5 giây một bước, LUÔN
    LUÔN. Engine tính chuyển động ở nhịp này bất kể đầu ra có dày hay không.
  • **Mốc phát ra** — `MOC_MOI_PHUT = 60` ở phần thường, tức 1 giây một mốc
    (phát bước CHẴN). Ở tình huống quan trọng thì phát thêm bước LẺ, thành 0,5
    giây một mốc (AC-37.7).
  • **`chiSoMoc`** — số NỬA GIÂY tuyệt đối tính từ tiếng còi khai cuộc. Nó đánh
    số theo lưới tích phân, không theo lưới phát ra.

  VÌ SAO TÍCH PHÂN 0,5 GIÂY NHƯNG PHÁT 1 GIÂY. Nếu lưới tích phân đổi khi một
  tình huống được làm dày thì hạt giống của mọi mốc sau đó dịch, và AC-37.5
  ("mỗi mốc tái lập được một mình") chết. Tích phân ở bước nhỏ nhất mà spec đòi
  rồi **thưa đầu ra** biến việc làm dày thành một quyết định **chỉ ở đầu ra** —
  không một lần rút nào dịch. Giá đã đo: +11.508 bước thay vì 5.754 một trận,
  tức +13,6 đến +21,1 ms (điều kiện đo ở `plan.md` mục 2.3).
*/

/** Số bước tích phân trong một phút trận. 0,5 giây một bước. */
export const BUOC_MOI_PHUT = 120

/** Số mốc PHÁT RA trong một phút ở phần thường của trận. 1 giây một mốc. */
export const MOC_MOI_PHUT = 60

/**
 * Số mốc phát ra trong một chuỗi bóng ở phần thường.
 *
 * `MOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT === MOC_MOI_PHUT` là một đẳng thức, không
 * phải một sự trùng hợp: nó khoá lưới mốc vào `SO_CHUOI_MOI_PHUT` của v6, nên
 * nếu ai đổi số chuỗi mỗi phút thì phép kiểm ở `moc.test.ts` đỏ ngay.
 */
export const MOC_MOI_CHUOI = 20

/**
 * Số thực thể trong một mốc: 22 cầu thủ + 3 trọng tài + quả bóng.
 *
 * Ba trọng tài CÓ trong dữ liệu khung hình (AC-38.10) nhưng sân 2D **không
 * vẽ** họ ở spec 007 — thêm ba điểm lên sân đụng thẳng ràng buộc "không hai
 * điểm nào chồng khít", vốn đã là ràng buộc chật nhất của lớp vẽ.
 */
export const SO_THUC_THE = 26

/** Chỉ số thực thể: 0–21 cầu thủ, 22–24 trọng tài, 25 quả bóng. */
export const CHI_SO_BONG = 25
export const CHI_SO_TRONG_TAI = 22
export const CHI_SO_TRO_LY_1 = 23
export const CHI_SO_TRO_LY_2 = 24

/** Tổng số bước tích phân của cả trận. */
export function soBuoc(tt: TrangThaiTran): number {
  return tongPhutTran(tt) * BUOC_MOI_PHUT
}

/** Tổng số mốc phát ra ở phần thường (chưa tính phần được làm dày). */
export function soMoc(tt: TrangThaiTran): number {
  return tongPhutTran(tt) * MOC_MOI_PHUT
}

/**
 * `chiSoMoc` của tiếng còi hết hiệp một.
 *
 * Dùng `tongPhutHiep1` của v6 chứ không tự tính lại: bù giờ hiệp một là một
 * trường của trạng thái trận, và hai chỗ tính nó là hai chỗ để trôi khỏi nhau.
 */
export function mocHetHiep1(tt: TrangThaiTran): number {
  return tongPhutHiep1(tt) * BUOC_MOI_PHUT
}

/** Mốc này thuộc hiệp mấy. Biên thuộc về hiệp một, đúng như `hiepCuaPhut`. */
export function hiepCuaMoc(tt: TrangThaiTran, chiSoMoc: number): 1 | 2 {
  return chiSoMoc <= mocHetHiep1(tt) ? 1 : 2
}

/** Phút trận chứa mốc này, đánh số từ 1 đúng như `tt.phut`. */
export function phutCuaMoc(chiSoMoc: number): number {
  return Math.floor(chiSoMoc / BUOC_MOI_PHUT) + 1
}

/** Giây trận của một mốc, tính từ tiếng còi khai cuộc. */
export function giayCuaMoc(chiSoMoc: number): number {
  return chiSoMoc / 2
}

/**
 * Mốc này có được phát ra ở phần THƯỜNG không.
 *
 * Phần thường phát bước chẵn (1 giây một mốc); tình huống quan trọng phát thêm
 * bước lẻ. Việc "có dày hay không" là quyết định của lớp phát, **không** của
 * lưới tích phân — xem khối chú thích đầu file.
 */
export function laMocThuong(chiSoMoc: number): boolean {
  return chiSoMoc % 2 === 0
}

/** Chỉ số chuỗi bóng (0-based) chứa mốc này, trong phút của nó. */
export function chuoiCuaMoc(chiSoMoc: number): number {
  const trongPhut = chiSoMoc % BUOC_MOI_PHUT
  return Math.floor(trongPhut / (BUOC_MOI_PHUT / SO_CHUOI_MOI_PHUT))
}
