# Plan: specs/001-football-team-sim

| Phần | Phạm vi | Trạng thái |
|---|---|---|
| **Phần I** | Giai đoạn 1 — tạo đội, cầu thủ, ảnh, sao lưu | Đã hiện thực xong (38/39 task, còn T035) |
| **Phần II** | Giai đoạn 2 — sơ đồ chiến thuật | Đã hiện thực xong trọn |
| **Phần III** | Giai đoạn 3 — engine giả lập và tường thuật | Đã hiện thực xong trọn (T066–T098) |
| **Phần IV** | Giai đoạn 4 — sân 2D và báo cáo sau trận | Mới lập, ngày 2026-10-28; đã sửa theo `/analyze` ngày 2026-10-29 |

Phần IV là phần cuối: sau nó spec 001 không còn user story nào chưa làm.

**Một thay đổi hành vi mà Phần IV công bố trước:** Giai đoạn 4 rút thêm số từ
`Rng` để gán hành động cho từng cầu thủ (quyết định D34), nên **mã trận lưu từ
Giai đoạn 3 không còn phát lại ra đúng trận cũ**. Xem D35 và rủi ro R16.

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

---

# PHẦN III — Giai đoạn 3: Engine giả lập và tường thuật

| | |
|---|---|
| **Phạm vi** | US-8 (giả lập một trận) và US-9 (theo dõi trận và can thiệp giữa trận) |
| **AC trong phạm vi** | AC-8.1 → AC-8.16, AC-9.1 → AC-9.10 — 26 AC |
| **Status** | Draft — đã sửa cả 10 phát hiện của `/analyze` ngày 2026-10-28 (3 CRITICAL, 2 HIGH, 5 MEDIUM/LOW) |
| **Updated** | 2026-10-28 |

Giai đoạn 1 và 2 đã hiện thực và kiểm chứng xong. US-10 (sân 2D) và US-11
(báo cáo sau trận, lịch sử 20 trận) thuộc **Giai đoạn 4**, có plan riêng —
phần này không chạm tới chúng.

## III.0. Những AC đang chờ giai đoạn này

Giai đoạn 1 và 2 để lại năm AC chỉ đóng được khi có trận đấu. Bảng này được
viết **trước khi thiết kế**, vì một ghi chú "hoãn sang giai đoạn sau" chỉ có
giá trị nếu giai đoạn sau thật sự mở nó ra đọc.

| AC | Phần còn thiếu | Giai đoạn 3 đóng được? |
|---|---|---|
| AC-3.5 | Logo đội hiện trong **màn hình trận đấu** | ✅ Có — màn hình trận ra đời ở lát 11 |
| AC-3.7 | Hai đội trùng màu áo thì **tự đổi một đội sang áo phụ trong trận** | ✅ Có — dùng `trungMauAo` đã có sẵn trong `domain/colors.ts`, áp ở màn hình chọn cặp đấu |
| AC-5.7 | Phần **chặn bắt đầu giả lập** | ✅ Có — chính là AC-8.9, dùng lại `tinhTrangDoiHinh` đã có |
| AC-4.2 | "lịch sử trận đấu còn nguyên sau khi mở lại" | ❌ **Không** — lịch sử là AC-11.7, thuộc US-11 = Giai đoạn 4 |
| AC-1.5 | "đổi tên đội thì **lịch sử trận đấu** đổi theo" | ❌ **Không** — cùng lý do |

**Cần người dùng biết:** chú thích trong `spec.md` ghi phần lịch sử của AC-4.2
và AC-1.5 là "thuộc GĐ3", nhưng lịch sử trận đấu được định nghĩa ở AC-11.7
trong US-11, mà spec xếp US-11 vào **Giai đoạn 4**. Hai AC đó vì vậy **không**
đóng được ở giai đoạn này. Plan không tự sửa `spec.md`; đây là chỗ cần sửa chú
thích khi lập plan Giai đoạn 4.

## III.1. Kiểm tra hiến pháp

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập phải tái lập được | ✅ | Đây là giai đoạn P1 được viết ra để bảo vệ. Toàn bộ ngẫu nhiên đến từ **một** `Rng` sinh từ mã trận, tiêu thụ theo thứ tự cố định. Engine không gọi `Math.random`, `Date.now`, `crypto`. Đồng hồ nằm ở giao diện, không nằm trong engine (D21). Can thiệp giữa trận được ghi thành danh sách kèm phút và phát lại y nguyên (D30). Có test diff từng dòng sự kiện giữa hai lần chạy |
| P2 Luật bóng đá tách khỏi giao diện | ✅ | Tầng `engine/` mới, là lớp trong cùng, không import `ui`, `hooks`, `services`, `storage`. Câu tường thuật **không** nằm trong engine: engine phát ra sự kiện có cấu trúc kèm chỉ số mẫu câu, giao diện mới dựng thành câu (D22). `boundaries.test.ts` được mở rộng để canh tầng mới |
| P3 Dữ liệu người dùng là bất khả xâm phạm | ✅ | Giai đoạn này **không ghi gì xuống IndexedDB**: trận đang chạy sống trong bộ nhớ, đóng app là mất (AC-9.10 nói đúng như vậy). Không có migration, `DB_VERSION` giữ 2, `SCHEMA_VERSION` giữ 3 |
| P4 Chạy offline | ✅ | Không thêm phụ thuộc nào, không gọi mạng. Nguồn ngẫu nhiên tự viết khoảng 20 dòng (D19) |
| P5 Mỗi AC dạng so sánh phải có test | ⚠️ | Giai đoạn này có **bốn** AC dạng so sánh — AC-8.3, AC-8.4, AC-8.5, AC-8.8 — và là loại khó nhất từ trước tới giờ: phải chạy engine nhiều lần rồi so trung bình. Mục III.7 dành riêng cho chúng, và `spec.md` mục 7 đã ghi sẵn hai dòng Definition of Done cho đúng việc này. Đánh ⚠️ vì đây là rủi ro R14, không phải vì định bỏ qua |
| P6 Mỗi giai đoạn bàn giao tự chạy được | ✅ | Kết thúc giai đoạn: chọn hai đội, đăng ký 11+7, xem trận chạy theo phút, can thiệp, đọc dòng sự kiện đầy đủ. Không cần Giai đoạn 4 để dùng được |
| P7 Tệp sao lưu mở lại được | ✅ | Không đổi định dạng tệp. Tệp v3 xuất ở Giai đoạn 2 vẫn là tệp v3 |
| P8 Giao diện tiếng Việt | ✅ | Toàn bộ câu tường thuật, nhãn, thông báo nằm ở `ui/tuongThuat.ts` và `ui/strings.ts`. Rút kinh nghiệm Giai đoạn 2: phần trình đọc màn hình cũng là giao diện — dòng tường thuật chạy trong vùng `aria-live` tiếng Việt |
| P9 Bàn phím và chữ đọc được | ✅ | Tạm dừng / tiếp tục / đổi tốc độ / thay người đều là nút bấm thường, đi được bằng Tab. Tình trạng **kiệt sức có nhãn chữ**, không chỉ đổi màu — spec mục 6 nói thẳng điều này |

**Ngoại lệ xin miễn trừ:** Không.

## III.2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** như cũ — React 18 + TypeScript strict + Vite, Tailwind.
- **Phụ thuộc mới:** **Không.** Nguồn ngẫu nhiên tất định tự viết (xem D19).
- **Vùng code bị chạm:**
  - `src/engine/` — **tầng mới**, toàn bộ luật trận đấu.
  - `src/domain/` — chỉ **đọc lại**, không sửa: `attributes`, `roles`,
    `instructions`, `misplacement`, `lineup`, `colors`, `formations`.
  - `src/hooks/useMatch.ts` — điều phối đồng hồ, tốc độ, tạm dừng.
  - `src/store/appStore.ts` — thêm lát trạng thái trận đang chạy.
  - `src/ui/pages/` — `ChonCapDau.tsx`, `TrangTran.tsx`.
  - `src/ui/components/` — `DangKyDoiHinh.tsx`, `DongTuongThuat.tsx`,
    `BangDieuKhienTran.tsx`, `ThayNguoi.tsx`.
  - `src/ui/tuongThuat.ts` — mẫu câu tường thuật.
  - `src/domain/boundaries.test.ts` — thêm luật canh cho `engine/`.

## III.3. Kiến trúc

Tầng mới `engine/` là lớp trong cùng, ngang hàng `domain/` và được phép đọc
`domain/` (luật bóng đá dùng chung), nhưng không ai dưới nó.

