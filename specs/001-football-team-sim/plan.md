# Plan: Giai đoạn 1 — Tạo đội, cầu thủ, ảnh và lưu trữ

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Phạm vi** | Giai đoạn 1 — US-1 → US-4: **36 AC** (AC-1.1→1.7, AC-2.1→2.11 gồm AC-2.1b, AC-3.1→3.8, AC-4.1→4.9) |
| **Mức hoàn thành** | **31 AC làm trọn** + **5 AC làm một phần**: AC-1.5, AC-2.7, AC-3.5, AC-3.7, AC-4.2 — phần còn lại của 5 AC này cần sơ đồ chiến thuật (GĐ2) hoặc trận đấu và lịch sử trận (GĐ3) |
| **Status** | Draft — đã sửa theo kết quả `/analyze` ngày 2026-10-26 |
| **Updated** | 2026-10-26 |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

Giai đoạn 2–4 (sơ đồ chiến thuật, engine giả lập, sân 2D và báo cáo) sẽ có plan riêng. Plan này chỉ được hiện thực những AC nêu trong phạm vi trên.

## 1. Kiểm tra hiến pháp (Constitution check)

Đối chiếu với `.specify/memory/constitution.md` v1.0.0.

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập phải tái lập được | ✅ | Giai đoạn 1 chưa có engine giả lập. Nhưng hàm sinh nhanh chỉ số (AC-2.9) cũng là hàm có tính ngẫu nhiên, nên áp dụng đúng quy ước của P1: nguồn ngẫu nhiên truyền vào qua tham số, không gọi `Math.random` bên trong. Nhờ vậy test được bằng nguồn giả. |
| P2 Luật bóng đá tách khỏi giao diện | ✅ | Lớp `domain/` chứa toàn bộ bảng vị trí, bảng trọng số chỉ số, công thức chỉ số tổng, luật sinh chỉ số, luật hồ sơ hoàn tất, luật tương phản màu. Lớp này MUST NOT import React/DOM — có test riêng để chặn. |
| P3 Dữ liệu người dùng là bất khả xâm phạm | ✅ | Nhập tệp chạy theo nguyên tắc tất-cả-hoặc-không-gì: parse + validate toàn bộ trong bộ nhớ, chỉ khi hợp lệ 100% mới ghi trong **một** transaction duy nhất. Xoá đội/cầu thủ có hộp xác nhận nêu rõ số lượng sẽ mất. Chức năng xuất đọc trực tiếp từ lưu trữ, không đi qua state giao diện, nên vẫn dùng được khi màn hình khác đang lỗi. |
| P4 Chạy offline, dữ liệu không ra khỏi máy | ✅ | Không có lời gọi mạng nào. Đặc biệt: **không dùng Google Fonts hay bất kỳ CDN nào** — chỉ dùng phông hệ thống. Mọi thư viện đi qua npm và được Vite đóng gói vào bundle. Không telemetry, không báo lỗi ra ngoài. |
| P5 Mỗi AC dạng so sánh phải có test chứng minh | ✅ (chưa áp dụng) | Các AC dạng so sánh (AC-8.3/8.4/8.5/8.8/8.11) đều thuộc Giai đoạn 3. Giai đoạn 1 không có AC nào dạng này. |
| P6 Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Chia thành 4 lát cắt dọc ở mục 9, mỗi lát kết thúc là một ứng dụng chạy được. Không có màn hình chờ giai đoạn sau. |
| P7 Tệp sao lưu cũ phải mở lại được | ✅ | Tệp mang `schemaVersion`. Có một chuỗi hàm migration `v1→v2→…` để Giai đoạn 2–4 nối thêm. Giai đoạn 1 phát hành `schemaVersion: 1` và đã có sẵn khung migration cùng test cho nó, chứ không để đó rồi mới làm sau. |
| P8 Giao diện và thuật ngữ tiếng Việt | ✅ | Mọi chuỗi hiển thị nằm tập trung một chỗ (`ui/strings.ts`), tiếng Việt, không có hạ tầng đa ngôn ngữ. Tên biến và tên file bằng tiếng Anh — P8 cho phép. |
| P9 Không bắt buộc dùng chuột, chữ phải đọc được | ✅ (phần áp dụng được) | Phần tương phản 4.5:1 áp dụng ngay: hàm thuần trong `domain` tính màu chữ tương phản cho mọi màu áo người dùng chọn (AC-3.8), có test theo công thức WCAG. Phần "xếp đội hình bằng bàn phím" chỉ có nghĩa khi đã có sơ đồ kéo-thả, nên thuộc Giai đoạn 2. Mọi form ở Giai đoạn 1 vẫn dùng thẻ form chuẩn nên điều hướng bàn phím hoạt động tự nhiên. |

