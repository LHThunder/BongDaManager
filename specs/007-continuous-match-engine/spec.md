# Spec: Engine mô phỏng liên tục — toạ độ mét, thời gian giây, luật IFAB đầy đủ

| | |
|---|---|
| **ID** | `007-continuous-match-engine` |
| **Status** | Draft |
| **Created** | 2026-11-19 |
| **Branch** | `007-continuous-match-engine` — **chưa cắt**, xem mục 9 |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> ⚠️ **Spec này KHÔNG phải mở rộng engine hiện tại.** Nó là một engine khác hẳn.
> Xem mục 1 để biết vì sao, và mục 8 câu 1 cho câu hỏi chưa ai trả lời: engine mới
> **thay thế** engine hiện tại hay **sống song song** với nó.

---

## 1. Vấn đề & mục tiêu

### Vấn đề

Engine hiện tại phát **đúng một sự kiện mỗi phút trận**. Mỗi sự kiện nói: phút thứ
mấy, loại gì, đội nào, những ai liên quan, và bóng đi qua những **ô nào của một lưới
vùng** — không phải toạ độ mét. Giữa hai phút ấy, trận đấu **không tồn tại**: không có
giây, không có vị trí, không có tốc độ, không có độ cao của bóng, không có hướng người,
không có thể lực theo giây.

Hệ quả đã **đo được** qua hai spec liên tiếp cố chữa nó ở tầng giao diện:

| Đã đo | Con số | Ở đâu |
|---|---|---|
| Bóng thật sự di chuyển | **35,5%** số khung vẽ | spec 005 |
| Quãng một người đi trong một nhịp | trung vị **2,3** đơn vị, lớn nhất **47,4** | spec 005 |
| Quãng bóng đứng yên lâu nhất | **3144 ms** | spec 005 |
| Dải tốc độ trong cùng một nhịp | chênh hơn **20 lần** trước khi siết | spec 005 (T525) |

Người dùng xem bản chạy và nói ba lần, bằng lời của họ:

> *"tôi vẫn thấy đôi khi quá nhanh đôi khi quá chậm và các cầu thủ đang di chuyển
> không tự nhiên, như kiểu teleport"*
> *"tôi muốn cầu thủ có bóng có thể chạy hoặc qua người với bóng trong chân hoặc
> chuyền và sút. Thấy được đường bóng liên tục và tự nhiên"*
> *"di chuyển đôi khi hơi nhanh… giật cục và không liền mạch"*

Spec 005 và spec 006 đã **chữa triệu chứng** ở tầng giao diện: nội suy có đường cong,
lớp dao động, mốc trung gian dựng từ `duongBong`, người giữ bóng suy ra từ danh sách
người tham gia. Cả hai đi được một đoạn — nhưng không xoá được cái gốc, vì **giao diện
không thể bịa ra dữ liệu mà engine chưa từng tính**. Giao diện không biết ai đang giữ
bóng (nó phải *suy ra*), không biết bóng cao bao nhiêu, không biết cầu thủ đang nhìn đâu,
không biết vì sao một người chạy chỗ đó.

Ngoài chuyện chuyển động, engine hiện tại **chưa có phần lớn luật bóng đá**. Nó có thẻ
vàng, thẻ đỏ, thay người, kiệt sức, huỷ trận khi một bên dưới 7 người. Nó **không có**:
việt vị, phạt góc, ném biên, phát bóng lên, đá phạt, phạt đền, phép lợi thế, DOGSO, VAR,
hiệp phụ, luân lưu. Bảng thống kê vì thế cũng thiếu: không có số phạm lỗi, số phạt góc,
số việt vị, không có xG.

### Mục tiêu

Một engine mô phỏng **liên tục**: trận đấu tồn tại ở **mọi thời điểm**, không chỉ ở mốc
mỗi phút. Vị trí bằng **mét** trên sân 105×68. Bóng có **độ cao**. Mỗi cầu thủ có **tốc
độ, hướng người, thể lực và một mục đích**. Luật IFAB được áp dụng **đủ**, kể cả việt vị
xét tại thời điểm chạm bóng. Thống kê cả trận bám mức của bóng đá thật.

Khi làm xong, ba câu người dùng nói ở trên không còn chỗ để đúng nữa — không phải vì
giao diện vẽ khéo hơn, mà vì **dữ liệu bên dưới đã liên tục ngay từ đầu**.

### Non-goals

Những thứ lần này **KHÔNG** làm:

- **Vòng lặp sự nghiệp nhiều mùa** — lịch đấu, bảng xếp hạng, huấn luyện viên chọn người,
  phát triển theo tuổi. Hiến pháp 3.0.1 xếp nó **sau** khi vòng lặp huấn luyện viên xong.
- **Giải đấu và vòng loại trực tiếp** như một chức năng. Spec này mô tả *luật* của hiệp phụ
  và luân lưu, nhưng **không** dựng màn hình giải đấu để dùng chúng — xem mục 8 câu 12.
- **Đồ hoạ 3D, mô hình thân người, hoạt ảnh chân tay.** Hiển thị vẫn là sân 2D dạng điểm
  (hiến pháp mục 1). Spec này làm cho **dữ liệu** thật hơn, không làm cho **hình** đẹp hơn.
- **Điều khiển cầu thủ bằng tay trong lúc trận chạy.** Đây không phải game thể thao; người
  dùng vẫn can thiệp bằng chiến thuật, chỉ thị và thay người.
- **Bình luận bằng giọng nói, âm thanh, hoạt ảnh ăn mừng.**
- **Đổi luật bóng đá.** Luật là của IFAB; engine tuân theo, không phát minh.
- **Dữ liệu cầu thủ hay câu lạc bộ có thật đóng gói trong repo** (ràng buộc bản quyền,
  hiến pháp mục 3).
- **Backend, đồng bộ, chơi nhiều người** (hiến pháp mục 1).

---

## 2. Người dùng & bối cảnh

- **Ai dùng:** một người dùng duy nhất, trên máy cá nhân. Họ tự nhập đội và chỉ số, dựng
  chiến thuật, rồi **xem** trận đấu diễn ra. Họ đã chứng minh mình bắt lỗi bằng mắt rất
  tốt: ở spec 005 và 006 họ phát hiện **bảy** lỗi mà bộ 1299 phép kiểm tự động không thấy.
- **Khi nào dùng:** mỗi lần đấu một trận — vừa để biết tỉ số, vừa để **xem** và phán xem
  chiến thuật của mình có hoạt động không.
