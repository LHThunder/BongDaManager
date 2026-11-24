import { DAI_SAN, type BenSan } from '../hinhHocSan'
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

/** Một người trên sân: chỗ đứng, vận tốc và **hướng mặt**. */
export interface TrangThaiCoHoc {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
  /**
   * Hướng mặt, **độ, trong [0; 360)** — AC-38.11.
   *
   * Đây là một trường của trạng thái chứ không phải thứ suy ra từ vận tốc,
   * vì người ta **chạy lùi và chạy ngang được**: lúc ấy hướng mặt và hướng
   * đi là hai thứ khác nhau, và chính khoảng lệch giữa chúng là thứ quyết
   * định trần tốc độ của AC-38.4.
   */
  readonly huong: number
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
  const vThoBan = quang === 0 ? 0 : tocDoMongMuon(quang, tran, dt)
  /*
    Trần theo HƯỚNG MẶT nằm ở đây, trong Ý ĐỊNH — không phải ở cuối (T712).

    Đặt nó sau phép kẹp gia tốc thì một người đang chạy 9 m/s mà bị phân loại là
    chạy lùi sẽ bị cắt thẳng về 4 m/s trong một bước, tức giảm tốc **8,95 m/s²**
    — vỡ AC-38.2, và phép kiểm 1.000 bộ đã bắt đúng con số ấy. Đặt ở ý định thì
    phép kẹp gia tốc quyết người ta tiến về trần ấy NHANH tới đâu, nên hai AC
    không còn đánh nhau.
  */
  const huongThu =
    quang === 0
      ? { x: 0, y: 0 }
      : { x: (dx / quang) * vThoBan, y: (dy / quang) * vThoBan }
  const vMuon = Math.min(
    vThoBan,
    tranTheoKieu(phanLoaiHuong(truoc.huong, huongThu.x, huongThu.y), tran),
  )
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

  // 5. Trần tốc độ tuyệt đối. Trần theo hướng mặt đã áp ở bước 1.
  const doCuoi = Math.hypot(vx, vy)
  if (doCuoi > tran && doCuoi > 0) {
    vx = (vx / doCuoi) * tran
    vy = (vy / doCuoi) * tran
  }

  // Tích phân Euler bằng vận tốc MỚI: (x' − x) / dt ≡ v'.
  return {
    x: truoc.x + vx * dt,
    y: truoc.y + vy * dt,
    vx,
    vy,
    huong: huongNguoiMocSau(truoc.huong, vx, vy, dt),
  }
}

/*
  ====================================================================
  TRẦN THEO HƯỚNG MẶT, VÀ HƯỚNG MẶT CÓ TRẦN QUAY (T712, AC-38.4 + AC-38.11).
  ====================================================================

  Hai AC này đi với nhau và **không tách ra được**: "chạy lùi" chỉ có nghĩa khi
  có một hướng mặt để so, nên trần 4 m/s của AC-38.4 đứng trên hướng mặt mà
  AC-38.11 đòi. Làm riêng một cái là làm nửa vời.
*/

/** Tốc độ tối đa khi **chạy lùi**, m/s — con số của AC-38.4. */
export const TOC_DO_LUI_TOI_DA = 4

/** Tốc độ tối đa khi **chạy ngang**, m/s — con số của AC-38.4. */
export const TOC_DO_NGANG_TOI_DA = 5

/**
 * Ranh giới "chạy tới" / "chạy ngang", độ lệch giữa hướng đi và hướng mặt.
 *
 * 60 và 120 chia vòng tròn thành ba phần đều. Ranh giới này là **lựa chọn
 * thiết kế**, không phải con số của AC: AC-38.4 nói trần của "lùi" và "ngang"
 * mà không định nghĩa chúng bắt đầu từ góc nào. Phép kiểm vì thế phải dùng
 * **chính** hàm phân loại này, nếu không nó đo một thứ khác với thứ engine kẹp.
 */
export const GOC_TIEN_TOI_DA = 60
export const GOC_NGANG_TOI_DA = 120

