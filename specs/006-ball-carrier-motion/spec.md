# Spec: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **ID** | `006-ball-carrier-motion` |
| **Status** | **Done** (2026-11-22) |
| **Created** | 2026-11-18 |
| **Branch** | `006-ball-carrier-motion` — **cắt từ `005-lifelike-pitch-motion`, không phải từ `main`** |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> ## ⚠️ ĐÓNG VỚI BA AC CHƯA ĐẠT — đọc mục 12 trước khi tin bảng tick
>
> **18 trong 21 AC đạt.** Ba AC còn lại **không** được tick, và mỗi cái có một quyết
> định của người dùng đứng sau cùng một chỗ nó đi tiếp:
>
> | AC | Trạng thái | Người dùng chốt | Đi đâu |
> |---|---|---|---|
> | **AC-34.2** (đi vòng qua đối thủ) | Chưa làm | Bỏ Phase 50 ngày 2026-11-19 | spec 007 / 009 |
> | **AC-36.1** (mọi điểm di chuyển có mục đích) | Đạt một phần | Chuyển sang spec sau, 2026-11-22 | spec 009, US-41 |
> | **AC-36.5** (độ vòng dưới năm lần) | Đạt một nửa | "Để nợ" ngày 2026-11-19 | spec 007 |
>
> Và **AC-33.3 đạt KÈM một ngoại lệ**: nhịp lặng sau bàn thắng được miễn ngưỡng
> 300ms, người dùng chốt ngày 2026-11-19. Xem ghi chú ngay tại AC ấy.

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

- [x] AC-33.1 — KHI trận đang chạy và bóng không đang bay THÌ PHẢI có **đúng một** cầu thủ đang giữ bóng, và quả bóng PHẢI nằm sát chân anh ta — cách tâm điểm của anh ta **không quá một bán kính điểm**.
- [x] AC-33.2 — KHI người giữ bóng di chuyển THÌ quả bóng PHẢI đi **cùng** anh ta trong suốt quãng đường ấy, KHÔNG được rời ra rồi đuổi theo sau, và KHÔNG được tới đích trước rồi đứng đợi.
- [x] AC-33.3 — KHI xem bất kỳ mười giây nào của một trận đang chạy ở một mức còn nội suy THÌ quả bóng PHẢI không đứng yên quá **300ms** liên tục. *(Đo được trước spec này: 3144ms.)*

  > **NGOẠI LỆ, người dùng chốt 2026-11-19: nhịp lặng sau bàn thắng được miễn.**
  > Sau một bàn thắng quả bóng về **chấm giao bóng** rồi nằm đó **1009ms** chờ giao
  > bóng lại — đó chính là nhịp lặng mà **AC-32.5 của spec 005 cố tình đặt ra**, và
  > là điều một quả bóng thật làm. Hai AC kéo ngược nhau; người dùng chọn giữ nhịp
  > lặng.
  >
  > **Ngoài phút có bàn thắng, quãng đứng yên dài nhất của cả trận là 34ms** — tức
  > hai nhịp lấy mẫu, bằng đúng độ phân giải của phép đo. Đo riêng từng loại dòng
  > không mang pha bóng, chính chỗ con số 3144ms sinh ra: `kiet-suc` 33/34/32ms,
  > `thay-nguoi` 32ms, thẻ vàng và thẻ đỏ 33ms. Tỉ lệ khung có bóng di chuyển:
  > **35,5% → 93,8%**.
- [x] AC-33.4 — KHI một cầu thủ đang giữ bóng THÌ quanh điểm của anh ta PHẢI có một **vòng sáng** riêng, và vòng ấy PHẢI chuyển sang người khác đúng lúc quyền giữ bóng đổi. Dấu hiệu này PHẢI đọc được mà không dựa vào màu (hiến pháp P9), và PHẢI không lẫn với viền vàng của người tham gia tình huống hay dấu ▲ đã có từ spec 001.
- [x] AC-33.6 — KHI người dùng muốn ngắm một pha dẫn bóng THÌ PHẢI có một mức tốc độ **2000ms một phút trận** — chậm gấp đôi mức chậm nhất hiện nay — với nhãn đủ tiếng Việt và tiếng Anh, chọn được bằng bàn phím.
- [x] AC-33.5 — KHI không ai giữ bóng (bóng đang bay giữa hai người, hoặc bóng ở giữa sân trước giờ bóng lăn) THÌ ứng dụng PHẢI vẫn vẽ bóng đúng chỗ của nó và KHÔNG được gán nhầm cho một cầu thủ.

