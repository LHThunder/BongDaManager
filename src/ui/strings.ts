import {
  CHUNG_VI,
  MUC_SAI_VI_TRI_VI,
  TEN_SO_DO_VI,
  DANH_SACH_DOI_VI,
  FORM_DOI_VI,
  TRANG_DOI_VI,
  XOA_CAU_THU_VI,
  CHAN_THUAN_VI,
  SAO_LUU_VI,
  CHON_ANH_VI,
  CHON_MAU_AO_VI,
  BANG_CHI_SO_VI,
  FORM_CAU_THU_VI,
  LUU_TRU_VI,
  TRANG_CHIEN_THUAT_VI,
  SAI_VI_TRI_VI,
  TINH_TRANG_DOI_HINH_VI,
  DOI_SO_DO_VI,
  VAI_TRO_VI,
  CHI_THI_DOI_VI,
  BO_CHIEN_THUAT_VI,
  CHON_CAP_DAU_VI,
  DANG_KY_DOI_HINH_VI,
  LY_DO_KHONG_BAT_DAU_VI,
  TRAN_DAU_VI,
  THAY_NGUOI_VI,
  CAN_THIEP_GIUA_TRAN_VI,
  LICH_SU_VI,
  SAN_2D_VI,
  LY_DO_TU_CHOI_CAN_THIEP_VI,
  BAO_CAO_SAU_TRAN_VI,
  VAO_BAT_GON_VI,
  SO_SANH_TRAN_VI,
  XOA_DOI_VI,
} from './ngonNgu/vi'

/*
  Mọi chữ người dùng nhìn thấy nằm ở đây, bằng tiếng Việt (hiến pháp P8).
  Component không được viết chuỗi hiển thị trực tiếp — như vậy một khái niệm
  chỉ có một cách gọi trên toàn ứng dụng, và không có chỗ nào sót tiếng Anh.
*/

/*
  Không có nhãn "Lưu" nào ở đây, và đó là chủ ý: dữ liệu tự được lưu ngay khi
  thay đổi (AC-4.1), nên một nút tên "Lưu" sẽ nói sai về cách ứng dụng hoạt
  động. Nút trên form được đặt tên theo HÀNH ĐỘNG nó thực hiện.
*/
/*
  `CHUNG` nay lay tu lop ngon ngu (T302).

  Giu lai export o day de 28 file giao dien chua chuyen van bien dich duoc.
  Moi file chuyen sang `useChuoi()` thi bo dan, va khi khoi cuoi cung roi di
  thi dong nay bien mat.
*/
export const CHUNG = CHUNG_VI

export const DANH_SACH_DOI = DANH_SACH_DOI_VI

export const FORM_DOI = FORM_DOI_VI

export const XOA_DOI = XOA_DOI_VI

export const TRANG_DOI = TRANG_DOI_VI

export const XOA_CAU_THU = XOA_CAU_THU_VI

export const CHAN_THUAN = CHAN_THUAN_VI

export const SAO_LUU = SAO_LUU_VI

export function coTep(byte: number): string {
  if (byte < 1024) return `${byte} B`
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`
}

export const CHON_ANH = CHON_ANH_VI

export const CHON_MAU_AO = CHON_MAU_AO_VI

export const BANG_CHI_SO = BANG_CHI_SO_VI

export const FORM_CAU_THU = FORM_CAU_THU_VI

export const LUU_TRU = LUU_TRU_VI

/** Tên hiển thị của chỉ số, lấy từ domain để không khai báo hai lần. */
// ---------------------------------------------------------------------------
// Giai đoạn 2 — chiến thuật
// ---------------------------------------------------------------------------

/*
  Tên hiển thị của sơ đồ trùng với id, vì tên sơ đồ bóng đá vốn là dãy số —
  không có gì để dịch. Bảng này vẫn tồn tại để component không phải đọc id
  thẳng từ `domain`, và để sau này thêm chú thích cho từng sơ đồ thì chỉ sửa
  một chỗ.
*/
export const TEN_SO_DO = TEN_SO_DO_VI

export const TRANG_CHIEN_THUAT = TRANG_CHIEN_THUAT_VI

/** Nhãn chữ cho ba mức sai vị trí — không chỉ dùng màu viền (P9). */
export const MUC_SAI_VI_TRI = MUC_SAI_VI_TRI_VI

export const SAI_VI_TRI = SAI_VI_TRI_VI

export const TINH_TRANG_DOI_HINH = TINH_TRANG_DOI_HINH_VI

export const DOI_SO_DO = DOI_SO_DO_VI

export const VAI_TRO = VAI_TRO_VI

export const CHI_THI_DOI = CHI_THI_DOI_VI

export const BO_CHIEN_THUAT = BO_CHIEN_THUAT_VI

/*
  Câu lỗi nay thuộc lớp ngôn ngữ: `LOI.cau` của `useChuoi()` (T320). Nó là
  chữ người dùng ĐỌC, nên phải theo ngôn ngữ đang chọn như mọi khối khác.
*/

// ---------------------------------------------------------------------------
// Giai đoạn 3 — trận đấu
// ---------------------------------------------------------------------------

export const CHON_CAP_DAU = CHON_CAP_DAU_VI

export const DANG_KY_DOI_HINH = DANG_KY_DOI_HINH_VI

export const LY_DO_KHONG_BAT_DAU = LY_DO_KHONG_BAT_DAU_VI

export const TRAN_DAU = TRAN_DAU_VI

export const THAY_NGUOI = THAY_NGUOI_VI

export const CAN_THIEP_GIUA_TRAN = CAN_THIEP_GIUA_TRAN_VI

/** Câu cho từng lý do can thiệp bị từ chối. */
export const LY_DO_TU_CHOI_CAN_THIEP = LY_DO_TU_CHOI_CAN_THIEP_VI

/** Lịch sử trận đấu (AC-11.7, AC-11.4, AC-4.2). */
export const LICH_SU = LICH_SU_VI

/** Sân 2D dạng điểm (US-10). */
export const SAN_2D = SAN_2D_VI

/** Báo cáo sau trận (AC-11.1 → AC-11.5). */
export const BAO_CAO_SAU_TRAN = BAO_CAO_SAU_TRAN_VI

/** Khối chọn người vào bắt gôn khi khung thành bỏ trống (spec mục 5). */
export const VAO_BAT_GON = VAO_BAT_GON_VI

export const SO_SANH_TRAN = SO_SANH_TRAN_VI
