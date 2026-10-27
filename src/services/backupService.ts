import type { Player, Team } from '../domain/types'
import { moDb, type StoredImage } from '../storage/db'
import {
  MigrationError,
  SCHEMA_VERSION,
  nangLenPhienBanHienTai,
} from '../storage/migrations'
import {
  SCHEMA_THEO_PHIEN_BAN,
  duongDanLoi,
  type TepSaoLuuV1,
} from './backupSchema'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

/*
  Xuất và nhập toàn bộ dữ liệu ra/vào một tệp JSON duy nhất
  (AC-4.3 → AC-4.6, AC-4.8).

  Việc xuất đọc TRỰC TIẾP từ lưu trữ, không đi qua store giao diện, nên vẫn
  dùng được khi một màn hình khác đang lỗi (P3).

  Việc nhập là tất-cả-hoặc-không-gì: đọc, nâng phiên bản, kiểm hình dạng và
  kiểm toàn vẹn tham chiếu, giải mã ảnh — tất cả trong bộ nhớ. Chỉ khi sạch
  100% mới mở MỘT transaction để ghi. Một tệp lỗi không được để lại dữ liệu
  nửa vời (P3).
*/

export type CheDoNhap = 'thay-the' | 'gop'

export interface TomTatTep {
  readonly schemaVersion: number
  readonly exportedAt: string
  readonly soDoi: number
  readonly soCauThu: number
  readonly soAnh: number
}

export interface BaoCaoNhap {
  readonly cheDo: CheDoNhap
  readonly soDoi: number
  readonly soCauThu: number
  readonly soAnh: number
}

// ---------------------------------------------------------------------------
// base64
// ---------------------------------------------------------------------------

const KHOI_CHUYEN_DOI = 0x8000

async function blobSangBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let chuoi = ''
  for (let i = 0; i < bytes.length; i += KHOI_CHUYEN_DOI) {
    chuoi += String.fromCharCode(...bytes.subarray(i, i + KHOI_CHUYEN_DOI))
  }
  return btoa(chuoi)
}

