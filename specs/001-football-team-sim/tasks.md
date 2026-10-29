# Tasks: Bóng đá Manager — Giai đoạn 1, 2, 3 và 4

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | Giai đoạn 1 (36 AC), Giai đoạn 2 (22 AC), Giai đoạn 3 (26 AC) và Giai đoạn 4 (13 AC + 3 AC vắt lại) |
| **Tiến độ** | 109/130 — Giai đoạn 1 xong (38/39, còn T035); Giai đoạn 2 và 3 xong trọn; Giai đoạn 4 đang làm (Phase 15 xong: T099–T108; còn Phase 16–19: T109–T129) |
| **Sửa đổi** | 2026-10-29 — Phase 15 (T099–T108) đã hiện thực và commit; Phase 16–19 chưa bắt đầu |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Các phase dưới đây là các lát cắt dọc ở `plan.md` — mục 9 cho Giai đoạn 1, mục II.9 cho Giai đoạn 2, mục III.9 cho Giai đoạn 3, mục IV.9 cho Giai đoạn 4. Mỗi phase từ Phase 1 trở đi kết thúc là một ứng dụng chạy được và dùng thử được (hiến pháp P6), và là một commit.

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

---

## Phase 6 — Đổi định dạng tệp sao lưu sang ZIP

Thêm ngày 2026-10-27 sau khi T035 đo được tệp sao lưu là **43,7 MB** ở đúng mốc
dữ liệu mà spec mục 6 cam kết. Đây là rủi ro R1 của plan hiện ra, và đường lùi
đã nêu sẵn trong plan: đổi sang tệp ZIP có thư mục ảnh riêng.

Không thêm AC mới — AC-4.3 vẫn là "một tệp duy nhất", AC-4.4 vẫn là "nhập lại
ra đúng dữ liệu". Phần việc thật sự là giữ cho tệp v1 đã phát hành vẫn nhập
được (hiến pháp P7).

- [x] **T036** — Nâng `SCHEMA_VERSION` lên 2 và định nghĩa hình dạng v2
  - File: `src/storage/migrations.ts`, `src/services/backupSchema.ts`, `src/storage/db.test.ts`
  - Xong khi: test xanh — `SCHEMA_VERSION` là 2; có schema cho cả v1 và v2 cạnh nhau, schema v1 KHÔNG bị sửa; `MIGRATIONS` có đúng một bước nâng v1 lên v2 (bỏ trường `data` base64, thêm `duongDan`); tệp khai `schemaVersion: 3` vẫn bị từ chối bằng `VersionTooNew`.
  - AC: AC-4.4, AC-4.5
  - Phụ thuộc: —

- [x] **T037** — Xuất tệp ZIP
  - File: `src/services/backupService.ts`, `src/services/backupService.test.ts`
  - Xong khi: test xanh — `exportAll` trả một tệp ZIP chứa `manifest.json` và một mục `images/<id>.<ext>` cho mỗi ảnh; manifest KHÔNG còn trường `data`; byte ảnh trong ZIP khớp từng byte với blob trong database; với bộ dữ liệu có ảnh, tệp ZIP **nhỏ hơn** tệp JSON base64 của cùng dữ liệu.
  - AC: AC-4.3
  - Phụ thuộc: T036

- [x] **T038** — Nhập được cả v1 và v2, nhận dạng bằng chữ ký nội dung
  - File: `src/services/backupService.ts`, `src/services/backupService.test.ts`
  - Xong khi: test xanh — nhập tệp v2 ra đúng dữ liệu kể cả ảnh; **nhập tệp v1 (JSON base64) vẫn ra đúng dữ liệu** (P7); tệp v1 bị đặt tên `.zip` vẫn nhập được và ngược lại, vì nhận dạng dựa vào chữ ký `PK\x03\x04` chứ không dựa vào tên; ZIP thiếu `manifest.json` thì ném `SchemaInvalid`; ZIP mà manifest trỏ tới ảnh không có trong archive thì ném `SchemaInvalid`; tính tất-cả-hoặc-không-gì vẫn giữ cho cả hai định dạng.
  - AC: AC-4.4, AC-4.5, AC-4.6
  - Phụ thuộc: T037

- [x] **T039** — Cập nhật ước tính kích thước và kiểm tay
  - File: `src/services/backupService.ts`, `src/services/backupService.test.ts`
  - Xong khi: `uocTinhKichThuoc` bỏ hệ số 4/3 của base64; test xanh khẳng định ước tính cho bộ có ảnh nhỏ hơn ước tính theo công thức cũ; kiểm tay trên trình duyệt: xuất bộ 20 đội × 30 cầu thủ và ghi lại kích thước thật để đối chiếu với 43,7 MB của v1.
  - AC: AC-4.8
  - Phụ thuộc: T038

---
---

# GIAI ĐOẠN 2 — Sơ đồ chiến thuật

Theo `plan.md` **Phần II**. 22 AC (AC-5.1→5.10, AC-6.1→6.6, AC-7.1→7.6), trong
đó AC-5.7 làm một phần — phần chặn bắt đầu giả lập thuộc GĐ3.

> **Trước khi làm lát 5:** nói với người dùng xuất một tệp sao lưu. Nâng
> `DB_VERSION` không lùi được bằng `git revert` (plan Phần II, mục Rollback).

## Phase 7 — Lát 5: Dữ liệu và luật, chưa có giao diện

Lát này không cho người dùng thêm gì, nhưng phải đi trước: sai ở tầng luật thì
nhìn vào giao diện không thấy được.

- [x] **T040** [P] — 8 sơ đồ với toạ độ ô
  - File: `src/domain/formations.ts`, `src/domain/formations.test.ts`
  - Xong khi: test xanh — đúng 8 sơ đồ (4-4-2, 4-4-1-1, 4-3-3, 4-2-3-1, 4-1-4-1, 3-5-2, 3-4-3, 5-3-2); mỗi sơ đồ đúng 11 ô, đúng một ô thủ môn, `slotId` không trùng, toạ độ `x`/`y` trong 0..100; mọi `viTri` của ô thuộc 12 vị trí của `POSITIONS`; **`cacDai` khớp các số trong tên sơ đồ** (4-2-3-1 → `[4,2,3,1]`), tổng `cacDai` bằng 10, và **số ô của mỗi dải đúng bằng số tương ứng trong `cacDai`** — ô thủ môn có `dai: 0` và không thuộc dải nào.
  - Ghi chú: điều kiện này ban đầu viết là "tên khớp số ô theo **tuyến**", và `/analyze` bắt được là **không thể thoả**: `POSITIONS` chỉ có 3 tuyến ngoài sân, trong khi 4-4-1-1, 4-2-3-1 và 4-1-4-1 có 4 dải trong tên (với 4-2-3-1 thì dải "3" và dải "1" đều thuộc tuyến tấn công). Khai `dai` thành dữ liệu của từng ô thì phép kiểm thoả được cho cả 8 sơ đồ và vẫn bắt được lỗi gõ sai bảng toạ độ — xem quyết định D15b của plan.
  - AC: AC-5.2
  - Phụ thuộc: —

- [x] **T041** [P] — Ba mức sai vị trí và mức trừ hiệu suất
  - File: `src/domain/misplacement.ts`, `src/domain/misplacement.test.ts`
  - Xong khi: test xanh — hậu vệ phải đá hậu vệ trái = `nhe`; tiền vệ trụ đá trung vệ = `vua`; tiền đạo đá trung vệ = `nang`; người không phải thủ môn đứng khung = `nang`; thủ môn đá vị trí sân = `nang`; đúng vị trí = `dung`; cầu thủ nhiều vị trí lấy mức **nhẹ nhất**; `MUC_TRU_HIEU_SUAT` tăng dần theo mức (đây là con số mà AC-8.5 của GĐ3 sẽ kiểm).
  - AC: AC-5.5
  - Phụ thuộc: —

- [x] **T042** [P] — 23 vai trò và cảnh báo chỉ số chưa đạt
  - File: `src/domain/roles.ts`, `src/domain/roles.test.ts`
  - Xong khi: test xanh — tổng số vai trò nằm trong khoảng 20..26 (AC-6.1 nói "khoảng 22"; dự kiến hiện thực 23 — **không ghim đúng một con số**, để sau này thêm một vai trò hợp lý không làm test đỏ vô cớ); **mỗi vị trí trong 12 vị trí trả về 2 hoặc 3 vai trò** — đây mới là điều AC-6.1 thật sự đòi; mỗi vai trò có `moTa` không rỗng và `chiSoQuanTrong` đều là chỉ số hợp lệ; **vai trò của thủ môn chỉ dùng chỉ số mà thủ môn có** (bất biến giống test đã có cho `POSITION_WEIGHTS`); `vaiTroMacDinh` trả một vai trò áp dụng được cho vị trí đó; `chiSoChuaDat` trả đúng các chỉ số dưới 10 kèm giá trị, và trả rỗng khi hồ sơ đủ cao.
  - AC: AC-6.1, AC-6.4, AC-6.5
  - Phụ thuộc: —

- [x] **T043** [P] — 6 chỉ thị đội, bộ mặc định và luật xung đột
  - File: `src/domain/instructions.ts`, `src/domain/instructions.test.ts`
  - Xong khi: test xanh — đúng 6 chỉ thị (độ cao đội hình, độ rộng, tốc độ chuyển bóng, cường độ pressing, hướng tấn công, bẫy việt vị); mỗi mức của mỗi chỉ thị có câu đánh đổi không rỗng; `CHI_THI_MAC_DINH` có đủ 6 khoá và **không sinh xung đột nào**; `cacXungDot` phát hiện được: bẫy việt vị bật + đội hình thấp, pressing cao + đội hình thấp, tấn công biên + đội hình hẹp.
  - AC: AC-7.1, AC-7.2, AC-7.3, AC-7.4
  - Phụ thuộc: —

- [x] **T044** — Xếp lại người khi đổi sơ đồ, và tình trạng đội hình
  - File: `src/domain/lineup.ts`, `src/domain/lineup.test.ts`
  - Xong khi: test xanh — **không mất cầu thủ nào** (người trên sân + người bị đẩy ra = người ban đầu); đổi 4-4-2 sang 4-3-3 thì trung vệ vẫn ở trung vệ; sơ đồ mới ít ô ở một tuyến thì người thừa ra ngoài và được nêu tên; **tất định** — gọi hai lần ra cùng kết quả, không dùng nguồn ngẫu nhiên nào (P1); có một tình huống cụ thể mà lượt đổi cặp cải thiện được so với tham lam thuần (quyết định D14); `tinhTrangDoiHinh` nêu đúng lý do cho ba trường hợp: thiếu người, thiếu thủ môn, có cầu thủ hồ sơ chưa hoàn tất.
  - **Sửa điều kiện khi hiện thực:** điều kiện trên viết "sơ đồ mới ít ô ở một tuyến thì người thừa ra ngoài", và điều đó **không xảy ra được**. Hai sơ đồ nào cũng có đúng 11 ô, và mức sai `vua` (lệch một tuyến) vẫn xếp được — nên khi một tuyến hụt ô thì người thừa chuyển sang tuyến bên cạnh và bị tính là **xếp sai vị trí**, chứ không bị đẩy ra. AC-5.8 nói "những ai bị đẩy ra ngoài **hoặc** bị xếp sai vị trí", nên cả hai đều là hành vi đúng của AC. Bị đẩy ra chỉ xảy ra khi mọi ô còn lại đều là mức `nang` — đúng một trường hợp thật: đội hình có **hai thủ môn** (người dùng tự xếp một thủ môn ra ô sân), sang sơ đồ mới chỉ còn một ô khung thành. Test kiểm đúng trường hợp đó, và kiểm thêm rằng tuyến hụt ô thì sinh ra `nguoiXepSai` chứ không phải `nguoiBiDayRa`.
  - AC: AC-5.7, AC-5.8
  - Phụ thuộc: T040, T041

- [x] **T045** — Nâng `DB_VERSION` lên 2, thêm store `tactics`
  - File: `src/storage/db.ts`, `src/domain/types.ts`, `src/storage/db.test.ts`
  - Xong khi: test xanh trên `fake-indexeddb` — mở database mới có 5 store, `tactics` có index `byTeam`; **nâng cấp từ phiên bản 1 trên database ĐÃ CÓ đội, cầu thủ và ảnh thì không mất bản ghi nào**, mỗi đội có đúng một chiến thuật mặc định (4-4-2, 11 ô trống, vai trò mặc định, chỉ thị cân bằng) và `activeTacticId` trỏ tới nó; bước nâng cấp chỉ THÊM, không sửa không xoá (rủi ro R6).
  - **Cách dựng database v1 để test nâng cấp:** `DB_VERSION` giờ là 2 nên `moDb()` không mở được v1 nữa. Test phải tự gọi `indexedDB.open(DB_NAME, 1)`, trong `onupgradeneeded` tạo tay 4 store cũ (`meta`, `teams`, `players`, `images`) kèm các index của chúng, nhét sẵn đội + cầu thủ + ảnh, **đóng kết nối**, rồi mới gọi `moDb()` để kích hoạt bước nâng cấp. Không làm đúng thứ tự này thì test chỉ mở một database v2 mới toanh và **không chứng minh gì cả** — mà T045 là phòng tuyến duy nhất cho R6 (ảnh hưởng Cao).
  - AC: AC-5.10, AC-7.4
  - Phụ thuộc: T040, T042, T043

- [x] **T046** — `tacticRepo`
  - File: `src/services/tacticRepo.ts`, `src/services/errors.ts` (thêm mã `InvalidTactic`), `src/ui/strings.ts` (thêm câu cho mã mới), `src/services/tacticRepo.test.ts`
  - Ghi chú: `cauLoi` trong `ui/strings.ts` là `switch` vét cạn trên `MaLoi`. Thêm mã mà không thêm câu thì hàm có đường trả về `undefined` trong khi khai `: string`, và `tsc --noEmit` đỏ — nên hai file phải sửa cùng nhau.
  - Xong khi: test xanh — `layChienThuatDangDung` tự tạo bộ mặc định cho đội chưa có; `luu` rồi đọc lại ra đúng; `luuThanhBo` nhân bản bộ đang dùng thành bộ có tên mà **không làm đổi bộ đang dùng**; `danhSachBo` chỉ trả các bộ có tên; `apDungBo` đổi `activeTacticId`; bộ sai hình dạng bị từ chối bằng `InvalidTactic` — không đủ 11 ô, ô trỏ tới cầu thủ của đội khác, vai trò không áp dụng được cho vị trí của ô.
  - AC: AC-5.10, AC-7.5, AC-7.6
  - Phụ thuộc: T045

