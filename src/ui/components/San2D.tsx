import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { mauChuTuongPhan } from '../../domain/colors'
import { laySoDo, soNguoiCuaSoDo } from '../../domain/formations'
import type { PositionId } from '../../domain/types'
import type { BenDoi, SuKien } from '../../engine/suKien'
import type { BenTran } from '../../engine/tran'
import { latVung, vungCuaViTri, type VungSan } from '../../engine/vung'
import { useChuoi } from '../../hooks/useNgonNgu'
import {
  doMetTuTheLuc,
  huongRaKhoiMoc,
  viTriTaiThoiDiem,
  type Diem,
} from '../noiSuy'
import type { BoChuoi } from '../ngonNgu'

/*
  Sân 2D dạng điểm (US-10, quyết định D41).

  SVG viết tay, KHÔNG thư viện đồ hoạ (P4) và KHÔNG vòng lặp animation: mỗi
  điểm là một `<g>` có `transform`, di chuyển bằng CSS transition. 22 điểm
  tròn không cần canvas, mà vòng lặp animation chính là thứ sẽ phá ngân sách 3
  giây của AC-10.5 ở chế độ chạy hết trận.

  Toạ độ suy từ lưới 12 vùng của D23, không phải một bảng toạ độ riêng — nhờ
  vậy chỗ bóng mà engine báo và chỗ người mà sân vẽ luôn nói cùng một thứ
  tiếng.

  KHUNG TOẠ ĐỘ CHUNG là khung của ĐỘI NHÀ: dải 0 là khung thành đội nhà, dải 3
  là khung thành đội khách. Vùng của đội khách — cả vị trí đứng lẫn vùng trong
  sự kiện của họ — phải `latVung` trước khi vẽ, đúng cách engine làm.
*/

/*
  Hệ toạ độ của ảnh SVG. KHÔNG đổi theo quân số: giữ nó cố định thì bán kính
  điểm, khoảng giãn và cỡ chữ đều là số pixel như nhau ở mọi định dạng —
  cầu thủ sân 5 không phình to ra chỉ vì sân của họ nhỏ.
*/
const RONG = 100
const CAO = 64

/** Khung sân vẽ bên trong hệ toạ độ trên. */
export interface KhungSan {
  readonly rong: number
  readonly cao: number
}

/*
  Khung sân theo quân số (AC-15.6, quyết định D56).

  Bảng tra, không công thức: công thức cho ra những con số không ai kiểm được
  bằng mắt, còn bảng thì chỉnh tay được từng định dạng. Sân 11 giữ đúng
  100×64 của spec 001 nên mọi trận 11 người vẽ y như trước.

  Co cả hai chiều, và co ÍT hơn tỉ lệ sân thật (futsal chỉ rộng ~40×20 so với
  105×68): co đúng thật thì sân 5 bé tới mức mười cái điểm chen nhau không
  đọc nổi số áo, mà AC-15.1 lại đếm điểm.
*/
export const KHUNG_SAN: Readonly<Record<number, KhungSan>> = {
  11: { rong: 100, cao: 64 },
  10: { rong: 96, cao: 62 },
  9: { rong: 92, cao: 59 },
  8: { rong: 87, cao: 56 },
  7: { rong: 82, cao: 53 },
  6: { rong: 76, cao: 50 },
  5: { rong: 70, cao: 46 },
}

export function khungSan(quanSo: number): KhungSan {
  return KHUNG_SAN[quanSo] ?? KHUNG_SAN[11]
}

/**
 * Tâm theo trục dọc sân cho từng dải, tính theo TỈ LỆ chiều dài khung.
 *
 * Toạ độ ô vốn đã là phần trăm sân (D15), nên đổi khung là đủ — không cần
 * một bảng toạ độ riêng cho mỗi quân số. Nhân với 100 ra lại đúng bộ số
 * 9/32/56/79 của spec 001.
 */
const TI_LE_DAI: readonly number[] = [0.09, 0.32, 0.56, 0.79]

/** Tâm theo trục ngang sân cho từng cột, theo tỉ lệ chiều rộng khung. */
const TI_LE_COT: Readonly<Record<VungSan['cot'], number>> = {
  trai: 13 / 64,
  giua: 0.5,
  phai: 51 / 64,
}

