import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import type { LoaiSuKien } from '../engine/suKien'
import { chayHetTran, dongSuKien, taoTran } from '../engine/tran'
import { dungCauTuongThuat, soMauCau } from './tuongThuat'

const MOI_LOAI: LoaiSuKien[] = [
  'bat-dau',
  'ban-thang',
  'co-hoi',
  'cuu-thua',
  'tat-canh',
  'cuop-bong-cao',
  'thoat-xuong',
  'mat-bong',
  'the-vang',
  'the-do',
  'thay-nguoi',
  'kiet-suc',
  'het-hiep',
  'ket-thuc',
]

const tenCauThu = (id: string) => `Cầu thủ ${id}`
const tenDoi = (ben: 'nha' | 'khach') => (ben === 'nha' ? 'Đội Nhà' : 'Đội Khách')

/** Dòng tường thuật của n trận liên tiếp, kèm loại sự kiện của từng dòng. */
function dongCuaNhieuTran(soTran: number) {
  const ra: { loai: LoaiSuKien; cau: string }[] = []
  for (let i = 0; i < soTran; i += 1) {
    const ma =
      MA_TRAN_CO_DINH[i] ?? `Z${String(i).padStart(4, '0')}XQ4B`
    const tt = chayHetTran(taoTran(cauHinhMau(ma)))
    for (const sk of dongSuKien(tt)) {
      ra.push({ loai: sk.loai, cau: dungCauTuongThuat(sk, tenCauThu, tenDoi) })
    }
  }
  return ra
}

describe('bảng mẫu câu (AC-8.16)', () => {
  it('mỗi loại sự kiện có ít nhất 4 mẫu câu', () => {
    for (const loai of MOI_LOAI) {
      expect(soMauCau(loai), loai).toBeGreaterThanOrEqual(4)
    }
  })

  it('câu dựng ra luôn không rỗng và kết thúc bằng dấu câu', () => {
    for (const { cau, loai } of dongCuaNhieuTran(3)) {
      expect(cau.trim().length, loai).toBeGreaterThan(0)
      expect(cau.trim(), loai).toMatch(/[.!?]$/)
    }
  })

  it('chèn đúng tên cầu thủ vào câu', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA_TRAN_CO_DINH[0])))
    const coTen = dongSuKien(tt).filter((s) => s.cacCauThu.length > 0)

    expect(coTen.length).toBeGreaterThan(0)
    for (const sk of coTen) {
      const cau = dungCauTuongThuat(sk, tenCauThu, tenDoi)
      expect(cau, sk.loai).toContain(tenCauThu(sk.cacCauThu[0]))
    }
  })
})

/*
  Phép kiểm chính của AC-8.16: một loại tình huống không được kể bằng MỘT câu
  cố định.

  Ngưỡng chia hai tầng, vì bản đầu của test này đòi "5 trận phải dùng đủ 4 mẫu
  câu" và đó là ngưỡng sai về thống kê: rút 5 lần từ 4 mẫu thì kỳ vọng chỉ ra
  khoảng 3 mẫu khác nhau. Đo thật cho thấy cùng một bảng mẫu câu, bộ 5 mã này
  ra 4 mẫu còn bộ khác ra 2 — tức là test tự bấp bênh, không phải engine kém.

  Tầng 1 (5 trận, đúng khung AC nói): không loại nào bị kẹt ở một câu duy nhất.
  Tầng 2 (20 trận): loại nào xuất hiện nhiều thì phải dùng ít nhất 4 mẫu.
*/
function demMauTheoLoai(soTran: number) {
  const mauDaDung = new Map<LoaiSuKien, Set<string>>()
  const soLan = new Map<LoaiSuKien, number>()

  for (const { loai, cau } of dongCuaNhieuTran(soTran)) {
    // Bỏ tên riêng và tên đội để đếm theo MẪU CÂU, không đếm theo chữ.
    const mau = cau
      .replace(/Cầu thủ [A-Za-z0-9-]+/g, '{}')
      .replace(/Đội (Nhà|Khách)/g, '{}')
    if (!mauDaDung.has(loai)) mauDaDung.set(loai, new Set())
    mauDaDung.get(loai)?.add(mau)
    soLan.set(loai, (soLan.get(loai) ?? 0) + 1)
  }

  return { mauDaDung, soLan }
}

describe('không loại nào bị kể bằng một câu cố định (AC-8.16)', () => {
  it('qua 5 trận liên tiếp, loại nào xuất hiện từ 3 lần đều có ít nhất 2 cách kể', () => {
    const { mauDaDung, soLan } = demMauTheoLoai(5)

    let daKiem = 0
    for (const [loai, n] of soLan) {
      if (n < 3) continue
      daKiem += 1
      expect(
        mauDaDung.get(loai)?.size ?? 0,
        `${loai}: ${n} dòng mà chỉ một cách kể`,
      ).toBeGreaterThanOrEqual(2)
    }
    expect(daKiem, 'không loại nào đủ 3 lần để kiểm').toBeGreaterThan(3)
  })

  it('qua 20 trận, loại nào xuất hiện từ 10 lần đều dùng ít nhất 4 mẫu câu', () => {
    const { mauDaDung, soLan } = demMauTheoLoai(20)

    let daKiem = 0
    for (const [loai, n] of soLan) {
      if (n < 10) continue
      daKiem += 1
      expect(
        mauDaDung.get(loai)?.size ?? 0,
        `${loai}: ${n} dòng nhưng chỉ ${mauDaDung.get(loai)?.size} mẫu câu`,
      ).toBeGreaterThanOrEqual(4)
    }
    expect(daKiem).toBeGreaterThan(5)
  })

  it('cùng một trận xem hai lần ra đúng từng chữ (AC-8.11)', () => {
    const cau = () =>
      dongSuKien(chayHetTran(taoTran(cauHinhMau(MA_TRAN_CO_DINH[0])))).map(
        (s) => dungCauTuongThuat(s, tenCauThu, tenDoi),
      )
    expect(cau()).toEqual(cau())
  })
})
