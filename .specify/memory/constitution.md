# Constitution — Ứng dụng bóng đá: dựng đội, giả lập trận, và sự nghiệp một cầu thủ

> Hiến pháp kỹ thuật của dự án. Mọi spec / plan / task đều phải tuân thủ.
> Version: 3.0.1 · Ratified: 2026-10-26 · Last amended: 2026-11-16

## 1. Mục đích & phạm vi

Dự án là một ứng dụng web chạy trên máy cá nhân, cho một người dùng duy nhất. Nó có **hai vòng lặp chơi**, dùng chung một engine giả lập:

**Vòng lặp 1 — huấn luyện viên (đã có, spec 001–003).** Người dùng tự tạo các đội bóng tưởng tượng của riêng mình: nhập thông tin, ảnh và chỉ số từng cầu thủ, dựng sơ đồ chiến thuật với vai trò và chỉ thị, rồi cho hai đội đấu với nhau và xem trận đấu diễn ra. Giá trị cốt lõi không nằm ở việc sinh ra một tỉ số, mà ở việc **kết quả phải phản ánh được chiến thuật và chỉ số do người dùng nhập** — đủ tin cậy để người dùng đổi một chỉ thị, đấu lại, và học được điều gì đó.

**Vòng lặp 2 — sự nghiệp một cầu thủ (hướng mới, chốt ngày 2026-11-16).** Người dùng là **một cầu thủ**, không phải người cầm đội: mùa giải có lịch đấu và bảng xếp hạng, huấn luyện viên do máy điều khiển quyết định bạn đá chính, dự bị hay ngồi ngoài, và chỉ số của bạn phát triển theo tuổi và phong độ. Giá trị cốt lõi ở đây khác hẳn vòng lặp 1: không phải "chiến thuật của tôi có đúng không", mà **"tôi có được chọn không, và vì sao"**.

> **Đây là đổi hướng có ý thức, không phải mở rộng dần.** Ngày 2026-11-16, sau khi spec 003 đóng, người dùng chốt thêm vòng lặp 2. Hiến pháp ghi lại mốc này ở đây. Non-goals của spec 001 — một tài liệu đã `Done` — **KHÔNG bị sửa ngược**: sửa ngược là làm sai lệch hồ sơ của quyết định lúc đó. Spec đầu tiên của hướng mới MUST nêu rõ nó thay thế những non-goals ấy, và dẫn về mục này.

> **Trình tự: vòng lặp 1 xong đã, rồi mới tới vòng lặp 2.** Cùng ngày 2026-11-16, người dùng chốt thêm: hoàn thiện vòng lặp huấn luyện viên trước, sự nghiệp để sau. Vì vậy **spec 004 thuộc vòng lặp 1**, không phải sự nghiệp. Ba điểm cần xác nhận ở mục 7 chỉ chặn spec đầu tiên của vòng lặp 2, không chặn spec 004.
> *Lý do ghi lại:* một hiến pháp tuyên bố hướng mới mà spec kế tiếp lại làm hướng cũ là chỗ dễ khiến người đọc sau này tưởng dự án đi lạc. Nó không lạc — nó xếp hàng.

Dữ liệu người dùng bỏ công nhập là tài sản quý nhất của ứng dụng; mọi quyết định kỹ thuật phải đặt việc không làm mất dữ liệu lên trên sự tiện lợi khi lập trình.

**Không thuộc phạm vi (non-goals):**
- Backend, máy chủ, tài khoản, đăng nhập, đồng bộ nhiều máy, chơi nhiều người.
- Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm.
- Ngôn ngữ thứ ba ngoài tiếng Việt và tiếng Anh (xem P8).
- Bản cho điện thoại và máy tính bảng.
- **Dữ liệu bóng đá có thật đóng gói sẵn trong repo** — xem ràng buộc ở mục 3.

*Hai dòng non-goals đã được GỠ ngày 2026-11-16, vì chúng chính là hướng mới:* "chế độ career nhiều mùa, chuyển nhượng, tài chính, tập luyện, scout, phát triển cầu thủ theo tuổi" và "giải đấu: lịch thi đấu, bảng xếp hạng, thống kê cả mùa". Gỡ khỏi non-goals **không** có nghĩa là làm hết ngay: từng phần vào phạm vi qua từng spec, như mọi thứ khác.