/**
 * Trần tốc độ quay **của thân người**, độ mỗi giây.
 *
 * Khác hẳn `TOC_QUAY_NHANH` — cái ấy là trần quay của **vector vận tốc** ở băng
 * nhanh. Chính khoảng chênh giữa hai trần là thứ sinh ra những mốc "chạy lùi" và
 * "chạy ngang" thật: khi vận tốc đổi chiều gấp ở tốc độ thấp (băng chậm quay tự
 * do), hướng mặt **không theo kịp**.
 *
 * ⚠️ **120 → 90 ngày 2026-11-24, và con số này quyết định một AC có mẫu hay
 * không.** Ở 120°/giây thì một bước 0,5 giây quay được 60°, nên sau một cú lật
 * vận tốc 180° độ lệch còn **đúng 120°** — tức ngưỡng "chạy ngang", và **không
 * mốc nào** bao giờ thành "chạy lùi". Trần lùi 4 m/s của AC-38.4 khi ấy xanh vì
 * **rỗng**. Ở 90°/giây thì một bước quay 45°, độ lệch còn 135° > 120° và mốc ấy
 * là "chạy lùi" thật. Một cú xoay người 180° mất 2 giây — đúng tầm người thật.
 */
export const GOC_QUAY_NGUOI = 90

/**
 * Dưới tốc độ này thì coi như đứng yên, và hướng mặt **giữ nguyên mốc trước**.
 *
 * ⚠️ Đây là chỗ chặn một **con số giả**. `atan2(0, 0)` trả về `0` trong
 * JavaScript, nên nếu suy hướng thẳng từ vận tốc thì **mọi người đứng im đều
 * nhìn về +x** — AC-38.11 vẫn "thoả" vì hướng nằm trong [0; 360), nhưng con số
 * ấy không mang tin gì. Một hàng phòng ngự đứng yên sẽ quay mặt cùng một phía
 * như trong ảnh chụp lỗi.
 */
export const NGUONG_DUNG_YEN = 0.1

/** Đưa một góc về [0; 360). */
export function chuanHoaGoc(goc: number): number {
  const g = goc % 360
  return g < 0 ? g + 360 : g
}

/** Ba kiểu di chuyển so với hướng mặt. */
export type KieuDiChuyen = 'tien' | 'ngang' | 'lui'

/**
 * Người ấy đang chạy tới, chạy ngang hay chạy lùi, so với hướng mặt.
 *
 * Đứng yên thì coi như **chạy tới**: không có hướng đi để lệch, và trần của
 * "tới" là trần rộng nhất nên nó không kẹp nhầm ai.
 */
export function phanLoaiHuong(
  huongNguoi: number,
  vx: number,
  vy: number,
): KieuDiChuyen {
  if (Math.hypot(vx, vy) < NGUONG_DUNG_YEN) return 'tien'
  const r = chuanHoaGoc(huongNguoi) / DO_MOI_RADIAN
  const lech = gocGiua(Math.cos(r), Math.sin(r), vx, vy)
  if (lech <= GOC_TIEN_TOI_DA) return 'tien'
  if (lech <= GOC_NGANG_TOI_DA) return 'ngang'
  return 'lui'
}

/** Trần tốc độ theo kiểu di chuyển (AC-38.4). */
export function tranTheoKieu(kieu: KieuDiChuyen, tranCuaNguoi: number): number {
  if (kieu === 'lui') return Math.min(tranCuaNguoi, TOC_DO_LUI_TOI_DA)
  if (kieu === 'ngang') return Math.min(tranCuaNguoi, TOC_DO_NGANG_TOI_DA)
  return tranCuaNguoi
}

/**
 * Độ lệch tối đa cho phép giữa hướng mặt và hướng đi, theo **tốc độ**.
 *
 * ⚠️ Đây là một **ràng buộc của việc chạy**, không phải một cú quay tự nguyện,
 * nên nó KHÁC `GOC_QUAY_NGUOI` và được phép vượt trần quay ấy. Lý lẽ: một người
 * thật **không sải 9 m/s trong khi mặt quay ngang** — thân người bị chính cú
 * chạy kéo về phía trước. Trần quay nói "xoay người nhanh nhất được bao nhiêu";
 * hàm này nói "ở tốc độ ấy thì mặt KHÔNG THỂ lệch hơn bấy nhiêu".
 *
 * Ba mức khớp đúng ba trần của AC-38.4, nên không mốc nào vượt được:
 *
 *     |v| > 5 m/s  →  lệch ≤ 60°   →  luôn là "chạy tới"
 *     |v| > 4 m/s  →  lệch ≤ 120°  →  cùng lắm "chạy ngang" (trần 5)
 *     |v| ≤ 4 m/s  →  tự do        →  cùng lắm "chạy lùi" (trần 4)
 */
