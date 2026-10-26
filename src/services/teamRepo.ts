import type { Team } from '../domain/types'
import { moDb } from '../storage/db'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

/** Màu áo mặc định cho đội mới; người dùng đổi được ở Giai đoạn 3 (AC-3.6). */
export const MAU_AO_MAC_DINH = {
  chinh: '#1E40AF',
  phu: '#F8FAFC',
} as const

/**
 * Bản rút gọn để hiện danh sách đội (AC-1.4). Có sẵn số cầu thủ, và KHÔNG
 * kèm ảnh — danh sách chỉ cần id ảnh, nhờ vậy việc mở danh sách không phải
 * tải Blob (quyết định D2 của plan, giữ ngân sách 300ms).
 */
export interface TeamSummary {
  readonly id: string
  readonly name: string
  readonly logoImageId: string | null
  readonly primaryColor: string
  readonly secondaryColor: string
  readonly soCauThu: number
}

export interface TaoDoiInput {
  readonly name: string
  readonly primaryColor?: string
  readonly secondaryColor?: string
}

function chuanHoaTen(name: string): string {
  const ten = name.trim()
  if (ten === '') {
    throw new LoiUngDung('EmptyName', { truong: 'name' })
  }
  return ten
}

export async function list(): Promise<TeamSummary[]> {
  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'players'], 'readonly')
    const teams = await tx.objectStore('teams').getAll()
    const chiMucTheoDoi = tx.objectStore('players').index('byTeam')

    const ketQua: TeamSummary[] = []
    for (const team of teams) {
      ketQua.push({
        id: team.id,
        name: team.name,
        logoImageId: team.logoImageId,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        soCauThu: await chiMucTheoDoi.count(team.id),
      })
    }
    await tx.done

    ketQua.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    return ketQua
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function get(id: string): Promise<Team> {
  try {
    const db = await moDb()
    const team = await db.get('teams', id)
    if (!team) {
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: id })
    }
    return team
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Các đội trùng tên, dùng để cảnh báo trước khi tạo (AC-1.7). */
export async function findByName(name: string): Promise<Team[]> {
  try {
    const db = await moDb()
    return await db.getAllFromIndex('teams', 'byName', name.trim())
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function create(input: TaoDoiInput): Promise<Team> {
  const ten = chuanHoaTen(input.name)
  const bayGio = Date.now()

  const team: Team = {
    id: crypto.randomUUID(),
    name: ten,
    logoImageId: null,
    primaryColor: input.primaryColor ?? MAU_AO_MAC_DINH.chinh,
    secondaryColor: input.secondaryColor ?? MAU_AO_MAC_DINH.phu,
    createdAt: bayGio,
    updatedAt: bayGio,
  }

  try {
    const db = await moDb()
    await db.add('teams', team)
    return team
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function rename(id: string, name: string): Promise<Team> {
  const ten = chuanHoaTen(name)

  try {
    const db = await moDb()
    const tx = db.transaction('teams', 'readwrite')
    const hienTai = await tx.store.get(id)
    if (!hienTai) {
      await tx.done
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: id })
    }

    const moi: Team = { ...hienTai, name: ten, updatedAt: Date.now() }
    await tx.store.put(moi)
    await tx.done
    return moi
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export interface KetQuaXoaDoi {
  readonly removedPlayers: number
}

/**
 * Xoá đội cùng toàn bộ cầu thủ và ảnh thuộc đội đó, trong MỘT transaction.
 * Nếu một bước thất bại thì không bước nào có hiệu lực — P3 cấm để lại dữ
 * liệu nửa vời.
 */
export async function remove(id: string): Promise<KetQuaXoaDoi> {
  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'players', 'images'], 'readwrite')
    const khoDoi = tx.objectStore('teams')
    const khoCauThu = tx.objectStore('players')
    const khoAnh = tx.objectStore('images')

    const team = await khoDoi.get(id)
    if (!team) {
      await tx.done
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: id })
    }

    const cauThu = await khoCauThu.index('byTeam').getAll(id)
    for (const p of cauThu) {
      if (p.portraitImageId) {
        await khoAnh.delete(p.portraitImageId)
      }
      await khoCauThu.delete(p.id)
    }

    if (team.logoImageId) {
      await khoAnh.delete(team.logoImageId)
    }
    await khoDoi.delete(id)

    await tx.done
    return { removedPlayers: cauThu.length }
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}
