import { describe, expect, it } from 'vitest'
import { NGUONG_KIET_SUC, THE_LUC_DAY } from '../engine/theLuc'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { thoiGianChuyen } from './components/San2D'
import {
  doMetTuTheLuc,
  huongRaKhoiMoc,
  MU_KIET_SUC,
  noiSuyCong,
  tiLeRoiDungYen,
  TRON_TOI_DA,
  tiLeTheoDoMet,
  viTriTaiThoiDiem,
  type Diem,
  type KhungKep,
} from './noiSuy'

/*
  Nội suy chuyển động (T421, AC-25.1, AC-25.2, AC-25.7).

  Phép kiểm quan trọng nhất của file này là phép kiểm nhàm chán nhất: tại tỉ
  lệ 0 và 1 phải trả về ĐÚNG hai mốc. Cả tính năng đứng trên đó — nội suy chỉ
  được phép vẽ phần xen giữa; sai một pixel tại mốc là tình huống "xảy ra" ở
  sai chỗ, và AC-25.2 có riêng một dòng cho điều ấy.
*/

const KHUNG: KhungKep = { xTu: 0, xDen: 100, yTu: 0, yDen: 60 }

function cach(a: Diem, b: Diem): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

describe('toạ độ tại mốc không bao giờ sai (AC-25.2)', () => {
  const tu: Diem = { x: 10, y: 20 }
  const den: Diem = { x: 80, y: 45 }

  it('tỉ lệ 0 trả về đúng mốc đầu, tỉ lệ 1 trả về đúng mốc cuối', () => {
    expect(noiSuyCong(tu, den, 0)).toEqual(tu)
    expect(noiSuyCong(tu, den, 1)).toEqual(den)
  })

  it('đúng cả khi có tiếp tuyến vào — tiếp tuyến không được kéo lệch mốc', () => {
    const huong: Diem = { x: -200, y: 300 }
    expect(noiSuyCong(tu, den, 0, huong)).toEqual(tu)
    expect(noiSuyCong(tu, den, 1, huong)).toEqual(den)
  })

  it('đúng cả khi đi qua lớp gộp, với mọi độ mệt', () => {
    for (const doMet of [0, 0.5, 1]) {
      expect(viTriTaiThoiDiem(tu, den, 0, { doMet }), `mệt ${doMet}`).toEqual(
        tu,
      )
      expect(viTriTaiThoiDiem(tu, den, 1, { doMet }), `mệt ${doMet}`).toEqual(
        den,
      )
    }
  })

  it('tỉ lệ ngoài khoảng 0..1 bị kẹp lại, không ngoại suy ra ngoài sân', () => {
    expect(noiSuyCong(tu, den, -5)).toEqual(tu)
    expect(noiSuyCong(tu, den, 7)).toEqual(den)
    expect(noiSuyCong(tu, den, Number.NaN)).toEqual(tu)
  })
})

