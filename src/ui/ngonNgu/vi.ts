/*
  Bảng chuỗi tiếng Việt (hiến pháp P8, bản 2.0.0).

  Đây là bản GỐC: bản tiếng Anh ở `en.ts` khai kiểu `typeof` theo bản này,
  nên thiếu một khoá hay thừa một khoá đều là lỗi biên dịch. Đó là lớp lưới
  thứ nhất của AC-22.2, và nó không tốn một dòng test nào (quyết định D66).

  Mỗi khối ở đây tương ứng một khối cũ trong `ui/strings.ts`. Các khối còn
  lại vẫn nằm ở `strings.ts` và sẽ chuyển dần qua từng lát cắt — chuyển cả
  34 khối trong một lần là một commit khổng lồ không ai soát nổi.
*/

export const CHUNG_VI = {
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

/** Nhãn của chính nút đổi ngôn ngữ — xem `en.ts` về việc vì sao không dịch. */
export const NGON_NGU_VI = {
  nhan: 'Ngôn ngữ',
  vi: 'Tiếng Việt',
  en: 'English',
} as const

export const DANH_SACH_DOI_VI = {
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

export const XOA_DOI_VI = {
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
