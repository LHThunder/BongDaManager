# Plan: Giao diện có hệ thống thiết kế, và chế độ xem sân 3D song song

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Draft |
| **Updated** | 2026-11-25 |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

> **Hai chỗ bản Clarified của spec nói sai về chính repo này, và plan sửa lại.** Cả hai là
> sai về **dữ kiện**, không phải nới hay thu phạm vi; chúng được ghi ở đây thay vì sửa lặng lẽ.
>
> 1. **"Hiến pháp đòi ưu tiên tái sử dụng thứ đã có hơn thêm phụ thuộc mới" — câu ấy không có
>    trong hiến pháp.** Mục 3 ghi ngược lại: *"Thư viện ngoài: được thêm **thoải mái** để đi
>    nhanh, với hai điều kiện bắt buộc — thư viện MUST đóng gói được để chạy offline, và MUST
>    được ghi vào `plan.md` của giai đoạn đang làm. **Không có hạn mức số lượng**."* Quyết định
>    "không thêm phụ thuộc" **vẫn giữ**, nhưng nó đứng trên một lý do khác và thật hơn: tự
>    chiếu cho phép **thừa nguyên** 42 biến màu, chủ đề sáng/tối, bàn phím, trình đọc màn hình
>    và giảm chuyển động của spec 003/005/006 — xem **D132**. Không có một điều luật nào bị
>    viện dẫn sai ở đây nữa.
> 2. **Có NĂM mức tốc độ, không phải bốn.** `MS_MOI_PHUT` là
>    `rat-cham: 4000 · cham: 2000 · thuong: 1000 · nhanh: 200 · rat-nhanh: 20`. Spec 006 đã đo
>    *"ở cả **năm** mức"*. `AC-51.1` của spec 011 viết "cả bốn mức tốc độ" là sai dữ kiện, và
>    sai theo chiều **dễ hơn thực tế**. `tasks.md` phải đo **cả năm mức**; mức `rat-nhanh`
>    (20ms) nằm dưới `NHIP_TOI_THIEU_DE_NOI_SUY = 40` nên ở đó không có nội suy, và đó chính là
>    mức cần đo riêng. Đề nghị sửa `AC-51.1` thành "cả năm mức" ở `spec.md` — xem **mục 10**.

---

## 1. Kiểm tra hiến pháp (Constitution check)

Hiến pháp đối chiếu: **3.0.1**. Spec 011 **đòi 4.0.0 trước khi task đầu tiên của lớp 3D chạy**
(AC-52.1), nên bảng này kiểm cả hai: tuân thủ sau khi bump, và cái gì buộc phải bump.

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| **P1** Giả lập phải tái lập được | ✅ | Spec 011 không sinh một số ngẫu nhiên nào và không đọc đồng hồ toàn cục ở nơi ảnh hưởng tới trận. Góc nhìn **không** là một can thiệp giữa trận, nên nó không vào chuỗi cần ghi lại để phát lại. `θ = 50°` và `HE_SO_CAO = 3` là hằng của lớp vẽ. |
| **P2** Luật bóng đá tách khỏi giao diện | ✅ | Toàn bộ mã mới nằm ở `src/ui`. Không một công thức bóng đá nào được thêm. `src/engine/` **không đổi một dòng** (AC-49.9), canh bằng `src/engine/boundaries.test.ts` đã có. |
| **P3** Dữ liệu người dùng bất khả xâm phạm | ✅ | Chỉ **thêm một** tuỳ chọn (góc nhìn) vào store `meta` đã có, qua `tuyChonRepo`. Không chạm bản ghi trận, không di trú dữ liệu. |
| **P4** Chạy offline, dữ liệu không ra khỏi máy | ✅ | Không phông chữ tải về, không tài nguyên ngoài, không bản đồ môi trường. Lớp 3D vẽ bằng SVG nội tuyến — đúng cách `SanBong.tsx` đã ghi: *"Mọi thứ vẽ bằng CSS và SVG nội tuyến, KHÔNG tải tài nguyên nào từ ngoài (P4)"*. AC-51.6 canh bằng phép đo. |
| **P5** Mỗi AC dạng so sánh phải có một test chứng minh | ⚠️ **Phải làm, chưa có** | Ba AC của spec 011 thuộc đúng loại P5 nói: **AC-46.5** (hai góc nhìn cho cùng `(x, y)`), **AC-47.5** và **AC-53.4** (cùng mã trận cho cùng kết quả và cùng từng dòng). Chúng **MUST NOT** được đánh dấu xong bằng cách xem bằng mắt. Thiết kế ở mục 7, lát cắt 2 và 5. |
| **P6** Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Thứ tự ở mục 9 chia theo **lát cắt dọc**: lát 1 đã xem được trên trình duyệt với người, bóng và độ cao, không để lại nút không làm gì. |
| **P7** Tệp sao lưu phải mở lại được sau khi ứng dụng lớn lên | ⚠️ **Có một cái bẫy đã định danh** | Xem **D136** và **R61**. `backupSchema.ts:264` có `cheDoMoPhong: z.enum(['co-dien','lien-tuc'])`, và `backupService.test.ts:913` đã dựng sẵn một phép kiểm dùng **đúng giá trị `'ba-chieu'`** làm ví dụ về chế độ lạ phải bị từ chối. Góc nhìn **MUST NOT** được nhét vào `cheDoMoPhong`. |
| **P8** Song ngữ Việt–Anh, mỗi ngôn ngữ trọn vẹn | ✅ | Mọi chuỗi mới đi qua lớp tra cứu `src/ui/ngonNgu`, đủ hai bản **trong cùng commit** (AC-50.4). Chuỗi mới đã biết: nhãn hai góc nhìn, lời giải thích khi trận cổ điển không có góc nhìn 3D, tóm tắt cho trình đọc màn hình, nhãn "độ cao đã phóng đại". |
| **P9** Không bắt buộc dùng chuột, chữ phải đọc được | ✅ | Điều khiển đổi góc nhìn là một `button` thật nên bàn phím tới được sẵn; tiêu điểm nhìn thấy được (AC-50.1). Tương phản 4,5:1 **đo lại** sau khi chỉnh màu, bằng cách mở rộng `src/ui/theme.test.ts` đã có. Hai đội phân biệt bằng thêm một kênh ngoài màu (AC-50.3). |
| **P10** Quy mô lưu trữ của sự nghiệp | ✅ | Spec 011 thêm **một** giá trị tuỳ chọn, không thêm một bản ghi trận nào. Tệp sao lưu không to thêm. |
| **Non-goals mục 1, dòng 23** | ⚠️ **Phải bump 4.0.0** | *"Đồ hoạ 3D; mọi hiển thị sân là 2D dạng điểm."* Đây là chỗ duy nhất spec 011 đụng hiến pháp, và nó được xử bằng **sửa hiến pháp**, không bằng ngoại lệ. Lát cắt 0. |
| **Ràng buộc: Tailwind cho giao diện** | ✅ | `San3D` dùng Tailwind cho khung ngoài và SVG nội tuyến cho mặt sân, đúng khuôn `San2D` và `SanBong` đang làm. |
| **Ràng buộc: cấm `any`** | ✅ | TypeScript `strict`; mọi kiểu mới khai tường minh. |
| **Chuẩn chất lượng: test giao diện không bắt buộc** | ✅ | Hiến pháp mục 4 ghi rõ *"Test cho giao diện **không bắt buộc** — giao diện được xác nhận bằng cách người dùng bấm thử"*. Nên **R52 không phải một vi phạm hiến pháp**, và quyết định "chỉ kiểm phần toán thuần" là đúng chuẩn, không phải một nhượng bộ. |

