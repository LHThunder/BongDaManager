# Tasks: Giai đoạn 1 — Tạo đội, cầu thủ, ảnh và lưu trữ

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | Giai đoạn 1 — 36 AC (AC-1.1→1.7, AC-2.1→2.11 gồm AC-2.1b, AC-3.1→3.8, AC-4.1→4.9): 31 làm trọn + 5 làm một phần |
| **Tiến độ** | 34/35 |
| **Sửa đổi** | 2026-10-26 — sửa theo kết quả `/analyze` |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Các phase dưới đây là 5 lát cắt dọc ở `plan.md` mục 9, cộng một phase kiểm thử cuối. Mỗi phase từ Phase 1 trở đi kết thúc là một ứng dụng chạy được và dùng thử được (hiến pháp P6), và là một commit.

---

## Phase 0 — Lát 0: Bộ khung chạy được

- [x] **T001** — Khởi tạo project Vite + React + TypeScript `strict` + Tailwind + Vitest
  - File: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
  - Xong khi: `npm run dev` mở ra trang có tiêu đề tiếng Việt; `npm run test` chạy được và báo 0 test; `npx tsc --noEmit` không lỗi. `tsconfig.json` bật `strict` và `noImplicitAny`. Không có thẻ `<link>` nào trỏ ra ngoài máy (hiến pháp P4).
  - Phụ thuộc: —

- [x] **T002** [P] — Khởi tạo git và commit đầu tiên
  - File: `.gitignore`
  - Xong khi: `git log --oneline` có đúng 1 commit; `git status` sạch; `node_modules` và `dist` không bị theo dõi.
  - Phụ thuộc: T001

- [x] **T003** — Khai báo kiểu miền
  - File: `src/domain/types.ts`
  - Xong khi: `npx tsc --noEmit` sạch; file khai báo `Team`, `Player`, `PositionId`, `AttributeId`, `GkAttributeId`, `Rng`, `PreferredFoot` và không `import` bất cứ thứ gì.
  - Phụ thuộc: T001

- [x] **T004** — Bảng 12 vị trí
  - File: `src/domain/positions.ts`, `src/domain/positions.test.ts`
  - Xong khi: test xanh và khẳng định đúng 12 vị trí, mỗi vị trí có tên tiếng Việt, thuộc đúng một tuyến (thủ môn / phòng ngự / tiền vệ / tấn công) và có bên xác định (trái / giữa / phải); **có hàm thuần kiểm tra tổ hợp vị trí hợp lệ**, test khẳng định nó nhận một hay nhiều vị trí sân, nhận Thủ môn đứng một mình, và từ chối mọi tổ hợp có Thủ môn kèm vị trí khác (AC-2.1b).
  - AC: AC-2.1, AC-2.1b
  - Phụ thuộc: T003

- [x] **T005** — Bảng chỉ số và trọng số theo vị trí
  - File: `src/domain/attributes.ts`, `src/domain/attributes.test.ts`
  - Xong khi: test xanh và khẳng định đúng 15 chỉ số chung, đúng 3 chỉ số thủ môn, mỗi chỉ số có tên tiếng Việt và thuộc một trong 4 nhóm; mọi vị trí trong `POSITIONS` đều có bộ trọng số (không vị trí nào bị bỏ sót).
  - AC: AC-2.2
  - Phụ thuộc: T004
  - Ghi chú: đây là bảng dùng chung cho cả chỉ số tổng và sinh nhanh chỉ số (quyết định D10 trong plan). Đặt sai bảng này là rủi ro R5.

- [x] **T006** [P] — Mở IndexedDB với 4 store và khung migration
  - File: `src/storage/db.ts`, `src/storage/migrations.ts`, `src/storage/db.test.ts`
  - Xong khi: test trên `fake-indexeddb` xanh — mở được database `bongda`, có đúng 4 store (`meta`, `teams`, `players`, `images`), có index `byTeam` và `byTeamAndShirt` trên `players`, đọc `meta.schemaVersion` ra `1`; mảng migration rỗng chạy không lỗi; tệp có `schemaVersion` lớn hơn 1 bị từ chối.
  - AC: AC-4.2
  - Phụ thuộc: T003