**Ngoại lệ xin miễn trừ:** Không.

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** TypeScript (`strict`, cấm `any`), React, build bằng Vite, chạy trong trình duyệt trên máy người dùng. Không backend.
- **Vùng code bị chạm:** repo đang trống, nên Giai đoạn 1 tạo mới toàn bộ bộ khung. Không có code cũ để tái sử dụng.

**Phụ thuộc mới.** Hiến pháp mục 3 cho thêm thư viện thoải mái với hai điều kiện bắt buộc: đóng gói được để chạy offline, và ghi lại ở đây dùng để làm gì. Cả 7 thư viện dưới đây đều là gói npm được Vite đóng gói vào bundle, không tải gì lúc chạy.

| Thư viện | Dùng để làm gì | Vì sao không tự viết |
|---|---|---|
| `tailwindcss` | Toàn bộ giao diện | Đã chốt ở hiến pháp mục 3 |
| `zustand` | Giữ trạng thái đội/cầu thủ đang xem trên giao diện | Xem quyết định D3 |
| `zod` | Kiểm tra tệp sao lưu người dùng nhập vào | Cho thông báo lỗi chi tiết theo từng trường, phục vụ AC-4.5 "nói rõ lý do". Tự viết thì vừa dài vừa cho lỗi kém hơn |
| `idb` | Bọc IndexedDB thành promise | IndexedDB nguyên bản dùng callback sự kiện, rất dễ viết sai chỗ transaction — mà transaction chính là thứ P3 dựa vào |
| `react-easy-crop` | Khung chọn vùng cắt ảnh chân dung (AC-3.1) | Kéo + zoom + xử lý nhiều tỉ lệ ảnh là nhiều việc tỉ mỉ, không phải phần đáng tự viết |
| `fflate` | Đọc và ghi tệp ZIP cho định dạng sao lưu v2 | Trình duyệt có `CompressionStream` cho deflate nhưng không có phần vỏ ZIP; tự viết vỏ ZIP là khoảng 150 dòng code dễ sai ở chỗ offset và CRC. Giá phải trả: bundle tăng từ 223KB lên 307KB (gzip 70KB → 94KB) khi thêm cả Phase 4 và `fflate` cùng lúc — tôi chưa tách riêng phần của `fflate`, nên đừng trích con số này như là của nó |
| `vitest` | Chạy test | Cùng hệ với Vite, không cần cấu hình riêng |
| `fake-indexeddb` | Giả IndexedDB khi test lớp dữ liệu | Để test được tính atomic của nhập tệp mà không cần mở trình duyệt |

Việc nén ảnh **không** thêm thư viện: dùng `canvas` có sẵn của trình duyệt (xem D5).

## 3. Kiến trúc giải pháp

Luồng phụ thuộc một chiều theo hiến pháp mục 3. `domain` là lớp trong cùng và không phụ thuộc vào bất cứ lớp nào khác.

```
┌─────────────────────────────────────────────┐
│  ui/                                        │
│  pages: DanhSachDoi, TrangDoi, HoSoCauThu   │
│  components: form, bảng chỉ số, cắt ảnh     │
└───────────┬─────────────────────┬───────────┘
            │                     │
            v                     v
┌───────────────────────┐   ┌─────────────────┐
│  hooks/               │   │  domain/        │
│  useTeams, usePlayers │   │  (thuần, không  │
│  useBackup            │   │  phụ thuộc gì)  │
└───────────┬───────────┘   │                 │
            │               │ positions.ts    │
            v               │ attributes.ts   │
┌───────────────────────┐   │ rating.ts       │
│  services/            │   │ generator.ts    │
│  teamRepo playerRepo  │   │ completeness.ts │
│  imageService         │   │ colors.ts       │
│  backupService        │   │ types.ts        │
└───────────┬───────────┘   └─────────────────┘
            │
            v
┌───────────────────────┐
│  storage/  (IndexedDB) │
│  db.ts  migrations.ts  │
└───────────────────────┘
```

Chiều mũi tên là chiều được phép import. `domain` không có mũi tên đi ra. `services` không được import `hooks`, `store` hay `ui`.

Hai bổ sung so với bản vẽ trên, thêm sau khi soát chéo `/analyze`:

