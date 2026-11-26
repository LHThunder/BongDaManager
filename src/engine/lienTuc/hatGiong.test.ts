import { describe, expect, it } from 'vitest'
import {
  BUOC_HAT_GIONG,
  hatGiongTuMaTran,
  taoMaTran,
  taoRngTuHatGiong,
} from '../rng'
import {
  type DongRut,
  hatGiongDong,
  hatGiongMoc,
  LECH_DONG,
  RUT_MOI_MOC,
} from './hatGiong'

/*
  Ba dòng rút (T717, D118, AC-37.5 + AC-45.7).

  Phép kiểm quan trọng nhất ở đây là cái thứ hai: **dòng 0 PHẢI đúng bằng dòng
  của v6**. Nếu nó lệch một lần rút thì mọi mã trận đã lưu phát lại ra một trận
  khác, và `MOC_V6` sẽ đỏ — nhưng `MOC_V6` chỉ chạy trên 10 mã fixture, nên
  phép kiểm ở đây chạy trên 20.000 mã để bắt được chỗ fixture không với tới.
*/

const HAI_MU_32 = 2 ** 32
const M = BigInt(HAI_MU_32)

/** Khoảng cách giữa hai hạt giống, tính bằng số lần rút, số học chính xác. */
function khoangCachRut(tu: number, den: number): bigint {
  const d = ((BigInt(den) - BigInt(tu)) % M + M) % M
  // Nhân với nghịch đảo của BUOC_HAT_GIONG mod 2^32 (Newton, 6 vòng là đủ).
  let nghichDao = 1n
  const b = BigInt(BUOC_HAT_GIONG)
  for (let i = 0; i < 6; i += 1) nghichDao = (nghichDao * (2n - b * nghichDao)) % M
  return (d * ((nghichDao % M) + M)) % M
}

/** 20.000 mã do `taoMaTran` sinh — tất định, không phải mẫu fixture. */
function hai_muoi_nghin_ma(): readonly string[] {
  const nguon = taoRngTuHatGiong(717)
  return Array.from({ length: 20_000 }, () => taoMaTran(nguon))
}

describe('bốn ký hiệu của D118', () => {
  it('LECH_DONG là 2^30 và RUT_MOI_MOC là 64', () => {
    expect(LECH_DONG).toBe(2 ** 30)
    expect(RUT_MOI_MOC).toBe(64)
  })

  it('ba dòng chia vòng 2^32 thành ba cung rời nhau', () => {
    // 3 · 2^30 < 2^32, nên ba cung không quấn qua nhau.
    expect(3 * LECH_DONG).toBeLessThan(HAI_MU_32)
  })

  it('một trận 90 phút không tiêu hết dải của dòng cơ học', () => {
    // 95,9 phút × 60 giây × 2 mốc/giây × 64 lần rút ≈ 736.512 ≪ 2^30.
    const mocMotTran = 96 * 60 * 2
    expect(mocMotTran * RUT_MOI_MOC).toBeLessThan(LECH_DONG)
  })
})

describe('dòng 0 LÀ dòng của v6 — không dịch một lần rút nào', () => {
  it('hatGiongDong(ma, 0) === hatGiongTuMaTran(ma) trên 20.000 mã', () => {
    for (const ma of hai_muoi_nghin_ma()) {
      expect(hatGiongDong(ma, 0), ma).toBe(hatGiongTuMaTran(ma))
    }
  })

  it('và dãy số của dòng 0 giống hệt dãy của v6', () => {
    for (const ma of ['ABC', 'K7M2R9XQ4B', '5M3AAY65ZN']) {
      const v6 = taoRngTuHatGiong(hatGiongTuMaTran(ma))
      const dong0 = taoRngTuHatGiong(hatGiongDong(ma, 0))
      const a = Array.from({ length: 50 }, () => v6.next())
      const b = Array.from({ length: 50 }, () => dong0.next())
      expect(b, ma).toEqual(a)
    }
  })
})

