import {
  BAN_KINH_VONG_GIUA,
  CHAM_PHAT_DEN,
  DAI_SAN,
  RONG_SAN,
  RONG_VONG_CAM,
  SAU_VONG_CAM,
  TAM_X,
  TAM_Y,
  Y_COT_GAN,
  Y_COT_XA,
} from '../engine/hinhHocSan'
import { CHI_SO_BONG } from '../engine/lienTuc/moc'
import type { KhungAnh, ToaDoVe } from './quyDoiMet'
import type { AnhChupMet } from './viTriVe'

/*
  Phép chiếu sa bàn: mét ba chiều của engine → đơn vị viewBox (T764, quyết định
  D131 và D144 của spec 011).

  MỘT camera trực giao duy nhất, yaw 0, không quay, không zoom. Nhờ thế phép
  chiếu là một phép biến đổi AFFINE, nên nó viết tay được trên chính lớp SVG
  đang có và không cần một thư viện 3D nào (D132). Đây là điều khuôn mẫu
  `design/gdd/diorama-3d.md` của my-game đặt ra, và là lý do spec 011 không
  thêm một phụ thuộc nào.

  Hệ toạ độ engine: gốc GÓC DƯỚI TRÁI của mặt sân, `x` dọc chiều dài 105 m,
  `y` ngang chiều rộng 68 m, `z` lên khỏi mặt cỏ. `y = 0 m` là biên GẦN người
  xem, `y = 68 m` là biên XA.

  ⚠️ CHIỀU SÂU theo `sin`, ĐỘ CAO theo `cos`. Lẫn hai hàm này là rủi ro R60 —
  rủi ro cao nhất của spec 011, và nó có thật: lúc làm rõ spec, chính con số
  "chiều sâu chiếm 64% chiều cao ảnh" đã bị tính bằng `cos` và phải sửa công
  khai (77%, không phải 64%). Hình sai kiểu này vẫn vẽ ra và vẫn trông như một
  sa bàn, nên `chieuSaBan.test.ts` có phép kiểm chốt riêng cho `sin` vs `cos`.

  Vì sao `sin` cho chiều sâu: GOC_SA_BAN là góc giữa hướng nhìn và MẶT SÂN, nên
  90° là nhìn thẳng xuống. Ở 90° phải thấy trọn chiều sâu (`sin 90° = 1`) và
  không thấy chút độ cao nào (`cos 90° = 0`) — đúng là sân 2D hiện có. Ở 0° là
  nhìn ngang tầm mắt: chiều sâu dẹt về 0, độ cao thấy trọn.
*/

/**
 * Góc giữa hướng nhìn và mặt sân, tính bằng độ. 90° là nhìn thẳng xuống.
 *
 * Người dùng chốt **50°** ngày 2026-11-25, sau khi được đo cho xem rằng ở tỉ lệ
 * thật độ cao của bóng gần như vô hình. Ở 50° thì mặt cỏ chiếm 49,0 trong 64
 * đơn vị chiều cao ảnh (77%), còn dư chỗ cho quả bóng bay lên.
 */
export const GOC_SA_BAN = 50

/**
 * Hệ số phóng đại độ cao. Người dùng chốt **×3** cùng ngày.
 *
 * Ở tỉ lệ thật (`×1`), `z = 1 m` nhấc quả bóng lên 0,19–0,42 lần bán kính của
 * chính nó — mắt không thấy; và `z = 5,26 m`, giá trị lớn nhất trong cả engine,
 * chỉ được 1,0–2,2 lần. Với `×3`: `z = 1 m` cho **1,07 lần** bán kính bóng, và
 * `z = 5,26 m` cho **9,5 đơn vị**, tức 14,9% chiều cao ảnh.
 *
 * Đây là con số DUY NHẤT trong dự án cố ý nói sai sự thật về hình học, nên nó
 * phải có nhãn song ngữ nói rõ độ cao đã được phóng đại (AC-46.6).
 */
export const HE_SO_CAO = 3

const RAD = (GOC_SA_BAN * Math.PI) / 180

/** Hệ số dẹt chiều sâu. `sin`, không phải `cos` — xem R60 ở đầu file. */
const SIN_SA_BAN = Math.sin(RAD)