**Ngoại lệ xin miễn trừ:** **Không.** Chỗ duy nhất xung đột là non-goal "đồ hoạ 3D", và nó
được xử bằng cách **sửa hiến pháp lên 4.0.0** — người dùng đã chốt ngày 2026-11-25. Spec 011
MUST NOT bắt đầu lát cắt 1 khi hiến pháp còn là 3.0.1.

---

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** TypeScript `strict` · React 18.3.1 · Vite · Tailwind CSS · Vitest với
  `environment: 'node'`, `include: ['src/**/*.test.ts']`.
- **Phụ thuộc mới: Không.** Xem **D132** cho lý do và cho phương án bị loại.
- **Vùng code bị chạm:**

| Đường dẫn | Việc | Mới / sửa |
|---|---|---|
| `.specify/memory/constitution.md` | Gỡ non-goal "đồ hoạ 3D", bump 4.0.0, ghi Changelog | sửa |
| `src/ui/chieuSaBan.ts` | Phép chiếu sa bàn, thuần | **mới** |
| `src/ui/chieuSaBan.test.ts` | Phép kiểm phép chiếu | **mới** |
| `src/ui/components/San3D.tsx` | Lớp vẽ sa bàn | **mới** |
| `src/ui/viTriVe.ts` | **Sửa 2026-11-25 (D145)**: bóc `viTriMetLienTuc` trả **mét**, `viTriVeLienTuc` gọi chính nó — hành vi ra ngoài **không đổi** | sửa |
| `src/ui/quyDoiMet.ts` | Không đổi — `KhungAnh`, `ToaDoVe` dùng lại nguyên. ⚠️ **`tiLeMet` KHÔNG được dùng cho sa bàn** — xem **D144** | đọc |
| `src/ui/mocVe.ts` | Không đổi — `anhChupTuLo` dùng lại nguyên | đọc |
| `src/ui/giamChuyenDong.ts` | Hook giảm chuyển động, bóc từ `San2D.tsx:1039` (**D143**) | **mới** |
| `src/ui/components/San2D.tsx` | **Hai lần**: Phase 61 bỏ hook nội bộ và import từ chỗ mới (**D143**); Phase 65 chỉ **diện mạo** theo hệ thống thiết kế (US-8) | sửa |
| `src/ui/pages/` (trang xem trận) | Nút đổi góc nhìn, thứ bậc bố cục | sửa |
| `src/ui/ngonNgu/` | Chuỗi mới, đủ hai bản | sửa |
| `src/index.css` | Chỉnh biến vượt trần bão hoà | sửa |
| `src/ui/theme.test.ts` | Thêm phép kiểm trần bão hoà + đo lại tương phản | sửa |
| `src/services/tuyChonRepo.ts` | `docGocNhinSan` / `datGocNhinSan` | sửa |
| `src/hooks/useMatch.ts` | Chỉ nếu cần phát thêm cờ "có dữ liệu liên tục" | sửa, tối thiểu |
| `specs/011-pro-ui-3d-pitch/he-thong-thiet-ke.md` | Tài liệu hệ thống thiết kế | **mới** |
| `src/engine/**` | **KHÔNG CHẠM** | — |

---

## 3. Kiến trúc giải pháp

Mối nối đã có sẵn từ spec 007 — đây là lý do spec 011 là việc **vẽ**, không phải việc dựng mô
hình. Lớp 3D cắm vào **cùng một chỗ** sân 2D đang cắm, và không có nhánh nào mới ở tầng dưới:

```
  src/engine/lienTuc/loMoc.ts        Float32Array stride 8: x,y,z,vx,vy,vz,huong,coMat
          │                           26 thực thể · CHỈ ĐỌC · không đổi một dòng
          ▼
  src/hooks/useMatch.ts              loMoc · soLo · oCuaNguoi · msMoiPhut · dangChay
          │                           (năm prop này ĐÃ tồn tại và San2D đã nhận)
          ▼
  src/ui/mocVe.ts  anhChupTuLo()  ─► AnhChupMet { thucThe[26], oCuaNguoi, nguoiGiuBong }
          │                           đã có · thuần · đã có phép kiểm
          ▼
  src/ui/viTriVe.ts  viTriVeLienTuc()  ─► Diem | null   (mét → đơn vị viewBox, x & y)
          │                           đã có · thuần · bảy lớp của chế độ cổ điển ĐÃ TẮT
          │
          ├──────────────► src/ui/quyDoiMet.ts     ──► San2D.tsx    (SVG phẳng, 100×64)
          │                 đã có                       đã có
          │
          └──────────────► src/ui/chieuSaBan.ts    ──► San3D.tsx    (SVG sa bàn, 100×64)
                            ★ MỚI · thuần               ★ MỚI
                            θ=50° · HE_SO_CAO=3
```

Điều đáng nói nhất về mối nối này: `viTriVeLienTuc` đã ghi trong chú thích rằng ở chế độ liên
tục nó **tắt bảy lớp** của chế độ cổ điển — nội suy Hermite, hệ số theo độ mệt, hệ số
rơi-đứng-yên, bám đường bóng, kẹp dải thủ môn ở lớp vẽ, dao động chờ, nghiêng khối theo bóng —
*"vì nếu để chúng chạy thì `(x′ − x)/dt` không còn bằng vận tốc engine nói"*. Lớp 3D hưởng
nguyên lợi ấy: nó nhận vị trí **chưa bị uốn**, nên nó chỉ còn phải cộng `z` và chiếu.

**Hình là hàm của trạng thái.** `chieuSaBan.ts` là hàm thuần: cùng `(AnhChupMet, KhungAnh)` cho
cùng một tập toạ độ, không đọc đồng hồ, không đọc trạng thái component. Đó là điều làm nó kiểm
được bằng bộ kiểm `environment: 'node'` hiện có, không cần một hạ tầng kiểm nào mới.

### Quyết định thiết kế

