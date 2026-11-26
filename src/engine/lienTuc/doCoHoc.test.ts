import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import { DAI_SAN } from '../hinhHocSan'
import { KHOANG_TRONG_TAI, LE_DUONG_BIEN_TRO_LY } from './coHoc'
import { dieuKienTuMaTran } from './dieuKien'
import {
  CAC_VE,
  doCoHoc,
  KHONG_AI_GIU_TRONG_TEP,
  lechGoc,
  LE_TRO_LY_THUC,
  VE_CHUA_CO_MAU,
  VE_KHONG_DO_DUOC_TU_TEP,
  type Ve,
} from './doCoHoc'
import {
  dungTepXuat,
  KHOA_BONG,
  KHOA_NGUOI,
  MA_TRONG_TAI,
  type CauThuTrongKhung,
  type KhungDay,
  type TepXuat,
} from './tepXuat'

/*
  ====================================================================
  BỘ ĐO CƠ HỌC TRÊN CHÍNH TỆP (T742, AC-45.6).
  ====================================================================

  Khối này có **bốn** việc, và việc thứ ba là việc đã cứu cả task:

    1. phép đo **có mẫu thật** cho từng vế — chống rỗng;
    2. ghi lại **món nợ đo được hôm nay** bằng con số chính xác;
    3. bộ test **NGƯỢC** — bơm một mốc sai cho **mỗi** ngưỡng, đòi **đúng một**
       `ViPham` của vế ấy;
    4. phép đo **độc lập thứ tự cột**.

  🐞 **Và việc thứ ba đã bắt một lỗi trong chính bộ đo, sau khi chiều thuận đã
  chạy xong và đã ra một bảng số trông rất thuyết phục.** `lechGoc` bản đầu bị
  **đảo dấu**: nó trả 0 cho hai hướng ngược nhau và 180 cho hai hướng trùng
  nhau. Chiều thuận vẫn xanh đỏ bình thường và báo **30.553** vi phạm, trong đó
  12.171 ở AC-38.3(i) với chú thích "đổi hướng 180°" — tất cả là những người
  đang chạy **thẳng**. Ca ngược "bơm một cú quay 180° ở 5 m/s" ra **0** vi phạm
  là chỗ duy nhất trong cả repo nói ra điều đó.

  Sau khi sửa: **1.606** vi phạm, và bốn vế dính góc đổi hẳn kết luận. Con số
  "nhiều vi phạm hơn" **không** là dấu hiệu một phép đo đang làm việc.
*/

const MA = MA_TRAN_CO_DINH[0]!
const TEP: TepXuat = dungTepXuat(cauHinhMau(MA))
const KQ = doCoHoc(TEP)

function demTheoVe(kq: { viPham: readonly { ve: string }[] }): Map<string, number> {
  const ra = new Map<string, number>()
  for (const v of kq.viPham) ra.set(v.ve, (ra.get(v.ve) ?? 0) + 1)
  return ra
}
const DEM = demTheoVe(KQ)

describe('lechGoc — hàm mà một dấu trừ sai đã làm sai cả bảng (T742)', () => {
  it('hai hướng ngược nhau lệch 180°, trùng nhau lệch 0°', () => {
    expect(lechGoc(0, 180)).toBe(180)
    expect(lechGoc(0, 0)).toBe(0)
    expect(lechGoc(0, 90)).toBe(90)
    expect(lechGoc(90, 0)).toBe(90)
  })

  it('và nó vòng qua mốc 360° đúng', () => {
    expect(lechGoc(10, 350)).toBe(20)
    expect(lechGoc(350, 10)).toBe(20)
    expect(lechGoc(359.5, 0.5)).toBeCloseTo(1, 9)
  })

  it('đối xứng và luôn trong [0; 180]', () => {
    for (let a = 0; a < 360; a += 7) {
      for (let b = 0; b < 360; b += 11) {
        const d = lechGoc(a, b)
        expect(d).toBe(lechGoc(b, a))
        expect(d).toBeGreaterThanOrEqual(0)
        expect(d).toBeLessThanOrEqual(180)
      }
    }
  })
})

