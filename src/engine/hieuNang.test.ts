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

  Hai lệnh, và ĐIỀU KIỆN ĐO quan trọng hơn con số — xem cảnh báo ở cuối khối.

    $ npx vitest run src/engine/hieuNang.test.ts     (× 7, máy RỖI)
      trung bình: 6,5 | 6,6 | 6,6 | 6,7 | 6,7 | 6,7 | 7,1 ms   → dải ×1,09
      lớn nhất:   9,7 | 9,7 | 9,9 | 9,9 | 10,1 | 10,2 | 10,3 ms → dải ×1,06
      tạo trận:   0,09–0,13 ms

    $ npx vitest run        (× 3, máy RỖI, 65 file / 1.339 test)
      trung bình: 11,0 | 11,8 | 14,3 ms
      lớn nhất:   18,2 | 19,9 | 24,5 ms

  Điều kiện đo: 20 mã (10 mã của `MA_TRAN_CO_DINH` + 10 mã dẫn xuất), một lượt
  khởi động trước khi bấm đồng hồ, `environment: 'node'`, các lượt nối tiếp
  nhau, và — điều kiện quyết định — **máy không chạy việc nặng nào khác**.

  HAI ĐIỀU ĐO ĐƯỢC:

  1. **Số đo này ỔN ĐỊNH, và con số nền 7,4 / 12,6 ms của `plan.md` mục 2.3
     tái lập được.** Bảy lượt chỉ tản ×1,06–1,09, tức ±6–9%. Không có gì phải
     sửa ở kết luận cũ; chỉ nên đọc nó là một dải hẹp thay vì một điểm.

  2. **Hệ số nở giữa chạy riêng và cả suite ĐO ĐƯỢC, và nó là ~1,6–2,5 lần
     (trung vị ~1,8–2,0), KHÔNG phải 3,5 lần** như `plan.md` mục 2.3 dùng.
     Chênh lệch ấy đổi hẳn phép tính ngân sách mùa giải về mặt độ lớn, nên
     **T753 phải tính lại bằng con số của chính nó** — task này chỉ báo hệ số
     đo được, và KHÔNG kết luận gì về việc ngân sách vỡ hay không vỡ.

  ⚠️ **BÀI HỌC ĐẮT, GHI LẠI ĐỂ KHÔNG AI TRẢ LẦN HAI.** Bản đầu của khối này
  (commit `4ddfa5e`) ghi "trung bình 9,7–21,9 ms, lớn nhất 14,8–48,7 ms, nhiễu
  run-to-run ×3,3" và từ đó kết luận rằng hệ số nở 3,5 "không đo được" và phép
  tính `33,7 × 3,5 = 118 ms` "không có nền". **Cả hai kết luận ấy đều sai**, và
  nguyên nhân là chính phép đo: nó chạy trong lúc máy đang gánh một đàn tiến
  trình soát chéo. Trên máy rỗi, dải co từ ×3,3 xuống ×1,06.

  Nên "điều kiện đo" không phải là một dòng thủ tục: **tải của máy là một phần
  của con số**. Đó đúng là điều lệnh cấm số 3 ở `plan.md` mục 7 muốn chặn, và
  lần đầu nó bị phá bởi chính task được gán cho nó.
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