```
engine/            rng.ts          mã trận -> Rng tất định; không có nguồn ngẫu nhiên toàn cục
  (thuần, trong    vung.ts         lưới vùng sân 3 cột x 4 dải, luật dịch chuyển bóng
   cùng nhất)      sucManh.ts      sức mạnh cầu thủ trong một tình huống
                   theLuc.ts       tiêu hao thể lực theo phút
                   the.ts          xác suất thẻ vàng/đỏ
                   chuoiBong.ts    một chuỗi kiểm soát bóng -> kết cục
                   suKien.ts       kiểu sự kiện + chọn mật độ 60..100 dòng
                   tran.ts         máy trạng thái: taoTran / buocTiep / apDungCanThiep
                   batDau.ts       điều kiện bắt đầu trận (AC-8.9, AC-8.10, AC-9.9)
hooks/             useMatch.ts     đồng hồ, tốc độ, tạm dừng, chạy hết
store/             appStore.ts     + lát `tran` (chỉ trong bộ nhớ)
ui/pages/          ChonCapDau.tsx  TrangTran.tsx
ui/components/     DangKyDoiHinh.tsx  DongTuongThuat.tsx
                   BangDieuKhienTran.tsx  ThayNguoi.tsx
ui/                tuongThuat.ts   mẫu câu tiếng Việt cho từng loại sự kiện
```

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| D18 | Engine nằm ở đâu | Thư mục `engine/` **mới**, ngang hàng `domain/`, được đọc `domain/` | Nhét vào `domain/` cho gọn | Hiến pháp mục 3 gọi tên `engine` là một lớp riêng, và `domain/` hiện là nơi chứa **dữ liệu luật tĩnh** (12 vị trí, 23 vai trò, 8 sơ đồ). Engine là **máy chạy**, có trạng thái theo thời gian. Trộn hai thứ thì `boundaries.test.ts` không còn phân biệt được "dữ liệu luật" với "máy giả lập", và `domain/` sẽ phình theo mỗi luật trận đấu mới |
| D19 | Nguồn ngẫu nhiên tất định | Tự viết `xmur3` (băm chuỗi mã trận thành hạt giống) + `mulberry32` (PRNG 32-bit), tổng khoảng 20 dòng, trả về đúng interface `Rng` đã có | Thư viện `seedrandom` | Hiến pháp cho thêm thư viện thoải mái, nhưng ở đây thư viện **không rẻ hơn**: 20 dòng tự viết, test được bằng vector cố định, và tránh được rủi ro một bản cập nhật thư viện đổi dãy số — mà đổi dãy số nghĩa là **mọi mã trận người dùng đã lưu đều phát lại sai** |
| D19b | | | `crypto.getRandomValues` | P1 cấm thẳng trong engine, và nó không nhận hạt giống nên không phát lại được |
| D20 | Hình dạng mã trận | 10 ký tự Crockford base32 (bỏ I, L, O, U để không nhầm khi đọc), ví dụ `K7M2R9XQ4B` | UUID v4 | 36 ký tự, người dùng không đọc hay gõ lại nổi. Mã trận là thứ người dùng chia sẻ và gõ lại để đấu lại đúng trận đó — nó phải ngắn và không có ký tự dễ nhầm |
| D21 | Ai giữ đồng hồ | **Giao diện** giữ đồng hồ; engine là bộ bước thuần: `buocTiep(trangThai)` trả trạng thái mới cho một phút | Engine tự chạy `setInterval` bên trong | P1 cấm nguồn thời gian trong engine. Quan trọng hơn: tách đồng hồ ra thì tạm dừng (AC-9.2), đổi tốc độ (AC-9.3) và chạy hết ngay (AC-9.4) đều **không đụng gì tới engine** — chỉ là gọi `buocTiep` nhanh hay chậm. Một thiết kế, ba AC |
| D22 | Câu tường thuật sinh ở đâu | Engine phát **sự kiện có cấu trúc** `{phut, loai, cacCauThu, vung, mauCau}`; `ui/tuongThuat.ts` dựng thành câu | Engine trả thẳng câu tiếng Việt | P2: câu chữ là giao diện. Nhưng lý do nặng hơn là P1 — AC-8.11 đòi **từng dòng sự kiện** giống hệt khi phát lại. Nếu giao diện tự chọn mẫu câu lúc hiển thị thì hai lần xem cùng một trận có thể ra chữ khác nhau. Cho nên engine chọn **chỉ số mẫu câu** bằng chính `Rng` của trận và ghi vào sự kiện; giao diện chỉ tra bảng |
| D23 | Mô hình sân | Lưới **3 cột x 4 dải** = 12 vùng; cột là trái/giữa/phải, dải đi từ sân nhà tới vòng cấm đối phương | Mô hình toạ độ liên tục x,y | Liên tục thì phải mô phỏng vị trí từng người theo thời gian — bài toán lớn hơn nhiều và không AC nào đòi. 12 vùng là đủ để "tấn công biên" và "pressing cao" thành con số đo được (AC-8.3, AC-8.4) |
| D23b | | | Một dãy 5 vùng theo chiều dọc, không có cột | Bỏ cột thì **không đo được** AC-8.3: "tấn công biên tạo nhiều quả tạt hơn trung lộ" cần phân biệt được bóng đang ở biên hay ở giữa |
| D24 | Chỉ thị tác động thế nào | Mỗi chỉ thị là **hệ số nhân** lên xác suất của vài loại hành động trong chuỗi bóng, khai thành một bảng duy nhất | Mỗi chỉ thị viết một nhánh `if` trong chuỗi bóng | Bảng thì đọc được cả 6 chỉ thị cùng lúc và chỉnh cân bằng không phải sửa logic. Nhánh `if` rải rác thì sau 6 chỉ thị nhân 3 mức là 18 nhánh chồng nhau, không ai dò nổi |
| D25 | Sức mạnh cầu thủ trong một tình huống | `sucManh = nền(chỉ số quan trọng của **vai trò**) x (1 − trừ sai vị trí) x hệ số thể lực x hệ số sân nhà` | Dùng thẳng `chiSoTongTheoViTri` đã có | `chiSoTongTheoViTri` cân theo **vị trí**, còn AC-6.x nói vai trò mới là thứ HLV đặt cho ô. Hai tiền đạo cùng vị trí nhưng một người là "Tiền đạo mục tiêu" (không chiến, sức mạnh) và một người là "Tiền đạo cắt mặt" (dứt điểm, tốc độ) phải khác nhau trong trận, nếu không thì cả US-6 là vô nghĩa. Vẫn **dùng lại** `ROLES[].chiSoQuanTrong` và `MUC_TRU_HIEU_SUAT` đã có, không khai bảng mới |
| D26 | Thể lực | Mỗi cầu thủ có thanh 100, giảm mỗi phút theo `the-luc` của cầu thủ và mức pressing của đội; dưới ngưỡng thì nhân hệ số phạt và phát sự kiện "kiệt sức" | Không mô phỏng thể lực, chỉ giảm hiệu suất theo phút | AC-8.6 đòi tốc độ giảm **phụ thuộc chỉ số Thể lực và cường độ pressing** — một hàm theo phút thuần tuý không thoả được |
| D27 | Giữ mật độ 60–100 dòng (AC-8.15) | Engine chấm mỗi tình huống một **điểm đáng kể**; bước chọn cuối giữ lại toàn bộ bàn thắng/thẻ/thay người/mốc hiệp, rồi lấy thêm theo điểm cho tới khi đạt dải 60–100 | Cứ phát mọi tình huống ra hết | Một trận có hàng trăm chuỗi bóng. Phát hết thì người dùng phải lội qua 400 dòng để tìm bàn thắng, và AC-8.15 nói thẳng "chỉ ghi những tình huống có ý nghĩa" |
| D27b | | | Phát ngẫu nhiên đủ 60–100 dòng | Số lượng thì đúng nhưng nội dung thành ra vô nghĩa — mất chính thứ AC-8.15 muốn |
| D28 | Thẻ và đá thiếu người | Thẻ sinh trong chuỗi bóng khi có lỗi; xác suất cao hơn khi `quyet-doan` thấp và khi đội pressing cao. Thẻ đỏ thì bỏ hẳn một ô khỏi đội hình tới hết trận | Thẻ chỉ là sự kiện trang trí, không ảnh hưởng thế trận | AC-8.13 nói rõ đội đó **phải đá thiếu người** và không được thay bù. Thẻ trang trí thì người dùng không có lý do gì để quan tâm tới `quyet-doan` hay mức pressing |
| D29 | Lợi thế sân nhà | Một hệ số nhân nhỏ duy nhất lên sức mạnh đội chủ nhà, tắt hoàn toàn khi chọn sân trung lập | Cộng thêm vào từng loại hành động | Một hệ số thì tắt được dứt khoát, và test "sân trung lập thì hai đội đối xứng" kiểm được bằng cách đổi chỗ hai đội rồi so kết quả |
| D30 | Can thiệp giữa trận và phát lại | Mỗi can thiệp được ghi `{phut, loai, chiTiet}` vào danh sách của trận; phát lại là chạy lại từ đầu với cùng mã trận rồi **áp lại đúng danh sách đó đúng phút** | Lưu ảnh chụp trạng thái tại mỗi phút rồi tua lại | Ảnh chụp trạng thái 90 phút x 22 cầu thủ là nhiều dữ liệu, và vẫn không phát lại được trận nếu người dùng đổi chiến thuật (AC-8.12). Chạy lại từ hạt giống thì cả hai AC cùng được phục vụ |
| D30b | **Can thiệp có hiệu lực từ lúc nào** (chốt sau `/analyze`) | Can thiệp được **xếp vào hàng đợi** `canThiepChoAp`, và `buocTiep` áp hết hàng đợi **ở đầu phút kế tiếp, trước khi mô phỏng phút đó**. Lúc chạy trực tiếp và lúc phát lại đi qua **cùng một đường** | Áp tức thì ngay khi người dùng bấm | Lúc chạy trực tiếp người dùng bấm ở giữa phút X, còn lúc phát lại danh sách được áp "tại phút X" — nếu hai thời điểm đó không trùng tuyệt đối thì thứ tự tiêu thụ `Rng` lệch và dòng sự kiện khác đi. Đó là lỗi bập bõm, khó lần nhất trong cả giai đoạn, nên phải chốt bằng thiết kế chứ không bằng cẩn thận |
| D31 | So sánh kết quả cùng mã trận (AC-8.12) | Giữ kết quả lần chạy trước **trong phiên làm việc**, so với lần mới | Lưu xuống IndexedDB ngay ở giai đoạn này | Lưu trận là AC-11.7, thuộc Giai đoạn 4. Làm trước ở đây là lấn phạm vi, và sẽ phải dựng store `matches` hai lần vì Giai đoạn 4 mới biết báo cáo sau trận cần lưu những gì. **Giả định được ghi nhận:** AC-8.12 không nói kết quả cũ phải sống qua lần đóng app; Giai đoạn 4 sẽ làm nó bền |
| D32 | Trận đang chạy sống ở đâu | Trong `appStore` (bộ nhớ), không ghi xuống IndexedDB | Ghi từng phút xuống IndexedDB cho an toàn | AC-9.10 nói đóng app giữa trận thì **trận bị huỷ** — đó là hành vi spec yêu cầu, không phải thiếu sót. Ghi từng phút còn làm hỏng ngân sách dưới 3 giây của chế độ chạy hết |

## III.4. Mô hình dữ liệu

**Không đổi gì dưới đĩa.** `DB_VERSION` giữ **2**, `SCHEMA_VERSION` giữ **3**,
không thêm store, không có migration, định dạng tệp sao lưu không đổi.

Trạng thái trận chỉ tồn tại trong bộ nhớ:

```
TrangThaiTran
  maTran          string            10 ký tự base32
  hatGiong        number            trạng thái 32-bit của Rng — XEM GHI CHÚ (1) DƯỚI ĐÂY
  phut            number            1..90 + bù giờ
  hiep            1 | 2
  buGio           { hiep1: number, hiep2: number }   mỗi hiệp 1..5, chốt lúc tạo trận
  tiSo            { nha: number, khach: number }
  ben             { nha: BenTran, khach: BenTran }
  cacSuKien       SuKien[]          dòng sự kiện đã phát
  canThiep        CanThiep[]        nhật ký can thiệp, để phát lại (P1)
  canThiepChoAp   CanThiep[]        hàng đợi, áp vào đầu phút kế tiếp — xem D30
  ketThuc         boolean

BenTran
  teamId              string
  chienThuatXuatPhat  Tactic        BẤT BIẾN — xem ghi chú (2)
  chienThuatHienTai   Tactic        đổi theo can thiệp giữa trận
  trenSan             string[]      11 playerId lúc bắt đầu, giảm dần khi có thẻ đỏ
  duBi                string[]      7 playerId
  theLuc              Record<playerId, number>    0..100
  the                 Record<playerId, 'vang' | 'vang-vang' | 'do'>
  soLanThay           number        tối đa 5
  mauAoDangDung       'chinh' | 'phu'   AC-3.7
  thongKe             ThongKeBen    bộ đếm thô — xem ghi chú (3)

ThongKeBen
  cuSut               number
  sutTrungDich        number
  tatCanh             number        AC-8.3 đếm cái này
  coHoiRoRang         number
  cuopBongDaiCao      number        AC-8.4, chiều thứ nhất
  biThoatXuong        number        AC-8.4, chiều thứ hai
  theVang             number
  theDo               number
  dongGopTheoCauThu   Record<playerId, number>   AC-8.5 đọc cái này

SuKien
  phut            number
  buGio           boolean
  loai            'ban-thang' | 'co-hoi' | 'cuu-thua' | 'tat-canh' | 'cuop-bong-cao'
                  | 'thoat-xuong' | 'the-vang' | 'the-do' | 'thay-nguoi'
                  | 'kiet-suc' | 'het-hiep' | ...
  doi             'nha' | 'khach'
  cacCauThu       string[]          người liên quan, theo thứ tự vai trò trong tình huống
  vung            VungSan
  mauCau          number            chỉ số mẫu câu, engine chọn bằng Rng của trận (D22)
  tiSoSauDo       { nha: number, khach: number }

CanThiep
  phut            number
  doi             'nha' | 'khach'   chỉ cho phép đội của người dùng (AC-9.8)
  loai            'thay-nguoi' | 'doi-chi-thi' | 'doi-vai-tro'
  chiTiet         ...
```

**(1) Vì sao hạt giống nằm TRONG trạng thái.** `Rng` là đối tượng có trạng
thái thay đổi. Nếu nó sống ngoài `TrangThaiTran` thì `buocTiep` không còn là
phép chuyển trạng thái thuần: gọi hai lần trên cùng một trạng thái ra hai kết
quả khác nhau, và React gọi đúp (StrictMode) hay người dùng bấm đúp là lệch
ngay — đúng loại lỗi P1 sinh ra để chặn. Trạng thái của `mulberry32` chỉ là
**một số 32-bit**, nên đưa vào trạng thái trận là rẻ. `buocTiep` đọc
`hatGiong`, chạy, rồi trả `hatGiong` mới cùng trạng thái mới.