describe('phép đo CÓ MẪU THẬT — chống rỗng (T742, AC-45.6)', () => {
  /*
    ⚠️ Đây là phép kiểm quan trọng nhất của cả khối, và nó không nói về vi phạm.
    Một vế có 0 mẫu trả về "không vi phạm" **y hệt** một vế đã đo xong và đạt.
    Số mẫu là thứ duy nhất phân biệt hai chuyện ấy.
  */
  it('mười ba vế có mẫu, và bốn vế rỗng được KHAI RA chứ không im', () => {
    const rong = CAC_VE.filter((v) => (KQ.soMau[v] ?? 0) === 0)
    expect(rong.slice().sort()).toEqual(
      ['AC-38.5(đánh đầu)', 'AC-38.6(dải)', 'AC-38.6(thời gian bay)', 'AC-38.7'].sort(),
    )
    for (const v of CAC_VE) {
      if (rong.includes(v)) continue
      expect(KQ.soMau[v], `${v} phải có mẫu`).toBeGreaterThan(0)
    }
    expect(CAC_VE).toHaveLength(17)
  })

  it('AC-38.7 được khai là chưa có mẫu, và đúng là 0', () => {
    expect(VE_CHUA_CO_MAU).toEqual(['AC-38.7'])
    expect(KQ.soMau['AC-38.7']).toBe(0)
  })

  it('hai vế của AC-38.10 không đo được từ tệp được KHAI RA, hai vế kia có mẫu', () => {
    expect(VE_KHONG_DO_DUOC_TU_TEP).toEqual(['AC-38.10(a)', 'AC-38.10(b)'])
    expect(KQ.soMau['AC-38.10(c)']).toBe(11958)
    expect(KQ.soMau['AC-38.10(d)']).toBe(5979)
  })

  /*
    Vế (ii) của AC-38.3 là vế đã **biến mất một lần** khỏi cả ba tài liệu, nên
    nó có phép kiểm riêng ở đây: không chỉ "có mẫu", mà có **hàng nghìn** mẫu —
    một vế chỉ chạm tới vài chục lần thì xanh hay đỏ đều là ngẫu nhiên.
  */
  it('vế (ii) của AC-38.3 được GỌI TÊN và có hàng nghìn mẫu', () => {
    expect(CAC_VE).toContain('AC-38.3(ii)')
    expect(KQ.soMau['AC-38.3(ii)']).toBeGreaterThan(1000)
  })

  it('AC-38.9 đúng MỘT mẫu — nó là mệnh đề của trận, không của mốc', () => {
    expect(KQ.soMau['AC-38.9']).toBe(1)
  })

  /*
    ⚠️ NĂM CON SỐ GHIM TRONG FILE NÀY ĐÃ ĐỔI NGÀY 2026-11-26, DO **T813**.

    T813 nối `kepDichThuMon` vào đường chạy của engine. Trước đó hàm ấy là
    **mã chết**: nó có từ T714, có phép kiểm riêng ở `coHoc.test.ts:669`, nhưng
    `grep` cho thấy **không một dòng mã sản phẩm nào gọi nó** — nên đích của
    thủ môn chưa từng bị kẹp, và anh ta ra khỏi một phần ba sân ở 2,06% số mốc,
    lệch xa nhất **31,72 m**. Sau khi nối: **0,06%** và **2,19 m**.

    Quỹ đạo thủ môn đổi thì các bộ đếm cơ học đổi theo. **CHÍN** con số, lấy từ
    `git diff` chứ không từ trí nhớ:

      AC-38.4(ngang) soMau   1421 → 1423
      tổng vi phạm           1606 → 1613
      AC-38.1(i)               15 → 12   ← TỐT LÊN, bớt 3
      AC-38.1(ii)              12 → 11   ← TỐT LÊN, bớt 1
      AC-38.2(tăng)           255 → 259
      AC-38.2(giảm)            11 → 12
      AC-38.3(ii)             860 → 862
      AC-38.4(ngang) đếm        5 →  7
      AC-38.11                  5 →  7

    📝 Chín chứ không năm: `vitest` dừng ở assertion ĐẦU TIÊN hỏng trong mỗi
    khối `it`, nên mỗi lượt chạy chỉ lộ ra một con số mới. Lượt đầu báo 5 chỗ,
    và phải chạy thêm bốn lượt nữa mới thấy hết. Giữa chừng tôi còn tưởng các
    bộ đếm này **bất định** — chúng không bất định; hai thông báo lỗi trông
    giống nhau trong `grep` thuộc về hai assertion khác nhau, và tôi gộp chúng
    làm một. Soát bằng `git diff` mới ra đủ chín.

    📍 **Dòng sự kiện và tỉ số KHÔNG đổi một ký tự.** `taiLap`, `phatLai`,
    `sosanh.*` và vân tay dòng sự kiện của spec 011 đều xanh qua thay đổi này.
    Đúng như hiến pháp nói: vùng là đơn vị **QUYẾT ĐỊNH**, lớp liên tục chỉ
    **DIỄN**. Nên T813 **không** chạm P2 — điều mà chính lời T813 đã đoán sai.

    ════════════════════════════════════════════════════════════════════
    ⚠️⚠️ VÀ RỒI **T814** NGÀY CÙNG HÔM ẤY GỠ 95% MÓN NỢ NÀY.

    Chú thích trên kia nêu **hai nguồn có tên** của chênh lệch vận tốc ↔ dịch
    chuyển, và nguồn thứ nhất là *"`tachChen` đẩy người ra khỏi nhau SAU phép
    bước"*. T814 tìm ra **vì sao** nó đẩy nhiều đến thế: lưới 12 vùng chỉ phát
    **8 điểm đích cho 22 người**, nên 22 trong 231 cặp nhắm **đúng một điểm** và
    bị xô ra mỗi mốc, cả trận. `choDungDoiHinhMet` giãn họ ra, và:

      tổng vi phạm         1.613 → 77      ← bớt 95,2%
      AC-38.2(tăng)          259 → 3
      AC-38.2(giảm)           12 → 0       ← sạch hẳn
      AC-38.3(i)             443 → 4
      AC-38.3(ii)            862 → 26
      AC-38.4(ngang) đếm       7 → 0       ← sạch hẳn
      AC-38.11                 7 → 1
      AC-38.1(i)              12 → 34      ← TỆ HƠN, gần gấp ba
      AC-38.1(ii)             11 → 9
      AC-38.4(lùi) soMau     180 → 21      ← mẫu thưa đi 9 lần
      AC-38.4(ngang) soMau 1.423 → 2.363
      năm mã  1.606/1.678/1.557/1.615/1.705 → 77/101/57/78/90

    📌 Bảng trên đã đi qua **ba** bản trong một ngày, và tổng vi phạm đứng yên
    ở **77** cả ba lần:

    | | giãn 3,5 m | giãn 6,0 m | **+ T815** |
    |---|---|---|---|
    | tổng | 77 | 77 | **77** |
    | AC-38.1(i) | 15 | 34 | **33** |
    | AC-38.2(tăng) | 2 | 3 | **4** |
    | AC-38.2(giảm) | 1 | 0 | **0** |
    | AC-38.3(i) | 13 | 4 | **5** |
    | AC-38.3(ii) | 37 | 26 | **25** |
    | AC-38.11 | 0 | 1 | **1** |
    | soMau lùi | 22 | 21 | **22** |

    Nói cách khác: **`T815` gần như không chạm món nợ cơ học.** Nó đổi *chỗ
    đứng*, không đổi *cách bước*. Chỗ đổi lớn nằm ở `T814` và ở việc giãn
    6,0 m, không ở đây.

    📌 **Ba con số đi ngược, và tôi không gộp chúng vào lời khoe.**
    `AC-38.1(i)` tăng **12 → 34** — hơn gấp đôi, và nó xấu đi thêm khi giãn từ
    3,5 m lên 6,0 m (15 → 34). Người đứng rời nhau thì quãng phải chạy về phía
    bóng **dài hơn**, nên tốc độ đo trên dịch chuyển chạm trần nhiều hơn; và
    những cú xô `tachChen` còn lại không còn cặp nào nằm sẵn trên tường 2,0 m
    để chia bớt. `AC-38.11` đi từ 0 lên **1**. Và `AC-38.4(lùi)` chỉ còn 21
    mẫu — xem chú thích tại chỗ của nó.

    📍 **Dòng sự kiện lại KHÔNG đổi một ký tự**, lần thứ hai trong một ngày:
    1.828 phép kiểm còn lại xanh nguyên, kể cả vân tay `batBienSaBan.test.ts`.
    Vị trí mét không vào bản ghi trận (**AC-45.4**), nên không trận đã lưu nào
    đổi. **P2 nguyên vẹn.**
  */
  it('AC-38.4 có mẫu ở CẢ HAI vế, dù vế lùi THƯA ĐI 9 LẦN sau T814', () => {
    /*
      ⚠️ **180 → 21, và con số cũ phần lớn là RÁC.** Vế "lùi" đếm những mốc một
      người di chuyển ngược hướng thân mình. Trước T814, hai mươi hai cặp người
      đứng chung một điểm đích và bị `tachChen` xô qua xô lại mỗi mốc — những
      cú xô ấy **trông như** chạy lùi với phép đo dựa trên dịch chuyển. Gỡ chỗ
      đứng trùng đi thì 159 trong 180 mẫu biến mất cùng với chúng.

      📌 Nhưng 22 mẫu là **thưa**, và chú thích đầu `describe` này đã rào trước:
      *"một vế chỉ chạm tới vài chục lần thì xanh hay đỏ đều là ngẫu nhiên"*.
      Nên phép chống rỗng ở đây hôm nay **yếu hơn hôm qua** — nó vẫn chứng minh
      vế ấy có người đo, nhưng không còn chứng minh được bao nhiêu. Ghi thành
      món nợ có tên ở `T814` của `tasks.md` chứ không lặng lẽ đổi số.
    */
    expect(KQ.soMau['AC-38.4(lùi)']).toBe(22)
    expect(KQ.soMau['AC-38.4(ngang)']).toBe(2423)
  })
})

