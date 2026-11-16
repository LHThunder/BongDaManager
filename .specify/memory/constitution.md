# Constitution — Ứng dụng tạo đội bóng & giả lập trận đấu

> Hiến pháp kỹ thuật của dự án. Mọi spec / plan / task đều phải tuân thủ.
> Version: 2.0.0 · Ratified: 2026-10-26 · Last amended: 2026-11-16

## 1. Mục đích & phạm vi

Dự án là một ứng dụng web chạy trên máy cá nhân, cho một người dùng duy nhất tự tạo ra các đội bóng tưởng tượng của riêng mình: nhập thông tin, ảnh và chỉ số từng cầu thủ, dựng sơ đồ chiến thuật với vai trò và chỉ thị, rồi cho hai đội đấu với nhau và xem trận đấu diễn ra. Giá trị cốt lõi không nằm ở việc sinh ra một tỉ số, mà ở việc **kết quả phải phản ánh được chiến thuật và chỉ số do người dùng nhập** — đủ tin cậy để người dùng đổi một chỉ thị, đấu lại, và học được điều gì đó. Dữ liệu người dùng bỏ công nhập là tài sản quý nhất của ứng dụng; mọi quyết định kỹ thuật phải đặt việc không làm mất dữ liệu lên trên sự tiện lợi khi lập trình.

**Không thuộc phạm vi (non-goals):**
- Chế độ career nhiều mùa, chuyển nhượng, tài chính, tập luyện, scout, phát triển cầu thủ theo tuổi.
- Giải đấu: lịch thi đấu, bảng xếp hạng, thống kê cả mùa.
- Backend, máy chủ, tài khoản, đăng nhập, đồng bộ nhiều máy, chơi nhiều người.
- Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm.
- Ngôn ngữ thứ ba ngoài tiếng Việt và tiếng Anh (xem P8).
- Bản cho điện thoại và máy tính bảng.

## 2. Nguyên tắc bất di bất dịch (Principles)

### P1. Giả lập phải tái lập được
Engine giả lập MUST nhận toàn bộ tính ngẫu nhiên từ một nguồn được truyền vào qua tham số (mã trận). Engine MUST NOT gọi trực tiếp bất kỳ nguồn ngẫu nhiên hay nguồn thời gian toàn cục nào (`Math.random`, `Date.now`, `crypto.getRandomValues`, …). Cùng một bộ **(mã trận + hai đội + chiến thuật xuất phát hai bên + đội chủ nhà + chuỗi can thiệp giữa trận)** MUST cho ra kết quả và từng dòng sự kiện giống hệt nhau, ở mọi lần chạy và mọi máy. Mọi can thiệp giữa trận — thay người, đổi chỉ thị, đổi vai trò, kèm phút thực hiện — MUST được ghi lại thành một phần của trận đấu để có thể phát lại.
*Lý do:* đây là điều kiện để người dùng so sánh hai chiến thuật một cách công bằng (AC-8.11, AC-8.12). Không có nó, ứng dụng chỉ là máy sinh tỉ số và mọi lời khẳng định "chiến thuật này tốt hơn" đều vô nghĩa. Phần can thiệp giữa trận phải nằm trong định nghĩa này, vì AC-9.7 cho phép người dùng đổi chiến thuật ngay khi trận đang chạy — nếu không ghi lại thì trận đó không bao giờ phát lại đúng được.
*Câu hỏi review:* chạy lại cùng mã trận với cùng chuỗi can thiệp hai lần, diff dòng sự kiện — có khác nhau một ký tự nào không?

### P2. Luật bóng đá tách khỏi giao diện
Toàn bộ logic bóng đá — tính chỉ số tổng theo vai trò, mức trừ khi xếp sai vị trí, tiêu hao thể lực, mô phỏng pha bóng, rút thẻ, chấm điểm cầu thủ — MUST nằm trong lớp engine không import bất cứ thứ gì từ React, DOM hay lớp lưu trữ. Component giao diện MUST NOT chứa công thức bóng đá.
*Lý do:* engine chỉ test được khi nó chạy được mà không cần dựng giao diện; và luật bóng đá phải sống sót qua mọi lần làm lại giao diện.
*Câu hỏi review:* có file nào trong engine import React hoặc chạm vào DOM không?

