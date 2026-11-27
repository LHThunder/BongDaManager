import { docMoc, type LoMoc } from '../engine/lienTuc/loMoc'
import { MOC_MOI_PHUT } from '../engine/lienTuc/moc'
import type { AnhChupMet } from './viTriVe'

/*
  ====================================================================
  ĐỒNG HỒ VẼ → CHỈ SỐ MỐC (T732, AC-31.4 + AC-37.7).
  ====================================================================

  Lớp vẽ biết **đã trôi bao nhiêu mili giây trong phút trận này** và **một phút
  trận dài bao nhiêu mili giây** ở mức tốc độ đang chọn. Lô mốc của engine liên
  tục có `MOC_MOI_PHUT` mốc cho đúng một phút ấy. Quy đổi giữa hai thứ là **một
  phép chia**, và module này không biết gì hơn thế.

  ⚠️ **KHÔNG có một nhánh nào theo TÊN mức tốc độ ở đây, và đó là cả điểm của
  lát này.** Một nhánh `if` theo **tên** mức trong lớp vẽ là chỗ mà mức thứ sáu —
  hoặc một lần đổi số của mức cũ — sẽ **lặng lẽ** không được xử lý. Mức tốc độ
  vào đây **chỉ** dưới dạng con số `msMoiPhut`, và một phép kiểm quét chính mã
  nguồn file này canh điều đó.

  Hệ quả: thêm hay đổi mức tốc độ **không chạm** module này. Đó là ngược hẳn với
  ca `MS_MOI_PHUT` của spec 005, nơi thêm mức thứ năm tự động mở rộng mấy phép
  kiểm ở hai file khác.
*/

/** Một chỗ trên trục mốc: mốc trước, và phần đã đi tới mốc sau. */
export interface MocVe {
  /** Chỉ số mốc trong phút, trong `[0; soMoc - 1]`. */
  readonly chiSo: number
  /** Phần đã đi từ mốc ấy tới mốc sau, trong `[0; 1)`. */
  readonly phan: number
}

/**
 * Đồng hồ vẽ ở giây thứ mấy của lô mốc.
 *
 * `soMoc` là tham số chứ không đọc thẳng `MOC_MOI_PHUT`, vì **T731** sẽ làm dày
 * cửa sổ tình huống quan trọng lên gấp đôi: lúc ấy một lô có hai mật độ mốc, và
 * một hàm đóng cứng số mốc sẽ sai ở đúng những pha đáng xem nhất.
 */
export function mocVeTaiThoiDiem(
  msTrongPhut: number,
  msMoiPhut: number,
  soMoc: number = MOC_MOI_PHUT,
): MocVe {
  if (soMoc <= 0) return { chiSo: 0, phan: 0 }
  /*
    Một phép chia, và nó là phép duy nhất cần: tỉ lệ đã trôi của phút, nhân số
    mốc. `msMoiPhut` không bao giờ bằng 0 — mức ngắn nhất của bảng là 20 ms — nhưng
    phép chia cho 0 ở lớp vẽ sinh `Infinity` rồi `NaN` toạ độ, nên vẫn chặn.
  */
  const viTri = msMoiPhut <= 0 ? soMoc : (msTrongPhut / msMoiPhut) * soMoc
  if (!Number.isFinite(viTri) || viTri <= 0) return { chiSo: 0, phan: 0 }
  /*
    Quá phút thì đứng ở mốc cuối chứ không chạy tiếp sang lô sau: lô sau chưa
    tồn tại, và đọc quá đuôi lô là đọc số 0 của bộ đệm.
  */
  if (viTri >= soMoc) return { chiSo: soMoc - 1, phan: 0 }
  const chiSo = Math.floor(viTri)
  return { chiSo, phan: viTri - chiSo }
}

/**
 * Ảnh chụp một mốc của lô, dạng mà lớp vẽ đọc được.
 *
 * Người giữ bóng lấy **từ chính tiêu đề mốc**, không suy lại ở lớp vẽ: engine
 * đã quyết ai giữ bóng ở từng mốc (AC-37.6), và suy lại là dựng nguồn thứ hai
 * cho một câu trả lời đã có.
 *
 * `oCuaNguoi` đến từ `oCuaNguoiTrenSan` của engine — **cùng** thứ tự mà
 * `coHocXuatPhat` dùng để đặt vị trí, nên "ô số 7 ở đâu" và "ô số 7 là ai"
 * không bao giờ là hai câu trả lời khác nhau.
 */
export function anhChupTuLo(
  lo: LoMoc,
  chiSo: number,
  oCuaNguoi: ReadonlyMap<string, number>,
): AnhChupMet | null {
  if (chiSo < 0 || chiSo >= lo.soMocDaGhi) return null
  const moc = docMoc(lo, chiSo)
  return {
    thucThe: moc.cacThucThe,
    oCuaNguoi,
    nguoiGiuBong: moc.nguoiGiu,
  }
}

