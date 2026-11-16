import type { ChiThiId } from '../../domain/instructions'
import type { NgonNgu } from '../../services/tuyChonRepo'
import {
  CHUNG_EN,
  DANH_SACH_DOI_EN,
  NGON_NGU_EN,
  CHE_DO_EN,
  DINH_DANG_EN,
  CANH_BAO_XUNG_DOT_EN,
  MUC_SAI_VI_TRI_EN,
  TRANG_CHIEN_THUAT_EN,
  SAI_VI_TRI_EN,
  TINH_TRANG_DOI_HINH_EN,
  DOI_SO_DO_EN,
  VAI_TRO_EN,
  CHI_THI_DOI_EN,
  BO_CHIEN_THUAT_EN,
  CHON_CAP_DAU_EN,
  DANG_KY_DOI_HINH_EN,
  LY_DO_KHONG_BAT_DAU_EN,
  TRAN_DAU_EN,
  THAY_NGUOI_EN,
  CAN_THIEP_GIUA_TRAN_EN,
  BAO_CAO_SAU_TRAN_EN,
  VAO_BAT_GON_EN,
  SO_SANH_TRAN_EN,
  SAN_2D_EN,
  SAO_LUU_EN,
  LUU_TRU_EN,
  LICH_SU_EN,
  LY_DO_TU_CHOI_CAN_THIEP_EN,
  LOI_EN,
  FORM_DOI_EN,
  TRANG_DOI_EN,
  XOA_CAU_THU_EN,
  CHAN_THUAN_EN,
  CHON_ANH_EN,
  CHON_MAU_AO_EN,
  BANG_CHI_SO_EN,
  FORM_CAU_THU_EN,
  NHAN_CHI_SO_EN,
  NHAN_MUC_DO_EN,
  NHAN_CHI_THI_EN,
  NHAN_VAI_TRO_EN,
  NHAN_VI_TRI_EN,
  XOA_DOI_EN,
} from './en'
import type { BanDich } from './kieu'
import type { NhanChiThi } from './vi'
import {
  CHUNG_VI,
  DANH_SACH_DOI_VI,
  NGON_NGU_VI,
  CHE_DO_VI,
  DINH_DANG_VI,
  CANH_BAO_XUNG_DOT_VI,
  TEN_SO_DO_VI,
  MUC_SAI_VI_TRI_VI,
  TRANG_CHIEN_THUAT_VI,
  SAI_VI_TRI_VI,
  TINH_TRANG_DOI_HINH_VI,
  DOI_SO_DO_VI,
  VAI_TRO_VI,
  CHI_THI_DOI_VI,
  BO_CHIEN_THUAT_VI,
  CHON_CAP_DAU_VI,
  DANG_KY_DOI_HINH_VI,
  LY_DO_KHONG_BAT_DAU_VI,
  TRAN_DAU_VI,
  THAY_NGUOI_VI,
  CAN_THIEP_GIUA_TRAN_VI,
  BAO_CAO_SAU_TRAN_VI,
  VAO_BAT_GON_VI,
  SO_SANH_TRAN_VI,
  SAN_2D_VI,
  SAO_LUU_VI,
  LUU_TRU_VI,
  LICH_SU_VI,
  LY_DO_TU_CHOI_CAN_THIEP_VI,
  LOI_VI,
  FORM_DOI_VI,
  TRANG_DOI_VI,
  XOA_CAU_THU_VI,
  CHAN_THUAN_VI,
  CHON_ANH_VI,
  CHON_MAU_AO_VI,
  BANG_CHI_SO_VI,
  FORM_CAU_THU_VI,
  NHAN_CHI_SO_VI,
  NHAN_MUC_DO_VI,
  NHAN_CHI_THI_VI,
  NHAN_VAI_TRO_VI,
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
  readonly CHE_DO: BanDich<typeof CHE_DO_VI>
  readonly DINH_DANG: BanDich<typeof DINH_DANG_VI>
  readonly DANH_SACH_DOI: BanDich<typeof DANH_SACH_DOI_VI>
  readonly XOA_DOI: BanDich<typeof XOA_DOI_VI>
  readonly NHAN_VI_TRI: typeof NHAN_VI_TRI_VI
  readonly NHAN_CHI_THI: NhanChiThi
  readonly NHAN_VAI_TRO: typeof NHAN_VAI_TRO_VI
  readonly NHAN_CHI_SO: typeof NHAN_CHI_SO_VI
  readonly NHAN_MUC_DO: typeof NHAN_MUC_DO_VI
  readonly CANH_BAO_XUNG_DOT: typeof CANH_BAO_XUNG_DOT_VI
  readonly TEN_SO_DO: typeof TEN_SO_DO_VI
  readonly MUC_SAI_VI_TRI: BanDich<typeof MUC_SAI_VI_TRI_VI>
  readonly TRANG_CHIEN_THUAT: BanDich<typeof TRANG_CHIEN_THUAT_VI>
  readonly SAI_VI_TRI: BanDich<typeof SAI_VI_TRI_VI>
  readonly TINH_TRANG_DOI_HINH: BanDich<typeof TINH_TRANG_DOI_HINH_VI>
  readonly DOI_SO_DO: BanDich<typeof DOI_SO_DO_VI>
  readonly VAI_TRO: BanDich<typeof VAI_TRO_VI>
  readonly CHI_THI_DOI: BanDich<typeof CHI_THI_DOI_VI>
  readonly BO_CHIEN_THUAT: BanDich<typeof BO_CHIEN_THUAT_VI>
  readonly CHON_CAP_DAU: BanDich<typeof CHON_CAP_DAU_VI>
  readonly DANG_KY_DOI_HINH: BanDich<typeof DANG_KY_DOI_HINH_VI>
  readonly LY_DO_KHONG_BAT_DAU: BanDich<typeof LY_DO_KHONG_BAT_DAU_VI>
  readonly TRAN_DAU: BanDich<typeof TRAN_DAU_VI>
  readonly THAY_NGUOI: BanDich<typeof THAY_NGUOI_VI>
  readonly CAN_THIEP_GIUA_TRAN: BanDich<typeof CAN_THIEP_GIUA_TRAN_VI>
  readonly BAO_CAO_SAU_TRAN: BanDich<typeof BAO_CAO_SAU_TRAN_VI>
  readonly VAO_BAT_GON: BanDich<typeof VAO_BAT_GON_VI>
  readonly SO_SANH_TRAN: BanDich<typeof SO_SANH_TRAN_VI>
  readonly FORM_DOI: BanDich<typeof FORM_DOI_VI>
  readonly TRANG_DOI: BanDich<typeof TRANG_DOI_VI>
  readonly XOA_CAU_THU: BanDich<typeof XOA_CAU_THU_VI>
  readonly CHAN_THUAN: BanDich<typeof CHAN_THUAN_VI>
  readonly CHON_ANH: BanDich<typeof CHON_ANH_VI>
  readonly CHON_MAU_AO: BanDich<typeof CHON_MAU_AO_VI>
  readonly BANG_CHI_SO: BanDich<typeof BANG_CHI_SO_VI>
  readonly FORM_CAU_THU: BanDich<typeof FORM_CAU_THU_VI>
  readonly SAN_2D: BanDich<typeof SAN_2D_VI>
  readonly SAO_LUU: BanDich<typeof SAO_LUU_VI>
  readonly LUU_TRU: BanDich<typeof LUU_TRU_VI>
  readonly LICH_SU: BanDich<typeof LICH_SU_VI>
  readonly LY_DO_TU_CHOI_CAN_THIEP: Readonly<Record<string, string>>
  readonly LOI: BanDich<typeof LOI_VI>
}