describe('đường đi mềm và nằm trong khung sân (AC-25.1)', () => {
  it('không tiếp tuyến thì rút về đúng đường thẳng', () => {
    const tu: Diem = { x: 0, y: 0 }
    const den: Diem = { x: 10, y: 20 }
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const p = noiSuyCong(tu, den, t)
      expect(p.x, `t=${t}`).toBeCloseTo(10 * t, 10)
      expect(p.y, `t=${t}`).toBeCloseTo(20 * t, 10)
    }
  })

  it('có tiếp tuyến thì đường đi CONG — lệch hẳn khỏi đường thẳng', () => {
    const tu: Diem = { x: 0, y: 30 }
    const den: Diem = { x: 60, y: 30 }
    // Đang đi lên khi tới mốc đầu: đường mới phải vòng lên rồi mới xuôi về.
    const huong: Diem = { x: 0, y: -60 }

    let lechToiDa = 0
    for (let i = 1; i < 20; i += 1) {
      const t = i / 20
      const p = noiSuyCong(tu, den, t, huong)
      lechToiDa = Math.max(lechToiDa, Math.abs(p.y - 30))
    }
    expect(lechToiDa).toBeGreaterThan(2)
  })

  it('đường đi không bao giờ vọt ra ngoài khung sân', () => {
    const goc: readonly Diem[] = [
      { x: 1, y: 1 },
      { x: 99, y: 1 },
      { x: 99, y: 59 },
      { x: 1, y: 59 },
      { x: 50, y: 30 },
    ]
    const huongManh: readonly Diem[] = [
      { x: 400, y: 0 },
      { x: -400, y: 0 },
      { x: 0, y: 400 },
      { x: 0, y: -400 },
      { x: 300, y: -300 },
    ]

    for (const tu of goc) {
      for (const den of goc) {
        for (const huong of huongManh) {
          for (let i = 0; i <= 20; i += 1) {
            const p = noiSuyCong(tu, den, i / 20, huong, KHUNG)
            expect(
              p.x >= KHUNG.xTu && p.x <= KHUNG.xDen,
              `x=${p.x} ngoài khung`,
            ).toBe(true)
            expect(
              p.y >= KHUNG.yTu && p.y <= KHUNG.yDen,
              `y=${p.y} ngoài khung`,
            ).toBe(true)
          }
        }
      }
    }
  })

  it('đi liên tục: hai bước sát nhau thì toạ độ cũng sát nhau', () => {
    const tu: Diem = { x: 5, y: 10 }
    const den: Diem = { x: 90, y: 50 }
    const huong = huongRaKhoiMoc({ x: 5, y: 55 }, tu)

    let truoc = noiSuyCong(tu, den, 0, huong, KHUNG)
    let buocLonNhat = 0
    for (let i = 1; i <= 100; i += 1) {
      const nay = noiSuyCong(tu, den, i / 100, huong, KHUNG)
      buocLonNhat = Math.max(buocLonNhat, cach(truoc, nay))
      truoc = nay
    }
    // Quãng đường cả cú di chuyển ~94; một phần trăm của nó không được
    // thành một cú nhảy. Mốc 5 là rộng rãi, đủ để bắt lỗi nhảy thật.
    expect(buocLonNhat).toBeLessThan(5)
  })

  it('tỉ lệ rời đứng yên: giữ nguyên hai đầu, luôn tăng, êm ở đầu', () => {
    expect(tiLeRoiDungYen(0)).toBe(0)
    expect(tiLeRoiDungYen(1)).toBe(1)

    let truoc = -1
    for (let i = 0; i <= 50; i += 1) {
      const v = tiLeRoiDungYen(i / 50)
      expect(v).toBeGreaterThanOrEqual(truoc)
      truoc = v
    }

    // ÊM Ở ĐẦU: bước đầu tiên phải nhỏ hơn hẳn bước giữa chặng.
    const buocDau = tiLeRoiDungYen(0.02) - tiLeRoiDungYen(0)
    const buocGiua = tiLeRoiDungYen(0.52) - tiLeRoiDungYen(0.5)
    expect(buocDau).toBeLessThan(buocGiua / 2)
  })

  /*
    AC-30.1 đòi tốc độ tại mốc **không về 0**. Đây là phép kiểm của điều đó,
    và nó đo bằng số chứ không bằng mắt.

    Ngưỡng buộc vào đúng điều lớp này **bảo đảm**: phần tuyến tính còn lại
    sau khi trộn dáng mệt là `1 − TRON_TOI_DA`, nên trong 1% thời gian đầu
    tiên, một người dù kiệt sức hoàn toàn vẫn đi được ít nhất `0,2 × 1%` quãng
    đường. Buộc vào hằng số thay vì một số ma: nếu ai đó quay về `u ** mu`
    thuần thì con số ấy tụt xuống ~2e-6, tức nhỏ hơn ngưỡng cả nghìn lần và
    phép kiểm đỏ ngay.
  */
  it('tốc độ tại mốc KHÔNG về 0 khi có tốc độ vào — mọi độ lốn tiếp tuyến', () => {
    const tu: Diem = { x: 10, y: 30 }
    const den: Diem = { x: 70, y: 30 }
    const eps = 0.01

    for (const huongVao of [
      { x: 60, y: 0 },
      { x: 5, y: 40 },
      { x: -300, y: 200 },
      { x: 0.5, y: 0 },
    ]) {
      /*
        Chuẩn hoá theo ĐỘ LỚN CỦA TỐC ĐỘ VÀO, không theo dây cung của chặng
        này: tốc độ vào là của **chặng trước**, và nó hoàn toàn có thể nhỏ hơn
        hay lớn hơn dây cung hiện tại. Lần đầu viết phép kiểm này tôi chia cho
        dây cung và nó đỏ oan ở tiếp tuyến (5, 40).
      */
      const tocDoVao = Math.hypot(huongVao.x, huongVao.y)
      for (const doMet of [0, 0.5, 1]) {
        const p = viTriTaiThoiDiem(tu, den, eps, { huongVao, doMet })
        const diDuoc = Math.hypot(p.x - tu.x, p.y - tu.y)
        expect(
          diDuoc,
          `tiếp tuyến ${huongVao.x},${huongVao.y} mệt ${doMet}`,
        ).toBeGreaterThan(tocDoVao * eps * (1 - TRON_TOI_DA) * 0.9)
      }
    }
  })

  it('không có tốc độ vào thì được phép êm ở đầu — đúng là một người đang đứng', () => {
    const tu: Diem = { x: 10, y: 30 }
    const den: Diem = { x: 70, y: 30 }
    const coVao = viTriTaiThoiDiem(tu, den, 0.02, { huongVao: { x: 60, y: 0 } })
    const khongVao = viTriTaiThoiDiem(tu, den, 0.02, {})
    expect(khongVao.x - tu.x).toBeLessThan(coVao.x - tu.x)
  })
})

