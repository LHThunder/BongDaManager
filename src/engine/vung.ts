/*
  Lưới vùng sân: 3 cột × 4 dải = 12 vùng (quyết định D23).

  Vì sao không mô phỏng toạ độ liên tục: như vậy là phải mô phỏng vị trí từng
  người theo thời gian, một bài toán lớn hơn nhiều và không AC nào đòi. 12
  vùng là vừa đủ để "tấn công biên" và "pressing cao" thành con số đo được
  (AC-8.3, AC-8.4).

  Vì sao phải có CỘT chứ không chỉ một dãy dọc: AC-8.3 so số quả tạt giữa tấn
  công biên và tấn công trung lộ — không phân biệt được bóng đang ở biên hay ở
  giữa thì phép so đó không tồn tại.

  Dải luôn tính theo hướng tấn công của ĐỘI ĐANG GIỮ BÓNG: dải 0 là sân nhà
  của họ, dải 3 là vòng cấm đối phương. Khi bóng đổi chân thì dùng `latVung`.
*/

export type CotSan = 'trai' | 'giua' | 'phai'

/** 0 = sân nhà, 1 = phần sân nhà phía trên, 2 = phần sân đối phương, 3 = vòng cấm đối phương. */
export type DaiSan = 0 | 1 | 2 | 3

export interface VungSan {
  readonly id: string
  readonly cot: CotSan
  readonly dai: DaiSan
}

export const CAC_COT: readonly CotSan[] = ['trai', 'giua', 'phai']
export const CAC_DAI: readonly DaiSan[] = [0, 1, 2, 3]

function taoId(cot: CotSan, dai: DaiSan): string {
  return `${cot}-${dai}`
}

export const CAC_VUNG: readonly VungSan[] = CAC_DAI.flatMap((dai) =>
  CAC_COT.map((cot) => ({ id: taoId(cot, dai), cot, dai })),
)

const THEO_ID = new Map<string, VungSan>(CAC_VUNG.map((v) => [v.id, v]))

export function layVung(cot: CotSan, dai: DaiSan): VungSan {
  const vung = THEO_ID.get(taoId(cot, dai))
  if (!vung) {
    throw new Error(`Vùng không tồn tại: ${cot}-${dai}`)
  }
  return vung
}

const COT_DOI_XUNG: Readonly<Record<CotSan, CotSan>> = {
  trai: 'phai',
  giua: 'giua',
  phai: 'trai',
}

/**
 * Cùng một chỗ trên sân, nhìn từ phía đội kia.
 *
 * Dải lật lại (0 ↔ 3, 1 ↔ 2) vì hai đội tấn công ngược hướng nhau; cột cũng
 * lật (trái ↔ phải) vì quay người lại thì tay trái thành tay phải. Lật hai
 * lần phải ra đúng vùng ban đầu — có test khẳng định điều đó.
 */
export function latVung(vung: VungSan): VungSan {
  return layVung(COT_DOI_XUNG[vung.cot], (3 - vung.dai) as DaiSan)
}

/** Hai vùng có kề nhau không — bóng chỉ dịch sang vùng kề, không nhảy cóc. */
export function keNhau(a: VungSan, b: VungSan): boolean {
  const lechDai = Math.abs(a.dai - b.dai)
  const lechCot = Math.abs(
    CAC_COT.indexOf(a.cot) - CAC_COT.indexOf(b.cot),
  )
  if (lechDai === 0 && lechCot === 0) return false
  return lechDai <= 1 && lechCot <= 1
}

/** Các vùng mà bóng dịch tới được từ `vung`. */
export function cacVungKe(vung: VungSan): readonly VungSan[] {
  return CAC_VUNG.filter((v) => keNhau(vung, v))
}

/** Vùng sâu nhất bên phần sân đối phương — chỗ dứt điểm. */
export function laVungDutDiem(vung: VungSan): boolean {
  return vung.dai === 3
}

/** Vùng thuộc phần sân đối phương — chỗ pressing cao giành lại bóng (AC-8.4). */
export function laDaiCao(vung: VungSan): boolean {
  return vung.dai >= 2
}

/** Vùng ở hai hành lang biên — chỗ sinh ra những quả tạt (AC-8.3). */
export function laVungBien(vung: VungSan): boolean {
  return vung.cot !== 'giua'
}
