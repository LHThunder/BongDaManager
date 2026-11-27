import { DAI_SAN } from '../hinhHocSan'
import { dieuKienTuMaTran } from './dieuKien'
import {
  chuanHoaGoc,
  GOC_NGANG_TOI_DA,
  GOC_TIEN_TOI_DA,
  KHOANG_TRONG_TAI,
  LE_DO_TRE_TRONG_TAI,
  LE_DUONG_BIEN_TRO_LY,
  lechToiDaTheoTocDo,
  TOC_DO_LUI_TOI_DA,
  TOC_DO_NGANG_TOI_DA,
  TRAN_GIA_TOC_AC_38_2,
  TRAN_GIAM_TOC_AC_38_2,
  TRAN_TOC_DO_TUYET_DOI,
} from './coHoc'
import {
  TOC_DO_CHUYEN_DAI_CAO,
  TOC_DO_CHUYEN_NGAN_THAP,
  Z_DANH_DAU_CAO,
  Z_DANH_DAU_THAP,
} from './vatLyBong'
import { MA_TRONG_TAI, SO_LE_GOC, SO_LE_MET, type TepXuat } from './tepXuat'

/*
  ====================================================================
  BỘ ĐO CƠ HỌC CHẠY TRÊN CHÍNH TỆP XUẤT (T742, AC-45.6).
  ====================================================================

  AC-45.6 nói mọi phép kiểm cơ học của US-38 phải chạy được **trên chính tệp**,
  không phải trên một bản đo dựng riêng mỗi lần muốn kiểm một con số — thứ đã
  phải làm suốt spec 005 và 006. Module này là chỗ ấy.

  **Mười AC**, không chín không mười một: AC-38.1 → 38.7, cộng 38.9, 38.10,
  38.11. **AC-38.8 là ngoại lệ** — độ cong là chuyện **giữa hai mốc**, do lớp
  nội suy ở tầng giao diện sinh ra, nên nó được canh ở lớp vẽ (T735).

  Bốn điều phải đọc trước khi tin một con số của module này:

  ⚠️ **Tra cột bằng TÊN, không bằng số thứ tự.** Khối mỏng là tuple, và một
  phép đo đếm cột bằng tay sẽ im lặng đo nhầm đại lượng ngày ai đó chèn thêm
  một cột. `khoa_nguoi.indexOf('x')` thì đỏ ngay.

  ⚠️ **Ba trần số NHẬP từ `coHoc.ts`, không chép.** Và chúng là trần của **AC**
  (9 / 6 / 8), không phải trần của mô hình (9 / 5,2 / 7,2): đo trên tệp là đo
  thứ người ngoài kiểm được, nên nó phải so với con số trong `spec.md`.

  ⚠️ **Mỗi vế mang theo SỐ MẪU, và đó là nửa quan trọng hơn của kết quả.** Một
  phép đo không có mẫu nào trả về "không vi phạm" — y hệt một phép đo đúng. Số
  mẫu là thứ duy nhất phân biệt hai chuyện ấy, nên `doCoHoc.test.ts` khẳng định
  từng con số ấy, và `VE_CHUA_CO_MAU` khai thẳng những vế hôm nay rỗng.

  ⚠️ **Lề của phép so phải DẪN XUẤT từ phép làm tròn của tệp, không đặt tay.**
  Đây đúng là bài học ULP của T704 lặp lại ở một tầng khác: ở đó `Float32Array`
  làm 9 thành 9,0000005; ở đây `tron(x, 2)` làm mọi toạ độ lệch tới 0,005 m, và
  một phép chia cho `Δt` nhỏ **phóng đại** sai số ấy lên. Mọi lề dưới đây tính
  ra từ `SO_LE_MET` và `SO_LE_GOC` chứ không phải từ một con số tôi thấy đẹp.
*/

/** Một vi phạm đo được trên tệp. */
export interface ViPham {
  /** Mã AC kèm vế, ví dụ `AC-38.3(ii)`. */
  readonly ve: string
  /** Giây trong trận, lấy từ chính cột `t` của tệp. */
  readonly giay: number
  /** Mã ngắn của ô gây vi phạm, hoặc `BONG` / `TRAN`. */
  readonly o: string
  readonly doDuoc: number
  readonly nguong: number
  readonly ghiChu: string
}

export interface KetQuaDoCoHoc {
  readonly viPham: readonly ViPham[]
  /** Số mẫu đã đo cho **từng vế** — 0 nghĩa là vế ấy **rỗng**, không phải đạt. */
  readonly soMau: Readonly<Record<string, number>>
}

/**
 * Mười AC mà module này đo, và **từng vế** của chúng.
 *
 * Chẻ tới mức vế chứ không tới mức AC là cố ý: AC-38.3 có hai vế, và chính chỗ
 * **không gọi tên vế (ii)** là cách vế ấy biến mất lần đầu. Một bảng số mẫu
 * theo AC sẽ báo "AC-38.3: 28.000 mẫu" trong khi vế (ii) có 0.
 */
