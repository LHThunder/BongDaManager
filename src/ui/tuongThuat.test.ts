import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import type { LoaiSuKien, SuKien } from '../engine/suKien'
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

/**
 * Tên có dấu ngoặc để so khớp an toàn: id `A-1` là tiền tố của `A-18`, nên
 * `cau.includes('A-1')` trần sẽ khớp nhầm sang người khác.
 */
const the = (id: string) => `«${id}»`

/** Đếm số tên đã được chèn vào câu, để bắt việc gọi tên người ngoài dòng. */
function soLanCoDau(cau: string): number {
  return (cau.match(/«/g) ?? []).length
}
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
      const cau = dungCauTuongThuat(sk, the, tenDoi)
      /*
        Không đòi câu phải gọi tên `cacCauThu[0]` nữa: pha cướp bóng gọi tên
        người ĐOẠT được bóng, tức người thứ hai, của đội kia (T134). Điều
        phải luôn đúng là câu gọi tên MỘT NGƯỜI CÓ TRONG DÒNG — không bỏ
        trống, và không gọi tên ai ngoài dòng.
      */
      const nhacToi = sk.cacCauThu.filter((id) => cau.includes(the(id)))
      expect(nhacToi.length, `${sk.loai}: ${cau}`).toBeGreaterThan(0)
      expect(soLanCoDau(cau), `${sk.loai}: ${cau}`).toBe(nhacToi.length)
    }
  })
})

/*
  Phép kiểm cốt lõi của T134: câu chữ và bảng thống kê phải nói về CÙNG một
  người cho cùng một pha.

  Trước T134 chúng nói về hai người khác nhau ở những pha mất bóng, và không
  phép kiểm nào thấy — vì mỗi bên được kiểm riêng. Dùng tên có dấu ngoặc kép
  để so khớp an toàn: id `A-1` là tiền tố của `A-18`, nên `includes('A-1')`
  trần sẽ khớp nhầm.
*/
describe('câu chữ khớp với bảng thống kê (T134)', () => {
  /*
    Mỗi người được gọi tên phải có CĂN CỨ trong bảng thống kê của chính mình.

    Hai hình dạng hợp lệ, vì loại `mat-bong` đang gánh hai thứ khác nhau:
      - pha mất bóng thật: người của đội trong dòng có `matBong`, người của
        đội kia có `cuopBong`;
      - pha phạm lỗi: engine chưa có loại sự kiện riêng cho nó nên nó cũng ra
        dòng `mat-bong`, và lúc đó người của đội kia có `phamLoi` còn người
        của đội trong dòng KHÔNG có `matBong` — câu "để mất bóng trong chân"
        khi ấy kể sai chuyện. Xem T135.
  */
  it('mỗi người được gọi tên trong pha mất bóng đều có căn cứ thống kê', () => {
    let soMatBongThat = 0
    let soPhamLoi = 0

    for (const ma of MA_TRAN_CO_DINH) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))

      for (const sk of dongSuKien(tt)) {
        if (sk.loai !== 'mat-bong' && sk.loai !== 'cuop-bong-cao') continue
        const cau = dungCauTuongThuat(sk, the, tenDoi)
        const benKia = sk.doi === 'nha' ? 'khach' : 'nha'

        const laPhamLoi = sk.cacCauThu.some(
          (id) => (tt.ben[benKia].thongKe.theoCauThu[id]?.phamLoi ?? 0) > 0,
        )

        for (const id of sk.cacCauThu) {
          if (!cau.includes(the(id))) continue

          const cuaDoiDong = tt.ben[sk.doi].thongKe.theoCauThu[id]
          if (cuaDoiDong) {
            if (laPhamLoi) {
              soPhamLoi += 1
              continue
            }
            soMatBongThat += 1
            expect(cuaDoiDong.matBong, `${ma}: ${cau}`).toBeGreaterThan(0)
            continue
          }

          const tk = tt.ben[benKia].thongKe.theoCauThu[id]
          const cuopBong = tk?.cuopBong ?? 0
          const phamLoi = tk?.phamLoi ?? 0
          if (phamLoi > 0 && cuopBong === 0) soPhamLoi += 1
          else soMatBongThat += 1

          expect(cuopBong + phamLoi, `${ma}: ${cau}`).toBeGreaterThan(0)
        }
      }
    }

    expect(soMatBongThat).toBeGreaterThan(0)
    // Chốt để T135 không bị quên: đường phạm lỗi CÓ thật và đang đi nhầm chỗ.
    expect(soPhamLoi).toBeGreaterThan(0)
  })

  it('pha ghi bàn gọi đúng người ghi bàn', () => {
    let soBan = 0

    for (const ma of MA_TRAN_CO_DINH) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))

      for (const sk of dongSuKien(tt)) {
        if (sk.loai !== 'ban-thang') continue
        soBan += 1
        const cau = dungCauTuongThuat(sk, the, tenDoi)

        for (const id of sk.cacCauThu) {
          if (!cau.includes(the(id))) continue
          const tk = tt.ben[sk.doi].thongKe.theoCauThu[id]
          expect(tk?.banThang ?? 0, `${ma}: ${cau}`).toBeGreaterThan(0)
        }
      }
    }

    expect(soBan).toBeGreaterThan(0)
  })

  it('câu thay người phân biệt được người vào và người ra', () => {
    const dong: SuKien = {
      phut: 60,
      buGio: false,
      loai: 'thay-nguoi',
      doi: 'nha',
      cacCauThu: ['NGUOI-VAO', 'NGUOI-RA'],
      vung: null,
      duongBong: [],
      mauCau: 0,
      tiSoSauDo: { nha: 0, khach: 0 },
    }

    const cacCau = [0, 1, 2, 3].map((mauCau) =>
      dungCauTuongThuat({ ...dong, mauCau }, the, tenDoi),
    )

    // Không mẫu nào được nói người VÀO là người rời sân.
    for (const cau of cacCau) {
      expect(cau).not.toMatch(/«NGUOI-VAO» rời sân/)
    }

    const cauCoCaHai = cacCau.filter(
      (c) => c.includes(the('NGUOI-VAO')) && c.includes(the('NGUOI-RA')),
    )
    expect(cauCoCaHai.length).toBeGreaterThanOrEqual(2)
    expect(cacCau[2]).toContain('«NGUOI-RA» rời sân')
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
  Tầng 2 (80 trận): loại nào xuất hiện nhiều thì phải dùng ít nhất 4 mẫu.

  Vì sao 80 chứ không 20: `the-do` là loại thưa nhất, chỉ chừng **0,49 dòng
  mỗi trận** (đo trên 200 trận: 97 dòng). Ở 20 trận nó xuất hiện khoảng 13
  lần, và đòi đủ 4 mẫu khác nhau từ 13 lần rút là phép có chừng 3% khả năng
  đỏ oan — nó đã đỏ thật hai lần khi T102 đổi dãy số (13 dòng/3 mẫu, rồi 17
  dòng/3 mẫu). Đã kiểm phân bố chỉ số mẫu câu trên 200 trận: 24/18/30/25 trên
  bốn mẫu, tức ĐỀU — không có mẫu nào bị bỏ quên, chỉ là mẫu test quá nhỏ.

  Ngưỡng "4 mẫu" KHÔNG đổi. Và chính AC-8.16 nói về **5 trận liên tiếp**, phần
  mà tầng 1 kiểm; tầng 2 là phép mạnh hơn do dự án tự đặt thêm.
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

  it('qua 80 trận, loại nào xuất hiện từ 10 lần đều dùng ít nhất 4 mẫu câu', () => {
    const { mauDaDung, soLan } = demMauTheoLoai(80)

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
