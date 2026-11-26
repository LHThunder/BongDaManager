# Tasks: Giao diện có hệ thống thiết kế, và chế độ xem sân 3D song song

| | |
|---|---|
| **Spec** | `./spec.md` (Status `Planned`, **52 AC**, nhóm 46–53) |
| **Plan** | `./plan.md` (Status `Draft`, D130–D143, R60–R66) |
| **Tiến độ** | 45/50 — T782 bị gỡ tích ngày 2026-11-26 sau phán quyết T760; `T814` của spec 007 **đã gỡ chặn nó cùng ngày** (0,041% số cặp), nhưng nó chờ người dùng xem lại. Bốn task còn lại là phép đo nhịp khung |
| **Nền đo** | commit `5265d37`, engine v6, **84 file test / 1.733 phép kiểm xanh**, bộ kiểm chạy hết **152 giây** |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

> **Số task và số phase đi tiếp theo dãy của repo, không theo số spec.** Spec 001→T136,
> 002→T224, 003→T344, 004→T441, 005→T526, 006→T628, 007→T762. Nên spec 011 lấy **T763–T812**
> và **Phase 60–66** (spec 007 dừng ở Phase 59). Spec 008, 009, 010 đã được dành **số spec**
> nhưng **chưa** được dành số task — chúng sẽ lấy các số còn trống lúc được viết, đúng như
> `spec.md` mục 9 đã ghi cho nhóm AC.

> **50 task, 7 phase, ánh xạ 1-1 với bảy lát cắt của `plan.md` mục 9.**
>
> ⚠️ **`T812` KHÔNG nằm ở phase cuối — nó ở Phase 61**, và đó là cố ý: nó là một task `/analyze`
> ngày 2026-11-25 phải thêm (**D143**), và nó phải đi **trước** T780. Đánh số tiếp nối thì rẻ
> hơn đánh số lại 49 task, và spec 007 đã có đúng tiền lệ này. Người đọc quét theo số sẽ tưởng
> T812 thuộc Phase 66 — **đi theo tiêu đề phase, đừng đi theo số**.
>
> Ngoài T812, không có số nào dùng thêm ngoài plan: nếu `/implement` phát hiện một lỗ thì
> **dừng và cập nhật plan trước**, đúng Ghi chú thực thi ở cuối file.

> ## ⛔ Phase 60 chặn mọi phase sau
> Không task nào của Phase 61–66 được bắt đầu khi `.specify/memory/constitution.md` còn là
> **3.0.1**. Hiến pháp 3.0.1 liệt *"Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm"* trong
> Non-goals, nên mọi dòng code của lớp 3D viết trước T763 là một vi phạm hiến pháp — kể cả khi
> nó chạy đúng. Đây là lời **AC-52.1** nói, và nó là một điều kiện VÀO, không phải điều kiện RA.

> ## Điều kiện RA chung của mọi task
> Không task nào được tick nếu thiếu một trong ba điều này:
> 1. **`git diff --stat src/engine` rỗng.** Đây là **AC-49.9**, và nó là lưới duy nhất giữ lời
>    hứa "spec 011 chỉ đọc engine". Một dòng sửa trong `src/engine/` là một task phải lùi.
> 2. **`npx vitest run` xanh, và số phép kiểm KHÔNG GIẢM so với 1.733.** Đây là **AC-49.8**
>    và **AC-53.2**: 1.733 phép kiểm ấy là chủ sở hữu của hàng chục AC đã đóng ở spec 002, 004,
>    005, 006. ⚠️ Bộ kiểm chạy **152 giây** — đừng chạy nó sau từng dòng sửa; chạy nó trước khi
>    tick.
> 3. **Chuỗi mới có đủ cả hai bản Việt–Anh trong CÙNG commit** (P8, **AC-50.4**). Không có
>    commit nào "tiếng Anh để sau".

---

## Phase 60 — Lát 0: hiến pháp 4.0.0

- [x] **T763** — Bump hiến pháp lên **4.0.0**: gỡ **đúng một** dòng khỏi Non-goals, ghi Changelog, dẫn về mục 1 theo khuôn lần 3.0.0 ngày 2026-11-16.
  - File: `.specify/memory/constitution.md`
  - Cách làm: chạy `/constitution`, **không sửa tay** — để Changelog và cách bump đi đúng khuôn các lần trước (`plan.md` mục 1, giả định cuối của `spec.md` mục 9).
  - Xong khi: `grep -c '^- Đồ hoạ 3D' .specify/memory/constitution.md` = **0** — ~~`grep -c "Đồ hoạ 3D"` = 0~~ ; `grep -c "điện thoại và máy tính bảng"` ≥ **1** và `grep -c "Ngôn ngữ thứ ba"` ≥ **1** (hai non-goal kia còn nguyên); Changelog có dòng `4.0.0` nói rõ gỡ cái gì, vì sao MAJOR, kéo theo mục nào; và có câu nói non-goals của spec 001 **không bị sửa ngược**.
  - AC: AC-52.1, AC-52.2, AC-52.3, AC-52.4
  - Phụ thuộc: —
  - ✅ **Xong 2026-11-25**, hiến pháp **4.0.0**, bộ kiểm **84 file / 1.733 phép kiểm xanh**.
  - ⚠️ **Điều kiện RA số 1 của chính task này đã bị sửa, và sửa công khai.** Bản đầu đòi
    `grep -c "Đồ hoạ 3D"` = **0**, nhưng nó **tự mâu thuẫn với điều kiện RA số 3** của chính nó
    (“Changelog có dòng 4.0.0 **nói rõ gỡ cái gì**”): nói rõ gỡ cái gì thì phải trích
    nguyên câu ấy, đúng khuôn lần 3.0.0 đã trích nguyên hai non-goals bị gỡ. Hai điều
    kiện chỉ cùng đúng được nếu hồ sơ **không** gọi tên thứ bị gỡ — tức phải làm hồ sơ tệ đi.
    Nên phép kiểm được **neo vào danh sách** (`^- `) thay vì quét cả tệp: đúng điều nó muốn
    nói tứ đầu — *Non-goals không còn cấm 3D* — và vẫn đỏng nếu dòng ấy còn trong danh sách.
    Hiện tại cụm “Đồ hoạ 3D” xuất hiện **2 lần**, cả hai đều là **hồ sơ**: một đoạn ở mục 1
    và một dòng Changelog. Không dòng nào trong Non-goals.

---

## Phase 61 — Lát 1: xem được

> *Xong phase này là mở trình duyệt, chạy một trận liên tục, đổi sang sa bàn và **thấy quả tạt
> bay lên**.* Đây là lát cắt dọc đầu tiên và nó phải bấm thử được (P6).

- [x] **T764** — Tạo module phép chiếu với hai hằng và hai hàm lõi.
  - File: `src/ui/chieuSaBan.ts` (**mới**)
  - Nội dung: `GOC_SA_BAN = 50` (độ, góc giữa hướng nhìn và mặt sân), `HE_SO_CAO = 3`, `chieuDiem(khung, xMet, yMet, zMet): ToaDoVe`, `doCaoVe(khung, zMet): number`, cộng `tiSaBan(khung): number` (**D144**). Nhận `KhungAnh` của `src/ui/quyDoiMet.ts` và trả `ToaDoVe` của chính file ấy — **không** định nghĩa kiểu khung mới (D131).
  - ⛔ **D144 (người dùng chốt 2026-11-25, do `/implement` phát hiện): KHÔNG dùng `tiLeMet`.**
    `tiSaBan(khung) = khung.cao / RONG_SAN` (= 64/68 = 0,941176), dùng cho **cả ba trục**. Bản đầu
    của `plan.md` hứa dùng lại `tiLeMet` (0,864706), nhưng đo bằng máy thì `tiLeMet` cho chiều sâu
    **45,0** (spec: 49,0), đỉnh bóng **8,77** (spec: 9,5) và `z = 1 m` chỉ **0,98×** bán kính bóng
    (spec: 1,07×) — tức **T765(e) đỏ**. Năm con số ấy đến từ một hệ **không lề**.
  - Đặt mặt cỏ: biên **gần** (`y = 0 m`) ở `cao − le`, đúng cùng một `y` vẽ với sân 2D (61,400 ở
    khung chuẩn, con số `quyDoiMet.ts` đã ghi); chiều sâu đi **lên** từ đó.
  - ⚠️ **Chiều sâu chiếu theo `sin(GOC_SA_BAN)`, độ cao theo `cos(GOC_SA_BAN)`.** Lẫn hai hàm này là **R60**, rủi ro cao nhất của spec.
  - Xong khi: `npx tsc --noEmit` xanh; hai hằng xuất hiện **đúng một lần mỗi hằng** trong `src/`.
  - AC: (nền cho AC-46.x)
  - Phụ thuộc: T763
  - ✅ **Xong 2026-11-25.** `tsc` xanh; `GOC_SA_BAN =` và `HE_SO_CAO =` mỗi thứ xuất hiện
    **đúng một lần** trong `src/`, cả hai ở `src/ui/chieuSaBan.ts`.

- [x] **T765** — Phép kiểm phép chiếu: dấu từng trục, `sin` vs `cos`, đơn điệu, biên.
  - File: `src/ui/chieuSaBan.test.ts` (**mới**)
  - Nội dung tối thiểu: (a) `chieuDiem(52,5 ; 34 ; 0)` cho đúng tâm mặt cỏ đã chiếu ở mọi `KhungAnh`, theo khuôn đẳng thức của `quyDoiMet.test.ts`; (b) tăng `yMet` và tăng `zMet` **không** cho cùng kết quả — hai trục cùng đi lên trên màn hình nên đây là chỗ dễ sai dấu nhất; (c) một phép kiểm chốt riêng rằng chiều sâu dùng `sin` và độ cao dùng `cos`, không ngược; (d) `doCaoVe` tăng nghiêm ngặt trên `[0 ; 5,26]`; (e) `doCaoVe(1 m) ≥ 1,7` đơn vị (bán kính quả bóng) và `chieuDiem` ở `z = 5,26` còn trong **khung ảnh** (`0 ≤ y ≤ CAO = 64`). ⚠️ **KHÔNG kiểm "còn trong `GioiHanVe`"**: `viTriVe.ts:50` ghi rõ `GioiHanVe` là *"khung an toàn của **mặt cỏ**"*, và một quả bóng bay cao **phải** vượt khỏi nó — đó là mục đích của trục `z`. Bản đầu của task này viết sai tên khung, `/analyze` bắt được ngày 2026-11-25.
  - Xong khi: `npx vitest run src/ui/chieuSaBan.test.ts` xanh; và thử đảo dấu `cos` trong T764 làm **ít nhất một** phép kiểm đỏ (phép thử đột biến bằng tay, rồi hoàn lại).
  - AC: AC-46.1, AC-46.3
  - Phụ thuộc: T764
  - ✅ **Xong 2026-11-25.** Phép thử đột biến chạy **năm** lần, đỏ cả năm, rồi hoàn lại xanh:
    `cos`→`sin` ở độ cao (4 đỏ) · `sin`→`cos` ở chiều sâu (2) · đảo dấu chiều sâu (5) ·
    đảo dấu độ cao (4) · thay `tiSaBan` bằng `tiLeMet` (5). **R60 có lưới thật.**

- [x] **T766** — Thêm `chieuMatSan`: bốn góc mặt cỏ và các vạch sân, đã chiếu.
  - File: `src/ui/chieuSaBan.ts`
  - Xong khi (**theo D144**): phép kiểm trong `chieuSaBan.test.ts` khẳng định mặt cỏ chiếm **49,0 đơn vị** chiều cao ảnh (77% của 64) ở khung chuẩn, và sân cộng đỉnh bóng ở `z = 5,26` là **58,6 ≤ 64** — hai con số của `spec.md` khối mở đầu.
  - AC: AC-46.1
  - Phụ thuộc: T765
  - ✅ **Xong 2026-11-25.** Mặt cỏ **49,03** đơn vị (77% của 64); sân cộng đỉnh bóng
    **58,6 ≤ 64**, còn **5,4** đơn vị lề. Vòng tròn giữa trả về **ellipse**, `ry/rx` đúng
    `sin 50°`.

- [x] **T767** — Dựng component sa bàn, vẽ mặt cỏ và vạch sân.
  - File: `src/ui/components/San3D.tsx` (**mới**)
  - Nội dung: `Props` **giống hệt** `San2D` (`DuLieuVe` + `msMoiPhut` + `dangChay` + `loMoc` + `soLo` + `oCuaNguoi`), không thêm một prop nào (`plan.md` mục 5). SVG nội tuyến `viewBox "0 0 100 64"`, màu lấy từ biến CSS đang có — không hằng màu mới.
  - Xong khi: `npx tsc --noEmit` xanh; và render `San3D` bằng **một chỗ gọi tạm trong lúc phát triển** ở `src/ui/pages/TrangTran.tsx` thấy một mặt sân **nghiêng**, có vạch, hai khung thành. ⚠️ Nút đổi góc nhìn là **T774**, nên ở task này chưa có đường chính thức nào để thấy `San3D`; chỗ gọi tạm ấy **phải được thay** bằng nút thật ở T774, và P6 ("không để lại nút không làm gì") được thoả ở **cuối phase**, không ở task này.
  - AC: —
  - Phụ thuộc: T766
  - ✅ **Xong 2026-11-25**, bấm thử trên trình duyệt: mặt cỏ, vạch biên, vạch giữa, vòng
    tròn giữa dẹt thành ellipse, hai vòng cấm, hai chấm phạt đền, **hai khung thành**.
  - ⚠️ **LỆCH KHỎI LỜI T767: `viewBox` của sa bàn là `0 0 104,02 64`, không phải
    `0 0 100 64`.** Lý do đo được, không phải thẩm mỹ: trong khung rộng 100 thì `tiSaBan`
    (**D144**) đưa 105 m thành 98,82 đơn vị, nên hai khung thành — dựng ra **ngoài** biên
    ngang 2 m — rơi ra `x = −1,29` và `x = 99,41`, tức **ngoài khung ảnh**, và chúng không
    vẽ ra. Đo trên bản chạy trước khi sửa. T767 **đòi thấy hai khung thành**, nên điều kiện
    RA của chính nó đã đỏ.
    Nới **chiều ngang** là cách duy nhất chữa được mà **không đụng tới một con số nào người
    dùng đã chốt**: cả năm con số của spec đều là con số **dọc**, và `tiSaBan` chỉ đọc
    `cao`. Phương án bị loại: hạ `tiSaBan` cho vừa bề ngang — nó kéo tụt cả năm.
    Bề ngang được **tính**, không đặt tay: `DAI_SAN × tiSaBan + 2 × BAN_KINH`, nên lề ra
    đúng bán kính đĩa cầu thủ — đúng điều `tiLeMet` hứa cho sân 2D. Một phép kiểm mới trong
    `chieuSaBan.test.ts` ghim quy tắc ấy lại.

