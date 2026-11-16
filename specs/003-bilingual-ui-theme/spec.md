# Spec: Giao diện song ngữ, theme bóng đá và bộ biểu tượng

| | |
|---|---|
| **ID** | `003-bilingual-ui-theme` |
| **Status** | Planned (2026-11-16) |
| **Created** | 2026-11-16 |
| **Branch** | `003-bilingual-ui-theme` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện,
> schema, API, tên file) thuộc về `plan.md`.

## 1. Vấn đề & mục tiêu

**Vấn đề.** Ứng dụng hiện chỉ nói được một thứ tiếng và trông như một bản
dựng kỹ thuật, không như một thứ về bóng đá.

Hai cái đau tách bạch:

1. **Chỉ có tiếng Việt.** Người dùng muốn dùng được ứng dụng bằng tiếng Anh,
   và muốn chuyển qua lại chứ không phải chọn một lần rồi mất cái kia. Hiện
   không có đường nào tới đó: chữ hiển thị nằm rải khắp nơi, có chỗ nằm ngay
   trong lớp dữ liệu bóng đá, và câu tường thuật được viết thẳng bằng tiếng
   Việt. Đây là món nợ có chủ đích — hiến pháp cũ cấm hẳn hạ tầng đa ngôn ngữ
   với lý lẽ "không có chỗ để sau này dịch". Hiến pháp **2.0.0** vừa đảo lại
   quyết định ấy, nên món nợ đến hạn trả.
2. **Không có nhận diện.** Giao diện dùng màu và khoảng cách mặc định, không
   có biểu tượng nào. Một ứng dụng về bóng đá mà nhìn vào không thấy bóng đá
   ở đâu thì người dùng không thấy nó là *của mình*.

**Mục tiêu.** Sau khi làm xong:

- Người dùng đổi giữa tiếng Việt và tiếng Anh bằng một thao tác, ở bất cứ
  đâu, kể cả giữa lúc một trận đang chạy, và không mất việc đang làm dở.
- Mỗi ngôn ngữ **trọn vẹn**: không màn hình nào còn sót chữ của ngôn ngữ kia,
  và câu tường thuật đọc tự nhiên ở cả hai thứ tiếng chứ không phải bản dịch
  máy móc.
- Toàn bộ ứng dụng mang một bộ nhận diện bóng đá thống nhất, kèm một bộ biểu
  tượng dùng chung cho những khái niệm lặp đi lặp lại.
- Không một con số, một luật bóng đá, hay một byte dữ liệu người dùng nào đổi
  vì những việc trên.

**Non-goals:**

- Ngôn ngữ thứ ba ngoài tiếng Việt và tiếng Anh.
- **Biểu tượng isometric.** Đã tìm và không có bộ isometric nào giấy phép mở
  phủ đủ 10 khái niệm bóng đá cần dùng; người dùng chốt ngày 2026-11-16 là bỏ
  isometric, lấy một bộ phẳng giấy phép MIT (xem mục 10, điểm 8).
- **Dịch dữ liệu do người dùng nhập.** Tên đội, tên cầu thủ, tên bộ chiến
  thuật giữ nguyên đúng như người dùng đã gõ, ở mọi ngôn ngữ.
- Đổi bất kỳ công thức, luật bóng đá hay hành vi engine nào. Spec này không
  chạm vào kết quả trận đấu.
- Đổi định dạng tệp sao lưu hay cấu trúc dữ liệu đã lưu.
- **Đổi bố cục màn hình.** Vị trí các khối, cách chia cột và đường điều
  hướng giữ nguyên như hiện tại; theme chỉ đổi màu, phông chữ và chi tiết
  trang trí (quyết định ngày 2026-11-16).
- Giao diện riêng cho điện thoại và máy tính bảng (vẫn là non-goal của dự án).
- Hoạt ảnh, chuyển cảnh, hiệu ứng động ngoài những gì đã có.
- Tự sinh đội/cầu thủ ngẫu nhiên và mô phỏng di chuyển liên tục — thuộc spec
  sau.

