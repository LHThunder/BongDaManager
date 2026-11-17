import { NGUONG_KIET_SUC, THE_LUC_DAY } from '../engine/theLuc'

/*
  Nội suy chuyển động cho sân 2D (T421, AC-25.1, AC-25.2, AC-25.7).

  HAI ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Toạ độ tại mốc không thuộc về đây.** `hinhSan` quyết định một điểm
     đứng ở đâu tại mỗi tình huống; file này chỉ vẽ phần XEN GIỮA hai mốc.
     Vì thế mọi hàm ở đây trả về ĐÚNG mốc tại tỉ lệ 0 và 1 — không gần đúng,
     không làm tròn. Đó là điều giữ AC-25.2: tình huống xảy ra ở đâu thì
     người tham gia phải có mặt ở đó, không phải "gần đó".

  2. **Thể lực đổi DÁNG, không đổi THỜI LƯỢNG** (quyết định D88). Cách đọc
     tự nhiên của "người kiệt sức di chuyển chậm hơn" là kéo dài cú chuyển
     chỗ — và nó không khả thi: `thoiGianChuyen` đã bằng 90% một nhịp đồng
     hồ, cụ thể 180ms ở mức Thường, 63ms ở Nhanh và **18ms** ở Rất nhanh,
     nên mọi hệ số lớn hơn 1,11 lần đều đẩy điểm sang quá tình huống kế
     tiếp và phá AC-25.3. Ở mức Rất nhanh chỉ còn 2ms dư.

     Lối ra: người kiệt sức xuất phát muộn hơn và đi phần lớn quãng đường
     sau người khoẻ, nhưng cả hai cùng tới đích đúng một lúc. Mắt đọc được
     độ TRỄ giữa hai điểm cùng xuất phát rõ hơn nhiều so với đọc tốc độ
     tuyệt đối của một điểm, nên kênh thông tin vẫn còn — chỉ là nó không
     mua bằng thời gian mà spec không có.
*/

export interface Diem {
  readonly x: number
  readonly y: number
}

/** Khung sân, để chuyển động không vọt ra ngoài mặt cỏ. */
export interface KhungKep {
  readonly xTu: number
  readonly xDen: number
  readonly yTu: number
  readonly yDen: number
}

function kep01(t: number): number {
  if (!Number.isFinite(t)) return 0
  return t < 0 ? 0 : t > 1 ? 1 : t
}

function kep(giaTri: number, tu: number, den: number): number {
  return giaTri < tu ? tu : giaTri > den ? den : giaTri
}

function kepVaoKhung(d: Diem, khung: KhungKep | null): Diem {
  if (!khung) return d
  return {
    x: kep(d.x, khung.xTu, khung.xDen),
    y: kep(d.y, khung.yTu, khung.yDen),
  }
}

/**
 * Làm mượt tỉ lệ: chậm ở hai đầu, nhanh ở giữa (smoothstep).
 *
 * Giữ nguyên hai đầu — `lamMuot(0) === 0` và `lamMuot(1) === 1` — nên nó
 * không bao giờ làm sai vị trí tại mốc.
 */
export function lamMuot(t: number): number {
  const u = kep01(t)
  return u * u * (3 - 2 * u)
}

/** Độ mệt 0 → sung sức, 1 → kiệt sức hoàn toàn. */
export function doMetTuTheLuc(theLuc: number | undefined): number {
  if (theLuc === undefined || !Number.isFinite(theLuc)) return 0
  const tren = THE_LUC_DAY
  const duoi = NGUONG_KIET_SUC
  if (theLuc >= tren) return 0
  if (theLuc <= duoi) return 1
  return (tren - theLuc) / (tren - duoi)
}

/** Mũ lớn nhất khi đã kiệt sức — chọn để độ trễ nhìn thấy được mà không giật. */
export const MU_KIET_SUC = 2.8

/**
 * Đổi dáng chuyển động theo độ mệt (D88).
 *
 * `t ** mu` giữ nguyên cả hai đầu với mọi `mu > 0`, nên người kiệt sức vẫn
 * tới đúng vị trí mốc đúng lúc người khoẻ tới — chỉ là anh ta ở phía sau
 * trong gần suốt quãng đường.
 */
