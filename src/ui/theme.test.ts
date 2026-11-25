import { describe, expect, it } from 'vitest'
import cssGoc from '../index.css?raw'
import {
  TUONG_PHAN_TOI_THIEU,
  mauChuTuongPhan,
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

/*
  SA BÀN (T790, spec 011, AC-50.2).

  Sa bàn **không thêm một biến màu nào** — nó dùng lại đúng nhóm `co-*` mà sân
  2D đang dùng. Nhưng nó thêm hai VẬT mới lên mặt cỏ: quả bóng có viền, và dấu
  chiếu của quả bóng. Hai thứ ấy chưa từng được đo.

  Mặt cỏ giống nhau ở cả hai chế độ (sân vẫn xanh trong một căn phòng tối), nên
  nhóm này đo **một lần** — đúng lý do khối "chữ trên mặt cỏ" ngay trên đã nêu.
  Phép kiểm vẫn đọc thẳng `src/index.css`, không chép lại màu nào.

  Ngưỡng: quả bóng là **vật mang tin**, không phải trang trí, nên nó đi theo
  ngưỡng chữ **4,5:1**. Viền bóng và dấu chiếu là ranh giới hình, nên chúng đi
  theo ngưỡng **3:1** mà WCAG đặt cho thành phần phi văn bản.
*/
const TUONG_PHAN_HINH_TOI_THIEU = 3

describe('sa bàn: bóng và dấu chiếu đọc được trên mặt cỏ (AC-50.2)', () => {
  it('quả bóng nổi trên mặt cỏ ở mức chữ (4,5:1)', () => {
    expect(
      tiLeTuongPhan(tronLenCo(CO['co-chu']), tronLenCo(CO['co-nen-dam'])),
    ).toBeGreaterThanOrEqual(TUONG_PHAN_TOI_THIEU)
  })

  it('viền bóng tách khỏi chính quả bóng ở mức hình (3:1)', () => {
    expect(
      tiLeTuongPhan(tronLenCo(CO['co-net']), tronLenCo(CO['co-chu'])),
    ).toBeGreaterThanOrEqual(TUONG_PHAN_HINH_TOI_THIEU)
  })

  it('dấu chiếu của bóng thấy được trên mặt cỏ ở mức hình (3:1)', () => {
    /*
      `--co-vien` là chính biến mà `San3D.tsx` dùng cho dấu chiếu.

      Bản đầu dùng `rgba(0,0,0,0.35)` và đo ra **1,50:1**. Đổi sang vòng sáng
      KHÔNG phải để lách ngưỡng mà vì ngưỡng ấy **không dựng nổi** bằng một vệt
      tối: đen tuyền trên mặt cỏ này cũng chỉ **2,99:1**. Phép kiểm dưới đây
      ghi lại điều đó để không ai "sửa lại cho giống bóng đổ thật".
    */
    expect(
      tiLeTuongPhan(tronLenCo('rgba(0,0,0,1)'), tronLenCo(CO['co-nen'])),
      'trần của mọi vệt TỐI trên mặt cỏ',
    ).toBeLessThan(TUONG_PHAN_HINH_TOI_THIEU)

    expect(
      tiLeTuongPhan(tronLenCo(CO['co-vien']), tronLenCo(CO['co-nen-dam'])),
    ).toBeGreaterThanOrEqual(TUONG_PHAN_HINH_TOI_THIEU)
  })

  /*
    ✅ **MÓN NỢ NÀY ĐÃ TRẢ Ở T799.** Bản trước của khối này là một **bánh cóc**:
    nó khẳng định vạch sân mới đạt **2,72:1**, dưới ngưỡng hình 3:1, và nói rằng
    việc sửa thuộc Phase 65 vì sửa là đổi diện mạo `San2D`.

    Phase 65 đã tới và đã trả: alpha của vạch sân đi từ `0.45` lên `0.55`, cho
    **3,30:1**. Cả `San2D.tsx` lẫn `San3D.tsx` đổi **cùng một lúc** — để một
    mình sân 2D đổi là làm hai góc nhìn vẽ cùng một mặt sân bằng hai sắc khác
    nhau.

    Nên phép kiểm nay là một **ngưỡng thật**, không còn là bánh cóc.
  */
  it('vạch sân trên mặt cỏ đạt ngưỡng hình 3:1 (nợ T790 đã trả ở T799)', () => {
    expect(
      tiLeTuongPhan(tronLenCo('rgba(255,255,255,0.55)'), tronLenCo(CO['co-nen-dam'])),
    ).toBeGreaterThanOrEqual(TUONG_PHAN_HINH_TOI_THIEU)
  })

  it('và giá trị CŨ thì không đạt — để biết phép kiểm đo thật', () => {
    expect(
      tiLeTuongPhan(tronLenCo('rgba(255,255,255,0.45)'), tronLenCo(CO['co-nen-dam'])),
    ).toBeLessThan(TUONG_PHAN_HINH_TOI_THIEU)
  })
})

describe('sa bàn: số áo trên màu áo người dùng chọn (AC-50.2)', () => {
  /*
    `San3D` chọn màu chữ bằng `mauChuTuongPhan` — ĐÚNG hàm mà `San2D.tsx:920`
    đang dùng, nên nhóm này không đặt ra một rủi ro mới nào so với sân 2D. Nó
    đo lại để nói điều đó ra bằng số, trên chính bảng màu thử của khối AC-20.5.
  */
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

  /*
    ✅ **MÓN NỢ THỨ HAI CŨNG ĐÃ TRẢ Ở T799.** Trước đây cả hai lớp vẽ chọn màu
    chữ bằng `mauChuTuongPhan`, thứ chỉ chọn màu **tốt hơn** trong hai màu — và
    với `#0077DD` thì "tốt hơn" vẫn chỉ được **4,48:1**, thiếu 0,02.

    Nay cả `San2D.tsx` lẫn `San3D.tsx` đi qua `nenDamBaoTuongPhan`, hàm đã có
    sẵn trong repo từ spec 001 cho đúng bài toán này. Giá đo được: trên tám màu
    thử, **bảy màu không đổi một chút nào**, chỉ `#0077DD` dịch **5%**.
  */
  for (const mau of MAU_AO_THU) {
    it(`${mau}: số áo trên đĩa/ô cầu thủ đạt 4,5:1`, () => {
      const { nen, chu } = nenDamBaoTuongPhan(mau)
      expect(tiLeTuongPhan(nen, chu)).toBeGreaterThanOrEqual(TUONG_PHAN_TOI_THIEU)
    })
  }

  it('và cách CŨ thì không đạt với #0077DD — để biết phép kiểm đo thật', () => {
    expect(tiLeTuongPhan('#0077DD', mauChuTuongPhan('#0077DD'))).toBeLessThan(
      TUONG_PHAN_TOI_THIEU,
    )
  })

  it('bảy trên tám màu KHÔNG bị dịch — giá của việc trả nợ là nhỏ', () => {
    const biDich = MAU_AO_THU.filter((m) => nenDamBaoTuongPhan(m).daDieuChinh)
    expect(biDich).toEqual(['#0077DD'])
  })
})

/*
  ====================================================================
  TRẦN BÃO HOÀ HAI TẦNG (T795, spec 011, AC-48.2 + AC-48.3).
  ====================================================================

  `sacMau` ở cuối file này đo **sắc màu (hue)**, không phải bão hoà — nên nhóm
  này cần hàm riêng. Quy tắc được phát biểu ở
  `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md` mục 2, và chúng là **tương
  đối theo vùng**, không phải một con số tuyệt đối.

  ⚠️ **Vì sao không dùng trần tuyệt đối của khuôn mẫu** (thế giới ≤65%, tín
  hiệu ≥75%): áp nguyên vào repo này thì thứ vượt trần nặng nhất là **chính
  mặt cỏ** (`--co-nen-dam`, S = 88). Hạ mặt cỏ để chiều một con số mượn từ một
  trò chơi Unity có bảng màu khác hẳn là làm hỏng thứ đang đúng. Phép kiểm
  cuối nhóm này **ghi lại** điều đó bằng số thay vì giấu đi.
*/

/** Độ bão hoà HSL, thang 0–100. Nhận cả `#rrggbb` lẫn `rgba(...)`. */
function doBaoHoa(giaTri: string): number {
  const [r, g, b] = raRgb(giaTri)
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === min) return 0
  const l = (max + min) / 2
  const d = max - min
  return Math.round((l > 0.5 ? d / (2 - max - min) : d / (max + min)) * 100)
}

