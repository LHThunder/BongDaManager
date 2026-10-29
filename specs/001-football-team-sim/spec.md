# Spec: Tự tạo đội bóng, dựng chiến thuật và giả lập trận đấu

| | |
|---|---|
| **ID** | `001-football-team-sim` |
| **Status** | **Done** (ngày 2026-10-29) — cả bốn giai đoạn đã hiện thực và kiểm chứng. **98/99 AC tick**; AC duy nhất chưa tick là **AC-4.7**, vì không có cách nào làm đầy dung lượng lưu trữ từ trong trang để quan sát đường cảnh báo đầu-cuối — từng mảnh của nó đã có test, xem ghi chú ngay tại AC đó và T129 trong `tasks.md` |
| **Created** | 2026-10-26 |
| **Clarified** | 2026-10-26 |
| **Amended** | 2026-10-26 — khớp constitution v1.0.0 (P1); và sửa theo kết quả `/analyze` (AC-2.1b, AC-4.8, AC-4.9); xem mục 10 |
| **Branch** | `001-football-team-sim` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

## 1. Vấn đề & mục tiêu

**Vấn đề:**
Người dùng là fan bóng đá, muốn dựng ra những đội bóng của riêng mình — đội hình trong mơ, đội của nhóm bạn, đội phủi mình đang đá — rồi xem đội đó chơi ra sao dưới một chiến thuật cụ thể. Hiện tại không có chỗ nào làm được trọn vẹn việc này:

- Các game quản lý bóng đá thương mại gắn chặt với dữ liệu cầu thủ thật; muốn đưa cầu thủ tự nghĩ ra vào thì phải mod, rất rườm rà và dễ hỏng dữ liệu.
- Các công cụ vẽ sơ đồ chiến thuật trên mạng chỉ vẽ hình tĩnh, không giả lập được gì, nên không trả lời được câu hỏi "chiến thuật này có chạy không".
- Cách xoay xở hiện tại là ghi danh sách ra giấy hoặc bảng tính, vẽ sơ đồ bằng tay, rồi tự tưởng tượng kết quả. Dữ liệu rời rạc, không tái sử dụng được, và không bao giờ có câu trả lời khách quan.

**Mục tiêu:**
Một chỗ duy nhất, chạy trên máy cá nhân, để người dùng:

1. Tự tạo nhiều đội bóng với đầy đủ thông tin, hình ảnh và chỉ số cầu thủ do chính mình điền.
2. Dựng sơ đồ chiến thuật cho từng đội: đội hình, vai trò từng vị trí, chỉ thị toàn đội.
3. Cho hai đội bất kỳ đấu với nhau và xem trận đấu diễn ra, với kết quả **phản ánh được chiến thuật và chỉ số đã nhập** — không phải tung xúc xắc thuần.
4. Dữ liệu tồn tại lâu dài: tạo một lần, quay lại dùng nhiều lần, sao lưu và mang sang máy khác được.

Thước đo thành công: người dùng nhập xong một đội 18 cầu thủ, đổi chiến thuật từ phòng ngự phản công sang pressing tầm cao, giả lập lại **cùng một mã trận**, và **nhận ra sự khác biệt trong kết quả cũng như trong diễn biến trận đấu**.

**Thứ tự bàn giao:** spec này mô tả toàn bộ sản phẩm, nhưng được bàn giao theo 4 giai đoạn, mỗi giai đoạn phải tự chạy được và dùng thử được: GĐ1 (US-1 → US-4) → GĐ2 (US-5 → US-7) → GĐ3 (US-8 → US-9) → GĐ4 (US-10 → US-11).

**Non-goals** (lần này KHÔNG làm):

- Chế độ career nhiều mùa: chuyển nhượng, hợp đồng, tài chính, lương, scout, tập luyện, cầu thủ lên/xuống trình theo tuổi.
- Giải đấu: lịch thi đấu, bảng xếp hạng, vòng loại trực tiếp, thống kê cả mùa, vua phá lưới.
- Chơi nhiều người, chơi online, tài khoản, đăng nhập, đồng bộ qua máy chủ.
- Đồ hoạ 3D hoặc hình ảnh cầu thủ chuyển động thật; sân 2D ở GĐ4 chỉ là các điểm tròn.
- Nhập dữ liệu hàng loạt từ bảng tính hoặc nguồn bên ngoài.
- Kho dữ liệu cầu thủ thật có sẵn — mọi cầu thủ do người dùng tự nhập.
- Đa ngôn ngữ; chỉ có tiếng Việt.
- Phiên bản cho điện thoại hoặc máy tính bảng.
- Phần âm thanh, nhạc, tiếng cổ động viên.
- Chấn thương cầu thủ, cả trong trận lẫn dài hạn, và mọi trạng thái thể trạng ngoài thể lực trong trận.
- Hiệp phụ và sút luân lưu; trận hoà thì kết thúc hoà.
- Tự tạo sơ đồ riêng ngoài bộ sơ đồ có sẵn.
- Lưu trận đang diễn ra để chơi tiếp ở lần mở ứng dụng sau.
- Lịch sử trận đấu dài hơn 20 trận gần nhất.

## 2. Người dùng & bối cảnh

- **Ai dùng:** một người duy nhất — chủ máy, fan bóng đá, có hiểu biết về chiến thuật ở mức người xem nhiệt thành (biết 4-3-3 khác 3-5-2 ở đâu, biết thế nào là tiền vệ mỏ neo). Không phải người dùng kỹ thuật, nhưng chịu bỏ công nhập liệu nếu thấy đáng.
- **Khi nào dùng:** theo đợt, lúc rảnh. Hai kiểu phiên rất khác nhau:
  - *Phiên nhập liệu* (dài, thỉnh thoảng): tạo đội mới, nhập 18–25 cầu thủ, tải ảnh lên. Có thể làm nhiều lần, bỏ dở rồi quay lại.
  - *Phiên chơi* (ngắn, thường xuyên): mở đội có sẵn, chỉnh chiến thuật, giả lập một vài trận.
- **Thiết bị/môi trường:** máy tính cá nhân chạy Windows, màn hình rộng, dùng chuột — phần kéo-thả sơ đồ cần không gian và con trỏ. Không cần kết nối mạng để dùng.

## 3. User stories

---

### GIAI ĐOẠN 1 — Tạo đội và cầu thủ

### US-1: Tạo và quản lý nhiều đội bóng
Là một **fan bóng đá**, tôi muốn **tạo không giới hạn số đội bóng và quay lại sửa chúng bất cứ lúc nào**, để **dựng được cả đội của mình lẫn các đội đối thủ mà tôi muốn gặp**.

**Acceptance criteria:**
- [x] AC-1.1 — KHI người dùng mở ứng dụng lần đầu THÌ hệ thống PHẢI hiển thị trạng thái chưa có đội nào kèm một lối vào rõ ràng để tạo đội đầu tiên.
- [x] AC-1.2 — KHI người dùng tạo đội với tên không rỗng THÌ hệ thống PHẢI tạo đội đó và đưa người dùng vào trang quản lý đội vừa tạo.
- [x] AC-1.3 — KHI người dùng tạo đội mà để trống tên THÌ hệ thống PHẢI từ chối tạo và chỉ rõ trường tên đang thiếu.
- [x] AC-1.4 — KHI đã có ít nhất một đội THÌ hệ thống PHẢI hiển thị danh sách tất cả các đội, mỗi đội kèm tên, logo (hoặc hình thay thế) và số lượng cầu thủ hiện có.
- [x] AC-1.5 — KHI người dùng đổi tên một đội THÌ hệ thống PHẢI cập nhật tên đó ở mọi nơi đang hiển thị đội (danh sách đội, trang chiến thuật, lịch sử trận đấu). **→ Giai đoạn 2 đóng nốt phần trang chiến thuật: trang đọc tên đội từ store dùng chung, không giữ bản sao riêng. Giai đoạn 4 đóng nốt phần lịch sử — kiểm tay 2026-10-29: đổi tên "Sông Hàn FC" thành "Sông Hàn ĐỔI TÊN" rồi mở lịch sử, mọi dòng hiện tên MỚI và không còn dòng nào mang tên cũ, vì bản ghi trận giữ `teamId` và tên được phân giải từ đội đang sống (quyết định D46)**
- [x] AC-1.6 — KHI người dùng yêu cầu xoá một đội THÌ hệ thống PHẢI hỏi xác nhận có nêu tên đội và số cầu thủ sẽ mất, và CHỈ xoá sau khi người dùng xác nhận. **→ Kiểm lại ở Giai đoạn 2: xoá đội dọn cả chiến thuật của đội đó.**
- [x] AC-1.7 — KHI người dùng tạo đội trùng tên với đội đã có THÌ hệ thống PHẢI cảnh báo trùng tên nhưng VẪN cho phép tiếp tục nếu người dùng xác nhận.

