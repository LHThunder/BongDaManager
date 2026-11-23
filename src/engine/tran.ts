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
  khoangSoDong,
  SO_DONG_TOI_DA,
  SO_DONG_TOI_THIEU,
  type BenDoi,
  type BuocBong,
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
import {
  keNhau,
  laDaiCao,
  latVung,
  layVung,
  vungCuaViTri,
  type VungSan,
} from './vung'

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
  /**
   * Số người mỗi bên, từ 5 tới 11 (AC-12.1, quyết định D52).
   *
   * Thuộc về TRẬN chứ không về đội: cùng một đội đá được mọi định dạng mà
   * không phải nhập lại dữ liệu, và hai bên luôn cùng quân số nên những phép
   * so sánh chiến thuật của spec 001 giữ nguyên ý nghĩa.
   *
   * Không khai thì mặc định 11, để mọi chỗ gọi có từ trước không đổi hành vi.
   */
  readonly quanSo?: number
  /**
   * Tổng thời lượng trận, tính bằng phút chơi (AC-12.5, quyết định D59).
   *
   * Không khai thì 90 — y như mọi trận trước spec 002.
   */
  readonly thoiLuong?: number
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
  /**
   * Tổng đường chuyền của cả bên. Có mặt ở đây để phép kiểm "tổng theo từng
   * cầu thủ bằng tổng theo bên" phủ được cả phần chuyền — không có nó thì
   * `chuyenThanhCong` của 11 người có thể rỗng mà chẳng test nào biết
   * (quyết định D34c).
   */
  readonly chuyenThanhCong: number
  readonly chuyenHong: number
  /**
   * Điểm đóng góp của từng cầu thủ, thang `diemCuaChuoi`.
   *
   * GIỮ LẠI dù `theoCauThu` đã chi tiết hơn: đây là phép đo duy nhất của
   * AC-8.5 trong `sosanh.saiViTri.test.ts`, và thang 100 điểm cho bàn thắng /
   * 6 điểm cho cú sút tách được bốn mức sai vị trí, trong khi một tổng số
   * nguyên nhỏ thì bốn mức chìm trong nhiễu (quyết định D33b).
   */
  readonly dongGopTheoCauThu: Readonly<Record<string, number>>
  /** Số liệu từng cầu thủ, để chấm điểm sau trận (AC-11.3, quyết định D33). */
  readonly theoCauThu: Readonly<Record<string, ThongKeCauThu>>
}

/**
 * Số liệu một trận của một cầu thủ (AC-11.3, AC-11.5).
 *
 * Bảy tiêu chí mà AC-11.3 liệt kê để chấm điểm đều có mặt ở đây, cộng
 * `canCuu` cho thủ môn và hai mốc phút để AC-11.5 nói được "đá từ phút nào
 * tới phút nào".
 */
export interface ThongKeCauThu {
  /** `null` nghĩa là đá từ đầu trận. */
  readonly phutVao: number | null
  /** `null` nghĩa là ở trên sân tới hết trận. */
  readonly phutRa: number | null
  readonly banThang: number
  readonly kienTao: number
  readonly cuSut: number
  readonly sutTrungDich: number
  readonly chuyenThanhCong: number
  readonly chuyenHong: number
  readonly cuopBong: number
  readonly matBong: number
  readonly phamLoi: number
  /** Chỉ người đang trong khung thành mới có. */
  readonly canCuu: number
}

export const THONG_KE_CAU_THU_RONG: ThongKeCauThu = {
  phutVao: null,
  phutRa: null,
  banThang: 0,
  kienTao: 0,
  cuSut: 0,
  sutTrungDich: 0,
  chuyenThanhCong: 0,
  chuyenHong: 0,
  cuopBong: 0,
  matBong: 0,
  phamLoi: 0,
  canCuu: 0,
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
  /**
   * Phiên bản engine đã chạy trận này (quyết định D35). Lịch sử trận đấu
   * mang theo số này, để giao diện biết khi nào một trận cũ không còn phát
   * lại đúng bằng cách chạy lại.
   */
  readonly phienBanEngine: number
  /** Trạng thái 32-bit của nguồn ngẫu nhiên — ghi chú (1) plan III.4. */
  readonly hatGiong: number
  readonly phut: number
  readonly buGio: { readonly hiep1: number; readonly hiep2: number }
  readonly sanTrungLap: boolean
  /** Số người mỗi bên của trận này, 5..11 (AC-12.1, quyết định D52). */
  readonly quanSo: number
  /** Tổng thời lượng trận bằng phút chơi, chưa kể bù giờ (AC-12.5). */
  readonly thoiLuong: number
  /** Bên mà người dùng điều khiển; chỉ bên này can thiệp được (AC-9.8). */
  readonly doiCuaNguoiDung: BenDoi
  readonly tiSo: TiSo
  readonly ben: { readonly nha: BenTran; readonly khach: BenTran }
  readonly ungVien: readonly UngVienSuKien[]
  readonly canThiep: readonly CanThiep[]
  /** Hàng đợi, áp vào đầu phút kế tiếp (D30b). */
  readonly canThiepChoAp: readonly CanThiep[]
  readonly ketThuc: boolean
  /**
   * Trận dừng giữa chừng vì một bên còn quá ít người (AC-14.5, AC-14.6).
   *
   * Khác `ketThuc` ở chỗ: `ketThuc` chỉ nói trận đã dừng, còn cờ này nói
   * dừng VÌ SAO — lịch sử và báo cáo cần phân biệt hai chuyện đó.
   */
  readonly biHuy: boolean
}

/**
 * Dưới ngưỡng này thì trận phải dừng (AC-14.5, quyết định D58).
 *
 * Một bất đẳng thức duy nhất cho ra đúng luật thật ở cả hai đầu dải: sân 11
 * dừng khi còn dưới 6,6 người tức từ 6 trở xuống (luật FIFA: dưới 7), sân 5
 * dừng khi còn dưới 3 (luật futsal). Không cần bảng tra theo từng quân số.
 */
export function nguongHuyTran(quanSo: number): number {
  return 0.6 * quanSo
}

/** Quân số mặc định khi không khai — giữ nguyên hành vi trước spec 002. */
export const QUAN_SO_MAC_DINH = 11
export const QUAN_SO_TOI_THIEU = 5
export const QUAN_SO_TOI_DA = 11

/** Mọi quân số chơi được, từ nhiều người tới ít người. */
export const CAC_QUAN_SO: readonly number[] = [11, 10, 9, 8, 7, 6, 5]

