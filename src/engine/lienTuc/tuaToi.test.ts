import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import { docMoc } from './loMoc'
import { buocPhutLienTuc, taoTranLienTuc } from './tranLienTuc'

/*
  ====================================================================
  "TUA" CHỈ NGHĨA LÀ TUA TỚI (T738, AC-45.10).
  ====================================================================

  AC-45.10 là một AC **phủ định**: nó nói thứ sản phẩm **không có**. Người dùng
  chốt ngày 2026-11-23 (câu 24) rằng "tua" chỉ gồm đổi mức tốc độ và *Chạy hết
  trận* — **không** tua ngược, **không** thanh thời gian. Cái giá đã nói trước:
  xem lại một pha vừa trôi qua thì phải chạy lại cả trận.

  Một AC phủ định chỉ canh được bằng hai thứ, và phải **cả hai**:

    1. **Hành vi**: chỉ số mốc của một trận thật **chỉ tăng**, không bao giờ
       đứng lại hay lùi.
    2. **Mã nguồn**: không một đường nào đặt nó giảm, và giao diện không mọc
       thêm một thanh kéo thời gian nào.

  Chỉ (1) thì một thanh thời gian **chưa ai kéo** vẫn xanh. Chỉ (2) thì một lỗi
  số học trong vòng phút vẫn xanh.
*/

const NGUON_LIEN_TUC = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const NGUON_HOOK = import.meta.glob('../../hooks/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const NGUON_GIAO_DIEN = import.meta.glob(
  ['../../ui/components/**/*.tsx', '../../hooks/*.ts'],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

/** Bóc chú thích khối và chú thích dòng, đúng khuôn `chiCode` của `rng.test.ts`. */
function chiCode(nguon: string): string {
  return nguon
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

function laFileTest(duongDan: string): boolean {
  return duongDan.endsWith('.test.ts') || duongDan.endsWith('.test.tsx')
}

describe('chỉ số mốc CHỈ TĂNG, trên một trận thật (T738, AC-45.10)', () => {
  it('10 mã: không mốc nào đứng lại hay lùi, suốt cả trận', () => {
    let soMoc = 0
    let soMa = 0
    for (const ma of MA_TRAN_CO_DINH) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      let truoc = -1
      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
          const nay = docMoc(phut.lo, i).chiSoMoc
          expect(nay, `${ma} phút ${p} mốc ${i}`).toBeGreaterThan(truoc)
          truoc = nay
          soMoc += 1
        }
        lt = phut.tt
      }
      soMa += 1
    }
    // ⚠️ CHỐNG RỖNG: phải thật sự đi qua cả trận, không phải một phút.
    expect(soMa, 'số mã đã chạy').toBe(MA_TRAN_CO_DINH.length)
    expect(soMoc, 'số mốc đã xem').toBeGreaterThan(50_000)
  })

  /*
    Và đồng hồ mốc của trạng thái cũng chỉ tiến. Đây là con số mà một nút "tua
    ngược" sẽ phải hạ xuống, nên nó là chỗ đúng để canh.
  */
  it('và đồng hồ mốc của trạng thái chỉ tiến, mỗi phút đúng một bước', () => {
    let lt = taoTranLienTuc({
      ...cauHinhMau(MA_TRAN_CO_DINH[0]!),
      cheDoMoPhong: 'lien-tuc',
    })
    let truoc = lt.chiSoMoc
    for (let p = 0; p < 30; p += 1) {
      lt = buocPhutLienTuc(lt).tt
      expect(lt.chiSoMoc, `phút ${p}`).toBeGreaterThan(truoc)
      truoc = lt.chiSoMoc
    }
  })
})

