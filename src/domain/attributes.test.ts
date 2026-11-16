import { describe, expect, it } from 'vitest'
import {
  ATTRIBUTES,
  chiSoQuanTrong,
  GK_ATTRIBUTES,
  laChiSoHopLe,
  GK_CHI_SO_CHUNG,
  NGUONG_QUAN_TRONG,
  POSITION_WEIGHTS,
} from './attributes'
import { POSITIONS } from './positions'
import type { AttributeId, GkAttributeId } from './types'

const ID_CHI_SO = new Set<string>(ATTRIBUTES.map((a) => a.id))

describe('bảng chỉ số (AC-2.2, AC-2.3)', () => {
  it('có đúng 15 chỉ số chung', () => {
    expect(ATTRIBUTES).toHaveLength(15)
  })

  it('có đúng 3 chỉ số riêng của thủ môn', () => {
    expect(GK_ATTRIBUTES).toHaveLength(3)
    expect(GK_ATTRIBUTES.map((a) => a.id)).toEqual([
      'phan-xa',
      'bat-bong',
      'phat-dong',
    ])
  })

  it('không có id trùng lặp giữa chỉ số chung và chỉ số thủ môn', () => {
    const tatCa = [...ATTRIBUTES, ...GK_ATTRIBUTES].map((a) => a.id)
    expect(new Set(tatCa).size).toBe(18)
  })

  /*
    Phép "mỗi chỉ số có tên không rỗng" đã đi theo nhãn sang
    `ui/ngonNgu/nhan.test.ts` (T309, T310).
  */

  it('15 chỉ số chung chia đúng 4 nhóm', () => {
    const nhom = new Set(ATTRIBUTES.map((a) => a.nhom))
    expect(nhom).toEqual(
      new Set(['ky-thuat', 'phong-ngu', 'the-chat', 'tinh-than']),
    )
  })

  /*
    `tenChiSo` đã được gỡ (D76) nên phép kiểm nó cũng đi theo. Thay vào đó
    là phép kiểm `laChiSoHopLe` — phần duy nhất của hàm cũ không phải chữ.
  */
  it('laChiSoHopLe nhận mã thật và từ chối mã lạ', () => {
    expect(laChiSoHopLe('dut-diem')).toBe(true)
    expect(laChiSoHopLe('phan-xa')).toBe(true)
    expect(laChiSoHopLe('khong-ton-tai')).toBe(false)
  })
})

describe('8 chỉ số chung của thủ môn (AC-2.3)', () => {
  it('có đúng 8 chỉ số', () => {
    expect(GK_CHI_SO_CHUNG).toHaveLength(8)
  })

  it('mọi chỉ số trong đó đều là chỉ số chung hợp lệ', () => {
    for (const id of GK_CHI_SO_CHUNG) {
      expect(ID_CHI_SO, `${id} không phải chỉ số chung`).toContain(id)
    }
  })

  it('không chứa những chỉ số mà AC-2.3 nói phải ẩn với thủ môn', () => {
    for (const id of [
      'dut-diem',
      'sut-xa',
      're-dat',
      'tac-bong',
      'kem-nguoi',
      'doc-tinh-huong',
      'nhan-quan',
    ] as AttributeId[]) {
      expect(GK_CHI_SO_CHUNG).not.toContain(id)
    }
  })
})