- [x] **T007** — Test cấu trúc chặn `domain` phụ thuộc ra ngoài
  - File: `src/domain/boundaries.test.ts`
  - Xong khi: test xanh với code hiện tại, và **fail** khi cố thêm một dòng `import` từ `react`, `react-dom`, `../services` hay `../storage` vào bất kỳ file nào trong `src/domain/` (tự thử một lần rồi hoàn tác để xác nhận test thật sự bắt được). Test cũng chặn `src/services/` import từ `../hooks`, `../store` hay `../ui` — đây là luật thứ hai mà `plan.md` mục 3 phát biểu.
  - Phụ thuộc: T004, T005

---

## Phase 1 — Lát 1: Quản lý đội

Kết thúc phase: tạo được đội, đổi tên, xoá có xác nhận, cảnh báo trùng tên, đóng mở lại vẫn còn dữ liệu.

- [x] **T008** [P] — Lớp lỗi có mã
  - File: `src/services/errors.ts`
  - Xong khi: `npx tsc --noEmit` sạch; có đủ các mã lỗi mà `plan.md` mục 5 liệt kê (`EmptyName`, `NotFound`, `DuplicateShirtNumber`, `InvalidAttributeValue`, `NotAnImage`, `DecodeFailed`, `NotJson`, `SchemaInvalid`, `VersionTooNew`, `QuotaExceeded`, `StorageUnavailable`, `InvalidColor`); không file nào trong `src/services/` chứa chuỗi tiếng Việt hiển thị.
  - Phụ thuộc: T001

- [x] **T009** — `teamRepo`
  - File: `src/services/teamRepo.ts`, `src/services/teamRepo.test.ts`
  - Xong khi: test trên `fake-indexeddb` xanh cho `list` / `create` / `rename` / `remove` / `get` / `findByName`; `list()` trả kèm số cầu thủ mà không đọc ảnh; `remove()` trả số cầu thủ đã xoá và sau khi xoá thì không còn cầu thủ hay ảnh nào mồ côi thuộc đội đó; tên rỗng bị ném `EmptyName`.
  - AC: AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.7
  - Phụ thuộc: T006, T008

- [x] **T010** — Store trạng thái và hook đội
  - File: `src/store/appStore.ts`, `src/hooks/useTeams.ts`
  - Xong khi: `npx tsc --noEmit` sạch; **test xanh** cho `appStore` — nạp danh sách đội vào store rồi gọi hành động đổi tên thì giá trị đọc ra từ store là tên mới, và không có bản sao tên đội nào khác trong store để lệch.
  - AC: AC-1.5
  - Phụ thuộc: T009

- [x] **T011** [P] — Tập trung chuỗi hiển thị tiếng Việt
  - File: `src/ui/strings.ts`
  - Xong khi: file chứa nhãn giao diện và hàm dịch mã lỗi của T008 sang câu tiếng Việt nói rõ cần làm gì; sau phase này `grep` các component không còn chuỗi hiển thị viết trực tiếp (hiến pháp P8).
  - Phụ thuộc: T008

- [x] **T012** — Trang danh sách đội, trang đội tối thiểu và điều hướng
  - File: `src/ui/pages/DanhSachDoi.tsx`, `src/ui/pages/TrangDoi.tsx`, `src/App.tsx`
  - Xong khi: mở ứng dụng khi chưa có đội thì thấy trạng thái trống kèm nút tạo đội đầu tiên; khi đã có đội thì thấy danh sách gồm tên, chỗ dành cho logo và số cầu thủ của từng đội; bấm vào một đội thì sang trang đội hiện tên đội và có đường về danh sách.
  - AC: AC-1.1, AC-1.2, AC-1.4
  - Phụ thuộc: T010, T011
  - Ghi chú: trang đội ở task này chỉ là khung tối thiểu, đủ để AC-1.2 ("đưa người dùng vào trang quản lý đội vừa tạo") thoả được ngay trong Phase 1. Danh sách cầu thủ được T023 bổ sung vào chính file này.

