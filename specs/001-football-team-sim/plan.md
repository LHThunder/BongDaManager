# Plan: specs/001-football-team-sim

| Phần | Phạm vi | Trạng thái |
|---|---|---|
| **Phần I** | Giai đoạn 1 — tạo đội, cầu thủ, ảnh, sao lưu | Đã hiện thực xong (38/39 task) |
| **Phần II** | Giai đoạn 2 — sơ đồ chiến thuật | Mới lập, ngày 2026-10-27 |

Giai đoạn 3 và 4 sẽ được thêm thành Phần III và IV khi tới lượt.

---

# PHẦN I — Giai đoạn 1: Tạo đội, cầu thủ, ảnh và lưu trữ

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

---
---

# PHẦN II — Giai đoạn 2: Sơ đồ chiến thuật

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Phạm vi** | US-5 → US-7 — **22 AC** (AC-5.1→5.10, AC-6.1→6.6, AC-7.1→7.6) |
| **Mức hoàn thành dự kiến** | 21 AC làm trọn + **1 AC làm một phần**: AC-5.7 — phần tính và hiện tình trạng đội hình làm ở GĐ2, phần "chặn việc bắt đầu giả lập" cần lối vào trận đấu nên thuộc GĐ3 |
| **Đóng nốt phần vắt từ GĐ1** | Giai đoạn này **cũng phải đóng** hai phần mà Giai đoạn 1 đã ghi là hoãn sang đây: **AC-2.7** (xoá cầu thủ thì ô đội hình của họ thành trống) và **AC-1.5** (đổi tên đội thì tên mới hiện trên trang chiến thuật). `/analyze` bắt được là bản plan đầu đã bỏ sót cả hai, vì tôi chỉ đọc US-5→US-7 mà không quay lại đọc chính những ghi chú hoãn của GĐ1 |
| **Chạm lại AC của GĐ1** | **AC-1.6** (xoá đội dọn cả chiến thuật) và **AC-4.4, AC-4.5** (tệp sao lưu chứa chiến thuật) có phạm vi rộng ra, nên phải kiểm lại chứ không dựa vào cái tick cũ |
| **Status** | Draft |
| **Updated** | 2026-10-27 |

> Phần này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

## II.1. Kiểm tra hiến pháp

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập phải tái lập được | ✅ | GĐ2 chưa có engine. Nhưng việc tự xếp lại người khi đổi sơ đồ (AC-5.8) PHẢI tất định: cùng đội hình cũ + cùng sơ đồ mới luôn ra cùng kết quả, không dùng nguồn ngẫu nhiên nào. Có test cho điều đó. |
| P2 Luật bóng đá tách khỏi giao diện | ✅ | Toàn bộ dữ liệu sơ đồ, bảng vai trò, luật mức sai vị trí, luật xung đột chỉ thị và thuật toán xếp lại người nằm trong `domain/`. Component chỉ vẽ và gọi. Test biên giới hiện có (T007) tự động canh. |
| P3 Dữ liệu người dùng là bất khả xâm phạm | ✅ | Đổi sơ đồ KHÔNG được làm mất cầu thủ: AC-5.8 nói giữ lại người, ai không xếp được thì ra danh sách ngoài sân. Thêm store `tactics` và bump `DB_VERSION`; nâng cấp database là thao tác ghi nên đi qua `upgrade` của IndexedDB trong một transaction duy nhất. |
| P4 Chạy offline | ✅ | Hình sân vẽ bằng CSS và SVG nội tuyến, không ảnh tải về. Thư viện kéo-thả đi qua npm và được đóng gói. |
| P5 Mỗi AC dạng so sánh phải có test | ✅ (chưa áp dụng) | Các AC dạng so sánh thuộc GĐ3. Nhưng GĐ2 sinh ra **đầu vào** cho chúng: mức trừ hiệu suất theo ba mức sai vị trí (AC-5.5) là con số mà AC-8.5 sẽ kiểm. Định nghĩa chúng trong `domain` ngay từ GĐ2 để GĐ3 chỉ việc dùng. |
| P6 Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Bốn lát cắt dọc ở mục II.9, mỗi lát kết thúc là một trang chiến thuật dùng thử được. |
| P7 Tệp sao lưu cũ phải mở lại được | ⚠️ | Tệp sao lưu phải chứa thêm chiến thuật, nên `SCHEMA_VERSION` lên **3**. Tệp **v1** (JSON base64) và **v2** (ZIP) đã phát hành vẫn phải nhập được: thêm bước migration v2→v3 gán chiến thuật mặc định cho mọi đội trong tệp cũ. Đây là chỗ dễ làm hỏng nhất của giai đoạn này nên được đánh ⚠️ và có test riêng cho cả ba phiên bản. |
| P8 Giao diện và thuật ngữ tiếng Việt | ✅ | Tên 8 sơ đồ, 23 vai trò, 6 chỉ thị và mọi câu giải thích đều bằng tiếng Việt. Tên vai trò và tên chỉ thị là **thuật ngữ miền** nên nằm trong `domain` cùng chỗ với `POSITIONS`, theo đúng tiền lệ đã có. |
| P9 Không bắt buộc dùng chuột, chữ phải đọc được | ✅ | Đây là giai đoạn mà phần bàn phím của P9 bắt đầu có nghĩa thật: AC-5.9 đòi xếp và đổi chỗ cầu thủ chỉ bằng bàn phím. Xem quyết định D11 — đó là lý do chính của việc chọn thư viện kéo-thả. Mức sai vị trí hiện bằng **nhãn chữ** chứ không chỉ bằng màu viền ô. |