## 2. Nguyên tắc bất di bất dịch (Principles)

### P1. Giả lập phải tái lập được
Engine giả lập MUST nhận toàn bộ tính ngẫu nhiên từ một nguồn được truyền vào qua tham số (mã trận). Engine MUST NOT gọi trực tiếp bất kỳ nguồn ngẫu nhiên hay nguồn thời gian toàn cục nào (`Math.random`, `Date.now`, `crypto.getRandomValues`, …). Cùng một bộ **(mã trận + hai đội + chiến thuật xuất phát hai bên + đội chủ nhà + chuỗi can thiệp giữa trận)** MUST cho ra kết quả và từng dòng sự kiện giống hệt nhau, ở mọi lần chạy và mọi máy. Mọi can thiệp giữa trận — thay người, đổi chỉ thị, đổi vai trò, kèm phút thực hiện — MUST được ghi lại thành một phần của trận đấu để có thể phát lại.
*Lý do:* đây là điều kiện để người dùng so sánh hai chiến thuật một cách công bằng (AC-8.11, AC-8.12). Không có nó, ứng dụng chỉ là máy sinh tỉ số và mọi lời khẳng định "chiến thuật này tốt hơn" đều vô nghĩa. Phần can thiệp giữa trận phải nằm trong định nghĩa này, vì AC-9.7 cho phép người dùng đổi chiến thuật ngay khi trận đang chạy — nếu không ghi lại thì trận đó không bao giờ phát lại đúng được.
Ở vòng lặp sự nghiệp, điều này MUST đúng ở **quy mô mùa giải**: một mùa MUST sinh ra từ một hạt giống của mùa ấy, và mã trận của từng trận trong mùa MUST dẫn xuất tất định từ hạt giống đó cộng vị trí của trận trong lịch. Mọi quyết định do máy đưa ra trong sự nghiệp — huấn luyện viên chọn ai đá chính, phong độ ngày thi đấu, chỉ số tăng giảm sau mùa — MUST lấy ngẫu nhiên từ cùng nguồn ấy. MUST NOT có một mùa giải nào chỉ phát lại đúng khi còn giữ kết quả đã lưu.
*Lý do mở rộng:* nếu mùa giải không tái lập được thì câu hỏi trung tâm của vòng lặp 2 — "vì sao tôi không được chọn" — không trả lời được, vì mỗi lần xem lại sẽ ra một câu trả lời khác.
*Câu hỏi review:* chạy lại cùng mã trận với cùng chuỗi can thiệp hai lần, diff dòng sự kiện — có khác nhau một ký tự nào không? Và: tạo lại một mùa giải từ cùng hạt giống — lịch đấu, bảng xếp hạng, danh sách đá chính từng vòng có giống hệt không?

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
Với vòng lặp sự nghiệp, "tự chạy được" MUST hiểu là **chơi hết được một mùa giải từ vòng 1 tới vòng cuối**, dù mùa ấy còn thiếu hợp đồng, chuyển nhượng hay chấn thương. MUST NOT bàn giao một lát cắt chỉ có lịch đấu mà chưa đá được, hay chỉ đá được mà chưa có bảng xếp hạng cuối mùa.
*Lý do:* người dùng đã chọn lộ trình chia giai đoạn chính vì muốn dùng thử và góp ý sớm; một bản bàn giao không chạy được thì không góp ý được. Riêng sự nghiệp còn một lý do nữa: câu hỏi đáng tiền nhất của hướng mới — *vòng lặp "được chọn hay bị gạt" có vui không* — chỉ trả lời được khi chơi trọn một mùa, nên lát cắt đầu tiên phải đủ để trả lời nó.
*Câu hỏi review:* mở ứng dụng, làm trọn luồng của giai đoạn — có chỗ nào cụt không? Với lát cắt sự nghiệp: chơi từ vòng 1 tới hết mùa có tới được màn tổng kết không?

