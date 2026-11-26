import type { CauHinhTran, TrangThaiTran } from '../tran'
import { tongPhutTran } from '../tran'
import { dieuKienTuMaTran, type DieuKienTran } from './dieuKien'
import { docMoc, KHONG_AI_GIU, type LoMoc } from './loMoc'
import {
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  SO_THUC_THE,
} from './moc'
import {
  buocPhutLienTuc,
  oCuaNguoiTrenSan,
  taoTranLienTuc,
  type TrangThaiLienTuc,
} from './tranLienTuc'
import { dungNhatKy, type DongNhatKy } from './nhatKy'
import { laTamDanhDau } from './vatLyBong'

/*
  ====================================================================
  TỆP XUẤT JSON (T740, AC-45.5 + AC-45.6, quyết định D125).
  ====================================================================

  Một tệp `.json` **thô** — không nén, không nhị phân — vì chính giá trị mà
  AC-45.5 đòi là "đọc được bằng công cụ thường": `jq`, `node -e`, một trình soạn
  thảo. Nén xuống 3 MB mà phải cài công cụ để mở là đổi đúng thứ AC muốn lấy
  một thứ AC không hỏi.

  **Năm khoá gốc**, và chỉ năm: `dinh_dang`, `khoi_dau`, `nhat_ky`, `moc`,
  `tinh_huong`.

  ⚠️ **HAI khối khung hình, hai hình dạng, và đó là quyết định đắt nhất của
  D125.**

    - `moc` — **mỏng**: 1 giây một khung, phủ **100%** trận, dạng **tuple** cộng
      một hàng tiêu đề. Dạng object cho cả trận đo được **23,0 MB thô**; tuple
      cộng hàng khoá chở **cùng lượng tin** mà rẻ hơn ~5 MB.
    - `tinh_huong` — **dày**: 0,5 giây một khung, chỉ ở những pha quan trọng, và
      **nguyên văn mục 15** của bản mô tả gốc: đúng bốn khoá `t`/`bong`/
      `cau_thu`/`su_kien`, `bong` 7 khoá, mỗi `cau_thu` 8 khoá.

  Chỉ giữ khối dày thì **chín AC cơ học chỉ gác được ~10%** thời lượng trận —
  đó là lý do khối mỏng tồn tại dù nó chiếm phần lớn kích thước.

  ⚠️ **Mã ngắn gán từ BẢN GHI, không từ thứ tự duyệt.** `A1…A16` theo đúng thứ
  tự `cacCauThu` của đội — một danh sách **không đổi** suốt trận. Gán theo thứ
  tự người **đang trên sân** thì một lượt thay người làm mọi mã sau đó trượt
  đi, và hai lần xuất cùng một mã trận ra hai tệp khác nhau.
*/

/** Phiên bản định dạng tệp xuất. Tăng khi hình dạng đổi, không khi nội dung đổi. */
export const PHIEN_BAN_TEP = 1

/** Số chữ số thập phân cho một con số **mét** trong tệp. */
export const SO_LE_MET = 2

/** Số chữ số thập phân cho một con số **độ** trong tệp. */
export const SO_LE_GOC = 1

/**
 * Enum **ĐÓNG** của `trang_thai`, đúng 14 giá trị của mục 15.
 *
 * ⚠️ **Hôm nay engine chỉ phát SÁU trong số đó**, và chỗ này nói thẳng điều
 * ấy thay vì để người đọc tự đếm: `dung_yen`, `di_bo`, `chay`, `nuoc_rut`,
 * `dan_bong`, `danh_dau`. Tám giá trị còn lại cần những thứ spec 007 **không
 * có**: `nhay`/`nga`/`tac_bong`/`bat_bong` cần pha tranh chấp và thủ môn (spec
 * 008), `giam_toc`/`quay_nguoi` cần một ngưỡng mà không AC nào nêu, `chuyen`/
 * `sut` là **hành động một khoảnh khắc** chứ không phải trạng thái của cả một
 * khung 0,5 giây.
 *
 * Enum vẫn liệt đủ 14 vì AC-45.5 đòi hình dạng **nguyên văn mục 15**; phép
 * kiểm canh "mọi giá trị phát ra đều thuộc enum", không canh "đủ 14 đều xuất
 * hiện" — một phép kiểm như thế sẽ ép tôi bịa ra tám trạng thái.
 */
