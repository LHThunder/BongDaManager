import { QUAN_SO_MAC_DINH, THOI_LUONG_MAC_DINH } from '../engine/tran'

/*
  Phiên bản hình dạng dữ liệu, và chuỗi migration để nâng dữ liệu cũ lên.

  Nguyên tắc P7 của hiến pháp: tệp sao lưu xuất ra ở một giai đoạn phải nhập
  lại được sau khi giai đoạn sau đã thêm trường mới. Giai đoạn 1 phát hành
  phiên bản 1 nên `MIGRATIONS` còn rỗng — nhưng đường đi và test cho nó được
  làm ngay, chứ không để đó rồi mới dựng sau.

  Cách thêm một phiên bản mới (ví dụ Giai đoạn 2 thêm chiến thuật cho đội):
    1. Tăng SCHEMA_VERSION lên 2.
    2. Thêm vào MIGRATIONS một hàm nâng dữ liệu v1 -> v2, đặt ở chỉ số 0.
    3. Thêm schema zod cho v2 cạnh schema v1 (không sửa schema v1).
*/

/** Quân số và thời lượng của mọi trận lưu trước spec 002. */
export const QUAN_SO_TRAN_CU = QUAN_SO_MAC_DINH
export const THOI_LUONG_TRAN_CU = THOI_LUONG_MAC_DINH

/** Phiên bản hình dạng dữ liệu mà bản ứng dụng này phát hành. */
export const SCHEMA_VERSION = 5

/**
 * Một bước nâng phiên bản. `MIGRATIONS[i]` nâng dữ liệu từ phiên bản `i + 1`
 * lên phiên bản `i + 2`.
 */
export type Migration = (data: unknown) => unknown

/**
 * v1 -> v2: ảnh ra khỏi JSON.
 *
 * Trong v1, mỗi ảnh mang luôn byte của nó dưới dạng base64 ở trường `data`.
 * Trong v2, manifest chỉ giữ metadata và `duongDan` tới mục trong tệp ZIP.
 *
 * Bước này CHỈ đổi hình dạng manifest. Byte ảnh không đi qua đây: mỗi định
 * dạng tệp tự biết cách lấy byte của mình (v1 giải mã base64, v2 đọc mục
 * trong ZIP), nên chuỗi migration không phải bê hàng chục MB qua từng bước.
 */
function nangV1LenV2(data: unknown): unknown {
  const tep = data as {
    images?: { id: string; mime: string; data?: string }[]
  }

  return {
    ...(data as object),
    schemaVersion: 2,
    images: (tep.images ?? []).map((a) => ({
      id: a.id,
      mime: a.mime,
      duongDan: duongDanAnh(a.id, a.mime),
    })),
  }
}

/**
 * v2 -> v3: thêm chiến thuật.
 *
 * Tệp v1 và v2 không có chiến thuật nào, nên bước này chỉ mở ra chỗ trống:
 * mỗi đội thêm `activeTacticId: null` và tệp thêm `tactics: []`. Việc gán bộ
 * chiến thuật mặc định cho những đội đó là việc của `backupService` lúc
 * nhập, vì chỉ ở đó mới dựng được bản ghi thật (có id, có 11 ô) — còn ở đây
 * thì chuỗi migration phải thuần hình dạng.
 */
function nangV2LenV3(data: unknown): unknown {
  const tep = data as { teams?: object[] }

  return {
    ...(data as object),
    schemaVersion: 3,
    teams: (tep.teams ?? []).map((d) => ({ ...d, activeTacticId: null })),
    tactics: [],
  }
}

/**
 * v3 -> v4: thêm lịch sử trận đấu.
 *
 * Tệp v1, v2 và v3 không có trận nào, nên bước này chỉ mở ra chỗ trống. Giữ
 * đúng tinh thần của chuỗi migration: thuần hình dạng, không dựng bản ghi
 * thật và không chạm byte.
 */
function nangV3LenV4(data: unknown): unknown {
  return { ...(data as object), schemaVersion: 4, matches: [] }
}

/**
 * v4 -> v5: trận mang thêm quân số và thời lượng (AC-16.4).
 *
 * Mọi trận trong một tệp v4 đều là trận 11 người 90 phút — đó là định dạng
 * DUY NHẤT ứng dụng đá được khi tệp ấy được xuất ra. Nên điền thẳng hai con
 * số, không để trống: trận cũ xem lại phải nói rõ nó là trận gì, chứ không
 * bắt người đọc suy từ việc trường bị thiếu.
 *
 * Chỉ chạm `matches`; mọi thứ khác đi qua nguyên vẹn.
 */
function nangV4LenV5(data: unknown): unknown {
  const tep = data as { matches?: object[] }

  return {
    ...(data as object),
    schemaVersion: 5,
    matches: (tep.matches ?? []).map((t) => ({
      quanSo: QUAN_SO_TRAN_CU,
      thoiLuong: THOI_LUONG_TRAN_CU,
      ...t,
    })),
  }
}

/** Phần mở rộng theo kiểu ảnh, để tệp ZIP mở ra xem được bằng mắt. */
export function duoiAnh(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/jpeg':
      return 'jpg'
    default:
      return 'bin'
  }
}

export function duongDanAnh(id: string, mime: string): string {
  return `images/${id}.${duoiAnh(mime)}`
}

/** `MIGRATIONS[i]` nâng dữ liệu từ phiên bản `i + 1` lên `i + 2`. */
export const MIGRATIONS: readonly Migration[] = [
  nangV1LenV2,
  nangV2LenV3,
  nangV3LenV4,
  nangV4LenV5,
]

export type LoiMigration =
  /** Số phiên bản không phải số nguyên dương. */
  | 'phien-ban-khong-hop-le'
  /** Tệp đến từ một bản ứng dụng mới hơn bản đang chạy. */
  | 'phien-ban-moi-hon-ung-dung'
  /** Thiếu hàm migration cho một bước trong chuỗi. */
  | 'thieu-buoc-migration'

export class MigrationError extends Error {
  readonly ma: LoiMigration
  readonly phienBan: number

  constructor(ma: LoiMigration, phienBan: number) {
    super(`Không nâng được dữ liệu phiên bản ${phienBan}: ${ma}`)
    this.name = 'MigrationError'
    this.ma = ma
    this.phienBan = phienBan
  }
}

/**
 * Nâng dữ liệu từ `tuPhienBan` lên `SCHEMA_VERSION` bằng cách chạy lần lượt
 * các bước còn thiếu. Dữ liệu đã ở phiên bản hiện tại thì trả về nguyên vẹn.
 *
 * Tệp có phiên bản LỚN HƠN bản ứng dụng thì bị từ chối — ứng dụng cũ không
 * thể biết cách đọc dữ liệu của bản mới hơn, và đoán thì sẽ làm hỏng dữ liệu.
 */
export function nangLenPhienBanHienTai(
  data: unknown,
  tuPhienBan: number,
): unknown {
  if (!Number.isInteger(tuPhienBan) || tuPhienBan < 1) {
    throw new MigrationError('phien-ban-khong-hop-le', tuPhienBan)
  }

  if (tuPhienBan > SCHEMA_VERSION) {
    throw new MigrationError('phien-ban-moi-hon-ung-dung', tuPhienBan)
  }

  let hienTai = data
  for (let v = tuPhienBan; v < SCHEMA_VERSION; v++) {
    const buoc = MIGRATIONS[v - 1]
    if (!buoc) {
      throw new MigrationError('thieu-buoc-migration', v)
    }
    hienTai = buoc(hienTai)
  }

  return hienTai
}