### P7. Tệp sao lưu phải mở lại được sau khi ứng dụng lớn lên
Tệp xuất ra MUST mang số phiên bản dữ liệu. Khi một giai đoạn sau thêm trường mới, ứng dụng MUST vẫn nhập được tệp xuất từ phiên bản trước, điền giá trị mặc định hợp lý cho trường còn thiếu. MUST NOT yêu cầu người dùng nhập lại dữ liệu vì ứng dụng đã nâng cấp.
Điều này MUST còn đúng khi tệp mang **một sự nghiệp** chứ không chỉ vài đội: tệp sao lưu của một sự nghiệp nhiều mùa MUST xuất ra và nhập lại được trọn vẹn, và MUST NOT viện cớ "tệp quá lớn" để bỏ bớt phần nào của nó mà không nói với người dùng.
*Lý do:* người dùng sẽ nhập đội ở Giai đoạn 1 và còn dùng dữ liệu đó ở Giai đoạn 4. Với sự nghiệp, cái mất khi tệp không mở lại được còn lớn hơn nhiều: không phải vài giờ nhập liệu, mà toàn bộ câu chuyện đã chơi.
*Câu hỏi review:* lấy tệp xuất từ bản cũ, nhập vào bản mới — có vào được không? Xuất một sự nghiệp đã chơi vài mùa rồi nhập lại — bảng xếp hạng, số liệu từng mùa và lịch sử cầu thủ có nguyên vẹn không?

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

### P10. Sự nghiệp sinh ra hàng nghìn trận, và không được giữ tất cả như nhau
Một mùa giải 20 đội là 380 trận; một sự nghiệp 15 mùa là khoảng 5.700 trận — trong khi lịch sử hiện tại giữ **đúng 20 trận** kèm dòng sự kiện đầy đủ. Vòng lặp sự nghiệp MUST giữ **tóm tắt cho mọi trận** (ngày, hai đội, tỉ số, và nếu người chơi có mặt thì số liệu của riêng người chơi), và MUST giữ **dòng sự kiện đầy đủ chỉ cho những trận người chơi thật sự có mặt trên sân**. Trận người chơi không đá MUST NOT lưu dòng sự kiện.

Mọi giới hạn kiểu "giữ N trận gần nhất" MUST NOT âm thầm xoá dữ liệu của sự nghiệp đang chơi: hoặc giữ hết, hoặc nói rõ cái gì bị bỏ và vì sao, trước khi bỏ.
*Lý do:* đây là chỗ P3 (dữ liệu bất khả xâm phạm) và P7 (sao lưu mở lại được) va vào quy mô mới. Không có nguyên tắc này thì cách dễ nhất để vừa khít bộ nhớ là lặng lẽ cắt bớt — và thứ bị cắt chính là câu chuyện người dùng đã chơi. Con số đo được: engine chạy 200 trận trong 2,2 giây, nên **mô phỏng không phải nút thắt; lưu trữ mới là**.
*Câu hỏi review:* chơi xong một mùa, mở lưu trữ ra đếm — có bao nhiêu dòng sự kiện được lưu, và chúng có đúng là những trận người chơi có mặt không?

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
  - **Quy mô sự nghiệp:** một mùa 20 đội (380 trận) MUST mô phỏng xong trong < 30 giây, và một sự nghiệp 15 mùa MUST mở lại được mà không vượt ngân sách "mở ứng dụng < 2 giây" ở trên. Mốc tham chiếu đã đo: engine chạy **200 trận trong 2,2 giây**.