- **`store/`** (`appStore.ts`, dùng `zustand` theo quyết định D3) nằm **cùng tầng với `hooks/`**: `ui` đọc từ `store`, `hooks` ghi vào `store` và gọi `services`. `store` chỉ giữ dữ liệu đã nạp và trạng thái giao diện — nó MUST NOT gọi `services` hay `storage` trực tiếp, và MUST NOT chứa luật bóng đá (P2).
- **`services/backupSchema.ts`** giữ schema `zod` theo từng phiên bản dữ liệu, tách khỏi `backupService.ts` để mỗi lần bump `schemaVersion` chỉ thêm một schema mới cạnh schema cũ thay vì sửa file đang chạy (P7).

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| D1 | Chỗ lưu dữ liệu | IndexedDB | `localStorage` | `localStorage` giới hạn khoảng 5MB và chỉ lưu chuỗi. Riêng ảnh ở mức dữ liệu spec cam kết (20 đội × 30 cầu thủ, ảnh ≤100KB) đã có thể lên hàng chục MB — `localStorage` không đủ chỗ, và lưu ảnh dạng chuỗi sẽ làm chậm mọi lần đọc danh sách |
| D1b | | | OPFS (Origin Private File System) | Mạnh hơn mức cần cho bài toán này, và cần nhiều code hơn để làm được đúng việc mà IndexedDB đã làm sẵn |
| D2 | Cách lưu ảnh trong database | `Blob` trong một store `images` riêng, bảng đội/cầu thủ chỉ giữ id ảnh | Nhúng base64 ngay trong bản ghi cầu thủ | base64 phình thêm khoảng 33%, và khiến mỗi lần đọc danh sách 30 cầu thủ phải tải kèm toàn bộ ảnh dù danh sách chỉ cần hiện ảnh nhỏ. Tách store cho phép đọc thông tin cầu thủ mà không chạm vào ảnh, giữ được ngân sách 300ms của AC danh sách |
| D2b | Cách lưu ảnh trong **tệp sao lưu** (sửa 2026-10-27) | Tệp ZIP: `manifest.json` + `images/<id>.jpg` byte thô | Giữ JSON thuần với ảnh base64 (định dạng v1) | Đo thực tế cho thấy base64 đưa tệp lên 43,7 MB ở mốc dữ liệu spec cam kết, trong đó riêng phần phình 4/3 là ~11 MB. ZIP bỏ được phần phình đó mà vẫn là một tệp duy nhất |
| D2c | | Nhận dạng phiên bản bằng **chữ ký nội dung** (`PK\x03\x04`) | Nhận dạng bằng phần mở rộng tệp (`.json` vs `.zip`) | Người dùng đổi tên tệp là chuyện thường; dựa vào tên tệp thì một tệp v1 bị đặt tên `.zip` sẽ bị từ chối oan, mà P3 nói việc nhập không được làm người dùng mất đường về dữ liệu của họ |
| D3 | Giữ trạng thái giao diện | `zustand` | `Context` + `useReducer` | Một Context cho cả cây sẽ khiến việc sửa một ô chỉ số làm render lại toàn bộ bảng 30 cầu thủ. Việc đó còn chịu được ở Giai đoạn 1, nhưng Giai đoạn 2 có ngân sách phản hồi kéo-thả dưới 100ms nên chọn sẵn thứ không phải làm lại |
| D3b | | | Redux Toolkit | Nhiều khuôn mẫu cho một ứng dụng một người dùng, không có state từ máy chủ nên không cần phần lớn những gì nó giải quyết |
| D4 | Thời điểm ghi xuống lưu trữ | Ghi xuyên thẳng; hành động rời rạc (tạo/đổi tên/xoá đội, lưu cầu thủ) ghi ngay, các ô nhập liên tục (chỉ số) gom lại 300ms rồi ghi | Chỉ ghi khi người dùng đóng trang | Sự kiện trước khi đóng trang không được bảo đảm chạy; đóng bằng cách tắt máy hay trình duyệt bị kill là mất sạch. Vi phạm trực tiếp P3 |
| D4b | | | Có nút Lưu | Vi phạm AC-4.1 |
| D5 | Cắt và nén ảnh | `react-easy-crop` cho phần chọn vùng; nén bằng `canvas` thuần với vòng lặp hạ dần chất lượng JPEG tới khi đạt ngưỡng (≤100KB ảnh chân dung, ≤50KB logo) | Thêm thư viện nén ảnh | `canvas` đã làm được việc này; thêm thư viện chỉ để gọi một vòng lặp là không đáng |
| D6 | Kiểm tra tệp nhập | `zod` với schema theo từng phiên bản dữ liệu | Tự viết hàm kiểm tra | AC-4.5 đòi "nói rõ lý do" — `zod` cho đường dẫn tới đúng trường sai, tự viết thì thường chỉ ra được "tệp không hợp lệ" |
| D7 | Cách nhập tệp | Parse → validate toàn bộ → chỉ khi sạch mới mở một transaction duy nhất ghi đè hoặc gộp | Ghi dần từng đội trong lúc đọc tệp | Một đội lỗi ở giữa tệp sẽ để lại dữ liệu nửa vời. P3 cấm điều này |
| D8 | Màu chữ tương phản và trùng màu áo | Hai hàm thuần trong `domain/colors.ts`: tính độ sáng tương đối theo công thức WCAG để chọn màu chữ, và tính khoảng cách màu giữa hai đội để quyết định đổi sang áo phụ | Thêm thư viện xử lý màu | Chỉ cần hai hàm ngắn; để trong `domain` thì test được bằng các mốc tương phản cụ thể, đúng tinh thần P9 |
| D9 | Cờ "hồ sơ chưa hoàn tất" | Tính ra khi cần, từ chính dữ liệu chỉ số | Lưu thành một cột trong bản ghi cầu thủ | Cột lưu sẵn sẽ lệch với thực tế ngay khi có một đường ghi nào quên cập nhật nó. Tính ra thì không bao giờ sai |
| D10 | Bảng trọng số chỉ số theo vị trí | Một bảng tĩnh trong `domain/attributes.ts`, dùng chung cho cả chỉ số tổng (AC-2.11) và sinh nhanh chỉ số (AC-2.9) | Hai bảng riêng cho hai việc | Dùng chung thì "chỉ số nào quan trọng với vị trí này" chỉ có một nguồn sự thật; nếu tách đôi thì có ngày cầu thủ được sinh ra với bộ chỉ số mà chính công thức chấm điểm lại coi là kém |