describe('SÁU VẾ ĐẠT trên chính tệp (T742, AC-45.6)', () => {
  it('và mỗi vế đạt đều có mẫu — không vế nào đạt bằng cách không đo', () => {
    for (const ve of [
      'AC-38.4(lùi)',
      'AC-38.5(khống chế)',
      'AC-38.9',
      'AC-38.10(c)',
      'AC-38.10(d)',
    ] as const) {
      expect(DEM.get(ve) ?? 0, ve).toBe(0)
      expect(KQ.soMau[ve], ve).toBeGreaterThan(0)
    }
  })

  it('AC-38.10(c): lề 25 m đặt từ phép đo, và lệch thật còn xa nó', () => {
    expect(LE_TRO_LY_THUC).toBe(25)
    /*
      Ca ngược ở dưới chứng minh ngưỡng có răng. Ở đây chỉ khẳng định điều quan
      trọng hơn: lệch thật trên tệp này **không chạm** lề, nên con số 25 không
      phải một lề được nới cho vừa.
    */
    expect(DEM.get('AC-38.10(c)') ?? 0).toBe(0)
  })
})

describe('MÓN NỢ đo được hôm nay — phép đo này KHÔNG xanh (T742)', () => {
  /*
    ⚠️⚠️ **Những con số dưới đây là lỗi, không phải kết quả đạt.** Chúng được
    khẳng định đúng từng con số để làm **dây bẫy**: ngày ai đó sửa mô hình, phép
    kiểm này đỏ và buộc người sửa cập nhật con số — thay vì để một cải thiện
    thật trôi qua không ai thấy, hoặc để một hồi quy lẫn vào đám đã có.

    **Và món nợ này có một nguyên nhân DUY NHẤT, đã đo tách ra.** Đo lại đúng
    những ngưỡng ấy trên **vận tốc thật** của lô (`vx, vy` trong `TrangThaiLienTuc`,
    float64, không qua phép làm tròn của tệp), mô hình **sạch hoàn toàn**:

      - tốc độ lớn nhất **9,0000** m/s — chạm đúng trần AC-38.1, không vượt;
      - `|Δv|` lớn nhất **7,2000** m/s² — dưới trần 8 của AC-38.2;
      - AC-38.3(i): **0/7.690** cặp có `Δθ > 90°` vi phạm — cổng quay ba băng
        của D123 làm đúng việc, và nó có **7.690 mẫu thật** chứ không xanh rỗng;
      - AC-38.3(ii): **0/6.739**;
      - AC-38.4(lùi): **0/48**;
      - AC-38.11: **0/124.111**, lệch vượt lề lớn nhất **0,00°**.

    ⚠️ Con số cuối cùng sửa một điều tôi đã kết luận sai giữa task: tôi thấy
    `lechToiDaTheoTocDo`, `tranTheoKieu` và `phanLoaiHuong` **không có người
    gọi** ngoài `coHoc.test.ts` và đã định báo đó là "lỗ thứ chín" cùng loại.
    Phép đo bác: trần quay thân người của `huongNguoiMocSau` **đủ** để giữ cả
    AC-38.4 và AC-38.11 — không mốc nào trong 124.111 mốc vượt lề. Ba ký hiệu
    ấy không có người gọi vì **không cần**, không phải vì bị bỏ quên.

    Nên chênh lệch giữa hai bảng số không phải lỗi của mô hình, mà là chênh lệch
    giữa **vận tốc** và **dịch chuyển**, và nó có hai nguồn có tên:

      1. **`tachChen` đẩy người ra khỏi nhau SAU phép bước**, và phần đẩy ấy
         không đi qua trần nào. Đó là nguồn của 15 mốc AC-38.1(i) tới 9,96 m/s
         và phần lớn 255 mốc AC-38.2(tăng) tới 13,35 m/s².
      2. **Mốc thường cách nhau 1 giây, còn tích phân chạy 0,5 giây** — hai
         bước một mốc. Một người quay 85° ở mỗi bước (băng giữa của D123) thì
         giữa hai **mốc** đã quay 170°, trong khi AC-38.3 nói về "mốc ngay trước
         đó". Đó là nguồn của 443 + 860 mốc AC-38.3.

    Cả hai nằm **ngoài phạm vi T742** — T742 là task **đo**. Chúng được trình
    cho người dùng kèm con số, không tự sửa và cũng không tự nới ngưỡng.
  */

  it('5.980 hàng mỏng, 16 tình huống dày, 77 vi phạm', () => {
    expect(TEP.moc.hang.length).toBe(5980)
    expect(TEP.tinh_huong.length).toBe(16)
    expect(KQ.viPham.length).toBe(77)
  })

  it('AC-38.1 và AC-38.2: vỡ khi đo trên DỊCH CHUYỂN, dù vận tốc đúng trần', () => {
    expect(DEM.get('AC-38.1(i)')).toBe(33)
    expect(DEM.get('AC-38.1(ii)')).toBe(9)
    expect(DEM.get('AC-38.2(tăng)')).toBe(4)
    expect(DEM.get('AC-38.2(giảm)') ?? 0).toBe(0)
  })

  it('AC-38.3: cả hai vế đỏ ở độ phân giải MỐC', () => {
    expect(DEM.get('AC-38.3(i)')).toBe(5)
    expect(DEM.get('AC-38.3(ii)')).toBe(25)
  })

  it('AC-38.4(ngang) sạch hẳn, AC-38.11 còn đúng MỘT mốc', () => {
    /*
      Hai vế này đo lệch giữa hướng thân người và hướng di chuyển, và gần như
      mọi mốc lệch trước T814 đều là cú xô của `tachChen` trên những cặp đứng
      trùng điểm đích: `AC-38.4(ngang)` 7 → **0**.

      `AC-38.11` thì 7 → 0 ở bản giãn **3,5 m**, rồi **0 → 1** khi giãn lên
      **6,0 m**. Một mốc trên 27.012 mẫu. Nêu ra chứ không làm tròn xuống.
    */
    expect(DEM.get('AC-38.4(ngang)') ?? 0).toBe(0)
    expect(DEM.get('AC-38.11') ?? 0).toBe(1)
  })

  it('và tổng số vi phạm đúng bằng tổng từng vế — không vế nào bị đếm hai lần', () => {
    let tong = 0
    for (const ve of CAC_VE) tong += DEM.get(ve) ?? 0
    expect(tong).toBe(KQ.viPham.length)
  })

  /*
    Món nợ **không** là chuyện của riêng một mã trận: đo trên 5 mã cho
    **77 / 101 / 57 / 78 / 90** (trước T814: 1.606 / 1.678 / 1.557 / 1.615 /
    1.705). Phép kiểm chỉ canh **bậc độ lớn** của dải ấy, vì khẳng định năm con
    số chính xác là buộc phép kiểm chạy 5 trận đầy đủ (≈3 giây) mỗi lần ai đó
    chạy bộ test.
  */
  it('và nó ổn định quanh 100 trên một mã thứ hai, không phải chuyện của một mã', () => {
    const khac = doCoHoc(dungTepXuat(cauHinhMau(MA_TRAN_CO_DINH[1]!)))
    expect(khac.viPham.length).toBeGreaterThan(40)
    expect(khac.viPham.length).toBeLessThan(200)
  })
})

