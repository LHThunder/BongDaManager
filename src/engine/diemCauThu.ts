import { layViTri } from '../domain/positions'
import type { PositionId, PositionLine } from '../domain/types'
import type { ThongKeCauThu } from './tran'

/*
  Chấm điểm cầu thủ sau trận (AC-11.3, quyết định D49).

  Hàm THUẦN: vào là số liệu một trận của một người cộng vị trí của ô họ đã
  đá, ra là điểm 1–10 **kèm bảng các thành phần**. Bảng đó không phải thứ cho
  đẹp — AC-11.3 đòi "người dùng PHẢI xem được những số liệu nào đã dẫn tới
  điểm đó", nên nếu hàm chỉ trả về một con số thì AC không thoả được.

  Vì sao ở `engine/` chứ không trong component báo cáo: P2 gọi tên "chấm điểm
  cầu thủ" là luật bóng đá.

  Vì sao `tieuChi` là một khoá chứ không phải câu tiếng Việt: P8 đặt mọi chữ
  người dùng thấy ở `ui/strings.ts`, và P2 không cho engine giữ chữ của giao
  diện — cùng lý do mà D22 để engine phát sự kiện có cấu trúc rồi giao diện
  mới dựng câu. (Contract ở `plan.md` mục IV.5 ghi `ten: string`; đó là chỗ
  plan nói ngược hiến pháp, và theo mục 6 Quản trị thì hiến pháp đứng trên.)
*/

export const DIEM_NEN = 6
export const DIEM_TOI_THIEU = 1
export const DIEM_TOI_DA = 10

/** Mức chuyền chính xác coi là "bình thường"; trên mức này mới được cộng. */
export const TI_LE_CHUYEN_NEN = 0.75

export type TieuChiDiem =
  | 'ban-thang'
  | 'kien-tao'
  | 'sut-trung-dich'
  | 'ti-le-chuyen'
  | 'cuop-bong'
  | 'mat-bong'
  | 'pham-loi'
  | 'can-cuu'
  /* Hai khoá dưới đây không phải tiêu chí của AC-11.3 — chúng ghi phần bị
     kẹp khi điểm thô vượt 10 hoặc tụt dưới 1, để tổng bảng luôn khớp điểm. */
  | 'tran-diem'
  | 'san-diem'

export interface ThanhPhanDiem {
  readonly tieuChi: TieuChiDiem
  /** Số liệu thật để in ra cho người dùng; với tỉ lệ chuyền là phần trăm. */
  readonly soLieu: number
  /** Phần cộng vào (dương) hay trừ đi (âm) điểm nền. */
  readonly diemCong: number
}

export interface KetQuaChamDiem {
  readonly diem: number
  readonly cacThanhPhan: readonly ThanhPhanDiem[]
}

/*
  Bảng trọng số, khai MỘT chỗ cho cả bốn tuyến — cùng cách làm như bảng hệ số
  chỉ thị của D24. Rải thành các nhánh `if` thì sau 4 tuyến nhân 8 tiêu chí là
  32 nhánh chồng nhau, không ai dò nổi.

  Đọc theo hàng để thấy "ai được chấm theo cái gì": trung vệ sống bằng cướp
  bóng, tiền vệ bằng đường chuyền, tiền đạo bằng bàn thắng, thủ môn bằng cứu
  thua. Một bàn thắng của trung vệ đáng hơn một bàn của tiền đạo, vì nó là
  việc ngoài phận sự.
*/
/** Tám tiêu chí có trọng số; hai khoá kẹp điểm không nằm trong bảng. */
export type TieuChiCoTrongSo = Exclude<
  TieuChiDiem,
  'tran-diem' | 'san-diem'
>

const TRONG_SO: Readonly<
  Record<PositionLine, Readonly<Record<TieuChiCoTrongSo, number>>>
