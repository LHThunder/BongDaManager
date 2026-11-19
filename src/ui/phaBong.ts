import type { LoaiHanhDong } from '../engine/chuoiBong'
import type { LoaiSuKien } from '../engine/suKien'
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

// ---------------------------------------------------------------------------
// Ai đang giữ bóng (spec 006, D103, bảng 3.1 của plan)
// ---------------------------------------------------------------------------

/**
 * Những gì cần biết Ễ MỘT DÒNG để suy ra người giữ bóng.
 *
 * Cố tình **không** nhận cả `SuKien`: luật này chỉ đọc hai trường, và viết
 * đúng hai trường ra đây là cách nói rằng nó không đọc gì khác — không tỉ số,
 * không mẫu câu, không đường bóng.
 */
export interface DongGiuBong {
  readonly loai: LoaiSuKien
  readonly cacCauThu: readonly string[]
}

/**
 * Người giữ bóng **sau** một dòng tường thuật (AC-33.5, D103).
 *
 * `nguoiThamGiaTinhHuong` ở `tran.ts` quy định thứ tự `cacCauThu`, nên bảng
 * dưới đây **đọc được từ dự liệu đã có**, không đoán một ai:
 *
 * | Loại | Người giữ bóng |
 * |---|---|
 * | `co-hoi`, `thoat-xuong`, `tat-canh`, `pham-loi` | `cacCauThu[0]` — người kết thúc pha / người được hưởng |
 * | `cuu-thua` | `cacCauThu[1]` — **thủ môn** đã cứu, không phải người sút |
 * | `mat-bong`, `cuop-bong-cao` | `cacCauThu[1]` — **người cướp được**, thuộc đội kia |
 * | `the-vang`, `the-do`, `thay-nguoi`, `kiet-suc` | **giữ nguyên người cũ** — không phải pha bóng |
 * | `ban-thang`, `bat-dau`, `het-hiep`, `ket-thuc`, `huy-tran` | không ai |
 *
 * **Hai loại cuối bảng 3.1 của plan không nói tới**: `ket-thuc` và `huy-tran`.
 * Chúng là dòng mốc đóng trận, không phải pha bóng, nên chúng theo đúng
 * `het-hiep`: không ai giữ bóng nữa. Viết ra đây vì hàm này phải **toàn phần**
 * — bỏ sót một loại là một `undefined` đi xa tới lớp vẽ.
 *
 * `truocDo` là người giữ bóng ở nhịp trước. Nó là tham số chứ không phải
 * trạng thái trong module: hàm này thuần, và cả phép kiểm xương sống của R50
 * dựa vào việc gọi nó tuần tự qua cả trận được.
 */
export function nguoiGiuBong(
  dong: DongGiuBong | null,
  truocDo: string | null,
): string | null {
  if (dong == null) return truocDo
  const dau = dong.cacCauThu[0] ?? null
  /*
    Lùi về `cacCauThu[0]` rồi `truocDo` khi phần tử đúng chỉ số không có:
    `nguoiTaiVung` trả `null` được khi đội kia không còn ai ở gần, và lúc ấy
    thả quyền giữ bóng về `null` là cho quả bóng rời chân mọi người — đúng cú
    giật mà R50 nói tới.
  */
  const thuHai = dong.cacCauThu[1] ?? dau ?? truocDo

  switch (dong.loai) {
    case 'co-hoi':
    case 'thoat-xuong':
    case 'tat-canh':
    case 'pham-loi':
      return dau ?? truocDo

    case 'cuu-thua':
    case 'mat-bong':
    case 'cuop-bong-cao':
      return thuHai

    case 'the-vang':
    case 'the-do':
    case 'thay-nguoi':
    case 'kiet-suc':
      return truocDo

    case 'ban-thang':
    case 'bat-dau':
    case 'het-hiep':
    case 'ket-thuc':
    case 'huy-tran':
      return null
  }
}

// ---------------------------------------------------------------------------
// Ai nhận một đường chuyền (spec 006, D112, mục 3.2 của plan)
// ---------------------------------------------------------------------------

/** Một người trên sân, đủ cho luật suy người nhận làm việc. */
export interface NguoiTrenSan {
  readonly playerId: string
  readonly diem: Diem
  /**
   * Đồng đội của người đang giữ bóng?
   *
   * Lớp vẽ biết điều này — nó dụng từng điểm theo từng đội. Module này
   * không biết, và cố tình không biết: nó không đọc trạng thái trận.
   */
  readonly laDongDoi: boolean
}

/**
 * Người nhận một đường chuyền (AC-35.2, D112).
 *
 * **Đây là một SUY DIỄN, không phải sự thật của trận.** Engine chưa bao giờ
 * tính ra người này: nó cho `cacCauThu` của cả dòng và loại của từng bước, chứ
 * không nói bước thứ ba tới chân ai. Luật suy ở đây được phép tồn tại **chỉ
 * trong lớp vẽ**: không được vào dòng tường thuật, không vào thống kê, không
 * lưu xuống đĩa. Đổi lại, nó **không đổi một con số nào** của trận (P2).
 *
 * Tất định tuyệt đối: gần nhất tới `dichDen`, hòa thì lấy `playerId` nhỏ hơn
 * theo thứ tự chuỗi. Không đọc thứ tự mảng đầu vào, nên đảo `cacNguoi` vẫn ra
 * cùng một người (P1).
 */
export function nguoiNhanChuyen(
  dichDen: Diem,
  cacNguoi: readonly NguoiTrenSan[],
  nguoiChuyen: string | null,
): string | null {
  let chon: NguoiTrenSan | null = null
  let gan = Infinity
  for (const n of cacNguoi) {
    if (!n.laDongDoi) continue
    if (n.playerId === nguoiChuyen) continue
    const d = khoang(dichDen, n.diem)
    if (d < gan || (d === gan && chon != null && n.playerId < chon.playerId)) {
      chon = n
      gan = d
    }
  }
  return chon?.playerId ?? null
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