### US-2: Nhập thông tin và chỉ số cầu thủ
Là một **người tạo đội**, tôi muốn **nhập từng cầu thủ với thông tin cơ bản và bộ chỉ số năng lực**, để **đội của tôi có chiều sâu và việc giả lập có cơ sở để tính toán**.

**Acceptance criteria:**
- [x] AC-2.1 — KHI người dùng thêm cầu thủ THÌ hệ thống PHẢI cho nhập: tên, số áo, tuổi, chân thuận (trái/phải/cả hai), và một hoặc nhiều vị trí sở trường chọn từ đúng 12 vị trí sau: Thủ môn · Hậu vệ trái, Trung vệ, Hậu vệ phải · Tiền vệ trụ · Tiền vệ cánh trái, Tiền vệ trung tâm, Tiền vệ cánh phải · Chạy cánh trái, Tiền vệ tấn công, Chạy cánh phải · Tiền đạo.
- [x] AC-2.1b — KHI người dùng chọn vị trí Thủ môn cho một cầu thủ THÌ hệ thống PHẢI không cho chọn thêm bất kỳ vị trí nào khác cho cầu thủ đó; VÀ KHI cầu thủ đã có một vị trí khác THÌ hệ thống PHẢI không cho chọn Thủ môn. Mỗi cầu thủ là **thủ môn hoặc cầu thủ sân, không kiêm cả hai**.
- [x] AC-2.2 — KHI người dùng nhập chỉ số cho cầu thủ không phải thủ môn THÌ hệ thống PHẢI cung cấp đúng 15 chỉ số trên thang 1–20: Dứt điểm, Sút xa, Chuyền ngắn, Tạt/Chuyền dài, Rê dắt, Khống chế bóng, Tắc bóng, Kèm người, Đọc tình huống, Tốc độ, Sức mạnh, Không chiến, Thể lực, Nhãn quan, Quyết đoán.
- [x] AC-2.3 — KHI cầu thủ có vị trí sở trường là Thủ môn THÌ hệ thống PHẢI yêu cầu đúng 11 chỉ số: 8 chỉ số chung (Chuyền ngắn, Tạt/Chuyền dài, Khống chế bóng, Tốc độ, Sức mạnh, Không chiến, Thể lực, Quyết đoán) cộng 3 chỉ số riêng (Phản xạ, Bắt bóng, Phát động); VÀ các chỉ số chung còn lại PHẢI không xuất hiện cho thủ môn. Nhờ AC-2.1b, mỗi cầu thủ luôn thuộc đúng một trong hai bộ: 15 chỉ số của cầu thủ sân, hoặc 11 chỉ số của thủ môn — không có trường hợp lưng chừng.
- [x] AC-2.4 — KHI người dùng nhập giá trị chỉ số ngoài khoảng 1–20 hoặc không phải số THÌ hệ thống PHẢI từ chối giá trị đó và giữ nguyên giá trị hợp lệ trước đó.
- [x] AC-2.5 — KHI người dùng nhập số áo đã có cầu thủ khác trong cùng đội đang dùng THÌ hệ thống PHẢI cảnh báo trùng số áo và không cho lưu đến khi số áo được sửa.
- [x] AC-2.6 — KHI người dùng chọn nhiều vị trí sở trường cho một cầu thủ sân THÌ hệ thống PHẢI lưu toàn bộ các vị trí đó và dùng chúng để đánh giá việc xếp đúng/sai vị trí ở AC-5.5. Việc chọn nhiều vị trí không áp dụng cho thủ môn, theo AC-2.1b.
- [x] AC-2.7 — KHI người dùng sửa hoặc xoá một cầu thủ THÌ hệ thống PHẢI cập nhật ngay danh sách đội; VÀ nếu cầu thủ đó đang được xếp trong đội hình thì vị trí đó PHẢI trở thành ô trống. **→ Giai đoạn 2 đóng nốt: `playerRepo.remove` gỡ cầu thủ khỏi mọi ô của mọi bộ chiến thuật trong cùng transaction**
- [x] AC-2.8 — KHI xem danh sách cầu thủ của một đội THÌ hệ thống PHẢI cho sắp xếp danh sách theo tên, số áo, tuổi và vị trí.
- [x] AC-2.9 — KHI người dùng chọn sinh nhanh chỉ số cho một cầu thủ và chọn một trong 4 mức (Ngôi sao / Khá / Trung bình / Yếu) THÌ hệ thống PHẢI điền sẵn toàn bộ chỉ số sao cho các chỉ số quan trọng của vị trí sở trường cầu thủ đó cao hơn hẳn các chỉ số không liên quan, VÀ người dùng PHẢI sửa lại được từng chỉ số sau đó.
- [x] AC-2.10 — KHI người dùng lưu một cầu thủ chưa điền đủ chỉ số THÌ hệ thống PHẢI lưu lại và đánh dấu hồ sơ đó là chưa hoàn tất, nêu còn thiếu bao nhiêu chỉ số; việc chặn CHỈ xảy ra khi cầu thủ đó được đưa vào đội hình thi đấu theo AC-5.7.
- [x] AC-2.11 — KHI hệ thống hiển thị một cầu thủ ở một vị trí hoặc vai trò cụ thể THÌ hệ thống PHẢI hiển thị một chỉ số tổng được tính từ các chỉ số quan trọng của chính vị trí/vai trò đó; VÀ KHI cùng cầu thủ đó được xem ở một vai trò khác THÌ chỉ số tổng PHẢI khác đi tương ứng.

### US-3: Hình ảnh cầu thủ và nhận diện đội
Là một **fan**, tôi muốn **gắn ảnh chân dung cho cầu thủ, logo và màu áo cho đội**, để **đội bóng trông giống đội thật và tôi nhận ra ngay ai là ai trên sơ đồ**.

**Acceptance criteria:**
- [x] AC-3.1 — KHI người dùng chọn một tệp ảnh cho cầu thủ THÌ hệ thống PHẢI cho cắt ảnh về khung vuông trước khi lưu, và hiển thị ảnh đã cắt trong hồ sơ cầu thủ cũng như trên sơ đồ chiến thuật.
- [x] AC-3.2 — KHI ảnh người dùng chọn lớn hơn giới hạn ở mục 6 THÌ hệ thống PHẢI tự giảm kích thước ảnh xuống trong giới hạn mà không cần người dùng làm gì thêm.
- [x] AC-3.3 — KHI người dùng chọn tệp không phải ảnh, hoặc ảnh bị lỗi không đọc được THÌ hệ thống PHẢI thông báo rõ tệp không dùng được và giữ nguyên ảnh cũ (nếu có).
- [x] AC-3.4 — KHI một cầu thủ chưa có ảnh THÌ hệ thống PHẢI hiển thị hình thay thế dạng tròn gồm các chữ cái đầu của tên cầu thủ trên nền màu áo chính của đội.
- [x] AC-3.5 — KHI người dùng gắn logo cho đội THÌ hệ thống PHẢI hiển thị logo đó ở danh sách đội, trang đội, trang chiến thuật và trong màn hình trận đấu. **→ Giai đoạn 3 đóng nốt: logo hai đội hiện trên màn hình trận, cạnh tỉ số (kiểm tay ngày 2026-10-28 với một logo thật)**
- [x] AC-3.6 — KHI người dùng chọn màu áo chính và màu áo phụ cho đội THÌ hệ thống PHẢI dùng màu áo chính để nhuộm các thành phần nhận diện của đội đó.
- [x] AC-3.7 — KHI hai đội gặp nhau mà màu áo chính của hai đội quá giống nhau THÌ hệ thống PHẢI tự chuyển một đội sang màu áo phụ và nói rõ việc đổi đó cho người dùng. **→ Giai đoạn 3 đóng nốt: màn chọn cặp đấu tự chuyển một đội sang áo phụ và nói rõ đội nào đổi (kiểm tay ngày 2026-10-28 với hai đội cùng màu chính)**
- [x] AC-3.8 — KHI người dùng chọn một màu áo khiến chữ trên nền màu đó khó đọc THÌ hệ thống PHẢI tự chọn màu chữ tương phản đủ theo mục 6, không để người dùng phải tự xử lý.

### US-4: Lưu trữ, sao lưu và phục hồi dữ liệu
Là một **người đã bỏ công nhập liệu**, tôi muốn **dữ liệu tự được giữ lại và có cách mang nó đi nơi khác**, để **không bao giờ mất công nhập lại**.

