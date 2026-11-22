# Spec: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **ID** | `006-ball-carrier-motion` |
| **Status** | Planned (2026-11-19) |
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
  > **Chốt ngày 2026-11-19:** "không đổi engine" của bốn spec trước ở spec này có
  > nghĩa là **không đổi kết quả**, không phải "không chạm file". Được phép cho dữ
  > liệu engine **đã tính sẵn** đi kèm ra ngoài; không được rút thêm một số ngẫu
  > nhiên nào, không được đổi một kết cục nào. `PHIEN_BAN_ENGINE` vì thế **giữ 5**.
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
- [ ] AC-33.4 — KHI một cầu thủ đang giữ bóng THÌ quanh điểm của anh ta PHẢI có một **vòng sáng** riêng, và vòng ấy PHẢI chuyển sang người khác đúng lúc quyền giữ bóng đổi. Dấu hiệu này PHẢI đọc được mà không dựa vào màu (hiến pháp P9), và PHẢI không lẫn với viền vàng của người tham gia tình huống hay dấu ▲ đã có từ spec 001.
- [ ] AC-33.6 — KHI người dùng muốn ngắm một pha dẫn bóng THÌ PHẢI có một mức tốc độ **2000ms một phút trận** — chậm gấp đôi mức chậm nhất hiện nay — với nhãn đủ tiếng Việt và tiếng Anh, chọn được bằng bàn phím.
- [ ] AC-33.5 — KHI không ai giữ bóng (bóng đang bay giữa hai người, hoặc bóng ở giữa sân trước giờ bóng lăn) THÌ ứng dụng PHẢI vẫn vẽ bóng đúng chỗ của nó và KHÔNG được gán nhầm cho một cầu thủ.

### US-34: Dẫn bóng và qua người

Là một **người dùng**, tôi muốn **thấy cầu thủ chạy với bóng trong chân và đi vòng
qua người cản**, để **một pha đi bóng trông như một pha đi bóng chứ không như hai
điểm bị dịch chỗ**.

**Acceptance criteria:**

- [ ] AC-34.1 — KHI người giữ bóng phải đi một quãng dài trong một nhịp THÌ PHẢI thấy **người và bóng cùng đi** suốt quãng ấy, với khoảng cách giữa hai điểm luôn dưới một bán kính (AC-33.1).
- [ ] AC-34.2 — KHI dòng tường thuật kể một bước là **rê bóng** THÌ trên sân PHẢI thấy người giữ bóng tự mang bóng đi qua bước ấy — không phải một đường chuyền — và anh ta PHẢI **đi vòng** qua điểm của bất kỳ đối thủ nào nằm trên đường đi, chứ KHÔNG đi xuyên qua: hai điểm KHÔNG được chồng khít tới mức người xem chỉ thấy một (giữ AC-30.5 của spec 005 và AC-15.2 của spec 002).

  > **"Qua người" là chuyện THẬT của trận, không phải cách vẽ** (chốt 2026-11-19).
  > Engine đã phân loại từng bước của một pha bóng từ spec 001 — **chuyền, rê bóng,
  > tạt cánh, sút** — nhưng dòng sự kiện phát ra ngoài **vứt mất phần loại**, chỉ
  > giữ danh sách vùng. Spec này cho phần loại đi kèm ra ngoài. Đó là dữ liệu **đã
  > tính sẵn**: không rút thêm số ngẫu nhiên nào, không đổi kết cục nào.
- [ ] AC-34.3 — KHI xem cùng một trận hai lần ở cùng một mức tốc độ THÌ đường dẫn bóng PHẢI giống hệt nhau (hiến pháp P1).
- [ ] AC-34.4 — KHI chuyển động mới đang bật THÌ tỉ số, **từng dòng tường thuật**, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.

### US-35: Chuyền và sút nhìn ra được

Là một **người dùng**, tôi muốn **phân biệt được bằng mắt một đường chuyền, một cú
sút và một pha dẫn bóng**, để **tôi đọc được trận mà không phải dò dòng tường thuật**.

**Acceptance criteria:**

