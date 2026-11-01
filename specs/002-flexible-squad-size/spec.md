# Spec: Đội hình linh hoạt 5 tới 11 người

| | |
|---|---|
| **ID** | `002-flexible-squad-size` |
| **Status** | Planned (2026-11-01) |
| **Created** | 2026-11-01 |
| **Branch** | `002-flexible-squad-size` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

## 1. Vấn đề & mục tiêu

**Vấn đề:** Ứng dụng chỉ đá được **11 người mỗi bên**. Người dùng ở Việt Nam
chơi và xem bóng đá sân 5, sân 7 nhiều hơn hẳn sân 11 — đội phong trào thường
chỉ có 8–12 người, không đủ để dựng một đội 11 người có dự bị. Hiện tại họ
không có cách nào mô phỏng chính thứ họ đá hằng tuần: muốn thử một ý tưởng
chiến thuật sân 7 thì phải nhập đủ 18 người và chấp nhận xem một trận sân 11
không giống gì với trận của mình.

**Mục tiêu:** Người dùng chọn được số người mỗi bên trong khoảng **5 tới 11**,
và mọi thứ còn lại của ứng dụng — sơ đồ, xếp đội hình, trận đấu, sân 2D, báo
cáo, lịch sử — hoạt động đúng với quân số đã chọn.

**Non-goals** (lần này KHÔNG làm):

- **Nút tạo đội hoặc cầu thủ ngẫu nhiên** — đã chốt làm, nhưng thuộc spec 003.
- **Chuyển động liên tục trên sân 2D** — đã chốt làm, nhưng thuộc spec 004.
- Luật riêng của futsal: thủ môn ném bóng thay phát bóng, đá biên bằng chân,
  lỗi tổng hợp, thay người không giới hạn, hội ý. Lần này chỉ là **số người
  trên sân** đổi, luật chơi giữ nguyên như sân 11.
- Kích thước sân thật khác nhau theo định dạng (sân futsal 40×20m, sân 7
  ~50×30m). Xem câu hỏi mở về cách thể hiện sân.
- Đá sân 3 người, 4 người, hay nhiều hơn 11.
- **Người dùng tự đặt vị trí từng ô trên sân.** Sơ đồ vẫn là chọn từ bộ dựng sẵn,
  đúng như spec 001 đã chốt; quân số nhỏ không mở lại cánh cửa đó.
- Giải đấu, mùa giải, chuyển nhượng — vẫn nằm ngoài phạm vi như spec 001.
- Đổi số người **giữa trận** (bắt đầu 7 rồi chuyển sang 5).

## 2. Người dùng & bối cảnh

- **Ai dùng:** vẫn là một người dùng duy nhất trên máy cá nhân của họ, người
  đã nhập đội và cầu thủ của mình — nay thêm nhóm chơi sân 5/sân 7 phong trào,
  những người có ít hơn 18 cầu thủ trong tay.
- **Khi nào dùng:** lúc dựng đội lần đầu (chọn mình chơi định dạng nào), và
  mỗi lần bắt đầu một trận.
- **Thiết bị/môi trường:** không đổi so với spec 001 — máy tính cá nhân, một
  trình duyệt, chạy ngoại tuyến.

## 3. User stories

### US-12: Chọn quân số cho trận đấu
Là một **người chơi sân 5 hoặc sân 7**, tôi muốn **chọn số người mỗi bên trước
khi bắt đầu trận**, để **xem đúng thứ bóng đá mà tôi chơi ngoài đời**.

