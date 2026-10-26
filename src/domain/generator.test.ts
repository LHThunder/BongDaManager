import { describe, expect, it } from 'vitest'
import { chiSoQuanTrong, GK_CHI_SO_CHUNG } from './attributes'
import { chiSoCanCo } from './completeness'
import { CAC_MUC_DO, sinhChiSo, type MucDo } from './generator'
import { chiSoTongTheoViTri } from './rating'
import { CHI_SO_MAX, CHI_SO_MIN, type AttributeId, type Rng } from './types'

/** Nguồn ngẫu nhiên giả, cho cùng chuỗi số với cùng hạt giống (P1). */
function rngGia(hatGiong: number): Rng {
  let s = hatGiong >>> 0
  return {
    next() {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    },
  }
}

function trungBinh(cacGiaTri: number[]): number {
  return cacGiaTri.reduce((a, b) => a + b, 0) / cacGiaTri.length
}

const NGUON_SOURCE = import.meta.glob('./generator.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('sinh nhanh chỉ số (AC-2.9)', () => {
  it('cùng một nguồn ngẫu nhiên thì hai lần gọi cho ra kết quả giống hệt (P1)', () => {
    const a = sinhChiSo('kha', ['DC'], rngGia(42))
    const b = sinhChiSo('kha', ['DC'], rngGia(42))
    expect(a).toEqual(b)
  })

  it('hai hạt giống khác nhau cho ra kết quả khác nhau', () => {
    const a = sinhChiSo('kha', ['DC'], rngGia(1))
    const b = sinhChiSo('kha', ['DC'], rngGia(999))
    expect(a).not.toEqual(b)
  })

  it('không gọi Math.random bên trong — nguồn ngẫu nhiên phải truyền vào', () => {
    const source = Object.values(NGUON_SOURCE)[0]
    expect(source, 'không đọc được source của generator.ts').toBeTruthy()

    // Bỏ comment trước khi kiểm: phần giải thích được phép NHẮC tới
    // Math.random, chỉ code mới không được gọi nó.
    const chiCode = (source ?? '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    expect(chiCode).not.toContain('Math.random')
    expect(chiCode).not.toContain('Date.now')
    expect(chiCode).not.toContain('crypto.getRandomValues')
  })

  it('điền đủ đúng những ô mà vị trí cần', () => {
    const san = sinhChiSo('kha', ['DC'], rngGia(7))
    expect(Object.keys(san.attributes)).toHaveLength(15)
    expect(san.gkAttributes).toBeNull()

    const thuMon = sinhChiSo('kha', ['GK'], rngGia(7))
    expect(Object.keys(thuMon.attributes)).toHaveLength(8)
    expect(Object.keys(thuMon.attributes).sort()).toEqual(
      [...GK_CHI_SO_CHUNG].sort(),
    )
    expect(Object.keys(thuMon.gkAttributes ?? {})).toHaveLength(3)
  })

  it('mọi giá trị nằm trong 1..20', () => {
    for (const muc of CAC_MUC_DO) {
      for (const viTri of ['GK', 'DC', 'ST'] as const) {
        const ra = sinhChiSo(muc.id, [viTri], rngGia(3))
        const tatCa = [
          ...Object.values(ra.attributes),
          ...Object.values(ra.gkAttributes ?? {}),
        ]
        for (const v of tatCa) {
          expect(v, `${muc.id}/${viTri}`).toBeGreaterThanOrEqual(CHI_SO_MIN)
          expect(v, `${muc.id}/${viTri}`).toBeLessThanOrEqual(CHI_SO_MAX)
          expect(Number.isInteger(v)).toBe(true)
        }
      }
    }
  })

  it('chỉ số quan trọng của vị trí cao hơn rõ rệt chỉ số không liên quan', () => {
    const ra = sinhChiSo('kha', ['DC'], rngGia(11))
    const quanTrong = new Set<string>(chiSoQuanTrong('DC').attributes)

    const cao: number[] = []
    const thap: number[] = []
    for (const id of chiSoCanCo(['DC']).attributes) {
      const v = ra.attributes[id as AttributeId]
      if (v === undefined) throw new Error(`thiếu ${id}`)
      if (quanTrong.has(id)) cao.push(v)
      else thap.push(v)
    }

    expect(cao.length).toBeGreaterThan(0)
    expect(thap.length).toBeGreaterThan(0)
    expect(trungBinh(cao) - trungBinh(thap)).toBeGreaterThan(2)
  })

  it('bốn mức xếp theo đúng thứ tự khi so chỉ số tổng', () => {
    const diem = CAC_MUC_DO.map((m) => {
      const ra = sinhChiSo(m.id as MucDo, ['DC'], rngGia(5))
      const kq = chiSoTongTheoViTri(
        { attributes: ra.attributes, gkAttributes: ra.gkAttributes },
        'DC',
      )
      if (!kq.tinhDuoc) throw new Error(`mức ${m.id} sinh ra hồ sơ chưa đủ`)
      return { muc: m.id, diem: kq.diem }
    })

    expect(diem.map((d) => d.muc)).toEqual([
      'ngoi-sao',
      'kha',
      'trung-binh',
      'yeu',
    ])
    for (let i = 1; i < diem.length; i++) {
      const truoc = diem[i - 1]
      const sau = diem[i]
      if (!truoc || !sau) throw new Error('thiếu mức')
      expect(truoc.diem, `${truoc.muc} phải cao hơn ${sau.muc}`).toBeGreaterThan(
        sau.diem,
      )
    }
  })

  it('cầu thủ hai vị trí mạnh ở chỉ số quan trọng của cả hai', () => {
    const ra = sinhChiSo('kha', ['DC', 'MC'], rngGia(21))

    // Kèm người là chỉ số quan trọng của trung vệ, Nhãn quan của tiền vệ
    // trung tâm. Cầu thủ đá được cả hai thì không được yếu ở cái nào.
    const kemNguoi = ra.attributes['kem-nguoi']
    const nhanQuan = ra.attributes['nhan-quan']
    const sutXa = ra.attributes['sut-xa']
    if (kemNguoi === undefined || nhanQuan === undefined || sutXa === undefined) {
      throw new Error('thiếu chỉ số')
    }

    expect(kemNguoi).toBeGreaterThan(sutXa)
    expect(nhanQuan).toBeGreaterThan(sutXa)
  })

  it('sinh chỉ số cho tổ hợp vị trí không hợp lệ thì bị từ chối', () => {
    expect(() => sinhChiSo('kha', ['GK', 'DC'], rngGia(1))).toThrow()
  })

  it('hồ sơ sinh ra luôn ở trạng thái hoàn tất', () => {
    for (const viTri of ['GK', 'DC', 'ST', 'AM'] as const) {
      const ra = sinhChiSo('trung-binh', [viTri], rngGia(13))
      const canCo = chiSoCanCo([viTri])
      for (const id of canCo.attributes) {
        expect(ra.attributes[id], `${viTri}/${id}`).toBeDefined()
      }
      for (const id of canCo.gkAttributes) {
        expect(ra.gkAttributes?.[id], `${viTri}/${id}`).toBeDefined()
      }
    }
  })
})