- [ ] AC-35.1 — KHI bóng rời chân (chuyền hoặc sút) THÌ nó PHẢI đi **nhanh hơn người giữ bóng ít nhất hai lần**, nên nó tới đích hẳn trước những cầu thủ đang chạy cùng hướng. *(Ngưỡng hạ từ **ba** xuống **hai** ngày 2026-11-22 — xem nhật ký làm rõ.)*
- [ ] AC-35.2 — KHI một đường chuyền tới một đồng đội THÌ bóng PHẢI tới **đúng chân** người nhận (trong một bán kính điểm), và người ấy PHẢI trở thành người giữ bóng **ngay khi bóng tới**, không sớm hơn.

  > *Làm rõ ngày 2026-11-19 sau `/analyze`, phát hiện số 1.* Engine **không nói ai
  > nhận** một đường chuyền — nó chỉ kể bước ấy là một đường chuyền và đi tới vùng
  > nào. "Người nhận" ở AC này vì thế là một **suy diễn của lớp vẽ** (quyết định
  > D112: đồng đội đứng gần vùng đích nhất), đúng loại suy diễn người dùng đã chấp
  > nhận ở câu hỏi 1 của `/clarify`. Nó tất định và **không đổi một con số nào** của
  > trận; nó không được vào dòng tường thuật hay thống kê.
- [ ] AC-35.3 — KHI dòng tường thuật kể một cú sút THÌ bóng PHẢI đi **về phía khung thành của đội bị sút**, và kết thúc ở nơi dòng ấy kể (vào lưới, ra ngoài, hay thủ môn cản).
- [ ] AC-35.4 — KHI đặt một pha dẫn bóng cạnh một đường chuyền cùng quãng đường THÌ **thời gian đi phải khác nhau ít nhất hai lần**, tức người xem đọc ra được hai thứ khác nhau mà không cần chữ. *(Ngưỡng hạ từ **ba** xuống **hai** ngày 2026-11-22 — xem nhật ký làm rõ.)*
- [ ] AC-35.5 — KHI vẽ một đường chuyền và một cú sút THÌ hai thứ chỉ được khác nhau ở **tốc độ và đích đến**: sút nhanh hơn chuyền và đi về khung thành, chuyền tới chân đồng đội. KHÔNG thêm vệt sáng, không đổi độ cong, không thêm hình vẽ nào khác.

### US-36: Người không có bóng cũng di chuyển có mục đích

Là một **người dùng**, tôi muốn **cả hai đội cùng sống theo trái bóng**, để **sân
không còn cảnh hai mươi người đứng chờ trong khi hai người chạy**.

**Acceptance criteria:**

- [ ] AC-36.1 — KHI trận đang chạy ở một mức còn nội suy THÌ trong **mỗi nhịp**, **mọi** điểm cầu thủ PHẢI đổi chỗ theo một hướng có nghĩa, chứ không chỉ dao động quanh một chỗ cố định.
- [ ] AC-36.2 — KHI người giữ bóng tiến về phía khung thành đối phương THÌ **ít nhất một đồng đội** PHẢI di chuyển lên theo, đủ để người xem thấy có một phương án chuyền.
- [ ] AC-36.6 — KHI một đội đang giữ bóng THÌ **hai bên di chuyển theo hai nguyên tắc khác nhau**, và người xem PHẢI phân biệt được: đồng đội của người giữ bóng **dâng lên mở ra nhận bóng**, còn đối phương **lùi về hoặc ép theo bóng**. Hai đội KHÔNG được trông như một khối duy nhất trượt qua lại.
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
| Dòng kể một pha nhưng không nêu ai tham gia | **Người đang giữ bóng tiếp tục giữ** cho tới khi có dòng nêu người khác. Tất định, và không làm bóng giật |
| Bàn thắng | Bóng kết thúc trong khung thành; hiệu ứng bàn thắng của spec 005 vẫn chạy, và nhịp lặng 1,5 giây vẫn đúng |
| Hết hiệp / khai cuộc | Bóng về điểm giao bóng giữa sân (giữ AC-32.2 của spec 005) |
| Người đang giữ bóng bị thẻ đỏ hoặc bị thay ra | Quyền giữ bóng phải chuyển cho ai đó, hoặc bóng thành "không ai giữ" — KHÔNG được để một điểm ma giữ bóng |
| Bóng đang bay mà nhịp kết thúc | Bóng phải tới đích trước khi tình huống kế tiếp bắt đầu, không được còn bay dở (giữ AC-29.3 của spec 005) |
| Hai pha bóng liền nhau ở hai vùng xa nhau | Bóng đi từ chỗ nó **đang đứng**, không nhảy về điểm đầu của pha mới (giữ cách làm của T524) |
| Tạm dừng | Mọi thứ đóng băng, kể cả bóng và người giữ bóng (giữ AC-28.5) |
| Giảm chuyển động bật | Không nội suy, không dao động, không dẫn bóng — vị trí tại từng mốc vẫn đúng (giữ AC-31.1) |
| Mức Rất nhanh (20ms một phút) | Mô hình giữ bóng **tắt theo**, cùng lúc với nội suy và dao động: ở nhịp ấy mắt không đọc được gì, vẽ thêm chỉ tốn ngân sách |
| Ẩn sân rồi hiện lại | Các điểm và bóng xuất hiện đúng chỗ của thời điểm hiện tại, không chạy lại một cú di chuyển cũ (giữ AC-31.7) |
| Sân 5 người (khung co lại) | Mọi khoảng cách và tốc độ co theo khung, như spec 002 và 005 đã làm |
| Trận lưu từ trước spec này | Mở lại và đấu lại phải cho **đúng kết quả và đúng từng dòng sự kiện** như cũ. Bản ghi cũ **không có loại của từng bước**, nên sân vẽ nó **đúng như spec 005**: bóng đi hết đường, nhưng không dẫn bóng và không có vòng sáng. KHÔNG đoán bù, KHÔNG đòi người dùng đấu lại |
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

