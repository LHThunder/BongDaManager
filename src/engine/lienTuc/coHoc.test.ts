import { describe, expect, it } from 'vitest'
import { taoRngTuHatGiong } from '../rng'
import {
  buocCoHoc,
  GIA_TOC_TOI_DA,
  GIAM_TOC_TOI_DA,
  gocGiua,
  gocQuayToiDa,
  NGUONG_BANG_CHAM,
  TOC_DO_TOI_DA_CAO,
  TOC_DO_TOI_DA_THAP,
  TRAN_TOC_DO_TUYET_DOI,
  tocDoToiDa,
  type TrangThaiCoHoc,
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

/*
  Cơ học một bước (T711, AC-38.2 và AC-38.3, quyết định D123).

  Hai phép kiểm cuối là phép kiểm **chống rỗng**, và chúng đáng giá hơn cả hai
  phép kiểm chúng bảo vệ: AC-38.3 có hai vế nói về những cú quay, nhưng nếu mô
  hình không bao giờ **sinh ra** một cú quay như thế thì cả hai vế xanh mà
  không chứng minh gì. D123 chọn cho băng dưới 3 m/s quay **tự do** chính là để
  vế (i) có mẫu thật.
*/

const DT = 0.5
const SO_BO = 1000

/** 1.000 bộ đầu vào tất định: chỗ đứng, vận tốc, đích, trần của người ấy. */
function cacBoDauVao() {
  const rng = taoRngTuHatGiong(0x5eed_1234)
  const ra: {
    truoc: TrangThaiCoHoc
    dich: { x: number; y: number }
    tran: number
  }[] = []
  for (let i = 0; i < SO_BO; i += 1) {
    const huong = rng.next() * Math.PI * 2
    const toc = rng.next() * TRAN_TOC_DO_TUYET_DOI
    ra.push({
      truoc: {
        x: rng.next() * 105,
        y: rng.next() * 68,
        vx: Math.cos(huong) * toc,
        vy: Math.sin(huong) * toc,
      },
      dich: { x: rng.next() * 105, y: rng.next() * 68 },
      tran: TOC_DO_TOI_DA_THAP + rng.next() * (TOC_DO_TOI_DA_CAO - TOC_DO_TOI_DA_THAP),
    })
  }
  return ra
}

describe('một bước cơ học giữ AC-38.2 (T711)', () => {
  it('gia tốc ≤ 6 và giảm tốc ≤ 8 trên 1.000 bộ đầu vào', () => {
    let soTang = 0
    let soGiam = 0
    for (const { truoc, dich, tran } of cacBoDauVao()) {
      const sau = buocCoHoc(truoc, dich, tran, DT)
      const tocTruoc = Math.hypot(truoc.vx, truoc.vy)
      const tocSau = Math.hypot(sau.vx, sau.vy)
      const doDv = Math.hypot(sau.vx - truoc.vx, sau.vy - truoc.vy)
      const a = doDv / DT

      // Trần của AC, không phải trần của hằng số — AC là thứ phải đúng.
      expect(a).toBeLessThanOrEqual(8 + 1e-9)
      if (tocSau >= tocTruoc) {
        soTang += 1
        expect(a, `tăng tốc, bộ có |v| ${tocTruoc.toFixed(3)}`).toBeLessThanOrEqual(6 + 1e-9)
      } else {
        soGiam += 1
      }
    }
    // Chống rỗng: phải có cả hai loại bước trong mẫu.
    expect(soTang, "số bước tăng tốc").toBeGreaterThan(0)
    expect(soGiam, "số bước giảm tốc").toBeGreaterThan(0)
  })

  it('và chính hai hằng số cũng nằm dưới trần của AC', () => {
    expect(GIA_TOC_TOI_DA).toBeLessThan(6)
    expect(GIAM_TOC_TOI_DA).toBeLessThan(8)
  })
})

describe('tích phân Euler: (x′ − x) / dt ≡ v′ (T711, D123)', () => {
  it('đúng tới 10 chữ số trên 1.000 bộ', () => {
    for (const { truoc, dich, tran } of cacBoDauVao()) {
      const sau = buocCoHoc(truoc, dich, tran, DT)
      expect((sau.x - truoc.x) / DT).toBeCloseTo(sau.vx, 10)
      expect((sau.y - truoc.y) / DT).toBeCloseTo(sau.vy, 10)
    }
  })
})

describe('hội tụ: 30 m tới đích trong ⌈30/9⌉ + 1 giây (T711)', () => {
  it('người nhanh nhất đi 30 m và DỪNG ở đích', () => {
    const GIAY_TOI_DA = Math.ceil(30 / TRAN_TOC_DO_TUYET_DOI) + 1
    let tt: TrangThaiCoHoc = { x: 0, y: 0, vx: 0, vy: 0 }
    const dich = { x: 30, y: 0 }

    let giay = 0
    for (let b = 0; b < GIAY_TOI_DA / DT; b += 1) {
      tt = buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, DT)
      giay += DT
      if (Math.hypot(dich.x - tt.x, dich.y - tt.y) <= 0.5) break
    }

    const conCach = Math.hypot(dich.x - tt.x, dich.y - tt.y)
    expect(conCach, `còn cách đích sau ${giay}s`).toBeLessThanOrEqual(0.5)
    expect(giay).toBeLessThanOrEqual(GIAY_TOI_DA)
  })

  /*
    Ca chống tầm thường cho phép hội tụ: KHÔNG được vọt qua đích.
    Một mô hình chỉ có ga mà không có phanh vẫn "tới đích" ở ca trên — rồi dao
    động quanh nó mãi. Phép kiểm này bắt đúng chỗ ấy.
  */
  it('và KHÔNG vọt qua đích rồi dao động', () => {
    let tt: TrangThaiCoHoc = { x: 0, y: 0, vx: 0, vy: 0 }
    const dich = { x: 30, y: 0 }
    let vuotQua = 0
    for (let b = 0; b < 40; b += 1) {
      tt = buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, DT)
      if (tt.x > dich.x + 0.5) vuotQua += 1
    }
    expect(vuotQua, "số bước nằm quá đích").toBe(0)
  })
})

