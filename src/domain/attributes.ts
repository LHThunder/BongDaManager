import type {
  AttributeId,
  AttributeMeta,
  GkAttributeId,
  PositionId,
} from './types'

/** 15 chỉ số của cầu thủ sân, theo đúng thứ tự và nhóm ở AC-2.2. */
export const ATTRIBUTES: readonly AttributeMeta<AttributeId>[] = [
  { id: 'dut-diem', ten: 'Dứt điểm', nhom: 'ky-thuat' },
  { id: 'sut-xa', ten: 'Sút xa', nhom: 'ky-thuat' },
  { id: 'chuyen-ngan', ten: 'Chuyền ngắn', nhom: 'ky-thuat' },
  { id: 'tat-chuyen-dai', ten: 'Tạt/Chuyền dài', nhom: 'ky-thuat' },
  { id: 're-dat', ten: 'Rê dắt', nhom: 'ky-thuat' },
  { id: 'khong-che-bong', ten: 'Khống chế bóng', nhom: 'ky-thuat' },

  { id: 'tac-bong', ten: 'Tắc bóng', nhom: 'phong-ngu' },
  { id: 'kem-nguoi', ten: 'Kèm người', nhom: 'phong-ngu' },
  { id: 'doc-tinh-huong', ten: 'Đọc tình huống', nhom: 'phong-ngu' },

  { id: 'toc-do', ten: 'Tốc độ', nhom: 'the-chat' },
  { id: 'suc-manh', ten: 'Sức mạnh', nhom: 'the-chat' },
  { id: 'khong-chien', ten: 'Không chiến', nhom: 'the-chat' },
  { id: 'the-luc', ten: 'Thể lực', nhom: 'the-chat' },

  { id: 'nhan-quan', ten: 'Nhãn quan', nhom: 'tinh-than' },
  { id: 'quyet-doan', ten: 'Quyết đoán', nhom: 'tinh-than' },
]

/** 3 chỉ số chỉ thủ môn mới có (AC-2.3). */
export const GK_ATTRIBUTES: readonly AttributeMeta<GkAttributeId>[] = [
  { id: 'phan-xa', ten: 'Phản xạ', nhom: 'thu-mon' },
  { id: 'bat-bong', ten: 'Bắt bóng', nhom: 'thu-mon' },
  { id: 'phat-dong', ten: 'Phát động', nhom: 'thu-mon' },
]

/**
 * 8 chỉ số chung mà thủ môn vẫn phải điền (AC-2.3). Những chỉ số chung còn
 * lại — Dứt điểm, Sút xa, Rê dắt, Tắc bóng, Kèm người, Đọc tình huống,
 * Nhãn quan — không hiện ra cho thủ môn.
 */
export const GK_CHI_SO_CHUNG: readonly AttributeId[] = [
  'chuyen-ngan',
  'tat-chuyen-dai',
  'khong-che-bong',
  'toc-do',
  'suc-manh',
  'khong-chien',
  'the-luc',
  'quyet-doan',
]

// ---------------------------------------------------------------------------
// Trọng số chỉ số theo vị trí
// ---------------------------------------------------------------------------

/*
  Bảng này là NGUỒN SỰ THẬT DUY NHẤT cho câu hỏi "chỉ số nào quan trọng với
  vị trí này". Nó được dùng ở hai chỗ:

    - `rating.ts`    — tính chỉ số tổng theo vị trí (AC-2.11)
    - `generator.ts` — sinh nhanh chỉ số có cân theo vị trí (AC-2.9)

  Quyết định D10 của plan: dùng chung một bảng, vì nếu tách đôi thì sẽ có ngày
  cầu thủ được sinh ra với bộ chỉ số mà chính công thức chấm điểm coi là kém.

  Thang trọng số: 3 = rất quan trọng, 2 = quan trọng, 1 = có ảnh hưởng.
  Chỉ số không có trong bảng của một vị trí thì không ảnh hưởng tới vị trí đó.
*/

export interface PositionWeights {
  readonly attributes: Partial<Record<AttributeId, number>>
  readonly gkAttributes?: Partial<Record<GkAttributeId, number>>
}

/** Trọng số từ mức này trở lên được coi là "chỉ số quan trọng" của vị trí. */
export const NGUONG_QUAN_TRONG = 2

const THU_MON: PositionWeights = {
  gkAttributes: { 'phan-xa': 3, 'bat-bong': 3, 'phat-dong': 2 },
  attributes: {
    'quyet-doan': 2,
    'khong-che-bong': 1,
    'chuyen-ngan': 1,
    'tat-chuyen-dai': 1,
    'toc-do': 1,
    'suc-manh': 1,
    'khong-chien': 1,
    'the-luc': 1,
  },
}

const TRUNG_VE: PositionWeights = {
  attributes: {
    'tac-bong': 3,
    'kem-nguoi': 3,
    'khong-chien': 3,
    'doc-tinh-huong': 2,
    'suc-manh': 2,
    'chuyen-ngan': 1,
    'the-luc': 1,
    'toc-do': 1,
    'quyet-doan': 1,
  },
}