Số D tiếp nối spec 007 (dừng ở D129).

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D130** | Lớp 3D là gì về mặt thành phần | **Một component riêng `San3D.tsx`**, nhận **đúng cùng bộ prop** của `San2D`. Trang xem trận chọn render cái nào. | (a) Một cờ `baChieu` bên trong `San2D`. (b) Một component bọc ngoài render cả hai rồi ẩn một cái bằng CSS. | (a) `San2D` đã **2.370 dòng** và là file chịu thay đổi nặng nhất của bốn spec liền; thêm một nhánh cờ xuyên suốt nó là cách chắc nhất để phá một trong hàng chục AC đã đóng, và AC-49.8 cấm đúng điều đó. (b) Ẩn bằng CSS nghĩa là **cả hai lớp cùng chạy** mọi khung — ngân sách AC-51.1 trả giá đôi cho một lớp không ai thấy. |
| **D131** | Phép chiếu sống ở đâu | **Module thuần `src/ui/chieuSaBan.ts`**, đặt cạnh `quyDoiMet.ts` và theo đúng khuôn của nó (`KhungAnh` vào, `ToaDoVe` ra). | (a) Hàm nội bộ trong `San3D.tsx`. (b) Thêm vào `quyDoiMet.ts`. | (a) Hàm nằm trong `.tsx` thì bộ kiểm **không gọi tới được**, vì `include` chỉ nhận `src/**/*.test.ts` — và đây đúng là vùng mà "sai một dấu trừ thì hình vẫn vẽ ra, chỉ sai". (b) `quyDoiMet.ts` là phép quy đổi **hai chiều, đẳng hướng** mà `San2D` và `viTriVe` đang dựa vào; thêm một trục và một hệ số phóng đại vào đó là đổi nghĩa một module mà bốn spec đang đứng trên. |
| **D132** | Có thêm thư viện 3D không | **Không thêm gì.** Tự chiếu trên SVG. | `three.js` hoặc tương đương. | Camera cố định ở `θ = 50°` với **yaw 0** nên phép chiếu là một **biến đổi affine** — vài chục dòng, kiểm được bằng số. Cái mua được khi không thêm: **42 biến màu, chủ đề sáng/tối, bàn phím, trình đọc màn hình, giảm chuyển động của spec 003/005/006 thừa được nguyên**, vì lớp 3D vẫn là DOM. Một lớp WebGL vẽ vào canvas thì AC-50.1, AC-50.2, AC-50.5 và AC-49.5 phải làm lại từ đầu, trong đúng vùng R52. ⚠️ **Lý do này KHÔNG phải một điều luật:** hiến pháp mục 3 cho thêm thư viện thoải mái, miễn đóng gói offline được và ghi vào plan. Nếu sau này cần ánh sáng và bóng đổ thật thì thêm `three.js` là **hợp hiến**, chỉ là đắt ở bốn AC trên. |
| **D133** | Hai con số của sa bàn | **`GOC_SA_BAN = 50` độ và `HE_SO_CAO = 3`, mỗi con số tồn tại ở đúng một chỗ** trong `chieuSaBan.ts`, và `HE_SO_CAO` đi ra tới giao diện qua một nhãn song ngữ (AC-46.6). | (a) Tỉ lệ thật, không phóng đại. (b) Phóng đại ẩn, không nói cho người dùng. | (a) Đã đo: ở tỉ lệ thật `z = 1 m` nhấc bóng **0,19–0,42 lần bán kính của chính nó** và `z = 5,26 m` chỉ được **1,0–2,2 lần** — US-1 chết. (b) Một sa bàn phóng đại một trục mà không nói là một lời hứa sai; và người dùng này đo bằng mắt rất tốt. |
| **D134** | Hai hình chiếu sát nhau | **Tách bằng viền**, và một hàm thuần `phanBietDuoc(a, b, banKinh)` quyết "hai hình này còn đọc ra hai hay không" — **không dịch một thực thể nào**. | (a) Giãn ra như `BUOC_GIAN` của sân 2D. (b) Không làm gì. | (a) Giãn là dịch khỏi mét thật, và điều đó **phá AC-46.5** vốn đòi hai góc nhìn chỉ vào đúng cùng một chỗ; nó còn phải đứng yên khi tạm dừng, nếu không thì phá AC-49.3. (b) Người dùng chốt đo "chồng khít" **sau khi chiếu**, nên không làm gì là để nhóm 3 của US-4 rỗng. |
| **D135** | Bóng bị che | **Bóng luôn vẽ sau cùng** (trên tất cả), **cộng một dấu hiệu** khi có thực thể nằm trước nó theo độ sâu. | (a) Cho bị che. (b) Chọn góc camera sao cho không bao giờ bị che. | (a) Phá AC-32.7 — một AC đã đóng của spec 006 — ở lớp mới. (b) Không dựng nổi: với 22 người trên 105×68 m, không có góc nào bảo đảm không che. |
| **D136** | Lưu lựa chọn góc nhìn | **`docGocNhinSan` / `datGocNhinSan` trong `src/services/tuyChonRepo.ts`**, kiểu `'phang' \| 'sa-ban'`, theo đúng khuôn `docHienSan2D` / `datHienSan2D` đã có ở chính file ấy. | (a) Thêm giá trị vào `cheDoMoPhong` của bản ghi trận. (b) `localStorage`. | (a) ⚠️ `backupSchema.ts:264` ràng `cheDoMoPhong: z.enum(['co-dien','lien-tuc'])`, và `backupService.test.ts:913` **đã dựng sẵn** một phép kiểm lấy đúng giá trị `'ba-chieu'` làm ví dụ chế độ lạ phải bị từ chối. Nhét góc nhìn vào đó vừa phá P7 vừa làm đỏ một phép kiểm đã tiên liệu chính việc này. Hơn nữa góc nhìn là tuỳ chọn **của người xem**, không phải thuộc tính của trận. (b) `tuyChonRepo.ts:7-8` tự ghi: *"Lưu trong store `meta` đã có, không dùng `localStorage`: ứng dụng hiện có ĐÚNG MỘT chỗ lưu dữ liệu là IndexedDB"*. |
| **D137** | Thứ tự vẽ theo độ sâu | **Sắp mỗi khung, nhưng chỉ ghi lại thứ tự DOM khi thứ tự thật sự đổi.** So thứ tự mới với thứ tự khung trước; giống thì không chạm DOM. | (a) Sắp rồi để React xếp lại khoá mỗi khung. (b) Thứ tự DOM cố định. | (a) Sắp 26 phần tử là không đáng kể, nhưng **di chuyển nút DOM mỗi khung** thì đúng là thứ ngân sách AC-51.1 đếm. Thứ tự độ sâu chỉ đổi khi hai người vượt nhau theo trục sâu — hiếm hơn 60 lần một giây rất nhiều. (b) SVG vẽ theo thứ tự tài liệu và **không có `z-index`**, nên thứ tự cố định là che sai. |
| **D138** | Hệ thống thiết kế gác bằng gì | **Tài liệu `he-thong-thiet-ke.md` trong `specs/011-.../`, cộng mở rộng `src/ui/theme.test.ts`** đã có. | (a) Chỉ tài liệu, không phép kiểm. (b) Một phép kiểm mới từ đầu. | (a) AC-48.2 đòi "kiểm được bằng một phép kiểm, không bằng mắt". (b) `theme.test.ts` **đã** đọc `index.css?raw`, **đã** bóc khối `:root` và `:root[data-che-do='toi']`, **đã** đo tương phản, và **đã** có hàm `sacMau`. Chỉ còn thiếu một hàm **độ bão hoà** — `sacMau` tính *sắc màu* chứ không phải *bão hoà*. Dựng mới là bỏ một guồng đang chạy. |
| **D139** | Lớp 3D lấy vị trí **của 22 cầu thủ** từ đâu | **Dùng lại `viTriVeLienTuc` nguyên vẹn**; `chieuSaBan` chỉ nhận kết quả của nó cộng `z` từ `AnhChupMet`. | Viết một đường đọc lô mốc riêng cho cầu thủ ở lớp 3D. | Hai đường đọc cùng một lô là hai nguồn cho một câu trả lời, và AC-46.5 đòi chúng **khớp tuyệt đối**. Một đường thì AC ấy đúng theo cấu trúc; hai đường thì nó thành một thứ phải canh mãi mãi. ⚠️ **Sửa 2026-11-25 sau `/analyze`:** bản đầu của D139 nói "lớp 3D lấy vị trí" chung chung và hứa "một đường đọc duy nhất" cho **mọi** thực thể. Lời hứa ấy **có lỗ đúng ở quả bóng**, vì `viTriVeLienTuc` nhận `playerId` mà quả bóng không có `playerId`. Phần bóng tách ra thành **D142**. |
| **D142** | Lớp 3D lấy vị trí **quả bóng** từ đâu | **Cả `x`, `y`, `z` từ `anhChup.thucThe[CHI_SO_BONG]`** — cùng một mốc engine, cùng một mốc thời gian (AC-46.8). Người dùng chốt phương án (b) ngày 2026-11-25. | (a) `x, y` từ `phaBong` như sân 2D, chỉ `z` từ mốc. (c) Đổi sân 2D để nó cũng đọc bóng từ mốc. | **Dữ kiện `/analyze` tìm ra:** sân 2D vẽ bóng bằng `viTriBongTrongPha` của `phaBong.ts` (`San2D.tsx:1543`, `:1846`), còn `loMoc` chỉ dùng cho cầu thủ (`:1773`); `CHI_SO_BONG` **không có trong một dòng code sản phẩm nào**, chỉ `mocVe.test.ts:172`. Và `dongThoiGianPhaBong` **nén mọi đoạn cho vừa một nhịp** (`:1076`), nên bóng 2D khác cả **mốc thời gian**, đúng loại biến dạng `viTriVeLienTuc` cố ý tắt cho cầu thủ. (a) giữ được AC-46.5 nguyên văn nhưng trộn hai mốc thời gian, nên **dấu chiếu của AC-46.2 sẽ chỉ sai chỗ** — đổi một lời nói dối lấy một lời nói dối khác. (c) đúng nhất về kiến trúc và đắt nhất: chạm `San2D.tsx` ngay Phase 61, phá điều kiện RA của T786, rơi vào **R64**, đụng `AC-33.1` của spec 006. **Cái giá của (b) đã nhận và đã ghi:** bóng ở hai góc nhìn có thể ở hai chỗ khác nhau — `spec.md` mục 5 có một dòng riêng cho nó. |
| **D143** | Hook giảm chuyển động dùng chung | **Bóc `useGiamChuyenDong` ra `src/ui/giamChuyenDong.ts`** rồi cả `San2D` và `San3D` cùng import. | Nhân bản hook trong `San3D.tsx`. | `/analyze` tìm ra nó là hàm **không export** (`San2D.tsx:1039`), nên `San3D` không import được. Nhân bản là dựng **hai nguồn cho một hành vi** mà P9 coi là yêu cầu accessibility, không phải tuỳ chọn — và repo này chống đúng điều đó ở nhiều chỗ. Cái giá: bóc nó ra là **chạm `San2D.tsx`**, nên nó thành một task riêng ở Phase 61 (**T812**) và điều kiện RA của T786 phải tính từ **sau** T812, không từ nền đo. |
| **D146** | Hai bất biến "nhóm dữ liệu" hoá ra KHÔNG đúng sẵn | **AC-49.1 đặt ngưỡng sát số đo (≥99% số mốc, lệch ≤2,5 m) và gọi tên món nợ; AC-49.2 thu hẹp còn "hai lớp đọc cùng một lô, so từng số".** | (a) Mở task sửa engine ở spec 007. (b) Bỏ hai AC. (c) Viết đúng lời AC cũ rồi để phép kiểm đỏ. | ⚠️ **Quyết định do `/implement` phát hiện ở T777 và người dùng chốt ngày 2026-11-25.** T777 giả định hai bất biến này "đúng sẵn vì hai lớp đọc cùng một lô mốc". Đo thật: thủ môn ra khỏi một phần ba sân ở **0,96%** số mốc (7/732, lệch tối đa **2,01 m**) vì engine kẹp **đích** chứ không kẹp **vị trí**; và thứ tự **tám hàng** của AC-30.8 sai ở **98,9%** số mẫu vì tiền đạo khách cắm ở `x ≈ 15`, sau lưng hậu vệ nhà (`x ≈ 37`). Cả hai đều là tính chất của **engine spec 007**, không phải của lớp vẽ — AC-30.8 vốn được spec 005 kiểm trên bố cục **cổ điển** (`hinhSan`), một nguồn vị trí khác hẳn. (a) bị loại vì spec 011 tự cấm chạm `src/engine/` và P2 cấm đổi con số trận. (b) bị loại vì mất hẳn một nhóm bất biến. (c) bị loại vì điều kiện RA chung đòi bộ kiểm **xanh**, nên một phép kiểm đỏ thường trực sẽ chặn mọi task sau. **Không ngưỡng nào bị hạ lặng lẽ:** 1% và 2,5 m đặt sát 0,96% và 2,01 m nên phép kiểm đỏ ngay nếu nợ xấu đi, và cả hai món nợ được ghi tên trả về spec 007. |
| **D144** | Hệ tỉ lệ của sa bàn | **Hệ riêng `tiSaBan(khung) = khung.cao / RONG_SAN`** (= 64/68 = 0,941176 ở khung chuẩn), dùng cho **cả ba trục**. | Dùng lại `tiLeMet` (0,864706) đúng như bảng file của plan này hứa. | ⚠️ **Quyết định do `/implement` phát hiện và người dùng chốt ngày 2026-11-25.** Bản đầu của plan hứa “`tiLeMet` dùng lại nguyên”, nhưng **năm con số đã công bố ở khối mở đầu `spec.md` không ra được từ `tiLeMet`** — đo bằng máy: với `tiLeMet` thì chiều sâu **45,0** (spec: 49,0), đỉnh bóng **8,77** (spec: 9,5), `z = 1 m` chỉ **0,98×** bán kính bóng (spec: 1,07×) — tức **T765(e) đỏ** và lời hứa trung tâm của US-1 (“thấy được độ cao 1 m”) mất. `tiLeMet` trừ lề `2·2,6` và lấy `min` hai trục; năm con số ấy được tính từ một hệ **không lề**, `64/68`. Đây là lần thứ **sáu** của dự án mà một con số không dựng nổi được **hỏi lại thay vì bị hạ ngưỡng**. 📍 **Hệ quả phải ghi ra:** `tiSaBan` không chừa lề ngang — 105 m × 0,941176 = **98,82 trên 100 đơn vị**, chỉ còn **0,59 đơn vị mỗi bên**, nhỏ hơn bán kính đĩa cầu thủ (2,6). Nên **T767 phải chọn bán kính đĩa của sa bàn** cho vừa, hoặc nhận việc đĩa bị cắt ở hai góc đường biên. Chiều dọc thì dư chỗ: 2,6 (lề đáy) + 49,0 + 9,5 = **61,1 ≤ 64**. |
| **D145** | Làm sao giữ “một đường đọc duy nhất” khi `chieuDiem` nhận **mét** | **Bóc `viTriMetLienTuc(anhChup, playerId)` trả mét** ra `viTriVe.ts`, rồi `viTriVeLienTuc` gọi chính nó và chỉ thêm `toaDoTuMet`. | (a) `chieuDiem` nhận `ToaDoVe` 2D đúng như **D139** viết. (b) San3D tự đọc lô mốc. | ⚠️ **Quyết định do `/implement` phát hiện và người dùng chốt ngày 2026-11-25.** **D139** nói San3D đưa kết quả `viTriVeLienTuc` vào `chieuDiem`, nhưng bảng Contracts của chính plan này cho `chieuDiem` nhận **mét**, và `viTriVeLienTuc` trả **toạ độ vẽ**. Hai câu không cùng đúng được. (a) bị loại vì nó khoá phép chiếu vào `tiLeMet`, tức buộc **D144** phải chọn phương án làm T765(e) đỏ. (b) bị loại vì đó đúng là hai đường đọc mà **D139** tồn tại để chống. Phương án đã chọn **sạch hơn D139 bản đầu**: đường đọc duy nhất giờ là một hàm trả **mét**, và cả hai lớp vẽ đều đứng trên nó — `San2D` qua `toaDoTuMet`, `San3D` qua `chieuDiem`. AC-46.5 vẫn đúng **theo cấu trúc**. Giá: chạm `src/ui/viTriVe.ts`, một file không có trong danh sách của T764/T768 — nên T768 được sửa để nêu tên nó. |
| **D140** | Số áo ở sa bàn | **`<text>` cỡ cố định trong hệ viewBox**, không co theo độ sâu, đúng cách art-bible xử lý lớp phủ: *"luôn quay mặt về camera, kích thước cố định trên màn hình"*. | (a) Chữ co theo độ sâu cho "đúng phối cảnh". (b) Không có số áo. | (a) Chữ ở đầu xa sẽ nhỏ hơn và **AC-15.1 (đếm được điểm) hỏng ở nửa sân**. (b) Người dùng đã chốt là cần đọc được. |
| **D141** | Khi trận cổ điển | **Nút đổi góc nhìn không được render**, và trang xem trận mang một câu song ngữ nói vì sao. Cờ phân biệt là `loMoc != null` — **đúng thẻ phân biệt mà `San2D` đang dùng** (quyết định D121 của spec 007). | (a) Nút xám vô hiệu. (b) Vẽ sa bàn với `z = 0`. | (a) Người dùng đã chọn ẩn hẳn. (b) Một sa bàn trông đầy đủ nhưng độ cao luôn bằng 0 là lời nói dối im lặng về chính thứ lớp này sinh ra để kể. |