describe('thể lực đổi DÁNG, không đổi thời lượng (AC-25.7, D88)', () => {
  it('độ mệt suy từ thể lực: đầy là 0, dưới ngưỡng kiệt sức là 1', () => {
    expect(doMetTuTheLuc(THE_LUC_DAY)).toBe(0)
    expect(doMetTuTheLuc(THE_LUC_DAY + 20)).toBe(0)
    expect(doMetTuTheLuc(NGUONG_KIET_SUC)).toBe(1)
    expect(doMetTuTheLuc(0)).toBe(1)
    expect(doMetTuTheLuc(undefined)).toBe(0)

    const giua = doMetTuTheLuc((THE_LUC_DAY + NGUONG_KIET_SUC) / 2)
    expect(giua).toBeGreaterThan(0.4)
    expect(giua).toBeLessThan(0.6)
  })

  it('mọi độ mệt đều về đích ĐÚNG LÚC — hai đầu không đổi', () => {
    for (const doMet of [0, 0.3, 0.7, 1]) {
      expect(tiLeTheoDoMet(0, doMet), `mệt ${doMet}`).toBe(0)
      expect(tiLeTheoDoMet(1, doMet), `mệt ${doMet}`).toBe(1)
    }
  })

  it('người kiệt sức TRỄ HƠN rõ rệt trong gần suốt quãng đường', () => {
    /*
      Đây là phần "rõ rệt" của AC-25.7, đo được bằng số: ở giữa cú di
      chuyển, người kiệt sức phải còn cách đích hơn hẳn người sung sức.
    */
    let soMocTreHon = 0
    for (let i = 1; i < 20; i += 1) {
      const t = i / 20
      const khoe = tiLeTheoDoMet(t, 0)
      const kiet = tiLeTheoDoMet(t, 1)
      expect(kiet, `t=${t}`).toBeLessThanOrEqual(khoe)
      if (khoe - kiet > 0.05) soMocTreHon += 1
    }
    expect(soMocTreHon).toBeGreaterThan(12)

    // Ở chính giữa, khoảng cách phải lớn tới mức nhìn thấy được.
    expect(tiLeTheoDoMet(0.5, 0) - tiLeTheoDoMet(0.5, 1)).toBeGreaterThan(0.2)
  })

  it('càng mệt càng trễ, không nhảy cóc', () => {
    const tai = (doMet: number) => tiLeTheoDoMet(0.5, doMet)
    const cacMuc = [0, 0.25, 0.5, 0.75, 1].map(tai)
    for (let i = 1; i < cacMuc.length; i += 1) {
      expect(cacMuc[i] as number).toBeLessThanOrEqual(cacMuc[i - 1] as number)
    }
    expect(MU_KIET_SUC).toBeGreaterThan(1)
  })

  it('người kiệt sức KHÔNG được đi lâu hơn: cùng mốc thời gian, cùng đích', () => {
    /*
      Phép kiểm chống đúng cái bẫy mà D88 nói tới. Nếu ai đó sửa lớp này
      thành "kéo dài thời lượng theo thể lực" thì `viTriTaiThoiDiem` tại tỉ
      lệ 1 sẽ không còn là đích — và AC-25.3 vỡ mà không ai thấy, vì nó chỉ
      vỡ ở mức tốc độ nhanh nhất.
    */
    const tu: Diem = { x: 0, y: 0 }
    const den: Diem = { x: 50, y: 50 }
    for (const doMet of [0, 0.5, 1]) {
      const cuoi = viTriTaiThoiDiem(tu, den, 1, { doMet, gioiHan: KHUNG })
      expect(cuoi, `mệt ${doMet}`).toEqual(den)
    }
  })

  it('ở giữa đường, điểm kiệt sức nằm SAU điểm khoẻ trên cùng một đoạn', () => {
    const tu: Diem = { x: 0, y: 0 }
    const den: Diem = { x: 80, y: 0 }
    const khoe = viTriTaiThoiDiem(tu, den, 0.5, { doMet: 0 })
    const kiet = viTriTaiThoiDiem(tu, den, 0.5, { doMet: 1 })
    expect(kiet.x).toBeLessThan(khoe.x)
    expect(khoe.x - kiet.x).toBeGreaterThan(8)
  })
})

