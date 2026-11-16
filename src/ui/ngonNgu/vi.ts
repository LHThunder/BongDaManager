import type {
  ChiThiId,
  MucTheoChiThi,
  XungDotId,
} from '../../domain/instructions'
import type { MucDo } from '../../domain/generator'
import type { FormationId } from '../../domain/formations'
import type { MucSai } from '../../domain/misplacement'
import type { RoleId } from '../../domain/roles'
import type {
  AttributeId,
  GkAttributeId,
  PositionId,
} from '../../domain/types'
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

/*
  Nhãn 23 vai trò (T307, quyết định D68).

  Mỗi vai trò có tên và một câu nói nó làm gì trên sân — câu ấy là thứ người
  dùng đọc để chọn, nên nó là chữ hiển thị chứ không phải dữ liệu.
*/
export const NHAN_VAI_TRO_VI: Readonly<
  Record<RoleId, { readonly ten: string; readonly moTa: string }>
> = {
  'thu-mon-truyen-thong': {
    ten: 'Thủ môn truyền thống',
    moTa:
      'Giữ khung thành, hạn chế rời vị trí, ưu tiên bắt chắc.',
  },
  'thu-mon-quet': {
    ten: 'Thủ môn quét',
    moTa:
      'Dâng cao sau hàng phòng ngự, tham gia phát động từ tuyến dưới.',
  },
  'hau-ve-bien-phong-ngu': {
    ten: 'Hậu vệ biên phòng ngự',
    moTa:
      'Giữ nguyên tuyến, kèm chặt cánh, ít tham gia tấn công.',
  },
  'hau-ve-bien-tan-cong': {
    ten: 'Hậu vệ biên tấn công',
    moTa:
      'Lên công về thủ theo nhịp bóng, tạt bóng từ biên.',
  },
  'hau-ve-canh-dang-cao': {
    ten: 'Hậu vệ cánh dâng cao',
    moTa:
      'Chơi gần như tiền vệ cánh, phủ cả hành lang biên.',
  },
  'trung-ve-kem-nguoi': {
    ten: 'Trung vệ kèm người',
    moTa:
      'Theo sát tiền đạo đối phương, tranh chấp tay đôi.',
  },
  'trung-ve-don-dep': {
    ten: 'Trung vệ dọn dẹp',
    moTa:
      'Chơi lùi sau, bọc lót và đọc đường bóng xuyên tuyến.',
  },
  'trung-ve-phat-dong': {
    ten: 'Trung vệ phát động',
    moTa:
      'Cầm bóng dâng lên, mở bóng từ hàng phòng ngự.',
  },
  'tien-ve-mo-neo': {
    ten: 'Tiền vệ mỏ neo',
    moTa:
      'Đứng chắn trước hàng phòng ngự, không rời vị trí.',
  },
  'tien-ve-pha-loi-choi': {
    ten: 'Tiền vệ phá lối chơi',
    moTa:
      'Chủ động lao vào tranh chấp, cắt nhịp lên bóng của đối thủ.',
  },
  'tien-ve-mo-bong': {
    ten: 'Tiền vệ mở bóng',
    moTa:
      'Lùi sâu nhận bóng, luân chuyển và mở hướng tấn công.',
  },
  'tien-ve-canh-tat-canh': {
    ten: 'Tiền vệ cánh tạt cánh',
    moTa:
      'Bám biên, đưa bóng vào vòng cấm bằng những quả tạt.',
  },
  'tien-ve-canh-ho-thu': {
    ten: 'Tiền vệ cánh hỗ trợ phòng ngự',
    moTa:
      'Lùi về che cánh cho hậu vệ, lên bóng chừng mực.',
  },
  'tien-ve-con-thoi': {
    ten: 'Tiền vệ con thoi',
    moTa:
      'Lên xuống cả hai vòng cấm suốt trận.',
  },
  'tien-ve-kien-thiet': {
    ten: 'Tiền vệ kiến thiết',
    moTa:
      'Cầm nhịp, tìm đường chuyền mở ra cơ hội.',
  },
  'tien-ve-thu-hoi': {
    ten: 'Tiền vệ thu hồi bóng',
    moTa:
      'Đứng thấp giữa sân, thu bóng rồi chuyền an toàn.',
  },
  'chay-canh-bam-bien': {
    ten: 'Chạy cánh bám biên',
    moTa:
      'Giữ chiều rộng, rê bóng vượt hậu vệ rồi căng ngang.',
  },
  'chay-canh-bo-vao': {
    ten: 'Chạy cánh bó vào trong',
    moTa:
      'Từ biên bó vào trung lộ để dứt điểm.',
  },
  'tien-ve-tan-cong-kien-tao': {
    ten: 'Tiền vệ tấn công kiến tạo',
    moTa:
      'Chơi giữa hai tuyến đối thủ, nhận bóng và tạo cơ hội.',
  },
  'tien-ve-tan-cong-bong-ma': {
    ten: 'Tiền vệ tấn công bóng ma',
    moTa:
      'Băng lên từ tuyến hai, dứt điểm thay vì cầm nhịp.',
  },
  'tien-dao-muc-tieu': {
    ten: 'Tiền đạo mục tiêu',
    moTa:
      'Làm điểm tựa cho bóng dài, tì đè và tranh bóng trên không.',
  },
  'tien-dao-cat-mat': {
    ten: 'Tiền đạo cắt mặt',
    moTa:
      'Rình trong vòng cấm, chọn thời điểm băng vào ghi bàn.',
  },
  'tien-dao-lui-sau': {
    ten: 'Tiền đạo lùi sâu',
    moTa:
      'Rời vòng cấm nhận bóng, kéo trung vệ đối thủ ra khỏi vị trí.',
  },
}

