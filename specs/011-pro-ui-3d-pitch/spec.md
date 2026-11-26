# Spec: Giao diện có hệ thống thiết kế, và chế độ xem sân 3D song song

| | |
|---|---|
| **ID** | `011-pro-ui-3d-pitch` |
| **Status** | **Planned** — **41/52 AC đạt** (T810 ngày 2026-11-26, cộng AC-49.1 sau khi `T813` của spec 007 xong). 11 AC chưa đạt đều có dòng lý do tại chỗ: 7 chờ Phase 62 — nay **đã gỡ chặn**, 3 không đo được trong môi trường này, 1 chờ phép kiểm P5 mang đúng tên nó. **Chưa `Done`.** |
| **Created** | 2026-11-25 |
| **Clarified** | 2026-11-25 — **15 quyết định**, xem mục 10 (quyết định 15 đến từ `/analyze`) |
| **Planned** | 2026-11-25 — `./plan.md`, 13 quyết định D130–D142, 7 rủi ro R60–R66 |
| **Analyzed** | 2026-11-25 — 3 CRITICAL + 7 phát hiện khác, đã xử hết; **52 AC** |
| **Branch** | `011-pro-ui-3d-pitch` — **chưa cắt**; sẽ cắt từ `main` sau khi spec 007 đóng |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Spec này cần sửa hiến pháp trước khi làm.** Hiến pháp 3.0.1, mục 1, Non-goals, dòng 23 ghi:
> *"Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm."* Spec 011 làm đúng điều ấy. Người dùng đã
> chốt ngày **2026-11-25**: gỡ dòng đó khỏi Non-goals và **bump MAJOR lên 4.0.0**, theo đúng
> cách lần 3.0.0 ngày 2026-11-16 đã làm khi gỡ hai non-goals về sự nghiệp và giải đấu.
> Đây là một **đổi hướng có ý thức, không phải mở rộng dần** — và nó được ghi ở đúng chỗ
> hiến pháp dành cho việc ghi, chứ không lặng lẽ vi phạm. Xem **US-7** và nhóm **AC-52**.
>
> Non-goals của spec 001 — một tài liệu đã `Done` — **KHÔNG bị sửa ngược**. Spec này nêu rõ
> nó thay thế non-goal ấy và dẫn về mục 1 của hiến pháp, đúng khuôn mục 1 đã đặt ra.

> **Sân 3D SỐNG SONG SONG với sân 2D, không thay thế.** Người dùng chốt ngày 2026-11-25,
> sau khi được nêu đủ cái giá của cả ba phương án. Sân 2D hiện tại là **chủ sở hữu** của
> hàng chục AC đã đóng ở spec 002/004/005/006, nên "song song" có một cái giá rõ ràng và
> spec này không che: **hai lớp vẽ phải cùng đúng mãi mãi**. US-4 là nơi trả giá ấy, và
> `/clarify` đã chẻ nó thành **ba nhóm bất biến khác loại nhau** thay vì một câu "cả sáu".

> **Hai con số định hình mọi thứ, đã đo và đã chốt:** camera đặt ở **θ = 50°** (góc giữa
> hướng nhìn và mặt sân; 90° là nhìn thẳng xuống), và độ cao được **phóng đại ×3**.
>
> Vì sao phải phóng đại: ở **tỉ lệ thật**, độ cao của bóng gần như vô hình. Đo được trên
> chính hệ toạ độ hiện có (`viewBox 100×64` cho sân 105×68 m, bán kính bóng 1,7 đơn vị):
> `z = 1 m` nhấc bóng lên **0,19–0,42 lần bán kính của chính nó** tuỳ góc camera — mắt
> không thấy; và `z = 5,26 m`, giá trị **lớn nhất trong cả engine**, chỉ được **1,0–2,2
> lần** bán kính, tức nhỏ hơn một điểm cầu thủ. Lời hứa trung tâm của US-1 — phân biệt một
> quả tạt với một đường chuyền sệt — **không dựng nổi ở tỉ lệ thật**. Đây là lần thứ năm
> của dự án mà một con số không dựng nổi được **hỏi lại thay vì bị hạ ngưỡng**.
>
> Với cặp đã chốt: `z = 1 m` → **1,07 lần bán kính bóng** (thấy được); `z = 5,26 m` → **9,5
> đơn vị, 14,9% chiều cao ảnh**; chiều sâu sân chiếm **49,0 đơn vị, 77% chiều cao ảnh**;
> sân cộng đỉnh bóng là **58,6 trên 64 đơn vị**, còn **5,4 đơn vị lề**.

> **Spec này KHÔNG chạm `src/engine/`.** Dữ liệu ba chiều đã có và đã được canh bằng phép
> kiểm từ spec 007: lô mốc mang `x, y, z` mét thật cho 26 thực thể, với `z` lên tới 5,26 m.
> Spec 011 chỉ **đọc**. Mọi thứ thuộc spec này sống ở tầng giao diện, theo đúng ranh giới
> tầng mà `src/engine/boundaries.test.ts` đang canh.

---

## 1. Vấn đề & mục tiêu

### Vấn đề

**Phần (a) — giao diện không có một hệ thống thiết kế có tên.**

Ứng dụng có 42 biến màu CSS được đặt tên tử tế từ spec 003 (`--chinh`, `--co-net`,
`--canh-bao-nen`, …), và chúng hoạt động: chủ đề sáng/tối đổi được, chữ đọc được. Nhưng
**không có tài liệu nào nói vì sao một màu mang nghĩa ấy, khi nào được dùng nó, và cái gì
bị cấm**. Hệ quả quan sát được:

- Mỗi spec mới tự quyết màu, khoảng cách, cỡ chữ cho phần của mình. Không có ai sai, nhưng
  cũng không có ai đúng theo một thước đo nào.
- Không có trần bão hoà, nên một mảng trang trí có thể rực hơn một con số quan trọng — và
  mắt người đi theo thứ rực nhất.
- P9 của hiến pháp đòi "không chỉ dựa màu", và điều đó đang được giữ **từng chỗ một**, bằng
  cách mỗi lần lại nghĩ lại, chứ không bằng một bảng ghi sẵn cặp màu nào dễ lẫn và cue phụ
  bắt buộc là gì.

**Người dùng đã chỉ ra bốn chỗ cụ thể** ngày 2026-11-25, và chọn **cả bốn**:

1. **Cách xếp thông tin** — sân, dòng tường thuật, bảng điểm, điều khiển, danh sách ghi bàn
   đặt cạnh nhau mà không có thứ bậc rõ; mắt không biết nhìn đâu trước.
2. **Khoảng trắng và cỡ chữ** — khoảng cách giữa các khối không đều, cỡ chữ nhiều bậc rời,
   chữ và viền dày mỏng không theo thang nào.
3. **Màu và đường kẻ** — màu nền, màu cỏ, độ dày vạch sân, màu áo hai đội trông như bản nháp
   hơn là bản phát hành.
