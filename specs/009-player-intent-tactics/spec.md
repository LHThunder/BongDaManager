# Spec: Mỗi cầu thủ có một mục đích — khối đội hình, thể lực và quyết định riêng

| | |
|---|---|
| **ID** | `009-player-intent-tactics` |
| **Status** | Draft |
| **Created** | 2026-11-27 |
| **Branch** | `009-player-intent-tactics` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

---

## 1. Vấn đề & mục tiêu

**Vấn đề.** Người dùng xem trận ở chế độ liên tục và nói, trong ba lượt xem khác nhau:

> *"tôi thấy bị đè lên nhau"* · *"di chuyển của cầu thủ quá máy móc và dính liền đến nhau"* ·
> *"vị trí của cầu thủ quá cứng ngắc"* · *"tiền đạo luôn ở trong tư thế việt vị"* ·
> *"tôi muốn mỗi cầu thủ trên sân sẽ có suy nghĩ và chuyển động khác nhau"*

Ba lượt xem ấy sinh ra bốn hạng mục ở spec 007, ba trong bốn đã trả. Phần còn lại **không vá
được bên trong mô hình hiện tại**, và ba con số dưới đây nói vì sao:

| Số đo (2026-11-26 → 27) | Giá trị | Nghĩa |
|---|---|---|
| Người đứng cao nhất của đội tấn công đứng **trên** người thấp nhất ngoài thủ môn của đội kia | **99,6%** số lượt, trung vị **10,3 m** | Hai đội **không nhìn thấy nhau** |
| Hai mươi hai vectơ dịch chuyển giữa hai mốc liên tiếp | **song song** với nhau | Không ai **đi hướng riêng** |
| Số điểm đích khác nhau cho 22 người *(trước khi vá)* | **8** | Đội hình là một **lưới ô**, không phải một đội bóng |
| Số lượt người không tham gia **đứng im hoàn toàn** giữa hai mốc *(spec 007 đo)* | **28,2%** | Một phần ba sân không làm gì |

Gốc chung: hôm nay mỗi người chỉ có **một quy tắc duy nhất** — đứng ở ô sơ đồ của mình, rồi
dịch một phần về phía bóng. Quy tắc ấy không có **mục đích**, không có **đối thủ**, và không
có **lý do** để hai người cạnh nhau làm hai việc khác nhau.

**Mục tiêu.** Sau spec này, **mỗi cầu thủ có một mục đích gọi tên được ở mỗi khoảnh khắc**, và
mục đích ấy giải thích được chuyển động của anh ta. Hai hệ quả phải thấy được bằng mắt:

- Hai cầu thủ ở gần nhau, cùng một thời điểm, **đi hai hướng khác nhau** vì hai mục đích khác nhau.
- Người đá cao nhất **lùi về ngang hàng thủ đối phương** thay vì đứng chờ sau lưng họ cả trận.

**Non-goals** — ghi rõ để chặn scope creep:

- **Luật việt vị và mọi luật thi đấu khác.** Spec này làm cầu thủ **không tự đặt mình** vào vị
  trí việt vị; nó **không** thổi phạt ai. Việt vị, đá phạt, phạt đền, VAR, ném biên, bù giờ
  thuộc **spec 008**. *(Spec 009 sửa **hình dạng**; spec 008 áp **luật**.)*
- **Nhịp trận và thống kê cả trận.** Bóng lăn 55–60 phút, phân bổ cường độ, sự không hoàn hảo,
  xG, kể trận theo đoạn 15 phút — **spec 010**.
- **Mọi thứ hiển thị.** Nhịp khung hình, cách vẽ, màu, nhãn — **spec 011**. Spec này không yêu
  cầu hiện mục đích ra màn hình; nó chỉ yêu cầu mục đích **đọc được trong dữ liệu trận xuất
  ra**. *(Xem câu hỏi mở số 9 nếu muốn hiện ra.)*
- **Chế độ theo phút.** Mọi thứ ở đây chỉ chạm **chế độ liên tục**. Trận theo phút giữ nguyên
  từng dòng.
- **Quân số khác 11.** Chế độ liên tục đã khoá ở sân 11 người; spec này không mở khoá.
- **Chỉ số mới cho cầu thủ.** Mặc định **không thêm**, vì thêm một chỉ số là bắt người dùng
  nhập lại cho mọi cầu thủ đã có. *(Câu hỏi mở số 5 và số 8.)*
- **Huấn luyện viên máy đổi sơ đồ giữa trận.** *"Đổi sơ đồ phải có lý do"* nằm trong bản mô tả
  gốc nhưng cần một tác nhân ra quyết định ở cấp **đội**, không phải cấp **người**. Để lại cho
  một spec sau.
