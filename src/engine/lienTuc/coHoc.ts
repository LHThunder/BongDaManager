/*
  Cơ học của một cơ thể người (T710, quyết định D123 và D129).

  Module này trả lời đúng một câu ở lát đầu tiên: **một cầu thủ chạy nhanh nhất
  được bao nhiêu**. Các lát sau của Phase 54 thêm kẹp gia tốc, cổng quay và
  tích phân Euler vào cùng file này.

  ⚠️ HÀM DƯỚI ĐÂY KHÔNG ĐỌC SỨC BỀN CỦA CẦU THỦ, VÀ ĐÓ LÀ CHỦ Ý.

  Phương án bị loại ở D129 là `tranRieng = (6,5 + …) × heSo(sucBen)`, cho sàn
  tụt về 3,87 m/s khi một người đã cạn. Hai lý do loại, cả hai đo được:

  - Nó nhập **sức bền × tốc độ** vào một hàm, mà việc ấy là yêu cầu của
    **spec 009**, không phải spec này. Trộn sớm thì spec 009 phải gỡ ra.
  - Sàn 3,87 m/s nằm **dưới** ngưỡng 6 m/s mà **AC-38.8** canh, nên cuối trận
    có thể **không còn mẫu nào** rơi vào vùng AC ấy đo — một AC xanh vì rỗng.
    Sàn 6,4 > 6 bảo đảm **mọi** cầu thủ đều vào được vùng ấy.

  Điều kiện ra của T710 vì thế là một phép grep: file này không được chứa một
  đường nào đọc chỉ số sức bền.
*/

/**
 * Tốc độ tối đa của cầu thủ yếu nhất (chỉ số 1), tính bằng **m/s**.
 *
 * Chọn **6,4** chứ không thấp hơn vì **AC-38.8** chỉ ràng những pha trên
 * **6 m/s**: sàn phải nằm trên ngưỡng ấy thì mọi cầu thủ mới có mặt trong tập
 * mà AC đó đo.
 */
export const TOC_DO_TOI_DA_THAP = 6.4

/**
 * Tốc độ tối đa của cầu thủ nhanh nhất (chỉ số 20), tính bằng **m/s**.
 *
 * Chọn **8,6** chứ không phải 9,0 để chừa lề **4,4%** dưới trần tuyệt đối.
 * Phép kiểm cơ học đo tốc độ bằng `Δquãng / Δt` trên tệp xuất, nên ghim sát
 * trần sẽ làm nó đỏ vì **làm tròn** chứ không vì mô hình sai — nhất là khi
 * lưới mốc dày lên 0,5 giây.
 */
export const TOC_DO_TOI_DA_CAO = 8.6

/**
 * Trần tốc độ tuyệt đối của **AC-38.1**, tính bằng m/s.
 *
 * ⚠️ Đây là **chỗ duy nhất** con số 9 của AC-38.1 tồn tại trong mã nguồn. Mọi
 * phép kẹp và mọi phép kiểm phải đọc hằng số này; viết lại số 9 ở chỗ khác là
 * dựng nguồn sự thật thứ hai, và hai nguồn ấy sẽ lệch nhau ở lần sửa sau.
 */
export const TRAN_TOC_DO_TUYET_DOI = 9

/** Chỉ số cầu thủ chạy từ 1 tới 20; chỉ số chưa điền coi như trung bình. */
const CHI_SO_MIN = 1
const CHI_SO_MAX = 20
const CHI_SO_MAC_DINH = 10

/**
 * Tốc độ tối đa của một cầu thủ theo **chỉ số Tốc độ** của anh ta, bằng m/s.
 *
 * Nội suy tuyến tính từ `TOC_DO_TOI_DA_THAP` ở chỉ số 1 tới
 * `TOC_DO_TOI_DA_CAO` ở chỉ số 20. Chỉ số ngoài dải bị kẹp vào dải; chỉ số
 * chưa điền coi như **10**, cho **7,442 m/s**.
 *
 * Nhận `number | undefined` chứ không nhận hồ sơ cầu thủ: lấy chỉ số từ hồ sơ
 * cần một hàm còn **chưa được export** ở lớp sức mạnh, và export nó chỉ để
 * dùng ở đây là kéo theo một ràng buộc không cần thiết. Khuôn tham số này đã
 * có tiền lệ trong repo nên nó không mở ra hình dạng mới nào.
 *
 * Chỉ số chưa điền là **đường lui an toàn**, không phải trường hợp thường gặp:
 * một cầu thủ thiếu chỉ số đã bị AC-5.7 chặn khỏi đội hình từ trước.
 */