### US-34: Dẫn bóng và qua người

Là một **người dùng**, tôi muốn **thấy cầu thủ chạy với bóng trong chân và đi vòng
qua người cản**, để **một pha đi bóng trông như một pha đi bóng chứ không như hai
điểm bị dịch chỗ**.

**Acceptance criteria:**

- [x] AC-34.1 — KHI người giữ bóng phải đi một quãng dài trong một nhịp THÌ PHẢI thấy **người và bóng cùng đi** suốt quãng ấy, với khoảng cách giữa hai điểm luôn dưới một bán kính (AC-33.1).
- [ ] AC-34.2 — KHI dòng tường thuật kể một bước là **rê bóng** THÌ trên sân PHẢI thấy người giữ bóng tự mang bóng đi qua bước ấy — không phải một đường chuyền — và anh ta PHẢI **đi vòng** qua điểm của bất kỳ đối thủ nào nằm trên đường đi, chứ KHÔNG đi xuyên qua: hai điểm KHÔNG được chồng khít tới mức người xem chỉ thấy một (giữ AC-30.5 của spec 005 và AC-15.2 của spec 002).

  > **⚠️ KHÔNG ĐẠT — mệnh đề "đi vòng qua đối thủ" chưa làm.** Người dùng chốt **bỏ
  > Phase 50** (T609, T610) ngày 2026-11-19, vì lát ấy dựng việc đi vòng bằng cách
  > **lách điểm ở tầng giao diện**, mà engine liên tục của spec 007 có toạ độ mét
  > thật nên ở đó đi vòng là **hệ quả tự nhiên** chứ không phải một phép lệch bù vào
  > sau. Làm Phase 50 là làm một việc biết trước sẽ xoá.
  >
  > **Mệnh đề thứ nhất thì ĐẠT**: một bước `rê bóng` được vẽ thành người tự mang
  > bóng đi, và T625 còn siết lại chính định nghĩa ấy — chỉ là rê khi bóng tiến lên
  > mà **giữ nguyên cột**, nên rê còn **20,1%** số lần chạm bóng thay vì 58,4%.
  >
  > **Mệnh đề "không chồng khít" cũng ĐẠT** và được canh liên tục: nó chính là
  > AC-30.5 và AC-15.2, và ba phép kiểm bất biến đo nó ở mọi lát.

  > **"Qua người" là chuyện THẬT của trận, không phải cách vẽ** (chốt 2026-11-19).
  > Engine đã phân loại từng bước của một pha bóng từ spec 001 — **chuyền, rê bóng,
  > tạt cánh, sút** — nhưng dòng sự kiện phát ra ngoài **vứt mất phần loại**, chỉ
  > giữ danh sách vùng. Spec này cho phần loại đi kèm ra ngoài. Đó là dữ liệu **đã
  > tính sẵn**: không rút thêm số ngẫu nhiên nào, không đổi kết cục nào.
- [x] AC-34.3 — KHI xem cùng một trận hai lần ở cùng một mức tốc độ THÌ đường dẫn bóng PHẢI giống hệt nhau (hiến pháp P1).
- [x] AC-34.4 — KHI chuyển động mới đang bật THÌ tỉ số, **từng dòng tường thuật**, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.

### US-35: Chuyền và sút nhìn ra được

Là một **người dùng**, tôi muốn **phân biệt được bằng mắt một đường chuyền, một cú
sút và một pha dẫn bóng**, để **tôi đọc được trận mà không phải dò dòng tường thuật**.

**Acceptance criteria:**

