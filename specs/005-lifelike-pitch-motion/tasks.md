# Tasks: Sân 2D sống như một trận thật

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 30 AC (US-28 → US-32), 11 quyết định D89–D100 |
| **Tiến độ** | 6/20 |
| **Sửa đổi** | 2026-11-18 — chẻ lần đầu từ plan |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Số task bắt đầu từ **T500** để không lẫn với T001–T136 của spec 001, T200–T224
của spec 002, T300–T344 của spec 003 và T400–T441 của spec 004. Sáu phase dưới
đây là sáu lát cắt dọc ở `plan.md` mục 9; mỗi phase kết thúc là một ứng dụng
xem được (hiến pháp P6), và là một commit.

> ⚠️ **Ràng buộc xuyên suốt: KHÔNG đổi engine.** `PHIEN_BAN_ENGINE` giữ 5,
> `DB_VERSION` giữ 3. Chuyển động là việc của tầng hiển thị. Task nào chạm gần
> `src/engine/` đều có dòng này trong tiêu chí xong (rủi ro R33, kế thừa từ
> spec 004 — đổi engine là tước nút đấu lại của mọi trận đã lưu).

> ⚠️ **Dòng phải có trong tiêu chí xong của MỌI task chạm `src/ui/noiSuy.ts`:**
> describe `'toạ độ tại mốc không bao giờ sai (AC-25.2)'` ở `noiSuy.test.ts:32`
> **không được sửa một dòng** và phải còn xanh. Đó là rủi ro **R38** — rủi ro
> cao nhất của plan, vì nó vỡ **im lặng** và kéo theo cả AC-28.3 của spec này
> lẫn một AC của spec 004 đã đóng.

> 📏 **Mỗi task nói rõ bằng chứng của nó là SỐ hay là MẮT.** Pane trình duyệt
> của phiên làm việc không được vẽ nên `requestAnimationFrame` không chạy một
> khung nào (đo thẳng ở Phase 35: 0 khung trong 1,5 giây dù `visibilityState`
> là `visible`). Thứ đo được bằng số thì đo, kể cả bằng cách thay rAF bằng
> `setTimeout` như Phase 35 đã làm. Thứ chỉ mắt người dùng phán được thì ghi
> thẳng là vậy, đừng giả vờ đã kiểm.

---

## Phase 37 — Lát 37: Nhịp xem được