/** Độ cao đội hình đẩy cả đội lên hay xuống theo hướng tấn công của họ. */
const DICH_THEO_DO_CAO: Readonly<Record<string, number>> = {
  thap: -5,
  'trung-binh': 0,
  cao: 5,
}

const BAN_KINH = 3.4

/** Khoảng giãn giữa hai người cùng ĐỘI đứng cùng một vùng. */
const BUOC_GIAN = 8

/**
 * Đẩy hai đội lệch nhau theo trục dọc, mỗi đội về phía khung thành của mình.
 *
 * Cần thiết vì lưới vùng cố tình cho hai đội đứng CHUNG vùng: tiền đạo đội
 * khách (dải 3 của họ) lật sang chính là dải 0 của đội nhà, tức ngay trước
 * khung thành đội nhà — đúng bóng đá. Nhưng vẽ đúng một toạ độ thì hai điểm
 * nằm đè lên nhau và sân chỉ hiện 13 điểm thay vì 22. Lệch 4 đơn vị mỗi bên
 * cho khoảng cách 8, lớn hơn đường kính 6,8 của một điểm.
 *
 */
const LECH_DOI = 4

/** Lề tối thiểu từ tâm điểm tới mép khung, đủ cho bán kính 3,4. */
const LE_TOI_THIEU = 5

/**
 * Tỉ lệ của khung sân so với khung sân 11 (AC-15.2).
 *
 * MỌI số đo tuyệt đối ở trên — bán kính, khoảng giãn, độ lệch hai đội, cỡ
 * chữ — đều nhân với số này, nên sân quân số nhỏ là một **mô hình thu nhỏ**
 * đúng tỉ lệ của sân 11, không phải sân 11 bị bóp lại quanh những cái điểm
 * vẫn to như cũ.
 *
 * Bản đầu của T214 chỉ co khung mà để nguyên các số đo ấy. Đo ra: khoảng
 * cách gần nhất giữa hai điểm tụt từ 4,00 (sân 11) xuống 1,30 ở sân 5 — nhỏ
 * hơn một nửa bán kính, tức hai người chỉ còn là một vệt. Chính là thứ
 * AC-15.2 cấm, và nó chỉ xuất hiện ở quân số nhỏ nên sân 11 không hề báo.
 */
function tiLeKhung(khung: KhungSan): number {
  return khung.rong / RONG
}

interface NguoiTrenSan {
  readonly playerId: string
  readonly vung: VungSan
  readonly viTriO: PositionId
}

/** Ai đang đứng ở vùng nào, đã quy về khung của đội nhà. */
function cacNguoiTrenSan(
  ben: BenTran,
  laDoiNha: boolean,
): readonly NguoiTrenSan[] {
  const viTriTheoSlot = new Map(
    laySoDo(ben.chienThuatHienTai.formationId).oVien.map((o) => [
      o.slotId,
      o.viTri,
    ]),
  )
  const dangTrenSan = new Set(ben.trenSan)

  const ra: NguoiTrenSan[] = []
  for (const o of ben.chienThuatHienTai.oVien) {
    if (!o.playerId || !dangTrenSan.has(o.playerId)) continue
    const viTriO = viTriTheoSlot.get(o.slotId)
    if (!viTriO) continue

    const vungRieng = vungCuaViTri(viTriO)
    ra.push({
      playerId: o.playerId,
      viTriO,
      vung: laDoiNha ? vungRieng : latVung(vungRieng),
    })
  }
  return ra
}

/** Quy một vùng trong sự kiện về khung của đội nhà. */
export function vungTrenSan(vung: VungSan, doi: BenDoi): VungSan {
  return doi === 'nha' ? vung : latVung(vung)
}

function kep(v: number, tu: number, den: number): number {
  return Math.min(Math.max(v, tu), den)
}

function toaDo(
  vung: VungSan,
  dichX: number,
  khung: KhungSan,
): { x: number; y: number } {
  const tiLe = tiLeKhung(khung)
  const le = LE_TOI_THIEU * tiLe
  const leX = (RONG - khung.rong) / 2
  const leY = (CAO - khung.cao) / 2
  const x = leX + TI_LE_DAI[vung.dai] * khung.rong + dichX
  return {
    x: kep(x, leX + le, leX + khung.rong - le),
    y: leY + TI_LE_COT[vung.cot] * khung.cao,
  }
}