/** Thời lượng mặc định, giữ nguyên hành vi trước spec 002. */
export const THOI_LUONG_MAC_DINH = 90

/** Các mức thời lượng người dùng chọn được (AC-12.5). */
export const CAC_THOI_LUONG: readonly number[] = [20, 30, 45, 60, 90]

/**
 * Nửa đầu của một trận dài `thoiLuong` phút.
 *
 * Chia đôi thì mức 45 ra 22,5 — số lẻ. Hiệp một lấy phần nguyên, hiệp hai
 * gánh phần dư, nên 45 phút thành 22 + 23. Phút chơi phải là số nguyên: cả
 * đồng hồ lẫn dòng sự kiện đều đánh số theo phút.
 */
export function phutHiep1(thoiLuong: number): number {
  return Math.floor(thoiLuong / 2)
}

/** Nửa sau — gánh phần lẻ khi thời lượng là số lẻ. */
export function phutHiep2(thoiLuong: number): number {
  return thoiLuong - phutHiep1(thoiLuong)
}

export const PHUT_MOI_HIEP = 45
export const BU_GIO_TOI_THIEU = 1
export const BU_GIO_TOI_DA = 5
export const SO_CHUOI_MOI_PHUT = 3
export const NGUONG_DANG_KE = 2

const THONG_KE_RONG: ThongKeBen = {
  cuSut: 0,
  soBuocGiuBong: 0,
  chuyenThanhCong: 0,
  chuyenHong: 0,
  theoCauThu: {},
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
    thongKe: THONG_KE_RONG,
  }
}

export function tongPhutHiep1(tt: TrangThaiTran): number {
  return phutHiep1(tt.thoiLuong) + tt.buGio.hiep1
}

export function tongPhutTran(tt: TrangThaiTran): number {
  return tt.thoiLuong + tt.buGio.hiep1 + tt.buGio.hiep2
}

export function hiepCuaPhut(tt: TrangThaiTran, phut: number): 1 | 2 {
  return phut <= tongPhutHiep1(tt) ? 1 : 2
}