**Acceptance criteria:**
- [ ] AC-12.1 — KHI người dùng chuẩn bị một trận THÌ hệ thống PHẢI cho chọn số người mỗi bên trong khoảng **5 tới 11**, áp cho **cả hai đội**, và nêu rõ con số đang chọn.
- [ ] AC-12.1b — KHI một đội được dùng ở nhiều trận THÌ đội đó PHẢI đá được ở **mọi** quân số, vì quân số thuộc về **trận** chứ không gắn cứng vào đội.
- [ ] AC-12.2 — KHI người dùng chưa chọn gì THÌ hệ thống PHẢI mặc định **11 người**, để người đã dùng ứng dụng từ trước không thấy gì thay đổi.
- [ ] AC-12.3 — KHI một đội không đủ cầu thủ cho quân số đã chọn THÌ hệ thống PHẢI chặn bắt đầu trận và nêu rõ còn thiếu bao nhiêu người cho đội nào.
- [ ] AC-12.4 — KHI trận đấu kết thúc và được lưu vào lịch sử THÌ bản ghi PHẢI mang theo quân số đã đá, VÀ lịch sử PHẢI hiển thị con số đó.
- [ ] AC-12.5 — KHI người dùng chuẩn bị một trận THÌ hệ thống PHẢI cho chọn **thời lượng trận** trong các mức dựng sẵn **20, 30, 45, 60 và 90 phút**, độc lập với quân số, mặc định **90 phút** để người đã dùng ứng dụng từ trước không thấy gì thay đổi.
- [ ] AC-12.6 — KHI trận đấu kết thúc THÌ bản ghi lịch sử PHẢI mang theo thời lượng đã đá, VÀ lịch sử PHẢI hiển thị con số đó bên cạnh quân số.

### US-13: Sơ đồ đúng với quân số
Là một **HLV**, tôi muốn **những sơ đồ phù hợp với số người mình đá**, để
**xếp người theo một hình hài có nghĩa chứ không phải 4-4-2 bị cắt bớt**.

**Acceptance criteria:**
- [ ] AC-13.1 — KHI người dùng mở trang chiến thuật với quân số **n** THÌ hệ thống PHẢI chỉ đưa ra những sơ đồ **dựng sẵn** có **đúng n ô**, và mỗi sơ đồ PHẢI có đúng một ô thủ môn.
- [ ] AC-13.2 — KHI quân số là **n** THÌ hệ thống PHẢI có **ít nhất hai** sơ đồ dựng sẵn khác nhau cho mỗi giá trị n từ 5 tới 11 — tức tối thiểu 14 sơ đồ — để việc chọn sơ đồ còn là một lựa chọn thật.
- [ ] AC-13.3 — KHI người dùng đổi quân số sau khi đã xếp đội hình THÌ hệ thống PHẢI giữ lại những người xếp được, tự khớp vị trí sở trường nhiều nhất có thể, và nêu rõ ai bị đẩy ra ngoài — đúng cách đổi sơ đồ ở AC-5.5 đang làm.
- [ ] AC-13.4 — KHI xem một sơ đồ của quân số nhỏ THÌ mỗi ô PHẢI vẫn có vị trí và vai trò như sơ đồ 11 người, không có ô nào "không rõ vị trí".
- [ ] AC-13.5 — KHI hiển thị một sơ đồ THÌ sơ đồ đó PHẢI có **tên gọi** theo cách người chơi bóng quen đọc, ví dụ "2-2" hay "1-2-1" cho sân 5, "2-3-1" cho sân 7.

### US-14: Đăng ký và thay người theo quân số
Là một **HLV**, tôi muốn **luật đăng ký và thay người tính theo quân số thật**,
để **đá sân 5 không bị đòi 18 người như sân 11**.

**Acceptance criteria:**
- [ ] AC-14.1 — KHI bắt đầu một trận quân số **n** THÌ hệ thống PHẢI yêu cầu đúng **n** cầu thủ chính, và cho đăng ký **từ 0 tới 7** cầu thủ dự bị — bao nhiêu cũng được, kể cả không có ai.
- [ ] AC-14.1b — KHI một đội chỉ có đúng **n** cầu thủ đủ điều kiện THÌ hệ thống PHẢI vẫn cho bắt đầu trận, với băng ghế dự bị trống.
- [ ] AC-14.2 — KHI một đội không có cầu thủ nào ở vị trí thủ môn THÌ hệ thống PHẢI chặn bắt đầu trận ở **mọi** quân số, nêu rõ thiếu thủ môn.
- [ ] AC-14.3 — KHI người dùng thay người THÌ số lượt thay PHẢI **bằng đúng số dự bị đã đăng ký** — thay hết người trên ghế là hết lượt — và hệ thống PHẢI nêu rõ còn bao nhiêu lượt.
- [ ] AC-14.3b — KHI một đội đăng ký **0 dự bị** THÌ chức năng thay người PHẢI bị vô hiệu hoá kèm lời giải thích, chứ không im lặng từ chối.
- [ ] AC-14.4 — KHI một cầu thủ nhận thẻ đỏ THÌ đội đó PHẢI đá thiếu người tới hết trận ở mọi quân số, không được thay người bù.
- [ ] AC-14.5 — KHI một đội còn **dưới 60% quân số** trên sân THÌ trọng tài PHẢI dừng trận ngay tại phút đó — sân 11 dừng khi còn dưới 7 người, sân 5 dừng khi còn dưới 3.
- [ ] AC-14.6 — KHI một trận bị dừng vì thiếu người THÌ trận đó PHẢI vẫn vào lịch sử, mang tỉ số tại lúc dừng và một ghi chú nói rõ trận bị huỷ ở phút nào.

