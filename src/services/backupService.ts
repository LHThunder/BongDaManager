import { strToU8, unzipSync, zipSync, type Zippable } from 'fflate'
import type { Player, Team } from '../domain/types'
import { moDb, type StoredImage } from '../storage/db'
import {
  MigrationError,
  SCHEMA_VERSION,
  duongDanAnh,
  nangLenPhienBanHienTai,
} from '../storage/migrations'
import {
  SCHEMA_THEO_PHIEN_BAN,
  duongDanLoi,
  type ManifestHienTai,
  type TepSaoLuuV1,
} from './backupSchema'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

/*
  Xuất và nhập toàn bộ dữ liệu ra/vào MỘT tệp duy nhất
  (AC-4.3 → AC-4.6, AC-4.8).

  Định dạng hiện tại (v2) là một tệp ZIP: `manifest.json` cộng một mục
  `images/<id>.<đuôi>` cho mỗi ảnh, byte thô. Trước đây (v1) là một tệp JSON
  thuần với ảnh nhúng base64 — cách đó làm tệp phình 4/3 ở phần ảnh, và đo
  thực tế ở mốc dữ liệu spec cam kết cho ra 43,7MB (rủi ro R1 của plan).

  Tệp v1 VẪN nhập được (hiến pháp P7). Việc nhận dạng dựa vào chữ ký nội dung
  chứ không dựa vào tên tệp, nên người dùng đổi tên cũng không làm sai.

  Việc nhập là tất-cả-hoặc-không-gì cho cả hai định dạng: đọc, kiểm hình dạng,
  kiểm toàn vẹn tham chiếu, lấy byte ảnh — tất cả xong trong bộ nhớ, rồi mới
  mở MỘT transaction để ghi (P3).
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

export const TEN_MANIFEST = 'manifest.json'

// ---------------------------------------------------------------------------
// Xuất
// ---------------------------------------------------------------------------

/**
 * Kích thước ước tính của tệp sao lưu, tính mà KHÔNG dựng tệp (AC-4.8).
 *
 * Từ v2 không còn hệ số 4/3 của base64: ảnh vào ZIP ở dạng byte thô, và vì
 * JPEG đã nén nên các mục ảnh được lưu không nén, kích thước gần như bằng
 * kích thước gốc cộng một ít phần vỏ cho mỗi mục.
 */
