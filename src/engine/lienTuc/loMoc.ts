import { SO_THUC_THE } from './moc'

/*
  Lô mốc: bộ đệm ĐẦU RA của một phút trận (T704, quyết định D119, mục 0).

  HÌNH DẠNG. Một lô mang các mốc phát ra trong MỘT phút:
    • `oLieu`  — `Float32Array`, stride **8** mỗi thực thể:
                 `x, y, z, vx, vy, vz, huong, coMat`
    • `oTieuDe` — `Int32Array`, **2 ô** mỗi mốc: `[chiSoMoc, nguoiGiu]`
                 (`nguoiGiu = -1` nghĩa là không ai giữ bóng, AC-37.6)

  Trường hợp xấu nhất (cả phút dày 0,5 giây) là 120 mốc:
    120 × 26 × 8 × 4 B = **99.840 byte ≈ 97,5 KiB**, cộng header 120 × 2 × 4 B
    = 960 byte.

  VÌ SAO LÔ THEO PHÚT. Bộ đệm trọn trận là 3,09–3,43 MB thường trú để xem một
  trận. Bộ đệm vòng 1024 bước là 922 KiB **cộng** một phép đánh chỉ số có quấn
  vòng **cộng** một file test riêng cho nó — và nó mua đúng không gì cả hôm nay.
  Lô theo phút trùng đúng nhịp `setTimeout` đang có của `useMatch`: một lần nổ =
  một phút = một lần ghi store.

  ⚠️ LÔ LÀ ĐẦU RA CHỈ-GHI. Trạng thái mô phỏng sống trong biến `float64` cục bộ
  và **không bao giờ đọc lại** từ `Float32Array`. Nếu engine đọc `v(n−1)` ra từ
  đây thì bố cục bộ đệm thành một phần HỢP ĐỒNG của engine, và đổi stride về
  sau là đổi kết quả của mọi trận đã lưu. `docMoc` dưới đây là để lớp VẼ và
  lớp XUẤT TỆP đọc, không phải để engine đọc.
*/

/** Số ô `Float32Array` cho một thực thể. */
export const STRIDE = 8

/** Số ô `Int32Array` cho một mốc. */
export const STRIDE_TIEU_DE = 2

/** Tên tám ô, theo đúng thứ tự trong `oLieu`. */
export const TEN_O = [
  'x',
  'y',
  'z',
  'vx',
  'vy',
  'vz',
  'huong',
  'coMat',
] as const

/** Giá trị `nguoiGiu` khi không ai giữ bóng (bóng đang bay). */
export const KHONG_AI_GIU = -1

/** Một thực thể tại một mốc. Đơn vị: mét, mét/giây, độ. */
export interface ThucTheTaiMoc {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly vx: number
  readonly vy: number
  readonly vz: number
  /** Hướng người, 0–360 độ (AC-38.11). */
  readonly huong: number
  /** 1 nếu thực thể có trên sân ở mốc này, 0 nếu không (đã bị thay/đuổi). */
  readonly coMat: number
}

/** Một mốc đã đọc ra khỏi lô. */
export interface MocDaDoc {
  readonly chiSoMoc: number
  /** Chỉ số thực thể đang giữ bóng, hoặc `KHONG_AI_GIU`. */
  readonly nguoiGiu: number
  readonly cacThucThe: readonly ThucTheTaiMoc[]
}

/** Lô mốc của một phút trận. */
export interface LoMoc {
  readonly oLieu: Float32Array
  readonly oTieuDe: Int32Array
  /** Số mốc đã ghi vào lô. Tăng dần theo `ghiMoc`. */
  soMocDaGhi: number
  /** Số mốc tối đa lô này chứa được. */
  readonly sucChua: number
}

/**
 * Cấp một lô rỗng cho `sucChua` mốc.
 *
 * Cấp theo sức chứa XẤU NHẤT của một phút (120 mốc) thay vì cấp lại mỗi lần
 * làm dày: một lần cấp 97,5 KiB rẻ hơn nhiều lần cấp lại, và nó làm việc "phút
 * này có dày hay không" thôi ảnh hưởng tới bộ nhớ.
 */
