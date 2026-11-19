# Spec: Engine mô phỏng liên tục — toạ độ mét và cơ học chuyển động

| | |
|---|---|
| **ID** | `007-continuous-match-engine` |
| **Status** | Clarified |
| **Created** | 2026-11-19 |
| **Clarified** | 2026-11-19 |
| **Branch** | `007-continuous-match-engine` — **chưa cắt**, xem mục 9 |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Phạm vi đã được thu lại ở `/clarify` ngày 2026-11-19.** Bản mô tả 21 mục của người dùng
> lớn hơn tổng spec 005 và 006 cộng lại, nên nó được chẻ thành **bốn spec**. Spec 007 chỉ
> làm **nền chuyển động**: toạ độ mét, thời gian giây, độ cao bóng, cơ học của một cơ thể
> người. Luật IFAB, chiến thuật, thể lực, nhịp trận và thống kê đi sang spec 008–010 —
> xem mục 12, nơi giữ nguyên văn các user story ấy để các spec sau bắt đầu từ đó.

> **Engine mới SỐNG SONG SONG với engine hiện tại**, không thay thế. Engine v5 và 20 trận
> đã lưu giữ nguyên, đấu lại ra đúng từng dòng như cũ. Đây là lối vào thứ hai, đúng tiền lệ
> hiến pháp 3.0 đã cho hai vòng lặp chơi sống song song.

---

## 1. Vấn đề & mục tiêu

### Vấn đề

Engine hiện tại phát **đúng một sự kiện mỗi phút trận**. Mỗi sự kiện nói: phút thứ mấy,
loại gì, đội nào, những ai liên quan, và bóng đi qua những **ô nào của một lưới vùng** —
không phải toạ độ mét. Giữa hai phút ấy, trận đấu **không tồn tại**: không có giây, không
có vị trí, không có tốc độ, không có độ cao của bóng, không có hướng người, không có thể
lực theo giây.

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

Spec 005 và spec 006 đã **chữa triệu chứng** ở tầng giao diện: nội suy có đường cong, lớp
dao động, mốc trung gian dựng từ đường bóng, người giữ bóng **suy ra** từ danh sách người
tham gia. Cả hai đi được một đoạn thật — nhưng không xoá được cái gốc, vì **giao diện không
thể bịa ra dữ liệu mà engine chưa từng tính**. Giao diện không biết ai đang giữ bóng (nó
phải *đoán*), không biết bóng cao bao nhiêu, không biết cầu thủ đang nhìn đâu.

### Mục tiêu

Một engine mô phỏng **liên tục**, chạy **song song** với engine hiện tại như một chế độ thứ
hai: trận đấu tồn tại ở **mọi mốc một giây** (và **nửa giây** ở tình huống quan trọng),
không chỉ ở mốc mỗi phút. Vị trí bằng **mét** trên sân 105×68. Bóng có **độ cao**. Mỗi cầu
thủ có **tốc độ và hướng người**, và không ai tăng tốc, phanh hay quay người nhanh hơn mức
một cầu thủ thật làm được.

Khi làm xong lát này, ba câu người dùng nói ở trên không còn chỗ để đúng nữa — không phải
vì giao diện vẽ khéo hơn, mà vì **dữ liệu bên dưới đã liên tục ngay từ đầu**.

### Non-goals

Những thứ **KHÔNG** làm trong spec 007:

**Đã chẻ sang spec sau** (nguyên văn giữ ở mục 12):
- **Luật IFAB** — việt vị, tình huống cố định, phạt đền, DOGSO, phép lợi thế, VAR, hiệp phụ,
  luân lưu → **spec 008**.
- **Chiến thuật, thể lực, mục đích di chuyển, cây ra quyết định** → **spec 009**.
- **Nhịp trận, sự không hoàn hảo, thống kê bám mức thật, xG** → **spec 010**.
- **Kể trận theo từng đoạn 15 phút** với tóm tắt và khối trạng thái → **spec 010**.

**Không làm, không hoãn:**
- **Thay thế engine hiện tại.** Engine v5 sống tiếp, trận đã lưu đấu lại y nguyên.
- **Vẽ trọng tài và hai trợ lý trên sân 2D.** Họ có trong **dữ liệu** khung hình (AC-38.10)
  nhưng sân 2D không vẽ ở lát này — thêm ba điểm lên sân đụng thẳng vào ràng buộc "không hai
  điểm nào chồng khít", vốn đã là ràng buộc chật nhất của sân 2D.
- **Vòng lặp sự nghiệp nhiều mùa**, lịch đấu, bảng xếp hạng. Hiến pháp 3.0.1 xếp nó **sau**
  khi vòng lặp huấn luyện viên xong.
- **Giải đấu và vòng loại trực tiếp** như một chức năng.
- **Đồ hoạ 3D, mô hình thân người, hoạt ảnh chân tay.** Hiển thị vẫn là sân 2D dạng điểm
  (hiến pháp mục 1). Spec này làm **dữ liệu** thật hơn, không làm **hình** đẹp hơn.