## 2. Người dùng & bối cảnh

- **Ai dùng:** vẫn một người dùng duy nhất, người đã tự nhập đội và chiến
  thuật của mình từ spec 001.
- **Khi nào dùng:** đổi ngôn ngữ là việc hiếm — chọn một lần rồi thôi, hoặc
  đổi khi muốn cho người khác xem. Theme và biểu tượng thì có mặt ở **mọi**
  lần mở ứng dụng.
- **Thiết bị/môi trường:** trình duyệt Chromium đời mới trên máy cá nhân,
  chạy hoàn toàn offline.

## 3. User stories

### US-17: Đổi ngôn ngữ giao diện

Là một **người dùng**, tôi muốn **đổi giữa tiếng Việt và tiếng Anh bằng một
thao tác**, để **dùng ứng dụng bằng thứ tiếng tôi đang cần, kể cả khi cho
người khác xem**.

**Acceptance criteria:**

- [ ] AC-17.1 — KHI người dùng mở ứng dụng THÌ toàn bộ giao diện PHẢI hiển thị bằng **đúng một** trong hai ngôn ngữ tiếng Việt hoặc tiếng Anh.
- [ ] AC-17.2 — KHI người dùng đổi ngôn ngữ THÌ mọi chữ đang có trên màn hình PHẢI đổi theo ngay, không phải tải lại trang.
- [ ] AC-17.3 — KHI người dùng đang điền dở một biểu mẫu và đổi ngôn ngữ THÌ những gì đã nhập PHẢI còn nguyên.
- [ ] AC-17.4 — KHI người dùng chọn một ngôn ngữ rồi đóng ứng dụng THÌ lần mở sau hệ thống PHẢI dùng lại đúng ngôn ngữ đó.
- [ ] AC-17.5 — KHI người dùng đổi ngôn ngữ **giữa lúc một trận đang chạy** THÌ trận PHẢI tiếp tục đúng trạng thái đang có — cùng phút, cùng tỉ số, cùng vị trí cầu thủ — và mọi dòng tường thuật đã hiện PHẢI đổi sang ngôn ngữ mới.
- [ ] AC-17.6 — KHI người dùng đổi ngôn ngữ THÌ nút đổi ngôn ngữ PHẢI với tới được bằng bàn phím, không chỉ bằng chuột.
- [ ] AC-17.7 — KHI người dùng mở ứng dụng **lần đầu**, chưa từng chọn ngôn ngữ, THÌ hệ thống PHẢI hiển thị **tiếng Việt**, không phụ thuộc thiết lập của trình duyệt hay của máy.

### US-18: Câu tường thuật đọc tự nhiên ở cả hai thứ tiếng

Là một **người dùng**, tôi muốn **dòng tường thuật tiếng Anh đọc như người
Anh viết**, để **theo dõi trận đấu chứ không phải giải mã một bản dịch**.

**Acceptance criteria:**

- [ ] AC-18.1 — KHI xem dòng tường thuật ở tiếng Anh THÌ mỗi câu PHẢI đặt đúng người làm chủ ngữ theo nghĩa của tình huống — pha phạm lỗi PHẢI nêu **người phạm lỗi** làm chủ ngữ, không phải người bị phạm lỗi.
- [ ] AC-18.2 — KHI xem **cùng một trận** ở hai ngôn ngữ THÌ số dòng, thứ tự dòng, phút của từng dòng và người được nhắc trong từng dòng PHẢI giống hệt nhau; chỉ chữ đổi.
- [ ] AC-18.3 — KHI một loại tình huống có nhiều mẫu câu ở ngôn ngữ này THÌ nó PHẢI có **số mẫu câu không ít hơn** ở ngôn ngữ kia, để trận đấu không đọc nghèo đi khi đổi ngôn ngữ.
- [ ] AC-18.4 — KHI mở lại một trận đã lưu **từ trước spec này** THÌ dòng tường thuật PHẢI hiện bằng ngôn ngữ đang chọn, không phải ngôn ngữ lúc trận được lưu.