**Không còn câu hỏi mở.** Mười hai câu đã chốt ngày 2026-11-19 — xem **Nhật ký làm
rõ** ở cuối tài liệu. Spec sẵn sàng cho `/plan`, nhưng **sau khi spec 005 đóng**
(quyết định số 2).

## 9. Giả định

- Engine vẫn phát **một dòng mỗi phút trận**, kèm vùng, đường bóng và danh sách người
  tham gia — **cộng loại của từng bước** (chuyền / rê bóng / tạt cánh / sút), là thứ
  engine đã tính từ spec 001 nhưng chưa cho ra ngoài.
- **Phần loại ấy đủ để dựng cả bốn user story.** Nếu lúc lập plan phát hiện nó
  **không đủ** — ví dụ cần biết **ai** rê qua **ai** — thì phải dừng và hỏi lại, vì
  thêm dữ liệu **chưa tính sẵn** là một quyết định khác hẳn: nó rút thêm số ngẫu nhiên
  và đổi kết quả trận.
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

## Nhật ký làm rõ

Mười hai câu hỏi mở của mục 8, chốt ngày **2026-11-19** qua ba lượt hỏi.

| # | Câu hỏi | Quyết định | Vào đâu |
|---|---|---|---|
| 1 | Có được đổi engine để biết ai giữ bóng? | **Không đổi engine — suy ở giao diện.** Danh tính người giữ bóng suy từ những thứ dòng sự kiện đã có | mục 1, mục 9 |
| 1b | *(hỏi thêm sau khi đọc engine)* "Không đổi engine" là không chạm file, hay không đổi kết quả? | **Không đổi KẾT QUẢ — chạm file được.** Cho loại của từng bước (chuyền / rê bóng / tạt cánh / sút) đi kèm ra ngoài; `PHIEN_BAN_ENGINE` giữ **5** vì không số nào đổi | mục 1, AC-34.2, mục 9 |
| 2 | "Qua người" là chuyện thật hay cách vẽ? | **Chuyện thật của trận** — và hành động `rê bóng` **đã có sẵn** trong engine từ spec 001, chỉ chưa được cho ra ngoài | AC-34.2 |
| 3 | Đóng spec 005 trước hay làm 006 song song? | **Đóng 005 trước**: T518, T519, rồi gộp vào `main`. Spec 006 chỉ bắt đầu `/plan` sau đó | mục 8 |
| 4 | Dựng mốc trung gian thế nào? | **Mỗi bước của pha bóng là một mốc**, chia đều theo chiều dài. Không bịa mốc | AC-33.2, AC-34.1 |
| 5 | Người không giữ bóng di chuyển theo nguyên tắc gì? | **Hai nhóm khác nhau**: đồng đội dâng lên mở ra nhận bóng, đối phương lùi về hoặc ép theo bóng | AC-36.2, AC-36.6 |
| 6 | Ai giữ bóng khi dòng không nêu ai? | **Giữ nguyên người cũ** cho tới khi có dòng nêu người khác | mục 5 |
| 7 | Chuyền khác sút thế nào trên hình? | **Chỉ khác tốc độ và đích đến.** Không vệt sáng, không đổi độ cong | AC-35.5 |
| 8 | Mức Rất nhanh có tắt mô hình mới? | **Tắt theo**, cùng lúc với nội suy và dao động | mục 5 |
| 9 | Có thêm một mức chậm hơn 1000ms? | **Có — thêm mức 2000ms một phút trận**, thành năm mức | AC-33.6 |
| 10 | Ngân sách: bao nhiêu mốc mỗi nhịp? | **Không cần hỏi nữa** sau quyết định 4: số mốc **chính là số bước của pha bóng**, do engine quyết. Hai ngân sách ở mục 6 giữ nguyên và là lưới chặn | mục 6 |
| 11 | Dấu hiệu "ai đang giữ bóng"? | **Thêm vòng sáng quanh điểm** người giữ bóng, không dựa vào màu | AC-33.4 |
| 12 | Trận đã lưu (thiếu loại bước) xem ra sao? | **Xem như bây giờ**: rơi về cách vẽ của spec 005. Không đoán bù, không đòi đấu lại | mục 5 |