- **Thiết bị/môi trường:** trình duyệt Chromium đời mới trên máy để bàn, chạy offline.
  Không điện thoại, không máy tính bảng.

---

## 3. User stories

> Đánh số tiếp spec 006 (US-33 → US-36), nên spec này bắt đầu từ **US-37**.

### US-37: Trận đấu tồn tại ở mọi thời điểm, trên sân có kích thước thật

Là một **người xem trận đấu**, tôi muốn **vị trí của mọi người và của bóng được tính bằng
mét ở từng khoảnh khắc**, để **chuyển động tôi thấy là chuyển động thật, không phải giao
diện đoán giữa hai mốc cách nhau một phút**.

**Acceptance criteria**
- [ ] AC-37.1 — KHI engine mô phỏng một trận THÌ mọi vị trí của cầu thủ và của bóng PHẢI
      được cho bằng **mét** trong khung **105 × 68**, gốc `(0,0)` ở góc dưới trái.
- [ ] AC-37.2 — KHI đọc hình học sân THÌ các mốc PHẢI đúng: chấm phạt đền cách vạch vôi
      **11 m**; vòng cấm sâu **16,5 m**, rộng **40,3 m**; khung thành rộng **7,32 m**,
      tức `y` từ **30,34** tới **37,66**.
- [ ] AC-37.3 — KHI hiệp 2 bắt đầu THÌ hai đội PHẢI đổi phần sân: hướng tấn công của mỗi
      đội ở hiệp 2 PHẢI ngược với hiệp 1.
- [ ] AC-37.4 — KHI một tình huống quan trọng (bàn thắng, phạt đền, thẻ đỏ, hoặc cơ hội có
      xG > 0,3) được xuất ra THÌ hệ thống PHẢI cho trạng thái đầy đủ ở **từng mốc 0,5 giây**,
      liên tục từ **6–10 giây trước** tình huống tới **khi bóng chết**, không khuyết mốc nào.
- [ ] AC-37.5 — KHI chạy lại cùng một mã trận với cùng hai đội, cùng chiến thuật xuất phát
      và cùng chuỗi can thiệp THÌ **từng khung hình PHẢI giống hệt tới từng chữ số** (P1).
- [ ] AC-37.6 — KHI trận đang mô phỏng THÌ hệ thống PHẢI biết **ai đang giữ bóng** ở mỗi
      khoảnh khắc, hoặc nói rõ **không ai** (bóng đang bay, bóng chết) — PHẢI không bắt giao
      diện suy ra điều đó từ danh sách người tham gia.

### US-38: Chuyển động tuân theo cơ học của một cơ thể người

Là một **người xem trận đấu**, tôi muốn **không ai tăng tốc, phanh hay quay người nhanh
hơn mức một cầu thủ thật làm được**, để **không còn cảm giác "teleport"**.

**Acceptance criteria**
- [ ] AC-38.1 — KHI đo tốc độ mọi cầu thủ ở mọi khung THÌ không ai PHẢI vượt **9 m/s**, và
      một pha trên **7 m/s** PHẢI không kéo dài quá **4 giây liên tục**.
- [ ] AC-38.2 — KHI đo hiệu tốc độ giữa hai khung liền nhau THÌ gia tốc PHẢI không vượt
      **6 m/s²** và giảm tốc PHẢI không vượt **8 m/s²**.
- [ ] AC-38.3 — KHI một cầu thủ đổi hướng trên **90°** THÌ tốc độ ở khung ngay trước đó
      PHẢI dưới **3 m/s**; KHI đổi hướng **45–90°** THÌ tốc độ sau PHẢI không quá **60%**
      tốc độ trước.
- [ ] AC-38.4 — KHI một cầu thủ chạy lùi THÌ tốc độ PHẢI không vượt **4 m/s**; chạy ngang
      PHẢI không vượt **5 m/s**.
- [ ] AC-38.5 — KHI bóng ở trên không THÌ nó PHẢI có độ cao `z` theo mét; cầu thủ PHẢI chỉ
      đánh đầu được khi `z` trong **1,5–2,8 m**, và PHẢI chỉ khống chế bằng chân, đùi hoặc
      ngực khi `z` dưới **1,5 m**.
- [ ] AC-38.6 — KHI bóng được chuyền hoặc sút THÌ tốc độ PHẢI trong **12–20 m/s** (chuyền
      ngắn) hoặc **20–30 m/s** (chuyền dài và sút), và **thời gian bay PHẢI khớp** khoảng
      cách chia tốc độ.
- [ ] AC-38.7 — KHI bóng lăn sệt THÌ nó PHẢI chậm dần **1–2 m/s²** trên sân khô, và nhanh
      hơn mức đó trên sân ướt.
- [ ] AC-38.8 — KHI vẽ một pha chạy trên **6 m/s** THÌ đường chạy PHẢI là **đường cong**:
      góc đổi hướng giữa hai khung liền nhau PHẢI không vượt một ngưỡng nêu được bằng số.

### US-39: Trọng tài áp dụng luật IFAB, không phải một bảng xác suất

Là một **người xem trận đấu**, tôi muốn **mọi quyết định của trọng tài đến từ luật thật
áp lên vị trí thật**, để **một quả việt vị là việt vị vì cầu thủ đứng sai chỗ, không phải
vì engine tung đồng xu**.

**Acceptance criteria**
- [ ] AC-39.1 — KHI một cầu thủ chạm bóng cho đồng đội THÌ việt vị PHẢI được xét **tại đúng
      khoảnh khắc chạm bóng ấy**: người nhận ở việt vị khi anh ta ở phần sân đối phương và
      gần đường biên ngang hơn **cả bóng lẫn cầu thủ đối phương thứ hai từ cuối lên**.
- [ ] AC-39.2 — KHI người nhận **ngang hàng** với bóng hoặc với cầu thủ thứ hai từ cuối THÌ
      hệ thống PHẢI không coi là việt vị. Vị trí tay và cánh tay PHẢI không được tính.
- [ ] AC-39.3 — KHI một cầu thủ ở vị trí việt vị nhưng **không tham gia tình huống** (không
      chơi bóng, không cản trở đối phương, không hưởng lợi từ vị trí) THÌ hệ thống PHẢI không
      thổi phạt.
- [ ] AC-39.4 — KHI bóng đến trực tiếp từ **phát bóng lên, ném biên hoặc phạt góc** THÌ hệ
      thống PHẢI không thổi việt vị.
- [ ] AC-39.5 — KHI việt vị được thổi THÌ đối phương PHẢI được hưởng **đá phạt gián tiếp
      tại đúng vị trí phạm lỗi**.