- **Điều khiển cầu thủ bằng tay trong lúc trận chạy.** Đây không phải game thể thao.
- **Bình luận bằng giọng nói, âm thanh, hoạt ảnh ăn mừng.**
- **Đổi luật bóng đá.** Luật là của IFAB; engine tuân theo, không phát minh.
- **Dữ liệu cầu thủ hay câu lạc bộ có thật đóng gói trong repo** (hiến pháp mục 3).
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

> Đánh số tiếp spec 006 (US-33 → US-36). Spec 007 giữ **US-37**, **US-38** và thêm
> **US-45**; các số US-39 → US-44 đã được cấp cho spec 008–010 ở mục 12 và **không** được
> dùng lại ở đây.

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
- [ ] AC-37.4 — KHI một tình huống quan trọng được xuất ra THÌ hệ thống PHẢI cho trạng thái
      đầy đủ ở **từng mốc 0,5 giây**, liên tục từ **6–10 giây trước** tình huống tới **khi
      bóng chết**, không khuyết mốc nào.
- [ ] AC-37.5 — KHI chạy lại cùng một mã trận với cùng hai đội, cùng chiến thuật xuất phát
      và cùng chuỗi can thiệp THÌ **từng khung hình PHẢI giống hệt tới từng chữ số** (P1).
- [ ] AC-37.6 — KHI trận đang mô phỏng THÌ hệ thống PHẢI biết **ai đang giữ bóng** ở mỗi
      khoảnh khắc, hoặc nói rõ **không ai** (bóng đang bay, bóng chết) — PHẢI không bắt giao
      diện suy ra điều đó từ danh sách người tham gia.
- [ ] AC-37.7 — KHI engine tính trạng thái cho phần **thường** của trận THÌ mốc PHẢI cách
      nhau **1 giây**; ở **tình huống quan trọng** PHẢI dày lên thành **0,5 giây** (AC-37.4).
      Một trận vì thế có khoảng **5.400 mốc** thay vì 10.800.
- [ ] AC-37.8 — "Tình huống quan trọng" trong spec này PHẢI được định nghĩa bằng **loại sự
      kiện** — bàn thắng, cơ hội rõ ràng, cứu thua, thẻ đỏ — và PHẢI không dùng **xG**, vì xG
      thuộc spec 010. Khi spec 010 có xG, định nghĩa này được mở rộng, không viết lại.

### US-38: Chuyển động tuân theo cơ học của một cơ thể người

Là một **người xem trận đấu**, tôi muốn **không ai tăng tốc, phanh hay quay người nhanh
hơn mức một cầu thủ thật làm được**, để **không còn cảm giác "teleport"**.

**Acceptance criteria**
- [ ] AC-38.1 — KHI đo tốc độ mọi cầu thủ ở mọi mốc THÌ không ai PHẢI vượt **9 m/s**, và
      một pha trên **7 m/s** PHẢI không kéo dài quá **4 giây liên tục**.
- [ ] AC-38.2 — KHI đo hiệu tốc độ giữa hai mốc liền nhau THÌ gia tốc PHẢI không vượt
      **6 m/s²** và giảm tốc PHẢI không vượt **8 m/s²**.
- [ ] AC-38.3 — KHI một cầu thủ đổi hướng trên **90°** THÌ tốc độ ở mốc ngay trước đó
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
- [ ] AC-38.7 — KHI bóng lăn sệt trên **sân khô** THÌ nó PHẢI chậm dần **1–2 m/s²**; trên
      **sân ướt** PHẢI chậm dần **ít hơn** mức đó, tức bóng đi xa hơn. *(Bản mô tả gốc ghép
      "sân ướt hoặc cỏ dài" vào cùng một chiều; hai thứ đó ngược nhau về ma sát — xem mục 9.)*
- [ ] AC-38.8 — KHI vẽ một pha chạy trên **6 m/s** THÌ đường chạy PHẢI là **đường cong**:
      góc đổi hướng giữa hai mốc liền nhau PHẢI không vượt một ngưỡng nêu được bằng số.
- [ ] AC-38.9 — KHI một trận bắt đầu THÌ **thời tiết và gió** PHẢI dẫn xuất **tất định từ
      mã trận** (P1), và trong spec này PHẢI chỉ ảnh hưởng tới **vật lý bóng**: ma sát khi
      bóng lăn sệt (AC-38.7) và quỹ đạo bóng bổng dài. Ảnh hưởng tới thể lực và tới tỉ lệ
      khống chế hỏng thuộc spec 009 và 010.
- [ ] AC-38.10 — KHI xuất một khung hình THÌ trọng tài chính và hai trợ lý PHẢI **có trong
      dữ liệu** với mã `REF`, `AR1`, `AR2`: trọng tài chính cách bóng **15–25 m** và không
      nằm trên đường chuyền, mỗi trợ lý **ngang hàng hậu vệ cuối cùng** của nửa sân mình phụ
      trách. Sân 2D PHẢI **không vẽ** ba điểm này ở spec 007.
- [ ] AC-38.11 — KHI một cầu thủ di chuyển THÌ mỗi mốc PHẢI có **hướng người** (0–360°), và
      hướng ấy PHẢI khớp với hướng di chuyển trừ khi anh ta đang chạy lùi hoặc chạy ngang.

