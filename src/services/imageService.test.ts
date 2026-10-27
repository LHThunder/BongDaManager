import { describe, expect, it } from 'vitest'
import {
  CANH_CHAN_DUNG,
  GIOI_HAN_CHAN_DUNG,
  GIOI_HAN_LOGO,
  chuanBiAnhChanDung,
  chuanBiLogo,
  khungVuongGiua,
  laTepAnh,
  type AnhDaGiaiMa,
  type BoXuLyAnh,
  type KhungCat,
} from './imageService'

/*
  Bộ xử lý giả: dung lượng trả về phụ thuộc cạnh đích và mức chất lượng, nên
  vòng lặp "hạ chất lượng rồi hạ cạnh" bị thử thật chứ không chạy qua một lần.

  size = goc * (canh / 256)^2 * chatLuong
*/
function boGia(options: {
  readonly goc: number
  readonly anh?: AnhDaGiaiMa
  readonly loiGiaiMa?: boolean
}): BoXuLyAnh & { readonly lanGoi: { canh: number; chatLuong: number }[] } {
  const lanGoi: { canh: number; chatLuong: number }[] = []
  return {
    lanGoi,
    async giaiMa() {
      if (options.loiGiaiMa) throw new Error('ảnh hỏng')
      return options.anh ?? { width: 1200, height: 900 }
    },
    async veVaNen(_anh, _tep, _khung, canhDich, chatLuong) {
      lanGoi.push({ canh: canhDich, chatLuong })
      const co = Math.round(
        options.goc * Math.pow(canhDich / 256, 2) * chatLuong,
      )
      return new Blob([new Uint8Array(co)], { type: 'image/jpeg' })
    },
  }
}

const TEP_ANH = new Blob(['gia'], { type: 'image/jpeg' })

describe('laTepAnh', () => {
  it('nhận các loại ảnh', () => {
    for (const loai of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(laTepAnh(new Blob(['x'], { type: loai }))).toBe(true)
    }
  })

  it('từ chối tệp không phải ảnh', () => {
    for (const loai of ['application/pdf', 'text/plain', '']) {
      expect(laTepAnh(new Blob(['x'], { type: loai }))).toBe(false)
    }
  })
})

describe('khung vuông căn giữa', () => {
  it('ảnh ngang thì cắt hai bên', () => {
    expect(khungVuongGiua({ width: 1200, height: 900 })).toEqual({
      x: 150,
      y: 0,
      canh: 900,
    })
  })

  it('ảnh dọc thì cắt trên dưới', () => {
    expect(khungVuongGiua({ width: 900, height: 1200 })).toEqual({
      x: 0,
      y: 150,
      canh: 900,
    })
  })

  it('ảnh vuông thì không cắt gì', () => {
    expect(khungVuongGiua({ width: 500, height: 500 })).toEqual({
      x: 0,
      y: 0,
      canh: 500,
    })
  })
})

describe('tệp không dùng được (AC-3.3)', () => {
  it('tệp không phải ảnh thì ném NotAnImage', async () => {
    const tep = new Blob(['%PDF'], { type: 'application/pdf' })
    await expect(
      chuanBiAnhChanDung(tep, null, boGia({ goc: 1000 })),
    ).rejects.toMatchObject({ ma: 'NotAnImage' })
  })

  it('ảnh không giải mã được thì ném DecodeFailed', async () => {
    await expect(
      chuanBiAnhChanDung(TEP_ANH, null, boGia({ goc: 1000, loiGiaiMa: true })),
    ).rejects.toMatchObject({ ma: 'DecodeFailed' })
  })

  it('ảnh có kích thước 0 thì ném DecodeFailed', async () => {
    await expect(
      chuanBiAnhChanDung(
        TEP_ANH,
        null,
        boGia({ goc: 1000, anh: { width: 0, height: 0 } }),
      ),
    ).rejects.toMatchObject({ ma: 'DecodeFailed' })
  })
})

