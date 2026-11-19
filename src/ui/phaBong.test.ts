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
  dongThoiGianPhaBong,
  nguoiGiuBong,
  nguoiNhanChuyen,
  thoiLuongDoan,
  viTriBongTrongPha,
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
