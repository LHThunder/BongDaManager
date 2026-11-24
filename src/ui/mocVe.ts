import { MOC_MOI_PHUT } from '../engine/lienTuc/moc'

/*
  ====================================================================
  ĐỒNG HỒ VẼ → CHỈ SỐ MỐC (T732, AC-31.4 + AC-37.7).
  ====================================================================

  Lớp vẽ biết **đã trôi bao nhiêu mili giây trong phút trận này** và **một phút
  trận dài bao nhiêu mili giây** ở mức tốc độ đang chọn. Lô mốc của engine liên
  tục có `MOC_MOI_PHUT` mốc cho đúng một phút ấy. Quy đổi giữa hai thứ là **một
  phép chia**, và module này không biết gì hơn thế.

  ⚠️ **KHÔNG có một nhánh nào theo TÊN mức tốc độ ở đây, và đó là cả điểm của
  lát này.** Một nhánh `if` theo **tên** mức trong lớp vẽ là chỗ mà mức thứ sáu —
  hoặc một lần đổi số của mức cũ — sẽ **lặng lẽ** không được xử lý. Mức tốc độ
  vào đây **chỉ** dưới dạng con số `msMoiPhut`, và một phép kiểm quét chính mã
  nguồn file này canh điều đó.

  Hệ quả: thêm hay đổi mức tốc độ **không chạm** module này. Đó là ngược hẳn với
  ca `MS_MOI_PHUT` của spec 005, nơi thêm mức thứ năm tự động mở rộng mấy phép
  kiểm ở hai file khác.
*/

/** Một chỗ trên trục mốc: mốc trước, và phần đã đi tới mốc sau. */
export interface MocVe {
  /** Chỉ số mốc trong phút, trong `[0; soMoc - 1]`. */
  readonly chiSo: number
  /** Phần đã đi từ mốc ấy tới mốc sau, trong `[0; 1)`. */
  readonly phan: number
}

/**
 * Đồng hồ vẽ ở giây thứ mấy của lô mốc.
 *
 * `soMoc` là tham số chứ không đọc thẳng `MOC_MOI_PHUT`, vì **T731** sẽ làm dày
 * cửa sổ tình huống quan trọng lên gấp đôi: lúc ấy một lô có hai mật độ mốc, và
 * một hàm đóng cứng số mốc sẽ sai ở đúng những pha đáng xem nhất.
 */
export function mocVeTaiThoiDiem(
  msTrongPhut: number,
  msMoiPhut: number,
  soMoc: number = MOC_MOI_PHUT,
): MocVe {
  if (soMoc <= 0) return { chiSo: 0, phan: 0 }
  /*
    Một phép chia, và nó là phép duy nhất cần: tỉ lệ đã trôi của phút, nhân số
    mốc. `msMoiPhut` không bao giờ bằng 0 — mức ngắn nhất của bảng là 20 ms — nhưng
    phép chia cho 0 ở lớp vẽ sinh `Infinity` rồi `NaN` toạ độ, nên vẫn chặn.
  */
  const viTri = msMoiPhut <= 0 ? soMoc : (msTrongPhut / msMoiPhut) * soMoc
  if (!Number.isFinite(viTri) || viTri <= 0) return { chiSo: 0, phan: 0 }
  /*
    Quá phút thì đứng ở mốc cuối chứ không chạy tiếp sang lô sau: lô sau chưa
    tồn tại, và đọc quá đuôi lô là đọc số 0 của bộ đệm.
  */
  if (viTri >= soMoc) return { chiSo: soMoc - 1, phan: 0 }
  const chiSo = Math.floor(viTri)
  return { chiSo, phan: viTri - chiSo }
}
