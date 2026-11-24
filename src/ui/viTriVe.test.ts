import { describe, expect, it } from 'vitest'
import type { ThucTheTaiMoc } from '../engine/lienTuc/loMoc'
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