- [x] **T047** — Xoá đội thì dọn cả chiến thuật
  - File: `src/services/teamRepo.ts`, `src/services/teamRepo.test.ts`
  - Xong khi: test xanh — xoá một đội thì mọi chiến thuật của đội đó (cả bộ đang dùng và các bộ có tên) bị xoá trong **cùng transaction** với cầu thủ và ảnh; không chạm chiến thuật của đội khác.
  - AC: AC-1.6
  - Phụ thuộc: T046

- [x] **T047b** — Xoá cầu thủ thì ô đội hình của họ thành trống
  - File: `src/services/playerRepo.ts`, `src/services/playerRepo.test.ts`
  - Xong khi: test xanh — xoá một cầu thủ đang được xếp trong đội hình thì mọi ô trỏ tới họ (ở **cả** bộ chiến thuật đang dùng **và** các bộ có tên của đội) có `playerId` thành `null`, **trong cùng transaction** với việc xoá cầu thủ và ảnh; sau đó `tacticRepo.layChienThuatDangDung` vẫn nạp được bộ đó mà không ném `InvalidTactic`; chiến thuật của đội khác không bị chạm; xoá một cầu thủ **không** nằm trong đội hình nào thì không chiến thuật nào bị ghi lại.
  - AC: AC-2.7 *(đóng nốt phần mà Giai đoạn 1 ghi là hoãn sang GĐ2)*
  - Phụ thuộc: T046
  - Ghi chú: task này do `/analyze` bổ sung. Bản `tasks.md` đầu của Giai đoạn 2 bỏ sót nó, và hậu quả là cụ thể: `oVien` giữ một `playerId` treo, rồi chính phép kiểm `InvalidTactic` của T046 làm bộ chiến thuật **không nạp được nữa** — tức là người dùng mất chiến thuật chỉ vì xoá một cầu thủ, đúng thứ P3 cấm.

## Phase 8 — Lát 6: Sân và xếp người

Kết thúc phase: mở trang chiến thuật, chọn sơ đồ, kéo người vào ô bằng chuột
**và** bằng bàn phím, thấy mức sai vị trí, rời trang rồi quay lại vẫn còn.

- [x] **T048** [P] — Chuỗi hiển thị cho Giai đoạn 2
  - File: `src/ui/strings.ts`
  - Xong khi: có nhãn cho trang chiến thuật, tên 8 sơ đồ, nhãn ba mức sai vị trí, nhãn 6 chỉ thị và các mức, câu cho tình trạng đội hình; `grep` byte non-ASCII xác nhận không component nào viết chuỗi hiển thị trực tiếp (P8), như cách đã kiểm ở Giai đoạn 1.
  - Phụ thuộc: —

- [x] **T049** — Sân bóng và 11 ô vị trí
  - File: `src/ui/components/SanBong.tsx`, `src/ui/components/OViTri.tsx`
  - Xong khi: sân vẽ bằng CSS và SVG nội tuyến, **không tài nguyên nào tải từ ngoài** (P4); chọn một sơ đồ thì hiện đúng 11 ô ở đúng toạ độ phần trăm; ô trống hiện tên vị trí; sân giữ tỉ lệ khi khung co giãn.
  - AC: AC-5.1, AC-5.2
  - Phụ thuộc: T040, T048

- [x] **T050** — Hook chiến thuật và phần store
  - File: `src/hooks/useTactic.ts`, `src/store/appStore.ts`
  - Xong khi: `npx tsc --noEmit` sạch; đổi một ô thì ghi xuống lưu trữ ngay, không có nút Lưu (AC-4.1 vẫn áp dụng); selector trả **tham chiếu ổn định** khi không có chiến thuật, không tạo object mới mỗi lần gọi (lỗi vòng lặp render ở T020 đã dạy bài này).
  - AC: AC-5.10
  - Phụ thuộc: T046
  
- [x] **T051** — Trang chiến thuật và lối vào từ trang đội
  - File: `src/ui/pages/TrangChienThuat.tsx`, sửa `src/ui/pages/TrangDoi.tsx`, sửa `src/App.tsx`
  - Xong khi: từ trang đội bấm được sang trang chiến thuật của đúng đội đó và quay lại được; trang hiện sân, danh sách cầu thủ ngoài sân, và bộ chọn sơ đồ; chọn sơ đồ khác thì 11 ô đổi theo; **tên đội trên trang này đọc từ store dùng chung, không giữ bản sao riêng** — đổi tên đội ở danh sách đội rồi mở lại trang chiến thuật thì thấy tên mới (AC-1.5).
  - AC: AC-5.1, AC-1.5 *(đóng nốt phần mà Giai đoạn 1 ghi là hoãn sang GĐ2)*
  - Phụ thuộc: T049, T050

- [x] **T052** — Kéo-thả bằng chuột: đặt, đổi chỗ, bỏ ra ngoài
  - File: `src/ui/components/DanhSachNgoaiSan.tsx`, sửa `src/ui/components/OViTri.tsx`, sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: kéo một cầu thủ từ danh sách vào ô trống thì ô hiện ảnh (hoặc hình thay thế), tên và số áo; kéo **từ ô sang ô đã có người** thì hai ô đổi chỗ; kéo **từ băng ghế vào ô đã có người** thì người cũ về băng ghế — cả hai trường hợp đều không làm mất cầu thủ nào (AC-5.4 nói "đổi chỗ" nhưng không nói trường hợp kéo từ băng ghế, nên chốt ở đây); kéo một cầu thủ ra khỏi sân thì ô thành trống và người đó về danh sách ngoài sân.
  - **Thứ tự đo bundle:** chạy `npm run build` và ghi số **trước khi** `npm install @dnd-kit/core`, rồi build lại và ghi số thứ hai; cả hai số vào mô tả commit (rủi ro R7 — không trích con số từ trí nhớ, như lần tôi ghi sai "fflate 8KB").
  - AC: AC-5.3, AC-5.4, AC-5.6
  - Phụ thuộc: T051

- [x] **T053** — Xếp người chỉ bằng bàn phím
  - File: sửa `src/ui/components/DanhSachNgoaiSan.tsx`, sửa `src/ui/components/OViTri.tsx`
  - Xong khi: **tự tay xếp trọn một đội hình 11 người mà không chạm chuột**, dùng Tab để đi và bàn phím để nhấc/đặt/đổi chỗ; mỗi ô và mỗi cầu thủ ngoài sân là một đích focus thấy rõ; nếu phần bàn phím của `@dnd-kit` không dùng được thì **dừng và báo người dùng** trước khi tự viết cơ chế thứ hai (đường lùi của R7).
  - AC: AC-5.9
  - Phụ thuộc: T052

- [x] **T054** [P] — Nhãn mức sai vị trí trên ô
  - File: sửa `src/ui/components/OViTri.tsx`
  - Xong khi: cầu thủ xếp sai vị trí thì ô hiện **nhãn chữ** của mức (nhẹ / vừa / nặng) kèm mức trừ hiệu suất, không chỉ đổi màu viền (P9); xếp đúng vị trí thì không có nhãn nào.
  - AC: AC-5.5
  - Phụ thuộc: T052, T041

## Phase 9 — Lát 7: Vai trò và tình trạng đội hình

- [x] **T055** — Chọn vai trò cho ô
  - File: `src/ui/components/ChonVaiTro.tsx`, sửa `src/ui/components/OViTri.tsx`
  - Xong khi: chọn một ô thì hiện 2..3 vai trò dành cho vị trí của ô đó; chọn một vai trò thì tên vai trò hiện ngay tại ô trên sơ đồ; mỗi vai trò kèm câu giải thích ngắn và danh sách chỉ số quan trọng của nó.
  - AC: AC-6.1, AC-6.2, AC-6.3
  - Phụ thuộc: T042, T051

- [x] **T056** — Cảnh báo cầu thủ chưa đáp ứng vai trò
  - File: sửa `src/ui/components/ChonVaiTro.tsx`, sửa `src/ui/components/OViTri.tsx`
  - Xong khi: cầu thủ ở ô có chỉ số quan trọng của vai trò dưới 10 thì hiện cảnh báo **nêu tên từng chỉ số và giá trị hiện tại**; cầu thủ đạt hết thì không có cảnh báo; hồ sơ chưa đủ chỉ số thì nói rõ là chưa đánh giá được thay vì báo không đạt.
  - AC: AC-6.4
  - Phụ thuộc: T055

- [x] **T057** [P] — Vai trò mặc định và vai trò gắn với ô
  - File: sửa `src/hooks/useTactic.ts`
  - Xong khi: chọn một sơ đồ mới thì **mọi ô đã có vai trò mặc định** mà người dùng không phải làm gì; đổi cầu thủ ở một ô thì `roleId` của ô **không đổi** (AC-6.6) — kiểm bằng cách đổi người ở ô đã gán vai trò riêng rồi xác nhận vai trò còn nguyên.
  - AC: AC-6.5, AC-6.6
  - Phụ thuộc: T055

- [x] **T058** — Đổi sơ đồ: xếp lại người và nói rõ ai bị ảnh hưởng
  - File: sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: đổi sơ đồ khi đã xếp đủ 11 người thì người được giữ lại và tự xếp vào sơ đồ mới; thông báo nêu rõ **ai bị đẩy ra ngoài** và **ai bị xếp sai vị trí kèm mức**; không cầu thủ nào biến mất.
  - AC: AC-5.8
  - Phụ thuộc: T044, T052

- [x] **T059** — Dải tình trạng đội hình
  - File: sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: đội hình chưa đủ 11 người, hoặc chưa có thủ môn, hoặc có cầu thủ hồ sơ chưa hoàn tất thì dải thông báo nêu **đúng từng lý do**; đủ điều kiện thì dải chuyển sang trạng thái sẵn sàng. Ghi rõ trong mô tả commit là phần "chặn bắt đầu giả lập" của AC-5.7 thuộc GĐ3.
  - AC: AC-5.7 *(một phần — phần chặn giả lập: GĐ3)*
  - Phụ thuộc: T044, T051

## Phase 10 — Lát 8: Chỉ thị đội và tệp sao lưu v3

- [x] **T060** — Đặt 6 chỉ thị đội kèm câu đánh đổi
  - File: `src/ui/components/ChiThiDoi.tsx`, sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: đặt được cả 6 chỉ thị; đổi một mức thì **câu đánh đổi của đúng mức đó** hiện ra ngay; thay đổi được ghi xuống lưu trữ ngay và còn sau khi tải lại trang.
  - AC: AC-7.1, AC-7.2
  - Phụ thuộc: T043, T051

- [x] **T061** — Cảnh báo tổ hợp chỉ thị xung đột
  - File: sửa `src/ui/components/ChiThiDoi.tsx`
  - Xong khi: chọn bẫy việt vị bật cùng đội hình thấp thì hiện cảnh báo nêu rõ xung đột, **nhưng vẫn giữ được lựa chọn** nếu người dùng muốn (AC-7.3 nói cảnh báo, không chặn); bộ cân bằng mặc định không hiện cảnh báo nào.
  - AC: AC-7.3
  - Phụ thuộc: T060

- [x] **T062** [P] — Đội mới có sẵn bộ chỉ thị cân bằng
  - File: sửa `src/services/teamRepo.ts`, sửa `src/services/teamRepo.test.ts`
  - Xong khi: test xanh — tạo đội mới thì đội có ngay một chiến thuật dùng được với chỉ thị cân bằng và vai trò mặc định, không cần người dùng chỉnh gì; `cacXungDot` trên bộ đó trả rỗng.
  - AC: AC-7.4
  - Phụ thuộc: T043, T045

- [x] **T063** — Lưu bộ chiến thuật có tên và chọn lại
  - File: `src/ui/components/BoChienThuat.tsx`, sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: lưu bộ đang dùng dưới một tên thì tên đó xuất hiện trong danh sách bộ của đội; chọn lại một bộ thì sơ đồ, vai trò và chỉ thị trở về đúng bộ đó; tên rỗng bị chặn; bộ đang dùng sau khi chọn lại là bộ vừa áp dụng (AC-7.6).
  - AC: AC-7.5, AC-7.6
  - Phụ thuộc: T046, T060

- [x] **T064** [P] — Tệp sao lưu v3 chứa chiến thuật, vẫn đọc được v1 và v2
  - File: `src/storage/migrations.ts`, `src/services/backupSchema.ts`, `src/services/backupService.ts`, `src/services/backupService.test.ts`
  - Xong khi: test xanh — `SCHEMA_VERSION` là 3; schema v3 thêm cạnh v1 và v2, **không sửa hai schema cũ** (P7); bước migration v2→v3 thêm `tactics: []` và `activeTacticId: null`; xuất v3 rồi nhập lại ra đúng chiến thuật; **nhập tệp v2 (ZIP, chưa có chiến thuật) thì mọi đội được gán bộ mặc định**; **nhập tệp v1 (JSON base64) cũng vậy**; tệp khai `schemaVersion: 4` bị từ chối; tính tất-cả-hoặc-không-gì vẫn giữ cho cả ba phiên bản.
  - AC: AC-4.4, AC-4.5, AC-5.10
  - Phụ thuộc: T046