**(2) Vì sao tách chiến thuật xuất phát khỏi chiến thuật hiện tại.** P1 định
nghĩa phát lại bằng *(mã trận + hai đội + **chiến thuật xuất phát hai bên** +
đội chủ nhà + chuỗi can thiệp)*. Nếu chỉ có một trường và can thiệp giữa trận
ghi đè lên nó thì ngay sau lần đổi chỉ thị đầu tiên, **vế "chiến thuật xuất
phát" biến mất khỏi trạng thái** và không còn dựng lại được đầu vào để phát
lại. Hai trường tách bạch thì `TrangThaiTran` tự nó mang đủ mọi thứ cần để
phát lại chính nó.

**(3) Vì sao cần bộ đếm thô, tách khỏi dòng sự kiện.** `cacSuKien` đã đi qua
bộ lọc mật độ của D27, chỉ còn 60–100 dòng. Đếm số quả tạt từ danh sách đã
cắt là đo **màn hình**, không đo **giả lập** — AC-8.3 khi đó có thể xanh hay
đỏ vì bộ lọc chứ không vì chỉ thị. `ThongKeBen` tăng trong lúc chạy và không
bao giờ bị cắt. Đây cũng là chỗ `TrangTran` lấy số cho bảng so sánh của
AC-8.12.

Giai đoạn này chỉ khai những bộ đếm mà AC-8.3, AC-8.4, AC-8.5 và AC-8.12 cần.
Giai đoạn 4 (AC-11.2, AC-11.3) sẽ thêm bộ đếm của nó vào cùng chỗ — không
khai trước ở đây.

## III.5. Contracts

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `taoRng` | `maTran: string` | `Rng` | — (mọi chuỗi đều băm được) |
| `taoMaTran` | `rng: Rng` | `string` 10 ký tự | — (nguồn ngẫu nhiên thật do **giao diện** tạo, như `FormCauThu` đã làm ở GĐ1) |
| `kiemTraBatDauDuoc` | `{ doiNha, doiKhach, dangKyNha, dangKyKhach }` | `{ batDauDuoc: true }` hoặc `{ batDauDuoc: false, cacLyDo }` | — (trả lý do, không ném) |
| `taoTran` | `CauHinhTran` | `TrangThaiTran` ở phút 0 | `InvalidMatchSetup` nếu cấu hình không qua `kiemTraBatDauDuoc` |
| `buocTiep` | `TrangThaiTran` | `TrangThaiTran` mới, tiến đúng **một phút**. **Hàm thuần**: cùng đầu vào luôn ra cùng đầu ra, vì hạt giống nằm trong trạng thái | — (trận đã kết thúc thì trả nguyên trạng) |
| `chayHetTran` | `TrangThaiTran` | `TrangThaiTran` đã kết thúc | — |
| `apDungCanThiep` | `TrangThaiTran`, `CanThiep` | `{ thanhCong: true, trangThai }` hoặc `{ thanhCong: false, lyDo }` — chỉ **xếp vào hàng đợi** `canThiepChoAp`, không đổi thế trận ngay (D30) | `het-luot-thay`, `khong-phai-doi-cua-ban`, `cau-thu-khong-trong-danh-sach`, `da-nhan-the-do` |
| `dungCauTuongThuat` *(ui)* | `SuKien`, bảng tên cầu thủ | `string` tiếng Việt | — |

`FORMATIONS`, `ROLES`, `CHI_THI`, `MUC_TRU_HIEU_SUAT`, `mucSaiViTri`,
`tinhTrangDoiHinh`, `trungMauAo` **dùng lại nguyên** từ `domain/`, không khai lại.

## III.6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-8.1 | `tran.ts` — hai hiệp 45 phút, bù giờ 1–5 phút mỗi hiệp chốt lúc `taoTran` bằng `Rng`; hoà là kết cục hợp lệ |
| AC-8.2 | `SuKien.cacCauThu` — mọi sự kiện đều mang playerId của người đang trên sân tại phút đó |
| AC-8.3 | Bảng hệ số D24: `huong-tan-cong` nhân xác suất chuỗi bóng đi vào cột biên và xác suất hành động `tat-canh`. **Có test so sánh 10 lần chạy** |
| AC-8.4 | `cuong-do-pressing` nhân **hai** thứ ngược chiều nhau: xác suất cướp bóng ở dải cao, và xác suất đối thủ thoát xuống sau lưng. **Có test so sánh** |
| AC-8.5 | `sucManh.ts` nhân `(1 − MUC_TRU_HIEU_SUAT[mức sai])` — dùng lại đúng bảng của AC-5.5. **Có test ba mức giảm dần** |
| AC-8.6 | `theLuc.ts` — giảm theo phút, tốc độ phụ thuộc `the-luc` và mức pressing |
| AC-8.7 | Ngưỡng kiệt sức dẫn tới hệ số phạt trong `sucManh.ts`, cộng sự kiện `kiet-suc` hiện **nhãn chữ** ở giao diện (P9) |
| AC-8.8 | Toàn bộ engine. **Có test**: đội A hơn 5 điểm mọi chỉ số thắng ít nhất 7 trong 10 trận |
| AC-8.9 | `batDau.ts` gọi `tinhTrangDoiHinh` của `domain/lineup.ts` cho cả hai đội — **đóng nốt AC-5.7** |
| AC-8.10 | `batDau.ts` — cùng một `teamId` cho hai phía thì không bắt đầu được |
| AC-8.11 | `taoRng(maTran)` cộng thứ tự tiêu thụ cố định cộng `canThiep[]` phát lại. **Có test diff từng dòng sự kiện** |
| AC-8.12 | `TrangTran` giữ kết quả lần trước của cùng mã trận trong phiên và hiện bảng so sánh (D31) |
| AC-8.13 | `the.ts` — xác suất theo `quyet-doan` và mức pressing; thẻ đỏ bỏ ô khỏi đội hình, chặn thay bù |
| AC-8.14 | `sucManh.ts` hệ số sân nhà, tắt hoàn toàn khi chọn sân trung lập (D29) |
| AC-8.15 | `suKien.ts` bước chọn mật độ (D27). **Có test dải 60..100 trên nhiều hạt giống** |
| AC-8.16 | `SuKien.mauCau` cộng nhiều mẫu câu mỗi loại trong `ui/tuongThuat.ts`. **Có test**: 5 trận liên tiếp không lặp nguyên câu cho cùng loại |
| AC-9.1 | `TrangTran` và `DongTuongThuat` — tỉ số và phút luôn nhìn thấy, dòng chạy dần |
| AC-9.2 | `useMatch` dừng gọi `buocTiep`; trạng thái đứng nguyên vì engine không có đồng hồ (D21) |
| AC-9.3 | `useMatch` — 3 mức: thường 200ms mỗi phút, nhanh, rất nhanh |
| AC-9.4 | `chayHetTran` rồi hiện trọn dòng sự kiện |
| AC-9.5 | `apDungCanThiep` loại `thay-nguoi`, ghi sự kiện tại phút đó, các phút sau tính theo người mới |
| AC-9.6 | `BenTran.soLanThay` — lần thứ 6 bị từ chối kèm lý do `het-luot-thay` |
| AC-9.7 | Can thiệp chỉ đổi trạng thái **từ phút hiện tại trở đi**; các phút đã qua nằm trong `cacSuKien` và không bao giờ bị tính lại |
| AC-9.8 | `apDungCanThiep` từ chối can thiệp vào đội không phải của người dùng |
| AC-9.9 | `DangKyDoiHinh` — đúng 11 chính và đúng 7 dự bị; người ngoài 18 không dùng được trong trận |
| AC-9.10 | `TrangTran` gắn `beforeunload` khi trận đang chạy; rời đi thì trận mất (D32) |
| AC-3.5 *(đóng nốt)* | Logo hai đội hiện ở `ChonCapDau` và đầu `TrangTran` |
| AC-3.7 *(đóng nốt)* | `ChonCapDau` gọi `trungMauAo`; trùng thì đội khách chuyển `mauAoDangDung: 'phu'` và nói rõ cho người dùng. Nếu áo phụ của khách **cũng trùng** thì giữ áo chính và báo người dùng tự đổi màu — ứng dụng không tự chế ra màu thứ ba |
| AC-5.7 *(đóng nốt)* | AC-8.9 ở trên |

## III.7. Chiến lược kiểm thử

**Unit (bắt buộc — hiến pháp mục 4: engine là lớp bắt buộc có test):**
- `rng.ts`: cùng mã trận ra cùng dãy số; hai mã khác nhau ra dãy khác; dãy
  cố định theo vector ghi trong test, để sau này đổi code mà lỡ đổi dãy là đỏ.
- `vung.ts`, `sucManh.ts`, `theLuc.ts`, `the.ts`: từng hàm một.
- `tran.ts`: 90 phút cộng bù giờ; hoà kết thúc hoà; thẻ đỏ làm đội còn 10 người.
- Bất biến: `boundaries.test.ts` mở rộng — `engine/` không import `ui`,
  `hooks`, `services`, `storage`; và **không chứa** `Math.random`, `Date.now`,
  `crypto.getRandomValues` (dùng lại đúng cách kiểm đã có ở `generator.test.ts`).

**Bốn AC dạng so sánh (P5) — mỗi cái một test riêng:**

| AC | Phép so sánh | Cách làm cho khỏi bấp bênh |
|---|---|---|
| AC-8.3 | Số quả tạt: tấn công biên so với trung lộ, **nhiều hơn ít nhất 50%** | Cùng 10 mã trận cố định cho cả hai cấu hình, so trung bình. Cùng đội, cùng đối thủ, chỉ đổi một chỉ thị |
| AC-8.4 | Pressing cao so với thấp: cướp bóng ở dải cao **tăng**, đồng thời đối thủ thoát xuống **cũng tăng** | Như trên. Phải kiểm **cả hai chiều**, vì chỉ kiểm một chiều thì một engine chỉnh ẩu vẫn qua |
| AC-8.5 | Đóng góp của một cầu thủ: đúng vị trí > sai nhẹ > sai vừa > sai nặng | Cùng mã trận, chỉ đổi ô của đúng một cầu thủ. Bốn lần chạy, so bốn con số |
| AC-8.8 | Đội mạnh hơn 5 điểm mọi chỉ số thắng **ít nhất 7 trong 10** | 10 mã trận cố định, bộ chỉ thị cân bằng cả hai bên, không ai xếp sai vị trí |

Những test này **chạy engine thật nhiều lần**, nên phải nhanh: ngân sách
dưới 3 giây một trận là cho chế độ chạy hết trên máy người dùng, còn trong test
thì một trận phải tính bằng mili-giây. Nếu không đạt, đó là tín hiệu engine làm
quá nhiều việc mỗi phút.

**Thủ công (những thứ chỉ kiểm tay mới thấy):**
- Xem trọn một trận ở tốc độ thường, tạm dừng giữa chừng, đổi tốc độ, chạy hết.
- Thay người ở phút 60, xác nhận các phút sau có tên người mới.
- Đổi chỉ thị giữa trận rồi đối chiếu: các dòng đã qua không đổi một chữ.
- Chạy lại cùng mã trận với cùng chuỗi can thiệp rồi **diff từng dòng** — đây là
  một trong hai dòng Definition of Done mà `spec.md` mục 7 đã ghi sẵn.
- Hai đội trùng màu áo thì một đội tự đổi sang áo phụ và nói rõ (AC-3.7).
- Thử đóng tab giữa trận để thấy cảnh báo (AC-9.10).