4. **Chính sân 2D** — 22 điểm tròn và vài đường kẻ trông như một sơ đồ kỹ thuật, không như
   một trận đấu.

Điểm 4 là chỗ cần nói cho rõ, vì nó đụng vào Non-goals: sân 2D **được chỉnh lại diện mạo**,
**không** được chỉnh lại hành vi. Xem US-8.

**Phần (b) — trục `z` đã có thật, và cái duy nhất xem được lại bỏ nó đi.**

Engine liên tục của spec 007 sinh **độ cao thật**: quả bóng có `z` tới **5,26 m**, và
`tat-canh` là hành động duy nhất có `z` vượt 1,5 m (đo được trên 8,4% số bước không-sút).
Có cả một trạng thái `danh_dau` phát ra từ chính hàm tính độ cao.

Sân 2D vẽ trên một mặt phẳng `viewBox 0 0 100 64`. Nó **không có chỗ nào để đặt `z`**. Nên
trên màn hình:

- một đường chuyền sệt dưới chân,
- một quả tạt bổng qua đầu hàng phòng ngự,
- một pha đánh đầu,
- một quả vọt xà

đều là **cùng một điểm tròn trượt trên cùng một mặt phẳng**. Thông tin đã được tính, đã
được canh bằng phép kiểm, đã nằm trong bộ đệm — rồi bị bỏ ở bước cuối cùng.

### Mục tiêu

Sau khi làm xong:

1. Repo có **một tài liệu hệ thống thiết kế**, nói rõ: vai trò của từng màu, trần bão hoà,
   thang cỡ chữ, thang khoảng cách, ngữ pháp thành phần, và **một bảng cặp màu dễ lẫn kèm
   cue phụ bắt buộc**. **Màn hình xem trận** đi theo nó, và lệch khỏi nó là một lỗi kiểm
   chứng được, không phải chuyện khẩu vị.
2. Khi một trận chạy bằng engine liên tục, người dùng **đổi được sang một góc nhìn thứ hai**
   thấy sân như một **sa bàn nhìn chéo ở 50°**, và ở đó **độ cao của quả bóng đọc được bằng
   mắt**: tạt bổng khác chuyền sệt, đánh đầu khác đệm lòng.
3. Sân 2D **giữ nguyên mọi hành vi và mọi AC đã đóng**, nhưng được **chỉnh lại diện mạo**
   theo hệ thống thiết kế. Đổi góc nhìn rồi đổi về, không mất gì.
4. Hiến pháp lên **4.0.0**, với Changelog nói đúng vì sao.

### Non-goals

Mục này là thứ chặn phình phạm vi. Lần này **KHÔNG** làm:

- **Không thay sân 2D về hành vi.** Nó không bị gỡ, không bị đánh dấu lỗi thời, và **không
  một AC nào của nó bị sửa câu chữ**. Diện mạo thì được chỉnh (US-8) — "làm đẹp lại, không
  làm lại".
- **Không cho quay camera tự do** — không orbit, không pan, không zoom bằng chuột, và
  **không cho người dùng tự đổi đầu gần**. Camera đứng một chỗ ở 50° suốt trận.
- **Không model cầu thủ, không vân bề mặt, không bộ xương chuyển động, không đường ống nạp
  tài nguyên.** Cư dân của sa bàn là hình khối, như sân 2D là điểm tròn.
- **Không vẽ trọng tài.** Engine có ba trọng tài (chỉ số 22–24) mà sân 2D chưa bao giờ vẽ;
  lớp 3D cũng không vẽ, để hai lớp hiển thị **cùng một tập thực thể**.
- **Không đổi một con số nào của trận** (hiến pháp P2). Cùng mã trận cho cùng kết quả, cùng
  từng dòng tường thuật, dù đang xem ở góc nhìn nào. Góc nhìn là **cách xem**, không phải
  cách chơi.
- **Không thêm một phụ thuộc nào.** Lớp 3D dựng bằng phép chiếu tự viết trên nền vẽ hiện có.
- **Không chạm `src/engine/`** ngoài việc đọc.
- **Không áp hệ thống thiết kế ra ngoài màn hình xem trận.** Quản lý đội, xếp đội hình,
  công cụ what-if, lịch sử trận giữ nguyên lần này.
- **Không dựng hạ tầng kiểm thành phần.** Chỉ kiểm phần toán thuần bằng bộ kiểm hiện có.
- **Không bản cho điện thoại và máy tính bảng** — vẫn là non-goal của hiến pháp, dòng 25, và
  dòng ấy **không** bị gỡ lần này.
- **Không luật IFAB, không chiến thuật, không thể lực, không nhịp trận, không thống kê** —
  thuộc spec 008, 009, 010.
- **Không gọi mạng lúc chạy** (hiến pháp P4): không phông chữ tải về, không tài nguyên từ
  CDN, không bản đồ môi trường.
- **Không âm thanh.**
- **Không ngôn ngữ thứ ba** (hiến pháp P8 và non-goal dòng 24).
- **Không xem lại / tua ngược ở góc nhìn 3D.** Spec 007 đã chốt là không có tua ngược; spec
  011 không mang nó vào bằng cửa sau.

---

## 2. Người dùng & bối cảnh

- **Ai dùng:** cùng một người dùng của spec 001–007 — người tự dựng đội, tự xếp chiến thuật,
  rồi **xem trận bằng mắt** để phán xem chiến thuật của mình có chạy không. Người này bắt
  lỗi hình ảnh rất tốt: ở spec 005–006 họ bắt bảy lỗi mà hơn một nghìn phép kiểm không thấy.
  Nên mọi thứ spec này vẽ ra sẽ bị một đôi mắt khó tính đọc kỹ.
- **Khi nào dùng:** góc nhìn 3D dùng **lúc trận đang chạy hoặc đang tạm dừng** bằng engine
  liên tục, cùng chỗ với sân 2D. Hệ thống thiết kế dùng **mọi lúc** trên màn hình xem trận.
- **Thiết bị/môi trường:** trình duyệt trên máy tính để bàn, chạy hoàn toàn trong trình
  duyệt, không có máy chủ. Có người dùng bật **giảm chuyển động** ở hệ điều hành, và lựa chọn
  ấy phải được tôn trọng ở cả hai góc nhìn.

---

## 3. User stories

### US-1: Thấy quả bóng bay cao bao nhiêu

Là một **người xem trận**, tôi muốn **nhìn ra quả bóng đang ở trên không hay dưới chân**, để
**phân biệt được một quả tạt với một đường chuyền sệt mà không phải đọc chữ**.

**Acceptance criteria:**

- [x] AC-46.1 — KHI quả bóng ở độ cao 1 m THÌ nó PHẢI vẽ cách mặt sân một quãng **ít nhất
      bằng một bán kính của chính nó**; KHI ở độ cao 5,26 m THÌ đỉnh PHẢI nằm **trong khung
      ảnh**, không bị cắt.