export async function uocTinhKichThuoc(): Promise<number> {
  try {
    const db = await moDb()
    const anh = await db.getAll('images')
    const soDoi = await db.count('teams')
    const soCauThu = await db.count('players')

    const coAnh = anh.reduce((tong, a) => tong + a.byteSize, 0)
    const voZip = anh.length * 180 + 200
    return coAnh + voZip + soDoi * 300 + soCauThu * 900
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

    const manifest: ManifestHienTai = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      teams,
      players: players.map((p) => ({
        ...p,
        positions: [...p.positions],
        attributes: { ...p.attributes },
        gkAttributes: p.gkAttributes ? { ...p.gkAttributes } : null,
      })),
      images: images.map((a) => {
        const mime = a.blob.type || 'image/jpeg'
        return { id: a.id, mime, duongDan: duongDanAnh(a.id, mime) }
      }),
    }

    const noiDung: Zippable = {
      [TEN_MANIFEST]: [strToU8(JSON.stringify(manifest)), { level: 6 }],
    }
    for (const a of images) {
      const mime = a.blob.type || 'image/jpeg'
      // level 0 = lưu không nén: JPEG/PNG đã nén rồi, nén lại chỉ tốn thời gian.
      noiDung[duongDanAnh(a.id, mime)] = [
        new Uint8Array(await a.blob.arrayBuffer()),
        { level: 0 },
      ]
    }

    return new Blob([zipSync(noiDung)], { type: 'application/zip' })
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export function tenTepSaoLuu(bayGio = new Date()): string {
  const hai = (v: number) => String(v).padStart(2, '0')
  return `bongda-${bayGio.getFullYear()}${hai(bayGio.getMonth() + 1)}${hai(
    bayGio.getDate(),
  )}-${hai(bayGio.getHours())}${hai(bayGio.getMinutes())}.zip`
}

// ---------------------------------------------------------------------------
// base64 (chỉ còn dùng để ĐỌC tệp v1)
// ---------------------------------------------------------------------------

function base64SangByte(data: string): Uint8Array {
  const chuoi = atob(data)
  const bytes = new Uint8Array(chuoi.length)
  for (let i = 0; i < chuoi.length; i++) {
    bytes[i] = chuoi.charCodeAt(i)
  }
  return bytes
}

// ---------------------------------------------------------------------------
// Đọc và kiểm tệp
// ---------------------------------------------------------------------------

interface TepDaDoc {
  readonly manifest: ManifestHienTai
  /** Byte của một ảnh trong tệp; ném SchemaInvalid nếu tệp thiếu ảnh đó. */
  layByteAnh(anh: ManifestHienTai['images'][number]): Uint8Array
}

const CHU_KY_ZIP = [0x50, 0x4b, 0x03, 0x04] as const

function laZip(bytes: Uint8Array): boolean {
  return CHU_KY_ZIP.every((b, i) => bytes[i] === b)
}

function docJson(bytes: Uint8Array): Record<string, unknown> {
  let thoVao: unknown
  try {
    thoVao = JSON.parse(new TextDecoder().decode(bytes))
  } catch (nguyenNhan) {
    throw new LoiUngDung('NotJson', {}, nguyenNhan)
  }

  if (thoVao === null || typeof thoVao !== 'object' || Array.isArray(thoVao)) {
    throw new LoiUngDung('NotJson')
  }
  return thoVao as Record<string, unknown>
}

function layPhienBan(tho: Record<string, unknown>): number {
  const pb = tho.schemaVersion
  if (typeof pb !== 'number') {
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'schemaVersion' })
  }
  if (pb > SCHEMA_VERSION) {
    throw new LoiUngDung('VersionTooNew', { giaTri: pb })
  }
  if (!(pb in SCHEMA_THEO_PHIEN_BAN)) {
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'schemaVersion' })
  }
  return pb
}

function kiemTheoSchema(phienBan: number, tho: unknown): void {
  const schema =
    SCHEMA_THEO_PHIEN_BAN[phienBan as keyof typeof SCHEMA_THEO_PHIEN_BAN]
  const kq = schema.safeParse(tho)
  if (!kq.success) {
    throw new LoiUngDung(
      'SchemaInvalid',
      { duongDan: duongDanLoi(kq.error) },
      kq.error,
    )
  }
}

function nangLenHienTai(tho: unknown, tuPhienBan: number): ManifestHienTai {
  try {
    return nangLenPhienBanHienTai(tho, tuPhienBan) as ManifestHienTai
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
}

/** Tệp v1: JSON thuần, ảnh nhúng base64. */
function docV1(bytes: Uint8Array): TepDaDoc {
  const tho = docJson(bytes)
  const phienBan = layPhienBan(tho)

  if (phienBan !== 1) {
    // Từ v2 trở đi tệp phải là ZIP. Một tệp JSON thuần khai v2 thì không có
    // chỗ nào chứa byte ảnh, nên không đọc được.
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'schemaVersion' })
  }

  kiemTheoSchema(1, tho)
  const v1 = tho as unknown as TepSaoLuuV1

  const byteTheoId = new Map<string, Uint8Array>()
  for (const a of v1.images) {
    try {
      byteTheoId.set(a.id, base64SangByte(a.data))
    } catch (nguyenNhan) {
      throw new LoiUngDung(
        'SchemaInvalid',
        { duongDan: `images.${a.id}.data` },
        nguyenNhan,
      )
    }
  }

  return {
    manifest: nangLenHienTai(tho, 1),
    layByteAnh(anh) {
      const b = byteTheoId.get(anh.id)
      if (!b) {
        throw new LoiUngDung('SchemaInvalid', { duongDan: `images.${anh.id}` })
      }
      return b
    },
  }
}

