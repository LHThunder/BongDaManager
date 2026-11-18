import { describe, expect, it } from 'vitest'
import { NGUONG_KIET_SUC, THE_LUC_DAY } from '../engine/theLuc'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { thoiGianChuyen } from './components/San2D'
import {
  doMetTuTheLuc,
  huongRaKhoiMoc,
  MU_KIET_SUC,
  NHIP_CO_DU,
  noiSuyCong,
  PHAN_NHIP_KIET_SUC,
  PHAN_NHIP_SUNG_SUC,
  thoiLuongCuaNguoi,
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

/*
  Thể lực có **HAI NHÁNH** từ T512 (AC-30.6, quyết định D93), và đây là chỗ
  phải thấy cả hai:

  - **Nhịp không dư** — đúng D88 của spec 004: cùng thời lượng, khác dáng.
  - **Nhịp có dư** — D93 mở lại D88: người kiệt sức đi **chậm thật**, tới đích
    muộn hơn, nhưng vẫn trước nhịp sau.

  D88 **không bị bỏ**: nó vẫn là lưới duy nhất bắt lỗi "kéo dài thời lượng ở
  nhịp không có dư" — thứ chỉ vỡ ở mức Rất nhanh, nơi cả nhịp chỉ có 20ms.
*/
describe('thể lực: nhịp không dư đổi DÁNG (D88), nhịp có dư đi CHẬM THẬT (AC-30.6, D93)', () => {
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

  it('LỚP DÁNG không được đổi thời lượng: cùng tỉ lệ 1 là cùng đích', () => {
    /*
      Phép kiểm chống đúng cái bẫy mà D88 nói tới, và nó vẫn đúng nguyên sau
      D93: thứ D93 kéo dài là **thời lượng chặng** (`thoiLuongCuaNguoi`, một con
      số mili giây), chứ không phải **dáng** (`tiLeTheoDoMet`, một hàm trên
      đoạn [0,1]). Lớp dáng phải trả đúng đích tại tỉ lệ 1 với **mọi** độ mệt
      — ai gộp hai việc ấy vào một lớp thì đỏ ở đây.
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

  // ---- Nhánh hai: nhịp CÓ DƯ thì thể lực đổi cả THỎI LƯỢNG (AC-30.6, D93) ----

  it('nhịp có dư: kiệt sức dùng 95% nhịp, sung sức 75%', () => {
    expect(thoiLuongCuaNguoi(1000, 900, 0)).toBe(750)
    expect(thoiLuongCuaNguoi(1000, 900, 1)).toBe(950)
    expect(thoiLuongCuaNguoi(NHIP_CO_DU, 450, 0)).toBe(
      Math.round(NHIP_CO_DU * PHAN_NHIP_SUNG_SUC),
    )
    expect(PHAN_NHIP_KIET_SUC).toBeLessThan(1)
  })

  it('nhịp có dư: kiệt sức tới đích MUỘN HƠN, nhưng vẫn trước nhịp sau', () => {
    for (const ms of [500, 700, 1000, 2500]) {
      const chung = Math.round(ms * 0.9)
      const kho = thoiLuongCuaNguoi(ms, chung, 0)
      const kiet = thoiLuongCuaNguoi(ms, chung, 1)
      expect(kiet, `nhịp ${ms}ms`).toBeGreaterThan(kho)
      // "đi chậm thật" phải đọc được bằng mắt: chênh tứ một phần năm nhịp.
      expect(kiet - kho).toBeGreaterThanOrEqual(ms * 0.19)
      expect(kiet, `nhịp ${ms}ms`).toBeLessThan(ms)
    }
  })

  it('nhịp có dư: càng mệt càng lâu, không nhảy cóc', () => {
    const cac = [0, 0.25, 0.5, 0.75, 1].map((m) =>
      thoiLuongCuaNguoi(1000, 900, m),
    )
    for (let i = 1; i < cac.length; i += 1) {
      expect(cac[i] as number).toBeGreaterThanOrEqual(cac[i - 1] as number)
    }
  })

  it('nhịp KHÔNG dư: mọi độ mệt cùng một thời lượng — đúng D88', () => {
    for (const ms of [40, 70, 200, NHIP_CO_DU - 1]) {
      const chung = Math.round(ms * 0.9)
      for (const met of [0, 0.5, 1]) {
        expect(
          thoiLuongCuaNguoi(ms, chung, met),
          `nhịp ${ms}ms, mệt ${met}`,
        ).toBe(chung)
      }
    }
  })

  it('mức thôi nội suy thì không có thời lượng nào để nói tới (AC-29.4)', () => {
    for (const met of [0, 0.5, 1]) {
      expect(thoiLuongCuaNguoi(20, 0, met)).toBe(0)
      expect(thoiLuongCuaNguoi(1000, 0, met)).toBe(0)
    }
    // Đầu vào vô lý không được làm nó trả NaN: hàm này chạy mỗi khung vẽ.
    expect(thoiLuongCuaNguoi(Number.NaN, 900, 1)).toBe(900)
    expect(thoiLuongCuaNguoi(1000, 900, Number.NaN)).toBe(750)
  })
})

/*
  Không điểm nào bị GIẬT khi tình huống kế tiếp tới (AC-29.3, AC-30.1).

  **Describe này thay cho describe cũ "không điểm nào còn đang đi khi tình huống kế
  tiếp tới (AC-25.3)" của spec 004, và đó là một việc có chủ đích, không phải một
  lần đổi tên cho đẹp.** Spec 005 mục 10 chốt thay thế hẳn AC-25.3: "luôn luôn
  di chuyển" trái đúng chữ với "không điểm nào còn đang đi". Ý định thật của AC
  ấy — **không bị giật sang đích mới** — được giữ nguyên và phát biểu lại ở
  AC-29.3 và AC-30.1.

  Và từ T512 nó phải đúng ở **cả hai chế độ thể lực** (D93), ở **cả bốn mức tốc
  độ** — vì chính nhánh "nhịp có dư" là thứ dám kéo dài thời lượng một chặng,
  tức dám đẩy một điểm còn bay dở sang nhịp sau nếu ai đó chọn sai hệ số.
*/
describe('không điểm nào bị GIẬT khi tình huống kế tiếp tới (AC-29.3, AC-30.1)', () => {
  it('ở cả bốn mức và cả hai chế độ, chặng kết thúc TRƯỚC nhịp kế tiếp', () => {
    for (const [muc, msMoiPhut] of Object.entries(MS_MOI_PHUT)) {
      const chung = thoiGianChuyen(msMoiPhut)
      expect(chung, `mức ${muc}: ${msMoiPhut}ms một phút trận`).toBeLessThanOrEqual(
        msMoiPhut,
      )
      for (const met of [0, 0.25, 0.5, 0.75, 1]) {
        const rieng = thoiLuongCuaNguoi(msMoiPhut, chung, met)
        expect(
          rieng,
          `mức ${muc} (${msMoiPhut}ms), mệt ${met}`,
        ).toBeLessThanOrEqual(msMoiPhut)
      }
    }
  })

  it('ở mức còn nội suy, chặng riêng của mọi độ mệt đều có thật (không 0, không NaN)', () => {
    for (const [muc, msMoiPhut] of Object.entries(MS_MOI_PHUT)) {
      const chung = thoiGianChuyen(msMoiPhut)
      if (chung === 0) continue
      for (const met of [0, 0.5, 1]) {
        const rieng = thoiLuongCuaNguoi(msMoiPhut, chung, met)
        expect(Number.isFinite(rieng), `mức ${muc}, mệt ${met}`).toBe(true)
        expect(rieng, `mức ${muc}, mệt ${met}`).toBeGreaterThan(0)
      }
    }
  })

  it('tại cuối chặng RIÊNG của mình, điểm ở ĐÚNG đích — cả hai chế độ', () => {
    /*
      Giả lập đúng cách `San2D` chạy từ T512: tỉ lệ đã đi = (đã trôi) chia cho
      thời lượng **riêng của người ấy**, chứ không chia cho một con số chung.
      Chia sai mẫu số thì người kiệt sức bị đẩy tới đích sớm — đúng cú giật mà
      AC-29.3 cấm, và cũng là cách lặng lẽ nhất để vô hiệu hoá cả D93.
    */
    const tu: Diem = { x: 5, y: 5 }
    const den: Diem = { x: 95, y: 55 }

    for (const [muc, msMoiPhut] of Object.entries(MS_MOI_PHUT)) {
      const chung = thoiGianChuyen(msMoiPhut)
      if (chung === 0) continue
      for (const met of [0, 0.5, 1]) {
        const rieng = thoiLuongCuaNguoi(msMoiPhut, chung, met)
        const cuoi = viTriTaiThoiDiem(tu, den, rieng / rieng, {
          doMet: met,
          gioiHan: KHUNG,
          huongVao: { x: -300, y: 200 },
        })
        expect(cuoi, `mức ${muc}, mệt ${met}`).toEqual(den)
      }
    }
  })

  it('giữa chặng, người kiệt sức còn xa đích hơn hẳn — đo theo ĐỒNG HỒ THẬT', () => {
    /*
      Phép kiểm này là thứ phân biệt hai chế độ của D93, vì nó đo ở **cùng
      một mốc thời gian thật** cho hai người, đúng như mắt người xem: 500ms sau
      khi cả hai xuất phát, ai đang ở đâu.
    */
    const tu: Diem = { x: 0, y: 0 }
    const den: Diem = { x: 90, y: 0 }
    const viTri = (msMoiPhut: number, met: number, daTroi: number) => {
      const rieng = thoiLuongCuaNguoi(msMoiPhut, thoiGianChuyen(msMoiPhut), met)
      return viTriTaiThoiDiem(tu, den, daTroi / rieng, {
        doMet: met,
        gioiHan: KHUNG,
      }).x
    }

    // Nhịp có dư: chậm thật, nên chính thời lượng cũng đẩy anh ta ra sau.
    const coDu = viTri(1000, 0, 500) - viTri(1000, 1, 500)
    expect(coDu).toBeGreaterThan(20)

    // Nhịp không dư: cùng thời lượng, chênh chỉ còn do dáng — nhỏ hơn, nhưng
    // vẫn phải còn (AC-30.6 câu sau).
    const khongDu = viTri(200, 0, 90) - viTri(200, 1, 90)
    expect(khongDu).toBeGreaterThan(5)
    expect(khongDu).toBeLessThan(coDu)
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
