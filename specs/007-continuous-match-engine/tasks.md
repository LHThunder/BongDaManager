# Tasks: Engine mô phỏng liên tục — toạ độ mét và cơ học chuyển động

| | |
|---|---|
| **Spec** | `./spec.md` (Status `Planned`, **30 AC**) |
| **Plan** | `./plan.md` (Status `Approved`, D117–D134, R51–R64) |
| **Tiến độ** | 4/47 |
| **Nền đo** | commit `5c652eb`, engine v6, **1.304 test xanh / 63 file test** |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

> **Số task do `plan.md` mục 9 gán.** Bảy lát Phase 53–59, **47 task** T700–T762.
> **Bảy số dùng thêm so với plan**, đều nằm trong khoảng trống plan đã chừa, và mỗi số có một
> lý do viết ra:
> - **T706, T717, T718** lấp **ba lỗ thật** của plan — ba file được plan nhắc nhiều lần ở sơ
>   đồ, ở quyết định và ở bảng Contracts mà **không task nào tạo**: `dienPha.ts`,
>   `hatGiong.ts`, `khongChepModel.test.ts`.
> - **T716** lấp một lỗ **CRITICAL**: `viTriTrongTai`, chủ sở hữu duy nhất của **AC-38.10**.
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
> nhật cùng ngày. Các khoảng trống còn lại: T719, T725–T729, T739, T746–T749, T755–T759.

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

- [ ] **T704** — `lienTuc/moc.ts` + `buocPhutLienTuc` trả lô + `loMoc` stride 8, 26 thực thể
  - File: tạo `src/engine/lienTuc/moc.ts`, `src/engine/lienTuc/moc.test.ts`,
    `src/engine/lienTuc/loMoc.ts`, `src/engine/lienTuc/tranLienTuc.ts`; sửa
    `src/hooks/useMatch.ts` (ref ngoài React giữ lô)
  - Xong khi: **phép kiểm dải rút mỗi mốc** mà `plan.md` mục 7 đòi, đo trên **một trận thật**
    (nó sống ở đây chứ không ở T717, vì T717 chạy **trước** khi có trận): với **mọi** mốc, số
    lần rút tiêu trong mốc ấy `<= RUT_MOI_MOC`. Cộng ba đẳng thức lưới xanh —
    `soBuoc === tongPhutTran(tt) * BUOC_MOI_PHUT`,
    `MOC_MOI_PHUT * 2 === BUOC_MOI_PHUT`, `MOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT === MOC_MOI_PHUT`;
    `npx vitest run src/engine/boundaries.test.ts` xanh **với 0 dòng sửa** ở file đó.
  - AC: AC-37.1, AC-37.5, AC-37.6, AC-37.7, AC-45.7
  - Phụ thuộc: T701, T702, **T717**, T703
  - Ghi chú: `boundaries.test.ts:17` glob `./**/*.ts` là **đệ quy** nên `lienTuc/` tự vào phạm
    vi — đã kiểm bằng số học chứ không tin lời plan: `raNgoaiEngine` tính
    `duongDanFile.split('/').length - 2`, nên từ `./lienTuc/moc.ts` thì `'../tran'` là **trong**
    engine và `'../../domain/types'` là ra ngoài **nhưng được phép**. Vì thế `lienTuc/` phải ở
    **đúng một tầng** — một thư mục con nữa là vỡ. Lô là **đầu ra chỉ-ghi**; trạng thái mô
    phỏng sống trong float64 cục bộ (D119).

- [ ] **T705** — `cheDoMoPhong` vào kiểu + `CauHinhTran`, và **hai đường dựng lại cấu hình**
  - File: `src/engine/tran.ts` (type `CheDoMoPhong` + `CauHinhTran` + `cauHinhDauLai` nhận tham
    số thứ ba), `src/services/phatLai.ts` (`cauHinhTuBanGhi` mang chế độ)
  - Xong khi: `npx vitest run src/engine/tran.test.ts src/services/phatLai.test.ts` xanh **với
    0 dòng sửa ở `phatLai.test.ts`**; và `TrangThaiTran` vẫn **đúng 16 trường** (D119) — chế độ
    **không** vào đó.
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