**Ngoại lệ xin miễn trừ:** Không.

## II.2. Bối cảnh kỹ thuật

- **Tái sử dụng từ Giai đoạn 1** (không viết lại): `POSITIONS` / `laViTriThuMon` / `kiemTraToHopViTri` (`domain/positions.ts`), `POSITION_WEIGHTS` / `chiSoQuanTrong` (`domain/attributes.ts`), `chiSoTongTheoViTri` (`domain/rating.ts`), `hoSoHoanTat` (`domain/completeness.ts`, cho AC-5.7), `AnhThayThe` (ảnh cầu thủ trên ô), `HopXacNhan`, `ui/strings.ts`, mẫu `appStore` + hook, `moDb` + chuỗi migration, `LoiUngDung` + mã lỗi.
- **Vùng code bị chạm:** thêm `domain/formations.ts`, `domain/misplacement.ts`, `domain/roles.ts`, `domain/instructions.ts`, `domain/lineup.ts`; thêm `services/tacticRepo.ts`; thêm `hooks/useTactic.ts`; thêm `ui/pages/TrangChienThuat.tsx` và các component sân/ô/vai trò/chỉ thị; sửa `storage/db.ts` (store mới, `DB_VERSION` 2), `storage/migrations.ts` (`SCHEMA_VERSION` 3), `services/backupSchema.ts` + `backupService.ts` (tệp v3), `services/teamRepo.ts` (trường `activeTacticId`), `store/appStore.ts`, `ui/strings.ts`, `ui/pages/TrangDoi.tsx` (lối vào trang chiến thuật).

**Phụ thuộc mới.**

| Thư viện | Dùng để làm gì | Vì sao không tự viết |
|---|---|---|
| `@dnd-kit/core` | Kéo-thả cầu thủ vào ô, và **điều khiển bằng bàn phím** cho cùng một thao tác | Xem quyết định D11. Tự viết phần bàn phím cho kéo-thả nghĩa là tự làm focus, thông báo cho trình đọc màn hình, và trạng thái "đang nhấc" — đúng những thứ P9 quan tâm. **Chưa đo được giá bundle; phải đo và ghi lại khi làm, không trích con số từ trí nhớ** (bài học từ việc tôi ghi sai "fflate 8KB" ở Phần I). |

## II.3. Kiến trúc

Không có tầng mới. Phần thêm vào nằm đúng các tầng đã có:

```
domain/            formations.ts    8 sơ đồ, mỗi sơ đồ 11 ô kèm toạ độ trên sân
  (thuần)          misplacement.ts  ba mức sai vị trí + mức trừ hiệu suất
                   roles.ts         23 vai trò, chỉ số quan trọng, câu giải thích
                   instructions.ts  6 chỉ thị, đánh đổi từng mức, luật xung đột
                   lineup.ts        xếp lại người khi đổi sơ đồ, tình trạng đội hình
services/          tacticRepo.ts    đọc/ghi chiến thuật, lưu bộ có tên
storage/           db.ts            + store `tactics`, DB_VERSION 2
hooks/             useTactic.ts     điều phối
ui/pages/          TrangChienThuat.tsx
ui/components/     SanBong.tsx  OViTri.tsx  DanhSachNgoaiSan.tsx
                   ChonSoDo.tsx  ChonVaiTro.tsx  ChiThiDoi.tsx
```

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| D11 | Cách xếp cầu thủ vào ô | `@dnd-kit/core` với cả `PointerSensor` và `KeyboardSensor` | Kéo-thả HTML5 gốc (`draggable`) | HTML5 DnD **không có đường bàn phím nào cả**, mà AC-5.9 và P9 đòi làm được mọi việc bằng bàn phím. Sẽ phải viết một cơ chế thứ hai song song chỉ cho bàn phím, tức là hai đường code cho một thao tác — hai đường sẽ lệch nhau |
| D11b | | | `react-dnd` | Cũng không có sensor bàn phím sẵn; phần accessibility phải tự làm |
| D11c | | | Tự viết bằng `pointerdown`/`pointermove` | Phần chuột thì làm được, nhưng phần bàn phím đòi quản lý focus, vùng thả đang nhắm tới, và thông báo cho trình đọc màn hình. Đó là việc đã có thư viện làm đúng |
| D12 | Chỗ lưu chiến thuật | Store `tactics` riêng, `teams.activeTacticId` trỏ tới bộ đang dùng | Nhúng chiến thuật vào trong bản ghi đội | AC-7.5 đòi lưu **nhiều** bộ có tên cho cùng một đội. Nhúng vào đội thì chỉ chứa được một bộ, và mỗi lần đổi một ô lại phải ghi lại cả bản ghi đội kèm logo |
| D13 | Vai trò gắn vào đâu | Gắn vào **ô** của sơ đồ (`oVien[].roleId`), không gắn vào cầu thủ | Gắn vai trò vào cầu thủ | AC-6.6 nói rõ: đổi cầu thủ ở ô thì vai trò giữ nguyên. Vai trò là mệnh lệnh của HLV cho một vị trí, không phải thuộc tính của người |
| D14 | Thuật toán xếp lại người khi đổi sơ đồ (AC-5.8) | Tham lam theo mức sai vị trí, rồi **một lượt cải thiện bằng cách thử đổi chỗ từng cặp** cho tới khi không cải thiện được nữa | Chỉ tham lam một lượt | Tham lam thuần có thể để lại những cặp mà đổi chỗ cho nhau thì cả hai đều khớp hơn. Lượt đổi cặp sửa được đúng loại sai đó với khoảng 30 dòng code |
| D14b | | | Thuật toán Hungarian (ghép tối ưu toàn cục) | Khoảng 80 dòng code dày đặc chỉ số mảng cho một bài toán 11×11. Phương án đã chọn đạt **tối ưu cục bộ theo phép đổi cặp**, và test sẽ kiểm trên các tình huống cụ thể. Nếu test tìm ra trường hợp mà nó trượt rõ rệt thì mới đổi sang Hungarian — ghi lại ở đây để lần sau không phải bàn lại |
| D15 | Toạ độ ô trên sân | Phần trăm `x`,`y` trong 0..100, lưu trong `formations.ts`; `y=0` là khung thành đội mình | Toạ độ theo điểm ảnh | Phần trăm thì sân co giãn theo khung mà không phải tính lại; và GĐ4 vẽ sân 2D dùng lại đúng hệ toạ độ này |
| D15b | Cách kiểm 8 bảng toạ độ gõ tay không bị sai (sửa sau `/analyze`) | Mỗi ô khai thêm `dai`, và test đối chiếu số ô mỗi dải với `cacDai` lấy từ tên sơ đồ | Suy dải từ `tuyen` của `POSITIONS` | **Không làm được**: `POSITIONS` chỉ có 3 tuyến ngoài sân, mà `4-4-1-1`, `4-2-3-1`, `4-1-4-1` có 4 dải trong tên — với 4-2-3-1 thì dải "3" (AML/AM/AMR) và dải "1" (ST) đều thuộc tuyến tấn công. `/analyze` bắt được điều này khi đối chiếu điều kiện test với 8 sơ đồ cụ thể. Khai `dai` thành dữ liệu thì phép kiểm thoả được cho cả 8 và vẫn bắt được lỗi gõ sai |
| D16 | Mức sai vị trí tính thế nào | Từ `tuyen` và `ben` đã có trong `POSITIONS`: lệch 0 tuyến + khác bên = **nhẹ**, lệch 1 tuyến = **vừa**, lệch ≥2 tuyến hoặc dính khung thành = **nặng**; cầu thủ nhiều vị trí thì lấy mức **nhẹ nhất** trong các vị trí của họ | Một bảng tra tay 12×12 | Bảng tay là 144 ô phải tự nhất quán, và mỗi lần thêm vị trí lại phải sửa cả bảng. Tính từ tuyến và bên thì luật chỉ có một chỗ |
| D17 | Chỉ thị lưu ở đâu trong tệp sao lưu | Thêm vào tệp v3, cùng chỗ với chiến thuật | Để chỉ thị ngoài tệp sao lưu | AC-5.10 và AC-7.6 nói chiến thuật phải còn nguyên; nếu không nằm trong tệp sao lưu thì mang sang máy khác là mất, mà AC-4.4 nói nhập lại phải ra đúng dữ liệu |

