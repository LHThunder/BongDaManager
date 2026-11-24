import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import { TOC_QUAY_NHANH } from '../engine/lienTuc/coHoc'
import { docMoc, type ThucTheTaiMoc } from '../engine/lienTuc/loMoc'
import {
  buocPhutLienTuc,
  taoTranLienTuc,
} from '../engine/lienTuc/tranLienTuc'
import { metTuDonVi, toaDoTuMet, type KhungAnh } from './quyDoiMet'
import {
  viTriVe,
  viTriVeCoDien,
  viTriVeLienTuc,
  type AnhChupMet,
  type GioiHanVe,
  type LopViTri,
} from './viTriVe'

/*
  Chỗ hợp vị trí vẽ (T714, AC-37.6 và AC-45.9).

  File này tồn tại vì một lý do cụ thể: trước T714, phép hợp ấy là một hàm **bên
  trong** `San2D.tsx`, đóng kín trên trạng thái component, nên không một phép
  kiểm nào gọi tới được. Bộ kiểm chạy ở `environment: 'node'`, và chính khoảng
  mù ấy đã để lọt lỗi "thủ môn chạy tới giữa sân" suốt một lát cắt — 1.291 phép
  kiểm xanh trong khi mắt người dùng bắt được ngay.
*/

const KHUNG: KhungAnh = { rong: 100, cao: 64, le: 2.6 }

const GIOI_HAN: GioiHanVe = { xTu: 2.6, xDen: 97.4, yTu: 2.6, yDen: 61.4 }

function thucThe(x: number, y: number, coMat = 1): ThucTheTaiMoc {
  return { x, y, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat }
}

/** Ảnh chụp một mốc: hai người, ô 0 và ô 1. */
function anhChupMau(coMat = 1): AnhChupMet {
  return {
    thucThe: [thucThe(10, 20), thucThe(90, 50, coMat)],
    oCuaNguoi: new Map([
      ['a', 0],
      ['b', 1],
    ]),
    nguoiGiuBong: 0,
  }
}

/** Mọi lớp cổ điển đều KHÁC nhau, để biết hàm hợp lấy cái nào. */
const LOP_DAY_DU: LopViTri = {
  moc: { x: 10, y: 10 },
  sauNoiSuy: { x: 20, y: 20 },
  sauBamBong: { x: 30, y: 30 },
  daiThuMon: null,
  lechDao: { x: 1, y: -1 },
}

