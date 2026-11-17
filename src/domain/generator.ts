import { POSITION_WEIGHTS } from './attributes'
import { chiSoCanCo } from './completeness'
import type { Formation } from './formations'
import { POSITIONS } from './positions'
import { sinhTen, type KhoTen } from './tenNgauNhien'
import { CHI_SO_MAX, CHI_SO_MIN } from './types'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
  PreferredFoot,
  Rng,
} from './types'

/*
  Sinh nhanh chỉ số (AC-2.9).

  Đây là biện pháp chính cho rủi ro R3 trong plan: một đội 25 cầu thủ là
  khoảng 375 ô phải điền tay, và nếu việc đó quá mệt thì người dùng sẽ không
  bao giờ có đội thứ hai để đấu.

  Hàm nhận nguồn ngẫu nhiên qua tham số và KHÔNG gọi `Math.random` —
  nguyên tắc P1 của hiến pháp. Nhờ vậy cùng một nguồn giả thì ra cùng kết quả,
  và test kiểm được điều đó.
*/

export type MucDo = 'ngoi-sao' | 'kha' | 'trung-binh' | 'yeu'

export interface MucDoMeta {
  readonly id: MucDo
}

/*
  Bốn mức chỉ còn **mã** (T341, quyết định D68). Nhãn nằm ở lớp ngôn ngữ.
*/
export const CAC_MUC_DO: readonly MucDoMeta[] = [
  { id: 'ngoi-sao' },
  { id: 'kha' },
  { id: 'trung-binh' },
  { id: 'yeu' },
]

/** Mức nền cho những chỉ số KHÔNG liên quan tới vị trí của cầu thủ. */
const NEN_THEO_MUC: Readonly<Record<MucDo, number>> = {
  'ngoi-sao': 11,
  kha: 9,
  'trung-binh': 7,
  yeu: 5,
}

/** Cộng thêm theo trọng số của chỉ số với vị trí: càng quan trọng càng cao. */
const CONG_THEO_TRONG_SO: Readonly<Record<number, number>> = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
}

/** Biên độ dao động quanh giá trị đích, để hai cầu thủ cùng mức không giống hệt. */
const BIEN_DO = 2

function nhieu(rng: Rng): number {
  return Math.round((rng.next() * 2 - 1) * BIEN_DO)
}

function ganTrongKhoang(giaTri: number): number {
  return Math.min(CHI_SO_MAX, Math.max(CHI_SO_MIN, giaTri))
}

/**
 * Trọng số cao nhất của một chỉ số trên TẤT CẢ vị trí sở trường của cầu thủ.
 * Nhờ vậy một cầu thủ đá được cả trung vệ và tiền vệ trụ sẽ mạnh ở chỉ số
 * quan trọng của cả hai vị trí, chứ không chỉ vị trí đầu tiên.
 */
function trongSoCaoNhat(
  positions: readonly PositionId[],
  id: AttributeId,
): number {
  let cao = 0
  for (const viTri of positions) {
    const w = POSITION_WEIGHTS[viTri].attributes[id] ?? 0
    if (w > cao) cao = w
  }
  return cao
}

function trongSoThuMonCaoNhat(
  positions: readonly PositionId[],
  id: GkAttributeId,
): number {
  let cao = 0
  for (const viTri of positions) {
    const w = POSITION_WEIGHTS[viTri].gkAttributes?.[id] ?? 0
    if (w > cao) cao = w
  }
  return cao
}

