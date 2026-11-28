# Spec: Mỗi cầu thủ có một mục đích — khối đội hình, thể lực và quyết định riêng

| | |
|---|---|
| **ID** | `009-player-intent-tactics` |
| **Status** | Planned |
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
mục đích ấy giải thích được chuyển động của anh ta. Mục đích được ghi vào **dữ liệu trận**, đọc
được bằng tên; **nó KHÔNG hiện ra màn hình** ở spec này *(người dùng chốt 2026-11-27)*. Thứ
người xem thấy là **chuyển động đã khác**, không phải một nhãn chữ.

Hai hệ quả phải thấy được bằng mắt:

- Hai cầu thủ ở gần nhau, cùng một thời điểm, **đi hai hướng khác nhau** vì hai mục đích khác nhau.
- Người đá cao nhất **lùi về ngang hàng thủ đối phương** thay vì đứng chờ sau lưng họ cả trận.

**Non-goals** — ghi rõ để chặn scope creep:

- **Luật việt vị và mọi luật thi đấu khác.** Spec này làm cầu thủ **không tự đặt mình** vào vị
  trí việt vị; nó **không** thổi phạt ai. Việt vị, đá phạt, phạt đền, VAR, ném biên, bù giờ
  thuộc **spec 008**. *(Spec 009 sửa **hình dạng**; spec 008 áp **luật**.)*
- **Nhịp trận và thống kê cả trận.** Bóng lăn 55–60 phút, phân bổ cường độ, sự không hoàn hảo,
  xG, kể trận theo đoạn 15 phút — **spec 010**.
- **Mọi thứ hiển thị.** Nhịp khung hình, cách vẽ, màu, nhãn — **spec 011**. Spec này **không**
  hiện mục đích ra màn hình, người dùng chốt 2026-11-27; nó chỉ yêu cầu mục đích **đọc được
  trong dữ liệu trận xuất ra**. Hệ quả: spec này **không sinh một chuỗi hiển thị nào**, nên nó
  **không** mang nghĩa vụ song ngữ của **P8**, và nó **không** mở lại nhóm AC đã đóng của spec
  011. Muốn hiện ra thì đó là một spec sau.
- **Chế độ theo phút.** Mọi thứ ở đây chỉ chạm **chế độ liên tục**. Trận theo phút giữ nguyên
  từng dòng.
- **Quân số khác 11.** Chế độ liên tục đã khoá ở sân 11 người; spec này không mở khoá.
- **Chỉ số mới cho cầu thủ.** Mặc định **không thêm**, vì thêm một chỉ số là bắt người dùng
  nhập lại cho mọi cầu thủ đã có. *(Câu hỏi mở số 5 và số 8.)*
- **Huấn luyện viên máy: đổi sơ đồ giữa trận, VÀ thay người.** *"Đổi sơ đồ phải có lý do"* nằm
  trong bản mô tả gốc nhưng cần một tác nhân ra quyết định ở cấp **đội**, không phải cấp
  **người**. Để lại cho một spec sau.
  > 📌 **Món nợ có tên, chuyển ra ngày 2026-11-28 trong lúc `/plan`.** Nội dung của **AC-40.12**
  > — *"người vào sân thể lực từ 90 trở lên, người rời sân từ 70 trở xuống, ở ít nhất 80% số
  > lượt thay người do máy quyết định"* — chuyển sang **spec đầu tiên sở hữu huấn luyện viên
  > máy**, cùng chỗ với dòng trên. Lý do: v6 **không có thay người do máy** —
  > `kiemTraCanThiep` chặn thẳng mọi can thiệp của đội không phải của người dùng — nên AC ấy đo
  > trên một **tập rỗng**. Và dựng nó trong spec 009 là **sinh một dòng sự kiện mới**, tức vỡ
  > đúng lời hứa 🔒 *"vị trí không quyết định kết cục"*. Người dùng chốt ngày 2026-11-28; chi
  > tiết ba phương án ở `plan.md` mục 10.3.
  > ⚠️ **Số `AC-40.12` coi như ĐÃ CẤP và KHÔNG được dùng lại** cho một nội dung khác, đúng tiền
  > lệ của AC-40.4: khi spec kia tới, nó nhận lại **đúng số này** cùng **đúng nội dung này**.
