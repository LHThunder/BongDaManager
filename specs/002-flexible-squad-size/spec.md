# Spec: Đội hình linh hoạt 5 tới 11 người

| | |
|---|---|
| **ID** | `002-flexible-squad-size` |
| **Status** | Draft |
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
- [ ] AC-12.1 — KHI người dùng chuẩn bị một trận THÌ hệ thống PHẢI cho chọn số người mỗi bên trong khoảng **5 tới 11**, và nêu rõ con số đang chọn.
- [ ] AC-12.2 — KHI người dùng chưa chọn gì THÌ hệ thống PHẢI mặc định **11 người**, để người đã dùng ứng dụng từ trước không thấy gì thay đổi.
- [ ] AC-12.3 — KHI một đội không đủ cầu thủ cho quân số đã chọn THÌ hệ thống PHẢI chặn bắt đầu trận và nêu rõ còn thiếu bao nhiêu người cho đội nào.
- [ ] AC-12.4 — KHI trận đấu kết thúc và được lưu vào lịch sử THÌ bản ghi PHẢI mang theo quân số đã đá, VÀ lịch sử PHẢI hiển thị con số đó.

### US-13: Sơ đồ đúng với quân số
Là một **HLV**, tôi muốn **những sơ đồ phù hợp với số người mình đá**, để
**xếp người theo một hình hài có nghĩa chứ không phải 4-4-2 bị cắt bớt**.

**Acceptance criteria:**
- [ ] AC-13.1 — KHI người dùng mở trang chiến thuật với quân số **n** THÌ hệ thống PHẢI chỉ đưa ra những sơ đồ có **đúng n ô**, và mỗi sơ đồ PHẢI có đúng một ô thủ môn.
- [ ] AC-13.2 — KHI quân số là **n** THÌ hệ thống PHẢI có **ít nhất hai** sơ đồ khác nhau cho mỗi giá trị n, để việc chọn sơ đồ còn là một lựa chọn.
- [ ] AC-13.3 — KHI người dùng đổi quân số sau khi đã xếp đội hình THÌ hệ thống PHẢI giữ lại những người xếp được, tự khớp vị trí sở trường nhiều nhất có thể, và nêu rõ ai bị đẩy ra ngoài — đúng cách đổi sơ đồ ở AC-5.5 đang làm.
- [ ] AC-13.4 — KHI xem một sơ đồ của quân số nhỏ THÌ mỗi ô PHẢI vẫn có vị trí và vai trò như sơ đồ 11 người, không có ô nào "không rõ vị trí".

### US-14: Đăng ký và thay người theo quân số
Là một **HLV**, tôi muốn **luật đăng ký và thay người tính theo quân số thật**,
để **đá sân 5 không bị đòi 18 người như sân 11**.

**Acceptance criteria:**
- [ ] AC-14.1 — KHI bắt đầu một trận quân số **n** THÌ hệ thống PHẢI yêu cầu đúng **n** cầu thủ chính, và số dự bị theo quy tắc nêu ở câu hỏi mở.
- [ ] AC-14.2 — KHI một đội không có cầu thủ nào ở vị trí thủ môn THÌ hệ thống PHẢI chặn bắt đầu trận ở **mọi** quân số, nêu rõ thiếu thủ môn.
- [ ] AC-14.3 — KHI người dùng thay người trong một trận quân số **n** THÌ số lượt thay PHẢI theo quy tắc nêu ở câu hỏi mở, và hệ thống PHẢI nêu rõ còn bao nhiêu lượt.
- [ ] AC-14.4 — KHI một cầu thủ nhận thẻ đỏ THÌ đội đó PHẢI đá thiếu người tới hết trận ở mọi quân số, không được thay người bù.

### US-15: Trận đấu và sân 2D đúng với quân số
Là một **người xem**, tôi muốn **trận đấu và hình sân phản ánh đúng số người
trên sân**, để **những gì tôi đọc và nhìn thấy khớp với nhau**.

**Acceptance criteria:**
- [ ] AC-15.1 — KHI trận đấu quân số **n** đang diễn ra THÌ sân 2D PHẢI hiển thị đúng **2n** điểm tròn, đặt theo sơ đồ của mỗi đội.
- [ ] AC-15.2 — KHI hai đội đá quân số nhỏ THÌ không điểm nào được **chồng khít** lên điểm khác tới mức người xem đếm thiếu người.
- [ ] AC-15.3 — KHI xem báo cáo sau trận của một trận quân số **n** THÌ bảng điểm cầu thủ PHẢI có đúng những người đã ra sân của trận đó, không thừa không thiếu.
- [ ] AC-15.4 — KHI cùng một cặp đội đá ở hai quân số khác nhau THÌ ít nhất một chỉ tiêu của báo cáo sau trận PHẢI khác biệt **theo một chiều đã chốt trước** (xem câu hỏi mở), đo trên nhiều trận chứ không phải một trận — quân số phải thay đổi thế trận, không phải chỉ đổi số lượng tên người.

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
| Đội chỉ đủ người chính, không đủ dự bị | Xem câu hỏi mở về số dự bị tối thiểu |
| Đổi quân số khi đã xếp xong đội hình | Giữ lại người xếp được, nêu rõ ai bị đẩy ra ngoài |
| Thẻ đỏ làm một bên còn rất ít người | Xem câu hỏi mở về ngưỡng huỷ trận |
| Mở một trận cũ đá 11 người trong lịch sử | Xem lại được đầy đủ; nếu không đấu lại đúng được thì nói rõ lý do |
| Nhập tệp sao lưu cũ chưa có khái niệm quân số | Nhận được, mọi trận cũ hiểu là 11 người |
| Hai đội chọn quân số khác nhau | Xem câu hỏi mở |
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