describe('ảnh chân dung: vuông và tối đa 100KB (AC-3.1, AC-3.2)', () => {
  it('ảnh nhỏ thì giữ nguyên cạnh và chất lượng cao nhất', async () => {
    const bo = boGia({ goc: 50 * 1024 })
    const kq = await chuanBiAnhChanDung(TEP_ANH, null, bo)

    expect(kq.width).toBe(CANH_CHAN_DUNG)
    expect(kq.height).toBe(CANH_CHAN_DUNG)
    expect(kq.byteSize).toBeLessThanOrEqual(GIOI_HAN_CHAN_DUNG)
    expect(bo.lanGoi).toHaveLength(1)
    expect(bo.lanGoi[0]?.chatLuong).toBe(0.9)
  })

  it('ảnh hơi lớn thì hạ chất lượng nhưng GIỮ độ phân giải', async () => {
    const bo = boGia({ goc: 200 * 1024 })
    const kq = await chuanBiAnhChanDung(TEP_ANH, null, bo)

    expect(kq.byteSize).toBeLessThanOrEqual(GIOI_HAN_CHAN_DUNG)
    expect(kq.width).toBe(CANH_CHAN_DUNG)
    expect(bo.lanGoi.length).toBeGreaterThan(1)
    expect(bo.lanGoi.every((g) => g.canh === CANH_CHAN_DUNG)).toBe(true)
  })

  it('ảnh rất lớn thì hạ tiếp cả cạnh cho tới khi đạt giới hạn', async () => {
    const bo = boGia({ goc: 3_000_000, anh: { width: 6000, height: 4000 } })
    const kq = await chuanBiAnhChanDung(TEP_ANH, null, bo)

    expect(kq.byteSize).toBeLessThanOrEqual(GIOI_HAN_CHAN_DUNG)
    expect(kq.width).toBeLessThan(CANH_CHAN_DUNG)
    expect(kq.width).toBe(kq.height)

    // Phải thử hết các mức chất lượng ở cạnh gốc trước khi hạ cạnh.
    const oCanhGoc = bo.lanGoi.filter((g) => g.canh === CANH_CHAN_DUNG)
    expect(oCanhGoc).toHaveLength(6)
  })

  it('dùng đúng khung cắt do người dùng chọn', async () => {
    const khung: KhungCat = { x: 10, y: 20, canh: 300 }
    let khungDaDung: KhungCat | null = null

    const bo: BoXuLyAnh = {
      async giaiMa() {
        return { width: 1000, height: 1000 }
      },
      async veVaNen(_a, _t, k) {
        khungDaDung = k
        return new Blob([new Uint8Array(1024)], { type: 'image/jpeg' })
      },
    }

    await chuanBiAnhChanDung(TEP_ANH, khung, bo)
    expect(khungDaDung).toEqual(khung)
  })

  it('không có khung do người dùng chọn thì tự cắt giữa', async () => {
    let khungDaDung: KhungCat | null = null

    const bo: BoXuLyAnh = {
      async giaiMa() {
        return { width: 1200, height: 900 }
      },
      async veVaNen(_a, _t, k) {
        khungDaDung = k
        return new Blob([new Uint8Array(1024)], { type: 'image/jpeg' })
      },
    }

    await chuanBiAnhChanDung(TEP_ANH, null, bo)
    expect(khungDaDung).toEqual({ x: 150, y: 0, canh: 900 })
  })
})

describe('logo đội: tối đa 50KB', () => {
  it('ảnh nhỏ thì đạt ngay', async () => {
    const kq = await chuanBiLogo(TEP_ANH, boGia({ goc: 20 * 1024 }))
    expect(kq.byteSize).toBeLessThanOrEqual(GIOI_HAN_LOGO)
  })

  it('ảnh rất lớn vẫn phải xuống dưới 50KB', async () => {
    const kq = await chuanBiLogo(
      TEP_ANH,
      boGia({ goc: 3_000_000, anh: { width: 4000, height: 4000 } }),
    )
    expect(kq.byteSize).toBeLessThanOrEqual(GIOI_HAN_LOGO)
  })

  it('giới hạn logo chặt hơn giới hạn ảnh chân dung', async () => {
    const bo = boGia({ goc: 200 * 1024 })
    const logo = await chuanBiLogo(TEP_ANH, bo)
    const chanDung = await chuanBiAnhChanDung(TEP_ANH, null, boGia({ goc: 200 * 1024 }))

    expect(logo.byteSize).toBeLessThanOrEqual(GIOI_HAN_LOGO)
    expect(chanDung.byteSize).toBeLessThanOrEqual(GIOI_HAN_CHAN_DUNG)
    expect(logo.byteSize).toBeLessThan(chanDung.byteSize)
  })
})