**Acceptance criteria:**
- [x] AC-4.1 — KHI người dùng tạo hoặc sửa bất kỳ dữ liệu nào THÌ hệ thống PHẢI tự lưu lại mà không cần bấm nút Lưu.
- [x] AC-4.2 — KHI người dùng đóng ứng dụng rồi mở lại trên cùng máy, cùng trình duyệt THÌ toàn bộ đội, cầu thủ, ảnh, chiến thuật và lịch sử trận đấu PHẢI còn nguyên. **→ Giai đoạn 1: đội, cầu thủ, ảnh và chiến thuật đã tồn tại qua lần mở lại. Giai đoạn 4 đóng nốt phần lịch sử — kiểm tay 2026-10-29: tải lại trang với 19 đội và 20 trận thì cả ba thứ còn nguyên, mở một trận cũ vẫn đủ báo cáo lẫn 81 dòng sự kiện**
- [x] AC-4.3 — KHI người dùng yêu cầu xuất dữ liệu THÌ hệ thống PHẢI tạo ra một tệp duy nhất chứa toàn bộ đội, cầu thủ, ảnh, chiến thuật và lịch sử trận đấu.
- [x] AC-4.4 — KHI người dùng nhập lại tệp đã xuất trên một máy hoặc trình duyệt khác THÌ toàn bộ dữ liệu PHẢI hiện lên đúng như lúc xuất, kể cả ảnh. **→ Kiểm lại ở Giai đoạn 2 trên tệp v3: chiến thuật và bộ có tên cũng trở lại đúng.**
- [x] AC-4.5 — KHI người dùng nhập một tệp không đúng định dạng hoặc bị hỏng THÌ hệ thống PHẢI từ chối, nói rõ lý do, và giữ nguyên dữ liệu đang có — không được xoá hay ghi đè một phần. **→ Kiểm lại ở Giai đoạn 2: tệp v3 có ô trỏ tới cầu thủ đội khác bị từ chối, dữ liệu đang có không đổi.**
- [x] AC-4.6 — KHI người dùng nhập một tệp hợp lệ trong lúc đã có dữ liệu THÌ hệ thống PHẢI hỏi rõ là thay thế toàn bộ hay gộp thêm vào, trước khi làm bất cứ điều gì.
- [ ] AC-4.7 — KHI dung lượng lưu trữ của trình duyệt đầy và việc lưu thất bại THÌ hệ thống PHẢI cảnh báo ngay rằng thay đổi chưa được lưu và gợi ý người dùng xuất dữ liệu ra tệp. **→ CHƯA TICK, và sẽ không tick cho tới khi có cách quan sát. Từng mảnh đã kiểm: `chuanHoaLoiLuuTru` ánh xạ `QuotaExceededError` thành mã `QuotaExceeded` (có test), `errors.test.ts` phủ phần dựng câu tiếng Việt, và một lần ghi hỏng thật cho ra đúng `LoiUngDung` đó. Thứ KHÔNG kiểm được là đường hiển thị đầu-cuối: không siết được quota của trình duyệt từ trong trang, và đặt `loiLuuTru` từ console thì ghi vào một thể hiện store khác với thể hiện ứng dụng đang chạy. Xem T129**
- [x] AC-4.8 — KHI người dùng yêu cầu xuất dữ liệu THÌ hệ thống PHẢI hiện kích thước ước tính của tệp trước khi tạo tệp.
- [x] AC-4.9 — KHI người dùng mở ứng dụng lần đầu THÌ hệ thống PHẢI yêu cầu trình duyệt đánh dấu dữ liệu của ứng dụng là lưu trữ bền; VÀ KHI trình duyệt từ chối THÌ hệ thống PHẢI cho người dùng biết dữ liệu có thể bị trình duyệt xoá và nhắc xuất tệp sao lưu thường xuyên.

---

### GIAI ĐOẠN 2 — Sơ đồ chiến thuật

### US-5: Dựng đội hình trên sơ đồ
Là một **HLV**, tôi muốn **chọn sơ đồ và kéo cầu thủ vào từng vị trí trên sân**, để **thấy đội hình của mình một cách trực quan trước khi vào trận**.

**Acceptance criteria:**
- [x] AC-5.1 — KHI người dùng mở trang chiến thuật của một đội THÌ hệ thống PHẢI hiển thị hình sân bóng kèm danh sách sơ đồ có sẵn để chọn.
- [x] AC-5.2 — KHI người dùng mở danh sách sơ đồ THÌ hệ thống PHẢI cung cấp đúng 8 sơ đồ: 4-4-2, 4-4-1-1, 4-3-3, 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3, 5-3-2; VÀ KHI chọn một sơ đồ THÌ hệ thống PHẢI hiển thị đúng 11 ô vị trí được đặt theo sơ đồ đó trên sân.
- [x] AC-5.3 — KHI người dùng kéo một cầu thủ từ danh sách đội vào một ô vị trí THÌ hệ thống PHẢI đặt cầu thủ đó vào ô, hiển thị ảnh (hoặc hình thay thế), tên và số áo của cầu thủ tại ô đó.
- [x] AC-5.4 — KHI người dùng kéo cầu thủ vào một ô đã có người THÌ hệ thống PHẢI đổi chỗ hai cầu thủ cho nhau chứ không làm mất cầu thủ nào.
- [x] AC-5.5 — KHI một cầu thủ được xếp vào ô mà vị trí của ô đó không nằm trong các vị trí sở trường của cầu thủ THÌ hệ thống PHẢI đánh dấu ô đó ngay trên sơ đồ theo đúng một trong ba mức: **sai nhẹ** (cùng tuyến, chỉ lệch trái/phải, ví dụ hậu vệ phải đá hậu vệ trái), **sai vừa** (lệch một tuyến, ví dụ tiền vệ trụ đá trung vệ), **sai nặng** (lệch hai tuyến hoặc hơn, hoặc người không phải thủ môn đứng trong khung); VÀ PHẢI cho người dùng thấy mức đó cùng mức trừ hiệu suất tương ứng.
- [x] AC-5.6 — KHI người dùng kéo một cầu thủ ra khỏi sân THÌ hệ thống PHẢI trả cầu thủ đó về danh sách ngoài sân và để ô vị trí trống.
- [x] AC-5.7 — KHI đội hình chưa đủ 11 cầu thủ, hoặc không có cầu thủ nào ở vị trí thủ môn, hoặc có cầu thủ trong đội hình còn hồ sơ chưa hoàn tất theo AC-2.10 THÌ hệ thống PHẢI nói rõ còn thiếu gì và chặn việc bắt đầu giả lập trận đấu. **Phần đã xong (Giai đoạn 2):** dải tình trạng nêu đúng từng lý do — thiếu người, thiếu thủ môn, có cầu thủ hồ sơ chưa hoàn tất. **Giai đoạn 3 đóng nốt:** màn chọn cặp đấu chặn nút bắt đầu và nêu từng lý do kèm tên đội (kiểm tay ngày 2026-10-28 với một đội chỉ có 5 cầu thủ).
- [x] AC-5.8 — KHI người dùng chuyển sang một sơ đồ khác trong lúc đã xếp người THÌ hệ thống PHẢI giữ lại những cầu thủ đó và tự xếp họ vào các ô của sơ đồ mới sao cho khớp vị trí sở trường nhiều nhất có thể, rồi nêu rõ những ai bị đẩy ra ngoài hoặc bị xếp sai vị trí.
- [x] AC-5.9 — KHI người dùng sắp xếp đội hình mà không dùng chuột THÌ hệ thống PHẢI cho phép đặt và đổi chỗ cầu thủ chỉ bằng bàn phím.
- [x] AC-5.10 — KHI người dùng rời trang chiến thuật rồi quay lại THÌ sơ đồ, vị trí từng cầu thủ, vai trò và chỉ thị PHẢI còn nguyên như lúc rời đi.

### US-6: Gán vai trò cho từng vị trí
Là một **HLV**, tôi muốn **gán vai trò cụ thể cho từng ô trên sơ đồ**, để **hai đội cùng chơi 4-3-3 vẫn chơi khác nhau**.

**Acceptance criteria:**
- [x] AC-6.1 — KHI người dùng chọn một ô vị trí trên sơ đồ THÌ hệ thống PHẢI hiển thị từ 2 đến 3 vai trò dành riêng cho vị trí của ô đó, trong một bộ tổng khoảng 22 vai trò bao trùm cả 12 vị trí.
- [x] AC-6.2 — KHI người dùng gán một vai trò cho ô THÌ hệ thống PHẢI hiển thị tên vai trò đó ngay tại ô trên sơ đồ.
- [x] AC-6.3 — KHI người dùng chọn một vai trò THÌ hệ thống PHẢI giải thích ngắn gọn vai trò đó làm gì và những chỉ số nào quan trọng với nó.
- [x] AC-6.4 — KHI cầu thủ ở một ô có bất kỳ chỉ số quan trọng của vai trò đó dưới 10 trên thang 1–20 THÌ hệ thống PHẢI báo cho người dùng biết cầu thủ này chưa đáp ứng vai trò, kèm nêu tên từng chỉ số đang dưới ngưỡng và giá trị hiện tại của nó.
- [x] AC-6.5 — KHI người dùng chọn một sơ đồ mới THÌ mỗi ô PHẢI được gán sẵn một vai trò mặc định, để đội luôn ở trạng thái đấu được mà không bắt người dùng phải cấu hình từng ô.
- [x] AC-6.6 — KHI vai trò được gán cho một ô THÌ vai trò đó PHẢI gắn với ô, không gắn với cầu thủ; VÀ KHI người dùng đổi cầu thủ ở ô đó THÌ vai trò PHẢI giữ nguyên.