- [x] **T065** — Kiểm tay 22 AC của Giai đoạn 2
  - File: `specs/001-football-team-sim/spec.md` (tick các ô AC trong phạm vi)
  - Xong khi: 21 AC làm trọn được tự tay kiểm trên ứng dụng đang chạy và tick; AC-5.7 ghi rõ phần nào đã xong, **không** tick trọn; kiểm luôn hai việc mà chỉ kiểm tay mới thấy: xếp trọn đội hình **chỉ bằng bàn phím**, và đổi sơ đồ khi đã xếp đủ người rồi đọc thông báo; ghi số đo bundle trước/sau `@dnd-kit` vào mô tả commit.
  - **Tick lại ba AC của Giai đoạn 1 có phạm vi rộng ra:** bỏ tick **AC-4.4** và **AC-4.5** rồi kiểm lại trên tệp v3 (vì giờ tệp sao lưu phải chứa cả chiến thuật), và kiểm lại **AC-1.6** (xoá đội dọn cả chiến thuật). Một cái tick cũ không còn nói đúng khi phạm vi của AC đã khác.
  - **Tick hai phần vắt từ Giai đoạn 1 mà giai đoạn này đóng nốt:** AC-2.7 (sau T047b) và AC-1.5 (sau T051) — hai AC đó chuyển từ "một phần" sang trọn, trừ phần lịch sử trận đấu của AC-1.5 vẫn thuộc GĐ3.
  - Phụ thuộc: T047b, T053, T054, T056, T057, T058, T059, T061, T062, T063, T064

---

## Phase 11 — Lát 9: Engine nền và tính tái lập

Kết thúc phase: chạy trọn một trận **trong test** ra tỉ số và dòng sự kiện;
cùng mã trận hai lần ra kết quả giống từng dòng. Chưa có giao diện — đây là
phase duy nhất của Giai đoạn 3 không bàn giao được cho người dùng, và nó đi
trước vì engine sai thì mọi thứ vẽ lên màn hình đều vô nghĩa.

- [x] **T066** [P] — Nguồn ngẫu nhiên tất định sinh từ mã trận
  - File: `src/engine/rng.ts`, `src/engine/rng.test.ts`
  - Xong khi: test xanh — `taoRng('ABC')` gọi 1000 lần ra **đúng dãy ghi cứng trong test** (vector cố định, để sau này đổi code mà lỡ đổi dãy là đỏ ngay); hai mã khác nhau ra hai dãy khác nhau; mọi giá trị nằm trong `[0, 1)`; `taoMaTran` trả đúng 10 ký tự và **không chứa I, L, O, U** (quyết định D20); kiểm trên source đã bỏ comment rằng file không chứa `Math.random`, `Date.now`, `crypto.getRandomValues` — dùng lại đúng cách kiểm đã có ở `generator.test.ts`.
  - AC: AC-8.11
  - Phụ thuộc: —

- [x] **T067** [P] — Lưới vùng sân
  - File: `src/engine/vung.ts`, `src/engine/vung.test.ts`
  - Xong khi: test xanh — đúng 12 vùng (3 cột × 4 dải, quyết định D23); mỗi vùng biết cột (trái/giữa/phải) và dải (0 là sân nhà, 3 là vòng cấm đối phương); hàm lật vùng theo hướng tấn công trả về vùng đối xứng và lật hai lần ra lại chính nó; không id nào trùng.
  - AC: AC-8.3, AC-8.4 *(phần nền — hai AC này chỉ đo được khi có cột biên)*
  - Phụ thuộc: —

- [x] **T068** — Kiểu sự kiện và bước chọn mật độ
  - File: `src/engine/suKien.ts`, `src/engine/suKien.test.ts`
  - Xong khi: test xanh — sự kiện **bắt buộc** (bàn thắng, thẻ, thay người, mốc hết hiệp) luôn được giữ dù điểm đáng kể thấp; từ 300 ứng viên, bước chọn trả về **không quá 100**; chạy hai lần trên cùng đầu vào ra cùng danh sách (tất định); khi chỉ có 40 ứng viên thì trả hết 40 và **không bịa thêm** — sàn 60 là việc của engine phải sinh đủ tình huống, không phải việc của bước chọn, và T070 mới là chỗ kiểm sàn đó.
  - AC: AC-8.15
  - Phụ thuộc: T066

- [x] **T069** — Một chuỗi kiểm soát bóng
  - File: `src/engine/chuoiBong.ts`, `src/engine/chuoiBong.test.ts`
  - Xong khi: test xanh — mỗi chuỗi kết thúc ở đúng một kết cục trong tập đóng {dứt điểm, mất bóng, phạm lỗi, bóng ra ngoài}; có chặn số bước nên không chạy vô hạn; cùng `Rng` và cùng đầu vào ra cùng kết cục; bóng chỉ dịch sang **vùng kề**, không nhảy cóc qua sân.
  - AC: AC-8.2
  - Phụ thuộc: T066, T067

- [x] **T070** — Máy trạng thái trận
  - File: `src/engine/tran.ts`, `src/engine/tran.test.ts`
  - Xong khi: test xanh — `taoTran` ra phút 0 với bù giờ mỗi hiệp trong 1..5 **chốt ngay lúc tạo**; `buocTiep` tiến đúng một phút; `chayHetTran` dừng sau 90 phút cộng bù giờ; trận hoà **kết thúc là hoà**, không có hiệp phụ; mọi sự kiện phát ra đều mang playerId của người **đang trên sân tại phút đó**; và dòng sự kiện của một trận thật nằm trong **dải 60..100 trên ít nhất 20 mã trận khác nhau**. Và **`buocTiep` là hàm thuần**: gọi hai lần trên **cùng một** trạng thái ra hai kết quả giống hệt — hạt giống nằm trong `TrangThaiTran` (ghi chú (1) của plan III.4), không phải trong một closure bên ngoài.
  - AC: AC-8.1, AC-8.2, AC-8.15
  - Phụ thuộc: T068, T069

- [x] **T071** — Chạy lại cùng mã trận ra kết quả giống từng dòng
  - File: `src/engine/taiLap.test.ts`
  - Xong khi: test xanh — với 10 mã trận cố định, `chayHetTran` chạy hai lần cho **cùng tỉ số và cùng mảng sự kiện, so bằng `toEqual` trên cả mảng** chứ không chỉ so độ dài; đổi một ký tự trong mã trận thì chuỗi sự kiện khác đi (nếu không khác thì mã trận đang bị bỏ qua ở đâu đó).
  - AC: AC-8.11
  - Phụ thuộc: T070

- [x] **T072** — Canh biên giới tầng `engine/`
  - File: `src/engine/boundaries.test.ts` *(file riêng của tầng engine — một tầng không đi tuần tầng khác; `src/engine/__fixtures__/` được bỏ qua vì chỉ dựng object thuần cho test)*
  - Xong khi: test xanh — không file nào trong `src/engine/` import `react`, `ui`, `hooks`, `services` hay `storage`; không file nào chứa `Math.random`, `Date.now`, `crypto.getRandomValues` sau khi bỏ comment (P1); test tự khẳng định đọc được **ít nhất 5 file** trong `engine/`, để một glob hỏng không làm test xanh một cách vô nghĩa — đúng lỗi mà bản đầu của `boundaries.test.ts` đã phòng.
  - AC: — *(hiến pháp P1, P2)*
  - Phụ thuộc: T070

---

## Phase 12 — Lát 10: Chiến thuật tác động vào trận

Kết thúc phase: **bốn test so sánh của P5 đều xanh**. Đây là phase quyết định
engine có đáng tin hay không; nếu nó đỏ thì làm giao diện chỉ là trang trí cho
một trận bóng vô lý.

- [x] **T073** [P] — Sức mạnh cầu thủ trong một tình huống
  - File: `src/engine/sucManh.ts`, `src/engine/sucManh.test.ts`
  - Xong khi: test xanh — nền tính từ `chiSoQuanTrong` của **vai trò** nên cùng một cầu thủ ở hai vai trò khác nhau ra hai số khác nhau (nếu bằng nhau thì cả US-6 là vô nghĩa); nhân `(1 − MUC_TRU_HIEU_SUAT[mức])` nên bốn mức sai vị trí cho bốn số **giảm dần nghiêm ngặt**; thể lực thấp làm giảm; hệ số sân nhà chỉ áp cho đội chủ nhà và **bằng đúng 1 khi sân trung lập**.
  - AC: AC-8.5, AC-8.14
  - Phụ thuộc: T070
- [x] **T074** [P] — Thể lực
  - File: `src/engine/theLuc.ts`, `src/engine/theLuc.test.ts`
  - Xong khi: test xanh — thể lực giảm đơn điệu theo phút; cầu thủ `the-luc` cao giảm **chậm hơn** cầu thủ `the-luc` thấp ở cùng mức pressing; cùng một cầu thủ thì pressing cao giảm **nhanh hơn** pressing thấp (AC-8.6 đòi cả hai yếu tố, không phải một); không bao giờ xuống dưới 0.
  - AC: AC-8.6
  - Phụ thuộc: T070

- [x] **T075** [P] — Thẻ vàng, thẻ đỏ và đá thiếu người
  - File: `src/engine/the.ts`, `src/engine/the.test.ts`
  - Xong khi: test xanh — xác suất ăn thẻ **cao hơn** khi `quyet-doan` thấp (so hai hồ sơ chỉ khác chỉ số đó) và **cao hơn** khi đội pressing cao; thẻ vàng thứ hai thành thẻ đỏ; cầu thủ nhận thẻ đỏ bị gỡ khỏi `trenSan`, không quay lại được, và đội đó đá thiếu người tới hết trận.
  - AC: AC-8.13
  - Phụ thuộc: T070

- [x] **T076** [P] — Bảng hệ số chỉ thị
  - File: `src/engine/chiThi.ts`, `src/engine/chiThi.test.ts`
  - Ghi chú: đây là "một bảng duy nhất" của quyết định D24. `plan.md` III.3 không liệt kê tên file này; nó được tách riêng vì D24 nói rõ không được rải thành nhánh `if` trong chuỗi bóng.
  - Xong khi: test xanh — mỗi mức của cả 6 chỉ thị đều có một bộ hệ số; `CHI_THI_MAC_DINH` cho hệ số **trung tính (bằng 1)** ở mọi hướng, nên đội mặc định không bị thiên lệch; không hệ số nào bằng 0 hay âm — một chỉ thị được làm một hành động **hiếm đi**, không được **cấm hẳn**.
  - AC: AC-8.3, AC-8.4
  - Phụ thuộc: T070

- [x] **T077** — Nối sức mạnh, thể lực, thẻ và chỉ thị vào chuỗi bóng
  - File: `src/engine/chuoiBong.ts`, `src/engine/tran.ts`
  - Xong khi: `npx tsc --noEmit` sạch; toàn bộ test cũ vẫn xanh; một trận chạy xong có cả bàn thắng và thẻ trên vài mã trận; và **test tái lập T071 vẫn xanh sau khi nối** — đây là lúc dễ phá tính tất định nhất, vì mỗi nguồn ngẫu nhiên mới gắn vào đều có thể làm lệch thứ tự tiêu thụ `Rng`.
  - AC: AC-8.5, AC-8.6, AC-8.13, AC-8.14
  - Phụ thuộc: T073, T074, T075, T076

- [x] **T078** — Kiệt sức: phạt hiệu suất và báo cho người dùng
  - File: `src/engine/sucManh.ts`, `src/engine/suKien.ts`, `src/engine/kietSuc.test.ts`
  - Xong khi: test xanh — dưới ngưỡng kiệt sức thì sức mạnh bị nhân hệ số phạt; **đúng một** sự kiện `kiet-suc` được phát cho mỗi cầu thủ mỗi trận, không phát lại mỗi phút (nếu không thì một mình nó ăn hết dải 60..100 dòng của AC-8.15).
  - AC: AC-8.7
  - Phụ thuộc: T077

- [x] **T079** — Bộ dựng đội mẫu cho test so sánh, và test AC-8.3
  - File: `src/engine/__fixtures__/doiMau.ts`, `src/engine/sosanh.tanCongBien.test.ts`
  - Xong khi: test xanh — dựng được hai đội 18 người với chỉ số đặt theo ý muốn; chạy **10 mã trận cố định** với `huong-tan-cong: 'bien'` cho số quả tạt trung bình **nhiều hơn ít nhất 50%** so với `'trung-lo'`, cùng đội, cùng đối thủ, chỉ đổi đúng một chỉ thị. Đếm từ **`thongKe.tatCanh`**, KHÔNG đếm từ `cacSuKien` — danh sách sự kiện đã qua bộ lọc mật độ của D27 nên đếm ở đó là đo màn hình chứ không đo giả lập. Test in ra hai con số trung bình, để lần sau chỉnh cân bằng còn biết đang đứng ở đâu.
  - AC: AC-8.3
  - Phụ thuộc: T077

- [x] **T080** [P] — Test so sánh AC-8.4: pressing cao
  - File: `src/engine/sosanh.pressing.test.ts`
  - Xong khi: test xanh — pressing cao so với pressing thấp trên cùng 10 mã trận: số lần cướp bóng ở dải cao **tăng**, VÀ số tình huống đối thủ thoát xuống sau hàng phòng ngự **cũng tăng**. Phải khẳng định **cả hai chiều trong cùng một test** — chỉ kiểm chiều có lợi thì một engine chỉnh ẩu vẫn qua, mà AC-8.4 nói rõ là đánh đổi. Hai con số đọc từ **`thongKe.cuopBongDaiCao`** và **`thongKe.biThoatXuong`**.
  - AC: AC-8.4
  - Phụ thuộc: T079

- [x] **T081** [P] — Test so sánh AC-8.5: xếp sai vị trí
  - File: `src/engine/sosanh.saiViTri.test.ts`
  - Xong khi: test xanh — cùng một mã trận, chỉ đổi ô của **đúng một cầu thủ** qua bốn trạng thái (đúng / nhẹ / vừa / nặng), mọi thứ khác giữ nguyên, cho bốn con số **`thongKe.dongGopTheoCauThu[id]`** giảm dần nghiêm ngặt.
  - AC: AC-8.5
  - Phụ thuộc: T079