- [x] AC-46.2 — KHI quả bóng đang ở trên không THÌ PHẢI có **một dấu chỉ điểm chiếu của nó
      xuống mặt sân**, để người xem biết nó đang ở trên chỗ nào chứ không chỉ biết nó cao.
- [x] AC-46.3 — KHI độ cao của bóng đổi giữa hai mốc THÌ quãng vẽ trên màn hình PHẢI đổi theo
      **cùng chiều**: cao hơn thì vẽ cao hơn, không bao giờ ngược.
- [x] AC-46.4 — KHI một mốc mang trạng thái `danh_dau` THÌ quả bóng PHẢI ở độ cao của đầu
      người, không phải dưới chân — con số cụ thể lấy từ chính dữ liệu mốc, không do giao
      diện tự đặt.
- [ ] AC-46.5 — KHI xem cùng một mốc ở hai góc nhìn THÌ vị trí mặt sân `(x, y)` của **22 cầu
      thủ** PHẢI khớp nhau **tuyệt đối**: lớp 3D chỉ thêm `z`, và **không dịch một cầu thủ nào**
      vì bất kỳ lý do hiển thị nào. ⚠️ **Quả bóng KHÔNG thuộc AC này** — xem AC-46.8.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** phép kiểm **P5** của nó là **T784**, nằm trong Phase 62 đang dừng. Bản thân đường đọc đã đúng theo cấu trúc (**D145**) và T777 đã so `(x, y)` của hai lớp từng số trên >1.000 lượt — nhưng P5 đòi một phép kiểm mang đúng tên AC này.
- [x] AC-46.8 — KHI quả bóng được vẽ ở góc nhìn 3D THÌ `x`, `y` và `z` của nó PHẢI đến từ
      **cùng một mốc của engine**, không trộn nguồn.
- [x] AC-46.6 — KHI hệ số phóng đại độ cao được dùng THÌ nó PHẢI tồn tại ở **đúng một chỗ**
      trong mã, và PHẢI nói được cho người dùng rằng độ cao đã được phóng đại — không để ai
      tưởng sa bàn đúng tỉ lệ cả ba trục.
- [ ] AC-46.7 — KHI quả bóng bị một thực thể khác che ở góc nhìn chéo THÌ nó PHẢI **vẫn thấy
      được** (vẽ trên cùng), và PHẢI có một dấu hiệu nói rằng nó đang ở **phía sau** thứ che
      nó, để lớp 3D không nói dối về độ sâu.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T783** (`bongBiChe` + dấu hiệu bị che) nằm trong Phase 62 đang dừng.

### US-2: Đổi qua lại hai góc nhìn

Là một **người xem trận**, tôi muốn **đổi góc nhìn bất cứ lúc nào và đổi về được**, để **dùng
sa bàn khi muốn thấy độ cao và dùng sân phẳng khi muốn đếm người**.

**Acceptance criteria:**

- [x] AC-47.1 — KHI đang xem một trận có dữ liệu liên tục THÌ PHẢI có một cách đổi góc nhìn
      **nhìn thấy được**, nói rõ đang ở góc nhìn nào.
- [x] AC-47.2 — KHI đổi góc nhìn giữa lúc trận đang chạy THÌ trận PHẢI **tiếp tục chạy, không
      nhảy phút, không mất một mốc nào**, và đồng hồ không lùi. *(Mệnh đề "không giật" đã được
      gỡ ngày 2026-11-25: nó không kiểm chứng được bằng quan sát. Phần đo được của nó nằm ở
      **AC-51.5**, nơi có một ngưỡng khung hình thật.)*
- [x] AC-47.3 — KHI đổi góc nhìn rồi đổi về THÌ sân 2D PHẢI trở lại **đúng hành vi như chưa
      từng đổi**: không mất nội suy, không mất dao động chờ, không mất người giữ bóng.
- [x] AC-47.4 — KHI người dùng đã chọn một góc nhìn và mở lại ứng dụng THÌ lựa chọn ấy PHẢI
      được giữ.
- [ ] AC-47.5 — KHI đổi góc nhìn THÌ kết quả trận, dòng tường thuật và mọi con số PHẢI không
      đổi một ký tự nào (hiến pháp P2).
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** phép kiểm **P5** của nó là **T785**, trong Phase 62 đang dừng. T802 đã ghim vân tay dòng sự kiện, nhưng đó là cho AC-53.4, không phải cho việc **đổi góc nhìn giữa trận**.
- [x] AC-47.6 — KHI trận đang chạy bằng engine cổ điển (không có dữ liệu liên tục) THÌ cách
      đổi góc nhìn PHẢI **không xuất hiện**, và PHẢI có một chỗ nói được vì sao, để người dùng
      không phải tự đoán vì sao nó có lúc có lúc không.

### US-3: Màn hình xem trận đi theo một hệ thống có tên

Là một **người dùng**, tôi muốn **màn hình xem trận trông như do một người làm, không như do
bảy spec làm**, để **tin rằng con số nào rực nhất là con số quan trọng nhất**.

**Acceptance criteria:**

- [x] AC-48.1 — KHI mở tài liệu hệ thống thiết kế THÌ mỗi màu trong bảng PHẢI có **tên, giá
      trị, nghĩa, và chỗ được phép dùng**; một màu không có cả bốn thứ là một dòng chưa xong.
- [x] AC-48.2 — KHI một màu được xếp vào tầng **tín hiệu** THÌ nó PHẢI **chỉ** xuất hiện ở
      giao diện và lớp phủ, không bao giờ ở nền trang trí — và điều này PHẢI kiểm được bằng
      một phép kiểm, không bằng mắt.
- [x] AC-48.3 — KHI so một mảng trang trí với một mảng mang thông tin THÌ mảng mang thông tin
      PHẢI có độ bão hoà **cao hơn**, để thứ rực nhất trên màn hình luôn là thông tin.
- [x] AC-48.4 — KHI đọc tài liệu hệ thống thiết kế THÌ PHẢI có một **bảng cặp màu dễ lẫn**,
      mỗi dòng ghi: lẫn với kiểu mù màu nào, và **cue phụ bắt buộc** là gì (hình dạng, chuyển
      động, icon hoặc chữ).
- [x] AC-48.5 — KHI chụp màn hình xem trận và chuyển sang đen trắng THÌ mọi thông tin quyết
      định PHẢI còn đọc được.
- [x] AC-48.6 — KHI cỡ chữ, khoảng cách hoặc độ dày đường kẻ được dùng trên màn hình xem trận
      THÌ nó PHẢI là một bậc trong thang đã ghi của tài liệu, không phải một con số rời.
- [x] AC-48.7 — KHI xem màn hình xem trận THÌ PHẢI có **một thứ bậc rõ**: đọc được ngay cái
      gì là chính và cái gì là phụ, không phải năm khối ngang hàng nhau.
- [x] AC-48.8 — KHI 42 biến màu hiện có được soát lại theo trần bão hoà mới THÌ mọi biến vượt
      trần PHẢI được chỉnh, và tương phản chữ PHẢI được **đo lại** ở cả hai chủ đề sau khi
      chỉnh.

