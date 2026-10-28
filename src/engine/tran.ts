import type { Tactic } from '../domain/types'
import { chayChuoiBong, type KetQuaChuoi } from './chuoiBong'
import { taoRngTuHatGiong, hatGiongTuMaTran, type RngCoTrangThai } from './rng'
import {
  chonSuKien,
  SO_DONG_TOI_DA,
  type BenDoi,
  type LoaiSuKien,
  type SuKien,
  type TiSo,
  type UngVienSuKien,
} from './suKien'
import { laDaiCao, layVung, type VungSan } from './vung'

/*
  Máy trạng thái trận đấu.

  `buocTiep` là HÀM THUẦN: hạt giống của nguồn ngẫu nhiên nằm trong
  `TrangThaiTran`, không trong một closure sống bên ngoài. Gọi hai lần trên
  cùng một trạng thái ra hai kết quả giống hệt — xem ghi chú (1) ở plan mục
  III.4. Đây là điều kiện để tạm dừng, đổi tốc độ và phát lại cùng hoạt động
  mà không ai phải cẩn thận.

  Giai đoạn này chuỗi bóng chạy bằng xác suất phẳng; sức mạnh cầu thủ, thể
  lực, thẻ và chỉ thị được nối vào ở T077.
*/

export interface DangKyBen {
  readonly teamId: string
  readonly chienThuatXuatPhat: Tactic
  /** 11 cầu thủ chính. */
  readonly trenSan: readonly string[]
  /** 7 cầu thủ dự bị. */
  readonly duBi: readonly string[]
}

export interface CauHinhTran {
  readonly maTran: string
  readonly nha: DangKyBen
  readonly khach: DangKyBen
  /** true thì tắt hoàn toàn lợi thế sân nhà (AC-8.14). */
  readonly sanTrungLap: boolean
}

export interface ThongKeBen {
  readonly cuSut: number
  readonly sutTrungDich: number
  readonly tatCanh: number
  readonly coHoiRoRang: number
  readonly cuopBongDaiCao: number
  readonly biThoatXuong: number
  readonly theVang: number
  readonly theDo: number
  readonly dongGopTheoCauThu: Readonly<Record<string, number>>
}

export interface BenTran {
  readonly teamId: string
  /** BẤT BIẾN — một vế của đầu vào phát lại (P1). */
  readonly chienThuatXuatPhat: Tactic
  /** Đổi theo can thiệp giữa trận. */
  readonly chienThuatHienTai: Tactic
  /** 11 playerId lúc bắt đầu, giảm dần khi có thẻ đỏ. */
  readonly trenSan: readonly string[]
  readonly duBi: readonly string[]
  readonly theLuc: Readonly<Record<string, number>>
  readonly the: Readonly<Record<string, 'vang' | 'vang-vang' | 'do'>>
  readonly soLanThay: number
  readonly mauAoDangDung: 'chinh' | 'phu'
  readonly thongKe: ThongKeBen
}

export interface CanThiep {
  readonly phut: number
  readonly doi: BenDoi
  readonly loai: 'thay-nguoi' | 'doi-chi-thi' | 'doi-vai-tro'
  readonly chiTiet: unknown
}

export interface TrangThaiTran {
  readonly maTran: string
  /** Trạng thái 32-bit của nguồn ngẫu nhiên — xem ghi chú (1) plan III.4. */
  readonly hatGiong: number
  /** Phút đã chạy, 1..tổng số phút của trận. */
  readonly phut: number
  readonly buGio: { readonly hiep1: number; readonly hiep2: number }
  readonly tiSo: TiSo
  readonly ben: { readonly nha: BenTran; readonly khach: BenTran }
  /** Ứng viên sự kiện, chưa qua bước chọn mật độ. */
  readonly ungVien: readonly UngVienSuKien[]
  readonly canThiep: readonly CanThiep[]
  /** Hàng đợi, áp vào đầu phút kế tiếp (D30b). */
  readonly canThiepChoAp: readonly CanThiep[]
  readonly ketThuc: boolean
}

