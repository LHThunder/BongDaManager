import type { LoaiHanhDong } from '../engine/chuoiBong'
import type { Diem } from './noiSuy'

/*
  Dòng thời gian của một pha bóng (spec 006, D102).

  BA ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Nó là lớp thứ tư, đứng giữa `hinhSan` và lớp nội suy.** `hinhSan` nói chỗ
     đứng TẠI MỐC; lớp này nói chuyện gì xảy ra GIỮA hai mốc. Không nhét vào
     `hinhSan` vì chín phép kiểm thuần đang đọc đúng hình dạng "một bộ toạ độ"
     của nó; không nhét vào `noiSuy.ts` vì ở đó có bất biến "tỉ lệ 0 và 1 trả
     đúng mốc" — thứ đang giữ AC-28.3 và AC-25.2 của spec 004.

  2. **Nó thuần.** Không `Math.random`, không `performance.now()`. Cùng một pha
     bóng ở cùng một nhịp luôn cho cùng một dòng thời gian (P1).

  3. **Nó không biết gì về SVG.** Đầu vào là toạ độ đã quy đổi; đầu ra là các
     đoạn kèm tỉ lệ thời gian trong nhịp. Ai vẽ, vẽ bằng gì là việc của `San2D`.
*/

/** Loại của một đoạn trong dòng thời gian. */
export type LoaiDoan = LoaiHanhDong | 'giu'

export interface DoanPhaBong {
  readonly tu: Diem
  readonly den: Diem
  readonly loai: LoaiDoan
  /** Tỉ lệ của NHỊP mà đoạn này bắt đầu, trong `[0, 1]`. */
  readonly tiLeBatDau: number
  /** Tỉ lệ của NHỊP mà đoạn này kết thúc, trong `[0, 1]`. */
  readonly tiLeKetThuc: number
}

/** Một bước của pha bóng, đã quy về toạ độ sân. */
export interface BuocDaQuyDoi {
  readonly diem: Diem
  readonly loai: LoaiHanhDong | null
}

function khoang(a: Diem, b: Diem): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/**
 * Một đoạn tốn bao lâu, theo loại của nó (AC-35.1, AC-35.4, AC-35.5).
 *
 * **Bóng rời chân thì bay; bóng trong chân thì chạy.** Một đường chuyền, một
 * quả tạt hay một cú sút đi hết đoạn của nó trong `msNhip / nhanhGap` — đúng
 * quyết định D95 của spec 005. Một pha rê bóng thì bóng đi **cùng người**, nên
 * nó tốn đúng thời lượng chặng của người, tức chậm hơn `nhanhGap` lần.
 *
 * Đó là toàn bộ khác biệt giữa chuyền và dẫn bóng trên hình: **tốc độ**. Không
 * vệt sáng, không đổi độ cong — người dùng đã chốt như vậy ở `/clarify`.
 */
export function thoiLuongDoan(
  loai: LoaiDoan,
  msNhip: number,
  msNguoi: number,
  nhanhGap: number,
): number {
  if (!(msNhip > 0) || !(nhanhGap > 0) || !(msNguoi > 0)) return 0
  /*
    Cùng MỘT quãng đường thì chuyền nhanh hơn rê bóng đúng `nhanhGap` lần —
    đó là cách phát biểu bằng thời gian của câu "bóng đi nhanh gấp ba người"
    (AC-35.1, AC-35.4). Lấy mốc là thời lượng chặng của NGƯỜI chứ không phải
    của nhịp: người đi nhanh hay chậm là do thể lực và quãng đường (D93, T525),
    và quả bóng phải nhanh hơn **anh ta**, không phải nhanh hơn đồng hồ.
  */
  if (loai === 're-bong' || loai === 'giu') return msNguoi
  return msNguoi / nhanhGap
}

/**
 * Dựng dòng thời gian của một pha bóng trong MỘT nhịp.
 *
 * `cacBuoc` là các bước engine đã kể, **đã quy về toạ độ**. Rỗng nghĩa là nhịp
 * này không có pha bóng nào — hoặc vì dòng tường thuật không kể pha bóng
 * (`thay-nguoi`, `kiet-suc`), hoặc vì đây là **bản ghi trận cũ** thiếu dữ liệu
 * loại bước (D110). Cả hai trường hợp trả **đúng một đoạn `giu`**, và lớp vẽ
 * xử lý nó như spec 005 vẫn làm.
 *
 * Tổng thời lượng **không bao giờ vượt một nhịp**: pha nhiều bước thì mọi đoạn
 * co lại theo cùng một tỉ lệ, chứ không có đoạn nào bị cắt cụt. Một pha có tới
 * `SO_BUOC_TOI_DA` = 12 bước, nên chuyện ấy xảy ra thật.
 */
