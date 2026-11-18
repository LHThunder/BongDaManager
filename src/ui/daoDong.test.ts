import { describe, expect, it } from 'vitest'

import {
  bienDoTuKhoangGian,
  lechDaoDong,
  phaCuaNguoi,
  PHAN_KHOANG_GIAN,
  type BienDoDaoDong,
} from './daoDong'

/*
  Dao động lúc đứng chờ (US-28, T507).

  Phép kiểm quan trọng nhất của file này là phép kiểm về BIÊN: dao động làm
  sân sống, nhưng nó cũng là thứ duy nhất trong spec 005 có thể đẩy hai điểm
  trùng lên nhau (AC-30.5, và AC-15.2 của spec 002 đã đóng) hay làm một hàng
  bốn hết ra hàng (AC-30.3). `/analyze` đã bắt đúng chỗ ấy khi biên độ còn là
  một nửa khoảng giãn, nên hai phép kiểm cuối file này là lưới của con số mới.
*/

const KHOANG_GIAN = 4
const BIEN_DO: BienDoDaoDong = bienDoTuKhoangGian(KHOANG_GIAN)

/** Một lượt thời gian dày, trải nhiều chu kỳ, để "mọi thời điểm" có nghĩa. */
const CAC_THOI_DIEM: readonly number[] = Array.from(
  { length: 400 },
  (_, i) => i * 0.0137,
)

describe('dao động là hàm thuần, không nguồn ngẫu nhiên (P1)', () => {
  it('cùng người, cùng thời điểm thì cùng một lệch', () => {
    for (const t of [0, 0.37, 12.5, 88.125]) {
      const a = lechDaoDong('cau-thu-1', t, BIEN_DO)
      const b = lechDaoDong('cau-thu-1', t, BIEN_DO)
      expect(a, `t=${t}`).toEqual(b)
    }
  })

  it('không gọi Math.random hay Date.now', () => {
    const randomCu = Math.random
    const nowCu = Date.now
    Math.random = () => {
      throw new Error('dao động KHÔNG được gọi Math.random (P1)')
    }
    Date.now = () => {
      throw new Error('dao động KHÔNG được gọi Date.now (P1)')
    }
    try {
      expect(() => lechDaoDong('x', 5, BIEN_DO)).not.toThrow()
      expect(() => phaCuaNguoi('x')).not.toThrow()
    } finally {
      Math.random = randomCu
      Date.now = nowCu
    }
  })

  it('pha băm từ playerId: khác người thì khác pha, cùng người thì cố định', () => {
    const cac = ['a', 'b', 'cau-thu-7', 'cau-thu-8', 'A37-1', 'A37-2']
    const pha = cac.map(phaCuaNguoi)
    expect(new Set(pha).size, 'sáu id phải cho sáu pha').toBe(6)
    for (const id of cac) expect(phaCuaNguoi(id)).toBe(phaCuaNguoi(id))
    for (const p of pha) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThan(Math.PI * 2)
    }
  })
})

describe('lệch luôn nằm trong biên, với mọi đầu vào', () => {
  it('không bao giờ vượt biên ở bất kỳ thời điểm nào', () => {
    for (const id of ['a', 'b', 'cau-thu-11']) {
      for (const t of CAC_THOI_DIEM) {
        const l = lechDaoDong(id, t, BIEN_DO)
        expect(Math.abs(l.x), `${id} t=${t}`).toBeLessThanOrEqual(BIEN_DO.doc)
        expect(Math.abs(l.y), `${id} t=${t}`).toBeLessThanOrEqual(BIEN_DO.ngang)
      }
    }
  })

  it('đầu vào vô lý không làm nó ném hay trả NaN', () => {
    for (const t of [Number.NaN, Number.POSITIVE_INFINITY, -1e9, -0.5]) {
      const l = lechDaoDong('a', t, BIEN_DO)
      expect(Number.isFinite(l.x), `t=${t}`).toBe(true)
      expect(Number.isFinite(l.y), `t=${t}`).toBe(true)
      expect(Math.abs(l.x)).toBeLessThanOrEqual(BIEN_DO.doc)
    }
    const amBien = lechDaoDong('a', 3, { doc: -5, ngang: -5 })
    // `toEqual` phân biệt -0 với +0, mà dấu của số không ở đây không có nghĩa.
    expect(amBien.x).toBeCloseTo(0)
    expect(amBien.y).toBeCloseTo(0)
    expect(bienDoTuKhoangGian(-9)).toEqual({ doc: 0, ngang: 0 })
  })
})

