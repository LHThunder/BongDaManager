import { describe, expect, it } from 'vitest'
import { DAI_SAN, RONG_SAN, trongSan } from '../hinhHocSan'
import { CAC_COT, CAC_DAI, layVung, vungCuaViTri } from '../vung'
import {
  choDungMet,
  dichNguoiKhongBong,
  PHAN_DICH_THEO_BONG,
  tamVungMet,
  TI_LE_DAI_MET,
} from './viTriMet'

/*
  Quy lưới 12 vùng ra mét (T725).

  Phép kiểm xương sống là cái cuối: lực kéo về phía bóng phải **tỉ lệ**, nên nó
  bằng đúng không ở chính chỗ bóng. Một lực kéo đều tay sẽ dồn cả đội vào một
  điểm — đúng lớp lỗi mà T510 của spec 005 đã trả giá hai lần ở lớp vẽ.
*/

describe('tamVungMet — vùng thành mét (T725)', () => {
  it('mọi vùng của cả hai bên đều nằm TRONG sân', () => {
    for (const ben of ['nha', 'khach'] as const) {
      for (const dai of CAC_DAI) {
        for (const cot of CAC_COT) {
          const d = tamVungMet(layVung(cot, dai), ben)
          expect(trongSan(d.x, d.y), `${ben} ${cot}-${dai}`).toBe(true)
        }
      }
    }
  })

  /*
    Dải tính theo hướng tấn công của ĐỘI ẤY, nên hai bên lật nhau. Đây là chỗ
    dễ sai nhất của cả file: lấy nhầm chiều thì cả đội khách đá về khung thành
    của chính mình, và không một phép kiểm trần cơ học nào thấy gì.
  */
  it('hai bên LẬT nhau: dải 0 của nhà ở đầu sân, của khách ở cuối sân', () => {
    const nha0 = tamVungMet(layVung('giua', 0), 'nha')
    const khach0 = tamVungMet(layVung('giua', 0), 'khach')
    expect(nha0.x).toBeCloseTo(TI_LE_DAI_MET[0] * DAI_SAN, 10)
    expect(khach0.x).toBeCloseTo(DAI_SAN - TI_LE_DAI_MET[0] * DAI_SAN, 10)
    expect(nha0.x + khach0.x).toBeCloseTo(DAI_SAN, 10)
  })

  it('dải TĂNG thì đội nhà tiến lên, đội khách lùi về', () => {
    for (const dai of [1, 2, 3] as const) {
      const truoc = (dai - 1) as 0 | 1 | 2
      expect(tamVungMet(layVung('giua', dai), 'nha').x).toBeGreaterThan(
        tamVungMet(layVung('giua', truoc), 'nha').x,
      )
      expect(tamVungMet(layVung('giua', dai), 'khach').x).toBeLessThan(
        tamVungMet(layVung('giua', truoc), 'khach').x,
      )
    }
  })

  it('ba cột xếp đúng thứ tự trái → giữa → phải, và cột giữa ở đúng giữa', () => {
    const trai = tamVungMet(layVung('trai', 2), 'nha')
    const giua = tamVungMet(layVung('giua', 2), 'nha')
    const phai = tamVungMet(layVung('phai', 2), 'nha')
    expect(trai.y).toBeLessThan(giua.y)
    expect(giua.y).toBeLessThan(phai.y)
    expect(giua.y).toBeCloseTo(RONG_SAN / 2, 10)
    // Và hai biên đối xứng qua tim sân.
    expect(trai.y + phai.y).toBeCloseTo(RONG_SAN, 10)
  })

  it('choDungMet đưa một ô chiến thuật về đúng tâm vùng của ô ấy', () => {
    expect(choDungMet('GK', 'nha')).toEqual(
      tamVungMet(vungCuaViTri('GK'), 'nha'),
    )
  })
})

describe('dichNguoiKhongBong — kéo TỈ LỆ, không kéo đều tay (T725)', () => {
  it('kéo đúng một phần khoảng cách về phía bóng', () => {
    const cho = { x: 20, y: 30 }
    const bong = { x: 60, y: 30 }
    const d = dichNguoiKhongBong(cho, bong)
    expect(d.x).toBeCloseTo(20 + 40 * PHAN_DICH_THEO_BONG, 10)
    expect(d.y).toBeCloseTo(30, 10)
  })

  /*
    ⚠️ XƯƠNG SỐNG. Người đứng ĐÚNG chỗ bóng không dịch một mét nào. Nếu lực kéo
    là một lượng đều tay thì nó triệt tiêu đúng khoảng lệch tách hai người đứng
    gần nhau, và cả đội dồn về một điểm — hai bản đầu của T510 đã hỏng đúng kiểu
    ấy ở lớp vẽ, và ở đây `tachChen` sẽ phải gánh một việc đáng lẽ không có.
  */
  it('người đứng ĐÚNG chỗ bóng không dịch một mét nào', () => {
    const cho = { x: 44, y: 17 }
    expect(dichNguoiKhongBong(cho, cho)).toEqual(cho)
  })

  it('và người càng xa bóng thì dịch càng nhiều', () => {
    const bong = { x: 50, y: 34 }
    const gan = dichNguoiKhongBong({ x: 45, y: 34 }, bong)
    const xa = dichNguoiKhongBong({ x: 5, y: 34 }, bong)
    expect(gan.x - 45).toBeLessThan(xa.x - 5)
  })
})
