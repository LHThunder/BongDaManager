# Spec: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **ID** | `006-ball-carrier-motion` |
| **Status** | Draft (2026-11-18) |
| **Created** | 2026-11-18 |
| **Branch** | `006-ball-carrier-motion` — **cắt từ `005-lifelike-pitch-motion`, không phải từ `main`** |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Spec này nối tiếp spec 005 và phụ thuộc vào nó.** Spec 005 (`005-lifelike-pitch-motion`)
> lúc tạo spec này đang ở **25/27 task**, còn T518 (người dùng xem và phán) và T519
> (tick AC, đóng spec), và **chưa merge vào `main`**. Nhánh của spec 006 vì thế cắt
> từ nhánh 005. Spec 006 **không thay thế** spec 005: nó giải phần mà spec 005 đã đo
> ra nhưng cố ý không làm — xem mục 1 và mục 10.

> **Spec này thuộc vòng lặp huấn luyện viên (vòng lặp 1), không phải vòng lặp sự
> nghiệp.** Hiến pháp **3.0.1** mục 1 chốt trình tự: hoàn thiện vòng lặp huấn luyện
> viên trước. Spec 004, 005 đã theo đúng trình tự ấy và spec này tiếp tục.

Đánh số nối tiếp: spec 005 dùng US-28 → US-32, AC-28.x → AC-32.x, T500–T526 và
Phase 37–46. Spec này bắt đầu từ **US-33**, **T600**, **Phase 47**.

## 1. Vấn đề & mục tiêu

**Vấn đề.** Sau sáu lát cắt của spec 005, sân đã sống hơn hẳn: mọi điểm luôn động,
chuyển động có đường cong, bóng đi hết đường chuyền của nó, hai hàng đứng đúng chỗ.
Nhưng người dùng xem thật ở T518 vẫn nói ba câu, và cả ba đều chỉ về **một gốc duy
nhất**:

- *"tôi muốn cầu thủ có bóng có thể chạy hoặc qua người với bóng trong chân hoặc
  chuyền và sút. Thấy được đường bóng liên tục và tự nhiên"*
- *"tôi vẫn thấy đôi khi quá nhanh đôi khi quá chậm và các cầu thủ đang di chuyển
  không tự nhiên, như kiểu teleport"*
- *"tôi muốn bóng di chuyển tự nhiên hơn"*

**Gốc ấy là: engine chỉ kể lại MỘT MỐC MỖI PHÚT TRẬN.** Mỗi phút có một dòng tường
thuật, kèm vùng xảy ra, đường bóng đi qua và danh sách người tham gia. Giữa hai mốc,
giao diện không biết gì cả — nó chỉ nội suy. Spec 005 đã đo ra hậu quả, bằng số, ở
mức Chậm (một phút trận dài 1000ms):

| Đo được | Con số |
|---|---|
| Quãng một người đi trong **một nhịp** | trung vị **2,3** đơn vị, phân vị 90 là **9,2**, lớn nhất **47,4** (sân dài 100) |
| Quả bóng di chuyển ở bao nhiêu phần số khung | **35,5%** |
| Quãng bóng **đứng yên** lâu nhất | **3144ms** |
| Người không tham gia tình huống di chuyển bao nhiêu | dao động **±1 đơn vị** quanh chỗ đứng, cộng co khối tối đa **10 đơn vị** |

Trong **một** nhịp, chỉ có hai đường: hoặc mọi người dùng chung thời lượng — thì tốc
độ chênh nhau hơn **hai mươi lần**; hoặc mọi người dùng chung tốc độ — thì người
quãng ngắn xong sớm rồi đứng chờ. Spec 005 chọn điểm giữa (thời lượng theo quãng, dải
tốc độ còn dưới 4 lần) nhưng **không xoá được cái gốc**: không có mốc nào giữa hai
phút, nên không có gì để đi tới.

