# Tasks: Engine mô phỏng liên tục — toạ độ mét và cơ học chuyển động

| | |
|---|---|
| **Spec** | `./spec.md` (Status `Planned`, **30 AC**) |
| **Plan** | `./plan.md` (Status `Approved`, D117–D134, R51–R64) |
| **Tiến độ** | 44/53 — T813, **T814**, **T815**, **T760** và **T761** xong 2026-11-26. T814 gỡ **95%** món nợ cơ học của `T742` (1.613 → 77 vi phạm); T815 phá cái lưới ô vuông của đội hình; `T760` đạt ở lượt xem thứ hai; `T761` kiểm bằng mắt **3/4 mục đạt** và tìm ra một lỗi nhãn thời tiết đang chờ người dùng phân xử |
| **Nền đo** | commit `5c652eb`, engine v6, **1.304 test xanh / 63 file test** |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

> **Số task do `plan.md` mục 9 gán.** Bảy lát Phase 53–59, **48 task** T700–T762.
> **Tám số dùng thêm so với plan**, đều nằm trong khoảng trống plan đã chừa, và mỗi số có một
> lý do viết ra:
> - **T706, T717, T718** lấp **ba lỗ thật** của plan — ba file được plan nhắc nhiều lần ở sơ
>   đồ, ở quyết định và ở bảng Contracts mà **không task nào tạo**: `dienPha.ts`,
>   `hatGiong.ts`, `khongChepModel.test.ts`.
> - **T716** lấp một lỗ **CRITICAL**: `viTriTrongTai`, chủ sở hữu duy nhất của **AC-38.10**.
> - **T719** lấp một lỗ **kiến trúc**, tìm ra lúc implement T704: không tài liệu nào nói chế
>   độ liên tục cộng tỉ số và thống kê ở đâu. Người dùng chốt **bóc tiếp** (D135).
> - **T707/T708/T709** là phép chẻ `T705` cũ, vốn khai **12 file trải 5 tầng** — quá to theo
>   đúng luật "mô tả cần hơn 3 câu thì chẻ tiếp".
>
> ⚠️ **Số task KHÔNG đi đúng thứ tự phase, và đó là cố ý:** **T716** nằm ở **Phase 54** (nó
> sửa `coHoc.ts` cùng T713), còn **T717** và **T718** nằm ở **Phase 53** (chúng là nền và lưới
> cho mọi thứ sau). Người đọc quét theo số sẽ tưởng T71x thuộc Phase 54 — đi theo **tiêu đề
> phase**, đừng đi theo số.
>
> Bốn lỗ đầu đều cùng một hình dạng, và chúng được tìm ra bằng **một phép soát duy nhất**:
> grep từng ký hiệu của bảng Contracts (plan mục 5) trong `tasks.md`. Plan mục 9 đã được cập
> nhật cùng ngày. Các khoảng trống còn lại: T725–T729, T739, T746–T749, T755–T759.

> ## Điều kiện RA chung của mọi task chạm `src/engine/`
> Không task nào được tick nếu thiếu một trong năm điều này — chúng là lưới giữ **AC-45.2**,
> và đó là lời hứa duy nhất bảo vệ 20 trận đã lưu:
> 1. `npx vitest run src/engine/tuongThichEngine.test.ts src/engine/taiLap.test.ts src/services/phatLai.test.ts` — **xanh**.
> 2. `git diff --stat` cho thấy **ba file ấy 0 dòng sửa**. ⚠️ **Mỗi file bắt được một thứ khác nhau, đừng lẫn:**
>    - **`MOC_V6`** (393 dòng chuỗi **đóng băng** ở `tuongThichEngine.test.ts:55-459`, so từng ký tự và đòi `tongLech === 0`) là thứ **duy nhất** bắt được **thứ tự rút lệch** — vì `mauCau` và danh tính `cacCauThu` đều dẫn xuất từ dòng rút.
>    - **`taiLap.test.ts`** canh **tính tất định**, **không** canh thứ tự rút: dòng 41-43 là `expect(chay(ma), ma).toEqual(chay(ma))` — nó so engine với **chính nó** trong cùng một bản build, nên nếu thứ tự rút lệch thì **cả hai vế lệch y hệt nhau và nó vẫn XANH**. Cả 234 dòng của file ấy không có một giá trị vàng đóng băng nào. Nó vẫn là lưới thật cho **phi tất định** (nếu phép bóc làm engine phụ thuộc thứ tự duyệt khoá hay trạng thái dùng chung thì nó đỏ).
>    - **`phatLai.test.ts`** canh đường **dựng lại cấu hình từ bản ghi**.
> 3. `grep -n "PHIEN_BAN_ENGINE = " src/engine/tran.ts` → vẫn **6**; `DB_VERSION` vẫn **3**; `SCHEMA_VERSION` vẫn **5**.
> 4. `MOC_V6` (393 dòng ở `tuongThichEngine.test.ts`) **không sửa một ký tự**.
> 5. `npx tsc --noEmit` sạch — `tsconfig.json` bật `noUnusedLocals` + `noUnusedParameters`, nên một biến cục bộ bị bỏ lại sau phép bóc sẽ **vỡ ở `npm run build` chứ không vỡ ở test**.

> ## Ba lệnh cấm của plan mục 7 — áp cho đúng những task ghi tên chúng dưới đây
> 1. **CẤM** phép kiểm kiểu "mỗi pha tiêu đúng N lần rút" — `nguoiTaiVung` `return null`
>    **trước** `rng.next()`, nên năm bước gán người tiêu **0 lần rút** khi ứng viên rỗng.
>    *(T702, T715, T751)*
> 2. **CẤM** dẫn chú thích tự khai thứ tự rút ở `tran.ts` làm hợp đồng. Chứng minh duy nhất
>    được nhận là `MOC_V6` + `taiLap.test.ts`. *(T701, T704, T731)*
> 3. **CẤM** trích một con số không kèm lệnh dựng lại được và điều kiện đo. Từ 2026-11-23
>    lệnh này áp cho **mọi** con số đo được, không chỉ số thời gian. *(T700, T744, T752, T753)*

---

## Phase 53 — Nền tất định, phép bóc, và một trận liên tục xem được ở độ phân giải giây

- [x] **T700** [P] — Đo lại mốc nền v6 và ghi vào file ngân sách
  - File: `src/engine/hieuNang.test.ts`, `specs/007-continuous-match-engine/plan.md` (mục 2.3)
  - Xong khi: đầu `hieuNang.test.ts` có một khối chú thích ghi **cả hai** ngưỡng file ấy đang
    canh (`NGAN_SACH_MS = 200` ở dòng 19, và `NGAN_SACH_MS / 10 = 20 ms` cho `taoTran` ở dòng
    66 — plan nói "một ngưỡng" là **mô tả sai chính file ấy**), kèm **hai** lệnh dựng lại được
    và con số của mỗi lệnh: `npx vitest run src/engine/hieuNang.test.ts` và `npx vitest run`.
    Hai lệnh cho hai con số khác nhau vì hệ số nở song song **3,5 lần** — phải viết cả hai.
  - AC: — (nền đo cho T752, T753, T744)
  - Phụ thuộc: —
  - Ghi chú: `grep -rn NGAN_SACH src/` ra **đúng một** file hôm nay. "Các file ngân sách" là
    số ít cho tới T752.

- [x] **T701** — Bóc `quyetKetCucChuoi` + thêm `export` cho ba hàm, **bốn ký hiệu**
  - File: `src/engine/tran.ts`
  - Xong khi: `quyetKetCucChuoi(benNha, benKhach, sanTrungLap, quanSo, rng)` tồn tại **trong
    `tran.ts`** và `buocTiep` gọi nó; `thuRutThe`, `giamTheLuc`, `apHangDoi` có thêm chữ
    `export` và **không một dòng thân hàm nào bị viết lại**; năm điều kiện ra chung đều đạt.
  - AC: AC-45.2, và là nền của AC-45.3
  - Phụ thuộc: —
  - Ghi chú — ba sự thật đã đo, đừng phát hiện lại:
    - Khoảng bóc có **20 biến cục bộ** mà ~100 dòng **sau** nó còn đọc (`doi`, `benCong`,
      `benThu`, `kq`, `nguoi`, `thuMonThu` đọc lại ở 1559 và 1569, `gan`, …). Nên
      `KetCucPhaV6` là một object **~17 trường**, không phải một kết quả gọn.
    - `thuRutThe` được gọi ở **1584** — trong cùng vòng chuỗi nhưng **ngoài** khoảng bóc. Lần
      rút thẻ **ở lại** `buocTiep`; engine liên tục phải tự gọi `thuRutThe` đúng chỗ. Đây
      chính là chỗ thứ tự rút lệch được, và **`MOC_V6` là thứ duy nhất bắt được** —
      `taiLap.test.ts` **không** bắt được vì nó so engine với chính nó (xem điều kiện ra số 2).
    - `apHangDoi` chạy ở **1365**, **trước** `taoRngTuHatGiong` ở 1367, nên nó tiêu **0 lần
      rút**. Thêm `export` **không được** dịch biên ấy (D127, AC-45.4).

- [x] **T719** — Bóc `congPhaVaoTran`: **mối hàn thứ hai** (D135)
  - File: `src/engine/tran.ts`
  - Xong khi: `congPhaVaoTran(phut, tiSoVao, pha, rng, themUngVien)` tồn tại **trong
    `tran.ts`** và vòng chuỗi của `buocTiep` gọi nó; closure `themUngVien` nhận `tiSo` làm
    **tham số tường minh**; và năm điều kiện ra chung đều đạt — trong đó `MOC_V6` là thứ
    duy nhất chứng minh được rằng 62 dòng ấy đổi chỗ mà **không dịch một lần rút nào**.
  - AC: AC-45.2, và là **nền của AC-45.3** (hai bảng thống kê chỉ còn so được nếu chúng do
    cùng một đoạn code tính — R54)
  - Phụ thuộc: T701
  - Ghi chú — **task này không có trong bản đầu của `tasks.md`.** Nó sinh ra lúc implement
    T704: cả plan lẫn tasks đều không nói chế độ liên tục cộng tỉ số và thống kê bằng cách
    nào. Sau lời gọi `quyetKetCucChuoi` còn **190 dòng** trong `buocTiep` gọi **13 hàm**
    (`congThongKeCong`, `congThongKeThu`, `loaiCuaChuoi`, `duongBongCuaChuoi`,
    `diemCuaChuoi`, `nguoiThamGiaTinhHuong`, `nguoiDeMatBong`, `thuRutThe`, `moiKietSuc`,
    `nguongHuyTran`, `taoUngVien`, `gomUngVienCuaPhut`, `tongPhutHiep1`), và không task nào
    sở hữu chúng. Người dùng chốt **bóc tiếp** ngày 2026-11-23 — xem **D135** để biết ba
    phương án và vì sao hai phương án kia bị loại.
    ⚠️ **Phạm vi là 62 dòng TRONG vòng chuỗi, không phải cả 190.** Phần đuôi theo PHÚT
    (kiệt sức, huỷ trận, hạt giống, mẫu câu, dựng `sauTt`) dính chặt vào hình dạng
    `TrangThaiTran`, nên nó **chưa** bóc ở đây; ai dựng `tranLienTuc.ts` phải nói rõ nó
    dùng phần đuôi ấy thế nào, và đó là một câu hỏi còn mở.
    ⚠️ **Bẫy closure, đã tìm được trước khi viết:** `themUngVien` hiện đọc biến `tiSo` của
    `buocTiep` qua closure, và tỉ số được cộng **bên trong** phần sắp bóc. Nếu để nguyên
    closure thì ứng viên sự kiện chụp tỉ số **trước** bàn thắng, và dòng tường thuật lệch —
    `MOC_V6` sẽ đỏ. Vì thế `tiSo` thành tham số tường minh của `themUngVien`.
- [x] **T702** [P] — `nhayRut` + `BUOC_HAT_GIONG` vào `rng.ts`, ba dòng rút cách đều 2^30
  - File: `src/engine/rng.ts`, `src/engine/rng.test.ts`
  - Xong khi: phép kiểm **đẳng thức** `khoảng cách(i, j) = (j − i) · 2^30 mod 2^32` xanh trên
    20.000 mã do `taoMaTran` sinh, **và** ba vector cố định của `rng.test.ts`
    (`HAT_GIONG_ABC = 1106514475`, `NAM_SO_DAU_ABC`, `HAT_GIONG_ABC_SAU_5 = 1674408948`) vẫn
    đúng từng số sau khi thay `0x6d2b79f5` nội tuyến ở `rng.ts:43` bằng hằng số có tên.
  - AC: AC-37.5, AC-45.7
  - Phụ thuộc: —
  - Ghi chú — **BẪY ĐÃ ĐO BẰNG `node`, PHẢI DÙNG `Math.imul`:**
    `nhayRut = (hatGiong + soLan * BUOC_HAT_GIONG) | 0` là **SAI** ở đúng cách plan gọi nó.
    Tại `soLan = 2^30`: nhân thường cho `-2114711040`, `Math.imul` cho `-2114710997` — **lệch
    43**. Tại `soLan = 5754 · 2^30`: **lệch 781.781**. Lý do: `soLan × 0x6d2b79f5` vượt 2^53
    nên mất độ chính xác float. Phải là
    `(hatGiong + Math.imul(soLan, BUOC_HAT_GIONG)) | 0`. **Một phép kiểm đẳng thức chỉ chạy
    với `soLan` nhỏ sẽ XANH mà sai** — nên phép kiểm phải có ít nhất một ca ở `soLan ≥ 2^30`.
    (`rng.test.ts` đọc **source** của `rng.ts` qua `import.meta.glob('./rng.ts', {query:'?raw'})`
    ở dòng 13 và cấm `Math.random`/`Date.now`/`crypto` ở 167-180 — `Math.imul` không bị cấm.)

- [x] **T703** [P] — `engine/hinhHocSan.ts` + `ui/quyDoiMet.ts` (một hệ số đẳng hướng)
  - File: tạo `src/engine/hinhHocSan.ts`, `src/engine/hinhHocSan.test.ts`,
    `src/ui/quyDoiMet.ts`, `src/ui/quyDoiMet.test.ts`; sửa `src/ui/components/San2D.tsx`
    (thêm `export` cho `BAN_KINH`)
  - Xong khi: bốn đẳng thức xanh — hai ở **tâm** (52,5 m → x = **50,000**; 34 m → y =
    **32,000**) và **hai ở biên**, dựng từ `BAN_KINH` chứ không chép số: 0 m → x = **4,603**
    (= 50 − 52,5·0,864706) và 0 m → y = **61,400** (= 32 + 34·0,864706). ⚠️ **Chiều y bị đảo**
    (`plan.md` mục 6 AC-37.1: "`quyDoiMet.ts` **đảo dấu y** cho gốc góc dưới trái"), nên **0 m
    là mép DƯỚI** và nó cho y lớn; 68 m mới cho y = **2,600** (= `BAN_KINH`). Bản đầu của điều
    kiện này ghi "0 m → y = 2,600" — **sai mép**, và nó sẽ làm T703 đỏ ở chính điều kiện của
    mình. `TI_LE_MET` tính **một** hệ số `min(...) = 0,864706`. Và
    `test -f src/ui/quyDoiMet.ts && ! grep -q "2\.6" src/ui/quyDoiMet.ts` (hệ số phải đọc
    `BAN_KINH` chứ không chép số — khuôn `test -f &&` để điều kiện không thoả khi file chưa có).
  - ⚠️ **Hai đẳng thức tâm KHÔNG có răng, và `plan.md` D121 gọi chúng là "phép kiểm có răng"
    là sai.** `/analyze` chứng minh: (52,5; 34) là đúng tâm sân nên nó ánh xạ vào tâm ảnh
    (`RONG/2 = 50`, `CAO/2 = 32`) với **mọi** hệ số đẳng hướng — cả hai phương án plan đã loại
    (100/105 = 0,952381 và 64/68 = 0,941176) **cũng thoả**. Răng nằm ở hai đẳng thức **biên**:
    dưới 0,952381 thì x(0 m) = **0,000**, dưới 0,941176 thì **0,588**, so với **4,603**; và ở
    trục y, 0,941176 cho y(0 m) = **64,000** so với **61,400**.
  - AC: AC-37.1, AC-37.2, AC-38.8
  - Phụ thuộc: —
  - Ghi chú — hai thứ plan nói sai, đã kiểm:
    - **`BAN_KINH = 2.6` ở `San2D.tsx:147` KHÔNG export**, trong khi `RONG` (60) và `CAO` (61)
      thì **có**. Kết luận của D121 rằng "không ký hiệu nào trong `San2D.tsx` export được" là
      **sai** — file có ~20 export và `san2D.test.ts` đang import hơn 15 cái. Nên task này
      thêm `export` cho `BAN_KINH` thay vì sinh **bản sao thứ hai** của số 2,6.
    - **Hình học sân theo mét ĐÃ tồn tại một bản** — viết cứng trong thuộc tính SVG của
      `src/ui/components/SanBong.tsx`: `viewBox="0 0 68 105"`, vòng cấm
      `width="40.3" height="16"` ở dòng 42 và 47. **Độ sâu 16, không phải 16,5** như plan mục
      5 chốt, vì `SanBong` lùi sân vào 1,5 đơn vị. `SanBong.tsx` **không có file test nào**,
      nên không gì đỏ khi hai bản trôi khỏi nhau. T703 phải ghi ra trong chú thích rằng
      `hinhHocSan.ts` là nguồn sự thật và `SanBong.tsx` là một bản vẽ đã dịch — **không** sửa
      `SanBong.tsx` ở task này.

- [x] **T704** — `lienTuc/moc.ts` + `buocPhutLienTuc` trả lô + `loMoc` stride 8, 26 thực thể
  - File: tạo `src/engine/lienTuc/moc.ts`, `src/engine/lienTuc/moc.test.ts`,
    `src/engine/lienTuc/loMoc.ts`, `src/engine/lienTuc/loMoc.test.ts`,
    `src/engine/lienTuc/tranLienTuc.ts`; sửa `src/hooks/useMatch.ts` (ref ngoài React giữ
    lô) **và `src/engine/tran.ts`** — xem ghi chú phạm vi dưới
  - ⚠️ **Kiến trúc vòng phút: `buocTiep` + callback quan sát (D136), chốt 2026-11-23.**
    `taoTranLienTuc` đặt `hatGiong` về `hatGiongDong(ma, 1)` rồi `buocPhutLienTuc` gọi
    `buocTiep(tt, quanSat)`. Hai chế độ vì thế chạy **cùng một code luật** trên **hai dòng
    rút khác nhau** — AC-45.3 giữ nguyên từng chữ, và không một dòng luật nào bị chép.
    Phương án "tự dựng vòng phút" đã được chọn rồi bỏ trong cùng ngày, vì lý do loại nó ở
    D135 không đứng được: `buocTiep` lấy hạt giống thuần từ `tt.hatGiong`, không từ `maTran`.
  - ⚠️ **Phạm vi được nới một file, 2026-11-23, và đây là lý do.** Phần đuôi theo PHÚT mà
    `tranLienTuc.ts` cần (kiệt sức, huỷ trận, hạt giống, mẫu câu, dựng trạng thái) gọi sáu
    hàm của `tran.ts`, và đo ra **ba hàm chưa export**: `moiKietSuc`, `gomUngVienCuaPhut`,
    `taoUngVien` (ba hàm kia — `nguongHuyTran`, `tongPhutHiep1`, `hiepCuaPhut` — đã
    export). Nên T704 thêm **ba từ khoá `export`**, không viết lại một dòng nào, đúng khuôn
    T701 đã làm với bốn ký hiệu.
    **KHÔNG bóc phần đuôi thành mối hàn thứ ba:** nó chỉ dựng object và gọi các hàm đã có
    test, **không tính một con thống kê nào**, nên chép hình dạng của nó không sinh ra
    chuyện "hai bảng thống kê trôi khỏi nhau" mà R54 cảnh báo — khác hẳn 62 dòng tích luỹ
    của T719. Và trạng thái liên tục là một hình dạng KHÁC (nó **bọc** `TrangThaiTran` rồi
    thêm `chiSoMoc`), nên một mối hàn dùng chung sẽ phải rẽ nhánh cho cả hai — thêm ràng
    buộc chứ không bớt.
  - Xong khi: **phép kiểm dải rút mỗi mốc** mà `plan.md` mục 7 đòi, đo trên **một trận thật**
    (nó sống ở đây chứ không ở T717, vì T717 chạy **trước** khi có trận): với **mọi** mốc, số
    lần rút tiêu trong mốc ấy `<= RUT_MOI_MOC`. Cộng ba đẳng thức lưới xanh —
    `soBuoc === tongPhutTran(tt) * BUOC_MOI_PHUT`,
    `MOC_MOI_PHUT * 2 === BUOC_MOI_PHUT`, `MOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT === MOC_MOI_PHUT`;
    `npx vitest run src/engine/boundaries.test.ts` xanh **với 0 dòng sửa** ở file đó.
  - ⚠️ **Một món của T704 được HOÃN có tên, 2026-11-23: chỗ giữ ref ngoài React cho lô.**
    Nó nằm trong danh sách file của task nhưng **không** nằm trong dòng "Xong khi", và hôm
    nay nó không có **người đọc nào**: lớp vẽ chỉ nhận lô khi **T733** nới vòng rAF và
    **T709** truyền `anhChup` vào `San2D`. Cắm nó bây giờ là viết code nối dây **không có
    người đọc** vào đúng tầng mà **R52** nói không có một phép kiểm nào canh (`src/hooks`
    có bảy file, **0** file test) — tức một cái sai sẽ **xanh** và nằm đó ba lát cắt.
    Chuyển nó sang **T733** (nơi vòng rAF đọc lô) và **T709** (nơi `San2D` nhận prop), và
    **T761** là chỗ kiểm bằng mắt rằng đồng hồ mốc thật sự tiến. Ba món còn lại của "Xong
    khi" — phép kiểm dải rút trên một trận thật, ba đẳng thức lưới, `boundaries.test.ts`
    xanh với 0 dòng sửa — đều đã đạt, nên task được tick.
  - AC: AC-37.1, AC-37.5, AC-37.6, AC-37.7, AC-45.7
  - Phụ thuộc: T701, **T719**, T702, **T717**, T703
  - Ghi chú: `boundaries.test.ts:17` glob `./**/*.ts` là **đệ quy** nên `lienTuc/` tự vào phạm
    vi — đã kiểm bằng số học chứ không tin lời plan: `raNgoaiEngine` tính
    `duongDanFile.split('/').length - 2`, nên từ `./lienTuc/moc.ts` thì `'../tran'` là **trong**
    engine và `'../../domain/types'` là ra ngoài **nhưng được phép**. Vì thế `lienTuc/` phải ở
    **đúng một tầng** — một thư mục con nữa là vỡ. Lô là **đầu ra chỉ-ghi**; trạng thái mô
    phỏng sống trong float64 cục bộ (D119).

- [x] **T705** — `cheDoMoPhong` vào kiểu + `CauHinhTran`, và **hai đường dựng lại cấu hình**
  - File: `src/engine/tran.ts` (type `CheDoMoPhong` + `CauHinhTran` + `cauHinhDauLai` nhận tham
    số thứ ba), `src/services/phatLai.ts` (`cauHinhTuBanGhi` mang chế độ)
  - Xong khi: `npx vitest run src/engine/tran.test.ts src/services/phatLai.test.ts` xanh **với
    0 dòng sửa ở `phatLai.test.ts`**; và `TrangThaiTran` vẫn **đúng 16 trường** (D119) — chế độ
    **không** vào đó.
  - ⚠️ **Phạm vi nới hai file TEST, 2026-11-23, và đây là lý do.** Hiến pháp mục 4 bắt
    buộc unit test cho lớp engine **và** lớp đọc/ghi dữ liệu, nhưng danh sách file của task
    không có file test nào. Nên:
    1. **`src/engine/tran.test.ts`** nhận bảy ca mới (nó vốn đã nằm trong dòng "Xong khi").
    2. **`src/services/phatLai.cheDo.test.ts`** là file MỚI, không phải ca thêm vào
       `phatLai.test.ts` — file ấy là một trong **ba file mà `plan.md` mục 7 tuyên 0 dòng
       sửa**, tức một trong ba lưới giữ AC-45.2, và sửa nó là tự bỏ lưới.
    ✅ Đã kiểm sau khi xong: `git diff` của cả ba file bất khả xâm phạm là **rỗng**.
  - ⚠️ **Một phép kiểm ghi lại BẪY chứ không canh tính năng.** Vì chế độ không vào
    `TrangThaiTran`, `cauHinhDauLai` mà quên truyền chế độ sẽ lặng lẽ đấu lại một trận liên
    tục ở chế độ **cổ điển**. Có một ca khẳng định đúng điều đó, để nó là một sự thật được
    ghi chứ không phải một chỗ sập bất ngờ — và để T709 biết nó **phải** truyền chế độ từ
    `useMatch`.
  - AC: AC-45.1, AC-45.4
  - Phụ thuộc: T701
  - Ghi chú — **hai chỗ chế độ bị rơi im lặng, plan không liệt kê, và đây là cả nội dung task:**
    - `src/services/phatLai.ts:71` `cauHinhTuBanGhi` dựng `CauHinhTran` từ `TranDaLuu` và
      **không mang chế độ** → mở lại / phát lại một trận liên tục sẽ chạy ở chế độ cổ điển
      **mà không ai biết**. Năm phép kiểm đã đi qua đường ấy: `phatLai.test.ts:167, 186, 201,
      214, 791`.
    - `src/engine/tran.ts:1346` `cauHinhDauLai` dựng cấu hình từ `TrangThaiTran`, mà D119 đóng
      băng `TrangThaiTran` ở **đúng 16 trường** nên chế độ **không có ở đó**. Nơi gọi là
      `useMatch.ts:346` ("đấu lại") → **nút đấu lại mất chế độ** trừ khi `cauHinhDauLai` nhận
      tham số thứ ba. `tran.test.ts:62` và `:587` đã canh `quanSo`/`thoiLuong` đi qua đường
      này — **không ai canh chế độ**, nên task này phải thêm phép kiểm ấy.

- [x] **T706** — `lienTuc/dienPha.ts`: bốn pha con của **D126** lấp 20 giây một pha bóng
  - File: tạo `src/engine/lienTuc/dienPha.ts`, `src/engine/lienTuc/dienPha.test.ts`
  - Xong khi: `dienChuoiRaMoc(kq, boiCanh, rng, lo)` chẻ một pha thành bốn pha con có tên
    (`lenBong` 0–8 giây hấp thụ phần dư → `chuoi` → `ketCuc` → `bongChet`); **tổng thời lượng
    mỗi phút khớp đúng 60 giây** trên 20 mã; và **không** đường chuyền nào dưới sàn 12 m/s của
    AC-38.6.
  - ⚠️ **BẢNG BÓNG CHẾT CỦA `plan.md` MỤC 3.1 KHÔNG VỪA CỬA SỔ 20 GIÂY — đo được
    2026-11-23.** Bảng cho `pham-loi` **20 giây** (trọn cửa sổ, nên hành động còn **0
    giây**) và `dut-diem` **30 giây** (**vượt** cửa sổ 10 giây). Tần suất đo trên 20.000
    chuỗi: mất bóng **62,85%** | bóng ra ngoài **17,40%** | phạm lỗi **14,29%** | dứt điểm
    **5,46%** — nên **19,75% số pha, một phần năm, không vừa cửa sổ của nó.**
    Kỳ vọng thì bảng ĐÚNG: 7,11 giây một pha, khớp con số 7,35 plan ghi. Chỗ sai không phải
    giá trị trung bình mà là **bố cục từng pha**.
    **Cách xử đã chọn: cắt theo cửa sổ** — `bongChet` kẹp xuống `40 − TOI_THIEU_HANH_DONG`
    bước. Hai phương án bị loại: (a) **tràn sang chuỗi sau** phá ba thứ đã viết và đã có
    test (`chuoiCuaMoc` của `moc.ts`, đơn vị "cả cửa sổ chuỗi 20 giây" của D124/T731, lô một
    phút của `loMoc`); (b) **đổi bốn con số** đi ngược quyết định câu 1 ngày 2026-11-23 (giữ
    chúng trong plan) và spec 008 sẽ THAY cả định nghĩa "bóng chết" khi mang luật IFAB vào.
    **Cái giá, bằng số và có phép kiểm canh:** kỳ vọng bóng chết tụt từ **7,11** xuống
    **5,77** giây một pha, nên bóng lăn tăng từ **~61,6** lên **~68,1** phút. Spec 010 muốn
    **55–60**, nên phép cắt đẩy con số **xa hơn** khỏi đích. Một con số để **báo**, không
    phải chỗ tự nới — spec 010 sở hữu nó.
  - ⚠️ **Phạm vi nới hai file, 2026-11-23:** `tranLienTuc.ts` và `tranLienTuc.test.ts`.
    `dienChuoiRaMoc` mà không ai gọi là code chết, và `buocPhutLienTuc` của T704 đang ghi
    mốc bằng tay. Cắm nó vào làm **AC-37.6 bắt đầu có thật**: trong `bongChet` thì không ai
    giữ bóng, ba pha con kia thì người của bên tổ chức giữ — ba phép kiểm mới canh điều đó,
    gồm hai phép **chống tầm thường** (phải CÓ mốc có người giữ, và ô người giữ phải là một
    người **có mặt** trên sân).
  - ⚠️ **Chữ ký lệch `plan.md` mục 5, nêu chứ không im:** contract ghi
    `dienChuoiRaMoc(kq, boiCanh, rng, lo)`. Thực tế là
    `(pha: KetCucPhaV6, chiSoMocDau, lo, chiSoNguoiGiu, coMatCuaO)`: `boiCanh` đã nằm trong
    `pha`, và `rng` **chưa có việc gì làm** khi chưa có chuyển động — nó vào khi Phase 54 tới.
  - ⚠️ **Một mệnh đề của "Xong khi" KHÔNG làm được ở đây:** "không đường chuyền nào dưới sàn
    12 m/s của AC-38.6" cần tốc độ bóng, mà tốc độ bóng là `vatLyBong.ts` của **T720**. Nó
    là điều kiện ra của T720, không phải của task này.
  - AC: AC-37.4, AC-37.7, **AC-37.6** (ai giữ bóng ở từng mốc)
  - Phụ thuộc: T704
  - Ghi chú — **task này không có trong `plan.md` mục 9, và đó là một lỗ của plan.** `dienPha.ts`
    được plan nhắc **ba lần** (sơ đồ mục 3 dòng 187, quyết định **D126**, bảng Contracts
    `dienChuoiRaMoc`) nhưng **không task nào tạo nó**. Nó là cơ chế duy nhất làm bóng và người
    đổi chỗ **giữa** hai mốc quyết định, tức là chính thứ Phase 53 hứa "xem được ngay" — thiếu
    nó thì 20 giây của một pha không có gì lấp. Đã thêm vào plan mục 9 cùng ngày.