- [x] **T013** — Form tạo và đổi tên đội
  - File: `src/ui/components/FormDoi.tsx`
  - Xong khi: tạo đội với tên hợp lệ thì vào ngay trang đội vừa tạo; để trống tên thì bị chặn và lỗi hiện tại trường tên; tạo trùng tên đội đã có thì hiện cảnh báo nhưng vẫn tạo được nếu xác nhận; đổi tên thì tên mới xuất hiện ở danh sách đội.
  - AC: AC-1.2, AC-1.3, AC-1.5, AC-1.7
  - Phụ thuộc: T012

- [x] **T014** — Hộp xác nhận và xoá đội
  - File: `src/ui/components/HopXacNhan.tsx`, sửa `src/ui/pages/DanhSachDoi.tsx`
  - Xong khi: bấm xoá một đội thì hộp xác nhận hiện đúng tên đội và đúng số cầu thủ sẽ mất; bấm huỷ thì không mất gì; bấm xác nhận thì đội biến khỏi danh sách và không quay lại sau khi tải lại trang.
  - AC: AC-1.6
  - Phụ thuộc: T013

- [x] **T015** — Tự lưu và xin quyền lưu trữ bền
  - File: `src/storage/db.ts` (bổ sung), `src/hooks/useTeams.ts` (bổ sung), `src/storage/db.test.ts` (bổ sung)
  - Xong khi: **test xanh trên `fake-indexeddb`** — mỗi hành động rời rạc ghi xuống lưu trữ ngay trong cùng lượt gọi, và chuỗi thay đổi liên tiếp được gom lại rồi vẫn ghi đủ không mất bản ghi nào; **kiểm tay**: không có nút Lưu nào trên giao diện, tạo đội rồi tải lại trang thì đội còn đó, tắt hẳn trình duyệt rồi mở lại thì đội vẫn còn, lần mở đầu tiên có gọi xin quyền lưu trữ bền và khi quyền bị từ chối thì thấy lời nhắc xuất tệp sao lưu.
  - AC: AC-4.1, AC-4.2, AC-4.9
  - Phụ thuộc: T014
  - Ghi chú: phần ghi xuyên thẳng **bắt buộc có test** vì nó nằm ở `src/storage/` (hiến pháp mục 4). Riêng việc xin quyền lưu trữ bền là một lời gọi của trình duyệt không mô phỏng được, nên được phép chỉ kiểm tay — đây là ngoại lệ duy nhất của quy ước đó trong Giai đoạn 1.

---

## Phase 2 — Lát 2: Cầu thủ và chỉ số

Kết thúc phase: nhập được trọn một đội 18 cầu thủ, có sinh nhanh chỉ số, có nhãn chưa hoàn tất, có chỉ số tổng theo vị trí. Đây là lát mang lại giá trị lớn nhất của Giai đoạn 1.

- [x] **T016** [P] — Danh sách chỉ số bắt buộc và kiểm tra hồ sơ hoàn tất
  - File: `src/domain/completeness.ts`, `src/domain/completeness.test.ts`
  - Xong khi: test xanh — cầu thủ sân cần đúng 15 chỉ số; thủ môn cần đúng 8 chỉ số chung đã nêu trong AC-2.3 cộng 3 chỉ số riêng; **tổ hợp "thủ môn kiêm vị trí sân" bị hàm kiểm tra tổ hợp vị trí từ chối ngay, nên không tồn tại trường hợp thứ ba** (AC-2.1b); chỉ số có giá trị thấp không bị coi là thiếu; trả về đúng danh sách chỉ số còn thiếu.
  - AC: AC-2.1b, AC-2.3, AC-2.10
  - Phụ thuộc: T004, T005