- **Hướng người, tầm nhìn 180°, phản ứng 0,2–0,3 giây, quét trước khi nhận bóng.** Bản mô tả
  gốc giao chúng cho spec 009, nhưng chúng là một **lớp tri giác** riêng, và mỗi thứ đều nhân
  thêm việc cho 22 người ở mỗi mốc — trong khi ngân sách thời gian **đã vượt trước khi spec
  này bắt đầu** (mục 6). Để lại, và nói rõ ở đây thay vì im lặng. *(Câu hỏi mở số 7.)*
- **Chấn thương làm hỏng dữ liệu cầu thủ người dùng đã nhập.** Chấn thương (AC-40.14) chỉ sống
  **trong một trận**; nó PHẢI KHÔNG ghi gì vào hồ sơ cầu thủ.

---

## 2. Người dùng & bối cảnh

- **Ai dùng:** người dùng duy nhất của ứng dụng, đang ở **vòng lặp 1 — huấn luyện viên**: họ
  dựng hai đội, chọn chiến thuật, rồi **xem** trận để kiểm chứng chiến thuật của mình.
- **Khi nào dùng:** mỗi lần xem một trận ở chế độ liên tục — tức mỗi lần họ muốn **tin** vào
  kết quả chứ không chỉ đọc tỉ số.
- **Vì sao nó quan trọng với đúng người này:** hiến pháp mục 1 nói giá trị cốt lõi của vòng lặp
  1 là *"kết quả phải phản ánh được chiến thuật và chỉ số do người dùng nhập"*. Một đội hình mà
  cả 22 người cùng trôi theo bóng **không phản ánh** chiến thuật nào — nó trông giống hệt nhau
  với mọi sơ đồ.
- **Thiết bị:** máy cá nhân, một người, offline. Không đổi.

---

## 3. Hai danh mục đóng

> Ba nhóm acceptance criteria ở mục 4 treo trên hai danh mục này, nên chúng được **liệt kê
> bằng tên ngay tại đây** chứ không để ở một tài liệu khác. Mỗi mục dưới đây là một **mã định
> danh** của miền, không phải một nhãn hiển thị — nhãn song ngữ, nếu cần, thuộc câu hỏi mở số 9.

### 3.1 Danh mục MỤC ĐÍCH (người không cầm bóng)

Bản mô tả gốc liệt kê chín kiểu. Spec này lấy **bốn**, và **năm kiểu còn lại vào Non-goals của
chính danh mục** — chúng là chi tiết của cùng một cơ chế, thêm sau không phải viết lại:

| Mã định danh | Nghĩa |
|---|---|
| `giu-vi-tri` | Đứng ở chỗ của mình có chủ đích, kéo giãn đội hình đối phương |
| `chay-cho-sau-lung` | Lao vào khoảng trống sau hàng thủ, **canh thời điểm để không vượt người cuối cùng** |
| `kem-nguoi` | Bám một đối thủ cụ thể, giữ khoảng cách dưới một ngưỡng |
| `lui-ve-giu-khoi` | Lùi về cho khối đội hình gọn lại khi đội mình không có bóng |

**Không làm lần này** *(ghi ra để không ai tưởng bị quên)*: chồng biên, chồng trong, người thứ
ba, chạy nghi binh, chạy cắt mặt cột gần / cột xa.

**Thủ môn** có danh mục riêng, tối thiểu: `giu-khung`, `bo-tro-hang-thu`.

### 3.2 Danh mục HÀNH ĐỘNG (người chạm bóng)

Bản mô tả gốc liệt kê sáu nhóm lớn. Spec này lấy **năm hành động**, mỗi hành động là một kết
cục quan sát được:

| Mã định danh | Nghĩa |
|---|---|
| `khong-che` | Nhận bóng và giữ được quyền kiểm soát |
| `chuyen-ngan` | Chuyền tới đồng đội trong một khoảng ngắn |
| `chuyen-dai` | Chuyền vượt tuyến hoặc đổi cánh |
| `dan-bong` | Đưa bóng đi cùng mình |
| `dut-diem` | Sút hoặc đánh đầu về khung thành |

**Thủ môn** thêm: `bat-bong`, `pha-bong`, `phat-bong`.
**Phòng ngự** thêm: `ap-sat`, `cat-duong-chuyen`.

**Không làm lần này**: mọi phân loại nhỏ hơn trong từng nhóm (sút cuộn / sút căng / vô lê; tạt
sớm / tạt cột gần / tạt cột xa; đảo chân / ngoặt bóng / che bóng…).

---

## 4. User stories

> **Vì sao US-40 và US-41, và vì sao theo thứ tự này.** Spec 006 (dòng 20) chuyển món nợ
> **AC-36.1** sang *"spec 009, US-41"*; spec 007 (dòng 984) viết *"Đây là **US-41**: mỗi người
> không cầm bóng phải có một mục đích gọi tên được"*; và spec 007 (dòng 971) đã cấp
> **AC-40.4** cho *"3–5 giây phản pressing hoặc lùi về"*. Cả ba đều được giữ nguyên ở đây:
> **US-41 = mục đích di chuyển**, **AC-40.4 = phản pressing**.
> *(Bản nháp đầu của spec này đảo hai số ấy và lấy mất AC-40.4. Ghi lại để không ai sửa ngược.)*

