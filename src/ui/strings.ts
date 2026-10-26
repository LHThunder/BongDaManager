import { tenChiSo } from '../domain/attributes'
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
export const CHUNG = {
  tenUngDung: 'Quản lý đội bóng',
  huy: 'Huỷ',
  xoa: 'Xoá',
  dong: 'Đóng',
  suaTen: 'Sửa tên',
  quayLai: 'Quay lại',
  tiepTuc: 'Tiếp tục',
  dangTai: 'Đang tải…',
} as const

export const DANH_SACH_DOI = {
  tieuDe: 'Các đội của tôi',
  trongTieuDe: 'Chưa có đội nào',
  trongMoTa:
    'Hãy tạo đội đầu tiên: đặt tên, chọn màu áo, rồi thêm cầu thủ của bạn.',
  taoDoiDauTien: 'Tạo đội đầu tiên',
  taoDoi: 'Tạo đội mới',
  moDoi: 'Mở đội',
  soCauThu: (n: number) => `${n} cầu thủ`,
  chuaCoCauThu: 'Chưa có cầu thủ',
} as const

export const FORM_DOI = {
  tieuDeTao: 'Tạo đội mới',
  tieuDeSua: 'Sửa thông tin đội',
  nutTao: 'Tạo đội',
  nutDoiTen: 'Đổi tên',
  nhanTen: 'Tên đội',
  gidanhTen: 'Ví dụ: Đội của tôi',
  nhanMauChinh: 'Màu áo chính',
  nhanMauPhu: 'Màu áo phụ',
  canhBaoTrungTen: (ten: string) =>
    `Đã có một đội tên "${ten}". Bạn vẫn muốn tạo thêm đội cùng tên?`,
  xacNhanTrungTen: 'Vẫn tạo',
} as const

export const XOA_DOI = {
  tieuDe: 'Xoá đội này?',
  moTa: (tenDoi: string, soCauThu: number) =>
    soCauThu === 0
      ? `Đội "${tenDoi}" sẽ bị xoá. Đội này chưa có cầu thủ nào.`
      : `Đội "${tenDoi}" và toàn bộ ${soCauThu} cầu thủ của đội sẽ bị xoá. Không hoàn tác được.`,
  xacNhan: 'Xoá đội',
} as const

export const TRANG_DOI = {
  doiNay: 'Đội',
  danhSachCauThu: 'Danh sách cầu thủ',
} as const

export const LUU_TRU = {
  canhBaoChuaLuu:
    'Lưu trữ của trình duyệt đã đầy nên thay đổi vừa rồi CHƯA được lưu.',
  goiYXuatTep: 'Hãy xuất dữ liệu ra tệp để không mất những gì đã nhập.',
  canhBaoKhongBen:
    'Trình duyệt không đánh dấu dữ liệu của ứng dụng là lưu trữ bền, nên dữ liệu có thể bị xoá khi máy thiếu chỗ.',
  goiYXuatTepThuongXuyen: 'Hãy xuất tệp sao lưu thường xuyên.',
} as const

/** Tên hiển thị của chỉ số, lấy từ domain để không khai báo hai lần. */
export function nhanChiSo(id: AttributeId | GkAttributeId): string {
  return tenChiSo(id)
}

/**
 * Dịch một lỗi của lớp services thành câu tiếng Việt nói rõ chuyện gì xảy ra
 * và cần làm gì (hiến pháp mục 4, phần Xử lý lỗi).
 */
export function cauLoi(loi: LoiUngDung): string {
  switch (loi.ma) {
    case 'EmptyName':
      return 'Tên đội không được để trống.'
    case 'NotFound':
      return 'Không tìm thấy dữ liệu này nữa. Có thể nó đã bị xoá ở nơi khác.'
    case 'DuplicateShirtNumber':
      return `Số áo ${loi.chiTiet.giaTri ?? ''} đã có cầu thủ khác trong đội dùng. Hãy chọn số khác.`.trim()
    case 'InvalidAttributeValue':
      return `Chỉ số ${loi.chiTiet.truong ?? ''} phải là số nguyên từ 1 đến 20.`.trim()
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
  }
}