describe('mã nguồn không có đường nào tua ngược (T738, AC-45.10)', () => {
  /*
    ⚠️ **Quét theo PHÉP GÁN, không theo chuỗi `chiSoMoc -`.** Chuỗi ấy xuất hiện
    hai lần trong `tranLienTuc.ts` một cách hoàn toàn chính đáng — `chiSoMoc -
    mocDaGhiTruoc` và `chiSoMoc - mocDauChuoi` đều là **hiệu** dùng làm tham số,
    không phải một phép gán làm chỉ số lùi. Cấm chuỗi ấy là cấm một cách viết
    đúng, và rồi ai đó sẽ tắt phép kiểm.
  */
  const CAC_MAU_CAM: readonly { ten: string; mau: RegExp }[] = [
    { ten: 'chiSoMoc--', mau: /chiSoMoc\s*--/ },
    { ten: 'chiSoMoc -=', mau: /chiSoMoc\s*-=/ },
    { ten: 'chiSoMoc = chiSoMoc -', mau: /chiSoMoc\s*=\s*chiSoMoc\s*-/ },
    { ten: 'chiSoMoc: chiSoMoc -', mau: /chiSoMoc\s*:\s*chiSoMoc\s*-/ },
    { ten: 'tuaVe', mau: /tuaVe/ },
    { ten: 'tuaNguoc', mau: /tuaNguoc/ },
  ]

  it('không file nào của lienTuc/ hay hooks/ đặt chỉ số mốc giảm', () => {
    const cacFile = [
      ...Object.entries(NGUON_LIEN_TUC),
      ...Object.entries(NGUON_HOOK),
    ].filter(([duongDan]) => !laFileTest(duongDan))

    // ⚠️ CHỐNG RỖNG: glob hỏng thì danh sách rỗng và vòng dưới xanh vô nghĩa.
    expect(cacFile.length, 'số file đã quét').toBeGreaterThan(10)
    expect(
      cacFile.some(([d]) => d.includes('useMatch')),
      'phải quét được useMatch.ts',
    ).toBe(true)

    const loi: string[] = []
    for (const [duongDan, nguon] of cacFile) {
      const code = chiCode(nguon)
      for (const { ten, mau } of CAC_MAU_CAM) {
        if (mau.test(code)) loi.push(`${duongDan}: ${ten}`)
      }
    }
    expect(loi, `đường tua ngược:\n${loi.join('\n')}`).toEqual([])
  })

  it('và phép kiểm ấy ĐỎ ĐƯỢC — chú thích thì không tính, mã thì có', () => {
    for (const { ten, mau } of CAC_MAU_CAM) {
      const gia = ten.includes('tua')
        ? `const x = ${ten}()`
        : `let chiSoMoc = 0; ${ten} 1`
      expect(mau.test(chiCode(gia)), ten).toBe(true)
    }
    expect(
      /chiSoMoc\s*--/.test(chiCode('/* nói về chiSoMoc-- */ const x = 1')),
    ).toBe(false)
  })
})

describe('giao diện không có thanh thời gian (T738, AC-45.10)', () => {
  /**
   * Thanh kéo DUY NHẤT được phép, nêu tên ở đây thay vì nới phép kiểm.
   *
   * Đây là slider **phóng to của tính năng cắt ảnh**, không liên quan gì tới
   * spec 007. Nêu tên nó bắt người thêm thanh thứ hai phải **sửa phép kiểm**,
   * tức phải nghĩ — còn nới điều kiện thành "ít hơn hai" thì thanh thứ hai lọt
   * im lặng.
   */
  const THANH_KEO_DUOC_PHEP = 'ChonAnh.tsx'

  /*
    ⚠️ **Quét `type="range"`, KHÔNG quét `<input type="range"`.** JSX trong repo
    format **nhiều dòng**, nên thuộc tính nằm một dòng riêng và mẫu có thẻ mở sẽ
    khớp **0 file** — đã thử. Đó đúng hình dạng của cái CRITICAL mà T716 vừa vá:
    một AC được canh bằng một phép kiểm **không bao giờ đỏ được**.

    ⚠️ Và **không** quét theo từ tiếng Anh chung (`timeline`, `slider`) trên cả
    `src/ui/`: hôm nay chúng khớp hai chỗ không liên quan gì — chuỗi tiếng Anh
    của tính năng cắt ảnh ở `ngonNgu/en.ts`, và `bieuTuong/history.svg` khớp vì
    **tên tệp**. Điều kiện "→ rỗng" trên phạm vi ấy không bao giờ thoả được.
  */
  it('đúng MỘT thanh kéo trong components và hooks, và nó có tên', () => {
    const coThanhKeo = Object.entries(NGUON_GIAO_DIEN)
      .filter(([duongDan]) => !laFileTest(duongDan))
      .filter(([, nguon]) => chiCode(nguon).includes('type="range"'))
      .map(([duongDan]) => duongDan)

    expect(coThanhKeo, 'các file có thanh kéo').toHaveLength(1)
    expect(coThanhKeo[0]).toContain(THANH_KEO_DUOC_PHEP)
  })

  it('và phép quét ấy ĐỎ ĐƯỢC — mẫu có khớp được JSX nhiều dòng không', () => {
    const jsxNhieuDong = [
      '<input',
      '  className="w-full"',
      '  type="range"',
      '  min={1}',
      '/>',
    ].join('\n')
    expect(jsxNhieuDong.includes('type="range"'), 'mẫu đang dùng').toBe(true)
    // Và mẫu CŨ — có thẻ mở — không khớp nổi, đúng như đã cảnh báo.
    expect(jsxNhieuDong.includes('<input type="range"')).toBe(false)
  })

  it('quét được file thật, không phải một glob rỗng', () => {
    const soFile = Object.keys(NGUON_GIAO_DIEN).length
    expect(soFile, 'số file giao diện đã quét').toBeGreaterThan(10)
  })
})