export function taoLoMoc(sucChua: number): LoMoc {
  return {
    oLieu: new Float32Array(sucChua * SO_THUC_THE * STRIDE),
    oTieuDe: new Int32Array(sucChua * STRIDE_TIEU_DE),
    soMocDaGhi: 0,
    sucChua,
  }
}

/** Dọn lô để dùng lại cho phút sau, không cấp mới. */
export function donLoMoc(lo: LoMoc): void {
  lo.soMocDaGhi = 0
}

/**
 * Ghi một mốc vào cuối lô.
 *
 * `cacThucThe` phải đủ `SO_THUC_THE` phần tử: thiếu một thực thể là một mốc
 * khuyết, và AC-37.4 đòi "không khuyết mốc".
 */
export function ghiMoc(
  lo: LoMoc,
  chiSoMoc: number,
  nguoiGiu: number,
  cacThucThe: readonly ThucTheTaiMoc[],
): void {
  if (lo.soMocDaGhi >= lo.sucChua) {
    throw new Error(
      `lô mốc đã đầy: sức chứa ${lo.sucChua}, không ghi thêm được mốc ${chiSoMoc}`,
    )
  }
  if (cacThucThe.length !== SO_THUC_THE) {
    throw new Error(
      `mốc ${chiSoMoc} có ${cacThucThe.length} thực thể, phải đúng ${SO_THUC_THE}`,
    )
  }

  const chiSo = lo.soMocDaGhi
  lo.oTieuDe[chiSo * STRIDE_TIEU_DE] = chiSoMoc
  lo.oTieuDe[chiSo * STRIDE_TIEU_DE + 1] = nguoiGiu

  let o = chiSo * SO_THUC_THE * STRIDE
  for (const t of cacThucThe) {
    lo.oLieu[o] = t.x
    lo.oLieu[o + 1] = t.y
    lo.oLieu[o + 2] = t.z
    lo.oLieu[o + 3] = t.vx
    lo.oLieu[o + 4] = t.vy
    lo.oLieu[o + 5] = t.vz
    lo.oLieu[o + 6] = t.huong
    lo.oLieu[o + 7] = t.coMat
    o += STRIDE
  }

  lo.soMocDaGhi = chiSo + 1
}

/** Đọc mốc thứ `chiSo` (0-based) ra khỏi lô. Dành cho lớp vẽ và lớp xuất tệp. */
export function docMoc(lo: LoMoc, chiSo: number): MocDaDoc {
  if (chiSo < 0 || chiSo >= lo.soMocDaGhi) {
    throw new Error(
      `không có mốc thứ ${chiSo} trong lô: lô đang giữ ${lo.soMocDaGhi} mốc`,
    )
  }

  const cacThucThe: ThucTheTaiMoc[] = []
  let o = chiSo * SO_THUC_THE * STRIDE
  for (let i = 0; i < SO_THUC_THE; i += 1) {
    cacThucThe.push({
      x: lo.oLieu[o]!,
      y: lo.oLieu[o + 1]!,
      z: lo.oLieu[o + 2]!,
      vx: lo.oLieu[o + 3]!,
      vy: lo.oLieu[o + 4]!,
      vz: lo.oLieu[o + 5]!,
      huong: lo.oLieu[o + 6]!,
      coMat: lo.oLieu[o + 7]!,
    })
    o += STRIDE
  }

  return {
    chiSoMoc: lo.oTieuDe[chiSo * STRIDE_TIEU_DE]!,
    nguoiGiu: lo.oTieuDe[chiSo * STRIDE_TIEU_DE + 1]!,
    cacThucThe,
  }
}

/** Số byte lô này đang chiếm — để `plan.md` mục 2.3 có một con số đo được. */
export function soByteCuaLo(lo: LoMoc): number {
  return lo.oLieu.byteLength + lo.oTieuDe.byteLength
}
