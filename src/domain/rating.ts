import { POSITION_WEIGHTS } from './attributes'
import { daDien } from './completeness'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
} from './types'

export interface HoSoChamDiem {
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

export type KetQuaChiSoTong =
  | { readonly tinhDuoc: true; readonly diem: number }
  | {
      readonly tinhDuoc: false
      readonly thieu: readonly (AttributeId | GkAttributeId)[]
    }

/**
 * Chỉ số tổng của một cầu thủ TẠI MỘT VỊ TRÍ cụ thể (AC-2.11).
 *
 * Là trung bình có trọng số của những chỉ số mà vị trí đó cần, lấy từ bảng
 * trọng số dùng chung trong `attributes.ts` (quyết định D10). Vì mỗi vị trí
 * có bảng trọng số riêng, cùng một cầu thủ cho ra con số khác nhau ở hai
 * vị trí khác nhau — đó chính là điều AC-2.11 đòi.
 *
 * Thiếu dù một chỉ số mà vị trí cần thì KHÔNG trả về số: trả một con số tính
 * trên dữ liệu không đầy đủ là nói sai với người dùng.
 */
export function chiSoTongTheoViTri(
  hoSo: HoSoChamDiem,
  positionId: PositionId,
): KetQuaChiSoTong {
  const trongSo = POSITION_WEIGHTS[positionId]
  const thieu: (AttributeId | GkAttributeId)[] = []

  let tongTich = 0
  let tongTrongSo = 0

  for (const [id, w] of Object.entries(trongSo.attributes) as [
    AttributeId,
    number,
  ][]) {
    const giaTri = hoSo.attributes[id]
    if (!daDien(giaTri)) {
      thieu.push(id)
      continue
    }
    tongTich += (giaTri as number) * w
    tongTrongSo += w
  }

  for (const [id, w] of Object.entries(trongSo.gkAttributes ?? {}) as [
    GkAttributeId,
    number,
  ][]) {
    const giaTri = hoSo.gkAttributes?.[id]
    if (!daDien(giaTri)) {
      thieu.push(id)
      continue
    }
    tongTich += (giaTri as number) * w
    tongTrongSo += w
  }

  if (thieu.length > 0 || tongTrongSo === 0) {
    return { tinhDuoc: false, thieu }
  }

  return { tinhDuoc: true, diem: Math.round((tongTich / tongTrongSo) * 10) / 10 }
}

/**
 * Vị trí sở trường mà cầu thủ được chấm cao nhất, kèm điểm.
 * Dùng để hiện "vị trí tốt nhất" trong danh sách đội.
 */
export function viTriTotNhat(
  hoSo: HoSoChamDiem,
  positions: readonly PositionId[],
): { readonly viTri: PositionId; readonly diem: number } | null {
  let totNhat: { viTri: PositionId; diem: number } | null = null

  for (const viTri of positions) {
    const kq = chiSoTongTheoViTri(hoSo, viTri)
    if (kq.tinhDuoc && (totNhat === null || kq.diem > totNhat.diem)) {
      totNhat = { viTri, diem: kq.diem }
    }
  }

  return totNhat
}
