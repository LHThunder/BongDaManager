import { describe, expect, it } from 'vitest'
import { taoRngTuHatGiong } from '../rng'
import {
  BAN_KINH_TRANH,
  kepDichThuMon,
  MOT_PHAN_BA_SAN,
  buocCoHoc,
  chuanHoaGoc,
  GOC_QUAY_NGUOI,
  huongNguoiMocSau,
  NGUONG_DUNG_YEN,
  phanLoaiHuong,
  TOC_DO_LUI_TOI_DA,
  TOC_DO_NGANG_TOI_DA,
  GIA_TOC_TOI_DA,
  GIAM_TOC_TOI_DA,
  gocGiua,
  gocQuayToiDa,
  NGUONG_BANG_CHAM,
  TOC_DO_TOI_DA_CAO,
  TOC_DO_TOI_DA_THAP,
  TRAN_TOC_DO_TUYET_DOI,
  tocDoToiDa,
  tachChen,
  tranhNguoi,
  type Diem,
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
        // Hướng mặt RỜI khỏi hướng đi, để mẫu có cả chạy lùi và chạy ngang.
        huong: rng.next() * 360,
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
    let tt: TrangThaiCoHoc = { x: 0, y: 0, vx: 0, vy: 0, huong: 0 }
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
    let tt: TrangThaiCoHoc = { x: 0, y: 0, vx: 0, vy: 0, huong: 0 }
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
    let tt: TrangThaiCoHoc = { x: 52.5, y: 34, vx: 0, vy: 0, huong: 0 }
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

/**
 * Một quỹ đạo THẬT: xuất phát từ đứng yên, đích nhảy lung tung mỗi bước.
 *
 * Đích nhảy chính là thứ ép người ta vừa quay vừa chạy, nên quỹ đạo sinh ra đủ
 * cả ba kiểu di chuyển — và mọi mốc trong đó đều là mốc engine dựng ra được.
 */
function chuoiQuyDao() {
  const rng = taoRngTuHatGiong(0xc0de_7712)
  const ra: { truoc: TrangThaiCoHoc; sau: TrangThaiCoHoc }[] = []
  let tt: TrangThaiCoHoc = { x: 52.5, y: 34, vx: 0, vy: 0, huong: 0 }
  for (let b = 0; b < 4000; b += 1) {
    const dich = { x: rng.next() * 105, y: rng.next() * 68 }
    const sau = buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, DT)
    ra.push({ truoc: tt, sau })
    tt = sau
  }
  return ra
}

describe('trần theo hướng mặt — AC-38.4 (T712)', () => {
  /*
    ⚠️ Đo trên QUỸ ĐẠO, không trên những cặp (vận tốc, hướng mặt) bốc ngẫu nhiên.

    Một cặp như "đang chạy 9 m/s mà mặt quay ngược 180°" **engine không dựng ra
    được**: trên 6 m/s vector vận tốc chỉ quay 15° mỗi bước, còn thân người quay
    tới 60°, nên hướng mặt luôn đuổi kịp. Kẹp một trạng thái bất khả ấy về 4 m/s
    trong một bước chính là thứ làm **AC-38.2 vỡ với giảm tốc 8,95 m/s²** — phép
    kiểm 1.000 bộ đã bắt đúng con số đó. Nên AC-38.4 phải đo trên những mốc mà
    engine thật sự đi qua.
  */
  it('chạy lùi ≤ 4 m/s và chạy ngang ≤ 5 m/s trên mọi mốc của quỹ đạo', () => {
    let soLui = 0
    let soNgang = 0
    let soTien = 0
    for (const { truoc, sau } of chuoiQuyDao()) {
      const toc = Math.hypot(sau.vx, sau.vy)
      /*
        Phân loại bằng hướng mặt của mốc TRƯỚC — đúng thứ engine dùng để kẹp.
        Dùng hướng mốc sau là đo một thứ khác với thứ engine đã làm.
      */
      const kieu = phanLoaiHuong(truoc.huong, sau.vx, sau.vy)
      if (kieu === 'lui') {
        soLui += 1
        expect(toc, `chạy lùi`).toBeLessThanOrEqual(TOC_DO_LUI_TOI_DA + 1e-9)
      } else if (kieu === 'ngang') {
        soNgang += 1
        expect(toc, `chạy ngang`).toBeLessThanOrEqual(TOC_DO_NGANG_TOI_DA + 1e-9)
      } else {
        soTien += 1
      }
    }
    /*
      ⚠️ CHỐNG RỖNG, và ở AC này nó quan trọng hơn bình thường: nếu hướng mặt
      luôn bám sát hướng đi thì KHÔNG mốc nào bị phân loại là lùi hay ngang, và
      cả hai trần của AC-38.4 xanh mà chưa bao giờ bị thử.
    */
    expect(soLui, 'số mốc chạy lùi trong mẫu').toBeGreaterThan(0)
    expect(soNgang, 'số mốc chạy ngang trong mẫu').toBeGreaterThan(0)
    expect(soTien, 'số mốc chạy tới trong mẫu').toBeGreaterThan(0)
  })

  it('phân loại đúng ba vùng góc', () => {
    // Mặt nhìn về +x; vận tốc lệch dần.
    expect(phanLoaiHuong(0, 1, 0)).toBe('tien')
    expect(phanLoaiHuong(0, Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))).toBe('tien')
    expect(phanLoaiHuong(0, 0, 1)).toBe('ngang')
    expect(phanLoaiHuong(0, 0, -1)).toBe('ngang')
    expect(phanLoaiHuong(0, -1, 0)).toBe('lui')
    // Đứng yên coi như chạy tới — trần rộng nhất, không kẹp nhầm ai.
    expect(phanLoaiHuong(0, 0, 0)).toBe('tien')
  })
})