- [x] AC-35.1 — KHI bóng rời chân (chuyền hoặc sút) THÌ nó PHẢI đi **nhanh hơn người giữ bóng ít nhất hai lần**, nên nó tới đích hẳn trước những cầu thủ đang chạy cùng hướng. *(Ngưỡng hạ từ **ba** xuống **hai** ngày 2026-11-22 — xem nhật ký làm rõ.)*
- [x] AC-35.2 — KHI một đường chuyền tới một đồng đội THÌ bóng PHẢI tới **đúng chân** người nhận (trong một bán kính điểm), và người ấy PHẢI trở thành người giữ bóng **ngay khi bóng tới**, không sớm hơn.

  > *Làm rõ ngày 2026-11-19 sau `/analyze`, phát hiện số 1.* Engine **không nói ai
  > nhận** một đường chuyền — nó chỉ kể bước ấy là một đường chuyền và đi tới vùng
  > nào. "Người nhận" ở AC này vì thế là một **suy diễn của lớp vẽ** (quyết định
  > D112: đồng đội đứng gần vùng đích nhất), đúng loại suy diễn người dùng đã chấp
  > nhận ở câu hỏi 1 của `/clarify`. Nó tất định và **không đổi một con số nào** của
  > trận; nó không được vào dòng tường thuật hay thống kê.
- [x] AC-35.3 — KHI dòng tường thuật kể một cú sút THÌ bóng PHẢI đi **về phía khung thành của đội bị sút**, và kết thúc ở nơi dòng ấy kể (vào lưới, ra ngoài, hay thủ môn cản).
- [x] AC-35.4 — KHI đặt một pha dẫn bóng cạnh một đường chuyền cùng quãng đường THÌ **thời gian đi phải khác nhau ít nhất hai lần**, tức người xem đọc ra được hai thứ khác nhau mà không cần chữ. *(Ngưỡng hạ từ **ba** xuống **hai** ngày 2026-11-22 — xem nhật ký làm rõ.)*
- [x] AC-35.5 — KHI vẽ một đường chuyền và một cú sút THÌ hai thứ chỉ được khác nhau ở **tốc độ và đích đến**: sút nhanh hơn chuyền và đi về khung thành, chuyền tới chân đồng đội. KHÔNG thêm vệt sáng, không đổi độ cong, không thêm hình vẽ nào khác.

### US-36: Người không có bóng cũng di chuyển có mục đích

Là một **người dùng**, tôi muốn **cả hai đội cùng sống theo trái bóng**, để **sân
không còn cảnh hai mươi người đứng chờ trong khi hai người chạy**.

**Acceptance criteria:**

- [ ] AC-36.1 — KHI trận đang chạy ở một mức còn nội suy THÌ trong **mỗi nhịp**, **mọi** điểm cầu thủ PHẢI đổi chỗ theo một hướng có nghĩa, chứ không chỉ dao động quanh một chỗ cố định.

  > **⚠️ ĐẠT MỘT PHẦN, và người dùng nhìn ra trước khi tôi đo.** Ngày 2026-11-22 họ
  > nói: *"cầu thủ di chuyển nhưng mà không phải tại chỗ mà theo tình huống bóng"*.
  > Đo quãng mỗi người đi giữa hai mốc trên 10 mã trận:
  >
  > | | Số lượt | Trung vị | p90 |
  > |---|---|---|---|
  > | **Có** tham gia tình huống | 1.402 | **24,26** | 48,14 |
  > | **Không** tham gia | 15.251 | **5,14** | 15,23 |
  >
  > Và **28,2% số lượt người không tham gia đứng im hoàn toàn** giữa hai mốc — thứ
  > nhúc nhích người xem thấy khi ấy chỉ là lớp dao động ±1 đơn vị **tại chỗ**, đúng
  > cái AC này cấm. Chữ "**mọi**" vì thế chưa đúng.
  >
  > Cái đã đạt: cả hai khối **có** dịch theo bóng (lớp co khối, D94) và theo **vai
  > trò** (D106, D116). Cái chưa đạt là mỗi người có một **mục đích gọi tên được** —
  > đó là **US-41 của spec 007/009**, nơi có danh mục mười ba kiểu di chuyển không
  > bóng. Siết thêm ở spec 006 không được nữa: trần nghiêng khối đã ở 1/6 và sàn hai
  > điểm gần nhau nhất đã xuống 1,31 bán kính *(tính theo bán kính 3,4 của lúc đo)*.