### US-7: Thiết lập chỉ thị toàn đội
Là một **HLV**, tôi muốn **ra các chỉ thị chung cho cả đội**, để **áp đặt lối chơi tôi muốn và thấy nó thể hiện trong trận**.

**Acceptance criteria:**
- [x] AC-7.1 — KHI người dùng mở phần chỉ thị đội THÌ hệ thống PHẢI cho đặt ít nhất 6 chỉ thị: độ cao đội hình, độ rộng đội hình, tốc độ chuyển bóng, cường độ pressing, hướng tấn công ưu tiên, bẫy việt vị.
- [x] AC-7.2 — KHI người dùng thay đổi một chỉ thị THÌ hệ thống PHẢI nêu ngắn gọn chỉ thị đó đánh đổi điều gì (được gì, mất gì).
- [x] AC-7.3 — KHI người dùng chọn một tổ hợp chỉ thị xung đột với nhau THÌ hệ thống PHẢI cảnh báo sự xung đột đó nhưng VẪN cho phép giữ lựa chọn nếu người dùng muốn.
- [x] AC-7.4 — KHI một đội mới được tạo THÌ hệ thống PHẢI gán sẵn một bộ chỉ thị cân bằng, để đội đấu được ngay mà không cần chỉnh gì.
- [x] AC-7.5 — KHI người dùng lưu một bộ chiến thuật (sơ đồ + vai trò + chỉ thị) dưới một tên THÌ hệ thống PHẢI cho chọn lại bộ đó cho cùng đội ở những trận sau.
- [x] AC-7.6 — KHI một đội đã có chiến thuật được lưu THÌ chiến thuật đó PHẢI là chiến thuật đội dùng khi vào trận, không cần người dùng cấu hình lại trước mỗi trận.

---

### GIAI ĐOẠN 3 — Giả lập và tường thuật

### US-8: Giả lập một trận đấu
Là một **người dùng**, tôi muốn **cho hai đội của mình đấu với nhau và nhận một kết quả có cơ sở**, để **biết đội và chiến thuật của tôi mạnh yếu ra sao**.

**Acceptance criteria:**
- [x] AC-8.1 — KHI người dùng chọn hai đội khác nhau và bắt đầu trận THÌ hệ thống PHẢI chạy giả lập hai hiệp 45 phút, mỗi hiệp có thêm 1–5 phút bù giờ, và cho ra tỉ số cuối cùng; trận hoà PHẢI kết thúc là hoà.
- [x] AC-8.2 — KHI giả lập chạy THÌ hệ thống PHẢI sinh ra một dòng sự kiện theo phút, trong đó mỗi bàn thắng, cơ hội rõ ràng và tình huống đáng chú ý đều gắn với tên cầu thủ cụ thể đang có mặt trên sân.
- [x] AC-8.3 — KHI một đội được xếp chỉ thị tấn công biên THÌ số tình huống tạt cánh của đội đó, tính trung bình qua 10 lần giả lập, PHẢI nhiều hơn ít nhất 50% so với cùng đội đó xếp chỉ thị tấn công trung lộ, với cùng đội hình và cùng đối thủ.
- [x] AC-8.4 — KHI một đội được xếp pressing cường độ cao THÌ đội đó PHẢI giành lại bóng ở khu vực cao trên sân nhiều hơn, VÀ ĐỒNG THỜI để đối thủ có nhiều tình huống thoát xuống phía sau hàng phòng ngự hơn, so với khi đội đó pressing thấp.
- [x] AC-8.5 — KHI một cầu thủ bị xếp sai vị trí THÌ hiệu suất đóng góp của cầu thủ đó trong trận PHẢI thấp hơn so với khi cùng cầu thủ đó được xếp đúng vị trí sở trường, mọi yếu tố khác giữ nguyên; VÀ mức giảm PHẢI nặng dần theo ba mức sai ở AC-5.5.
- [x] AC-8.6 — KHI trận đấu tiến về cuối THÌ mức thể lực của từng cầu thủ trên sân PHẢI giảm dần theo thời gian, tốc độ giảm phụ thuộc chỉ số Thể lực của cầu thủ và cường độ pressing của đội.
- [x] AC-8.7 — KHI một cầu thủ xuống dưới một mức thể lực nhất định THÌ hiệu suất của cầu thủ đó trong các tình huống tiếp theo PHẢI giảm đi, VÀ hệ thống PHẢI báo cho người dùng biết cầu thủ đang kiệt sức.
- [x] AC-8.8 — KHI đội A có mọi cầu thủ cao hơn đội B ít nhất 5 điểm ở mọi chỉ số, cả hai đội đều không có ai bị xếp sai vị trí và đều dùng bộ chỉ thị cân bằng mặc định THÌ qua 10 lần giả lập cùng cặp đấu đó, đội A PHẢI thắng ít nhất 7 lần.
- [x] AC-8.9 — KHI người dùng cố bắt đầu trận mà một trong hai đội chưa đủ điều kiện ở AC-5.7 THÌ hệ thống PHẢI chặn lại và chỉ rõ đội nào thiếu gì.
- [x] AC-8.10 — KHI người dùng chọn cùng một đội cho cả hai phía THÌ hệ thống PHẢI không cho bắt đầu trận.
- [x] AC-8.11 — KHI một trận đấu được giả lập THÌ hệ thống PHẢI sinh và hiển thị một "mã trận" cho trận đó, VÀ PHẢI ghi lại mọi can thiệp giữa trận của người dùng (thay người, đổi chỉ thị, đổi vai trò) kèm phút thực hiện; VÀ KHI người dùng giả lập lại với cùng mã trận, cùng hai đội, cùng chiến thuật xuất phát, cùng đội chủ nhà và cùng chuỗi can thiệp đó THÌ kết quả và toàn bộ dòng sự kiện PHẢI giống y nguyên lần trước.
- [x] AC-8.12 — KHI người dùng giả lập lại trên cùng một mã trận nhưng đã đổi chiến thuật của một đội THÌ hệ thống PHẢI chạy trận đó và cho người dùng so sánh kết quả mới với kết quả cũ của cùng mã trận.
- [x] AC-8.13 — KHI một cầu thủ phạm lỗi trong trận THÌ hệ thống PHẢI có khả năng rút thẻ vàng, với xác suất cao hơn cho cầu thủ có Quyết đoán thấp và cho đội đang pressing cường độ cao; KHI một cầu thủ nhận thẻ vàng thứ hai hoặc một thẻ đỏ trực tiếp THÌ cầu thủ đó PHẢI rời sân và đội đó PHẢI đá thiếu người cho tới hết trận, không được thay người bù vào.
- [x] AC-8.14 — KHI người dùng chọn cặp đấu THÌ hệ thống PHẢI cho chỉ định một đội là chủ nhà, và đội chủ nhà PHẢI được một lợi thế nhỏ trong giả lập; VÀ KHI người dùng chọn "sân trung lập" THÌ lợi thế đó PHẢI bị tắt hoàn toàn cho cả hai đội.
- [x] AC-8.15 — KHI một trận đấu kết thúc THÌ dòng sự kiện của trận đó PHẢI gồm từ 60 đến 100 dòng, chỉ ghi những tình huống có ý nghĩa với thế trận.
- [x] AC-8.16 — KHI người dùng xem 5 trận liên tiếp THÌ các câu tường thuật cho cùng một loại tình huống PHẢI dùng nhiều cách diễn đạt khác nhau có chèn tên cầu thủ, không lặp lại nguyên một câu cho cùng loại tình huống.

### US-9: Theo dõi trận đấu và can thiệp giữa trận
Là một **HLV**, tôi muốn **xem trận đấu diễn ra theo thời gian và can thiệp khi nó đi sai hướng**, để **cảm giác mình thật sự đang chỉ đạo chứ không chỉ bấm nút xem kết quả**.

