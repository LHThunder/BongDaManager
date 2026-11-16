# Plan: Giao diện song ngữ, theme bóng đá và bộ biểu tượng

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Approved |
| **Updated** | 2026-11-16 |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại
> sửa `spec.md`.

## 1. Kiểm tra hiến pháp (Constitution check)

Đối chiếu với hiến pháp **2.0.0**.

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1. Giả lập phải tái lập được | ✅ | Spec này **không chạm engine**. `mauCau` vẫn do `Rng` của trận chọn và vẫn là một chỉ số; đổi ngôn ngữ chỉ đổi bảng tra ở tầng giao diện. `PHIEN_BAN_ENGINE` giữ nguyên 5 — không một lần rút `Rng` nào đổi. |
| P2. Luật bóng đá tách khỏi giao diện | ✅ | D68 còn **củng cố** P2: nhãn hiển thị rời khỏi `domain/`, nên lớp trong cùng càng thuần luật. |
| P3. Dữ liệu người dùng bất khả xâm phạm | ✅ | Không đổi định dạng lưu trữ, không migration. Hai tuỳ chọn mới nằm trong store `meta` đã có; mất chúng chỉ rơi về mặc định (D71). |
| P4. Chạy offline | ✅ | Phông chữ và icon nhúng trong repo, không CDN (D73). Đây là lý do loại mọi bộ icon chỉ phát hành qua mạng. |
| P5. Mỗi AC dạng so sánh phải có test | ✅ | AC-18.2 là AC dạng so sánh duy nhất của spec này và có test riêng đo đúng phép so sánh ấy (mục 7). |
| P6. Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Bảy lát cắt ở mục 9, lát nào xong cũng mở ứng dụng dùng được. Lát 22 đã cho một màn hình song ngữ chạy thật. |
| P7. Tệp sao lưu mở lại được | ✅ | `SCHEMA_VERSION` giữ nguyên 5, `DB_VERSION` giữ nguyên 3. Đã kiểm: `backupSchema` chỉ đọc **id** từ `domain`, không đọc nhãn. |
| P8. Song ngữ Việt–Anh, mỗi ngôn ngữ trọn vẹn | ✅ | Toàn bộ spec này tồn tại để thực hiện P8. Bốn điều khoản của nó ánh xạ thành D66, D67, D68, D69, D72. |
| P9. Bàn phím và chữ đọc được | ⚠️ | Hai nút mới (đổi ngôn ngữ, đổi chế độ) phải với tới được bằng bàn phím — AC-17.6, AC-20.10. Dark mode **nhân đôi** bề mặt phải chứng minh 4.5:1. Không phải ngoại lệ, nhưng là chỗ tốn công nhất của spec và dễ bị bỏ sót nhất. |

**Ngoại lệ xin miễn trừ:** Không.

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** không đổi — React 18 + TypeScript strict + Vite +
  Tailwind, zustand, idb, zod, fflate, dnd-kit.
- **Phụ thuộc mới:** **Không.** Lớp ngôn ngữ tự viết (D65); icon chép thành
  SVG vào repo thay vì cài gói (D73); theme dùng biến CSS sẵn có của trình
  duyệt (D70).
- **Vùng code bị chạm:**

| Vùng | Việc |
|---|---|
| `src/ui/strings.ts` (701 dòng, 34 khối) | Tách thành hai bản ngôn ngữ, giữ nguyên cấu trúc khối |
| `src/ui/tuongThuat.ts` (~62 mẫu câu) | `MAU` thành hai bảng, viết lại bản tiếng Anh |
| `src/domain/{positions,roles,instructions,attributes}.ts` | Bỏ 99 nhãn hiển thị, giữ trường cấu trúc |
| `src/services/tuyChonRepo.ts` | Thêm hai tuỳ chọn, đúng pattern `docHienSan2D` đã có |
| `src/services/playerRepo.ts` | Payload lỗi thôi mang nhãn tiếng Việt (D76) |
| `src/domain/roles.ts` | `chiSoThieuChoVaiTro` thôi trả nhãn (D76) |
| `src/store/appStore.ts` | Giữ ngôn ngữ và chế độ đang chọn |
| 28 file `src/ui/pages` (6) + `src/ui/components` (22) | Đổi từ `import { X }` sang `useChuoi()`; áp token màu |
| `tailwind.config.js` | Thêm `darkMode` và bảng token màu |
| `src/ui/components/DangKyDoiHinh.tsx` | US-23 (a) |
| `src/ui/pages/ChonCapDau.tsx` | US-23 (b) |
| `src/domain/*.test.ts` | Những phép kiểm nhãn phải theo nhãn sang lớp ngôn ngữ |