export const CAC_VE = [
  'AC-38.1(i)',
  'AC-38.1(ii)',
  'AC-38.2(tăng)',
  'AC-38.2(giảm)',
  'AC-38.3(i)',
  'AC-38.3(ii)',
  'AC-38.4(lùi)',
  'AC-38.4(ngang)',
  'AC-38.5(đánh đầu)',
  'AC-38.5(khống chế)',
  'AC-38.6(dải)',
  'AC-38.6(thời gian bay)',
  'AC-38.7',
  'AC-38.9',
  'AC-38.10(c)',
  'AC-38.10(d)',
  'AC-38.11',
] as const

export type Ve = (typeof CAC_VE)[number]

/**
 * Những vế mà tệp hôm nay **không có mẫu** để đo, kèm lý do. Khai ở đây chứ
 * không im: một vế không có mẫu mà báo "đạt" là một lời nói dối có cấu trúc.
 *
 * ⚠️ **BỐN vế, không phải một — sửa 2026-11-27 khi `AC-45.6` được khai lại.**
 * Hằng này từng chỉ liệt `AC-38.7`, trong khi `doCoHoc.test.ts` đã có một phép
 * kiểm liệt **bốn** vế rỗng bằng một mảng viết tay ngay trong thân `it`. Hai
 * danh sách cho cùng một sự thật là một danh sách sẽ lệch; nay phép kiểm ấy so
 * với **hằng này**.
 *
 * Lý do của từng vế, đo trên 5 mã `MAU_RONG` ngày 2026-11-27:
 *
 * - **`AC-38.7`** (ma sát lăn sệt) — mô hình pha bóng của `dienPha.ts` không có
 *   trạng thái "bóng lăn tự do": mỗi hành động **giao** bóng tới một vùng, và
 *   `vungKetThuc` là chỗ pha kết thúc **theo định nghĩa**. Ma sát chỉ có việc
 *   khi có quả bóng **không ai điều khiển** đang lăn — thứ **spec 008** mang
 *   vào cùng luật IFAB. Canh ở mức hàm thuần trong `vatLyBong.test.ts`.
 * - **`AC-38.6(dải)` và `AC-38.6(thời gian bay)`** — cùng một gốc, và số đo
 *   nói thẳng: tệp có **9.058 cặp mốc liên tiếp mà `nguoi_giu = -1`**, và
 *   trong **cả 9.058 cặp ấy quả bóng dịch 0,000 m**. Nói cách khác, trạng thái
 *   "không ai giữ" trong tệp **luôn là bóng chết**, không bao giờ là bóng đang
 *   bay: đường chuyền được **trao tay** giữa hai mốc. Canh ở mức hàm thuần
 *   trong `vatLyBong.test.ts` (6 `it`) và trên 10 mã ở `tranLienTuc.test.ts`.
 * - **`AC-38.5(đánh đầu)`** — cần `z` ∈ [1,5; 2,8] **bên trong một khung dày**,
 *   mà **0 / 3.254** khung dày có `z > 0`. Bóng bổng **có thật** (quả tạt được
 *   canh ở `vatLyBong.test.ts` và `tranLienTuc.test.ts`), nó chỉ không bao giờ
 *   rơi vào một cửa sổ tình huống — vì `laTinhHuongQuanTrong` chọn theo **loại
 *   sự kiện** (bàn thắng, cơ hội rõ, cứu thua, thẻ đỏ), và quả tạt không nằm
 *   trong bốn toán hạng ấy.
 *
 * 📌 Vế này là **tự đúng theo cấu trúc** (xem chú thích tại chỗ đo), nên 0 mẫu
 * ở đây mất ít hơn ba vế trên — nhưng nó vẫn là 0, và vẫn được gọi tên.
 */
export const VE_CHUA_CO_MAU: readonly Ve[] = [
  'AC-38.5(đánh đầu)',
  'AC-38.5(khống chế)',
  'AC-38.7',
]