### US-19: Thuật ngữ bóng đá đúng ở cả hai thứ tiếng

Là một **người dùng**, tôi muốn **tên vị trí, vai trò, chỉ thị và chỉ số dùng
đúng thuật ngữ bóng đá của từng thứ tiếng**, để **đọc là hiểu ngay chứ không
phải đoán**.

**Acceptance criteria:**

- [ ] AC-19.1 — KHI xem tên vị trí, vai trò, chỉ thị và chỉ số ở tiếng Anh THÌ hệ thống PHẢI dùng thuật ngữ bóng đá tiếng Anh thông dụng, KHÔNG dịch từng từ từ tiếng Việt.
- [ ] AC-19.2 — KHI đổi ngôn ngữ THÌ mọi con số — chỉ số tổng, điểm cầu thủ, chỉ tiêu trận đấu, mức sai vị trí — PHẢI giữ nguyên giá trị. Đổi ngôn ngữ KHÔNG được làm đổi bất kỳ kết quả tính toán nào.
- [ ] AC-19.3 — KHI xuất một tệp sao lưu ở một ngôn ngữ rồi nhập lại ở ngôn ngữ kia THÌ dữ liệu PHẢI vào đủ và hiển thị đúng ngôn ngữ đang chọn.
- [ ] AC-19.4 — KHI xem tên đội, tên cầu thủ hay tên bộ chiến thuật do người dùng tự nhập THÌ chúng PHẢI giữ nguyên **đúng như đã gõ** ở mọi ngôn ngữ.

### US-20: Theme bóng đá

Là một **người dùng**, tôi muốn **ứng dụng nhìn ra là về bóng đá**, để **nó
giống một thứ của riêng tôi chứ không phải một bản dựng kỹ thuật**.

**Acceptance criteria:**

- [ ] AC-20.1 — KHI mở bất kỳ màn hình nào THÌ giao diện PHẢI mang một bộ nhận diện thống nhất gợi bóng đá — bảng màu, phông chữ và cách trình bày dùng chung ở mọi màn hình.
- [ ] AC-20.2 — KHI đo tương phản giữa chữ và nền ở **mọi** màn hình THÌ tỉ lệ PHẢI đạt tối thiểu **4.5:1** — ở **cả chế độ sáng lẫn chế độ tối**.
- [ ] AC-20.3 — KHI theme mới được áp dụng THÌ mọi chức năng hiện có PHẢI giữ nguyên hành vi; KHÔNG màn hình nào mất nút, mất thông tin hay mất đường đi.
- [ ] AC-20.4 — KHI chạy ứng dụng **không có mạng** THÌ mọi phông chữ và hình nền của theme PHẢI hiển thị đầy đủ.
- [ ] AC-20.5 — KHI màu áo do người dùng tự chọn được đặt cạnh màu của theme THÌ hai thứ PHẢI vẫn phân biệt được, và chữ trên nền màu áo PHẢI vẫn đạt 4.5:1 — ở cả hai chế độ.
- [ ] AC-20.6 — KHI theme mới được áp dụng THÌ vị trí các khối, cách chia cột và đường điều hướng của mọi màn hình PHẢI giữ nguyên như trước spec này.
- [ ] AC-20.7 — KHI người dùng đổi giữa **chế độ sáng** và **chế độ tối** THÌ toàn bộ màn hình PHẢI đổi theo ngay, không phải tải lại trang, và việc đang làm dở PHẢI còn nguyên.
- [ ] AC-20.8 — KHI người dùng chọn một chế độ rồi đóng ứng dụng THÌ lần mở sau hệ thống PHẢI dùng lại đúng chế độ đó.
- [ ] AC-20.9 — KHI người dùng mở ứng dụng **lần đầu**, chưa từng chọn chế độ, THÌ hệ thống PHẢI hiển thị **chế độ sáng**.
- [ ] AC-20.10 — KHI người dùng đổi chế độ sáng/tối THÌ nút đổi chế độ PHẢI với tới được bằng bàn phím, không chỉ bằng chuột.