- **Hướng người, tầm nhìn 180°, phản ứng 0,2–0,3 giây, quét trước khi nhận bóng.** Bản mô tả
  gốc giao chúng cho spec 009, nhưng chúng là một **lớp tri giác** riêng, và mỗi thứ đều nhân
  thêm việc cho 22 người ở mỗi mốc — trong khi ngân sách thời gian **đã vượt trước khi spec
  này bắt đầu** (mục 6). Để lại, và nói rõ ở đây thay vì im lặng. *(Câu hỏi mở số 7.)*
- **Chấn thương làm hỏng dữ liệu cầu thủ người dùng đã nhập.** Chấn thương (AC-40.14) chỉ sống
  **trong một trận**; nó PHẢI KHÔNG ghi gì vào hồ sơ cầu thủ.
- 🔒 **VỊ TRÍ KHÔNG QUYẾT ĐỊNH KẾT CỤC — người dùng chốt 2026-11-27.** Spec này đổi **hình
  dạng** của trận, không đổi **ai thắng**. Cùng một mã trận PHẢI cho **đúng từng dòng sự kiện
  và đúng tỉ số** như trước spec này. Hệ quả, nêu thẳng để không ai tưởng bị quên:
  - **Cắt đường chuyền, áp lực 2 m giảm 15–30%, và chỉ số cao thành công nhiều hơn** đều **rời
    khỏi spec này**. Chúng chỉ có nghĩa nếu được phép đổi kết cục; giữ lại mà không cho đổi là
    giữ ba dòng trang trí.
  - Cầu thủ vẫn **áp sát** và vẫn **đứng chắn đường chuyền** (AC-41.14, AC-41.15) — người xem
    vẫn thấy hành vi phòng ngự. Thứ không xảy ra là nó **làm hỏng** một đường chuyền mà hệ
    thống đã quyết là thành công.
  - Cái được đổi lấy: **không một trận đã lưu nào đổi tỉ số**, món nợ P3 không bị chạm lần thứ
    hai, và lưới canh *"hai chế độ cho cùng một kết quả"* của spec 007 **còn nguyên**.

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

> ✅ **Bốn là đủ — người dùng chốt 2026-11-27.** Bốn mục đích trên đủ dựng **mọi** AC của spec
> này: hướng đi khác nhau (AC-41.4), hết việt vị thường trực (AC-41.7), khối co giãn và dịch
> theo bóng (AC-40.1 → 40.3). Năm kiểu còn lại là **chi tiết của cùng một cơ chế**; thêm chúng
> sau không phải viết lại gì.

**Thủ môn** có danh mục riêng, tối thiểu: `giu-khung`, `bo-tro-hang-thu`.

> ✅ **Không thêm chỉ số mới — người dùng chốt 2026-11-27.** Khả năng *chọn vị trí* của thủ môn
> và *độ mạo hiểm* của cầu thủ đều **suy ra từ các chỉ số đã có** (ví dụ phản xạ và đọc tình
> huống cho cái thứ nhất; tầm nhìn và bình tĩnh cho cái thứ hai), theo một công thức ghi trong
> spec và kiểm được. Lý do: thêm một chỉ số là **bắt người dùng nhập lại cho mọi cầu thủ đã
> có** — một cái giá không tương xứng với thứ nó mua.

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
sớm / tạt cột gần / tạt cột xa; đảo chân / ngoặt bóng / che bóng…), và **tạt bóng** chưa tách
thành hành động riêng.

> ✅ **Năm là đủ — người dùng chốt 2026-11-27.** Sau khi chốt *"vị trí không quyết định kết
> cục"*, hành động chỉ còn hai việc: **nói ra** quyết định là gì, và **đặt người đúng chỗ**.
> Chẻ nhỏ hơn không đổi một vị trí nào, nên nó chỉ làm danh mục dài ra.
> 📌 `dut-diem` **gộp cả sút lẫn đánh đầu** ở spec này, dù dữ liệu trận của spec 007 đã có một
> trạng thái đánh đầu riêng với dải độ cao 1,5–2,8 m. Ghi lại để người tách nó sau biết rằng
> chỗ tách đã sẵn, và việc gộp là một lựa chọn chứ không phải một sơ suất.

---

## 4. User stories

