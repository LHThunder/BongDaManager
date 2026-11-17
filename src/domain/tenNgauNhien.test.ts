import { describe, expect, it } from 'vitest'
import {
  KHO_TEN_ANH,
  KHO_TEN_VIET,
  sinhTen,
  soToHop,
  type KhoTen,
} from './tenNgauNhien'
import type { Rng } from './types'

/*
  Kho tên hư cấu (T401, AC-24.8).

  Bốn điều được canh ở đây, và điều thứ tư là điều dễ bỏ qua nhất: KÍCH
  THƯỚC kho. Một kho nhỏ vẫn chạy đúng, vẫn tái lập được, vẫn qua mọi phép
  kiểm khác — nó chỉ làm một đội 18 người có hai ông trùng tên. Lỗi ấy không
  lộ ra ở một lần gọi, nên nó phải có phép kiểm riêng.
*/

/** Nguồn ngẫu nhiên giả, cho cùng chuỗi số với cùng hạt giống (P1). */
function rngGia(hatGiong: number): Rng {
  let s = hatGiong >>> 0
  return {
    next() {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    },
  }
}

const DAU_TIENG_VIET =
  /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i

const NGUON_SOURCE = import.meta.glob('./tenNgauNhien.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function sinhNhieu(kho: KhoTen, soLan: number, hatGiong = 7): string[] {
  const rng = rngGia(hatGiong)
  const ra: string[] = []
  for (let i = 0; i < soLan; i += 1) ra.push(sinhTen(kho, rng))
  return ra
}

describe('sinh tên từ kho hư cấu (AC-24.8)', () => {
  it('cùng một nguồn ngẫu nhiên cho ra cùng tên (P1)', () => {
    expect(sinhTen(KHO_TEN_VIET, rngGia(42))).toBe(
      sinhTen(KHO_TEN_VIET, rngGia(42)),
    )
    expect(sinhTen(KHO_TEN_ANH, rngGia(42))).toBe(
      sinhTen(KHO_TEN_ANH, rngGia(42)),
    )
  })

  it('cùng một nguồn, gọi liên tiếp thì ra tên khác nhau', () => {
    const rng = rngGia(42)
    const a = sinhTen(KHO_TEN_VIET, rng)
    const b = sinhTen(KHO_TEN_VIET, rng)
    expect(a).not.toBe(b)
  })

  it('hai hạt giống khác nhau cho ra tên khác nhau', () => {
    expect(sinhTen(KHO_TEN_VIET, rngGia(1))).not.toBe(
      sinhTen(KHO_TEN_VIET, rngGia(999)),
    )
  })

  it('không gọi nguồn ngẫu nhiên hay thời gian toàn cục (P1)', () => {
    const source = Object.values(NGUON_SOURCE)[0]
    expect(source, 'không đọc được source của tenNgauNhien.ts').toBeTruthy()

    // Bỏ comment trước khi kiểm: phần giải thích được phép NHẮC tới
    // Math.random, chỉ code mới không được gọi nó.
    const chiCode = (source ?? '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    expect(chiCode).not.toContain('Math.random')
    expect(chiCode).not.toContain('Date.now')
    expect(chiCode).not.toContain('crypto.getRandomValues')
  })
})

describe('hai kho khác nhau về bộ ký tự', () => {
  it('kho Việt sinh ra tên có dấu, kho Anh thì không', () => {
    for (const ten of sinhNhieu(KHO_TEN_VIET, 40)) {
      expect(DAU_TIENG_VIET.test(ten), `tên Việt không dấu: ${ten}`).toBe(true)
    }
    for (const ten of sinhNhieu(KHO_TEN_ANH, 40)) {
      expect(DAU_TIENG_VIET.test(ten), `tên Anh có dấu: ${ten}`).toBe(false)
    }
  })

  it('thứ tự ghép đúng theo kho: Việt họ trước, Anh tên gọi trước', () => {
    const viet = sinhTen(KHO_TEN_VIET, rngGia(5))
    const anh = sinhTen(KHO_TEN_ANH, rngGia(5))

    // Việt: phần đầu phải là một trong các họ của kho.
    expect(KHO_TEN_VIET.ho).toContain(viet.split(' ')[0])
    // Anh: phần CUỐI mới là họ.
    expect(KHO_TEN_ANH.ho).toContain(anh.split(' ').at(-1))
  })

  it('mọi tên sinh ra đều không rỗng và không có khoảng trắng thừa', () => {
    for (const kho of [KHO_TEN_VIET, KHO_TEN_ANH]) {
      for (const ten of sinhNhieu(kho, 30)) {
        expect(ten.trim()).toBe(ten)
        expect(ten.length).toBeGreaterThan(2)
      }
    }
  })
})

describe('kho đủ lớn để một đội không trùng tên', () => {
  /*
    Đây là phép kiểm bảo vệ một quyết định, không phải một hàm: D81 chọn
    cách ghép hai danh sách CHÍNH VÌ nó cho nhiều tổ hợp. Rút bớt một danh
    sách thì số tổ hợp giảm theo bình phương, và lỗi lộ ra dưới dạng "hai
    cầu thủ cùng tên trong một đội" — thứ không ai nghĩ là lỗi lập trình.
  */
  it('mỗi kho có ít nhất 1.100 tổ hợp', () => {
    expect(soToHop(KHO_TEN_VIET)).toBeGreaterThanOrEqual(1_100)
    expect(soToHop(KHO_TEN_ANH)).toBeGreaterThanOrEqual(1_100)
  })

  it('sinh 200 tên từ một kho thì tỉ lệ trùng dưới 10%', () => {
    for (const [nhan, kho] of [
      ['Việt', KHO_TEN_VIET],
      ['Anh', KHO_TEN_ANH],
    ] as const) {
      const cacTen = sinhNhieu(kho, 200)
      const soTrung = cacTen.length - new Set(cacTen).size
      expect(
        soTrung / cacTen.length,
        `kho ${nhan}: trùng ${soTrung}/200`,
      ).toBeLessThan(0.1)
    }
  })

  it('không mục nào trong hai danh sách bị lặp', () => {
    for (const kho of [KHO_TEN_VIET, KHO_TEN_ANH]) {
      expect(new Set(kho.ho).size).toBe(kho.ho.length)
      expect(new Set(kho.ten).size).toBe(kho.ten.length)
    }
  })
})
