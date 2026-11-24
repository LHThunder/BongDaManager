import { describe, expect, it } from 'vitest'
import { MOC_MOI_PHUT } from '../engine/lienTuc/moc'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { mocVeTaiThoiDiem } from './mocVe'

/*
  Đồng hồ vẽ → chỉ số mốc (T732).

  ⚠️ **Phép kiểm duyệt `Object.entries(MS_MOI_PHUT)`, không gõ tên mức nào.**
  Nhờ thế mức tốc độ thứ sáu — hay một lần đổi số của mức cũ — **tự động** vào
  tập mẫu. Đây đúng khuôn mà `noiSuy.test.ts` và `san2D.test.ts` đã dùng cho
  cùng hằng số ấy.
*/
const CAC_MUC = Object.entries(MS_MOI_PHUT)

describe('mocVeTaiThoiDiem — một phép chia, cả năm mức (T732)', () => {
  it('cả năm mức: đầu phút ở mốc 0, cuối phút ở mốc cuối', () => {
    let soMuc = 0
    for (const [ten, ms] of CAC_MUC) {
      expect(mocVeTaiThoiDiem(0, ms).chiSo, `${ten} đầu phút`).toBe(0)
      expect(mocVeTaiThoiDiem(0, ms).phan, `${ten} đầu phút`).toBe(0)
      expect(mocVeTaiThoiDiem(ms, ms).chiSo, `${ten} hết phút`).toBe(
        MOC_MOI_PHUT - 1,
      )
      soMuc += 1
    }
    // ⚠️ CHỐNG RỖNG: bảng mức rỗng thì vòng trên xanh mà không đo gì.
    expect(soMuc, 'số mức tốc độ đã duyệt').toBeGreaterThanOrEqual(5)
  })

  it('cả năm mức: chỉ số mốc KHÔNG BAO GIỜ ra ngoài lô', () => {
    for (const [ten, ms] of CAC_MUC) {
      for (let i = 0; i <= 120; i += 1) {
        const m = mocVeTaiThoiDiem((ms * i) / 100, ms)
        expect(m.chiSo, `${ten} ${i}%`).toBeGreaterThanOrEqual(0)
        expect(m.chiSo, `${ten} ${i}%`).toBeLessThan(MOC_MOI_PHUT)
        expect(m.phan, `${ten} ${i}%`).toBeGreaterThanOrEqual(0)
        expect(m.phan, `${ten} ${i}%`).toBeLessThan(1)
      }
    }
  })

  it('và cả năm mức: chỉ số mốc KHÔNG LÙI khi đồng hồ tiến', () => {
    for (const [ten, ms] of CAC_MUC) {
      let truoc = -1
      for (let i = 0; i <= 100; i += 1) {
        const chiSo = mocVeTaiThoiDiem((ms * i) / 100, ms).chiSo
        expect(chiSo, `${ten} ${i}%`).toBeGreaterThanOrEqual(truoc)
        truoc = chiSo
      }
    }
  })

  /*
    Nửa phút là nửa lô, ở **mọi** mức. Đây là mệnh đề nói rằng quy đổi là một
    phép **tỉ lệ**, không phải một bảng tra: một hàm trả hằng số vẫn xanh hai
    phép kiểm trên.
  */
  it('nửa phút là nửa lô, ở mọi mức', () => {
    for (const [ten, ms] of CAC_MUC) {
      expect(mocVeTaiThoiDiem(ms / 2, ms).chiSo, ten).toBe(MOC_MOI_PHUT / 2)
    }
  })

  it('phần lẻ đi tuyến tính giữa hai mốc', () => {
    const ms = MS_MOI_PHUT.thuong
    const mot = ms / MOC_MOI_PHUT
    expect(mocVeTaiThoiDiem(mot * 3, ms)).toEqual({ chiSo: 3, phan: 0 })
    expect(mocVeTaiThoiDiem(mot * 3.25, ms).chiSo).toBe(3)
    expect(mocVeTaiThoiDiem(mot * 3.25, ms).phan).toBeCloseTo(0.25, 9)
    expect(mocVeTaiThoiDiem(mot * 3.75, ms).phan).toBeCloseTo(0.75, 9)
  })

  it('số mốc là THAM SỐ, để T731 làm dày cửa sổ lên gấp đôi', () => {
    const ms = MS_MOI_PHUT.thuong
    expect(mocVeTaiThoiDiem(ms / 2, ms, 120).chiSo).toBe(60)
    expect(mocVeTaiThoiDiem(ms, ms, 120).chiSo).toBe(119)
  })

  it('đầu vào hỏng không sinh NaN hay chỉ số âm', () => {
    for (const bo of [
      [-100, 1000],
      [100, 0],
      [100, -1000],
      [Number.NaN, 1000],
      [100, Number.NaN],
    ]) {
      const m = mocVeTaiThoiDiem(bo[0]!, bo[1]!)
      expect(Number.isFinite(m.chiSo), `${bo[0]}, ${bo[1]}`).toBe(true)
      expect(Number.isFinite(m.phan), `${bo[0]}, ${bo[1]}`).toBe(true)
      expect(m.chiSo, `${bo[0]}, ${bo[1]}`).toBeGreaterThanOrEqual(0)
      expect(m.chiSo, `${bo[0]}, ${bo[1]}`).toBeLessThan(MOC_MOI_PHUT)
    }
    expect(mocVeTaiThoiDiem(100, 1000, 0)).toEqual({ chiSo: 0, phan: 0 })
  })
})

describe('mocVe.ts KHÔNG biết tên một mức tốc độ nào (T732)', () => {
  /** Bóc chú thích khối và chú thích dòng, đúng khuôn `chiCode` của `rng.test.ts`. */
  function chiCode(nguon: string): string {
    return nguon
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  }

  const NGUON = import.meta.glob('./mocVe.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  /*
    Điều kiện ra của task là `grep -n "rat-nhanh\\|cham" src/ui/mocVe.ts` → rỗng.
    Viết thành phép kiểm thì nó quét **mọi** tên mức có trong bảng, kể cả tên
    của mức được thêm sau — một lệnh `grep` gõ tay thì không.
  */
  it('mã nguồn không chứa tên của bất kỳ mức nào trong bảng', () => {
    const cacFile = Object.entries(NGUON)
    expect(cacFile.length, 'phải đọc được chính mocVe.ts').toBe(1)
    /*
      Bóc chú thích trước khi quét, đúng khuôn `chiCode` mà `rng.test.ts`,
      `coHoc.test.ts` và `tinhHuong.test.ts` đã dùng: điều bị cấm là một
      **nhánh** theo tên mức, không phải một câu văn nhắc tới mức nào đó.
      (Dù vậy file ấy cũng được viết sao cho lệnh `grep` nguyên văn của task
      ra rỗng — xem ghi chú của T732.)
    */
    const nguon = chiCode(cacFile[0]![1])
    for (const [ten] of CAC_MUC) {
      expect(nguon.includes(ten), `tên mức "${ten}"`).toBe(false)
    }
    // Và không cả kiểu `MucTocDo` — nhận một con số là đủ.
    expect(nguon.includes('MucTocDo')).toBe(false)
    expect(nguon.includes('MS_MOI_PHUT')).toBe(false)
  })

  it('và phép kiểm ấy ĐỎ ĐƯỢC', () => {
    const gia = `if (muc === '${CAC_MUC[0]![0]}') return 0`
    expect(gia.includes(CAC_MUC[0]![0])).toBe(true)
  })
})
