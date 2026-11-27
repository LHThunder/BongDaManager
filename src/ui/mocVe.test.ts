import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import { docMoc, KHONG_AI_GIU } from '../engine/lienTuc/loMoc'
import { CHI_SO_BONG, MOC_MOI_PHUT, SO_THUC_THE } from '../engine/lienTuc/moc'
import {
  buocPhutLienTuc,
  oCuaNguoiTrenSan,
  taoTranLienTuc,
} from '../engine/lienTuc/tranLienTuc'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { anhChupNoiSuy, anhChupTuLo, mocVeTaiThoiDiem, tronAnhChup } from './mocVe'
import type { AnhChupMet } from './viTriVe'

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

/*
  ====================================================================
  ẢNH CHỤP MỘT MỐC, DẠNG LỚP VẼ ĐỌC ĐƯỢC (T733).
  ====================================================================
*/
describe('anhChupTuLo (T733)', () => {
  function loThu() {
    const lt = taoTranLienTuc({
      ...cauHinhMau(MA_TRAN_CO_DINH[0]!),
      cheDoMoPhong: 'lien-tuc',
    })
    const phut = buocPhutLienTuc(lt)
    return { lo: phut.lo, o: oCuaNguoiTrenSan(phut.tt.tran) }
  }

  it('đọc đúng mốc được hỏi, và mang theo bảng ô', () => {
    const { lo, o } = loThu()
    const a = anhChupTuLo(lo, 0, o)
    expect(a).not.toBeNull()
    expect(a!.thucThe).toHaveLength(SO_THUC_THE)
    expect(a!.oCuaNguoi).toBe(o)
    // Hai mốc khác nhau cho hai ảnh khác nhau — không trả cùng một mốc mãi.
    const b = anhChupTuLo(lo, lo.soMocDaGhi - 1, o)!
    expect(b.thucThe[CHI_SO_BONG]).not.toEqual(a!.thucThe[CHI_SO_BONG])
  })

  /*
    Người giữ bóng lấy **từ tiêu đề mốc**, không suy lại ở lớp vẽ: engine đã
    quyết ai giữ bóng ở từng mốc (AC-37.6), và suy lại là dựng nguồn thứ hai
    cho một câu trả lời đã có.
  */
  it('người giữ bóng lấy từ chính tiêu đề mốc', () => {
    const { lo, o } = loThu()
    let soMocCoNguoiGiu = 0
    for (let i = 0; i < lo.soMocDaGhi; i += 1) {
      const a = anhChupTuLo(lo, i, o)!
      expect(a.nguoiGiuBong).toBe(docMoc(lo, i).nguoiGiu)
      if (a.nguoiGiuBong !== KHONG_AI_GIU) soMocCoNguoiGiu += 1
    }
    // ⚠️ CHỐNG RỖNG: phải CÓ mốc có người giữ, không thì dòng trên vô nghĩa.
    expect(soMocCoNguoiGiu, 'số mốc có người giữ bóng').toBeGreaterThan(0)
  })

  it('mốc ngoài lô trả null chứ không ném, và không trả mốc sai', () => {
    const { lo, o } = loThu()
    expect(anhChupTuLo(lo, -1, o)).toBeNull()
    expect(anhChupTuLo(lo, lo.soMocDaGhi, o)).toBeNull()
    expect(anhChupTuLo(lo, 1e9, o)).toBeNull()
  })

  /*
    Nối hai mảnh của lát này: đồng hồ vẽ → chỉ số mốc → ảnh chụp. Đây là đường
    mà vòng rAF đi mỗi khung, và nó phải ra một ảnh ở **mọi** thời điểm trong
    phút, ở **mọi** mức tốc độ.
  */
  it('ĐƯỜNG ĐẦY ĐỦ: mọi thời điểm của phút, mọi mức, đều ra một ảnh', () => {
    const { lo, o } = loThu()
    let soBo = 0
    for (const [ten, ms] of CAC_MUC) {
      for (let i = 0; i <= 100; i += 1) {
        const { chiSo } = mocVeTaiThoiDiem((ms * i) / 100, ms, lo.soMocDaGhi)
        expect(anhChupTuLo(lo, chiSo, o), `${ten} ${i}%`).not.toBeNull()
        soBo += 1
      }
    }
    expect(soBo, 'số bộ đã quét').toBeGreaterThan(500)
  })
})