/** Nhãn 15 chỉ số sân và 3 chỉ số thủ môn (T309). */
export const NHAN_CHI_SO_VI: Readonly<
  Record<AttributeId | GkAttributeId, string>
> = {
  'dut-diem': 'Dứt điểm',
  'sut-xa': 'Sút xa',
  'chuyen-ngan': 'Chuyền ngắn',
  'tat-chuyen-dai': 'Tạt/Chuyền dài',
  're-dat': 'Rê dắt',
  'khong-che-bong': 'Khống chế bóng',
  'tac-bong': 'Tắc bóng',
  'kem-nguoi': 'Kèm người',
  'doc-tinh-huong': 'Đọc tình huống',
  'toc-do': 'Tốc độ',
  'suc-manh': 'Sức mạnh',
  'khong-chien': 'Không chiến',
  'the-luc': 'Thể lực',
  'nhan-quan': 'Nhãn quan',
  'quyet-doan': 'Quyết đoán',
  'phan-xa': 'Phản xạ',
  'bat-bong': 'Bắt bóng',
  'phat-dong': 'Phát động',
}

/** Nhãn bốn mức sinh nhanh chỉ số (T341). */
export const NHAN_MUC_DO_VI: Readonly<Record<MucDo, string>> = {
  'ngoi-sao': 'Ngôi sao',
  kha: 'Khá',
  'trung-binh': 'Trung bình',
  yeu: 'Yếu',
}

/** Ba câu cảnh báo xung đột chỉ thị (AC-7.3, T342). */
export const CANH_BAO_XUNG_DOT_VI: Readonly<Record<XungDotId, string>> = {
  'viet-vi-voi-doi-hinh-thap':
    'Bẫy việt vị cần hàng phòng ngự dâng lên cùng nhịp, nhưng đội hình thấp thì hàng phòng ngự đứng sát khung thành — bẫy gần như không bao giờ có tác dụng.',
  'pressing-cao-voi-doi-hinh-thap':
    'Pressing cao đòi vồ bóng ngay khi mất, còn đội hình thấp lại bắt lùi về trước — cầu thủ sẽ chạy nhiều mà không giành lại được bóng.',
  'tan-cong-bien-voi-doi-hinh-hep':
    'Tấn công qua hai biên cần người bám sát đường biên, nhưng đội hình hẹp lại kéo họ vào trung lộ.',
}