### US-4: Góc nhìn mới không phá điều gì đang đúng

Là một **người dùng đã có bảy spec xanh**, tôi muốn **chắc rằng góc nhìn mới không âm thầm làm
hỏng điều gì**, để **không phải kiểm lại bằng mắt từ đầu**.

> **`/clarify` 2026-11-25 đã chẻ sáu bất biến thành ba nhóm khác loại nhau**, vì chúng không
> cùng loại: hai cái là tính chất của **dữ liệu** (hai lớp đọc cùng một mốc nên chúng đúng
> sẵn); ba cái là **hành vi** (phải làm lại ở lớp mới, không thừa được); một cái là tính chất
> của **hình trên màn hình** (cần một định nghĩa mới cho góc nhìn chéo). Ba nhóm đứng trên ba
> loại phép kiểm khác nhau, và đó là lý do cách chẻ này đáng giá hơn một câu "cả sáu".

**Nhóm 1 — thuộc dữ liệu.**

> ⚠️ **Sửa ngày 2026-11-25, trong lúc `/implement` chạy T777.** Nhóm này được viết với giả
> định *"đúng sẵn, chỉ cần khẳng định"*. Đo trên dữ liệu thật của engine liên tục thì **giả
> định ấy sai**, và nó sai ở hai mức khác nhau. Người dùng đã được nêu đủ số đo và chốt hai
> phương án dưới đây. **Không con số nào bị hạ lặng lẽ** — cả hai món nợ đều được gọi tên và
> trả về đúng chủ của nó là **spec 007**.

- [x] AC-49.1 — **ĐÃ GỠ CHẶN: `T813` của spec 007 xong ngày 2026-11-26.** KHI trận đang chạy ở góc nhìn 3D
      THÌ thủ môn PHẢI luôn nằm trong **một phần ba sân của đội mình** (AC-30.7 đọc lại).
      > 📍 **Hai lần đo, và lần đầu tôi đã đưa người dùng một con số sai — sửa công khai.**
      > Lần một (3 mã trận × 20 phút, lấy mỗi mốc thứ 10): 0,96% và lệch tối đa 2,01 m. Trên số
      > ấy, người dùng chốt "ghi thành nợ có tên". Lần hai, mẫu đủ (**10 mã trận × 45 phút ×
      > mọi mốc = 56.640 lượt**):
      >
      > | | |
      > |---|---|
      > | Ra khỏi một phần ba sân | **1.168 lượt — 2,06%** |
      > | Lệch xa nhất | **31,72 m** |
      > | p50 / p90 / p99 | **1,91 / 8,09 / 24,06 m** |
      >
      > Lệch 31,72 m đặt thủ môn ở `x ≈ 66,7` — **qua vạch giữa sân**. p90 = 8,09 m nghĩa là
      > một phần mười số lần vi phạm vượt 8 m, nên đây **không** phải vài ca biên.
      >
      > Nguyên nhân thuộc **engine spec 007**: nó kẹp **ĐÍCH** của thủ môn chứ không kẹp **VỊ
      > TRÍ** (`coHoc.test.ts:660`). Đây đúng là lỗi mà spec 005 sinh ra AC-30.7 để chặn —
      > `viTriVe.ts:11` ghi rằng lỗi *"thủ môn chạy tới giữa sân"* từng lọt suốt một lát cắt
      > với 1.291 phép kiểm xanh, *"trong khi mắt người dùng bắt được ngay"*.
      >
      > Người dùng chốt trên số đo đúng ngày **2026-11-25**: **mở `T813` ở spec 007**, thay vì
      > để spec 011 đặt ngưỡng 32 m rồi gọi đó là phép kiểm. Spec 011 **MUST NOT** thêm kẹp ở
      > lớp vẽ: `viTriVeLienTuc` đã cố ý tắt đúng phép kẹp ấy.
      >
      > ✅ **T813 xong ngày 2026-11-26**, và nguyên nhân hoá ra khác hẳn: `kepDichThuMon` là
      > **mã chết** — có từ T714, có phép kiểm riêng, nhưng **chưa từng được gọi**. Nối nó vào
      > đường chạy cho **2,06% → 0,06%** và **31,72 m → 2,19 m**. Ngưỡng của AC này nay là
      > **≥ 99,9% số mốc** và **≤ 2,5 m** — đặt sát số đo, vì 0 không dựng nổi: quãng hãm lý
      > thuyết ở 9 m/s là **5,6 m**, và ép về 0 thì phải kẹp vị trí, tức vỡ **AC-38.2**.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** ⛔ **chặn bởi `T813` của spec 007** — engine kẹp ĐÍCH chứ không kẹp VỊ TRÍ, thủ môn ra khỏi một phần ba sân ở 2,06% số mốc, lệch tối đa **31,72 m**. Spec 011 chỉ đọc engine và **không được** kẹp lại ở lớp vẽ.
- [x] AC-49.2 — KHI hai góc nhìn hiển thị **cùng một mốc** THÌ vị trí mà lớp 3D đọc ra PHẢI
      bằng **từng số** với vị trí mà lớp 2D đọc ra, cho **mọi cầu thủ có mặt**.
      > 📍 **AC này đã được THU HẸP ngày 2026-11-25.** Bản đầu đọc lại AC-30.8: *"hàng phòng
      > ngự của một đội PHẢI đứng giữa tiền đạo đối phương và khung thành của mình"*. Đo thật
      > thì mệnh đề ấy **sai ở 98,9%** số mẫu. Một mốc đại diện, tính bằng mét dọc sân:
      >
      > | | khách ST | nhà GK | nhà DEF | khách MID | nhà MID | khách DEF | nhà ST | khách GK |
      > |---|---|---|---|---|---|---|---|---|
      > | `x` | **15–17** | 19 | 35–39 | 36–37 | 59–62 | 59–60 | 78–82 | 80 |
      >
      > Tiền đạo khách **cắm ở x ≈ 15**, tức sau lưng cả hàng phòng ngự nhà *và* qua mặt thủ
      > môn nhà. Thứ tự tám hàng mà AC-30.8 đòi không tồn tại ở đây.
      >
      > **Vì sao đây không phải lỗi hồi quy:** AC-30.8 được spec 005 kiểm trên **bố cục cổ
      > điển** (`hinhSan`, "cả chín tổ hợp độ cao đội hình") — một nguồn vị trí **khác hẳn**.
      > Engine liên tục của spec 007 đặt người bằng vật lý và chiến thuật, và **chưa bao giờ
      > hứa** thứ tự tám hàng. Spec 011 chỉ **đọc**, nên nó không gây ra điều này và cũng không
      > sửa được — P2 cấm nó đổi một con số trận nào.
      >
      > AC-49.2 vì thế nói điều **thật sự đúng và thật sự thuộc về spec 011**: hai lớp vẽ đứng
      > trên **một** đường đọc duy nhất (**D145**), nên chúng không thể lệch nhau. Món nợ "tám
      > hàng ở engine liên tục" được ghi tên và trả về **spec 007**.