- [x] **T082** [P] — Test so sánh AC-8.8: đội mạnh hơn phải thắng
  - File: `src/engine/sosanh.doiManhHon.test.ts`
  - Xong khi: test xanh — đội A hơn đội B 5 điểm ở **mọi** chỉ số, hai bên cùng chỉ thị cân bằng mặc định và không ai xếp sai vị trí: qua 10 mã trận cố định, A thắng **ít nhất 7**. Test in ra số thắng/hoà/thua.
  - AC: AC-8.8
  - Phụ thuộc: T079

- [x] **T083** [P] — Test AC-8.14: lợi thế sân nhà và sân trung lập
  - File: `src/engine/sosanh.sanNha.test.ts`
  - Xong khi: test xanh — cùng hai đội, qua 10 mã trận cố định, đội được chỉ định chủ nhà có kết quả trung bình tốt hơn; và khi bật **sân trung lập** rồi đổi chỗ hai đội cho nhau thì kết quả **đối xứng** — đây là phép kiểm chứng minh lợi thế đã tắt hẳn chứ không chỉ nhỏ đi.
  - AC: AC-8.14
  - Phụ thuộc: T079

---

## Phase 13 — Lát 11: Màn hình trận

Kết thúc phase: chọn cặp đấu, đăng ký 11+7, xem trận chạy theo phút, tạm dừng,
đổi tốc độ, chạy hết trận và đọc trọn dòng sự kiện. Đây là phase đầu tiên của
Giai đoạn 3 bàn giao được cho người dùng (P6).

- [x] **T084** [P] — Chuỗi hiển thị cho Giai đoạn 3
  - File: `src/ui/strings.ts`
  - Xong khi: có nhãn cho màn chọn cặp đấu, đăng ký đội hình, điều khiển trận (tạm dừng / tiếp tục / 3 mức tốc độ / chạy hết), từng lý do không bắt đầu được, nhãn **kiệt sức** và nhãn thẻ; `grep` byte non-ASCII xác nhận không component nào viết chuỗi hiển thị trực tiếp (P8), như đã kiểm ở Giai đoạn 1 và 2.
  - Phụ thuộc: —

- [x] **T085** — Mẫu câu tường thuật
  - File: `src/ui/tuongThuat.ts`, `src/ui/tuongThuat.test.ts`
  - Xong khi: test xanh — mỗi loại sự kiện có **ít nhất 4 mẫu câu**; `dungCauTuongThuat` chèn đúng tên cầu thủ vào câu; và qua 5 trận liên tiếp, mỗi loại sự kiện xuất hiện từ 5 lần trở lên phải dùng **ít nhất 4 mẫu câu khác nhau**.
  - Ghi chú: AC-8.16 viết "không lặp lại nguyên một câu". Đọc theo nghĩa đen thì không thoả được — bộ mẫu câu nào cũng hữu hạn, mà 5 trận có thể có 20 bàn thắng. Điều AC thật sự cấm là **dùng một câu cố định cho một loại tình huống**, nên phép kiểm đếm số mẫu câu khác nhau được dùng. Ghi lại ở đây để `/analyze` và người đọc sau biết đây là chỗ đã cân nhắc, không phải chỗ làm ẩu.
  - AC: AC-8.16
  - Phụ thuộc: T070, T084

- [x] **T086** — Điều kiện bắt đầu trận
  - File: `src/engine/batDau.ts`, `src/engine/batDau.test.ts`
  - Xong khi: test xanh — hai phía cùng một `teamId` thì không bắt đầu được (AC-8.10); chưa đủ 11 chính hoặc chưa **đúng** 7 dự bị thì không bắt đầu được, nêu rõ đội nào thiếu gì (AC-9.9); đội thiếu thủ môn, chưa đủ người, hoặc có cầu thủ hồ sơ chưa hoàn tất thì không bắt đầu được — **dùng lại `tinhTrangDoiHinh` của `domain/lineup.ts`**, không viết luật thứ hai; mọi lý do trả về cùng lúc, không dừng ở lý do đầu.
  - AC: AC-8.9, AC-8.10, AC-9.9, AC-5.7 *(đóng nốt phần chặn giả lập)*
  - Phụ thuộc: T070

- [x] **T087** — Lát trạng thái trận trong store và hook đồng hồ
  - File: `src/store/appStore.ts`, `src/hooks/useMatch.ts`
  - Xong khi: `npx tsc --noEmit` sạch; selector trả **tham chiếu ổn định** khi chưa có trận (bài học từ T020 và T050); hook có 3 mức tốc độ với mức thường là 200ms mỗi phút trận, có tạm dừng/tiếp tục và chạy hết; và **không có `setInterval` hay `setTimeout` nào trong `src/engine/`** — đồng hồ thuộc giao diện (D21).
  - AC: AC-9.2, AC-9.3
  - Phụ thuộc: T070

- [x] **T088** — Màn chọn cặp đấu và đăng ký đội hình
  - File: `src/ui/pages/ChonCapDau.tsx`, `src/ui/components/DangKyDoiHinh.tsx`, sửa `src/App.tsx`
  - Xong khi: chọn được hai đội khác nhau và chỉ định chủ nhà hoặc **sân trung lập**; đăng ký đúng 11 chính và đúng 7 dự bị cho mỗi đội; đội chưa đủ điều kiện thì nút bắt đầu bị chặn kèm **từng lý do một**; logo hai đội hiện ở màn này (đóng nốt AC-3.5); hai đội trùng màu áo thì một đội **tự chuyển sang áo phụ và nói rõ việc đổi** (đóng nốt AC-3.7); mã trận hiện ra trước khi bấm bắt đầu. Chỉ có đúng một đội trong hệ thống thì màn này **nêu rõ cần ít nhất 2 đội** và mời tạo đội đối thủ (spec mục 5).
  - AC: AC-8.9, AC-8.10, AC-8.14, AC-9.9, AC-3.5, AC-3.7
  - Phụ thuộc: T086, T084

- [x] **T089** — Trang trận đấu: dòng tường thuật và điều khiển
  - File: `src/ui/pages/TrangTran.tsx`, `src/ui/components/DongTuongThuat.tsx`, `src/ui/components/BangDieuKhienTran.tsx`
  - Xong khi: trận chạy theo phút với **tỉ số và phút luôn nhìn thấy**; tạm dừng dừng đúng phút hiện tại và tiếp tục từ đúng chỗ đó; đổi tốc độ áp dụng ngay; chạy hết trận nhảy tới kết thúc và **giữ nguyên toàn bộ dòng sự kiện để xem lại**; dòng tường thuật nằm trong vùng `aria-live` tiếng Việt; logo hai đội hiện ở đầu trang.
  - AC: AC-9.1, AC-9.2, AC-9.3, AC-9.4, AC-3.5
  - Phụ thuộc: T087, T088, T085

- [x] **T090** — Cảnh báo khi rời trang giữa trận
  - File: sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: trận đang chạy mà đóng tab hoặc tải lại thì trình duyệt hỏi xác nhận; trận **đã kết thúc thì không hỏi nữa**; rời đi thật thì trận không còn, đúng như spec mô tả — không ghi gì xuống IndexedDB (D32). Trang trận **không có lối rời đi nào khác** ngoài cảnh báo này, nên dòng "xoá đội khi đang có trận dở" ở spec mục 5 không xảy ra được — ghi ra đây để không ai phải đoán.
  - AC: AC-9.10
  - Phụ thuộc: T089

---

## Phase 14 — Lát 12: Can thiệp giữa trận

Kết thúc phase: thay người, đổi chỉ thị và vai trò giữa trận; phát lại đúng
trận đó kèm chuỗi can thiệp; so được hai kết quả cùng mã trận. Giai đoạn 3
hoàn tất.

- [x] **T091** — Áp can thiệp giữa trận trong engine
  - File: `src/engine/tran.ts`, `src/engine/canThiep.test.ts`
  - Xong khi: test xanh — thay người đổi `trenSan` và `duBi`, ghi sự kiện tại **đúng phút**, các phút sau tính theo người mới; lần thay thứ 6 bị từ chối với lý do `het-luot-thay`; can thiệp vào đội không phải của người dùng bị từ chối; không thay được cầu thủ đã nhận thẻ đỏ, cũng không đưa vào được người ngoài danh sách 18; đổi chỉ thị hoặc vai trò chỉ ảnh hưởng **từ phút hiện tại trở đi** và **các sự kiện đã phát không đổi một dòng**. Thêm một bất biến: trên nhiều mã trận có **cả thẻ đỏ lẫn thay người**, mọi `cacCauThu` của mọi sự kiện đều nằm trong `trenSan` tại đúng phút đó — không có dòng tường thuật nào nhắc tên người đã rời sân (AC-8.2 chỉ được kiểm ở T070, trước khi có hai thứ này).
  - AC: AC-9.5, AC-9.6, AC-9.7, AC-9.8
  - Phụ thuộc: T077

- [x] **T092** — Phát lại trận có can thiệp
  - File: `src/engine/taiLap.test.ts` *(thêm vào file T071 đã tạo)*
  - Xong khi: test xanh — chạy một trận có **ít nhất 3 can thiệp ở ba phút khác nhau** (một thay người, một đổi chỉ thị, một đổi vai trò), ghi lại `canThiep[]`, rồi chạy lại từ đầu với cùng mã trận và áp lại đúng danh sách đó: **tỉ số và từng dòng sự kiện giống hệt**. Đầu vào phát lại phải được dựng lại **từ chính `TrangThaiTran`** — `maTran`, `chienThuatXuatPhat` của hai bên, đội chủ nhà, `canThiep[]` — chứ không từ biến cục bộ của test; nếu lấy từ biến cục bộ thì test vẫn xanh kể cả khi trạng thái trận đã đánh mất chiến thuật xuất phát. Đây đúng là dòng Definition of Done thứ hai mà `spec.md` mục 7 đã ghi sẵn từ Giai đoạn 1.
  - AC: AC-8.11
  - Phụ thuộc: T071, T091

- [x] **T093** — Giao diện thay người
  - File: `src/ui/components/ThayNguoi.tsx`, sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: tạm dừng rồi thay được một cầu thủ trên sân bằng một người trong 7 dự bị; dòng sự kiện có dòng thay người tại đúng phút đó; hết 5 lượt thì nút bị chặn kèm câu nói rõ **đã hết lượt**; chỉ thao tác được với đội của người dùng.
  - AC: AC-9.5, AC-9.6, AC-9.8
  - Phụ thuộc: T091, T089

- [x] **T094** — Đổi chỉ thị và vai trò giữa trận
  - File: sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: đang tạm dừng, đổi một chỉ thị của đội mình rồi tiếp tục, và các phút sau diễn ra theo cấu hình mới; **các dòng đã qua không đổi một chữ**; đội còn lại không đổi được gì.
  - AC: AC-9.7, AC-9.8
  - Phụ thuộc: T093

- [x] **T095** — So sánh hai lần chạy cùng mã trận
  - File: sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: chạy lại cùng một mã trận sau khi đã đổi chiến thuật thì hiện bảng so hai kết quả của **cùng mã trận đó** (tỉ số, số cú sút, số cơ hội rõ ràng — lấy từ `thongKe`, không đếm lại từ dòng sự kiện); ghi rõ trong mô tả commit rằng kết quả cũ chỉ giữ **trong phiên làm việc**, đóng app là mất — quyết định D31, phần bền thuộc Giai đoạn 4.
  - AC: AC-8.12
  - Phụ thuộc: T094
  - **Hai lỗi phát hiện ở T098 khi kiểm tay, đã sửa trong phạm vi chính dòng "Xong khi" này:**
    1. Màn chọn cặp đấu sinh mã mới mỗi lần mở, nên **không có đường nào chạy lại cùng một mã** — bảng so sánh đúng về code nhưng người dùng không với tới. Đã cho sửa trực tiếp ô mã trận (kiểm bằng `laMaTranHopLe`, chặn nút bắt đầu khi mã sai) và mở màn với mã của lần chạy trước. Chạm thêm `src/ui/pages/ChonCapDau.tsx` và `src/ui/strings.ts`.
    2. Trang trận đọc `ketQuaTruoc` **thẳng từ store** trong lúc chính nó ghi kết quả lần này vào đúng ô đó, nên bảng đem trận vừa xong so với chính nó — hai cột luôn bằng nhau. Đã chụp kết quả lần trước vào một `useRef` ở lượt vẽ đầu.
  - Kiểm tay lại ngày 2026-10-28: cùng mã `K7M2R9XQ4B`, Thành Vinh pressing thấp ra 5–2, đổi sang pressing cao ra 4–2, và bảng hiện đúng hai con số khác nhau.

- [x] **T096** — Trường hợp biên: thủ môn nhận thẻ đỏ
  - File: sửa `src/engine/tran.ts`, sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: thủ môn nhận thẻ đỏ thì người dùng phải chọn một cầu thủ trên sân vào bắt gôn; người đó bị tính **mức sai nặng**; nếu còn lượt thay thì đưa được thủ môn dự bị vào thay một cầu thủ khác.
  - Ghi chú: dòng này nằm ở `spec.md` mục 5 (trường hợp biên), không phải một AC riêng — nhưng Definition of Done của spec đòi các trường hợp biên mục 5 được xử lý.
  - **Hai file ngoài danh sách đã chạm, và lý do:** `src/ui/strings.ts` (mọi câu tiếng Việt ở một chỗ theo P8, không được viết thẳng vào trang) và `src/engine/thuMonTheDo.test.ts` (12 test để kiểm chứng chính dòng "Xong khi" ở trên).
  - **Một chỗ spec nói chưa đủ rõ, đã chọn cách đọc nào:** câu của mục 5 chỉ nói thủ môn dự bị "vào thay một cầu thủ khác", không nói ai giữ găng sau đó. Để nguyên theo chữ thì thủ môn dự bị đứng ngoài khung và bị trừ mức sai nặng, còn cầu thủ sân vẫn bắt gôn — vô lý. Nên `vao-bat-gon` được làm thành phép **đổi chỗ**: người đang bắt gôn, nếu còn trên sân, nhận lại ô của người vừa vào khung. Cùng một can thiệp vì thế dùng được cả lúc khung trống (ngay sau thẻ đỏ) và lúc thủ môn dự bị đã vào sân cần nhận găng. Nếu cách đọc này sai ý, sửa `spec.md` mục 5 rồi sửa lại engine.
  - Phụ thuộc: T093