export interface ChiSoDaSinh {
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

/**
 * Sinh đủ bộ chỉ số cho một cầu thủ theo mức và theo vị trí sở trường.
 *
 * Thứ tự lấy số từ `rng` là cố định (theo thứ tự chỉ số trong `chiSoCanCo`),
 * nên cùng một nguồn ngẫu nhiên luôn cho ra cùng kết quả.
 */
export function sinhChiSo(
  muc: MucDo,
  positions: readonly PositionId[],
  rng: Rng,
): ChiSoDaSinh {
  const canCo = chiSoCanCo(positions)
  const nen = NEN_THEO_MUC[muc]

  const attributes: Record<string, number> = {}
  for (const id of canCo.attributes) {
    const w = trongSoCaoNhat(positions, id)
    attributes[id] = ganTrongKhoang(nen + (CONG_THEO_TRONG_SO[w] ?? 0) + nhieu(rng))
  }

  if (canCo.gkAttributes.length === 0) {
    return { attributes: attributes as AttributeValues, gkAttributes: null }
  }

  const gkAttributes: Record<string, number> = {}
  for (const id of canCo.gkAttributes) {
    const w = trongSoThuMonCaoNhat(positions, id)
    gkAttributes[id] = ganTrongKhoang(
      nen + (CONG_THEO_TRONG_SO[w] ?? 0) + nhieu(rng),
    )
  }

  return {
    attributes: attributes as AttributeValues,
    gkAttributes: gkAttributes as GkAttributeValues,
  }
}

// ---------------------------------------------------------------------------
// Sinh MỘT cầu thủ đầy đủ (T402, AC-24.1, AC-24.2, AC-24.3)
// ---------------------------------------------------------------------------

/*
  `sinhChiSo` ở trên chỉ điền chỉ số; người dùng vẫn phải gõ tên, tuổi, số áo
  và vị trí. Phần dưới đây sinh trọn một hồ sơ.

  Nó KHÔNG ghi gì và KHÔNG biết đội là gì: nó nhận danh sách số áo đang dùng
  qua tham số và trả về một hồ sơ. Việc lưu là của `services`.
*/

/** Số áo hợp lệ: 1 tới 99, như ô nhập của form cầu thủ. */
export const SO_AO_MIN = 1
export const SO_AO_MAX = 99

/**
 * Dải tuổi của cầu thủ sinh ra.
 *
 * Spec không chốt con số, nên chọn dải của một đội bóng thật: đủ trẻ để có
 * người mới lên, đủ già để có người sắp nghỉ. Người dùng sửa được sau
 * (AC-24.6), nên đây là điểm khởi đầu chứ không phải một luật.
 */
export const TUOI_MIN = 17
export const TUOI_MAX = 36

/**
 * Chân thuận bốc từ danh sách CÓ LẶP, nên chân phải ra nhiều hơn.
 *
 * Bốc đều ba giá trị thì một đội 18 người có 6 người thuận hai chân — con số
 * đó không giống một đội bóng nào. Lặp phần tử là cách rẻ nhất để có xác
 * suất lệch mà vẫn chỉ tốn đúng một lần gọi `rng`, nên thứ tự lấy số không
 * đổi (P1).
 */
const CHAN_THUAN_THEO_TI_LE: readonly PreferredFoot[] = [
  'phai',
  'phai',
  'phai',
  'phai',
  'phai',
  'phai',
  'trai',
  'trai',
  'trai',
  'ca-hai',
]

function bocSo(tu: number, den: number, rng: Rng): number {
  return tu + Math.min(den - tu, Math.floor(rng.next() * (den - tu + 1)))
}

function bocPhanTu<T>(danh: readonly T[], rng: Rng): T {
  const i = Math.min(danh.length - 1, Math.floor(rng.next() * danh.length))
  return danh[i] as T
}

/** Những số áo từ `SO_AO_MIN` tới `SO_AO_MAX` mà đội chưa dùng. */
export function soAoConTrong(daDung: readonly number[]): readonly number[] {
  const dung = new Set(daDung)
  const ra: number[] = []
  for (let n = SO_AO_MIN; n <= SO_AO_MAX; n += 1) {
    if (!dung.has(n)) ra.push(n)
  }
  return ra
}

export interface DauVaoSinhCauThu {
  readonly muc: MucDo
  readonly kho: KhoTen
  /** Số áo đang dùng trong đội — số sinh ra sẽ không trùng (AC-24.3). */
  readonly soAoDaDung: readonly number[]
  /**
   * Vị trí sở trường muốn có. Không khai thì bốc ngẫu nhiên MỘT vị trí.
   *
   * Bốc một vị trí chứ không bốc nhiều: mọi tổ hợp một vị trí đều hợp lệ,
   * còn tổ hợp nhiều vị trí thì `kiemTraToHopViTri` có luật riêng (thủ môn
   * không kiêm vị trí sân). Sinh ra hồ sơ hợp lệ là việc của hàm này; muốn
   * thêm vị trí thứ hai thì người dùng tự chọn (AC-24.6).
   */
  readonly viTri?: readonly PositionId[]
}

/** Hồ sơ vừa sinh — đúng những trường mà form cầu thủ cần. */
export interface CauThuDaSinh {
  readonly name: string
  readonly shirtNumber: number
  readonly age: number
  readonly preferredFoot: PreferredFoot
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
}

export type KetQuaSinhCauThu =
  | { readonly sinhDuoc: true; readonly cauThu: CauThuDaSinh }
  /** Đội đã dùng hết số áo từ 1 tới 99 (trường hợp biên ở spec mục 5). */
  | { readonly sinhDuoc: false; readonly lyDo: 'het-so-ao' }

/**
 * Sinh một hồ sơ cầu thủ đầy đủ (AC-24.1).
 *
 * **Số áo bốc từ tập CÒN TRỐNG, không bốc rồi thử lại.** Vòng "bốc tới khi
 * chưa trùng" chạy đúng ở mọi trường hợp thường gặp và **treo vĩnh viễn**
 * ở đúng một trường hợp: đội đã dùng hết 99 số. Lọc trước rồi bốc thì
 * trường hợp ấy thành một câu trả lời, không thành một vòng lặp vô tận.
 *
 * **Thứ tự lấy số từ `rng` là cố định** (P1): tên → vị trí (chỉ khi không
 * khai) → tuổi → chân thuận → số áo → chỉ số. Cùng một nguồn ngẫu nhiên và
 * cùng đầu vào thì ra cùng một hồ sơ.
 */
export function sinhCauThu(
  dauVao: DauVaoSinhCauThu,
  rng: Rng,
): KetQuaSinhCauThu {
  const conTrong = soAoConTrong(dauVao.soAoDaDung)
  if (conTrong.length === 0) {
    return { sinhDuoc: false, lyDo: 'het-so-ao' }
  }

  const name = sinhTen(dauVao.kho, rng)

  const positions =
    dauVao.viTri !== undefined && dauVao.viTri.length > 0
      ? dauVao.viTri
      : [bocPhanTu(POSITIONS, rng).id]

  const age = bocSo(TUOI_MIN, TUOI_MAX, rng)
  const preferredFoot = bocPhanTu(CHAN_THUAN_THEO_TI_LE, rng)
  const shirtNumber = bocPhanTu(conTrong, rng)
  const chiSo = sinhChiSo(dauVao.muc, positions, rng)

  return {
    sinhDuoc: true,
    cauThu: {
      name,
      shirtNumber,
      age,
      preferredFoot,
      positions,
      attributes: chiSo.attributes,
      gkAttributes: chiSo.gkAttributes,
    },
  }
}

// ---------------------------------------------------------------------------
// Sinh CẢ MỘT ĐỘI (T405, AC-24.4)
// ---------------------------------------------------------------------------

export interface DauVaoSinhDoi {
  readonly muc: MucDo
  readonly kho: KhoTen
  /**
   * Sơ đồ đội sẽ dùng. Quân số lấy từ **số ô của sơ đồ**, không nhận qua một
   * tham số riêng: hai con số ấy buộc phải khớp nhau, nên để người gọi khai
   * cả hai là mở sẵn một đường cho chúng lệch nhau.
   */
  readonly soDo: Formation
  /**
   * Số dự bị sinh thêm.
   *
   * Đi vào bằng THAM SỐ, không import: hằng số `SO_CAU_THU_DU_BI_TOI_DA` nằm
   * ở `engine/batDau.ts`, và `domain` import `engine` là phụ thuộc vòng —
   * `engine` đã đọc `domain`. `domain/boundaries.test.ts` hiện KHÔNG chặn
   * đường import ấy, nên không phép kiểm nào bắt được nếu làm sai; đây là
   * chỗ phải tự giữ.
   */
  readonly soDuBi: number
}

/**
 * Sinh đủ người cho một đội đá được ngay (AC-24.4).
 *
 * **Mỗi ô của sơ đồ được một người đá đúng sở trường.** Người thứ `i` trong
 * `quanSo` người đầu nhận đúng vị trí của ô thứ `i`, nên một sơ đồ có hai
 * trung vệ thì sinh ra hai trung vệ — phân bố của đội khớp phân bố của sơ đồ
 * chứ không khớp một bảng tỉ lệ nào tôi tự đặt.
 *
 * **Dự bị bốc vị trí TỪ CHÍNH danh sách vị trí của sơ đồ**, không bốc trong
 * cả 12 vị trí. Bốc trong 12 vị trí thì một lần sinh có thể ra bảy thủ môn
 * dự bị — đúng rủi ro R36 ("sinh ra một đội vô lý"), và nó không lộ ra ở
 * phép kiểm nào khác vì đội ấy vẫn đá được.
 *
 * Số áo không trùng nhau trong đội: danh sách đã dùng lớn dần theo từng
 * người, và `sinhCauThu` loại chúng ra (AC-24.3).
 */
export function sinhDoi(
  dauVao: DauVaoSinhDoi,
  rng: Rng,
): readonly CauThuDaSinh[] {
  const viTriCuaSoDo = dauVao.soDo.oVien.map((o) => o.viTri)
  const tong = viTriCuaSoDo.length + dauVao.soDuBi

  const ra: CauThuDaSinh[] = []
  const soAoDaDung: number[] = []

  for (let i = 0; i < tong; i += 1) {
    const viTri =
      i < viTriCuaSoDo.length
        ? [viTriCuaSoDo[i] as PositionId]
        : [bocPhanTu(viTriCuaSoDo, rng)]

    const kq = sinhCauThu(
      { muc: dauVao.muc, kho: dauVao.kho, soAoDaDung, viTri },
      rng,
    )

    /*
      Không thể xảy ra với một đội mới: tổng nhiều nhất là 11 + 7 = 18, còn
      dải số áo là 99. Nếu nó xảy ra thì đó là lỗi lập trình — hiến pháp mục
      4 đòi lỗi lập trình phải lộ ra ngay, không được che.
    */
    if (!kq.sinhDuoc) {
      throw new Error(`sinhDoi: hết số áo ở người thứ ${i + 1}/${tong}`)
    }

    ra.push(kq.cauThu)
    soAoDaDung.push(kq.cauThu.shirtNumber)
  }

  return ra
}