### US-40: Đội chơi như một khối có hình dạng, và khối ấy mệt dần

Là một **người xem trận đấu**, tôi muốn **nhìn thấy một đội hình có hình dạng — nó co lại khi
mất bóng, dịch theo phía có bóng, và rã dần khi cầu thủ mệt**, để **tôi tin rằng sơ đồ tôi
chọn có ảnh hưởng tới những gì đang diễn ra**.

**Acceptance criteria**

*Hình dạng khối:*

- [ ] AC-40.1 — KHI đội không có bóng và bóng đang ở phần sân của họ THÌ khoảng cách **dọc sân**
      từ người thấp nhất tới người cao nhất trong **mười cầu thủ ngoài thủ môn** PHẢI nằm trong
      **30–40 m**, ở ít nhất **70%** số mốc thoả điều kiện.
- [ ] AC-40.2 — KHI cùng điều kiện ấy THÌ khoảng cách **ngang sân** của cùng mười người PHẢI
      nằm trong **35–45 m**, ở ít nhất **70%** số mốc thoả điều kiện.
- [ ] AC-40.3 — KHI bóng dịch sang một biên THÌ tâm ngang của khối mười người PHẢI dịch cùng
      chiều: hệ số tương quan giữa toạ độ ngang của bóng và tâm ngang của khối, đo trên cả
      trận, PHẢI **từ 0,6 trở lên**.
- [ ] AC-40.4 — KHI một đội vừa **mất bóng** THÌ trong **3–5 giây** kế tiếp đội ấy PHẢI làm một
      trong hai việc, và việc đã chọn PHẢI đọc được trong dữ liệu trận: **ép lại ngay** (ít
      nhất hai người giảm khoảng cách tới người cầm bóng mới) hoặc **lùi về giữ khối** (tâm dọc
      của khối lùi về phía khung thành nhà).
      > Số hiệu và nội dung của AC này do spec 007 (dòng 971) cấp, ngày 2026-11-22.
- [ ] AC-40.5 — KHI đội đang có bóng THÌ khoảng cách **ngang sân** của mười người ngoài thủ môn
      PHẢI **lớn hơn** so với khi chính đội ấy không có bóng, đo trung bình trên cả trận, chênh
      lệch PHẢI **từ 5 m trở lên**.

*Thể lực:*

- [ ] AC-40.6 — KHI một trận bắt đầu THÌ mỗi cầu thủ PHẢI có thể lực **100**.
- [ ] AC-40.7 — KHI trận diễn ra THÌ thể lực PHẢI giảm đơn điệu theo quãng đường đã chạy và
      cường độ chạy; PHẢI KHÔNG có mốc nào thể lực tăng trong khi trận đang chạy.
- [ ] AC-40.8 — KHI thể lực của một cầu thủ xuống **dưới 60** THÌ tốc độ tối đa của anh ta PHẢI
      giảm **10%** so với lúc đầu trận.
- [ ] AC-40.9 — KHI thể lực giảm qua ngưỡng ấy THÌ sự thay đổi tốc độ PHẢI **không nhảy bậc**:
      tốc độ lớn nhất giữa hai mốc liên tiếp PHẢI KHÔNG giảm quá **1 m/s**.
- [ ] AC-40.10 — KHI một trận **90 phút** kết thúc THÌ quãng đường của mỗi cầu thủ đá trọn trận
      PHẢI nằm trong **9–12 km**.
      > ⏳ **Hợp đồng có ngày hết hạn.** Spec 010 đặt phân bổ cường độ (đứng và đi 35–45%, chạy
      > chậm 35–45%, chạy nhanh 10–15%, nước rút 2–5%), và tổng quãng đường là **hàm của** phân
      > bổ ấy. Khi spec 010 tới, dải này PHẢI được **đo lại**, không được coi là bất biến.
- [ ] AC-40.11 — KHI cùng trận ấy kết thúc THÌ quãng đường của thủ môn PHẢI nằm trong **5–6 km**.
- [ ] AC-40.12 — KHI một cầu thủ được thay ra THÌ người vào sân PHẢI có thể lực **từ 90 trở
      lên** và người rời sân PHẢI có thể lực **từ 70 trở xuống**, ở ít nhất **80%** số lượt thay
      người do máy quyết định.
- [ ] AC-40.13 — KHI thể lực xuống tới mức thấp nhất THÌ tốc độ tối đa của cầu thủ ấy PHẢI
      KHÔNG xuống dưới **4 m/s**, và PHẢI KHÔNG bao giờ âm hay bằng 0.
      > Con số **4** lấy neo từ spec 007: đó đúng là trần tốc độ **chạy lùi** của AC-38.4. Một
      > người kiệt sức không được chậm hơn chính mình lúc chạy giật lùi.