## III.8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| R10 | Engine cân bằng sai: AC-8.8 không đạt 7/10, hoặc tỉ số phi lý kiểu 10-9 mỗi trận | **Cao** | Cao | Bốn test so sánh ở III.7 được viết **ngay ở lát 10**, không để cuối giai đoạn. Cân bằng nằm trong một bảng hệ số (D24), chỉnh số không phải chỉnh logic |
| R11 | Mật độ 60–100 dòng không ổn định giữa các trận | Trung bình | Trung bình | Bước chọn mật độ (D27) là van chặn cứng; test chạy nhiều hạt giống và khẳng định dải |
| R12 | Chạy hết trận vượt ngân sách 3 giây | Trung bình | Trung bình | Engine là hàm thuần trên mảng số, không tạo chuỗi và không dựng câu chữ (D22 giúp chính chỗ này). Đo bằng `performance.now` quanh `chayHetTran`, ghi số thật vào mô tả commit |
| R13 | Tất định bị phá ngầm: duyệt `Map`/`Set`, `Object.keys` theo thứ tự chèn, hay số thực khác nhau giữa máy | Trung bình | **Cao** | Mọi vòng lặp ảnh hưởng tới `Rng` đi trên **mảng có thứ tự khai báo**. Test diff hai lần chạy bắt được phần lớn; phần còn lại là kỷ luật khi review |
| R14 | Bốn test so sánh bấp bênh — xanh đỏ thất thường theo hạt giống | **Cao** | Trung bình | Dùng **bộ mã trận cố định** ghi thẳng trong test, không sinh ngẫu nhiên lúc chạy. Nếu một test vẫn bấp bênh thì đó là engine chưa đủ phân biệt, không phải test xấu — ghi lại chứ không nới ngưỡng cho xanh |
| R15 | Giao diện trận đấu dính vào engine, sau này Giai đoạn 4 thêm sân 2D phải sửa cả hai | Trung bình | Trung bình | `TrangTran` chỉ đọc `cacSuKien` và `tiSo`. Sân 2D của Giai đoạn 4 cũng sẽ chỉ đọc đúng hai thứ đó cộng `vung` của sự kiện — đã có sẵn trong `SuKien` từ giai đoạn này |

**Rollback:** giai đoạn này **không đụng dữ liệu dưới đĩa** — không migration,
không đổi định dạng tệp. Gỡ bỏ bằng `git revert` là sạch, khác hẳn Giai đoạn 2
(nâng `DB_VERSION` không lùi được). Đây là lý do nên làm xong Giai đoạn 3 rồi
mới tính chuyện lưu lịch sử trận ở Giai đoạn 4.

## III.9. Thứ tự triển khai

1. **Lát 9 — Engine nền và tính tái lập.** `rng.ts`, `vung.ts`, `chuoiBong.ts`,
   `tran.ts`, `suKien.ts`. Kết thúc: chạy được trọn một trận trong test, ra tỉ
   số và dòng sự kiện; cùng mã trận hai lần ra kết quả giống từng dòng. Chưa
   có giao diện. AC-8.1, AC-8.2, AC-8.11, AC-8.15.
2. **Lát 10 — Chiến thuật tác động vào trận.** `sucManh.ts`, `theLuc.ts`,
   `the.ts`, bảng hệ số chỉ thị. Kết thúc: **bốn test so sánh của P5 đều xanh**.
   AC-8.3 đến AC-8.8, AC-8.13, AC-8.14.
3. **Lát 11 — Màn hình trận.** `ChonCapDau`, `DangKyDoiHinh`, `TrangTran`,
   `DongTuongThuat`, `BangDieuKhienTran`, `ui/tuongThuat.ts`. Kết thúc: người
   dùng chọn được cặp đấu, đăng ký 11+7, xem trận chạy, tạm dừng, đổi tốc độ,
   chạy hết. AC-9.1 đến AC-9.4, AC-9.9, AC-9.10, AC-8.9, AC-8.10, AC-8.16, và
   đóng nốt AC-3.5, AC-3.7, AC-5.7.
4. **Lát 12 — Can thiệp giữa trận.** `ThayNguoi`, `apDungCanThiep`, bảng so
   sánh cùng mã trận. Kết thúc: thay người, đổi chỉ thị và vai trò giữa trận;
   phát lại đúng trận đó kèm chuỗi can thiệp; so được hai kết quả cùng mã trận.
   AC-9.5 đến AC-9.8, AC-8.12. Giai đoạn 3 hoàn tất.

Lát 9 và lát 10 đi trước toàn bộ giao diện vì lý do đã đúng ở Giai đoạn 2 và
còn đúng hơn ở đây: nếu engine sai cân bằng thì màn hình trận đẹp tới đâu cũng
chỉ là hiển thị một trận bóng vô lý, và nhìn vào giao diện **không thấy được**
sai ở đâu — chỉ bốn test so sánh mới chỉ ra.

---

# PHẦN IV — Giai đoạn 4: Sân 2D và báo cáo sau trận

| | |
|---|---|
| **Phạm vi** | US-10 (xem diễn biến trên sân 2D) và US-11 (đọc báo cáo sau trận, lịch sử 20 trận) |
| **AC trong phạm vi** | AC-10.1 → AC-10.6, AC-11.1 → AC-11.7 — 13 AC; cộng ba AC vắt lại: AC-4.2, AC-1.5, AC-4.7 |
| **Status** | Draft — đã sửa cả 13 phát hiện của `/analyze` ngày 2026-10-29 (2 CRITICAL, 3 HIGH, 5 MEDIUM, 3 LOW) |
| **Updated** | 2026-10-29 |

Giai đoạn 1, 2 và 3 đã hiện thực và commit; `spec.md` đang ở 84/99 AC tick.
Đây là giai đoạn cuối của spec 001: sau nó không còn user story nào chưa làm.

## IV.0. Những AC đang chờ giai đoạn này, và hai lỗi mang từ Giai đoạn 3

### Ba AC vắt lại

Mục III.0 đã nói trước là Giai đoạn 3 **không** đóng được hai AC dưới đây, vì
phần còn thiếu của chúng là lịch sử trận đấu — mà lịch sử được định nghĩa ở
AC-11.7, thuộc chính giai đoạn này.

| AC | Phần còn thiếu | Giai đoạn 4 đóng được? |
|---|---|---|
| AC-4.2 | "lịch sử trận đấu còn nguyên sau khi mở lại" | ✅ Có — lịch sử xuống IndexedDB ở lát 16 (D44) |
| AC-1.5 | "đổi tên đội thì lịch sử trận đấu đổi theo" | ✅ Có — tên đội trong lịch sử phân giải từ đội đang sống (D46) |
| AC-4.7 | "dung lượng trình duyệt đầy thì cảnh báo ngay rằng thay đổi chưa được lưu" | ✅ Có, và đây là **lần đầu quan sát được**: xem giải thích bên dưới |

**AC-4.7 vì sao tới giờ mới quan sát được.** Giai đoạn 1 đã dựng đủ đường
code: mọi lỗi ghi đi qua `LoiUngDung` rồi vào `datLoiLuuTru`, và dải cảnh báo
tiếng Việt đã có. Nhưng cả ba giai đoạn trước chỉ ghi những bản ghi nhỏ — một
đội, một cầu thủ, một ảnh đã nén ≤ 100KB — nên không có cách nào làm đầy
dung lượng bằng tay để xem dải đó hiện lên. Giai đoạn 4 là chỗ đầu tiên ghi
**hàng trăm KB mỗi lần**: một trận kèm dòng sự kiện đầy đủ. Lát 16 vì vậy đi
kèm một task kiểm tay AC-4.7 bằng cách ghi lịch sử trong tab đã bị siết quota.
Đây **không** phải yêu cầu mới — AC-4.7 đã có từ Giai đoạn 1 và chưa tick.

### Hai lỗi engine phát hiện ở T098, mang vào đây

| # | Lỗi | Vào phạm vi Giai đoạn 4? |
|---|---|---|
| 1 | `congThongKeCong` cộng `cuSut` và `coHoiRoRang` bằng **cùng một điều kiện** `kq.ketCuc === 'dut-diem'`, nên hai con số luôn bằng nhau | ✅ **Có** — người dùng yêu cầu nhặt vào, và AC-11.2 liệt kê hai con số này là hai chỉ tiêu riêng nên không sửa thì AC-11.2 không thể đúng (D37) |
| 2 | Hai loại sự kiện `cuu-thua` và `thoat-xuong` được khai trong `LoaiSuKien` và đã có đủ mẫu câu tiếng Việt ở `ui/tuongThuat.ts`, nhưng `loaiCuaChuoi` **không bao giờ trả về chúng** — chúng là loại sự kiện chết, chưa từng hiện ra trong một trận nào | `cuu-thua`: ✅ **Có** — `sutTrungDich` của AC-11.2 hiện bằng đúng số bàn thắng vì không có khái niệm cứu thua (D38). `thoat-xuong`: ❌ **Không** — xem bên dưới |

**`thoat-xuong` cố tình để ngoài phạm vi.** Hệ số `biThoatXuong` của D24 có tác
dụng thật và `ThongKeBen.biThoatXuong` được đếm thật, nên test so sánh của
AC-8.4 đo đúng cái nó phải đo. Chỗ thiếu chỉ là **dòng tường thuật**: người
dùng không bao giờ đọc được câu "thoát xuống sau lưng hàng phòng ngự" dù engine
có mô phỏng nó. Không AC nào trong Giai đoạn 4 cần con số này, nên plan
**không tự nhặt**: đây là một dòng đáng sửa nhưng nó thuộc AC-8.2 của Giai đoạn
3, và sửa nó đổi dòng sự kiện của mọi trận. Nếu người dùng muốn gộp vào Giai
đoạn 4 thì nói, plan sẽ thêm một quyết định và một task; còn không thì nó ở lại
đây như một ghi nhận.

