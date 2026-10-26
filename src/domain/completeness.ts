import { ATTRIBUTES, GK_ATTRIBUTES, GK_CHI_SO_CHUNG } from './attributes'
import { kiemTraToHopViTri, laThuMon } from './positions'
import { CHI_SO_MAX, CHI_SO_MIN } from './types'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
} from './types'

export interface ChiSoCanCo {
  readonly attributes: readonly AttributeId[]
  readonly gkAttributes: readonly GkAttributeId[]
}

const TAT_CA_CHI_SO_SAN: readonly AttributeId[] = ATTRIBUTES.map((a) => a.id)
const TAT_CA_CHI_SO_THU_MON: readonly GkAttributeId[] = GK_ATTRIBUTES.map(
  (a) => a.id,
)

/**
 * Danh sách chỉ số mà một cầu thủ cần điền, quyết định bởi vị trí sở trường.
 *
 * Nhờ AC-2.1b (thủ môn không kiêm vị trí sân) chỉ có đúng HAI trường hợp:
 *   - thủ môn      -> 8 chỉ số chung được phép + 3 chỉ số riêng  = 11 ô
 *   - cầu thủ sân  -> cả 15 chỉ số chung                          = 15 ô
 *
 * Không có trường hợp thứ ba. Tổ hợp vị trí không hợp lệ bị ném lỗi ngay chứ
 * không được âm thầm trả về một bộ chỉ số đoán bừa.
 */
export function chiSoCanCo(positions: readonly PositionId[]): ChiSoCanCo {
  const ketQua = kiemTraToHopViTri(positions)
  if (!ketQua.hopLe) {
    throw new Error(`Tổ hợp vị trí không hợp lệ: ${ketQua.loi}`)
  }

  if (laThuMon(positions)) {
    return {
      attributes: GK_CHI_SO_CHUNG,
      gkAttributes: TAT_CA_CHI_SO_THU_MON,
    }
  }

  return { attributes: TAT_CA_CHI_SO_SAN, gkAttributes: [] }
}

/** Một ô được coi là ĐÃ điền khi có giá trị là số nguyên trong 1..20. */
export function daDien(giaTri: number | undefined): boolean {
  return (
    typeof giaTri === 'number' &&
    Number.isInteger(giaTri) &&
    giaTri >= CHI_SO_MIN &&
    giaTri <= CHI_SO_MAX
  )
}

export interface KetQuaHoanTat {
  readonly hoanTat: boolean
  readonly thieuChiSo: readonly AttributeId[]
  readonly thieuChiSoThuMon: readonly GkAttributeId[]
  readonly soChiSoThieu: number
}

export interface HoSoCanKiem {
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

/**
 * Hồ sơ cầu thủ đã điền đủ chỉ số chưa (AC-2.10).
 *
 * Giá trị THẤP không phải là thiếu — chỉ số 1 là một lựa chọn hợp lệ của
 * người dùng. Chỉ ô không có giá trị, hoặc có giá trị ngoài 1..20, mới tính
 * là còn thiếu.
 */
export function hoSoHoanTat(hoSo: HoSoCanKiem): KetQuaHoanTat {
  const canCo = chiSoCanCo(hoSo.positions)

  const thieuChiSo = canCo.attributes.filter(
    (id) => !daDien(hoSo.attributes[id]),
  )
  const thieuChiSoThuMon = canCo.gkAttributes.filter(
    (id) => !daDien(hoSo.gkAttributes?.[id]),
  )

  return {
    hoanTat: thieuChiSo.length === 0 && thieuChiSoThuMon.length === 0,
    thieuChiSo,
    thieuChiSoThuMon,
    soChiSoThieu: thieuChiSo.length + thieuChiSoThuMon.length,
  }
}
