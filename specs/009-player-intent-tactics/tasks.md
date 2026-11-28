# Tasks: Mỗi cầu thủ một mục đích — khối đội hình, thể lực cơ học và quyết định riêng

| | |
|---|---|
| **Spec** | `./spec.md` (Status `Planned`, **36 AC**: 17 ở US-40, 19 ở US-41) |
| **Plan** | `./plan.md` (Status `Draft`, D147–D168, R68–R80) |
| **Tiến độ** | 0/40 |
| **Nền đo** | commit `9c89a7d` · **87 file test / 1.859 phép kiểm xanh** · bộ kiểm chạy **178 giây** · một trận liên tục **110,84 ms** (ca xấu 129,44) · ca xấu tệp xuất **5.332.957 byte / 6.440 hàng mỏng** |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

> **Số task và số phase đi tiếp theo dãy của repo, không theo số spec.** Spec 001→T136,
> 002→T224, 003→T344, 004→T441, 005→T526, 006→T628, 007→T762, 011→T818 (T763–T811 của plan,
> cộng T812–T818 do `/implement` và các lượt xem của người dùng thêm). Nên spec 009 lấy
> **T819–T858** và **Phase 67–73** (spec 011 dừng ở Phase 66).
>
> ⚠️ **Spec 009 đi SAU spec 011 về số nhưng TRƯỚC về số spec, và đó không phải lỗi.** Spec 008
> và 010 đã được dành **số spec** nhưng chưa dành số task; chúng lấy số còn trống lúc được
> viết. Đừng đọc thứ tự số task như thứ tự số spec.

> **40 task, 7 phase, ánh xạ 1-1 với bảy lát cắt của `plan.md` mục 9.**
>
> ⚠️ **`T857` và `T858` KHÔNG nằm ở phase cuối, và đó là cố ý.** `T857` ở **Phase 67** (ngay sau
> T820) và `T858` ở **Phase 68** (ngay sau T829) — cả hai là task `/analyze` ngày **2026-11-28**
> phải thêm (**D171**, **D170**), và chúng phải đi **trước** phần việc chúng gác. Đánh số tiếp
> nối rẻ hơn đánh số lại 38 task, và spec 007 cùng spec 011 (`T812`) đã có đúng tiền lệ này.
> **Đi theo tiêu đề phase, đừng đi theo số.**
>
> **Chuỗi phụ thuộc dài nhất: 27 task** —
> `T825 → T826 → T827 → T828 → T829 → T858 → T831 → T832 → T833 → T835 → T836 → T837 → T838 →
> T839 → T843 → T844 → T845 → T847 → T848 → T849 → T850 → T851 → T852 → T853 → T854 → T855 →
> T856`. Nó dài vì **mỗi lát cắt phải xem được trước khi lát sau bắt đầu** (P6), và vì năm điều
> kiện RA chạy ở cuối mỗi lát. Đó là một lựa chọn, không phải một tai nạn: rút ngắn chuỗi là bỏ
> các chốt kiểm giữa đường.
>
> **Chỉ 5 task chạy song song được:** `T820`, `T822` (Phase 67), `T825` (Phase 68), `T840`,
> `T841` (Phase 70). `T857` và `T858` **không** song song được: mỗi cái dùng chung file với task
> nó phụ thuộc (`doCoHoc.test.ts` với T820; `tranLienTuc.ts` với T829). Ít, vì spec này tập trung vào **ba file mới mà mọi thứ đi qua** —
> `mucDich.ts`, `khoiDoiHinh.ts`, `theLucCoHoc.ts`. Hai cặp từng được đánh `[P]` rồi **bị gỡ**
> khi kiểm bằng máy: T841–T842 cùng chạm `theLucCoHoc.ts`, T845–T846 cùng chạm `hanhDong.ts`.
>
> Không số nào dùng thêm ngoài plan. Nếu `/implement` phát hiện một lỗ thì **dừng và cập nhật
> plan trước**, đúng Ghi chú thực thi ở cuối file.

> ## ⛔ T821 CHẶN mọi task dùng dòng rút 2
> Không task nào của **Phase 68–71** được bắt đầu khi `tranLienTuc.ts` còn dòng
> `const daRut = 0`.
>
> Lý do, và nó là một sự thật đo được chứ không phải một lo xa: `tranLienTuc.ts:896` gán
> `daRut` bằng một **hằng số viết tay**, nên cổng `if (daRut > RUT_MOI_MOC)` ngay dưới nó là
> **mã chết** — `0 > 64` không bao giờ đúng. Và phép kiểm ở `tranLienTuc.test.ts:224`, vốn
> được viết để *"cố ý đỏ khi chuyển động đến"*, thực ra đang khẳng định **chính hằng số ấy**:
> nó **không bao giờ đỏ được**. Nên dải 64 lần rút mỗi mốc hôm nay **không có ai canh**.
>
> Spec 009 là spec đầu tiên rút thật trên dòng 2 (**D147**). Viết một dòng rút trước khi bộ đếm
> tồn tại là viết vào một dải không ai đo — xem **D164** và **R79**.

> ## Điều kiện RA chung của mọi task
> Không task nào được tick nếu thiếu một trong năm điều này:
> 1. **`npx vitest run` xanh, và số phép kiểm KHÔNG GIẢM so với 1.859.**
> 2. **Bảng vân tay 10 mã khớp TỪNG KÝ TỰ** (T819). Đây là lưới duy nhất giữ lời hứa 🔒
>    *"vị trí không quyết định kết cục"*, và nó là thứ phải chạy ở **mọi** phase, không chỉ
>    phase cuối — vì cái nó bắt là một **rò rỉ**, và rò rỉ vào sớm thì sửa rẻ (**R69**).
> 3. **Tỉ lệ `vi phạm / mẫu` của sáu vế nợ cơ học KHÔNG tăng** so với nền mà **T820** đo và
>    ghi trên 10 mã (**R78**, **D169**). ⚠️ **Sáu con số `249+104 / 23+3 / 62+312 / 1 /
>    280+144 / 22` KHÔNG phải nền** — chúng trộn hai cỡ mẫu, nên dùng chúng là dựng một cổng
>    **vừa chết vừa đỏ sai**. `spec.md` mục 8 đã được sửa ngày 2026-11-28.
> 4. **Ba dây bẫy của spec 011 AC-49.6/49.7 còn xanh** — `src/ui/batBienSaBan.test.ts`. Hai AC
>    ấy người dùng đã **xem bằng mắt rồi phán đạt** ngày 2026-11-26, và lề chỉ hơn hai lần
>    (**R80**).
> 5. **`git diff --stat src/engine/tran.ts src/engine/theLuc.ts src/engine/sucManh.ts` rỗng.**
>    Ba file ấy là **đường kết cục**. Một dòng sửa ở đó là một task phải lùi (**D163**).
>
> ⚠️ Bộ kiểm chạy **178 giây** và T820 cộng thêm **≈ 3,3 giây** — đừng chạy nó sau từng dòng
> sửa; chạy nó trước khi tick.

---

## Phase 67 — Lát 0: ba cái thước, không một hành vi nào đổi

> Lát này **không sửa một hành vi nào**. Nó là lát không được bỏ: một thước dựng **sau** khi sửa
> là một thước đo chính thứ mình vừa sửa.