- [x] **T017** [P] — Chỉ số tổng theo vị trí
  - File: `src/domain/rating.ts`, `src/domain/rating.test.ts`
  - Xong khi: test xanh — cùng một cầu thủ tính ở hai vị trí khác nhau cho ra hai con số khác nhau; một trung vệ chỉ số cao không bị chấm cao khi tính ở vị trí tiền đạo; hồ sơ còn thiếu chỉ số thì hàm nêu rõ chưa tính được chứ không trả số sai.
  - AC: AC-2.11
  - Phụ thuộc: T005

- [x] **T018** — Sinh nhanh chỉ số theo mức và vị trí
  - File: `src/domain/generator.ts`, `src/domain/generator.test.ts`
  - Xong khi: test xanh — với cùng một nguồn ngẫu nhiên giả thì hai lần gọi cho ra kết quả giống hệt (hiến pháp P1); hàm không chứa `Math.random`; chỉ số quan trọng của vị trí cao hơn rõ rệt chỉ số không liên quan; 4 mức Ngôi sao / Khá / Trung bình / Yếu xếp theo đúng thứ tự khi so chỉ số tổng; mọi giá trị nằm trong 1–20.
  - AC: AC-2.9
  - Phụ thuộc: T005, T017

- [x] **T019** — `playerRepo`
  - File: `src/services/playerRepo.ts`, `src/services/playerRepo.test.ts`
  - Xong khi: test trên `fake-indexeddb` xanh — `listByTeam` / `save` / `remove`; lưu cầu thủ có số áo đã dùng trong cùng đội thì ném `DuplicateShirtNumber`; cùng số áo ở hai đội khác nhau thì được phép; chỉ số ngoài 1–20 hoặc không phải số thì ném `InvalidAttributeValue`; chỉ số để trống thì vẫn lưu được; **lưu cầu thủ có tổ hợp vị trí không hợp lệ (thủ môn kiêm vị trí sân) thì bị từ chối** dù giao diện đã chặn trước — dữ liệu không bao giờ lưu được tổ hợp sai (AC-2.1b).
  - AC: AC-2.1b, AC-2.4, AC-2.5, AC-2.10
  - Phụ thuộc: T006, T008

- [x] **T020** — Hook cầu thủ
  - File: `src/hooks/usePlayers.ts`, sửa `src/store/appStore.ts`
  - Xong khi: `npx tsc --noEmit` sạch; sửa hoặc xoá một cầu thủ thì danh sách cầu thủ của đội cập nhật ngay mà không cần tải lại trang.
  - AC: AC-2.7
  - Phụ thuộc: T019, T010

- [x] **T021** — Bảng nhập chỉ số
  - File: `src/ui/components/BangChiSo.tsx`
  - Xong khi: bảng dựng đúng theo danh sách chỉ số mà `requiredAttributes` trả về — cầu thủ thường thấy 15 ô chia 4 nhóm, cầu thủ thủ môn thấy 8 ô chung cộng 3 ô riêng và **không** thấy các chỉ số chung còn lại; nhập 0, 21 hay chữ thì giá trị bị bỏ và ô giữ lại giá trị hợp lệ cũ; đi hết bảng được bằng Tab mà không cần chuột.
  - AC: AC-2.2, AC-2.3, AC-2.4
  - Phụ thuộc: T016, T011

