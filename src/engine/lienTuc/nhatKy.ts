import type { BenDoi, LoaiSuKien, SuKien } from '../suKien'
import { tamVungMet } from './viTriMet'

/*
  ====================================================================
  KÊNH NHẬT KÝ RIÊNG, KHÔNG CẮT (T741, AC-45.5 + AC-45.6).
  ====================================================================

  Mục 7b của bản mô tả gốc có **từ vựng loại sự kiện riêng**, và nó **không
  trùng** từ vựng của engine. Module này là chỗ hai từ vựng gặp nhau — một bảng
  ánh xạ **hai chiều** cộng hai danh sách khai chỗ chúng **không** gặp nhau.

  ⚠️ **KHÔNG thêm một giá trị nào vào `LoaiSuKien`, và đây là lý do — nó là một
  bẫy ở BƯỚC BIÊN DỊCH, không ở `vitest`.** `src/ui/phaBong.ts` có một `switch`
  **vét cạn** trên cả 16 giá trị, **không `default`** và **không `return`** nào
  sau nó, với kiểu trả `string | null` dưới `strict: true`. Thêm một giá trị là
  file ấy **đỏ ngay ở `tsc` (TS2366)**. Tệ hơn: `tuongThuat.test.ts` liệt tay
  **15** giá trị còn `phaBong.test.ts` liệt **16** — **hai danh sách đã lệch
  nhau sẵn**, và vì viết tay nên chúng **không bao giờ đỏ** khi `LoaiSuKien`
  đổi, chỉ âm thầm phủ thiếu. Một kênh **riêng** tránh cả ba chuyện ấy.

  ⚠️ **Và kênh này KHÔNG mang khoá "chỉ số bàn thắng kỳ vọng", dù ví dụ của mục
  7b có.** Người dùng chốt ở `/clarify` (câu 11) rằng "tình huống quan trọng"
  định nghĩa bằng **loại sự kiện**, không bằng chỉ số ấy, và chỉ số ấy thuộc
  **spec 010**. T730 còn dựng một phép kiểm quét cả thư mục `lienTuc/` để cấm
  ký hiệu của nó — và điều kiện ra của T730 viết phép quét ấy là một lệnh `grep`
  **thô**, nên file này tránh cả ký hiệu trong **chú thích**, để hai cách đọc
  cùng đúng. Bỏ một khoá khỏi ví dụ là một lệch **có tên**; mang nó vào là mở
  cửa cho một con số spec 007 không tính nổi.

  ⚠️ **"Không cắt" nghĩa là KHÔNG LỌC THEO ĐỘ ĐÁNG KỂ.** Dòng tường thuật của
  giao diện đi qua một phép chọn giữ 60–100 dòng một trận; kênh này nhận thẳng
  danh sách sự kiện và dịch **từng dòng một**. Module không đọc một trường nào
  của trạng thái trận — nó nhận đầu vào và trả đầu ra, nên nó không **thể** lọc.
*/

/** Từ vựng loại của **mục 7b**, 18 giá trị, không thêm không bớt. */
export const LOAI_NHAT_KY = [
  'giao_bong',
  'chuyen_quyet_dinh',
  'sut',
  'ban_thang',
  'pham_loi',
  'the_vang',
  'the_do',
  'viet_vi',
  'phat_goc',
  'nem_bien',
  'phat_bong',
  'da_phat',
  'phat_den',
  'thay_nguoi',
  'chan_thuong',
  'VAR',
  'doi_so_do',
  'het_hiep',
] as const

export type LoaiNhatKy = (typeof LOAI_NHAT_KY)[number]

/**
 * Bảng ánh xạ **engine → mục 7b**.
 *
 * Hai chỗ **nhiều-về-một**, và chúng là lựa chọn chứ không phải sơ suất:
 * `co-hoi` và `cuu-thua` đều ra `sut`, vì cả hai **là** một cú sút — chúng khác
 * nhau ở **kết quả**, và kết quả đi vào khoá `ket_qua` chứ không vào `loai`.
 */
export const LOAI_ENGINE_SANG_NHAT_KY: Partial<
  Readonly<Record<LoaiSuKien, LoaiNhatKy>>
> = {
  'bat-dau': 'giao_bong',
  'ban-thang': 'ban_thang',
  'co-hoi': 'sut',
  'cuu-thua': 'sut',
  'tat-canh': 'chuyen_quyet_dinh',
  'pham-loi': 'pham_loi',
  'the-vang': 'the_vang',
  'the-do': 'the_do',
  'thay-nguoi': 'thay_nguoi',
  'het-hiep': 'het_hiep',
}