/** Hệ số dựng độ cao. `cos`, không phải `sin` — xem R60 ở đầu file. */
const COS_SA_BAN = Math.cos(RAD)

/**
 * Bao nhiêu đơn vị ảnh cho một mét, dùng cho **cả ba trục** (đẳng hướng).
 *
 * ⚠️ **KHÔNG phải `tiLeMet` của `quyDoiMet.ts`** — quyết định **D144**, người
 * dùng chốt ngày 2026-11-25. `tiLeMet` trừ lề `2·2,6` rồi lấy `min` hai trục,
 * cho 0,864706; dưới nó thì chiều sâu chỉ còn 45,0 (spec công bố 49,0), đỉnh
 * bóng 8,77 (spec công bố 9,5), và `z = 1 m` tụt xuống 0,98 lần bán kính bóng —
 * tức dưới ngưỡng "thấy được" mà cả US-1 đứng trên.
 *
 * Sa bàn dùng được hệ lớn hơn vì phép chiếu đã dẹt chiều sâu đi `sin 50°`: chỗ
 * tiết kiệm được theo chiều dọc trả lại thành tỉ lệ.
 *
 * 📍 Cái giá, ghi ra để không ai phải tự tìm lại: hệ này **không chừa lề
 * ngang**. `105 m × 0,941176 = 98,82` trên 100 đơn vị, nên mỗi bên chỉ còn
 * **0,59 đơn vị** — nhỏ hơn bán kính đĩa cầu thủ của sân 2D (2,6). Nơi vẽ phải
 * tự chọn bán kính cho vừa. Chiều dọc thì dư: `2,6 + 49,0 + 9,5 = 61,1 ≤ 64`.
 */
export function tiSaBan(khung: KhungAnh): number {
  return khung.cao / RONG_SAN
}

/** Lề ngang thật sau khi căn giữa mặt cỏ theo chiều dài sân. */
function leNgang(khung: KhungAnh): number {
  return (khung.rong - DAI_SAN * tiSaBan(khung)) / 2
}

/**
 * `y` vẽ của biên GẦN (`y = 0 m`), tức đáy mặt cỏ đã chiếu.
 *
 * Đặt ở `cao − le` nên nó trùng đúng `y` vẽ mà sân 2D cho `y = 0 m` ở khung
 * chuẩn (**61,400** — con số `quyDoiMet.ts` đã ghi sẵn). Hai góc nhìn vì thế
 * có cùng một đường biên gần, và mắt không bị giật khi đổi góc.
 */
function dayMatCo(khung: KhungAnh): number {
  return khung.cao - khung.le
}

/**
 * Một mét độ cao → bao nhiêu đơn vị ảnh, đã nhân `HE_SO_CAO`.
 *
 * `cos`, không phải `sin`. Hàm tuyến tính nên nó tăng nghiêm ngặt theo `z` với
 * mọi `z ≥ 0` (AC-46.3), và `doCaoVe(1 m)` cho **1,815 đơn vị** ở khung chuẩn —
 * trên bán kính quả bóng (1,7), tức thấy được (AC-46.1).
 */
export function doCaoVe(khung: KhungAnh, zMet: number): number {
  return zMet * HE_SO_CAO * tiSaBan(khung) * COS_SA_BAN
}

/**
 * Một điểm ba chiều, mét → toạ độ vẽ của sa bàn.
 *
 * `x` không bị dẹt (yaw 0). Chiều sâu đi **lên** khỏi biên gần theo `sin`, và
 * độ cao đi **lên** tiếp theo `cos`. Hai trục cùng hướng lên màn hình, nên đây
 * đúng là chỗ dễ sai dấu nhất của cả spec — `chieuSaBan.test.ts` kiểm riêng
 * rằng tăng `yMet` và tăng `zMet` không cho cùng một kết quả.
 *
 * `(52,5 ; 34 ; 0)` — tâm sân — cho đúng tâm mặt cỏ đã chiếu ở mọi `KhungAnh`.
 */
