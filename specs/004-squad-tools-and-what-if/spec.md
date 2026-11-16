# Spec: Dựng đội nhanh, sân sống động, và đấu lại từ một phút bất kỳ

| | |
|---|---|
| **ID** | `004-squad-tools-and-what-if` |
| **Status** | Draft (2026-11-16) |
| **Created** | 2026-11-16 |
| **Branch** | `004-squad-tools-and-what-if` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Spec này thuộc vòng lặp huấn luyện viên, KHÔNG phải vòng lặp sự nghiệp.**
> Hiến pháp **3.0.1** vừa thêm vòng lặp thứ hai — đời một cầu thủ — nhưng
> cùng ngày người dùng chốt: hoàn thiện vòng lặp huấn luyện viên trước, sự
> nghiệp để sau. Xem mục 1 của hiến pháp. Ai đọc tài liệu này sau khi đọc
> hiến pháp mà thấy "sao lại quay về chế độ cũ" thì câu trả lời là: nó không
> đi lạc, nó xếp hàng.

## 1. Vấn đề & mục tiêu

**Vấn đề.** Ứng dụng đã làm tốt việc giả lập một trận đấu phản ánh đúng
chiến thuật, nhưng đường đi từ *"tôi muốn thử một ý"* tới *"tôi thấy kết
quả"* vẫn quá dài và quá bịt:

- **Dựng đội là hàng giờ gõ tay.** Muốn thử một sơ đồ cần hai đội; mỗi đội
  18 cầu thủ; mỗi cầu thủ một nắm chỉ số. Ứng dụng đã biết sinh chỉ số cho
  một người theo mức độ, nhưng vẫn bắt gõ tên, tuổi, số áo, vị trí từng
  người một. Hai spec liền đã hẹn làm nút sinh ngẫu nhiên rồi lại hoãn.
- **So hai chiến thuật thì không có đối chứng.** Muốn biết "Pressing cao có
  hơn không", cần hai đội giống hệt nhau. Hiện không có cách nào ngoài gõ
  lại 18 người lần nữa.
- **Danh sách 18 người đã phải cuộn**, mà chỉ có sắp xếp, không có tìm.
- **Sân 2D nhảy giật.** Các điểm nhảy từ mốc tình huống này sang mốc kia,
  nên trận đấu trông như một chuỗi ảnh chụp chứ không như một trận bóng.
- **Và câu hỏi hay nhất thì không hỏi được:** *"phút 70 tôi đang dẫn, nếu
  lúc đó lùi đội hình xuống thì sao?"* Ứng dụng cho đổi chỉ thị **trong lúc
  trận đang chạy**, nhưng một khi trận đã xong thì câu hỏi ấy chết theo.

**Mục tiêu.** Rút ngắn đường từ ý tưởng tới kết quả, và biến tính tất định
— thứ ba spec qua chỉ là một ràng buộc kỹ thuật — thành một tính năng người
dùng cầm được:

1. Dựng xong một đội đá được trong vài thao tác, thay vì vài giờ.
2. Có đối chứng để so chiến thuật công bằng.
3. Tìm được người trong danh sách dài.
4. Xem trận đấu như một trận đấu, không phải một chuỗi ảnh.
5. Hỏi được "nếu lúc đó tôi làm khác thì sao" trên một trận đã đá xong.

**Non-goals** (lần này KHÔNG làm):

- **Hoàn tác xoá đội / xoá cầu thủ.** Đã cân nhắc ngày 2026-11-16 và để lại.
- **Mọi thứ thuộc vòng lặp sự nghiệp**: mùa giải, lịch đấu, bảng xếp hạng,
  huấn luyện viên AI chọn đội hình, phát triển chỉ số theo tuổi.
- **Huấn luyện viên đối thủ biết phản ứng giữa trận.** Đối thủ vẫn giữ
  nguyên một bộ chiến thuật suốt trận, như hiện nay.
- **Nhiều giọng tường thuật** (trung lập / cuồng nhiệt / báo chí).
- **Phong độ ngày thi đấu** — hệ số ẩn làm cùng đội hình ra kết quả khác.
- **Chạy hàng loạt N trận để so hai chiến thuật bằng thống kê.**
- **Đổi bất kỳ công thức hay luật bóng đá nào.** Spec này KHÔNG chạm engine
  và KHÔNG làm đổi kết quả của bất kỳ trận nào đã lưu.
- Nhập dữ liệu hàng loạt từ tệp bảng tính hay nguồn bên ngoài.
- Kho dữ liệu cầu thủ có thật đóng gói sẵn (hiến pháp mục 3 cấm).

