import type { BanDich } from './kieu'
import type {
  CHUNG_VI,
  DANH_SACH_DOI_VI,
  NGON_NGU_VI,
  NHAN_VI_TRI_VI,
  XOA_DOI_VI,
} from './vi'

/*
  Bảng chuỗi tiếng Anh.

  MỖI khối khai kiểu `BanDich<typeof …>` của khối tiếng Việt tương ứng — nới
  literal thành `string` nhưng giữ nguyên tập khoá (xem `kieu.ts`). Nhờ vậy:

    - thiếu một khoá  → lỗi biên dịch
    - thừa một khoá   → lỗi biên dịch
    - sai kiểu một khoá (chuỗi ở bên này, hàm ở bên kia) → lỗi biên dịch
  Đây là lớp lưới thứ nhất của AC-22.2 (quyết định D66), và nó bắt lỗi ở chỗ
  rẻ nhất: lúc gõ, không phải lúc chạy, càng không phải lúc người dùng nhìn.

  Thuật ngữ bóng đá dùng cách gọi của **bóng đá Anh** chứ không phải bóng đá
  Mỹ — "football", "pitch", "match"; không "soccer", "field", "game" (giả
  định ở mục 9 của spec).
*/

export const CHUNG_EN: BanDich<typeof CHUNG_VI> = {
  tenUngDung: 'Team Manager',
  huy: 'Cancel',
  xoa: 'Delete',
  dong: 'Close',
  suaTen: 'Rename',
  quayLai: 'Back',
  tiepTuc: 'Resume',
  dangTai: 'Loading…',
  taiLaiTrang: 'Reload page',
  chanNangCapDuLieu:
    'The app needs to upgrade its data store, but another tab is open and still holds the old version. Close those tabs, then reload this page. Your data is safe.',
  daNhuongKetNoi:
    'Another tab has just upgraded the data store, so this tab stopped writing to let it through. Everything already saved is intact, but new changes here will not be saved. Reload the page to carry on.',
}

/*
  Tên hai ngôn ngữ KHÔNG dịch: một người đang kẹt trong thứ tiếng mình không
  đọc được phải tìm ra lối thoát, và "Tiếng Việt" viết bằng tiếng Việt là thứ
  họ nhận ra. Dịch thành "Vietnamese" thì người Việt lạc trong bản tiếng Anh
  mất thêm một nhịp để đoán.
*/
export const NGON_NGU_EN: BanDich<typeof NGON_NGU_VI> = {
  nhan: 'Language',
  vi: 'Tiếng Việt',
  en: 'English',
}

export const DANH_SACH_DOI_EN: BanDich<typeof DANH_SACH_DOI_VI> = {
  tieuDe: 'My teams',
  trongTieuDe: 'No teams yet',
  trongMoTa:
    'Create your first team: give it a name, pick the kit colours, then add your players.',
  taoDoiDauTien: 'Create your first team',
  taoDoi: 'New team',
  moDoi: 'Open team',
  soCauThu: (n: number) => (n === 1 ? '1 player' : `${n} players`),
  chuaCoCauThu: 'No players yet',
}

export const XOA_DOI_EN: BanDich<typeof XOA_DOI_VI> = {
  tieuDe: 'Delete this team?',
  moTa: (tenDoi: string, soCauThu: number) =>
    soCauThu === 0
      ? `"${tenDoi}" will be deleted. It has no players.`
      : `"${tenDoi}" and all ${soCauThu} of its players will be deleted. This cannot be undone.`,
  tranDangDien:
    ' This team has a match in progress; deleting the team abandons that match and it will not be saved to history.',
  xacNhan: 'Delete team',
}

/*
  Tên vị trí theo cách gọi của **bóng đá Anh**: "Centre back", "Striker" —
  không phải "Center back" hay "Forward" kiểu Mỹ (giả định mục 9 của spec).

  Viết tắt giữ đúng quy ước sơ đồ quen thuộc: LB, CB, RB, DM, LM, CM, RM,
  LW, AM, RW, ST.
*/
export const NHAN_VI_TRI_EN: typeof NHAN_VI_TRI_VI = {
  GK: { ten: 'Goalkeeper', vietTat: 'GK' },
  DL: { ten: 'Left back', vietTat: 'LB' },
  DC: { ten: 'Centre back', vietTat: 'CB' },
  DR: { ten: 'Right back', vietTat: 'RB' },
  DM: { ten: 'Defensive midfielder', vietTat: 'DM' },
  ML: { ten: 'Left midfielder', vietTat: 'LM' },
  MC: { ten: 'Centre midfielder', vietTat: 'CM' },
  MR: { ten: 'Right midfielder', vietTat: 'RM' },
  AML: { ten: 'Left winger', vietTat: 'LW' },
  AM: { ten: 'Attacking midfielder', vietTat: 'AM' },
  AMR: { ten: 'Right winger', vietTat: 'RW' },
  ST: { ten: 'Striker', vietTat: 'ST' },
}
