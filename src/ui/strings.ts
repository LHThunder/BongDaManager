import { tenChiSo } from '../domain/attributes'
import type { FormationId } from '../domain/formations'
import type { MucSai } from '../domain/misplacement'
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
  taiLaiTrang: 'Tải lại trang',
  /*
    Câu cho đường chết lặng ở T131: nâng cấp kho dữ liệu phải chờ các tab cũ
    đóng. Phải nói rõ ba điều — vì sao đang đứng im, người dùng cần làm gì, và
    rằng dữ liệu không việc gì — chứ "Đang tải…" thì người dùng chỉ biết ngồi
    chờ một thứ không bao giờ tới.
  */
  chanNangCapDuLieu:
    'Ứng dụng cần nâng cấp kho dữ liệu, nhưng một tab khác của ứng dụng đang mở và giữ phiên bản cũ. Hãy đóng những tab đó rồi tải lại trang này. Dữ liệu của bạn vẫn nguyên vẹn.',
  /*
    Mặt kia của câu trên (T133): tab NÀY vừa nhường đường. Phải nói đủ ba
    điều — tab này đã ngừng ghi, dữ liệu đã lưu vẫn còn, và việc cần làm là
    tải lại — vì người dùng không có cách nào tự đoán ra chuyện vừa xảy ra ở
    một tab khác.
  */
  daNhuongKetNoi:
    'Một tab khác vừa nâng cấp kho dữ liệu, nên tab này đã ngừng ghi để nhường đường. Những gì đã lưu vẫn nguyên vẹn, nhưng thao tác mới ở đây sẽ không lưu được. Hãy tải lại trang để dùng tiếp.',
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
  /*
    Chỉ nói thêm câu này khi đội đang có trận CHẠY TRONG BỘ NHỚ (spec mục 5).
    Đội chỉ có trận trong lịch sử thì không nói gì về trận đang diễn ra, vì
    lịch sử không bị đụng tới.
  */
  tranDangDien:
    ' Đội này đang có một trận dở; xoá đội thì trận đang diễn ra bị bỏ và không vào lịch sử.',
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
  daNhapThayThe: (soDoi: number, soCauThu: number, soTran: number) =>
    `Đã thay thế toàn bộ dữ liệu: ${soDoi} đội, ${soCauThu} cầu thủ, ${soTran} trận trong lịch sử.`,
  daNhapGop: (soDoi: number, soCauThu: number) =>
    `Đã gộp thêm ${soDoi} đội và ${soCauThu} cầu thủ vào dữ liệu đang có.`,
  /*
    Nhập gộp bỏ qua lịch sử (quyết định D48b). Người dùng có quyền biết tệp
    của họ còn thứ chưa vào được, và biết cách lấy nó: nhập thay thế.
  */
  gopBoQuaLichSu: (soTran: number) =>
    `Tệp còn ${soTran} trận trong lịch sử, nhưng chế độ gộp không nhận lịch sử — vì mỗi bản ghi trận trỏ tới đội và cầu thủ bằng id cũ. Muốn lấy cả lịch sử thì dùng "Thay thế toàn bộ".`,
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
// ---------------------------------------------------------------------------
// Giai đoạn 2 — chiến thuật
// ---------------------------------------------------------------------------

/*
  Tên hiển thị của sơ đồ trùng với id, vì tên sơ đồ bóng đá vốn là dãy số —
  không có gì để dịch. Bảng này vẫn tồn tại để component không phải đọc id
  thẳng từ `domain`, và để sau này thêm chú thích cho từng sơ đồ thì chỉ sửa
  một chỗ.
*/
export const TEN_SO_DO: Readonly<Record<FormationId, string>> = {
  '2-2': '2-2',
  '1-2-1': '1-2-1',
  '2-3': '2-3',
  '3-2': '3-2',
  '2-3-1': '2-3-1',
  '3-2-1': '3-2-1',
  '3-3-1': '3-3-1',
  '2-3-2': '2-3-2',
  '3-3-2': '3-3-2',
  '3-4-1': '3-4-1',
  '4-3-2': '4-3-2',
  '3-4-2': '3-4-2',
  '4-4-2': '4-4-2',
  '4-4-1-1': '4-4-1-1',
  '4-3-3': '4-3-3',
  '4-2-3-1': '4-2-3-1',
  '4-1-4-1': '4-1-4-1',
  '3-5-2': '3-5-2',
  '3-4-3': '3-4-3',
  '5-3-2': '5-3-2',
}

