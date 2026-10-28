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
  nutDoiTen: 'Cập nhật đội',
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
  themCauThu: 'Thêm cầu thủ',
  chuaCoCauThuTieuDe: 'Đội chưa có cầu thủ nào',
  chuaCoCauThuMoTa:
    'Thêm cầu thủ đầu tiên: nhập tên, số áo, vị trí sở trường, rồi bấm sinh nhanh chỉ số nếu bạn không muốn điền tay từng ô.',
  themCauThuDauTien: 'Thêm cầu thủ đầu tiên',
  sapXepTheo: 'Sắp xếp theo',
  sapXep: {
    ten: 'Tên',
    soAo: 'Số áo',
    tuoi: 'Tuổi',
    viTri: 'Vị trí',
  },
  cotSoAo: 'Số áo',
  cotTen: 'Tên',
  cotTuoi: 'Tuổi',
  cotViTri: 'Vị trí',
  cotChanThuan: 'Chân thuận',
  cotChiSoTong: 'Chỉ số tổng',
  chuaHoanTat: 'Chưa hoàn tất',
  chuaHoanTatChiTiet: (n: number) => `Còn thiếu ${n} chỉ số`,
  chuaTinhDuocChiSoTong: 'Chưa đủ chỉ số để tính',
  suaCauThu: 'Sửa',
  xoaCauThu: 'Xoá',
} as const

export const XOA_CAU_THU = {
  tieuDe: 'Xoá cầu thủ này?',
  moTa: (ten: string, soAo: number) =>
    `Cầu thủ "${ten}" (số ${soAo}) sẽ bị xoá khỏi đội. Không hoàn tác được.`,
  xacNhan: 'Xoá cầu thủ',
} as const

export const CHAN_THUAN = {
  trai: 'Trái',
  phai: 'Phải',
  'ca-hai': 'Cả hai',
} as const

export const SAO_LUU = {
  tieuDe: 'Sao lưu dữ liệu',
  moTa: 'Dữ liệu nằm trong trình duyệt nên sẽ mất nếu bạn xoá dữ liệu trình duyệt. Hãy xuất ra tệp để giữ lại, hoặc để mang sang máy khác.',
  nutXuat: 'Xuất ra tệp',
  dangDungTep: 'Đang dựng tệp…',
  kichThuocUocTinh: (co: string) => `Tệp sẽ khoảng ${co}`,
  nutNhap: 'Nhập từ tệp',
  dangDocTep: 'Đang đọc tệp…',
  tomTatTep: (soDoi: number, soCauThu: number, soAnh: number) =>
    `Tệp này có ${soDoi} đội, ${soCauThu} cầu thủ và ${soAnh} ảnh.`,
  hoiCheDo: 'Bạn muốn làm gì với dữ liệu đang có trên máy?',
  nutThayThe: 'Thay thế toàn bộ',
  moTaThayThe: 'Xoá hết dữ liệu đang có rồi dùng dữ liệu trong tệp.',
  nutGop: 'Gộp thêm vào',
  moTaGop: 'Giữ nguyên dữ liệu đang có và thêm dữ liệu trong tệp vào cạnh.',
  daNhapThayThe: (soDoi: number, soCauThu: number) =>
    `Đã thay thế toàn bộ dữ liệu: ${soDoi} đội, ${soCauThu} cầu thủ.`,
  daNhapGop: (soDoi: number, soCauThu: number) =>
    `Đã gộp thêm ${soDoi} đội và ${soCauThu} cầu thủ vào dữ liệu đang có.`,
  canhBaoKhongBen:
    'Trình duyệt không đánh dấu dữ liệu của ứng dụng là lưu trữ bền, nên dữ liệu có thể bị xoá khi máy thiếu chỗ. Hãy xuất tệp sao lưu thường xuyên.',
} as const