/*
  ====================================================================
  BỘ TEST NGƯỢC — MỖI NGƯỠNG BƠM MỘT MỐC SAI, ĐÒI ĐÚNG MỘT `ViPham`.
  ====================================================================

  Dựng một tệp **tối thiểu sạch** rồi bơm vào từng chỗ một, thay vì sửa tệp
  thật: trên tệp thật đã có 1.606 vi phạm, nên "đúng một" không nói được gì.

  ⚠️ **"Đúng một" phải đọc là "đúng một của VẾ ẤY", không phải "đúng một trong
  cả tệp"** — và đó là một sự thật về cơ học, không phải một chỗ nới lỏng. Một ô
  nhảy 9,5 m trong một giây **là** cả một vi phạm trần tốc độ **và** một vi phạm
  trần gia tốc: nó đi từ 0 lên 9,5 m/s. Đòi "đúng một trong cả tệp" là đòi một
  phép bơm không tồn tại.
*/

const SO_O = 25
const I_REF = 22
const I_AR1 = 23
const I_AR2 = 24

/** Toạ độ đứng yên của 25 ô: hai đội thành hai hàng, ba trọng tài đúng chỗ. */
function oDungYen(): { x: number; y: number }[] {
  const ra: { x: number; y: number }[] = []
  for (let i = 0; i < 11; i += 1) ra.push({ x: 30, y: 10 + i * 4 })
  for (let i = 0; i < 11; i += 1) ra.push({ x: 70, y: 10 + i * 4 })
  // Trọng tài chính: đúng `KHOANG_TRONG_TAI` mét khỏi quả bóng ở (50; 34).
  ra.push({ x: 50 + KHOANG_TRONG_TAI, y: 34 })
  // Hai trợ lý: ngang hàng hậu vệ cuối của nửa sân mình, đã kẹp vào trong sân.
  ra.push({ x: Math.max(30, LE_DUONG_BIEN_TRO_LY), y: LE_DUONG_BIEN_TRO_LY })
  ra.push({ x: Math.min(70, DAI_SAN - LE_DUONG_BIEN_TRO_LY), y: 68 - LE_DUONG_BIEN_TRO_LY })
  return ra
}

/** Một hàng khối mỏng ở giây `t`: mọi ô đứng yên, bóng trong chân ô 0. */
function hangSach(t: number): number[] {
  const hang: number[] = [t, 50, 34, 0, 0]
  for (const d of oDungYen()) hang.push(d.x, d.y, 0)
  return hang
}