export function tocDoToiDa(chiSoTocDo: number | undefined): number {
  const chiSo = chiSoTocDo ?? CHI_SO_MAC_DINH
  const tiLe =
    (Math.min(Math.max(chiSo, CHI_SO_MIN), CHI_SO_MAX) - CHI_SO_MIN) /
    (CHI_SO_MAX - CHI_SO_MIN)
  return TOC_DO_TOI_DA_THAP + tiLe * (TOC_DO_TOI_DA_CAO - TOC_DO_TOI_DA_THAP)
}

/*
  ====================================================================
  KẸP VECTOR, CỔNG QUAY BA BĂNG, VÀ TÍCH PHÂN EULER (T711, D123).
  ====================================================================

  Nguyên tắc của D123: **chặn bằng cấu trúc, ở tầng ý định**. `buocCoHoc`
  kẹp gia tốc, góc quay và tốc độ **trước** khi tích phân, nên AC-38.2 và
  AC-38.3 đúng vì không có đường nào vi phạm được — chứ không phải vì một
  phép kiểm đi tìm hằng số rồi sửa khi đỏ.

  Phương án bị loại: để engine tự do rồi ĐO bằng phép kiểm. Nó biến tám AC
  cơ học thành tám cuộc đi tìm hằng số, và mỗi lần engine đổi thì đo lại —
  đúng cái giá spec 006 đã trả ba lần.

  Tích phân **Euler tiến với vận tốc MỚI**: `x' = x + v' · dt`. Nhờ vậy
  `(x' − x) / dt ≡ v'` đúng tuyệt đối, nên phép kiểm đo tốc độ trên tệp
  xuất bằng Δquãng/Δt đọc ra **đúng** con số engine đã kẹp, không lệch một
  phần nghìn nào.
*/

/**
 * Gia tốc tối đa, m/s². **AC-38.2 cho 6; ở đây 5,2.**
 *
 * Lề 13,3% là cố ý. Phép kiểm cơ học đo gia tốc bằng hiệu hai tốc độ, mà mỗi
 * tốc độ lại đo bằng Δquãng/Δt — hai lần làm tròn chồng lên nhau. Ghim đúng 6
 * thì phép kiểm đỏ vì **làm tròn** chứ không vì mô hình sai.
 */
export const GIA_TOC_TOI_DA = 5.2

/** Giảm tốc tối đa, m/s². **AC-38.2 cho 8; ở đây 7,2**, cùng lý lẽ lề. */
export const GIAM_TOC_TOI_DA = 7.2

/** Dưới tốc độ này, người ta xoay người tự do — kể cả quay ngoắt 180°. */
export const NGUONG_BANG_CHAM = 3.0

/** Trên tốc độ này, góc quay bị trần `TOC_QUAY_NHANH` mỗi giây. */
export const NGUONG_BANG_NHANH = 6.0

/** Góc quay tối đa một bước ở băng giữa, độ. Dưới 90° **theo cấu trúc**. */
export const GOC_QUAY_BANG_GIUA = 85

/** Trần tốc độ quay ở băng nhanh, **độ mỗi giây**. */
export const TOC_QUAY_NHANH = 30

/** Quay quá góc này thì mất tốc độ — AC-38.3 vế (ii) đo từ 45°. */
export const GOC_BAT_DAU_GIAM = 45

/**
 * Tốc độ còn lại sau một cú quay > `GOC_BAT_DAU_GIAM`, tính theo tốc độ
 * **TRƯỚC** cú quay.
 *
 * ⚠️ Hai điều dễ làm sai ở hằng số này, và cả hai đều làm AC-38.3 vế (ii) vỡ.
 *
 * **Một — phải so với tốc độ TRƯỚC, không phải tốc độ vừa tính.** AC-38.3 vế
 * (ii) nói "quay 45–90° thì tốc độ **sau** ≤ 60% tốc độ **trước**". Nếu nhân
 * 0,57 vào tốc độ vừa tăng thì một người đang chạy 1 m/s tăng lên 3,6 rồi quay
 * 60° sẽ còn 2,05 m/s — **gấp ba** tốc độ trước, và vế (ii) vỡ dù hệ số trông
 * vẫn là 0,57.
 *
 * **Hai — phải áp ở CẢ BA băng.** Bản đầu của D123 chỉ áp nó ở băng giữa
 * (3,0–6,0 m/s), nên một cú quay 60° ở **2,9 m/s giữ 100% tốc độ** và vế (ii)
 * không dựng nổi. `/analyze` bắt được chỗ này ngày 2026-11-23.
 *
 * 0,57 chứ không 0,60: lề 5% dưới ngưỡng AC, cùng lý lẽ với hai hằng số gia tốc.
 */