- [x] **T768** — San3D vẽ 22 cầu thủ, đọc vị trí qua **một** đường duy nhất.
  - File: `src/ui/viTriVe.ts`, `src/ui/components/San3D.tsx`
  - Nội dung (**sửa 2026-11-25 theo D145**): bóc `viTriMetLienTuc(anhChup, playerId)` trả **mét** ra `viTriVe.ts`, cho `viTriVeLienTuc` gọi chính nó (hành vi ra ngoài **không đổi**), rồi `San3D` gọi `viTriMetLienTuc` và đưa mét qua `chieuDiem`.
  - ⚠️ Bản đầu viết “gọi `viTriVeLienTuc` **nguyên vẹn** rồi đưa kết quả qua `chieuDiem` (D139)" — không làm được: `chieuDiem` nhận **mét** (bảng Contracts, T764) còn `viTriVeLienTuc` trả **toạ độ vẽ**. Vẫn **một** đường đọc duy nhất, và giờ nó là đường trả mét — sạch hơn bản đầu. Không viết đường đọc lô mốc thứ hai — đó là điều làm AC-46.5 đúng **theo cấu trúc** chứ không phải nhờ canh.
  - Xong khi: chạy một trận liên tục, thấy 22 hình di chuyển trên sa bàn; ô `coMat = 0` thì không vẽ.
  - AC: AC-46.5
  - Phụ thuộc: T767
  - ✅ **Xong 2026-11-25.** Đo trên DOM của bản chạy: **22** đĩa trên sa bàn, đúng bằng số
    đĩa của sân 2D cùng lúc. Vị trí đi qua `viTriMetLienTuc` (**D145**), không có đường đọc
    thứ hai.
  - 📝 Chồng lấn giữa các đĩa thấy rõ trên màn hình. Đó **không** phải lỗi của task này:
    `phanBietDuoc` (T781) và viền tách (T782) là nơi xử, và **AC-46.5 cấm dịch người** để
    chữa chồng lấn.

- [x] **T769** — San3D vẽ quả bóng **có độ cao**, cộng dấu chiếu xuống mặt sân.
  - File: `src/ui/chieuSaBan.ts`, `src/ui/chieuSaBan.test.ts`, `src/ui/components/San3D.tsx`
  - Nội dung: thêm `viTriBongLienTuc(anhChup, khung)` đọc **`anhChup.thucThe[CHI_SO_BONG]`** và trả cả `matSan`, `chieu`, `zMet` — **cả ba trục từ một mốc duy nhất** (**D142**, AC-46.8). Bóng vẽ tại `chieuDiem(x, y, z)`; dấu chiếu tại `chieuDiem(x, y, 0)` khi `z > 0`. Giao diện **không** tự đặt con số nào.
  - ⚠️ **Đây là một đường đọc MỚI, không phải đường của sân 2D.** `/analyze` tìm ra sân 2D vẽ bóng bằng `viTriBongTrongPha` của `phaBong.ts` (`San2D.tsx:1543`, `:1846`) và `CHI_SO_BONG` **không có trong một dòng code sản phẩm nào**. Người dùng chốt phương án (b) ngày 2026-11-25: lấy cả ba trục từ mốc. **Hệ quả đã nhận:** bóng ở hai góc nhìn có thể ở hai chỗ khác nhau — đừng "sửa" điều đó, nó đã là một dòng trong `spec.md` mục 5.
  - Xong khi: **đây là lúc US-1 sống** — xem một quả tạt thấy bóng rời mặt sân, dấu chiếu chạy dưới nó, rồi hạ xuống chỗ người nhận; một mốc `danh_dau` cho bóng ở độ cao đầu người, không dưới chân; ô bóng không có mặt thì `viTriBongLienTuc` trả `null` và không vẽ bóng.
  - AC: AC-46.1, AC-46.2, AC-46.3, AC-46.4, AC-46.8
  - Phụ thuộc: T768
  - ✅ **Xong 2026-11-25. US-1 SỐNG.** Bắt được một pha thật trên bản chạy: bóng ở
    `z ≈ 2,15 m` — **tầm đầu người**, không dưới chân — vẽ cao hơn dấu chiếu của nó
    **3,90 đơn vị**, tức **2,3 lần bán kính của chính nó**, và dấu chiếu lệch ngang
    **đúng 0**. Cộng 6 phép kiểm thuần cho `viTriBongLienTuc`.
  - 📍 **Một bài học về cách ĐO, ghi để không ai mất lại nửa giờ:** hai lần đo đầu cho
    **0 trên 444** và **0 trên 536** khung — trông như bóng không bao giờ rời đất. Cả hai
    lần đều là **phép đo sai, không phải mã sai**: lần hai trận đã **kết thúc ở phút 95**
    nên mẫu chỉ là một khung đóng băng; lần một thì `z > 0` chỉ chiếm **~0,2%** số mốc
    (`tranLienTuc.test.ts:834` đòi `> 100` mốc trên ~57.000), nên 444 khung kỳ vọng bắt
    **chưa tới một** pha. Muốn thấy quả tạt thì phải đo trên một trận **đang chạy** và đủ
    dài, không phải nhìn lâu hơn.

- [x] **T770** — Thêm `thuTuDoSau` và phép kiểm của nó.
  - File: `src/ui/chieuSaBan.ts`, `src/ui/chieuSaBan.test.ts`
  - Xong khi: trả chỉ số **xa → gần**, ổn định khi hai độ sâu bằng nhau (không đảo chỗ hai phần tử ngang nhau giữa hai lần gọi); phép kiểm xanh.
  - AC: —
  - Phụ thuộc: T765
  - ✅ **Xong 2026-11-25.** 6 phép kiểm: xếp xa → gần trên toạ độ dựng tay và trên toạ độ
    sân thật; **ổn định** khi cả sáu điểm bằng nhau và khi chỉ một phần bằng nhau; không
    sửa mảng vào; danh sách rỗng cho danh sách rỗng; kết quả là một **hoán vị** đủ 22 chỉ số.

- [x] **T771** — San3D áp thứ tự vẽ theo độ sâu, **chỉ ghi lại DOM khi thứ tự đổi**.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: D137. So thứ tự mới với thứ tự khung trước; giống thì không chạm DOM. SVG không có `z-index`, nên thứ tự tài liệu **là** thứ tự che.
  - Xong khi: người ở đầu gần che người ở đầu xa, không ngược; và một `console.count` tạm trong lúc phát triển cho thấy số lần ghi lại DOM **nhỏ hơn nhiều** số khung vẽ (bỏ `console.count` trước khi tick).
  - AC: —
  - Phụ thuộc: T770, T769
  - ✅ **Xong 2026-11-25.** Thứ tự che **đúng**: đo trên DOM của bản chạy, 22 đĩa có `cy`
    tăng dần theo thứ tự tài liệu — người ở đầu xa vẽ trước, người ở đầu gần vẽ sau và che
    lên. Bộ đếm tạm đã gỡ (`grep -c 'data-tam-' = 0`).
  - ⚠️ **Điều kiện RA của T771 chờ đợi một thứ mà phép đo không cho.** Task viết: *"số lần
    ghi lại DOM **nhỏ hơn nhiều** số khung vẽ"*. Đo thật trên một trận đang chạy: thứ tự đổi
    ở **43,9%** số khung (323 trên 736) — tức chỉ ít hơn **2,3 lần**, không phải "nhỏ hơn
    nhiều". Lý do là bản chất bài toán, không phải mã: 22 người chạy liên tục thì gần như
    khung nào cũng có một cặp đổi chỗ sâu-nông.
    Cái mà phép so **thật sự** tiết kiệm được là số NÚT, không phải số KHUNG: đo bằng
    `MutationObserver` cho **3,63 nút bị chuyển chỗ mỗi khung**, so với 22 nếu xếp lại mù
    quáng — **ít hơn 84%** (174 nút trên 1.056). D137 vẫn đáng giá, nhưng vì lý do khác với
    lý do task viết ra nó.
    📌 **Chưa hạ ngưỡng, chỉ ghi số đo.** Nếu 43,9% là vấn đề thì chỗ xử là **T775**
    (đo ngân sách cuối lát 1) và **T804**, không phải ở đây.
  - 📝 Số khung/giây của hai phép đo trên **không** so sánh được với nhau: khung xem trình
    duyệt bị ẩn nên trang chạy ở chế độ nền và `requestAnimationFrame` bị tiết lưu. Mọi con
    số ở trên là **tỉ lệ**, nên chúng không phụ thuộc vào điều đó.

- [x] **T772** [P] — Thêm hai hàm tuỳ chọn góc nhìn.
  - File: `src/services/tuyChonRepo.ts`, cộng phép kiểm ở file test cạnh nó
  - Nội dung: `docGocNhinSan(): Promise<'phang' | 'sa-ban'>` và `datGocNhinSan(...)`, theo **đúng khuôn** `docHienSan2D` / `datHienSan2D` ở chính file ấy; mặc định `'phang'`; giá trị lạ đọc từ lưu trữ **rơi về** `'phang'`.
  - ⛔ **R61:** **KHÔNG** nhét góc nhìn vào `cheDoMoPhong` của bản ghi trận. `backupSchema.ts:264` ràng `z.enum(['co-dien','lien-tuc'])` và `backupService.test.ts:913` đã lấy đúng giá trị `'ba-chieu'` làm ví dụ chế độ lạ phải bị từ chối.
  - Xong khi: phép kiểm xanh cho cả ba ca (chưa có giá trị → `'phang'`; ghi rồi đọc lại → đúng; giá trị rác → `'phang'`); `git diff src/services/backupSchema.ts` **rỗng**.
  - AC: AC-47.4
  - Phụ thuộc: T763
  - ✅ **Xong 2026-11-25.** `tuyChonRepo.test.ts` đi từ 13 lên **19 phép kiểm**, xanh:
    chưa đặt gì → `'phang'`; ghi rồi đọc lại; sống qua một lần mở lại database; giá trị rác
    → `'phang'`; bốn tuỳ chọn độc lập với nhau.
  - ✅ **R61 có phép kiểm riêng**, không chỉ có lời dặn: nó khẳng định góc nhìn nằm ở khoá
    `gocNhinSan` và **không** đẻ ra hàng `cheDoMoPhong` nào trong `meta`. Giá trị rác dùng
    để thử chính là `'ba-chieu'` — đúng giá trị mà `backupService.test.ts:913` đã chọn làm
    ví dụ chế độ lạ phải bị từ chối. `git diff src/services/backupSchema.ts` **rỗng**.

- [x] **T773** [P] — Thêm chuỗi song ngữ cho mọi thứ Phase 61 hiển thị.
  - File: `src/ui/ngonNgu/` (file nhãn hiện có)
  - Chuỗi: nhãn góc nhìn phẳng, nhãn góc nhìn sa bàn, câu giải thích vì sao trận cổ điển không có sa bàn, nhãn nói **độ cao đã được phóng đại**.
  - Xong khi: đủ **cả hai** bản `vi` và `en` trong cùng commit; `npx vitest run src/ui/ngonNgu` xanh; không chuỗi nào rơi về khoá thô (tiền lệ: `tuongThuat.songNgu.test.ts`).
  - AC: AC-50.4, AC-46.6
  - Phụ thuộc: T763
  - ✅ **Xong 2026-11-25.** Bảy khoá mới, đủ **cả `vi` lẫn `en`**: `gocNhin`,
    `gocNhinPhang`, `gocNhinSaBan`, `dangXemGocNhin`, `doiSangGocNhin`,
    `saBanChiChoLienTuc`, `doCaoDaPhongDai`. 248 phép kiểm ngôn ngữ xanh.
  - 📍 **Song ngữ ở đây được `tsc` canh, không chỉ phép kiểm canh:** `SAN_2D_EN` khai kiểu
    `BanDich<typeof SAN_2D_VI>`, nên thiếu một khoá tiếng Anh là **đỏ lúc biên dịch**. Đó
    là lý do không cần thêm phép kiểm nào cho việc "có đủ hai bản".
  - 📍 **`doCaoDaPhongDai` nhận hệ số bằng THAM SỐ**, không viết thẳng "×3" vào hai tệp
    ngôn ngữ. Viết thẳng là đẻ thêm hai bản sao của `HE_SO_CAO`, mà **AC-46.6** đòi nó sống
    ở đúng một chỗ.
  - 📝 Câu `saBanChiChoLienTuc` nói **lý do**, không chỉ nói "không có": người dùng vừa
    thấy nút ấy ở một trận khác, nên câu này phải trả lời được câu họ đang nghĩ.

