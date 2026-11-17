import type { SuKien } from '../engine/suKien'
import {
  apDungCanThiep,
  buocTiep,
  dongSuKien,
  phutHiep1,
  phutHienThi,
  taoTran,
  tongPhutTran,
  type CanThiep,
  type CauHinhTran,
  type DangKyBen,
  type TrangThaiTran,
} from '../engine/tran'
import type { BenDaLuu, TranDaLuu } from '../storage/db'

import { quanSoCua, thoiLuongCua } from './matchRepo'

/*
  Phát lại một trận đã lưu, và rẽ nhánh từ một phút bất kỳ (US-27).

  BA ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Engine không đổi một dòng** (rủi ro R33, quyết định D77). Ở đây chỉ có
     một vòng lặp gọi ba hàm thuần đã có: `taoTran` → `apDungCanThiep` →
     `buocTiep`. Thêm một API "chạy từ trạng thái" vào engine là bump
     `PHIEN_BAN_ENGINE`, và bump là tước nút đấu lại của mọi trận đã lưu.

  2. **Can thiệp phải vào ĐÚNG phút nó đã vào.** Engine xếp can thiệp vào
     hàng đợi rồi áp ở ĐẦU phút kế tiếp (D30b), nên một can thiệp lưu với
     `phut = X` phải được xếp khi đồng hồ đang ở phút X — không phải X−1,
     không phải X+1. Lệch một phút là lệch một lần rút số ngẫu nhiên, và
     dòng tường thuật sẽ khác đi từ đó tới hết trận. Đây là chỗ AC-27.2 và
     AC-27.4 sống hay chết.

  3. **Can thiệp đã lưu ở phút SAU điểm rẽ vẫn được xếp.** Không giữ chúng
     thì "không đổi gì" sẽ không ra trận cũ (AC-27.4) ngay khi trận gốc có
     một lần thay người. Cái giá là ở nhánh đã lệch, một can thiệp cũ có thể
     không còn hợp lệ — người định thay vào đã bị thẻ đỏ chẳng hạn; engine
     tự bỏ qua những can thiệp ấy (`kiemTraCanThiep` trong `apHangDoi`), nên
     vòng lặp này không phải tự đoán.
*/

/**
 * Đăng ký một bên, dựng từ bản ghi đã lưu.
 *
 * `BenDaLuu` và `DangKyBen` đang trùng hình dạng nên trả thẳng bản ghi cũng
 * biên dịch được — nhưng viết ra từng trường để ngày nào một trong hai kiểu
 * mọc thêm trường thì **trình biên dịch** nói, chứ không phải người dùng
 * phát hiện bằng một trận phát lại ra khác.
 */
function benTuBanGhi(ben: BenDaLuu): DangKyBen {
  return {
    teamId: ben.teamId,
    chienThuatXuatPhat: ben.chienThuatXuatPhat,
    trenSan: ben.trenSan,
    duBi: ben.duBi,
    cacCauThu: ben.cacCauThu,
  }
}

/**
 * Cấu hình trận, dựng lại từ một bản ghi đã lưu (AC-27.1, quyết định D78).
 *
 * `quanSoCua`/`thoiLuongCua` chứ không `?? 11`: bản ghi lưu trước spec 002
 * không có hai trường ấy, và chỗ điền mặc định chỉ được có MỘT (`matchRepo`).
 */
export function cauHinhTuBanGhi(tran: TranDaLuu): CauHinhTran {
  return {
    maTran: tran.maTran,
    nha: benTuBanGhi(tran.nha),
    khach: benTuBanGhi(tran.khach),
    quanSo: quanSoCua(tran),
    thoiLuong: thoiLuongCua(tran),
    sanTrungLap: tran.sanTrungLap,
    doiCuaNguoiDung: tran.doiCuaNguoiDung,
  }
}

/** Trạng thái phút 0 của một trận đã lưu — điểm xuất phát của mọi phép phát lại. */
export function trangThaiDauTran(tran: TranDaLuu): TrangThaiTran {
  return taoTran(cauHinhTuBanGhi(tran))
}

export const PHUT_RE_TOI_THIEU = 1

export interface KhoangPhutRe {
  readonly tu: number
  readonly den: number
}

/**
 * Khoảng phút rẽ nhánh được của một trận (AC-27.8).
 *
 * Suy từ TRẠNG THÁI chứ không từ `thoiLuong`: bù giờ hai hiệp do hạt giống
 * quyết, nên chỉ sau `taoTran` mới biết trận này thật ra dài bao nhiêu phút.
 * Phút cuối không rẽ được — rẽ ở đó thì không còn gì để chạy tiếp.
 */
export function khoangPhutRe(tt: TrangThaiTran): KhoangPhutRe {
  return {
    tu: PHUT_RE_TOI_THIEU,
    den: Math.max(PHUT_RE_TOI_THIEU, tongPhutTran(tt) - 1),
  }
}

export function phutReDuoc(tt: TrangThaiTran, phut: number): boolean {
  const k = khoangPhutRe(tt)
  return Number.isInteger(phut) && phut >= k.tu && phut <= k.den
}

