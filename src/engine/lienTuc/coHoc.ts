/*
  Cơ học của một cơ thể người (T710, quyết định D123 và D129).

  Module này trả lời đúng một câu ở lát đầu tiên: **một cầu thủ chạy nhanh nhất
  được bao nhiêu**. Các lát sau của Phase 54 thêm kẹp gia tốc, cổng quay và
  tích phân Euler vào cùng file này.

  ⚠️ HÀM DƯỚI ĐÂY KHÔNG ĐỌC SỨC BỀN CỦA CẦU THỦ, VÀ ĐÓ LÀ CHỦ Ý.

  Phương án bị loại ở D129 là `tranRieng = (6,5 + …) × heSo(sucBen)`, cho sàn
  tụt về 3,87 m/s khi một người đã cạn. Hai lý do loại, cả hai đo được:

  - Nó nhập **sức bền × tốc độ** vào một hàm, mà việc ấy là yêu cầu của
    **spec 009**, không phải spec này. Trộn sớm thì spec 009 phải gỡ ra.
  - Sàn 3,87 m/s nằm **dưới** ngưỡng 6 m/s mà **AC-38.8** canh, nên cuối trận
    có thể **không còn mẫu nào** rơi vào vùng AC ấy đo — một AC xanh vì rỗng.
    Sàn 6,4 > 6 bảo đảm **mọi** cầu thủ đều vào được vùng ấy.

  Điều kiện ra của T710 vì thế là một phép grep: file này không được chứa một
  đường nào đọc chỉ số sức bền.
*/

/**
 * Tốc độ tối đa của cầu thủ yếu nhất (chỉ số 1), tính bằng **m/s**.
 *
 * Chọn **6,4** chứ không thấp hơn vì **AC-38.8** chỉ ràng những pha trên
 * **6 m/s**: sàn phải nằm trên ngưỡng ấy thì mọi cầu thủ mới có mặt trong tập
 * mà AC đó đo.
 */
export const TOC_DO_TOI_DA_THAP = 6.4

/**
 * Tốc độ tối đa của cầu thủ nhanh nhất (chỉ số 20), tính bằng **m/s**.
 *
 * Chọn **8,6** chứ không phải 9,0 để chừa lề **4,4%** dưới trần tuyệt đối.
 * Phép kiểm cơ học đo tốc độ bằng `Δquãng / Δt` trên tệp xuất, nên ghim sát
 * trần sẽ làm nó đỏ vì **làm tròn** chứ không vì mô hình sai — nhất là khi
 * lưới mốc dày lên 0,5 giây.
 */
export const TOC_DO_TOI_DA_CAO = 8.6

/**
 * Trần tốc độ tuyệt đối của **AC-38.1**, tính bằng m/s.
 *
 * ⚠️ Đây là **chỗ duy nhất** con số 9 của AC-38.1 tồn tại trong mã nguồn. Mọi
 * phép kẹp và mọi phép kiểm phải đọc hằng số này; viết lại số 9 ở chỗ khác là
 * dựng nguồn sự thật thứ hai, và hai nguồn ấy sẽ lệch nhau ở lần sửa sau.
 */
export const TRAN_TOC_DO_TUYET_DOI = 9

/** Chỉ số cầu thủ chạy từ 1 tới 20; chỉ số chưa điền coi như trung bình. */
const CHI_SO_MIN = 1
const CHI_SO_MAX = 20
const CHI_SO_MAC_DINH = 10

/**
 * Tốc độ tối đa của một cầu thủ theo **chỉ số Tốc độ** của anh ta, bằng m/s.
 *
 * Nội suy tuyến tính từ `TOC_DO_TOI_DA_THAP` ở chỉ số 1 tới
 * `TOC_DO_TOI_DA_CAO` ở chỉ số 20. Chỉ số ngoài dải bị kẹp vào dải; chỉ số
 * chưa điền coi như **10**, cho **7,442 m/s**.
 *
 * Nhận `number | undefined` chứ không nhận hồ sơ cầu thủ: lấy chỉ số từ hồ sơ
 * cần một hàm còn **chưa được export** ở lớp sức mạnh, và export nó chỉ để
 * dùng ở đây là kéo theo một ràng buộc không cần thiết. Khuôn tham số này đã
 * có tiền lệ trong repo nên nó không mở ra hình dạng mới nào.
 *
 * Chỉ số chưa điền là **đường lui an toàn**, không phải trường hợp thường gặp:
 * một cầu thủ thiếu chỉ số đã bị AC-5.7 chặn khỏi đội hình từ trước.
 */
export function tocDoToiDa(chiSoTocDo: number | undefined): number {
  const chiSo = chiSoTocDo ?? CHI_SO_MAC_DINH
  const tiLe =
    (Math.min(Math.max(chiSo, CHI_SO_MIN), CHI_SO_MAX) - CHI_SO_MIN) /
    (CHI_SO_MAX - CHI_SO_MIN)
  return TOC_DO_TOI_DA_THAP + tiLe * (TOC_DO_TOI_DA_CAO - TOC_DO_TOI_DA_THAP)
}