---

## 4. Mô hình dữ liệu

Không có di trú, không có schema mới cho dữ liệu trận.

```
IndexedDB, store `meta` (đã tồn tại)
+ khoá mới: góc nhìn sân
    giá trị: 'phang' | 'sa-ban'
    mặc định: 'phang'          ← mở app lần đầu vẫn ra sân 2D như hôm nay
    đọc/ghi: src/services/tuyChonRepo.ts, cùng khuôn docHienSan2D/datHienSan2D

KHÔNG đổi:
  - bản ghi trận (`cheDoMoPhong` giữ đúng enum ['co-dien','lien-tuc'])
  - backupSchema.ts
  - bố cục lô mốc (stride 8, 26 thực thể)
```

Giá trị lạ đọc từ lưu trữ rơi về `'phang'`, theo đúng chuẩn chất lượng mục 4 của hiến pháp
("dữ liệu đọc lại từ lưu trữ MUST được kiểm tra hợp lệ"). Khoá này **không** vào tệp sao lưu:
nó là tuỳ chọn hiển thị, không phải dữ liệu người dùng bỏ công nhập (P3), và `backupSchema.ts`
hiện cũng không mang tuỳ chọn nào.

---

## 5. Contracts

Tất cả ở tầng `ui`, trừ hai hàm tuỳ chọn ở `services`.

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `GOC_SA_BAN` | — | `50` (độ) | — |
| `HE_SO_CAO` | — | `3` | — |
| `tiSaBan` | `KhungAnh` | `number` (đơn vị ảnh cho một mét) | — (**D144**: `cao / RONG_SAN`, **không** phải `tiLeMet`) |
| `chieuDiem` | `KhungAnh`, `xMet`, `yMet`, `zMet` | `ToaDoVe` | — (hàm toàn phần) |
| `chieuMatSan` | `KhungAnh` | bốn góc mặt cỏ + các vạch, đã chiếu | — |
| `doCaoVe` | `KhungAnh`, `zMet` | `number` (đơn vị viewBox, đã nhân `HE_SO_CAO`) | — |
| `thuTuDoSau` | `readonly ToaDoVe[]` | `readonly number[]` (chỉ số, xa → gần) | — |
| `viTriBongLienTuc` | `AnhChupMet`, `KhungAnh` | `{ matSan: ToaDoVe; chieu: ToaDoVe; zMet: number } \| null` | ô bóng không có mặt → `null`, người gọi hiểu là "không vẽ bóng" |
| `viTriMetLienTuc` | `AnhChupMet`, `playerId` | `{ xMet: number; yMet: number } \| null` | không có ô hoặc `coMat = 0` → `null` (**D145**) |
| `useGiamChuyenDong` | — | `boolean` | — (bóc từ `San2D.tsx:1039`, xem **D143**) |
| `phanBietDuoc` | `ToaDoVe`, `ToaDoVe`, `banKinh` | `boolean` | — |
| `bongBiChe` | `ToaDoVe` (bóng), `readonly ToaDoVe[]`, `banKinh` | `boolean` | — |
| `docGocNhinSan` | — | `Promise<'phang' \| 'sa-ban'>` | lưu trữ không đọc được → rơi về `'phang'` |
| `datGocNhinSan` | `'phang' \| 'sa-ban'` | `Promise<void>` | hết dung lượng → báo bằng ngôn ngữ đang chọn |

