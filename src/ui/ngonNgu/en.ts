import { laChiSoHopLe } from '../../domain/attributes'
import type { AttributeId, GkAttributeId } from '../../domain/types'
import type { LoiUngDung } from '../../services/errors'
import type { BanDich } from './kieu'
import type {
  CHUNG_VI,
  MUC_SAI_VI_TRI_VI,
  TRANG_CHIEN_THUAT_VI,
  SAI_VI_TRI_VI,
  TINH_TRANG_DOI_HINH_VI,
  DOI_SO_DO_VI,
  VAI_TRO_VI,
  CHI_THI_DOI_VI,
  BO_CHIEN_THUAT_VI,
  CHON_CAP_DAU_VI,
  DANG_KY_DOI_HINH_VI,
  LY_DO_KHONG_BAT_DAU_VI,
  TRAN_DAU_VI,
  THAY_NGUOI_VI,
  CAN_THIEP_GIUA_TRAN_VI,
  BAO_CAO_SAU_TRAN_VI,
  VAO_BAT_GON_VI,
  SO_SANH_TRAN_VI,
  SAN_2D_VI,
  SAO_LUU_VI,
  LUU_TRU_VI,
  LICH_SU_VI,
  LOI_VI,
  FORM_DOI_VI,
  TRANG_DOI_VI,
  XOA_CAU_THU_VI,
  CHAN_THUAN_VI,
  CHON_ANH_VI,
  CHON_MAU_AO_VI,
  BANG_CHI_SO_VI,
  FORM_CAU_THU_VI,
  DANH_SACH_DOI_VI,
  NGON_NGU_VI,
  CHE_DO_VI,
  DINH_DANG_VI,
  CANH_BAO_XUNG_DOT_VI,
  NHAN_CHI_SO_VI,
  NHAN_MUC_DO_VI,
  NHAN_VAI_TRO_VI,
  NHAN_VI_TRI_VI,
  XOA_DOI_VI,
} from './vi'
import type { NhanChiThi } from './vi'

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

export const DINH_DANG_EN: BanDich<typeof DINH_DANG_VI> = {
  /*
    'en-GB' chứ không phải 'en-US': ứng dụng là bóng đá, và lối ngày
    ngày-tháng-năm gần với lối tiếng Việt hơn, nên hai bản đọc giống nhau
    về thứ tự chứ không đảo ngày và tháng cho nhau.
  */
  maVung: 'en-GB',
}

