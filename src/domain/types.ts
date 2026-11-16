import type { FormationId } from './formations'
import type { BoChiThi } from './instructions'
import type { RoleId } from './roles'

/*
  Kiểu dữ liệu của miền bóng đá.

  File này — và cả thư mục `domain/` — KHÔNG được import bất cứ thứ gì:
  không React, không DOM, không `services`, không `storage`.
  Đây là nguyên tắc P2 của hiến pháp, và có test `boundaries.test.ts` canh nó.
*/

// ---------------------------------------------------------------------------
// Vị trí
// ---------------------------------------------------------------------------

/** 12 vị trí sở trường (AC-2.1). */
export type PositionId =
  | 'GK'
  | 'DL'
  | 'DC'
  | 'DR'
  | 'DM'
  | 'ML'
  | 'MC'
  | 'MR'
  | 'AML'
  | 'AM'
  | 'AMR'
  | 'ST'

/** Tuyến của một vị trí. Dùng để tính mức xếp sai vị trí ở Giai đoạn 2. */
export type PositionLine = 'thu-mon' | 'phong-ngu' | 'tien-ve' | 'tan-cong'

/** Bên của một vị trí. Dùng cho mức sai nhẹ "lệch trái/phải cùng tuyến". */
export type PositionSide = 'trai' | 'giua' | 'phai'

/*
  Vị trí chỉ còn **mã và trường cấu trúc** (hiến pháp P8 bản 2.0.0, quyết
  định D68). Tên hiển thị và tên viết tắt nằm ở lớp ngôn ngữ `ui/ngonNgu`,
  tra theo `id`.

  Lý do không giữ `ten` rồi thêm `tenEn`: như vậy lớp dữ liệu bóng đá sẽ
  phình ra theo số ngôn ngữ, và `domain` thì không có việc gì phải biết ứng
  dụng đang nói thứ tiếng nào.
*/
export interface Position {
  readonly id: PositionId
  readonly tuyen: PositionLine
  readonly ben: PositionSide
}

// ---------------------------------------------------------------------------
// Chỉ số
// ---------------------------------------------------------------------------

/** 15 chỉ số của cầu thủ sân (AC-2.2). */
export type AttributeId =
  | 'dut-diem'
  | 'sut-xa'
  | 'chuyen-ngan'
  | 'tat-chuyen-dai'
  | 're-dat'
  | 'khong-che-bong'
  | 'tac-bong'
  | 'kem-nguoi'
  | 'doc-tinh-huong'
  | 'toc-do'
  | 'suc-manh'
  | 'khong-chien'
  | 'the-luc'
  | 'nhan-quan'
  | 'quyet-doan'

/** 3 chỉ số chỉ thủ môn mới có (AC-2.3). */
export type GkAttributeId = 'phan-xa' | 'bat-bong' | 'phat-dong'

export type AttributeGroup =
  | 'ky-thuat'
  | 'phong-ngu'
  | 'the-chat'
  | 'tinh-than'
  | 'thu-mon'

/*
  Chỉ số chỉ còn **mã và nhóm** (quyết định D68). Tên hiển thị nằm ở lớp
  ngôn ngữ, tra theo `id`.
*/
export interface AttributeMeta<Id extends string> {
  readonly id: Id
  readonly nhom: AttributeGroup
}

/** Giá trị chỉ số hợp lệ nằm trong 1..20 (AC-2.4). */
export const CHI_SO_MIN = 1
export const CHI_SO_MAX = 20

/**
 * Chỉ số đã nhập. Chỉ số CHƯA nhập thì không có khoá trong đối tượng —
 * đây là cách phân biệt "chưa điền" với "điền số thấp" (AC-2.10).
 */
export type AttributeValues = Partial<Record<AttributeId, number>>
export type GkAttributeValues = Partial<Record<GkAttributeId, number>>

// ---------------------------------------------------------------------------
// Cầu thủ và đội
// ---------------------------------------------------------------------------

export type PreferredFoot = 'trai' | 'phai' | 'ca-hai'

export interface Player {
  readonly id: string
  readonly teamId: string
  readonly name: string
  readonly shirtNumber: number
  readonly age: number
  readonly preferredFoot: PreferredFoot
  /**
   * Một hoặc nhiều vị trí sở trường. Thủ môn không kiêm vị trí sân và
   * ngược lại (AC-2.1b) — xem `kiemTraToHopViTri` trong `positions.ts`.
   */
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  /** Chỉ có giá trị khi cầu thủ là thủ môn; cầu thủ sân luôn là `null`. */
  readonly gkAttributes: GkAttributeValues | null
  readonly portraitImageId: string | null
  readonly createdAt: number
  readonly updatedAt: number
}

export interface Team {
  readonly id: string
  readonly name: string
  readonly logoImageId: string | null
  /** Màu áo dạng '#RRGGBB'. */
  readonly primaryColor: string
  readonly secondaryColor: string
  /**
   * Bộ chiến thuật đang dùng của đội (AC-7.6). `null` nghĩa là đội chưa có bộ
   * nào — `tacticRepo.layChienThuatDangDung` sẽ tạo bộ mặc định khi cần.
   */
  readonly activeTacticId: string | null
  readonly createdAt: number
  readonly updatedAt: number
}

// ---------------------------------------------------------------------------
// Chiến thuật
// ---------------------------------------------------------------------------

/*
  Ba import dưới đây chỉ là KIỂU, nên chúng bị xoá khi biên dịch và không tạo
  vòng lặp import lúc chạy — `formations.ts` và `roles.ts` cũng chỉ lấy kiểu
  từ file này.
*/

/** Một ô trong đội hình: người đứng ở đó và vai trò gắn với ô (D13). */
export interface OChienThuat {
  readonly slotId: string
  /** `null` nghĩa là ô trống. */
  readonly playerId: string | null
  /**
   * Vai trò gắn với Ô, không gắn với cầu thủ (AC-6.6): đổi người vào ô thì
   * vai trò của ô giữ nguyên.
   */
  readonly roleId: RoleId
}

export interface Tactic {
  readonly id: string
  readonly teamId: string
  /** `null` = bộ đang dùng, chưa đặt tên. Có tên = bộ người dùng lưu lại. */
  readonly ten: string | null
  readonly formationId: FormationId
  /** Đúng 11 ô, cùng thứ tự với `oVien` của sơ đồ. */
  readonly oVien: readonly OChienThuat[]
  readonly chiThi: BoChiThi
  readonly createdAt: number
  readonly updatedAt: number
}

// ---------------------------------------------------------------------------
// Nguồn ngẫu nhiên
// ---------------------------------------------------------------------------

/**
 * Nguồn ngẫu nhiên được TRUYỀN VÀO, không gọi `Math.random` bên trong miền.
 * Nguyên tắc P1 của hiến pháp: nhờ vậy việc sinh chỉ số (AC-2.9) và engine
 * giả lập (Giai đoạn 3) đều tái lập được và test được.
 */
export interface Rng {
  /** Trả số thực trong khoảng [0, 1). */
  next(): number
}