- [ ] AC-39.6 — KHI một lỗi đá, ngáng, xô đẩy, chèn, giữ người hoặc cố ý chơi bóng bằng tay
      xảy ra THÌ đối phương PHẢI được **đá phạt trực tiếp**; KHI lỗi ấy xảy ra **trong vòng
      cấm của đội phạm lỗi** THÌ PHẢI là **phạt đền**.
- [ ] AC-39.7 — KHI lối chơi nguy hiểm, cản trở không tiếp xúc, hoặc thủ môn bắt bóng bằng
      tay từ đường chuyền về **chủ ý bằng chân** của đồng đội xảy ra THÌ PHẢI là **đá phạt
      gián tiếp**.
- [ ] AC-39.8 — KHI thủ môn giữ bóng trong tay quá **8 giây** THÌ đối phương PHẢI được hưởng
      **phạt góc**.
- [ ] AC-39.9 — KHI đội bị phạm lỗi đang có cơ hội tốt THÌ trọng tài PHẢI cho **chơi tiếp**
      (phép lợi thế) và PHẢI rút thẻ **sau khi bóng chết**, không phải ngay lúc đó.
- [ ] AC-39.10 — KHI một cầu thủ ngăn cản cơ hội ghi bàn rõ ràng (DOGSO) bằng lỗi **không
      tranh bóng** hoặc bằng tay THÌ PHẢI là **thẻ đỏ**; KHI DOGSO xảy ra **trong vòng cấm**
      mà cầu thủ **có ý định tranh bóng** THÌ PHẢI là **phạt đền + thẻ vàng**, không phải đỏ.
- [ ] AC-39.11 — KHI một cầu thủ nhận **thẻ vàng thứ hai** THÌ PHẢI bị đuổi; đội ấy PHẢI
      chơi với 10 người tới hết trận và PHẢI **điều chỉnh sơ đồ**, kèm lý do xuất ra được.
- [ ] AC-39.12 — KHI một bên còn **dưới 7 người** trên sân THÌ trận PHẢI bị huỷ (giữ AC-14.6).
- [ ] AC-39.13 — KHI có tình huống cố định THÌ khoảng cách PHẢI đúng luật: đối phương cách
      bóng **9,15 m** ở giao bóng và đá phạt; KHI hàng rào có **từ 3 người** THÌ cầu thủ đội
      tấn công PHẢI đứng cách hàng rào **ít nhất 1 m**.
- [ ] AC-39.14 — KHI một quả phạt đền được sút THÌ thủ môn PHẢI có **ít nhất một chân chạm
      hoặc ngang vạch vôi**, và mọi cầu thủ khác PHẢI ở **ngoài vòng cấm** và cách chấm phạt
      đền **ít nhất 9,15 m**.
- [ ] AC-39.15 — KHI đội ném biên THÌ người ném PHẢI dùng **hai tay, từ sau đầu**, với **hai
      chân chạm đất** ở trên hoặc ngoài đường biên; KHI phát bóng lên THÌ bóng vào cuộc ngay
      khi được đá và di chuyển rõ ràng, và **đồng đội được nhận bóng ngay trong vòng cấm**.
- [ ] AC-39.16 — KHI trọng tài dừng trận mà **không có lỗi** THÌ trận PHẢI tiếp tục bằng
      **thả bóng**.
- [ ] AC-39.17 — KHI người dùng thay người THÌ hệ thống PHẢI cho tối đa **5 người** trong
      tối đa **3 lần dừng trận** (không tính giờ nghỉ giữa hiệp), cộng **1 người** nếu có
      hiệp phụ; cầu thủ **đã ra sân PHẢI không vào lại**.
- [ ] AC-39.18 — KHI VAR can thiệp THÌ PHẢI chỉ ở **bốn loại tình huống** — bàn thắng, phạt
      đền, thẻ đỏ trực tiếp, nhầm người — và **chỉ khi có sai sót rõ ràng**; mỗi lần kiểm tra
      PHẢI mất **1–3 phút** và PHẢI được **cộng vào bù giờ**.
- [ ] AC-39.19 — KHI tính bù giờ THÌ số phút PHẢI dẫn xuất từ **số lần dừng trận thực tế**
      (bàn thắng, thay người, chấn thương, VAR), và PHẢI nằm trong **1–4 phút** ở hiệp 1,
      **3–8 phút** ở hiệp 2.
- [ ] AC-39.20 — KHI một trận **loại trực tiếp** hoà sau 90 phút THÌ PHẢI đá **2 hiệp phụ
      × 15 phút**, rồi nếu còn hoà PHẢI **sút luân lưu**.
- [ ] AC-39.21 — KHI sút luân lưu THÌ mỗi đội PHẢI có **5 lượt luân phiên**, PHẢI **dừng sớm**
      khi một đội không thể đuổi kịp, và nếu còn hoà PHẢI đá **từng cặp**; PHẢI chỉ những cầu
      thủ **còn trên sân khi hết giờ** được sút; tỉ lệ thành công PHẢI trong **70–80%**.

### US-40: Chiến thuật và thể lực là nguyên nhân, không phải nhãn dán

Là một **người dùng dựng chiến thuật**, tôi muốn **sơ đồ, phong cách và chiều cao hàng thủ
của tôi hiện ra thành vị trí thật của cả khối trên sân**, để **đổi một chỉ thị rồi đấu lại
thì tôi thấy được cái gì đã khác**.

**Acceptance criteria**
- [ ] AC-40.1 — KHI một đội phòng ngự THÌ khối đội hình PHẢI rộng **30–40 m theo chiều dọc**
      và **35–45 m theo chiều ngang**, với khoảng cách giữa các tuyến **10–15 m**, và PHẢI
      **dịch theo phía có bóng**.
- [ ] AC-40.2 — KHI một đội tấn công THÌ đội hình PHẢI kéo rộng hết chiều ngang sân, và
      người cầm bóng PHẢI có **2–3 phương án chuyền** khả thi ở mỗi khoảnh khắc.
- [ ] AC-40.3 — KHI pressing được kích hoạt THÌ PHẢI có một **tín hiệu nêu được**: đối
      phương chuyền về, khống chế hỏng, hoặc bóng ở gần đường biên. Pressing PHẢI không bật
      liên tục không lý do.
- [ ] AC-40.4 — KHI một đội mất bóng THÌ trong **3–5 giây** tiếp theo đội ấy PHẢI **phản
      pressing hoặc lùi về**, theo phong cách đã chọn, và lựa chọn ấy PHẢI xuất ra được.
