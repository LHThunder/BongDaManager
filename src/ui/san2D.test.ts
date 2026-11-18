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
import { MS_MOI_PHUT } from '../hooks/useMatch'
import {
  CAO,
  hinhSan,
  khungSan,
  KHUNG_SAN,
  PHI_THEM_NGUOI_GHI_BAN,
  RONG,
  thoiGianChuyen,
  type DiemCauThu,
} from './components/San2D'

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
    nhanViTri: (v) => v,
    /*
      Test gọi thẳng `hinhSan`, nên nó không dựng sẵn ngôn ngữ nào: mô tả
      điểm là chuỗi cho trình đọc màn hình, không phép kiểm nào ở đây soi
      tới nó (D68).
    */
    moTaDiem: () => '',
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

/*
  Nhịp di chuyển của điểm trên sân.

  Sân 2D không có vòng lặp animation (quyết định D41): mỗi điểm là một `<g>`
  đổi `transform`, và CSS lo phần đi từ chỗ cũ sang chỗ mới. Nghĩa là thời
  gian transition phải NGẮN HƠN khoảng cách giữa hai lần đổi chỗ — nếu không,
  điểm bị giật sang đích mới khi còn đang bay dở, và người xem thấy một mớ
  hỗn loạn chứ không thấy đường đi.

  Bản đầu đặt cứng 280ms, dài hơn nhịp đồng hồ ở cả ba mức tốc độ. Lỗi chìm ở
  sân 11 vì mỗi tình huống chỉ kéo ~17% đội hình; sân 5 kéo 37% nên nó lộ ra.
*/
describe('nhịp di chuyển của điểm trên sân', () => {
  it('ở mọi mức tốc độ, cú chuyển chỗ kết thúc trước nhịp đồng hồ kế tiếp', () => {
    for (const [muc, ms] of Object.entries(MS_MOI_PHUT)) {
      expect(
        thoiGianChuyen(ms),
        `mức ${muc}: ${ms}ms một phút trận`,
      ).toBeLessThanOrEqual(ms)
    }
  })

  it('mức Chậm cho 900ms, Thường 180ms, Nhanh 63ms', () => {
    expect(thoiGianChuyen(1000)).toBe(900)
    expect(thoiGianChuyen(200)).toBe(180)
    expect(thoiGianChuyen(70)).toBe(63)
  })

  /*
    Mức Rất nhanh thôi nội suy hẳn (AC-29.4, D97): 18ms không đủ cho mắt đọc một
    chuyển động nào, nên vẽ đường đi chỉ sinh ra cú giật. **Số 0 ở đây là một
    quyết định, không phải một giá trị biên bị bỏ quên** — `San2D` đọc
    `msChuyen <= 0` là "vẽ một lần, không nội suy", và đó là đường đã có sẵn từ
    trước. Đừng "dọn" nhánh ấy đi vì tưởng nó là code chết.
  */
  it('mức Rất nhanh trả 0 — thôi nội suy', () => {
    expect(thoiGianChuyen(20)).toBe(0)
    expect(thoiGianChuyen(39)).toBe(0)
    expect(thoiGianChuyen(40)).toBe(36)
  })

  /*
    Trần cứng 280ms đã bỏ (T501, D91): công thức theo tỉ lệ không bao giờ vượt
    nhịp, nên lý do tồn tại của trần đã hết. Giữ trần thì ở nhịp 1000ms điểm
    đi 280ms rồi đứng im 720ms — chậm hơn nhưng giật hơn.
  */
  it('đồng hồ càng chậm thì cú di chuyển càng dài, không bị trần cắt', () => {
    expect(thoiGianChuyen(400)).toBe(360)
    expect(thoiGianChuyen(10_000)).toBe(9000)
    expect(thoiGianChuyen(2000)).toBeGreaterThan(thoiGianChuyen(1000))
  })

  it('không bao giờ trả về số âm hay số lẻ', () => {
    for (const ms of [0, 1, 7, 20, 70, 200, 999]) {
      const t = thoiGianChuyen(ms)
      expect(t, `${ms}ms`).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(t), `${ms}ms -> ${t}`).toBe(true)
    }
  })
})

