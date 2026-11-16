import { describe, expect, it } from 'vitest'
import { BO_CHUOI, dauThieuBanDich, type BoChuoi } from './index'
import { CAU_LUI_EN, MAU_EN } from './mauCau.en'
import { CAU_LUI_VI, MAU_VI } from './mauCau.vi'

/*
  Lớp lưới THỨ NHẤT của AC-22.2: phép kiểm chặn trước khi phát hành (T321).

  Kiểu `BanDich<T>` đã chặn phần lớn — thiếu khoá, thừa khoá, đổi một chuỗi
  thành hàm đều là lỗi biên dịch. Nhưng kiểu không với tới ba chỗ:

  - **Bảng chỉ mục** (`Readonly<Record<string, string>>`): kiểu không biết
    tập khoá, nên bản này có `'o-khong-ton-tai'` mà bản kia thiếu vẫn biên
    dịch sạch. Đây là chỗ nguy hiểm nhất, vì nó chỉ lộ ra đúng lúc người
    dùng gặp cái lỗi ấy.
  - **Chuỗi rỗng**: `''` thoả kiểu `string`. Một khoá bỏ trống trông như đã
    dịch, nhưng trên màn hình là một chỗ trắng.
  - **Chuỗi chưa dịch**: bản tiếng Anh sao chép y nguyên câu tiếng Việt thì
    kiểu không thấy gì sai. Phép kiểm cuối của tệp này bắt nó bằng dấu
    tiếng Việt.

  Phép kiểm đi ĐỆ QUY trên cả hai bộ chuỗi thật, nên khối mới thêm sau này
  tự động được quét — không phải nhớ bổ sung vào một danh sách.
*/

const DAU_TIENG_VIET = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i

/** Những khoá cố tình viết y hệt ở hai ngôn ngữ, vì chúng là KÝ HIỆU. */
const KY_HIEU_DUNG_CHUNG: readonly string[] = [
  // Tên sơ đồ là dãy số: 4-4-2 viết thế ở mọi thứ tiếng (D75).
  'TEN_SO_DO',
  // Dấu tam giác cho người đang tham gia tình huống.
  'SAN_2D.dauThamGia',
  /*
    Tên một ngôn ngữ viết bằng CHÍNH ngôn ngữ ấy, ở cả hai bản: người đang
    đọc màn hình tiếng Anh mà muốn chuyển sang tiếng Việt thì phải nhận ra
    chữ "Tiếng Việt". Dịch thành "Vietnamese" là làm nút khó tìm hơn.
  */
  'NGON_NGU.vi',
]

type Cay = Readonly<Record<string, unknown>>

/** Mọi đường dẫn khoá của một khối, dạng `KHOI.a.b`. */
function cacDuongDan(nut: unknown, goc: string): readonly string[] {
  if (nut === null || typeof nut !== 'object') return [goc]
  if (nut instanceof Set || nut instanceof Map || Array.isArray(nut)) {
    return [goc]
  }
  const ra: string[] = []
  for (const khoa of Object.keys(nut as Cay)) {
    ra.push(...cacDuongDan((nut as Cay)[khoa], `${goc}.${khoa}`))
  }
  return ra
}

function tra(bo: BoChuoi, duongDan: string): unknown {
  let nut: unknown = bo
  for (const khoa of duongDan.split('.')) {
    nut = (nut as Cay)[khoa]
  }
  return nut
}

const TEN_KHOI = Object.keys(BO_CHUOI.vi) as readonly (keyof BoChuoi)[]

describe('hai bộ chuỗi có cùng tập khoá (AC-22.2)', () => {
  it('có đủ khối ở cả hai ngôn ngữ', () => {
    expect(Object.keys(BO_CHUOI.en).sort()).toEqual([...TEN_KHOI].sort())
  })

  for (const khoi of TEN_KHOI) {
    it(`${khoi}: không khoá nào lệch`, () => {
      const vi = cacDuongDan(BO_CHUOI.vi[khoi], khoi)
      const en = cacDuongDan(BO_CHUOI.en[khoi], khoi)
      expect([...en].sort()).toEqual([...vi].sort())
    })
  }
})

describe('không khoá nào rỗng, và chuỗi vẫn là chuỗi (AC-22.1)', () => {
  for (const ngonNgu of ['vi', 'en'] as const) {
    for (const khoi of TEN_KHOI) {
      it(`${ngonNgu}/${khoi}`, () => {
        const bo = BO_CHUOI[ngonNgu]
        for (const duongDan of cacDuongDan(bo[khoi], khoi)) {
          const giaTri = tra(bo, duongDan)
          /*
            Hàm sinh câu không gọi được ở đây vì mỗi hàm một chữ ký; kiểu đã
            buộc hai bản cùng chữ ký, nên chỗ này chỉ cần biết nó là hàm.
          */
          if (typeof giaTri === 'function') continue
          if (giaTri instanceof Set) {
            expect(giaTri.size, duongDan).toBeGreaterThan(0)
            continue
          }
          expect(typeof giaTri, duongDan).toBe('string')
          expect((giaTri as string).trim(), duongDan).not.toBe('')
        }
      })
    }
  }
})

describe('cùng một khoá thì cùng một kiểu ở hai ngôn ngữ', () => {
  for (const khoi of TEN_KHOI) {
    it(`${khoi}`, () => {
      for (const duongDan of cacDuongDan(BO_CHUOI.vi[khoi], khoi)) {
        const kieuVi = typeof tra(BO_CHUOI.vi, duongDan)
        const kieuEn = typeof tra(BO_CHUOI.en, duongDan)
        expect(kieuEn, duongDan).toBe(kieuVi)
      }
    })
  }
})

