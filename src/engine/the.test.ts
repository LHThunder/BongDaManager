import { describe, expect, it } from 'vitest'
import {
  daRoiSanVivThe,
  laLoiNghiemTrong,
  rutThe,
  xacSuatAnThe,
  type TheDaNhan,
} from './the'
import type { MucPressing } from './theLuc'
import { benMauQuanSo, cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { buocTiep, nguongHuyTran, taoTran } from './tran'

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

/*
  Huỷ trận khi một bên còn quá ít người (AC-14.5, AC-14.6, quyết định D58).

  Dựng tay số người trên sân thay vì chờ engine rút đủ thẻ đỏ: cần kiểm ĐÚNG
  hai bên của ngưỡng, mà rút ngẫu nhiên thì không đặt được trận vào đúng chỗ
  muốn kiểm.
*/
describe('huỷ trận vì thiếu người (AC-14.5)', () => {
  function tranVoi(quanSo: number, soNguoiConLai: number) {
    const tt = taoTran(
      cauHinhMau(MA_TRAN_CO_DINH[0], {
        quanSo,
        nha: benMauQuanSo('A', quanSo),
        khach: benMauQuanSo('B', quanSo),
        sanTrungLap: true,
      }),
    )
    const nha = {
      ...tt.ben.nha,
      trenSan: tt.ben.nha.trenSan.slice(0, soNguoiConLai),
    }
    return { ...tt, ben: { ...tt.ben, nha } }
  }

  it('ngưỡng là 60% quân số, khớp luật thật ở cả hai đầu dải', () => {
    // Sân 11: luật FIFA dừng khi còn dưới 7 người.
    expect(nguongHuyTran(11)).toBeCloseTo(6.6)
    expect(6 < nguongHuyTran(11)).toBe(true)
    expect(7 < nguongHuyTran(11)).toBe(false)

    // Sân 5: luật futsal dừng khi còn dưới 3 người.
    expect(nguongHuyTran(5)).toBeCloseTo(3)
    expect(2 < nguongHuyTran(5)).toBe(true)
    expect(3 < nguongHuyTran(5)).toBe(false)
  })

  it('sân 11 dừng khi còn 6 người, KHÔNG dừng khi còn 7', () => {
    const conBay = buocTiep(tranVoi(11, 7))
    expect(conBay.biHuy).toBe(false)
    expect(conBay.ketThuc).toBe(false)

    const conSau = buocTiep(tranVoi(11, 6))
    expect(conSau.biHuy).toBe(true)
    expect(conSau.ketThuc).toBe(true)
  })

  it('sân 5 dừng khi còn 2 người, KHÔNG dừng khi còn 3', () => {
    const conBa = buocTiep(tranVoi(5, 3))
    expect(conBa.biHuy).toBe(false)
    expect(conBa.ketThuc).toBe(false)

    const conHai = buocTiep(tranVoi(5, 2))
    expect(conHai.biHuy).toBe(true)
    expect(conHai.ketThuc).toBe(true)
  })

  it('trận bị huỷ có dòng riêng nói rõ đội nào thiếu người', () => {
    const tt = buocTiep(tranVoi(5, 2))
    const cuoi = tt.ungVien[tt.ungVien.length - 1].suKien

    expect(cuoi.loai).toBe('huy-tran')
    expect(cuoi.doi).toBe('nha')
    expect(cuoi.phut).toBe(tt.phut)
  })

  it('trận chạy bình thường thì không bao giờ mang cờ huỷ', () => {
    const tt = buocTiep(
      taoTran(cauHinhMau(MA_TRAN_CO_DINH[0], { sanTrungLap: true })),
    )
    expect(tt.biHuy).toBe(false)
  })
})