- [ ] AC-40.5 — KHI còn **15 phút cuối** THÌ đội **đang dẫn** PHẢI có chiều cao hàng thủ
      thấp hơn trung bình của chính nó trong trận, và đội **bị dẫn** PHẢI dâng cao hơn và
      có tỉ lệ chuyền dài cao hơn — cả ba con số PHẢI đo được.
- [ ] AC-40.6 — KHI huấn luyện viên đổi sơ đồ THÌ mỗi lần đổi PHẢI kèm **lý do** (tỉ số đổi,
      quân số đổi, hoặc chỉ thị người dùng), và lý do ấy PHẢI hiện ra cho người dùng.
- [ ] AC-40.7 — KHI trận bắt đầu THÌ mọi cầu thủ PHẢI có thể lực **100** và giảm dần; KHI
      từ phút **60** trở đi một cầu thủ xuống **dưới 60** THÌ tốc độ tối đa của anh ta PHẢI
      giảm **10%** và tỉ lệ chuyền hỏng PHẢI tăng.
- [ ] AC-40.8 — KHI trận kết thúc THÌ quãng đường cả trận của mỗi cầu thủ sân PHẢI trong
      **9–12 km**, và của thủ môn trong **5–6 km**.
- [ ] AC-40.9 — KHI mô phỏng nhiều trận THÌ số chấn thương PHẢI là **0 hoặc 1 mỗi trận**;
      mỗi chấn thương PHẢI có **thời gian dừng trận** và PHẢI có thể buộc thay người.

### US-41: Mọi cầu thủ đều đang làm một việc có tên

Là một **người xem trận đấu**, tôi muốn **mỗi người trên sân, cầm bóng hay không, đều đang
theo một mục đích tôi gọi tên được**, để **sân không còn là 22 điểm đang chờ tới phút sau**.

**Acceptance criteria**
- [ ] AC-41.1 — KHI xuất một khung hình THÌ **mỗi cầu thủ không cầm bóng** PHẢI có một mục
      đích lấy từ danh mục di chuyển không bóng (chạy chơi sau lưng, lùi về nhận bóng, chồng
      biên, chồng trong, người thứ ba, chạy nghi binh, giữ chiều rộng, bọc lót, che đường
      chuyền, kèm người, giữ khu vực, chạy cắt mặt cột gần, chạy vào cột xa), và mục đích ấy
      PHẢI **khớp với vị trí anh ta đang di chuyển tới**.
- [ ] AC-41.2 — KHI một cầu thủ chạm bóng THÌ hành động PHẢI lấy từ danh mục hành động có
      bóng (khống chế, chuyền, dẫn bóng và qua người, dứt điểm, phòng ngự, hoặc hành động
      thủ môn), và hành động ấy PHẢI **ghi được thành tên** trong nhật ký.
- [ ] AC-41.3 — KHI một cầu thủ cầm bóng ra quyết định THÌ hệ thống PHẢI xét theo **đúng thứ
      tự**: (1) có cơ hội dứt điểm tốt không, (2) có đồng đội ở vị trí tốt hơn mà đường chuyền
      an toàn không, (3) có khoảng trống để dẫn bóng lên không, (4) nếu không có gì thì giữ
      bóng, chuyền về hoặc chuyền ngang.
- [ ] AC-41.4 — KHI có đối phương trong bán kính **2 m** THÌ tỉ lệ thành công của hành động
      PHẢI giảm **15–30%**, và lựa chọn PHẢI dịch về phía **an toàn hơn** trong cây quyết định.
- [ ] AC-41.5 — KHI đo trên nhiều trận THÌ tỉ lệ thành công PHẢI bám mức thật: chuyền ngắn
      không áp lực **90–95%**, chuyền dài **50–65%**, qua người một-đối-một **45–55%**, tắc
      bóng **60–70%**, tạt bóng **20–30%**.
- [ ] AC-41.6 — KHI xuất một khung hình THÌ mỗi cầu thủ PHẢI có **hướng người** (0–360°), và
      PHẢI chỉ phản ứng ngay với những gì trong **khoảng 180° phía trước**; thời gian phản
      ứng sau khi bóng được chuyền hoặc đối phương đổi hướng PHẢI là **0,2–0,3 giây**.
- [ ] AC-41.7 — KHI một cầu thủ **quét** (ngoái nhìn) trước khi nhận bóng THÌ anh ta PHẢI
      nhận bóng **mở người**; KHI không quét THÌ PHẢI nhận bóng **quay lưng** về phía khung
      thành đối phương.
- [ ] AC-41.8 — KHI một hành động được giải quyết THÌ kết quả PHẢI phụ thuộc vào **chỉ số
      liên quan của người thực hiện so với người đối đầu**, **áp lực**, **độ khó** (khoảng
      cách, chân thuận, bóng bổng so với bóng sệt) và **thể lực hiện tại** — cả bốn PHẢI
      nêu được thành con số trong nhật ký.

### US-42: Nhịp trận và sai sót của trận đấu thật

Là một **người xem trận đấu**, tôi muốn **trận có lúc nghỉ, có lúc ép sân, và có lỗi**, để
**nó không trông như một mô hình hoàn hảo đang chạy**.

**Acceptance criteria**
- [ ] AC-42.1 — KHI trận kết thúc THÌ thời gian bóng **thực sự lăn** PHẢI trong **55–60 phút**
      trên tổng 90 phút.
- [ ] AC-42.2 — KHI có tình huống cố định THÌ thời gian thực hiện PHẢI trong khoảng: ném biên
      **8–15 giây**, phát bóng lên **10–20 giây**, phạt góc **20–40 giây**, đá phạt gần vòng
      cấm **40–90 giây**, ăn mừng bàn thắng **40–70 giây**.
- [ ] AC-42.3 — KHI một đội **đang dẫn** ở cuối trận THÌ thời gian các tình huống cố định của
      đội ấy PHẢI dài hơn mức trên **30–50%**.
- [ ] AC-42.4 — KHI đo cả trận THÌ mỗi cầu thủ PHẢI phân bổ thời gian: đứng yên và đi bộ
      **35–45%**, chạy chậm **35–45%**, chạy nhanh **10–15%**, nước rút **2–5%** với **20–40
      pha nước rút**, phần lớn **dưới 20 m**.
- [ ] AC-42.5 — KHI bóng cách một cầu thủ **trên 40 m** THÌ anh ta PHẢI đi bộ hoặc chạy chậm;
      **20–40 m** THÌ chạy chậm; **dưới 20 m** hoặc đang chuyển trạng thái THÌ được chạy nhanh
      hoặc nước rút.