- [ ] **T819** — Bảng vân tay của **chế độ liên tục**: ghim dòng sự kiện và tỉ số của 10 mã `MA_TRAN_CO_DINH`, theo đúng khuôn `MOC_V6`.
  - File: `src/engine/lienTuc/vanTayLienTuc.test.ts` (**mới**)
  - Cách làm: với mỗi mã, `chayHetTranLienTuc` rồi băm dòng sự kiện + tỉ số thành một chuỗi ghim trong một mảng hằng, đúng khuôn `tuongThichEngine.test.ts` đã dùng cho chế độ cổ điển.
  - Xong khi: 10 vân tay ghim trong file; sửa một ký tự của một vân tay làm phép kiểm **đỏ** (ca ngược phải thử bằng tay một lần và ghi kết quả vào chú thích); `npx vitest run src/engine/lienTuc/vanTayLienTuc.test.ts` xanh.
  - ⚠️ Khuôn `MOC_V6` hôm nay **chỉ phủ chế độ cổ điển**, nên câu *"không đổi một ký tự"* hiện **không kiểm được**. Task này là điều kiện để câu ấy có nghĩa.
  - AC: — (hạ tầng cho điều kiện RA số 2 và cho 🔒 ở `spec.md` mục 1)
  - Phụ thuộc: —

- [ ] **T820** [P] — **Đo và ghi nền nợ cơ học bằng TỈ LỆ** — `vi phạm / mẫu` của từng vế, trên **đủ 10 mã**.
  - File: `src/engine/lienTuc/doCoHoc.test.ts`
  - Cách làm: mở rộng phép kiểm hiện có từ 2 mã lên 10 mã cho sáu vế AC-38.1, 38.2, 38.3, 38.4, 38.6, 38.11. `doCoHoc` **đã** trả `soMau` theo từng vế, nên tỉ lệ tính được **không cần hạ tầng mới**.
  - Xong khi: với **từng** vế, chú thích ghi **cả tử số và mẫu số** cộng tỉ lệ; phép kiểm đòi tỉ lệ **không tăng**; `it` khai `timeout` riêng (mặc định vitest là 5.000 ms, repo **không** đặt `testTimeout`); thời gian thêm ghi vào chú thích.
  - ⚠️ **KHÔNG dùng sáu con số `249+104 / 23+3 / 62+312 / 1 / 280+144 / 22` làm nền** (**D169**). Chúng trộn hai cỡ mẫu: năm con số từ bảng nợ **T742** của spec 007 (`specs/007/spec.md:611`), và `280+144` của AC-38.6 đo trên **MỘT** mã, từ `T816`. Bằng chứng: `soMau['AC-38.10(c)']` là **11.958** một mã so với **120.660** ở T742 ⇒ T742 đo ~10 mã; còn `280+144 = 424` đúng là **424 trong 450** vi phạm của một mã. Dùng chúng thì AC-38.1 thành **cổng chết** (đo được 8+1 một mã, ngưỡng 249 cho nợ tăng gấp ba vẫn xanh) và AC-38.6 thành **cổng đỏ sai** (10 mã ra ~2.800+1.440).
  - 📌 Repo đã **từ chối** giá 3 giây này một lần (`doCoHoc.test.ts:393`, 5 mã). Lần này trả, vì `spec.md` mục 8 ghim nó thành **điều kiện ra** (**R78**).
  - AC: — (hạ tầng cho điều kiện RA số 3)
  - Phụ thuộc: —

- [ ] **T857** — ❗ Ghim lại **mọi con số tuyệt đối** của `doCoHoc.test.ts`, và phân loại chúng.
  - File: `src/engine/lienTuc/doCoHoc.test.ts`
  - Cách làm: liệt **toàn bộ** `toBe` ghim số đo trên một trận thật (`:129`, `:130`, `:248`, `:335`, `:374`-`:377`…), rồi chia hai loại: vế là **ngưỡng nợ** → `toBeLessThanOrEqual` trên **tỉ lệ** của T820; vế là **số mẫu** → ghim lại con số mới **kèm lý do vì sao nó đổi**.
  - Xong khi: không `toBe` nào còn ghim một **số đếm vi phạm** tuyệt đối; mỗi con số mẫu được ghim lại có một dòng lý do; `npx vitest run src/engine/lienTuc/doCoHoc.test.ts` xanh.
  - ⚠️ **Vì sao nó là một task riêng và đi TRƯỚC mọi lát sửa hành vi (D171):** **D165** đổi hai bảng tỉ lệ, **D152** đổi đích của 22 người, `T838` hạ trần tốc độ — cả ba dời vị trí **từng mốc**, nên các `toBe` ấy đỏ. Rải việc ghim lại ra bảy lát thì **không lát nào** biết con số cuối là gì, và người đọc sau không phân biệt được *"ghim lại vì mô hình đổi"* với *"ghim lại vì nợ xấu đi"*.
  - AC: — (hạ tầng cho điều kiện RA số 3)
  - Phụ thuộc: T820