export const CAC_TRANG_THAI = [
  'dung_yen',
  'di_bo',
  'chay',
  'nuoc_rut',
  'giam_toc',
  'quay_nguoi',
  'nhay',
  'nga',
  'dan_bong',
  'chuyen',
  'sut',
  'tac_bong',
  'danh_dau',
  'bat_bong',
] as const

export type TrangThaiNguoi = (typeof CAC_TRANG_THAI)[number]

/** Ngưỡng tốc độ chia bốn trạng thái di chuyển, m/s. */
export const NGUONG_DUNG_YEN = 0.3
export const NGUONG_DI_BO = 2
export const NGUONG_CHAY = 5.5

/** Mã ngắn của ba điểm trọng tài — không phải cầu thủ nên không mang A/B. */
export const MA_TRONG_TAI = ['REF', 'AR1', 'AR2'] as const

/** Tên các cột của quả bóng trong khối mỏng. */
export const KHOA_BONG = ['x', 'y', 'z', 'nguoi_giu'] as const

/** Tên các cột của **mỗi** ô người trong khối mỏng. */
export const KHOA_NGUOI = ['x', 'y', 'huong_nguoi'] as const

export interface NguoiTrongTep {
  readonly ma: string
  readonly uuid: string
  readonly vai_tro: string
  readonly doi: 'nha' | 'khach'
}

export interface KhoiDau {
  readonly ma_tran: string
  readonly doi_nha: string
  readonly doi_khach: string
  readonly quan_so: number
  readonly thoi_luong_phut: number
  readonly thoi_tiet: DieuKienTran['thoiTiet']
  readonly gio_toc_do: number
  readonly gio_huong: number
  /** Bảng tra mã ngắn → uuid, đặt **một lần** cho cả tệp. */
  readonly nguoi: readonly NguoiTrongTep[]
  /** Thứ tự ô trong mỗi hàng của khối mỏng: 22 cầu thủ rồi ba trọng tài. */
  readonly o: readonly string[]
}

export interface KhoiMocMong {
  readonly khoa_bong: readonly string[]
  readonly khoa_nguoi: readonly string[]
  /** Mỗi hàng: `[t, ...bóng, ...từng ô người]`. */
  readonly hang: readonly (readonly number[])[]
}

export interface BongTrongKhung {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly vx: number
  readonly vy: number
  readonly vz: number
  readonly nguoi_giu: string | null
}

export interface CauThuTrongKhung {
  readonly id: string
  readonly x: number
  readonly y: number
  readonly huong_nguoi: number
  readonly toc_do: number
  readonly trang_thai: TrangThaiNguoi
  /** Hành động tức thời — **chưa có từ vựng nào trong engine**, xem ghi chú. */
  readonly hanh_dong: string | null
  /** Mục đích — **US-40 của spec 009**, xem ghi chú. */
  readonly muc_dich: string | null
}

export interface KhungDay {
  readonly t: number
  readonly bong: BongTrongKhung
  readonly cau_thu: readonly CauThuTrongKhung[]
  readonly su_kien: string | null
}

export interface TinhHuongDay {
  readonly phut: number
  readonly khung: readonly KhungDay[]
}

export interface TepXuat {
  readonly dinh_dang: {
    readonly phien_ban: number
    readonly don_vi_do_dai: 'met'
    readonly don_vi_thoi_gian: 'giay'
    readonly goc_toa_do: string
  }
  readonly khoi_dau: KhoiDau
  readonly nhat_ky: readonly DongNhatKy[]
  readonly moc: KhoiMocMong
  readonly tinh_huong: readonly TinhHuongDay[]
}