## II.4. Mô hình dữ liệu

**IndexedDB — `DB_VERSION` lên 2.** Thêm một store, thêm một trường vào `teams`:

```
tactics        (keyPath: 'id')                             ← store MỚI
  id              string
  teamId          string        -> teams.id
  ten             string | null  // null = bộ đang dùng, chưa đặt tên
  formationId     FormationId
  oVien           { slotId: string
                    playerId: string | null
                    roleId: RoleId }[]      // đúng 11 phần tử
  chiThi          Record<InstructionId, string>   // 6 khoá
  createdAt       number
  updatedAt       number
  index: byTeam (teamId)

teams                                                       ← SỬA
  + activeTacticId  string | null
```

Nâng cấp từ `DB_VERSION` 1 lên 2 chạy trong `upgrade` của IndexedDB: tạo store
`tactics`, rồi với mỗi đội đã có, dựng một chiến thuật mặc định (sơ đồ 4-4-2,
11 ô trống, vai trò mặc định, chỉ thị cân bằng) và gán `activeTacticId`. Toàn bộ
việc đó nằm trong một transaction của bước nâng cấp — hỏng thì không có gì đổi (P3).

**Tệp sao lưu — `SCHEMA_VERSION` lên 3.** Manifest thêm một mảng:

```
manifest.json
  schemaVersion: 3
  teams:    [ … + activeTacticId … ]
  players:  [ … không đổi … ]
  images:   [ … không đổi … ]
  tactics:  [ … như store tactics … ]        ← MỚI
```

**Chuỗi migration (P7).** `MIGRATIONS` có hai bước sau giai đoạn này:

| Bước | Việc |
|---|---|
| v1 → v2 | (đã có) ảnh ra khỏi JSON: bỏ `data`, thêm `duongDan` |
| v2 → v3 | thêm `tactics: []`, và với mỗi đội thêm `activeTacticId: null` |

Tệp v1 và v2 đi qua đủ chuỗi nên vẫn nhập được. Đội không có chiến thuật trong
tệp thì khi nhập được gán chiến thuật mặc định, giống như đội tạo mới (AC-7.4).

## II.5. Contracts