## 4. Mô hình dữ liệu

IndexedDB, tên database `bongda`, phiên bản 1. Bốn store:

```
meta           (keyPath: 'key')
  { key: 'schemaVersion', value: 1 }
  { key: 'appVersion',    value: string }

teams          (keyPath: 'id')
  id              string          // sinh bằng crypto.randomUUID()
  name            string
  logoImageId     string | null   // -> images.id
  primaryColor    string          // dạng '#RRGGBB'
  secondaryColor  string
  createdAt       number
  updatedAt       number
  index: byName (không unique — AC-1.7 chỉ cảnh báo, không chặn trùng tên)

players        (keyPath: 'id')
  id              string
  teamId          string          // -> teams.id
  name            string
  shirtNumber     number
  age             number
  preferredFoot   'trai' | 'phai' | 'ca-hai'
  positions       PositionId[]    // 1..n trong 12 vị trí
  attributes      Partial<Record<AttributeId, number>>    // 1..20, thiếu = chưa điền
  gkAttributes    Partial<Record<GkAttributeId, number>> | null
  portraitImageId string | null   // -> images.id
  createdAt       number
  updatedAt       number
  index: byTeam (teamId)
  index: byTeamAndShirt (teamId, shirtNumber) — phục vụ AC-2.5

images         (keyPath: 'id')
  id              string
  blob            Blob            // JPEG đã nén
  width           number
  height          number
  byteSize        number
```

`attributes` để dạng thiếu-thì-không-có-khoá thay vì mặc định 0 — đây là cách AC-2.10 phân biệt "chưa điền" với "điền số thấp". Hệ quả: `domain/completeness.ts` so danh sách khoá cần có (15 chỉ số, hoặc 8+3 nếu là thủ môn theo AC-2.3) với danh sách khoá đang có.

**Định dạng tệp sao lưu phiên bản 2** — một tệp ZIP duy nhất:

```
bongda-YYYYMMDD-HHMM.zip
├── manifest.json        schemaVersion 2, exportedAt, teams, players,
│                        và images chỉ gồm metadata: { id, mime, duongDan }
└── images/<id>.jpg      byte thô của từng ảnh, KHÔNG base64
```

Vẫn là "một tệp duy nhất" như AC-4.3 đòi, và người dùng mở được bằng trình
quản lý tệp thông thường để xem ảnh bên trong.

**Phiên bản 1 (đã phát hành, vẫn phải nhập được — P7)** là một tệp JSON thuần
với ảnh nhúng base64:

```
{
  "schemaVersion": 1,
  "exportedAt": "…",
  "teams": [ … ], "players": [ … ],
  "images": [ { "id": "…", "mime": "image/jpeg", "data": "<base64>" } ]
}
```

Việc nhận dạng không dựa vào phần mở rộng tệp mà dựa vào nội dung: tệp bắt
đầu bằng chữ ký ZIP (`PK\x03\x04`) thì đọc theo v2, còn lại thì thử đọc JSON
theo v1. Người dùng đổi tên tệp cũng không làm sai.

