import { describe, expect, it } from 'vitest'
import { BUOC_MOI_PHUT, SO_THUC_THE } from './moc'
import {
  docMoc,
  donLoMoc,
  ghiMoc,
  KHONG_AI_GIU,
  soByteCuaLo,
  STRIDE,
  STRIDE_TIEU_DE,
  taoLoMoc,
  TEN_O,
  type ThucTheTaiMoc,
} from './loMoc'

/*
  Lô mốc (T704, D119, mục 0 của plan).

  Phép kiểm nặng nhất ở đây là con số bộ nhớ: 97,5 KiB cho trường hợp xấu nhất.
  Nó là lý do cả ba hình dạng bộ đệm khác bị loại, nên nếu stride hay số thực
  thể đổi thì con số ấy phải đỏ chứ không được âm thầm trôi.
*/

function thucThe(i: number): ThucTheTaiMoc {
  return {
    x: i + 0.5,
    y: i * 2 + 0.25,
    z: i % 3,
    vx: -i,
    vy: i / 2,
    vz: 0,
    huong: (i * 13) % 360,
    coMat: i % 7 === 0 ? 0 : 1,
  }
}

const MOT_MOC = Array.from({ length: SO_THUC_THE }, (_, i) => thucThe(i))

describe('hình dạng lô', () => {
  it('stride 8 có tên, đúng thứ tự của mục 0', () => {
    expect(STRIDE).toBe(8)
    expect(TEN_O).toEqual(['x', 'y', 'z', 'vx', 'vy', 'vz', 'huong', 'coMat'])
    expect(TEN_O).toHaveLength(STRIDE)
  })

  it('header 2 ô mỗi mốc', () => {
    expect(STRIDE_TIEU_DE).toBe(2)
  })

  it('lô xấu nhất của một phút là 97,5 KiB, cộng 960 byte header', () => {
    const lo = taoLoMoc(BUOC_MOI_PHUT)
    expect(lo.oLieu.byteLength).toBe(120 * 26 * 8 * 4)
    expect(lo.oLieu.byteLength).toBe(99_840)
    expect(lo.oLieu.byteLength / 1024).toBeCloseTo(97.5, 3)
    expect(lo.oTieuDe.byteLength).toBe(120 * 2 * 4)
    expect(lo.oTieuDe.byteLength).toBe(960)
    expect(soByteCuaLo(lo)).toBe(100_800)
  })

  it('và nó nhỏ hơn hẳn hai hình dạng đã bị loại', () => {
    const lo = soByteCuaLo(taoLoMoc(BUOC_MOI_PHUT))
    // Bộ đệm trọn trận: ~5.754 mốc.
    const tronTran = 5_754 * SO_THUC_THE * STRIDE * 4
    expect(tronTran).toBeGreaterThan(3_000_000)
    expect(lo * 30).toBeLessThan(tronTran)
    // Bộ đệm vòng 1024 bước.
    const vong = 1_024 * SO_THUC_THE * STRIDE * 4
    expect(vong / 1024).toBeCloseTo(832, 0)
    expect(lo).toBeLessThan(vong)
  })
})

describe('ghi rồi đọc lại ra đúng từng số', () => {
  it('một mốc đi qua lô không mất một giá trị nào', () => {
    const lo = taoLoMoc(4)
    ghiMoc(lo, 42, 7, MOT_MOC)

    const ra = docMoc(lo, 0)
    expect(ra.chiSoMoc).toBe(42)
    expect(ra.nguoiGiu).toBe(7)
    expect(ra.cacThucThe).toHaveLength(SO_THUC_THE)

    for (let i = 0; i < SO_THUC_THE; i += 1) {
      const mong = MOT_MOC[i]!
      const thuc = ra.cacThucThe[i]!
      for (const o of TEN_O) {
        // Float32 làm tròn, nên so xấp xỉ ở độ chính xác của float32.
        expect(thuc[o], `thực thể ${i}, ô ${o}`).toBeCloseTo(mong[o], 5)
      }
    }
  })

  it('nhiều mốc không đè lên nhau', () => {
    const lo = taoLoMoc(3)
    ghiMoc(lo, 10, 0, MOT_MOC)
    ghiMoc(lo, 11, KHONG_AI_GIU, MOT_MOC.map((t, i) => ({ ...t, x: i + 1000 })))
    ghiMoc(lo, 12, 21, MOT_MOC)

    expect(lo.soMocDaGhi).toBe(3)
    expect(docMoc(lo, 0).chiSoMoc).toBe(10)
    expect(docMoc(lo, 1).chiSoMoc).toBe(11)
    expect(docMoc(lo, 2).chiSoMoc).toBe(12)

    expect(docMoc(lo, 0).cacThucThe[5]!.x).toBeCloseTo(5.5, 5)
    expect(docMoc(lo, 1).cacThucThe[5]!.x).toBeCloseTo(1005, 5)
    expect(docMoc(lo, 2).cacThucThe[5]!.x).toBeCloseTo(5.5, 5)
  })

  it('KHONG_AI_GIU đi qua header mà không bị nhầm thành thực thể 0', () => {
    const lo = taoLoMoc(2)
    ghiMoc(lo, 1, KHONG_AI_GIU, MOT_MOC)
    expect(KHONG_AI_GIU).toBe(-1)
    expect(docMoc(lo, 0).nguoiGiu).toBe(-1)
    expect(docMoc(lo, 0).nguoiGiu).not.toBe(0)
  })
})

describe('lô từ chối chuyện sai, không ghi nửa vời', () => {
  it('ghi quá sức chứa thì ném lỗi nói rõ số', () => {
    const lo = taoLoMoc(1)
    ghiMoc(lo, 0, 0, MOT_MOC)
    expect(() => ghiMoc(lo, 1, 0, MOT_MOC)).toThrow(/sức chứa 1/)
  })

  it('mốc khuyết thực thể thì ném lỗi — AC-37.4 đòi không khuyết mốc', () => {
    const lo = taoLoMoc(2)
    expect(() => ghiMoc(lo, 0, 0, MOT_MOC.slice(0, 25))).toThrow(/phải đúng 26/)
    // Và lô vẫn rỗng: không ghi nửa vời.
    expect(lo.soMocDaGhi).toBe(0)
  })

  it('đọc mốc chưa ghi thì ném lỗi, không trả về số rác', () => {
    const lo = taoLoMoc(4)
    expect(() => docMoc(lo, 0)).toThrow(/đang giữ 0 mốc/)
    ghiMoc(lo, 0, 0, MOT_MOC)
    expect(() => docMoc(lo, 1)).toThrow(/đang giữ 1 mốc/)
    expect(() => docMoc(lo, -1)).toThrow()
  })
})

describe('dọn lô để dùng lại, không cấp mới mỗi phút', () => {
  it('dọn rồi ghi lại cho đúng mốc mới', () => {
    const lo = taoLoMoc(2)
    ghiMoc(lo, 100, 3, MOT_MOC)
    const truoc = lo.oLieu.byteLength

    donLoMoc(lo)
    expect(lo.soMocDaGhi).toBe(0)
    expect(lo.oLieu.byteLength).toBe(truoc)

    ghiMoc(lo, 200, 4, MOT_MOC)
    expect(docMoc(lo, 0).chiSoMoc).toBe(200)
    expect(lo.soMocDaGhi).toBe(1)
  })
})