### US-15: Trận đấu và sân 2D đúng với quân số
Là một **người xem**, tôi muốn **trận đấu và hình sân phản ánh đúng số người
trên sân**, để **những gì tôi đọc và nhìn thấy khớp với nhau**.

**Acceptance criteria:**
- [ ] AC-15.1 — KHI trận đấu quân số **n** đang diễn ra THÌ sân 2D PHẢI hiển thị đúng **2n** điểm tròn, đặt theo sơ đồ của mỗi đội.
- [ ] AC-15.2 — KHI hai đội đá quân số nhỏ THÌ không điểm nào được **chồng khít** lên điểm khác tới mức người xem đếm thiếu người.
- [ ] AC-15.3 — KHI xem báo cáo sau trận của một trận quân số **n** THÌ bảng điểm cầu thủ PHẢI có đúng những người đã ra sân của trận đó, không thừa không thiếu.
- [ ] AC-15.4 — KHI cùng một cặp đội đá ở quân số **thấp hơn** THÌ **số cú sút và số cơ hội rõ ràng trung bình mỗi trận PHẢI cao hơn** so với quân số cao hơn, đo trên nhiều trận chứ không phải một trận — ít người thì khoảng trống nhiều, và quân số phải thay đổi thế trận chứ không chỉ đổi số lượng tên người.
- [ ] AC-15.5 — KHI trận có thời lượng **T** phút THÌ số dòng tường thuật PHẢI co theo tỉ lệ **T/90** so với khoảng 60–100 dòng của trận 90 phút — trận 45 phút cho 30–50 dòng — để nhịp đọc giữ nguyên ở mọi thời lượng.
- [ ] AC-15.6 — KHI quân số nhỏ hơn 11 THÌ hình sân 2D PHẢI dùng khung sân **ngắn và hẹp hơn** khung của quân số lớn hơn, chứ không vẽ cùng một kích thước cho mọi định dạng.

### US-16: Dữ liệu cũ không bị hỏng
Là một **người đã dùng ứng dụng từ trước**, tôi muốn **đội, cầu thủ và lịch sử
trận của mình còn nguyên sau khi ứng dụng có thêm định dạng mới**, để **không
phải nhập lại thứ đã bỏ công nhập**.

**Acceptance criteria:**
- [ ] AC-16.1 — KHI mở ứng dụng sau khi nâng cấp THÌ toàn bộ đội, cầu thủ, ảnh, chiến thuật và lịch sử trận PHẢI còn nguyên.
- [ ] AC-16.2 — KHI mở một trận đã lưu từ trước THÌ hệ thống PHẢI vẫn xem lại được đầy đủ báo cáo và dòng sự kiện của trận đó.
- [ ] AC-16.3 — KHI một trận đã lưu không còn đấu lại đúng được nữa THÌ hệ thống PHẢI chặn nút đấu lại và nói rõ lý do bằng tiếng Việt, thay vì hứa rồi cho ra một trận khác.
- [ ] AC-16.4 — KHI nhập một tệp sao lưu xuất từ bản ứng dụng trước THÌ hệ thống PHẢI nhận được, và mọi trận trong tệp đó PHẢI được hiểu là trận **11 người**.

## 4. Luồng chính (happy path)

