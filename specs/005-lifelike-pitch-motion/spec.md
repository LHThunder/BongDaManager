# Spec: Sân 2D sống như một trận thật

| | |
|---|---|
| **ID** | `005-lifelike-pitch-motion` |
| **Status** | Clarified (2026-11-18) |
| **Created** | 2026-11-18 |
| **Branch** | `005-lifelike-pitch-motion` |

> ⚠️ Tài liệu này mô tả **WHAT** và **WHY**. Mọi chi tiết kỹ thuật (thư viện, schema, API, tên file) thuộc về `plan.md`.

> **Spec này thuộc vòng lặp huấn luyện viên (vòng lặp 1), không phải vòng lặp
> sự nghiệp.** Hiến pháp **3.0.1** mục 1 chốt trình tự: hoàn thiện vòng lặp
> huấn luyện viên trước, sự nghiệp để sau. Spec 004 đã theo đúng trình tự ấy
> và spec này tiếp tục — nó không đi lạc, nó xếp hàng.

> **Spec này sửa lại một AC đã đóng của spec 004.** Xem mục 10. Spec 004 đã
> `Done`, nên nó **KHÔNG bị sửa ngược**: hồ sơ của quyết định lúc đó phải còn
> nguyên. Spec này nêu rõ nó thay thế AC nào — đúng cách hiến pháp 3.0.0 đã
> xử lý non-goals của spec 001.

## 1. Vấn đề & mục tiêu

**Vấn đề.** Người dùng xem sân 2D trong lúc trận đang chạy và nói đúng ba
điều: *"những chuyển động của cầu thủ chưa được tự nhiên, tôi muốn nó luôn
luôn di chuyển. Làm chậm lại các chuyển động hiện tại vì nó đang rất nhanh và
không tự nhiên."*

Đọc lại hành vi hiện tại thì ba điều ấy có ba nguyên nhân khác nhau, và sửa
một cái không hết hai cái kia:

1. **Phần lớn các điểm không hề di chuyển.** Chỉ những người mà câu tường
   thuật nhắc tên mới dịch tới chỗ bóng; những người còn lại giữ nguyên toạ
   độ cho tới khi đội hình đổi độ cao hoặc có thay người. Đo lúc đóng spec
   004: trong một chặng chuyển động, **6 trong 22 điểm** di chuyển — 16 điểm
   kia là tượng. Đây là nguyên nhân lớn nhất của cảm giác "sân chết", và nó
   không liên quan gì tới tốc độ.
2. **Mỗi cú di chuyển kết thúc bằng một cú phanh đứng.** Vận tốc bị bóp về 0
   ở cả hai đầu mỗi cú di chuyển, nên điểm rướn lên rồi dừng hẳn, mỗi phút
   trận một lần — ở nhịp hiện tại là **năm lần một giây**. Hướng đi thì đã
   nối mượt qua mốc, nhưng tốc độ thì không.
3. **Một phút trận chỉ dài một phần năm giây, nên mọi cú di chuyển buộc phải
   là cú rướn.** Quãng đường một người phải đi có thể bằng một phần ba sân,
   mà khoảng thời gian cho phép chỉ bằng 90% của một nhịp đồng hồ. Không có
   cách nào làm chuyển động trông thong thả trong khoảng ấy: muốn chậm thì
   **nhịp đồng hồ trận phải chậm hơn**. Đó là một quyết định về nhịp chơi, do
   người dùng chọn, không phải một tinh chỉnh vẽ.

**Một cái bẫy đã biết, ghi ra để không ai bước vào.** Làm chậm nhịp đồng hồ mà
giữ nguyên trần thời lượng một cú di chuyển thì điểm vẫn đi hết quãng đường
trong đúng khoảng thời gian cũ, rồi **đứng im** phần còn lại của nhịp — chậm
hơn nhưng **giật hơn**. Thời lượng di chuyển phải giãn theo nhịp, nếu không
việc làm chậm đi ngược lại mục đích của chính nó.

**Mục tiêu.** Xem sân 2D phải giống xem một trận đấu: ai cũng đang động, tốc
độ đáng tin, không có nhịp đứng-chạy-đứng; và người dùng chọn được một nhịp
chậm đủ để mắt theo được một người đi từ chỗ cũ tới chỗ mới.