export interface PhutHienThi {
  readonly phut: number
  readonly buGio: boolean
}

/**
 * Phút HIỂN THỊ của một dòng tường thuật → phút thật của đồng hồ trận.
 *
 * **Hai thứ "phút" trong ứng dụng này không phải một**, và chỗ nhập nhằng ấy
 * đúng là chỗ US-27 đi qua:
 *   - `CanThiep.phut` và `TrangThaiTran.phut` là phút ĐỒNG HỒ, đếm liên tục
 *     từ 1 tới hết, bù giờ tính luôn vào đó;
 *   - `SuKien.phut` là phút NGƯỜI DÙNG ĐỌC, tức `phutHienThi` — hiệp hai bị
 *     trừ đi bù giờ hiệp một để "46" vẫn là 46 chứ không phải 50.
 *
 * Người dùng chọn điểm rẽ bằng cách bấm một DÒNG TƯỜNG THUẬT, nên nếu lấy
 * thẳng `SuKien.phut` làm phút rẽ thì trận sẽ rẽ sớm hơn đúng số phút bù giờ
 * hiệp một — lệch tới 5 phút, và lệch một cách im lặng: dòng tường thuật vẫn
 * có vẻ hợp lý, chỉ là rẽ không đúng chỗ người dùng chỉ.
 *
 * Cặp `(phut, buGio)` phân biệt được hiệp: bù giờ hiệp một luôn hiện ở mốc
 * `floor(thoiLuong/2)` trở lên và không bao giờ vượt `thoiLuong`, còn bù giờ
 * hiệp hai luôn vượt `thoiLuong`.
 */
export function phutThucTe(tt: TrangThaiTran, hien: PhutHienThi): number {
  const moc = hien.buGio ? tt.thoiLuong : phutHiep1(tt.thoiLuong)
  return hien.phut <= moc ? hien.phut : hien.phut + tt.buGio.hiep1
}

/** Khoảng phút rẽ nhánh, nói bằng phút NGƯỜI DÙNG ĐỌC (AC-27.8). */
export function khoangPhutReHienThi(tt: TrangThaiTran): KhoangPhutRe {
  const khoang = khoangPhutRe(tt)
  return {
    tu: phutHienThi(tt, khoang.tu).phut,
    den: phutHienThi(tt, khoang.den).phut,
  }
}

/** Xếp một loạt can thiệp vào hàng đợi; cái nào engine từ chối thì bỏ qua. */
function xepHang(
  tt: TrangThaiTran,
  cac: readonly CanThiep[],
): TrangThaiTran {
  let hienTai = tt
  for (const ct of cac) {
    const kq = apDungCanThiep(hienTai, ct)
    if (kq.thanhCong) hienTai = kq.trangThai
  }
  return hienTai
}

function cuaPhut(
  cac: readonly CanThiep[],
  phut: number,
): readonly CanThiep[] {
  return cac.filter((ct) => ct.phut === phut)
}

/**
 * Vòng lặp phát lại.
 *
 * `daXepPhutDau` nói rằng can thiệp của phút hiện tại đã được xếp xong bên
 * ngoài — cần cho điểm rẽ, nơi can thiệp MỚI phải xếp SAU can thiệp cũ của
 * cùng phút ấy để quyết định mới thắng quyết định cũ.
 *
 * Chặn cứng số vòng lặp theo đúng cách `chayHetTran` làm: một trận không bao
 * giờ dài hơn tổng phút cộng hai, nên vòng lặp không thể quay vô hạn dù
 * trạng thái có bất thường thế nào.
 */
function vongLap(
  tt0: TrangThaiTran,
  canThiepDaLuu: readonly CanThiep[],
  dungTaiPhut: number | null,
  daXepPhutDau: boolean,
): TrangThaiTran {
  let tt = tt0
  const chanCung = tongPhutTran(tt0) + 2
  for (let i = 0; i < chanCung; i += 1) {
    if (tt.ketThuc) break
    if (dungTaiPhut !== null && tt.phut >= dungTaiPhut) break
    if (!(i === 0 && daXepPhutDau)) {
      tt = xepHang(tt, cuaPhut(canThiepDaLuu, tt.phut))
    }
    tt = buocTiep(tt)
  }
  return tt
}

/**
 * Phát lại tới đúng phút `phutRe` (AC-27.1, AC-27.2).
 *
 * Trả về trạng thái khi đồng hồ ở phút `phutRe`: mọi phút tới đó đã diễn ra
 * y hệt trận gốc, và can thiệp của CHÍNH phút `phutRe` thì **chưa** xếp —
 * đó là chỗ người dùng chen quyết định mới vào.
 */
export function phatLaiToiPhut(
  tt0: TrangThaiTran,
  canThiepDaLuu: readonly CanThiep[],
  phutRe: number,
): TrangThaiTran {
  return vongLap(tt0, canThiepDaLuu, phutRe, false)
}