> Lát này một mình đã giải quyết phần lớn điều người dùng phàn nàn ("rất nhanh,
> không tự nhiên"), nên nó nằm đầu có chủ đích: làm tới đây rồi dừng vẫn đáng.

- [x] **T500** — Mức tốc độ Chậm 1000ms, và nó là mặc định
  - File: sửa `src/hooks/useMatch.ts`, sửa `src/ui/components/BangDieuKhienTran.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: `MucTocDo` có thêm `'cham'`; `MS_MOI_PHUT.cham = 1000`; `CAC_MUC_TOC_DO` xếp `cham` **đầu tiên**; `useState<MucTocDo>('cham')`; `KHOA_TOC_DO` có khoá mới; nhãn "Chậm" / "Slow" trong **cùng commit** (P8); `npx tsc --noEmit` sạch — đây là lưới bắt mọi `Record<MucTocDo, …>` còn thiếu khoá; Tab tới được mức mới và chọn được bằng bàn phím (P9).
  - Bằng chứng: **số** (trình biên dịch + đọc DOM).
  - AC: AC-29.5, AC-31.5
  - Phụ thuộc: —
  - ⚠️ `'cham'` của `MucTocDo` **khác** `'cham'` của chỉ thị `'toc-do-chuyen-bong'` trong `domain/instructions` (xem `thongKeBen.test.ts:110`). Hai union khác nhau, trùng tên là trùng ngẫu nhiên — **đừng gộp**, và đừng đặt lại tên một trong hai chỉ vì thấy giống.

- [x] **T501** — Thời lượng di chuyển giãn theo nhịp, bỏ trần 280ms
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `thoiGianChuyen(ms) = round(ms × 0,9)`, và trả **0** khi `ms < 40` (mức Rất nhanh thôi nội suy, đi đúng đường `msChuyen <= 0` đã có ở `San2D.tsx:523`); hằng số `THOI_GIAN_CHUYEN_TOI_DA` bị xoá cùng phép kiểm trần của nó; bốn phép kiểm mới xanh: `1000 → 900`, `200 → 180`, `70 → 63`, `20 → 0`; phép kiểm "ở mọi mức, cú chuyển chỗ kết thúc trước nhịp kế tiếp" **giữ nguyên** và vẫn xanh; **không đổi engine**.
  - Bằng chứng: **số**.
  - AC: AC-29.1, AC-29.2, AC-29.4
  - Phụ thuộc: T500
  - ⚠️ Phép kiểm ấy duyệt `Object.entries(MS_MOI_PHUT)` nên nó **tự** kiểm luôn mức mới — đó là lý do T500 phải xong trước.

- [x] **T502** — Xem lát 37 chạy: mặc định đúng, cú di chuyển dài ra theo nhịp
  - File: — *(kiểm trên bản build)*
  - Xong khi: mở một trận thì mức Chậm đã được chọn sẵn và bốn nhãn hiện đúng thứ tự; đo trên trận đang phát ở mức Chậm: **một chặng di chuyển dài ~900ms**, tức ~90% nhịp, thay vì bị trần 280ms cắt (AC-29.1, AC-29.2); ở mức Rất nhanh **không khung nào** được xin mà toạ độ vẫn đổi đúng mốc (AC-29.4); không lỗi console.
  - Bằng chứng: **số** (thay rAF bằng `setTimeout` để đo, như Phase 35).
  - AC: AC-29.1, AC-29.2, AC-29.4, AC-29.5
  - Phụ thuộc: T501
  - ⚠️ **Tiêu chí cũ đã bị dọn sang T508.** Bản chẻ đầu đòi "quãng không đổi toạ độ ≤ 300ms" — đo thật ở lát 37 ra **2114ms**, và đó không phải lỗi: giữa hai tình huống không ai có đích mới, nên không ai di chuyển. "Luôn luôn di chuyển" là việc của **lớp dao động ở lát 39**, và T508 đã có đúng tiêu chí ấy.

---

## Phase 38 — Lát 38: Hết phanh ở mốc, và bóng đi như bóng

- [x] **T503** — Nối TỐC ĐỘ qua mốc, không chỉ nối hướng
  - File: sửa `src/ui/noiSuy.ts`, sửa `src/ui/noiSuy.test.ts`
  - Xong khi: thời gian đi **đều** cho cầu thủ (bỏ smoothstep khỏi đường của người), chỉ làm mượt khi **xuất phát từ đứng yên** (chặng đầu, vừa mở sân, vừa hết tạm dừng); tiếp tuyến vào mốc được chuẩn theo tốc độ của chặng trước; thêm phép kiểm "tốc độ tại mốc không về 0 khi có tốc độ vào", đúng với **mọi** độ lớn tiếp tuyến; **describe `'toạ độ tại mốc không bao giờ sai'` không sửa một dòng và vẫn xanh (R38)**; **không đổi engine**.
  - Bằng chứng: **số**.
  - AC: AC-30.1
  - Phụ thuộc: —

- [x] **T504** — `San2D` mang tốc độ của chặng trước vào chặng sau
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: chặng mới nhận tốc độ vào từ chặng trước; đo trên trận đang phát: một điểm có **chuỗi chuyển động liên tục dài hơn một chặng** — tức nó băng qua mốc mà không có một khung nào đứng im; `san2D.test.ts` vẫn xanh.
  - ⚠️ **Tiêu chí cũ là một phép đo sai.** Bản chẻ đầu đòi "không hai khung liền cùng một toạ độ" — đo thật thì 4% khung vẫn trùng toạ độ, nhưng không phải vì phanh: đó là những điểm di chuyển quãng ngắn tới mức bị làm tròn trong thuộc tính SVG. Chuỗi liên tục dài hơn một chặng mới là thứ chỉ xảy ra được khi tốc độ nối qua mốc.
  - Bằng chứng: **số**.
  - AC: AC-30.1
  - Phụ thuộc: T503

- [x] **T505** — Bóng đi đường thẳng, nhanh gấp ba người
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: bóng có chặng riêng, **đường thẳng**, thời lượng `msChuyen / 3`; đo: bóng tới toạ độ đích trong khoảng một phần ba đầu của chặng, trước mọi cầu thủ đi cùng hướng.
  - Bằng chứng: **số**.
  - AC: AC-30.2
  - Phụ thuộc: T504

---

## Phase 39 — Lát 39: Ai cũng sống

- [ ] **T506** — Lớp dao động chờ, hàm thuần
  - File: tạo `src/ui/daoDong.ts`
  - Xong khi: `lechDaoDong(playerId, thoiDiemTran, bienDo)` trả về một **lệch** (không phải toạ độ) luôn nằm trong `bienDo`, và `bienDo` là **hai số cho hai trục**, mỗi trục tối đa **một phần tám khoảng giãn** (D89 đã siết sau `/analyze`); `phaCuaNguoi(playerId)` băm tất định từ chuỗi id; **không** gọi `Math.random`, `Date.now` hay `performance.now` — mọi thứ đi vào qua tham số (P1); file này không import gì từ `components/`.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.2, AC-28.4
  - Phụ thuộc: —

- [ ] **T507** [P] — Test lớp dao động
  - File: tạo `src/ui/daoDong.test.ts`
  - Xong khi: cùng `playerId` + cùng thời điểm trận → cùng lệch (P1); hai `playerId` khác nhau → hai pha khác nhau (AC-28.4); lệch luôn trong biên với mọi đầu vào, kể cả `NaN` và số âm; **hai điểm cùng một vùng, lệch ngược chiều nhau tối đa, vẫn cách nhau ít nhất ba phần tư khoảng giãn** (AC-30.5 và AC-15.2 của spec 002); **hai điểm cùng một hàng lệch nhau không quá một phần tư** (AC-30.3); khi thời điểm trận nhích đều thì lệch **đổi trong mọi cửa sổ 300ms** (AC-28.1); thay `Math.random` bằng một hàm ném lỗi rồi gọi vẫn chạy — đúng cách `generator.test.ts` và `tenNgauNhien.test.ts` đang kiểm.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.2, AC-28.4
  - Phụ thuộc: T506

- [ ] **T508** — Vòng khung hình chạy liên tục, hai prop mới, tạm dừng đóng băng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: **tách hai effect** — một dựng dữ liệu chặng, vẫn khoá theo `khoaMoc`; một giữ vòng `requestAnimationFrame`, khoá theo `[dangChay, giamChuyenDong]`; `San2D` nhận hai prop mới `phutDongHo` và `dangChay` từ `TrangTran` (chỗ dựng `<San2D>` **duy nhất** của repo); `dangChay = false` → **0 khung** và sân đóng băng, giữ thời điểm trận trong ref để lúc tiếp tục không nhảy; đổi ngôn ngữ giữa một chặng **không** làm toạ độ nhảy về đầu chặng; ẩn sân rồi hiện lại thì các điểm xuất hiện đúng chỗ hiện tại, không chạy lại chặng cũ; đo ở **từng mức còn nội suy** (Chậm, Thường, Nhanh): mọi điểm đổi toạ độ ít nhất một lần mỗi 300ms; ở mức Rất nhanh **không** đòi điều đó (AC-28.1 đã giới hạn sau `/analyze`); **sửa chú thích đầu file** — câu "KHÔNG vòng lặp animation" sai từ spec 004.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.3, AC-28.5, AC-31.7
  - Phụ thuộc: T506, T504 *(cùng chạm `San2D.tsx` nên làm sau lát 38, không song song)*
  - ⚠️ `phutDongHo` lấy từ `tran.phut` (phút ĐỒNG HỒ), **không** từ `suKien.phut` — phút hiển thị không nhích khi một phút không có tình huống nào, và dao động sẽ đứng chết hàng giây (bẫy đã biết từ Phase 34, ghi trong D90).

- [ ] **T509** — Giảm chuyển động tắt **cả hai** lớp
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: giả lập `matchMedia('(prefers-reduced-motion: reduce)')` trả `matches: true` → 0 khung **và** lệch dao động bằng 0, mà toạ độ tại mốc vẫn đúng từng điểm.
  - Bằng chứng: **số**.
  - AC: AC-31.1
  - Phụ thuộc: T508

---

## Phase 40 — Lát 40: Đội hình có tổ chức

- [ ] **T510** — Khối đội hình nghiêng theo bóng (D94)
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `hinhSan` dịch chỗ đứng theo vùng của bóng, **chỉ với người KHÔNG tham gia tình huống**, biên **một phần mười chiều dài sân**, và vẫn đi qua phép kẹp vào mặt cỏ đã có; phép kiểm mới: nghiêng khối **không** đẩy ai ra khỏi vùng của mình (AC-28.3) và **không** làm hai điểm chồng khít (AC-30.5); hai phép kiểm sẵn có "số điểm trên sân" và "điểm không chồng khít" vẫn xanh.
  - Bằng chứng: **số** cho ba điều trên; **mắt** cho câu "sơ đồ 4-4-2 vẫn ra 4-4-2".
  - AC: AC-30.4, AC-28.3, AC-30.5
  - Phụ thuộc: T508
  - ⚠️ Đây là chỗ D94 cho phép đổi cách tính vị trí tại mốc, và quyền ấy **chỉ** tới đó: không dịch người tham gia tình huống, không vượt biên, không bỏ phép kẹp.

- [ ] **T511** — Hàng ngang vẫn ra hàng ngang
  - File: sửa `src/ui/san2D.test.ts`, *(nếu phải siết biên)* sửa `src/ui/daoDong.ts`
  - Xong khi: phép kiểm — lấy một hàng bốn người, chạy qua nhiều thời điểm trận, độ lệch ngang giữa hai người trong hàng **luôn dưới một phần tư** khoảng giãn; nếu đỏ thì **siết biên độ dao động**, không nới ngưỡng của phép kiểm.
  - Bằng chứng: **số**.
  - AC: AC-30.3
  - Phụ thuộc: T510
  - ⚠️ Phần lớn AC-30.3 **đã đúng sẵn** (người cùng hàng có cùng toạ độ ngang). Task này là lưới **giữ** nó đúng sau khi thêm dao động và nghiêng khối — nên nếu nó xanh ngay từ đầu thì đừng tưởng là viết sai: hãy thử tăng biên độ lên gấp ba và xem nó có đỏ không.

- [ ] **T512** — Hai chế độ thể lực (D93, mở lại D88)
  - File: sửa `src/ui/noiSuy.ts`, sửa `src/ui/noiSuy.test.ts`, sửa `src/ui/components/San2D.tsx`
  - Xong khi: nhịp **≥ 500ms** → người sung sức dùng 75% nhịp, người kiệt sức tới 95%, nên kiệt sức tới đích **muộn hơn** mà vẫn **trước** nhịp sau; nhịp < 500ms → giữ đúng D88 (cùng thời lượng, khác dáng); describe "thể lực đổi DÁNG" được **SỬA thành hai nhánh, không bỏ**; describe "không điểm nào còn đang đi khi tình huống kế tiếp tới (AC-25.3)" đổi tên và đổi nội dung sang AC mới — "không điểm nào bị **giật**" — và phủ **cả hai** chế độ ở **cả bốn** mức tốc độ; **describe "toạ độ tại mốc" không sửa một dòng (R38)**; **không đổi engine**.
  - Bằng chứng: **số**.
  - AC: AC-30.6, AC-29.3
  - Phụ thuộc: T503, T510 *(cùng chạm `San2D.tsx`)*

---

## Phase 41 — Lát 41: Thấy bóng, thấy bàn thắng

> Lát này **độc lập với lát 38–40**: nó chỉ cần lát 37 để có nhịp chậm mà xem
> hiệu ứng. Muốn thấy thêm một thứ rõ rệt ngay sau lát đầu thì làm 37 → 41.

- [ ] **T513** [P] — Quả bóng luôn có mặt, và đứng đúng chỗ theo loại dòng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: bóng được vẽ ở **mọi** dòng tường thuật; dòng khai cuộc và hết hiệp → bóng ở **điểm giao bóng giữa sân**; dòng không mang đường bóng và cũng không phải hai loại ấy (`thay-nguoi`, `kiet-suc`) → bóng **giữ chỗ cuối cùng**; trận đang tạm dừng hay đã kết thúc vẫn có bóng; phép kiểm `hinhSan` cho cả ba loại dòng.
  - Bằng chứng: **số**.
  - AC: AC-32.1, AC-32.2, AC-32.3, AC-32.7
  - Phụ thuộc: T500
  - ⚠️ Gốc của việc này: bóng **đã** được vẽ từ spec 001 nhưng chỉ khi dòng đang hiện mang đường bóng, mà `thay-nguoi`, `kiet-suc`, khai cuộc và hết hiệp đều truyền đường bóng rỗng — riêng "kiệt sức" là 5 dòng một trận.

- [ ] **T514** — Hiệu ứng bàn thắng ba phần, và chuỗi hai ngôn ngữ
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: dòng `'ban-thang'` đang hiện thì sân vẽ **ba phần cùng lúc** — vòng tròn bán kính lớn dần từ chỗ ghi bàn, điểm người ghi bàn tăng bán kính, và dòng chữ "BÀN THẮNG!" / "GOAL!" trên mặt sân; bán kính phóng to bị chặn **dưới khoảng giãn** giữa hai người cùng vùng (R45); giảm chuyển động → **chỉ còn chữ**; phép kiểm "điểm không chồng khít" chạy cả ở trạng thái đang có hiệu ứng.
  - Bằng chứng: **số** cho biên và cho việc chỉ-còn-chữ; **mắt** cho cảm giác.
  - AC: AC-32.4, AC-32.6
  - Phụ thuộc: T513

- [ ] **T515** [P] — Nhịp lặng 1,5 giây sau bàn thắng (D100)
  - File: sửa `src/hooks/useMatch.ts`
  - Xong khi: phút vừa mô phỏng có sự kiện `'ban-thang'` thì hẹn giờ cho phút kế tiếp dài thêm ~1500ms; **`dangChay` không đổi** nên nút Tạm dừng / Tiếp tục không nhấp nháy chữ (AC-32.5); bàn thắng ở phút cuối **không** chặn việc trận kết thúc và việc lưu vào lịch sử; chế độ "chạy hết trận" không bị ảnh hưởng (nó không đi qua vòng đồng hồ); nhịp lặng xảy ra **cả khi đang ẩn sân**.
  - Bằng chứng: **số**.
  - AC: AC-32.5
  - Phụ thuộc: —
  - ⚠️ Đây là lần **duy nhất** spec này chạm vòng đồng hồ. Không gọi `tamDung()` rồi `tiepTuc()` — đường ấy làm nút đổi trạng thái ngay trước mắt người dùng, đúng điều AC-32.5 cấm.

---

## Phase 42 — Lát 42: Kiểm tay, đo ngân sách, đóng spec

- [ ] **T516** — Kiểm tay bốn tổ hợp, một lượt giảm chuyển động, và biên mục 5
  - File: — *(kiểm trên bản build)*
  - Xong khi: đi hết màn hình trận ở **bốn tổ hợp** ngôn ngữ × chế độ màu, không sót chữ, không chỗ nào tương phản dưới 4.5:1; một lượt với giảm chuyển động đang bật; và đi hết bảng trường hợp biên mục 5 của spec — phút 0, tạm dừng, hết trận, thẻ đỏ, thay người, sân 5 người, hai bàn liền nhau, bàn ở phút cuối, ẩn sân khi có bàn, bàn trong lúc chạy hết trận.
  - Bằng chứng: **số** cho tương phản và chuỗi; **mắt** cho phần còn lại.
  - AC: AC-31.1, AC-31.2, AC-31.6, AC-32.1 → AC-32.7
  - Phụ thuộc: T502, T505, T509, T511, T512, T514, T515

- [ ] **T517** — Đo hai ngân sách ở **cả bốn** mức tốc độ
  - File: — *(đo trên bản build)*
  - Xong khi: chạy hết một trận ở chế độ chạy ngay vẫn **< 3 giây** với sân bật; công việc mỗi khung vẽ gọn trong một nhịp ở **cả bốn** mức (Chậm, Thường, Nhanh, Rất nhanh) và không tác vụ nào chiếm luồng chính quá 50ms; so với nền đã đo ở Phase 35 spec 004 (≤0,3ms mỗi khung ở Thường, ≤1,0ms ở Nhanh); ghi số đo và **điều kiện đo** vào mô tả commit.
  - Bằng chứng: **số**.
  - AC: AC-31.3, AC-31.4
  - Phụ thuộc: T516

- [ ] **T518** — Người dùng xem một trận và phán: tự nhiên hay chưa
  - File: — *(người dùng tự xem, trên trình duyệt của mình)*
  - Xong khi: người dùng xem trọn một trận ở mức Chậm trên trình duyệt thường của họ và nói ra — nhịp vừa chưa, dao động đủ hay quá, đường chạy có mềm, hiệu ứng bàn thắng có đáng. Mỗi điều chỉnh sau đó là một hằng số: nhịp, biên độ dao động, độ nghiêng khối, hệ số bóng.
  - Bằng chứng: **MẮT NGƯỜI DÙNG — không phép kiểm nào thay được task này**, và nó là lý do cả spec này tồn tại.
  - AC: AC-28.1, AC-28.4, AC-29.1, AC-30.1, AC-30.2, AC-30.3, AC-30.4 *(phần cảm giác)*
  - Phụ thuộc: T517

- [ ] **T519** — Tick 30 AC và đóng spec
  - File: sửa `specs/005-lifelike-pitch-motion/spec.md`
  - Xong khi: mọi AC ở mục 3 được tick **có căn cứ** (ghi rõ căn cứ là test nào hay kiểm tay thấy gì, như spec 004 mục 11 đã làm); Definition of Done đủ mục; `Status` đổi thành **Done**; xác nhận `PHIEN_BAN_ENGINE` vẫn 5, `DB_VERSION` vẫn 3, và `git diff src/engine/` rỗng trên cả spec.
  - AC: toàn bộ
  - Phụ thuộc: T518

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-28.1 | T506, T507, T508, T518 |
| AC-28.2 | T506, T507 |
| AC-28.3 | T508, T510 |
| AC-28.4 | T506, T507, T518 |
| AC-28.5 | T508 |
| AC-29.1 | T501, T502, T518 |
| AC-29.2 | T501 |
| AC-29.3 | T502, T512 |
| AC-29.4 | T501 |
| AC-29.5 | T500 |
| AC-30.1 | T503, T504, T518 |
| AC-30.2 | T505, T518 |
| AC-30.3 | T511, T518 |
| AC-30.4 | T510, T518 |
| AC-30.5 | T510 |
| AC-30.6 | T512 |
| AC-31.1 | T509, T516 |
| AC-31.2 | T516 |
| AC-31.3 | T517 |
| AC-31.4 | T517 |
| AC-31.5 | T500 |
| AC-31.6 | T516 |
| AC-31.7 | T508 |
| AC-32.1 | T513, T516 |
| AC-32.2 | T513, T516 |
| AC-32.3 | T513, T516 |
| AC-32.4 | T514, T516 |
| AC-32.5 | T515, T516 |
| AC-32.6 | T514, T516 |
| AC-32.7 | T513, T516 |

## Ghi chú thực thi

## Phase 37 — ba thứ chỉ biết được khi làm thật

**1. Dự đoán của ghi chú bên dưới đã SAI, và đây là sự thật.** Ghi chú ấy
đoán "một trong ba phép kiểm sẽ đỏ khi vòng duyệt gặp nhịp 1000ms, nơi D93 đổi
hành vi". Đọc thân hai describe trước khi sửa thì thấy: **thêm nhịp 1000ms
không làm đỏ gì cả** — cả describe D88 chỉ dùng tỉ lệ, không dùng `MS_MOI_PHUT`,
và phép kiểm "chặng kết thúc trước nhịp kế tiếp" vẫn đúng vì 900 ≤ 1000. Thứ
đỏ lên là mức **20ms**, và đỏ ngay ở lát 37 chứ không phải lát 40: khi
`thoiGianChuyen(20)` trả **0**, phép kiểm tính `thoiLuong / thoiLuong` = `0/0` =
`NaN`, lớp nội suy kẹp `NaN` về 0, nên điểm nằm ở điểm đầu thay vì đích. Tức
phép kiểm đỏ vì **phép tính của chính nó**, không vì hành vi sản phẩm sai.

**2. Lệch khỏi danh sách file đã khai, nói ra chứ không lặng lẽ:** T501 phải
chạm thêm `src/ui/noiSuy.test.ts` — một file không có trong danh sách của nó —
để thêm một `continue` cho những mức thôi nội suy (kèm chú thích vì sao), và để
đổi tên một phép kiểm từ "ở CẢ BA mức tốc độ" thành "ở MỊI mức tốc độ" — giờ
có bốn mức. Describe bất biến toạ độ tại mốc **không bị sửa một dòng** (R38).

**3. Tiêu chí của T502 đòi một thứ lát 37 không thể có.** Đo thật: quãng không
đổi toạ độ lên tới **2114ms** ở mức Chậm. Không phải lỗi — giữa hai tình huống
không ai có đích mới nên không ai di chuyển, và đó chính là lý do lớp dao động
ở lát 39 tồn tại. `/analyze` đã sửa ngưỡng của T502 từ 100ms sang 300ms nhưng
không thấy rằng **cả tiêu chí ấy thuộc lát khác**. Nay T502 đo đúng thứ lát 37
chứng minh được, còn "≤ 300ms" ở lại T508.

**Số đo thật của lát 37** (bản build, cổng 4173, rAF thay bằng `setTimeout` vì
pane không được vẽ): mức Chậm được chọn sẵn khi mở trận, bốn nhãn đúng thứ
tự Chậm → Thường → Nhanh → Rất nhanh; hai chặng di chuyển đo được **914,1ms và
916,7ms** (trước T501 là 280ms, bị trần cắt); mức Rất nhanh **0 khung** được xin
trong ~1 giây mà toạ độ vẫn đổi qua 29 giá trị; không lỗi console.

## Phase 38 — hai thứ chỉ lộ ra khi làm thật

**1. Hàm dáng theo thể lực cũng có cú phanh, và nó khó thấy hơn.** Bỏ smoothstep
là xong cú phanh của người sung sức, nhưng dáng của D88 là `u ** mu` với
`mu > 1`, mà hàm ấy có **đạo hàm bằng 0 tại `u = 0`**. Tức người kiệt sức vẫn
xuất phát từ vận tốc 0 ở **mọi** mốc — đúng điều AC-30.1 cấm, chỉ khác là nó
chỉ xảy ra với người mệt nên còn dễ lọt hơn. Sửa bằng cách **trộn** một phần
tuyến tính vào dáng (`TRON_TOI_DA = 0,8`): đạo hàm ở hai đầu luôn `≥ 0,2`, mà
đoạn giữa vẫn tụt lại sau người sung sức đúng như D88 đòi — bốn phép kiểm cũ
của D88 vẫn xanh không phải sửa một dòng.

**2. Hai lần tôi viết phép đo sai trước khi viết được phép đo đúng.** Phép kiểm
"tốc độ tại mốc không về 0" đỏ oan hai lần: lần đầu vì ngưỡng `eps/4` không
tính đến phần tuyến tính chỉ còn 0,2; lần hai vì tôi chuẩn hoá theo **dây cung
của chặng này** trong khi tốc độ vào là của **chặng trước** và hoàn toàn có thể
nhỏ hơn. Bản cuối buộc ngưỡng vào đúng điều lớp này bảo đảm
(`tocDoVao × eps × (1 − TRON_TOI_DA)`), nên nó vừa đúng vừa bắt được việc ai đó
quay về `u ** mu` thuần — lúc ấy con số tụt xuống ~2e-6, nhỏ hơn ngưỡng cả
nghìn lần.

Cùng loại lỗi ấy lặp lại ở phép đo trên ứng dụng: "không hai khung liền cùng
một toạ độ" đo ra 4% khung trùng, nhưng nguyên nhân là **làm tròn thuộc tính
SVG** ở những điểm di chuyển quãng rất ngắn, không phải phanh. Phép đo đúng là
**độ dài chuỗi chuyển động liên tục**, và tiêu chí của T504 đã được sửa theo.

**Số đo thật của lát 38** (bản build, mức Chậm, rAF thay bằng `setTimeout`, lấy
mẫu **ngay sau mỗi khung vẽ**):
- **Chuỗi chuyển động liên tục dài nhất: 3590ms**, tức băng qua **~4,0 chặng**
  900ms mà không một khung nào đứng im. Trước T503 điều này **không thể xảy
  ra**: mọi chặng kết thúc ở vận tốc 0 rồi điểm đứng chờ hết quãng trống giữa
  hai nhịp, nên một chuỗi không bao giờ dài hơn một chặng.
- **Chặng của bóng: 286, 283, 285ms** so với 900ms của người — tỉ lệ ~3,16, đúng
  `msChuyen / 3` (chênh nhỏ là do độ thưa của khung vẽ).
- Tỉ lệ bước-đầu trên bước-giữa **không dùng được** làm bằng chứng: nhịp khung
  do `setTimeout` sinh ra dao động mạnh nên bước mỗi khung dao động theo.
- Không lỗi console.

- **Phạm vi thật của "thêm một mức tốc độ" rộng hơn danh sách file trông thấy.**
  Đã grep: `MucTocDo` xuất hiện ở `useMatch.ts` (4 chỗ) và
  `BangDieuKhienTran.tsx` (4 chỗ), và chỉ có **hai** `Record<MucTocDo, …>`
  (`MS_MOI_PHUT`, `KHOA_TOC_DO`). Nhưng **hai file test cũng chạm**:
  `noiSuy.test.ts:3` và `san2D.test.ts:16` đều `import { MS_MOI_PHUT }` rồi
  duyệt `Object.entries` — nên thêm một mức là **tự động** mở rộng ba phép kiểm
  ở đó sang mức mới. Đó là tin tốt: chúng kiểm hộ mức mới.
  *(Sửa ngày 2026-11-18 sau khi làm Phase 37: câu dự đoán cũ ở đây — "một trong ba
  sẽ đỏ cho tới khi T512 xong vì gặp nhịp 1000ms" — đã sai. Xem mục "Phase 37 —
  ba thứ chỉ biết được khi làm thật" ở trên.)*
- **Chuỗi phụ thuộc dài nhất** đi qua `San2D.tsx`: T500 → T501 → T503 → T504 →
  T508 → T510 → T512 → T516 → T517 → T518 → T519, tức **11 mắt** — dài hơn spec
  004 (9 mắt). Lý do không phải logic mà là **một file**: `San2D.tsx` (689 dòng)
  bị bốn lát cùng chạm, nên các task sửa nó phải đi tuần tự dù về mặt AC chúng
  độc lập.
- **Chạy song song được thật:** T507 (test lớp dao động) song song với mọi task
  sửa `San2D.tsx`; T515 (nhịp lặng, chỉ chạm `useMatch.ts`) song song với cả lát
  41; và **cả lát 41** (T513, T514) chỉ cần T500, nên làm 37 → 41 trước 38 → 40
  là một thứ tự hợp lệ nếu muốn thấy quả bóng và hiệu ứng bàn thắng sớm.
- **Hiến pháp mục 4** đòi test cho lớp engine và lớp dữ liệu; spec này không
  chạm hai lớp ấy, nhưng ba lớp thuần của nó phải giữ nguyên tính chất "test gọi
  thẳng được": `noiSuy.ts` (T503, T512), `hinhSan`/`thoiGianChuyen` trong
  `San2D.tsx` (T501, T510, T511, T513), và `daoDong.ts` mới (T506, T507). Task
  chạm ba chỗ ấy mà chưa có test là **chưa xong**.
- **Bốn việc với test hiện có**, mỗi việc nằm trong đúng một task để không ai
  làm lẫn: giữ nguyên tuyệt đối describe "toạ độ tại mốc" (T503, T512); **sửa**
  describe D88 thành hai nhánh (T512); **đổi** describe AC-25.3 sang AC mới
  (T512); **thay** bốn phép kiểm `thoiGianChuyen` (T501).
- **P8 ở hai chỗ**, cùng commit với code: nhãn "Chậm" / "Slow" (T500) và chữ
  "BÀN THẮNG!" / "GOAL!" (T514).
- **Một mệnh đề của spec 001 bị thay thế, đừng ngạc nhiên khi thấy.** AC-10.2
  của spec 001 ghi "các cầu thủ còn lại PHẢI giữ vị trí đứng theo đội hình" và
  đã được kiểm tay bằng 14 mẫu liên tiếp. US-28 và T510 cố ý làm ngược lại;
  spec 005 mục 10.1 tuyên bố thay thế mệnh đề ấy. **Mệnh đề thứ nhất của AC-10.2
  — người tham gia phải tới vùng có bóng — vẫn đúng và AC-28.3 canh nó.**
- **Không tạo file nào ngoài danh sách trên.** Phát sinh thêm → dừng, cập nhật
  `plan.md` / `tasks.md` trước. Hai file mới duy nhất của spec này là
  `src/ui/daoDong.ts` và `src/ui/daoDong.test.ts`.