**Non-goals.**

- **Không đổi engine.** Chuyển động là việc của tầng hiển thị. Đổi engine là
  tước nút đấu lại của mọi trận đã lưu — đúng rủi ro R33 mà spec 004 đã nêu.
- Không dựng mô hình chiến thuật vị trí thật (positional play) để sinh đường
  chạy: ai chạy chỗ nào, chạy chồng biên, bù vị trí cho nhau.
- Không đồ hoạ 3D, không thay điểm bằng hình người, không ảnh động cầu thủ.
- Không đổi dòng tường thuật, báo cáo sau trận, hay bất cứ con số nào của
  trận đấu.
- Không thuộc vòng lặp sự nghiệp.
- Không đổi định dạng bản ghi trận hay tệp sao lưu: chuyển động không được
  lưu, nó suy lại được từ dòng sự kiện.

## 2. Người dùng & bối cảnh

- **Ai dùng:** một người dùng duy nhất, trên máy cá nhân của mình.
- **Khi nào dùng:** mỗi lần xem một trận chạy theo đồng hồ, cạnh dòng tường
  thuật. Đây là màn hình người dùng ngồi lâu nhất của cả ứng dụng.
- **Thiết bị/môi trường:** trình duyệt trên máy tính, không mạng. Người dùng
  có thể đã bật chế độ giảm chuyển động của hệ điều hành.

## 3. User stories

### US-28: Sân lúc nào cũng sống

Là một **người dùng**, tôi muốn **thấy cả hai đội luôn đang di chuyển**, để
**sân trông như một trận đang diễn ra chứ không phải một sơ đồ có vài điểm
nhảy**.

**Acceptance criteria:**

- [ ] AC-28.1 — KHI trận đang phát theo đồng hồ THÌ **mọi** điểm cầu thủ PHẢI đổi vị trí liên tục; KHÔNG điểm nào được đứng nguyên một chỗ lâu hơn **300ms**.
- [ ] AC-28.2 — KHI một người không được tình huống nào nhắc tới trong nhiều phút liền THÌ điểm của anh ta VẪN PHẢI di chuyển quanh vị trí của mình, và PHẢI không rời khỏi vùng sân của vị trí ấy.
- [ ] AC-28.3 — KHI một tình huống diễn ra ở một vùng THÌ đúng tại phút của tình huống đó, những người tham gia PHẢI có mặt trong vùng ấy; chuyển động lúc chờ KHÔNG được làm sai vùng.
- [ ] AC-28.4 — KHI hai người đang đứng chờ gần nhau THÌ chuyển động chờ của họ PHẢI không trùng nhịp với nhau, để hai đội không "thở" đồng loạt như một khối máy.
- [ ] AC-28.5 — KHI trận đang tạm dừng THÌ **mọi chuyển động PHẢI dừng hẳn**, kể cả dao động chờ: sân đóng băng để người dùng đọc được vị trí từng người trước khi quyết định thay người, và để chữ "tạm dừng" có đúng một nghĩa.

### US-29: Nhịp xem được, chuyển động thong thả

Là một **người dùng**, tôi muốn **chọn được một nhịp chậm hơn và thấy chuyển
động giãn ra theo nhịp ấy**, để **mắt tôi theo được một cầu thủ đi từ chỗ cũ
tới chỗ mới**.

**Acceptance criteria:**