export const CHE_DO_EN: BanDich<typeof CHE_DO_VI> = {
  nhan: 'Display mode',
  sang: 'Light',
  toi: 'Dark',
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

export const NHAN_CHI_THI_EN: NhanChiThi = {
  'do-cao-doi-hinh': {
    ten: 'Defensive line',
    cacMuc: {
      thap: {
        ten: 'Deep',
        danhDoi:
          'Seals the space behind the back line, but hands the middle third to whoever has the ball.',
      },
      'trung-binh': {
        ten: 'Standard',
        danhDoi:
          'Balances the space behind against the distance to the opposition goal, favouring neither.',
      },
      cao: {
        ten: 'High',
        danhDoi:
          'Pins the opposition back and wins the ball near their goal, but leaves room behind for the long ball.',
      },
    },
  },
  'do-rong-doi-hinh': {
    ten: 'Width',
    cacMuc: {
      hep: {
        ten: 'Narrow',
        danhDoi:
          'Locks up the middle and makes covering for each other easy, but leaves both flanks open.',
      },
      'trung-binh': {
        ten: 'Standard',
        danhDoi:
          'Covers the middle and the flanks evenly, closing off neither completely.',
      },
      rong: {
        ten: 'Wide',
        danhDoi:
          'Stretches their back line and opens the flanks, but leaves gaps between players in midfield.',
      },
    },
  },
  'toc-do-chuyen-bong': {
    ten: 'Tempo',
    cacMuc: {
      cham: {
        ten: 'Slow',
        danhDoi:
          'Keeps the ball securely and loses it rarely, but gives the opposition time to get back into shape.',
      },
      'trung-binh': {
        ten: 'Standard',
        danhDoi:
          'Moves the ball at a steady rhythm: never rushed, never missing the obvious chance.',
      },
      nhanh: {
        ten: 'Fast',
        danhDoi:
          'Exploits the moment before they recover, but the riskier passes mean losing the ball more often.',
      },
    },
  },
  'cuong-do-pressing': {
    ten: 'Pressing intensity',
    cacMuc: {
      thap: {
        ten: 'Low',
        danhDoi:
          'Holds shape and saves legs, but lets the opposition pass at will.',
      },
      'trung-binh': {
        ten: 'Standard',
        danhDoi:
          'Presses selectively, keeping the shape intact without draining stamina.',
      },
      cao: {
        ten: 'High',
        danhDoi:
          'Wins the ball back early and forces mistakes, but costs stamina and leaves space when a press is beaten.',
      },
    },
  },
  'huong-tan-cong': {
    ten: 'Attacking focus',
    cacMuc: {
      bien: {
        ten: 'Down the flanks',
        danhDoi:
          'Avoids the crowd in the middle and creates plenty of crosses, but depends on someone finishing in the box.',
      },
      'can-bang': {
        ten: 'Balanced',
        danhDoi:
          'Hard to read because the angle keeps changing, but never commits to where the side is strongest.',
      },
      'trung-lo': {
        ten: 'Through the middle',
        danhDoi:
          'Takes the shortest route to goal, but has to go through where the opposition is most crowded.',
      },
    },
  },
  'bay-viet-vi': {
    ten: 'Offside trap',
    cacMuc: {
      tat: {
        ten: 'Off',
        danhDoi:
          'The back line drops with the ball so it is rarely played through, but long balls from deep go uncut.',
      },
      bat: {
        ten: 'On',
        danhDoi:
          'Steps up together to catch runners offside and cut out balls from deep, but one mistimed step lets a striker clean through.',
      },
    },
  },
}

/*
  Tên vai trò theo cách gọi quen thuộc của bóng đá Anh. Vài chỗ không có từ
  một-đối-một nên dịch theo NGHĨA chứ không theo chữ: "tiền vệ mỏ neo" là
  anchor man, "tiền vệ con thoi" là box-to-box, "tiền đạo cắt mặt" là
  poacher — dịch sát chữ sẽ ra những cụm không ai dùng.
*/
export const NHAN_VAI_TRO_EN: typeof NHAN_VAI_TRO_VI = {
  'thu-mon-truyen-thong': {
    ten: 'Traditional keeper',
    moTa: 'Guards the line, rarely leaves his area, values safe handling above all.',
  },
  'thu-mon-quet': {
    ten: 'Sweeper keeper',
    moTa: 'Plays high behind the back line and joins the build-up from deep.',
  },
  'hau-ve-bien-phong-ngu': {
    ten: 'Defensive full back',
    moTa: 'Holds the line, marks the flank tightly, rarely joins the attack.',
  },
  'hau-ve-bien-tan-cong': {
    ten: 'Attacking full back',
    moTa: 'Goes up and back with the play, delivering crosses from the flank.',
  },
  'hau-ve-canh-dang-cao': {
    ten: 'Wing back',
    moTa: 'Plays almost as a wide midfielder, covering the whole flank.',
  },
  'trung-ve-kem-nguoi': {
    ten: 'Man-marking centre back',
    moTa: 'Shadows the opposing striker and takes him on one against one.',
  },
  'trung-ve-don-dep': {
    ten: 'Sweeper',
    moTa: 'Plays behind the line, covering and reading balls played through.',
  },
  'trung-ve-phat-dong': {
    ten: 'Ball-playing centre back',
    moTa: 'Carries the ball forward and opens play from the back.',
  },
  'tien-ve-mo-neo': {
    ten: 'Anchor man',
    moTa: 'Screens the back line and never leaves his position.',
  },
  'tien-ve-pha-loi-choi': {
    ten: 'Ball winner',
    moTa: 'Goes looking for the tackle and breaks up their build-up.',
  },
  'tien-ve-mo-bong': {
    ten: 'Deep-lying playmaker',
    moTa: 'Drops deep to receive, circulates the ball and opens attacking angles.',
  },
  'tien-ve-canh-tat-canh': {
    ten: 'Wide crosser',
    moTa: 'Hugs the touchline and puts the ball into the box with crosses.',
  },
  'tien-ve-canh-ho-thu': {
    ten: 'Defensive wide midfielder',
    moTa: 'Tucks back to cover the full back and goes forward only in measure.',
  },
  'tien-ve-con-thoi': {
    ten: 'Box-to-box midfielder',
    moTa: 'Runs between both penalty areas for the whole match.',
  },
  'tien-ve-kien-thiet': {
    ten: 'Playmaker',
    moTa: 'Sets the rhythm and looks for the pass that opens a chance.',
  },
  'tien-ve-thu-hoi': {
    ten: 'Holding midfielder',
    moTa: 'Sits deep in midfield, wins the ball back and passes it safely.',
  },
  'chay-canh-bam-bien': {
    ten: 'Touchline winger',
    moTa: 'Keeps the width, beats his full back and pulls the ball back.',
  },
  'chay-canh-bo-vao': {
    ten: 'Inverted winger',
    moTa: 'Cuts inside from the flank to shoot.',
  },
  'tien-ve-tan-cong-kien-tao': {
    ten: 'Creative number ten',
    moTa: 'Plays between their lines, receives the ball and makes chances.',
  },
  'tien-ve-tan-cong-bong-ma': {
    ten: 'Late-arriving number ten',
    moTa: 'Breaks forward from deep to finish rather than to set the rhythm.',
  },
  'tien-dao-muc-tieu': {
    ten: 'Target man',
    moTa: 'Holds the ball up for the long pass, backs into defenders and wins it in the air.',
  },
  'tien-dao-cat-mat': {
    ten: 'Poacher',
    moTa: 'Lurks in the box and times his run to score.',
  },
  'tien-dao-lui-sau': {
    ten: 'Deep-lying forward',
    moTa: 'Drops out of the box to receive, dragging their centre backs out of position.',
  },
}

/*
  Tên chỉ số theo bộ từ quen thuộc của game quản lý bóng đá tiếng Anh —
  "Finishing", "First touch", "Anticipation" — chứ không dịch sát từng chữ.
  "Đọc tình huống" dịch sát sẽ ra "reading the situation", không ai gọi thế.
*/
export const NHAN_CHI_SO_EN: typeof NHAN_CHI_SO_VI = {
  'dut-diem': 'Finishing',
  'sut-xa': 'Long shots',
  'chuyen-ngan': 'Short passing',
  'tat-chuyen-dai': 'Crossing & long passing',
  're-dat': 'Dribbling',
  'khong-che-bong': 'First touch',
  'tac-bong': 'Tackling',
  'kem-nguoi': 'Marking',
  'doc-tinh-huong': 'Anticipation',
  'toc-do': 'Pace',
  'suc-manh': 'Strength',
  'khong-chien': 'Heading',
  'the-luc': 'Stamina',
  'nhan-quan': 'Vision',
  'quyet-doan': 'Decisions',
  'phan-xa': 'Reflexes',
  'bat-bong': 'Handling',
  'phat-dong': 'Distribution',
}

export const NHAN_MUC_DO_EN: typeof NHAN_MUC_DO_VI = {
  'ngoi-sao': 'Star',
  kha: 'Good',
  'trung-binh': 'Average',
  yeu: 'Poor',
}

/*
  Ba câu cảnh báo giữ nguyên cấu trúc "A cần X, nhưng B lại Y — nên Z": mỗi
  câu nêu hai chỉ thị chọi nhau rồi nói hậu quả, đúng thứ AC-7.3 đòi.
*/
export const CANH_BAO_XUNG_DOT_EN: typeof CANH_BAO_XUNG_DOT_VI = {
  'viet-vi-voi-doi-hinh-thap':
    'An offside trap needs the back line to step up together, but a deep line sits on its own goal — the trap will almost never spring.',
  'pressing-cao-voi-doi-hinh-thap':
    'High pressing means swarming the ball the moment it is lost, while a deep line tells players to drop first — they will run a lot without winning it back.',
  'tan-cong-bien-voi-doi-hinh-hep':
    'Attacking down the flanks needs players hugging the touchline, but a narrow shape pulls them into the middle.',
}

// ---------------------------------------------------------------------------
// Nhóm đội và cầu thủ (T317)
// ---------------------------------------------------------------------------

export const FORM_DOI_EN: BanDich<typeof FORM_DOI_VI> = {
  tieuDeTao: 'New team',
  tieuDeSua: 'Edit team',
  nutTao: 'Create team',
  nutDoiTen: 'Update team',
  nhanTen: 'Team name',
  gidanhTen: 'For example: My team',
  nhanMauChinh: 'Home kit colour',
  nhanMauPhu: 'Away kit colour',
  canhBaoTrungTen: (ten: string) =>
    `There is already a team called "${ten}". Create another with the same name?`,
  xacNhanTrungTen: 'Create anyway',
}

export const TRANG_DOI_EN: BanDich<typeof TRANG_DOI_VI> = {
  doiNay: 'Team',
  danhSachCauThu: 'Squad',
  themCauThu: 'Add player',
  chuaCoCauThuTieuDe: 'This team has no players yet',
  chuaCoCauThuMoTa:
    'Add your first player: enter a name, a shirt number and a preferred position, then use quick-fill if you would rather not type every attribute.',
  themCauThuDauTien: 'Add your first player',
  sapXepTheo: 'Sort by',
  sapXep: {
    ten: 'Name',
    soAo: 'Number',
    tuoi: 'Age',
    viTri: 'Position',
  },
  cotSoAo: 'No.',
  cotTen: 'Name',
  cotTuoi: 'Age',
  cotViTri: 'Position',
  cotChanThuan: 'Preferred foot',
  cotChiSoTong: 'Overall',
  chuaHoanTat: 'Incomplete',
  chuaHoanTatChiTiet: (n: number) =>
    n === 1 ? '1 attribute missing' : `${n} attributes missing`,
  chuaTinhDuocChiSoTong: 'Not enough attributes to work it out',
  suaCauThu: 'Edit',
  xoaCauThu: 'Delete',
}

export const XOA_CAU_THU_EN: BanDich<typeof XOA_CAU_THU_VI> = {
  tieuDe: 'Delete this player?',
  moTa: (ten: string, soAo: number) =>
    `"${ten}" (number ${soAo}) will be removed from the squad. This cannot be undone.`,
  xacNhan: 'Delete player',
}

export const CHAN_THUAN_EN: BanDich<typeof CHAN_THUAN_VI> = {
  trai: 'Left',
  phai: 'Right',
  'ca-hai': 'Both',
}

export const CHON_ANH_EN: BanDich<typeof CHON_ANH_VI> = {
  nhanAnhCauThu: 'Portrait',
  nhanLogoDoi: 'Team badge',
  chonAnh: 'Choose image',
  doiAnh: 'Change image',
  xoaAnh: 'Remove image',
  tieuDeCat: 'Crop to a square',
  huongDanCat:
    'Drag to choose the part you want to keep, and use the slider to zoom in or out.',
  phongTo: 'Zoom',
  xacNhanCat: 'Use this image',
  dangXuLy: 'Processing image…',
}

export const CHON_MAU_AO_EN: BanDich<typeof CHON_MAU_AO_VI> = {
  nhanMauChinh: 'Home kit colour',
  nhanMauPhu: 'Away kit colour',
  xemTruoc: 'Preview',
  canhBaoTrungMauDoiKhac: (tenDoi: string) =>
    `This home colour is very close to "${tenDoi}". The two sides will be hard to tell apart when they meet.`,
  canhBaoChinhVaPhuGiongNhau:
    'The home and away colours are very close, so the away kit will not help tell the sides apart.',
  canhBaoNenDaDieuChinh:
    'This colour has too little contrast with both white and black text, so the displayed background has been darkened or lightened slightly to keep the text readable.',
}

export const BANG_CHI_SO_EN: BanDich<typeof BANG_CHI_SO_VI> = {
  tieuDe: 'Attributes',
  khoangHopLe:
    'Each attribute is a whole number from 1 to 20. An empty box means it has not been filled in.',
  loiNgoaiKhoang: (tenChiSoDo: string) =>
    `${tenChiSoDo} must be a whole number from 1 to 20. The value you entered was discarded.`,
  nhomTen: {
    'ky-thuat': 'Technical',
    'phong-ngu': 'Defending',
    'the-chat': 'Physical',
    'tinh-than': 'Mental',
    'thu-mon': 'Goalkeeping',
  },
}

export const FORM_CAU_THU_EN: BanDich<typeof FORM_CAU_THU_VI> = {
  tieuDeThem: 'Add player',
  tieuDeSua: 'Edit player',
  nutThem: 'Add player',
  nutLuuSua: 'Update',
  nhanTen: 'Player name',
  gidanhTen: 'For example: John Smith',
  nhanSoAo: 'Shirt number',
  nhanTuoi: 'Age',
  nhanChanThuan: 'Preferred foot',
  nhanViTri: 'Preferred positions',
  giaiThichThuMon:
    'Goalkeepers use their own set of attributes, so they cannot double up as outfield players. Clear Goalkeeper if you want to pick outfield positions.',
  giaiThichViTriSan:
    'Outfield positions are selected, so Goalkeeper cannot be added. Clear every outfield position if you want this player to be a goalkeeper.',
  canhBaoDoiSangThuMon:
    'Turning this player into a goalkeeper switches them to the goalkeeping attributes. Attributes that are no longer used will not be kept.',
  xacNhanDoiSangThuMon: 'Switch to goalkeeper anyway',
  sinhNhanh: 'Quick-fill attributes',
  sinhNhanhMoTa:
    'Pick a level to fill in every attribute, then adjust whichever boxes you want.',
  canChonViTriTruoc:
    'Choose the preferred positions first — the generated levels depend on them.',
  sinhCaHoSo: 'Generate a whole profile',
  sinhCaHoSoMoTa:
    'Pick a level to generate the name, age, shirt number, preferred position and every attribute at once. Press again for a different player, and edit any field afterwards.',
  hetSoAo:
    'This squad already uses every shirt number from 1 to 99, so no further player can be generated. Remove a player or change someone else’s number first.',
  chiSoTongTaiViTri: (tenViTri: string) => `Overall as a ${tenViTri}`,
}

// ---------------------------------------------------------------------------
// Nhóm chiến thuật (T318)
// ---------------------------------------------------------------------------


export const MUC_SAI_VI_TRI_EN: BanDich<typeof MUC_SAI_VI_TRI_VI> = {
  dung: 'Natural position',
  nhe: 'Slightly out of position',
  vua: 'Out of position',
  nang: 'Badly out of position',
}

export const TRANG_CHIEN_THUAT_EN: BanDich<typeof TRANG_CHIEN_THUAT_VI> = {
  tieuDe: 'Tactics',
  moChienThuat: 'Tactics',
  nhanChonSoDo: 'Formation',
  nhanChonQuanSo: 'Players per side',
  nhanQuanSo: (n: number) => `${n}-a-side`,
  tieuDeNgoaiSan: 'Off the pitch',
  ngoaiSanTrong: 'Every player is on the pitch.',
  chuaCoCauThu: 'This team has no players to put in a line-up yet.',
  oTrong: 'Empty slot',
  nhanO: (tenViTri: string) => `${tenViTri} slot`,
  oCoNguoi: (tenViTri: string, tenCauThu: string, soAo: number) =>
    `${tenViTri} slot: ${tenCauThu}, number ${soAo}`,
  soAo: (so: number) => `Number ${so}`,
  boRaNgoai: 'Take off the pitch',
  datVaoO: 'Put in this slot',
  nhacLen: 'Pick this player up',
  datXuong: 'Put the picked-up player here',
  thoiNhac: 'Cancel',
  dangNhac: (ten: string) => `${ten} picked up. Choose a slot to put him down.`,
  huongDanBanPhim:
    'Use Tab to move between slots and players. Press Enter or Space to pick a player up, use the arrow keys to move to another slot, then press Enter or Space to put him down. Press Esc to cancel.',
  /*
    Những câu này @dnd-kit đọc cho trình đọc màn hình. Mặc định của nó vốn là
    tiếng Anh kèm id nội bộ, nên ở đây không phải là "trả về mặc định" — câu
    tiếng Anh viết tay vẫn cần, vì mặc định đọc cả chuỗi id ra.
  */
  moTaKeoDuoc: 'player, draggable',
  huongDanDocManHinh:
    'Press Enter or Space to pick the player up. While holding, use the arrow keys to choose a slot, Enter or Space to put him down, Esc to cancel.',
  baoNhacLen: (ten: string) => `Picked up ${ten}.`,
  baoDangOTren: (ten: string) => `Now over ${ten}.`,
  baoDatXuong: (ten: string) => `Placed in ${ten}.`,
  baoDatLaiChoCu: 'Returned to the original slot.',
  baoThoiNhac: 'Cancelled, nothing moved.',
  tenVungNgoaiSan: 'the off-pitch list',
}

export const SAI_VI_TRI_EN: BanDich<typeof SAI_VI_TRI_VI> = {
  nhan: (muc, phanTramTru: number) =>
    muc === 'dung'
      ? MUC_SAI_VI_TRI_EN.dung
      : `${MUC_SAI_VI_TRI_EN[muc]} — ${phanTramTru}% less effective`,
  giaiThich: (tenViTriO: string, cacViTriSoTruong: string) =>
    `This slot is ${tenViTriO}, but the player's natural positions are ${cacViTriSoTruong}.`,
}

export const TINH_TRANG_DOI_HINH_EN: BanDich<typeof TINH_TRANG_DOI_HINH_VI> = {
  sanSang: 'The line-up is ready to play.',
  tieuDeChuaDu: 'The line-up is not ready',
  thieuNguoi: (soCo: number, soCan: number) =>
    `Only ${soCo} of ${soCan} slots are filled. Fill all ${soCan}.`,
  thieuThuMon: 'There is no goalkeeper in goal.',
  hoSoChuaHoanTat: (tenCauThu: readonly string[]) =>
    tenCauThu.length === 1
      ? `${tenCauThu[0]} is missing attributes; fill them in before kick-off.`
      : `${tenCauThu.length} players are missing attributes: ${tenCauThu.join(', ')}.`,
}

export const DOI_SO_DO_EN: BanDich<typeof DOI_SO_DO_VI> = {
  daXepLai: (tenSoDo: string) =>
    `The line-up has been rearranged for the ${tenSoDo} formation.`,
  biDayRa: (ten: readonly string[]) =>
    `No suitable slot left for ${ten.join(', ')} — they have been moved off the pitch.`,
  biXepSai: (ten: readonly string[]) =>
    `Playing out of their natural positions: ${ten.join(', ')}.`,
}

export const VAI_TRO_EN: BanDich<typeof VAI_TRO_VI> = {
  tieuDe: 'Role',
  nhanChon: 'Role for this slot',
  chiSoQuanTrong: 'Key attributes',
  tieuDeChuaDat: 'This player does not meet the role',
  chiSoChuaDat: (tenChiSo: string, giaTri: number) => `${tenChiSo}: ${giaTri}`,
  chiSoChuaDien: (tenChiSo: string) => `${tenChiSo}: not filled in`,
  chuaDanhGiaDuoc:
    'The player profile is missing attributes, so this role cannot be judged yet.',
  datHet: 'The player meets every key attribute of this role.',
  canhBaoNganTaiO: (soChiSo: number) =>
    soChiSo === 1
      ? '1 key attribute short'
      : `${soChiSo} key attributes short`,
}

export const CHI_THI_DOI_EN: BanDich<typeof CHI_THI_DOI_VI> = {
  tieuDe: 'Team instructions',
  moTa: 'Every level gives something and costs something — none is simply better.',
  tieuDeXungDot: 'Two instructions are working against each other',
  ghiChuXungDot: 'You can still save it like this; this is only a reminder.',
}

export const BO_CHIEN_THUAT_EN: BanDich<typeof BO_CHIEN_THUAT_VI> = {
  tieuDe: 'Saved tactics',
  dangDung: 'In use',
  luuThanhBo: 'Save as new set',
  nhanTenBo: 'Tactic name',
  gidanhTenBo: 'For example: Solid defence',
  apDung: 'Use this set',
  chuaCoBo: 'You have not saved any tactics yet.',
}


export const CHON_CAP_DAU_EN: BanDich<typeof CHON_CAP_DAU_VI> = {
  tieuDe: 'Start a match',
  nhanDoiNha: 'Home team',
  nhanDoiKhach: 'Away team',
  chonDoi: '— Choose a team —',
  nhanQuanSo: 'Players per side',
  moTaQuanSo:
    'Each squad size uses its own set of tactics, chosen on the tactics page.',
  nhanNguoi: (n: number) => `${n}-a-side`,
  nhanThoiLuong: 'Match length',
  moTaThoiLuong:
    'A shorter match gets proportionally fewer commentary lines, so the reading rhythm stays the same.',
  nhanPhut: (n: number) => `${n} minutes`,
  sanTrungLap: 'Play on a neutral ground',
  moTaSanTrungLap:
    'Turns home advantage off completely, so two tactics can be compared fairly.',
  nhanMaTran: 'Match code',
  moTaMaTran:
    'Keep this code — or paste an old one back in — and you can replay exactly that match, even after changing your tactics.',
  maTranMoi: 'Generate a new code',
  maTranKhongHopLe:
    'A match code is exactly 10 characters, using digits and letters except I, L, O and U.',
  batDau: 'Start match',
  tieuDeChuaBatDauDuoc: 'Cannot start yet',
  canHaiDoi:
    'You need at least 2 teams to play a match. Create an opponent first.',
  doiTrungMauAo: (tenDoi: string) =>
    `Both sides share a kit colour, so ${tenDoi} will play in their away kit.`,
}

export const DANG_KY_DOI_HINH_EN: BanDich<typeof DANG_KY_DOI_HINH_VI> = {
  tieuDe: 'Register the line-up',
  moTa: (quanSo: number, duBiToiDa: number) =>
    `Pick exactly ${quanSo} starters, and up to ${duBiToiDa} substitutes.`,
  nhanChinh: 'Starting line-up',
  nhanDuBi: 'Substitutes',
  nhanNgoai: 'Not registered',
  demChinh: (co: number, can: number) => `${co}/${can} starters`,
  demDuBi: (co: number, can: number) => `${co}/${can} substitutes`,
  dungTheoChienThuat: 'Take from the saved tactics',
}

export const LY_DO_KHONG_BAT_DAU_EN: BanDich<typeof LY_DO_KHONG_BAT_DAU_VI> = {
  cungMotDoi: 'Both sides are the same team. Choose two different teams.',
  chuaDuChinh: (tenDoi: string, co: number, can: number) =>
    `${tenDoi} only have ${co} of ${can} starters.`,
  chuaDungDuBi: (tenDoi: string, co: number, can: number) =>
    `${tenDoi} have registered ${co} substitutes, but exactly ${can} are needed.`,
  thieuThuMon: (tenDoi: string) => `${tenDoi} have no goalkeeper in goal.`,
  hoSoChuaHoanTat: (tenDoi: string, tenCauThu: readonly string[]) =>
    `${tenDoi} still have players missing attributes: ${tenCauThu.join(', ')}.`,
  khongDuNguoi: (tenDoi: string, co: number) =>
    `${tenDoi} only have ${co} players in the squad, not the 18 needed to register.`,
}

export const TRAN_DAU_EN: BanDich<typeof TRAN_DAU_VI> = {
  tieuDe: 'Match',
  phut: (p: number, buGio: boolean) => (buGio ? `${p}'+` : `${p}'`),
  tamDung: 'Pause',
  tiepTuc: 'Resume',
  chayHet: 'Play the match out',
  nhanTocDo: 'Speed',
  tocDo: {
    thuong: 'Normal',
    nhanh: 'Fast',
    ratNhanh: 'Very fast',
  },
  tieuDeDienBien: 'Commentary',
  chuaBatDau: 'The match has not started.',
  daKetThuc: 'The match has finished.',
  canhBaoRoiTrang:
    'Leaving the page abandons the match in progress. The match code will still let you replay this exact match later.',
  nhanKietSuc: 'Exhausted',
  nhanTheVang: 'Yellow card',
  nhanTheDo: 'Red card',
  quayLai: 'Leave match',
}

export const THAY_NGUOI_EN: BanDich<typeof THAY_NGUOI_VI> = {
  tieuDe: 'Substitution',
  conLuot: (con: number, toiDa: number) =>
    `${con} of ${toiDa} substitutions left.`,
  canTamDung: 'Pause the match before making a substitution.',
  nhanRa: 'Coming off',
  nhanVao: 'Going on',
  chonCauThu: '— Choose a player —',
  thucHien: 'Substitute',
  hetLuot: 'No substitutions left.',
  khongCoDuBi:
    'This team registered no substitutes, so no substitutions can be made in this match.',
}

export const CAN_THIEP_GIUA_TRAN_EN: BanDich<typeof CAN_THIEP_GIUA_TRAN_VI> = {
  tieuDeChiThi: 'Change instructions during the match',
  moTa: 'Changes apply from the next minute; the minutes already played are unaffected.',
  chiDoiDuocDoiCuaBan: 'You can only make changes to your own team.',
}


export const BAO_CAO_SAU_TRAN_EN: BanDich<typeof BAO_CAO_SAU_TRAN_VI> = {
  tieuDe: 'Match report',
  tieuDeGhiBan: 'Goalscorers',
  chuaCoBanThang: 'There were no goals in this match.',
  phut: (phut: number, buGio: boolean) => `${phut}'${buGio ? '+' : ''}`,

  tieuDeChiTieu: 'Match statistics',
  cotChiTieu: 'Statistic',
  chiTieu: {
    cuSut: 'Shots',
    sutTrungDich: 'Shots on target',
    kiemSoatBong: 'Possession',
    coHoiRoRang: 'Clear-cut chances',
    theVang: 'Yellow cards',
    theDo: 'Red cards',
  },
  phanTram: (x: number) => `${x}%`,

  tieuDeDiem: 'Player ratings',
  moTaDiem:
    'Rated 1–10, starting from 6.0. Tap a player to see the figures behind the rating.',
  cotCauThu: 'Player',
  cotViTri: 'Position',
  cotDiem: 'Rating',
  moBang: 'Show the figures',
  dongBang: 'Hide the figures',
  cotSoLieu: 'Figure',
  cotGopDiem: 'Effect on rating',
  diemNen: 'Base rating',
  khongCoSoLieu: 'This player recorded nothing of note in the match.',

  tieuChi: {
    'ban-thang': 'Goals',
    'kien-tao': 'Assists',
    'sut-trung-dich': 'Shots on target',
    'ti-le-chuyen': 'Pass completion',
    'cuop-bong': 'Balls won',
    'mat-bong': 'Possession lost',
    'pham-loi': 'Fouls',
    'can-cuu': 'Saves',
    'tran-diem': 'Capped at 10',
    'san-diem': 'Floored at 1',
  },

  tieuChiTheoPhanTram: new Set(['ti-le-chuyen']),

  vaoSanPhut: (phut: number) => `on in the ${phut}th minute`,
  raSanPhut: (phut: number) => `off in the ${phut}th minute`,
  daTronTran: 'played the full match',

  tieuDeDauLai: 'Replay this fixture',
  moTaDauLai:
    'No need to pick the teams or register the line-ups again. Keep the match code and you get exactly the match you just saw.',
  dauLaiCungMa: 'Replay with the same code',
  dauLaiMaMoi: 'Replay with a new code',
}

export const VAO_BAT_GON_EN: BanDich<typeof VAO_BAT_GON_VI> = {
  tieuDeTrong: 'The goal is unguarded',
  tieuDeChuaChay: (ten: string) => `${ten} is standing in goal`,
  moTa:
    'Choose an outfield player to go in goal. He will be badly out of position and lose effectiveness.',
  nhanChon: 'Player going in goal',
  chonCauThu: '— choose —',
  thucHien: 'Put him in goal',
  conLuotThay: (conLuot: number) =>
    `${conLuot} substitutions left: bring the reserve keeper on for another player, then put him in goal.`,
  hetLuotThay:
    'There are no substitutions left, so an outfield player has to do it.',
  canTamDung: 'Pause the match to choose who goes in goal.',
}

export const SO_SANH_TRAN_EN: BanDich<typeof SO_SANH_TRAN_VI> = {
  tieuDe: 'Against the previous run of this match code',
  moTa: 'The earlier result is kept only for this session.',
  cotChiTieu: 'Statistic',
  cotLanTruoc: 'Previous run',
  cotLanNay: 'This run',
  tiSo: 'Score',
  cuSut: 'Shots',
  coHoi: 'Clear-cut chances',
  hai: (nha: number, khach: number) => `${nha} – ${khach}`,
}

export const SAN_2D_EN: BanDich<typeof SAN_2D_VI> = {
  tieuDe: 'The pitch',
  an: 'Hide the pitch',
  hien: 'Show the pitch',
  moTaSan: (nha: string, khach: string) =>
    `2D pitch: ${nha} are playing left to right, ${khach} right to left.`,
  moTaDiem: (
    ten: string,
    soAo: number | null,
    viTri: string,
    tenDoi: string,
    thamGia: boolean,
  ) => {
    const phan = [ten]
    if (soAo !== null) phan.push(`number ${soAo}`)
    if (viTri) phan.push(viTri)
    phan.push(tenDoi)
    if (thamGia) phan.push('involved in this passage of play')
    return phan.join(', ')
  },
  /*
    Dấu tam giác là KÝ HIỆU, không phải chữ — viết y hệt ở hai ngôn ngữ,
    cùng lý do với tên sơ đồ (D75). Vẫn phải khai ở đây để phép kiểm hình
    dạng của `BanDich` không hụt khoá.
  */
  dauThamGia: '▲',
  anKhiChayHet:
    'The pitch rests while the match plays itself out, then is drawn again at the final minute.',
}

export const SAO_LUU_EN: BanDich<typeof SAO_LUU_VI> = {
  tieuDe: 'Back up your data',
  moTa: 'The data lives in this browser, so clearing your browser data loses it. Export a file to keep it, or to move it to another machine.',
  nutXuat: 'Export to a file',
  dangDungTep: 'Building the file…',
  kichThuocUocTinh: (co: string) => `The file will be about ${co}`,
  nutNhap: 'Import from a file',
  dangDocTep: 'Reading the file…',
  tomTatTep: (soDoi: number, soCauThu: number, soAnh: number) =>
    `This file holds ${soDoi} teams, ${soCauThu} players and ${soAnh} photos.`,
  hoiCheDo: 'What should happen to the data already on this machine?',
  nutThayThe: 'Replace everything',
  moTaThayThe: 'Delete all the data here, then use the data in the file.',
  nutGop: 'Add alongside',
  moTaGop: 'Keep the data that is here and add the data in the file next to it.',
  daNhapThayThe: (soDoi: number, soCauThu: number, soTran: number) =>
    `All the data has been replaced: ${soDoi} teams, ${soCauThu} players, ${soTran} matches in the history.`,
  daNhapGop: (soDoi: number, soCauThu: number) =>
    `Added ${soDoi} teams and ${soCauThu} players alongside the data already here.`,
  gopBoQuaLichSu: (soTran: number) =>
    `The file also holds ${soTran} matches of history, but adding alongside takes no history — each match record points at its teams and players by their old ids. To bring the history across too, use "Replace everything".`,
  canhBaoKhongBen:
    'The browser has not marked this data as persistent, so it can be cleared when the machine runs short of space. Export a backup file regularly.',
}

export const LUU_TRU_EN: BanDich<typeof LUU_TRU_VI> = {
  canhBaoChuaLuu:
    'The browser storage is full, so that last change was NOT saved.',
  goiYXuatTep: 'Export your data to a file so nothing you entered is lost.',
  canhBaoKhongBen:
    'The browser has not marked this data as persistent, so it can be cleared when the machine runs short of space.',
  goiYXuatTepThuongXuyen: 'Export a backup file regularly.',
}

export const LICH_SU_EN: BanDich<typeof LICH_SU_VI> = {
  tieuDe: 'Match history',
  moTa: (giuLai: number) =>
    `Keeps the last ${giuLai} matches. Older ones drop off the list by themselves.`,
  chuaCoTran: 'No matches yet. Play one and come back here.',
  moLink: 'Open again',
  dong: 'Close',
  cotThoiDiem: 'Finished at',
  cotCapDau: 'Fixture',
  cotTiSo: 'Score',
  cotMaTran: 'Match code',
  dinhDangTran: (quanSo: number, thoiLuong: number) =>
    `${quanSo}-a-side · ${thoiLuong} minutes`,
  doiDaXoa: 'team deleted',
  khongDauLaiDuoc:
    'One of the two teams has been deleted, so this match can only be read back, not replayed.',
  khacPhienBan:
    'This match ran on an older engine version, so replaying it with the same code will NOT give the same match. The record itself reads back intact.',
  dauLai: 'Replay this match',
  lyDoKhongDauLai: {
    'khac-phien-ban-engine':
      'Cannot be replayed: this match ran on an older engine version, so the same code now gives a different match.',
    'doi-da-bi-xoa':
      'Cannot be replayed: one of the two teams has been deleted, so there is no profile left to rebuild the fixture from.',
  },
  daLoaiTranCu: (so: number) =>
    so === 1
      ? 'The history was full, so the oldest match has dropped off the list.'
      : `The history was full, so the ${so} oldest matches have dropped off the list.`,
  dongBaoDaLoai: 'Got it',
  tieuDeDienBien: 'Match commentary',
}

export const LY_DO_TU_CHOI_CAN_THIEP_EN: Readonly<Record<string, string>> = {
  'tran-da-ket-thuc': 'The match has finished; nothing can be changed now.',
  'khong-phai-doi-cua-ban': 'You can only make changes to your own team.',
  'het-luot-thay': 'There are no substitutions left.',
  'cau-thu-khong-tren-san': 'This player is not on the pitch.',
  'cau-thu-khong-trong-du-bi': 'This player is not among the substitutes.',
  'da-nhan-the-do': 'This player has been sent off.',
  'o-khong-ton-tai': 'That slot is not part of the formation in use.',
  'vai-tro-khong-phu-hop': 'That role cannot be used in that slot.',
  'khung-thanh-da-co-thu-mon': 'A proper goalkeeper is already in goal.',
  'cau-thu-da-bat-gon': 'This player is already in goal.',
}

/** Mệnh đề nêu rõ bộ chiến thuật sai ở đâu, ghép vào câu `InvalidTactic`. */
const LY_DO_CHIEN_THUAT_SAI_EN: Readonly<Record<string, string>> = {
  'so-o': ' because the number of slots does not match the formation',
  'slot-la': ' because a slot does not belong to this formation',
  'vai-tro-khong-phu-hop':
    ' because a role cannot be used in the slot it is in',
  'cau-thu-khac-doi': ' because a slot holds a player who is not in this team',
  'cau-thu-trung-o': ' because one player is in two slots at once',
  'thieu-chi-thi': ' because a team instruction is missing',
  'bo-cua-doi-khac': ' because this set belongs to another team',
  ten: ' while the set has no name',
}

export const LOI_EN: BanDich<typeof LOI_VI> = {
  cau: (
    loi: LoiUngDung,
    nhanChiSo?: (id: AttributeId | GkAttributeId) => string,
  ): string => {
    switch (loi.ma) {
      case 'EmptyName':
        return 'A team name cannot be empty.'
      case 'NotFound':
        return 'This data is no longer there. It may have been deleted elsewhere.'
      case 'DuplicateShirtNumber':
        return `Number ${loi.chiTiet.giaTri ?? ''} is already taken by another player in this team. Choose a different one.`.trim()
      case 'InvalidAttributeValue':
        return nhanChiSo &&
          loi.chiTiet.truong &&
          laChiSoHopLe(loi.chiTiet.truong)
          ? `${nhanChiSo(loi.chiTiet.truong)} has to be a whole number from 1 to 20.`
          : 'This attribute has to be a whole number from 1 to 20.'
      case 'InvalidPositions':
        return 'A goalkeeper uses his own set of attributes, so he cannot also hold an outfield position. Either choose Goalkeeper on its own, or only outfield positions.'
      case 'NotAnImage':
        return 'The file you chose is not an image. Choose an image file (JPG, PNG or WebP).'
      case 'DecodeFailed':
        return 'This image could not be read; the file may be damaged. Try another one.'
      case 'NotJson':
        return 'This is not a backup file from this app. Choose a file exported from here.'
      case 'SchemaInvalid':
        return `The backup file has the wrong format${loi.chiTiet.duongDan ? ` at "${loi.chiTiet.duongDan}"` : ''}. Your current data has not been touched.`
      case 'VersionTooNew':
        return 'This file was exported from a newer version of the app than the one you are running, so it cannot be read.'
      case 'QuotaExceeded':
        return `${LUU_TRU_EN.canhBaoChuaLuu} ${LUU_TRU_EN.goiYXuatTep}`
      case 'StorageUnavailable':
        return 'The browser storage could not be opened. Try reloading the page.'
      case 'InvalidColor':
        return 'That colour code is not valid. Choose the kit colour again.'
      case 'InvalidTactic':
        return `The tactic set could not be saved${LY_DO_CHIEN_THUAT_SAI_EN[String(loi.chiTiet.truong)] ?? ''}. The tactics you have saved have not been touched.`
    }
  },
}
