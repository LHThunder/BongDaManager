import type { ChiThiId, MucTheoChiThi } from '../../domain/instructions'
import type { PositionId } from '../../domain/types'
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

/*
  Nhãn 12 vị trí (T306, quyết định D68).

  Khai `Record<PositionId, …>` chứ không phải object thường: thiếu một vị
  trí là **lỗi biên dịch**, không phải một ô trống trên màn hình người dùng.
*/
export const NHAN_VI_TRI_VI: Readonly<
  Record<PositionId, { readonly ten: string; readonly vietTat: string }>
> = {
  GK: { ten: 'Thủ môn', vietTat: 'TM' },
  DL: { ten: 'Hậu vệ trái', vietTat: 'HVT' },
  DC: { ten: 'Trung vệ', vietTat: 'TV' },
  DR: { ten: 'Hậu vệ phải', vietTat: 'HVP' },
  DM: { ten: 'Tiền vệ trụ', vietTat: 'TVT' },
  ML: { ten: 'Tiền vệ cánh trái', vietTat: 'TVCT' },
  MC: { ten: 'Tiền vệ trung tâm', vietTat: 'TVTT' },
  MR: { ten: 'Tiền vệ cánh phải', vietTat: 'TVCP' },
  AML: { ten: 'Chạy cánh trái', vietTat: 'CCT' },
  AM: { ten: 'Tiền vệ tấn công', vietTat: 'TVTC' },
  AMR: { ten: 'Chạy cánh phải', vietTat: 'CCP' },
  ST: { ten: 'Tiền đạo', vietTat: 'TĐ' },
}

/*
  Nhãn 6 chỉ thị, 17 mức, và 17 câu đánh đổi (T308, quyết định D68).

  Câu đánh đổi là thứ AC-7.2 đòi — mỗi mức phải nói rõ ĐƯỢC gì và MẤT gì —
  nên nó là chữ hiển thị chứ không phải dữ liệu, và nó thuộc về đây.
*/
/** Nhãn một chỉ thị và mọi mức của nó, phủ đủ theo kiểu. */
export type NhanChiThi = {
  readonly [K in ChiThiId]: {
    readonly ten: string
    readonly cacMuc: {
      readonly [M in MucTheoChiThi[K]]: {
        readonly ten: string
        readonly danhDoi: string
      }
    }
  }
}

export const NHAN_CHI_THI_VI: NhanChiThi = {
  'do-cao-doi-hinh': {
    ten: 'Độ cao đội hình',
    cacMuc: {
      'thap': {
        ten: 'Thấp',
        danhDoi:
          'Bịt kín khoảng trống sau lưng hàng phòng ngự, nhưng nhường hẳn phần sân giữa cho đối thủ cầm bóng.',
      },
      'trung-binh': {
        ten: 'Trung bình',
        danhDoi:
          'Cân giữa khoảng trống phía sau và khoảng cách tới khung thành đối phương, không nghiêng về bên nào.',
      },
      'cao': {
        ten: 'Cao',
        danhDoi:
          'Dồn đối thủ về sân họ và giành lại bóng gần khung thành họ, nhưng hở khoảng trống sau lưng cho bóng dài.',
      },
    },
  },
  'do-rong-doi-hinh': {
    ten: 'Độ rộng đội hình',
    cacMuc: {
      'hep': {
        ten: 'Hẹp',
        danhDoi:
          'Khoá chặt trung lộ và dễ bọc lót cho nhau, nhưng bỏ trống hai hành lang biên.',
      },
      'trung-binh': {
        ten: 'Trung bình',
        danhDoi:
          'Phủ được cả trung lộ và biên ở mức vừa phải, không bịt kín hướng nào.',
      },
      'rong': {
        ten: 'Rộng',
        danhDoi:
          'Kéo giãn hàng phòng ngự đối thủ và mở đường ra biên, nhưng để lộ khoảng cách giữa các cầu thủ ở giữa sân.',
      },
    },
  },
  'toc-do-chuyen-bong': {
    ten: 'Tốc độ chuyển bóng',
    cacMuc: {
      'cham': {
        ten: 'Chậm',
        danhDoi:
          'Giữ bóng chắc và ít mất bóng, nhưng cho đối thủ thời gian về kịp vị trí.',
      },
      'trung-binh': {
        ten: 'Trung bình',
        danhDoi:
          'Luân chuyển vừa nhịp: không hối bóng, cũng không bỏ lỡ cơ hội rõ ràng.',
      },
      'nhanh': {
        ten: 'Nhanh',
        danhDoi:
          'Khai thác được lúc đối thủ chưa kịp lùi, nhưng đường chuyền mạo hiểm nên mất bóng nhiều hơn.',
      },
    },
  },
  'cuong-do-pressing': {
    ten: 'Cường độ pressing',
    cacMuc: {
      'thap': {
        ten: 'Thấp',
        danhDoi:
          'Giữ được vị trí và tiết kiệm thể lực, nhưng để đối thủ chuyền bóng thoải mái.',
      },
      'trung-binh': {
        ten: 'Trung bình',
        danhDoi:
          'Gây áp lực có chọn lọc, giữ hình hài đội hình và không rút cạn thể lực.',
      },
      'cao': {
        ten: 'Cao',
        danhDoi:
          'Giành lại bóng sớm và ép đối thủ sai, nhưng tốn thể lực và để lại khoảng trống khi vồ bóng không thành.',
      },
    },
  },
  'huong-tan-cong': {
    ten: 'Hướng tấn công',
    cacMuc: {
      'bien': {
        ten: 'Qua hai biên',
        danhDoi:
          'Tránh được chỗ đông người ở giữa và tạo nhiều quả tạt, nhưng phụ thuộc vào người dứt điểm trong vòng cấm.',
      },
      'can-bang': {
        ten: 'Cân bằng',
        danhDoi:
          'Khó bị bắt bài vì đổi hướng liên tục, nhưng không dồn sức vào hướng mạnh nhất của đội.',
      },
      'trung-lo': {
        ten: 'Qua trung lộ',
        danhDoi:
          'Đi đường ngắn nhất tới khung thành, nhưng phải xuyên qua nơi đối thủ đông người nhất.',
      },
    },
  },
  'bay-viet-vi': {
    ten: 'Bẫy việt vị',
    cacMuc: {
      'tat': {
        ten: 'Tắt',
        danhDoi:
          'Hàng phòng ngự lùi theo bóng nên ít bị xuyên phá, nhưng không cắt được những đường phát động từ xa.',
      },
      'bat': {
        ten: 'Bật',
        danhDoi:
          'Dâng lên cùng lúc để bắt việt vị và chặn bóng từ xa, nhưng một nhịp lệch là đối thủ thoát xuống một mình.',
      },
    },
  },
}