describe('quả bóng luôn có mặt (AC-32.1 → AC-32.3, T513)', () => {
  const tt = tranMau(11)
  const cacSuKien = dongSuKien(chayHetTran(tt))

  function suKienLoai(loai: SuKien['loai']): SuKien | undefined {
    return cacSuKien.find((sk) => sk.loai === loai)
  }

  it('dòng có đường bóng: bóng ở cuối đường đó', () => {
    const sk = cacSuKien.find((x) => x.duongBong.length > 0)
    expect(sk, 'trận nào cũng phải có một pha bóng').toBeDefined()
    const h = veTu(tt, sk as SuKien)
    const cuoi = h.duongBong[h.duongBong.length - 1]
    expect(h.bongTaiMoc).toEqual(cuoi)
  })

  it('khai cuộc và hết hiệp: bóng ở điểm giao bóng giữa sân (AC-32.2)', () => {
    for (const loai of ['bat-dau', 'het-hiep'] as const) {
      const sk = suKienLoai(loai)
      if (!sk) continue
      const h = veTu(tt, { ...sk, duongBong: [], vung: null })
      expect(h.bongTaiMoc, loai).toEqual({ x: RONG / 2, y: CAO / 2 })
    }
  })

  it('thay người và kiệt sức: KHÔNG nói gì về bóng, để nó giữ chỗ cũ (AC-32.3)', () => {
    /*
      Đây là gốc của cả T513: trước đó những dòng này làm quả bóng **biến
      mất** khỏi sân, và riêng "kiệt sức" là năm dòng một trận. `null` ở đây là
      một câu trả lời có nghĩa — "giữ chỗ cũ" — chứ không phải một giá trị
      thiếu.
    */
    const mau = suKienLoai('bat-dau') as SuKien
    for (const loai of ['thay-nguoi', 'kiet-suc'] as const) {
      const h = veTu(tt, { ...mau, loai, duongBong: [], vung: null })
      expect(h.bongTaiMoc, loai).toBeNull()
    }
  })

  it('trước giờ bóng lăn, chưa có dòng nào: cũng không nói gì', () => {
    expect(veTu(tt, null).bongTaiMoc).toBeNull()
  })
})

describe('điểm người ghi bàn phóng to vẫn đếm được (AC-32.4, R45, T514)', () => {
  /*
    Đây là phép kiểm "điểm không chồng khít" của AC-15.2 chạy LẠI ở trạng
    thái đang có hiệu ứng — cùng một ngưỡng ("tâm người kia không được nằm
    trong lòng điểm này"), nhưng đo bằng bán kính ĐÃ PHÓNG TO.

    Phép kiểm cũ của spec 002 không bắt được R45: hiệu ứng không dịch tâm
    điểm nào, nên nó vẫn xanh y nguyên dù điểm người ghi bàn có phì to gấp đôi.
    Và cả hai lần tôi chọn biên này bằng cách suy từ cấu trúc đều sai, nên
    ngưỡng ở đây đo trên **mọi bàn thắng của 10 mã trận × 7 quân số** chứ
    không tin một lập luận nào.
  */
  it('bán kính đã phóng to vẫn không trùm tâm ai, ở mọi bàn thắng', () => {
    let soBan = 0
    let chatNhat = Infinity
    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        for (const sk of dongSuKien(tt)) {
          if (sk.loai !== 'ban-thang') continue
          const ghi = sk.cacCauThu[0]
          if (ghi == null) continue
          const { cacDiem, khung, banKinh } = veTu(tt, sk)
          const nguoi = cacDiem.find((d) => d.playerId === ghi)
          if (nguoi == null) continue
          soBan += 1

          const tiLe = khung.rong / RONG
          const phongTo = banKinh + PHI_THEM_NGUOI_GHI_BAN * tiLe
          for (const d of cacDiem) {
            if (d.playerId === ghi) continue
            const khoang = Math.hypot(d.x - nguoi.x, d.y - nguoi.y)
            chatNhat = Math.min(chatNhat, khoang / banKinh)
            expect(
              khoang,
              `${ma} quân số ${n} phút ${sk.phut}: ${ghi} ↔ ${d.playerId} cách ${khoang.toFixed(2)}, bán kính phóng to ${phongTo.toFixed(2)}`,
            ).toBeGreaterThanOrEqual(phongTo)
          }
        }
      }
    }
    // Lưỡng mẫu phải đủ dày để câu "ở mọi bàn thắng" có nghĩa.
    expect(soBan, 'số bàn thắng đã đo').toBeGreaterThan(100)
    // Sàn đo được là đúng `BUOC_GIAN / 2` = 4 đơn vị, tức 1,176 bán kính.
    expect(chatNhat).toBeCloseTo(4 / 3.4, 3)
  })

  it('biên phì thêm không được lớn hơn chỗ trống mà sàn đo được cho phép', () => {
    /*
      Phát biểu lại cùng một điều bằng số học thuần, để ai định nới hằng số
      ấy lên thì đỏ ngay ở đây, không phải đợi vòng 70 trận ở trên.
    */
    const { banKinh, khung } = veTu(tranMau(11))
    const tiLe = khung.rong / RONG
expect(banKinh + PHI_THEM_NGUOI_GHI_BAN * tiLe).toBeLessThan(
      (4 / 3.4) * banKinh,
    )
    expect(PHI_THEM_NGUOI_GHI_BAN).toBeGreaterThan(0)
  })
})
