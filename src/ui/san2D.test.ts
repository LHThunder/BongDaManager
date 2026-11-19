import { describe, expect, it } from 'vitest'
import cssGoc from '../index.css?raw'
import { tiLeTuongPhan, TUONG_PHAN_TOI_THIEU } from '../domain/colors'
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
import type { DaiSan, VungSan } from '../engine/vung'
import { MS_MOI_PHUT } from '../hooks/useMatch'
import { bienDoTuKhoangGian, lechDaoDong } from './daoDong'
import {
  CAO,
  chieuDaiDuong,
  daiThuMon,
  diemTrenDuong,
  hinhSan,
  type KhungSan,
  khungSan,
  KHUNG_SAN,
  nghiengKhoiTheoBong,
  PHI_THEM_NGUOI_GHI_BAN,
  RONG,
  cacNguoiTrenSan,
  thoiGianChuyen,
  toaDo,
  VONG_GIU_BONG_THEM,
  vungTrenSan,
  type DiemCauThu,
} from './components/San2D'
import {
  cuaSoGiuBong,
  dongThoiGianPhaBong,
  ganNguoiGiuBong,
  nguoiGiuBong,
  viTriBongTrongPha,
  viTriNguoiGiuBong,
  type BuocDaQuyDoi,
  type NguoiTrenSan,
} from './phaBong'

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

