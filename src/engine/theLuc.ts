import type { MucTheoChiThi } from '../domain/instructions'

/*
  Thể lực theo phút (AC-8.6, AC-8.7, quyết định D26).

  AC-8.6 đòi tốc độ giảm phụ thuộc HAI thứ: chỉ số Thể lực của cầu thủ và
  cường độ pressing của đội. Một hàm giảm đều theo phút không thoả được — nên
  ở đây có đúng hai biến đó, và test kiểm từng biến một.
*/

export type MucPressing = MucTheoChiThi['cuong-do-pressing']

export const THE_LUC_DAY = 100

/** Dưới mức này thì cầu thủ bị coi là kiệt sức (AC-8.7). */
export const NGUONG_KIET_SUC = 30

/** Tiêu hao nền mỗi phút, trước khi cân theo chỉ số và pressing. */
const TIEU_HAO_NEN = 0.75

/*
  Chỉ số Thể lực 1..20 quy về hệ số nhân: người thể lực 20 tiêu hao khoảng
  60% so với người thể lực 1. Không để người khoẻ nhất bất tử, cũng không để
  người yếu nhất gục giữa hiệp một.
*/
const HE_SO_THEO_CHI_SO_MIN = 0.6
const HE_SO_THEO_CHI_SO_MAX = 1.4

const HE_SO_THEO_PRESSING: Readonly<Record<MucPressing, number>> = {
  thap: 0.8,
  'trung-binh': 1,
  cao: 1.35,
}

/**
 * Hệ số tiêu hao theo chỉ số Thể lực của cầu thủ: chỉ số càng cao, tiêu hao
 * càng ít. Chỉ số chưa điền thì coi như trung bình — cầu thủ hồ sơ chưa đủ
 * đã bị AC-5.7 chặn khỏi đội hình rồi, đây chỉ là đường lui an toàn.
 */
export function heSoTheoChiSo(chiSoTheLuc: number | undefined): number {
  const chiSo = chiSoTheLuc ?? 10
  const tiLe = (Math.min(Math.max(chiSo, 1), 20) - 1) / 19
  return HE_SO_THEO_CHI_SO_MAX - tiLe * (HE_SO_THEO_CHI_SO_MAX - HE_SO_THEO_CHI_SO_MIN)
}

/** Lượng thể lực mất đi trong một phút. */
export function tieuHaoMotPhut(
  chiSoTheLuc: number | undefined,
  mucPressing: MucPressing,
): number {
  return (
    TIEU_HAO_NEN *
    heSoTheoChiSo(chiSoTheLuc) *
    HE_SO_THEO_PRESSING[mucPressing]
  )
}

/** Thể lực còn lại sau một phút; không bao giờ xuống dưới 0. */
export function theLucSauMotPhut(
  theLucHienTai: number,
  chiSoTheLuc: number | undefined,
  mucPressing: MucPressing,
): number {
  const conLai = theLucHienTai - tieuHaoMotPhut(chiSoTheLuc, mucPressing)
  return Math.max(0, conLai)
}

export function daKietSuc(theLuc: number): boolean {
  return theLuc < NGUONG_KIET_SUC
}
