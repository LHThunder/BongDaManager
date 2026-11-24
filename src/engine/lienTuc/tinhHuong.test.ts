import { describe, expect, it } from 'vitest'
import {
  CAC_DAU_HIEU,
  dauHieuCuaPha,
  laTinhHuongQuanTrong,
  type DauHieuTinhHuong,
} from './tinhHuong'

/*
  "Tình huống quan trọng" (T730, AC-37.8).

  Điều kiện ra của task đòi **16 tổ hợp** — 4 toán hạng × bật/tắt — cho đúng
  kết quả. Sinh chúng từ `CAC_DAU_HIEU` chứ không gõ tay 16 dòng: gõ tay thì
  thêm một toán hạng thứ năm sẽ **không** làm phép kiểm đỏ, mà nó phải đỏ.
*/

/** Tổ hợp thứ `mask` trong 16 tổ hợp, mỗi bit một toán hạng. */
function toHop(mask: number): DauHieuTinhHuong {
  const ra: Record<string, boolean> = {}
  CAC_DAU_HIEU.forEach((ten, i) => {
    ra[ten] = (mask & (1 << i)) !== 0
  })
  return ra as unknown as DauHieuTinhHuong
}

describe('laTinhHuongQuanTrong — bốn toán hạng, 16 tổ hợp (T730)', () => {
  it('đúng bốn toán hạng, không hơn không kém', () => {
    expect(CAC_DAU_HIEU).toHaveLength(4)
    expect([...CAC_DAU_HIEU].sort()).toEqual(
      ['biCuu', 'coBan', 'coHoiRoRang', 'theDo'].sort(),
    )
  })

  it('16 tổ hợp: quan trọng khi VÀ CHỈ KHI có ít nhất một toán hạng bật', () => {
    let soBo = 0
    let soQuanTrong = 0
    for (let mask = 0; mask < 1 << CAC_DAU_HIEU.length; mask += 1) {
      const d = toHop(mask)
      const mongDoi = mask !== 0
      expect(laTinhHuongQuanTrong(d), `mask ${mask}`).toBe(mongDoi)
      soBo += 1
      if (mongDoi) soQuanTrong += 1
    }
    expect(soBo, 'số tổ hợp').toBe(16)
    expect(soQuanTrong, 'số tổ hợp quan trọng').toBe(15)
  })

  /*
    Từng toán hạng **một mình** phải đủ. Không có mệnh đề này thì một hàm đòi
    **hai** toán hạng cùng bật vẫn xanh phép kiểm trên ở 11/16 tổ hợp.
  */
  it('mỗi toán hạng ĐỨNG MỘT MÌNH đã đủ làm nên tình huống quan trọng', () => {
    for (const ten of CAC_DAU_HIEU) {
      const d = toHop(0) as unknown as Record<string, boolean>
      d[ten] = true
      expect(
        laTinhHuongQuanTrong(d as unknown as DauHieuTinhHuong),
        `chỉ ${ten}`,
      ).toBe(true)
    }
  })

  it('và pha không có gì xảy ra thì KHÔNG quan trọng', () => {
    expect(laTinhHuongQuanTrong(toHop(0))).toBe(false)
  })
})

describe('dauHieuCuaPha — đọc thẳng từ kết cục pha (T730)', () => {
  const phaMau = {
    coBan: false,
    coHoiRoRang: true,
    biCuu: false,
  } as unknown as Parameters<typeof dauHieuCuaPha>[0]

  it('ba toán hạng lấy ĐÚNG ba trường của kết cục pha', () => {
    const d = dauHieuCuaPha(phaMau, false)
    expect(d.coBan).toBe(false)
    expect(d.coHoiRoRang).toBe(true)
    expect(d.biCuu).toBe(false)
  })

  /*
    Thẻ đỏ là **tham số**, không moi ra từ `pha`: thẻ được rút sau pha bóng,
    trong đường phạm lỗi của `tran.ts`, nên `KetCucPhaV6` không biết gì về nó.
    Moi ra là đoán.
  */
  it('và thẻ đỏ đi vào bằng THAM SỐ, đổi được độc lập', () => {
    expect(dauHieuCuaPha(phaMau, true).theDo).toBe(true)
    expect(dauHieuCuaPha(phaMau, false).theDo).toBe(false)
  })
})

describe('lienTuc/ KHÔNG nhắc tới xG (T730, AC-37.8)', () => {
  const NGUON = import.meta.glob('./*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  /*
    ⚠️ **Điều kiện ra của task viết phép kiểm này là `grep -rl`, và nó CẢNH BÁO
    một cách viết sai**: `grep -c "xG"` trên một thư mục mà thiếu `-r` thì grep
    in `0` ra stdout và lỗi ra stderr, nên điều kiện "= 0" **luôn thoả dù sai**.
    Viết thành phép kiểm thì cái bẫy ấy biến mất — và phép kiểm còn sống sau khi
    người chạy lệnh đi mất.

    Quét **cả thư mục**, trừ chính các file test: file này buộc phải chứa ký
    hiệu ấy để nói về nó.
  */
  const TEN_CAM = 'x' + 'G'

  /** Bóc chú thích khối và chú thích dòng, đúng khuôn `chiCode` của `rng.test.ts`. */
  function chiCode(nguon: string): string {
    return nguon
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  }

  it('không file mã nào của lienTuc/ chứa ký hiệu ấy', () => {
    const cacFile = Object.entries(NGUON).filter(
      ([duongDan]) => !duongDan.endsWith('.test.ts'),
    )
    // ⚠️ CHỐNG RỖNG: glob hỏng thì danh sách rỗng và vòng lặp dưới xanh vô nghĩa.
    expect(cacFile.length, 'số file mã đã quét').toBeGreaterThan(8)
    for (const [duongDan, nguon] of cacFile) {
      expect(chiCode(nguon).includes(TEN_CAM), duongDan).toBe(false)
    }
  })

  it('và phép kiểm ấy ĐỎ ĐƯỢC', () => {
    expect(chiCode(`const x = ${TEN_CAM}Cua(pha)`).includes(TEN_CAM)).toBe(true)
  })
})