### US-21: Bộ biểu tượng nhất quán

Là một **người dùng**, tôi muốn **mỗi khái niệm quen thuộc có một biểu tượng
riêng**, để **quét mắt là tìm ra chỗ cần, không phải đọc từng nhãn**.

**Acceptance criteria:**

- [ ] AC-21.1 — KHI xem các màn hình chính THÌ những khái niệm lặp đi lặp lại — đội, cầu thủ, sân đấu, trận đấu, chiến thuật, lịch sử, sao lưu, thẻ phạt, bàn thắng, thay người — PHẢI mỗi thứ có một biểu tượng riêng.
- [ ] AC-21.2 — KHI đặt các biểu tượng cạnh nhau THÌ chúng PHẢI đến từ **cùng một bộ**, cùng phong cách và cùng độ dày nét, trông như một bộ chứ không phải nhặt từ nhiều nơi.
- [ ] AC-21.3 — KHI một biểu tượng mang thông tin THÌ thông tin đó PHẢI đồng thời có mặt dưới dạng chữ; biểu tượng KHÔNG được là cách duy nhất để hiểu.
- [ ] AC-21.4 — KHI chạy ứng dụng **không có mạng** THÌ mọi biểu tượng PHẢI hiển thị đầy đủ.
- [ ] AC-21.5 — KHI đổi ngôn ngữ THÌ biểu tượng PHẢI giữ nguyên; chỉ chữ đi kèm đổi.

### US-22: Mỗi ngôn ngữ phải trọn vẹn

Là một **người dùng**, tôi muốn **không bao giờ thấy hai thứ tiếng trên cùng
một màn hình**, để **không phải tự hỏi phần nào đã dịch, phần nào chưa**.

**Acceptance criteria:**

- [ ] AC-22.1 — KHI đi hết mọi màn hình ở tiếng Anh THÌ PHẢI KHÔNG còn chữ tiếng Việt nào; và ngược lại, đi hết mọi màn hình ở tiếng Việt THÌ PHẢI KHÔNG còn chữ tiếng Anh nào. *(Ngoại trừ dữ liệu người dùng tự nhập — xem AC-19.4.)*
- [ ] AC-22.2 — KHI một chữ hiển thị thiếu bản ở ngôn ngữ đang chọn THÌ **hai lớp lưới** PHẢI cùng bắt: (a) một phép kiểm tự động PHẢI phát hiện và chặn trước khi phát hành, VÀ (b) nếu vẫn lọt tới bản chạy thì màn hình PHẢI hiện một **dấu hiệu thấy được** ngay tại chỗ thiếu. PHẢI KHÔNG lặng lẽ hiện chữ của ngôn ngữ kia trong bất kỳ trường hợp nào.
- [ ] AC-22.3 — KHI một thông báo lỗi xuất hiện THÌ nó PHẢI bằng ngôn ngữ đang chọn, kể cả lỗi về tệp sao lưu hỏng hay hết dung lượng.
- [ ] AC-22.4 — KHI chữ trong hình vẽ sân 2D hiển thị THÌ nó PHẢI theo ngôn ngữ đang chọn như mọi chữ khác.

### US-23: Dọn hai chỗ hiển thị sai còn lại từ spec 002

Là một **người dùng**, tôi muốn **hai chỗ đang nói sai được sửa luôn trong
đợt này**, để **không phải nhìn con số vô lý mỗi lần dựng trận sân nhỏ**.

**Acceptance criteria:**

- [ ] AC-23.1 — KHI đăng ký đội hình cho một trận quân số **n** THÌ màn hình PHẢI đếm theo đúng **n** — trận sân 5 hiện "5/5 chính", không phải "5/11 chính" — và câu hướng dẫn PHẢI nêu đúng số người chính và khoảng số dự bị mà trận đó cần.
- [ ] AC-23.2 — KHI một trận không bắt đầu được vì có cầu thủ chưa đủ chỉ số THÌ thông báo PHẢI nêu **tên** những cầu thủ đó, không phải mã định danh thô.