describe('trọng số theo vị trí (quyết định D10)', () => {
  it('mọi vị trí trong POSITIONS đều có bộ trọng số', () => {
    for (const p of POSITIONS) {
      const w = POSITION_WEIGHTS[p.id]
      expect(w, `vị trí ${p.id} thiếu trọng số`).toBeDefined()
      expect(
        Object.keys(w.attributes).length,
        `vị trí ${p.id} có bảng trọng số rỗng`,
      ).toBeGreaterThan(0)
    }
  })

  it('mọi khoá trọng số đều là chỉ số hợp lệ', () => {
    for (const p of POSITIONS) {
      for (const id of Object.keys(POSITION_WEIGHTS[p.id].attributes)) {
        expect(ID_CHI_SO, `vị trí ${p.id} tham chiếu chỉ số lạ ${id}`).toContain(
          id,
        )
      }
    }
  })

  it('mọi trọng số nằm trong 1..3', () => {
    for (const p of POSITIONS) {
      const w = POSITION_WEIGHTS[p.id]
      for (const trongSo of [
        ...Object.values(w.attributes),
        ...Object.values(w.gkAttributes ?? {}),
      ]) {
        expect(trongSo).toBeGreaterThanOrEqual(1)
        expect(trongSo).toBeLessThanOrEqual(3)
      }
    }
  })

  /*
    Đây là bất biến quan trọng nhất của bảng: nếu trọng số của thủ môn tham
    chiếu một chỉ số mà thủ môn không bao giờ được nhập (AC-2.3 ẩn nó đi), thì
    chỉ số tổng của thủ môn sẽ tính trên dữ liệu không tồn tại.
  */
  it('trọng số của thủ môn chỉ dùng 8 chỉ số chung được phép', () => {
    for (const id of Object.keys(POSITION_WEIGHTS.GK.attributes)) {
      expect(
        GK_CHI_SO_CHUNG,
        `trọng số thủ môn dùng ${id}, chỉ số này không hiện cho thủ môn`,
      ).toContain(id as AttributeId)
    }
  })

  it('thủ môn có trọng số cho cả 3 chỉ số riêng', () => {
    const gk = POSITION_WEIGHTS.GK.gkAttributes ?? {}
    for (const a of GK_ATTRIBUTES) {
      expect(gk[a.id], `thủ môn thiếu trọng số cho ${a.id}`).toBeDefined()
    }
  })

  it('không vị trí sân nào dùng chỉ số riêng của thủ môn', () => {
    for (const p of POSITIONS) {
      if (p.id === 'GK') continue
      expect(
        POSITION_WEIGHTS[p.id].gkAttributes,
        `vị trí sân ${p.id} không được dùng chỉ số thủ môn`,
      ).toBeUndefined()
    }
  })

  it('các cặp vị trí đối xứng trái/phải dùng chung trọng số', () => {
    expect(POSITION_WEIGHTS.DL).toBe(POSITION_WEIGHTS.DR)
    expect(POSITION_WEIGHTS.ML).toBe(POSITION_WEIGHTS.MR)
    expect(POSITION_WEIGHTS.AML).toBe(POSITION_WEIGHTS.AMR)
  })

  it('bảng phân biệt được vai trò: trung vệ nặng phòng ngự, tiền đạo nặng dứt điểm', () => {
    expect(POSITION_WEIGHTS.DC.attributes['tac-bong']).toBe(3)
    expect(POSITION_WEIGHTS.DC.attributes['dut-diem']).toBeUndefined()

    expect(POSITION_WEIGHTS.ST.attributes['dut-diem']).toBe(3)
    expect(POSITION_WEIGHTS.ST.attributes['tac-bong']).toBeUndefined()
  })
})

describe('chiSoQuanTrong', () => {
  it('chỉ trả những chỉ số có trọng số từ ngưỡng trở lên', () => {
    const quanTrong = chiSoQuanTrong('DC')
    for (const id of quanTrong.attributes) {
      const trongSo = POSITION_WEIGHTS.DC.attributes[id] ?? 0
      expect(trongSo).toBeGreaterThanOrEqual(NGUONG_QUAN_TRONG)
    }
    expect(quanTrong.attributes).toContain<AttributeId>('kem-nguoi')
    expect(quanTrong.attributes).not.toContain<AttributeId>('chuyen-ngan')
  })

  it('với thủ môn thì trả cả chỉ số riêng', () => {
    const quanTrong = chiSoQuanTrong('GK')
    expect(quanTrong.gkAttributes).toContain<GkAttributeId>('phan-xa')
    expect(quanTrong.gkAttributes).toContain<GkAttributeId>('bat-bong')
  })

  it('với vị trí sân thì danh sách chỉ số thủ môn rỗng', () => {
    expect(chiSoQuanTrong('ST').gkAttributes).toEqual([])
  })
})
