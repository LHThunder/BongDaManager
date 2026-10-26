import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Player, Team } from '../domain/types'
import { SCHEMA_VERSION } from './migrations'

export const DB_NAME = 'bongda'

/**
 * Phiên bản của chính IndexedDB. Tăng khi cấu trúc store hoặc index đổi —
 * khác với `SCHEMA_VERSION` của tệp sao lưu trong `migrations.ts`.
 */
export const DB_VERSION = 1

/** Ảnh đã nén, lưu dạng Blob trong store riêng (quyết định D2 của plan). */
export interface StoredImage {
  readonly id: string
  readonly blob: Blob
  readonly width: number
  readonly height: number
  readonly byteSize: number
}

export interface MetaRow {
  readonly key: string
  readonly value: unknown
}

export interface BongDaDB extends DBSchema {
  meta: {
    key: string
    value: MetaRow
  }
  teams: {
    key: string
    value: Team
    indexes: { byName: string }
  }
  players: {
    key: string
    value: Player
    indexes: {
      byTeam: string
      /** Phục vụ việc chặn trùng số áo trong cùng đội (AC-2.5). */
      byTeamAndShirt: [string, number]
    }
  }
  images: {
    key: string
    value: StoredImage
  }
}

export const TEN_CAC_STORE = ['meta', 'teams', 'players', 'images'] as const

let dbDangMo: Promise<IDBPDatabase<BongDaDB>> | null = null

/**
 * Mở database, tạo cấu trúc ở lần đầu. Kết quả được giữ lại để mọi lớp trên
 * dùng chung một kết nối — transaction của IndexedDB gắn với kết nối, và P3
 * dựa vào transaction để việc ghi mang tính tất-cả-hoặc-không-gì.
 */
export function moDb(): Promise<IDBPDatabase<BongDaDB>> {
  if (!dbDangMo) {
    dbDangMo = openDB<BongDaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, phienBanCu, _phienBanMoi, tx) {
        if (phienBanCu < 1) {
          db.createObjectStore('meta', { keyPath: 'key' })

          const teams = db.createObjectStore('teams', { keyPath: 'id' })
          teams.createIndex('byName', 'name')

          const players = db.createObjectStore('players', { keyPath: 'id' })
          players.createIndex('byTeam', 'teamId')
          players.createIndex('byTeamAndShirt', ['teamId', 'shirtNumber'])

          db.createObjectStore('images', { keyPath: 'id' })

          tx.objectStore('meta').put({
            key: 'schemaVersion',
            value: SCHEMA_VERSION,
          })
        }
      },
    })
  }
  return dbDangMo
}

/** Đóng kết nối và quên nó đi. Dùng khi test cần một database sạch. */
export async function dongDb(): Promise<void> {
  if (dbDangMo) {
    const db = await dbDangMo
    db.close()
    dbDangMo = null
  }
}

/** Phiên bản hình dạng dữ liệu đang nằm trong database trên máy. */
export async function docSchemaVersion(): Promise<number | undefined> {
  const db = await moDb()
  const row = await db.get('meta', 'schemaVersion')
  return typeof row?.value === 'number' ? row.value : undefined
}

export type KetQuaLuuTruBen = 'da-ben' | 'bi-tu-choi' | 'khong-ho-tro'

/**
 * Xin trình duyệt đánh dấu dữ liệu của ứng dụng là lưu trữ bền (AC-4.9).
 *
 * Không có đánh dấu này thì trình duyệt được phép xoá IndexedDB khi máy
 * thiếu chỗ — tức là mất sạch những gì người dùng đã nhập. Đây là rủi ro R2
 * trong plan, và là lý do chức năng xuất tệp sao lưu là bắt buộc.
 *
 * Lời nhắc cho người dùng khi bị từ chối do `hooks/useBackup` hiện (T031).
 */
export async function yeuCauLuuTruBen(): Promise<KetQuaLuuTruBen> {
  const luuTru = globalThis.navigator?.storage
  if (!luuTru || typeof luuTru.persist !== 'function') {
    return 'khong-ho-tro'
  }

  try {
    if (typeof luuTru.persisted === 'function' && (await luuTru.persisted())) {
      return 'da-ben'
    }
    return (await luuTru.persist()) ? 'da-ben' : 'bi-tu-choi'
  } catch {
    return 'khong-ho-tro'
  }
}
