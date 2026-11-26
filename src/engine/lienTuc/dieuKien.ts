import { hatGiongTuMaTran } from '../rng'

/*
  ====================================================================
  THỜI TIẾT VÀ GIÓ CỦA MỘT TRẬN (T722, AC-38.9 + AC-45.7, quyết định D130).
  ====================================================================

  ⚠️ **Cả module này tiêu ĐÚNG 0 lần rút, và điều đó được CHỮ KÝ bảo vệ.**
  `dieuKienTuMaTran` nhận một `string` và không nhận `Rng`, nên nó **không thể**
  rút một lần nào — bất biến "không chen vào dòng ngẫu nhiên" được kiểm bằng số
  học thay vì bằng lấy mẫu.

  *Phương án bị loại (a):* rút một lần trên dòng liên tục lúc mở trận. Nó cột
  thời tiết vào **số lần rút đứng trước nó**, nên thêm một lần rút ở bất cứ đâu
  là đổi thời tiết của **mọi** trận đã lưu — đúng thứ AC-45.2 hứa không bao giờ
  xảy ra.
  *Phương án bị loại (b):* thêm trường thời tiết vào bản ghi trận. Nó phá AC-45.4
  ("bản ghi chỉ lưu mã trận và…") và buộc bump `DB_VERSION` cho một thứ **dẫn
  xuất được** từ mười ký tự đã có.

  ⚠️ **Và không có hàm băm thứ ba.** Repo đã có hai: `hatGiongTuMaTran` (xmur3)
  ở `rng.ts`, và một **bản sao riêng** của hằng số xmur3 ở `ui/daoDong.ts`.
  Module này **gọi lại** `hatGiongTuMaTran`; hằng tỉ lệ vàng dưới đây chỉ để
  **tách lớp**, không phải để băm.
*/

/**
 * Hằng trộn tách các lớp đại lượng ra khỏi nhau — hằng tỉ lệ vàng 32-bit.
 *
 * **Cố tình khác** `BUOC_HAT_GIONG` (`0x6d2b79f5`) của `mulberry32`: hai con số
 * khác nhau nghĩa là không lớp nào ở đây trùng một giá trị mà `taoRngTuHatGiong`
 * sẽ sinh ra, nên thời tiết của một trận không bao giờ "nhìn như" một lần rút.
 */
export const TRON_DIEU_KIEN = 0x9e3779b9

/** Năm kiểu thời tiết. Thứ tự này là thứ tự **ma sát giảm dần**. */
export type ThoiTiet = 'nong' | 'kho' | 'am' | 'mua' | 'mua-to'

export const CAC_THOI_TIET: readonly ThoiTiet[] = [
  'nong',
  'kho',
  'am',
  'mua',
  'mua-to',
]

/**
 * Gia tốc chậm dần của quả bóng **lăn sệt**, m/s² — bảng ở **đúng một chỗ**.
 *
 * ⚠️ **Sân ướt thì bóng đi XA hơn**, tức ma sát NHỎ hơn — chiều người dùng chốt
 * ngày 2026-11-23 (câu 20), vì bản mô tả gốc tự nói ngược ở mục 10 và mục 21.
 *
 * Ba kiểu đầu nằm trong dải **1–2 m/s²** mà AC-38.7 gọi là "sân khô"; hai kiểu
 * mưa nằm **dưới 1**, tức "chậm dần ít hơn mức đó". Đó là cách đọc AC-38.7
 * thành cấu trúc, và `dieuKien.test.ts` canh đúng hai mệnh đề ấy.
 *
 * Bảng này sống ở đây, **không** ở `vatLyBong.ts`: **T742** sẽ đọc chính nó để
 * đo quãng bóng lăn, và một hằng số có hai nguồn là hai con số rồi sẽ trôi khỏi
 * nhau mà không ai thấy.
 */
export const MA_SAT_LAN_SET: Readonly<Record<ThoiTiet, number>> = {
  nong: 1.85,
  kho: 1.6,
  am: 1.3,
  mua: 0.95,
  'mua-to': 0.75,
}

/**
 * Trọng số của năm kiểu thời tiết.
 *
 * `plan.md` D130 chốt **bảng ma sát** nhưng để **phân phối** mở, nên con số ở
 * đây là của task này và nói rõ cái giá: chia đều năm kiểu thì **một phần năm**
 * số trận là mưa to, nhiều hơn hẳn một mùa giải thật. Trọng số dưới đây cho mưa
 * to **5%** và sân khô **40%**.
 */
export const TRONG_SO_THOI_TIET: Readonly<Record<ThoiTiet, number>> = {
  nong: 0.15,
  kho: 0.4,
  am: 0.25,
  mua: 0.15,
  'mua-to': 0.05,
}

/** Tốc độ gió lớn nhất, m/s — "gió mạnh" theo thang Beaufort cấp 4–5. */
export const GIO_TOI_DA = 8

/**
 * Hệ số gió, s⁻¹ — con số của D130.
 *
 * Nó là **hệ số**, không phải một gia tốc: quãng lệch ngang mà gió thổi một quả
 * bóng bổng đi bằng `HE_SO_GIO × tocDoGio × thoiGianBay`. T723 là chỗ dùng nó.
 */
export const HE_SO_GIO = 0.08

