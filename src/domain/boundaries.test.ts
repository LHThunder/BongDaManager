import { describe, expect, it } from 'vitest'

/*
  Test canh biên giới kiến trúc (hiến pháp P2 và plan mục 3).

  Hai luật được canh ở đây:
    1. `domain/` không được import React, DOM, `services` hay `storage`.
    2. `services/` không được import `hooks`, `store` hay `ui`.

  Nguồn đọc là chính source, lấy qua `import.meta.glob` của Vite nên không
  cần thêm phụ thuộc nào để đọc file.
*/

const FILE_DOMAIN = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const FILE_SERVICES = import.meta.glob('../services/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Lấy mọi specifier của `import ... from '...'` và `import('...')`. */
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

function viPham(spec: string, cacMau: readonly RegExp[]): boolean {
  return cacMau.some((mau) => mau.test(spec))
}

const CAM_TRONG_DOMAIN: readonly RegExp[] = [
  /^react$/,
  /^react\//,
  /^react-dom/,
  /^react-easy-crop/,
  /^zustand/,
  /^idb/,
  /\.\.\/services/,
  /\.\.\/storage/,
  /\.\.\/hooks/,
  /\.\.\/store/,
  /\.\.\/ui/,
]

const CAM_TRONG_SERVICES: readonly RegExp[] = [
  /^react$/,
  /^react\//,
  /^react-dom/,
  /\.\.\/hooks/,
  /\.\.\/store/,
  /\.\.\/ui/,
]

describe('biên giới kiến trúc (P2)', () => {
  it('có đọc được source của domain để kiểm', () => {
    // Nếu glob hỏng thì test sẽ xanh một cách vô nghĩa — chặn trường hợp đó.
    expect(Object.keys(FILE_DOMAIN).length).toBeGreaterThan(2)
  })

  it('không file nào trong domain/ import React, DOM, services hay storage', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_DOMAIN)) {
      for (const spec of cacSpecifier(source)) {
        if (viPham(spec, CAM_TRONG_DOMAIN)) {
          loi.push(`${duongDan} import '${spec}'`)
        }
      }
    }

    expect(loi, `domain/ phải là lớp thuần:\n${loi.join('\n')}`).toEqual([])
  })

  it('không file nào trong services/ import hooks, store hay ui', () => {
    const loi: string[] = []

    for (const [duongDan, source] of Object.entries(FILE_SERVICES)) {
      for (const spec of cacSpecifier(source)) {
        if (viPham(spec, CAM_TRONG_SERVICES)) {
          loi.push(`${duongDan} import '${spec}'`)
        }
      }
    }

    expect(loi, `services/ không được phụ thuộc lên trên:\n${loi.join('\n')}`).toEqual(
      [],
    )
  })
})
