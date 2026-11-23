import { DAI_SAN, RONG_SAN } from '../engine/hinhHocSan'

/*
  Quy đổi mét của engine → đơn vị viewBox của sân 2D (T703, quyết định D121).

  MỘT hệ số duy nhất, dùng cho CẢ HAI trục. Hai hệ số riêng (một cho x, một
  cho y) sẽ làm ảnh méo 1,19%, và cái giá của méo là AC-38.8: AC ấy đặt ngưỡng
  theo GÓC, nên dưới hai hệ số một hướng 45° trong mét vẽ ra 44,661° — ngưỡng
  đo được không còn là ngưỡng mà AC phát biểu. Thêm nữa, mọi vòng tròn thật
  (vòng tròn giữa, vòng cấm người giữ bóng) sẽ thành `<ellipse>`.

  Khung ảnh là THAM SỐ, không phải hằng số nhập khẩu. Lý do: `San2D.tsx` là
  một module React, và một hàm thuần ở đây mà `import` từ đó sẽ kéo cả React
  vào mọi file test chạy ở `environment: 'node'`. Nơi gọi truyền khung vào.

  Hệ toạ độ: engine lấy gốc GÓC DƯỚI TRÁI (y lớn lên là đi về phía biên trên),
  còn SVG lấy gốc góc TRÊN trái (y lớn lên là đi xuống). Nên `toaDoTuMet` ĐẢO
  DẤU y. Hệ quả dễ nhầm: `y = 0 m` cho toạ độ vẽ LỚN nhất, không nhỏ nhất.
*/

/** Khung ảnh để quy đổi vào: hệ toạ độ viewBox cộng lề cho bán kính điểm. */
export interface KhungAnh {
  /** Chiều rộng hệ toạ độ ảnh. */
  readonly rong: number
  /** Chiều cao hệ toạ độ ảnh. */
  readonly cao: number
  /**
   * Lề mỗi phía, tính bằng đơn vị ảnh. Đúng bằng bán kính điểm cầu thủ: một
   * người đứng sát vạch vôi thì đĩa của anh ta phải còn nằm trong ảnh.
   */
  readonly le: number
}

/** Toạ độ trong hệ của ảnh. */
export interface ToaDoVe {
  readonly x: number
  readonly y: number
}

/**
 * Hệ số đẳng hướng: bao nhiêu đơn vị ảnh cho một mét.
 *
 * Lấy `min` của hai trục để sân vừa trọn trong khung ở cả hai chiều. Với
 * khung 100×64 và lề 2,6 thì nó là `min(94,8/105 ; 58,8/68) = 0,864706` —
 * trục y là trục chật, nên sân cao đúng `64 − 2·2,6` đơn vị.
 */
export function tiLeMet(khung: KhungAnh): number {
  return Math.min(
    (khung.rong - 2 * khung.le) / DAI_SAN,
    (khung.cao - 2 * khung.le) / RONG_SAN,
  )
}

/** Lề thật sau khi căn giữa: sân chiếm giữa khung, phần dư chia đôi. */
function leThat(khung: KhungAnh): { readonly x: number; readonly y: number } {
  const ti = tiLeMet(khung)
  return {
    x: (khung.rong - DAI_SAN * ti) / 2,
    y: (khung.cao - RONG_SAN * ti) / 2,
  }
}

/**
 * Một điểm trên sân, mét → toạ độ vẽ. **Đảo dấu y.**
 *
 * `(52,5 ; 34)` — tâm sân — cho đúng tâm ảnh ở mọi hệ số. Hai đẳng thức có
 * răng nằm ở BIÊN: với khung 100×64 lề 2,6 thì `y = 0 m` cho `61,400` và
 * `x = 0 m` cho `4,603`.
 */
export function toaDoTuMet(khung: KhungAnh, xMet: number, yMet: number): ToaDoVe {
  const ti = tiLeMet(khung)
  const le = leThat(khung)
  return {
    x: le.x + xMet * ti,
    y: le.y + (RONG_SAN - yMet) * ti,
  }
}

/** Một độ dài mét → độ dài đơn vị ảnh (vô hướng, không có gốc, không đảo dấu). */
export function metSangDonVi(khung: KhungAnh, met: number): number {
  return met * tiLeMet(khung)
}

/** Một độ dài đơn vị ảnh → độ dài mét. Nghịch đảo của `metSangDonVi`. */
export function metTuDonVi(khung: KhungAnh, donVi: number): number {
  return donVi / tiLeMet(khung)
}