export function lechToiDaTheoTocDo(toc: number): number {
  if (toc > TOC_DO_NGANG_TOI_DA) return GOC_TIEN_TOI_DA
  if (toc > TOC_DO_LUI_TOI_DA) return GOC_NGANG_TOI_DA
  return 180
}

/**
 * Hướng mặt ở mốc sau: quay về phía đang đi, nhưng không quá trần quay.
 *
 * Đứng yên thì **giữ nguyên** hướng cũ — xem `NGUONG_DUNG_YEN` để biết vì sao
 * đó không phải một phép lười mà là chỗ chặn một con số giả.
 */
export function huongNguoiMocSau(
  huongCu: number,
  vx: number,
  vy: number,
  dt: number,
): number {
  const cu = chuanHoaGoc(huongCu)
  if (Math.hypot(vx, vy) < NGUONG_DUNG_YEN) return cu

  const dich = chuanHoaGoc(Math.atan2(vy, vx) * DO_MOI_RADIAN)
  // Chênh lệch ngắn nhất, trong (-180; 180].
  let lech = ((dich - cu + 540) % 360) - 180
  const toiDa = GOC_QUAY_NGUOI * dt
  if (lech > toiDa) lech = toiDa
  if (lech < -toiDa) lech = -toiDa

  /*
    ⚠️ ĐỘ LỆCH CÒN LẠI BỊ KẸP THEO TỐC ĐỘ — và đây là chỗ làm AC-38.4 đúng
    **bằng cấu trúc** thay vì đúng gần đúng.

    Một người thật **không sải 9 m/s trong khi mặt quay ngang**. Bản đầu cho
    hướng mặt lệch tự do, nên một mốc chạy 5,544 m/s vẫn bị phân loại là "chạy
    ngang" và vỡ trần 5 m/s — phép kiểm 40.000 mốc quỹ đạo của T715 bắt đúng
    con số ấy. Kẹp lệch theo tốc độ thì:

      |v| > 5 m/s  →  lệch ≤ 60°   →  luôn là "chạy tới"
      |v| > 4 m/s  →  lệch ≤ 120°  →  cùng lắm là "chạy ngang" (trần 5)
      |v| ≤ 4 m/s  →  tự do        →  cùng lắm là "chạy lùi" (trần 4)

    Ba dòng ấy khớp đúng ba trần của AC-38.4, nên không một mốc nào vượt được.
  */
  const lechToiDa = lechToiDaTheoTocDo(Math.hypot(vx, vy))
  const sau = chuanHoaGoc(cu + lech)
  const conLech = ((dich - sau + 540) % 360) - 180
  if (Math.abs(conLech) <= lechToiDa) return sau
  return chuanHoaGoc(dich - Math.sign(conLech) * lechToiDa)
}

/*
  ====================================================================
  ĐI VÒNG QUA NGƯỜI, VÀ TÁCH HAI NGƯỜI CHỒNG NHAU (T713).
  ====================================================================

  Đây là chỗ **trả món nợ AC-34.2 của spec 006** — mệnh đề "người rê bóng phải
  ĐI VÒNG qua điểm của đối thủ nằm trên đường đi, không đi xuyên qua". Spec 006
  đóng mà chưa làm: Phase 50 bị bỏ ngày 2026-11-19 vì lát ấy dựng việc đi vòng
  bằng cách **lách điểm ở tầng giao diện**, trong khi engine liên tục có toạ độ
  mét nên nó là **hệ quả tự nhiên của cơ học**, không phải một mẹo vẽ.

  Hai hàm, hai việc khác nhau, và cần cả hai:

  - `tranhNguoi` sửa **ý định**: dời đích sang một bên để đường đi vòng qua người
    cản. Nó là thứ làm chuyển động **trông có chủ ý**.
  - `tachChen` sửa **kết quả**: đẩy rời hai ai đã ở quá gần nhau. Nó là lưới cuối,
    vì hai người cùng nhắm một quả bóng vẫn dồn vào một chỗ dù cả hai đều đang
    tránh nhau.

  ⚠️ **Hai tầng đụng nhau ở đây, và T713 KHÔNG tự xử.** 2,0 m ở engine bằng
  **1,73 đơn vị** khung sân 11, trong khi `san2D.test.ts` đòi `≥ 1,46 bán kính`
  (**3,80 đơn vị**) và một sàn **4 đơn vị tuyệt đối**. Hai người tranh chấp cách
  nhau 2,0 m **không đạt cả hai ngưỡng** ấy. Plan đã biết (R58) và chọn đường
  "phát biểu lại bất biến theo **chữ** của AC-15.2, chỉ cho chế độ liên tục", và
  người dùng chốt **giữ bán kính 2,6** ngày 2026-11-23. T713 để lại chỗ mốc cho
  **T754** và **không sửa** hai con số ấy.
*/