- [ ] **T821** — ❗ **TASK CHẶN** — thay `const daRut = 0` bằng một bộ đếm lần rút **thật**, rồi đo và báo số.
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/tranLienTuc.test.ts`
  - Cách làm: bọc `Rng` của dòng cơ học bằng một bộ đếm; `rutMoiMoc` nhận số **đo được**, không nhận hằng số. Sửa `tranLienTuc.test.ts:224` từ `toBe(0)` sang một trần đo được.
  - Xong khi: `grep -c 'const daRut = 0' src/engine/lienTuc/tranLienTuc.ts` = **0**; phép kiểm báo số lần rút **lớn nhất một mốc** trên 10 mã và so với `RUT_MOI_MOC = 64`; con số ấy ghi vào chú thích.
  - ⚠️ Nếu con số đo được **vượt 64**: nới `RUT_MOI_MOC` lên **256** (`11.508 × 256 ≪ 2^30`) **trước** khi một mốc nào được ghi, và ghi rõ rằng việc nới đổi `hatGiongMoc` của mọi mốc `k > 0` — nhưng **chỉ trên dòng 2**, nên nó đổi **vị trí** chứ không đổi **tỉ số**.
  - AC: — (hạ tầng cho **D147**, **D164**, **R79**)
  - Phụ thuộc: —

- [ ] **T822** [P] — Khung bộ đo `doMucDich.ts`, theo khuôn `doCoHoc.ts` nhưng **tách khỏi nó**.
  - File: `src/engine/lienTuc/doMucDich.ts` (**mới**), `src/engine/lienTuc/doMucDich.test.ts` (**mới**)
  - Cách làm: dùng lại ba khuôn của `doCoHoc.ts`: `CAC_VE` / `VE_CHUA_CO_MAU` (một vế 0 mẫu **phải** được khai kèm lý do), khuôn mệnh đề mức-trận của AC-38.9 (`o = 'TRAN'`, `giay = 0`), và `bangCot` tra cột **bằng tên** từ hàng tiêu đề.
  - Xong khi: `doMucDich(tep)` trả `{ viPham, soMau }`; có **ít nhất một** vế chạy được và một ca ngược; mỗi vế có `it` **⚠️ CHỐNG RỖNG** riêng (quy ước 37 lần trong 15 file).
  - 📌 Tách khỏi `doCoHoc.ts` vì file ấy **749 dòng**, xuất **đúng một** hàm đo và **không có registry vế** — nhồi 20 vế mới vào đó là làm cả hai bộ đo không đọc được (**D159**).
  - AC: — (hạ tầng cho 36 AC)
  - Phụ thuộc: —

- [ ] **T823** — Đo **bốn con số nền của US-40** mà `spec.md` không có, cộng nền AC-41.6 sau khi `D168` chốt mẫu số.
  - File: `src/engine/lienTuc/doMucDich.test.ts`, `specs/009-player-intent-tactics/plan.md`
  - Cách làm: đo AC-40.1, 40.2, 40.3, 40.5 và AC-41.6 trên 10 mã **hiện tại**, rồi ghi năm con số vào `plan.md` mục 9 — đúng như spec đã làm cho AC-41.3/41.4/41.6/41.7.
  - Xong khi: bảng dự báo ở `plan.md` mục 9 có thêm một cột **"đo được"**; nếu AC-40.2 và AC-40.3 **đạt sẵn** thì mục 6 ghi đúng điều đó và phép kiểm của chúng ở lại làm **dây bẫy chống hồi quy**.
  - ⚠️ **Hai AC đạt sẵn thì phải nói ra, không được nhận công.** Và **D165** thay chính cái hằng số đang làm AC-40.2 đạt, nên nó rất có thể làm AC ấy đỏ ở Phase 69.
  - AC: AC-40.1, AC-40.2, AC-40.3, AC-40.5, AC-41.6 *(đo nền, chưa đạt)*
  - Phụ thuộc: T822

---

## Phase 68 — Lát 1: mục đích, và 22 người đi bốn hướng khác nhau

> Lát **đổi nhiều nhất**, và trả **năm AC nặng nhất**. Hết lát này người dùng mở trận là thấy
> ngay — hoặc thấy ngay là chưa được, nên **T831 cho người dùng xem** chứ không đợi Phase 73.

- [ ] **T824** — `mucDich.ts`: hai danh mục đóng thành hai union, cộng `maMucDich`.
  - File: `src/engine/lienTuc/mucDich.ts` (**mới**), `src/engine/lienTuc/mucDich.test.ts` (**mới**)
  - Cách làm: `MucDich` = `'giu-vi-tri' | 'chay-cho-sau-lung' | 'kem-nguoi' | 'lui-ve-giu-khoi' | 'giu-khung' | 'bo-tro-hang-thu'`; `maMucDich: Record<MucDich, number>` nên **thiếu một mục là lỗi biên dịch**.
  - Xong khi: `npx tsc --noEmit` xanh; phép kiểm khẳng định sáu mã **đôi một khác nhau** và nằm trong `0..5`; xoá một dòng của `maMucDich` làm `tsc` **đỏ** (thử bằng tay một lần, ghi vào chú thích).
  - AC: AC-41.1 *(một phần — danh mục)*
  - Phụ thuộc: —

- [ ] **T825** [P] — `hangThuCuoiNgoaiThuMon` dùng chung, thay **hai bản chép tay** đang có.
  - File: `src/engine/lienTuc/coHoc.ts`, `src/engine/lienTuc/coHoc.test.ts`, `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/doCoHoc.ts`
  - Cách làm: xuất một hàm thuần; `tranLienTuc.ts:455` (`hangThuCuoiCua`, `function` nội bộ **không xuất**) và `doCoHoc.ts:627-640` (viết **thẳng trong thân vòng lặp**) cùng gọi nó.
  - Xong khi: `grep -c 'function hangThuCuoiCua' src/engine/lienTuc/tranLienTuc.ts` = **0**; ba nơi gọi **một** hàm; có ca ngược cho đội dưới 2 người ngoài thủ môn; `doCoHoc.test.ts` vẫn cho **đúng** sáu con số nợ của T820.
  - 📌 AC-41.7 là **con số đầu bài của cả spec** (99,6%), nên định nghĩa *"người cuối ngoài thủ môn"* phải sống ở **một** chỗ. Hai bản chép tay là hai chỗ để trôi khỏi nhau — và khi trôi thì AC-41.7 **báo đạt ở bộ đo mà sai trên sân**.
  - AC: AC-41.7 *(một phần — định nghĩa)*
  - Phụ thuộc: —

- [ ] **T826** — `dichTheoMucDich` cho bốn mục đích sân, cộng `kepSauHangThu`.
  - File: `src/engine/lienTuc/mucDich.ts`, `src/engine/lienTuc/mucDich.test.ts`
  - Cách làm: mỗi mục đích cho **một đích khác hướng**; `chay-cho-sau-lung` bị `kepSauHangThu` kẹp về phía sân mình so với người cuối ngoài thủ môn của đối phương — đây là chỗ **nhận thức chéo hai đội** vào engine lần đầu.
  - Xong khi: phép kiểm cho **bốn** mục đích ở cùng bối cảnh ra **bốn** đích khác nhau; `chay-cho-sau-lung` **không bao giờ** cho toạ độ dọc vượt `hangThuCuoiNgoaiThuMon`; mọi đích nằm `trongSan`.
  - AC: AC-41.4, AC-41.6, AC-41.7
  - Phụ thuộc: T824, T825

- [ ] **T827** — `phanMucDich`: phép **phân công cấp đội**, tất định, **không tiêu một lần rút nào**.
  - File: `src/engine/lienTuc/mucDich.ts`, `src/engine/lienTuc/mucDich.test.ts`
  - Cách làm: nhận cả đội, trả 11 mục đích. Xếp theo **chỉ số ô đội hình** (0..10) nên hàm tất định, đúng khuôn `choDungDoiHinhMet` đã làm. Bảo đảm theo cấu trúc: đối phương cầm bóng ⇒ người gần nhất nhận `kem-nguoi` nhắm người cầm bóng.
  - Xong khi: gọi hai lần cùng đầu vào cho **đúng từng phần tử** (**R73**); phép kiểm khẳng định **không hai người cùng kèm một đối thủ** và **chỉ một người** nhắm một khoảng trống; ném khi đội hình khác 11 ô.
  - 📌 Phân công **cấp đội**, không phải 11 lựa chọn độc lập: ba AC và hai trường hợp biên đòi một tính chất của **tập hợp** (**D152**). *"Mỗi cầu thủ có suy nghĩ riêng"* vẫn đúng — thứ ở cấp đội là **việc chia vai**.
  - AC: AC-41.1, AC-41.3, AC-41.14, AC-41.15
  - Phụ thuộc: T826

- [ ] **T828** — Mở rộng `TrangThaiLienTuc` với trạng thái người, mang qua biên phút; cổng 0,5 giây của AC-41.19.
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/tranLienTuc.test.ts`
  - Cách làm: thêm `nguoi: readonly TrangThaiNguoiLienTuc[]` (mục đích, `mocChonMucDich`, `oDangKem`, `theLucCoHoc`, `quangDuong`, `chanThuong`), mang sang phút sau đúng như `coHoc`. `phanMucDich` chỉ chạy khi `chiSoMoc − mocChonTruoc >= 1`.
  - Xong khi: cùng mã trận + cùng chuỗi can thiệp cho **đúng từng khung hình** (AC-41.20); phép kiểm khẳng định mục đích **không đổi** giữa hai lần chọn.
  - ⚠️ **AC-41.19 mua ĐÚNG 0,00 ms** (**D153**) — thực thi nó vì AC đòi, **không** tính nó là một khoản tiết kiệm. Chỗ gọi là **6.440** lần một trận so với trần **11.880** của AC: **54,2%**.
  - AC: AC-41.19, AC-41.20
  - Phụ thuộc: T821, T827