**Nhóm 2 — thuộc hành vi, phải làm lại ở lớp mới:**

- [ ] AC-49.3 — KHI trận đang **tạm dừng** ở góc nhìn 3D THÌ **mọi chuyển động PHẢI dừng
      hẳn**, kể cả dao động chờ (AC-28.5 đọc lại).
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T778** nằm trong Phase 62 đang dừng. Vòng khung hình của `San3D` **đã** gác `if (!dangChay) return undefined`, nhưng chưa có phép kiểm mang tên AC này.
- [ ] AC-49.4 — KHI trận đang tạm dừng hoặc đã kết thúc ở góc nhìn 3D THÌ quả bóng PHẢI **vẫn
      có mặt**, ở đúng độ cao của mốc ấy (AC-32.7 đọc lại).
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T779** nằm trong Phase 62 đang dừng. `San3D` **đã** vẽ bóng từ mốc đang hiển thị nên đóng băng không làm nó mất, nhưng chưa được kiểm.
- [ ] AC-49.5 — KHI hệ điều hành bật **giảm chuyển động** THÌ góc nhìn 3D PHẢI không nội suy và
      không có chuyển động chờ, mà vẫn hiển thị đúng vị trí **và đúng độ cao** tại từng mốc
      (AC-31.1 đọc lại).
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T780** nằm trong Phase 62 đang dừng. Hook dùng chung **đã** bóc sẵn ở T812; việc còn lại là `San3D` import và tôn trọng nó.

**Nhóm 3 — thuộc hình trên màn hình, cần định nghĩa mới:**

- [ ] AC-49.6 — KHI hai thực thể chiếu thành hai hình sát nhau trên màn hình THÌ người xem
      PHẢI vẫn **phân biệt được** là hai, không phải một — đo **sau khi chiếu**, không đo bằng
      mét trên mặt sân, vì đó mới là điều AC-30.5 thật sự hứa.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T781** (`phanBietDuoc`) nằm trong Phase 62 đang dừng.
- [ ] AC-49.7 — KHI hai hình sát nhau được tách ra THÌ việc tách PHẢI làm bằng **viền**, không
      bằng cách dịch thực thể: AC-46.5 đứng tuyệt đối, và viền không được đọc nhầm thành một
      trạng thái của cầu thủ.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** **T782** (tách bằng viền) nằm trong Phase 62 đang dừng. Chồng lấn giữa các đĩa **thấy rõ** trên bản chạy — đây là AC chưa đạt có hệ quả nhìn được.

**Toàn cục:**

- [x] AC-49.8 — KHI sân 2D được xem sau khi spec 011 xong THÌ **mọi AC đã đóng** của spec 002,
      004, 005, 006 PHẢI còn xanh, không một AC nào bị sửa câu chữ để vừa với lớp mới.
- [x] AC-49.9 — KHI góc nhìn 3D được thêm vào THÌ phép kiểm ranh giới tầng PHẢI còn xanh:
      không file nào của `src/engine/` import tầng giao diện, và `src/engine/` không có một
      dòng nào thay đổi.

### US-5: Dùng được bằng bàn phím, và không chỉ dựa màu

Là một **người dùng không dùng chuột hoặc không phân biệt được một số màu**, tôi muốn **dùng
được góc nhìn mới như mọi phần khác**, để **không bị loại khỏi một tính năng**.

**Acceptance criteria:**

- [x] AC-50.1 — KHI chỉ dùng bàn phím THÌ cách đổi góc nhìn PHẢI tới được, nhận được tiêu điểm
      **nhìn thấy được**, và kích hoạt được.
- [x] AC-50.2 — KHI đo tương phản của mọi chữ ở cả hai chủ đề sáng và tối THÌ nó PHẢI đạt tối
      thiểu **4,5:1** (hiến pháp P9).
- [x] AC-50.3 — KHI hai đội được phân biệt ở góc nhìn 3D THÌ PHẢI có **thêm ít nhất một kênh
      ngoài màu** (hình dạng, hoa văn hoặc chữ), đủ để đọc trong ảnh đen trắng.
- [x] AC-50.4 — KHI một chuỗi mới xuất hiện ở giao diện THÌ nó PHẢI có **đủ cả bản tiếng Việt
      và tiếng Anh trong cùng commit** (hiến pháp P8), và không chuỗi nào rơi về khoá thô.
- [x] AC-50.5 — KHI một người dùng trình đọc màn hình gặp góc nhìn 3D THÌ nó PHẢI tự giới thiệu
      được nó là gì và đang hiển thị gì ở mức tóm tắt, chứ không im lặng.
- [x] AC-50.6 — KHI số áo được hiển thị ở góc nhìn 3D THÌ nó PHẢI là **lớp phủ cỡ cố định**,
      luôn quay mặt về người xem, đọc được như nhau ở đầu gần và đầu xa — để AC-15.1 (đếm được
      điểm) đứng được ở lớp mới.

### US-6: Không làm chậm thứ đang nhanh

Là một **người dùng**, tôi muốn **góc nhìn mới không ăn mất ngân sách vẽ đã hứa**, để **trận
vẫn chạy mượt như hôm nay**.

**Acceptance criteria:**

- [ ] AC-51.1 — KHI trận chạy ở góc nhìn 3D ở **cả năm mức tốc độ** THÌ mỗi khung vẽ PHẢI gọn
      trong một nhịp, đạt **59 khung/giây** — kể cả khi 22 lớp phủ số áo cùng được vẽ.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** ⏸ **không đo được trong môi trường này.** Khung xem trình duyệt không được vẽ ở nhịp thật: trần đo được ~30 fps cho **cả hai** lớp, và có lúc 5 khung trong 4 giây **với 0 tác vụ dài** — tức trình duyệt không lên lịch khung, không phải ứng dụng chậm. Xem T804.
- [x] AC-51.2 — KHI trận chạy ở góc nhìn 3D THÌ KHÔNG tác vụ nào được quá **50 ms**.
- [x] AC-51.3 — KHI chạy hết một trận ở góc nhìn 3D THÌ PHẢI xong trong **dưới 3 giây** ở mức
      nhanh nhất.
- [ ] AC-51.4 — KHI mở ứng dụng THÌ PHẢI xong trong **dưới 2 giây**, kể cả khi góc nhìn đã lưu
      là 3D.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** ⏸ **không đo được**, hỏng vì ba lý do cùng lúc: chỉ có 2 đội thay vì 20, `first-contentful-paint` đo ra 41.632 ms (bất khả thi), và đây là bản dev tải 134 module rời. Xem T807.
- [ ] AC-51.5 — KHI đổi góc nhìn THÌ KHÔNG được có một khung nào bị bỏ quá ngưỡng của AC-51.1
      trong lúc đổi.
      > ⬜ **CHƯA ĐẠT (T810, 2026-11-26):** ⏸ **không đo được** vì nó đo theo ngưỡng của AC-51.1, mà ngưỡng ấy chưa xác nhận được. Xem T808.