**Acceptance criteria:**
- [x] AC-9.1 — KHI trận đấu bắt đầu THÌ hệ thống PHẢI hiển thị dòng tường thuật chạy dần theo phút, kèm tỉ số và phút hiện tại luôn nhìn thấy được.
- [x] AC-9.2 — KHI người dùng bấm tạm dừng THÌ hệ thống PHẢI dừng dòng tường thuật tại phút hiện tại và cho phép tiếp tục từ đúng chỗ đó.
- [x] AC-9.3 — KHI người dùng đổi tốc độ tường thuật THÌ hệ thống PHẢI cho ít nhất 3 mức tốc độ và áp dụng ngay mức được chọn.
- [x] AC-9.4 — KHI người dùng chọn chạy hết trận ngay THÌ hệ thống PHẢI nhảy tới kết thúc trận và vẫn giữ đầy đủ dòng sự kiện của toàn bộ trận để xem lại.
- [x] AC-9.5 — KHI trận đang tạm dừng VÀ người dùng thay một cầu thủ trên sân bằng một cầu thủ trong danh sách dự bị THÌ hệ thống PHẢI thực hiện việc thay người tại phút đó, ghi nó vào dòng sự kiện, và các phút sau đó PHẢI tính theo cầu thủ mới.
- [x] AC-9.6 — KHI người dùng đã thực hiện 5 lần thay người trong một trận THÌ hệ thống PHẢI chặn việc thay người tiếp và nói rõ đã hết lượt.
- [x] AC-9.7 — KHI trận đang diễn ra VÀ người dùng đổi chỉ thị đội hoặc vai trò THÌ các phút sau đó PHẢI diễn ra theo cấu hình mới, còn các phút đã qua PHẢI giữ nguyên không bị tính lại.
- [x] AC-9.8 — KHI người dùng đổi chiến thuật hoặc thay người giữa trận THÌ hệ thống PHẢI chỉ cho phép làm điều đó với đội của chính người dùng, không cho can thiệp vào đội còn lại.
- [x] AC-9.9 — KHI người dùng bắt đầu một trận THÌ hệ thống PHẢI yêu cầu chọn 11 cầu thủ chính và đúng 7 cầu thủ dự bị từ danh sách đội; VÀ những cầu thủ không nằm trong 18 người đó PHẢI không được dùng trong trận đó.
- [x] AC-9.10 — KHI người dùng tìm cách đóng ứng dụng trong lúc trận đang diễn ra THÌ hệ thống PHẢI cảnh báo rằng trận sẽ bị huỷ trước khi cho rời đi.

---

### GIAI ĐOẠN 4 — Sân 2D và báo cáo sau trận

### US-10: Xem diễn biến trên sân 2D
Là một **người xem**, tôi muốn **thấy pha bóng đang diễn ra ở đâu trên sân**, để **hiểu diễn biến thay vì chỉ đọc chữ**.

**Acceptance criteria:**
- [x] AC-10.1 — KHI trận đấu đang diễn ra THÌ hệ thống PHẢI hiển thị hình sân 2D với đủ 22 điểm tròn đại diện toàn bộ cầu thủ hai đội, đặt theo sơ đồ và độ cao đội hình của mỗi đội, mang màu áo đã được phân biệt theo AC-3.7. **→ Kiểm tay 2026-10-29: đếm đúng 22 `<g>` điểm, hai thủ môn đối xứng ở hai đầu, hình 4-4-2 nhìn rõ; hai đội trùng màu nên đội khách ra sân áo phụ và hai màu điểm khác hẳn nhau**
- [x] AC-10.2 — KHI dòng tường thuật chuyển sang một tình huống mới THÌ các cầu thủ tham gia tình huống đó PHẢI di chuyển tới khu vực sân nơi tình huống diễn ra, kèm thể hiện đường đi của bóng; các cầu thủ còn lại PHẢI giữ vị trí đứng theo đội hình. **→ Kiểm tay 2026-10-29: lấy 14 mẫu liên tiếp trong trận, mọi cầu thủ KHÔNG tham gia đều giữ đúng một toạ độ suốt 14 mẫu; pha tấn công biên thấy rõ — hậu vệ trái đứng ở `(28 13)` dịch tới `(56 51)` đúng vùng biên có bóng, kèm `polyline` đường bóng và chấm bóng ở cuối đường**
- [x] AC-10.3 — KHI một tình huống đang diễn ra THÌ hệ thống PHẢI làm nổi bật những cầu thủ đang trực tiếp tham gia tình huống đó, phân biệt được với các cầu thủ còn lại. **→ Kiểm tay 2026-10-29: người tham gia có viền dày 1.4 thay vì 0.5, thêm dấu ▲ phía trên và câu "đang tham gia tình huống" trong `<title>`; xem sân ở chế độ grayscale vẫn phân biệt được. Engine hiện chỉ ghi MỘT cầu thủ cho mỗi tình huống (trừ thay người ghi hai) nên người kiến tạo không sáng lên — xem T132**
- [x] AC-10.4 — KHI người dùng tạm dừng trận THÌ sân 2D PHẢI dừng ở đúng trạng thái của phút đó. **→ Kiểm tay 2026-10-29: tạm dừng ở phút 46, chụp toạ độ 22 điểm và đường bóng, chờ 2,5 giây rồi chụp lại — giống hệt từng ký tự, dòng sự kiện cũng không dài thêm**
- [x] AC-10.5 — KHI người dùng chọn tốc độ tường thuật nhanh nhất hoặc chạy hết trận ngay THÌ hệ thống PHẢI vẫn hoàn tất trận trong giới hạn hiệu năng ở mục 6, không bị sân 2D làm chậm lại. **→ Kiểm tay 2026-10-29: bấm "Chạy hết trận" lúc sân đang hiện, đo từ cú bấm tới khi màn hình báo kết thúc: 31ms (ngân sách 3 giây). Trận chạy trọn từ phút 0 đo trước đó: 120ms**
- [x] AC-10.6 — KHI người dùng không muốn xem sân 2D THÌ hệ thống PHẢI cho phép ẩn nó và chỉ xem dòng tường thuật. **→ Kiểm tay 2026-10-29: bấm "Ẩn sân" thì `<svg>` biến mất và chỉ còn dòng tường thuật; tải lại trang rồi mở trận khác, nút vẫn là "Hiện sân" — lựa chọn nằm trong store `meta`, không phải localStorage**

### US-11: Đọc báo cáo sau trận
Là một **HLV**, tôi muốn **một bản báo cáo sau trận**, để **biết chiến thuật của tôi hỏng ở đâu và ai đã chơi tốt**.

