import type { Diem } from './noiSuy'

/*
  Dao động lúc đứng chờ: thứ làm sân hết chết (US-28, T506).

  BA ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Nó trả về một LỆCH, không phải một toạ độ.** Lệch ấy được cộng vào sau
     cùng, ngay trước khi vẽ — sau cả `hinhSan` lẫn lớp nội suy. Nhờ vậy bất
     biến "ở tỉ lệ 0 và 1 trả về ĐÚNG mốc" của `noiSuy.ts` không bị nới lỏng
     một chút nào, và đó là thứ giữ AC-28.3 (cùng AC-25.2 của spec 004).
     Quyết định D89.

  2. **Không có nguồn ngẫu nhiên nào ở đây.** Pha của mỗi người băm ra từ
     `playerId`, thời gian đi vào qua tham số (P1). Nên xem lại cùng một trận
     ở cùng một nhịp thì chuyển động giống hệt — khác với việc bám
     `performance.now()`, cách ấy cho hai lần xem hai kết quả.

  3. **Thời gian là ĐỒNG HỒ TRẬN, không phải đồng hồ thật.** Và không được
     dùng phút của dòng tường thuật: `SuKien.phut` là phút HIỂN THỊ, nó không
     nhích khi một phút không có tình huống nào — bẫy đã biết từ spec 004,
     ghi trong quyết định D90. Dao động bám một con số như thế sẽ đứng chết
     hàng giây, phá đúng cái AC-28.1 mà nó sinh ra để phục vụ.
*/

/**
 * Biên độ dao động, **hai trục riêng** (D89, siết lại sau `/analyze`).
 *
 * Đơn vị là khoảng giãn giữa hai cầu thủ đứng chung một vùng, nên nó tự co
 * theo khung sân — sân 5 người có khung nhỏ hơn thì dao động cũng nhỏ theo.
 *
 * Vì sao hai trục chứ không một: bản chốt đầu của `/clarify` là "một nửa
 * khoảng giãn" cho cả hai, và `/analyze` tính ra hai chỗ vỡ. Hai người cùng
 * một **hàng ngang** mỗi người lệch nửa khoảng giãn là lệch nhau tới một
 * khoảng giãn, gấp bốn ngưỡng AC-30.3; hai người cùng một **vùng** lệch về
 * phía nhau thì trùng khít, phá AC-30.5 và cả AC-15.2 của spec 002 đã đóng.
 */
export interface BienDoDaoDong {
  /** Dọc sân — trục của một hàng ngang. Giữ hàng bốn còn ra hàng bốn. */
  readonly doc: number
  /** Ngang sân — trục mà những người cùng một vùng được giãn ra. */
  readonly ngang: number
}

/**
 * Phần khoảng giãn được phép dùng cho mỗi trục: **một phần tám**.
 *
 * Hai người lệch ngược chiều nhau thì cách nhau vẫn còn ít nhất ba phần tư
 * khoảng giãn (AC-30.5), và hai người cùng hàng lệch nhau tối đa một phần tư
 * (AC-30.3) — đúng hai ngưỡng ấy, với biên an toàn gấp đôi.
 */
export const PHAN_KHOANG_GIAN = 1 / 8

/** Biên độ cho một khoảng giãn cụ thể. */
export function bienDoTuKhoangGian(khoangGian: number): BienDoDaoDong {
  const r = Math.max(0, khoangGian) * PHAN_KHOANG_GIAN
  return { doc: r, ngang: r }
}

/**
 * Chu kỳ dao động, tính bằng **phút trận**.
 *
 * Chọn một số không tròn: chu kỳ tròn phút thì dao động trùng nhịp với đồng
 * hồ trận và cả sân thở cùng một lúc mỗi phút — đúng cái "khối máy" mà
 * AC-28.4 cấm.
 */
const CHU_KY_PHUT = 1.7

/** Trục ngang chạy nhanh hơn một chút, để đường đi là hình số 8 méo chứ không phải một đường chéo. */
const LECH_TAN_SO = 1.31

function kep11(v: number): number {
  return v < -1 ? -1 : v > 1 ? 1 : v
}

/**
 * Pha riêng của một người, băm tất định từ `playerId` (AC-28.4).
 *
 * FNV-1a **kèm một bước trộn cuối**, không `Math.random`: hai người cạnh nhau
 * phải lệch pha để sân không thở đồng loạt, mà cùng một người thì phải luôn
 * ra cùng một pha, kể cả ở lần xem lại sau (P1).
 *
 * **Bước trộn cuối là bắt buộc, không phải trang trí.** FNV-1a thuần trộn các
 * bit THẤP rất tốt nhưng để các bit CAO gần như nguyên, mà phép chia cho 2^32 ở
 * đây lại đọc đúng các bit cao. Đo thật lúc làm T507: mọi `playerId` dạng
 * `cau-thu-N` cho ra pha dồn trong khoảng **5,6–5,8** trên dải 0–2π — tức cả sân
 * thở gần như cùng một nhịp, đúng điều AC-28.4 cấm. Ba dòng trộn cuối (bộ
 * hoàn tất của murmur3) đẩy chúng trải ra cả dải.
 */
export function phaCuaNguoi(playerId: string): number {
  let h = 2166136261
  for (let i = 0; i < playerId.length; i += 1) {
    h ^= playerId.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 16
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  h = Math.imul(h, 3266489909)
  h ^= h >>> 16
  return ((h >>> 0) / 4294967296) * Math.PI * 2
}

/**
 * Lệch dao động của một người tại một thời điểm của TRẬN (AC-28.1, AC-28.2).
 *
 * `thoiDiemTran` tính bằng **phút trận**, có phần thập phân — phút đồng hồ
 * cộng phần đã trôi trong nhịp. Thời gian thật không đi vào đây.
 *
 * Luôn trả về một lệch nằm trong biên, với mọi đầu vào: `NaN`, số âm, biên
 * âm. Một hàm vẽ bị gọi mỗi khung hình thì không được phép ném.
 */
export function lechDaoDong(
  playerId: string,
  thoiDiemTran: number,
  bienDo: BienDoDaoDong,
): Diem {
  const t = Number.isFinite(thoiDiemTran) ? thoiDiemTran : 0
  const pha = phaCuaNguoi(playerId)
  const w = (2 * Math.PI) / CHU_KY_PHUT

  const doc = Math.max(0, bienDo.doc)
  const ngang = Math.max(0, bienDo.ngang)

  return {
    x: kep11(Math.sin(t * w + pha)) * doc,
    y: kep11(Math.sin(t * w * LECH_TAN_SO + pha * LECH_TAN_SO + 1)) * ngang,
  }
}