describe('khoảng cách giữa các dòng đúng bằng LECH_DONG', () => {
  it('dòng i tới dòng j cách đúng (j − i)·LECH_DONG lần rút, trên 20.000 mã', () => {
    const cacDong: readonly DongRut[] = [0, 1, 2]
    for (const ma of hai_muoi_nghin_ma()) {
      const hat = cacDong.map((d) => hatGiongDong(ma, d))

      // Ba dòng của cùng một mã không bao giờ trùng nhau.
      expect(new Set(hat).size, `${ma}: ba dòng phải khác nhau`).toBe(3)

      for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j < 3; j += 1) {
          const mong = ((BigInt(j - i) * BigInt(LECH_DONG)) % M + M) % M
          expect(khoangCachRut(hat[i]!, hat[j]!), `${ma}: ${i} → ${j}`).toBe(mong)
        }
      }
    }
  })
})

describe('hatGiongMoc — mỗi mốc một dải rút riêng', () => {
  it('mốc 0 là đầu dòng cơ học', () => {
    for (const ma of ['ABC', 'K7M2R9XQ4B']) {
      expect(hatGiongMoc(ma, 0), ma).toBe(hatGiongDong(ma, 2))
    }
  })

  it('hai mốc liền nhau cách đúng RUT_MOI_MOC lần rút', () => {
    const ma = 'K7M2R9XQ4B'
    for (const k of [0, 1, 2, 59, 60, 5753, 11_507]) {
      expect(
        khoangCachRut(hatGiongMoc(ma, k), hatGiongMoc(ma, k + 1)),
        `mốc ${k} → ${k + 1}`,
      ).toBe(BigInt(RUT_MOI_MOC))
    }
  })

  it('mọi mốc của một trận 90 phút có hạt giống khác nhau', () => {
    const ma = 'PH4M V1 D0'
    const soMoc = 96 * 60 * 2
    const thay = new Set<number>()
    for (let k = 0; k < soMoc; k += 1) thay.add(hatGiongMoc(ma, k))
    expect(thay.size).toBe(soMoc)
  })

  it('mốc nào cũng tính được một mình, không cần chạy các mốc trước', () => {
    // Nhảy trực tiếp tới mốc 9.000 phải bằng nhảy từng mốc một tới đó.
    const ma = 'ABC'
    let tay = hatGiongDong(ma, 2)
    for (let k = 0; k < 9_000; k += 1) {
      const rng = taoRngTuHatGiong(tay)
      for (let r = 0; r < RUT_MOI_MOC; r += 1) rng.next()
      tay = rng.hatGiong()
    }
    expect(hatGiongMoc(ma, 9_000)).toBe(tay)
  })
})

/*
  Phản ví dụ của phương án BỊ LOẠI (D118, lý do loại (a)).

  Phép kiểm này không canh code hôm nay — nó canh một quyết định. Nếu một ngày
  ai đó thấy `nhayRut` là rườm rà và "dọn dẹp" về `hatGiongTuMaTran(ma + hậu
  tố)`, phép kiểm này nói thẳng cái giá bằng một con số.
*/
describe('vì sao KHÔNG dùng hậu tố chuỗi', () => {
  it('mã 5M3AAY65ZN chỉ lệch 569 lần rút nếu dùng hậu tố', () => {
    const ma = '5M3AAY65ZN'
    const theoHauTo = hatGiongTuMaTran(`${ma}-LIEN-TUC`)
    expect(khoangCachRut(hatGiongTuMaTran(ma), theoHauTo)).toBe(569n)
  })

  it('và mười số đầu của nó là đúng mười số thứ 569–578 của v6', () => {
    const ma = '5M3AAY65ZN'
    const v6 = taoRngTuHatGiong(hatGiongTuMaTran(ma))
    for (let i = 0; i < 569; i += 1) v6.next()
    const cua_v6 = Array.from({ length: 10 }, () => v6.next())

    const hauTo = taoRngTuHatGiong(hatGiongTuMaTran(`${ma}-LIEN-TUC`))
    const cua_hauTo = Array.from({ length: 10 }, () => hauTo.next())

    expect(cua_hauTo).toEqual(cua_v6)
  })

  it('còn ba dòng cách đều thì không mã nào lệch dưới 2^30', () => {
    for (const ma of ['5M3AAY65ZN', 'ABC', 'K7M2R9XQ4B']) {
      for (const dong of [1, 2] as const) {
        expect(
          khoangCachRut(hatGiongTuMaTran(ma), hatGiongDong(ma, dong)),
          `${ma} dòng ${dong}`,
        ).toBeGreaterThanOrEqual(BigInt(LECH_DONG))
      }
    }
  })
})