export const HE_SO_SAU_QUAY = 0.57

/** Một người trên sân: chỗ đứng và vận tốc, tất cả bằng mét và m/s. */
export interface TrangThaiCoHoc {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
}

/** Một điểm đích bằng mét. */
export interface Dich {
  readonly x: number
  readonly y: number
}

const DO_MOI_RADIAN = 180 / Math.PI

/** Góc giữa hai vector, tính bằng **độ**, luôn trong [0; 180]. */
export function gocGiua(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const doA = Math.hypot(ax, ay)
  const doB = Math.hypot(bx, by)
  // Vector không có hướng thì không có góc để nói — coi như không quay.
  if (doA === 0 || doB === 0) return 0
  const cos = (ax * bx + ay * by) / (doA * doB)
  return Math.acos(Math.min(1, Math.max(-1, cos))) * DO_MOI_RADIAN
}

/**
 * Góc quay tối đa cho phép ở một bước, theo **tốc độ TRƯỚC bước đó** (D123).
 *
 * Ba băng, và băng chậm **cố ý tự do**. Nếu kẹp góc ở mọi tốc độ thì với gia
 * tốc pháp tuyến thuần, góc quay một bước là `atan(aN·dt/|v|)` — luôn dưới 90°
 * với mọi `v > 0`. Khi ấy **AC-38.3 vế (i) xanh vô nghĩa**: không một mốc nào
 * trong trận thử tới nó. Cho quay tự do dưới 3,0 m/s làm những cú quay > 90°
 * **xảy ra thật và quan sát được**, mà vẫn khẳng định được mốc trước luôn dưới
 * 3,0 m/s — đúng điều vế (i) phát biểu.
 */
export function gocQuayToiDa(tocDoTruoc: number, dt: number): number {
  if (tocDoTruoc < NGUONG_BANG_CHAM) return 180
  if (tocDoTruoc <= NGUONG_BANG_NHANH) return GOC_QUAY_BANG_GIUA
  return TOC_QUAY_NHANH * dt
}

/** Xoay một vector đi `goc` độ, chiều dương là ngược kim đồng hồ. */
function xoay(x: number, y: number, goc: number) {
  const r = goc / DO_MOI_RADIAN
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) }
}

/**
 * Tốc độ mong muốn khi còn cách đích `quang` mét.
 *
 * Có **phanh**, không chỉ có ga: `sqrt(2 · a · d)` là tốc độ lớn nhất mà từ đó
 * còn kịp dừng đúng ở đích với giảm tốc `GIAM_TOC_TOI_DA`. Không có nó thì người
 * ta lao qua đích rồi quay lại và dao động quanh nó mãi.
 *
 * ⚠️ Nhưng `sqrt(2ad)` là công thức của thời gian **liên tục**, và một mình nó
 * KHÔNG đủ. Phép kiểm chống tầm thường của T711 bắt được: với `dt = 0,5` thì ở
 * mọi khoảng cách **dưới 3,6 m**, một bước đi được `v · dt` vẫn dài hơn quãng còn
 * lại — đo được **11 bước nằm quá đích** trước khi thêm vế thứ hai. Vế `quang/dt`
 * là dạng **rời rạc** của chính ý ấy: một bước không bao giờ được dài hơn quãng
 * còn lại.
 */
function tocDoMongMuon(
  quang: number,
  tranCuaNguoi: number,
  dt: number,
): number {
  /*
    Nghiệm RỜI RẠC của bài toán phanh, không phải nghiệm liên tục.

    `sqrt(2ad)` trả lời câu "đi nhanh nhất bao nhiêu mà còn kịp dừng" khi hãm
    được **tức thì và liên tục**. Ở đây hãm bị kẹp `a · dt` mỗi bước, nên tốc độ
    cho phép là nghiệm dương của `v² + 2·a·dt·v − 2·a·d = 0` — tức đi một bước
    nữa rồi vẫn còn đủ quãng để dừng.
  */
  const aDt = GIAM_TOC_TOI_DA * dt
  const vPhanh = -aDt + Math.sqrt(aDt * aDt + 2 * GIAM_TOC_TOI_DA * quang)
  return Math.min(tranCuaNguoi, vPhanh, quang / dt)
}