describe('chế độ liên tục: toạ độ TRÙNG KHÍT mốc engine phát (T714)', () => {
  it('trả về đúng phép quy đổi mét, không hơn không kém', () => {
    const anh = anhChupMau()
    const mong = toaDoTuMet(KHUNG, 10, 20)
    expect(viTriVeLienTuc(anh, 'a', KHUNG)).toEqual(mong)
  })

  /*
    ⚠️ CA XƯƠNG SỐNG của T714, và nó là một phép TRỪ chứ không phải phép cộng.

    Bảy lớp sinh vị trí của chế độ cổ điển đều phải TẮT. Ba trong số đó — nội
    suy Hermite, hệ số theo độ mệt, hệ số rơi-đứng-yên — **biến dạng thời gian**
    trên đường đi, nên nếu còn chạy thì `(x′ − x)/dt` không còn bằng vận tốc
    engine nói, và AC-38.1 đo trên hình sẽ lệch khỏi AC-38.1 đo trong engine.
    Hai con số ấy phải là MỘT.

    Phép kiểm bơm vào đủ cả: một vị trí nội suy khác hẳn, một vị trí bám bóng
    khác nữa, một dải thủ môn chật, và một lệch dao động khác không. Kết quả
    phải không mang dấu vết nào của chúng.
  */
  it('MỌI lớp của chế độ cổ điển đều bị tắt, kể cả dao động và dải thủ môn', () => {
    const anh = anhChupMau()
    const ra = viTriVe(
      {
        moc: { x: 1, y: 1 },
        sauNoiSuy: { x: 2, y: 2 },
        sauBamBong: { x: 3, y: 3 },
        daiThuMon: { tu: 0, den: 5 },
        lechDao: { x: 7, y: 7 },
      },
      GIOI_HAN,
      false,
      anh,
      'a',
      KHUNG,
    )
    expect(ra).toEqual(toaDoTuMet(KHUNG, 10, 20))
  })

  it('và quy đổi NGƯỢC lại ra đúng số mét engine đã phát', () => {
    const anh = anhChupMau()
    const ve = viTriVeLienTuc(anh, 'b', KHUNG)
    expect(ve).not.toBeNull()
    if (!ve) return
    // x đi thẳng, y bị LẬT — quy đổi ngược phải trả đúng cặp mét ban đầu.
    const goc = toaDoTuMet(KHUNG, 90, 50)
    expect(metTuDonVi(KHUNG, ve.x - goc.x)).toBeCloseTo(0, 10)
    expect(metTuDonVi(KHUNG, ve.y - goc.y)).toBeCloseTo(0, 10)
  })

  it('ô KHÔNG CÓ MẶT thì rơi về đường cổ điển, không vẽ sai chỗ', () => {
    const anh = anhChupMau(0)
    expect(viTriVeLienTuc(anh, 'b', KHUNG)).toBeNull()
    expect(viTriVe(LOP_DAY_DU, GIOI_HAN, false, anh, 'b', KHUNG)).toEqual(
      viTriVeCoDien(LOP_DAY_DU, GIOI_HAN, false),
    )
  })

  it('người KHÔNG CÓ trong bảng ô cũng rơi về đường cổ điển', () => {
    const anh = anhChupMau()
    expect(viTriVeLienTuc(anh, 'khong-co-ai', KHUNG)).toBeNull()
    expect(
      viTriVe(LOP_DAY_DU, GIOI_HAN, false, anh, 'khong-co-ai', KHUNG),
    ).toEqual(viTriVeCoDien(LOP_DAY_DU, GIOI_HAN, false))
  })
})

describe('chế độ cổ điển: thứ tự hợp các lớp (T714)', () => {
  it('giảm chuyển động thì về THẲNG toạ độ mốc — không nội suy, không dao động', () => {
    expect(viTriVeCoDien(LOP_DAY_DU, GIOI_HAN, true)).toEqual(LOP_DAY_DU.moc)
  })

  it('không có chuyển tiếp thì lấy mốc; có thì lấy vị trí nội suy', () => {
    const khongNoiSuy = { ...LOP_DAY_DU, sauNoiSuy: null, sauBamBong: null, lechDao: { x: 0, y: 0 } }
    expect(viTriVeCoDien(khongNoiSuy, GIOI_HAN, false)).toEqual({ x: 10, y: 10 })

    const coNoiSuy = { ...khongNoiSuy, sauNoiSuy: { x: 20, y: 20 } }
    expect(viTriVeCoDien(coNoiSuy, GIOI_HAN, false)).toEqual({ x: 20, y: 20 })
  })

  it('lớp bám bóng ĐÈ lên lớp nội suy khi người ấy đang giữ bóng', () => {
    const lop = { ...LOP_DAY_DU, lechDao: { x: 0, y: 0 } }
    expect(viTriVeCoDien(lop, GIOI_HAN, false)).toEqual({ x: 30, y: 30 })
  })

  /*
    ⚠️ Kẹp dải thủ môn phải nằm SAU lớp bám bóng, không phải trước.

    Chính lớp bám bóng là thứ từng kéo thủ môn ra giữa sân (T622): kẹp trước nó
    thì kẹp xong lại bị kéo đi, và phép kiểm vẫn xanh vì nó đo đầu vào chứ
    không đo đầu ra. Ca này bơm một vị trí bám bóng NẰM NGOÀI dải để phân biệt
    hai thứ tự ấy.
  */
  it('kẹp dải thủ môn SAU lớp bám bóng', () => {
    const lop: LopViTri = {
      moc: { x: 8, y: 30 },
      sauNoiSuy: { x: 9, y: 30 },
      // Lớp bám bóng kéo thủ môn ra tận giữa sân.
      sauBamBong: { x: 50, y: 30 },
      daiThuMon: { tu: 5, den: 20 },
      lechDao: { x: 0, y: 0 },
    }
    expect(viTriVeCoDien(lop, GIOI_HAN, false).x).toBe(20)
  })

  it('và dải ấy KHÔNG áp cho người thường', () => {
    const lop: LopViTri = {
      moc: { x: 8, y: 30 },
      sauNoiSuy: null,
      sauBamBong: { x: 50, y: 30 },
      daiThuMon: null,
      lechDao: { x: 0, y: 0 },
    }
    expect(viTriVeCoDien(lop, GIOI_HAN, false).x).toBe(50)
  })

  it('dao động cộng SAU CÙNG, và kết quả bị kẹp vào mặt cỏ', () => {
    const lop: LopViTri = {
      moc: { x: 50, y: 30 },
      sauNoiSuy: null,
      sauBamBong: null,
      daiThuMon: null,
      lechDao: { x: 2, y: 3 },
    }
    expect(viTriVeCoDien(lop, GIOI_HAN, false)).toEqual({ x: 52, y: 33 })

    // Và kẹp: dao động không được đẩy ai ra khỏi khung.
    const satMep: LopViTri = { ...lop, moc: { x: 97, y: 61 }, lechDao: { x: 9, y: 9 } }
    const ra = viTriVeCoDien(satMep, GIOI_HAN, false)
    expect(ra.x).toBe(GIOI_HAN.xDen)
    expect(ra.y).toBe(GIOI_HAN.yDen)
  })
})

