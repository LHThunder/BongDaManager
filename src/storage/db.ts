import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { laySoDo, SO_DO_MAC_DINH } from '../domain/formations'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { vaiTroMacDinh } from '../domain/roles'
import type { Player, Tactic, Team } from '../domain/types'
import type { BaoCaoTran } from '../engine/baoCao'
import type { BenDoi, SuKien, TiSo } from '../engine/suKien'
import type { CanThiep } from '../engine/tran'
import type { HoSoCauThu } from '../engine/sucManh'
import { SCHEMA_VERSION } from './migrations'

export const DB_NAME = 'bongda'

/**
 * Phiên bản của chính IndexedDB. Tăng khi cấu trúc store hoặc index đổi —
 * khác với `SCHEMA_VERSION` của tệp sao lưu trong `migrations.ts`.
 *
 * Phiên bản 2 thêm store `tactics` và trường `activeTacticId` cho `teams`.
 * Phiên bản 3 thêm hai store lịch sử trận đấu (AC-11.7).
 * Việc tăng số này KHÔNG LÙI ĐƯỢC bằng `git revert`: bản code cũ yêu cầu
 * phiên bản 1, và IndexedDB từ chối mở một database có phiên bản cao hơn.
 */
export const DB_VERSION = 3

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


/*
  Lịch sử trận đấu (AC-11.7, quyết định D44 và D44b).

  HAI store chứ không một: `matches` giữ bản ghi NẶNG có cả dòng sự kiện, còn
  `matchSummaries` giữ bản tóm tắt nhẹ. Trang lịch sử chỉ đọc store nhẹ; mở
  một trận ra mới đọc hàng nặng tương ứng.

  Vì sao phải tách: IndexedDB giải tuần tự CẢ hàng, nên `getAll('matches')` để
  dựng danh sách là đọc hàng trăm KB dòng sự kiện chỉ để in ra 20 cái tỉ số —
  đâm thẳng vào ngân sách "mở ứng dụng với 20 đội và 20 trận trong dưới 2
  giây" của spec mục 6. Hai store có nguy cơ lệch nhau nên chúng luôn được ghi
  và xoá trong CÙNG một transaction (xem `matchRepo`).
*/

/** Ảnh chụp nhận diện một đội tại thời điểm trận diễn ra (quyết định D46). */
export interface AnhChupDoi {
  readonly teamId: string
  readonly ten: string
  readonly mauChinh: string
  readonly mauPhu: string
  readonly logoImageId: string | null
}

/** Phần nhẹ của một trận đã lưu: đủ để vẽ một dòng trong trang lịch sử. */
export interface TomTatTran {
  readonly id: string
  readonly maTran: string
  readonly phienBanEngine: number
  /** Thời điểm kết thúc, dạng mốc thời gian mili-giây. */
  readonly ketThucLuc: number
  readonly tiSo: TiSo
  readonly doiChuNha: AnhChupDoi
  readonly doiKhach: AnhChupDoi
}

/** Đăng ký của một bên, đủ để dựng lại trận theo AC-8.11. */
export interface BenDaLuu {
  readonly teamId: string
  readonly chienThuatXuatPhat: Tactic
  readonly trenSan: readonly string[]
  readonly duBi: readonly string[]
  readonly cacCauThu: readonly HoSoCauThu[]
}

/**
 * Một trận đã kết thúc, lưu đủ những gì AC-11.7 liệt kê.
 *
 * `baoCao` được lưu THAY VÌ tính lại: điểm cầu thủ dựa trên `ThongKeCauThu`,
 * mà số liệu đó không suy ra được từ dòng sự kiện đã bị bộ lọc mật độ của D27
 * cắt. Không lưu thì mở lại trận cũ sẽ ra điểm khác, hoặc không có điểm.
 */
export interface TranDaLuu extends TomTatTran {
  readonly sanTrungLap: boolean
  readonly doiCuaNguoiDung: BenDoi
  readonly nha: BenDaLuu
  readonly khach: BenDaLuu
  readonly canThiep: readonly CanThiep[]
  /** Dòng sự kiện ĐẦY ĐỦ sau lọc — đúng những gì người dùng đã đọc. */
  readonly cacSuKien: readonly SuKien[]
  readonly baoCao: BaoCaoTran
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
  tactics: {
    key: string
    value: Tactic
    indexes: { byTeam: string }
  }
  matches: {
    key: string
    value: TranDaLuu
  }
  matchSummaries: {
    key: string
    value: TomTatTran
    indexes: { byKetThucLuc: number }
  }
}

