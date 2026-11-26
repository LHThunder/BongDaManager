# Spec: Engine mô phỏng liên tục — toạ độ mét và cơ học chuyển động

| | |
|---|---|
| **ID** | `007-continuous-match-engine` |
| **Status** | Planned |
| **Created** | 2026-11-19 |
| **Clarified** | 2026-11-19, bổ sung 2026-11-22 và **2026-11-23** khi lập plan (mục 14 và 15) |
| **Branch** | `007-continuous-match-engine` — **đã cắt** từ `main` tại `7e1b065` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Phạm vi đã được thu lại ở `/clarify` ngày 2026-11-19.** Bản mô tả 21 mục của người dùng
> lớn hơn tổng spec 005 và 006 cộng lại, nên nó được chẻ thành **bốn spec**. Spec 007 chỉ
> làm **nền chuyển động**: toạ độ mét, thời gian giây, độ cao bóng, cơ học của một cơ thể
> người. Luật IFAB, chiến thuật, thể lực, nhịp trận và thống kê đi sang spec 008–010 —
> xem mục 12, nơi giữ nguyên văn các user story ấy để các spec sau bắt đầu từ đó.

> **Engine mới SỐNG SONG SONG với engine hiện tại**, không thay thế. Engine hiện tại là
> **v6** (`PHIEN_BAN_ENGINE = 6`, từ commit `f537d7d` của spec 006), và nó giữ nguyên: trận
> lưu bằng v6 đấu lại ra đúng từng dòng như cũ. Đây là lối vào thứ hai, đúng tiền lệ hiến
> pháp 3.0 đã cho hai vòng lặp chơi sống song song.
>
> ⚠️ **Sửa 2026-11-23 — câu cũ ở đây nói sai một chuyện đã xảy ra.** Bản đầu viết "Engine v5
> và 20 trận đã lưu giữ nguyên, **đấu lại** ra đúng từng dòng như cũ". Điều đó **đã không còn
> đúng** từ lúc spec 006 nâng engine lên v6: `lyDoKhongDauLai` trả `'khac-phien-ban-engine'`
> khi `tran.phienBanEngine !== PHIEN_BAN_ENGINE` (`src/services/matchRepo.ts:202`), nên trận
> lưu bằng v5 **mở lại và xem lại được** — bản ghi mang dòng sự kiện đầy đủ — nhưng **không
> đấu lại được**. Chúng đã mất nút đấu lại **một lần rồi**, và đó chính là cái giá mà spec
> 007 từ chối trả lần thứ hai: `PHIEN_BAN_ENGINE` giữ **6**, engine liên tục mang số riêng.
> Lời hứa đúng của spec này nằm ở **AC-45.2**, vốn đã viết cẩn thận ("một trận đã lưu bằng
> engine **hiện tại**"), không phải ở câu văn này.

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
- **Thay thế engine hiện tại.** Engine **v6** sống tiếp và không đổi một kết quả nào; trận
  lưu bằng v6 đấu lại y nguyên, trận lưu bằng v5 vẫn mở và **xem lại** được (xem ghi chú ở
  mục 1 — chúng đã mất nút **đấu lại** từ spec 006, và spec 007 không lấy thêm gì nữa).
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
      dữ liệu** với mã `REF`, `AR1`, `AR2`, và bốn mệnh đề sau PHẢI đúng ở **mọi** mốc:
      **(a)** chỗ trọng tài chính **NHẮM TỚI** cách bóng **15–35 m**; **(b)** chỗ ấy **không
      nằm trên đường chuyền** — cách đoạn thẳng người giữ bóng → người nhận hơn một lề nêu
      bằng số; **(c)** mỗi trợ lý **ngang hàng hậu vệ cuối cùng** của nửa sân mình phụ trách,
      sai số nêu bằng số; **(d)** khoảng cách **THẬT** từ trọng tài chính tới bóng lệch khỏi
      khoảng cách anh ta nhắm tới (**25 m**, đúng tâm dải) **không quá 50 m**. Sân 2D PHẢI
      **không vẽ** ba điểm này ở spec 007.

  > **Dải nới từ 15–25 m lên 15–35 m, người dùng chốt 2026-11-23.** Dải cũ **bất khả thi về
  > số học** với AC-38.1 (tối đa 9 m/s) và AC-38.2 (gia tốc tối đa 6 m/s²): một quả phát bóng
  > 70 m ở 25 m/s bay 2,8 giây, trọng tài phải dịch tối thiểu 20 m nhưng tối đa đi được
  > 9·2,8 − 6,75 = **18,45 m** — thiếu **1,55 m** ở trường hợp **thuận lợi nhất**. Hai đường
  > còn lại đã bị loại khi hỏi: phát biểu theo **phần trăm** số mốc (≥ 95%) bỏ trống ~270 mốc
  > một trận mà không ai canh; chuyển AC sang spec 008 thì ba điểm vẫn nằm trong dữ liệu khung
  > hình mà **không bất biến nào** canh vị trí. Dải mới dựng được bằng một phép kiểm **tuyệt
  > đối**, không ngoại lệ. Cái giá đã nói trước khi chốt: 35 m là hơn một phần ba chiều dài
  > sân, nên ý "trọng tài theo sát bóng" yếu hẳn đi.
  >
  > **Hai mệnh đề còn lại của AC này không đổi** — "không nằm trên đường chuyền" và "ngang
  > hàng hậu vệ cuối cùng" vẫn là yêu cầu tuyệt đối, và `plan.md` D133 là chủ sở hữu của
  > chúng. Nếu lúc dựng chúng cũng hoá ra không dựng nổi thì xử đúng mục 9: **quay lại hỏi
  > người dùng, không tự hạ ngưỡng**.
  >
  > ---
  >
  > **Tách thành ĐÍCH và ĐỘ TRỄ, người dùng chốt 2026-11-24 — và lần này con số 15–35 m
  > KHÔNG đổi.** Lúc dựng T716 hoá ra dải 15–35 m **vẫn bất khả thi** nếu đo trên **vị trí
  > thật**: đo 20 mã / **113.460 mốc** thì **749 mốc (0,660%)** ra ngoài dải, dải thật là
  > **[5,1; 40,3] m**. Nguyên nhân **không** phải đích đặt sai — trung vị khoảng cách là
  > **25,00 m**, tức đích luôn đúng tâm dải — mà là **độ trễ đuổi theo**, và độ trễ ấy bị
  > chặn dưới bởi chính hai AC khác của spec này:
  >
  > > Để đổi từ *đang chạy về phía bóng 9 m/s* sang *chạy ra xa 9 m/s*, trọng tài phải quay
  > > 180°. **AC-38.11** cho 90°/s, tức **2 giây**; trong 2 giây ấy **AC-38.4** kẹp anh ta ở
  > > **4 m/s** vì anh ta đang chạy lùi. Quả bóng đi **18 m**, anh ta đi **≤ 8 m sai hướng**
  > > → khe hở đổi **~16–20 m chỉ trong MỘT lần pha bóng đổi chiều**, trong khi dải 15–35 m
  > > chỉ cho **10 m** dư mỗi phía. Số đo khớp phép tính: lệch sâu nhất **19,87 m**, lệch xa
  > > nhất **15,3 m**.
  >
  > Vì thế AC được **tách làm hai mệnh đề tuyệt đối** chứ không nới số lần thứ hai: **(a)**
  > nói về **đích**, và nó đúng **100% theo cấu trúc** (`viTriTrongTai` chỉ sinh điểm cách
  > bóng đúng `KHOANG_TRONG_TAI` = 25 m); **(d)** nói về **độ trễ**, nêu bằng một con số.
  >
  > Mệnh đề (d) phát biểu theo **khoảng cách tới bóng** chứ không theo "lệch khỏi đích", vì
  > khoảng cách tới bóng **đọc được từ một khung hình** mà không cần biết trạng thái trong
  > của engine — và vì đích luôn cách bóng **đúng** 25 m, nó chính là **thành phần hướng
  > tâm** của độ trễ. Tức (d) tương đương một phép kiểm tuyệt đối trên lô mốc: khoảng cách
  > trọng tài–bóng nằm trong **[5; 45] m** ở **mọi** mốc.
  >
  > Hai đường còn lại đã bị loại khi hỏi: **nới dải thành 5–41 m** thì 41 m là 39% chiều dài
  > sân và 5 m cho trọng tài đứng ngay trong pha bóng — dải rộng tới mức gần như không canh
  > gì, đúng thứ đã bị từ chối ở câu 22; **miễn ba điểm trọng tài khỏi AC-38.4 và AC-38.11**
  > thì phá điều D133 chốt ("ba điểm đi qua CHÍNH `buocCoHoc` như mọi người khác") mà vẫn
  > không chắc đạt.
  >
  > ⚠️ **Con số 20 m chỉ còn 0,13 m dư so với phép đo (19,87 m), và nó đo trên mô hình bóng
  > TẠM của T716** — quả bóng hiện bị kẹp chung trần 9 m/s. **T720** cho bóng vật lý thật
  > (bay nhanh hơn người), nên nó **phải đo lại con số này**, và phép kiểm của mệnh đề (d) sẽ
  > là thứ bắt được.
  >
  > ---
  >
  > **Và nó đã phải đo lại, đúng ở T726, ngày 2026-11-24 (câu 26).** Khi quả bóng được nối
  > vật lý thật vào lô mốc — bay tới **30 m/s** thay vì bị kẹp 9 — phép kiểm mệnh đề (d) **đỏ
  > ngay**, đo lại được **46,48 m**. Người dùng chốt hai thay đổi:
  >
  > 1. **Trọng tài bám CHỖ PHA BÓNG SẮP TỚI, không bám quả bóng đang bay.** Một trọng tài
  >    thật **đọc trận**: bóng rời chân bay 60 m thì ông ta chạy về chỗ nó sắp tới chứ không
  >    đuổi theo giữa đường. Đo trên 10 mã, mọi phân vị đều tốt lên: lệch lớn nhất **46,5 →
  >    37,9 m**, lúc bóng nằm yên **42,7 → 34,7 m**.
  > 2. **Lề của (d) nới từ 20 m lên 50 m** — đo **48,09 m** trên **20 mã / 113.460 mốc**, dư
  >    1,91 m.
  >
  > **Vì sao không nhỏ hơn được — số học, không phải chính sách:** `dienPha.ts` cho mỗi hành
  > động đúng **2 giây**, trong khi hai tâm vùng cách nhau tới **84 m**. Pha bóng nhảy 84 m
  > trong 2 giây còn trọng tài đi được `9 × 2 = 18` m, nên độ trễ **không thể nhỏ hơn ~33 m**
  > dù neo vào đâu. Và đuôi ấy là **vật lý chứ không phải lỗi**: quả bóng không teleport lần
  > nào, nhảy xa nhất **đúng 30,00 m** giữa hai mốc, tức đúng `30 m/s × 1 s`.
  >
  > Hai đường còn lại đã bị loại khi hỏi: **bỏ hẳn mệnh đề (d)** (mất đúng thứ vừa thêm hôm
  > qua), và **sửa lưới thời gian của `dienPha.ts`** (đổi `BUOC_MOI_HANH_DONG` là đổi bố cục
  > thời gian của **mọi** pha bóng, và trận sẽ thấy chậm hẳn).
  >
  > ⚠️ **Cái giá đã nói trước khi chốt:** 50 m cho trọng tài cách bóng 0–75 m trên một sân dài
  > 105 m, nên (d) nay chỉ còn bắt được loại lỗi "điểm trọng tài chết hẳn hoặc bay loạn",
  > không còn bắt được "đứng sai chỗ".
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
- [ ] AC-45.3 — KHI mô phỏng **200 mã trận** với cùng hai đội và cùng chiến thuật ở **cả hai
      chế độ** THÌ hiệu số bàn thắng trung bình giữa hai chế độ PHẢI không lệch quá **0,5
      bàn**, và tỉ lệ thắng của đội mạnh hơn PHẢI không lệch quá **10 điểm phần trăm**. Một
      trận **cụ thể** PHẢI không bắt buộc ra cùng tỉ số — hai chế độ rút ngẫu nhiên ở hai
      chỗ khác nhau, nên đòi giống từng trận là đòi một điều không thể.

  > **100 → 200 mã, sửa ngày 2026-11-22.** Chính repo đã đo được nhiễu lấy mẫu **12 điểm
  > phần trăm ở 60 mã** (`src/engine/sosanh.doiManhHon.test.ts`: một bộ cho 28% thắng
  > trong khi tỉ lệ thật là 40,0%) — **lớn hơn** ngưỡng 10 điểm của chính AC này. Hai chế
  > độ rút ngẫu nhiên ở hai dòng độc lập nên nhiễu cộng cả hai phía. Ở 100 mã, phép kiểm
  > có thể **đỏ vì lấy mẫu chứ không vì mô hình sai**. 200 mã là đúng cách repo đã xử khi
  > gặp chuyện này lần trước: nới mẫu, giữ ngưỡng.
  >
  > ⚠️ **AC này là một hợp đồng TẠM, và nó có ngày hết hạn.** Bản đầu của ghi chú này ghim
  > vào **3,95 bàn một trận** của engine v5. **Đo lại trên v6 ngày 2026-11-23**, 200 mã do
  > `taoMaTran` sinh, bốn hạt giống (1, 2, 7, 99), sân trung lập:
  >
  > | Cặp đấu | Bàn một trận (4 mẫu × 200 mã) | So với dải 2–3 của spec 010 |
  > |---|---|---|
  > | Hai đội **bằng nhau** (chỉ số 12) | 2,495 / 2,565 / 2,760 / 2,870 | **trong dải** |
  > | **A15 vs B10** — cặp mà phép kiểm AC-45.3 thật sự dùng | 3,110 / 3,230 / 3,285 / 3,390 | **trên dải, cả bốn mẫu** |
  >
  > Nên **hợp đồng tạm vẫn còn hiệu lực, chỉ nhẹ hơn**: khoảng cách tới dải của spec 010 co
  > từ ~0,95 bàn xuống ~0,2–0,4 bàn, nhưng ở đúng cặp đấu mà phép kiểm dùng thì nó **vẫn
  > trên dải**, nên spec 010 **vẫn phải phá** AC-45.3 chứ không chỉ chạm vào nó. Vì thế yêu
  > cầu kỹ thuật không đổi: phép kiểm PHẢI đặt cả hai ngưỡng thành hằng số đọc được ở **một
  > chỗ**, kèm chú thích trỏ về đoạn này — để khi spec 010 tới, người sửa thấy ngay vì sao
  > con số ấy tồn tại. Lệnh dựng lại được: một bộ đo tạm trên `benMau('A'/'B')` +
  > `chayHetTran`, đúng khuôn `src/engine/sosanh.sanNha.test.ts` đã dùng.
- [ ] AC-45.4 — KHI một trận ở chế độ liên tục được lưu THÌ bản ghi PHẢI chỉ lưu mã trận,
      hai đội, **quân số, thời lượng, sân trung lập, đội của người dùng**, chuỗi can thiệp,
      chế độ và kết quả — PHẢI **không lưu vị trí** của bất kỳ mốc nào; và mở lại trận ấy
      PHẢI **sinh lại** đúng từng khung hình đã từng thấy.

  > **Bốn trường được thêm vào danh sách ngày 2026-11-22.** Bản liệt kê cũ thiếu `quanSo`,
  > `thoiLuong`, `sanTrungLap` và `doiCuaNguoiDung` — **cả bốn đều đổi kết quả trận**, nên
  > thiếu chúng là sinh lại ra một trận khác. Chúng đã nằm sẵn trong bản ghi; AC chỉ ghi
  > thiếu.
  >
  > **Và một điều kiện phải giữ để AC này khả thi: can thiệp ở độ phân giải PHÚT.** Hôm nay
  > `CanThiep` mang số phút nguyên và được áp vào **đầu phút kế tiếp** (quyết định D30b của
  > spec 001). Chế độ liên tục có 60 mốc mỗi phút, nên nếu can thiệp mang thêm mốc giây thì
  > bản ghi **đổi hình dạng** và sinh lại sẽ lệch khi người dùng bấm giữa phút. Giữ nguyên
  > độ phân giải phút thì sinh lại **đúng theo cấu trúc**, và cái giá — thay người có hiệu
  > lực ở đầu phút sau — **đúng bằng hành vi hôm nay**, nên không ai mất gì.
- [ ] AC-45.5 — KHI người dùng xuất một trận ở chế độ liên tục THÌ họ PHẢI nhận được một tệp
      **JSON** chứa nhật ký sự kiện và khung hình chi tiết đúng định dạng **mục 7b** và
      **mục 15** của [`ban-mo-ta-goc.md`](./ban-mo-ta-goc.md).

  > **Bản mô tả gốc đã được lưu vào repo ngày 2026-11-22.** Trước đó AC này trỏ vào một tài
  > liệu **không tồn tại trong repo** — bản 21 mục người dùng dán trong hội thoại. Người
  > dùng chọn lưu nó thay vì để tôi tự định nghĩa một schema, để **lời của họ** là hợp đồng.
  > Hệ quả: đổi định dạng tệp xuất là đổi **cả tài liệu ấy**, không chỉ đổi code.
- [ ] AC-45.6 — KHI tệp xuất ở AC-45.5 có trong tay THÌ mọi phép kiểm cơ học của US-38
      PHẢI chạy được **trên chính tệp ấy** — không phải dựng một bản đo riêng mỗi lần muốn
      kiểm một con số, như đã phải làm suốt spec 005 và 006. **Ngoại lệ: AC-38.8.**

  > **Vì sao AC-38.8 là ngoại lệ, chốt 2026-11-22.** Tệp xuất chứa vị trí **tại từng mốc**;
  > độ cong là chuyện **giữa hai mốc**, và nó do lớp nội suy ở tầng giao diện sinh ra
  > (`src/ui/noiSuy.ts`). Lớp engine **bị cấm import tầng ui** — `src/engine/boundaries.test.ts`
  > quét mọi file engine và chặn đúng điều đó. Nên AC-45.6 ∧ AC-38.8 chỉ cùng đúng nếu dời
  > độ cong xuống engine (**trái quyết định 5**: giữ nguyên lớp nội suy spec 005) hoặc dời
  > cả `noiSuy.ts` xuống `domain/` (một đợt dọn động vào file mà spec 005 và 006 canh bằng
  > một describe **không được sửa**, và nó đang import thể lực từ engine).
  >
  > Người dùng chọn đường thứ ba: **tám AC cơ học khác của US-38 kiểm được từ tệp, riêng
  > AC-38.8 canh bằng phép kiểm thuần ở lớp vẽ** — đúng cách spec 006 đã làm ba lần với
  > những thứ `environment: 'node'` không nhìn tới.
- [ ] AC-45.7 — KHI chế độ liên tục đang chạy THÌ mọi tính ngẫu nhiên PHẢI đến từ mã trận;
      PHẢI không có nguồn ngẫu nhiên hay nguồn thời gian toàn cục nào trong engine (P1).
- [ ] AC-45.8 — KHI người dùng chọn **quân số khác 11** THÌ chế độ liên tục PHẢI bị **khoá**,
      và giao diện PHẢI nói rõ vì sao bằng ngôn ngữ đang chọn (P8). Trận quân số 5–10 PHẢI
      chạy bằng chế độ hiện tại như cũ.

  > **AC mới, người dùng chốt 2026-11-22.** Trận của app chạy được **5 đến 11 người**
  > (`CAC_QUAN_SO`) và **20 đến 90 phút** (`CAC_THOI_LUONG`), cả hai là trường thật của bản
  > ghi trận. Nhưng AC-37.1 và AC-37.2 chỉ định nghĩa hình học **105×68 của sân 11** — vòng
  > cấm 16,5 m, khung thành 7,32 m, chấm phạt đền 11 m đều là số của sân 11. Co sân theo
  > quân số thì mọi con số ấy phải co theo, trong khi cơ học của US-38 (9 m/s, gia tốc
  > 6 m/s²) **không co** vì người vẫn là người — tỉ lệ người trên sân đổi hẳn. Giữ 105×68
  > cho sân 5 thì mật độ vô lý, và chính lớp vẽ đã từ chối cách ấy từ spec 002.
  >
  > Khoá chế độ hợp với quyết định 1: engine mới là **lối vào thứ hai**, nên nó được phép
  > có điều kiện riêng. Cái giá đã nói trước khi chốt: **người chơi sân 7 không bao giờ
  > thấy chuyển động mới**, và giao diện phải giải thích vì sao nút bị khoá.

- [ ] AC-45.9 — KHI người dùng bật **giảm chuyển động** VÀ trận đang ở **chế độ liên tục**
      THÌ đồng hồ **mốc** PHẢI vẫn chạy đủ mọi mốc (1 giây ở phần thường, 0,5 giây ở tình
      huống quan trọng — AC-37.7), còn lớp **nội suy** và lớp **dao động** PHẢI tắt
      (AC-31.1): ở mọi khung vẽ, toạ độ của mọi điểm PHẢI **trùng khít** toạ độ của một mốc
      đã phát, PHẢI không bao giờ là một giá trị nằm giữa hai mốc.
- [ ] AC-45.10 — KHI spec 007 nói "**tua**" THÌ nó PHẢI chỉ nghĩa là tua **TỚI**: đổi mức
      tốc độ, và *Chạy hết trận*. Chế độ liên tục trong spec 007 PHẢI **không** có tua ngược
      và PHẢI **không** có thanh thời gian nhảy về giây thứ N. Người dùng muốn xem lại một
      pha đã trôi qua PHẢI chạy lại trận bằng **cùng mã trận** — AC-37.5 bảo đảm họ thấy
      đúng chuyển động ấy.
- [ ] AC-45.11 — KHI xuất tệp JSON của một trận **90 phút** ở chế độ liên tục (AC-45.5) THÌ
      tệp PHẢI **không vượt 11 MB = 11.000.000 byte** (cơ số **thập phân** — cùng cơ số với
      phép tính "dư 37%" ở ghi chú dưới), và phép kiểm PHẢI **đo kích thước thật** của tệp sinh
      ra, không ước lượng từ số mốc.

  > **Ba AC mới, người dùng chốt 2026-11-23 khi đọc `plan.md`.** Cả ba lấp ba chỗ **không một
  > AC nào trong 27 AC cũ nói tới**, nên plan không được quyền tự quyết:
  >
  > - **AC-45.9.** AC-31.1 chỉ nói "không nội suy, không dao động" — nó **không** nói "ít
  >   chuyển động hơn", nên ba cách đọc đều thoả đúng từng chữ. Cái giá đã nói trước khi chốt
  >   và PHẢI không được che: bóng tới 30 m/s nên một đường chuyền dài là một bước nhảy
  >   **~26 đơn vị vẽ**, lớn hơn bước nhảy lớn nhất của **người** (7,78 đơn vị) **3,3 lần** —
  >   tức ở riêng chỗ ấy, người bật giảm chuyển động thấy **tệ hơn hôm nay**. Bù lại: tần số
  >   cập nhật ×60, và bước nhảy lớn nhất của **người** nhỏ hơn hôm nay 6,1 lần vì AC-38.1
  >   chặn. Hai phương án bị loại: giữ mỗi phút một mốc như v6 (họ không nhận **một phần nào**
  >   của spec 007); chia đường chuyền thành nhiều chặng ngắn (đó là nội suy dưới tên khác,
  >   nên nó buộc viết lại AC-31.1 của spec 005 chứ không chỉ thêm AC mới).
  > - **AC-45.10.** Mục 4 bước 3 viết "dừng và tua được" nhưng không AC nào định nghĩa "tua",
  >   và hôm nay trong app chỉ có nút *Chạy hết trận*. Cái giá đã chọn: xem lại một pha vừa
  >   trôi qua thì phải chạy lại cả trận. Phương án thanh thời gian bị loại vì nó buộc chọn
  >   một trong hai cái giá nặng: sinh lại từ mốc 0 mỗi lần kéo, hoặc giữ bộ đệm cả trận
  >   **3,4 MB** thường trú — hình dạng bộ đệm ấy đã bị plan loại vì bộ nhớ.
  > - **AC-45.11.** Đo được trên hình dạng tệp đề nghị: **~7,2 MB** ca trung bình, **8,0 MB**
  >   ca xấu, **~9,0 MB** sau khi spec 009 điền hai trường còn `null`. **11 MB** dư 37% hôm
  >   nay và 22% sau spec 009, nên nó **vẫn đỏ được** — một ngân sách không bao giờ đỏ được
  >   thì vô dụng. Con số này **ở trong spec 007, KHÔNG vào hiến pháp**: ràng cả spec 008–010
  >   vào một con số đo trên hình dạng dữ liệu của hôm nay thì spec 009 thêm chỉ số thể lực
  >   vào mỗi mốc là vỡ ngay. Phương án 6,6 MB bị loại vì nó phải bỏ trường trạng thái khỏi
  >   khối mỏng, làm AC-38.5 chỉ gác được **7%** thời lượng trận thay vì 100%.

---

## 4. Luồng chính (happy path)

1. Người dùng chọn hai đội của mình, sơ đồ và phong cách mỗi bên, đội chủ nhà, và **chế độ
   mô phỏng** → hệ thống nhận một mã trận, và thời tiết của trận sinh ra từ mã ấy.
2. Người dùng bấm bắt đầu → trận chạy ở chế độ liên tục: mọi điểm di chuyển theo cơ học của
   US-38, bóng có độ cao, người giữ bóng luôn xác định.
3. Người dùng xem sân 2D, **dừng và tua TỚI được** (đổi mức tốc độ, *Chạy hết trận* —
   AC-45.10; spec 007 không có tua ngược); ở các tình huống quan trọng chuyển động dày lên
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
| Mở lại một trận cũ mà engine đã đổi kể từ đó | Kết quả vẫn đúng (vì kết quả được lưu) và **xem lại** vẫn đúng từng dòng (vì bản ghi mang dòng sự kiện đầy đủ), nhưng **đấu lại bị từ chối** kèm lý do nói ra bằng chữ — chạy lại cùng mã trận trên một engine khác sẽ ra một trận KHÁC, nên hứa "đấu lại" là hứa sai. PHẢI không im lặng |
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
  lưu (AC-45.4). Đây là cách spec này giữ P10 mà không phải cắt bớt gì. **Tệp xuất** thì khác
  bản ghi: nó mang vị trí từng mốc, nên nó có ngân sách riêng **11 MB** cho một trận 90 phút
  (AC-45.11). Con số ấy **chỉ ràng spec 007**, không vào hiến pháp.
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
- [ ] Mọi AC dạng **khoảng số** (AC-37.7, AC-38.1 → AC-38.8, AC-38.11, AC-45.3, AC-45.11) có **test tự
      động** đo đúng khoảng đó trên nhiều mã trận — không AC nào trong nhóm này được tick bằng
      cách xem mắt (P5, và chuẩn chất lượng mục 4)
- [ ] Ngân sách mùa giải đã được **đo và báo số**, dù spec này không bị nó ràng (mục 6)
- [ ] Mọi AC ở mục 10 (những gì phải giữ lại) được chạy lại và còn xanh
- [ ] Người dùng tự xem một trận trọn vẹn ở chế độ liên tục và phán rằng ba câu họ nói ở mục 1
      không còn đúng nữa — lớp kiểm cuối, như T518 của spec 005 và T617 của spec 006
- [ ] Ứng dụng chạy trọn luồng mục 4 từ đầu tới cuối, ở **cả hai chế độ** (P6)

### 7b. Danh sách kiểm BẰNG MẮT — chỗ `environment: node` không với tới (T761)

`vitest.config.ts` đặt `environment: 'node'` và `include: ['src/**/*.test.ts']` — **không**
`.test.tsx`, **không** jsdom. Nên mọi nhánh JSX và mọi `useEffect` của `src/hooks` nằm **ngoài**
tầm 1.841 phép kiểm. `plan.md` mục P9 đã khai thẳng: *"không một test nào canh phần này — nó là
kiểm bằng tay"*. Dưới đây là lượt kiểm ấy, chạy ngày **2026-11-26** trên bản dựng thật ở
`localhost:5173`, đọc bằng DOM chứ không bằng ảnh chụp.

**1. Nhánh JSX vạch sân — ✅ CẢ HAI NHÁNH VẼ, và phép đo sửa lại ba con số của chính chú thích.**

`San2D.tsx:2100` là một nhánh `{lienTuc ? … : …}`. Đo toạ độ thật của hai nhánh trên khung
`100×64` của sân 11 người:

| | nhánh **phút** (ước) | nhánh **liên tục** (mét thật) | lệch |
|---|---|---|---|
| vòng tròn giữa, bán kính | **8,00** | **7,91** (= 9,15 m × 0,864706) | **+1,1%** |
| vòng cấm, sâu | **12,00** | **14,27** (= 16,5 m) | **−15,9%** |
| vòng cấm, cao | **28,00** | **34,86** (= 40,32 m) | **−19,7%** |
| biên sân | 96 × 60 tại (2; 2) | **90,79 × 58,80 tại (4,60; 2,60)** | — |
| số hình trong nhóm | 5 | **10** | — |

⚠️ **Ba con số trong chú thích `San2D.tsx:133-139` SAI, và lượt kiểm này là thứ tìm ra.** Chú
thích nói vòng tròn giữa ước ra **7,6** (đo được **8,00**), vòng cấm sâu **12** (đúng), vòng cấm
cao **26,7** (đo được **28,00**), và nói ba giá trị **thật** là 8,7 / 15,7 / 38,4 (đo được
**7,91 / 14,27 / 34,86** — chú thích đã nhân với một hệ số khác `0,864706`). Kết luận *"lệch
30%"* vì thế cũng quá tay: lệch lớn nhất thật là **19,7%** ở chiều cao vòng cấm.
📌 **Món nợ vẫn có thật và vẫn giữ nguyên lý do để nguyên** (khung chế độ phút co theo quân số,
và `hinhHocSan.ts` chỉ biết sân 11). Chỉ ba con số mô tả nó được sửa lại cho đúng.
Và `x(0 m) = 4,603` — cái "răng" của **D121** — hiện đúng trên màn hình: `4,60`.

**2. Các chỗ nối dây `useEffect` của `src/hooks` — ✅ ĐỦ, nhưng có NĂM chứ không phải bốn.**

Lời `T761` nói "bốn chỗ"; `grep` cho **năm**. Kiểm cả năm:

| chỗ | AC | quan sát được |
|---|---|---|
| `useBackup.ts:30` — hỏi lưu trữ bền khi mở app | AC-4.9 | ✅ `navigator.storage.persisted()` trả `false`, và đúng lúc ấy một `role="status"` hiện câu *"Trình duyệt không đánh dấu dữ liệu của ứng dụng là lưu trữ bền…"* |
| `useMatch.ts:358` — vòng đồng hồ, **một** vòng cho hai chế độ | AC-37.7 | ✅ phút đi 25′ → 28′ trong 2,5 giây ở mức *Thường* |
| `useMatch.ts:441` — lưu trận khi nó kết thúc | AC-11.7 | ✅ chạy hết một trận liên tục mã `3X6DNTGV2V`: nó đứng **đầu** danh sách lịch sử ngay sau đó, và danh sách giữ đúng **20** dòng |
| `useNgonNgu.ts:50` — đọc ngôn ngữ + bảng màu từ đĩa khi mở | AC-20.8 | ✅ bấm *Tối*, **tải lại trang**, `data-che-do` vẫn là `toi` |
| `useNgonNgu.ts:68` — đặt `data-che-do` lên `<html>` | AC-20.7, AC-20.9 | ✅ bấm *Tối* → thuộc tính xuất hiện và nền đổi sang `rgb(14,21,18)` **không tải lại trang** |

**3. Nhãn thời tiết — 🔴 KHÔNG ĐẠT. Nó hiện ở CẢ HAI chế độ.**

| chế độ | nhãn |
|---|---|
| liên tục | *"Điều kiện: mưa, gió 6,3 m/s chéo sân"* — ✅ đúng như mong đợi |
| theo phút | *"Điều kiện: mưa, gió 2,1 m/s dọc sân"* — 🔴 **không được hiện, mà vẫn hiện** |

📍 Nguyên nhân rõ ràng và không cần đoán: `TrangTran.tsx:416` là `{dieuKien && (…)}`, và
`dieuKien` chỉ phụ thuộc `tran.maTran` — **không có một điều kiện chế độ nào**. Mã trận nào cũng
sinh ra thời tiết, nên nhãn nào cũng hiện.

⚠️ **Hai cách đọc, và tôi không tự chọn thay người dùng:**
- **Giao diện sai.** Câu 11 của nhật ký làm rõ nói thời tiết *"trong 007 chỉ ảnh hưởng vật lý
  bóng"*, mà vật lý bóng chỉ chạy ở chế độ liên tục. Vậy ở chế độ phút nhãn ấy **hứa một ảnh
  hưởng không tồn tại**. Chữa: thêm điều kiện chế độ vào `TrangTran.tsx:416`.
- **Lời `T761` sai.** Thời tiết dẫn xuất tất định từ mã trận ở **mọi** trận (AC-38.9), nên có
  thể lập luận rằng nó là một tính chất của trận chứ không của chế độ, và hiện ở cả hai là đúng.

**Không AC nào phân xử chỗ này** — mệnh đề "không hiện ở chế độ phút" chỉ tồn tại trong lời
`T761`, không trong một AC nào của spec 001–007. Nên đây là **một câu hỏi cho người dùng**, và
nó được ghi ở đây thay vì được sửa im hoặc được bỏ qua im.

**4. Nhóm radio chọn chế độ, bằng bàn phím + lý do khoá đọc được (P9) — ✅ ĐẠT.**

- Phím mũi tên **chạy thật**: đặt tiêu điểm vào ô `co-dien`, nhấn `Down` → ô `lien-tuc` được
  chọn **và** nhận tiêu điểm. (Phép thử đầu tiên của tôi bắn một `KeyboardEvent` dựng bằng
  JavaScript và kết luận *"không chạy"* — **sai**: sự kiện không đáng tin thì trình duyệt không
  chạy hành vi mặc định. Phải bấm phím thật mới đo được.)
- Nhóm có `role="radiogroup"` và `aria-labelledby` trỏ đúng nhãn *"Chế độ mô phỏng"*.
- **Khoá có nói vì sao, bằng CHỮ:** đặt quân số về **7**, ô `lien-tuc` thành `disabled`, lựa
  chọn rơi về `co-dien`, và một `role="status"` hiện: *"Chế độ liên tục chỉ chạy được ở sân 11
  người; trận này đang là sân 7. Hình học sân và cơ học chuyển động của chế độ ấy đều là số của
  sân 11."* — không dựa màu, đọc được bằng trình đọc màn hình. **AC-45.8** đạt phần giao diện.

**Kết luận:** 3/4 mục đạt. Mục 3 **chưa đạt** và đang chờ người dùng phân xử; mục 1 đạt nhưng
**sửa lại ba con số sai** trong chú thích mô tả món nợ của chính nó.

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
  **Người dùng xác nhận chiều này ngày 2026-11-23**, nên AC-38.7 **không đổi**. Kèm theo: **độ
  dài cỏ KHÔNG vào spec 007** — nó là một đại lượng mới chưa có trong AC nào, và thêm nó thì
  phải thêm một AC, một nguồn sinh từ mã trận và một hằng số ma sát nữa. Câu ở mục 10 của
  `ban-mo-ta-goc.md` vì thế **không đúng** cho spec 007; tài liệu ấy **giữ nguyên lời của
  người dùng** và chỉ được **thêm một ghi chú phán xử** có ngày, không sửa câu nào.
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
| **P3** dữ liệu người dùng bất khả xâm phạm | 20 trận đã lưu phải **mở và xem lại** được y nguyên; trận lưu bằng **v6** phải **đấu lại** y nguyên, trận lưu bằng **v5** thì không — chúng đã mất nút ấy ở spec 006 và spec 007 không lấy thêm gì nữa (AC-45.2, và ghi chú sửa ở mục 1) |
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

- **Giữ nguyên toàn bộ spec 005**: nội suy có đường cong và lớp dao động **vẫn cần** — nhưng
  **không phải vì lý do ghi ở bản Clarified**, và chỗ sai ấy để lại đây có chủ ý.

  > **Lý lẽ cũ SAI, phát hiện khi lập plan ngày 2026-11-22.** Bản Clarified viết "mốc 0,5–1
  > giây của engine mới là 1–2 mốc mỗi giây". Câu ấy **nhầm giây TRẬN với giây THẬT**. Ở mức
  > chậm nhất đang có — 2000ms một phút trận — một giây trận dài **33,3 ms thật**, tức **30
  > mốc mỗi giây thật**. Ở mức Chậm (1000ms) là **60 mốc mỗi giây thật**: đúng một mốc cho
  > mỗi khung hình, **không còn gì để nội suy**. Ở mức Thường (200ms) là 300 mốc mỗi giây —
  > tức phải **bỏ bốn trên năm mốc**.
  >
  > Vấn đề thật vì thế là **chiều ngược lại**: không phải thiếu mốc mà **thừa mốc**. Lớp
  > nội suy vẫn được giữ, nhưng vai trò của nó đổi — từ "vẽ thêm giữa hai mốc thưa" thành
  > "chọn và làm mượt giữa những mốc dày". Plan phải viết rõ điều đó, vì nếu nối dây theo
  > lý lẽ cũ thì ở mức Thường trở lên engine sẽ tính ra bốn phần năm số mốc **không ai nhìn
  > thấy**.
- **Giữ phần vẽ của spec 006**: bóng trong chân người giữ bóng, vòng sáng, phép kẹp thủ môn,
  nghiêng khối theo bóng và theo vai trò.
- **Bỏ phần SUY RA của spec 006**: dựng mốc trung gian từ đường bóng, và đoán ai đang giữ
  bóng từ danh sách người tham gia. Engine mới nói thẳng cả hai (AC-37.6), nên để hai nguồn
  cùng tồn tại là mời một lớp lỗi rất khó thấy. Phần bỏ này **chỉ áp dụng cho chế độ liên
  tục**: chế độ hiện tại vẫn cần lớp suy ra, vì engine **v6** không nói ai giữ bóng.

---

## 11. Nhật ký làm rõ

Mười hai câu hỏi, chốt ngày **2026-11-19**. Người dùng chọn đúng phương án khuyến nghị ở cả
mười hai — lần đầu trong sáu spec.

| # | Câu hỏi | Quyết định | Cái giá đã nói trước khi chốt |
|---|---|---|---|
| 1 | Engine mới thay thế hay song song? 20 trận đã lưu ra sao? | **Song song.** Engine hiện tại và 20 trận đã lưu giữ nguyên, đấu lại y nguyên. Engine mới là lối vào thứ hai. ⚠️ *(Bản ghi của quyết định ngày 2026-11-19, giữ nguyên lời lúc đó. Nửa sau đã được **sửa 2026-11-23**: trận lưu bằng v5 chỉ mở và xem lại được, không đấu lại được — xem ghi chú ở mục 1 và nhật ký hàng 25.)* | Hai engine cùng sống, hai bảng thống kê khác nhau cho cùng một đội, và mọi tính năng sau phải chọn làm cho bên nào. Tiền lệ: hiến pháp 3.0 đã cho hai vòng lặp chơi sống song song |
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
ép sân 5–10 phút. Thống kê cả trận bám mức thật, **tính trung bình trên một lượng trận đủ
lớn** chứ không phải trần cứng của từng trận (nguyên văn mục 6 của `ban-mo-ta-goc.md`: "bàn
thắng: **trung bình** 2–3 (0 bàn và 5+ bàn đều có thể nhưng hiếm)"): bàn 2–3, sút 20–30,
phạm lỗi 20–28, vàng
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

### Ba điều người dùng nói ngày 2026-11-22, bằng lời của họ

Xem bản chạy ở T617 của spec 006, người dùng nêu bốn điều. Một điều đã sửa trong spec 006
(thủ môn lên quá cao — T626). **Ba điều còn lại thuộc về đây**, và chúng được ghi nguyên văn
vì câu chữ của người dùng sắc hơn mọi cách tôi diễn đạt lại:

> *"khi tấn công thì khối đội hình phải dâng lên phần sân đối thủ và đội đối thủ phải lùi về"*

**Đã đo, và cơ chế có thật nhưng không đủ.** Đội nhà (tấn công sang phải, x lớn là lên cao),
đo ở mốc trên 10 mã trận, **bỏ thủ môn ra**:

| | Nhà cầm bóng | Khách cầm bóng | Lệch |
|---|---|---|---|
| Trọng tâm đội | 45,26 | 39,21 | **+6,05** |
| Hàng thủ (người sâu nhất) | 27,85 | 22,97 | **+4,88** |
| Người cao nhất | 71,88 | 62,56 | **+9,32** |

Đúng chiều, nhưng **trọng tâm 45,26 vẫn nằm bên phần sân nhà** — vạch giữa là 50. Đội đang
tấn công chưa bao giờ thật sự dâng sang phần sân đối thủ. Siết thêm ở spec 006 không được
nữa: trần nghiêng khối đã ở 1/6 và sàn hai điểm gần nhau nhất đã tụt xuống 1,31 bán kính.
Đây là **US-40** — khối phòng ngự 30–40 m dọc, dịch theo phía có bóng, chiều cao hàng thủ
theo chỉ thị.

> *"có những pha phản công và trận đấu vẫn cần liền mạch hơn"*

Engine hiện tại **không có khái niệm chuyển trạng thái**: mỗi phút là một pha độc lập, không
có "vừa mất bóng xong thì lao lên". Đây là **AC-40.4** (3–5 giây phản pressing hoặc lùi về)
cộng với chính lý do spec này tồn tại — một sự kiện mỗi phút thì không có gì liền mạch được.

> *"cầu thủ di chuyển nhưng mà không phải tại chỗ mà theo tình huống bóng"*

**Đã đo.** Quãng mỗi người đi giữa hai mốc, trên 10 mã trận:

| | Số lượt | Trung vị | p90 |
|---|---|---|---|
| **Có** tham gia tình huống | 1.402 | **24,26** | 48,14 |
| **Không** tham gia | 15.251 | **5,14** | 15,23 |

Và **28,2% số lượt người không tham gia đứng im hoàn toàn** giữa hai mốc — thứ nhúc nhích mà
người xem thấy chỉ là lớp dao động ±1 đơn vị tại chỗ. Đây là **US-41**: mỗi người không cầm
bóng phải có một mục đích gọi tên được từ danh mục mục 11 của bản mô tả.

### Những gì hoãn từ spec 006 sang đây

- **AC-34.2 của spec 006** — người rê bóng phải **đi vòng qua** điểm của đối thủ nằm trên
  đường đi, không đi xuyên qua. Spec 006 đóng mà chưa làm (Phase 50 bị bỏ, xem mục 9 và nhật
  ký câu 6). Ở engine mới, đây là hệ quả tự nhiên của toạ độ mét cộng cơ học US-38, nên nó
  thuộc **spec 007 hoặc 009** tuỳ chỗ lớp tránh người được dựng — `/plan` quyết.

---

## 13. Bước tiếp theo

Mục 8 đã rỗng, nên cổng chặn của hiến pháp mục 5 đã mở. `plan.md` viết xong **2026-11-23**
(18 quyết định D117–D134, 14 rủi ro R51–R64, bảy lát Phase 53–59), và **tám câu** plan không
tự quyết đã được người dùng trả lời trong cùng ngày — xem mục 15. Chạy `/tasks`.

Spec 006 đã đóng và nhánh `007-continuous-match-engine` đã cắt từ `main` tại `7e1b065`.


---

## 14. Nhật ký làm rõ — bổ sung 2026-11-22 (phát hiện khi lập `/plan`)

Khảo sát code trước khi viết `plan.md` tìm ra **bốn chỗ spec thiếu hoặc sai tới mức không
lập plan được**, cộng hai chỗ sửa kèm. Người dùng chốt cả bốn trong cùng một lượt.

| # | Chỗ hỏng | Đo được | Quyết định |
|---|---|---|---|
| 13 | **Không AC nào nói sân 5 người trông ra sao.** Trận chạy được 5–11 người và 20–90 phút, cả hai là trường thật của bản ghi; nhưng AC-37.1/37.2 chỉ định nghĩa hình học của sân 11 | `CAC_QUAN_SO` = 11…5, `CAC_THOI_LUONG` = 20…90 | **Chế độ liên tục chỉ cho sân 11** → AC-45.8 mới |
| 14 | **AC-45.5 và AC-45.6 trỏ vào một tài liệu không có trong repo** — "mục 7b và mục 15 của bản mô tả gốc" | Bản 21 mục chưa từng được lưu vào `specs/` | **Lưu vào repo** thành `ban-mo-ta-goc.md`, AC trỏ vào đó |
| 15 | **AC-45.3 có thể đỏ vì lấy mẫu chứ không vì mô hình sai** | Repo đã đo nhiễu **12 điểm phần trăm ở 60 mã**, lớn hơn ngưỡng 10 của chính AC | **Nới lên 200 mã**, và ghi rõ AC là hợp đồng **tạm** có ngày hết hạn là spec 010 |
| 16 | **AC-38.8 không kiểm được từ tệp xuất**: độ cong do lớp nội suy ở tầng ui sinh ra, mà engine bị cấm import tầng ấy | `src/engine/boundaries.test.ts` quét mọi file engine | **Chấp nhận AC-38.8 là ngoại lệ** của AC-45.6, canh bằng phép kiểm thuần ở lớp vẽ |

**Hai chỗ sửa kèm, không phải hỏi vì chúng không đổi ý định của ai:**

- **AC-45.4 thiếu bốn trường.** Danh sách "phải lưu" bỏ sót `quanSo`, `thoiLuong`,
  `sanTrungLap` và `doiCuaNguoiDung` — cả bốn đều đổi kết quả trận, nên thiếu chúng là sinh
  lại ra một trận khác. Kèm theo, AC-45.4 chỉ khả thi nếu **can thiệp giữ độ phân giải
  phút**: hôm nay `CanThiep` mang số phút nguyên và áp vào đầu phút kế tiếp (D30b của spec
  001), còn chế độ liên tục có 60 mốc mỗi phút — cho can thiệp mang mốc giây là làm bản ghi
  đổi hình dạng **và** làm sinh lại lệch khi người dùng bấm giữa phút.
- **Lý lẽ của mục 10 sai.** "Mốc 0,5–1 giây là 1–2 mốc mỗi giây" nhầm **giây trận** với
  **giây thật**: ở mức Chậm, một giây trận dài 16,7 ms thật nên mốc tới **60 lần mỗi giây
  thật** — đúng một mốc một khung hình, không còn gì để nội suy. Vấn đề thật là **thừa mốc**,
  không phải thiếu. Quyết định "giữ nguyên spec 005" vẫn đứng, nhưng vì một lý do khác.

**Và một điều phải nói ra dù không ai hỏi:** với người bật **giảm chuyển động**, spec 007
không mang lại gì. Lớp nội suy và lớp dao động đều tắt cho họ, nên họ nhận đúng kiểu nhảy
mốc mà spec 005 và 006 sinh ra để chữa — chỉ là dày hơn 60 lần. Plan phải ghi điều này,
không phải một dòng bảng để tick.

---

## 15. Nhật ký làm rõ — bổ sung 2026-11-23 (tám câu `plan.md` không tự quyết)

`plan.md` chốt 18 quyết định thiết kế nhưng **từ chối tự trả lời tám câu**, vì mỗi câu đổi một
điều spec chưa nói. Người dùng trả lời cả tám trong hai lượt ngày 2026-11-23, **cả tám theo
phương án được khuyến nghị**. Ba câu trong số đó sinh ra AC mới (AC-45.9, AC-45.10, AC-45.11),
một câu sửa số của AC-38.10, bốn câu còn lại chốt mà **không** đổi AC nào.

| # | Câu hỏi | Quyết định | Spec đổi gì |
|---|---|---|---|
| 17 | **"Bóng chết" nghĩa là gì, và 20 giây một pha chia thế nào** (engine chỉ sinh 1,92 hành động mỗi chuỗi nên phần dư phải đi đâu đó) | **Để bốn con số trong `plan.md`, KHÔNG thành AC.** Phép kiểm chỉ khẳng định **tính nhất quán** (tổng thời lượng mỗi phút khớp 60 giây), không khẳng định giá trị | **Không đổi.** Lý do: mức thật "bóng chỉ lăn 55–60 phút" là nguyên văn phạm vi spec 010, và spec 008 sẽ **thay** định nghĩa này khi mang luật IFAB vào. Cái giá đã nói: bốn số không có AC nào canh |
| 18 | **Ngân sách kích thước tệp xuất, và nó có vào hiến pháp không** | **11 MB, chỉ trong spec 007.** Không bump hiến pháp | **AC-45.11 mới** + một câu ở mục 6. Hiến pháp **không** đổi, nên spec 008–010 không bị ràng vào con số đo trên hình dạng dữ liệu hôm nay |
| 19 | **Bán kính điểm cầu thủ ở chế độ liên tục** | **Giữ 2,6** (người dùng vừa xin thu 3,4 → 2,6 ở T627) | **Không đổi.** Cái giá đã nói: hai người tranh chấp vẽ thành hai đĩa chồng **71–89%**; bất biến "không hai điểm chồng khít" phải được phát biểu lại theo **đúng chữ của AC-15.2** chứ không theo cách đo hôm nay — việc của `plan.md` R58, không phải của spec |
| 20 | **Chiều ma sát sân ướt — bản mô tả gốc tự nói ngược ở mục 10 và mục 21** | **Sân ướt thì bóng đi XA hơn** (chiều mục 21, đúng chiều AC-38.7 đang viết). Độ dài cỏ **không** vào spec 007 | **AC-38.7 không đổi**; mục 9 ghi lại xác nhận. `ban-mo-ta-goc.md` **giữ nguyên cả hai câu của người dùng** và chỉ nhận một **ghi chú phán xử** có ngày — tài liệu ấy là *lời của họ*, nên tôi không sửa lời |
| 21 | **Người bật giảm chuyển động thấy gì ở chế độ liên tục** (AC-31.1 nói "không nội suy, không dao động" — nó không nói "ít chuyển động hơn") | **Đồng hồ mốc chạy, chỉ tắt nội suy và dao động** | **AC-45.9 mới.** Nó nói thẳng chỗ **tệ hơn hôm nay**: đường chuyền dài thành bước nhảy ~26 đơn vị, gấp 3,3 lần bước nhảy lớn nhất của người |
| 22 | **AC-38.10 đòi một con số không dựng nổi** (15–25 m mâu thuẫn số học với AC-38.1/38.2, thiếu 1,55 m ở ca thuận lợi nhất) | **Nới dải thành 15–35 m**, giữ phép kiểm **tuyệt đối** | **AC-38.10 sửa số.** Hai mệnh đề còn lại của AC không đổi, `plan.md` D133 là chủ sở hữu |
| 23 | **Phép kiểm AC-45.3 tốn 400 trận — trong `npm test` mặc định hay chạy theo yêu cầu?** | **Trong `npm test` mặc định.** AC-45.3 là lưới duy nhất canh "hai chế độ ra cùng một kết quả", tức canh P1 | **Không đổi.** Cái giá đã nói: suite có thể từ ~27 giây lên ~68 giây ở nhánh xấu nhất — file này một mình thêm 46–54% |
| 24 | **Chữ "tua" ở mục 4 bước 3 nghĩa là gì** (không AC nào định nghĩa nó) | **Tua TỚI thôi** — đổi mức tốc độ và *Chạy hết trận*. **Không** tua ngược, **không** thanh thời gian | **AC-45.10 mới** + mục 4 bước 3 viết lại. Cái giá: xem lại một pha vừa trôi qua thì phải chạy lại cả trận |

| 25 | **AC-38.10 vẫn không dựng nổi, lần này ở vị trí THẬT** (đo T716: 749/113.460 mốc ngoài dải 15–35 m; dải thật [5,1; 40,3] m) | **Tách thành ĐÍCH và ĐỘ TRỄ**, hai mệnh đề **tuyệt đối**, và **giữ nguyên con số 15–35 m** — không nới dải lần thứ hai | **AC-38.10 viết lại thành bốn mệnh đề**: (a) **đích** cách bóng 15–35 m — đúng 100% theo cấu trúc; (b) và (c) như cũ; **(d) mới** — vị trí thật lệch khỏi đích không quá **20 m**. ⚠️ 20 m chỉ dư **0,13 m** so với phép đo, nên **T720 phải đo lại** khi bóng có vật lý thật |

| 26 | **Mệnh đề (d) vừa thêm hôm qua đã vỡ ngay khi bóng có vật lý thật** (đo T726: 46,48 m so với lề 20 m) | **Đổi neo sang chỗ pha bóng sắp tới, và nới lề lên 50 m** — giữ phép kiểm tuyệt đối, không bỏ mệnh đề | **AC-38.10 (d) sửa số** 20 → 50. Lý do không nhỏ hơn được là **số học của lưới thời gian**: mỗi hành động 2 giây, hai tâm vùng cách tới 84 m, trọng tài đi được 18 m — sàn ~33 m dù neo vào đâu. ⚠️ Cái giá: (d) nay chỉ bắt được "điểm trọng tài chết hẳn hoặc bay loạn" |

**Tổng AC sau lượt này: 30** (US-37: 8, US-38: 11, US-45: 11). `plan.md` mục 6 phải phủ 30/30.

### Hai chỗ lạc hậu — người dùng cho sửa, 2026-11-23

`plan.md` mục 11 nêu hai chỗ spec nói sai so với code mà plan **không** tự sửa, vì sửa chúng
đổi **lập luận** của spec chứ không phải sổ sách. Người dùng cho sửa trong cùng ngày:

| # | Chỗ lạc hậu | Sự thật trên code | Đã sửa thành |
|---|---|---|---|
| 25 | Bốn chỗ viết "Engine v5", và câu "20 trận đã lưu **đấu lại** y nguyên". ⚠️ Danh sách bốn chỗ của `plan.md` mục 11 **thiếu**: soát chéo sau khi sửa tìm thêm **ba chỗ** mang cùng lời hứa mà không mang chữ "v5" — hàng **P3 của mục 10** (nơi mở đầu bằng "Mọi AC dưới đây PHẢI còn đúng khi spec 007 đóng", nên nó là yêu cầu **còn sống** chứ không phải lịch sử), hàng tình huống biên "engine đã đổi kể từ đó" (nói "chuyển động có thể khác" trong khi thật ra **đấu lại bị từ chối**), và quyết định 1 của nhật ký 2026-11-19. Cả ba đã xử | `PHIEN_BAN_ENGINE = 6` (`tran.ts:1316`) từ `f537d7d`; `lyDoKhongDauLai` trả `'khac-phien-ban-engine'` khi phiên bản khác (`matchRepo.ts:202`) | Engine hiện tại là **v6**. Trận lưu bằng v5 **mở và xem lại được** nhưng **không đấu lại được** — chúng đã mất nút ấy **một lần** ở spec 006, và spec 007 từ chối trả giá đó lần thứ hai. Lời hứa đúng nằm ở **AC-45.2**, vốn đã viết "bằng engine **hiện tại**" |
| 26 | Cảnh báo của AC-45.3 ghim vào **3,95 bàn một trận** của v5 | Đo lại 2026-11-23, 200 mã × 4 hạt giống, sân trung lập: hai đội bằng nhau **2,495–2,870**; **A15 vs B10** (cặp phép kiểm thật sự dùng) **3,110–3,390** | Cảnh báo **giữ lại, viết lại bằng số của v6**. Nó **chưa** hết hiệu lực: ở đúng cặp đấu của phép kiểm, v6 **vẫn trên** dải 2–3 của spec 010, nên spec 010 vẫn phải phá AC-45.3 — chỉ là khoảng cách co từ ~0,95 bàn xuống ~0,2–0,4 bàn |

> **Và một chỗ `plan.md` tự sai, đã sửa cùng lúc.** Mục 11 của plan viết v6 đo được "**2,475
> bàn một trận** — đã nằm trong dải 2–3", rồi kết luận hợp đồng tạm của AC-45.3 "đã hết hạn
> sớm". Con số ấy **không dựng lại được** và kết luận ấy **sai**: 2,475 là mức của hai đội
> **bằng nhau**, còn phép kiểm AC-45.3 dùng cặp **lệch chỉ số** A15 vs B10 theo D131, và ở
> cặp ấy cả bốn mẫu đều **trên 3**. Đây đúng là loại lỗi mà chính plan đã đặt lệnh cấm số 3
> để chặn: trích một con số mà không kèm lệnh dựng lại được và điều kiện đo.
