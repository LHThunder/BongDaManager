/*
  Luật màu: tương phản chữ/nền và nhận biết hai đội trùng màu áo.

  Màu áo do người dùng chọn tuỳ ý, nên không thể phó cho may mắn việc chữ có
  đọc được hay không — hiến pháp P9 đòi tỉ lệ tương phản tối thiểu 4.5:1.
  Hai hàm ở đây là hàm thuần, không phụ thuộc gì, nên test được bằng các mốc
  màu cụ thể (quyết định D8 của plan: không thêm thư viện xử lý màu cho việc
  mà hai hàm ngắn làm được).
*/

export const MAU_CHU_SANG = '#FFFFFF'
export const MAU_CHU_TOI = '#111827'

/** Tỉ lệ tương phản tối thiểu mà hiến pháp P9 yêu cầu. */
export const TUONG_PHAN_TOI_THIEU = 4.5

export class LoiMauKhongHopLe extends Error {
  readonly mau: string

  constructor(mau: string) {
    super(`Mã màu không hợp lệ: ${mau}`)
    this.name = 'LoiMauKhongHopLe'
    this.mau = mau
  }
}

const MAU_HEX = /^#([0-9a-fA-F]{6})$/

export function laMauHopLe(mau: string): boolean {
  return MAU_HEX.test(mau.trim())
}

export interface Rgb {
  readonly r: number
  readonly g: number
  readonly b: number
}

export function docMau(mau: string): Rgb {
  const khop = MAU_HEX.exec(mau.trim())
  if (!khop || khop[1] === undefined) {
    throw new LoiMauKhongHopLe(mau)
  }
  const so = Number.parseInt(khop[1], 16)
  return {
    r: (so >> 16) & 0xff,
    g: (so >> 8) & 0xff,
    b: so & 0xff,
  }
}

/** Độ sáng tương đối theo công thức WCAG. */
function doSangTuongDoi({ r, g, b }: Rgb): number {
  const kenh = (gia: number): number => {
    const c = gia / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * kenh(r) + 0.7152 * kenh(g) + 0.0722 * kenh(b)
}

/** Tỉ lệ tương phản giữa hai màu, từ 1 (giống nhau) tới 21 (đen/trắng). */
export function tiLeTuongPhan(mauA: string, mauB: string): number {
  const a = doSangTuongDoi(docMau(mauA))
  const b = doSangTuongDoi(docMau(mauB))
  const sang = Math.max(a, b)
  const toi = Math.min(a, b)
  return (sang + 0.05) / (toi + 0.05)
}

/**
 * Màu chữ đọc được trên một màu nền bất kỳ (AC-3.8).
 * Chọn giữa chữ sáng và chữ tối, lấy bên cho tương phản cao hơn.
 */
export function mauChuTuongPhan(mauNen: string): string {
  const voiChuSang = tiLeTuongPhan(mauNen, MAU_CHU_SANG)
  const voiChuToi = tiLeTuongPhan(mauNen, MAU_CHU_TOI)
  return voiChuSang >= voiChuToi ? MAU_CHU_SANG : MAU_CHU_TOI
}

/** Màu nền này có đạt chuẩn tương phản với màu chữ tốt nhất của nó không. */
export function dongChuDocDuoc(mauNen: string): boolean {
  return (
    tiLeTuongPhan(mauNen, mauChuTuongPhan(mauNen)) >= TUONG_PHAN_TOI_THIEU
  )
}

function sangHex({ r, g, b }: Rgb): string {
  const hai = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0')
  return `#${hai(r)}${hai(g)}${hai(b)}`.toUpperCase()
}

function tron(a: Rgb, b: Rgb, tiLe: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * tiLe,
    g: a.g + (b.g - a.g) * tiLe,
    b: a.b + (b.b - a.b) * tiLe,
  }
}

export interface NenVaChu {
  readonly nen: string
  readonly chu: string
  /** true khi nền đã bị điều chỉnh để đạt chuẩn tương phản. */
  readonly daDieuChinh: boolean
}

/*
  Khoảng 6% màu trong không gian RGB không đạt 4.5:1 với CẢ chữ sáng lẫn chữ
  tối — phần lớn là các sắc xanh dương và xanh ngọc tầm trung, ví dụ #0077DD.
  Với những màu đó, chọn màu chữ thôi là không đủ để thoả AC-3.8.

  Nên khi gặp trường hợp đó, nền được pha dần về phía đen hoặc trắng cho tới
  khi đạt chuẩn. Màu đội vẫn nhận ra được vì sắc màu không đổi, chỉ đậm/nhạt
  hơn, và chữ thì luôn đọc được.
*/
export function nenDamBaoTuongPhan(mauNen: string): NenVaChu {
  const chu = mauChuTuongPhan(mauNen)

  if (tiLeTuongPhan(mauNen, chu) >= TUONG_PHAN_TOI_THIEU) {
    return { nen: mauNen.trim().toUpperCase(), chu, daDieuChinh: false }
  }

  // Chữ sáng thì làm nền tối đi; chữ tối thì làm nền sáng lên.
  const dich: Rgb =
    chu === MAU_CHU_SANG ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
  const goc = docMau(mauNen)

  for (let tiLe = 0.05; tiLe <= 1; tiLe += 0.05) {
    const thu = sangHex(tron(goc, dich, tiLe))
    if (tiLeTuongPhan(thu, chu) >= TUONG_PHAN_TOI_THIEU) {
      return { nen: thu, chu, daDieuChinh: true }
    }
  }

  return { nen: sangHex(dich), chu, daDieuChinh: true }
}

/*
  Khoảng cách màu theo công thức "redmean" — xấp xỉ cảm nhận của mắt tốt hơn
  khoảng cách Euclid thuần trên RGB, mà vẫn chỉ là vài phép tính.
  Giá trị tối đa khoảng 765.
*/
export function khoangCachMau(mauA: string, mauB: string): number {
  const a = docMau(mauA)
  const b = docMau(mauB)

  const trungBinhDo = (a.r + b.r) / 2
  const dR = a.r - b.r
  const dG = a.g - b.g
  const dB = a.b - b.b

  return Math.sqrt(
    (2 + trungBinhDo / 256) * dR * dR +
      4 * dG * dG +
      (2 + (255 - trungBinhDo) / 256) * dB * dB,
  )
}

/**
 * Dưới ngưỡng này thì hai màu áo bị coi là quá giống nhau.
 * Con số chọn theo các mốc trong `colors.test.ts`; sửa thì test sẽ lên tiếng.
 */
export const NGUONG_TRUNG_MAU_AO = 150

/** Hai đội có trùng màu áo tới mức khó phân biệt không (AC-3.7). */
export function trungMauAo(mauA: string, mauB: string): boolean {
  return khoangCachMau(mauA, mauB) < NGUONG_TRUNG_MAU_AO
}
