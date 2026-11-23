import { describe, expect, it } from 'vitest'
import type { Rng } from '../domain/types'
import {
  BANG_CHU_MA_TRAN,
  BUOC_HAT_GIONG,
  DO_DAI_MA_TRAN,
  hatGiongTuMaTran,
  laMaTranHopLe,
  nhayRut,
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

/*
  `nhayRut` — nhảy N lần rút trong O(1) (T702, quyết định D118).

  Ba dòng rút của engine liên tục cách nhau đúng `2^30` lần rút. Hằng số thật
  (`LECH_DONG`) sống ở `lienTuc/hatGiong.ts` của T717; ở đây nó là một số địa
  phương, vì file này chỉ canh CHÍNH phép nhảy.

  Oracle là `BigInt`, không phải một biểu thức giống hệt bản cài đặt: số học
  `BigInt` là chính xác tuyệt đối, nên nó bắt được đúng cái lỗi mà phép nhân
  float gây ra. Một phép kiểm viết lại cùng biểu thức với bản cài đặt thì xanh
  cả khi cả hai cùng sai.
*/
const LECH = 2 ** 30
const HAI_MU_32 = 2 ** 32

/** Trạng thái sau `soLan` lần rút, tính bằng số học chính xác. */
function oracle(hatGiong: number, soLan: number): number {
  const m = BigInt(HAI_MU_32)
  return Number(
    (((BigInt(hatGiong | 0) + BigInt(soLan) * BigInt(BUOC_HAT_GIONG)) % m) + m) %
      m,
  )
}

describe('nhayRut — nhảy N lần rút trong O(1) (T702, D118)', () => {
  it('bước cộng có tên đúng bằng con số thuật toán đang dùng', () => {
    expect(BUOC_HAT_GIONG).toBe(0x6d2b79f5)
  })

  it('nhảy N lần cho đúng hạt giống của N lần rút thật', () => {
    for (const ma of ['ABC', 'K7M2R9XQ4B', 'PH4M V1 D0']) {
      const goc = hatGiongTuMaTran(ma)
      const rng = taoRngTuHatGiong(goc)
      let daRut = 0
      for (const moc of [1, 5, 64, 1000, 5754]) {
        while (daRut < moc) {
          rng.next()
          daRut += 1
        }
        expect(nhayRut(goc, moc), `${ma} sau ${moc} lần`).toBe(rng.hatGiong())
      }
    }
  })

  it('nhảy 0 lần là không nhảy', () => {
    expect(nhayRut(HAT_GIONG_ABC, 0)).toBe(HAT_GIONG_ABC >>> 0)
  })

  it('khớp vector cố định đã có: 5 lần rút từ mã ABC', () => {
    expect(nhayRut(HAT_GIONG_ABC, 5)).toBe(HAT_GIONG_ABC_SAU_5)
  })

  /*
    Đây là phép kiểm có răng, và nó canh HAI cơ chế khác nhau:

    • `soLan` là luỹ thừa của 2 (2^30, 2·2^30, …): phép NHÂN vẫn chính xác,
      nhưng phép CỘNG hạt giống vào một số có `ulp = 256` thì mất phần thấp.
    • `soLan = 2^30 + 1`: tích có hơn 53 bit ý nghĩa, nên chính phép NHÂN sai.

    Mệnh đề "khác bản nhân thường" là tính chất của CẶP (hạt giống, soLan), không
    của riêng phép toán: với một hạt giống chia hết cho 2^22 thì hai bản trùng
    nhau. Nên nó được chạy trên NHIỀU hạt giống, và có một ca nói thẳng điều đó.
  */
  it('đúng cả ở soLan lớn, nơi nhân thường mất độ chính xác float', () => {
    for (const ma of ['ABC', 'K7M2R9XQ4B', 'PH4M V1 D0']) {
      const goc = hatGiongTuMaTran(ma)
      for (const soLan of [LECH, LECH + 1, 2 * LECH, 3 * LECH, 5754 * LECH]) {
        expect(nhayRut(goc, soLan), `${ma} / ${soLan}`).toBe(oracle(goc, soLan))

        // Và nó phải KHÁC bản nhân thường — nếu không thì phép kiểm vô nghĩa.
        const nhanThuong = (goc + soLan * BUOC_HAT_GIONG) >>> 0
        expect(nhayRut(goc, soLan), `${ma} / ${soLan}`).not.toBe(nhanThuong)
      }
    }
  })

  it('bản nhân thường TRÙNG bản đúng ở hạt giống chia hết cho 2^22', () => {
    /*
      Phản ví dụ cho chính phép kiểm trên: ở hạt giống như vậy, phần thấp bị
      làm tròn đi vốn đã là 0. Ghi ra để không ai đọc phép kiểm trên thành
      "nhân thường luôn sai".
    */
    const gocTron = 4 * 2 ** 22
    expect(nhayRut(gocTron, LECH)).toBe((gocTron + LECH * BUOC_HAT_GIONG) >>> 0)
  })

  it('cộng dồn được: nhảy a rồi nhảy b bằng nhảy a+b', () => {
    const goc = hatGiongTuMaTran('K7M2R9XQ4B')
    for (const [a, b] of [
      [1, 1],
      [64, 64],
      [LECH, LECH],
      [LECH, 5754 * LECH],
    ]) {
      expect(nhayRut(nhayRut(goc, a), b), `${a} + ${b}`).toBe(
        oracle(goc, a + b),
      )
    }
  })

  /*
    Đẳng thức mà ba dòng rút đứng trên: khoảng cách giữa dòng i và dòng j đúng
    bằng `(j − i) · LECH · BUOC_HAT_GIONG mod 2^32`.

    ⚠️ Hệ số `BUOC_HAT_GIONG` ở vế phải là BẮT BUỘC. Bản đầu của phép kiểm này
    bỏ nó và vẫn xanh — nhưng chỉ vì `BUOC_HAT_GIONG ≡ 1 (mod 4)` và
    `LECH = 2^30`, nên `LECH · BUOC_HAT_GIONG ≡ LECH (mod 2^32)`. Nếu `LECH_DONG`
    của T717 hoá ra không phải 2^30 hay 2^31 thì cách viết cũ SAI.

    Vế trái không phụ thuộc mã trận (hiệu hai hạt giống triệt tiêu `goc`), nên
    20.000 vòng ở đây KHÔNG mua thêm thông tin cho đẳng thức ấy. Chúng mua một
    thứ khác, và thứ ấy thì phụ thuộc mã trận thật: **ba dòng rút của cùng một
    mã không bao giờ trùng nhau**, trên 20.000 mã do `taoMaTran` sinh.
  */
  it('khoảng cách(i, j) = (j − i)·LECH·BUOC mod 2^32, và ba dòng không trùng', () => {
    const nguon = taoRngTuHatGiong(20_000)
    const mongDoi = (i: number, j: number) =>
      Number(
        ((BigInt(j - i) * BigInt(LECH) * BigInt(BUOC_HAT_GIONG)) %
          BigInt(HAI_MU_32) +
          BigInt(HAI_MU_32)) %
          BigInt(HAI_MU_32),
      )

    for (let n = 0; n < 20_000; n += 1) {
      const ma = taoMaTran(nguon)
      const goc = hatGiongTuMaTran(ma)
      const dong = [0, 1, 2].map((i) => nhayRut(goc, i * LECH))

      expect(new Set(dong).size, `${ma}: ba dòng phải khác nhau`).toBe(3)

      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          const khoangCach =
            ((dong[j]! - dong[i]!) % HAI_MU_32 + HAI_MU_32) % HAI_MU_32
          expect(khoangCach, `${ma}: dòng ${i} → ${j}`).toBe(mongDoi(i, j))
        }
      }
    }
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