function veTu(
  tt: TrangThaiTran,
  suKien: SuKien | null = null,
  nguoiGiuBongHienTai: string | null = null,
) {
  return hinhSan({
    nha: { ben: tt.ben.nha, ten: 'Đội A', mauAo: '#dc2626' },
    khach: { ben: tt.ben.khach, ten: 'Đội B', mauAo: '#2563eb' },
    suKien,
    nguoiGiuBong: nguoiGiuBongHienTai,
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

/**
 * Độ sâu bốn dải tính từ khung thành của **chính đội ấy**, viết lại ở đây để
 * phép kiểm tính được chỗ đứng mong đợi.
 *
 * Cố tình **không** import từ `San2D.tsx`: một phép kiểm dùng chính hằng số của
 * code thì không còn bắt được việc ai đó đổi hằng số ấy.
 */
const TI_LE_DAI_TEST: readonly [number, number, number, number] = [
  0.06, 0.2, 0.44, 0.68,
]

/** Chỗ đứng theo sơ đồ của một dải, theo bảng của đội đang hỏi (T523). */
const TI_LE_TRUNG_LAP_TEST: readonly [number, number, number, number] = [
  0.13, 0.38, 0.62, 0.87,
]

function tiLeTest(dai: number, ben: 'nha' | 'khach' | 'trung-lap'): number {
  if (ben === 'nha') return TI_LE_DAI_TEST[dai] as number
  if (ben === 'khach') return 1 - (TI_LE_DAI_TEST[3 - dai] as number)
  return TI_LE_TRUNG_LAP_TEST[dai] as number
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

describe('hai nhóm di chuyển theo hai nguyên tắc (AC-36.2, AC-36.3, D106, T611)', () => {
  /*
    Đồng đội của người giữ bóng dâng lên phía khung thành đối phương; đối
    phương lùi về vây quanh quả bóng. Cả hai lực cộng vào lớp co khối của D94, và
    **tổng vẫn bị chặn ở một phần mười chiều dài sân** — ngưỡng người dùng chốt ở
    `/clarify` của spec 005 (AC-30.4).
  */
  const khung = khungSan(11)
  const BIEN = khung.rong / 6
  const CAC_DAI = [0, 1, 2, 3]

  function vung(dai: number): VungSan {
    return { id: `d${dai}`, dai, cot: 1 } as unknown as VungSan
  }

  it('tổng mọi lực kéo vẫn trong một phần sáu chiều dài sân (D116)', () => {
    for (const ben of ['nha', 'khach'] as const) {
      for (const dNguoi of CAC_DAI) {
        for (const dBong of CAC_DAI) {
          for (const vaiTro of ['chua-ro', 'dong-doi', 'doi-phuong'] as const) {
            const v = nghiengKhoiTheoBong(
              vung(dNguoi),
              ben,
              vung(dBong),
              khung,
              vaiTro,
            )
            expect(
              Math.abs(v),
              `${ben} dải ${dNguoi}, bóng dải ${dBong}, ${vaiTro}`,
            ).toBeLessThanOrEqual(BIEN + 1e-9)
          }
        }
      }
    }
  })

  it('đồng đội của người giữ bóng dâng về phía khung thành đối phương', () => {
    /*
      Ở những cặp dải xa nhau nhất thì **lớp co khối đã chạm trần một phần
      mười** (AC-30.4), nên lực kéo theo vai trò không thêm được gì — đúng ý của
      cái trần ấy. Vì thế phép kiểm đòi **không bao giờ ngược hướng**, và đếm số
      cặp thật sự dâng thêm để câu "có dâng" không thành một lời nói suông.
    */
    let soCapDangThem = 0
    for (const ben of ['nha', 'khach'] as const) {
      const huong = ben === 'nha' ? 1 : -1
      for (const dNguoi of CAC_DAI) {
        for (const dBong of CAC_DAI) {
          const goc = nghiengKhoiTheoBong(vung(dNguoi), ben, vung(dBong), khung)
          const voiBong = nghiengKhoiTheoBong(
            vung(dNguoi),
            ben,
            vung(dBong),
            khung,
            'dong-doi',
          )
          expect(
            (voiBong - goc) * huong,
            `${ben} dải ${dNguoi}, bóng dải ${dBong}`,
          ).toBeGreaterThanOrEqual(-1e-9)
          if ((voiBong - goc) * huong > 1e-9) soCapDangThem += 1
        }
      }
    }
    expect(soCapDangThem, 'số cặp dải thật sự dâng thêm').toBeGreaterThan(16)
  })

  it('đối phương bị kéo MẠNH HƠN về phía bóng, không bao giờ ngược lại', () => {
    let soCapKeoManhHon = 0
    for (const ben of ['nha', 'khach'] as const) {
      for (const dNguoi of CAC_DAI) {
        for (const dBong of CAC_DAI) {
          const goc = nghiengKhoiTheoBong(vung(dNguoi), ben, vung(dBong), khung)
          const canh = nghiengKhoiTheoBong(
            vung(dNguoi),
            ben,
            vung(dBong),
            khung,
            'doi-phuong',
          )
          expect(
            Math.abs(canh),
            `${ben} dải ${dNguoi}, bóng dải ${dBong}`,
          ).toBeGreaterThanOrEqual(Math.abs(goc) - 1e-9)
          // Cùng chiều với lớp co khối: về phía bóng, không phải ngược lại.
          expect(canh * goc).toBeGreaterThanOrEqual(0)
          if (Math.abs(canh) > Math.abs(goc) + 1e-9) soCapKeoManhHon += 1
        }
      }
    }
    expect(soCapKeoManhHon, 'số cặp dải bị kéo mạnh hơn').toBeGreaterThan(16)
  })

  it('lực kéo theo vai trò TỈ LỆ với lớp co khối, nên nó tắt cùng một lúc', () => {
    /*
      Đây là thứ giữ AC-30.5, và nó phải đúng **bằng cấu trúc**: người **tham gia
      tình huống** được đặt thẳng vào vùng của tình huống và không nhận lực kéo
      nào, nên một lực kéo đều tay sẽ triệt tiêu khoảng lệch tách họ khỏi người
      không tham gia đứng cùng chỗ — hai bản đầu của T510 đã làm hỏng đúng kiểu ấy.

      Không có cặp dải nào cho lớp co khối bằng đúng không — bảng dải của đội và
      bảng trung lập không trùng nhau ở điểm nào (T523) — nên phép kiểm canh thẳng
      **tính tỉ lệ**: lực kéo thêm luôn bằng đúng một phần tư lớp co khối về độ lớn.
      Tỉ lệ thì tự bằng không ở chỗ lớp co khối bằng không.
    */
    let soCapDaDo = 0
    for (const ben of ['nha', 'khach'] as const) {
      for (const dNguoi of CAC_DAI) {
        for (const dBong of CAC_DAI) {
          const goc = nghiengKhoiTheoBong(vung(dNguoi), ben, vung(dBong), khung)
          // Bỏ những cặp đã chạm trần: ở đó phép kẹp che mất tỉ lệ.
          if (Math.abs(goc) > BIEN * 0.74) continue
          soCapDaDo += 1
          for (const vaiTro of ['dong-doi', 'doi-phuong'] as const) {
            const v = nghiengKhoiTheoBong(
              vung(dNguoi),
              ben,
              vung(dBong),
              khung,
              vaiTro,
            )
            expect(
              Math.abs(v - goc),
              `${ben} dải ${dNguoi}, bóng dải ${dBong}, ${vaiTro}`,
            ).toBeCloseTo(Math.abs(goc) / 4, 10)
          }
        }
      }
    }
    expect(soCapDaDo, 'số cặp dải chưa chạm trần').toBeGreaterThan(8)
  })
})

describe('thủ môn không rời dải của mình KỂ CẢ KHI ĐANG CẦM BÓNG (AC-30.7, T622)', () => {
  /*
    **Mắt người dùng bắt được lỗi này khi 1291 phép kiểm đều xanh**: "thủ môn
    số 19 chạy loạn xạ khắp sân". Lý do bộ kiểm không thấy: phép kiểm AC-30.7 của
    T521 canh toạ độ của `hinhSan`, còn T606 kéo người giữ bóng đi theo đường của
    bóng ở **lớp vẽ**, mà bộ kiểm chạy ở `environment: 'node'` không render gì cả.

    Phép kiểm này dựng lại đúng phép tính của lớp vẽ, nên nó nhìn được chỗ mà
    T521 không nhìn tới.
  */
  const NHIP = MS_MOI_PHUT.cham
  const NGUOI = thoiGianChuyen(NHIP)
  const NHANH_GAP = 3
  const CAC_TI_LE = [0, 0.25, 0.5, 0.75, 1]

  it('mọi dòng của 10 mã trận × 7 quân số: thủ môn luôn trong dải của mình', () => {
    let soCuaSoThuMon = 0
    let soLanLeKhiKhongKep = 0
    let xaNhatKhiKhongKep = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        const conTrenSan = (id: string) =>
          cacNguoiTrenSan(tt.ben.nha, true).some((x) => x.playerId === id) ||
          cacNguoiTrenSan(tt.ben.khach, false).some((x) => x.playerId === id)
        let giu: string | null = null
        for (const sk of dongSuKien(tt)) {
          const truoc: string | null = giu
          giu = nguoiGiuBong(sk, truoc, conTrenSan)

          const { cacDiem, cacBuocBong, duongBong, khung } = veTu(tt, sk, giu)
          const buocTho: readonly BuocDaQuyDoi[] =
            cacBuocBong.length > 0
              ? cacBuocBong
              : duongBong.length > 0
                ? duongBong.map((d) => ({ diem: d, loai: 'chuyen' as const }))
                : []
          const diemCuoi = giu
            ? cacDiem.find((d) => d.playerId === giu)
            : undefined
          const choTho = buocTho[buocTho.length - 1]
          const cacBuoc: readonly BuocDaQuyDoi[] =
            diemCuoi && choTho
              ? [
                  ...buocTho.slice(0, -1),
                  { diem: { x: diemCuoi.x, y: diemCuoi.y }, loai: choTho.loai },
                ]
              : buocTho

          const benCamBong = sk.doi
          const cacNguoi: readonly NguoiTrenSan[] = cacDiem.map((d) => ({
            playerId: d.playerId,
            diem: { x: d.x, y: d.y },
            laDongDoi: d.laDoiNha === (benCamBong === 'nha'),
          }))
          /*
            Người mở pha chỉ là người giữ bóng cũ khi anh ta **thuộc đội của
            dòng này** (T622) — đúng phép tính của lớp vẽ.
          */
          const moPhaHopLe =
            truoc != null &&
            cacNguoi.some((x) => x.playerId === truoc && x.laDongDoi)
          const gan = ganNguoiGiuBong({
            cacDoan: dongThoiGianPhaBong({
              batDau: { x: cacDiem[0]?.x ?? 0, y: cacDiem[0]?.y ?? 0 },
              cacBuoc,
              msNhip: NHIP,
              msNguoi: NGUOI,
              nhanhGap: NHANH_GAP,
            }),
            nguoiBatDau: moPhaHopLe ? truoc : null,
            nguoiKetThuc: giu,
            cacNguoi,
          })

          for (const d of cacDiem) {
            if (!d.laThuMon) continue
            const cuaSo = cuaSoGiuBong(gan, d.playerId)
            if (cuaSo == null) continue
            soCuaSoThuMon += 1
            const dai = daiThuMon(d.laDoiNha, khung)
            for (const tiLe of CAC_TI_LE) {
              const tho = viTriNguoiGiuBong({
                cuaSo,
                tiLe,
                viTriBong: (t) => viTriBongTrongPha(gan, t),
                viTriThuong: { x: d.x, y: d.y },
                moc: { x: d.x, y: d.y },
              })
              if (tho.x < dai.tu || tho.x > dai.den) {
                soLanLeKhiKhongKep += 1
                xaNhatKhiKhongKep = Math.max(
                  xaNhatKhiKhongKep,
                  Math.max(dai.tu - tho.x, tho.x - dai.den),
                )
              }
              // Phép kẹp của lớp vẽ — sau nó thì không có ngoại lệ nào.
              const x = Math.min(Math.max(tho.x, dai.tu), dai.den)
              expect(
                x,
                `${ma} quân số ${n} phút ${sk.phut}: thủ môn ${d.playerId} ở ${x.toFixed(2)}`,
              ).toBeGreaterThanOrEqual(dai.tu)
              expect(x).toBeLessThanOrEqual(dai.den)
            }
          }
        }
      }
    }

    console.log(
      `thủ môn cầm bóng ${soCuaSoThuMon} lần — không kẹp thì ra ngoài dải ${soLanLeKhiKhongKep} lần, xa nhất ${xaNhatKhiKhongKep.toFixed(1)} đơn vị`,
    )
    expect(soCuaSoThuMon, 'số cửa sổ cầm bóng của thủ môn').toBeGreaterThan(100)
    /*
      **Con số này là bằng chứng rằng phép kẹp có việc thật để làm.** Nếu nó về 0
      thì hoặc luật giữ bóng đã đổi, hoặc phép kiểm đang canh một thứ không còn
      xảy ra — cả hai đều đáng biết, nên nó được chốt chứ không chỉ ghi chú.
    */
    expect(
      soLanLeKhiKhongKep,
      `không kẹp thì thủ môn ra ngoài dải ${soLanLeKhiKhongKep} lần, xa nhất ${xaNhatKhiKhongKep.toFixed(1)} đơn vị`,
    ).toBeGreaterThan(0)
  })
})

describe('XƯƠNG SỐNG — tại tỉ lệ 1, MỌI điểm vẫn ở đúng mốc (R47, T607)', () => {
  /*
    **Đây là lưới giữ AC-34.3 của spec 006, AC-28.3 của spec 005 và AC-25.2 của
    spec 004 cùng lúc.** T606 cho người giữ bóng rời khỏi chặng của chính anh ta để
    đi theo đường của bóng — đó là lần đầu tiên trong năm spec có một điểm không
    đi theo lớp nội suy. Nếu anh ta không về đúng mốc lúc nhịp hết thì mọi thứ đo
    trên `hinhSan` — không chồng khít, tám hàng xen kẽ, thủ môn trong một phần ba
    sân — đều đo một thứ không còn xuất hiện trên màn hình.

    Phép kiểm dựng lại **đúng chuỗi mà lớp vẽ dựng**, kể cả việc thay điểm cuối
    của đường bóng bằng chỗ đứng của người giữ bóng sau cùng.
  */
  const NHIP = MS_MOI_PHUT.cham
  const NGUOI = thoiGianChuyen(NHIP)
  /*
    Bóng nhanh gấp ba người — viết lại ở đây chứ không import `BONG_NHANH_GAP`:
    một phép kiểm dùng chính hằng số của code thì không còn bắt được việc ai đó
    đổi hằng số ấy.
  */
  const NHANH_GAP = 3

  it('mọi dòng của 10 mã trận × 7 quân số: tỉ lệ 1 trả đúng mốc tới 10 chữ số', () => {
    let soDong = 0
    let soNguoiDanBong = 0
    let soDongCoNguoiCuoi = 0
    let soDongBanThang = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        let giu: string | null = null
        for (const sk of dongSuKien(tt)) {
          const truoc: string | null = giu
          giu = nguoiGiuBong(sk, truoc)
          soDong += 1

          const { cacDiem, cacBuocBong, duongBong, banKinh } = veTu(tt, sk, giu)
          const buocTho: readonly BuocDaQuyDoi[] =
            cacBuocBong.length > 0
              ? cacBuocBong
              : duongBong.length > 0
                ? duongBong.map((d) => ({ diem: d, loai: 'chuyen' as const }))
                : []
          const diemCuoi = giu
            ? cacDiem.find((d) => d.playerId === giu)
            : undefined
          const choTho = buocTho[buocTho.length - 1]
          const buocTheoNguoi: readonly BuocDaQuyDoi[] =
            diemCuoi && choTho
              ? [
                  ...buocTho.slice(0, -1),
                  {
                    diem: { x: diemCuoi.x, y: diemCuoi.y },
                    loai: choTho.loai,
                  },
                ]
              : buocTho
          /*
            Dòng bàn thắng có thêm một bước về chấm giao bóng (T619, D113). Phép
            kiểm này dựng lại **đúng chuỗi mà lớp vẽ dựng**, nên nó phải dựng cả
            bước ấy — nếu không thì nó đang canh một thứ không còn chạy trên màn hình.
          */
          const laBanThang = sk.loai === 'ban-thang'
          const cacBuoc: readonly BuocDaQuyDoi[] =
            laBanThang && buocTheoNguoi.length > 0
              ? [
                  ...buocTheoNguoi,
                  { diem: { x: RONG / 2, y: CAO / 2 }, loai: null },
                ]
              : buocTheoNguoi

          if (laBanThang && buocTheoNguoi.length > 0) {
            soDongBanThang += 1
            /*
              Hai thứ phải cùng đúng: đường **VẼ** kết thúc ở chấm giao bóng, còn
              `duongBong` và `bongTaiMoc` — thứ engine kể và thứ được lưu xuống đĩa —
              **không đổi một phần tử nào**. T619 là một việc của lớp vẽ, không phải
              một việc của trận đấu.
            */
            const chot = cacBuoc[cacBuoc.length - 1] as BuocDaQuyDoi
            expect(chot.diem).toEqual({ x: RONG / 2, y: CAO / 2 })
            expect(duongBong.length, `${ma} phút ${sk.phut}`).toBe(
              sk.duongBong.length,
            )
          }

          const benCamBong = sk.doi
          const cacNguoi: readonly NguoiTrenSan[] = cacDiem.map((d) => ({
            playerId: d.playerId,
            diem: { x: d.x, y: d.y },
            laDongDoi: d.laDoiNha === (benCamBong === 'nha'),
          }))
          const gan = ganNguoiGiuBong({
            cacDoan: dongThoiGianPhaBong({
              batDau: { x: cacDiem[0]?.x ?? 0, y: cacDiem[0]?.y ?? 0 },
              cacBuoc,
              msNhip: NHIP,
              msNguoi: NGUOI,
              nhanhGap: NHANH_GAP,
            }),
            nguoiBatDau: truoc,
            nguoiKetThuc: giu,
            cacNguoi,
          })

          for (const d of cacDiem) {
            const cuaSo = cuaSoGiuBong(gan, d.playerId)
            if (cuaSo == null) continue
            soNguoiDanBong += 1
            const cuoi = viTriNguoiGiuBong({
              cuaSo,
              tiLe: 1,
              viTriBong: (t) => viTriBongTrongPha(gan, t),
              viTriThuong: { x: d.x + 17, y: d.y - 23 },
              moc: { x: d.x, y: d.y },
            })
            expect(
              cuoi.x,
              `${ma} quân số ${n} phút ${sk.phut}: ${d.playerId} lệch x`,
            ).toBeCloseTo(d.x, 10)
            expect(
              cuoi.y,
              `${ma} quân số ${n} phút ${sk.phut}: ${d.playerId} lệch y`,
            ).toBeCloseTo(d.y, 10)
          }

          /*
            Bất biến trên đúng **bằng cấu trúc**, nhưng nếu quả bóng không cũng ở
            đó lúc nhịp hết thì người xem thấy một cú giật ở đúng khung cuối: người
            về mốc của mình trong khi bóng đứng lại chỗ khác. Hai thứ phải trùng.
          */
          if (diemCuoi && cacBuoc.length > 0) {
            soDongCoNguoiCuoi += 1
            const bongCuoi = viTriBongTrongPha(gan, 1)
            expect(
              Math.hypot(bongCuoi.x - diemCuoi.x, bongCuoi.y - diemCuoi.y) /
                banKinh,
              `${ma} quân số ${n} phút ${sk.phut}: bóng không ở chân ${giu} lúc nhịp hết`,
            ).toBeLessThan(1)
          }
        }
      }
    }

    expect(soDong, 'số dòng đã duyệt').toBeGreaterThan(3000)
    expect(soNguoiDanBong, 'số cửa sổ cầm bóng đã đo').toBeGreaterThan(3000)
    expect(soDongCoNguoiCuoi, 'số dòng có người giữ bóng cuối').toBeGreaterThan(2000)
    expect(soDongBanThang, 'số dòng bàn thắng đã đo').toBeGreaterThan(100)
  })
})