## IV.1. Kiểm tra hiến pháp

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập phải tái lập được | ⚠️ | Engine vẫn nhận toàn bộ ngẫu nhiên từ một `Rng` sinh từ mã trận, vẫn không gọi `Math.random` / `Date.now` / `crypto`, và cùng một bộ đầu vào vẫn cho cùng từng dòng sự kiện **trong cùng một phiên bản engine**. Nhưng Giai đoạn 4 **rút thêm số** từ `Rng` để gán hành động cho cầu thủ (D34), nên **mã trận lưu từ Giai đoạn 3 không còn phát lại ra đúng trận cũ**. P1 nói "ở mọi lần chạy và mọi máy", không nói "qua mọi phiên bản", nên đây không phải vi phạm — nhưng nó là thứ phải nói thẳng với người dùng chứ không để họ tự phát hiện. Phương án bù: đóng `phienBanEngine` vào trận và vào mỗi bản ghi lịch sử, giao diện nói rõ khi hai phiên bản lệch nhau, và lịch sử lưu luôn dòng sự kiện nên xem lại trận cũ **không cần** chạy lại (D35). Đánh ⚠️ vì đây là rủi ro R16, không phải vì định bỏ qua |
| P2 Luật bóng đá tách khỏi giao diện | ✅ | Chấm điểm cầu thủ được P2 gọi tên là luật bóng đá, nên nó vào `engine/diemCauThu.ts`, không vào component báo cáo (D49). Sân 2D thì ngược lại: nó **chỉ đọc** sự kiện đã có và không chứa công thức nào. Màu áo được **gỡ khỏi** engine trong giai đoạn này (D39), vì màu áo không phải luật bóng đá. `boundaries.test.ts` canh như cũ |
| P3 Dữ liệu người dùng là bất khả xâm phạm | ✅ | Đây là giai đoạn đầu tiên engine ghi dữ liệu xuống đĩa. Ghi trận mới và xoá trận cũ nhất nằm trong **cùng một transaction** (D45). Lịch sử vào tệp sao lưu (D48) nên đường xuất vẫn là lưới an toàn cho toàn bộ dữ liệu. Store `matches` riêng chứ không nhét 20 trận vào một hàng `meta` (D44), để một lỗi ghi không làm mất cả lịch sử |
| P4 Chạy offline | ✅ | **Không thêm phụ thuộc nào.** Sân 2D là SVG viết tay (D41); không dùng thư viện đồ hoạ hay animation |
| P5 Mỗi AC dạng so sánh phải có test | ⚠️ | Giai đoạn 4 **không thêm** AC dạng so sánh nào. Nhưng D37 và D38 đổi ngữ nghĩa `cuSut` / `coHoiRoRang` / `sutTrungDich` và D34 đổi thứ tự tiêu thụ `Rng`, nên **bốn test so sánh của Giai đoạn 3 phải chạy lại và ghi lại số đo thật** (`sosanh.tanCongBien`, `sosanh.pressingCao`, `sosanh.saiViTri`, `sosanh.doiManhHon`). Mục IV.7 dành riêng một lát cho việc này. Đánh ⚠️ vì nếu một test đỏ sau khi đổi thì phải cân bằng lại engine, không được hạ ngưỡng. **Một chỗ `/analyze` chặn đúng lúc:** bản plan đầu định **bỏ** `dongGopTheoCauThu`, mà đó là phép đo duy nhất của AC-8.5 trong `sosanh.saiViTri.test.ts:30` — bỏ nó là xoá mất đầu vào của một test P5 chứ không phải làm lệch số, và "cân bằng lại engine" sẽ là cách sửa sai. D33b giữ trường đó lại |
| P6 Mỗi giai đoạn bàn giao tự chạy được | ✅ | Kết thúc giai đoạn: xem trận trên sân 2D hoặc ẩn nó đi, trận kết thúc thì đọc báo cáo đầy đủ, đấu lại ngay bằng một nút, và mở lại ứng dụng thì 20 trận gần nhất vẫn còn |
| P7 Tệp sao lưu mở lại được | ✅ | `SCHEMA_VERSION` 3 → 4, thêm migration v3→v4 chỉ mở chỗ trống `matches: []` (D48). Tệp v1, v2, v3 vẫn nhập được; test vòng tròn xuất/nhập đã có từ Giai đoạn 1 được mở rộng cho v4 |
| P8 Giao diện tiếng Việt | ✅ | Nhãn chỉ tiêu báo cáo, bảng giải thích điểm cầu thủ, nhãn từng điểm tròn trên sân, thông báo "lịch sử đã đủ 20 trận" — tất cả vào `ui/strings.ts`. Mẫu câu `cuu-thua` đã viết sẵn từ Giai đoạn 3, giờ mới dùng tới |
| P9 Bàn phím và chữ đọc được | ✅ | Nút ẩn/hiện sân 2D, nút đấu lại, bảng báo cáo đều đi được bằng Tab. Người tham gia tình huống được làm nổi bật bằng **viền và nhãn chữ**, không chỉ bằng màu (D42) — nền ở đây là màu áo người dùng tự chọn nên tương phản không thể phó cho may mắn. Mỗi điểm tròn có `aria-label` tiếng Việt |

**Ngoại lệ xin miễn trừ:** Không. Dấu ⚠️ ở P1 là một **thay đổi hành vi được
công bố**, kèm phương án bù ở D35 — không phải xin miễn trừ nguyên tắc.

## IV.2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** như cũ — React 18 + TypeScript strict + Vite, Tailwind.
- **Phụ thuộc mới:** **Không.**
- **Phiên bản dữ liệu:** `DB_VERSION` 2 → **3** (store `matches` mới),
  `SCHEMA_VERSION` 3 → **4** (tệp sao lưu mang lịch sử). Nhắc lại cảnh báo đã
  ghi trong `db.ts`: tăng `DB_VERSION` **không lùi được bằng `git revert`**,
  vì bản code cũ yêu cầu phiên bản thấp hơn và IndexedDB từ chối mở database
  có phiên bản cao hơn.
- **Vùng code bị chạm:**
  - `src/engine/tran.ts` — thống kê theo cầu thủ, gán hành động cho người,
    `cuu-thua`, sửa `cuSut`/`coHoiRoRang`, phút vào/ra sân, bỏ `mauAoDangDung`.
  - `src/engine/suKien.ts` — thêm `duongBong` vào `SuKien`.
  - `src/engine/diemCauThu.ts` — **file mới**, chấm điểm 1–10 kèm giải thích.
  - `src/engine/baoCao.ts` — **file mới**, gói báo cáo sau trận từ `TrangThaiTran`.
  - `src/engine/sosanh.*.test.ts` — chạy lại, ghi lại số đo.
  - `src/storage/db.ts` — store `matches`, `DB_VERSION` 3.
  - `src/storage/migrations.ts` — migration v3→v4.
  - `src/services/matchRepo.ts` — **file mới**, lưu/đọc/giữ 20 trận.
  - `src/services/tuyChonRepo.ts` — **file mới**, tuỳ chọn ẩn/hiện sân 2D (D51).
  - `src/services/backupSchema.ts`, `backupService.ts` — thân tệp v4.
  - `src/store/appStore.ts` — lát lịch sử và lát tuỳ chọn hiện sân 2D.
  - `src/hooks/useMatch.ts` — lưu trận khi kết thúc, đấu lại.
  - `src/ui/pages/TrangTran.tsx` — chỗ cho sân 2D và cho báo cáo.
  - `src/ui/pages/TrangLichSu.tsx` — **file mới**.
  - `src/ui/components/San2D.tsx`, `BaoCaoSauTran.tsx`, `BangDiemCauThu.tsx`,
    `DanhSachGhiBan.tsx` — **file mới**.
  - `src/ui/mauAo.ts` — **file mới**, quyết định áo chính/áo phụ dùng chung.
  - `src/ui/strings.ts` — nhãn mới.
  - `src/App.tsx` — thêm khung `lich-su`.

## IV.3. Kiến trúc

Không có tầng mới. Giai đoạn 4 làm dày thêm `engine/` (thống kê, chấm điểm,
đóng gói báo cáo), mở một store mới ở lớp lưu trữ, và thêm màn hình.

```
engine/            tran.ts          + ThongKeCauThu, gán hành động, cứu thua, phút vào/ra
                   suKien.ts        + duongBong cho sân 2D
                   diemCauThu.ts    MỚI: ThongKeCauThu + vị trí -> điểm 1..10 + giải thích
                   baoCao.ts        MỚI: TrangThaiTran -> BaoCaoTran (thuần, không I/O)
storage/           db.ts            + store `matches` và `matchSummaries`, DB_VERSION 3
                   migrations.ts    + v3 -> v4
services/          matchRepo.ts     MỚI: luu / danhSach / doc / giữ 20 trận gần nhất
                   tuyChonRepo.ts   MỚI: tuỳ chọn ẩn/hiện sân 2D, qua store `meta`
                   backupService.ts + lịch sử vào/ra tệp sao lưu, nhãn phiên bản 4
hooks/             useMatch.ts      + lưu trận lúc kết thúc, + đấu lại cùng cặp
store/             appStore.ts      + lát `lichSu`, + lát `hienSan2D`
ui/pages/          TrangTran.tsx    + sân 2D + báo cáo sau trận
                   TrangLichSu.tsx  MỚI: 20 trận gần nhất, mở lại xem báo cáo
ui/components/     San2D.tsx        MỚI: 22 điểm tròn, SVG
                   BaoCaoSauTran.tsx  BangDiemCauThu.tsx  DanhSachGhiBan.tsx  MỚI
ui/                mauAo.ts         MỚI: chọn áo chính/phụ, dùng chung hai chỗ
```