## 3. Kiến trúc giải pháp

```
  domain/            chỉ còn id + trường cấu trúc, KHÔNG nhãn
     │                 POSITIONS: { id, tuyen, ben }      ← bỏ ten, vietTat
     │                 ROLES, CHI_THI, ATTRIBUTES tương tự
     ▼
  ui/ngonNgu/        bảng tra, hai bản song song
     ├── vi.ts         CHUNG_VI, DOI_VI, … (34 khối) + NHAN_DOMAIN_VI
     ├── en.ts         CHUNG_EN: typeof CHUNG_VI, …      ← kiểu ép đủ khoá
     ├── mauCau.vi.ts  MAU_VI: 62 mẫu
     ├── mauCau.en.ts  MAU_EN: cùng khoá, CÙNG ĐỘ DÀI mỗi loại
     └── index.ts      useChuoi(), tra() có lưới thiếu-dịch
     ▼
  component          const { CHUNG } = useChuoi()

  store ──► ngonNgu: 'vi' | 'en'          ──► tuyChonRepo ──► meta store
            cheDo:   'sang' | 'toi'            (IndexedDB đã có)
                     │
                     └─► <html data-che-do="toi"> ─► biến CSS ─► Tailwind token
```

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D65** | Lớp ngôn ngữ | **Tự viết.** `strings.ts` vốn đã là một bảng tra 34 khối | `i18next`, `react-intl`, `lingui` | Thư viện i18n tra bằng **chuỗi khoá** (`t('doi.them')`), nên gõ sai khoá chỉ lộ lúc chạy. Giữ object TypeScript thì gõ sai khoá là **lỗi biên dịch** — đúng thứ P8 đòi. Hai ngôn ngữ, không plural phức tạp, không nạp bất đồng bộ: mọi thứ thư viện mang lại đều là thứ ta không dùng |
| **D66** | Hình dạng bảng chuỗi | Giữ 34 khối, mỗi khối hai bản; bản EN khai kiểu `typeof` bản VI | `Record<NgonNgu, …>` phẳng; tệp JSON | `typeof` biến **lớp lưới thứ nhất của AC-22.2 thành miễn phí**: thiếu một khoá là lỗi biên dịch, thừa một khoá cũng vậy. JSON thì mất sạch kiểm kiểu |
| **D67** | Chuỗi tới component | Hook `useChuoi()` đọc ngôn ngữ từ store | React Context riêng; truyền prop xuyên cây | zustand đã là chỗ giữ trạng thái toàn cục; thêm Context là thêm cơ chế thứ hai. Truyền prop qua 74 file thì không |
| **D68** | 99 nhãn trong `domain/` | Bỏ hẳn `ten`/`vietTat`; nhãn thành `Record<PositionId, string>` trong lớp ngôn ngữ | Giữ `ten`, thêm `tenEn` | P8 cấm thẳng. Và `tenEn` mở đường cho `tenFr` — lớp dữ liệu bóng đá sẽ phình theo số ngôn ngữ. `Record<PositionId, …>` lại bắt lỗi thiếu vị trí ngay lúc biên dịch |
| **D69** | Câu tường thuật | Hai bảng `MAU_VI` / `MAU_EN`, cùng khoá và **cùng độ dài mỗi loại** | Một bảng chung, mỗi hàm tự rẽ nhánh theo ngôn ngữ | Rẽ nhánh bên trong hàm chính là "ghép mảnh dùng chung" mà P8 cấm. Cùng độ dài là điều kiện để `mauCau` — một chỉ số — chọn **đúng vị trí tương ứng** ở cả hai bảng, vì `tuongThuat.ts:235` chọn bằng `cacMau[mauCau % cacMau.length]`, nhờ đó AC-18.2 đạt được bằng cấu trúc chứ không bằng cẩn thận |
| **D70** | Theme + dark mode | Biến CSS trên `:root` và `:root[data-che-do='toi']`; Tailwind token trỏ tới biến | Rải class `dark:` khắp 28 file; thay stylesheet khi đổi chế độ | Bố cục giữ nguyên (AC-20.6) nên chỉ giá trị màu đổi. Đổi một thuộc tính trên `<html>` thì **không re-render React** — ngân sách <200ms đạt được hiển nhiên. Rải `dark:` nghĩa là mỗi màu phải sửa hai chỗ ở 28 file, và AC-20.2 phải kiểm tay từng chỗ |
| **D71** | Nơi lưu hai tuỳ chọn | `tuyChonRepo` đã có, thêm hai khoá trong store `meta` | `localStorage`; bảng mới trong IndexedDB | D51 của spec 001 đã lập luận xong: `localStorage` là chỗ lưu **thứ hai** mà tệp sao lưu không biết tới và P7 không phủ. Bảng mới thì phải tăng `DB_VERSION` — không đáng cho hai khoá |
| **D72** | Hai lớp lưới cho chuỗi thiếu | Lớp 1: kiểu `typeof` (D66) + `Record<Id,…>` (D68) + một test quét khoá. Lớp 2: hàm tra trả chuỗi đánh dấu thấy được | Ném lỗi lúc chạy; rơi về tiếng Việt | Rơi về tiếng Việt là thứ P8 cấm đích danh. Ném lỗi thì một nhãn thiếu làm vỡ cả màn hình — chữa còn tệ hơn bệnh. Lớp 2 là lưới an toàn **đáng lẽ không bao giờ kích hoạt**, vì lớp 1 chặn trước |
| **D73** | Bộ icon | **Tabler Icons (MIT)**, chép ~12 SVG cần dùng vào repo | `@tabler/icons-react`; heroicons; bộ isometric CC-BY | Chép 12 file rẻ và nhẹ hơn một dependency phải tree-shake từ 6545 icon. Isometric đã bị loại ở mục 10 điểm 8 của spec sau ba lượt tìm |
| **D74** | Màn hình mẫu duyệt theme | **Trang Lịch sử trận đấu** | Trang chủ; trang trận đấu | Nó có bảng, nút, chữ phụ, trạng thái rỗng và một khối chi tiết mở ra — đủ loại thành phần để thấy theme. Trang chủ quá nghèo thành phần; trang trận đấu quá động, khó so hai bảng màu |
| **D76** | Nhãn hiển thị lọt ra ngoài `ui` | **Payload lỗi và kết quả của `domain` chỉ mang MÃ**, `ui` tra chữ | Giữ nhãn trong payload rồi dịch sau; truyền ngôn ngữ xuống `services` | Phát hiện ở `/analyze`: `playerRepo.ts:76,88` nhét `tenChiSo(id)` — **tên chỉ số tiếng Việt** — vào `chiTiet.truong`, và `strings.ts:398` in thẳng nó vào câu lỗi. Ở chế độ tiếng Anh ra *"Attribute **Dứt điểm** must be…"*, tức AC-22.1 và AC-17.4 **không thể đạt**. `domain/roles.ts:331,333` cũng trả `{ chiSo, ten }` ra ngoài. Đáng chú ý: quy ước đúng **đã có sẵn** trong repo — `kiemTraToHopViTri` trả mã `'thu-mon-kiem-vi-tri-san'`, `chiTiet.truong` ở mọi chỗ khác là khoá máy (`'playerId'`, `'shirtNumber'`). D76 chỉ khôi phục quy ước ấy ở hai chỗ đã phá nó, không phát minh gì mới. Truyền ngôn ngữ xuống `services` thì bị hiến pháp mục 3 chặn: luồng phụ thuộc một chiều |
| **D75** | Tên sơ đồ | **Giữ nguyên** `FORMATIONS.ten` trong `domain/` | Dời sang lớp ngôn ngữ như 99 nhãn kia | "4-4-2" là **cùng một chữ** ở cả hai ngôn ngữ — nó là ký hiệu, không phải nhãn cần dịch. Dời nó đi là tạo một bảng tra có hai cột giống hệt nhau |