- [ ] AC-40.14 — KHI mô phỏng **từ 20 mã trận trở lên** THÌ số chấn thương **trung bình** mỗi
      trận PHẢI nằm trong **0–1**; một trận lẻ được phép nhiều hơn.
- [ ] AC-40.15 — KHI một cầu thủ dính chấn thương THÌ việc đó PHẢI **chỉ sống trong trận ấy**:
      hồ sơ cầu thủ do người dùng nhập PHẢI KHÔNG đổi một trường nào.
- [ ] AC-40.16 — KHI 15 phút cuối trận bắt đầu VÀ một đội đang dẫn THÌ tâm dọc khối của đội dẫn
      PHẢI lùi về phía khung thành nhà so với trung bình của chính họ ở 15 phút trước đó, và
      chênh lệch PHẢI **từ 3 m trở lên**.

### US-41: Mỗi người không cầm bóng có một mục đích gọi tên được

Là một **người xem trận đấu**, tôi muốn **mỗi cầu thủ di chuyển vì một lý do tôi gọi tên
được**, để **những gì tôi thấy là một đội bóng đang chơi, không phải 22 điểm cùng trôi về phía
quả bóng**.

> Story này đóng món nợ **AC-36.1** của spec 006 (*"mọi điểm di chuyển có mục đích"*), được
> chuyển sang đây ngày 2026-11-22. AC đóng nó là **AC-41.1** cộng **AC-41.3**.

**Acceptance criteria**

*Mục đích, và việc nó phải khác nhau giữa người với người:*

- [ ] AC-41.1 — KHI hệ thống tính một mốc THÌ **mỗi** cầu thủ không cầm bóng PHẢI mang đúng
      **một** mục đích thuộc danh mục ở mục 3.1.
- [ ] AC-41.2 — KHI cùng điều kiện ấy THÌ mục đích của từng người PHẢI có trong **dữ liệu trận
      xuất ra**, ở mọi mốc, dưới dạng **mã định danh** của danh mục.
- [ ] AC-41.3 — KHI đo trên một trận đầy đủ THÌ ở ít nhất **80%** số mốc PHẢI có **từ 3 mục
      đích khác nhau trở lên** đang cùng diễn ra trên sân.
      *(Hôm nay con số này là **1**, ở 100% số mốc.)*
- [ ] AC-41.4 — KHI đo hướng dịch chuyển của 22 cầu thủ giữa hai mốc liên tiếp THÌ ở ít nhất
      **70%** số cặp mốc PHẢI có **ít nhất hai nhóm hướng** cách nhau trên **90°**, trong đó
      *nhóm hướng* là một tập vectơ lệch nhau dưới **45°** và chỉ tính vectơ dài trên **0,2 m**.
      *(Hôm nay con số này là **0%**: 22 vectơ song song tuyệt đối.)*
- [ ] AC-41.5 — KHI một cầu thủ đổi mục đích THÌ chuyển động của anh ta PHẢI KHÔNG nhảy bậc:
      tốc độ và hướng ở mốc ngay sau PHẢI vẫn nằm trong mọi trần cơ học của spec 007.
- [ ] AC-41.6 — KHI đo số lượt người không tham gia **đứng im hoàn toàn** giữa hai mốc THÌ tỉ
      lệ ấy PHẢI **dưới 10%**. *(Spec 007 đo được **28,2%**.)*

*Hình dạng so với đối phương:*

- [ ] AC-41.7 — KHI đo người của đội đang tấn công có toạ độ dọc **gần khung thành đối phương
      nhất** THÌ số mốc anh ta đứng **vượt qua** người của đội phòng ngự có toạ độ dọc gần
      khung thành nhà họ nhất **ngoài thủ môn** PHẢI **dưới 20%**.
      *(Hôm nay: **99,6%**, trung vị vượt **10,3 m**.)*
      > ⏳ **Định nghĩa tạm, và nó được nói rõ là tạm.** Luật thật xét **người thứ hai từ cuối**
      > và chỉ **tại thời điểm chạm bóng**; spec 008 mang luật ấy vào và sẽ **thay** định nghĩa
      > này. Ở đây đo ở **mọi mốc** vì spec 009 nói về **hình dạng**, không về luật.

*Người cầm bóng:*

- [ ] AC-41.8 — KHI một cầu thủ chạm bóng THÌ hành động được chọn PHẢI thuộc danh mục ở mục 3.2,
      và PHẢI có trong dữ liệu trận xuất ra dưới dạng mã định danh.
- [ ] AC-41.9 — KHI một cầu thủ đang **dẫn bóng** THÌ khoảng cách giữa anh ta và quả bóng PHẢI
      dưới **2 m** ở mọi mốc của pha dẫn.
- [ ] AC-41.10 — KHI một cầu thủ **chuyền bóng** THÌ anh ta PHẢI KHÔNG lấy quả bóng đang bay làm
      đích; khoảng cách từ anh ta tới bóng PHẢI tăng đơn điệu trong quãng bóng bay.
