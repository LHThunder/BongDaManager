import type { LoaiSuKien, SuKien } from '../engine/suKien'
import type { NgonNgu } from '../services/tuyChonRepo'
import { CAU_LUI_EN, MAU_EN } from './ngonNgu/mauCau.en'
import { CAU_LUI_VI, MAU_VI, type MauCau } from './ngonNgu/mauCau.vi'

/*
  Bảng mẫu câu theo ngôn ngữ (T313, quyết định D69).

  Hai bảng có **cùng tập khoá và cùng số mẫu mỗi khoá** — kiểu `CungSoMau`
  trong `mauCau.en.ts` ép điều đó lúc biên dịch. Nhờ vậy `mauCau` của sự
  kiện, vốn là một chỉ số do `Rng` chọn, rơi vào **đúng vị trí tương ứng** ở
  cả hai ngôn ngữ: cùng một trận kể bằng hai thứ tiếng cho cùng số dòng,
  cùng thứ tự, cùng người (AC-18.2).
*/
type BangMau = Readonly<Partial<Record<LoaiSuKien, readonly MauCau[]>>>

const BANG: Readonly<Record<NgonNgu, BangMau>> = { vi: MAU_VI, en: MAU_EN }
const LUI: Readonly<Record<NgonNgu, MauCau>> = {
  vi: CAU_LUI_VI,
  en: CAU_LUI_EN,
}

/*
  Mẫu câu tường thuật (AC-8.16).

  Câu chữ nằm ở TẦNG GIAO DIỆN, không nằm trong engine (quyết định D22). Engine
  phát ra sự kiện có cấu trúc kèm `mauCau` — một chỉ số do chính `Rng` của trận
  chọn — và ở đây chỉ tra bảng. Nhờ vậy xem lại cùng một trận hai lần ra đúng
  từng chữ, chứ không phải mỗi lần một câu khác (AC-8.11).

  Về cách đọc AC-8.16: "không lặp lại nguyên một câu" theo nghĩa đen là không
  thoả được — bộ mẫu câu nào cũng hữu hạn mà 5 trận có thể có 20 bàn thắng.
  Điều AC thật sự cấm là dùng MỘT câu cố định cho một loại tình huống, nên
  mỗi loại có nhiều mẫu và test đếm số mẫu khác nhau được dùng.
*/

/*
  Một dòng sự kiện mang tới HAI người và dính tới HAI đội (T132, T134).

  Ví dụ rõ nhất là pha cướp bóng: vùng của dòng được tính theo hướng tấn công
  của bên đang cầm bóng, nên `doi` của dòng BẮT BUỘC là bên tấn công — sân 2D
  lật vùng theo trường đó. Nhưng câu chữ lại phải khen bên kia, vì chính họ
  mới là người đoạt được bóng. Hai nhu cầu đó chỉ sống chung được khi mẫu câu
  nhận đủ cả hai tên và cả hai đội.
*/




/*
  Bảng mẫu câu KHÔNG phủ hết `LoaiSuKien`, và đó là chủ ý (T136).

  `mat-bong` không có mẫu câu nào: mất bóng ở dải cao đã thành
  `cuop-bong-cao`, còn mất bóng ở dải thấp chỉ được 1 điểm trong
  `diemCuaChuoi` nên `NGUONG_DANG_KE` cắt sạch trước khi nó kịp thành dòng.
  Giữ bốn câu cho một loại không bao giờ hiện ra chính là cái bẫy mà
  `cuu-thua` và `thoat-xuong` từng giăng suốt Giai đoạn 3 — ai đọc code cũng
  tưởng người dùng đang đọc những câu ấy.

  `CAU_LUI` ở dưới là lưới an toàn: nếu một ngày ngưỡng đổi và loại này lọt
  ra màn hình thật, người dùng đọc được một câu đúng thay vì gặp trang trắng.
*/

/**
 * Câu dùng khi một loại sự kiện không có mẫu nào.
 *
 * Hôm nay chỉ `mat-bong` rơi vào đây, và nó không bao giờ ra tới màn hình —
 * có phép kiểm canh đúng điều đó. Câu này tồn tại để một lần đổi ngưỡng
 * trong tương lai không biến trang tường thuật thành lỗi.
 */


/**
 * Số mẫu câu của một loại sự kiện — dùng cho test và cho việc rà soát.
 * Bằng 0 nghĩa là loại ấy CỐ Ý không có câu nào (xem chú thích ở `MAU`).
 */
export function soMauCau(loai: LoaiSuKien, ngonNgu: NgonNgu = 'vi'): number {
  return BANG[ngonNgu][loai]?.length ?? 0
}

/**
 * Dựng câu tường thuật cho một sự kiện.
 *
 * `mauCau` do engine chọn, nên cùng một trận phát lại ra đúng cùng câu chữ.
 */
export function dungCauTuongThuat(
  suKien: SuKien,
  tenCauThu: (playerId: string) => string,
  tenDoi: (ben: SuKien['doi']) => string,
  ngonNgu: NgonNgu = 'vi',
): string {
  const cacMau = BANG[ngonNgu][suKien.loai]
  const mau =
    cacMau && cacMau.length > 0
      ? cacMau[suKien.mauCau % cacMau.length]
      : LUI[ngonNgu]

  const doiKia = suKien.doi === 'nha' ? 'khach' : 'nha'

  return mau({
    ten: suKien.cacCauThu[0] ? tenCauThu(suKien.cacCauThu[0]) : '',
    ten2: suKien.cacCauThu[1] ? tenCauThu(suKien.cacCauThu[1]) : '',
    tenDoi: tenDoi(suKien.doi),
    tenDoiKia: tenDoi(doiKia),
    phut: suKien.phut,
  })
}
