import type { LoaiSuKien, SuKien } from '../engine/suKien'

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
export interface BoiCanhCau {
  /** Người của đội trong `doi` — người mà phần lớn mẫu câu nói tới. */
  readonly ten: string
  /** Người thứ hai của dòng, thường là người của đội kia; `''` nếu không có. */
  readonly ten2: string
  readonly tenDoi: string
  readonly tenDoiKia: string
  readonly phut: number
}

type MauCau = (c: BoiCanhCau) => string

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
const MAU: Readonly<Partial<Record<LoaiSuKien, readonly MauCau[]>>> = {
  'bat-dau': [
    () => 'Trọng tài nổi còi khai cuộc.',
    () => 'Bóng lăn, trận đấu bắt đầu.',
    () => 'Hai đội đã vào sân, trận đấu khởi tranh.',
    () => 'Tiếng còi vang lên, trận đấu chính thức bắt đầu.',
  ],
  'ban-thang': [
    (c) => `VÀO! ${c.ten} dứt điểm gọn ghẽ, ${c.tenDoi} có bàn thắng.`,
    (c) => `${c.ten} tung cú sút không thể cản phá — bàn thắng cho ${c.tenDoi}!`,
    (c) => `Bóng nằm gọn trong lưới! ${c.ten} lập công cho ${c.tenDoi}.`,
    (c) => `${c.ten} băng vào dứt điểm chuẩn xác, ${c.tenDoi} vui mừng.`,
    (c) => `Thủ môn bó tay trước cú ra chân của ${c.ten}. Bàn cho ${c.tenDoi}!`,
  ],
  'co-hoi': [
    (c) => `${c.ten} dứt điểm nhưng bóng đi chệch cột dọc.`,
    (c) => `Cơ hội cho ${c.tenDoi}! ${c.ten} sút chưa tới.`,
    (c) => `${c.ten} có khoảng trống, cú sút lại thiếu chính xác.`,
    (c) => `Pha dứt điểm của ${c.ten} bay vọt xà ngang.`,
    (c) => `${c.ten} vào vị trí thuận lợi nhưng chân sút phản bội.`,
  ],
  'cuu-thua': [
    (c) => `Thủ môn bay người cản phá cú sút của ${c.ten}.`,
    (c) => `${c.ten} tưởng đã ghi bàn, nhưng thủ môn kịp đẩy bóng ra.`,
    (c) => `Một pha cứu thua xuất sắc trước cú dứt điểm của ${c.ten}.`,
    (c) => `Bóng từ chân ${c.ten} bị chặn lại ngay trên vạch vôi.`,
  ],
  'tat-canh': [
    (c) => `${c.ten} căng ngang từ biên, hàng thủ phá ra.`,
    (c) => `Quả tạt của ${c.ten} tìm không thấy đồng đội.`,
    (c) => `${c.tenDoi} khai thác hành lang biên, ${c.ten} treo bóng vào.`,
    (c) => `${c.ten} đưa bóng vào vòng cấm nhưng chưa ai kịp băng tới.`,
  ],
  /*
    Người ĐOẠT được bóng thuộc đội KIA, nên mọi mẫu câu ở đây dùng `ten2` và
    `tenDoiKia` (T134). Trước đó chúng dùng `ten` và `tenDoi`, tức khen công
    đoạt bóng cho chính đội vừa để mất bóng, và cho đúng người vừa để mất nó.
  */
  'cuop-bong-cao': [
    (c) =>
      c.ten2
        ? `${c.tenDoiKia} vây ráp ngay phần sân đối phương, ${c.ten2} đoạt lại bóng.`
        : `${c.tenDoiKia} vây ráp ngay phần sân đối phương và đoạt lại bóng.`,
    (c) =>
      c.ten2
        ? `${c.ten2} gây áp lực và cướp được bóng ở vị trí cao.`
        : `${c.tenDoiKia} gây áp lực và cướp được bóng ở vị trí cao.`,
    (c) =>
      c.ten2
        ? `Một pha pressing hiệu quả của ${c.tenDoiKia}, công đầu thuộc về ${c.ten2}.`
        : `Một pha pressing hiệu quả của ${c.tenDoiKia}.`,
    (c) =>
      c.ten2
        ? `${c.ten2} chặn đứng đường lên bóng của ${c.tenDoi} ngay từ sân đối thủ.`
        : `${c.tenDoiKia} chặn đứng đường lên bóng ngay từ sân đối thủ.`,
  ],
  'thoat-xuong': [
    (c) => `${c.ten} thoát xuống sau lưng hàng phòng ngự.`,
    (c) => `Hàng thủ dâng cao để lộ khoảng trống, ${c.ten} băng vào.`,
    (c) => `${c.ten} chọn đúng thời điểm, vượt qua bẫy của đối phương.`,
    (c) => `Một đường chọc khe tìm thấy ${c.ten} phía sau hàng thủ.`,
  ],
  /*
    Pha phạm lỗi (T135). Người phạm lỗi thuộc đội KIA — `cacCauThu` của dòng
    là `[người bị phạm lỗi, người phạm lỗi]` — nên câu dùng `ten2` cho người
    phạm lỗi, đúng cách pha cướp bóng dùng `ten2` cho người đoạt bóng.

    Dòng này KHÔNG nói gì về thẻ: thẻ có dòng riêng của nó, và không phải pha
    phạm lỗi nào cũng bị rút thẻ.
  */
  'pham-loi': [
    (c) =>
      c.ten2
        ? `${c.ten2} phạm lỗi, trọng tài cắt còi.`
        : `Trọng tài cắt còi vì một pha phạm lỗi của ${c.tenDoiKia}.`,
    (c) =>
      c.ten2 && c.ten
        ? `${c.ten} bị ${c.ten2} phạm lỗi, ${c.tenDoi} được hưởng quả đá phạt.`
        : `${c.tenDoi} được hưởng quả đá phạt.`,
    (c) =>
      c.ten2
        ? `Pha vào bóng của ${c.ten2} buộc trận đấu phải dừng lại.`
        : `Một pha vào bóng của ${c.tenDoiKia} buộc trận đấu phải dừng lại.`,
    (c) =>
      c.ten
        ? `Nhịp lên bóng của ${c.tenDoi} bị chặn lại bằng một pha phạm lỗi với ${c.ten}.`
        : `Nhịp lên bóng của ${c.tenDoi} bị chặn lại bằng một pha phạm lỗi.`,
  ],
  'the-vang': [
    (c) => `${c.ten} nhận thẻ vàng sau pha vào bóng muộn.`,
    (c) => `Trọng tài rút thẻ vàng cảnh cáo ${c.ten}.`,
    (c) => `${c.ten} phạm lỗi chiến thuật và phải nhận thẻ.`,
    (c) => `Một tấm thẻ vàng cho ${c.ten} bên phía ${c.tenDoi}.`,
  ],
  'the-do': [
    (c) => `Thẻ đỏ! ${c.ten} phải rời sân, ${c.tenDoi} chơi thiếu người.`,
    (c) => `${c.ten} nhận thẻ đỏ và cúi đầu đi vào đường hầm.`,
    (c) => `Trọng tài không do dự rút thẻ đỏ với ${c.ten}.`,
    (c) => `${c.tenDoi} mất người: ${c.ten} bị truất quyền thi đấu.`,
  ],
  /*
    Dòng thay người mang `[vào, ra]`, nên `ten` là người VÀO và `ten2` là
    người RA. Hai mẫu cuối trước đây đọc `ten` cho vế "rời sân" và vế "thay",
    tức gọi tên người vừa vào sân cho việc của người vừa rời sân (T134).
  */
  'thay-nguoi': [
    (c) => `${c.tenDoi} thay người: ${c.ten} vào sân.`,
    (c) => `Một sự điều chỉnh từ băng ghế ${c.tenDoi}, ${c.ten} được tung vào.`,
    (c) =>
      c.ten2
        ? `${c.ten2} rời sân nhường chỗ cho ${c.ten} bên phía ${c.tenDoi}.`
        : `${c.tenDoi} có người mới: ${c.ten} vào sân.`,
    (c) =>
      c.ten2
        ? `Bảng điện tử được giơ lên, ${c.tenDoi} thay ${c.ten2} bằng ${c.ten}.`
        : `Bảng điện tử được giơ lên, ${c.tenDoi} thay người.`,
  ],
  'kiet-suc': [
    (c) => `${c.ten} đã xuống sức thấy rõ.`,
    (c) => `${c.ten} chống tay lên đầu gối, thể lực gần cạn.`,
    (c) => `Băng ghế ${c.tenDoi} nên để mắt tới ${c.ten} — anh đã kiệt sức.`,
    (c) => `${c.ten} chạy chậm hẳn lại, dấu hiệu của sự quá tải.`,
  ],
  'het-hiep': [
    () => 'Hết hiệp một, hai đội về đường hầm.',
    () => 'Tiếng còi kết thúc 45 phút đầu tiên.',
    () => 'Hiệp một khép lại.',
    () => 'Trọng tài cho hai đội nghỉ giải lao.',
  ],
  'ket-thuc': [
    () => 'Hết giờ! Trận đấu khép lại.',
    () => 'Tiếng còi mãn cuộc vang lên.',
    () => 'Trận đấu kết thúc tại đây.',
    () => 'Không còn thời gian nữa, trọng tài thổi còi kết thúc.',
  ],
}