const VI: BoChuoi = {
  CHUNG: CHUNG_VI,
  NGON_NGU: NGON_NGU_VI,
  CHE_DO: CHE_DO_VI,
  DINH_DANG: DINH_DANG_VI,
  DANH_SACH_DOI: DANH_SACH_DOI_VI,
  XOA_DOI: XOA_DOI_VI,
  NHAN_VI_TRI: NHAN_VI_TRI_VI,
  NHAN_CHI_THI: NHAN_CHI_THI_VI,
  NHAN_VAI_TRO: NHAN_VAI_TRO_VI,
  NHAN_CHI_SO: NHAN_CHI_SO_VI,
  NHAN_MUC_DO: NHAN_MUC_DO_VI,
  CANH_BAO_XUNG_DOT: CANH_BAO_XUNG_DOT_VI,
  TEN_SO_DO: TEN_SO_DO_VI,
  MUC_SAI_VI_TRI: MUC_SAI_VI_TRI_VI,
  TRANG_CHIEN_THUAT: TRANG_CHIEN_THUAT_VI,
  SAI_VI_TRI: SAI_VI_TRI_VI,
  TINH_TRANG_DOI_HINH: TINH_TRANG_DOI_HINH_VI,
  DOI_SO_DO: DOI_SO_DO_VI,
  VAI_TRO: VAI_TRO_VI,
  CHI_THI_DOI: CHI_THI_DOI_VI,
  BO_CHIEN_THUAT: BO_CHIEN_THUAT_VI,
  CHON_CAP_DAU: CHON_CAP_DAU_VI,
  DANG_KY_DOI_HINH: DANG_KY_DOI_HINH_VI,
  LY_DO_KHONG_BAT_DAU: LY_DO_KHONG_BAT_DAU_VI,
  TRAN_DAU: TRAN_DAU_VI,
  THAY_NGUOI: THAY_NGUOI_VI,
  CAN_THIEP_GIUA_TRAN: CAN_THIEP_GIUA_TRAN_VI,
  BAO_CAO_SAU_TRAN: BAO_CAO_SAU_TRAN_VI,
  VAO_BAT_GON: VAO_BAT_GON_VI,
  SO_SANH_TRAN: SO_SANH_TRAN_VI,
  FORM_DOI: FORM_DOI_VI,
  TRANG_DOI: TRANG_DOI_VI,
  XOA_CAU_THU: XOA_CAU_THU_VI,
  CHAN_THUAN: CHAN_THUAN_VI,
  CHON_ANH: CHON_ANH_VI,
  CHON_MAU_AO: CHON_MAU_AO_VI,
  BANG_CHI_SO: BANG_CHI_SO_VI,
  FORM_CAU_THU: FORM_CAU_THU_VI,
  SAN_2D: SAN_2D_VI,
  SAO_LUU: SAO_LUU_VI,
  LUU_TRU: LUU_TRU_VI,
  LICH_SU: LICH_SU_VI,
  LY_DO_TU_CHOI_CAN_THIEP: LY_DO_TU_CHOI_CAN_THIEP_VI,
  LOI: LOI_VI,
}
const EN: BoChuoi = {
  CHUNG: CHUNG_EN,
  NGON_NGU: NGON_NGU_EN,
  CHE_DO: CHE_DO_EN,
  DINH_DANG: DINH_DANG_EN,
  DANH_SACH_DOI: DANH_SACH_DOI_EN,
  XOA_DOI: XOA_DOI_EN,
  NHAN_VI_TRI: NHAN_VI_TRI_EN,
  NHAN_CHI_THI: NHAN_CHI_THI_EN,
  NHAN_VAI_TRO: NHAN_VAI_TRO_EN,
  NHAN_CHI_SO: NHAN_CHI_SO_EN,
  NHAN_MUC_DO: NHAN_MUC_DO_EN,
  CANH_BAO_XUNG_DOT: CANH_BAO_XUNG_DOT_EN,
  // Tên sơ đồ là KÝ HIỆU, viết y hệt ở hai ngôn ngữ (D75) — dùng chung bảng.
  TEN_SO_DO: TEN_SO_DO_VI,
  MUC_SAI_VI_TRI: MUC_SAI_VI_TRI_EN,
  TRANG_CHIEN_THUAT: TRANG_CHIEN_THUAT_EN,
  SAI_VI_TRI: SAI_VI_TRI_EN,
  TINH_TRANG_DOI_HINH: TINH_TRANG_DOI_HINH_EN,
  DOI_SO_DO: DOI_SO_DO_EN,
  VAI_TRO: VAI_TRO_EN,
  CHI_THI_DOI: CHI_THI_DOI_EN,
  BO_CHIEN_THUAT: BO_CHIEN_THUAT_EN,
  CHON_CAP_DAU: CHON_CAP_DAU_EN,
  DANG_KY_DOI_HINH: DANG_KY_DOI_HINH_EN,
  LY_DO_KHONG_BAT_DAU: LY_DO_KHONG_BAT_DAU_EN,
  TRAN_DAU: TRAN_DAU_EN,
  THAY_NGUOI: THAY_NGUOI_EN,
  CAN_THIEP_GIUA_TRAN: CAN_THIEP_GIUA_TRAN_EN,
  BAO_CAO_SAU_TRAN: BAO_CAO_SAU_TRAN_EN,
  VAO_BAT_GON: VAO_BAT_GON_EN,
  SO_SANH_TRAN: SO_SANH_TRAN_EN,
  FORM_DOI: FORM_DOI_EN,
  TRANG_DOI: TRANG_DOI_EN,
  XOA_CAU_THU: XOA_CAU_THU_EN,
  CHAN_THUAN: CHAN_THUAN_EN,
  CHON_ANH: CHON_ANH_EN,
  CHON_MAU_AO: CHON_MAU_AO_EN,
  BANG_CHI_SO: BANG_CHI_SO_EN,
  FORM_CAU_THU: FORM_CAU_THU_EN,
  SAN_2D: SAN_2D_EN,
  SAO_LUU: SAO_LUU_EN,
  LUU_TRU: LUU_TRU_EN,
  LICH_SU: LICH_SU_EN,
  LY_DO_TU_CHOI_CAN_THIEP: LY_DO_TU_CHOI_CAN_THIEP_EN,
  LOI: LOI_EN,
}

