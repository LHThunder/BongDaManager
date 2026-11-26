import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import {
  hiepCuaPhut,
  SO_CHUOI_MOI_PHUT,
  taoTran,
  tongPhutHiep1,
  tongPhutTran,
} from '../tran'
import {
  BUOC_MOI_PHUT,
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  chuoiCuaMoc,
  giayCuaMoc,
  hiepCuaMoc,
  laMocThuong,
  MOC_MOI_CHUOI,
  MOC_MOI_PHUT,
  mocHetHiep1,
  phutCuaMoc,
  SO_THUC_THE,
  soBuoc,
  soMoc,
} from './moc'

/*
  Lưới mốc (T704, D119, AC-37.1 + AC-37.3 + AC-37.7).

  Ba đẳng thức đầu là ba cái neo của cả lưới, và `plan.md` mục 7 đòi đúng ba
  cái ấy. Chúng không phải sự trùng hợp mà là hợp đồng: cái thứ ba khoá lưới
  mốc vào `SO_CHUOI_MOI_PHUT` của v6, nên đổi số chuỗi mỗi phút là đỏ ở đây.
*/

const TT = taoTran(cauHinhMau(MA_TRAN_CO_DINH[0]!))

describe('ba đẳng thức neo của lưới mốc', () => {
  it('soBuoc === tongPhutTran × BUOC_MOI_PHUT', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = taoTran(cauHinhMau(ma))
      expect(soBuoc(tt), ma).toBe(tongPhutTran(tt) * BUOC_MOI_PHUT)
    }
  })

  it('MOC_MOI_PHUT × 2 === BUOC_MOI_PHUT — phát 1 giây, tích phân 0,5 giây', () => {
    expect(MOC_MOI_PHUT * 2).toBe(BUOC_MOI_PHUT)
  })

  it('MOC_MOI_CHUOI × SO_CHUOI_MOI_PHUT === MOC_MOI_PHUT', () => {
    expect(MOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT).toBe(MOC_MOI_PHUT)
  })
})

describe('bốn con số của lưới', () => {
  it('đúng giá trị đã chốt ở mục 0 của plan', () => {
    expect(BUOC_MOI_PHUT).toBe(120)
    expect(MOC_MOI_PHUT).toBe(60)
    expect(MOC_MOI_CHUOI).toBe(20)
    expect(SO_THUC_THE).toBe(26)
  })

  it('26 thực thể = 22 cầu thủ + 3 trọng tài + 1 bóng, và chỉ số không đè nhau', () => {
    expect(SO_THUC_THE).toBe(22 + 3 + 1)
    const chiSo = [CHI_SO_TRONG_TAI, CHI_SO_TRO_LY_1, CHI_SO_TRO_LY_2, CHI_SO_BONG]
    expect(new Set(chiSo).size).toBe(4)
    for (const i of chiSo) {
      expect(i).toBeGreaterThanOrEqual(22)
      expect(i).toBeLessThan(SO_THUC_THE)
    }
  })

  it('một trận cho 5.520–6.000 mốc thường, trung bình quanh 5.754', () => {
    const cac = MA_TRAN_CO_DINH.map((ma) => soMoc(taoTran(cauHinhMau(ma))))
    for (const n of cac) {
      expect(n).toBeGreaterThanOrEqual(5_520)
      expect(n).toBeLessThanOrEqual(6_000)
    }
  })
})

describe('mocHetHiep1 và hiepCuaMoc đi theo v6, không tự tính lại', () => {
  it('mốc hết hiệp một đúng bằng tongPhutHiep1 × BUOC_MOI_PHUT', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = taoTran(cauHinhMau(ma))
      expect(mocHetHiep1(tt), ma).toBe(tongPhutHiep1(tt) * BUOC_MOI_PHUT)
    }
  })

  it('biên thuộc hiệp một, đúng như hiepCuaPhut của v6', () => {
    const biên = mocHetHiep1(TT)
    expect(hiepCuaMoc(TT, biên)).toBe(1)
    expect(hiepCuaMoc(TT, biên + 1)).toBe(2)
    expect(hiepCuaMoc(TT, 0)).toBe(1)
  })

  it('hiepCuaMoc khớp hiepCuaPhut ở MỌI mốc của trận', () => {
    for (let m = 0; m < soBuoc(TT); m += 37) {
      expect(hiepCuaMoc(TT, m), `mốc ${m}`).toBe(
        hiepCuaPhut(TT, phutCuaMoc(m)),
      )
    }
  })
})

describe('chiSoMoc là số NỬA GIÂY tuyệt đối', () => {
  it('mốc 0 là tiếng còi khai cuộc, mốc 2 là giây thứ nhất', () => {
    expect(giayCuaMoc(0)).toBe(0)
    expect(giayCuaMoc(1)).toBe(0.5)
    expect(giayCuaMoc(2)).toBe(1)
    expect(giayCuaMoc(BUOC_MOI_PHUT)).toBe(60)
  })

  it('phút đánh số từ 1, đúng như tt.phut của v6', () => {
    expect(phutCuaMoc(0)).toBe(1)
    expect(phutCuaMoc(BUOC_MOI_PHUT - 1)).toBe(1)
    expect(phutCuaMoc(BUOC_MOI_PHUT)).toBe(2)
  })

  it('phần thường phát bước CHẴN; bước lẻ chỉ ra ở tình huống quan trọng', () => {
    expect(laMocThuong(0)).toBe(true)
    expect(laMocThuong(1)).toBe(false)
    expect(laMocThuong(2)).toBe(true)

    // Trong một phút, đúng MOC_MOI_PHUT bước là bước thường.
    let dem = 0
    for (let m = 0; m < BUOC_MOI_PHUT; m += 1) if (laMocThuong(m)) dem += 1
    expect(dem).toBe(MOC_MOI_PHUT)
  })
})

describe('chuoiCuaMoc — ba chuỗi chia đều một phút', () => {
  it('mỗi chuỗi chiếm đúng một phần ba số bước của phút', () => {
    const dem = [0, 0, 0]
    for (let m = 0; m < BUOC_MOI_PHUT; m += 1) dem[chuoiCuaMoc(m)]! += 1
    expect(dem).toEqual([40, 40, 40])
  })

  it('mỗi chuỗi dài đúng 20 giây', () => {
    expect((BUOC_MOI_PHUT / SO_CHUOI_MOI_PHUT) / 2).toBe(20)
  })

  it('chỉ số chuỗi lặp lại theo phút, không tích luỹ', () => {
    expect(chuoiCuaMoc(0)).toBe(0)
    expect(chuoiCuaMoc(39)).toBe(0)
    expect(chuoiCuaMoc(40)).toBe(1)
    expect(chuoiCuaMoc(119)).toBe(2)
    expect(chuoiCuaMoc(BUOC_MOI_PHUT)).toBe(0)
    expect(chuoiCuaMoc(BUOC_MOI_PHUT + 40)).toBe(1)
  })
})