- [ ] AC-29.1 — KHI người dùng chọn mức tốc độ chậm nhất THÌ một cú di chuyển PHẢI chiếm gần hết khoảng giữa hai tình huống, KHÔNG để lại quãng đứng im nào dài hơn **300ms**.
- [ ] AC-29.2 — KHI nhịp đồng hồ chậm lại THÌ thời lượng một cú di chuyển PHẢI giãn theo; KHÔNG được giữ nguyên thời lượng cũ rồi thêm một quãng đứng im vào cuối nhịp.
- [ ] AC-29.3 — KHI người dùng đổi mức tốc độ giữa trận THÌ chuyển động PHẢI theo nhịp mới ngay ở tình huống kế tiếp, và KHÔNG điểm nào bị giật về chỗ cũ hay nhảy tới đích.
- [ ] AC-29.4 — KHI người dùng chọn mức nhanh nhất, nơi một phút trận chỉ dài vài chục mili-giây, THÌ hệ thống PHẢI thôi nội suy: các điểm nhảy thẳng tới vị trí tại mốc, và KHÔNG điểm nào được bị giật khi đang đi nửa đường — ở nhịp ấy không có chuyển động nào đọc được bằng mắt, nên vẽ đường đi chỉ sinh ra cú giật.
- [ ] AC-29.5 — KHI mở một trận lần đầu THÌ mức tốc độ mặc định PHẢI là mức chậm nhất (một phút trận dài 1000ms), và người dùng PHẢI đổi được sang mức khác ngay trong lúc trận đang chạy.

### US-30: Chuyển động trông như người chạy

Là một **người dùng**, tôi muốn **chuyển động trên sân trông như cầu thủ thật
đang di chuyển**, để **tôi tin vào thứ mình đang xem thay vì thấy những điểm
bị dịch chỗ**.

**Acceptance criteria:**

- [ ] AC-30.1 — KHI một cú di chuyển kết thúc và cú sau bắt đầu THÌ điểm PHẢI đi tiếp mà không có khoảnh khắc đứng yên nào ở giữa; tốc độ tại mốc PHẢI không về không.
- [ ] AC-30.2 — KHI bóng chuyển từ vùng này sang vùng khác THÌ điểm bóng PHẢI đi **theo đường thẳng và nhanh khoảng ba lần người**, nên nó tới đích hẳn trước những cầu thủ đi cùng hướng — mắt theo bóng trước, người theo sau, như một đường chuyền.
- [ ] AC-30.3 — KHI những người của một hàng ngang (hàng phòng ngự, hàng tiền vệ) không tham gia tình huống THÌ các điểm của hàng ấy PHẢI giữ ngang hàng nhau trong **một phần tư khoảng cách giữa hai người trong hàng**, như một hàng bốn thật, chứ không trôi rời rạc.
- [ ] AC-30.4 — KHI bóng ở một phần sân THÌ cả khối đội hình PHẢI nghiêng nhẹ về phía ấy — khoảng **một phần mười chiều dài sân** — đủ để thấy đội đang dồn lên hay lùi về, mà sơ đồ đang dùng VẪN nhận ra được (4-4-2 vẫn ra 4-4-2).
- [ ] AC-30.5 — KHI xem bất kỳ mười giây nào của một trận đang chạy THÌ KHÔNG điểm nào được ra ngoài vạch biên, và KHÔNG hai điểm nào được nằm khít lên nhau tới mức người xem chỉ thấy một.
- [ ] AC-30.6 — KHI một cầu thủ đã xuống thể lực THÌ ở những nhịp còn dư thời gian, điểm của anh ta PHẢI **đi chậm thật**: tới đích muộn hơn một người cùng lúc còn sung sức, nhưng VẪN phải tới trước khi tình huống kế tiếp tới. Ở nhịp không đủ dư thời gian, độ chênh PHẢI vẫn nhận ra được bằng dáng chạy (xuất phát muộn hơn, đi phần lớn quãng đường sau).

### US-31: Những lời hứa cũ không được rơi

Là một **người dùng**, tôi muốn **sân sống động hơn mà không mất những thứ đã
có**, để **tôi không phải đánh đổi khả năng dùng được lấy vẻ đẹp**.

**Acceptance criteria:**