### US-45: Chế độ thứ hai, và dữ liệu đọc được bằng số

Là một **người dùng**, tôi muốn **chọn được chế độ mô phỏng và đọc được dữ liệu thô của
trận**, để **engine mới không làm hỏng những trận tôi đã có, và để tôi kiểm được bằng số
thay vì phải tin**.

> US-45 nhận số sau US-44 **có chủ ý**: US-39 → US-44 đã được cấp cho spec 008–010 ở mục 12,
> và đánh số lại sẽ làm sai lệch hồ sơ của `/clarify` hôm nay.

**Acceptance criteria**
- [ ] AC-45.1 — KHI người dùng bắt đầu một trận THÌ họ PHẢI chọn được giữa **chế độ hiện
      tại** và **chế độ liên tục**, và lựa chọn ấy PHẢI được ghi vào bản ghi trận để phát
      lại đúng (P1).
- [ ] AC-45.2 — KHI mở một trận đã lưu bằng engine hiện tại THÌ nó PHẢI mở được, xem lại
      được và đấu lại được **đúng từng dòng như trước spec này**; engine hiện tại PHẢI
      không đổi một kết quả nào (P1, P3).
- [ ] AC-45.3 — KHI mô phỏng **100 mã trận** với cùng hai đội và cùng chiến thuật ở **cả hai
      chế độ** THÌ hiệu số bàn thắng trung bình giữa hai chế độ PHẢI không lệch quá **0,5
      bàn**, và tỉ lệ thắng của đội mạnh hơn PHẢI không lệch quá **10 điểm phần trăm**. Một
      trận **cụ thể** PHẢI không bắt buộc ra cùng tỉ số — hai chế độ rút ngẫu nhiên ở hai
      chỗ khác nhau, nên đòi giống từng trận là đòi một điều không thể.
- [ ] AC-45.4 — KHI một trận ở chế độ liên tục được lưu THÌ bản ghi PHẢI chỉ lưu mã trận,
      hai đội, chuỗi can thiệp, chế độ và kết quả — PHẢI **không lưu vị trí** của bất kỳ mốc
      nào; và mở lại trận ấy PHẢI **sinh lại** đúng từng khung hình đã từng thấy.
- [ ] AC-45.5 — KHI người dùng xuất một trận ở chế độ liên tục THÌ họ PHẢI nhận được một tệp
      **JSON** chứa nhật ký sự kiện và khung hình chi tiết đúng định dạng mục 7b và mục 15
      của bản mô tả gốc.
- [ ] AC-45.6 — KHI tệp xuất ở AC-45.5 có trong tay THÌ mọi phép kiểm cơ học của US-38
      PHẢI chạy được **trên chính tệp ấy** — không phải dựng một bản đo riêng mỗi lần muốn
      kiểm một con số, như đã phải làm suốt spec 005 và 006.
- [ ] AC-45.7 — KHI chế độ liên tục đang chạy THÌ mọi tính ngẫu nhiên PHẢI đến từ mã trận;
      PHẢI không có nguồn ngẫu nhiên hay nguồn thời gian toàn cục nào trong engine (P1).

---

## 4. Luồng chính (happy path)

1. Người dùng chọn hai đội của mình, sơ đồ và phong cách mỗi bên, đội chủ nhà, và **chế độ
   mô phỏng** → hệ thống nhận một mã trận, và thời tiết của trận sinh ra từ mã ấy.
2. Người dùng bấm bắt đầu → trận chạy ở chế độ liên tục: mọi điểm di chuyển theo cơ học của
   US-38, bóng có độ cao, người giữ bóng luôn xác định.
3. Người dùng xem sân 2D, dừng và tua được; ở các tình huống quan trọng chuyển động dày lên
   **0,5 giây một mốc**.
4. Giữa trận, người dùng thay người hoặc đổi chỉ thị; mọi can thiệp được ghi lại để phát
   lại (P1).
5. Hết trận → bảng thống kê, điểm từng cầu thủ, và trận được lưu lại (chỉ mã trận và kết
   quả, không lưu vị trí).
6. Người dùng mở lại trận ấy sau → chuyển động được **sinh lại** đúng như đã thấy.
7. Nếu muốn kiểm bằng số, người dùng **xuất tệp JSON** của trận và đọc trực tiếp.