`San3D` nhận **đúng** `Props` của `San2D` (`DuLieuVe` + `msMoiPhut` + `dangChay` + `loMoc` +
`soLo` + `oCuaNguoi`). Không thêm một prop nào: thêm prop là mở một đường mà AC-46.5 phải canh.

---

## 6. Ánh xạ AC → thiết kế

51 AC của spec, phủ hết.

### US-1 — độ cao (AC-46)

| AC | Được đáp ứng bởi |
|---|---|
| AC-46.1 | `doCaoVe` với `HE_SO_CAO = 3`; phép kiểm trong `chieuSaBan.test.ts` khẳng định `doCaoVe(1 m) ≥ BAN_KINH_BONG` và `chieuDiem` ở `z = 5,26` còn trong **khung ảnh** (`0 ≤ y ≤ cao`) — ~~`GioiHanVe`~~, sửa 2026-11-25 cùng lúc với T765(e): `GioiHanVe` là khung của **mặt cỏ** nên bóng bay cao **phải** vượt khỏi nó |
| AC-46.2 | `San3D` vẽ dấu chiếu tại `chieuDiem(x, y, 0)` cho mọi mốc có `z > 0` |
| AC-46.3 | Phép kiểm đơn điệu: `doCaoVe` tăng nghiêm ngặt theo `z` trên dải `[0; 5,26]` |
| AC-46.4 | Đọc `z` của mốc `danh_dau` từ `AnhChupMet`; `San3D` không tự đặt con số nào |
| AC-46.5 | **D139 + D145** — một đường đọc duy nhất (`viTriMetLienTuc`) cho **22 cầu thủ** ở cả hai lớp. Phép kiểm **P5**: cùng `AnhChupMet` → `(x, y)` của `San2D` và của `San3D` bằng nhau từng số |
| AC-46.8 | **D142** — `viTriBongLienTuc` đọc `thucThe[CHI_SO_BONG]`, lấy cả ba trục từ **một** mốc |
| AC-46.6 | `HE_SO_CAO` tồn tại ở đúng một chỗ (**D133**); nhãn song ngữ trong `src/ui/ngonNgu`; phép kiểm đếm số chỗ xuất hiện của hằng |
| AC-46.7 | `bongBiChe` + **D135** (bóng vẽ sau cùng, có dấu hiệu) |

