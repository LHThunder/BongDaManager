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

/*
  Chỉ thị chỉ còn **mã** (hiến pháp P8 bản 2.0.0, quyết định D68).

  Tên chỉ thị, tên từng mức, và câu đánh đổi của AC-7.2 đều là chữ người
  dùng đọc, nên chúng thuộc lớp ngôn ngữ `ui/ngonNgu`, tra theo `id` và
  `muc`.
*/
interface MucChiThi<M extends string> {
  readonly muc: M
}

interface MoTaChiThi<K extends ChiThiId> {
  readonly id: K
  readonly cacMuc: readonly MucChiThi<MucTheoChiThi[K]>[]
}

export const CHI_THI: { readonly [K in ChiThiId]: MoTaChiThi<K> } = {
  'do-cao-doi-hinh': {
    id: 'do-cao-doi-hinh',
    cacMuc: [{ muc: 'thap' }, { muc: 'trung-binh' }, { muc: 'cao' }],
  },
  'do-rong-doi-hinh': {
    id: 'do-rong-doi-hinh',
    cacMuc: [{ muc: 'hep' }, { muc: 'trung-binh' }, { muc: 'rong' }],
  },
  'toc-do-chuyen-bong': {
    id: 'toc-do-chuyen-bong',
    cacMuc: [{ muc: 'cham' }, { muc: 'trung-binh' }, { muc: 'nhanh' }],
  },
  'cuong-do-pressing': {
    id: 'cuong-do-pressing',
    cacMuc: [{ muc: 'thap' }, { muc: 'trung-binh' }, { muc: 'cao' }],
  },
  'huong-tan-cong': {
    id: 'huong-tan-cong',
    cacMuc: [{ muc: 'bien' }, { muc: 'can-bang' }, { muc: 'trung-lo' }],
  },
  'bay-viet-vi': {
    id: 'bay-viet-vi',
    cacMuc: [{ muc: 'tat' }, { muc: 'bat' }],
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

/*
  `tenMucChiThi` và `danhDoiCuaMuc` đã được gỡ khỏi đây: cả hai TRẢ VỀ chữ
  hiển thị, mà P8 cấm `domain` sinh ra chữ chứ không chỉ cấm `domain` chứa
  chữ. Lớp ngôn ngữ tra thẳng `NHAN_CHI_THI[id].cacMuc[muc]`, và kiểu ở đó
  đã bảo đảm mọi mức đều có nhãn nên không cần ném lỗi lúc chạy nữa.
*/

/** Mức này có thuộc chỉ thị ấy không — phép kiểm thuần cấu trúc. */
export function laMucHopLe<K extends ChiThiId>(
  id: K,
  muc: string,
): muc is MucTheoChiThi[K] {
  return CHI_THI[id].cacMuc.some((m) => m.muc === muc)
}

// ---------------------------------------------------------------------------
// Xung đột giữa các chỉ thị (AC-7.3)
// ---------------------------------------------------------------------------

/** Mã của từng kiểu xung đột, để lớp ngôn ngữ tra câu cảnh báo. */
export type XungDotId =
  | 'viet-vi-voi-doi-hinh-thap'
  | 'pressing-cao-voi-doi-hinh-thap'
  | 'tan-cong-bien-voi-doi-hinh-hep'

/*
  Xung đột mang **mã**, không mang câu chữ (T342, quyết định D68 và D76).

  Bản đầu nhét thẳng một đoạn văn tiếng Việt vào kết quả của `cacXungDot` —
  tức `domain` sinh ra chữ hiển thị, đúng thứ P8 cấm. Chỗ này lọt qua cả
  `/analyze` lẫn lần đếm nhãn ban đầu vì trường tên là `canhBao` chứ không
  phải `ten` hay `moTa`.
*/
export interface XungDot {
  readonly ma: XungDotId
  /** Các chỉ thị liên quan, để UI đánh dấu đúng ô. */
  readonly cacChiThi: readonly ChiThiId[]
}

/**
 * Những xung đột trong một bộ chỉ thị. Đây là cảnh báo, không phải lỗi:
 * bộ chỉ thị có xung đột vẫn lưu được.
 */
export function cacXungDot(bo: BoChiThi): readonly XungDot[] {
  const ketQua: XungDot[] = []

  if (bo['bay-viet-vi'] === 'bat' && bo['do-cao-doi-hinh'] === 'thap') {
    ketQua.push({
      ma: 'viet-vi-voi-doi-hinh-thap',
      cacChiThi: ['bay-viet-vi', 'do-cao-doi-hinh'],
    })
  }

  if (bo['cuong-do-pressing'] === 'cao' && bo['do-cao-doi-hinh'] === 'thap') {
    ketQua.push({
      ma: 'pressing-cao-voi-doi-hinh-thap',
      cacChiThi: ['cuong-do-pressing', 'do-cao-doi-hinh'],
    })
  }

  if (bo['huong-tan-cong'] === 'bien' && bo['do-rong-doi-hinh'] === 'hep') {
    ketQua.push({
      ma: 'tan-cong-bien-voi-doi-hinh-hep',
      cacChiThi: ['huong-tan-cong', 'do-rong-doi-hinh'],
    })
  }

  return ketQua
}
