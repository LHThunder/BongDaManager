import type { Position, PositionId } from './types'

/** 12 vị trí sở trường (AC-2.1), theo thứ tự từ khung thành ra phía trước. */
export const POSITIONS: readonly Position[] = [
  { id: 'GK', tuyen: 'thu-mon', ben: 'giua' },

  { id: 'DL', tuyen: 'phong-ngu', ben: 'trai' },
  { id: 'DC', tuyen: 'phong-ngu', ben: 'giua' },
  { id: 'DR', tuyen: 'phong-ngu', ben: 'phai' },

  { id: 'DM', tuyen: 'tien-ve', ben: 'giua' },
  { id: 'ML', tuyen: 'tien-ve', ben: 'trai' },
  { id: 'MC', tuyen: 'tien-ve', ben: 'giua' },
  { id: 'MR', tuyen: 'tien-ve', ben: 'phai' },

  { id: 'AML', tuyen: 'tan-cong', ben: 'trai' },
  { id: 'AM', tuyen: 'tan-cong', ben: 'giua' },
  { id: 'AMR', tuyen: 'tan-cong', ben: 'phai' },
  { id: 'ST', tuyen: 'tan-cong', ben: 'giua' },
]

const THEO_ID = new Map<PositionId, Position>(POSITIONS.map((p) => [p.id, p]))

export function layViTri(id: PositionId): Position {
  const viTri = THEO_ID.get(id)
  if (!viTri) {
    throw new Error(`Vị trí không tồn tại: ${id}`)
  }
  return viTri
}

/** Vị trí thủ môn là vị trí duy nhất thuộc tuyến 'thu-mon'. */
export function laViTriThuMon(id: PositionId): boolean {
  return layViTri(id).tuyen === 'thu-mon'
}

/** Cầu thủ là thủ môn khi — và chỉ khi — vị trí sở trường của họ là Thủ môn. */
export function laThuMon(positions: readonly PositionId[]): boolean {
  return positions.some(laViTriThuMon)
}

export type LoiToHopViTri =
  /** Chưa chọn vị trí nào. */
  | 'chua-chon-vi-tri'
  /** Có vị trí lặp lại trong danh sách. */
  | 'vi-tri-trung-lap'
  /** Thủ môn đứng cùng một vị trí sân — bị cấm bởi AC-2.1b. */
  | 'thu-mon-kiem-vi-tri-san'

export type KetQuaToHopViTri =
  | { hopLe: true }
  | { hopLe: false; loi: LoiToHopViTri }

/**
 * Kiểm tra một tổ hợp vị trí sở trường có hợp lệ hay không (AC-2.1b).
 *
 * Thủ môn có bộ chỉ số riêng của thủ môn, nên một cầu thủ là thủ môn HOẶC
 * cầu thủ sân, không kiêm cả hai. Nếu cho kiêm thì cầu thủ sẽ thiếu chính
 * những chỉ số mà vị trí sân của họ cần để tính chỉ số tổng (AC-2.11).
 */
export function kiemTraToHopViTri(
  positions: readonly PositionId[],
): KetQuaToHopViTri {
  if (positions.length === 0) {
    return { hopLe: false, loi: 'chua-chon-vi-tri' }
  }

  if (new Set(positions).size !== positions.length) {
    return { hopLe: false, loi: 'vi-tri-trung-lap' }
  }

  const soThuMon = positions.filter(laViTriThuMon).length
  if (soThuMon > 0 && positions.length > 1) {
    return { hopLe: false, loi: 'thu-mon-kiem-vi-tri-san' }
  }

  return { hopLe: true }
}

/**
 * Những vị trí còn chọn được khi đã chọn `dangChon`.
 * Dùng để vô hiệu hoá lựa chọn xung đột ngay trên giao diện (AC-2.1b).
 */
export function cacViTriConChonDuoc(
  dangChon: readonly PositionId[],
): readonly PositionId[] {
  if (dangChon.length === 0) {
    return POSITIONS.map((p) => p.id)
  }

  // Đã chọn thủ môn thì không thêm được gì nữa.
  if (laThuMon(dangChon)) {
    return []
  }

  // Đã chọn vị trí sân thì thủ môn bị loại khỏi danh sách.
  return POSITIONS.filter((p) => !laViTriThuMon(p.id) && !dangChon.includes(p.id)).map(
    (p) => p.id,
  )
}