export function chieuDiem(
  khung: KhungAnh,
  xMet: number,
  yMet: number,
  zMet: number,
): ToaDoVe {
  const ti = tiSaBan(khung)
  return {
    x: leNgang(khung) + xMet * ti,
    y: dayMatCo(khung) - yMet * ti * SIN_SA_BAN - doCaoVe(khung, zMet),
  }
}

/*
  ====================================================================
  MẶT CỎ VÀ VẠCH SÂN, ĐÃ CHIẾU (T766, AC-46.1).
  ====================================================================

  Phép chiếu là AFFINE với yaw 0, nên một hình chữ nhật thẳng trục trên mặt cỏ
  vẫn là một hình chữ nhật thẳng trục trên màn hình — chỉ bị dẹt theo chiều dọc
  đúng hệ số `sin(GOC_SA_BAN)`. Nhờ thế vòng cấm và khung thành vẫn vẽ được
  bằng `<rect>`, không cần `<path>`.

  Vòng tròn giữa thì KHÔNG: một đường tròn thật bị dẹt một chiều thành ELLIPSE.
  Nên nó trả về hai bán kính, và nơi vẽ dùng `<ellipse>`. Đây đúng là điều
  `quyDoiMet.ts` đã cảnh báo khi từ chối hai hệ số riêng cho sân 2D — khác là ở
  sa bàn thì dẹt theo chiều sâu là CHỦ Ý, không phải méo.

  Khuôn trả về đi theo `VachSan` của `San2D.tsx:117` để hai lớp vẽ đọc giống
  nhau.
*/

/**
 * Chiều sâu khung thành vẽ ra NGOÀI đường biên ngang, tính bằng mét.
 *
 * ⚠️ Khai lại con số của `San2D.tsx:106` (`SAU_KHUNG_THANH_VE = 2`) thay vì
 * import nó, đúng quy ước mà `quyDoiMet.test.ts` đã đặt: `San2D.tsx` là module
 * React, và `import` từ đó sẽ kéo cả React vào mọi file test chạy ở
 * `environment: 'node'`. Hệ quả phải nhận: nếu con số ấy đổi ở `San2D.tsx` thì
 * sa bàn KHÔNG đổi theo và không phép kiểm nào đỏ. T800 là chỗ đã nhận việc
 * ghim các hằng của `San2D`; thêm hằng này vào đó là việc của T800, không phải
 * của task này.
 */
const SAU_KHUNG_THANH_SA_BAN = 2

/** Một hình chữ nhật trong toạ độ vẽ của sa bàn. */
export interface HinhChuNhatVe {
  readonly x: number
  readonly y: number
  readonly rong: number
  readonly cao: number
}

/** Mặt cỏ và toàn bộ vạch sân, đã chiếu sang toạ độ vẽ của sa bàn. */
export interface MatSanDaChieu {
  /** Bốn góc mặt cỏ, theo chiều kim đồng hồ từ góc GẦN-TRÁI. */
  readonly gocMatCo: readonly [ToaDoVe, ToaDoVe, ToaDoVe, ToaDoVe]
  readonly bien: HinhChuNhatVe
  readonly vachGiua: { readonly x: number; readonly y1: number; readonly y2: number }
  readonly tamSan: ToaDoVe
  /** Vòng tròn giữa dẹt thành ellipse — hai bán kính, không một. */
  readonly vongGiua: { readonly rx: number; readonly ry: number }
  readonly vongCam: readonly HinhChuNhatVe[]
  readonly chamPhatDen: readonly ToaDoVe[]
  readonly khungThanh: readonly HinhChuNhatVe[]
}