**Quyết định thiết kế** (tiếp số từ D32 của Giai đoạn 3):

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| D33 | Thống kê theo cầu thủ sống ở đâu | `ThongKeCauThu` cho từng cầu thủ, nằm trong `BenTran`, do engine điền từng phút | Giao diện tự dẫn xuất từ dòng sự kiện | D27 **lọc** dòng sự kiện xuống còn 60–100 dòng, nên nó không phải bản ghi đầy đủ của trận. Dẫn xuất từ đó thì mọi con số đều thiếu hụt một cách im lặng, mà AC-11.3 đòi số liệu thật để giải thích điểm. Thêm nữa P2 xếp "chấm điểm cầu thủ" vào engine |
| D33b | **`dongGopTheoCauThu` còn hay bỏ** (sửa sau `/analyze`) | **Giữ nguyên**, đặt cạnh `theoCauThu` chứ không thay thế | Bỏ nó đi cho gọn, vì `ThongKeCauThu` đã đầy đủ hơn | `sosanh.saiViTri.test.ts:30` cộng đúng trường này — nó là **phép đo duy nhất** của AC-8.5, một AC thuộc P5, và "đóng góp" không có định nghĩa nào khác trong dự án. Bỏ trường là làm đỏ một test của P5 mà không có con số nào thay vào. Thay bằng `banThang + kienTao + sutTrungDich` thì quá thô: `diemCuaChuoi` cho bàn thắng 100 điểm và cú sút 6 điểm, nên nó tách được **bốn** mức sai vị trí (số đo Giai đoạn 3: 33.8 / 31.9 / 29.3 / 22.7), còn một tổng số nguyên nhỏ thì bốn mức chìm trong nhiễu. Giữ một trường đã chạy đúng rẻ hơn mọi phương án khác |
| D34 | Gán hành động cho cầu thủ nào | Gán trong `tran.ts` **ngay sau** khi chuỗi bóng trả về, rút từ cùng một `Rng`, cân theo sức mạnh trong tình huống và theo mức phù hợp của vai trò với vùng xảy ra | Đẩy cả đội hình vào `chayChuoiBong` | `chuoiBong.ts` chỉ cần hai con số sức mạnh tổng và hai bộ hệ số chỉ thị. Nhồi đội hình vào thì nó phải biết vai trò, thể lực, thẻ — những thứ AC-8.3 và AC-8.4 không cần — và bốn test so sánh của P5 sẽ không còn đọc được là chúng đang đo cái gì |
| D34b | | | Rút người đều tay (uniform) | Trung vệ sẽ kiến tạo nhiều như tiền vệ cánh, và điểm cầu thủ ở AC-11.3 thành vô nghĩa — mà AC-11.3 nói thẳng là các tiêu chí phải **cân theo vị trí cầu thủ đã đá** |
| D34c | **Đường chuyền thuộc về ai** (thêm sau `/analyze`) | Gán người cho **từng bước** `chuyen` / `re-bong` của chuỗi, không chỉ cho bốn vai chính: mỗi bước rút một người từ những ô **tại hoặc kề** vùng của bước đó, cân theo sức mạnh; không ai khớp thì rút trong cả 11 người trên sân. `chuyenThanhCong` cộng theo bước; `chuyenHong` cộng **một lần cho người giữ bước cuối** khi chuỗi kết thúc `mat-bong` | Chỉ gán bốn vai mỗi chuỗi (bản plan trước `/analyze`) | AC-11.3 liệt kê **tỉ lệ chuyền chính xác** là một đầu vào của điểm. Một chuỗi có tới 12 bước mà chỉ gán bốn người thì 9 trong 11 người có `chuyenThanhCong = 0` và `chuyenHong = 0` suốt trận — tỉ lệ chuyền của họ không xác định, và điểm của họ mất một trong bảy tiêu chí. `/analyze` chỉ ra thêm là lỗ hổng này **xanh qua mọi test** mà plan mô tả, nên phải chặn bằng thiết kế |
| D34d | | | Lấy `chuyenHong` từ `cacHanhDong` | **Không lấy được:** `chuoiBong.ts:131` `return` ngay khi mất bóng, **trước khi** push hành động, nên đường chuyền hỏng không bao giờ là một `HanhDong`. Nguồn duy nhất là `ketCuc === 'mat-bong'` |
| D34e | | | Gán theo người gần vùng nhất, không rút ngẫu nhiên (rẻ hơn, không tốn lần rút) | Hai người cùng một ô thì **một người không bao giờ được chạm bóng**, và trung vệ nhận mọi đường chuyền đi qua vùng của mình suốt 90 phút. Phân bố ra thành vô lý, mà AC-11.3 đòi người dùng đọc được số liệu — số liệu vô lý thì lộ ra ngay |
| D35 | Mã trận cũ có phát lại đúng sau Giai đoạn 4 không | **Không, và nói thẳng ra.** Đóng `phienBanEngine` (số nguyên) vào `TrangThaiTran` và vào mỗi bản ghi lịch sử; Giai đoạn 4 tăng lên **2**. Phát lại bằng cách chạy lại chỉ được hứa **trong cùng một phiên bản engine**; giao diện nói rõ khi lệch. Lịch sử lưu luôn dòng sự kiện đầy đủ, nên xem lại trận cũ không bao giờ cần chạy lại (AC-11.4) | Dồn các lần rút mới xuống cuối mỗi phút để giữ nguyên dãy số cũ | Không làm được: gán người cho hành động phải biết vùng xảy ra, tức phải xảy ra ngay trong chuỗi; chỉ một lần rút thêm giữa chuỗi là cả dãy lệch. Và vờ như không lệch thì người dùng gõ lại mã cũ, nhận một trận khác, mà không ai nói cho họ biết — đúng kiểu lỗi mà P1 sinh ra để chặn |
| D35b | | | Bỏ chấm điểm cầu thủ để giữ dãy số | Bỏ hẳn AC-11.3, tức bỏ chính giá trị của US-11 |
| D36 | Tỉ lệ kiểm soát bóng (AC-11.2) | Tỉ lệ **số bước** chuỗi bóng (`cacHanhDong.length`) giữa hai bên, cộng dồn cả trận | Tỉ lệ số chuỗi bóng | Bên cầm bóng mỗi chuỗi do `rng.next() < 0.5` quyết, không phụ thuộc đội nào, nên tỉ lệ theo số chuỗi **luôn xấp xỉ 50/50** bất kể chiến thuật hay chỉ số — con số in cho người dùng sẽ vô nghĩa. Đếm theo bước thì hệ số `giuBong` của D24 và chênh lệch sức mạnh hiện ra đúng chỗ, và không tốn thêm lần rút nào |
| D36b | | | Đổi `rng.next() < 0.5` thành cân theo sức mạnh | Đổi chỗ đó là đổi cả cán cân trận đấu, kéo theo bốn test so sánh và toàn bộ việc cân bằng của Giai đoạn 3. D36 đạt đúng mục tiêu của AC-11.2 mà không mở lại phần đã cân |
| D37 | Sửa lỗi `cuSut` == `coHoiRoRang` | `cuSut` đếm mọi chuỗi kết thúc `dut-diem`. `coHoiRoRang` chỉ đếm phần con **sút từ trong vùng dứt điểm** (`laVungDutDiem(kq.vungKetThuc)`). `sutTrungDich` = bàn thắng + cú sút bị cứu | Đổi tên một trong hai cho khỏi trùng | Đổi tên là che lỗi. AC-11.2 liệt kê **ba** con số riêng, và AC-8.2 coi "cơ hội rõ ràng" là một loại tình huống riêng có mẫu câu riêng |
| D38 | Loại sự kiện `cuu-thua` | Phát thật: chuỗi kết thúc `dut-diem` mà không thành bàn thì rút **một lần** để chia thành "bị thủ môn cứu" hay "chệch khung"; bên sút ghi thêm `sutTrungDich`, và người **đang trong khung** bên kia — tra bằng `nguoiTrongKhung` đã có từ T096 — ghi `canCuu`; khung trống thì cú sút không tính là bị cứu | Để `cuu-thua` nằm đó không dùng, như Giai đoạn 3 | `sutTrungDich` của AC-11.2 không tính được nếu không có khái niệm cứu thua — hiện nó bằng đúng số bàn thắng, tức "sút trúng đích" và "ghi bàn" là một. Thêm nữa thủ môn hiện **không có số liệu nào** nên AC-11.3 không chấm nổi điểm cho họ |
| D39 | Màu áo trong trận | **Bỏ** trường `mauAoDangDung` khỏi `BenTran`. Quyết định đổi áo nằm trọn ở giao diện, trong `ui/mauAo.ts` dùng lại `trungMauAo` của `domain/colors.ts`, dùng chung cho màn chọn cặp đấu và sân 2D | Đặt đúng `mauAoDangDung` trong `taoTran` | Màu áo không phải luật bóng đá nên theo P2 nó không có việc gì trong engine. Trường đó hiện **luôn bằng `'chinh'`** cho cả hai bên và chưa có chỗ nào đặt — một trường luôn sai còn tệ hơn không có trường, vì nó mời người sau tin vào nó. Phải quyết **bây giờ**, trước khi AC-11.7 bắt đầu ghi `TrangThaiTran` xuống đĩa |
| D40 | Đường đi của bóng cho AC-10.2 | Thêm `duongBong: readonly VungSan[]` vào `SuKien`, lấy từ `kq.cacHanhDong` của chính chuỗi đó | Giao diện tự đoán đường đi từ trường `vung` của sự kiện | Chỉ có vùng kết thúc thì vẽ được một điểm, không vẽ được đường — mà AC-10.2 đòi "kèm thể hiện đường đi của bóng". Lấy từ `cacHanhDong` thì không tốn lần rút nào và vẫn tất định |
| D41 | Sân 2D vẽ bằng gì | **SVG** dựng lại từ sự kiện đang hiển thị; di chuyển bằng CSS transition; **không có vòng lặp animation** | `canvas` + `requestAnimationFrame` | 22 điểm tròn không cần canvas, mà vòng lặp animation chính là thứ sẽ phá ngân sách 3 giây ở chế độ chạy hết trận (AC-10.5). SVG còn gắn được `aria-label` tiếng Việt cho từng điểm và đi được bằng bàn phím, phục vụ P9 |
| D42 | Làm nổi bật người tham gia (AC-10.3) | Viền dày lên **cộng** nhãn chữ (số áo in đậm và thêm một dấu), chứ không chỉ đổi màu | Chỉ tô sáng bằng màu | P9 cấm truyền đạt thông tin quan trọng chỉ bằng màu sắc, và nền ở đây là **màu áo người dùng tự chọn** nên không kiểm soát được tương phản |
| D43 | Chế độ chạy hết trận khi sân 2D đang bật | Khi `chayHetTran`, giao diện **không vẽ** trạng thái trung gian: engine chạy một lèo rồi vẽ đúng một lần ở cuối | Vẫn vẽ từng phút nhưng bỏ transition | Vẽ 97 lần liên tiếp vẫn là 97 lần dựng lại DOM. Engine chạy hết trận trong ~4ms (số đo T097), nên phần duy nhất có thể làm vỡ ngân sách của AC-10.5 là giao diện — chỗ phải chặn là chỗ này |
| D44 | Lịch sử trận lưu ở đâu | Store `matches` **mới** trong IndexedDB, `DB_VERSION` 2 → 3; mỗi hàng là một trận đã kết thúc, có index theo thời điểm kết thúc | Lưu thành một mảng trong một hàng của store `meta` | 20 trận kèm dòng sự kiện đầy đủ là hàng trăm KB. Nhét vào một hàng thì mỗi lần lưu phải đọc-ghi lại toàn bộ, và một lỗi ghi làm mất cả 20 trận — trái P3 |
| D44b | **Trang lịch sử đọc gì** (thêm sau `/analyze`) | Store **thứ hai** `matchSummaries` giữ `TomTatTran` — bản ghi nhỏ, không có dòng sự kiện — ghi trong **cùng transaction** với `matches`. Trang lịch sử chỉ đọc store này; mở một trận mới đọc hàng nặng tương ứng | Dựng danh sách tóm tắt bằng `getAll('matches')` rồi cắt lấy vài trường | IndexedDB giải tuần tự **cả hàng**, nên `getAll` trên 20 trận là đọc hết hàng trăm KB dòng sự kiện chỉ để in ra 20 cái tỉ số — đâm thẳng vào ngân sách "mở app với 20 đội và 20 trận dưới **2 giây**" của spec mục 6. Hai store có nguy cơ lệch nhau, nên chúng dùng **đúng một** transaction, cùng lý do như D45 |
| D45 | Giữ đúng 20 trận gần nhất | Ghi trận mới **và** xoá những trận cũ nhất trong **cùng một transaction** | Xoá trước rồi ghi sau | Xoá trước mà ghi lỗi thì người dùng mất một trận cũ và không được gì thêm. P3 đòi tất-cả-hoặc-không-gì |
| D46 | Tên đội trong lịch sử | Bản ghi giữ **cả** `teamId` **và** ảnh chụp tên / màu / logo lúc trận diễn ra. Lúc hiển thị: đội còn tồn tại thì lấy từ đội đang sống; đội đã bị xoá thì rơi về ảnh chụp | Chỉ giữ `teamId` | Xoá đội là mất tên, mà mục 5 của spec nói trận cũ **vẫn phải xem lại được với tên đội lúc đó** |
| D46b | | | Chỉ giữ ảnh chụp tên | Đổi tên đội thì lịch sử vẫn mang tên cũ, trái AC-1.5 — chính nửa còn thiếu của AC-1.5 mà giai đoạn này phải đóng |
| D47 | Đấu lại ngay sau trận (AC-11.6) | Màn báo cáo có hai nút — "đấu lại cùng mã trận" và "đấu lại với mã mới" — cùng dựng lại `CauHinhTran` từ bản ghi trận vừa xong | Đưa người dùng về màn chọn cặp đấu với mã điền sẵn | AC-11.6 nói rõ "không phải cấu hình lại từ đầu". Quay về màn chọn cặp đấu thì người dùng phải chọn lại hai đội và đăng ký lại 11+7 |
| D48 | Tệp sao lưu có mang lịch sử không | **Có.** `SCHEMA_VERSION` 3 → 4, thân tệp thêm `matches: []`; migration v3→v4 chỉ mở chỗ trống. Hai việc `/analyze` chỉ ra phải làm kèm: (a) `backupService.ts:89` đang **ghi cứng** `schemaVersion: 3` lúc xuất, phải đổi thành 4 — bỏ sót thì tệp v4 mang nhãn v3, lúc nhập chạy migration v3→v4 và **đặt `matches: []`**, tức xoá sạch lịch sử khỏi chính bản sao lưu của người dùng; (b) chế độ nhập **gộp** (`CheDoNhap = 'gop'`, đã có từ Giai đoạn 1) phải **cắt còn 20 trận mới nhất** theo `ketThucLuc`, vì gộp 20 vào 20 ra 40 là phá trần của AC-11.7 | Để lịch sử ngoài tệp sao lưu | AC-4.2 đòi lịch sử còn nguyên sau khi mở lại, và P3 đặt đường xuất tệp làm lưới an toàn duy nhất cho dữ liệu người dùng. Lịch sử nằm ngoài tệp thì người dùng xuất rồi nhập lại là mất sạch 20 trận |
| D49 | Điểm cầu thủ tính ở đâu | `engine/diemCauThu.ts` — hàm **thuần** từ `ThongKeCauThu` cộng vị trí đã đá, trả về điểm 1–10 **kèm bảng các thành phần** đã cộng/trừ | Tính trong component báo cáo | P2 gọi tên "chấm điểm cầu thủ" là luật bóng đá. Và AC-11.3 đòi người dùng **xem được số liệu nào đã dẫn tới điểm đó**, nên hàm phải trả về cả phần giải thích chứ không chỉ một con số — giao diện chỉ in bảng ra |
| D50 | Phút vào sân / ra sân (AC-11.5) | `phutVao` và `phutRa` nằm trong `ThongKeCauThu`, engine đặt khi thay người và khi thẻ đỏ | Giao diện dẫn xuất từ danh sách `canThiep` | Thẻ đỏ **không phải** can thiệp, nên dẫn xuất từ `canThiep` sẽ bỏ sót người bị đuổi. Và một người có thể vừa vào sân từ băng ghế vừa bị đuổi sau đó — hai mốc, một người |
| D51 | Tuỳ chọn ẩn sân 2D (AC-10.6) | Lưu trong store `meta` đã có, qua một hàng khoá-giá trị, đọc/ghi bằng `services/tuyChonRepo.ts` **mới** — `ui` không được chạm `storage` (hiến pháp mục 3) nên phải có một file ở tầng `services` | `localStorage` | Ứng dụng hiện có **một** chỗ lưu dữ liệu là IndexedDB. Thêm `localStorage` là thêm một chỗ thứ hai mà tệp sao lưu không biết tới và P7 không phủ |

