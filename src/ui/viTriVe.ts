import type { ThucTheTaiMoc } from '../engine/lienTuc/loMoc'
import type { Diem } from './noiSuy'
import { toaDoTuMet, type KhungAnh } from './quyDoiMet'

/*
  Chỗ hợp vị trí vẽ của một điểm trên sân (T714, AC-37.6 và AC-45.9).

  VÌ SAO FILE NÀY TỒN TẠI. Trước T714, phép hợp ấy là một hàm **bên trong**
  `San2D.tsx`, đóng kín trên trạng thái component — nên không một phép kiểm nào
  của repo gọi tới được. Bộ kiểm chạy ở `environment: 'node'`, và chính khoảng
  mù ấy đã để lọt lỗi "thủ môn chạy tới giữa sân" suốt một lát cắt: 1.291 phép
  kiểm xanh trong khi mắt người dùng bắt được ngay.

  Hàm ở đây **thuần**: mọi thứ nó cần đi vào qua tham số, không đọc một hook
  nào, không chạm `document`. Nhờ vậy thứ tự các lớp — phần có nhiều bẫy nhất —
  kiểm được bằng số.

  ⚠️ FILE NÀY KHÔNG IMPORT GÌ TỪ `San2D.tsx`, và đó là chủ ý. `quyDoiMet.ts` đã
  đặt tiền lệ ấy ở T703: nhận khung ảnh làm **tham số** thay vì đi lấy. Kéo một
  `.tsx` vào đây là kéo cả React vào một module mà phép kiểm `node` phải gọi
  được trần trụi.
*/

/** Chỉ số ô nói "không ai giữ bóng", theo đúng quy ước của lô mốc. */
export const KHONG_AI_GIU_O = -1

/**
 * Một khung hình của **chế độ liên tục**, toạ độ bằng **mét**.
 *
 * Đây là kiểu mà `plan.md` nhắc ở D121, ở sơ đồ mục 3 và ở diff mục 4.1 — nhưng
 * **không task nào trong 48 task tạo nó** cho tới khi T709 chuyển nó sang đây
 * ngày 2026-11-23. Đặt ở T709 thì nó không có người sản xuất lẫn người đọc; đặt
 * ở T714 thì kiểu, nơi sinh toạ độ và nơi vẽ nằm cùng một lát.
 */
export interface AnhChupMet {
  /** 26 ô theo đúng bố cục của lô mốc; đọc bằng chỉ số. */
  readonly thucThe: readonly ThucTheTaiMoc[]
  /**
   * Ô của từng cầu thủ.
   *
   * Ảnh chụp mang theo bảng này chứ không để lớp vẽ tự suy: bố cục 26 ô là
   * quy ước của **lô mốc**, và bắt lớp vẽ biết nó là buộc hai tầng phải sửa
   * cùng lúc mỗi khi bố cục đổi.
   */
  readonly oCuaNguoi: ReadonlyMap<string, number>
  /** Ô của người đang giữ bóng, hoặc `KHONG_AI_GIU_O`. */
  readonly nguoiGiuBong: number
}

/** Khung an toàn của mặt cỏ, tính bằng đơn vị viewBox. */
export interface GioiHanVe {
  readonly xTu: number
  readonly xDen: number
  readonly yTu: number
  readonly yDen: number
}

/**
 * Kết quả của từng lớp sinh vị trí, đã tính sẵn ở nơi có đủ dữ liệu.
 *
 * Hàm hợp **không tự gọi** các lớp ấy: gọi chúng cần trạng thái component, mà
 * trạng thái component thì không vào được một hàm thuần. Nhận kết quả thì vừa
 * giữ được tính thuần, vừa để **thứ tự hợp** — chỗ thật sự có bẫy — kiểm được.
 */
export interface LopViTri {
  /** Toạ độ mốc theo sơ đồ, trước mọi lớp. */
  readonly moc: Diem
  /** Sau lớp nội suy; `null` khi người này không có chuyển tiếp nào. */
  readonly sauNoiSuy: Diem | null
  /** Sau lớp bám đường bóng; `null` khi người này không giữ bóng. */
  readonly sauBamBong: Diem | null
  /** Dải cho phép của thủ môn, hoặc `null` nếu không phải thủ môn. */
  readonly daiThuMon: { readonly tu: number; readonly den: number } | null
  /** Lệch của lớp dao động chờ. */
  readonly lechDao: Diem
}

function kep(v: number, tu: number, den: number): number {
  return Math.min(Math.max(v, tu), den)
}

