/*
  Lỗi của lớp services, mang MÃ chứ không mang câu tiếng Việt.

  Lớp `services` phải sạch khỏi chuỗi hiển thị: việc dịch mã sang câu tiếng
  Việt là việc của `ui/ngonNgu/` (P8 áp dụng ở biên giao diện). Nhờ vậy một
  mã lỗi chỉ có một câu duy nhất trên toàn ứng dụng, và test của services
  không phải so sánh chuỗi tiếng Việt.
*/

export type MaLoi =
  /** Tên đội để trống (AC-1.3). */
  | 'EmptyName'
  /** Không tìm thấy bản ghi theo id. */
  | 'NotFound'
  /** Số áo đã có cầu thủ khác trong cùng đội dùng (AC-2.5). */
  | 'DuplicateShirtNumber'
  /** Giá trị chỉ số ngoài 1..20 hoặc không phải số (AC-2.4). */
  | 'InvalidAttributeValue'
  /** Tổ hợp vị trí sở trường không hợp lệ, ví dụ thủ môn kiêm vị trí sân (AC-2.1b). */
  | 'InvalidPositions'
  /** Tệp người dùng chọn không phải ảnh (AC-3.3). */
  | 'NotAnImage'
  /** Ảnh không giải mã được (AC-3.3). */
  | 'DecodeFailed'
  /** Tệp sao lưu không phải JSON (AC-4.5). */
  | 'NotJson'
  /** Tệp sao lưu sai hình dạng (AC-4.5). */
  | 'SchemaInvalid'
  /** Tệp sao lưu đến từ bản ứng dụng mới hơn (AC-4.5). */
  | 'VersionTooNew'
  /** Lưu trữ của trình duyệt đã đầy (AC-4.7). */
  | 'QuotaExceeded'
  /** Không mở được lưu trữ của trình duyệt. */
  | 'StorageUnavailable'
  /** Mã màu không hợp lệ (AC-3.8). */
  | 'InvalidColor'
  /**
   * Bộ chiến thuật sai hình dạng: không đủ ô, ô lạ, cầu thủ không thuộc đội,
   * một cầu thủ ở hai ô, hoặc vai trò không áp dụng được cho vị trí của ô.
   */
  | 'InvalidTactic'

/**
 * Thông tin kèm theo lỗi, để `ui/ngonNgu/` ghép được câu cụ thể —
 * ví dụ nêu đúng tên chỉ số nào sai, hay số áo nào đang trùng.
 */
export interface ChiTietLoi {
  readonly truong?: string
  readonly giaTri?: string | number
  readonly duongDan?: string
}

export class LoiUngDung extends Error {
  readonly ma: MaLoi
  readonly chiTiet: ChiTietLoi

  constructor(ma: MaLoi, chiTiet: ChiTietLoi = {}, nguyenNhan?: unknown) {
    super(`${ma}${chiTiet.truong ? ` (${chiTiet.truong})` : ''}`, {
      cause: nguyenNhan,
    })
    this.name = 'LoiUngDung'
    this.ma = ma
    this.chiTiet = chiTiet
  }
}

export function laLoiUngDung(loi: unknown): loi is LoiUngDung {
  return loi instanceof LoiUngDung
}

export function laLoi(loi: unknown, ma: MaLoi): loi is LoiUngDung {
  return laLoiUngDung(loi) && loi.ma === ma
}

/**
 * Nhận diện lỗi hết dung lượng của IndexedDB và quy về `QuotaExceeded`,
 * để AC-4.7 chỉ cần xử lý một mã duy nhất ở một chỗ duy nhất.
 */
export function chuanHoaLoiLuuTru(loi: unknown): LoiUngDung {
  if (laLoiUngDung(loi)) {
    return loi
  }

  const ten = loi instanceof Error ? loi.name : ''
  if (ten === 'QuotaExceededError') {
    return new LoiUngDung('QuotaExceeded', {}, loi)
  }

  return new LoiUngDung('StorageUnavailable', {}, loi)
}