describe('hướng mặt — AC-38.11 (T712)', () => {
  it('hướng luôn nằm trong [0; 360) trên 1.000 bộ', () => {
    for (const { truoc, dich, tran } of cacBoDauVao()) {
      const sau = buocCoHoc(truoc, dich, tran, DT)
      expect(sau.huong).toBeGreaterThanOrEqual(0)
      expect(sau.huong).toBeLessThan(360)
    }
  })

  it('quay về phía đang đi, nhưng không quá trần quay', () => {
    const toiDa = GOC_QUAY_NGUOI * DT
    for (const { truoc, dich, tran } of cacBoDauVao()) {
      const sau = buocCoHoc(truoc, dich, tran, DT)
      // Chênh lệch NGẮN NHẤT giữa hai hướng, trong [0; 180].
      const lech = Math.abs(((sau.huong - truoc.huong + 540) % 360) - 180)
      expect(lech).toBeLessThanOrEqual(toiDa + 1e-9)
    }
  })

  /*
    ⚠️ CA CHỐNG SỐ GIẢ, và đây là ca mà dòng "Xong khi" của T712 gọi tên.

    `atan2(0, 0)` trả về `0` trong JavaScript. Nếu suy hướng thẳng từ vận tốc thì
    **mọi người đứng im đều nhìn về +x**: AC-38.11 vẫn "thoả" vì 0 nằm trong
    [0; 360), nhưng con số ấy không mang một tin nào. Một hàng phòng ngự đứng yên
    sẽ quay mặt cùng một phía như trong ảnh chụp lỗi.
  */
  it('người đứng im GIỮ hướng cũ, KHÔNG mặc định nhìn về +x', () => {
    const cacHuong = [0, 37, 90, 180, 270, 359.5]
    const raSau: number[] = []
    for (const huong of cacHuong) {
      // Đích đúng chỗ đang đứng → không có lý do gì để di chuyển.
      const truoc = { x: 20, y: 30, vx: 0, vy: 0, huong }
      const sau = buocCoHoc(truoc, { x: 20, y: 30 }, 9, DT)
      expect(Math.hypot(sau.vx, sau.vy)).toBeLessThan(NGUONG_DUNG_YEN)
      expect(sau.huong, `giữ hướng ${huong}`).toBeCloseTo(huong, 10)
      raSau.push(sau.huong)
    }
    // Và điều quan trọng nhất: KHÔNG phải ai cũng ra cùng một con số.
    expect(new Set(raSau).size, 'số hướng khác nhau').toBe(cacHuong.length)
    expect(raSau.every((h) => h === 0)).toBe(false)
  })

  it('và hàm hướng tự nó cũng giữ hướng cũ khi vận tốc dưới ngưỡng', () => {
    expect(huongNguoiMocSau(137, 0, 0, DT)).toBe(137)
    expect(huongNguoiMocSau(137, 0.01, 0.01, DT)).toBe(137)
    // Trên ngưỡng thì nó quay thật.
    expect(huongNguoiMocSau(0, 0, 5, DT)).toBeGreaterThan(0)
  })

  it('chuanHoaGoc đưa mọi góc về [0; 360)', () => {
    expect(chuanHoaGoc(0)).toBe(0)
    expect(chuanHoaGoc(360)).toBe(0)
    expect(chuanHoaGoc(-90)).toBe(270)
    expect(chuanHoaGoc(725)).toBe(5)
    expect(chuanHoaGoc(-725)).toBe(355)
  })
})