export function chieuMatSan(khung: KhungAnh): MatSanDaChieu {
  const ti = tiSaBan(khung)
  const tren = (xMet: number, yMet: number): ToaDoVe => chieuDiem(khung, xMet, yMet, 0)
  const ngang = (met: number) => met * ti
  const doc = (met: number) => met * ti * SIN_SA_BAN
  const nuaVongCam = RONG_VONG_CAM / 2

  /** Hình chữ nhật từ hai mét-góc: `yTren` là biên XA hơn, nên `y` vẽ nhỏ hơn. */
  const hcn = (xTu: number, yTren: number, rongMet: number, caoMet: number): HinhChuNhatVe => {
    const g = tren(xTu, yTren)
    return { x: g.x, y: g.y, rong: ngang(rongMet), cao: doc(caoMet) }
  }

  return {
    gocMatCo: [tren(0, 0), tren(DAI_SAN, 0), tren(DAI_SAN, RONG_SAN), tren(0, RONG_SAN)],
    bien: hcn(0, RONG_SAN, DAI_SAN, RONG_SAN),
    vachGiua: { x: tren(TAM_X, 0).x, y1: tren(TAM_X, RONG_SAN).y, y2: tren(TAM_X, 0).y },
    tamSan: tren(TAM_X, TAM_Y),
    vongGiua: { rx: ngang(BAN_KINH_VONG_GIUA), ry: doc(BAN_KINH_VONG_GIUA) },
    vongCam: [
      hcn(0, TAM_Y + nuaVongCam, SAU_VONG_CAM, RONG_VONG_CAM),
      hcn(DAI_SAN - SAU_VONG_CAM, TAM_Y + nuaVongCam, SAU_VONG_CAM, RONG_VONG_CAM),
    ],
    chamPhatDen: [tren(CHAM_PHAT_DEN, TAM_Y), tren(DAI_SAN - CHAM_PHAT_DEN, TAM_Y)],
    khungThanh: [
      hcn(-SAU_KHUNG_THANH_SA_BAN, Y_COT_XA, SAU_KHUNG_THANH_SA_BAN, Y_COT_XA - Y_COT_GAN),
      hcn(DAI_SAN, Y_COT_XA, SAU_KHUNG_THANH_SA_BAN, Y_COT_XA - Y_COT_GAN),
    ],
  }
}

/*
  ====================================================================
  QUẢ BÓNG: CẢ BA TRỤC TỪ MỘT MỐC (T769, D142, AC-46.8).
  ====================================================================

  ⚠️ ĐÂY LÀ MỘT ĐƯỜNG ĐỌC MỚI, KHÔNG PHẢI ĐƯỜNG CỦA SÂN 2D.

  `/analyze` ngày 2026-11-25 tìm ra ba điều: sân 2D vẽ bóng bằng
  `viTriBongTrongPha` của `phaBong.ts` (`San2D.tsx:1543` và `:1846`), đường ấy
  nén mọi đoạn cho vừa MỘT nhịp nên nó có mốc thời gian riêng, và `CHI_SO_BONG`
  không có trong một dòng code sản phẩm nào — lớp giao diện chưa từng đọc quả
  bóng ra khỏi lô mốc.

  Người dùng chốt phương án (b): lấy **cả ba trục từ mốc**. Hệ quả đã nhận và
  đã ghi thành một dòng ở `spec.md` mục 5: **bóng ở hai góc nhìn có thể ở hai
  chỗ khác nhau**. Đó không phải lỗi — đừng "sửa" nó.

  Vì sao không dùng lại `viTriMetLienTuc`: hàm ấy nhận `playerId`, và quả bóng
  không có `playerId`. Chính cái lỗ ấy là lý do D139 phải tách thành D142.
*/

/** Vị trí quả bóng ở một mốc: mặt sân, chỗ vẽ thật, và độ cao mét. */
export interface ViTriBong {
  /** Dấu chiếu xuống mặt cỏ — `chieuDiem(x, y, 0)` (AC-46.2). */
  readonly matSan: ToaDoVe
  /** Chỗ vẽ quả bóng — `chieuDiem(x, y, z)`. */
  readonly chieu: ToaDoVe
  /** Độ cao thật của mốc, mét. Giao diện KHÔNG tự đặt con số nào (AC-46.4). */
  readonly zMet: number
}

/**
 * Đọc quả bóng ra khỏi một mốc và chiếu nó.
 *
 * Trả `null` khi ô bóng không có mặt — người gọi hiểu là "không vẽ bóng".
 */
