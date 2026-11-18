# Tasks: Sân 2D sống như một trận thật

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 30 AC (US-28 → US-32), 11 quyết định D89–D100 |
| **Tiến độ** | 25/27 |
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

- [x] **T506** — Lớp dao động chờ, hàm thuần
  - File: tạo `src/ui/daoDong.ts`
  - Xong khi: `lechDaoDong(playerId, thoiDiemTran, bienDo)` trả về một **lệch** (không phải toạ độ) luôn nằm trong `bienDo`, và `bienDo` là **hai số cho hai trục**, mỗi trục tối đa **một phần tám khoảng giãn** (D89 đã siết sau `/analyze`); `phaCuaNguoi(playerId)` băm tất định từ chuỗi id; **không** gọi `Math.random`, `Date.now` hay `performance.now` — mọi thứ đi vào qua tham số (P1); file này không import gì từ `components/`.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.2, AC-28.4
  - Phụ thuộc: —

- [x] **T507** [P] — Test lớp dao động
  - File: tạo `src/ui/daoDong.test.ts`
  - Xong khi: cùng `playerId` + cùng thời điểm trận → cùng lệch (P1); hai `playerId` khác nhau → hai pha khác nhau (AC-28.4); lệch luôn trong biên với mọi đầu vào, kể cả `NaN` và số âm; **hai điểm cùng một vùng, lệch ngược chiều nhau tối đa, vẫn cách nhau ít nhất ba phần tư khoảng giãn** (AC-30.5 và AC-15.2 của spec 002); **hai điểm cùng một hàng lệch nhau không quá một phần tư** (AC-30.3); khi thời điểm trận nhích đều thì lệch **đổi trong mọi cửa sổ 300ms** (AC-28.1); thay `Math.random` bằng một hàm ném lỗi rồi gọi vẫn chạy — đúng cách `generator.test.ts` và `tenNgauNhien.test.ts` đang kiểm.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.2, AC-28.4
  - Phụ thuộc: T506

- [x] **T508** — Vòng khung hình chạy liên tục, hai prop mới, tạm dừng đóng băng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: **tách hai effect** — một dựng dữ liệu chặng, vẫn khoá theo `khoaMoc`; một giữ vòng `requestAnimationFrame`, khoá theo `[dangChay, giamChuyenDong]`; `San2D` nhận hai prop mới `phutDongHo` và `dangChay` từ `TrangTran` (chỗ dựng `<San2D>` **duy nhất** của repo); `dangChay = false` → **0 khung** và sân đóng băng, giữ thời điểm trận trong ref để lúc tiếp tục không nhảy; đổi ngôn ngữ giữa một chặng **không** làm toạ độ nhảy về đầu chặng; ẩn sân rồi hiện lại thì các điểm **không chạy lại một chặng cũ** — đo bằng quãng đi được ngay sau khi hiện: phải ở cỡ dao động, không phải cỡ một chặng (AC-31.7); đo ở **từng mức còn nội suy** (Chậm, Thường, Nhanh): mọi điểm đổi toạ độ ít nhất một lần mỗi 300ms; ở mức Rất nhanh **không** đòi điều đó (AC-28.1 đã giới hạn sau `/analyze`); **sửa chú thích đầu file** — câu "KHÔNG vòng lặp animation" sai từ spec 004.
  - Bằng chứng: **số**.
  - AC: AC-28.1, AC-28.3, AC-28.5, AC-31.7
  - Phụ thuộc: T506, T504 *(cùng chạm `San2D.tsx` nên làm sau lát 38, không song song)*
  - ⚠️ `phutDongHo` lấy từ `tran.phut` (phút ĐỒNG HỒ), **không** từ `suKien.phut` — phút hiển thị không nhích khi một phút không có tình huống nào, và dao động sẽ đứng chết hàng giây (bẫy đã biết từ Phase 34, ghi trong D90).

- [x] **T509** — Giảm chuyển động tắt **cả hai** lớp
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: giả lập `matchMedia('(prefers-reduced-motion: reduce)')` trả `matches: true` → 0 khung **và** lệch dao động bằng 0, mà toạ độ tại mốc vẫn đúng từng điểm.
  - Bằng chứng: **số**.
  - AC: AC-31.1
  - Phụ thuộc: T508

---

## Phase 40 — Lát 40: Đội hình có tổ chức

- [x] **T510** — Khối đội hình nghiêng theo bóng (D94)
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `hinhSan` dịch chỗ đứng theo vùng của bóng, **chỉ với người KHÔNG tham gia tình huống**, biên **một phần mười chiều dài sân**, và vẫn đi qua phép kẹp vào mặt cỏ đã có; phép kiểm mới: nghiêng khối **không** đẩy ai ra khỏi vùng của mình (AC-28.3) và **không** làm hai điểm chồng khít (AC-30.5); hai phép kiểm sẵn có "số điểm trên sân" và "điểm không chồng khít" vẫn xanh.
  - Bằng chứng: **số** cho ba điều trên; **mắt** cho câu "sơ đồ 4-4-2 vẫn ra 4-4-2".
  - AC: AC-30.4, AC-28.3, AC-30.5
  - Phụ thuộc: T508
  - ⚠️ Đây là chỗ D94 cho phép đổi cách tính vị trí tại mốc, và quyền ấy **chỉ** tới đó: không dịch người tham gia tình huống, không vượt biên, không bỏ phép kẹp.

- [x] **T511** — Hàng ngang vẫn ra hàng ngang
  - File: sửa `src/ui/san2D.test.ts`, *(nếu phải siết biên)* sửa `src/ui/daoDong.ts`
  - Xong khi: phép kiểm — lấy một hàng bốn người, chạy qua nhiều thời điểm trận, độ lệch ngang giữa hai người trong hàng **luôn dưới một phần tư** khoảng giãn; nếu đỏ thì **siết biên độ dao động**, không nới ngưỡng của phép kiểm.
  - Bằng chứng: **số**.
  - AC: AC-30.3
  - Phụ thuộc: T510
  - ⚠️ Phần lớn AC-30.3 **đã đúng sẵn** (người cùng hàng có cùng toạ độ ngang). Task này là lưới **giữ** nó đúng sau khi thêm dao động và nghiêng khối — nên nếu nó xanh ngay từ đầu thì đừng tưởng là viết sai: hãy thử tăng biên độ lên gấp ba và xem nó có đỏ không.

- [x] **T512** — Hai chế độ thể lực (D93, mở lại D88)
  - File: sửa `src/ui/noiSuy.ts`, sửa `src/ui/noiSuy.test.ts`, sửa `src/ui/components/San2D.tsx`
  - Xong khi: nhịp **≥ 500ms** → người sung sức dùng 75% nhịp, người kiệt sức tới 95%, nên kiệt sức tới đích **muộn hơn** mà vẫn **trước** nhịp sau; nhịp < 500ms → giữ đúng D88 (cùng thời lượng, khác dáng); describe "thể lực đổi DÁNG" được **SỬA thành hai nhánh, không bỏ**; describe "không điểm nào còn đang đi khi tình huống kế tiếp tới (AC-25.3)" đổi tên và đổi nội dung sang AC mới — "không điểm nào bị **giật**" — và phủ **cả hai** chế độ ở **cả bốn** mức tốc độ; **describe "toạ độ tại mốc" không sửa một dòng (R38)**; **không đổi engine**.
  - Bằng chứng: **số**.
  - AC: AC-30.6, AC-29.3
  - Phụ thuộc: T503, T510 *(cùng chạm `San2D.tsx`)*