- [ ] AC-42.6 — KHI một cầu thủ vừa nước rút xong THÌ anh ta PHẢI có **10–30 giây** cường độ
      thấp trước pha nước rút tiếp theo.
- [ ] AC-42.7 — KHI một pha tấn công thất bại THÌ cầu thủ PHẢI **chạy chậm** về vị trí, PHẢI
      NOT nước rút về; tiền đạo PHẢI không lùi hết về phần sân nhà.
- [ ] AC-42.8 — KHI đo hàng thủ ở bất kỳ khung nào THÌ bốn hậu vệ PHẢI **lệch nhau 1–3 m**,
      PHẢI không thẳng tuyệt đối trên một đường.
- [ ] AC-42.9 — KHI một đường chuyền tới THÌ người nhận PHẢI phải **điều chỉnh 0,5–2 m**;
      và **5–10%** số lần nhận bóng PHẢI là **khống chế hỏng**, bóng bật ra **1–3 m**.
- [ ] AC-42.10 — KHI đo các cú sút trúng đích THÌ **phần lớn** PHẢI đi về giữa khung thành
      hoặc sát thủ môn, PHẢI không luôn vào góc.
- [ ] AC-42.11 — KHI đo nhiều trận THÌ trọng tài PHẢI **bỏ qua một tỉ lệ nêu được** các lỗi
      nhỏ và **thổi phạt một tỉ lệ nêu được** các pha tiếp xúc nhẹ.
- [ ] AC-42.12 — KHI một đội vừa thủng lưới THÌ trong **5–10 phút** tiếp theo đội ấy PHẢI
      dâng cao hơn mức trung bình của chính nó.
- [ ] AC-42.13 — KHI mô phỏng nhiều trận THÌ PHẢI có những giai đoạn một đội **ép sân liên
      tục 5–10 phút** xen kẽ những giai đoạn hai đội chuyền bóng chậm ở giữa sân; cường độ
      PHẢI không đều nhau suốt 90 phút.

### US-43: Thống kê một trận trông như thống kê một trận thật

Là một **người dùng đọc bảng thống kê**, tôi muốn **các con số nằm trong khoảng của bóng đá
thật**, để **tôi tin được phần còn lại của mô phỏng**.

**Acceptance criteria**
- [ ] AC-43.1 — KHI mô phỏng một lượng trận đủ lớn THÌ trung bình hai đội cộng lại PHẢI có:
      bàn thắng **2–3**, cú sút **20–30** với khoảng **một phần ba trúng đích**, phạm lỗi
      **20–28**, thẻ vàng **3–5**, thẻ đỏ **0–1**, phạt góc **8–12**, việt vị **2–6**, ném
      biên **40–50**.
- [ ] AC-43.2 — KHI mô phỏng một trận THÌ mỗi đội PHẢI có **350–650** đường chuyền với tỉ lệ
      chính xác **75–90%**, và tỉ lệ ấy PHẢI khác nhau theo **phong cách** đã chọn.
- [ ] AC-43.3 — KHI một bàn thắng được ghi THÌ nó PHẢI đến từ một tình huống có **xG tương
      xứng**, và xG của mọi cú sút PHẢI ghi vào nhật ký.
- [ ] AC-43.4 — KHI cho một đội mạnh hơn rõ rệt đấu một đội yếu hơn qua nhiều trận THÌ đội
      mạnh PHẢI thắng nhiều hơn, nhưng PHẢI không thắng tất cả — kết quả PHẢI không đoán trước
      được từ chỉ số.
- [ ] AC-43.5 — KHI xem bảng thống kê THÌ nó PHẢI có **phạm lỗi, phạt góc, việt vị và xG** —
      bốn con số engine hiện tại không có.

### US-44: Xem theo từng đoạn, và dừng lại được đúng chỗ

Là một **người xem trận đấu**, tôi muốn **trận được kể theo từng đoạn 15 phút với một bản
tóm tắt, một nhật ký và đủ trạng thái để tiếp tục**, để **tôi theo được diễn biến mà không
phải đọc 10.800 khung hình**.

**Acceptance criteria**
- [ ] AC-44.1 — KHI một đoạn 15 phút kết thúc THÌ hệ thống PHẢI xuất: một **tóm tắt 3–5 câu**
      (diễn biến, đội nào làm chủ, thay đổi chiến thuật), một **nhật ký sự kiện** với mỗi sự
      kiện đáng kể một dòng, và **khung hình chi tiết 0,5 giây** cho các tình huống của AC-37.4.
- [ ] AC-44.2 — KHI một đoạn kết thúc THÌ hệ thống PHẢI xuất một **khối trạng thái** đủ để
      tiếp tục: phút, tỉ số, sơ đồ hai đội, ai đang trên sân, thể lực từng người, thẻ từng
      người, số thay người còn lại theo cả **người** và **lần dừng**, thống kê tích luỹ, và
      bù giờ tích luỹ.
- [ ] AC-44.3 — KHI một đoạn mới bắt đầu từ một khối trạng thái THÌ kết quả PHẢI **giống hệt**
      kết quả của việc chạy liền cả trận tới cùng thời điểm ấy — khối trạng thái PHẢI đủ,
      không thiếu trường nào.
- [ ] AC-44.4 — KHI hệ thống chuẩn bị xuất một đoạn THÌ nó PHẢI tự kiểm và **tự sửa trước khi
      xuất**: có ai vượt tốc độ hay gia tốc tối đa không; mọi tình huống việt vị đã xét tại
      thời điểm chạm bóng chưa; số người trên sân, số lần thay người và số thẻ có khớp luật
      không; cầu thủ đã ra sân có xuất hiện lại không; thống kê tích luỹ có lệch khỏi mục
      AC-43.1 không; đánh đầu có đúng độ cao `z` không; mọi cầu thủ không cầm bóng có mục
      đích chưa; phân bổ cường độ chạy có khớp AC-42.4 không.
- [ ] AC-44.5 — KHI một phép tự kiểm ở AC-44.4 phát hiện lỗi THÌ hệ thống PHẢI không xuất đoạn
      ấy ra như thể nó đúng.

---

## 4. Luồng chính (happy path)

1. Người dùng chọn hai đội của mình, sơ đồ và phong cách mỗi bên, đội chủ nhà, loại trận
   (vòng bảng hay loại trực tiếp) và điều kiện (thời tiết) → hệ thống nhận một mã trận.