> = {
  'thu-mon': {
    'ban-thang': 2.5,
    'kien-tao': 1.2,
    'sut-trung-dich': 0.2,
    'ti-le-chuyen': 1.2,
    'cuop-bong': 0.2,
    'mat-bong': -0.3,
    'pham-loi': -0.45,
    'can-cuu': 0.3,
  },
  'phong-ngu': {
    'ban-thang': 1.6,
    'kien-tao': 0.9,
    'sut-trung-dich': 0.25,
    'ti-le-chuyen': 1,
    'cuop-bong': 0.14,
    'mat-bong': -0.2,
    'pham-loi': -0.3,
    'can-cuu': 0,
  },
  'tien-ve': {
    'ban-thang': 1.3,
    'kien-tao': 0.8,
    'sut-trung-dich': 0.3,
    'ti-le-chuyen': 1.6,
    'cuop-bong': 0.1,
    'mat-bong': -0.14,
    'pham-loi': -0.25,
    'can-cuu': 0,
  },
  'tan-cong': {
    'ban-thang': 1.1,
    'kien-tao': 0.6,
    'sut-trung-dich': 0.4,
    'ti-le-chuyen': 0.7,
    'cuop-bong': 0.06,
    'mat-bong': -0.1,
    'pham-loi': -0.2,
    'can-cuu': 0,
  },
}

function lamTron(x: number): number {
  return Math.round(x * 10) / 10
}

/** Tỉ lệ chuyền chính xác, hay `null` khi người đó chưa chuyền quả nào. */
export function tiLeChuyen(tk: ThongKeCauThu): number | null {
  const tong = tk.chuyenThanhCong + tk.chuyenHong
  return tong === 0 ? null : tk.chuyenThanhCong / tong
}

/**
 * Điểm 1–10 cho một cầu thủ, kèm bảng thành phần (AC-11.3).
 *
 * `viTriDaDa` là vị trí của **ô** người đó đứng, không phải vị trí sở trường:
 * một tiền đạo bị xếp làm trung vệ được chấm theo thước của trung vệ, vì đó
 * là việc họ đã phải làm trong trận.
 */
export function chamDiem(
  tk: ThongKeCauThu,
  viTriDaDa: PositionId,
): KetQuaChamDiem {
  const trongSo = TRONG_SO[layViTri(viTriDaDa).tuyen]
  const cacThanhPhan: ThanhPhanDiem[] = []

  const them = (tieuChi: TieuChiCoTrongSo, soLieu: number): void => {
    const diemCong = lamTron(soLieu * trongSo[tieuChi])
    if (diemCong === 0) return
    cacThanhPhan.push({ tieuChi, soLieu, diemCong })
  }

  them('ban-thang', tk.banThang)
  them('kien-tao', tk.kienTao)
  them('sut-trung-dich', tk.sutTrungDich)
  them('cuop-bong', tk.cuopBong)
  them('mat-bong', tk.matBong)
  them('pham-loi', tk.phamLoi)
  them('can-cuu', tk.canCuu)

  /*
    Tỉ lệ chuyền là TỈ LỆ, không phải số lần, nên nó được quy về độ lệch so
    với mức nền: chuyền chính xác 90% thì cộng, 60% thì trừ. Chưa chuyền quả
    nào thì không cộng không trừ — và sau T102b thì mọi người trên sân đều có
    đường chuyền, nên nhánh đó chỉ là đường lui.
  */
  const tiLe = tiLeChuyen(tk)
  if (tiLe !== null) {
    const diemCong = lamTron(
      (tiLe - TI_LE_CHUYEN_NEN) * trongSo['ti-le-chuyen'] * 10,
    )
    if (diemCong !== 0) {
      cacThanhPhan.push({
        tieuChi: 'ti-le-chuyen',
        soLieu: Math.round(tiLe * 100),
        diemCong,
      })
    }
  }

  /*
    Kẹp vào 1..10, và nếu có kẹp thì ghi luôn phần bị kẹp thành MỘT thành
    phần nữa.

    Lý do: bảng thành phần là lời giải thích cho con số, nên tổng của nó phải
    bằng đúng con số đó. Kẹp âm thầm thì một người đáng 11,2 điểm hiện ra 10
    với bảng cộng lại thành 11,2 — bảng nói dối, và AC-11.3 sẽ không thoả dù
    điểm trông vẫn hợp lý.
  */
  const tongCong = cacThanhPhan.reduce((s, x) => s + x.diemCong, 0)
  const diemTho = lamTron(DIEM_NEN + tongCong)
  const diem = Math.min(Math.max(diemTho, DIEM_TOI_THIEU), DIEM_TOI_DA)

  if (diem !== diemTho) {
    cacThanhPhan.push({
      tieuChi: diem === DIEM_TOI_DA ? 'tran-diem' : 'san-diem',
      soLieu: diemTho,
      diemCong: lamTron(diem - diemTho),
    })
  }

  return { diem, cacThanhPhan }
}