- [ ] **T829** — Cắm `phanMucDich` + `dichTheoMucDich` vào vòng mốc, **thay** đường cũ và **gỡ** ba ký hiệu của nó.
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/viTriMet.ts`, `src/engine/lienTuc/viTriMet.test.ts`
  - Cách làm: thay `dichNguoiKhongBong(choDung[o], dBong, phanDichCuaO(o))`; gỡ `PHAN_DICH_THEO_BONG`, `phanDichCuaO`, `BIEN_DO_PHAN_DICH`, `dichNguoiKhongBong` cùng phép kiểm của chúng. **Giữ** `tamVungMet` — `nhatKy.ts` đọc nó.
  - Xong khi: `grep -c 'phanDichCuaO' src/engine/lienTuc/` = **0**; `grep -c 'tamVungMet' src/engine/lienTuc/nhatKy.ts` ≥ **1**; `npx tsc --noEmit` xanh; bảng vân tay T819 **khớp từng ký tự**.
  - 📌 `viTriMet.ts` đã **ghi trước** điều này: *"khi ấy hàm này bị **thay**, không phải cộng thêm"*.
  - 📌 **Vì sao phụ thuộc T857:** đây là task **đầu tiên dời vị trí**, nên các con số tuyệt đối của `doCoHoc.test.ts` phải được ghim lại **trước** (**D171**).
  - AC: AC-41.5
  - Phụ thuộc: T828, T857

- [ ] **T858** — ❗ **Dựng AC-41.9: trong một đoạn dẫn, quả bóng ĐI THEO NGƯỜI.**
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/tranLienTuc.test.ts`
  - Cách làm: với đoạn `loai === 're-bong'`, vị trí bóng **dẫn xuất từ vị trí người dẫn** (lệch nhiều nhất `TAM_CHAM_BONG`) thay vì nội suy theo đoạn; **đích của người dẫn** là điểm đến của đoạn. Người dẫn vì thế **không** còn rơi về `dichNguoiKhongBong`.
  - Xong khi: khoảng cách người dẫn ↔ bóng **< 2 m ở MỌI mốc** của mọi pha dẫn trên 10 mã; một ca ngược (buộc bóng rời người) làm phép kiểm đỏ; `nguoi_giu` của mốc **nêu tên người dẫn** trong pha dẫn, không phải `-1`.
  - 🐞 **Bản trước của bảng phủ AC ghi *"đã đúng từ T816"* — SAI theo cấu trúc.** `cacDiemCuaPha` (`tranLienTuc.ts:288`) quy **mọi** hành động thành một điểm vùng, kể cả `'re-bong'`, nên một đoạn dẫn có `quang > 0` ⇒ `dangBay = true` ⇒ `giuThucSu = KHONG_AI_GIU` ⇒ người dẫn **đi về chỗ đứng sơ đồ trong khi quả bóng đi**. Xem **D170**.
  - ⚠️ **Hai cái giá phải ĐO, không đoán:** (1) tốc độ bóng trong pha dẫn nay bị kẹp bởi trần tốc độ **của người** (6,4–8,6 m/s), nên nó **có thể** chạm vế dải tốc độ của **AC-38.6** — kiểm vế ấy có lọc theo loại hành động không, và **báo số**; (2) `dangBay` còn nuôi neo trọng tài và `duongChuyen` của AC-38.10(b), nên cả hai đổi nghĩa cho pha dẫn — theo chiều **đúng hơn**, nhưng phải chạy lại `doCoHoc` và báo số.
  - AC: AC-41.9
  - Phụ thuộc: T829

- [ ] **T830** — Vế đo cho năm AC nặng nhất của lát này.
  - File: `src/engine/lienTuc/doMucDich.ts`, `src/engine/lienTuc/doMucDich.test.ts`
  - Cách làm: thêm vế cho AC-41.1 (mỗi người đúng một mục đích), AC-41.3 (≥ 3 mục đích ở ≥ 80% mốc), AC-41.4 (≥ 2 nhóm hướng cách > 90° ở ≥ 70% cặp mốc, lọc vectơ > 0,2 m), AC-41.6 (đứng im < 10%, mẫu số theo **D168**), AC-41.7 (việt vị < 20%), AC-41.14 (≥ 1 người kèm ở ≥ 90% mốc), AC-41.15 (khoảng cách **đơn điệu giảm**).
  - Xong khi: sáu vế xanh trên 10 mã; mỗi vế có `it` **⚠️ CHỐNG RỖNG** và một ca ngược; con số đo được ghi vào chú thích cạnh con số nền của spec (**1 → ?** cho AC-41.3, **0% → ?** cho AC-41.4, **99,6% → ?** cho AC-41.7).
  - ⚠️ AC-41.15 đo **tính đơn điệu**, **không** đo việc xuống dưới 2 m: `tachChen` đẩy mọi cặp về ≥ 2,0 m, và nhánh dưới 2 m **không được nhắm tới** (**D154**).
  - AC: AC-41.1, AC-41.3, AC-41.4, AC-41.6, AC-41.7, AC-41.14, AC-41.15
  - Phụ thuộc: T829

- [ ] **T831** — Chạy cả năm điều kiện RA, **báo số**, rồi **cho người dùng xem một trận**.
  - File: — (chạy và báo; không sửa file sản phẩm)
  - Xong khi: bộ kiểm xanh · vân tay 10 mã khớp từng ký tự · sáu con số nợ 007 **không tăng** · ba dây bẫy `batBienSaBan.test.ts` xanh · `git diff --stat` của ba file đường kết cục **rỗng**; và người dùng xem một trận rồi nói nó **khác** hay **chưa khác**.
  - 📌 Cho xem **ngay cuối lát 1**, không đợi Phase 73: **R77** là rủi ro không giảm được bằng máy, và tiền lệ đã có hai lần — *"11 cặp khiêu vũ"* (T814) và *"giật cục"* (T817) đều **xanh hết phép kiểm**.
  - AC: AC-41.5, AC-41.20
  - Phụ thuộc: T830, T858

---

## Phase 69 — Lát 2: khối có hình dạng và phản ứng mất bóng

- [ ] **T832** — `khoiDoiHinh.ts`: `hinhKhoi` đọc trạng thái, **thay cả hai bảng tỉ lệ** của `viTriMet.ts`.
  - File: `src/engine/lienTuc/khoiDoiHinh.ts` (**mới**), `src/engine/lienTuc/khoiDoiHinh.test.ts` (**mới**), `src/engine/lienTuc/viTriMet.ts`
  - Cách làm: trả `{ tamDoc, tamNgang, daiDoc, daiNgang }` — bốn đại lượng là **hàm của** bóng, quyền sở hữu, phút, hiệu số. Sửa `TI_LE_DAI_MET` và `TI_LE_COT_MET`; thay `choDungDoiHinhMet`.
  - Xong khi: dải dọc trong **30–40 m** và dải ngang trong **35–45 m** ở ≥ 70% mốc thoả điều kiện; tâm ngang là hàm **đơn điệu tăng** của `bong.y`.
  - ⚠️ **Đây là phép tính vì sao chỉ thay `phanDichCuaO` là không đủ** (**D165**): `TI_LE_DAI_MET × 105` cho tâm dải 10,5 / 36,75 / 68,25 / 94,5; trừ `LUI_VE_SAN_MINH = 6` còn 4,5 / 30,75 / 62,25 / 88,5, nên một 4-4-2 trải **57,75 m** — **vượt trần AC-40.1 44%**. Bề ngang `(0,78 − 0,22) × 68 =` **38,08 m** là một **hằng số**, nên AC-40.5 có hiệu đúng **0**.
  - ⚠️ `LUI_VE_SAN_MINH = 6` là con số **người dùng chốt bằng mắt** ngày 2026-11-26. Nếu mô hình mới làm nó vô nghĩa thì **nói ra và xin lại**, không gỡ lặng lẽ.
  - AC: AC-40.1, AC-40.2, AC-40.3
  - Phụ thuộc: T831

- [ ] **T833** — `phanUngMatBong`: cửa sổ 3–5 giây sau khi mất bóng, **rút từ dòng 2**.
  - File: `src/engine/lienTuc/khoiDoiHinh.ts`, `src/engine/lienTuc/khoiDoiHinh.test.ts`
  - Cách làm: cửa sổ mở ở **biên chuỗi** (nơi v6 trả `mat-bong`); chọn `'ep-lai'` hoặc `'lui-ve'` từ `hatGiongMoc`. `'ep-lai'` ⇒ ≥ 2 người giảm khoảng cách tới người cầm bóng mới; `'lui-ve'` ⇒ tâm dọc khối lùi.
  - Xong khi: cả **hai** nhánh xuất hiện trên 10 mã (phép kiểm **chống rỗng**); việc đã chọn **đọc được** trong dữ liệu trận qua **chính cột mục đích** — **không thêm một cột nào**; số lần rút mỗi mốc vẫn dưới trần T821.
  - AC: AC-40.4
  - Phụ thuộc: T832

