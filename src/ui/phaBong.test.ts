import { describe, expect, it } from 'vitest'

import { soDoTheoQuanSo } from '../domain/formations'
import {
  benMauQuanSo,
  cauHinhMau,
  MA_TRAN_CO_DINH,
} from '../engine/__fixtures__/doiMau'
import type { LoaiSuKien } from '../engine/suKien'
import { CAC_QUAN_SO, chayHetTran, dongSuKien, taoTran } from '../engine/tran'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { thoiGianChuyen } from './components/San2D'
import {
  cuaSoGiuBong,
  dongThoiGianPhaBong,
  ganNguoiGiuBong,
  nguoiGiuBong,
  nguoiGiuBongLucNay,
  nguoiNhanChuyen,
  thoiLuongDoan,
  viTriBongTrongPha,
  viTriNguoiGiuBong,
  type BuocDaQuyDoi,
  type NguoiTrenSan,
} from './phaBong'

/*
  Dòng thời gian của một pha bóng (spec 006, T601).

  Phép kiểm quan trọng nhất của file này là phép kiểm về **tổng thời lượng**:
  một pha có tới `SO_BUOC_TOI_DA` = 12 bước, mà mọi đoạn phải xong trong MỘT
  nhịp — nếu không thì bóng còn bay dở khi tình huống kế tiếp tới, đúng cú giật
  mà AC-29.3 của spec 005 cấm.
*/

const NHIP = 1000
const NGUOI = 900
const NHANH_GAP = 3

function buoc(x: number, y: number, loai: BuocDaQuyDoi['loai']): BuocDaQuyDoi {
  return { diem: { x, y }, loai }
}

describe('dòng thời gian là hàm thuần, không nguồn ngẫu nhiên (P1)', () => {
  it('không gọi Math.random hay Date.now', () => {
    const randomCu = Math.random
    const nowCu = Date.now
    Math.random = () => {
      throw new Error('lớp pha bóng KHÔNG được gọi Math.random (P1)')
    }
    Date.now = () => {
      throw new Error('lớp pha bóng KHÔNG được gọi Date.now (P1)')
    }
    try {
      expect(() =>
        dongThoiGianPhaBong({
          batDau: { x: 0, y: 0 },
          cacBuoc: [buoc(10, 0, 'chuyen'), buoc(40, 0, 'sut')],
          msNhip: NHIP,
          msNguoi: NGUOI,
          nhanhGap: NHANH_GAP,
        }),
      ).not.toThrow()
    } finally {
      Math.random = randomCu
      Date.now = nowCu
    }
  })

  it('cùng một đầu vào cho cùng một dòng thời gian', () => {
    const dauVao = {
      batDau: { x: 5, y: 5 },
      cacBuoc: [buoc(20, 10, 're-bong'), buoc(60, 30, 'chuyen'), buoc(90, 30, 'sut')],
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP,
    }
    expect(dongThoiGianPhaBong(dauVao)).toEqual(dongThoiGianPhaBong(dauVao))
  })
})

describe('hình dạng của dòng thời gian', () => {
  const cac = dongThoiGianPhaBong({
    batDau: { x: 0, y: 0 },
    cacBuoc: [buoc(0, 0, 'chuyen'), buoc(30, 0, 're-bong'), buoc(60, 0, 'sut')],
    msNhip: NHIP,
    msNguoi: NGUOI,
    nhanhGap: NHANH_GAP,
  })

  it('các đoạn nối liền nhau, không hở và không chồng', () => {
    expect(cac.length).toBeGreaterThan(1)
    for (let i = 1; i < cac.length; i += 1) {
      expect(cac[i]?.tu).toEqual(cac[i - 1]?.den)
      expect(cac[i]?.tiLeBatDau).toBeCloseTo(cac[i - 1]?.tiLeKetThuc ?? -1, 10)
    }
  })

  it('bắt đầu ở tỉ lệ 0 và kết thúc ở tỉ lệ 1', () => {
    expect(cac[0]?.tiLeBatDau).toBe(0)
    expect(cac[cac.length - 1]?.tiLeKetThuc).toBe(1)
  })

  it('loại của mỗi đoạn là loại của bước mà nó RỜI ĐI', () => {
    // Bước 0 là `chuyen` nên đoạn đầu phải là một đường chuyền, không phải rê.
    expect(cac[0]?.loai).toBe('chuyen')
    expect(cac[1]?.loai).toBe('re-bong')
  })
})