Và quả bóng thì **không thuộc về ai**: giữa hai pha bóng không ai giữ nó, nên nó nằm
im tới ba giây giữa trận.

**Mục tiêu.** Dựng một **mốc trung gian giữa hai phút trận**: một mô hình "ai đang
giữ bóng, bóng đi theo ai, lúc nào rời chân". Khi có nó thì bốn điều cùng đúng:

1. Quả bóng luôn thuộc về ai đó (hoặc đang bay giữa hai người), nên nó không còn nằm im.
2. Người giữ bóng **dẫn bóng** — chạy kèm bóng, vòng qua người cản.
3. Một đường chuyền hay một cú sút **nhìn ra được** là bóng rời chân, bay nhanh hơn người.
4. Người không có bóng cũng **di chuyển có mục đích** — theo bóng, mở ra nhận bóng —
   thay vì đứng chờ tới phút sau rồi bị kéo.

**Non-goals (lần này KHÔNG làm):**

- **Không đổi một con số nào của trận.** Tỉ số, từng dòng tường thuật, chỉ tiêu hai
  đội, điểm từng cầu thủ phải y hệt trước và sau spec này. Đây là **trình bày**, không
  phải luật bóng đá (hiến pháp P2).
- Không làm đồ hoạ 3D, không ảnh cầu thủ trên sân, không hoạt hình tay chân — sân vẫn
  là 2D dạng điểm (hiến pháp mục 1).
