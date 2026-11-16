# Spec: Dựng đội nhanh, sân sống động, và đấu lại từ một phút bất kỳ

| | |
|---|---|
| **ID** | `004-squad-tools-and-what-if` |
| **Status** | Clarified (2026-11-17) |
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
- **Lưu trận rẽ nhánh vào lịch sử.** Chốt ngày 2026-11-17: rẽ nhánh là thứ
  xem rồi bỏ. Lưu nó đòi đổi mô hình lưu trữ và định dạng tệp sao lưu kèm
  migration — đúng thứ spec này tránh.
- **Rẽ nhánh nhiều tầng** (rẽ nhánh từ một trận đã rẽ nhánh).
- **Mã để tạo lại y hệt một đội sinh ngẫu nhiên.** Muốn đối chứng thì đã có
  nhân bản đội.
- **Chép ảnh khi nhân bản đội.** Bản sao dùng ảnh thay thế mặc định.
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
- [ ] AC-24.4 — KHI người dùng yêu cầu sinh cả một đội THÌ đội sinh ra PHẢI **đá được ngay**: đủ người để đăng ký ở quân số đã chọn **cộng tối đa 7 dự bị** (sân 11 là **18 người**), mỗi vị trí của sơ đồ có ít nhất một người đá đúng sở trường, và **kèm một bộ chiến thuật đã xếp đủ các ô** của sơ đồ.
- [ ] AC-24.5 — KHI người dùng sinh ngẫu nhiên hai lần liên tiếp với cùng một lựa chọn THÌ hai kết quả PHẢI khác nhau.
- [ ] AC-24.6 — KHI một cầu thủ hay một đội được sinh ra THÌ người dùng PHẢI sửa được mọi trường của nó y như với dữ liệu tự nhập; KHÔNG được có cầu thủ chỉ-đọc, và bộ chiến thuật sinh kèm PHẢI sửa được như bộ tự xếp.
- [ ] AC-24.7 — KHI sinh một đội THÌ thao tác PHẢI hoàn tất hoặc thất bại trọn vẹn: không được để lại một đội dựng dở với vài cầu thủ.
- [ ] AC-24.8 — KHI sinh cầu thủ ở giao diện tiếng Việt THÌ tên sinh ra PHẢI là tên Việt; KHI sinh ở giao diện tiếng Anh THÌ PHẢI là tên Anh. Tên đã sinh rồi thì **giữ nguyên** khi người dùng đổi ngôn ngữ, vì nó là dữ liệu của người dùng chứ không phải nhãn giao diện.

### US-25: Sân 2D chuyển động liên tục

Là một **người dùng**, tôi muốn **nhìn sân 2D thấy một trận bóng đang
chạy**, để **theo được diễn biến bằng mắt chứ không phải ghép lại từ những
ảnh chụp rời**.

**Acceptance criteria:**

- [ ] AC-25.1 — KHI trận đang chạy THÌ các điểm trên sân PHẢI di chuyển liên tục giữa hai tình huống **theo đường cong mềm**, không gấp khúc; KHÔNG điểm nào được nhảy tức thời từ chỗ này sang chỗ khác.
- [ ] AC-25.2 — KHI một tình huống diễn ra ở một vùng sân THÌ đúng tại phút của tình huống đó, những người tham gia PHẢI đã có mặt ở vùng ấy — chuyển động KHÔNG được làm sai vị trí tại mốc.
- [ ] AC-25.3 — KHI người dùng đổi tốc độ trận THÌ chuyển động PHẢI theo kịp nhịp mới: KHÔNG điểm nào còn đang di chuyển dở khi tình huống kế tiếp đã tới.
- [ ] AC-25.4 — KHI mở một trận đã lưu **từ trước spec này** và đấu lại bằng cùng mã trận THÌ kết quả và từng dòng sự kiện PHẢI giống hệt trận cũ.
- [ ] AC-25.5 — KHI chuyển động liên tục đang bật THÌ tỉ số, dòng tường thuật, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.
- [ ] AC-25.6 — KHI hệ điều hành của người dùng bật chế độ giảm chuyển động THÌ sân PHẢI tôn trọng lựa chọn đó và không chuyển động liên tục nữa, mà vẫn hiển thị đúng vị trí tại từng mốc.
- [ ] AC-25.7 — KHI một cầu thủ đã xuống thể lực **trong trận đang chạy** THÌ điểm của anh ta trên sân PHẢI di chuyển **chậm hơn rõ rệt** so với lúc còn sung sức, và chậm hơn một người cùng lúc đó còn đủ thể lực.
- [ ] AC-25.8 — KHI tốc độ di chuyển phản ánh thể lực THÌ tình trạng thể lực đó PHẢI **đồng thời** có mặt dưới dạng chữ; chuyển động KHÔNG được là cách duy nhất để biết một người đã kiệt sức.
- [ ] AC-25.9 — KHI sân 2D đang bật với chuyển động theo đường cong và 22 điểm cùng di chuyển THÌ giả lập trọn một trận ở chế độ chạy ngay PHẢI vẫn xong trong dưới 3 giây.