/** Làm tròn về `soLe` chữ số thập phân, và **không** để lại `-0`. */
function tron(x: number, soLe: number): number {
  const he = 10 ** soLe
  const ra = Math.round(x * he) / he
  return ra === 0 ? 0 : ra
}

/**
 * Mã ngắn của từng cầu thủ, gán từ **danh sách đăng ký** của mỗi đội.
 *
 * `cacCauThu` không đổi suốt trận — thay người và thẻ đỏ chỉ đổi `trenSan` —
 * nên mã của một người là **một hằng số của trận**. Đó là điều làm hai lần xuất
 * cùng mã trận ra hai tệp giống nhau từng byte.
 */
export function maNganCuaNguoi(tran: TrangThaiTran): ReadonlyMap<string, string> {
  const ra = new Map<string, string>()
  const cacBen = [
    ['A', tran.ben.nha],
    ['B', tran.ben.khach],
  ] as const
  for (const [chu, ben] of cacBen) {
    ben.cacCauThu.forEach((c, i) => ra.set(c.id, `${chu}${i + 1}`))
  }
  return ra
}

/** Trạng thái của một người, từ tốc độ và vai trò của anh ta ở mốc này. */
export function trangThaiCuaNguoi(
  tocDo: number,
  laNguoiGiuBong: boolean,
  zBong: number,
): TrangThaiNguoi {
  if (laNguoiGiuBong && laTamDanhDau(zBong)) return 'danh_dau'
  if (laNguoiGiuBong) return 'dan_bong'
  if (tocDo < NGUONG_DUNG_YEN) return 'dung_yen'
  if (tocDo < NGUONG_DI_BO) return 'di_bo'
  if (tocDo < NGUONG_CHAY) return 'chay'
  return 'nuoc_rut'
}

/** Bảng tra mã ngắn cho cả 25 ô: 22 cầu thủ rồi ba trọng tài. */
function maCuaO(
  tran: TrangThaiTran,
  maNgan: ReadonlyMap<string, string>,
): readonly string[] {
  const oCuaNguoi = oCuaNguoiTrenSan(tran)
  const ra: string[] = new Array<string>(SO_THUC_THE - 1).fill('')
  for (const [id, o] of oCuaNguoi) ra[o] = maNgan.get(id) ?? id
  ra[CHI_SO_TRONG_TAI] = MA_TRONG_TAI[0]
  ra[CHI_SO_TRO_LY_1] = MA_TRONG_TAI[1]
  ra[CHI_SO_TRO_LY_2] = MA_TRONG_TAI[2]
  return ra
}

/** Một lô mốc, thành các hàng tuple của khối mỏng. */
function hangCuaLo(lo: LoMoc, chiSoMocDau: number): readonly number[][] {
  const ra: number[][] = []
  for (let i = 0; i < lo.soMocDaGhi; i += 1) {
    const m = docMoc(lo, i)
    const b = m.cacThucThe[CHI_SO_BONG]!
    const hang: number[] = [
      tron((m.chiSoMoc - chiSoMocDau) * 0.5, 1),
      tron(b.x, SO_LE_MET),
      tron(b.y, SO_LE_MET),
      tron(b.z, SO_LE_MET),
      m.nguoiGiu === KHONG_AI_GIU ? -1 : m.nguoiGiu,
    ]
    for (let o = 0; o < CHI_SO_BONG; o += 1) {
      const t = m.cacThucThe[o]!
      hang.push(tron(t.x, SO_LE_MET), tron(t.y, SO_LE_MET), tron(t.huong, SO_LE_GOC))
    }
    ra.push(hang)
  }
  return ra
}

