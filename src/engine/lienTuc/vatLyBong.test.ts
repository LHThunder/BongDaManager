import { describe, expect, it } from 'vitest'
import type { LoaiHanhDong } from '../chuoiBong'
import { DAI_SAN, RONG_SAN } from '../hinhHocSan'
import { TRAN_TOC_DO_TUYET_DOI } from './coHoc'
import {
  bongTaiThoiDiem,
  G_TRONG_TRUONG,
  giayChamDat,
  NGUONG_CHUYEN_DAI,
  phatBong,
  QUANG_CHUYEN_DAI_NHAT,
  QUANG_SUT_MANH_NHAT,
  thoiGianBay,
  TOC_DO_CHUYEN_DAI_CAO,
  TOC_DO_CHUYEN_DAI_THAP,
  TOC_DO_CHUYEN_NGAN_CAO,
  TOC_DO_CHUYEN_NGAN_THAP,
  tocDoDuongBong,
} from './vatLyBong'

/*
  Vật lý quả bóng (T720, AC-38.6, quyết định D129).

  ⚠️ **Điều kiện ra của T720 viết là `|thoiGianBay − d/v| < 1e-9`, và câu ấy đọc
  nguyên văn thì RỖNG**: `thoiGianBay` được định nghĩa **bằng** `d / v`, nên so
  nó với `d / v` là so một thứ với chính nó. Phép kiểm thật phải hỏi câu mà AC
  hỏi: *quả bóng phát với tốc độ ấy có TỚI ĐÍCH đúng vào giây thứ `d / v` không*
  — và đó là một khẳng định về `phatBong` cộng `bongTaiThoiDiem`, đỏ được ngay
  nếu tốc độ được phân tích dọc theo quỹ đạo thay vì theo phương ngang.
*/

const CAC_LOAI_DANH: readonly LoaiHanhDong[] = ['chuyen', 'tat-canh', 'sut']
const CAC_QUANG = Array.from({ length: 121 }, (_, i) => i * 0.5 + 0.5)