describe('AC-38.3 — CẢ HAI vế, và cả hai đều có mẫu thật (T711)', () => {
  /** Chạy một chuỗi bước dài, đổi đích liên tục, để sinh ra những cú quay. */
  function chuoiBuocCoQuay() {
    const rng = taoRngTuHatGiong(0xbeef_4321)
    const ra: { truoc: TrangThaiCoHoc; sau: TrangThaiCoHoc; goc: number }[] = []
    let tt: TrangThaiCoHoc = { x: 52.5, y: 34, vx: 0, vy: 0 }
    for (let b = 0; b < 4000; b += 1) {
      // Đích nhảy lung tung chính là thứ ép người ta phải quay.
      const dich = { x: rng.next() * 105, y: rng.next() * 68 }
      const sau = buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, DT)
      ra.push({ truoc: tt, sau, goc: gocGiua(tt.vx, tt.vy, sau.vx, sau.vy) })
      tt = sau
    }
    return ra
  }

  it('vế (i): quay > 90° thì tốc độ mốc TRƯỚC dưới 3 m/s', () => {
    const cac = chuoiBuocCoQuay()
    const quayGat = cac.filter((b) => b.goc > 90)
    for (const b of quayGat) {
      const tocTruoc = Math.hypot(b.truoc.vx, b.truoc.vy)
      expect(tocTruoc, `quay ${b.goc.toFixed(1)}°`).toBeLessThan(NGUONG_BANG_CHAM)
    }
    // ⚠️ CHỐNG RỖNG: nếu không có cú quay nào > 90° thì vế (i) chưa được thử.
    expect(quayGat.length, "số cú quay > 90° trong mẫu").toBeGreaterThan(0)
  })

  it('vế (ii): quay 45–90° thì tốc độ sau ≤ 60% tốc độ trước', () => {
    const cac = chuoiBuocCoQuay()
    const quayVua = cac.filter((b) => b.goc >= 45 && b.goc <= 90)
    for (const b of quayVua) {
      const tocTruoc = Math.hypot(b.truoc.vx, b.truoc.vy)
      const tocSau = Math.hypot(b.sau.vx, b.sau.vy)
      expect(tocSau, `quay ${b.goc.toFixed(1)}°`).toBeLessThanOrEqual(0.6 * tocTruoc + 1e-9)
    }
    // ⚠️ CHỐNG RỖNG.
    expect(quayVua.length, "số cú quay 45–90° trong mẫu").toBeGreaterThan(0)
  })

  /*
    Cổng quay ba băng, kiểm thẳng chứ không qua một trận.

    Băng chậm trả 180 — tự do — và đó là CHỦ Ý, không phải sót: nếu kẹp góc ở
    mọi tốc độ thì với gia tốc pháp tuyến thuần, góc một bước luôn dưới 90°, và
    vế (i) ở trên sẽ không bao giờ có mẫu.
  */
  it('ba băng trả đúng ba trần, và băng chậm tự do', () => {
    expect(gocQuayToiDa(0, DT)).toBe(180)
    expect(gocQuayToiDa(2.99, DT)).toBe(180)
    expect(gocQuayToiDa(3.0, DT)).toBe(85)
    expect(gocQuayToiDa(6.0, DT)).toBe(85)
    expect(gocQuayToiDa(6.01, DT)).toBeCloseTo(30 * DT, 10)
    // Băng giữa dưới 90° THEO CẤU TRÚC — đó là thứ làm vế (i) đúng.
    expect(gocQuayToiDa(4.5, DT)).toBeLessThan(90)
  })
})