- [ ] **T834** — Giãn khi có bóng, và lùi khối khi đang dẫn ở 15 phút cuối.
  - File: `src/engine/lienTuc/khoiDoiHinh.ts`, `src/engine/lienTuc/khoiDoiHinh.test.ts`
  - Cách làm: `hinhKhoi` nhận `coBong: boolean` — dải ngang khi có bóng = dải khi không có bóng **+ `GIAN_KHI_CO_BONG`** (≥ 5 m, một hằng ở **một** chỗ). Nhận `phut` và `hieuSoBanThang` — 15 phút cuối + đang dẫn ⇒ tâm dọc lùi ≥ `LUI_KHI_DAN = 3` m.
  - Xong khi: AC-40.5 đo đạt (chênh ≥ 5 m, trung bình cả trận); AC-40.16 đo đạt (chênh ≥ 3 m giữa hai cửa sổ 15 phút liền nhau).
  - ⚠️ *"15 phút cuối"* bắt đầu ở `tongPhutTran − 15`, tức phút **79–84** — **không phải 75**. Không trận nào dài 90 phút (đo 10 mã: **94–99**) — xem **D167**.
  - AC: AC-40.5, AC-40.16
  - Phụ thuộc: T832

- [ ] **T835** — Vế đo cho sáu AC khối.
  - File: `src/engine/lienTuc/doMucDich.ts`, `src/engine/lienTuc/doMucDich.test.ts`
  - Xong khi: sáu vế xanh trên 10 mã, mỗi vế có `it` **⚠️ CHỐNG RỖNG** và một ca ngược; **AC-40.1 và AC-40.5 chuyển từ ❌ sang ✅** so với bảng nền của T823, và hai con số ấy ghi vào chú thích.
  - ⚠️ **AC-40.2 và AC-40.3 đạt sẵn trước spec này** (T823). Phép kiểm của chúng ở lại làm **dây bẫy chống hồi quy** — vì T832 thay chính cái hằng số đang làm AC-40.2 đạt.
  - AC: AC-40.1, AC-40.2, AC-40.3, AC-40.4, AC-40.5, AC-40.16
  - Phụ thuộc: T833, T834

- [ ] **T836** — Chạy năm điều kiện RA và báo số.
  - File: —
  - Xong khi: như T831, năm điều kiện đủ.
  - AC: —
  - Phụ thuộc: T835

---

## Phase 70 — Lát 3: thể lực cơ học và trần tốc độ theo chỉ số