/** Một tệp tối thiểu **sạch**: `soMoc` mốc cách nhau 1 giây, 0 vi phạm. */
function tepSach(soMoc = 4): TepXuat {
  const dk = dieuKienTuMaTran(MA)
  const o: string[] = []
  for (let i = 0; i < 22; i += 1) o.push(i < 11 ? `A${i}` : `B${i - 11}`)
  o.push(...MA_TRONG_TAI)
  return {
    dinh_dang: {
      phien_ban: 1,
      don_vi_do_dai: 'met',
      don_vi_thoi_gian: 'giay',
      goc_toa_do: 'test',
    },
    khoi_dau: {
      ma_tran: MA,
      doi_nha: 'nha',
      doi_khach: 'khach',
      quan_so: 11,
      thoi_luong_phut: 1,
      thoi_tiet: dk.thoiTiet,
      gio_toc_do: dk.tocDoGio,
      gio_huong: dk.huongGio,
      nguoi: [],
      o,
    },
    nhat_ky: [],
    moc: {
      khoa_bong: [...KHOA_BONG],
      khoa_nguoi: [...KHOA_NGUOI],
      hang: Array.from({ length: soMoc }, (_, i) => hangSach(i)),
    },
    tinh_huong: [],
  }
}

/** Vị trí cột `ten` của ô `i` trong một hàng, tra bằng TÊN. */
function cot(tep: TepXuat, i: number, ten: string): number {
  return (
    1 +
    tep.moc.khoa_bong.length +
    i * tep.moc.khoa_nguoi.length +
    tep.moc.khoa_nguoi.indexOf(ten)
  )
}
function cotBong(tep: TepXuat, ten: string): number {
  return 1 + tep.moc.khoa_bong.indexOf(ten)
}

/** Sửa một ô của một hàng, trả về một tệp mới. */
function sua(tep: TepXuat, h: number, cotSo: number, giaTri: number): TepXuat {
  const hang = tep.moc.hang.map((r, i) =>
    i === h ? r.map((v, c) => (c === cotSo ? giaTri : v)) : r,
  )
  return { ...tep, moc: { ...tep.moc, hang } }
}

/** Cho quả bóng tự do ở **mọi** mốc, để vế AC-38.6 có mẫu. */
function bongTuDo(tep: TepXuat): TepXuat {
  let ra = tep
  for (let h = 0; h < tep.moc.hang.length; h += 1) {
    ra = sua(ra, h, cotBong(ra, 'nguoi_giu'), KHONG_AI_GIU_TRONG_TEP)
  }
  return ra
}

/** Đòi **đúng một** vi phạm của vế `ve`, và trả nó về để kiểm con số. */
function dungMotCua(tep: TepXuat, ve: Ve) {
  const kq = doCoHoc(tep)
  const cua = kq.viPham.filter((v) => v.ve === ve)
  expect(
    cua.map((v) => `${v.o}@${v.giay}s ${v.doDuoc.toFixed(2)} ${v.ghiChu}`),
    `phải đúng MỘT vi phạm ${ve}`,
  ).toHaveLength(1)
  return cua[0]!
}

