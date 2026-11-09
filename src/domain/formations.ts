import type { PositionId } from './types'

/*
  8 sơ đồ chiến thuật (AC-5.2), mỗi sơ đồ 11 ô kèm toạ độ trên sân.

  Toạ độ là phần trăm trong 0..100 (quyết định D15): `x` từ trái sang phải,
  `y` từ khung thành đội mình (0) tới khung thành đối thủ (100). Dùng phần trăm
  thì sân co giãn theo khung mà không phải tính lại, và Giai đoạn 4 vẽ sân 2D
  sẽ dùng lại đúng hệ toạ độ này.

  Mỗi ô khai thêm `dai` — chỉ số 1-based vào `cacDai`, là các con số trong tên
  sơ đồ. Ô thủ môn có `dai: 0` vì nó không thuộc dải nào.

  Vì sao cần `dai` (quyết định D15b): để test đối chiếu được số ô mỗi dải với
  tên sơ đồ, nhờ đó bắt được lỗi gõ sai trong 8 bảng toạ độ này. Không suy ra
  từ `tuyen` của POSITIONS được, vì POSITIONS chỉ có 3 tuyến ngoài sân trong
  khi 4-4-1-1, 4-2-3-1 và 4-1-4-1 có 4 dải — ở 4-2-3-1 thì dải "3" và dải "1"
  đều thuộc tuyến tấn công.
*/

export type FormationId =
  /** Sơ đồ quân số nhỏ, thêm ở spec 002 (AC-13.2). */
  | '2-2'
  | '1-2-1'
  | '2-3'
  | '3-2'
  | '2-3-1'
  | '3-2-1'
  | '3-3-1'
  | '2-3-2'
  | '3-3-2'
  | '3-4-1'
  | '4-3-2'
  | '3-4-2'
  | '4-4-2'
  | '4-4-1-1'
  | '4-3-3'
  | '4-2-3-1'
  | '4-1-4-1'
  | '3-5-2'
  | '3-4-3'
  | '5-3-2'

export interface OViTriSoDo {
  /** Chỉ cần duy nhất trong phạm vi một sơ đồ. */
  readonly slotId: string
  readonly viTri: PositionId
  /** 0 cho ô thủ môn; còn lại là chỉ số 1-based vào `cacDai`. */
  readonly dai: number
  readonly x: number
  readonly y: number
}

export interface Formation {
  readonly id: FormationId
  /** Tên hiển thị trùng với id, vì tên sơ đồ bóng đá vốn là dãy số. */
  readonly ten: string
  /**
   * Các con số trong tên: '4-2-3-1' -> [4, 2, 3, 1].
   *
   * Tổng bằng `soNguoi - 1`, tức toàn bộ đội hình trừ thủ môn. Trước spec 002
   * tổng luôn là 10 vì mọi sơ đồ đều 11 người.
   */
  readonly cacDai: readonly number[]
  readonly oVien: readonly OViTriSoDo[]
}

/** Số người của một sơ đồ — đếm ô, không khai riêng để không lệch nhau. */
export function soNguoiCuaSoDo(soDo: Formation): number {
  return soDo.oVien.length
}

/**
 * Những sơ đồ đá được với `n` người mỗi bên (AC-13.1, quyết định D53).
 *
 * Lọc theo số ô chứ không theo một trường khai tay: số ô là sự thật duy nhất,
 * còn một trường khai thêm là một nguồn sự thật thứ hai có thể lệch.
 */
export function soDoTheoQuanSo(n: number): readonly Formation[] {
  return FORMATIONS.filter((s) => soNguoiCuaSoDo(s) === n)
}

const TM: Omit<OViTriSoDo, 'slotId'> = { viTri: 'GK', dai: 0, x: 50, y: 6 }

function o(
  slotId: string,
  viTri: PositionId,
  dai: number,
  x: number,
  y: number,
): OViTriSoDo {
  return { slotId, viTri, dai, x, y }
}