/*
  Theo kịp nhịp đồng hồ ở mọi mức tốc độ (T425, AC-25.3).

  Đây là chỗ AC-25.3 và AC-25.7 có thể đánh nhau, và là lý do D88 tồn tại.
  Phép kiểm dưới đây buộc hai điều phải cùng đúng bằng SỐ, không bằng mắt:
  thời lượng một cú di chuyển không bao giờ vượt một nhịp đồng hồ, và thể
  lực không được phép đụng vào thời lượng ấy.
*/
describe('không điểm nào còn đang đi khi tình huống kế tiếp tới (AC-25.3)', () => {
  it('ở MỊI mức tốc độ, cú chuyển chỗ kết thúc trước nhịp kế tiếp', () => {
    for (const [muc, msMoiPhut] of Object.entries(MS_MOI_PHUT)) {
      expect(
        thoiGianChuyen(msMoiPhut),
        `mức ${muc}: ${msMoiPhut}ms một phút trận`,
      ).toBeLessThanOrEqual(msMoiPhut)
    }
  })

  it('thể lực KHÔNG đụng vào thời lượng — kiệt sức vẫn về đích đúng nhịp', () => {
    /*
      Giả lập đúng cách `San2D` chạy: tại mốc thời gian bằng `thoiGianChuyen`,
      tỉ lệ là 1, và điểm phải ở ĐÚNG đích — với mọi độ mệt, ở mọi mức tốc độ.
      Nếu ai đó sửa lớp này thành "kéo dài thời lượng theo thể lực" thì phép
      kiểm này đỏ ngay, thay vì để lỗi lộ ra ở mức Rất nhanh nơi chỉ còn 2ms dư.
    */
    const tu: Diem = { x: 5, y: 5 }
    const den: Diem = { x: 95, y: 55 }

    for (const [muc, msMoiPhut] of Object.entries(MS_MOI_PHUT)) {
      const thoiLuong = thoiGianChuyen(msMoiPhut)
      /*
        Mức nào thôi nội suy thì không có "thời lượng" để nói tới (AC-29.4,
        D97): `San2D` vẽ một lần tại toạ độ mốc và không gọi lớp nội suy. Thêm
        dòng này ở T501, khi `thoiGianChuyen` bắt đầu trả 0 ở mức Rất nhanh —
        không có nó thì `thoiLuong / thoiLuong` là `0/0`, tức `NaN`, và phép kiểm
        đỏ vì một lý do không liên quan gì tới điều nó muốn chứng minh.
      */
      if (thoiLuong === 0) continue
      for (const doMet of [0, 0.5, 1]) {
        // Tại đúng mốc kết thúc: `San2D` tính tỉ lệ = (đã trôi) / thời lượng.
        const tiLe = thoiLuong / thoiLuong
        const cuoi = viTriTaiThoiDiem(tu, den, tiLe, {
          doMet,
          gioiHan: KHUNG,
          huongVao: { x: -300, y: 200 },
        })
        expect(cuoi, `mức ${muc}, mệt ${doMet}`).toEqual(den)
      }
    }
  })

  it('ở mức nhanh nhất, cú di chuyển vẫn chia được thành nhiều bước', () => {
    /*
      18ms là thời lượng ở mức Rất nhanh — chỉ khoảng một khung hình 60Hz.
      Phép kiểm này không đòi nó mượt (không thể), chỉ đòi lớp nội suy không
      sinh ra toạ độ vô lý khi thời lượng ngắn tới vậy.
    */
    const tu: Diem = { x: 10, y: 10 }
    const den: Diem = { x: 90, y: 50 }
    for (let i = 0; i <= 4; i += 1) {
      const p = viTriTaiThoiDiem(tu, den, i / 4, { doMet: 1, gioiHan: KHUNG })
      expect(Number.isFinite(p.x) && Number.isFinite(p.y), `b${i}`).toBe(true)
      expect(p.x >= KHUNG.xTu && p.x <= KHUNG.xDen, `b${i} x=${p.x}`).toBe(true)
      expect(p.y >= KHUNG.yTu && p.y <= KHUNG.yDen, `b${i} y=${p.y}`).toBe(true)
    }
  })
})
