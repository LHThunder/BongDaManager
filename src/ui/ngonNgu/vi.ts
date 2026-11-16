import type {
  ChiThiId,
  MucTheoChiThi,
  XungDotId,
} from '../../domain/instructions'
import type { MucDo } from '../../domain/generator'
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
