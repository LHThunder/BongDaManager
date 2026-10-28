import { laThuMon, laViTriThuMon, layViTri } from './positions'
import type { PositionId, PositionLine } from './types'

/*
  Ba mức sai vị trí và mức trừ hiệu suất tương ứng (AC-5.5).

  Mức được suy ra từ `tuyen` và `ben` đã có trong POSITIONS (quyết định D16),
  không dùng bảng tra tay 12×12 — bảng tay là 144 ô phải tự nhất quán, và mỗi
  lần thêm vị trí lại phải sửa cả bảng.

  `MUC_TRU_HIEU_SUAT` là con số mà Giai đoạn 3 sẽ dùng: AC-8.5 nói hiệu suất
  của cầu thủ xếp sai vị trí phải giảm, và giảm nặng dần theo ba mức này.
*/

export type MucSai = 'dung' | 'nhe' | 'vua' | 'nang'

/** Phần hiệu suất bị trừ, dạng tỉ lệ 0..1. */
export const MUC_TRU_HIEU_SUAT: Readonly<Record<MucSai, number>> = {
  dung: 0,
  nhe: 0.1,
  vua: 0.25,
  nang: 0.45,
}

/** Thứ tự từ nhẹ tới nặng, để so sánh và để lấy mức nhẹ nhất. */
export const THU_TU_MUC_SAI: readonly MucSai[] = ['dung', 'nhe', 'vua', 'nang']

const CHI_SO_TUYEN: Readonly<Record<PositionLine, number>> = {
  'thu-mon': 0,
  'phong-ngu': 1,
  'tien-ve': 2,
  'tan-cong': 3,
}

function nheHon(a: MucSai, b: MucSai): MucSai {
  return THU_TU_MUC_SAI.indexOf(a) <= THU_TU_MUC_SAI.indexOf(b) ? a : b
}

/** Mức sai khi một cầu thủ có ĐÚNG MỘT vị trí sở trường đứng vào ô. */
function mucSaiMotViTri(viTriO: PositionId, viTriCauThu: PositionId): MucSai {
  if (viTriO === viTriCauThu) return 'dung'

  const oLaThuMon = laViTriThuMon(viTriO)
  const nguoiLaThuMon = laViTriThuMon(viTriCauThu)

  // Thủ môn ra sân, hoặc cầu thủ sân vào khung: luôn là mức nặng nhất.
  if (oLaThuMon !== nguoiLaThuMon) return 'nang'

  const lechTuyen = Math.abs(
    CHI_SO_TUYEN[layViTri(viTriO).tuyen] -
      CHI_SO_TUYEN[layViTri(viTriCauThu).tuyen],
  )

  // Cùng tuyến mà không trùng vị trí nghĩa là lệch trái/phải.
  if (lechTuyen === 0) return 'nhe'
  if (lechTuyen === 1) return 'vua'
  return 'nang'
}

/**
 * Mức sai vị trí của một cầu thủ khi đứng vào một ô (AC-5.5).
 *
 * Cầu thủ nhiều vị trí sở trường thì lấy mức **nhẹ nhất** trong các vị trí của
 * họ: một người đá được cả trung vệ và tiền vệ trụ thì đứng trung vệ không bị
 * tính là sai, dù tiền vệ trụ có đứng trước trong danh sách.
 */
export function mucSaiViTri(
  viTriO: PositionId,
  viTriSoTruong: readonly PositionId[],
): MucSai {
  if (viTriSoTruong.length === 0) return 'nang'

  let nhe: MucSai = 'nang'
  for (const viTri of viTriSoTruong) {
    nhe = nheHon(nhe, mucSaiMotViTri(viTriO, viTri))
    if (nhe === 'dung') break
  }
  return nhe
}

/** Cầu thủ này có đứng được trong khung thành không — dùng cho AC-5.7. */
export function laThuMonThucThu(viTriSoTruong: readonly PositionId[]): boolean {
  return laThuMon(viTriSoTruong)
}