- [x] AC-36.2 — KHI người giữ bóng tiến về phía khung thành đối phương THÌ **ít nhất một đồng đội** PHẢI di chuyển lên theo, đủ để người xem thấy có một phương án chuyền.
- [x] AC-36.6 — KHI một đội đang giữ bóng THÌ **hai bên di chuyển theo hai nguyên tắc khác nhau**, và người xem PHẢI phân biệt được: đồng đội của người giữ bóng **dâng lên mở ra nhận bóng**, còn đối phương **lùi về hoặc ép theo bóng**. Hai đội KHÔNG được trông như một khối duy nhất trượt qua lại.
- [x] AC-36.3 — KHI bóng đổi từ đội này sang đội kia THÌ cả hai khối đội hình PHẢI dịch theo hướng mới trong nhịp kế tiếp.
- [x] AC-36.4 — KHI mọi người cùng di chuyển THÌ bốn bất biến của spec 005 PHẢI còn đúng: không hai điểm nào chồng khít (AC-30.5); thủ môn không rời một phần ba sân nhà (AC-30.7); bốn hàng của hai đội xen kẽ đúng thứ tự khi không có bóng ở gần (AC-30.8); không điểm nào ra ngoài vạch biên.
- [ ] AC-36.5 — KHI đo trên một trận đầy đủ THÌ tỉ lệ giữa tốc độ lớn nhất và nhỏ nhất của các điểm **đang di chuyển** PHẢI vẫn dưới **bốn lần** (giữ AC-30.10), và đường đi thật của một điểm trong một nhịp KHÔNG dài hơn đường chim bay quá **năm lần** (giữ AC-30.11).

  > **⚠️ NỬA ĐẦU ĐẠT, NỬA SAU KHÔNG — người dùng chốt "để nợ" ngày 2026-11-19.**
  >
  > **Dải tốc độ dưới bốn lần: đạt**, giữ bằng phép kiểm thuần của T525, và nó **tự
  > phủ cả mức Rất chậm** mới mà không phải sửa một dòng.
  >
  > **Độ vòng dưới năm lần: không đạt.** Đo bằng một phép kiểm thuần dựng lại lớp vẽ
  > (T616) trên **25.360 chặng**: trung vị **1,38**, lớn nhất **20,95**.
  >
  > Ba lý do để lại, người dùng cân nhắc rồi chốt: **(a) có từ trước spec 006** — đo
  > ở cả hai trần nghiêng khối ra 19,52 và 20,95 với **cùng một trường hợp tệ nhất**,
  > nên cả D104 lẫn D116 đều không sinh ra nó; **(b)** trung vị 1,38 nên trong thực
  > tế không ai thấy, và người dùng xem app suốt hai spec chưa bao giờ báo lỗi này;
  > **(c) spec 007 chặn đúng nguyên nhân tại gốc** — AC-38.2 chặn gia tốc 6 m/s²,
  > AC-38.3 bắt đổi hướng trên 90° phải xuống dưới 3 m/s.
  >
  > Phép kiểm canh **vi phạm còn tồn tại**, nên nếu ai sửa lớp nội suy thì nó đỏ và
  > buộc phải viết lại thành ngưỡng thật. **Không nới ngưỡng cho xanh.**

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

- [~] Toàn bộ AC ở mục 3 pass — **18/21**. Ba AC còn lại không tick, mỗi cái có một
      quyết định của người dùng đứng sau; xem bảng ở đầu tài liệu và ghi chú tại từng AC
- [x] Trường hợp biên mục 5 được xử lý — T615, kèm **một dòng không kiểm tay được** và
      lý do: không còn bản ghi trận nào thiếu `cacBuocBong` để mở, nên đường lùi D110
      được canh bằng phép kiểm riêng thay vì bằng mắt
- [x] Không vi phạm nguyên tắc nào trong constitution **3.0.1**
- [x] **Mọi con số của trận không đổi** — `tuongThichV5.test.ts` so **bảy trường** từng
      dòng và `phatLai.test.ts`, cả hai **xanh**, kể cả sau khi T625 đổi nhãn bước bóng
- [x] Có phép kiểm tự động cho lớp giữ bóng — bảng 3.1 cho **cả 16** `LoaiSuKien`, R50
      trên 10 mã trận × 7 quân số, và phép kiểm xương sống T607 (tỉ lệ 1 trả đúng mốc
      tới 10 chữ số)
- [~] **Mọi AC của spec 005 được kiểm lại** — mục 13, **từng cái một**. 16/17 đạt;
      AC-30.11 là món nợ người dùng chốt để lại
- [x] Đo lại hai ngân sách ở mục 6 trên bản build — chạy hết trận **32ms**, khung vẽ
      **59/giây** và lớn nhất **0,3ms** ở cả năm mức, **0** tác vụ quá 50ms. Số đo và
      điều kiện đo nằm trong mô tả commit của T616