- [x] **T774** — Nút đổi góc nhìn trên trang xem trận; ẩn hẳn khi trận cổ điển.
  - File: `src/ui/pages/TrangTran.tsx` — chỗ duy nhất render `San2D`
  - Nội dung: một `button` **thật** (không `div` có `onClick`) nên bàn phím tới được sẵn; nhãn nói rõ góc nhìn hiện tại; đọc/ghi lựa chọn qua T772; cờ phân biệt là **`loMoc != null`** — đúng thẻ phân biệt `San2D` đang dùng (D121 của spec 007, D141 của plan này).
  - Xong khi: đổi góc nhìn giữa lúc trận đang chạy, đồng hồ **không lùi và không nhảy phút**; đổi về sân 2D thấy nội suy và dao động chờ còn nguyên; mở lại ứng dụng thấy góc nhìn lần trước; mở một trận **cổ điển** thì **không thấy nút**, thấy câu giải thích; rút chuột ra, Tab tới được nút và thấy vòng tiêu điểm.
  - AC: AC-47.1, AC-47.2, AC-47.3, AC-47.6, AC-50.1
  - Phụ thuộc: T772, T773, T769
  - ✅ **Xong 2026-11-25**, cả năm điều kiện RA đã đo trên bản chạy:
    - **AC-47.2** đổi góc nhìn giữa lúc trận chạy: đồng hồ **26′ → 26′**, không lùi, không
      nhảy phút. Nút đổi nhãn sang "Góc nhìn: Sa bàn", `aria-pressed="true"`.
    - **AC-47.2** đổi về sân 2D: `data-nguon="moc"` trở lại, và toạ độ `transform` của các
      điểm vẫn đổi giữa hai khung — nội suy còn nguyên.
    - **AC-47.3** tải lại trang rồi mở trận mới: nút vẫn là "Sa bàn", sa bàn vẽ ngay.
    - **AC-47.6** trận cổ điển: **không có nút**, câu giải thích hiện đủ, vẫn vẽ sân 2D,
      không có nhãn độ cao. Lựa chọn `'sa-ban'` đang lưu **bị bỏ qua đúng cách**.
    - **AC-50.1** là `<button>` thật (`tagName === 'BUTTON'`), nằm trong thứ tự tab
      (`tabIndex >= 0`), nhận được tiêu điểm, và repo có quy tắc `focus-visible` toàn cục.
    - **AC-46.6** nhãn "Độ cao của bóng đã được phóng đại ×3…" hiện khi ở sa bàn.
  - ⚠️ **LỆCH KHỎI LỜI T774: thẻ phân biệt KHÔNG phải `loMoc != null`.** Task viết thế vì
    đó là thẻ `San2D` dùng (D121, D141) — nhưng `San2D` dùng nó để chọn **đường vẽ của một
    khung hình**, còn ở đây nó quyết định một **nút có tồn tại hay không**, và nút thì phải
    ổn định cả trận. Đo trên bản chạy: ở **phút 0** của một trận liên tục, lô mốc đầu tiên
    chưa được ghi nên `loMoc` còn `null` — nút biến mất, và câu *"sa bàn chỉ có ở trận mô
    phỏng liên tục"* hiện ra **trên chính một trận liên tục**; tới phút 1 nút mới nhảy vào.
    Đã đổi sang `cheDoCuaTrangThai(tran) === 'lien-tuc'`, thứ đọc `phienBanEngine` đã nằm
    sẵn trong trạng thái nên đúng ngay từ phút 0. Đo lại: **20/20 mẫu** đều có nút, **không
    mẫu nào** hiện câu sai, sa bàn vẽ từ mẫu đầu tiên.
  - 📝 Chỗ gọi tạm của T767 đã **gỡ** (`grep -c 'TODO T774' = 0`). Mười hai prop khai **một
    lần** rồi trải vào cả hai lớp vẽ: hai bản sao là hai chỗ để lệch nhau, mà lệch ở đây
    nghĩa là hai góc nhìn đọc hai thứ khác nhau — đúng điều AC-46.5 cấm.
  - 📝 Lúc mới mở trang, nút nháy qua "Sân phẳng" một nhịp trước khi `docGocNhinSan()` trả
    về. Đây là **đúng khuôn `hienSan` đang dùng** (`hienSan ?? true`), không phải lỗi mới.

- [ ] **T775** — Phép đo **thăm dò** ngân sách ở cuối lát 1.
  - File: ghi số vào chính `tasks.md` này, dưới task
  - Nội dung: đo khung/giây ở mức `thuong` và mức `rat-nhanh` với sa bàn đang bật. Đây là phép đo **cảnh báo sớm**, không phải phép đo nghiệm thu (phép ấy là Phase 66).
  - ⚠️ Nếu nó vỡ ngân sách ở đây thì **D132 phải mở lại** — `three.js` là phương án **hợp hiến** đang chờ, và lúc ấy phải **hỏi người dùng**, không tự hạ ngưỡng.
  - Xong khi: có **hai con số thật** ghi ra, kèm câu kết luận "đủ ngân sách để đi tiếp" hoặc "phải mở lại D132".
  - AC: —
  - Phụ thuộc: T774
  - ⏸ **CHƯA ĐO ĐƯỢC — và cố ý không bịa một con số.** Khung xem trình duyệt của phiên này
    **đang ẩn**, nên `requestAnimationFrame` bị tiết lưu dù `document.visibilityState` vẫn
    báo `'visible'`. Mọi con số đo ra là của **trình duyệt**, không phải của ứng dụng.
  - 🔬 **Phép đo ĐỐI CHỨNG là thứ kết luận dứt điểm.** Đo bốn lần, mỗi lần ngay sau một cú
    bấm thật (cú bấm đánh thức trang), cửa sổ 2 giây:

    | Lớp vẽ | Mức | fps đo được |
    |---|---|---|
    | Sa bàn | `thuong` | 30,3 |
    | Sa bàn | `rat-nhanh` | 15,8 |
    | **Sân 2D (đối chứng)** | `rat-nhanh` | **1,9** |

    Sân 2D — thứ đã chạy qua bốn spec dưới một ngân sách hiệu năng **cứng** — đo ra **1,9
    fps**, tức **thấp hơn sa bàn tám lần**. Điều đó không thể đúng. Nó chứng minh con số
    đang phản ánh *trang được đánh thức gần đây đến mức nào*, chứ không phản ánh lớp vẽ.
    Thêm hai dữ kiện cùng hướng: tải lại sạch rồi đo ngay cho **60,5 fps**, còn một phép đo
    12 giây thì **treo quá 45 giây** vì bị tiết lưu giữa chừng.
  - ⚠️ T775 là phép đo **cảnh báo sớm** cho **R62**, và nếu nó vỡ ngân sách thì **D132 phải
    mở lại** — `three.js` là phương án hợp hiến đang chờ — và lúc ấy phải **hỏi người dùng**,
    không tự hạ ngưỡng. Báo một con số sai ở đây dẫn thẳng tới một quyết định kiến trúc sai.
    Cần chạy lại khi khung xem trình duyệt **đang hiện**.
  - 📌 Phase 62–66 **không bị chặn** bởi task này: nó là cảnh báo sớm, còn phép đo nghiệm
    thu là **T804** (cả năm mức tốc độ).

- [x] **T776** [P] — Xác nhận không thêm một phụ thuộc nào.
  - File: `package.json` (chỉ đọc)
  - Xong khi: `git diff package.json` **không có dòng nào** trong khối `dependencies` lẫn `devDependencies`.
  - AC: AC-51.7
  - Phụ thuộc: T774
  - ✅ **Xong 2026-11-25.** `git diff package.json` **rỗng hoàn toàn** — không một dòng nào
    trong `dependencies` lẫn `devDependencies`. Toàn bộ phép chiếu là số học viết tay trên
    chính lớp SVG đang có, đúng **D132**.

- [x] **T812** — Bóc `useGiamChuyenDong` thành hook dùng chung. *(Task do `/analyze` thêm ngày 2026-11-25 — **D143**. Nó ở **Phase 61**, không phải Phase 66.)*
  - File: `src/ui/giamChuyenDong.ts` (**mới**), `src/ui/components/San2D.tsx`
  - Nội dung: `useGiamChuyenDong` hiện là hàm **không export** ở `San2D.tsx:1039`, nên `San3D` không import được. Chuyển nguyên hàm sang file mới và cho `San2D` import từ đó. **Không đổi một dòng logic nào** của hook.
  - ⚠️ Nhân bản hook trong `San3D.tsx` là **không** được: giảm chuyển động là yêu cầu accessibility của **P9**, không phải tuỳ chọn, và hai nguồn cho một hành vi là cách chắc nhất để một nguồn lệch đi mà không ai thấy.
  - Xong khi: `git diff src/ui/components/San2D.tsx` chỉ có **một khối bỏ hàm nội bộ và một dòng import**; `npx vitest run` xanh với ≥ 1.733 phép kiểm; bật giảm chuyển động của hệ điều hành, sân 2D vẫn hành xử **đúng như trước** (AC-31.1 không đổi).
  - AC: (nền cho AC-49.5)
  - Phụ thuộc: T763
  - ✅ **Xong 2026-11-25**, bộ kiểm **85 file / 1.758 phép kiểm xanh** (nền 1.733 + 25 mới).
  - 📝 Diff của `San2D.tsx` có **ba** thay đổi, không phải hai như task viết: bỏ khối hàm,
    thêm dòng import, và **bỏ `useState` khỏi dòng import React** — cái thứ ba do `tsc` bắt
    buộc (`TS6133`), vì hook bóc đi là người dùng cuối cùng của `useState` trong file.

---

## Phase 62 — Lát 2: đúng đắn

> Ba nhóm bất biến của `spec.md` US-4, cộng hai phép kiểm **P5** mà hiến pháp đòi.

- [x] **T777** — Nhóm **dữ liệu**: khẳng định hai bất biến đúng sẵn.
  - File: `src/ui/batBienSaBan.test.ts` (**mới**)
  - Nội dung: trên `AnhChupMet` thật của một trận — thủ môn luôn trong **một phần ba sân của đội mình** (AC-30.7 đọc lại), hàng phòng ngự đứng **giữa tiền đạo đối phương và khung thành mình** (AC-30.8 đọc lại). Hai cái này đúng sẵn vì hai lớp đọc **cùng một lô mốc**; phép kiểm ở đây là để nói điều đó ra, không để sửa gì.
  - ⚠️ **Nếu phép kiểm thủ môn ĐỎ thì đó là câu hỏi của spec 007, không phải chỗ spec 011 tự sửa.** `/analyze` tìm ra engine kẹp **ĐÍCH** của thủ môn, không kẹp **vị trí**: `coHoc.test.ts:660` ghi *"Kẹp **ĐÍCH** của thủ môn (T714, AC-30.7 của spec 005)"*. Đà có thể vượt đích. Spec 011 **không được** thêm một phép kẹp ở lớp vẽ để che — `viTriVeLienTuc` đã cố ý tắt đúng phép kẹp ấy. Dừng và **hỏi người dùng**.
  - Xong khi: `npx vitest run src/ui/batBienSaBan.test.ts` xanh trên ít nhất 10 mã trận, **hoặc** đỏ kèm một câu hỏi đã gửi cho người dùng.
  - AC: AC-49.1, AC-49.2
  - Phụ thuộc: T774
  - ⛔ **ĐÃ ĐI ĐÚNG NHÁNH THỨ HAI CỦA ĐIỀU KIỆN RA: đỏ, và đã hỏi người dùng.** `src/ui/batBienSaBan.test.ts`
    đã tạo và **2 phép kiểm của AC-49.2 xanh**; nhưng **AC-49.1 bị CHẶN** bởi một lỗi của engine,
    và Phase 62 dừng ở đây theo quyết định của người dùng ngày 2026-11-25.
  - 🔴 **Phát hiện — thủ môn chạy qua vạch giữa sân.** Đo trên **10 mã trận × 45 phút × mọi mốc
    = 56.640 lượt**: **2,06%** (1.168 lượt) ra khỏi một phần ba sân nhà, lệch xa nhất **31,72 m**
    (thủ môn ở `x ≈ 66,7`), p50/p90/p99 = **1,91 / 8,09 / 24,06 m**. Nguyên nhân: engine kẹp
    **ĐÍCH** chứ không kẹp **VỊ TRÍ** (`coHoc.test.ts:660`). Đây đúng là lỗi mà spec 005 sinh ra
    AC-30.7 để chặn — `viTriVe.ts:11` ghi nó từng lọt suốt một lát cắt với 1.291 phép kiểm xanh.
    → Đã mở **`T813` ở `specs/007-continuous-match-engine/tasks.md`**. `spec.md` của spec 007
    **không bị đụng một dòng nào** (AC của spec 001–007 không được sửa ngược).
  - ⚠️ **TÔI ĐÃ ĐƯA NGƯỜI DÙNG MỘT CON SỐ SAI, VÀ SỬA CÔNG KHAI.** Lần đo đầu chỉ lấy **3 mã
    trận × 20 phút, mỗi mốc thứ 10** → 0,96% và lệch tối đa **2,01 m**. Người dùng chốt "ghi
    thành nợ có tên" **trên con số ấy**. Mẫu đủ cho **31,72 m** — sai **15 lần**. Đã quay lại
    nêu đúng số, và người dùng đổi quyết định sang "mở task ở spec 007". Bài học: một bất biến
    đo trên **mẫu nhỏ, lấy thưa** thì cực trị gần như chắc chắn bị bỏ sót.
  - 📝 **AC-49.2 đã được THU HẸP (D146).** Mệnh đề "tám hàng" của AC-30.8 sai ở **98,9%** số
    mẫu ở engine liên tục: tiền đạo khách cắm ở `x ≈ 15`, sau lưng hậu vệ nhà (`x ≈ 37`) và qua
    mặt thủ môn nhà (`x ≈ 19`). AC-30.8 vốn được spec 005 kiểm trên bố cục **cổ điển**
    (`hinhSan`) — nguồn vị trí khác hẳn — nên đây không phải lỗi hồi quy của spec 011. AC-49.2
    nay nói điều thật sự đúng và thật sự thuộc spec 011: hai lớp vẽ đứng trên **một** đường đọc.

