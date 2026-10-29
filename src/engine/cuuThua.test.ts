import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  buocTiep,
  chayHetTran,
  dongSuKien,
  nguoiTrongKhung,
  taoTran,
  xacSuatBiCuu,
  type BenTran,
  type TrangThaiTran,
} from './tran'

/*
  Cứu thua (AC-11.2, quyết định D38).

  Tới hết Giai đoạn 3, `'cuu-thua'` là một loại sự kiện CHẾT: nó được khai
  trong `LoaiSuKien`, đã có đủ bốn mẫu câu tiếng Việt ở `ui/tuongThuat.ts`,
  nhưng `loaiCuaChuoi` chưa bao giờ trả về nó — nên chưa một trận nào trong
  dự án có một pha cứu thua. Hệ quả đo được: `sutTrungDich` bằng ĐÚNG số bàn
  thắng, tức "sút trúng đích" và "ghi bàn" là một; và thủ môn không có số liệu
  nào để AC-11.3 chấm điểm.
*/

const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

function chay(ma: string) {
  return chayHetTran(taoTran(cauHinhMau(ma)))
}

describe('cứu thua xuất hiện thật trong trận', () => {
  it('loại sự kiện `cuu-thua` có ở ít nhất 15 trong 20 trận', () => {
    let coCuuThua = 0
    let tongDong = 0

    for (const ma of CAC_MA) {
      const cac = dongSuKien(chay(ma)).filter((s) => s.loai === 'cuu-thua')
      if (cac.length > 0) coCuuThua += 1
      tongDong += cac.length
    }

    console.log(
      `20 trận — ${coCuuThua}/20 trận có pha cứu thua, tổng ${tongDong} dòng`,
    )
    expect(coCuuThua).toBeGreaterThanOrEqual(15)
  })

  it('mỗi dòng cứu thua gắn với một cầu thủ cụ thể (AC-8.2)', () => {
    for (const ma of CAC_MA) {
      for (const s of dongSuKien(chay(ma))) {
        if (s.loai !== 'cuu-thua') continue
        expect(s.cacCauThu.length, ma).toBeGreaterThan(0)
      }
    }
  })
})

describe('sút trúng đích hết bằng số bàn thắng (AC-11.2)', () => {
  it('bàn thắng ≤ sút trúng đích ≤ cú sút, và lớn hơn hẳn số bàn ở phần lớn trận', () => {
    let lonHon = 0

    for (const ma of CAC_MA) {
      const tt = chay(ma)
      for (const ben of ['nha', 'khach'] as const) {
        const tk = tt.ben[ben].thongKe
        expect(tk.sutTrungDich, `${ma}/${ben}`).toBeGreaterThanOrEqual(
          tt.tiSo[ben],
        )
        expect(tk.sutTrungDich, `${ma}/${ben}`).toBeLessThanOrEqual(tk.cuSut)
        if (tk.sutTrungDich > tt.tiSo[ben]) lonHon += 1
      }
    }

    // 40 lượt (20 trận × 2 bên). Trước T101 thì con số này là 0.
    console.log(`số lượt có sút trúng đích nhiều hơn số bàn: ${lonHon}/40`)
    expect(lonHon).toBeGreaterThanOrEqual(30)
  })
})

describe('thủ môn giỏi cứu được nhiều hơn', () => {
  it('xác suất bị cứu tăng theo sức thủ môn, và khung trống thì bằng 0', () => {
    expect(xacSuatBiCuu(null)).toBe(0)
    expect(xacSuatBiCuu(0.8)).toBeGreaterThan(xacSuatBiCuu(0.2))
    for (const s of [-5, 0, 0.5, 1, 99]) {
      expect(xacSuatBiCuu(s)).toBeGreaterThanOrEqual(0.05)
      expect(xacSuatBiCuu(s)).toBeLessThanOrEqual(0.9)
    }
  })

  /*
    Phép so "thủ môn giỏi cứu nhiều hơn" trên cả trận CHƯA làm ở đây: đội mẫu
    chưa có cách ghi đè riêng ba chỉ số của thủ môn (`gkAttributes` dựng từ
    một giá trị chung), nên muốn đo thì phải sửa `__fixtures__/doiMau.ts` —
    file không nằm trong danh sách của T101.

    Mức kiểm hiện tại là đủ cho dòng "Xong khi" của T101: hàm `xacSuatBiCuu`
    đơn điệu theo sức thủ môn (ở trên), và bên tấn công sút vào khung trống
    thì không cú nào bị cứu (ở dưới). Phần so trên cả trận thuộc T109, nơi
    AC-11.3 cần chấm điểm thủ môn thật.
  */
})

describe('khung thành bỏ trống thì không có ai cứu thua', () => {
  it('thủ môn bị đuổi mà chưa ai vào bắt gôn thì không còn dòng cứu thua nào', () => {
    const ma = CAC_MA[0]

    // Dựng đúng thế trận sau thẻ đỏ của thủ môn đội nhà, ngay từ phút 1.
    let tt: TrangThaiTran = taoTran(cauHinhMau(ma))
    const thuMon = nguoiTrongKhung(tt.ben.khach)
    if (thuMon === null) throw new Error('đội mẫu phải có thủ môn')

    const khach: BenTran = {
      ...tt.ben.khach,
      trenSan: tt.ben.khach.trenSan.filter((id) => id !== thuMon),
      the: { ...tt.ben.khach.the, [thuMon]: 'do' },
    }
    tt = { ...tt, ben: { ...tt.ben, khach } }
    expect(nguoiTrongKhung(tt.ben.khach)).toBeNull()

    while (!tt.ketThuc) tt = buocTiep(tt)

    /*
      Đội NHÀ sút vào khung trống của đội khách, nên không cú nào bị cứu:
      `sutTrungDich` của đội nhà phải bằng đúng số bàn họ ghi.
    */
    expect(tt.ben.nha.thongKe.sutTrungDich).toBe(tt.tiSo.nha)
  })
})