/**
 * Khoảng cách tối thiểu giữa hai thực thể trên sân, **mét**.
 *
 * Hai người thật không đứng chồng lên nhau; 2,0 m là bề ngang hai thân người
 * cộng một khoảng thở. Đây cũng là bán kính mà `tranhNguoi` dùng để quyết một
 * người có **cản đường** hay không.
 */
export const BAN_KINH_TRANH = 2.0

/** Số vòng đẩy tối đa của `tachChen`. */
const SO_VONG_TACH = 24

/**
 * Lề đẩy thêm, mét — **1 mm**.
 *
 * ⚠️ Không có nó thì phép tách hội tụ **từ DƯỚI** và không bao giờ chạm ngưỡng:
 * đẩy cặp này ra đúng 2,0 m rồi cặp bên cạnh xô lại một chút, nên vòng sau còn
 * 1,9999992779 — đo được trên cảnh 26 thực thể dồn trong 25 × 20 m. Đẩy quá
 * ngưỡng một lề nhỏ làm trạng thái cuối nằm **hẳn** bên trên, và 1 mm thì không
 * ai nhìn thấy trên sân.
 */
const LE_TACH = 0.001

/** Một điểm trên sân, đủ cho hai hàm dưới đây. */
export interface Diem {
  readonly x: number
  readonly y: number
}

/**
 * Hướng đẩy khi hai thực thể **trùng khít**.
 *
 * ⚠️ Đây là chỗ một phép tách ngây thơ chia cho không. Khi hai điểm cách nhau
 * đúng 0, vector nối chúng **không có hướng**, nên không có chiều nào để đẩy.
 * Lấy hướng theo **chỉ số** của hai thực thể cho ba thứ cùng lúc: luôn có một
 * hướng, hai người khác nhau ra hai hướng khác nhau, và nó **tất định** — chạy
 * lại cùng một bộ ra cùng một kết quả, đúng điều P1 đòi.
 */
function huongGoTrung(chiSo: number): Diem {
  const goc = ((chiSo * 137.508) % 360) / DO_MOI_RADIAN
  return { x: Math.cos(goc), y: Math.sin(goc) }
}

/**
 * Đẩy rời mọi cặp thực thể đang ở gần nhau hơn `BAN_KINH_TRANH`.
 *
 * Mỗi vòng đẩy **cả hai** phía, mỗi phía một nửa khoảng thiếu, nên không ai bị
 * thiên vị và tổng động lượng của phép sửa bằng không. Lặp tối đa `SO_VONG_TACH`
 * vòng vì đẩy cặp này ra có thể làm cặp khác chạm nhau.
 *
 * Trả về **mảng mới**; đầu vào không bị sửa.
 */
export function tachChen(cac: readonly Diem[]): readonly Diem[] {
  const x = cac.map((d) => d.x)
  const y = cac.map((d) => d.y)

  for (let vong = 0; vong < SO_VONG_TACH; vong += 1) {
    let conChen = false
    for (let i = 0; i < cac.length; i += 1) {
      for (let j = i + 1; j < cac.length; j += 1) {
        const dx = x[j]! - x[i]!
        const dy = y[j]! - y[i]!
        const d = Math.hypot(dx, dy)
        if (d >= BAN_KINH_TRANH) continue
        conChen = true

        // Trùng khít thì không có hướng để đẩy — lấy hướng theo chỉ số.
        const huong =
          d === 0
            ? huongGoTrung(i * 31 + j)
            : { x: dx / d, y: dy / d }
        const nua = (BAN_KINH_TRANH + LE_TACH - d) / 2
        x[i] = x[i]! - huong.x * nua
        y[i] = y[i]! - huong.y * nua
        x[j] = x[j]! + huong.x * nua
        y[j] = y[j]! + huong.y * nua
      }
    }
    if (!conChen) break
  }

  return cac.map((_, i) => ({ x: x[i]!, y: y[i]! }))
}