## 2. Người dùng & bối cảnh

- **Ai dùng:** vẫn là một người dùng duy nhất, tự dựng đội và tự thử chiến
  thuật trên máy mình.
- **Khi nào dùng:** bốn nhóm tính năng rơi vào hai thời điểm khác nhau —
  *trước trận* (sinh đội, nhân bản, tìm người, tự chọn đội hình) và *sau
  trận* (đấu lại từ một phút). Chuyển động liên tục thì ở giữa, lúc đang xem.
- **Thiết bị/môi trường:** trình duyệt Chromium đời mới trên máy cá nhân,
  chạy offline, dữ liệu nằm trong máy.

## 3. User stories

### US-24: Sinh cầu thủ và đội ngẫu nhiên

Là một **người dùng**, tôi muốn **dựng được một đội đá được mà không phải
gõ tay từng người**, để **thử một ý tưởng chiến thuật ngay trong hôm nay
chứ không phải cuối tuần**.

**Acceptance criteria:**

- [ ] AC-24.1 — KHI người dùng yêu cầu sinh một cầu thủ ngẫu nhiên THÌ hệ thống PHẢI tạo ra một cầu thủ có **đủ** tên, tuổi, số áo, vị trí sở trường và toàn bộ chỉ số; KHÔNG trường bắt buộc nào được để trống.
- [ ] AC-24.2 — KHI người dùng chọn một mức độ trước khi sinh THÌ chỉ số của cầu thủ sinh ra PHẢI nằm trong dải của đúng mức đó, và một cầu thủ mức cao hơn PHẢI có chỉ số tổng cao hơn một cầu thủ mức thấp hơn ở cùng vị trí.
- [ ] AC-24.3 — KHI sinh một cầu thủ vào một đội đã có người THÌ số áo sinh ra PHẢI không trùng với bất kỳ số áo nào đang dùng trong đội đó.
- [ ] AC-24.4 — KHI người dùng yêu cầu sinh cả một đội THÌ đội sinh ra PHẢI **đá được ngay**: đủ người để đăng ký ở quân số đã chọn, và mỗi vị trí của sơ đồ có ít nhất một người đá đúng sở trường.
- [ ] AC-24.5 — KHI người dùng sinh ngẫu nhiên hai lần liên tiếp với cùng một lựa chọn THÌ hai kết quả PHẢI khác nhau.
- [ ] AC-24.6 — KHI một cầu thủ hay một đội được sinh ra THÌ người dùng PHẢI sửa được mọi trường của nó y như với dữ liệu tự nhập; KHÔNG được có cầu thủ chỉ-đọc.
- [ ] AC-24.7 — KHI sinh một đội THÌ thao tác PHẢI hoàn tất hoặc thất bại trọn vẹn: không được để lại một đội dựng dở với vài cầu thủ.

### US-25: Sân 2D chuyển động liên tục

Là một **người dùng**, tôi muốn **nhìn sân 2D thấy một trận bóng đang
chạy**, để **theo được diễn biến bằng mắt chứ không phải ghép lại từ những
ảnh chụp rời**.

**Acceptance criteria:**

- [ ] AC-25.1 — KHI trận đang chạy THÌ các điểm trên sân PHẢI di chuyển liên tục giữa hai tình huống; KHÔNG điểm nào được nhảy tức thời từ chỗ này sang chỗ khác.
- [ ] AC-25.2 — KHI một tình huống diễn ra ở một vùng sân THÌ đúng tại phút của tình huống đó, những người tham gia PHẢI đã có mặt ở vùng ấy — chuyển động KHÔNG được làm sai vị trí tại mốc.
- [ ] AC-25.3 — KHI người dùng đổi tốc độ trận THÌ chuyển động PHẢI theo kịp nhịp mới: KHÔNG điểm nào còn đang di chuyển dở khi tình huống kế tiếp đã tới.
- [ ] AC-25.4 — KHI mở một trận đã lưu **từ trước spec này** và đấu lại bằng cùng mã trận THÌ kết quả và từng dòng sự kiện PHẢI giống hệt trận cũ.
- [ ] AC-25.5 — KHI chuyển động liên tục đang bật THÌ tỉ số, dòng tường thuật, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.
- [ ] AC-25.6 — KHI hệ điều hành của người dùng bật chế độ giảm chuyển động THÌ sân PHẢI tôn trọng lựa chọn đó và không chuyển động liên tục nữa, mà vẫn hiển thị đúng vị trí tại từng mốc.

### US-26: Dựng đội nhanh hơn