export const PHUT_MOI_HIEP = 45
export const BU_GIO_TOI_THIEU = 1
export const BU_GIO_TOI_DA = 5
/** Số chuỗi kiểm soát bóng mô phỏng trong một phút. */
export const SO_CHUOI_MOI_PHUT = 3
/** Dưới mức này thì tình huống không đáng vào dòng tường thuật. */
export const NGUONG_DANG_KE = 2

const THONG_KE_RONG: ThongKeBen = {
  cuSut: 0,
  sutTrungDich: 0,
  tatCanh: 0,
  coHoiRoRang: 0,
  cuopBongDaiCao: 0,
  biThoatXuong: 0,
  theVang: 0,
  theDo: 0,
  dongGopTheoCauThu: {},
}

function taoBen(dangKy: DangKyBen): BenTran {
  const theLuc: Record<string, number> = {}
  for (const id of [...dangKy.trenSan, ...dangKy.duBi]) {
    theLuc[id] = 100
  }

  return {
    teamId: dangKy.teamId,
    chienThuatXuatPhat: dangKy.chienThuatXuatPhat,
    chienThuatHienTai: dangKy.chienThuatXuatPhat,
    trenSan: [...dangKy.trenSan],
    duBi: [...dangKy.duBi],
    theLuc,
    the: {},
    soLanThay: 0,
    mauAoDangDung: 'chinh',
    thongKe: THONG_KE_RONG,
  }
}

/** Tổng số phút của hiệp 1, kể cả bù giờ. */
export function tongPhutHiep1(tt: TrangThaiTran): number {
  return PHUT_MOI_HIEP + tt.buGio.hiep1
}

/** Tổng số phút cả trận, kể cả bù giờ hai hiệp. */
export function tongPhutTran(tt: TrangThaiTran): number {
  return PHUT_MOI_HIEP * 2 + tt.buGio.hiep1 + tt.buGio.hiep2
}

export function hiepCuaPhut(tt: TrangThaiTran, phut: number): 1 | 2 {
  return phut <= tongPhutHiep1(tt) ? 1 : 2
}

/**
 * Phút hiển thị cho người xem: hiệp 1 chạy 1..45 rồi 45+1..45+bù; hiệp 2
 * chạy 46..90 rồi 90+1..90+bù. Phút bù giờ của hiệp 1 không được đẩy hiệp 2
 * lên quá 90.
 */
export function phutHienThi(
  tt: TrangThaiTran,
  phut: number,
): { readonly phut: number; readonly buGio: boolean } {
  if (hiepCuaPhut(tt, phut) === 1) {
    return { phut, buGio: phut > PHUT_MOI_HIEP }
  }
  const p = phut - tt.buGio.hiep1
  return { phut: p, buGio: p > PHUT_MOI_HIEP * 2 }
}

function buGioNgauNhien(rng: RngCoTrangThai): number {
  const khoang = BU_GIO_TOI_DA - BU_GIO_TOI_THIEU + 1
  return BU_GIO_TOI_THIEU + Math.floor(rng.next() * khoang)
}

/** Tạo trận ở phút 0. Bù giờ hai hiệp được chốt ngay tại đây (AC-8.1). */
export function taoTran(cauHinh: CauHinhTran): TrangThaiTran {
  const rng = taoRngTuHatGiong(hatGiongTuMaTran(cauHinh.maTran))
  const hiep1 = buGioNgauNhien(rng)
  const hiep2 = buGioNgauNhien(rng)

  const tt: TrangThaiTran = {
    maTran: cauHinh.maTran,
    hatGiong: rng.hatGiong(),
    phut: 0,
    buGio: { hiep1, hiep2 },
    tiSo: { nha: 0, khach: 0 },
    ben: { nha: taoBen(cauHinh.nha), khach: taoBen(cauHinh.khach) },
    ungVien: [],
    canThiep: [],
    canThiepChoAp: [],
    ketThuc: false,
  }

  return {
    ...tt,
    ungVien: [taoUngVien(tt, 0, 'bat-dau', 'nha', [], null, 0, 100)],
  }
}

