import { describe, expect, it } from 'vitest'
import { DAI_SAN, RONG_SAN, TAM_X, TAM_Y } from '../engine/hinhHocSan'
import {
  type KhungAnh,
  metSangDonVi,
  metTuDonVi,
  tiLeMet,
  toaDoTuMet,
} from './quyDoiMet'

/*
  Quy đổi mét → đơn vị ảnh (T703, D121, AC-37.1 + AC-38.8).

  Khung dùng trong mọi phép kiểm dưới đây khai LẠI ba con số của `San2D.tsx`
  (`RONG = 100`, `CAO = 64`, `BAN_KINH = 2.6`) thay vì import chúng — đúng quy
  ước mà `san2D.test.ts` đã dùng cho `TI_LE_DAI_TEST`. Lý do: import từ
  `San2D.tsx` là kéo cả module React vào `environment: 'node'`, và file này là
  hàm thuần.

  Nếu ba con số ấy đổi ở `San2D.tsx` thì phép kiểm ở đây KHÔNG đỏ — nên
  `toaDoTuMet` nhận khung làm tham số chính là để chỗ gọi chịu trách nhiệm,
  còn file này canh CÔNG THỨC.
*/
const KHUNG: KhungAnh = { rong: 100, cao: 64, le: 2.6 }

/** Hệ số đã chốt ở D121, viết ra để phép kiểm đọc được bằng mắt. */
const TI_LE_CHOT = 58.8 / 68

describe('tiLeMet — một hệ số đẳng hướng (D121)', () => {
  it('lấy min của hai trục, và trục y là trục chật', () => {
    expect(tiLeMet(KHUNG)).toBeCloseTo(TI_LE_CHOT, 12)
    expect(tiLeMet(KHUNG)).toBeCloseTo(0.864706, 6)

    // Trục x nếu đứng một mình sẽ rộng hơn — nên nó không phải trục quyết định.
    const chiTheoX = (KHUNG.rong - 2 * KHUNG.le) / DAI_SAN
    expect(chiTheoX).toBeGreaterThan(tiLeMet(KHUNG))
    expect(chiTheoX).toBeCloseTo(0.902857, 6)
  })

  it('sân vừa trọn trong khung ở CẢ HAI chiều, không tràn', () => {
    const ti = tiLeMet(KHUNG)
    expect(DAI_SAN * ti).toBeLessThanOrEqual(KHUNG.rong - 2 * KHUNG.le + 1e-9)
    expect(RONG_SAN * ti).toBeLessThanOrEqual(KHUNG.cao - 2 * KHUNG.le + 1e-9)
  })

  it('đẳng hướng: một mét trên trục x dài đúng bằng một mét trên trục y', () => {
    const goc = toaDoTuMet(KHUNG, 0, 0)
    const dichX = toaDoTuMet(KHUNG, 10, 0)
    const dichY = toaDoTuMet(KHUNG, 0, 10)
    expect(dichX.x - goc.x).toBeCloseTo(goc.y - dichY.y, 12)
  })
})