## 4. Mô hình dữ liệu

**Không có migration.** `DB_VERSION` giữ **3**, `SCHEMA_VERSION` giữ **5**.

Hai hàng mới trong store `meta` đã có, cùng kiểu khoá-giá trị với `hienSan2D`:

```
meta
  key: 'ngonNgu'   value: 'vi' | 'en'        mặc định 'vi'   (AC-17.7)
  key: 'cheDo'     value: 'sang' | 'toi'     mặc định 'sang' (AC-20.9)
```

Thay đổi hình dạng trong `domain/` — **không phải dữ liệu lưu trữ**, chỉ là
hằng số biên dịch vào mã:

```
Position   { id, ten, vietTat, tuyen, ben }  →  { id, tuyen, ben }
Role       { id, ten, moTa, … }              →  { id, … }     (bỏ nhãn)
ChiThi     { id, ten, cacMuc:[{muc,ten,moTa}] } → { id, cacMuc:[{muc}] }
Attribute  { id, ten, nhom }                 →  { id, nhom }
```

Tệp sao lưu **không đổi một byte**: đã kiểm `backupSchema.ts` chỉ đọc
`POSITIONS.map(p => p.id)`, `ATTRIBUTES.map(a => a.id)`, `ROLES.map(v => v.id)`
và `THU_TU_CHI_THI`; engine chỉ đọc `tuyen`, `chiSoQuanTrong`, `viTriApDung`.

