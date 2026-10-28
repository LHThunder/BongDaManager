import { describe, expect, it } from 'vitest'
import { ATTRIBUTES, GK_ATTRIBUTES } from './attributes'
import { POSITIONS } from './positions'
import {
  CHI_SO_THU_MON_CO_THE_DUNG,
  chiSoChuaDat,
  layVaiTro,
  NGUONG_DAT_VAI_TRO,
  ROLES,
  VAI_TRO_MAC_DINH,
  vaiTroApDungDuoc,
  vaiTroChoViTri,
  vaiTroMacDinh,
  type RoleId,
} from './roles'
import type { AttributeId, AttributeValues, GkAttributeValues } from './types'

const CHI_SO_HOP_LE = new Set<string>([
  ...ATTRIBUTES.map((a) => a.id),
  ...GK_ATTRIBUTES.map((a) => a.id),
])
const CHI_SO_CHI_THU_MON = new Set<string>(GK_ATTRIBUTES.map((a) => a.id))
const CHI_SO_THU_MON_DUOC_PHEP = new Set<string>(CHI_SO_THU_MON_CO_THE_DUNG)

/** Hồ sơ cầu thủ sân với mọi chỉ số bằng `muc`. */
function hoSoSan(muc: number): {
  attributes: AttributeValues
  gkAttributes: null
} {
  const attributes: Record<string, number> = {}
  for (const a of ATTRIBUTES) {
    attributes[a.id] = muc
  }
  return { attributes: attributes as AttributeValues, gkAttributes: null }
}

/** Hồ sơ thủ môn với mọi chỉ số bằng `muc`. */
function hoSoThuMon(muc: number): {
  attributes: AttributeValues
  gkAttributes: GkAttributeValues
} {
  const gkAttributes: Record<string, number> = {}
  for (const a of GK_ATTRIBUTES) {
    gkAttributes[a.id] = muc
  }
  return {
    attributes: hoSoSan(muc).attributes,
    gkAttributes: gkAttributes as GkAttributeValues,
  }
}

describe('bảng vai trò (AC-6.1)', () => {
  /*
    Không ghim đúng một con số: AC-6.1 nói "khoảng 22", hiện thực là 23. Thêm
    một vai trò hợp lý sau này không nên làm test đỏ vô cớ.
  */
  it('tổng số vai trò nằm trong khoảng 20..26', () => {
    expect(ROLES.length).toBeGreaterThanOrEqual(20)
    expect(ROLES.length).toBeLessThanOrEqual(26)
  })

  it('không có id vai trò trùng lặp', () => {
    const ids = ROLES.map((v) => v.id)
    expect(new Set(ids).size).toBe(ROLES.length)
  })

  it('mỗi vị trí trong 12 vị trí có 2 hoặc 3 vai trò', () => {
    for (const p of POSITIONS) {
      const soVaiTro = vaiTroChoViTri(p.id).length
      expect(soVaiTro, p.id).toBeGreaterThanOrEqual(2)
      expect(soVaiTro, p.id).toBeLessThanOrEqual(3)
    }
  })

  it('mỗi vai trò áp dụng cho ít nhất một vị trí hợp lệ', () => {
    const idViTri = new Set(POSITIONS.map((p) => p.id))
    for (const v of ROLES) {
      expect(v.viTriApDung.length, v.id).toBeGreaterThanOrEqual(1)
      for (const viTri of v.viTriApDung) {
        expect(idViTri.has(viTri), `${v.id}/${viTri}`).toBe(true)
      }
    }
  })

  it('mỗi vai trò có tên và moTa không rỗng', () => {
    for (const v of ROLES) {
      expect(v.ten.trim().length, v.id).toBeGreaterThan(0)
      expect(v.moTa.trim().length, v.id).toBeGreaterThan(0)
    }
  })

  it('chiSoQuanTrong của mọi vai trò đều là chỉ số hợp lệ, không trùng', () => {
    for (const v of ROLES) {
      expect(v.chiSoQuanTrong.length, v.id).toBeGreaterThanOrEqual(1)
      expect(new Set(v.chiSoQuanTrong).size, v.id).toBe(v.chiSoQuanTrong.length)
      for (const chiSo of v.chiSoQuanTrong) {
        expect(CHI_SO_HOP_LE.has(chiSo), `${v.id}/${chiSo}`).toBe(true)
      }
    }
  })
})

/*
  Bất biến này song song với bất biến đã có cho POSITION_WEIGHTS: thủ môn chỉ
  điền 8 chỉ số chung + 3 chỉ số thủ môn (AC-2.3), nên vai trò thủ môn mà đòi
  "Dứt điểm" thì cảnh báo AC-6.5 sẽ nêu một chỉ số không tồn tại trên biểu mẫu.
*/
describe('vai trò thủ môn chỉ dùng chỉ số mà thủ môn có (AC-2.3)', () => {
  it('vai trò áp dụng cho GK không đòi chỉ số ngoài tập của thủ môn', () => {
    for (const v of ROLES) {
      if (!v.viTriApDung.includes('GK')) continue
      for (const chiSo of v.chiSoQuanTrong) {
        expect(CHI_SO_THU_MON_DUOC_PHEP.has(chiSo), `${v.id}/${chiSo}`).toBe(
          true,
        )
      }
    }
  })

  it('vai trò không dành cho GK không dùng chỉ số riêng của thủ môn', () => {
    for (const v of ROLES) {
      if (v.viTriApDung.includes('GK')) continue
      for (const chiSo of v.chiSoQuanTrong) {
        expect(CHI_SO_CHI_THU_MON.has(chiSo), `${v.id}/${chiSo}`).toBe(false)
      }
    }
  })

  it('không vai trò nào áp dụng cho cả GK và một vị trí sân', () => {
    for (const v of ROLES) {
      if (!v.viTriApDung.includes('GK')) continue
      expect(v.viTriApDung, v.id).toEqual(['GK'])
    }
  })
})