describe('vòng nét đứt quanh người giữ bóng (AC-33.1, AC-33.4, T605)', () => {
  /*
    **Một vòng quanh điểm cũng là phì to dấu chân của nó.** Spec 005 mắc đúng
    lỗi "phì to một điểm mà không đặt biên" **hai lần** ở R45, cả hai lần đều vì
    suy biên từ cấu trúc thay vì đo. Nên chỗ này là phép kiểm "điểm không
    chồng khít" của AC-15.2 chạy **LẠI ở trạng thái đang có vòng**, và người giữ
    bóng được suy bằng đúng phép gấp mà lớp vẽ dùng.
  */
  it('bán kính vòng không trùm tâm ai, trên 10 mã trận × 7 quân số', () => {
    let soVong = 0
    let chatNhat = Infinity
    let khongCoDiem = 0
    let soDongCoNguoiGiu = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        /*
          Vị tệ "còn trên sân" dựng từ đúng hàm mà `hinhSan` dùng để dựng điểm
          (D115, T621), nên "còn trên sân" và "có một điểm để đeo vòng" là cùng
          một câu hỏi — đó là lý do con số dưới đây về được **đúng 0**.
        */
        const conTrenSan = (id: string) =>
          cacNguoiTrenSan(tt.ben.nha, true).some((x) => x.playerId === id) ||
          cacNguoiTrenSan(tt.ben.khach, false).some((x) => x.playerId === id)
        let giu: string | null = null
        for (const sk of dongSuKien(tt)) {
          giu = nguoiGiuBong(sk, giu, conTrenSan)
          if (giu == null) continue
          soDongCoNguoiGiu += 1

          const { cacDiem, khung, banKinh } = veTu(tt, sk, giu)
          const nguoi = cacDiem.find((d) => d.playerId === giu)
          if (nguoi == null) {
            /*
              Người giữ bóng có thể **không còn điểm nào trên sân**: thẻ đỏ,
              hay bị thay ra ngay sau pha bóng của anh ta. Lúc ấy lớp vẽ không
              vẽ vòng nào và bóng giữ đúng chỗ của dòng — đếm để biết nó
              xảy ra bao nhiêu, chứ không để nó thành một `undefined` đi xa.
            */
            khongCoDiem += 1
            continue
          }
          soVong += 1

          const tiLe = khung.rong / RONG
          const banKinhVong = banKinh + VONG_GIU_BONG_THEM * tiLe
          for (const d of cacDiem) {
            if (d.playerId === giu) continue
            const khoang = Math.hypot(d.x - nguoi.x, d.y - nguoi.y)
            chatNhat = Math.min(chatNhat, khoang / banKinh)
            expect(
              khoang,
              `${ma} quân số ${n} phút ${sk.phut}: ${giu} ↔ ${d.playerId} cách ${khoang.toFixed(2)}, bán kính vòng ${banKinhVong.toFixed(2)}`,
            ).toBeGreaterThanOrEqual(banKinhVong)
          }
        }
      }
    }

    // Lượng mẫu phải đủ dày để câu "trên 10 mã trận" có nghĩa.
    expect(soVong, 'số vòng đã đo').toBeGreaterThan(1000)
    /*
      Sàn đo được quanh người giữ bóng là **1,3108 bán kính**. Nó đã tụt hai
      lần: 1,5468 → 1,4923 khi T611 thêm lực kéo theo vai trò, rồi → 1,3108 khi T624
      nới trần nghiêng khối lên một phần sáu — đúng điều R48 báo trước, không phải 1,80
      như bản đầu của phép kiểm này viết — 1,80 là sàn quanh **người ghi bàn**,
      đo ở T514, và lấy nó làm sàn toàn sân là sai. Đo lại trên 5835 dòng: sàn
      của **mọi cặp điểm** cũng đúng 1,5468 — tức cặp chật nhất của cả sân luôn
      có người giữ bóng là một nửa, nên biên quanh anh ta bị ràng thật.

      Vòng đứng ở `1 + 1,2/3,4` = 1,353 bán kính, dưới sàn ấy một khoảng dự.
    */
    expect(chatNhat, 'cặp chật nhất, theo bán kính').toBeGreaterThanOrEqual(1.31)
    /*
      **Đúng 0.** Trước T621 con số này là **2,82%** (148/5246): người giữ bóng
      nhận thẻ đỏ, hoặc bị thay ra sau pha bóng của mình, nên lớp vẽ không vẽ
      vòng nào và quả bóng đứng im — đo được một quãng **2002ms trên 127 mẫu**
      ở lát 49b. D115 cho luật bỏ qua người đã rời sân, nên không còn dòng nào
      chỉ vào một người vắng mặt. **Chốt ở 0 chứ không phải một ngưỡng** — một
      ngưỡng là chỗ để con số bò lên lại mà không ai thấy.
    */
    expect(
      khongCoDiem,
      `người giữ bóng không còn điểm trên sân: ${khongCoDiem}/${soDongCoNguoiGiu}`,
    ).toBe(0)
  })

  it('vòng rộng hơn viền "tham gia tình huống" nhưng không đụng dấu ▲', () => {
    /*
      Ba dấu đứng chồng nhau quanh một điểm, và **phải đọc ra được riêng rẽ**:
      viền liền dày 1,4 nằm ngay trên bán kính điểm, vòng nét đứt ở ngoài, dấu ▲
      ở `banKinh + 1,2`. Vòng phải nằm **giữa** hai thứ đó.
    */
    expect(VONG_GIU_BONG_THEM).toBeGreaterThan(1.4 / 2)
    expect(VONG_GIU_BONG_THEM).toBeLessThanOrEqual(1.2)
  })

  it('màu vòng đạt 4,5:1 trên mặt cỏ, ở cả hai chế độ màu (P9)', () => {
    /*
      Đọc THẮNG `src/index.css` chứ không chép màu vào đây, đúng cách
      `theme.test.ts` làm: chép lại thì sửa màu một chỗ mà phép kiểm vẫn xanh.
      Bảng mặt cỏ giống nhau ở cả hai chế độ — sân vẫn xanh trong một căn
      phòng tối — nên đo một lần là đo cả hai.
    */
    const doc = (ten: string) => {
      const m = new RegExp(`--${ten}:\\s*([^;]+);`).exec(cssGoc)
      expect(m, `thiếu --${ten}`).not.toBeNull()
      return (m as RegExpExecArray)[1].trim()
    }
    for (const nen of ['co-nen', 'co-nen-dam']) {
      expect(
        tiLeTuongPhan(doc('co-chu'), doc(nen)),
        `vòng giữ bóng trên --${nen}`,
      ).toBeGreaterThanOrEqual(TUONG_PHAN_TOI_THIEU)
    }
    expect(cssGoc).not.toMatch(/data-che-do='toi'[\s\S]*?--co-nen-dam/)
  })

  it('mô tả điểm nói ra ai đang giữ bóng — kênh đọc, không chỉ kênh nhìn (P8, P9)', () => {
    /*
      `hinhSan` nhận `moTaDiem` bằng tham số (D68), nên chỗ này dựng một hàm
      mô tả giả để chứng minh cờ `giuBong` **đến được** tới nó — chuỗi thật
      của hai ngôn ngự nằm ở `vi.ts` và `en.ts`, và phép kiểm hình dạng của
      `BanDich` giữ cho chúng không lệch nhau.
    */
    const tt = chayHetTran(tranMau(11, MA_TRAN_CO_DINH[0]))
    const sk = dongSuKien(tt).find((x) => x.cacCauThu.length > 0) as SuKien
    const ai = sk.cacCauThu[0] as string
    const h = hinhSan({
      nha: { ben: tt.ben.nha, ten: 'A', mauAo: '#dc2626' },
      khach: { ben: tt.ben.khach, ten: 'B', mauAo: '#2563eb' },
      suKien: sk,
      nguoiGiuBong: ai,
      tenCauThu: (id) => id,
      soAo: () => 9,
      nhanViTri: (v) => v,
      moTaDiem: (_t, _s, _v, _d, _tg, giuBong) => (giuBong ? 'GIỮ' : ''),
    })
    const coGiu = h.cacDiem.filter((d) => d.moTa === 'GIỮ')
    expect(coGiu.map((d) => d.playerId)).toEqual([ai])
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
    /*
      Sàn đo được **rộng ra sau T523**: trước là đúng `BUOC_GIAN / 2` = 4 đơn vị
      (1,176 bán kính), nay là **1,80 bán kính**, vì bảng dải riêng từng đội xếp
      tám hàng xen kẽ cách đều thay cho hai bảng đè lên nhau rồi đẩy ra. Giữ
      ngưỡng cũ làm sàn cứng — không nới theo số đo mới — để biên phì thêm
      của người ghi bàn vẫn được ràng bởi con số khắt nghiệt hơn.
    */
    expect(chatNhat).toBeGreaterThanOrEqual(4 / 3.4)
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

describe('khối đội hình co về phía bóng (AC-30.4, AC-28.3, T510)', () => {
  const o = (dai: DaiSan): VungSan => ({ id: `giua-${dai}`, dai, cot: 'giua' })
  const CAC_DAI = [0, 1, 2, 3] as const

  it('biên là đúng một phần sáu chiều dài sân, không cặp nào vượt', () => {
    /*
      **Một phần sáu, không còn một phần mười** (D116 của spec 006, 2026-11-19).
      Người dùng chốt một phần mười ở `/clarify` của spec 005 rồi nới lên sau khi
      đọc số đo của lát 51: phần đội hình dâng lên do vai trò chỉ được 0,5–1,2 đơn
      vị vì trần cũ đã bị lớp co khối dùng gần hết. Spec 005 đã đóng nên AC-30.4
      của nó **không sửa ngược**; chỗ này canh con số đang chạy.
    */
    const khung = khungSan(11)
    let lonNhat = 0
    for (const ben of ['nha', 'khach'] as const) {
      for (const nguoi of CAC_DAI) {
        for (const bong of CAC_DAI) {
          const d = Math.abs(nghiengKhoiTheoBong(o(nguoi), ben, o(bong), khung))
          lonNhat = Math.max(lonNhat, d)
          expect(d, `${ben} dải ${nguoi}, bóng ở dải ${bong}`).toBeLessThanOrEqual(
            khung.rong / 6 + 1e-9,
          )
        }
      }
    }
    // Biên phải thật sự đạt tới, không phải một con số trên giấy.
    expect(lonNhat).toBeCloseTo(khung.rong / 6, 6)
  })

  it('người đứng ĐÚNG chỗ bóng không dịch một đơn vị nào', () => {
    const khung = khungSan(11)
    for (const ben of ['nha', 'khach'] as const) {
      for (const dai of CAC_DAI) {
        // Dải mà chỗ đứng của anh ta trùng với chỗ bóng: dịch phải tiến tới 0.
        const d = nghiengKhoiTheoBong(o(dai), ben, o(dai), khung)
        const cach =
          Math.abs(tiLeTest(dai, 'trung-lap') - tiLeTest(dai, ben)) * khung.rong
        /*
          Hệ số này đi theo trần nghiêng khối: `BIEN / 0,81`. Với trần một phần
          sáu thì nó là 0,206, nên `cach / 4` là biên đúng — điều phép kiểm này
          canh vẫn là "dịch **tỉ lệ** với khoảng lệch hai bảng dải", không phải
          một cú dịch tự do.
        */
        expect(Math.abs(d)).toBeLessThanOrEqual(cach / 4 + 1e-9)
      }
    }
  })

  it('mọi dịch đều hướng VÀO phía bóng, nên không ai bị đẩy ra mép cỏ', () => {
    /*
      Bản thứ hai của T510 dịch nguyên `r/10` theo dấu, đẩy người ở dải ngoài
      cùng vào phép kẹp mặt cỏ — mà phép kẹp dồn mọi người bị kẹp về đúng một
      toạ độ: đo ra hai điểm cách nhau 0,00.
    */
    const khung = khungSan(11)
    for (const ben of ['nha', 'khach'] as const) {
      for (const nguoi of CAC_DAI) {
        for (const bong of CAC_DAI) {
          const d = nghiengKhoiTheoBong(o(nguoi), ben, o(bong), khung)
          const veBong =
            (tiLeTest(bong, 'trung-lap') - tiLeTest(nguoi, ben)) * d
          expect(
            veBong,
            `${ben} dải ${nguoi}, bóng ở ${bong}`,
          ).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('người tham gia vẫn đứng ĐÚNG vùng của tình huống (AC-28.3)', () => {
    /*
      Giới hạn mà D94 đặt cho quyền đổi cách tính toạ độ tại mốc: được co cả
      khối, nhưng **không được dịch người tham gia**. Phép kiểm so với toạ độ
      **tính được** của vùng chứ không so các điểm với nhau — AC-28.3 là phát
      biểu về vùng.
    */
    let soTinhHuong = 0
    for (const n of QUAN_SO_CHAY_DUOC) {
      const tt = chayHetTran(tranMau(n, MA_TRAN_CO_DINH[1]))
      for (const sk of dongSuKien(tt)) {
        if (!sk.vung || sk.cacCauThu.length === 0) continue
        const { cacDiem, khung } = veTu(tt, sk)
        const mong = toaDo(vungTrenSan(sk.vung, sk.doi), 0, khung, 'trung-lap')
        /*
          **Thủ môn bị loại khỏi phép kiểm này, và đó là một ngoại lệ đã ghi
          thẳng vào spec mục 3** (AC-28.3 câu "trừ thủ môn", AC-30.7): engine có
          lúc liệt kê thủ môn là người tham gia một tình huống ở xa khung thành,
          mà một thủ môn đứng giữa sân thì làm cả hình mất nghĩa. Không nới
          ngoại lệ này ra cho vị trí nào khác.
        */
        const thamGia = cacDiem.filter(
          (d) => sk.cacCauThu.includes(d.playerId) && !d.laThuMon,
        )
        if (thamGia.length === 0) continue
        soTinhHuong += 1
        for (const d of thamGia) {
          expect(
            d.x,
            `quân số ${n} phút ${sk.phut} (${sk.loai}): ${d.playerId}`,
          ).toBeCloseTo(mong.x, 10)
        }
      }
    }
    expect(soTinhHuong, 'số tình huống đã đo').toBeGreaterThan(100)
  })

  it('co khối không làm hai điểm chồng khít, trên 10 mã trận (AC-30.5)', () => {
    /*
      Phép kiểm AC-15.2 của spec 002 chỉ chạy một mã trận. Lớp này dịch 16 trên
      22 điểm, nên lưới phải dày hơn — và chính nó đã bắt được hai bản sai.
    */
    let chatNhat = Infinity
    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        for (const sk of dongSuKien(tt)) {
          const { cacDiem, banKinh } = veTu(tt, sk)
          const { khoang, cap } = khoangGanNhat(cacDiem)
          chatNhat = Math.min(chatNhat, khoang / banKinh)
          expect(
            khoang,
            `${ma} quân số ${n} phút ${sk.phut} (${sk.loai}): ${khoang.toFixed(2)} — ${cap}`,
          ).toBeGreaterThanOrEqual(khoangPhanBiet(banKinh))
        }
      }
    }
    expect(chatNhat).toBeGreaterThanOrEqual(1)
  })

  it('sơ đồ vẫn nhận ra được: thứ tự dải không đảo dù bóng ở đâu', () => {
    /*
      "4-4-2 vẫn ra 4-4-2" đo được bằng một câu: bốn dải của một đội, sau khi
      co về phía bóng, vẫn nằm đúng thứ tự cũ trên trục dọc. Hệ số co < 1 nên
      điều này đúng bằng cấu trúc; phép kiểm là lưới giữ nó.
    */
    const khung = khungSan(11)
    for (const ben of ['nha', 'khach'] as const) {
      for (const bong of CAC_DAI) {
        const sau = CAC_DAI.map(
          (dai) =>
            tiLeTest(dai, ben) * khung.rong +
            nghiengKhoiTheoBong(o(dai), ben, o(bong), khung),
        )
        for (let i = 1; i < sau.length; i += 1) {
          const buoc = (sau[i] as number) - (sau[i - 1] as number)
          expect(
            buoc,
            `${ben}, bóng ở dải ${bong}, giữa dải ${i - 1} và ${i}`,
          ).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('hàng ngang vẫn ra hàng ngang (AC-30.3, T511)', () => {
  /*
    AC-30.3 đúng ở **ba lớp cộng lại**, không ở một lớp nào: `hinhSan` cho cả
    hàng cùng một toạ độ dọc, co khối áp **đều** cho cả hàng (cùng dải thì cùng
    dịch), còn dao động mới là thứ duy nhất tách họ ra. Nên phép kiểm phải đo
    **tổng** của cả ba, chứ không đo riêng lớp dao động như `daoDong.test.ts`.

    `tasks.md` dặn: nếu phép kiểm này xanh ngay thì đừng tưởng là viết sai — hãy
    thử tăng biên độ lên gấp ba và xem nó có đỏ không. Đó là phép kiểm cuối.
  */
  const KHOANG_GIAN = 8
  const NGUONG = KHOANG_GIAN / 4
  const BIEN_DO = bienDoTuKhoangGian(KHOANG_GIAN)
  const CAC_THOI_DIEM = Array.from({ length: 300 }, (_, i) => i * 0.137)

  const tt = chayHetTran(tranMau(11, MA_TRAN_CO_DINH[1]))

  /** Một hàng thật: những người cùng đội, cùng toạ độ dọc, không tham gia. */
  function motHang(suKien: SuKien | null): readonly DiemCauThu[] {
    const { cacDiem } = veTu(tt, suKien)
    const nhom = new Map<string, DiemCauThu[]>()
    for (const d of cacDiem) {
      if (d.noiBat) continue
      const khoa = `${d.mauNen}|${d.x.toFixed(6)}`
      const danh = nhom.get(khoa) ?? []
      danh.push(d)
      nhom.set(khoa, danh)
    }
    let to: readonly DiemCauThu[] = []
    for (const danh of nhom.values()) if (danh.length > to.length) to = danh
    return to
  }

  function traiRaBaoNhieu(
    hang: readonly DiemCauThu[],
    t: number,
    heSo: number,
  ): number {
    const bien = { doc: BIEN_DO.doc * heSo, ngang: BIEN_DO.ngang * heSo }
    const cacX = hang.map((d) => d.x + lechDaoDong(d.playerId, t, bien).x)
    return Math.max(...cacX) - Math.min(...cacX)
  }

  it('một hàng bốn có thật trên sân, và `hinhSan` cho họ cùng một toạ độ dọc', () => {
    const hang = motHang(null)
    expect(hang.length, 'sơ đồ 11 người phải có một hàng từ ba người').toBeGreaterThanOrEqual(3)
    for (const d of hang) expect(d.x).toBeCloseTo(hang[0]?.x ?? 0, 10)
  })

  it('qua hàng trăm thời điểm trận, hàng lệch dưới một phần tư khoảng giãn', () => {
    const hang = motHang(null)
    for (const t of CAC_THOI_DIEM) {
      expect(traiRaBaoNhieu(hang, t, 1), `t=${t}`).toBeLessThan(NGUONG)
    }
  })

  it('cả khi đang có tình huống, tức co khối đang áp', () => {
    const cac = dongSuKien(tt).filter(
      (sk) => sk.vung && sk.cacCauThu.length > 0,
    )
    expect(cac.length).toBeGreaterThan(10)
    for (const sk of cac.slice(0, 40)) {
      const hang = motHang(sk)
      if (hang.length < 3) continue
      for (const d of hang) expect(d.x).toBeCloseTo(hang[0]?.x ?? 0, 10)
      for (const t of CAC_THOI_DIEM.slice(0, 40)) {
        expect(
          traiRaBaoNhieu(hang, t, 1),
          `phút ${sk.phut} (${sk.loai}) t=${t}`,
        ).toBeLessThan(NGUONG)
      }
    }
  })

  it('phép kiểm này CÓ RĂNG: biên độ gấp ba thì hàng tan', () => {
    const hang = motHang(null)
    const vuot = CAC_THOI_DIEM.filter(
      (t) => traiRaBaoNhieu(hang, t, 3) >= NGUONG,
    )
    expect(
      vuot.length,
      'biên độ gấp ba phải phá ngưỡng ở rất nhiều thời điểm',
    ).toBeGreaterThan(CAC_THOI_DIEM.length / 4)
  })
})

describe('thủ môn ở lại một phần ba sân của mình (AC-30.7, T521)', () => {
  /*
    Phép kiểm này sinh ra từ **mắt người dùng**, không từ một lập luận: xem thật
    một trận ở T518 rồi nói "thủ môn di chuyển lên quá cao". Đo lại thì đúng: thủ
    môn đội khách chạy từ `x = 54,5` tới `85,2` trong một trận.
  */
  it('mọi dòng của 10 mã trận × 7 quân số: thủ môn không rời một phần ba sân nhà', () => {
    let soThuMon = 0
    for (const ma of MA_TRAN_CO_DINH) {
      for (const n of QUAN_SO_CHAY_DUOC) {
        const tt = chayHetTran(tranMau(n, ma))
        for (const sk of [null, ...dongSuKien(tt)]) {
          const { cacDiem, khung } = veTu(tt, sk)
          const tm = cacDiem.filter((d) => d.laThuMon)
          expect(tm.length, `${ma} quân số ${n}`).toBeLessThanOrEqual(2)
          for (const d of tm) {
            soThuMon += 1
            // Đội nhà ở nửa trái của khung, đội khách ở nửa phải.
            const laNha = d.x < khung.rong / 2
            const dai = daiThuMon(laNha, khung)
            expect(
              d.x,
              `${ma} quân số ${n} phút ${sk?.phut ?? 0}: ${d.playerId} ở x=${d.x.toFixed(1)}, dải [${dai.tu.toFixed(1)}; ${dai.den.toFixed(1)}]`,
            ).toBeGreaterThanOrEqual(dai.tu)
            expect(d.x).toBeLessThanOrEqual(dai.den)
          }
        }
      }
    }
    expect(soThuMon, 'số lượt thủ môn đã đo').toBeGreaterThan(1000)
  })

  it('thủ môn KHÔNG bị kéo tới vùng của tình huống, dù được liệt kê là người tham gia', () => {
    const tt = chayHetTran(tranMau(11, MA_TRAN_CO_DINH[0]))
    const dung = new Map(veTu(tt, null).cacDiem.map((d) => [d.playerId, d.x]))
    let soLan = 0
    for (const sk of dongSuKien(tt)) {
      const { cacDiem } = veTu(tt, sk)
      for (const d of cacDiem) {
        if (!d.laThuMon || !sk.cacCauThu.includes(d.playerId)) continue
        soLan += 1
        expect(
          d.x,
          `phút ${sk.phut} (${sk.loai}): ${d.playerId} là người tham gia`,
        ).toBeCloseTo(dung.get(d.playerId) ?? -1, 10)
      }
    }
    // Nếu con số này về 0 thì phép kiểm trên không còn chứng minh gì.
    expect(soLan, 'số lần thủ môn được liệt kê là người tham gia').toBeGreaterThan(5)
  })

  it('thủ môn KHÔNG co theo khối: bóng ở đâu cũng đứng một chỗ', () => {
    const tt = chayHetTran(tranMau(11, MA_TRAN_CO_DINH[1]))
    const dung = new Map(veTu(tt, null).cacDiem.map((d) => [d.playerId, d.x]))
    const cac = dongSuKien(tt).filter((sk) => sk.vung)
    expect(cac.length).toBeGreaterThan(10)
    for (const sk of cac) {
      for (const d of veTu(tt, sk).cacDiem) {
        if (!d.laThuMon || sk.cacCauThu.includes(d.playerId)) continue
        expect(d.x, `phút ${sk.phut} (${sk.loai})`).toBeCloseTo(
          dung.get(d.playerId) ?? -1,
          10,
        )
      }
    }
  })
})

describe('bốn hàng của hai đội xen kẽ đúng thứ tự bóng đá (AC-30.8, T523)', () => {
  /*
    Phép kiểm này sinh ra từ mắt người dùng ở T518: "tại sao hậu vệ lại luôn
    đứng trên tiền đạo đối phương". Đo lại thì đúng, và đó là lỗi **bố cục có
    từ spec 001**: hậu vệ đội nhà ở `x = 28`, tiền đạo đội khách ở `x = 13` — tiền
    đạo nằm sau lưng hàng thủ, trong vòng 5m50, suốt trận. Lý do: lưới vùng lật
    theo **chỉ số dải**, nên dải tấn công của đội này lật thành đúng dải thủ môn
    của đội kia.
  */
  const o = (dai: DaiSan): VungSan => ({ id: `giua-${dai}`, dai, cot: 'giua' })
  const CAC_DO_CAO = [-3, 0, 3] as const

  /** Tám hàng, theo đúng thứ tự một trận thật phải có. */
  function tamHang(hNha: number, hKhach: number, khung: KhungSan) {
    const tiLe = khung.rong / RONG
    const x = (dai: DaiSan, ben: 'nha' | 'khach') =>
      toaDo(o(dai), (ben === 'nha' ? hNha : -hKhach) * tiLe, khung, ben).x
    return [
      { ten: 'TM nhà', x: x(0, 'nha') },
      { ten: 'HV nhà', x: x(1, 'nha') },
      { ten: 'TĐ khách', x: x(0, 'khach') },
      { ten: 'TV nhà', x: x(2, 'nha') },
      { ten: 'TV khách', x: x(1, 'khach') },
      { ten: 'TĐ nhà', x: x(3, 'nha') },
      { ten: 'HV khách', x: x(2, 'khach') },
      { ten: 'TM khách', x: x(3, 'khach') },
    ]
  }

  it('thứ tự dọc sân đúng ở cả chín tổ hợp độ cao đội hình', () => {
    const khung = khungSan(11)
    let gapNhoNhat = Infinity
    for (const hN of CAC_DO_CAO) {
      for (const hK of CAC_DO_CAO) {
        const hang = tamHang(hN, hK, khung)
        for (let i = 1; i < hang.length; i += 1) {
          const buoc = (hang[i]?.x ?? 0) - (hang[i - 1]?.x ?? 0)
          gapNhoNhat = Math.min(gapNhoNhat, buoc)
          expect(
            buoc,
            `nhà ${hN} / khách ${hK}: ${hang[i - 1]?.ten}@${hang[i - 1]?.x.toFixed(1)} → ${hang[i]?.ten}@${hang[i]?.x.toFixed(1)}`,
          ).toBeGreaterThan(0)
        }
      }
    }
    // Hai hàng kề nhau không được sát tới mức nhìn ra một hàng.
    expect(gapNhoNhat).toBeGreaterThanOrEqual(5)
  })

  it('hậu vệ đứng GIỮA tiền đạo đối phương và khung thành của mình', () => {
    const khung = khungSan(11)
    for (const hN of CAC_DO_CAO) {
      for (const hK of CAC_DO_CAO) {
        const h = new Map(tamHang(hN, hK, khung).map((x) => [x.ten, x.x]))
        const tmNha = h.get('TM nhà') as number
        const hvNha = h.get('HV nhà') as number
        const tdKhach = h.get('TĐ khách') as number
        expect(hvNha, `nhà ${hN} / khách ${hK}`).toBeGreaterThan(tmNha)
        expect(hvNha).toBeLessThan(tdKhach)

        const tmKhach = h.get('TM khách') as number
        const hvKhach = h.get('HV khách') as number
        const tdNha = h.get('TĐ nhà') as number
        expect(hvKhach).toBeLessThan(tmKhach)
        expect(hvKhach).toBeGreaterThan(tdNha)
      }
    }
  })

  it('chỗ của bóng nằm GIỮA hai hàng, không đè lên hàng nào', () => {
    const khung = khungSan(11)
    const hang = tamHang(0, 0, khung).map((x) => x.x)
    for (const dai of [0, 1, 2, 3] as const) {
      const bong = toaDo(o(dai), 0, khung, 'trung-lap').x
      const gan = Math.min(...hang.map((x) => Math.abs(x - bong)))
      expect(gan, `bóng ở dải ${dai}`).toBeGreaterThanOrEqual(5)
    }
  })
})

describe('bóng đi HẾT đường chuyền của nó (AC-30.9, T524)', () => {
  /*
    Trước T524 bóng chỉ đi **một đoạn thẳng** từ chỗ cũ tới điểm cuối của pha
    bóng, bỏ qua mọi vùng nó đi qua — nên một pha ba nhịp chỉ còn là một cú băng
    chéo sân, và phải vẽ thêm một đường kẻ vàng cho người xem đoán ra nó đã đi
    đường nào.
  */
  const duong = [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
    { x: 30, y: 40 },
  ]

  it('tỉ lệ 0 và 1 trả đúng hai đầu đường', () => {
    expect(diemTrenDuong(duong, 0)).toEqual(duong[0])
    expect(diemTrenDuong(duong, 1)).toEqual(duong[2])
    expect(diemTrenDuong(duong, -5)).toEqual(duong[0])
    expect(diemTrenDuong(duong, 9)).toEqual(duong[2])
  })

  it('đi qua TẪT CẢ các vùng, không cắt góc', () => {
    // Đúng giữa đường (30 + 40 = 70, nửa là 35) thì bóng đã qua khúc cua.
    const giua = diemTrenDuong(duong, 35 / 70)
    expect(giua.x).toBeCloseTo(30, 10)
    expect(giua.y).toBeCloseTo(5, 10)
    // Một đoạn thẳng nối hai đầu sẽ cho (15; 20) — cách điểm trên rất xa.
    expect(Math.hypot(giua.x - 15, giua.y - 20)).toBeGreaterThan(15)
  })

  it('đi ĐỀU một tốc độ: quãng đi được tỉ lệ với thời gian', () => {
    const tong = chieuDaiDuong(duong)
    expect(tong).toBeCloseTo(70, 10)
    let truoc = diemTrenDuong(duong, 0)
    let daDi = 0
    for (let i = 1; i <= 70; i += 1) {
      const nay = diemTrenDuong(duong, i / 70)
      const buoc = Math.hypot(nay.x - truoc.x, nay.y - truoc.y)
      // Mỗi bước 1/70 chiều dài phải đúng 1 đơn vị, kể cả bước đi qua khúc cua.
      expect(buoc, `bước ${i}`).toBeCloseTo(1, 9)
      daDi += buoc
      truoc = nay
    }
    expect(daDi).toBeCloseTo(tong, 8)
  })

  it('đầu vào vô lý không làm nó ném hay trả NaN', () => {
    expect(diemTrenDuong([], 0.5)).toEqual({ x: RONG / 2, y: CAO / 2 })
    expect(diemTrenDuong([{ x: 7, y: 9 }], 0.5)).toEqual({ x: 7, y: 9 })
    const motCho = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]
    expect(diemTrenDuong(motCho, 0.3)).toEqual({ x: 5, y: 5 })
    const p = diemTrenDuong(duong, Number.NaN)
    expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true)
    expect(chieuDaiDuong([])).toBe(0)
  })

  it('đường của một pha bóng thật có nhiều hơn một đoạn', () => {
    /*
      Nếu mọi pha bóng của engine chỉ có một đoạn thì cả T524 không chứng minh
      được gì — phép kiểm này giữ cho điều đó không âm thầm thành thật.
    */
    const tt = chayHetTran(tranMau(11, MA_TRAN_CO_DINH[0]))
    let nhieuDoan = 0
    let daiNhat = 0
    for (const sk of dongSuKien(tt)) {
      const h = veTu(tt, sk)
      if (h.duongBong.length > 2) nhieuDoan += 1
      daiNhat = Math.max(daiNhat, h.duongBong.length)
    }
    expect(nhieuDoan, `dài nhất ${daiNhat} điểm`).toBeGreaterThan(5)
  })
})
