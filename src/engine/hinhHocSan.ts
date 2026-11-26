/*
  Hình học sân bóng, theo MÉT (T703 của spec 007, AC-37.1 và AC-37.2).

  Đây là NGUỒN SỰ THẬT duy nhất cho kích thước sân. Trước spec 007 repo không
  có file nào như vậy: hình học sân sống rải rác trong thuộc tính SVG của
  `src/ui/components/SanBong.tsx` (mặt sân `rect x=1.5 width=65 height=102`,
  vòng cấm `width=40.3 height=16`), tức một bản đã bị DỊCH sang hệ toạ độ của
  khung vẽ ấy và không có file test nào canh. T703 **không sửa** `SanBong.tsx`;
  nó chỉ thôi là nguồn sự thật.

  Mọi con số dưới đây là mét của sân 11 người, đúng dải Luật bóng đá IFAB cho
  sân thi đấu quốc tế. BA con số SUY RA (`RONG_VONG_CAM`, `Y_COT_GAN`,
  `Y_COT_XA`) được tính từ hằng số trên nó chứ không viết tay — AC-37.2 phải kiểm được bằng
  QUAN HỆ, không phải bằng giá trị, nếu không thì phép kiểm chỉ chép lại số.

  Hệ toạ độ: gốc ở GÓC DƯỚI TRÁI, x theo chiều dài sân (0 → 105), y theo chiều
  rộng (0 → 68). Lớp vẽ đảo dấu y khi quy sang ảnh SVG — xem `ui/quyDoiMet.ts`.
*/

/** Chiều dài sân, mét. */
export const DAI_SAN = 105

/** Chiều rộng sân, mét. */
export const RONG_SAN = 68

/** Vòng cấm sâu bao nhiêu mét tính từ vạch vôi. */
export const SAU_VONG_CAM = 16.5

/** Khoảng giữa hai cột dọc, mét. */
export const RONG_KHUNG_THANH = 7.32

/**
 * Vòng cấm rộng bao nhiêu mét. Số **SUY RA**, không viết tay.
 *
 * Luật bóng đá định nghĩa vòng cấm bằng hai đoạn 16,5 m kéo ra từ hai cột dọc,
 * nên bề rộng của nó là `7,32 + 2 · 16,5 = 40,32` m. Thuộc tính SVG của
 * `SanBong.tsx` ghi `40.3` — một con số đã làm tròn, và chép nó vào đây là
 * chép lại đúng cái bản dịch mà file này vừa tuyên bố thôi làm nguồn sự thật.
 */
export const RONG_VONG_CAM = RONG_KHUNG_THANH + 2 * SAU_VONG_CAM

/** Chấm phạt đền cách vạch vôi bao nhiêu mét. */
export const CHAM_PHAT_DEN = 11

/** Bán kính vòng tròn giữa sân, mét. */
export const BAN_KINH_VONG_GIUA = 9.15

/** Tâm sân theo trục dài. */
export const TAM_X = DAI_SAN / 2

/** Tâm sân theo trục rộng — cũng là tâm khung thành. */
export const TAM_Y = RONG_SAN / 2

/** Cột dọc gần biên dưới. Số SUY RA, không viết tay. */
export const Y_COT_GAN = TAM_Y - RONG_KHUNG_THANH / 2

/** Cột dọc gần biên trên. Số SUY RA, không viết tay. */
export const Y_COT_XA = TAM_Y + RONG_KHUNG_THANH / 2

/** Bên nào của sân: `'nha'` giữ khung thành ở x = 0, `'khach'` ở x = DAI_SAN. */
export type BenSan = 'nha' | 'khach'

/** Toạ độ tâm khung thành của một bên, theo mét. */
export function tamKhungThanh(ben: BenSan): { readonly x: number; readonly y: number } {
  return { x: ben === 'nha' ? 0 : DAI_SAN, y: TAM_Y }
}

/**
 * Điểm `(x, y)` có nằm trong vòng cấm của `ben` không.
 *
 * Biên tính là NẰM TRONG, đúng luật bóng đá: vạch vôi thuộc về khu vực mà nó
 * giới hạn.
 */
export function trongVongCam(x: number, y: number, ben: BenSan): boolean {
  const trongDai =
    ben === 'nha' ? x >= 0 && x <= SAU_VONG_CAM : x >= DAI_SAN - SAU_VONG_CAM && x <= DAI_SAN
  if (!trongDai) return false

  const nuaRong = RONG_VONG_CAM / 2
  return y >= TAM_Y - nuaRong && y <= TAM_Y + nuaRong
}

/** Khoảng cách mét từ `(x, y)` tới tâm khung thành của `ben`. */
export function khoangToiKhungThanh(x: number, y: number, ben: BenSan): number {
  const tam = tamKhungThanh(ben)
  const dx = x - tam.x
  const dy = y - tam.y
  return Math.sqrt(dx * dx + dy * dy)
}

/** Điểm `(x, y)` có nằm trong sân không (biên tính là nằm trong). */
export function trongSan(x: number, y: number): boolean {
  return x >= 0 && x <= DAI_SAN && y >= 0 && y <= RONG_SAN
}