/*
  Lớp lưới THỨ HAI của AC-22.2: dấu hiệu THẤY ĐƯỢC lúc chạy (T322).

  Lớp lưới thứ nhất — `ngonNgu.test.ts` cộng kiểu `BanDich` — chặn trước khi
  phát hành. Nhưng nó quét những khoá đã BIẾT TÊN. Hai chỗ nó không với tới:

  - **Bảng chỉ mục tra bằng dữ liệu**: `LY_DO_TU_CHOI_CAN_THIEP[lyDo]` hay
    `LICH_SU.lyDoKhongDauLai[ma]` tra bằng mã do engine/services phát ra.
    Thêm một mã mới ở lớp dưới mà quên thêm câu ở đây thì không phép kiểm
    tĩnh nào thấy.
  - **Tệp sao lưu và dữ liệu cũ**: một bản ghi lưu từ bản ứng dụng khác có
    thể mang mã mà bản này chưa biết.

  Quyết định của /clarify: KHÔNG âm thầm rơi về ngôn ngữ kia, và KHÔNG ném
  lỗi làm vỡ màn hình. Thay vào đó trả về một chuỗi đánh dấu — người dùng
  thấy ngay là chỗ ấy thiếu bản dịch, và báo lại được bằng đúng đường dẫn
  khoá ghi trong dấu ấy.

  `Proxy` chỉ chặn `get`, nên `Object.keys`, `in`, và việc duyệt khối vẫn
  y như cũ — phép kiểm của lớp lưới thứ nhất không bị lớp này che mắt.
*/
export function dauThieuBanDich(duongDan: string): string {
  return `⟨thiếu: ${duongDan}⟩`
}

