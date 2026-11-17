import { laySoDo, type FormationId } from '../domain/formations'
import type { CauThuDaSinh } from '../domain/generator'
import { xepLaiKhiDoiSoDo } from '../domain/lineup'
import { vaiTroMacDinh } from '../domain/roles'
import type { Player, Tactic, Team } from '../domain/types'
import { moDb, taoChienThuatMacDinh } from '../storage/db'
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
  readonly logoImageId?: string | null
}

/** Những trường của đội mà người dùng sửa được (AC-1.5, AC-3.5, AC-3.6). */
export interface ThayDoiDoi {
  readonly name?: string
  readonly logoImageId?: string | null
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
    logoImageId: input.logoImageId ?? null,
    primaryColor: input.primaryColor ?? MAU_AO_MAC_DINH.chinh,
    secondaryColor: input.secondaryColor ?? MAU_AO_MAC_DINH.phu,
    // Được thay bằng id bộ chiến thuật ngay bên dưới (AC-7.4).
    activeTacticId: null,
    createdAt: bayGio,
    updatedAt: bayGio,
  }

  try {
    const db = await moDb()

    /*
      Đội mới nhận luôn một bộ chiến thuật dùng được: 4-4-2, vai trò mặc định
      cho từng ô, chỉ thị cân bằng không sinh xung đột (AC-7.4). Tạo trong
      CÙNG transaction với đội, nếu không sẽ có lúc tồn tại một đội không có
      chiến thuật nào.
    */
    const chienThuat = taoChienThuatMacDinh(team.id, bayGio)
    const tx = db.transaction(['teams', 'tactics'], 'readwrite')
    await tx.objectStore('teams').add({ ...team, activeTacticId: chienThuat.id })
    await tx.objectStore('tactics').add(chienThuat)
    await tx.done

    return { ...team, activeTacticId: chienThuat.id }
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

// ---------------------------------------------------------------------------
// Lưu một đội vừa SINH RA (T407, AC-24.4, AC-24.7)
// ---------------------------------------------------------------------------

export interface TaoDoiSinhRaInput {
  readonly name: string
  readonly primaryColor?: string
  readonly secondaryColor?: string
  /** Hồ sơ do `domain/generator.sinhDoi` sinh ra. */
  readonly cacCauThu: readonly CauThuDaSinh[]
  /** Sơ đồ của bộ chiến thuật sinh kèm. */
  readonly formationId: FormationId
}

/**
 * Xếp cả đội vừa sinh vào các ô của sơ đồ (D83).
 *
 * **Dùng lại `xepLaiKhiDoiSoDo`** — đúng hàm mà trang chiến thuật dùng khi
 * đổi sơ đồ — nên luật "ai vào ô nào" chỉ có MỘT chỗ định nghĩa. Nhưng hàm
 * ấy lấy danh sách người **từ `oVienCu`**, không từ `cacCauThu`: truyền
 * `oVienCu = []` như `tacticRepo` làm khi đội chưa có bộ chiến thuật thì nó
 * trả về đội hình toàn ô TRỐNG. Vì thế cả đội đi vào dưới dạng một `oVienCu`
 * **giả**, mỗi người một ô.
 *
 * Rồi **lấp những ô còn trống bằng người bị đẩy ra**, đúng cách
 * `chonTheoSoDo` ở `ChonCapDau.tsx` làm: `xepLaiKhiDoiSoDo` từ chối xếp ai
 * vào ô mà mức sai là `nang`, nên một đội sinh ra vẫn có thể còn ô trống —
 * mà AC-24.4 đòi đội sinh xong **đá được ngay**, không phải đá được sau khi
 * người dùng tự điền nốt.
 */
function xepDoiSinhRa(
  formationId: FormationId,
  cacCauThu: readonly Player[],
): readonly (string | null)[] {
  const soDo = laySoDo(formationId)

  const xepLai = xepLaiKhiDoiSoDo(
    formationId,
    cacCauThu.map((p, i) => ({ slotId: `gia-${i}`, playerId: p.id })),
    cacCauThu.map((p) => ({ id: p.id, positions: p.positions })),
  )

  const conLai = [...xepLai.nguoiBiDayRa]
  return soDo.oVien.map(
    (_, i) => xepLai.oVien[i]?.playerId ?? conLai.shift() ?? null,
  )
}

/**
 * Tạo một đội sinh ngẫu nhiên: đội, toàn bộ cầu thủ, và bộ chiến thuật đã
 * xếp đủ ô — trong **MỘT** transaction (AC-24.7, D82).
 *
 * Gọi lần lượt `create` rồi vòng lặp `playerRepo.save` thì hỏng giữa chừng
 * để lại một đội có nửa số cầu thủ, và P3 cấm đúng điều đó. Số áo đã được
 * `sinhDoi` bảo đảm không trùng nhau, nên ở đây không cần kiểm lại chỉ mục
 * `byTeamAndShirt`: đội này mới, chưa có ai từ trước.
 */
export async function taoDoiSinhRa(input: TaoDoiSinhRaInput): Promise<Team> {
  const ten = chuanHoaTen(input.name)
  const bayGio = Date.now()
  const teamId = crypto.randomUUID()

  const cacCauThu: readonly Player[] = input.cacCauThu.map((c) => ({
    id: crypto.randomUUID(),
    teamId,
    name: c.name,
    shirtNumber: c.shirtNumber,
    age: c.age,
    preferredFoot: c.preferredFoot,
    positions: [...c.positions],
    attributes: c.attributes,
    gkAttributes: c.gkAttributes,
    portraitImageId: null,
    createdAt: bayGio,
    updatedAt: bayGio,
  }))

  const soDo = laySoDo(input.formationId)
  const xep = xepDoiSinhRa(input.formationId, cacCauThu)

  const chienThuat: Tactic = {
    ...taoChienThuatMacDinh(teamId, bayGio),
    formationId: input.formationId,
    oVien: soDo.oVien.map((o, i) => ({
      slotId: o.slotId,
      playerId: xep[i] ?? null,
      roleId: vaiTroMacDinh(o.viTri),
    })),
  }

  const doi: Team = {
    id: teamId,
    name: ten,
    logoImageId: null,
    primaryColor: input.primaryColor ?? MAU_AO_MAC_DINH.chinh,
    secondaryColor: input.secondaryColor ?? MAU_AO_MAC_DINH.phu,
    activeTacticId: chienThuat.id,
    createdAt: bayGio,
    updatedAt: bayGio,
  }

  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'players', 'tactics'], 'readwrite')

    /*
      Đánh dấu `tx.done` là ĐÃ XỬ LÝ ngay từ đầu.

      Khi một lệnh ghi hỏng, IndexedDB huỷ cả transaction và `tx.done` cũng
      reject. Đường code bên dưới ném ngay ở lệnh ghi hỏng, nên nó không bao
      giờ tới chỗ `await tx.done` — và một promise reject mà không ai bắt sẽ
      thành unhandled rejection, thứ làm đỏ cả những test chạy sau. Gắn sẵn
      một handler rỗng không che lỗi: lỗi thật vẫn đi ra từ lệnh ghi.
    */
    void tx.done.catch(() => undefined)

    await tx.objectStore('teams').add(doi)
    const khoCauThu = tx.objectStore('players')
    for (const p of cacCauThu) {
      await khoCauThu.add(p)
    }
    await tx.objectStore('tactics').add(chienThuat)
    await tx.done

    return doi
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Cập nhật tên, logo và màu áo của đội. Ảnh logo cũ bị thay thì được xoá luôn
 * trong cùng transaction, để store `images` không tích ảnh mồ côi (P3).
 */
