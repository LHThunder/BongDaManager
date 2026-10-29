import { laySoDo } from '../domain/formations'
import { kiemTraBatDauDuoc, LoiCauHinhTran } from './batDau'
import { laThuMonThucThu } from '../domain/misplacement'
import { vaiTroApDungDuoc, type RoleId } from '../domain/roles'
import type { PositionId, Tactic } from '../domain/types'
import type { BoChiThi } from '../domain/instructions'
import { heSoCuaBo, type HeSoChiThi } from './chiThi'
import { chayChuoiBong, type KetQuaChuoi } from './chuoiBong'
import { hatGiongTuMaTran, taoRngTuHatGiong, type RngCoTrangThai } from './rng'
import { sucManhCauThu, type HoSoCauThu } from './sucManh'
import {
  chonSuKien,
  SO_DONG_TOI_DA,
  SO_DONG_TOI_THIEU,
  type BenDoi,
  type LoaiSuKien,
  type SuKien,
  type TiSo,
  type UngVienSuKien,
} from './suKien'
import {
  laLoiNghiemTrong,
  daRoiSanVivThe,
  rutThe,
  xacSuatAnThe,
  type TheDaNhan,
} from './the'
import {
  daKietSuc,
  THE_LUC_DAY,
  theLucSauMotPhut,
  type MucPressing,
} from './theLuc'
import { laDaiCao, layVung, type VungSan } from './vung'

/*
  Máy trạng thái trận đấu.

  `buocTiep` là HÀM THUẦN: hạt giống của nguồn ngẫu nhiên nằm trong
  `TrangThaiTran`, không trong một closure sống bên ngoài. Gọi hai lần trên
  cùng một trạng thái ra hai kết quả giống hệt — ghi chú (1) ở plan III.4.
*/

export interface DangKyBen {
  readonly teamId: string
  readonly chienThuatXuatPhat: Tactic
  /** 11 cầu thủ chính. */
  readonly trenSan: readonly string[]
  /** 7 cầu thủ dự bị. */
  readonly duBi: readonly string[]
  /** Hồ sơ của cả 18 người, để tính sức mạnh và thể lực. */
  readonly cacCauThu: readonly HoSoCauThu[]
}

export interface CauHinhTran {
  readonly maTran: string
  readonly nha: DangKyBen
  readonly khach: DangKyBen
  /** true thì tắt hoàn toàn lợi thế sân nhà (AC-8.14). */
  readonly sanTrungLap: boolean
  /**
   * Bên mà người dùng điều khiển; chỉ bên này can thiệp được giữa trận
   * (AC-9.8). Không khai thì mặc định là đội chủ nhà.
   */
  readonly doiCuaNguoiDung?: BenDoi
}

export interface ThongKeBen {
  readonly cuSut: number
  /**
   * Tổng số bước chuỗi bóng của bên này, dùng để tính tỉ lệ kiểm soát bóng
   * (AC-11.2, quyết định D36). Đếm theo BƯỚC chứ không theo số chuỗi: bên
   * cầm bóng mỗi chuỗi do một lần tung đồng xu quyết, nên tỉ lệ số chuỗi
   * luôn xấp xỉ 50/50 bất kể chiến thuật — con số in cho người dùng sẽ vô
   * nghĩa. Đếm theo bước thì hệ số `giuBong` của chỉ thị hiện ra đúng chỗ.
   */
  readonly soBuocGiuBong: number
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
  readonly cacCauThu: readonly HoSoCauThu[]
  readonly theLuc: Readonly<Record<string, number>>
  readonly the: Readonly<Record<string, TheDaNhan>>
  readonly daBaoKietSuc: readonly string[]
  readonly soLanThay: number
  readonly mauAoDangDung: 'chinh' | 'phu'
  readonly thongKe: ThongKeBen
}

export interface ThayNguoi {
  readonly loai: 'thay-nguoi'
  readonly ra: string
  readonly vao: string
}

export interface DoiChiThi {
  readonly loai: 'doi-chi-thi'
  readonly chiThi: BoChiThi
}

export interface VaoBatGon {
  readonly loai: 'vao-bat-gon'
  readonly playerId: string
}

export interface DoiVaiTro {
  readonly loai: 'doi-vai-tro'
  readonly slotId: string
  readonly roleId: RoleId
}

export type NoiDungCanThiep =
  | ThayNguoi
  | DoiChiThi
  | DoiVaiTro
  | VaoBatGon

export interface CanThiep {
  readonly phut: number
  readonly doi: BenDoi
  readonly noiDung: NoiDungCanThiep
}