function bocCanh<T extends object>(nut: T, goc: string): T {
  /*
    `Set` và hàm giữ nguyên: bọc `Set` làm `.has` mất `this`, còn hàm thì
    không ai tra khoá trên nó. Mảng cũng giữ nguyên — index ngoài biên của
    mảng là lỗi lập trình, không phải thiếu bản dịch.
  */
  if (nut instanceof Set || nut instanceof Map || Array.isArray(nut)) {
    return nut
  }

  const daBoc: Record<string, unknown> = {}
  for (const khoa of Object.keys(nut)) {
    const giaTri = (nut as Record<string, unknown>)[khoa]
    daBoc[khoa] =
      giaTri !== null && typeof giaTri === 'object'
        ? bocCanh(giaTri as object, `${goc}.${khoa}`)
        : giaTri
  }

  return new Proxy(daBoc, {
    get(dich, khoa, nhan) {
      if (typeof khoa !== 'string' || khoa in dich) {
        return Reflect.get(dich, khoa, nhan)
      }
      /*
        Khoá nội bộ của JS/React (`then`, `Symbol.toPrimitive`, `$$typeof`…)
        đi qua đường trên vì chúng không phải string hoặc đã có sẵn; chỉ
        khoá chuỗi LẠ mới thành dấu thiếu bản dịch.
      */
      return dauThieuBanDich(`${goc}.${khoa}`)
    },
  }) as T
}

function bocBoChuoi(bo: BoChuoi): BoChuoi {
  const ra: Record<string, unknown> = {}
  for (const khoi of Object.keys(bo)) {
    const giaTri = (bo as unknown as Record<string, unknown>)[khoi]
    ra[khoi] =
      giaTri !== null && typeof giaTri === 'object'
        ? bocCanh(giaTri as object, khoi)
        : giaTri
  }
  return ra as unknown as BoChuoi
}

export const BO_CHUOI: Readonly<Record<NgonNgu, BoChuoi>> = {
  vi: bocBoChuoi(VI),
  en: bocBoChuoi(EN),
}

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