describe('tocDoDuongBong — hai dải của AC-38.6 (T720)', () => {
  it('chuyền NGẮN (dưới 25 m) nằm trong 12–20 m/s', () => {
    let soBo = 0
    for (const loai of ['chuyen', 'tat-canh'] as const) {
      for (const quang of CAC_QUANG) {
        if (quang >= NGUONG_CHUYEN_DAI) continue
        const v = tocDoDuongBong(quang, loai)
        expect(v, `${loai} ${quang} m`).toBeGreaterThanOrEqual(
          TOC_DO_CHUYEN_NGAN_THAP,
        )
        expect(v, `${loai} ${quang} m`).toBeLessThanOrEqual(
          TOC_DO_CHUYEN_NGAN_CAO,
        )
        soBo += 1
      }
    }
    // ⚠️ CHỐNG RỖNG: không có mẫu thì hai dòng trên xanh mà chẳng canh gì.
    expect(soBo, 'số bộ chuyền ngắn').toBeGreaterThan(80)
  })

  it('chuyền DÀI (từ 25 m) và SÚT nằm trong 20–30 m/s', () => {
    let soBoChuyenDai = 0
    let soBoSut = 0
    for (const loai of CAC_LOAI_DANH) {
      for (const quang of CAC_QUANG) {
        if (loai !== 'sut' && quang < NGUONG_CHUYEN_DAI) continue
        const v = tocDoDuongBong(quang, loai)
        expect(v, `${loai} ${quang} m`).toBeGreaterThanOrEqual(
          TOC_DO_CHUYEN_DAI_THAP,
        )
        expect(v, `${loai} ${quang} m`).toBeLessThanOrEqual(
          TOC_DO_CHUYEN_DAI_CAO,
        )
        if (loai === 'sut') soBoSut += 1
        else soBoChuyenDai += 1
      }
    }
    expect(soBoChuyenDai, 'số bộ chuyền dài').toBeGreaterThan(100)
    expect(soBoSut, 'số bộ sút').toBeGreaterThan(100)
  })

  /*
    ⚠️ **Hai dải phải LIỀN nhau ở chỗ chia, không thì một đường chuyền 24,9 m và
    một đường 25,1 m chênh nhau một bước nhảy** — và bước nhảy ấy sẽ hiện lên
    sân 2D thành quả bóng đột ngột tăng tốc giữa pha, đúng lớp lỗi "như kiểu
    teleport" mà người dùng đã bắt bằng mắt ở spec 005.
  */
  it('và hai dải LIỀN nhau ở đúng ngưỡng 25 m', () => {
    expect(tocDoDuongBong(NGUONG_CHUYEN_DAI, 'chuyen')).toBeCloseTo(
      TOC_DO_CHUYEN_DAI_THAP,
      10,
    )
    expect(tocDoDuongBong(NGUONG_CHUYEN_DAI - 1e-9, 'chuyen')).toBeCloseTo(
      TOC_DO_CHUYEN_NGAN_CAO,
      6,
    )
    // Và đỉnh dải ngắn BẰNG đáy dải dài — chỗ liền ấy là một hằng số, không may.
    expect(TOC_DO_CHUYEN_NGAN_CAO).toBe(TOC_DO_CHUYEN_DAI_THAP)
  })

  it('càng xa càng đánh mạnh: đơn điệu không giảm theo quãng', () => {
    for (const loai of CAC_LOAI_DANH) {
      let truoc = -Infinity
      for (const quang of CAC_QUANG) {
        const v = tocDoDuongBong(quang, loai)
        expect(v, `${loai} ${quang} m`).toBeGreaterThanOrEqual(truoc)
        truoc = v
      }
    }
  })

  it('và đạt ĐỈNH dải ở đúng quãng mà hai hằng số nêu', () => {
    expect(tocDoDuongBong(QUANG_CHUYEN_DAI_NHAT, 'chuyen')).toBeCloseTo(
      TOC_DO_CHUYEN_DAI_CAO,
      10,
    )
    expect(tocDoDuongBong(QUANG_SUT_MANH_NHAT, 'sut')).toBeCloseTo(
      TOC_DO_CHUYEN_DAI_CAO,
      10,
    )
    // Xa hơn nữa thì KHÔNG vượt đỉnh — dải của AC-38.6 là dải đóng.
    expect(tocDoDuongBong(200, 'chuyen')).toBeCloseTo(TOC_DO_CHUYEN_DAI_CAO, 10)
    expect(tocDoDuongBong(200, 'sut')).toBeCloseTo(TOC_DO_CHUYEN_DAI_CAO, 10)
  })

  /*
    `re-bong` không phải một quả bóng được đánh đi, nên dải của AC-38.6 không
    nói về nó. Phép kiểm này canh đúng điều đó: tốc độ của nó là tốc độ NGƯỜI,
    và nó nằm **dưới** đáy dải chuyền ngắn — nếu một ngày nó rơi vào dải thì
    phép kiểm dải ở trên sẽ đo lẫn cả quả bóng trong chân người dẫn.
  */
  it('re-bong lấy trần tốc độ NGƯỜI, và nằm ngoài dải của AC-38.6', () => {
    expect(tocDoDuongBong(5, 're-bong')).toBe(TRAN_TOC_DO_TUYET_DOI)
    expect(tocDoDuongBong(50, 're-bong')).toBe(TRAN_TOC_DO_TUYET_DOI)
    expect(TRAN_TOC_DO_TUYET_DOI).toBeLessThan(TOC_DO_CHUYEN_NGAN_THAP)
  })

  it('quãng âm không sinh tốc độ âm', () => {
    expect(tocDoDuongBong(-10, 'chuyen')).toBe(TOC_DO_CHUYEN_NGAN_THAP)
    expect(tocDoDuongBong(-10, 'sut')).toBe(TOC_DO_CHUYEN_DAI_THAP)
  })
})