---

## Phase 41 — Lát 41: Thấy bóng, thấy bàn thắng

> Lát này **độc lập với lát 38–40**: nó chỉ cần lát 37 để có nhịp chậm mà xem
> hiệu ứng. Muốn thấy thêm một thứ rõ rệt ngay sau lát đầu thì làm 37 → 41.

- [x] **T513** [P] — Quả bóng luôn có mặt, và đứng đúng chỗ theo loại dòng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: bóng được vẽ ở **mọi** dòng tường thuật; dòng khai cuộc và hết hiệp → bóng ở **điểm giao bóng giữa sân**; dòng không mang đường bóng và cũng không phải hai loại ấy (`thay-nguoi`, `kiet-suc`) → bóng **giữ chỗ cuối cùng**; trận đang tạm dừng hay đã kết thúc vẫn có bóng; phép kiểm `hinhSan` cho cả ba loại dòng.
  - Bằng chứng: **số**.
  - AC: AC-32.1, AC-32.2, AC-32.3, AC-32.7
  - Phụ thuộc: T500
  - ⚠️ Gốc của việc này: bóng **đã** được vẽ từ spec 001 nhưng chỉ khi dòng đang hiện mang đường bóng, mà `thay-nguoi`, `kiet-suc`, khai cuộc và hết hiệp đều truyền đường bóng rỗng — riêng "kiệt sức" là 5 dòng một trận.

- [x] **T514** — Hiệu ứng bàn thắng ba phần, và chuỗi hai ngôn ngữ
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: dòng `'ban-thang'` đang hiện thì sân vẽ **ba phần cùng lúc** — vòng tròn bán kính lớn dần từ chỗ ghi bàn, điểm người ghi bàn tăng bán kính, và dòng chữ "BÀN THẮNG!" / "GOAL!" trên mặt sân; bán kính phóng to bị chặn **dưới khoảng cách gần nhất giữa hai điểm đo được trên sân** — không phải dưới khoảng giãn của hai người cùng vùng, vì cặp chật nhất là cặp khác vùng (R45); giảm chuyển động → **chỉ còn chữ**; phép kiểm "điểm không chồng khít" chạy cả ở trạng thái đang có hiệu ứng.
  - Bằng chứng: **số** cho biên và cho việc chỉ-còn-chữ; **mắt** cho cảm giác.
  - AC: AC-32.4, AC-32.6
  - Phụ thuộc: T513

- [x] **T515** [P] — Nhịp lặng 1,5 giây sau bàn thắng (D100)
  - File: sửa `src/hooks/useMatch.ts`
  - Xong khi: phút vừa mô phỏng có sự kiện `'ban-thang'` thì hẹn giờ cho phút kế tiếp dài thêm ~1500ms; **`dangChay` không đổi** nên nút Tạm dừng / Tiếp tục không nhấp nháy chữ (AC-32.5); bàn thắng ở phút cuối **không** chặn việc trận kết thúc và việc lưu vào lịch sử; chế độ "chạy hết trận" không bị ảnh hưởng (nó không đi qua vòng đồng hồ); nhịp lặng xảy ra **cả khi đang ẩn sân**.
  - Bằng chứng: **số**.
  - AC: AC-32.5
  - Phụ thuộc: —
  - ⚠️ Đây là lần **duy nhất** spec này chạm vòng đồng hồ. Không gọi `tamDung()` rồi `tiepTuc()` — đường ấy làm nút đổi trạng thái ngay trước mắt người dùng, đúng điều AC-32.5 cấm.

---

## Phase 42 — Lát 42: Kiểm tay, đo ngân sách, đóng spec

- [x] **T516** — Kiểm tay bốn tổ hợp, một lượt giảm chuyển động, và biên mục 5
  - File: — *(kiểm trên bản build)*
  - Xong khi: đi hết màn hình trận ở **bốn tổ hợp** ngôn ngữ × chế độ màu, không sót chữ, không chỗ nào tương phản dưới 4.5:1; một lượt với giảm chuyển động đang bật; và đi hết bảng trường hợp biên mục 5 của spec — phút 0, tạm dừng, hết trận, thẻ đỏ, thay người, sân 5 người, hai bàn liền nhau, bàn ở phút cuối, ẩn sân khi có bàn, bàn trong lúc chạy hết trận.
  - Bằng chứng: **số** cho tương phản và chuỗi; **mắt** cho phần còn lại.
  - AC: AC-31.1, AC-31.2, AC-31.6, AC-32.1 → AC-32.7
  - Phụ thuộc: T502, T505, T509, T511, T512, T514, T515

- [x] **T517** — Đo hai ngân sách ở **cả bốn** mức tốc độ
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

## Phase 43 — Lát 43: Hai lỗi mắt người dùng bắt được ở T518

> Hai task này sinh ra **sau** khi người dùng xem thật một trận (T518) và chỉ ra ba
> điều. Hai điều đầu là **lỗi của chính spec này** và sửa ở đây. Điều thứ ba — bóng
> dính chân người dẫn, qua người, chuyền và sút, đường bóng liên tục — là **tính
> năng mới**, không thuộc spec này: nó cần một mô hình chuyển động giữa hai mốc mà
> engine hiện không kể ra. Để cho spec 006.

- [x] **T520** [P] — Quả bóng và chữ "BÀN THẮNG!" vẽ **sau** các điểm cầu thủ
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: trong SVG, quả bóng và kênh chữ của hiệu ứng nằm **sau** `cacDiem.map` theo thứ tự phần tử, nên không điểm người nào đè lên được ở **bất kỳ khung nào**; đo trên ứng dụng đang chạy: chỉ số thứ tự của bóng lớn hơn chỉ số của điểm người cuối cùng.
    - *Tiêu chí này đã được sửa lúc làm, và đây là lần thứ năm cùng một thói xấu.* Bản đầu đòi "**0% số khung** có bóng bị che" — nhưng thứ đo được là "tâm bóng nằm trong lòng một điểm", mà điều ấy **vẫn xảy ra 33,8% số khung sau khi sửa** và đúng ra phải xảy ra: bóng ở trong chân một người thì nó phải chồng lên điểm của người ấy. Thứ phải đúng không phải là "không chồng" mà là "**vẽ sau cùng**", và nó đúng bằng **cấu trúc** chứ không theo tỉ lệ phần trăm.
  - Bằng chứng: **số** (thứ tự phần tử trong DOM + tỉ lệ khung bị che).
  - AC: AC-32.1
  - Phụ thuộc: T513, T514

- [x] **T521** — Thủ môn ở lại một phần ba sân của mình
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `hinhSan` kẹp toạ độ dọc của thủ môn vào **một phần ba sân đội anh ta**, kể cả khi anh ta là người tham gia tình huống ở vùng khác; thủ môn **không** nhận dịch co khối; phép kiểm mới chạy 10 mã trận × 7 quân số × mọi dòng; hai phép kiểm "số điểm" và "điểm không chồng khít" vẫn xanh; đo trên bản build: biên dọc của cả hai thủ môn **dưới một phần ba chiều dài sân** (trước khi sửa: 30,6 đơn vị, tới `x = 85,2` của thủ môn đội khách).
  - Bằng chứng: **số**.
  - AC: AC-30.7, AC-28.3
  - Phụ thuộc: T510
  - ⚠️ Đây là **ngoại lệ duy nhất** của AC-28.3, đã ghi thẳng vào spec mục 3. Không nới ngoại lệ ra cho vị trí nào khác.