- [x] **T707** [P] — Khoá chế độ liên tục khi quân số ≠ 11
  - File: `src/engine/batDau.ts` (nhánh thứ năm của `LyDoKhongBatDau` + kiểm trong
    `kiemTraBatDauDuoc`), `src/engine/batDau.test.ts`
  - Xong khi: test thuần trên `kiemTraBatDauDuoc` cho **cả 7** giá trị của `CAC_QUAN_SO` — 11
    thì đi được, 5–10 thì trả đúng lý do mới; và `npx vitest run src/engine/batDau.test.ts`
    xanh.
  - ⚠️ **Phạm vi nới ba file, 2026-11-23, và `tsc` BẮT BUỘC phải thế.**
    `cauLyDo` ở `src/ui/pages/ChonCapDau.tsx:571` là một `switch` **vét cạn, không có
    `default`**, và hàm trả `string`. Nên thêm nhánh thứ năm vào `LyDoKhongBatDau` làm
    **`tsc` đỏ ngay** (TS2366) — T707 không thể sạch một mình. Vì thế cặp chuỗi vi/en và
    nhánh `switch` vào **cùng commit** này, đúng điều **P8** đòi ("một chuỗi hiển thị mới
    MUST kèm cả hai ngôn ngữ trong CÙNG MỘT commit"). Soát chéo của `/analyze` đã dự đúng
    chỗ này (phát hiện LOW số 49). Ba file thêm: `src/ui/ngonNgu/vi.ts`,
    `src/ui/ngonNgu/en.ts`, `src/ui/pages/ChonCapDau.tsx`. T709 giữ phần **nhóm radio**.
  - ✅ **`ngonNgu.test.ts` tự động canh cặp chuỗi mới, 0 dòng sửa** — đúng cái cơ chế
    `TEN_KHOI = Object.keys(BO_CHUOI.vi)` mà bảng phạm vi đã nêu.
  - ⚠️ **Phép kiểm đi qua CẢ BẢY giá trị của `CAC_QUAN_SO`, không chỉ một.** Lý do khoá là
    hình học sân, và hình học ấy đúng ở **đúng một** quân số. Một phép kiểm chỉ thử sân 7 sẽ
    xanh cả khi điều kiện viết là `quanSo < 11` — và lúc ấy một sân 12 người (nếu spec sau
    mở ra) lọt qua. Cộng ba ca chống tầm thường: cả bảy quân số **đi được** ở chế độ cổ điển
    (khoá không lan ra), không khai chế độ thì không khoá, và khoá nói **cùng lúc** với lý
    do khác chứ không che chúng.
  - AC: AC-45.8, và P8
  - Phụ thuộc: T705

- [x] **T708** [P] — Chế độ vào bản ghi, tệp sao lưu, và hai hàm đọc
  - File: `src/storage/db.ts` (`TomTatTran` + một trường tuỳ chọn),
    `src/services/matchRepo.ts` (`dienMacDinh`, `tomTatCua`, thêm `cheDoCua` +
    `phienBanEngineHienTaiCua`), `src/services/matchRepo.test.ts`,
    `src/services/backupSchema.ts`, `src/services/backupService.test.ts` (+1 ca)
  - Xong khi: `DB_VERSION` vẫn **3** và `SCHEMA_VERSION` vẫn **5**; ca mới chứng minh một trận
    v5 **không có** `cheDoMoPhong`, nhập ở chế độ `'thay-the'`, đọc ra `'co-dien'` (P7); và
    `npx vitest run src/services/` xanh.
  - AC: AC-45.4, AC-45.1
  - ⚠️ **Hai ca vòng xuất–nhập là VACUOUS với dòng schema — đã đo.**
    `TranDaLuuSchema` kết bằng `.passthrough()` (`backupSchema.ts:243`) và `.extend()`
    giữ nguyên nết ấy, nên một trường **không khai** trong schema vẫn đi qua tệp nguyên
    vẹn: xoá hẳn dòng `cheDoMoPhong` của schema mà **58/58 vẫn xanh**. Vì thế file nhận
    **ba** ca chứ không phải "+1": ca thứ ba cho một tệp mang chế độ lạ `'ba-chieu'` và
    đòi `importAll` **từ chối** với mã `SchemaInvalid`. Đột biến lại: bỏ dòng schema →
    **đúng ca ấy đỏ** (1 failed / 59). Đó là giá trị thật của việc khai trường ở schema —
    không phải để tệp mang được chế độ, mà để chế độ lạ **không** lọt vào IndexedDB rồi
    nằm chờ làm vỡ một `switch` về sau.
  - ✅ **Ca BẪY có gánh thật, đã đột biến kiểm.** Đổi đường rẽ sớm của `dienMacDinh` về
    hai trường (bỏ điều kiện thứ ba) → **đúng một** ca đỏ, và là đúng ca BẪY
    (1 failed / 32). Không có ca ấy thì bản ghi của spec 002–006 trả về sớm với chế độ
    vẫn `undefined`.
  - ⚠️ **`exportAll` trả về ZIP, không phải JSON.** `JSON.parse(await tep.text())` ném
    `Unexpected token 'P', "PK"...`. Ca từ chối phải mở manifest rồi gói lại bằng
    `docZip` + `taoZip` — đúng đường mà ca "tệp lỗi ở BẢN GHI CUỐI"
    (`backupService.test.ts:380`) đã đi.
  - ✅ **`src/storage/migrations.ts` 0 dòng sửa** — đúng điều ghi chú trên đòi: chỗ điền
    mặc định vẫn chỉ có **một**, ở `dienMacDinh`, chứ không mọc thêm chỗ thứ hai ở
    `nangV4LenV5`. Một tệp v4 nhập vào thiếu chế độ thì `dienMacDinh` điền lúc ĐỌC.
  - 📏 **Đo được**: `DB_VERSION` 3, `SCHEMA_VERSION` 5 (`migrations.ts:22`) — cả hai 0 dòng
    sửa. Toàn bộ: **72 file / 1443 phép kiểm xanh** (trước T708 là 1432). Ba file mà
    `plan.md` mục 7 tuyên 0 dòng sửa — `tuongThichEngine.test.ts`, `taiLap.test.ts`,
    `phatLai.test.ts` — `git diff --stat` **rỗng**.
  - Phụ thuộc: T705
  - Ghi chú: `src/storage/migrations.ts:97` `nangV4LenV5` là **chỗ thứ hai** dễ điền mặc định
    nhầm, và chú thích `matchRepo.ts:25-34` nói rõ chỗ điền mặc định chỉ được có **một** —
    task này **không** thêm chỗ thứ hai, nó mở đường rẽ sớm của `dienMacDinh`.

- [x] **T709** — Nhóm radio chọn chế độ + chuỗi song ngữ + `San2D` đón `anhChup?`
  - File: `src/ui/pages/ChonCapDau.tsx`, `src/ui/ngonNgu/vi.ts`, `src/ui/ngonNgu/en.ts`,
    `src/ui/components/San2D.tsx` (`Props` + `anhChup?`), `src/ui/pages/TrangTran.tsx`,
    `src/hooks/useMatch.ts` (`dungBanGhi` ghi chế độ vào bản ghi),
    `src/engine/lienTuc/tranLienTuc.ts` + `.test.ts` (số 101 + `cheDoCuaTrangThai`),
    `src/services/matchRepo.test.ts`, `src/ui/pages/TrangLichSu.tsx` (cửa gác — ngoài danh sách gốc)
  - Xong khi: `npx vitest run src/ui/ngonNgu/ngonNgu.test.ts` xanh **với 0 dòng sửa ở file
    ấy**; `npx tsc --noEmit` sạch; và lý do khoá hiện **bằng chữ** theo ngôn ngữ đang chọn
    (tiền lệ `TrangLichSu.tsx:271-292`).
  - AC: AC-45.1, AC-45.8, và P8 + P9
  - ✅ **CHẶN 3 ĐÃ CHỮA, người dùng chốt "đặt 101" ngày 2026-11-23.**
    `taoTranLienTuc` đặt `phienBanEngine: PHIEN_BAN_ENGINE_LIEN_TUC`, và chế độ được
    **dẫn xuất** qua `cheDoCuaTrangThai(tt)` mới ở `tranLienTuc.ts` thay vì cất ở store —
    `TrangThaiTran` vẫn **đúng 16 trường** (D119), và không có nguồn sự thật thứ hai để
    lệch. `useMatch.dungBanGhi` ghi `cheDoMoPhong: cheDoCuaTrangThai(tt)`, `dauLai` truyền
    nó làm tham số thứ ba của `cauHinhDauLai`.
    **Ba ca đã ĐỎ trước khi dòng sửa tồn tại**, in ra đúng triệu chứng
    `expected 'khac-phien-ban-engine' to be null` — tức nút đấu lại đã thật sự mất.
  - ⚠️ **Ca TRÔNG NHƯ SAI mà đúng**: cấu hình khai `cheDoMoPhong: 'lien-tuc'` đưa cho
    `taoTran` vẫn đọc ra `'co-dien'`. Chế độ của bản ghi nói **engine nào đã chạy**, không
    nói người dùng đã bấm gì — vì chính `phienBanEngine` ấy là thứ `lyDoKhongDauLai` so.
    Ghi lựa chọn của người dùng vào thì sinh ra bản ghi mang nhãn "liên tục" cùng số 6, và
    nó **không đấu lại được**: một bản ghi nói dối về chính nó. Ca này **đổi vế khi T733
    đến** — lúc ấy nó là chỗ nhắc rằng đường nối đã xong.
  - 📏 **Kiểm tay trên app thật, vì `src/hooks` có 7 file và 0 phép kiểm (R52).**
    `dungBanGhi` **không export** và không file test nào chạm nó — chỉ ba file lấy hằng
    `MS_MOI_PHUT` từ `useMatch`. Nên dòng mới ấy **không có phép kiểm tự động nào canh**;
    đã kiểm bằng cách chạy hết trận rồi đọc thẳng IndexedDB:
    - bản ghi lưu TRƯỚC thay đổi: `phienBanEngine: 6`, **không có** trường chế độ;
    - bản ghi lưu SAU thay đổi: `cheDoMoPhong: "co-dien"`, `phienBanEngine: 6`;
    - chọn **Liên tục** rồi chạy hết trận → bản ghi vẫn `"co-dien"` + 6, **nhất quán**
      (engine liên tục chưa nối vào giao diện);
    - mở bản ghi **không có** trường chế độ trong lịch sử → nút "Đấu lại trận này" **còn
      và không khoá**, không cảnh báo phiên bản — T708 đúng trên dữ liệu thật.
  - ➡️ **CHẶN 1 chuyển sang T714.** `anhChup?: AnhChupMet | null` và kiểu `AnhChupMet` đi
    theo task ấy — nơi `viTriVe.ts` sinh toạ độ và `San2D.tsx` đọc chúng, tức nơi kiểu có
    **cả chủ lẫn người đọc**. Cùng lý lẽ mà T704 đã hoãn chỗ giữ ref: nối dây không người
    đọc, vào đúng tầng mà R52 nói không phép kiểm nào canh.
  - 🚪 **CỬA GÁC: `TrangLichSu.tsx:73` phải sửa, nếu không "đặt 101" KHÔNG ĐỔI GÌ.**
    Dòng ấy truyền thẳng `PHIEN_BAN_ENGINE` (= 6) vào `lyDoKhongDauLai`, và theo chú thích
    ngay trên nó thì đây là **chỗ duy nhất** trong ứng dụng gọi hàm ấy — dùng chung cho cả
    "đấu lại" lẫn "rẽ nhánh". Nên engine có đóng dấu 101 đúng tới đâu cũng vô ích.
    Đã đo trên app thật, nhét một bản ghi `phienBanEngine: 101, cheDoMoPhong: "lien-tuc"`
    thẳng vào IndexedDB:
    - **chưa sửa**: "Đấu lại trận này" `disabled`, số nút "Rẽ nhánh" **0**, và hiện hai câu
      "…chạy bằng phiên bản engine **cũ hơn**…";
    - **đã sửa**: nút đấu lại mở, **87** nút rẽ nhánh, không một câu cảnh báo nào.
    Đây là **một file ngoài danh sách của T709** — làm vì không có nó thì phần việc người
    dùng vừa chốt nằm đó mà không chạm tới ai, và trận liên tục còn bị khoá kèm một câu nói
    SAI. Sửa: hỏi `phienBanEngineHienTaiCua(cheDoCua(dangMo))` thay cho số đặt cứng.
  - 🐞 **Câu từ chối nói "engine CŨ HƠN" trong khi phép so chỉ biết "KHÁC" — chưa chữa.**
    Đã thấy tận mắt ở ca đo trên: bản ghi mang **101** (mới hơn 6) mà câu hiện ra là "chạy
    bằng phiên bản engine cũ hơn". `lyDoKhongDauLai` chỉ trả `khac-phien-ban-engine`, không
    mang chiều. Hôm nay sửa cửa gác xong thì câu ấy không còn gặp bản ghi 101 nữa, nên nó
    chỉ lộ ra ở lần nâng phiên bản sau. Là việc của **chuỗi song ngữ** (P8, hai file).
  - 🧪 **Bài học về cách chạy soát chéo: subagent CÓ QUYỀN GHI đã sửa cây làm việc.**
    Vòng soát chéo lần này sửa **ba** chỗ mà không ai yêu cầu, và không hoàn nguyên:
    (1) `tran.ts:427` thành `cauHinh.cheDoMoPhong === 'lien-tuc' ? 101 : PHIEN_BAN_ENGINE`
    — vừa ngoài phạm vi vừa **sai**, vì `taoTran` là hàm dựng của v6 nên nó sẽ đúc ra một
    trận chạy bằng v6 mà tự nhận là liên tục; (2) xoá hẳn dòng `cheDoMoPhong:` trong
    `dungBanGhi`, chỉ chừa chú thích; (3) moi ruột `cheDoCuaTrangThai` thành
    `return CHE_DO_MAC_DINH`. Hai trong số đó rồi được chính các agent khác **báo lại như
    phát hiện CRITICAL** — tức vòng soát tự tạo ra lỗi rồi tự tìm thấy nó.
    Đã hoàn nguyên cả ba và dựng lại bằng chính script đã dùng, rồi chạy lại từ đầu.
    **Lần sau: commit TRƯỚC khi soát, hoặc cho agent soát chạy trong worktree riêng.**
  - 🐞 **LỖI CÓ SẴN tìm được khi dò đường đấu lại — KHÔNG thuộc T709, chưa chữa.**
    `App.tsx:91` dựng cấu hình đấu-lại-từ-lịch-sử **bằng tay với đúng năm trường**, không
    qua `cauHinhTuBanGhi` — và `cauHinhTuBanGhi` **không có một chỗ gọi sản phẩm nào**,
    chỉ test gọi. Thiếu `quanSo` và `thoiLuong`, mà `taoTran` mặc định về 11/90. Đã đo
    trên một trận sân 5: `batDauTranNgay` trả
    `[{loai:"chua-du-chinh",soCo:5,soCan:11}, …]` chứ không `null`, nên `App.tsx:98`
    `if (loi === null)` không chạy và nút **"Đấu lại trận này" không làm gì cả** — im lặng,
    không báo lỗi. Có từ spec 002, và chế độ mô phỏng sẽ mất trên đúng đường ấy.
  - ⏳ **MỚI LÀM MỘT TRONG BA PHẦN, 2026-11-23.** Phần nhóm radio + chuỗi song ngữ đã
    xong và **đã xem bằng mắt** (xem dưới). Hai phần còn lại **chặn vì lỗ của plan**, mô tả
    ngay sau đây — chưa tick.
  - ✅ **Phần đã xong: nhóm radio.** `cheDoDaChon` (người dùng bấm) tách khỏi `cheDoDung`
    (thứ vào cấu hình), **dẫn xuất chứ không `useEffect`**: chọn "Liên tục" ở sân 11 rồi hạ
    xuống sân 7 thì lựa chọn cũ **không** theo xuống — nếu theo thì `taoTran` **ném lỗi**
    (T707). Đo trên app thật ở sân 7: `lien-tuc` `disabled`, `co-dien` `checked`, và
    `role="status"` mang đúng câu "…chỉ chạy được ở sân 11 người; trận này đang là sân 7…";
    quay về 11 thì mở khoá lại **và nhớ lựa chọn cũ**. 0 lỗi console. Câu giải thích dùng
    lại đúng chuỗi `lienTucChiSan11` của T707 nên chỉ có **một** bản dịch.
    `ngonNgu.test.ts` **0 dòng sửa**, 235 xanh — và đã đột biến kiểm nó thật sự phủ năm
    khoá mới (bỏ một dấu tiếng Việt vào bản EN → đỏ đúng khối `CHON_CAP_DAU`).
  - 🛑 **CHẶN 1 — `AnhChupMet` KHÔNG CÓ CHỦ.** `plan.md` nhắc kiểu này ở D121, ở sơ đồ mục 3
    và ở diff mục 4.1, nhưng `tasks.md` **không nhắc tên nó một lần nào** trong cả 48 task,
    và `grep -rn AnhChupMet src/` **rỗng**. Cộng thêm: hôm nay prop ấy **không có người sản
    xuất lẫn người đọc** — người đọc chỉ xuất hiện ở **T714** (tạo `viTriVe.ts`, sửa
    `San2D.tsx`) và **T733** (nới vòng rAF). Đây đúng hình dạng món mà **T704 đã hoãn có
    tên** vì cùng lý do: nối dây không người đọc, vào đúng tầng mà **R52** nói không một
    phép kiểm nào canh. **Đề nghị**: hoãn sang **T714**, nơi kiểu có cả chủ lẫn người đọc.
  - 🛑 **CHẶN 2 — `dungBanGhi` KHÔNG BIẾT ĐƯỢC chế độ.** Nó đọc từ `TrangThaiTran`, mà
    `TrangThaiTran` **đóng băng ở đúng 16 trường** (D119) và **không** mang chế độ.
    `cauHinhDauLai(hienTai, ma)` ở `useMatch.ts:346` vướng đúng chuyện ấy — tham số thứ ba
    của T705 không có gì để truyền vào. Chỗ nhớ tự nhiên là store, mà `src/store/` **không**
    nằm trong danh sách file của T709.
  - 🛑 **CHẶN 3 — và đây là một LỖI ĐO ĐƯỢC, không phải câu hỏi thiết kế.**
    `taoTranLienTuc` (`tranLienTuc.ts:75`) gọi `taoTran` rồi chỉ đè `hatGiong`, nên
    `tran.phienBanEngine` **vẫn là 6** — đã đo bằng một trận thật, in ra **6**. Nhưng
    `phienBanEngineHienTaiCua('lien-tuc')` trả **101**, và `lyDoKhongDauLai`
    (`matchRepo.ts:246`) so bằng `!==`. Hệ quả: **mọi** trận liên tục vừa lưu xong là
    **mất ngay nút đấu lại** với lý do `khac-phien-ban-engine` — đúng thứ mà T708 vừa dựng
    hai số phiên bản riêng để **tránh**.
    👉 Và chữa CHẶN 3 chữa luôn CHẶN 2: nếu `taoTranLienTuc` đặt
    `phienBanEngine: PHIEN_BAN_ENGINE_LIEN_TUC` thì `dungBanGhi` **dẫn xuất** chế độ từ
    `tt.phienBanEngine` — không thêm trường vào `TrangThaiTran`, không thêm state vào store,
    không có hai nguồn sự thật để lệch nhau. Giá: chạm `tranLienTuc.ts`, là file của **T704
    đã tick**.
  - Phụ thuộc: T707, T708
  - Ghi chú — hai thứ tự động và một thứ bắt buộc:
    - `ngonNgu.test.ts:65` đặt `TEN_KHOI = Object.keys(BO_CHUOI.vi)` rồi sinh một describe
      **cho từng khối**, dò đường dẫn khoá **đệ quy**. Thêm khoá vào `CHON_CAP_DAU` /
      `LY_DO_KHONG_BAT_DAU` là **tự động** thêm bốn khẳng định: không khoá nào lệch vi↔en,
      không khoá nào rỗng, cùng khoá thì cùng kiểu, bản EN không còn dấu tiếng Việt.
    - `en.ts` khai `BanDich<typeof ..._VI>` nên thiếu một khoá là **lỗi `tsc`**, không phải lỗi
      test.
    - `src/ui/pages/TrangTran.tsx:415-433` là **nơi gọi `San2D` duy nhất** — `anhChup` phải là
      prop **tuỳ chọn**; nếu bắt buộc thì nó đỏ ở đây. Repo **chưa từng** `disabled` một
      `<option>` (40 chỗ `disabled` trong `src/ui`, không chỗ nào trên `<option>`), nên D134
      chọn **nhóm radio**.

- [x] **T717** — `lienTuc/hatGiong.ts`: ba dòng rút có nhà, và **dải mỗi mốc** có lưới
  - File: tạo `src/engine/lienTuc/hatGiong.ts`, `src/engine/lienTuc/hatGiong.test.ts`
  - Xong khi: bốn ký hiệu của **D118** tồn tại — `hatGiongDong`, `hatGiongMoc`,
    `LECH_DONG = 2 ** 30`, `RUT_MOI_MOC = 64`; đẳng thức khoảng cách dòng xanh trên 20.000 mã
    do `taoMaTran` sinh; và một ca chứng minh `hatGiongMoc(ma, i)` **khác nhau cho mọi `i`** đã
    thử. ⚠️ Phép kiểm **"không mốc nào tiêu quá dải của nó"** mà `plan.md` mục 7 đòi **không
    thuộc task này**: nó cần **một trận thật**, mà trận thì T704 mới dựng — và T704 phụ thuộc
    T717, nên đặt nó ở đây là làm T717 **không tick được ở chỗ nó đứng**. Nó là điều kiện ra
    của **T704**.
  - AC: AC-37.5, AC-45.7
  - Phụ thuộc: T702
  - Ghi chú: `plan.md` khai bốn ký hiệu này ở **D118**, ở bảng Contracts và ở bảng ánh xạ
    AC-37.5, cộng một tầng test riêng ở mục 7 — nhưng bản đầu của `tasks.md` chỉ có T702 thêm
    `nhayRut` + `BUOC_HAT_GIONG` vào `rng.ts`, nên **cả file lẫn phép kiểm dải đều không ai
    tạo**. Không có phép kiểm dải, một mốc tiêu quá 64 lần rút sẽ **lấn sang dải của mốc sau**
    và AC-37.5 vỡ **mà mọi test vẫn xanh** — vì `taiLap.test.ts` so engine với chính nó (xem
    điều kiện ra số 2).

- [x] **T718** — `lienTuc/khongChepModel.test.ts`: lưới **duy nhất** của R54
  - File: tạo `src/engine/lienTuc/khongChepModel.test.ts`
  - Xong khi: phép kiểm quét **source thô** của mọi file trong `src/engine/lienTuc/` và đỏ nếu
    bất kỳ file nào **nhắc tên** `chayChuoiBong`, `xacSuatTrungDich`, `xacSuatBiCuu`,
    `xacSuatCoHoiRoRang`, `nguoiTaiVung` — **kể cả trong chú thích**; cộng một **ca ngược**
    chứng minh phép kiểm đỏ được (một chuỗi thử trong fixture).
    ⚠️ **Phép kiểm phải TỰ MIỄN chính nó**, nếu không nó đỏ ngay lúc sinh ra: file này nằm
    trong `lienTuc/` và **buộc phải chứa** năm cái tên ấy để mà grep. Tiền lệ có sẵn trong
    repo: `boundaries.test.ts` dùng `laFileTest()` để bỏ qua file test, và `rng.test.ts` dùng
    `chiCode()` để bóc chú thích trước khi quét. Danh sách cấm là một `const` **trong chính
    file ấy**, và phép quét bỏ qua đúng đường dẫn của nó.
  - AC: — (lưới của R54, và là điều kiện để AC-45.3 còn nghĩa)
  - Phụ thuộc: T704
  - Ghi chú: `plan.md` mục 7 có một hàng riêng cho file này và R54 gọi nó là lưới **duy nhất**
    giữ cho "hai bảng thống kê còn so được" — nhưng bản đầu của `tasks.md` viết "(T751 tạo)"
    trong khi File của T751 chỉ có `sosanh.haiCheDo.test.ts`, nên **không ai tạo nó**.
    ✅ **Làm xong 2026-11-23, và hai điều đo được khác dự đoán:**
    1. **Cấm trong MÃ, không cấm trong chú thích.** Bản plan viết "kể cả trong chú
       thích" và nó **đỏ ngay lúc sinh ra**: `hatGiong.ts` phải dẫn `nguoiTaiVung` để
       nói vì sao dòng kết cục không có dải rút cố định. Chú thích không chạy; lệnh cấm
       thu về phần có hiệu lực, dùng khuôn `chiCode` của `rng.test.ts`. Plan mục 7 đã
       sửa theo.
    2. **Bẫy "phép kiểm tự cắn chính nó" KHÔNG tồn tại ở cơ chế này.** Đo được:
       `import.meta.glob` của Vite **không** trả về module đang gọi nó. Nên phép tự
       miễn là lớp đệm chứ không phải thứ đang gánh — và có một phép kiểm riêng khẳng
       định đúng điều đó, để nếu Vite đổi hành vi thì nó đỏ ở chỗ nói rõ lý do.
    Cộng hai phép kiểm mà ghi chú cũ không đòi: một ca **ngược** chứng minh phép quét
    đỏ được, và một ca canh rằng năm cái tên bị cấm **còn là hàm thật** của engine gốc
    — nếu ai đổi tên hàm mà quên sửa danh sách thì lệnh cấm canh một cái tên chết và
    `lienTuc/` được tự do chép hàm mới.
    ⚠️ **Phạm vi lệnh cấm: TUYỆT ĐỐI cho mọi file mà `tasks.md` tạo.** `plan.md` mục 7 cho
    "trừ đúng một dòng import ở `quyetDinh.ts`", nhưng **không task nào tạo `quyetDinh.ts`**
    nên ngoại lệ ấy **vô hiệu hôm nay**. Chỗ lệch giữa plan và tasks về `quyetDinh.ts` /
    `NguonQuyetDinh` là một phát hiện **MEDIUM** chưa xử — nó cần một quyết định: thêm task tạo
    mối hàn, hay khai rằng mối hàn đã bị bỏ và `tranLienTuc.ts` gọi thẳng `quyetKetCucChuoi`.

**Xem được gì ngay sau Phase 53:** màn chọn cặp đấu có hai lựa chọn chế độ, "liên tục" bị khoá
**kèm một câu giải thích** khi quân số ≠ 11. Bấm bắt đầu: sân 2D vẽ 22 điểm và quả bóng đổi chỗ
**mỗi giây trận**, tỉ số và dòng tường thuật **y hệt** chế độ phút. Chuyển động còn **thô** —
chưa có trần tốc độ, chưa có đường cong. **Phải nói trước điều đó.**

---

## Phase 54 — Cơ học của một cơ thể người

- [x] **T710** — `tocDoToiDa` (**không** nhân thể lực)
  - File: tạo `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: `tocDoToiDa` trả trong `[0; 9]` m/s cho mọi chỉ số 1–20, và **không** có đường
    nào đọc thể lực — `grep -n "theLuc" src/engine/lienTuc/coHoc.ts` ra **rỗng**.
  - AC: AC-38.1
  - ⚠️ **Điều kiện ra của chính task này suýt tự làm mình đỏ.** Nó đòi
    `grep -n "theLuc" src/engine/lienTuc/coHoc.ts` ra **rỗng**, trong khi ghi chú ngay dưới lại
    bảo viết hàm "đúng khuôn `heSoTheoChiSo` ở `theLuc.ts:40`" — nhắc tên file ấy trong một
    dòng chú thích là đủ làm phép grep thấy. Đây đúng lớp lỗi mà **T718** đã gặp ("cấm nhắc
    tên kể cả trong chú thích" trong khi chính file ấy phải chứa các tên để mà quét). Cách
    giải: chú thích nói **"khuôn tham số này đã có tiền lệ trong repo"** và **"một hàm còn chưa
    được export ở lớp sức mạnh"** — đủ chỉ đường cho người đọc mà không viết ra cái tên.
  - ✅ **Viết điều kiện grep thành một PHÉP KIỂM, không để nó là lệnh chạy tay.** `coHoc.test.ts`
    quét chính mã nguồn `coHoc.ts` qua `import.meta.glob('./coHoc.ts', { query: '?raw' })` và
    bóc chú thích bằng `chiCode` — đúng khuôn `khongChepModel.test.ts` của T718 và `rng.test.ts`.
    Cộng một **ca ngược** chứng minh nó đỏ được. Đã đột biến kiểm: thêm một dòng đọc sức bền
    vào `coHoc.ts` → đúng ca ấy đỏ (1 failed / 8). Một lệnh grep chạy tay thì chết cùng lượt
    làm việc; một phép kiểm thì còn sống.
  - ✅ **Bốn ca chống tầm thường.** Mệnh đề "trong [0; 9]" một mình quá dễ thoả — một hàm trả
    hằng 0 cũng xanh. Nên có thêm: hai đầu dải đúng **6,4** và **8,6**; tốc độ **tăng** theo
    chỉ số ở cả 19 bước; chỉ số ngoài dải bị **kẹp** chứ không ngoại suy; và **sàn dải phải
    nằm TRÊN 6 m/s** — vì nếu tụt xuống dưới thì những cầu thủ chậm nhất không bao giờ vào tập
    mà **AC-38.8** đo, và AC ấy sẽ xanh vì **rỗng**. Đó chính là lý do D129 loại phương án nhân
    tốc độ với sức bền (sàn tụt về 3,87 m/s).
  - 📏 **Đo được**: `tocDoToiDa(undefined)` = **7,442105263157895**, khớp đúng con số 7,442 mà
    D129 ghi. Lề dưới trần tuyệt đối là **4,44%** (9 − 8,6)/9. `TRAN_TOC_DO_TUYET_DOI = 9` là
    chỗ **duy nhất** số 9 của AC-38.1 tồn tại trong mã nguồn. Toàn bộ: **73 file / 1460 phép
    kiểm xanh** (trước T710 là 72/1452); ba file tuyên 0 dòng sửa vẫn 0 dòng; `boundaries` xanh.
  - Phụ thuộc: T703
  - Ghi chú: nếu `tocDoToiDa` nhận `HoSoCauThu` thì nó cần `giaTriChiSo`, mà hàm ấy ở
    `src/engine/sucManh.ts:66` **chưa export**. Đường rẻ hơn: đổi chữ ký thành
    `(chiSoTocDo: number | undefined)` đúng khuôn `heSoTheoChiSo` ở `theLuc.ts:40` — khuôn ấy
    **không kéo theo gì**.

- [x] **T711** — Kẹp vector gia tốc/giảm tốc + cổng quay ba băng + tích phân Euler
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: trên 1.000 bộ đầu vào, `|Δv| / Δt ≤ 6` khi tăng và `≤ 8` khi giảm ở **mọi** bước;
    một ca hội tụ (điểm xuất phát cách đích 30 m đến đích trong `≤ ⌈30/9⌉ + 1` giây); **và cả
    HAI vế của AC-38.3** — vế (i) Δθ > 90° thì `|v|` mốc trước **< 3,0** m/s, vế (ii)
    **45° ≤ Δθ ≤ 90°** thì `|v(sau)| <= 0,60 · |v(trước)|`.
  - ⚠️ **Vế (ii) bị bỏ sót ở cả ba tài liệu** cho tới khi `/analyze` bắt được, và thêm khẳng
    định thôi thì **chưa đủ — cơ chế phải mở rộng theo**. D123 đang áp hệ số **0,57** chỉ ở
    băng **3,0–6,0 m/s**; dưới 3,0 m/s Δθ **tự do và không giảm tốc**, nên một cú quay 60° ở
    **2,9 m/s giữ 100% tốc độ** và T711 sẽ đỏ ở chính điều kiện của nó. Vì thế T711 **áp hệ số
    0,57 cho MỌI cú quay > 45°**, ở cả ba băng. Cái giá: người quay ở 1 m/s cũng mất tốc độ —
    đúng vật lý, và nó **không** đụng trần AC-38.2 (0,57 là một phép **giảm**). Phương án bị
    loại: để băng dưới 3,0 m/s tự do → **AC-38.3 vế (ii) không dựng nổi**, mà mục 9 của spec
    cấm tự hạ ngưỡng. Trên 6,0 m/s vế (ii) **rỗng theo cấu trúc**: trần 30°/giây cho tối đa
    15° mỗi bước 0,5 giây, nên không có cú quay 45–90° nào ở băng ấy.
  - AC: AC-38.2, AC-38.3
  - 🐞 **Ca chống tầm thường bắt được một lỗi THẬT, hai lần liên tiếp.** Ca "không vọt qua
    đích rồi dao động" không nằm trong dòng "Xong khi" — tôi thêm vì một mô hình **chỉ có ga**
    vẫn "tới đích" ở ca hội tụ rồi dao động quanh nó mãi. Nó đỏ ngay, và chỉ đúng chỗ:
    - **Vòng một — 11 bước nằm quá đích.** Phanh viết bằng `sqrt(2·a·d)`, là công thức của
      thời gian **liên tục**. Với `dt = 0,5` thì ở mọi khoảng cách **dưới 3,6 m**, một bước
      `v · dt` vẫn dài hơn quãng còn lại.
    - **Vòng hai — còn 3 bước.** Thêm vế `quang / dt` vẫn chưa đủ, vì `sqrt(2ad)` giả định
      hãm được **tức thì**, trong khi kẹp giảm tốc chỉ cho bớt `7,2 × 0,5 = 3,6` m/s mỗi bước.
      Một người đang 8,9 m/s cách đích 5,5 m sẽ còn 5,3 m/s ở bước sau và đi 2,65 m khi chỉ
      còn 1,05 m.
    - **Vòng ba — xanh.** Dùng **nghiệm rời rạc đúng**: `v = −a·dt + sqrt((a·dt)² + 2·a·d)`,
      tức "đi một bước nữa rồi vẫn còn đủ quãng để dừng".
  - ⚠️ **Hệ số 0,57 phải so với tốc độ TRƯỚC, không phải tốc độ vừa tính.** AC-38.3 vế (ii)
    nói "tốc độ **sau** ≤ 60% tốc độ **trước**". Nhân 0,57 vào tốc độ vừa tăng thì một người
    đang chạy 1 m/s tăng lên 3,6 rồi quay 60° sẽ còn **2,05** m/s — gấp ba tốc độ trước, và
    vế (ii) vỡ **dù hệ số trông vẫn là 0,57**. Cài đúng: trần sau cú quay là
    `0,57 × |v trước|`.
  - ✅ **Hai ca CHỐNG RỖNG, và chúng đáng giá hơn cả hai ca chúng bảo vệ.** AC-38.3 nói về
    những cú quay; nếu mô hình không bao giờ **sinh ra** một cú quay như thế thì cả hai vế
    xanh mà không chứng minh gì. Đã đếm trên 4.000 bước: **680** cú quay > 90° và **824** cú
    quay 45–90°. Băng chậm quay **tự do** chính là thứ làm vế (i) có mẫu — D123 đã nói trước,
    và số đo xác nhận.
  - 📏 **Đo được**: tốc độ lớn nhất trong 4.000 bước là **9,0000** m/s — chạm đúng
    `TRAN_TOC_DO_TUYET_DOI`, tức phép kẹp thật sự hoạt động chứ không phải chưa bao giờ bị thử.
    Tích phân Euler cho `(x′ − x)/dt ≡ v′` đúng tới **10 chữ số** trên 1.000 bộ. Gia tốc trên
    1.000 bộ không bộ nào vượt 6, giảm tốc không bộ nào vượt 8. Toàn bộ: **73 file / 1468 phép
    kiểm xanh**; `src/ui/san2D.test.ts` **0 ký tự sửa**; ba file tuyên 0 dòng vẫn 0 dòng.
  - Phụ thuộc: T710
  - Ghi chú: hằng số mét phải **import từ `hinhHocSan.ts`** (T703). Tự viết lại hằng số sân ở
    đây là sinh nguồn sự thật thứ hai. Và `lienTuc/khongChepModel.test.ts` (**T718** tạo) cấm mọi
    file trong `lienTuc/` **nhắc tên** `chayChuoiBong`, `xacSuatTrungDich`, `xacSuatBiCuu`,
    `xacSuatCoHoiRoRang`, `nguoiTaiVung` — **kể cả trong chú thích**, vì nó quét source thô.

- [x] **T712** — Trần theo hướng mặt + `huongNguoi` có trần quay
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: chạy lùi `≤ 4` m/s và chạy ngang `≤ 5` m/s trên mọi bộ; `huong ∈ [0, 360)` ở mọi
    mốc; và **một ca chống số giả**: người đứng im **không** được mặc định nhìn về `+x`
    (`atan2(0,0) = 0` làm AC-38.11 thoả bằng một con số giả).
  - AC: AC-38.4, AC-38.11
  - 🐞 **Trần theo hướng mặt đặt sai chỗ làm vỡ AC-38.2, và phép kiểm bắt được bằng số.**
    Bản đầu áp trần lùi/ngang ở **cuối** `buocCoHoc`, sau phép kẹp gia tốc. Hệ quả: một người
    đang chạy 9 m/s mà bị phân loại là chạy lùi bị cắt thẳng về 4 m/s trong một bước — giảm
    tốc **8,947 m/s²**, vượt trần 8 của AC-38.2. Chữa: đưa trần ấy vào **Ý ĐỊNH** (bước 1),
    để phép kẹp gia tốc quyết người ta tiến về trần nhanh tới đâu. Hai AC hết đánh nhau.
  - ⚠️ **Và phép kiểm AC-38.4 phải đo trên QUỸ ĐẠO, không trên cặp (vận tốc, hướng mặt) bốc
    ngẫu nhiên.** Một cặp như "đang chạy 9 m/s mà mặt quay ngược 180°" engine **không dựng ra
    được**: trên 6 m/s vector vận tốc chỉ quay 15° mỗi bước (`TOC_QUAY_NHANH`), còn thân người
    quay tới 60° (`GOC_QUAY_NGUOI`), nên hướng mặt luôn đuổi kịp. Đo trên trạng thái bất khả
    là đòi engine tuân một luật ở nơi nó không bao giờ tới.
  - ✅ **`GOC_QUAY_NGUOI` phải NHANH HƠN trần quay của vector vận tốc**, và chính khoảng chênh
    ấy sinh ra mẫu thật cho AC-38.4. Thân người quay 120°/giây trong khi quỹ đạo ở băng nhanh
    chỉ quay 30°/giây; khi vận tốc đổi chiều gấp ở tốc độ thấp (băng chậm **tự do**), hướng mặt
    không theo kịp và mốc ấy thành "chạy lùi" thật.
  - 📏 **Ba trần đều bị CHẠM ĐÚNG trên 4.000 mốc quỹ đạo** — không trần nào xanh vì chưa bao
    giờ bị thử: tiến **2.602** mốc, tốc độ lớn nhất **9,0000** m/s; ngang **819** mốc, lớn nhất
    **5,0000**; lùi **579** mốc, lớn nhất **4,0000**.
  - ✅ **Ca chống số giả của AC-38.11, đúng cái dòng "Xong khi" gọi tên.** `atan2(0, 0)` trả `0`
    trong JavaScript, nên suy hướng thẳng từ vận tốc sẽ cho **mọi người đứng im nhìn về +x** —
    AC-38.11 "thoả" vì 0 nằm trong [0; 360), nhưng đó là một con số rỗng, và cả hàng phòng ngự
    đứng yên sẽ quay mặt cùng một phía. `huongNguoiMocSau` **giữ hướng mốc trước** khi tốc độ
    dưới `NGUONG_DUNG_YEN`, và phép kiểm đòi sáu người đứng im ra **sáu hướng khác nhau**.
  - 📏 Toàn bộ: **73 file / 1475 phép kiểm xanh**; `src/ui/san2D.test.ts` và ba file tuyên 0
    dòng sửa đều **0 dòng**. `TrangThaiCoHoc` nhận thêm trường `huong`, và `tsc` tự chỉ ra cả
    bốn chỗ khởi tạo phải sửa — kiểu làm việc kiểm lỗi thay người.
  - Phụ thuộc: T711

- [x] **T713** — `tranhNguoi` + `tachChen`, bán kính tránh **2,0 m** (trả AC-34.2 của spec 006)
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: không hai thực thể nào ở khoảng cách < 2,0 m tại bất kỳ mốc nào trong 20 mã;
    `npx vitest run src/ui/san2D.test.ts` xanh **với 0 dòng sửa**.
  - AC: AC-34.2 (nợ của spec 006), và là đầu vào của AC-15.2 ở chế độ liên tục
  - 🐞 **Phép tách hội tụ TỪ DƯỚI nên không bao giờ chạm ngưỡng — đo được.** Bản đầu đẩy
    mỗi cặp ra đúng `2,0 m` rồi dừng; nhưng đẩy cặp này xong thì cặp bên cạnh xô lại một
    chút, nên trạng thái cuối còn **1,9999992779 m** trên cảnh 26 thực thể dồn trong
    25 × 20 m, và **1,9999542 m** ở ca ba người trùng khít. Chữa bằng hai thứ: đẩy quá
    ngưỡng một lề **1 mm** để trạng thái cuối nằm **hẳn** bên trên, và nâng số vòng từ 8
    lên **24**. 1 mm thì không ai nhìn thấy trên sân.
  - ⚠️ **Hai thực thể TRÙNG KHÍT là chỗ một phép tách ngây thơ chia cho không.** Vector nối
    hai điểm cách nhau đúng 0 **không có hướng**, nên không có chiều nào để đẩy — và một bản
    cài ẩu cho ra `NaN`, thứ lọt qua mọi phép lọc viết lỏng. `huongGoTrung` lấy hướng theo
    **chỉ số** của hai thực thể: luôn có một hướng, hai người khác nhau ra hai hướng khác
    nhau, và nó **tất định** — đúng điều P1 đòi. Có ca riêng cho cả ba điều ấy, cộng một ca
    khẳng định mọi toạ độ ra là `Number.isFinite`.
  - ✅ **Ca chống "bẻ đường vô cớ".** `tranhNguoi` phải trả về **đúng cái đích cũ** khi đường
    đang thông — một bản cài luôn dời đích vẫn xanh ở ca "có người cản", nhưng nó làm mọi
    người đi đường vòng suốt trận. Bốn ca: người đứng xa đường, người đứng **sau lưng**,
    người đứng **quá đích**, và danh sách rỗng.
  - ⚠️ **"20 mã trận" ở đây là 20 HẠT GIỐNG, không phải 20 trận thật** — và ghi rõ vì sao:
    lô mốc hôm nay còn mang toạ độ **0** (T704 đã ghi), nên chưa có vị trí thật để đo. Cảnh
    thử **cố ý dồn chật** 26 thực thể vào 25 × 20 m; rải đều trên sân 105 × 68 thì hầu như
    không cặp nào chen nhau và phép kiểm sẽ xanh vì **không có gì để tách**. Có ca chống rỗng
    đòi **cả 20/20** cảnh đều vốn có người chen nhau. Phép kiểm trên một trận thật là T754.
  - ⚠️ **Hai tầng đụng nhau, T713 KHÔNG tự xử** — đúng như ghi chú của task dặn. 2,0 m bằng
    **1,73 đơn vị** khung sân 11, trong khi `san2D.test.ts:874` đòi ≥ 1,46 bán kính
    (**3,80 đơn vị**) và `:1003` đòi sàn **4 đơn vị**. Hai người tranh chấp cách nhau 2,0 m
    không đạt cả hai. Chỗ mốc để lại cho **T754**; hai con số ấy **0 dòng sửa**.
  - 📏 Toàn bộ: **73 file / 1483 phép kiểm xanh**; `src/ui/san2D.test.ts` và ba file tuyên 0
    dòng sửa đều **0 dòng**.
  - Phụ thuộc: T711
  - Ghi chú — **đây là chỗ hai tầng đụng nhau, đã tính:** 2,0 m ở engine = **1,73 đơn vị**
    khung sân 11, trong khi `san2D.test.ts:874` đòi `≥ 1,46 bán kính` (= **3,80 đơn vị** ở
    `BAN_KINH = 2.6`) và `:1003` đòi sàn **4 đơn vị tuyệt đối**. Hai người tranh chấp cách nhau
    2,0 m **không đạt cả hai ngưỡng**. Plan đã biết và chọn đường "phát biểu lại bất biến theo
    **chữ** của AC-15.2, chỉ cho chế độ liên tục" (R58, và người dùng chốt **giữ 2,6** ngày
    2026-11-23). T713 **để lại một chỗ mốc** cho T754 và **không sửa** hai con số ấy.

- [x] **T714** — Tách `ui/viTriVe.ts` thành hàm thuần export **trước**, rồi gắn các cổng,
  **cộng kiểu `AnhChupMet` + prop `anhChup?`** (nhận từ T709, 2026-11-23)
  - File: tạo `src/ui/viTriVe.ts`, `src/ui/viTriVe.test.ts`; sửa
    `src/ui/components/San2D.tsx` (`Props` += `anhChup?: AnhChupMet | null`),
    `src/engine/lienTuc/coHoc.ts` (kẹp **đích** thủ môn)
  - ➡️ **Nhận từ T709, 2026-11-23**: `plan.md` nhắc `AnhChupMet` ở D121, ở sơ đồ mục 3 và
    ở diff mục 4.1, nhưng **không task nào trong 48 task tạo nó** — `tasks.md` không nhắc
    tên ấy một lần, `grep -rn AnhChupMet src/` rỗng. Đặt ở T709 thì prop ấy **không có
    người sản xuất lẫn người đọc**; đặt ở đây thì kiểu, nơi sinh toạ độ và nơi vẽ nằm
    cùng một lát. **T714 phải định nghĩa kiểu**, không chỉ dùng nó.
  - Xong khi: `viTriVe.ts` export hàm thuần nhận **tham số**, không đọc hook nào; ở tỉ lệ 1 và
    chế độ liên tục, toạ độ trả về **trùng khít** mốc engine phát; và cả bốn file
    `npx vitest run src/ui/san2D.test.ts src/ui/daoDong.test.ts src/ui/phaBong.test.ts src/ui/noiSuy.test.ts`
    xanh.
  - AC: AC-37.6, AC-45.9 (nền), AC-28.3 / AC-30.7 (giữ lại)
  - ✅ **`AnhChupMet` nay CÓ CHỦ.** Kiểu được định nghĩa ở `src/ui/viTriVe.ts`, và nó mang
    theo **bảng ô của từng cầu thủ** (`oCuaNguoi`) chứ không để lớp vẽ tự suy: bố cục 26 ô
    là quy ước của **lô mốc**, và bắt lớp vẽ biết nó là buộc hai tầng phải sửa cùng lúc mỗi
    khi bố cục đổi.
  - ✅ **Phép tách giữ nguyên hành vi, chứng minh bằng 144 phép kiểm cũ.** Bốn file mà dòng
    "Xong khi" gọi tên — `san2D`, `daoDong`, `phaBong`, `noiSuy` — xanh **144/144** sau khi
    hàm trong của `San2D.tsx` chỉ còn việc **gom đầu vào** và uỷ phép hợp cho module thuần.
    `src/ui/san2D.test.ts` **0 dòng sửa**.
  - ⚠️ **"Gắn cổng" ở đây là một phép TRỪ, không phải phép cộng.** Bảy lớp sinh vị trí của
    chế độ cổ điển đều **tắt** ở nhánh liên tục. Ba trong số đó — nội suy Hermite, hệ số
    theo độ mệt, hệ số rơi-đứng-yên — **biến dạng thời gian** trên đường đi, nên nếu còn
    chạy thì `(x′ − x)/dt` **không còn bằng** vận tốc engine nói, và AC-38.1 đo trên hình sẽ
    lệch khỏi AC-38.1 đo trong engine. Hai con số ấy phải là **một**. Ca xương sống bơm vào
    đủ cả — một vị trí nội suy khác hẳn, một vị trí bám bóng khác nữa, một dải thủ môn chật,
    một lệch dao động khác không — rồi đòi kết quả **không mang dấu vết nào** của chúng.
  - ⚠️ **Kẹp ĐÍCH thủ môn, không kẹp VỊ TRÍ** — và chỗ khác nhau ấy là cả lý do
    `kepDichThuMon` nằm ở engine. Kẹp vị trí nghĩa là để thủ môn chạy ra giữa sân rồi **giật**
    anh ta về: một bước dịch không qua phép kẹp gia tốc, tức **vỡ AC-38.2**, và trên hình
    trông như teleport. Kẹp đích thì anh ta **không bao giờ nhắm** ra khỏi dải, cơ học lo nốt
    phần còn lại. Spec 006 kẹp ở lớp vẽ (T622) vì lúc ấy chưa có toạ độ mét — và bộ kiểm
    `node` không nhìn tới lớp ấy, nên **1.291 phép kiểm xanh trong khi thủ môn chạy tới giữa
    sân**. Nay phép kiểm với tới được.
  - ✅ **Ca "kẹp dải thủ môn SAU lớp bám bóng"** bơm một vị trí bám bóng **nằm ngoài** dải để
    phân biệt hai thứ tự. Kẹp trước lớp bám bóng thì kẹp xong lại bị kéo đi, và một phép kiểm
    đo đầu vào thay vì đầu ra sẽ **không thấy gì** — đúng lớp lỗi mà T622 đã trả giá.
  - ✅ **`viTriVe.ts` KHÔNG import gì từ `San2D.tsx`**, đúng tiền lệ `quyDoiMet.ts` đặt ở
    T703: nhận khung ảnh làm **tham số** thay vì đi lấy. Kéo một `.tsx` vào đây là kéo cả
    React vào một module mà phép kiểm `node` phải gọi được trần trụi.
  - 📏 Toàn bộ: **74 file / 1498 phép kiểm xanh** (trước T714 là 73/1483). `MOT_PHAN_BA_SAN`
    dẫn xuất từ `DAI_SAN` của `hinhHocSan.ts` chứ không gõ tay số 35, và có ca canh điều đó.
  - Phụ thuộc: T711, T712, **T713** (cùng sửa `coHoc.ts` — kẹp **đích** thủ môn — nên hai task
    này **không** [P] được với nhau; cả Phase 54 là một chuỗi, mọi task ở đây hoặc chạm
    `coHoc.ts` hoặc đứng trên nó)
  - Ghi chú — **plan kể năm cổng; thực tế có BẢY lớp sinh vị trí**, đã grep:
    - Hai lớp plan không liệt kê nằm ở `src/ui/noiSuy.ts`: `viTriVe` gọi `viTriTaiThoiDiem`
      (`:314`) với `{ doMet }`, bên trong nó áp `tiLeTheoDoMet` (`:335`, định nghĩa `:112`)
      **và** `tiLeRoiDungYen` (`:75`) khi `huongVao == null`, rồi `noiSuyCong` (`:253`) uốn
      Hermite. Ba thứ ấy **biến dạng thời gian** trên đường đi, nên ở chế độ liên tục
      `(x' − x)/dt` **không còn bằng** vận tốc engine nói — tức AC-38.1 đo trên hình sẽ lệch.
    - Năm hàm phải tắt ở **chỗ gọi**, không sửa thân hàm: `nghiengKhoiTheoBong` (import
      `san2D.test.ts:30`, gọi **11 lần**: 402, 431, 432, 455, 456, 492, 497, 1041, 1058, 1082,
      1166), `daiThuMon` (4 lần: 597, 1285, 1620, 1826), `lechDaoDong` (`san2D.test.ts` 2 lần +
      **`daoDong.test.ts` 11 lần**), `cuaSoGiuBong` (`san2D.test.ts` 3 lần + `phaBong.test.ts`
      8 lần), `viTriNguoiGiuBong` (3 + 6 lần). Cộng `hinhSan` gọi **28 lần** qua helper
      `veTu()` ở `san2D.test.ts:83-104`. **Đổi chữ ký bất kỳ hàm nào là đỏ ~20 chỗ.**
    - `src/hooks/` có **7 file và 0 file `.test.ts`**. Mọi đoạn nối dây đi qua đó sẽ **XANH
      nếu sai** (R52).

- [x] **T715** — Test tính chất trên 100.000 bộ đầu vào đối nghịch
  - File: `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: `npx vitest run src/engine/lienTuc/coHoc.test.ts` xanh và **không có một `it` nào
    quá 5.000 ms**.
  - AC: AC-38.1, AC-38.2, AC-38.3, AC-38.4
  - 🐞 **Bẫy `testTimeout` có thật, và nó VƯỢT LẶNG LẼ chứ không đỏ.** Bản đầu gọi `expect`
    **500.000 lần** trong một `it` và mất **6.043 ms** — vượt điều kiện ra "không `it` nào
    quá 5.000 ms". Nhưng phép kiểm vẫn **xanh**: một `it` **đồng bộ** không bao giờ tự đỏ vì
    timeout, bởi đồng hồ của vitest nằm trên chính luồng đang bị chặn. Ghi chú của task đoán
    nó sẽ đỏ với "test timed out"; thực tế còn tệ hơn — nó **không báo gì cả**. Chữa bằng
    cách **gom rồi `expect` một lần**: chậm nhất nay **553 ms**.
  - 🐞 **AC-38.4 đỏ thật ở 5,544 m/s, và nó lộ ra một lỗ của mô hình.** Trên 40.000 mốc quỹ
    đạo, một mốc bị phân loại "chạy ngang" ở **5,544 m/s**. Nguyên nhân: mô hình cho hướng
    mặt lệch **tự do** so với hướng chạy, tức cho phép một người **sải 9 m/s trong khi mặt
    quay ngang** — điều người thật không làm được. Chữa bằng `lechToiDaTheoTocDo`, kẹp độ
    lệch theo tốc độ: `>5 m/s → ≤60°`, `>4 m/s → ≤120°`, `≤4 m/s → tự do`. Ba mức khớp đúng
    ba trần của AC-38.4, nên nay **không mốc nào vượt được** — đúng **bằng cấu trúc**.
  - ⚠️ **Và phép kẹp ấy CHỌI với trần quay thân người, nên hai thứ phải tách.**
    `GOC_QUAY_NGUOI` là trần của cú quay **tự nguyện**; `lechToiDaTheoTocDo` là ràng buộc
    **của việc chạy**. Khi một người tăng tốc trong lúc mặt còn lệch xa, ràng buộc thứ hai
    **ghì mặt vượt** trần thứ nhất — đo được **84,3°** trong một bước 0,5 giây. Đó không
    phải lỗi: đòi cả hai cùng lúc là đòi người ta vừa chạy nhanh vừa giữ mặt quay ngang,
    tức chính thứ AC-38.4 cấm. Phép kiểm nay khẳng định ràng buộc chạy **luôn** đúng, trần
    quay đúng ở những bước nó **không bị ghì**, và có **ca chống rỗng hai chiều** — cả số
    bước bị ghì lẫn số bước không bị ghì đều phải > 0.
  - 🐞 **`GOC_QUAY_NGUOI` 120 → 90, và con số này quyết định một AC có mẫu hay không.** Ở
    120°/giây thì một bước 0,5 giây quay được 60°, nên sau một cú lật vận tốc 180° độ lệch
    còn **đúng 120°** — ngưỡng "chạy ngang" — và **không mốc nào** bao giờ thành "chạy lùi".
    Trần lùi 4 m/s khi ấy xanh vì **rỗng**, và hai ca chống rỗng đã bắt đúng điều đó
    ("số mốc chạy lùi: expected 0 to be greater than 0"). Ở 90°/giây thì lệch còn 135° > 120°
    và mốc ấy là "chạy lùi" thật; một cú xoay 180° mất 2 giây, đúng tầm người thật.
  - ⚠️ **Phân loại theo hướng mặt CỦA CHÍNH MỐC ấy**, không phải mốc trước — AC-38.11 nói
    "mỗi mốc PHẢI có hướng người", nên hướng của mốc là thứ AC-38.4 phải so. Đổi chỗ này là
    đo một thứ khác với thứ engine kẹp.
  - 📏 **Đo được trên 40.000 mốc quỹ đạo**, ba trần đều chạm đúng: tiến **32.308** mốc, lớn
    nhất **9,0000** m/s; ngang **6.254** mốc, **5,0000**; lùi **1.438** mốc, **4,0000**.
    Trên 100.000 bộ đối nghịch: không bộ nào ra `NaN`, hướng luôn trong [0; 360), và
    `(x′ − x)/dt ≡ v′` lệch dưới **1e-10**. Bộ sinh **cố ý** đi tìm chỗ gãy — một phần năm
    số bộ lấy giá trị ở biên đã biết (2,99 / 3,0 / 6,0 / 6,01 m/s; quãng 0, 1e-9, 3,6 m).
    Toàn bộ: **74 file / 1507 phép kiểm xanh**; `it` chậm nhất **553 ms**.
  - Phụ thuộc: T713
  - Ghi chú — **bẫy: `vite.config.ts` KHÔNG đặt `testTimeout`** (đã kiểm: `grep -c` = 0), nên
    vitest dùng mặc định **5.000 ms** mỗi `it`. 100.000 bộ × nhiều tính chất trong **một** `it`
    sẽ đỏ với "test timed out" — một phép kiểm **nói sai lý do**. Chẻ thành nhiều `it`, mỗi
    tính chất một `it`. Bộ sinh phải **tất định** và **không tiêu dòng rút của trận**: dùng một
    bộ sinh riêng **trong chính file test** (file test được `boundaries.test.ts` miễn ở
    `laFileTest`, `:55-57`) — nhưng **không** dùng `Math.random`, vì thế là mất tính tái lập
    của chính phép kiểm (lệnh cấm số 1).

- [x] **T725** — **Nối `buocCoHoc` vào vòng phút**: lô mốc mang toạ độ THẬT
  - File: tạo `src/engine/lienTuc/viTriMet.ts`, `src/engine/lienTuc/viTriMet.test.ts`; sửa
    `src/engine/lienTuc/tranLienTuc.ts` (trạng thái cơ học của 26 thực thể),
    `src/engine/lienTuc/dienPha.ts` (mối hàn nhận thực thể thay vì dựng thực thể rỗng),
    `src/engine/lienTuc/tranLienTuc.test.ts`
  - Xong khi: trên 10 mã trận, ở **mọi** mốc của một trận thật — (a) **không** ô nào còn
    mang `x = y = 0` trừ ô vắng mặt; (b) mọi toạ độ nằm **trong sân** theo `trongSan`;
    (c) `|Δv|/Δt` của **mọi ô NGƯỜI (0–21)** không vượt trần AC-38.2; (d) tốc độ của họ
    không vượt AC-38.1 — ⚠️ **không áp cho quả bóng**, vì AC-38.1 và AC-38.2 nói về *cầu
    thủ*, và một quả bóng đi nhanh hơn 9 m/s là bóng đá thật (vật lý bóng là **T720**);
    (e) `taiLap.test.ts` và `MOC_V6` còn xanh — nối chuyển động là quyết định
    **chỉ ở đầu ra**, nó **không dịch một hạt giống nào** (AC-37.5).
  - AC: AC-37.1, AC-38.1, AC-38.2, AC-38.11 — và là **điều kiện vào** của T716, T733, T742
  - 📏 **Đo trên một trận thật, và cả bốn điều kiện ra đều đạt**: 5.640 mốc, 146.640 ô, cả
    trận chạy trong **209 ms**. Ô có mặt mà còn ở gốc toạ độ: **0**. Ô có mặt mà ra ngoài
    sân: **0**. Tốc độ lớn nhất của người: **9,0000** m/s — chạm đúng trần AC-38.1. Gia tốc
    lớn nhất: **3,66** m/s², dưới trần 6 của AC-38.2.
  - 🐞 **Suýt báo sai gia tốc gấp đôi.** Phép đo đầu chia `Δv` cho **0,5** và ra 7,33 m/s².
    Sai: vòng tích phân chạy **120 bước** mỗi phút nhưng `laMocThuong` chỉ ghi **60**, nên
    hai mốc ĐÃ GHI cách nhau **1 giây**, không phải 0,5. Con số thật là **3,66**.
  - 🐞 **Và một lỗi thật nữa, lần này ở chỗ LƯU chứ không ở mô hình.** Phép kiểm đỏ với
    `9,000000508 > 9 + 1e-9`. Nguyên nhân: `oLieu` của lô là **`Float32Array`**, và khoảng
    cách giữa hai số float32 liền nhau quanh 9 là **7,63e-7** — độ vượt đo được nằm **trong
    một ULP**. Engine kẹp đúng 9 trong float64; ghi ra rồi đọc lại mới thành 9,0000005. Lề
    của mọi phép so **trên lô** vì thế phải cỡ float32, và **T742 sẽ gặp đúng chỗ này**.
    Đây cũng là lý do `loMoc.ts` dặn engine **không bao giờ đọc lại vận tốc từ lô**: trạng
    thái cơ học sống trong float64 ở `TrangThaiLienTuc`, lô chỉ là đầu ra. Đọc lại là tích
    luỹ sai số float32 qua 11.400 bước một trận.
  - ⚠️ **Trạng thái cơ học phải sống qua ranh giới PHÚT.** Một người đang chạy 7 m/s ở giây
    cuối của phút 10 vẫn đang chạy 7 m/s ở giây đầu của phút 11. Dựng lại từ 0 mỗi phút là
    cho cả sân **đứng khựng rồi lao đi** 90 lần một trận, và phép kẹp gia tốc vỡ ở đúng ranh
    giới phút. Vì thế `TrangThaiLienTuc` nhận thêm trường `coHoc` — **không** vào bản ghi
    trận, vì AC-45.4 nói vị trí không được lưu mà sinh lại từ mã trận.
  - ✅ **Mối hàn đặt ở `dienPha.ts` chứ không nhồi cơ học vào đó.** `dienChuoiRaMoc` nhận một
    tham số **tuỳ chọn** `thucTheCuaMoc`; không khai thì hành vi T706 giữ nguyên từng con số.
    File ấy sở hữu **bố cục thời gian** của một pha, cơ học là của `coHoc.ts` — gộp hai thứ
    là buộc chúng sửa cùng nhau mãi.
  - ⚠️ **`tachChen` chạy SAU phép bước, và chỉ trên 22 ô người.** Trước thì phép bước lại dồn
    người vào nhau ngay trong cùng mốc. Và đẩy quả bóng ra xa chân người là xoá đúng thứ
    AC-37.6 nói.
  - ✅ **`taiLap.test.ts` và `MOC_V6` còn xanh, 0 dòng sửa** — nối chuyển động là quyết định
    **chỉ ở đầu ra**, nó không dịch một hạt giống nào (AC-37.5). `rutMoiMoc` vẫn là 0 ở mọi
    mốc vì `buocCoHoc` **không rút** lần nào, nên phép kiểm dải rút của T704 giữ nguyên ý
    nghĩa.
  - ➕ **Phạm vi nới một ký hiệu**: `doiHinhTrenSan` và `ViTriTrenSan` của `tran.ts` được
    thêm `export` — không một dòng nào bị viết lại, đúng tiền lệ T701 đã đặt khi bóc bốn ký
    hiệu cho mối hàn thứ nhất.
  - 📏 Toàn bộ: **75 file / 1516 phép kiểm xanh**; bốn file tuyên 0 dòng sửa đều **0 dòng**.
  - Phụ thuộc: T711, T712, T713, T714, T706
  - ⚠️ **Task này lấp LỖ THỨ SÁU cùng loại, tìm ra ngày 2026-11-24.** Plan hứa ở chú thích
    `dienPha.ts:135` rằng "toạ độ chưa có — cơ học chuyển động là **Phase 54**", nhưng cả
    sáu task của Phase 54 (**T710 → T716**) chỉ **dựng** `coHoc.ts`; không task nào **gọi**
    nó từ vòng phút. Đã đo: `grep -rn "buocCoHoc" src/` ngoài chính file nó và test của nó
    ra **rỗng** — cả lớp cơ học của bốn lát liền **không có người gọi**. Và
    `dienChuoiRaMoc` ghi vào lô bằng `thucTheRong`, trả `{x:0, y:0, …}` cho cả 26 ô ở mọi
    mốc.
  - ⚠️ **Ba thứ đứng trên lỗ này**, nên nó phải làm TRƯỚC cả ba: điều kiện ra của **T716**
    (ba mệnh đề AC-38.10 cần vị trí bóng và hậu vệ cuối); **T733** (nối vòng rAF — sẽ vẽ 22
    người chồng lên góc sân); **T742** (`doCoHoc` đo mười AC — sẽ đo một trận đứng yên).
  - 📐 **Mô hình đích là TỐI THIỂU có chủ ý, và ranh giới với spec 009 phải ghi rõ.** Spec
    007 không có AC nào đòi hình khối đội hình: AC-38.x đều là trần cơ học, AC-37.6 là ai
    giữ bóng. Vì thế đích ở đây chỉ gồm ba thứ — bóng tới tâm vùng của pha con đang diễn,
    người giữ bóng tới chỗ bóng, những người khác tới **chỗ đứng theo sơ đồ** dịch một phần
    nhỏ về phía bóng. Khối phòng ngự 30–40 m, hai tuyến cách 10–15 m, pressing và lùi khối
    là **US-40 của spec 009**; làm chúng ở đây là lấn phạm vi và sẽ phải gỡ.

- [x] **T716** — `viTriTrongTai`: ba điểm trọng tài **có vị trí**, không chỉ có ô (**AC-38.10**)
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`,
    `src/engine/lienTuc/loMoc.ts` (đường ghi ba cột `REF`/`AR1`/`AR2`)
  - Xong khi: trên 20 mã, ở **mọi** mốc, **cả ba** mệnh đề của AC-38.10 đúng — (a) khoảng cách
    trọng tài chính tới bóng ∈ **[15; 35] m**; (b) trọng tài **không nằm trên đường chuyền**
    (khoảng cách từ điểm tới đoạn thẳng người giữ bóng → người nhận lớn hơn một lề nêu được
    bằng số); (c) mỗi trợ lý **ngang hàng hậu vệ cuối cùng** của nửa sân mình phụ trách (sai số
    nêu bằng số). Và ba điểm ấy **không teleport**: `|Δv|/Δt` của chúng không vượt trần AC-38.2.
  - AC: **AC-38.10**, AC-38.2, AC-38.11
  - Phụ thuộc: T711 (cần `kepVanToc`), T713 (cùng sửa `coHoc.ts`), **T704** (nó sửa
    `loMoc.ts` và điều kiện ra của nó đo trên một trận thật)
  - Ghi chú — **task này lấp một lỗ CRITICAL mà `/analyze` tìm ra ngày 2026-11-23.**
    `viTriTrongTai(bong, hangThuCuoi, huong)` được `plan.md` nhắc **bốn lần** (sơ đồ mục 3,
    **D133**, bảng Contracts mục 5, bảng ánh xạ mục 6) nhưng **0 lần** trong bản đầu của
    `tasks.md`, và bảng phủ AC trỏ AC-38.10 vào T713 + T742 — mà T713 chỉ làm
    `tranhNguoi`/`tachChen` và T742 chỉ **đo**. Hệ quả nếu để nguyên: T704 đã cấp **26 ô** thực
    thể nên ba cột `REF`/`AR1`/`AR2` **tồn tại** mà không đường nào ghi toạ độ → `doCoHoc` báo
    vi phạm ở **mọi** mốc, hoặc ba điểm đứng ở (0,0) và thoả dải 15–35 m **một cách tình cờ**.
    Đây là lỗ thứ hai cùng loại với `dienPha.ts` (T706).
    ⚠️ **Hai mệnh đề (b) và (c) chưa từng có cơ chế nào trong repo.** Nếu lúc dựng hoá ra một
    trong hai **không dựng nổi** cùng với trần cơ học của AC-38.1/38.2, thì xử đúng mục 9 của
    spec: **dừng và hỏi người dùng, KHÔNG tự hạ ngưỡng** — đúng cách dải 15–25 m đã được xử.
  - 🛑 **Mệnh đề (a) KHÔNG dựng nổi ở dạng tuyệt đối, và tôi dừng lại hỏi đúng như ghi chú
    của task dặn.** Đo 20 mã / **113.460 mốc**: **749 mốc (0,660%)** ra ngoài dải 15–35 m,
    dải thật là **[5,1; 40,3] m**. Nguyên nhân **không** phải đích đặt sai — trung vị khoảng
    cách là **25,00 m**, đúng tâm dải — mà là **độ trễ đuổi theo**, và độ trễ ấy bị chặn dưới
    bởi chính hai AC khác của spec: đổi từ *chạy về phía bóng 9 m/s* sang *chạy ra xa 9 m/s*
    thì **AC-38.11** cho 90°/s nên mất **2 giây**, mà trong 2 giây ấy **AC-38.4** kẹp người
    chạy lùi ở **4 m/s**. Bóng đi 18 m, trọng tài đi ≤ 8 m sai hướng → khe hở đổi **~16–20 m
    trong MỘT lần pha bóng đổi chiều**, trong khi dải chỉ cho **10 m** dư mỗi phía. Số đo khớp
    phép tính: lệch sâu nhất **19,87 m**, lệch xa nhất **15,3 m**.
  - ✅ **Người dùng chốt 2026-11-24 (câu 25): TÁCH ĐÍCH VÀ ĐỘ TRỄ, giữ nguyên con số 15–35 m.**
    AC-38.10 nay có **bốn** mệnh đề: (a) nói về **đích** và đúng **100% theo cấu trúc**;
    (b) và (c) như cũ; **(d) mới** kẹp độ trễ ở **20 m**. Hai đường kia đã bị loại khi hỏi:
    nới dải thành 5–41 m (41 m là 39% chiều dài sân, 5 m cho trọng tài đứng ngay trong pha
    bóng — đúng thứ đã bị từ chối ở câu 22), và miễn ba điểm khỏi AC-38.4/38.11 (phá D133 mà
    vẫn không chắc đạt).
  - 🐞 **Ba bản của `viTriTrongTai`, và hai bản đầu đều xanh ở mọi phép kiểm mà vẫn sai.**
    (1) *Một hướng vuông góc rồi kẹp vào sân* — phép kẹp kéo trọng tài về **sát quả bóng**
    ở những pha sát biên: 376/5.640 mốc ngoài dải, chỗ gần nhất **0,52 m**. (2) *64 hướng,
    chọn hướng xa đường chuyền nhất* — khoảng cách tới bóng nay đúng 25 m theo cấu trúc,
    nhưng đích **nhảy sang phía đối diện quả bóng** mỗi lần đường chuyền đổi chiều và trọng
    tài phải đi xuyên qua bóng: **5,17%** số mốc dưới 15 m. (3) *Chọn hướng **gần chỗ đang
    đứng nhất*** — đích đi liền theo bóng, không đổi phía. Phép kiểm **TÍNH LIỀN** là thứ
    duy nhất phân biệt được (2) với (3).
  - 🐞 **Và một lỗi hình học thật: vòng 25 m phải quây quanh CHỖ BÓNG ĐANG Ở, không quanh
    chỗ bóng sắp tới.** Bản nối đầu truyền `dBong` (đích của bóng); khi bóng còn cách đích
    20 m thì trọng tài đã ở vòng quanh **đích**, nên khoảng cách tới bóng **thật** tụt còn
    5 m — **3.338/28.440 mốc** dưới 15 m, nhỏ nhất **0,00 m**.
  - ⚠️ **Hai trợ lý phải lùi vào trong 3 m, không đứng đúng trên đường biên.** `buocCoHoc`
    xoay vector vận tốc ở cổng quay mà **giữ nguyên độ lớn**, nên một trợ lý đổi chiều có
    thành phần vận tốc **vuông góc** với biên trong vài bước — và nó mang ô ấy **ra ngoài
    sân**: **292 mốc** ở hai ô `AR1`/`AR2`. Cùng lý do ấy, đích trọng tài chính phải nằm
    trong lề **4 m** (đo quét 2/3/4/5: lề 2 còn 23 mốc ra ngoài, lề 3 còn 6, lề 4 về **0**).
    Cái giá: hậu vệ cuối vào sát biên ngang thì trợ lý lệch tối đa **3 m**.
  - 🐞 **Phép kiểm mệnh đề (b) RỖNG hai lần, và lần hai mới tìm ra bằng đột biến.** Bỏ hẳn
    phép lọc lề mà **53/53 phép kiểm vẫn xanh**. Lý do: `khoangToiDoan` đo tới **ĐOẠN**, nên
    với đoạn chuyền ngắn (nửa 12 m) thì một ứng viên nằm trên chính đường chuyền mà cách bóng
    25 m vẫn **vượt quá đầu đoạn 13 m** — hình học tự làm (b) đúng. Chữa bằng hai thứ: thêm
    chỗ đứng **đối nghịch** (trọng tài đứng đúng trên đường chuyền kéo dài) và cho nửa đoạn
    chạy cả **40 m** — đường chuyền thật dài tới 84 m. Sau đó đột biến mới giết được: 0 m so
    với lề 3 m.
  - 📏 **Kết quả cuối, 20 mã / 113.460 mốc:** (a) đích cách bóng đúng 25 m — lệch khỏi 25 m
    **< 1e-9** trên **8.568 bộ** hình học, tức đúng tới float; (b) khoảng cách tới đường
    chuyền nhỏ nhất **> 3 m** trên 17.136 bộ (có 2.000+ bộ bóng sát biên); (c) trợ lý lệch
    trung vị **0,13 m**, p95 **4,28**, p99 **6,58**, lớn nhất **13,31 m** (nêu 14 m);
    (d) độ trễ lớn nhất **19,87 m** (kẹp 20 m); gia tốc ba điểm **3,66 m/s²** dưới trần;
    **0 mốc** có ô ra ngoài sân.
  - ⚠️ **Con số 20 m chỉ dư 0,13 m, và nó đo trên mô hình bóng TẠM.** Quả bóng hiện bị kẹp
    chung trần 9 m/s với người (`TRAN_TOC_DO_BONG = 25` nhưng `buocCoHoc` kẹp lại 9).
    **T720** cho bóng vật lý thật, nên **T720 phải đo lại** con số này; phép kiểm mệnh đề (d)
    là thứ sẽ bắt được.
  - ✅ **Bảy phép đột biến, bảy phép kiểm đỏ**: chọn hướng xa đường chuyền nhất → TÍNH LIỀN
    đỏ (12,1 m so với ngưỡng 13 m — bản sai nhảy cả **50 m**); bỏ lọc lề đường chuyền → (b)
    đỏ; bỏ lề trong sân → 2 phép kiểm đỏ; trợ lý ra đúng biên → 1 rồi 2 phép kiểm đỏ; vòng
    quây quanh đích của bóng → (d) đỏ; ba điểm bắt đầu ở giữa sân → (c) đỏ.
  - ➕ **Phạm vi nới hai chỗ, nói rõ ở đây**: `tranLienTuc.ts` (task khai `coHoc.ts`,
    `coHoc.test.ts`, `loMoc.ts`) nhận mối nối ba ô trọng tài và chỗ xuất phát của chúng —
    T725 đã là chủ sở hữu của vòng phút, và điều kiện ra của T716 đòi **đo trên trận thật**
    nên không nối thì không đo được. Và `loMoc.ts` **0 dòng sửa**: T704 đã cấp 26 ô và T725
    đã làm đường ghi tổng quát, nên ba cột `REF`/`AR1`/`AR2` đi chung đường với 22 ô người.
  - 📏 Toàn bộ: **75 file / 1.527 phép kiểm xanh** (thêm 11); năm điều kiện ra của task chạm
    `src/engine/` đều đạt — ba file lưới **0 dòng sửa**, `PHIEN_BAN_ENGINE` vẫn **6**,
    `DB_VERSION` vẫn **3**, `SCHEMA_VERSION` vẫn **5**, `MOC_V6` không một ký tự.

**Xem được gì ngay sau Phase 54:** cầu thủ chạy, tăng tốc và **phanh** trong mức người thật làm
được; không ai nhảy một đoạn; người rê bóng đi **vòng qua** đối thủ; thủ môn **tự** ở lại sân
nhà thay vì bị lớp vẽ kéo về; mỗi điểm có một **hướng nhìn**. Sân sẽ trông **TĨNH hơn** trước
vì lớp dao động đã tắt — **phải báo trước.**

---

## Phase 55 — Bóng có độ cao, và điều kiện trận

- [x] **T720** [P] — `lienTuc/vatLyBong.ts`: `z`/`vz`, `tocDoDuongBong`, `thoiGianBay = d/v`
  - File: tạo `src/engine/lienTuc/vatLyBong.ts`, `src/engine/lienTuc/vatLyBong.test.ts`
  - Xong khi: chuyền ngắn trong **12–20** m/s, chuyền dài và sút trong **20–30** m/s, và
    `|thoiGianBay − d/v| < 1e-9` trên 1.000 bộ.
  - AC: AC-38.6
  - Phụ thuộc: T704
  - Ghi chú: **không đổi stride** — `plan.md` mục 0 đã đặt `z` và `vz` vào tám ô
    (`x, y, z, vx, vy, vz, huong, coMat`) từ Phase 53, nên T720 không chạm `loMoc.ts`.
  - 🐞 **Một lỗi thật, và nó vỡ ngay mốc đầu tiên: đường chuyền SỆT tụt xuống DƯỚI mặt sân.**
    Bản đầu để công thức parabol chạy tự do, nên với góc phát 0 thì `z = −0,049 m` ở giây
    0,1 — trọng lực kéo một quả bóng đang lăn xuyên qua mặt đất. AC-38.5 đòi `chuyen` và
    `re-bong` có **`z ≡ 0`**, nên mặt đất phải là một **sàn**. Chữa bằng `giayChamDat` giải
    từ `z(t) = 0`: đường sệt ra đúng `0`, tức `z ≡ 0` đúng **theo cấu trúc** chứ không nhờ
    một phép so sánh nào. Và phép kẹp ấy **không phá tính nửa nhóm** — đã kiểm cả ca bước
    dài **băng qua** đúng lúc chạm đất.
  - ⚠️ **Mệnh đề "`|thoiGianBay − d/v| < 1e-9`" của điều kiện ra, đọc nguyên văn, là RỖNG:**
    `thoiGianBay` **được định nghĩa bằng** `d / v`, nên so nó với `d / v` là so một thứ với
    chính nó. Tôi để lại một dòng ấy cho đủ chữ của task, nhưng phép kiểm **có răng** hỏi
    câu mà AC hỏi: *quả bóng phát với tốc độ ấy có TỚI ĐÍCH đúng vào giây thứ `d/v` không*
    — **1.296 bộ**, lệch lớn nhất **< 1e-9**.
  - ✅ **Quyết định 1: `tocDoDuongBong` là tốc độ NGANG, không phải tốc độ dọc theo quỹ đạo.**
    Nhờ thế `thoiGianBay = d/v` đúng với **mọi** góc phát. Phương án bị loại (lấy `v` làm
    tốc độ dọc quỹ đạo) biến mệnh đề thứ hai của AC-38.6 từ **tuyệt đối** thành **gần đúng**
    ở mọi quả tạt — thời gian bay thành `d / (v·cos góc)` — mà không đổi lấy thứ gì.
  - ✅ **Quyết định 2: quỹ đạo là CÔNG THỨC ĐÓNG, không tích phân từng bước.** Hai lý do:
    `loMoc.ts` đã dặn engine **không đọc lại vận tốc từ lô** vì lô là `Float32Array`, nên
    tích phân từng bước qua 11.400 bước một trận là đúng thứ nó cảnh báo; và `zKhiToi` của
    **T721** phải **giải** góc phát bằng đại số, không dò bằng vòng lặp. Phép kiểm canh
    quyết định này là **TÍNH NỬA NHÓM**: đi một bước `t1+t2` ra đúng kết quả của hai bước
    `t1` rồi `t2` — thứ mà Euler, kể cả Euler "dùng vận tốc mới" của `buocCoHoc`, **không**
    có.
  - ✅ **`re-bong` KHÔNG phải quả bóng được đánh đi**, nên dải 12–30 m/s của AC-38.6 không
    nói về nó. Nó trả lại `TRAN_TOC_DO_TUYET_DOI` của `coHoc.ts` — **không gõ số 9 lần thứ
    hai** — và một phép kiểm canh nó nằm **dưới** đáy dải, để phép kiểm dải không bao giờ
    đo lẫn quả bóng trong chân người dẫn.
  - 📏 **Hai dải LIỀN nhau ở đúng ngưỡng 25 m** (đỉnh dải ngắn **bằng** đáy dải dài, cùng
    20 m/s), nên một đường 24,9 m và một đường 25,1 m không chênh một bước nhảy — bước nhảy
    ấy sẽ hiện lên sân 2D thành quả bóng đột ngột tăng tốc giữa pha, đúng lớp lỗi "như kiểu
    teleport" người dùng đã bắt bằng mắt ở spec 005.
  - ✅ **Năm phép đột biến, năm lần đỏ**: phân tích tốc độ dọc quỹ đạo (cos) → 2 đỏ; bỏ sàn
    mặt đất → 4 đỏ; tích phân Euler cho `z` → 4 đỏ; đỉnh dải ngắn vượt 20 → 2 đỏ; cú sút rơi
    vào dải ngắn khi gần → 2 đỏ.
  - ✅ **`loMoc.ts` 0 dòng sửa** — `plan.md` mục 0 đã đặt `z`/`vz` vào tám ô từ Phase 53.
    Và `vatLyBong.ts` **không rút một lần nào**: một phép kiểm quét chính mã nguồn tìm `rng`,
    `Math.random` và `hatGiong`, kèm **ca ngược** chứng minh nó đỏ được.
  - ⚠️ **Nợ của T706 vẫn chưa trả, và nó KHÔNG phải nợ của T720.** T706 ghi "không đường
    chuyền nào dưới sàn 12 m/s của AC-38.6" là điều kiện ra của T720. Sàn 12 m/s nay **có**
    — `tocDoDuongBong` không trả gì dưới 12 cho một quả bóng được đánh đi — nhưng câu ấy nói
    về **đường chuyền trong lô mốc**, và lô mốc vẫn cho bóng đi 9 m/s vì chưa ai gọi module
    này. Xem khối ⚠️ ở cuối Phase 55.
  - 📏 Toàn bộ: **76 file / 1.547 phép kiểm xanh** (thêm 20); năm điều kiện ra của task chạm
    `src/engine/` đều đạt.

- [x] **T721** — `zKhiToi` cho `tat-canh` rơi trong [1,5; 2,8] và **chính hàm ấy** phát `trang_thai: 'danh_dau'`
  - File: `src/engine/lienTuc/vatLyBong.ts`, `src/engine/lienTuc/vatLyBong.test.ts`
  - Xong khi: mọi khung có `trang_thai === 'danh_dau'` thì `z ∈ [1,5; 2,8]`; `chuyen` và
    `re-bong` có `z ≡ 0`; **và** `npx vitest run src/engine/suKien.test.ts src/ui/tuongThuat.test.ts src/ui/ngonNgu/ngonNgu.test.ts`
    xanh với **0 dòng sửa**.
  - AC: AC-38.5
  - Phụ thuộc: T720
  - Ghi chú — **`'danh_dau'` là một giá trị của `trang_thai` TRONG TỆP XUẤT, KHÔNG phải một
    `LoaiHanhDong` mới.** Thêm nó vào `LoaiHanhDong` (`chuoiBong.ts:29`) thì **lưới mỏng hơn
    tưởng** — đã thử bằng `tsc`:
    - `suKien.test.ts:347-357` khẳng định tập ấy đúng **bốn** giá trị
      `['chuyen','re-bong','sut','tat-canh']`, nhưng nó **thu tập các `b.loai` thực sự xuất
      hiện** trên 10 mã trận — tức nó đo **đầu ra của engine**, không đọc kiểu. Nó đỏ khi
      engine **bắt đầu phát** giá trị mới, **không** khi kiểu được mở rộng.
    - `phaBong.ts` xử lý `LoaiDoan` ở **hai chỗ KHÔNG vét cạn** (`thoiLuongDoan` `:218`,
      `roiChan` `:324`; `:24` chỉ là khai báo kiểu). Cả file chỉ có **một** `switch`, ở `:114`,
      và nó switch trên **`LoaiSuKien`** chứ không phải `LoaiDoan`. Nên một giá trị
      `LoaiHanhDong` mới **rơi im lặng** qua đây: `roiChan` trả `false`, `thoiLuongDoan` rơi
      vào nhánh mặc định. **Không đỏ ở `tsc`.** Thử nghiệm: thêm một giá trị cho đúng **một**
      lỗi `tsc`, ở `chuoiBong.test.ts:145` (TS7053), **không** ở `phaBong.ts`.
    - Hai chỗ đọc `'tat-canh'` ở `tran.ts:789` và `:875` cũng không vét cạn.
    Kết luận: `'danh_dau'` **phải** là giá trị của `trang_thai` trong tệp xuất, **không** phải
    một `LoaiHanhDong` mới — vì nếu làm sai, **không lưới nào bắt được**.
  - ⚠️ **Chữ ký của `plan.md` mục 5 KHÔNG làm được việc mà task đòi — nêu chứ không im.**
    Contract ghi `zKhiToi(d, v0, gocPhat) => number`, nhưng task đòi *"`zKhiToi` **chọn**
    tham số để rơi trong [1,5; 2,8] và **chính hàm ấy** phát `trang_thai`"*: một hàm **nhận**
    góc phát thì không **chọn** được góc phát, và một hàm trả `number` thì không phát được
    nhãn. Nên lát này dựng **hai tầng**, tầng dưới giữ **đúng** chữ ký contract:
    `zTaiNoiToi(d, v0, gocPhat): number` (nguyên văn), `gocPhatTatCanh(d, v0)` (giải bằng
    đại số), và `zKhiToi(d, loai): { z, trangThai }` ở trên.
  - ✅ **Nhãn `danh_dau` phát ra CÙNG CHỖ với `z`, nên AC-38.5 đúng theo cấu trúc.** Nhãn
    **không thể** tồn tại với một `z` ngoài dải, vì chính phép kiểm dải là thứ sinh ra nhãn.
    Phương án bị loại: để lớp xuất tệp gắn nhãn theo `loai === 'tat-canh'` — lúc ấy nhãn và
    `z` là hai đường độc lập và AC-38.5 chỉ còn là một lời hứa. Đã đột biến đúng ca ấy
    (nhắm 3,0 m + nhãn phát từ `loai`): **4 phép kiểm đỏ**.
  - ✅ **Phép giải là MỘT DÒNG ĐẠI SỐ, không dò bằng vòng lặp**: `z = d·tan(góc) − g·T²/2`
    đảo thành `tan(góc) = (zNhắm + g·T²/2) / d`. Đây là chỗ quyết định "công thức đóng" của
    T720 trả lãi.
  - ⚠️ **Phép kiểm xương sống là phép ĐỐI CHIẾU HAI ĐƯỜNG**: `zKhiToi` giải độ cao bằng đại
    số, còn `phatBong` + `bongTaiThoiDiem` dựng nó bằng quỹ đạo. Hai đường độc lập, lệch lớn
    nhất **< 1e-9** trên 60 quãng. Không có nó thì một hàm chỉ việc `return 2.15` vẫn xanh
    mọi phép kiểm còn lại — và đột biến **sai một dấu** trong phép giải cho **6 phép kiểm đỏ**
    đúng vì nó.
  - ⚠️ **Nhánh `false` của phép kiểm dải KHÔNG tới được từ `zKhiToi`** (quả tạt luôn được
    chọn góc để rơi đúng giữa dải). Nên nó được bóc thành vị từ có tên `laTamDanhDau`, gọi
    được **cả hai nhánh** trực tiếp — không phải mã chết mà là một **cái chốt**: đổi
    `Z_TAT_CANH_NHAM` ra ngoài dải thì nhãn **tắt** chứ không đi kèm độ cao sai.
  - 📏 **Nhắm GIỮA dải (2,15 m), lề 0,65 m mỗi phía** — không sát mép, nên không sai số float
    nào đẩy nổi một quả tạt ra ngoài dải mà AC-38.5 canh. Góc phát giải ra: **65,4°** ở quãng
    1 m (một cú đưa bóng gần), **29,4°** ở 5 m, **21,4°** ở 25 m, **19,9°** ở 60 m.
  - 🐞 **Góc phát KHÔNG đơn điệu trên toàn dải, và tôi nêu cả hai chỗ nó tăng kèm con số**
    thay vì viết một phép kiểm sai rồi nới cho nó xanh. (1) **[25; 26,25] m tăng tổng
    0,0019°** — hai dải tốc độ có độ dốc khác nhau (0,32 so với 0,286 m/s mỗi mét), nên ngay
    sau chỗ chia tốc độ lớn chậm hơn quãng. (2) **Sau 60 m tăng 0,061° mỗi 0,25 m** — đây
    **không** phải lỗi mà là vật lý: `QUANG_CHUYEN_DAI_NHAT` là chỗ tốc độ chạm trần 30 m/s,
    nên xa hơn thì chỉ còn cách nâng cao hơn. Một quả bóng 90 m **phải** bổng hơn quả 60 m.
    Ba phép kiểm thay chỗ một: giảm nghiêm ngặt ở hai đoạn thật sự giảm, chỗ chia lệch dưới
    0,01°, và **quá trần thì tăng** — mệnh đề cuối là **ca ngược**, đỏ nếu ai bỏ trần tốc độ.
  - ✅ **`sut` cũng SỆT**, vì D129 đo rồi mới chốt: `tat-canh` là hành động **duy nhất** có z
    vượt 1,5 m (3.138/37.202 bước không-sút = 8,4%). Một cú sút nâng lên khỏi mặt sân là
    **ngoài** spec 007. Đột biến cho `sut` được nâng → 1 phép kiểm đỏ.
  - ✅ **Hai bản sao của con số 1,5 m có phép kiểm giữ chúng khớp nhau**: `Z_DANH_DAU_THAP`
    ở `vatLyBong.ts` và `NGUONG_Z_GIO` ở `dieuKien.ts`. Hai file **phải** tách vì T723 sẽ
    nhập `MA_SAT_LAN_SET` từ `dieuKien.ts` — để chung là nhập vòng. "Bóng bổng" phải có
    **một** định nghĩa.
  - ✅ **Điều kiện ra thứ hai đạt**: `suKien.test.ts`, `tuongThuat.test.ts` và
    `ngonNgu.test.ts` xanh (**272 phép kiểm**) với **0 dòng sửa**; `chuoiBong.ts` và
    `phaBong.ts` cũng **0 dòng** — `danh_dau` là giá trị của `trang_thai` trong tệp xuất,
    không phải một `LoaiHanhDong` mới, đúng kết luận mà ghi chú của task đã chứng minh bằng
    `tsc`. Enum đóng 14 giá trị vẫn là của **T740**.
  - ✅ **Năm phép đột biến, năm lần đỏ.** Toàn bộ: **77 file / 1.574 phép kiểm xanh**.

- [x] **T722** [P] — `lienTuc/dieuKien.ts`: thời tiết và gió là hàm băm **thuần**, 0 lần rút
  - File: tạo `src/engine/lienTuc/dieuKien.ts`, `src/engine/lienTuc/dieuKien.test.ts`
  - Xong khi: cùng mã trận → cùng thời tiết và gió, trên 20.000 mã; **và** `taoTran` vẫn tiêu
    **đúng 3** lần rút trước khi cất hạt giống — chứng minh bằng `taiLap.test.ts` và `MOC_V6`
    còn xanh, **không** bằng cách đếm trong chú thích (lệnh cấm số 2).
  - AC: AC-38.9, AC-45.7
  - Phụ thuộc: T702
  - Ghi chú: repo đã có **hai** hàm băm — `hatGiongTuMaTran` (xmur3) ở `rng.ts`, và một **bản
    sao riêng** của hằng số xmur3 (`2246822507`) ở `src/ui/daoDong.ts:97`. Dùng lại
    `hatGiongTuMaTran`; đừng sinh bản thứ ba. Nếu refactor nó để tham số hoá hằng tròn thì
    `rng.test.ts:38-41` đỏ (vector cố định) — đó là **lưới đúng**, không phải chướng ngại.
  - ✅ **"0 lần rút" được CHỮ KÝ bảo vệ, không phải được chú thích bảo vệ.**
    `dieuKienTuMaTran(maTran: string)` không nhận `Rng`, nên nó **không thể** rút một lần
    nào — đúng cách D130 định. Cộng thêm một phép kiểm quét chính mã nguồn tìm `taoRng`,
    `.next(`, `Math.random` và `Rng`, kèm **ca ngược** chứng minh nó đỏ được.
  - ✅ **Không có hàm băm thứ ba.** Repo đã có hai (`hatGiongTuMaTran` ở `rng.ts`, và một
    **bản sao hằng số xmur3** ở `ui/daoDong.ts`). Module này **gọi lại** `hatGiongTuMaTran`,
    và một phép kiểm grep bốn hằng số xmur3 trong chính nó để chắc không ai chép bản thứ ba.
    `TRON_DIEU_KIEN = 0x9e3779b9` chỉ **tách lớp**, không băm — và một phép kiểm canh nó
    **khác** `BUOC_HAT_GIONG` của mulberry32, đúng điều D130 đòi.
  - ⚠️ **Phép kiểm quan trọng nhất của task này là phép CHỐNG RỖNG.** Một hàm trả `kho` cho
    **mọi** mã trận sẽ xanh cả hai mệnh đề đầu của điều kiện ra: nó tất định, và `kho` nằm
    trong dải. Nên phải đòi cả **năm** kiểu thật sự xuất hiện, đòi **thứ tự tần suất** khớp
    bảng trọng số, và đòi tần suất đo được **gần** trọng số trong lề 3 điểm phần trăm. Đã
    đột biến đúng ca ấy: `thoiTiet: 'kho'` cứng → 2 phép kiểm đỏ.
  - ⚠️ **Ba đại lượng phải lấy từ BA LỚP BĂM khác nhau.** Dùng chung một lớp thì thời tiết
    **kéo theo** hướng gió: mọi trận mưa to có gió cùng một phía, và người xem thấy điều đó
    trước khi phép kiểm nào thấy. Phép kiểm canh nó: mỗi kiểu thời tiết phải có đủ **bốn**
    phía gió. Đột biến dùng chung lớp → đỏ.
  - ➕ **Một con số của task này, không của plan: PHÂN PHỐI thời tiết.** D130 chốt **bảng ma
    sát** nhưng để phân phối mở. Chia đều năm kiểu thì **một phần năm** số trận là mưa to —
    nhiều hơn hẳn một mùa giải thật. Trọng số chốt: khô 40%, ẩm 25%, nóng 15%, mưa 15%,
    **mưa to 5%**. Đo trên 20.000 mã: 40,06 | 24,75 | 15,40 | 14,87 | **4,92%**.
  - 📏 **Đo trên 20.000 mã, và 20.000 mã ấy RIÊNG BIỆT** (đã đếm: 20.000/20.000, nên "20.000
    mã" của điều kiện ra không rỗng): cùng mã luôn ra cùng điều kiện; gió rải đều bốn phía
    (25,01 | 24,80 | 25,17 | 25,02%); gió trung bình **3,97 m/s** trên dải [0; 8].
  - ✅ **Hai mệnh đề của AC-38.7 viết thành cấu trúc**: ba kiểu sân khô nằm trong dải **1–2
    m/s²** (1,85 | 1,60 | 1,30), hai kiểu mưa nằm **dưới 1** (0,95 | 0,75). Và **chiều** của
    bảng — sân ướt thì bóng đi **xa hơn**, chiều người dùng chốt 2026-11-23 — có phép kiểm
    đơn điệu riêng, nên nếu một ngày ai "sửa lại cho đúng trực giác" thì nó đỏ.
  - ✅ **Hai cửa của gió tách thành `gioCoAnVaoDuongBong`**, không viết `if` rải trong thân
    hàm — vì **T723** phải chứng minh mệnh đề **chống mã chết** (gió 0 so với 7,75 m/s trên
    đường sệt ra vị trí giống hệt), và một điều kiện nằm rải thì phép kiểm ấy không có gì để
    trỏ vào. Phép kiểm canh cả bốn tổ hợp bổng/sệt × dài/ngắn, và canh **đúng ngưỡng** chứ
    không gần ngưỡng: đột biến `&&` → `||` và `>` → `>=` đều cho 2 phép kiểm đỏ.
  - ✅ **Sáu phép đột biến, sáu lần đỏ.** Và điều kiện ra thứ hai đạt **mà không phải đếm**
    (lệnh cấm số 2): `taiLap.test.ts`, `MOC_V6` và `rng.test.ts` còn xanh với **0 dòng sửa**,
    nên `taoTran` vẫn tiêu đúng 3 lần rút.
  - 📏 Toàn bộ: **77 file / 1.563 phép kiểm xanh** (thêm 16).

- [x] **T723** — Ma sát lăn sệt + gió **chỉ** ăn vào bóng bổng dài
  - File: `src/engine/lienTuc/vatLyBong.ts`, `src/engine/lienTuc/vatLyBong.test.ts`
  - Xong khi: phép kiểm **đơn điệu nghiêm ngặt** trên năm giá trị `MA_SAT_LAN_SET` (nóng 1,85 |
    khô 1,60 | ẩm 1,30 | mưa 0,95 | mưa-to 0,75 — **sân ướt thì bóng đi XA hơn**, chiều người
    dùng chốt 2026-11-23); **và** phép kiểm **chống mã chết**: gió 0 so với 7,75 m/s trên một
    đường **sệt** phải ra vị trí **giống hệt từng số**.
  - AC: AC-38.7, AC-38.9
  - Phụ thuộc: T720, T722
  - Ghi chú: `MA_SAT_LAN_SET` và `HE_SO_GIO` **import từ `dieuKien.ts`**, vì T742 sẽ đọc
    **chính** hai hằng số ấy để đo quãng bóng lăn — đặt sai chỗ là buộc T742 đọc từ hai nguồn.
  - 🐞 **Một lỗ thật trong bộ phép kiểm, tìm ra bằng ĐỘT BIẾN chứ không bằng đọc lại.** Tôi
    đột biến `t - tDat` thành `t` — tức cho **ma sát mặt sân ăn cả vào pha BAY** — và
    **43/43 phép kiểm vẫn xanh**. Lý do nó lọt: đường chuyền sệt có `tDat = 0` nên không đổi
    gì, còn hai phép kiểm gió thì so gió-0 với gió-7,75 **trên cùng một ma sát**, nên đột
    biến **triệt tiêu ở cả hai vế**. Hệ quả nếu để nguyên: mọi quả tạt **rơi ngắn** hơn đích
    — đo được **thiếu 37,5 m** trên một quả tạt 40 m — và AC-38.6 vỡ ở đúng những pha bổng.
    Chữa bằng một phép kiểm mới: quả tạt phải tới **đúng đích** trong **cả năm** kiểu thời
    tiết. Nay đột biến ấy đỏ.
  - ⚠️ **Mệnh đề "chống mã chết" của task phải là một CẶP, không phải một phép kiểm.**
    (1) gió 0 so với gió 7,75 m/s trên đường **sệt** ra vị trí **giống hệt từng số** — cửa
    gió thật sự đóng; (2) cùng hai mức ấy trên đường **bổng dài** ra vị trí **khác nhau** —
    đoạn mã gió không phải mã chết. Chỉ (1) thì một hàm **bỏ hẳn gió** cũng xanh; chỉ (2) thì
    một hàm **thổi gió vào mọi đường bóng** cũng xanh. Đã đột biến cả hai chiều, mỗi chiều
    đỏ đúng phần của nó.
  - ✅ **Và cửa thứ hai cũng có phép kiểm riêng**: quả bóng **bổng mà NGẮN** (dưới 25 m) cũng
    không bị gió — chữ của AC-38.9 là "bóng bổng **dài**". Phép kiểm ấy kèm một mệnh đề chống
    rỗng: `dinhQuyDao` của đường bóng ấy phải **thật sự** vượt ngưỡng 1,5 m, không thì nó
    xanh vì lý do khác.
  - ✅ **Hai thứ ăn vào HAI PHA khác nhau, và đó là cả nội dung của lát này**: ma sát ăn vào
    pha **lăn** (trước khi chạm đất thì mặt sân không chạm vào bóng), gió ăn vào pha **bay**
    (sau khi chạm đất, gió không đẩy nổi quả bóng đang lăn trên cỏ).
  - 📏 **Điều kiện ra thứ nhất đo trên HÀNH VI, không trên bảng số**: cùng một lực đẩy 20 m/s,
    quãng lăn **đơn điệu nghiêm ngặt** qua năm kiểu thời tiết, và mưa to cho hơn **gấp đôi**
    trời nóng. Gia tốc chậm dần **đo từ hai mốc vận tốc** khớp bảng tới 1e-9, và ba kiểu sân
    khô nằm trong dải **1–2 m/s²** của AC-38.7. Đột biến "mọi thời tiết dùng chung ma sát
    khô" → **3 phép kiểm đỏ**.
  - 📏 **Con số của gió, để biết nó có đáng kể trên hình**: một quả tạt 40 m trong gió 7,75
    m/s lệch **hơn nửa mét** (dưới 2 m) — thấy được mà không méo pha bóng.
  - ✅ **`huongGio` và `thoiTiet` đều có phép kiểm chứng minh chúng ĐƯỢC ĐỌC**: hai hướng gió
    cho hai chỗ rơi lệch nhau hơn 1 m; hai kiểu thời tiết cho hai chỗ dừng lệch nhau hơn 5 m.
    Không có chúng thì `huongGio` của `dieuKien.ts` là một trường không ai đọc.
  - ✅ **`MA_SAT_LAN_SET` và `HE_SO_GIO` NHẬP từ `dieuKien.ts`**, không khai lại — T742 sẽ đọc
    chính hai hằng số ấy. `vatLyBong.ts` → `dieuKien.ts` là một chiều, không vòng:
    `dieuKien.ts` chỉ nhập từ `../rng`, và `boundaries.test.ts` còn xanh.
  - ⚠️ **`bongTrongDieuKien` KHÔNG có tính nửa nhóm, khác `bongTaiThoiDiem`** — phải gọi với
    trạng thái **lúc rời chân** và thời điểm **tuyệt đối**, vì pha lăn phụ thuộc *thời gian kể
    từ lúc chạm đất* mà một trạng thái giữa đường không mang theo con số ấy. Đã ghi ⚠️ vào
    đầu hàm.
  - ✅ **Sáu phép đột biến, sáu lần đỏ** (sau khi lấp lỗ ở trên). Toàn bộ: **77 file / 1.587
    phép kiểm xanh**.

- [x] **T724** [P] — Nhãn thời tiết song ngữ nhồi vào khối `TRAN_DAU`, hiện cạnh mã trận
  - File: `src/ui/ngonNgu/vi.ts` (khối `TRAN_DAU_VI`), `src/ui/ngonNgu/en.ts`
    (`TRAN_DAU_EN`), `src/ui/pages/TrangTran.tsx`
  - Xong khi: `npx vitest run src/ui/ngonNgu/ngonNgu.test.ts` xanh **với 0 dòng sửa ở file
    ấy**; và `npx tsc --noEmit` sạch.
  - AC: AC-38.9, và P8
  - Phụ thuộc: T722
  - Ghi chú — **đây đúng là ca `MS_MOI_PHUT` của spec 005, chỉ ở một file khác.**
    `ngonNgu.test.ts:65` đặt `TEN_KHOI = Object.keys(BO_CHUOI.vi)` và dò đường dẫn khoá **đệ
    quy** (`:49-52`), nên thêm nhãn vào `TRAN_DAU` **tự động** thêm bốn khẳng định: không khoá
    nào lệch vi↔en, không khoá nào rỗng, cùng khoá thì cùng kiểu, và bản EN không còn dấu tiếng
    Việt (regex `DAU_TIENG_VIET`). **Nhồi vào khối có sẵn** nên **không** phải chạm bốn chỗ của
    `ngonNgu/index.ts` — đó là phần thưởng của việc không tạo khối mới. `TRAN_DAU_EN` khai
    `BanDich<typeof TRAN_DAU_VI>` nên thiếu một khoá là **lỗi `tsc`**, không phải lỗi test.
  - 🐞 **Một lỗi THẬT mà 1.587 phép kiểm không thấy, và tôi thấy nó bằng MẮT** — đúng điểm
    mù R52: `src/ui/pages` không có một phép kiểm nào (`environment: node`, không jsdom).
    Nhãn in ra **"gió 4.0 m/s dọc sân"** — dấu **chấm** trong một câu tiếng Việt, vì
    `toFixed(1)` luôn ra dấu chấm. Chữa bằng `DINH_DANG.maVung`, thứ repo đã có **sẵn cho
    đúng lớp lỗi này**: chú thích của nó ở `ngonNgu/vi.ts` nói thẳng rằng đặt cứng một kiểu
    định dạng là **trộn hai ngôn ngữ trên một màn hình**, đúng điều P8 cấm. Nay tiếng Việt
    ra **4,0** và tiếng Anh ra **4.0**.
  - 📏 **Đã mở trình duyệt xem thật, cả hai ngôn ngữ, trên một trận đang chạy** (mã
    `K7M2R9XQ4B`, chế độ liên tục): *"Điều kiện: mưa, gió 4,0 m/s dọc sân"* và *"Conditions:
    rain, 4.0 m/s wind along the pitch"*. **0 lỗi console**. Đây là lát duy nhất của Phase 55
    có thứ **nhìn thấy được**, nên nó phải được nhìn.
  - ➕ **Một ký hiệu nới ra ngoài danh sách file, nêu chứ không im**: `chieuCuaGio` +
    `NUA_CUNG_CHIEU_GIO` đặt ở `dieuKien.ts` chứ không ở `TrangTran.tsx`. Quy tắc ±22,5° là
    một **quy tắc thật** và nó thuộc về **hình học sân**, không thuộc về ngôn ngữ; để trong
    một file `pages` là để một quy tắc **không ai canh**. Ở `dieuKien.ts` thì nó có 6 phép
    kiểm, gồm phép kiểm **từng mép cung** và phép kiểm **tuần hoàn 180°**.
  - ⚠️ **Không gọi gió là bắc/nam/đông/tây.** `huongGio` là một góc trong hệ toạ độ **của
    sân**, không phải một phương địa lý — sân này không có la bàn. Nói "gió bắc" là nói một
    điều mà dữ liệu **không biết**. Nên nhãn nói **dọc sân / ngang sân / chéo sân**, và chiều
    là một **phương** chứ không phải một **hướng** (gió thổi theo `+x` và `−x` đều là dọc).
  - 🐞 **Và một khẳng định của chính tôi bị phép đo bác lại.** Bản đầu của phép kiểm phân phối
    đòi `chéo > dọc + ngang` với lý lẽ "cung chéo rộng gấp đôi". Lý lẽ **đúng** nhưng kết
    luận **sai**: cung chéo rộng 90° trong nửa vòng 180°, tức đúng **một nửa**, nên `chéo`
    xấp xỉ **bằng** `dọc + ngang`. Đo được **9.986 so với 10.014** — mệnh đề ấy là một lần
    tung đồng xu. Nay nó đòi đúng thứ hình học nói: 50/25/25.
  - ✅ **Nhồi vào khối `TRAN_DAU` đã có**, nên `ngonNgu.test.ts` tự phủ bốn khẳng định lên sáu
    khoá mới (không lệch vi↔en, không rỗng, cùng kiểu, bản EN không còn dấu tiếng Việt) mà
    **0 dòng sửa** ở file ấy — và không phải chạm bốn chỗ của `ngonNgu/index.ts`.
  - ⚠️ **`motChuSoThapPhan` trong `TrangTran.tsx` KHÔNG có phép kiểm tự động**, và tôi nói
    thẳng ra thay vì để trống: nó nằm trong một file `.tsx` ở `pages`, đúng chỗ R52 chỉ. Nó
    được kiểm **bằng mắt, hai ngôn ngữ**, và con số nó in ra có `DINH_DANG.maVung` làm nguồn
    duy nhất. **T761** là chỗ danh sách kiểm bằng mắt sống.
  - ✅ Toàn bộ: **77 file / 1.593 phép kiểm xanh** (thêm 6); `npx tsc --noEmit` sạch.


- [x] **T726** — **Nối vật lý bóng vào lô mốc** (lấp lỗ thứ bảy, người dùng chốt 2026-11-24)
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/tranLienTuc.test.ts`,
    `src/engine/lienTuc/coHoc.ts` (lề độ trễ), `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: trên 10 mã, ở **mọi** mốc — (a) tốc độ quả bóng hoặc **đúng bằng** trần tốc độ
    NGƯỜI (bóng trong chân người dẫn) hoặc nằm trong **[12; 30] m/s** của AC-38.6, và
    **không một đường bóng được đánh nào dưới sàn 12 m/s** — đúng món nợ **T706** ghi;
    (b) quả bóng **không teleport**: giữa hai mốc đã ghi đi không quá `30 m/s × 1 giây`;
    (c) `z` **thật sự** lớn hơn 0 ở các quả tạt và rơi trong dải đánh đầu, còn 25 ô người
    có `z ≡ 0`; (d) điều kiện trận **mang theo** đúng thứ mã trận sinh ra.
  - AC: **AC-38.5**, **AC-38.6**, AC-38.9, AC-37.1 — và trả nợ cho **T706**
  - Phụ thuộc: T720, T721, T722, T723, T725
  - 🐞 **Lỗ này là lỗ THỨ BẢY cùng hình dạng**, tìm ra lúc implement T720 bằng cùng một
    phép soát: grep từng ký hiệu của bảng Contracts rồi hỏi *ai gọi nó*. Năm task của
    Phase 55 chạm đúng bốn nhóm file và **không task nào** chạm `tranLienTuc.ts`.
  - ⚠️ **MỘT ĐOẠN GIAO BÓNG LÀ MỘT LẦN RỜI CHÂN, và nó tới đích đúng giây `d/v`.** Trong
    một đoạn, quả bóng đi **tốc độ không đổi** — không ma sát mặt sân — vì AC-38.6 nói
    thời gian bay **phải khớp** `d/v` và đó là mệnh đề **tuyệt đối**. Một quả bóng vừa bị
    ma sát hãm vừa phải tới đúng giây ấy là hai điều **không cùng đúng được**.
  - ⚠️ **Hệ quả phải nói thẳng: `MA_SAT_LAN_SET` của AC-38.7 CHƯA có người gọi trong vòng
    phút.** Mô hình pha bóng của `dienPha.ts` không có trạng thái "bóng lăn tự do": mỗi
    hành động **giao** bóng tới một vùng, và `vungKetThuc` là chỗ pha kết thúc **theo định
    nghĩa**. Ma sát chỉ có việc khi có quả bóng **không ai điều khiển** — thứ **spec 008**
    mang vào cùng luật IFAB. Hôm nay nó được canh ở mức **hàm thuần** (5 phép kiểm ở
    `vatLyBong.test.ts`) và **T742** sẽ đo lại trên tệp xuất. **Gió thì CÓ người gọi.**
  - 🐞 **Mệnh đề (d) của AC-38.10 đỏ ngay, đúng như T720 đã gài.** Lề 20 m đo khi bóng còn
    bị kẹp 9 m/s; bóng bay 30 m/s thì nó thành **46,48 m**. Người dùng chốt (câu 26): đổi
    neo sang **chỗ pha bóng sắp tới** và nới lề **20 → 50 m**. Ba chính sách đã đo: bám quả
    bóng **46,5**, bám chỗ pha bóng **37,9** (10 mã) / **48,09** (20 mã). Sàn của độ trễ là
    **số học của lưới thời gian**: mỗi hành động 2 giây, hai tâm vùng cách tới 84 m, trọng
    tài đi được 18 m → **không chính sách nào xuống dưới ~33 m**.
  - ✅ **Đã kiểm đuôi ấy là VẬT LÝ chứ không phải LỖI**, trước khi xin nới số: quả bóng
    **không teleport lần nào**, nhảy xa nhất **đúng 30,00 m** giữa hai mốc = `30 m/s × 1 s`.
    Ca tệ nhất đọc ra được: bóng ở (19, 18) chạy 21,7 m/s, trọng tài ở (73, 50) chạy 7,6 —
    pha bóng vừa đổi đầu sân.
  - 🐞 **Một phép kiểm cũ của chính tôi đỏ, và nó đỏ ĐÚNG.** T721 khẳng định
    `lề độ trễ < 25 m` với lý lẽ: lề ≥ 25 thì (d) cho phép khoảng cách bằng 0, tức trọng
    tài đứng trên quả bóng. Lý lẽ **vẫn đúng**, và người dùng đã **chọn trả đúng cái giá
    ấy** sau khi nó được nói ra bằng số. Phép kiểm nay canh thứ **vẫn còn có răng**: dải mà
    (d) cho phép (25 + 50 = 75 m) phải **hẹp hơn chiều dài sân** — nó vẫn bắt được điểm
    trọng tài **chết hẳn hoặc bay loạn**, và câu chú thích nói thẳng thứ đã mất.
  - 🐞 **`LE_FLOAT32 = 1e-6` gõ tay của T725 KHÔNG đủ, và phép kiểm đỏ đúng vì thế.** Bước
    float32 **tỉ lệ với giá trị**: quanh 9 là 9,5e-7 (nên 1e-6 vừa đủ), quanh 30 là 1,9e-6,
    quanh 105 là 7,6e-6 — và một khoảng cách dựng từ hai hiệu toạ độ còn cộng dồn: đo được
    **5,1e-6**. Lề nay **dẫn xuất** từ chính giá trị đang so (`leLo`), không gõ tay.
  - 🐞 **Một dòng MÃ CHẾT, tìm ra bằng đột biến.** Bản đầu đặt lại `doanBong = null` ở đầu
    mỗi pha; xoá nó đi mà **29/29 phép kiểm vẫn xanh**, vì mọi pha đều kết ở đoạn `ket` nên
    mã đoạn **tình cờ** luôn khác. Một dòng chỉ đúng nhờ may là một dòng không ai canh, nên
    mã đoạn nay mang **chỉ số pha** và nó đúng **theo cấu trúc**; dòng đặt lại biến mất.
  - 📏 **Đo trên 10 mã / 56.880 mốc:** tốc độ bóng lớn nhất **30,00 m/s** (chạm đúng trần
    AC-38.6), trung vị khi chạy **20,54**; bóng chạy ở **23,4%** số mốc; **1.008 mốc** dưới
    12 m/s và **tất cả đều đúng 9,00** — tức bóng trong chân người dẫn, không phải đường
    chuyền, nên nợ T706 **đã trả**. `z > 0` ở **269 mốc**, trong đó **166** ở tầm đánh đầu;
    `z` lớn nhất **5,92 m**; **0 mốc** có z âm. **0 ô** ra ngoài sân, **0 ô** ở gốc toạ độ.
  - ✅ **Năm phép đột biến, năm lần đỏ** (sau khi chữa mã chết): ô bóng quay về `buocCoHoc`
    → 2 đỏ; quả tạt không được nâng → 1 đỏ; `re-bong` bị coi như một cú đánh → 1 đỏ; bỏ `z`
    khỏi lô → 1 đỏ.
  - ⚠️ **Và thứ T726 KHÔNG giao: lớp VẼ.** Sân 2D chưa đọc lô mốc — `ui/mocVe.ts` là **T732**
    và vòng rAF là **T733**, cả hai ở **Phase 56**. Nên hôm nay quả bóng bay bổng **trong dữ
    liệu**, và mắt chỉ thấy được sau Phase 56.
  - 📏 Toàn bộ: **77 file / 1.597 phép kiểm xanh**; `loMoc.ts`, `chuoiBong.ts` và bốn file
    bất khả xâm **0 dòng sửa**; `PHIEN_BAN_ENGINE` vẫn 6, `DB_VERSION` vẫn 3,
    `SCHEMA_VERSION` vẫn 5.

**Xem được gì ngay sau Phase 55:** cạnh mã trận có một dòng chữ nói **thời tiết và gió** của
trận, bằng ngôn ngữ đang chọn — và đó là thứ **duy nhất** mắt thấy được ở lát này.

> ⚠️ **Lời hứa cũ của phase nói quá, sửa lại ngày 2026-11-24.** Nó viết "bóng **bay bổng** ở
> các quả tạt và **có người đánh đầu**; đường chuyền ngắn trông khác đường chuyền dài; bóng lăn
> xa hơn khi trời mưa". Sau **T726** thì cả ba điều ấy **đúng trong DỮ LIỆU** — tốc độ bóng
> 12–30 m/s, `z` rơi trong dải đánh đầu, ma sát theo thời tiết — nhưng **không điều nào mắt
> thấy được**, vì sân 2D **chưa đọc lô mốc**: `ui/mocVe.ts` là **T732** và vòng rAF là **T733**,
> cả hai ở **Phase 56**. Nói "xem được" khi chưa xem được là đúng thứ `/analyze` phải bắt.

> ## ⚠️ LỖ THỨ BẢY CÙNG HÌNH DẠNG — không task nào NỐI vật lý bóng vào lô mốc
>
> Tìm ra lúc implement **T720**, ngày 2026-11-24. Cùng một hình dạng với lỗ mà **T725**
> đã lấp, và tìm ra bằng **cùng một phép soát**: grep từng ký hiệu của bảng Contracts
> trong `tasks.md`, rồi hỏi *ai gọi nó*.
>
> **Năm task của Phase 55 chạm đúng bốn nhóm file**: `vatLyBong.ts` (T720, T721, T723),
> `dieuKien.ts` (T722), hai file ngôn ngữ và `TrangTran.tsx` (T724). **Không task nào**
> chạm `tranLienTuc.ts` hay `dienPha.ts`. Hệ quả đo được:
>
> - ô 25 của lô mốc vẫn bước qua `buocCoHoc` với trần tạm `TRAN_TOC_DO_BONG = 25`, mà
>   `buocCoHoc` kẹp lại **9 m/s** — đo T716 đọc tốc độ bóng lớn nhất **đúng 9,00 m/s**;
> - cột `z` và `vz` của **cả 26 ô** vẫn là **0 ở mọi mốc**;
> - nên **lời hứa "Xem được gì ngay sau Phase 55"** — *bóng bay bổng ở các quả tạt và có
>   người đánh đầu* — **không** do năm task này giao được;
> - và nợ của **T706** ("không đường chuyền nào dưới sàn 12 m/s") vẫn treo.
>
> Bảng phủ AC cũng nói đúng điều ấy: **AC-38.5** trỏ vào `T721, T742` và **AC-38.6** trỏ
> vào `T720, T742` — mà **T742 chỉ ĐO**, đúng như AC-38.10 từng trỏ vào hai task chỉ đo.
>
> ✅ **ĐÃ LẤP: T726, người dùng chốt "Thêm và làm luôn" ngày 2026-11-24.** Việc đã làm: cho ô bóng của lô mốc đi theo
> `phatBong`/`bongTaiThoiDiem` thay vì theo `buocCoHoc`, ghi `z`/`vz` thật, và đặt nó ở
> **cuối Phase 55** vì nó cần cả `zKhiToi` (T721) và ma sát (T723).

---

## Phase 56 — Mốc dày ở tình huống quan trọng, và lớp phát ở cả **năm** mức tốc độ

- [x] **T730** [P] — `lienTuc/tinhHuong.ts`: `laTinhHuongQuanTrong` đúng bốn toán hạng
  - File: tạo `src/engine/lienTuc/tinhHuong.ts`, `src/engine/lienTuc/tinhHuong.test.ts`
  - Xong khi: **16 tổ hợp** (4 toán hạng × bật/tắt) cho đúng kết quả; và
    `grep -rl "xG" src/engine/lienTuc/` → **rỗng** — xG thuộc spec 010 (AC-37.8).
    ⚠️ **Không** viết `grep -c "xG" src/engine/lienTuc/`: thiếu `-r` trên một thư mục thì grep
    in `0` ra stdout và lỗi ra stderr (exit 2), nên điều kiện "= 0" **luôn thoả dù sai** — đã
    thử. Một phép kiểm chống xG vô hiệu còn tệ hơn không có phép kiểm nào.
  - AC: AC-37.8
  - Phụ thuộc: T701
  - Ghi chú: nguồn là kết quả **tại chỗ sinh** từ `quyetKetCucChuoi`, **không** phải
    `tt.ungVien`. `plan.md` mục 7 **bỏ sót** hàng cho file này — đã thêm vào plan hôm nay.
  - ✅ **Ba trong bốn toán hạng đã CÓ SẴN trong dữ liệu**: `coBan`, `coHoiRoRang`, `biCuu`
    là ba trường `quyetKetCucChuoi` **đã tính**. Nên lớp liên tục không rút thêm một lần
    ngẫu nhiên nào, không đoán, và hai chế độ **không thể lệch nhau** ở chỗ "cái gì là quan
    trọng" — đúng thứ AC-45.3 đo.
  - ⚠️ **Toán hạng thứ tư, thẻ đỏ, KHÔNG nằm trong `KetCucPhaV6`** — thẻ được rút **sau**
    pha bóng, trong đường phạm lỗi của `tran.ts` (`tran.ts:1023`). Nên nó vào bằng **tham
    số**, không moi ra từ `pha`: moi ra là đoán. Một phép kiểm riêng canh nó đổi được độc
    lập với ba toán hạng kia.
  - ✅ **16 tổ hợp SINH từ `CAC_DAU_HIEU`, không gõ tay 16 dòng.** Gõ tay thì thêm một toán
    hạng thứ năm sẽ **không** làm phép kiểm đỏ — mà nó phải đỏ. Cộng một mệnh đề nữa mà
    bảng 16 dòng không nói được: **mỗi toán hạng đứng một mình đã đủ** — không có nó thì
    một hàm đòi **hai** toán hạng cùng bật vẫn xanh ở 11/16 tổ hợp. Đã đột biến đúng ca ấy
    (`(a||b) && (c||d)`): **2 phép kiểm đỏ**.
  - ✅ **Phép kiểm chống xG viết thành PHÉP KIỂM, không thành lệnh `grep`** — và đó chính là
    chỗ ghi chú của task cảnh báo: `grep -c "xG"` thiếu `-r` trên một thư mục thì grep in
    `0` ra stdout và lỗi ra stderr, nên điều kiện "= 0" **luôn thoả dù sai**. Thành phép
    kiểm thì cái bẫy ấy biến mất, nó quét **cả thư mục** (trừ file test, vì file test buộc
    phải chứa ký hiệu ấy để nói về nó), và nó còn sống sau khi người chạy lệnh đi mất. Kèm
    **chống rỗng** (phải quét được hơn 8 file) và **ca ngược**.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**: bỏ toán hạng thẻ đỏ → 2 đỏ; đổi `hoặc` thành `và`
    → 2 đỏ; `dauHieuCuaPha` đọc nhầm trường → 1 đỏ; nhét ký hiệu bị cấm vào một file
    `lienTuc/` → 1 đỏ.
  - 📏 **+8 phép kiểm.** (Con số toàn bộ ghi ở T732: lúc chạy suite thì cả hai module [P] của lát này đã có mặt.)

- [x] **T731** — Làm dày cả cửa sổ chuỗi lên 0,5 giây; bảng bóng chết ở **đúng một chỗ**
  - File: tạo `src/engine/lienTuc/mocChuoi.ts`, `src/engine/lienTuc/mocChuoi.test.ts`; sửa
    `src/engine/lienTuc/moc.ts`, `src/engine/lienTuc/dienPha.ts`
  - Xong khi: trong `tinh_huong[]`, `Δt` giữa hai khung liền nhau **luôn = 0,5**; **không lỗ**;
    và **hai cái neo của AC-37.4**, vốn bị bỏ sót tới khi `/analyze` bắt được — cửa sổ **bắt
    đầu tại mốc mở đầu cửa sổ chuỗi** (D124 bảo đảm nó cách tình huống **10–14 giây**, nên nó
    chứa `[t−6; t]` bất cứ khi nào tình huống nằm sau giây thứ 6 của cửa sổ, và khi tình huống
    rơi sớm hơn thì cửa sổ vẫn là **cả** cửa sổ chuỗi, không có gì bị cắt), và **khung cuối của
    cửa sổ là mốc `bongChet` của chính pha ấy**. *(Phát biểu "cửa sổ chứa `[t−6; t]`" một mình
    **không thoả được** khi `ketCuc` rơi trước giây thứ 6 — nên neo được đặt ở hai đầu cửa sổ
    chuỗi thay vì ở một khoảng tương đối.)* *(Điều kiện cũ "độ dài ≥ 10 giây" một mình là **không đủ**: một cửa sổ 10
    giây nằm **hoàn toàn SAU** sự kiện vẫn thoả cả ba điều kiện cũ.)* và `taiLap.test.ts` còn xanh — làm dày là quyết định **chỉ ở đầu
    ra**, nên nó **không dịch một hạt giống nào** (AC-37.5).
  - AC: AC-37.4, AC-37.5, AC-37.7
  - Phụ thuộc: T704, **T706** (`dienPha.ts` — nhà của bảng bóng chết), T730
  - Ghi chú: bốn con số bóng chết ở lại `plan.md` mục 3.1, **không thành AC** (người dùng chốt
    câu 1 ngày 2026-11-23). Phép kiểm chỉ khẳng định **tính nhất quán** — tổng thời lượng mỗi
    phút khớp 60 giây — **không** khẳng định giá trị.
  - 🐞 **Điều kiện TIÊN QUYẾT của task này là một lỗi thật, và nó đã sống từ T725: mọi
    người trên sân đi ĐÚNG NỬA tốc độ mà lô mốc ghi.** `thucTheTaiMoc` chỉ được gọi ở
    những mốc **được ghi** (cách nhau 1 giây ở phần thường) nhưng lại bước với `DT_MOC =
    0,5`. Đo trên 3 trận: quãng một người đi giữa hai mốc bằng **0,478** lần `v × Δt`. Nó
    không vỡ một AC nào nên không phép kiểm nào thấy — và **T731 làm nó lộ ra ngay**, vì
    cửa sổ dày gọi hàm ấy ở **mọi** bước, nên người sẽ **chạy nhanh gấp đôi** ở đúng những
    pha quan trọng. Chữa bằng cách lấy `dt` từ **khoảng cách thật giữa hai mốc đã ghi**.
    Đo lại: tỉ số quãng/(v·dt) **trung vị đúng 1,000**. Commit riêng, trước lát này.
  - 🐞 **Và phép chữa ấy đẻ ra một lỗi thứ hai, bắt được cũng bằng phép đo:** `mocDaGhiTruoc`
    ban đầu là biến cục bộ của `buocPhutLienTuc`, nên ở **ranh giới phút** nó khởi về `null`
    và đoán 1 giây — trong khi nếu phút trước **kết thúc bằng cửa sổ dày** thì khoảng thật
    là 0,5. Gia tốc đọc ra **10,40 m/s²**, đúng gấp đôi `GIA_TOC_TOI_DA`, ở riêng những cặp
    mốc bắc qua ranh giới. Nay nó là một trường của `TrangThaiLienTuc`, sống qua phút như
    `coHoc`.
  - 🐞 **Ba phép kiểm cũ gõ cứng `Δt = 1` và T731 làm chúng SAI.** Chúng nay đọc Δt từ chính
    `chiSoMoc` của hai mốc (`dtGiuaHaiMoc`), nên đúng ở cả hai mật độ. Và chúng từng chỉ đọc
    **60 mốc đầu** của mỗi phút (`m < MOC_MOI_PHUT`) — với cửa sổ dày thì đó là **cắt cụt**
    phút, và phép đo quãng bóng đọc ra một cú "teleport" **86 m** hoàn toàn giả. Nay chúng
    đọc hết `lo.soMocDaGhi`.
  - 🐞 **Và một trần sai nữa, lộ ra cùng lúc:** phép kiểm gia tốc ba điểm trọng tài so với
    `GIAM_TOC_TOI_DA` (7,2) nhưng đo được **7,2047**. Không phải lỗi mô hình: hai cổng cuối
    của `buocCoHoc` (mất tốc sau cú quay, trần tốc độ tuyệt đối) cắt tốc độ **sau** phép kẹp
    gia tốc. Trần đúng là con số của **AC-38.2: 8 m/s²** — đúng lề 13,3% mà `coHoc.ts` để
    lại, và đúng khuôn phép kiểm của T725.
  - ⚠️ **Thẻ đỏ quy cho pha PHẠM LỖI của phút ấy, và đó là phép xấp xỉ có chủ ý.**
    `quanSatPha` được gọi **trước** `congPhaVaoTran`, tức trước khi thẻ được rút, nên không
    pha nào tự biết. Thứ đọc được ở tầng phút là **hiệu số thẻ đỏ**. Quy cho mọi pha
    `pham-loi` là phép xấp xỉ **thừa chứ không thiếu**: giá của nó là vài chục mốc, giá của
    phép ngược lại là **mất đúng tình huống** mà AC-37.4 sinh ra để giữ. Hai đột biến canh
    cả hai nửa: bỏ quy thẻ → đỏ, và cho thẻ **lan** sang mọi pha → cũng đỏ.
  - ✅ **Cái neo thứ hai của AC-37.4 đúng THEO CẤU TRÚC**: mọi pha làm dày được đều có
    `bongChet > 0`, vì `coBan`/`coHoiRoRang`/`biCuu` đều đòi `ketCuc === 'dut-diem'`
    (`tran.ts:1543`) còn thẻ đỏ chỉ quy cho `pham-loi` — và cả hai kết cục ấy có bảng bóng
    chết khác 0. Phép kiểm khẳng định bước cuối của cửa sổ nằm trong pha con `bongChet`.
  - 🐞 **Một VÒNG NHẬP, và nó không báo lỗi gì.** `MOC_MOI_CHUOI_DAY` ban đầu lấy
    `BUOC_MOI_CHUOI` từ `dienPha.ts`, mà `dienPha.ts` lại nhập `laMocDuocPhat` từ
    `mocChuoi.ts` → hằng số thành **`undefined` lúc nạp module**, không một lỗi nào. Nay nó
    định nghĩa từ `MOC_MOI_CHUOI` và **đẳng thức với `BUOC_MOI_CHUOI` là một phép kiểm**.
  - 📏 **Đo trên 10 mã / 948 phút:** **12,0%** số phút có cửa sổ dày; tổng mốc tăng **4,4%**
    (59.380 so với 56.880), tức **~5.938 mốc một trận**; phút nhiều mốc nhất **100** mốc —
    chưa bao giờ chạm sức chứa 120 của lô. Phép kiểm canh: chỉ hai khoảng 1 hoặc 2 bước
    (tức 0,5 hoặc 1 giây), **không lỗ**, không trùng, không lùi.
  - ✅ **Chống rỗng là mệnh đề quan trọng nhất ở đây**: cửa sổ dày phải **thật sự xảy ra**
    trên trận thật (> 50 phút, > 1.000 cặp mốc 0,5 giây). Thiếu nó thì một `cacPhaDay` trả
    toàn `false` vẫn xanh mọi dòng còn lại. Phép kiểm đếm mốc của T704 cũng được sửa thành
    một **dải** kèm mệnh đề "phải lớn hơn sàn" vì đúng lý do ấy.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**; `taiLap.test.ts` và `MOC_V6` xanh **0 dòng sửa** —
    làm dày là quyết định **chỉ ở đầu ra**, nó không dịch một hạt giống nào (AC-37.5).
  - 📏 Toàn bộ: **80 file / 1.623 phép kiểm xanh**.

- [x] **T732** [P] — `ui/mocVe.ts`: một phép chia, không nhánh theo tên mức tốc độ
  - File: tạo `src/ui/mocVe.ts`, `src/ui/mocVe.test.ts`
  - Xong khi: phép kiểm duyệt `Object.entries(MS_MOI_PHUT)` cho **cả năm** mức và không có một
    chuỗi tên mức nào trong `mocVe.ts` (`grep -n "rat-nhanh\|cham" src/ui/mocVe.ts` → rỗng).
  - AC: AC-31.4 (giữ lại), AC-37.7
  - Phụ thuộc: T704
  - Ghi chú — **kết luận quan trọng nhất của lát này, và nó NGƯỢC với lo ngại ban đầu:** T732
    **không** thêm mức tốc độ và **không** sửa `MS_MOI_PHUT` (`useMatch.ts:63`) hay
    `CAC_MUC_TOC_DO` (`:91`), nên nó **không mở rộng một phép kiểm nào** — khác hẳn ca spec
    005. Bản đồ để các task sau đứng lên: `MS_MOI_PHUT` được **bốn** file test khoá vào
    (`noiSuy.test.ts` `Object.entries` ở 381/397/418/513; `phaBong.test.ts` ở 804;
    `san2D.test.ts` ở 291 cộng `MS_MOI_PHUT.cham` ở 526/654/1514/1754). Còn `CAC_MUC_TOC_DO`
    chỉ có **một** nơi dùng (`BangDieuKhienTran.tsx`) và **không một test nào** duyệt nó — đổi
    nó thì **không gì đỏ**.
  - ✅ **Ghi chú của task đoán đúng, và tôi xác nhận lại bằng tay:** T732 **không** thêm mức
    tốc độ và **không** chạm `MS_MOI_PHUT` hay `CAC_MUC_TOC_DO`, nên nó **không mở rộng một
    phép kiểm nào** — khác hẳn ca `MS_MOI_PHUT` của spec 005.
  - ✅ **Mức tốc độ vào module này CHỈ dưới dạng một con số `msMoiPhut`.** Một nhánh `if`
    theo **tên** mức trong lớp vẽ là chỗ mà mức thứ sáu sẽ **lặng lẽ** không được xử lý.
    Phép kiểm quét chính mã nguồn và đòi **không tên mức nào trong bảng** xuất hiện — nó
    quét **mọi** tên có trong `MS_MOI_PHUT`, kể cả tên của mức thêm sau, thứ một lệnh `grep`
    gõ tay không làm được. Kèm `MucTocDo` và `MS_MOI_PHUT` cũng bị cấm: nhận một con số là
    đủ.
  - 🐞 **Phép kiểm ấy đỏ ngay lần chạy đầu — ở một CHÚ THÍCH.** Chú thích viết "mức nhanh
    nhất là 20 ms", và chữ `nhanh` là tên một mức. Hai đường chữa, tôi làm **cả hai**: phép
    kiểm **bóc chú thích** trước khi quét (đúng khuôn `chiCode` của `rng.test.ts` —
    điều bị cấm là một **nhánh**, không phải một câu văn), **và** chú thích được viết lại
    sao cho lệnh `grep` **nguyên văn** của task cũng ra rỗng. Đã chạy lại chính lệnh ấy.
  - ⚠️ **`soMoc` là THAM SỐ, không đọc thẳng `MOC_MOI_PHUT`** — vì **T731** sắp làm dày cửa
    sổ tình huống quan trọng lên gấp đôi. Lúc ấy một lô có **hai mật độ mốc**, và một hàm
    đóng cứng số mốc sẽ sai ở đúng những pha đáng xem nhất. Có một phép kiểm riêng cho mật
    độ 120 mốc.
  - ✅ **Phép kiểm duyệt `Object.entries(MS_MOI_PHUT)` cho cả năm mức**, và ba mệnh đề của
    nó bổ cho nhau: chỉ số **không ra ngoài lô**, **không lùi** khi đồng hồ tiến, và **nửa
    phút là nửa lô**. Mệnh đề cuối là thứ nói rằng quy đổi là một phép **tỉ lệ** chứ không
    phải một bảng tra — một hàm trả hằng số vẫn xanh hai mệnh đề đầu.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**: nhân `soMoc - 1` → 3 đỏ; bỏ phép kẹp ở đuôi lô → 4
    đỏ; trả hằng số → 4 đỏ; thêm một nhánh theo tên mức → 1 đỏ.
  - 📏 Toàn bộ: **79 file / 1.614 phép kiểm xanh** (T730 thêm 8, T732 thêm 9).

- [x] **T733** — Nới cổng của **đúng MỘT** vòng rAF, đặt lại mốc thời gian theo số lô
  - File: `src/ui/components/San2D.tsx`
  - Xong khi: ở **cả năm** mức tốc độ, vòng rAF chạy > 0 khung (hôm nay mức nhanh nhất chạy
    **0 khung**); và `npx vitest run src/ui/noiSuy.test.ts src/ui/phaBong.test.ts src/ui/san2D.test.ts`
    xanh.
  - AC: AC-28.5, AC-31.4 (giữ lại)
  - Phụ thuộc: T704, T732
  - Ghi chú — **bẫy nạp module, không phải bẫy phép kiểm:** ba file trên **import từ
    `San2D.tsx`** trong môi trường `node` (`noiSuy.test.ts:4` và `phaBong.test.ts:12` lấy
    `thoiGianChuyen`; `san2D.test.ts:21-41` lấy **20 ký hiệu**). Nên **bất kỳ dòng mức-module
    mới nào** chạm `window`, `matchMedia` hay `performance` sẽ làm **đỏ cả ba ngay lúc
    import**, không phải ở một phép kiểm nào. Và **không thêm effect thứ ba** — nới cổng của
    vòng đã có (R52).
  - ⚠️ **Task này mang theo món T704 đã HOÃN CÓ TÊN, và nó lớn hơn dòng file của mình.**
    Trước lát này **không chỗ nào ngoài test** gọi `buocPhutLienTuc`: `useMatch` tạo trận
    bằng `taoTran` và bước bằng `buocTiep`, nên chọn "Liên tục" trong giao diện vẫn chạy
    engine **cổ điển**. Phạm vi vì thế nới thêm ba file: `useMatch.ts` (chỗ T704 chỉ sang),
    `TrangTran.tsx` (truyền lô xuống) và `mocVe.ts`/`tranLienTuc.ts` (hai hàm thuần, để
    luật không nằm trong component).
  - 🐞 **Và đây là phát hiện quan trọng nhất của cả lát: "các điểm có nhúc nhích" KHÔNG
    chứng minh được gì.** Lần đo đầu trên trình duyệt cho 24/24 khung hình khác nhau, và
    tôi suýt kết luận mối nối đã chạy. Nhưng **lớp dao động cũng chạy trong chính vòng rAF
    ấy**, nên sân vẫn nhúc nhích y hệt kể cả khi lô mốc không bao giờ tới nơi. Chữa bằng
    một thuộc tính **đọc được từ bên ngoài**: `data-nguon` trên thẻ `<svg>`, nhận `moc` hay
    `phut`. Đo lại thì ở giây đầu nó là **`phut`** — đúng, vì lô đầu tiên chỉ có sau khi
    phút đầu chạy xong — rồi chuyển sang **`moc`** và ở đó suốt. Không có dấu ấy tôi đã báo
    một mối nối **chưa chạy** là đã chạy.
  - 📏 **Đo thật trên trình duyệt, cả năm mức tốc độ:** `data-nguon = "moc"` ở **cả năm**;
    **0 khung đứng yên**; **0 điểm** ra ngoài khung trên **920 mẫu**; 23 điểm được vẽ (22
    cầu thủ + bóng, **không** vẽ ba trọng tài — đúng AC-38.10); không lỗi console mới; trận
    chạy hết và báo cáo sau trận hiện đúng.
  - ✅ **Cổng nới đúng MỘT chỗ**: `msChuyen <= 0` không còn tắt vòng ở chế độ liên tục.
    `thoiGianChuyen` trả 0 ở mức nhanh nhất (spec 005 tắt nội suy ở đó), nên trước lát này
    mức **Rất nhanh** chạy **0 khung** — lô có phát ra cũng không ai đọc.
  - ✅ **Mốc thời gian đặt lại NGAY TRONG VÒNG theo `soLo`, không qua effect** — đúng cách
    **R52** dặn. `loMoc` và `soLo` **không** nằm trong mảng phụ thuộc của effect: vòng đọc
    chúng qua closure mỗi khung, nên một lô mới **không** dựng lại `requestAnimationFrame`.
    Đưa chúng vào là huỷ rồi tạo lại vòng **mỗi phút**, đúng cái bẫy R52 gọi tên.
  - ✅ **Trạng thái liên tục sống NGOÀI React, ở mức module** — cùng lý do mà
    `batDauTranNgay` không phải hook: mỗi lần gọi `useMatch` là thêm một đồng hồ, nên một
    `useRef` sẽ cho hai bản và trận đi **hai phút mỗi nhịp**. Và nó **không vào store**: lô
    là hai mảng typed ~100 KB mỗi phút, nhét vào Zustand là bắt mọi thành phần đăng ký store
    vẽ lại vì một thứ chỉ sân 2D đọc.
  - ✅ **Một thứ tự ô, không phải hai.** `oCuaNguoiTrenSan` dùng **cùng** `doiHinhTrenSan` mà
    `coHocXuatPhat` và `choDung` dùng, nên "ô số 7 ở đâu" và "ô số 7 là ai" là **một** quyết
    định. Engine còn một thứ tự thứ hai (`oCuaNguoiGiu` đánh số theo `ben.trenSan`) — đo 948
    lượt thì chúng **trùng 100%**, nhưng **không gì ép chúng trùng**, nên có một phép kiểm
    giữ đẳng thức ấy. Lệch một chỗ là người giữ bóng được vẽ ở ô người khác và **không gì đỏ**.
  - ⚠️ **Prop `anhChup` của T714 bị thay bằng `loMoc`/`soLo`/`oCuaNguoi`, nêu chứ không im.**
    Không một nơi gọi nào truyền được `anhChup`: ảnh chụp đổi **mỗi khung hình**, mà đồng hồ
    khung hình nằm trong chính `San2D`. Một component cha muốn dựng nó sẽ phải mở vòng rAF
    **thứ hai** — đúng thứ điều kiện ra của task cấm. `loMoc !== null` nay là thẻ phân biệt
    hai chế độ, đúng vai trò mà D121 giao.
  - ⚠️ **Thứ lát này KHÔNG làm, nói thẳng:** lớp vẽ **không nội suy giữa hai mốc** — nó
    *chốt* vào mốc gần nhất (`mocVeTaiThoiDiem` trả cả `phan`, nhưng vòng chỉ dùng `chiSo`).
    Ở mức **Rất chậm** một mốc chiếm 66 ms, tức hình đổi **15 lần một giây**; ở **Thường** là
    16,7 ms nên quả bóng 30 m/s băng qua sân trong **hai khung hình**. Đó là hệ quả của mô
    hình, không phải lỗi của mối nối — và `phan` đã sẵn ở đó cho lát nào muốn nội suy.
  - ✅ **Ba phép đột biến trên phần thuần, ba lần đỏ**; `noiSuy.test.ts`, `phaBong.test.ts`
    và `san2D.test.ts` xanh với **0 dòng sửa** — bẫy nạp module của R52 tránh được vì mọi
    dòng mới nằm **trong** component, không ở mức module.
  - 📏 Toàn bộ: **80 file / 1.629 phép kiểm xanh**.

- [x] **T734** — Giảm chuyển động (**AC-45.9**), phần **nối dây**
  - File: `src/ui/components/San2D.tsx` (cổng ở dòng 1449, chỗ cộng 1472-1476, dep 1483)
  - Xong khi: cổng đồng hồ **mốc** chỉ gồm `dangChay` + chế độ và **không** nhận
    `giamChuyenDong`; `dongHoDao` chỉ cộng khi `!giamChuyenDong`; và `npx vitest run` toàn bộ
    còn xanh.
  - AC: AC-45.9, AC-31.1 (giữ lại)
  - Phụ thuộc: T733
  - Ghi chú — **task này KHÔNG CÓ MỘT FILE TEST NÀO canh.** Đã kiểm: `find src -name "*.test.tsx"`
    **rỗng**, và `vite.config.ts` chỉ `include: ['src/**/*.test.ts']` với `environment: 'node'`
    → **0 test component** trong repo. Món bù duy nhất là **T737** (hàm thuần) và **T761** (kiểm
    bằng mắt). Đây đúng là R52, và nó phải được nói ra khi tick.
  - ⚠️ **Ghi chú của task đúng từng chữ, và tôi chứng minh nó bằng một phép đột biến thay vì
    tin lời:** cho `dongHoDao` cộng lại kể cả khi giảm chuyển động — **88/88 phép kiểm vẫn
    xanh**. Không một phép kiểm tự động nào canh lát này. Đó đúng là **R52**, và món bù duy
    nhất là **T737** (hàm thuần) cộng **T761** (kiểm bằng mắt).
  - ✅ **Hai đồng hồ, hai việc — đúng điều D132 tách ra.** Đồng hồ **mốc** đẩy trận đi theo
    giây (mô phỏng); đồng hồ **dao động** làm các điểm rung nhẹ (thẩm mỹ). Người bật giảm
    chuyển động tắt cái thứ hai, **không** tắt cái thứ nhất: AC-31.1 nói "không nội suy,
    không dao động", nó **không** nói "ít chuyển động hơn", và một trận đứng im không phải
    một trận.
  - ⚠️ **Chế độ CỔ ĐIỂN giữ nguyên hành vi cũ**: ở đó vòng rAF **chỉ** làm việc thẩm mỹ, nên
    giảm chuyển động vẫn tắt cả vòng. Nếu không tách hai nhánh thì người bật giảm chuyển
    động ở chế độ cũ sẽ đốt 60 khung hình một giây cho một thứ đã bị tắt.
  - ➕ **Lệch nhẹ so với D132, nêu chứ không im:** D132 đặt đồng hồ **mốc** ở `useMatch.ts`,
    còn ở đây nó là chính vòng rAF của `San2D` (quyết định của T733). Tinh thần giữ nguyên —
    cổng của đồng hồ mốc **không** nhận `giamChuyenDong` — và lý do D132 loại phương án "tắt
    cả vòng" vẫn đứng: tắt thì **không còn ai gọi vẽ lại**, trận chạy mà sân đóng băng.

- [x] **T735** — Phép kiểm AC-38.8 ở lớp vẽ, ngưỡng **quy từ** `TOC_QUAY_NHANH`
  - File: `src/ui/viTriVe.test.ts` (+1 describe)
  - Xong khi: với mọi pha chạy > 6 m/s, góc đổi hướng giữa hai mốc liền nhau không vượt ngưỡng
    **quy từ** `TOC_QUAY_NHANH` (import từ `coHoc.ts`, không chép số); và phép đo chạy **trên
    toạ độ đã qua `quyDoiMet`**, không trên mét thô.
  - AC: AC-38.8
  - Phụ thuộc: T714, T712, T703
  - Ghi chú: một test ở `src/ui/` với tới `src/engine/lienTuc/` là **hợp lệ** — tiền lệ
    `noiSuy.test.ts:2` đã import từ `'../engine/theLuc'`, và `boundaries.test.ts` chỉ cấm chiều
    **ngược lại**. Đo trên mét thô sẽ làm lý lẽ của D121 (hệ số đẳng hướng, để ngưỡng **góc**
    không bị méo) thành vô nghĩa.
  - 🐞 **Ngưỡng quy từ một hằng số thì MÙ với chính hằng số ấy — tìm ra bằng đột biến.** Tôi
    nâng `TOC_QUAY_NHANH` từ 30 lên 90 và **17/17 phép kiểm vẫn xanh**: ngưỡng của phép kiểm
    quy từ cùng con số, nên nâng hằng số là nâng **cả hai vế**. Điều kiện ra của task đòi
    "quy từ, không chép số" và nó **đúng** — nó giữ engine với phép kiểm không trôi khỏi
    nhau — nhưng một mình nó không đủ. Thêm một chỗ **ghim** con số mà AC-38.8 nêu: hai mệnh
    đề làm hai việc khác nhau, một cái giữ hai bên khớp nhau, một cái giữ chúng khớp **với
    spec**. Nay đột biến ấy đỏ.
  - ⚠️ **Ngưỡng có HAI thành phần, và thành phần thứ hai không được giấu.** Ngoài
    `TOC_QUAY_NHANH × Δt` còn một lề cho **`tachChen`** — thứ đẩy người ra khỏi nhau **SAU**
    phép bước (T713). Một cú đẩy ngang tới `BAN_KINH_TRANH` = 2 m trên một bước dài 4,5 m
    (0,5 giây ở 9 m/s) là **24°**: không phải người ấy quay, mà là chỗ đứng của anh ta bị
    dịch. Lề nêu **30°**, và một phép kiểm canh nó **không vượt** chính trần nó đứng cạnh —
    lề mà nuốt cả trần thì phép kiểm thôi canh trần.
  - 📏 **Đo 3 mã, 2.317 mẫu có CẢ HAI đoạn trên 6 m/s**: trung vị **1,5°**, p95 **30,0°**
    (chạm đúng trần quay), lớn nhất **48,3°** ở Δt = 1 giây và **39,1°** ở Δt = 0,5.
  - ⚠️ **Mệnh đề thật của AC-38.8 là TRUNG VỊ, không phải cái trần.** AC nói đường chạy phải
    là một **đường cong**; một đường gấp khúc vẫn có thể nằm dưới trần mà vẫn gấp khúc.
    Trung vị **1,5°** là thứ nói nó cong.
  - 🐞 **Và "đo trên toạ độ đã quy đổi" hoá ra KHÔNG quan sát được từ kết quả:** `toaDoTuMet`
    dùng **một** hệ số cho cả hai trục nên nó giữ nguyên góc, và đo trên mét thô ra **đúng
    cùng con số**. Nên yêu cầu ấy được biến thành một phép kiểm **canh chính lý lẽ của
    D121**: hai trục phải co cùng hệ số, và một góc 45° trong mét vẫn là 45° trên hình. Đột
    biến cho trục `y` co lệch 1,2 lần → đỏ.

- [x] **T736** — Vẽ lại vạch sân ở **nhánh liên tục**
  - File: `src/ui/components/San2D.tsx`
  - Xong khi: vòng cấm, vòng tròn giữa, chấm phạt đền và khung thành vẽ đúng mét ở nhánh liên
    tục; `npx vitest run src/ui/san2D.test.ts src/ui/daoDong.test.ts src/ui/phaBong.test.ts`
    xanh; và **nhánh phút ghi thành nợ có tên** trong `plan.md`, không sửa im.
  - AC: AC-37.2, AC-15.6 (giữ lại)
  - Phụ thuộc: T703, T734
  - Ghi chú: task này **không đỏ** nếu chỉ sửa JSX, nhưng **đỏ ngay** nếu chạm `RONG` (60),
    `CAO` (61), `KHUNG_SAN` (80) hay `khungSan` (90) — `san2D.test.ts` import cả bốn và describe
    "khung sân theo quân số (AC-15.6)" đo trực tiếp chúng; `daoDong.test.ts` và `phaBong.test.ts`
    cũng đứng trên cùng khung toạ độ. D121 đã **loại** phương án đổi `CAO` vì đúng lý do này.
  - ⚠️ **Ghi chú của task nói task này "không đỏ nếu chỉ sửa JSX" — nên việc đầu tiên là làm
    cho câu ấy thôi đúng.** Hình học được bóc thành `vachSanMet`, một **hàm thuần export
    được**, và bảy phép kiểm **quy ngược** toạ độ vẽ về mét rồi so với chính hằng số của
    `hinhHocSan.ts`. Không một con số nào chép tay. (Phạm vi nới một file: `san2D.test.ts`
    nhận thêm một describe — đổi lại là lát này có lưới thay vì không có.)
  - 📏 **Ba con số của món nợ, đo chứ không đoán.** Nhánh phút vẽ bằng **tỉ lệ ước**: vòng
    tròn giữa `cao/8` = **7,6 đơn vị** trong khi 9,15 m là **8,7**; vòng cấm sâu
    `rộng×0,12` = **12** trong khi 16,5 m là **15,7**; vòng cấm cao `cao×0,4375` = **26,7**
    trong khi 40,32 m là **38,4** — lệch **30%**.
  - ✅ **Nhánh phút ở lại, thành nợ CÓ TÊN trong `plan.md` (bảng AC, hàng AC-37.2), không
    sửa im.** Lý do để nguyên: khung của chế độ phút **co theo quân số** (AC-15.6), và sân 5
    người **không có** kích thước mét nào để quy đổi — `hinhHocSan.ts` chỉ nói về sân 11.
    Sửa nhánh ấy là phải **phát minh** kích thước cho sáu quân số, việc mà không AC nào đòi.
    Chế độ liên tục thì **luôn 11 người** (T707 khoá) nên nó có đúng một sân thật để quy đổi.
  - ➕ **Một hằng số của riêng lớp vẽ: `SAU_KHUNG_THANH_VE = 2` m.** `hinhHocSan.ts` không có
    nó vì engine không cần biết khung thành sâu bao nhiêu — bóng vào lưới là một **kết cục**,
    không phải một va chạm. Có một phép kiểm canh nó **lọt trong lề ảnh**: khung dựng NGOÀI
    đường biên ngang, nên lề hẹp hơn độ sâu là hai cái khung bị xén — và **SVG chỉ việc xén,
    không báo gì**. Đột biến nâng nó lên 4 m → đỏ.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**: vòng cấm dùng tỉ lệ ước như nhánh phút → 2 đỏ;
    khung thành dựng **trong** sân → 1 đỏ; chấm phạt đền tính bằng **đơn vị** thay vì mét →
    2 đỏ; lề ảnh hẹp hơn độ sâu khung thành → 1 đỏ.
  - 📏 **Đã xem thật trên trình duyệt**: nhóm vạch sân ở nhánh liên tục có **5 hình chữ nhật**
    (biên sân + 2 vòng cấm + 2 khung thành), **4 vòng tròn** (vòng giữa + chấm giữa + 2 chấm
    phạt đền) và **1 vạch giữa** — nhánh phút chỉ có 3 + 1 + 1. `data-nguon` đọc **`moc`** ở
    cả 12 mẫu liên tiếp.
  - 🐞 **Và một thứ đọc sai suýt làm tôi báo hỏng:** ngay sau khi đổi mức tốc độ,
    `data-nguon` đọc ra `phut` một nhịp. Không phải lỗi — `msMoiPhut` nằm trong mảng phụ
    thuộc của effect, nên đổi mức **dựng lại vòng rAF**, và có đúng một lần vẽ trước khung
    đầu tiên của vòng mới. Đo 12 mẫu liên tiếp thì nó `moc` cả 12.
  - 📏 Toàn bộ: **81 file / 1.650 phép kiểm xanh**; `san2D.test.ts`, `daoDong.test.ts`,
    `phaBong.test.ts` đều xanh, và ba bất biến của `san2D.test.ts` (không chồng khít, thủ
    môn trong một phần ba sân, tám hàng xen kẽ) còn nguyên.

- [x] **T737** — Phép kiểm của **AC-45.9**: +1 describe thuần, **sau T734**
  - File: `src/ui/viTriVe.test.ts`
  - Xong khi: với `giamChuyenDong = true`, toạ độ trả về **trùng khít** một mốc đã phát trên
    **100 bộ** đầu vào, và **không bao giờ** là một giá trị nằm giữa hai mốc.
  - AC: AC-45.9
  - Phụ thuộc: T734, T714
  - Ghi chú: để describe này gọi được từ `environment: node`, hàm của `viTriVe.ts` phải nhận
    `giamChuyenDong` làm **tham số** — không đọc hook. Điều kiện "Xong khi" của T737 khác T734:
    **T734 đổi hành vi, T737 chứng minh hành vi.**
  - ✅ **100 bộ đúng như điều kiện ra đòi**: 10 chỗ của mốc × 10 kiểu nhiễu của lớp cổ điển.
    Với `giamChuyenDong = true`, toạ độ trả về **trùng khít** mốc ấy — không mang một dấu vết
    nào của `sauNoiSuy`, `sauBamBong` hay `lechDao`.
  - ⚠️ **Mệnh đề "không bao giờ nằm GIỮA hai mốc" cần một ca RIÊNG.** Phép kiểm 100 bộ một
    mình chưa nói được điều đó: một hàm nội suy với hệ số 0 cũng trả đúng mốc đầu. Ca riêng
    đưa **hai** mốc liền nhau và bắt **mọi** lớp cổ điển trỏ vào đúng **điểm giữa** — rồi đòi
    kết quả là một trong hai mốc, không phải điểm giữa ấy.
  - ✅ **Hai phép đột biến, hai lần đỏ**: cho giảm chuyển động rơi về đường cổ điển → 3 đỏ;
    cho đường liên tục lệch nửa mét khỏi mốc → 5 đỏ.
  - 📏 **80 file / 1.632 phép kiểm xanh** (thêm 3).

- [x] **T738** [P] — Phép kiểm **phủ định** của **AC-45.10**: không có tua ngược
  - File: tạo `src/engine/lienTuc/tuaToi.test.ts`
  - Xong khi: quét mã nguồn `lienTuc/**/*.ts` và `src/hooks/useMatch.ts`, **không một đường
    nào** đặt `chiSoMoc` **giảm**; và quét theo **ký hiệu** trong `src/ui/components/` +
    `src/hooks/` — `grep -rn 'type="range"' src/ui/components src/hooks` ra **đúng một** dòng
    đã biết (`ChonAnh.tsx:198`, slider **zoom của tính năng cắt ảnh**, nêu tên trong chính phép
    kiểm chứ không lặng lẽ mở rộng), không có `tuaVe`, và không phép gán nào làm `chiSoMoc`
    giảm.
    ⚠️ **Bản trước quét `<input type="range"` và nó khớp 0 file** — đã chạy thử, exit 1 — vì
    JSX trong repo format **nhiều dòng**, nên thuộc tính nằm một dòng riêng. Đó đúng hình dạng
    của cái CRITICAL vừa vá bằng T716: chủ **duy nhất** của AC-45.10 được canh bằng một phép
    kiểm **không bao giờ đỏ được**.
    ⚠️ **Không** quét theo từ tiếng Anh chung trên cả `src/ui/`: `grep -ril "timeline\|slider"`
    hôm nay đã ra **hai** kết quả không liên quan gì tới spec 007 — `src/ui/ngonNgu/en.ts`
    (chuỗi "use the slider to zoom in or out" của tính năng cắt ảnh) và
    `src/ui/bieuTuong/history.svg` (khớp vì **tên tệp**). Điều kiện "→ rỗng" trên phạm vi ấy
    **không bao giờ thoả được**, nên task sẽ không bao giờ tick được.
  - AC: AC-45.10
  - Phụ thuộc: T704
  - Ghi chú: dùng khuôn quét source đã có (`import.meta.glob` với `query: '?raw'`, như
    `boundaries.test.ts:17` và `rng.test.ts:13`). `plan.md` mục 7 **bỏ sót** hàng cho file này
    — đã thêm hôm nay. Nếu file này **viết** chữ `requestAnimationFrame` trong mã (không phải
    chú thích) thì `boundaries.test.ts` đỏ — đọc lại `:162` trước khi import `../hooks`.
  - ⚠️ **Một AC PHỦ ĐỊNH chỉ canh được bằng hai thứ, và phải CẢ HAI.** (1) **Hành vi**: chỉ
    số mốc của một trận thật chỉ tăng — 10 mã, hơn 50.000 mốc, không mốc nào đứng lại hay
    lùi. (2) **Mã nguồn**: không đường nào đặt nó giảm, và giao diện không mọc thêm thanh kéo
    thời gian. Chỉ (1) thì một thanh thời gian **chưa ai kéo** vẫn xanh; chỉ (2) thì một lỗi
    số học trong vòng phút vẫn xanh.
  - ⚠️ **Quét theo PHÉP GÁN, không theo chuỗi `chiSoMoc -`.** Chuỗi ấy xuất hiện **hai lần**
    trong `tranLienTuc.ts` một cách hoàn toàn chính đáng (`chiSoMoc - mocDaGhiTruoc` và
    `chiSoMoc - mocDauChuoi` đều là **hiệu** dùng làm tham số). Cấm chuỗi ấy là cấm một cách
    viết đúng, và rồi ai đó sẽ tắt phép kiểm.
  - ✅ **Hai cảnh báo của task đều đúng, và tôi kiểm lại cả hai**: `grep` có thẻ mở
    (`<input type="range"`) khớp **0 file** vì JSX format nhiều dòng; và quét theo từ tiếng
    Anh chung trên cả `src/ui/` khớp hai chỗ không liên quan. Phép kiểm vì thế quét
    `type="range"` trên `components` + `hooks`, đòi **đúng một** kết quả và **nêu tên** nó
    (`ChonAnh.tsx` — slider phóng to của tính năng cắt ảnh). Nêu tên thì người thêm thanh thứ
    hai **phải sửa phép kiểm**; nới thành "ít hơn hai" thì nó lọt im lặng.
  - ✅ **Ba phép đột biến, ba lần đỏ**: thêm một `tuaVe` có `chiSoMoc--` vào `lienTuc/` → đỏ;
    thêm thanh kéo thứ hai vào `BangDieuKhienTran.tsx` → đỏ; cho chỉ số mốc **lặp lại** thay
    vì tăng → đỏ.
  - ✅ **`boundaries.test.ts` xanh**: file này **đọc** mã nguồn của `hooks/` và `ui/` bằng
    `import.meta.glob`, không **import** chúng — mẫu `(?:from|import)\s*\(?\s*[\'"]` của
    phép canh biên không khớp `import.meta.glob(`, đã kiểm.
  - 📏 **81 file / 1.643 phép kiểm xanh**.

**Xem được gì ngay sau Phase 56:** ở bàn thắng, cơ hội rõ ràng, cứu thua và thẻ đỏ, chuyển động
**dày lên gấp đôi**. Chạy trơn ở **cả năm** mức tốc độ. Người bật giảm chuyển động **vẫn thấy
trận tiến theo giây**. Vòng cấm và khung thành vẽ đúng mét.

---

## Phase 57 — Tệp xuất JSON và bộ đo cơ học chạy trên chính tệp

- [x] **T740** — `lienTuc/tepXuat.ts`: năm khoá gốc, khối mỏng tuple + hàng tiêu đề
  - File: tạo `src/engine/lienTuc/tepXuat.ts`, `src/engine/lienTuc/tepXuat.test.ts`; sửa
    `src/engine/lienTuc/moc.ts` (export `loMoc`), `src/engine/lienTuc/tinhHuong.ts`
  - Xong khi: test thuần trên cấu trúc xanh — **5 khoá gốc**; `tinh_huong[].khung[]` đúng **4**
    khoá, `bong` **7** khoá, `cau_thu` **8** khoá, `trang_thai` trong enum đóng **14** giá trị;
    và **hai lần xuất cùng mã trận giống từng byte** (mã ngắn gán từ **bản ghi**, không từ thứ
    tự duyệt).
  - AC: AC-45.5, AC-37.5
  - Phụ thuộc: T704, T730, T731
  - Ghi chú: `boundaries.test.ts` chặn **cả** `tepXuat.ts` **và** `tepXuat.test.ts` import
    `../../services` hoặc `../../storage` — hai phép kiểm import (dòng 84 và 100) **không** bỏ
    qua file `.test.ts`; chỉ hai phép kiểm đồng hồ (131, 158) mới có `if (laFileTest) continue`.
  - 📏 **Tệp thật nặng 4.512.038 byte = 4,51 MB thập phân, dựng trong 375 ms.** Con số ấy
    **hoà giải** hai con số mà D125 ghi là chưa hoà giải: ~11,3 MB của D125 và 7,2/8,0/9,0
    MB của plan mục 10. Thực tế **thấp hơn cả hai**, và dưới ngưỡng 11.000.000 byte của
    AC-45.11 một khoảng rộng. **T744** vẫn là chỗ đo chính thức; đây là phép đo đầu tiên.
  - ✅ **Hai lần xuất cùng mã trận GIỐNG TỪNG BYTE** — đã so cả độ dài lẫn nội dung chuỗi.
  - ⚠️ **Mã ngắn gán từ BẢN GHI, không từ thứ tự duyệt.** `cacCauThu` không đổi suốt trận,
    còn `trenSan` đổi mỗi lượt thay người và mỗi thẻ đỏ. Có **hai** phép kiểm canh: mã khớp
    thứ tự danh sách đăng ký, và mã **không đổi sau 40 phút** khi đội hình đã đổi. Đột biến
    gán theo `trenSan` → đỏ.
  - 📏 **Hình dạng đo được**: 5 khoá gốc; khối mỏng **5.980 hàng × 80 số** (1 `t` + 4 bóng +
    25 ô × 3 cột); khối dày **16 đoạn / 690 khung**, mỗi khung **4** khoá gốc, `bong` **7**,
    mỗi `cau_thu` **8**; bảng tra **36 người**; thứ tự ô 25 chỗ kết thúc bằng `REF, AR1, AR2`.
  - ⚠️ **Hai trong tám khoá của `cau_thu` mang `null`, và tôi nói thẳng chứ không bịa.**
    `hanh_dong` cần một **từ vựng động tác** mà spec 007 không dựng (`LoaiHanhDong` chỉ có
    bốn giá trị, và chúng là **đường bóng** chứ không phải động tác); `muc_dich` là **US-40
    của spec 009**, nơi người dùng đã chốt "tám loại trở lên" khi `/clarify`. Điền bừa một
    chuỗi vào đây là **nói dối trong một tệp mà AC-45.6 dùng làm nguồn đo**.
  - ⚠️ **Enum `trang_thai` liệt đủ 14 giá trị nhưng engine chỉ phát SÁU**: `dung_yen`,
    `di_bo`, `chay`, `nuoc_rut`, `dan_bong`, `danh_dau`. Tám giá trị còn lại cần thứ spec
    007 không có — `nhay`/`nga`/`tac_bong`/`bat_bong` cần pha tranh chấp và thủ môn (spec
    008), `giam_toc`/`quay_nguoi` cần một ngưỡng không AC nào nêu, còn `chuyen`/`sut` là
    **hành động một khoảnh khắc** chứ không phải trạng thái của cả một khung 0,5 giây.
    Phép kiểm vì thế canh **"mọi giá trị phát ra đều thuộc enum"**, không canh "đủ 14 đều
    xuất hiện" — mệnh đề sau sẽ ép tôi **bịa ra** tám trạng thái.
  - ✅ **Khối dày đọc độ dày TỪ CHÍNH LÔ** (các mốc cách nhau đúng một bước), không hỏi lại
    `cacPhaDay`: lô là thứ sẽ nằm trong tệp, nên nếu hai bên lệch thì bên đúng là lô. Một
    nguồn, không hai.
  - ➕ **Hai chỗ khai sai trong plan, sửa theo thực tế code**: `BenTran` giữ `teamId` chứ
    không giữ tên đội (tên sống ở lớp dữ liệu đội, engine không đọc nó), và `HoSoCauThu` có
    `positions` số nhiều chứ không `position`.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**; `boundaries.test.ts` xanh — `tepXuat.ts` và
    `tepXuat.test.ts` đều không chạm `services` hay `storage`, đúng điều ghi chú task nhắc
    (hai phép kiểm import **không** bỏ qua file `.test.ts`).
  - 📏 Toàn bộ: **82 file / 1.666 phép kiểm xanh**.

- [x] **T741** — Kênh nhật ký **RIÊNG không cắt** của engine liên tục
  - File: tạo `src/engine/lienTuc/nhatKy.ts`, `src/engine/lienTuc/nhatKy.test.ts`; sửa
    `src/engine/lienTuc/moc.ts`
  - Xong khi: bảng ánh xạ loại **hai chiều** + hai danh sách khai (`loai_mo_rong`,
    `loai_bo_trong`) đầy đủ; `grep -n "cacSuKien\|ungVien" src/engine/lienTuc/nhatKy.ts` →
    **rỗng**; và `npx tsc --noEmit` sạch.
  - AC: AC-45.5, AC-45.6
  - Phụ thuộc: T740
  - Ghi chú — **bẫy ở BƯỚC BIÊN DỊCH, không ở vitest:** `src/ui/phaBong.ts:85` `nguoiGiuBong`
    có một switch **vét cạn** trên cả **16** giá trị `LoaiSuKien` (`:114-151`), **không có
    `default`** và **không có `return`** nào sau switch, mà kiểu trả về là `string | null` với
    `strict: true`. Nên **thêm một giá trị vào `LoaiSuKien` làm file này đỏ ngay ở `tsc`
    (TS2366)**. Đây đúng là loại bẫy mà bài học `MS_MOI_PHUT` nói tới, chỉ khác là nó đỏ ở
    compiler. Thêm nữa: `src/ui/tuongThuat.test.ts` `MOI_LOAI` liệt kê **tay** và đang có
    **15** giá trị (thiếu `'huy-tran'`), còn `phaBong.test.ts:218-236` có **16** — **hai danh
    sách đã lệch nhau sẵn**, và vì viết tay nên chúng **sẽ không đỏ** khi `LoaiSuKien` đổi, chỉ
    âm thầm phủ thiếu. **Nên T741 không thêm giá trị nào vào `LoaiSuKien`** — nó dùng bảng ánh
    xạ riêng, và đó chính là lý do plan chọn "kênh RIÊNG".
  - ✅ **Ghi chú của task đúng từng chữ, và tôi chứng minh bằng đột biến:** thêm một giá trị
    vào `LoaiSuKien` cho **đúng hai lỗi `tsc`** — `src/ui/phaBong.ts` (switch vét cạn, không
    `default`, không `return` sau nó) và `nhatKy.test.ts` (phép kiểm mới). Kênh **riêng**
    tránh được cả chuyện ấy lẫn chuyện hai danh sách viết tay đã lệch nhau sẵn.
  - ⚠️ **Phép kiểm đầy đủ hai chiều đỏ ở `tsc`, không ở `vitest`.** `MOI_LOAI_SU_KIEN` là
    một `Record<LoaiSuKien, true>`, nên TypeScript **bắt buộc** nó liệt đủ mọi giá trị. Đó
    là thứ hai danh sách viết tay trong repo không làm được: `tuongThuat.test.ts` liệt **15**
    còn `phaBong.test.ts` liệt **16**, và vì viết tay nên chúng âm thầm phủ thiếu mãi.
  - ⚠️ **Mục 7b có khoá "chỉ số bàn thắng kỳ vọng" trong ví dụ, và kênh này KHÔNG mang nó.**
    Người dùng chốt ở `/clarify` câu 11 rằng chỉ số ấy thuộc **spec 010**. Dòng nhật ký vì
    thế có **tám** khoá chứ không chín — một lệch **có tên** so với ví dụ gốc.
  - 🐞 **Và kiểm chỗ ấy mới lộ ra điều kiện ra của T730 CHƯA đạt theo nghĩa đen.** T730 ghi
    `grep -rl` ký hiệu ấy trên `lienTuc/` phải **rỗng**; tôi hiện thực nó thành phép quét
    **đã bóc chú thích** (và ghi rõ lý do), nên nó xanh — nhưng `grep` **thô** vẫn khớp hai
    file của chính T730, nơi ký hiệu nằm trong chú thích giải thích lệnh cấm. Đã viết lại ba
    chỗ chú thích ấy thành "chỉ số bàn thắng kỳ vọng"; nay **cả hai** cách đọc cùng đúng và
    8 phép kiểm của T730 vẫn xanh.
  - 🐞 **Phép kiểm "không cắt" đầu tiên của tôi SAI, và phép đo bác nó ngay.** Tôi đòi nhật
    ký **dài hơn** dòng tường thuật, đo ra **70 so với 70**. Lý do: `chonSuKien` chỉ cắt khi
    số ứng viên **vượt trần** 60–100 dòng, mà `gomUngVienCuaPhut` đã tỉa trước nên một trận
    90 phút chỉ còn ~70 ứng viên — trần **không bao giờ chạm tới**. Đo trên ba thời lượng,
    5 mã mỗi mức: **20 phút** 121 → **108**, **2/5 trận bị cắt**; **45 phút** 205 → 205,
    không cắt; **90 phút** 383 → 383, không cắt. Nên ca chứng minh phải là trận **ngắn** —
    một phép kiểm chỉ chạy ở 90 phút sẽ **xanh mãi mãi** dù nhật ký có đi qua phép cắt hay
    không.
  - ✅ **Hai mệnh đề cho "không cắt", và AC-45.6 cần cả hai**: phép đo nói "hôm nay nó không
    cắt" (nhật ký giữ **đúng** số ứng viên trên 5 mã), còn phép quét mã nguồn nói nó
    **không thể** cắt (`tepXuat.ts` không gọi `chonSuKien` hay `dongSuKien`).
  - ✅ **Phép đổi `UngVienSuKien` → `SuKien` nằm ở `tepXuat.ts`, không ở `nhatKy.ts`** — và
    chính lệnh cấm `grep` của task giữ như thế: module ấy không được biết hai cái tên đó,
    nên nó không bao giờ thành một bộ lọc thứ hai.
  - ✅ **Bốn phép đột biến, bốn lần đỏ**: thêm giá trị vào `LoaiSuKien` → 2 lỗi `tsc`; bỏ một
    loại khỏi `LOAI_BO_TRONG` → 2 đỏ; cho nhật ký lọc bớt dòng → 1 đỏ; bỏ `ghi_chu` của loại
    ngoài từ vựng → 1 đỏ. Cộng một đột biến ở chỗ nối: dựng nhật ký từ `dongSuKien` → 2 đỏ.
  - 📏 Toàn bộ: **83 file / 1.682 phép kiểm xanh**.

- [x] **T742** — `lienTuc/doCoHoc.ts` + bộ test **ngược** + test độc lập thứ tự cột
  - File: tạo `src/engine/lienTuc/doCoHoc.ts`, `src/engine/lienTuc/doCoHoc.test.ts`; sửa
    `src/engine/lienTuc/tepXuat.ts` (export kiểu đã parse + `khoa_bong`/`khoa_nguoi`),
    `src/engine/lienTuc/coHoc.ts` (export ba trần số)
  - Xong khi: `doCoHoc` đo **MƯỜI** AC cơ học — AC-38.1→38.7, **38.9, 38.10, 38.11** (AC-38.8
    là **ngoại lệ** đo ở lớp vẽ, T735) — và AC-38.3 phải đo **cả hai vế**, gồm vế (ii)
    `45° ≤ Δθ ≤ 90° → |v(sau)| <= 0,60 · |v(trước)|`, vì chính chỗ **không gọi tên nó** là cách
    vế (ii) biến mất lần đầu; bộ test **ngược** bơm một mốc sai cho **mỗi** ngưỡng và
    đòi **đúng một** `ViPham`, **gồm một ca bơm trọng tài ra 36 m**; và một test chứng minh
    phép đo **độc lập với thứ tự cột** (tra cột bằng tên qua `khoa_nguoi.indexOf`).
  - AC: AC-45.6, AC-37.1, AC-37.3, AC-37.4, AC-37.7, AC-38.1→38.7, AC-38.9, AC-38.10, AC-38.11
  - Phụ thuộc: T740, T741, T711, **T712** (AC-38.4 + AC-38.11), **T716** (AC-38.10 — nguồn
    toạ độ ba điểm trọng tài), **T721** (AC-38.5), T723
  - Ghi chú: `doCoHoc` trả **một** mảng `ViPham[]`. Mảng thứ hai `chuaChot` đã bị bỏ — nó chỉ
    tồn tại khi dải 15–25 m còn bất khả thi, và dải **15–35 m** canh tuyệt đối được (người dùng
    chốt câu 6). Ba trần số (9 m/s, gia tốc 6, giảm tốc 8) phải **import** từ `coHoc.ts`, không
    chép số — chép là sinh hai nguồn cho cùng một ngưỡng.
  - 🐞🐞 **Lỗi lớn nhất của task nằm trong CHÍNH BỘ ĐO, và chỉ bộ test NGƯỢC bắt được.**
    `lechGoc` bản đầu của tôi là `180 - Math.abs(((a-b+540)%360)-180)` — **đảo dấu**: nó trả
    **0** cho hai hướng ngược nhau và **180** cho hai hướng trùng nhau. Chiều thuận vẫn chạy
    trơn, vẫn ra một bảng số trông rất thuyết phục: **30.553** vi phạm, trong đó **12.171** ở
    AC-38.3(i) với chú thích "đổi hướng 180°" — toàn bộ là những người đang chạy **thẳng**. Ca
    ngược "bơm một cú quay 180° ở 5 m/s" ra **0** vi phạm là chỗ duy nhất nói ra điều đó. Sau
    khi sửa: **1.606** vi phạm. Bài học ghi thẳng vào `lechGoc`: **"nhiều vi phạm hơn" không
    phải dấu hiệu một phép đo đang làm việc** — một dấu trừ sai cho ra nhiều hơn, không ít hơn.
  - ⚠️⚠️ **Và tôi đã suýt báo một "lỗ thứ chín" không tồn tại.** Giữa task tôi đo được
    AC-38.4(lùi) **9.225/118.795** và AC-38.11 **9.272/121.648** vi phạm *trên vận tốc thật*,
    rồi thấy `lechToiDaTheoTocDo`, `tranTheoKieu`, `phanLoaiHuong` **không có người gọi** ngoài
    `coHoc.test.ts` — khớp hoàn hảo với khuôn tám lỗ trước. Cả hai con số là do `lechGoc` đảo.
    Đo lại: **0/48** và **0/124.111**, lệch vượt lề lớn nhất **0,00°**. Trần quay thân người
    của `huongNguoiMocSau` **đủ** giữ cả hai AC; ba ký hiệu kia không có người gọi vì **không
    cần**, không vì bị bỏ quên. Khuôn mẫu đúng tám lần không làm lần thứ chín thành thật.
  - 📏 **Mô hình SẠCH khi đo trên vận tốc của chính nó** (`vx, vy` float64 trong
    `TrangThaiLienTuc`, không qua phép làm tròn của tệp): tốc độ lớn nhất **9,0000** m/s —
    chạm đúng trần AC-38.1 không vượt; `|Δv|` lớn nhất **7,2000** m/s² dưới trần 8;
    AC-38.3(i) **0/7.690** cặp có `Δθ > 90°` (cổng quay ba băng của D123 làm đúng việc, và có
    **7.690 mẫu thật** chứ không xanh rỗng); AC-38.3(ii) **0/6.739**; AC-38.4(lùi) **0/48**;
    AC-38.11 **0/124.111**.
  - 📏 **Nhưng đo trên DỊCH CHUYỂN — tức đúng thứ người đọc tệp đo được, và đúng thứ AC-45.6
    nói tới — thì còn 1.606 vi phạm / ~150.000 mẫu**, ổn định quanh đó trên 5 mã (1.606 /
    1.678 / 1.557 / 1.615 / 1.705). Chi tiết: AC-38.1(i) **15** (max **9,96** m/s),
    AC-38.1(ii) **12** (max **5,00** giây), AC-38.2(tăng) **255** (max **13,35** m/s²),
    AC-38.2(giảm) **11** (max **10,24**), AC-38.3(i) **443**, AC-38.3(ii) **860**,
    AC-38.4(ngang) **5**, AC-38.11 **5**. Sáu vế **ĐẠT có mẫu**: AC-38.4(lùi) 0/180,
    AC-38.5(khống chế) 0/146, AC-38.9 0/1, AC-38.10(c) 0/11.958, AC-38.10(d) 0/5.979.
  - ⚠️ **Món nợ ấy có HAI nguồn có tên, và cả hai nằm NGOÀI phạm vi T742** (T742 là task
    **đo**), nên chúng được trình cho người dùng kèm con số chứ không tự sửa:
    **(1) `tachChen` đẩy người ra khỏi nhau SAU phép bước**, và phần đẩy ấy không đi qua trần
    nào — nguồn của 15 mốc AC-38.1(i) và phần lớn 255 mốc AC-38.2(tăng).
    **(2) Mốc thường cách 1 giây, tích phân chạy 0,5 giây** — hai bước một mốc. Một người quay
    85° mỗi bước (băng giữa của D123) thì giữa hai **mốc** đã quay 170°, trong khi AC-38.3 nói
    về "tốc độ ở **mốc** ngay trước đó" — nguồn của 443 + 860 mốc AC-38.3.
  - ⚠️ **Bốn vế có 0 MẪU, và chúng được KHAI RA bằng tên chứ không im** (`VE_CHUA_CO_MAU`,
    `VE_KHONG_DO_DUOC_TU_TEP`), vì một vế 0 mẫu trả "không vi phạm" **y hệt** một vế đã đo và
    đạt: **AC-38.7** (mô hình pha bóng không có trạng thái "bóng lăn tự do" — thuộc spec 008;
    hôm nay canh ở mức hàm thuần trong `vatLyBong.test.ts`); **AC-38.5(đánh đầu)** và **cả hai
    vế AC-38.6**. Ba vế sau cùng một nguyên nhân: `dienPha.ts:182` đặt
    `nguoiGiu = phaCon === 'bongChet' ? KHONG_AI_GIU : chiSoNguoiGiu`, tức **một người cho cả
    pha**, kể cả những mốc quả bóng đang bay. Đo được: bóng đi **14.875,81 m** ở các mốc *có*
    `nguoi_giu` và **0,00 m** ở 1.932 mốc `-1`. Nên tệp **không có dấu hiệu nào** nói "bóng đã
    rời chân", và `trang_thai: 'danh_dau'` **không xuất hiện một lần** trong 15.180 ô-khung
    dày. AC-38.6 vẫn **được canh** — ở mức hàm thuần, T726, 10 mã — chỉ **không đo được từ
    tệp**, tức đúng chỗ AC-45.6 hứa.
  - ⚠️ **Hai mệnh đề (a) và (b) của AC-38.10 KHÔNG đo được từ tệp, và đó là một lệch có tên.**
    (a) nói về chỗ trọng tài **nhắm tới**, (b) về đoạn thẳng **đường chuyền** — tệp chứa vị trí
    **thật** ở từng mốc, không chứa đích cũng không chứa đường chuyền. Dựng lại hai thứ ấy từ
    tệp là **chạy lại engine**, và một phép đo tự dựng đầu vào của mô hình rồi so với đầu ra
    của chính mô hình thì không bác được gì. Hai vế ấy canh ở mức hàm thuần (T716).
  - ⚠️ **Ca "bơm trọng tài ra 36 m" của điều kiện ra KHÔNG đỏ được, và tôi không đổi số cho
    nó đỏ.** Điều kiện ra viết ngày 2026-11-23, khi (a) còn là phép kiểm **tuyệt đối** trên
    khoảng cách **thật** trong dải [15; 35] m. Hai lần làm rõ sau (câu 25 và câu 26) đã **tách
    đích khỏi độ trễ**: khoảng cách thật nay do (d) kẹp, lề **50 m** quanh 25 m — nên 36 m lệch
    **11 m** và **đúng theo AC hôm nay**. Phép kiểm khẳng định **cả hai nửa**: 36 m không đỏ,
    **80 m** thì đỏ (độ lệch 55 m). Trình cho người dùng, không tự chỉnh điều kiện ra.
  - ✅ **Lề của mọi phép so DẪN XUẤT từ phép làm tròn của tệp, không đặt tay** — đây là bài học
    ULP của T704 ở một tầng khác: ở đó `Float32Array` làm 9 thành 9,0000005, ở đây `tron(x, 2)`
    làm mỗi toạ độ lệch tới 0,005 m và phép chia cho `Δt` nhỏ **phóng đại** nó.
    `LE_TRON_MET = 0,005` → `LE_QUANG = 4·LE_TRON_MET` → `LE_TOC = LE_QUANG/0,5` →
    `LE_GIA_TOC = 2·LE_TOC/0,5`. Và `QUANG_TOI_THIEU_GOC = 1` m vì góc của một vector ngắn là
    vô định: hai toạ độ lệch 0,005 m trên một bước 0,02 m cho một hướng gần như ngẫu nhiên.
  - ✅ **Lề của AC-38.10(c) là con số mà `coHoc.test.ts` (T716) đã ghi là "để sau", nay đo ra:**
    ở T716 vế (c) đúng **theo cấu trúc** vì `viTriTrongTai` trả thẳng `xTroLy(hậu vệ cuối)`;
    trên tệp nó là **vị trí thật** nên mang theo độ trễ đuổi. Lệch lớn nhất trên 5 mã:
    **21,00 / 19,08 / 17,91 / 19,56 / 19,13 m** → lề đặt **25 m**, dư 19%.
  - ✅ **Phép đo chẻ tới mức VẾ, không mức AC** — 17 vế cho 10 AC. Một bảng số mẫu theo AC sẽ
    báo "AC-38.3: 19.397 mẫu" trong khi vế (ii) có 0, và chính chỗ **không gọi tên vế (ii)** là
    cách nó biến mất khỏi cả ba tài liệu lần đầu.
  - ✅ **"Đúng một `ViPham`" đọc là "đúng một của VẾ ẤY", và đó là sự thật về cơ học chứ không
    phải một chỗ nới lỏng**: một ô nhảy 9,5 m trong một giây **là** cả vi phạm trần tốc độ lẫn
    trần gia tốc, vì nó đi từ 0 lên 9,5 m/s. Đòi "đúng một trong cả tệp" là đòi một phép bơm
    không tồn tại. **16 vế** đều có ca ngược đỏ được, và một phép kiểm khẳng định danh sách ấy
    phủ mọi vế trừ AC-38.7.
  - 🐞 **Hai ca ngược đầu của tôi bị `if (h < 2) continue` bỏ qua IM LẶNG**: hai vế hướng mặt
    cần **hai** bước liền nhau, nên một phép bơm ở mốc **thứ hai** không bao giờ tới được chỗ
    kiểm. Đã dời sang mốc thứ ba, và ghi lý do ngay tại hai ca ấy.
  - ✅ **Chín phép đột biến, chín lần đỏ**: `lechGoc` đảo lại → **11 đỏ**; lề trợ lý 25→100 →
    3 đỏ; ngưỡng pha dài 7→20 → 3 đỏ; tỉ lệ 38.3(ii) 0,6→1,5 → 4 đỏ; ngưỡng 38.3(i) 3→8 →
    4 đỏ; `QUANG_TOI_THIEU_GOC` 1→7 → **13 đỏ**; tra cột bằng số thứ tự cứng thay vì tên →
    2 đỏ; bỏ một dòng `dem()` → 2 đỏ; đổi trần AC-38.2 sang trần **mô hình** (6→5,2, 8→7,2) →
    3 đỏ. Phép cuối là phép canh đúng điều ghi chú task đòi: đo trên tệp phải so với con số
    trong `spec.md`, không với con số của mô hình.
  - 📏 Toàn bộ: **84 file / 1.733 phép kiểm xanh** (T740+T741 để lại 1.682 — T742 thêm **51**).

- [ ] **T743** [P] — `xuatTranService.ts` tách `dungChuoiXuat` khỏi `taoBlobXuat`; `useXuatTran.ts`
  - File: tạo `src/services/xuatTranService.ts`, **`src/services/xuatTranService.test.ts`**,
    `src/hooks/useXuatTran.ts`; sửa
    `src/ui/pages/TrangTran.tsx`, `src/ui/ngonNgu/vi.ts`, `src/ui/ngonNgu/en.ts`,
    `src/ui/ngonNgu/index.ts`
  - Xong khi: `xuatTranService.test.ts` chứng minh **ba** điều — `dungChuoiXuat` trả JSON
    parse lại được và **giống từng byte** qua hai lượt; `soByteCuaChuoi` khớp `TextEncoder`;
    và `taoBlobXuat` **không** được gọi khi người dùng huỷ (đường "huỷ trước khi ghi" của mục 5
    spec). Cộng: có nút **xuất tệp** nói rõ **kích thước**;
    `npx vitest run src/ui/ngonNgu/ngonNgu.test.ts src/domain/boundaries.test.ts src/services/`
    xanh; `npx tsc --noEmit` sạch.
  - Ghi chú hiến pháp: **mục 4 bắt buộc unit test cho lớp đọc/ghi dữ liệu, và câu ngoặc của nó
    nói thẳng "bao gồm nhập/xuất tệp"** — nên file test là **điều kiện**, không phải tuỳ chọn.
  - AC: AC-45.5, và P8 + P9
  - Phụ thuộc: T740
  - Ghi chú — **bốn khuôn đã có, dùng lại, đừng viết mới:**
    - `src/services/backupService.ts` đã có khuôn "dựng chuỗi **rồi mới** tạo Blob";
      `src/ui/components/SaoLuu.tsx` (43-56 + `xuat()` 58-68) đã có khuôn "đo kích thước rồi
      hiện trước khi dựng tệp"; `src/ui/components/HopXacNhan.tsx` đã có Esc + focus sẵn vào
      nút Huỷ; `src/ui/ngonNgu/soLieu.ts` `coTep(byte)` chia `1024*1024` rồi in nhãn
      **"MB"**, tức nó in **MiB dưới nhãn MB** — **KHÔNG phải** đơn vị của AC-45.11, vốn đã
      chốt **thập phân** (11.000.000 byte). ⚠️ T743 là chỗ con số **đi ra màn hình**, nên nếu
      dùng `coTep` y nguyên thì một tệp **11.000.000 byte** hiện ra **"10,5 MB"** cho người
      dùng trong khi T745 coi nó **đúng ngưỡng**. Task này phải chọn một đường và nói ra: hiện
      theo cơ số thập phân (`byte / 1.000.000`), hoặc sửa nhãn của `coTep` — nếu chọn đường thứ
      hai thì thêm `soLieu.ts` vào ô File và nhớ `ngonNgu.test.ts` đang canh khối chuỗi đó.
    - `src/ui/components/BieuTuong.tsx` `TEN_TEP` chỉ có **10** biểu tượng và `rutDuongNet`
      **ném lỗi lúc nạp module** nếu thiếu tệp — dùng lại `saoLuu`, **đừng** thêm svg mới.
    - `src/domain/boundaries.test.ts` tự bắt `xuatTranService.ts` và chặn `react`, `../hooks`,
      `../store`, `../ui` — nên **Blob ở services, `URL.createObjectURL` ở hooks** là **luật
      có test**, không phải gu.
    - `src/services/matchRepo.test.ts:195-202` glob `./*.ts` của cả thư mục `services` — file
      mới **tự** vào phạm vi đó.
    - **Khối chuỗi MỚI** thì phải chạm **bốn** chỗ của `ngonNgu/index.ts` (import EN, import
      VI, trường trong `interface BoChuoi`, và **hai** bảng `BO_CHUOI`), và
      `ngonNgu.test.ts:65` sinh thêm **ba** phép kiểm cho khối ấy. Cân nhắc nhồi vào khối có
      sẵn như T724 đã làm.

- [ ] **T744** — **Đo và báo** kích thước thật, đối chiếu với 11 MB của AC-45.11
  - File: `src/engine/lienTuc/tepXuat.test.ts` (dòng kết quả ở **đầu** file),
    `specs/007-continuous-match-engine/plan.md`
  - Xong khi: đầu file có con số đo được cho **ca trung bình** và **ca xấu**, bằng
    `new TextEncoder().encode(chuoi).byteLength`, kèm **lệnh dựng lại được** và điều kiện đo;
    và plan mục 2.3 có cùng con số. **Không** đặt lại ngưỡng — ngưỡng là của AC-45.11.
  - AC: AC-45.11 (đo), AC-45.5
  - Phụ thuộc: T740, T741
  - Ghi chú đơn vị — **phải báo CẢ HAI cơ số**, vì repo đang in một cơ số dưới nhãn của cơ
    số kia: `src/ui/ngonNgu/soLieu.ts` `coTep(byte)` chia `1024*1024` rồi in nhãn **"MB"**, tức
    nó in **MiB dưới nhãn MB**. AC-45.11 chốt **thập phân** (11.000.000 byte), nên T744 báo
    `byteLength`, số MB thập phân **và** số MiB, để không ai phải đoán. Lệch giữa hai cơ số ở
    ngưỡng này là **534.336 byte, tức 4,9%** — đủ để một tệp 11,3 MB xanh ở phép kiểm MiB mà
    **vi phạm** AC-45.11.
  - Ghi chú: `TextEncoder` **chưa xuất hiện ở đâu** trong repo (`backupService.ts:187` chỉ dùng
    `TextDecoder`). `tsconfig.json` có `lib: ["ES2022","DOM","DOM.Iterable"]` nên nó **có kiểu
    sẵn**, không phải thêm `@types/node`. Khuôn báo cáo giống **T753**.

- [ ] **T745** — Phép kiểm ngưỡng `soByte <= 11_000_000` + một **ca ngược**
  - File: `src/engine/lienTuc/tepXuat.test.ts` (+2 ca)
  - Xong khi: trận **90 phút ca xấu** (nhiều tình huống quan trọng nhất trong 20 mã) cho
    `soByte <= 11_000_000`; **và** ca ngược chứng minh ngưỡng **đỏ được** (bơm thêm
    tình huống tới khi vượt).
  - AC: AC-45.11
  - Phụ thuộc: T744
  - Ghi chú: `tepXuat.ts` phải tự trả `soByte` (hoặc export một hàm thuần `soByteCuaChuoi`) —
    test **không lấy được** nó từ `services` vì `boundaries.test.ts` chặn. Điều kiện "Xong khi"
    của T745 khác T744: **T744 báo con số, T745 canh ngưỡng.**

**Xem được gì ngay sau Phase 57:** một nút **xuất tệp** nói rõ kích thước và cho huỷ trước khi
ghi; tệp mở ra bằng `jq` hay `node -e` đọc được; và `npx vitest run` chứng minh **mười** AC cơ
học đo **trên chính tệp ấy**.

---

## Phase 58 — Hai chế độ so được bằng số, và trả các món nợ có tên

- [ ] **T750** — Nâng `maRong` + mẫu 200 mã lên `__fixtures__/doiMau.ts`
  - File: `src/engine/__fixtures__/doiMau.ts`, `src/engine/sosanh.doiManhHon.test.ts`,
    `src/engine/sosanh.sanNha.test.ts`
  - Xong khi: hai file `sosanh.*` cũ **còn in đúng** `174-17-9` và `76-47-77`; và
    `grep -n "Math.random\|Date.now" src/engine/__fixtures__/doiMau.ts` → rỗng.
  - AC: AC-45.3 (nền)
  - Phụ thuộc: —
  - Ghi chú: `maRong` và `MAU_RONG` hiện là hàm/hằng **cục bộ, không export**, nên "dùng lại"
    mà không nâng lên fixture sẽ sinh **bản sao thứ ba** của cùng dãy và "cùng mẫu" chỉ là
    trùng hợp. `doiMau.ts` **không phải** file `.test.ts` nên `laFileTest()` **không** bỏ qua
    nó: dãy mã mới chỉ được dùng `padStart`, **không** một nguồn ngẫu nhiên nào.

- [ ] **T751** — `sosanh.haiCheDo.test.ts`: hai `it`, hai hằng số ở đúng một chỗ
  - File: tạo `src/engine/sosanh.haiCheDo.test.ts`
  - Xong khi: `benMau('A',{chiSo:15})` vs `benMau('B',{chiSo:10})`, `sanTrungLap: true`, **200
    mã**; `LECH_HIEU_SO_TOI_DA = 0.5` và `LECH_TI_LE_THANG_TOI_DA = 0.10` khai ở **đầu đúng file
    ấy**; một lượt đo **có ghi nhớ** (không đo hai lần cho hai `it`); và file **nằm trong
    `npm test` mặc định**.
  - AC: AC-45.3
  - Phụ thuộc: T750, T704, T742
  - Ghi chú: `vitest` `include: ['src/**/*.test.ts']` **không có `exclude`**, nên file mới vào
    `npm test` **tự động** — đúng quyết định câu 7 ngày 2026-11-23. Cái giá đã đo:
    `doiManhHon` (610 trận) chạy **4,2 s**, `sanNha` (800 trận) chạy **6,9 s**, nên một file 400
    trận cùng cỡ ấy — con số "+46–54%" của plan **có cơ sở**. Và lệnh cấm số 1: **không** viết
    phép kiểm "mỗi pha tiêu đúng N lần rút".

- [ ] **T752** [P] — `lienTuc/hieuNangLienTuc.test.ts`: **một** ngưỡng + cổng số đếm thuần
  - File: tạo `src/engine/lienTuc/hieuNangLienTuc.test.ts`
  - Xong khi: **một** ngưỡng, chốt **sau T700**; cộng một **số đếm thuần** (số lần gọi mô hình
    xác suất một trận) vì số đếm **không nhiễu** còn thời gian thì có; và dòng kết quả + điều
    kiện đo ghi ở **đầu** file.
  - AC: — (ngân sách)
  - Phụ thuộc: T700, T704, T711
  - Ghi chú: `performance.now` trong **file test** là **hợp lệ** (`laFileTest` bỏ qua ở
    `boundaries.test.ts:134` và `:161`), y như `hieuNang.test.ts` đang làm. Nhưng
    `raNgoaiEngine` **không** bỏ qua file test: từ `lienTuc/` thì `'../tran'` và
    `'../__fixtures__/doiMau'` hợp lệ, `'../../domain/x'` hợp lệ, `'../../services/x'` **đỏ**.
    Đây là **file ngân sách thứ hai** của repo.

- [ ] **T753** — **Đo và báo** ngân sách mùa giải
  - File: `specs/007-continuous-match-engine/plan.md`
  - Xong khi: plan có con số thật cho "một trận ở chế độ liên tục" kèm **lệnh dựng lại được**,
    đối chiếu với **78,95 ms**; và ô DoD `Ngân sách mùa giải đã được đo và báo số` được tick
    bằng **một con số**, không bằng một lời.
  - AC: — (mục 6 của spec)
  - Phụ thuộc: T752
  - Ghi chú — **KHÔNG có task tối ưu để lọt ngưỡng.** Con số không vừa là việc người dùng
    quyết: nới hiến pháp, hay cho mùa giải chạy chế độ phút. Hai chỗ khác giữ **cùng một con
    số mốc đã lạc hậu** và T753 phải nêu ra, **không tự sửa**:
    `.specify/memory/constitution.md:115` ("engine chạy **200 trận trong 2,2 giây**" — hiến
    pháp là của người dùng, và câu 2 ngày 2026-11-23 đã chốt **hiến pháp không đổi**) và
    `src/hooks/useRePhatLai.ts:109` (bản sao của cùng con số). Đo lại hôm nay: lượt 200 mã ấy
    chạy **1.400 ms**. Nếu T753 báo con số mới mà không nhắc hai chỗ này thì repo có **ba** con
    số cho cùng một phép đo.

- [x] **T813** — Thủ môn chạy qua vạch giữa sân ở engine liên tục. *(Task do spec 011 phát hiện ngày 2026-11-25; người dùng chốt mở task ở đây thay vì để spec 011 che.)*
  - File: `src/engine/lienTuc/coHoc.ts` (hoặc nơi đặt đích thủ môn), `src/engine/lienTuc/coHoc.test.ts`
  - **Phát hiện, đo bằng máy ngày 2026-11-25** trên `AnhChupMet` thật, **10 mã trận × 45 phút
    × mọi mốc = 56.640 lượt đo** vị trí thủ môn:

    | | |
    |---|---|
    | Ra khỏi một phần ba sân nhà | **1.168 lượt — 2,06%** |
    | Lệch xa nhất qua vạch | **31,72 m** |
    | p50 / p90 / p99 của độ lệch | **1,91 / 8,09 / 24,06 m** |

    Lệch 31,72 m đặt thủ môn ở `x ≈ 66,7` — **qua vạch giữa sân**, gần một phần ba sân đối
    phương. Và p90 = 8,09 m nghĩa là **một phần mười** số lần vi phạm vượt 8 m, nên đây không
    phải vài ca biên hiếm.
  - **Nguyên nhân đã khoanh, chưa sửa:** engine kẹp **ĐÍCH** của thủ môn chứ không kẹp **VỊ
    TRÍ**. `coHoc.test.ts:660` ghi đúng chữ *"Kẹp **ĐÍCH** của thủ môn (T714, AC-30.7 của spec
    005)"*. Quán tính đưa anh ta vượt qua cái đích đã bị kẹp, và không gì kéo lại.
  - ⚠️ **Đây chính là lỗi mà spec 005 sinh ra AC-30.7 để chặn, nay tái xuất ở đường liên tục.**
    `src/ui/viTriVe.ts:11` còn ghi nguyên: *lỗi "thủ môn chạy tới giữa sân" đã lọt suốt một lát
    cắt với 1.291 phép kiểm xanh, "trong khi mắt người dùng bắt được ngay"*. Ghi chú thực thi ở
    cuối chính tài liệu này cũng đã dặn ba phép kiểm bất biến của `san2D.test.ts` — trong đó có
    *"thủ môn trong một phần ba sân"* — phải **chạy lại ở MỖI lát**. Chúng không được chạy lại
    trên đường liên tục.
  - ⛔ **Spec 011 KHÔNG được chữa chỗ này.** Nó chỉ đọc engine, và kẹp lại ở lớp vẽ là làm hình
    nói khác engine — `viTriVeLienTuc` đã **cố ý** tắt đúng phép kẹp ấy để `(x′ − x)/dt` còn
    bằng vận tốc engine nói.
  - Xong khi: đo lại đúng bộ 56.640 lượt trên cho **≤ 0,1%** ra ngoài và lệch xa nhất **≤ 2 m**;
    `coHoc.test.ts` có một phép kiểm **chống rỗng** (số lượt đo > 50.000) để nó không xanh vì
    không đo được gì; và **P1 còn nguyên** — cùng mã trận vẫn cho cùng dòng sự kiện từng ký tự.
  - ⚠️ Sửa chỗ này **đổi con số trận**, nên nó chạm **P2**. Phải nêu rõ trong commit rằng mọi
    trận đã lưu bằng engine cũ sẽ phát lại khác, và `lyDoKhongDauLai` phải nói được điều đó.
  - AC: AC-30.7 (của spec 005) đọc lại ở engine liên tục
  - Phụ thuộc: —
  - ✅ **Xong 2026-11-26.** Đo lại trên **đúng** bộ 56.640 lượt đã phát hiện lỗi:

    | | Trước | Sau |
    |---|---|---|
    | Ra khỏi một phần ba sân | 1.168 — **2,06%** | 36 — **0,06%** |
    | Lệch xa nhất | **31,72 m** | **2,19 m** |
    | p50 / p90 / p99 | 1,91 / 8,09 / 24,06 | **0,82 / 1,46 / 2,19** |

  - 🔴 **NGUYÊN NHÂN KHÔNG PHẢI THỨ TASK NÀY ĐOÁN, và chỗ sửa cũng không.**
    Task viết *"engine kẹp ĐÍCH chứ không kẹp VỊ TRÍ, nên quán tính đưa anh ta
    vượt qua"*, và đề xuất **kẹp vị trí**. Cả hai đều sai:
    - `grep` ngày 2026-11-26 cho thấy `kepDichThuMon` **chưa từng được gọi từ
      một dòng mã sản phẩm nào**. Nó có từ T714, có phép kiểm riêng ở
      `coHoc.test.ts:669`, và là **mã chết**. Đích của thủ môn **chưa từng bị
      kẹp gì cả** — quán tính không thể đưa ai đi 31,72 m quá đích.
    - Kẹp **vị trí** sẽ **vỡ AC-38.2**. Chú thích của chính `kepDichThuMon` đã
      từ chối cách ấy từ T714: kẹp vị trí là để thủ môn chạy ra rồi **giật**
      về, một bước dịch không qua phép kẹp gia tốc, và trên hình trông như
      teleport.

    Cách sửa thật: **nối phép kẹp đã có vào đường chạy** —
    `tranLienTuc.ts` dựng bảng `thuMonCuaO` trong chính vòng lặp dựng `choDung`
    (cùng `doiHinhTrenSan`, nên hai mảng không thể lệch chỉ số) rồi gọi
    `kepDichThuMon` cho đúng hai ô ấy. Kẹp áp **cả khi thủ môn đang giữ bóng**,
    đúng chữ AC-30.7.
  - ⚠️ **NGƯỠNG ĐÃ ĐỔI, người dùng chốt ngày 2026-11-26: `≤ 2,5 m` thay vì
    `≤ 2 m`.** Ngưỡng 2 m **không bảo đảm được bằng thiết kế này**: ở 9 m/s với
    giảm tốc 7,2 m/s², quãng hãm lý thuyết là `v²/2a = 5,6 m`. Một thủ môn chạy
    hết tốc nhắm đúng biên có thể vượt tới 5,6 m, và ép về 0 thì phải kẹp vị
    trí — tức vỡ AC-38.2. Ngưỡng mới đặt **sát số đo thật 2,19 m** nên nó đỏ
    ngay nếu xấu đi, và trần lý thuyết 5,6 m được ghi ra để không ai tưởng 0 là
    đạt được.
  - ✅ **P2 KHÔNG bị chạm — lời cảnh báo của chính task này SAI.** Task viết
    *"sửa chỗ này đổi con số trận, nên nó chạm P2"*. Đo thật: `taiLap`,
    `phatLai` (36 phép), `sosanh.*` và vân tay dòng sự kiện của spec 011 đều
    **xanh** qua thay đổi này — **dòng sự kiện và tỉ số không đổi một ký tự**.
    Đúng như hiến pháp nói: vùng là đơn vị **QUYẾT ĐỊNH**, lớp liên tục chỉ
    **DIỄN**. Thay đổi này đổi cách trận được **vẽ**, không đổi trận.
  - 📝 Chín bộ đếm đo lường trong `doCoHoc.test.ts` đã ghim lại, kèm chú thích
    tại chỗ. Hai trong chín là **tốt lên**: `AC-38.1(i)` 15 → 12 và
    `AC-38.1(ii)` 12 → 11. Bộ kiểm đầy đủ: **86 file / 1.809 phép kiểm xanh**.

- [x] **T814** — Cầu thủ đè lên nhau trên đường liên tục. *(Thêm **và xong** 2026-11-26 từ phán quyết `T760`.)*
  - File: `src/engine/lienTuc/coHoc.ts` (`tachChen`), `src/engine/lienTuc/coHoc.test.ts`
  - **Phát hiện:** người dùng xem trọn một trận ở `T760` và nói *"tôi thấy bị đè lên nhau"*.
    Đo bằng máy trên **1.135 mốc** của 5 mã trận, dùng `phanBietDuoc` của spec 011 với ngưỡng
    **một bán kính** (chính ngưỡng `san2D.test.ts:173` đã dùng cho AC-15.2 từ spec 002):

    | | Sa bàn | Sân 2D |
    |---|---|---|
    | Mốc có ít nhất một cặp đè | **100%** | **100%** |
    | Cặp đè / tổng cặp | 19.294 | 19.482 / 262.185 (**~7,4%**) |
    | Cặp gần trùng khít (< ½ bán kính) | 0 | — |

  - 📍 **Sân 2D tệ y hệt sa bàn**, nên đây **không** phải lỗi của lớp vẽ 3D. Và nó là một lỗ
    hổng **cùng loại với `T813`**: `san2D.test.ts` canh "không chồng khít" trên bố cục **cổ
    điển** tại các mốc sự kiện, còn **đường liên tục thì không phép kiểm nào canh**. `tachChen`
    có chạy, nhưng nó tách theo **mét** và rõ ràng chưa đủ.
  - ⛔ **Spec 011 KHÔNG chữa được chỗ này.** Dịch người ở lớp vẽ là vỡ **AC-46.5** (hai góc
    nhìn phải khớp `(x, y)` từng số) và làm hình nói khác engine. Đã gỡ tích **AC-49.6** và
    **AC-49.7** của spec 011 vì chúng dựa vào điều này.
  - Xong khi: đo lại đúng bộ 1.135 mốc trên cho **≤ 1%** số cặp đè và **≤ 20%** số mốc có cặp
    đè; `coHoc.test.ts` có một phép kiểm **chống rỗng** (số cặp đã so > 200.000); và **P1 còn
    nguyên** — cùng mã trận vẫn cho cùng dòng sự kiện từng ký tự.
  - ⚠️ Sửa `tachChen` **đổi vị trí người**, nên nó có thể đổi con số trận. Phải đo lại chín bộ
    đếm của `doCoHoc.test.ts` và nói rõ trong commit, đúng như `T813` đã làm.
  - ✅ **XONG 2026-11-26 — nhưng NGUYÊN NHÂN KHÔNG PHẢI THỨ TASK NÀY VIẾT.**
    Lời task ở trên nói *"tachChen tách theo mét và rõ ràng chưa đủ"*. Sai. `tachChen` giữ
    đúng 2,0 m, không hụt một milimét. Lỗi nằm **trước** nó, ở chỗ phát đích:

    > **Lưới 12 vùng chỉ phát 8 ĐIỂM ĐÍCH cho 22 NGƯỜI.**

    | điểm | số người cùng nhắm |
    |---|---|
    | `36,8 ; 34,0` | **4** — hai `DC` nhà và hai `MC` khách |
    | `68,3 ; 34,0` | **4** — hai `MC` nhà và hai `DC` khách |
    | `10,5 ; 34,0` | **3** — `GK` nhà và hai `ST` khách |
    | `94,5 ; 34,0` | **3** — hai `ST` nhà và `GK` khách |
    | bốn điểm cánh | **2** mỗi điểm |

    **22 trong 231 cặp (9,5%) nhắm đúng một điểm**, và phép đo trên 6.789.700 cặp cho
    **9,53%** số cặp có đĩa chồng nhau — trùng tới hai chữ số thập phân, vì là **cùng một tập
    cặp**. Đó là **cả hai** câu người dùng nói, từ **một** nguyên nhân: cùng đích thì
    `tachChen` xô họ ra rồi để họ đứng **đúng** trên tường 2,0 m (phân vị 1% của khoảng cách =
    2,000 m, **6,23%** số cặp nằm ngay trên tường), và cùng đích **cộng** cùng phép cơ học thì
    hai người dịch **y hệt nhau** từng mốc — họ không chỉ gần nhau, họ là **một khối**.
  - **Cách sửa:** `choDungDoiHinhMet` trong `src/engine/lienTuc/viTriMet.ts` — người thứ `i`
    trong nhóm `k` người cùng vùng lệch `(i − (k−1)/2) × 10 m` theo trục ngang, và mỗi bên lùi
    **`6,0 m`** về sân mình (bốn điểm giữa sân bị hai bên cùng nhắm vì dải 1 của nhà là dải 2
    của khách). Hai nơi gọi: `coHocXuatPhat` và vòng dựng `choDung` của `buocPhutLienTuc`.
    ⚠️ **`3,5 m` → `6,0 m` là quyết định của MẮT, không của phép đo.** Bản `3,5 m` làm **mọi**
    phép kiểm xanh — 7 m qua ngưỡng đếm-ra-hai (6,01 m) — nhưng người dùng xem bản chạy và
    thấy **11 cặp khiêu vũ**: 7 m chỉ hơn **một** đường kính đĩa đúng 1 cm, nên mỗi cầu thủ
    nhà đứng dính một cầu thủ khách suốt trận. `6,0 m` cho **12 m**, tức **hai** đường kính.
    Người dùng chốt ngày 2026-11-26 sau khi xem.
    ⛔ **Không** thêm vai trò, pha, hay chỉ số nào — nó chỉ làm một việc: **không đặt hai người
    lên cùng một điểm**. Khối phòng ngự, hai tuyến, pressing vẫn là **US-40 của spec 009**.
  - **Số đo sau khi sửa**, đúng bộ mẫu cũ:

    | | trước | giãn 3,5 m | giãn **6,0 m** |
    |---|---|---|---|
    | cặp không phân biệt được | **7,27%** | 0,073% | **0,041%** |
    | mốc có cặp như vậy | **100%** | 15,6% | **8,8%** |
    | **đĩa chạm mép nhau** | 9,53% | 3,95% | **0,75%** |
    | phân vị 1% của khoảng cách | 2,000 m | 5,25 m | **7,50 m** |
    | cặp nằm đúng trên tường 2,0 m | 6,23% | 0,02% | **0,01%** |

    📌 Cột đáng nhìn nhất là **đĩa chạm mép** — `9,53% → 0,75%`, bớt **13 lần** — vì đó là
    thứ người xem thật sự thấy. Hai vế của điều kiện ra (`≤ 1%` số cặp, `≤ 20%` số mốc) đều
    đạt với biên hơn hai lần. Phép kiểm ở `src/ui/batBienSaBan.test.ts` (1.336.690 cặp, trên
    ngưỡng chống rỗng 200.000) và 7 phép kiểm đơn vị ở `viTriMet.test.ts`, trong đó **một
    phép chống rỗng** khẳng định hàm **cũ** trùng đúng 8 điểm — không có nó thì cả khối xanh
    mà chẳng chứng minh gì.
  - ⚠️ **HAI NGƯỠNG TÔI CÔNG BỐ KHÔNG ĐỘC LẬP VỚI NHAU — lỗi của tôi khi đặt chúng.** Một
    mốc có **231 cặp**, nên `0,1%` số cặp đã cho ~20% số mốc; tức `1%` số cặp tương đương
    ~**90%** số mốc, chứ không 20%. Vế **mốc** chặt hơn vế **cặp** gần mười lần, và nó mới là
    vế thật sự ràng.
    📍 Ở bản `3,5 m` điều đó từng đau: vế mốc đo ra **15,6% / 18,7% / 20,1% / 25,0%** tuỳ mẫu,
    tức **bước qua lại** đường 20%, và phép kiểm chỉ xanh nhờ mẫu nào được chọn — tôi đã nói
    thẳng điều ấy với người dùng thay vì để yên. Ở bản `6,0 m` nó hết chông chênh:
    **8,8% / 9,0% / 10,9% / 10,2%** trên cùng bốn mẫu ấy. Dải nằm trong 20% với biên **hơn hai
    lần**, và không mẫu nào tới gần đường. Đó là khác biệt thật giữa hai bản, không phải một
    mẫu may mắn.
  - 💰 **HỆ QUẢ PHỤ LỚN NHẤT: món nợ cơ học của `T742` rụng 95%.** Chú thích của
    `doCoHoc.test.ts` nêu hai nguồn có tên của chênh lệch vận tốc ↔ dịch chuyển, nguồn thứ nhất
    là *"tachChen đẩy người ra sau phép bước"*. Gỡ chỗ đứng trùng đi:

    ```
    tổng vi phạm         1.613 → 77      (năm mã: 1.606/1.678/1.557/1.615/1.705 → 77/114/56/66/95)
    AC-38.2(tăng)          259 → 3        AC-38.3(i)    443 → 4
    AC-38.2(giảm)           12 → 0        AC-38.3(ii)   862 → 26
    AC-38.4(ngang) đếm       7 → 0        AC-38.11        7 → 1
    AC-38.1(i)              12 → 34      ← TỆ HƠN        AC-38.1(ii)  11 → 9
    ```
    ⚠️ **`AC-38.1(i)` là chỗ xấu đi, và giãn rộng làm nó xấu thêm: 12 → 15 (bản 3,5 m) → 34
    (bản 6,0 m).** Người đứng rời nhau thì quãng phải chạy về phía bóng **dài hơn**, nên tốc
    độ đo trên **dịch chuyển** chạm trần nhiều hơn. Tổng vi phạm vẫn là 77 ở cả hai bản — việc
    giãn rộng **dồn** món nợ còn lại sang một vế chứ không tạo thêm nợ.
  - ⚠️ **MỘT MÓN NỢ MỚI, NÊU RA CHỨ KHÔNG TỰ SỬA:** `soMau` của vế `AC-38.4(lùi)` tụt
    **180 → 21**. Phần lớn 180 mẫu cũ là **rác** — những cú xô của `tachChen` trông như chạy
    lùi với phép đo dựa trên dịch chuyển. Nhưng 22 mẫu là **thưa**, và chính `doCoHoc.test.ts`
    đã rào *"một vế chỉ chạm tới vài chục lần thì xanh hay đỏ đều là ngẫu nhiên"*. Nên phép
    chống rỗng của vế ấy **yếu hơn hôm qua**. Chưa mở task riêng: nó thuộc `T742`, và nên gộp
    vào lần ai đó mở lại `T742`.
  - 📍 **P2 nguyên vẹn, lần thứ hai trong một ngày.** 1.834 phép kiểm xanh, kể cả vân tay dòng
    sự kiện của spec 011. Vị trí mét **không vào bản ghi trận** (AC-45.4), nên **không trận đã
    lưu nào đổi**. Lời cảnh báo của chính task này (*"có thể đổi con số trận"*) không thành sự
    thật — cùng lý do T813 cũng không: vùng là đơn vị **QUYẾT ĐỊNH**, lớp liên tục chỉ **DIỄN**.
  - AC: AC-30.5 (của spec 005) đọc lại ở engine liên tục; gỡ chặn AC-49.6/49.7 của spec 011
  - Phụ thuộc: —

- [x] **T815** — Cả đội hình trượt cùng nhau như một khối. *(Thêm **và xong** 2026-11-26 từ phán quyết `T760`.)*
  - File: `src/engine/lienTuc/viTriMet.ts` (`dichNguoiKhongBong`), phép kiểm cạnh nó
  - **Phát hiện:** cùng lượt xem ấy, người dùng nói *"di chuyển của cầu thủ quá máy móc và
    dính liền đến nhau"*.
  - **Số đo, và hãy đọc kèm cảnh báo về nó:** tỉ lệ phần dịch chuyển **chung** của 22 người
    trên tổng chuyển động giữa hai mốc liên tiếp — p50 **0,19**, p90 **0,72**. Tức cứ mười
    khung thì có một khung mà **72%** chuyển động là cả khối trượt cùng hướng.
    ⚠️ Thước đo này là **của tôi và còn thô** — nó ủng hộ điều người dùng thấy, nhưng không
    phải một chỉ số đã được ai công nhận. Task này nên bắt đầu bằng việc **chọn một thước đo
    tốt hơn**, không phải bằng việc tin con số trên.
  - 📍 Nguyên nhân khoanh được: `dichNguoiKhongBong(choDung[o], dBong)` đưa **mọi** người
    không giữ bóng về phía bóng theo cùng một phép, lấy chỗ đứng sơ đồ làm neo — nên cả khối
    tịnh tiến. Không có thành phần riêng cho từng người (vai trò, thể lực, độ trễ phản ứng).
  - ⚠️ **Đây là lõi hành vi đội hình.** Chạm vào là **đổi mọi trận đã lưu**, tức chạm **P2** —
    khác hẳn `T813`, nơi dòng sự kiện không đổi một ký tự. Phải nói rõ điều đó trước khi làm,
    và `lyDoKhongDauLai` phải nói được.
  - 🔴 **ĐO LẠI SAU `T814` NGÀY 2026-11-26, VÀ THƯỚC ĐO ĐI NGƯỢC:** p50 **0,19 → 0,41**,
    p90 **0,72 → 0,92** (17.415 mẫu, mọi cặp mốc liên tiếp của 5 mã).
    📌 Và đó **không** phải một hồi quy — nó là bằng chứng rằng **thước đo sai**, đúng điều
    cảnh báo ở trên đã nói trước. Trước T814, 22 cặp dính nhau bị `tachChen` xô ngược chiều mỗi
    mốc; những cú xô ấy là **tán xạ ngẫu nhiên** và chúng phình **mẫu số**. Gỡ chúng đi thì
    chuyển động còn lại gọn hơn, và một thước đo lấy tán xạ làm mẫu số đọc ra **tệ hơn** khi
    hình **tốt hơn**. Số đo cũ (0,19 / 0,72) vì thế bị **rút lại**, không dùng làm mốc so.
  - 📌 Nguyên nhân thật thì **không đổi và vẫn còn đó**: `dichNguoiKhongBong` dùng **một**
    hệ số `0,25` cho cả 22 người, nên đội hình là một phép **co đều** về phía bóng. Việc đầu
    tiên của task này vẫn là **chọn một thước đo khác** — và nó phải là thước đo không lấy tán
    xạ của một lỗi khác làm mẫu số.
  - Xong khi: có một thước đo được chốt, một số đo trước/sau, và **người dùng xem lại rồi
    phán** — chính `T760` là cổng của việc này, không phải một phép kiểm.
  - ✅ **XONG 2026-11-26. Và thước đo mới KHÔNG phải một phép đo — nó là ĐẠI SỐ.**
    Với một hệ số `p` duy nhất cho cả 22 người:

    > `đích_i = (1 − p)·chỗ_i + p·bóng`  ⟹  `Δđích_i = p·Δbóng`, **giống hệt nhau với mọi i**

    Hai mươi hai vectơ dịch chuyển **bằng nhau từng số**. Trường đích không *trông như* một
    khối — nó **là** một phép tịnh tiến cứng, chứng minh bằng hai dòng. Đó là lý do thước đo
    cũ (lấy tán xạ làm mẫu số) sai ngay từ cách đặt: nó đi đo một thứ đã chứng minh được.
  - 📐 **Hai thước đo đã chốt:**
    1. **Độ tản mạn của trường đích** — lệch chuẩn của 22 vectơ `Δđích` chia độ dài trung bình.
       Mô hình một-hệ-số cho **đúng 0**; sau T815 nó bằng **hệ số biến thiên của dãy `p`** =
       **0,1434**. Một con số **đóng**, không phụ thuộc mã trận nào.
    2. **Số ô lưới** — trung bình số giá trị `x` khác nhau (làm tròn 0,5 m) trong 22 vị trí, và
       số giá trị `y`. Trước T815: **9,15 / 22** và **5,56 / 22** — quá nửa số người đứng chung
       toạ độ với ai đó. Đó chính là cái lưới ô vuông nhìn thấy trên bản chạy.
  - **Cách sửa:** `phanDichCuaO(o)` trong `viTriMet.ts` — dãy tỉ-lệ-vàng rải 11 ô đều trên dải
    `0,25 ± 0,06`, **trung bình đúng bằng `PHAN_DICH_THEO_BONG` cũ** (có một phép kiểm mang
    đúng tên điều đó: dãy thô lệch tâm ở 0,4538 chứ không 0,5, không trừ đi thì cả hai đội lùi
    sâu thêm). Hai đội dùng **cùng** dãy (`o % 11`). Không tiêu một lần rút ngẫu nhiên nào —
    tiêu một lần rút là đổi **dòng sự kiện**.
  - **Số đo, và biên độ chọn từ một đường đánh đổi chứ không từ cảm tính:**

    | biên độ | lưới `x` | lưới `y` | cặp đè | mốc có cặp đè |
    |---|---|---|---|---|
    | **0** *(trước T815)* | 9,15 | 5,56 | 0,041% | **8,8%** |
    | 0,04 | 18,49 | 9,52 | 0,041% | 8,9% |
    | **0,06** ← chọn | **18,85** | **9,97** | **0,041%** | **9,0%** |
    | 0,08 | 19,16 | 10,10 | 0,047% | 10,1% |
    | 0,10 | 19,73 | 10,18 | 0,077% | **16,2%** |

    Giãn dải rộng ra thì lưới vỡ tốt hơn **nhưng người đè nhau trở lại** — hai hệ số khác nhau
    thì chỗ đứng trượt qua nhau. `0,06` lấy gần hết phần lưới vỡ được mà **không mất một phần
    nghìn nào** của `T814`. `0,10` đổi thêm 0,9 giá trị `x` lấy **16,2%**, tức đẩy phép đo về
    đúng vùng chông chênh quanh ngưỡng 20% mà bản giãn 3,5 m đã mắc.
  - ⚠️ **THỨ T815 KHÔNG CHỮA, và phải nói ra:** 22 vectơ dịch chuyển vẫn **song song** — chỉ
    khác độ dài. Đội hình nay **co giãn** theo bóng thay vì **trượt cứng**, nhưng không ai đi
    hướng riêng của mình. Hướng riêng cần **độ trễ phản ứng** hoặc **vai trò**, và cả hai là
    **US-40 của spec 009**. Lưới `y` cũng bão hoà quanh **10 / 22** ở mọi biên độ, vì ba tâm
    cột chỉ có ba giá trị `y` để bắt đầu.
  - ⚠️ **Và dãy `p` KHÔNG mang nghĩa chiến thuật nào.** Ai bám bóng nhiều hơn ai là việc chưa
    ai quyết; đây chỉ là một dãy rải đều, tất định. Một trùng hợp được ghi lại để không ai đọc
    ngược: ô 0 là **thủ môn** và nhận hệ số **thấp nhất** (0,1955), vì `frac(0·φ) = 0` luôn ở
    đáy dải — tôi không thiết kế điều đó.
  - 📍 **Món nợ cơ học gần như không nhúc nhích:** tổng vi phạm vẫn **77** (năm mã
    77/101/57/78/90), AC-38.1(i) 34→33, AC-38.3(ii) 26→25. T815 đổi **chỗ đứng**, không đổi
    **cách bước**. **P2 nguyên vẹn**, 1.841 phép kiểm xanh kể cả vân tay dòng sự kiện.
  - 📌 Task này vẫn chỉ **đóng một nửa**: điều kiện ra của nó nói *"người dùng xem lại rồi
    phán"*, và cổng ấy là **`T760`**.
  - AC: (chất lượng chuyển động — chưa có AC nào mang đúng tên nó)
  - Phụ thuộc: —

- [ ] **T754** [P] — Bốn món nợ văn bản
  - File: `src/engine/vung.ts` (chú thích D23, dòng 4-18), `src/engine/suKien.ts` (dòng 88),
    `src/ui/components/San2D.tsx` (chú thích sàn, quanh dòng 862-881), `src/ui/san2D.test.ts`
    (chú thích ở 855-864)
  - Xong khi: `grep -rn "giữ nguyên 5" src/engine/suKien.ts` → rỗng; chú thích D23 nói rõ
    "vùng vẫn là đơn vị **QUYẾT ĐỊNH**, spec 007 chỉ thêm một lớp toạ độ để **DIỄN**"; chú thích
    sàn ghi **1,46** chứ không **1,71**, và bán kính **2,6** chứ không **3,4**; và ba bất biến
    lớp vẽ ghi rõ **chỉ áp cho chế độ nào**.
  - AC: AC-15.2 (phát biểu lại cho chế độ liên tục), AC-30.5 (giữ lại)
  - Phụ thuộc: T713, T736
  - Ghi chú — **plan gán ba món, thực tế có bốn, và một món thứ năm phải NÊU chứ không sửa:**
    - Món thứ tư: `src/ui/san2D.test.ts:855-864` giữ **cùng** món nợ 1,71/3,4 mà plan chỉ gán
      cho `San2D.tsx`. Nguyên văn hiện tại: "Sàn đo được quanh người giữ bóng là **1,3108 bán
      kính**" và "Vòng đứng ở `1 + 1,2/3,4` = 1,353 bán kính". **Cả hai mệnh đề đều sai hôm
      nay** — bán kính là 2,6 (`San2D.tsx:147`), sàn là 1,46 (`:881`), và phép kiểm ngay dưới
      (`:874`) dùng `1.46`.
    - Món thứ năm, **NÊU, KHÔNG SỬA**: `src/engine/tuongThichEngine.test.ts:54` viết
      `/** Mốc đã chốt của engine **v5** ... */` ngay trên hằng tên `MOC_V6` — cùng loại với
      `suKien.ts:88`. Nhưng `plan.md` mục 7 tuyên file ấy **"0 dòng sửa"**, nên chạm vào nó là
      **mâu thuẫn với một tuyên bố của plan** → báo người dùng, để họ quyết. *(Lưu ý: dòng 20
      của cùng file cũng có chữ "giữ nguyên 5" nhưng ở đó nó **kể lại lịch sử** qua năm spec,
      nên nó **đúng**, không phải nợ.)*

**Xem được gì ngay sau Phase 58:** không có gì mới trên hình, nhưng `npm test` **nói được bằng
số** rằng hai chế độ cho cùng tương quan lực, và plan có một **con số thật** cho ngân sách mùa
giải để người dùng quyết.

---

## Phase 59 — Lớp kiểm cuối của DoD

- [x] **T760** — Người dùng xem **trọn một trận** và phán
  - 🔴 **ĐÃ XEM NGÀY 2026-11-26 — VÀ KHÔNG ĐẠT.** Người dùng xem một trận liên tục ở góc nhìn
    sa bàn và nêu **hai** điều: *"tôi thấy bị đè lên nhau"* và *"di chuyển của cầu thủ quá máy
    móc và dính liền đến nhau"*.
  - 📍 **Cả hai đều đúng, và cả hai đều lọt qua 1.825 phép kiểm.** Đã đo lại thành số và mở
    **`T814`** (đè nhau: 7,4% số cặp, 100% số mốc) và **`T815`** (dính khối: p90 = 0,72).
  - ✅ `T814` **xong cùng ngày**, hai nhịp: bản `3,5 m` (7,27% → 0,073% số cặp) rồi bản
    `6,0 m` sau khi người dùng xem và thấy *"11 cặp khiêu vũ"* — **0,041%** số cặp,
    100% → **8,8%** số mốc, đĩa chạm mép 9,53% → **0,75%**.
  - ✅ `T815` **cũng xong cùng ngày**: lưới ô vuông **9,15 → 18,85** giá trị `x` và
    **5,56 → 9,97** giá trị `y` trên 22 người, mà không mất một phần nghìn nào của `T814`.
  - 📌 **Nên task này nay chỉ chờ ĐÚNG MỘT THỨ: người dùng xem lại và phán.** Hai món nợ nó
    chỉ ra đều đã trả; thứ chưa có là con mắt đã bác chúng lần đầu.
  - ✅ **XEM LẠI NGÀY 2026-11-26 — VÀ ĐẠT.** Người dùng xem lại chính mã trận `88CWDYCZ75`
    ở góc nhìn sa bàn sau `T814` + `T815` và **phán đạt**. Task đóng.
  - 📌 **Đây là một cổng NGƯỜI, và nó đã làm đúng việc của nó.** Hai lỗi người dùng chỉ ra
    lọt qua **1.825** phép kiểm — không phép kiểm nào trong số đó sai, chúng chỉ không ai
    canh hai điều ấy. Bài học ghi lại cho task sau: một bộ phép kiểm xanh **không** thay
    được một lượt xem, và một AC nói về **hành vi** thì không được tích bằng sự tồn tại của
    một **hàm**. Cả `AC-49.6` lẫn `AC-49.7` của spec 011 đã phải gỡ tích đúng vì lỗi ấy.
  - File: — (không chạm file nào; kết quả ghi vào `spec.md` mục 7)
  - Xong khi: người dùng đã xem trọn một trận ở chế độ liên tục, ở **ít nhất ba** mức tốc độ,
    **bật và tắt** giảm chuyển động, và nói ra được **ba câu họ nói ở mục 1 của spec** còn đúng
    hay không.
  - AC: DoD của spec
  - Phụ thuộc: T754
  - Ghi chú: đây là lớp kiểm **duy nhất** bắt được những lỗi mà 1.304 phép kiểm không thấy —
    tiền lệ T518 của spec 005 (bốn lỗi) và T617 của spec 006 (ba lỗi).

- [x] **T761** — Danh sách kiểm bằng mắt cho đúng chỗ `environment: node` không với tới
  - File: — (kết quả ghi vào `spec.md` mục 7)
  - Xong khi: bốn mục đã kiểm bằng mắt và ghi kết quả — nhánh JSX vạch sân; **bốn chỗ nối dây
    `useEffect`** (`src/hooks` có 7 file, **0 test**); nhãn thời tiết **hiện** ở chế độ liên tục
    và **không hiện** ở chế độ phút; nhóm radio chọn chế độ đi được **bằng bàn phím** với lý do
    khoá đọc được (P9).
  - ✅ **XONG 2026-11-26 — 3/4 mục đạt, và lượt kiểm này TÌM RA HAI THỨ.** Kết quả đầy đủ ghi
    ở `spec.md` **mục 7b**, đọc bằng DOM trên bản chạy thật chứ không bằng ảnh chụp.
    - **Mục 1 (nhánh JSX vạch sân) ✅** — cả hai nhánh vẽ. Và phép đo **sửa lại ba con số sai**
      trong chú thích `San2D.tsx:133`: lệch lớn nhất là **19,7%** (cao vòng cấm), không phải
      *"30%"*; vòng tròn giữa thực ra gần đúng (**+1,1%**). Cả cột "thật" lẫn hai con số ước
      của chú thích cũ đều tính bằng một hệ số khác `TI_LE_MET`. Chú thích đã được sửa.
      `x(0 m) = 4,603` — cái răng của **D121** — hiện đúng trên màn hình.
    - **Mục 2 (nối dây `useEffect`) ✅** — nhưng có **NĂM** chỗ chứ không phải bốn như lời task
      viết. Kiểm cả năm, cả năm chạy: banner lưu trữ bền, vòng đồng hồ, lưu trận khi kết thúc,
      đọc bảng màu từ đĩa khi mở, đặt `data-che-do` không tải lại trang.
    - **Mục 3 (nhãn thời tiết) 🔴 KHÔNG ĐẠT** — nó hiện ở **cả hai** chế độ.
      `TrangTran.tsx:416` là `{dieuKien && …}`, không có một điều kiện chế độ nào.
      ⚠️ **Không AC nào phân xử chỗ này**: mệnh đề "không hiện ở chế độ phút" chỉ tồn tại trong
      lời `T761`. Hoặc giao diện sai (thời tiết chỉ ảnh hưởng vật lý bóng, mà vật lý bóng chỉ
      chạy ở chế độ liên tục — câu 11 của nhật ký), hoặc lời task sai (AC-38.9 nói thời tiết là
      của **mọi** trận). **Đã hỏi người dùng, chưa tự sửa.**
    - **Mục 4 (bàn phím + lý do khoá, P9) ✅** — `Down` thật sự chuyển lựa chọn **và** tiêu
      điểm; quân số 7 làm ô `lien-tuc` thành `disabled` kèm một `role="status"` nói rõ vì sao
      bằng chữ. **AC-45.8** đạt phần giao diện.
      📌 Phép thử đầu của tôi bắn một `KeyboardEvent` dựng bằng JavaScript rồi kết luận
      *"không chạy"* — **sai**, sự kiện không đáng tin thì trình duyệt bỏ qua hành vi mặc định.
  - AC: AC-45.1 (phần giao diện), AC-45.8 (phần giao diện), AC-31.4, P9
  - Phụ thuộc: T760

- [ ] **T762** — Đóng spec bằng bảng AC **đạt / chưa đạt / nợ có tên** trên **cả 30 AC**
  - File: `specs/007-continuous-match-engine/spec.md` (mục 7 + Status)
  - Xong khi: cả **30 AC** có một trong ba nhãn; **không** AC nào mà spec đòi test lại được
    tick bằng mắt; mọi món còn nợ có **một tên** và **một spec sở hữu** nó; `Status` đổi thành
    `Done` **chỉ khi** mọi AC đạt.
  - AC: cả 30
  - Phụ thuộc: T761
  - Ghi chú: nhiệm vụ "ghi câu trả lời cho các món treo" đã **xong trước khi code** — tám câu
    được trả lời ngày 2026-11-23, nhật ký ở `spec.md` mục 15.

---

## Bảng phủ AC (30/30)

| AC | Task |
|---|---|
| AC-37.1 toạ độ mét, thời gian giây | T703, T704, T742 |
| AC-37.2 mốc hình học sân | T703, T736 |
| AC-37.3 đổi phần sân ở hiệp 2 | T704, T742 |
| AC-37.4 dày 0,5 giây ở tình huống quan trọng | T706, T730, T731, T742 |
| AC-37.5 mỗi mốc tái lập được một mình | T702, **T717**, T704, T731, T740 |
| AC-37.6 ai đang giữ bóng, hoặc không ai | T704, T714 |
| AC-37.7 mốc 1 giây / 0,5 giây | T704, T706, T731, T732, T742 |
| AC-37.8 định nghĩa bằng loại sự kiện | T730 |
| AC-38.1 ≤ 9 m/s | T710, T715, T742 |
| AC-38.2 gia tốc ≤ 6, giảm tốc ≤ 8 | T711, T715, T742 |
| AC-38.3 đổi hướng > 90° (**cả hai vế**) | T711, T715, T742 |
| AC-38.4 lùi ≤ 4, ngang ≤ 5 m/s | T712, T715, T742 |
| AC-38.5 z theo mét, đánh đầu 1,5–2,8 m | T721, T742 |
| AC-38.6 12–20 / 20–30 m/s, thời gian bay khớp | T706, T720, T742 |
| AC-38.7 ma sát sân khô 1–2 m/s², sân ướt ít hơn | T723, T742 |
| AC-38.8 pha trên 6 m/s vẽ thành đường cong | T703, T735 |
| AC-38.9 thời tiết và gió tất định từ mã trận | T722, T723, T724, T742 |
| AC-38.10 trọng tài + 2 trợ lý, 15–35 m | **T716**, T742 |
| AC-38.11 hướng người 0–360° | T712, T742 |
| AC-45.1 chọn được hai chế độ | T705, T708, T709, T761 |
| AC-45.2 trận cũ mở lại, xem lại, đấu lại y nguyên | T701, và **điều kiện ra của mọi task** chạm `src/engine/` |
| AC-45.3 200 mã, hai chế độ | **T719** (nền: hai bảng thống kê do cùng một đoạn code tính), T750, T751 |
| AC-45.4 bản ghi không lưu vị trí | T701, T705, T708 |
| AC-45.5 xuất tệp đọc được bằng công cụ thường | T740, T741, T743, T744 |
| AC-45.6 mọi phép kiểm cơ học đo trên chính tệp | T741, T742 |
| AC-45.7 mọi tính ngẫu nhiên đến từ mã trận | T702, **T717**, T704, T722 |
| AC-45.8 quân số ≠ 11 thì chế độ liên tục bị khoá | T707, T709, T761 |
| AC-45.9 giảm chuyển động | T714, T734, T737 |
| AC-45.10 "tua" chỉ nghĩa là tua TỚI | T738 |
| AC-45.11 tệp xuất ≤ 11 MB | T744, T745 |

**AC của spec trước phải giữ** (mục 10 của spec): AC-15.2 và AC-30.5 → T713 + T754;
AC-15.6 → T736; AC-28.3 → T714; AC-28.5 → T733; AC-30.4 / AC-30.7 / AC-30.8 → T714 + T736;
AC-31.1 → T734; AC-31.3 → T752; AC-31.4 → T732 + T733 + T761; AC-32.1 → T736;
AC-34.2 → **T713** (nợ của spec 006 được trả ở đây); AC-40.4 → T709.

---

## Chuỗi phụ thuộc và phần chạy song song được

**Chuỗi dài nhất — 11 task, tính lại từ chính các dòng `Phụ thuộc:` ở trên sau khi vá
CRITICAL + HIGH ngày 2026-11-23:**

`T702 → T717 → T704 → T732 → T733 → T734 → T736 → T754 → T760 → T761 → T762`

Chuỗi dài thêm **một** task so với trước khi vá, vì **T717** (`hatGiong.ts`) chen vào giữa
T702 và T704 — T704 cần dải rút mỗi mốc có nhà trước khi nó dựng lưới mốc.

`plan.md` mục 9 khai **cùng** chuỗi này (đã sửa cùng ngày). Không có chu trình nào, và không
task nào phụ thuộc vào một task ở phase sau nó — đã kiểm bằng cách dựng đồ thị từ 47 dòng
`Phụ thuộc:`.

**14 task mang `[P]`:** T700, T702, T703 (Phase 53 — ba file khác nhau); T707, T708
(hai tầng khác nhau, cùng đứng sau T705); T720, T722, T724 (Phase 55); T730, T732, T738
(Phase 56); T743 (Phase 57); T752, T754 (Phase 58).
**T717 và T718 không mang `[P]`.** T717 **phụ thuộc T702**, nên dán `[P]` cho nó là phá đúng
quy ước ở đầu tài liệu ("khác file, **không phụ thuộc nhau**") — nó vẫn chạy chồng được với
T703, nhưng chỉ **sau** T702. T718 thì là **lưới** cho mọi file `lienTuc/`, nên nó phải xong
trước khi Phase 54 bắt đầu đổ file vào đó.

**Phase 54 không có một `[P]` nào, và đó là sự thật chứ không phải sơ suất:** cả **bảy** task ở đó
hoặc chạm `lienTuc/coHoc.ts` hoặc đứng trên nó — kể cả T714, vì nó sửa `coHoc.ts` để kẹp
**đích** thủ môn.

---

## Ghi chú thực thi

- **Không tạo file nào ngoài danh sách trên.** Phát sinh thêm → **dừng**, báo người dùng, cập
  nhật `plan.md`/`tasks.md` trước.
- **Mỗi task xong là một commit, tiêu đề nêu rõ mã task** — `constitution.md` mục 4 ràng
  thẳng ("Mỗi task trong `tasks.md` hoàn thành là một commit, thông điệp commit nêu rõ task
  nào"). ⚠️ Tiền lệ repo **lẫn cả hai**: `T628`, `T627`, `T626`, `T625` là commit riêng từng
  task, nhưng `0119f53` gộp "T615 và T616", và cả spec 006 vào `main` bằng **một** commit gộp
  (`7e1b065`). Nên đây là hiến pháp **sửa lại** tiền lệ, không phải tiền lệ xác nhận hiến pháp.
  Bản đầu của tài liệu này viết "mỗi phase một commit" — với Phase 53 có **mười hai** task chạm
  **năm** tầng thì đó là một commit khổng lồ, và nó mất đúng thứ hiến pháp muốn: khả năng lùi
  về trước **một** task cụ thể. Tiêu đề commit tiếng Việt, kèm
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Ba phép kiểm bất biến của `src/ui/san2D.test.ts`** (không chồng khít trên 10 mã trận; thủ
  môn trong một phần ba sân; tám hàng xen kẽ ở chín tổ hợp độ cao) phải **chạy lại ở MỖI lát**,
  vì chuyển động mạnh hơn là thứ làm vỡ trật tự tám hàng.
- **Số dòng trong tài liệu này đo trên `5c652eb`** và sẽ **trôi ngay sau T701**. Hợp đồng là
  **tên hàm**, không phải số dòng — và bảng số dòng của plan (mục 2.4) được sửa **trong** T701,
  đó là một phần điều kiện xong của nó.
- **Ba món plan tuyên "0 dòng sửa"**: `tuongThichEngine.test.ts`, `taiLap.test.ts`,
  `phatLai.test.ts`. Task nào thấy mình cần sửa một trong ba → **dừng và báo**, đừng sửa.
