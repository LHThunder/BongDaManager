import { describe, expect, it } from 'vitest'
import {
  BAN_KINH_VONG_GIUA,
  CHAM_PHAT_DEN,
  DAI_SAN,
  khoangToiKhungThanh,
  RONG_KHUNG_THANH,
  RONG_SAN,
  RONG_VONG_CAM,
  SAU_VONG_CAM,
  TAM_X,
  TAM_Y,
  tamKhungThanh,
  trongSan,
  trongVongCam,
  Y_COT_GAN,
  Y_COT_XA,
} from './hinhHocSan'

/*
  Hình học sân theo mét (T703, AC-37.1 và AC-37.2).

  AC-37.2 đòi "các mốc PHẢI đúng". Phép kiểm ở đây canh HAI loại mệnh đề khác
  nhau, và sự khác nhau ấy là chủ ý:

  • Bảy hằng số GỐC được canh bằng GIÁ TRỊ — chúng là con số của Luật bóng đá,
    không suy ra từ đâu được, nên một phép kiểm giá trị là phép kiểm đúng.
  • Hai con số SUY RA được canh bằng QUAN HỆ. Viết `expect(Y_COT_GAN).toBe(30.34)`
    chỉ là chép lại số: nếu ai sửa `RONG_KHUNG_THANH` thì phép kiểm ấy đỏ ở chỗ
    SAI, và người sửa sẽ chữa bằng cách đổi 30.34 thành số mới. Canh bằng quan
    hệ thì nó đỏ ở chỗ ĐÚNG.
*/

describe('hằng số gốc là con số của luật bóng đá (AC-37.2)', () => {
  it('bảy hằng số gốc đúng giá trị', () => {
    expect(DAI_SAN).toBe(105)
    expect(RONG_SAN).toBe(68)
    expect(SAU_VONG_CAM).toBe(16.5)
    expect(RONG_VONG_CAM).toBe(40.3)
    expect(CHAM_PHAT_DEN).toBe(11)
    expect(RONG_KHUNG_THANH).toBe(7.32)
    expect(BAN_KINH_VONG_GIUA).toBe(9.15)
  })

  it('chấm phạt đền nằm trong vòng cấm, vòng cấm nằm trong nửa sân', () => {
    expect(CHAM_PHAT_DEN).toBeLessThan(SAU_VONG_CAM)
    expect(SAU_VONG_CAM).toBeLessThan(TAM_X)
    expect(RONG_VONG_CAM).toBeLessThan(RONG_SAN)
    expect(RONG_KHUNG_THANH).toBeLessThan(RONG_VONG_CAM)
  })

  it('vòng tròn giữa không chạm vòng cấm hai đầu', () => {
    expect(TAM_X - BAN_KINH_VONG_GIUA).toBeGreaterThan(SAU_VONG_CAM)
  })
})

describe('hai số suy ra được canh bằng QUAN HỆ, không bằng giá trị', () => {
  it('hai cột dọc đối xứng quanh tâm và cách nhau đúng bề rộng khung thành', () => {
    expect(Y_COT_XA - Y_COT_GAN).toBeCloseTo(RONG_KHUNG_THANH, 10)
    expect((Y_COT_GAN + Y_COT_XA) / 2).toBeCloseTo(TAM_Y, 10)
    expect(TAM_Y - Y_COT_GAN).toBeCloseTo(Y_COT_XA - TAM_Y, 10)
  })

  it('tâm sân là một nửa của hai chiều', () => {
    expect(TAM_X * 2).toBe(DAI_SAN)
    expect(TAM_Y * 2).toBe(RONG_SAN)
  })

  /*
    Một phép kiểm chống chép số: nếu ai đổi `RONG_KHUNG_THANH` thì hai cột dọc
    phải đi theo. Đây là chỗ phân biệt "canh quan hệ" với "canh giá trị".
  */
  it('giá trị hôm nay là 30,34 và 37,66 — nhưng đó là HỆ QUẢ', () => {
    expect(Y_COT_GAN).toBeCloseTo(30.34, 10)
    expect(Y_COT_XA).toBeCloseTo(37.66, 10)
    expect(Y_COT_GAN).toBeCloseTo(RONG_SAN / 2 - RONG_KHUNG_THANH / 2, 10)
  })
})

