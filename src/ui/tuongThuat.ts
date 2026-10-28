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

export interface BoiCanhCau {
  readonly ten: string
  readonly tenDoi: string
  readonly phut: number
}

type MauCau = (c: BoiCanhCau) => string

const MAU: Readonly<Record<LoaiSuKien, readonly MauCau[]>> = {
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
  'cuop-bong-cao': [
    (c) => `${c.tenDoi} vây ráp ngay phần sân đối phương, ${c.ten} đoạt lại bóng.`,
    (c) => `${c.ten} gây áp lực và cướp được bóng ở vị trí cao.`,
    (c) => `Một pha pressing hiệu quả của ${c.tenDoi}, công đầu thuộc về ${c.ten}.`,
    (c) => `${c.ten} chặn đứng đường lên bóng ngay từ sân đối thủ.`,
  ],
  'thoat-xuong': [
    (c) => `${c.ten} thoát xuống sau lưng hàng phòng ngự.`,
    (c) => `Hàng thủ dâng cao để lộ khoảng trống, ${c.ten} băng vào.`,
    (c) => `${c.ten} chọn đúng thời điểm, vượt qua bẫy của đối phương.`,
    (c) => `Một đường chọc khe tìm thấy ${c.ten} phía sau hàng thủ.`,
  ],
  'mat-bong': [
    (c) => `${c.ten} để mất bóng trong chân.`,
    (c) => `Pha xử lý hỏng của ${c.ten}, ${c.tenDoi} mất quyền kiểm soát.`,
    (c) => `${c.ten} chuyền hỏng, bóng thuộc về đối phương.`,
    (c) => `${c.tenDoi} đánh rơi nhịp tấn công sau pha mất bóng của ${c.ten}.`,
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
  'thay-nguoi': [
    (c) => `${c.tenDoi} thay người: ${c.ten} vào sân.`,
    (c) => `Một sự điều chỉnh từ băng ghế ${c.tenDoi}, ${c.ten} được tung vào.`,
    (c) => `${c.ten} rời sân nhường chỗ cho người mới bên phía ${c.tenDoi}.`,
    (c) => `Bảng điện tử được giơ lên, ${c.tenDoi} thay ${c.ten}.`,
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

/** Số mẫu câu của một loại sự kiện — dùng cho test và cho việc rà soát. */
export function soMauCau(loai: LoaiSuKien): number {
  return MAU[loai].length
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
  const mau = cacMau[suKien.mauCau % cacMau.length]

  return mau({
    ten: suKien.cacCauThu[0] ? tenCauThu(suKien.cacCauThu[0]) : '',
    tenDoi: tenDoi(suKien.doi),
    phut: suKien.phut,
  })
}
