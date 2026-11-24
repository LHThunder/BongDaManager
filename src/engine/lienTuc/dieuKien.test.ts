import { describe, expect, it } from 'vitest'
import { BANG_CHU_MA_TRAN, DO_DAI_MA_TRAN } from '../rng'
import {
  CAC_THOI_TIET,
  dieuKienTuMaTran,
  GIO_TOI_DA,
  gioCoAnVaoDuongBong,
  HE_SO_GIO,
  MA_SAT_LAN_SET,
  NGUONG_QUANG_GIO,
  NGUONG_Z_GIO,
  TRON_DIEU_KIEN,
  TRONG_SO_THOI_TIET,
  type ThoiTiet,
} from './dieuKien'

/*
  Thời tiết và gió (T722, AC-38.9 + AC-45.7, quyết định D130).

  ⚠️ **Điều kiện ra của task nói "20.000 mã"**, nên mã thử phải sinh được chứ
  không chép tay. `maThu` rải mười ký tự theo một bước **nguyên tố cùng** với 32
  nên nó đi hết bảng chữ Crockford chứ không lặp lại vài ký tự.
*/
const SO_MA_THU = 20_000

function maThu(i: number): string {
  let ma = ''
  let h = i + 1
  for (let k = 0; k < DO_DAI_MA_TRAN; k += 1) {
    ma += BANG_CHU_MA_TRAN[h % BANG_CHU_MA_TRAN.length]
    h = Math.floor(h / 3) + (i + 1) * (k + 7)
  }
  return ma
}

describe('dieuKienTuMaTran — tất định từ mã trận (T722, AC-38.9)', () => {
  it(`${SO_MA_THU} mã: cùng mã trận luôn ra cùng thời tiết và cùng gió`, () => {
    let soMa = 0
    for (let i = 0; i < SO_MA_THU; i += 1) {
      const ma = maThu(i)
      expect(dieuKienTuMaTran(ma), ma).toEqual(dieuKienTuMaTran(ma))
      soMa += 1
    }
    expect(soMa, 'số mã đã thử').toBe(SO_MA_THU)
  })

  it('và mọi giá trị nằm trong dải của nó', () => {
    for (let i = 0; i < SO_MA_THU; i += 1) {
      const d = dieuKienTuMaTran(maThu(i))
      expect(CAC_THOI_TIET).toContain(d.thoiTiet)
      expect(d.tocDoGio, maThu(i)).toBeGreaterThanOrEqual(0)
      expect(d.tocDoGio, maThu(i)).toBeLessThanOrEqual(GIO_TOI_DA)
      expect(d.huongGio, maThu(i)).toBeGreaterThanOrEqual(0)
      expect(d.huongGio, maThu(i)).toBeLessThan(360)
    }
  })

  /*
    ⚠️ **CHỐNG RỖNG, và ở task này nó là phép kiểm quan trọng nhất.** Một hàm
    trả về `'kho'` cho **mọi** mã trận sẽ xanh cả hai phép kiểm trên: nó tất
    định, và `'kho'` nằm trong dải. Phép kiểm này đòi cả **năm** kiểu thời tiết
    thật sự xuất hiện, và đòi thứ tự tần suất khớp bảng trọng số.
  */
  it('cả NĂM kiểu thời tiết đều xuất hiện, và theo đúng thứ tự trọng số', () => {
    const dem: Record<ThoiTiet, number> = {
      nong: 0,
      kho: 0,
      am: 0,
      mua: 0,
      'mua-to': 0,
    }
    for (let i = 0; i < SO_MA_THU; i += 1) {
      dem[dieuKienTuMaTran(maThu(i)).thoiTiet] += 1
    }
    for (const tt of CAC_THOI_TIET) {
      expect(dem[tt], `số trận ${tt}`).toBeGreaterThan(0)
    }
    // Sân khô là kiểu phổ biến nhất, mưa to là kiểu hiếm nhất.
    expect(dem.kho).toBeGreaterThan(dem.nong)
    expect(dem.kho).toBeGreaterThan(dem.am)
    expect(dem['mua-to']).toBeLessThan(dem.mua)
    expect(dem['mua-to']).toBeLessThan(dem.nong)
    /*
      Và tần suất đo được phải ở gần trọng số — lề 3 điểm phần trăm trên 20.000
      mã. Không có mệnh đề này thì một bảng trọng số bị đảo vẫn xanh miễn thứ tự
      lớn-nhỏ còn đúng.
    */
    for (const tt of CAC_THOI_TIET) {
      expect(dem[tt] / SO_MA_THU, `tần suất ${tt}`).toBeCloseTo(
        TRONG_SO_THOI_TIET[tt],
        1,
      )
    }
  })

  /*
    Ba đại lượng phải lấy từ **ba lớp băm khác nhau**. Nếu dùng chung một lớp
    thì mọi trận mưa to đều có gió cùng một hướng — người xem thấy điều đó
    trước khi phép kiểm nào thấy, đúng cách người dùng đã bắt bốn lỗi ở T518.
  */
  it('thời tiết KHÔNG kéo theo hướng gió: mỗi kiểu có đủ bốn phía gió', () => {
    const phia = new Map<string, Set<number>>()
    for (let i = 0; i < SO_MA_THU; i += 1) {
      const d = dieuKienTuMaTran(maThu(i))
      const o = phia.get(d.thoiTiet) ?? new Set<number>()
      o.add(Math.floor(d.huongGio / 90))
      phia.set(d.thoiTiet, o)
    }
    for (const tt of CAC_THOI_TIET) {
      expect(phia.get(tt)?.size, `số phía gió của ${tt}`).toBe(4)
    }
  })

  it('và gió rải đều, không dồn vào một phía', () => {
    const dem = [0, 0, 0, 0]
    for (let i = 0; i < SO_MA_THU; i += 1) {
      dem[Math.floor(dieuKienTuMaTran(maThu(i)).huongGio / 90)]! += 1
    }
    for (const [k, so] of dem.entries()) {
      expect(so / SO_MA_THU, `phía ${k}`).toBeCloseTo(0.25, 1)
    }
  })

  it('hằng trộn KHÁC bước tiến của mulberry32', async () => {
    const { BUOC_HAT_GIONG } = await import('../rng')
    expect(TRON_DIEU_KIEN).not.toBe(BUOC_HAT_GIONG)
  })
})