/**
 * Một bước cơ học: từ trạng thái trước, nhắm tới `dich`, ra trạng thái sau.
 *
 * Thứ tự năm phép kẹp là **có nghĩa**, đổi thứ tự là đổi hành vi:
 *
 * 1. **Ý định** — vận tốc mong muốn hướng về đích, đã có phanh.
 * 2. **Kẹp gia tốc** — `|Δv| ≤ a · dt`, với `a` là gia tốc hay giảm tốc tuỳ
 *    người ấy đang nhanh lên hay chậm đi.
 * 3. **Cổng quay** — nếu góc đổi vượt trần của băng thì xoay về đúng trần.
 * 4. **Mất tốc sau cú quay** — quay > 45° thì tốc độ sau ≤ 0,57 lần tốc độ
 *    **trước**.
 * 5. **Trần tốc độ** — không ai vượt trần của chính mình, và không ai vượt
 *    `TRAN_TOC_DO_TUYET_DOI`.
 *
 * Rồi mới tích phân Euler **bằng vận tốc mới**.
 */
export function buocCoHoc(
  truoc: TrangThaiCoHoc,
  dich: Dich,
  tranCuaNguoi: number,
  dt: number,
): TrangThaiCoHoc {
  const tran = Math.min(tranCuaNguoi, TRAN_TOC_DO_TUYET_DOI)
  const tocDoTruoc = Math.hypot(truoc.vx, truoc.vy)

  // 1. Ý định.
  const dx = dich.x - truoc.x
  const dy = dich.y - truoc.y
  const quang = Math.hypot(dx, dy)
  const vMuon = quang === 0 ? 0 : tocDoMongMuon(quang, tran, dt)
  const muonX = quang === 0 ? 0 : (dx / quang) * vMuon
  const muonY = quang === 0 ? 0 : (dy / quang) * vMuon

  // 2. Kẹp gia tốc, theo chiều đang nhanh lên hay chậm đi.
  const aToiDa = vMuon >= tocDoTruoc ? GIA_TOC_TOI_DA : GIAM_TOC_TOI_DA
  let dvx = muonX - truoc.vx
  let dvy = muonY - truoc.vy
  const doDv = Math.hypot(dvx, dvy)
  const dvToiDa = aToiDa * dt
  if (doDv > dvToiDa && doDv > 0) {
    dvx = (dvx / doDv) * dvToiDa
    dvy = (dvy / doDv) * dvToiDa
  }
  let vx = truoc.vx + dvx
  let vy = truoc.vy + dvy

  // 3. Cổng quay ba băng.
  let gocDoi = gocGiua(truoc.vx, truoc.vy, vx, vy)
  const gocToiDa = gocQuayToiDa(tocDoTruoc, dt)
  if (gocDoi > gocToiDa && tocDoTruoc > 0) {
    /*
      Xoay vector MỚI về đúng trần, giữ nguyên độ lớn của nó. Chiều xoay lấy
      theo dấu của tích có hướng, để xoay về phía gần vector cũ hơn.
    */
    const chieu = truoc.vx * vy - truoc.vy * vx >= 0 ? 1 : -1
    const xoayVe = xoay(truoc.vx, truoc.vy, chieu * gocToiDa)
    const doMoi = Math.hypot(vx, vy)
    const doCu = Math.hypot(xoayVe.x, xoayVe.y)
    vx = (xoayVe.x / doCu) * doMoi
    vy = (xoayVe.y / doCu) * doMoi
    gocDoi = gocToiDa
  }

  // 4. Mất tốc sau cú quay — so với tốc độ TRƯỚC.
  if (gocDoi > GOC_BAT_DAU_GIAM && tocDoTruoc > 0) {
    const tranSauQuay = HE_SO_SAU_QUAY * tocDoTruoc
    const doHienTai = Math.hypot(vx, vy)
    if (doHienTai > tranSauQuay) {
      vx = (vx / doHienTai) * tranSauQuay
      vy = (vy / doHienTai) * tranSauQuay
    }
  }

  // 5. Trần tốc độ.
  const doCuoi = Math.hypot(vx, vy)
  if (doCuoi > tran && doCuoi > 0) {
    vx = (vx / doCuoi) * tran
    vy = (vy / doCuoi) * tran
  }

  // Tích phân Euler bằng vận tốc MỚI: (x' − x) / dt ≡ v'.
  return { x: truoc.x + vx * dt, y: truoc.y + vy * dt, vx, vy }
}