/**
 * Đích đã dời để đường đi **vòng qua** người cản, thay vì xuyên qua anh ta.
 *
 * Chọn người cản **gần nhất** nằm giữa ta và đích, có khoảng cách vuông góc tới
 * đường đi nhỏ hơn `BAN_KINH_TRANH`. Dời đích sang bên **đối diện** với anh ta,
 * một đoạn đúng bằng bán kính tránh.
 *
 * Không ai cản thì trả về **chính cái đích cũ** — hàm này không được tự ý bẻ
 * đường khi đường đang thông.
 */
export function tranhNguoi(
  tu: Diem,
  dich: Diem,
  canTranh: readonly Diem[],
): Diem {
  const dx = dich.x - tu.x
  const dy = dich.y - tu.y
  const dai = Math.hypot(dx, dy)
  if (dai === 0) return dich

  const ux = dx / dai
  const uy = dy / dai

  let gan: { t: number; lech: number } | null = null
  for (const ai of canTranh) {
    const rx = ai.x - tu.x
    const ry = ai.y - tu.y
    // Chiếu lên đường đi: `t` là quãng dọc đường, `lech` là khoảng vuông góc.
    const t = rx * ux + ry * uy
    if (t <= 0 || t >= dai) continue
    const lech = rx * -uy + ry * ux
    if (Math.abs(lech) >= BAN_KINH_TRANH) continue
    if (!gan || t < gan.t) gan = { t, lech }
  }

  if (!gan) return dich

  /*
    Dời sang phía ĐỐI DIỆN người cản. `lech === 0` là trường hợp anh ta đứng
    đúng trên đường — lúc ấy hai bên đều được, nên chọn một bên cố định để phép
    tính vẫn tất định (P1).
  */
  const ben = gan.lech > 0 ? -1 : 1
  return {
    x: dich.x + -uy * ben * BAN_KINH_TRANH,
    y: dich.y + ux * ben * BAN_KINH_TRANH,
  }
}

/**
 * Một phần ba sân nhà của thủ môn, theo **mét** — AC-30.7 của spec 005.
 *
 * Dùng hằng số sân của `hinhHocSan.ts` (T703) chứ không viết lại 105 ở đây:
 * viết lại là dựng nguồn sự thật thứ hai cho kích thước sân.
 */
export const MOT_PHAN_BA_SAN = DAI_SAN / 3

/**
 * Kẹp **ĐÍCH** của thủ môn vào một phần ba sân của anh ta (T714).
 *
 * ⚠️ Kẹp ĐÍCH, không kẹp vị trí. Hai thứ khác nhau, và chỗ khác nhau ấy là cả
 * lý do hàm này nằm ở engine chứ không ở lớp vẽ:
 *
 * - Kẹp **vị trí** nghĩa là để thủ môn chạy ra giữa sân rồi **giật** anh ta về,
 *   tức một bước dịch không qua phép kẹp gia tốc — vỡ AC-38.2, và trên hình thì
 *   trông như teleport.
 * - Kẹp **đích** nghĩa là anh ta **không bao giờ nhắm** ra khỏi dải, nên cơ học
 *   tự lo phần còn lại và mọi trần vận tốc còn nguyên.
 *
 * Spec 006 từng kẹp ở lớp vẽ (T622) vì lúc ấy chưa có toạ độ mét; bộ kiểm chạy
 * ở `environment: node` không nhìn tới lớp ấy, nên 1.291 phép kiểm xanh trong
 * khi thủ môn chạy tới giữa sân. Ở đây thì phép kiểm với tới được.
 */
export function kepDichThuMon(dich: Dich, ben: BenSan): Dich {
  const tu = ben === 'nha' ? 0 : DAI_SAN - MOT_PHAN_BA_SAN
  const den = ben === 'nha' ? MOT_PHAN_BA_SAN : DAI_SAN
  return { x: Math.min(Math.max(dich.x, tu), den), y: dich.y }
}