- [x] **T022** — Form hồ sơ cầu thủ
  - File: `src/ui/components/FormCauThu.tsx`
  - Xong khi: nhập được tên, số áo, tuổi, chân thuận và chọn được nhiều vị trí sở trường trong 12 vị trí; **chọn Thủ môn thì mọi vị trí sân bị vô hiệu hoá và ngược lại, kèm câu giải thích ngắn tại chỗ**; đổi một cầu thủ sân đã nhập chỉ số sang thủ môn thì có hộp xác nhận nêu rõ bộ chỉ số sẽ đổi; trùng số áo trong đội thì bị chặn kèm thông báo; bấm sinh nhanh chỉ số và chọn một trong 4 mức thì bảng chỉ số được điền sẵn và vẫn sửa được từng ô; hồ sơ thiếu chỉ số thì hiện nhãn "chưa hoàn tất" kèm số chỉ số còn thiếu nhưng vẫn lưu được; hiện chỉ số tổng theo vị trí đang chọn và con số đó đổi khi chọn vị trí khác.
  - AC: AC-2.1, AC-2.1b, AC-2.5, AC-2.6, AC-2.9, AC-2.10, AC-2.11
  - Phụ thuộc: T020, T021, T017, T018
  - Ghi chú: nếu bước này cho thấy việc nhập 18 cầu thủ quá mệt (rủi ro R3), dừng lại báo người dùng trước khi đi sang Phase 3.

- [x] **T023** — Bổ sung danh sách cầu thủ vào trang đội
  - File: sửa `src/ui/pages/TrangDoi.tsx` (đã có khung từ T012)
  - Xong khi: thấy danh sách cầu thủ của đội; sắp xếp được theo tên, số áo, tuổi và vị trí; xoá một cầu thủ thì cầu thủ đó biến khỏi danh sách ngay và không quay lại sau khi tải lại trang; hồ sơ chưa hoàn tất được đánh dấu nhìn thấy được trong danh sách.
  - AC: AC-2.7, AC-2.8
  - Phụ thuộc: T022
  - Ghi chú: phần "ô đội hình thành trống" của AC-2.7 cần sơ đồ, nên thuộc Giai đoạn 2. Task này chỉ làm phần dữ liệu cầu thủ biến mất sạch.

---

## Phase 3 — Lát 3: Hình ảnh và nhận diện đội

Kết thúc phase: đội có logo và màu áo, cầu thủ có ảnh chân dung đã cắt, chưa có ảnh thì hiện hình chữ cái đầu, chữ luôn đọc được trên mọi màu áo.

- [x] **T024** [P] — Luật màu: tương phản và trùng màu áo
  - File: `src/domain/colors.ts`, `src/domain/colors.test.ts`
  - Xong khi: test xanh — `contrastingTextColor` trả màu chữ đạt tối thiểu 4.5:1 theo công thức WCAG, kiểm bằng các mốc màu cụ thể gồm vàng nhạt và xám trung tính; màu không hợp lệ thì ném `InvalidColor`; `kitsClash` phân biệt đúng ba trường hợp hai màu giống hệt, hai màu gần nhau và hai màu xa nhau.
  - AC: AC-3.7, AC-3.8
  - Phụ thuộc: T003

- [x] **T025** — Xử lý ảnh: cắt, thu nhỏ và nén
  - File: `src/services/imageService.ts`, `src/services/imageService.test.ts`
  - Xong khi: test xanh — `preparePortrait` trả về `Blob` vuông không quá 100KB, `prepareLogo` không quá 50KB, kể cả với ảnh đầu vào rất lớn; tệp không phải ảnh thì ném `NotAnImage`; ảnh hỏng không giải mã được thì ném `DecodeFailed`; không dùng thư viện nén nào ngoài `canvas` của trình duyệt.
  - AC: AC-3.2, AC-3.3
  - Phụ thuộc: T008

- [x] **T026** — Khung chọn vùng cắt ảnh chân dung
  - File: `src/ui/components/ChonAnh.tsx`
  - Xong khi: chọn một tệp ảnh thì hiện khung cắt vuông kéo và zoom được; xác nhận thì ảnh đã cắt hiện trong hồ sơ cầu thủ và còn đó sau khi tải lại trang; chọn tệp không phải ảnh thì hiện thông báo tiếng Việt rõ ràng và ảnh cũ giữ nguyên; thử với ảnh dọc, ảnh ngang và ảnh vuông.
  - AC: AC-3.1, AC-3.3
  - Phụ thuộc: T025, T022