## IV.4. Mô hình dữ liệu

### Trong bộ nhớ — engine

`ThongKeBen` được bổ sung và sửa:

| Trường | Thay đổi | Phục vụ |
|---|---|---|
| `cuSut` | **Sửa ngữ nghĩa** — mọi chuỗi kết thúc `dut-diem` | AC-11.2 |
| `coHoiRoRang` | **Sửa ngữ nghĩa** — chỉ phần con sút từ trong vùng dứt điểm | AC-11.2, D37 |
| `sutTrungDich` | **Sửa ngữ nghĩa** — bàn thắng cộng cú sút bị cứu | AC-11.2, D38 |
| `soBuocGiuBong` | **Mới** — tổng số bước chuỗi bóng của bên này | AC-11.2 (kiểm soát bóng), D36 |
| `chuyenThanhCong` · `chuyenHong` | **Mới** — tổng của bên, để phép kiểm "tổng theo người bằng tổng theo bên" phủ được cả phần chuyền | AC-11.3, D34c |
| `dongGopTheoCauThu` | **GIỮ NGUYÊN** — là phép đo duy nhất của AC-8.5 | AC-8.5, D33b |
| `theoCauThu` | **Mới** — `Record<string, ThongKeCauThu>` | AC-11.3, AC-11.5 |
| `mauAoDangDung` | **Bỏ khỏi `BenTran`** | D39 |

`ThongKeCauThu` cho từng cầu thủ đã vào danh sách 18:

| Trường | Ý nghĩa | AC |
|---|---|---|
| `phutVao` / `phutRa` | `null` nghĩa là đá từ đầu / tới hết trận | AC-11.5 |
| `banThang` · `kienTao` | bàn và kiến tạo | AC-11.1, AC-11.3 |
| `cuSut` · `sutTrungDich` | sút và sút trúng đích | AC-11.3 |
| `chuyenThanhCong` · `chuyenHong` | để tính tỉ lệ chuyền chính xác; cộng theo **từng bước** chuỗi bóng (D34c) | AC-11.3 |
| `cuopBong` · `matBong` · `phamLoi` | cướp bóng, mất bóng, phạm lỗi | AC-11.3 |
| `canCuu` | số lần cứu thua; chỉ người **đang trong khung** có, tra bằng `nguoiTrongKhung` đã có sẵn trong `tran.ts` từ T096. Khung trống (thủ môn vừa bị đuổi, người dùng chưa chọn ai vào bắt gôn) thì cú sút **không** tính là bị cứu | AC-11.3, D38 |

`SuKien` thêm `duongBong: readonly VungSan[]` (D40).
`TrangThaiTran` thêm `phienBanEngine: number` (D35).

### Dưới đĩa — IndexedDB

`DB_VERSION` 2 → **3**, thêm **hai** store (D44, D44b):

| store | key | index | giá trị |
|---|---|---|---|
| `matches` | `id` của trận (uuid) | — | `TranDaLuu` — hàng nặng, có cả dòng sự kiện |
| `matchSummaries` | cùng `id` đó | `byKetThucLuc` — lấy 20 trận gần nhất và tìm trận cũ nhất | `TomTatTran` — hàng nhẹ |

`TomTatTran` là **tất cả** những gì trang lịch sử cần để vẽ một dòng, và
**không** có `cacSuKien` hay `baoCao`:

- `id`, `maTran`, `phienBanEngine`, `ketThucLuc`
- `tiSo`, `doiChuNha`
- cho mỗi bên: `teamId` và ảnh chụp `{ ten, mauChinh, mauPhu, logoImageId }` (D46)

Bước nâng lên phiên bản 3 cũng **ghi lại** hàng `meta.schemaVersion` thành
`SCHEMA_VERSION` mới. Hàng đó hiện chỉ được ghi lúc tạo database (`db.ts:123`),
nên máy đã có dữ liệu sẽ mãi mang số 3 và `docSchemaVersion()` thành câu nói
sai. Chưa có code sản phẩm nào đọc nó, nhưng để sai là để một cái bẫy.

`TranDaLuu` gồm đúng những gì AC-11.7 liệt kê, cộng hai thứ của plan:

- `id`, `maTran`, `phienBanEngine`, `ketThucLuc`
- `tiSo`, `doiChuNha`, `sanTrungLap`
- cho mỗi bên: `teamId`, **ảnh chụp** `{ ten, mauChinh, mauPhu, logoImageId }`
  (D46), `chienThuatXuatPhat`, 11 chính và 7 dự bị, `cacCauThu` (hồ sơ dùng
  trong trận)
- `canThiep` — toàn bộ chuỗi can thiệp kèm phút
- `cacSuKien` — dòng sự kiện **đầy đủ sau lọc D27**, đúng những gì người dùng
  đã đọc
- `baoCao` — gói `BaoCaoTran` đã tính, lưu luôn thay vì tính lại

> **Vì sao lưu cả `baoCao` thay vì tính lại từ `cacSuKien`:** điểm cầu thủ dựa
> trên `ThongKeCauThu`, mà `ThongKeCauThu` **không** suy ra được từ dòng sự
> kiện đã bị D27 lọc. Nếu không lưu thì trận cũ mở ra sẽ có điểm khác, hoặc
> không có điểm.

`SCHEMA_VERSION` 3 → **4**: thân tệp sao lưu thêm `matches: TranDaLuu[]`.
Migration v3→v4 thêm `matches: []`. Schema zod v3 **không sửa**, thêm schema
v4 cạnh nó — đúng cách làm đã ghi trong `migrations.ts`.

## IV.5. Contracts

```
engine/tran.ts
  interface ThongKeCauThu { … }
  PHIEN_BAN_ENGINE = 2

engine/baoCao.ts
  interface BaoCaoTran {
    tiSo, nguoiGhiBan: { doi, playerId, phut }[],
    theoBen: Record<BenDoi, ChiTieuBen>,
    diemCauThu: { doi, playerId, diem, cacThanhPhan }[],
  }
  dungBaoCao(tt: TrangThaiTran): BaoCaoTran        // thuần, không I/O

engine/diemCauThu.ts
  interface ThanhPhanDiem { ten: string; soLieu: number; diemCong: number }
  chamDiem(tk: ThongKeCauThu, viTriDaDa: PositionId):
    { diem: number; cacThanhPhan: readonly ThanhPhanDiem[] }

services/tuyChonRepo.ts
  docTuyChon(): Promise<{ hienSan2D: boolean }>
  datHienSan2D(hien: boolean): Promise<void>       // qua store `meta` (D51)

services/matchRepo.ts
  SO_TRAN_GIU_LAI = 20
  luu(tran: TranDaLuu): Promise<{ daLoaiBo: readonly string[] }>
  danhSach(): Promise<TomTatTran[]>                 // chỉ đọc `matchSummaries` (D44b)
  doc(id: string): Promise<TranDaLuu>               // đọc hàng nặng, chỉ khi mở một trận
  catConHaiMuoi(): Promise<{ daLoaiBo: readonly string[] }>   // sau khi nhập gộp (D48)
  xoaTheoDoi(teamId: string): Promise<void>         // không dùng: xoá đội KHÔNG xoá lịch sử

ui/mauAo.ts
  aoDangDung(nha: TeamSummary, khach: TeamSummary):
    { nha: 'chinh' | 'phu'; khach: 'chinh' | 'phu'; doiDoiAo: string | null }
```

`xoaTheoDoi` được khai ra rồi **cố tình không gọi**: mục 5 của spec nói xoá đội
thì trận cũ vẫn xem lại được. Khai nó ở đây để lần sau không ai "tiện tay" dọn
lịch sử khi xoá đội.

## IV.6. Ánh xạ AC → thiết kế

| AC | Thiết kế phục vụ nó | Kiểm chứng bằng |
|---|---|---|
| AC-10.1 | `San2D.tsx` vẽ một điểm cho **mỗi người đang trên sân** của hai bên — 22 lúc khai cuộc, 21 sau một thẻ đỏ; toạ độ suy từ lưới 12 vùng của D23 cộng chỉ thị `do-cao-doi-hinh`; màu lấy từ `ui/mauAo.ts` (D39). **Cách đọc con số 22**, chốt sau `/analyze`: cả hai đội có 18+18 = 36 người nên "toàn bộ cầu thủ hai đội" không thể hiểu theo nghĩa chặt; 22 là **số người trên sân lúc khai cuộc**, và đá thiếu người thì thiếu đúng số điểm đó. Nếu người dùng muốn hiểu khác thì phải sửa `spec.md` trước | Kiểm tay: đủ 22 điểm lúc khai cuộc, hai màu phân biệt được, và còn 21 sau một thẻ đỏ |
| AC-10.2 | Sự kiện mang `vung` và `duongBong` (D40); người có tên trong `cacCauThu` của sự kiện dịch tới `vung`, người còn lại giữ chỗ đội hình | Kiểm tay: theo một pha tấn công biên, thấy điểm dịch ra biên rồi bóng vào giữa |
| AC-10.3 | Viền dày cộng nhãn chữ cho người tham gia (D42) | Kiểm tay, và kiểm bằng cách **tắt màu** (chế độ grayscale) xem còn phân biệt được không |
| AC-10.4 | Sân vẽ từ **sự kiện đang hiển thị**, mà dòng tường thuật đã dừng khi tạm dừng (D21 của Giai đoạn 3) — không cần thêm gì | Kiểm tay: tạm dừng, sân đứng im |
| AC-10.5 | D43: chế độ chạy hết trận không vẽ trung gian. Test hiệu năng của T097 được mở rộng thêm một phép đo với sân bật | Test `hieuNang.test.ts` cho engine; kiểm tay bấm "chạy hết trận" với sân bật, đo bằng `performance.now` trên giao diện |
| AC-10.6 | Nút ẩn/hiện, tuỳ chọn lưu trong `meta` (D51) | Kiểm tay: ẩn, tải lại trang, vẫn ẩn |
| AC-11.1 | `BaoCaoTran.nguoiGhiBan` dựng từ các sự kiện `ban-thang` | Test `baoCao.test.ts` |
| AC-11.2 | `ChiTieuBen` lấy từ `ThongKeBen` đã sửa ở D36, D37, D38 | Test `baoCao.test.ts`: `coHoiRoRang` ≤ `cuSut`, `sutTrungDich` ≤ `cuSut`, hai tỉ lệ kiểm soát cộng lại bằng 100% |
| AC-11.3 | `diemCauThu.ts` (D49) từ `ThongKeCauThu` (D33), cân theo vị trí đã đá; trả về cả bảng thành phần. Bảy tiêu chí mà AC liệt kê đều có nguồn: bàn thắng, kiến tạo, sút trúng đích, **tỉ lệ chuyền chính xác** (D34c — gán theo từng bước chuỗi bóng), cướp bóng, mất bóng, phạm lỗi | Test `diemCauThu.test.ts`: điểm luôn trong 1–10; bắt đầu từ 6.0; cùng số liệu mà khác vị trí thì khác điểm; tổng các thành phần cộng lại đúng bằng điểm cuối. Và test `thongKeCauThu.test.ts`: **cả 11 người trên sân** đều có `chuyenThanhCong + chuyenHong > 0` sau một trận — phép bắt đúng lỗ hổng `/analyze` tìm ra |
| AC-11.4 | `TranDaLuu.cacSuKien` giữ dòng sự kiện đầy đủ sau lọc; màn báo cáo và màn lịch sử dùng lại `DongTuongThuat.tsx` đã có | Test `matchRepo.test.ts` vòng tròn lưu/đọc; kiểm tay mở lại một trận cũ |
| AC-11.5 | `phutVao` / `phutRa` trong `ThongKeCauThu` (D50) | Test: thay người phút 60 thì người ra có `phutRa` 60 và người vào có `phutVao` 60; người bị thẻ đỏ phút 70 có `phutRa` 70 |
| AC-11.6 | Hai nút trên màn báo cáo, dựng lại `CauHinhTran` từ bản ghi (D47) | Kiểm tay: đấu lại cùng mã ra đúng tỉ số cũ; đấu lại mã mới ra trận khác |
| AC-11.7 | Store `matches` (D44), giữ 20 trận trong một transaction (D45), nội dung đủ để phát lại (D35) | Test `matchRepo.test.ts`: lưu 21 trận thì còn 20 và trận cũ nhất mất; test phát lại từ `TranDaLuu` ra đúng dòng sự kiện đã lưu |
| AC-4.2 | Lịch sử ở IndexedDB (D44) và trong tệp sao lưu (D48) | Kiểm tay: đóng mở lại trình duyệt, 20 trận còn nguyên |
| AC-1.5 | Tên đội phân giải từ đội đang sống, ảnh chụp chỉ là đường lùi (D46) | Kiểm tay: đổi tên đội, mở lịch sử, thấy tên mới; xoá đội, thấy tên cũ |
| AC-4.7 | Đường ghi lịch sử đi qua `LoiUngDung` và `datLoiLuuTru` đã có từ Giai đoạn 1 | Kiểm tay trong tab bị siết quota — xem IV.0 |
| Lỗi 1 (T098) | D37 | Bốn test so sánh chạy lại kèm số đo mới; test khẳng định `coHoiRoRang` **nhỏ hơn** `cuSut` trên mẫu nhiều trận |
| Lỗi 2 (`cuu-thua`) | D38 | Test: trên 20 mã trận, loại sự kiện `cuu-thua` xuất hiện ít nhất một lần |