/**
 * Hai cửa của gió — gió **chỉ** ăn vào bóng bổng dài.
 *
 * `z` phải vượt `NGUONG_Z_GIO` **và** quãng ngang phải từ `NGUONG_QUANG_GIO`.
 * Một đường chuyền sệt 8 m thì gió không đổi được gì, và AC-38.9 nói gió chỉ
 * ảnh hưởng "quỹ đạo bóng bổng dài" — hai cửa này là chữ ấy viết thành số.
 */
export const NGUONG_Z_GIO = 1.5
export const NGUONG_QUANG_GIO = 25

/** Điều kiện của một trận, dẫn xuất hoàn toàn từ mã trận. */
export interface DieuKienTran {
  readonly thoiTiet: ThoiTiet
  /** Tốc độ gió, m/s, trong [0; `GIO_TOI_DA`]. */
  readonly tocDoGio: number
  /** Hướng gió, độ, trong [0; 360). */
  readonly huongGio: number
}

/**
 * Băm mã trận cho một **lớp** đại lượng, trả số nguyên 32-bit không dấu.
 *
 * Trộn lớp vào hạt giống bằng `TRON_DIEU_KIEN` rồi **tán bit bằng chính xmur3**
 * — tức gọi lại `hatGiongTuMaTran`, không viết hàm băm thứ ba.
 */
function bamLop(maTran: string, lop: number): number {
  const goc = hatGiongTuMaTran(maTran)
  const tron = (goc ^ Math.imul(lop + 1, TRON_DIEU_KIEN)) >>> 0
  return hatGiongTuMaTran(`${maTran}#${tron}`)
}

/** Số 32-bit thành phần trong [0; 1). */
function phanCuaBam(bam: number): number {
  return bam / 4294967296
}

/** Thời tiết theo bảng trọng số, từ một phần trong [0; 1). */
function thoiTietTuPhan(phan: number): ThoiTiet {
  let con = phan
  for (const tt of CAC_THOI_TIET) {
    con -= TRONG_SO_THOI_TIET[tt]
    if (con < 0) return tt
  }
  /*
    Chỉ tới được đây nếu tổng trọng số nhỏ hơn 1 — tức bảng trọng số bị sửa sai.
    Trả kiểu cuối thay vì `undefined`: một `undefined` ở đây sẽ đi vào bảng ma
    sát rồi thành `NaN` trong vật lý bóng, cách xa chỗ gây lỗi mười lớp hàm.
  */
  return CAC_THOI_TIET[CAC_THOI_TIET.length - 1]!
}

/**
 * Điều kiện của trận — **hàm thuần của mã trận, 0 lần rút**.
 *
 * Ba đại lượng lấy từ **ba lớp băm khác nhau**, nên thời tiết không kéo theo
 * hướng gió: nếu dùng chung một lớp thì mọi trận mưa to đều có gió cùng một
 * hướng, và người xem sẽ thấy điều đó trước khi phép kiểm nào thấy.
 */
export function dieuKienTuMaTran(maTran: string): DieuKienTran {
  return {
    thoiTiet: thoiTietTuPhan(phanCuaBam(bamLop(maTran, 0))),
    tocDoGio: phanCuaBam(bamLop(maTran, 1)) * GIO_TOI_DA,
    huongGio: phanCuaBam(bamLop(maTran, 2)) * 360,
  }
}

/** Chiều gió so với SÂN, không phải so với la bàn. */
export type ChieuGio = 'doc' | 'ngang' | 'cheo'

/** Nửa bề rộng của mỗi cung chiều gió, độ — 45° chia đôi. */
export const NUA_CUNG_CHIEU_GIO = 22.5

/**
 * Xếp hướng gió vào ba chiều **so với sân**: dọc, ngang, hay chéo.
 *
 * ⚠️ **Không gọi nó là bắc/nam/đông/tây.** `huongGio` là một góc trong hệ toạ độ
 * **của sân** (`x` dọc theo chiều dài, `y` theo chiều rộng), không phải một
 * phương địa lý — sân này không có la bàn. Nói "gió bắc" là nói một điều mà dữ
 * liệu không biết.
 *
 * Gấp về nửa vòng trước khi xếp, vì gió thổi theo `+x` và theo `−x` đều là **dọc
 * sân**: chiều ở đây là một **phương**, không phải một **hướng**.
 */
export function chieuCuaGio(huongDo: number): ChieuGio {
  const phuong = ((huongDo % 180) + 180) % 180
  if (phuong < NUA_CUNG_CHIEU_GIO || phuong >= 180 - NUA_CUNG_CHIEU_GIO) {
    return 'doc'
  }
  if (
    phuong >= 90 - NUA_CUNG_CHIEU_GIO &&
    phuong < 90 + NUA_CUNG_CHIEU_GIO
  ) {
    return 'ngang'
  }
  return 'cheo'
}

/**
 * Gió có ăn vào đường bóng này không — hai cửa của AC-38.9.
 *
 * Tách thành hàm riêng thay vì viết `if` ở chỗ dùng, vì **T723** phải chứng
 * minh được mệnh đề **chống mã chết**: gió 0 và gió 7,75 m/s trên một đường
 * **sệt** phải ra vị trí **giống hệt từng số**. Một điều kiện nằm rải trong
 * thân hàm thì không có gì để phép kiểm ấy trỏ vào.
 */
export function gioCoAnVaoDuongBong(
  zDinh: number,
  quangNgang: number,
): boolean {
  return zDinh > NGUONG_Z_GIO && quangNgang >= NGUONG_QUANG_GIO
}