- [x] Tự tay đi hết màn hình trận ở **cả hai ngôn ngữ và cả hai chế độ sáng/tối**, kèm
      một lượt với giảm chuyển động — T615: **106 chuỗi** mỗi tổ hợp, **0** dưới 4,5:1,
      **0** chuỗi lạc ngôn ngữ, và **0/23** nhóm vẽ đổi chỗ khi giảm chuyển động
- [x] **Người dùng tự xem một trận và phán** — T617, ngày 2026-11-22. Họ nêu **sáu
      điều**; bốn điều thành T625–T628 của chính spec này, hai điều đi vào lộ trình spec
      007. Đó là lý do spec này tồn tại, và nó đã làm đúng việc của nó

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


---

## 12. Căn cứ tick từng AC (T618, 2026-11-22)

**18 / 21 đạt.** Ba AC không tick có ghi chú ngay tại chỗ ở mục 3; bảng tóm tắt ở đầu
tài liệu.

| AC | Căn cứ |
|---|---|
| AC-33.1 | Phép kiểm vòng nét đứt trên 10 mã trận × 7 quân số; đo riêng cửa sổ cầm bóng của thủ môn: **88,8%** khung bóng sát chân sau T626 (trước 74,0%) |
| AC-33.2 | D104 cho người giữ bóng đi **đúng đường của quả bóng** trong cửa sổ cầm bóng; T623 sửa chỗ cửa sổ trùm cả đoạn chuyền khiến người chuyền bay theo bóng rồi giật về |
| AC-33.3 | ✅ **kèm ngoại lệ nhịp lặng sau bàn thắng** — xem ghi chú tại AC. Ngoài phút có bàn thắng, quãng dài nhất cả trận là **34ms**; 35,5% → **93,8%** khung có bóng di chuyển |
| AC-33.4 | Vòng nét đứt `1,6` quanh người giữ bóng, bán kính riêng chặn bởi `Math.min` hai biên; phép kiểm "bán kính vòng không trùm tâm ai" trên 10 mã × 7 quân số. Dấu hiệu là **nét đứt**, không dựa màu (P9) |
| AC-33.5 | Phép kiểm bảng 3.1 cho **cả 16** `LoaiSuKien`; T621 đưa tỉ lệ dòng có người giữ bóng đã rời sân về **đúng 0** (trước 2,82%) |
| AC-33.6 | T614: mức **Rất chậm 2000ms** đứng đầu thang, nhãn đủ hai thứ tiếng, chọn bằng bàn phím; năm vòng duyệt `MS_MOI_PHUT` tự phủ mức mới |
| AC-34.1 | Cùng căn cứ AC-33.2 và AC-33.1 |
| AC-34.2 | ⚠️ **Không đạt** — mệnh đề "đi vòng qua đối thủ" chưa làm, xem ghi chú tại AC |
| AC-34.3 | P1: mọi thứ suy từ mã trận; phép kiểm xương sống T607 — tại tỉ lệ 1 mọi điểm về đúng mốc tới **10 chữ số** |
| AC-34.4 | `tuongThichV5.test.ts` so **bảy trường** từng dòng + `phatLai.test.ts`, **xanh**, kể cả sau khi T625 đổi nhãn bước bóng |
| AC-35.1 | Phép kiểm P5 duyệt mọi mức tốc độ, canh **≥ 2 lần** (ngưỡng hạ ngày 2026-11-22, T628) |
| AC-35.2 | D112 suy người nhận là đồng đội gần vùng đích nhất; phép kiểm suy người nhận trong `phaBong.test.ts` |
| AC-35.3 | Bước `sut` lấy vùng đích từ chính engine, nên đích đến **là** chỗ dòng tường thuật kể |
| AC-35.4 | Cùng phép kiểm P5 của AC-35.1 |
| AC-35.5 | Khác biệt duy nhất trong `thoiLuongDoan` là **thời lượng**; không có nhánh nào vẽ thêm hình cho chuyền hay sút |
| AC-36.1 | ⚠️ **Đạt một phần** — xem ghi chú tại AC |
| AC-36.2 | Lực kéo theo vai trò (D106): đồng đội của người giữ bóng được kéo thêm **1,02 đơn vị** trung bình, lớn nhất 2,88, đo trên **79.340 lượt** |
| AC-36.3 | Cùng cơ chế; đo ở mốc: trọng tâm đội nhà lệch **+6,05** giữa lúc họ cầm bóng và lúc không |
| AC-36.4 | **Ba phép kiểm bất biến** chạy lại ở mọi lát và xanh **không nới một ngưỡng nào**; cộng phép kiểm "không điểm nào ra ngoài vạch biên" qua phép kẹp `gioiHan` |
| AC-36.5 | ⚠️ **Nửa đầu đạt, nửa sau để nợ** — xem ghi chú tại AC |
| AC-36.6 | Hai vai trò hai công thức (D106); đo tách khỏi lớp co khối: đồng đội **1,02**, đối phương **1,39**, lớn nhất 2,88 |