- [ ] AC-31.1 — KHI hệ điều hành bật chế độ giảm chuyển động THÌ sân PHẢI không nội suy và không có chuyển động chờ, mà vẫn hiển thị đúng vị trí tại từng mốc.
- [ ] AC-31.2 — KHI chuyển động mới đang bật THÌ tỉ số, dòng tường thuật, chỉ tiêu hai đội và điểm từng cầu thủ PHẢI không đổi so với trước spec này.
- [ ] AC-31.3 — KHI người dùng chạy hết một trận ở chế độ chạy ngay THÌ thao tác PHẢI xong trong dưới 3 giây, kể cả khi sân 2D đang bật.
- [ ] AC-31.4 — KHI trận đang phát theo đồng hồ với 22 điểm cùng di chuyển THÌ công việc mỗi khung vẽ PHẢI gọn trong một nhịp đồng hồ ở **mọi** mức tốc độ, và PHẢI không có tác vụ nào chiếm luồng chính quá 50ms.
- [ ] AC-31.5 — KHI có thêm một mức tốc độ mới THÌ nhãn của nó PHẢI có cả tiếng Việt và tiếng Anh, và PHẢI chọn được bằng bàn phím.
- [ ] AC-31.6 — KHI một cầu thủ kiệt sức THÌ tình trạng ấy PHẢI vẫn có mặt dưới dạng chữ; chuyển động KHÔNG được là cách duy nhất để biết.
- [ ] AC-31.7 — KHI người dùng ẩn sân rồi hiện lại giữa trận THÌ các điểm PHẢI xuất hiện đúng chỗ của thời điểm hiện tại và đi tiếp, KHÔNG chạy lại từ đầu một cú di chuyển cũ.

## 4. Luồng chính (happy path)

1. Người dùng bắt đầu một trận → sân hiện 22 điểm, **tất cả đang động** ngay
   từ phút 0, trước khi có tình huống nào.
2. Người dùng chọn mức tốc độ chậm → nhịp giãn ra, mỗi cú di chuyển kéo dài
   gần hết khoảng giữa hai tình huống; mắt theo được từng người.
3. Phút 12 có một pha ở cánh phải → nhóm liên quan chạy tới đó mà không phanh
   đứng khi tới, cả khối nghiêng nhẹ theo hướng bóng, hàng phòng ngự vẫn giữ
   ngang hàng.
4. Người dùng đổi sang mức Thường → nhịp nhanh lên ngay ở tình huống kế tiếp,
   không điểm nào bị giật.
5. Hết trận → báo cáo sau trận và dòng tường thuật y như trước spec này.

## 5. Trường hợp biên & lỗi

| Tình huống | Hành vi mong đợi |
|---|---|
| Phút 0, chưa có tình huống nào | Mọi điểm vẫn động quanh chỗ đứng của mình; sân không đứng chết trước giờ bóng lăn |
| Trận đang tạm dừng | Mọi chuyển động dừng hẳn, kể cả dao động chờ (AC-28.5) |
| Trận đã kết thúc | Sân giữ vị trí cuối, không chuyển động vô nghĩa sau tiếng còi |
| Một người bị thẻ đỏ rời sân | Điểm của anh ta biến mất gọn, không để lại điểm ma đang dao động |
| Thay người giữa trận | Người mới xuất hiện tại vị trí của mình, không trượt từ mép ảnh vào |
| Sân 5 người (khung co lại) | Biên độ chuyển động chờ co theo khung; 5 điểm không được trông như đang rung |
| Hai đội cùng dồn vào một vùng | Các điểm giãn ra như hiện nay, không trùng khít lên nhau (AC-30.5) |
| Giảm chuyển động + mức chậm nhất | Không nội suy, không dao động, vị trí tại mốc vẫn đúng (AC-31.1) |
| Cửa sổ bị ẩn hoặc khung hình không chạy một lúc | Khi quay lại, các điểm phải ở đúng vị trí của thời điểm hiện tại, không đứng lại ở nửa đường của một cú di chuyển đã cũ |
| Máy yếu, khung hình rơi | Chuyển động thưa hơn là chấp nhận được, nhưng vị trí tại mốc vẫn phải đúng và không điểm nào bị nhảy ngược |
| Người dùng đổi tốc độ liên tục nhiều lần trong một giây | Không điểm nào bị giật về chỗ cũ; nhịp cuối cùng là nhịp được áp dụng |
| Mất mạng | Không ảnh hưởng: ứng dụng vốn không gọi mạng (hiến pháp P4) |

## 6. Yêu cầu phi chức năng