function taoUngVien(
  tt: TrangThaiTran,
  phut: number,
  loai: LoaiSuKien,
  doi: BenDoi,
  cacCauThu: readonly string[],
  vung: VungSan | null,
  mauCau: number,
  diemDangKe: number,
): UngVienSuKien {
  const ht = phut === 0 ? { phut: 0, buGio: false } : phutHienThi(tt, phut)
  return {
    suKien: {
      phut: ht.phut,
      buGio: ht.buGio,
      loai,
      doi,
      cacCauThu,
      vung,
      mauCau,
      tiSoSauDo: tt.tiSo,
    },
    diemDangKe,
  }
}

/** Điểm đáng kể của một kết cục chuỗi bóng — dùng cho bước chọn mật độ. */
function diemCuaChuoi(kq: KetQuaChuoi, coBan: boolean): number {
  if (coBan) return 100
  switch (kq.ketCuc) {
    case 'dut-diem':
      return 6
    case 'pham-loi':
      return 3
    case 'bong-ra-ngoai':
      return 1
    case 'mat-bong':
      return laDaiCao(kq.vungKetThuc) ? 4 : 1
  }
}

function loaiCuaChuoi(kq: KetQuaChuoi, coBan: boolean): LoaiSuKien {
  if (coBan) return 'ban-thang'
  if (kq.ketCuc === 'dut-diem') return 'co-hoi'
  if (kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc)) {
    return 'cuop-bong-cao'
  }
  if (kq.cacHanhDong.some((h) => h.loai === 'tat-canh')) return 'tat-canh'
  return 'mat-bong'
}

function congThongKe(
  ben: BenTran,
  kq: KetQuaChuoi,
  coBan: boolean,
  nguoiKetThuc: string,
): BenTran {
  const tk = ben.thongKe
  const soTat = kq.cacHanhDong.filter((h) => h.loai === 'tat-canh').length
  const coSut = kq.ketCuc === 'dut-diem'

  return {
    ...ben,
    thongKe: {
      ...tk,
      cuSut: tk.cuSut + (coSut ? 1 : 0),
      sutTrungDich: tk.sutTrungDich + (coBan ? 1 : 0),
      tatCanh: tk.tatCanh + soTat,
      coHoiRoRang: tk.coHoiRoRang + (coSut ? 1 : 0),
      dongGopTheoCauThu: {
        ...tk.dongGopTheoCauThu,
        [nguoiKetThuc]:
          (tk.dongGopTheoCauThu[nguoiKetThuc] ?? 0) +
          diemCuaChuoi(kq, coBan),
      },
    },
  }
}

function congBiThoatXuong(ben: BenTran): BenTran {
  return {
    ...ben,
    thongKe: {
      ...ben.thongKe,
      biThoatXuong: ben.thongKe.biThoatXuong + 1,
    },
  }
}

function congCuopBongDaiCao(ben: BenTran): BenTran {
  return {
    ...ben,
    thongKe: {
      ...ben.thongKe,
      cuopBongDaiCao: ben.thongKe.cuopBongDaiCao + 1,
    },
  }
}

function chonCauThu(ben: BenTran, rng: RngCoTrangThai): string {
  const i = Math.min(
    Math.floor(rng.next() * ben.trenSan.length),
    ben.trenSan.length - 1,
  )
  return ben.trenSan[i]
}

/**
 * Tiến đúng một phút. Hàm THUẦN — cùng trạng thái vào luôn cho cùng trạng
 * thái ra, vì hạt giống đi theo trạng thái.
 */