/** Độ sáng HSL, thang 0–100. */
function doSang(giaTri: string): number {
  const [r, g, b] = raRgb(giaTri)
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  return Math.round(((max + min) / 2) * 100)
}

function raRgb(giaTri: string): readonly [number, number, number] {
  const m = /rgba?\(([^)]+)\)/.exec(giaTri)
  if (m) {
    const p = m[1].split(',').map((x) => Number(x.trim()))
    return [p[0]!, p[1]!, p[2]!]
  }
  const n = parseInt(giaTri.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Biến chỉ xuất hiện KHI CÓ CHUYỆN — tầng tín hiệu (he-thong-thiet-ke.md mục 1.3). */
const TIN_HIEU: readonly string[] = [
  'canh-bao-nen',
  'canh-bao-chu',
  'canh-bao-manh',
  'canh-bao-manh-dam',
  'loi-nen',
  'loi-chu',
  'loi-manh',
  'loi-manh-dam',
  'tot-nen',
  'tot-chu',
  /*
    ⚠️ `--sai-nhe/vua/nang` KHÔNG có trong danh sách này, và đó là phạm vi chứ
    không phải quên: chúng chỉ xuất hiện ở `OViTri.tsx`, tức **màn hình chiến
    thuật**, mà spec 011 chỉ phủ **màn hình xem trận** (quyết định 10). Chúng
    cũng nằm ở nhóm `CO` chứ không nhóm `SANG`, vì `LA_CO` gom cả tiền tố
    `sai-`. Số đo của chúng được ghi ở khối cuối file này.
  */
]

/** Biến chỉ để lấp bề mặt — tầng trang trí, không mang tin. */
const TRANG_TRI_GIAO_DIEN: readonly string[] = [
  'nen',
  'nen-the',
  'nen-nhan',
  'vien',
  'vien-dam',
  'chinh-nhat',
  'lop-phu',
]

/** Trang trí trên mặt cỏ. */
const TRANG_TRI_CO: readonly string[] = ['co-o', 'co-net-mo', 'co-vien-mo']

/** Tín hiệu trên mặt cỏ. */
const TIN_HIEU_CO: readonly string[] = [
  'co-vang',
  'co-noi-bat',
  'co-nhan-chu',
  'co-canh-bao-nen',
]

describe('TT-1: trang trí KHÔNG được rực hơn tín hiệu (AC-48.3)', () => {
  /*
    Đây là mệnh đề mà `spec.md` mục 1 nêu ra: *"không có trần bão hoà, nên một
    mảng trang trí có thể rực hơn một con số quan trọng — và mắt người đi theo
    thứ rực nhất."*

    Phát biểu theo VÙNG, vì hai vùng có hai bảng khác nhau: giao diện đổi theo
    chủ đề, mặt cỏ thì không.
  */
  it('vùng giao diện: trang trí rực nhất ≤ tín hiệu nhạt nhất', () => {
    const tranTrangTri = Math.max(...TRANG_TRI_GIAO_DIEN.map((k) => doBaoHoa(SANG[k]!)))
    const sanTinHieu = Math.min(...TIN_HIEU.map((k) => doBaoHoa(SANG[k]!)))
    expect(tranTrangTri).toBeLessThanOrEqual(sanTinHieu)
  })

  it('vùng mặt cỏ: trang trí rực nhất ≤ tín hiệu nhạt nhất', () => {
    const tranTrangTri = Math.max(...TRANG_TRI_CO.map((k) => doBaoHoa(CO[k]!)))
    const sanTinHieu = Math.min(...TIN_HIEU_CO.map((k) => doBaoHoa(CO[k]!)))
    expect(tranTrangTri).toBeLessThanOrEqual(sanTinHieu)
  })

  it('và nó đúng ở CẢ chủ đề tối, không chỉ chủ đề sáng', () => {
    const coTrongToi = (k: string) => TOI[k] ?? SANG[k]!
    const tranTrangTri = Math.max(
      ...TRANG_TRI_GIAO_DIEN.map((k) => doBaoHoa(coTrongToi(k))),
    )
    const sanTinHieu = Math.min(...TIN_HIEU.map((k) => doBaoHoa(coTrongToi(k))))
    expect(tranTrangTri).toBeLessThanOrEqual(sanTinHieu)
  })

  it('chống rỗng: hai nhóm phải thật sự đọc được giá trị', () => {
    for (const k of [...TRANG_TRI_GIAO_DIEN, ...TIN_HIEU]) {
      expect(SANG[k], `--${k} không có trong :root`).toBeDefined()
    }
    for (const k of [...TRANG_TRI_CO, ...TIN_HIEU_CO]) {
      expect(CO[k], `--${k} không có trong nhóm cỏ`).toBeDefined()
    }
  })
})

describe('TT-3: hai màu cùng mang tin cách nhau ≥ 15 điểm độ sáng (AC-48.3)', () => {
  /*
    Phần phương pháp lấy NGUYÊN từ khuôn mẫu, vì nó không phụ thuộc bảng màu:
    hai màu đứng cạnh nhau mà cùng mang tin thì phải khác nhau về **độ sáng**,
    không chỉ về sắc. Mù màu xoá sắc; nó không xoá độ sáng.
  */
  /*
    Chỉ những cặp THẬT SỰ đặt cạnh nhau, cùng ở trên một cầu thủ. `--co-vang`
    (thẻ phạt) và `--co-noi-bat` (vòng nhấn người đang xem) có thể xuất hiện
    trên cùng một người cùng lúc.
  */
  const CAP_CUNG_MANG_TIN: readonly (readonly [string, string])[] = [
    ['co-vang', 'co-noi-bat'],
  ]

  for (const [a, b] of CAP_CUNG_MANG_TIN) {
    it(`--${a} vs --${b}`, () => {
      const lech = Math.abs(doSang(CO[a]!) - doSang(CO[b]!))
      expect(lech, 'điểm độ sáng cách nhau').toBeGreaterThanOrEqual(15)
    })
  }

  /*
    ⚠️ HAI CẶP KHÔNG ĐẠT TT-3, và chúng dựa vào **cue hình** thay vì độ sáng.
    Ghi ra bằng số thay vì im lặng — và ghi ở đây, cạnh phép kiểm, chứ không
    chỉ trong tài liệu, để ai đổi màu sẽ đọc được.

    1. `--co-chu` (quả bóng) vs `--co-vien` (vạch sân): **0 điểm** — cả hai đều
       là trắng. Cue bắt buộc là **hình**: bóng có viền `--co-net` và nhỏ hơn
       đĩa cầu thủ; dấu chiếu là vòng **rỗng ruột**. Đây là dòng 6 của bảng cặp
       màu dễ lẫn.
    2. `--co-nhan-chu` vs `--co-vang`: **13 điểm**, thiếu 2. Hai thứ này **không
       bao giờ chạm nhau** trên màn hình — nhãn nằm trên hộp `--co-nhan-nen`,
       thẻ phạt là một hình riêng — nên TT-3 không áp cho chúng. Con số vẫn
       được chốt để nếu chúng có ngày đứng cạnh nhau thì có sẵn chỗ bắt đầu.
  */
  it('hai cặp dựa vào cue HÌNH: số đo được chốt lại', () => {
    expect(Math.abs(doSang(CO['co-chu']!) - doSang(CO['co-vien']!))).toBe(0)
    expect(Math.abs(doSang(CO['co-nhan-chu']!) - doSang(CO['co-vang']!))).toBe(13)
  })
})

describe('PHÁT HIỆN ngoài phạm vi: ba màu mức lệch không tách nhau bằng độ sáng', () => {
  /*
    Đo ngày 2026-11-25 trong lúc làm T795. Ba màu mức lệch vị trí cách nhau
    **4** và **10** điểm độ sáng — dưới hẳn ngưỡng 15 của TT-3. Dưới mù màu
    đỏ-lục chúng về ba sắc xám gần nhau, và độ sáng là thứ duy nhất còn lại để
    phân biệt.

    **KHÔNG sửa ở đây, và không phải vì ngại:** ba màu ấy chỉ dùng ở
    `OViTri.tsx` — **màn hình chiến thuật** — còn spec 011 phủ **màn hình xem
    trận** (quyết định 10 của `spec.md` mục 10). Đổi chúng là đi ra ngoài phạm
    vi đã chốt.

    **P9 không bị vỡ ngay hôm nay**, vì cue phụ bắt buộc đã có và là **chữ**:
    `MUC_SAI_VI_TRI` cho bốn nhãn *Đúng vị trí / Lệch nhẹ / Lệch vừa / Sai
    nặng*, và `TrangChienThuat.tsx:298` dựng câu tóm tắt từ chúng. Bảng cặp màu
    dễ lẫn ở `he-thong-thiet-ke.md` mục 4 dòng 1 ghi đúng điều đó.

    Phép kiểm dưới đây là **bánh cóc**: nó chốt con số hiện tại, sẽ đỏ nếu ai
    thu hẹp khoảng cách thêm, và không giả vờ rằng ngưỡng đã đạt.
  */
  it('cách nhau 4 và 10 điểm độ sáng — dưới ngưỡng 15 của TT-3', () => {
    const nhe = doSang(CO['sai-nhe']!)
    const vua = doSang(CO['sai-vua']!)
    const nang = doSang(CO['sai-nang']!)
    expect(Math.abs(nhe - vua), 'nhẹ vs vừa').toBe(4)
    expect(Math.abs(vua - nang), 'vừa vs nặng').toBe(10)
    expect(Math.abs(nhe - vua)).toBeLessThan(15)
    expect(Math.abs(vua - nang)).toBeLessThan(15)
  })
})

describe('TT-2: trần TUYỆT ĐỐI của khuôn mẫu KHÔNG áp được ở repo này', () => {
  /*
    Phép kiểm này không canh một yêu cầu — nó **ghi lại một sự thật đã đo** để
    nó không bị quên rồi có người "sửa cho đúng khuôn mẫu".
  */
  it('mặt cỏ vượt hẳn trần 65% của tầng thế giới, và đó là chủ ý', () => {
    expect(doBaoHoa(CO['co-nen-dam']!)).toBeGreaterThan(65)
    expect(doBaoHoa(CO['co-nen-dam']!)).toBe(88)
  })

  it('và hai biến tín hiệu lại THIẾU sàn 75% của khuôn mẫu', () => {
    expect(doBaoHoa(SANG['loi-chu']!)).toBeLessThan(75)
    expect(doBaoHoa(SANG['tot-chu']!)).toBeLessThan(75)
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