export const TRANG_CHIEN_THUAT = {
  tieuDe: 'Chiến thuật',
  moChienThuat: 'Chiến thuật',
  nhanChonSoDo: 'Sơ đồ',
  tieuDeNgoaiSan: 'Ngoài sân',
  ngoaiSanTrong: 'Mọi cầu thủ đều đã ở trên sân.',
  chuaCoCauThu: 'Đội này chưa có cầu thủ nào để xếp đội hình.',
  oTrong: 'Ô trống',
  nhanO: (tenViTri: string) => `Ô ${tenViTri}`,
  oCoNguoi: (tenViTri: string, tenCauThu: string, soAo: number) =>
    `Ô ${tenViTri}: ${tenCauThu}, số ${soAo}`,
  soAo: (so: number) => `Số ${so}`,
  boRaNgoai: 'Đưa ra ngoài sân',
  datVaoO: 'Đặt vào ô này',
  nhacLen: 'Nhấc cầu thủ này lên',
  datXuong: 'Đặt cầu thủ đang nhấc vào đây',
  thoiNhac: 'Thôi, không xếp nữa',
  dangNhac: (ten: string) => `Đang nhấc ${ten}. Chọn một ô để đặt xuống.`,
  huongDanBanPhim:
    'Dùng Tab để đi giữa các ô và cầu thủ. Nhấn Enter hoặc Space để nhấc một cầu thủ lên, dùng phím mũi tên để chuyển sang ô khác, rồi nhấn Enter hoặc Space để đặt xuống. Nhấn Esc để thôi.',
  /*
    @dnd-kit tự đọc những câu này cho trình đọc màn hình. Mặc định của nó là
    tiếng Anh kèm id nội bộ ("Picked up draggable item cau-thu:a4ec…"), nên
    phải thay hết — P8 nói giao diện chỉ có tiếng Việt, và trình đọc màn hình
    cũng là giao diện.
  */
  moTaKeoDuoc: 'cầu thủ, kéo được',
  huongDanDocManHinh:
    'Nhấn Enter hoặc Space để nhấc cầu thủ lên. Khi đang nhấc, dùng phím mũi tên để chọn ô, Enter hoặc Space để đặt xuống, Esc để thôi.',
  baoNhacLen: (ten: string) => `Đã nhấc ${ten}.`,
  baoDangOTren: (ten: string) => `Đang ở trên ${ten}.`,
  baoDatXuong: (ten: string) => `Đã đặt vào ${ten}.`,
  baoDatLaiChoCu: 'Đã trả về chỗ cũ.',
  baoThoiNhac: 'Đã thôi, không xếp nữa.',
  tenVungNgoaiSan: 'danh sách ngoài sân',
} as const

/** Nhãn chữ cho ba mức sai vị trí — không chỉ dùng màu viền (P9). */
export const MUC_SAI_VI_TRI: Readonly<Record<MucSai, string>> = {
  dung: 'Đúng vị trí',
  nhe: 'Lệch nhẹ',
  vua: 'Lệch vừa',
  nang: 'Sai nặng',
}

export const SAI_VI_TRI = {
  nhan: (muc: MucSai, phanTramTru: number) =>
    muc === 'dung'
      ? MUC_SAI_VI_TRI.dung
      : `${MUC_SAI_VI_TRI[muc]} — giảm ${phanTramTru}% hiệu suất`,
  giaiThich: (tenViTriO: string, cacViTriSoTruong: string) =>
    `Ô này là ${tenViTriO}, còn vị trí sở trường của cầu thủ là ${cacViTriSoTruong}.`,
} as const

export const TINH_TRANG_DOI_HINH = {
  sanSang: 'Đội hình đã đủ điều kiện thi đấu.',
  tieuDeChuaDu: 'Đội hình chưa đủ điều kiện',
  thieuNguoi: (soCo: number, soCan: number) =>
    `Mới xếp ${soCo} trong ${soCan} ô. Hãy xếp đủ ${soCan} cầu thủ.`,
  thieuThuMon: 'Chưa có thủ môn trong khung thành.',
  hoSoChuaHoanTat: (tenCauThu: readonly string[]) =>
    tenCauThu.length === 1
      ? `Cầu thủ ${tenCauThu[0]} còn thiếu chỉ số, hãy điền đủ trước khi vào trận.`
      : `${tenCauThu.length} cầu thủ còn thiếu chỉ số: ${tenCauThu.join(', ')}.`,
} as const

export const DOI_SO_DO = {
  daXepLai: (tenSoDo: string) => `Đã xếp lại đội hình theo sơ đồ ${tenSoDo}.`,
  biDayRa: (ten: readonly string[]) =>
    `Không còn ô phù hợp cho ${ten.join(', ')} — những cầu thủ này đã ra ngoài sân.`,
  biXepSai: (ten: readonly string[]) =>
    `Đang xếp sai vị trí sở trường: ${ten.join(', ')}.`,
} as const