- [x] **T097** — Đo ngân sách chạy hết trận
  - File: `src/engine/hieuNang.test.ts`
  - Xong khi: đo `chayHetTran` trên 20 mã trận bằng `performance.now`, ghi **số thật** (trung bình và lớn nhất) vào mô tả commit; test khẳng định mỗi trận **dưới 200ms trong môi trường test**. Ngưỡng này nghiêm hơn ngân sách 3 giây của spec rất nhiều, vì 3 giây là cho máy người dùng kèm cả giao diện và sân 2D của Giai đoạn 4 — cảnh báo sớm thì mới còn chỗ xoay (rủi ro R12).
  - Phụ thuộc: T091

- [x] **T098** — Kiểm tay 26 AC của Giai đoạn 3
  - File: `specs/001-football-team-sim/spec.md` (tick các ô AC trong phạm vi)
  - Xong khi: 26 AC của US-8 và US-9 được tự tay kiểm trên ứng dụng đang chạy và tick; **tick lại AC-5.7 thành trọn** (phần chặn giả lập đã xong ở T086), tick **AC-3.5** và **AC-3.7** thành trọn; kiểm tay bốn việc chỉ kiểm tay mới thấy — xem trọn một trận rồi tạm dừng / đổi tốc độ / chạy hết; thay người phút 60 rồi thấy tên người mới ở các phút sau; đổi chỉ thị giữa trận rồi đối chiếu các dòng đã qua không đổi; hai đội trùng màu áo thì tự đổi áo phụ. Ghi số đo hiệu năng của T097 vào mô tả commit.
  - **Hai AC vẫn KHÔNG tick được, và đó là đúng:** AC-4.2 và AC-1.5 còn phần lịch sử trận đấu, mà lịch sử là AC-11.7 thuộc Giai đoạn 4. `spec.md` đang ghi nhầm hai phần đó là "thuộc GĐ3" — xem `plan.md` mục III.0.
  - AC: toàn bộ AC-8.x và AC-9.x, cộng AC-3.5, AC-3.7, AC-5.7
  - Phụ thuộc: T072, T078, T080, T081, T082, T083, T090, T092, T095, T096, T097
  - **Đã kiểm tay ngày 2026-10-28** trên `localhost:5173` với ba đội 18 người (Sông Hàn 15 điểm mọi chỉ số, Thành Vinh 10, Hải Phòng 12 và trùng màu áo chính với Sông Hàn) cộng một đội 5 người để thử phần chặn. Không có lỗi nào trong console suốt lượt kiểm.
  - Số đo T097: chạy hết trận trên 20 mã — **trung bình 4.0ms, lớn nhất 6.8ms**, ngân sách 200ms. Tạo trận 0.08ms.
  - **Một phát hiện CHƯA sửa, cần một task riêng:** `congThongKeCong` cộng `cuSut` và `coHoiRoRang` bằng **cùng một điều kiện** `kq.ketCuc === 'dut-diem'` (`src/engine/tran.ts`), nên hai con số luôn bằng nhau — bảng so sánh của AC-8.12 hiện hai dòng trông như hai chỉ tiêu nhưng thực chất là một. AC-8.2 lại coi "cơ hội rõ ràng" là một loại riêng. Sửa chỗ này là đổi ngữ nghĩa engine và sẽ kéo theo các số đo của bốn test so sánh, nên **không tự sửa trong Giai đoạn 3** — xin một task trong plan Giai đoạn 4.

---

## Phase 15 — Lát 13: Thống kê thật và sửa hai lỗi engine

Kết thúc phase: chưa có màn hình mới, nhưng dòng tường thuật có thêm loại
**cứu thua** chưa từng hiện ra trong bất kỳ trận nào trước đây, và ba bộ đếm
của mỗi bên không còn trùng nhau. Phase này đi trước vì mọi thứ của Giai đoạn
4 dựa trên bộ đếm mới.

> **Phase này đổi thứ tự tiêu thụ `Rng`** (quyết định D34), nên **mã trận lưu
> từ Giai đoạn 3 không còn phát lại ra đúng trận cũ** — rủi ro R16, đã công bố
> ở đầu `plan.md`. Trước khi bắt đầu T099, nhắc người dùng xuất tệp sao lưu.

- [x] **T099** — Tách `cuSut` và `coHoiRoRang` thành hai chỉ tiêu thật
  - File: sửa `src/engine/tran.ts`, `src/engine/thongKeBen.test.ts`, sửa `src/engine/tran.test.ts`
  - Xong khi: `cuSut` đếm **mọi** chuỗi kết thúc `dut-diem`; `coHoiRoRang` tính bàn thắng là cơ hội rõ ràng, còn cú sút không thành bàn thì **rút thêm một lần** với xác suất tăng theo sức mạnh bên tấn công — quyết định D37; test xanh trên 20 mã trận: `banThang ≤ coHoiRoRang ≤ cuSut` ở **mọi** trận, `coHoiRoRang` **nhỏ hơn hẳn** `cuSut` ở ít nhất 15 trong 20 trận (nếu luôn bằng nhau thì lỗi cũ vẫn còn, chỉ đổi chỗ), và đội mạnh hơn có **tỉ lệ** cơ hội rõ ràng trên tổng cú sút cao hơn đội yếu qua 20 trận.
  - AC: AC-11.2
  - Phụ thuộc: —
  - **Sửa lúc vào code:** bản plan trước chọn `laVungDutDiem(kq.vungKetThuc)` làm tiêu chí. Đọc `chuoiBong.ts:156` thì thấy đó là chỗ **duy nhất** trả về `dut-diem` và nó nằm trong `if (laVungDutDiem(vung) && …)`, nên tiêu chí ấy **luôn đúng** và hai bộ đếm vẫn bằng nhau — xem D37b. Người dùng chốt phương án rút thêm một lần.
  - **Số đo thật:** 20 mã trận cho 325 cú sút và 198 cơ hội rõ ràng (61%), tách được ở **20/20** trận. Đội 17 điểm có tỉ lệ cơ hội rõ ràng 73.1% còn đội 8 điểm 46.7%.
  - **Một file ngoài danh sách đã chạm, và lý do:** `src/engine/tran.test.ts` — phép "trận hoà kết thúc là hoà" lọc trận hoà trong **10 mã cố định**, và sau khi đổi thứ tự tiêu thụ `Rng` thì 10 mã đó không còn trận hoà nào. Đo trên 200 mã thì tỉ lệ hoà của engine là **21%** (bóng đá thật khoảng 25%), nên đây là lỗi **mẫu quá nhỏ** chứ không phải engine lệch. Đã nới mẫu lên 40 mã thay vì đi tìm một mã tình cờ ra hoà — cách sau sẽ đỏ lại ở T101 và T102.

- [x] **T100** — Tỉ lệ kiểm soát bóng đếm theo số bước
  - File: sửa `src/engine/tran.ts`, `src/engine/thongKeBen.test.ts`
  - Xong khi: `ThongKeBen.soBuocGiuBong` cộng dồn `kq.cacHanhDong.length` của bên cầm bóng (quyết định D36); test xanh — cùng một đội với chỉ thị `toc-do-chuyen-bong: cham` có **tỉ lệ bước cao hơn** so với chính đội đó chỉ thị `nhanh`, cùng đối thủ và trung bình qua 20 mã trận. Đây là phép chứng minh con số kiểm soát bóng **không** phải 50/50 cố định.
  - AC: AC-11.2
  - Phụ thuộc: T099
  - **Số đo thật:** cùng đội, cùng đối thủ, chỉ đổi chỉ thị — chuyền **chậm** giữ bóng **54.2%**, chuyền **nhanh** 46.0%. Chênh 8.2 điểm phần trăm, tức con số kiểm soát bóng phản ứng thật với chiến thuật chứ không mắc ở 50/50.

- [x] **T101** — Cứu thua sống thật, và `sutTrungDich` hết bằng số bàn thắng
  - File: sửa `src/engine/tran.ts`, `src/engine/cuuThua.test.ts`
  - Xong khi: chuỗi kết thúc `dut-diem` mà không thành bàn thì rút **đúng một lần** để chia thành "bị thủ môn cứu" hay "chệch khung"; bên sút cộng `sutTrungDich`, và `loaiCuaChuoi` trả về `'cuu-thua'` cho trường hợp bị cứu; người ghi `canCuu` là người **đang trong khung**, tra bằng `nguoiTrongKhung` đã có trong `tran.ts` từ T096, và **khung trống thì cú sút không tính là bị cứu** (quyết định D38); test xanh — trên 20 mã trận loại sự kiện `cuu-thua` xuất hiện ở **ít nhất 15 trận**, và `banThang ≤ sutTrungDich ≤ cuSut` ở mọi trận. Mẫu câu tiếng Việt cho `cuu-thua` đã có sẵn từ Giai đoạn 3, không viết thêm.
  - AC: AC-11.2
  - Phụ thuộc: T099
  - **Số đo thật:** 20/20 trận có pha cứu thua, tổng 156 dòng. Sút trúng đích nhiều hơn số bàn ở **39/40** lượt (20 trận × 2 bên) — trước T101 con số đó là 0/40.
  - **Hai file ngoài danh sách đã chạm:** `src/engine/cuuThua.test.ts` (file test của chính task này, plan có ghi) và `src/engine/tran.test.ts` — phép "số bàn thắng khớp với sút trúng đích" ở đó **ghi cứng đúng cái lỗi** T101 sửa (`sutTrungDich === banThang`), nên phải đổi thành dải `banThang ≤ sutTrungDich ≤ cuSut`.
  - **Một phần CHƯA làm, có lý do:** phép so "thủ môn giỏi cứu nhiều hơn" trên cả trận cần ghi đè riêng ba chỉ số của thủ môn, mà `__fixtures__/doiMau.ts` chưa có đường đó và file đó không nằm trong danh sách T101. Mức kiểm hiện tại — `xacSuatBiCuu` đơn điệu, và sút vào khung trống thì không cú nào bị cứu — đủ cho dòng "Xong khi". Phần so cả trận để T109 làm cùng lúc với việc chấm điểm thủ môn.

- [x] **T102** — Gán hành động cho cầu thủ cụ thể
  - File: sửa `src/engine/tran.ts`, `src/engine/ganHanhDong.test.ts`
  - Xong khi: mỗi chuỗi bóng gán được **người kiến tạo** (bên cầm bóng), **người cướp bóng** (bên phòng ngự, khi chuỗi kết thúc `mat-bong`) và **người phạm lỗi** (bên phòng ngự, khi kết thúc `pham-loi`), rút từ cùng một `Rng`, cân theo sức mạnh trong tình huống **và** theo mức phù hợp của vai trò với vùng xảy ra — quyết định D34; test xanh — qua 20 trận, tiền vệ cánh kiến tạo nhiều hơn trung vệ, và trung vệ cướp bóng nhiều hơn tiền đạo (nếu rút đều tay thì hai phép này đỏ); mọi id được gán đều **có trên sân ở đầu phút đó**, kiểm theo đúng cách đã làm ở `canThiep.test.ts`.
  - AC: AC-11.3
  - Phụ thuộc: T101

- [x] **T102b** — Gán người cho từng bước chuỗi bóng, để có tỉ lệ chuyền
  - File: sửa `src/engine/tran.ts`, `src/engine/ganHanhDong.test.ts`
  - Xong khi: **mỗi bước** `chuyen` / `re-bong` của chuỗi được gán một người, rút từ những ô **tại hoặc kề** vùng của bước đó và cân theo sức mạnh; không ai khớp thì rút trong cả 11 người trên sân; `chuyenThanhCong` cộng theo bước, còn `chuyenHong` cộng **một lần cho người giữ bước cuối** khi chuỗi kết thúc `mat-bong` — quyết định D34c và D34d; test xanh — sau một trận, **cả 11 người trên sân** đều có `chuyenThanhCong + chuyenHong > 0`; tiền vệ trung tâm có số đường chuyền **nhiều hơn** tiền đạo qua 20 trận.
  - AC: AC-11.3
  - Phụ thuộc: T102
  - **Task thêm sau `/analyze`:** AC-11.3 liệt kê **tỉ lệ chuyền chính xác** là một đầu vào của điểm, nhưng T102 chỉ gán 4 vai mỗi chuỗi trong khi một chuỗi có tới 12 bước — 9 trong 11 người sẽ có `chuyenThanhCong = 0` suốt trận. Và `chuyenHong` **không** dẫn xuất được từ `cacHanhDong`: `chuoiBong.ts:131` `return` ngay khi mất bóng, trước khi push hành động (D34d).

- [x] **T103** — `ThongKeCauThu` cho cả 18 người mỗi bên
  - File: sửa `src/engine/tran.ts`, `src/engine/thongKeCauThu.test.ts`
  - Xong khi: mỗi cầu thủ có `banThang`, `kienTao`, `cuSut`, `sutTrungDich`, `chuyenThanhCong`, `chuyenHong`, `cuopBong`, `matBong`, `phamLoi`, `canCuu`; `ThongKeBen` thêm **tổng của bên** cho `chuyenThanhCong` / `chuyenHong` để phép kiểm dưới đây phủ được cả phần chuyền; trường `dongGopTheoCauThu` **GIỮ NGUYÊN** (quyết định D33b — nó là phép đo duy nhất của AC-8.5 ở `sosanh.saiViTri.test.ts:30`); test xanh — với **mỗi** chỉ tiêu, tổng theo 18 cầu thủ bằng đúng tổng theo bên (phép bắt lỗi gán sai người, kiểu lỗi đọc code không thấy); người đang trong khung có `canCuu` > 0 ở ít nhất một trong 20 trận.
  - AC: AC-11.3
  - Phụ thuộc: T102b
  - **Sửa sau `/analyze`:** bản đầu ghi là bỏ `dongGopTheoCauThu`. Bỏ nó làm đỏ `sosanh.saiViTri.test.ts` — test P5 duy nhất chứng minh AC-8.5 — và `tran.test.ts:274` cũng đọc trường đó. Giữ lại rẻ hơn mọi phương án thay thế.