/**
 * Câu dùng khi một loại sự kiện không có mẫu nào.
 *
 * Hôm nay chỉ `mat-bong` rơi vào đây, và nó không bao giờ ra tới màn hình —
 * có phép kiểm canh đúng điều đó. Câu này tồn tại để một lần đổi ngưỡng
 * trong tương lai không biến trang tường thuật thành lỗi.
 */
const CAU_LUI: MauCau = (c) =>
  c.ten
    ? `${c.ten} để mất bóng, ${c.tenDoiKia} có bóng.`
    : `${c.tenDoi} để mất bóng.`

/**
 * Số mẫu câu của một loại sự kiện — dùng cho test và cho việc rà soát.
 * Bằng 0 nghĩa là loại ấy CỐ Ý không có câu nào (xem chú thích ở `MAU`).
 */
export function soMauCau(loai: LoaiSuKien): number {
  return MAU[loai]?.length ?? 0
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
): string {
  const cacMau = MAU[suKien.loai]
  const mau =
    cacMau && cacMau.length > 0
      ? cacMau[suKien.mauCau % cacMau.length]
      : CAU_LUI

  const doiKia = suKien.doi === 'nha' ? 'khach' : 'nha'

  return mau({
    ten: suKien.cacCauThu[0] ? tenCauThu(suKien.cacCauThu[0]) : '',
    ten2: suKien.cacCauThu[1] ? tenCauThu(suKien.cacCauThu[1]) : '',
    tenDoi: tenDoi(suKien.doi),
    tenDoiKia: tenDoi(doiKia),
    phut: suKien.phut,
  })
}