describe('bộ test NGƯỢC: tệp tối thiểu sạch (T742, AC-45.6)', () => {
  it('tệp tối thiểu KHÔNG có vi phạm nào — nếu không, mọi ca ngược vô nghĩa', () => {
    const kq = doCoHoc(tepSach())
    expect(kq.viPham.map((v) => `${v.ve} ${v.o}@${v.giay}s ${v.ghiChu}`)).toEqual([])
  })

  it('AC-38.1(i): bơm một ô đi 9,5 m trong 1 giây', () => {
    /*
      Hai mốc, không bốn: trên bốn mốc thì ô ấy **quay về** chỗ cũ ở mốc sau, và
      cú quay về cũng là 9,5 m/s — hai vi phạm cho một phép bơm.
    */
    const t = tepSach(2)
    const vp = dungMotCua(sua(t, 1, cot(t, 5, 'x'), 30 + 9.5), 'AC-38.1(i)')
    expect(vp.o).toBe('A5')
    expect(vp.doDuoc).toBeCloseTo(9.5, 6)
  })

  it('AC-38.1(i): và 8,9 m/s thì KHÔNG đỏ — ngưỡng đúng chỗ, không chặn oan', () => {
    const t = tepSach()
    const kq = doCoHoc(sua(t, 1, cot(t, 5, 'x'), 30 + 8.9))
    expect(kq.viPham.filter((v) => v.ve === 'AC-38.1(i)')).toHaveLength(0)
  })

  it('AC-38.1(ii): bơm một pha 8 m/s kéo dài 7 giây liên tục', () => {
    let t = tepSach(8)
    for (let h = 1; h < 8; h += 1) t = sua(t, h, cot(t, 5, 'x'), 30 + h * 8)
    const vp = dungMotCua(t, 'AC-38.1(ii)')
    expect(vp.doDuoc).toBeGreaterThan(4)
  })

  it('AC-38.1(ii): và một pha 8 m/s dài 3 giây thì KHÔNG đỏ', () => {
    let t = tepSach(8)
    for (let h = 1; h <= 3; h += 1) t = sua(t, h, cot(t, 5, 'x'), 30 + h * 8)
    for (let h = 4; h < 8; h += 1) t = sua(t, h, cot(t, 5, 'x'), 30 + 24)
    expect(doCoHoc(t).viPham.filter((v) => v.ve === 'AC-38.1(ii)')).toHaveLength(0)
  })

  it('AC-38.2(tăng): bơm một ô từ 1 m/s lên 8 m/s trong 1 giây', () => {
    let t = tepSach()
    t = sua(t, 1, cot(t, 5, 'x'), 31)
    t = sua(t, 2, cot(t, 5, 'x'), 39)
    const vp = dungMotCua(t, 'AC-38.2(tăng)')
    expect(vp.doDuoc).toBeCloseTo(7, 6)
  })

  it('AC-38.2(giảm): bơm một ô từ 8,5 m/s về 0 trong 1 giây', () => {
    const t = tepSach()
    const vp = dungMotCua(sua(t, 1, cot(t, 5, 'x'), 30 + 8.5), 'AC-38.2(giảm)')
    expect(vp.doDuoc).toBeCloseTo(8.5, 6)
  })

  it('AC-38.3(i): bơm một cú quay 180° ở 5 m/s', () => {
    let t = tepSach()
    t = sua(t, 1, cot(t, 5, 'x'), 35)
    t = sua(t, 2, cot(t, 5, 'x'), 30)
    const vp = dungMotCua(t, 'AC-38.3(i)')
    expect(vp.doDuoc).toBeCloseTo(5, 6)
    expect(vp.ghiChu).toContain('180°')
  })

  it('AC-38.3(i): và cú quay 180° ở 2 m/s thì KHÔNG đỏ — AC cho phép đúng thế', () => {
    let t = tepSach()
    t = sua(t, 1, cot(t, 5, 'x'), 32)
    t = sua(t, 2, cot(t, 5, 'x'), 30)
    expect(doCoHoc(t).viPham.filter((v) => v.ve === 'AC-38.3(i)')).toHaveLength(0)
  })

  it('AC-38.3(ii): bơm một cú quay 90° mà KHÔNG mất tốc', () => {
    let t = tepSach(3)
    t = sua(t, 1, cot(t, 5, 'x'), 34)
    t = sua(t, 2, cot(t, 5, 'x'), 34)
    t = sua(t, 2, cot(t, 5, 'y'), 10 + 5 * 4 + 4)
    const vp = dungMotCua(t, 'AC-38.3(ii)')
    expect(vp.doDuoc).toBeCloseTo(4, 6)
    expect(vp.nguong).toBeCloseTo(2.4, 6)
  })

  it('AC-38.3(ii): và quay 90° mà mất đúng 60% tốc thì KHÔNG đỏ', () => {
    let t = tepSach(3)
    t = sua(t, 1, cot(t, 5, 'x'), 35)
    t = sua(t, 2, cot(t, 5, 'y'), 10 + 5 * 4 + 3)
    expect(doCoHoc(t).viPham.filter((v) => v.ve === 'AC-38.3(ii)')).toHaveLength(0)
  })

  it('AC-38.4(lùi): bơm một ô đi 5 m/s ngược hẳn hướng mặt', () => {
    /*
      Bơm ở mốc **thứ ba**, không thứ hai: hai vế hướng mặt cần **hai** bước
      liền nhau để có `a` so với `b`, nên một phép bơm ở mốc thứ hai bị chính
      `if (h < 2) continue` bỏ qua — và nó bỏ qua **im lặng**.
    */
    let t = tepSach(3)
    t = sua(t, 2, cot(t, 5, 'x'), 25)
    const vp = dungMotCua(t, 'AC-38.4(lùi)')
    expect(vp.doDuoc).toBeCloseTo(5, 6)
    expect(vp.nguong).toBe(4)
  })

  it('AC-38.4(ngang): bơm một ô đi 5,5 m/s vuông góc hướng mặt', () => {
    let t = tepSach()
    t = sua(t, 1, cot(t, 5, 'y'), 10 + 5 * 4 + 5.5)
    t = sua(t, 1, cot(t, 5, 'huong_nguoi'), 0)
    const vp = dungMotCua(t, 'AC-38.4(ngang)')
    expect(vp.doDuoc).toBeCloseTo(5.5, 6)
  })

  it('AC-38.11: bơm hướng mặt lệch 100° khi đang đi 6 m/s', () => {
    let t = tepSach(3)
    t = sua(t, 1, cot(t, 5, 'x'), 36)
    t = sua(t, 2, cot(t, 5, 'x'), 42)
    t = sua(t, 2, cot(t, 5, 'huong_nguoi'), 100)
    const vp = dungMotCua(t, 'AC-38.11')
    expect(vp.doDuoc).toBeCloseTo(100, 6)
    expect(vp.nguong).toBe(60)
  })

  it('AC-38.6(dải): bơm quả bóng tự do đi 10,5 m/s — trong KHE giữa trần người và dải', () => {
    const t = bongTuDo(tepSach(2))
    const vp = dungMotCua(sua(t, 1, cotBong(t, 'x'), 50 + 10.5), 'AC-38.6(dải)')
    expect(vp.doDuoc).toBeCloseTo(10.5, 6)
    expect(vp.ghiChu).toContain('dưới')
  })

  it('AC-38.6(dải): và 35 m/s thì đỏ ở đầu TRÊN của dải', () => {
    const t = bongTuDo(tepSach(2))
    const vp = dungMotCua(sua(t, 1, cotBong(t, 'x'), 50 + 35), 'AC-38.6(dải)')
    expect(vp.ghiChu).toContain('vượt')
  })

  it('AC-38.6(dải): còn 18 m/s thì KHÔNG đỏ — nó nằm trong dải chuyền ngắn', () => {
    const t = bongTuDo(tepSach(2))
    const kq = doCoHoc(sua(t, 1, cotBong(t, 'x'), 50 + 18))
    expect(kq.viPham.filter((v) => v.ve === 'AC-38.6(dải)')).toHaveLength(0)
    expect(kq.soMau['AC-38.6(dải)']).toBe(1)
  })

  it('AC-38.6(thời gian bay): bơm một đường bóng ĐỔI tốc độ giữa đường bay', () => {
    let t = bongTuDo(tepSach(3))
    t = sua(t, 1, cotBong(t, 'x'), 50 + 15)
    t = sua(t, 2, cotBong(t, 'x'), 50 + 15 + 25)
    const vp = dungMotCua(t, 'AC-38.6(thời gian bay)')
    expect(vp.doDuoc).toBeCloseTo(10, 6)
  })

  it('AC-38.6(thời gian bay): còn tốc độ ĐỀU thì không đỏ, và vẫn có mẫu', () => {
    let t = bongTuDo(tepSach(3))
    t = sua(t, 1, cotBong(t, 'x'), 50 + 18)
    t = sua(t, 2, cotBong(t, 'x'), 50 + 36)
    const kq = doCoHoc(t)
    expect(kq.viPham.filter((v) => v.ve === 'AC-38.6(thời gian bay)')).toHaveLength(0)
    expect(kq.soMau['AC-38.6(thời gian bay)']).toBe(1)
  })

  /*
    ⚠️ **Ca "trọng tài ra 36 m" của điều kiện ra T742 KHÔNG đỏ được, và đây là
    chỗ nó được nói ra thay vì bị lặng lẽ đổi số.**

    Điều kiện ra của T742 được viết hôm **2026-11-23**, khi AC-38.10 mệnh đề (a)
    còn là một phép kiểm **tuyệt đối** trên khoảng cách **thật**: dải [15; 35] m,
    nên 36 m là một mốc sai đúng một mét. Hai lần làm rõ sau đó (câu 25 ngày
    2026-11-24 và câu 26 ngày 2026-11-25) đã **tách đích khỏi độ trễ**: (a) nay
    nói về chỗ trọng tài **nhắm tới** — thứ tệp không chứa — còn khoảng cách
    **thật** do mệnh đề **(d)** kẹp, với lề **50 m** quanh 25 m. Một trọng tài ở
    36 m lệch **11 m**, nằm gọn trong lề, nên nó **đúng theo AC hôm nay**.

    Phép kiểm dưới đây vì thế khẳng định **cả hai nửa** của sự thật ấy: 36 m
    **không** đỏ, và 80 m **có** đỏ. Nửa thứ hai chứng minh ngưỡng (d) còn răng;
    nửa thứ nhất là một **lệch có tên** so với điều kiện ra, trình cho người
    dùng chứ không tự chỉnh.
  */
  it('AC-38.10(d): trọng tài ra 36 m KHÔNG đỏ (AC đã sửa hai lần), ra 80 m thì đỏ', () => {
    const t = tepSach()
    const t36 = sua(t, 1, cot(t, I_REF, 'x'), 50 + 36)
    expect(doCoHoc(t36).viPham.filter((v) => v.ve === 'AC-38.10(d)')).toHaveLength(0)

    const t80 = sua(t, 1, cot(t, I_REF, 'x'), 50 + 80)
    const vp = dungMotCua(t80, 'AC-38.10(d)')
    expect(vp.doDuoc).toBeCloseTo(55, 6)
    expect(vp.o).toBe(MA_TRONG_TAI[0])
  })

  it('AC-38.10(c): bơm trợ lý thứ nhất lệch 40 m khỏi hàng hậu vệ cuối', () => {
    const t = tepSach()
    const vp = dungMotCua(sua(t, 1, cot(t, I_AR1, 'x'), 30 + 40), 'AC-38.10(c)')
    expect(vp.o).toBe(MA_TRONG_TAI[1])
    expect(vp.doDuoc).toBeCloseTo(40, 6)
  })

  it('AC-38.10(c): và trợ lý thứ HAI cũng được canh, không chỉ trợ lý thứ nhất', () => {
    const t = tepSach()
    const vp = dungMotCua(sua(t, 1, cot(t, I_AR2, 'x'), 70 - 40), 'AC-38.10(c)')
    expect(vp.o).toBe(MA_TRONG_TAI[2])
  })

  it('AC-38.9: bơm sai thời tiết, sai tốc độ gió, sai hướng gió — mỗi cái một dòng', () => {
    const t = tepSach()
    const khac = t.khoi_dau.thoi_tiet === 'kho' ? 'mua' : 'kho'
    expect(doCoHoc({ ...t, khoi_dau: { ...t.khoi_dau, thoi_tiet: khac } }).viPham).toHaveLength(1)
    expect(
      doCoHoc({
        ...t,
        khoi_dau: { ...t.khoi_dau, gio_toc_do: t.khoi_dau.gio_toc_do + 3 },
      }).viPham,
    ).toHaveLength(1)
    expect(
      doCoHoc({
        ...t,
        khoi_dau: { ...t.khoi_dau, gio_huong: (t.khoi_dau.gio_huong + 90) % 360 },
      }).viPham,
    ).toHaveLength(1)
  })

  /** Một khung dày tối thiểu, để bơm hai vế của AC-38.5. */
  function khungDay(trangThai: CauThuTrongKhung['trang_thai'], z: number): KhungDay {
    return {
      t: 0,
      bong: { x: 50, y: 34, z, vx: 0, vy: 0, vz: 0, nguoi_giu: 'A0' },
      cau_thu: [
        {
          id: 'A0',
          x: 50,
          y: 34,
          huong_nguoi: 0,
          toc_do: 0,
          trang_thai: trangThai,
          hanh_dong: null,
          muc_dich: null,
        },
      ],
      su_kien: null,
    }
  }

  it('AC-38.5(đánh đầu): bơm một cú đánh đầu ở z = 5 m', () => {
    const t = tepSach()
    const vp = dungMotCua(
      { ...t, tinh_huong: [{ phut: 1, khung: [khungDay('danh_dau', 5)] }] },
      'AC-38.5(đánh đầu)',
    )
    expect(vp.doDuoc).toBe(5)
  })

  it('AC-38.5(đánh đầu): và ở z = 1,2 m cũng đỏ — dải có HAI đầu', () => {
    const t = tepSach()
    const vp = dungMotCua(
      { ...t, tinh_huong: [{ phut: 1, khung: [khungDay('danh_dau', 1.2)] }] },
      'AC-38.5(đánh đầu)',
    )
    expect(vp.doDuoc).toBe(1.2)
  })

  it('AC-38.5(khống chế): bơm một người dẫn bóng khi bóng ở 3 m', () => {
    const t = tepSach()
    const vp = dungMotCua(
      { ...t, tinh_huong: [{ phut: 1, khung: [khungDay('dan_bong', 3)] }] },
      'AC-38.5(khống chế)',
    )
    expect(vp.doDuoc).toBe(3)
  })

  it('và khung dày HỢP LỆ thì không đỏ — hai vế có răng chứ không cắn bừa', () => {
    const t = tepSach()
    for (const [tt, z, ve] of [
      ['danh_dau', 2.15, 'AC-38.5(đánh đầu)'],
      ['dan_bong', 0, 'AC-38.5(khống chế)'],
    ] as const) {
      const kq = doCoHoc({ ...t, tinh_huong: [{ phut: 1, khung: [khungDay(tt, z)] }] })
      expect(kq.viPham, `${tt} z=${z}`).toEqual([])
      expect(kq.soMau[ve]).toBe(1)
    }
  })

  it('MỌI vế đo được từ tệp đều có một ca ngược đỏ được', () => {
    /*
      ⚠️ CHỐNG RỖNG của chính khối ngược này: danh sách dưới đây phải phủ
      **mười ba** vế, tức mọi vế trừ AC-38.7 (không có mẫu nào trong tệp — xem
      `VE_CHUA_CO_MAU`) và hai vế AC-38.10(a)/(b) không đo được từ tệp. Thiếu
      một vế là có một ngưỡng không ai chứng minh là đỏ được.
    */
    const coCaNguoc: readonly Ve[] = [
      'AC-38.1(i)',
      'AC-38.1(ii)',
      'AC-38.2(tăng)',
      'AC-38.2(giảm)',
      'AC-38.3(i)',
      'AC-38.3(ii)',
      'AC-38.4(lùi)',
      'AC-38.4(ngang)',
      'AC-38.5(đánh đầu)',
      'AC-38.5(khống chế)',
      'AC-38.6(dải)',
      'AC-38.6(thời gian bay)',
      'AC-38.9',
      'AC-38.10(c)',
      'AC-38.10(d)',
      'AC-38.11',
    ]
    expect(coCaNguoc).toHaveLength(16)
    expect(CAC_VE.filter((v) => !coCaNguoc.includes(v))).toEqual(['AC-38.7'])
  })
})