**Acceptance criteria:**
- [x] AC-11.1 — KHI trận đấu kết thúc THÌ hệ thống PHẢI hiển thị tỉ số cuối cùng cùng danh sách người ghi bàn kèm phút ghi bàn của cả hai đội. **→ Kiểm tay 2026-10-29: "Đội đo 10 1 – 0 Đội đo 11", người ghi bàn "17' Đội đo 10 6 (Đội đo 10)"**
- [x] AC-11.2 — KHI xem báo cáo sau trận THÌ hệ thống PHẢI hiển thị, cho từng đội: số lần sút, số lần sút trúng đích, tỉ lệ kiểm soát bóng, số cơ hội rõ ràng, số thẻ vàng và thẻ đỏ. **→ Kiểm tay 2026-10-29: 8/9 cú sút, 4/7 sút trúng đích, 53%/47% kiểm soát bóng (cộng đúng 100), 3/7 cơ hội rõ ràng, 5/0 thẻ vàng, 0/0 thẻ đỏ. Số cú sút KHÁC số cơ hội rõ ràng — đây là chỗ lỗi D37 từng làm hai con số luôn bằng nhau**
- [x] AC-11.3 — KHI xem báo cáo sau trận THÌ hệ thống PHẢI chấm điểm từng cầu thủ đã ra sân trên thang 1–10, bắt đầu từ 6.0 và cộng/trừ theo bàn thắng, kiến tạo, sút trúng đích, tỉ lệ chuyền chính xác, số lần cướp bóng, số lần mất bóng và số lần phạm lỗi, với các tiêu chí được cân theo vị trí cầu thủ đã đá; VÀ người dùng PHẢI xem được những số liệu nào đã dẫn tới điểm đó. **→ Kiểm tay 2026-10-29: bấm vào "Đội đo 10 9" (7.4) thấy điểm nền 6.0 rồi Cướp bóng 7 → +0.7, Mất bóng 4 → -0.6, Phạm lỗi 1 → -0.2, Chuyền chính xác 85% → +1.5; cộng lại đúng 7.4. Cùng một trận, hai tiền vệ cùng số liệu khác vị trí cho điểm khác nhau**
- [x] AC-11.4 — KHI xem báo cáo sau trận THÌ hệ thống PHẢI cho xem lại toàn bộ dòng sự kiện của trận vừa rồi. **→ Kiểm tay 2026-10-29: 81 dòng từ "0' Trọng tài nổi còi khai cuộc" tới "91'+ Không còn thời gian nữa, trọng tài thổi còi kết thúc"; mở lại chính trận đó từ lịch sử cũng đủ 81 dòng**
- [x] AC-11.5 — KHI một cầu thủ vào sân từ băng ghế dự bị THÌ báo cáo PHẢI thể hiện rõ cầu thủ đó đá từ phút nào tới phút nào. **→ Kiểm tay 2026-10-29: thay người ở phút 44, báo cáo ghi "Đội đo 10 12 — vào sân phút 45" và "Đội đo 10 3 — ra sân phút 45"; người đá trọn trận ghi "đá trọn trận"**
- [x] AC-11.6 — KHI trận đấu kết thúc THÌ hệ thống PHẢI cho phép giả lập lại ngay cùng cặp đấu đó mà không phải cấu hình lại từ đầu, với lựa chọn dùng lại mã trận cũ hoặc sinh mã trận mới. **→ Kiểm tay 2026-10-29: hai nút "Đấu lại cùng mã trận" và "Đấu lại với mã mới" ngay dưới báo cáo, bấm là vào thẳng trận mới không phải chọn lại đội hay đăng ký lại 11+7; từ lịch sử còn một đường nữa là nút "Đấu lại trận này"**
- [x] AC-11.7 — KHI một trận đấu kết thúc THÌ hệ thống PHẢI lưu trận đó vào lịch sử gồm tỉ số, đội hình hai bên, chiến thuật xuất phát của hai đội, đội chủ nhà, chuỗi can thiệp giữa trận kèm phút thực hiện, báo cáo sau trận, dòng sự kiện đầy đủ và mã trận — đủ để phát lại y nguyên trận đó theo AC-8.11; lịch sử PHẢI giữ 20 trận gần nhất, VÀ KHI trận thứ 21 được lưu THÌ trận cũ nhất PHẢI bị loại khỏi lịch sử. **→ Kiểm tay 2026-10-29: lịch sử đứng đúng ở 20 dòng, trận mới nhất lên đầu, và lúc lưu trận mới có một dòng báo "Lịch sử đã đủ chỗ, nên trận cũ nhất vừa rời khỏi danh sách" — báo đúng một lần. Hai lần chạy cùng mã `HFGK2MABPX` đều ra 1–0 và được lưu thành hai trận riêng**

## 4. Luồng chính (happy path)

1. Người dùng mở ứng dụng lần đầu → thấy trạng thái trống và lời mời tạo đội đầu tiên.
2. Tạo đội "Đội của tôi", gắn logo, chọn màu áo chính và áo phụ → hệ thống mở trang quản lý đội.
3. Thêm lần lượt 18 cầu thủ: tên, số áo, tuổi, vị trí sở trường, chân thuận, rồi bấm sinh nhanh chỉ số theo mức và tỉa lại vài ô; tải ảnh chân dung và cắt khung → mỗi cầu thủ được lưu ngay.
4. Lặp lại bước 2–3 để tạo đội thứ hai làm đối thủ.
5. Mở trang chiến thuật của "Đội của tôi" → chọn sơ đồ 4-3-3 → 11 ô vị trí hiện lên với vai trò mặc định.
6. Kéo từng cầu thủ vào ô phù hợp → hệ thống đánh dấu những ô bị xếp sai vị trí kèm mức sai.
7. Chỉnh vai trò vài ô (ví dụ: ô tiền vệ trụ thành "Tiền vệ mỏ neo") → hệ thống giải thích vai trò và báo nếu cầu thủ chưa đáp ứng.
8. Đặt chỉ thị đội: đội hình cao, chuyển bóng nhanh, pressing cao, tấn công biên → hệ thống nêu đánh đổi của từng chỉ thị. Làm tương tự cho đội thứ hai, hoặc để nó dùng chiến thuật đã lưu.
9. Chọn cặp đấu, chỉ định chủ nhà → chọn 11 chính và 7 dự bị cho mỗi đội → hệ thống kiểm tra đủ điều kiện rồi bắt đầu trận, hiện mã trận.
10. Trận đấu chạy: dòng tường thuật theo phút, sân 2D hiển thị 22 điểm với nhóm liên quan di chuyển theo pha bóng, tỉ số cập nhật.
11. Phút 65, hệ thống báo một cầu thủ kiệt sức → người dùng tạm dừng, thay cầu thủ đó, giảm pressing xuống mức trung bình → tiếp tục.
12. Hết trận (sau bù giờ) → báo cáo sau trận: tỉ số, người ghi bàn, thống kê hai đội, thẻ, điểm từng cầu thủ, dòng sự kiện đầy đủ. Trận được lưu vào lịch sử.
13. Người dùng giả lập lại trên cùng mã trận nhưng đổi hướng tấn công sang trung lộ, rồi so sánh hai kết quả.
14. Trước khi nghỉ, xuất toàn bộ dữ liệu ra một tệp để sao lưu.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Chưa có đội nào | Hiển thị trạng thái trống kèm lối vào tạo đội đầu tiên; mọi chức năng chiến thuật và giả lập bị ẩn hoặc vô hiệu hoá có giải thích |
| Chỉ có 1 đội duy nhất trong hệ thống | Chức năng giả lập nêu rõ cần ít nhất 2 đội và mời tạo đội đối thủ |
| Đội có dưới 18 cầu thủ đủ điều kiện | Trang chiến thuật vẫn mở và cho xếp người, nhưng việc bắt đầu trận bị chặn kèm thông báo còn thiếu bao nhiêu người cho 11 chính và 7 dự bị |
| Đội không có cầu thủ nào ở vị trí thủ môn | Chặn bắt đầu trận, nêu rõ thiếu thủ môn |
| Chỉ số cầu thủ còn để trống | Cho lưu hồ sơ, đánh dấu "chưa hoàn tất", nêu còn thiếu bao nhiêu chỉ số; chỉ bị chặn khi cầu thủ đó được đưa vào đội hình thi đấu |
| Nhập chỉ số ngoài 1–20 hoặc không phải số | Từ chối giá trị, giữ nguyên giá trị hợp lệ cũ, chỉ rõ khoảng cho phép |
| Sinh nhanh chỉ số cho cầu thủ chưa chọn vị trí sở trường | Yêu cầu chọn vị trí trước, vì mức sinh phụ thuộc vị trí |
| Chọn Thủ môn cho cầu thủ đã có vị trí khác, hoặc ngược lại | Chặn, nêu rõ thủ môn dùng bộ chỉ số riêng nên không kiêm vị trí sân |
| Đổi một cầu thủ sân đã nhập chỉ số thành thủ môn | Hỏi xác nhận, nêu rõ bộ chỉ số sẽ đổi sang bộ của thủ môn và những chỉ số không còn dùng tới sẽ không hiện nữa |
| Số áo trùng trong cùng đội | Cảnh báo và chặn lưu đến khi sửa |
| Hai cầu thủ cùng tên trong một đội | Cho phép, nhưng mọi chỗ hiển thị phải phân biệt được hai người (qua số áo) |
| Tệp ảnh không phải ảnh, hoặc hỏng | Thông báo tệp không dùng được, giữ ảnh cũ nếu có |
| Ảnh quá lớn | Tự thu nhỏ trong giới hạn, không báo lỗi cho người dùng |
| Màu áo hai đội quá giống nhau | Tự chuyển một đội sang áo phụ và nói rõ việc đổi |
| Màu áo khiến chữ khó đọc | Tự chọn màu chữ tương phản đạt chuẩn ở mục 6 |
| Tệp sao lưu sai định dạng hoặc hỏng | Từ chối nhập, nêu lý do, dữ liệu hiện có không bị thay đổi dù chỉ một phần |
| Nhập tệp khi đã có dữ liệu | Hỏi rõ thay thế toàn bộ hay gộp thêm, trước khi làm gì |
| Nhập gộp mà trùng tên đội với đội đang có | Giữ cả hai, đội mới được đánh dấu để người dùng tự đổi tên hoặc xoá |
| Dung lượng lưu trữ trình duyệt đầy | Cảnh báo ngay rằng thay đổi chưa được lưu và gợi ý xuất dữ liệu ra tệp |
| Xoá cầu thủ đang nằm trong đội hình | Ô vị trí đó thành trống; đội hình không bị hỏng |
| Xoá đội khi đang có trận dở | Hỏi xác nhận và nêu rõ trận đang diễn ra sẽ bị bỏ |
| Xoá đội đã có trận trong lịch sử | Các trận cũ vẫn xem lại được với tên đội lúc đó, nhưng không đấu lại được |
| Đổi sơ đồ khi đã xếp đủ người | Giữ lại người, tự xếp khớp vị trí sở trường nhiều nhất có thể, nêu rõ ai bị đẩy ra ngoài hoặc xếp sai vị trí |
| Chọn cùng một đội cho cả hai phía | Không cho bắt đầu trận |
| Đóng ứng dụng giữa lúc đang xem trận | Cảnh báo trước khi rời; nếu rời thì trận bị huỷ và không vào lịch sử. Mã trận đã hiện cho phép đấu lại đúng trận đó về sau |
| Thẻ đỏ | Cầu thủ rời sân, đội đá thiếu người tới hết trận, không được thay người bù |
| Thủ môn bị thẻ đỏ | Người dùng phải chọn một cầu thủ trên sân vào bắt gôn, bị trừ hiệu suất ở mức sai nặng; nếu còn lượt thay người thì được đưa thủ môn dự bị vào thay một cầu thủ khác |
| Hết lượt thay người | Chặn thay tiếp, nói rõ đã hết lượt |
| Lịch sử đã đủ 20 trận | Trận mới nhất được lưu, trận cũ nhất bị loại, có thông báo một lần |
| Người dùng chỉ dùng bàn phím, không dùng chuột | Việc xếp và đổi chỗ cầu thủ vẫn làm được hoàn toàn bằng bàn phím |
| Không có kết nối mạng | Mọi chức năng hoạt động bình thường |

