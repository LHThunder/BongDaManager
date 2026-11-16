import { laChiSoHopLe } from '../domain/attributes'
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
  BAO_CAO_SAU_TRAN_VI,
  VAO_BAT_GON_VI,
  SO_SANH_TRAN_VI,
  XOA_DOI_VI,
} from './ngonNgu/vi'
import type { AttributeId, GkAttributeId } from '../domain/types'
import type { LoiUngDung } from '../services/errors'

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

/**
 * Dịch một lỗi của lớp services thành câu tiếng Việt nói rõ chuyện gì xảy ra
 * và cần làm gì (hiến pháp mục 4, phần Xử lý lỗi).
 */
export function cauLoi(loi: LoiUngDung,
  nhanChiSo?: (id: AttributeId | GkAttributeId) => string,
): string {
  switch (loi.ma) {
    case 'EmptyName':
      return 'Tên đội không được để trống.'
    case 'NotFound':
      return 'Không tìm thấy dữ liệu này nữa. Có thể nó đã bị xoá ở nơi khác.'
    case 'DuplicateShirtNumber':
      return `Số áo ${loi.chiTiet.giaTri ?? ''} đã có cầu thủ khác trong đội dùng. Hãy chọn số khác.`.trim()
    case 'InvalidAttributeValue':
      /*
        `truong` nay là **mã chỉ số**, không còn là tên tiếng Việt (D76).
        Gọi kèm `nhanChiSo` thì câu nêu đúng tên; không kèm thì câu vẫn
        đúng nghĩa mà không in mã thô ra cho người dùng đọc.
      */
      return nhanChiSo && loi.chiTiet.truong && laChiSoHopLe(loi.chiTiet.truong)
        ? `Chỉ số ${nhanChiSo(loi.chiTiet.truong)} phải là số nguyên từ 1 đến 20.`
        : 'Chỉ số này phải là số nguyên từ 1 đến 20.'
    case 'InvalidPositions':
      return 'Thủ môn dùng bộ chỉ số riêng nên không kiêm vị trí sân. Hãy chọn Thủ môn một mình, hoặc chỉ chọn các vị trí sân.'
    case 'NotAnImage':
      return 'Tệp bạn chọn không phải ảnh. Hãy chọn tệp ảnh (JPG, PNG hoặc WebP).'
    case 'DecodeFailed':
      return 'Không đọc được ảnh này, có thể tệp đã hỏng. Hãy thử một ảnh khác.'
    case 'NotJson':
      return 'Tệp này không phải tệp sao lưu của ứng dụng. Hãy chọn tệp đã xuất ra từ đây.'
    case 'SchemaInvalid':
      return `Tệp sao lưu sai định dạng${loi.chiTiet.duongDan ? ` ở phần "${loi.chiTiet.duongDan}"` : ''}. Dữ liệu hiện có của bạn không bị thay đổi.`
    case 'VersionTooNew':
      return 'Tệp này được xuất từ một bản ứng dụng mới hơn bản bạn đang dùng, nên không đọc được.'
    case 'QuotaExceeded':
      return `${LUU_TRU.canhBaoChuaLuu} ${LUU_TRU.goiYXuatTep}`
    case 'StorageUnavailable':
      return 'Không mở được bộ lưu trữ của trình duyệt. Hãy thử tải lại trang.'
    case 'InvalidColor':
      return 'Mã màu không hợp lệ. Hãy chọn lại màu áo.'
    case 'InvalidTactic':
      return `Không lưu được bộ chiến thuật${LY_DO_CHIEN_THUAT_SAI[String(loi.chiTiet.truong)] ?? ''}. Chiến thuật đang lưu của bạn không bị thay đổi.`
  }
}

/** Mệnh đề nêu rõ bộ chiến thuật sai ở đâu, ghép vào câu `InvalidTactic`. */
const LY_DO_CHIEN_THUAT_SAI: Readonly<Record<string, string>> = {
  'so-o': ' vì số ô không khớp với sơ đồ',
  'slot-la': ' vì có ô không thuộc sơ đồ này',
  'vai-tro-khong-phu-hop': ' vì có vai trò không dùng được cho vị trí của ô',
  'cau-thu-khac-doi': ' vì có ô xếp cầu thủ không thuộc đội này',
  'cau-thu-trung-o': ' vì một cầu thủ đang được xếp vào hai ô',
  'thieu-chi-thi': ' vì thiếu một chỉ thị toàn đội',
  'bo-cua-doi-khac': ' vì bộ này thuộc đội khác',
  ten: ' khi chưa đặt tên cho bộ',
}

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
export const LY_DO_TU_CHOI_CAN_THIEP: Readonly<Record<string, string>> = {
  'tran-da-ket-thuc': 'Trận đã kết thúc, không can thiệp được nữa.',
  'khong-phai-doi-cua-ban': 'Bạn chỉ can thiệp được vào đội của mình.',
  'het-luot-thay': 'Đã hết lượt thay người.',
  'cau-thu-khong-tren-san': 'Cầu thủ này không có trên sân.',
  'cau-thu-khong-trong-du-bi': 'Cầu thủ này không nằm trong danh sách dự bị.',
  'da-nhan-the-do': 'Cầu thủ này đã nhận thẻ đỏ.',
  'o-khong-ton-tai': 'Ô này không thuộc sơ đồ đang dùng.',
  'vai-tro-khong-phu-hop': 'Vai trò không dùng được cho vị trí của ô.',
  'khung-thanh-da-co-thu-mon': 'Khung thành đã có thủ môn thực thụ.',
  'cau-thu-da-bat-gon': 'Cầu thủ này đang bắt gôn rồi.',
}

/** Lịch sử trận đấu (AC-11.7, AC-11.4, AC-4.2). */
export const LICH_SU = LICH_SU_VI

/** Sân 2D dạng điểm (US-10). */
export const SAN_2D = {
  tieuDe: 'Sân đấu',
  an: 'Ẩn sân',
  hien: 'Hiện sân',
  moTaSan: (nha: string, khach: string) =>
    `Sân 2D: ${nha} đá từ trái sang phải, ${khach} đá từ phải sang trái.`,
  /** Nhãn cho từng điểm tròn, để trình đọc màn hình đọc được (P9). */
  moTaDiem: (
    ten: string,
    soAo: number | null,
    viTri: string,
    tenDoi: string,
    thamGia: boolean,
  ) => {
    const phan = [ten]
    if (soAo !== null) phan.push(`số áo ${soAo}`)
    if (viTri) phan.push(viTri)
    phan.push(tenDoi)
    if (thamGia) phan.push('đang tham gia tình huống')
    return phan.join(', ')
  },
  /** Dấu chữ cho người đang tham gia — không chỉ dựa vào màu (P9, D42). */
  dauThamGia: '▲',
  anKhiChayHet:
    'Sân tạm nghỉ trong lúc chạy hết trận, rồi vẽ lại ở phút cuối.',
} as const

/** Báo cáo sau trận (AC-11.1 → AC-11.5). */
export const BAO_CAO_SAU_TRAN = BAO_CAO_SAU_TRAN_VI

/** Khối chọn người vào bắt gôn khi khung thành bỏ trống (spec mục 5). */
export const VAO_BAT_GON = VAO_BAT_GON_VI

export const SO_SANH_TRAN = SO_SANH_TRAN_VI