describe('MA_SAT_LAN_SET — bảng ở đúng một chỗ (T722, AC-38.7)', () => {
  it('đúng năm kiểu, và mọi giá trị dương', () => {
    expect(Object.keys(MA_SAT_LAN_SET)).toHaveLength(CAC_THOI_TIET.length)
    for (const tt of CAC_THOI_TIET) {
      expect(MA_SAT_LAN_SET[tt], tt).toBeGreaterThan(0)
    }
  })

  /*
    Hai mệnh đề của AC-38.7 viết thành cấu trúc: sân **khô** chậm dần **1–2
    m/s²**, sân **ướt** chậm dần **ít hơn** mức đó. Ba kiểu đầu là sân khô, hai
    kiểu mưa là sân ướt.
  */
  it('sân khô trong dải 1–2 m/s², sân ướt DƯỚI 1 m/s²', () => {
    for (const tt of ['nong', 'kho', 'am'] as const) {
      expect(MA_SAT_LAN_SET[tt], tt).toBeGreaterThanOrEqual(1)
      expect(MA_SAT_LAN_SET[tt], tt).toBeLessThanOrEqual(2)
    }
    for (const tt of ['mua', 'mua-to'] as const) {
      expect(MA_SAT_LAN_SET[tt], tt).toBeLessThan(1)
    }
  })

  /*
    ⚠️ **Chiều của bảng là chiều người dùng chốt 2026-11-23: sân ướt thì bóng đi
    XA hơn.** Bản mô tả gốc tự nói ngược ở mục 10 và mục 21, nên nếu một ngày ai
    đó "sửa lại cho đúng trực giác" thì phép kiểm này đỏ — và nó phải đỏ.
  */
  it('và CHIỀU đúng: càng ướt, ma sát càng NHỎ (bóng đi xa hơn)', () => {
    for (let i = 1; i < CAC_THOI_TIET.length; i += 1) {
      const truoc = CAC_THOI_TIET[i - 1]!
      const nay = CAC_THOI_TIET[i]!
      expect(
        MA_SAT_LAN_SET[nay],
        `${nay} phải nhỏ hơn ${truoc}`,
      ).toBeLessThan(MA_SAT_LAN_SET[truoc])
    }
  })
})