## 5. Contracts

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `useChuoi()` | — | `BoChuoi` (34 khối + nhãn domain) | — (luôn trả một bộ đầy đủ) |
| `tra(khoi, khoa)` | khối chuỗi, khoá | `string` | Thiếu bản dịch → trả chuỗi đánh dấu thấy được (D72 lớp 2) |
| `cauTuongThuat(sk, boiCanh, ngonNgu)` | `SuKien`, `BoiCanhCau`, ngôn ngữ | `string` | Loại sự kiện không có mẫu → `CAU_LUI` của ngôn ngữ đó |
| `nhanViTri(id, ngonNgu)` | `PositionId` | `string` | — (`Record` đủ khoá, kiểm lúc biên dịch) |
| `ChiTietLoi.truong` *(sửa contract)* | — | `string` **mã máy**, không bao giờ là nhãn hiển thị | — (D76) |
| `chiSoThieuChoVaiTro(...)` *(sửa contract)* | như cũ | `{ chiSo, giaTri }[]` — **bỏ** trường `ten` | — (D76) |
| `docNgonNgu()` / `datNgonNgu(n)` | — / `'vi' \| 'en'` | `NgonNgu` / `void` | Đọc lỗi → mặc định `'vi'`; ghi lỗi → nổi lên như `datHienSan2D` |
| `docCheDo()` / `datCheDo(c)` | — / `'sang' \| 'toi'` | `CheDo` / `void` | Như trên, mặc định `'sang'` |