- [x] AC-51.6 — KHI ứng dụng chạy THÌ KHÔNG có một lời gọi mạng nào phát ra cho việc vẽ (hiến
      pháp P4) — không phông chữ, không tài nguyên, không bản đồ môi trường.
- [x] AC-51.7 — KHI spec 011 xong THÌ danh sách phụ thuộc PHẢI **không thêm một dòng nào** so
      với trước.

### US-7: Hiến pháp được sửa đúng cách, không bị vi phạm lặng lẽ

Là một **người đọc hồ sơ dự án sau này**, tôi muốn **biết vì sao dự án từng cấm 3D rồi lại làm
3D**, để **không tưởng dự án đi lạc**.

**Acceptance criteria:**

- [x] AC-52.1 — KHI spec 011 bắt đầu được thực thi THÌ hiến pháp PHẢI đã lên **4.0.0**, với
      dòng "Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm" đã gỡ khỏi Non-goals.
- [x] AC-52.2 — KHI đọc Changelog của hiến pháp THÌ PHẢI có một dòng 4.0.0 nói rõ: gỡ cái gì,
      vì sao là MAJOR, và kéo theo những mục nào.
- [x] AC-52.3 — KHI đọc hiến pháp 4.0.0 THÌ nó PHẢI nói rõ non-goals của spec 001 **không bị
      sửa ngược**, và spec 011 dẫn về mục 1 — đúng khuôn mục 1 đã đặt cho lần 3.0.0.
- [x] AC-52.4 — KHI đọc hiến pháp 4.0.0 THÌ non-goal "bản cho điện thoại và máy tính bảng" và
      non-goal "ngôn ngữ thứ ba" PHẢI còn nguyên: lần này chỉ gỡ đúng một dòng.

### US-8: Sân 2D được làm đẹp lại, không bị làm lại

Là một **người dùng**, tôi muốn **sân 2D thôi trông như một sơ đồ kỹ thuật**, để **nó trông
như một trận đấu mà vẫn đọc được đúng như hôm nay**.

> Người dùng nêu "chính sân 2D" là một trong bốn chỗ thiếu chuyên nghiệp. Đây là ranh giới
> phải viết rõ, vì nó sát một Non-goal: **diện mạo đổi được, hành vi thì không.**

**Acceptance criteria:**

- [x] AC-53.1 — KHI sân 2D được chỉnh lại diện mạo THÌ nó PHẢI đi theo hệ thống thiết kế: màu
      cỏ, độ dày vạch sân, màu áo hai đội, kiểu điểm cầu thủ đều là giá trị trong thang đã ghi.
- [x] AC-53.2 — KHI sân 2D được chỉnh lại diện mạo THÌ **mọi AC đã đóng** của spec 002, 004,
      005, 006 PHẢI còn xanh, và **không một con số hành vi nào** đổi: bán kính điểm, khoảng
      giãn, biên độ dao động, ngưỡng nội suy giữ nguyên giá trị hoặc đổi kèm một AC mới nói rõ.
- [x] AC-53.3 — KHI sân 2D được chỉnh lại diện mạo THÌ số áo PHẢI còn đếm được và đọc được
      đúng như trước (AC-15.1), và tương phản PHẢI được đo lại ở cả hai chủ đề.
- [x] AC-53.4 — KHI sân 2D được chỉnh lại diện mạo THÌ KHÔNG con số nào của trận đổi (hiến
      pháp P2): cùng mã trận cho cùng kết quả và cùng từng dòng tường thuật.

---

## 4. Luồng chính (happy path)

1. Người dùng mở một trận và cho chạy bằng engine liên tục → sân hiện ra ở góc nhìn đã lưu
   lần trước.
2. Người dùng bấm cách đổi góc nhìn → sân chuyển sang **sa bàn nhìn chéo ở 50°**, trận không
   ngắt một nhịp.
3. Một quả tạt được thực hiện → quả bóng **rời mặt sân**, bay lên tới khoảng 15% chiều cao
   ảnh, có một dấu chiếu di chuyển trên cỏ bên dưới nó, rồi hạ xuống chỗ người nhận.
4. Một cầu thủ đi ngang trước quả bóng → bóng **vẫn thấy được**, kèm dấu hiệu nói nó đang ở
   phía sau.
5. Người dùng tạm dừng → **mọi thứ đóng băng**, bóng vẫn ở trên không đúng độ cao của mốc ấy.
6. Người dùng bấm đổi về sân phẳng → sân 2D trở lại, đúng như chưa từng đổi.
7. Người dùng đóng ứng dụng, mở lại → góc nhìn lần trước được giữ.

---

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| **Trận chạy bằng engine cổ điển, không có dữ liệu liên tục** | Cách đổi góc nhìn **không xuất hiện**, và có một chỗ nói được vì sao (AC-47.6). Không vẽ sa bàn với độ cao luôn bằng 0 — đó là một lời nói dối im lặng về chính thứ góc nhìn này sinh ra để kể. |
| Chưa có trận nào chạy | Cách đổi góc nhìn không được bày ra như thể bấm được rồi không có gì xảy ra. |
| Trận đang tạm dừng | Mọi chuyển động dừng hẳn, kể cả dao động chờ; bóng vẫn có mặt, vẫn đúng độ cao (AC-49.3, AC-49.4). |
| Giảm chuyển động bật | Không nội suy, không dao động; vị trí **và độ cao** tại từng mốc vẫn đúng (AC-49.5). Lớp phủ số áo không được nhấp nháy theo người giữ bóng. |
| Bóng bị một cầu thủ che | Bóng vẽ trên cùng, kèm dấu hiệu nói nó ở phía sau (AC-46.7). |
| **Bóng ở hai góc nhìn không cùng một chỗ** | **Đây là hệ quả đã nhận, không phải lỗi.** Sân 2D vẽ bóng từ đường pha bóng của spec 006, vốn bị nén cho vừa một nhịp; góc nhìn 3D vẽ bóng từ chính mốc engine (AC-46.8). Hai nguồn, hai mốc thời gian. Đổi góc nhìn giữa một đường bóng có thể thấy bóng nhảy một quãng — và quãng ấy **không được** làm đồng hồ lùi hay mốc bị mất (AC-47.2). |
| Hai thực thể chiếu sát nhau | Tách bằng viền, **không dịch ai** (AC-49.6, AC-49.7). |
| Quả bóng ở độ cao lớn nhất, gần biên trên của sân | Sân chiếm 49,0 đơn vị và đỉnh bóng thêm 9,5 → 58,6 trên 64, còn 5,4 đơn vị lề. Đỉnh vẫn trong khung (AC-46.1). |
| Hai đội đổi sân giữa hiệp | Camera **không đổi**: đứng một chỗ từ đầu tới cuối. Đội nhà đá về phía xa trong đúng một hiệp, và đó là cái giá đã chốt. |
| Cửa sổ trình duyệt rất hẹp hoặc rất thấp | Sa bàn tự căn khung để cả sân nằm trong khung; không cắt mất một phần sân, không để người dùng phải cuộn để thấy khung thành. |
| Người dùng mù màu | Hai đội phân biệt được bằng ít nhất một kênh ngoài màu (AC-50.3). |
| Mất mạng | Không ảnh hưởng gì: không có lời gọi mạng nào cho việc vẽ (AC-51.6). |
| Dữ liệu mốc thiếu một thực thể | Lô mốc của spec 007 đã từ chối ghi một mốc thiếu thực thể, nên trường hợp này không tới được tầng giao diện. Giao diện **không** tự bù một thực thể giả. |
| Một biến màu hiện có vượt trần bão hoà mới | Chỉnh biến ấy, rồi **đo lại tương phản** ở cả hai chủ đề (AC-48.8). Không giữ nguyên rồi ghi ngoại lệ. |