/*
  ⚠️⚠️ **DANH SÁCH NÀY ĐỔI NGÀY 2026-11-27 VÌ `T816`, VÀ NÓ ĐỔI THEO HAI CHIỀU
  NGƯỢC NHAU — ĐỌC CẢ HAI.**

  **RA KHỎI danh sách — `AC-38.6(dải)` và `AC-38.6(thời gian bay)`.** Hai vế ấy
  rỗng suốt từ T742, và lý do đã ghi ở trên: trạng thái "không ai giữ" trong tệp
  **luôn là bóng chết**. `T816` sửa đúng chỗ đó — nay `nguoi_giu` là `-1` suốt
  quãng bóng **đang bay** — và hai vế lập tức có mẫu: **914** và **207** trên
  một mã. Một ngoại lệ của `AC-45.6` biến mất **không phải** vì ai nới lời AC,
  mà vì cái lỗ nó che đã được bịt.

  📌 Và chúng **đỏ ngay**: 280/914 và 144/207. Món nợ ấy có tên trong khối
  "MÓN NỢ" của `doCoHoc.test.ts`; nó thuộc **cùng họ** với T742 (đo trên lưới
  1 giây một đại lượng sống ở dưới một giây), không phải một lỗi mới của mô
  hình.

  **VÀO danh sách — `AC-38.5(khống chế)`.** Vế ấy đếm người `dan_bong`, và
  `trangThaiCuaNguoi` chỉ gán `dan_bong` cho **người đang giữ bóng**. Sau T816,
  "đang giữ" nghĩa là **đang chạm** (trong `TAM_CHAM_BONG = 1,0 m`), nên trong
  **khối dày** — vốn phủ đúng những pha bóng **rời chân**: sút, tạt, rồi bóng
  chết — không còn khung nào có người dẫn bóng. 1.072 mẫu → **0**.

  📌 **Và đó là một lời SỬA, không phải một mất mát.** Trước T816, người sở hữu
  chuỗi hiện là `dan_bong` **trong lúc cú sút của chính anh ta đang bay** — tệp
  nói anh ta đang dẫn bóng trong khi quả bóng cách anh ta 30 m. Mất 1.072 mẫu
  ấy là mất 1.072 lần nói sai.
*/

/**
 * Hai vế của AC-38.10 mà **tệp không chứa dữ liệu để đo**, và vì sao.
 *
 * ⚠️ Đây là một **lệch có tên** so với điều kiện ra của T742, không phải một
 * chỗ tôi bỏ qua cho dễ. Vế (a) nói về chỗ trọng tài **NHẮM TỚI**, vế (b) nói
 * chỗ ấy không nằm trên **đường chuyền**. Tệp xuất chứa **vị trí thật** ở từng
 * mốc; nó không chứa đích, cũng không chứa đoạn thẳng người giữ → người nhận.
 * Dựng lại hai thứ ấy từ tệp là **chạy lại engine**, không phải đo tệp — và
 * một phép đo tự dựng lại đầu vào của mô hình rồi so với đầu ra của chính mô
 * hình thì không bác được gì.
 *
 * Hai vế ấy được canh ở **mức hàm thuần** trong `coHoc.test.ts` (T716), nơi
 * `viTriTrongTai` trả thẳng cái đích. Vế (c) và (d) đo được từ tệp và **đo ở
 * đây**.
 */
export const VE_KHONG_DO_DUOC_TU_TEP: readonly string[] = [
  'AC-38.10(a)',
  'AC-38.10(b)',
]

/*
  ====================================================================
  LỀ CỦA PHÉP SO — DẪN XUẤT, KHÔNG ĐẶT TAY.
  ====================================================================
*/

/** Sai số tối đa của **một** toạ độ sau `tron(x, SO_LE_MET)`, mét. */
export const LE_TRON_MET = 0.5 * 10 ** -SO_LE_MET

/** Sai số tối đa của **một** góc sau `tron(g, SO_LE_GOC)`, độ. */
export const LE_TRON_GOC = 0.5 * 10 ** -SO_LE_GOC

/**
 * Sai số tối đa của một **quãng** đo giữa hai mốc: bốn toạ độ, mỗi cái lệch
 * tới `LE_TRON_MET`.
 */
export const LE_QUANG = 4 * LE_TRON_MET

/**
 * Bước nhỏ nhất của lưới thời gian, giây — mốc dày cách nhau 0,5 giây.
 *
 * Chia cho `Δt` là **phóng đại** sai số quãng, nên lề tốc độ lấy ở `Δt` nhỏ
 * nhất: đó là trường hợp xấu nhất, và một lề chỉ đúng ở trường hợp trung bình
 * là một lề sẽ đỏ oan ở đúng những mốc dày mà AC-45.6 quan tâm nhất.
 */
export const DT_NHO_NHAT = 0.5

/** Lề của phép so **tốc độ**, m/s. */
export const LE_TOC = LE_QUANG / DT_NHO_NHAT

/** Lề của phép so **gia tốc**, m/s² — hai tốc độ, mỗi cái lệch `LE_TOC`. */
export const LE_GIA_TOC = (2 * LE_TOC) / DT_NHO_NHAT

/**
 * Quãng nhỏ nhất để một phép đo **góc** còn có nghĩa, mét.
 *
 * Góc của một vector ngắn thì vô định: hai toạ độ lệch 0,005 m trên một bước
 * dài 0,02 m cho một hướng gần như ngẫu nhiên. Ngưỡng này giữ sai số góc dưới
 * `atan(2·LE_TRON_MET / QUANG_TOI_THIEU_GOC)` ≈ 0,6°, và mọi bước ngắn hơn bị
 * **bỏ khỏi mẫu** — có ghi số mẫu nên chỗ bỏ ấy không ẩn đi được.
 */
export const QUANG_TOI_THIEU_GOC = 1

/** Lề của phép so **góc**, độ. */
export const LE_GOC =
  LE_TRON_GOC +
  (Math.atan2(2 * LE_TRON_MET, QUANG_TOI_THIEU_GOC) * 180) / Math.PI