Là một **người dùng**, tôi muốn **nhân bản đội, tìm được người trong danh
sách, và được điền hộ đội hình kèm lý do**, để **thời gian của tôi dành cho
việc thử chiến thuật chứ không phải cho việc nhập liệu và cuộn chuột**.

**Acceptance criteria:**

- [ ] AC-26.1 — KHI người dùng nhân bản một đội THÌ đội mới PHẢI có đủ toàn bộ cầu thủ với chỉ số giống hệt đội gốc, và PHẢI mang tên phân biệt được với đội gốc.
- [ ] AC-26.2 — KHI người dùng sửa hoặc xoá một cầu thủ ở đội nhân bản THÌ đội gốc PHẢI không thay đổi gì, và ngược lại.
- [ ] AC-26.3 — KHI người dùng gõ vào ô tìm trong danh sách cầu thủ THÌ danh sách PHẢI chỉ còn những người khớp, và PHẢI nói rõ đang hiện bao nhiêu trên tổng số bao nhiêu.
- [ ] AC-26.4 — KHI không ai khớp điều kiện tìm THÌ hệ thống PHẢI nói rõ là không có kết quả và cho một thao tác để trở về danh sách đầy đủ.
- [ ] AC-26.5 — KHI người dùng yêu cầu tự chọn đội hình THÌ hệ thống PHẢI điền các ô của sơ đồ đang dùng, và với **mỗi ô** PHẢI nêu được lý do người đó được chọn.
- [ ] AC-26.6 — KHI đội không đủ người cho sơ đồ đang dùng THÌ hệ thống PHẢI điền được bao nhiêu hay bấy nhiêu và nói rõ còn thiếu mấy người, KHÔNG được từ chối im lặng.
- [ ] AC-26.7 — KHI hệ thống tự chọn đội hình THÌ người dùng PHẢI vẫn đổi lại được từng ô sau đó.

### US-27: Đấu lại từ một phút bất kỳ với một quyết định khác

Là một **người dùng**, tôi muốn **quay lại một phút trong trận đã đá xong,
đổi một quyết định, và xem phần còn lại diễn ra khác đi**, để **biết quyết
định của mình có đáng hay không, thay vì mãi mãi tự hỏi**.

**Acceptance criteria:**

- [ ] AC-27.1 — KHI người dùng mở một trận đã lưu và chọn một phút THÌ hệ thống PHẢI cho đổi chỉ thị toàn đội hoặc thay một người tại phút đó, rồi chạy tiếp phần còn lại của trận.
- [ ] AC-27.2 — KHI trận rẽ nhánh chạy xong THÌ **mọi dòng tường thuật trước điểm rẽ PHẢI giống hệt trận gốc** — cùng phút, cùng thứ tự, cùng từng chữ.
- [ ] AC-27.3 — KHI xem kết quả rẽ nhánh THÌ hệ thống PHẢI cho so sánh trực tiếp với trận gốc, tối thiểu gồm tỉ số và các chỉ tiêu hai đội đã có trong báo cáo sau trận.
- [ ] AC-27.4 — KHI người dùng không đổi gì mà vẫn chạy tiếp THÌ trận rẽ nhánh PHẢI ra kết quả y hệt trận gốc.
- [ ] AC-27.5 — KHI trận gốc chạy bằng một phiên bản engine cũ hơn bản đang dùng THÌ hệ thống PHẢI từ chối rẽ nhánh và nói rõ vì sao.
- [ ] AC-27.6 — KHI một trong hai đội của trận gốc đã bị xoá THÌ hệ thống PHẢI từ chối rẽ nhánh và nói rõ vì sao.
- [ ] AC-27.7 — KHI rẽ nhánh xong THÌ **trận gốc PHẢI còn nguyên** trong lịch sử, không bị sửa và không bị thay thế.
- [ ] AC-27.8 — KHI người dùng chọn một phút sau khi trận đã kết thúc, hoặc một phút không có trong trận THÌ hệ thống PHẢI từ chối và nói rõ khoảng phút chọn được.

## 4. Luồng chính (happy path)

**Dựng hai đội đối chứng rồi so chiến thuật:**

1. Người dùng tạo một đội mới → chọn "sinh cả đội", chọn mức độ và quân số
   → hệ thống tạo xong một đội đá được.
2. Người dùng nhân bản đội vừa tạo → có hai đội giống hệt nhau, tên khác nhau.
3. Người dùng mở trang chiến thuật của đội thứ hai → đổi một chỉ thị.
4. Người dùng bắt đầu trận giữa hai đội → xem sân 2D chạy liên tục, đọc
   tường thuật.
5. Hết trận, người dùng đọc báo cáo.

**Hỏi "nếu lúc đó tôi làm khác":**