---

## 6. Yêu cầu phi chức năng

- **Hiệu năng:** 59 khung/giây ở cả năm mức tốc độ; không tác vụ nào quá 50 ms; chạy hết trận
  dưới 3 giây; mở ứng dụng dưới 2 giây. Đây là **ngân sách đã đo và đã hứa** từ các spec
  trước, không phải con số mới. Lớp 3D thêm 26 hình khối cộng tới 22 lớp phủ số áo mỗi khung,
  nên ngân sách này phải được **đo lại**, không được khẳng định suông.
- **Phụ thuộc: không thêm một dòng nào.** Đã chốt 2026-11-25. Camera cố định ở 50° với yaw 0
  nên phép chiếu là một biến đổi affine, tự viết được trên nền vẽ hiện có — và nhờ vậy 42 biến
  màu, chủ đề sáng/tối, bàn phím, trình đọc màn hình, giảm chuyển động của spec 003/005/006
  **thừa được nguyên**, thay vì phải làm lại từ đầu. Cái giá: không có ánh sáng và bóng đổ
  thật, và thứ tự vẽ theo độ sâu phải tự sắp mỗi khung.
- **Bảo mật/quyền riêng tư:** không gọi mạng lúc chạy (P4). Không tài nguyên ngoài.
- **Accessibility:** bàn phím tới được mọi điều khiển mới; tương phản chữ ≥ 4,5:1 ở cả hai chủ
  đề, **đo lại** sau khi chỉnh màu theo trần bão hoà; không thông tin nào chỉ dựa màu; tôn
  trọng giảm chuyển động.
- **Song ngữ:** mọi chuỗi mới đủ Việt–Anh trong cùng commit (P8).
- **Dữ liệu:** spec này **không thêm dữ liệu lưu lâu dài** ngoài **một** lựa chọn góc nhìn.
  Không thêm bản ghi nào vào trận đã lưu, nên tệp sao lưu không to thêm.
- **Tính tất định:** cùng một mốc, cùng một kích thước khung → cùng một hình. Hình là **hàm
  của trạng thái**, theo đúng Core Rule 1 của template.
- **Lưới kiểm:** phép chiếu, hệ số độ cao, thứ tự vẽ theo độ sâu và phép thử "hai hình có phân
  biệt được không" tách thành **hàm thuần** và kiểm bằng bộ kiểm hiện có. Phần ghi ra DOM,
  phần tương phản và phần trình đọc màn hình **vẫn không có lưới** — R52 thu nhỏ lại, không
  đóng. Điều này được ghi ở đây để không ai đọc bảy nhóm AC trên mà tưởng chúng đều có phép
  kiểm gác.

---

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution — và hiến pháp **đã** lên 4.0.0 **trước**
      khi task đầu tiên của lớp 3D chạy
- [ ] Mọi AC đã đóng của spec 002, 004, 005, 006 còn xanh, **không** AC nào bị sửa câu chữ để
      vừa với lớp mới
- [ ] Phép kiểm ranh giới tầng còn xanh, và `src/engine/` không có một dòng nào thay đổi
- [ ] Tài liệu hệ thống thiết kế tồn tại, và có ít nhất một phép kiểm gác được một quy tắc của
      nó (AC-48.2)
- [ ] Số đo ngân sách vẽ ở góc nhìn 3D được **ghi lại**, không chỉ được khẳng định
- [ ] Danh sách phụ thuộc không thêm một dòng nào (AC-51.7)
- [ ] Tương phản được đo lại ở cả hai chủ đề sau khi chỉnh màu (AC-48.8, AC-53.3)

---

## 8. Câu hỏi mở

> Rỗng. 11 câu cần làm rõ của bản Draft đã được chốt ngày 2026-11-25, cùng ba câu phát sinh
> trong lúc hỏi — tổng 14 quyết định, xem mục 10. Spec sẵn sàng cho `/plan`.

---

## 9. Giả định

- **Spec 007 đóng trước.** Spec 011 đọc lô mốc của engine liên tục, nên nó cần spec 007 ở
  trạng thái Done. Spec 007 đang ở 39/50 task.
- **Nhánh cắt từ `main`** sau khi spec 007 đã nhập vào `main`. Nếu cắt sớm hơn thì lô mốc có
  thể còn đổi hình dạng.
- **Lô mốc là hợp đồng.** `loMoc.ts` tự ghi rằng bố cục bộ đệm là "một phần HỢP ĐỒNG của
  engine". Spec 011 dựa vào điều đó và chỉ đọc.
- **Số nhóm AC.** Spec này dùng nhóm **46–53**. Nhóm lớn nhất đang dùng là 45 (spec 007).
  Nhóm AC được cấp lúc viết, không được giữ trước, nên spec 008, 009, 010 khi được viết sẽ
  lấy các nhóm còn trống lúc ấy. Nếu dự án muốn giữ trước nhóm cho ba spec đã dành số thì
  spec này phải đổi sang nhóm cao hơn.
- **"Sa bàn" là một góc nhìn, không phải một chế độ chơi.** Nó không thêm một quyết định nào
  cho người dùng trong trận, không thêm một can thiệp nào cần ghi lại để phát lại (P1).
- **Hiến pháp 4.0.0 được viết bằng `/constitution`**, không sửa tay, để Changelog và cách bump
  đi theo đúng khuôn các lần trước.
- **Hệ số ×3 và góc 50° là số của lớp vẽ**, không phải số của trận. Đổi chúng không đổi một
  con số nào của trận (P2), nên chúng ở lại trong lớp giao diện và `plan.md` sở hữu chúng.

---

## 10. Nhật ký làm rõ

Toàn bộ chốt ngày **2026-11-25**, trong bốn đợt hỏi.