### P3. Dữ liệu người dùng là bất khả xâm phạm
Không một thao tác nào của ứng dụng được phép làm mất dữ liệu người dùng đã nhập. Việc nhập tệp sao lưu MUST mang tính tất cả-hoặc-không-gì: tệp lỗi MUST NOT để lại dữ liệu bị ghi đè một phần. Mọi hành động xoá dữ liệu MUST hỏi xác nhận có nêu rõ cái gì sẽ mất. Đường xuất dữ liệu ra tệp MUST luôn dùng được, kể cả khi ứng dụng đang có lỗi ở chỗ khác.
*Lý do:* một đội 25 cầu thủ là hàng giờ nhập liệu thủ công, và dữ liệu nằm trong trình duyệt nên vốn đã mong manh.
*Câu hỏi review:* có đường code nào ghi dữ liệu mà không có đường lùi khi ghi thất bại không?

### P4. Chạy offline, dữ liệu không ra khỏi máy
Ứng dụng lúc chạy MUST NOT thực hiện bất kỳ lời gọi mạng nào. Mọi tài nguyên (phông chữ, biểu tượng, thư viện) MUST được đóng gói cùng ứng dụng. MUST NOT có telemetry, thống kê sử dụng, hay báo lỗi gửi ra ngoài.
*Lý do:* ảnh chân dung và tên cầu thủ có thể là người thật mà người dùng biết; và ứng dụng phải dùng được khi không có mạng.
*Câu hỏi review:* mở tab Network, dùng hết mọi chức năng — có request nào đi ra không?

### P5. Mỗi AC dạng so sánh phải có một test chứng minh
Những acceptance criteria khẳng định "chiến thuật A khác chiến thuật B" hoặc "cùng mã trận ra cùng kết quả" (AC-8.3, AC-8.4, AC-8.5, AC-8.8, AC-8.11) MUST có test tự động tương ứng chạy đúng phép so sánh đó. MUST NOT đánh dấu các AC này là xong dựa trên việc xem bằng mắt.
*Lý do:* đây là những tuyên bố không thể kiểm bằng cách bấm thử, vì chúng nói về xu hướng qua nhiều lần chạy.
*Câu hỏi review:* với mỗi AC nêu trên, chỉ ra được tên test tương ứng không?

### P6. Mỗi giai đoạn bàn giao phải tự chạy được
Khi một giai đoạn được coi là xong, ứng dụng MUST chạy được và dùng thử được từ đầu đến cuối phạm vi giai đoạn đó. MUST NOT để lại màn hình trống, nút bấm không làm gì, hay chức năng chỉ hoạt động một nửa với lời hẹn "giai đoạn sau sẽ xong".
*Lý do:* người dùng đã chọn lộ trình chia giai đoạn chính vì muốn dùng thử và góp ý sớm; một bản bàn giao không chạy được thì không góp ý được.
*Câu hỏi review:* mở ứng dụng, làm trọn luồng của giai đoạn — có chỗ nào cụt không?

### P7. Tệp sao lưu phải mở lại được sau khi ứng dụng lớn lên
Tệp xuất ra MUST mang số phiên bản dữ liệu. Khi một giai đoạn sau thêm trường mới, ứng dụng MUST vẫn nhập được tệp xuất từ phiên bản trước, điền giá trị mặc định hợp lý cho trường còn thiếu. MUST NOT yêu cầu người dùng nhập lại dữ liệu vì ứng dụng đã nâng cấp.
*Lý do:* người dùng sẽ nhập đội ở Giai đoạn 1 và còn dùng dữ liệu đó ở Giai đoạn 4.
*Câu hỏi review:* lấy tệp xuất từ bản cũ, nhập vào bản mới — có vào được không?