6. Người dùng mở trận vừa đá trong lịch sử → chọn phút 70 trong tường thuật.
7. Người dùng đổi một chỉ thị tại phút đó → chạy tiếp.
8. Hệ thống hiện trận rẽ nhánh: 69 phút đầu y hệt, phần sau khác đi, kèm
   bảng so sánh với trận gốc.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Đội rỗng, bấm "tự chọn đội hình" | Nói rõ đội chưa có cầu thủ nào, không để màn hình trống |
| Đội thiếu người so với sơ đồ | Điền được bao nhiêu hay bấy nhiêu, nói rõ còn thiếu mấy người (AC-26.6) |
| Sinh cầu thủ vào đội đã dùng hết số áo hợp lệ | Từ chối và nói rõ vì sao, không sinh ra cầu thủ trùng số |
| Tìm không ra ai | Thông báo không có kết quả + cách trở về danh sách đầy đủ (AC-26.4) |
| Nhân bản đội khi dung lượng lưu trữ đã đầy | Thất bại trọn vẹn, báo lỗi bằng ngôn ngữ đang chọn, KHÔNG để lại đội dựng dở |
| Sinh đội thất bại giữa chừng | Như trên — tất cả hoặc không gì (AC-24.7) |
| Rẽ nhánh một trận chạy bằng engine cũ | Từ chối kèm lý do (AC-27.5) |
| Rẽ nhánh một trận mà đội đã bị xoá | Từ chối kèm lý do (AC-27.6) |
| Chọn phút nằm ngoài trận | Từ chối, nói rõ khoảng phút chọn được (AC-27.8) |
| Rẽ nhánh rồi rẽ nhánh tiếp từ chính trận rẽ nhánh | [NEEDS CLARIFICATION — xem mục 8] |
| Người dùng bật giảm chuyển động của hệ điều hành | Sân không chuyển động liên tục nữa, vị trí tại mốc vẫn đúng (AC-25.6) |
| Mất mạng | Không ảnh hưởng gì: ứng dụng vốn không gọi mạng (hiến pháp P4) |

## 6. Yêu cầu phi chức năng

- **Hiệu năng:**
  - Sinh một đội đầy đủ: thao tác hoàn tất trong **< 2 giây**.
  - Nhân bản một đội 30 cầu thủ: **< 2 giây**.
  - Gõ vào ô tìm: danh sách cập nhật trong **< 100ms** với đội 30 người.
  - Chuyển động liên tục KHÔNG được làm vượt ngân sách cũ: giả lập trọn một
    trận ở chế độ chạy ngay vẫn **< 3 giây** kể cả khi sân 2D đang bật.
  - Chạy tiếp một trận rẽ nhánh: **< 3 giây**, như một trận thường.
- **Bảo mật/quyền riêng tư:** không đổi. Dữ liệu vẫn chỉ nằm trên máy người
  dùng, không gọi mạng, nên kho tên dùng để sinh ngẫu nhiên phải nằm trong
  ứng dụng.
- **Accessibility:** mọi thao tác mới PHẢI đi được bằng bàn phím; tương phản
  chữ/nền tối thiểu 4.5:1 ở **cả hai** chế độ sáng và tối; chuyển động phải
  tôn trọng lựa chọn giảm chuyển động của hệ điều hành (AC-25.6).
- **Song ngữ:** mọi chuỗi mới phải có đủ tiếng Việt và tiếng Anh trong cùng
  một commit (hiến pháp P8).
- **Dữ liệu:** nhân bản đội làm dữ liệu tăng gấp đôi cho mỗi lần bấm; trận
  rẽ nhánh có thể sinh thêm bản ghi trận. Cả hai phải nằm trong giới hạn
  "20 đội × 30 cầu thủ + 20 trận lịch sử" mà hiến pháp mục 3 cam kết.

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution **3.0.1**
- [ ] **Phiên bản engine KHÔNG đổi**, và có phép kiểm tự động chứng minh
      một trận lưu từ trước spec này đấu lại vẫn cho đúng kết quả cũ
- [ ] Có phép kiểm tự động chứng minh **AC-27.2**: phần trước điểm rẽ giống
      hệt trận gốc, từng dòng
- [ ] Có phép kiểm tự động chứng minh **AC-27.4**: rẽ nhánh mà không đổi gì
      thì ra kết quả y hệt
- [ ] Có phép kiểm tự động cho lớp sinh ngẫu nhiên: cùng nguồn ngẫu nhiên
      cho ra cùng kết quả (P1), và chỉ số nằm đúng dải của mức đã chọn
