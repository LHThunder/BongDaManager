import { chiSoCanCo, daDien } from '../domain/completeness'
import { tenChiSo } from '../domain/attributes'
import { kiemTraToHopViTri } from '../domain/positions'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  Player,
  PositionId,
  PreferredFoot,
} from '../domain/types'
import { moDb } from '../storage/db'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

export interface LuuCauThuInput {
  /** Bỏ trống khi thêm mới; có giá trị khi sửa một cầu thủ đã có. */
  readonly id?: string
  readonly teamId: string
  readonly name: string
  readonly shirtNumber: number
  readonly age: number
  readonly preferredFoot: PreferredFoot
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
  readonly portraitImageId?: string | null
}

/**
 * Giữ lại đúng những chỉ số mà vị trí của cầu thủ cần, bỏ phần còn lại.
 *
 * Việc này xử lý trường hợp biên ở spec mục 5: đổi một cầu thủ sân đã nhập
 * chỉ số thành thủ môn. Những chỉ số không còn dùng tới (Dứt điểm, Tắc bóng…)
 * không được lưu, nên dữ liệu luôn khớp với bộ chỉ số mà AC-2.3 quy định.
 */
function locTheoViTri(input: LuuCauThuInput): {
  attributes: AttributeValues
  gkAttributes: GkAttributeValues | null
} {
  const canCo = chiSoCanCo(input.positions)

  const attributes: Record<string, number> = {}
  for (const id of canCo.attributes) {
    const v = input.attributes[id]
    if (v !== undefined) attributes[id] = v
  }

  if (canCo.gkAttributes.length === 0) {
    return { attributes: attributes as AttributeValues, gkAttributes: null }
  }

  const gkAttributes: Record<string, number> = {}
  for (const id of canCo.gkAttributes) {
    const v = input.gkAttributes?.[id]
    if (v !== undefined) gkAttributes[id] = v
  }

  return {
    attributes: attributes as AttributeValues,
    gkAttributes: gkAttributes as GkAttributeValues,
  }
}

/**
 * Mọi giá trị ĐÃ nhập phải là số nguyên trong 1..20 (AC-2.4).
 * Ô bỏ trống thì được phép — AC-2.10 cho lưu hồ sơ dở.
 */
function kiemTraGiaTriChiSo(
  attributes: AttributeValues,
  gkAttributes: GkAttributeValues | null,
): void {
  for (const [id, v] of Object.entries(attributes) as [AttributeId, number][]) {
    if (v !== undefined && !daDien(v)) {
      throw new LoiUngDung('InvalidAttributeValue', {
        truong: tenChiSo(id),
        giaTri: v,
      })
    }
  }

  for (const [id, v] of Object.entries(gkAttributes ?? {}) as [
    GkAttributeId,
    number,
  ][]) {
    if (v !== undefined && !daDien(v)) {
      throw new LoiUngDung('InvalidAttributeValue', {
        truong: tenChiSo(id),
        giaTri: v,
      })
    }
  }
}

export async function listByTeam(teamId: string): Promise<Player[]> {
  try {
    const db = await moDb()
    const cauThu = await db.getAllFromIndex('players', 'byTeam', teamId)
    return cauThu.sort((a, b) => a.shirtNumber - b.shirtNumber)
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function get(id: string): Promise<Player> {
  try {
    const db = await moDb()
    const p = await db.get('players', id)
    if (!p) {
      throw new LoiUngDung('NotFound', { truong: 'playerId', giaTri: id })
    }
    return p
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Thêm mới hoặc cập nhật một cầu thủ.
 *
 * Giao diện đã chặn tổ hợp vị trí sai, nhưng ở đây kiểm lại lần nữa: dữ liệu
 * không bao giờ được lưu ở trạng thái mà `chiSoCanCo` không giải nghĩa được
 * (AC-2.1b).
 */
export async function save(input: LuuCauThuInput): Promise<Player> {
  const ten = input.name.trim()
  if (ten === '') {
    throw new LoiUngDung('EmptyName', { truong: 'name' })
  }

  const toHop = kiemTraToHopViTri(input.positions)
  if (!toHop.hopLe) {
    throw new LoiUngDung('InvalidPositions', { truong: toHop.loi })
  }

  kiemTraGiaTriChiSo(input.attributes, input.gkAttributes)
  const daLoc = locTheoViTri(input)

  try {
    const db = await moDb()
    const tx = db.transaction('players', 'readwrite')
    const kho = tx.store

    // Trùng số áo trong cùng đội thì chặn, trừ chính cầu thủ đang sửa (AC-2.5).
    const cungSoAo = await kho
      .index('byTeamAndShirt')
      .getAll([input.teamId, input.shirtNumber])
    const viPham = cungSoAo.find((p) => p.id !== input.id)
    if (viPham) {
      await tx.done
      throw new LoiUngDung('DuplicateShirtNumber', {
        truong: 'shirtNumber',
        giaTri: input.shirtNumber,
      })
    }

    const cu = input.id ? await kho.get(input.id) : undefined
    const bayGio = Date.now()

    const cauThu: Player = {
      id: input.id ?? crypto.randomUUID(),
      teamId: input.teamId,
      name: ten,
      shirtNumber: input.shirtNumber,
      age: input.age,
      preferredFoot: input.preferredFoot,
      positions: [...input.positions],
      attributes: daLoc.attributes,
      gkAttributes: daLoc.gkAttributes,
      portraitImageId:
        input.portraitImageId !== undefined
          ? input.portraitImageId
          : (cu?.portraitImageId ?? null),
      createdAt: cu?.createdAt ?? bayGio,
      updatedAt: bayGio,
    }

    await kho.put(cauThu)
    await tx.done
    return cauThu
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Xoá cầu thủ cùng ảnh chân dung của họ, trong một transaction (P3). */
export async function remove(id: string): Promise<void> {
  try {
    const db = await moDb()
    const tx = db.transaction(['players', 'images'], 'readwrite')
    const kho = tx.objectStore('players')

    const p = await kho.get(id)
    if (!p) {
      await tx.done
      throw new LoiUngDung('NotFound', { truong: 'playerId', giaTri: id })
    }

    if (p.portraitImageId) {
      await tx.objectStore('images').delete(p.portraitImageId)
    }
    await kho.delete(id)
    await tx.done
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}