describe('phép đo ĐỘC LẬP thứ tự cột (T742, AC-45.6)', () => {
  /*
    Khối mỏng là **tuple**: nghĩa của cột thứ ba chỉ nằm ở hàng tiêu đề. Một
    phép đo đếm cột bằng tay sẽ im lặng đo nhầm đại lượng ngày ai đó đổi thứ tự
    — không đỏ, chỉ sai. Phép kiểm này đảo thứ tự **cả hai** khối khoá rồi đòi
    kết quả giống **từng con số**.
  */
  function daoCot(tep: TepXuat): TepXuat {
    const nguoiCu = tep.moc.khoa_nguoi
    const bongCu = tep.moc.khoa_bong
    const nguoiMoi = [...nguoiCu].reverse()
    const bongMoi = [...bongCu].reverse()
    const iNguoi = nguoiMoi.map((k) => nguoiCu.indexOf(k))
    const iBong = bongMoi.map((k) => bongCu.indexOf(k))
    const soO = (tep.moc.hang[0]!.length - 1 - bongCu.length) / nguoiCu.length
    const hang = tep.moc.hang.map((r) => {
      const ra: number[] = [r[0]!]
      for (const i of iBong) ra.push(r[1 + i]!)
      for (let o = 0; o < soO; o += 1) {
        const goc = 1 + bongCu.length + o * nguoiCu.length
        for (const i of iNguoi) ra.push(r[goc + i]!)
      }
      return ra
    })
    return { ...tep, moc: { khoa_bong: bongMoi, khoa_nguoi: nguoiMoi, hang } }
  }

  it('đảo thứ tự cột cho KẾT QUẢ Y NGUYÊN trên tệp thật', () => {
    const dao = daoCot(TEP)
    expect(dao.moc.khoa_nguoi).not.toEqual(TEP.moc.khoa_nguoi)
    expect(dao.moc.khoa_bong).not.toEqual(TEP.moc.khoa_bong)
    const kq = doCoHoc(dao)
    expect(kq.soMau).toEqual(KQ.soMau)
    expect(kq.viPham).toEqual(KQ.viPham)
  })

  it('và trên tệp tối thiểu đã bơm lỗi, vi phạm vẫn trỏ đúng ô ấy', () => {
    const t = tepSach()
    const xau = sua(t, 1, cot(t, 5, 'x'), 30 + 9.5)
    expect(doCoHoc(daoCot(xau)).viPham).toEqual(doCoHoc(xau).viPham)
    expect(doCoHoc(daoCot(xau)).viPham[0]!.o).toBe('A5')
  })

  it('thiếu một cột bắt buộc thì NÉM, không âm thầm đo cột khác', () => {
    const t = tepSach()
    expect(() =>
      doCoHoc({ ...t, moc: { ...t.moc, khoa_nguoi: ['x', 'y', 'khong_phai_huong'] } }),
    ).toThrow(/huong_nguoi/)
    expect(() =>
      doCoHoc({ ...t, moc: { ...t.moc, khoa_bong: ['x', 'y', 'z', 'ai'] } }),
    ).toThrow(/nguoi_giu/)
  })

  it('và `dt` lấy từ cột `t` chứ không viết cứng 1 giây', () => {
    const t = tepSach()
    // Hai mốc cách 0,5 giây: quãng 4 m thành 8 m/s, chưa vượt trần 9.
    let day = sua(t, 1, 0, 0.5)
    day = sua(day, 1, cot(day, 5, 'x'), 34)
    expect(doCoHoc(day).viPham.filter((v) => v.ve === 'AC-38.1(i)')).toHaveLength(0)
    // Cùng khoảng ấy, quãng 5 m trong 0,5 giây là 10 m/s — vượt.
    let vuot = sua(t, 1, 0, 0.5)
    vuot = sua(vuot, 1, cot(vuot, 5, 'x'), 35)
    expect(doCoHoc(vuot).viPham.filter((v) => v.ve === 'AC-38.1(i)')).toHaveLength(1)
  })
})

describe('phép đo THUẦN — cùng tệp ra cùng kết quả (T742, AC-37.5)', () => {
  it('gọi hai lần ra hai kết quả giống từng con số', () => {
    const a = doCoHoc(TEP)
    const b = doCoHoc(TEP)
    expect(a.soMau).toEqual(b.soMau)
    expect(a.viPham).toEqual(b.viPham)
  })

  it('và tệp tối thiểu đúng 25 ô, khớp bố cục của lô', () => {
    const t = tepSach()
    expect(t.khoi_dau.o).toHaveLength(SO_O)
    expect(t.khoi_dau.o[I_REF]).toBe(MA_TRONG_TAI[0])
    expect(t.khoi_dau.o[I_AR1]).toBe(MA_TRONG_TAI[1])
    expect(t.khoi_dau.o[I_AR2]).toBe(MA_TRONG_TAI[2])
  })
})