/*
  ====================================================================
  ĐƯỜNG BÓNG TỚI ĐÍCH ĐÚNG GIÂY THỨ d/v — mệnh đề thứ hai của AC-38.6.
  ====================================================================
*/
describe('phatBong + bongTaiThoiDiem (T720)', () => {
  const CAC_TU: readonly { x: number; y: number }[] = [
    { x: 5, y: 5 },
    { x: 52.5, y: 34 },
    { x: 100, y: 60 },
    { x: 10, y: 60 },
  ]
  const CAC_GOC = [0, 5, 12, 25, 40]

  it('1.000+ bộ: bóng tới ĐÚNG đích vào đúng giây thứ d/v', () => {
    let soBo = 0
    let lechLonNhat = 0
    for (const tu of CAC_TU) {
      for (let dx = -100; dx <= 100; dx += 10) {
        for (let dy = -60; dy <= 60; dy += 20) {
          const den = { x: tu.x + dx, y: tu.y + dy }
          const quang = Math.hypot(dx, dy)
          if (quang === 0) continue
          for (const loai of CAC_LOAI_DANH) {
            for (const goc of CAC_GOC) {
              const phat = phatBong(tu, den, loai, goc)
              const v = tocDoDuongBong(quang, loai)
              const t = thoiGianBay(quang, v)
              /*
                Mệnh đề nguyên văn của điều kiện ra — và nó là **phép đồng nhất**:
                `thoiGianBay` ĐƯỢC ĐỊNH NGHĨA bằng `d / v`. Để lại ở đây cho đủ
                chữ của task, nhưng phép kiểm có răng là hai dòng dưới: bóng có
                **tới đích** vào đúng giây ấy hay không.
              */
              expect(Math.abs(t - quang / v)).toBeLessThan(1e-9)
              const toi = bongTaiThoiDiem(phat, t)
              lechLonNhat = Math.max(
                lechLonNhat,
                Math.hypot(toi.x - den.x, toi.y - den.y),
              )
              soBo += 1
            }
          }
        }
      }
    }
    expect(lechLonNhat, 'lệch khỏi đích, mét').toBeLessThan(1e-9)
    expect(soBo, 'số bộ đã quét').toBeGreaterThan(1_000)
  })

  /*
    ⚠️ **XƯƠNG SỐNG của quyết định 1.** Tốc độ NGANG không đổi theo góc phát.
    Bỏ điều này thì thời gian bay thành `d / (v·cos góc)` và mệnh đề thứ hai của
    AC-38.6 chỉ còn đúng gần đúng ở mọi quả tạt — mà phép kiểm ở trên sẽ đỏ
    **sau** khi đã sai, còn phép kiểm này nói thẳng nguyên nhân.
  */
  it('tốc độ NGANG không đổi theo góc phát, còn vz thì đổi', () => {
    const tu = { x: 10, y: 20 }
    const den = { x: 50, y: 20 }
    const vNgangMongMuon = tocDoDuongBong(40, 'tat-canh')
    let soGocCoVz = 0
    for (const goc of CAC_GOC) {
      const p = phatBong(tu, den, 'tat-canh', goc)
      expect(Math.hypot(p.vx, p.vy), `góc ${goc}`).toBeCloseTo(
        vNgangMongMuon,
        9,
      )
      if (goc > 0) {
        expect(p.vz, `góc ${goc}`).toBeGreaterThan(0)
        soGocCoVz += 1
      }
    }
    expect(soGocCoVz, 'số góc có thành phần thẳng đứng').toBeGreaterThan(3)
  })

  /*
    ⚠️ **XƯƠNG SỐNG của quyết định 2.** Công thức đóng có tính **nửa nhóm**: đi
    một bước `t1 + t2` ra đúng kết quả của hai bước `t1` rồi `t2`. Một phép tích
    phân Euler — kể cả Euler "dùng vận tốc mới" như `buocCoHoc` — **không** có
    tính ấy, nên phép kiểm này là thứ đỏ ngay nếu ai thay công thức đóng bằng
    một vòng lặp từng bước. Và nó là lý do `zKhiToi` của T721 giải được bằng đại
    số thay vì dò.
  */
  it('TÍNH NỬA NHÓM: chia nhỏ bao nhiêu bước cũng ra cùng một số', () => {
    const quang = Math.hypot(35, 20)
    const T = thoiGianBay(quang, tocDoDuongBong(quang, 'tat-canh'))
    /*
      Hai ca, và ca thứ hai là ca đáng kể: góc 5° cho bóng **chạm đất GIỮA
      đường bay** (giây 0,43 so với đường bay 1,65 giây), nên bước dài băng qua
      đúng lúc chạm đất — chỗ phép kẹp mặt đất dễ phá tính nửa nhóm nhất.
    */
    for (const goc of [20, 5]) {
      const phat = phatBong({ x: 10, y: 10 }, { x: 45, y: 30 }, 'tat-canh', goc)
      const motBuoc = bongTaiThoiDiem(phat, T)
      for (const soBuoc of [2, 4, 8, 16, 64]) {
        let tt = phat
        for (let i = 0; i < soBuoc; i += 1) {
          tt = bongTaiThoiDiem(tt, T / soBuoc)
        }
        expect(tt.x, `góc ${goc}, ${soBuoc} bước`).toBeCloseTo(motBuoc.x, 9)
        expect(tt.y, `góc ${goc}, ${soBuoc} bước`).toBeCloseTo(motBuoc.y, 9)
        expect(tt.z, `góc ${goc}, ${soBuoc} bước`).toBeCloseTo(motBuoc.z, 9)
        expect(tt.vz, `góc ${goc}, ${soBuoc} bước`).toBeCloseTo(motBuoc.vz, 9)
      }
    }
  })

  /*
    Mặt đất là SÀN: không mốc nào có `z` âm, ở bất cứ góc phát và bất cứ giây
    nào. Bản đầu của `bongTaiThoiDiem` để parabol chạy tự do và một đường chuyền
    sệt tụt xuống **−0,049 m** ngay ở giây 0,1.
  */
  it('và KHÔNG mốc nào có z âm, ở mọi góc phát', () => {
    let soBo = 0
    for (const goc of [0, 5, 12, 25, 40]) {
      const phat = phatBong({ x: 5, y: 5 }, { x: 45, y: 25 }, 'tat-canh', goc)
      for (let t = 0; t <= 6; t += 0.05) {
        const b = bongTaiThoiDiem(phat, t)
        expect(b.z, `góc ${goc}, giây ${t.toFixed(2)}`).toBeGreaterThanOrEqual(0)
        soBo += 1
      }
    }
    expect(soBo, 'số mốc đã quét').toBeGreaterThan(500)
  })

  it('bóng bổng chạm đất ở đúng giây 2·vz/g, rồi NẰM đó', () => {
    const phat = phatBong({ x: 5, y: 5 }, { x: 45, y: 5 }, 'tat-canh', 20)
    const tDat = giayChamDat(phat)
    expect(tDat).toBeCloseTo((2 * phat.vz) / G_TRONG_TRUONG, 9)
    expect(bongTaiThoiDiem(phat, tDat - 0.05).z).toBeGreaterThan(0)
    for (const t of [tDat, tDat + 0.1, tDat + 2]) {
      expect(bongTaiThoiDiem(phat, t).z, `giây ${t.toFixed(2)}`).toBe(0)
      expect(bongTaiThoiDiem(phat, t).vz, `giây ${t.toFixed(2)}`).toBe(0)
    }
  })

  it('đường SỆT chạm đất ngay giây 0 — nên z ≡ 0 theo cấu trúc', () => {
    expect(giayChamDat(phatBong({ x: 5, y: 5 }, { x: 25, y: 5 }, 'chuyen'))).toBe(
      0,
    )
  })

  it('đường SỆT có z ≡ 0 suốt đường bay — điều AC-38.5 đòi', () => {
    const phat = phatBong({ x: 5, y: 5 }, { x: 25, y: 5 }, 'chuyen')
    expect(phat.vz).toBe(0)
    for (let t = 0; t <= 3; t += 0.1) {
      expect(bongTaiThoiDiem(phat, t).z, `giây ${t.toFixed(1)}`).toBe(0)
    }
  })

  it('và quỹ đạo bổng lên rồi xuống, đỉnh ở đúng giây vz/g', () => {
    const phat = phatBong({ x: 5, y: 5 }, { x: 45, y: 5 }, 'tat-canh', 30)
    const tDinh = phat.vz / G_TRONG_TRUONG
    const zDinh = bongTaiThoiDiem(phat, tDinh).z
    expect(bongTaiThoiDiem(phat, tDinh - 0.2).z).toBeLessThan(zDinh)
    expect(bongTaiThoiDiem(phat, tDinh + 0.2).z).toBeLessThan(zDinh)
    // Ở đỉnh thì thành phần thẳng đứng đúng bằng 0 — đó là định nghĩa của đỉnh.
    expect(bongTaiThoiDiem(phat, tDinh).vz).toBeCloseTo(0, 9)
    expect(zDinh).toBeGreaterThan(0)
  })

  it('quãng 0 không sinh NaN', () => {
    const p = phatBong({ x: 30, y: 30 }, { x: 30, y: 30 }, 'chuyen', 15)
    expect(Number.isFinite(p.vx)).toBe(true)
    expect(Number.isFinite(p.vy)).toBe(true)
    expect(p.vx).toBe(0)
    expect(p.vy).toBe(0)
  })

  it('và hàm TẤT ĐỊNH: cùng đầu vào ra cùng từng số', () => {
    const tu = { x: 12, y: 34 }
    const den = { x: 56, y: 7 }
    expect(phatBong(tu, den, 'sut', 10)).toEqual(phatBong(tu, den, 'sut', 10))
    expect(bongTaiThoiDiem(phatBong(tu, den, 'sut', 10), 0.7)).toEqual(
      bongTaiThoiDiem(phatBong(tu, den, 'sut', 10), 0.7),
    )
  })

  /*
    Một đường bóng dài nhất có thể trên sân này vẫn phải bay trong một thời gian
    người xem chịu được. Đường chéo sân là quãng lớn nhất hai người cách nhau.
  */
  it('đường bóng dài nhất trên sân bay dưới 5 giây', () => {
    const cheo = Math.hypot(DAI_SAN, RONG_SAN)
    expect(thoiGianBay(cheo, tocDoDuongBong(cheo, 'chuyen'))).toBeLessThan(5)
  })
})