### P8. Song ngữ Việt–Anh, và mỗi ngôn ngữ phải trọn vẹn
Ứng dụng MUST hỗ trợ đủ **hai** ngôn ngữ — tiếng Việt và tiếng Anh — chuyển qua lại bằng một thao tác của người dùng. Mọi chữ người dùng nhìn thấy MUST đi qua lớp tra cứu ngôn ngữ: tên chỉ số, tên vị trí, tên vai trò, tên chỉ thị, câu tường thuật, thông báo lỗi, nhãn nút, chữ trong ảnh SVG. MUST NOT viết thẳng một chuỗi hiển thị vào component, kể cả chuỗi "tạm để đó".

Một màn hình MUST NOT trộn hai ngôn ngữ. Thiếu bản dịch MUST lộ ra lúc phát triển và MUST NOT lặng lẽ rơi về ngôn ngữ kia — rơi về âm thầm là cách chắc chắn nhất để một nửa giao diện ở lại tiếng Việt mãi mãi mà không ai biết. Thêm một chuỗi hiển thị mới MUST kèm cả hai ngôn ngữ trong **cùng một commit**.

Câu tường thuật trận đấu MUST được **viết riêng** cho từng ngôn ngữ theo ngữ pháp của chính ngôn ngữ đó, MUST NOT dựng bằng cách ghép mảnh dùng chung: "A bị B phạm lỗi" và "B fouls A" đảo chủ–vị, nên mọi lối ghép mảnh đều sẽ cho ra câu sai ở ít nhất một thứ tiếng.

Nhãn hiển thị MUST NOT nằm trong `domain/`. Lớp `domain` chỉ giữ mã định danh; phần chữ thuộc về lớp ngôn ngữ.

Tên biến, tên file và mã định danh trong code không chịu ràng buộc này — chúng vẫn bằng tiếng Việt như từ đầu dự án.
*Lý do:* ngày 2026-11-16 người dùng đổi ý và muốn dùng được ứng dụng bằng cả hai thứ tiếng. Bản P8 cũ cấm luôn hạ tầng đa ngôn ngữ với lý lẽ "không có chỗ để sau này dịch" — và cái giá của lựa chọn đó bây giờ đã đo được: ~459 chuỗi tiếng Việt nằm rải trong 74 file sản phẩm, ~62 mẫu câu tường thuật, cộng 99 nhãn vị trí/vai trò/chỉ thị/chỉ số nằm ngay trong `domain/`. Đổi P8 là chấp nhận trả món nợ ấy một lần, bằng một đợt quét toàn bộ, thay vì để nó lớn thêm.
*Câu hỏi review:* đổi sang tiếng Anh rồi đi hết mọi màn hình — còn sót chữ tiếng Việt nào không? Đổi ngược lại — còn sót chữ tiếng Anh nào không? Và: có chuỗi hiển thị nào còn nằm trong `domain/` không?

### P9. Không bắt buộc phải dùng chuột, và chữ phải đọc được
Việc xếp và đổi chỗ cầu thủ trên sơ đồ MUST làm được hoàn toàn bằng bàn phím, không chỉ bằng kéo-thả. Tương phản giữa chữ và nền MUST đạt tối thiểu 4.5:1 ở mọi màn hình, kể cả khi nền dùng màu áo do người dùng tự chọn. Thông tin quan trọng — mức sai vị trí, tình trạng kiệt sức, thẻ — MUST NOT được truyền đạt chỉ bằng màu sắc.
*Lý do:* màu áo do người dùng chọn tuỳ ý nên tương phản không thể phó cho may mắn; và kéo-thả là cách duy nhất để xếp đội hình thì sẽ loại bỏ người không dùng được chuột.
*Câu hỏi review:* tắt chuột, xếp xong một đội hình 11 người — làm được không?