/*
  ====================================================================
  TRỘN HAI MỐC (T817) — VÀ BA ĐIỀU KHÔNG ĐƯỢC TRỘN.
  ====================================================================

  Người dùng xem bản chạy ngày 2026-11-27 và nói trận "giật cục như chuỗi ảnh
  fps thấp". Đo 300 khung: trình duyệt vẽ **59,2 fps**, toạ độ chỉ đổi ở
  **151/299** nhịp (**29,9 fps**), khoảng cách **1-1-1-3-4** khung. Cả hai lớp
  vẽ vứt `phan` của `mocVeTaiThoiDiem`.

  Khối này là **lưới an toàn duy nhất** cho bản sửa ấy: hai lớp vẽ là `.tsx`,
  và `vitest` chạy `environment: 'node'`, chỉ nhận những file tên tận cùng bằng
  `.test.ts` dưới `src`, nên không một dòng nào trong `San2D.tsx`/`San3D.tsx`
  được phép kiểm nào chạm tới. Phép toán vì thế **phải** sống ở `mocVe.ts`, và nó được canh ở đây.
*/
describe('tronAnhChup — lerp thẳng, và chỉ ba trục vị trí (T817)', () => {
  const o = new Map<string, number>([['a', 0], ['b', 1]])
  const the = (ghiDe: Partial<AnhChupMet['thucThe'][number]>) => ({
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat: 1, ...ghiDe,
  })
  const anh = (ts: AnhChupMet['thucThe'], nguoiGiuBong = 0): AnhChupMet => ({
    thucThe: ts, oCuaNguoi: o, nguoiGiuBong,
  })

  it('giữa hai mốc thì vị trí nằm ĐÚNG giữa — ba trục cùng lúc', () => {
    const a = anh([the({ x: 10, y: 20, z: 0 })])
    const b = anh([the({ x: 20, y: 40, z: 4 })])
    const giua = tronAnhChup(a, b, 0.5)
    expect(giua.thucThe[0]!.x).toBeCloseTo(15, 12)
    expect(giua.thucThe[0]!.y).toBeCloseTo(30, 12)
    expect(giua.thucThe[0]!.z).toBeCloseTo(2, 12)
  })

  it('phan = 0 trả về ĐÚNG mốc trước — điều AC-45.9 đòi khi giảm chuyển động', () => {
    const a = anh([the({ x: 10, y: 20 })])
    const b = anh([the({ x: 99, y: 99 })])
    expect(tronAnhChup(a, b, 0)).toBe(a)
  })

  it('mốc cuối lô (không có mốc sau) thì KHÔNG ngoại suy', () => {
    const a = anh([the({ x: 10, y: 20, vx: 9, vy: 9 })])
    expect(tronAnhChup(a, null, 0.9)).toBe(a)
  })

  it('⚠️ KHÔNG trộn coMat: người vừa bị thay không được trượt về góc sân', () => {
    /*
      Ô vắng mặt nằm ở `(0,0)` và `viTriVe.ts` lọc bằng `coMat === 0`. Trộn ra
      `0,5` thì ô ấy vừa lọt cổng vừa mang một vị trí đang trôi về gốc toạ độ.
    */
    const a = anh([the({ x: 50, y: 30, coMat: 1 })])
    const b = anh([the({ x: 0, y: 0, coMat: 0 })])
    const giua = tronAnhChup(a, b, 0.5)
    expect(giua.thucThe[0]!.coMat).toBe(1)
    expect(giua.thucThe[0]!.x).toBe(50)
    expect(giua.thucThe[0]!.y).toBe(30)
  })

  it('⚠️ KHÔNG trộn huong: 350° với 10° không được ra 180°', () => {
    const giua = tronAnhChup(anh([the({ huong: 350 })]), anh([the({ huong: 10 })]), 0.5)
    expect(giua.thucThe[0]!.huong).toBe(350)
  })

  it('⚠️ KHÔNG trộn vận tốc và người giữ bóng', () => {
    const a = anh([the({ vx: 1, vy: 2, vz: 3 })], 7)
    const b = anh([the({ vx: 9, vy: 9, vz: 9 })], 11)
    const giua = tronAnhChup(a, b, 0.5)
    expect(giua.thucThe[0]!.vx).toBe(1)
    expect(giua.thucThe[0]!.vy).toBe(2)
    expect(giua.thucThe[0]!.vz).toBe(3)
    expect(giua.nguoiGiuBong).toBe(7)
  })

  it('🧮 VẬN TỐC DÂY CUNG KHÔNG ĐỔI — bất biến mà viTriVe.ts:88-96 bảo vệ', () => {
    /*
      Đây là phép kiểm đắt giá nhất của khối. Lý do `viTriVe` tắt nội suy ở chế
      độ liên tục là để `(x′−x)/dt` **trên hình** bằng vận tốc engine. Lerp
      thẳng giữ đúng điều đó: tổng quãng đi qua N bước trộn bằng **đúng** quãng
      giữa hai mốc, không hơn một phần tỉ. Một phép trộn cong sẽ đỏ ở đây.
    */
    const a = anh([the({ x: 0, y: 0 })])
    const b = anh([the({ x: 12, y: 5 })]) // quãng đúng 13
    let quang = 0
    let truocX = 0
    let truocY = 0
    for (let i = 1; i <= 60; i += 1) {
      const t = tronAnhChup(a, b, i / 60).thucThe[0]!
      quang += Math.hypot(t.x - truocX, t.y - truocY)
      truocX = t.x
      truocY = t.y
    }
    expect(quang).toBeCloseTo(13, 9)
  })

  it('anhChupNoiSuy dựng thẳng từ lô: phan > 0 cho ảnh KHÁC mốc thô', () => {
    /*
      Cổng duy nhất mà hai lớp vẽ gọi. Dùng một lô thật chứ không dựng tay, để
      phép kiểm này cũng canh luôn chỗ nối `anhChupTuLo` ↔ `tronAnhChup`.
    */
    let lt = taoTranLienTuc({ ...cauHinhMau(MA_TRAN_CO_DINH[0]!), cheDoMoPhong: 'lien-tuc' })
    const phut = buocPhutLienTuc(lt)
    const oNguoi = oCuaNguoiTrenSan(phut.tt.tran)
    const tho = anhChupTuLo(phut.lo, 3, oNguoi)
    const giua = anhChupNoiSuy(phut.lo, { chiSo: 3, phan: 0.5 }, oNguoi)
    const taiMoc = anhChupNoiSuy(phut.lo, { chiSo: 3, phan: 0 }, oNguoi)
    expect(tho).not.toBeNull()
    expect(giua).not.toBeNull()
    // Ở phan = 0 thì nó LÀ mốc thô, từng số.
    expect(taiMoc!.thucThe.map((t) => `${t.x},${t.y}`)).toEqual(
      tho!.thucThe.map((t) => `${t.x},${t.y}`),
    )
    // Ở phan = 0,5 thì ít nhất một người đã dịch — nếu không, cả bản sửa vô nghĩa.
    const daDoi = giua!.thucThe.filter((t, i) => t.x !== tho!.thucThe[i]!.x).length
    expect(daDoi).toBeGreaterThan(0)
  })

  it('⚠️ CHỐNG RỖNG: hàm này THẬT SỰ đổi số — không phải một phép sao chép', () => {
    const a = anh([the({ x: 0 })])
    const b = anh([the({ x: 10 })])
    const khac = new Set([0.1, 0.25, 0.5, 0.75, 0.99].map((p) => tronAnhChup(a, b, p).thucThe[0]!.x))
    expect(khac.size).toBe(5)
    expect(Math.min(...khac)).toBeGreaterThan(0)
    expect(Math.max(...khac)).toBeLessThan(10)
  })
})