export function tiLeTheoDoMet(t: number, doMet: number): number {
  const u = kep01(t)
  if (u === 0 || u === 1) return u
  const mu = 1 + kep01(doMet) * (MU_KIET_SUC - 1)
  return Math.pow(u, mu)
}

/** Hệ số kéo tiếp tuyến vào: 0 là gãy góc, 1 là vòng quá rộng. */
const KEO_TIEP_TUYEN = 0.55

/**
 * Hướng đi ra khỏi một mốc, để cú di chuyển SAU nối mượt vào cú này.
 *
 * Không có nó thì mỗi mốc là một góc gãy: điểm lao thẳng tới mốc rồi quặt
 * ngay sang hướng mới — đúng thứ AC-25.1 cấm.
 */
export function huongRaKhoiMoc(tu: Diem, den: Diem): Diem {
  return { x: den.x - tu.x, y: den.y - tu.y }
}

/**
 * Toạ độ tại tỉ lệ `tiLe` trên đường cong từ `tu` tới `den` (AC-25.1).
 *
 * Dùng Hermite bậc ba. Tiếp tuyến ở đầu là `huongVao` — hướng mà điểm đang
 * đi khi cú di chuyển trước kết thúc — nên đường mới rời mốc theo đúng
 * hướng cũ rồi mới cong dần về đích. `huongVao` là `null` (cú đầu tiên, hay
 * điểm vừa xuất hiện) thì hai tiếp tuyến bằng nhau và công thức rút về
 * đúng đường thẳng.
 *
 * **Tại `tiLe` 0 và 1 trả về ĐÚNG hai mốc**, bất kể tiếp tuyến nào: hàm cơ
 * sở Hermite triệt tiêu hết ở hai đầu. Đây là điều giữ AC-25.2.
 */
export function noiSuyCong(
  tu: Diem,
  den: Diem,
  tiLe: number,
  huongVao: Diem | null = null,
  gioiHan: KhungKep | null = null,
): Diem {
  const t = kep01(tiLe)
  if (t <= 0) return kepVaoKhung(tu, gioiHan)
  if (t >= 1) return kepVaoKhung(den, gioiHan)

  const dx = den.x - tu.x
  const dy = den.y - tu.y

  const m0x = huongVao ? huongVao.x * KEO_TIEP_TUYEN : dx
  const m0y = huongVao ? huongVao.y * KEO_TIEP_TUYEN : dy
  const m1x = dx
  const m1y = dy

  const t2 = t * t
  const t3 = t2 * t
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 = t3 - t2

  return kepVaoKhung(
    {
      x: h00 * tu.x + h10 * m0x + h01 * den.x + h11 * m1x,
      y: h00 * tu.y + h10 * m0y + h01 * den.y + h11 * m1y,
    },
    gioiHan,
  )
}

/**
 * Toạ độ của MỘT điểm tại một thời khắc, đã tính cả độ mượt và thể lực.
 *
 * Gộp ba bước vào một chỗ để `San2D` chỉ gọi một hàm cho mỗi điểm mỗi khung
 * hình, và để thứ tự ba bước ấy có đúng một định nghĩa.
 */
export function viTriTaiThoiDiem(
  tu: Diem,
  den: Diem,
  tiLe: number,
  tuyChon: {
    readonly huongVao?: Diem | null
    readonly doMet?: number
    readonly gioiHan?: KhungKep | null
  } = {},
): Diem {
  const t = kep01(tiLe)
  if (t <= 0) return kepVaoKhung(tu, tuyChon.gioiHan ?? null)
  if (t >= 1) return kepVaoKhung(den, tuyChon.gioiHan ?? null)

  const daMuot = lamMuot(t)
  const theoSuc = tiLeTheoDoMet(daMuot, tuyChon.doMet ?? 0)
  return noiSuyCong(
    tu,
    den,
    theoSuc,
    tuyChon.huongVao ?? null,
    tuyChon.gioiHan ?? null,
  )
}
