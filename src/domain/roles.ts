import { GK_ATTRIBUTES, GK_CHI_SO_CHUNG } from './attributes'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
} from './types'

/*
  23 vai trò cho 12 vị trí (AC-6.1).

  Một vai trò không gắn với đúng một vị trí: hậu vệ biên trái và phải dùng
  chung ba vai trò, nên `viTriApDung` là danh sách. Nhờ vậy mỗi vị trí vẫn có
  2–3 vai trò để chọn mà không phải khai trùng lặp (quyết định D17).

  `chiSoQuanTrong` của vai trò là thứ dùng cho cảnh báo AC-6.5: chỉ số nào của
  cầu thủ còn dưới ngưỡng thì nêu ra. Nó HẸP HƠN `chiSoQuanTrong` của vị trí
  trong `attributes.ts` — vị trí trả lời "đá chỗ này cần gì", vai trò trả lời
  "làm việc này trong chỗ đó cần gì". Trung vệ phát động cần chuyền; trung vệ
  kèm người thì không.
*/

export type RoleId =
  // Thủ môn
  | 'thu-mon-truyen-thong'
  | 'thu-mon-quet'
  // Hậu vệ biên
  | 'hau-ve-bien-phong-ngu'
  | 'hau-ve-bien-tan-cong'
  | 'hau-ve-canh-dang-cao'
  // Trung vệ
  | 'trung-ve-kem-nguoi'
  | 'trung-ve-don-dep'
  | 'trung-ve-phat-dong'
  // Tiền vệ trụ
  | 'tien-ve-mo-neo'
  | 'tien-ve-pha-loi-choi'
  | 'tien-ve-mo-bong'
  // Tiền vệ cánh
  | 'tien-ve-canh-tat-canh'
  | 'tien-ve-canh-ho-thu'
  // Tiền vệ trung tâm
  | 'tien-ve-con-thoi'
  | 'tien-ve-kien-thiet'
  | 'tien-ve-thu-hoi'
  // Chạy cánh
  | 'chay-canh-bam-bien'
  | 'chay-canh-bo-vao'
  // Tiền vệ tấn công
  | 'tien-ve-tan-cong-kien-tao'
  | 'tien-ve-tan-cong-bong-ma'
  // Tiền đạo
  | 'tien-dao-muc-tieu'
  | 'tien-dao-cat-mat'
  | 'tien-dao-lui-sau'

export interface Role {
  readonly id: RoleId
  readonly viTriApDung: readonly PositionId[]
  readonly chiSoQuanTrong: readonly (AttributeId | GkAttributeId)[]
}