> **Vì sao US-40 và US-41, và vì sao theo thứ tự này.** Spec 006 (dòng 20) chuyển món nợ
> **AC-36.1** sang *"spec 009, US-41"*; spec 007 (dòng 984) viết *"Đây là **US-41**: mỗi người
> không cầm bóng phải có một mục đích gọi tên được"*; và spec 007 (dòng 971) đã cấp
> **AC-40.4** cho *"3–5 giây phản pressing hoặc lùi về"*. Cả ba đều được giữ nguyên ở đây:
> **US-41 = mục đích di chuyển**, **AC-40.4 = phản pressing**.
> *(Bản nháp đầu của spec này đảo hai số ấy và lấy mất AC-40.4. Ghi lại để không ai sửa ngược.)*
>
> ⚠️ **Và đây là một NGOẠI LỆ có lý do, không phải một luật chung — người dùng chốt
> 2026-11-27.** Spec 011 mục 9 ghi một giả định còn hiệu lực rằng *"nhóm AC được cấp **lúc
> viết**, KHÔNG được giữ trước"*, và spec 011 đã lấy nhóm 46–53 trên cơ sở ấy. Hai luật ấy
> mâu thuẫn, và spec này **không** đi giải mâu thuẫn — nó chỉ giữ US-40/41 và AC-40.4 vì **ba
> tài liệu đang sống đã trỏ vào chúng bằng tên**, và đổi số bây giờ là làm ba chỗ ấy trỏ vào
> chỗ trống. Spec sau không được viện dòng này làm tiền lệ.

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
- [ ] AC-40.17 — KHI hai thủ môn có chỉ số khác nhau cùng đối mặt một tình huống THÌ chỗ họ
      đứng PHẢI khác nhau; khả năng **chọn vị trí** PHẢI được **suy ra từ các chỉ số đã có**,
      theo một công thức ghi trong spec, và PHẢI KHÔNG thêm một ô nhập nào cho người dùng.
- [ ] AC-40.13 — KHI thể lực xuống tới mức thấp nhất THÌ tốc độ tối đa của cầu thủ ấy PHẢI
      KHÔNG xuống dưới **4 m/s**, và PHẢI KHÔNG bao giờ âm hay bằng 0.
      > Con số **4** lấy neo từ spec 007: đó đúng là trần tốc độ **chạy lùi** của AC-38.4. Một
      > người kiệt sức không được chậm hơn chính mình lúc chạy giật lùi.
- [ ] AC-40.14 — KHI mô phỏng **từ 20 mã trận trở lên** THÌ số chấn thương **trung bình** mỗi
      trận PHẢI nằm trong **0–1**; một trận lẻ được phép nhiều hơn.
- [ ] AC-40.15 — KHI một cầu thủ dính chấn thương THÌ việc đó PHẢI **chỉ sống trong trận ấy**:
      hồ sơ cầu thủ do người dùng nhập PHẢI KHÔNG đổi một trường nào.
- [ ] AC-40.18 — KHI trận diễn ra dưới thời tiết **nắng nóng** THÌ thể lực PHẢI giảm nhanh hơn
      **10–20%** so với cùng mã trận ở thời tiết mát, đo bằng thể lực trung bình của 22 người ở
      cuối trận. *(Người dùng chốt 2026-11-27: phần **thể lực** vào spec 009; phần thời tiết ăn
      vào **tỉ lệ khống chế hỏng** để spec 010 — chia theo đại lượng bị ảnh hưởng, không theo
      nguyên nhân.)*
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
      xuất ra**, ở **mọi mốc**, dưới dạng một **mã ngắn** tra được về danh mục ở mục 3.1 — không
      phải tên đầy đủ. *(Người dùng chốt 2026-11-27: ghi ở mọi mốc, nhưng bằng mã ngắn.)*
- [ ] AC-41.21 — KHI một trận 90 phút được xuất ra THÌ dữ liệu trận PHẢI vẫn dưới **11.000.000
      byte**, và phép đo PHẢI báo số **trước và sau** khi thêm mục đích cùng hành động.
- [ ] AC-41.3 — KHI đo trên một trận đầy đủ THÌ ở ít nhất **80%** số mốc PHẢI có **từ 3 mục
      đích khác nhau trở lên** đang cùng diễn ra trên sân.
      *(Hôm nay con số này là **1**, ở 100% số mốc.)*