> ## ✅ Phase 62 ĐÃ XONG ngày 2026-11-26, sau khi `T813` của spec 007 gỡ chặn
> Phase này từng dừng ở T777 vì thủ môn chạy qua vạch giữa sân. `T813` tìm ra nguyên nhân
> thật — `kepDichThuMon` là **mã chết, chưa từng được gọi** — và nối nó vào: **2,06% → 0,06%**,
> **31,72 m → 2,19 m**. Toàn bộ chuỗi T777 → T786 chạy tiếp ngay sau đó.
>
> 📝 **Phase 62 chạm đúng bốn file**, và **không file nào là `San2D.tsx`**:
> `chieuSaBan.ts`, `chieuSaBan.test.ts`, `San3D.tsx`, `batBienSaBan.test.ts`.

- [x] **T778** — Nhóm **hành vi**: tạm dừng thì đóng băng hẳn.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: `dangChay === false` thì **không chạy vòng khung hình nào**, kể cả dao động chờ.
  - Xong khi: tạm dừng giữa một đường bóng, mọi thứ đứng; mở công cụ hiệu năng thấy **không** có khung vẽ nào phát ra khi đang tạm dừng.
  - AC: AC-49.3
  - Phụ thuộc: T777
  - ✅ **Xong 2026-11-26**, đo trên bản chạy: lúc chạy, chuỗi toạ độ của mọi hình **đổi**
    giữa hai lần chụp; lúc tạm dừng, chuỗi ấy **giống hệt** suốt 1,2 giây. Vòng khung hình
    đứng hẳn, không còn dao động chờ nào.
  - 📝 Mã đã đúng từ T767 (`if (!dangChay) return undefined`); task này là **kiểm chứng**,
    không phải sửa. Hiến pháp mục 4 nói test giao diện không bắt buộc — nó được xác nhận
    bằng cách bấm thử, và đây là lần bấm thử ấy.

- [x] **T779** — Nhóm **hành vi**: bóng vẫn có mặt khi tạm dừng và khi hết trận.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: bóng vẽ từ **mốc đang hiển thị**, không từ một trạng thái riêng — nên đóng băng không làm nó mất.
  - Xong khi: tạm dừng giữa một quả tạt, bóng còn **trên không** đúng độ cao của mốc ấy; hết trận, bóng vẫn còn trên sân.
  - AC: AC-49.4
  - Phụ thuộc: T778
  - ✅ **Xong 2026-11-26.** Tạm dừng giữa trận: bóng còn mặt. Chạy hết trận tới phút **91′**:
    bóng **vẫn trên sân**, và vẫn đủ **22** hình người.
  - 📝 Đúng theo cấu trúc chứ không nhờ canh: bóng vẽ từ **mốc đang hiển thị** (`anhChupRef`
    hoặc `chiSoRef` lúc render), không từ một trạng thái riêng — nên đóng băng không thể làm
    nó biến mất.

- [x] **T780** — Nhóm **hành vi**: tôn trọng giảm chuyển động.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: **import `useGiamChuyenDong` từ `src/ui/giamChuyenDong.ts`** (T812) — không nhân bản; không nội suy, không chuyển động chờ, vị trí **và độ cao** tại từng mốc vẫn đúng.
  - Xong khi: bật giảm chuyển động của hệ điều hành, chạy lại — sa bàn nhảy theo mốc, không trôi; độ cao bóng ở mỗi mốc vẫn đúng; `grep -c "matchMedia" src/ui/components/San3D.tsx` = **0** (hook là nguồn duy nhất).
  - AC: AC-49.5
  - Phụ thuộc: T779, **T812**
  - ✅ **Xong 2026-11-26.** `San3D` nay `import { useGiamChuyenDong } from '../giamChuyenDong'`
    — **không nhân bản**, đúng lý do T812 bóc hook ra. Vòng khung hình dừng hẳn khi giảm
    chuyển động bật, cùng một đường với lúc tạm dừng (T778 đã chứng minh đường ấy dừng thật).
  - ✅ File này **không hỏi thẳng trình duyệt** về tuỳ chọn ấy: đếm tên API trong
    `San3D.tsx` ra **0**. Hook là nguồn duy nhất.
  - 📝 Sa bàn **không nội suy** gì cả — nó vẽ thẳng mốc engine phát — nên "không trôi" ở đây
    nghĩa là không chạy vòng, và vị trí **và độ cao** tại từng mốc vẫn đúng.
  - ⚠️ Lần viết đầu, chính câu chú thích của tôi nhắc tên API ấy, nên phép đếm ra **1** thay
    vì 0 — đúng cái bẫy tự quy chiếu đã gặp ở điều kiện RA của T763. Đã sửa câu chữ.

- [x] **T781** — Nhóm **hình**: thêm `phanBietDuoc` và phép kiểm.
  - File: `src/ui/chieuSaBan.ts`, `src/ui/chieuSaBan.test.ts`
  - Nội dung: `phanBietDuoc(a, b, banKinh): boolean`, đo **sau khi chiếu** (đơn vị viewBox), không đo bằng mét trên mặt sân — đó mới là điều AC-30.5 thật sự hứa.
  - Xong khi: phép kiểm xanh ở ba ca biên: trùng khít, cách đúng một bán kính, cách hai bán kính.
  - AC: AC-49.6
  - Phụ thuộc: T780
  - ✅ **Xong 2026-11-26.** `phanBietDuoc(a, b, banKinh)` trong `chieuSaBan.ts`, 5 phép kiểm:
    trùng khít → `false`; cách **đúng một bán kính** → `true` (và nhích vào trong một phần tỉ
    → `false`, để biết biên nằm đúng chỗ); cách hai bán kính → `true`; đo theo **khoảng cách
    thật** chứ không theo từng trục.
  - 📍 **Ngưỡng một bán kính KHÔNG phải con số tôi bịa.** `san2D.test.ts:173` đã dùng đúng nó
    cho AC-15.2 từ spec 002, kèm số đo *"chỗ chật nhất luôn là 1,18 bán kính"*. Dùng lại là
    giữ **một** thước đo cho cả hai lớp vẽ.
  - ✅ Có một phép kiểm nói rõ **vì sao phải đo sau khi chiếu**: hai người cách nhau 3 m theo
    chiều sâu, sau phép chiếu khoảng ấy co lại đúng `×sin 50°`. Đo bằng mét thì thấy họ tách
    nhau; đo trên màn hình thì chưa chắc.

- [ ] **T782** — Nhóm **hình**: tách hai hình sát nhau bằng **viền**, không dịch ai.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: D134. Viền là thuộc tính **thường trực của mọi hình**, không bật/tắt theo trạng thái — **R65**: một viền bật/tắt sẽ bị đọc nhầm thành thẻ, kiệt sức hay sai vị trí.
  - Xong khi: hai cầu thủ đứng khít nhau vẫn **đếm ra hai**; và không một thực thể nào bị dịch — phép kiểm AC-46.5 ở T784 là lưới gác điều đó.
  - AC: AC-49.7
  - Phụ thuộc: T781
  - 🔴 **GỠ TÍCH NGÀY 2026-11-26.** Người dùng xem trọn một trận ở `T760` của spec 007 và
    nói: *"tôi thấy bị đè lên nhau"*. Đo lại: **7,4% số cặp** (19.294/262.185) không phân biệt
    được, **100% số mốc** có ít nhất một cặp đè — và sân 2D cũng thế. Điều kiện ra của task
    này là *"hai cầu thủ đứng khít nhau vẫn đếm ra hai"*, và nó **không đạt**.
    📌 Phần kết luận dưới đây **vẫn đúng** và không bị rút lại: viền là điều kiện **cần**,
    chỉ là không **đủ**. Chữa phải ở `T814` của spec 007.
    ⏳ **`T814` xong 2026-11-26**: 7,27% → **0,041%** số cặp, 100% → **8,8%** số mốc, và
    đĩa chạm mép 9,53% → **0,75%**. Nguyên
    nhân thật là **8 điểm đích cho 22 người**, không phải `tachChen`. Task này **chờ người dùng
    xem lại** (`T760`) — không tự tích lại bằng một phép kiểm.
  - ~~Xong 2026-11-26 — và KHÔNG thêm một dòng mã nào.~~ Viền **đã thường trực** từ T788
    và T799: cả `<circle>` của chủ nhà lẫn `<rect>` của khách đều mang `stroke={n.ao.chu}`
    `strokeWidth={0.3}` **không điều kiện**, và màu viền phái sinh từ chính màu áo qua
    `nenDamBaoTuongPhan` nên nó đạt 4,5:1 với nền của mình.
  - ⛔ **Thêm một viền "tách" bật/tắt chính là thứ R65 cấm.** R65 nói viền là tín hiệu hình
    dễ bị đọc nhầm thành trạng thái cầu thủ; một viền *đôi khi* xuất hiện **là** một tín
    hiệu, dù người viết không định thế. Nên cách đúng ở đây là **không làm gì thêm**, và nói
    ra vì sao — chứ không phải viết thêm mã cho có.
  - ✅ **Không ai bị dịch**, và điều đó có lưới gác: phép kiểm thứ hai của T784 khẳng định
    `viTriMetLienTuc` trả về **đúng** `thucThe[o].x/y`, nên một phép dịch ở lớp vẽ sẽ lộ.

- [x] **T783** — Bóng bị che: `bongBiChe` + bóng vẽ sau cùng + dấu hiệu.
  - File: `src/ui/chieuSaBan.ts`, `src/ui/chieuSaBan.test.ts`, `src/ui/components/San3D.tsx`
  - Nội dung: D135 — bóng vẽ **sau tất cả** nên luôn thấy được, **cộng** một dấu hiệu khi có thực thể nằm trước nó theo độ sâu, để lớp 3D không nói dối về độ sâu.
  - Xong khi: cho một cầu thủ đi ngang trước bóng — bóng vẫn thấy, và có dấu hiệu nói nó ở **phía sau**; phép kiểm `bongBiChe` xanh.
  - AC: AC-46.7
  - Phụ thuộc: T782
  - ✅ **Xong 2026-11-26.** `bongBiChe(bong, cacHinh, banKinh)` cộng 6 phép kiểm, và một
    **vòng nét đứt** quanh quả bóng khi có ai đứng trước nó. Bắt được trên bản chạy sau 15
    mẫu.
  - 📍 "Đứng trước" nghĩa là **gần người xem hơn**, tức `y` vẽ **lớn hơn** — chiều sâu đi lên
    trên màn hình nên gần là ở dưới. Có một phép kiểm riêng cho ca ngược: người ở **xa** hơn
    mà chồng hình thì **không** che.
  - 📍 Nét đứt là kênh **hình**, không phải màu, nên nó đọc được trong ảnh đen trắng (**P9**).
    Bóng vẫn vẽ sau cùng nên vẫn luôn thấy được (**D135**) — dấu hiệu chỉ thêm thông tin
    về độ sâu, không che bóng đi.

- [x] **T784** — **Phép kiểm P5** cho AC-46.5: hai góc nhìn khớp `(x, y)` từng số.
  - File: `src/ui/batBienSaBan.test.ts`
  - Nội dung: cùng một `AnhChupMet` → `(x, y)` mà `San2D` dùng và `(x, y)` mà `San3D` đưa vào `chieuDiem` **bằng nhau từng số**, cho **22 cầu thủ**. Hiến pháp **P5** cấm đánh dấu AC loại này là xong bằng cách xem bằng mắt.
  - ⚠️ **Quả bóng KHÔNG thuộc phép kiểm này** — AC-46.5 đã thu hẹp còn 22 cầu thủ ngày 2026-11-25, và bóng có AC riêng là **AC-46.8** (**D142**). Đưa bóng vào đây sẽ làm phép kiểm đỏ **đúng theo thiết kế**, không phải vì có lỗi.
  - Xong khi: phép kiểm xanh trên ≥ 10 mã trận; và thử thêm một phép dịch nhỏ vào T782 làm nó **đỏ** (đột biến bằng tay, rồi hoàn lại).
  - AC: AC-46.5
  - Phụ thuộc: T783
  - ✅ **Xong 2026-11-26.** Hai phép kiểm **P5** mang đúng tên AC-46.5, trên **10 mã trận**:
    hơn **1.000** lượt so vị trí, mét của lớp 2D và mét của lớp 3D bằng nhau **từng số**.
  - ✅ **Phép thử đột biến**: thêm một phép dịch **5 cm** vào `viTriMetLienTuc` làm nó **đỏ**;
    hoàn lại thì xanh. Nếu một ngày T782 "tách hai hình" bằng cách dịch người thay vì bằng
    viền, phép kiểm này đỏ — đó là lý do nó tồn tại.
  - ⚠️ **Quả bóng KHÔNG thuộc phép kiểm này**, đúng như task dặn: AC-46.5 thu hẹp còn 22 cầu
    thủ, và bóng có AC riêng là **AC-46.8** (**D142**).

- [x] **T785** — **Phép kiểm P5** cho AC-47.5: đổi góc nhìn không đổi một ký tự của trận.
  - File: `src/ui/batBienSaBan.test.ts`
  - Nội dung: cùng mã trận chạy hai lần, lần hai có đổi góc nhìn giữa trận → **diff dòng sự kiện rỗng**, tỉ số bằng nhau. Đây là **P2** được canh bằng phép kiểm.
  - Xong khi: phép kiểm xanh; diff rỗng từng ký tự.
  - AC: AC-47.5
  - Phụ thuộc: T784
  - ✅ **Xong 2026-11-26.** Phép kiểm **P5** cho AC-47.5: cùng mã trận cho **vân tay giống
    hệt**, trên 5 mã trận; cộng một phép chống rỗng khẳng định vân tay không rỗng và dài hơn
    200 ký tự.
  - 📍 Hàm `vanTay` được **nâng lên phạm vi module** để T802 và T785 dùng **cùng một** định
    nghĩa. Hai bản sao của một phép băm là hai thứ sẽ lệch nhau rồi cùng xanh.
  - 📍 Góc nhìn sống ở `tuyChonRepo` (khoá `gocNhinSan` trong store `meta`), và engine
    **không có đường nào** đọc tới đó — `boundaries.test.ts` canh rằng `engine` không import
    `services` lẫn `ui`. Phép kiểm nói điều ấy ra bằng số thay vì bằng lập luận.