describe('trongVongCam — biên tính là nằm trong', () => {
  it('chấm phạt đền của hai bên đều trong vòng cấm của bên ấy', () => {
    expect(trongVongCam(CHAM_PHAT_DEN, TAM_Y, 'nha')).toBe(true)
    expect(trongVongCam(DAI_SAN - CHAM_PHAT_DEN, TAM_Y, 'khach')).toBe(true)
  })

  it('chấm phạt đền của bên này KHÔNG trong vòng cấm bên kia', () => {
    expect(trongVongCam(CHAM_PHAT_DEN, TAM_Y, 'khach')).toBe(false)
    expect(trongVongCam(DAI_SAN - CHAM_PHAT_DEN, TAM_Y, 'nha')).toBe(false)
  })

  it('bốn góc vòng cấm nằm trong, nhích ra một chút là ra ngoài', () => {
    const nuaRong = RONG_VONG_CAM / 2
    for (const y of [TAM_Y - nuaRong, TAM_Y + nuaRong]) {
      expect(trongVongCam(SAU_VONG_CAM, y, 'nha'), `y = ${y}`).toBe(true)
    }
    expect(trongVongCam(SAU_VONG_CAM + 0.01, TAM_Y, 'nha')).toBe(false)
    expect(trongVongCam(SAU_VONG_CAM, TAM_Y - nuaRong - 0.01, 'nha')).toBe(false)
  })

  it('tâm sân không thuộc vòng cấm nào', () => {
    expect(trongVongCam(TAM_X, TAM_Y, 'nha')).toBe(false)
    expect(trongVongCam(TAM_X, TAM_Y, 'khach')).toBe(false)
  })
})

describe('khoangToiKhungThanh', () => {
  it('đứng ngay tâm khung thành thì khoảng cách là 0', () => {
    for (const ben of ['nha', 'khach'] as const) {
      const tam = tamKhungThanh(ben)
      expect(khoangToiKhungThanh(tam.x, tam.y, ben)).toBe(0)
    }
  })

  it('chấm phạt đền cách khung thành đúng 11 m', () => {
    expect(khoangToiKhungThanh(CHAM_PHAT_DEN, TAM_Y, 'nha')).toBeCloseTo(
      CHAM_PHAT_DEN,
      10,
    )
  })

  it('tâm sân cách hai khung thành bằng nhau, và bằng nửa chiều dài', () => {
    const nha = khoangToiKhungThanh(TAM_X, TAM_Y, 'nha')
    const khach = khoangToiKhungThanh(TAM_X, TAM_Y, 'khach')
    expect(khach).toBeCloseTo(nha, 10)
    expect(nha).toBeCloseTo(TAM_X, 10)
  })

  it('lệch sang biên thì xa hơn — Pythagore, không phải chỉ hiệu x', () => {
    const giua = khoangToiKhungThanh(20, TAM_Y, 'nha')
    const bien = khoangToiKhungThanh(20, 0, 'nha')
    expect(bien).toBeGreaterThan(giua)
    expect(bien).toBeCloseTo(Math.sqrt(20 * 20 + TAM_Y * TAM_Y), 10)
  })
})

describe('trongSan', () => {
  it('bốn góc và tâm đều trong sân', () => {
    for (const [x, y] of [
      [0, 0],
      [DAI_SAN, 0],
      [0, RONG_SAN],
      [DAI_SAN, RONG_SAN],
      [TAM_X, TAM_Y],
    ]) {
      expect(trongSan(x!, y!), `(${x}, ${y})`).toBe(true)
    }
  })

  it('nhích ra khỏi mỗi biên là ra ngoài', () => {
    expect(trongSan(-0.01, TAM_Y)).toBe(false)
    expect(trongSan(DAI_SAN + 0.01, TAM_Y)).toBe(false)
    expect(trongSan(TAM_X, -0.01)).toBe(false)
    expect(trongSan(TAM_X, RONG_SAN + 0.01)).toBe(false)
  })
})