- [ ] AC-41.4 — KHI đo hướng dịch chuyển của 22 cầu thủ giữa hai mốc liên tiếp THÌ ở ít nhất
      **70%** số cặp mốc PHẢI có **ít nhất hai nhóm hướng** cách nhau trên **90°**, trong đó
      *nhóm hướng* là một tập vectơ lệch nhau dưới **45°** và chỉ tính vectơ dài trên **0,2 m**.
      *(Hôm nay con số này là **0%**: 22 vectơ song song tuyệt đối.)*
- [ ] AC-41.5 — KHI một cầu thủ đổi mục đích THÌ chuyển động của anh ta PHẢI KHÔNG nhảy bậc:
      tốc độ và hướng ở mốc ngay sau PHẢI vẫn nằm trong mọi trần cơ học của spec 007.
- [ ] AC-41.19 — KHI hệ thống chọn mục đích THÌ nó PHẢI chọn **nhiều nhất một lần mỗi nửa giây
      trận**, không phải ở mọi mốc; giữa hai lần chọn, cầu thủ PHẢI đi tiếp theo mục đích đang
      có. *(Người dùng chốt 2026-11-27, để giữ ngân sách thời gian — xem mục 7.)*
- [ ] AC-41.20 — KHI mục đích được chọn thưa hơn mốc THÌ việc ấy PHẢI KHÔNG làm trận mất khả
      năng sinh lại: cùng mã trận và cùng chuỗi can thiệp PHẢI cho đúng từng khung hình.
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
- [ ] AC-41.22 — KHI hai cầu thủ ở cùng một tình huống nhưng có **độ mạo hiểm** khác nhau THÌ
      họ PHẢI chọn nhánh khác nhau ở ít nhất một tình huống đo được; và **độ mạo hiểm** PHẢI
      được **suy ra từ các chỉ số người dùng đã nhập**, theo một công thức ghi trong spec.
      PHẢI KHÔNG thêm một ô nhập nào cho người dùng. *(Người dùng chốt 2026-11-27.)*

*Phòng ngự:*

- [ ] AC-41.14 — KHI đội đối phương cầm bóng THÌ PHẢI có **ít nhất một** cầu thủ mang mục đích
      `kem-nguoi` nhắm vào người cầm bóng, ở ít nhất **90%** số mốc đội ấy giữ bóng.
- [ ] AC-41.15 — KHI một cầu thủ mang mục đích ấy THÌ khoảng cách của anh ta tới người cầm bóng
      PHẢI giảm qua các mốc cho tới khi dưới **2 m**, hoặc cho tới khi bóng đổi chủ.


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
  một trận, tức **đã vượt trước khi spec này bắt đầu**. Người dùng chốt 2026-11-27: **tính mục
  đích thưa hơn mốc** — nhiều nhất một lần mỗi **nửa giây trận** (AC-41.19), thay vì ở cả 5.400
  mốc. Spec này vẫn PHẢI **đo lại và báo số**; nếu vẫn vượt thì đó là **một câu hỏi cho người
  dùng**, và việc nới con số 78,95 ms là một lần **sửa hiến pháp**, không phải quyết định của
  spec 009.
- **Kích thước dữ liệu trận xuất ra:** trần **11.000.000 byte** cho một trận 90 phút là một AC
  **đã đóng** của spec 007; ca xấu hiện tại là **5.332.957 byte**. Thêm một mục đích cho 22
  người ở mỗi mốc là thêm khoảng **131.000 giá trị**. Spec này PHẢI đo lại và báo số trước/sau.
  *(Câu hỏi mở số 6.)*
- **Luật tách khỏi giao diện (P2):** mọi thứ ở đây thuộc phần tính trận. Phần hiển thị PHẢI
  KHÔNG cần biết một mục đích nào tồn tại.
