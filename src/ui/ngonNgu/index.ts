import type { ChiThiId } from '../../domain/instructions'
import type { NgonNgu } from '../../services/tuyChonRepo'
import {
  CHUNG_EN,
  DANH_SACH_DOI_EN,
  NGON_NGU_EN,
  NHAN_CHI_THI_EN,
  NHAN_VI_TRI_EN,
  XOA_DOI_EN,
} from './en'
import type { BanDich } from './kieu'
import type { NhanChiThi } from './vi'
import {
  CHUNG_VI,
  DANH_SACH_DOI_VI,
  NGON_NGU_VI,
  NHAN_CHI_THI_VI,
  NHAN_VI_TRI_VI,
  XOA_DOI_VI,
} from './vi'

/*
  Lớp tra cứu ngôn ngữ (hiến pháp P8, quyết định D65–D67).

  KHÔNG dùng thư viện i18n, và đó là một quyết định có lý do: thư viện tra
  bằng chuỗi khoá — `t('chung.huy')` — nên gõ sai khoá chỉ lộ ra lúc chạy,
  dưới dạng một nhãn trống trên màn hình người dùng. Giữ object TypeScript
  thì gõ sai khoá là lỗi biên dịch. P8 đòi "thiếu bản dịch phải lộ ra lúc
  phát triển", và đây là cách rẻ nhất để làm đúng điều đó.
*/

/** Toàn bộ chữ của một ngôn ngữ. Mỗi khối là một khối cũ của `strings.ts`. */
export interface BoChuoi {
  readonly CHUNG: BanDich<typeof CHUNG_VI>
  readonly NGON_NGU: BanDich<typeof NGON_NGU_VI>
  readonly DANH_SACH_DOI: BanDich<typeof DANH_SACH_DOI_VI>
  readonly XOA_DOI: BanDich<typeof XOA_DOI_VI>
  readonly NHAN_VI_TRI: typeof NHAN_VI_TRI_VI
  readonly NHAN_CHI_THI: NhanChiThi
}

const VI: BoChuoi = {
  CHUNG: CHUNG_VI,
  NGON_NGU: NGON_NGU_VI,
  DANH_SACH_DOI: DANH_SACH_DOI_VI,
  XOA_DOI: XOA_DOI_VI,
  NHAN_VI_TRI: NHAN_VI_TRI_VI,
  NHAN_CHI_THI: NHAN_CHI_THI_VI,
}
const EN: BoChuoi = {
  CHUNG: CHUNG_EN,
  NGON_NGU: NGON_NGU_EN,
  DANH_SACH_DOI: DANH_SACH_DOI_EN,
  XOA_DOI: XOA_DOI_EN,
  NHAN_VI_TRI: NHAN_VI_TRI_EN,
  NHAN_CHI_THI: NHAN_CHI_THI_EN,
}

export const BO_CHUOI: Readonly<Record<NgonNgu, BoChuoi>> = { vi: VI, en: EN }

/*
  Tra nhãn của MỘT mức thuộc MỘT chỉ thị.

  Cần một hàm riêng vì TypeScript không nối được hai union tương ứng: trong
  một vòng lặp trên `ChiThiId`, `id` là cả union, nên `bang[id].cacMuc` thành
  union của sáu object có khoá khác nhau và không index được bằng mức.

  Ép kiểu MỘT lần ở đây, không rải `as` khắp component. An toàn vì bảng nhãn
  khai kiểu `NhanChiThi` — mọi mức của mọi chỉ thị đã được kiểm đủ lúc biên
  dịch, nên phép tra này không thể trượt.
*/
export function nhanMucChiThi(
  bang: NhanChiThi,
  id: ChiThiId,
  muc: string,
): { readonly ten: string; readonly danhDoi: string } {
  const cacMuc = bang[id].cacMuc as Record<
    string,
    { readonly ten: string; readonly danhDoi: string }
  >
  return cacMuc[muc]
}

export function layBoChuoi(ngonNgu: NgonNgu): BoChuoi {
  return BO_CHUOI[ngonNgu]
}