### US-2 — đổi góc nhìn (AC-47)

| AC | Được đáp ứng bởi |
|---|---|
| AC-47.1 | Nút trên trang xem trận, nhãn nói rõ góc nhìn hiện tại |
| AC-47.2 | Vòng khung hình của trận sống ở `useMatch`, **không** ở component sân; đổi component không đặt lại đồng hồ. Kiểm thủ công theo kịch bản mục 7 |
| AC-47.3 | **D130** — `San2D` không bị sửa logic; mount lại nó là mount lại đúng cây đã chạy bảy spec |
| AC-47.4 | **D136** — `tuyChonRepo` |
| AC-47.5 | **P5** — phép kiểm cùng mã trận hai lần, diff dòng sự kiện, với góc nhìn đổi giữa hai lần |
| AC-47.6 | **D141** — cờ `loMoc != null`; chuỗi song ngữ giải thích |

### US-3 — hệ thống thiết kế (AC-48)

| AC | Được đáp ứng bởi |
|---|---|
| AC-48.1 | `he-thong-thiet-ke.md`, bảng bốn cột: tên · giá trị · nghĩa · chỗ được dùng |
| AC-48.2 | **D138** — `theme.test.ts` mở rộng: biến tầng tín hiệu không được xuất hiện ở nhóm biến nền/trang trí |
| AC-48.3 | `theme.test.ts` mở rộng: hàm **độ bão hoà** mới (cạnh `sacMau` đã có), khẳng định bão hoà của nhóm thông tin > nhóm trang trí |
| AC-48.4 | Bảng cặp màu dễ lẫn trong `he-thong-thiet-ke.md`, mỗi dòng có cue phụ bắt buộc |
| AC-48.5 | Kiểm thủ công: chụp, chuyển đen trắng, đọc lại (mục 7) |
| AC-48.6 | Thang cỡ chữ / khoảng cách / độ dày trong tài liệu; áp bằng lớp Tailwind, không số rời |
| AC-48.7 | Bố cục trang xem trận: một khối chính, các khối phụ lùi lại — lát cắt 5 |
| AC-48.8 | `theme.test.ts` mở rộng, chạy trên **cả hai** khối `:root` và `:root[data-che-do='toi']` như nó đang làm |

### US-4 — bất biến (AC-49)

| AC | Được đáp ứng bởi |
|---|---|
| AC-49.1 | **D146** — `batBienSaBan.test.ts` đo tỉ lệ và độ lệch thủ môn trên ≥10 mã trận; ngưỡng đặt **sát** số đo thật nên nó đỏ ngay nếu món nợ của spec 007 xấu đi |
| AC-49.2 | **D146** — đã THU HẸP: `batBienSaBan.test.ts` so `(x, y)` mà hai lớp đọc ra, **từng số**. Mệnh đề “tám hàng” của AC-30.8 sai ở 98,9% số mẫu trong engine liên tục và được trả về **spec 007** |
| AC-49.3 | Nhóm **hành vi**: `San3D` đọc `dangChay`; `dangChay === false` thì không chạy vòng khung hình nào |
| AC-49.4 | Nhóm **hành vi**: bóng vẽ từ mốc đang hiển thị, không từ một trạng thái riêng — nên tạm dừng không làm nó biến mất |
| AC-49.5 | Nhóm **hành vi**: `San3D` đọc `prefers-reduced-motion` theo đúng khuôn `useGiamChuyenDong` của `San2D` (dòng 1039) |
| AC-49.6 | Nhóm **hình**: `phanBietDuoc`, đo **sau khi chiếu** |
| AC-49.7 | **D134** — viền, không dịch |
| AC-49.8 | Bộ kiểm hiện có 1.733 phép kiểm chạy nguyên; `San2D` không bị sửa logic (**D130**) |
| AC-49.9 | `src/engine/boundaries.test.ts` đã có; cộng một phép so `git diff --stat src/engine` rỗng ở cuối mỗi lát cắt |

### US-5 — tiếp cận (AC-50)

| AC | Được đáp ứng bởi |
|---|---|
| AC-50.1 | `button` thật, không `div` có `onClick`; vòng tiêu điểm theo chuẩn đang dùng |
| AC-50.2 | `theme.test.ts` đo lại sau khi chỉnh màu |
| AC-50.3 | Hình dạng khác nhau cho hai đội, theo khuôn `mauAo.ts` đã lo tương phản màu áo |
| AC-50.4 | `src/ui/ngonNgu`; `tuongThuat.songNgu.test.ts` là tiền lệ cho phép kiểm "không chuỗi nào rơi về khoá thô" |
| AC-50.5 | `San3D` mang nhãn tóm tắt cho trình đọc màn hình, theo khuôn `moTaDiem` của `San2D` |
| AC-50.6 | **D140** — `<text>` cỡ cố định |

### US-6 — ngân sách (AC-51)

| AC | Được đáp ứng bởi |
|---|---|
| AC-51.1 | **D137** (không chạm DOM khi thứ tự không đổi) + **D140**. Đo ở **cả NĂM mức** — xem khối cảnh báo đầu plan |
| AC-51.2 | Cùng phép đo; ngưỡng 50ms |
| AC-51.3 | Cùng phép đo; ngưỡng 3 giây, đúng ràng buộc hiến pháp mục 3 |
| AC-51.4 | Đọc tuỳ chọn góc nhìn là một lần đọc `meta`, cùng chỗ `docHienSan2D` đang đọc |
| AC-51.5 | **D130** — không có hai lớp cùng chạy; đo lúc đổi |
| AC-51.6 | Phép đo đếm lời gọi mạng = 0; SVG nội tuyến, không tài nguyên ngoài |
| AC-51.7 | `git diff package.json` không có dòng nào ở khối `dependencies` |

### US-7 — hiến pháp (AC-52)

| AC | Được đáp ứng bởi |
|---|---|
| AC-52.1 | Lát cắt 0, chạy bằng `/constitution` |
| AC-52.2 | Dòng Changelog 4.0.0 |
| AC-52.3 | Câu dẫn về mục 1, đúng khuôn lần 3.0.0 |
| AC-52.4 | Phép so: chỉ **một** dòng non-goals bị gỡ; hai dòng kia còn nguyên văn |

### US-8 — sân 2D làm đẹp lại (AC-53)

| AC | Được đáp ứng bởi |
|---|---|
| AC-53.1 | Chỉ đổi giá trị **màu, độ dày, kiểu** trong `San2D` và `index.css`, lấy từ thang của tài liệu |
| AC-53.2 | `BAN_KINH`, `BUOC_GIAN`, `PHI_THEM_NGUOI_GHI_BAN`, `NHIP_TOI_THIEU_DE_NOI_SUY`, `TI_LE_KIP` **giữ nguyên giá trị**; `src/ui/san2D.test.ts` và `viTriVe.test.ts` là lưới gác |
| AC-53.3 | `theme.test.ts` (đã có khối "chữ trên mặt cỏ đọc được" và "màu áo người dùng chọn không bị theme nuốt") |
| AC-53.4 | **P5** — phép kiểm cùng mã trận trước và sau khi chỉnh diện mạo, diff dòng sự kiện |