/**
 * Lệch trục ngang cho những người ĐỨNG CÙNG một vùng, để họ không chồng nhau.
 *
 * Sơ đồ 4-4-2 có hai trung vệ, hai tiền vệ trung tâm và hai tiền đạo cùng ô
 * giữa, nên nếu không giãn thì sân chỉ hiện 8 điểm thay vì 11 — và AC-10.1
 * đếm điểm.
 */
function lechTrongVung(
  cac: readonly NguoiTrenSan[],
  buocGian: number,
): ReadonlyMap<string, number> {
  const theoVung = new Map<string, NguoiTrenSan[]>()
  for (const x of cac) {
    const danh = theoVung.get(x.vung.id) ?? []
    danh.push(x)
    theoVung.set(x.vung.id, danh)
  }

  const ra = new Map<string, number>()
  for (const danh of theoVung.values()) {
    const dau = -((danh.length - 1) * buocGian) / 2
    danh.forEach((x, i) => ra.set(x.playerId, dau + i * buocGian))
  }
  return ra
}

export interface DiemCauThu {
  readonly playerId: string
  readonly x: number
  readonly y: number
  readonly mauNen: string
  readonly mauChu: string
  readonly nhan: string
  readonly moTa: string
  readonly noiBat: boolean
}

export interface DoiTrenSan {
  readonly ben: BenTran
  readonly ten: string
  readonly mauAo: string
}

/** Những gì `hinhSan` cần để tính toạ độ — không có gì liên quan tới nhịp vẽ. */
interface DuLieuVe {
  readonly nha: DoiTrenSan
  readonly khach: DoiTrenSan
  /** Sự kiện đang hiển thị; `null` khi trận chưa chạy. */
  readonly suKien: SuKien | null
  readonly tenCauThu: (playerId: string) => string
  readonly soAo: (playerId: string) => number | null
  /**
   * Tên vị trí để dựng mô tả từng điểm.
   *
   * Đi vào bằng THAM SỐ, đúng cách `tenCauThu` và `soAo` vẫn đi: `hinhSan`
   * là hàm thuần và được test gọi thẳng, nên nó không được tự đi tra lớp
   * ngôn ngữ — làm vậy là buộc mọi test phải dựng sẵn một ngôn ngữ (D68).
   */
  readonly nhanViTri: (viTri: PositionId) => string
  /**
   * Câu mô tả một điểm, cho trình đọc màn hình.
   *
   * Cũng đi vào bằng THAM SỐ, đúng lý do của `nhanViTri` ngay trên: hàm
   * thuần không được tự đi tra lớp ngôn ngữ (D68).
   */
  readonly moTaDiem: BoChuoi['SAN_2D']['moTaDiem']
}

interface Props extends DuLieuVe {
  /** Nhịp đồng hồ trận: bao nhiêu mili-giây cho một phút chơi. */
  readonly msMoiPhut: number
}

/**
 * Chừa lại 10% để cú chuyển chỗ KẾT THÚC trước khi tình huống sau tới.
 * Mốc tình huống cách nhau trung bình ~1,15 phút trận, nên 0,9 là biên an
 * toàn kể cả ở những đoạn dày sự kiện nhất.
 */
const TI_LE_KIP = 0.9

/**
 * Dưới nhịp này thì thôi nội suy hẳn (AC-29.4, quyết định D97).
 *
 * Ở mức Rất nhanh (20ms một phút trận) một cú di chuyển chỉ dài 18ms — khoảng
 * một khung hình 60Hz. Mắt không đọc được chuyển động nào trong khoảng ấy, nên
 * vẽ đường đi không mang lại gì mà chỉ làm điểm bị giật khi khung hình rơi.
 */
const NHIP_TOI_THIEU_DE_NOI_SUY = 40