- [x] **T104** — Phút vào sân và phút ra sân
  - File: sửa `src/engine/tran.ts`, `src/engine/thongKeCauThu.test.ts`
  - Xong khi: `phutVao` / `phutRa` trong `ThongKeCauThu`, `null` nghĩa là đá từ đầu / tới hết trận; engine đặt chúng cả khi **thay người** và khi **thẻ đỏ** (quyết định D50); test xanh — thay người ở phút 60 thì người ra có `phutRa` 60 và người vào có `phutVao` 60; người nhận thẻ đỏ ở phút 70 có `phutRa` 70 **dù không có can thiệp nào**; một người vào sân từ băng ghế rồi bị đuổi có **cả hai** mốc.
  - AC: AC-11.5
  - Phụ thuộc: T103

- **Số đo thật của T102 / T102b / T103 / T104** (20 mã trận, trừ chỗ ghi khác):
  - kiến tạo: tiền vệ cánh **9**, trung vệ **0** — vùng siết chặt nhất ở trong vòng cấm, đúng chỗ cần siết.
  - đường chuyền: tiền vệ trung tâm **1070**, tiền đạo **313** (hơn ba lần).
  - cướp bóng: trung vệ **348**, tiền đạo **331**. Tách **yếu**, và đó là đúng theo thiết kế: bóng luôn bắt đầu ở dải 1 nên phần lớn pha mất bóng xảy ra ở dải 1–2, nơi lật vùng sang bên phòng ngự thì gần như cả đội hình đều "ở gần" — chỉ thủ môn là không. Một pha mất bóng ở giữa sân thì ai giành lại cũng hợp lý, model không nên khẳng định hơn thế.
  - thủ môn có pha cứu thua ở **38/40** lượt; **9** người bị đuổi đã kiểm mốc ra sân.
  - người vào sân từ băng ghế rồi bị đuổi: gặp ở **4/120** mã. Ở 20 mã thì **0 lần** — phép kiểm xanh rỗng, nên mẫu đã nới lên 120.
- **Năm test cũ phải sửa vì T102 đổi dãy số.** Không hạ ngưỡng nào; chỉ nới mẫu, nên các test đều **mạnh hơn** trước:
  - `sosanh.saiViTri.test.ts` 10 → **40** mã. Đo thật: ở 10 mã thứ tự bốn mức đảo lộn (57.2 / 34.0 / 38.3 / 37.2), ở 40 mã giảm dần nghiêm ngặt (44.5 / 35.2 / 31.9 / 27.9), ở 100 mã cũng vậy (42.7 / 39.2 / 35.9 / 25.2). Bản cũ xanh nhờ may.
  - `sosanh.sanNha.test.ts` 60 → **200** mã. Hiệu số sân nhà thật là **+0,58** bàn/trận (đo trên 300 mã), nhưng mẫu 60 cho +1,02, vượt trần "nhỏ hơn 1 bàn" của chính test.
  - `sosanh.doiManhHon.test.ts` 60 → **200** mã. Hai đội giống hệt nhau trên sân trung lập: **120-72-108** ở 300 mã (thắng 40.0%, hiệu số +0,12) — **không có thiên vị giữa hai phía**; mẫu 60 cho 17-19-24, tức 28%, thấp hơn ngưỡng 33% thuần do nhiễu.
  - `sosanh.pressing.test.ts` 10 → **60** mã. Hai cực vẫn tách rất rộng (cướp bóng dải cao 29.0 so với 15.8), chỉ phép "mức trung bình nằm giữa" là đảo chiều ở mẫu nhỏ (9.9 so với 9.7).
  - `ui/tuongThuat.test.ts` tầng 2: 20 → **80** trận. `the-do` là loại thưa nhất, **0,49 dòng/trận** (97 dòng trên 200 trận), nên đòi đủ 4 mẫu từ 13–17 lần rút là phép có ~3% khả năng đỏ oan — và nó đỏ thật hai lần. Đã kiểm phân bố chỉ số mẫu câu trên 200 trận: **24/18/30/25**, tức đều, không mẫu nào bị bỏ quên.
- **Hai file ngoài danh sách đã chạm:** `src/engine/vung.ts` (thêm `vungCuaViTri` — D34c cần biết ô nào đứng ở vùng nào, mà `vung.ts` là nơi giữ luật lưới sân) và `src/engine/canThiep.test.ts` (phép "không dòng nào nhắc tên người đã rời sân" miễn trừ theo *loại sự kiện* thay vì theo *người*, nên nó đỏ ngay khi một người mới vào sân kịp cướp được bóng trong chính phút đó — `buocTiep` áp hàng đợi TRƯỚC khi mô phỏng theo D30b, nên người đó có mặt thật).
- **Một chỗ sửa thêm, nằm trong `tran.ts`:** người ăn thẻ giờ là **đúng người vừa phạm lỗi**. Trước đây `thuRutThe` tự rút người riêng, nên cầu thủ A phạm lỗi mà cầu thủ B bị ghi tên vào sổ.

- [x] **T105** [P] — Đóng số phiên bản engine vào trận
  - File: sửa `src/engine/tran.ts`, `src/engine/taiLap.test.ts`
  - Xong khi: `PHIEN_BAN_ENGINE = 2` được xuất ra, và `TrangThaiTran.phienBanEngine` mang đúng giá trị đó (quyết định D35); test xanh — `taoTran` đặt đúng số, và số đó đi qua `chayHetTran` không đổi.
  - AC: AC-11.7, AC-8.11 *(phần công bố giới hạn phát lại)*
  - Phụ thuộc: —

- [x] **T106** [P] — Đường đi của bóng trong sự kiện
  - File: sửa `src/engine/suKien.ts`, sửa `src/engine/tran.ts`, `src/engine/suKien.test.ts`
  - Xong khi: `SuKien.duongBong: readonly VungSan[]` lấy từ `kq.cacHanhDong` của chính chuỗi đó (quyết định D40); test xanh — mọi vùng trong `duongBong` đều **kề nhau** theo luật của `vung.ts`; vùng cuối của `duongBong` **bằng** trường `vung` của sự kiện; sự kiện mốc (`bat-dau`, `het-hiep`, `ket-thuc`) có `duongBong` rỗng; **chạy lại cùng mã trận vẫn ra `duongBong` giống từng phần tử** (không tốn lần rút nào, nên không được làm lệch dãy số).
  - AC: AC-10.2
  - Phụ thuộc: —

- [x] **T107** — Gỡ màu áo khỏi engine
  - File: sửa `src/engine/tran.ts`, `src/ui/mauAo.ts`, sửa `src/ui/pages/ChonCapDau.tsx`, `src/ui/mauAo.test.ts`
  - Xong khi: trường `mauAoDangDung` **bị bỏ khỏi** `BenTran`; `ui/mauAo.ts` xuất `aoDangDung(nha, khach)` dùng lại `trungMauAo` của `domain/colors.ts` và trả về bên nào mặc áo nào cộng tên đội phải đổi áo; `ChonCapDau` dùng hàm này thay cho logic tại chỗ (quyết định D39); test xanh — hai màu trùng thì **đúng một** bên đổi sang áo phụ, hai màu khác nhau thì không bên nào đổi; `npx tsc --noEmit` sạch sau khi bỏ trường.
  - AC: AC-3.7 *(kiểm lại — Giai đoạn 3 đã đóng, phase này chỉ dọn chỗ ở)*
  - Phụ thuộc: —
  - **Một file ngoài danh sách:** `src/engine/suKien.test.ts` (T106 thêm trường vào `SuKien` nên dữ liệu mẫu của file đó thiếu trường mới) và `src/engine/taiLap.test.ts` (T105 thêm test cho `PHIEN_BAN_ENGINE`). Cả hai là file test của chính thứ vừa đổi.
  - Kiểm tay sau T107 trên `localhost:5173`: hai đội trùng màu áo chính vẫn báo đúng "Hải Phòng FC sẽ ra sân với áo phụ", trận chạy hết cho 2–1 với 82 dòng, và **dòng cứu thua hiện ra thật** ("thủ môn kịp đẩy bóng ra") — thứ chưa từng xuất hiện trong bất kỳ trận nào trước Phase 15. Không có lỗi nào trong console.

- [x] **T108** — Chạy lại bốn test so sánh của P5 và ghi lại số đo
  - File: `src/engine/sosanh.tanCongBien.test.ts`, `src/engine/sosanh.pressingCao.test.ts`, `src/engine/sosanh.saiViTri.test.ts`, `src/engine/sosanh.doiManhHon.test.ts`
  - Xong khi: cả bốn test **xanh** với dãy số mới, và **số đo thật** (con số từng test in ra) được ghi vào mô tả commit để so với số của Giai đoạn 3. Nếu một test đỏ thì **cân bằng lại engine**, không hạ ngưỡng — ngưỡng trong bốn test đó đến từ AC, không đến từ thuận tiện (rủi ro R17).
  - AC: AC-8.3, AC-8.4, AC-8.5, AC-8.8 *(kiểm lại sau khi đổi dãy số)*
  - Phụ thuộc: T099, T100, T101, T102, T102b, T103, T104, T107
  - **Số đo thật sau khi đổi dãy số** (so với số của Giai đoạn 3 trong ngoặc):
    - AC-8.3 tạt cánh: biên **41.8** so với trung lộ **9.8**, tỉ lệ **4.27 lần** — AC đòi hơn 1,5 lần.
    - AC-8.4 pressing cao: cướp bóng dải cao **32.6** so với **14.6**; bị thoát xuống **10.3** so với **6.0** — cả hai chiều đều đúng hướng.
    - AC-8.5 bốn mức sai vị trí: **44.5 / 35.2 / 31.9 / 27.9** (Giai đoạn 3: 33.8 / 31.9 / 29.3 / 22.7), giảm dần nghiêm ngặt.
    - AC-8.8 đội hơn 5 điểm: **172-18-10** trên 200 trận (86% thắng; Giai đoạn 3 đo 88% trên 60 trận). Mẫu 10 trận mà AC yêu cầu: **8** thắng, trên ngưỡng 7.
    - Hiệu năng: chạy hết trận **trung bình 6.8ms, lớn nhất 9.9ms** (trước Phase 15: 4.0ms / 6.8ms). Gán người cho từng bước đắt thêm chừng 70%, nhưng ngân sách test là 200ms nên vẫn còn rất rộng — đây là câu trả lời cho rủi ro R22.
  - **Một test được làm CHẶT hơn, không phải nới:** phép "không thiên vị giữa hai phía" của AC-8.8 trước đây đặt **sàn tỉ lệ thắng 0,33**. Tỉ lệ thắng thật khi hai đội giống hệt nhau là chừng 0,34–0,40 (phần còn lại là hoà), nên cái sàn đó chỉ cách giá trị thật khoảng 1σ ở mẫu 200 trận — tức ~12% khả năng đỏ oan dù engine hoàn toàn cân, và nó đã đỏ. Đổi sang đo **chênh lệch thắng–thua** (đo thật: **10.0%**, ngưỡng 15%, cách giá trị thật 2,4σ), vì đó mới là câu hỏi "có bên nào được ưu ái không".
  - **Sửa sau `/analyze`:** bản đầu chỉ ghi `Phụ thuộc: T107` — việc gỡ màu áo, chẳng liên quan tới dãy số. Những task thật sự đổi dãy số và đổi bộ đếm là T099–T104, nên nếu chỉ chờ T107 thì số đo ghi vào commit là số của một engine nửa vời, đúng thứ R17 sinh ra để chặn.

## Phase 16 — Lát 14: Báo cáo sau trận

Kết thúc phase: xem trọn một trận, đọc báo cáo đầy đủ — tỉ số, người ghi bàn
kèm phút, sáu chỉ tiêu mỗi bên, điểm từng cầu thủ kèm bảng giải thích — rồi
đấu lại ngay bằng một nút.

- [ ] **T109** — Chấm điểm cầu thủ, kèm bảng giải thích
  - File: `src/engine/diemCauThu.ts`, `src/engine/diemCauThu.test.ts`
  - Xong khi: `chamDiem(tk, viTriDaDa)` trả về `{ diem, cacThanhPhan }`, mỗi thành phần có tên tiêu chí, số liệu thật và điểm cộng/trừ (quyết định D49); bảy tiêu chí mà AC-11.3 liệt kê đều có nguồn thật: bàn thắng, kiến tạo, sút trúng đích, **tỉ lệ chuyền chính xác** (từ T102b), cướp bóng, mất bóng, phạm lỗi; test xanh — điểm **bắt đầu từ 6.0** khi mọi số liệu bằng 0; điểm luôn nằm trong 1–10 kể cả với số liệu cực đoan; **tổng các thành phần cộng đúng bằng** `diem` (nếu lệch thì bảng giải thích đang nói dối); cùng một bộ số liệu mà khác vị trí thì ra **điểm khác nhau** — đó là phần "cân theo vị trí" của AC-11.3.
  - AC: AC-11.3
  - Phụ thuộc: T104

- [ ] **T110** — Đóng gói báo cáo sau trận
  - File: `src/engine/baoCao.ts`, `src/engine/baoCao.test.ts`
  - Xong khi: `dungBaoCao(tt)` là hàm **thuần**, không I/O, trả về `BaoCaoTran` gồm tỉ số, danh sách người ghi bàn kèm phút, sáu chỉ tiêu mỗi bên (sút, sút trúng đích, kiểm soát bóng, cơ hội rõ ràng, thẻ vàng, thẻ đỏ) và điểm từng cầu thủ đã ra sân; test xanh — số người ghi bàn **bằng đúng tổng tỉ số**; hai tỉ lệ kiểm soát bóng cộng lại bằng 100%; `coHoiRoRang ≤ cuSut` và `banThang ≤ sutTrungDich ≤ cuSut`; **không** chấm điểm cho người chưa ra sân.
  - AC: AC-11.1, AC-11.2
  - Phụ thuộc: T109