/** Tệp v2: ZIP gồm manifest.json và thư mục images/. */
function docV2(bytes: Uint8Array): TepDaDoc {
  let cacMuc: Record<string, Uint8Array>
  try {
    cacMuc = unzipSync(bytes)
  } catch (nguyenNhan) {
    throw new LoiUngDung('SchemaInvalid', { duongDan: 'zip' }, nguyenNhan)
  }

  const manifestBytes = cacMuc[TEN_MANIFEST]
  if (!manifestBytes) {
    throw new LoiUngDung('SchemaInvalid', { duongDan: TEN_MANIFEST })
  }

  const tho = docJson(manifestBytes)
  const phienBan = layPhienBan(tho)
  kiemTheoSchema(phienBan, tho)

  return {
    manifest: nangLenHienTai(tho, phienBan),
    layByteAnh(anh) {
      const b = cacMuc[anh.duongDan]
      if (!b) {
        throw new LoiUngDung('SchemaInvalid', { duongDan: anh.duongDan })
      }
      return b
    },
  }
}

async function docVaKiem(tep: Blob): Promise<TepDaDoc> {
  const bytes = new Uint8Array(await tep.arrayBuffer())
  return laZip(bytes) ? docV2(bytes) : docV1(bytes)
}

/** Xem tệp có gì trước khi hỏi thay thế hay gộp (AC-4.6). Không chạm database. */
export async function inspect(tep: Blob): Promise<TomTatTep> {
  const daDoc = await docVaKiem(tep)
  return {
    schemaVersion: daDoc.manifest.schemaVersion,
    exportedAt: daDoc.manifest.exportedAt,
    soDoi: daDoc.manifest.teams.length,
    soCauThu: daDoc.manifest.players.length,
    soAnh: daDoc.manifest.images.length,
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
 * Lấy byte ảnh và — với chế độ gộp — đánh id mới cho mọi bản ghi.
 *
 * Đánh id mới là cách giữ CẢ HAI khi tệp nhập có đội trùng với đội đang có.
 * Nếu dùng lại id cũ thì bản ghi cùng id sẽ bị ghi đè, tức là mất dữ liệu.
 */
function chuanBiDuLieu(daDoc: TepDaDoc, cheDo: CheDoNhap): DuLieuSanSang {
  const { manifest } = daDoc
  const idMoi = new Map<string, string>()
  const anhXa = (idCu: string): string => {
    if (cheDo === 'thay-the') return idCu
    const daCo = idMoi.get(idCu)
    if (daCo) return daCo
    const moi = crypto.randomUUID()
    idMoi.set(idCu, moi)
    return moi
  }

  const images: StoredImage[] = manifest.images.map((a) => {
    const byte = daDoc.layByteAnh(a)
    const blob = new Blob([byte], { type: a.mime })
    return {
      id: anhXa(a.id),
      blob,
      width: 0,
      height: 0,
      byteSize: blob.size,
    }
  })

  const teams: Team[] = manifest.teams.map((d) => ({
    ...d,
    id: anhXa(d.id),
    logoImageId: d.logoImageId === null ? null : anhXa(d.logoImageId),
    /*
      Tệp sao lưu v1 và v2 không có chiến thuật (P7 — tệp cũ vẫn phải nhập
      được). Đội nhập vào từ tệp cũ bắt đầu với bộ mặc định, do `moDb` gieo ở
      lần mở sau hoặc `tacticRepo` tạo khi mở trang chiến thuật.
    */
    activeTacticId: null,
  }))

  const players: Player[] = manifest.players.map((p) => ({
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
  const daDoc = await docVaKiem(tep)
  const sanSang = chuanBiDuLieu(daDoc, cheDo)

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