export async function capNhat(id: string, thayDoi: ThayDoiDoi): Promise<Team> {
  const ten = thayDoi.name !== undefined ? chuanHoaTen(thayDoi.name) : undefined

  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'images'], 'readwrite')
    const khoDoi = tx.objectStore('teams')
    const hienTai = await khoDoi.get(id)
    if (!hienTai) {
      await tx.done
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: id })
    }

    const logoMoi =
      thayDoi.logoImageId !== undefined
        ? thayDoi.logoImageId
        : hienTai.logoImageId

    if (
      hienTai.logoImageId !== null &&
      logoMoi !== hienTai.logoImageId
    ) {
      await tx.objectStore('images').delete(hienTai.logoImageId)
    }

    const moi: Team = {
      ...hienTai,
      name: ten ?? hienTai.name,
      logoImageId: logoMoi,
      primaryColor: thayDoi.primaryColor ?? hienTai.primaryColor,
      secondaryColor: thayDoi.secondaryColor ?? hienTai.secondaryColor,
      updatedAt: Date.now(),
    }
    await khoDoi.put(moi)
    await tx.done
    return moi
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Đổi tên đội. Giữ lại vì nhiều chỗ chỉ cần đúng việc này (AC-1.5). */
export function rename(id: string, name: string): Promise<Team> {
  return capNhat(id, { name })
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
    const tx = db.transaction(
      ['teams', 'players', 'images', 'tactics'],
      'readwrite',
    )
    const khoDoi = tx.objectStore('teams')
    const khoCauThu = tx.objectStore('players')
    const khoAnh = tx.objectStore('images')
    const khoChienThuat = tx.objectStore('tactics')

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

    /*
      Xoá cả chiến thuật của đội — bộ đang dùng và các bộ có tên — trong CÙNG
      transaction này (AC-1.6). Để sót lại thì database có những bản ghi trỏ
      tới một đội không còn tồn tại, và chúng sẽ lớn dần theo mỗi lần xoá đội.
    */
    for (const key of await khoChienThuat.index('byTeam').getAllKeys(id)) {
      await khoChienThuat.delete(key)
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