### US-26: Dựng đội nhanh hơn

Là một **người dùng**, tôi muốn **nhân bản đội, tìm được người trong danh
sách, và được điền hộ đội hình kèm lý do**, để **thời gian của tôi dành cho
việc thử chiến thuật chứ không phải cho việc nhập liệu và cuộn chuột**.

**Acceptance criteria:**

- [ ] AC-26.1 — KHI người dùng nhân bản một đội THÌ đội mới PHẢI có đủ toàn bộ cầu thủ với chỉ số giống hệt đội gốc, và PHẢI mang tên phân biệt được với đội gốc.
- [ ] AC-26.2 — KHI người dùng sửa hoặc xoá một cầu thủ ở đội nhân bản THÌ đội gốc PHẢI không thay đổi gì, và ngược lại.
- [ ] AC-26.3 — KHI người dùng nhân bản một đội THÌ đội mới PHẢI **không mang** ảnh chân dung của cầu thủ và logo của đội gốc, mà dùng ảnh thay thế mặc định; và hệ thống PHẢI nói trước điều đó để người dùng không tưởng là lỗi.
- [ ] AC-26.4 — KHI người dùng lọc danh sách cầu thủ THÌ hệ thống PHẢI lọc được theo **tên, vị trí sở trường, khoảng chỉ số tổng, tuổi, và chân thuận**; các bộ lọc PHẢI kết hợp được với nhau.
- [ ] AC-26.5 — KHI lọc theo khoảng chỉ số tổng THÌ hệ thống PHẢI nói rõ con số ấy đang tính theo **vai trò nào**, vì chỉ số tổng của một người đổi theo vai trò đang xét.
- [ ] AC-26.6 — KHI người dùng lọc danh sách THÌ danh sách PHẢI chỉ còn những người khớp, và PHẢI nói rõ đang hiện bao nhiêu trên tổng số bao nhiêu.
- [ ] AC-26.7 — KHI không ai khớp điều kiện lọc THÌ hệ thống PHẢI nói rõ là không có kết quả và cho một thao tác để trở về danh sách đầy đủ.
- [ ] AC-26.8 — KHI người dùng yêu cầu tự chọn đội hình THÌ hệ thống PHẢI điền các ô của sơ đồ đang dùng, và với **mỗi ô** PHẢI nêu được lý do người đó được chọn.
- [ ] AC-26.9 — KHI đội không đủ người cho sơ đồ đang dùng THÌ hệ thống PHẢI điền được bao nhiêu hay bấy nhiêu và nói rõ còn thiếu mấy người, KHÔNG được từ chối im lặng.
- [ ] AC-26.10 — KHI hệ thống tự chọn đội hình THÌ người dùng PHẢI vẫn đổi lại được từng ô sau đó.

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
- [ ] AC-27.9 — KHI người dùng rời màn hình rẽ nhánh THÌ kết quả rẽ nhánh PHẢI mất đi — nó **không** được lưu vào lịch sử — và hệ thống PHẢI nói rõ điều đó **trước** khi người dùng rời đi, chứ không để họ phát hiện sau.
- [ ] AC-27.10 — KHI người dùng đang xem một trận rẽ nhánh THÌ hệ thống PHẢI **không** cho rẽ nhánh tiếp từ chính nó, và PHẢI nói rõ rằng mỗi lần rẽ nhánh đều xuất phát từ một trận trong lịch sử.

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
| Đội thiếu người so với sơ đồ | Điền được bao nhiêu hay bấy nhiêu, nói rõ còn thiếu mấy người (AC-26.9) |
| Sinh cầu thủ vào đội đã dùng hết số áo hợp lệ | Từ chối và nói rõ vì sao, không sinh ra cầu thủ trùng số |
| Lọc không ra ai | Thông báo không có kết quả + cách trở về danh sách đầy đủ (AC-26.7) |
| Nhân bản đội khi dung lượng lưu trữ đã đầy | Thất bại trọn vẹn, báo lỗi bằng ngôn ngữ đang chọn, KHÔNG để lại đội dựng dở |
| Sinh đội thất bại giữa chừng | Như trên — tất cả hoặc không gì (AC-24.7) |
| Rẽ nhánh một trận chạy bằng engine cũ | Từ chối kèm lý do (AC-27.5) |
| Rẽ nhánh một trận mà đội đã bị xoá | Từ chối kèm lý do (AC-27.6) |
| Chọn phút nằm ngoài trận | Từ chối, nói rõ khoảng phút chọn được (AC-27.8) |
| Rẽ nhánh rồi rẽ nhánh tiếp từ chính trận rẽ nhánh | Không cho, và nói rõ mỗi lần rẽ nhánh đều xuất phát từ một trận trong lịch sử (AC-27.10) |
| Người dùng rời màn hình rẽ nhánh | Hỏi trước, nói rõ kết quả rẽ nhánh sẽ mất vì nó không được lưu (AC-27.9) |
| Nhân bản đội khi đội gốc chưa có cầu thủ nào | Vẫn nhân bản được, ra một đội rỗng mang tên mới; không báo lỗi |
| Lọc theo khoảng chỉ số tổng khi chưa chọn vai trò | Nói rõ đang tính theo vai trò nào, hoặc bắt chọn trước (AC-26.5) |
| Người dùng bật giảm chuyển động của hệ điều hành | Sân không chuyển động liên tục nữa, vị trí tại mốc vẫn đúng (AC-25.6) |
| Mất mạng | Không ảnh hưởng gì: ứng dụng vốn không gọi mạng (hiến pháp P4) |