---

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Một đội chưa đủ người để ra sân | Từ chối bắt đầu trận, nói rõ còn thiếu bao nhiêu người và ở vị trí nào — không bắt đầu rồi mới hỏng |
| Cầu thủ thiếu chỉ số | Nói rõ chỉ số nào thiếu của ai trước khi bắt đầu; engine PHẢI không lặng lẽ coi chỉ số trống là 0 |
| Trận đã lưu bằng engine hiện tại | Mở lại, xem lại và đấu lại y nguyên (AC-45.2). Chế độ của trận được đọc từ bản ghi, không đoán |
| Bản ghi trận cũ **không có** trường chế độ | Hiểu là chế độ hiện tại — mặc định hợp lý, không hỏi người dùng (P7) |
| Tệp sao lưu từ phiên bản dữ liệu cũ | Nhập lại được trọn vẹn, điền mặc định như trên (P7) |
| Hết dung lượng lưu trữ giữa lúc đang lưu trận | Thông báo bằng ngôn ngữ đang chọn, nói rõ cái gì chưa lưu được và phải làm gì; PHẢI không để lại một trận hỏng một nửa (P3) |
| Tệp JSON xuất ra quá lớn cho một lần ghi | Nói rõ kích thước trước khi ghi và cho người dùng huỷ; PHẢI không ghi nửa tệp rồi dừng |
| Mở lại một trận cũ mà engine đã đổi kể từ đó | Kết quả vẫn đúng (vì kết quả được lưu), nhưng **chuyển động có thể khác**. Nói rõ cho người dùng, PHẢI không im lặng |
| Mô phỏng chạy quá ngân sách thời gian | Nói rõ đang chạy, có đường dừng; PHẢI không treo giao diện không dấu hiệu |
| Một phép kiểm cơ học của US-38 thất bại khi chạy | Lộ ra ngay khi phát triển, PHẢI không làm tròn cho qua |
| Người dùng tạm dừng giữa một tình huống đang chạy | Đóng băng hoàn toàn: bóng, người và đồng hồ đều dừng (giữ AC-28.5) |
| Người dùng bật "giảm chuyển động" | Không nội suy, không dao động (giữ AC-31.1) |
| Trận ở chế độ liên tục chạy ở mức tốc độ nhanh nhất | Theo tiền lệ spec 005: ở mức nhanh nhất thôi nội suy. Mốc 1 giây vẫn tính, chỉ không vẽ mượt |

> Mục "lỗi mạng" và "quyền truy cập sai" của template **không áp dụng**: ứng dụng không
> gọi mạng (P4) và chỉ có một người dùng trên máy của chính họ.

---

## 6. Yêu cầu phi chức năng

- **Hiệu năng — mốc ràng của spec này.** Giả lập trọn một trận ở chế độ chạy ngay **< 3
  giây** kể cả khi sân 2D bật (hiến pháp mục 3, AC-31.3); mỗi khung vẽ gọn trong một nhịp ở
  mọi mức tốc độ (AC-31.4); mở ứng dụng với 20 đội và 20 trận lịch sử **< 2 giây**.
- **Hiệu năng — mốc KHÔNG ràng spec này, nhưng phải đo.** Hiến pháp còn đòi một mùa 20 đội
  (380 trận) **< 30 giây**, tức **< 79 ms một trận**. Spec 007 **không** dựng mùa giải nào
  nên không có gì vi phạm con số ấy hôm nay, nhưng chế độ liên tục với ~5.400 mốc × 25 thực
  thể **gần như chắc chắn không vừa**. Spec 007 vì thế PHẢI **đo và báo con số thật** trước
  khi spec 009 hay 010 chốt kiến trúc. Nếu con số không vừa thì đó là việc của người dùng
  quyết — nới hiến pháp, hay cho mùa giải chạy ở chế độ hiện tại.
- **Dữ liệu.** Bản ghi trận **không phình thêm một byte**: vị trí sinh lại từ mã trận, không
  lưu (AC-45.4). Đây là cách spec này giữ P10 mà không phải cắt bớt gì.
- **Tái lập được (P1).** Mọi tính ngẫu nhiên — kể cả thời tiết của trận — PHẢI đến từ mã
  trận. PHẢI không có nguồn ngẫu nhiên toàn cục, PHẢI không bám đồng hồ thật.
- **Luật bóng đá tách khỏi giao diện (P2).** Toàn bộ cơ học chuyển động và mọi quyết định của
  trận PHẢI nằm ở lớp trong; giao diện chỉ vẽ và nội suy giữa hai mốc.
- **Accessibility (P9).** Mọi thông tin mới PHẢI không chỉ truyền đạt bằng màu; tương phản
  4,5:1; chọn chế độ mô phỏng và xuất tệp PHẢI làm được bằng bàn phím.
- **Song ngữ (P8).** Tên chế độ mô phỏng, nhãn thời tiết, nhãn nút xuất tệp và mọi thông báo
  lỗi mới PHẢI có cả tiếng Việt và tiếng Anh **trong cùng commit**.
- **Offline (P4).** Không gọi mạng, kể cả để lấy dữ liệu thời tiết.

---

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution
- [ ] Mọi AC dạng **khoảng số** (AC-37.7, AC-38.1 → AC-38.8, AC-38.11, AC-45.3) có **test tự
      động** đo đúng khoảng đó trên nhiều mã trận — không AC nào trong nhóm này được tick bằng
      cách xem mắt (P5, và chuẩn chất lượng mục 4)
- [ ] Ngân sách mùa giải đã được **đo và báo số**, dù spec này không bị nó ràng (mục 6)
- [ ] Mọi AC ở mục 10 (những gì phải giữ lại) được chạy lại và còn xanh
- [ ] Người dùng tự xem một trận trọn vẹn ở chế độ liên tục và phán rằng ba câu họ nói ở mục 1
      không còn đúng nữa — lớp kiểm cuối, như T518 của spec 005 và T617 của spec 006