- **Dữ liệu đóng gói sẵn và bản quyền:**
  - Dữ liệu đi kèm repo — đội, cầu thủ, logo, giải đấu mẫu — MUST là **hư cấu hoặc tự sinh**. MUST NOT đóng gói tên câu lạc bộ, logo, hay tên cầu thủ có thật vào repo hoặc vào bản build.
  - Bối cảnh giải đấu có thật (ví dụ Premier League) chỉ vào ứng dụng qua **người dùng tự nhập** hoặc **người dùng tự nhập từ tệp của họ**. Đây vốn đã là cách ứng dụng hoạt động từ spec 001 — mọi cầu thủ do người dùng nhập — và hướng mới MUST NOT phá nó.
  - *Lý do:* P4 đã cấm gọi mạng nên không có đường lấy dữ liệu thật lúc chạy; phần còn lại là chuyện bản quyền. Dùng riêng trên máy mình thì người dùng muốn gõ tên gì là quyền của họ; đóng gói sẵn vào repo thì không.

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
| **3.0.0** | **2026-11-16** | **Đổi hướng dự án: thêm vòng lặp "sự nghiệp một cầu thủ" bên cạnh vòng lặp huấn luyện viên đã có. MAJOR vì gỡ hai non-goals nền tảng (career nhiều mùa; giải đấu, lịch thi đấu, bảng xếp hạng) và vì mục đích dự án đổi nghĩa. Kéo theo: P1 mở rộng sang quy mô mùa giải, P6 nói rõ "chạy được" nghĩa là chơi hết một mùa, P7 phủ tệp sao lưu một sự nghiệp, thêm **P10** về quy mô lưu trữ, thêm ràng buộc về dữ liệu đóng gói sẵn và bản quyền, thêm ngân sách hiệu năng cho mùa giải. Non-goals của spec 001 KHÔNG sửa ngược — xem mục 1** |
| 3.0.1 | 2026-11-16 | Ghi lại trình tự: hoàn thiện vòng lặp huấn luyện viên trước, sự nghiệp sau. Spec 004 thuộc vòng lặp 1; ba điểm cần xác nhận ở mục 7 chỉ chặn spec đầu tiên của vòng lặp 2. PATCH vì chỉ làm rõ, không đổi nguyên tắc nào |

## 7. Điểm cần xác nhận

Đổi hướng ngày 2026-11-16 mở ra ba điểm mới. Chúng **chỉ chặn spec đầu tiên của vòng lặp sự nghiệp**, không chặn spec 004 — spec 004 thuộc vòng lặp huấn luyện viên, xem mục 1:

- **[CẦN XÁC NHẬN: hai vòng lặp sống song song hay thay thế nhau?]** Hiến pháp này viết theo hướng **song song** — vòng lặp huấn luyện viên của spec 001–003 giữ nguyên, sự nghiệp là lối vào thứ hai. Nếu ý người dùng là sự nghiệp **thay thế** chế độ cũ thì câu chữ ở mục 1 phải đổi, và phần lớn giao diện hiện có sẽ thành mã chết.
- **[CẦN XÁC NHẬN: một sự nghiệp giữ tối đa bao nhiêu mùa?]** P10 nói cách giữ, nhưng không nói trần. Cần một con số để thiết kế lưu trữ: 15 mùa? 25 mùa? Hay không trần và chấp nhận tệp sao lưu lớn dần?
- **[CẦN XÁC NHẬN: có cho nhập đội/cầu thủ hàng loạt từ tệp của người dùng không?]** Ràng buộc bản quyền ở mục 3 nói dữ liệu thật chỉ vào qua đường người dùng tự nhập. Gõ tay 20 đội × 25 cầu thủ là hơn 500 lần nhập liệu. Nếu không có đường nhập hàng loạt thì bối cảnh Premier League trên thực tế là không dựng nổi — và "nút tạo ngẫu nhiên" đang chờ ở spec sau chỉ giải quyết được nửa vấn đề, vì nó sinh cầu thủ hư cấu chứ không phải cầu thủ người dùng muốn.

Hai điểm mở từ ngày 2026-10-26 đã chốt ngày **2026-10-29**:

- **Thư mục lâu dài của dự án**: `C:\Users\tungh\source\BongDaManager`, một repo git thật
  với nhánh `001-football-team-sim`. Lo ngại ban đầu — spec nằm trong thư mục tạm của
  phiên làm việc và mất khi phiên bị xoá — không còn đúng nữa.
- **Trình duyệt đích**: chỉ cần chạy đúng trên trình duyệt Chromium đời mới mà người
  dùng đang dùng. **Được phép** dùng tính năng mới mà không kiểm tương thích chéo, và
  **không** phải viết đường lùi cho Firefox hay Safari. Đây là lý do code được phép dựa
  thẳng vào `crypto.randomUUID`, `navigator.storage.persist`, `createImageBitmap` và
  `OffscreenCanvas` mà không rào trước.
