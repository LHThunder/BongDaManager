import type { KetCucPhaV6 } from '../tran'

/*
  ====================================================================
  "TÌNH HUỐNG QUAN TRỌNG" LÀ GÌ (T730, AC-37.8).
  ====================================================================

  ⚠️ **Định nghĩa bằng LOẠI SỰ KIỆN, không bằng xG** — người dùng chốt ở
  `/clarify` ngày 2026-11-19 (câu 11). xG thuộc **spec 010**, và một phép kiểm
  quét mã nguồn ở `tinhHuong.test.ts` canh đúng điều ấy: thư mục `lienTuc/`
  không được chứa ký hiệu ấy, kể cả trong chú thích.

  Lý do định nghĩa này đáng giá hơn một ngưỡng xG: nó **đã có sẵn trong dữ
  liệu**. Ba trong bốn toán hạng là ba trường mà `quyetKetCucChuoi` **đã tính**
  — `coBan`, `coHoiRoRang`, `biCuu` — nên lớp liên tục không phải rút thêm một
  lần ngẫu nhiên nào, không phải đoán, và hai chế độ không thể lệch nhau ở chỗ
  "cái gì là quan trọng".

  Toán hạng thứ tư, **thẻ đỏ**, KHÔNG nằm trong `KetCucPhaV6`: thẻ được rút sau
  pha bóng, trong đường phạm lỗi của `tran.ts`. Nên nó vào đây như một **tham
  số** chứ không được moi ra từ `pha` — moi ra là đoán.
*/

/** Bốn toán hạng của AC-37.8, và chỉ bốn. */
export interface DauHieuTinhHuong {
  /** Pha này thành bàn. */
  readonly coBan: boolean
  /** Pha này là một cơ hội rõ ràng (AC-11.2). */
  readonly coHoiRoRang: boolean
  /** Cú sút trúng đích bị thủ môn cản. */
  readonly biCuu: boolean
  /** Pha này kéo theo một thẻ đỏ. */
  readonly theDo: boolean
}

/** Tên bốn toán hạng, để phép kiểm duyệt đủ 16 tổ hợp mà không gõ tay. */
export const CAC_DAU_HIEU: readonly (keyof DauHieuTinhHuong)[] = [
  'coBan',
  'coHoiRoRang',
  'biCuu',
  'theDo',
]

/**
 * Pha này có phải **tình huống quan trọng** không — AC-37.8.
 *
 * Phép **hoặc** của đúng bốn toán hạng. Không trọng số, không ngưỡng, không
 * thứ tự ưu tiên: bốn thứ ấy đều là lý do để người xem muốn nhìn kỹ hơn, và
 * một cái nào đúng là đủ.
 */
export function laTinhHuongQuanTrong(dauHieu: DauHieuTinhHuong): boolean {
  return (
    dauHieu.coBan || dauHieu.coHoiRoRang || dauHieu.biCuu || dauHieu.theDo
  )
}

/**
 * Ba toán hạng đọc **thẳng** từ kết cục pha, cộng thẻ đỏ truyền vào.
 *
 * Nguồn là kết quả **tại chỗ sinh** của `quyetKetCucChuoi`, không phải danh
 * sách ứng viên đã lọc của trạng thái trận: danh sách ấy đã qua phép chọn
 * `gomUngVienCuaPhut`, vốn giữ lại **nhiều nhất một** ứng viên dưới 100 điểm
 * mỗi phút — đọc nó là đo **đầu ra của một bộ lọc**, không phải đo pha bóng.
 */
export function dauHieuCuaPha(
  pha: KetCucPhaV6,
  theDo: boolean,
): DauHieuTinhHuong {
  return {
    coBan: pha.coBan,
    coHoiRoRang: pha.coHoiRoRang,
    biCuu: pha.biCuu,
    theDo,
  }
}
