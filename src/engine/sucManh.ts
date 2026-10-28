import { GK_ATTRIBUTES } from '../domain/attributes'
import { MUC_TRU_HIEU_SUAT, mucSaiViTri } from '../domain/misplacement'
import { layVaiTro, type RoleId } from '../domain/roles'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
} from '../domain/types'
import { CHI_SO_MAX, CHI_SO_MIN } from '../domain/types'
import { daKietSuc, THE_LUC_DAY } from './theLuc'

/*
  Sức mạnh của một cầu thủ trong một tình huống (quyết định D25):

      nền(chỉ số quan trọng của VAI TRÒ)
        × (1 − mức trừ sai vị trí)
        × hệ số thể lực
        × hệ số sân nhà

  Nền tính theo VAI TRÒ chứ không theo vị trí: `chiSoTongTheoViTri` đã có
  trong `domain/rating.ts` cân theo vị trí, nhưng AC-6.x nói vai trò mới là
  thứ HLV đặt cho ô. Hai tiền đạo cùng đứng một ô mà một người là "Tiền đạo
  mục tiêu" (không chiến, sức mạnh) còn một người là "Tiền đạo cắt mặt" (dứt
  điểm, tốc độ) thì phải khác nhau trong trận — nếu không thì cả US-6 vô
  nghĩa.

  Bảng mức trừ sai vị trí dùng lại nguyên `MUC_TRU_HIEU_SUAT` của AC-5.5, nên
  AC-8.5 và AC-5.5 không bao giờ nói hai con số khác nhau.
*/

export interface HoSoCauThu {
  readonly id: string
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

export interface BoiCanhSucManh {
  /** Vị trí của Ô mà cầu thủ đang đứng. */
  readonly viTriO: PositionId
  readonly roleId: RoleId
  /** 0..100 */
  readonly theLuc: number
  readonly laChuNha: boolean
  readonly sanTrungLap: boolean
}

/** Lợi thế sân nhà: một hệ số nhân nhỏ duy nhất (quyết định D29). */
export const LOI_THE_SAN_NHA = 1.1

/** Thể lực đầy cho hệ số 1; cạn kiệt còn chừng này. */
const HE_SO_THE_LUC_TOI_THIEU = 0.7

/** Phạt thêm khi đã qua ngưỡng kiệt sức (AC-8.7). */
export const HE_SO_PHAT_KIET_SUC = 0.85

const CHI_SO_THU_MON = new Set<string>(GK_ATTRIBUTES.map((a) => a.id))

/**
 * Giá trị một chỉ số của cầu thủ. Chưa điền thì lấy mức thấp nhất — cầu thủ
 * hồ sơ chưa hoàn tất đã bị AC-5.7 chặn khỏi đội hình, nên đây chỉ là đường
 * lui an toàn chứ không phải đường đi thường gặp.
 */
function giaTriChiSo(
  hoSo: HoSoCauThu,
  chiSo: AttributeId | GkAttributeId,
): number {
  const v = CHI_SO_THU_MON.has(chiSo)
    ? hoSo.gkAttributes?.[chiSo as GkAttributeId]
    : hoSo.attributes[chiSo as AttributeId]
  return v ?? CHI_SO_MIN
}

/** Nền sức mạnh theo vai trò: trung bình các chỉ số quan trọng, quy về 0..1. */
export function nenTheoVaiTro(hoSo: HoSoCauThu, roleId: RoleId): number {
  const cacChiSo = layVaiTro(roleId).chiSoQuanTrong
  if (cacChiSo.length === 0) return 0

  let tong = 0
  for (const chiSo of cacChiSo) {
    tong += giaTriChiSo(hoSo, chiSo)
  }
  const trungBinh = tong / cacChiSo.length
  return (trungBinh - CHI_SO_MIN) / (CHI_SO_MAX - CHI_SO_MIN)
}

/** Hệ số thể lực: đầy là 1, cạn là `HE_SO_THE_LUC_TOI_THIEU`, kiệt sức phạt thêm. */
export function heSoTheLuc(theLuc: number): number {
  const tiLe = Math.min(Math.max(theLuc, 0), THE_LUC_DAY) / THE_LUC_DAY
  const co =
    HE_SO_THE_LUC_TOI_THIEU + tiLe * (1 - HE_SO_THE_LUC_TOI_THIEU)
  return daKietSuc(theLuc) ? co * HE_SO_PHAT_KIET_SUC : co
}

/** Hệ số sân nhà, bằng đúng 1 khi đá sân trung lập (AC-8.14). */
export function heSoSanNha(laChuNha: boolean, sanTrungLap: boolean): number {
  if (sanTrungLap || !laChuNha) return 1
  return LOI_THE_SAN_NHA
}

/**
 * Sức mạnh của cầu thủ trong một tình huống. Giá trị càng lớn càng mạnh;
 * không có trần cứng vì nó chỉ dùng để SO SÁNH hai bên trong một tình huống.
 */
export function sucManhCauThu(
  hoSo: HoSoCauThu,
  boiCanh: BoiCanhSucManh,
): number {
  const nen = nenTheoVaiTro(hoSo, boiCanh.roleId)
  const mucSai = mucSaiViTri(boiCanh.viTriO, hoSo.positions)
  const truSaiViTri = 1 - MUC_TRU_HIEU_SUAT[mucSai]

  return (
    nen *
    truSaiViTri *
    heSoTheLuc(boiCanh.theLuc) *
    heSoSanNha(boiCanh.laChuNha, boiCanh.sanTrungLap)
  )
}