describe('toaDoTuMet — hai đẳng thức tâm, và hai đẳng thức BIÊN có răng', () => {
  /*
    Hai đẳng thức tâm KHÔNG có răng, và phép kiểm này nói thẳng điều đó: tâm
    sân ánh xạ vào tâm ảnh với MỌI hệ số đẳng hướng. Giữ chúng vì chúng canh
    phép CĂN GIỮA, không canh hệ số.
  */
  it('tâm sân → tâm ảnh (canh phép căn giữa, KHÔNG canh hệ số)', () => {
    const tam = toaDoTuMet(KHUNG, TAM_X, TAM_Y)
    expect(tam.x).toBeCloseTo(50, 9)
    expect(tam.y).toBeCloseTo(32, 9)

    // Chứng minh nó không có răng: hai hệ số đã bị D121 LOẠI cũng thoả.
    for (const ti of [100 / 105, 64 / 68]) {
      const xTam = (KHUNG.rong - DAI_SAN * ti) / 2 + TAM_X * ti
      const yTam = (KHUNG.cao - RONG_SAN * ti) / 2 + (RONG_SAN - TAM_Y) * ti
      expect(xTam, `hệ số ${ti}`).toBeCloseTo(50, 9)
      expect(yTam, `hệ số ${ti}`).toBeCloseTo(32, 9)
    }
  })

  it('BIÊN: x(0 m) = 4,603 và y(0 m) = 61,400 — đây là chỗ có răng', () => {
    const goc = toaDoTuMet(KHUNG, 0, 0)
    expect(goc.x).toBeCloseTo(4.603, 3)
    expect(goc.y).toBeCloseTo(61.4, 3)
  })

  it('hai hệ số bị loại cho hai con số KHÁC ở biên — răng là ở đây', () => {
    const rangX = (ti: number) => (KHUNG.rong - DAI_SAN * ti) / 2
    expect(rangX(tiLeMet(KHUNG))).toBeCloseTo(4.603, 3)
    expect(rangX(100 / 105)).toBeCloseTo(0, 9)
    expect(rangX(64 / 68)).toBeCloseTo(0.588, 3)

    const rangY = (ti: number) => (KHUNG.cao - RONG_SAN * ti) / 2 + RONG_SAN * ti
    expect(rangY(tiLeMet(KHUNG))).toBeCloseTo(61.4, 3)
    expect(rangY(64 / 68)).toBeCloseTo(64, 9)
  })

  it('ĐẢO DẤU y: 0 m là mép DƯỚI nên nó cho y vẽ LỚN nhất', () => {
    const duoi = toaDoTuMet(KHUNG, TAM_X, 0)
    const giua = toaDoTuMet(KHUNG, TAM_X, TAM_Y)
    const tren = toaDoTuMet(KHUNG, TAM_X, RONG_SAN)

    expect(duoi.y).toBeGreaterThan(giua.y)
    expect(giua.y).toBeGreaterThan(tren.y)
    expect(tren.y).toBeCloseTo(KHUNG.le, 9)
    expect(duoi.y).toBeCloseTo(KHUNG.cao - KHUNG.le, 9)
  })

  it('mọi điểm trong sân nằm trong khung, kể cả bốn góc', () => {
    for (const [x, y] of [
      [0, 0],
      [DAI_SAN, 0],
      [0, RONG_SAN],
      [DAI_SAN, RONG_SAN],
    ]) {
      const v = toaDoTuMet(KHUNG, x!, y!)
      expect(v.x, `(${x}, ${y}).x`).toBeGreaterThanOrEqual(0)
      expect(v.x, `(${x}, ${y}).x`).toBeLessThanOrEqual(KHUNG.rong)
      expect(v.y, `(${x}, ${y}).y`).toBeGreaterThanOrEqual(0)
      expect(v.y, `(${x}, ${y}).y`).toBeLessThanOrEqual(KHUNG.cao)
    }
  })

  it('một người sát vạch vôi vẫn còn trọn đĩa trong khung', () => {
    // Lề đúng bằng bán kính điểm, nên đĩa chạm biên chứ không tràn.
    const tren = toaDoTuMet(KHUNG, TAM_X, RONG_SAN)
    expect(tren.y - KHUNG.le).toBeGreaterThanOrEqual(-1e-9)
  })
})

describe('metSangDonVi và metTuDonVi là nghịch đảo của nhau', () => {
  it('đi một vòng cho lại đúng con số ban đầu', () => {
    for (const met of [0, 1, 7.32, 16.5, 68, 105]) {
      expect(metTuDonVi(KHUNG, metSangDonVi(KHUNG, met)), `${met} m`).toBeCloseTo(
        met,
        9,
      )
    }
  })

  it('độ dài là vô hướng: không có gốc, không đảo dấu', () => {
    expect(metSangDonVi(KHUNG, 1)).toBeCloseTo(TI_LE_CHOT, 12)
    expect(metSangDonVi(KHUNG, 0)).toBe(0)
  })

  it('bề rộng sân quy ra đúng 58,8 đơn vị, chiều dài 90,794', () => {
    expect(metSangDonVi(KHUNG, RONG_SAN)).toBeCloseTo(58.8, 9)
    expect(metSangDonVi(KHUNG, DAI_SAN)).toBeCloseTo(90.794, 3)
  })
})