- [ ] **T706** — `lienTuc/dienPha.ts`: bốn pha con của **D126** lấp 20 giây một pha bóng
  - File: tạo `src/engine/lienTuc/dienPha.ts`, `src/engine/lienTuc/dienPha.test.ts`
  - Xong khi: `dienChuoiRaMoc(kq, boiCanh, rng, lo)` chẻ một pha thành bốn pha con có tên
    (`lenBong` 0–8 giây hấp thụ phần dư → `chuoi` → `ketCuc` → `bongChet`); **tổng thời lượng
    mỗi phút khớp đúng 60 giây** trên 20 mã; và **không** đường chuyền nào dưới sàn 12 m/s của
    AC-38.6.
  - AC: AC-37.4, AC-37.7, AC-38.6
  - Phụ thuộc: T704
  - Ghi chú — **task này không có trong `plan.md` mục 9, và đó là một lỗ của plan.** `dienPha.ts`
    được plan nhắc **ba lần** (sơ đồ mục 3 dòng 187, quyết định **D126**, bảng Contracts
    `dienChuoiRaMoc`) nhưng **không task nào tạo nó**. Nó là cơ chế duy nhất làm bóng và người
    đổi chỗ **giữa** hai mốc quyết định, tức là chính thứ Phase 53 hứa "xem được ngay" — thiếu
    nó thì 20 giây của một pha không có gì lấp. Đã thêm vào plan mục 9 cùng ngày.

- [ ] **T707** [P] — Khoá chế độ liên tục khi quân số ≠ 11
  - File: `src/engine/batDau.ts` (nhánh thứ năm của `LyDoKhongBatDau` + kiểm trong
    `kiemTraBatDauDuoc`), `src/engine/batDau.test.ts`
  - Xong khi: test thuần trên `kiemTraBatDauDuoc` cho **cả 7** giá trị của `CAC_QUAN_SO` — 11
    thì đi được, 5–10 thì trả đúng lý do mới; và `npx vitest run src/engine/batDau.test.ts`
    xanh.
  - AC: AC-45.8
  - Phụ thuộc: T705

- [ ] **T708** [P] — Chế độ vào bản ghi, tệp sao lưu, và hai hàm đọc
  - File: `src/storage/db.ts` (`TomTatTran` + một trường tuỳ chọn),
    `src/services/matchRepo.ts` (`dienMacDinh`, `tomTatCua`, thêm `cheDoCua` +
    `phienBanEngineHienTaiCua`), `src/services/matchRepo.test.ts`,
    `src/services/backupSchema.ts`, `src/services/backupService.test.ts` (+1 ca)
  - Xong khi: `DB_VERSION` vẫn **3** và `SCHEMA_VERSION` vẫn **5**; ca mới chứng minh một trận
    v5 **không có** `cheDoMoPhong`, nhập ở chế độ `'thay-the'`, đọc ra `'co-dien'` (P7); và
    `npx vitest run src/services/` xanh.
  - AC: AC-45.4, AC-45.1
  - Phụ thuộc: T705
  - Ghi chú: `src/storage/migrations.ts:97` `nangV4LenV5` là **chỗ thứ hai** dễ điền mặc định
    nhầm, và chú thích `matchRepo.ts:25-34` nói rõ chỗ điền mặc định chỉ được có **một** —
    task này **không** thêm chỗ thứ hai, nó mở đường rẽ sớm của `dienMacDinh`.

- [ ] **T709** — Nhóm radio chọn chế độ + chuỗi song ngữ + `San2D` đón `anhChup?`
  - File: `src/ui/pages/ChonCapDau.tsx`, `src/ui/ngonNgu/vi.ts`, `src/ui/ngonNgu/en.ts`,
    `src/ui/components/San2D.tsx` (`Props` + `anhChup?`), `src/ui/pages/TrangTran.tsx`,
    `src/hooks/useMatch.ts` (`dungBanGhi` ghi chế độ vào bản ghi)
  - Xong khi: `npx vitest run src/ui/ngonNgu/ngonNgu.test.ts` xanh **với 0 dòng sửa ở file
    ấy**; `npx tsc --noEmit` sạch; và lý do khoá hiện **bằng chữ** theo ngôn ngữ đang chọn
    (tiền lệ `TrangLichSu.tsx:271-292`).
  - AC: AC-45.1, AC-45.8, và P8 + P9
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

- [ ] **T717** — `lienTuc/hatGiong.ts`: ba dòng rút có nhà, và **dải mỗi mốc** có lưới
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

- [ ] **T718** — `lienTuc/khongChepModel.test.ts`: lưới **duy nhất** của R54
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