- [ ] AC-41.11 — KHI một đường chuyền đang bay THÌ PHẢI có **đúng một** đồng đội giảm khoảng
      cách tới **điểm bóng sẽ tới**, và anh ta PHẢI ở trong **3 m** của điểm ấy khi bóng tới.
- [ ] AC-41.12 — KHI một cầu thủ quyết định chạm bóng THÌ nhánh đã chọn PHẢI thuộc một tập đóng
      bốn nhánh — *dứt điểm*, *chuyền cho người ở vị trí tốt hơn*, *dẫn lên*, *giữ hoặc chuyền
      lùi* — và nhánh ấy PHẢI đọc được trong dữ liệu trận xuất ra.
- [ ] AC-41.13 — KHI đo trên một trận đầy đủ THÌ **cả bốn** nhánh của AC-41.12 PHẢI xuất hiện ít
      nhất một lần; PHẢI KHÔNG có nhánh nào chết.

*Phòng ngự:*

- [ ] AC-41.14 — KHI đội đối phương cầm bóng THÌ PHẢI có **ít nhất một** cầu thủ mang mục đích
      `kem-nguoi` nhắm vào người cầm bóng, ở ít nhất **90%** số mốc đội ấy giữ bóng.
- [ ] AC-41.15 — KHI một cầu thủ mang mục đích ấy THÌ khoảng cách của anh ta tới người cầm bóng
      PHẢI giảm qua các mốc cho tới khi dưới **2 m**, hoặc cho tới khi bóng đổi chủ.
- [ ] AC-41.16 — KHI một đường chuyền được thực hiện THÌ nó PHẢI có khả năng **bị cắt**: trên
      một trận đầy đủ, số đường chuyền hỏng vì có đối phương chắn đường PHẢI **lớn hơn 0**.

*Áp lực và chỉ số:*

- [ ] AC-41.17 — KHI có đối phương trong bán kính **2 m** lúc một cầu thủ chạm bóng THÌ tỉ lệ
      thành công của hành động ấy PHẢI thấp hơn cùng hành động không bị áp lực **15–30%**, đo
      trên ít nhất **200 lần chạm** mỗi nhóm.
- [ ] AC-41.18 — KHI hai cầu thủ có chỉ số liên quan chênh nhau **từ 20 điểm trở lên** cùng thực
      hiện một hành động ở cùng độ khó THÌ người có chỉ số cao hơn PHẢI thành công nhiều hơn
      **ít nhất 10 điểm phần trăm**, đo trên ít nhất **20 mã trận**.

---

## 5. Luồng chính (happy path)

1. Người dùng chọn hai đội, chọn **chế độ liên tục**, bắt đầu trận → hệ thống chạy trận.
2. Người dùng xem sân → **mỗi cầu thủ di chuyển vì một mục đích**; hai người cạnh nhau có thể
   đi hai hướng khác nhau.
3. Bóng dạt sang cánh phải → khối của đội không bóng **dịch sang phải** và **co lại**.
4. Một cầu thủ dẫn bóng → **quả bóng đi theo chân anh ta**.
5. Anh ta chuyền → **anh ta ở lại**, quả bóng đi, và **đúng một đồng đội** chạy tới đón.
6. Mất bóng → trong 3–5 giây đội ấy **ép lại** hoặc **lùi về giữ khối**.
7. Phút 70, một hậu vệ đã chạy 10 km → anh ta **chạy chậm hơn**; người dùng thay anh ta ra và
   thấy người mới nhanh hơn rõ.
8. Hết trận → người dùng xuất dữ liệu trận và đọc được, ở từng mốc, **mục đích** của từng người
   và **hành động** của mỗi lần chạm bóng.

---

## 6. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| **Không ai ở vị trí nhận bóng** (bị kèm hết) | Người cầm bóng PHẢI chọn nhánh *giữ hoặc chuyền lùi* của AC-41.12, KHÔNG đứng im chờ; nhánh ấy PHẢI có trong dữ liệu |
| **Một đội còn 9–10 người** (thẻ đỏ) | Mục đích PHẢI phân lại cho số người còn lại; PHẢI KHÔNG có hai người cùng kèm một đối thủ, và AC-41.14 PHẢI vẫn đúng |
| **Thủ môn cầm bóng** | Thủ môn dùng danh mục riêng ở mục 3; và **AC-30.7 của spec 005** PHẢI còn đúng ở ngưỡng hiện hành (ở trong một phần ba sân nhà ở ≥ 99,9% số mốc, lệch tối đa 2,5 m) |
| **Bóng chết** | Mọi người PHẢI có một mục đích hợp lệ; PHẢI KHÔNG ai tiếp tục kèm một quả bóng không ai cầm |
| **Hai người cùng nhắm một khoảng trống** | PHẢI chỉ một người đi; phép đo "không hai người chồng nhau" đã đạt ở spec 007 PHẢI còn đúng |
| **Thể lực chạm đáy** | AC-40.13: có sàn tốc độ, PHẢI KHÔNG dừng hẳn |
| **Trận 20 phút** (thời lượng ngắn nhất) | Thể lực và quãng đường PHẢI co theo thời lượng; dải 9–12 km của AC-40.10 chỉ ràng trận **90 phút** |
| **Thay người + thẻ đỏ + bóng chết cùng một phút** | Chuỗi can thiệp của người dùng ở độ phân giải **phút** PHẢI còn sinh lại được đúng từng khung hình, kể cả khi mục đích được tính ở độ phân giải nhỏ hơn một phút |
| **Mã trận đã lưu trước spec này** | Xem câu hỏi mở số 1 — đây là chỗ P1/P3 có thể vỡ, và nó PHẢI được trả lời trước `/plan` |

