import { describe, expect, it } from 'vitest'
import {
  daRoiSanVivThe,
  laLoiNghiemTrong,
  rutThe,
  xacSuatAnThe,
  type TheDaNhan,
} from './the'
import type { MucPressing } from './theLuc'

const CAC_MUC: MucPressing[] = ['thap', 'trung-binh', 'cao']

describe('xác suất ăn thẻ (AC-8.13)', () => {
  it('Quyết đoán thấp thì dễ ăn thẻ hơn Quyết đoán cao', () => {
    for (const muc of CAC_MUC) {
      expect(xacSuatAnThe(2, muc), muc).toBeGreaterThan(xacSuatAnThe(18, muc))
    }
  })

  it('pressing càng cao càng dễ ăn thẻ', () => {
    for (const quyetDoan of [2, 10, 18]) {
      const thap = xacSuatAnThe(quyetDoan, 'thap')
      const trungBinh = xacSuatAnThe(quyetDoan, 'trung-binh')
      const cao = xacSuatAnThe(quyetDoan, 'cao')
      expect(trungBinh, `QĐ ${quyetDoan}`).toBeGreaterThan(thap)
      expect(cao, `QĐ ${quyetDoan}`).toBeGreaterThan(trungBinh)
    }
  })

  it('hai yếu tố độc lập — bỏ quên cái nào cũng lộ ra', () => {
    expect(xacSuatAnThe(2, 'cao')).not.toBe(xacSuatAnThe(18, 'cao'))
    expect(xacSuatAnThe(10, 'cao')).not.toBe(xacSuatAnThe(10, 'thap'))
  })

  it('luôn là xác suất hợp lệ trong (0, 1)', () => {
    for (const quyetDoan of [1, 5, 10, 15, 20]) {
      for (const muc of CAC_MUC) {
        const p = xacSuatAnThe(quyetDoan, muc)
        expect(p).toBeGreaterThan(0)
        expect(p).toBeLessThan(1)
      }
    }
  })

  it('chỉ số chưa điền hoặc ngoài khoảng không làm vỡ công thức', () => {
    expect(xacSuatAnThe(undefined, 'cao')).toBeGreaterThan(0)
    expect(xacSuatAnThe(100, 'cao')).toBe(xacSuatAnThe(20, 'cao'))
    expect(xacSuatAnThe(-5, 'cao')).toBe(xacSuatAnThe(1, 'cao'))
  })
})

describe('rút thẻ và rời sân (AC-8.13)', () => {
  it('thẻ vàng đầu tiên thì chưa rời sân', () => {
    expect(rutThe(undefined, false)).toEqual({
      theSauDo: 'vang',
      roiSan: false,
    })
  })

  it('thẻ vàng thứ hai thành thẻ đỏ và rời sân', () => {
    expect(rutThe('vang', false)).toEqual({
      theSauDo: 'vang-vang',
      roiSan: true,
    })
  })

  it('lỗi nghiêm trọng là thẻ đỏ trực tiếp, rời sân ngay', () => {
    expect(rutThe(undefined, true)).toEqual({ theSauDo: 'do', roiSan: true })
    expect(rutThe('vang', true)).toEqual({ theSauDo: 'do', roiSan: true })
  })

  it('người đã rời sân vì thẻ thì không bao giờ quay lại', () => {
    const daRoi: TheDaNhan[] = ['do', 'vang-vang']
    for (const the of daRoi) {
      expect(daRoiSanVivThe(the), the).toBe(true)
    }
    expect(daRoiSanVivThe('vang')).toBe(false)
    expect(daRoiSanVivThe(undefined)).toBe(false)
  })

  it('một phần nhỏ pha phạm lỗi là lỗi nghiêm trọng, không phải phần lớn', () => {
    // Quét đều 0..1 để biết tỉ lệ thật, không đoán.
    let soNghiemTrong = 0
    const soMau = 1000
    for (let i = 0; i < soMau; i += 1) {
      if (laLoiNghiemTrong(i / soMau)) soNghiemTrong += 1
    }
    const tiLe = soNghiemTrong / soMau
    expect(tiLe).toBeGreaterThan(0)
    expect(tiLe).toBeLessThan(0.15)
  })
})