- **Nhịp đồng hồ trận (chốt ngày 2026-11-18):** thêm một mức **chậm nhất
  là 1000ms cho một phút trận** — trận 90 phút xem hết trong khoảng một
  phút rưỡi, mỗi cú di chuyển dài gần một giây. Mức này là **mặc định** khi
  mở một trận. Ba mức cũ (200ms, 70ms, 20ms) giữ nguyên, nhưng mức 20ms
  thôi nội suy hoàn toàn (AC-29.4).
- **Biên độ chuyển động chờ (chốt ngày 2026-11-18):** một người đứng ngoài
  tình huống dao động quanh chỗ mình khoảng **một nửa khoảng cách giữa hai
  cầu thủ đứng chung một vùng** — đủ để thấy rõ ai cũng đang động, chưa tới
  mức 22 điểm trông như đang rung. Biên độ này **co theo khung sân**, vì khung
  co lại theo quân số.
- **Hiệu năng:**
  - Chạy hết một trận ở chế độ chạy ngay: **< 3 giây**, như spec 004 đã chốt.
  - Khi đang phát theo đồng hồ với 22 điểm luôn di chuyển: công việc mỗi khung
    vẽ **gọn trong một nhịp đồng hồ** ở mọi mức tốc độ, và **không tác vụ nào
    quá 50ms**. Số đo nền từ spec 004 để so: mỗi khung ≤ **0,3ms** ở mức
    Thường và ≤ **1,0ms** ở mức Nhanh, với chuyển động chỉ chạy ~90% thời
    gian — nên còn dư cho việc chạy liên tục, nhưng phải đo lại chứ không suy.
  - Ngưỡng "đứng im" của AC-28.1 và AC-29.1 (chốt ngày 2026-11-18): **300ms**
    thời gian thực — ngắn hơn một cái nháy mắt kéo dài, nên mắt khó đọc ra
    là "đã dừng". Chặt, nhưng đúng với chữ "luôn luôn".
- **Tái lập được (P1):** lớp chuyển động MUST NOT gọi nguồn ngẫu nhiên hay
  nguồn thời gian toàn cục nào để sinh dao động. Dao động của một người phải
  suy ra được từ danh tính của chính anh ta và đồng hồ trận, nên xem cùng một
  trận hai lần thì chuyển động giống nhau. Chuyển động KHÔNG đi vào bản ghi
  trận.
- **Accessibility (P9):** mức tốc độ mới chọn được bằng bàn phím; tương phản
  4.5:1 giữ nguyên ở cả hai chế độ sáng/tối; chuyển động MUST NOT là kênh duy
  nhất mang thông tin; chế độ giảm chuyển động của hệ điều hành phải được tôn
  trọng.
- **Song ngữ (P8):** mọi chuỗi mới có đủ tiếng Việt và tiếng Anh trong **cùng
  một commit**.
- **Dữ liệu:** không đổi định dạng bản ghi trận và tệp sao lưu. Phiên bản
  engine giữ nguyên.

## 7. Định nghĩa hoàn thành (Definition of Done)

- [ ] Toàn bộ AC ở mục 3 pass
- [ ] Trường hợp biên mục 5 được xử lý
- [ ] Không vi phạm nguyên tắc nào trong constitution **3.0.1**
- [ ] **Phiên bản engine KHÔNG đổi**, và các phép kiểm tương thích của spec
      trước vẫn xanh: một trận lưu từ trước spec này đấu lại vẫn cho đúng kết
      quả và đúng từng dòng sự kiện
- [ ] Có phép kiểm tự động cho lớp chuyển động: vị trí tại mốc vẫn đúng tuyệt
      đối, dao động chờ bị chặn trong vùng của vị trí, và cùng một người ở
      cùng một thời khắc cho cùng một vị trí (P1)
- [ ] **Người dùng tự xem một trận và nói là tự nhiên.** Không phép kiểm tự
      động nào thay được mục này, và nó là lý do spec này tồn tại
- [ ] Đo lại hai ngân sách ở mục 6 trên bản build, ghi số đo vào mô tả commit
- [ ] Tự tay đi hết màn hình trận ở **cả hai ngôn ngữ và cả hai chế độ
      sáng/tối**, kèm một lượt với chế độ giảm chuyển động đang bật
- [ ] Những AC của spec 004 mà spec này hứa giữ — AC-25.2, AC-25.5, AC-25.6,
      AC-25.8 — được kiểm lại, không AC nào rơi