**Một phát hiện làm đổi câu hỏi, đáng ghi lại.** Câu 1 và câu 2 lúc đầu mâu thuẫn
nhau: người dùng chọn "không đổi engine" nhưng cũng chọn "qua người là chuyện thật",
mà cách tôi đặt câu hỏi nói hai thứ ấy loại trừ nhau. Đọc lại engine thì thấy câu hỏi
của tôi sai, không phải câu trả lời: `chuoiBong.ts` **đã** phân loại từng bước thành
`chuyen | re-bong | tat-canh | sut` từ spec 001, và `tran.ts:720` còn ghi rõ `duongBong`
là "dẫn xuất thuần từ `cacHanhDong`, không rút thêm số nào" — rồi **vứt mất phần
loại** khi phát ra ngoài. Nên "qua người" là chuyện thật của trận **mà không cần
đổi một con số nào**; thứ duy nhất phải hỏi lại là nghĩa của chữ "không đổi engine",
và câu 1b chốt nó.

## Nhật ký làm rõ — bổ sung 2026-11-22

Người dùng xem bản chạy ở T617 và xin **hạ ngưỡng của AC-35.1 và AC-35.4 từ ba lần xuống
hai lần**: *"đường bóng chậm hơn nữa"*.

**Số đo trước khi đổi**, ở mức Chậm trên 10 mã trận: tốc độ quả bóng trên mỗi đoạn có trung
vị **152 đơn vị/giây** — trên một sân rộng 100, tức bóng băng hết chiều ngang sân trong
**0,66 giây**. Phân vị 90 là **342** và lớn nhất **728**.

**Cái giá đã nói trước khi họ chốt**: ba lần là tỉ lệ chính họ chọn ở `/clarify`, và nó là
**toàn bộ** cách giao diện phân biệt một đường chuyền với một pha rê bóng — không vệt sáng,
không đổi độ cong, chỉ tốc độ. Hạ xuống hai làm hai thứ ấy gần nhau hơn. Người dùng chốt
đổi sau khi nghe điều đó.

**Một chi tiết đã đo và tỉ lệ KHÔNG chữa được**: **41,2% số pha có hơn ba đoạn**, và lớp
dòng thời gian nén mọi đoạn cho vừa một nhịp. Đó mới là chỗ sinh ra cái đuôi 342–728 — một
đường chuyền đơn lẻ đi ở 152, còn một pha mười ba đoạn bay ở 728. Hạ tỉ lệ làm cả hai chậm
đi một phần ba, nhưng không làm phẳng cái đuôi ấy.

**Vì sao sửa thẳng vào AC**: spec 006 **còn mở**, nên AC của nó sửa được. Đây khác hẳn
trường hợp D116 — ở đó AC-30.4 thuộc spec 005 **đã đóng**, nên quyết định chỉ thay con số
đang chạy chứ không sửa ngược tài liệu đã khoá.