/*
  Đi vòng qua người và tách người chồng nhau (T713).

  Đây là chỗ trả món nợ **AC-34.2 của spec 006** — mệnh đề "đi vòng qua đối thủ"
  mà Phase 50 bị bỏ nên chưa ai làm.

  Vị trí của một trận liên tục thật **chưa nối xong** (lô mốc hôm nay còn mang
  toạ độ 0, xem T704), nên "20 mã trận" ở đây là **20 hạt giống tất định** sinh
  ra cảnh trên sân. Khi T714 nối xong vị trí thật, phép kiểm trên một trận thật
  là việc của T754.
*/

const SO_MA = 20
const SO_THUC_THE_TREN_SAN = 26

/** Khoảng cách nhỏ nhất giữa hai điểm bất kỳ trong một cảnh. */
function khoangGanNhat(cac: readonly Diem[]): number {
  let nho = Infinity
  for (let i = 0; i < cac.length; i += 1) {
    for (let j = i + 1; j < cac.length; j += 1) {
      nho = Math.min(nho, Math.hypot(cac[i]!.x - cac[j]!.x, cac[i]!.y - cac[j]!.y))
    }
  }
  return nho
}

/**
 * Một cảnh CHẬT: 26 thực thể dồn vào một vùng 25 × 20 m.
 *
 * Dồn chật là cố ý — rải đều trên cả sân 105 × 68 thì hầu như không có cặp nào
 * chen nhau, và phép kiểm sẽ xanh vì **không có gì để tách**.
 */
function canhChat(hatGiong: number): readonly Diem[] {
  const rng = taoRngTuHatGiong(hatGiong)
  return Array.from({ length: SO_THUC_THE_TREN_SAN }, () => ({
    x: 40 + rng.next() * 25,
    y: 24 + rng.next() * 20,
  }))
}

describe('tachChen — không ai đứng chồng ai (T713, AC-34.2)', () => {
  it('sau khi tách, mọi cặp cách nhau ít nhất 2,0 m trên 20 mã', () => {
    let soCanhVonChen = 0
    for (let ma = 0; ma < SO_MA; ma += 1) {
      const truoc = canhChat(0x7713_0000 + ma)
      if (khoangGanNhat(truoc) < BAN_KINH_TRANH) soCanhVonChen += 1

      const sau = tachChen(truoc)
      expect(sau).toHaveLength(truoc.length)
      expect(
        khoangGanNhat(sau),
        `mã ${ma}: gần nhất sau khi tách`,
      ).toBeGreaterThanOrEqual(BAN_KINH_TRANH - 1e-9)
    }
    /*
      ⚠️ CHỐNG RỖNG. Nếu cảnh nào cũng vốn đã rộng rãi thì `tachChen` chưa bao
      giờ phải làm gì, và phép kiểm trên xanh mà không chứng minh điều gì.
    */
    expect(soCanhVonChen, 'số cảnh vốn CÓ người chen nhau').toBe(SO_MA)
  })

  /*
    ⚠️ Hai thực thể TRÙNG KHÍT — chỗ một phép tách ngây thơ chia cho không.

    Vector nối hai điểm cách nhau đúng 0 **không có hướng**, nên không có chiều
    nào để đẩy. Một bản cài ẩu sẽ cho ra `NaN` và mọi phép so sánh sau đó đều
    "qua" — vì `NaN >= 2` là false nhưng `NaN` lọt qua mọi phép lọc viết lỏng.
  */
  it('hai người TRÙNG KHÍT vẫn tách được, và không ra NaN', () => {
    const sau = tachChen([
      { x: 50, y: 34 },
      { x: 50, y: 34 },
      { x: 50, y: 34 },
    ])
    for (const d of sau) {
      expect(Number.isFinite(d.x)).toBe(true)
      expect(Number.isFinite(d.y)).toBe(true)
    }
    expect(khoangGanNhat(sau)).toBeGreaterThanOrEqual(BAN_KINH_TRANH - 1e-9)
  })

  it('và phép tách TẤT ĐỊNH — chạy hai lần ra đúng cùng một kết quả (P1)', () => {
    const canh = canhChat(0x7713_00ff)
    expect(tachChen(canh)).toEqual(tachChen(canh))
    // Kể cả ở ca trùng khít, nơi hướng đẩy do chỉ số quyết.
    const trung = [
      { x: 10, y: 10 },
      { x: 10, y: 10 },
    ]
    expect(tachChen(trung)).toEqual(tachChen(trung))
  })

  it('KHÔNG sửa mảng đầu vào', () => {
    const canh = [
      { x: 10, y: 10 },
      { x: 10.5, y: 10 },
    ]
    tachChen(canh)
    expect(canh[0]).toEqual({ x: 10, y: 10 })
    expect(canh[1]).toEqual({ x: 10.5, y: 10 })
  })
})