---

## 7. Yêu cầu phi chức năng

- **Tái lập (P1):** mọi quyết định mới — chọn mục đích, chọn hành động, kết quả hành động, chấn
  thương — PHẢI lấy ngẫu nhiên từ **mã trận**, không từ một nguồn toàn cục nào.
- **Hiệu năng:** một trận liên tục hôm nay tốn **100 ms**; ngân sách mùa giải là **78,95 ms**
  một trận, tức **đã vượt trước khi spec này bắt đầu**. Spec này thêm việc cho mỗi người ở mỗi
  mốc, nên nó PHẢI **đo lại và báo số**; vượt thêm là **một câu hỏi cho người dùng**, không
  phải chỗ tự nới. *(Câu hỏi mở số 7.)*
- **Kích thước dữ liệu trận xuất ra:** trần **11.000.000 byte** cho một trận 90 phút là một AC
  **đã đóng** của spec 007; ca xấu hiện tại là **5.332.957 byte**. Thêm một mục đích cho 22
  người ở mỗi mốc là thêm khoảng **131.000 giá trị**. Spec này PHẢI đo lại và báo số trước/sau.
  *(Câu hỏi mở số 6.)*
- **Luật tách khỏi giao diện (P2):** mọi thứ ở đây thuộc phần tính trận. Phần hiển thị PHẢI
  KHÔNG cần biết một mục đích nào tồn tại.
- **AC dạng so sánh phải có test (P5):** mọi AC có một con số PHẢI có phép kiểm tự động đo đúng
  con số ấy. Những AC đo **xác suất trên nhiều lần chạm** (AC-41.16 → 41.18) hôm nay **không đo
  được** từ dữ liệu trận xuất ra, vì dữ liệu ấy chứa **vị trí từng mốc** chứ không chứa kết cục
  từng hành động. Spec này PHẢI chọn một trong hai: thêm thứ cần đo vào dữ liệu xuất ra, hoặc
  khai chúng vào **danh sách ngoại lệ đóng** mà spec 007 đã lập và giữ danh sách ấy còn được
  canh bằng máy.
- **Song ngữ (P8):** spec này **không** đưa chuỗi nào ra màn hình, nên nó không sinh nghĩa vụ
  dịch. Giá trị trong dữ liệu xuất ra là **mã định danh**, không phải nhãn. *(Câu hỏi mở số 9
  nếu muốn hiện ra cho người dùng.)*

---

## 8. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 4 pass
- [ ] Trường hợp biên mục 6 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution
- [ ] Mọi AC dạng **khoảng số** có **test tự động** đo đúng khoảng đó trên nhiều mã trận; không
      AC nào trong nhóm ấy được tick bằng cách xem mắt (P5)
- [ ] **Món nợ cơ học của spec 007 không tệ đi:** số vi phạm trên tổng mẫu của AC-38.1, 38.2,
      38.3, 38.4, 38.6 và 38.11 PHẢI KHÔNG tăng so với mốc đã đo ngày 2026-11-27 — và mốc ấy
      được ghi lại ở đây: **249+104 / 23+3 / 62+312 / 1 / 280+144 / 22** trên 10 mã
- [ ] **Hai AC đã đóng của spec 007 được đo lại và báo số:** so sánh hai chế độ trên 200 mã
      (0,5 bàn và 10 điểm phần trăm), và trần kích thước dữ liệu trận xuất ra
- [ ] Ngân sách một trận liên tục được **đo và báo số**, đối chiếu 78,95 ms
- [ ] **Người dùng tự xem một trận trọn vẹn và phán** rằng bốn câu họ nói ở mục 1 không còn
      đúng nữa — lớp kiểm cuối, đúng tiền lệ của spec 005, 006 và 007

---

## 9. Câu hỏi mở

> Dùng đúng cú pháp `[NEEDS CLARIFICATION: câu hỏi]` để `/clarify` quét được.
> Chỉ khi mục này rỗng mới được chạy `/plan`.