function base64SangBlob(data: string, mime: string): Blob {
  const chuoi = atob(data)
  const bytes = new Uint8Array(chuoi.length)
  for (let i = 0; i < chuoi.length; i++) {
    bytes[i] = chuoi.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

// ---------------------------------------------------------------------------
// Xuất
// ---------------------------------------------------------------------------

/**
 * Kích thước ước tính của tệp sao lưu, tính mà KHÔNG dựng tệp (AC-4.8).
 * base64 phình khoảng 4/3 so với dữ liệu gốc, cộng thêm phần JSON văn bản.
 */
export async function uocTinhKichThuoc(): Promise<number> {
  try {
    const db = await moDb()
    const anh = await db.getAll('images')
    const soDoi = await db.count('teams')
    const soCauThu = await db.count('players')

    const coAnh = anh.reduce((tong, a) => tong + a.byteSize, 0)
    return Math.round(coAnh * (4 / 3)) + soDoi * 300 + soCauThu * 900 + 200
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function exportAll(): Promise<Blob> {
  try {
    const db = await moDb()
    const teams = await db.getAll('teams')
    const players = await db.getAll('players')
    const images = await db.getAll('images')

    const tep: TepSaoLuuV1 = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      teams,
      players: players.map((p) => ({
        ...p,
        positions: [...p.positions],
        attributes: { ...p.attributes },
        gkAttributes: p.gkAttributes ? { ...p.gkAttributes } : null,
      })),
      images: await Promise.all(
        images.map(async (a) => ({
          id: a.id,
          mime: a.blob.type || 'image/jpeg',
          data: await blobSangBase64(a.blob),
        })),
      ),
    }

    return new Blob([JSON.stringify(tep)], { type: 'application/json' })
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export function tenTepSaoLuu(bayGio = new Date()): string {
  const hai = (v: number) => String(v).padStart(2, '0')
  return `bongda-${bayGio.getFullYear()}${hai(bayGio.getMonth() + 1)}${hai(
    bayGio.getDate(),
  )}-${hai(bayGio.getHours())}${hai(bayGio.getMinutes())}.json`
}

// ---------------------------------------------------------------------------
// Đọc và kiểm tệp
// ---------------------------------------------------------------------------

async function docVaKiem(tep: Blob): Promise<TepSaoLuuV1> {
  let thoVao: unknown
  try {
    thoVao = JSON.parse(await tep.text())
  } catch (nguyenNhan) {
    throw new LoiUngDung('NotJson', {}, nguyenNhan)
  }

  // Mảng cũng là JSON hợp lệ nhưng không phải tệp sao lưu — báo như tệp lạ
  // thì đúng hơn là báo sai hình dạng.
  if (thoVao === null || typeof thoVao !== 'object' || Array.isArray(thoVao)) {
    throw new LoiUngDung('NotJson')
  }

  const phienBanTho = (thoVao as { schemaVersion?: unknown }).schemaVersion
  if (typeof phienBanTho !== 'number') {
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'schemaVersion' })
  }

  let daNang: unknown
  try {
    daNang = nangLenPhienBanHienTai(thoVao, phienBanTho)
  } catch (nguyenNhan) {
    if (
      nguyenNhan instanceof MigrationError &&
      nguyenNhan.ma === 'phien-ban-moi-hon-ung-dung'
    ) {
      throw new LoiUngDung(
        'VersionTooNew',
        { giaTri: nguyenNhan.phienBan },
        nguyenNhan,
      )
    }
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'schemaVersion' }, nguyenNhan)
  }

  const schema = SCHEMA_THEO_PHIEN_BAN[SCHEMA_VERSION]
  const ketQua = schema.safeParse(daNang)
  if (!ketQua.success) {
    throw new LoiUngDung(
      'SchemaInvalid',
      { duongDan: duongDanLoi(ketQua.error) },
      ketQua.error,
    )
  }

  return ketQua.data
}

/** Xem tệp có gì trước khi hỏi thay thế hay gộp (AC-4.6). Không chạm database. */
export async function inspect(tep: Blob): Promise<TomTatTep> {
  const noiDung = await docVaKiem(tep)
  return {
    schemaVersion: noiDung.schemaVersion,
    exportedAt: noiDung.exportedAt,
    soDoi: noiDung.teams.length,
    soCauThu: noiDung.players.length,
    soAnh: noiDung.images.length,
  }
}

// ---------------------------------------------------------------------------
// Nhập
// ---------------------------------------------------------------------------

interface DuLieuSanSang {
  readonly teams: Team[]
  readonly players: Player[]
  readonly images: StoredImage[]
}

/**
 * Giải mã ảnh và — với chế độ gộp — đánh id mới cho mọi bản ghi.
 *
 * Đánh id mới là cách giữ CẢ HAI khi tệp nhập có đội trùng với đội đang có
 * (trường hợp biên ở spec mục 5). Nếu dùng lại id cũ thì bản ghi cùng id sẽ bị
 * ghi đè, tức là mất dữ liệu đang có.
 */
function chuanBiDuLieu(
  noiDung: TepSaoLuuV1,
  cheDo: CheDoNhap,
): DuLieuSanSang {
  const idMoi = new Map<string, string>()
  const anhXa = (idCu: string): string => {
    if (cheDo === 'thay-the') return idCu
    const daCo = idMoi.get(idCu)
    if (daCo) return daCo
    const moi = crypto.randomUUID()
    idMoi.set(idCu, moi)
    return moi
  }

  const images: StoredImage[] = noiDung.images.map((a) => {
    let blob: Blob
    try {
      blob = base64SangBlob(a.data, a.mime)
    } catch (nguyenNhan) {
      throw new LoiUngDung(
        'SchemaInvalid',
        { duongDan: `images.${a.id}.data` },
        nguyenNhan,
      )
    }
    return {
      id: anhXa(a.id),
      blob,
      width: 0,
      height: 0,
      byteSize: blob.size,
    }
  })

  const teams: Team[] = noiDung.teams.map((d) => ({
    ...d,
    id: anhXa(d.id),
    logoImageId: d.logoImageId === null ? null : anhXa(d.logoImageId),
  }))

  const players: Player[] = noiDung.players.map((p) => ({
    ...p,
    id: anhXa(p.id),
    teamId: anhXa(p.teamId),
    positions: p.positions as Player['positions'],
    attributes: p.attributes as Player['attributes'],
    gkAttributes: p.gkAttributes as Player['gkAttributes'],
    portraitImageId:
      p.portraitImageId === null ? null : anhXa(p.portraitImageId),
  }))

  return { teams, players, images }
}

export async function importAll(
  tep: Blob,
  cheDo: CheDoNhap,
): Promise<BaoCaoNhap> {
  // Mọi việc có thể thất bại đều làm XONG ở đây, trước khi chạm database.
  const noiDung = await docVaKiem(tep)
  const sanSang = chuanBiDuLieu(noiDung, cheDo)

  try {
    const db = await moDb()
    const tx = db.transaction(['teams', 'players', 'images', 'meta'], 'readwrite')

    if (cheDo === 'thay-the') {
      await tx.objectStore('teams').clear()
      await tx.objectStore('players').clear()
      await tx.objectStore('images').clear()
    }

    for (const a of sanSang.images) await tx.objectStore('images').put(a)
    for (const d of sanSang.teams) await tx.objectStore('teams').put(d)
    for (const p of sanSang.players) await tx.objectStore('players').put(p)

    await tx.objectStore('meta').put({
      key: 'schemaVersion',
      value: SCHEMA_VERSION,
    })

    await tx.done

    return {
      cheDo,
      soDoi: sanSang.teams.length,
      soCauThu: sanSang.players.length,
      soAnh: sanSang.images.length,
    }
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}