export type LyDoTuChoiCanThiep =
  | 'tran-da-ket-thuc'
  | 'khong-phai-doi-cua-ban'
  | 'het-luot-thay'
  | 'cau-thu-khong-tren-san'
  | 'cau-thu-khong-trong-du-bi'
  | 'da-nhan-the-do'
  | 'o-khong-ton-tai'
  | 'vai-tro-khong-phu-hop'
  | 'khung-thanh-da-co-thu-mon'
  | 'cau-thu-da-bat-gon'

export interface TrangThaiTran {
  readonly maTran: string
  /** Trạng thái 32-bit của nguồn ngẫu nhiên — ghi chú (1) plan III.4. */
  readonly hatGiong: number
  readonly phut: number
  readonly buGio: { readonly hiep1: number; readonly hiep2: number }
  readonly sanTrungLap: boolean
  /** Bên mà người dùng điều khiển; chỉ bên này can thiệp được (AC-9.8). */
  readonly doiCuaNguoiDung: BenDoi
  readonly tiSo: TiSo
  readonly ben: { readonly nha: BenTran; readonly khach: BenTran }
  readonly ungVien: readonly UngVienSuKien[]
  readonly canThiep: readonly CanThiep[]
  /** Hàng đợi, áp vào đầu phút kế tiếp (D30b). */
  readonly canThiepChoAp: readonly CanThiep[]
  readonly ketThuc: boolean
}

export const PHUT_MOI_HIEP = 45
export const BU_GIO_TOI_THIEU = 1
export const BU_GIO_TOI_DA = 5
export const SO_CHUOI_MOI_PHUT = 3
export const NGUONG_DANG_KE = 2

const THONG_KE_RONG: ThongKeBen = {
  cuSut: 0,
  soBuocGiuBong: 0,
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
    theLuc[id] = THE_LUC_DAY
  }

  return {
    teamId: dangKy.teamId,
    chienThuatXuatPhat: dangKy.chienThuatXuatPhat,
    chienThuatHienTai: dangKy.chienThuatXuatPhat,
    trenSan: [...dangKy.trenSan],
    duBi: [...dangKy.duBi],
    cacCauThu: [...dangKy.cacCauThu],
    theLuc,
    the: {},
    daBaoKietSuc: [],
    soLanThay: 0,
    mauAoDangDung: 'chinh',
    thongKe: THONG_KE_RONG,
  }
}

export function tongPhutHiep1(tt: TrangThaiTran): number {
  return PHUT_MOI_HIEP + tt.buGio.hiep1
}

export function tongPhutTran(tt: TrangThaiTran): number {
  return PHUT_MOI_HIEP * 2 + tt.buGio.hiep1 + tt.buGio.hiep2
}

export function hiepCuaPhut(tt: TrangThaiTran, phut: number): 1 | 2 {
  return phut <= tongPhutHiep1(tt) ? 1 : 2
}

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