- **AC dạng so sánh phải có test (P5):** mọi AC có một con số PHẢI có phép kiểm tự động đo
  đúng con số ấy. Sau khi người dùng chốt *"vị trí không quyết định kết cục"*, **mọi AC còn lại
  của spec này đều đo được trên vị trí** — thứ dữ liệu trận xuất ra đã chứa. Ba AC từng cần đo
  **xác suất** đã rời khỏi spec cùng quyết định ấy, nên spec này **không** thêm một ngoại lệ
  nào vào danh sách ngoại lệ đóng mà spec 007 đang canh bằng máy.
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
- [ ] **Món nợ cơ học của spec 007 không tệ đi:** với mỗi vế của AC-38.1, 38.2, 38.3, 38.4,
      38.6 và 38.11, **tỉ lệ `số vi phạm / tổng mẫu`** PHẢI KHÔNG tăng so với một nền đo trên
      **mười mã trận cố định**. Nền ấy được **đo và ghi ở lát 0** (`plan.md` mục 9, task
      `T820`), kèm **cả tử số và mẫu số** của từng vế.
      > ⚠️ **Sáu con số mà bản trước của dòng này ghi — `249+104 / 23+3 / 62+312 / 1 /
      > 280+144 / 22` — KHÔNG phải một nền trên mười mã, và không được dùng làm nền.** `/analyze`
      > ngày 2026-11-28 truy ra: năm con số đầu là bảng nợ **T742** của spec 007
      > (`specs/007/spec.md:611`), còn `280+144` của AC-38.6 là số đo trên **MỘT** mã, từ `T816`.
      > Hai hệ quả, ngược chiều nhau, và cả hai làm dòng này vô dụng:
      > **(a)** AC-38.1 đo được hôm nay là **8+1 một mã**, nên ngưỡng 249 cho món nợ **tăng gấp
      > ba** mà vẫn xanh — một cổng chết.
      > **(b)** AC-38.6 trên mười mã sẽ ra khoảng **2.800+1.440**, nên đòi *"khớp 280+144"* là
      > một cổng **đỏ vì cỡ mẫu**, không vì hồi quy — và nó chặn mọi task.
      > Thêm nữa, mẫu số của chính các vế ấy **đã dịch**: `AC-38.4(lùi)` có `soMau` đi từ
      > **180 xuống 21** một mã. So **số đếm** trên hai cỡ mẫu khác nhau là một phép so vô nghĩa;
      > vì thế dòng này nay nói **tỉ lệ**, và đòi **mẫu số phải được ghi ra**.
- [ ] **Dòng sự kiện và tỉ số KHÔNG đổi một ký tự** trên mười mã trận cố định — hệ quả trực
      tiếp của quyết định *"vị trí không quyết định kết cục"*, và là phép kiểm rẻ nhất chứng
      minh nó
- [ ] **Hai AC đã đóng của spec 007 được đo lại và báo số:** so sánh hai chế độ trên 200 mã
      (0,5 bàn và 10 điểm phần trăm), và trần kích thước dữ liệu trận xuất ra (AC-41.21)
- [ ] Ngân sách một trận liên tục được **đo và báo số**, đối chiếu 78,95 ms
- [ ] **Người dùng tự xem một trận trọn vẹn và phán** rằng bốn câu họ nói ở mục 1 không còn
      đúng nữa — lớp kiểm cuối, đúng tiền lệ của spec 005, 006 và 007

---

## 9. Câu hỏi mở

**Không còn câu hỏi mở.** Mười một câu của bản `Draft` đã được người dùng chốt ngày
**2026-11-27** qua ba lượt `/clarify`; từng câu và từng quyết định nằm ở **mục 11**.

Spec này đã qua cổng chặn của hiến pháp mục 5 và **sẵn sàng cho `/plan`**.

---

## 10. Giả định

- **Vị trí mét vẫn không vào bản ghi trận:** trận sinh lại từ mã trận.
- **Đơn vị quyết định hiện tại của phần tính trận không đổi.** Spec này đổi cách 22 người
  **đứng và đi** giữa các quyết định, không đổi cách hệ thống chọn kết cục một pha.
  *(Người dùng chốt điều này ngày 2026-11-27; nó là giả định nền của cả spec.)*
- **Chế độ liên tục vẫn chỉ chạy ở sân 11 người.**
- **Mười một AC cơ học của spec 007 (AC-38.1 → AC-38.11) vẫn là trần.** Sáu trong số đó đang
  nợ; Definition of Done đòi *không tệ đi*, không đòi *sạch*.
- **Dữ liệu trận xuất ra đã có sẵn hai chỗ trống cho mục đích và hành động**, để trống đúng vì
  chờ spec này. Spec này làm chúng có giá trị.
- **Món nợ AC-34.2 của spec 006** (người rê bóng đi vòng qua đối thủ) **đã được trả ở spec 007**
  — ghi lại để không ai mở lại nó ở đây.