/**
 * Chạy nốt trận từ điểm rẽ, với những can thiệp mới chen vào (AC-27.1).
 *
 * Can thiệp đã lưu của phút rẽ xếp TRƯỚC, can thiệp mới xếp SAU: hàng đợi áp
 * theo thứ tự, nên một bộ chỉ thị mới ở cùng phút sẽ ghi đè bộ cũ chứ không
 * bị bộ cũ ghi đè lại.
 */
export function chayNotTuDiemRe(
  ttTaiDiemRe: TrangThaiTran,
  canThiepDaLuu: readonly CanThiep[],
  canThiepMoi: readonly CanThiep[],
): TrangThaiTran {
  const daXep = xepHang(
    xepHang(ttTaiDiemRe, cuaPhut(canThiepDaLuu, ttTaiDiemRe.phut)),
    canThiepMoi,
  )
  return vongLap(daXep, canThiepDaLuu, null, true)
}

/**
 * Dòng tường thuật của trận nhánh (AC-27.2, AC-27.3).
 *
 * Phần tới điểm rẽ lấy NGUYÊN từ bản ghi gốc, phần sau điểm rẽ lấy từ trận
 * nhánh. Nghe như làm màu, nhưng đây là chỗ duy nhất bảo đảm được AC-27.2
 * bằng CẤU TRÚC thay vì bằng may:
 *
 * `chonSuKien` chặn trần 100 dòng bằng cách xếp hạng tình huống trên CẢ trận.
 * Nhánh sinh tình huống điểm cao khác ở phần sau, nên nó đẩy được một dòng
 * TRƯỚC điểm rẽ ra khỏi trần — và đó không phải lo xa: quét 10 mã trận × 10
 * phút rẽ tìm được `W5H4J2YD9F` rẽ ở phút 70, nơi nhánh mất **ba dòng trước
 * điểm rẽ** (65 thay vì 68) chỉ vì cả hai trận đều chạm đúng trần 100 dòng.
 * Ghép từ bản ghi gốc thì câu hỏi ấy không còn tồn tại.
 *
 * Cái giá: dòng ghép có thể dài hơn trần 100 một chút, vì nửa trước và nửa
 * sau mỗi nửa đã qua một lần lọc riêng. Đây là màn ĐỐI CHIẾU hai trận, không
 * phải tường thuật của một trận, nên trần của AC-8.15 không nói về nó.
 *
 * Tình huống ở ĐÚNG phút rẽ cũng thuộc phần gốc: can thiệp chỉ có hiệu lực
 * từ đầu phút kế tiếp (D30b), nên phút rẽ đã diễn ra xong trước khi quyết
 * định mới kịp đổi bất cứ điều gì.
 */
export function dongSuKienNhanh(
  banGhi: TranDaLuu,
  cuoiTran: TrangThaiTran,
  phutRe: number,
): readonly SuKien[] {
  const truoc = banGhi.cacSuKien.filter(
    (sk) => phutThucTe(cuoiTran, sk) <= phutRe,
  )
  const sau = dongSuKien(cuoiTran).filter(
    (sk) => phutThucTe(cuoiTran, sk) > phutRe,
  )
  return [...truoc, ...sau]
}

export type LyDoKhongRe = 'phut-ngoai-khoang'

export type KetQuaReNhanh =
  | {
      readonly reDuoc: true
      /** Trạng thái tại phút rẽ — để giao diện cho đổi quyết định. */
      readonly taiDiemRe: TrangThaiTran
      readonly cuoiTran: TrangThaiTran
      /** Dòng tường thuật ghép: tới điểm rẽ là trận gốc, sau đó là nhánh. */
      readonly cacSuKien: readonly SuKien[]
      readonly khoangPhut: KhoangPhutRe
    }
  | {
      readonly reDuoc: false
      readonly lyDo: LyDoKhongRe
      readonly khoangPhut: KhoangPhutRe
    }

/**
 * Rẽ nhánh một trận đã lưu tại phút `phutRe` (AC-27.1 → AC-27.4).
 *
 * KHÔNG ghi gì vào lưu trữ, và không nhận hàm ghi nào: kết quả trả về sống
 * trong bộ nhớ của người gọi, nên trận gốc trong lịch sử còn nguyên (AC-27.7,
 * AC-27.9, quyết định D79).
 */
export function reNhanh(
  tran: TranDaLuu,
  phutRe: number,
  canThiepMoi: readonly CanThiep[] = [],
): KetQuaReNhanh {
  const tt0 = trangThaiDauTran(tran)
  const khoangPhut = khoangPhutRe(tt0)
  if (!phutReDuoc(tt0, phutRe)) {
    return { reDuoc: false, lyDo: 'phut-ngoai-khoang', khoangPhut }
  }

  const taiDiemRe = phatLaiToiPhut(tt0, tran.canThiep, phutRe)
  const cuoiTran = chayNotTuDiemRe(taiDiemRe, tran.canThiep, canThiepMoi)
  return {
    reDuoc: true,
    taiDiemRe,
    cuoiTran,
    cacSuKien: dongSuKienNhanh(tran, cuoiTran, phutRe),
    khoangPhut,
  }
}