## 6. Yêu cầu phi chức năng

- **Hiệu năng:**
  - Sinh một đội đầy đủ: thao tác hoàn tất trong **< 2 giây**.
  - Nhân bản một đội 30 cầu thủ: **< 2 giây**.
  - Gõ vào ô tìm: danh sách cập nhật trong **< 100ms** với đội 30 người.
  - Chuyển động liên tục KHÔNG được làm vượt ngân sách cũ: giả lập trọn một
    trận ở chế độ chạy ngay vẫn **< 3 giây** kể cả khi sân 2D đang bật, với
    22 điểm cùng di chuyển theo đường cong (AC-25.9). Đây là ngân sách chịu
    áp lực nhất của spec, vì người dùng đã chọn phương án chuyển động đắt
    nhất; nếu lúc lập plan thấy không đạt thì phải quay lại bàn, chứ không
    âm thầm hạ chất lượng chuyển động.
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

Không còn câu hỏi mở. Toàn bộ 8 điểm đã được chốt ngày **2026-11-17** —
xem mục 10.

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
- Người dùng chấp nhận **đội nhân bản không có ảnh**. Mục đích của nhân bản
  là làm đối chứng để so chiến thuật, không phải để ngắm.
- Người dùng chấp nhận **mất kết quả rẽ nhánh khi rời màn hình**. Nếu sau
  này thấy tiếc, việc lưu nó là một spec riêng chứ không nhét vào đây, vì
  nó kéo theo đổi định dạng tệp sao lưu.
