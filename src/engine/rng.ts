import type { Rng } from '../domain/types'

/*
  Nguồn ngẫu nhiên tất định sinh từ mã trận (quyết định D19).

  Tự viết chứ không dùng thư viện: một bản cập nhật thư viện đổi dãy số nghĩa
  là MỌI mã trận người dùng đã lưu đều phát lại sai. Hai hàm dưới đây là
  `xmur3` (băm chuỗi thành hạt giống) và `mulberry32` (sinh số từ hạt giống) —
  cả hai đều là thuật toán công khai, viết gọn trong vài dòng, và có test
  khẳng định dãy số cố định.

  Trạng thái của `mulberry32` chỉ là MỘT số 32-bit. Nhờ vậy `TrangThaiTran`
  mang được hạt giống hiện tại, và `buocTiep` là hàm thuần thay vì phụ thuộc
  vào một closure sống bên ngoài — xem ghi chú (1) ở plan mục III.4.
*/

/** `Rng` có thể lấy ra trạng thái để cất vào trạng thái trận. */
export interface RngCoTrangThai extends Rng {
  /** Hạt giống hiện tại; truyền lại cho `taoRngTuHatGiong` là chạy tiếp đúng chỗ. */
  hatGiong(): number
}

/** Băm một chuỗi bất kỳ thành hạt giống 32-bit (xmur3). */
export function hatGiongTuMaTran(maTran: string): number {
  let h = 1779033703 ^ maTran.length

  for (let i = 0; i < maTran.length; i += 1) {
    h = Math.imul(h ^ maTran.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }

  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^ (h >>> 16)) >>> 0
}

/**
 * Bước cộng của `mulberry32` ở mỗi lần rút.
 *
 * Tách thành hằng số có tên để `nhayRut` dùng lại CHÍNH con số ấy: hai bản sao
 * của một hằng số là hai dãy số rồi sẽ trôi khỏi nhau mà không ai thấy.
 */
export const BUOC_HAT_GIONG = 0x6d2b79f5

/**
 * Nhảy `soLan` lần rút trong O(1), thay vì rút `soLan` lần.
 *
 * Trạng thái của `mulberry32` tiến đúng MỘT phép cộng mỗi lần rút, nên cả
 * không gian trạng thái 2^32 là một vòng duy nhất và "nhảy tới đâu" chỉ là một
 * phép nhân. Đây là thứ cho phép mỗi mốc của engine liên tục có một dòng rút
 * riêng mà không phải rút qua toàn bộ các mốc trước nó (D118).
 *
 * PHẢI dùng `Math.imul`, KHÔNG được nhân thường. `soLan × BUOC_HAT_GIONG` vượt
 * 2^53 ngay từ `soLan = 2^30`, nên `*` mất độ chính xác float: lệch **43** ở
 * `2^30` và lệch **781.781** ở `5754 · 2^30`. `Math.imul` lấy đúng phần dư
 * mod 2^32 với mọi `soLan` — kể cả `soLan` vượt 2^31, vì phép nhân mod 2^32
 * chỉ phụ thuộc đầu vào mod 2^32.
 */
export function nhayRut(hatGiong: number, soLan: number): number {
  return ((hatGiong | 0) + Math.imul(soLan, BUOC_HAT_GIONG)) >>> 0
}

/** Nguồn ngẫu nhiên chạy tiếp từ một hạt giống đã có (mulberry32). */
export function taoRngTuHatGiong(hatGiongBanDau: number): RngCoTrangThai {
  let a = hatGiongBanDau | 0

  return {
    next(): number {
      a = (a + BUOC_HAT_GIONG) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    hatGiong(): number {
      return a >>> 0
    },
  }
}

/** Nguồn ngẫu nhiên của một trận, sinh từ mã trận. */
export function taoRng(maTran: string): RngCoTrangThai {
  return taoRngTuHatGiong(hatGiongTuMaTran(maTran))
}

/*
  Bảng chữ Crockford base32: bỏ I, L, O, U để người dùng đọc và gõ lại mã trận
  không nhầm (I với 1, O với 0, L với 1; U bỏ để tránh ghép thành từ tục).
*/
export const BANG_CHU_MA_TRAN = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export const DO_DAI_MA_TRAN = 10

/**
 * Sinh một mã trận mới. Nguồn ngẫu nhiên THẬT do lớp giao diện tạo và truyền
 * vào — engine không được tự gọi `Math.random` (P1), đúng như `FormCauThu`
 * đã làm ở Giai đoạn 1 với việc sinh nhanh chỉ số.
 */
export function taoMaTran(rng: Rng): string {
  let ma = ''
  for (let i = 0; i < DO_DAI_MA_TRAN; i += 1) {
    const viTri = Math.floor(rng.next() * BANG_CHU_MA_TRAN.length)
    ma += BANG_CHU_MA_TRAN[Math.min(viTri, BANG_CHU_MA_TRAN.length - 1)]
  }
  return ma
}

/** Mã trận có đúng hình dạng không — dùng khi người dùng tự gõ lại mã. */
export function laMaTranHopLe(ma: string): boolean {
  if (ma.length !== DO_DAI_MA_TRAN) return false
  for (const c of ma) {
    if (!BANG_CHU_MA_TRAN.includes(c)) return false
  }
  return true
}