/**
 * Thời gian một điểm đi từ chỗ cũ tới chỗ mới, buộc theo nhịp đồng hồ trận.
 *
 * Bản đầu đặt cứng 280ms. Đo ra thì ở CẢ BA mức tốc độ, con số ấy dài hơn
 * khoảng cách giữa hai lần đổi chỗ — Thường ~220ms, Nhanh ~77ms, Rất nhanh
 * ~22ms — nên không cú di chuyển nào kịp tới đích: điểm luôn đang bay dở thì
 * bị giật sang đích mới. Ở mức Nhanh nó bị giật bốn lần trước khi tới nơi
 * được một lần.
 *
 * Lỗi này có từ spec 001 nhưng chìm ở sân 11, vì mỗi tình huống chỉ kéo ~17%
 * đội hình đi. Sân 5 cũng ~1,88 người mỗi tình huống nhưng trên một đội hình
 * năm người, tức **37%** — mắt đọc chuyển động theo tỉ lệ, không theo số
 * tuyệt đối, nên cùng một lỗi ở sân 5 thành ra loạn.
 *
 * **Trần cứng 280ms đã bị bỏ (T501, quyết định D91).** Nó sinh ra để chữa đúng
 * lỗi ở trên — một con số đặt cứng dài hơn khoảng cách giữa hai mốc — nhưng
 * công thức theo tỉ lệ thì **không bao giờ** vượt nhịp, nên lý do tồn tại của
 * trần đã hết. Giữ nó thì ở nhịp 1000ms một cú di chuyển dài 280ms rồi điểm
 * **đứng im 720ms** — chậm hơn nhưng giật hơn, đúng cái bẫy spec 005 mục 1 ghi.
 */
export function thoiGianChuyen(msMoiPhut: number): number {
  if (!(msMoiPhut >= NHIP_TOI_THIEU_DE_NOI_SUY)) return 0
  return Math.round(msMoiPhut * TI_LE_KIP)
}

export interface HinhSan {
  readonly khung: KhungSan
  /** Bán kính một điểm trong khung này — đã co theo tỉ lệ. */
  readonly banKinh: number
  readonly cacDiem: readonly DiemCauThu[]
  readonly duongBong: readonly { readonly x: number; readonly y: number }[]
}

/**
 * Toàn bộ hình học của sân — tách khỏi phần vẽ để kiểm được bằng test.
 *
 * Bộ test của repo chạy ở `environment: 'node'` và chỉ nhận `*.test.ts`, nên
 * không có đường nào render một component React. AC-15.1 (đếm đúng 2n điểm)
 * và AC-15.2 (không điểm nào đè khít điểm khác) đều là phát biểu về toạ độ,
 * nên hàm này là chỗ chứng minh chúng.
 */