export const FORMATIONS: readonly Formation[] = [
  /*
    Sơ đồ 5 người (AC-13.2). Hai hậu vệ, hai người trên — đúng cách gọi "2-2"
    của sân 5 ngoài đời. Không có ô tiền vệ, nên bóng đi thẳng từ dải phòng
    ngự lên dải tấn công; đó là đặc trưng của sân nhỏ chứ không phải thiếu sót
    của bảng toạ độ.
  */
  {
    id: '2-2',
    ten: '2-2',
    cacDai: [2, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 30, 26),
      o('o3', 'DR', 1, 70, 26),
      o('o4', 'ST', 2, 35, 74),
      o('o5', 'ST', 2, 65, 74),
    ],
  },
  // --- Sơ đồ 5 người (T207) ---
  {
    id: '1-2-1',
    ten: '1-2-1',
    cacDai: [1, 2, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DC', 1, 50, 28),
      o('o3', 'ML', 2, 28, 56),
      o('o4', 'MR', 2, 72, 56),
      o('o5', 'ST', 3, 50, 82),
    ],
  },
  // --- Sơ đồ 6 người (T207) ---
  {
    id: '2-3',
    ten: '2-3',
    cacDai: [2, 3],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 32, 28),
      o('o3', 'DR', 1, 68, 28),
      o('o4', 'ML', 2, 24, 70),
      o('o5', 'MC', 2, 50, 70),
      o('o6', 'MR', 2, 76, 70),
    ],
  },
  {
    id: '3-2',
    ten: '3-2',
    cacDai: [3, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 26, 26),
      o('o3', 'DC', 1, 50, 24),
      o('o4', 'DR', 1, 74, 26),
      o('o5', 'ST', 2, 36, 76),
      o('o6', 'ST', 2, 64, 76),
    ],
  },
  // --- Sơ đồ 7 người (T207) ---
  {
    id: '2-3-1',
    ten: '2-3-1',
    cacDai: [2, 3, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 32, 24),
      o('o3', 'DR', 1, 68, 24),
      o('o4', 'ML', 2, 24, 54),
      o('o5', 'MC', 2, 50, 54),
      o('o6', 'MR', 2, 76, 54),
      o('o7', 'ST', 3, 50, 84),
    ],
  },
  {
    id: '3-2-1',
    ten: '3-2-1',
    cacDai: [3, 2, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 26, 24),
      o('o3', 'DC', 1, 50, 22),
      o('o4', 'DR', 1, 74, 24),
      o('o5', 'MC', 2, 36, 56),
      o('o6', 'MC', 2, 64, 56),
      o('o7', 'ST', 3, 50, 84),
    ],
  },
  // --- Sơ đồ 8 người (T208) ---
  {
    id: '3-3-1',
    ten: '3-3-1',
    cacDai: [3, 3, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 26, 24),
      o('o3', 'DC', 1, 50, 22),
      o('o4', 'DR', 1, 74, 24),
      o('o5', 'ML', 2, 26, 56),
      o('o6', 'MC', 2, 50, 56),
      o('o7', 'MR', 2, 74, 56),
      o('o8', 'ST', 3, 50, 84),
    ],
  },
  {
    id: '2-3-2',
    ten: '2-3-2',
    cacDai: [2, 3, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 32, 24),
      o('o3', 'DR', 1, 68, 24),
      o('o4', 'ML', 2, 24, 54),
      o('o5', 'MC', 2, 50, 54),
      o('o6', 'MR', 2, 76, 54),
      o('o7', 'ST', 3, 36, 84),
      o('o8', 'ST', 3, 64, 84),
    ],
  },
  // --- Sơ đồ 9 người (T208) ---
  {
    id: '3-3-2',
    ten: '3-3-2',
    cacDai: [3, 3, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 24, 24),
      o('o3', 'DC', 1, 50, 22),
      o('o4', 'DR', 1, 76, 24),
      o('o5', 'ML', 2, 24, 54),
      o('o6', 'MC', 2, 50, 54),
      o('o7', 'MR', 2, 76, 54),
      o('o8', 'ST', 3, 36, 84),
      o('o9', 'ST', 3, 64, 84),
    ],
  },
  {
    id: '3-4-1',
    ten: '3-4-1',
    cacDai: [3, 4, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 24, 24),
      o('o3', 'DC', 1, 50, 22),
      o('o4', 'DR', 1, 76, 24),
      o('o5', 'ML', 2, 20, 56),
      o('o6', 'MC', 2, 40, 56),
      o('o7', 'MC', 2, 60, 56),
      o('o8', 'MR', 2, 80, 56),
      o('o9', 'ST', 3, 50, 86),
    ],
  },
  // --- Sơ đồ 10 người (T208) ---
  {
    id: '4-3-2',
    ten: '4-3-2',
    cacDai: [4, 3, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 18, 24),
      o('o3', 'DC', 1, 39, 22),
      o('o4', 'DC', 1, 61, 22),
      o('o5', 'DR', 1, 82, 24),
      o('o6', 'ML', 2, 26, 56),
      o('o7', 'MC', 2, 50, 56),
      o('o8', 'MR', 2, 74, 56),
      o('o9', 'ST', 3, 38, 86),
      o('o10', 'ST', 3, 62, 86),
    ],
  },
  {
    id: '3-4-2',
    ten: '3-4-2',
    cacDai: [3, 4, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 24, 24),
      o('o3', 'DC', 1, 50, 22),
      o('o4', 'DR', 1, 76, 24),
      o('o5', 'ML', 2, 18, 56),
      o('o6', 'MC', 2, 40, 56),
      o('o7', 'MC', 2, 60, 56),
      o('o8', 'MR', 2, 82, 56),
      o('o9', 'ST', 3, 38, 86),
      o('o10', 'ST', 3, 62, 86),
    ],
  },
  {
    id: '4-4-2',
    ten: '4-4-2',
    cacDai: [4, 4, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 16, 24),
      o('o3', 'DC', 1, 38, 20),
      o('o4', 'DC', 1, 62, 20),
      o('o5', 'DR', 1, 84, 24),
      o('o6', 'ML', 2, 16, 52),
      o('o7', 'MC', 2, 38, 50),
      o('o8', 'MC', 2, 62, 50),
      o('o9', 'MR', 2, 84, 52),
      o('o10', 'ST', 3, 40, 82),
      o('o11', 'ST', 3, 60, 82),
    ],
  },
  {
    id: '4-4-1-1',
    ten: '4-4-1-1',
    cacDai: [4, 4, 1, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 16, 24),
      o('o3', 'DC', 1, 38, 20),
      o('o4', 'DC', 1, 62, 20),
      o('o5', 'DR', 1, 84, 24),
      o('o6', 'ML', 2, 16, 50),
      o('o7', 'MC', 2, 38, 48),
      o('o8', 'MC', 2, 62, 48),
      o('o9', 'MR', 2, 84, 50),
      o('o10', 'AM', 3, 50, 68),
      o('o11', 'ST', 4, 50, 86),
    ],
  },
  {
    id: '4-3-3',
    ten: '4-3-3',
    cacDai: [4, 3, 3],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 16, 24),
      o('o3', 'DC', 1, 38, 20),
      o('o4', 'DC', 1, 62, 20),
      o('o5', 'DR', 1, 84, 24),
      o('o6', 'DM', 2, 50, 44),
      o('o7', 'MC', 2, 30, 52),
      o('o8', 'MC', 2, 70, 52),
      o('o9', 'AML', 3, 16, 78),
      o('o10', 'ST', 3, 50, 86),
      o('o11', 'AMR', 3, 84, 78),
    ],
  },
  {
    id: '4-2-3-1',
    ten: '4-2-3-1',
    cacDai: [4, 2, 3, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 16, 24),
      o('o3', 'DC', 1, 38, 20),
      o('o4', 'DC', 1, 62, 20),
      o('o5', 'DR', 1, 84, 24),
      o('o6', 'DM', 2, 38, 44),
      o('o7', 'DM', 2, 62, 44),
      o('o8', 'AML', 3, 16, 68),
      o('o9', 'AM', 3, 50, 66),
      o('o10', 'AMR', 3, 84, 68),
      o('o11', 'ST', 4, 50, 88),
    ],
  },
  {
    id: '4-1-4-1',
    ten: '4-1-4-1',
    cacDai: [4, 1, 4, 1],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 16, 24),
      o('o3', 'DC', 1, 38, 20),
      o('o4', 'DC', 1, 62, 20),
      o('o5', 'DR', 1, 84, 24),
      o('o6', 'DM', 2, 50, 40),
      o('o7', 'ML', 3, 16, 60),
      o('o8', 'MC', 3, 38, 58),
      o('o9', 'MC', 3, 62, 58),
      o('o10', 'MR', 3, 84, 60),
      o('o11', 'ST', 4, 50, 86),
    ],
  },
  {
    id: '3-5-2',
    ten: '3-5-2',
    cacDai: [3, 5, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DC', 1, 30, 20),
      o('o3', 'DC', 1, 50, 18),
      o('o4', 'DC', 1, 70, 20),
      o('o5', 'ML', 2, 12, 50),
      o('o6', 'MC', 2, 34, 48),
      o('o7', 'DM', 2, 50, 42),
      o('o8', 'MC', 2, 66, 48),
      o('o9', 'MR', 2, 88, 50),
      o('o10', 'ST', 3, 40, 82),
      o('o11', 'ST', 3, 60, 82),
    ],
  },
  {
    id: '3-4-3',
    ten: '3-4-3',
    cacDai: [3, 4, 3],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DC', 1, 30, 20),
      o('o3', 'DC', 1, 50, 18),
      o('o4', 'DC', 1, 70, 20),
      o('o5', 'ML', 2, 14, 50),
      o('o6', 'MC', 2, 38, 48),
      o('o7', 'MC', 2, 62, 48),
      o('o8', 'MR', 2, 86, 50),
      o('o9', 'AML', 3, 18, 80),
      o('o10', 'ST', 3, 50, 86),
      o('o11', 'AMR', 3, 82, 80),
    ],
  },
  {
    id: '5-3-2',
    ten: '5-3-2',
    cacDai: [5, 3, 2],
    oVien: [
      { slotId: 'o1', ...TM },
      o('o2', 'DL', 1, 10, 30),
      o('o3', 'DC', 1, 30, 20),
      o('o4', 'DC', 1, 50, 18),
      o('o5', 'DC', 1, 70, 20),
      o('o6', 'DR', 1, 90, 30),
      o('o7', 'MC', 2, 30, 52),
      o('o8', 'DM', 2, 50, 46),
      o('o9', 'MC', 2, 70, 52),
      o('o10', 'ST', 3, 40, 82),
      o('o11', 'ST', 3, 60, 82),
    ],
  },
]

const THEO_ID = new Map<FormationId, Formation>(
  FORMATIONS.map((s) => [s.id, s]),
)

export function laySoDo(id: FormationId): Formation {
  const soDo = THEO_ID.get(id)
  if (!soDo) {
    throw new Error(`Sơ đồ không tồn tại: ${id}`)
  }
  return soDo
}

/** Sơ đồ gán cho đội mới và cho đội chưa có chiến thuật nào. */
export const SO_DO_MAC_DINH: FormationId = '4-4-2'
