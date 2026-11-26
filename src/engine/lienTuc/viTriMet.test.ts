import { describe, expect, it } from 'vitest'
import { DAI_SAN, RONG_SAN, trongSan } from '../hinhHocSan'
import { CAC_COT, CAC_DAI, layVung, vungCuaViTri } from '../vung'
import type { PositionId } from '../../domain/types'
import {
  choDungDoiHinhMet,
  choDungMet,
  dichNguoiKhongBong,
  GIAN_TRONG_VUNG,
  LUI_VE_SAN_MINH,
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

/*
  ====================================================================
  KHÔNG HAI NGƯỜI CÙNG MỘT ĐIỂM ĐÍCH (T814).
  ====================================================================

  Lưới 12 vùng phát **8 điểm đích cho 22 người** trên đội hình mẫu, nên 22 trong
  231 cặp nhắm **đúng một điểm** và dính nhau cả trận. Chú thích trên
  `choDungDoiHinhMet` trong `viTriMet.ts` có bảng đo đầy đủ; đây là phép kiểm.
*/
describe('choDungDoiHinhMet — giãn người cùng vùng (T814)', () => {
  const DOI_HINH_4_4_2: readonly PositionId[] = [
    'GK',
    'DL',
    'DC',
    'DC',
    'DR',
    'ML',
    'MC',
    'MC',
    'MR',
    'ST',
    'ST',
  ]

  it('không hai người nào cùng một điểm, cả hai bên cùng lúc', () => {
    const cac = [
      ...choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha'),
      ...choDungDoiHinhMet(DOI_HINH_4_4_2, 'khach'),
    ]
    expect(cac).toHaveLength(22)
    const khoa = new Set(cac.map((d) => `${d.x.toFixed(6)},${d.y.toFixed(6)}`))
    expect(khoa.size).toBe(22)
  })

  it('và cách nhau hơn MỘT BÁN KÍNH ĐĨA VẼ — 3,01 m của sân 2D', () => {
    /*
      ⚠️ CHÍNH ngưỡng của AC-49.6, viết lại ở đây bằng mét để phép kiểm engine
      không phải `import` một hằng số của lớp vẽ: bán kính `2,6` đơn vị chia
      hệ số `min(94,8/105 ; 58,8/68) = 0,864706`.

      Đây là phép kiểm đáng giá nhất trong khối: nó không chỉ đòi "khác nhau"
      mà đòi **khác đủ để đếm ra hai**. Trước T814 nó đỏ ở 22 cặp.
    */
    const BAN_KINH_MET = 2.6 / 0.864706
    const cac = [
      ...choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha'),
      ...choDungDoiHinhMet(DOI_HINH_4_4_2, 'khach'),
    ]
    let ganNhat = Infinity
    for (let i = 0; i < cac.length; i += 1) {
      for (let j = i + 1; j < cac.length; j += 1) {
        const d = Math.hypot(cac[i]!.x - cac[j]!.x, cac[i]!.y - cac[j]!.y)
        if (d < ganNhat) ganNhat = d
      }
    }
    expect(ganNhat).toBeGreaterThan(BAN_KINH_MET)
    /*
      Và nêu luôn con số: **10 m**, đúng `GIAN_TRONG_VUNG` — hai người cùng
      vùng. Cặp hai đội đối diện nhau cách **12 m** (`2 × LUI_VE_SAN_MINH`),
      nên cặp chặt nhất trên sân nay là cặp **cùng đội**, không phải cặp đối
      mặt. Ở bản đầu của T814 (`LUI_VE_SAN_MINH = 3,5`) thì ngược lại: cặp
      đối mặt chỉ cách 7 m — qua ngưỡng đếm-ra-hai nhưng chỉ hơn **một**
      đường kính đĩa 1 cm, và trên bản chạy nó thành 11 cặp dính nhau. Người
      dùng xem rồi chốt `6,0 m` ngày 2026-11-26.
    */
    expect(ganNhat).toBeCloseTo(GIAN_TRONG_VUNG, 5)
  })

  it('mọi điểm nằm TRONG sân', () => {
    for (const ben of ['nha', 'khach'] as const) {
      for (const d of choDungDoiHinhMet(DOI_HINH_4_4_2, ben)) {
        expect(trongSan(d.x, d.y), `${ben} ${d.x},${d.y}`).toBe(true)
      }
    }
  })

  it('tất định: cùng đầu vào cho cùng đầu ra (P1)', () => {
    expect(choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha')).toEqual(
      choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha'),
    )
  })

  it('nhóm MỘT người không lệch ngang — đội hình không bị xô vì hàm này có mặt', () => {
    /*
      Thủ môn là người duy nhất trong vùng của anh ta ở đội hình mẫu, nên `y`
      của anh ta phải bằng ĐÚNG `y` của tâm vùng. Chỉ `x` lùi về sân mình.
    */
    const goc = choDungMet('GK', 'nha')
    const moi = choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha')[0]!
    expect(moi.y).toBe(goc.y)
    expect(moi.x).toBe(goc.x - LUI_VE_SAN_MINH)
  })

  it('hai người cùng vùng lệch ĐÚNG GIAN_TRONG_VUNG, đối xứng quanh tâm', () => {
    const moi = choDungDoiHinhMet(DOI_HINH_4_4_2, 'nha')
    const hai = [moi[2]!, moi[3]!] // hai DC
    const tam = choDungMet('DC', 'nha')
    expect(hai[1]!.y - hai[0]!.y).toBeCloseTo(GIAN_TRONG_VUNG, 10)
    expect((hai[0]!.y + hai[1]!.y) / 2).toBeCloseTo(tam.y, 10)
  })

  it('⚠️ CHỐNG RỖNG: trên đội hình mẫu, choDungMet CÓ trùng điểm thật', () => {
    /*
      Nếu lưới vùng vốn đã phát 22 điểm khác nhau thì mọi phép kiểm trên kia
      xanh mà không chứng minh gì. Khẳng định ngược: hàm CŨ trùng, đúng 8 điểm.
    */
    const cu = [
      ...DOI_HINH_4_4_2.map((v) => choDungMet(v, 'nha')),
      ...DOI_HINH_4_4_2.map((v) => choDungMet(v, 'khach')),
    ]
    const khoa = new Set(cu.map((d) => `${d.x.toFixed(6)},${d.y.toFixed(6)}`))
    expect(khoa.size).toBe(8)
  })
})