- [ ] Tự tay đi hết các màn hình mới ở **cả hai ngôn ngữ và cả hai chế độ
      sáng/tối**
- [ ] Tệp sao lưu xuất từ bản trước spec này nhập lại được, dữ liệu nguyên vẹn
- [ ] Đo lại các ngân sách ở mục 6, không cái nào vượt

## 8. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

- [NEEDS CLARIFICATION: Sinh cả một đội thì sinh **bao nhiêu cầu thủ**, và có sinh luôn **bộ chiến thuật** cho đội đó không? Gợi ý: sinh đủ cho quân số đang chọn cộng dự bị (ví dụ 18 người cho sân 11), và sinh luôn một bộ chiến thuật mặc định để đội đá được ngay — nhưng điều này làm phạm vi rộng thêm.]
- [NEEDS CLARIFICATION: Tên cầu thủ sinh ra theo **thứ tiếng nào** — tên Việt, tên Anh, hay theo ngôn ngữ giao diện đang chọn? Và kho tên lấy từ đâu? Hiến pháp cấm đóng gói tên người thật, nên kho tên phải là tên hư cấu hoặc ghép từ các âm tiết. Gợi ý: ghép âm tiết theo ngôn ngữ đang chọn, để đội sinh ra đọc tự nhiên ở cả hai thứ tiếng.]
- [NEEDS CLARIFICATION: Trận rẽ nhánh có được **lưu vào lịch sử** như một trận mới không? Lịch sử đang giữ đúng 20 trận, nên rẽ nhánh vài lần sẽ đẩy trận cũ ra. Ba hướng: (a) không lưu, chỉ xem rồi bỏ; (b) lưu như trận thường và chấp nhận đẩy trận cũ; (c) lưu nhưng đánh dấu là nhánh của trận gốc và không tính vào 20 trận.]
- [NEEDS CLARIFICATION: Có cho **rẽ nhánh tiếp từ một trận đã rẽ nhánh** không? Nếu có thì phải nghĩ cách hiển thị cây nhánh; nếu không thì phải nói rõ với người dùng tại chỗ.]
- [NEEDS CLARIFICATION: Lọc cầu thủ theo **những tiêu chí nào**? Gợi ý tối thiểu: theo tên và theo vị trí. Có cần lọc theo khoảng chỉ số tổng, theo tuổi, theo chân thuận không?]
- [NEEDS CLARIFICATION: Nhân bản đội có nhân bản cả **ảnh chân dung và logo** không? Mỗi ảnh tới 100KB, một đội 30 người là ~3MB mỗi lần bấm. Ba hướng: chép hết; dùng chung ảnh với đội gốc; hoặc bỏ ảnh ở bản sao.]
- [NEEDS CLARIFICATION: Nội suy chuyển động thì người chạy theo **đường thẳng hay đường cong**, và tốc độ có phụ thuộc **thể lực** của cầu thủ không? Gợi ý: đường thẳng và tốc độ đều là đủ cho mục tiêu "nhìn ra là một trận bóng"; đường cong và tốc độ theo thể lực đẹp hơn nhưng không AC nào đòi.]
- [NEEDS CLARIFICATION: Đội sinh ngẫu nhiên có cần một **mã để tạo lại y hệt** không, giống như mã trận? Nó làm P1 quan sát được từ phía người dùng và cho phép chia sẻ "đội mẫu", nhưng thêm một khái niệm nữa vào giao diện.]

## 9. Giả định

- Vòng lặp huấn luyện viên vẫn là vòng lặp chính; vòng lặp sự nghiệp chưa
  bắt đầu và không ảnh hưởng gì tới spec này.
- Engine **không đổi** trong spec này. Mọi tính năng ở đây đều dựng được
  trên hành vi engine hiện có — nếu lúc lập plan phát hiện một tính năng
  buộc phải đổi engine, phải quay lại hỏi người dùng chứ không tự đổi, vì
  đổi engine là mất nút đấu lại của mọi trận đã lưu.
- Bản ghi trận đã lưu chứa đủ thông tin để chạy lại trận ấy với một chuỗi
  can thiệp khác. Giả định này **đã kiểm** trên code ngày 2026-11-16 và là
  nền của US-27; nếu nó sai thì US-27 phải viết lại.
- Người dùng chấp nhận đội sinh ngẫu nhiên là **đội hư cấu**. Muốn có đội
  và cầu thủ có thật thì vẫn phải tự nhập, đúng như hiến pháp mục 3.
- Số lượng dữ liệu vẫn trong tầm cam kết của hiến pháp: 20 đội × 30 cầu thủ
  + 20 trận lịch sử.