- [ ] **T710** — `tocDoToiDa` (**không** nhân thể lực)
  - File: tạo `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: `tocDoToiDa` trả trong `[0; 9]` m/s cho mọi chỉ số 1–20, và **không** có đường
    nào đọc thể lực — `grep -n "theLuc" src/engine/lienTuc/coHoc.ts` ra **rỗng**.
  - AC: AC-38.1
  - Phụ thuộc: T703
  - Ghi chú: nếu `tocDoToiDa` nhận `HoSoCauThu` thì nó cần `giaTriChiSo`, mà hàm ấy ở
    `src/engine/sucManh.ts:66` **chưa export**. Đường rẻ hơn: đổi chữ ký thành
    `(chiSoTocDo: number | undefined)` đúng khuôn `heSoTheoChiSo` ở `theLuc.ts:40` — khuôn ấy
    **không kéo theo gì**.

- [ ] **T711** — Kẹp vector gia tốc/giảm tốc + cổng quay ba băng + tích phân Euler
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
  - Phụ thuộc: T710
  - Ghi chú: hằng số mét phải **import từ `hinhHocSan.ts`** (T703). Tự viết lại hằng số sân ở
    đây là sinh nguồn sự thật thứ hai. Và `lienTuc/khongChepModel.test.ts` (**T718** tạo) cấm mọi
    file trong `lienTuc/` **nhắc tên** `chayChuoiBong`, `xacSuatTrungDich`, `xacSuatBiCuu`,
    `xacSuatCoHoiRoRang`, `nguoiTaiVung` — **kể cả trong chú thích**, vì nó quét source thô.

- [ ] **T712** — Trần theo hướng mặt + `huongNguoi` có trần quay
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: chạy lùi `≤ 4` m/s và chạy ngang `≤ 5` m/s trên mọi bộ; `huong ∈ [0, 360)` ở mọi
    mốc; và **một ca chống số giả**: người đứng im **không** được mặc định nhìn về `+x`
    (`atan2(0,0) = 0` làm AC-38.11 thoả bằng một con số giả).
  - AC: AC-38.4, AC-38.11
  - Phụ thuộc: T711

- [ ] **T713** — `tranhNguoi` + `tachChen`, bán kính tránh **2,0 m** (trả AC-34.2 của spec 006)
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: không hai thực thể nào ở khoảng cách < 2,0 m tại bất kỳ mốc nào trong 20 mã;
    `npx vitest run src/ui/san2D.test.ts` xanh **với 0 dòng sửa**.
  - AC: AC-34.2 (nợ của spec 006), và là đầu vào của AC-15.2 ở chế độ liên tục
  - Phụ thuộc: T711
  - Ghi chú — **đây là chỗ hai tầng đụng nhau, đã tính:** 2,0 m ở engine = **1,73 đơn vị**
    khung sân 11, trong khi `san2D.test.ts:874` đòi `≥ 1,46 bán kính` (= **3,80 đơn vị** ở
    `BAN_KINH = 2.6`) và `:1003` đòi sàn **4 đơn vị tuyệt đối**. Hai người tranh chấp cách nhau
    2,0 m **không đạt cả hai ngưỡng**. Plan đã biết và chọn đường "phát biểu lại bất biến theo
    **chữ** của AC-15.2, chỉ cho chế độ liên tục" (R58, và người dùng chốt **giữ 2,6** ngày
    2026-11-23). T713 **để lại một chỗ mốc** cho T754 và **không sửa** hai con số ấy.

- [ ] **T714** — Tách `ui/viTriVe.ts` thành hàm thuần export **trước**, rồi gắn các cổng
  - File: tạo `src/ui/viTriVe.ts`, `src/ui/viTriVe.test.ts`; sửa
    `src/ui/components/San2D.tsx`, `src/engine/lienTuc/coHoc.ts` (kẹp **đích** thủ môn)
  - Xong khi: `viTriVe.ts` export hàm thuần nhận **tham số**, không đọc hook nào; ở tỉ lệ 1 và
    chế độ liên tục, toạ độ trả về **trùng khít** mốc engine phát; và cả bốn file
    `npx vitest run src/ui/san2D.test.ts src/ui/daoDong.test.ts src/ui/phaBong.test.ts src/ui/noiSuy.test.ts`
    xanh.
  - AC: AC-37.6, AC-45.9 (nền), AC-28.3 / AC-30.7 (giữ lại)
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

- [ ] **T715** — Test tính chất trên 100.000 bộ đầu vào đối nghịch
  - File: `src/engine/lienTuc/coHoc.test.ts`
  - Xong khi: `npx vitest run src/engine/lienTuc/coHoc.test.ts` xanh và **không có một `it` nào
    quá 5.000 ms**.
  - AC: AC-38.1, AC-38.2, AC-38.3, AC-38.4
  - Phụ thuộc: T713
  - Ghi chú — **bẫy: `vite.config.ts` KHÔNG đặt `testTimeout`** (đã kiểm: `grep -c` = 0), nên
    vitest dùng mặc định **5.000 ms** mỗi `it`. 100.000 bộ × nhiều tính chất trong **một** `it`
    sẽ đỏ với "test timed out" — một phép kiểm **nói sai lý do**. Chẻ thành nhiều `it`, mỗi
    tính chất một `it`. Bộ sinh phải **tất định** và **không tiêu dòng rút của trận**: dùng một
    bộ sinh riêng **trong chính file test** (file test được `boundaries.test.ts` miễn ở
    `laFileTest`, `:55-57`) — nhưng **không** dùng `Math.random`, vì thế là mất tính tái lập
    của chính phép kiểm (lệnh cấm số 1).

- [ ] **T716** — `viTriTrongTai`: ba điểm trọng tài **có vị trí**, không chỉ có ô (**AC-38.10**)
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

**Xem được gì ngay sau Phase 54:** cầu thủ chạy, tăng tốc và **phanh** trong mức người thật làm
được; không ai nhảy một đoạn; người rê bóng đi **vòng qua** đối thủ; thủ môn **tự** ở lại sân
nhà thay vì bị lớp vẽ kéo về; mỗi điểm có một **hướng nhìn**. Sân sẽ trông **TĨNH hơn** trước
vì lớp dao động đã tắt — **phải báo trước.**

---

## Phase 55 — Bóng có độ cao, và điều kiện trận

- [ ] **T720** [P] — `lienTuc/vatLyBong.ts`: `z`/`vz`, `tocDoDuongBong`, `thoiGianBay = d/v`
  - File: tạo `src/engine/lienTuc/vatLyBong.ts`, `src/engine/lienTuc/vatLyBong.test.ts`
  - Xong khi: chuyền ngắn trong **12–20** m/s, chuyền dài và sút trong **20–30** m/s, và
    `|thoiGianBay − d/v| < 1e-9` trên 1.000 bộ.
  - AC: AC-38.6
  - Phụ thuộc: T704
  - Ghi chú: **không đổi stride** — `plan.md` mục 0 đã đặt `z` và `vz` vào tám ô
    (`x, y, z, vx, vy, vz, huong, coMat`) từ Phase 53, nên T720 không chạm `loMoc.ts`.

- [ ] **T721** — `zKhiToi` cho `tat-canh` rơi trong [1,5; 2,8] và **chính hàm ấy** phát `trang_thai: 'danh_dau'`
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

- [ ] **T722** [P] — `lienTuc/dieuKien.ts`: thời tiết và gió là hàm băm **thuần**, 0 lần rút
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

- [ ] **T723** — Ma sát lăn sệt + gió **chỉ** ăn vào bóng bổng dài
  - File: `src/engine/lienTuc/vatLyBong.ts`, `src/engine/lienTuc/vatLyBong.test.ts`
  - Xong khi: phép kiểm **đơn điệu nghiêm ngặt** trên năm giá trị `MA_SAT_LAN_SET` (nóng 1,85 |
    khô 1,60 | ẩm 1,30 | mưa 0,95 | mưa-to 0,75 — **sân ướt thì bóng đi XA hơn**, chiều người
    dùng chốt 2026-11-23); **và** phép kiểm **chống mã chết**: gió 0 so với 7,75 m/s trên một
    đường **sệt** phải ra vị trí **giống hệt từng số**.
  - AC: AC-38.7, AC-38.9
  - Phụ thuộc: T720, T722
  - Ghi chú: `MA_SAT_LAN_SET` và `HE_SO_GIO` **import từ `dieuKien.ts`**, vì T742 sẽ đọc
    **chính** hai hằng số ấy để đo quãng bóng lăn — đặt sai chỗ là buộc T742 đọc từ hai nguồn.

- [ ] **T724** [P] — Nhãn thời tiết song ngữ nhồi vào khối `TRAN_DAU`, hiện cạnh mã trận
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

**Xem được gì ngay sau Phase 55:** bóng **bay bổng** ở các quả tạt và **có người đánh đầu**;
đường chuyền ngắn trông khác đường chuyền dài; bóng lăn xa hơn khi trời mưa; cạnh mã trận có
một dòng chữ nói thời tiết và gió, bằng ngôn ngữ đang chọn.

---

## Phase 56 — Mốc dày ở tình huống quan trọng, và lớp phát ở cả **năm** mức tốc độ

- [ ] **T730** [P] — `lienTuc/tinhHuong.ts`: `laTinhHuongQuanTrong` đúng bốn toán hạng
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

- [ ] **T731** — Làm dày cả cửa sổ chuỗi lên 0,5 giây; bảng bóng chết ở **đúng một chỗ**
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

- [ ] **T732** [P] — `ui/mocVe.ts`: một phép chia, không nhánh theo tên mức tốc độ
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

- [ ] **T733** — Nới cổng của **đúng MỘT** vòng rAF, đặt lại mốc thời gian theo số lô
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

- [ ] **T734** — Giảm chuyển động (**AC-45.9**), phần **nối dây**
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

- [ ] **T735** — Phép kiểm AC-38.8 ở lớp vẽ, ngưỡng **quy từ** `TOC_QUAY_NHANH`
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

- [ ] **T736** — Vẽ lại vạch sân ở **nhánh liên tục**
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

- [ ] **T737** — Phép kiểm của **AC-45.9**: +1 describe thuần, **sau T734**
  - File: `src/ui/viTriVe.test.ts`
  - Xong khi: với `giamChuyenDong = true`, toạ độ trả về **trùng khít** một mốc đã phát trên
    **100 bộ** đầu vào, và **không bao giờ** là một giá trị nằm giữa hai mốc.
  - AC: AC-45.9
  - Phụ thuộc: T734, T714
  - Ghi chú: để describe này gọi được từ `environment: node`, hàm của `viTriVe.ts` phải nhận
    `giamChuyenDong` làm **tham số** — không đọc hook. Điều kiện "Xong khi" của T737 khác T734:
    **T734 đổi hành vi, T737 chứng minh hành vi.**

- [ ] **T738** [P] — Phép kiểm **phủ định** của **AC-45.10**: không có tua ngược
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

**Xem được gì ngay sau Phase 56:** ở bàn thắng, cơ hội rõ ràng, cứu thua và thẻ đỏ, chuyển động
**dày lên gấp đôi**. Chạy trơn ở **cả năm** mức tốc độ. Người bật giảm chuyển động **vẫn thấy
trận tiến theo giây**. Vòng cấm và khung thành vẽ đúng mét.

---

## Phase 57 — Tệp xuất JSON và bộ đo cơ học chạy trên chính tệp

- [ ] **T740** — `lienTuc/tepXuat.ts`: năm khoá gốc, khối mỏng tuple + hàng tiêu đề
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

- [ ] **T741** — Kênh nhật ký **RIÊNG không cắt** của engine liên tục
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

- [ ] **T742** — `lienTuc/doCoHoc.ts` + bộ test **ngược** + test độc lập thứ tự cột
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

- [ ] **T760** — Người dùng xem **trọn một trận** và phán
  - File: — (không chạm file nào; kết quả ghi vào `spec.md` mục 7)
  - Xong khi: người dùng đã xem trọn một trận ở chế độ liên tục, ở **ít nhất ba** mức tốc độ,
    **bật và tắt** giảm chuyển động, và nói ra được **ba câu họ nói ở mục 1 của spec** còn đúng
    hay không.
  - AC: DoD của spec
  - Phụ thuộc: T754
  - Ghi chú: đây là lớp kiểm **duy nhất** bắt được những lỗi mà 1.304 phép kiểm không thấy —
    tiền lệ T518 của spec 005 (bốn lỗi) và T617 của spec 006 (ba lỗi).

- [ ] **T761** — Danh sách kiểm bằng mắt cho đúng chỗ `environment: node` không với tới
  - File: — (kết quả ghi vào `spec.md` mục 7)
  - Xong khi: bốn mục đã kiểm bằng mắt và ghi kết quả — nhánh JSX vạch sân; **bốn chỗ nối dây
    `useEffect`** (`src/hooks` có 7 file, **0 test**); nhãn thời tiết **hiện** ở chế độ liên tục
    và **không hiện** ở chế độ phút; nhóm radio chọn chế độ đi được **bằng bàn phím** với lý do
    khoá đọc được (P9).
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
| AC-45.3 200 mã, hai chế độ | T750, T751 |
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