- [ ] **T111** — Màn báo cáo: tỉ số, người ghi bàn, chỉ tiêu hai bên
  - File: `src/ui/components/BaoCaoSauTran.tsx`, `src/ui/components/DanhSachGhiBan.tsx`, sửa `src/ui/pages/TrangTran.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: trận kết thúc thì màn trận hiện báo cáo ngay bên dưới; thấy đúng tỉ số, từng người ghi bàn kèm phút của **cả hai** đội, và sáu chỉ tiêu mỗi bên; dòng tường thuật đầy đủ vẫn xem lại được tại chỗ bằng `DongTuongThuat` đã có; mọi nhãn tiếng Việt và nằm trong `strings.ts` (P8).
  - AC: AC-11.1, AC-11.2, AC-11.4
  - Phụ thuộc: T110

- [ ] **T112** — Bảng điểm cầu thủ, mở ra xem được số liệu
  - File: `src/ui/components/BangDiemCauThu.tsx`, sửa `src/ui/components/BaoCaoSauTran.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: mỗi cầu thủ đã ra sân có một dòng điểm 1–10; bấm vào một dòng thì **mở ra bảng các thành phần** đã cộng/trừ kèm số liệu thật — đó là phần "người dùng phải xem được những số liệu nào đã dẫn tới điểm đó" của AC-11.3; người vào sân từ băng ghế hiện rõ **đá từ phút nào tới phút nào** (AC-11.5); mở/đóng bảng làm được bằng bàn phím (P9).
  - AC: AC-11.3, AC-11.5
  - Phụ thuộc: T111

- [ ] **T113** — Đấu lại ngay cùng cặp đấu
  - File: sửa `src/ui/components/BaoCaoSauTran.tsx`, sửa `src/hooks/useMatch.ts`, sửa `src/ui/strings.ts`
  - Xong khi: màn báo cáo có hai nút — "đấu lại cùng mã trận" và "đấu lại với mã mới" — cùng dựng lại `CauHinhTran` từ trận vừa xong, **không** quay về màn chọn cặp đấu và **không** phải đăng ký lại 11+7 (quyết định D47); bấm nút cùng mã ra **đúng tỉ số cũ**; bấm nút mã mới ra trận khác và bảng so sánh của AC-8.12 **không** hiện (vì khác mã).
  - AC: AC-11.6
  - Phụ thuộc: T111

## Phase 17 — Lát 15: Sân 2D

Kết thúc phase: xem trận trên sân 2D với đủ 22 điểm, thấy pha bóng dịch
chuyển theo tình huống, hoặc ẩn sân đi và chỉ đọc dòng tường thuật.

- [ ] **T114** — Sân 2D với một điểm cho mỗi người trên sân
  - File: `src/ui/components/San2D.tsx`, sửa `src/ui/pages/TrangTran.tsx`
  - Xong khi: SVG (quyết định D41) vẽ **một điểm tròn cho mỗi người đang trên sân** của cả hai đội — 22 lúc khai cuộc — đặt theo `chienThuatHienTai.oVien` và chỉ thị `do-cao-doi-hinh`, toạ độ suy từ lưới 12 vùng của D23; màu lấy từ `ui/mauAo.ts` của T107 nên hai đội trùng màu áo vẫn phân biệt được (AC-3.7); mỗi điểm có `aria-label` tiếng Việt gồm tên và số áo (P9); đội đá thiếu người sau thẻ đỏ thì **thiếu đúng số điểm đó**, còn 21.
  - AC: AC-10.1
  - **Cách đọc con số 22 của AC-10.1, chốt sau `/analyze`:** cả hai đội có 18+18 = 36 người nên "toàn bộ cầu thủ hai đội" không hiểu theo nghĩa chặt được; 22 là **số người trên sân lúc khai cuộc**. Nếu người dùng muốn hiểu khác thì sửa `spec.md` trước rồi sửa task này.
  - Phụ thuộc: T107
  - Ghi chú: không dùng thư viện đồ hoạ nào (P4, D41).

- [ ] **T115** — Người tham gia dịch tới chỗ bóng, kèm đường bóng
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: khi dòng tường thuật sang tình huống mới, những người có tên trong `cacCauThu` của sự kiện **dịch tới** vùng của sự kiện còn người còn lại **giữ chỗ đội hình**; `duongBong` của T106 được vẽ thành đường qua các vùng; di chuyển bằng **CSS transition**, không có vòng lặp animation (D41); tạm dừng trận thì sân **đứng im ở đúng tình huống đó** — AC-10.4 không cần thêm code, nhưng phải kiểm tay thật.
  - AC: AC-10.2, AC-10.4
  - Phụ thuộc: T114, T106

- [ ] **T116** — Làm nổi bật người đang tham gia tình huống
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: người tham gia có **viền dày lên cộng nhãn chữ** (số áo in đậm và thêm một dấu), không chỉ đổi màu (quyết định D42); kiểm chứng bằng cách xem sân ở **chế độ grayscale** của trình duyệt — vẫn phân biệt được người tham gia với người còn lại. Đây là phép kiểm P9 đòi, vì nền là màu áo người dùng tự chọn.
  - AC: AC-10.3
  - Phụ thuộc: T115

- [ ] **T117** [P] — Ẩn và hiện sân 2D, nhớ lựa chọn
  - File: sửa `src/ui/pages/TrangTran.tsx`, `src/services/tuyChonRepo.ts`, `src/services/tuyChonRepo.test.ts`, sửa `src/ui/strings.ts`
  - Xong khi: một nút ẩn/hiện sân; lựa chọn lưu trong store `meta` đã có qua `tuyChonRepo` (quyết định D51 — **không** dùng `localStorage`); test xanh cho vòng tròn ghi/đọc tuỳ chọn; kiểm tay — ẩn sân, **tải lại trang**, mở lại trận thì sân vẫn ẩn.
  - AC: AC-10.6
  - Phụ thuộc: T114

- [ ] **T118** — Chạy hết trận không bị sân 2D làm chậm
  - File: sửa `src/ui/pages/TrangTran.tsx`, sửa `src/ui/components/San2D.tsx`
  - Xong khi: khi bấm "chạy hết trận", giao diện **không vẽ** trạng thái trung gian — engine chạy một lèo rồi vẽ **đúng một lần** ở cuối (quyết định D43); đo bằng `performance.now` trên giao diện với sân **đang bật**: từ lúc bấm tới lúc báo cáo hiện ra **dưới 3 giây** (ngân sách spec mục 6), ghi số thật vào mô tả commit. Đường lùi nếu vỡ ngân sách: tự ẩn sân khi chạy hết trận kèm một dòng nói rõ (rủi ro R19).
  - AC: AC-10.5
  - Phụ thuộc: T116, T117

## Phase 18 — Lát 16: Lịch sử 20 trận

Kết thúc phase: đóng rồi mở lại ứng dụng, 20 trận gần nhất còn nguyên, mở
lại đọc được báo cáo cũ; xuất tệp sao lưu rồi nhập lại thì lịch sử về đủ.

> Trước khi làm T119, **nhắc người dùng xuất tệp sao lưu**: tăng `DB_VERSION`
> **không lùi được bằng `git revert`**, vì bản code cũ yêu cầu phiên bản thấp
> hơn và IndexedDB từ chối mở database có phiên bản cao hơn (rủi ro R18, cảnh
> báo đã ghi sẵn trong `db.ts` từ Giai đoạn 1).

- [ ] **T119** — Hai store lịch sử và nâng `DB_VERSION` lên 3
  - File: sửa `src/storage/db.ts`, sửa `src/storage/db.test.ts`
  - Xong khi: **hai** store mới — `matches` (key `id`, giá trị `TranDaLuu` nặng) và `matchSummaries` (cùng `id`, index `byKetThucLuc`, giá trị `TomTatTran` nhẹ không có dòng sự kiện) theo quyết định D44b; `DB_VERSION` = **3**; bước nâng cũng **ghi lại** hàng `meta.schemaVersion` thành `SCHEMA_VERSION` mới; hai kiểu `TranDaLuu` và `TomTatTran` khai tường minh, không suy từ dữ liệu mẫu (hiến pháp mục 4); test xanh — mở database phiên bản 2 cũ rồi nâng lên 3 thì **đội, cầu thủ, ảnh và chiến thuật còn nguyên**, hai store mới rỗng, và `docSchemaVersion()` trả về số mới chứ không còn mắc ở 3.
  - AC: AC-11.7
  - Phụ thuộc: T110
  - **Sửa sau `/analyze`:** bản đầu chỉ có một store. Trang lịch sử dựng danh sách bằng `getAll('matches')` sẽ giải tuần tự **cả** dòng sự kiện của 20 trận chỉ để in ra 20 cái tỉ số — đâm vào ngân sách "mở app với 20 đội và 20 trận dưới **2 giây**" của spec mục 6. Và hàng `meta.schemaVersion` chỉ được ghi lúc tạo database (`db.ts:123`), nên máy đã có dữ liệu sẽ mãi mang số cũ.

- [ ] **T120** — `matchRepo` giữ đúng 20 trận gần nhất
  - File: `src/services/matchRepo.ts`, `src/services/matchRepo.test.ts`
  - Xong khi: `luu`, `danhSach` (mới nhất trước, **chỉ đọc `matchSummaries`** — không chạm store nặng, D44b), `doc` (đọc hàng nặng, chỉ khi mở một trận), `catConHaiMuoi` (dùng sau khi nhập gộp, D48); `SO_TRAN_GIU_LAI = 20`; ghi `matches` và `matchSummaries` **cùng một transaction** với việc xoá trận cũ nhất, để hai store không bao giờ lệch nhau (quyết định D45, D44b); test xanh — lưu 21 trận thì còn đúng 20 và trận **cũ nhất** mất; `luu` trả về danh sách trận bị loại để giao diện báo một lần; vòng tròn lưu/đọc ra **đúng từng dòng sự kiện**; `danhSach` trả về đủ 20 tóm tắt mà **không** đọc hàng nào của `matches`; hàm `xoaTheoDoi` được khai nhưng **không gọi ở đâu** — xoá đội không làm mất lịch sử, và có test khẳng định đúng điều đó (spec mục 5).
  - AC: AC-11.7
  - Phụ thuộc: T119

- [ ] **T121** — Lưu trận khi kết thúc, kèm ảnh chụp tên đội
  - File: sửa `src/hooks/useMatch.ts`, sửa `src/store/appStore.ts`, sửa `src/ui/strings.ts`
  - Xong khi: trận kết thúc thì tự lưu vào lịch sử, bản ghi giữ **cả** `teamId` **và** ảnh chụp `{ ten, mauChinh, mauPhu, logoImageId }` lúc đó (quyết định D46), cộng `baoCao` đã tính và `phienBanEngine`; lịch sử đủ 20 trận thì hiện **một** thông báo nói rõ trận nào bị loại (spec mục 5); rời trang giữa trận thì **không** lưu gì (AC-9.10 nói trận bị huỷ và không vào lịch sử).
  - AC: AC-11.7
  - Phụ thuộc: T120

