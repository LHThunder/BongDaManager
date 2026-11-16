import type { LoaiSuKien } from '../../engine/suKien'

/** Một mẫu câu: nhận bối cảnh của dòng, trả về câu hoàn chỉnh. */
export interface BoiCanhCau {
  /** Người của đội trong `doi` — người mà phần lớn mẫu câu nói tới. */
  readonly ten: string
  /** Người thứ hai của dòng, thường là người của đội kia; `''` nếu không có. */
  readonly ten2: string
  readonly tenDoi: string
  readonly tenDoiKia: string
  readonly phut: number
}

export type MauCau = (c: BoiCanhCau) => string

/*
  Mẫu câu tường thuật tiếng Việt (AC-8.16, T313).

  Khai `as const` để mỗi mảng thành một TUPLE có độ dài cố định. Nhờ vậy
  `mauCau.en.ts` khai kiểu theo bảng này sẽ bị ép đúng SỐ MẪU của từng loại —
  đó là điều kiện để AC-18.2 đúng bằng cấu trúc (quyết định D69): `mauCau`
  là một chỉ số do `Rng` chọn, và `tuongThuat.ts` lấy mẫu bằng
  `cacMau[mauCau % cacMau.length]`, nên hai bảng lệch độ dài sẽ khiến hai
  ngôn ngữ rơi vào biến thể không tương ứng của cùng một tình huống.
*/
export const MAU_VI = {
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
  /*
    Trận bị huỷ vì thiếu người (AC-14.6). `tenDoi` là đội KHÔNG còn đủ quân.
    Câu phải nói rõ hai điều: trận dừng, và dừng vì sao — nếu không người xem
    sẽ tưởng mình vừa đọc một trận kết thúc bình thường.
  */
  'huy-tran': [
    (c) => `Trọng tài dừng trận: ${c.tenDoi} không còn đủ người thi đấu.`,
    (c) =>
      `Trận đấu không thể tiếp tục — ${c.tenDoi} đã mất quá nhiều người vì thẻ đỏ.`,
    (c) =>
      `Còi vang lên sớm: ${c.tenDoi} xuống dưới số người tối thiểu, trận bị huỷ.`,
    (c) =>
      `${c.tenDoi} không còn đủ quân, trọng tài buộc phải cho dừng trận tại đây.`,
  ],
  'ket-thuc': [
    () => 'Hết giờ! Trận đấu khép lại.',
    () => 'Tiếng còi mãn cuộc vang lên.',
    () => 'Trận đấu kết thúc tại đây.',
    () => 'Không còn thời gian nữa, trọng tài thổi còi kết thúc.',
  ],
} as const satisfies Readonly<Partial<Record<LoaiSuKien, readonly MauCau[]>>>

/**
 * Câu dùng khi một loại sự kiện không có mẫu nào.
 *
 * Hôm nay chỉ `mat-bong` rơi vào đây, và nó không bao giờ ra tới màn hình —
 * có phép kiểm canh đúng điều đó.
 */
export const CAU_LUI_VI: MauCau = (c) =>
  c.ten
    ? `${c.ten} để mất bóng, ${c.tenDoiKia} có bóng.`
    : `${c.tenDoi} để mất bóng.`
