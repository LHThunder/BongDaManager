import { laySoDo } from '../domain/formations'
import { THU_TU_CHI_THI } from '../domain/instructions'
import { vaiTroApDungDuoc } from '../domain/roles'
import type { Tactic } from '../domain/types'
import { moDb, taoChienThuatMacDinh } from '../storage/db'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

/*
  Đọc và ghi chiến thuật (AC-5.10, AC-7.5, AC-7.6).

  Mỗi đội có một bộ ĐANG DÙNG (`ten: null`) và không hoặc nhiều bộ CÓ TÊN mà
  người dùng tự lưu. `teams.activeTacticId` trỏ tới bộ đang dùng.

  `apDungBo` chuyển `activeTacticId` sang bộ có tên, nên từ lúc đó người dùng
  sửa đội hình là sửa chính bộ có tên đó — giống như chọn một chiến thuật rồi
  làm việc trên nó. Bộ không tên ban đầu KHÔNG bị xoá: nó chỉ thôi được trỏ
  tới. Xoá nó đi thì đội hình người dùng đang dựng dở sẽ mất, mà P3 không cho
  phép tự ý làm vậy.
*/

function kiemTra(
  chienThuat: Tactic,
  idCauThuCuaDoi: ReadonlySet<string>,
): void {
  const soDo = laySoDo(chienThuat.formationId)

  if (chienThuat.oVien.length !== soDo.oVien.length) {
    throw new LoiUngDung('InvalidTactic', {
      truong: 'so-o',
      giaTri: chienThuat.oVien.length,
    })
  }

  const slotIdCuaSoDo = new Map(soDo.oVien.map((o) => [o.slotId, o.viTri]))
  const daGapCauThu = new Set<string>()

  for (const o of chienThuat.oVien) {
    const viTriO = slotIdCuaSoDo.get(o.slotId)
    if (viTriO === undefined) {
      throw new LoiUngDung('InvalidTactic', {
        truong: 'slot-la',
        giaTri: o.slotId,
      })
    }

    if (!vaiTroApDungDuoc(o.roleId, viTriO)) {
      throw new LoiUngDung('InvalidTactic', {
        truong: 'vai-tro-khong-phu-hop',
        giaTri: o.roleId,
      })
    }

    if (o.playerId !== null) {
      if (!idCauThuCuaDoi.has(o.playerId)) {
        throw new LoiUngDung('InvalidTactic', {
          truong: 'cau-thu-khac-doi',
          giaTri: o.playerId,
        })
      }
      if (daGapCauThu.has(o.playerId)) {
        throw new LoiUngDung('InvalidTactic', {
          truong: 'cau-thu-trung-o',
          giaTri: o.playerId,
        })
      }
      daGapCauThu.add(o.playerId)
    }
  }

  for (const id of THU_TU_CHI_THI) {
    if (chienThuat.chiThi[id] === undefined) {
      throw new LoiUngDung('InvalidTactic', { truong: 'thieu-chi-thi', giaTri: id })
    }
  }
}

/**
 * Bộ chiến thuật đang dùng của đội. Đội chưa có bộ nào — hoặc có
 * `activeTacticId` trỏ vào một bản ghi không còn tồn tại — thì nhận một bộ
 * mặc định mới (AC-5.10).
 */
export async function layChienThuatDangDung(teamId: string): Promise<Tactic> {
  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'tactics'], 'readwrite')
    const khoTeams = tx.objectStore('teams')
    const khoTactics = tx.objectStore('tactics')

    const doi = await khoTeams.get(teamId)
    if (!doi) {
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: teamId })
    }

    if (doi.activeTacticId) {
      const dangCo = await khoTactics.get(doi.activeTacticId)
      if (dangCo) {
        await tx.done
        return dangCo
      }
    }

    const moi = taoChienThuatMacDinh(teamId)
    await khoTactics.put(moi)
    await khoTeams.put({ ...doi, activeTacticId: moi.id })
    await tx.done
    return moi
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Ghi một bộ chiến thuật. Kiểm hình dạng TRƯỚC khi ghi: bộ sai bị từ chối
 * bằng `InvalidTactic` và dữ liệu đang có không bị sửa (P3).
 */
export async function luu(chienThuat: Tactic): Promise<Tactic> {
  try {
    const db = await moDb()
    const tx = db.transaction(['tactics', 'players'], 'readwrite')

    const cauThuCuaDoi = await tx
      .objectStore('players')
      .index('byTeam')
      .getAllKeys(chienThuat.teamId)
    kiemTra(chienThuat, new Set(cauThuCuaDoi))

    const daGhi: Tactic = { ...chienThuat, updatedAt: Date.now() }
    await tx.objectStore('tactics').put(daGhi)
    await tx.done
    return daGhi
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Lưu bộ đang dùng thành một bộ CÓ TÊN (AC-7.5). Bộ đang dùng không đổi:
 * người dùng vẫn đang sửa dở trên nó.
 */
export async function luuThanhBo(teamId: string, ten: string): Promise<Tactic> {
  const tenGon = ten.trim()
  if (tenGon === '') {
    throw new LoiUngDung('InvalidTactic', { truong: 'ten' })
  }

  const nguon = await layChienThuatDangDung(teamId)

  try {
    const db = await moDb()
    const bayGio = Date.now()
    const ban: Tactic = {
      ...nguon,
      id: crypto.randomUUID(),
      ten: tenGon,
      createdAt: bayGio,
      updatedAt: bayGio,
    }
    await db.add('tactics', ban)
    return ban
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Các bộ CÓ TÊN của đội, mới nhất trước (AC-7.5). */
export async function danhSachBo(teamId: string): Promise<Tactic[]> {
  try {
    const db = await moDb()
    const tatCa = await db.getAllFromIndex('tactics', 'byTeam', teamId)
    return tatCa
      .filter((c) => c.ten !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Chọn một bộ của đội làm bộ đang dùng (AC-7.5, AC-7.6). */
export async function apDungBo(
  teamId: string,
  tacticId: string,
): Promise<Tactic> {
  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'tactics'], 'readwrite')
    const khoTeams = tx.objectStore('teams')

    const doi = await khoTeams.get(teamId)
    if (!doi) {
      throw new LoiUngDung('NotFound', { truong: 'teamId', giaTri: teamId })
    }

    const bo = await tx.objectStore('tactics').get(tacticId)
    if (!bo) {
      throw new LoiUngDung('NotFound', { truong: 'tacticId', giaTri: tacticId })
    }
    if (bo.teamId !== teamId) {
      throw new LoiUngDung('InvalidTactic', {
        truong: 'bo-cua-doi-khac',
        giaTri: tacticId,
      })
    }

    await khoTeams.put({ ...doi, activeTacticId: bo.id })
    await tx.done
    return bo
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}