## 8. Câu hỏi mở

Không còn câu hỏi mở. Toàn bộ 11 điểm đã được chốt ngày **2026-11-18** —
xem mục 11.


## 9. Giả định

- **Vị trí tại mốc do lớp hiện có quyết định, và spec này không đổi cách tính
  ấy.** Spec này chỉ thêm chuyển động *giữa* các mốc và *quanh* một mốc. Nếu
  lúc lập plan thấy buộc phải đổi cách tính vị trí tại mốc thì đó là một spec
  khác, phải dừng và hỏi.
- **Chuyển động không cần lưu.** Nó suy lại được từ dòng sự kiện đã lưu, nên
  định dạng bản ghi và tệp sao lưu không đổi.
- **"Tự nhiên" chỉ người dùng phán được.** Phiên làm việc của trợ lý không vẽ
  được khung hình: đo trực tiếp ở spec 004 cho thấy **không một khung hình nào
  chạy** trong 1,5 giây dù cửa sổ tự báo là đang hiện — đúng vật cản đã chặn
  T035 của spec 001 và cả lát 33 của spec 004. Vì vậy mọi AC về *cảm giác*
  chuyển động (AC-28.1, AC-28.4, AC-29.1, AC-30.1 → AC-30.4) phải kiểm trên
  trình duyệt của người dùng. Trợ lý chỉ chứng minh được phần đo được bằng số:
  toạ độ, thời lượng, chi phí mỗi khung.
- Số lượng điểm tối đa vẫn là 22, và sân vẫn là 2D dạng điểm (hiến pháp mục 1).

## 10. Quan hệ với spec 004 — AC nào giữ, AC nào thay

Spec 004 đã `Done` ngày 2026-11-18 với 37 AC. Spec này **không sửa ngược**
tài liệu ấy; dưới đây là quan hệ, và `/clarify` phải chốt dòng đầu tiên.

| AC của spec 004 | Spec này làm gì |
|---|---|
| AC-25.3 — "không điểm nào còn đang di chuyển dở khi tình huống kế tiếp tới" | **Thay thế hẳn, chốt ngày 2026-11-18.** "Luôn luôn di chuyển" trái đúng chữ với nó. Ý định thật của AC ấy là *không bị giật sang đích mới* — ý định đó spec này giữ nguyên và phát biểu lại ở AC-29.3 và AC-30.1. AC mới: "KHÔNG điểm nào bị **giật** khi tình huống kế tiếp tới" (AC-29.3, AC-30.1) |
| AC-25.1 — chuyển động theo đường cong mềm, không gấp khúc | **Giữ**, và đi xa hơn: không chỉ mềm về hướng mà còn liền về tốc độ (AC-30.1) |
| AC-25.2 — tại phút của tình huống, người tham gia có mặt đúng vùng | **Giữ nguyên, và nó là thứ chặn biên độ** của chuyển động chờ. Lớp dao động mới phải nằm riêng bên trên, không được nới lỏng bất biến "đúng mốc, không gần đúng" của lớp nội suy hiện có |
| AC-25.4, AC-25.5 — trận cũ đấu lại đúng kết quả; mọi con số không đổi | **Giữ** (AC-31.2), và đây là lý do non-goal "không đổi engine" là ràng buộc cứng |
| AC-25.6 — tôn trọng giảm chuyển động | **Giữ** (AC-31.1), và mở rộng sang cả chuyển động chờ |
| AC-25.7 + quyết định D88 — thể lực đổi dáng, không đổi thời lượng | **Mở lại, chốt ngày 2026-11-18** (AC-30.6): ở nhịp còn dư thời gian, người kiệt sức đi chậm thật và tới đích muộn hơn. D88 vẫn đúng ở những nhịp không dư, nên hai hành vi phải cùng tồn tại |
| AC-25.8 — kiệt sức vẫn có nhãn chữ | **Giữ** (AC-31.6) |
| AC-25.9 — hai ngân sách: chạy ngay < 3 giây, và khung vẽ gọn trong một nhịp | **Giữ cả hai** (AC-31.3, AC-31.4), siết thêm một chữ: phải đúng ở **mọi** mức tốc độ, kể cả mức chậm mới |