- **Ba hạng mục còn mở của spec 007 không chặn spec này:** nút xuất dữ liệu trận và hai phép đo.

---

## 11. Nhật ký làm rõ — 2026-11-27

Mười một câu, ba lượt. Cột cuối ghi **cái giá** của lựa chọn, vì một quyết định không có giá
là một quyết định chưa được hiểu.

| # | Câu hỏi | Quyết định | Cái giá đã nói trước |
|---|---|---|---|
| 1 | Mô hình mới có được đổi **kết cục** các pha bóng không? | **Chỉ đổi hình dạng.** Vị trí KHÔNG quyết định ai thắng; cùng mã trận cho đúng từng dòng sự kiện và đúng tỉ số như trước | **Ba AC rời khỏi spec**: cắt đường chuyền, áp lực 2 m giảm 15–30%, chỉ số cao thành công nhiều hơn. Cầu thủ vẫn áp sát và vẫn đứng chắn, nhưng việc ấy **không làm hỏng** một đường chuyền mà hệ thống đã quyết là thành công |
| 2 | Ngân sách thời gian đã vượt trước khi spec bắt đầu (100 ms so với 78,95 ms) | **Tính mục đích thưa hơn mốc** — nhiều nhất một lần mỗi nửa giây trận (AC-41.19) | Mục đích đổi chậm hơn thực tế tới nửa giây. Đổi lại: không sửa hiến pháp, không tách hai chế độ, không đổi một hợp đồng nào |
| 3 | Năm ngưỡng là số tôi tự đặt — chốt bây giờ hay đo trước? | **Chốt bây giờ.** Chúng thành **hợp đồng** | Viết trước khi đo nên không uốn được cho vừa kết quả; nếu dựng xong mà không đạt thì đó là **một câu hỏi cho người dùng**, không phải chỗ tự nới |
| 4 | Mục đích của 22 người ở mọi mốc là ~131.000 giá trị; trần 11 MB là AC đã đóng | **Mã ngắn, ghi ở mọi mốc** (AC-41.2), và **đo lại kích thước** báo số trước/sau (AC-41.21) | Mở tệp bằng mắt phải tra bảng mới hiểu. Đổi lại: giữ được "đọc được ở mọi mốc" mà gần như không đụng trần |
| 5 | Mục đích có **hiện ra màn hình** không? | **Không hiện gì** ở spec này | Người xem không đọc được tên mục đích trên sân; họ chỉ thấy **chuyển động đã khác**. Đổi lại: không sinh nghĩa vụ song ngữ **P8**, không mở lại nhóm AC đã đóng của spec 011 |
| 6 | Bốn mục đích có đủ không? | **Bốn là đủ** | Chồng biên, chồng trong, người thứ ba, chạy nghi binh, chạy cắt mặt **không có lần này** — nhưng chúng là chi tiết của cùng một cơ chế, thêm sau không phải viết lại |
| 7 | Năm hành động có đủ không? | **Năm là đủ**; `dut-diem` gộp cả sút lẫn đánh đầu | Dữ liệu trận của spec 007 **đã có** một trạng thái đánh đầu riêng, nên chỗ tách đã sẵn. Việc gộp là một lựa chọn, không phải sơ suất |
| 8 | Chỉ số *chọn vị trí* của thủ môn và *độ mạo hiểm* — thêm mới hay suy ra? | **Suy từ chỉ số đã có**, công thức ghi trong spec (AC-40.17, AC-41.22) | Hai đại lượng ấy không độc lập với các chỉ số khác, nên người dùng không chỉnh riêng được. Đổi lại: **không bắt nhập lại cho mọi cầu thủ đã có** |
| 9 | Thời tiết ăn vào thể lực — spec 009 hay 010? | **Phần thể lực vào 009** (AC-40.18); phần ăn vào tỉ lệ khống chế hỏng để spec 010 | Chia theo **đại lượng bị ảnh hưởng**, không theo nguyên nhân — nên "thời tiết" sẽ xuất hiện ở hai spec, và người đọc phải biết điều đó |
| 10 | Hai tài liệu nói hai luật khác nhau về đánh số nhóm AC | **Giữ US-40/41 và AC-40.4 đúng chủ**, ghi rõ đây là **ngoại lệ có lý do** | Mâu thuẫn giữa spec 007 (cấp trước) và spec 011 (cấp lúc viết) **vẫn còn**; spec này không giải nó, và spec sau không được viện dòng này làm tiền lệ |
| 11 | *(Gộp vào câu 8 khi hỏi — cùng một kiểu đánh đổi)* | — | — |