- [x] **T786** — Chốt hai bất biến toàn cục của phase.
  - File: — (chỉ chạy lệnh)
  - Xong khi: `npx vitest run` xanh với **≥ 1.733** phép kiểm (AC-49.8); `git diff --stat src/engine` **rỗng** (AC-49.9); và `San2D.tsx` **không đổi thêm một dòng nào so với sau T812** — Phase 62 không được chạm sân 2D. ⚠️ Mốc so là **sau T812**, không phải nền đo `5265d37`: T812 đã bóc hook giảm chuyển động ra khỏi file ấy (**D143**).
  - AC: AC-49.8, AC-49.9
  - Phụ thuộc: T785
  - ✅ **Xong 2026-11-26.** `npx vitest run`: **86 file / 1.825 phép kiểm xanh** (nền 1.733).
    `git diff --stat src/engine` **rỗng**.
  - ✅ **Phase 62 không chạm `San2D.tsx`**: nó sửa đúng bốn file — `chieuSaBan.ts`,
    `chieuSaBan.test.ts`, `San3D.tsx`, `batBienSaBan.test.ts`.
  - ⚠️ **Mốc so của điều kiện RA này đã lạc hậu, và đó là do thứ tự chạy.** Task viết "`San2D`
    không đổi thêm một dòng nào **so với sau T812**". Nhưng Phase 62 bị chặn nên Phase 63–65
    chạy trước, và **T799 của Phase 65 có quyền sửa `San2D`** — nó trả hai món nợ tương phản.
    Mệnh đề còn đúng là mệnh đề mà điều kiện ấy muốn nói: **Phase 62 không chạm sân 2D**, và
    đó là điều đã kiểm ở trên.

---

## Phase 63 — Lát 3: đọc được

- [x] **T787** — Số áo là **lớp phủ cỡ cố định**.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: D140 — `<text>` cỡ cố định trong hệ viewBox, **không co theo độ sâu**, luôn quay mặt về người xem. Chữ co theo độ sâu sẽ làm **AC-15.1 (đếm được điểm) hỏng ở nửa sân**.
  - Xong khi: số áo ở đầu xa đọc được **bằng** số áo ở đầu gần; đếm đủ 22 số.
  - AC: AC-50.6
  - Phụ thuộc: T786
  - ✅ **Xong 2026-11-25.** Đo trên DOM bản chạy: **22 số áo**, và `font-size` chỉ có **đúng
    một giá trị** (`2.8`) trên cả 22 — tức không co theo độ sâu, số ở đầu xa đọc được bằng số
    ở đầu gần.
  - 📝 Số áo vẽ **cùng nhóm** với hình của chính nó chứ không gom thành một lớp phủ trên cùng:
    gom lên trên thì số của người ở đầu **xa** sẽ đè lên đĩa của người ở đầu **gần**, tức lớp
    3D nói dối về độ sâu.
  - ⚠️ **Phụ thuộc T786 là một CỔNG, không phải nguồn.** T786 chỉ chạy lệnh (suite xanh, engine
    rỗng, San2D không đổi); không nội dung nào của Phase 63 cần kết quả của T778–T785. Nên
    Phase 63 chạy được trong khi Phase 62 còn dừng. Ghi ra để người đọc sau không tưởng đây là
    một phụ thuộc bị bỏ qua.

- [x] **T788** — Hai đội phân biệt bằng **thêm một kênh ngoài màu**.
  - File: `src/ui/components/San3D.tsx`
  - Nội dung: hình dạng hoặc hoa văn khác nhau, đủ đọc trong ảnh đen trắng (P9: "không chỉ dựa màu"). Màu áo vẫn đi qua `src/ui/mauAo.ts` đang lo tương phản.
  - Xong khi: chụp màn hình, chuyển đen trắng — vẫn nói được đội nào là đội nào.
  - AC: AC-50.3
  - Phụ thuộc: T787
  - ✅ **Xong 2026-11-25.** Chủ nhà là **đĩa tròn**, đội khách là **hình vuông bo góc**. Đo:
    11 `<circle>` + 11 `<rect>`, và hai hình **cùng diện tích 21,24** đơn vị² (`a = r·√π`) nên
    không đội nào "nặng" hơn trên màn hình.
  - 📝 Chọn **hình dạng** chứ không hoa văn: hoa văn chiếm đúng chỗ mà số áo cần, còn hình dạng
    chừa trống giữa. Và cùng diện tích thì `phanBietDuoc` (T781) đo bằng bán kính vẫn đúng.

- [x] **T789** — Tóm tắt cho trình đọc màn hình.
  - File: `src/ui/components/San3D.tsx`, `src/ui/ngonNgu/`
  - Nội dung: `San3D` tự giới thiệu được nó là gì và đang hiển thị gì ở mức tóm tắt, theo khuôn `moTaDiem` của `San2D`. Chuỗi đủ hai bản Việt–Anh trong cùng commit.
  - Xong khi: trình đọc màn hình **không im lặng** khi gặp sa bàn; `npx vitest run src/ui/ngonNgu` xanh.
  - AC: AC-50.5
  - Phụ thuộc: T788
  - ✅ **Xong 2026-11-25.** Đo `aria-label` trên bản chạy, cả hai ngôn ngữ.
  - 🔴 **Bắt được một lỗi khi làm task này:** `San3D` đang mượn `moTaSan` của sân 2D, mà câu ấy
    mở đầu bằng **"Sân 2D: …"** — trình đọc màn hình sẽ nói "Sân 2D" trong khi người dùng đang
    ở sa bàn. Đã thay bằng `moTaSaBan` + `tomTatSaBan` riêng.
  - 📝 Gộp vào **một** `aria-label` chứ không dựng vùng `aria-live`: sa bàn đổi 60 lần một
    giây, và một vùng sống sẽ đọc liên tục không ngớt.

- [x] **T790** — Đo tương phản của lớp 3D ở **cả hai** chủ đề.
  - File: `src/ui/theme.test.ts`
  - Nội dung: thêm cặp màu của sa bàn vào bảng `CAP` đang có; đo trên **cả** khối `:root` và `:root[data-che-do='toi']` như file ấy đang làm.
  - Xong khi: mọi chữ đạt **≥ 4,5:1** ở cả hai chủ đề; phép kiểm xanh.
  - AC: AC-50.2
  - Phụ thuộc: T789
  - ✅ **Xong 2026-11-25**, `theme.test.ts` đi từ 60 lên **66 phép kiểm**. Sa bàn **không thêm
    một biến màu nào** — nó dùng lại đúng nhóm `co-*` của sân 2D.
  - 🔴 **Bắt được một lỗi của chính spec 011, và một con số KHÔNG DỰNG NỔI.** Dấu chiếu quả
    bóng vẽ bằng `rgba(0,0,0,0.35)` đo ra **1,50:1** trên mặt cỏ — gần như vô hình. Và không
    thể chữa bằng cách làm đậm hơn: **đen tuyền** trên mặt cỏ ấy cũng chỉ đạt **2,99:1**, tức
    **mọi** vệt tối đều dưới ngưỡng 3:1 của WCAG cho thành phần phi văn bản.
    AC-46.2 gọi nó là **"dấu chiếu"**, không phải bóng đổ vật lý — nên nó được phép **sáng**.
    Đổi thành vòng **rỗng ruột** viền `--co-vien` (biến đã có): **4,34:1**. Rỗng ruột để không
    bị nhầm thành quả bóng thứ hai. Phép kiểm ghim luôn cả trần 2,99:1 để không ai "sửa lại cho
    giống bóng đổ thật".
  - ⚠️ **HAI MÓN NỢ CÓ TÊN, và chúng KHÔNG do spec 011 gây ra** — cả hai là chuỗi/hàm mà
    `San2D` đang dùng y hệt, sa bàn chỉ **kế thừa**:
    - vạch sân `rgba(255,255,255,0.45)` trên mặt cỏ → **2,72:1** (ngưỡng hình 3:1)
    - số áo chọn bằng `mauChuTuongPhan` trên `#0077DD` → **4,48:1** (ngưỡng chữ 4,5:1)

    Không sửa ở đây vì sửa là đổi diện mạo `San2D` — thuộc **Phase 65**; và chỉ đổi màu áo
    riêng cho sa bàn sẽ làm **hai góc nhìn vẽ cùng một đội bằng hai sắc khác nhau**, một lỗi
    nặng hơn 0,4% tương phản. Hai phép kiểm được viết thành **bánh cóc**: chúng khẳng định con
    số hiện **chưa đạt**, và sẽ đỏ nếu nó xấu đi — không giả vờ rằng ngưỡng đã đạt.
    📌 Đường thoát đã có sẵn trong repo (`nenDamBaoTuongPhan`) và phép kiểm chỉ thẳng vào nó.

- [x] **T791** — Chốt `HE_SO_CAO` có đúng một chỗ, và nói được cho người dùng.
  - File: `src/ui/chieuSaBan.test.ts`, trang xem trận
  - Nội dung: phép kiểm đếm số chỗ `HE_SO_CAO` xuất hiện trong `src/` = **1**; giao diện mang nhãn T773 nói độ cao đã được phóng đại — để không ai tưởng sa bàn đúng tỉ lệ cả ba trục.
  - Xong khi: phép kiểm xanh; nhãn nhìn thấy được trên màn hình, cả hai ngôn ngữ.
  - AC: AC-46.6
  - Phụ thuộc: T790
  - ✅ **Xong 2026-11-25.** 4 phép kiểm mới đọc **nguồn thật** bằng `import.meta.glob` + `?raw`
    (khuôn `coHoc.test.ts`): chỉ `chieuSaBan.ts` gán `HE_SO_CAO`, và chỉ gán **một lần**; cộng
    một phép **chống rỗng** (đọc được > 50 file).
  - 📝 Phép kiểm thứ tư canh một lỗ mà ba phép trên không thấy: **hai tệp ngôn ngữ không được
    viết thẳng "×3"**. `doCaoDaPhongDai` nhận hệ số bằng tham số, nên hằng vẫn ở đúng một chỗ.
    Phải bóc chú thích trước khi so — lần chạy đầu nó bắt đúng câu chú thích dặn *đừng* viết ×3.
  - ✅ Nhãn hiện trên màn hình ở **cả hai** ngôn ngữ: *"Độ cao của bóng đã được phóng đại ×3…"*
    và *"Ball height is exaggerated ×3…"*; nút đọc "View: Diorama" khi đổi sang tiếng Anh.

---

## Phase 64 — Lát 4: hệ thống thiết kế

> ⚠️ **Thứ tự trong phase này là quan trọng: phép kiểm trước, chỉnh màu sau.** **R63** nói
> chỉnh 42 biến màu theo trần bão hoà có thể làm vỡ tương phản ở một cặp chưa được phủ. Nên
> T795 (phép kiểm) đi **trước** T796 (chỉnh biến), không ngược.

- [x] **T792** — Viết bảng màu của hệ thống thiết kế, bốn cột.
  - File: `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md` (**mới**)
  - Nội dung: mỗi màu có **tên · giá trị · nghĩa · chỗ được phép dùng**. Một màu thiếu một trong bốn thứ là một dòng chưa xong. Dùng **42 biến đang có** của spec 003, không thay bảng (quyết định 10 của `spec.md` mục 10).
  - Xong khi: mọi biến màu trong `src/index.css` có một dòng trong bảng, đủ bốn cột.
  - AC: AC-48.1
  - Phụ thuộc: T763
  - ✅ **Xong 2026-11-25.** `he-thong-thiet-ke.md`, **42/42 biến** đều có một dòng đủ bốn cột.
    Kiểm bằng máy: không biến nào trong `src/index.css` thiếu dòng, và **cả hai** cột giá trị
    (sáng và tối) khớp từng ký tự với file.
  - ⚠️ **Bản đầu tôi viết 18 trên 42 giá trị chế độ tối SAI** — viết từ trí nhớ thay vì đọc
    `src/index.css`. Đúng loại lỗi mà tài liệu này sinh ra để chặn. Đã sinh lại cột ấy thẳng
    từ file và kiểm lại bằng máy.

- [x] **T793** [P] — Viết trần bão hoà hai tầng và ba thang.
  - File: `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md`
  - Nội dung: tầng **thế giới** và tầng **tín hiệu** với ngưỡng bão hoà của từng tầng, cộng thang **cỡ chữ**, thang **khoảng cách**, thang **độ dày đường kẻ** — mỗi thang là một danh sách bậc hữu hạn.
  - Xong khi: mỗi thang có số bậc đếm được và một ví dụ dùng cho từng bậc.
  - AC: AC-48.6
  - Phụ thuộc: T792
  - ✅ **Xong 2026-11-25.** Trần hai tầng + ba thang, mỗi bậc kèm **số chỗ dùng thật** đếm
    bằng máy — nên "ngoài thang" là một danh sách việc có thật, không phải lời than chung.
  - 🔴 **Trần TUYỆT ĐỐI của khuôn mẫu KHÔNG áp được vào repo này.** Art-bible đặt *thế giới
    ≤65% S, tín hiệu ≥75% S*. Áp nguyên thì thứ vượt trần nặng nhất là **chính mặt cỏ**
    (`--co-nen-dam`, **S = 88**), và `--co-o` (80), `--co-nen` (66), `--chinh-dam` (71) cũng
    vượt; ngược lại hai biến tín hiệu `--loi-chu` (73) và `--tot-chu` (68) lại **thiếu** sàn.
    Hạ mặt cỏ để chiều một con số mượn từ một trò chơi Unity có bảng màu khác hẳn là làm hỏng
    thứ đang đúng — và người dùng đã chốt **"chỉ lấy phương pháp"** (quyết định 10).
    Trần ở đây vì thế phát biểu **tương đối theo vùng**: *trang trí rực nhất ≤ tín hiệu nhạt
    nhất*, đúng điều `spec.md` mục 1 nêu.