export const ROLES: readonly Role[] = [
  {
    id: 'thu-mon-truyen-thong',
    viTriApDung: ['GK'],
    chiSoQuanTrong: ['phan-xa', 'bat-bong', 'quyet-doan'],
  },
  {
    id: 'thu-mon-quet',
    viTriApDung: ['GK'],
    chiSoQuanTrong: ['phan-xa', 'phat-dong', 'chuyen-ngan', 'toc-do'],
  },

  {
    id: 'hau-ve-bien-phong-ngu',
    viTriApDung: ['DL', 'DR'],
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'doc-tinh-huong'],
  },
  {
    id: 'hau-ve-bien-tan-cong',
    viTriApDung: ['DL', 'DR'],
    chiSoQuanTrong: ['tat-chuyen-dai', 'toc-do', 'the-luc'],
  },
  {
    id: 'hau-ve-canh-dang-cao',
    viTriApDung: ['DL', 'DR'],
    chiSoQuanTrong: ['the-luc', 'toc-do', 'tat-chuyen-dai', 're-dat'],
  },

  {
    id: 'trung-ve-kem-nguoi',
    viTriApDung: ['DC'],
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'suc-manh'],
  },
  {
    id: 'trung-ve-don-dep',
    viTriApDung: ['DC'],
    chiSoQuanTrong: ['doc-tinh-huong', 'toc-do', 'tac-bong'],
  },
  {
    id: 'trung-ve-phat-dong',
    viTriApDung: ['DC'],
    chiSoQuanTrong: [
      'chuyen-ngan',
      'tat-chuyen-dai',
      'khong-che-bong',
      'doc-tinh-huong',
    ],
  },

  {
    id: 'tien-ve-mo-neo',
    viTriApDung: ['DM'],
    chiSoQuanTrong: ['kem-nguoi', 'doc-tinh-huong', 'suc-manh'],
  },
  {
    id: 'tien-ve-pha-loi-choi',
    viTriApDung: ['DM'],
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'the-luc'],
  },
  {
    id: 'tien-ve-mo-bong',
    viTriApDung: ['DM'],
    chiSoQuanTrong: [
      'chuyen-ngan',
      'tat-chuyen-dai',
      'nhan-quan',
      'doc-tinh-huong',
    ],
  },

  {
    id: 'tien-ve-canh-tat-canh',
    viTriApDung: ['ML', 'MR'],
    chiSoQuanTrong: ['tat-chuyen-dai', 'the-luc', 'toc-do'],
  },
  {
    id: 'tien-ve-canh-ho-thu',
    viTriApDung: ['ML', 'MR'],
    chiSoQuanTrong: ['the-luc', 'kem-nguoi', 'doc-tinh-huong'],
  },

  {
    id: 'tien-ve-con-thoi',
    viTriApDung: ['MC'],
    chiSoQuanTrong: ['the-luc', 'chuyen-ngan', 'tac-bong', 'sut-xa'],
  },
  {
    id: 'tien-ve-kien-thiet',
    viTriApDung: ['MC'],
    chiSoQuanTrong: ['nhan-quan', 'chuyen-ngan', 'khong-che-bong'],
  },
  {
    id: 'tien-ve-thu-hoi',
    viTriApDung: ['MC'],
    chiSoQuanTrong: ['doc-tinh-huong', 'chuyen-ngan', 'tac-bong'],
  },

  {
    id: 'chay-canh-bam-bien',
    viTriApDung: ['AML', 'AMR'],
    chiSoQuanTrong: ['toc-do', 're-dat', 'tat-chuyen-dai'],
  },
  {
    id: 'chay-canh-bo-vao',
    viTriApDung: ['AML', 'AMR'],
    chiSoQuanTrong: ['re-dat', 'dut-diem', 'sut-xa', 'khong-che-bong'],
  },

  {
    id: 'tien-ve-tan-cong-kien-tao',
    viTriApDung: ['AM'],
    chiSoQuanTrong: ['nhan-quan', 'chuyen-ngan', 'khong-che-bong', 're-dat'],
  },
  {
    id: 'tien-ve-tan-cong-bong-ma',
    viTriApDung: ['AM'],
    chiSoQuanTrong: ['dut-diem', 'sut-xa', 'quyet-doan', 'toc-do'],
  },

  {
    id: 'tien-dao-muc-tieu',
    viTriApDung: ['ST'],
    chiSoQuanTrong: ['khong-chien', 'suc-manh', 'dut-diem'],
  },
  {
    id: 'tien-dao-cat-mat',
    viTriApDung: ['ST'],
    chiSoQuanTrong: ['dut-diem', 'toc-do', 'quyet-doan'],
  },
  {
    id: 'tien-dao-lui-sau',
    viTriApDung: ['ST'],
    chiSoQuanTrong: ['khong-che-bong', 'chuyen-ngan', 'nhan-quan', 'dut-diem'],
  },
]

const THEO_ID = new Map<RoleId, Role>(ROLES.map((v) => [v.id, v]))

export function layVaiTro(id: RoleId): Role {
  const vaiTro = THEO_ID.get(id)
  if (!vaiTro) {
    throw new Error(`Vai trò không tồn tại: ${id}`)
  }
  return vaiTro
}

/** Các vai trò chọn được cho một vị trí — 2 hoặc 3 vai trò (AC-6.1). */
export function vaiTroChoViTri(positionId: PositionId): readonly Role[] {
  return ROLES.filter((v) => v.viTriApDung.includes(positionId))
}

export function vaiTroApDungDuoc(id: RoleId, positionId: PositionId): boolean {
  return layVaiTro(id).viTriApDung.includes(positionId)
}