describe('tổng thời lượng không bao giờ vượt một nhịp', () => {
  it('pha mười hai bước vẫn xong trong một nhịp', () => {
    const cacBuoc = Array.from({ length: 12 }, (_, i) =>
      buoc(i * 8, 0, i % 2 === 0 ? 're-bong' : 'chuyen'),
    )
    const cac = dongThoiGianPhaBong({
      batDau: { x: 0, y: 0 },
      cacBuoc,
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP,
    })
    expect(cac[cac.length - 1]?.tiLeKetThuc).toBeLessThanOrEqual(1)
    for (const d of cac) {
      expect(d.tiLeBatDau).toBeGreaterThanOrEqual(0)
      expect(d.tiLeKetThuc).toBeLessThanOrEqual(1)
      expect(d.tiLeKetThuc).toBeGreaterThanOrEqual(d.tiLeBatDau)
    }
  })

  it('pha ngắn thì KHÔNG bị kéo dãn cho đầy nhịp — trừ đoạn cuối', () => {
    /*
      Một pha hai bước toàn đường chuyền chỉ tốn 2/3 nhịp. Đoạn cuối được kéo
      tới hết nhịp để quả bóng không "biến mất" khỏi dòng thời gian, nhưng
      những đoạn trước giữ đúng thời lượng của chúng.
    */
    const cac = dongThoiGianPhaBong({
      batDau: { x: 0, y: 0 },
      cacBuoc: [buoc(0, 0, 'chuyen'), buoc(30, 0, 'chuyen'), buoc(60, 0, 'sut')],
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP,
    })
    // Chuyền tốn `msNguoi / 3` = 300ms trên nhịp 1000ms.
    expect(cac[0]?.tiLeKetThuc).toBeCloseTo(0.3, 6)
  })
})

describe('không có pha bóng thì trả đúng MỘT đoạn giữ (D110)', () => {
  it('danh sách bước rỗng — dòng thay người, kiệt sức, hoặc bản ghi trận cũ', () => {
    const cac = dongThoiGianPhaBong({
      batDau: { x: 7, y: 9 },
      cacBuoc: [],
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP,
    })
    expect(cac).toHaveLength(1)
    expect(cac[0]?.loai).toBe('giu')
    expect(cac[0]?.tu).toEqual({ x: 7, y: 9 })
    expect(cac[0]?.den).toEqual({ x: 7, y: 9 })
    expect(cac[0]?.tiLeBatDau).toBe(0)
    expect(cac[0]?.tiLeKetThuc).toBe(1)
  })

  it('nhịp không hợp lệ cũng trả một đoạn giữ, không ném', () => {
    for (const msNhip of [0, -5, Number.NaN]) {
      const cac = dongThoiGianPhaBong({
        batDau: { x: 1, y: 2 },
        cacBuoc: [buoc(50, 50, 'chuyen')],
        msNhip,
        msNguoi: NGUOI,
        nhanhGap: NHANH_GAP,
      })
      expect(cac, `nhịp ${msNhip}`).toHaveLength(1)
      expect(cac[0]?.loai).toBe('giu')
    }
  })
})

describe('chỗ quả bóng tại một tỉ lệ của nhịp', () => {
  const cac = dongThoiGianPhaBong({
    batDau: { x: 0, y: 0 },
    cacBuoc: [buoc(0, 0, 'chuyen'), buoc(30, 0, 'chuyen'), buoc(60, 0, 'sut')],
    msNhip: NHIP,
    msNguoi: NGUOI,
    nhanhGap: NHANH_GAP,
  })

  it('tỉ lệ 0 và 1 trả đúng hai đầu của pha', () => {
    expect(viTriBongTrongPha(cac, 0)).toEqual({ x: 0, y: 0 })
    expect(viTriBongTrongPha(cac, 1)).toEqual({ x: 60, y: 0 })
  })

  it('đi qua TỪNG bước, không cắt góc', () => {
    // Hết đoạn đầu — một đường chuyền tốn `msNguoi / 3` = 300ms trên nhịp
    // 1000ms — bóng phải ở ĐÚNG bước giữa, không cắt góc sang bước cuối.
    expect(viTriBongTrongPha(cac, 0.3).x).toBeCloseTo(30, 6)
    expect(viTriBongTrongPha(cac, 0.15).x).toBeCloseTo(15, 6)
  })

  it('đầu vào vô lý không làm nó ném hay trả NaN', () => {
    for (const t of [-1, 9, Number.NaN]) {
      const p = viTriBongTrongPha(cac, t)
      expect(Number.isFinite(p.x) && Number.isFinite(p.y), `t=${t}`).toBe(true)
    }
    expect(viTriBongTrongPha([], 0.5)).toEqual({ x: 0, y: 0 })
  })
})

// ---------------------------------------------------------------------------
// T603 — Ai đang giữ bóng, và ai nhận một đường chuyền
// ---------------------------------------------------------------------------