export function taoTran(cauHinh: CauHinhTran): TrangThaiTran {
  const kiemTra = kiemTraBatDauDuoc(cauHinh)
  if (!kiemTra.batDauDuoc) {
    throw new LoiCauHinhTran(kiemTra.cacLyDo)
  }

  const rng = taoRngTuHatGiong(hatGiongTuMaTran(cauHinh.maTran))
  const hiep1 = buGioNgauNhien(rng)
  const hiep2 = buGioNgauNhien(rng)

  // Rút mẫu câu TRƯỚC khi cất hạt giống: hạt giống phải phản ánh mọi lần đã
  // rút, nếu không thì phút đầu tiên sẽ rút lại đúng con số vừa dùng.
  const mauCauKhaiCuoc = Math.floor(rng.next() * 1000)

  const tt: TrangThaiTran = {
    maTran: cauHinh.maTran,
    hatGiong: rng.hatGiong(),
    phut: 0,
    buGio: { hiep1, hiep2 },
    sanTrungLap: cauHinh.sanTrungLap,
    doiCuaNguoiDung: cauHinh.doiCuaNguoiDung ?? 'nha',
    tiSo: { nha: 0, khach: 0 },
    ben: { nha: taoBen(cauHinh.nha), khach: taoBen(cauHinh.khach) },
    ungVien: [],
    canThiep: [],
    canThiepChoAp: [],
    ketThuc: false,
  }

  return {
    ...tt,
    ungVien: [
      taoUngVien(tt, 0, 'bat-dau', 'nha', [], null, mauCauKhaiCuoc, 100),
    ],
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

// ---------------------------------------------------------------------------
// Đội hình đang trên sân
// ---------------------------------------------------------------------------

interface ViTriTrenSan {
  readonly playerId: string
  readonly hoSo: HoSoCauThu
  readonly viTriO: PositionId
  readonly roleId: RoleId
}

/**
 * Ai đang đứng ở ô nào, với vai trò gì. Lấy từ `chienThuatHienTai.oVien` —
 * đó là nơi AC-6.6 đặt vai trò — và lọc theo `trenSan`, vì thẻ đỏ gỡ người ra
 * khỏi sân mà không đụng tới bộ chiến thuật.
 */
function doiHinhTrenSan(ben: BenTran): readonly ViTriTrenSan[] {
  const soDo = laySoDo(ben.chienThuatHienTai.formationId)
  const viTriTheoSlot = new Map(soDo.oVien.map((o) => [o.slotId, o.viTri]))
  const hoSoTheoId = new Map(ben.cacCauThu.map((c) => [c.id, c]))
  const dangTrenSan = new Set(ben.trenSan)

  const ra: ViTriTrenSan[] = []
  for (const o of ben.chienThuatHienTai.oVien) {
    if (o.playerId === null || !dangTrenSan.has(o.playerId)) continue
    const hoSo = hoSoTheoId.get(o.playerId)
    const viTriO = viTriTheoSlot.get(o.slotId)
    if (!hoSo || viTriO === undefined) continue
    ra.push({
      playerId: o.playerId,
      hoSo,
      viTriO,
      roleId: o.roleId,
    })
  }
  return ra
}

/** slotId của ô thủ môn trong sơ đồ đang dùng; null nếu sơ đồ không có. */
function slotThuMon(ben: BenTran): string | null {
  const o = laySoDo(ben.chienThuatHienTai.formationId).oVien.find(
    (x) => x.viTri === 'GK',
  )
  return o?.slotId ?? null
}

/**
 * Ai đang đứng trong khung thành, hay null khi khung bỏ trống (mục 5 của
 * spec: thủ môn nhận thẻ đỏ thì ô thủ môn còn tên người đã rời sân).
 *
 * Lọc theo `trenSan` vì thẻ đỏ gỡ người khỏi sân mà không đụng bộ chiến thuật.
 */
export function nguoiTrongKhung(ben: BenTran): string | null {
  const slot = slotThuMon(ben)
  if (slot === null) return null
  const o = ben.chienThuatHienTai.oVien.find((x) => x.slotId === slot)
  if (!o?.playerId || !ben.trenSan.includes(o.playerId)) return null
  return o.playerId
}

/** true khi người đang bắt gôn là thủ môn thực thụ, không phải người chữa cháy. */
export function khungThanhCoThuMon(ben: BenTran): boolean {
  const id = nguoiTrongKhung(ben)
  if (id === null) return false
  const hoSo = ben.cacCauThu.find((c) => c.id === id)
  return hoSo ? laThuMonThucThu(hoSo.positions) : false
}

function mucPressingCuaBen(ben: BenTran): MucPressing {
  return ben.chienThuatHienTai.chiThi['cuong-do-pressing']
}

interface SucManhBen {
  readonly theoCauThu: readonly { readonly id: string; readonly suc: number }[]
  readonly trungBinh: number
  readonly heSo: HeSoChiThi
}

function tinhSucManh(
  ben: BenTran,
  laChuNha: boolean,
  sanTrungLap: boolean,
): SucManhBen {
  const doiHinh = doiHinhTrenSan(ben)
  const theoCauThu = doiHinh.map((v) => ({
    id: v.playerId,
    suc: sucManhCauThu(v.hoSo, {
      viTriO: v.viTriO,
      roleId: v.roleId,
      theLuc: ben.theLuc[v.playerId] ?? THE_LUC_DAY,
      laChuNha,
      sanTrungLap,
    }),
  }))

  const tong = theoCauThu.reduce((s, x) => s + x.suc, 0)
  return {
    theoCauThu,
    trungBinh: theoCauThu.length > 0 ? tong / theoCauThu.length : 0,
    heSo: heSoCuaBo(ben.chienThuatHienTai.chiThi),
  }
}

/** Chọn người kết thúc tình huống, cân theo sức mạnh — người yếu ít được bóng hơn. */
function chonCauThuTheoSuc(sm: SucManhBen, rng: RngCoTrangThai): string | null {
  if (sm.theoCauThu.length === 0) return null

  let tong = 0
  for (const x of sm.theoCauThu) tong += x.suc + 0.05
  let moc = rng.next() * tong
  for (const x of sm.theoCauThu) {
    moc -= x.suc + 0.05
    if (moc <= 0) return x.id
  }
  return sm.theoCauThu[sm.theoCauThu.length - 1].id
}

// ---------------------------------------------------------------------------
// Thống kê
// ---------------------------------------------------------------------------

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

function loaiCuaChuoi(
  kq: KetQuaChuoi,
  coBan: boolean,
  biCuu: boolean,
): LoaiSuKien {
  if (coBan) return 'ban-thang'
  if (biCuu) return 'cuu-thua'
  if (kq.ketCuc === 'dut-diem') return 'co-hoi'
  if (kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc)) {
    return 'cuop-bong-cao'
  }
  if (kq.cacHanhDong.some((h) => h.loai === 'tat-canh')) return 'tat-canh'
  return 'mat-bong'
}

const NEN_CO_HOI_RO_RANG = 0.25
const THEO_SUC_CO_HOI_RO_RANG = 0.5

/**
 * Xác suất một cú sút không thành bàn được tính là **cơ hội rõ ràng**
 * (AC-11.2, quyết định D37). Tăng theo sức mạnh bên tấn công: đội mạnh hơn
 * không chỉ sút nhiều hơn, họ còn sút từ những tình huống rõ hơn — đó là
 * chiều mà AC-8.8 nói tới.
 */
export function xacSuatCoHoiRoRang(sucManhCong: number): number {
  const p = NEN_CO_HOI_RO_RANG + THEO_SUC_CO_HOI_RO_RANG * sucManhCong
  return Math.min(Math.max(p, 0.1), 0.85)
}

const NEN_BI_CUU = 0.3
const THEO_SUC_BI_CUU = 0.7

/**
 * Xác suất một cú sút không thành bàn bị **thủ môn cứu**, thay vì đi chệch
 * khung (AC-11.2, quyết định D38).
 *
 * `sucThuMon` là sức mạnh của người ĐANG TRONG KHUNG trong tình huống đó, nên
 * thủ môn giỏi cứu được nhiều hơn — đó là số liệu duy nhất để AC-11.3 chấm
 * điểm cho thủ môn. Khung bỏ trống (thủ môn vừa nhận thẻ đỏ mà người dùng
 * chưa chọn ai vào bắt gôn) thì không có ai cứu, nên trả về 0.
 */
export function xacSuatBiCuu(sucThuMon: number | null): number {
  if (sucThuMon === null) return 0
  const p = NEN_BI_CUU + THEO_SUC_BI_CUU * sucThuMon
  return Math.min(Math.max(p, 0.05), 0.9)
}

function congThongKeCong(
  ben: BenTran,
  kq: KetQuaChuoi,
  coBan: boolean,
  nguoiKetThuc: string | null,
  coHoiRoRang: boolean,
  biCuu: boolean,
): BenTran {
  const tk = ben.thongKe
  const soTat = kq.cacHanhDong.filter((h) => h.loai === 'tat-canh').length
  const coSut = kq.ketCuc === 'dut-diem'
  const dongGop = { ...tk.dongGopTheoCauThu }
  if (nguoiKetThuc) {
    dongGop[nguoiKetThuc] =
      (dongGop[nguoiKetThuc] ?? 0) + diemCuaChuoi(kq, coBan)
  }

  return {
    ...ben,
    thongKe: {
      ...tk,
      cuSut: tk.cuSut + (coSut ? 1 : 0),
      soBuocGiuBong: tk.soBuocGiuBong + kq.cacHanhDong.length,
      sutTrungDich: tk.sutTrungDich + (coBan || biCuu ? 1 : 0),
      tatCanh: tk.tatCanh + soTat,
      coHoiRoRang: tk.coHoiRoRang + (coHoiRoRang ? 1 : 0),
      dongGopTheoCauThu: dongGop,
    },
  }
}

function congThongKeThu(
  ben: BenTran,
  kq: KetQuaChuoi,
): BenTran {
  const tk = ben.thongKe
  const cuop =
    kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc) ? 1 : 0
  const thoat = kq.ketCuc === 'dut-diem' ? 1 : 0
  if (cuop === 0 && thoat === 0) return ben

  return {
    ...ben,
    thongKe: {
      ...tk,
      cuopBongDaiCao: tk.cuopBongDaiCao + cuop,
      biThoatXuong: tk.biThoatXuong + thoat,
    },
  }
}

