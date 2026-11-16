import { describe, expect, it } from 'vitest'
import {
  cacXungDot,
  CHI_THI,
  CHI_THI_MAC_DINH,
  THU_TU_CHI_THI,
  type BoChiThi,
  type ChiThiId,
} from './instructions'

const ID_MONG_DOI: ChiThiId[] = [
  'do-cao-doi-hinh',
  'do-rong-doi-hinh',
  'toc-do-chuyen-bong',
  'cuong-do-pressing',
  'huong-tan-cong',
  'bay-viet-vi',
]

describe('bảng 6 chỉ thị (AC-7.1)', () => {
  it('có đúng 6 chỉ thị, đúng những chỉ thị đã chốt', () => {
    expect(Object.keys(CHI_THI)).toHaveLength(6)
    expect(Object.keys(CHI_THI).sort()).toEqual([...ID_MONG_DOI].sort())
  })

  it('thứ tự hiển thị phủ đúng 6 chỉ thị, không trùng', () => {
    expect(THU_TU_CHI_THI).toHaveLength(6)
    expect(new Set(THU_TU_CHI_THI).size).toBe(6)
    expect([...THU_TU_CHI_THI].sort()).toEqual(Object.keys(CHI_THI).sort())
  })

  it('khoá của bảng trùng với id bên trong', () => {
    for (const id of THU_TU_CHI_THI) {
      expect(CHI_THI[id].id).toBe(id)
    }
  })

  it('mỗi chỉ thị có từ 2 mức trở lên, không mức nào trùng', () => {
    for (const id of THU_TU_CHI_THI) {
      const chiThi = CHI_THI[id]
      expect(chiThi.cacMuc.length, id).toBeGreaterThanOrEqual(2)
      expect(new Set(chiThi.cacMuc.map((m) => m.muc)).size, id).toBe(
        chiThi.cacMuc.length,
      )
    }
  })
})

/*
  Khối "câu đánh đổi của từng mức (AC-7.2)" đã chuyển sang
  `ui/ngonNgu/nhan.test.ts` cùng với chính những câu ấy (T308, T310).
  Nó không bị xoá — ở chỗ mới nó còn chạy cho cả hai ngôn ngữ.
*/

describe('bộ chỉ thị mặc định (AC-7.3, AC-7.4)', () => {
  it('có đủ 6 khoá, mỗi khoá là một mức hợp lệ của chỉ thị đó', () => {
    expect(Object.keys(CHI_THI_MAC_DINH).sort()).toEqual(
      [...ID_MONG_DOI].sort(),
    )
    for (const id of THU_TU_CHI_THI) {
      const cacMuc = CHI_THI[id].cacMuc.map((m) => m.muc as string)
      expect(cacMuc, id).toContain(CHI_THI_MAC_DINH[id] as string)
    }
  })

  it('không sinh ra xung đột nào', () => {
    expect(cacXungDot(CHI_THI_MAC_DINH)).toEqual([])
  })
})

describe('phát hiện xung đột giữa các chỉ thị (AC-7.3)', () => {
  function voi(thayDoi: Partial<BoChiThi>): BoChiThi {
    return { ...CHI_THI_MAC_DINH, ...thayDoi }
  }

  it('bẫy việt vị bật cùng đội hình thấp là xung đột', () => {
    const xungDot = cacXungDot(
      voi({ 'bay-viet-vi': 'bat', 'do-cao-doi-hinh': 'thap' }),
    )
    expect(xungDot).toHaveLength(1)
    expect([...xungDot[0].cacChiThi].sort()).toEqual(
      ['bay-viet-vi', 'do-cao-doi-hinh'].sort(),
    )
    expect(xungDot[0].canhBao.trim().length).toBeGreaterThan(0)
  })

  it('pressing cao cùng đội hình thấp là xung đột', () => {
    const xungDot = cacXungDot(
      voi({ 'cuong-do-pressing': 'cao', 'do-cao-doi-hinh': 'thap' }),
    )
    expect(xungDot).toHaveLength(1)
    expect([...xungDot[0].cacChiThi].sort()).toEqual(
      ['cuong-do-pressing', 'do-cao-doi-hinh'].sort(),
    )
  })

  it('tấn công biên cùng đội hình hẹp là xung đột', () => {
    const xungDot = cacXungDot(
      voi({ 'huong-tan-cong': 'bien', 'do-rong-doi-hinh': 'hep' }),
    )
    expect(xungDot).toHaveLength(1)
    expect([...xungDot[0].cacChiThi].sort()).toEqual(
      ['do-rong-doi-hinh', 'huong-tan-cong'].sort(),
    )
  })

  it('nêu được nhiều xung đột cùng lúc', () => {
    const xungDot = cacXungDot(
      voi({
        'do-cao-doi-hinh': 'thap',
        'bay-viet-vi': 'bat',
        'cuong-do-pressing': 'cao',
        'do-rong-doi-hinh': 'hep',
        'huong-tan-cong': 'bien',
      }),
    )
    expect(xungDot).toHaveLength(3)
  })

  it('bật bẫy việt vị với đội hình cao thì không xung đột', () => {
    expect(
      cacXungDot(voi({ 'bay-viet-vi': 'bat', 'do-cao-doi-hinh': 'cao' })),
    ).toEqual([])
  })

  it('đội hình thấp một mình không phải xung đột', () => {
    expect(cacXungDot(voi({ 'do-cao-doi-hinh': 'thap' }))).toEqual([])
  })
})