## 6. Yêu cầu phi chức năng

**Hiệu năng**
- Mở danh sách cầu thủ của một đội 25 người: hiển thị đầy đủ trong dưới 300ms.
- Kéo-thả cầu thủ trên sơ đồ: phản hồi hình ảnh trong dưới 100ms kể từ thao tác.
- Giả lập trọn một trận ở chế độ chạy hết trận ngay: hoàn tất trong dưới 3 giây, kể cả khi sân 2D đang bật.
- Tường thuật tốc độ thường: 1 phút trận tương ứng khoảng 200ms thực tế; phải có thêm ít nhất 2 mức nhanh hơn.
- Mở ứng dụng với dữ liệu 20 đội và 20 trận lịch sử: dùng được trong dưới 2 giây.

**Bảo mật/quyền riêng tư**
- Toàn bộ dữ liệu và ảnh chỉ nằm trên máy người dùng; không có dữ liệu nào được gửi ra ngoài máy.
- Không cần đăng nhập, không cần tài khoản, không cần kết nối mạng để dùng bất kỳ chức năng nào.
- Tệp sao lưu do người dùng tự quản lý và tự chọn chỗ lưu.

**Accessibility**
- Mọi thao tác xếp đội hình làm được bằng bàn phím, không bắt buộc phải kéo-thả bằng chuột.
- Tương phản chữ trên nền đạt tối thiểu tỉ lệ 4.5:1 ở mọi màn hình, kể cả khi nền dùng màu áo do người dùng chọn.
- Thông tin quan trọng không được truyền đạt chỉ bằng màu sắc; phải có thêm chữ hoặc ký hiệu. Mức sai vị trí và tình trạng kiệt sức phải có nhãn chữ, không chỉ màu.

**Dữ liệu**
- Hỗ trợ tối thiểu 20 đội, mỗi đội tối đa 30 cầu thủ, cùng 20 trận lịch sử, không suy giảm hiệu năng dưới các mốc trên.
- Ảnh chân dung cầu thủ sau khi xử lý: tối đa 100KB mỗi ảnh. Logo đội: tối đa 50KB.
- Dữ liệu được giữ vô thời hạn cho tới khi người dùng tự xoá hoặc tự xoá dữ liệu trình duyệt.

## 7. Định nghĩa hoàn thành (Definition of Done)

**Giai đoạn 1** (đánh dấu ngày 2026-10-27):

- [x] Toàn bộ AC ở mục 3 pass — 30/36 tick trọn; 5 AC (1.5, 2.7, 3.5, 3.7, 4.2) có phần vắt sang GĐ2/GĐ3; AC-4.7 chưa quan sát được trên giao diện
- [x] Trường hợp biên mục 5 được xử lý — các dòng thuộc phạm vi GĐ1 đã kiểm; các dòng cần sơ đồ hoặc trận đấu thuộc GĐ2/GĐ3
- [x] Không vi phạm nguyên tắc nào trong constitution — P4 kiểm bằng bảng mạng: 0 request ra ngoài
- [x] Mỗi giai đoạn bàn giao đều tự chạy được và dùng thử được, không phụ thuộc giai đoạn sau
- [x] Dữ liệu xuất ra ở một giai đoạn vẫn nhập lại được — vòng tròn xuất/nhập đã kiểm cả bằng test và trên trình duyệt

**Giai đoạn 4** (đánh dấu ngày 2026-10-29) — **đóng spec 001**:

- [x] Toàn bộ AC ở mục 3 pass — **98/99 tick**; AC duy nhất còn lại là AC-4.7, lý do ghi ngay tại AC đó
- [x] Trường hợp biên mục 5 được xử lý — bốn dòng còn nợ đã đóng ở giai đoạn này: lịch sử đủ 20 trận báo đúng một lần, xoá đội đã có trận trong lịch sử giữ nguyên trận cũ với tên lúc đó, nhập tệp khi đã có dữ liệu hỏi rõ thay thế hay gộp (gộp thì bỏ qua lịch sử và nói rõ — quyết định D48b), xoá đội khi đang có trận dở hỏi xác nhận nêu rõ trận sẽ bị bỏ. Dòng cuối có code nhưng **không dựng được bằng tay**: rời màn trận đã huỷ trận, nên không có đường nào ở trong ứng dụng vừa còn trận dở vừa đứng ở danh sách đội — xem T128
- [x] Không vi phạm nguyên tắc nào trong constitution — P1 có một ngoại lệ đã khai báo: D34 đổi thứ tự tiêu thụ `Rng` nên mã trận sinh trước Giai đoạn 4 không phát lại đúng nữa (rủi ro R16); `PHIEN_BAN_ENGINE` là chỗ ứng dụng nhận ra và từ chối hứa đấu lại
- [x] Mỗi giai đoạn bàn giao đều tự chạy được và dùng thử được, không phụ thuộc giai đoạn sau
- [x] Dữ liệu xuất ra ở một giai đoạn vẫn nhập lại được — tệp v1–v3 nâng lên v4 có test; tệp v4 đầy đủ 20 đội/347 cầu thủ/20 trận nặng 96 KB

**Các giai đoạn sau:**

- [x] AC-8.3, AC-8.4, AC-8.5, AC-8.8 được kiểm chứng bằng phép so sánh thực tế giữa hai cấu hình chiến thuật, không chỉ bằng việc đọc code — bốn test riêng trong `src/engine/sosanh.*.test.ts`, mỗi test in ra số đo thật
- [x] AC-8.11 được kiểm chứng bằng cách chạy lại cùng mã trận với cùng chuỗi can thiệp giữa trận và đối chiếu từng dòng sự kiện — `src/engine/taiLap.test.ts` (dựng lại đầu vào từ chính `TrangThaiTran`, không từ biến cục bộ của test) và kiểm tay ngày 2026-10-28: cùng mã `P3V8N1TZ6C` chạy hai lần cho 178 dòng giống nhau từng ký tự

## 8. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

Không còn câu hỏi mở. Toàn bộ 17 điểm ban đầu cộng 3 lỗ hổng phát hiện thêm đã được chốt ngày 2026-10-26 — xem mục 10.

## 9. Giả định

- Chỉ có một người dùng duy nhất trên một máy; không cần tách dữ liệu theo người dùng, không cần phân quyền.
- Người dùng chấp nhận bỏ công nhập liệu thủ công cho từng cầu thủ, nhưng chức năng sinh nhanh chỉ số ở AC-2.9 là thứ giữ cho việc nhập một đội 25 người còn khả thi; việc nhập hàng loạt từ nguồn ngoài đã bị loại khỏi phạm vi.
- Người dùng đã tự chuẩn bị ảnh chân dung và logo trên máy; ứng dụng không chịu trách nhiệm tìm hay tạo ảnh.
- Người dùng chạy ứng dụng trên một máy tính cá nhân có chuột và màn hình rộng; mọi thiết kế lấy mốc đó, không tối ưu cho màn hình nhỏ.
- Dữ liệu nằm trong trình duyệt nên sẽ mất nếu người dùng xoá dữ liệu trình duyệt; vì vậy chức năng xuất tệp sao lưu ở US-4 là bắt buộc chứ không phải tiện ích thêm.
- Người dùng hiểu thuật ngữ chiến thuật bóng đá tiếng Việt thông dụng; không cần dạy lại bóng đá trong ứng dụng, chỉ cần giải thích vai trò và chỉ thị ở mức ngắn gọn.
- Mã trận ở AC-8.11 là công cụ để người dùng so sánh chiến thuật một cách công bằng; nó không nhằm mục đích chia sẻ trận đấu với người khác.
- Các lựa chọn nền tảng mà người dùng đã chốt (chạy trong trình duyệt trên máy cá nhân, dữ liệu tự lưu trong trình duyệt kèm xuất/nhập tệp, giao diện tiếng Việt) được ghi nhận ở đây như ràng buộc đầu vào; chi tiết kỹ thuật tương ứng sẽ được chốt trong `plan.md`.
- Repo này chưa có `constitution.md`; cần chạy `/constitution` trước khi `/plan` để có bộ nguyên tắc đối chiếu.

