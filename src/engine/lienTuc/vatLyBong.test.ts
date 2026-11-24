import { describe, expect, it } from 'vitest'
import type { LoaiHanhDong } from '../chuoiBong'
import { DAI_SAN, RONG_SAN } from '../hinhHocSan'
import { TRAN_TOC_DO_TUYET_DOI } from './coHoc'
import {
  CAC_THOI_TIET,
  HE_SO_GIO,
  MA_SAT_LAN_SET,
  NGUONG_QUANG_GIO,
  NGUONG_Z_GIO,
  type DieuKienTran,
} from './dieuKien'
import {
  bongTaiThoiDiem,
  G_TRONG_TRUONG,
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
  gocPhatTatCanh,
  laTamDanhDau,
  zKhiToi,
  zTaiNoiToi,
  Z_DANH_DAU_CAO,
  Z_DANH_DAU_THAP,
  Z_TAT_CANH_NHAM,
  bongTrongDieuKien,
  dinhQuyDao,
  giayChamDat,
  giayLanDung,
  quangLanSet,
  quangLechGio,
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

/*
  ====================================================================
  QUẢ TẠT RƠI ĐÚNG TẦM ĐÁNH ĐẦU (T721, AC-38.5).
  ====================================================================

  ⚠️ **Phép kiểm xương sống của khối này là phép ĐỐI CHIẾU HAI ĐƯỜNG.** `zKhiToi`
  giải độ cao bằng **đại số**, còn `phatBong` + `bongTaiThoiDiem` dựng nó bằng
  **quỹ đạo**. Hai đường ấy độc lập nhau, nên nếu đại số sai một dấu thì chúng
  lệch — còn một phép kiểm "z có trong dải không" đứng một mình thì vẫn xanh với
  một hàm chỉ việc `return 2.15`.
*/
const CAC_QUANG_TAT = Array.from({ length: 60 }, (_, i) => i + 1)

describe('zKhiToi — quả tạt rơi trong dải đánh đầu (T721, AC-38.5)', () => {
  it('mọi quãng tạt 1–60 m đều rơi TRONG dải, và phát nhãn đánh đầu', () => {
    let soBo = 0
    for (const quang of CAC_QUANG_TAT) {
      const r = zKhiToi(quang, 'tat-canh')
      expect(r.z, `${quang} m`).toBeGreaterThanOrEqual(Z_DANH_DAU_THAP)
      expect(r.z, `${quang} m`).toBeLessThanOrEqual(Z_DANH_DAU_CAO)
      expect(r.trangThai, `${quang} m`).toBe('danh_dau')
      soBo += 1
    }
    // ⚠️ CHỐNG RỖNG.
    expect(soBo, 'số quãng đã thử').toBe(60)
  })

  it('và rơi đúng GIỮA dải, nên lề mỗi phía là 0,65 m', () => {
    for (const quang of CAC_QUANG_TAT) {
      expect(zKhiToi(quang, 'tat-canh').z, `${quang} m`).toBeCloseTo(
        Z_TAT_CANH_NHAM,
        9,
      )
    }
    expect(Z_TAT_CANH_NHAM - Z_DANH_DAU_THAP).toBeCloseTo(0.65, 10)
    expect(Z_DANH_DAU_CAO - Z_TAT_CANH_NHAM).toBeCloseTo(0.65, 10)
  })

  /*
    ⚠️⚠️ XƯƠNG SỐNG. Đại số của `zKhiToi` và quỹ đạo của T720 phải nói **cùng
    một con số**. Đây là phép kiểm duy nhất bắt được một dấu sai trong phép giải
    góc phát: một hàm `return 2.15` vẫn xanh mọi phép kiểm khác của khối này.
  */
  it('ĐỐI CHIẾU: đại số và quỹ đạo ra cùng một độ cao', () => {
    let soBo = 0
    let lechLonNhat = 0
    for (const quang of CAC_QUANG_TAT) {
      const tu = { x: 10, y: 20 }
      const den = { x: 10 + quang, y: 20 }
      const v = tocDoDuongBong(quang, 'tat-canh')
      const goc = gocPhatTatCanh(quang, v)
      const theoQuyDao = bongTaiThoiDiem(
        phatBong(tu, den, 'tat-canh', goc),
        thoiGianBay(quang, v),
      ).z
      lechLonNhat = Math.max(
        lechLonNhat,
        Math.abs(theoQuyDao - zKhiToi(quang, 'tat-canh').z),
      )
      soBo += 1
    }
    expect(lechLonNhat, 'lệch giữa hai đường, mét').toBeLessThan(1e-9)
    expect(soBo, 'số quãng đã đối chiếu').toBe(60)
  })

  /*
    `chuyen` và `re-bong` có `z ≡ 0` — chữ của AC-38.5. `sut` cũng sệt, vì D129
    **đo** rồi mới chốt: `tat-canh` là hành động duy nhất có z vượt 1,5 m
    (3.138/37.202 bước không-sút = 8,4%).
  */
  it('chuyen, re-bong và sut đều SỆT: z ≡ 0, không nhãn đánh đầu', () => {
    for (const loai of ['chuyen', 're-bong', 'sut'] as const) {
      for (const quang of [1, 10, 24.9, 25, 40, 60]) {
        const r = zKhiToi(quang, loai)
        expect(r.z, `${loai} ${quang} m`).toBe(0)
        expect(r.trangThai, `${loai} ${quang} m`).toBe(null)
      }
    }
  })

  /*
    Vị từ dải gọi được **cả hai nhánh**, nên nhánh `false` không phải mã chết mà
    là một cái chốt: nếu `Z_TAT_CANH_NHAM` bị đổi ra ngoài dải thì nhãn
    `'danh_dau'` **tắt** chứ không đi kèm một độ cao sai.
  */
  it('vị từ dải đóng ở CẢ HAI mép, và ngoài dải thì nói không', () => {
    expect(laTamDanhDau(Z_DANH_DAU_THAP)).toBe(true)
    expect(laTamDanhDau(Z_DANH_DAU_CAO)).toBe(true)
    expect(laTamDanhDau(Z_TAT_CANH_NHAM)).toBe(true)
    expect(laTamDanhDau(Z_DANH_DAU_THAP - 1e-9)).toBe(false)
    expect(laTamDanhDau(Z_DANH_DAU_CAO + 1e-9)).toBe(false)
    expect(laTamDanhDau(0)).toBe(false)
    expect(laTamDanhDau(10)).toBe(false)
  })

  /*
    Hai con số 1,5 m sống ở hai file (`Z_DANH_DAU_THAP` ở đây,  `NGUONG_Z_GIO` ở
    `dieuKien.ts`) vì để chung thì hai module nhập vòng nhau — T723 sẽ nhập
    `MA_SAT_LAN_SET` từ `dieuKien.ts`. Phép kiểm này là thứ giữ hai bản sao khớp
    nhau: "bóng bổng" phải có **một** định nghĩa.
  */
  it('sàn dải đánh đầu BẰNG ngưỡng độ cao của gió', () => {
    expect(Z_DANH_DAU_THAP).toBe(NGUONG_Z_GIO)
  })

  /*
    ⚠️ **Góc phát KHÔNG đơn điệu trên toàn dải, và tôi nêu cả hai chỗ nó tăng
    kèm con số — đo trên bước 0,25 m.**

      1. **[25; 26,25] m — tăng tổng 0,0019°.** Hai dải tốc độ có **độ dốc khác
         nhau** (dải ngắn lên 8/25 = 0,32 m/s mỗi mét, dải dài lên 10/35 =
         0,286), nên ngay sau chỗ chia, tốc độ lớn chậm hơn quãng và quả tạt
         phải nâng lên **một phần nghìn độ**. Mắt không thấy nổi con số ấy.
      2. **Sau 60 m — tăng 0,061° mỗi 0,25 m.** Đây **không** phải lỗi mà là
         vật lý: `QUANG_CHUYEN_DAI_NHAT` là chỗ tốc độ **chạm trần** 30 m/s, nên
         xa hơn nữa thì không đánh mạnh hơn được và chỉ còn cách **nâng cao
         hơn**. Một quả bóng 90 m **phải** bổng hơn một quả 60 m.

    Một phép kiểm "giảm trên toàn dải" vì thế sẽ là một khẳng định **sai**. Ba
    phép kiểm dưới đây nói đúng thứ đúng: giảm nghiêm ngặt ở hai đoạn thật sự
    giảm, chỗ chia lệch dưới một phần trăm độ, và quá trần thì tăng.
  */
  it('quả tạt càng dài càng PHẲNG trên dải ngắn, và trên dải dài sau 27 m', () => {
    for (const dai of [
      CAC_QUANG_TAT.filter((q) => q < NGUONG_CHUYEN_DAI),
      CAC_QUANG_TAT.filter((q) => q >= 27),
    ]) {
      let truoc = Infinity
      for (const quang of dai) {
        const goc = gocPhatTatCanh(quang, tocDoDuongBong(quang, 'tat-canh'))
        expect(goc, `${quang} m`).toBeLessThan(truoc)
        expect(goc, `${quang} m`).toBeGreaterThan(0)
        truoc = goc
      }
      expect(dai.length, 'đoạn phải có mẫu').toBeGreaterThan(20)
    }
  })

  it('chỗ chia hai dải lệch dưới một phần trăm độ, không phải một bước nhảy', () => {
    const goc = (q: number) => gocPhatTatCanh(q, tocDoDuongBong(q, 'tat-canh'))
    let tangTongQuaChoChia = 0
    for (let q = NGUONG_CHUYEN_DAI; q < 27; q += 0.25) {
      tangTongQuaChoChia += Math.max(0, goc(q + 0.25) - goc(q))
    }
    expect(tangTongQuaChoChia, 'tăng tổng qua chỗ chia, độ').toBeLessThan(0.01)
    // Và nhìn từ xa thì quả tạt dài VẪN phẳng hơn quả tạt ngắn, rất nhiều.
    expect(goc(60)).toBeLessThan(goc(1) - 40)
  })

  /*
    Quá quãng đánh hết lực thì tốc độ chạm trần, nên quả bóng chỉ còn cách nâng
    cao hơn. Phép kiểm này canh đúng điều đó — và nó là **ca ngược** của phép
    kiểm trên: nếu một ngày ai bỏ trần tốc độ thì nó đỏ.
  */
  it('quá quãng đánh hết lực thì góc phát TĂNG lại, vì tốc độ chạm trần', () => {
    const goc = (q: number) => gocPhatTatCanh(q, tocDoDuongBong(q, 'tat-canh'))
    expect(goc(QUANG_CHUYEN_DAI_NHAT + 10)).toBeGreaterThan(
      goc(QUANG_CHUYEN_DAI_NHAT),
    )
    expect(
      tocDoDuongBong(QUANG_CHUYEN_DAI_NHAT + 10, 'tat-canh'),
    ).toBeCloseTo(tocDoDuongBong(QUANG_CHUYEN_DAI_NHAT, 'tat-canh'), 10)
  })

  it('zTaiNoiToi giữ ĐÚNG chữ ký contract, và góc 0 cho z âm', () => {
    // Góc 0 nghĩa là không nâng lên: trọng lực kéo nó xuống dưới mặt sân.
    expect(zTaiNoiToi(20, 18, 0)).toBeLessThan(0)
    // Và góc đã giải thì ra đúng chỗ nhắm.
    expect(zTaiNoiToi(20, 18, gocPhatTatCanh(20, 18))).toBeCloseTo(
      Z_TAT_CANH_NHAM,
      9,
    )
  })

  it('quãng 0 không sinh NaN và không phát nhãn', () => {
    expect(gocPhatTatCanh(0, 20)).toBe(0)
    const r = zKhiToi(0, 'tat-canh')
    expect(Number.isNaN(r.z)).toBe(false)
    expect(r.trangThai).toBe(null)
  })
})

/*
  ====================================================================
  MA SÁT LĂN SỆT VÀ GIÓ (T723, AC-38.7 + AC-38.9).
  ====================================================================

  ⚠️ **Hai phép kiểm xương sống của khối này là một CẶP, và chúng chỉ có nghĩa
  khi đi cùng nhau** — đúng mệnh đề "chống mã chết" mà `tasks.md` T723 đòi:

    1. gió 0 so với gió 7,75 m/s trên một đường **sệt** phải ra vị trí **giống
       hệt từng số** — tức cửa gió **thật sự đóng**;
    2. cùng hai mức gió ấy trên một đường **bổng và dài** phải ra vị trí **khác
       nhau** — tức đoạn mã gió **không phải mã chết**.

  Chỉ có (1) thì một hàm bỏ hẳn gió cũng xanh. Chỉ có (2) thì một hàm thổi gió
  vào **mọi** đường bóng cũng xanh. Phải cả hai.
*/

function dieuKienThu(
  thoiTiet: DieuKienTran['thoiTiet'],
  tocDoGio: number,
  huongGio = 45,
): DieuKienTran {
  return { thoiTiet, tocDoGio, huongGio }
}

const GIO_THU = 7.75

describe('ma sát lăn sệt (T723, AC-38.7)', () => {
  /*
    Điều kiện ra của task: **đơn điệu nghiêm ngặt** trên năm giá trị. Phép kiểm
    này đo nó trên **hành vi** (quãng bóng lăn được), không chỉ trên bảng số —
    một bảng đúng mà `quangLanSet` chia nhầm thì vẫn phải đỏ.
  */
  it('cùng một lực đẩy: càng ướt bóng lăn càng XA, đơn điệu nghiêm ngặt', () => {
    const v = 20
    const quang = CAC_THOI_TIET.map((tt) => quangLanSet(v, tt))
    for (let i = 1; i < quang.length; i += 1) {
      expect(
        quang[i]!,
        `${CAC_THOI_TIET[i]} phải xa hơn ${CAC_THOI_TIET[i - 1]}`,
      ).toBeGreaterThan(quang[i - 1]!)
    }
    // Và chênh lệch không phải chuyện nhỏ: mưa to cho hơn gấp đôi trời nóng.
    expect(quang[4]! / quang[0]!).toBeGreaterThan(2)
  })

  it('quãng lăn đúng v²/(2a), và khớp vị trí tích ra lúc dừng', () => {
    for (const tt of CAC_THOI_TIET) {
      const v = 18
      expect(quangLanSet(v, tt), tt).toBeCloseTo(
        (v * v) / (2 * MA_SAT_LAN_SET[tt]),
        9,
      )
      /*
        Đối chiếu hai đường: công thức `v²/(2a)` so với vị trí mà
        `bongTrongDieuKien` tích ra ở đúng giây dừng. Một đường chuyền sệt chạm
        đất ngay giây 0, nên cả đường bóng của nó là pha lăn.
      */
      const phat = phatBong({ x: 5, y: 34 }, { x: 25, y: 34 }, 'chuyen')
      const vDau = Math.hypot(phat.vx, phat.vy)
      const tDung = giayLanDung(vDau, tt)
      const diem = bongTrongDieuKien(phat, tDung, dieuKienThu(tt, 0), 20)
      expect(diem.x - phat.x, tt).toBeCloseTo(quangLanSet(vDau, tt), 9)
    }
  })

  /*
    Chữ của AC-38.7: sân **khô** chậm dần **1–2 m/s²**. Phép kiểm này đo gia tốc
    **thật** từ hai mốc vận tốc liền nhau, không đọc bảng.
  */
  it('gia tốc chậm dần ĐO ĐƯỢC khớp bảng, và sân khô nằm trong 1–2 m/s²', () => {
    for (const tt of CAC_THOI_TIET) {
      const phat = phatBong({ x: 5, y: 34 }, { x: 60, y: 34 }, 'chuyen')
      const t1 = 0.4
      const t2 = 0.9
      const v1 = bongTrongDieuKien(phat, t1, dieuKienThu(tt, 0), 55)
      const v2 = bongTrongDieuKien(phat, t2, dieuKienThu(tt, 0), 55)
      const a =
        (Math.hypot(v1.vx, v1.vy) - Math.hypot(v2.vx, v2.vy)) / (t2 - t1)
      expect(a, tt).toBeCloseTo(MA_SAT_LAN_SET[tt], 9)
    }
    for (const tt of ['nong', 'kho', 'am'] as const) {
      expect(MA_SAT_LAN_SET[tt], tt).toBeGreaterThanOrEqual(1)
      expect(MA_SAT_LAN_SET[tt], tt).toBeLessThanOrEqual(2)
    }
  })

  it('và quả bóng DỪNG rồi thì nằm im, không lăn ngược', () => {
    const phat = phatBong({ x: 5, y: 34 }, { x: 30, y: 34 }, 'chuyen')
    const vDau = Math.hypot(phat.vx, phat.vy)
    const tDung = giayLanDung(vDau, 'kho')
    const luc = bongTrongDieuKien(phat, tDung, dieuKienThu('kho', 0), 25)
    for (const t of [tDung + 0.1, tDung + 1, tDung + 10]) {
      const sau = bongTrongDieuKien(phat, t, dieuKienThu('kho', 0), 25)
      expect(sau.x, `giây ${t.toFixed(2)}`).toBeCloseTo(luc.x, 9)
      expect(sau.y, `giây ${t.toFixed(2)}`).toBeCloseTo(luc.y, 9)
      expect(Math.hypot(sau.vx, sau.vy), `giây ${t.toFixed(2)}`).toBeCloseTo(
        0,
        9,
      )
    }
  })

  /*
    ⚠️ **Ma sát của MẶT SÂN không được ăn vào pha BAY — và phép kiểm này là thứ
    duy nhất bắt được.** Tôi đã đột biến đúng chỗ ấy (`t - tDat` → `t`, tức cho
    ma sát tính từ giây 0) và **43/43 phép kiểm vẫn xanh**: đường chuyền sệt có
    `tDat = 0` nên không đổi gì, còn hai phép kiểm gió thì so gió-0 với gió-7,75
    **trên cùng một ma sát**, nên đột biến triệt tiêu ở cả hai vế.

    Hệ quả nếu để nguyên: mọi quả tạt **rơi ngắn** hơn đích, và AC-38.6 ("thời
    gian bay khớp khoảng cách chia tốc độ") vỡ ở đúng những pha bổng. Phép kiểm
    này đòi quả tạt tới **đúng đích**, trong **cả năm** kiểu thời tiết.
  */
  it('quả tạt tới ĐÚNG đích trong cả năm kiểu thời tiết — không khí không có cỏ', () => {
    const quang = 40
    const tu = { x: 5, y: 34 }
    const den = { x: 5 + quang, y: 34 }
    const v = tocDoDuongBong(quang, 'tat-canh')
    const phat = phatBong(tu, den, 'tat-canh', gocPhatTatCanh(quang, v))
    const T = thoiGianBay(quang, v)
    for (const tt of CAC_THOI_TIET) {
      const toi = bongTrongDieuKien(phat, T, dieuKienThu(tt, 0), quang)
      expect(Math.hypot(toi.x - den.x, toi.y - den.y), tt).toBeLessThan(1e-9)
    }
  })

  it('và pha lăn không bao giờ rời mặt đất', () => {
    const phat = phatBong({ x: 5, y: 34 }, { x: 40, y: 34 }, 'chuyen')
    for (let t = 0; t <= 8; t += 0.1) {
      expect(
        bongTrongDieuKien(phat, t, dieuKienThu('mua', 0), 35).z,
        `giây ${t.toFixed(1)}`,
      ).toBe(0)
    }
  })
})

describe('gió CHỈ ăn vào bóng bổng dài (T723, AC-38.9)', () => {
  /*
    ⚠️⚠️ **Mệnh đề CHỐNG MÃ CHẾT, nửa thứ nhất.** Đường sệt: gió 0 và gió 7,75
    m/s phải ra vị trí **giống hệt từng số**.
  */
  it('đường SỆT: gió 0 và gió 7,75 m/s ra vị trí GIỐNG HỆT từng số', () => {
    const phat = phatBong({ x: 5, y: 34 }, { x: 60, y: 34 }, 'chuyen')
    let soMoc = 0
    for (let t = 0; t <= 5; t += 0.1) {
      const khongGio = bongTrongDieuKien(phat, t, dieuKienThu('kho', 0), 55)
      const coGio = bongTrongDieuKien(phat, t, dieuKienThu('kho', GIO_THU), 55)
      expect(coGio, `giây ${t.toFixed(1)}`).toEqual(khongGio)
      soMoc += 1
    }
    expect(soMoc, 'số mốc đã so').toBeGreaterThan(40)
  })

  /*
    ⚠️⚠️ **Nửa thứ hai, và không có nó thì nửa trên vô nghĩa:** trên một đường
    **bổng và dài**, hai mức gió ấy phải ra vị trí **khác nhau**. Thiếu mệnh đề
    này thì một hàm bỏ hẳn gió cũng xanh.
  */
  it('đường BỔNG DÀI: gió 7,75 m/s thổi lệch một quãng ĐO ĐƯỢC', () => {
    const quang = 40
    const tu = { x: 5, y: 34 }
    const den = { x: 5 + quang, y: 34 }
    const v = tocDoDuongBong(quang, 'tat-canh')
    const phat = phatBong(tu, den, 'tat-canh', gocPhatTatCanh(quang, v))
    const T = thoiGianBay(quang, v)

    const khongGio = bongTrongDieuKien(phat, T, dieuKienThu('kho', 0), quang)
    const coGio = bongTrongDieuKien(phat, T, dieuKienThu('kho', GIO_THU), quang)
    const lech = Math.hypot(coGio.x - khongGio.x, coGio.y - khongGio.y)

    expect(lech, 'quãng lệch, mét').toBeGreaterThan(0)
    // Và đúng bằng công thức: hệ số × tốc độ gió × thời gian trên không.
    expect(lech).toBeCloseTo(quangLechGio(dieuKienThu('kho', GIO_THU), T), 9)
    expect(lech).toBeCloseTo(HE_SO_GIO * GIO_THU * T, 9)
    /*
      Con số thật, để biết nó có đáng kể trên hình hay không: một quả tạt 40 m
      trong gió 7,75 m/s lệch hơn **nửa mét**. Thấy được, mà không méo pha bóng.
    */
    expect(lech).toBeGreaterThan(0.5)
    expect(lech).toBeLessThan(2)
  })

  /*
    Cửa thứ hai: quả bóng **bổng mà NGẮN** cũng không bị gió. Đây là chỗ phân
    biệt "gió ăn vào bóng bổng" với "gió ăn vào bóng bổng **dài**" — chữ của
    AC-38.9.
  */
  it('đường BỔNG NGẮN (dưới 25 m): gió không đổi được một số nào', () => {
    const quang = NGUONG_QUANG_GIO - 1
    const tu = { x: 5, y: 34 }
    const den = { x: 5 + quang, y: 34 }
    const v = tocDoDuongBong(quang, 'tat-canh')
    const phat = phatBong(tu, den, 'tat-canh', gocPhatTatCanh(quang, v))
    for (let t = 0; t <= 2; t += 0.1) {
      expect(
        bongTrongDieuKien(phat, t, dieuKienThu('kho', GIO_THU), quang),
        `giây ${t.toFixed(1)}`,
      ).toEqual(bongTrongDieuKien(phat, t, dieuKienThu('kho', 0), quang))
    }
    // Và chắc rằng nó THẬT SỰ bổng — không thì phép kiểm trên xanh vì lý do khác.
    expect(dinhQuyDao(phat)).toBeGreaterThan(NGUONG_Z_GIO)
  })

  it('đỉnh quỹ đạo: quả tạt vượt ngưỡng gió, đường sệt thì không', () => {
    const quang = 40
    const v = tocDoDuongBong(quang, 'tat-canh')
    const tat = phatBong(
      { x: 5, y: 34 },
      { x: 45, y: 34 },
      'tat-canh',
      gocPhatTatCanh(quang, v),
    )
    expect(dinhQuyDao(tat)).toBeGreaterThan(NGUONG_Z_GIO)
    expect(dinhQuyDao(phatBong({ x: 5, y: 34 }, { x: 45, y: 34 }, 'chuyen'))).toBe(
      0,
    )
  })

  it('gió lặng thì không lệch, dù đường bóng bổng và dài', () => {
    expect(quangLechGio(dieuKienThu('kho', 0), 2)).toBe(0)
  })

  /*
    Và hướng gió phải **dùng tới**: hai trận cùng tốc độ gió mà khác hướng thì
    quả tạt lệch về hai phía khác nhau. Không có mệnh đề này thì `huongGio` của
    `dieuKien.ts` là một trường không ai đọc.
  */
  it('và HƯỚNG gió dùng tới: hai hướng cho hai chỗ rơi khác nhau', () => {
    const quang = 40
    const v = tocDoDuongBong(quang, 'tat-canh')
    const phat = phatBong(
      { x: 5, y: 34 },
      { x: 45, y: 34 },
      'tat-canh',
      gocPhatTatCanh(quang, v),
    )
    const T = thoiGianBay(quang, v)
    const bac = bongTrongDieuKien(phat, T, dieuKienThu('kho', GIO_THU, 90), quang)
    const nam = bongTrongDieuKien(
      phat,
      T,
      dieuKienThu('kho', GIO_THU, 270),
      quang,
    )
    expect(Math.abs(bac.y - nam.y), 'lệch giữa hai hướng gió').toBeGreaterThan(1)
  })

  it('và THỜI TIẾT cũng dùng tới ở pha lăn: hai trận khác nhau, hai chỗ dừng', () => {
    const phat = phatBong({ x: 5, y: 34 }, { x: 60, y: 34 }, 'chuyen')
    const nong = bongTrongDieuKien(phat, 4, dieuKienThu('nong', 0), 55)
    const muaTo = bongTrongDieuKien(phat, 4, dieuKienThu('mua-to', 0), 55)
    expect(muaTo.x - nong.x, 'mưa to lăn xa hơn, mét').toBeGreaterThan(5)
  })
})