1. Người dùng mở ứng dụng → thấy các đội của mình như cũ.
2. Bấm bắt đầu một trận → màn chọn cặp đấu hiện thêm ô chọn **số người mỗi bên**, đang để mặc định 11.
3. Chọn **7 người** → hệ thống cho biết mỗi đội cần bao nhiêu người chính và bao nhiêu dự bị.
4. Chọn hai đội → hệ thống kiểm quân số, báo ngay nếu đội nào thiếu người hoặc thiếu thủ môn.
5. Mỗi đội chọn một sơ đồ trong những sơ đồ **7 ô**; người đã xếp sẵn đội hình 11 thì được giữ lại tối đa, ai bị đẩy ra ngoài được nêu tên.
6. Bắt đầu trận → sân 2D hiện **14 điểm**, dòng tường thuật chạy như thường.
7. Hết trận → báo cáo sau trận chỉ chấm điểm những người đã ra sân; trận vào lịch sử kèm con số **7 người**.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Đội có ít hơn quân số đã chọn | Chặn bắt đầu trận, nêu rõ thiếu bao nhiêu người cho đội nào |
| Đội đủ người nhưng không có thủ môn | Chặn bắt đầu trận, nêu rõ thiếu thủ môn |
| Đội chỉ đủ người chính, không có dự bị | Cho bắt đầu trận bình thường; chức năng thay người bị vô hiệu hoá kèm lời giải thích |
| Đổi quân số khi đã xếp xong đội hình | Giữ lại người xếp được, nêu rõ ai bị đẩy ra ngoài |
| Thẻ đỏ làm một bên còn dưới 60% quân số | Dừng trận ngay tại phút đó; trận vẫn vào lịch sử với tỉ số lúc dừng và ghi chú bị huỷ |
| Mở một trận cũ đá 11 người trong lịch sử | Xem lại được đầy đủ; nếu không đấu lại đúng được thì nói rõ lý do |
| Nhập tệp sao lưu cũ chưa có khái niệm quân số | Nhận được, mọi trận cũ hiểu là 11 người |
| Hai đội lệch quân số | Không xảy ra: quân số là của trận và áp cho cả hai bên. Không có đường nào trong giao diện dựng được trận lệch quân |
| Người dùng gõ một số ngoài khoảng 5–11 | Từ chối giá trị, giữ nguyên giá trị hợp lệ cũ, nêu rõ khoảng cho phép |
| Không có kết nối mạng | Mọi chức năng hoạt động bình thường, như spec 001 |

## 6. Yêu cầu phi chức năng

- **Hiệu năng:** mọi ngân sách của spec 001 giữ nguyên và PHẢI còn đúng ở mọi
  quân số — mở ứng dụng dưới 2 giây; chạy hết một trận ở tốc độ nhanh nhất
  dưới 3 giây. Trận quân số nhỏ **không được chậm hơn** trận 11 người.
- **Accessibility:** như spec 001 — xếp và đổi chỗ cầu thủ làm được hoàn toàn
  bằng bàn phím; thông tin quan trọng không truyền đạt chỉ bằng màu.
- **Dữ liệu:** vẫn giữ 20 trận gần nhất, không phân biệt quân số. Hỗ trợ tối
  thiểu 20 đội như spec 001.
- **Ngôn ngữ:** toàn bộ chữ hiển thị bằng tiếng Việt.

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution
- [ ] Mỗi quân số trong khoảng 5–11 được **tự tay chạy thử ít nhất một trận
      trọn vẹn**, không chỉ kiểm bằng test
- [ ] Dữ liệu tạo từ bản ứng dụng trước mở lại được, và tệp sao lưu cũ nhập
      lại được
- [ ] AC-15.4 được kiểm chứng bằng **phép so sánh thực tế** giữa hai quân số,
      không chỉ bằng việc đọc code — đúng kỷ luật mà spec 001 áp cho các AC
      dạng so sánh

## 8. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

Không còn câu hỏi mở. Toàn bộ 11 điểm ban đầu cộng 2 điểm phát sinh trong lúc
làm rõ đã được chốt ngày **2026-11-01** — xem mục 10.


## 9. Giả định

- Mọi AC của spec 001 vẫn còn hiệu lực trừ chỗ spec này nói khác. Spec này mở
  rộng ứng dụng đang chạy, không viết lại nó.