export function phutHienThi(
  tt: TrangThaiTran,
  phut: number,
): { readonly phut: number; readonly buGio: boolean } {
  if (hiepCuaPhut(tt, phut) === 1) {
    return { phut, buGio: phut > phutHiep1(tt.thoiLuong) }
  }
  const p = phut - tt.buGio.hiep1
  return { phut: p, buGio: p > tt.thoiLuong }
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
    phienBanEngine: PHIEN_BAN_ENGINE,
    hatGiong: rng.hatGiong(),
    phut: 0,
    buGio: { hiep1, hiep2 },
    sanTrungLap: cauHinh.sanTrungLap,
    quanSo: cauHinh.quanSo ?? QUAN_SO_MAC_DINH,
    thoiLuong: cauHinh.thoiLuong ?? THOI_LUONG_MAC_DINH,
    doiCuaNguoiDung: cauHinh.doiCuaNguoiDung ?? 'nha',
    tiSo: { nha: 0, khach: 0 },
    ben: { nha: taoBen(cauHinh.nha), khach: taoBen(cauHinh.khach) },
    ungVien: [],
    canThiep: [],
    canThiepChoAp: [],
    ketThuc: false,
    biHuy: false,
  }

  return {
    ...tt,
    ungVien: [
      taoUngVien(tt, 0, 'bat-dau', 'nha', [], null, [], [], mauCauKhaiCuoc, 100),
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
  duongBong: readonly VungSan[],
  cacBuocBong: readonly BuocBong[],
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
      duongBong,
      cacBuocBong,
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

// ---------------------------------------------------------------------------
// Gán hành động cho cầu thủ (AC-11.3, quyết định D34 và D34c)
// ---------------------------------------------------------------------------

/**
 * Ai đã làm gì trong một chuỗi bóng.
 *
 * `chuoiBong.ts` cố tình KHÔNG biết tới đội hình — nó chỉ cần hai con số sức
 * mạnh tổng và hai bộ hệ số chỉ thị, nên bốn test so sánh của P5 còn đọc được
 * là chúng đang đo cái gì (quyết định D34). Việc gán người vì thế xảy ra ở
 * đây, sau khi chuỗi đã chạy xong.
 */
interface GanHanhDong {
  /** Người kết thúc tình huống — đã có từ Giai đoạn 3. */
  readonly nguoiKetThuc: string | null
  /** Người chuyền quả cuối trước bàn thắng; chỉ rút khi có bàn. */
  readonly nguoiKienTao: string | null
  readonly nguoiCuopBong: string | null
  readonly nguoiPhamLoi: string | null
  /** Một id cho MỖI bước `chuyen` / `re-bong` của chuỗi (D34c). */
  readonly nguoiChuyen: readonly string[]
}

const GAN_RONG: GanHanhDong = {
  nguoiKetThuc: null,
  nguoiKienTao: null,
  nguoiCuopBong: null,
  nguoiPhamLoi: null,
  nguoiChuyen: [],
}

/**
 * Người ĐỂ MẤT bóng của một chuỗi, hay `null` nếu chuỗi không mất bóng.
 *
 * Là người giữ **bước cuối cùng** chứ không phải người kết thúc tình huống:
 * quả chuyền hỏng không nằm trong `cacHanhDong` vì `chuoiBong.ts` return ngay
 * khi mất bóng, trước khi push (quyết định D34d).
 *
 * Một hàm dùng chung cho CẢ bảng thống kê lẫn dòng sự kiện. Trước T134 mỗi
 * bên tự tính một kiểu: bảng thống kê ghi `matBong` cho người này, còn câu
 * tường thuật lại gọi tên người kết thúc — hai người thường khác nhau, nên
 * dòng tường thuật và bảng điểm cuối trận nói về hai người khác nhau cho
 * cùng một pha.
 */
export function nguoiDeMatBong(
  kq: KetQuaChuoi,
  gan: GanHanhDong,
): string | null {
  if (kq.ketCuc !== 'mat-bong') return null
  return gan.nguoiChuyen[gan.nguoiChuyen.length - 1] ?? gan.nguoiKetThuc
}

/**
 * Những người TRỰC TIẾP tham gia một tình huống, để sân 2D làm nổi bật
 * (AC-10.3) — người đầu danh sách luôn thuộc đội của dòng sự kiện.
 *
 * Trước T132 danh sách này chỉ có đúng một người, nên bàn thắng có kiến tạo
 * thì người chuyền quả cuối không sáng lên dù `GanHanhDong` đã giữ sẵn tên
 * anh ta cho phần thống kê.
 *
 * KHÔNG gồm `nguoiChuyen`: đó là cả chuỗi lên bóng, có thể bốn năm người, và
 * họ không cùng có mặt ở vùng kết thúc. Chỉ gồm những người mà tình huống
 * NÓI VỀ, tức những người đang tranh chấp ngay tại chỗ bóng dừng.
 *
 * Hàm này không rút `Rng` lần nào: mọi id đã được rút ở trên, nên thứ tự tiêu
 * thụ `Rng` không đổi và mã trận cũ vẫn phát lại đúng y nguyên (P1).
 */
function nguoiThamGiaTinhHuong(
  loai: LoaiSuKien,
  gan: GanHanhDong,
  thuMonCuu: string | null,
  nguoiDeMat: string | null,
): readonly string[] {
  /*
    Người đứng đầu là người của ĐỘI CỦA DÒNG. Với pha mất bóng thì đó là
    người ĐỂ MẤT — chính người mà bảng thống kê ghi `matBong` — chứ không
    phải người kết thúc chuỗi (T134).
  */
  const dau =
    loai === 'mat-bong' || loai === 'cuop-bong-cao'
      ? (nguoiDeMat ?? gan.nguoiKetThuc)
      : gan.nguoiKetThuc

  const them: (string | null)[] = []

  if (loai === 'ban-thang') them.push(gan.nguoiKienTao)
  // Cú sút bị cứu là tình huống của HAI người: người sút và người cứu.
  if (loai === 'cuu-thua') them.push(thuMonCuu)
  // Mất bóng là một pha tranh chấp: người để mất và người đoạt được.
  them.push(gan.nguoiCuopBong, gan.nguoiPhamLoi)

  const ra: string[] = []
  for (const id of [dau, ...them]) {
    if (id && !ra.includes(id)) ra.push(id)
  }
  return ra
}

/**
 * Rút một người đang có mặt **tại hoặc kề** `vung`, cân theo sức mạnh.
 *
 * `vung` được tính theo hướng tấn công của bên đang giữ bóng, nên với bên
 * phòng ngự phải lật vùng đứng của họ trước khi so — cùng một chỗ trên sân,
 * nhìn từ hai chiều ngược nhau.
 *
 * Không ai ở gần thì rút trong cả đội hình, để hàm luôn trả về một người khi
 * trên sân còn người. Rút đều tay thì trung vệ kiến tạo nhiều như tiền vệ
 * cánh, và điểm cầu thủ ở AC-11.3 thành vô nghĩa (quyết định D34b).
 */
function nguoiTaiVung(
  doiHinh: readonly ViTriTrenSan[],
  sm: SucManhBen,
  vung: VungSan,
  laPhongNgu: boolean,
  rng: RngCoTrangThai,
  loaiTru: string | null = null,
): string | null {
  const sucTheoId = new Map(sm.theoCauThu.map((x) => [x.id, x.suc]))

  const oGan = doiHinh.filter((v) => {
    if (v.playerId === loaiTru) return false
    const dung = laPhongNgu
      ? latVung(vungCuaViTri(v.viTriO))
      : vungCuaViTri(v.viTriO)
    return dung.id === vung.id || keNhau(dung, vung)
  })

  const ungVien =
    oGan.length > 0
      ? oGan
      : doiHinh.filter((v) => v.playerId !== loaiTru)
  if (ungVien.length === 0) return null

  let tong = 0
  for (const v of ungVien) tong += (sucTheoId.get(v.playerId) ?? 0) + 0.05
  let moc = rng.next() * tong
  for (const v of ungVien) {
    moc -= (sucTheoId.get(v.playerId) ?? 0) + 0.05
    if (moc <= 0) return v.playerId
  }
  return ungVien[ungVien.length - 1].playerId
}

/** Cộng một vài chỉ tiêu vào bản ghi của một cầu thủ. */
function congCauThu(
  bang: Record<string, ThongKeCauThu>,
  playerId: string | null,
  phan: Partial<ThongKeCauThu>,
): void {
  if (!playerId) return
  const cu = bang[playerId] ?? THONG_KE_CAU_THU_RONG
  const moi: Record<string, unknown> = { ...cu }
  for (const [khoa, giaTri] of Object.entries(phan)) {
    if (typeof giaTri !== 'number') continue
    const truoc = cu[khoa as keyof ThongKeCauThu]
    moi[khoa] = (typeof truoc === 'number' ? truoc : 0) + giaTri
  }
  bang[playerId] = moi as unknown as ThongKeCauThu
}

// ---------------------------------------------------------------------------
// Thống kê
// ---------------------------------------------------------------------------

/**
 * Đường bóng của một chuỗi, theo thứ tự các bước rồi tới vùng kết thúc
 * (quyết định D40).
 *
 * Dẫn xuất thuần từ `cacHanhDong`, không rút thêm số nào, nên nó không làm
 * lệch dãy số của P1.
 */
function duongBongCuaChuoi(kq: KetQuaChuoi): {
  readonly duong: readonly VungSan[]
  readonly cacBuoc: readonly BuocBong[]
} {
  const cacBuoc: BuocBong[] = kq.cacHanhDong.map((h) => ({
    vung: h.vung,
    loai: h.loai,
  }))
  const cuoi = cacBuoc[cacBuoc.length - 1]
  /*
    Vùng kết thúc được nối thêm với `loai: null`: chuỗi mất bóng, phạm lỗi hay
    bóng ra ngoài return **trước khi push** hành động cuối, nên bước ấy không
    phải một hành động — đó chỉ là chỗ bóng dừng lại (spec 006, D101).
  */
  const day =
    cuoi?.vung.id === kq.vungKetThuc.id
      ? cacBuoc
      : [...cacBuoc, { vung: kq.vungKetThuc, loai: null }]
  return { duong: day.map((b) => b.vung), cacBuoc: day }
}

/*
  Điểm đáng kể của một chuỗi, và HAI KẾT CỤC CỐ Ý KHÔNG ĐƯỢC KỂ (T136).

  `bong-ra-ngoai` và mất bóng ở dải thấp đều được 1 điểm, dưới
  `NGUONG_DANG_KE = 2`, nên `gomUngVienCuaPhut` cắt chúng trước khi chúng kịp
  thành dòng tường thuật. Đây là lựa chọn, không phải sót: AC-8.15 nói dòng
  tường thuật chỉ ghi những tình huống CÓ Ý NGHĨA, mà "bóng ra ngoài biên" là
  loại nhạt nhất trong trận.

  Số đo ngày 2026-10-30 trên 10 mã trận cố định: 0 dòng cho cả hai, trong khi
  đo riêng 5000 chuỗi bóng cho thấy chúng xảy ra thật — `mat-bong` 2536,
  `dut-diem` 1132, `bong-ra-ngoai` 740, `pham-loi` 592.

  Hệ quả phải biết: loại `mat-bong` KHÔNG còn mẫu câu nào trong
  `ui/tuongThuat.ts`. Muốn cho chúng được kể thì phải nâng điểm ở đây TRƯỚC,
  rồi mới viết mẫu câu — làm ngược lại là viết code chết.
*/
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
  /*
    `pham-loi` đứng SAU `tat-canh`, và thứ tự này được chọn sau khi đo (T135).

    Đặt nó trước thì mọi chuỗi có quả tạt mà kết thúc bằng phạm lỗi đều thành
    dòng phạm lỗi — và `tat-canh` **tắt hẳn**, vì đường sống duy nhất còn lại
    của nó là chuỗi tạt kết thúc bằng mất bóng ở dải thấp, mà kết cục ấy chỉ
    được 1 điểm nên `NGUONG_DANG_KE` cắt sạch. Mất dòng tạt cánh là mất bằng
    chứng nhìn thấy được của chỉ thị hướng tấn công (AC-8.3), đắt hơn nhiều
    so với việc một pha phạm lỗi sau quả tạt được kể theo quả tạt.
  */
  if (kq.ketCuc === 'pham-loi') return 'pham-loi'
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

/*
  PHỄU DỨT ĐIỂM — nền và độ dốc của tầng "đi đúng hướng".

  Đo được trước khi có tầng này: **70%** số cú sút đi trúng đích, vì mô hình cũ
  chỉ có hai kết cục cho một cú sút — thành bàn, hoặc bị cứu. Một cú sút đi vọt
  xà hay ra ngoài cột **không có chỗ nào để xảy ra**.

  Bóng đá thật (Opta, Premier League): trong số cú sút KHÔNG BỊ CHẶN, khoảng
  **49%** đi trúng đích. Nền 0,30 cộng 0,28 lần sức mạnh bên tấn công cho đúng
  mức ấy ở sức mạnh trung bình đo được (≈ 0,68), và vẫn giữ được chiều mà AC-8.8
  nói tới: đội mạnh hơn sút chuẩn hơn.
*/
const NEN_TRUNG_DICH = 0.335
const THEO_SUC_TRUNG_DICH = 0.28

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
/**
 * Xác suất một cú sút **đi đúng hướng khung thành** (phễu dứt điểm, tầng hai).
 *
 * Tầng này **không tồn tại trước ngày 2026-11-22**, và việc nó không tồn tại là
 * sai số lớn nhất của cả engine: mô hình cũ cho mọi cú sút hoặc thành bàn hoặc
 * bị cứu, nên tỉ lệ trúng đích đo được là **70%** so với **49%** của bóng đá
 * thật, và tỉ lệ thành bàn là **23,1%** so với **11,3–11,9%**.
 *
 * Nguồn của hai con số thật: Opta Analyst, giải Ngoại hạng Anh.
 */
export function xacSuatTrungDich(sucManhCong: number): number {
  const p = NEN_TRUNG_DICH + THEO_SUC_TRUNG_DICH * sucManhCong
  return Math.min(Math.max(p, 0.15), 0.75)
}

export function xacSuatBiCuu(sucThuMon: number | null): number {
  if (sucThuMon === null) return 0
  const p = NEN_BI_CUU + THEO_SUC_BI_CUU * sucThuMon
  return Math.min(Math.max(p, 0.05), 0.9)
}

function congThongKeCong(
  ben: BenTran,
  kq: KetQuaChuoi,
  coBan: boolean,
  gan: GanHanhDong,
  coHoiRoRang: boolean,
  biCuu: boolean,
): BenTran {
  const tk = ben.thongKe
  const soTat = kq.cacHanhDong.filter((h) => h.loai === 'tat-canh').length
  const coSut = kq.ketCuc === 'dut-diem'
  const nguoiKetThuc = gan.nguoiKetThuc
  const dongGop = { ...tk.dongGopTheoCauThu }
  if (nguoiKetThuc) {
    dongGop[nguoiKetThuc] =
      (dongGop[nguoiKetThuc] ?? 0) + diemCuaChuoi(kq, coBan)
  }

  const theoCauThu = { ...tk.theoCauThu }
  congCauThu(theoCauThu, nguoiKetThuc, {
    banThang: coBan ? 1 : 0,
    cuSut: coSut ? 1 : 0,
    sutTrungDich: coBan || biCuu ? 1 : 0,
  })
  congCauThu(theoCauThu, gan.nguoiKienTao, { kienTao: 1 })

  /*
    Đường chuyền: mỗi bước một người (D34c). Quả chuyền HỎNG không nằm trong
    `cacHanhDong` — `chuoiBong.ts` return ngay khi mất bóng, trước khi push —
    nên nó được tính cho người giữ bước cuối cùng (D34d).
  */
  for (const id of gan.nguoiChuyen) {
    congCauThu(theoCauThu, id, { chuyenThanhCong: 1 })
  }
  const nguoiHong = nguoiDeMatBong(kq, gan)
  congCauThu(theoCauThu, nguoiHong, { chuyenHong: 1, matBong: 1 })

  return {
    ...ben,
    thongKe: {
      ...tk,
      cuSut: tk.cuSut + (coSut ? 1 : 0),
      soBuocGiuBong: tk.soBuocGiuBong + kq.cacHanhDong.length,
      sutTrungDich: tk.sutTrungDich + (coBan || biCuu ? 1 : 0),
      tatCanh: tk.tatCanh + soTat,
      coHoiRoRang: tk.coHoiRoRang + (coHoiRoRang ? 1 : 0),
      chuyenThanhCong: tk.chuyenThanhCong + gan.nguoiChuyen.length,
      chuyenHong: tk.chuyenHong + (nguoiHong ? 1 : 0),
      dongGopTheoCauThu: dongGop,
      theoCauThu,
    },
  }
}

function congThongKeThu(
  ben: BenTran,
  kq: KetQuaChuoi,
  gan: GanHanhDong,
  nguoiCuu: string | null,
): BenTran {
  const tk = ben.thongKe
  const cuop =
    kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc) ? 1 : 0
  const thoat = kq.ketCuc === 'dut-diem' ? 1 : 0

  const theoCauThu = { ...tk.theoCauThu }
  congCauThu(theoCauThu, gan.nguoiCuopBong, { cuopBong: 1 })
  congCauThu(theoCauThu, gan.nguoiPhamLoi, { phamLoi: 1 })
  congCauThu(theoCauThu, nguoiCuu, { canCuu: 1 })

  return {
    ...ben,
    thongKe: {
      ...tk,
      cuopBongDaiCao: tk.cuopBongDaiCao + cuop,
      biThoatXuong: tk.biThoatXuong + thoat,
      theoCauThu,
    },
  }
}

// ---------------------------------------------------------------------------
// Một phút trận đấu
// ---------------------------------------------------------------------------

export function giamTheLuc(ben: BenTran): BenTran {
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

/**
 * Thử rút thẻ với **đúng người vừa phạm lỗi**.
 *
 * `playerId` do `nguoiTaiVung` rút ở vòng lặp chính (D34), chứ không rút lại ở
 * đây: hai lần rút riêng thì cầu thủ A phạm lỗi mà cầu thủ B bị ghi tên.
 */
export function thuRutThe(
  ben: BenTran,
  playerId: string | null,
  rng: RngCoTrangThai,
  phut: number,
): KetQuaThe {
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

  /*
    Thẻ đỏ cũng là một mốc "ra sân" của AC-11.5, và nó KHÔNG phải can thiệp —
    nên dẫn xuất hai mốc phút từ danh sách `canThiep` ở tầng giao diện sẽ bỏ
    sót đúng những người bị đuổi (quyết định D50).
  */
  const theoCauThu = { ...ben.thongKe.theoCauThu }
  if (kq.roiSan) {
    congCauThu(theoCauThu, playerId, {})
    theoCauThu[playerId] = { ...theoCauThu[playerId], phutRa: phut }
  }

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
        theoCauThu,
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
    /*
      Lượt thay bằng đúng số dự bị đã đăng ký (AC-14.3, quyết định D57).

      Không cần đếm riêng: mỗi lần thay lấy một người khỏi ghế, nên "còn lượt"
      và "còn người trên ghế" là cùng một câu. Đăng ký 0 dự bị thì hết lượt
      ngay từ phút đầu, và người dùng được nói lý do thay vì bị từ chối im.
    */
    if (ben.duBi.length === 0) return 'het-luot-thay'
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
function apVaoBen(
  ben: BenTran,
  noiDung: NoiDungCanThiep,
  phut: number,
): BenTran {
  switch (noiDung.loai) {
    case 'thay-nguoi': {
      /*
        Hai mốc phút của AC-11.5. `phut` là phút mà can thiệp THẬT SỰ có hiệu
        lực, cũng là phút của dòng tường thuật "thay người", nên báo cáo và
        dòng tường thuật không bao giờ lệch nhau một phút.
      */
      const theoCauThu = { ...ben.thongKe.theoCauThu }
      congCauThu(theoCauThu, noiDung.ra, {})
      congCauThu(theoCauThu, noiDung.vao, {})
      theoCauThu[noiDung.ra] = { ...theoCauThu[noiDung.ra], phutRa: phut }
      theoCauThu[noiDung.vao] = { ...theoCauThu[noiDung.vao], phutVao: phut }

      return {
        ...ben,
        thongKe: { ...ben.thongKe, theoCauThu },
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
export function apHangDoi(
  tt: TrangThaiTran,
  phut: number,
): {
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
      apVaoBen(benTheoDoi(hienTai, ct.doi), ct.noiDung, phut),
    )
  }

  return {
    trangThai: { ...hienTai, canThiepChoAp: [] },
    daThay: tt.canThiepChoAp.filter((ct) => ct.noiDung.loai === 'thay-nguoi'),
  }
}

/**
 * Phiên bản của chính engine (quyết định D35).
 *
 * Giai đoạn 4 rút thêm số từ `Rng` để gán hành động cho từng cầu thủ, nên
 * **mã trận lưu từ Giai đoạn 3 không còn phát lại ra đúng trận cũ**. P1 hứa
 * cùng một bộ đầu vào cho cùng kết quả "ở mọi lần chạy và mọi máy", không
 * hứa qua mọi phiên bản — nhưng đó là thứ phải nói thẳng, nên nó được đóng
 * vào trận và vào mỗi bản ghi lịch sử để giao diện biết khi nào hai phiên
 * bản lệch nhau.
 *
 * **Lên 3 ở T134.** Lần tăng này KHÔNG phải vì `Rng`: tỉ số, chuỗi tình huống,
 * vùng bóng và thứ tự rút đều y hệt. Thứ đổi là *tên người* đứng đầu dòng ở
 * những pha mất bóng — giờ là người mà bảng thống kê ghi `matBong`, không còn
 * là người kết thúc chuỗi. Dòng sự kiện vì thế khác bản ghi cũ ở vài dòng, mà
 * AC-8.11 đo phát lại bằng cách đối chiếu TỪNG DÒNG. Hứa "đấu lại ra đúng
 * trận cũ" cho một bản ghi phiên bản 2 là hứa sai, nên số này phải tăng — cái
 * giá là những trận đã lưu mất nút đấu lại, kèm câu nói rõ lý do; xem lại thì
 * vẫn nguyên vẹn.
 *
 * **Lên 4 ở T135**, cùng một lý do và cũng không phải vì `Rng`: hai kết cục
 * `pham-loi` và `bong-ra-ngoai` nay có LOẠI sự kiện riêng thay vì mượn
 * `mat-bong`, nên `loai` của vài dòng đổi.
 *
 * **Lên 5 ở T130.** Vẫn không phải vì `Rng` — người kết thúc tình huống đổi
 * từ "rút trong cả đội" sang "rút theo vùng", mà cả hai cách đều tiêu đúng
 * một lần rút, nên tỉ số, chuỗi tình huống và vùng bóng của mọi mã trận cũ
 * giữ nguyên từng cái một. Thứ đổi là TÊN người trong mỗi dòng, và AC-8.11
 * đo phát lại bằng cách đối chiếu từng dòng.
 *
 * **Spec 002 GIỮ NGUYÊN 5, và đó là một quyết định có số đo** (T221, AC-16.3).
 *
 * Spec 002 sửa engine ở bốn chỗ: hệ số khoảng trống theo quân số, thời lượng
 * trận thành trường của trạng thái, huỷ trận khi một bên xuống dưới 60% quân
 * số, và trần số dòng tường thuật co theo thời lượng. Bản đầu của kế hoạch
 * mặc định rằng chừng ấy thì phải tăng.
 *
 * Soát lại thì ở **quân số 11, 90 phút** không chỗ nào trong bốn chỗ ấy đổi
 * số lần hay thứ tự rút `Rng`: hệ số khoảng trống bằng đúng 1 khi quân số là
 * 11, hai hàm thời lượng trả lại đúng 45 và 90, ngưỡng huỷ cần tới 5 thẻ đỏ
 * một bên, và trần số dòng ở 90 phút vẫn là 100.
 *
 * `tuongThichEngine.test.ts` đo thay vì tin: 5 mã trận cố định, mọi dòng khớp
 * từng ký tự với bảng mốc — phút, bù giờ, loại, đội, danh sách cầu thủ, mẫu
 * câu và tỉ số sau đó, cả bảy trường.
 *
 * Tăng thừa không phải là "cẩn thận": nó tước nút đấu lại của mọi trận đã
 * lưu và bắt ứng dụng nói với người dùng rằng trận cũ chạy bằng engine khác,
 * trong khi nó chạy bằng đúng engine này. Suốt spec 001 tới 006 con số này
 * giữ nguyên **5** vì đúng lý do ấy.
 *
 * **Lên 6 ngày 2026-11-22**, và lần này tăng là ĐÚNG: người dùng chốt sửa
 * phễu dứt điểm, một thay đổi cố ý của mô hình xác suất. Engine cũ cho 3,95
 * bàn một trận so với 2,82–3,28 thật, và 70% cú sút trúng đích so với 49%
 * thật, vì nó không có tầng "đi đúng hướng". Kết quả đổi thật, nên con số
 * này phải đổi theo — và 20 trận đã lưu mất nút đấu lại, điều người dùng
 * biết và chấp nhận trước khi sửa.
 */
export const PHIEN_BAN_ENGINE = 6

/**
 * Dựng lại đăng ký ban đầu của một bên TỪ trạng thái trận.
 *
 * Làm được là nhờ hai thứ bất biến suốt trận: `chienThuatXuatPhat` giữ nguyên
 * 11 ô lúc vào trận, và `cacCauThu` giữ đủ hồ sơ 18 người. `trenSan` và
 * `duBi` thì đổi theo thay người nên không dùng được cho việc này.
 *
 * Dùng cho hai việc: đấu lại cùng cặp đấu mà không phải cấu hình lại từ đầu
 * (AC-11.6), và phát lại một trận để đối chiếu từng dòng sự kiện (AC-8.11).
 * Hai chỗ đó phải dùng CÙNG một hàm, vì hai bản sao của phép dựng lại này sẽ
 * có ngày lệch nhau mà không ai thấy.
 */
export function dangKyTuTrangThai(ben: BenTran): DangKyBen {
  const xuatPhat = ben.chienThuatXuatPhat.oVien
    .map((o) => o.playerId)
    .filter((id): id is string => id !== null)
  const trongDoiHinh = new Set(xuatPhat)

  return {
    teamId: ben.teamId,
    chienThuatXuatPhat: ben.chienThuatXuatPhat,
    trenSan: xuatPhat,
    duBi: ben.cacCauThu.map((c) => c.id).filter((id) => !trongDoiHinh.has(id)),
    cacCauThu: ben.cacCauThu,
  }
}

/** Cấu hình để chạy lại đúng cặp đấu này (AC-11.6). */
export function cauHinhDauLai(
  tt: TrangThaiTran,
  maTran: string,
): CauHinhTran {
  return {
    maTran,
    sanTrungLap: tt.sanTrungLap,
    quanSo: tt.quanSo,
    thoiLuong: tt.thoiLuong,
    doiCuaNguoiDung: tt.doiCuaNguoiDung,
    nha: dangKyTuTrangThai(tt.ben.nha),
    khach: dangKyTuTrangThai(tt.ben.khach),
  }
}

/*
  Kết cục của MỘT pha bóng, như mô hình xác suất v6 quyết (T701 của spec 007).

  Đây là mặt cắt mà engine liên tục dùng lại: nó gọi `quyetKetCucChuoi` để biết
  pha bóng KẾT THÚC ra sao, rồi tự diễn pha ấy ra toạ độ mét và thời gian giây.
  Hai chế độ vì thế dùng CHUNG một mô hình xác suất — cùng `nguoiTaiVung`, cùng
  `loaiCuaChuoi`, cùng `diemCuaChuoi` — nên hai bảng thống kê còn so được với
  nhau (AC-45.3, rủi ro R54).

  CHỈ chứa những gì phần sau của vòng lặp còn đọc. Mười thứ khác —`smCong`,
  `smThu`, `doiHinhCong`, `doiHinhThu`, `nguoi`, `sucThuMon`, `trungDich`,
  `nguoiKienTao`, `nguoiCuopBong`, `nguoiChuyen` — đều bị tiêu thụ ngay trong
  hàm (phần lớn đi vào `gan`), nên chúng không có mặt ở đây.

  `nguoiPhamLoi` cũng không có trường riêng: nó đã nằm trong `gan.nguoiPhamLoi`,
  và một trường thứ hai cho cùng một giá trị là một chỗ để hai bản trôi khỏi
  nhau.
*/
export interface KetCucPhaV6 {
  /** Bên tổ chức pha bóng này. */
  readonly doi: BenDoi
  /** Trạng thái bên công KHI VÀO pha (chưa cộng thống kê). */
  readonly benCong: BenTran
  /** Trạng thái bên thủ KHI VÀO pha (chưa cộng thống kê). */
  readonly benThu: BenTran
  /** Kết cục chuỗi bóng của `chayChuoiBong`. */
  readonly kq: KetQuaChuoi
  /** Ai làm gì trong pha này. */
  readonly gan: GanHanhDong
  /** Pha này có thành bàn không. */
  readonly coBan: boolean
  /** Cú sút trúng đích có bị thủ môn cản không. */
  readonly biCuu: boolean
  /** Pha này có phải một cơ hội rõ ràng không (AC-11.2). */
  readonly coHoiRoRang: boolean
  /** Người đứng trong khung của bên thủ, hoặc `null` nếu khung bỏ trống. */
  readonly thuMonThu: string | null
}

/**
 * Quyết kết cục một pha bóng bằng mô hình xác suất v6.
 *
 * ⚠️ Thứ tự tiêu thụ `rng` trong hàm này là HỢP ĐỒNG, không phải chi tiết cài
 * đặt: đổi nó là đổi mọi trận của mọi mã trận đã lưu (P1). Chứng minh duy nhất
 * được nhận là bảng `MOC_V6` của `tuongThichEngine.test.ts` — **không** phải
 * một chú thích tự khai, và **không** phải `taiLap.test.ts` (file ấy so engine
 * với chính nó, nên thứ tự rút lệch thì cả hai vế lệch y hệt và nó vẫn xanh).
 *
 * Phép bóc T701 giữ nguyên từng dòng và từng thứ tự của thân vòng chuỗi cũ.
 */
export function quyetKetCucChuoi(
  benNha: BenTran,
  benKhach: BenTran,
  sanTrungLap: boolean,
  quanSo: number,
  rng: RngCoTrangThai,
): KetCucPhaV6 {
  const doi: BenDoi = rng.next() < 0.5 ? 'nha' : 'khach'
  const benCong = doi === 'nha' ? benNha : benKhach
  const benThu = doi === 'nha' ? benKhach : benNha

  const smCong = tinhSucManh(benCong, doi === 'nha', sanTrungLap)
  const smThu = tinhSucManh(benThu, doi !== 'nha', sanTrungLap)

  const kq = chayChuoiBong(layVung('giua', 1), rng, {
    heSoCong: smCong.heSo,
    heSoThu: smThu.heSo,
    sucManhCong: smCong.trungBinh,
    sucManhThu: smThu.trungBinh,
    quanSo,
  })

  /*
    Người kết thúc tình huống được rút THEO VÙNG, đúng như ba vai kia của
    D34c (T130).

    Trước đó nó rút trong cả đội, chỉ cân theo sức mạnh — nên thủ môn dứt
    điểm và ghi bàn ngang một tiền đạo, và sân 2D kéo anh ta lên tận dải 3
    để đứng cạnh thủ môn đối phương. Rút theo vùng thì thủ môn chỉ còn kết
    thúc tình huống khi bóng ở ngay khu vực của mình.

    Số lần rút `Rng` KHÔNG đổi: cả hai hàm đều tiêu đúng một lần khi còn
    người trên sân, nên tỉ số, chuỗi tình huống và vùng bóng của mọi mã
    trận cũ giữ nguyên — chỉ TÊN người đổi.
  */
  const doiHinhCong = doiHinhTrenSan(benCong)
  const doiHinhThu = doiHinhTrenSan(benThu)
  const nguoi = nguoiTaiVung(doiHinhCong, smCong, kq.vungKetThuc, false, rng)

  /*
    PHỄU DỨT ĐIỂM BA TẦNG (2026-11-22, engine v6).

    **Mô hình cũ chỉ có MỘT tầng**: một cú sút hoặc thành bàn, hoặc bị cứu.
    Không có chỗ nào cho một cú sút đi vọt xà. Hệ quả đo được trên 20 mã trận,
    đặt cạnh số của Opta ở giải Ngoại hạng Anh:

    | | Engine cũ | Bóng đá thật |
    |---|---|---|
    | Cú sút không bị chặn mỗi trận | 17,2 | **17,3** ✅ |
    | Trong đó trúng đích | **70%** | **49%** |
    | Thành bàn, trên cú sút không bị chặn | **23,1%** | **11,3–11,9%** |
    | Bàn thắng mỗi trận | **3,95** | 2,82 · 2,85 · 3,28 (ba mùa) |

    Tức số cú sút thì đúng, nhưng engine **ghi bàn dễ hơn thật 1,4–2 lần**, và
    nguyên nhân nằm ở chỗ thiếu tầng "đi đúng hướng".

    **Ba tầng, và một tầng được SUY RA chứ không rút thêm:**
      1. `trungDich` — cú sút có đi đúng hướng khung thành không.
      2. `biCuu`     — nếu trúng đích, thủ môn có cản được không.
      3. `coBan`     — trúng đích mà không bị cứu thì là bàn. **Không rút.**

    Tầng ba suy ra là chỗ mô hình mới đúng hơn mô hình cũ về bóng đá: một cú
    sút đi đúng hướng chỉ có hai kết cục, và "trúng đích mà không ai cứu cũng
    không vào" là một trạng thái không tồn tại trên sân.

    **Khung bỏ trống**: `xacSuatBiCuu(null)` trả 0, nên mọi cú trúng đích
    thành bàn — đúng như một khung thành không người.

    **Thứ tự tiêu thụ `Rng` trong một chuỗi là CỐ ĐỊNH:** người kết thúc →
    trúng đích → bị cứu → cơ hội rõ ràng → kiến tạo → cướp bóng → phạm lỗi →
    một lượt cho mỗi bước chuyền. Đổi thứ tự là đổi mọi trận của mọi mã trận
    (P1), và chính vì thứ tự đã đổi ở đây mà `PHIEN_BAN_ENGINE` lên **6**.
  */
  const thuMonThu = nguoiTrongKhung(benThu)
  const sucThuMon =
    thuMonThu === null
      ? null
      : (smThu.theoCauThu.find((x) => x.id === thuMonThu)?.suc ?? null)

  const trungDich =
    kq.ketCuc === 'dut-diem' && rng.next() < xacSuatTrungDich(smCong.trungBinh)
  const biCuu = trungDich && rng.next() < xacSuatBiCuu(sucThuMon)
  const coBan = trungDich && !biCuu

  /*
    Cơ hội rõ ràng (AC-11.2, quyết định D37). Bàn thắng thì khỏi phải hỏi.
    Cú sút không thành bàn mới rút một lần, nên bất biến `banThang ≤
    coHoiRoRang ≤ cuSut` luôn đúng và kiểm được.
  */
  const coHoiRoRang =
    kq.ketCuc === 'dut-diem' &&
    (coBan || rng.next() < xacSuatCoHoiRoRang(smCong.trungBinh))

  /*
    Gán hành động cho người (AC-11.3, quyết định D34 và D34c). Thứ tự rút
    nối tiếp phần trên và CỐ ĐỊNH: kiến tạo → cướp bóng → phạm lỗi → một
    lượt cho mỗi bước chuyền.

    `kienTao` chỉ rút khi CÓ BÀN, đúng nghĩa bóng đá, nên tổng kiến tạo của
    một trận không bao giờ vượt tổng số bàn — một bất biến kiểm được.
  */
  const nguoiKienTao = coBan
    ? nguoiTaiVung(doiHinhCong, smCong, kq.vungKetThuc, false, rng, nguoi)
    : null
  const nguoiCuopBong =
    kq.ketCuc === 'mat-bong'
      ? nguoiTaiVung(doiHinhThu, smThu, kq.vungKetThuc, true, rng)
      : null
  const nguoiPhamLoi =
    kq.ketCuc === 'pham-loi'
      ? nguoiTaiVung(doiHinhThu, smThu, kq.vungKetThuc, true, rng)
      : null

  const nguoiChuyen: string[] = []
  for (const hanhDong of kq.cacHanhDong) {
    if (hanhDong.loai === 'sut') continue
    const id = nguoiTaiVung(doiHinhCong, smCong, hanhDong.vung, false, rng)
    if (id) nguoiChuyen.push(id)
  }

  const gan: GanHanhDong = {
    ...GAN_RONG,
    nguoiKetThuc: nguoi,
    nguoiKienTao,
    nguoiCuopBong,
    nguoiPhamLoi,
    nguoiChuyen,
  }

  return {
    doi,
    benCong,
    benThu,
    kq,
    gan,
    coBan,
    biCuu,
    coHoiRoRang,
    thuMonThu,
  }
}

export function buocTiep(ttVao: TrangThaiTran): TrangThaiTran {
  if (ttVao.ketThuc) return ttVao

  // Can thiệp có hiệu lực từ ĐẦU phút này, trước khi mô phỏng (D30b).
  const { trangThai: tt, daThay } = apHangDoi(ttVao, ttVao.phut + 1)

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
    duongBong: readonly VungSan[],
    diem: number,
    cacBuocBong: readonly BuocBong[] = [],
  ) => {
    ungVienMoi.push(
      taoUngVien(
        { ...tt, tiSo },
        phut,
        loai,
        doi,
        cacCauThu,
        vung,
        duongBong,
        cacBuocBong,
        Math.floor(rng.next() * 1000),
        diem,
      ),
    )
  }

  // Thay người vừa áp được ghi vào dòng sự kiện tại đúng phút này (AC-9.5).
  for (const ct of daThay) {
    if (ct.noiDung.loai !== 'thay-nguoi') continue
    themUngVien(
      'thay-nguoi',
      ct.doi,
      [ct.noiDung.vao, ct.noiDung.ra],
      null,
      [],
      100,
    )
  }

  for (let i = 0; i < SO_CHUOI_MOI_PHUT; i += 1) {
    /*
      Mô hình xác suất v6 quyết kết cục pha bóng; phần còn lại của vòng lặp
      chỉ CỘNG thống kê và dựng ứng viên sự kiện từ kết cục ấy.

      Phép bóc T701 của spec 007: engine liên tục gọi đúng hàm này, nên hai
      chế độ dùng chung một mô hình xác suất mà không chép một dòng nào.
      Thứ tự tiêu thụ `rng` không dịch một lần rút — `MOC_V6` canh điều đó.
    */
    const { doi, benCong, benThu, kq, gan, coBan, biCuu, coHoiRoRang, thuMonThu } =
      quyetKetCucChuoi(benNha, benKhach, tt.sanTrungLap, tt.quanSo, rng)

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
      gan,
      coHoiRoRang,
      biCuu,
    )
    let benThuMoi = congThongKeThu(benThu, kq, gan, biCuu ? thuMonThu : null)

    const loaiSuKien = loaiCuaChuoi(kq, coBan, biCuu)
    const phaBong = duongBongCuaChuoi(kq)
    themUngVien(
      loaiSuKien,
      doi,
      nguoiThamGiaTinhHuong(
        loaiSuKien,
        gan,
        biCuu ? thuMonThu : null,
        nguoiDeMatBong(kq, gan),
      ),
      kq.vungKetThuc,
      phaBong.duong,
      diemCuaChuoi(kq, coBan),
      phaBong.cacBuoc,
    )

    /*
      Phạm lỗi: đội PHÒNG NGỰ là bên có thể ăn thẻ, và người ăn thẻ phải là
      ĐÚNG người vừa phạm lỗi — trước đây hai chỗ rút riêng nên cầu thủ A
      phạm lỗi mà cầu thủ B bị ghi tên vào sổ.
    */
    if (kq.ketCuc === 'pham-loi') {
      const kqThe = thuRutThe(benThuMoi, gan.nguoiPhamLoi, rng, phut)
      benThuMoi = kqThe.ben
      if (kqThe.theSauDo && kqThe.playerId) {
        themUngVien(
          kqThe.theSauDo === 'vang' ? 'the-vang' : 'the-do',
          doi === 'nha' ? 'khach' : 'nha',
          [kqThe.playerId],
          kq.vungKetThuc,
          phaBong.duong,
          100,
          phaBong.cacBuoc,
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
      themUngVien('kiet-suc', doi, [id], null, [], 100)
    }
    const capNhat: BenTran = {
      ...ben,
      daBaoKietSuc: [...ben.daBaoKietSuc, ...moi],
    }
    if (doi === 'nha') benNha = capNhat
    else benKhach = capNhat
  }

  /*
    Huỷ trận khi một bên còn quá ít người (AC-14.5, quyết định D58).

    Kiểm SAU khi thẻ đỏ của phút này đã áp, nên trận dừng ngay tại phút mà
    người thứ n bị đuổi chứ không chờ thêm một phút nữa.
  */
  const benThieuNguoi: BenDoi | null =
    benNha.trenSan.length < nguongHuyTran(tt.quanSo)
      ? 'nha'
      : benKhach.trenSan.length < nguongHuyTran(tt.quanSo)
        ? 'khach'
        : null
  const biHuy = benThieuNguoi !== null

  // Rút mẫu câu cho các mốc TRƯỚC khi cất hạt giống, cùng lý do như ở
  // `taoTran`: hạt giống phải phản ánh mọi lần đã rút.
  const ketThuc = phut >= tong || biHuy
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
    biHuy,
  }

  const mocHiep: UngVienSuKien[] = []
  if (laMocHetHiep) {
    mocHiep.push(
      taoUngVien(
        sauTt,
        phut,
        'het-hiep',
        'nha',
        [],
        null,
        [],
        [],
        mauCauHetHiep,
        100,
      ),
    )
  }
  /*
    Trận bị huỷ kể bằng dòng RIÊNG, không mượn dòng "hết giờ": người xem phải
    biết trận dừng vì thiếu người chứ không phải vì hết thời gian (AC-14.6).
  */
  if (biHuy && benThieuNguoi) {
    mocHiep.push(
      taoUngVien(
        sauTt,
        phut,
        'huy-tran',
        benThieuNguoi,
        [],
        null,
        [],
        [],
        mauCauKetThuc,
        100,
      ),
    )
  } else if (ketThuc) {
    mocHiep.push(
      taoUngVien(
        sauTt,
        phut,
        'ket-thuc',
        'nha',
        [],
        null,
        [],
        [],
        mauCauKetThuc,
        100,
      ),
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
  return chonSuKien(tt.ungVien, tt.thoiLuong)
}

export { khoangSoDong, SO_DONG_TOI_DA, SO_DONG_TOI_THIEU }