- [ ] Ứng dụng chạy trọn luồng mục 4 từ đầu tới cuối, ở **cả hai chế độ** (P6)

---

## 8. Câu hỏi mở

**Không còn câu hỏi mở.** Mười ba câu của bản Draft đã được chốt hoặc chuyển sang spec sau ở
`/clarify` ngày 2026-11-19 — xem mục 11 (nhật ký) và mục 12 (những câu thuộc spec 008–010).

Spec này đã qua cổng chặn của hiến pháp mục 5 và sẵn sàng cho `/plan`.

---

## 9. Giả định

- **Spec 006 được đóng trước, và Phase 50 bị bỏ.** Người dùng chốt ngày 2026-11-19: làm nốt
  T608 và Phase 52, **bỏ Phase 50** (T609, T610 — đi vòng qua đối thủ ở tầng giao diện) vì
  engine mới sẽ làm việc đó đúng hơn ở tầng dưới. Hệ quả: **AC-34.2 của spec 006 đóng mà chưa
  làm** — nó được **hoãn sang spec 007**, không phải xong. Việc này phải ghi rõ trong
  `tasks.md` của spec 006.
- **Nhánh `007-continuous-match-engine` chưa được cắt.** Tài liệu này được viết trên nhánh
  `006-ball-carrier-motion` **có chủ ý**: người dùng đang xem bản 006 và có thể báo lỗi, nên
  đổi nhánh lúc này sẽ làm các bản sửa lỗi của 006 rơi vào nhánh 007. Nhánh 007 cắt khi bắt
  đầu code, sau khi 006 đóng.
- **Đánh số tiếp các spec trước:** task từ **T700**, phase từ **53**, quyết định thiết kế từ
  **D117**.
- **Chỉ số cầu thủ hiện có (15 + 3) đủ cho spec 007.** Phần của mục 14 cần chỉ số mới nằm ở
  spec 009; xem câu hỏi còn treo ở mục 12.
- **Một chỗ trong bản mô tả gốc tự mâu thuẫn, và tôi đã chọn một chiều.** Mục 10 viết bóng
  lăn "chậm dần nhanh hơn trên sân ướt **hoặc cỏ dài**", còn mục 21 viết "mưa làm bóng lăn
  **nhanh** và trơn hơn". Hai câu ngược nhau: cỏ ướt **giảm** ma sát (bóng đi xa hơn), cỏ dài
  **tăng** ma sát. AC-38.7 lấy theo vật lý và theo mục 21 — **sân ướt thì bóng đi xa hơn**.
  Nếu ý người dùng là chiều kia thì AC-38.7 phải sửa.
- Người dùng vẫn là **một người, trên một máy, offline**.
- Bản mô tả 21 mục là **yêu cầu của người dùng**, không phải tài liệu kỹ thuật: những con số
  trong đó là **mức mong muốn**, và spec này ghi chúng thành AC đo được. Nếu một con số hoá ra
  không dựng nổi thì phải quay lại hỏi người dùng, **không** tự hạ ngưỡng.

---

## 10. Những gì PHẢI giữ lại từ spec 001–006

Spec này thêm một engine thứ hai bên cạnh engine cũ, nên đây là danh sách những gì dễ vỡ
nhất. Mọi AC dưới đây PHẢI còn đúng khi spec 007 đóng.

**Từ hiến pháp — không thương lượng**

| | Vì sao dễ vỡ ở spec này |
|---|---|
| **P1** tái lập được | Engine mới có hàng nghìn lần rút ngẫu nhiên mỗi trận thay vì vài chục. Một chỗ lỡ bám đồng hồ thật là mất cả P1. Và vì vị trí **sinh lại** chứ không lưu, P1 là thứ duy nhất giữ cho một trận cũ xem lại vẫn ra đúng chuyển động ấy |
| **P2** luật bóng đá tách khỏi giao diện | Cơ học chuyển động rất muốn được viết ngay chỗ đang vẽ. Không được |
| **P3** dữ liệu người dùng bất khả xâm phạm | 20 trận đã lưu bằng engine cũ phải đấu lại y nguyên (AC-45.2) |
| **P6** mỗi lát tự chạy được | Đây là lý do spec 007 chỉ lấy nền chuyển động, và là lý do nó dùng lại mô hình xác suất của engine cũ để có một trận chạy được ngay |
| **P7** tệp sao lưu mở lại được | Thêm trường chế độ vào bản ghi trận; tệp cũ không có trường ấy vẫn phải nhập được |
| **P10** không lặng lẽ cắt bớt | Giải bằng cách **không lưu vị trí** (AC-45.4), nên không có gì để cắt |

**Từ các spec đã đóng**