// ---------------------------------------------------------------------------
// Một phút trận đấu
// ---------------------------------------------------------------------------

function giamTheLuc(ben: BenTran): BenTran {
  const muc = mucPressingCuaBen(ben)
  const hoSoTheoId = new Map(ben.cacCauThu.map((c) => [c.id, c]))
  const theLuc: Record<string, number> = { ...ben.theLuc }

  for (const id of ben.trenSan) {
    const chiSo = hoSoTheoId.get(id)?.attributes['the-luc']
    theLuc[id] = theLucSauMotPhut(theLuc[id] ?? THE_LUC_DAY, chiSo, muc)
  }

  return { ...ben, theLuc }
}

interface KetQuaThe {
  readonly ben: BenTran
  readonly playerId: string | null
  readonly theSauDo: TheDaNhan | null
  readonly roiSan: boolean
}

function thuRutThe(
  ben: BenTran,
  sm: SucManhBen,
  rng: RngCoTrangThai,
): KetQuaThe {
  const playerId = chonCauThuTheoSuc(sm, rng)
  if (!playerId) {
    return { ben, playerId: null, theSauDo: null, roiSan: false }
  }

  const hoSo = ben.cacCauThu.find((c) => c.id === playerId)
  const quyetDoan = hoSo?.attributes['quyet-doan']
  if (rng.next() >= xacSuatAnThe(quyetDoan, mucPressingCuaBen(ben))) {
    return { ben, playerId, theSauDo: null, roiSan: false }
  }

  const kq = rutThe(ben.the[playerId], laLoiNghiemTrong(rng.next()))
  const laDo = kq.theSauDo !== 'vang'

  return {
    ben: {
      ...ben,
      the: { ...ben.the, [playerId]: kq.theSauDo },
      trenSan: kq.roiSan
        ? ben.trenSan.filter((id) => id !== playerId)
        : ben.trenSan,
      thongKe: {
        ...ben.thongKe,
        theVang: ben.thongKe.theVang + (laDo ? 0 : 1),
        theDo: ben.thongKe.theDo + (laDo ? 1 : 0),
      },
    },
    playerId,
    theSauDo: kq.theSauDo,
    roiSan: kq.roiSan,
  }
}

