import type { BoChiThi, ChiThiId, MucTheoChiThi } from '../domain/instructions'
import { THU_TU_CHI_THI } from '../domain/instructions'

/*
  Bảng hệ số của 6 chỉ thị toàn đội (quyết định D24).

  Mỗi chỉ thị là HỆ SỐ NHÂN lên vài loại hành động trong chuỗi bóng, khai
  thành đúng một bảng. Không rải thành nhánh `if` trong `chuoiBong.ts`: sau 6
  chỉ thị × 3 mức là 18 nhánh chồng nhau, không ai dò nổi, và chỉnh cân bằng
  sẽ thành sửa logic thay vì sửa số.

  Không hệ số nào bằng 0 hay âm: một chỉ thị được làm một hành động HIẾM ĐI,
  không được CẤM HẲN. Đội tấn công trung lộ vẫn phải tạt được vài quả.
*/

export interface HeSoChiThi {
  /** Nhân xác suất bóng đi vào hành lang biên (AC-8.3). */
  readonly huongBien: number
  /** Nhân xác suất tạt bóng khi đang ở biên (AC-8.3). */
  readonly tatCanh: number
  /** Nhân xác suất cướp được bóng ở dải cao (AC-8.4, chiều thứ nhất). */
  readonly cuopBongDaiCao: number
  /** Nhân xác suất đối thủ thoát xuống sau lưng (AC-8.4, chiều thứ hai). */
  readonly biThoatXuong: number
  /** Nhân xác suất đưa bóng lên dải trên thay vì chuyền ngang. */
  readonly lenBongNhanh: number
  /** Nhân xác suất giữ được bóng ở mỗi bước. */
  readonly giuBong: number
}

const TRUNG_TINH: HeSoChiThi = {
  huongBien: 1,
  tatCanh: 1,
  cuopBongDaiCao: 1,
  biThoatXuong: 1,
  lenBongNhanh: 1,
  giuBong: 1,
}

type BangMuc<K extends ChiThiId> = Readonly<
  Record<MucTheoChiThi[K], Partial<HeSoChiThi>>
>

type BangHeSo = { readonly [K in ChiThiId]: BangMuc<K> }

/*
  Chỉ ghi những ô KHÁC 1. Ô không ghi nghĩa là chỉ thị đó không động tới loại
  hành động đó — đọc bảng là thấy ngay chỉ thị nào ảnh hưởng cái gì.
*/
const BANG: BangHeSo = {
  'do-cao-doi-hinh': {
    thap: { cuopBongDaiCao: 0.65, biThoatXuong: 0.7, lenBongNhanh: 0.9 },
    'trung-binh': {},
    cao: { cuopBongDaiCao: 1.3, biThoatXuong: 1.35 },
  },
  'do-rong-doi-hinh': {
    hep: { huongBien: 0.7, tatCanh: 0.8 },
    'trung-binh': {},
    rong: { huongBien: 1.3, tatCanh: 1.15, giuBong: 0.95 },
  },
  'toc-do-chuyen-bong': {
    cham: { lenBongNhanh: 0.75, giuBong: 1.1 },
    'trung-binh': {},
    nhanh: { lenBongNhanh: 1.35, giuBong: 0.88 },
  },
  'cuong-do-pressing': {
    thap: { cuopBongDaiCao: 0.7, biThoatXuong: 0.75 },
    'trung-binh': {},
    cao: { cuopBongDaiCao: 1.5, biThoatXuong: 1.45 },
  },
  'huong-tan-cong': {
    bien: { huongBien: 1.75, tatCanh: 1.8 },
    'can-bang': {},
    'trung-lo': { huongBien: 0.6, tatCanh: 0.55, lenBongNhanh: 1.1 },
  },
  'bay-viet-vi': {
    tat: {},
    bat: { cuopBongDaiCao: 1.15, biThoatXuong: 1.3 },
  },
}

const CAC_KHOA: readonly (keyof HeSoChiThi)[] = [
  'huongBien',
  'tatCanh',
  'cuopBongDaiCao',
  'biThoatXuong',
  'lenBongNhanh',
  'giuBong',
]

/** Hệ số của một mức cụ thể, đã điền đủ mọi khoá (ô trống là 1). */
export function heSoCuaMuc<K extends ChiThiId>(
  id: K,
  muc: MucTheoChiThi[K],
): HeSoChiThi {
  const phan = BANG[id][muc] as Partial<HeSoChiThi> | undefined
  return { ...TRUNG_TINH, ...(phan ?? {}) }
}

/** Hệ số tổng của cả bộ chỉ thị: nhân dồn từng khoá qua 6 chỉ thị. */
export function heSoCuaBo(bo: BoChiThi): HeSoChiThi {
  const ra: Record<keyof HeSoChiThi, number> = { ...TRUNG_TINH }

  // Duyệt theo THU_TU_CHI_THI — mảng có thứ tự khai báo, không phải
  // `Object.keys` của bộ chỉ thị, để không có chỗ nào cho thứ tự chèn lọt
  // vào kết quả (rủi ro R13).
  for (const id of THU_TU_CHI_THI) {
    const heSo = heSoCuaMuc(id, bo[id] as never)
    for (const khoa of CAC_KHOA) {
      ra[khoa] *= heSo[khoa]
    }
  }

  return ra
}

export { TRUNG_TINH as HE_SO_TRUNG_TINH, CAC_KHOA as CAC_KHOA_HE_SO }