## 10. Nhật ký làm rõ

Toàn bộ quyết định dưới đây được chốt ngày **2026-10-26** qua phiên `/clarify`.

| # | Câu hỏi | Quyết định | Ghi vào |
|---|---|---|---|
| 1 | Đội đối thủ do ai điều khiển? | Mỗi đội có chiến thuật riêng được lưu; vào trận cả hai đội dùng chiến thuật đã lưu, người dùng xem và sửa được cả hai trước khi bắt đầu, nhưng giữa trận chỉ can thiệp được đội của mình | AC-7.6, AC-9.8 |
| 2 | Cùng cấu hình sim hai lần có ra kết quả khác nhau? | Có ngẫu nhiên, nhưng mỗi trận sinh một "mã trận" cho phép chạy lại y nguyên, hoặc chạy lại sau khi đổi chiến thuật để so sánh công bằng | AC-8.11, AC-8.12, Giả định |
| 3 | Danh sách vị trí sở trường? | 12 vị trí có phân biệt trái/phải và phân biệt tiền vệ cánh với chạy cánh | AC-2.1 |
| 4 | Thủ môn điền chỉ số nào? | 8 chỉ số chung có nghĩa + 3 chỉ số riêng = 11 ô; các chỉ số chung còn lại không hiện cho thủ môn | AC-2.3 |
| 5 | Có sinh nhanh chỉ số không? | Có, theo 4 mức (Ngôi sao/Khá/Trung bình/Yếu) và có cân theo vị trí sở trường; vẫn sửa lại được từng ô | AC-2.9, mục 5, mục 9 |
| 6 | Xếp sai vị trí trừ bao nhiêu? | 3 mức theo độ lệch: sai nhẹ (lệch trái/phải cùng tuyến), sai vừa (lệch 1 tuyến), sai nặng (lệch 2+ tuyến hoặc không phải thủ môn mà bắt gôn) | AC-5.5, AC-8.5 |
| 7 | Chỉ số để trống xử lý sao? | Cho lưu dở và đánh dấu hồ sơ chưa hoàn tất; chỉ chặn khi cầu thủ được đưa vào đội hình thi đấu | AC-2.10, AC-5.7, mục 5 |
| 8 | Có chỉ số tổng (overall)? | Có, nhưng tính theo vị trí/vai trò đang đá nên cùng cầu thủ ra số khác nhau ở hai vai trò | AC-2.11 |
| 9 | Dự bị và số lần thay người? | 7 dự bị, thay tối đa 5 lần; trước trận phải đăng ký 11 chính + 7 dự bị | AC-9.6, AC-9.9, mục 5 |
| 10 | Có thẻ và chấn thương? | Có thẻ vàng/đỏ, xác suất ăn thẻ cao hơn khi Quyết đoán thấp hoặc pressing cao; thẻ đỏ thì đá thiếu người. Chấn thương bị loại khỏi phạm vi | AC-8.13, Non-goals, mục 5 |
| 11 | Thời lượng trận? | 90 phút + bù giờ 1–5 phút mỗi hiệp; hoà thì kết thúc hoà. Hiệp phụ và luân lưu bị loại khỏi phạm vi | AC-8.1, Non-goals |
| 12 | Điểm cầu thủ sau trận tính thế nào? | Thang 1–10, bắt đầu từ 6.0, cộng/trừ theo số liệu cá nhân và có cân theo vị trí đã đá; xem được số liệu dẫn tới điểm | AC-11.3 |
| 13 | Những sơ đồ nào có sẵn? | 8 sơ đồ: 4-4-2, 4-4-1-1, 4-3-3, 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3, 5-3-2. Tự tạo sơ đồ riêng bị loại khỏi phạm vi | AC-5.2, Non-goals |
| 14 | Bao nhiêu vai trò mỗi vị trí? | 2–3 vai trò cho mỗi vị trí, tổng khoảng 22 vai trò | AC-6.1 |
| 15 | Có lưu lịch sử trận? | Có, giữ 20 trận gần nhất kèm mã trận; trận thứ 21 đẩy trận cũ nhất ra | AC-11.7, Non-goals, mục 5 |
| 16 | Sân 2D hiển thị thế nào? | Đủ 22 điểm theo đội hình; mỗi tình huống thì nhóm liên quan di chuyển và được làm nổi bật, số còn lại giữ vị trí | AC-10.1, AC-10.2 |
| 17 | Đóng app giữa trận? | Cảnh báo trước khi rời, rời thì trận bị huỷ và không vào lịch sử; mã trận cho phép đấu lại đúng trận đó | AC-9.10, Non-goals, mục 5 |
| 18 | Có lợi thế sân nhà? *(phát hiện khi rà soát)* | Có, lợi thế nhỏ cho đội chủ nhà, kèm tuỳ chọn "sân trung lập" để tắt hoàn toàn khi cần so sánh công bằng | AC-8.14 |
| 19 | Mật độ diễn biến mỗi trận? *(phát hiện khi rà soát)* | 60–100 dòng sự kiện mỗi trận, chỉ ghi tình huống có ý nghĩa với thế trận | AC-8.15 |
| 20 | Văn tường thuật phong phú tới đâu? *(phát hiện khi rà soát)* | Nhiều mẫu câu cho mỗi loại tình huống, có chèn tên cầu thủ; đọc 5 trận liên tiếp không lặp nguyên câu | AC-8.16 |

### Sửa đổi sau khi lập constitution — 2026-10-26

Việc rà chéo spec với `constitution.md` v1.0.0 phát hiện định nghĩa tính tái lập ở AC-8.11 chưa đủ: AC-9.7 cho phép người dùng đổi chỉ thị và thay người ngay giữa trận, nên một trận chỉ phát lại đúng được nếu chuỗi can thiệp đó cũng được ghi lại. Đã sửa:

- **AC-8.11** — bổ sung yêu cầu ghi lại mọi can thiệp giữa trận kèm phút thực hiện, và đưa chuỗi can thiệp cùng đội chủ nhà vào điều kiện để trận phát lại giống y nguyên.
- **AC-11.7** — bổ sung chiến thuật xuất phát hai đội, đội chủ nhà và chuỗi can thiệp vào những gì lịch sử trận phải lưu, đủ để phát lại theo AC-8.11.

Nguyên tắc liên quan: **P1 — Giả lập phải tái lập được**.

### Sửa đổi sau khi soát chéo `/analyze` — 2026-10-26

| # | Vấn đề `/analyze` phát hiện | Quyết định | Ghi vào |
|---|---|---|---|
| 21 | **Mâu thuẫn không thể hiện thực:** AC-2.6 cho chọn nhiều vị trí, AC-2.3 lại bắt thủ môn chỉ có 11 chỉ số và ẩn các chỉ số còn lại. Cầu thủ `[Thủ môn, Trung vệ]` vì thế không có chỉ số để tính chỉ số tổng ở vị trí Trung vệ theo AC-2.11 | Thủ môn có bộ chỉ số riêng của thủ môn, nên **không kiêm vị trí sân**. Mỗi cầu thủ thuộc đúng một trong hai bộ chỉ số | **AC-2.1b** (mới), AC-2.3, AC-2.6, mục 5 (2 dòng mới) |
| 22 | "Hiện kích thước ước tính trước khi xuất" chỉ tồn tại trong `plan.md` như biện pháp giảm thiểu rủi ro R1, không có AC nào yêu cầu | Giữ lại và nâng thành yêu cầu chính thức | **AC-4.8** (mới) |
| 23 | "Xin quyền lưu trữ bền" chỉ tồn tại trong `plan.md` như biện pháp giảm thiểu rủi ro R2 (mất toàn bộ dữ liệu), không có AC nào yêu cầu | Giữ lại và nâng thành yêu cầu chính thức, kèm hành vi khi trình duyệt từ chối | **AC-4.9** (mới) |

Số AC trong phạm vi Giai đoạn 1 tăng từ 33 lên **36** (thêm AC-2.1b, AC-4.8, AC-4.9).