### Hai điều bản `Draft` nói sai, và chúng được sửa trước khi người dùng quyết

1. **Số user story bị đảo.** Bản nháp đặt US-40 = mục đích, US-41 = thể lực. Hồ sơ nói ngược:
   spec 006 (dòng 20) chuyển món nợ **AC-36.1** sang *"spec 009, **US-41**"*, và spec 007
   (dòng 984) viết *"Đây là **US-41**"*. Bản nháp còn **lấy mất AC-40.4**, số spec 007 đã cấp
   cho *"3–5 giây phản pressing"*, và nội dung ấy biến mất khỏi spec. Cả ba đã trả lại.
2. **Một cái giá bị nói sai trong đúng câu hỏi đắt nhất.** Bản nháp bảo đường *"chỉ trận mới
   dùng mô hình mới"* là **"không bắt ai mất gì"**. Sai: cách repo nhận biết phiên bản mô hình
   trận so sánh **bằng đẳng thức tuyệt đối**, nên nâng số phiên bản sẽ **tước nút đấu lại của
   mọi trận liên tục đã lưu**. Nếu người dùng quyết trên bản nháp ấy, họ đã quyết trên dữ kiện
   sai.

*Cả hai do ba người soát độc lập tìm ra trước khi `/clarify` bắt đầu.*

---

### Lượt bốn — 2026-11-28, trong lúc `/plan`

`/plan` khảo sát code rồi đo, và phép đo tìm ra **sáu dữ kiện của spec này sai**. Năm cái được
`plan.md` xử bằng một quyết định có số và **không** chạm spec. Cái thứ sáu chạm **thân** một AC,
nên nó thành một câu hỏi, và người dùng chốt.

| # | Dữ kiện sai | Xử ở đâu | Có chạm spec không |
|---|---|---|---|
| 1 | **AC-40.17** nêu ví dụ *"đọc tình huống"*, một chỉ số **thủ môn không điền** — nên công thức theo ví dụ ấy cho **mọi thủ môn một con số giống nhau**, tức AC tự đỏ | `plan.md` **D156** dùng `phan-xa` + `bat-bong` + `quyet-doan` | Không — phần trong ngoặc là **ví dụ**, không phải thân AC |
| 2 | **AC-41.22** nêu ví dụ *"bình tĩnh"*, một chỉ số **không tồn tại** trong 18 mã của repo | `plan.md` **D157** dùng `nhan-quan` + `quyet-doan` | Không — cùng lý do |
| 3 | Mục 7 ghi *"một trận liên tục tốn **100 ms**"*; đo lại 10 mã: **110,84 ms** (ca xấu 129,44). Và số mốc là **5.980–6.440**, không phải 5.754 | `plan.md` bảng **Nền đo** | Không — một phép đo, không phải một yêu cầu |
| 4 | **Không trận nào dài 90 phút** — đo 10 mã: **94–99**, vì bù giờ. Nên điều kiện *KHI* của **AC-40.10** và **AC-40.11** **rỗng theo chữ**, và *"15 phút cuối"* của **AC-40.16** bắt đầu ở phút **79–84** | `plan.md` **D167** đọc *"trận 90 phút"* là *"trận đủ độ dài"* | Không — một **cách đọc**, chốt ra mặt thay vì nằm im trong phép kiểm |
| 5 | **AC-40.18** đòi *"cùng mã trận ở thời tiết mát"*, nhưng thời tiết là **hàm thuần của mã trận** và danh mục **không có** kiểu *"mát"* | `plan.md` **D166** đọc *"mát"* là `'am'`, và phép kiểm giữ mã trận rồi thay điều kiện bằng tay | Không — nhưng đây là **định nghĩa của plan**, nên nếu người dùng muốn nghĩa khác thì đó là chỗ sửa |
| 6 | **AC-41.6** đo *"người **không tham gia** đứng im"* và lấy nền **28,2%**, nhưng *"không tham gia"* **chưa ai định nghĩa**: đo trên cả 22 người cho **66,08%** — cách nhau **2,3 lần** | `plan.md` **D168** chốt định nghĩa và **đo lại nền** ở lát 0 | Không — nhưng hệ quả phải nói ra: nếu nền thật là 66,08% thì AC-41.6 **khó hơn hẳn** lúc chốt nó, từ *"giảm 2,8 lần"* thành *"giảm 6,6 lần"* |