export const TEN_CAC_STORE = [
  'meta',
  'teams',
  'players',
  'images',
  'tactics',
  'matches',
  'matchSummaries',
] as const

/**
 * Bộ chiến thuật mặc định của một đội: sơ đồ 4-4-2, 11 ô trống, vai trò mặc
 * định của từng ô, chỉ thị cân bằng (AC-5.10, AC-7.4).
 *
 * Hàm này nằm ở đây vì bước nâng cấp database cần nó, và `tacticRepo` dùng
 * lại chính hàm này khi gặp đội chưa có bộ nào — hai chỗ tạo bộ mặc định mà
 * khác nhau thì sẽ có ngày đội cũ và đội mới có mặc định lệch nhau.
 */
export function taoChienThuatMacDinh(
  teamId: string,
  bayGio: number = Date.now(),
): Tactic {
  return {
    id: crypto.randomUUID(),
    teamId,
    ten: null,
    formationId: SO_DO_MAC_DINH,
    oVien: laySoDo(SO_DO_MAC_DINH).oVien.map((o) => ({
      slotId: o.slotId,
      playerId: null,
      roleId: vaiTroMacDinh(o.viTri),
    })),
    chiThi: CHI_THI_MAC_DINH,
    createdAt: bayGio,
    updatedAt: bayGio,
  }
}

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

        /*
          Lên phiên bản 2: CHỈ thêm một store. Không chạm `teams`, `players`
          hay `images`, nên không bản ghi nào của người dùng mất (rủi ro R6).
        */
        if (phienBanCu < 2) {
          const tactics = db.createObjectStore('tactics', { keyPath: 'id' })
          tactics.createIndex('byTeam', 'teamId')
        }

        /*
          Lên phiên bản 3: thêm hai store lịch sử, và GHI LẠI hàng
          `meta.schemaVersion`.

          Hàng đó trước đây chỉ được ghi lúc tạo database mới, nên máy đã có dữ
          liệu sẽ mãi mang số cũ sau khi `SCHEMA_VERSION` tăng —
          `docSchemaVersion()` thành một câu nói sai. Chưa có code sản phẩm nào
          đọc nó, nhưng để sai là để một cái bẫy cho người sau.
        */
        if (phienBanCu < 3) {
          db.createObjectStore('matches', { keyPath: 'id' })
          const tomTat = db.createObjectStore('matchSummaries', {
            keyPath: 'id',
          })
          tomTat.createIndex('byKetThucLuc', 'ketThucLuc')

          tx.objectStore('meta').put({
            key: 'schemaVersion',
            value: SCHEMA_VERSION,
          })
        }
      },
    }).then(async (db) => {
      await themChienThuatConThieu(db)
      return db
    })
  }
  return dbDangMo
}

/**
 * Gieo bộ chiến thuật mặc định cho đội nào chưa có (AC-5.10, AC-7.4). Chạy
 * ngay sau khi mở database, trước khi trả kết nối cho lớp trên.
 *
 * Vì sao không làm trong transaction nâng cấp: transaction `versionchange`
 * tự commit khi không còn việc đang chờ, nên một chuỗi đọc rồi ghi xen vào
 * đó rất dễ bị ngắt giữa đường. Làm thành một transaction riêng thì bước này
 * **chạy lại được**: lần mở sau thấy đội nào còn thiếu thì gieo tiếp, nên
 * nửa đường bị ngắt cũng không để lại đội nào không có chiến thuật.
 *
 * Với bản ghi đội, bước này chỉ THÊM `activeTacticId`; mọi trường khác được
 * giữ nguyên.
 */
async function themChienThuatConThieu(
  db: IDBPDatabase<BongDaDB>,
): Promise<void> {
  const tx = db.transaction(['teams', 'tactics'], 'readwrite')
  const khoTeams = tx.objectStore('teams')
  const khoTactics = tx.objectStore('tactics')

  const cacDoi = await khoTeams.getAll()
  const bayGio = Date.now()

  for (const doi of cacDoi) {
    if (doi.activeTacticId) continue

    const chienThuat = taoChienThuatMacDinh(doi.id, bayGio)
    await khoTactics.put(chienThuat)
    await khoTeams.put({ ...doi, activeTacticId: chienThuat.id })
  }

  await tx.done
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