## 4. Luồng chính (happy path)

1. Người dùng mở ứng dụng → giao diện hiện bằng ngôn ngữ đã chọn lần trước,
   với theme bóng đá và biểu tượng ở mọi màn hình.
2. Người dùng bấm nút đổi ngôn ngữ → toàn bộ chữ trên màn hình đổi ngay sang
   ngôn ngữ kia, vị trí cuộn và việc đang làm dở giữ nguyên.
3. Người dùng mở một đội → tên vị trí, vai trò và chỉ số hiện bằng thuật ngữ
   bóng đá của ngôn ngữ đang chọn; tên cầu thủ do họ gõ giữ nguyên.
4. Người dùng bắt đầu một trận → dòng tường thuật chạy bằng ngôn ngữ đang
   chọn, câu cú tự nhiên.
5. Giữa trận, người dùng đổi ngôn ngữ → trận chạy tiếp đúng phút đó, mọi dòng
   đã hiện được kể lại bằng ngôn ngữ mới.
6. Người dùng bật chế độ tối → toàn bộ màn hình đổi bảng màu, chữ vẫn đọc
   được rõ, bố cục không xê dịch.
7. Người dùng đóng ứng dụng rồi mở lại → vẫn đúng ngôn ngữ và đúng chế độ
   sáng/tối vừa chọn.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Chưa có đội nào, chưa có trận nào | Màn hình trống hiện lời hướng dẫn bằng đúng ngôn ngữ đang chọn, kèm nút đi tiếp |
| Tên đội/cầu thủ gõ bằng tiếng Việt, đang xem tiếng Anh | Giữ nguyên đúng như đã gõ; không dịch, không bỏ dấu |
| Một chữ hiển thị thiếu bản dịch | Báo rõ là thiếu bản dịch; không âm thầm rơi về ngôn ngữ kia |
| Chữ ở một ngôn ngữ dài hơn hẳn ngôn ngữ kia | Bố cục không vỡ, không tràn ra ngoài khung, không cắt cụt chữ giữa chừng |
| Tệp sao lưu tạo ở tiếng Việt, nhập vào lúc đang ở tiếng Anh | Nhập bình thường; tệp sao lưu không phụ thuộc ngôn ngữ |
| Trận lưu từ trước spec này | Xem lại được đầy đủ, tường thuật hiện bằng ngôn ngữ đang chọn |
| Trình duyệt không nhớ được lựa chọn ngôn ngữ | Rơi về ngôn ngữ mặc định, không báo lỗi chặn đường, không làm mất dữ liệu khác |
| Chạy hoàn toàn offline | Mọi phông chữ và biểu tượng hiện đủ; không ô trống, không hình vỡ |
| Màu áo người dùng chọn trùng màu nhấn của theme | Vẫn phân biệt được đội với nền; chữ vẫn đạt 4.5:1 |
| Chế độ tối bật, người dùng chọn màu áo rất tối | Vẫn phân biệt được đội với nền sân và nền trang; chữ trên áo vẫn đạt 4.5:1 |
| Trình duyệt không nhớ được lựa chọn chế độ sáng/tối | Rơi về chế độ sáng, không báo lỗi chặn đường, không làm mất dữ liệu khác |
| Một biểu tượng của bộ icon không có sẵn cho khái niệm cần dùng | Dùng chữ thay thế; KHÔNG trộn biểu tượng từ bộ khác làm lệch góc nhìn (AC-21.2) |

## 6. Yêu cầu phi chức năng