export const VAI_TRO = {
  tieuDe: 'Vai trò',
  nhanChon: 'Vai trò của ô này',
  chiSoQuanTrong: 'Chỉ số quan trọng',
  tieuDeChuaDat: 'Cầu thủ chưa đáp ứng vai trò này',
  chiSoChuaDat: (tenChiSo: string, giaTri: number) =>
    `${tenChiSo}: ${giaTri}`,
  chiSoChuaDien: (tenChiSo: string) => `${tenChiSo}: chưa điền`,
  chuaDanhGiaDuoc:
    'Hồ sơ cầu thủ còn thiếu chỉ số nên chưa đánh giá được vai trò này.',
  datHet: 'Cầu thủ đáp ứng mọi chỉ số quan trọng của vai trò này.',
  /** Nhãn ngắn ngay tại ô; chi tiết từng chỉ số ở bảng chọn vai trò. */
  canhBaoNganTaiO: (soChiSo: number) => `Thiếu ${soChiSo} chỉ số của vai trò`,
} as const

export const CHI_THI_DOI = {
  tieuDe: 'Chỉ thị toàn đội',
  moTa: 'Mỗi mức đều có cái được và cái mất — không có mức nào tốt hơn hẳn.',
  tieuDeXungDot: 'Hai chỉ thị đang chống nhau',
  ghiChuXungDot:
    'Bạn vẫn lưu được như thế này; đây chỉ là lời nhắc.',
} as const

export const BO_CHIEN_THUAT = {
  tieuDe: 'Bộ chiến thuật đã lưu',
  dangDung: 'Đang dùng',
  luuThanhBo: 'Lưu thành bộ mới',
  nhanTenBo: 'Tên bộ chiến thuật',
  gidanhTenBo: 'Ví dụ: Phòng ngự chắc',
  apDung: 'Dùng bộ này',
  chuaCoBo: 'Bạn chưa lưu bộ chiến thuật nào.',
} as const

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

// ---------------------------------------------------------------------------
// Giai đoạn 3 — trận đấu
// ---------------------------------------------------------------------------

export const CHON_CAP_DAU = {
  tieuDe: 'Bắt đầu một trận',
  nhanDoiNha: 'Đội chủ nhà',
  nhanDoiKhach: 'Đội khách',
  chonDoi: '— Chọn đội —',
  sanTrungLap: 'Đá trên sân trung lập',
  moTaSanTrungLap:
    'Tắt hoàn toàn lợi thế sân nhà, để so hai chiến thuật cho công bằng.',
  nhanMaTran: 'Mã trận',
  moTaMaTran:
    'Giữ lại mã này — hoặc dán lại một mã cũ — thì đấu lại được đúng trận đó, kể cả khi bạn đổi chiến thuật.',
  maTranMoi: 'Sinh mã mới',
  maTranKhongHopLe:
    'Mã trận gồm đúng 10 ký tự, dùng chữ số và chữ cái trừ I, L, O, U.',
  batDau: 'Bắt đầu trận',
  tieuDeChuaBatDauDuoc: 'Chưa bắt đầu được',
  canHaiDoi: 'Cần ít nhất 2 đội mới đấu được. Hãy tạo thêm một đội đối thủ.',
  doiTrungMauAo: (tenDoi: string) =>
    `Hai đội trùng màu áo, nên ${tenDoi} sẽ ra sân với áo phụ.`,
} as const

export const DANG_KY_DOI_HINH = {
  tieuDe: 'Đăng ký đội hình',
  moTa: 'Chọn đúng 11 cầu thủ chính và đúng 7 cầu thủ dự bị.',
  nhanChinh: 'Đội hình chính',
  nhanDuBi: 'Dự bị',
  nhanNgoai: 'Không đăng ký',
  demChinh: (co: number, can: number) => `${co}/${can} chính`,
  demDuBi: (co: number, can: number) => `${co}/${can} dự bị`,
  dungTheoChienThuat: 'Lấy theo chiến thuật đã lưu',
} as const