> Lát này là **lần đầu chỉ số tốc độ do người dùng nhập ảnh hưởng tới chuyển động** ở chế độ
> liên tục — tức lần đầu giá trị cốt lõi ở hiến pháp mục 1 (*"kết quả phản ánh chiến thuật và
> chỉ số do người dùng nhập"*) đúng ở **tầng vị trí**.

- [ ] **T837** — `theLucCoHoc.ts`: thể lực cơ học, hệ số tốc độ, sàn tốc độ.
  - File: `src/engine/lienTuc/theLucCoHoc.ts` (**mới**), `src/engine/lienTuc/theLucCoHoc.test.ts` (**mới**)
  - Cách làm: `THE_LUC_CO_HOC_DAY = 100` (dùng lại đúng con số `THE_LUC_DAY` của v6); `theLucSauMotMoc(theLuc, quangDuongMoc, thoiTiet)` chỉ **trừ**; `heSoTocDoTheoTheLuc` **liên tục** (dốc tuyến tính quanh ngưỡng 60), kẹp dưới sao cho trần ≥ `SAN_TOC_DO = 4`.
  - Xong khi: phép kiểm quét mọi mốc của 10 mã, **không mốc nào** thể lực tăng (AC-40.7); mốc đầu trận bằng 100 (AC-40.6); thể lực < 60 ⇒ hệ số **0,9** (AC-40.8); trần **không bao giờ** dưới 4 m/s và **không bao giờ** âm hay 0 (AC-40.13).
  - 📌 `SAN_TOC_DO = 4` lấy neo từ `TOC_DO_LUI_TOI_DA = 4` của spec 007 — **một con số, một chỗ**. ⚠️ **Cường độ ở đây là một đại lượng TỨC THỜI dẫn xuất** (tốc độ mốc này chia trần của chính người ấy): **không** có bậc cường độ, **không** có phân bổ phần trăm — đó là tài sản của **spec 010**.
  - AC: AC-40.6, AC-40.7, AC-40.8, AC-40.9, AC-40.13
  - Phụ thuộc: T836

- [ ] **T838** — Cắm `tocDoToiDa(chiSoTocDo) × heSoTocDoTheoTheLuc` vào `buocCoHoc` — **lần đầu `tocDoToiDa` được mã sản phẩm gọi**.
  - File: `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/tranLienTuc.test.ts`
  - Cách làm: thay `TRAN_TOC_DO_TUYET_DOI` (9, dùng chung cho **mọi** người) bằng trần theo chỉ số **nhân** hệ số thể lực. **Không đổi một công thức nào** trong `coHoc.ts`.
  - Xong khi: `grep -rn 'tocDoToiDa' src --include=*.ts | grep -v '\.test\.'` cho **≥ 2** dòng (định nghĩa cộng nơi gọi); hai cầu thủ chỉ số tốc độ khác nhau **đi khác quãng** trên cùng mã trận; `max|Δtrần|` giữa hai mốc liên tiếp ≤ **1 m/s** (AC-40.9).
  - 📌 `tocDoToiDa` có từ spec 007, có test riêng, và **chưa một dòng mã sản phẩm nào gọi** — đúng khuôn `kepDichThuMon` trước T813. ✅ **AC-40.9 đạt theo cấu trúc**: bậc lớn nhất AC-40.8 sinh được là `8,6 × 0,10 =` **0,86 m/s**, dưới trần 1 m/s. Phép kiểm ở lại làm dây bẫy.
  - AC: AC-40.8, AC-40.9
  - Phụ thuộc: T837

- [ ] **T839** — `quangDuongCongDon`, và dải 9–12 km / 5–6 km.
  - File: `src/engine/lienTuc/theLucCoHoc.ts`, `src/engine/lienTuc/tranLienTuc.ts`, `src/engine/lienTuc/doMucDich.ts`
  - Cách làm: tích quãng đường theo mốc vào `TrangThaiLienTuc.nguoi`; nuôi `theLucSauMotMoc`.
  - Xong khi: quãng đường của mỗi người đá trọn trận trong **9–12 km** và của thủ môn trong **5–6 km**, đo trên 10 mã.
  - ⚠️ Đo trên **trận đủ độ dài** (`tongPhutTran`, thực tế 94–99 phút), **không** trên *"đúng 90 phút"* — tập ấy **rỗng** (**D167**). 📌 Đây là bài **hiệu chỉnh**, không phải bài cấu trúc: 10 km trên 90 phút là trung bình **1,85 m/s**. Nếu dải không ra thì **hỏi người dùng** (**R70**) — và nhớ rằng AC-40.10 tự mang một ⏳ nói dải ấy là **hàm của** phân bổ cường độ mà spec 010 sở hữu.
  - AC: AC-40.10, AC-40.11
  - Phụ thuộc: T838

- [ ] **T840** [P] — `chonViTriThuMon`: khả năng chọn vị trí **suy từ ba chỉ số thủ môn thật sự có**.
  - File: `src/engine/lienTuc/mucDich.ts`, `src/engine/lienTuc/mucDich.test.ts`
  - Cách làm: công thức ở `plan.md` mục 4.5 — `0,45 · phan-xa + 0,35 · bat-bong + 0,20 · quyet-doan`, chuẩn hoá từ dải **1..20** đúng khuôn `sucManh.ts:86`. Đích của `giu-khung` nội suy giữa tâm vạch vôi và điểm chắn góc sút; đi tiếp qua `kepDichThuMon`.
  - Xong khi: hai thủ môn chỉ số khác nhau, cùng tình huống ⇒ **hai điểm khác nhau**; **không thêm một ô nhập nào** (`git diff --stat src/domain` rỗng); AC-30.7 của spec 005 còn đúng ở ngưỡng hiện hành.
  - ⚠️ **KHÔNG dùng `doc-tinh-huong` như ví dụ của AC nêu**: thủ môn **không điền** chỉ số ấy (`attributes.ts:42-51`), nên nó rơi về giá trị lui và làm **mọi thủ môn giống nhau** — tức AC-40.17 tự đỏ (**D156**).
  - AC: AC-40.17
  - Phụ thuộc: T837

- [ ] **T841** [P] — `chanThuongTaiMoc`: chấn thương là một trạng thái **cơ học**, **không** rời sân, **không** sinh sự kiện.
  - File: `src/engine/lienTuc/theLucCoHoc.ts`, `src/engine/lienTuc/theLucCoHoc.test.ts`, `src/engine/lienTuc/tranLienTuc.ts`
  - Cách làm: rút từ **dòng 2**; xác suất đặt sao cho trung bình **0–1** mỗi trận. Người bị chấn thương **vẫn nằm trong `trenSan`** của v6; chỉ `theLucCoHoc` sụt mạnh.
  - Xong khi: trung bình trên ≥ 20 mã trong **0–1** (AC-40.14); hồ sơ cầu thủ **không đổi một trường nào** trước/sau trận, so **từng trường** (AC-40.15); `grep -c "'chan-thuong'" src/engine/suKien.ts` = **0**; bảng vân tay T819 khớp từng ký tự.
  - ⚠️ **Cái giá, nói thẳng:** đây là chấn thương **không ai được nghỉ** — người bị chấn thương đi khập khiễng tới hết trận trừ khi người dùng tự thay anh ta ra. Yếu hơn nghĩa thông thường, nhưng hai AC chỉ đòi đúng hai điều, và cả hai đạt. Thêm một dòng sự kiện là **vỡ lời hứa 🔒** (**D155**, **D163**).
  - AC: AC-40.14, AC-40.15
  - Phụ thuộc: T837

- [ ] **T842** — Thời tiết nóng ăn vào thể lực.
  - File: `src/engine/lienTuc/theLucCoHoc.ts`, `src/engine/lienTuc/theLucCoHoc.test.ts`
  - Cách làm: `HE_SO_THOI_TIET_THE_LUC` cho `'nong'` trong **1,10–1,20**. Phép kiểm **giữ `maTran` rồi thay `dieuKien` bằng tay** khi dựng `TrangThaiLienTuc`.
  - Xong khi: thể lực trung bình của 22 người ở cuối trận giảm nhanh hơn **10–20%** ở `'nong'` so với `'am'`.
  - ⚠️ *"Thời tiết mát"* **không có trong danh mục** (`'nong' | 'kho' | 'am' | 'mua' | 'mua-to'`) — **D166** đọc nó là `'am'`, và đó là một **định nghĩa của plan**, không của spec. Và `dieuKienTuMaTran` là **hàm thuần** không nhận tuỳ chọn, nên *"cùng mã trận với hai thời tiết"* không dựng được qua đường thường.
  - AC: AC-40.18
  - Phụ thuộc: T841 — **không phải `[P]` với T841**: cả hai chạm `theLucCoHoc.ts`

- [ ] **T843** — Vế đo cho mười AC thể lực, cộng năm điều kiện RA.
  - File: `src/engine/lienTuc/doMucDich.ts`, `src/engine/lienTuc/doMucDich.test.ts`
  - Xong khi: mười vế xanh trên 10 mã (AC-40.6→40.11, 40.13, 40.14, 40.17, 40.18), mỗi vế có `it` **⚠️ CHỐNG RỖNG** và một ca ngược; năm điều kiện RA đủ và **báo số**.
  - AC: AC-40.6, AC-40.7, AC-40.8, AC-40.9, AC-40.10, AC-40.11, AC-40.13, AC-40.14, AC-40.17, AC-40.18
  - Phụ thuộc: T839, T840, T841, T842

---

## Phase 71 — Lát 4: hành động, bốn nhánh, và tệp xuất

- [ ] **T844** — `hanhDong.ts`: danh mục hành động, cộng `hanhDongCuaPha`.
  - File: `src/engine/lienTuc/hanhDong.ts` (**mới**), `src/engine/lienTuc/hanhDong.test.ts` (**mới**)
  - Cách làm: `HanhDongNguoi` gồm năm hành động sân cộng thủ môn và phòng ngự. `hanhDongCuaPha` là một phép **gọi tên** quyết định v6 đã ra (`LoaiHanhDong`), nên nó **không thể** đổi kết cục.
  - Xong khi: **mọi** `LoaiHanhDong` của v6 có ảnh (tập đóng, `tsc` bắt được thiếu); `dut-diem` **gộp** cả sút lẫn đánh đầu — ghi vào chú thích rằng dữ liệu trận của spec 007 **đã có** một trạng thái đánh đầu riêng, nên chỗ tách đã sẵn và việc gộp là một **lựa chọn**.
  - AC: AC-41.8
  - Phụ thuộc: T843

- [ ] **T845** — `nhanhCuaHanhDong` bốn nhánh, cộng `doMaoHiem`.
  - File: `src/engine/lienTuc/hanhDong.ts`, `src/engine/lienTuc/hanhDong.test.ts`
  - Cách làm: bảng ánh xạ ở `plan.md` mục 4.5 — `sut`/`re-bong`/`tat-canh` là **1:1**, chỉ `chuyen` mơ hồ và nó tách theo **lợi tiến** với ngưỡng `NGUONG_TIEN_NEN × (1 − doMaoHiem)`. `doMaoHiem = 0,60 · nhan-quan + 0,40 · quyet-doan`, chuẩn hoá từ dải 1..20.
  - Xong khi: **cả bốn** nhánh xuất hiện ít nhất một lần trên một trận đầy đủ (AC-41.13, phép kiểm **chống rỗng**); hai cầu thủ cùng tình huống nhưng `doMaoHiem` khác nhau ⇒ **hai nhánh khác nhau** ở ≥ 1 tình huống, **trong khi hành động v6 vẫn y nguyên** (AC-41.22); **không thêm một ô nhập nào**.
  - ⚠️ **Chỉ số *"bình tĩnh"* mà ví dụ của AC-41.22 nêu KHÔNG TỒN TẠI** trong 18 mã của repo (**D157**).
  - AC: AC-41.12, AC-41.13, AC-41.22
  - Phụ thuộc: T844

- [ ] **T846** — `nguoiDonDuongChuyen`: **suy** người đón từ `pha.gan`, **không rút một lần nào**.
  - File: `src/engine/lienTuc/hanhDong.ts`, `src/engine/lienTuc/mucDich.ts`, `src/engine/lienTuc/hanhDong.test.ts`
  - Cách làm: `pha.gan.nguoiChuyen` đã nêu **một id cho mỗi bước** `chuyen`/`re-bong`, cộng `nguoiKetThuc`. Người đón chạy tới `doanBong.den`.
  - Xong khi: **đúng một** đồng đội giảm khoảng cách tới điểm bóng sẽ tới, và anh ta trong **3 m** của điểm ấy khi bóng tới (AC-41.11); một phép kiểm **ghim đẳng thức chỉ số** giữa `nguoiChuyen[k]` và `cacHanhDong[k]`, đúng khuôn phép kiểm đang canh `oCuaNguoiTrenSan` vs `oCuaNguoiGiu`.
  - AC: AC-41.11
  - Phụ thuộc: T845 — **không phải `[P]` với T845**: cả hai chạm `hanhDong.ts`

- [ ] **T847** — `oMucDich: Int8Array` vào `LoMoc`, **không nới `STRIDE`**.
  - File: `src/engine/lienTuc/loMoc.ts`, `src/engine/lienTuc/loMoc.test.ts`, `src/engine/lienTuc/tranLienTuc.ts`
  - Cách làm: 22 ô mỗi mốc. `ghiMoc` nhận thêm mảng mục đích; `docMoc` trả nó ra.
  - Xong khi: `soByteCuaLo` tăng đúng **2.640 byte** một lô (`120 × 22 × 1`), tức **+2,6%**; `STRIDE` vẫn là **8**; ném khi mảng mục đích khác 22 phần tử.
  - 📌 Nới `STRIDE` 8 → 9 tốn `120 × 26 × 4 =` **12.480 byte** (**+12,5%**) **và** bắt ba trọng tài cộng quả bóng mang một trường vô nghĩa (**D150**).
  - AC: AC-41.2 *(một phần — lô)*
  - Phụ thuộc: T845

- [ ] **T848** — `khoa_muc_dich` vào khối mỏng, `ma_muc_dich` vào `dinh_dang`, `PHIEN_BAN_TEP` **1 → 2**; sửa hai chú thích lạc hậu.
  - File: `src/engine/lienTuc/tepXuat.ts`, `src/engine/lienTuc/tepXuat.test.ts`
  - Cách làm: một khoá tiêu đề **thứ ba** với **đúng 22 cột** nối **sau** khối 25 ô — **không** thêm khoá thứ tư vào `KHOA_NGUOI`. Hai chú thích ở `tepXuat.ts:157-160` và `:286-295` nói *"`muc_dich` là **US-40** của spec 009"* và *"tám loại trở lên"* — cả hai **sai**: spec chốt **US-41** và **bốn** mục đích.
  - Xong khi: `hang.length === 1 + 4 + 25×3 + 22 === 102` thành một phép kiểm; một phép kiểm khẳng định **ba ô trọng tài KHÔNG có mã mục đích**; `PHIEN_BAN_TEP` = **2**; `grep -c 'US-40 của spec 009' src/engine/lienTuc/tepXuat.ts` = **0**.
  - 📌 Khoá thứ tư của `KHOA_NGUOI` cấp mã mục đích cho **ba trọng tài**: **19.320 ô** không tra được về danh mục, nằm trong **chính tệp mà AC-45.6 dùng làm nguồn đo** — và đắt hơn **38.624 byte** (**D151**). `PHIEN_BAN_TEP` bump vì tệp xuất là **đường một chiều**, không có nút đấu lại để tước — khác `PHIEN_BAN_ENGINE_LIEN_TUC`, **không** bump (**D148**, **D162**).
  - AC: AC-41.2
  - Phụ thuộc: T847

- [ ] **T849** — Điền `hanh_dong` và `muc_dich` của **khung dày**, cộng một vế canh hai dạng mã hoá **khớp nhau**.
  - File: `src/engine/lienTuc/tepXuat.ts`, `src/engine/lienTuc/doMucDich.ts`, `src/engine/lienTuc/tepXuat.test.ts`
  - Cách làm: hai khoá ấy **đã có** và đang `null`; điền chúng bằng **mã định danh chữ**. Thêm một vế: ở mọi mốc có cả hai dạng, **mã số tra qua `ma_muc_dich` phải ra đúng chuỗi của khung dày**.
  - Xong khi: `grep -c 'muc_dich: null' src/engine/lienTuc/tepXuat.ts` = **0**; vế canh hai dạng xanh và có **ca ngược bơm được** (sửa một mã số rồi đòi vi phạm); hình dạng *"đúng tám khoá mỗi `cau_thu`"* của mục 15 **còn nguyên**.
  - AC: AC-41.2, AC-41.8
  - Phụ thuộc: T848

- [ ] **T850** — Đo kích thước tệp xuất, **báo số trước và sau**.
  - File: `src/engine/lienTuc/tepXuat.test.ts`
  - Cách làm: `soByteCuaChuoi(chuoiTep(tep))` đã có từ T744/T745.
  - Xong khi: bảng ở `tepXuat.test.ts:42` có thêm cột **sau spec 009**; ca xấu dưới **11.000.000 byte**; con số dự kiến là **5.332.957 → 5.616.344** (48,48% → **51,06%** của trần) và chênh lệch thật so với dự kiến được ghi vào chú thích.
  - 📌 **Kết luận một câu để khỏi tranh luận:** mục đích ở mọi mốc tốn **2,58 điểm phần trăm** của một ngưỡng còn dư **48,9 điểm**. Không có vấn đề kích thước nào để giải.
  - AC: AC-41.21
  - Phụ thuộc: T849

- [ ] **T851** — Vế đo cho chín AC hành động, cộng năm điều kiện RA.
  - File: `src/engine/lienTuc/doMucDich.ts`, `src/engine/lienTuc/doMucDich.test.ts`
  - Cách làm: thêm vế cho AC-41.2 (mã mục đích ở **mọi** hàng mỏng), AC-41.8, AC-41.9 (người dẫn bóng cách bóng < 2 m ở mọi mốc pha dẫn), AC-41.10 (khoảng cách người chuyền–bóng **tăng đơn điệu** trong quãng bay), AC-41.11, AC-41.12, AC-41.13, AC-41.22.
  - Xong khi: tám vế xanh trên 10 mã, mỗi vế có `it` **⚠️ CHỐNG RỖNG** và một ca ngược; năm điều kiện RA đủ và **báo số**.
  - 📌 AC-41.9 và AC-41.10 **đã đúng từ T816** (`TAM_CHAM_BONG = 1,0` và `giuThucSu`); task này chỉ thêm **vế đo** và một dây bẫy, không sửa hành vi.
  - AC: AC-41.2, AC-41.8, AC-41.9, AC-41.10, AC-41.11, AC-41.12, AC-41.13, AC-41.22
  - Phụ thuộc: T846, T850

---

## Phase 72 — Lát 5: đo và báo số ngân sách, rồi hỏi

- [ ] **T852** — Đo thời gian một trận liên tục sau spec 009, đối chiếu **78,95 ms**, ghi vào plan.
  - File: `specs/009-player-intent-tactics/plan.md`
  - Cách làm: đo trên **10 mã** đúng điều kiện đã đo nền (110,84 ms trung bình, 129,44 ms ca xấu, 0,0201 ms mỗi mốc), cùng tiến trình, cùng máy.
  - Xong khi: bảng **Nền đo** của `plan.md` có thêm cột **sau spec 009**; chênh lệch so với dự báo (**≈ 123 ms** sau khi **D161** cắt 29,6 ms) được ghi ra, kể cả khi nó tệ hơn dự báo.
  - ⚠️ **AC-41.19 cắt 0,00 ms** (**D153**). Nếu con số vượt: đó là **một câu hỏi cho người dùng**, không phải một chỗ tự nới — nới 78,95 là một lần **sửa hiến pháp**.
  - AC: — (yêu cầu phi chức năng ở `spec.md` mục 7)
  - Phụ thuộc: T851

- [ ] **T853** — Trả lời câu hỏi **10.4**: 78,95 ms có phải ngân sách của chế độ liên tục không.
  - File: `specs/009-player-intent-tactics/plan.md`
  - Cách làm: đặt con số của T852 cạnh **hai** ngân sách — mùa giải (78,95 ms/trận, suy từ 380 trận < 30 giây) và một trận xem được (**3.000 ms**, hiến pháp mục 3). Rồi **hỏi người dùng** mùa giải sẽ chạy v6 (9,0 ms, dư 8,8 lần) hay chế độ liên tục.
  - Xong khi: mục 10.4 của `plan.md` chuyển từ `- [ ]` sang `- [x]` kèm **ngày người dùng chốt**.
  - 📌 Task này **không chặn** gì: T852 đo và báo số dù câu hỏi được trả lời thế nào.
  - AC: —
  - Phụ thuộc: T852

---

## Phase 73 — Lát 6: người dùng xem và phán

- [ ] **T854** — Kiểm **chín trường hợp biên** ở `spec.md` mục 6.
  - File: `src/engine/lienTuc/doMucDich.test.ts`, `src/engine/lienTuc/mucDich.test.ts`
  - Cách làm: một phép kiểm cho mỗi hàng — không ai ở vị trí nhận bóng; đội còn 9–10 người; thủ môn cầm bóng (AC-30.7 của spec 005 còn đúng); bóng chết; hai người cùng nhắm một khoảng trống; thể lực chạm đáy; trận 20 phút; thay người + thẻ đỏ + bóng chết cùng một phút; mã trận đã lưu trước spec này.
  - Xong khi: chín phép kiểm xanh; hàng *"mã trận đã lưu trước spec này"* kiểm bằng cách khẳng định `PHIEN_BAN_ENGINE_LIEN_TUC` **vẫn là 101** và `lyDoKhongDauLai` trả `null` cho một trận lưu trước.
  - AC: — (trường hợp biên; Definition of Done mục 2)
  - Phụ thuộc: T853

- [ ] **T855** — **Người dùng tự xem một trận trọn vẹn và phán** rằng bốn câu họ nói ở `spec.md` mục 1 không còn đúng.
  - File: — (không code)
  - Cách làm: mở một trận ở chế độ liên tục, xem trọn, ở **cả** sân 2D và sa bàn. Năm việc cần nhìn: một cầu thủ không cầm bóng suốt một phút — anh ta đi vì một lý do không; tiền đạo còn đứng sau lưng hàng thủ cả trận không; hai người cạnh nhau có lúc nào đi hai hướng khác nhau không; phút 80 có ai chạy chậm hơn rõ rệt không; và trận có còn giật cục không.
  - Xong khi: người dùng nói **bốn câu kia không còn đúng** — hoặc nói rõ câu nào còn đúng, và câu ấy thành một task mới **sau khi cập nhật plan**.
  - 📌 Đây là lớp kiểm **không thay được bằng máy**, và tiền lệ đã có hai lần: *"11 cặp khiêu vũ"* (T814) và *"giật cục"* (T817) đều **xanh hết phép kiểm**.
  - AC: — (Definition of Done mục cuối)
  - Phụ thuộc: T854

- [ ] **T856** — Đi qua **toàn bộ 36 AC** của `spec.md`, tick từng mục, và tick Definition of Done.
  - File: `specs/009-player-intent-tactics/spec.md`
  - Xong khi: 36 ô `- [ ]` của mục 4 thành `- [x]`, **mỗi ô kèm tên phép kiểm** đã chứng minh nó; tám mục Definition of Done ở mục 8 được tick hoặc **nói rõ vì sao chưa**.
  - ⚠️ **Không ô nào được tick vì một hàm tồn tại.** Đó là lỗi đã bắt được **bốn** lần trong dự án này (AC-49.6, AC-49.7, T782, AC-37.6): tick trên **sự tồn tại** của một hàm chứ không trên **hành vi** của nó. Mỗi tick phải trỏ vào một phép kiểm **đo đúng con số AC nói**.
  - AC: cả 36
  - Phụ thuộc: T855

---

## Bảng phủ AC

**36 / 36 AC có ít nhất một task.** Cột *"đo ở"* là task sở hữu **phép đo**, không phải task
dựng hành vi — vì **P5** đòi một phép kiểm cho mỗi con số, và một AC không có phép đo là một AC
chưa xong dù hành vi đã có.

| AC | Dựng ở | Đo ở |
|---|---|---|
| AC-40.1 | T832 | T823 *(nền)*, T835 |
| AC-40.2 | T832 | T823 *(nền — **đạt sẵn**)*, T835 |
| AC-40.3 | T832 | T823 *(nền — **đạt sẵn**)*, T835 |
| AC-40.4 | T833 | T835 |
| AC-40.5 | T834 | T823 *(nền)*, T835 |
| AC-40.6 | T837 | T843 |
| AC-40.7 | T837 | T843 |
| AC-40.8 | T837, T838 | T843 |
| AC-40.9 | T837, T838 | T843 *(**đạt sẵn** — dây bẫy)* |
| AC-40.10 | T839 | T843 |
| AC-40.11 | T839 | T843 |
| AC-40.13 | T837 | T843 |
| AC-40.14 | T841 | T843 |
| AC-40.15 | T841 | T841 |
| AC-40.16 | T834 | T835 |
| AC-40.17 | T840 | T843 |
| AC-40.18 | T842 | T843 |
| AC-41.1 | T824, T827 | T830 |
| AC-41.2 | T847, T848, T849 | T851 |
| AC-41.3 | T827 | T830 |
| AC-41.4 | T826 | T830 |
| AC-41.5 | T829 | T831 |
| AC-41.6 | T826 | T823 *(nền)*, T830 |
| AC-41.7 | T825, T826 | T830 |
| AC-41.8 | T844, T849 | T851 |
| AC-41.9 | **T858** | T851 |
| AC-41.10 | *(đã đúng từ T816)* | T851 |
| AC-41.11 | T846 | T851 |
| AC-41.12 | T845 | T851 |
| AC-41.13 | T845 | T851 |
| AC-41.14 | T827 | T830 |
| AC-41.15 | T827 | T830 |
| AC-41.19 | T828 | T828 |
| AC-41.20 | T828 | T831 |
| AC-41.21 | T850 | T850 |
| AC-41.22 | T845 | T851 |

> **AC-40.12 không có trong bảng, và đó là đúng.** Nội dung của nó chuyển sang **spec đầu tiên
> sở hữu huấn luyện viên máy** ngày **2026-11-28** — v6 không có thay người do máy, nên AC ấy đo
> trên một tập rỗng. Số `AC-40.12` coi như **đã cấp** và không được dùng lại. Xem Non-goals và
> Nhật ký làm rõ của `spec.md`, cùng `plan.md` mục 10.3.

---

## Ghi chú thực thi

- **Không tạo file nào ngoài danh sách trên.** Phát sinh thêm → **dừng, cập nhật plan/tasks
  trước**. Ngày **2026-11-28** `/analyze` đã làm đúng việc ấy một lần: nó tìm ra ba chỗ chặn, và
  `spec.md` mục 8 cùng `plan.md` cùng file này được sửa **trước** khi một dòng code nào chạy. Sáu file mới của spec này là: `mucDich.ts`, `khoiDoiHinh.ts`, `theLucCoHoc.ts`,
  `hanhDong.ts`, `doMucDich.ts`, `vanTayLienTuc.test.ts` — cộng file test của từng cái.
- **Năm điều kiện RA chung chạy ở MỌI phase**, không chỉ phase cuối. Cái chúng bắt là một **rò
  rỉ**, và rò rỉ vào sớm thì sửa rẻ.
- **Ba file là đường kết cục và không được sửa một dòng:** `src/engine/tran.ts`,
  `src/engine/theLuc.ts`, `src/engine/sucManh.ts`. Một dòng sửa ở đó là một task phải lùi.
- **Mỗi phép đo tỉ lệ đi kèm một `it` ⚠️ CHỐNG RỖNG**, và mỗi vế mới có **một ca ngược**. Bốn
  AC của spec này đo *"ở ít nhất 70% số mốc **thoả điều kiện**"* — nếu phép lọc không bao giờ
  thoả thì `0/0` và phép kiểm **xanh mà không đo gì** (**R74**).
- **Mỗi `it` chạy 10 mã trận phải khai `timeout` riêng.** Repo **không** đặt `testTimeout`, nên
  mặc định là **5.000 ms** và 10 mã tốn **≈ 3,3 giây** — sát. Thiếu nó là một phép kiểm đỏ **vì
  hết giờ**, không vì sai.
- **Tên test mang mã AC và mã task**, tên `it` là một mệnh đề tiếng Việt khẳng định hành vi.
- **Mỗi task xong là một commit**, thông điệp nêu rõ task nào (hiến pháp mục 4).
- Chạy **`/analyze`** trước khi `/implement`. Còn CRITICAL thì **không** được `/implement`.
