import { describe, expect, it } from 'vitest'

/*
  Canh biên giới tầng `engine/` (hiến pháp P1 và P2).

  Hai luật:
    1. `engine/` không import React, DOM, `ui`, `hooks`, `services` hay
       `storage`. Nó là lớp trong cùng; chỉ được đọc `domain/`.
    2. `engine/` không chứa nguồn ngẫu nhiên hay nguồn thời gian toàn cục.
       Toàn bộ ngẫu nhiên phải đến từ mã trận, nếu không thì AC-8.11 hỏng mà
       không test nào khác thấy.

  File nằm trong chính `engine/` chứ không trong `domain/`: một tầng không
  nên đi tuần tầng khác. `domain/boundaries.test.ts` vẫn canh phần của nó.
*/

const FILE_ENGINE = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function cacSpecifier(source: string): string[] {
  const ketQua: string[] = []
  const mau = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g
  let khop: RegExpExecArray | null
  while ((khop = mau.exec(source)) !== null) {
    const spec = khop[1]
    if (spec !== undefined) {
      ketQua.push(spec)
    }
  }
  return ketQua
}

const CAM_IMPORT: readonly RegExp[] = [
  /^react$/,
  /^react\//,
  /^react-dom/,
  /^zustand/,
  /^idb$/,
  /^fflate$/,
  /\.\.\/services/,
  /\.\.\/storage/,
  /\.\.\/hooks/,
  /\.\.\/store/,
  /\.\.\/ui/,
]

/** Bỏ comment trước khi soi: phần giải thích được phép NHẮC tới những tên này. */
function chiCode(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

function laFileTest(duongDan: string): boolean {
  return duongDan.endsWith('.test.ts')
}

/**
 * Một specifier tương đối có đi RA KHỎI `engine/` không, và nếu có thì ra tới
 * đâu. `'../tran'` viết từ `__fixtures__/` vẫn nằm trong engine; `'../domain/types'`
 * viết từ gốc engine thì mới là ra ngoài.
 */
function raNgoaiEngine(duongDanFile: string, spec: string): string | null {
  if (!spec.startsWith('.')) return null

  // './__fixtures__/doiMau.ts' nằm sâu 1 cấp; './rng.ts' nằm ở gốc.
  const doSau = duongDanFile.split('/').length - 2
  const phan = spec.split('/')
  let soCapLen = 0
  while (phan[soCapLen] === '..') soCapLen += 1

  if (soCapLen <= doSau) return null
  return phan.slice(soCapLen).join('/')
}

describe('biên giới tầng engine (P1, P2)', () => {
  it('đọc được source của engine để kiểm', () => {
    // Glob hỏng thì mọi test dưới đây xanh một cách vô nghĩa — chặn trước.
    expect(Object.keys(FILE_ENGINE).length).toBeGreaterThanOrEqual(5)
  })

  it('không file nào import React, DOM, services, storage, hooks hay ui', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_ENGINE)) {
      for (const spec of cacSpecifier(source)) {
        if (CAM_IMPORT.some((mau) => mau.test(spec))) {
          loi.push(`${duongDan} import '${spec}'`)
        }
      }
    }

    expect(loi, `engine/ phải là lớp trong cùng:\n${loi.join('\n')}`).toEqual(
      [],
    )
  })

  it('engine chỉ được đọc domain, không đọc tầng nào khác lên trên', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_ENGINE)) {
      for (const spec of cacSpecifier(source)) {
        const raNgoai = raNgoaiEngine(duongDan, spec)
        if (raNgoai !== null && !raNgoai.startsWith('domain/')) {
          loi.push(`${duongDan} import '${spec}'`)
        }
      }
    }

    expect(loi, `chỉ được ra ngoài qua domain/:\n${loi.join('\n')}`).toEqual([])
  })

  it('phép kiểm "ra ngoài engine" phân biệt đúng trong và ngoài', () => {
    // Chính phép kiểm trên cũng cần được kiểm: `'../tran'` viết từ thư mục
    // con vẫn là trong engine, còn `'../services/x'` ở gốc là ra ngoài.
    expect(raNgoaiEngine('./__fixtures__/doiMau.ts', '../tran')).toBeNull()
    expect(raNgoaiEngine('./rng.ts', './vung')).toBeNull()
    expect(raNgoaiEngine('./rng.ts', '../domain/types')).toBe('domain/types')
    expect(raNgoaiEngine('./rng.ts', '../services/teamRepo')).toBe(
      'services/teamRepo',
    )
    expect(
      raNgoaiEngine('./__fixtures__/doiMau.ts', '../../services/teamRepo'),
    ).toBe('services/teamRepo')
  })

  it('không có nguồn ngẫu nhiên hay thời gian toàn cục (P1)', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_ENGINE)) {
      // Bỏ qua file test: chúng NHẮC tới những tên này trong chính phép
      // kiểm, và chúng không được đóng gói vào bản chạy.
      if (laFileTest(duongDan)) continue
      const code = chiCode(source)
      for (const cam of [
        'Math.random',
        'Date.now',
        'crypto.getRandomValues',
        'new Date(',
        'performance.now',
      ]) {
        if (code.includes(cam)) {
          loi.push(`${duongDan} dùng '${cam}'`)
        }
      }
    }

    expect(
      loi,
      `mọi ngẫu nhiên phải đến từ mã trận:\n${loi.join('\n')}`,
    ).toEqual([])
  })

  it('không có đồng hồ trong engine — đồng hồ thuộc giao diện (D21)', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_ENGINE)) {
      // Bỏ qua file test: chúng NHẮC tới những tên này trong chính phép
      // kiểm, và chúng không được đóng gói vào bản chạy.
      if (laFileTest(duongDan)) continue
      const code = chiCode(source)
      for (const cam of ['setInterval', 'setTimeout', 'requestAnimationFrame']) {
        if (code.includes(cam)) {
          loi.push(`${duongDan} dùng '${cam}'`)
        }
      }
    }

    expect(loi, `engine không giữ đồng hồ:\n${loi.join('\n')}`).toEqual([])
  })
})