2. Người dùng bấm bắt đầu → hệ thống mô phỏng **đoạn 15 phút đầu**, tự kiểm theo AC-44.4,
   rồi hiện tóm tắt, nhật ký và khối trạng thái.
3. Người dùng xem sân 2D chạy lại đoạn ấy, dừng và tua được; ở các tình huống quan trọng
   họ xem được chuyển động ở mức **0,5 giây một khung**.
4. Người dùng bấm tiếp → đoạn sau bắt đầu **đúng từ khối trạng thái** của đoạn trước.
5. Giữa các đoạn, người dùng thay người hoặc đổi chỉ thị; mọi can thiệp được ghi lại để
   phát lại (P1).
6. Hết 90 phút cộng bù giờ → nếu là trận loại trực tiếp và hoà thì hiệp phụ, rồi luân lưu.
7. Hết trận → bảng thống kê cả trận, điểm từng cầu thủ, và trận được lưu lại để xem lại.

---

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Một đội chưa đủ người để ra sân | Từ chối bắt đầu trận, nói rõ còn thiếu bao nhiêu người và ở vị trí nào — không bắt đầu rồi mới hỏng |
| Cầu thủ thiếu chỉ số | Nói rõ chỉ số nào thiếu của ai trước khi bắt đầu; engine PHẢI không lặng lẽ coi chỉ số trống là 0 |
| Trận đã lưu bằng engine cũ (một sự kiện mỗi phút) | Mở lại được, xem lại được bằng cách vẽ cũ; PHẢI không mất và PHẢI không hiện ra như một trận hỏng — xem mục 8 câu 1 |
| Tệp sao lưu từ phiên bản dữ liệu cũ | Nhập lại được trọn vẹn, điền mặc định hợp lý cho trường mới (P7) |
| Hết dung lượng lưu trữ giữa lúc đang lưu trận | Thông báo bằng ngôn ngữ đang chọn, nói rõ cái gì chưa lưu được và phải làm gì; PHẢI không để lại một trận hỏng một nửa (P3) |
| Một bên bị đuổi tới dưới 7 người | Huỷ trận theo AC-39.12, lưu lại tới thời điểm huỷ |
| Cả hai bên hết người thay mà còn chấn thương | Chơi thiếu người, không được phá luật 5-người-3-lần |
| Luân lưu mà một đội còn dưới 5 người trên sân | Mỗi đội sút đúng số lượt luân phiên, chỉ người còn trên sân được sút (AC-39.21); số người ít hơn PHẢI không làm hỏng vòng luân lưu |
| Mô phỏng chạy quá ngân sách thời gian | Nói rõ cho người dùng là đang chạy, có đường dừng; PHẢI không treo giao diện không dấu hiệu — xem mục 8 câu 11 |
| Phép tự kiểm AC-44.4 phát hiện lỗi mà không tự sửa được | Dừng, nói rõ phép kiểm nào thất bại và ở khung nào (AC-44.5) |
| Người dùng tạm dừng giữa một tình huống đang chạy | Đóng băng hoàn toàn: bóng, người và đồng hồ đều dừng (giữ AC-28.5) |
| Người dùng bật "giảm chuyển động" | Không nội suy, không dao động (giữ AC-31.1) |

> Mục "lỗi mạng" và "quyền truy cập sai" của template **không áp dụng**: ứng dụng không
> gọi mạng (P4) và chỉ có một người dùng trên máy của chính họ.

---

## 6. Yêu cầu phi chức năng

- **Hiệu năng.** Hiến pháp mục 3 đang ràng: giả lập trọn một trận ở chế độ chạy ngay
  **< 3 giây** kể cả khi sân 2D bật; một mùa 20 đội (380 trận) **< 30 giây**; mở ứng dụng
  với 20 đội và 20 trận lịch sử **< 2 giây**. Một trận ở mức 0,5 giây mỗi khung là
  **~10.800 khung × 25 thực thể**. Ngân sách "một mùa < 30 giây" tức **< 79 ms một trận** —
  **thấp hơn ngân sách một trận lẻ gần 40 lần**. Đây là một **xung đột thật**, xem mục 8
  câu 11; spec này PHẢI không được lập plan trước khi nó được chốt.
- **Dữ liệu.** Khối lượng của một trận tăng từ ~90 dòng sự kiện lên tới hàng trăm nghìn số.
  Hiến pháp P10 đã cấm lặng lẽ cắt bớt dữ liệu người dùng. Xem mục 8 câu 5.
- **Tái lập được (P1).** Mọi tính ngẫu nhiên — từ việc một cú sút có vào hay không, tới việc
  trọng tài có bỏ qua một lỗi nhỏ hay không, tới chỗ bóng bật ra khi khống chế hỏng — PHẢI
  đến từ nguồn ngẫu nhiên truyền vào theo mã trận. PHẢI không có `Math.random`, PHẢI không bám
  đồng hồ thật.
- **Luật bóng đá tách khỏi giao diện (P2).** Mọi thứ ở mục 3 là **luật và mô phỏng**, nên
  toàn bộ PHẢI nằm ở lớp trong; giao diện chỉ vẽ.
- **Accessibility (P9).** Mọi thông tin mới — ai đang giữ bóng, ai đang bị kèm, trạng thái
  của từng người — PHẢI không chỉ truyền đạt bằng màu; tương phản 4,5:1; mọi thao tác làm được
  bằng bàn phím.
- **Song ngữ (P8).** Tên mọi mục đích di chuyển, tên mọi hành động có bóng, tên mọi quyết
  định của trọng tài, mọi câu tóm tắt đoạn 15 phút PHẢI có cả tiếng Việt và tiếng Anh
  **trong cùng commit**, và câu tường thuật PHẢI viết riêng cho từng ngôn ngữ.
- **Offline (P4).** Không gọi mạng, kể cả để lấy dữ liệu thời tiết hay dữ liệu bóng đá thật.

---

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution
- [ ] Mọi AC dạng **khoảng số** (AC-38.x, AC-40.8, AC-41.5, AC-42.x, AC-43.x) có **test tự
      động** đo đúng khoảng đó trên nhiều mã trận — không AC nào trong nhóm này được tick
      bằng cách xem mắt (P5, và chuẩn chất lượng mục 4)
- [ ] Mọi AC ở mục 10 (những gì phải giữ lại) được chạy lại và còn xanh
- [ ] Người dùng tự xem một trận trọn vẹn và phán rằng ba câu họ nói ở mục 1 không còn đúng
      nữa — lớp kiểm cuối, như T518 của spec 005 và T617 của spec 006