describe('vatLyBong.ts KHÔNG rút một lần nào (T720, AC-45.7)', () => {
  const NGUON = import.meta.glob('./vatLyBong.ts', {
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

  const CAC_TEN_CAM = ['rng', 'Math.rand' + 'om', 'hatGiong']

  /*
    Vật lý bóng phải là hàm THUẦN của đầu vào. Một lần rút ở đây là một lần rút
    chen vào dòng ngẫu nhiên của engine v6, và nó làm lệch **mọi** trận đã lưu —
    đúng thứ AC-45.2 hứa không bao giờ xảy ra.
  */
  it('mã nguồn không có một đường nào rút ngẫu nhiên', () => {
    const cacFile = Object.entries(NGUON)
    expect(cacFile.length, 'phải đọc được chính vatLyBong.ts').toBe(1)
    for (const [duongDan, nguon] of cacFile) {
      const code = chiCode(nguon)
      for (const ten of CAC_TEN_CAM) {
        expect(code.includes(ten), `${duongDan} — ${ten}`).toBe(false)
      }
    }
  })

  it('và phép kiểm ấy ĐỎ ĐƯỢC — chú thích thì không tính, mã thì có', () => {
    expect(chiCode('const x = rng.tiep()').includes('rng')).toBe(true)
    expect(chiCode('/* nhắc rng trong chú thích */\nconst x = 1')).not.toContain(
      'rng',
    )
  })
})