**Và một AC rời khỏi spec — người dùng chốt 2026-11-28:**

| Câu hỏi | Quyết định | Cái giá đã nói trước |
|---|---|---|
| **AC-40.12** đo *"thay người do máy quyết định"*, nhưng v6 **không có** việc ấy: `kiemTraCanThiep` chặn thẳng đội không phải của người dùng, nên mẫu là **0/0** | **Chuyển nội dung AC sang spec đầu tiên sở hữu huấn luyện viên máy**, giữ nguyên số và nguyên lời. Hai phương án kia bị loại | Spec 009 **mất một AC**, còn **36**. Đổi lại: lời hứa 🔒 *"dòng sự kiện và tỉ số không đổi một ký tự"* **còn nguyên** — vì dựng thay người do máy là **thêm một dòng sự kiện**, và đọc lại AC thành *"thay người do người dùng"* là đo **người dùng chơi có hợp lý không**, không đo ứng dụng |

📌 **Vì sao nó đi đúng chỗ ấy chứ không phải một spec bất kỳ:** Non-goals của chính spec này đã
đẩy *"huấn luyện viên máy đổi sơ đồ giữa trận"* sang một spec sau với lý do *"cần một tác nhân
ra quyết định ở cấp **đội**, không phải cấp **người**"*. Thay người do máy là **đúng tác nhân
ấy**, nên nó về cùng một chỗ thay vì mở một món nợ thứ hai.

---

### Lượt năm — 2026-11-28, trong lúc `/analyze`

`/analyze` chạy 53 agent trên sáu nhóm, tìm 47 phát hiện, và một lượt thẩm đối kháng **bác 27**
— gồm bốn cái từng được báo CRITICAL. Hai mươi cái còn lại cộng ba cái tìm thêm đều nằm ở
`plan.md` và `tasks.md`, nên `spec.md` **chỉ đổi đúng một dòng**: mục 8, món nợ cơ học.

**Vì sao dòng ấy phải đổi, dù nó là một dòng người dùng đã chốt.** Nó nói đúng về **đại lượng**
— nguyên văn *"số vi phạm **trên tổng mẫu**"*, tức một **tỉ lệ**. Nhưng sáu con số nó liệt ngay
sau đó là **số đếm trần**, không mẫu số, và chúng đến từ **hai phép đo khác cỡ mẫu**: năm con số
từ `T742` của spec 007 (đo trên ~10 mã, mẫu 1,5 triệu), một con số từ `T816` (đo trên **một**
mã). Dòng ấy gọi cả sáu là *"trên 10 mã"*.

| Bằng chứng | Số |
|---|---|
| `soMau['AC-38.10(c)']` một mã, hôm nay | **11.958** |
| cùng vế ấy ở `T742` (`specs/007/spec.md:611`) | **120.660** → hệ số **10,09** ⇒ T742 đo ~10 mã |
| `AC-38.6` ở `T816`, một mã | **280 + 144 = 424** trong tổng **450** vi phạm của mã ấy |
| `AC-38.1` một mã, hôm nay | **8 + 1**, so với **249 + 104** của T742 |
| `soMau['AC-38.4(lùi)']` một mã | đi từ **180** xuống **21** — mẫu số tự nó đã dịch |

**Cái giá của việc sửa:** spec này **mất một nền đã ghi sẵn**, và phải đợi `T820` đo mới có nền.
Đổi lại: cái gate chạy ở **mọi task** thôi vừa chết vừa đỏ sai. Một nền sai là tệ hơn chưa có
nền, vì nó **trông như** đã được canh.

📌 **Và ghi lại để không ai sửa ngược:** `spec.md` vốn nói **đúng** (*"trên tổng mẫu"*). Chỗ
nói sai là `plan.md` R78 và `tasks.md` T820 — chúng chép sáu con số rồi đòi *"khớp"*, tức bỏ mất
đúng ba chữ *"trên tổng mẫu"* mà spec đã viết. Lỗi nằm ở hai tài liệu dưới, không ở spec.
