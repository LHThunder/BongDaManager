import { describe, expect, it } from 'vitest'
import type { Rng } from '../domain/types'
import {
  BANG_CHU_MA_TRAN,
  DO_DAI_MA_TRAN,
  hatGiongTuMaTran,
  laMaTranHopLe,
  taoMaTran,
  taoRng,
  taoRngTuHatGiong,
} from './rng'

const NGUON_SOURCE = import.meta.glob('./rng.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Nguồn ngẫu nhiên giả, trả dãy số cho trước — dùng để kiểm `taoMaTran`. */
function rngGia(cacGiaTri: readonly number[]): Rng {
  let i = 0
  return {
    next(): number {
      const v = cacGiaTri[i % cacGiaTri.length] ?? 0
      i += 1
      return v
    },
  }
}

/*
  Vector cố định. Những con số này được lấy bằng cách CHẠY thuật toán, không
  phải chép từ đâu. Nếu một ngày nào đó ai đó sửa `rng.ts` và dãy số đổi thì
  test này đỏ — và nó phải đỏ, vì đổi dãy số nghĩa là mọi mã trận người dùng
  đã lưu đều phát lại ra một trận khác.
*/
const HAT_GIONG_ABC = 1106514475
const NAM_SO_DAU_ABC = [
  0.664586271858, 0.467334944755, 0.123048155336, 0.70321072056,
  0.097571935505,
]
const HAT_GIONG_ABC_SAU_5 = 1674408948

describe('nguồn ngẫu nhiên tất định (P1, AC-8.11)', () => {
  it('cùng một mã trận luôn cho cùng dãy số', () => {
    const a = taoRng('K7M2R9XQ4B')
    const b = taoRng('K7M2R9XQ4B')
    for (let i = 0; i < 1000; i += 1) {
      expect(b.next()).toBe(a.next())
    }
  })

  it('hai mã trận khác nhau cho hai dãy khác nhau', () => {
    const a = taoRng('ABC')
    const b = taoRng('ABD')
    const dayA = Array.from({ length: 20 }, () => a.next())
    const dayB = Array.from({ length: 20 }, () => b.next())
    expect(dayB).not.toEqual(dayA)
  })

  it('khớp vector cố định — dãy số không được đổi theo thời gian', () => {
    expect(hatGiongTuMaTran('ABC')).toBe(HAT_GIONG_ABC)

    const rng = taoRng('ABC')
    const nam = Array.from({ length: 5 }, () => Number(rng.next().toFixed(12)))
    expect(nam).toEqual(NAM_SO_DAU_ABC)
  })

  it('mọi giá trị nằm trong [0, 1)', () => {
    const rng = taoRng('PH4M V1 D0')
    for (let i = 0; i < 5000; i += 1) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('dãy số trải đều, không dồn về một phía', () => {
    // Phép kiểm thô: 10 ô đều phải có phần, nếu không thì hàm sinh hỏng.
    const rng = taoRng('TRAI DEU')
    const o = new Array<number>(10).fill(0)
    for (let i = 0; i < 10000; i += 1) {
      o[Math.floor(rng.next() * 10)] += 1
    }
    for (const dem of o) {
      expect(dem).toBeGreaterThan(700)
    }
  })
})

/*
  Hạt giống lấy ra được là điều kiện để `buocTiep` của máy trạng thái trận là
  hàm THUẦN: trạng thái trận mang theo hạt giống, không phụ thuộc closure nào
  sống bên ngoài (ghi chú (1) ở plan III.4).
*/
describe('hạt giống cất ra và chạy tiếp được', () => {
  it('chạy tiếp từ hạt giống đã cất cho đúng dãy số tiếp theo', () => {
    const goc = taoRng('ABC')
    for (let i = 0; i < 5; i += 1) goc.next()

    const hatGiong = goc.hatGiong()
    expect(hatGiong).toBe(HAT_GIONG_ABC_SAU_5)

    const tiep = taoRngTuHatGiong(hatGiong)
    const mong = Array.from({ length: 10 }, () => goc.next())
    const thuc = Array.from({ length: 10 }, () => tiep.next())
    expect(thuc).toEqual(mong)
  })

  it('hai nguồn cùng hạt giống là hai dãy giống hệt', () => {
    const a = taoRngTuHatGiong(123456789)
    const b = taoRngTuHatGiong(123456789)
    expect(Array.from({ length: 50 }, () => b.next())).toEqual(
      Array.from({ length: 50 }, () => a.next()),
    )
  })

  it('hạt giống luôn là số nguyên không âm, cất xuống được', () => {
    const rng = taoRng('HAT GIONG')
    for (let i = 0; i < 100; i += 1) {
      rng.next()
      const h = rng.hatGiong()
      expect(Number.isInteger(h)).toBe(true)
      expect(h).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('mã trận (quyết định D20)', () => {
  it('bảng chữ có đúng 32 ký tự và không chứa I, L, O, U', () => {
    expect(BANG_CHU_MA_TRAN).toHaveLength(32)
    for (const c of 'ILOU') {
      expect(BANG_CHU_MA_TRAN).not.toContain(c)
    }
    expect(new Set(BANG_CHU_MA_TRAN).size).toBe(32)
  })

  it('mã trận dài đúng 10 ký tự, toàn ký tự trong bảng', () => {
    const ma = taoMaTran(taoRng('hat giong bat ky'))
    expect(ma).toHaveLength(DO_DAI_MA_TRAN)
    for (const c of ma) {
      expect(BANG_CHU_MA_TRAN).toContain(c)
    }
  })

  it('nguồn ngẫu nhiên ở hai đầu biên vẫn cho ký tự hợp lệ', () => {
    expect(laMaTranHopLe(taoMaTran(rngGia([0])))).toBe(true)
    // 0.999… suýt soát 1: không được tràn ra ngoài bảng chữ.
    expect(laMaTranHopLe(taoMaTran(rngGia([0.9999999999])))).toBe(true)
  })

  it('laMaTranHopLe từ chối mã sai độ dài hoặc có ký tự lạ', () => {
    expect(laMaTranHopLe('K7M2R9XQ4')).toBe(false)
    expect(laMaTranHopLe('K7M2R9XQ4BB')).toBe(false)
    expect(laMaTranHopLe('K7M2R9XQ4I')).toBe(false)
    expect(laMaTranHopLe('k7m2r9xq4b')).toBe(false)
  })

  it('hai nguồn khác nhau cho hai mã khác nhau', () => {
    const a = taoMaTran(taoRng('nguon a'))
    const b = taoMaTran(taoRng('nguon b'))
    expect(b).not.toBe(a)
  })
})

describe('không có nguồn ngẫu nhiên hay thời gian toàn cục (P1)', () => {
  it('rng.ts không gọi Math.random, Date.now hay crypto', () => {
    const source = Object.values(NGUON_SOURCE)[0]
    expect(source, 'không đọc được source của rng.ts').toBeTruthy()

    const chiCode = (source ?? '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    expect(chiCode).not.toContain('Math.random')
    expect(chiCode).not.toContain('Date.now')
    expect(chiCode).not.toContain('crypto')
  })
})