## 6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-17.1 | `useChuoi()` trả đúng một bộ; không component nào tự chọn ngôn ngữ (D67) |
| AC-17.2 | Ngôn ngữ nằm trong store zustand → đổi là React vẽ lại, không tải trang |
| AC-17.3 | Trạng thái form là state của component, không bị gỡ khi ngôn ngữ đổi (D67) |
| AC-17.4 | `tuyChonRepo.docNgonNgu` / `datNgonNgu` (D71) |
| AC-17.5 | Dòng tường thuật dựng từ `SuKien` có cấu trúc mỗi lần vẽ, không lưu sẵn chữ (D69) |
| AC-17.6 | Nút đổi ngôn ngữ là `<button>` thật, nằm trong luồng Tab |
| AC-17.7 | `NGON_NGU_MAC_DINH = 'vi'`, không đọc `navigator.language` |
| AC-18.1 | `MAU_EN` viết riêng theo ngữ pháp tiếng Anh; `BoiCanhCau` đã mang đủ `ten`, `ten2`, `tenDoi`, `tenDoiKia` nên đảo chủ–vị được (D69) |
| AC-18.2 | Hai bảng cùng khoá và **cùng độ dài**; `mauCau` là chỉ số chung (D69) + test ở mục 7 |
| AC-18.3 | Cùng **đúng** độ dài mỗi loại (spec siết lại sau `/analyze`), kiểm bằng kiểu và bằng test |
| AC-18.4 | Trận đã lưu giữ `SuKien` có cấu trúc, không giữ chữ — dựng lại theo ngôn ngữ hiện tại |
| AC-19.1 | `NHAN_DOMAIN_EN` viết bằng thuật ngữ bóng đá Anh, không dịch từng từ (D68) |
| AC-19.2 | Nhãn rời khỏi `domain/` nên không đường tính toán nào đọc chữ (D68, D76) |
| AC-19.3 | Tệp sao lưu không đổi; `backupSchema` chỉ đọc id (mục 4) |
| AC-19.4 | Tên đội/cầu thủ là dữ liệu, không đi qua lớp ngôn ngữ |
| AC-20.1 | Bảng token màu + phông trong `tailwind.config.js`, dùng chung mọi màn (D70) |
| AC-20.2 | Token màu chọn sẵn đạt 4.5:1 ở cả hai bảng; đo bằng phép kiểm ở mục 7 |
| AC-20.3 | Chỉ giá trị màu đổi, không đổi cấu trúc JSX (D70) |
| AC-20.4 | Phông và icon nhúng trong repo (D73, P4) |
| AC-20.5 | `mauChuTuongPhan` đã có từ spec 001, chạy lại ở cả hai chế độ |
| AC-20.6 | D70 — không đụng vào bố cục, chỉ đụng màu và phông |
| AC-20.7 | Đổi thuộc tính `data-che-do` trên `<html>`, biến CSS đổi theo (D70) |
| AC-20.8 | `tuyChonRepo.docCheDo` / `datCheDo` (D71) |
| AC-20.9 | `CHE_DO_MAC_DINH = 'sang'` |
| AC-20.10 | Nút đổi chế độ là `<button>` thật |
| AC-21.1 | 10 SVG của Tabler chép vào repo, một component `BieuTuong` tra theo tên (D73) |
| AC-21.2 | Cùng một bộ nên cùng phong cách; không trộn nguồn (D73) |
| AC-21.3 | Mỗi chỗ dùng biểu tượng đều có nhãn chữ đi kèm hoặc `aria-label` |
| AC-21.4 | SVG nội tuyến trong repo, không gọi mạng (P4) |
| AC-21.5 | Biểu tượng không đi qua lớp ngôn ngữ |
| AC-22.1 | Lớp lưới 1 của D72 + phép đi tay ở Definition of Done |
| AC-22.2 | D72 — hai lớp lưới |
| AC-22.3 | Thông báo lỗi vốn đã là mã lỗi dịch ở tầng `ui`, nay dịch theo ngôn ngữ đang chọn — **cộng D76** để payload thôi mang chữ tiếng Việt |
| AC-22.4 | `San2D` nhận nhãn qua `useChuoi()` như mọi component |
| AC-23.1 | `DangKyDoiHinh` nhận `quanSo` thay cho hằng số 11 |
| AC-23.2 | `cauLyDo` tra tên cầu thủ từ danh sách đã có trong `ChonCapDau` |

## 7. Chiến lược kiểm thử

- **Unit (bắt buộc theo hiến pháp mục 4):**
  - Lớp ngôn ngữ: mọi khối chuỗi có **đủ và đúng** khoá ở cả hai ngôn ngữ.
    Kiểu `typeof` đã chặn phần lớn; test này bắt chỗ kiểu không với tới.
  - `MAU_VI` và `MAU_EN`: cùng tập khoá `LoaiSuKien`, và **cùng độ dài** ở
    từng loại. Đây là điều kiện để AC-18.2 đúng bằng cấu trúc.
  - Nhãn domain: `Record` phủ hết `PositionId`, `RoleId`, `ChiThiId`,
    `AttributeId` ở cả hai ngôn ngữ.
  - `tuyChonRepo`: đọc khi chưa có giá trị → mặc định; ghi rồi đọc lại → đúng;
    đọc lỗi → rơi về mặc định, không ném.
- **So sánh (P5), cho AC-18.2:** chạy cùng một mã trận, dựng dòng tường thuật
  ở cả hai ngôn ngữ, đối chiếu **từng dòng** về số dòng, thứ tự, phút và danh
  sách cầu thủ. Chỉ trường chữ được phép khác. Cùng kiểu với
  `tuongThichV5.test.ts` của spec 002.
- **Tương phản (AC-20.2):** test thuần tính tỉ lệ tương phản cho mọi cặp
  token (chữ trên nền) ở **cả hai** bảng màu, đòi ≥ 4.5:1. Tận dụng hàm
  tương phản đã có từ spec 001.