- [ ] Ứng dụng chạy trọn luồng mục 4 từ đầu tới cuối (P6)

---

## 8. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

- [NEEDS CLARIFICATION: Engine mới **thay thế** engine hiện tại, hay **sống song song** như một chế độ thứ hai? Và 20 trận người dùng đã lưu xử lý thế nào — giữ nguyên xem bằng cách cũ, chuyển đổi, hay chấp nhận mất? Đây là câu quyết định cả kiến trúc: bốn spec trước đều giữ phiên bản engine và phiên bản dữ liệu không đổi, và đó chính là thứ giữ cho trận đã lưu còn đấu lại được (P1, P3).]
- [NEEDS CLARIFICATION: Spec 005 và spec 006 — nội suy có đường cong, lớp dao động, mốc trung gian dựng ở tầng giao diện, suy ra ai giữ bóng — **còn giữ hay thành dư**? Nếu engine mới tự phát khung hình 0,5 giây thì cả hai lớp ấy không còn việc gì làm. Chúng là công của 16 lát cắt (Phase 37–52) và 141 phép kiểm ở bốn module của hai spec ấy; bỏ thì phải nói rõ là bỏ.]
- [NEEDS CLARIFICATION: Đầu ra của engine mới là gì — **JSON đọc trong chat** như bản mô tả 21 mục, **dữ liệu cho sân 2D của ứng dụng vẽ**, hay **cả hai**? Nếu là JSON trong chat thì phần lớn 21 mục không phải tính năng của ứng dụng, mà là định dạng một bản báo cáo.]
- [NEEDS CLARIFICATION: "Mô phỏng từng đoạn 15 phút rồi DỪNG chờ lệnh tiếp" — trong ứng dụng nghĩa là gì? Người dùng **bấm tiếp từng đoạn** (sáu lần một trận), hay trận **chạy liền** và đoạn 15 phút chỉ là cách chia bản tóm tắt? Hiện ứng dụng có bốn mức tốc độ chạy liên tục cộng chế độ chạy ngay.]
- [NEEDS CLARIFICATION: Khung hình 0,5 giây **lưu vào bản ghi trận** hay **sinh lại từ mã trận mỗi lần xem**? Một trận là ~10.800 khung × 25 thực thể. Lưu thì tệp sao lưu phình lên hàng nghìn lần; sinh lại thì mỗi lần mở một trận cũ phải mô phỏng lại cả trận. P10 cấm lặng lẽ cắt bớt, nên phải chọn và nói rõ.]
- [NEEDS CLARIFICATION: Mục 14 của bản mô tả đòi 10 chỉ số sân + 3 chỉ số thủ môn. Ứng dụng **đã có 15 chỉ số sân + 3 chỉ số thủ môn**, và chúng phủ gần hết: tốc độ, sức bền, sức mạnh, chuyền (ngắn và dài là hai chỉ số riêng), rê bóng, dứt điểm (sút gần và sút xa riêng), đánh đầu, phòng ngự (tắc bóng, kèm người, đọc tình huống), tầm nhìn, bình tĩnh, phản xạ, bắt bóng. **Thiếu đúng một thứ: "chọn vị trí" của thủ môn** — chỉ số thủ môn thứ ba hiện là "phát động", không phải chọn vị trí. Thêm một chỉ số mới (buộc người dùng nhập lại cho mọi thủ môn đã có), hay suy từ phản xạ và đọc tình huống?]
- [NEEDS CLARIFICATION: Cả 21 mục là **rất lớn** — lớn hơn tổng spec 005 và 006 cộng lại. Chẻ thành bao nhiêu spec? Và spec 007 lấy phần nào **trước**? Một đề xuất để người dùng bác hoặc sửa: (a) toạ độ mét + thời gian liên tục + cơ học chuyển động (US-37, US-38) làm nền, (b) luật IFAB đầy đủ (US-39) riêng một spec, (c) chiến thuật, thể lực, mục đích di chuyển (US-40, US-41) riêng một spec, (d) nhịp trận, sự không hoàn hảo, thống kê (US-42, US-43) riêng một spec.]
- [NEEDS CLARIFICATION: Luật IFAB cần đầy đủ tới đâu **trong spec này**? VAR, DOGSO, phép lợi thế và thả bóng là ba luật khó nhất và ít thấy nhất trên hình. Làm hết ngay, hay làm việt vị + tình huống cố định trước rồi để VAR và DOGSO sau?]
- [NEEDS CLARIFICATION: Trọng tài chính và hai trợ lý (REF, AR1, AR2) có **vẽ trên sân 2D** không? Bản mô tả đòi họ có trong khung hình, với trợ lý luôn ngang hàng hậu vệ cuối. Thêm ba điểm nữa lên sân đụng thẳng vào AC-15.2 và AC-30.5 — "không hai điểm nào chồng khít" — vốn đã là ràng buộc chật nhất của sân 2D.]
- [NEEDS CLARIFICATION: Thời tiết và gió có vào spec này không? Bản mô tả nói mưa làm bóng lăn nhanh và tăng lỗi khống chế, gió ảnh hưởng bóng bổng dài, nắng nóng làm thể lực giảm nhanh hơn 10–20%. Nếu có thì người dùng **chọn thời tiết** hay nó **sinh ra từ mã trận**?]
- [NEEDS CLARIFICATION: **Ngân sách hiệu năng xung đột với hiến pháp.** Hiến pháp mục 3 đòi một trận < 3 giây và một mùa 380 trận < 30 giây, tức < 79 ms một trận. Engine khung 0,5 giây không có cách nào vừa cả hai. Ba đường, phải chọn: (a) sửa hiến pháp, nới ngân sách mùa giải; (b) hai chế độ — engine liên tục cho trận người dùng xem, engine nhanh cho các trận còn lại của mùa, và chấp nhận hai engine cho ra hai kết quả khác nhau; (c) hạ mức chi tiết xuống thưa hơn 0,5 giây cho phần lớn thời gian, chỉ dày lên ở tình huống quan trọng.]
- [NEEDS CLARIFICATION: Hiệp phụ và luân lưu chỉ có nghĩa ở **trận loại trực tiếp**, mà ứng dụng hiện chỉ cho đấu hai đội với nhau — chưa có giải đấu, chưa có vòng loại trực tiếp (giải đấu vừa được gỡ khỏi non-goals ngày 2026-11-16 nhưng chưa spec nào làm). Làm luật hiệp phụ và luân lưu **bây giờ** rồi để đó chờ giải đấu, hay để cùng spec giải đấu?]
- [NEEDS CLARIFICATION: AC-42.11 đòi "trọng tài cũng sai" và AC-43.4 đòi "kết quả không đoán trước được". Cả hai là **yêu cầu cố tình làm engine kém chính xác hơn**. Người dùng có chắc muốn điều đó không — và nếu có thì **đo bằng gì** để biết là đã đủ sai mà chưa sai quá?]

