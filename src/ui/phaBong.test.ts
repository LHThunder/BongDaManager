import { describe, expect, it } from 'vitest'

import { MS_MOI_PHUT } from '../hooks/useMatch'
import { thoiGianChuyen } from './components/San2D'
import {
  dongThoiGianPhaBong,
  thoiLuongDoan,
  viTriBongTrongPha,
  type BuocDaQuyDoi,
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