- [x] **T027** [P] — Hình thay thế khi chưa có ảnh
  - File: `src/ui/components/AnhThayThe.tsx`
  - Xong khi: cầu thủ chưa có ảnh thì hiện hình tròn gồm chữ cái đầu của tên trên nền màu áo chính của đội, màu chữ lấy từ `contrastingTextColor`; đội chưa có logo cũng dùng cùng cơ chế này ở danh sách đội.
  - AC: AC-3.4
  - Phụ thuộc: T024
  
- [x] **T028** — Logo đội và màu áo
  - File: `src/ui/components/ChonMauAo.tsx`, sửa `src/ui/components/FormDoi.tsx`, sửa `src/ui/pages/DanhSachDoi.tsx`
  - Xong khi: gắn được logo cho đội và logo hiện ở danh sách đội lẫn trang đội; chọn được màu áo chính và màu áo phụ, màu chính được dùng nhuộm các thành phần nhận diện của đội; chọn màu trùng với đội đã có thì hiện cảnh báo trùng màu áo; mọi chữ trên nền màu áo vẫn đọc được với các màu khó ở T024.
  - AC: AC-3.5, AC-3.6, AC-3.7, AC-3.8
  - Phụ thuộc: T027, T025
  - Ghi chú: phần tự đổi sang áo phụ trong trận thuộc Giai đoạn 3; task này chỉ cảnh báo lúc chọn màu, dùng chung hàm `kitsClash`.

---

## Phase 4 — Lát 4: Sao lưu và phục hồi

Kết thúc phase: xuất ra tệp, nhập lại trên máy khác ra đúng dữ liệu kể cả ảnh, tệp hỏng bị từ chối mà không làm mất gì, lưu trữ đầy thì được cảnh báo. Giai đoạn 1 hoàn tất.

- [x] **T029** — Xuất toàn bộ dữ liệu thành một tệp
  - File: `src/services/backupService.ts`, `src/services/backupService.test.ts`
  - Xong khi: test xanh — `exportAll` trả một `Blob` JSON chứa `schemaVersion`, toàn bộ đội, cầu thủ và ảnh dạng base64, kèm kích thước ước tính; hàm đọc trực tiếp từ lưu trữ, không đi qua store giao diện (hiến pháp P3).
  - AC: AC-4.3, AC-4.8
  - Phụ thuộc: T019, T009

- [x] **T030** — Kiểm tra và nhập tệp theo nguyên tắc tất-cả-hoặc-không-gì
  - File: `src/services/backupSchema.ts`, `src/services/backupService.ts` (bổ sung), `src/services/backupService.test.ts` (bổ sung)
  - Xong khi: test xanh — xuất rồi nhập lại cho ra dữ liệu bằng chính nó kể cả ảnh; `inspect` trả số đội, số cầu thủ, số ảnh và `schemaVersion` của tệp; **tệp có lỗi ở bản ghi cuối thì dữ liệu cũ còn nguyên vẹn 100% và không có đội nào của tệp mới lọt vào**; tệp không phải JSON ném `NotJson`; sai schema ném `SchemaInvalid` kèm đường dẫn tới trường sai; `schemaVersion` lớn hơn bản ứng dụng ném `VersionTooNew`; chế độ gộp mà trùng tên đội thì giữ cả hai; dữ liệu phiên bản cũ giả lập chạy qua chuỗi migration ra đúng hình dạng hiện tại.
  - AC: AC-4.4, AC-4.5, AC-4.6
  - Phụ thuộc: T029

- [x] **T031** — Xử lý lưu trữ đầy ở một chỗ duy nhất
  - File: `src/hooks/useBackup.ts`, sửa `src/store/appStore.ts`
  - Xong khi: test xanh với lưu trữ giả lập đã đầy — `QuotaExceeded` được ném ra chứ không bị âm thầm bỏ qua; trên giao diện, khi gặp lỗi này thì hiện cảnh báo rằng thay đổi chưa được lưu kèm gợi ý xuất dữ liệu ra tệp, và cảnh báo đó đến từ một chỗ xử lý tập trung chứ không rải ở từng form.
  - AC: AC-4.7
  - Phụ thuộc: T030
  
