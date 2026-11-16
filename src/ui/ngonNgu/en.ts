import type { BanDich } from './kieu'
import type {
  CHUNG_VI,
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
  chiSoTongTaiViTri: (tenViTri: string) => `Overall as a ${tenViTri}`,
}
