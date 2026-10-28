import { GK_ATTRIBUTES, GK_CHI_SO_CHUNG, tenChiSo } from './attributes'
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
  /** Tên hiển thị, tiếng Việt (P8). */
  readonly ten: string
  readonly viTriApDung: readonly PositionId[]
  /** Một câu nói vai trò này làm gì trên sân. */
  readonly moTa: string
  readonly chiSoQuanTrong: readonly (AttributeId | GkAttributeId)[]
}

export const ROLES: readonly Role[] = [
  {
    id: 'thu-mon-truyen-thong',
    ten: 'Thủ môn truyền thống',
    viTriApDung: ['GK'],
    moTa: 'Giữ khung thành, hạn chế rời vị trí, ưu tiên bắt chắc.',
    chiSoQuanTrong: ['phan-xa', 'bat-bong', 'quyet-doan'],
  },
  {
    id: 'thu-mon-quet',
    ten: 'Thủ môn quét',
    viTriApDung: ['GK'],
    moTa: 'Dâng cao sau hàng phòng ngự, tham gia phát động từ tuyến dưới.',
    chiSoQuanTrong: ['phan-xa', 'phat-dong', 'chuyen-ngan', 'toc-do'],
  },

  {
    id: 'hau-ve-bien-phong-ngu',
    ten: 'Hậu vệ biên phòng ngự',
    viTriApDung: ['DL', 'DR'],
    moTa: 'Giữ nguyên tuyến, kèm chặt cánh, ít tham gia tấn công.',
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'doc-tinh-huong'],
  },
  {
    id: 'hau-ve-bien-tan-cong',
    ten: 'Hậu vệ biên tấn công',
    viTriApDung: ['DL', 'DR'],
    moTa: 'Lên công về thủ theo nhịp bóng, tạt bóng từ biên.',
    chiSoQuanTrong: ['tat-chuyen-dai', 'toc-do', 'the-luc'],
  },
  {
    id: 'hau-ve-canh-dang-cao',
    ten: 'Hậu vệ cánh dâng cao',
    viTriApDung: ['DL', 'DR'],
    moTa: 'Chơi gần như tiền vệ cánh, phủ cả hành lang biên.',
    chiSoQuanTrong: ['the-luc', 'toc-do', 'tat-chuyen-dai', 're-dat'],
  },

  {
    id: 'trung-ve-kem-nguoi',
    ten: 'Trung vệ kèm người',
    viTriApDung: ['DC'],
    moTa: 'Theo sát tiền đạo đối phương, tranh chấp tay đôi.',
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'suc-manh'],
  },
  {
    id: 'trung-ve-don-dep',
    ten: 'Trung vệ dọn dẹp',
    viTriApDung: ['DC'],
    moTa: 'Chơi lùi sau, bọc lót và đọc đường bóng xuyên tuyến.',
    chiSoQuanTrong: ['doc-tinh-huong', 'toc-do', 'tac-bong'],
  },
  {
    id: 'trung-ve-phat-dong',
    ten: 'Trung vệ phát động',
    viTriApDung: ['DC'],
    moTa: 'Cầm bóng dâng lên, mở bóng từ hàng phòng ngự.',
    chiSoQuanTrong: [
      'chuyen-ngan',
      'tat-chuyen-dai',
      'khong-che-bong',
      'doc-tinh-huong',
    ],
  },

  {
    id: 'tien-ve-mo-neo',
    ten: 'Tiền vệ mỏ neo',
    viTriApDung: ['DM'],
    moTa: 'Đứng chắn trước hàng phòng ngự, không rời vị trí.',
    chiSoQuanTrong: ['kem-nguoi', 'doc-tinh-huong', 'suc-manh'],
  },
  {
    id: 'tien-ve-pha-loi-choi',
    ten: 'Tiền vệ phá lối chơi',
    viTriApDung: ['DM'],
    moTa: 'Chủ động lao vào tranh chấp, cắt nhịp lên bóng của đối thủ.',
    chiSoQuanTrong: ['tac-bong', 'kem-nguoi', 'the-luc'],
  },
  {
    id: 'tien-ve-mo-bong',
    ten: 'Tiền vệ mở bóng',
    viTriApDung: ['DM'],
    moTa: 'Lùi sâu nhận bóng, luân chuyển và mở hướng tấn công.',
    chiSoQuanTrong: [
      'chuyen-ngan',
      'tat-chuyen-dai',
      'nhan-quan',
      'doc-tinh-huong',
    ],
  },

  {
    id: 'tien-ve-canh-tat-canh',
    ten: 'Tiền vệ cánh tạt cánh',
    viTriApDung: ['ML', 'MR'],
    moTa: 'Bám biên, đưa bóng vào vòng cấm bằng những quả tạt.',
    chiSoQuanTrong: ['tat-chuyen-dai', 'the-luc', 'toc-do'],
  },
  {
    id: 'tien-ve-canh-ho-thu',
    ten: 'Tiền vệ cánh hỗ trợ phòng ngự',
    viTriApDung: ['ML', 'MR'],
    moTa: 'Lùi về che cánh cho hậu vệ, lên bóng chừng mực.',
    chiSoQuanTrong: ['the-luc', 'kem-nguoi', 'doc-tinh-huong'],
  },

  {
    id: 'tien-ve-con-thoi',
    ten: 'Tiền vệ con thoi',
    viTriApDung: ['MC'],
    moTa: 'Lên xuống cả hai vòng cấm suốt trận.',
    chiSoQuanTrong: ['the-luc', 'chuyen-ngan', 'tac-bong', 'sut-xa'],
  },
  {
    id: 'tien-ve-kien-thiet',
    ten: 'Tiền vệ kiến thiết',
    viTriApDung: ['MC'],
    moTa: 'Cầm nhịp, tìm đường chuyền mở ra cơ hội.',
    chiSoQuanTrong: ['nhan-quan', 'chuyen-ngan', 'khong-che-bong'],
  },
  {
    id: 'tien-ve-thu-hoi',
    ten: 'Tiền vệ thu hồi bóng',
    viTriApDung: ['MC'],
    moTa: 'Đứng thấp giữa sân, thu bóng rồi chuyền an toàn.',
    chiSoQuanTrong: ['doc-tinh-huong', 'chuyen-ngan', 'tac-bong'],
  },

  {
    id: 'chay-canh-bam-bien',
    ten: 'Chạy cánh bám biên',
    viTriApDung: ['AML', 'AMR'],
    moTa: 'Giữ chiều rộng, rê bóng vượt hậu vệ rồi căng ngang.',
    chiSoQuanTrong: ['toc-do', 're-dat', 'tat-chuyen-dai'],
  },
  {
    id: 'chay-canh-bo-vao',
    ten: 'Chạy cánh bó vào trong',
    viTriApDung: ['AML', 'AMR'],
    moTa: 'Từ biên bó vào trung lộ để dứt điểm.',
    chiSoQuanTrong: ['re-dat', 'dut-diem', 'sut-xa', 'khong-che-bong'],
  },

  {
    id: 'tien-ve-tan-cong-kien-tao',
    ten: 'Tiền vệ tấn công kiến tạo',
    viTriApDung: ['AM'],
    moTa: 'Chơi giữa hai tuyến đối thủ, nhận bóng và tạo cơ hội.',
    chiSoQuanTrong: ['nhan-quan', 'chuyen-ngan', 'khong-che-bong', 're-dat'],
  },
  {
    id: 'tien-ve-tan-cong-bong-ma',
    ten: 'Tiền vệ tấn công bóng ma',
    viTriApDung: ['AM'],
    moTa: 'Băng lên từ tuyến hai, dứt điểm thay vì cầm nhịp.',
    chiSoQuanTrong: ['dut-diem', 'sut-xa', 'quyet-doan', 'toc-do'],
  },

  {
    id: 'tien-dao-muc-tieu',
    ten: 'Tiền đạo mục tiêu',
    viTriApDung: ['ST'],
    moTa: 'Làm điểm tựa cho bóng dài, tì đè và tranh bóng trên không.',
    chiSoQuanTrong: ['khong-chien', 'suc-manh', 'dut-diem'],
  },
  {
    id: 'tien-dao-cat-mat',
    ten: 'Tiền đạo cắt mặt',
    viTriApDung: ['ST'],
    moTa: 'Rình trong vòng cấm, chọn thời điểm băng vào ghi bàn.',
    chiSoQuanTrong: ['dut-diem', 'toc-do', 'quyet-doan'],
  },
  {
    id: 'tien-dao-lui-sau',
    ten: 'Tiền đạo lùi sâu',
    viTriApDung: ['ST'],
    moTa: 'Rời vòng cấm nhận bóng, kéo trung vệ đối thủ ra khỏi vị trí.',
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

export interface ChiSoChuaDat {
  readonly chiSo: AttributeId | GkAttributeId
  readonly ten: string
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
      ketQua.push({ chiSo, ten: tenChiSo(chiSo), giaTri: null })
    } else if (giaTri < NGUONG_DAT_VAI_TRO) {
      ketQua.push({ chiSo, ten: tenChiSo(chiSo), giaTri })
    }
  }

  return ketQua
}

/** Tập chỉ số mà một thủ môn thực sự có — dùng cho bất biến ở test. */
export const CHI_SO_THU_MON_CO_THE_DUNG: readonly (
  | AttributeId
  | GkAttributeId
)[] = [...GK_CHI_SO_CHUNG, ...GK_ATTRIBUTES.map((a) => a.id)]
