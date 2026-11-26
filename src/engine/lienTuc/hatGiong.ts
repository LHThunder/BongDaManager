import { hatGiongTuMaTran, nhayRut } from '../rng'

/*
  Ba dòng rút của engine liên tục (T717 của spec 007, quyết định D118).

  Engine liên tục phải rút ngẫu nhiên cho cơ học chuyển động, nhưng nó KHÔNG
  được đụng dãy số của v6 — một lần rút lấn sang là mọi mã trận người dùng đã
  lưu phát lại ra một trận khác (P1, AC-45.7).

  Cách giải: trạng thái của `mulberry32` tiến đúng một phép cộng mỗi lần rút,
  nên cả không gian 2^32 là MỘT vòng duy nhất. Chia vòng ấy thành ba cung cách
  đều `LECH_DONG = 2^30`, và nhảy tới cung nào là một phép nhân (`nhayRut`):

    dòng 0 — v6. KHÔNG ai chạm. `hatGiongDong(ma, 0)` đúng bằng
             `hatGiongTuMaTran(ma)`, nên engine phút không biết chuyện gì xảy ra.
    dòng 1 — kết cục của engine liên tục.
    dòng 2 — cơ học chuyển động. Chỉ dòng này có dải rút cố định mỗi mốc.

  ⚠️ VÌ SAO KHÔNG DÙNG HẬU TỐ CHUỖI. Cách rẻ hơn là
  `hatGiongTuMaTran(ma + '-LIEN-TUC')`, và nó **có phản ví dụ đo được**: với mã
  `5M3AAY65ZN` hạt giống ấy chỉ cách dòng của v6 **569 lần rút**, nên mười số
  đầu của nó là đúng mười số thứ 569–578 của v6. Quét 300.000 mã: 134 mã lệch
  dưới một triệu, 2 mã dưới mười nghìn — trong khi 10 mã fixture có đáy 43,6
  triệu, nên **một phép kiểm chỉ chạy trên fixture sẽ xanh mà sai**.
  `hatGiong.test.ts` giữ phản ví dụ ấy làm một phép kiểm, để không ai "dọn dẹp"
  file này về cách hậu tố.

  Dải rút cố định chỉ cho dòng CƠ HỌC. Dòng kết cục không có dải, vì số lần rút
  mỗi pha bóng **không phải hằng**: `nguoiTaiVung` trả `null` trước khi gọi
  `rng.next()`, nên năm bước gán người tiêu 0 lần rút khi danh sách ứng viên
  rỗng — chuyện xảy ra thật khi thẻ đỏ làm một bên còn ít người.
*/

/** Khoảng cách giữa hai dòng rút, tính bằng số lần rút. */
export const LECH_DONG = 2 ** 30

/**
 * Dải rút cố định của MỘT mốc trên dòng cơ học.
 *
 * Mốc thứ `k` bắt đầu ở `k · RUT_MOI_MOC` lần rút kể từ đầu dòng cơ học, nên
 * mỗi mốc tái lập được một mình (AC-37.5) mà không phải rút qua mọi mốc trước
 * nó. Dải phải ĐỦ RỘNG: một mốc tiêu quá `RUT_MOI_MOC` lần rút sẽ lấn sang dải
 * của mốc sau, và AC-37.5 vỡ trong im lặng. T704 canh điều đó trên một trận
 * thật.
 */
export const RUT_MOI_MOC = 64

/** Dòng rút: 0 là của v6, 1 cho kết cục, 2 cho cơ học. */
export type DongRut = 0 | 1 | 2

/**
 * Hạt giống đầu một dòng rút.
 *
 * `hatGiongDong(ma, 0)` trả về đúng `hatGiongTuMaTran(ma)` — dòng của v6 không
 * dịch một lần rút nào.
 */
export function hatGiongDong(maTran: string, dong: DongRut): number {
  return nhayRut(hatGiongTuMaTran(maTran), dong * LECH_DONG)
}

/**
 * Hạt giống của mốc thứ `chiSoMoc` trên dòng cơ học.
 *
 * `chiSoMoc` là số nửa giây tuyệt đối tính từ đầu trận (mục 0 của plan), nên
 * mốc nào cũng tính được trực tiếp mà không cần chạy các mốc trước.
 */
export function hatGiongMoc(maTran: string, chiSoMoc: number): number {
  return nhayRut(hatGiongDong(maTran, 2), chiSoMoc * RUT_MOI_MOC)
}