- [x] **T794** [P] — Viết bảng cặp màu dễ lẫn kèm cue phụ bắt buộc.
  - File: `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md`
  - Nội dung: mỗi dòng ghi **lẫn với kiểu mù màu nào** và **cue phụ bắt buộc** (hình dạng, chuyển động, icon hoặc chữ). Phải có một dòng cho **viền của T782**, vì **R65** nói viền là một tín hiệu hình dễ bị đọc nhầm thành trạng thái cầu thủ.
  - Xong khi: mỗi cặp màu mang nghĩa trong bảng T792 mà sát nhau đều có một dòng; dòng viền có mặt.
  - AC: AC-48.4
  - Phụ thuộc: T792
  - ✅ **Xong 2026-11-25.** Bảng 7 dòng, mỗi dòng ghi **kiểu mù màu** cụ thể và **cue phụ bắt
    buộc**. Dòng 7 là viền của T782, với ba ràng buộc mà **R65** đòi: viền phải **thường
    trực**, phải dùng màu **phái sinh từ màu áo** (không dùng biến mang nghĩa nào), và mọi
    trạng thái thật của cầu thủ phải dùng kênh **khác** viền hình.

- [x] **T795** — Thêm hàm **độ bão hoà** và phép kiểm trần hai tầng — **trước khi chỉnh màu**.
  - File: `src/ui/theme.test.ts`
  - Nội dung: `theme.test.ts` **đã có** hàm `sacMau`, nhưng đó là **sắc màu (hue)**, không phải bão hoà — cần một hàm mới. Rồi hai phép kiểm: biến tầng **tín hiệu** không được xuất hiện ở nhóm biến nền/trang trí (AC-48.2); và bão hoà của nhóm **thông tin** cao hơn nhóm **trang trí** (AC-48.3).
  - Xong khi: phép kiểm chạy được và **đỏ đúng chỗ** nếu có biến vượt trần — tức nó đo thật, không tự trấn an. Liệt ra danh sách biến đang vượt trần để T796 có việc cụ thể.
  - AC: AC-48.2, AC-48.3
  - Phụ thuộc: T793, T794
  - ✅ **Xong 2026-11-25.** `theme.test.ts` đi từ 66 lên **75 phép kiểm**. Thêm `doBaoHoa` và
    `doSang` — file đã có `sacMau` nhưng đó là **sắc màu**, không phải bão hoà.
  - ✅ **Đỏ đúng chỗ, chứng minh bằng ba đột biến** rồi hoàn lại xanh: làm `--nen-nhan` rực
    lên S=71 (1 đỏ) · làm `--co-o` rực lên S=100 (1 đỏ) · làm `--co-vang` nhạt đi S=35 (3 đỏ).
  - 🔴 **Hai phát hiện trong lúc làm, cả hai được ghi chứ không nuốt:**
    1. **Ba màu mức lệch không tách nhau bằng độ sáng**: `sai-nhe` ↔ `sai-vua` chỉ **4** điểm,
       `sai-vua` ↔ `sai-nang` **10** — dưới hẳn ngưỡng 15 của TT-3. Dưới mù màu đỏ-lục chúng
       về ba sắc xám gần nhau. **Không sửa, và không phải vì ngại:** ba màu ấy chỉ dùng ở
       `OViTri.tsx` — **màn hình chiến thuật**, ngoài phạm vi quyết định 10. P9 không vỡ hôm
       nay vì cue phụ bắt buộc đã có và là **chữ** (`MUC_SAI_VI_TRI`).
    2. `--co-chu` (quả bóng) và `--co-vien` (vạch sân) cách nhau **0** điểm độ sáng — cả hai
       là trắng. Cue bắt buộc là **hình**: bóng có viền tối và nhỏ hơn đĩa người, dấu chiếu là
       vòng rỗng ruột.

    Cả hai viết thành **bánh cóc**: chốt con số hiện tại, đỏ nếu xấu đi, không giả vờ đã đạt.
  - 📝 Tôi đã chọn **một cặp sai** lúc đầu (`co-nhan-chu` vs `co-vang`, 13 điểm) rồi bỏ: hai
    thứ ấy **không bao giờ chạm nhau** trên màn hình, nên TT-3 không áp cho chúng.

- [x] **T796** — Chỉnh biến vượt trần, và **đo lại tương phản trong cùng commit**.
  - File: `src/index.css`
  - Nội dung: chỉnh đúng danh sách T795 liệt ra. **R63**: chỉnh màu mà không đo lại là cách vỡ P9 ở một màn hình không ai nhìn tới.
  - Xong khi: T795 xanh; **và** ba khối đang có của `theme.test.ts` (bảng màu 4,5:1, chữ trên mặt cỏ, màu áo người dùng chọn) **vẫn xanh** ở cả hai chủ đề — trong cùng commit.
  - AC: AC-48.8
  - Phụ thuộc: T795
  - ✅ **Xong 2026-11-25 — và danh sách T795 liệt ra là RỖNG.** `git diff src/index.css`
    **rỗng**: không biến nào vượt TT-1.
  - 📍 Đây là một kết quả, không phải một task bị bỏ. Một khi trần được định nghĩa theo **vai
    trò** (như chính `spec.md` mục 1 đòi) thay vì theo con số tuyệt đối nhập khẩu, repo **đã
    thoả sẵn**: vùng giao diện có trang trí rực nhất 33 (`--lop-phu`) ≤ tín hiệu nhạt nhất 40
    (`--tot-nen`); vùng mặt cỏ có 80 (`--co-o`) ≤ 94 (`--co-noi-bat`). Trần tuyệt đối của
    khuôn mẫu thì đã bắt tôi **hạ bão hoà của mặt cỏ** — xem T793.
  - ✅ **R63 vẫn được tôn trọng**: ba khối tương phản đang có của `theme.test.ts` xanh, và
    chúng xanh vì không có gì để chỉnh, chứ không phải vì không ai đo.

- [x] **T797** — Áp ba thang vào màn hình xem trận.
  - File: `src/ui/pages/TrangTran.tsx` và các component nó render
  - Nội dung: cỡ chữ, khoảng cách và độ dày đường kẻ dùng **bậc trong thang** (lớp Tailwind), không số rời.
  - Xong khi: `grep` trên các file đã chạm không còn giá trị khoảng cách/cỡ chữ tuỳ ý ngoài thang; màn hình nhìn không lệch.
  - AC: AC-48.6
  - Phụ thuộc: T796
  - ✅ **Xong 2026-11-25.** Trong **10 file** của màn hình xem trận, số chỗ ngoài thang nay là
    **0**. Hai chỗ đã sửa: `mt-5` → `mt-4` (`BaoCaoSauTran.tsx`) và `space-y-5` → `space-y-4`
    (`ChiThiDoi.tsx`). 14 chỗ `*-5/8/10` còn lại nằm ở màn hình khác, ngoài phạm vi.
  - 🔴 **THANG CỦA TÔI SAI, KHÔNG PHẢI MÃ.** T793 viết thang cỡ chữ **5 bậc** và gọi
    `text-3xl` là "ngoài thang". Đi xem nó nằm ở đâu thì đó chính là **tỉ số trận đấu**
    (`TrangTran.tsx:379`) — thứ đáng to nhất màn hình. Và `text-xl` là chữ trong **khung đại
    diện** cỡ `lon`, thuộc một thang con gắn với cỡ hộp. Thang đã sửa thành **6 bậc** cộng một
    thang con ba bậc.
    📌 Bài học đã ghi vào tài liệu: **đếm số chỗ dùng rồi gọi cái hiếm là ngoại lệ là một cách
    sai** — thứ hiếm nhất ở đây lại là thứ quan trọng nhất.

- [x] **T798** — Kiểm thủ công đen trắng cho màn hình xem trận.
  - File: — (kiểm thủ công, ghi kết quả vào task)
  - Xong khi: chụp màn hình xem trận, chuyển đen trắng, vẫn đọc được **tỉ số, ai giữ bóng, đội nào là đội nào, phút mấy**. Ghi lại ảnh hoặc câu kết luận.
  - AC: AC-48.5
  - Phụ thuộc: T797
  - ✅ **Xong 2026-11-25.** Đổ `grayscale(1)` lên cả trang rồi **đo tỉ lệ tương phản xám**
    của bốn thứ mà task đòi, thay vì phán bằng mắt:

    | Thứ cần đọc được | Tương phản xám | Ngưỡng |
    |---|---|---|
    | Tỉ số `0 – 0` | **15,81:1** | 4,5 |
    | Tên hai đội | **15,81:1** | 4,5 |
    | Phút `32'` | **7,32:1** | 4,5 |
    | Dòng tường thuật (ai giữ bóng) | **7,32:1** | 4,5 |

  - ✅ **"Đội nào là đội nào" trên sân không dựa vào tương phản chữ mà dựa vào HÌNH DẠNG**
    (T788). Ảnh xám chụp lúc 40′ cho thấy một **đĩa tròn số 68 chồng lên một ô vuông bo góc** —
    phân biệt được khi đã mất sạch màu.

---

## Phase 65 — Lát 5: diện mạo sân 2D và thứ bậc

> ⛔ **Đây là phase khó lùi nhất, và đó là lý do nó đi gần cuối.** `San2D.tsx` là **2.370
> dòng** và là chủ sở hữu hàng chục AC đã đóng của spec 002, 004, 005, 006. **R64**: lát này
> trượt từ "làm đẹp lại" sang "làm lại" là phá bốn spec. Chỉ được chạm **giá trị màu, độ dày,
> kiểu** — **không một công thức nào**.

- [x] **T799** — Chỉnh diện mạo sân 2D theo thang của hệ thống thiết kế.
  - File: `src/ui/components/San2D.tsx`, `src/index.css`
  - Nội dung: màu cỏ, độ dày vạch sân, màu áo hai đội, kiểu điểm cầu thủ — lấy **giá trị** từ thang T793. Không chạm một công thức nào.
  - Xong khi: sân 2D nhìn khác và hợp hệ thống; `npx vitest run` xanh với ≥ 1.733 phép kiểm.
  - AC: AC-53.1
  - Phụ thuộc: T798
  - ✅ **Xong 2026-11-25.** Nội dung thật của task này hoá ra là **trả hai món nợ mà T790 đã
    ghi tên và giao cho phase này**, chứ không phải "làm đẹp lại" chung chung:
    - vạch sân `rgba(255,255,255,0.45)` → **`0.55`**: tương phản **2,72 → 3,30:1**, đạt ngưỡng
      hình 3:1.
    - số áo đi qua **`nenDamBaoTuongPhan`** thay vì `mauChuTuongPhan`: `#0077DD` **4,48 →
      4,89:1**, đạt ngưỡng chữ 4,5. Hàm ấy đã có sẵn trong repo từ spec 001 cho đúng bài toán
      này — `San2D` chỉ là chưa từng gọi.
    - `strokeWidth={0.35 * tiLe}` → `0.3 * tiLe`, về đúng bậc 1 của thang nét SVG.
  - 📍 **Giá của việc trả nợ, đo trước khi làm:** trên bảng tám màu áo thử, **bảy màu không
    đổi một chút nào**; chỉ `#0077DD` dịch **5%** thành `#0071d2`. Sắc màu giữ nguyên — thứ
    người xem dùng để nhận ra đội bóng.
  - ⚠️ **`San3D.tsx` sửa CÙNG LÚC, dù nó không có trong danh sách file của task.** Để một
    mình sân 2D đổi là làm **hai góc nhìn vẽ cùng một đội và cùng một mặt sân bằng hai sắc
    khác nhau** — đúng thứ mà T790 đã nêu là lý do *không* sửa riêng cho sa bàn lúc ấy.
  - ✅ **R64 được giữ:** chỉ chạm **giá trị màu và độ dày**. Không một công thức nào đổi —
    xem T800 và T802.

- [x] **T800** — Chốt **năm hằng** của sân 2D giữ nguyên giá trị.
  - File: — (chỉ soát)
  - Xong khi: `BAN_KINH` = **2.6**, `BUOC_GIAN` = **8**, `PHI_THEM_NGUOI_GHI_BAN` (công thức nguyên văn), `NHIP_TOI_THIEU_DE_NOI_SUY` = **40**, `TI_LE_KIP` = **0.9** — cả năm **không đổi một chữ số**; `npx vitest run src/ui/san2D.test.ts src/ui/viTriVe.test.ts src/ui/noiSuy.test.ts` xanh.
  - AC: AC-53.2
  - Phụ thuộc: T799
  - ✅ **Xong 2026-11-25.** Năm hằng nguyên vẹn: `BAN_KINH = 2.6` · `BUOC_GIAN = 8` ·
    `TI_LE_KIP = 0.9` · `NHIP_TOI_THIEU_DE_NOI_SUY = 40` · `PHI_THEM_NGUOI_GHI_BAN =
    ((BUOC_GIAN / 2 - BAN_KINH) * 3) / 4`. Soát bằng máy: `git diff 5265d37..HEAD` **không có
    một dòng nào** chạm năm hằng ấy, suốt cả spec 011.
  - ✅ `san2D.test.ts` + `viTriVe.test.ts` + `noiSuy.test.ts`: **113 phép kiểm xanh**.
  - 📍 Trong số đó có *"thủ môn không rời một phần ba sân nhà"* trên **10 mã trận × 7 quân
    số** — và nó **XANH**. Đó là xác nhận độc lập rằng lỗi thủ môn của T777 thuộc riêng
    **engine liên tục** của spec 007, không phải một lỗi chung của lớp vẽ.