/** Mọi loại dòng sự kiện, để không phép kiểm nào bỏ sót một loại. */
const MOI_LOAI: readonly LoaiSuKien[] = [
  'bat-dau',
  'ban-thang',
  'co-hoi',
  'cuu-thua',
  'tat-canh',
  'cuop-bong-cao',
  'thoat-xuong',
  'mat-bong',
  'pham-loi',
  'the-vang',
  'the-do',
  'thay-nguoi',
  'kiet-suc',
  'het-hiep',
  'ket-thuc',
  'huy-tran',
]

describe('ai đang giữ bóng, theo đúng bảng 3.1 (AC-33.5, D103)', () => {
  const CU = 'nguoi-cu'
  const dong = (loai: LoaiSuKien, cacCauThu: readonly string[]) => ({
    loai,
    cacCauThu,
  })

  it('bốn loại lấy người đầu danh sách', () => {
    for (const loai of [
      'co-hoi',
      'thoat-xuong',
      'tat-canh',
      'pham-loi',
    ] as const) {
      expect(nguoiGiuBong(dong(loai, ['A', 'B']), CU), loai).toBe('A')
    }
  })

  it('cứu thủa lấy THỦ MÔN, tức phần tử thứ hai, không phải người sút', () => {
    expect(nguoiGiuBong(dong('cuu-thua', ['nguoi-sut', 'thu-mon']), CU)).toBe(
      'thu-mon',
    )
  })

  it('mất bóng và cướp bóng cao lấy NGƯỜI CƯỚP ĐƯỢC, không phải người để mất', () => {
    for (const loai of ['mat-bong', 'cuop-bong-cao'] as const) {
      expect(
        nguoiGiuBong(dong(loai, ['nguoi-de-mat', 'nguoi-cuop']), CU),
        loai,
      ).toBe('nguoi-cuop')
    }
  })

  it('thẻ, thay người và kiệt sức GIỮ NGUYÊN người cũ — không phải pha bóng', () => {
    for (const loai of [
      'the-vang',
      'the-do',
      'thay-nguoi',
      'kiet-suc',
    ] as const) {
      /*
        Danh sách của những dòng này CÓ nêu một người — người nhận thẻ,
        người được thay. Lấy anh ta làm người giữ bóng là cho quả bóng
        nhảy sang chân một người đang bị phạt, đúng cú giật của R50.
      */
      expect(nguoiGiuBong(dong(loai, ['nguoi-nhan-the']), CU), loai).toBe(CU)
    }
  })

  it('bàn thắng và mọi dòng mốc trả KHÔNG AI', () => {
    for (const loai of [
      'ban-thang',
      'bat-dau',
      'het-hiep',
      'ket-thuc',
      'huy-tran',
    ] as const) {
      expect(nguoiGiuBong(dong(loai, ['A', 'B']), CU), loai).toBeNull()
    }
  })

  it('phủ đủ MƯỜI SÁU loại, không loại nào trả undefined', () => {
    /*
      Bảng 3.1 của plan chỉ liệt mười bốn loại: nó bỏ `ket-thuc` và `huy-tran`.
      Hàm phải **toàn phần** với cả mười sáu, vì một `undefined` lọt ra khỏi đây
      sẽ thành một quả bóng không biết ở chân ai.
    */
    for (const loai of MOI_LOAI) {
      const ra = nguoiGiuBong({ loai, cacCauThu: ['A', 'B'] }, CU)
      expect(ra === null || typeof ra === 'string', loai).toBe(true)
    }
    expect(new Set(MOI_LOAI).size).toBe(16)
  })

  it('danh sách rỗng thì lùi về người cũ chứ không thả bóng', () => {
    for (const loai of ['co-hoi', 'mat-bong', 'cuu-thua'] as const) {
      expect(nguoiGiuBong(dong(loai, []), CU), loai).toBe(CU)
    }
  })

  it('người giữ bóng đã RỜI SÂN thì bỏ qua, lấy người kế tiếp (D115)', () => {
    /*
      Đo ở lát 48: **2,82% số dòng** có người giữ bóng không còn điểm nào trên
      sân — thẻ đỏ, hay bị thay ra. Những phút ấy không vẽ vòng nào và quả bóng
      đứng im: đo được một quãng **2002ms trên 127 mẫu** ở lát 49b.
    */
    const ngoaiSan = (ai: string) => (id: string) => id !== ai

    // Bước lùi một: sang người kế tiếp trong chính dòng ấy.
    expect(
      nguoiGiuBong(dong('co-hoi', ['A', 'B']), CU, ngoaiSan('A')),
    ).toBe('B')
    // Cứu thúa lấy thủ môn trước; thủ môn rời sân thì lùi về người sút.
    expect(
      nguoiGiuBong(
        dong('cuu-thua', ['nguoi-sut', 'thu-mon']),
        CU,
        ngoaiSan('thu-mon'),
      ),
    ).toBe('nguoi-sut')
    // Bước lùi hai: cả dòng không ai còn trên sân thì về người giữ bóng cũ.
    expect(
      nguoiGiuBong(dong('co-hoi', ['A', 'B']), CU, (id) => id === CU),
    ).toBe(CU)
    // Bước lùi ba: không còn ai — thà không ai cầm còn hơn chỉ vào một người vắng.
    expect(nguoiGiuBong(dong('co-hoi', ['A', 'B']), CU, () => false)).toBeNull()
  })

  it('dòng thẻ / thay người vẫn GIỮ NGUYÊN, kể cả khi người cũ là "không ai"', () => {
    /*
      Đây là lưới R50, và T604 bắt đúng chỗ này khi bản đầu của D115 cho lùi
      sang người nhận thẻ: **33 dòng** của 10 mã trận đổi người giữ bóng sang
      chính cầu thủ đang bị phạt.
    */
    expect(nguoiGiuBong(dong('the-do', ['nguoi-nhan-the']), null)).toBeNull()
    // Người cũ rời sân thì mới lùi sang người dòng ấy nêu.
    expect(
      nguoiGiuBong(dong('thay-nguoi', ['vao', 'ra']), CU, (id) => id !== CU),
    ).toBe('vao')
  })

  it('không có dòng nào — trước giờ bóng lăn — thì giữ nguyên', () => {
    expect(nguoiGiuBong(null, CU)).toBe(CU)
    expect(nguoiGiuBong(null, null)).toBeNull()
  })
})

