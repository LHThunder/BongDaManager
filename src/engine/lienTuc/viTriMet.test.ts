import { describe, expect, it } from 'vitest'
import { DAI_SAN, RONG_SAN, trongSan } from '../hinhHocSan'
import { CAC_COT, CAC_DAI, layVung, vungCuaViTri } from '../vung'
import type { PositionId } from '../../domain/types'
import {
  BIEN_DO_PHAN_DICH,
  choDungDoiHinhMet,
  choDungMet,
  dichNguoiKhongBong,
  GIAN_TRONG_VUNG,
  LUI_VE_SAN_MINH,
  PHAN_DICH_THEO_BONG,
  phanDichCuaO,
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

/*
  ====================================================================
  MỘT HỆ SỐ CHO 22 NGƯỜI LÀ MỘT KHỐI CỨNG (T815).
  ====================================================================

  Khối này canh **đại số**, không canh một con số đo được trên trận: với một hệ
  số `p` duy nhất thì `Δđích_i = p · Δbóng` **bằng nhau với mọi i**, tức trường
  đích là một phép tịnh tiến cứng. Phép kiểm cuối dựng lại đúng mệnh đề ấy và
  đòi nó **sai** sau T815.
*/
describe('phanDichCuaO — mỗi người một hệ số bám bóng (T815)', () => {
  const O = Array.from({ length: 11 }, (_, o) => o)

  it('trung bình đúng bằng PHAN_DICH_THEO_BONG — đội hình không lùi sâu thêm', () => {
    /*
      ⚠️ Đây là lời hứa đắt nhất của T815. Dãy `frac(o·φ)` thô có trung bình
      0,4538 chứ không phải 0,5; không trừ đi thì hệ số trung bình tụt còn
      0,2408 và **cả hai đội lùi sâu hơn** so với trước T815 — một thay đổi
      hành vi mà task này không xin phép làm.
    */
    const tong = O.reduce((s, o) => s + phanDichCuaO(o), 0)
    expect(tong / O.length).toBeCloseTo(PHAN_DICH_THEO_BONG, 12)
  })

  it('11 hệ số KHÁC NHAU từng đôi một — không hai ai cùng một hệ số', () => {
    expect(new Set(O.map((o) => phanDichCuaO(o).toFixed(9))).size).toBe(11)
  })

  it('nằm trong dải đã nêu, và không hệ số nào âm hay quá 1', () => {
    for (const o of O) {
      const p = phanDichCuaO(o)
      expect(p, `ô ${o}`).toBeGreaterThan(PHAN_DICH_THEO_BONG - BIEN_DO_PHAN_DICH)
      expect(p, `ô ${o}`).toBeLessThan(PHAN_DICH_THEO_BONG + BIEN_DO_PHAN_DICH)
      expect(p, `ô ${o}`).toBeGreaterThan(0)
      expect(p, `ô ${o}`).toBeLessThan(1)
    }
  })

  it('hai đội dùng CÙNG dãy — ô 11 lặp lại ô 0, không bên nào được lợi', () => {
    for (const o of O) expect(phanDichCuaO(o + 11)).toBe(phanDichCuaO(o))
  })

  it('tất định: gọi lại cho đúng con số ấy (P1)', () => {
    expect(O.map((o) => phanDichCuaO(o))).toEqual(O.map((o) => phanDichCuaO(o)))
  })

  it('AC-30.5 còn nguyên: ai đứng đúng chỗ bóng thì KHÔNG dịch, dù hệ số nào', () => {
    /*
      Lực kéo vẫn **tỉ lệ khoảng cách**, nên mệnh đề cũ không bị hệ số riêng
      làm hỏng. Đây là bất biến mà T510 của spec 005 đã trả giá hai lần.
    */
    const bong = { x: 60, y: 20 }
    for (const o of O) {
      const d = dichNguoiKhongBong(bong, bong, phanDichCuaO(o))
      expect(d.x, `ô ${o}`).toBeCloseTo(bong.x, 12)
      expect(d.y, `ô ${o}`).toBeCloseTo(bong.y, 12)
    }
  })

  it('🧮 TRƯỜNG ĐÍCH KHÔNG CÒN LÀ MỘT KHỐI CỨNG — và chống rỗng đi kèm', () => {
    /*
      Dựng hai thế bóng và lấy hiệu của 22 đích. Với **một** hệ số chung, 22
      vectơ ấy bằng nhau **từng số** — phần dưới khẳng định đúng điều đó, để
      phép kiểm này không xanh bằng cách không đo gì.
    */
    const cho = Array.from({ length: 22 }, (_, i) => ({ x: 10 + i * 4, y: 8 + (i % 7) * 8 }))
    const b1 = { x: 30, y: 20 }
    const b2 = { x: 70, y: 50 }
    const hieu = (phan: (i: number) => number) =>
      cho.map((c, i) => {
        const a = dichNguoiKhongBong(c, b1, phan(i))
        const b = dichNguoiKhongBong(c, b2, phan(i))
        return { x: b.x - a.x, y: b.y - a.y }
      })

    const tanMan = (d: readonly { x: number; y: number }[]) => {
      const mx = d.reduce((s, v) => s + v.x, 0) / d.length
      const my = d.reduce((s, v) => s + v.y, 0) / d.length
      const dai = d.reduce((s, v) => s + Math.hypot(v.x, v.y), 0) / d.length
      const sd = Math.sqrt(
        d.reduce((s, v) => s + (v.x - mx) ** 2 + (v.y - my) ** 2, 0) / d.length,
      )
      return sd / dai
    }

    // ⚠️ CHỐNG RỖNG: mô hình MỘT hệ số cho đúng 0 — khối cứng, không sai số.
    expect(tanMan(hieu(() => PHAN_DICH_THEO_BONG))).toBeCloseTo(0, 12)

    /*
      Và sau T815 nó bằng **hệ số biến thiên của dãy `p`** — một con số đóng,
      không phụ thuộc thế bóng nào, vì `Δđích_i = p_i · Δbóng`.
    */
    const ps = Array.from({ length: 11 }, (_, o) => phanDichCuaO(o))
    const tb = ps.reduce((s, v) => s + v, 0) / 11
    const cv = Math.sqrt(ps.reduce((s, v) => s + (v - tb) ** 2, 0) / 11) / tb
    expect(cv).toBeCloseTo(0.1434, 4)
    expect(tanMan(hieu((i) => phanDichCuaO(i)))).toBeCloseTo(cv, 10)
  })
})
