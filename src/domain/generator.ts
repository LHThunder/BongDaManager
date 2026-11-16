import { POSITION_WEIGHTS } from './attributes'
import { chiSoCanCo } from './completeness'
import { CHI_SO_MAX, CHI_SO_MIN } from './types'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
  Rng,
} from './types'

/*
  Sinh nhanh chỉ số (AC-2.9).

  Đây là biện pháp chính cho rủi ro R3 trong plan: một đội 25 cầu thủ là
  khoảng 375 ô phải điền tay, và nếu việc đó quá mệt thì người dùng sẽ không
  bao giờ có đội thứ hai để đấu.

  Hàm nhận nguồn ngẫu nhiên qua tham số và KHÔNG gọi `Math.random` —
  nguyên tắc P1 của hiến pháp. Nhờ vậy cùng một nguồn giả thì ra cùng kết quả,
  và test kiểm được điều đó.
*/

export type MucDo = 'ngoi-sao' | 'kha' | 'trung-binh' | 'yeu'

export interface MucDoMeta {
  readonly id: MucDo
}

/*
  Bốn mức chỉ còn **mã** (T341, quyết định D68). Nhãn nằm ở lớp ngôn ngữ.
*/
export const CAC_MUC_DO: readonly MucDoMeta[] = [
  { id: 'ngoi-sao' },
  { id: 'kha' },
  { id: 'trung-binh' },
  { id: 'yeu' },
]

/** Mức nền cho những chỉ số KHÔNG liên quan tới vị trí của cầu thủ. */
const NEN_THEO_MUC: Readonly<Record<MucDo, number>> = {
  'ngoi-sao': 11,
  kha: 9,
  'trung-binh': 7,
  yeu: 5,
}

/** Cộng thêm theo trọng số của chỉ số với vị trí: càng quan trọng càng cao. */
const CONG_THEO_TRONG_SO: Readonly<Record<number, number>> = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
}

/** Biên độ dao động quanh giá trị đích, để hai cầu thủ cùng mức không giống hệt. */
const BIEN_DO = 2

function nhieu(rng: Rng): number {
  return Math.round((rng.next() * 2 - 1) * BIEN_DO)
}

function ganTrongKhoang(giaTri: number): number {
  return Math.min(CHI_SO_MAX, Math.max(CHI_SO_MIN, giaTri))
}

/**
 * Trọng số cao nhất của một chỉ số trên TẤT CẢ vị trí sở trường của cầu thủ.
 * Nhờ vậy một cầu thủ đá được cả trung vệ và tiền vệ trụ sẽ mạnh ở chỉ số
 * quan trọng của cả hai vị trí, chứ không chỉ vị trí đầu tiên.
 */
function trongSoCaoNhat(
  positions: readonly PositionId[],
  id: AttributeId,
): number {
  let cao = 0
  for (const viTri of positions) {
    const w = POSITION_WEIGHTS[viTri].attributes[id] ?? 0
    if (w > cao) cao = w
  }
  return cao
}

function trongSoThuMonCaoNhat(
  positions: readonly PositionId[],
  id: GkAttributeId,
): number {
  let cao = 0
  for (const viTri of positions) {
    const w = POSITION_WEIGHTS[viTri].gkAttributes?.[id] ?? 0
    if (w > cao) cao = w
  }
  return cao
}

export interface ChiSoDaSinh {
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

/**
 * Sinh đủ bộ chỉ số cho một cầu thủ theo mức và theo vị trí sở trường.
 *
 * Thứ tự lấy số từ `rng` là cố định (theo thứ tự chỉ số trong `chiSoCanCo`),
 * nên cùng một nguồn ngẫu nhiên luôn cho ra cùng kết quả.
 */
export function sinhChiSo(
  muc: MucDo,
  positions: readonly PositionId[],
  rng: Rng,
): ChiSoDaSinh {
  const canCo = chiSoCanCo(positions)
  const nen = NEN_THEO_MUC[muc]

  const attributes: Record<string, number> = {}
  for (const id of canCo.attributes) {
    const w = trongSoCaoNhat(positions, id)
    attributes[id] = ganTrongKhoang(nen + (CONG_THEO_TRONG_SO[w] ?? 0) + nhieu(rng))
  }

  if (canCo.gkAttributes.length === 0) {
    return { attributes: attributes as AttributeValues, gkAttributes: null }
  }

  const gkAttributes: Record<string, number> = {}
  for (const id of canCo.gkAttributes) {
    const w = trongSoThuMonCaoNhat(positions, id)
    gkAttributes[id] = ganTrongKhoang(
      nen + (CONG_THEO_TRONG_SO[w] ?? 0) + nhieu(rng),
    )
  }

  return {
    attributes: attributes as AttributeValues,
    gkAttributes: gkAttributes as GkAttributeValues,
  }
}