/*
  ====================================================================
  GIẢM CHUYỂN ĐỘNG Ở CHẾ ĐỘ LIÊN TỤC (T737, AC-45.9).
  ====================================================================

  AC-45.9 nói: đồng hồ **mốc** vẫn chạy, chỉ **nội suy** và **dao động** tắt.
  Ở lớp vẽ, điều đó có một hệ quả kiểm được: toạ độ trả về phải **trùng khít**
  một mốc engine đã phát, **không bao giờ** là một giá trị nằm giữa hai mốc.

  ⚠️ **T734 đổi hành vi, T737 chứng minh hành vi** — hai điều kiện ra khác nhau
  của hai task khác nhau, và task này là cái lưới duy nhất ở tầng hàm thuần cho
  một thay đổi mà `src/ui/components` không có một phép kiểm nào canh (R52).
*/
describe('giảm chuyển động: vẫn trùng khít mốc (T737, AC-45.9)', () => {
  /** 100 bộ đầu vào: 10 chỗ của mốc × 10 kiểu nhiễu của lớp cổ điển. */
  const CAC_MOC = Array.from({ length: 10 }, (_, i) => ({
    x: 5 + i * 10,
    y: 4 + i * 6,
  }))
  const CAC_NHIEU = Array.from({ length: 10 }, (_, i) => ({
    sauNoiSuy: { x: 50 + i, y: 30 - i },
    sauBamBong: { x: 11 * i, y: 6 * i },
    lechDao: { x: (i % 3) - 1, y: 1 - (i % 3) },
  }))

  it('100 bộ: với giảm chuyển động BẬT, toạ độ vẫn là đúng mốc ấy', () => {
    let soBo = 0
    for (const m of CAC_MOC) {
      const anh: AnhChupMet = {
        thucThe: [thucThe(m.x, m.y)],
        oCuaNguoi: new Map([['a', 0]]),
        nguoiGiuBong: 0,
      }
      for (const nhieu of CAC_NHIEU) {
        const lop: LopViTri = {
          moc: { x: 0, y: 0 },
          sauNoiSuy: nhieu.sauNoiSuy,
          sauBamBong: nhieu.sauBamBong,
          daiThuMon: null,
          lechDao: nhieu.lechDao,
        }
        const ra = viTriVe(lop, GIOI_HAN, true, anh, 'a', KHUNG)
        expect(ra, `mốc ${m.x},${m.y}`).toEqual(toaDoTuMet(KHUNG, m.x, m.y))
        soBo += 1
      }
    }
    // ⚠️ CHỐNG RỖNG: điều kiện ra của task đòi đúng 100 bộ.
    expect(soBo, 'số bộ đã quét').toBe(100)
  })

  /*
    ⚠️ **Mệnh đề "không bao giờ nằm GIỮA hai mốc".** Phép kiểm trên một mình
    chưa nói được điều đó: một hàm nội suy với hệ số 0 cũng trả đúng mốc đầu.
    Ca này đưa **hai** mốc liền nhau và đòi kết quả là **một trong hai**, không
    phải một điểm ở giữa — kể cả khi mọi lớp cổ điển đều trỏ vào điểm giữa ấy.
  */
  it('và KHÔNG BAO GIỜ là một điểm nằm giữa hai mốc', () => {
    const truoc = { x: 20, y: 20 }
    const sau = { x: 60, y: 44 }
    const giua = { x: (truoc.x + sau.x) / 2, y: (truoc.y + sau.y) / 2 }
    const diemGiua = toaDoTuMet(KHUNG, giua.x, giua.y)

    for (const m of [truoc, sau]) {
      const anh: AnhChupMet = {
        thucThe: [thucThe(m.x, m.y)],
        oCuaNguoi: new Map([['a', 0]]),
        nguoiGiuBong: 0,
      }
      // Mọi lớp cổ điển đều trỏ vào ĐIỂM GIỮA — cái bẫy của ca này.
      const lop: LopViTri = {
        moc: diemGiua,
        sauNoiSuy: diemGiua,
        sauBamBong: diemGiua,
        daiThuMon: null,
        lechDao: { x: 0, y: 0 },
      }
      for (const giam of [true, false]) {
        const ra = viTriVe(lop, GIOI_HAN, giam, anh, 'a', KHUNG)
        expect(ra, `mốc ${m.x} giảm=${giam}`).toEqual(
          toaDoTuMet(KHUNG, m.x, m.y),
        )
        expect(ra, `mốc ${m.x} giảm=${giam}`).not.toEqual(diemGiua)
      }
    }
  })

  /*
    Và bật hay tắt giảm chuyển động **không đổi một số nào** ở chế độ liên tục:
    đường liên tục không có lớp nội suy để tắt, nên nó đúng **theo cấu trúc**.
  */
  it('bật hay tắt giảm chuyển động cho CÙNG một toạ độ', () => {
    const anh = anhChupMau()
    for (const id of ['a', 'b']) {
      expect(viTriVe(LOP_DAY_DU, GIOI_HAN, true, anh, id, KHUNG)).toEqual(
        viTriVe(LOP_DAY_DU, GIOI_HAN, false, anh, id, KHUNG),
      )
    }
  })
})