export function dongThoiGianPhaBong(tuyChon: {
  readonly batDau: Diem
  readonly cacBuoc: readonly BuocDaQuyDoi[]
  readonly msNhip: number
  readonly msNguoi: number
  readonly nhanhGap: number
}): readonly DoanPhaBong[] {
  const { batDau, cacBuoc, msNhip, msNguoi, nhanhGap } = tuyChon

  const motDoanGiu: readonly DoanPhaBong[] = [
    {
      tu: batDau,
      den: batDau,
      loai: 'giu',
      tiLeBatDau: 0,
      tiLeKetThuc: 1,
    },
  ]
  if (cacBuoc.length === 0 || !(msNhip > 0)) return motDoanGiu

  /*
    Đoạn nối đầu tiên: từ chỗ bóng ĐANG ĐỨNG tới chỗ pha bóng bắt đầu. Hai pha
    liên tiếp không phải lúc nào cũng nối đuôi nhau, và bắt bóng nhảy về điểm
    đầu của pha mới là một cú giật (AC-29.3).
  */
  const tho: { tu: Diem; den: Diem; loai: LoaiDoan }[] = []
  const dauPha = cacBuoc[0] as BuocDaQuyDoi
  if (khoang(batDau, dauPha.diem) > 0) {
    tho.push({ tu: batDau, den: dauPha.diem, loai: 'giu' })
  }
  for (let i = 0; i < cacBuoc.length - 1; i += 1) {
    const a = cacBuoc[i] as BuocDaQuyDoi
    const b = cacBuoc[i + 1] as BuocDaQuyDoi
    tho.push({ tu: a.diem, den: b.diem, loai: a.loai ?? 'giu' })
  }
  if (tho.length === 0) return motDoanGiu

  const thoiLuong = tho.map((d) =>
    Math.max(1, thoiLuongDoan(d.loai, msNhip, msNguoi, nhanhGap)),
  )
  const tong = thoiLuong.reduce((a, b) => a + b, 0)
  // Co đều nếu dài hơn một nhịp — không cắt cụt đoạn nào.
  const heSo = tong > msNhip ? msNhip / tong : 1

  const ra: DoanPhaBong[] = []
  let moc = 0
  for (let i = 0; i < tho.length; i += 1) {
    const d = tho[i] as { tu: Diem; den: Diem; loai: LoaiDoan }
    const dai = ((thoiLuong[i] as number) * heSo) / msNhip
    const het = i === tho.length - 1 ? Math.max(moc, 1) : Math.min(1, moc + dai)
    ra.push({
      tu: d.tu,
      den: d.den,
      loai: d.loai,
      tiLeBatDau: moc,
      tiLeKetThuc: het,
    })
    moc = het
  }
  return ra
}

/**
 * Chỗ quả bóng đang ở, tại một tỉ lệ của nhịp.
 *
 * Sau đoạn cuối thì bóng **đứng ở đích**, không bay tiếp — một pha bóng kết
 * thúc trước khi nhịp kết thúc là chuyện bình thường, và khoảng lặng ấy chính
 * là lúc người giữ bóng mới nhận bóng.
 */
export function viTriBongTrongPha(
  cacDoan: readonly DoanPhaBong[],
  tiLe: number,
): Diem {
  const dau = cacDoan[0]
  const cuoi = cacDoan[cacDoan.length - 1]
  if (dau == null || cuoi == null) return { x: 0, y: 0 }

  const t = tiLe < 0 || !Number.isFinite(tiLe) ? 0 : tiLe > 1 ? 1 : tiLe
  for (const d of cacDoan) {
    if (t > d.tiLeKetThuc) continue
    const dai = d.tiLeKetThuc - d.tiLeBatDau
    const u = dai <= 0 ? 1 : (t - d.tiLeBatDau) / dai
    return {
      x: d.tu.x + (d.den.x - d.tu.x) * u,
      y: d.tu.y + (d.den.y - d.tu.y) * u,
    }
  }
  return cuoi.den
}