| AC | Nội dung | Vì sao dễ vỡ |
|---|---|---|
| AC-8.11, AC-8.12 | Cùng mã trận ra cùng từng dòng sự kiện | Nền của mọi so sánh chiến thuật |
| AC-8.3 → AC-8.8 | Chiến thuật khác nhau cho kết quả khác nhau | Chế độ mới phải giữ được quan hệ chỉ thị → kết quả (AC-45.3 canh điều này bằng số) |
| AC-14.6 | Dưới 7 người thì huỷ trận | Chế độ mới cũng phải tuân |
| AC-15.2, AC-30.5 | Không hai điểm nào chồng khít trên sân 2D | Lý do trọng tài **không** được vẽ ở lát này |
| AC-30.4 | Khối đội hình nghiêng theo bóng trong một ngưỡng | Spec 006 (D116) vừa nới lên một phần sáu chiều dài sân sau khi người dùng xem và chốt |
| AC-30.7 | Thủ môn ở lại một phần ba sân nhà | Người dùng đã bắt lỗi này bằng mắt ở spec 006; engine mới không được làm nó quay lại |
| AC-30.8 | Bốn hàng hai đội xen kẽ đúng thứ tự | Chuyển động liên tục làm điểm di chuyển nhiều hơn, nên trật tự này dễ vỡ hơn |
| AC-28.3 | Toạ độ tại mốc không bao giờ sai | Ở chế độ mới, "mốc" là mốc 1 giây của engine chứ không còn là mốc mỗi phút — nghĩa đổi, bất biến thì không |
| AC-28.5 | Tạm dừng thì đóng băng | Spec 006 (D114) vừa phải sửa lại chỗ này bằng một đồng hồ tích luỹ |
| AC-31.1 | Giảm chuyển động thì không nội suy, không dao động | Yêu cầu accessibility, không phải tuỳ chọn |
| AC-31.3, AC-31.4 | Chạy hết trận < 3 giây; mỗi khung vẽ gọn trong một nhịp | Mốc ràng thật của spec này, xem mục 6 |
| AC-32.1 | Quả bóng luôn có mặt và không bị điểm cầu thủ che | Spec 006 vừa đưa bóng vào chân người giữ bóng; "không bị che" và "trong chân" kéo ngược nhau |
| AC-2.2, AC-2.3 | 15 chỉ số sân + 3 chỉ số thủ môn | Spec 007 không thêm chỉ số nào |

**Những gì của spec 005 và 006 được giữ, và phần duy nhất bị bỏ**

- **Giữ nguyên toàn bộ spec 005**: nội suy có đường cong và lớp dao động **vẫn cần**, vì mốc
  0,5–1 giây của engine mới là 1–2 mốc mỗi giây và mắt người sẽ thấy giật nếu không nội suy
  xuống 60 khung/giây.
- **Giữ phần vẽ của spec 006**: bóng trong chân người giữ bóng, vòng sáng, phép kẹp thủ môn,
  nghiêng khối theo bóng và theo vai trò.
- **Bỏ phần SUY RA của spec 006**: dựng mốc trung gian từ đường bóng, và đoán ai đang giữ
  bóng từ danh sách người tham gia. Engine mới nói thẳng cả hai (AC-37.6), nên để hai nguồn
  cùng tồn tại là mời một lớp lỗi rất khó thấy. Phần bỏ này **chỉ áp dụng cho chế độ liên
  tục**: chế độ hiện tại vẫn cần lớp suy ra, vì engine v5 không nói ai giữ bóng.

---

## 11. Nhật ký làm rõ

Mười hai câu hỏi, chốt ngày **2026-11-19**. Người dùng chọn đúng phương án khuyến nghị ở cả
mười hai — lần đầu trong sáu spec.