- **Hiệu năng:**
  - Đổi ngôn ngữ: màn hình hiện tại đổi xong trong **< 200ms**.
  - Đổi chế độ sáng/tối: màn hình hiện tại đổi xong trong **< 200ms**.
  - Các ngân sách của spec 001 **giữ nguyên, không được nới**: mở danh sách 25
    cầu thủ < 300ms; phản hồi kéo-thả < 100ms; giả lập trọn trận < 3 giây; mở
    ứng dụng với 20 đội và 20 trận < 2 giây. Theme và biểu tượng thêm vào
    KHÔNG được đẩy lần mở đầu vượt ngân sách 2 giây.
- **Bảo mật/quyền riêng tư:** không đổi. Không lời gọi mạng nào lúc chạy; phông
  chữ và biểu tượng đóng gói cùng ứng dụng.
- **Giấy phép:** bộ biểu tượng dùng lại PHẢI có giấy phép cho phép nhúng và
  phát hành kèm ứng dụng. Giấy phép và nguồn gốc PHẢI được ghi lại trong repo.
  Bộ nào không cho phép nhúng thì không dùng, dù đẹp tới đâu.
- **Accessibility:** tương phản tối thiểu 4.5:1 ở **cả hai ngôn ngữ và cả hai
  chế độ sáng/tối**; nút đổi ngôn ngữ và nút đổi chế độ đều dùng được bằng bàn
  phím; biểu tượng không bao giờ là cách duy nhất truyền đạt thông tin.
- **Dữ liệu:** không đổi định dạng lưu trữ, không đổi định dạng tệp sao lưu,
  không migration. Lựa chọn ngôn ngữ và lựa chọn chế độ sáng/tối là thiết lập
  của người dùng; mất chúng không làm mất dữ liệu nào khác.

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution **2.0.0**
- [ ] **Theme được duyệt trên một màn hình mẫu** trước khi áp ra toàn bộ ứng
      dụng — không áp 31 màn rồi mới hỏi
- [ ] **Tự tay đi hết mọi màn hình ở cả hai ngôn ngữ VÀ cả hai chế độ
      sáng/tối**, không chỉ kiểm bằng test — kể cả màn hình lỗi và màn hình
      trống
- [ ] Có phép kiểm tự động chứng minh **không sót chuỗi**: mỗi chữ hiển thị
      đều có bản ở cả hai ngôn ngữ
- [ ] Có phép kiểm tự động chứng minh **AC-18.2**: cùng một trận ở hai ngôn
      ngữ cho cùng số dòng, cùng thứ tự, cùng phút
- [ ] Tệp sao lưu xuất từ bản trước spec này nhập lại được, dữ liệu nguyên vẹn
- [ ] Đo lại bốn ngân sách hiệu năng của spec 001, không cái nào vượt
- [ ] Hai chỗ hiển thị sai của spec 002 (US-23) đã sửa và kiểm tay trên một
      trận sân nhỏ thật
- [ ] Giấy phép của bộ biểu tượng đã ghi lại trong repo

## 8. Câu hỏi mở

Không còn câu hỏi mở. Toàn bộ 6 điểm ban đầu cộng 1 điểm phát sinh trong lúc
làm rõ đã được chốt ngày **2026-11-16** — xem mục 10.

## 9. Giả định

- Mọi AC của spec 001 và spec 002 vẫn còn hiệu lực trừ chỗ spec này nói khác.
  Spec này **không đổi hành vi nào** của hai spec trước, chỉ đổi chữ và vẻ
  ngoài.
- Người dùng đọc được cả tiếng Việt lẫn tiếng Anh, nên không cần đối chiếu
  song song hai ngôn ngữ trên một màn hình.
- Dữ liệu người dùng tự nhập không cần hai bản. Một đội tên "Sao Vàng" vẫn là
  "Sao Vàng" khi xem bằng tiếng Anh.
- Thuật ngữ bóng đá tiếng Anh dùng cách gọi phổ thông của bóng đá Anh, không
  phải cách gọi của bóng đá Mỹ.