## 13. Kiểm lại 15 AC của spec 005 và hai AC của spec 001/002 (T618)

Mục 10 đòi kiểm **từng cái** trước khi đóng. Dưới đây là từng cái, kèm cách kiểm — không
phải một câu "đã chạy lại bộ kiểm".

| AC | Kiểm bằng gì | |
|---|---|---|
| AC-28.5 — tạm dừng thì dừng hẳn | T620 (D114) đổi đồng hồ dao động thành **bộ cộng dồn trong vòng khung hình**, nên tắt vòng là đóng băng **bằng cấu trúc**; và đo trực tiếp trên build: lúc tạm dừng sân đứng im **13.957ms** liên tục | ✅ |
| AC-29.3 — đổi tốc độ không giật | Chặng mới xuất phát từ **chỗ điểm đang đứng**, không từ mốc cũ; phép kiểm "không chặng nào vượt một nhịp" duyệt cả năm mức | ✅ |
| AC-29.4 — mức nhanh nhất thôi nội suy | `thoiGianChuyen(20)` trả **0** vì dưới `NHIP_TOI_THIEU_DE_NOI_SUY` = 40; đo trên build: mức Rất nhanh **không có vòng vẽ** nào | ✅ |
| AC-30.1 — không phanh ở mốc | `viTriTaiThoiDiem` dùng thẳng `t` khi có `huongVao`, chỉ làm mượt khi điểm **đang đứng yên** | ✅ |
| AC-30.5 — không chồng khít | Một trong **ba phép kiểm bất biến**, chạy lại ở mọi lát; sàn đo được **4,457 đơn vị** | ✅ |
| AC-30.7 — thủ môn ở một phần ba sân nhà | T521 kẹp ở mốc, T622 kẹp ở **lớp vẽ**, T626 chặn thừa kế quyền mở pha; phép kiểm duyệt 10 mã × 7 quân số | ✅ |
| AC-30.8 — bốn hàng xen kẽ | Phép kiểm **chín tổ hợp độ cao đội hình**, cộng phép kiểm "có răng" chứng minh nó đỏ khi biên độ gấp ba | ✅ |
| AC-30.10 — dải tốc độ dưới bốn lần | Phép kiểm thuần T525; duyệt `MS_MOI_PHUT` nên **tự phủ mức Rất chậm** mới | ✅ |
| AC-30.11 — độ vòng dưới năm lần | **KHÔNG ĐẠT**, người dùng chốt để nợ — xem AC-36.5 | ⚠️ |
| AC-31.1 — giảm chuyển động tắt mọi lớp | Đo trên build với `prefers-reduced-motion` giả lập: **0 trong 23** nhóm vẽ đổi chỗ trong 700ms | ✅ |
| AC-31.2 — mọi con số của trận không đổi | `tuongThichV5` (bảy trường, từng dòng) + `phatLai` **xanh**. Đây là chỗ sát nhất: T625 đổi nhãn bước bóng trong `src/engine/`, nhưng nhãn ấy **không ai trong engine hay services đọc**, và bảy trường kia không có `cacBuocBong` | ✅ |
| AC-31.3 / AC-31.4 — hai ngân sách | Chạy hết trận với sân bật **32ms** (ngưỡng 3 giây); khung vẽ **59/giây**, trung vị 0,1ms, lớn nhất **0,3ms**, **0** tác vụ quá 50ms — đo ở **cả năm** mức | ✅ |
| AC-31.7 — ẩn/hiện sân | Đo trên build: ẩn thì không còn thẻ sân; hiện lại thì đủ **23 nhóm vẽ** | ✅ |
| AC-32.1 → AC-32.3 — bóng luôn có mặt, đúng chỗ | T627 thu điểm cầu thủ xuống 2,6 mà **giữ bóng ở 1,7**, nên bóng còn dễ thấy hơn trước; phép kiểm vòng nét đứt canh việc bóng không bị trùm | ✅ |
| AC-32.4 → AC-32.6 — hiệu ứng bàn thắng và nhịp lặng | Phép kiểm chính của T514 (`khoảng cách ≥ bán kính đã phóng to`) **xanh suốt**, kể cả sau khi bán kính đổi; nhịp lặng giữ nguyên — nó chính là ngoại lệ của AC-33.3 | ✅ |
| AC-32.8 — bóng trông ra quả bóng | Hình quả bóng không đổi một nét nào trong cả spec | ✅ |
| **AC-15.2** (spec 002) — không đếm thiếu người | Cùng ba phép kiểm bất biến với AC-30.5 | ✅ |
| **AC-10.2** (spec 001), mệnh đề 1 — người tham gia có mặt ở vùng có bóng | `hinhSan` đặt người tham gia vào đúng vùng của dòng; phép kiểm xương sống T607 canh toạ độ tại mốc tới 10 chữ số | ✅ |