## 3. Ràng buộc kỹ thuật (Constraints)

- **Stack bắt buộc:** React + TypeScript + Vite · Tailwind CSS cho giao diện · dữ liệu lưu trong trình duyệt trên máy người dùng · không backend, không máy chủ, không cơ sở dữ liệu ngoài.
- **Kiến trúc:** luồng phụ thuộc một chiều `ui → hooks → services → lưu trữ` và `ui → engine`. Lớp `engine` là lớp trong cùng: nó MUST NOT phụ thuộc vào `ui`, `hooks`, `services` hay lớp lưu trữ. Không có phụ thuộc vòng giữa các lớp.
- **Không được dùng:**
  - Mọi lời gọi mạng lúc chạy (xem P4).
  - Nguồn ngẫu nhiên hoặc nguồn thời gian toàn cục bên trong `engine` (xem P1).
  - `any` trong TypeScript — dùng `unknown` rồi thu hẹp kiểu.
  - Backend, API, hay bất kỳ dịch vụ bên ngoài nào.
- **Thư viện ngoài:** được thêm thoải mái để đi nhanh, với hai điều kiện bắt buộc — thư viện MUST đóng gói được để chạy offline, và MUST được ghi vào `plan.md` của giai đoạn đang làm (tên + dùng để làm gì). Không có hạn mức số lượng.
- **Hiệu năng (ngân sách cứng, lấy từ spec 001 mục 6):**
  - Mở danh sách 25 cầu thủ: < 300ms.
  - Phản hồi kéo-thả trên sơ đồ: < 100ms.
  - Giả lập trọn một trận ở chế độ chạy ngay: < 3 giây, kể cả khi sân 2D đang bật.
  - Mở ứng dụng với 20 đội và 20 trận lịch sử: dùng được trong < 2 giây.
- **Bảo mật/dữ liệu:**
  - Toàn bộ dữ liệu và ảnh chỉ nằm trên máy người dùng; không gửi ra ngoài, không telemetry.
  - Ảnh chân dung sau xử lý ≤ 100KB; logo đội ≤ 50KB.
  - Hỗ trợ tối thiểu 20 đội × 30 cầu thủ + 20 trận lịch sử mà không vượt ngân sách hiệu năng trên.

## 4. Chuẩn chất lượng (Quality bar)

- **Test:** unit test là **bắt buộc** cho lớp `engine` và lớp đọc/ghi dữ liệu (bao gồm nhập/xuất tệp sao lưu). Một task thuộc hai lớp này chưa có test thì **chưa được coi là xong**. Test cho giao diện **không bắt buộc** — giao diện được xác nhận bằng cách người dùng bấm thử. Ngoài ra, các AC ở P5 phải có test riêng cho đúng phép so sánh.
- **Kiểu dữ liệu:** TypeScript ở chế độ `strict`. Cấm `any`. Mọi thực thể trong miền (đội, cầu thủ, chiến thuật, trận đấu, sự kiện) phải có kiểu khai báo tường minh, không suy ra từ dữ liệu mẫu.
- **Validation:** mọi dữ liệu đến từ bên ngoài bộ nhớ ứng dụng — tệp sao lưu người dùng nhập, dữ liệu đọc lại từ lưu trữ trình duyệt, tệp ảnh — MUST được kiểm tra hợp lệ trước khi đưa vào ứng dụng. Dữ liệu không hợp lệ bị từ chối kèm lý do, không được đi tiếp dưới dạng nửa vời.
- **Xử lý lỗi:** lỗi do người dùng gây ra (nhập sai, tệp hỏng, hết dung lượng) MUST hiện thông báo bằng **ngôn ngữ đang chọn**, nói rõ chuyện gì xảy ra và cần làm gì. MUST NOT im lặng bỏ qua một lỗi, và MUST NOT hiện thông báo kỹ thuật thô cho người dùng. Lỗi do lập trình sai thì phải lộ ra ngay khi phát triển, không được che.
- **Accessibility / i18n:** theo P9 (bàn phím, tương phản 4.5:1, không chỉ dựa vào màu) và P8 (song ngữ Việt–Anh, mọi chuỗi hiển thị đi qua lớp tra cứu, không nhãn hiển thị nào nằm trong `domain/`).
- **Git:** dự án dùng git. Mỗi task trong `tasks.md` hoàn thành là một commit, thông điệp commit nêu rõ task nào. Không commit khi ứng dụng không build được.