---

## Phase 44 — Lát 44: Hai hàng đứng đúng chỗ, và quả bóng trông ra quả bóng

> Lại là mắt người dùng ở T518. Lần này cái thứ nhất nặng hơn vẻ ngoài của nó:
> nó là **lỗi bố cục có từ spec 001**, không phải lỗi của spec này.

- [x] **T522** [P] — Quả bóng trắng đen như bóng thật
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: bóng vẽ bằng nền **trắng**, viền sẫm và **mảng đen** bên trong; tương phản nền bóng với mặt cỏ ≥ 4,5:1 ở cả hai chế độ màu; bóng vẫn vẽ sau các điểm người (T520) và vẫn có mặt ở mọi dòng (T513).
  - Bằng chứng: **số** cho tương phản; **mắt** cho "trông ra quả bóng".
  - AC: AC-32.8
  - Phụ thuộc: T520

- [x] **T523** — Bốn hàng của hai đội xen kẽ đúng thứ tự bóng đá
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: chỗ đứng theo sơ đồ dùng **bảng dải riêng cho từng đội** thay cho một bảng chung lật theo chỉ số; phép kiểm mới: thứ tự dọc sân là TM nhà → HV nhà → TĐ khách → TV nhà → TV khách → TĐ nhà → HV khách → TM khách, đúng ở **cả chín tổ hợp độ cao đội hình**; người tham gia tình huống và quả bóng dùng **bảng trung lập** nên vẫn tụ đúng một chỗ; ba phép kiểm sẵn có — số điểm, điểm không chồng khít (10 mã trận), thủ môn trong một phần ba sân — vẫn xanh.
  - Bằng chứng: **số**.
  - AC: AC-30.8, AC-30.5
  - Phụ thuộc: T510, T521
  - ⚠️ Đây là **thay đổi bố cục của spec 001**, không phải tinh chỉnh của spec 005: `TI_LE_DAI` và `LECH_DOI` có từ đó. Mọi con số của trận **không đổi** — đây thuần là chỗ vẽ.

---

## Phase 45 — Lát 45: Bóng đi đường của nó

- [x] **T524** — Bóng đi hết đường chuyền, và đường kẻ vàng bị bỏ
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: bóng đi qua **từng vùng** của pha bóng theo đúng thứ tự, tốc độ đều theo **chiều dài** (không phải theo số đoạn), xuất phát từ **chỗ bóng đang đứng** chứ không từ điểm đầu của pha; cả pha không dài hơn một nhịp; `<polyline>` vàng bị xóa; phép kiểm thuần cho lớp đi dọc đường, kèm một phép kiểm chứng minh pha bóng thật có nhiều hơn một đoạn.
  - Bằng chứng: **số**.
  - AC: AC-30.9, AC-30.2
  - Phụ thuộc: T505, T513

---

## Phase 46 — Lát 46: Tốc độ gần đều, và hết vòng rộng

- [x] **T525** — Quãng dài thì đi lâu hơn, không đi nhanh hơn
  - File: sửa `src/ui/noiSuy.ts`, sửa `src/ui/noiSuy.test.ts`, sửa `src/ui/components/San2D.tsx`
  - Xong khi: thời lượng một chặng nhân thêm hệ số `(quãng / quãng chuẩn) ^ 0,75`, chặn trong `[0,12; 1]`; tỉ lệ tốc độ trên dải quãng thật **dưới 4 lần**; không chặng nào vượt một nhịp ở cả bốn mức; hai nhánh thể lực của D93 vẫn còn tiếng nói.
  - Bằng chứng: **số**.
  - AC: AC-30.10
  - Phụ thuộc: T512

- [x] **T526** — Tiếp tuyến vào bị chặn theo dây cung của chính chặng ấy
  - File: sửa `src/ui/noiSuy.ts`, sửa `src/ui/noiSuy.test.ts`
  - Xong khi: `huongVao` lớn hơn dây cung bị thu về đúng một dây cung, **giữ nguyên hướng**; độ vòng đo trên ứng dụng (đường đi thật chia đường chim bay) lớn nhất **dưới 5** (trước: 9,57); phép kiểm "tốc độ tại mốc không về 0" được **sửa mốc so** sang tốc độ đã chặn, không bỏ.
  - Bằng chứng: **số**.
  - AC: AC-30.11, AC-30.1
  - Phụ thuộc: T503

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-28.1 | T506, T507, T508, T518 |
| AC-28.2 | T506, T507 |
| AC-28.3 | T508, T510, T521 |
| AC-28.4 | T506, T507, T518 |
| AC-28.5 | T508 |
| AC-29.1 | T501, T502, T518 |
| AC-29.2 | T501 |
| AC-29.3 | T502, T512 |
| AC-29.4 | T501 |
| AC-29.5 | T500 |
| AC-30.1 | T503, T504, T518 |
| AC-30.2 | T505, T518, T524 |
| AC-30.3 | T511, T518 |
| AC-30.4 | T510, T518 |
| AC-30.5 | T510 |
| AC-30.6 | T512 |
| AC-30.7 | T521 |
| AC-30.8 | T523 |
| AC-30.9 | T524 |
| AC-30.10 | T525 |
| AC-30.11 | T526 |
| AC-31.1 | T509, T516 |
| AC-31.2 | T516 |
| AC-31.3 | T517 |
| AC-31.4 | T517 |
| AC-31.5 | T500 |
| AC-31.6 | T516 |
| AC-31.7 | T508 |
| AC-32.1 | T513, T516, T520 |
| AC-32.2 | T513, T516 |
| AC-32.3 | T513, T516 |
| AC-32.4 | T514, T516 |
| AC-32.5 | T515, T516 |
| AC-32.6 | T514, T516 |
| AC-32.7 | T513, T516 |
| AC-32.8 | T522 |

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

## Phase 39 — một lỗi thật, và một thói xấu của chính tôi

**1. Phép kiểm bắt đúng một lỗi thật trong hàm băm.** FNV-1a thuần trộn các bit
THẤP rất tốt nhưng để các bit CAO gần như nguyên, mà phép chia cho 2^32 để ra pha
lại đọc đúng các bit cao. Đo thật: mọi `playerId` dạng `cau-thu-N` cho pha dồn
trong khoảng **5,6–5,8** trên dải 0–2π — tức cả 22 điểm dao động gần như cùng
một nhịp, đúng cái "khối máy" mà AC-28.4 cấm. Sửa bằng ba dòng trộn cuối của
murmur3; pha giờ trải từ 0,65 tới 3,86 trên mẫu 10 người.

**Nhưng bản đầu của phép kiểm ấy cũng sai thiết kế**: nó chọn đúng **một cặp**
id rồi đòi hai người lệch nhau. Hai cầu thủ hoàn toàn có thể tình cờ gần pha
nhau mà cả sân vẫn không đồng loạt — đo thật thì `hv-1` và `hv-2` chỉ lệch
0,218 trên biên 0,5. Tính chất đúng là **tập pha trải ra cả dải**, và đó cũng
là thứ bắt được lỗi băm.

