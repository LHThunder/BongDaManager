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

/*
  ───────────────────────────────────────────────────────────────────────────
  MỐC NỀN ĐO LẠI — T700 của spec 007, ngày 2026-11-23, commit `37961e4`.

  File này canh HAI ngưỡng, không phải một:
    • `NGAN_SACH_MS = 200` cho "chạy hết một trận"  (dùng ở `it` thứ nhất)
    • `NGAN_SACH_MS / 10 = 20` cho "tạo trận"       (dùng ở `it` thứ hai)

  MỘT LƯỢT ĐO LÀ VÔ NGHĨA Ở ĐÂY. Chạy đúng một lệnh, năm lượt liền nhau:

    $ npx vitest run src/engine/hieuNang.test.ts     (× 5)
      trung bình: 11,4 | 15,5 | 18,0 | 18,7 | 21,9 ms   → dải ×1,9
      lớn nhất:   20,3 | 25,2 | 35,9 | 47,3 | 48,7 ms   → dải ×2,4

    Cộng hai lượt rời trước đó: 17,5/32,3 và 9,7/14,8.
    Gộp bảy lượt: trung bình 9,7–21,9 ms (×2,3), lớn nhất 14,8–48,7 ms (×3,3).

    $ npx vitest run        (cả suite, 63 file / 1.304 test, 28,47 s)
      một lượt: trung bình 17,5 ms — lớn nhất 38,6 ms
      tạo trận: trung bình 0,08 ms (chạy riêng: 0,09 và 0,13 ms)

  Điều kiện đo: 20 mã (10 mã của `MA_TRAN_CO_DINH` + 10 mã dẫn xuất), có một
  lượt khởi động trước khi bấm đồng hồ, `environment: 'node'`, máy của người
  dùng, không đóng ứng dụng nào khác, các lượt chạy nối tiếp nhau.

  HAI ĐIỀU T700 ĐO ĐƯỢC — báo số, không kết luận:

  1. **Con số nền của `plan.md` mục 2.3 (7,4 ms trung bình / 12,6 ms lớn nhất)
     không sai, nhưng nó là MỘT LƯỢT.** Nó nằm ở hoặc dưới đáy dải đo được hôm
     nay, và vì không một dòng `src/` nào đổi từ `f537d7d`, chênh lệch ấy là
     NHIỄU MÁY chứ không phải engine phình ra. Số nên đọc là **một dải**.

  2. **"Hệ số nở 3,5 lần giữa chạy riêng và suite song song" KHÔNG đo được
     bằng cách này** — và đó là điều đáng nói nhất. Nhiễu run-to-run của chính
     lệnh chạy riêng đã là **×3,3** ở "lớn nhất", tức LỚN HƠN cả hệ số 3,5 mà
     phép đo muốn tìm. Nên mọi phép tính ngân sách dựa trên một tỉ số giữa hai
     lượt đơn lẻ đều không có nền. Muốn một con số có nghĩa thì phải: nhiều
     lượt rồi lấy phân vị, hoặc — tốt hơn — ghép một **số đếm thuần** không
     nhiễu, đúng như `plan.md` mục 7 đã đòi cho **T752**.

  Hệ quả cho ngân sách mùa giải là việc của **T753** (task đo-và-báo) và của
  người dùng, KHÔNG phải của task này.
  ───────────────────────────────────────────────────────────────────────────
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