- Không thêm loại tình huống mới vào trận (không "solo qua ba người", "đá phạt góc hai
  nhịp"…) trừ khi câu hỏi mở (2) được chốt theo hướng đó.
- Không làm huấn luyện viên đối thủ biết phản ứng; không phong độ ngày thi đấu.
- Không chạm vòng lặp sự nghiệp.
- Không làm bản điện thoại/máy tính bảng.

## 2. Người dùng & bối cảnh

- **Ai dùng:** người dùng duy nhất của ứng dụng, đang xem một trận do mình dựng.
- **Khi nào dùng:** mỗi lần mở một trận và bật sân 2D — tức gần như mọi trận. Thường
  xem ở mức **Chậm** (1000ms một phút trận), là mức mặc định từ spec 005.
- **Thiết bị/môi trường:** trình duyệt trên máy cá nhân, chạy offline. Sân 2D là một
  hình 100×64 đơn vị, mỗi cầu thủ là một điểm bán kính 3,4, quả bóng là một điểm nhỏ
  trắng-đen bán kính 1,7.

## 3. User stories

### US-33: Quả bóng luôn thuộc về ai đó

Là một **người dùng**, tôi muốn **lúc nào cũng thấy bóng đang ở chân ai**, để **tôi
theo được trận bằng mắt thay vì đoán xem chuyện gì đang xảy ra**.

**Acceptance criteria:**

- [ ] AC-33.1 — KHI trận đang chạy và bóng không đang bay THÌ PHẢI có **đúng một** cầu thủ đang giữ bóng, và quả bóng PHẢI nằm sát chân anh ta — cách tâm điểm của anh ta **không quá một bán kính điểm**.
- [ ] AC-33.2 — KHI người giữ bóng di chuyển THÌ quả bóng PHẢI đi **cùng** anh ta trong suốt quãng đường ấy, KHÔNG được rời ra rồi đuổi theo sau, và KHÔNG được tới đích trước rồi đứng đợi.
- [ ] AC-33.3 — KHI xem bất kỳ mười giây nào của một trận đang chạy ở một mức còn nội suy THÌ quả bóng PHẢI không đứng yên quá **300ms** liên tục. *(Đo được trước spec này: 3144ms.)*
- [ ] AC-33.4 — KHI quyền giữ bóng đổi từ người này sang người khác THÌ người xem PHẢI nhận ra được bằng **ít nhất một kênh không phải màu sắc** (hiến pháp P9).
- [ ] AC-33.5 — KHI không ai giữ bóng (bóng đang bay giữa hai người, hoặc bóng ở giữa sân trước giờ bóng lăn) THÌ ứng dụng PHẢI vẫn vẽ bóng đúng chỗ của nó và KHÔNG được gán nhầm cho một cầu thủ.

### US-34: Dẫn bóng và qua người

Là một **người dùng**, tôi muốn **thấy cầu thủ chạy với bóng trong chân và đi vòng
qua người cản**, để **một pha đi bóng trông như một pha đi bóng chứ không như hai
điểm bị dịch chỗ**.

**Acceptance criteria:**

- [ ] AC-34.1 — KHI người giữ bóng phải đi một quãng dài trong một nhịp THÌ PHẢI thấy **người và bóng cùng đi** suốt quãng ấy, với khoảng cách giữa hai điểm luôn dưới một bán kính (AC-33.1).
- [ ] AC-34.2 — KHI đường đi của người giữ bóng cắt qua chỗ đứng của một đối thủ THÌ anh ta PHẢI **đi vòng** qua điểm ấy, chứ KHÔNG đi xuyên qua nó: hai điểm KHÔNG được chồng khít tới mức người xem chỉ thấy một (giữ AC-30.5 của spec 005 và AC-15.2 của spec 002).
- [ ] AC-34.3 — KHI xem cùng một trận hai lần ở cùng một mức tốc độ THÌ đường dẫn bóng PHẢI giống hệt nhau (hiến pháp P1).
- [ ] AC-34.4 — KHI chuyển động mới đang bật THÌ tỉ số, **từng dòng tường thuật**, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.

### US-35: Chuyền và sút nhìn ra được

Là một **người dùng**, tôi muốn **phân biệt được bằng mắt một đường chuyền, một cú
sút và một pha dẫn bóng**, để **tôi đọc được trận mà không phải dò dòng tường thuật**.

**Acceptance criteria:**

- [ ] AC-35.1 — KHI bóng rời chân (chuyền hoặc sút) THÌ nó PHẢI đi **nhanh hơn người giữ bóng ít nhất ba lần**, nên nó tới đích hẳn trước những cầu thủ đang chạy cùng hướng.
- [ ] AC-35.2 — KHI một đường chuyền tới một đồng đội THÌ bóng PHẢI tới **đúng chân** người nhận (trong một bán kính điểm), và người ấy PHẢI trở thành người giữ bóng **ngay khi bóng tới**, không sớm hơn.
- [ ] AC-35.3 — KHI dòng tường thuật kể một cú sút THÌ bóng PHẢI đi **về phía khung thành của đội bị sút**, và kết thúc ở nơi dòng ấy kể (vào lưới, ra ngoài, hay thủ môn cản).
- [ ] AC-35.4 — KHI đặt một pha dẫn bóng cạnh một đường chuyền cùng quãng đường THÌ **thời gian đi phải khác nhau ít nhất ba lần**, tức người xem đọc ra được hai thứ khác nhau mà không cần chữ.

### US-36: Người không có bóng cũng di chuyển có mục đích

Là một **người dùng**, tôi muốn **cả hai đội cùng sống theo trái bóng**, để **sân
không còn cảnh hai mươi người đứng chờ trong khi hai người chạy**.

**Acceptance criteria:**

- [ ] AC-36.1 — KHI trận đang chạy ở một mức còn nội suy THÌ trong **mỗi nhịp**, **mọi** điểm cầu thủ PHẢI đổi chỗ theo một hướng có nghĩa, chứ không chỉ dao động quanh một chỗ cố định.
- [ ] AC-36.2 — KHI người giữ bóng tiến về phía khung thành đối phương THÌ **ít nhất một đồng đội** PHẢI di chuyển lên theo, đủ để người xem thấy có một phương án chuyền.
- [ ] AC-36.3 — KHI bóng đổi từ đội này sang đội kia THÌ cả hai khối đội hình PHẢI dịch theo hướng mới trong nhịp kế tiếp.
- [ ] AC-36.4 — KHI mọi người cùng di chuyển THÌ bốn bất biến của spec 005 PHẢI còn đúng: không hai điểm nào chồng khít (AC-30.5); thủ môn không rời một phần ba sân nhà (AC-30.7); bốn hàng của hai đội xen kẽ đúng thứ tự khi không có bóng ở gần (AC-30.8); không điểm nào ra ngoài vạch biên.
- [ ] AC-36.5 — KHI đo trên một trận đầy đủ THÌ tỉ lệ giữa tốc độ lớn nhất và nhỏ nhất của các điểm **đang di chuyển** PHẢI vẫn dưới **bốn lần** (giữ AC-30.10), và đường đi thật của một điểm trong một nhịp KHÔNG dài hơn đường chim bay quá **năm lần** (giữ AC-30.11).

## 4. Luồng chính (happy path)

1. Người dùng bắt đầu một trận và bật sân 2D ở mức Chậm → sân hiện 22 điểm, một quả
   bóng trắng-đen, và **một cầu thủ đang giữ bóng** thấy rõ.
2. Phút 12, đội nhà có bóng ở cánh phải → người giữ bóng **chạy lên với bóng trong
   chân**, vòng qua một hậu vệ đối phương; hai đồng đội dâng theo; hàng thủ đối phương
   lùi về.
3. Anh ta **chuyền** → bóng rời chân, bay nhanh hơn người, tới đúng chân đồng đội; từ
   đó người nhận thành người giữ bóng.
4. Người nhận **sút** → bóng bay về khung thành; dòng tường thuật kể kết quả, và bóng
   dừng đúng chỗ dòng ấy kể.
5. Hết trận → báo cáo sau trận và dòng tường thuật y như trước spec này, từng chữ.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Phút 0, chưa có dòng nào | Bóng ở điểm giao bóng giữa sân; chưa ai giữ bóng, và không được gán nhầm cho ai |
| Dòng không kể pha bóng nào (thay người, kiệt sức) | Quyền giữ bóng và chỗ của bóng **giữ nguyên** như trước dòng ấy |
| Dòng kể một pha nhưng không nêu ai tham gia | Phải có một quy tắc xác định, tất định, cho việc ai giữ bóng — không được nhảy lung tung giữa các nhịp |
| Bàn thắng | Bóng kết thúc trong khung thành; hiệu ứng bàn thắng của spec 005 vẫn chạy, và nhịp lặng 1,5 giây vẫn đúng |
| Hết hiệp / khai cuộc | Bóng về điểm giao bóng giữa sân (giữ AC-32.2 của spec 005) |
| Người đang giữ bóng bị thẻ đỏ hoặc bị thay ra | Quyền giữ bóng phải chuyển cho ai đó, hoặc bóng thành "không ai giữ" — KHÔNG được để một điểm ma giữ bóng |
| Bóng đang bay mà nhịp kết thúc | Bóng phải tới đích trước khi tình huống kế tiếp bắt đầu, không được còn bay dở (giữ AC-29.3 của spec 005) |
| Hai pha bóng liền nhau ở hai vùng xa nhau | Bóng đi từ chỗ nó **đang đứng**, không nhảy về điểm đầu của pha mới (giữ cách làm của T524) |
| Tạm dừng | Mọi thứ đóng băng, kể cả bóng và người giữ bóng (giữ AC-28.5) |
| Giảm chuyển động bật | Không nội suy, không dao động, không dẫn bóng — vị trí tại từng mốc vẫn đúng (giữ AC-31.1) |
| Mức Rất nhanh (20ms một phút) | Theo AC-29.4 của spec 005, mức này **thôi nội suy** — xem câu hỏi mở (6) |
| Ẩn sân rồi hiện lại | Các điểm và bóng xuất hiện đúng chỗ của thời điểm hiện tại, không chạy lại một cú di chuyển cũ (giữ AC-31.7) |
| Sân 5 người (khung co lại) | Mọi khoảng cách và tốc độ co theo khung, như spec 002 và 005 đã làm |
| Trận lưu từ trước spec này | Mở lại và đấu lại phải cho **đúng kết quả và đúng từng dòng sự kiện** như cũ |
| Mất mạng | Không ảnh hưởng: ứng dụng không gọi mạng (hiến pháp P4) |

## 6. Yêu cầu phi chức năng

- **Hiệu năng — hai ngân sách của spec 005 phải giữ nguyên:**
  - Chạy hết một trận ở chế độ chạy ngay: **dưới 3 giây**, kể cả khi sân 2D đang bật.
    *(Đo được ở spec 005: 57ms.)*
  - Công việc mỗi khung vẽ gọn trong một nhịp đồng hồ ở **cả bốn** mức tốc độ, và
    không tác vụ nào chiếm luồng chính quá **50ms**. *(Đo được ở spec 005: 59 khung/giây,
    thân hàm khung hình lớn nhất 0,1ms, 0 tác vụ quá 50ms.)*
- **Tái lập được (hiến pháp P1):** mọi chuyển động trung gian PHẢI là hàm tất định của
  (trận + nhịp + thời điểm trong nhịp). Không `Math.random`; không lấy ý nghĩa từ đồng
  hồ thật. Xem lại cùng một trận ở cùng một mức PHẢI cho cùng một chuyển động.
- **Luật tách khỏi giao diện (hiến pháp P2):** mô hình giữ bóng là **trình bày**. Nếu
  nó buộc phải biết thêm điều gì về trận thì điều ấy phải đến từ engine, chứ giao diện
  KHÔNG được tự quyết một chuyện thuộc luật bóng đá.
- **Accessibility (hiến pháp P9):** mọi chuỗi mới đủ Việt–Anh trong cùng commit (P8);
  tương phản ≥ 4,5:1 ở cả hai chế độ màu; thông tin "ai đang giữ bóng" không được truyền
  đạt **chỉ** bằng màu.
- **Dữ liệu:** không thêm dữ liệu người dùng mới. Xem câu hỏi mở (1) và (12) về việc
  có đụng tới định dạng bản ghi trận hay không.

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution **3.0.1**
- [ ] **Mọi con số của trận không đổi**, chứng minh bằng phép kiểm: một trận lưu từ
      trước spec này đấu lại cho đúng kết quả và đúng từng dòng sự kiện
- [ ] Có phép kiểm tự động cho lớp giữ bóng: cùng một trận ở cùng một nhịp cho cùng
      một chuyển động (P1), và quyền giữ bóng không nhảy lung tung giữa hai nhịp
- [ ] **Mọi AC của spec 005 được kiểm lại, không AC nào rơi** — danh sách ở mục 10
- [ ] Đo lại hai ngân sách ở mục 6 trên bản build, ghi số đo và điều kiện đo vào mô tả commit
- [ ] Tự tay đi hết màn hình trận ở **cả hai ngôn ngữ và cả hai chế độ sáng/tối**, kèm
      một lượt với giảm chuyển động đang bật
- [ ] **Người dùng tự xem một trận và nói là tự nhiên.** Không phép kiểm tự động nào
      thay được mục này, và nó là lý do spec này tồn tại

## 8. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

- [NEEDS CLARIFICATION: **Câu hỏi lớn nhất của spec này.** Có được đổi engine để biết ai đang giữ bóng không? Hiện dòng sự kiện chỉ có vùng xảy ra, đường bóng đi qua và danh sách người tham gia — không có "ai giữ bóng". Hai đường: (a) **suy ra ở tầng giao diện** từ những thứ đã có, giữ nguyên `PHIEN_BAN_ENGINE` = 5 và `git diff src/engine/` rỗng như bốn spec trước, nhưng suy ra thì có lúc đoán sai; (b) **thêm dữ liệu vào engine**, chính xác hơn nhưng phải đổi phiên bản engine và trả lời cho được: trận đã lưu theo phiên bản cũ thì sao?]
- [NEEDS CLARIFICATION: "Qua người" là **chuyện có thật của trận** (engine kể lại rằng pha ấy đi qua một đối thủ) hay chỉ là **cách vẽ** một pha đã có (người dẫn bóng tránh điểm nào nằm trên đường đi của mình)? Phương án sau không đổi một con số nào của trận; phương án trước đổi engine.]
- [NEEDS CLARIFICATION: Giữa hai phút trận, dựng **bao nhiêu** mốc trung gian, và dựng theo nguyên tắc nào? Ví dụ: chia đường bóng thành từng chặng nhỏ, mỗi chặng một mốc; hay một mốc cố định mỗi 1/4 nhịp.]
- [NEEDS CLARIFICATION: Người **không** giữ bóng di chuyển theo nguyên tắc gì — đuổi theo bóng, giữ cự ly đội hình, hay cả hai? Và mạnh tới đâu? Spec 005 đang cho cả khối co về phía bóng tối đa **một phần mười chiều dài sân** (AC-30.4); con số ấy giữ nguyên, tăng, hay thay bằng nguyên tắc khác?]
- [NEEDS CLARIFICATION: Chuyền khác sút thế nào **trên hình**? Khác tốc độ, khác độ cong, hay có thêm dấu hiệu gì? Và một cú sút trượt/bị cản thì bóng dừng ở đâu?]
- [NEEDS CLARIFICATION: Ở mức **Rất nhanh** (20ms một phút trận) spec 005 đã thôi nội suy và tắt dao động (AC-29.4). Mô hình giữ bóng có tắt theo không, hay vẫn chạy ở dạng rút gọn?]
- [NEEDS CLARIFICATION: Có thêm một mức tốc độ **chậm hơn nữa** (ví dụ 2000ms một phút trận) để xem cho rõ pha dẫn bóng không? Hiện mức chậm nhất là 1000ms, mặc định từ spec 005.]
- [NEEDS CLARIFICATION: Ngân sách vẽ — mô hình mới dựng bao nhiêu mốc mỗi nhịp là còn giữ được "mỗi khung gọn trong một nhịp ở cả bốn mức"? Có mức nào phải giảm số mốc không?]
- [NEEDS CLARIFICATION: Khi dòng tường thuật **không nêu ai tham gia** (hoặc nêu người của cả hai đội, như một pha tranh chấp), ai được coi là đang giữ bóng? Cần một quy tắc tất định, vì quyền giữ bóng nhảy lung tung giữa hai nhịp sẽ làm bóng giật.]
- [NEEDS CLARIFICATION: "Người xem nhận ra ai đang giữ bóng bằng một kênh không phải màu" (AC-33.4) — bằng cách nào? Vòng sáng quanh điểm, dấu hình, hay chính việc bóng nằm sát chân đã đủ?]
- [NEEDS CLARIFICATION: Nếu chốt đổi engine (câu hỏi 1), thì những trận đã lưu theo `DB_VERSION` = 3 và `PHIEN_BAN_ENGINE` = 5 xử lý thế nào — vẫn đấu lại được, hay mất nút đấu lại? Hiến pháp P3 nói dữ liệu người dùng là bất khả xâm phạm.]
- [NEEDS CLARIFICATION: Spec 005 còn T518 và T519 chưa xong. Spec 006 làm song song, hay đóng 005 trước rồi mới bắt đầu? Nếu song song thì T518 của 005 ("người dùng xem và phán") đánh giá bản nào?]

## 9. Giả định

- Engine vẫn phát **một dòng mỗi phút trận**, kèm vùng, đường bóng và danh sách người
  tham gia. Nếu giả định này đổi (câu hỏi mở 1 chốt theo hướng đổi engine) thì mục 1
  và nhiều AC phải viết lại.
- Mọi thứ spec 005 đã dựng còn nguyên và còn đúng: lớp nội suy có đường cong, dao động
  chờ, co khối theo bóng, bóng đi hết đường chuyền, thủ môn ở nhà, bốn hàng xen kẽ,
  hiệu ứng bàn thắng, nhịp lặng sau bàn thắng.
- Người dùng xem chủ yếu ở mức **Chậm**; các mức nhanh hơn là để tua, không phải để
  ngắm. Mọi AC về "nhìn ra được" vì thế đo ở mức Chậm trừ khi nói khác.
- Sân vẫn là 2D dạng điểm, 100×64 đơn vị, một cầu thủ là một điểm bán kính 3,4.

## 10. Quan hệ với spec 005 — những gì PHẢI giữ

Spec 005 chưa đóng, và spec này **không** thay thế AC nào của nó. Ngược lại: spec 005
đã trả giá bằng sáu lát cắt để dựng được những bất biến dưới đây, và spec 006 phải
kiểm lại **từng cái** trước khi đóng.

| AC của spec 005 | Vì sao spec 006 dễ làm hỏng nó |
|---|---|
| AC-28.5 — tạm dừng thì mọi chuyển động dừng hẳn | Mô hình giữ bóng thêm một nguồn chuyển động mới; nó phải tắt theo |
| AC-29.3 — đổi tốc độ giữa trận không giật | Mốc trung gian làm việc "chặng đang đi" phức tạp hơn |
| AC-29.4 — mức nhanh nhất thôi nội suy | Xem câu hỏi mở (6) |
| AC-30.1 — không phanh ở mốc | Mốc trung gian là **thêm mốc**, tức thêm chỗ để phanh |
| AC-30.5 — không điểm nào chồng khít | Dẫn bóng kéo người giữ bóng ra khỏi lưới vùng, nên lưới cũ không còn canh được |
| AC-30.7 — thủ môn ở một phần ba sân nhà | Thủ môn cũng có thể thành người giữ bóng |
| AC-30.8 — bốn hàng hai đội xen kẽ đúng thứ tự | Người không bóng di chuyển mạnh hơn thì thứ tự hàng dễ đảo |
| AC-30.10 / AC-30.11 — tốc độ gần đều, không vòng rộng | Vừa sửa xong ở Phase 46; mốc trung gian đổi đúng hai con số này |
| AC-31.1 — giảm chuyển động tắt mọi lớp | Lớp mới phải tắt theo |
| AC-31.2 — mọi con số của trận không đổi | Ràng buộc gốc, và là lý do mục 1 ghi non-goal đầu tiên |
| AC-31.3 / AC-31.4 — hai ngân sách | Mốc trung gian là việc tính thêm mỗi nhịp |
| AC-31.7 — ẩn/hiện sân không chạy lại chặng cũ | Trạng thái "ai giữ bóng" cũng phải sống sót qua lần dựng lại |
| AC-32.1 → AC-32.3 — bóng luôn có mặt, đúng chỗ | Mô hình mới quyết định chỗ của bóng, nên nó **thay** đường cũ |
| AC-32.4 → AC-32.6 — hiệu ứng bàn thắng và nhịp lặng | Bóng vào lưới giờ là một pha có người sút |
| AC-32.8 — bóng trông ra quả bóng | Giữ nguyên hình, chỉ đổi cách nó di chuyển |

Và hai AC của spec đã đóng trước đó, đã cứu spec 005 bốn lần nên phải nhắc lại ở đây:

- **AC-15.2 của spec 002** — không điểm nào chồng khít tới mức đếm thiếu người.
- **AC-10.2 của spec 001**, mệnh đề thứ nhất — người tham gia tình huống phải có mặt ở
  vùng có bóng. *(Mệnh đề "kèm đường đi của bóng" đã được spec 005 thay thế: bóng tự
  đi đường của nó, không vẽ đường kẻ.)*