describe('tranhNguoi — đi vòng, không đi xuyên (T713, AC-34.2)', () => {
  it('người cản ĐÚNG trên đường thì đích dời sang một bên', () => {
    const tu = { x: 0, y: 0 }
    const dich = { x: 20, y: 0 }
    const canTranh = [{ x: 10, y: 0 }]

    const moi = tranhNguoi(tu, dich, canTranh)
    expect(moi).not.toEqual(dich)
    // Dời đúng một bán kính tránh, và dời VUÔNG GÓC với đường đi.
    expect(Math.hypot(moi.x - dich.x, moi.y - dich.y)).toBeCloseTo(BAN_KINH_TRANH, 10)
    expect(moi.x).toBeCloseTo(dich.x, 10)
  })

  /*
    Ca chống "bẻ đường vô cớ": đường đang thông thì KHÔNG được đụng vào đích.
    Một bản cài luôn dời đích vẫn xanh ở ca trên, nhưng nó làm mọi người đi
    đường vòng suốt trận.
  */
  it('không ai cản thì trả về ĐÚNG đích cũ', () => {
    const tu = { x: 0, y: 0 }
    const dich = { x: 20, y: 0 }
    // Người đứng xa đường đi.
    expect(tranhNguoi(tu, dich, [{ x: 10, y: 9 }])).toEqual(dich)
    // Người đứng SAU lưng.
    expect(tranhNguoi(tu, dich, [{ x: -5, y: 0 }])).toEqual(dich)
    // Người đứng QUÁ đích.
    expect(tranhNguoi(tu, dich, [{ x: 25, y: 0 }])).toEqual(dich)
    // Không có ai.
    expect(tranhNguoi(tu, dich, [])).toEqual(dich)
  })

  it('dời sang phía ĐỐI DIỆN người cản', () => {
    const tu = { x: 0, y: 0 }
    const dich = { x: 20, y: 0 }
    const lechTrai = tranhNguoi(tu, dich, [{ x: 10, y: 1 }])
    const lechPhai = tranhNguoi(tu, dich, [{ x: 10, y: -1 }])
    expect(Math.sign(lechTrai.y)).toBe(-1)
    expect(Math.sign(lechPhai.y)).toBe(1)
  })

  it('chọn người cản GẦN NHẤT khi có nhiều người trên đường', () => {
    const tu = { x: 0, y: 0 }
    const dich = { x: 30, y: 0 }
    // Người gần lệch sang +y, người xa lệch sang −y: phải tránh theo người GẦN.
    const moi = tranhNguoi(tu, dich, [
      { x: 20, y: -1 },
      { x: 5, y: 1 },
    ])
    expect(Math.sign(moi.y)).toBe(-1)
  })
})

/*
  Kẹp ĐÍCH của thủ môn (T714, AC-30.7 của spec 005).

  Kẹp ĐÍCH chứ không kẹp VỊ TRÍ, và chỗ khác nhau ấy là cả lý do hàm này nằm ở
  engine: kẹp vị trí nghĩa là để thủ môn chạy ra giữa sân rồi GIẬT anh ta về —
  một bước dịch không qua phép kẹp gia tốc, tức vỡ AC-38.2 và trên hình trông
  như teleport.
*/
describe('kẹp đích thủ môn vào một phần ba sân nhà (T714)', () => {
  it('đội nhà bị kẹp ở đầu sân, đội khách ở cuối sân', () => {
    expect(kepDichThuMon({ x: 80, y: 34 }, 'nha').x).toBeCloseTo(MOT_PHAN_BA_SAN, 10)
    expect(kepDichThuMon({ x: 10, y: 34 }, 'khach').x).toBeCloseTo(
      105 - MOT_PHAN_BA_SAN,
      10,
    )
  })

  it('đích đã nằm trong dải thì KHÔNG bị đụng tới', () => {
    expect(kepDichThuMon({ x: 12, y: 40 }, 'nha')).toEqual({ x: 12, y: 40 })
    expect(kepDichThuMon({ x: 95, y: 20 }, 'khach')).toEqual({ x: 95, y: 20 })
  })

  it('và nó KHÔNG đụng trục y — thủ môn vẫn đi ngang được cả khung', () => {
    expect(kepDichThuMon({ x: 80, y: 7 }, 'nha').y).toBe(7)
    expect(kepDichThuMon({ x: 80, y: 61 }, 'nha').y).toBe(61)
  })

  /*
    Ca chống số tự chế: một phần ba sân phải lấy từ hằng số sân của
    `hinhHocSan.ts`, không phải một con số 35 gõ tay ở đâu đó.
  */
  it('một phần ba sân dẫn xuất từ chiều dài sân, không gõ tay', () => {
    expect(MOT_PHAN_BA_SAN).toBeCloseTo(105 / 3, 10)
  })
})