**2. Bốn lần trong ba lát cắt, tiêu chí "Xong khi" đo sai thứ.** Đây là một thói
xấu có hệ thống của tôi lúc chẻ task, nên ghi ra để đọc ba lát còn lại với con
mắt nghi ngờ: tiêu chí hay được viết bằng một **triệu chứng dễ đo** thay vì
bằng **tính chất cần đúng**.
- Lát 37: "quãng không đổi toạ độ ≤ 300ms" — thuộc lát 39, không phải 37.
- Lát 38: "không hai khung liền cùng toạ độ" — bắt cả việc làm tròn SVG.
- Lát 39: "đổi ngôn ngữ không làm toạ độ nhảy về đầu chặng" — đo độ lệch thì
  không phân biệt được với việc điểm đang đi bình thường; đo **vận tốc** mới
  phân biệt được (chạy lại chặng thì vận tốc tụt hẳn).
- Lát 39: "ẩn rồi hiện thì điểm ở đúng chỗ hiện tại" — đo ra lệch **46,62 đơn
  vị**, nhưng đó là khoảng cách giữa một vị trí **người xem không bao giờ
  thấy** (lúc ẩn, đang giữa chặng) và chỗ điểm đi tiếp. Dự liệu chặng nằm
  trong một ref, chết cùng component, nên không phục hồi được — và cũng
  **không cần**: điều AC-31.7 cấm là *chạy lại một chặng cũ*, và đo sau khi
  hiện thì điểm chỉ đi **1,84 đơn vị trong 350ms** (cỡ dao động), không phải
  cỡ một chặng. Tiêu chí đã viết lại theo đúng điều cần cấm.

**Số đo thật của lát 39** (bản build, lấy mẫu ngay sau mỗi khung vẽ):
- **Khoảng đứng im lâu nhất của một điểm: 0ms** ở cả ba mức còn nội suy (Chậm,
  Thường, Nhanh) — ngưỡng là 300ms, và trước lát này con số ấy là **2114ms**.
  Mọi điểm đổi toạ độ ở **mỗi** khung vẽ.
- Tạm dừng: **0 khung** được xin trong 1,5 giây, toạ độ đóng băng (AC-28.5, và
  AC-10.4 của spec 001 vẫn đúng); bấm Tiếp tục thì khung trở lại.
- Đổi ngôn ngữ giữa chặng: vận tốc trung vị 4,26 → 4,62 đơn vị/giây, tỉ lệ
  **1,08** — không tụt, tức chặng không bị dựng lại.
- Giảm chuyển động: **0 khung**, và chỉ **3 bộ vị trí khác nhau trong 1,5 giây**
  (đổi theo nhịp, không theo khung) — cả hai lớp đều tắt.
- Không lỗi console.

**Sửa một chú thích sai từ spec 004:** đầu `San2D.tsx` vẫn ghi "KHÔNG vòng lặp
animation... vòng lặp chính là thứ sẽ phá ngân sách 3 giây". Sai từ lúc lát 33
thêm nội suy. Nay nói đúng: có vòng lặp, chạy liên tục, và ngân sách 3 giây
không bị đe doạ vì chế độ chạy hết trận không đi qua vòng khung hình nào.

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

## Phase 41 — hai lần sai biên, và một hiệu ứng không bao giờ hiện

**1. Hiệu ứng bàn thắng chạy 0 trên 383 mẫu, trong một trận 1–0.** Bản đầu của
T514 gắn **tuổi thọ** hiệu ứng vào `suKien.loai === 'ban-thang'`, tức vào dòng
tường thuật đang hiện. Nhưng một dòng chỉ ở trên màn hình đúng **một nhịp** — 70ms
ở mức Nhanh — còn hiệu ứng phải dài 1500ms, nên nó bị cắt trước khi kịp vẽ một
khung. Sửa bằng một **ảnh chụp** vào ref (chỗ ghi bàn, người ghi, mốc thời gian) có
**đồng hồ riêng**: dòng sự kiện chỉ còn là thứ **kích hoạt**, không phải thứ **duy
trì**. Đo lại: 91 mẫu có vòng sáng và chữ, mỗi hiệu ứng 1468 và 1465ms.

**2. Biên phóng to điểm người ghi bàn sai HAI lần, cả hai vì suy từ cấu trúc mà
không đo.** Đây là rủi ro R45 thành thật, và nó thành thật hai lần:
- Bản đầu `min(BAN_KINH, BUOC_GIAN / 2)` = **3,4** — gần sáu lần mức cho phép.
- Bản hai `BUOC_GIAN - 2 * BAN_KINH` = **1,2**, suy từ khoảng trống giữa hai người
  **cùng một vùng**. Vẫn gần gấp đôi, vì cặp chật nhất trên sân không phải cặp
  cùng vùng mà là một cặp **khác vùng**, nơi hai đội chỉ lệch nhau `LECH_DOI` = 4.

Sàn thật chỉ biết được bằng cách **đo**: 10 mã trận × 7 quân số × mọi dòng tường
thuật = **5905 khung**, khoảng cách gần nhất giữa hai điểm là **đúng 4,0 đơn vị**
(`BUOC_GIAN / 2`), tức **1,176 bán kính**. Và đo riêng **330 bàn thắng** thì chính
người ghi bàn là một nửa của cặp chật nhất ấy — biên này thật sự bị ràng, không
phải lo xa. Chốt `(BUOC_GIAN / 2 - BAN_KINH) * 3 / 4` = **0,45**, chỉ lấy ba phần tư
chỗ trống để còn chứa hai lớp dịch tâm điểm đứng sau `hinhSan`.

**3. Phép kiểm "điểm không chồng khít" của spec 002 KHÔNG bắt được R45, và đó
không phải lỗi của nó.** Hiệu ứng không dịch tâm điểm nào, nên phép kiểm đo
khoảng cách tâm vẫn xanh y nguyên dù điểm có phì gấp đôi. T514 vì thế thêm một
describe mới đo **cùng một ngưỡng** nhưng bằng **bán kính đã phóng to**, trên mọi
bàn thắng của 70 trận — chạy cả ở trạng thái đang có hiệu ứng, đúng tiêu chí T514.

**Số đo thật của lát 41** (bản build, mức Nhanh, rAF thay bằng `setTimeout`):
- Quả bóng có mặt ở **383/383 mẫu** của một trận trọn vẹn, kể cả những dòng
  `thay-nguoi` và `kiet-suc` trước đây làm nó biến mất (AC-32.1 → AC-32.3).
- Hiệu ứng bàn thắng: **1468ms** và **1465ms** cho hai bàn liền nhau; bán kính vòng
  sáng lớn nhất **26,97** so với **8** lúc không có hiệu ứng.
- Điểm người ghi bàn: bán kính **3,4 → 3,85** đúng như biên đã chốt.
- Nhịp lặng: bốn khoảng nhịp dài nhất **1597 / 1591 / 1590 / 1567ms** đúng ở bốn phút
  có bàn thắng, so với trung vị **94ms**; nút Tạm dừng **không đổi chữ** một lần
  nào (AC-32.5).
- Không lỗi console.