/**
 * Loại của **mục 7b** mà engine spec 007 **chưa sinh ra bao giờ**.
 *
 * Chín trong số đó là **tình huống cố định của luật IFAB** — việt vị, phạt góc,
 * ném biên, phát bóng, đá phạt, phạt đền — và chúng là **spec 008**. `VAR`,
 * `chan_thuong` và `doi_so_do` thì chưa spec nào nhận.
 */
export const LOAI_MO_RONG: readonly LoaiNhatKy[] = LOAI_NHAT_KY.filter(
  (l) => !Object.values(LOAI_ENGINE_SANG_NHAT_KY).includes(l),
)

/**
 * Loại của **engine** mà mục 7b **không có chỗ** để nhận.
 *
 * Chúng **vẫn vào nhật ký** — "không cắt" nghĩa là không bỏ dòng nào — nhưng
 * `loai` của chúng mang chính tên engine, và `ghi_chu` nói rõ đó là một loại
 * ngoài từ vựng 7b. Bỏ chúng đi là làm nhật ký **cắt**, đúng thứ task cấm.
 */
export const LOAI_BO_TRONG: readonly LoaiSuKien[] = [
  'cuop-bong-cao',
  'thoat-xuong',
  'mat-bong',
  'kiet-suc',
  'ket-thuc',
  'huy-tran',
]

/** Một dòng nhật ký, đúng tám khoá — mục 7b trừ khoá chỉ số kỳ vọng. */
export interface DongNhatKy {
  readonly phut: string
  readonly loai: string
  readonly doi: 'A' | 'B'
  readonly cau_thu: string | null
  readonly x: number | null
  readonly y: number | null
  readonly ket_qua: string | null
  readonly ghi_chu: string | null
}

/** `nha` → `A`, `khach` → `B` — quy ước chữ của mục 7b. */
export function chuCuaDoi(doi: BenDoi): 'A' | 'B' {
  return doi === 'nha' ? 'A' : 'B'
}

/**
 * Phút dạng `mm:ss` của mục 7b.
 *
 * ⚠️ **Giây luôn là `00`, và đó là sự thật chứ không phải chỗ làm tròn.** Sự
 * kiện của engine v6 sinh ra **theo phút**: `SuKien` có `phut` và `buGio`, và
 * không có một trường giây nào để lấy. Thứ có độ phân giải giây là **khung
 * hình** (khối `tinh_huong`), không phải nhật ký. In một con số giây bịa ra ở
 * đây là cho người đọc tệp tin vào một độ chính xác không tồn tại.
 */
export function phutDangChuoi(phut: number, buGio: boolean): string {
  const hai = (n: number) => String(n).padStart(2, '0')
  return buGio ? `${hai(phut)}:00+` : `${hai(phut)}:00`
}

/** Kết quả của một cú sút, hoặc `null` với loại khác. */
function ketQuaCua(loai: LoaiSuKien): string | null {
  if (loai === 'ban-thang') return 'ban_thang'
  if (loai === 'cuu-thua') return 'cuu_thua'
  if (loai === 'co-hoi') return 'truot'
  return null
}

/**
 * Một sự kiện engine → một dòng nhật ký.
 *
 * `maNgan` tra mã ngắn của cầu thủ; thiếu thì để `null` thay vì in uuid — một
 * uuid 36 ký tự trong nhật ký làm tệp phình mà không nói thêm điều gì, và bảng
 * tra ở `khoi_dau.nguoi` đã là chỗ của nó.
 */
export function dongCuaSuKien(
  sk: SuKien,
  maNgan: ReadonlyMap<string, string>,
): DongNhatKy {
  const loai7b = LOAI_ENGINE_SANG_NHAT_KY[sk.loai]
  const diem = sk.vung === null ? null : tamVungMet(sk.vung, sk.doi)
  const nguoi = sk.cacCauThu[0]
  return {
    phut: phutDangChuoi(sk.phut, sk.buGio),
    loai: loai7b ?? sk.loai,
    doi: chuCuaDoi(sk.doi),
    cau_thu: nguoi === undefined ? null : (maNgan.get(nguoi) ?? null),
    x: diem === null ? null : Math.round(diem.x * 100) / 100,
    y: diem === null ? null : Math.round(diem.y * 100) / 100,
    ket_qua: ketQuaCua(sk.loai),
    ghi_chu: loai7b === undefined ? `loai ngoai tu vung 7b: ${sk.loai}` : null,
  }
}

/**
 * Cả nhật ký của một trận — **không bỏ một dòng nào**.
 *
 * Nhận danh sách đã có sẵn thay vì tự đi lấy: module này không được phép biết
 * trạng thái trận trông ra sao, và nhờ thế nó **không thể** lọc.
 */
export function dungNhatKy(
  cacDong: readonly SuKien[],
  maNgan: ReadonlyMap<string, string>,
): readonly DongNhatKy[] {
  return cacDong.map((sk) => dongCuaSuKien(sk, maNgan))
}