- Chuyển động theo thể lực (AC-25.7) **chỉ áp dụng cho trận đang chạy**.
  Đã kiểm trên code ngày 2026-11-17: thể lực từng người nằm trong **trạng
  thái trận đang chạy**, không nằm trong dòng sự kiện đã lưu. Trận đang
  chạy thì giao diện đọc được, nên AC-25.7 dựng được mà không đụng engine.
  Nhưng điều đó có nghĩa là **xem lại một trận đã lưu trên sân 2D sẽ không
  có tầng thông tin này** — và việc xem lại ấy vốn không thuộc phạm vi spec
  này, nên không mâu thuẫn. Nếu một spec sau muốn xem lại trận cũ trên sân
  2D kèm thể lực thì nó phải tự giải bài toán ấy.

## 10. Nhật ký làm rõ

Tám câu hỏi mở của mục 8 đã chốt ngày **2026-11-17**.

| # | Câu hỏi | Quyết định | Ảnh hưởng tới |
|---|---|---|---|
| 1 | Sinh cả đội thì sinh bao nhiêu người, có sinh chiến thuật không? | **18 người cho sân 11** (quân số đang chọn + tối đa 7 dự bị), **kèm một bộ chiến thuật đã xếp đủ ô**. Sinh xong là đá được ngay, đúng như AC-24.4 đòi — giá phải trả là phạm vi rộng hơn hẳn phương án chỉ sinh người | AC-24.4, AC-24.6 |
| 2 | Tên cầu thủ sinh theo thứ tiếng nào? | **Theo ngôn ngữ giao diện đang chọn**. Tên đã sinh thì giữ nguyên khi đổi ngôn ngữ, vì nó là dữ liệu người dùng chứ không phải nhãn giao diện — đúng quyết định của spec 003 về việc không dịch dữ liệu người dùng. Cần hai kho tên hư cấu trong repo | AC-24.8, mục 6, mục 9 |
| 3 | Trận rẽ nhánh có lưu vào lịch sử? | **Không lưu** — xem rồi bỏ. Giữ cho spec này không phải đổi mô hình lưu trữ và định dạng tệp sao lưu. Đổi lại, rời màn hình là mất, nên hệ thống phải nói trước | AC-27.9, Non-goals, mục 5 |
| 4 | Có rẽ nhánh tiếp từ trận đã rẽ nhánh? | **Không.** Mỗi lần rẽ nhánh đều xuất phát từ một trận trong lịch sử. Tránh phải nghĩ cách hiển thị cây nhánh, và tránh để người dùng lạc không biết đang ở nhánh nào | AC-27.10, Non-goals, mục 5 |
| 5 | Lọc cầu thủ theo tiêu chí nào? | **Cả năm**: tên, vị trí sở trường, khoảng chỉ số tổng, tuổi, chân thuận — và kết hợp được với nhau. Riêng chỉ số tổng phải nói rõ đang tính theo vai trò nào, vì con số ấy đổi theo vai trò | AC-26.4, AC-26.5 |
| 6 | Nhân bản đội có chép ảnh? | **Không chép.** Bản sao dùng ảnh thay thế mặc định. Chép hết là ~3MB mỗi lần bấm; dùng chung ảnh thì va thẳng vào AC-26.2 "bản sao và gốc không ảnh hưởng nhau" | AC-26.3, Non-goals |
| 7 | Nội suy chuyển động làm tới đâu? | **Đường cong + tốc độ theo thể lực** — phương án đắt nhất trong ba phương án, người dùng chọn ngược khuyến nghị. Kéo theo hai ràng buộc mới: ngân sách 3 giây một trận phải vẫn đạt với 22 điểm chạy đường cong, và tình trạng thể lực vẫn phải có mặt bằng chữ vì P9 cấm truyền thông tin chỉ bằng chuyển động | AC-25.1, AC-25.7, AC-25.8, AC-25.9, mục 6 |
| 8 | Đội sinh ngẫu nhiên có mã để tạo lại y hệt? | **Không cần.** Sinh xong là dữ liệu bình thường, sửa thoải mái (AC-24.6); muốn đối chứng thì đã có nhân bản đội | Non-goals |

**Ghi chú về câu 7.** Đây là lần thứ hai trong dự án người dùng chọn ngược
khuyến nghị của tôi — lần trước là chế độ tối ở spec 003, và lần ấy quyết
định của người dùng đúng. Cái giá lần này đã ghi thành hai AC kiểm chứng
được (AC-25.8, AC-25.9) thay vì để nó lộ ra lúc đang code.