/*
  Phép kiểm này bắt đúng cái lỗi dễ xảy ra nhất khi thêm khoá mới: khai ở
  bản tiếng Anh nhưng dán tạm câu tiếng Việt vào rồi quên dịch. Kiểu không
  thấy gì sai, mà trên màn hình tiếng Anh thì lộ ngay — nên nó phải đỏ ở
  đây, trước khi phát hành (AC-22.2).
*/
describe('bản tiếng Anh không còn chữ tiếng Việt (AC-22.1)', () => {
  for (const khoi of TEN_KHOI) {
    if (KY_HIEU_DUNG_CHUNG.includes(khoi)) continue
    it(`${khoi}`, () => {
      for (const duongDan of cacDuongDan(BO_CHUOI.en[khoi], khoi)) {
        if (KY_HIEU_DUNG_CHUNG.some((x) => duongDan.startsWith(x))) continue
        const giaTri = tra(BO_CHUOI.en, duongDan)
        if (typeof giaTri !== 'string') continue
        expect(DAU_TIENG_VIET.test(giaTri), `${duongDan}: ${giaTri}`).toBe(
          false,
        )
      }
    })
  }
})

/*
  Hai bảng mẫu câu tường thuật: D69 chốt chúng phải CÙNG ĐỘ DÀI mỗi loại,
  để AC-18.2 đạt bằng cấu trúc chứ không bằng rà tay. Kiểu `CungSoMau` đã
  buộc điều đó lúc biên dịch; phép kiểm này giữ lại khẳng định ấy ở dạng đọc
  được, và thêm phần kiểu không với tới: câu lùi cũng phải có cả hai bản.
*/
describe('hai bảng mẫu câu khớp nhau (AC-18.2)', () => {
  it('cùng tập loại sự kiện', () => {
    expect(Object.keys(MAU_EN).sort()).toEqual(Object.keys(MAU_VI).sort())
  })

  it('mỗi loại có cùng số mẫu ở hai ngôn ngữ', () => {
    for (const loai of Object.keys(MAU_VI)) {
      const vi = MAU_VI[loai as keyof typeof MAU_VI]
      const en = MAU_EN[loai as keyof typeof MAU_EN]
      expect(en.length, loai).toBe(vi.length)
    }
  })

  it('câu lùi có cả hai bản', () => {
    expect(typeof CAU_LUI_VI).toBe('function')
    expect(typeof CAU_LUI_EN).toBe('function')
  })
})

/*
  Lớp lưới THỨ HAI của AC-22.2 (T322): tra một khoá không có bản dịch thì
  thấy dấu hiệu, chứ không âm thầm rơi về ngôn ngữ kia và không vỡ màn hình.

  Những phép tra dưới đây cố tình đi qua `as` — đúng cái cửa mà kiểu không
  khoá được: bảng chỉ mục tra bằng mã do lớp dưới phát ra.
*/
describe('thiếu bản dịch thì lộ ra lúc chạy (AC-22.2)', () => {
  const traLa = (khoi: unknown, khoa: string): unknown =>
    (khoi as Readonly<Record<string, unknown>>)[khoa]

  it('bảng chỉ mục: mã lạ cho dấu hiệu, không cho undefined', () => {
    const ra = traLa(BO_CHUOI.en.LY_DO_TU_CHOI_CAN_THIEP, 'ma-chua-co-cau')
    expect(ra).toBe(dauThieuBanDich('LY_DO_TU_CHOI_CAN_THIEP.ma-chua-co-cau'))
  })

  it('khối lồng: dấu hiệu nêu đủ đường dẫn khoá', () => {
    const ra = traLa(BO_CHUOI.en.LICH_SU.lyDoKhongDauLai, 'ly-do-moi')
    expect(ra).toBe(dauThieuBanDich('LICH_SU.lyDoKhongDauLai.ly-do-moi'))
  })

  it('KHÔNG rơi về ngôn ngữ kia', () => {
    const ra = String(traLa(BO_CHUOI.en.CHUNG, 'khoaKhongTonTai'))
    for (const chuoi of Object.values(BO_CHUOI.vi.CHUNG)) {
      if (typeof chuoi === 'string') expect(ra).not.toBe(chuoi)
    }
  })

  it('KHÔNG ném lỗi', () => {
    expect(() => traLa(BO_CHUOI.vi.TRAN_DAU, 'khongCo')).not.toThrow()
  })

  it('khoá CÓ bản dịch vẫn trả về đúng chuỗi ấy', () => {
    expect(BO_CHUOI.en.CHUNG.huy).not.toContain('thiếu')
    expect(BO_CHUOI.en.LY_DO_TU_CHOI_CAN_THIEP['het-luot-thay']).toBe(
      'There are no substitutions left.',
    )
  })

  /*
    Lớp bọc chỉ chặn `get`, nên nó không được che mắt lớp lưới thứ nhất:
    duyệt khoá vẫn phải ra đúng tập khoá thật.
  */
  it('không che mắt phép duyệt khoá', () => {
    expect(Object.keys(BO_CHUOI.en.LUU_TRU)).toEqual(
      Object.keys(BO_CHUOI.vi.LUU_TRU),
    )
    expect('khongCo' in BO_CHUOI.en.LUU_TRU).toBe(false)
  })

  it('Set trong khối vẫn dùng được', () => {
    expect(BO_CHUOI.en.BAO_CAO_SAU_TRAN.tieuChiTheoPhanTram.has('ti-le-chuyen')).toBe(
      true,
    )
  })
})