- [x] **T032** — Giao diện sao lưu và phục hồi
  - File: `src/ui/components/SaoLuu.tsx`, sửa `src/ui/pages/DanhSachDoi.tsx`
  - Xong khi: bấm xuất thì tải về một tệp và kích thước ước tính được hiện trước khi xuất; bấm nhập và chọn tệp thì thấy số đội, số cầu thủ trong tệp rồi mới được hỏi thay thế toàn bộ hay gộp thêm, chưa chọn thì chưa có gì thay đổi; nhập một tệp đã sửa cho hỏng thì bị từ chối kèm lý do và dữ liệu đang có không đổi.
  - AC: AC-4.3, AC-4.5, AC-4.6, AC-4.8
  - Phụ thuộc: T031, T011

---

## Phase 5 — Kiểm thử và hoàn thiện

- [x] **T033** — Chạy qua toàn bộ 36 AC của Giai đoạn 1 và đánh dấu từng mục
  - File: `specs/001-football-team-sim/spec.md` (tick các ô AC trong phạm vi)
  - Xong khi: 31 AC làm trọn được tự tay kiểm trên ứng dụng đang chạy và tick; 5 AC vắt giai đoạn (AC-1.5, AC-2.7, AC-3.5, AC-3.7, AC-4.2) thì ghi rõ phần nào đã xong, **không** tick trọn.
  - Phụ thuộc: T032

- [x] **T034** — Kiểm các trường hợp biên ở spec mục 5 thuộc phạm vi Giai đoạn 1
  - File: — (chỉ kiểm thủ công, ghi kết quả vào mô tả commit)
  - Xong khi: đã thử và thấy đúng hành vi mong đợi cho: chưa có đội nào; chỉ số để trống; nhập chỉ số ngoài 1–20; số áo trùng; hai cầu thủ cùng tên trong một đội; tệp ảnh không phải ảnh; ảnh quá lớn; màu áo hai đội quá giống nhau; màu áo khiến chữ khó đọc; tệp sao lưu hỏng; nhập tệp khi đã có dữ liệu; nhập gộp trùng tên đội; lưu trữ đầy; xoá cầu thủ; xoá đội.
  - Phụ thuộc: T033

