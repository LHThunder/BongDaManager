/*
  6 chỉ thị toàn đội (AC-7.1).

  Mỗi mức của mỗi chỉ thị kèm MỘT CÂU ĐÁNH ĐỔI (AC-7.2): chỉ thị trong bóng đá
  không có mức "tốt hơn", chỉ có mức đổi thứ này lấy thứ khác. Câu đó nằm ngay
  cạnh dữ liệu chỉ thị chứ không nằm trong UI, vì chính nó là nội dung của luật
  bóng đá (P2) — Giai đoạn 3 cũng đọc cùng bảng này để tính ảnh hưởng.

  `cacXungDot` không CHẶN người dùng, chỉ nêu ra (AC-7.3): chơi đội hình thấp mà
  vẫn bật bẫy việt vị là một lựa chọn tồi, nhưng là lựa chọn của người dùng.
*/

/** Các mức hợp lệ của từng chỉ thị. Khai một chỗ để kiểu không lệch nhau. */
export interface MucTheoChiThi {
  'do-cao-doi-hinh': 'thap' | 'trung-binh' | 'cao'
  'do-rong-doi-hinh': 'hep' | 'trung-binh' | 'rong'
  'toc-do-chuyen-bong': 'cham' | 'trung-binh' | 'nhanh'
  'cuong-do-pressing': 'thap' | 'trung-binh' | 'cao'
  'huong-tan-cong': 'bien' | 'can-bang' | 'trung-lo'
  'bay-viet-vi': 'tat' | 'bat'
}

export type ChiThiId = keyof MucTheoChiThi

/** Một bộ chỉ thị đầy đủ: cả 6 chỉ thị đều phải có mức. */
export type BoChiThi = {
  readonly [K in ChiThiId]: MucTheoChiThi[K]
}

interface MucChiThi<M extends string> {
  readonly muc: M
  /** Tên hiển thị của mức, tiếng Việt (P8). */
  readonly ten: string
  /** Câu đánh đổi: được gì, mất gì (AC-7.2). */
  readonly danhDoi: string
}

interface MoTaChiThi<K extends ChiThiId> {
  readonly id: K
  readonly ten: string
  readonly cacMuc: readonly MucChiThi<MucTheoChiThi[K]>[]
}

export const CHI_THI: { readonly [K in ChiThiId]: MoTaChiThi<K> } = {
  'do-cao-doi-hinh': {
    id: 'do-cao-doi-hinh',
    ten: 'Độ cao đội hình',
    cacMuc: [
      {
        muc: 'thap',
        ten: 'Thấp',
        danhDoi:
          'Bịt kín khoảng trống sau lưng hàng phòng ngự, nhưng nhường hẳn phần sân giữa cho đối thủ cầm bóng.',
      },
      {
        muc: 'trung-binh',
        ten: 'Trung bình',
        danhDoi:
          'Cân giữa khoảng trống phía sau và khoảng cách tới khung thành đối phương, không nghiêng về bên nào.',
      },
      {
        muc: 'cao',
        ten: 'Cao',
        danhDoi:
          'Dồn đối thủ về sân họ và giành lại bóng gần khung thành họ, nhưng hở khoảng trống sau lưng cho bóng dài.',
      },
    ],
  },

  'do-rong-doi-hinh': {
    id: 'do-rong-doi-hinh',
    ten: 'Độ rộng đội hình',
    cacMuc: [
      {
        muc: 'hep',
        ten: 'Hẹp',
        danhDoi:
          'Khoá chặt trung lộ và dễ bọc lót cho nhau, nhưng bỏ trống hai hành lang biên.',
      },
      {
        muc: 'trung-binh',
        ten: 'Trung bình',
        danhDoi:
          'Phủ được cả trung lộ và biên ở mức vừa phải, không bịt kín hướng nào.',
      },
      {
        muc: 'rong',
        ten: 'Rộng',
        danhDoi:
          'Kéo giãn hàng phòng ngự đối thủ và mở đường ra biên, nhưng để lộ khoảng cách giữa các cầu thủ ở giữa sân.',
      },
    ],
  },

  'toc-do-chuyen-bong': {
    id: 'toc-do-chuyen-bong',
    ten: 'Tốc độ chuyển bóng',
    cacMuc: [
      {
        muc: 'cham',
        ten: 'Chậm',
        danhDoi:
          'Giữ bóng chắc và ít mất bóng, nhưng cho đối thủ thời gian về kịp vị trí.',
      },
      {
        muc: 'trung-binh',
        ten: 'Trung bình',
        danhDoi:
          'Luân chuyển vừa nhịp: không hối bóng, cũng không bỏ lỡ cơ hội rõ ràng.',
      },
      {
        muc: 'nhanh',
        ten: 'Nhanh',
        danhDoi:
          'Khai thác được lúc đối thủ chưa kịp lùi, nhưng đường chuyền mạo hiểm nên mất bóng nhiều hơn.',
      },
    ],
  },

  'cuong-do-pressing': {
    id: 'cuong-do-pressing',
    ten: 'Cường độ pressing',
    cacMuc: [
      {
        muc: 'thap',
        ten: 'Thấp',
        danhDoi:
          'Giữ được vị trí và tiết kiệm thể lực, nhưng để đối thủ chuyền bóng thoải mái.',
      },
      {
        muc: 'trung-binh',
        ten: 'Trung bình',
        danhDoi:
          'Gây áp lực có chọn lọc, giữ hình hài đội hình và không rút cạn thể lực.',
      },
      {
        muc: 'cao',
        ten: 'Cao',
        danhDoi:
          'Giành lại bóng sớm và ép đối thủ sai, nhưng tốn thể lực và để lại khoảng trống khi vồ bóng không thành.',
      },
    ],
  },

  'huong-tan-cong': {
    id: 'huong-tan-cong',
    ten: 'Hướng tấn công',
    cacMuc: [
      {
        muc: 'bien',
        ten: 'Qua hai biên',
        danhDoi:
          'Tránh được chỗ đông người ở giữa và tạo nhiều quả tạt, nhưng phụ thuộc vào người dứt điểm trong vòng cấm.',
      },
      {
        muc: 'can-bang',
        ten: 'Cân bằng',
        danhDoi:
          'Khó bị bắt bài vì đổi hướng liên tục, nhưng không dồn sức vào hướng mạnh nhất của đội.',
      },
      {
        muc: 'trung-lo',
        ten: 'Qua trung lộ',
        danhDoi:
          'Đi đường ngắn nhất tới khung thành, nhưng phải xuyên qua nơi đối thủ đông người nhất.',
      },
    ],
  },

  'bay-viet-vi': {
    id: 'bay-viet-vi',
    ten: 'Bẫy việt vị',
    cacMuc: [
      {
        muc: 'tat',
        ten: 'Tắt',
        danhDoi:
          'Hàng phòng ngự lùi theo bóng nên ít bị xuyên phá, nhưng không cắt được những đường phát động từ xa.',
      },
      {
        muc: 'bat',
        ten: 'Bật',
        danhDoi:
          'Dâng lên cùng lúc để bắt việt vị và chặn bóng từ xa, nhưng một nhịp lệch là đối thủ thoát xuống một mình.',
      },
    ],
  },
}