**Migration:** `storage/migrations.ts` giữ một mảng hàm, mỗi hàm nâng dữ liệu từ phiên bản n lên n+1. Khi nhập tệp có `schemaVersion` nhỏ hơn hiện tại, chạy lần lượt các hàm còn thiếu rồi mới validate theo schema hiện tại. Tệp có `schemaVersion` **lớn hơn** phiên bản ứng dụng thì bị từ chối kèm thông báo rõ (tệp từ bản mới hơn). Giai đoạn 1 chỉ có phiên bản 1 nên mảng rỗng, nhưng đường đi và test cho nó được làm ngay — P7.

## 5. Contracts (types và hàm giữa các lớp)

**domain/** — toàn bộ là hàm thuần, không I/O, không ngẫu nhiên ẩn.

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `POSITIONS` | — | `Position[]` (12 vị trí, mỗi cái có id, tên tiếng Việt, tuyến, bên trái/giữa/phải) | — |
| `ATTRIBUTES` / `GK_ATTRIBUTES` | — | danh sách chỉ số kèm tên tiếng Việt và nhóm | — |
| `requiredAttributes(positions)` | `PositionId[]` | `AttributeId[]` — 15 chỉ số, hoặc 8 chung + 3 riêng nếu có vị trí thủ môn | — |
| `isProfileComplete(player)` | `Player` | `{ complete: boolean, missing: AttributeId[] }` | — |
| `positionRating(player, positionId)` | `Player`, `PositionId` | `number` (thang 1–20, làm tròn 1 chữ số) | — |
| `generateAttributes(level, positions, rng)` | `'ngoi-sao'\|'kha'\|'trung-binh'\|'yeu'`, `PositionId[]`, `Rng` | bộ chỉ số đầy đủ | — |
| `contrastingTextColor(bg)` | `string` | `'#000000' \| '#FFFFFF'` | `InvalidColor` |
| `kitsClash(a, b)` | hai màu | `boolean` | `InvalidColor` |

`Rng` là một interface một hàm trả số trong `[0,1)`. `generateAttributes` không gọi `Math.random` — P1.

**services/**

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `teamRepo.list()` | — | `TeamSummary[]` (kèm số cầu thủ, không kèm ảnh) | `StorageUnavailable` |
| `teamRepo.create(input)` | tên, hai màu | `Team` | `EmptyName`, `QuotaExceeded` |
| `teamRepo.rename(id, name)` | | `Team` | `EmptyName`, `NotFound`, `QuotaExceeded` |
| `teamRepo.remove(id)` | | `{ removedPlayers: number }` | `NotFound` |
| `teamRepo.findByName(name)` | | `Team[]` — để cảnh báo AC-1.7 | — |
| `playerRepo.listByTeam(teamId)` | | `Player[]` | `NotFound` |
| `playerRepo.save(player)` | | `Player` | `DuplicateShirtNumber`, `InvalidAttributeValue`, `QuotaExceeded` |
| `playerRepo.remove(id)` | | `void` | `NotFound` |
| `imageService.preparePortrait(file, crop)` | `File`, vùng cắt | `{ blob, width, height, byteSize }` ≤100KB | `NotAnImage`, `DecodeFailed` |
| `imageService.prepareLogo(file)` | `File` | như trên, ≤50KB | `NotAnImage`, `DecodeFailed` |
| `backupService.exportAll()` | — | `Blob` (JSON) kèm kích thước ước tính | `StorageUnavailable` |
| `backupService.inspect(file)` | `File` | `{ schemaVersion, teams: number, players: number, images: number }` — để hỏi thay thế hay gộp (AC-4.6) | `NotJson`, `SchemaInvalid`, `VersionTooNew` |
| `backupService.importAll(file, mode)` | `File`, `'thay-the' \| 'gop'` | `ImportReport` | `NotJson`, `SchemaInvalid`, `VersionTooNew`, `QuotaExceeded` |

Mọi lỗi là lớp lỗi có mã, lớp `ui` dịch mã sang câu tiếng Việt trong `ui/strings.ts` — giữ `services` sạch khỏi chuỗi hiển thị (P8 áp dụng ở biên giao diện).

`QuotaExceeded` được bắt ở một chỗ duy nhất trong `hooks` và luôn dẫn tới cùng một cảnh báo của AC-4.7.

## 6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-1.1 | `ui/pages/DanhSachDoi` — trạng thái trống khi `teamRepo.list()` rỗng, kèm nút tạo đội |
| AC-1.2 | `teamRepo.create` + điều hướng sang `TrangDoi` |
| AC-1.3 | `EmptyName` từ `teamRepo.create`, hiện tại trường tên trong form |
| AC-1.4 | `teamRepo.list()` trả `TeamSummary` có sẵn số cầu thủ; logo lấy từ store `images`, thiếu thì dùng hình thay thế của AC-3.4 |
| AC-1.5 | `teamRepo.rename` + store `zustand` là nguồn duy nhất cho tên đội trên mọi màn hình. **Một phần:** AC nhắc cả trang chiến thuật (GĐ2) và lịch sử trận đấu (GĐ3); hai chỗ đó sẽ đọc cùng nguồn này khi chúng ra đời |
| AC-1.6 | `teamRepo.remove` trả `removedPlayers`; hộp xác nhận hiện tên đội và con số đó trước khi gọi |
| AC-1.7 | `teamRepo.findByName` gọi trước khi tạo; cảnh báo nhưng vẫn cho xác nhận tiếp |
| AC-2.1 | `ui/components/FormCauThu` + `domain.POSITIONS` (12 vị trí) |
| AC-2.1b | `domain/positions.ts` cung cấp hàm thuần kiểm tra tổ hợp vị trí hợp lệ (thủ môn loại trừ mọi vị trí khác); `FormCauThu` vô hiệu hoá các lựa chọn xung đột ngay trên giao diện, `playerRepo.save` kiểm lại lần nữa để dữ liệu không bao giờ lưu được tổ hợp sai |
| AC-2.2 | `domain.ATTRIBUTES` (15 chỉ số) dựng bảng nhập theo 4 nhóm |
| AC-2.3 | `domain.requiredAttributes` — có vị trí thủ môn thì trả 8 chung + 3 riêng; form dựng theo đúng danh sách trả về nên các chỉ số còn lại không hiện ra |
| AC-2.4 | Kiểm tại ô nhập + `InvalidAttributeValue` ở `playerRepo.save`; giá trị sai bị bỏ, giữ giá trị hợp lệ cũ |
| AC-2.5 | Index `byTeamAndShirt` + lỗi `DuplicateShirtNumber`, chặn lưu |
| AC-2.6 | `players.positions` lưu cả danh sách; `domain.positionRating` và (Giai đoạn 2) luật sai vị trí đều đọc từ đây |
| AC-2.7 | `playerRepo.remove` / `save`; store `zustand` phát lại danh sách. Phần "ô đội hình thành trống" ở Giai đoạn 1 chưa có đội hình, nên chỉ cần bảo đảm dữ liệu cầu thủ biến mất sạch — Giai đoạn 2 nối phần sơ đồ vào cùng nguồn này |
| AC-2.8 | Sắp xếp phía giao diện trên mảng đã nạp, 4 khoá: tên, số áo, tuổi, vị trí |
| AC-2.9 | `domain.generateAttributes(level, positions, rng)` dùng bảng trọng số D10; kết quả đổ vào form để sửa tiếp |
| AC-2.10 | `domain.isProfileComplete` → nhãn "chưa hoàn tất" + số chỉ số còn thiếu; không chặn lưu |
| AC-2.11 | `domain.positionRating` gọi theo vị trí đang xem; cùng cầu thủ ở vị trí khác ra số khác |
| AC-3.1 | `react-easy-crop` chọn vùng → `imageService.preparePortrait` → hiện ở hồ sơ. Phần hiện trên sơ đồ chiến thuật thuộc Giai đoạn 2, dùng lại đúng ảnh này |
| AC-3.2 | Vòng lặp hạ chất lượng trong `imageService` (D5), không báo gì cho người dùng |
| AC-3.3 | `NotAnImage` / `DecodeFailed` → thông báo tiếng Việt, ảnh cũ giữ nguyên |
| AC-3.4 | `ui/components/AnhThayThe` — chữ cái đầu từ `player.name`, nền `team.primaryColor`, màu chữ từ `domain.contrastingTextColor` |
| AC-3.5 | `team.logoImageId` hiện ở danh sách đội và trang đội. Màn hình trận đấu thuộc Giai đoạn 3, dùng lại cùng nguồn |
| AC-3.6 | `team.primaryColor` cấp cho các thành phần nhận diện đội |
| AC-3.7 | `domain.kitsClash` — Giai đoạn 1 dùng nó để báo ngay khi người dùng chọn màu trùng với đội đã có; việc tự đổi áo phụ trong trận thuộc Giai đoạn 3, dùng lại cùng hàm |
| AC-3.8 | `domain.contrastingTextColor`, có test theo mốc 4.5:1 |
| AC-4.1 | D4 — ghi xuyên thẳng, không có nút Lưu |
| AC-4.2 | IndexedDB tồn tại qua các lần mở; `storage/db.ts` mở lại đúng database. Phần lịch sử trận đấu trong AC này thuộc Giai đoạn 3 |
| AC-4.3 | `backupService.exportAll` — một tệp JSON gồm đội, cầu thủ, ảnh base64 |
| AC-4.4 | `backupService.importAll` dựng lại `Blob` ảnh từ base64 |
| AC-4.5 | D6 + D7 — validate trước, lỗi thì không mở transaction nào |
| AC-4.6 | `backupService.inspect` chạy trước, hiện số đội/cầu thủ trong tệp rồi hỏi thay thế hay gộp |
| AC-4.7 | `QuotaExceeded` bắt tập trung ở `hooks` → cảnh báo chưa lưu được + gợi ý xuất tệp |
| AC-4.8 | `backupService.exportAll` trả kèm kích thước ước tính; `ui/components/SaoLuu` hiện số đó trước khi tạo tệp |
| AC-4.9 | `storage/db.ts` xin quyền lưu trữ bền lần mở đầu; `hooks/useBackup` hiện lời nhắc khi trình duyệt từ chối |

**Năm** AC có một phần nội dung nằm ở giai đoạn sau: AC-1.5, AC-2.7, AC-3.5, AC-3.7, AC-4.2. Bảng trên nêu rõ phần nào làm bây giờ và phần nào nối vào sau; không AC nào trong năm cái này được đánh dấu xong ở cuối Giai đoạn 1. Con số chính thức của giai đoạn là **31 trọn + 5 một phần** như ở header.

Lần soát `/analyze` đầu tiên đã bỏ sót AC-1.5 trong danh sách này — nó nhắc cả trang chiến thuật và lịch sử trận đấu mà vẫn bị tính như phủ trọn. Đã sửa.

## 7. Chiến lược kiểm thử

Theo hiến pháp mục 4: `domain` và lớp dữ liệu **bắt buộc** có unit test; giao diện không bắt buộc.

**Unit — `domain/` (bắt buộc)**
- `requiredAttributes`: thủ môn trả 8+3, cầu thủ thường trả 15, cầu thủ có cả vị trí thủ môn và vị trí khác xử lý ra sao.
- `isProfileComplete`: đủ / thiếu một / thiếu nhiều / chỉ số bằng 0 không bị coi là thiếu.
- `positionRating`: cùng cầu thủ ở hai vị trí phải ra hai số khác nhau (AC-2.11); trung vệ chỉ số cao không bị chấm cao ở vị trí tiền đạo.
- `generateAttributes`: với cùng nguồn ngẫu nhiên giả thì ra cùng kết quả (P1); chỉ số quan trọng của vị trí cao hơn chỉ số không liên quan (AC-2.9); 4 mức xếp theo đúng thứ tự.
- `contrastingTextColor`: các mốc đạt/không đạt 4.5:1; màu không hợp lệ thì báo lỗi.
- `kitsClash`: hai màu gần nhau, hai màu xa nhau, hai màu giống hệt.
- Một test cấu trúc: không file nào trong `domain/` import React, DOM hay `services`/`storage` (P2).

**Unit/Integration — lớp dữ liệu (bắt buộc, chạy trên `fake-indexeddb`)**
- `teamRepo`: tạo/đổi tên/xoá; xoá đội thì cầu thủ và ảnh của đội đó không còn mồ côi lại.
- `playerRepo`: trùng số áo bị chặn; chỉ số ngoài 1–20 bị chặn.
- `backupService` vòng tròn: xuất rồi nhập lại cho ra dữ liệu bằng chính nó, kể cả ảnh.
- **Tính atomic của nhập tệp** (P3): tệp có lỗi ở bản ghi cuối → dữ liệu cũ còn nguyên vẹn 100%, không có đội nào của tệp mới lọt vào.
- Nhập chế độ gộp: trùng tên đội thì giữ cả hai.
- Tệp `schemaVersion` lớn hơn bản ứng dụng → bị từ chối.
- Khung migration: dữ liệu phiên bản cũ giả lập chạy qua chuỗi migration ra đúng hình dạng hiện tại (P7).
- `QuotaExceeded`: giả lập lưu trữ đầy → lỗi được ném ra đúng chỗ, không âm thầm bỏ qua (AC-4.7).

**Thủ công (người dùng tự bấm)**
- Cắt ảnh với ảnh dọc, ảnh ngang, ảnh vuông, ảnh rất lớn.
- Nhập trọn một đội 18 cầu thủ để xem thao tác nhập có chịu được không, và kiểm ngân sách 300ms của danh sách.
- Chọn vài màu áo khó (vàng nhạt, xám trung tính) xem chữ còn đọc được không.
- Điền dở một cầu thủ, đóng trình duyệt, mở lại — dữ liệu còn và nhãn "chưa hoàn tất" vẫn đúng.
- Xuất tệp, xoá dữ liệu trình duyệt, nhập lại tệp.

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| R1 | Tệp sao lưu phình to: ở mức dữ liệu spec cam kết (20 đội × 30 cầu thủ), ảnh base64 có thể đưa tệp lên hàng chục MB | **ĐÃ XẢY RA** | Trung bình | **Đo ngày 2026-10-27 ở đúng mốc spec: tệp 43,7 MB**, trong đó ảnh chiếm 98%. Đường lùi đã nêu trong plan được thực hiện: đổi sang tệp ZIP có thư mục ảnh riêng, bump `schemaVersion` lên 2, giữ đường nhập cho tệp v1. Dự kiến còn ~32,5 MB — bỏ được phần base64 phình 4/3, phần còn lại là dữ liệu ảnh thật nên ZIP không cắt thêm được vì JPEG đã nén |
| R2 | Trình duyệt tự xoá IndexedDB khi máy thiếu chỗ, hoặc người dùng xoá dữ liệu trình duyệt — mất toàn bộ dữ liệu đã nhập | Trung bình | **Cao** | Xin quyền lưu trữ bền khi mở ứng dụng lần đầu; nhắc xuất tệp sao lưu sau mỗi phiên nhập liệu dài. Đây là lý do AC-4.3 là bắt buộc chứ không phải tiện ích |
| R3 | Nhập liệu quá mệt: 15 ô chỉ số × 25 cầu thủ, người dùng bỏ giữa đường và không bao giờ có đội thứ hai để đấu | Trung bình | **Cao** | AC-2.9 (sinh nhanh có cân theo vị trí) là biện pháp chính; cộng với AC-2.10 cho lưu dở để làm nhiều lần, và điều hướng bàn phím liền mạch giữa các ô chỉ số |
| R4 | Ảnh rất lớn làm treo giao diện lúc nén | Thấp | Thấp | Nén trong luồng nền, giữ giao diện phản hồi; có trạng thái đang xử lý |
| R5 | Bảng trọng số chỉ số theo vị trí (D10) ban đầu đặt sai, dẫn tới chỉ số tổng và chỉ số sinh ra đều lệch | Trung bình | Trung bình | Bảng nằm một chỗ trong `domain`, sửa một lần là cả hai chỗ đúng theo. Giai đoạn 3 khi có engine sẽ là lúc phát hiện lệch rõ nhất, và lúc đó sửa bảng không phải sửa code |

**Rollback:** mỗi lát cắt ở mục 9 là một commit chạy được (hiến pháp mục 4). Hỏng thì quay về commit lát trước. Dữ liệu người dùng không bị lát nào phá: `schemaVersion` chỉ tăng khi hình dạng dữ liệu đổi, và mọi lần tăng đều kèm hàm migration cùng test.

## 9. Thứ tự triển khai

Chia theo lát cắt dọc. Mỗi lát xong là ứng dụng chạy được và dùng thử được (P6) — không có lát nào chỉ dựng tầng mà chưa thấy gì trên màn hình.

1. **Lát 0 — Bộ khung chạy được.** Dựng project, `domain/types.ts`, `storage/db.ts` với 4 store và `schemaVersion: 1`, khung migration, cấu hình test. Kết thúc: ứng dụng mở lên, hiện trang trống có tiêu đề, test chạy được. Đây là lát duy nhất chưa có chức năng cho người dùng; giữ nó nhỏ nhất có thể.
2. **Lát 1 — Quản lý đội.** AC-1.1 → AC-1.7, AC-4.1, AC-4.2. Kết thúc: tạo được đội, đổi tên, xoá có xác nhận, cảnh báo trùng tên, đóng mở lại vẫn còn. Đã là một ứng dụng dùng thử được.
3. **Lát 2 — Cầu thủ và chỉ số.** AC-2.1 → AC-2.11. Kết thúc: nhập được trọn một đội 18 cầu thủ, có sinh nhanh chỉ số, có nhãn chưa hoàn tất, có chỉ số tổng theo vị trí. Đây là lát mang lại giá trị lớn nhất của Giai đoạn 1.
4. **Lát 3 — Hình ảnh và nhận diện.** AC-3.1 → AC-3.8. Kết thúc: đội có logo và màu áo, cầu thủ có ảnh chân dung đã cắt, chưa có ảnh thì hiện hình chữ cái đầu, chữ luôn đọc được trên mọi màu áo.
5. **Lát 4 — Sao lưu và phục hồi.** AC-4.3 → AC-4.7. Kết thúc: xuất ra tệp, nhập lại trên máy khác ra đúng dữ liệu kể cả ảnh, tệp hỏng bị từ chối mà không làm mất gì, lưu trữ đầy thì được cảnh báo. Giai đoạn 1 hoàn tất.

Thứ tự này đặt phần nhập liệu trước phần ảnh có lý do: nếu lát 2 cho thấy việc nhập 18 cầu thủ quá mệt (R3), ta còn kịp sửa cách nhập trước khi xây thêm thứ gì lên trên nó.