export function coTep(byte: number): string {
  if (byte < 1024) return `${byte} B`
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`
}

export const CHON_ANH = {
  nhanAnhCauThu: 'Ảnh chân dung',
  nhanLogoDoi: 'Logo đội',
  chonAnh: 'Chọn ảnh',
  doiAnh: 'Đổi ảnh',
  xoaAnh: 'Bỏ ảnh',
  tieuDeCat: 'Cắt ảnh về khung vuông',
  huongDanCat:
    'Kéo để chọn phần muốn giữ, dùng thanh trượt để phóng to hoặc thu nhỏ.',
  phongTo: 'Phóng to',
  xacNhanCat: 'Dùng ảnh này',
  dangXuLy: 'Đang xử lý ảnh…',
} as const

export const CHON_MAU_AO = {
  nhanMauChinh: 'Màu áo chính',
  nhanMauPhu: 'Màu áo phụ',
  xemTruoc: 'Xem trước',
  canhBaoTrungMauDoiKhac: (tenDoi: string) =>
    `Màu áo chính này quá giống đội "${tenDoi}". Khi hai đội gặp nhau sẽ khó phân biệt.`,
  canhBaoChinhVaPhuGiongNhau:
    'Màu áo chính và màu áo phụ quá giống nhau, nên áo phụ sẽ không giúp phân biệt được gì.',
  canhBaoNenDaDieuChinh:
    'Màu này không đủ tương phản với cả chữ trắng lẫn chữ đen, nên nền hiển thị được làm đậm/nhạt đi một chút để chữ còn đọc được.',
} as const

export const BANG_CHI_SO = {
  tieuDe: 'Chỉ số',
  khoangHopLe:
    'Mỗi chỉ số là số nguyên từ 1 đến 20. Ô để trống nghĩa là chưa điền.',
  loiNgoaiKhoang: (tenChiSoDo: string) =>
    `${tenChiSoDo} phải là số nguyên từ 1 đến 20. Giá trị vừa nhập đã bị bỏ qua.`,
  nhomTen: {
    'ky-thuat': 'Kỹ thuật',
    'phong-ngu': 'Phòng ngự',
    'the-chat': 'Thể chất',
    'tinh-than': 'Tinh thần',
    'thu-mon': 'Thủ môn',
  },
} as const

export const FORM_CAU_THU = {
  tieuDeThem: 'Thêm cầu thủ',
  tieuDeSua: 'Sửa hồ sơ cầu thủ',
  nutThem: 'Thêm cầu thủ',
  nutLuuSua: 'Cập nhật',
  nhanTen: 'Tên cầu thủ',
  gidanhTen: 'Ví dụ: Nguyễn Văn A',
  nhanSoAo: 'Số áo',
  nhanTuoi: 'Tuổi',
  nhanChanThuan: 'Chân thuận',
  nhanViTri: 'Vị trí sở trường',
  giaiThichThuMon:
    'Thủ môn dùng bộ chỉ số riêng nên không kiêm vị trí sân. Bỏ chọn Thủ môn nếu bạn muốn chọn vị trí sân.',
  giaiThichViTriSan:
    'Đã chọn vị trí sân nên không chọn thêm Thủ môn được. Bỏ hết vị trí sân nếu bạn muốn cầu thủ này là thủ môn.',
  canhBaoDoiSangThuMon:
    'Đổi cầu thủ này thành thủ môn sẽ chuyển sang bộ chỉ số của thủ môn. Những chỉ số không còn dùng tới sẽ không được lưu nữa.',
  xacNhanDoiSangThuMon: 'Vẫn đổi sang thủ môn',
  sinhNhanh: 'Sinh nhanh chỉ số',
  sinhNhanhMoTa: 'Chọn mức để điền sẵn toàn bộ chỉ số, rồi tỉa lại ô nào bạn muốn.',
  canChonViTriTruoc: 'Hãy chọn vị trí sở trường trước, vì mức sinh phụ thuộc vị trí.',
  chiSoTongTaiViTri: (tenViTri: string) => `Chỉ số tổng ở vị trí ${tenViTri}`,
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