- Việc dời 99 nhãn hiển thị ra khỏi lớp dữ liệu bóng đá **không** đụng tới
  định dạng tệp sao lưu — đã kiểm: nơi kiểm tra tệp chỉ đọc mã định danh, và
  engine chỉ đọc trường cấu trúc, không nơi nào đọc phần chữ.
- Spec này **không chốt sẵn bảng màu**: theme được dựng trên một màn hình mẫu
  để người dùng duyệt, chốt xong mới áp ra phần còn lại.
- Bộ biểu tượng dùng lại phủ đủ 10 khái niệm ở AC-21.1. Giả định này **đã
  được kiểm** ngày 2026-11-16 chứ không còn là phỏng đoán: giả định isometric
  ban đầu hoá ra sai và đã bị thay — xem mục 10, điểm 8.

## 10. Nhật ký làm rõ

Toàn bộ quyết định dưới đây được chốt ngày **2026-11-16** qua phiên `/clarify`.

| # | Câu hỏi | Quyết định | Ghi vào |
|---|---|---|---|
| 1 | Theme đổi tới đâu? | **Chỉ màu, phông chữ và chi tiết trang trí.** Bố cục giữ nguyên — rủi ro thấp nhất, và gộp được vào cùng một lượt quét với phần song ngữ | AC-20.6, Non-goals |
| 2 | Chế độ tối có trong phạm vi? | **Có, người dùng tự chọn.** Ngược khuyến nghị: nó nhân đôi phần chứng minh tương phản và nhân đôi số màn hình phải đi tay. Đã ghi cái giá đó vào Definition of Done thay vì để nó lộ ra lúc đang làm | AC-20.2, AC-20.5, AC-20.7 → AC-20.10, mục 5, mục 6, mục 7 |
| 3 | Bộ biểu tượng lấy từ đâu? | **Bộ có sẵn giấy phép mở**, nhúng thẳng vào repo cho đúng P4. Icon isometric có chiều sâu và đổ bóng nên vẽ tay khó ra được chất lượng dùng được | mục 6 (Giấy phép), mục 9 |
| 4 | Duyệt theme lúc nào? *(phát sinh lúc làm rõ)* | **Một màn hình mẫu trước**, chốt xong mới áp ra 31 màn còn lại. AC-20.1 là AC mơ hồ nhất spec, và đây là cơ chế biến nó thành thứ có cổng chặn | mục 7, mục 9 |
| 5 | Ngôn ngữ mặc định lần đầu? | **Luôn tiếng Việt**, không đọc thiết lập trình duyệt. Đoán được, và nút đổi chỉ cách một cú bấm nên đoán sai gần như không mất gì | AC-17.7 |
| 6 | Hai lỗi treo từ spec 002? | **Gộp cả hai.** Cả hai đều là chuỗi hiển thị nên dù sao cũng phải đụng tới khi đưa qua lớp ngôn ngữ; sửa lúc đang mở file rẻ hơn mở lại lần nữa | US-23 |
| 7 | "Báo rõ là thiếu bản dịch"? | **Cả hai lớp lưới**: phép kiểm chặn trước khi phát hành, cộng dấu hiệu thấy được lúc chạy nếu vẫn lọt. Tấm lưới thứ hai đáng lẽ không bao giờ kích hoạt | AC-22.2 |
| 8 | Bộ icon isometric lấy ở đâu? *(kiểm lại lúc `/plan`)* | **Bỏ isometric, dùng bộ phẳng giấy phép MIT.** Ba lượt tìm cho thấy không có bộ isometric nào giấy phép mở phủ đủ 10 khái niệm bóng đá: thứ có giấy phép mở thì sai chủ đề (bộ isometric CC0 duy nhất tìm được là icon kiến trúc đám mây), thứ đúng chủ đề thì giấy phép thương mại hoặc đòi ghi công. Giả định ở điểm 3 đã bị chính phép kiểm mà spec yêu cầu bác bỏ | Tiêu đề spec, mục 1, Non-goals, US-21, AC-21.1, AC-21.2, mục 9 |