describe('vai trò mặc định (AC-6.4)', () => {
  it('mỗi vị trí có một vai trò mặc định áp dụng được cho chính nó', () => {
    for (const p of POSITIONS) {
      const id = vaiTroMacDinh(p.id)
      expect(() => layVaiTro(id)).not.toThrow()
      expect(vaiTroApDungDuoc(id, p.id), `${p.id}/${id}`).toBe(true)
    }
  })

  it('bảng mặc định phủ đúng 12 vị trí', () => {
    expect(Object.keys(VAI_TRO_MAC_DINH).sort()).toEqual(
      POSITIONS.map((p) => p.id).sort(),
    )
  })

  it('layVaiTro ném lỗi với id không tồn tại', () => {
    expect(() => layVaiTro('khong-co-vai-tro-nay' as RoleId)).toThrow()
  })

  it('vaiTroApDungDuoc từ chối vị trí khác tuyến', () => {
    expect(vaiTroApDungDuoc('tien-dao-cat-mat', 'DC')).toBe(false)
    expect(vaiTroApDungDuoc('thu-mon-quet', 'DC')).toBe(false)
  })
})

describe('cảnh báo chỉ số chưa đạt (AC-6.5)', () => {
  it('hồ sơ đủ cao thì không cảnh báo gì', () => {
    for (const v of ROLES) {
      const hoSo = v.viTriApDung.includes('GK')
        ? hoSoThuMon(NGUONG_DAT_VAI_TRO)
        : hoSoSan(NGUONG_DAT_VAI_TRO)
      expect(chiSoChuaDat(v.id, hoSo), v.id).toEqual([])
    }
  })

  it('hồ sơ dưới ngưỡng thì nêu đủ chỉ số quan trọng của vai trò', () => {
    const vaiTro = layVaiTro('tien-dao-cat-mat')
    const chuaDat = chiSoChuaDat('tien-dao-cat-mat', hoSoSan(7))

    expect(chuaDat.map((c) => c.chiSo).sort()).toEqual(
      [...vaiTro.chiSoQuanTrong].sort(),
    )
    for (const c of chuaDat) {
      expect(c.giaTri).toBe(7)
      expect(c.ten.trim().length).toBeGreaterThan(0)
    }
  })

  it('chỉ nêu chỉ số của chính vai trò đó, không nêu chỉ số khác', () => {
    const chuaDat = chiSoChuaDat('tien-dao-muc-tieu', hoSoSan(4))
    const chiSo = chuaDat.map((c) => c.chiSo)

    expect(chiSo).toContain('khong-chien')
    expect(chiSo).not.toContain('nhan-quan')
  })

  it('đúng ngưỡng là đạt, dưới ngưỡng một điểm là chưa đạt', () => {
    expect(chiSoChuaDat('tien-dao-cat-mat', hoSoSan(NGUONG_DAT_VAI_TRO))).toEqual(
      [],
    )
    expect(
      chiSoChuaDat('tien-dao-cat-mat', hoSoSan(NGUONG_DAT_VAI_TRO - 1)).length,
    ).toBeGreaterThan(0)
  })

  it('chỉ số chưa điền cũng bị nêu, với giaTri null', () => {
    const hoSo = hoSoSan(20)
    const thieu: AttributeValues = { ...hoSo.attributes }
    delete thieu['dut-diem' as AttributeId]

    const chuaDat = chiSoChuaDat('tien-dao-cat-mat', {
      attributes: thieu,
      gkAttributes: null,
    })

    expect(chuaDat).toEqual([
      { chiSo: 'dut-diem', ten: 'Dứt điểm', giaTri: null },
    ])
  })

  it('vai trò thủ môn đọc được chỉ số riêng của thủ môn', () => {
    const chuaDat = chiSoChuaDat('thu-mon-truyen-thong', hoSoThuMon(5))
    expect(chuaDat.map((c) => c.chiSo)).toContain('phan-xa')
    for (const c of chuaDat) {
      expect(c.giaTri).toBe(5)
    }
  })

  it('vai trò thủ môn mà hồ sơ không có gkAttributes thì nêu là chưa điền', () => {
    const chuaDat = chiSoChuaDat('thu-mon-truyen-thong', hoSoSan(20))
    const theoChiSo = new Map(chuaDat.map((c) => [c.chiSo, c.giaTri]))

    expect(theoChiSo.get('phan-xa')).toBeNull()
    expect(theoChiSo.get('bat-bong')).toBeNull()
    // 'quyet-doan' là chỉ số chung, đã điền 20 nên không bị nêu.
    expect(theoChiSo.has('quyet-doan')).toBe(false)
  })
})
