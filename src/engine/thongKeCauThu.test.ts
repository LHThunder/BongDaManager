import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  apDungCanThiep,
  buocTiep,
  chayHetTran,
  nguoiTrongKhung,
  taoTran,
  type BenTran,
  type TrangThaiTran,
} from './tran'

/*
  Số liệu từng cầu thủ (AC-11.3) và hai mốc phút (AC-11.5).

  Phép quan trọng nhất ở đây là "tổng theo 18 người bằng tổng theo bên", chạy
  cho MỌI chỉ tiêu có cả hai mức. Đó là cách bắt lỗi gán sai người — kiểu lỗi
  mà đọc code không thấy, vì mỗi dòng cộng đều trông hợp lý khi đọc riêng.

  `/analyze` chỉ ra một lỗ hổng cụ thể mà phép tổng này tồn tại để chặn: nếu
  `ThongKeBen` không có tổng đường chuyền thì `chuyenThanhCong` của 11 người có
  thể rỗng mà chẳng test nào biết.
*/

const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

/** Những chỉ tiêu có mặt ở CẢ hai mức, nên tổng phải khớp. */
const KHOP_HAI_MUC = [
  'cuSut',
  'sutTrungDich',
  'chuyenThanhCong',
  'chuyenHong',
] as const

function tongTheoNguoi(ben: BenTran, khoa: (typeof KHOP_HAI_MUC)[number]) {
  return Object.values(ben.thongKe.theoCauThu).reduce(
    (s, x) => s + x[khoa],
    0,
  )
}

describe('tổng theo cầu thủ khớp tổng theo bên (AC-11.3)', () => {
  it('bốn chỉ tiêu có ở cả hai mức đều khớp, ở mọi trận và cả hai bên', () => {
    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))

      for (const ben of ['nha', 'khach'] as const) {
        for (const khoa of KHOP_HAI_MUC) {
          expect(
            tongTheoNguoi(tt.ben[ben], khoa),
            `${ma}/${ben}/${khoa}`,
          ).toBe(tt.ben[ben].thongKe[khoa])
        }
      }
    }
  })

  it('tổng bàn thắng theo cầu thủ bằng đúng tỉ số', () => {
    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      for (const ben of ['nha', 'khach'] as const) {
        const ban = Object.values(tt.ben[ben].thongKe.theoCauThu).reduce(
          (s, x) => s + x.banThang,
          0,
        )
        expect(ban, `${ma}/${ben}`).toBe(tt.tiSo[ben])
      }
    }
  })

  it('người trong khung có pha cứu thua ở ít nhất một trong 20 trận', () => {
    let coCuu = 0
    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      for (const ben of ['nha', 'khach'] as const) {
        const thuMon = nguoiTrongKhung(tt.ben[ben])
        if (!thuMon) continue
        if ((tt.ben[ben].thongKe.theoCauThu[thuMon]?.canCuu ?? 0) > 0) {
          coCuu += 1
        }
      }
    }

    console.log(`số lượt thủ môn có pha cứu thua: ${coCuu}/40`)
    expect(coCuu).toBeGreaterThan(0)
  })
})

describe('phút vào sân và phút ra sân (AC-11.5)', () => {
  /** Chạy tới đúng `phut` rồi xếp một lần thay người. */
  function thayOPhut(ma: string, phut: number) {
    let tt: TrangThaiTran = taoTran(cauHinhMau(ma))
    while (tt.phut < phut) tt = buocTiep(tt)

    const ra = tt.ben.nha.trenSan[5]
    const vao = tt.ben.nha.duBi[0]
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: { loai: 'thay-nguoi', ra, vao },
    })
    if (!kq.thanhCong) throw new Error(`bị từ chối: ${kq.lyDo}`)

    tt = kq.trangThai
    while (!tt.ketThuc) tt = buocTiep(tt)
    return { tt, ra, vao }
  }

  it('người ra có phutRa, người vào có phutVao, và hai mốc trùng nhau', () => {
    const { tt, ra, vao } = thayOPhut(CAC_MA[0], 60)
    const bang = tt.ben.nha.thongKe.theoCauThu

    expect(bang[ra]?.phutRa).not.toBeNull()
    expect(bang[vao]?.phutVao).toBe(bang[ra]?.phutRa)
    // Can thiệp xếp ở phút 60 có hiệu lực ở đầu phút 61 (quyết định D30b).
    expect(bang[ra]?.phutRa).toBe(61)
  })

  it('người đá từ đầu tới cuối thì cả hai mốc đều null', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(CAC_MA[0])))
    const bang = tt.ben.nha.thongKe.theoCauThu

    for (const id of tt.ben.nha.trenSan) {
      const tk = bang[id]
      if (!tk) continue
      expect(tk.phutVao, id).toBeNull()
      expect(tk.phutRa, id).toBeNull()
    }
  })

  it('người nhận thẻ đỏ có phutRa dù không có can thiệp nào', () => {
    let soKiem = 0

    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      for (const ben of ['nha', 'khach'] as const) {
        const b = tt.ben[ben]
        const bang = b.thongKe.theoCauThu
        for (const [id, the] of Object.entries(b.the)) {
          if (the === 'vang') continue
          // Đã rời sân vì thẻ: phải có mốc ra sân, và không có can thiệp nào.
          expect(bang[id]?.phutRa, `${ma}/${ben}/${id}`).not.toBeNull()
          soKiem += 1
        }
      }
      expect(tt.canThiep).toHaveLength(0)
    }

    console.log(`số người bị đuổi đã kiểm mốc ra sân: ${soKiem}`)
    expect(soKiem).toBeGreaterThan(0)
  })

  /*
    Một người có thể có CẢ HAI mốc: vào sân từ băng ghế rồi bị đuổi. Đây là
    trường hợp mà cách dẫn xuất từ danh sách `canThiep` sẽ sai nhất, nên nó
    phải được kiểm thật chứ không chỉ suy luận.

    Thay người ở phút 5 rồi chạy hết trận trên 120 mã: mỗi bên nhận chừng 0,5
    thẻ đỏ một trận và người phạm lỗi được rút trong 11 người, nên vài lần
    trúng đúng người mới vào là chuyện chắc chắn gặp ở mẫu này. 20 mã thì KHÔNG
    gặp lần nào — phép kiểm xanh một cách rỗng, nên mẫu phải rộng.
  */
  it('người vào sân từ băng ghế rồi bị đuổi có cả hai mốc', () => {
    let daGap = 0

    for (let i = 0; i < 120; i += 1) {
      const { tt, vao } = thayOPhut(`V${String(i).padStart(4, '0')}XQ4B`, 5)
      const tk = tt.ben.nha.thongKe.theoCauThu[vao]
      if (!tk || tk.phutRa === null) continue

      expect(tk.phutVao, `mã thứ ${i}`).not.toBeNull()
      expect(tk.phutRa, `mã thứ ${i}`).toBeGreaterThan(tk.phutVao ?? 0)
      daGap += 1
    }

    console.log(`số mã trận mà người mới vào sân bị đuổi: ${daGap}/120`)
    expect(daGap).toBeGreaterThan(0)
  })
})