- [ ] **T035** — Kiểm ngân sách phi chức năng — **CHƯA XONG, xem ghi chú**
  - File: — (chỉ đo, ghi số đo vào mô tả commit)
  - **Đã đo được (2026-10-27, bộ dữ liệu 20 đội × 30 cầu thủ, 620 ảnh, 32MB):**
    mở database nguội 15ms · `teamRepo.list()` 20 đội 14ms · `playerRepo.listByTeam()`
    30 cầu thủ 1ms · `uocTinhKichThuoc()` 69ms · `getAll` 620 ảnh 38ms ·
    đọc+kiểm tệp 43,5MB 178ms · nhập tệp 43,5MB 734ms · P4: 0 request ra ngoài ·
    bàn phím: 26 phần tử focus được trong form cầu thủ, không `tabindex` nào gài bẫy.
  - **KHÔNG đo được:** hai ngân sách về thời gian hiển thị — "danh sách 30 cầu thủ
    dưới 300ms" và "mở ứng dụng dưới 2 giây". Khung Browser của môi trường này tiêm
    script với độ trễ dao động từ 356ms tới 27,8s, nên mọi phép đo bắc qua ranh giới
    "trang tải xong → script đo chạy" đều vô giá trị; và pane không ghi `paint`/LCP
    để lấy số liệu do trình duyệt tự đo. Tầng dữ liệu đo được đều dưới 70ms nên
    không có dấu hiệu vượt ngân sách, nhưng đó là suy luận, không phải phép đo.
  - **Cần làm để đóng task:** mở `npm run dev` trong trình duyệt thật của bạn và đọc
    thời gian trong tab Performance, hoặc thêm `performance.mark` vào `main.tsx` rồi
    đọc lại — cả hai đều không phụ thuộc vào độ trễ tiêm script.
  - Xong khi: dựng được bộ dữ liệu đúng mốc spec mục 6 — **20 đội, mỗi đội 30 cầu thủ, mỗi cầu thủ có ảnh** (dùng chức năng nhập tệp sao lưu với dữ liệu sinh sẵn, không nhập tay 600 cầu thủ) — rồi đo và ghi lại: danh sách 30 cầu thủ của một đội hiện đầy đủ dưới 300ms; mở ứng dụng với toàn bộ bộ dữ liệu đó dưới 2 giây; xuất tệp xong và nhập lại được, kèm kích thước tệp thực tế để đối chiếu rủi ro R1; đi hết form cầu thủ và bảng chỉ số chỉ bằng bàn phím; mở tab mạng của trình duyệt, dùng hết mọi chức năng và xác nhận **không có request nào đi ra** (hiến pháp P4).
  - Phụ thuộc: T034

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-1.1 | T012 |
| AC-1.2 | T009, T012, T013 |
| AC-1.3 | T009, T013 |
| AC-1.4 | T009, T012 |
| AC-1.5 | T009, T010, T013 *(trang chiến thuật: Giai đoạn 2; lịch sử trận đấu: Giai đoạn 3)* |
| AC-1.6 | T009, T014 |
| AC-1.7 | T009, T013 |
| AC-2.1 | T004, T022 |
| AC-2.1b | T004, T016, T019, T022 |
| AC-2.2 | T005, T021 |
| AC-2.3 | T016, T021 |
| AC-2.4 | T019, T021 |
| AC-2.5 | T019, T022 |
| AC-2.6 | T022 |
| AC-2.7 | T020, T023 *(phần ô đội hình: Giai đoạn 2)* |
| AC-2.8 | T023 |
| AC-2.9 | T018, T022 |
| AC-2.10 | T016, T019, T022 |
| AC-2.11 | T017, T022 |
| AC-3.1 | T026 |
| AC-3.2 | T025 |
| AC-3.3 | T025, T026 |
| AC-3.4 | T027 |
| AC-3.5 | T028 *(màn hình trận đấu: Giai đoạn 3)* |
| AC-3.6 | T028 |
| AC-3.7 | T024, T028 *(tự đổi áo phụ trong trận: Giai đoạn 3)* |
| AC-3.8 | T024, T027, T028 |
| AC-4.1 | T015 |
| AC-4.2 | T006, T015 *(lịch sử trận đấu: Giai đoạn 3)* |
| AC-4.3 | T029, T032 |
| AC-4.4 | T030 |
| AC-4.5 | T030, T032 |
| AC-4.6 | T030, T032 |
| AC-4.7 | T031 |
| AC-4.8 | T029, T032 |
| AC-4.9 | T015 |

36/36 AC trong phạm vi đều có task. **Năm** AC được ghi chú rõ phần vắt sang giai đoạn sau để T033 không tick trọn: AC-1.5, AC-2.7, AC-3.5, AC-3.7, AC-4.2. Mức hoàn thành chính thức của Giai đoạn 1 là **31 trọn + 5 một phần**.

## Ghi chú thực thi

- Không tạo file nào ngoài danh sách trên. Phát sinh thêm → dừng, cập nhật plan/tasks trước.
- Mỗi task hoàn thành là một commit, thông điệp nêu rõ mã task (hiến pháp mục 4). Không commit khi ứng dụng không build được.
- Task thuộc `src/domain/` và `src/services/`, `src/storage/` chưa có test thì **chưa xong** (hiến pháp mục 4). Task thuộc `src/ui/` được xác nhận bằng cách tự bấm thử.
- Kết thúc mỗi phase từ Phase 1 trở đi, ứng dụng phải chạy trọn luồng của phase đó (hiến pháp P6) trước khi sang phase sau.