**domain/** — hàm thuần, không I/O, không ngẫu nhiên.

| Tên | Input | Output |
|---|---|---|
| `FORMATIONS` | — | `Formation[]` — đúng 8 sơ đồ, mỗi sơ đồ `{ id, ten, cacDai: number[], oVien: { slotId, viTri, dai, x, y }[] }` với 11 ô. `cacDai` là các số trong tên sơ đồ (4-2-3-1 → `[4,2,3,1]`), `dai` của mỗi ô là chỉ số 1-based vào `cacDai`; ô thủ môn có `dai: 0` |
| `mucSaiViTri(viTriO, viTriSoTruong)` | `PositionId`, `PositionId[]` | `'dung' \| 'nhe' \| 'vua' \| 'nang'` |
| `MUC_TRU_HIEU_SUAT` | — | `Record<MucSai, number>` — phần trừ cho GĐ3 dùng (AC-5.5, AC-8.5) |
| `ROLES` | — | `Role[]` — 23 vai trò, mỗi vai trò `{ id, ten, viTriApDung: PositionId[], moTa, chiSoQuanTrong }` |
| `vaiTroChoViTri(viTri)` | `PositionId` | `Role[]` — 2..3 vai trò (AC-6.1) |
| `vaiTroMacDinh(viTri)` | `PositionId` | `RoleId` (AC-6.5) |
| `chiSoChuaDat(cauThu, roleId)` | `Player`, `RoleId` | `{ id, ten, giaTri }[]` — chỉ số quan trọng dưới 10 (AC-6.4) |
| `CAC_CHI_THI` | — | `Instruction[]` — 6 chỉ thị, mỗi mức kèm câu đánh đổi (AC-7.1, AC-7.2) |
| `CHI_THI_MAC_DINH` | — | bộ cân bằng (AC-7.4) |
| `cacXungDot(chiThi)` | bộ chỉ thị | `XungDot[]` — mô tả từng xung đột (AC-7.3) |
| `xepLaiKhiDoiSoDo(oVienCu, soDoMoi, cauThu)` | | `{ oVienMoi, bayRaNgoai: playerId[], xepSaiViTri: { playerId, muc }[] }` (AC-5.8) |
| `tinhTrangDoiHinh(oVien, cauThu)` | | `{ sanSang: boolean, thieu: LyDoThieu[] }` (AC-5.7) |

**services/tacticRepo.ts**

| Tên | Input | Output | Lỗi |
|---|---|---|---|
| `layChienThuatDangDung(teamId)` | | `Tactic` — tự tạo bộ mặc định nếu đội chưa có | `NotFound`, `QuotaExceeded` |
| `luu(tactic)` | | `Tactic` | `InvalidTactic`, `QuotaExceeded` |
| `luuThanhBo(teamId, ten)` | | `Tactic` — nhân bản bộ đang dùng thành bộ có tên (AC-7.5) | `EmptyName`, `QuotaExceeded` |
| `danhSachBo(teamId)` | | `Tactic[]` — các bộ có tên | |
| `apDungBo(teamId, tacticId)` | | `Tactic` | `NotFound` |

Thêm một mã lỗi `InvalidTactic` vào `services/errors.ts` cho trường hợp bộ
chiến thuật không đúng hình dạng (không đủ 11 ô, ô trỏ tới cầu thủ của đội khác,
vai trò không áp dụng được cho vị trí của ô).

## II.6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-5.1 | `TrangChienThuat` + `SanBong` (sân vẽ bằng CSS/SVG) + `ChonSoDo` |
| AC-5.2 | `FORMATIONS` — test khẳng định đúng 8 sơ đồ và mỗi sơ đồ đúng 11 ô; `ChonSoDo` dựng danh sách từ đó |
| AC-5.3 | `@dnd-kit` draggable trên `DanhSachNgoaiSan`, droppable trên `OViTri`; `OViTri` hiện `AnhThayThe` + tên + số áo |
| AC-5.4 | `useTactic.datCauThuVaoO` — ô đích đã có người thì đổi chỗ hai bên, không ô nào bị bỏ trống ngoài ý muốn |
| AC-5.5 | `mucSaiViTri` + `MUC_TRU_HIEU_SUAT`; `OViTri` hiện nhãn chữ của mức và phần trừ |
| AC-5.6 | `DanhSachNgoaiSan` cũng là vùng thả; thả ra ngoài thì `playerId` của ô thành `null` |
| AC-5.7 | `tinhTrangDoiHinh` (dùng lại `hoSoHoanTat` của GĐ1) + dải thông báo trên `TrangChienThuat`. **Một phần:** việc chặn bắt đầu giả lập cần lối vào trận đấu, thuộc GĐ3 |
| AC-5.8 | `xepLaiKhiDoiSoDo` (D14) + thông báo nêu ai bị đẩy ra ngoài, ai bị xếp sai |
| AC-5.9 | `KeyboardSensor` của `@dnd-kit`; mỗi ô và mỗi cầu thủ ngoài sân là một đích focus |
| AC-5.10 | `tacticRepo` ghi xuyên thẳng như GĐ1; `TrangChienThuat` nạp lại từ `layChienThuatDangDung`. Phần **chỉ thị** của AC này chỉ kiểm trọn được sau khi có `ChiThiDoi` |
| AC-6.1 | `vaiTroChoViTri` + `ChonVaiTro`; test khẳng định mỗi vị trí trong 12 vị trí trả 2..3 vai trò và tổng là 23 |
| AC-6.2 | `OViTri` hiện tên vai trò ngay tại ô |
| AC-6.3 | `Role.moTa` + `Role.chiSoQuanTrong` hiện trong `ChonVaiTro` |
| AC-6.4 | `chiSoChuaDat` — ngưỡng 10 lấy từ AC-6.4, nêu tên từng chỉ số và giá trị hiện tại |
| AC-6.5 | `vaiTroMacDinh` gọi khi chọn sơ đồ mới |
| AC-6.6 | `oVien[].roleId` gắn với ô (D13); `datCauThuVaoO` không chạm `roleId` |
| AC-7.1 | `CAC_CHI_THI` (6 chỉ thị) + `ChiThiDoi` |
| AC-7.2 | Câu đánh đổi nằm trong từng mức của `CAC_CHI_THI`, hiện ngay khi đổi mức |
| AC-7.3 | `cacXungDot` + cảnh báo không chặn trong `ChiThiDoi` |
| AC-7.4 | `CHI_THI_MAC_DINH`, dùng cả khi tạo đội mới và khi nâng cấp database/nhập tệp cũ |
| AC-7.5 | `tacticRepo.luuThanhBo` + `danhSachBo` + `apDungBo` |
| AC-7.6 | `teams.activeTacticId` — GĐ3 đọc đúng bộ này khi vào trận, không hỏi lại người dùng |

**Hai phần vắt từ Giai đoạn 1 mà giai đoạn này đóng nốt:**

| AC | Được đáp ứng bởi |
|---|---|
| AC-2.7 *(phần ô đội hình)* | `playerRepo.remove` gỡ cầu thủ khỏi mọi ô trong mọi chiến thuật của đội, trong **cùng transaction** với việc xoá cầu thủ và ảnh. Không làm việc này thì `oVien` giữ một `playerId` treo, và chính phép kiểm `InvalidTactic` của `tacticRepo` sẽ làm bộ chiến thuật đó không nạp được nữa — P3 cấm điều đó |
| AC-1.5 *(phần trang chiến thuật)* | `TrangChienThuat` đọc tên đội từ store dùng chung, **không giữ bản sao riêng**, nên đổi tên ở danh sách đội thì trang chiến thuật đổi theo |

22/22 AC của Giai đoạn 2 có chỗ được hiện thực, cộng hai phần vắt từ Giai đoạn 1
ở bảng trên. AC-5.7 được ghi chú rõ phần vắt sang GĐ3.

## II.7. Chiến lược kiểm thử

**Bắt buộc có test — `domain/`:**
- `FORMATIONS`: đúng 8 sơ đồ; mỗi sơ đồ đúng 11 ô; mỗi sơ đồ có đúng một ô thủ môn; mọi `viTri` của ô đều thuộc 12 vị trí; `slotId` không trùng trong một sơ đồ; toạ độ nằm trong 0..100; tên tổ hợp số của sơ đồ khớp số ô theo tuyến (4-4-2 phải có 4 phòng ngự, 4 tiền vệ, 2 tấn công).
- `mucSaiViTri`: hậu vệ phải đá hậu vệ trái = nhẹ; tiền vệ trụ đá trung vệ = vừa; tiền đạo đá trung vệ = nặng; người không phải thủ môn đứng khung = nặng; thủ môn đá vị trí sân = nặng; cầu thủ hai vị trí lấy mức nhẹ nhất; đúng vị trí = `'dung'`. `MUC_TRU_HIEU_SUAT` phải tăng dần theo mức (chuẩn bị cho AC-8.5).
- `ROLES`: tổng 23; mỗi vị trí trong 12 vị trí có 2..3 vai trò; mọi `chiSoQuanTrong` là chỉ số hợp lệ; vai trò của thủ môn chỉ dùng chỉ số mà thủ môn có (bất biến giống test đã có cho `POSITION_WEIGHTS`); mỗi vai trò có `moTa` không rỗng.
- `chiSoChuaDat`: trả đúng chỉ số dưới 10 kèm giá trị; hồ sơ đủ và cao thì trả rỗng.
- `CAC_CHI_THI`: đúng 6 chỉ thị; mỗi mức có câu đánh đổi không rỗng; `CHI_THI_MAC_DINH` có đủ 6 khoá và **không sinh xung đột nào**.
- `cacXungDot`: bẫy việt vị bật + đội hình thấp → có xung đột; pressing cao + đội hình thấp → có; tấn công biên + đội hình hẹp → có; bộ cân bằng → rỗng.
- `xepLaiKhiDoiSoDo`: **không mất cầu thủ nào** (tổng người trên sân + người bị đẩy ra = tổng người ban đầu); đổi 4-4-2 sang 4-3-3 thì trung vệ vẫn ở trung vệ; sơ đồ mới ít ô ở một tuyến thì người thừa bị đẩy ra ngoài và được nêu tên; tất định — gọi hai lần ra cùng kết quả (P1); lượt đổi cặp thật sự cải thiện được một tình huống cụ thể mà tham lam thuần làm sai.
- `tinhTrangDoiHinh`: thiếu người, thiếu thủ môn, có cầu thủ hồ sơ chưa hoàn tất — mỗi trường hợp nêu đúng lý do.

**Bắt buộc có test — lớp dữ liệu:**
- Nâng `DB_VERSION` 1 → 2 trên database đã có đội: store `tactics` được tạo, mỗi đội có một chiến thuật mặc định, không đội nào mất dữ liệu.
- `tacticRepo`: lưu rồi đọc lại ra đúng; đội chưa có chiến thuật thì tự tạo bộ mặc định; lưu bộ có tên không làm đổi bộ đang dùng; áp dụng bộ có tên thì `activeTacticId` đổi; bộ chiến thuật sai hình dạng bị từ chối.
- Xoá đội thì chiến thuật của đội đó cũng bị xoá, không để lại bản ghi mồ côi (giống cách GĐ1 dọn cầu thủ và ảnh).
- **Tệp sao lưu ba phiên bản:** xuất v3 rồi nhập lại ra đúng chiến thuật; nhập tệp **v2** (chưa có chiến thuật) thì mọi đội được gán bộ mặc định; nhập tệp **v1** cũng vậy; tính tất-cả-hoặc-không-gì vẫn giữ.

**Thủ công:**
- Kéo bằng chuột: vào ô trống, vào ô đã có người (đổi chỗ), ra ngoài sân.
- **Chỉ bằng bàn phím:** xếp trọn một đội hình 11 người, không chạm chuột (AC-5.9).
- Đổi sơ đồ khi đã xếp đủ 11 người và đọc thông báo xem ai bị đẩy ra.
- Chọn một tổ hợp chỉ thị xung đột và xác nhận là cảnh báo chứ không chặn.
- Rời trang rồi quay lại, kiểm sơ đồ/vai trò/chỉ thị còn nguyên.

## II.8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| R6 | Nâng `DB_VERSION` làm hỏng dữ liệu đang có của người dùng | Thấp | **Cao** | Bước nâng cấp chỉ THÊM store và THÊM trường, không sửa và không xoá gì. Có test nâng cấp chạy trên một database đã có đội, cầu thủ và ảnh. **Không** thêm lời nhắc nào vào giao diện: một dải cảnh báo "hãy sao lưu trước khi cập nhật" là yêu cầu mới không có AC, và đó đúng là kiểu scope creep mà `/analyze` đã bắt ở Phần I (mục #7 của lần soát đó). Việc nhắc người dùng sao lưu trước khi cập nhật là chuyện nói với họ khi bàn giao, không phải chức năng của app |
| R7 | `@dnd-kit` làm bundle phình, hoặc phần bàn phím không đạt như quảng cáo | Trung bình | Trung bình | Đo bundle **trước và sau** khi thêm, ghi số thật vào plan. Nếu phần bàn phím không dùng được thì đường lùi là bổ sung cơ chế chọn-rồi-đặt bằng Enter cho riêng bàn phím, giữ kéo-thả cho chuột — chấp nhận hai đường code, vì AC-5.9 không thương lượng được |
| R8 | Thuật toán xếp lại người (D14) cho kết quả mà người dùng thấy vô lý | Trung bình | Trung bình | Test trên các tình huống đổi sơ đồ thực tế. Thông báo luôn nêu rõ ai bị đẩy ra và ai bị xếp sai, nên người dùng sửa lại được bằng tay thay vì phải đoán |
| R9 | Sơ đồ 11 ô với toạ độ phần trăm trông lệch trên màn hình hẹp | Trung bình | Thấp | Sân giữ tỉ lệ cố định; dưới một bề rộng nhất định thì danh sách ngoài sân xuống dưới sân thay vì nằm cạnh |

**Rollback:** mỗi lát cắt là một commit chạy được. Riêng việc nâng `DB_VERSION`
**không lùi được bằng `git revert`** — bản cũ sẽ không mở nổi database phiên bản
2, vì IndexedDB từ chối mở một database có phiên bản cao hơn phiên bản code yêu
cầu. Đường lùi duy nhất trong trường hợp đó là xoá database rồi nhập lại từ tệp
sao lưu. Đây là việc cần nói với người dùng trước khi bàn giao lát 5, chứ không
phải thứ app tự xử lý.

## II.9. Thứ tự triển khai

1. **Lát 5 — Dữ liệu và luật, chưa có giao diện.** `formations.ts`, `misplacement.ts`, `roles.ts`, `instructions.ts`, `lineup.ts` cùng toàn bộ test; nâng `DB_VERSION` lên 2 và `tacticRepo`. Kết thúc: test xanh, ứng dụng vẫn chạy y như Giai đoạn 1, dữ liệu cũ còn nguyên. Lát này không cho người dùng thêm gì — giữ nó nhỏ, nhưng nó phải đi trước vì mọi thứ sau đều dựa vào nó.
2. **Lát 6 — Sân và xếp người.** AC-5.1 → AC-5.6, AC-5.9, AC-5.10. Kết thúc: mở trang chiến thuật, chọn sơ đồ, kéo người vào ô bằng chuột **và** bằng bàn phím, thấy mức sai vị trí, rời trang rồi quay lại vẫn còn.
3. **Lát 7 — Vai trò và tình trạng đội hình.** AC-6.1 → AC-6.6, AC-5.7, AC-5.8. Kết thúc: mỗi ô có vai trò đổi được, có cảnh báo cầu thủ chưa đáp ứng vai trò, đổi sơ đồ thì người được xếp lại và biết ai bị đẩy ra.
4. **Lát 8 — Chỉ thị đội và bộ chiến thuật có tên.** AC-7.1 → AC-7.6, và tệp sao lưu v3. Kết thúc: đặt được 6 chỉ thị với câu đánh đổi và cảnh báo xung đột, lưu và chọn lại bộ chiến thuật có tên, xuất/nhập tệp giữ đủ chiến thuật, tệp v1 và v2 cũ vẫn nhập được. Giai đoạn 2 hoàn tất.

Lát 5 đi trước vì nếu `mucSaiViTri` hay `xepLaiKhiDoiSoDo` sai thì mọi thứ vẽ
trên sân đều sai theo, và sai ở tầng luật thì nhìn vào giao diện không thấy được.