export function buocTiep(tt: TrangThaiTran): TrangThaiTran {
  if (tt.ketThuc) return tt

  const rng = taoRngTuHatGiong(tt.hatGiong)
  const phut = tt.phut + 1
  const tong = tongPhutTran(tt)

  let tiSo = tt.tiSo
  let benNha = tt.ben.nha
  let benKhach = tt.ben.khach
  const ungVienMoi: UngVienSuKien[] = []

  for (let i = 0; i < SO_CHUOI_MOI_PHUT; i += 1) {
    const doi: BenDoi = rng.next() < 0.5 ? 'nha' : 'khach'
    const benCong = doi === 'nha' ? benNha : benKhach
    const benThu = doi === 'nha' ? benKhach : benNha

    const vungBatDau = layVung('giua', 1)
    const kq = chayChuoiBong(vungBatDau, rng)
    const nguoi = chonCauThu(benCong, rng)

    const coBan = kq.ketCuc === 'dut-diem' && rng.next() < 0.28
    if (coBan) {
      tiSo =
        doi === 'nha'
          ? { nha: tiSo.nha + 1, khach: tiSo.khach }
          : { nha: tiSo.nha, khach: tiSo.khach + 1 }
    }

    let benCongMoi = congThongKe(benCong, kq, coBan, nguoi)
    let benThuMoi = benThu
    if (kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc)) {
      benThuMoi = congCuopBongDaiCao(benThuMoi)
    }
    if (kq.ketCuc === 'dut-diem') {
      benThuMoi = congBiThoatXuong(benThuMoi)
    }

    if (doi === 'nha') {
      benNha = benCongMoi
      benKhach = benThuMoi
    } else {
      benKhach = benCongMoi
      benNha = benThuMoi
    }

    const trangThaiTamThoi: TrangThaiTran = { ...tt, tiSo }
    ungVienMoi.push(
      taoUngVien(
        trangThaiTamThoi,
        phut,
        loaiCuaChuoi(kq, coBan),
        doi,
        [nguoi],
        kq.vungKetThuc,
        Math.floor(rng.next() * 1000),
        diemCuaChuoi(kq, coBan),
      ),
    )
  }

  const sauTt: TrangThaiTran = {
    ...tt,
    hatGiong: rng.hatGiong(),
    phut,
    tiSo,
    ben: { nha: benNha, khach: benKhach },
    ungVien: [...tt.ungVien, ...gomUngVienCuaPhut(ungVienMoi)],
    ketThuc: phut >= tong,
  }

  const mocHiep: UngVienSuKien[] = []
  if (phut === tongPhutHiep1(tt)) {
    mocHiep.push(taoUngVien(sauTt, phut, 'het-hiep', 'nha', [], null, 0, 100))
  }
  if (sauTt.ketThuc) {
    mocHiep.push(taoUngVien(sauTt, phut, 'ket-thuc', 'nha', [], null, 0, 100))
  }

  return mocHiep.length === 0
    ? sauTt
    : { ...sauTt, ungVien: [...sauTt.ungVien, ...mocHiep] }
}

/**
 * Giữ lại tình huống đáng kể nhất của phút, cộng mọi tình huống bắt buộc.
 * Nếu phát hết mọi chuỗi thì một trận có vài trăm dòng — AC-8.15 nói rõ chỉ
 * ghi những tình huống có ý nghĩa.
 */
function gomUngVienCuaPhut(
  cacUngVien: readonly UngVienSuKien[],
): readonly UngVienSuKien[] {
  const batBuoc = cacUngVien.filter((uv) => uv.suKien.loai === 'ban-thang')
  const conLai = cacUngVien.filter((uv) => uv.suKien.loai !== 'ban-thang')

  let tot: UngVienSuKien | null = null
  for (const uv of conLai) {
    if (uv.diemDangKe < NGUONG_DANG_KE) continue
    if (!tot || uv.diemDangKe > tot.diemDangKe) tot = uv
  }

  return tot ? [...batBuoc, tot] : batBuoc
}

/** Chạy tới hết trận. Dùng cho chế độ "chạy hết trận ngay" (AC-9.4). */
export function chayHetTran(tt: TrangThaiTran): TrangThaiTran {
  let hienTai = tt
  const chanCung = tongPhutTran(tt) + 2
  for (let i = 0; i < chanCung && !hienTai.ketThuc; i += 1) {
    hienTai = buocTiep(hienTai)
  }
  return hienTai
}

/** Dòng sự kiện để hiển thị — đã qua bước chọn mật độ (AC-8.15). */
export function dongSuKien(tt: TrangThaiTran): readonly SuKien[] {
  return chonSuKien(tt.ungVien)
}

export { SO_DONG_TOI_DA }