## 11. Nhật ký làm rõ

Toàn bộ 11 câu hỏi mở đã chốt ngày **2026-11-18**, qua ba lượt hỏi.

| # | Câu hỏi | Quyết định | Đi vào |
|---|---|---|---|
| 1 | Một phút trận dài bao nhiêu ở mức chậm nhất? | **1000ms** — trận 90 phút xem hết trong ~1,5 phút, mỗi cú di chuyển ~950ms. Một mức chậm, không phải hai | mục 6, AC-29.1 |
| 2 | Mức nào là mặc định khi mở trận? | **Mức chậm mới**. Mở trận ra là thấy ngay nhịp giống một trận đấu; ai chỉ cần tỉ số thì đã có "Chạy hết trận" | mục 6, AC-29.5 |
| 3 | Mức "Rất nhanh" (20ms) xử lý thế nào? | **Tắt hẳn nội suy ở mức ấy**, cho điểm nhảy thẳng tới mốc. Ở 18ms không có chuyển động nào đọc được, nên vẽ đường đi chỉ sinh ra cú giật | AC-29.4 |
| 4 | Có mở lại D88 (thể lực đổi dáng, không đổi thời lượng)? | **Mở lại.** Ở nhịp còn dư thời gian, người kiệt sức đi **chậm thật** và tới đích muộn hơn, nhưng vẫn trước tình huống kế tiếp. D88 vẫn đúng ở những nhịp không dư, nên **hai hành vi phải cùng tồn tại** | AC-30.6, mục 10 |
| 5 | Biên độ dao động lúc đứng chờ? | **Một nửa khoảng cách giữa hai cầu thủ đứng chung một vùng**, và co theo khung sân | mục 6, AC-28.2 |
| 6 | Cả khối đội hình có nghiêng theo bóng? | **Có, nhẹ** — khoảng một phần mười chiều dài sân, đủ thấy đội dồn lên hay lùi về mà sơ đồ vẫn nhận ra được | AC-30.4 |
| 7 | Bóng di chuyển thế nào so với người? | **Nhanh ~3 lần, đi đường thẳng** như một đường chuyền: mắt theo bóng trước, người theo sau | AC-30.2 |
| 8 | Tạm dừng thì dao động có dừng? | **Dừng hẳn.** Tạm dừng là đóng băng cả sân, để đọc được vị trí từng người trước khi thay người | AC-28.5, mục 5 |
| 9 | AC-25.3 của spec 004 xử lý thế nào? | **Thay thế hẳn** bằng "không điểm nào bị giật khi tình huống kế tiếp tới" — giữ ý định thật, bỏ cách diễn đạt đã lạc hậu. Spec 004 KHÔNG bị sửa ngược | mục 10, AC-29.3, AC-30.1 |
| 10 | "Đứng im quá lâu" là bao lâu? | **300ms** thời gian thực | mục 6, AC-28.1, AC-29.1 |
| 11 | Hàng ngang lệch bao nhiêu vẫn là ngang hàng? | **Một phần tư** khoảng cách giữa hai người trong hàng | AC-30.3 |

**Ghi chú về câu 2.** Đây là quyết định đổi trải nghiệm mặc định của cả ứng
dụng: xem một trận từ 18 giây thành ~1,5 phút. Nó đúng với yêu cầu "giống một
trận đấu thật nhất có thể", nhưng nếu sau khi xem thử thấy sốt ruột thì đây
là chỗ đầu tiên nên đổi lại — đổi mặc định rẻ hơn nhiều so với đổi mô hình
chuyển động.

**Ghi chú về câu 4.** Mở lại D88 nghĩa là lớp chuyển động phải có **hai chế độ
thể lực** tùy nhịp: đổi thời lượng khi nhịp có dư, đổi dáng khi không. Phép
kiểm đã chốt của D88 vì thế phải sửa chứ không bỏ: nó vẫn là lưới duy nhất
bắt được lỗi "kéo dài thời lượng ở nhịp không có dư", tức điểm còn bay dở khi
tình huống kế tiếp tới.