/*
  ====================================================================
  AC-38.8 ĐO Ở LỚP VẼ: pha chạy nhanh phải là ĐƯỜNG CONG (T735).
  ====================================================================

  ⚠️ **Đo trên toạ độ ĐÃ QUA `quyDoiMet`, không trên mét thô.** D121 chọn một
  hệ số **đẳng hướng** chính vì chuyện này: nếu hai trục co khác nhau thì một
  ngưỡng **góc** bị méo, và phép kiểm này sẽ đo một thứ không phải góc. Đo trên
  mét thô thì lý lẽ của D121 thành vô nghĩa — nó chỉ còn là một lời khai.

  ⚠️ **Ngưỡng QUY TỪ `TOC_QUAY_NHANH`, không chép số.** Nhưng nó có **hai**
  thành phần, và thành phần thứ hai không được giấu:

    1. `TOC_QUAY_NHANH × Δt` — trần quay của chính `buocCoHoc`;
    2. một lề cho **`tachChen`**, thứ đẩy người ra khỏi nhau **SAU** phép bước
       (T713). Một cú đẩy ngang tới `BAN_KINH_TRANH` = 2 m trên một bước dài
       4,5 m (0,5 giây ở 9 m/s) là một góc **24°** — không phải người ấy quay,
       mà là chỗ đứng của anh ta bị dịch.

  Đo trên 3 trận, 2.317 mẫu có **cả hai** đoạn trên 6 m/s: trung vị **1,5°**,
  p95 **30,0°**, lớn nhất **48,3°** (ở Δt = 1 giây) và **39,1°** (ở Δt = 0,5).
*/
describe('AC-38.8 ở lớp vẽ: đường chạy nhanh là đường cong (T735)', () => {
  /**
   * Lề cho `tachChen`, độ — nêu bằng số, đo được 24,1° ở chỗ tệ nhất.
   *
   * Lấy 30 để còn chỗ cho một đám đông đẩy nhiều vòng, nhưng **không** lấy lớn
   * hơn `TOC_QUAY_NHANH × Δt` của mốc dày: lề mà nuốt cả trần thì phép kiểm
   * thôi canh trần.
   */
  const GOC_LECH_TACH_CHEN = 30

  const KHUNG_DO: KhungAnh = { rong: 100, cao: 64, le: 2.6 }
  const NUA_GIAY = 0.5
  const SAN_TOC_DO_AC_38_8 = 6

  it('3 mã: góc đổi hướng không vượt trần quay cộng lề tách chen', () => {
    const goc: number[] = []
    let soMau = 0
    let gocLonNhat = 0

    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      let truoc: MocDaDo | null = null
      let truocNua: MocDaDo | null = null

      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
          const m = docMoc(phut.lo, i)
          const nay: MocDaDo = {
            moc: m.chiSoMoc,
            met: m.cacThucThe.slice(0, 22).map((t) => ({ x: t.x, y: t.y })),
            ve: m.cacThucThe
              .slice(0, 22)
              .map((t) => toaDoTuMet(KHUNG_DO, t.x, t.y)),
          }

          if (truoc && truocNua) {
            const dt1 = (truoc.moc - truocNua.moc) * NUA_GIAY
            const dt2 = (nay.moc - truoc.moc) * NUA_GIAY
            const tran = TOC_QUAY_NHANH * dt2 + GOC_LECH_TACH_CHEN

            for (let o = 0; o < 22; o += 1) {
              /*
                Lọc theo tốc độ đo trên MÉT: AC-38.8 nói "trên 6 m/s", và 6 m/s
                là một đại lượng của sân chứ không của khung vẽ.
              */
              const v1 = khoang(truocNua.met[o]!, truoc.met[o]!) / dt1
              const v2 = khoang(truoc.met[o]!, nay.met[o]!) / dt2
              if (v1 <= SAN_TOC_DO_AC_38_8 || v2 <= SAN_TOC_DO_AC_38_8) continue

              const g = gocGiuaHaiDoan(
                truocNua.ve[o]!,
                truoc.ve[o]!,
                nay.ve[o]!,
              )
              if (g === null) continue
              goc.push(g)
              gocLonNhat = Math.max(gocLonNhat, g)
              soMau += 1
              expect(g, `${ma} ô ${o}, Δt=${dt2}`).toBeLessThanOrEqual(tran)
            }
          }
          truocNua = truoc
          truoc = nay
        }
        lt = phut.tt
      }
    }

    goc.sort((a, b) => a - b)
    const trungVi = goc[Math.floor(goc.length / 2)]!

    /*
      ⚠️ **Mệnh đề thật sự của AC-38.8 là mệnh đề này, không phải cái trần.**
      AC nói đường chạy phải là một **đường cong**; một đường gấp khúc có thể
      nằm dưới trần mà vẫn gấp khúc. Trung vị nhỏ là thứ nói nó cong: đo được
      **1,5°**.
    */
    expect(trungVi, 'góc đổi hướng, trung vị').toBeLessThan(5)
    // ⚠️ CHỐNG RỖNG: phải CÓ pha chạy trên 6 m/s, không thì cả khối vô nghĩa.
    expect(soMau, 'số mẫu có cả hai đoạn trên 6 m/s').toBeGreaterThan(1_000)
    expect(gocLonNhat, 'phải CÓ cú đổi hướng thật').toBeGreaterThan(10)
  })

  /*
    ⚠️ **Vì sao "đo trên toạ độ đã quy đổi" là một yêu cầu THẬT, chứ không phải
    một câu chữ.** `toaDoTuMet` hôm nay dùng **một** hệ số cho cả hai trục, nên
    nó giữ nguyên góc và phép đo trên mét thô ra **đúng cùng con số**. Nghĩa là
    yêu cầu ấy không quan sát được từ kết quả — trừ khi có phép kiểm này.

    Nó canh chính **lý lẽ của D121**: hai trục phải co **cùng** một hệ số. Ngày
    nào ai đó cho `x` và `y` co khác nhau, mọi ngưỡng **góc** trong repo lập tức
    đo một thứ không phải góc, và phép kiểm trần ở trên sẽ đỏ vì một lý do hoàn
    toàn khác thứ nó định canh.
  */
  it('phép quy đổi mét ĐẲNG HƯỚNG, nên góc không bị méo', () => {
    const goc = toaDoTuMet(KHUNG_DO, 10, 10)
    const theoX = toaDoTuMet(KHUNG_DO, 20, 10)
    const theoY = toaDoTuMet(KHUNG_DO, 10, 20)
    const tiX = Math.abs(theoX.x - goc.x) / 10
    const tiY = Math.abs(theoY.y - goc.y) / 10
    expect(tiY, 'hệ số trục y phải bằng hệ số trục x').toBeCloseTo(tiX, 12)

    // Và một góc 45° trong mét vẫn là 45° trên hình.
    const cheo = toaDoTuMet(KHUNG_DO, 30, 20)
    const g = gocGiuaHaiDoan(goc, theoX, cheo)
    expect(g, 'góc 45° giữ nguyên qua phép quy đổi').toBeCloseTo(45, 9)
  })

  /*
    🐞 **Ngưỡng quy từ hằng số thì MÙ với chính hằng số ấy — tìm ra bằng đột
    biến, không bằng đọc lại.** Tôi nâng `TOC_QUAY_NHANH` từ 30 lên 90 và
    **17/17 phép kiểm vẫn xanh**: ngưỡng của phép kiểm quy từ cùng con số, nên
    nâng hằng số là nâng **cả hai vế**.

    Điều kiện ra của task đòi "quy từ `TOC_QUAY_NHANH`, không chép số" — và nó
    đúng, vì nó giữ engine với phép kiểm **không trôi khỏi nhau**. Nhưng một
    mình nó không đủ: phải có thêm một chỗ **ghim** con số mà AC-38.8 nêu. Hai
    mệnh đề làm hai việc khác nhau — một cái giữ hai bên khớp nhau, một cái giữ
    chúng khớp **với spec**.

    Đổi 30 ở đây là một quyết định về **spec**, nên nó phải đi qua một phép kiểm
    đỏ chứ không trôi qua im lặng.
  */
  it('và con số ấy là con số AC-38.8 nêu, ghim lại', () => {
    expect(TOC_QUAY_NHANH, 'ngưỡng quay nhanh của AC-38.8, độ/giây').toBe(30)
  })

  it('và lề tách chen không nuốt mất chính cái trần nó đứng cạnh', () => {
    expect(GOC_LECH_TACH_CHEN).toBeLessThanOrEqual(TOC_QUAY_NHANH)
    // Trần ở mốc dày (Δt = 0,5 giây) vẫn chặt hơn trần ở mốc thường.
    expect(TOC_QUAY_NHANH * 0.5 + GOC_LECH_TACH_CHEN).toBeLessThan(
      TOC_QUAY_NHANH * 1 + GOC_LECH_TACH_CHEN,
    )
  })
})

interface MocDaDo {
  readonly moc: number
  readonly met: readonly { x: number; y: number }[]
  readonly ve: readonly { x: number; y: number }[]
}

function khoang(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Góc giữa hai đoạn liền nhau, độ; `null` khi một đoạn dài gần 0. */
function gocGiuaHaiDoan(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number | null {
  const u = { x: b.x - a.x, y: b.y - a.y }
  const v = { x: c.x - b.x, y: c.y - b.y }
  const lu = Math.hypot(u.x, u.y)
  const lv = Math.hypot(v.x, v.y)
  if (lu < 1e-9 || lv < 1e-9) return null
  const cos = Math.min(1, Math.max(-1, (u.x * v.x + u.y * v.y) / (lu * lv)))
  return (Math.acos(cos) * 180) / Math.PI
}