describe('ai nhận một đường chuyền (AC-35.2, D112)', () => {
  const san: readonly NguoiTrenSan[] = [
    { playerId: 'ta-1', diem: { x: 10, y: 10 }, laDongDoi: true },
    { playerId: 'ta-2', diem: { x: 50, y: 30 }, laDongDoi: true },
    { playerId: 'ta-3', diem: { x: 52, y: 30 }, laDongDoi: true },
    { playerId: 'ho-1', diem: { x: 51, y: 30 }, laDongDoi: false },
  ]

  it('lấy đồng đội gần vùng đích nhất, không lấy đối thủ dù đứng gần hơn', () => {
    expect(nguoiNhanChuyen({ x: 51, y: 30 }, san, 'ta-1')).toBe('ta-2')
  })

  it('không bao giờ trả chính người vừa chuyền', () => {
    expect(nguoiNhanChuyen({ x: 50, y: 30 }, san, 'ta-2')).toBe('ta-3')
  })

  it('người nhận LUÔN thuộc đội đang cầm bóng', () => {
    const dongDoi = new Set(
      san.filter((n) => n.laDongDoi).map((n) => n.playerId),
    )
    for (let x = 0; x <= 100; x += 5) {
      for (let y = 0; y <= 60; y += 5) {
        const ai = nguoiNhanChuyen({ x, y }, san, 'ta-1')
        expect(ai, `(${x},${y})`).not.toBeNull()
        expect(dongDoi.has(ai as string), `(${x},${y})`).toBe(true)
      }
    }
  })

  it('tất định: đảo thứ tự mảng không đổi người nhận', () => {
    /*
      Hai đồng đội đứng **cách đích đúng bằng nhau**: nếu luật lấy "người
      gặp trước" thì đảo mảng là đổi người, và một pha bóng xem lại hai lần
      ra hai đường chuyền khác nhau — đúng điều P1 cấm.
    */
    const hoa: readonly NguoiTrenSan[] = [
      { playerId: 'z-sau', diem: { x: 40, y: 20 }, laDongDoi: true },
      { playerId: 'a-truoc', diem: { x: 60, y: 20 }, laDongDoi: true },
    ]
    const dich = { x: 50, y: 20 }
    expect(nguoiNhanChuyen(dich, hoa, null)).toBe('a-truoc')
    expect(nguoiNhanChuyen(dich, [...hoa].reverse(), null)).toBe('a-truoc')
  })

  it('không có đồng đội nào thì trả null, không ném', () => {
    expect(nguoiNhanChuyen({ x: 0, y: 0 }, [], null)).toBeNull()
    expect(
      nguoiNhanChuyen({ x: 0, y: 0 }, [san[3] as NguoiTrenSan], null),
    ).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// T604 — Xương sống: quyền giữ bóng KHÔNG nhảy giữa hai nhịp (R50)
// ---------------------------------------------------------------------------

describe('quyền giữ bóng không nhảy giữa hai nhịp (AC-33.5, R50)', () => {
  /*
    **Một phép kiểm "hàm trả đúng giá trị" và một phép kiểm "chuỗi giá trị qua
    cả trận không giật" là hai điều khác nhau**, và cái thứ hai mới là thứ người
    xem thấy. Ba phép kiểm trên đo cái thứ nhất trên dòng dựng bằng tay; chỗ
    này áp luật lên **dòng tường thuật thật của mười mã trận**, theo đúng thứ
    tự, rồi đếm.
  */
  const QUAN_SO = CAC_QUAN_SO.filter((n) => soDoTheoQuanSo(n).length > 0)

  /** Loại dòng **không phải pha bóng**: phải giữ nguyên người cũ. */
  const KHONG_PHAI_PHA_BONG: readonly LoaiSuKien[] = [
    'the-vang',
    'the-do',
    'thay-nguoi',
    'kiet-suc',
  ]

  it('không một lần nào quyền giữ bóng đổi sang người mà dòng ấy không nêu', () => {
    let soDong = 0
    let soDoi = 0
    let nhayVoCo = 0
    let doiODongKhongPhaiPhaBong = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO) {
        const tt = chayHetTran(
          taoTran(
            cauHinhMau(ma, {
              quanSo: n,
              nha: benMauQuanSo('A', n),
              khach: benMauQuanSo('B', n),
            }),
          ),
        )
        let giu: string | null = null
        for (const sk of dongSuKien(tt)) {
          const truoc: string | null = giu
          giu = nguoiGiuBong(sk, truoc)
          soDong += 1
          if (giu === truoc) continue
          soDoi += 1
          /*
            Một lần đổi chỉ hợp lệ khi người mới **có trong danh sách của
            chính dòng ấy**, hoặc khi dòng ấy thả bóng (bàn thắng, hết hiệp).
          */
          if (!(giu === null || sk.cacCauThu.includes(giu))) nhayVoCo += 1
          if (KHONG_PHAI_PHA_BONG.includes(sk.loai)) {
            doiODongKhongPhaiPhaBong += 1
          }
        }
      }
    }

    expect(soDong, 'số dòng đã duyệt').toBeGreaterThan(3000)
    expect(soDoi, 'số lần quyền giữ bóng đổi').toBeGreaterThan(1000)
    expect(nhayVoCo, 'quyền giữ bóng nhảy sang người dòng không nêu').toBe(0)
    expect(
      doiODongKhongPhaiPhaBong,
      'dòng thẻ / thay người / kiệt sức làm đổi người giữ bóng',
    ).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// T606 — Người giữ bóng đi theo đường của bóng, rồi về mốc của mình
// ---------------------------------------------------------------------------

/** Một pha ba bước: rê → chuyền → sút, với bốn đồng đội đứng dọc đường. */
function phaBaBuoc() {
  const cacDoan = dongThoiGianPhaBong({
    batDau: { x: 0, y: 20 },
    cacBuoc: [
      buoc(0, 20, 're-bong'),
      buoc(30, 20, 'chuyen'),
      buoc(60, 20, 'chuyen'),
      buoc(90, 20, null),
    ],
    msNhip: NHIP,
    msNguoi: NGUOI,
    nhanhGap: NHANH_GAP,
  })
  const cacNguoi: readonly NguoiTrenSan[] = [
    { playerId: 'ta-A', diem: { x: 2, y: 22 }, laDongDoi: true },
    { playerId: 'ta-B', diem: { x: 31, y: 24 }, laDongDoi: true },
    { playerId: 'ta-C', diem: { x: 62, y: 18 }, laDongDoi: true },
    { playerId: 'ho-X', diem: { x: 30, y: 20 }, laDongDoi: false },
  ]
  return { cacDoan, cacNguoi }
}

describe('quyền giữ bóng đi theo từng bước của pha (AC-35.2, D112)', () => {
  const { cacDoan, cacNguoi } = phaBaBuoc()
  const gan = ganNguoiGiuBong({
    cacDoan,
    nguoiBatDau: 'ta-A',
    nguoiKetThuc: 'ta-C',
    cacNguoi,
  })

  it('đoạn rê KHÔNG đổi người — anh ta dẫn bóng đi', () => {
    expect(gan[0]?.loai).toBe('re-bong')
    expect(gan[0]?.nguoiGiu).toBe('ta-A')
    expect(gan[0]?.nguoiNhan).toBe('ta-A')
  })

  it('đoạn chuyền đổi sang đồng đội gần đích nhất, không sang đối thủ', () => {
    expect(gan[1]?.loai).toBe('chuyen')
    expect(gan[1]?.nguoiGiu).toBe('ta-A')
    // Đích của đoạn này là (60,20); `ta-C` ở (62,18) là đồng đội gần nhất.
    expect(gan[1]?.nguoiNhan).toBe('ta-C')
  })

  it('đoạn cuối trả người giữ bóng của BẢNG 3.1, không áp luật suy', () => {
    const cuoi = gan[gan.length - 1]
    expect(cuoi?.nguoiNhan).toBe('ta-C')
    const gan2 = ganNguoiGiuBong({
      cacDoan,
      nguoiBatDau: 'ta-A',
      // Người cướp được bóng — đối thủ, và luật suy không bao giờ chọn được.
      nguoiKetThuc: 'ho-X',
      cacNguoi,
    })
    expect(gan2[gan2.length - 1]?.nguoiNhan).toBe('ho-X')
  })

  it('không ai cầm bóng đầu nhịp thì suy ra người mở pha, không bỏ trống', () => {
    /*
      Sau mỗi bàn thắng, sau mỗi hiệp và ở dòng đầu trận, bảng 3.1 trả **không
      ai**. Bỏ trống thì pha kế tiếp không có người dẫn bóng nào cả.
    */
    const ganRong = ganNguoiGiuBong({
      cacDoan,
      nguoiBatDau: null,
      nguoiKetThuc: 'ta-C',
      cacNguoi,
    })
    expect(ganRong[0]?.nguoiGiu).not.toBeNull()
    expect(ganRong[0]?.nguoiGiu).toBe('ta-A')
  })

  it('nhịp không có pha bóng nào không kết thúc bằng "không ai" (D115)', () => {
    /*
      Dòng giao bóng đầu trận: bảng 3.1 trả **không ai**, và dòng thời gian chỉ
      có đúng một đoạn `giu` đứng tại chỗ. Để nguyên thì quả bóng nằm yên cả
      nhịp — đo được **1024ms trên 63 mẫu** ở lát 49b.
    */
    const motDoan = dongThoiGianPhaBong({
      batDau: { x: 50, y: 32 },
      cacBuoc: [],
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP,
    })
    const ganMoc = ganNguoiGiuBong({
      cacDoan: motDoan,
      nguoiBatDau: 'ta-A',
      nguoiKetThuc: null,
      cacNguoi,
    })
    expect(ganMoc).toHaveLength(1)
    expect(ganMoc[0]?.loai).toBe('giu')
    expect(ganMoc[0]?.nguoiNhan).toBe('ta-A')
    expect(nguoiGiuBongLucNay(ganMoc, 1)).toBe('ta-A')
  })

  it('dòng bàn thắng VẪN kết thúc bằng "không ai" — nó có cả một pha bóng', () => {
    const ganBan = ganNguoiGiuBong({
      cacDoan,
      nguoiBatDau: 'ta-A',
      nguoiKetThuc: null,
      cacNguoi,
    })
    expect(ganBan[ganBan.length - 1]?.nguoiNhan).toBeNull()
  })

  it('hai đầu của hai đoạn liền nhau khớp nhau, không hụt một người nào', () => {
    for (let i = 1; i < gan.length; i += 1) {
      expect(gan[i]?.nguoiGiu, `đoạn ${i}`).toBe(gan[i - 1]?.nguoiNhan)
    }
  })

  it('quyền giữ bóng chuyển ĐÚNG LÚC đoạn chuyền xong — không sớm hơn', () => {
    /*
      Đo bằng chính dòng thời gian, không đo bằng mắt: ngay trước mốc kết thúc
      của đoạn chuyền thì bóng vẫn của người chuyền; đúng tại mốc ấy mới sang
      người nhận.
    */
    const moc = gan[1]?.tiLeKetThuc as number
    expect(nguoiGiuBongLucNay(gan, moc - 1e-9)).toBe('ta-A')
    expect(nguoiGiuBongLucNay(gan, moc)).toBe('ta-C')
  })
})

describe('cửa sổ cầm bóng của một người', () => {
  const { cacDoan, cacNguoi } = phaBaBuoc()
  const gan = ganNguoiGiuBong({
    cacDoan,
    nguoiBatDau: 'ta-A',
    nguoiKetThuc: 'ta-C',
    cacNguoi,
  })

  it('cửa sổ dừng ở lÚC BÓNG RỜI CHÂN, không kéo qua đoạn chuyền (D104)', () => {
    /*
      **Đây là chỗ bản đầu của T606 làm sai.** Người chuyền vẫn là `nguoiGiu`
      của đoạn chuyền — anh ta là người **rời** bóng ở đó — nên cửa sổ kéo luôn
      qua đoạn ấy, và anh ta bị dính vào quả bóng mà **bay theo đường chuyền ở
      tốc độ của bóng**, nhanh gấp ba tốc độ người, rồi giật ngược về mốc.

      D104 nói rõ: chỉ ở đoạn `re-bong` thì người và bóng mới chung một đường;
      ở các đoạn khác **bóng tự bay còn người đi chặng của mình**.
    */
    const cs = cuaSoGiuBong(gan, 'ta-A')
    expect(gan[0]?.loai).toBe('re-bong')
    expect(gan[1]?.loai).toBe('chuyen')
    expect(cs?.tiLeBatDau).toBe(0)
    expect(cs?.tiLeKetThuc).toBe(gan[0]?.tiLeKetThuc)
  })

  it('nhận bóng rồi chuyền ngay thì cửa sổ rỗng, không bay theo đường chuyền', () => {
    /*
      `ta-C` nhận bóng ở cuối đoạn 1 rồi chính anh ta chuyền tiếp ở đoạn 2.
      Cửa sổ rỗng nghĩa là anh ta vẫn chạy tới điểm nhận bóng rồi về mốc — chỉ
      là không dính vào quả bóng.
    */
    const cs = cuaSoGiuBong(gan, 'ta-C')
    expect(gan[2]?.nguoiGiu).toBe('ta-C')
    expect(gan[2]?.loai).toBe('chuyen')
    expect(cs?.tiLeBatDau).toBe(gan[2]?.tiLeBatDau)
    expect(cs?.tiLeKetThuc).toBe(gan[2]?.tiLeBatDau)
  })

  it('người chỉ nhận bóng ở đoạn cuối có cửa sổ đúng lúc nhịp hết', () => {
    const chiNhanCuoi = ganNguoiGiuBong({
      cacDoan,
      nguoiBatDau: 'ta-A',
      nguoiKetThuc: 'ho-X',
      cacNguoi,
    })
    expect(cuaSoGiuBong(chiNhanCuoi, 'ho-X')).toEqual({
      tiLeBatDau: 1,
      tiLeKetThuc: 1,
    })
  })

  it('người không dính gì tới pha thì không có cửa sổ nào', () => {
    expect(cuaSoGiuBong(gan, 'ta-B')).toBeNull()
    expect(cuaSoGiuBong(gan, null)).toBeNull()
    expect(cuaSoGiuBong([], 'ta-A')).toBeNull()
  })
})

describe('chỗ của người đang có bóng (AC-33.2, AC-34.1, D104, D105)', () => {
  const { cacDoan, cacNguoi } = phaBaBuoc()
  const gan = ganNguoiGiuBong({
    cacDoan,
    nguoiBatDau: 'ta-A',
    nguoiKetThuc: 'ta-C',
    cacNguoi,
  })
  const bong = (t: number) => viTriBongTrongPha(gan, t)
  const MOC = { x: 12, y: 40 }
  const THUONG = { x: 5, y: 35 }

  it('trong cửa sổ, người và bóng dùng CHUNG MỘT ĐƯỜNG (D104)', () => {
    const cs = cuaSoGiuBong(gan, 'ta-A')
    expect(cs).not.toBeNull()
    const { tiLeBatDau: tA, tiLeKetThuc: tB } = cs as {
      tiLeBatDau: number
      tiLeKetThuc: number
    }
    for (let k = 0; k <= 10; k += 1) {
      const t = tA + ((tB - tA) * k) / 10
      const nguoi = viTriNguoiGiuBong({
        cuaSo: cs as { tiLeBatDau: number; tiLeKetThuc: number },
        tiLe: t,
        viTriBong: bong,
        viTriThuong: THUONG,
        moc: MOC,
      })
      expect(nguoi, `t=${t}`).toEqual(bong(t))
    }
  })

  it('sau khi rời bóng là MỘT ĐƯỜNG THẬNG về mốc (D105)', () => {
    const cs = cuaSoGiuBong(gan, 'ta-A') as {
      tiLeBatDau: number
      tiLeKetThuc: number
    }
    const tB = cs.tiLeKetThuc
    const roi = bong(tB)
    const giua = viTriNguoiGiuBong({
      cuaSo: cs,
      tiLe: tB + (1 - tB) / 2,
      viTriBong: bong,
      viTriThuong: THUONG,
      moc: MOC,
    })
    expect(giua.x).toBeCloseTo((roi.x + MOC.x) / 2, 10)
    expect(giua.y).toBeCloseTo((roi.y + MOC.y) / 2, 10)
  })

  it('TẠI TỈ LỆ 1 NÓ TRẢ ĐÚNG MỐC — với mọi cửa sổ (R47)', () => {
    /*
      Bất biến này đang giữ AC-28.3 của spec 005 và AC-25.2 của spec 004. Nó
      phải đúng **bằng cấu trúc**, kể cả với một cửa sổ kéo tới hết nhịp — tức
      một người dẫn bóng tới tận khi nhịp kết thúc.
    */
    for (const cs of [
      { tiLeBatDau: 0, tiLeKetThuc: 0.4 },
      { tiLeBatDau: 0.4, tiLeKetThuc: 1 },
      { tiLeBatDau: 1, tiLeKetThuc: 1 },
      { tiLeBatDau: 0, tiLeKetThuc: 1 },
    ]) {
      for (const t of [1, 1.5, 9]) {
        expect(
          viTriNguoiGiuBong({
            cuaSo: cs,
            tiLe: t,
            viTriBong: bong,
            viTriThuong: THUONG,
            moc: MOC,
          }),
          `cửa sổ ${cs.tiLeBatDau}–${cs.tiLeKetThuc}, t=${t}`,
        ).toEqual(MOC)
      }
    }
  })

  it('trước cửa sổ: liền ở hai đầu, và nhắm tới ĐIỂM NHẬN chứ không tới bóng', () => {
    const cs = { tiLeBatDau: 0.5, tiLeKetThuc: 0.8 }
    const dau = viTriNguoiGiuBong({
      cuaSo: cs,
      tiLe: 0,
      viTriBong: bong,
      viTriThuong: THUONG,
      moc: MOC,
    })
    expect(dau).toEqual(THUONG)
    const toiNoi = viTriNguoiGiuBong({
      cuaSo: cs,
      tiLe: 0.5,
      viTriBong: bong,
      viTriThuong: THUONG,
      moc: MOC,
    })
    expect(toiNoi).toEqual(bong(0.5))
  })

  it('đầu vào vô lý không làm nó ném hay trả NaN', () => {
    for (const t of [-5, Number.NaN]) {
      const v = viTriNguoiGiuBong({
        cuaSo: { tiLeBatDau: 0.2, tiLeKetThuc: 0.6 },
        tiLe: t,
        viTriBong: bong,
        viTriThuong: THUONG,
        moc: MOC,
      })
      expect(Number.isFinite(v.x) && Number.isFinite(v.y), `t=${t}`).toBe(true)
    }
  })
})

describe('chuyền và sút nhanh hơn rê bóng đúng ba lần (AC-35.1, AC-35.4, T602)', () => {
  /*
    **Hiến pháp P5 bắt buộc phép kiểm này tồn tại.** AC-35.1 và AC-35.4 là AC dạng
    so sánh ("nhanh hơn ba lần"), mà P5 không cho đánh dấu xong một AC như vậy bằng
    một con số đo trên bản build. Số đo trên build là bằng chứng thứ hai.

    Phép kiểm duyệt `MS_MOI_PHUT` nên nó **tự phủ mức tốc độ thứ năm** khi T614
    thêm mức Rất chậm — không phải sửa một dòng nào ở đây.
  */
  const NHANH_GAP_CHUAN = 3

  it('ở MỌI mức tốc độ, cùng quãng đường thì chuyền nhanh hơn rê bóng ≥ 3 lần', () => {
    let soMucDaDo = 0
    for (const [muc, ms] of Object.entries(MS_MOI_PHUT)) {
      const msNguoi = thoiGianChuyen(ms)
      if (msNguoi === 0) continue // mức thôi nội suy: không có thời lượng để so
      soMucDaDo += 1
      const re = thoiLuongDoan('re-bong', ms, msNguoi, NHANH_GAP_CHUAN)
      for (const loai of ['chuyen', 'tat-canh', 'sut'] as const) {
        const bay = thoiLuongDoan(loai, ms, msNguoi, NHANH_GAP_CHUAN)
        expect(bay, `mức ${muc}, loại ${loai}`).toBeGreaterThan(0)
        expect(re / bay, `mức ${muc}, loại ${loai}`).toBeGreaterThanOrEqual(3)
      }
    }
    expect(soMucDaDo, 'số mức còn nội suy đã đo').toBeGreaterThanOrEqual(3)
  })

  it('đo trên cả một dòng thời gian thật, không chỉ trên một hàm', () => {
    /*
      Hai pha **cùng hình dạng**, chỉ khác loại bước. Nếu lớp dòng thời gian đâu
      đó làm phẳng sự khác biệt ấy thì phép kiểm trên vẫn xanh mà người xem vẫn
      thấy hai pha giống hệt nhau — đúng kiểu lỗi spec 005 mắc sáu lần.
    */
    /*
      So HAI ĐOẠN TRONG CÙNG MỘT dòng thời gian, cùng quãng đường 30 đơn vị.
      So hai dòng thời gian khác nhau thì sai: pha dài hơn một nhịp bị co đều,
      nên tỉ lệ giữa hai dòng không nói lên điều gì. Đoạn cuối cũng bị loại khi
      so, vì nó được kéo tới hết nhịp.
    */
    const cac = dongThoiGianPhaBong({
      batDau: { x: 0, y: 0 },
      cacBuoc: [
        buoc(0, 0, 're-bong'),
        buoc(30, 0, 'chuyen'),
        buoc(60, 0, 'chuyen'),
        buoc(90, 0, null),
      ],
      msNhip: NHIP,
      msNguoi: NGUOI,
      nhanhGap: NHANH_GAP_CHUAN,
    })
    const dai = (i: number) =>
      (cac[i]?.tiLeKetThuc ?? 0) - (cac[i]?.tiLeBatDau ?? 0)
    expect(cac[0]?.loai).toBe('re-bong')
    expect(cac[1]?.loai).toBe('chuyen')
    expect(dai(0) / dai(1)).toBeCloseTo(3, 6)
  })
})