**4. Một việc lộ ra nằm NGOÀI lát này, không sửa ở đây — thuộc AC-30.5 / T510.**
Đo trên mức vẽ thật (sau cả nội suy lẫn dao động), một trận 90 phút ở mức Nhanh:
**250 trên 692 khung (36,1%)** có hai điểm cách nhau **dưới một bán kính**, chỗ chật
nhất chỉ **0,034 bán kính** — tức hai điểm gần như trùng. Nguyên nhân **không phải**
hiệu ứng bàn thắng: `hinhSan` chỉ bảo đảm giãn **TẠI mốc**, còn nội suy cho hai
điểm đi **băng qua nhau** giữa hai mốc, và dao động khép thêm tới hai đơn vị mỗi
trục. Hai lớp ấy thuộc Phase 38 và 39 đã commit, còn AC-30.5 được bảng phủ AC giao
cho **T510**, nên việc này đợi Phase 40 — không tự mở rộng phạm vi ở lát 41. Hai
phép kiểm thuần hiện có không thể thấy điều này: `san2D.test.ts` chỉ đọc toạ độ
của `hinhSan`, còn `daoDong.test.ts` chỉ đo cặp **cùng vùng** và **cùng hàng**.

## Phase 40 — ba lần sai, và một lần tôi báo động sai

**1. Nghiêng khối sai hai lần, và cả hai lần phép kiểm AC-15.2 của spec 002 là thứ
bắt được.** Một spec đóng từ hai lần trước đứng ra canh đúng chỗ nó sinh ra để
canh — đáng ghi lại, vì đó là lý lẽ cụ thể cho việc **không sửa ngược phép kiểm
của spec đã đóng**:
- **Bản một — dịch cả khối theo tỉ lệ đều.** Hai dải giữa cho dịch **3,43** đơn
  vị, mà `LECH_DOI` = **4** là khoảng lệch **duy nhất** tách một người không tham
  gia khỏi người tham gia đứng cùng dải. Dịch triệt tiêu gần hết khoảng ấy: hai
  điểm còn cách **0,57** đơn vị trên bán kính 3,4.
- **Bản hai — dịch nguyên `r/10` theo dấu** (có dải chết ở khu giữa sân để tránh
  dải nguy hiểm 0,6–7,4 đơn vị ở trên). Lần này vỡ ở **phép kẹp mặt cỏ**: dịch 10
  đơn vị đẩy người ở dải ngoài cùng ra khỏi cỏ, mà phép kẹp thì dồn **mọi người
  bị kẹp về đúng một toạ độ** — thủ môn đội nhà và một tiền đạo đội khách cách
  nhau **0,00**.
- **Bản đúng — CO khối về phía bóng, không trượt khối theo bóng.** Dịch của mỗi
  người tỉ lệ với khoảng cách từ dải của anh ta tới dải có bóng (hệ số 1/7, nên
  người xa nhất dịch đúng `r/10`). Ba tính chất thành đúng **bằng cấu trúc**, không
  bằng cẩn thận: dịch bằng **0** ở đúng dải có bóng nên khoảng lệch 4 đơn vị không
  bị ăn; mọi dịch **hướng vào trong** nên không ai bị đẩy ra mép cỏ; hệ số < 1 nên
  thứ tự các dải không đảo — 4-4-2 vẫn ra 4-4-2, chỉ gọn lại một phần bảy.

**2. T511 xanh ngay từ lần chạy đầu, và `tasks.md` đã dặn đúng việc phải làm.** Lời
dặn "nếu nó xanh ngay thì đừng tưởng là viết sai — hãy thử tăng biên độ lên gấp ba"
đã thành một phép kiểm thứ tư trong file: biên độ gấp ba thì hàng tan ở hơn một
phần tư các thời điểm đo. Một phép kiểm xanh mà không ai biết nó có đỏ được hay
không thì không phải một lưới.

**3. T512: thời lượng riêng phải nằm TRONG dữ liệu chặng.** D93 cho mỗi người một
thời lượng khác nhau, nên tỉ lệ đã đi phải chia theo thời lượng của **chính chặng
đó** — cả lúc vẽ lẫn lúc dựng chặng mới từ chỗ điểm đang đứng. Chia theo một con
số chung thì hai chế độ của D93 không khác gì nhau, và người kiệt sức bị đẩy tới
đích sớm — đúng cú giật AC-29.3 cấm. Vì thế `ChuyenDiemDang` có thêm trường
`thoiLuong`.

**4. Cảnh báo AC-30.5 ở ghi chú Phase 41 LÀ BÁO ĐỘNG SAI, và lỗi là ở phép đo của
tôi.** Ghi chú ấy nói "250/692 khung có hai điểm dưới một bán kính" và để lại cho
Phase 40. Đó lại là **một triệu chứng dễ đo**, lần thứ ba của cùng một thói xấu. AC-30.5
cấm hai điểm **nằm khít tới mức người xem chỉ thấy một**, nên tính chất phải đo là
**một CẶP CỤ THỂ nằm dưới ngưỡng liên tục bao lâu**, không phải "có bất kỳ cặp nào
dưới ngưỡng ở khung này" — chỉ số sau gộp cả một chuỗi các cặp **khác nhau** thành
một đợt dài 1620ms, trong khi chính điểm đang đo dịch 73 đơn vị trong đợt ấy.

Đo lại theo đúng tính chất, có theo dõi danh tính từng cặp, một trận 90 phút ở mức
Nhanh: **169 lượt cặp**, **trung vị 16ms** (một khung hình), **dài nhất 73ms**,
**không lượt nào quá 300ms**, và chỗ gần nhất của lượt dài nhất là **1,79** trên bán
kính 3,4 — hai vòng phủ nhau một phần, hai viền vẫn tách. Hai cầu thủ **băng qua
nhau trong hai khung hình** không phải "nằm khít tới mức chỉ thấy một" — đó đúng là
thứ cầu thủ thật làm. Nên không siết biên độ dao động, và không nới ngưỡng của
phép kiểm nào.

**Số đo thật của lát 40** (bản build, rAF thay bằng `setTimeout`):
- **Trọng tâm khối trên trục dọc chạy từ 34,9 tới 52,0** — biên độ **17,1 đơn vị**
  trên chiều dài 100, tức cả khối thật sự dồn lên và lùi về thấy được (AC-30.4).
  Dịch của một người không bao giờ vượt `r/10` = 10 — phép kiểm thuần phủ cả 16
  cặp (dải người × dải bóng).
- **Chặng riêng theo thể lực, đo từ phút 69 ở mức Chậm** (1000ms một phút), 131
  chặng qua 13 nhịp: lúc đi xong trải từ **758ms tới 962ms**, trung vị 905ms — đúng
  dải 750–950 mà D93 đặt ra, và **không chặng nào chạm 1000ms**, tức không ai còn bay
  dở khi nhịp sau tới (AC-30.6, AC-29.3).
- **Cặp điểm nằm dưới một bán kính**: 169 lượt, trung vị 16ms, dài nhất 73ms, 0
  lượt quá 300ms (AC-30.5).
- **Phép kiểm thuần**: không điểm nào chồng khít trên **10 mã trận × 7 quân số ×
  mọi dòng tường thuật**; người tham gia đứng đúng toạ độ vùng ở hơn 100 tình huống
  (AC-28.3); hàng ngang lệch dưới một phần tư khoảng giãn qua 300 thời điểm trận, cả
  khi đang có tình huống (AC-30.3).
- Không lỗi console.