- [NEEDS CLARIFICATION: **Câu đắt nhất — spec này có được đổi KẾT CỤC của các pha bóng không?**
  Hôm nay vị trí mét **không** quyết định kết cục: bốn lần sửa vị trí gần đây đều để dòng sự
  kiện **không đổi một ký tự**. Nhưng *"cắt bóng"* (AC-41.16), *"áp lực giảm 15–30%"*
  (AC-41.17) và *"chỉ số cao thành công nhiều hơn"* (AC-41.18) chỉ có nghĩa nếu chúng **đổi kết
  cục**. Ba đường, và **cả ba đều có giá**:
  **(a) Giữ nguyên** — mọi thứ mới chỉ là *cách diễn*, tỉ số không đổi. Rẻ và an toàn, nhưng ba
  AC trên thành trang trí và nên rời khỏi spec.
  **(b) Cho đổi kết cục, áp cho mọi trận** — mọi trận đã lưu phát lại ra tỉ số khác. Vỡ P3.
  **(c) Chỉ trận mới dùng mô hình mới**, trận cũ giữ cách tính cũ.
  ⚠️ **Hai cái giá tôi đã nói sai ở bản nháp đầu và sửa lại ở đây:** (1) đường (c) **không**
  miễn phí — cách repo đang nhận biết phiên bản mô hình trận so sánh **bằng đẳng thức tuyệt
  đối**, nên nâng số phiên bản sẽ **tước nút đấu lại của mọi trận liên tục đã lưu**, đúng cái
  giá mà spec 007 đã từ chối trả lần thứ hai; muốn (c) mà không mất gì thì phải giữ được đường
  chạy cũ cho trận cũ, và đó là một **yêu cầu**, không phải một giả định. (2) cả (b) và (c) đều
  phá **AC-45.3** của spec 007 — lưới duy nhất canh *"hai chế độ cho cùng một kết quả"* — mà
  spec 007 nói chỉ spec 010 mới phải phá. Chọn (b)/(c) tức tuyên bố AC-45.3 hết hiệu lực **sớm
  hơn dự kiến**, và đó là việc của người dùng.]

- [NEEDS CLARIFICATION: **Bốn mục đích ở mục 3.1 có đủ không, hay phải thêm?** Tôi chọn bốn vì
  chúng đủ dựng AC-41.3, AC-41.4, AC-41.7 và AC-40.1 → 40.3. Năm kiểu còn lại của bản mô tả gốc
  (chồng biên, chồng trong, người thứ ba, chạy nghi binh, chạy cắt mặt) đã vào Non-goals của
  danh mục. Nếu người dùng muốn một trong năm thứ ấy có mặt ngay, nói tên nó ra.]

- [NEEDS CLARIFICATION: **Năm hành động ở mục 3.2 có đủ không?** Cùng câu hỏi với danh mục kia.
  Riêng `dut-diem` hiện gộp cả sút lẫn đánh đầu — tách hay không?]

- [NEEDS CLARIFICATION: **Năm ngưỡng tôi tự đặt, và tôi nói rõ là tôi đặt:** AC-41.3 (3 mục
  đích / 80% số mốc), AC-41.4 (hai nhóm hướng cách 90° / 70% số cặp mốc), AC-41.6 (đứng im dưới
  10%), AC-40.3 (tương quan ≥ 0,6), AC-40.12 (thể lực ≥ 90 vào sân / ≤ 70 ra sân / 80% số lượt).
  Hôm nay giá trị thật lần lượt là **1 / 0% / 28,2% / chưa đo / chưa có cơ chế**, nên không có
  mốc so nào. Chúng là **hợp đồng** chứ không phải số đo. Chốt bây giờ, hay để `/clarify`
  chốt sau khi có một bản dựng thử để đo? ⚠️ Dù chọn gì thì **không** được giao việc chốt ngưỡng
  AC cho `/plan` — bước ấy không có quyền viết AC.]

- [NEEDS CLARIFICATION: **Chỉ số "chọn vị trí" của thủ môn — thêm mới hay suy ra?** *(Treo từ
  spec 007.)* Bản mô tả gốc đòi 3 chỉ số thủ môn; ứng dụng đã có 3 nhưng thiếu đúng "chọn vị
  trí". Thêm một chỉ số là **bắt người dùng nhập lại cho mọi thủ môn đã có**. Gợi ý: **suy ra**
  từ phản xạ và đọc tình huống, và ghi công thức vào spec.]

- [NEEDS CLARIFICATION: **Mục đích trong dữ liệu xuất ra ghi bằng gì — mã định danh đầy đủ hay
  mã ngắn?** AC-41.2 đòi mục đích của 22 người ở mọi mốc, tức khoảng **131.000 giá trị** cho một
  trận 90 phút. Trần 11.000.000 byte là một AC **đã đóng**, ca xấu hiện tại **5.332.957 byte**.
  Nếu mã đầy đủ đẩy tệp qua trần thì phải chọn: mã ngắn, hay chỉ ghi mục đích ở **khối dày** của
  những tình huống quan trọng thay vì mọi mốc.]