/*
  ====================================================================
  TRỘN HAI MỐC — VÀ VÌ SAO CHỈ ĐƯỢC TRỘN THẲNG (T817).
  ====================================================================

  🐞 **Người dùng xem bản chạy ngày 2026-11-27 và nói trận "giật cục như chuỗi
  ảnh fps thấp".** Đo trên 300 khung liên tiếp: trình duyệt vẽ **59,2 fps**
  nhưng toạ độ cầu thủ chỉ đổi ở **151/299** nhịp — **29,9 fps** chuyển động,
  và khoảng cách giữa hai lần đổi là **1-1-1-3-4** khung. Một mốc rơi vào
  ~33 ms còn một khung là 16,7 ms, nên hình giữ 2 khung rồi 1 khung xen kẽ.
  Cái nhịp **không đều** ấy mới là thứ mắt đọc ra là "giật", chứ không phải
  con số 30.

  📍 Nguyên nhân: `mocVeTaiThoiDiem` trả **hai** số, và **cả hai** lớp vẽ chỉ
  lấy `chiSo` rồi vứt `phan` (`San2D.tsx:1784`, `San3D.tsx:174`).

  ⚠️ **CHỈ LERP THẲNG. Không Hermite, không smoothstep, không hàm dáng.**
  Đây không phải sở thích — `viTriVe.ts:88-96` đã **cố ý** tắt bảy lớp nội suy
  của chế độ cổ điển cho chế độ liên tục, với lý do ghi rõ: để `(x′−x)/dt`
  **trên hình** bằng đúng vận tốc engine, tức AC-38.1 đo trên hình khớp AC-38.1
  đo trong engine. Lerp thẳng giữ nguyên tính chất ấy — vận tốc dây cung bằng
  đúng vận tốc trung bình mà engine đã đi giữa hai mốc. Mọi phép trộn cong đều
  là **biến dạng thời gian** và sẽ phá nó.

  ⚠️ **Trộn Ở ĐÂY, trên ẢNH CHỤP — không trong `viTriVe.ts`.** `viTriMetLienTuc`
  là đường đọc duy nhất mà **cả hai** lớp vẽ đứng trên (D145/AC-46.5); đặt phép
  trộn vào đó làm đỏ ít nhất bảy `it` ở `viTriVe.test.ts` và
  `batBienSaBan.test.ts`, và những phép kiểm ấy thuộc các AC **đã đóng** mà
  **AC-49.8** bắt phải còn xanh. Trộn ở tầng ảnh chụp thì đường đọc không đổi
  một ký tự, và **cả 22 người lẫn quả bóng** cùng được trộn ở một chỗ duy nhất.

  📌 **Cả hai lớp vẽ phải gọi hàm này, không chỉ sa bàn.** `AC-46.5` mệnh đề
  hai nói lớp 3D "không dịch một cầu thủ nào vì bất kỳ lý do hiển thị nào" —
  làm mượt là một lý do hiển thị. Nếu chỉ sa bàn trộn thì hai góc nhìn vẽ cùng
  một người ở hai chỗ, và **không một phép kiểm nào đỏ** (repo không có
  `.test.tsx`, `vitest` chạy `environment: 'node'`). Xanh ở đó không có nghĩa
  là đạt — bài học đã trả giá bốn lần trong hai ngày.
*/

/** Nội suy thẳng một đại lượng. */
function tron(a: number, b: number, phan: number): number {
  return a + (b - a) * phan
}

/**
 * Ảnh chụp ở giữa hai mốc — **lerp thẳng**, và chỉ trên ba trục vị trí.
 *
 * `sau === null` (mốc cuối của lô) hoặc `phan <= 0` thì trả về **chính**
 * `truoc`, không ngoại suy: ngoại suy bằng `vx/vy` sẽ vẽ ra một vị trí **không
 * mốc nào từng nói**, và nó không tái lập được từ lô (AC-37.5).
 *
 * ⚠️ **Bốn thứ KHÔNG được trộn, mỗi thứ một lý do cụ thể:**
 * - `coMat` — trộn ra `0,5` thì lọt qua cổng `coMat === 0` của `viTriVe.ts`,
 *   và ô người vắng mặt nằm ở `(0,0)`: người vừa bị thay sẽ **trượt về góc
 *   sân**. Lấy của `truoc`, và nếu một trong hai mốc nói người ấy vắng thì
 *   **không trộn vị trí** của ô đó.
 * - `huong` — 0–360 quấn vòng; trộn thẳng `350°` với `10°` cho `180°`, tức
 *   người quay ngược hẳn lại giữa hai mốc.
 * - `vx/vy/vz` — một vận tốc trộn là con số không mốc nào từng phát, và
 *   `doCoHoc` đọc chính những cột ấy.
 * - `nguoiGiuBong` — AC-37.6 nói đó là một quyết định **rời rạc** của engine.
 */
export function tronAnhChup(
  truoc: AnhChupMet,
  sau: AnhChupMet | null,
  phan: number,
): AnhChupMet {
  if (sau === null || !(phan > 0)) return truoc
  const n = Math.min(truoc.thucThe.length, sau.thucThe.length)
  const thucThe = truoc.thucThe.map((t, i) => {
    if (i >= n) return t
    const s = sau.thucThe[i]!
    if (t.coMat !== 1 || s.coMat !== 1) return t
    return {
      ...t,
      x: tron(t.x, s.x, phan),
      y: tron(t.y, s.y, phan),
      z: tron(t.z, s.z, phan),
    }
  })
  return { ...truoc, thucThe }
}

/**
 * Ảnh chụp đã nội suy, dựng thẳng từ lô — chỗ **duy nhất** hai lớp vẽ gọi.
 *
 * Gói `anhChupTuLo` hai lần cộng `tronAnhChup` vào một hàm để hai lớp vẽ không
 * tự ghép lấy mỗi lớp một kiểu; `AC-46.5` đòi chúng vẽ cùng một con số.
 */
export function anhChupNoiSuy(
  lo: LoMoc,
  moc: MocVe,
  oCuaNguoi: ReadonlyMap<string, number>,
): AnhChupMet | null {
  const truoc = anhChupTuLo(lo, moc.chiSo, oCuaNguoi)
  if (truoc === null) return null
  if (!(moc.phan > 0)) return truoc
  return tronAnhChup(truoc, anhChupTuLo(lo, moc.chiSo + 1, oCuaNguoi), moc.phan)
}
