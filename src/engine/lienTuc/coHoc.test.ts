import { describe, expect, it } from 'vitest'
import {
  TOC_DO_TOI_DA_CAO,
  TOC_DO_TOI_DA_THAP,
  TRAN_TOC_DO_TUYET_DOI,
  tocDoToiDa,
} from './coHoc'

/*
  Tốc độ tối đa theo chỉ số (T710, AC-38.1, quyết định D129).

  Phép kiểm cuối cùng của khối này là phép kiểm **có răng** nhất: nó quét chính
  mã nguồn của `coHoc.ts` và đỏ nếu có một đường nào đọc sức bền. Điều kiện ra
  của T710 viết nó thành một lệnh `grep` chạy tay; viết thành phép kiểm thì nó
  còn sống sau khi người chạy lệnh ấy đi mất.
*/

const CAC_CHI_SO = Array.from({ length: 20 }, (_, i) => i + 1)

describe('tocDoToiDa theo chỉ số (T710, AC-38.1)', () => {
  it('mọi chỉ số 1–20 cho tốc độ trong [0; 9] m/s', () => {
    for (const chiSo of CAC_CHI_SO) {
      const v = tocDoToiDa(chiSo)
      expect(v, `chỉ số ${chiSo}`).toBeGreaterThanOrEqual(0)
      expect(v, `chỉ số ${chiSo}`).toBeLessThanOrEqual(TRAN_TOC_DO_TUYET_DOI)
    }
  })

  /*
    Ca chống tầm thường. Mệnh đề "trong [0; 9]" một mình quá dễ thoả — một hàm
    trả về hằng 0 cũng xanh. Ba khẳng định dưới đây ghim cả hai đầu dải và
    chiều đi của nó.
  */
  it('hai đầu dải đúng, và tốc độ TĂNG theo chỉ số', () => {
    expect(tocDoToiDa(1)).toBeCloseTo(TOC_DO_TOI_DA_THAP, 10)
    expect(tocDoToiDa(20)).toBeCloseTo(TOC_DO_TOI_DA_CAO, 10)

    for (let chiSo = 2; chiSo <= 20; chiSo += 1) {
      expect(
        tocDoToiDa(chiSo),
        `chỉ số ${chiSo} phải nhanh hơn ${chiSo - 1}`,
      ).toBeGreaterThan(tocDoToiDa(chiSo - 1))
    }
  })

  it('chỉ số chưa điền coi như 10, cho 7,442 m/s', () => {
    expect(tocDoToiDa(undefined)).toBeCloseTo(7.442105263157895, 10)
    expect(tocDoToiDa(undefined)).toBe(tocDoToiDa(10))
  })

  it('chỉ số ngoài dải bị KẸP, không ngoại suy', () => {
    expect(tocDoToiDa(0)).toBe(tocDoToiDa(1))
    expect(tocDoToiDa(-5)).toBe(tocDoToiDa(1))
    expect(tocDoToiDa(21)).toBe(tocDoToiDa(20))
    expect(tocDoToiDa(999)).toBe(tocDoToiDa(20))
  })

  /*
    Lề dưới trần tuyệt đối, và vì sao nó phải có (D129).

    Phép kiểm cơ học đo tốc độ bằng `Δquãng / Δt` trên tệp xuất, nên nếu đỉnh
    dải ghim đúng 9,0 thì nó sẽ đỏ vì **làm tròn** chứ không vì mô hình sai.
    4,4% là lề đã chốt; khẳng định nó ở đây để một lần "tối ưu" sau không lặng
    lẽ ăn mất.
  */
  it('đỉnh dải để lại lề 4,4% dưới trần tuyệt đối', () => {
    const le = (TRAN_TOC_DO_TUYET_DOI - TOC_DO_TOI_DA_CAO) / TRAN_TOC_DO_TUYET_DOI
    expect(le).toBeGreaterThan(0.04)
    expect(TOC_DO_TOI_DA_CAO).toBeLessThan(TRAN_TOC_DO_TUYET_DOI)
  })

  /*
    Sàn dải phải nằm TRÊN ngưỡng 6 m/s mà AC-38.8 canh.

    Nếu sàn tụt xuống dưới 6 thì những cầu thủ chậm nhất không bao giờ vào tập
    mà AC-38.8 đo, và AC ấy sẽ xanh vì **rỗng** chứ không vì đúng. Đây chính là
    lý do D129 loại phương án nhân tốc độ với sức bền.
  */
  it('sàn dải nằm TRÊN ngưỡng 6 m/s mà AC-38.8 canh', () => {
    expect(TOC_DO_TOI_DA_THAP).toBeGreaterThan(6)
    expect(Math.min(...CAC_CHI_SO.map(tocDoToiDa))).toBeGreaterThan(6)
  })
})

describe('coHoc.ts KHÔNG đọc sức bền (T710, quyết định D129)', () => {
  const NGUON = import.meta.glob('./coHoc.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  /** Bóc chú thích khối và chú thích dòng, đúng khuôn `chiCode` của `rng.test.ts`. */
  function chiCode(nguon: string): string {
    return nguon
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  }

  const TEN_CAM = 'the' + 'Luc'

  it('mã nguồn không có một đường nào đọc sức bền', () => {
    const cacFile = Object.entries(NGUON)
    expect(cacFile.length, 'phải đọc được chính coHoc.ts').toBe(1)

    for (const [duongDan, nguon] of cacFile) {
      expect(chiCode(nguon).includes(TEN_CAM), duongDan).toBe(false)
    }
  })

  /*
    Ca NGƯỢC: chứng minh phép kiểm trên đỏ được. Không có nó thì một lỗi ở
    `chiCode` hay ở đường dẫn glob sẽ làm phép kiểm xanh vĩnh viễn.
  */
  it('và phép kiểm ấy ĐỎ ĐƯỢC — chú thích thì không tính, mã thì có', () => {
    const giaViPham = `const x = ho.${TEN_CAM}`
    expect(chiCode(giaViPham).includes(TEN_CAM)).toBe(true)

    const giaChuThich = `/* nhắc ${TEN_CAM} trong chú thích */\nconst x = 1`
    expect(chiCode(giaChuThich).includes(TEN_CAM)).toBe(false)
  })
})