export const LY_DO_KHONG_BAT_DAU = {
  cungMotDoi: 'Hai bên đang là cùng một đội. Hãy chọn hai đội khác nhau.',
  chuaDuChinh: (tenDoi: string, co: number, can: number) =>
    `${tenDoi} mới có ${co} trong ${can} cầu thủ chính.`,
  chuaDungDuBi: (tenDoi: string, co: number, can: number) =>
    `${tenDoi} đang đăng ký ${co} dự bị, cần đúng ${can}.`,
  thieuThuMon: (tenDoi: string) => `${tenDoi} chưa có thủ môn trong khung.`,
  hoSoChuaHoanTat: (tenDoi: string, ten: readonly string[]) =>
    `${tenDoi} còn cầu thủ thiếu chỉ số: ${ten.join(', ')}.`,
  khongDuNguoi: (tenDoi: string, co: number) =>
    `${tenDoi} mới có ${co} cầu thủ trong đội, chưa đủ 18 người để đăng ký.`,
} as const

export const TRAN_DAU = {
  tieuDe: 'Trận đấu',
  phut: (p: number, buGio: boolean) => (buGio ? `${p}'+` : `${p}'`),
  tamDung: 'Tạm dừng',
  tiepTuc: 'Tiếp tục',
  chayHet: 'Chạy hết trận',
  nhanTocDo: 'Tốc độ',
  tocDo: {
    thuong: 'Thường',
    nhanh: 'Nhanh',
    ratNhanh: 'Rất nhanh',
  },
  tieuDeDienBien: 'Diễn biến',
  chuaBatDau: 'Trận chưa bắt đầu.',
  daKetThuc: 'Trận đã kết thúc.',
  canhBaoRoiTrang:
    'Trận đang diễn ra sẽ bị huỷ nếu bạn rời trang. Mã trận vẫn cho phép đấu lại đúng trận này về sau.',
  nhanKietSuc: 'Kiệt sức',
  nhanTheVang: 'Thẻ vàng',
  nhanTheDo: 'Thẻ đỏ',
  quayLai: 'Rời trận',
} as const

export const THAY_NGUOI = {
  tieuDe: 'Thay người',
  conLuot: (con: number, toiDa: number) =>
    `Còn ${con} trong ${toiDa} lượt thay.`,
  canTamDung: 'Hãy tạm dừng trận trước khi thay người.',
  nhanRa: 'Ra sân',
  nhanVao: 'Vào sân',
  chonCauThu: '— Chọn cầu thủ —',
  thucHien: 'Thay',
  hetLuot: 'Đã hết lượt thay người.',
} as const