## 5. Quy trình (Workflow)

1. `/constitution` — lập/sửa hiến pháp (hiếm khi đổi)
2. `/specify` — viết **WHAT & WHY**, tuyệt đối không có HOW
3. `/clarify` — chốt các `[NEEDS CLARIFICATION]` trước khi lập plan
4. `/plan` — viết **HOW**: kiến trúc, data model, contracts
5. `/tasks` — chẻ nhỏ thành task có thể kiểm chứng
6. `/analyze` — soát chéo spec ↔ plan ↔ tasks ↔ constitution
7. `/implement` — thực thi theo tasks, không tự ý mở rộng phạm vi

**Cổng chặn (gates):**
- Không `/plan` khi spec còn `[NEEDS CLARIFICATION]`.
- Không `/implement` khi `/analyze` còn phát hiện CRITICAL.
- Code không có task tương ứng = scope creep → phải quay lại `/specify`.
- Không kết thúc một giai đoạn khi còn task engine hoặc task dữ liệu chưa có test (mục 4).
- Không kết thúc một giai đoạn khi ứng dụng chưa chạy trọn luồng của giai đoạn đó (P6).

**Riêng dự án này:** spec 001 phủ cả 4 giai đoạn, nên `/plan` và `/tasks` chạy riêng cho từng giai đoạn, mỗi lần chỉ lấy phạm vi các user story của giai đoạn đó.

## 6. Quản trị (Governance)

- Sửa hiến pháp phải bump version (semver: MAJOR = bỏ/đổi nguyên tắc, MINOR = thêm nguyên tắc, PATCH = làm rõ câu chữ).
- Khi hiến pháp đổi, rà lại các spec đang mở còn hiệu lực không.
- Khi conflict: Constitution > Spec > Plan > Tasks > code hiện có.

**Lịch sử sửa đổi:**

| Version | Ngày | Đổi gì |
|---|---|---|
| 1.0.0 | 2026-10-26 | Lập hiến pháp |
| 1.0.1 | 2026-10-29 | Chốt hai điểm cần xác nhận ở mục 7 |
| **2.0.0** | **2026-11-16** | **P8 đổi từ "chỉ tiếng Việt, cấm hạ tầng đa ngôn ngữ" sang "song ngữ Việt–Anh". MAJOR vì đổi nghĩa một nguyên tắc. Kéo theo: bỏ "đa ngôn ngữ" khỏi non-goals, sửa mục xử lý lỗi và mục i18n ở Chuẩn chất lượng** |

## 7. Điểm cần xác nhận

Không còn điểm nào. Hai điểm mở từ ngày 2026-10-26 đã chốt ngày **2026-10-29**:

- **Thư mục lâu dài của dự án**: `C:\Users\tungh\source\BongDaManager`, một repo git thật
  với nhánh `001-football-team-sim`. Lo ngại ban đầu — spec nằm trong thư mục tạm của
  phiên làm việc và mất khi phiên bị xoá — không còn đúng nữa.
- **Trình duyệt đích**: chỉ cần chạy đúng trên trình duyệt Chromium đời mới mà người
  dùng đang dùng. **Được phép** dùng tính năng mới mà không kiểm tương thích chéo, và
  **không** phải viết đường lùi cho Firefox hay Safari. Đây là lý do code được phép dựa
  thẳng vào `crypto.randomUUID`, `navigator.storage.persist`, `createImageBitmap` và
  `OffscreenCanvas` mà không rào trước.