export function hinhSan({
  nha,
  khach,
  suKien,
  tenCauThu,
  soAo,
  nhanViTri,
  moTaDiem,
}: DuLieuVe): HinhSan {
  /*
    Quân số suy từ SƠ ĐỒ đang dùng, không từ `trenSan`: thẻ đỏ làm số người
    trên sân tụt xuống, mà khung sân thì không được co lại giữa trận.
  */
  const quanSo = soNguoiCuaSoDo(
    laySoDo(nha.ben.chienThuatHienTai.formationId),
  )
  const khung = khungSan(quanSo)
  const tiLe = tiLeKhung(khung)
  const buocGian = BUOC_GIAN * tiLe
  const le = LE_TOI_THIEU * tiLe
  const leY = (CAO - khung.cao) / 2

  const thamGia = new Set(suKien?.cacCauThu ?? [])
  const vungSuKien = suKien?.vung ? vungTrenSan(suKien.vung, suKien.doi) : null

  /*
    Người tham gia dồn về CÙNG một vùng, nên phải giãn họ ra y như đã giãn
    những người đứng chung một ô (T132). Không giãn thì hai điểm nằm khít
    lên nhau và người xem chỉ thấy MỘT — pha tranh chấp hay bàn thắng có
    kiến tạo lại trông y hệt một mình một người.

    Giãn theo đúng thứ tự `cacCauThu`: người mà câu tường thuật nói tới đứng
    đầu danh sách, nên chỗ của anh ta không nhảy lung tung giữa các phút.
  */
  const dsThamGia = suKien?.cacCauThu ?? []
  const dauThamGia = -((dsThamGia.length - 1) * buocGian) / 2
  const lechThamGia = new Map(
    dsThamGia.map((id, i) => [id, dauThamGia + i * buocGian]),
  )

  const cacDiem: DiemCauThu[] = []

  for (const [doi, doiTren] of [
    ['nha', nha],
    ['khach', khach],
  ] as const) {
    const laDoiNha = doi === 'nha'
    const huong = laDoiNha ? 1 : -1
    const doCao = doiTren.ben.chienThuatHienTai.chiThi['do-cao-doi-hinh']
    const dichX =
      ((DICH_THEO_DO_CAO[doCao] ?? 0) * huong - LECH_DOI * huong) * tiLe

    const tren = cacNguoiTrenSan(doiTren.ben, laDoiNha)
    const lech = lechTrongVung(tren, buocGian)
    const mauChu = mauChuTuongPhan(doiTren.mauAo)

    for (const x of tren) {
      // Người tham gia tình huống dịch TỚI chỗ bóng; người khác giữ chỗ.
      const noiBat = thamGia.has(x.playerId)
      const diChuyen = noiBat && vungSuKien !== null
      const { x: cx, y: cy } = toaDo(
        diChuyen && vungSuKien ? vungSuKien : x.vung,
        diChuyen ? 0 : dichX,
        khung,
      )
      const lechY = diChuyen
        ? (lechThamGia.get(x.playerId) ?? 0)
        : (lech.get(x.playerId) ?? 0)
      const so = soAo(x.playerId)

      cacDiem.push({
        playerId: x.playerId,
        x: cx,
        y: kep(cy + lechY, leY + le, leY + khung.cao - le),
        mauNen: doiTren.mauAo,
        mauChu,
        nhan: so === null ? '' : String(so),
        noiBat,
        moTa: moTaDiem(
          tenCauThu(x.playerId),
          so,
          nhanViTri(x.viTriO),
          doiTren.ten,
          noiBat,
        ),
      })
    }
  }

  const duongBong = (suKien?.duongBong ?? []).map((v) =>
    toaDo(vungTrenSan(v, suKien?.doi ?? 'nha'), 0, khung),
  )

  return { khung, banKinh: BAN_KINH * tiLe, cacDiem, duongBong }
}

/**
 * Người dùng có bật chế độ giảm chuyển động của hệ điều hành không (AC-25.6).
 *
 * Bắt đầu bằng `false` rồi mới hỏi trong effect: `matchMedia` không tồn tại
 * khi file này được một test chạy ở môi trường node import vào, và `hinhSan`
 * thì đang được kiểm đúng kiểu ấy.
 */
function useGiamChuyenDong(): boolean {
  const [giam, datGiam] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const hoi = window.matchMedia('(prefers-reduced-motion: reduce)')
    datGiam(hoi.matches)
    const nghe = () => datGiam(hoi.matches)
    hoi.addEventListener('change', nghe)
    return () => hoi.removeEventListener('change', nghe)
  }, [])

  return giam
}

/** Một điểm đang đi từ đâu tới đâu, và nó vào mốc đầu theo hướng nào. */
interface ChuyenDiemDang {
  readonly tu: Diem
  readonly den: Diem
  readonly huongVao: Diem | null
}