export const CAN_THIEP_GIUA_TRAN = {
  tieuDeChiThi: 'Đổi chỉ thị giữa trận',
  moTa: 'Thay đổi chỉ áp dụng từ phút tiếp theo; những phút đã qua giữ nguyên.',
  chiDoiDuocDoiCuaBan: 'Bạn chỉ can thiệp được vào đội của mình.',
} as const

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
export const LICH_SU = {
  tieuDe: 'Lịch sử trận đấu',
  moTa: (giuLai: number) =>
    `Giữ ${giuLai} trận gần nhất. Trận cũ hơn sẽ tự rời khỏi danh sách.`,
  chuaCoTran: 'Chưa có trận nào. Hãy đá một trận rồi quay lại đây.',
  moLink: 'Mở lại',
  dong: 'Đóng',
  cotThoiDiem: 'Kết thúc lúc',
  cotCapDau: 'Cặp đấu',
  cotTiSo: 'Tỉ số',
  cotMaTran: 'Mã trận',
  doiDaXoa: 'đội đã xoá',
  khongDauLaiDuoc:
    'Một trong hai đội đã bị xoá, nên trận này chỉ xem lại được chứ không đấu lại được.',
  khacPhienBan:
    'Trận này chạy bằng một phiên bản engine cũ hơn, nên chạy lại cùng mã trận sẽ KHÔNG ra đúng trận cũ. Bản ghi vẫn xem lại được nguyên vẹn.',
  dauLai: 'Đấu lại trận này',
  /** Câu cho từng lý do không đấu lại được (quyết định D35, spec mục 5). */
  lyDoKhongDauLai: {
    'khac-phien-ban-engine':
      'Không đấu lại được: trận này chạy bằng phiên bản engine cũ hơn, nên cùng mã trận bây giờ sẽ ra một trận khác.',
    'doi-da-bi-xoa':
      'Không đấu lại được: một trong hai đội đã bị xoá, nên không còn hồ sơ để dựng lại cặp đấu.',
  } as Readonly<Record<string, string>>,
  daLoaiTranCu: (so: number) =>
    so === 1
      ? 'Lịch sử đã đủ chỗ, nên trận cũ nhất vừa rời khỏi danh sách.'
      : `Lịch sử đã đủ chỗ, nên ${so} trận cũ nhất vừa rời khỏi danh sách.`,
  dongBaoDaLoai: 'Đã hiểu',
  tieuDeDienBien: 'Diễn biến trận',
} as const

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
export const BAO_CAO_SAU_TRAN = {
  tieuDe: 'Báo cáo sau trận',
  tieuDeGhiBan: 'Người ghi bàn',
  chuaCoBanThang: 'Trận này không có bàn thắng nào.',
  phut: (phut: number, buGio: boolean) => `${phut}'${buGio ? '+' : ''}`,

  tieuDeChiTieu: 'Chỉ tiêu hai đội',
  cotChiTieu: 'Chỉ tiêu',
  chiTieu: {
    cuSut: 'Số cú sút',
    sutTrungDich: 'Sút trúng đích',
    kiemSoatBong: 'Kiểm soát bóng',
    coHoiRoRang: 'Cơ hội rõ ràng',
    theVang: 'Thẻ vàng',
    theDo: 'Thẻ đỏ',
  },
  phanTram: (x: number) => `${x}%`,

  tieuDeDiem: 'Điểm từng cầu thủ',
  moTaDiem:
    'Thang 1–10, bắt đầu từ 6.0. Bấm vào một cầu thủ để xem những số liệu đã dẫn tới điểm đó.',
  cotCauThu: 'Cầu thủ',
  cotViTri: 'Vị trí',
  cotDiem: 'Điểm',
  moBang: 'Xem số liệu',
  dongBang: 'Ẩn số liệu',
  cotSoLieu: 'Số liệu',
  cotGopDiem: 'Góp vào điểm',
  diemNen: 'Điểm nền',
  khongCoSoLieu: 'Cầu thủ này chưa có số liệu nào đáng kể trong trận.',

  /** Nhãn cho từng tiêu chí chấm điểm; engine chỉ trả về khoá (P8). */
  tieuChi: {
    'ban-thang': 'Bàn thắng',
    'kien-tao': 'Kiến tạo',
    'sut-trung-dich': 'Sút trúng đích',
    'ti-le-chuyen': 'Chuyền chính xác',
    'cuop-bong': 'Cướp bóng',
    'mat-bong': 'Mất bóng',
    'pham-loi': 'Phạm lỗi',
    'can-cuu': 'Cứu thua',
    'tran-diem': 'Chạm trần 10 điểm',
    'san-diem': 'Chạm sàn 1 điểm',
  } as Readonly<Record<string, string>>,

  /** Tiêu chí tính theo phần trăm, không theo số lần. */
  tieuChiTheoPhanTram: new Set(['ti-le-chuyen']),

  vaoSanPhut: (phut: number) => `vào sân phút ${phut}`,
  raSanPhut: (phut: number) => `ra sân phút ${phut}`,
  daTronTran: 'đá trọn trận',

  tieuDeDauLai: 'Đấu lại cặp này',
  moTaDauLai:
    'Không phải chọn lại hai đội hay đăng ký lại đội hình. Giữ mã trận thì ra đúng trận vừa rồi.',
  dauLaiCungMa: 'Đấu lại cùng mã trận',
  dauLaiMaMoi: 'Đấu lại với mã mới',
} as const

/** Khối chọn người vào bắt gôn khi khung thành bỏ trống (spec mục 5). */
export const VAO_BAT_GON = {
  tieuDeTrong: 'Khung thành đang bỏ trống',
  tieuDeChuaChay: (ten: string) => `${ten} đang bắt gôn thay`,
  moTa: 'Chọn một cầu thủ trên sân vào bắt gôn. Người đó bị trừ hiệu suất ở mức sai nặng.',
  nhanChon: 'Người vào bắt gôn',
  chonCauThu: '— chọn —',
  thucHien: 'Cho vào bắt gôn',
  conLuotThay: (conLuot: number) =>
    `Còn ${conLuot} lượt thay: đưa thủ môn dự bị vào thay một cầu thủ khác, rồi cho người đó bắt gôn.`,
  hetLuotThay: 'Đã hết lượt thay, nên phải dùng một cầu thủ trên sân.',
  canTamDung: 'Tạm dừng trận để chọn người vào bắt gôn.',
} as const

export const SO_SANH_TRAN = {
  tieuDe: 'So với lần chạy trước cùng mã trận',
  moTa: 'Kết quả cũ chỉ giữ trong phiên làm việc này.',
  cotChiTieu: 'Chỉ tiêu',
  cotLanTruoc: 'Lần trước',
  cotLanNay: 'Lần này',
  tiSo: 'Tỉ số',
  cuSut: 'Số cú sút',
  coHoi: 'Cơ hội rõ ràng',
  hai: (nha: number, khach: number) => `${nha} – ${khach}`,
} as const