describe('sân không đứng im, và không thở đồng loạt', () => {
  /*
    AC-28.1 nói "không điểm nào đứng nguyên quá 300ms". Ở mức Chậm — 1000ms
    một phút trận — 300ms thật là 0,3 phút trận, nên phép kiểm đo bằng phút.
  */
  it('trong mọi cửa sổ 0,3 phút trận, lệch đều đổi', () => {
    const CUA_SO = 0.3
    for (const id of ['a', 'cau-thu-3', 'cau-thu-9']) {
      for (let i = 0; i < 120; i += 1) {
        const t = i * 0.11
        const a = lechDaoDong(id, t, BIEN_DO)
        const b = lechDaoDong(id, t + CUA_SO, BIEN_DO)
        const doi = Math.hypot(b.x - a.x, b.y - a.y)
        expect(doi, `${id} t=${t}`).toBeGreaterThan(BIEN_DO.doc / 100)
      }
    }
  })

  it('cả sân KHÔNG thở đồng loạt: pha trải ra cả dải (AC-28.4)', () => {
    /*
      Đo trên MỘT TẬP người, không trên một cặp. Bản đầu của phép kiểm này
      chọn đúng hai id rồi đòi chúng lệch nhau — sai thiết kế, vì hai cầu thủ
      hoàn toàn có thể tình cờ gần pha nhau mà cả sân vẫn không đồng loạt.
      Thứ phải đúng là **tập pha trải ra**, và đó cũng là thứ bắt được lỗi
      thật: bản băm đầu tiên dồn mọi pha vào khoảng 5,6–5,8.
    */
    const doi = Array.from({ length: 22 }, (_, i) => `cau-thu-${i + 1}`)
    const pha = doi.map(phaCuaNguoi).sort((a, b) => a - b)

    const trai = (pha[pha.length - 1] as number) - (pha[0] as number)
    expect(trai, 'pha phải trải rộng, không dồn một cục').toBeGreaterThan(
      Math.PI,
    )

    // Và không được dồn cục ở bất kỳ đâu: mỗi nửa dải phải có người.
    const nuaDau = pha.filter((p) => p < Math.PI).length
    expect(nuaDau).toBeGreaterThan(3)
    expect(doi.length - nuaDau).toBeGreaterThan(3)
  })
})

describe('biên giữ được hai AC mà /analyze đã bắt', () => {
  it('hai người cùng một vùng không bao giờ trùng lên nhau (AC-30.5, AC-15.2 spec 002)', () => {
    /*
      Hai người cùng vùng được `hinhSan` giãn ra đúng một khoảng giãn trên
      trục ngang. Dao động ngược chiều tối đa thì khoảng cách còn lại phải
      vẫn là ba phần tư — tức mỗi người chỉ được lấn một phần tám.
    */
    for (const t of CAC_THOI_DIEM) {
      const a = lechDaoDong('cau-thu-6', t, BIEN_DO)
      const b = lechDaoDong('cau-thu-7', t, BIEN_DO)
      const conLai = KHOANG_GIAN + (b.y - a.y)
      expect(conLai, `t=${t}`).toBeGreaterThanOrEqual(KHOANG_GIAN * 0.75)
    }
    expect(PHAN_KHOANG_GIAN * 2).toBeLessThanOrEqual(0.25)
  })

  it('một hàng ngang vẫn ra hàng ngang (AC-30.3)', () => {
    const hang = ['hv-1', 'hv-2', 'hv-3', 'hv-4']
    for (const t of CAC_THOI_DIEM) {
      const cacX = hang.map((id) => lechDaoDong(id, t, BIEN_DO).x)
      const lech = Math.max(...cacX) - Math.min(...cacX)
      expect(lech, `t=${t}`).toBeLessThanOrEqual(KHOANG_GIAN * 0.25)
    }
  })
})
