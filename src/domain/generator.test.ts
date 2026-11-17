import { describe, expect, it } from 'vitest'
import { chiSoQuanTrong, GK_CHI_SO_CHUNG } from './attributes'
import { chiSoCanCo, hoSoHoanTat } from './completeness'
import {
  CAC_MUC_DO,
  sinhCauThu,
  sinhChiSo,
  soAoConTrong,
  SO_AO_MAX,
  SO_AO_MIN,
  TUOI_MAX,
  TUOI_MIN,
  type CauThuDaSinh,
  type MucDo,
} from './generator'
import { kiemTraToHopViTri } from './positions'
import { chiSoTongTheoViTri } from './rating'
import { KHO_TEN_ANH, KHO_TEN_VIET } from './tenNgauNhien'
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

/*
  Sinh MỘT cầu thủ đầy đủ (T403, AC-24.1, AC-24.2, AC-24.3).

  Phép kiểm đáng tiền nhất trong khối này là phép kiểm cuối: đội đã dùng hết
  99 số áo. Nó không kiểm một giá trị trả về — nó kiểm rằng hàm **kết thúc**.
  Cách viết tự nhiên nhất ("bốc một số, trùng thì bốc lại") chạy đúng ở mọi
  trường hợp khác và treo vĩnh viễn ở đúng trường hợp này.
*/
describe('sinh một cầu thủ đầy đủ (AC-24.1)', () => {
  function sinh(hatGiong: number, soAoDaDung: readonly number[] = []): CauThuDaSinh {
    const kq = sinhCauThu(
      { muc: 'kha', kho: KHO_TEN_VIET, soAoDaDung },
      rngGia(hatGiong),
    )
    if (!kq.sinhDuoc) throw new Error(`không sinh được: ${kq.lyDo}`)
    return kq.cauThu
  }

  it('không trường bắt buộc nào trống', () => {
    for (const hat of [1, 7, 42, 999]) {
      const c = sinh(hat)
      expect(c.name.trim(), `hạt ${hat}`).not.toBe('')
      expect(c.shirtNumber).toBeGreaterThanOrEqual(SO_AO_MIN)
      expect(c.shirtNumber).toBeLessThanOrEqual(SO_AO_MAX)
      expect(c.age).toBeGreaterThanOrEqual(TUOI_MIN)
      expect(c.age).toBeLessThanOrEqual(TUOI_MAX)
      expect(['trai', 'phai', 'ca-hai']).toContain(c.preferredFoot)
      expect(c.positions.length).toBeGreaterThan(0)
      // Hồ sơ phải ở trạng thái HOÀN TẤT, không chỉ "có vài chỉ số".
      expect(
        hoSoHoanTat({
          positions: c.positions,
          attributes: c.attributes,
          gkAttributes: c.gkAttributes,
        }).hoanTat,
        `hạt ${hat}`,
      ).toBe(true)
    }
  })

  it('tổ hợp vị trí sinh ra luôn hợp lệ', () => {
    for (let hat = 1; hat <= 60; hat += 1) {
      const c = sinh(hat)
      expect(
        kiemTraToHopViTri(c.positions).hopLe,
        `hạt ${hat}: ${c.positions.join('+')}`,
      ).toBe(true)
    }
  })

  it('cùng một nguồn ngẫu nhiên cho cùng một hồ sơ (P1)', () => {
    expect(sinh(42)).toEqual(sinh(42))
  })

  it('hai hạt giống khác nhau cho hai người khác nhau (AC-24.5)', () => {
    expect(sinh(1)).not.toEqual(sinh(2))
  })

  it('kho tên quyết định thứ tiếng của tên, không phải mức hay vị trí', () => {
    const viet = sinhCauThu(
      { muc: 'kha', kho: KHO_TEN_VIET, soAoDaDung: [] },
      rngGia(5),
    )
    const anh = sinhCauThu(
      { muc: 'kha', kho: KHO_TEN_ANH, soAoDaDung: [] },
      rngGia(5),
    )
    if (!viet.sinhDuoc || !anh.sinhDuoc) throw new Error('không sinh được')
    expect(viet.cauThu.name).not.toBe(anh.cauThu.name)
    // Mọi thứ KHÁC tên phải giống hệt: cùng hạt giống, cùng thứ tự lấy số.
    expect({ ...viet.cauThu, name: '' }).toEqual({ ...anh.cauThu, name: '' })
  })

  it('số áo không trùng với danh sách truyền vào (AC-24.3)', () => {
    const daDung = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    for (let hat = 1; hat <= 80; hat += 1) {
      const c = sinh(hat, daDung)
      expect(daDung, `hạt ${hat}`).not.toContain(c.shirtNumber)
    }
  })

  it('còn đúng một số trống thì sinh ra đúng số ấy', () => {
    const daDung: number[] = []
    for (let n = SO_AO_MIN; n <= SO_AO_MAX; n += 1) {
      if (n !== 77) daDung.push(n)
    }
    expect(sinh(3, daDung).shirtNumber).toBe(77)
  })

  it('vị trí khai sẵn thì dùng đúng vị trí ấy, không bốc lại', () => {
    const kq = sinhCauThu(
      { muc: 'kha', kho: KHO_TEN_VIET, soAoDaDung: [], viTri: ['GK'] },
      rngGia(9),
    )
    if (!kq.sinhDuoc) throw new Error('không sinh được')
    expect(kq.cauThu.positions).toEqual(['GK'])
    expect(kq.cauThu.gkAttributes).not.toBeNull()
  })

  it('mức cao hơn cho chỉ số tổng cao hơn ở CÙNG vị trí (AC-24.2)', () => {
    const diem = CAC_MUC_DO.map((m) => {
      const kq = sinhCauThu(
        {
          muc: m.id as MucDo,
          kho: KHO_TEN_VIET,
          soAoDaDung: [],
          viTri: ['DC'],
        },
        rngGia(5),
      )
      if (!kq.sinhDuoc) throw new Error(`mức ${m.id} không sinh được`)
      const tong = chiSoTongTheoViTri(
        {
          attributes: kq.cauThu.attributes,
          gkAttributes: kq.cauThu.gkAttributes,
        },
        'DC',
      )
      if (!tong.tinhDuoc) throw new Error(`mức ${m.id} sinh ra hồ sơ chưa đủ`)
      return { muc: m.id, diem: tong.diem }
    })

    for (let i = 1; i < diem.length; i++) {
      const truoc = diem[i - 1]
      const sau = diem[i]
      if (!truoc || !sau) throw new Error('thiếu mức')
      expect(
        truoc.diem,
        `${truoc.muc} phải cao hơn ${sau.muc}`,
      ).toBeGreaterThan(sau.diem)
    }
  })

  it('mọi chỉ số nằm trong 1..20 ở cả bốn mức', () => {
    for (const muc of CAC_MUC_DO) {
      for (const viTri of ['GK', 'DC', 'ST'] as const) {
        const kq = sinhCauThu(
          {
            muc: muc.id as MucDo,
            kho: KHO_TEN_VIET,
            soAoDaDung: [],
            viTri: [viTri],
          },
          rngGia(17),
        )
        if (!kq.sinhDuoc) throw new Error(`${muc.id}/${viTri} không sinh được`)
        for (const v of [
          ...Object.values(kq.cauThu.attributes),
          ...Object.values(kq.cauThu.gkAttributes ?? {}),
        ]) {
          expect(v, `${muc.id}/${viTri}`).toBeGreaterThanOrEqual(CHI_SO_MIN)
          expect(v, `${muc.id}/${viTri}`).toBeLessThanOrEqual(CHI_SO_MAX)
        }
      }
    }
  })

  it('hết số áo thì TRẢ VỀ lý do, không treo', () => {
    const hetSo: number[] = []
    for (let n = SO_AO_MIN; n <= SO_AO_MAX; n += 1) hetSo.push(n)

    const kq = sinhCauThu(
      { muc: 'kha', kho: KHO_TEN_VIET, soAoDaDung: hetSo },
      rngGia(1),
    )
    expect(kq.sinhDuoc).toBe(false)
    if (kq.sinhDuoc) throw new Error('đáng ra phải từ chối')
    expect(kq.lyDo).toBe('het-so-ao')
  })

  it('soAoConTrong loại đúng những số đang dùng', () => {
    expect(soAoConTrong([]).length).toBe(SO_AO_MAX - SO_AO_MIN + 1)
    const conLai = soAoConTrong([1, 50, 99])
    expect(conLai).not.toContain(1)
    expect(conLai).not.toContain(50)
    expect(conLai).not.toContain(99)
    expect(conLai.length).toBe(SO_AO_MAX - SO_AO_MIN + 1 - 3)
    // Số ngoài dải không làm hỏng phép lọc.
    expect(soAoConTrong([0, 100, -5]).length).toBe(SO_AO_MAX - SO_AO_MIN + 1)
  })
})