| # | Câu hỏi | Quyết định | Cái giá đã nhận |
|---|---|---|---|
| 1 | Ở tỉ lệ thật độ cao bóng gần như vô hình (đo: 1 m = 0,19–0,42 lần bán kính bóng; 5,26 m = 1,0–2,2 lần) | **Phóng đại bằng hệ số có tên, ×3** | Sa bàn không còn đúng tỉ lệ cả ba trục; hệ số phải ghi rõ, không ẩn (AC-46.6) |
| 2 | Dựng lớp 3D bằng gì | **Tự chiếu trên nền vẽ hiện có, không thêm phụ thuộc** | Không có ánh sáng và bóng đổ thật; phải tự sắp thứ tự vẽ theo độ sâu mỗi khung; phải đo lại ngân sách |
| 3 | Sáu bất biến của sân 2D có đứng ở lớp 3D không | **Phân ba nhóm**: dữ liệu (đúng sẵn) / hành vi (làm lại) / hình trên màn hình (định nghĩa mới) | US-4 phức tạp hơn một câu "cả sáu", và ba nhóm đứng trên ba loại phép kiểm khác nhau |
| 4 | Hệ thống thiết kế áp cho màn hình nào | **Chỉ màn hình xem trận** | Các màn hình còn lại giữ nền cũ, nên ứng dụng sẽ có hai phong cách sống cạnh nhau |
| 5 | Góc camera và hệ số phóng đại | **θ = 50°, hệ số ×3** | Là góc nghiêng nhất trong ba cặp được cân, nên che nhau nhiều nhất |
| 6 | Bóng bị người che ở góc nhìn chéo | **Bóng luôn vẽ trên cùng**, kèm dấu hiệu nói nó ở phía sau | Sai về hình học; cần dấu hiệu để không nói dối về độ sâu (AC-46.7) |
| 7 | Trận cổ điển không có `z` | **Ẩn hẳn cách đổi góc nhìn** | Một điều khiển biến mất tuỳ trận; phải có chỗ nói được vì sao (AC-47.6) |
| 8 | Có dựng lưới kiểm thành phần đầu tiên của repo không | **Chỉ kiểm phần toán thuần** bằng bộ kiểm hiện có | Phần ghi ra DOM, tương phản, trình đọc màn hình vẫn không có lưới — R52 thu nhỏ, không đóng |
| 9 | Ba trọng tài của engine có vẽ không | **Không vẽ** | Dữ liệu vị trí trọng tài đã tính và đã canh bằng phép kiểm rồi vẫn không ai thấy — cùng loại lỗi spec này lập ra để sửa, ở một trục khác |
| 10 | Bảng màu đi theo art-bible đến mức nào | **Chỉ lấy phương pháp**, giữ 42 biến màu của spec 003 | Một số biến có thể đang vượt trần bão hoà mới, nên phải chỉnh và đo lại tương phản (AC-48.8) |
| 11 | Số áo có đọc được ở 3D không | **Có, lớp phủ cỡ cố định** | Thêm tới 22 phần tử chữ mỗi khung vẽ, nên phải đo lại ngân sách (AC-51.1) |
| 12 | "Không chồng khít" đo bằng gì ở 3D | **Đo trên màn hình sau khi chiếu** | Thước này đúng điều AC-30.5 hứa, nhưng nó tạo mâu thuẫn với AC-46.5 — giải ở câu 13 |
| 13 | Hai hình chiếu sát nhau tách bằng cách nào | **Tách bằng viền, không dịch ai** | AC-46.5 đứng tuyệt đối; nhưng viền là một tín hiệu hình thứ ba trên sân, phải không bị đọc nhầm thành trạng thái của cầu thủ |
| 14 | Màn hình xem trận thiếu chuyên nghiệp ở chỗ nào | **Cả bốn**: cách xếp thông tin; khoảng trắng và cỡ chữ; màu và đường kẻ; chính sân 2D | Điểm thứ tư đụng Non-goal, nên ranh giới được viết rõ thành **US-8: làm đẹp lại, không làm lại** — diện mạo đổi được, hành vi và AC thì không |
| 15 | **Quả bóng lấy vị trí từ đâu?** `/analyze` tìm ra bóng có **hai nguồn**: sân 2D vẽ bóng bằng `viTriBongTrongPha` của `phaBong.ts` (`San2D.tsx:1543`, `:1846`), còn `loMoc` chỉ dùng cho cầu thủ (`:1773`); `CHI_SO_BONG` không có trong một dòng code sản phẩm nào. Và `dongThoiGianPhaBong` **nén mọi đoạn cho vừa một nhịp** (`:1076`), nên bóng 2D còn khác cả mốc thời gian | **Lấy cả `x`, `y`, `z` của bóng từ mốc engine** (phương án b). Độ cao và vị trí cùng một nguồn, cùng một mốc thời gian | **AC-46.5 thu hẹp còn 22 cầu thủ**, và thêm **AC-46.8** cho quả bóng. Hệ quả nhìn thấy được: **bóng ở hai góc nhìn có thể ở hai chỗ khác nhau** — ghi vào bảng trường hợp biên mục 5. Hai phương án bị loại: (a) lấy `x, y` từ `phaBong` và chỉ `z` từ mốc — giữ được AC-46.5 nguyên văn nhưng trộn hai mốc thời gian, nên dấu chiếu của AC-46.2 sẽ chỉ sai chỗ; (c) đổi sân 2D để nó cũng đọc bóng từ mốc — đúng nhất về kiến trúc nhưng chạm `San2D.tsx` ngay Phase 61, phá điều kiện RA của T786, rơi vào R64 và đụng `AC-33.1` của spec 006 |

**Một con số đã sửa trong lúc làm rõ:** ở đợt hỏi thứ hai, phương án "50°" được trình với con
số "sân chiếm 64% chiều cao ảnh". Con số ấy sai — 64% là của 40°; 50° cho **77%**, vì chiều
sâu sân chiếu theo `sin(θ)` chứ không phải `cos(θ)`. Quyết định không đổi: cặp 50°/×3 vẫn là
cặp cân nhất theo tiêu chí đã dùng để chọn nó (độ cao 1 m đọc được), và sân cộng đỉnh bóng là
58,6 trên 64 đơn vị nên vẫn lọt khung. Ghi lại ở đây vì một con số đã đưa cho người dùng để
quyết thì phải sửa công khai, không sửa lặng lẽ.

**Một con số thứ hai đã sửa ở `/plan` (2026-11-25).** Bản Clarified viết `AC-51.1` và mục 6 là
"cả **bốn** mức tốc độ". Repo có **năm**: `MS_MOI_PHUT` là `rat-cham 4000 · cham 2000 ·
thuong 1000 · nhanh 200 · rat-nhanh 20`, và spec 006 đã đo "ở cả năm mức". Con số 4 sai theo
chiều **dễ hơn thực tế**: nó bỏ sót đúng `rat-nhanh`, mức nằm dưới `NHIP_TOI_THIEU_DE_NOI_SUY
= 40` nên ở đó không có nội suy, và `plan.md` xếp nó là mức dễ vỡ ngân sách nhất (R62). Người
dùng chốt sửa thành **năm mức** ngày 2026-11-25. Đây là sửa **dữ kiện**, không nới hay thu
phạm vi — nó làm `AC-51.1` kiểm được đúng cái nó định kiểm.