---

## 7. Chiến lược kiểm thử

**Unit (bắt buộc, `environment: 'node'`, `src/**/*.test.ts`):**

- `chieuSaBan.test.ts` — đây là vùng "sai một dấu trừ thì hình vẫn vẽ ra, chỉ sai", nên nó là
  file quan trọng nhất của spec này:
  - `chieuDiem` ở tâm sân `(52,5 ; 34 ; 0)` cho đúng tâm mặt cỏ đã chiếu, ở mọi `KhungAnh` —
    cùng khuôn đẳng thức mà `quyDoiMet.test.ts` đang dùng.
  - **Dấu của hai trục:** `y` tăng thì điểm đi **ra xa** (lên trên màn hình); `z` tăng thì điểm
    đi **lên** (cũng lên trên màn hình). Hai trục cùng chiều trên màn hình là đúng chỗ dễ sai
    dấu nhất, và phép kiểm phải phân biệt được chúng: tăng `y` **không** được cho cùng kết quả
    với tăng `z`.
  - **`sin` cho chiều sâu, `cos` cho độ cao** — một phép kiểm chốt riêng, vì chính tôi đã lẫn
    hai hàm này một lần trong lúc làm rõ spec.
  - `doCaoVe` đơn điệu tăng trên `[0; 5,26]`; `doCaoVe(1) ≥` bán kính bóng; `z = 5,26` còn
    trong khung.
  - `thuTuDoSau` xếp xa → gần, ổn định khi hai độ sâu bằng nhau.
  - `phanBietDuoc` và `bongBiChe` ở các ca biên: trùng khít, cách đúng một bán kính, cách hai
    bán kính.
- Mở rộng `theme.test.ts` — hàm **độ bão hoà** mới, trần hai tầng, và đo lại tương phản ở cả
  hai chế độ.
- **Ba phép kiểm P5** (hiến pháp đòi, không được xác nhận bằng mắt):
  - AC-46.5: cùng `AnhChupMet` → `(x, y)` của hai lớp bằng nhau **từng số**.
  - AC-47.5: cùng mã trận, có đổi góc nhìn giữa hai lần chạy → diff dòng sự kiện rỗng.
  - AC-53.4: cùng mã trận, trước và sau khi chỉnh diện mạo sân 2D → diff dòng sự kiện rỗng.
- Bộ kiểm hiện có **1.733 phép kiểm / 84 file** chạy nguyên ở mọi lát cắt: đó là lưới gác
  AC-49.8 và AC-53.2.

**Integration:** không có tầng mới, nên không có mối nối mới để kiểm. Mối nối
`useMatch → San2D` đã tồn tại và `San3D` dùng lại đúng nó (**D130**).

**Thủ công — và plan nói thẳng rằng đây là phần lớn:** hiến pháp mục 4 ghi *"Test cho giao diện
không bắt buộc — giao diện được xác nhận bằng cách người dùng bấm thử"*, nên phần ghi ra DOM,
phần tương phản thật trên màn hình và phần trình đọc màn hình **không có lưới tự động**. R52
thu nhỏ, không đóng. Kịch bản phải tự tay kiểm:

1. Chạy một trận ở chế độ liên tục, đổi sang sa bàn giữa lúc đang chạy → đồng hồ không lùi,
   không nhảy phút.
2. Xem một quả tạt → bóng rời mặt sân, dấu chiếu chạy dưới nó, rồi hạ xuống chỗ người nhận.
3. Cho một cầu thủ đi ngang trước bóng → bóng vẫn thấy, có dấu hiệu bị che.
4. Tạm dừng ở giữa một đường bóng bổng → mọi thứ đứng, bóng còn trên không đúng độ cao.
5. Bật giảm chuyển động của hệ điều hành, chạy lại → không nội suy, không dao động, số áo không
   nhấp nháy.
6. Rút chuột ra, dùng Tab → tới được nút đổi góc nhìn, thấy vòng tiêu điểm, đổi được.
7. Mở một trận **cổ điển** → không thấy nút đổi góc nhìn, thấy câu giải thích.
8. Đổi ngôn ngữ sang tiếng Anh → không chuỗi nào rơi về khoá thô.
9. Chụp màn hình xem trận, chuyển đen trắng → vẫn đọc được tỉ số, ai giữ bóng, đội nào là đội nào.
10. Đo ngân sách ở **cả năm mức tốc độ**, ghi số vào `tasks.md` như spec 005/006 đã làm.

---

## 8. Rủi ro & phương án lùi

Số R tiếp nối spec 007 (dừng ở R59).

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| **R60** | **Dấu hoặc hàm lượng giác sai trong phép chiếu.** Hình vẫn vẽ ra, chỉ sai — và sai kiểu "trông cũng giống sa bàn". | **Cao** — chính tôi đã lẫn `sin` với `cos` một lần trong lúc làm rõ spec này | Độ cao hoặc chiều sâu ngược; US-1 trông như chạy mà không chạy | `chieuSaBan.ts` là **hàm thuần** và `chieuSaBan.test.ts` có phép kiểm riêng cho **dấu từng trục** và cho **`sin` vs `cos`**. Đây là lý do **D131** từ chối để phép chiếu nằm trong `.tsx` |
| **R61** | **Góc nhìn bị nhét vào `cheDoMoPhong`** vì nó trông như "một chế độ" | Trung bình | Phá P7 (tệp sao lưu), và làm đỏ `backupService.test.ts` — phép kiểm đã lấy đúng `'ba-chieu'` làm ví dụ chế độ lạ | **D136** nói rõ nơi lưu là `tuyChonRepo`. Phép kiểm backup hiện có **chính là** lưới gác, không cần thêm |
| **R62** | **Ngân sách vẽ vỡ ở mức `rat-nhanh`**, nơi không có nội suy và mốc tới dày nhất | Trung bình | AC-51.1 đỏ ở đúng mức mà spec đã viết sai là "không tồn tại" | **D137** (không chạm DOM khi thứ tự không đổi) + **D140**. Đo ở **cả năm mức**, và đo **trước** khi làm số áo, để biết số áo ăn bao nhiêu |
| **R63** | **Chỉnh 42 biến màu theo trần bão hoà làm vỡ tương phản 4,5:1** ở một cặp mà `theme.test.ts` chưa phủ | Trung bình | Phá P9 ở một màn hình không ai nhìn tới | Chỉnh màu và **đo lại trong cùng commit** (AC-48.8). `theme.test.ts` đã có ba khối (bảng màu, chữ trên cỏ, màu áo người dùng); mở rộng chúng trước khi chỉnh, không sau |
| **R64** | **US-8 trượt từ "làm đẹp lại" sang "làm lại".** `San2D` là 2.370 dòng và mọi lần chạm nó đều là chạm một AC đã đóng | **Cao** | Phá AC-49.8 / AC-53.2, tức phá bốn spec | AC-53.2 liệt **tên** năm hằng phải giữ nguyên giá trị. Lát cắt 5 đi **sau cùng** trong các lát có code, và chỉ được chạm **giá trị màu / độ dày / kiểu**, không chạm một công thức nào |
| **R65** | **Viền của D134 bị đọc nhầm thành một trạng thái của cầu thủ** (thẻ, kiệt sức, sai vị trí) | Trung bình | Thêm một tín hiệu giả trên sân, đúng loại lỗi mà P9 "không chỉ dựa màu" đang chống | Viền là thuộc tính **thường trực của mọi hình**, không bật/tắt theo trạng thái. Ghi vào `he-thong-thiet-ke.md` ở bảng cặp dễ lẫn |
| **R66** | **"Chuyên nghiệp hơn" vẫn là một chữ không ai đo được**, dù người dùng đã chỉ bốn vùng | Trung bình | Lát cắt 4 và 5 xong mà người dùng vẫn thấy chưa chuyên nghiệp | Bốn vùng đã được đổi thành AC đo được: AC-48.7 (thứ bậc), AC-48.6 (thang), AC-48.3 (bão hoà), AC-53.1 (sân 2D). Nếu người dùng vẫn chưa thấy đạt thì đó là **một spec sau**, không phải nới lát cắt này |