## IV.7. Chiến lược kiểm thử

Theo hiến pháp mục 4: engine và lớp dữ liệu **bắt buộc** có test; giao diện
xác nhận bằng bấm thử.

**Test engine mới**
- `diemCauThu.test.ts` — bốn phép ở bảng AC-11.3 trên.
- `baoCao.test.ts` — các chỉ tiêu của AC-11.2, danh sách ghi bàn, phút vào/ra.
- `thongKeCauThu.test.ts` — tổng theo cầu thủ **khớp** tổng theo bên, cho
  **mọi** chỉ tiêu kể cả `chuyenThanhCong` / `chuyenHong` (đó là lý do
  `ThongKeBen` phải có tổng chuyền của bên). Đây là phép bắt lỗi gán sai
  người, kiểu lỗi mà đọc code không thấy. Cộng một phép nữa mà `/analyze`
  đòi: sau một trận, **cả 11 người trên sân** đều có
  `chuyenThanhCong + chuyenHong > 0` — nếu D34c bị làm thiếu thì 9 người
  đứng im với 0/0 và tỉ lệ chuyền của họ không xác định.
- `hieuNang.test.ts` — thêm một phép đo cho `dungBaoCao`.

**Test lớp dữ liệu mới**
- `matchRepo.test.ts` — vòng tròn lưu/đọc; lưu 21 trận còn đúng 20; xoá đội
  **không** làm mất trận; `danhSach` trả về đủ 20 tóm tắt mà **không đọc hàng
  nào** của store nặng (D44b); `matches` và `matchSummaries` không bao giờ
  lệch nhau sau một lần ghi lỗi.
- `migrations.test.ts` — v3 → v4; tệp v1/v2/v3 vẫn nhập được (mở rộng test đã có).
- `backupService.test.ts` — xuất rồi nhập lại 20 trận, đối chiếu từng dòng sự
  kiện; tệp xuất ra mang nhãn `schemaVersion: 4` (không phải 3 như dòng ghi
  cứng hiện tại); **nhập gộp** 20 trận vào máy đang có 20 trận thì còn đúng 20.

**Phần phải chạy lại và ghi lại số đo** (P5, rủi ro R17)

D34, D34c, D37, D38 đổi thứ tự tiêu thụ `Rng` và đổi ngữ nghĩa ba bộ đếm, nên bốn
test so sánh của Giai đoạn 3 **sẽ cho số khác**. Cách làm: chạy, đọc số thật,
rồi mới kết luận.

- Nếu test vẫn xanh → ghi số mới vào mô tả commit, xong.
- Nếu một test đỏ → **cân bằng lại engine**, không hạ ngưỡng. Ngưỡng trong bốn
  test đó đến từ AC, không phải từ thuận tiện.
- Một ngoại lệ `/analyze` chỉ ra: `sosanh.saiViTri.test.ts` đọc
  `dongGopTheoCauThu`, nên nếu trường đó biến mất thì test đỏ vì **mất đầu
  vào**, không phải vì lệch số — và "cân bằng lại engine" sẽ là cách sửa sai.
  D33b giữ trường đó lại chính để không bao giờ phải phân biệt hai ca này.

**Phát lại qua phiên bản** — thêm một test khẳng định `TranDaLuu` mang
`phienBanEngine`, và `matchRepo` **từ chối** đề nghị phát lại một trận có
phiên bản khác với bản đang chạy, kèm lý do tiếng Việt.

## IV.8. Rủi ro & phương án lùi

| # | Rủi ro | Mức | Phương án lùi |
|---|---|---|---|
| R16 | **Mã trận cũ không phát lại đúng** sau khi D34 và D34c đổi dãy số. Người dùng đã chép tay một mã trận ở Giai đoạn 3 sẽ nhận một trận khác | Trung bình — `/analyze` hạ từ Cao xuống | **Không có gì trong lịch sử bị hỏng**: lịch sử trận đấu ra đời ở chính giai đoạn này, nên không tồn tại bản ghi nào của phiên bản engine cũ. Thiệt hại chỉ là mã trận người dùng tự chép ra ngoài ứng dụng. Không có cách tránh nếu muốn AC-11.3 (xem D35). Bù bằng: `phienBanEngine` đóng vào trận, giao diện nói rõ khi lệch, và lịch sử lưu luôn dòng sự kiện nên trận cũ vẫn **xem lại** được nguyên vẹn. Vẫn nói với người dùng **trước khi** làm lát 13 |
| R17 | Bốn test so sánh của P5 đỏ sau khi đổi bộ đếm và dãy số | Cao | Cân bằng lại engine chứ không hạ ngưỡng. Nếu cân bằng không đạt trong một lát thì **lùi D38** (cứu thua) trước, vì nó là phần dễ tách nhất; D37 thì không lùi được vì AC-11.2 cần |
| R18 | `DB_VERSION` 2 → 3 **không lùi được bằng `git revert`** | Trung bình | Trước khi tăng, nhắc người dùng xuất tệp sao lưu. Nếu phải lùi code thì nhập lại từ tệp. Đây là cảnh báo đã ghi sẵn trong `db.ts` từ Giai đoạn 1 |
| R19 | Sân 2D làm vỡ ngân sách 3 giây ở chế độ chạy hết trận | Trung bình | D43 chặn từ thiết kế. Đường lùi: AC-10.6 cho ẩn sân, nên trường hợp xấu nhất là tự ẩn sân khi người dùng bấm chạy hết trận, kèm một dòng nói rõ |
| R20 | 20 trận kèm dòng sự kiện đầy đủ làm tệp sao lưu phình và vượt quota | Trung bình | Đo thật ở lát 16 trước khi chốt. Nếu quá lớn thì giảm số trận giữ lại là **không được** (AC-11.7 nói 20), nên đường lùi là nén phần `cacSuKien` bằng `fflate` — thư viện đã có trong dự án từ Giai đoạn 1 |
| R21 | Chấm điểm cầu thủ ra những con số vô lý (hậu vệ luôn 6.0, tiền đạo luôn 9.0) | Trung bình | AC-11.3 đòi xem được thành phần điểm, nên lỗi này **lộ ra** chứ không ẩn. Cân bằng bằng cách chạy 20 trận rồi xem phân bố điểm theo vị trí, như cách đã cân thẻ và lợi thế sân nhà ở Giai đoạn 3 |
| R22 | Gán người cho **từng bước** chuỗi bóng (D34c) làm engine chậm đi: tối đa 12 bước × 3 chuỗi × 97 phút ≈ 3.500 lần rút thêm mỗi trận, mỗi lần kèm một lượt tra ô theo vùng | Thấp | Engine hiện chạy hết trận trong **4ms**, ngân sách test là 200ms, nên còn rất nhiều chỗ. Vẫn đo lại ở T108 và T118. Nếu vỡ thì tra ô theo vùng được dựng **một lần mỗi phút** thành bảng thay vì mỗi bước |

## IV.9. Thứ tự triển khai

Bốn lát dọc, mỗi lát chạy được và dùng thử được. Lát 13 đi trước vì nó là lát
đổi engine — mọi thứ sau đó dựa trên bộ đếm mới.

**Lát 13 — Thống kê thật và sửa hai lỗi engine**
Sửa `cuSut` / `coHoiRoRang` / `sutTrungDich` (D37), phát `cuu-thua` (D38),
thêm `soBuocGiuBong` (D36), gán hành động cho cầu thủ (D34) **và gán người
cho từng bước chuỗi bóng** (D34c), `ThongKeCauThu` (D33) đặt **cạnh**
`dongGopTheoCauThu` chứ không thay nó (D33b), phút vào/ra sân (D50), `phienBanEngine` (D35), bỏ `mauAoDangDung`
(D39), thêm `duongBong` (D40). Chạy lại bốn test so sánh và ghi lại số đo.
*Dùng thử được:* chưa có màn hình mới, nhưng dòng tường thuật có thêm loại
"cứu thua" chưa từng thấy.

**Lát 14 — Báo cáo sau trận**
`baoCao.ts`, `diemCauThu.ts`, `BaoCaoSauTran.tsx`, `BangDiemCauThu.tsx`,
`DanhSachGhiBan.tsx`, và hai nút đấu lại (D47).
*Dùng thử được:* xem trọn một trận rồi đọc báo cáo và đấu lại ngay.

**Lát 15 — Sân 2D**
`San2D.tsx` (D41), làm nổi bật người tham gia (D42), nút ẩn/hiện (D51), chặn
vẽ trung gian ở chế độ chạy hết trận (D43), `ui/mauAo.ts` (D39).
*Dùng thử được:* xem trận trên sân 2D, hoặc ẩn nó đi.

**Lát 16 — Lịch sử 20 trận**
Hai store `matches` và `matchSummaries`, `DB_VERSION` 3 (D44, D44b),
`matchRepo.ts` với transaction giữ 20 trận (D45), ảnh chụp tên đội (D46),
`TrangLichSu.tsx`, thân tệp sao lưu v4 cộng cắt-còn-20 khi nhập gộp (D48),
migration v3→v4, kiểm tay AC-4.7 trong tab bị siết quota.
*Dùng thử được:* đóng mở lại ứng dụng, 20 trận gần nhất còn nguyên, mở lại
đọc báo cáo cũ.

**Lát 17 — Đóng spec 001**
Kiểm tay 13 AC của US-10 và US-11, cộng AC-4.2, AC-1.5, AC-4.7. Đóng nốt dòng
"xoá đội khi đang có trận dở" của spec mục 5 — `/analyze` chỉ ra nó rơi qua ba
giai đoạn mà không phase nào nhận. Tick nốt `spec.md` và đổi `Status` thành
`Done`. Hai điểm `[CẦN XÁC NHẬN]` trong hiến pháp cùng T035 còn lại từ Giai
đoạn 1 thì **cần người dùng trả lời**, nên chúng không chặn `Status: Done`.
