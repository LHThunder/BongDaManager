import { describe, expect, it } from 'vitest'
import cssGoc from '../index.css?raw'
import {
  TUONG_PHAN_TOI_THIEU,
  nenDamBaoTuongPhan,
  tiLeTuongPhan,
} from '../domain/colors'

/*
  Tương phản của cả hai bảng màu (T328, AC-20.2 và AC-20.5).

  Phép kiểm đọc THẲNG `src/index.css` chứ không chép lại bảng màu vào đây.
  Chép lại thì hai bản sẽ lệch nhau ngay lần đầu ai đó chỉnh một màu, và
  phép kiểm vẫn xanh trong khi màn hình đã hỏng — đúng kiểu test tự trấn an
  mình. Đọc file thật thì sửa màu ở đâu, phép kiểm thấy ở đó.

  `tiLeTuongPhan` và `nenDamBaoTuongPhan` dùng lại của `domain/colors.ts`, đã
  có từ spec 001 cho màu áo. Một công thức tương phản trong repo là đủ.
*/

/*
  Mọi khai báo biến trong các khối có bộ chọn cho trước, gộp lại.

  `boChon` là mẫu regex chứ không phải chuỗi đặc: CSS đi qua PostCSS trước
  khi tới đây nên dấu nháy trong `[data-che-do='toi']` có thể đổi kiểu.
*/
function docKhoi(boChon: string): Readonly<Record<string, string>> {
  const ra: Record<string, string> = {}
  const re = new RegExp(boChon + '\\s*\\{([^}]*)\\}', 'g')
  let khop = re.exec(cssGoc)
  if (khop === null) throw new Error(`Không thấy bộ chọn ${boChon}`)
  while (khop !== null) {
    /*
      Bỏ chú thích TRƯỚC khi tách: một khai báo đứng ngay sau chú thích thì
      mảnh của nó mở đầu bằng `/* …`, và phép khớp neo ở đầu mảnh sẽ trượt —
      token ấy lặng lẽ biến mất khỏi bảng và không cặp nào đo nó nữa.
    */
    for (const manh of khop[1].replace(/\/\*[\s\S]*?\*\//g, '').split(';')) {
      const m = /^\s*--([a-z0-9-]+)\s*:\s*(.+)$/i.exec(manh)
      if (m) ra[m[1]] = m[2].trim()
    }
    khop = re.exec(cssGoc)
  }
  return ra
}

/** Token của mặt cỏ, tách khỏi token giao diện theo tiền tố tên. */
const LA_CO = (ten: string) => ten.startsWith('co-') || ten.startsWith('sai-')

const GOC = docKhoi(':root(?![\[\w-])')
const SANG = Object.fromEntries(
  Object.entries(GOC).filter(([k]) => !LA_CO(k)),
)
const CO = Object.fromEntries(Object.entries(GOC).filter(([k]) => LA_CO(k)))
const TOI = docKhoi(":root\\[data-che-do='toi'\\]")

/*
  Những cặp (chữ, nền) thật sự đứng cạnh nhau trên màn hình. Danh sách này là
  phần phải đọc kỹ khi thêm token mới: một token không có trong đây là một
  màu chưa ai chứng minh là đọc được.
*/
const CAP: readonly (readonly [string, string])[] = [
  ['chu', 'nen'],
  ['chu', 'nen-the'],
  ['chu', 'nen-nhan'],
  ['chu-phu', 'nen'],
  ['chu-phu', 'nen-the'],
  ['chu-phu', 'nen-nhan'],
  ['chinh', 'nen'],
  ['chinh', 'nen-the'],
  ['chinh', 'nen-nhan'],
  ['chinh-dam', 'chinh-nhat'],
  ['chu-tren-chinh', 'chinh'],
  ['chu-tren-chinh', 'chinh-dam'],
  ['canh-bao-chu', 'canh-bao-nen'],
  ['loi-chu', 'loi-nen'],
  ['tot-chu', 'tot-nen'],
  ['chu-tren-loi', 'loi-manh'],
  ['chu-tren-loi', 'loi-manh-dam'],
  ['chu-tren-canh-bao', 'canh-bao-manh'],
  ['chu-tren-canh-bao', 'canh-bao-manh-dam'],
  /*
    Nút tắt: chữ phụ trên nền nhạt. Bản đầu dùng nền 'vien-dam' cho giống
    nút xám cũ, nhưng phép kiểm này đo ra 3.90:1 ở chế độ sáng — tức nhãn
    của nút tắt KHÔNG đọc được. Đổi nền chứ không hạ ngưỡng.
  */
  ['chu-phu', 'nen-nhan'],
]

describe('bảng màu đạt 4.5:1 ở cả hai chế độ (AC-20.2)', () => {
  for (const [ten, bang] of [
    ['sáng', SANG],
    ['tối', TOI],
  ] as const) {
    for (const [chu, nen] of CAP) {
      it(`${ten}: ${chu} trên ${nen}`, () => {
        const mauChu = bang[chu]
        const mauNen = bang[nen]
        expect(mauChu, `thiếu --${chu}`).toBeDefined()
        expect(mauNen, `thiếu --${nen}`).toBeDefined()
        expect(tiLeTuongPhan(mauChu, mauNen)).toBeGreaterThanOrEqual(
          TUONG_PHAN_TOI_THIEU,
        )
      })
    }
  }

  /*
    Chế độ tối phải khai LẠI mọi token giao diện của chế độ sáng. Sót một
    token là chỗ ấy giữ nguyên màu của chế độ sáng — thường là chữ đen trên
    nền đen — và không phép kiểm cặp nào ở trên bắt được, vì cặp ấy lúc đó
    đọc hai màu của cùng một bảng.
  */
  it('chế độ tối không sót token nào của chế độ sáng', () => {
    expect(Object.keys(SANG).filter((k) => !(k in TOI))).toEqual([])
  })
})

/*
  Mặt cỏ có bảng riêng, giống nhau ở cả hai chế độ — sân vẫn xanh trong một
  căn phòng tối. Vì thế nó được đo một lần, nhưng vẫn phải đo.
*/
describe('chữ trên mặt cỏ đọc được (AC-20.2)', () => {
  for (const [chu, nen] of [
    ['co-chu', 'co-nen'],
    ['co-chu', 'co-nen-dam'],
    ['co-canh-bao-chu', 'co-canh-bao-nen'],
    ['co-nhan-chu', 'co-nhan-nen'],
  ] as const) {
    it(`${chu} trên ${nen}`, () => {
      expect(
        tiLeTuongPhan(tronLenCo(CO[chu]), tronLenCo(CO[nen])),
      ).toBeGreaterThanOrEqual(TUONG_PHAN_TOI_THIEU)
    })
  }
})

/*
  AC-20.5: màu áo do người dùng tự chọn đặt cạnh màu của theme thì hai thứ
  vẫn phân biệt được, và chữ trên nền màu áo vẫn đạt 4.5:1 — ở cả hai chế độ.

  Điều này đúng theo CẤU TRÚC chứ không nhờ chọn màu khéo: `nenDamBaoTuongPhan`
  quyết định màu chữ (và nếu cần, chỉnh độ sáng của nền) chỉ dựa vào chính
  màu áo, không dựa vào nền sau lưng nó. Đổi bảng màu của theme không đụng
  được vào kết quả ấy.

  Phép kiểm thứ hai giữ phần "phân biệt được": theme KHÔNG được thay màu áo
  bằng màu của mình. Chỉnh độ sáng thì được — sắc màu phải giữ nguyên, đó là
  thứ người xem nhận ra đội bóng.
*/
describe('màu áo người dùng chọn không bị theme nuốt (AC-20.5)', () => {
  const MAU_AO_THU: readonly string[] = [
    '#1E40AF',
    '#F8FAFC',
    '#DC2626',
    '#FACC15',
    '#000000',
    '#FFFFFF',
    '#0077DD',
    '#64748B',
  ]

  for (const mau of MAU_AO_THU) {
    it(`${mau}: chữ trên nền màu áo đạt 4.5:1`, () => {
      const { nen, chu } = nenDamBaoTuongPhan(mau)
      expect(tiLeTuongPhan(nen, chu)).toBeGreaterThanOrEqual(
        TUONG_PHAN_TOI_THIEU,
      )
    })
  }

  it('giữ nguyên sắc màu, chỉ chỉnh đậm nhạt', () => {
    for (const mau of MAU_AO_THU) {
      const { nen, daDieuChinh } = nenDamBaoTuongPhan(mau)
      if (!daDieuChinh) {
        expect(nen).toBe(mau.toUpperCase())
        continue
      }
      const sacGoc = sacMau(mau)
      /* Màu xám và đen trắng không có sắc, nên không có gì để so. */
      if (sacGoc === null) continue
      expect(sacMau(nen), `${mau} → ${nen}`).toBeCloseTo(sacGoc, 0)
    }
  })
})

/** `rgba(...)` của nhóm cỏ quy về hex bằng cách trộn lên chính mặt cỏ. */
function tronLenCo(giaTri: string): string {
  const m = /rgba?\(([^)]+)\)/.exec(giaTri)
  if (!m) return giaTri
  const phan = m[1].split(',').map((x) => Number(x.trim()))
  const alpha = phan[3] ?? 1
  const nen = [0x15, 0x66, 0x3a]
  const tron = [0, 1, 2].map((i) =>
    Math.round(phan[i] * alpha + nen[i] * (1 - alpha)),
  )
  return '#' + tron.map((x) => x.toString(16).padStart(2, '0')).join('')
}

/** Sắc màu theo vòng màu, `null` với màu xám. */
function sacMau(hex: string): number | null {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const lon = Math.max(r, g, b)
  const nho = Math.min(r, g, b)
  if (lon - nho < 0.02) return null
  const d = lon - nho
  let h: number
  if (lon === r) h = ((g - b) / d) % 6
  else if (lon === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return ((h * 60) % 360) / 60
}
