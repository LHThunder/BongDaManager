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

/** Phiên bản hình dạng dữ liệu mà bản ứng dụng này phát hành. */
export const SCHEMA_VERSION = 2

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
export const MIGRATIONS: readonly Migration[] = [nangV1LenV2]

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