/** Một khung **dày**, đúng hình dạng mục 15. */
function khungDayCuaMoc(
  lo: LoMoc,
  i: number,
  maO: readonly string[],
): KhungDay {
  const m = docMoc(lo, i)
  const b = m.cacThucThe[CHI_SO_BONG]!
  const cauThu: CauThuTrongKhung[] = []
  for (let o = 0; o < CHI_SO_TRONG_TAI; o += 1) {
    const t = m.cacThucThe[o]!
    if (t.coMat === 0) continue
    const tocDo = Math.hypot(t.vx, t.vy)
    cauThu.push({
      id: maO[o] ?? `?${o}`,
      x: tron(t.x, SO_LE_MET),
      y: tron(t.y, SO_LE_MET),
      huong_nguoi: tron(t.huong, SO_LE_GOC),
      toc_do: tron(tocDo, SO_LE_MET),
      trang_thai: trangThaiCuaNguoi(tocDo, o === m.nguoiGiu, b.z),
      /*
        ⚠️ Hai khoá này có mặt vì mục 15 đòi **tám** khoá, và chúng mang `null`
        vì engine **chưa có** thứ để điền:
          - `hanh_dong` ("dao_chan", "tac_bong"…) cần một từ vựng hành động mà
            spec 007 không dựng — `LoaiHanhDong` chỉ có bốn giá trị, và chúng là
            **đường bóng**, không phải động tác.
          - `muc_dich` là **US-40 của spec 009**, nơi người dùng đã chốt "tám
            loại trở lên" khi `/clarify`.
        Điền bừa một chuỗi vào đây là nói dối trong một tệp mà AC-45.6 dùng làm
        **nguồn đo**.
      */
      hanh_dong: null,
      muc_dich: null,
    })
  }
  return {
    t: tron(m.chiSoMoc * 0.5, 1),
    bong: {
      x: tron(b.x, SO_LE_MET),
      y: tron(b.y, SO_LE_MET),
      z: tron(b.z, SO_LE_MET),
      vx: tron(b.vx, SO_LE_MET),
      vy: tron(b.vy, SO_LE_MET),
      vz: tron(b.vz, SO_LE_MET),
      nguoi_giu: m.nguoiGiu === KHONG_AI_GIU ? null : (maO[m.nguoiGiu] ?? null),
    },
    cau_thu: cauThu,
    su_kien: null,
  }
}

/**
 * Những đoạn mốc **dày** của một lô: các mốc liền nhau cách đúng **một** bước.
 *
 * Đọc độ dày **từ chính lô** thay vì hỏi lại `cacPhaDay`: lô là thứ sẽ nằm
 * trong tệp, nên nếu hai bên lệch nhau thì bên đúng là lô. Một nguồn, không hai.
 */
export function cacDoanDay(lo: LoMoc): readonly (readonly number[])[] {
  const ra: number[][] = []
  let dang: number[] = []
  for (let i = 1; i < lo.soMocDaGhi; i += 1) {
    const buoc = docMoc(lo, i).chiSoMoc - docMoc(lo, i - 1).chiSoMoc
    if (buoc === 1) {
      if (dang.length === 0) dang.push(i - 1)
      dang.push(i)
    } else if (dang.length > 0) {
      ra.push(dang)
      dang = []
    }
  }
  if (dang.length > 0) ra.push(dang)
  return ra
}

/**
 * Dựng tệp xuất của **cả một trận**, từ mã trận.
 *
 * Hàm **thuần**: cùng cấu hình ra cùng tệp, từng byte. Nó tự chạy trận chứ
 * không nhận một trạng thái đang chạy — một trạng thái giữa chừng không dựng
 * lại được phần trận đã trôi qua, mà khối mỏng đòi **100%** trận.
 */