- **Thủ công — đây là phần tốn công nhất của spec:**
  - Đi hết mọi màn hình ở **2 ngôn ngữ × 2 chế độ**, kể cả màn hình trống và
    màn hình lỗi.
  - Đọc trọn một trận ở tiếng Anh, từng dòng, soi ngữ pháp và chủ ngữ.
  - Đổi ngôn ngữ **giữa lúc trận đang chạy** (AC-17.5).
  - Duyệt theme trên màn hình mẫu trước khi áp ra (D74).
  - Một trận sân nhỏ để xác nhận US-23.

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| **R28** | 459 chuỗi × 2 ngôn ngữ — lỗi sao chép, lệch khoá, dịch sót | Cao | Trung bình | Kiểu `typeof` bắt lệch khoá ngay lúc biên dịch; test quét khoá bắt phần còn lại |
| **R29** | Câu tường thuật tiếng Anh sai ngữ pháp hoặc sai chủ ngữ | Trung bình | **Cao** — đây là thứ người dùng đọc suốt trận | Đọc tay trọn một trận; AC-18.1 nêu đích danh cái bẫy đảo chủ–vị của pha phạm lỗi |
| **R30** | Dark mode làm vỡ tương phản ở chỗ dùng màu áo người dùng | Trung bình | Cao (P9) | Test tương phản chạy cho cả hai bảng; `mauChuTuongPhan` đã có sẵn |
| **R31** | Dời nhãn khỏi `domain/` làm đỏ test hiện có | **Chắc chắn** | Thấp | Đã đếm: `attributes.test.ts`, `positions.test.ts`, `instructions.test.ts` đang khẳng định trên `.ten`. Những phép kiểm ấy **đi theo nhãn** sang lớp ngôn ngữ, không xoá |
| **R32** | Theme bị bác sau khi đã áp ra 27 file còn lại | Thấp | Cao | D74 — duyệt trên một màn mẫu trước, đó chính là lý do cổng chặn này có trong Definition of Done |
| **R34** | Còn chỗ khác ngoài `playerRepo` và `roles` cũng đẩy nhãn ra khỏi `ui` | Thấp | Cao | Đã quét `engine/`, `services/`, `storage/`, `domain/` và chỉ thấy hai chỗ. Test ở T321 quét khoá sẽ không bắt được loại lỗi này, nên phép bắt thật là bước đi tay T333 ở chế độ tiếng Anh |
| **R33** | Bộ Tabler thiếu icon cho một khái niệm (thay người, sân đấu) | Trung bình | Thấp | AC-21.2 cấm trộn bộ khác; trường hợp biên của spec đã chốt: dùng chữ thay thế |

**Rollback:** mọi thay đổi nằm ở tầng `ui` + hằng số `domain`, không đụng dữ
liệu đã lưu và không đụng engine. Quay lui = quay lui commit; dữ liệu người
dùng không chịu ảnh hưởng vì không có migration nào chạy.

## 9. Thứ tự triển khai

Bảy lát cắt dọc, tiếp số "lát" của spec 002 (lát 18–21).

| Lát | Nội dung | Xong thì chạy được gì |
|---|---|---|
| **22** | Hạ tầng ngôn ngữ (D65, D66, D67), `tuyChonRepo` hai tuỳ chọn (D71), nút đổi ngôn ngữ, và **một** màn hình chuyển trọn sang `useChuoi()` | Mở ứng dụng, bấm đổi ngôn ngữ, thấy màn ấy đổi thật và nhớ qua lần mở sau |
| **23** | Dời 99 nhãn khỏi `domain/` (D68), dựng `NHAN_DOMAIN_VI`/`EN`, dời các test nhãn (R31), **và chặn hai chỗ đẩy nhãn ra ngoài `ui` (D76)** | Trang chiến thuật và trang cầu thủ đọc được ở cả hai ngôn ngữ |
| **24** | Câu tường thuật: tách `MAU` thành hai bảng, viết `MAU_EN` (D69), test AC-18.2 | Đá một trận, đọc tường thuật tiếng Anh |
| **25** | Quét nốt các màn còn lại sang `useChuoi()`; dựng hai lớp lưới (D72) | Mọi màn hình song ngữ; sót chuỗi là lộ ra |
| **26** | Theme trên màn mẫu (D74) → **người dùng duyệt** → áp ra toàn bộ + dark mode (D70) + test tương phản | Toàn ứng dụng có nhận diện, đổi được sáng/tối |
| **27** | Bộ biểu tượng (D73) | Icon ở mọi màn hình chính |
| **28** | US-23 (hai lỗi treo), đi tay 2 ngôn ngữ × 2 chế độ, đo lại bốn ngân sách, đóng spec | Spec 003 Done |

Lát 26 có một **cổng chặn người dùng** ở giữa: không áp theme ra 27 file còn
lại trước khi màn mẫu được duyệt.