describe('hai cửa của gió (T722, AC-38.9)', () => {
  it('gió ăn vào bóng bổng dài, và CHỈ nó', () => {
    // Bổng và dài: ăn.
    expect(gioCoAnVaoDuongBong(2.5, 40)).toBe(true)
    // Bổng mà ngắn: không ăn.
    expect(gioCoAnVaoDuongBong(2.5, 24.9)).toBe(false)
    // Dài mà sệt: không ăn.
    expect(gioCoAnVaoDuongBong(0, 40)).toBe(false)
    expect(gioCoAnVaoDuongBong(NGUONG_Z_GIO, 40)).toBe(false)
    // Sệt và ngắn: không ăn.
    expect(gioCoAnVaoDuongBong(0, 5)).toBe(false)
  })

  it('và đúng NGƯỠNG, không phải gần ngưỡng', () => {
    expect(gioCoAnVaoDuongBong(NGUONG_Z_GIO + 1e-9, NGUONG_QUANG_GIO)).toBe(true)
    expect(gioCoAnVaoDuongBong(NGUONG_Z_GIO, NGUONG_QUANG_GIO)).toBe(false)
    expect(gioCoAnVaoDuongBong(NGUONG_Z_GIO + 1, NGUONG_QUANG_GIO - 1e-9)).toBe(
      false,
    )
  })

  /*
    Ngưỡng độ cao của gió phải **bằng** sàn dải đánh đầu của AC-38.5: dưới 1,5 m
    là bóng "trong tầm chân, đùi, ngực", và một quả bóng như thế không phải bóng
    bổng. Hai con số trôi khỏi nhau là hai định nghĩa "bóng bổng" khác nhau.
  */
  it('ngưỡng độ cao của gió BẰNG sàn dải đánh đầu của AC-38.5', () => {
    expect(NGUONG_Z_GIO).toBe(1.5)
  })

  it('và hệ số gió là một hệ số nhỏ, không phải một gia tốc', () => {
    expect(HE_SO_GIO).toBeGreaterThan(0)
    expect(HE_SO_GIO).toBeLessThan(1)
    // Quãng lệch lớn nhất có thể: gió tối đa, đường bóng dài nhất ~5 giây.
    expect(HE_SO_GIO * GIO_TOI_DA * 5).toBeLessThan(5)
  })
})

describe('dieuKien.ts KHÔNG rút một lần nào (T722, AC-45.7)', () => {
  const NGUON = import.meta.glob('./dieuKien.ts', {
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

  /*
    ⚠️ **Đây là bất biến mà D130 dựng cả quyết định lên.** Một lần rút ở đây cột
    thời tiết vào số lần rút đứng trước nó, nên thêm một lần rút ở bất cứ đâu là
    đổi thời tiết của MỌI trận đã lưu. Chữ ký `(maTran: string)` đã làm việc ấy
    **không thể**; phép kiểm này canh cả những đường vòng.
  */
  it('mã nguồn không gọi `next`, không tạo Rng, không Math.random', () => {
    const cacFile = Object.entries(NGUON)
    expect(cacFile.length, 'phải đọc được chính dieuKien.ts').toBe(1)
    for (const [duongDan, nguon] of cacFile) {
      const code = chiCode(nguon)
      for (const ten of ['taoRng', '.next(', 'Math.rand' + 'om', 'Rng']) {
        expect(code.includes(ten), `${duongDan} — ${ten}`).toBe(false)
      }
    }
  })

  it('và phép kiểm ấy ĐỎ ĐƯỢC — chú thích thì không tính, mã thì có', () => {
    expect(chiCode('const r = taoRng(ma)').includes('taoRng')).toBe(true)
    expect(chiCode('/* nhắc taoRng trong chú thích */\nlet x = 1')).not.toContain(
      'taoRng',
    )
  })

  /*
    Và một mệnh đề nữa của điều kiện ra: module này **chỉ** gọi lại hàm băm đã
    có, không viết hàm băm thứ ba. `grep` hằng số xmur3 trong chính nó phải rỗng
    — bản sao thứ hai đã nằm ở `ui/daoDong.ts` và đó đã là một bản quá nhiều.
  */
  it('không chép hằng số xmur3 lần thứ ba', () => {
    const code = chiCode(Object.values(NGUON)[0]!)
    for (const hang of ['2246822507', '3266489909', '3432918353', '1779033703']) {
      expect(code.includes(hang), hang).toBe(false)
    }
    expect(code.includes('hatGiongTuMaTran'), 'phải GỌI LẠI xmur3').toBe(true)
  })
})