/** Phát sự kiện kiệt sức đúng MỘT lần cho mỗi cầu thủ mỗi trận (AC-8.7). */
function moiKietSuc(ben: BenTran): readonly string[] {
  return ben.trenSan.filter(
    (id) =>
      daKietSuc(ben.theLuc[id] ?? THE_LUC_DAY) &&
      !ben.daBaoKietSuc.includes(id),
  )
}

// ---------------------------------------------------------------------------
// Can thiệp giữa trận (AC-9.5 → AC-9.8, quyết định D30 và D30b)
// ---------------------------------------------------------------------------

export type KetQuaCanThiep =
  | { readonly thanhCong: true; readonly trangThai: TrangThaiTran }
  | { readonly thanhCong: false; readonly lyDo: LyDoTuChoiCanThiep }

function benTheoDoi(tt: TrangThaiTran, doi: BenDoi): BenTran {
  return doi === 'nha' ? tt.ben.nha : tt.ben.khach
}

function datBen(
  tt: TrangThaiTran,
  doi: BenDoi,
  ben: BenTran,
): TrangThaiTran {
  return {
    ...tt,
    ben: doi === 'nha' ? { ...tt.ben, nha: ben } : { ...tt.ben, khach: ben },
  }
}

/** Kiểm một can thiệp có hợp lệ không, KHÔNG đổi gì. */
function kiemTraCanThiep(
  tt: TrangThaiTran,
  canThiep: CanThiep,
): LyDoTuChoiCanThiep | null {
  if (tt.ketThuc) return 'tran-da-ket-thuc'
  if (canThiep.doi !== tt.doiCuaNguoiDung) return 'khong-phai-doi-cua-ban'

  const ben = benTheoDoi(tt, canThiep.doi)
  const nd = canThiep.noiDung

  if (nd.loai === 'thay-nguoi') {
    if (ben.soLanThay >= SO_LAN_THAY_TOI_DA) return 'het-luot-thay'
    if (!ben.trenSan.includes(nd.ra)) return 'cau-thu-khong-tren-san'
    if (!ben.duBi.includes(nd.vao)) return 'cau-thu-khong-trong-du-bi'
    if (daRoiSanVivThe(ben.the[nd.vao])) return 'da-nhan-the-do'
    return null
  }

  if (nd.loai === 'vao-bat-gon') {
    if (!ben.trenSan.includes(nd.playerId)) return 'cau-thu-khong-tren-san'
    if (nguoiTrongKhung(ben) === nd.playerId) return 'cau-thu-da-bat-gon'
    if (khungThanhCoThuMon(ben)) return 'khung-thanh-da-co-thu-mon'
    return null
  }

  if (nd.loai === 'doi-vai-tro') {
    const soDo = laySoDo(ben.chienThuatHienTai.formationId)
    const o = soDo.oVien.find((x) => x.slotId === nd.slotId)
    if (!o) return 'o-khong-ton-tai'
    if (!vaiTroApDungDuoc(nd.roleId, o.viTri)) return 'vai-tro-khong-phu-hop'
    return null
  }

  return null
}