- [ ] **T122** — Trang lịch sử 20 trận
  - File: `src/ui/pages/TrangLichSu.tsx`, sửa `src/App.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: trang liệt kê 20 trận gần nhất (mới nhất trước) kèm tỉ số, hai đội và mã trận; mở một trận ra đọc lại **báo cáo và toàn bộ dòng sự kiện** đã lưu; tên đội lấy từ đội **đang sống** nên đổi tên đội thì lịch sử đổi theo (AC-1.5), còn đội đã xoá thì rơi về ảnh chụp và hiện rõ là **không đấu lại được** (spec mục 5); đi lại được bằng bàn phím (P9).
  - AC: AC-11.4, AC-1.5, AC-4.2
  - Phụ thuộc: T121

- [ ] **T123** — Tệp sao lưu v4 mang lịch sử
  - File: sửa `src/storage/migrations.ts`, sửa `src/services/backupSchema.ts`, sửa `src/services/backupService.ts`, sửa `src/storage/migrations.test.ts`, sửa `src/services/backupService.test.ts`
  - Xong khi: `SCHEMA_VERSION` = **4**, thân tệp thêm `matches`, migration v3→v4 chỉ thêm `matches: []`; **đổi `backupService.ts:89`** đang ghi cứng `schemaVersion: 3` thành 4; chế độ nhập **gộp** (`CheDoNhap = 'gop'`, đã có từ Giai đoạn 1) gọi `catConHaiMuoi` để **cắt còn 20 trận mới nhất** theo `ketThucLuc`; schema zod v3 **không bị sửa**, schema v4 đặt cạnh nó (đúng cách đã ghi trong `migrations.ts`); test xanh — tệp **v1, v2, v3 vẫn nhập được** (P7) và vào với lịch sử rỗng; xuất 20 trận rồi nhập lại ra **đúng từng dòng sự kiện**; **gộp** một tệp 20 trận vào máy đang có 20 trận thì còn đúng 20 trận mới nhất, không phải 40; tệp hỏng không làm mất lịch sử đang có (P3).
  - AC: AC-4.2, AC-11.7
  - Phụ thuộc: T121
  - **Hai chỗ thêm sau `/analyze`:** (a) bỏ sót dòng 89 thì tệp v4 mang nhãn v3, lúc nhập chạy migration v3→v4 và **đặt `matches: []`** — xoá sạch lịch sử khỏi chính bản sao lưu của người dùng, trái P3; (b) gộp 20 vào 20 ra 40 là phá trần của AC-11.7, mà chế độ gộp đã tồn tại từ Giai đoạn 1 nên không thể bỏ qua.

- [ ] **T124** — Từ chối phát lại trận khác phiên bản engine
  - File: sửa `src/services/matchRepo.ts`, sửa `src/ui/pages/TrangLichSu.tsx`, sửa `src/ui/strings.ts`, sửa `src/services/matchRepo.test.ts`
  - Xong khi: trận có `phienBanEngine` khác bản đang chạy thì **vẫn xem lại được** báo cáo và dòng sự kiện đã lưu, nhưng nút đấu lại bị chặn kèm câu tiếng Việt nói rõ vì sao (quyết định D35, rủi ro R16); test xanh cho cả hai nhánh, với bản ghi phiên bản cũ **dựng tay trong test**. Đây là phần bù cho việc mã trận của Giai đoạn 3 không còn phát lại đúng.
  - AC: AC-11.7, AC-8.11 *(phần công bố giới hạn phát lại)*
  - Phụ thuộc: T122, T105
  - **Ghi nhận sau `/analyze`:** lịch sử ra đời ở chính Giai đoạn 4, nên **không bao giờ** tồn tại bản ghi thật có `phienBanEngine` cũ — hai nhánh của test phải tự dựng bản ghi đó. Điều này cũng là lý do R16 được hạ từ Cao xuống Trung bình: không có gì trong lịch sử bị hỏng, chỉ mã trận người dùng chép tay ra ngoài là hết phát lại đúng.

- [ ] **T125** — Đo kích thước tệp và kiểm tay AC-4.7
  - File: `specs/001-football-team-sim/spec.md` (tick AC-4.7)
  - Xong khi: đo và **ghi số thật** vào mô tả commit — kích thước tệp sao lưu với 20 trận đầy đủ, và thời gian mở ứng dụng với 20 đội cộng 20 trận (ngân sách spec mục 6: **dưới 2 giây**); kiểm tay AC-4.7 bằng cách siết quota lưu trữ của tab rồi lưu một trận: thấy dải cảnh báo tiếng Việt nói rõ **thay đổi chưa được lưu** và gợi ý xuất tệp. Nếu tệp quá lớn thì nén `cacSuKien` bằng `fflate` đã có trong dự án, **không** giảm số trận giữ lại (rủi ro R20 — AC-11.7 nói 20 trận).
  - AC: AC-4.7, AC-11.7
  - Phụ thuộc: T123

## Phase 19 — Lát 17: Đóng spec 001

- [ ] **T126** — Kiểm tay 13 AC của Giai đoạn 4 và tick nốt spec
  - File: `specs/001-football-team-sim/spec.md` (tick các ô AC và đổi `Status`)
  - Xong khi: 13 AC của US-10 và US-11 được tự tay kiểm trên ứng dụng đang chạy và tick, cộng **AC-4.2** và **AC-1.5** tick trọn; kiểm tay bốn việc chỉ kiểm tay mới thấy — xem một pha tấn công biên trên sân 2D rồi thấy điểm dịch ra biên; xem sân ở chế độ grayscale xem còn phân biệt được người tham gia không; đổi tên một đội rồi mở lịch sử thấy tên mới; xoá một đội rồi mở lịch sử thấy tên cũ và nút đấu lại bị chặn. `Status` của spec đổi thành **`Done`** chỉ khi mọi AC trong phạm vi đã pass.
  - AC: toàn bộ AC-10.x và AC-11.x, cộng AC-4.2, AC-1.5
  - Phụ thuộc: T113, T118, T124, T125, T128

- [ ] **T128** — Xoá đội khi đang có trận dở
  - File: sửa `src/ui/pages/DanhSachDoi.tsx`, sửa `src/hooks/useTeams.ts`, sửa `src/ui/strings.ts`
  - Xong khi: xoá một đội **đang có trận chạy trong bộ nhớ** thì hỏi xác nhận nêu rõ **trận đang diễn ra sẽ bị bỏ**, và đồng ý thì trận bị huỷ cùng lúc đội bị xoá; xoá một đội **chỉ có trận trong lịch sử** thì lịch sử **không** bị đụng tới (đã có test ở T120) và hộp xác nhận không nói gì về trận đang diễn ra.
  - AC: — *(dòng "Xoá đội khi đang có trận dở" của `spec.md` mục 5)*
  - Phụ thuộc: T121
  - **Task thêm sau `/analyze`:** dòng này rơi qua ba giai đoạn mà không phase nào nhận — Definition of Done Giai đoạn 1 hoãn sang "GĐ2/GĐ3", Giai đoạn 3 không tạo task, bản đầu của Giai đoạn 4 cũng không. Definition of Done của spec đòi các trường hợp biên mục 5 được xử lý, nên nó phải có chỗ.

- [ ] **T129** — Ba món nợ còn lại của spec 001
  - File: `specs/001-football-team-sim/tasks.md`, `.specify/memory/constitution.md`
  - Xong khi: **T035** (hai ngân sách hiển thị chưa đo được từ Giai đoạn 1) được đo hoặc được ghi rõ vì sao môi trường này không đo được; hai điểm `[CẦN XÁC NHẬN]` trong hiến pháp mục 7 — thư mục lâu dài của dự án và trình duyệt đích — được người dùng chốt và hiến pháp bump version theo PATCH; `AC-4.7` nếu T125 vẫn không quan sát được thì ghi rõ lý do thay vì tick bừa.
  - AC: —
  - Phụ thuộc: T126
  - **Ghi chú, sửa sau `/analyze`:** task này **cần người dùng trả lời**, nên nó **không chặn** việc T126 đổi `Status` của spec thành `Done`. Ba món nợ này là nợ cũ của Giai đoạn 1 và của hiến pháp, không phải AC nào của spec.

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-1.1 | T012 |
| AC-1.2 | T009, T012, T013 |
| AC-1.3 | T009, T013 |
| AC-1.4 | T009, T012 |
| AC-1.5 | T009, T010, T013, T051, **T122** *(lịch sử trận đấu: Giai đoạn 4)* |
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
| AC-4.2 | T006, T015, **T122**, T123 *(lịch sử trận đấu: Giai đoạn 4)* |
| AC-4.3 | T029, T032 |
| AC-4.4 | T030 |
| AC-4.5 | T030, T032 |
| AC-4.6 | T030, T032 |
| AC-4.7 | T031, **T125** *(lần đầu quan sát được: Giai đoạn 4)* |
| AC-4.8 | T029, T032 |
| AC-4.9 | T015 |

36/36 AC trong phạm vi đều có task. **Năm** AC được ghi chú rõ phần vắt sang giai đoạn sau để T033 không tick trọn: AC-1.5, AC-2.7, AC-3.5, AC-3.7, AC-4.2. Mức hoàn thành chính thức của Giai đoạn 1 là **31 trọn + 5 một phần**.

Giai đoạn 2 chạm lại một số AC của Giai đoạn 1 và đóng nốt hai phần còn nợ —
xem hai bảng ở cuối phần "Bảng phủ AC — Giai đoạn 2" thay vì liệt kê hai lần ở
đây.

### Bảng phủ AC — Giai đoạn 2

| AC | Task |
|---|---|
| AC-5.1 | T049, T051 |
| AC-5.2 | T040, T049 |
| AC-5.3 | T052 |
| AC-5.4 | T052 |
| AC-5.5 | T041, T054 |
| AC-5.6 | T052 |
| AC-5.7 | T044, T059 *(phần chặn bắt đầu giả lập: Giai đoạn 3)* |
| AC-5.8 | T044, T058 |
| AC-5.9 | T053 |
| AC-5.10 | T045, T046, T050, **T060**, T064 — phần **chỉ thị** của AC này chỉ kiểm trọn được sau khi có `ChiThiDoi` ở Phase 10 |
| AC-6.1 | T042, T055 |
| AC-6.2 | T055 |
| AC-6.3 | T055 |
| AC-6.4 | T042, T056 |
| AC-6.5 | T042, T057 |
| AC-6.6 | T057 |
| AC-7.1 | T043, T060 |
| AC-7.2 | T043, T060 |
| AC-7.3 | T043, T061 |
| AC-7.4 | T043, T045, T062 |
| AC-7.5 | T046, T063 |
| AC-7.6 | T046, T063 |
| AC-8.1 | T070 |
| AC-8.2 | T069, T070 |
| AC-8.3 | T067, T076, **T079** |
| AC-8.4 | T067, T076, **T080** |
| AC-8.5 | T073, T077, **T081** |
| AC-8.6 | T074, T077 |
| AC-8.7 | T078 |
| AC-8.8 | **T082** |
| AC-8.9 | T086, T088 |
| AC-8.10 | T086, T088 |
| AC-8.11 | T066, **T071**, **T092** |
| AC-8.12 | T095 |
| AC-8.13 | T075, T077 |
| AC-8.14 | T073, T083, T088 |
| AC-8.15 | T068, T070 |
| AC-8.16 | T085 |
| AC-9.1 | T089 |
| AC-9.2 | T087, T089 |
| AC-9.3 | T087, T089 |
| AC-9.4 | T087, T089 |
| AC-9.5 | T091, T093 |
| AC-9.6 | T091, T093 |
| AC-9.7 | T091, T094 |
| AC-9.8 | T091, T093, T094 |
| AC-9.9 | T086, T088 |
| AC-9.10 | T090 |
| AC-10.1 | T114 |
| AC-10.2 | T106, T115 |
| AC-10.3 | T116 |
| AC-10.4 | T115 |
| AC-10.5 | T118 |
| AC-10.6 | T117 |
| AC-11.1 | T110, T111 |
| AC-11.2 | T099, T100, T101, T110, T111 |
| AC-11.3 | T102, **T102b**, T103, T109, T112 |
| AC-11.4 | T111, T122 |
| AC-11.5 | T104, T112 |
| AC-11.6 | T113 |
| AC-11.7 | T105, T119, T120, T121, T123, T124, T125 |

26/26 AC của Giai đoạn 3 đều có task. Bốn AC in đậm ở cột task là bốn AC dạng
so sánh của P5 — mỗi cái có **một test riêng** chứ không gộp chung, để khi một
cái đỏ thì biết ngay engine lệch ở đâu.

13/13 AC của Giai đoạn 4 đều có task, cộng ba AC vắt lại được đóng nốt ở
Phase 18 và 19 — xem hai bảng dưới.


**Không còn AC nào thiếu task.** Toàn bộ 99 AC của spec 001 đã có ít nhất một
task; Phase 19 là chỗ tick nốt và đổi `Status` của spec thành `Done`.

### Phần vắt từ Giai đoạn 1 mà Giai đoạn 3 đóng nốt

| AC | Phần còn nợ | Task |
|---|---|---|
| AC-3.5 | Logo đội hiện trong màn hình trận đấu | **T088**, T089 |
| AC-3.7 | Hai đội trùng màu áo thì tự đổi một đội sang áo phụ trong trận | **T088** |
| AC-5.7 | Phần chặn bắt đầu giả lập | **T086** |

### Phần vắt từ giai đoạn trước mà Giai đoạn 4 đóng nốt

| AC | Phần còn nợ | Task |
|---|---|---|
| AC-4.2 | Lịch sử trận đấu còn nguyên sau khi mở lại | **T122**, T123 |
| AC-1.5 | Đổi tên đội thì lịch sử trận đấu đổi theo | **T122** |
| AC-4.7 | Dung lượng đầy thì cảnh báo — lần đầu **quan sát được** | **T125** |

Chú thích cũ trong `spec.md` ghi phần lịch sử của AC-4.2 và AC-1.5 là "thuộc
GĐ3"; đó là chú thích sai và đã được sửa lại thành GĐ4 ở T098. AC-4.7 có từ
Giai đoạn 1 nhưng ba giai đoạn trước chỉ ghi những bản ghi nhỏ nên không có
cách nào làm đầy dung lượng bằng tay; Giai đoạn 4 là chỗ đầu tiên ghi hàng
trăm KB mỗi lần — xem `plan.md` mục IV.0.

### Một lỗi engine cố tình để ngoài phạm vi Giai đoạn 4

`thoat-xuong` cũng là loại sự kiện **chết** như `cuu-thua`: khai trong
`LoaiSuKien`, đã có đủ mẫu câu tiếng Việt, nhưng `loaiCuaChuoi` chưa bao giờ
trả về nó. Test so sánh của AC-8.4 vẫn đúng vì nó đo bộ đếm `biThoatXuong`
chứ không đo dòng tường thuật; chỗ thiếu chỉ là người dùng không bao giờ đọc
được câu đó. **Người dùng đã chốt không nhặt vào Giai đoạn 4**, nên không có
task cho nó — ghi ở đây để lần sau không ai tưởng là bỏ sót.


22/22 AC của Giai đoạn 2 đều có task. Một AC được ghi chú phần vắt sang giai
đoạn sau để T065 không tick trọn: **AC-5.7**. Mức hoàn thành dự kiến của Giai
đoạn 2 là **21 trọn + 1 một phần**.

### Phần vắt từ Giai đoạn 1 mà Giai đoạn 2 đóng nốt

`/analyze` bắt được là bản đầu của Giai đoạn 2 bỏ sót cả hai: tôi chỉ đọc
US-5→US-7 mà không quay lại đọc chính những ghi chú hoãn mà Giai đoạn 1 để lại.

| AC | Phần còn nợ | Task |
|---|---|---|
| AC-2.7 | Xoá cầu thủ thì ô đội hình của họ thành trống | **T047b** |
| AC-1.5 | Đổi tên đội thì tên mới hiện trên trang chiến thuật | **T051** |

### AC của Giai đoạn 1 bị Giai đoạn 2 làm rộng phạm vi

| AC | Vì sao rộng ra | Task kiểm lại |
|---|---|---|
| AC-1.6 | Xoá đội giờ phải dọn cả chiến thuật | T047, T065 |
| AC-4.4 | Nhập lại phải ra đúng cả chiến thuật | T064, T065 |
| AC-4.5 | Tệp hỏng không được làm mất chiến thuật | T064, T065 |

## Ghi chú thực thi

- Không tạo file nào ngoài danh sách trên. Phát sinh thêm → dừng, cập nhật plan/tasks trước.
- Mỗi task hoàn thành là một commit, thông điệp nêu rõ mã task (hiến pháp mục 4). Không commit khi ứng dụng không build được.
- Task thuộc `src/domain/` và `src/services/`, `src/storage/` chưa có test thì **chưa xong** (hiến pháp mục 4). Task thuộc `src/ui/` được xác nhận bằng cách tự bấm thử.
- Kết thúc mỗi phase từ Phase 1 trở đi, ứng dụng phải chạy trọn luồng của phase đó (hiến pháp P6) trước khi sang phase sau.