- [NEEDS CLARIFICATION: **Ngân sách thời gian — nếu vượt thì bỏ gì?** Một trận liên tục hôm nay
  **100 ms**, ngân sách mùa giải **78,95 ms**, tức đã vượt sẵn. Ba đường: **(a)** nới ngân sách
  mùa giải — ⚠️ con số ấy **dẫn từ hiến pháp** ("một mùa 380 trận phải xong dưới 30 giây"), nên
  đây **không** phải quyết định của spec 009 mà là một lần **sửa hiến pháp**: phải chạy
  `/constitution` và bump version **trước khi task đầu tiên chạy**, đúng khuôn mà spec 011 đã
  làm; **(b)** mùa giải chạy chế độ phút, chỉ trận người dùng xem mới chạy liên tục — ⚠️ đường
  này **ràng chéo với câu hỏi số 1**: nếu vị trí được phép đổi kết cục thì cùng một hạt giống sẽ
  cho hai kết quả khác nhau tuỳ người dùng có xem hay không, tức **P1 vỡ ở quy mô mùa**;
  **(c)** tính mục đích **thưa hơn mốc** (quyết một lần mỗi nửa giây, giữa hai lần thì đi tiếp
  theo mục đích cũ). Gợi ý: **(c)** trước, vì nó không đổi hợp đồng nào.]

- [NEEDS CLARIFICATION: **"Cầu thủ sáng tạo mạo hiểm hơn" của bản mô tả gốc cần một chỉ số tính
  cách mà ứng dụng không có.** Bỏ vế ấy, hay suy từ chỉ số đã có (ví dụ tầm nhìn cao + bình tĩnh
  thấp = mạo hiểm)? Gợi ý: **suy từ chỉ số đã có**, cùng lý do với câu về thủ môn.]

- [NEEDS CLARIFICATION: **Mục đích có được HIỆN RA cho người dùng không?** Mục tiêu ở mục 1 viết
  từ góc nhìn người xem (*"chỉ vào một người và hỏi anh này đang làm gì"*), nhưng Non-goals nói
  hiển thị thuộc spec 011 — và nhóm AC của spec 011 **đã đóng ở 49/52**, không có AC nào cho
  việc này. Ba đường: không hiện gì (spec này chỉ ghi vào dữ liệu); thêm một AC hiển thị vào
  spec 009 — khi ấy P8 bắt phải có nhãn song ngữ; hoặc để một spec sau. Gợi ý: **không hiện
  gì** lần này, và sửa câu mục tiêu ở mục 1 cho khớp.]

- [NEEDS CLARIFICATION: **Thời tiết ảnh hưởng tới thể lực — spec 009 hay spec 010?** *(Treo từ
  spec 007.)* Nắng nóng làm thể lực giảm nhanh hơn 10–20%, và cũng ăn vào tỉ lệ khống chế hỏng.
  Gợi ý: **phần thể lực vào 009**, phần khống chế hỏng vào 010 — chia theo đại lượng bị ảnh
  hưởng, không theo nguyên nhân.]

- [NEEDS CLARIFICATION: **Luật đánh số nhóm AC — cấp trước hay cấp lúc viết?** Spec 007 mục 12
  **cấp trước** US-40/41 cho spec 009; spec 011 mục 9 lại ghi một giả định còn hiệu lực rằng
  *"nhóm AC được cấp lúc viết, KHÔNG được giữ trước"* và đã lấy nhóm 46–53 trên cơ sở ấy. Hai
  tài liệu đang sống nói hai luật khác nhau. Spec này theo luật **cấp trước** (giữ US-40/41 và
  AC-40.4 đúng chủ). Người dùng chốt một luật chung, hay để mỗi spec tự xử?]

---

## 10. Giả định

- **Vị trí mét vẫn không vào bản ghi trận:** trận sinh lại từ mã trận. Nếu câu hỏi số 1 chọn
  (b) hoặc (c) thì giả định này vẫn đúng — chỉ **cách sinh lại** đổi.
- **Đơn vị quyết định hiện tại của phần tính trận không đổi.** Spec này đổi cách 22 người
  **đứng và đi** giữa các quyết định, không đổi cách hệ thống chọn kết cục một pha.
  *(Nếu câu hỏi số 1 chọn (b)/(c) thì giả định này phải viết lại — vì thế nó là câu hỏi đầu tiên.)*
- **Chế độ liên tục vẫn chỉ chạy ở sân 11 người.**
- **Mười một AC cơ học của spec 007 (AC-38.1 → AC-38.11) vẫn là trần.** Sáu trong số đó đang
  nợ; Definition of Done đòi *không tệ đi*, không đòi *sạch*.
- **Dữ liệu trận xuất ra đã có sẵn hai chỗ trống cho mục đích và hành động**, để trống đúng vì
  chờ spec này. Spec này làm chúng có giá trị.
- **Món nợ AC-34.2 của spec 006** (người rê bóng đi vòng qua đối thủ) **đã được trả ở spec 007**
  — ghi lại để không ai mở lại nó ở đây.
- **Ba hạng mục còn mở của spec 007 không chặn spec này:** nút xuất dữ liệu trận và hai phép đo.