| # | Câu hỏi | Quyết định | Cái giá đã nói trước khi chốt |
|---|---|---|---|
| 1 | Engine mới thay thế hay song song? 20 trận đã lưu ra sao? | **Song song.** Engine hiện tại và 20 trận đã lưu giữ nguyên, đấu lại y nguyên. Engine mới là lối vào thứ hai | Hai engine cùng sống, hai bảng thống kê khác nhau cho cùng một đội, và mọi tính năng sau phải chọn làm cho bên nào. Tiền lệ: hiến pháp 3.0 đã cho hai vòng lặp chơi sống song song |
| 2 | 21 mục chẻ thế nào? 007 làm gì trước? | **Nền chuyển động trước.** 007 = US-37 + US-38 (+ US-45). Luật IFAB → 008; chiến thuật, thể lực, mục đích → 009; nhịp trận, sự không hoàn hảo, thống kê → 010 | Chưa có luật mới nào, bảng thống kê chưa đổi. Lý do nền phải đi trước: việt vị và tình huống cố định **không dựng được** khi chưa có toạ độ mét |
| 3 | Ngân sách hiệu năng xung đột hiến pháp (< 3 giây một trận nhưng < 79 ms nếu tính theo mùa) | **Hai mức chi tiết, một engine.** Một engine, một kết quả, P1 nguyên vẹn | Câu "trận tồn tại ở mọi thời điểm" chỉ đúng một phần: AC-37.1 đi kèm AC-37.7 |
| 4 | Mức thưa là bao nhiêu? | **1 giây** ở phần thường, **0,5 giây** ở tình huống quan trọng. ~5.400 mốc một trận | Ở 1 giây, một người chạy 6 m/s đi được 6 m giữa hai mốc — đủ gần để không bỏ sót một cú đổi hướng. Ở 2 giây là 12 m, và một cú đổi hướng gấp ở giữa sẽ bị nội suy làm phẳng |
| 5 | Spec 005 và 006 còn giữ hay thành dư? | **Giữ 005 nguyên vẹn, giữ phần vẽ của 006, bỏ lớp SUY RA của 006** — và chỉ bỏ ở chế độ liên tục | Nội suy của 005 vẫn cần vì 1–2 mốc mỗi giây thì mắt người thấy giật. Để lớp suy ra chạy song song với dữ liệu thật là mời một lớp lỗi rất khó thấy |
| 6 | Spec 006 đang 17/25 — làm gì với phần còn lại? | **Đóng 006, bỏ Phase 50.** Làm T608 và Phase 52; bỏ T609, T610 | AC-34.2 của spec 006 đóng mà chưa làm, phải ghi rõ là **hoãn sang 007**, không phải xong. Đường kia là làm một việc biết trước là sẽ xoá |
| 7 | Engine mới phát ra cái gì? | **Vẽ trên sân 2D + xuất được JSON** đúng định dạng mục 7b và 15 | Thêm một định dạng phải giữ đúng mãi, và tệp xuất rất lớn. Lý do vẫn chọn: người dùng kiểm bằng số rất nhiều, và suốt spec 005–006 mỗi con số đều phải dựng một bản đo riêng |
| 8 | Vị trí từng mốc: lưu hay sinh lại? | **Sinh lại từ mã trận.** Bản ghi trận không phình thêm một byte | Mở một trận cũ phải mô phỏng lại cả trận trước khi vẽ; và nếu engine đổi sau này thì **chuyển động** của trận cũ sẽ khác đi (tỉ số thì không, vì kết quả vẫn được lưu) |
| 9 | Ở lát chỉ có toạ độ và cơ học, cái gì quyết kết quả trận? | **Dùng lại mô hình xác suất của engine hiện tại**, nhưng diễn ra trên toạ độ mét và thời gian giây. Spec 008–010 thay dần lớp quyết định | Trong 007 vẫn chưa có việt vị, phạt góc, ném biên — trận trông liên tục nhưng luật vẫn thiếu. Lợi: lát 007 chạy trọn một trận xem được ngay (P6) |
| 10 | Trọng tài và hai trợ lý có vẽ trên sân 2D? | **Có trong dữ liệu khung hình, không vẽ.** Bản mô tả gốc đòi họ "có trong khung hình" — điều đó được thoả | Không thấy họ trên hình ở lát này. Lý do không vẽ: ba điểm nữa đụng thẳng AC-15.2 và AC-30.5, mà sàn hai điểm gần nhau nhất hiện là 1,31 bán kính và đã phải nới một lần |
| 11 | Thời tiết và gió có vào 007? | **Có, sinh ra từ mã trận.** Trong 007 chỉ ảnh hưởng vật lý bóng | Người dùng không chọn được thời tiết, nó là của trận. Bù lại không thêm trường nào vào bản ghi trận hay tệp sao lưu |
| 12 | Bốn câu nhỏ còn lại (chỉ số thủ môn, luật tới đâu, hiệp phụ và luân lưu, trọng tài sai) | **Chuyển sang spec 008–010** cùng với user story của chúng — xem mục 12 | Chúng không ràng spec 007, nên trả lời bây giờ là quyết sớm cho một spec chưa viết |

---

## 12. Lộ trình spec 008 → 010

Phần này giữ **nguyên văn** các user story đã viết ở bản Draft nhưng **không** thuộc phạm vi
spec 007. Chúng **không phải** acceptance criteria của spec 007 và **không** được tick ở đây.
Chúng ở lại để `/specify` của spec 008–010 bắt đầu từ đây chứ không phải từ đầu.

### Spec 008 — Luật IFAB (US-39)

Việt vị xét tại thời điểm chạm bóng với hậu vệ thứ hai từ cuối; ngang hàng không việt vị;
chỉ thổi khi tham gia tình huống; không việt vị từ phát bóng lên, ném biên, phạt góc. Đá
phạt trực tiếp và gián tiếp. Phạt đền. Thủ môn giữ bóng 8 giây. Phép lợi thế. DOGSO, kèm
ngoại lệ phạt đền + thẻ vàng khi có ý tranh bóng. Thẻ vàng thứ hai. Khoảng cách 9,15 m và
luật hàng rào. Ném biên, phát bóng lên, thả bóng. Thay người 5 người trong 3 lần dừng. VAR
bốn loại tình huống, 1–3 phút mỗi lần. Bù giờ theo số lần dừng. Hiệp phụ và luân lưu.

**Câu hỏi còn treo cho spec 008:**
- Luật đầy đủ tới đâu? VAR, DOGSO, phép lợi thế và thả bóng là ba luật khó nhất và ít thấy
  nhất trên hình — làm hết ngay, hay làm việt vị và tình huống cố định trước?
- Hiệp phụ và luân lưu chỉ có nghĩa ở trận loại trực tiếp, mà ứng dụng chưa có giải đấu. Làm
  bây giờ rồi để đó chờ, hay để cùng spec giải đấu?

### Spec 009 — Chiến thuật, thể lực, và mục đích di chuyển (US-40, US-41)

