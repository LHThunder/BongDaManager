import { CHI_SO_MAX, CHI_SO_MIN } from '../domain/types'
import type { MucPressing } from './theLuc'

/*
  Thẻ vàng, thẻ đỏ và đá thiếu người (AC-8.13, quyết định D28).

  AC-8.13 đòi xác suất ăn thẻ cao hơn ở HAI điều kiện: cầu thủ Quyết đoán
  thấp, và đội đang pressing cường độ cao. Test kiểm từng điều kiện một, giữ
  điều kiện còn lại cố định.

  Thẻ không phải trang trí: thẻ đỏ bỏ hẳn một ô khỏi đội hình tới hết trận và
  không được thay người bù. Nếu thẻ chỉ là một dòng tường thuật thì người dùng
  chẳng có lý do gì quan tâm tới Quyết đoán hay mức pressing.
*/

export type TheDaNhan = 'vang' | 'vang-vang' | 'do'

/** Xác suất nền ăn thẻ khi một pha phạm lỗi xảy ra. */
const XAC_SUAT_NEN = 0.09

/** Quyết đoán 1 nhân chừng này; Quyết đoán 20 nhân phần còn lại. */
const HE_SO_QUYET_DOAN_THAP = 1.6
const HE_SO_QUYET_DOAN_CAO = 0.5

const HE_SO_PRESSING: Readonly<Record<MucPressing, number>> = {
  thap: 0.8,
  'trung-binh': 1,
  cao: 1.4,
}

/** Phần thẻ vàng bị đẩy thẳng lên thẻ đỏ (lỗi nghiêm trọng). */
const TI_LE_THE_DO_TRUC_TIEP = 0.06

/**
 * Xác suất một pha phạm lỗi dẫn tới thẻ.
 *
 * Quyết đoán chưa điền thì coi như trung bình — cầu thủ hồ sơ chưa hoàn tất
 * đã bị AC-5.7 chặn khỏi đội hình.
 */
export function xacSuatAnThe(
  quyetDoan: number | undefined,
  mucPressing: MucPressing,
): number {
  const chiSo = Math.min(Math.max(quyetDoan ?? 10, CHI_SO_MIN), CHI_SO_MAX)
  const tiLe = (chiSo - CHI_SO_MIN) / (CHI_SO_MAX - CHI_SO_MIN)
  const heSoQuyetDoan =
    HE_SO_QUYET_DOAN_THAP - tiLe * (HE_SO_QUYET_DOAN_THAP - HE_SO_QUYET_DOAN_CAO)

  return XAC_SUAT_NEN * heSoQuyetDoan * HE_SO_PRESSING[mucPressing]
}

/** Pha phạm lỗi này có phải lỗi nghiêm trọng (thẻ đỏ trực tiếp) không. */
export function laLoiNghiemTrong(q: number): boolean {
  return q < TI_LE_THE_DO_TRUC_TIEP
}

export interface KetQuaRutThe {
  readonly theSauDo: TheDaNhan
  /** true thì cầu thủ rời sân tới hết trận, không được thay người bù. */
  readonly roiSan: boolean
}

/**
 * Rút thẻ cho một cầu thủ. Thẻ vàng thứ hai thành thẻ đỏ và rời sân; thẻ đỏ
 * trực tiếp cũng rời sân ngay.
 */
export function rutThe(
  theHienTai: TheDaNhan | undefined,
  nghiemTrong: boolean,
): KetQuaRutThe {
  if (nghiemTrong) {
    return { theSauDo: 'do', roiSan: true }
  }
  if (theHienTai === 'vang') {
    return { theSauDo: 'vang-vang', roiSan: true }
  }
  return { theSauDo: 'vang', roiSan: false }
}

/** Cầu thủ đã rời sân vì thẻ chưa — người này không bao giờ quay lại. */
export function daRoiSanVivThe(the: TheDaNhan | undefined): boolean {
  return the === 'do' || the === 'vang-vang'
}