/**
 * Vị trí vẽ ở **chế độ liên tục**: đọc thẳng mốc engine phát, không uốn gì.
 *
 * Trả `null` khi ô ấy không có mặt trên sân hoặc chỉ số nằm ngoài lô — người
 * gọi hiểu đó là "không vẽ điểm này".
 *
 * ⚠️ ĐÂY LÀ CHỖ "GẮN CỔNG", VÀ NÓ LÀ MỘT PHÉP TRỪ CHỨ KHÔNG PHẢI MỘT PHÉP CỘNG.
 *
 * Bảy lớp sinh vị trí của chế độ cổ điển đều **tắt** ở đây: nội suy Hermite, hệ
 * số theo độ mệt, hệ số rơi-đứng-yên, bám đường bóng, kẹp dải thủ môn ở lớp vẽ,
 * dao động chờ, và nghiêng khối theo bóng. Ba lớp đầu **biến dạng thời gian**
 * trên đường đi, nên nếu để chúng chạy thì `(x′ − x)/dt` **không còn bằng** vận
 * tốc engine nói — và AC-38.1 đo trên hình sẽ lệch khỏi AC-38.1 đo trong engine.
 * Hai thứ ấy phải là **một** con số.
 */
export function viTriVeLienTuc(
  anhChup: AnhChupMet,
  playerId: string,
  khung: KhungAnh,
): Diem | null {
  const chiSo = anhChup.oCuaNguoi.get(playerId)
  if (chiSo === undefined) return null
  const o = anhChup.thucThe[chiSo]
  if (!o || o.coMat === 0) return null
  return toaDoTuMet(khung, o.x, o.y)
}

/**
 * Vị trí vẽ ở **chế độ cổ điển**: hợp sáu lớp theo đúng thứ tự đã chốt.
 *
 * Thứ tự là có nghĩa, và mỗi bước đổi chỗ đều đã làm vỡ một AC trong lịch sử
 * của spec 005 và 006:
 *
 * 1. **Giảm chuyển động** thì về thẳng toạ độ mốc — không nội suy, không dao
 *    động (AC-31.1).
 * 2. **Nội suy** giữa hai mốc.
 * 3. **Bám đường bóng** cho người đang giữ bóng (D104, D105).
 * 4. **Kẹp dải thủ môn** — sau bám bóng, vì chính lớp bám bóng là thứ từng kéo
 *    thủ môn ra giữa sân (T622); kẹp trước nó thì kẹp xong lại bị kéo đi.
 * 5. **Dao động chờ** cộng SAU CÙNG, và chỉ cho người.
 * 6. **Kẹp mặt cỏ** để không ai rơi ra ngoài khung.
 */
export function viTriVeCoDien(
  lop: LopViTri,
  gioiHan: GioiHanVe,
  giamChuyenDong: boolean,
): Diem {
  if (giamChuyenDong) return lop.moc

  const sauNoiSuy = lop.sauNoiSuy ?? lop.moc
  const sauBamBong = lop.sauBamBong ?? sauNoiSuy
  const sauThuMon = lop.daiThuMon
    ? { x: kep(sauBamBong.x, lop.daiThuMon.tu, lop.daiThuMon.den), y: sauBamBong.y }
    : sauBamBong

  return {
    x: kep(sauThuMon.x + lop.lechDao.x, gioiHan.xTu, gioiHan.xDen),
    y: kep(sauThuMon.y + lop.lechDao.y, gioiHan.yTu, gioiHan.yDen),
  }
}

/**
 * Vị trí vẽ của một điểm, ở **chế độ nào cũng dùng được**.
 *
 * `anhChup` khác `null` **là** thẻ phân biệt hai chế độ — đúng như D121 chốt.
 * Cái giá của cách ấy, plan đã ghi tên: kiểu **không** phát biểu được "chế độ
 * liên tục bắt buộc có mốc" lúc biên dịch, nên chỗ này có một cổng lúc chạy —
 * ô thiếu hoặc không có mặt thì rơi về đường cổ điển thay vì vẽ sai chỗ.
 */
export function viTriVe(
  lop: LopViTri,
  gioiHan: GioiHanVe,
  giamChuyenDong: boolean,
  anhChup: AnhChupMet | null,
  playerId: string,
  khung: KhungAnh,
): Diem {
  if (anhChup) {
    const lienTuc = viTriVeLienTuc(anhChup, playerId, khung)
    if (lienTuc) return lienTuc
  }
  return viTriVeCoDien(lop, gioiHan, giamChuyenDong)
}