/** Áp một can thiệp đã qua kiểm, trả về bên đã đổi. */
function apVaoBen(ben: BenTran, noiDung: NoiDungCanThiep): BenTran {
  switch (noiDung.loai) {
    case 'thay-nguoi':
      return {
        ...ben,
        trenSan: ben.trenSan.map((id) =>
          id === noiDung.ra ? noiDung.vao : id,
        ),
        duBi: ben.duBi.filter((id) => id !== noiDung.vao),
        soLanThay: ben.soLanThay + 1,
        chienThuatHienTai: {
          ...ben.chienThuatHienTai,
          oVien: ben.chienThuatHienTai.oVien.map((o) =>
            o.playerId === noiDung.ra ? { ...o, playerId: noiDung.vao } : o,
          ),
        },
      }

    case 'doi-chi-thi':
      return {
        ...ben,
        chienThuatHienTai: {
          ...ben.chienThuatHienTai,
          chiThi: noiDung.chiThi,
        },
      }

    case 'doi-vai-tro':
      return {
        ...ben,
        chienThuatHienTai: {
          ...ben.chienThuatHienTai,
          oVien: ben.chienThuatHienTai.oVien.map((o) =>
            o.slotId === noiDung.slotId
              ? { ...o, roleId: noiDung.roleId }
              : o,
          ),
        },
      }

    /*
      Đưa một người trên sân vào bắt gôn (mục 5 của spec).

      Là một phép ĐỔI CHỖ, không phải phép gán: người đang bắt gôn — nếu còn
      trên sân — nhận lại ô của người vừa vào khung. Nhờ vậy cùng một can
      thiệp dùng được cho cả hai bước: lúc thủ môn vừa bị thẻ đỏ (khung trống,
      ô của người chữa cháy bỏ trống theo, đúng vì đội chỉ còn 10 người), và
      lúc thủ môn dự bị đã vào sân rồi cần nhận lại đôi găng.

      Không đổi `roleId` của ô: vai trò là của Ô chứ không của người (AC-6.6).
      Cầu thủ sân đứng trong khung vì thế bị trừ hai lần — nền sức mạnh tính
      theo ba chỉ số thủ môn mà họ không có, cộng mức sai vị trí `nang` —
      đúng như mục 5 đòi, và không cần thêm luật nào ở đây.
    */
    case 'vao-bat-gon': {
      const slotGon = slotThuMon(ben)
      if (slotGon === null) return ben

      const dangBat = nguoiTrongKhung(ben)
      const oCu = ben.chienThuatHienTai.oVien.find(
        (o) => o.playerId === noiDung.playerId,
      )

      return {
        ...ben,
        chienThuatHienTai: {
          ...ben.chienThuatHienTai,
          oVien: ben.chienThuatHienTai.oVien.map((o) => {
            if (o.slotId === slotGon) {
              return { ...o, playerId: noiDung.playerId }
            }
            if (oCu && o.slotId === oCu.slotId) {
              return { ...o, playerId: dangBat }
            }
            return o
          }),
        },
      }
    }
  }
}

/**
 * Xếp một can thiệp vào hàng đợi (quyết định D30b).
 *
 * KHÔNG đổi thế trận ngay: `buocTiep` áp hết hàng đợi ở ĐẦU phút kế tiếp,
 * trước khi mô phỏng phút đó. Lúc chạy trực tiếp và lúc phát lại đi qua cùng
 * một đường, nên thứ tự tiêu thụ `Rng` không bao giờ lệch — nếu áp tức thì
 * thì người dùng bấm giữa phút X còn bản phát lại áp ở đầu phút X, và dòng
 * sự kiện sẽ khác đi.
 */
export function apDungCanThiep(
  tt: TrangThaiTran,
  canThiep: CanThiep,
): KetQuaCanThiep {
  const lyDo = kiemTraCanThiep(tt, canThiep)
  if (lyDo) return { thanhCong: false, lyDo }

  return {
    thanhCong: true,
    trangThai: {
      ...tt,
      canThiep: [...tt.canThiep, canThiep],
      canThiepChoAp: [...tt.canThiepChoAp, canThiep],
    },
  }
}

