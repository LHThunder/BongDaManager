import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, dongSuKien, taoTran } from './tran'

/*
  Ngân sách chạy hết một trận (task T097, rủi ro R12).

  Spec cho 3 giây cho cả việc "chạy hết trận" trên máy người dùng, nhưng con số
  đó phải gánh thêm giao diện React và sân 2D của Giai đoạn 4. Test này đo
  RIÊNG phần engine và đòi dưới 200ms mỗi trận — nghiêm hơn rất nhiều, để nếu
  engine phình ra thì biết ngay khi còn chỗ xoay, chứ không phải lúc đã ghép
  xong giao diện.

  Đo bằng `performance.now` chứ không `Date.now`: `Date.now` chỉ chính xác tới
  milisecond nên một trận 30ms đo ra 30 hay 31 là chuyện của may mắn.
*/

/** Ngân sách cho riêng engine, trong môi trường test. */
const NGAN_SACH_MS = 200

/** 20 mã trận: 10 mã cố định, cộng 10 mã dẫn xuất để không chỉ đo một kiểu trận. */
const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

describe('ngân sách chạy hết trận (T097, rủi ro R12)', () => {
  it(`mỗi trận chạy xong dưới ${NGAN_SACH_MS}ms`, () => {
    /*
      Chạy một lượt khởi động trước khi đo. Lượt đầu gánh cả việc JIT biên dịch
      lần đầu và việc nạp bảng sơ đồ / vai trò, nên nếu tính nó vào thì con số
      báo ra là của lần chạy đầu tiên trong đời tiến trình, không phải của một
      trận bình thường.
    */
    chayHetTran(taoTran(cauHinhMau(MA_TRAN_CO_DINH[0])))

    const soMs: number[] = []
    for (const ma of CAC_MA) {
      const batDau = performance.now()
      const xong = chayHetTran(taoTran(cauHinhMau(ma)))
      soMs.push(performance.now() - batDau)

      // Đo một trận rỗng thì vô nghĩa: khẳng định trận có thật đã chạy.
      expect(xong.ketThuc, ma).toBe(true)
      expect(dongSuKien(xong).length, ma).toBeGreaterThan(0)
    }

    const lonNhat = Math.max(...soMs)
    const trungBinh = soMs.reduce((s, x) => s + x, 0) / soMs.length

    console.log(
      `chạy hết trận trên ${CAC_MA.length} mã — trung bình ${trungBinh.toFixed(1)}ms, lớn nhất ${lonNhat.toFixed(1)}ms, ngân sách ${NGAN_SACH_MS}ms`,
    )

    expect(lonNhat).toBeLessThan(NGAN_SACH_MS)
  })

  it('tạo trận là việc rẻ, không phải nơi giấu phần nặng', () => {
    taoTran(cauHinhMau(MA_TRAN_CO_DINH[0]))

    const batDau = performance.now()
    for (const ma of CAC_MA) taoTran(cauHinhMau(ma))
    const moiLan = (performance.now() - batDau) / CAC_MA.length

    console.log(`tạo trận — trung bình ${moiLan.toFixed(2)}ms mỗi trận`)
    expect(moiLan).toBeLessThan(NGAN_SACH_MS / 10)
  })
})