- Người dùng chấp nhận rằng **mã trận lưu từ trước có thể không còn phát lại
  ra đúng trận cũ** sau khi số người trên sân trở thành một tham số — ứng dụng
  phải nói rõ điều đó thay vì im lặng cho ra một trận khác (AC-16.3). Đây là
  thứ đã xảy ra hai lần trong spec 001 và lần nào cũng được xử lý như vậy.
- Trận đã lưu từ trước **chỉ cần xem lại được**, không cần đấu lại đúng. Giữ
  được khả năng phát lại y nguyên sẽ đòi chạy song song engine cũ, và đó là
  một phạm vi khác hẳn — người dùng đã chốt không làm.
- Khái niệm vị trí, vai trò và chỉ thị của spec 001 dùng lại được cho quân số
  nhỏ; không cần nghĩ ra bộ vị trí riêng cho sân 5.
- Người dùng tự nhập cầu thủ như cũ. Việc sinh đội ngẫu nhiên để có đủ người
  nhanh thuộc spec 003, nên spec này không dựa vào nó.

## 10. Nhật ký làm rõ

Toàn bộ quyết định dưới đây được chốt ngày **2026-11-01** qua phiên `/clarify`.

| # | Câu hỏi | Quyết định | Ghi vào |
|---|---|---|---|
| 1 | Quân số thuộc về trận hay đội? | **Của trận** — chọn lúc bắt đầu, một đội đá được mọi định dạng, không phải nhập lại dữ liệu | AC-12.1, AC-12.1b |
| 2 | Hai đội có buộc cùng quân số? | **Buộc cùng.** Lệch quân làm mọi phép so sánh chiến thuật của spec 001 hết đo được | AC-12.1, mục 5 |
| 3 | Sơ đồ lấy từ đâu? | **Bộ dựng sẵn**, có tên gọi quen thuộc. Tự đặt vị trí từng ô vẫn nằm ngoài phạm vi, đúng như spec 001 | AC-13.1, AC-13.5, Non-goals |
| 4 | Đá ít người thì thế trận đổi chiều nào? | **Số cú sút và cơ hội rõ ràng mỗi trận tăng** khi quân số giảm. Đây là chiều để AC-15.4 đo được | AC-15.4 |
| 5 | Số dự bị theo quân số? | **Tuỳ ý 0 tới 7.** Sửa luật 11+7 của spec 001 thành 11+0..7, để nhóm 8 người đá được sân 7 | AC-14.1, AC-14.1b |
| 6 | Số lượt thay người? | **Bằng đúng số dự bị đã đăng ký.** Đăng ký 0 dự bị thì chức năng thay người bị vô hiệu hoá kèm giải thích | AC-14.3, AC-14.3b |
| 7 | Thời lượng trận? | **Người dùng tự chọn** trong các mức 20, 30, 45, 60, 90 phút; mặc định 90 | AC-12.5, AC-12.6 |
| 8 | Thẻ đỏ làm còn quá ít người? | **Dừng trận khi một bên còn dưới 60% quân số** — sân 11 dưới 7, sân 5 dưới 3, khớp luật thật cả hai định dạng. Trận dừng vẫn vào lịch sử kèm ghi chú | AC-14.5, AC-14.6, mục 5 |
| 9 | Chọn thời lượng thế nào? *(phát sinh từ câu 7)* | **Vài mức dựng sẵn**, không gõ số tự do — mỗi mức chốt sẵn được mật độ dòng nên test phủ hết được | AC-12.5 |
| 10 | Mật độ dòng khi thời lượng đổi? *(phát sinh từ câu 7)* | **Co theo tỉ lệ T/90.** Trận 45 phút cho 30–50 dòng; nhịp đọc giữ nguyên ở mọi thời lượng | AC-15.5 |
| 11 | Trận cũ trong lịch sử? | **Chỉ cần xem lại được.** Đấu lại đúng sẽ đòi chạy song song engine cũ — một phạm vi khác hẳn | AC-16.3, mục 9 |
| 12 | Hình sân 2D có đổi tỉ lệ? | **Có.** Quân số nhỏ dùng khung sân ngắn và hẹp hơn; lưới vùng không đổi nên chi phí thấp | AC-15.6 |
| 13 | Mấy sơ đồ mỗi quân số? | **Ít nhất hai**, tức tối thiểu 14 sơ đồ cho dải 5–11 | AC-13.2 |