- [x] **T801** — Đo lại tương phản sau khi chỉnh diện mạo sân 2D.
  - File: `src/ui/theme.test.ts`
  - Nội dung: hai khối đang có — "chữ trên mặt cỏ đọc được" và "màu áo người dùng chọn không bị theme nuốt" — phải còn xanh với màu cỏ và màu áo mới.
  - Xong khi: cả hai khối xanh ở **cả hai** chủ đề; số áo trên sân 2D vẫn đếm được và đọc được như trước (AC-15.1).
  - AC: AC-53.3
  - Phụ thuộc: T800
  - ✅ **Xong 2026-11-25.** `theme.test.ts` đi từ 75 lên **78 phép kiểm**, và hai **bánh cóc**
    của T790 đã được **lật thành ngưỡng thật** — vì nợ đã trả ở T799, không phải vì ai hạ
    ngưỡng.
  - ✅ Mỗi ngưỡng mới đi kèm một phép kiểm khẳng định **giá trị CŨ thì không đạt**, để biết
    phép kiểm đo thật chứ không xanh sẵn. Cộng một phép khẳng định **bảy trên tám** màu áo
    không bị dịch — giá của việc trả nợ được ghi bằng số, không bằng lời.

- [x] **T802** — **Phép kiểm P5** cho AC-53.4: diện mạo mới không đổi một con số của trận.
  - File: `src/ui/batBienSaBan.test.ts`
  - Nội dung: cùng mã trận, chạy trước và sau khi chỉnh diện mạo → **diff dòng sự kiện rỗng**, tỉ số bằng nhau. P2 được canh bằng phép kiểm, không bằng mắt.
  - Xong khi: phép kiểm xanh trên ≥ 10 mã trận; diff rỗng từng ký tự.
  - AC: AC-53.4
  - Phụ thuộc: T801
  - ✅ **Xong 2026-11-25.** Lời chứng đi bằng **hai chân**, và chân thứ nhất mạnh hơn phép
    kiểm: `git diff 5265d37..HEAD -- src/engine` **RỖNG** suốt cả spec 011, và
    `boundaries.test.ts` canh rằng engine không import một thứ gì của `ui`. Một thay đổi ở
    `San2D.tsx` vì thế **không có đường nào** chạm tới dòng sự kiện. Đó là lý do **cấu trúc**.
  - ✅ Chân thứ hai: vân tay của 10 mã trận (tỉ số + từng dòng sự kiện gồm phút, cờ bù giờ,
    loại, bên, danh sách cầu thủ) được **ghim thành tổng kiểm**. Nó không bắt được quá khứ,
    nhưng bắt được **lần sau** — đúng **R64**.
  - 🔴 **Bản đầu của vân tay đọc `e.ben`, một trường KHÔNG TỒN TẠI trên `SuKien`** (đúng tên
    là `doi`). Mảnh ấy luôn rỗng nên vân tay yếu đi hẳn một bậc — **mà phép kiểm vẫn xanh**.
    `tsc` bắt được; `vitest` thì không, vì nó không kiểm kiểu. Bài học: một phép kiểm chạy
    xanh **không** chứng minh nó đang đo thứ nó nói.

- [x] **T803** — Dựng thứ bậc cho màn hình xem trận.
  - File: `src/ui/pages/TrangTran.tsx`
  - Nội dung: một khối **chính**, các khối phụ **lùi lại** — người dùng nói năm khối (sân, dòng tường thuật, bảng điểm, điều khiển, danh sách ghi bàn) đang ngang hàng nên "mắt không biết nhìn đâu trước".
  - Xong khi: nhìn vào màn hình, đọc ra ngay cái gì là chính; và điều đó đúng ở **cả hai** góc nhìn.
  - AC: AC-48.7
  - Phụ thuộc: T802, **T791** — "đúng ở cả hai góc nhìn" không kiểm được khi sa bàn chưa có số áo và chưa đo tương phản
  - ✅ **Xong 2026-11-25.** Chỗ hỏng hoá ra rất cụ thể: **khối sân là khối DUY NHẤT không có
    khung**, trong khi báo cáo sau trận và thay người đều nằm trong thẻ có viền. Thứ chính của
    một màn hình xem trận lại là thứ nhẹ nhất trên màn hình.
  - ✅ Sửa bằng đúng **bậc của thang**, không bằng số rời: khung `border-2 border-vien-dam`
    (**bậc 2**, thang dành bậc ấy cho "viền nhấn mạnh") và tiêu đề `text-lg` (**bậc 4**).
    Đo trên bản chạy: khối sân có viền **2px**, bốn khối phụ có **0px hoặc 1px** — khối sân là
    khối **duy nhất** mang dấu chính.
  - ✅ **Đúng ở cả hai góc nhìn**: đo lại sau khi đổi sang sân phẳng cho **kết quả giống hệt
    từng thuộc tính** (viền, màu viền, nền, cỡ tiêu đề). Thứ bậc nằm ở khối bọc, nên nó không
    phụ thuộc lớp vẽ bên trong.
  - 📝 **Hai khối phụ vẫn dùng cùng bậc cỡ chữ với khối sân** (`DongTuongThuat` và `ChiThiDoi`
    đều `text-lg`). Không hạ chúng, và lý do là **phạm vi**: cả hai còn được
    `TrangChienThuat.tsx` và `TrangLichSu.tsx` dùng, nên hạ cỡ ở đây là đổi hai màn hình khác
    — ngoài quyết định 10. Thứ bậc vẫn đọc được vì **độ dày viền** là kênh riêng của khối sân.

---

## Phase 66 — Lát 6: đo và ghi số

> *Mọi task phase này xong khi có **số thật** ghi vào file này — không có lời khẳng định suông.*
> Spec 005 và 006 đã làm đúng cách ấy, và plan mục 7 nhắc lại.

- [ ] **T804** — Đo khung/giây ở **CẢ NĂM MỨC TỐC ĐỘ**.
  - File: ghi số vào `tasks.md` này
  - Nội dung: `rat-cham` 4000ms · `cham` 2000 · `thuong` 1000 · `nhanh` 200 · `rat-nhanh` 20. ⚠️ **`rat-nhanh` là mức quan trọng nhất của task này**: nó nằm dưới `NHIP_TOI_THIEU_DE_NOI_SUY = 40` nên không có nội suy, mốc tới dày nhất, và **R62** xếp nó là mức dễ vỡ ngân sách nhất. Đây cũng là mức mà bản Clarified của spec đã **bỏ sót** khi viết "bốn mức".
  - Xong khi: **năm** con số khung/giây, mỗi mức đạt **59**; và thân hàm khung hình lớn nhất được ghi ra, như spec 005 đã ghi.
  - AC: AC-51.1
  - Phụ thuộc: T803, **T791** — AC-51.1 đo "kể cả khi 22 lớp phủ số áo cùng được vẽ", nên số áo (T787) phải có trước phép đo, không sau
  - ⏸ **KHÔNG ĐO ĐƯỢC — cùng gốc với T775, và lần này có bằng chứng dứt khoát.**
    Khung xem trình duyệt của phiên này không được vẽ ở nhịp thật. Trần đo được là **~30
    fps** cho **cả hai** lớp vẽ (sa bàn cao nhất 30,4 · sân 2D cao nhất 30,2), nên ngưỡng
    **59** của AC-51.1 không thể xác nhận ở đây dù mã có nhanh đến đâu.
  - 🔬 **Bằng chứng rằng giới hạn là MÔI TRƯỜNG chứ không phải ứng dụng:** đo 4 giây cho mỗi
    lớp, `PerformanceObserver` bắt **0 tác vụ dài** ở cả hai — trong khi khoảng cách giữa hai
    khung dài nhất lên tới **1.016 ms** và chỉ có **5 khung trong 4 giây**. Hai điều ấy cùng
    lúc chỉ có một cách giải thích: trình duyệt **không lên lịch** khung. Nếu ứng dụng làm gì
    lâu thì đã có tác vụ dài.
  - 📊 Số đo xen kẽ 6 lượt, cửa sổ 800 ms, luôn kèm đối chứng sân 2D ở cùng điều kiện:
    sa bàn `30,4 · 12,3 · 12,0 · 12,1 · 12,2 · 10,8` (trung bình **15,0**) ·
    sân 2D `30,1 · 30,1 · 13,9 · 30,0 · 30,2 · 30,1` (trung bình **27,4**).
    ⚠️ **Không kết luận "sa bàn chậm bằng nửa sân 2D" từ bộ số này.** Lịch khung ở đây thất
    thường tới mức có lúc 1 khung/giây **với 0 tác vụ dài**, nên chênh lệch trung bình rất có
    thể là nhiễu lịch chứ không phải chi phí vẽ. Nó **đáng nghi** và đáng đo lại ở môi trường
    thật — ghi ra đúng mức ấy, không hơn.
  - ⚠️ Đây là **cảnh báo cho R62**. Phải chạy lại khi khung xem trình duyệt đang hiện và
    được vẽ ở nhịp thật. Nếu lúc ấy vỡ ngân sách thì **D132 phải mở lại** và phải **hỏi người
    dùng**, không tự hạ ngưỡng.

- [x] **T805** — Đo không tác vụ nào quá 50 ms.
  - File: ghi số vào `tasks.md` này
  - Xong khi: số tác vụ vượt 50 ms = **0**, đo ở cả năm mức; ghi tác vụ dài nhất.
  - AC: AC-51.2
  - Phụ thuộc: T804
  - ✅ **Xong 2026-11-26 — và đây là phép đo DUY NHẤT của nhóm hiệu năng không phụ thuộc nhịp
    khung.** `PerformanceObserver` với `entryTypes: ['longtask']` đo 4 giây mỗi lớp:
    **0 tác vụ vượt 50 ms** ở sa bàn, **0** ở sân 2D. Tác vụ dài nhất: **không có**.
  - 📍 Chính vì nó không phụ thuộc tiết lưu nên nó vừa thoả AC-51.2, vừa là **bằng chứng** mà
    T804 dùng để nói giới hạn nằm ở môi trường: một trang chỉ vẽ 5 khung trong 4 giây **mà
    không có một tác vụ dài nào** thì ứng dụng không phải thủ phạm.

- [x] **T806** — Đo chạy hết một trận ở sa bàn.
  - File: ghi số vào `tasks.md` này
  - Xong khi: một con số **< 3 giây** ở mức nhanh nhất — đúng ràng buộc hiến pháp mục 3 ("Giả lập trọn một trận ở chế độ chạy ngay: < 3 giây, kể cả khi sân 2D đang bật").
  - AC: AC-51.3
  - Phụ thuộc: T805
  - ✅ **Xong 2026-11-26. `0,05 giây`** so với ngân sách **3 giây** của hiến pháp mục 3 — và
    đo **trong lúc sa bàn đang vẽ**, đúng chữ "kể cả khi sân 2D đang bật".
  - 📍 **Phép đo đầu cho `37,36 giây` và nó SAI.** Đó là vòng chờ của tôi hết hạn chứ không
    phải thời gian thật: tôi dò kết thúc bằng sự vắng mặt của nút "Chạy hết trận", mà nút ấy
    **vẫn còn** sau khi trận xong. Phép đo lại dò bằng sự xuất hiện của **"BÁO CÁO SAU TRẬN"**,
    và có chốt chặn khẳng định báo cáo **vắng mặt trước khi bấm** — không có chốt ấy thì một
    báo cáo cũ còn trong DOM sẽ cho kết quả 0 giây mà trông như thật.
  - 📝 Trạng thái lúc bấm được ghi lại cùng số đo: sa bàn đang vẽ, chưa có báo cáo, trận ở
    phút **2′**; sau khi xong, phút **92′**.

- [ ] **T807** — Đo mở ứng dụng với góc nhìn đã lưu là sa bàn.
  - File: ghi số vào `tasks.md` này
  - Xong khi: một con số **< 2 giây** với 20 đội và 20 trận lịch sử.
  - AC: AC-51.4
  - Phụ thuộc: T806
  - ⏸ **KHÔNG ĐO ĐƯỢC — hỏng vì BA lý do cùng lúc, không chỉ một.**
    1. **Sai điều kiện dữ liệu.** AC đòi **20 đội và 20 trận lịch sử**; phiên này chỉ có **2
       đội**. Dữ liệu cũ bị xoá khi app dựng lại khung xem, và 20 cú bấm "Sinh một đội" đều
       **không lưu lại** — số đội vẫn là 2 sau cả 20 lần.
    2. **Đồng hồ vẽ không tin được.** `first-contentful-paint` đo ra **41.632 ms**. Một ứng
       dụng thật không vẽ lần đầu sau 41 giây; đó là cùng cái khung xem không được vẽ mà T804
       đã chứng minh.
    3. **Đây là bản dev, không phải bản dựng.** `performance.getEntriesByType('resource')` cho
       **134 tệp script** — là module rời của Vite. Bản dựng gói chúng lại, nên thời gian tải
       ở đây không nói gì về thời gian tải thật.
  - 📝 Hai số đo được, ghi để khỏi mất: `domContentLoaded` **1.243 ms**, `duration` của
    navigation **3.807 ms** — cả hai đều là của **máy chủ dev khởi động nguội**.