Khối phòng ngự 30–40 m dọc và 35–45 m ngang, tuyến cách nhau 10–15 m, dịch theo phía có
bóng. Tấn công kéo rộng, người cầm bóng luôn có 2–3 phương án chuyền. Pressing chỉ bật theo
tín hiệu. 3–5 giây phản pressing sau khi mất bóng. 15 phút cuối: đội dẫn lùi sâu, đội bị dẫn
dâng cao và chuyền dài nhiều hơn. Đổi sơ đồ phải có lý do. Thể lực 100 giảm dần, dưới 60 từ
phút 60 thì mất 10% tốc độ tối đa. Quãng đường 9–12 km (thủ môn 5–6 km). Chấn thương 0–1 mỗi
trận. Mỗi người không cầm bóng có một mục đích gọi tên được từ danh mục mục 11. Mỗi lần chạm
bóng chọn từ danh mục mục 12. Cây ra quyết định bốn bước. Áp lực trong 2 m giảm 15–30%. Tỉ
lệ thành công bám mức thật. Hướng người, tầm nhìn 180°, phản ứng 0,2–0,3 giây, quét trước khi
nhận bóng. Kết quả hành động theo chỉ số, áp lực, độ khó và thể lực.

**Câu hỏi còn treo cho spec 009:**
- Mục 14 của bản mô tả đòi 10 chỉ số sân + 3 chỉ số thủ môn. Ứng dụng đã có **15 + 3** và
  chúng phủ gần hết; **thiếu đúng một thứ: "chọn vị trí" của thủ môn** (chỉ số thủ môn thứ ba
  hiện là "phát động"). Thêm một chỉ số mới — buộc người dùng nhập lại cho mọi thủ môn đã
  có — hay suy từ phản xạ và đọc tình huống?
- Thời tiết ảnh hưởng tới thể lực (nắng nóng làm giảm nhanh hơn 10–20%) và tới tỉ lệ khống
  chế hỏng: vào spec 009 hay spec 010?

### Spec 010 — Nhịp trận, sự không hoàn hảo, thống kê (US-42, US-43, US-44)

Bóng chỉ lăn 55–60 phút. Thời gian từng loại bóng chết; đội dẫn ở cuối trận kéo dài thêm
30–50%. Phân bổ cường độ: đứng và đi 35–45%, chạy chậm 35–45%, chạy nhanh 10–15%, nước rút
2–5% với 20–40 pha. Hành vi theo khoảng cách tới bóng. Hồi phục 10–30 giây sau nước rút.
Chạy chậm về sau pha tấn công thất bại. Hàng thủ lệch nhau 1–3 m. Người nhận điều chỉnh
0,5–2 m; 5–10% khống chế hỏng, bóng bật 1–3 m. Cú sút trúng đích phần lớn về giữa khung.
Trọng tài cũng sai. Đội vừa thủng lưới dâng cao 5–10 phút. Cường độ không đều, có giai đoạn
ép sân 5–10 phút. Thống kê cả trận bám mức thật: bàn 2–3, sút 20–30, phạm lỗi 20–28, vàng
3–5, đỏ 0–1, góc 8–12, việt vị 2–6, ném biên 40–50; chuyền 350–650 mỗi đội với 75–90% chính
xác; xG cho mọi cú sút; đội mạnh thắng nhiều hơn nhưng không phải luôn luôn. Kể trận theo
từng đoạn 15 phút với tóm tắt 3–5 câu, nhật ký, khung hình chi tiết và khối trạng thái đủ để
tiếp tục; cộng một lớp tự kiểm chạy trước khi xuất.

**Câu hỏi còn treo cho spec 010:**
- "Mô phỏng từng đoạn 15 phút rồi dừng chờ lệnh tiếp" — trong ứng dụng nghĩa là gì? Người
  dùng **bấm tiếp từng đoạn** (sáu lần một trận), hay trận **chạy liền** và đoạn 15 phút chỉ
  là cách chia bản tóm tắt?
- "Trọng tài cũng sai" và "kết quả không đoán trước được" là **yêu cầu cố tình làm engine kém
  chính xác hơn**. Người dùng có chắc muốn điều đó, và **đo bằng gì** để biết đã đủ sai mà
  chưa sai quá?

### Những gì hoãn từ spec 006 sang đây

- **AC-34.2 của spec 006** — người rê bóng phải **đi vòng qua** điểm của đối thủ nằm trên
  đường đi, không đi xuyên qua. Spec 006 đóng mà chưa làm (Phase 50 bị bỏ, xem mục 9 và nhật
  ký câu 6). Ở engine mới, đây là hệ quả tự nhiên của toạ độ mét cộng cơ học US-38, nên nó
  thuộc **spec 007 hoặc 009** tuỳ chỗ lớp tránh người được dựng — `/plan` quyết.

---

## 13. Bước tiếp theo

Mục 8 đã rỗng, nên cổng chặn của hiến pháp mục 5 đã mở. Chạy `/plan`.

Trước khi code: **đóng spec 006** (T608 và Phase 52, bỏ Phase 50), rồi cắt nhánh
`007-continuous-match-engine`.