/** Áp hết hàng đợi ở đầu phút, và trả về những dòng sự kiện phát sinh. */
function apHangDoi(tt: TrangThaiTran): {
  readonly trangThai: TrangThaiTran
  readonly daThay: readonly CanThiep[]
} {
  if (tt.canThiepChoAp.length === 0) {
    return { trangThai: tt, daThay: [] }
  }

  let hienTai = tt
  for (const ct of tt.canThiepChoAp) {
    // Kiểm lại ngay trước khi áp: giữa lúc xếp hàng và lúc áp, cầu thủ có
    // thể đã nhận thẻ đỏ.
    if (kiemTraCanThiep(hienTai, ct)) continue
    hienTai = datBen(
      hienTai,
      ct.doi,
      apVaoBen(benTheoDoi(hienTai, ct.doi), ct.noiDung),
    )
  }

  return {
    trangThai: { ...hienTai, canThiepChoAp: [] },
    daThay: tt.canThiepChoAp.filter((ct) => ct.noiDung.loai === 'thay-nguoi'),
  }
}

export const SO_LAN_THAY_TOI_DA = 5

export function buocTiep(ttVao: TrangThaiTran): TrangThaiTran {
  if (ttVao.ketThuc) return ttVao

  // Can thiệp có hiệu lực từ ĐẦU phút này, trước khi mô phỏng (D30b).
  const { trangThai: tt, daThay } = apHangDoi(ttVao)

  const rng = taoRngTuHatGiong(tt.hatGiong)
  const phut = tt.phut + 1
  const tong = tongPhutTran(tt)

  let tiSo = tt.tiSo
  let benNha = giamTheLuc(tt.ben.nha)
  let benKhach = giamTheLuc(tt.ben.khach)
  const ungVienMoi: UngVienSuKien[] = []

  const themUngVien = (
    loai: LoaiSuKien,
    doi: BenDoi,
    cacCauThu: readonly string[],
    vung: VungSan | null,
    diem: number,
  ) => {
    ungVienMoi.push(
      taoUngVien(
        { ...tt, tiSo },
        phut,
        loai,
        doi,
        cacCauThu,
        vung,
        Math.floor(rng.next() * 1000),
        diem,
      ),
    )
  }

  // Thay người vừa áp được ghi vào dòng sự kiện tại đúng phút này (AC-9.5).
  for (const ct of daThay) {
    if (ct.noiDung.loai !== 'thay-nguoi') continue
    themUngVien('thay-nguoi', ct.doi, [ct.noiDung.vao, ct.noiDung.ra], null, 100)
  }

  for (let i = 0; i < SO_CHUOI_MOI_PHUT; i += 1) {
    const doi: BenDoi = rng.next() < 0.5 ? 'nha' : 'khach'
    const benCong = doi === 'nha' ? benNha : benKhach
    const benThu = doi === 'nha' ? benKhach : benNha

    const smCong = tinhSucManh(benCong, doi === 'nha', tt.sanTrungLap)
    const smThu = tinhSucManh(benThu, doi !== 'nha', tt.sanTrungLap)

    const kq = chayChuoiBong(layVung('giua', 1), rng, {
      heSoCong: smCong.heSo,
      heSoThu: smThu.heSo,
      sucManhCong: smCong.trungBinh,
      sucManhThu: smThu.trungBinh,
    })

    const nguoi = chonCauThuTheoSuc(smCong, rng)

    const coBan =
      kq.ketCuc === 'dut-diem' &&
      rng.next() < 0.22 * (smCong.trungBinh + 0.4)

    /*
      Cơ hội rõ ràng (AC-11.2, quyết định D37). Bàn thắng thì khỏi phải hỏi.
      Cú sút không thành bàn mới rút một lần, nên bất biến `banThang ≤
      coHoiRoRang ≤ cuSut` luôn đúng và kiểm được.

      Thứ tự tiêu thụ `Rng` trong một chuỗi là CỐ ĐỊNH và phải giữ nguyên:
      người kết thúc → bàn thắng → cơ hội rõ ràng. Đổi thứ tự là đổi mọi trận
      của mọi mã trận (P1).
    */
    const coHoiRoRang =
      kq.ketCuc === 'dut-diem' &&
      (coBan || rng.next() < xacSuatCoHoiRoRang(smCong.trungBinh))

    /*
      Cứu thua (AC-11.2, quyết định D38). Chỉ rút khi cú sút KHÔNG thành bàn,
      và chỉ khi khung thành có người — thủ môn vừa bị đuổi mà chưa ai vào
      bắt gôn thì không có ai cứu.

      Thứ tự rút trong một chuỗi, cố định: người kết thúc → bàn thắng → cơ hội
      rõ ràng → bị cứu.
    */
    const thuMonThu = nguoiTrongKhung(benThu)
    const sucThuMon =
      thuMonThu === null
        ? null
        : (smThu.theoCauThu.find((x) => x.id === thuMonThu)?.suc ?? null)
    const biCuu =
      kq.ketCuc === 'dut-diem' &&
      !coBan &&
      rng.next() < xacSuatBiCuu(sucThuMon)

    if (coBan) {
      tiSo =
        doi === 'nha'
          ? { nha: tiSo.nha + 1, khach: tiSo.khach }
          : { nha: tiSo.nha, khach: tiSo.khach + 1 }
    }

    let benCongMoi = congThongKeCong(
      benCong,
      kq,
      coBan,
      nguoi,
      coHoiRoRang,
      biCuu,
    )
    let benThuMoi = congThongKeThu(benThu, kq)

    themUngVien(
      loaiCuaChuoi(kq, coBan, biCuu),
      doi,
      nguoi ? [nguoi] : [],
      kq.vungKetThuc,
      diemCuaChuoi(kq, coBan),
    )

    // Phạm lỗi: đội PHÒNG NGỰ là bên có thể ăn thẻ.
    if (kq.ketCuc === 'pham-loi') {
      const kqThe = thuRutThe(benThuMoi, smThu, rng)
      benThuMoi = kqThe.ben
      if (kqThe.theSauDo && kqThe.playerId) {
        themUngVien(
          kqThe.theSauDo === 'vang' ? 'the-vang' : 'the-do',
          doi === 'nha' ? 'khach' : 'nha',
          [kqThe.playerId],
          kq.vungKetThuc,
          100,
        )
      }
    }

    if (doi === 'nha') {
      benNha = benCongMoi
      benKhach = benThuMoi
    } else {
      benKhach = benCongMoi
      benNha = benThuMoi
    }
  }

  // Kiệt sức: mỗi cầu thủ báo đúng một lần (AC-8.7).
  for (const [doi, ben] of [
    ['nha', benNha],
    ['khach', benKhach],
  ] as const) {
    const moi = moiKietSuc(ben)
    if (moi.length === 0) continue
    for (const id of moi) {
      themUngVien('kiet-suc', doi, [id], null, 100)
    }
    const capNhat: BenTran = {
      ...ben,
      daBaoKietSuc: [...ben.daBaoKietSuc, ...moi],
    }
    if (doi === 'nha') benNha = capNhat
    else benKhach = capNhat
  }

  // Rút mẫu câu cho các mốc TRƯỚC khi cất hạt giống, cùng lý do như ở
  // `taoTran`: hạt giống phải phản ánh mọi lần đã rút.
  const ketThuc = phut >= tong
  const laMocHetHiep = phut === tongPhutHiep1(tt)
  const mauCauHetHiep = laMocHetHiep ? Math.floor(rng.next() * 1000) : 0
  const mauCauKetThuc = ketThuc ? Math.floor(rng.next() * 1000) : 0

  const sauTt: TrangThaiTran = {
    ...tt,
    hatGiong: rng.hatGiong(),
    phut,
    tiSo,
    ben: { nha: benNha, khach: benKhach },
    ungVien: [...tt.ungVien, ...gomUngVienCuaPhut(ungVienMoi)],
    ketThuc,
  }

  const mocHiep: UngVienSuKien[] = []
  if (laMocHetHiep) {
    mocHiep.push(
      taoUngVien(sauTt, phut, 'het-hiep', 'nha', [], null, mauCauHetHiep, 100),
    )
  }
  if (ketThuc) {
    mocHiep.push(
      taoUngVien(sauTt, phut, 'ket-thuc', 'nha', [], null, mauCauKetThuc, 100),
    )
  }

  return mocHiep.length === 0
    ? sauTt
    : { ...sauTt, ungVien: [...sauTt.ungVien, ...mocHiep] }
}

/** Giữ tình huống đáng kể nhất của phút, cộng mọi tình huống bắt buộc. */
function gomUngVienCuaPhut(
  cacUngVien: readonly UngVienSuKien[],
): readonly UngVienSuKien[] {
  const batBuoc = cacUngVien.filter((uv) => uv.diemDangKe >= 100)
  const conLai = cacUngVien.filter((uv) => uv.diemDangKe < 100)

  let tot: UngVienSuKien | null = null
  for (const uv of conLai) {
    if (uv.diemDangKe < NGUONG_DANG_KE) continue
    if (!tot || uv.diemDangKe > tot.diemDangKe) tot = uv
  }

  return tot ? [...batBuoc, tot] : batBuoc
}

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

export { SO_DONG_TOI_DA, SO_DONG_TOI_THIEU }