- [NEEDS CLARIFICATION: Quân số là thuộc tính của TRẬN hay của ĐỘI? Tức một đội 18 người có đá được cả trận 5 người lẫn trận 11 người tuỳ lúc bắt đầu, hay mỗi đội khi tạo ra đã gắn với một định dạng cố định?]
- [NEEDS CLARIFICATION: Hai đội có buộc phải cùng quân số không? Nếu cho phép lệch (7 đấu 5) thì đó là một tính năng hay là một lỗi cần chặn?]
- [NEEDS CLARIFICATION: Số cầu thủ dự bị theo quân số tính thế nào? Hiện tại là 11 chính + 7 dự bị. Giữ nguyên 7 cho mọi quân số, hay theo tỉ lệ, hay một con số cố định nhỏ hơn cho sân 5 và sân 7?]
- [NEEDS CLARIFICATION: Số lượt thay người theo quân số tính thế nào? Hiện tại là 5 lượt. Sân 5 ngoài đời thường cho thay không giới hạn — có theo luật đó không, hay giữ một con số cố định cho mọi định dạng?]
- [NEEDS CLARIFICATION: Thẻ đỏ làm một bên còn quá ít người thì sao? Luật bóng đá thật huỷ trận khi một đội còn dưới 7 người ở sân 11. Với sân 5 thì ngưỡng là bao nhiêu, và trận bị huỷ được ghi vào lịch sử thế nào?]
- [NEEDS CLARIFICATION: Người dùng chọn sơ đồ từ một danh sách có sẵn cho mỗi quân số, hay được tự đặt vị trí từng ô? Spec 001 đã loại "tự tạo sơ đồ riêng" khỏi phạm vi — điều đó còn đúng với quân số nhỏ không?]
- [NEEDS CLARIFICATION: Thời lượng trận có đổi theo quân số không? Hiện tại là 90 phút + bù giờ. Futsal ngoài đời đá 2×20 phút. Giữ 90 phút cho mọi định dạng, hay mỗi định dạng một thời lượng?]
- [NEEDS CLARIFICATION: Hình sân 2D có đổi tỉ lệ theo quân số không? Sân futsal ngắn và hẹp hơn hẳn sân 11. Vẽ cùng một hình sân cho mọi định dạng, hay đổi tỉ lệ cho đúng cảm giác?]
- [NEEDS CLARIFICATION: Những trận đã lưu trong lịch sử trước khi có tính năng này — chỉ cần XEM LẠI được, hay phải ĐẤU LẠI đúng được? Nếu bắt buộc đấu lại đúng thì phạm vi sẽ lớn hơn nhiều.]
- [NEEDS CLARIFICATION: Mỗi quân số cần ít nhất mấy sơ đồ? AC-13.2 đang đặt tối thiểu là hai, con số đó có đủ không?]
- [NEEDS CLARIFICATION: Đá ít người hơn thì thế trận phải đổi theo CHIỀU nào, để AC-15.4 có thứ đo được? Ví dụ: sân 5 có nhiều cú sút mỗi trận hơn, hay tỉ lệ kiểm soát bóng lệch mạnh hơn, hay nhiều bàn hơn? Cần chốt một chiều cụ thể trước khi code, nếu không thì không có cách nào nói engine đã làm đúng.]

## 9. Giả định

- Mọi AC của spec 001 vẫn còn hiệu lực trừ chỗ spec này nói khác. Spec này mở
  rộng ứng dụng đang chạy, không viết lại nó.
- Người dùng chấp nhận rằng **mã trận lưu từ trước có thể không còn phát lại
  ra đúng trận cũ** sau khi số người trên sân trở thành một tham số — ứng dụng
  phải nói rõ điều đó thay vì im lặng cho ra một trận khác (AC-16.3). Đây là
  thứ đã xảy ra hai lần trong spec 001 và lần nào cũng được xử lý như vậy.
- Khái niệm vị trí, vai trò và chỉ thị của spec 001 dùng lại được cho quân số
  nhỏ; không cần nghĩ ra bộ vị trí riêng cho sân 5.
- Người dùng tự nhập cầu thủ như cũ. Việc sinh đội ngẫu nhiên để có đủ người
  nhanh thuộc spec 003, nên spec này không dựa vào nó.