export function viTriBongLienTuc(anhChup: AnhChupMet, khung: KhungAnh): ViTriBong | null {
  const o = anhChup.thucThe[CHI_SO_BONG]
  if (!o || o.coMat === 0) return null
  return {
    matSan: chieuDiem(khung, o.x, o.y, 0),
    chieu: chieuDiem(khung, o.x, o.y, o.z),
    zMet: o.z,
  }
}

/*
  ====================================================================
  THỨ TỰ VẼ THEO ĐỘ SÂU (T770, quyết định D137).
  ====================================================================

  SVG **không có `z-index`**: thứ tự tài liệu LÀ thứ tự che. Nên muốn người ở
  đầu gần che người ở đầu xa thì phải vẽ người xa TRƯỚC — và đó là tất cả những
  gì hàm này nói.

  Nó so theo `y` vẽ, không theo `yMet`. Hai thứ ngược chiều nhau (`y` mét lớn
  lên là đi về biên xa, `y` vẽ lớn lên là đi xuống màn hình), nên so nhầm trục
  là đảo đúng cái thứ tự cần đảo — và hình vẫn vẽ ra, chỉ che ngược.

  **Ổn định**: hai độ sâu bằng nhau thì giữ nguyên thứ tự vào. Không phải để
  đẹp — một thứ tự nhảy qua nhảy lại giữa hai khung hình làm hai đĩa chồng nhau
  **nhấp nháy**, và nó chỉ xảy ra đúng lúc hai người đứng ngang nhau, tức lúc
  khó lần ra nhất.
*/

/** Chỉ số của các điểm, xếp **xa → gần**; ổn định khi hai độ sâu bằng nhau. */
export function thuTuDoSau(diem: readonly ToaDoVe[]): readonly number[] {
  return diem
    .map((d, i) => ({ y: d.y, i }))
    .sort((a, b) => a.y - b.y || a.i - b.i)
    .map((o) => o.i)
}

/*
  ====================================================================
  PHÂN BIỆT ĐƯỢC HAI HÌNH SÁT NHAU (T781, AC-49.6).
  ====================================================================

  Đo **SAU KHI CHIẾU**, bằng đơn vị viewBox — không đo bằng mét trên mặt sân.
  Đó mới là điều AC-30.5 thật sự hứa: *"KHÔNG hai điểm nào được nằm khít lên
  nhau tới mức người xem chỉ thấy một"*. Người xem nhìn màn hình, không nhìn
  mặt sân; và phép chiếu dẹt chiều sâu đi `sin 50°`, nên hai người cách nhau
  5 m theo chiều sâu chỉ còn cách **3,8 m** trên hình.

  Ngưỡng **một bán kính** không phải con số mới: `san2D.test.ts:173` đã dùng
  đúng nó cho AC-15.2 từ spec 002, kèm số đo "chỗ chật nhất luôn là 1,18 bán
  kính". Dùng lại là giữ một thước đo cho cả hai lớp vẽ.
*/

/** Hai hình tâm `a` và `b`, bán kính `banKinh`, có đọc ra là HAI không. */
export function phanBietDuoc(a: ToaDoVe, b: ToaDoVe, banKinh: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) >= banKinh
}

/*
  ====================================================================
  QUẢ BÓNG BỊ CHE (T783, AC-46.7, quyết định D135).
  ====================================================================

  D135: bóng vẽ **sau tất cả** nên nó luôn thấy được. Nhưng vẽ đè lên mà không
  nói gì là để lớp 3D **nói dối về độ sâu** — người xem tưởng bóng ở trước một
  cầu thủ trong khi nó ở sau lưng anh ta.

  Nên hàm này trả lời câu "có ai đứng TRƯỚC quả bóng không", để nơi vẽ kèm một
  dấu hiệu. Đứng trước nghĩa là **gần người xem hơn**, tức `y` vẽ LỚN hơn —
  chiều sâu đi lên trên màn hình, nên gần là ở dưới.
*/

/** Có thực thể nào che quả bóng không: vừa gần người xem hơn, vừa chồng hình. */
export function bongBiChe(
  bong: ToaDoVe,
  cacHinh: readonly ToaDoVe[],
  banKinh: number,
): boolean {
  return cacHinh.some(
    (h) => h.y > bong.y && !phanBietDuoc(h, bong, banKinh),
  )
}