export function San2D(props: Props) {
  const { SAN_2D } = useChuoi()
  const { nha, khach, msMoiPhut } = props
  const msChuyen = thoiGianChuyen(msMoiPhut)
  const { khung, banKinh, cacDiem, duongBong } = hinhSan(props)
  const bong = duongBong[duongBong.length - 1]
  const tiLe = tiLeKhung(khung)

  const leX = (RONG - khung.rong) / 2
  const leY = (CAO - khung.cao) / 2
  const giuaX = leX + khung.rong / 2
  const giuaY = leY + khung.cao / 2
  const sauVongTron = khung.cao / 8
  const sauVongCam = khung.rong * 0.12
  const caoVongCam = khung.cao * 0.4375

  // -----------------------------------------------------------------------
  // Chuyển động liên tục (T422, T423, T425, T426)
  // -----------------------------------------------------------------------

  const giamChuyenDong = useGiamChuyenDong()

  /*
    Mép mà điểm không được vượt qua, lấy đúng lề mà `hinhSan` đã dùng cho
    toạ độ tại mốc. Đường cong có thể vòng ra ngoài mặt cỏ nếu không kẹp —
    và một cầu thủ chạy ngoài vạch biên trông như một lỗi vẽ.
  */
  const le = LE_TOI_THIEU * tiLe
  const gioiHan = {
    xTu: leX + le,
    xDen: leX + khung.rong - le,
    yTu: leY + le,
    yDen: leY + khung.cao - le,
  }

  /** Độ mệt của từng người, đọc từ trạng thái trận ĐANG CHẠY (AC-25.7). */
  const doMetTheoNguoi = useMemo(() => {
    const bang = new Map<string, number>()
    for (const ben of [nha.ben, khach.ben]) {
      for (const [playerId, theLuc] of Object.entries(ben.theLuc)) {
        bang.set(playerId, doMetTuTheLuc(theLuc))
      }
    }
    return bang
  }, [nha.ben, khach.ben])

  const dang = useRef(new Map<string, ChuyenDiemDang>())
  const batDau = useRef(0)
  const [, veLai] = useReducer((n: number) => n + 1, 0)

  /*
    Khoá của một bộ mốc: chỉ khi toạ độ ĐÍCH đổi mới bắt đầu một cú di
    chuyển mới. Vẽ lại vì lý do khác — đổi ngôn ngữ, đổi chế độ màu — không
    được làm các điểm chạy lại từ đầu.
  */
  const khoaMoc = cacDiem.map((d) => `${d.playerId}:${d.x},${d.y}`).join('|')

  useEffect(() => {
    const bayGio = performance.now()
    const cu = dang.current
    const troi = msChuyen <= 0 ? 1 : (bayGio - batDau.current) / msChuyen

    const moi = new Map<string, ChuyenDiemDang>()
    for (const d of cacDiem) {
      const truoc = cu.get(d.playerId)
      /*
        Xuất phát từ chỗ điểm ĐANG ĐỨNG, không từ mốc trước: đổi tốc độ hay
        có tình huống dồn dập thì cú trước có thể chưa đi hết, và bắt nó
        quay về mốc cũ rồi đi lại là một cú giật (AC-25.3).
      */
      const tuDau = truoc
        ? viTriTaiThoiDiem(truoc.tu, truoc.den, troi, {
            huongVao: truoc.huongVao,
            doMet: doMetTheoNguoi.get(d.playerId) ?? 0,
            gioiHan,
          })
        : { x: d.x, y: d.y }

      moi.set(d.playerId, {
        tu: tuDau,
        den: { x: d.x, y: d.y },
        huongVao: truoc ? huongRaKhoiMoc(truoc.tu, truoc.den) : null,
      })
    }

    dang.current = moi
    batDau.current = bayGio

    if (giamChuyenDong || msChuyen <= 0) {
      veLai()
      return
    }

    let yeuCau = 0
    const buoc = () => {
      veLai()
      if (performance.now() - batDau.current < msChuyen) {
        yeuCau = requestAnimationFrame(buoc)
      }
    }
    yeuCau = requestAnimationFrame(buoc)
    return () => cancelAnimationFrame(yeuCau)
    // `gioiHan` và `cacDiem` dựng lại mỗi lần vẽ; `khoaMoc` mới là thứ quyết
    // định có bắt đầu cú di chuyển mới hay không.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khoaMoc, msChuyen, giamChuyenDong])

  /*
    Tỉ lệ đã đi được của cú di chuyển hiện tại — tính MỘT lần cho cả 22 điểm,
    để chúng không lệch nhau vài phần nghìn giây chỉ vì thứ tự vòng lặp.
  */
  const troiQua = msChuyen <= 0 ? 1 : (performance.now() - batDau.current) / msChuyen

  function viTriVe(d: DiemCauThu): Diem {
    if (giamChuyenDong) return { x: d.x, y: d.y }
    const tt = dang.current.get(d.playerId)
    if (!tt) return { x: d.x, y: d.y }
    return viTriTaiThoiDiem(tt.tu, tt.den, troiQua, {
      huongVao: tt.huongVao,
      doMet: doMetTheoNguoi.get(d.playerId) ?? 0,
      gioiHan,
    })
  }

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${RONG} ${CAO}`}
        className="w-full rounded-lg border border-vien-dam bg-nen-nhan"
        role="img"
        aria-label={SAN_2D.moTaSan(nha.ten, khach.ten)}
      >
        {/*
          Mặt sân là một hình riêng, không phải màu nền của cả ảnh: khung co
          lại theo quân số (AC-15.6) thì phải THẤY nó co — nền phủ kín ảnh
          làm sân 5 trông y hệt sân 11.
        */}
        <rect
          x={leX}
          y={leY}
          width={khung.rong}
          height={khung.cao}
          fill="var(--co-nen-dam)"
          aria-hidden="true"
        />

        {/* Vạch sân: chỉ những vạch giúp định hướng, không vẽ cho đẹp. */}
        <g
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={0.4 * tiLe}
          aria-hidden="true"
        >
          <rect
            x={leX + 2}
            y={leY + 2}
            width={khung.rong - 4}
            height={khung.cao - 4}
          />
          <line x1={giuaX} y1={leY + 2} x2={giuaX} y2={leY + khung.cao - 2} />
          <circle cx={giuaX} cy={giuaY} r={sauVongTron} />
          <rect
            x={leX + 2}
            y={giuaY - caoVongCam / 2}
            width={sauVongCam}
            height={caoVongCam}
          />
          <rect
            x={leX + khung.rong - 2 - sauVongCam}
            y={giuaY - caoVongCam / 2}
            width={sauVongCam}
            height={caoVongCam}
          />
        </g>

        {/* Đường đi của bóng (AC-10.2, quyết định D40). */}
        {duongBong.length > 1 && (
          <polyline
            points={duongBong.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--co-vang)"
            strokeWidth={0.8 * tiLe}
            strokeDasharray={`${2 * tiLe} ${1.5 * tiLe}`}
            aria-hidden="true"
          />
        )}
        {bong && (
          <circle
            cx={bong.x}
            cy={bong.y}
            r={1.5 * tiLe}
            fill="var(--co-vang)"
            stroke="var(--co-net)"
            strokeWidth={0.3 * tiLe}
            aria-hidden="true"
          />
        )}

        {cacDiem.map((d) => {
          /*
            Toạ độ vẽ do lớp nội suy quyết định, KHÔNG còn do CSS transition.
            CSS chỉ nội suy THẲNG giữa hai giá trị và cho mọi điểm đúng một
            nhịp, nên nó không dựng được đường cong (AC-25.1) và cũng không
            cho mỗi người một dáng riêng theo thể lực (AC-25.7).
          */
          const v = viTriVe(d)
          return (
          <g
            key={d.playerId}
            transform={`translate(${v.x} ${v.y})`}
          >
            <title>{d.moTa}</title>
            <circle
              r={banKinh}
              fill={d.mauNen}
              stroke={d.noiBat ? 'var(--co-vang)' : 'var(--co-net-mo)'}
              strokeWidth={(d.noiBat ? 1.4 : 0.5) * tiLe}
            />
            <text
              x={0}
              y={1.3 * tiLe}
              textAnchor="middle"
              fontSize={3.4 * tiLe}
              fontWeight={d.noiBat ? 800 : 500}
              fill={d.mauChu}
            >
              {d.nhan}
            </text>
            {/*
              Dấu hình chữ cho người đang tham gia tình huống: P9 cấm truyền
              đạt thông tin quan trọng CHỈ bằng màu, mà nền ở đây là màu áo
              người dùng tự chọn nên tương phản không kiểm soát được. Viền dày
              cộng dấu này là hai tín hiệu không phụ thuộc màu.
            */}
            {d.noiBat && (
              <text
                x={0}
                y={-banKinh - 1.2 * tiLe}
                textAnchor="middle"
                fontSize={3.6 * tiLe}
                fontWeight={800}
                fill="var(--co-vang)"
                stroke="var(--co-net)"
                strokeWidth={0.25 * tiLe}
              >
                {SAN_2D.dauThamGia}
              </text>
            )}
          </g>
          )
        })}
      </svg>
    </figure>
  )
}
