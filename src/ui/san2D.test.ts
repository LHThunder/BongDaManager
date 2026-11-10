import { describe, expect, it } from 'vitest'
import { soDoTheoQuanSo } from '../domain/formations'
import {
  benMauQuanSo,
  cauHinhMau,
  MA_TRAN_CO_DINH,
} from '../engine/__fixtures__/doiMau'
import {
  CAC_QUAN_SO,
  chayHetTran,
  dongSuKien,
  taoTran,
  type TrangThaiTran,
} from '../engine/tran'
import type { SuKien } from '../engine/suKien'
import { hinhSan, khungSan, KHUNG_SAN, type DiemCauThu } from './components/San2D'

/*
  Hình học của sân 2D ở mọi quân số (AC-15.1, AC-15.2, AC-15.6).

  Bộ test chạy ở `environment: 'node'` và chỉ nhận `*.test.ts`, nên không có
  đường nào render component. `hinhSan` được tách ra chính vì ba AC này đều là
  phát biểu về TOẠ ĐỘ, không phải về DOM — kiểm toạ độ là kiểm đúng thứ cần
  kiểm, chứ không phải kiểm hộ.
*/

/** Những quân số đã có sơ đồ để dựng được một trận thật. */
const QUAN_SO_CHAY_DUOC = CAC_QUAN_SO.filter(
  (n) => soDoTheoQuanSo(n).length > 0,
)

function tranMau(n: number, ma = MA_TRAN_CO_DINH[0]): TrangThaiTran {
  return taoTran(
    cauHinhMau(ma, {
      quanSo: n,
      nha: benMauQuanSo('A', n),
      khach: benMauQuanSo('B', n),
    }),
  )
}

function veTu(tt: TrangThaiTran, suKien: SuKien | null = null) {
  return hinhSan({
    nha: { ben: tt.ben.nha, ten: 'Đội A', mauAo: '#dc2626' },
    khach: { ben: tt.ben.khach, ten: 'Đội B', mauAo: '#2563eb' },
    suKien,
    tenCauThu: (id) => id,
    soAo: () => 9,
  })
}

/** Khoảng cách nhỏ nhất giữa hai điểm bất kỳ, kèm tên hai người đó. */
function khoangGanNhat(cacDiem: readonly DiemCauThu[]): {
  khoang: number
  cap: string
} {
  let khoang = Infinity
  let cap = ''
  for (let i = 0; i < cacDiem.length; i += 1) {
    for (let j = i + 1; j < cacDiem.length; j += 1) {
      const a = cacDiem[i]
      const b = cacDiem[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < khoang) {
        khoang = d
        cap = `${a.playerId} ↔ ${b.playerId}`
      }
    }
  }
  return { khoang, cap }
}

/*
  Ngưỡng là MỘT BÁN KÍNH của chính khung đó, không phải một con số cố định.

  Cách phát biểu này không phụ thuộc tỉ lệ: khung co thì bán kính co theo
  đúng cùng tỉ lệ (sân 5 là mô hình thu nhỏ của sân 11), nên "hai điểm cách
  nhau ít nhất một bán kính" là cùng một mức phân biệt bằng mắt ở mọi quân
  số. Dưới một bán kính thì tâm điểm này nằm trong lòng điểm kia — người xem
  thấy một vệt chứ không thấy hai người, mà AC-15.1 lại đếm điểm.

  Đo thật trên 5 mã trận × mọi quân số: chỗ chật nhất luôn là 1,18 bán kính,
  giống nhau ở cả bảy quân số. Bản đầu của T214 (co khung mà không co số đo)
  cho sân 5 tụt xuống 0,55 bán kính — chính phép này bắt được.
*/
function khoangPhanBiet(banKinh: number): number {
  return banKinh
}