**Rollback:** từng lát cắt lùi được độc lập.
- Lát 1–3 (lớp 3D): xoá `chieuSaBan.ts`, `San3D.tsx`, hai hàm `tuyChonRepo` và nút đổi góc nhìn.
  Sân 2D **không bị sửa logic** ở các lát này (**D130**), nên lùi là lùi sạch.
- Lát 4 (hệ thống thiết kế): `git revert` phần `index.css` và `theme.test.ts`.
- Lát 5 (diện mạo sân 2D): đây là lát **khó lùi nhất** vì nó chạm `San2D.tsx` — nên nó đi sau
  cùng, và mỗi commit chỉ chạm một nhóm giá trị.
- Lát 0 (hiến pháp): lùi 4.0.0 thì phải lùi **toàn bộ** spec 011, vì không còn cơ sở để có lớp
  3D. Đây là lý do lát 0 đi đầu và đi một mình.

---

## 9. Thứ tự triển khai

Chia theo **lát cắt dọc chạy được**, không theo tầng. Mỗi lát xong là một thứ bấm thử được
(P6), và bộ kiểm 1.733 phép kiểm xanh.

**Lát 0 — hiến pháp 4.0.0.** Chạy `/constitution`: gỡ đúng một dòng non-goals, bump MAJOR, ghi
Changelog, dẫn về mục 1. Không một dòng code nào. *Xong khi:* AC-52.1 → AC-52.4 đạt.
**Lát này chặn mọi lát sau.**

**Lát 1 — xem được.** `chieuSaBan.ts` + `chieuSaBan.test.ts` (gồm phép kiểm dấu từng trục và
`sin`/`cos`) → `San3D.tsx` vẽ mặt cỏ, vạch sân, 22 cầu thủ qua `viTriVeLienTuc` (**D139**) và
quả bóng **có độ cao** qua `viTriBongLienTuc` (**D142**) → bóc hook giảm chuyển động ra
`giamChuyenDong.ts` (**D143**, task T812, phải xong trước lát 2) → nút đổi góc nhìn (`button`
thật, hai chuỗi song ngữ, lưu qua `tuyChonRepo`) → ẩn nút khi trận cổ điển.
*Xong khi:* mở trình duyệt, chạy một trận liên tục, đổi sang sa bàn, **thấy quả tạt bay lên**.
AC-46.1 → 46.5, AC-46.8, AC-47.1 → 47.6, AC-50.1, AC-50.4, AC-51.7.

**Lát 2 — đúng đắn.** Ba nhóm bất biến: khẳng định nhóm dữ liệu bằng phép kiểm; làm nhóm hành
vi (tạm dừng, bóng có mặt, giảm chuyển động); làm nhóm hình (`phanBietDuoc` + viền, `bongBiChe`
+ bóng vẽ sau cùng + dấu hiệu). Cộng **hai phép kiểm P5** AC-46.5 và AC-47.5.
*Xong khi:* bảy kịch bản thủ công 1–5 đi qua. AC-46.7, AC-49.1 → 49.9.

**Lát 3 — đọc được.** Số áo lớp phủ cỡ cố định (**D140**), tóm tắt cho trình đọc màn hình, đo
tương phản của lớp 3D ở cả hai chủ đề. *Xong khi:* kịch bản 6, 8, 9 đi qua. AC-50.2, AC-50.3,
AC-50.5, AC-50.6, AC-46.6.

**Lát 4 — hệ thống thiết kế.** `he-thong-thiet-ke.md` (bảng màu bốn cột, trần bão hoà hai tầng,
thang cỡ chữ / khoảng cách / độ dày, bảng cặp màu dễ lẫn kèm cue phụ) → mở rộng `theme.test.ts`
với hàm độ bão hoà **trước** khi chỉnh biến → chỉnh biến vượt trần → đo lại tương phản trong
cùng commit. *Xong khi:* AC-48.1 → 48.6, AC-48.8.

**Lát 5 — diện mạo sân 2D và thứ bậc trang xem trận.** Lát khó lùi nhất, nên đi gần cuối: chỉ
chạm **giá trị** màu, độ dày, kiểu trong `San2D` và `index.css`; năm hằng của AC-53.2 giữ nguyên
giá trị; cộng phép kiểm P5 AC-53.4. Rồi thứ bậc bố cục trang xem trận. *Xong khi:* AC-48.7,
AC-53.1 → 53.4, và bộ kiểm hiện có vẫn 1.733 phép kiểm xanh.

**Lát 6 — đo và ghi số.** Đo ngân sách ở **cả năm mức tốc độ**, đếm lời gọi mạng, đo thời gian
mở app với góc nhìn đã lưu là sa bàn. Ghi số thật vào `tasks.md`, đúng cách spec 005 và 006 đã
làm. *Xong khi:* AC-51.1 → 51.6 có **số**, không có lời khẳng định suông.

> **Vì sao đo ở lát 6 mà không ở lát 1:** R62 nói ngân sách dễ vỡ nhất ở mức `rat-nhanh`, và số
> áo (lát 3) là thứ ăn ngân sách nhiều nhất. Đo trước lát 3 thì được một con số không còn đúng;
> đo sau lát 5 thì biết **cả** cái giá của diện mạo mới. Nhưng một phép đo **thăm dò** ở cuối
> lát 1 là đáng làm, để biết sớm nếu phép chiếu tự viết vỡ ngân sách từ gốc — nếu nó vỡ ở lát 1
> thì **D132** phải mở lại, và `three.js` là phương án hợp hiến đang chờ ở đó.

---

## 10. Việc cần người dùng chốt trước khi `/tasks`

**Đã xong.** Một đề nghị sửa **dữ kiện**, người dùng chốt ngày 2026-11-25:

- [x] **`AC-51.1` đã đổi "cả bốn mức tốc độ" thành "cả năm mức tốc độ"**, cùng dòng Hiệu năng ở
  mục 6 của spec. `MS_MOI_PHUT` có năm mức; spec 006 đã đo "ở cả năm mức". Câu cũ sai về dữ kiện
  và sai theo chiều **dễ hơn thực tế** — nó bỏ sót đúng mức `rat-nhanh`, mức mà R62 cho là dễ vỡ
  ngân sách nhất. Việc sửa **không** nới hay thu phạm vi; nó làm `AC-51.1` kiểm được đúng cái nó
  định kiểm. Ghi vào Nhật ký làm rõ của `spec.md`.
