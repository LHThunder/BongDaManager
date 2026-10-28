import { laySoDo } from '../domain/formations'
import type { RoleId } from '../domain/roles'
import type { PositionId, Tactic } from '../domain/types'
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
  readonly cacCauThu: readonly HoSoCauThu[]
  readonly theLuc: Readonly<Record<string, number>>
  readonly the: Readonly<Record<string, TheDaNhan>>
  readonly daBaoKietSuc: readonly string[]
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
  /** Trạng thái 32-bit của nguồn ngẫu nhiên — ghi chú (1) plan III.4. */
  readonly hatGiong: number
  readonly phut: number
  readonly buGio: { readonly hiep1: number; readonly hiep2: number }
  readonly sanTrungLap: boolean
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
  const rng = taoRngTuHatGiong(hatGiongTuMaTran(cauHinh.maTran))
  const hiep1 = buGioNgauNhien(rng)
  const hiep2 = buGioNgauNhien(rng)

  const tt: TrangThaiTran = {
    maTran: cauHinh.maTran,
    hatGiong: rng.hatGiong(),
    phut: 0,
    buGio: { hiep1, hiep2 },
    sanTrungLap: cauHinh.sanTrungLap,
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

function loaiCuaChuoi(kq: KetQuaChuoi, coBan: boolean): LoaiSuKien {
  if (coBan) return 'ban-thang'
  if (kq.ketCuc === 'dut-diem') return 'co-hoi'
  if (kq.ketCuc === 'mat-bong' && laDaiCao(kq.vungKetThuc)) {
    return 'cuop-bong-cao'
  }
  if (kq.cacHanhDong.some((h) => h.loai === 'tat-canh')) return 'tat-canh'
  return 'mat-bong'
}

function congThongKeCong(
  ben: BenTran,
  kq: KetQuaChuoi,
  coBan: boolean,
  nguoiKetThuc: string | null,
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
      sutTrungDich: tk.sutTrungDich + (coBan ? 1 : 0),
      tatCanh: tk.tatCanh + soTat,
      coHoiRoRang: tk.coHoiRoRang + (coSut ? 1 : 0),
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

export function buocTiep(tt: TrangThaiTran): TrangThaiTran {
  if (tt.ketThuc) return tt

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
    if (coBan) {
      tiSo =
        doi === 'nha'
          ? { nha: tiSo.nha + 1, khach: tiSo.khach }
          : { nha: tiSo.nha, khach: tiSo.khach + 1 }
    }

    let benCongMoi = congThongKeCong(benCong, kq, coBan, nguoi)
    let benThuMoi = congThongKeThu(benThu, kq)

    themUngVien(
      loaiCuaChuoi(kq, coBan),
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