---

## 9. Giả định

- **Spec này nối tiếp spec 006, và spec 006 chưa đóng.** Spec 006 đang ở **17/25 task**: còn
  T608 (đo lại bóng không đứng yên quá 300 ms), Phase 50 (đi vòng qua đối thủ) và Phase 52
  (mức tốc độ thứ năm, kiểm tay, ngân sách, đóng spec). Giả định: spec 006 được **đóng
  trước** khi spec 007 bắt đầu code. Nếu người dùng muốn làm 007 ngay, phần việc còn lại của
  006 phải được quyết định rõ là **bỏ** hay **hoãn** — không để lửng.
- **Nhánh `007-continuous-match-engine` chưa được cắt.** Tài liệu này được viết trên nhánh
  `006-ball-carrier-motion` **có chủ ý**: người dùng đang mở bản dev để xem bản 006 và có thể
  báo lỗi ngay, nên đổi nhánh lúc này sẽ làm các bản sửa lỗi của 006 rơi vào nhánh 007. Nhánh
  007 nên cắt khi thật sự bắt đầu `/plan`.
- **Đánh số tiếp các spec trước:** user story từ **US-37**, task từ **T700**, phase từ
  **53**, quyết định thiết kế từ **D117**.
- Chỉ số cầu thủ hiện có (15 + 3) là **đủ cho phần lớn mục 14** của bản mô tả; giả định là
  không làm người dùng nhập lại chỉ số cho các đội đã có. Nếu giả định này sai thì mục 8
  câu 6 phải đổi.
- Người dùng vẫn là **một người, trên một máy, offline** — không có chuyện hai người cùng xem
  một trận.
- Bản mô tả 21 mục là **yêu cầu của người dùng**, không phải tài liệu kỹ thuật: những con số
  trong đó (9 m/s, 6 m/s², 55–60 phút, 350–650 đường chuyền) là **mức mong muốn**, và spec
  này ghi chúng thành AC đo được. Nếu một con số nào đó hoá ra không dựng nổi thì phải quay
  lại hỏi người dùng, **không** tự hạ ngưỡng.

---

## 10. Những gì PHẢI giữ lại từ spec 001–006

Spec này chạm vào lớp sâu nhất của ứng dụng, nên đây là danh sách những gì dễ vỡ nhất, kèm
lý do từng cái. Mọi AC dưới đây PHẢI còn đúng khi spec 007 đóng.

**Từ hiến pháp — không thương lượng**

| | Vì sao dễ vỡ ở spec này |
|---|---|
| **P1** tái lập được | Engine mới có hàng nghìn lần rút ngẫu nhiên mỗi trận thay vì vài chục. Một chỗ lỡ bám đồng hồ thật là mất cả P1 |
| **P2** luật bóng đá tách khỏi giao diện | Luật việt vị và tình huống cố định rất muốn được viết ngay chỗ đang vẽ. Không được |
| **P3** dữ liệu người dùng bất khả xâm phạm | 20 trận đã lưu bằng engine cũ. Xem mục 8 câu 1 |
| **P7** tệp sao lưu mở lại được | Trường mới ở quy mô này là nhiều; tệp cũ vẫn phải nhập được |
| **P10** không lặng lẽ cắt bớt | Khung hình 0,5 giây là lý do hoàn hảo để "tối ưu" bằng cách bỏ bớt. Xem mục 8 câu 5 |

**Từ các spec đã đóng**

| AC | Nội dung | Vì sao dễ vỡ |
|---|---|---|
| AC-8.11, AC-8.12 | Cùng mã trận ra cùng từng dòng sự kiện | Nền của mọi so sánh chiến thuật |
| AC-8.3 → AC-8.8 | Chiến thuật khác nhau cho kết quả khác nhau | Engine mới phải giữ được quan hệ chỉ thị → kết quả, không chỉ trông đẹp hơn |
| AC-14.6 | Dưới 7 người thì huỷ trận | Giữ nguyên thành AC-39.12 |
| AC-15.2, AC-30.5 | Không hai điểm nào chồng khít trên sân 2D | Thêm REF/AR1/AR2 là thêm ba điểm. Xem mục 8 câu 9 |
| AC-30.4 | Khối đội hình nghiêng theo bóng trong một ngưỡng | Spec 006 (D116) đã nới ngưỡng này lên một phần sáu chiều dài sân sau khi người dùng xem và chốt |
| AC-30.7 | Thủ môn ở lại một phần ba sân nhà | Người dùng đã bắt lỗi này bằng mắt ở spec 006; engine mới không được làm nó quay lại |
| AC-30.8 | Bốn hàng hai đội xen kẽ đúng thứ tự | Khối phòng ngự 30–40 m của AC-40.1 đụng thẳng vào trật tự này |
| AC-28.3 | Toạ độ tại mốc không bao giờ sai | Nếu engine mới tự phát khung hình thì "mốc" đổi nghĩa; phải nói rõ nó còn nghĩa gì |
| AC-28.5 | Tạm dừng thì đóng băng | Spec 006 (D114) vừa phải sửa lại chỗ này bằng một đồng hồ tích luỹ |
| AC-31.1 | Giảm chuyển động thì không nội suy, không dao động | Yêu cầu accessibility, không phải tuỳ chọn |
| AC-31.3, AC-31.4 | Chạy hết trận < 3 giây; mỗi khung vẽ gọn trong một nhịp | Xem mục 8 câu 11 |
| AC-32.1 | Quả bóng luôn có mặt và không bị điểm cầu thủ che | Spec 006 vừa đưa bóng vào chân người giữ bóng; "không bị che" và "trong chân" kéo ngược nhau |
| AC-2.2, AC-2.3 | 15 chỉ số sân + 3 chỉ số thủ môn | Xem mục 8 câu 6 |

---

## 11. Bước tiếp theo

Mục 8 có **13 câu hỏi mở**, trong đó **ba câu chặn cả spec**: câu 1 (thay thế hay song
song), câu 7 (chẻ thành mấy spec) và câu 11 (xung đột ngân sách hiệu năng với hiến pháp).

Chạy `/clarify` để chốt. Hiến pháp mục 5 cấm `/plan` khi mục 8 còn `[NEEDS CLARIFICATION]`.