/** Giá trị cột `nguoi_giu` khi **không ai** giữ bóng — xem `tepXuat.hangCuaLo`. */
export const KHONG_AI_GIU_TRONG_TEP = -1

/** Trần dưới của AC-38.1 vế (ii), m/s. */
export const TOC_PHA_DAI = 7

/** Thời lượng tối đa của một pha trên `TOC_PHA_DAI`, giây — AC-38.1 vế (ii). */
export const GIAY_PHA_DAI_TOI_DA = 4

/** Tốc độ mà AC-38.3 vế (i) gọi là "đang nhanh", m/s — con số của AC. */
export const TOC_DOI_HUONG_GAP = 3

/** Tỉ lệ tốc độ còn lại mà AC-38.3 vế (ii) cho phép. */
export const TI_LE_CON_LAI_38_3 = 0.6

/**
 * Lề của vế (c) AC-38.10: trợ lý lệch khỏi hàng hậu vệ cuối bao nhiêu mét.
 *
 * ⚠️ **Con số này đến TỪ PHÉP ĐO, không từ AC** — và nói thẳng ra thì đây là
 * nửa còn lại của con số mà `coHoc.test.ts` (T716) đã ghi là "để sau": ở đó vế
 * (c) đúng **theo cấu trúc** vì `viTriTrongTai` trả thẳng `xTroLy(hậu vệ
 * cuối)`. Trên tệp thì nó là **vị trí thật**, nên nó mang theo **độ trễ đuổi**:
 * "hàng hậu vệ cuối" là `x` nhỏ thứ hai trong 11 ô, nên một người băng lên là
 * cả "hàng" nhảy chỗ, còn trợ lý bị `buocCoHoc` kẹp ở 9 m/s.
 *
 * `LE_DUONG_BIEN_TRO_LY` là nửa đầu — phép kẹp vào trong sân. Nửa sau là con số
 * này, và nó **đo ra**: lệch lớn nhất trên 5 mã trận là **21,00 m** (21,00 /
 * 19,08 / 17,91 / 19,56 / 19,13), nên lề đặt **25 m** — dư **19%**. Một thay
 * đổi đẩy nó quá 25 m là một cuộc nói chuyện, không phải một lần nới số.
 */
export const LE_TRO_LY_THUC = 25

interface Cot {
  readonly t: number
  readonly bong: Readonly<Record<string, number>>
  readonly nguoi: Readonly<Record<string, number>>
  readonly soCotNguoi: number
  readonly goc: number
}

/**
 * Bảng tra cột, dựng **từ hàng tiêu đề của chính tệp**.
 *
 * Mọi chỗ sau đây hỏi cột bằng tên. Đổi thứ tự `KHOA_NGUOI` thì phép đo ra
 * **đúng y nguyên** con số cũ, và `doCoHoc.test.ts` chứng minh điều đó bằng
 * một tệp đã đảo cột.
 */
function bangCot(tep: TepXuat): Cot {
  const bong: Record<string, number> = {}
  tep.moc.khoa_bong.forEach((k, i) => {
    bong[k] = 1 + i
  })
  const nguoi: Record<string, number> = {}
  tep.moc.khoa_nguoi.forEach((k, i) => {
    nguoi[k] = i
  })
  for (const k of ['x', 'y', 'z', 'nguoi_giu']) {
    if (bong[k] === undefined) throw new Error(`tệp không có cột bóng '${k}'`)
  }
  for (const k of ['x', 'y', 'huong_nguoi']) {
    if (nguoi[k] === undefined) throw new Error(`tệp không có cột người '${k}'`)
  }
  return {
    t: 0,
    bong,
    nguoi,
    soCotNguoi: tep.moc.khoa_nguoi.length,
    goc: 1 + tep.moc.khoa_bong.length,
  }
}

function oCua(cot: Cot, chiSoO: number, ten: string): number {
  return cot.goc + chiSoO * cot.soCotNguoi + cot.nguoi[ten]!
}

function soTai(hang: readonly number[], cot: number): number {
  const v = hang[cot]
  if (v === undefined) throw new Error(`hàng thiếu cột ${cot}`)
  return v
}

/** Góc của một vector, độ trong [0; 360). */
function gocCua(dx: number, dy: number): number {
  return chuanHoaGoc((Math.atan2(dy, dx) * 180) / Math.PI)
}

/**
 * Chênh lệch góc ngắn nhất giữa hai hướng, độ trong [0; 180].
 *
 * 🐞 **Bản đầu của hàm này bị ĐẢO, và bộ test ngược là thứ bắt được.** Tôi viết
 * `180 - Math.abs(((a - b + 540) % 360) - 180)`, tức nó trả **0** cho hai hướng
 * ngược nhau và **180** cho hai hướng trùng nhau. Phép đo trên trận thật vẫn
 * chạy, vẫn ra hàng nghìn "vi phạm", và chú thích của chúng vẫn ghi "đổi hướng
 * 180°" — nhưng chúng là những người đang chạy **thẳng**. Ca ngược "bơm một cú
 * quay 180° ở 5 m/s" ra **0** vi phạm là chỗ duy nhất nói ra điều đó.
 *
 * Đây đúng là lý do điều kiện ra của T742 đòi bộ test ngược: một phép đo chỉ
 * chạy chiều thuận thì một dấu trừ sai cho ra **nhiều** vi phạm hơn, và "nhiều
 * vi phạm" trông y như một phép đo đang làm việc.
 */