// ---------------------------------------------------------------------------
// 27 khối còn lại, chuyển nguyên văn từ ui/strings.ts (T317–T320)
// ---------------------------------------------------------------------------

export const FORM_DOI_VI = {
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

export const TRANG_DOI_VI = {
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

export const XOA_CAU_THU_VI = {
  tieuDe: 'Xoá cầu thủ này?',
  moTa: (ten: string, soAo: number) =>
    `Cầu thủ "${ten}" (số ${soAo}) sẽ bị xoá khỏi đội. Không hoàn tác được.`,
  xacNhan: 'Xoá cầu thủ',
} as const

export const CHAN_THUAN_VI = {
  trai: 'Trái',
  phai: 'Phải',
  'ca-hai': 'Cả hai',
} as const

export const SAO_LUU_VI = {
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

export const CHON_ANH_VI = {
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

export const CHON_MAU_AO_VI = {
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

export const BANG_CHI_SO_VI = {
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

export const FORM_CAU_THU_VI = {
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

export const LUU_TRU_VI = {
  canhBaoChuaLuu:
    'Lưu trữ của trình duyệt đã đầy nên thay đổi vừa rồi CHƯA được lưu.',
  goiYXuatTep: 'Hãy xuất dữ liệu ra tệp để không mất những gì đã nhập.',
  canhBaoKhongBen:
    'Trình duyệt không đánh dấu dữ liệu của ứng dụng là lưu trữ bền, nên dữ liệu có thể bị xoá khi máy thiếu chỗ.',
  goiYXuatTepThuongXuyen: 'Hãy xuất tệp sao lưu thường xuyên.',
} as const

export const TRANG_CHIEN_THUAT_VI = {
  tieuDe: 'Chiến thuật',
  moChienThuat: 'Chiến thuật',
  nhanChonSoDo: 'Sơ đồ',
  nhanChonQuanSo: 'Số người mỗi bên',
  nhanQuanSo: (n: number) => `${n} người`,
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

export const SAI_VI_TRI_VI = {
  nhan: (muc: MucSai, phanTramTru: number) =>
    muc === 'dung'
      ? MUC_SAI_VI_TRI_VI.dung
      : `${MUC_SAI_VI_TRI_VI[muc]} — giảm ${phanTramTru}% hiệu suất`,
  giaiThich: (tenViTriO: string, cacViTriSoTruong: string) =>
    `Ô này là ${tenViTriO}, còn vị trí sở trường của cầu thủ là ${cacViTriSoTruong}.`,
} as const

export const TINH_TRANG_DOI_HINH_VI = {
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

export const DOI_SO_DO_VI = {
  daXepLai: (tenSoDo: string) => `Đã xếp lại đội hình theo sơ đồ ${tenSoDo}.`,
  biDayRa: (ten: readonly string[]) =>
    `Không còn ô phù hợp cho ${ten.join(', ')} — những cầu thủ này đã ra ngoài sân.`,
  biXepSai: (ten: readonly string[]) =>
    `Đang xếp sai vị trí sở trường: ${ten.join(', ')}.`,
} as const

export const VAI_TRO_VI = {
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

export const CHI_THI_DOI_VI = {
  tieuDe: 'Chỉ thị toàn đội',
  moTa: 'Mỗi mức đều có cái được và cái mất — không có mức nào tốt hơn hẳn.',
  tieuDeXungDot: 'Hai chỉ thị đang chống nhau',
  ghiChuXungDot:
    'Bạn vẫn lưu được như thế này; đây chỉ là lời nhắc.',
} as const

export const BO_CHIEN_THUAT_VI = {
  tieuDe: 'Bộ chiến thuật đã lưu',
  dangDung: 'Đang dùng',
  luuThanhBo: 'Lưu thành bộ mới',
  nhanTenBo: 'Tên bộ chiến thuật',
  gidanhTenBo: 'Ví dụ: Phòng ngự chắc',
  apDung: 'Dùng bộ này',
  chuaCoBo: 'Bạn chưa lưu bộ chiến thuật nào.',
} as const

export const CHON_CAP_DAU_VI = {
  tieuDe: 'Bắt đầu một trận',
  nhanDoiNha: 'Đội chủ nhà',
  nhanDoiKhach: 'Đội khách',
  chonDoi: '— Chọn đội —',
  nhanQuanSo: 'Số người mỗi bên',
  moTaQuanSo:
    'Mỗi quân số dùng bộ chiến thuật riêng của đội, chọn ở trang chiến thuật.',
  nhanNguoi: (n: number) => `${n} người`,
  nhanThoiLuong: 'Thời lượng trận',
  moTaThoiLuong:
    'Trận ngắn thì số dòng tường thuật cũng ít đi theo, nhịp đọc giữ nguyên.',
  nhanPhut: (n: number) => `${n} phút`,
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

export const DANG_KY_DOI_HINH_VI = {
  tieuDe: 'Đăng ký đội hình',
  moTa: 'Chọn đúng 11 cầu thủ chính và đúng 7 cầu thủ dự bị.',
  nhanChinh: 'Đội hình chính',
  nhanDuBi: 'Dự bị',
  nhanNgoai: 'Không đăng ký',
  demChinh: (co: number, can: number) => `${co}/${can} chính`,
  demDuBi: (co: number, can: number) => `${co}/${can} dự bị`,
  dungTheoChienThuat: 'Lấy theo chiến thuật đã lưu',
} as const

export const LY_DO_KHONG_BAT_DAU_VI = {
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

export const TRAN_DAU_VI = {
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

export const THAY_NGUOI_VI = {
  tieuDe: 'Thay người',
  conLuot: (con: number, toiDa: number) =>
    `Còn ${con} trong ${toiDa} lượt thay.`,
  canTamDung: 'Hãy tạm dừng trận trước khi thay người.',
  nhanRa: 'Ra sân',
  nhanVao: 'Vào sân',
  chonCauThu: '— Chọn cầu thủ —',
  thucHien: 'Thay',
  hetLuot: 'Đã hết lượt thay người.',
  khongCoDuBi:
    'Đội này không đăng ký cầu thủ dự bị nào, nên trận này không thay người được.',
} as const

export const CAN_THIEP_GIUA_TRAN_VI = {
  tieuDeChiThi: 'Đổi chỉ thị giữa trận',
  moTa: 'Thay đổi chỉ áp dụng từ phút tiếp theo; những phút đã qua giữ nguyên.',
  chiDoiDuocDoiCuaBan: 'Bạn chỉ can thiệp được vào đội của mình.',
} as const

export const LICH_SU_VI = {
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
  /*
    Định dạng trận, hiện cả ở dòng danh sách lẫn ở đầu trận đang mở
    (AC-12.4, AC-12.6). Trận lưu trước spec 002 cũng hiện "11 người · 90
    phút" chứ không để trống: nó LÀ một trận 11 người 90 phút, chỉ là bản
    ghi của nó chưa kịp nói ra.
  */
  dinhDangTran: (quanSo: number, thoiLuong: number) =>
    `${quanSo} người · ${thoiLuong} phút`,
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

export const BAO_CAO_SAU_TRAN_VI = {
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

export const VAO_BAT_GON_VI = {
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

export const SO_SANH_TRAN_VI = {
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

export const TEN_SO_DO_VI: Readonly<Record<FormationId, string>> = {
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

export const MUC_SAI_VI_TRI_VI: Readonly<Record<MucSai, string>> = {
  dung: 'Đúng vị trí',
  nhe: 'Lệch nhẹ',
  vua: 'Lệch vừa',
  nang: 'Sai nặng',
}
