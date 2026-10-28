import { describe, expect, it } from 'vitest'
import {
  daKietSuc,
  heSoTheoChiSo,
  NGUONG_KIET_SUC,
  THE_LUC_DAY,
  theLucSauMotPhut,
  tieuHaoMotPhut,
  type MucPressing,
} from './theLuc'

const CAC_MUC: MucPressing[] = ['thap', 'trung-binh', 'cao']

describe('tiêu hao thể lực theo phút (AC-8.6)', () => {
  it('thể lực giảm đơn điệu theo từng phút', () => {
    let tl = THE_LUC_DAY
    for (let phut = 0; phut < 95; phut += 1) {
      const sau = theLucSauMotPhut(tl, 12, 'trung-binh')
      expect(sau).toBeLessThan(tl)
      tl = sau
    }
  })

  it('cầu thủ Thể lực cao giảm chậm hơn cầu thủ Thể lực thấp', () => {
    for (const muc of CAC_MUC) {
      const khoe = tieuHaoMotPhut(20, muc)
      const yeu = tieuHaoMotPhut(1, muc)
      expect(khoe, muc).toBeLessThan(yeu)
    }
  })

  it('cùng một cầu thủ thì pressing cao giảm nhanh hơn pressing thấp', () => {
    for (const chiSo of [1, 10, 20]) {
      const thap = tieuHaoMotPhut(chiSo, 'thap')
      const trungBinh = tieuHaoMotPhut(chiSo, 'trung-binh')
      const cao = tieuHaoMotPhut(chiSo, 'cao')
      expect(trungBinh, `chỉ số ${chiSo}`).toBeGreaterThan(thap)
      expect(cao, `chỉ số ${chiSo}`).toBeGreaterThan(trungBinh)
    }
  })

  it('hai yếu tố độc lập nhau — đổi cái nào cũng thấy tác dụng', () => {
    // Nếu một trong hai bị bỏ quên thì một trong hai phép so này sẽ bằng nhau.
    expect(tieuHaoMotPhut(20, 'cao')).not.toBe(tieuHaoMotPhut(1, 'cao'))
    expect(tieuHaoMotPhut(10, 'cao')).not.toBe(tieuHaoMotPhut(10, 'thap'))
  })

  it('không bao giờ xuống dưới 0', () => {
    let tl = 1
    for (let i = 0; i < 20; i += 1) {
      tl = theLucSauMotPhut(tl, 1, 'cao')
      expect(tl).toBeGreaterThanOrEqual(0)
    }
    expect(tl).toBe(0)
  })

  it('chỉ số chưa điền thì coi như trung bình, không ném lỗi', () => {
    expect(() => tieuHaoMotPhut(undefined, 'cao')).not.toThrow()
    expect(tieuHaoMotPhut(undefined, 'trung-binh')).toBeGreaterThan(0)
  })

  it('chỉ số ngoài 1..20 bị kẹp lại, không làm vỡ công thức', () => {
    expect(heSoTheoChiSo(50)).toBe(heSoTheoChiSo(20))
    expect(heSoTheoChiSo(-5)).toBe(heSoTheoChiSo(1))
  })
})

describe('ngưỡng kiệt sức (AC-8.7)', () => {
  it('trên ngưỡng thì chưa kiệt sức, dưới ngưỡng thì có', () => {
    expect(daKietSuc(NGUONG_KIET_SUC + 1)).toBe(false)
    expect(daKietSuc(NGUONG_KIET_SUC)).toBe(false)
    expect(daKietSuc(NGUONG_KIET_SUC - 1)).toBe(true)
  })

  it('một trận 90 phút pressing cao đủ làm cầu thủ yếu kiệt sức', () => {
    let tl = THE_LUC_DAY
    for (let i = 0; i < 90; i += 1) {
      tl = theLucSauMotPhut(tl, 4, 'cao')
    }
    expect(daKietSuc(tl)).toBe(true)
  })

  it('cầu thủ thể lực tốt đá pressing thấp thì hết trận vẫn sung', () => {
    let tl = THE_LUC_DAY
    for (let i = 0; i < 90; i += 1) {
      tl = theLucSauMotPhut(tl, 18, 'thap')
    }
    expect(daKietSuc(tl)).toBe(false)
  })
})