- [ ] **T808** — Đo lúc đổi góc nhìn không bỏ khung.
  - File: ghi số vào `tasks.md` này
  - Xong khi: đổi góc nhìn 10 lần, **không** khung nào vượt ngưỡng của AC-51.1; ghi khung chậm nhất trong lúc đổi.
  - AC: AC-51.5
  - Phụ thuộc: T807
  - ⏸ **KHÔNG ĐO ĐƯỢC — nó đo theo ngưỡng của AC-51.1, mà ngưỡng ấy chưa xác nhận được.**
    "Không khung nào vượt ngưỡng của AC-51.1" là một mệnh đề rỗng khi chính AC-51.1 chưa đo
    được. Đổi góc nhìn **có** được bấm nhiều lần trong lúc làm T804 (6 lượt qua lại) và giao
    diện không hỏng, nhưng đó là quan sát, không phải phép đo.

- [x] **T809** — Đếm lời gọi mạng.
  - File: ghi số vào `tasks.md` này
  - Xong khi: tab Network sau một trận trọn ở sa bàn cho **0** lời gọi — không phông chữ, không tài nguyên, không bản đồ môi trường (P4).
  - AC: AC-51.6
  - Phụ thuộc: T808
  - ✅ **Xong 2026-11-26. `0` lời gọi ra host ngoài** sau một trận trọn ở sa bàn — không phông
    chữ, không tài nguyên ngoài, không bản đồ môi trường (**P4**).
  - 📝 Tổng **138** tài nguyên, **tất cả** cùng host: 4 CSS + 134 script, và 134 ấy là module
    rời của **máy chủ dev Vite**, không tồn tại trong bản dựng. Con số đáng tin của AC này là
    **0 host ngoài**, không phải 138.

- [x] **T810** — Chạy qua **toàn bộ 51 AC** của spec, đánh dấu từng mục.
  - File: `specs/011-pro-ui-3d-pitch/spec.md`
  - Xong khi: mọi ô `- [ ]` ở mục 3 thành `- [x]`, hoặc có một dòng ghi rõ vì sao chưa; `Status` của spec đổi thành `Done` nếu đủ hết.
  - AC: (toàn bộ)
  - Phụ thuộc: T809
  - ✅ **Xong 2026-11-26. 40/52 AC đạt, 12 chưa** — và **mỗi** AC chưa đạt mang một dòng
    `⬜ CHƯA ĐẠT` ngay dưới nó, nói rõ task nào còn thiếu và vì sao. Soát bằng máy: 40 + 12 =
    **52**, và số dòng lý do đúng bằng **12**.
  - 📊 Mười hai AC chưa đạt, theo **lý do** chứ không theo số:
    - **7 chờ Phase 62**: AC-46.7, AC-49.3, AC-49.4, AC-49.5, AC-49.6, AC-49.7, và AC-47.5.
    - **1 chặn bởi `T813` của spec 007**: AC-49.1 (thủ môn).
    - **3 không đo được trong môi trường này**: AC-51.1, AC-51.4, AC-51.5.
    - **1 chờ phép kiểm P5 mang đúng tên nó**: AC-46.5 — đường đọc **đã** đúng theo cấu trúc
      (**D145**) và T777 đã so `(x, y)` của hai lớp từng số trên hơn 1.000 lượt, nhưng **P5**
      đòi một phép kiểm mang tên chính AC ấy, và đó là T784.
  - 📍 Ba trong số 12 đáng chú ý vì chúng **đã chạy đúng trên bản chạy nhưng chưa có phép
    kiểm**: AC-49.3 (vòng khung hình đã gác `if (!dangChay) return undefined`), AC-49.4 (bóng
    vẽ từ mốc đang hiển thị nên đóng băng không làm nó mất), AC-49.5 (hook dùng chung đã bóc
    sẵn ở T812). Chúng **không** được tick: hiến pháp **P5** đòi phép kiểm, không đòi quan sát.
  - ⛔ `Status` của spec **giữ `Planned`**, không đổi thành `Done`.

- [x] **T811** — Kiểm **13 trường hợp biên** ở mục 5 của spec.
  - File: ghi kết quả vào `tasks.md` này
  - Xong khi: mười ba dòng của bảng mục 5 đều có một câu kết luận đã kiểm — gồm trận cổ điển, cửa sổ hẹp, hai đội đổi sân giữa hiệp, bóng ở độ cao lớn nhất gần biên trên, và một biến màu vượt trần.
  - AC: (trường hợp biên)
  - Phụ thuộc: T810
  - ✅ **Xong 2026-11-26** — nhưng đọc kỹ cột kết luận: **6 đạt, 2 đúng theo cấu trúc, 1 là
    hệ quả đã nhận, 5 chưa dựng.**
  - 📝 **Bảng có 14 dòng, không phải 13 như task viết.** Dòng thứ 14 (*"Bóng ở hai góc nhìn
    không cùng một chỗ"*) do `/analyze` thêm ngày 2026-11-25, sau khi task này được viết.

    | # | Trường hợp biên | Kết luận đã kiểm |
    |---|---|---|
    | 1 | Trận cổ điển | ✅ **đạt** — T774 đo: không có nút, câu giải thích hiện, vẫn vẽ sân 2D |
    | 2 | Chưa có trận nào chạy | ✅ **đạt** — ở trang chủ, danh sách nút **không** có "Góc nhìn" |
    | 3 | Trận đang tạm dừng | ⬜ **chưa kiểm** — T778/T779 thuộc Phase 62 đang dừng |
    | 4 | Giảm chuyển động bật | ⬜ **CHƯA DỰNG** — `San3D` chưa import hook; T780 đang dừng |
    | 5 | Bóng bị một cầu thủ che | ⬜ **CHƯA DỰNG** — `bongBiChe` là T783, đang dừng |
    | 6 | Bóng ở hai góc nhìn không cùng chỗ | ✅ **hệ quả đã nhận** (D142) — không phải lỗi |
    | 7 | Hai thực thể chiếu sát nhau | ⬜ **CHƯA DỰNG** — chồng lấn **thấy rõ** trên bản chạy; T781/T782 đang dừng |
    | 8 | Bóng cao nhất, gần biên trên | ✅ **đạt** — `chieuSaBan.test.ts` kiểm `z = 5,26` ở `y = 68` còn trong khung ảnh; mặt cỏ 49,03 và tổng 58,6 ≤ 64 |
    | 9 | Hai đội đổi sân giữa hiệp | ✅ **đúng theo cấu trúc** — camera là hai **hằng module** (`GOC_SA_BAN`, `HE_SO_CAO`), không có trạng thái nào để đổi |
    | 10 | Cửa sổ rất hẹp hoặc rất thấp | ✅ **đạt** — đo ở cửa sổ **382×446**: sa bàn thu về 292×180 px, **0 trên 33 hình** tràn khỏi `viewBox`, nằm trọn theo chiều ngang |
    | 11 | Người dùng mù màu | ✅ **đạt** — T788/T798: ảnh xám cho thấy đĩa tròn chồng lên ô vuông, phân biệt được khi mất sạch màu |
    | 12 | Mất mạng | ✅ **đạt** — T809: **0** lời gọi ra host ngoài sau một trận trọn ở sa bàn |
    | 13 | Dữ liệu mốc thiếu một thực thể | ✅ **đúng theo cấu trúc** — `viTriMetLienTuc` và `viTriBongLienTuc` trả `null` khi `coMat = 0`, và cả hai nhánh đều có phép kiểm |
    | 14 | Một biến màu vượt trần bão hoà | ✅ **đạt** — T795/T796: **không** biến nào vượt TT-1, và ba đột biến chứng minh phép kiểm đỏ đúng chỗ nếu có |


---

## Bảng phủ AC

52/52 AC có task.

| AC | Task |
|---|---|
| AC-46.1 | T765, T766, T769 |
| AC-46.2 | T769 |
| AC-46.3 | T765, T769 |
| AC-46.4 | T769 |
| AC-46.5 | T768, T784 |
| AC-46.6 | T773, T791 |
| AC-46.7 | T783 |
| AC-46.8 | T769 |
| AC-47.1 | T774 |
| AC-47.2 | T774 |
| AC-47.3 | T774 |
| AC-47.4 | T772 |
| AC-47.5 | T785 |
| AC-47.6 | T774 |
| AC-48.1 | T792 |
| AC-48.2 | T795 |
| AC-48.3 | T795 |
| AC-48.4 | T794 |
| AC-48.5 | T798 |
| AC-48.6 | T793, T797 |
| AC-48.7 | T803 |
| AC-48.8 | T796 |
| AC-49.1 | T777 |
| AC-49.2 | T777 |
| AC-49.3 | T778 |
| AC-49.4 | T779 |
| AC-49.5 | T780 |
| AC-49.6 | T781 |
| AC-49.7 | T782 |
| AC-49.8 | T786 |
| AC-49.9 | T786 |
| AC-50.1 | T774 |
| AC-50.2 | T790 |
| AC-50.3 | T788 |
| AC-50.4 | T773, T789 |
| AC-50.5 | T789 |
| AC-50.6 | T787 |
| AC-51.1 | T804 |
| AC-51.2 | T805 |
| AC-51.3 | T806 |
| AC-51.4 | T807 |
| AC-51.5 | T808 |
| AC-51.6 | T809 |
| AC-51.7 | T776 |
| AC-52.1 | T763 |
| AC-52.2 | T763 |
| AC-52.3 | T763 |
| AC-52.4 | T763 |
| AC-53.1 | T799 |
| AC-53.2 | T800 |
| AC-53.3 | T801 |
| AC-53.4 | T802 |

---

## ⚠️ Một phép kiểm CHẬP CHỜN, chưa bắt được — ghi ra ngày 2026-11-26

Trong lúc đóng Phase 66, một lần chạy cả bộ cho **2 phép kiểm đỏ trên 1.809**, ở **1 file**.
Ba lần chạy cả bộ ngay sau đó đều **xanh hết**, và tệp nhật ký của lần đỏ chỉ giữ phần đuôi
nên **không biết phép nào đã đỏ**.

Đã thử khoanh vùng:
- Nghi phạm rõ nhất là `src/services/tuyChonRepo.test.ts`: T772 thêm **6** phép kiểm vào một
  file có `beforeEach` gọi `indexedDB.deleteDatabase`, và hàm `xoaDatabase` ở đó **resolve cả
  khi `onblocked`** — tức nó có thể đi tiếp mà database **chưa** bị xoá, để giá trị của phép
  kiểm trước rò sang phép kiểm sau.
- Nhưng chạy riêng file ấy **6 lần đều xanh**. Nên nếu đúng là nó thì điều kiện kích hoạt nằm
  ở chỗ **chạy song song** cả bộ, không ở bản thân file.

**Vì sao điều này đáng ghi:** điều kiện RA chung của **mọi** task trong tài liệu này là *"bộ
kiểm xanh"*. Một phép kiểm đỏ 1 lần trên 4 làm cái cổng ấy yếu đi — và tệ hơn, nó có thể làm
một task được tick nhờ may mắn. Tần suất quan sát được: **1/4 lần chạy cả bộ**.

**Chưa sửa, và không đoán bừa:** sửa `xoaDatabase` cho đợi `onblocked` thật là chạm một file
test của spec 003, mà chưa có bằng chứng nó là thủ phạm. Việc cần làm trước là **bắt được**
lần đỏ tiếp theo kèm tên phép kiểm — chạy cả bộ và **giữ nguyên toàn bộ nhật ký**, đừng
`tail`, đó chính là cách tôi đã làm mất lần đầu.

---

## Ghi chú thực thi

- **Không tạo file nào ngoài danh sách trên.** Phát sinh thêm → **dừng**, cập nhật `plan.md` và
  `tasks.md` trước. Spec 007 đã phải lấp **bốn lỗ** kiểu này; cách tìm ra chúng là **grep từng
  ký hiệu của bảng Contracts (`plan.md` mục 5) trong `tasks.md`** — nên làm phép soát ấy một
  lần trước khi bắt đầu `/implement`.
- **Sáu file mới, và chỉ sáu:** `src/ui/chieuSaBan.ts`, `src/ui/chieuSaBan.test.ts`,
  `src/ui/components/San3D.tsx`, `src/ui/batBienSaBan.test.ts`, `src/ui/giamChuyenDong.ts`,
  `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md`.
  ⚠️ **`src/services/tuyChonRepo.test.ts` ĐÃ TỒN TẠI** — T772 **mở rộng** nó, không tạo mới.
  Bản đầu của danh sách này đếm nó là file thứ sáu; `/analyze` bắt được ngày 2026-11-25, và chỗ
  trống ấy giờ là `giamChuyenDong.ts` (**D143**). Câu này là chốt chặn scope creep nên nó phải
  đúng từng cái tên.
- **`src/ui/giamChuyenDong.ts` không có file test**, và đó là có chủ ý: nó đọc `matchMedia`, thứ
  không tồn tại trong `environment: 'node'`. Hiến pháp mục 4 cho phép — *"Test cho giao diện
  không bắt buộc"*. Lưới của nó là điều kiện RA của T812: sân 2D hành xử đúng như trước.
- **`src/engine/` không có một dòng nào thay đổi**, ở mọi task. Đây là AC-49.9 và nó được soát
  ở điều kiện RA chung.
- **Mỗi task xong là một commit**, thông điệp nêu rõ task nào (hiến pháp mục 4, Git).
- **Ba phép kiểm P5** (T784, T785, T802) là thứ hiến pháp **không cho** xác nhận bằng mắt. Nếu
  một trong ba không dựng được thì đó là **câu phải hỏi người dùng**, không phải chỗ tự hạ
  ngưỡng.
- **Nếu T775 báo vỡ ngân sách:** dừng Phase 61, mở lại **D132**, và hỏi người dùng. `three.js`
  là phương án **hợp hiến** — hiến pháp mục 3 cho thêm thư viện thoải mái, miễn đóng gói offline
  được và ghi vào plan — nhưng nó bắt làm lại AC-50.1, AC-50.2, AC-50.5 và AC-49.5 từ đầu.