**Describe đã sửa và describe không đụng tới:** describe D88 được **sửa thành hai
nhánh** chứ không bỏ (nó vẫn là lưới duy nhất bắt lỗi "kéo dài thời lượng ở nhịp
không dư"); describe AC-25.3 đổi thành "không điểm nào bị **giật**" (AC-29.3, AC-30.1)
và phủ cả hai chế độ ở cả bốn mức; describe "toạ độ tại mốc" **không sửa một
dòng** (R38) — `git diff` của file ấy không có một dòng nào thuộc describe đó.

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

## Phase 42 — kiểm tay, đo ngân sách, và hai phép đo tôi phải bỏ đi

**1. Bộ đo tương phản của tôi báo một lỗi không có thật.** Nó nói dấu `▲` (dấu
"đang tham gia tình huống") chỉ đạt **1,26**, dưới xa ngưỡng 4,5. Lý do: tôi lấy nền
là **chính cái điểm** vì hai thứ nằm chung một `<g>`, trong khi dấu ấy được vẽ ở
`y = -4,6`, tức **bên ngoài** bán kính 3,4 — nó nằm trên **mặt cỏ**. Đo lại với
đúng nền: **5,83**. Cùng một thói xấu đã ghi ở ba ghi chú trước, lần này ở **phép đo**
chứ không ở tiêu chí: một con số đỏ không phải bằng chứng cho tới khi biết nó đo cái
gì.

**2. Con số "5,2ms mỗi khung" phải bỏ đi, vì nó là của `setTimeout` chứ không phải
của ứng dụng.** Bản đầu của T517 đo thời gian tác vụ bằng cách hẹn `setTimeout(…0)`
ngay sau thân hàm khung hình — mà `setTimeout` lồng nhau bị trình duyệt **kẹp ở
~4ms**, nên mọi mức tốc độ đều ra 5,2ms giống hệt nhau — chính sự đều đặn ấy là dấu
hiệu. Đo lại bằng ba con số không dính đồng hồ hẹn giờ: thân hàm khung hình
(**0,1ms** lớn nhất), nhịp khung thực đạt (**59/giây** trên danh nghĩa 62,5), và
`PerformanceObserver('longtask')` (**0 tác vụ** quá 50ms).

**3. Hai hàng của bảng biên không ép được trên ứng dụng, nên đo bằng đường khác.**
Giao diện không cho chọn mã trận, mà thẻ đỏ thì hiếm và bàn ở phút cuối còn hiếm
hơn. Chạy một **probe** trên 70 trận (10 mã × 7 quân số, không commit):
- **56 thẻ đỏ**, và **0 điểm ma**: người bị đuổi không còn xuất hiện ở bất kỳ dòng
  nào sau đó, và số điểm cuối trận đúng bằng `2n − số thẻ đỏ` ở cả 70 trận.
- **18 bàn thắng ở phút liền ngay sau một bàn khác**, tức trường hợp "hai bàn liền
  nhau" có thật, khoảng 0,26 lần một trận.
- **0 bàn ở phút cuối** trong 70 trận — nên hàng ấy của bảng biên được kiểm bằng
  **đường code**: việc lưu trận nằm ở một effect riêng khoá theo `tran.ketThuc`
  (`useMatch.ts:289`), không nằm trong hàm hẹn giờ, nên nhịp lặng không thể chặn nó.

**4. Một hệ quả cấu trúc mà lúc viết D100 chưa ai nói ra: hai hiệu ứng bàn thắng
KHÔNG BAO GIỜ chồng nhau.** Nhịp lặng làm khoảng cách thật giữa hai bàn liền nhau
luôn `≥ 1500ms + một nhịp` (đo được: 1567–1587ms), trong khi hiệu ứng chỉ dài
**1500ms**. Nên hàng "hiệu ứng mới thay hiệu ứng đang chạy" đúng bằng hai lớp: một
ô ref **duy nhất** khoá theo `phút|người ghi`, và một khoảng cách thời gian lớn hơn
tuổi thọ hiệu ứng.

**5. Một phép đo tôi **không** dám nhận là bằng chứng.** "Biên độ chuyển động chờ co
theo khung" ở sân 5 người: đo ra 1,91 so với 2,35 (tỉ lệ 0,81) trong khi khung co
còn 0,70. Nhưng cửa sổ đo 2,2 giây ở mức Chậm dài hơn hai phút trận, nên con số ấy
lẫn cả **chặng thật** chứ không chỉ có dao động — nó không chứng minh được điều cần
chứng minh. Thứ đúng là bằng chứng: biên độ **bằng cấu trúc** là `BUOC_GIAN × tiLe / 8`,
mà `tiLe` chính là tỉ lệ khung (đo được: 70/100), còn câu "5 điểm không trông như
đang rung" là việc của **mắt người dùng** ở T518.

**Số đo thật của lát 42** (bản build `npm run preview`, cửa sổ xem trong ứng dụng
Claude **không được hợp thành ảnh**, nên `requestAnimationFrame` được thay bằng
`setTimeout(16ms)` và **chi phí vẽ của trình duyệt không nằm trong những con số này**):

| Đo | Kết quả |
|---|---|
| Tương phản chữ HTML, bốn tổ hợp ngôn ngữ × chế độ màu | nhỏ nhất **6,16** (sáng) và **6,59** (tối), **0** chỗ dưới ngưỡng |
| Tương phản chữ trong SVG | số áo trên nền áo nhỏ nhất **8,72** (21 điểm); dấu `▲` và chữ "BÀN THẮNG!" trên mặt cỏ **5,83** |
| Chuỗi thiếu / lọt khoá | **0** chỗ có `undefined`, `NaN`, `[object`, tên khoá chuỗi; nhãn mức tốc độ đủ hai thứ tiếng (Chậm / Slow) |
| Bàn phím (AC-31.5) | 4 `<input type="radio">` thật trong một `fieldset`, mỗi cái có `<label>`, `tabIndex` đều là 0 |
| Phút 0, chưa có tình huống nào | **22/22 điểm** đổi toạ độ ở **mọi** khung, bước lớn nhất 0,192 |
| Tạm dừng | **0 khung** xin trong 1500ms, lệch toạ độ **0,000**, nút đổi thành "Tiếp tục" |
| Hết trận | **0 khung** trong 1000ms sau tiếng còi, bước lớn nhất 0,01 qua 88 khung, và **bóng vẫn có mặt** (AC-32.7) |
| Ẩn sân | **0 khung** trong 800ms; cả trận chỉ xin 18 khung |
| Thay người | người vào hiện **ngay tại chỗ của mình** (lần đầu thấy cách chỗ đứng sau 2,6 giây **1,98** đơn vị, cả quãng chỉ 4,32), người ra biến mất gọn, số điểm vẫn 22 |
| Đổi tốc độ liên tục (5 lần trong 0,9 giây) | **0 lần đổi chiều** trong 2838 cặp bước; nhịp cuối đúng là nhịp được áp dụng (209–210ms ở mức Thường) |
| Máy yếu — chỉ 5 khung/giây | **0 lần đổi chiều** trong 5236 cặp bước; ở khung cuối của **cả sáu** nhịp đo được, bước là **0,00** — điểm đã tới mốc trước khi nhịp sau tới |
| Giảm chuyển động | **0 khung** trong 2500ms; chỉ **3 bộ vị trí** khác nhau qua 153 mẫu (giữ nguyên 63 / 56 / 34 mẫu liền) — đổi theo **nhịp**, không theo khung |
| Giảm chuyển động + bàn thắng | chữ "BÀN THẮNG!" có (90 mẫu), **không vòng sáng**, bán kính điểm lớn nhất vẫn là bán kính gốc (2,38 ở sân 5), mà đồng hồ **vẫn lặng** 1570–1587ms |
| Ẩn sân mà có bàn thắng | ba nhịp sau bàn là **1571 / 1577 / 1577ms** so với trung vị **86ms** |
| "Chạy hết trận", sân ĐANG BẬT (AC-31.3) | **57ms** trên ngân sách 3000ms; **0** mẫu có chữ bàn thắng, bán kính điểm vẫn 3,4 — không hiệu ứng, không nhịp lặng |
| Công việc mỗi khung (AC-31.4) | Chậm / Thường / Nhanh: **59 khung/giây**, thân hàm **0,1ms** lớn nhất; Rất nhanh: **0 khung** (AC-29.4); **0 tác vụ** quá 50ms ở mọi mức |
| Nền so sánh Phase 35 (spec 004) | ≤0,3ms mỗi khung ở Thường, ≤1,0ms ở Nhanh — nay **0,1ms** ở cả hai |
| Đấu lại cùng mã (AC-31.2) | cùng mã `XVQYPWA670`, cùng tỉ số 2–1, **40 dòng tường thuật đầu giống hệt** |
| Kiệt sức có nhãn chữ (AC-31.6) | dòng tường thuật vẫn có "Kiệt sức — … thể lực gần cạn" |
| Probe 70 trận (thẻ đỏ, bàn liền phút) | 56 thẻ đỏ → **0 điểm ma**; 18 bàn ở phút liền nhau; 0 bàn ở phút cuối |

**Còn lại của Phase 42:** T518 — **người dùng tự xem một trận ở mức Chậm trên trình
duyệt của mình và phán**. Không phép kiểm nào thay được, và đó là lý do cả spec này
tồn tại. T519 (tick 30 AC, đóng spec) phụ thuộc T518.

## Phase 43 — hai lỗi mắt người dùng bắt được, và một tiêu chí tôi viết sai lần nữa

**Cả hai lỗi đều lọt qua mọi phép kiểm của sáu lát trước, và lý do thì giống nhau ở cả
hai: phép kiểm của spec này đều đọc `hinhSan`, mà `hinhSan` không biết gì về thứ tự
vẽ, cũng không biết vị trí nào là thủ môn.**

**1. Bóng bị chìm (T520).** Trong SVG, vẽ sau là nằm trên. T513 vẽ bóng ngay sau
đường bóng, tức **trước** 22 điểm cầu thủ — đo được **40,5% số khung** có tâm bóng
nằm trong lòng một điểm, tức bị che hẳn. Phép kiểm "quả bóng luôn có mặt" của
T513 vẫn xanh suốt vì nó kiểm `bongTaiMoc` — một **toạ độ**, không phải một thứ
**nhìn thấy được**. Nay bóng và kênh chữ của hiệu ứng vẽ sau cùng.

**2. Thủ môn lên giữa sân (T521).** Đo trước khi sửa: thủ môn đội khách chạy từ
`x = 54,5` tới `85,2` (biên **30,6**), thủ môn đội nhà biên 11. Hai nguồn cộng lại:
engine có lúc liệt kê thủ môn là người tham gia một tình huống ở xa khung thành
(và AC-28.3 bắt đặt người tham gia vào đúng vùng ấy), cộng lớp co khối của T510.
Luật mới đơn giản hơn mọi phương án kẹp: **thủ môn không bao giờ bị dịch đi đâu
cả**, kể cả khi được liệt kê là người tham gia. Một cú cứu thùa vốn đã diễn ra ở
vùng của anh ta nên không mất gì. Đo lại: biên dọc còn **1 đơn vị** (đội nhà) và
**2 đơn vị** (đội khách).

Hai phương án kẹp đã thử và bị loại — cả hai đều **kẹp toạ độ rồi để nguyên việc
kéo**, và phép kiểm "điểm không chồng khít" của spec 002 đỏ ngay: kẹp dồn thủ môn về
biên và đặt anh ta đè lên người khác (0,90 và 0,62 đơn vị trên bán kính 3,4). Để
anh ta ở **đúng vùng của mình** thì không va ai, vì đó là chỗ đã được chứng minh là
an toàn từ spec 002.

**3. Tiêu chí "0% số khung có bóng bị che" của chính T520 là sai, lần thứ năm của
cùng một thói xấu.** Sau khi sửa, tâm bóng **vẫn** nằm trong lòng một điểm ở
**33,8% số khung** — và đúng ra phải thế: bóng trong chân một người thì phải chồng
lên điểm của người ấy. Thứ phải đúng là "**vẽ sau cùng**", đo bằng **thứ tự phần tử
trong DOM** (bóng ở chỉ số 24, điểm người cuối cùng ở 23), và nó đúng cho **mọi**
khung chứ không theo tỉ lệ phần trăm.

**Việc thứ ba người dùng nêu ở T518 KHÔNG làm ở đây.** "Cầu thủ có bóng chạy hoặc
qua người với bóng trong chân, hoặc chuyền và sút; thấy đường bóng liên tục" cần
một mô hình chuyển động **giữa hai mốc** mà engine không kể ra: ai đang giữ bóng,
bóng đi theo ai, lúc nào rời chân. Đó cũng là nơi giải luôn điều người dùng gọi là
"teleport" — đo được: quãng một người đi trong **một nhịp** có trung vị 3,9 đơn vị
nhưng lớn nhất **46,3**, tức gần nửa sân trong một giây. Để cho **spec 006**.

## Phase 44 — một lỗi bố cục đã sống qua bốn spec

**1. "Hậu vệ luôn đứng trên tiền đạo đối phương" là lỗi của spec 001, không phải
của spec này.** Lưới vùng lật đội khách theo **chỉ số dải** (`latVung`: dải 3 ↔
dải 0), mà hai đội lại dùng **chung một bảng toạ độ**. Hệ quả: dải tấn công của
một đội lật thành đúng dải **thủ môn** của đội kia. Đo được trước khi sửa:

| Độ cao đội hình | HV đội nhà | TĐ đội khách | Tiền đạo nằm sau hàng thủ |
|---|---|---|---|
| trung bình | x = 28 | x = 13 | 15 đơn vị |
| cao | x = 33 | x = 8 | 25 đơn vị |
| thấp | x = 23 | x = 18 | 5 đơn vị |

Tức tiền đạo đối phương đứng **trong vòng 5m50 suốt trận**, còn hàng thủ đứng
trước mặt họ. Không phép kiểm nào của bốn spec bắt được, vì mọi phép kiểm đều
hỏi "hai điểm có chồng nhau không" chứ chưa bao giờ hỏi "**thứ tự tám hàng có đúng
không**".

**Cách sửa: mỗi đội một bảng dải**, cộng một **bảng trung lập** cho quả bóng và
cho người được kéo tới tình huống — một pha tranh chấp phải diễn ra ở đúng một
chỗ cho cả hai bên. Đo lại trên ứng dụng, một khung lúc không có tình huống:

    5 (TM nhà) | 19–21 ×4 (HV nhà) | 31–33 ×2 (TĐ khách) | 43–45 ×4 (TV nhà)
    | 55–57 ×4 (TV khách) | 68 ×2 (TĐ nhà) | 79–81 ×4 (HV khách) | 95 (TM khách)

Đúng thứ tự một trận thật, và mỗi hàng cách hàng kế 12 đơn vị.

**Ba thứ phải đi theo, không có thứ nào là trang trí:**
- `LECH_DOI` = 4 **bị bỏ**. Nó sinh ra để chữa triệu chứng của chính bảng chung ấy
  (hai điểm trùng toạ độ), và cú đẩy của nó còn làm nặng thêm chính lỗi này.
- Độ cao đội hình **±5 → ±3**: với khoảng cách 12 giữa hai hàng, ±5 cho hai đội
  cùng dâng cao là đủ để hai hàng **đổi chỗ cho nhau**. Với ±3, khoảng hẹp nhất
  trong chín tổ hợp độ cao là **6 đơn vị** và thứ tự không bao giờ đảo.
- Bảng trung lập **không phải trung bình của hai bảng kia**. Bản đầu lấy trung bình
  và phép kiểm đỏ ngay: chỗ của bóng rơi cách một hàng đúng **1 đơn vị**, hai điểm
  cách nhau 0,87 trên bán kính 3,4. Bốn chỗ đúng là 13 / 38 / 62 / 87 — **giữa hai
  hàng**, cách hàng gần nhất 6–7 đơn vị.

**Một hệ quả tốt ngoài dự tính:** sàn "hai điểm gần nhau nhất" đo trên 10 mã trận
× 7 quân số × mọi dòng **rộng từ 1,176 lên 1,80 bán kính**. Sân thoáng hẳn ra, và
biên phì thêm của người ghi bàn giờ có dư rất nhiều chỗ — nhưng phép kiểm vẫn
giữ ngưỡng cũ làm sàn cứng, không nới theo số đo mới.

**2. Quả bóng (T522).** Trắng, viền sẫm, một mảng đen giữa và năm mảng quanh. Tương
phản nền bóng với mặt cỏ **7,68:1**, mảng đen với nền **17,74:1**, giống nhau ở cả
hai chế độ màu. Bóng vẫn vẽ sau các điểm người (T520).

**Vẫn chưa làm, và vẫn cố ý chưa làm:** bóng dính chân người dẫn, qua người,
chuyền và sút, đường bóng liên tục — **spec 006**.

## Phase 45 — bóng đi đường của nó, và nửa còn lại vẫn ở spec 006

**Đường kẻ vàng tồn tại vì bóng không đi đường của nó.** Spec 001 vẽ nó (D40) để
người xem đoán ra lộ trình, bởi bóng nhảy thẳng từ chỗ cũ tới điểm cuối, bỏ qua
mọi vùng ở giữa. Sửa đúng cái gốc — cho bóng **đi hết đường** — thì đường kẻ tự
hết việc, đúng như người dùng nói ở T518.

Hai chi tiết không phải trang trí:
- **Tỉ lệ đi theo CHIỀU DÀI, không theo số đoạn.** Chia đều theo đoạn thì bóng bò
  qua đoạn ngắn rồi vọt qua đoạn dài — một đường chuyền không đổi tốc độ giữa
  đường.
- **Đường mới nối từ chỗ bóng ĐANG ĐỨNG**, không từ điểm đầu của pha bóng: hai
  pha liên tiếp không phải lúc nào cũng nối đuôi nhau, và bắt bóng nhảy về điểm
  đầu là đúng cú giật AC-29.3 cấm.

**Số đo trên ứng dụng** (mức Chậm, 1150 mẫu, tới phút 20):
- **0 khung** còn đường kẻ vàng.
- **17 khúc cua** của quả bóng — điều một cú nhảy thẳng **không thể** làm được, nên
  nó là bằng chứng trực tiếp rằng bóng đang đi qua từng vùng.
- Tổng quãng bóng đi 1101 đơn vị, bước lớn nhất mỗi khung 14,67.

**Và đây là nửa chưa làm, đo được hẳn hoi:** bóng chỉ **di chuyển ở 35,5% số
khung**, và quãng đứng yên lâu nhất là **3144ms**. Vì giữa hai pha bóng — và ở
những dòng không kể pha bóng nào (thay người, kiệt sức) — không ai giữ bóng cả,
nên nó nằm yên. Một quả bóng thật không nằm yên ba giây giữa trận. Thứ chữa được
điều đó là **mô hình người giữ bóng** — bóng dính chân người dẫn, qua người,
rời chân khi chuyền hay sút — và đó là **spec 006**, không phải một hằng số của spec
này.

## Phase 46 — hai nguồn của cảm giác "teleport", đo được cả hai

Người dùng nói ở T518: "đôi khi quá nhanh đôi khi quá chậm, cầu thủ như đang
teleport". Đo ra **hai nguồn khác nhau**, và chỉ một trong hai là thứ tôi đoán:

**1. Tốc độ tỉ lệ THỬNG với quãng phải đi (T525).** Mọi chặng dùng chung một thời
lượng, mà quãng một người đi trong một nhịp trải từ **2,3 đến 47,4 đơn vị** —
chênh nhau hơn hai mươi lần. Nên cùng một lúc, người này nhích vài đơn vị còn
người kia băng nửa sân. Sửa bằng luật `thời lượng ∝ quãng ^ 0,75`, nên
`tốc độ ∝ quãng ^ 0,25`: quãng chênh 20 lần thì tốc độ chỉ chênh **dưới 4 lần**.

**2. Đường cong phồng thành vòng rộng (T526) — cái này tôi không đoán ra, phải đo
mới thấy.** `huongVao` là vận tốc của chặng **trước**; chặng trước dài mà chặng này
ngắn thì tiếp tuyến lớn hơn dây cung và đường Hermite phồng ra. Đo trên ứng dụng:
có chặng **đường chim bay 3,9 đơn vị mà điểm chạy hết 37,2** — gấp 9,57 lần. Điểm
không bay tới đích, nó bay một vòng. Và T525 **làm nặng thêm** nguồn này trước khi
T526 chữa: chặng ngắn đi nhanh hơn → vận tốc ra lớn hơn → tiếp tuyến của chặng
sau lại lớn hơn nữa. Đó là lý do đo lại ngay sau T525 thấy **xấu đi**, và là lý do
phải làm cả hai.

**Số đo** (mức Chậm, ~1150 mẫu mỗi lượt, độ vòng = đường đi thật / đường chim bay):

| | trước | sau |
|---|---|---|
| độ vòng trung vị | 1,74 | **1,53** |
| độ vòng phân vị 90 | 2,65 | **2,46** |
| độ vòng lớn nhất | 9,57 | **4,12** |
| bước mỗi khung > 3 đơn vị | — | 54 trên ~25.000 mẫu, và hai cái lớn nhất là do **máy lấy mẫu trễ** (dt = 51ms), không phải ứng dụng nhảy |

**Một phép đo phải bỏ đi, lần thứ sáu của cùng một thói xấu.** Tôi định dùng "tỉ lệ
giữa phân vị 99 và phân vị 10 của tốc độ tức thời" làm thước. Nó vô dụng ở đây vì
hai lẽ: phân vị thấp chính là **dao động chờ** chứ không phải một cú di chuyển; và
khi máy lấy mẫu cách nhau 4ms thì một bước vẽ bình thường cho ra "1149 đơn
vị/giây". Thước dùng được là **độ vòng** và **phân bố bước mỗi khung**, vì cả hai
không phụ thuộc nhịp lấy mẫu.

**Vẫn còn, và vẫn là spec 006:** engine chỉ cho **một mốc mỗi phút trận**. Trong một
nhịp, hoặc mọi người dùng chung thời lượng (tốc độ khác nhau) hoặc chung tốc độ
(người xong sớm đứng chờ). T525 chọn điểm giữa, nhưng không xóa được cái gốc: muốn
mọi điểm luôn di chuyển có mục đích thì phải có **mốc trung gian giữa hai phút**, tức
mô hình người giữ bóng của spec 006.

