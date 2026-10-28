import { describe, expect, it } from 'vitest'
import {
  CAC_COT,
  CAC_DAI,
  CAC_VUNG,
  cacVungKe,
  keNhau,
  laDaiCao,
  laVungBien,
  laVungDutDiem,
  latVung,
  layVung,
  type DaiSan,
} from './vung'

describe('lưới vùng sân (quyết định D23)', () => {
  it('có đúng 12 vùng: 3 cột × 4 dải', () => {
    expect(CAC_VUNG).toHaveLength(12)
    expect(CAC_COT).toHaveLength(3)
    expect(CAC_DAI).toHaveLength(4)
  })

  it('không có id trùng', () => {
    expect(new Set(CAC_VUNG.map((v) => v.id)).size).toBe(12)
  })

  it('mỗi vùng biết cột và dải của mình, và tra ngược ra đúng nó', () => {
    for (const v of CAC_VUNG) {
      expect(CAC_COT).toContain(v.cot)
      expect(CAC_DAI).toContain(v.dai)
      expect(layVung(v.cot, v.dai)).toEqual(v)
    }
  })

  it('đủ mọi tổ hợp cột × dải, không thiếu ô nào', () => {
    for (const cot of CAC_COT) {
      for (const dai of CAC_DAI) {
        expect(() => layVung(cot, dai)).not.toThrow()
      }
    }
  })

  it('layVung ném lỗi với dải không hợp lệ', () => {
    expect(() => layVung('giua', 9 as DaiSan)).toThrow()
  })
})

describe('lật vùng theo hướng tấn công', () => {
  it('lật dải: 0 ↔ 3 và 1 ↔ 2', () => {
    expect(latVung(layVung('giua', 0)).dai).toBe(3)
    expect(latVung(layVung('giua', 1)).dai).toBe(2)
    expect(latVung(layVung('giua', 2)).dai).toBe(1)
    expect(latVung(layVung('giua', 3)).dai).toBe(0)
  })

  it('lật cột: trái ↔ phải, giữa giữ nguyên', () => {
    expect(latVung(layVung('trai', 0)).cot).toBe('phai')
    expect(latVung(layVung('phai', 0)).cot).toBe('trai')
    expect(latVung(layVung('giua', 0)).cot).toBe('giua')
  })

  it('lật hai lần ra lại đúng vùng ban đầu', () => {
    for (const v of CAC_VUNG) {
      expect(latVung(latVung(v)), v.id).toEqual(v)
    }
  })

  it('lật là song ánh — 12 vùng ra đúng 12 vùng khác nhau', () => {
    const sauKhiLat = CAC_VUNG.map((v) => latVung(v).id)
    expect(new Set(sauKhiLat).size).toBe(12)
  })
})

describe('vùng kề nhau — bóng không nhảy cóc', () => {
  it('một vùng không kề chính nó', () => {
    for (const v of CAC_VUNG) {
      expect(keNhau(v, v), v.id).toBe(false)
    }
  })

  it('kề nhau là quan hệ hai chiều', () => {
    for (const a of CAC_VUNG) {
      for (const b of CAC_VUNG) {
        expect(keNhau(a, b), `${a.id} / ${b.id}`).toBe(keNhau(b, a))
      }
    }
  })

  it('lệch từ hai dải trở lên thì không kề', () => {
    expect(keNhau(layVung('giua', 0), layVung('giua', 2))).toBe(false)
    expect(keNhau(layVung('giua', 0), layVung('giua', 3))).toBe(false)
  })

  it('biên trái không kề biên phải', () => {
    expect(keNhau(layVung('trai', 1), layVung('phai', 1))).toBe(false)
  })

  it('mọi vùng đều có vùng kề, và vùng giữa sân có nhiều lối đi nhất', () => {
    for (const v of CAC_VUNG) {
      expect(cacVungKe(v).length, v.id).toBeGreaterThan(0)
    }
    // Ô giữa ở dải trong có 8 hàng xóm; ô góc chỉ có 3.
    expect(cacVungKe(layVung('giua', 1))).toHaveLength(8)
    expect(cacVungKe(layVung('trai', 0))).toHaveLength(3)
  })
})

describe('phân loại vùng cho các AC đo được', () => {
  it('vùng dứt điểm là dải 3', () => {
    expect(laVungDutDiem(layVung('giua', 3))).toBe(true)
    expect(laVungDutDiem(layVung('giua', 2))).toBe(false)
  })

  it('dải cao là dải 2 trở lên — chỗ pressing cao cướp bóng (AC-8.4)', () => {
    expect(laDaiCao(layVung('trai', 2))).toBe(true)
    expect(laDaiCao(layVung('trai', 3))).toBe(true)
    expect(laDaiCao(layVung('trai', 1))).toBe(false)
  })

  it('vùng biên là hai cột ngoài — chỗ sinh ra tạt cánh (AC-8.3)', () => {
    expect(laVungBien(layVung('trai', 2))).toBe(true)
    expect(laVungBien(layVung('phai', 2))).toBe(true)
    expect(laVungBien(layVung('giua', 2))).toBe(false)
  })

  it('đúng 8 vùng biên và 4 vùng trung lộ', () => {
    expect(CAC_VUNG.filter(laVungBien)).toHaveLength(8)
    expect(CAC_VUNG.filter((v) => !laVungBien(v))).toHaveLength(4)
  })
})