describe('khung sân theo quân số (AC-15.6)', () => {
  it('sân 11 giữ đúng khung 100×64 của spec 001', () => {
    expect(khungSan(11)).toEqual({ rong: 100, cao: 64 })
  })

  it('sân 5 ngắn hơn VÀ hẹp hơn sân 11', () => {
    const nho = khungSan(5)
    const to = khungSan(11)
    expect(nho.rong).toBeLessThan(to.rong)
    expect(nho.cao).toBeLessThan(to.cao)
  })

  it('quân số càng nhỏ thì khung càng nhỏ, không có bậc nào đi ngược', () => {
    for (let n = 6; n <= 11; n += 1) {
      const duoi = khungSan(n - 1)
      const tren = khungSan(n)
      expect(duoi.rong, `quân số ${n - 1} so với ${n}`).toBeLessThan(tren.rong)
      expect(duoi.cao, `quân số ${n - 1} so với ${n}`).toBeLessThan(tren.cao)
    }
  })

  it('mọi quân số chơi được đều có khung riêng', () => {
    for (const n of CAC_QUAN_SO) {
      expect(KHUNG_SAN[n], `quân số ${n}`).toBeDefined()
    }
  })

  it('quân số lạ thì rơi về khung sân 11 chứ không vỡ hình', () => {
    expect(khungSan(3)).toEqual(KHUNG_SAN[11])
    expect(khungSan(12)).toEqual(KHUNG_SAN[11])
  })
})

describe('số điểm trên sân 2D (AC-15.1)', () => {
  it('trận quân số n vẽ đúng 2n điểm', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const { cacDiem } = veTu(tranMau(n))
      expect(cacDiem, `quân số ${n}`).toHaveLength(2 * n)
    }
  })

  it('mỗi điểm là một cầu thủ khác nhau', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const { cacDiem } = veTu(tranMau(n))
      const ids = new Set(cacDiem.map((d) => d.playerId))
      expect(ids.size, `quân số ${n}`).toBe(2 * n)
    }
  })
})

describe('điểm không chồng khít lên nhau (AC-15.2)', () => {
  it('ở lúc giao bóng, mọi quân số đều phân biệt được từng điểm', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const { cacDiem, banKinh } = veTu(tranMau(n))
      const { khoang, cap } = khoangGanNhat(cacDiem)
      expect(
        khoang,
        `quân số ${n}: gần nhất ${khoang.toFixed(2)} (${cap}), bán kính ${banKinh.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(khoangPhanBiet(banKinh))
    }
  })

  /*
    Trường hợp khó hơn hẳn: trong một tình huống, những người tham gia bị dồn
    TỚI cùng một vùng. Đây là chỗ T132 từng vẽ hai điểm nằm khít lên nhau.
  */
  it('trong từng tình huống thật, người tham gia vẫn không đè nhau', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const tt = chayHetTran(tranMau(n, MA_TRAN_CO_DINH[1]))

      for (const sk of dongSuKien(tt)) {
        const { cacDiem, banKinh } = veTu(tt, sk)
        const { khoang, cap } = khoangGanNhat(cacDiem)
        expect(
          khoang,
          `quân số ${n} phút ${sk.phut} (${sk.loai}): ${khoang.toFixed(2)} — ${cap}`,
        ).toBeGreaterThanOrEqual(khoangPhanBiet(banKinh))
      }
    }
  })

  /*
    Vì sao ngưỡng trên dùng được ở mọi quân số: bán kính điểm co theo đúng
    tỉ lệ khung. Mất tính chất này thì ngưỡng "một bán kính" trở thành một
    con số khác nhau ở mỗi quân số và phép đo trên hết nghĩa.
  */
  it('bán kính điểm co theo đúng tỉ lệ khung', () => {
    const goc = veTu(tranMau(11))
    for (const n of QUAN_SO_CHAY_DUOC) {
      const { khung, banKinh } = veTu(tranMau(n))
      const tiLe = khung.rong / goc.khung.rong
      expect(banKinh, `quân số ${n}`).toBeCloseTo(goc.banKinh * tiLe, 10)
    }
  })

  it('mọi điểm đều nằm trong khung sân của quân số đó', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const { khung, cacDiem } = veTu(tranMau(n))
      const leX = (100 - khung.rong) / 2
      const leY = (64 - khung.cao) / 2

      for (const d of cacDiem) {
        const bao = `quân số ${n}, ${d.playerId}: (${d.x}, ${d.y})`
        expect(d.x, bao).toBeGreaterThanOrEqual(leX)
        expect(d.x, bao).toBeLessThanOrEqual(leX + khung.rong)
        expect(d.y, bao).toBeGreaterThanOrEqual(leY)
        expect(d.y, bao).toBeLessThanOrEqual(leY + khung.cao)
      }
    }
  })
})