/** Hậu vệ trái và hậu vệ phải đối xứng nhau, nên dùng chung trọng số. */
const HAU_VE_BIEN: PositionWeights = {
  attributes: {
    'toc-do': 3,
    'the-luc': 3,
    'tac-bong': 2,
    'kem-nguoi': 2,
    'tat-chuyen-dai': 2,
    'doc-tinh-huong': 1,
    're-dat': 1,
    'chuyen-ngan': 1,
    'suc-manh': 1,
  },
}

const TIEN_VE_TRU: PositionWeights = {
  attributes: {
    'tac-bong': 3,
    'doc-tinh-huong': 3,
    'chuyen-ngan': 3,
    'kem-nguoi': 2,
    'the-luc': 2,
    'nhan-quan': 2,
    'suc-manh': 1,
    'khong-che-bong': 1,
    'quyet-doan': 1,
  },
}

const TIEN_VE_TRUNG_TAM: PositionWeights = {
  attributes: {
    'chuyen-ngan': 3,
    'nhan-quan': 3,
    'khong-che-bong': 2,
    'the-luc': 2,
    'doc-tinh-huong': 2,
    're-dat': 1,
    'tat-chuyen-dai': 1,
    'sut-xa': 1,
    'tac-bong': 1,
  },
}

/** Tiền vệ cánh trái và phải đối xứng nhau. */
const TIEN_VE_CANH: PositionWeights = {
  attributes: {
    'tat-chuyen-dai': 3,
    'the-luc': 3,
    'toc-do': 2,
    're-dat': 2,
    'chuyen-ngan': 2,
    'kem-nguoi': 1,
    'khong-che-bong': 1,
    'doc-tinh-huong': 1,
  },
}

/** Chạy cánh trái và phải đối xứng nhau. */
const CHAY_CANH: PositionWeights = {
  attributes: {
    're-dat': 3,
    'toc-do': 3,
    'tat-chuyen-dai': 2,
    'dut-diem': 2,
    'khong-che-bong': 2,
    'nhan-quan': 1,
    'the-luc': 1,
    'sut-xa': 1,
  },
}

const TIEN_VE_TAN_CONG: PositionWeights = {
  attributes: {
    'nhan-quan': 3,
    'chuyen-ngan': 3,
    'khong-che-bong': 3,
    're-dat': 2,
    'sut-xa': 2,
    'dut-diem': 2,
    'quyet-doan': 1,
    'toc-do': 1,
  },
}

const TIEN_DAO: PositionWeights = {
  attributes: {
    'dut-diem': 3,
    'khong-che-bong': 2,
    'toc-do': 2,
    'khong-chien': 2,
    'suc-manh': 2,
    'sut-xa': 2,
    're-dat': 1,
    'quyet-doan': 1,
    'nhan-quan': 1,
  },
}

export const POSITION_WEIGHTS: Readonly<Record<PositionId, PositionWeights>> = {
  GK: THU_MON,
  DL: HAU_VE_BIEN,
  DC: TRUNG_VE,
  DR: HAU_VE_BIEN,
  DM: TIEN_VE_TRU,
  ML: TIEN_VE_CANH,
  MC: TIEN_VE_TRUNG_TAM,
  MR: TIEN_VE_CANH,
  AML: CHAY_CANH,
  AM: TIEN_VE_TAN_CONG,
  AMR: CHAY_CANH,
  ST: TIEN_DAO,
}

// ---------------------------------------------------------------------------
// Tra cứu
// ---------------------------------------------------------------------------

const TEN_CHI_SO = new Map<string, string>([
  ...ATTRIBUTES.map((a) => [a.id, a.ten] as const),
  ...GK_ATTRIBUTES.map((a) => [a.id, a.ten] as const),
])

/** Tên hiển thị tiếng Việt của một chỉ số, dùng cho thông báo (P8). */
export function tenChiSo(id: AttributeId | GkAttributeId): string {
  const ten = TEN_CHI_SO.get(id)
  if (!ten) {
    throw new Error(`Chỉ số không tồn tại: ${id}`)
  }
  return ten
}

export interface ChiSoQuanTrong {
  readonly attributes: readonly AttributeId[]
  readonly gkAttributes: readonly GkAttributeId[]
}

/**
 * Những chỉ số quan trọng của một vị trí — trọng số từ `NGUONG_QUAN_TRONG`
 * trở lên. Dùng cho cảnh báo "cầu thủ chưa đáp ứng vai trò" ở Giai đoạn 2
 * và cho việc sinh chỉ số có cân theo vị trí (AC-2.9).
 */
export function chiSoQuanTrong(positionId: PositionId): ChiSoQuanTrong {
  const w = POSITION_WEIGHTS[positionId]
  return {
    attributes: (Object.entries(w.attributes) as [AttributeId, number][])
      .filter(([, trongSo]) => trongSo >= NGUONG_QUAN_TRONG)
      .map(([id]) => id),
    gkAttributes: (
      Object.entries(w.gkAttributes ?? {}) as [GkAttributeId, number][]
    )
      .filter(([, trongSo]) => trongSo >= NGUONG_QUAN_TRONG)
      .map(([id]) => id),
  }
}