/*
  Vai trò mặc định của từng vị trí (AC-6.4). Khai thẳng thành bảng, không lấy
  "vai trò đầu danh sách": thứ tự trong `ROLES` là để đọc cho dễ, còn mặc định
  là một lựa chọn chiến thuật — nên chọn vai trò trung tính nhất của vị trí.
*/
export const VAI_TRO_MAC_DINH: Readonly<Record<PositionId, RoleId>> = {
  GK: 'thu-mon-truyen-thong',
  DL: 'hau-ve-bien-phong-ngu',
  DC: 'trung-ve-kem-nguoi',
  DR: 'hau-ve-bien-phong-ngu',
  DM: 'tien-ve-mo-neo',
  ML: 'tien-ve-canh-tat-canh',
  MC: 'tien-ve-con-thoi',
  MR: 'tien-ve-canh-tat-canh',
  AML: 'chay-canh-bam-bien',
  AM: 'tien-ve-tan-cong-kien-tao',
  AMR: 'chay-canh-bam-bien',
  ST: 'tien-dao-cat-mat',
}

export function vaiTroMacDinh(positionId: PositionId): RoleId {
  return VAI_TRO_MAC_DINH[positionId]
}

// ---------------------------------------------------------------------------
// Cảnh báo chỉ số chưa đạt (AC-6.5)
// ---------------------------------------------------------------------------

/** Dưới mức này thì coi là chưa đáp ứng chỉ số quan trọng của vai trò. */
export const NGUONG_DAT_VAI_TRO = 10

/*
  Kết quả chỉ mang **mã chỉ số**, không mang tên (T337, quyết định D76).

  Bản đầu trả thêm `ten: tenChiSo(chiSo)` — tức một hàm của `domain` **sinh
  ra** chữ hiển thị tiếng Việt rồi đẩy lên giao diện. P8 cấm chuyện đó, và
  nó cũng là chỗ `/analyze` bắt được: ở chế độ tiếng Anh, cảnh báo vai trò
  sẽ hiện tên chỉ số bằng tiếng Việt.
*/
export interface ChiSoChuaDat {
  readonly chiSo: AttributeId | GkAttributeId
  /** `null` nghĩa là chưa điền — cũng tính là chưa đạt. */
  readonly giaTri: number | null
}

const CHI_SO_THU_MON = new Set<string>(GK_ATTRIBUTES.map((a) => a.id))

/**
 * Những chỉ số quan trọng của vai trò mà cầu thủ còn dưới ngưỡng (AC-6.5).
 * Trả về danh sách rỗng khi hồ sơ đáp ứng hết.
 *
 * Chỉ số chưa điền cũng được nêu ra, với `giaTri: null`: cảnh báo này tồn tại
 * để người dùng biết cần sửa chỗ nào, và "chưa biết" cũng là chưa yên tâm.
 */
export function chiSoChuaDat(
  vaiTroId: RoleId,
  hoSo: {
    readonly attributes: AttributeValues
    readonly gkAttributes: GkAttributeValues | null
  },
): readonly ChiSoChuaDat[] {
  const ketQua: ChiSoChuaDat[] = []

  for (const chiSo of layVaiTro(vaiTroId).chiSoQuanTrong) {
    const giaTri = CHI_SO_THU_MON.has(chiSo)
      ? hoSo.gkAttributes?.[chiSo as GkAttributeId]
      : hoSo.attributes[chiSo as AttributeId]

    if (giaTri === undefined) {
      ketQua.push({ chiSo, giaTri: null })
    } else if (giaTri < NGUONG_DAT_VAI_TRO) {
      ketQua.push({ chiSo, giaTri })
    }
  }

  return ketQua
}

/** Tập chỉ số mà một thủ môn thực sự có — dùng cho bất biến ở test. */
export const CHI_SO_THU_MON_CO_THE_DUNG: readonly (
  | AttributeId
  | GkAttributeId
)[] = [...GK_CHI_SO_CHUNG, ...GK_ATTRIBUTES.map((a) => a.id)]
