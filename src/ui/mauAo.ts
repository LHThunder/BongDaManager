import { trungMauAo } from '../domain/colors'

/*
  Quyết định đội nào ra sân với áo chính, đội nào phải đổi sang áo phụ
  (AC-3.7, quyết định D39).

  Vì sao chỗ này ở tầng giao diện chứ không trong engine: màu áo KHÔNG phải
  luật bóng đá, nên theo P2 nó không có việc gì trong `engine/`. Trước Giai
  đoạn 4, `BenTran` có một trường `mauAoDangDung` nhưng nó **luôn bằng
  `'chinh'`** vì chưa có chỗ nào đặt — một trường luôn sai còn tệ hơn không có
  trường, vì nó mời người sau tin vào nó. Trường đó đã bị bỏ.

  Hàm này là nguồn duy nhất cho cả màn chọn cặp đấu và sân 2D, nên hai chỗ
  không bao giờ vẽ hai đội với hai bộ màu khác nhau.
*/

export type AoDangDung = 'chinh' | 'phu'

export interface MauAoCuaCapDau {
  readonly nha: AoDangDung
  readonly khach: AoDangDung
  /** Tên đội phải đổi áo, hay `null` khi hai màu đã khác nhau. */
  readonly doiDoiAo: string | null
}

export interface DoiCoMauAo {
  readonly name: string
  readonly primaryColor: string
  readonly secondaryColor: string
}

/**
 * Hai đội trùng màu áo chính thì **đội khách** đổi sang áo phụ.
 *
 * Chọn đội khách chứ không chọn đội nhà vì đó là thông lệ bóng đá: chủ nhà
 * giữ áo của mình, khách mang áo dự phòng.
 */
export function aoDangDung(
  nha: DoiCoMauAo,
  khach: DoiCoMauAo,
): MauAoCuaCapDau {
  if (!trungMauAo(nha.primaryColor, khach.primaryColor)) {
    return { nha: 'chinh', khach: 'chinh', doiDoiAo: null }
  }
  return { nha: 'chinh', khach: 'phu', doiDoiAo: khach.name }
}

/** Màu áo thực tế của một đội trong cặp đấu này. */
export function mauAoRaSan(doi: DoiCoMauAo, ao: AoDangDung): string {
  return ao === 'chinh' ? doi.primaryColor : doi.secondaryColor
}