export function dungTepXuat(cauHinh: CauHinhTran): TepXuat {
  let lt: TrangThaiLienTuc = taoTranLienTuc({
    ...cauHinh,
    cheDoMoPhong: 'lien-tuc',
  })
  const chiSoMocDau = lt.chiSoMoc
  const maNgan = maNganCuaNguoi(lt.tran)
  const hang: number[][] = []
  const tinhHuong: TinhHuongDay[] = []

  for (let p = 0; p < tongPhutTran(lt.tran) + 2 && !lt.tran.ketThuc; p += 1) {
    const phut = buocPhutLienTuc(lt)
    const maO = maCuaO(phut.tt.tran, maNgan)
    hang.push(...hangCuaLo(phut.lo, chiSoMocDau))
    for (const doan of cacDoanDay(phut.lo)) {
      tinhHuong.push({
        phut: phut.tt.tran.phut,
        khung: doan.map((i) => khungDayCuaMoc(phut.lo, i, maO)),
      })
    }
    lt = phut.tt
  }

  const dieuKien = dieuKienTuMaTran(cauHinh.maTran)
  return {
    dinh_dang: {
      phien_ban: PHIEN_BAN_TEP,
      don_vi_do_dai: 'met',
      don_vi_thoi_gian: 'giay',
      goc_toa_do: 'goc san phia doi nha, x doc theo chieu dai, y theo chieu rong',
    },
    khoi_dau: {
      ma_tran: cauHinh.maTran,
      /*
        `BenTran` giữ `teamId` chứ không giữ tên đội: tên sống ở lớp dữ liệu
        đội, và engine không đọc nó. Tệp mang **id**, và người đọc tệp tra tên
        ở đâu họ muốn — đó cũng là lý do P1 tái lập được từ mã trận mà không
        cần biết đội tên gì.
      */
      doi_nha: lt.tran.ben.nha.teamId,
      doi_khach: lt.tran.ben.khach.teamId,
      quan_so: lt.tran.quanSo,
      thoi_luong_phut: tongPhutTran(lt.tran),
      thoi_tiet: dieuKien.thoiTiet,
      gio_toc_do: tron(dieuKien.tocDoGio, SO_LE_MET),
      gio_huong: tron(dieuKien.huongGio, SO_LE_GOC),
      nguoi: bangNguoi(lt.tran, maNgan),
      o: maCuaO(lt.tran, maNgan),
    },
    /*
      ⚠️ **Nhật ký dựng từ `ungVien`, KHÔNG từ `dongSuKien` — đó là cả nghĩa
      của chữ "không cắt".** `dongSuKien` chạy thêm `chonSuKien`, phép chọn mật
      độ giữ 60–100 dòng cho **màn hình đọc được**; một tệp dùng làm **nguồn
      đo** (AC-45.6) không có lý do gì phải chịu phép cắt ấy.

      Phép đổi `UngVienSuKien` → `SuKien` nằm **ở đây** chứ không trong
      `nhatKy.ts`: module ấy bị cấm biết tới hai cái tên này, và chính lệnh cấm
      giữ nó là một bộ dịch thuần, không bao giờ thành một bộ lọc thứ hai.
    */
    nhat_ky: dungNhatKy(
      lt.tran.ungVien.map((uv) => uv.suKien),
      maNgan,
    ),
    moc: { khoa_bong: KHOA_BONG, khoa_nguoi: KHOA_NGUOI, hang },
    tinh_huong: tinhHuong,
  }
}

function bangNguoi(
  tran: TrangThaiTran,
  maNgan: ReadonlyMap<string, string>,
): readonly NguoiTrongTep[] {
  const ra: NguoiTrongTep[] = []
  for (const [doi, ben] of [
    ['nha', tran.ben.nha],
    ['khach', tran.ben.khach],
  ] as const) {
    for (const c of ben.cacCauThu) {
      ra.push({
        ma: maNgan.get(c.id) ?? c.id,
        uuid: c.id,
        vai_tro: c.positions.join('/'),
        doi,
      })
    }
  }
  return ra
}