export function lechGoc(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180)
}

/**
 * Đo mười AC cơ học trên một tệp xuất.
 *
 * Hàm **thuần**: cùng tệp ra cùng danh sách vi phạm. Không đọc đồng hồ, không
 * rút ngẫu nhiên, không chạy lại trận — nó chỉ đọc những con số đã có trong
 * tệp, đúng nghĩa "kiểm được từ bên ngoài" của AC-45.6.
 */
export function doCoHoc(tep: TepXuat): KetQuaDoCoHoc {
  const viPham: ViPham[] = []
  const soMau: Record<string, number> = {}
  for (const ve of CAC_VE) soMau[ve] = 0

  const cot = bangCot(tep)
  const hang = tep.moc.hang
  const o = tep.khoi_dau.o
  const soO = o.length
  const laTrongTai = o.map((ten) =>
    (MA_TRONG_TAI as readonly string[]).includes(ten),
  )

  const them = (
    ve: Ve,
    giay: number,
    oTen: string,
    doDuoc: number,
    nguong: number,
    ghiChu: string,
  ) => {
    viPham.push({ ve, giay, o: oTen, doDuoc, nguong, ghiChu })
  }
  const dem = (ve: Ve) => {
    soMau[ve] = (soMau[ve] ?? 0) + 1
  }

  /** Bước của một ô giữa hai hàng: quãng, hướng đi, tốc độ. */
  const buoc = (truoc: readonly number[], nay: readonly number[], i: number) => {
    const dt = soTai(nay, cot.t) - soTai(truoc, cot.t)
    const dx = soTai(nay, oCua(cot, i, 'x')) - soTai(truoc, oCua(cot, i, 'x'))
    const dy = soTai(nay, oCua(cot, i, 'y')) - soTai(truoc, oCua(cot, i, 'y'))
    const quang = Math.hypot(dx, dy)
    return { dt, dx, dy, quang, toc: dt > 0 ? quang / dt : 0 }
  }

  const bongX = (r: readonly number[]) => soTai(r, cot.bong['x']!)
  const bongY = (r: readonly number[]) => soTai(r, cot.bong['y']!)
  const nguoiGiu = (r: readonly number[]) => soTai(r, cot.bong['nguoi_giu']!)

  /*
    AC-38.1 vế (ii) đo trên **một chuỗi mốc**, không trên một cặp: "một pha trên
    7 m/s phải không kéo dài quá 4 giây liên tục". Nên mỗi ô mang một đồng hồ
    riêng, và nó phải sống qua cả vòng lặp.
  */
  const batDauPhaDai: (number | null)[] = Array.from({ length: soO }, () => null)

  for (let h = 1; h < hang.length; h += 1) {
    const truoc = hang[h - 1]!
    const nay = hang[h]!
    const giay = soTai(nay, cot.t)
    const dt = giay - soTai(truoc, cot.t)
    if (dt <= 0) continue

    for (let i = 0; i < soO; i += 1) {
      const ten = o[i] ?? `o${i}`
      const b = buoc(truoc, nay, i)

      // ---- AC-38.1 vế (i): trần tốc độ tuyệt đối ----
      dem('AC-38.1(i)')
      if (b.toc > TRAN_TOC_DO_TUYET_DOI + LE_TOC) {
        them('AC-38.1(i)', giay, ten, b.toc, TRAN_TOC_DO_TUYET_DOI, 'tốc độ vượt trần')
      }

      /*
        ---- AC-38.1 vế (ii): pha trên 7 m/s không quá 4 giây liên tục ----

        Mỗi mốc đóng góp **một** mẫu cho vế này, kể cả mốc dưới ngưỡng: mốc dưới
        ngưỡng là chỗ đồng hồ **được phép** dừng, và một phép đo chỉ đếm mốc
        nhanh sẽ không bao giờ thấy một chuỗi kết thúc.
      */
      dem('AC-38.1(ii)')
      if (b.toc > TOC_PHA_DAI + LE_TOC) {
        const batDau = batDauPhaDai[i] ?? soTai(truoc, cot.t)
        batDauPhaDai[i] = batDau
        const keoDai = giay - batDau
        if (keoDai > GIAY_PHA_DAI_TOI_DA + DT_NHO_NHAT) {
          them('AC-38.1(ii)', giay, ten, keoDai, GIAY_PHA_DAI_TOI_DA, 'pha nhanh kéo dài')
          batDauPhaDai[i] = null
        }
      } else {
        batDauPhaDai[i] = null
      }

      // ---- Những vế dưới đây cần HAI bước liền nhau ----
      if (h < 2) continue
      const a = buoc(hang[h - 2]!, truoc, i)
      if (a.dt <= 0) continue

      // ---- AC-38.2: gia tốc và giảm tốc ----
      const dv = (b.toc - a.toc) / dt
      dem('AC-38.2(tăng)')
      if (dv > TRAN_GIA_TOC_AC_38_2 + LE_GIA_TOC) {
        them('AC-38.2(tăng)', giay, ten, dv, TRAN_GIA_TOC_AC_38_2, 'tăng tốc vượt trần')
      }
      dem('AC-38.2(giảm)')
      if (-dv > TRAN_GIAM_TOC_AC_38_2 + LE_GIA_TOC) {
        them('AC-38.2(giảm)', giay, ten, -dv, TRAN_GIAM_TOC_AC_38_2, 'giảm tốc vượt trần')
      }

      // ---- AC-38.3: hai vế, và vế (ii) được GỌI TÊN ----
      if (a.quang >= QUANG_TOI_THIEU_GOC && b.quang >= QUANG_TOI_THIEU_GOC) {
        const doi = lechGoc(gocCua(a.dx, a.dy), gocCua(b.dx, b.dy))
        /*
          Vế (i): đổi hướng **trên 90°** thì tốc độ ở mốc NGAY TRƯỚC phải dưới
          3 m/s. Ngưỡng 3 là con số của AC, và `NGUONG_BANG_CHAM` của `coHoc.ts`
          tình cờ bằng nó — nhập hằng số kia vào đây là trộn trần của mô hình với
          trần của AC, đúng cái bẫy mà hai trần AC-38.2 vừa phải tách ra.
        */
        dem('AC-38.3(i)')
        if (doi > 90 + LE_GOC && a.toc >= TOC_DOI_HUONG_GAP + LE_TOC) {
          them(
            'AC-38.3(i)',
            giay,
            ten,
            a.toc,
            TOC_DOI_HUONG_GAP,
            `đổi hướng ${doi.toFixed(0)}° khi đang nhanh`,
          )
        }
        /*
          Vế (ii): `45° ≤ Δθ ≤ 90° → |v(sau)| ≤ 0,60 · |v(trước)|`. Chính chỗ
          **không gọi tên** vế này là cách nó biến mất lần đầu, nên nó có tên
          riêng trong `CAC_VE` và số mẫu riêng.
        */
        dem('AC-38.3(ii)')
        if (
          doi >= 45 - LE_GOC &&
          doi <= 90 + LE_GOC &&
          b.toc > TI_LE_CON_LAI_38_3 * a.toc + LE_TOC
        ) {
          them(
            'AC-38.3(ii)',
            giay,
            ten,
            b.toc,
            TI_LE_CON_LAI_38_3 * a.toc,
            `đổi hướng ${doi.toFixed(0)}° mà không mất tốc`,
          )
        }
      }

      /*
        ---- AC-38.4 và AC-38.11: hướng mặt so với hướng đi ----

        **Ba điểm trọng tài được miễn hai AC này**, người dùng chốt ngày
        2026-11-23 (mục 9 của spec): một trọng tài chạy giật lùi theo pha bóng là
        chuyện thật, và `huong` của ba ô ấy không mang nghĩa "mặt quay đâu".
      */
      if (b.quang >= QUANG_TOI_THIEU_GOC && !laTrongTai[i]) {
        const huong = soTai(nay, oCua(cot, i, 'huong_nguoi'))
        const lech = lechGoc(huong, gocCua(b.dx, b.dy))

        /*
          Phân loại **bằng chính** `GOC_TIEN_TOI_DA` / `GOC_NGANG_TOI_DA` của
          `coHoc.ts`: AC-38.4 nêu trần của "lùi" và "ngang" mà **không** nói
          chúng bắt đầu từ góc nào, nên một phép đo tự chọn ranh giới khác là đo
          một thứ khác với thứ engine kẹp.
        */
        if (lech > GOC_NGANG_TOI_DA) {
          dem('AC-38.4(lùi)')
          if (b.toc > TOC_DO_LUI_TOI_DA + LE_TOC) {
            them('AC-38.4(lùi)', giay, ten, b.toc, TOC_DO_LUI_TOI_DA, 'chạy lùi quá nhanh')
          }
        } else if (lech > GOC_TIEN_TOI_DA) {
          dem('AC-38.4(ngang)')
          if (b.toc > TOC_DO_NGANG_TOI_DA + LE_TOC) {
            them('AC-38.4(ngang)', giay, ten, b.toc, TOC_DO_NGANG_TOI_DA, 'chạy ngang quá nhanh')
          }
        }

        dem('AC-38.11')
        const lechChoPhep = lechToiDaTheoTocDo(b.toc)
        if (lech > lechChoPhep + LE_GOC) {
          them('AC-38.11', giay, ten, lech, lechChoPhep, 'hướng mặt lệch quá xa hướng đi')
        }
      }
    }

    /*
      ---- AC-38.6 vế (dải): tốc độ quả bóng KHI KHÔNG AI GIỮ ----

      Phân biệt bằng cột `nguoi_giu`, không bằng một ngưỡng tốc độ. Quả bóng
      trong chân người dẫn đi đúng tốc độ **người**, nên nó nằm dưới sàn 12 m/s
      một cách chính đáng; lọc nó ra bằng tốc độ là lấy kết luận làm tiền đề.
    */
    const quangBong = Math.hypot(
      bongX(nay) - bongX(truoc),
      bongY(nay) - bongY(truoc),
    )
    const tocBong = quangBong / dt
    const tuDo =
      nguoiGiu(truoc) === KHONG_AI_GIU_TRONG_TEP &&
      nguoiGiu(nay) === KHONG_AI_GIU_TRONG_TEP
    if (tuDo && quangBong > LE_QUANG) {
      dem('AC-38.6(dải)')
      if (tocBong > TOC_DO_CHUYEN_DAI_CAO + LE_TOC) {
        them('AC-38.6(dải)', giay, 'BONG', tocBong, TOC_DO_CHUYEN_DAI_CAO, 'bóng vượt dải')
      }
      if (tocBong < TOC_DO_CHUYEN_NGAN_THAP - LE_TOC) {
        them('AC-38.6(dải)', giay, 'BONG', tocBong, TOC_DO_CHUYEN_NGAN_THAP, 'bóng dưới dải')
      }
    }

    /*
      ---- AC-38.6 vế (thời gian bay): quãng PHẢI khớp tốc độ × thời gian ----

      Đo bằng cách so bước này với bước trước của **cùng** một đường bóng: tốc
      độ ngang của một quả bóng đã rời chân là **hằng số** (`phatBong` giữ nó
      như thế), nên hai bước liền nhau phải cho cùng một tốc độ. Lệch đi nghĩa
      là quãng và thời gian **không** khớp nhau — đúng điều AC đòi.
    */
    if (h >= 2 && tuDo) {
      const truocNua = hang[h - 2]!
      const dtTruoc = soTai(truoc, cot.t) - soTai(truocNua, cot.t)
      const quangTruoc = Math.hypot(
        bongX(truoc) - bongX(truocNua),
        bongY(truoc) - bongY(truocNua),
      )
      if (
        dtTruoc > 0 &&
        nguoiGiu(truocNua) === KHONG_AI_GIU_TRONG_TEP &&
        quangTruoc > LE_QUANG &&
        quangBong > LE_QUANG
      ) {
        const tocTruoc = quangTruoc / dtTruoc
        dem('AC-38.6(thời gian bay)')
        if (Math.abs(tocBong - tocTruoc) > 2 * LE_TOC) {
          them(
            'AC-38.6(thời gian bay)',
            giay,
            'BONG',
            Math.abs(tocBong - tocTruoc),
            0,
            `tốc độ ngang đổi giữa đường bay: ${tocTruoc.toFixed(2)} → ${tocBong.toFixed(2)}`,
          )
        }
      }
    }

    /*
      ---- AC-38.10 vế (d): khoảng cách THẬT tới bóng lệch khỏi 25 m ----

      Vế (a) và (b) **không đo được từ tệp** — xem `VE_KHONG_DO_DUOC_TU_TEP`.
    */
    const iRef = o.indexOf(MA_TRONG_TAI[0])
    if (iRef >= 0) {
      const dRef = Math.hypot(
        soTai(nay, oCua(cot, iRef, 'x')) - bongX(nay),
        soTai(nay, oCua(cot, iRef, 'y')) - bongY(nay),
      )
      dem('AC-38.10(d)')
      const doTre = Math.abs(dRef - KHOANG_TRONG_TAI)
      if (doTre > LE_DO_TRE_TRONG_TAI + LE_QUANG) {
        them(
          'AC-38.10(d)',
          giay,
          MA_TRONG_TAI[0],
          doTre,
          LE_DO_TRE_TRONG_TAI,
          'trọng tài trễ quá lề',
        )
      }
    }

    /*
      ---- AC-38.10 vế (c): mỗi trợ lý ngang hàng hậu vệ cuối ----

      "Hậu vệ cuối cùng" là người sâu thứ **HAI**, không phải sâu nhất: người
      sâu nhất là thủ môn, và bám anh ta thì hai trợ lý đứng cạnh hai khung
      thành cả trận. Đây đúng định nghĩa `hangThuCuoiCua` của `tranLienTuc.ts`,
      và phép đo phải dùng cùng định nghĩa ấy mới đo được thứ engine nhắm.
    */
    const xNha: number[] = []
    const xKhach: number[] = []
    for (let i = 0; i < soO; i += 1) {
      if (laTrongTai[i]) continue
      const x = soTai(nay, oCua(cot, i, 'x'))
      if (i < 11) xNha.push(x)
      else xKhach.push(x)
    }
    xNha.sort((p, q) => p - q)
    xKhach.sort((p, q) => q - p)
    const capTroLy = [
      [o.indexOf(MA_TRONG_TAI[1]), xNha[1] ?? xNha[0]],
      [o.indexOf(MA_TRONG_TAI[2]), xKhach[1] ?? xKhach[0]],
    ] as const
    for (const [iAR, hangThu] of capTroLy) {
      if (iAR < 0 || hangThu === undefined) continue
      dem('AC-38.10(c)')
      const xAR = soTai(nay, oCua(cot, iAR, 'x'))
      const keo = Math.min(
        Math.max(hangThu, LE_DUONG_BIEN_TRO_LY),
        DAI_SAN - LE_DUONG_BIEN_TRO_LY,
      )
      const lech = Math.abs(xAR - keo)
      if (lech > LE_TRO_LY_THUC + LE_QUANG) {
        them(
          'AC-38.10(c)',
          giay,
          o[iAR] ?? '?',
          lech,
          LE_TRO_LY_THUC,
          'trợ lý lệch khỏi hàng hậu vệ cuối',
        )
      }
    }
  }

  /*
    ====================================================================
    AC-38.5 — HAI VẾ, VÀ MỘT TRONG HAI LÀ TỰ ĐÚNG. ĐO CẢ HAI, NÓI RÕ CẢ HAI.
    ====================================================================

    Vế **(đánh đầu)** — `trang_thai === 'danh_dau'` thì `z` ∈ [1,5; 2,8] — là
    **tự đúng theo cấu trúc**: `trangThaiCuaNguoi` gán đúng trạng thái ấy khi và
    chỉ khi `laTamDanhDau(z)`. Nó vẫn được đo, vì nó canh chỗ **nối**: ngày ai
    đó dựng `trang_thai` từ một nguồn khác, phép kiểm này là thứ đỏ. Nhưng nó
    được **gọi đúng tên** là tự đúng, chứ không được đếm như một phép đo đã bác
    được điều gì.

    Vế **(khống chế)** thì không tự đúng: "PHẢI chỉ khống chế bằng chân, đùi
    hoặc ngực khi z dưới 1,5 m" nghĩa là một người `dan_bong` với quả bóng **trên
    1,5 m** là một vi phạm thật — và không có gì trong `trangThaiCuaNguoi` chặn
    nó, vì nó chỉ hỏi `laTamDanhDau(z)`, tức `1,5 ≤ z ≤ 2,8`. Quả bóng ở 4 m thì
    người giữ thành `dan_bong`, và đó đúng là lỗi vế này bắt.
  */
  for (const th of tep.tinh_huong) {
    for (const k of th.khung) {
      for (const c of k.cau_thu) {
        if (c.trang_thai === 'danh_dau') {
          dem('AC-38.5(đánh đầu)')
          if (
            k.bong.z < Z_DANH_DAU_THAP - LE_TRON_MET ||
            k.bong.z > Z_DANH_DAU_CAO + LE_TRON_MET
          ) {
            them(
              'AC-38.5(đánh đầu)',
              k.t,
              c.id,
              k.bong.z,
              Z_DANH_DAU_CAO,
              'đánh đầu ngoài dải độ cao',
            )
          }
        } else if (c.trang_thai === 'dan_bong') {
          dem('AC-38.5(khống chế)')
          if (k.bong.z >= Z_DANH_DAU_THAP - LE_TRON_MET) {
            them(
              'AC-38.5(khống chế)',
              k.t,
              c.id,
              k.bong.z,
              Z_DANH_DAU_THAP,
              'khống chế bằng chân khi bóng quá cao',
            )
          }
        }
      }
    }
  }

  /*
    ---- AC-38.9: thời tiết và gió dẫn xuất TẤT ĐỊNH từ mã trận ----

    Một mẫu cho cả trận, và đúng một: đây là mệnh đề về **trận**, không về mốc.
    Đếm nó 5.640 lần không làm nó chắc hơn, chỉ làm bảng số mẫu nói dối.
  */
  const mong = dieuKienTuMaTran(tep.khoi_dau.ma_tran)
  dem('AC-38.9')
  if (tep.khoi_dau.thoi_tiet !== mong.thoiTiet) {
    them('AC-38.9', 0, 'TRAN', 0, 0, `thời tiết ${tep.khoi_dau.thoi_tiet} khác ${mong.thoiTiet}`)
  }
  if (Math.abs(tep.khoi_dau.gio_toc_do - mong.tocDoGio) > LE_TRON_MET) {
    them(
      'AC-38.9',
      0,
      'TRAN',
      tep.khoi_dau.gio_toc_do,
      mong.tocDoGio,
      'tốc độ gió không khớp mã trận',
    )
  }
  if (Math.abs(tep.khoi_dau.gio_huong - mong.huongGio) > LE_TRON_GOC) {
    them(
      'AC-38.9',
      0,
      'TRAN',
      tep.khoi_dau.gio_huong,
      mong.huongGio,
      'hướng gió không khớp mã trận',
    )
  }

  return { viPham, soMau }
}