**Hai hằng số của ranh giới, kiểm lại lần cuối:** `PHIEN_BAN_ENGINE` = **5**,
`DB_VERSION` = **3** — không đổi suốt cả spec.

**Bốn thứ không được sửa, kiểm lại lần cuối:** `tuongThichV5.test.ts`,
`phatLai.test.ts` và describe "toạ độ tại mốc không bao giờ sai" của `noiSuy.test.ts`
**không đổi một dòng nào** so với `main`. Ba phép kiểm bất biến của `san2D.test.ts`
cũng không — những dòng bị sửa trong file ấy đều thuộc chữ ký `veTu`, bốn ngưỡng của
T510 mà D116 đổi có phép, và hai ngưỡng của T514 mà T627 đổi **cách viết** chứ không
đổi giá trị thật.

**Một dòng logic trong `src/engine/` đã đổi, và chỉ một:** luật gán nhãn rê bóng /
chuyền ở `chuoiBong.ts` (T625). Diff của `src/engine/` không tính file test có **0 dòng
thêm và 0 dòng bỏ** chứa chữ `rng`.

## 14. Spec này đẻ ra bốn task sau khi người dùng xem

T617 là lớp kiểm cuối, và nó làm đúng việc của nó — như T518 của spec 005 từng làm.
Ngày **2026-11-22**, người dùng xem bản chạy trên trình duyệt của họ và nêu sáu điều.
Bốn điều thành task của chính spec này:

| Task | Người dùng nói | Số đo |
|---|---|---|
| **T625** | *"tần suất chuyền nhiều lên"* và *"một cầu thủ không thể rê từ đầu sân đến cuối sân"* | chuyền 41,6% → **79,9%**; ôm bóng qua ba dải 28 lần/10 trận → **1** |
| **T626** | *"lúc phát bóng thủ môn lên quá cao"* | quãng thủ môn đi mỗi nhịp trung vị 12,6 → **0,0**; bóng sát chân 74,0% → **88,8%** |
| **T627** | *"tôi muốn vòng tròn hiển thị cầu thủ nhỏ đi"* | bán kính 3,4 → **2,6** |
| **T628** | *"đường bóng chậm hơn nữa"* | tốc độ bóng trung vị 152 → **138** đơn vị/giây |

Hai điều còn lại — *"khối đội hình phải dâng lên phần sân đối thủ"* và *"có những pha
phản công và trận đấu vẫn cần liền mạch hơn"* — cộng với phần chưa đạt của AC-36.1, đi
vào **lộ trình spec 007** kèm số đo, ở mục 12 của `specs/007-continuous-match-engine/spec.md`.

**Một dự đoán của tôi sai và đã ghi lại:** ở T628 tôi nói trước với người dùng là bóng
sẽ chậm đi **33%**; thật ra chỉ **9%** ở trung vị, vì `dongThoiGianPhaBong` nén mọi đoạn
cho vừa một nhịp nên tỉ lệ không đổi được gì cho những pha nhiều bước — và phần lớn
**đoạn** nằm trong đúng những pha ấy. Lực đòn bẩy thật của tốc độ bóng là chuyện **nén**,
không phải tỉ lệ, và nó thuộc spec 007.