/** Thứ tự hiển thị 6 chỉ thị. */
export const THU_TU_CHI_THI: readonly ChiThiId[] = [
  'do-cao-doi-hinh',
  'do-rong-doi-hinh',
  'toc-do-chuyen-bong',
  'cuong-do-pressing',
  'huong-tan-cong',
  'bay-viet-vi',
]

/**
 * Bộ chỉ thị của đội mới: trung tính ở mọi chỉ thị, và theo đúng AC-7.3 thì
 * KHÔNG được sinh ra xung đột nào.
 */
export const CHI_THI_MAC_DINH: BoChiThi = {
  'do-cao-doi-hinh': 'trung-binh',
  'do-rong-doi-hinh': 'trung-binh',
  'toc-do-chuyen-bong': 'trung-binh',
  'cuong-do-pressing': 'trung-binh',
  'huong-tan-cong': 'can-bang',
  'bay-viet-vi': 'tat',
}

export function tenMucChiThi<K extends ChiThiId>(
  id: K,
  muc: MucTheoChiThi[K],
): string {
  const mo = CHI_THI[id].cacMuc.find((m) => m.muc === muc)
  if (!mo) {
    throw new Error(`Mức không hợp lệ cho chỉ thị ${id}: ${muc}`)
  }
  return mo.ten
}

export function danhDoiCuaMuc<K extends ChiThiId>(
  id: K,
  muc: MucTheoChiThi[K],
): string {
  const mo = CHI_THI[id].cacMuc.find((m) => m.muc === muc)
  if (!mo) {
    throw new Error(`Mức không hợp lệ cho chỉ thị ${id}: ${muc}`)
  }
  return mo.danhDoi
}

// ---------------------------------------------------------------------------
// Xung đột giữa các chỉ thị (AC-7.3)
// ---------------------------------------------------------------------------

export interface XungDot {
  /** Các chỉ thị liên quan, để UI đánh dấu đúng ô. */
  readonly cacChiThi: readonly ChiThiId[]
  /** Câu cảnh báo, tiếng Việt (P8). */
  readonly canhBao: string
}

/**
 * Những xung đột trong một bộ chỉ thị. Đây là cảnh báo, không phải lỗi:
 * bộ chỉ thị có xung đột vẫn lưu được.
 */
export function cacXungDot(bo: BoChiThi): readonly XungDot[] {
  const ketQua: XungDot[] = []

  if (bo['bay-viet-vi'] === 'bat' && bo['do-cao-doi-hinh'] === 'thap') {
    ketQua.push({
      cacChiThi: ['bay-viet-vi', 'do-cao-doi-hinh'],
      canhBao:
        'Bẫy việt vị cần hàng phòng ngự dâng lên cùng nhịp, nhưng đội hình thấp thì hàng phòng ngự đứng sát khung thành — bẫy gần như không bao giờ có tác dụng.',
    })
  }

  if (bo['cuong-do-pressing'] === 'cao' && bo['do-cao-doi-hinh'] === 'thap') {
    ketQua.push({
      cacChiThi: ['cuong-do-pressing', 'do-cao-doi-hinh'],
      canhBao:
        'Pressing cao đòi vồ bóng ngay khi mất, còn đội hình thấp lại bắt lùi về trước — cầu thủ sẽ chạy nhiều mà không giành lại được bóng.',
    })
  }

  if (bo['huong-tan-cong'] === 'bien' && bo['do-rong-doi-hinh'] === 'hep') {
    ketQua.push({
      cacChiThi: ['huong-tan-cong', 'do-rong-doi-hinh'],
      canhBao:
        'Tấn công qua hai biên cần người bám sát đường biên, nhưng đội hình hẹp lại kéo họ vào trung lộ.',
    })
  }

  return ketQua
}
