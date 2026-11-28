# Plan: Mỗi cầu thủ một mục đích — một phép phân công ở cấp đội, một dòng rút chưa ai tiêu, và hai con số thể lực

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Draft |
| **Created** | 2026-11-28 |
| **Hiến pháp** | 4.0.1 — spec này **không đòi sửa** hiến pháp |
| **Nền đo** | `2b392c5` · **87** file test, **1.859** phép kiểm xanh · ca xấu tệp xuất **5.332.957 byte / 6.440 hàng mỏng** · một trận liên tục **110,84 ms** trung bình 10 mã, **129,44 ms** ca xấu, **0,0201 ms mỗi mốc** · **5.980–6.440 mốc** một trận |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

> **Dải đánh số của spec này:** quyết định **D147 → D171** (25 quyết định; spec 011 dừng ở
> D146), rủi ro **R68 → R80** (13 rủi ro; spec 011 dừng ở R67, và R67 còn là một tham chiếu
> treo ở spec 007). **D169, D170, D171 do `/analyze` ngày 2026-11-28 thêm**, và cả ba sửa một
> lỗi của chính plan này — không phải của spec.
> **Luật dẫn chứng** của spec 007 vẫn áp: hợp đồng là **tên hàm**, không phải số dòng — số dòng
> ghi kèm để tra, và nó sẽ lệch sau lần sửa đầu tiên.

> ⚠️ **BA DỮ KIỆN TRONG `spec.md` SAI, VÀ PLAN NÀY SỬA CHÚNG RA MẶT** thay vì lặng lẽ làm khác.
> Cả ba do khảo sát code trước khi lập plan tìm ra, và không một ngưỡng nào bị hạ vì chúng:
>
> 1. **AC-40.17 nêu ví dụ một chỉ số mà thủ môn KHÔNG điền.** *"Đọc tình huống"*
>    (`doc-tinh-huong`) không nằm trong 8 chỉ số chung mà thủ môn điền
>    (`attributes.ts:42-51`), nên công thức theo ví dụ ấy cho **mọi thủ môn một con số giống
>    nhau** — tức AC-40.17 tự đỏ. → **D156**.
> 2. **AC-41.22 nêu ví dụ một chỉ số KHÔNG TỒN TẠI.** Không mã nào trong 18 mã của
>    `types.ts:58-76` mang nghĩa *"bình tĩnh"*. → **D157**.
> 3. **AC-40.12 không có một phần tử nào để đo.** v6 **không có thay người do máy** —
>    `kiemTraCanThiep` (`tran.ts:1095`) chặn thẳng đội không phải của người dùng. AC ấy là
>    `0/0`. ✅ **Người dùng chốt ngày 2026-11-28: chuyển nội dung AC sang spec đầu tiên sở hữu
>    huấn luyện viên máy**, giữ nguyên số và nguyên lời. Spec 009 còn **36 AC**. → **mục 10.3**.
>
> 4. **Hai con số nền đã lạc hậu, và cả hai làm plan báo THIẾU.** `spec.md` mục 7 ghi *"một
>    trận liên tục hôm nay tốn **100 ms**"*; đo lại ngày 2026-11-28 trên 10 mã: **110,84 ms**
>    (ca xấu **129,44 ms**). Và `specs/007/plan.md:122` ghi *"5.520–6.000 mốc, trung bình
>    5.754"*; thật ra là **5.980–6.440** — cửa sổ dày của T731 đẩy nó lên **sau** khi bảng ấy
>    được viết. Mọi phép ước lượng chi phí **nhân với số mốc**, nên dùng 5.754 là báo thiếu
>    **11,9%** ngay ở hệ số. Bảng **Nền đo** trên dùng số đo lại, và nó **thay** hai con số ấy.
>
> 5. **KHÔNG trận nào dài 90 phút.** Đo 10 mã: **94–99 phút**, vì `tongPhutTran` cộng bù giờ.
>    Nên điều kiện *"KHI một trận **90 phút** kết thúc"* của **AC-40.10** và **AC-40.11** là
>    **rỗng theo chữ**, và *"15 phút cuối"* của **AC-40.16** bắt đầu ở phút **79–84**, không phải
>    75. → **D167**.
> 6. **Nền của AC-41.6 phụ thuộc một từ chưa ai định nghĩa.** AC ấy đo *"người **không tham
>    gia** đứng im hoàn toàn"* và lấy nền **28,2%** từ spec 007. Nhưng *"không tham gia"* chưa
>    được định nghĩa ở đâu, và đo trên **cả 22 người** cho **66,08%** — một nền khác hẳn. Một
>    ngưỡng *"dưới 10%"* treo trên một mẫu số không xác định là một ngưỡng không kiểm được.
>    → **D168**.
>
> Trong sáu cái: hai là **ví dụ** trong ngoặc nên plan xử được (D156, D157); một là **thân AC**
> nên plan **không** xử — nó hỏi (mục 10.3); một là một phép đo nên plan đo lại; và hai cuối là
> **cách đọc** phải chốt trước khi viết phép kiểm, nên plan chốt chúng ra mặt (D167, D168).

> 📌 **Một dữ kiện làm cả spec này rẻ hơn tưởng.** `tranLienTuc.ts:898` hôm nay đẩy `daRut = 0`
> vào `rutMoiMoc` cho **mọi** mốc: **dòng rút cơ học của T717 chưa tiêu một lần rút nào**, và cả
> dải `RUT_MOI_MOC = 64` mỗi mốc còn trống. Phép kiểm ở `tranLienTuc.test.ts` khẳng định đúng
> con số 0 ấy **cố ý**, để khi chuyển động đến thì ngưỡng 64 có người canh. Spec 009 là lúc ấy —
> xem **D147**. Đó là lý do *"vị trí không quyết định kết cục"* thực thi được **theo cấu trúc**
> chứ không bằng sự cẩn thận.

---

## 1. Kiểm tra hiến pháp (Constitution check)

Hiến pháp đối chiếu: **4.0.1**. Spec 009 **không đòi sửa hiến pháp** — khác spec 011, nó không
gỡ một non-goal nào. Mọi thứ nó làm nằm trong `src/engine/`, đúng chỗ hiến pháp mục 3 đã dành
cho luật bóng đá.

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| **P1** Giả lập phải tái lập được | ✅ **theo cấu trúc, không theo lời hứa** | Mọi quyết định mới rút từ **dòng rút 2** qua `hatGiongMoc(maTran, chiSoMoc)` — một hàm đã tồn tại từ T717, **chưa một dòng mã sản phẩm nào gọi**, và có dải cố định `RUT_MOI_MOC = 64` mỗi mốc. Dòng 2 cách dòng 1 đúng `2^30` lần rút, nên **dòng kết cục không dịch một lần rút nào** (D147). Trạng thái mục đích mang sang phút sau trong `TrangThaiLienTuc`, đúng như `coHoc` (AC-41.20). Không `Math.random`, không `Date.now`. |
| **P2** Luật bóng đá tách khỏi giao diện | ✅ | Toàn bộ mã mới ở `src/engine/lienTuc/`. Lớp vẽ **không đổi một dòng** và **không cần biết một mục đích nào tồn tại** — spec 009 không hiện mục đích ra màn hình. Canh bằng `src/engine/boundaries.test.ts` đã có. |
| **P3** Dữ liệu người dùng bất khả xâm phạm | ✅ **và đây là chỗ đáng lo nhất, nên nói kỹ** | Hai đường có thể vỡ, cả hai đã bị chặn: **(a)** `matchRepo.ts:246` so `phienBanEngine` bằng `!==` tuyệt đối, nên bump số phiên bản là **tước nút đấu lại của mọi trận liên tục đã lưu** — spec 009 **không bump** (D148). **(b)** Chấn thương (AC-40.14) sống trong trạng thái một trận và **không có đường nào tới hồ sơ cầu thủ** (AC-40.15), canh bằng một phép kiểm so hồ sơ trước/sau từng trường. |
| **P4** Chạy offline, dữ liệu không ra khỏi máy | ✅ | Không phụ thuộc mới, không tài nguyên ngoài, không gọi mạng. |
| **P5** Mỗi AC dạng so sánh phải có một test chứng minh | ⚠️ **Phải làm, và nó là phần lớn công việc — cộng MỘT AC không đo được** | Phần lớn **36** AC có một con số. Spec mục 7 đã chốt: sau quyết định *"vị trí không quyết định kết cục"*, **mọi AC còn lại đều đo được trên vị trí** — thứ tệp xuất đã chứa. Nên spec 009 **không thêm một ngoại lệ nào** vào danh sách ngoại lệ đóng mà spec 007 đang canh bằng máy. Bộ đo mới: `doMucDich.ts` (**D159**), tách khỏi `doCoHoc.ts` để file 749 dòng ấy giữ đúng vai trò lưới canh không-tệ-đi. ✅ **Và không còn ngoại lệ nào:** AC-40.12 từng là một — nó đo *"thay người do máy quyết định"*, thứ v6 không có — nhưng người dùng đã **chuyển nó ra khỏi spec** ngày 2026-11-28 (**mục 10.3**). Nên **mọi AC còn lại của spec 009 đều đo được**, và P5 không phải xin một miễn trừ nào. |
| **P6** Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Thứ tự ở mục 9 chia theo lát cắt dọc: hết lát 1 là **xem được một trận trên trình duyệt** với 22 người đi bốn hướng khác nhau. Không lát nào để lại nút không làm gì — spec này không thêm một nút nào. |
| **P7** Tệp sao lưu phải mở lại được sau khi ứng dụng lớn lên | ✅ | Spec 009 **không thêm một trường nào** vào bản ghi trận hay tệp sao lưu. Mục đích chỉ sống trong **tệp xuất dữ liệu trận** (`tepXuat.ts`) — một tệp **đọc một chiều**, không phải đường nhập. `backupSchema.ts` không đổi một dòng. |
| **P8** Song ngữ Việt–Anh, mỗi ngôn ngữ trọn vẹn | ✅ **và spec tự khai, đã kiểm lại** | Spec 009 **không sinh một chuỗi hiển thị nào**: mục đích vào tệp xuất dưới dạng **mã định danh**, và hiến pháp P8 nói rõ *"Tên biến, tên file và mã định danh trong code không chịu ràng buộc này"*. Không nhãn nào vào `domain/`. Nếu sau này muốn hiện mục đích ra sân thì đó là một spec sau, và lúc ấy nghĩa vụ P8 mới sinh. |
| **P9** Không bắt buộc dùng chuột, chữ phải đọc được | ✅ | Không thêm một điều khiển nào, không đổi một màu nào. |
| **P10** Quy mô lưu trữ của sự nghiệp | ✅ | Không thêm bản ghi trận nào. Mục đích **không** vào lịch sử trận; nó vào tệp xuất mà người dùng tự bấm xuất. |
| **Spec 011 AC-49.6 / AC-49.7** | ⚠️ **MỞ LẠI, và lề rất mỏng** | Hai AC ấy bị **gỡ tích rồi tích lại trong cùng ngày 2026-11-26**, và lý do là T814 + T815 kéo cặp không phân biệt được từ **7,27%** xuống **0,041%**. Chúng đang được canh bằng ba dây bẫy tự động trong `src/ui/batBienSaBan.test.ts` chạy trên **chính vị trí của chế độ liên tục**: `TI_LE_MOC_HOP_DONG = 0,2` (đo được 8,8–10,9%, lề **hơn hai lần**) và `TI_LE_CAP_DAY_BAY = 0,002` (đo được 0,041%, lề **năm lần**). **D165** thay mô hình chỗ đứng, nên nó thử lại cả ba. Và **AC-40.1 đòi NÉN khối** từ 57,75 m xuống 30–40 m — tức **tăng** áp lực chồng nhau, đúng chiều xấu. Xem **R80**. |
| **Ràng buộc: cấm `any`** | ✅ | Hai danh mục đóng ở mục 3 của spec thành hai **union kiểu tường minh**, nên trình biên dịch bắt được một mục đích lạ. |
| **Ràng buộc: hiệu năng** | ⚠️ **Đã vượt TRƯỚC khi spec này bắt đầu** | 100 ms một trận so với ngân sách mùa giải 78,95 ms. Spec mục 7 chốt cách xử: **đo lại và báo số**; nới 78,95 là một lần **sửa hiến pháp**, không phải quyết định của spec 009. Xem **D152** và **R68** — và nói thẳng: AC-41.19 mua rất ít. |
| **Chuẩn chất lượng: test bắt buộc cho `engine`** | ✅ | Mọi module mới nằm trong `engine`, nên **mọi task đều phải có test mới được coi là xong**. Đó là cổng chặn của hiến pháp mục 5, không phải một lựa chọn. |

**Ngoại lệ xin miễn trừ:** **Không.** Spec 009 không xin miễn trừ một nguyên tắc nào. Hai chỗ
có thể bị đọc thành ngoại lệ, và cả hai không phải:

- **Đánh số nhóm AC** (US-40/41 và AC-40.4 giữ chủ cũ) là một ngoại lệ **của spec**, người dùng
  đã chốt 2026-11-27 và ghi ở `spec.md` mục 4. Nó không chạm hiến pháp.
- **Hiệu năng vượt ngân sách** là một món nợ **có trước** spec này, không phải một miễn trừ spec
  này xin. Spec 009 nhận nghĩa vụ **đo và báo số**, không nhận quyền nới.

---

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** TypeScript 5.6.3 `strict`, React 18.3.1, Vite 5.4.10, Vitest 2.1.4
  (`environment: 'node'`). Spec 009 **không chạm một file `.tsx` nào**, nên vùng mù `.tsx` của
  bộ kiểm không liên quan lần này.
- **Phụ thuộc mới:** **Không.** Mọi thứ là số học trên `Float32Array` và `number`.
- **Vùng code bị chạm:**

| File | Việc |
|---|---|
| `src/engine/lienTuc/mucDich.ts` | ★ MỚI — danh mục mục đích, phép phân công, mục đích → điểm đích |
| `src/engine/lienTuc/khoiDoiHinh.ts` | ★ MỚI — hình khối đội hình, dịch theo bóng, phản ứng mất bóng |
| `src/engine/lienTuc/theLucCoHoc.ts` | ★ MỚI — thể lực cơ học, quãng đường, trần tốc độ, chấn thương. ⚠️ **Cường độ ở đây là một đại lượng TỨC THỜI dẫn xuất** — tốc độ mốc này chia trần tốc độ của chính người ấy. **KHÔNG có bậc cường độ, KHÔNG có phân bổ phần trăm**: *"đứng và đi 35–45%, chạy chậm 35–45%, chạy nhanh 10–15%, nước rút 2–5%"* là tài sản của **spec 010**, và chính AC-40.10 mang một ⏳ nói tổng quãng đường là **hàm của** phân bổ ấy |
| `src/engine/lienTuc/hanhDong.ts` | ★ MỚI — danh mục hành động, bốn nhánh, gọi tên quyết định v6 |
| `src/engine/lienTuc/doMucDich.ts` | ★ MỚI — bộ đo cho các AC mới, khuôn `doCoHoc.ts` |
| `src/engine/lienTuc/viTriMet.ts` | **THAY** `PHAN_DICH_THEO_BONG` · `phanDichCuaO` · `dichNguoiKhongBong` · `choDungDoiHinhMet`; **SỬA** `TI_LE_DAI_MET` và `TI_LE_COT_MET` (xem **D165** — hai bảng tỉ lệ ấy là nguyên nhân số học của việc AC-40.1 và AC-40.5 không đạt được); **GIỮ** `tamVungMet` (nhật ký đọc nó). ⚠️ `LUI_VE_SAN_MINH = 6` là con số **người dùng chốt bằng mắt** ngày 2026-11-26 — nếu mô hình mới làm nó vô nghĩa thì **D165** phải nói ra và xin lại, không gỡ lặng lẽ |
| `src/engine/lienTuc/nhatKy.ts` | **Không sửa, nhưng bị ảnh hưởng:** nó đọc `tamVungMet` để sinh `x`/`y` của **từng dòng nhật ký** trong tệp xuất, nên sửa `TI_LE_DAI_MET` là dời mọi toạ độ ấy. Không chạm bản ghi trận (**P1** an toàn), nhưng `doCoHoc` có một vế mức-trận so `khoi_dau` với giá trị dẫn xuất |
| `src/ui/batBienSaBan.test.ts` | **Không sửa — phải CHẠY LẠI.** Ba dây bẫy của spec 011 AC-49.6/49.7 đo trên vị trí chế độ liên tục; mô hình chỗ đứng mới thử lại cả ba (**R80**) |
| `src/engine/lienTuc/tranLienTuc.ts` | Mở rộng `TrangThaiLienTuc`; cắm `phanMucDich`, `theLucCoHoc`, `tocDoToiDa` vào vòng mốc; ❗thay `const daRut = 0` (dòng 896) bằng **bộ đếm thật** — task chặn, **D164** |
| `src/engine/lienTuc/loMoc.ts` | Thêm **một mảng mục đích riêng** cho lô (không nới `STRIDE`) |
| `src/engine/lienTuc/tepXuat.ts` | Thêm cột mã mục đích vào khối mỏng; điền `hanh_dong`/`muc_dich` của khung dày; sửa hai chú thích đã lạc hậu |
| `src/engine/lienTuc/coHoc.ts` | **Không đổi một công thức nào.** Chỉ `tocDoToiDa` được gọi lần đầu từ mã sản phẩm |
| `src/engine/tran.ts` | **Không đổi một dòng.** Xuất kiểu `GanHanhDong` nếu cần đặt tên nó ở ngoài |
| `src/engine/theLuc.ts` | **Không đổi một dòng.** Thể lực của v6 giữ nguyên để kết cục không đổi |

- **Nhịp của vòng mốc — ghi đúng sự thật, vì ba kết luận của plan này đứng trên nó.** Phép bước
  cơ học sống **hoàn toàn** bên trong `thucTheTaiMoc`, và một bước dài đúng bằng **khoảng giữa
  hai mốc ĐÃ GHI**: `dt = (chiSoMoc − mocDaGhiTruoc) × DT_MOC` (`tranLienTuc.ts:676-682`) — **1
  giây** ở phần thường, **0,5 giây** trong cửa sổ dày. Khối chú thích đầu `moc.ts` mô tả một
  lưới tích phân 120 bước/phút; đó là **ý định thiết kế của lưới mốc**, không phải nhịp gọi của
  phép bước. Lẫn hai thứ ấy là lỗi mà `tranLienTuc.ts:640-658` đã kể lại một lần (quãng đi chỉ
  bằng **0,478** lần `v × Δt`), và nó là tiền đề của **D153**.
- **Đo lại hôm nay, vì nền cũ lạc hậu:** **6.440** lần gọi `thucTheTaiMoc` một trận 99 phút
  (1.013 mốc dày + 5.427 mốc thường), **0,0201 ms** mỗi mốc, **110,84 ms** một trận trung bình
  10 mã.
- **Thứ KHÔNG SỬA, và vì sao nó là một phần của thiết kế:** mọi **mã sản phẩm** trong
  `src/ui/**` (spec 009 không hiện gì), `src/services/**` (không bump `PHIEN_BAN_ENGINE_LIEN_TUC`,
  không đổi schema), `src/engine/theLuc.ts` và `src/engine/sucManh.ts` (đó là đường kết cục),
  `src/engine/tran.ts`, `src/engine/vung.ts` (lưới 12 vùng vẫn là đơn vị quyết định của v6 —
  giả định mục 10 của spec).
  ⚠️ **"Không sửa" khác "không ảnh hưởng", và bảng trên nói rõ hai thứ ấy.** Spec 009 **không
  sửa một dòng nào** của `src/ui/batBienSaBan.test.ts`, nhưng ba dây bẫy trong đó **đo vị trí
  của chế độ liên tục**, nên **D165** thử lại cả ba (**R80**). Một bảng chỉ liệt thứ mình sửa là
  một bảng bỏ sót đúng chỗ `/analyze` sẽ bắt.

---

## 3. Kiến trúc giải pháp

Lời hứa nền của spec — *"vị trí không quyết định kết cục"* — không phải một lời cam kết về ý
định; nó là một **tính chất của sơ đồ dòng dữ liệu**. Sơ đồ dưới đây là chỗ nó được thực thi.

```
  maTran
    │
    ├─ hatGiongDong(ma, 1) ──► dòng rút 1 ─► tran.ts  buocTiep()  ◄── theLuc.ts (THEO PHÚT)
    │                           KẾT CỤC       └─ quyetKetCucChuoi()      │
    │                                            └─ KetCucPhaV6          │ heSoTheLuc
    │                                               { kq, gan, … }       ▼
    │                                                   │            sucManh.ts
    │                                                   │         ⛔ KHÔNG ĐỔI MỘT DÒNG
    │                                                   │            ⛔ KHÔNG ĐỌC MÉT
    │                                                   ▼
    │                                      ┌────────────────────────┐
    │                                      │  ĐỌC MỘT CHIỀU         │
    │                                      │  pha.kq.cacHanhDong    │
    │                                      │  pha.gan.nguoiChuyen   │
    │                                      │  pha.gan.nguoiKetThuc  │
    │                                      └────────────┬───────────┘
    │                                                   │
    └─ hatGiongMoc(ma, chiSoMoc) ──► dòng rút 2 ────────┤
         CƠ HỌC · dải 64 lần rút/mốc · hôm nay tiêu 0  │
                                                        ▼
                                        tranLienTuc.ts   buocPhutLienTuc()
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────┐
                      ▼                                 ▼                         ▼
              mucDich.ts ★MỚI              khoiDoiHinh.ts ★MỚI        theLucCoHoc.ts ★MỚI
              phanMucDich(đội)             hinhKhoi() · tâm · dải      quãng đường · trần tốc độ
              dichTheoMucDich()            phanUngMatBong()            chấn thương (cơ học)
                      │                                 │                         │
                      └─────────────────┬───────────────┴─────────────────────────┘
                                        ▼
                              coHoc.ts  buocCoHoc(tt, đích, TRẦN, dt)
                              ⛔ KHÔNG ĐỔI MỘT CÔNG THỨC NÀO
                              ✦ TRẦN nay là tocDoToiDa(chỉ số) × hệ số thể lực
                                        │
                                        ▼
                              loMoc  +  oMucDich ★MỚI  ──►  tepXuat.ts
                                                              khối mỏng + một cột
```

**Ba mũi tên là cả kiến trúc.** Mũi tên từ v6 xuống chỉ đi **một chiều**, dòng rút 2 **không
cắt** dòng rút 1, và `theLuc.ts` **không nhận** một mét nào. Nếu cả ba còn đúng thì dòng sự
kiện và tỉ số không thể đổi — không phải vì ai cẩn thận, mà vì **không có đường cho nó đổi**.

### Quyết định thiết kế

Số D tiếp nối spec 011 (dừng ở **D146**).

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D147** | Mọi quyết định mới rút ngẫu nhiên từ đâu | **Dòng rút 2** qua `hatGiongMoc(maTran, chiSoMoc)`. Và — quan trọng hơn — **một bất biến kèm theo: không quyết định mới nào được đổi một trường nào của trạng thái v6**, `trenSan` trước hết. | (a) Dòng rút 1 (kết cục). (b) Một **dòng 3** mới. (c) Không rút gì, mọi thứ tất định. | (a) Rút trên dòng 1 **dịch dãy số của v6**, và `tran.ts:1570` rút một lần cho **mỗi** hành động nên một lần lấn là tỉ số đổi ở mọi mã. (b) `LECH_DONG = 2^30` và `4 × 2^30 = 2^32 ≡ 0`, nên **dòng 3 là dòng cuối còn chỗ** và dòng 4 **quấn về dòng 0 của v6**. Không tiêu nó khi chưa cần. Dòng 2 dư rộng: một trận tiêu `11.508 × 64 = 736.512` lần rút trên một cung `2^30 = 1.073.741.824`, tức **0,07%**. (c) Hai AC đòi một lựa chọn thật: AC-40.4 (ép lại **hoặc** lùi về) và AC-40.14 (chấn thương trung bình 0–1). |
| **D163** | ⚠️ **(Hoàn tất lập luận của D147.) Tách hạt giống KHÔNG phải tách trạng thái — và bản nháp của plan này đã nhầm hai thứ ấy** | **Bất biến phải phát biểu ra mặt:** dòng rút 2 bảo đảm **giá trị** rút không dịch; nó **không** bảo đảm gì về **hậu quả**. Nên lời hứa nền cần **hai** điều, không một: (1) rút trên dòng 2, **và** (2) **không đổi `trenSan`, `theLuc`, `thongKe` hay bất kỳ trường nào của `TrangThaiTran`**. | Tin rằng chỉ cần tách dòng rút là đủ. | 🐞 **Đường vỡ, truy được từng bước:** `apVaoBen` case `'thay-nguoi'` (`tran.ts:1140`) đổi `trenSan` → `doiHinhTrenSan` → `tinhSucManh` (`tran.ts:571`) → `heSoTheLuc` (`sucManh.ts:118`) → `heSoTuongQuan` (`chuoiBong.ts:141`) → **độ dài `kq.cacHanhDong`** → vòng rút ở `tran.ts:1570` tiêu **số lần rút khác** → cả trận lệch. Và `daThay` phát thẳng dòng sự kiện `'thay-nguoi'` (`tran.ts:1773`), nên dòng sự kiện **dài thêm một dòng**, không chỉ đổi nội dung. Hai AC đi đúng vào đường ấy nếu làm theo cách thông thường: **AC-40.12** (thay người) và **AC-40.14/40.15** (chấn thương). Spec 009 xử chúng bằng **D155** (chấn thương **không** rời sân) và **mục 10.3** (AC-40.12 **ra khỏi phạm vi**, người dùng chốt 2026-11-28), nên bất biến còn nguyên — nhưng nó phải được **viết ra**, vì nó là thứ thật sự giữ lời hứa, không phải ba dòng rút. |
| **D164** | ❗ **(Hoàn tất lập luận của D147.) Dụng cụ canh dải 64 là một HẰNG VIẾT TAY — nó chưa từng canh gì** | **Một task CHẶN, đi trước mọi lát cắt dùng dòng 2:** thay `const daRut = 0` bằng một bộ đếm thật (`Rng` bọc có đếm), **đo** số lần rút lớn nhất một mốc trên 10 mã, **báo số**, rồi mới ghim. | (a) Tin vào phép kiểm hiện có. (b) Nới `RUT_MOI_MOC` trước khi đo. | (a) `tranLienTuc.ts:896` là `const daRut = 0`, nên cổng `if (daRut > RUT_MOI_MOC)` là **mã chết** — `0 > 64` không bao giờ đúng — và phép kiểm ở `tranLienTuc.test.ts:224` được viết để *"cố ý đỏ khi Phase 54 đến"* thực ra đang khẳng định một **hằng số**: nó **không bao giờ đỏ được**. Câu *"ngưỡng 64 có người canh"* trong bản nháp của plan này là **sai**. (b) Nhu cầu ước lượng ở một mốc: 22 người chọn mục đích **không** rút (phân công tất định theo thứ tự ô — xem **D152**), cộng ~1 lần rút mỗi lần bóng đổi chủ (AC-40.4) và ~1 lần thử chấn thương, nên **dự kiến dưới 64 rất xa**. Nhưng *"dự kiến"* không phải *"đo"*, và cổng ấy `throw` **giữa lúc mô phỏng**. Nếu đo ra vượt: nới lên **256** là an toàn (`11.508 × 256 = 2.946.048` ≪ `2^30`), và nó đổi `hatGiongMoc` của mọi mốc `k > 0` — nhưng **chỉ trên dòng 2**, nên nó đổi **vị trí** chứ không đổi **tỉ số**. |
| **D148** | Có bump `PHIEN_BAN_ENGINE_LIEN_TUC` (101) không | **Không bump.** | Bump lên 102 để "trận cũ phát lại bằng mô hình cũ". | `matchRepo.ts:246` so `tran.phienBanEngine !== phienBanEngineHienTai` bằng **đẳng thức tuyệt đối**, nên bump là **tước nút đấu lại của mọi trận liên tục đã lưu** — chạm **P3** lần thứ hai. Và nó **không mua gì**: vị trí mét **không vào bản ghi trận** (giả định mục 10 của spec), còn dòng sự kiện và tỉ số **không đổi**, nên một trận lưu trước spec 009 phát lại cho **đúng kết quả cũ**, chỉ hình dạng đẹp hơn. 📌 Đây là chỗ bản `Draft` của spec nói sai cái giá (*"không bắt ai mất gì"*), và nhật ký làm rõ mục 11 đã ghi lại. |
| **D149** | Thể lực: sửa `theLuc.ts` hay thêm một đại lượng | **Thêm `theLucCoHoc`, một đại lượng RIÊNG**, chỉ kẹp tốc độ, **một chiều**, không bao giờ quay về v6. | (a) Sửa `theLuc.ts` cho nó giảm theo quãng đường. (b) Dùng `theLuc` của v6 để kẹp tốc độ, không thêm gì. | (a) **Đường truy đã đo**: `giamTheLuc` (`tran.ts:981`) → `heSoTheLuc` (`sucManh.ts:90`) → `smCong/smThu.trungBinh` → `heSoTuongQuan` (`chuoiBong.ts:97`) → **số bước của `kq.cacHanhDong`** → số lần rút `rng` ở `tran.ts:1569` dịch → tỉ số đổi ở **mọi** mã. Và `PHIEN_BAN_ENGINE` của v6 phải tăng, làm `tuongThichEngine.test.ts` (584 dòng) đỏ. (b) `theLuc` v6 là **hằng trong suốt 3 pha của một phút** và chỉ nhảy bậc ở ranh giới phút — dùng nó kẹp tốc độ là **vỡ AC-40.9** (*"không nhảy bậc, ≤ 1 m/s giữa hai mốc"*) đúng ở mỗi phút. ⚠️ **Cái giá, nói thẳng:** ứng dụng có **hai con số thể lực** không bằng nhau. `theLuc` v6 nuôi **kiệt sức** (`moiKietSuc` → sự kiện `'kiet-suc'`, `tran.ts:1058`) và **kết cục**; `theLucCoHoc` nuôi **tốc độ** và **quãng đường**. Người đọc code phải biết điều đó, nên hai cái tên khác nhau rõ và mỗi file có một khối chú thích trỏ sang file kia. ✅ **Một chỗ cái giá ấy KHÔNG tới, và đã kiểm:** lớp vẽ có `doMetTuTheLuc` đọc `theLuc` của v6 (`src/ui/noiSuy.ts:85`), nhưng `viTriVe.ts:90-91` ghi rằng ở chế độ liên tục **bảy lớp của chế độ cổ điển đều tắt**, *"hệ số theo độ mệt"* trong đó. Nên **không** có hai câu chuyện mệt trên cùng một màn hình: ở chế độ liên tục màn hình chỉ thấy **một** — cái của `theLucCoHoc`, qua trần tốc độ. 🐞 **Và một câu trong bản nháp của plan này SAI, nên nó bị gỡ:** *"`theLuc` v6 vẫn nuôi thay người"* — không. `theLuc` **không xuất hiện trong một điều kiện nào** của `kiemTraCanThiep` (`tran.ts:1095-1113`); bốn điều kiện ở đó là còn người trên ghế, người ra đang trên sân, người vào đang trong dự bị, người vào chưa nhận thẻ đỏ. Thể lực không nuôi một quyết định thay người nào, vì **không có quyết định thay người nào** — xem **mục 10.3**. **Một chiều** vì thế đúng theo cấu trúc: với AC-40.12 ra khỏi phạm vi và chấn thương không rời sân (**D155**), không còn một đường nào từ `theLucCoHoc` về v6. |
| **D150** | Mục đích vào lô mốc bằng cách nào | **Một mảng `oMucDich: Int8Array`, 22 ô mỗi mốc.** | (a) Nới `STRIDE` 8 → 9. (b) Không ghi vào lô, tính lại ở lớp xuất. | (a) `120 × 26 × 4 = 12.480 byte` (**+12,5%**) so với `120 × 22 × 1 = 2.640 byte` (**+2,6%**), và nó bắt **ba trọng tài cộng quả bóng** mang một trường vô nghĩa. Nó còn chạm `TEN_O`, `ghiMoc`, `docMoc` — ba chỗ mà `loMoc.ts` tự ghi là *"đầu ra chỉ-ghi"*, nên nới stride là đổi hình dạng mà bốn file đang đọc. (b) Tính lại ở lớp xuất đòi **chạy lại cả vòng mốc**, và nó dựng **hai nguồn cho một câu trả lời** — đúng loại lỗi mà `oCuaNguoiTrenSan` vs `oCuaNguoiGiu` đang phải canh bằng một phép kiểm riêng. |
| **D151** | Mục đích vào tệp xuất ở đâu | **Một khoá tiêu đề THỨ BA của `KhoiMocMong` — `khoa_muc_dich`, đúng 22 cột nối SAU khối 25 ô người**, cộng bảng tra `ma_muc_dich` trong `dinh_dang`. Độ dài một hàng thành một mệnh đề kiểm được: `1 + 4 + 25×3 + 22 = 102`. | (a) Một khoá **thứ tư** của `KHOA_NGUOI` (`['x','y','huong_nguoi','muc_dich']`). (b) Chỉ điền `muc_dich` của **khung dày**. (c) Một **chuỗi** 22 chữ số mỗi hàng. (d) Gói 22 mã thành **hai số cơ số 6**. (e) Một khối gốc **thứ sáu**. | ⚠️ **(a) là phương án bản nháp của plan này đã chọn, và nó SAI ở một chỗ không phải về byte.** `KHOA_NGUOI` là khoá **theo ô**, và khối mỏng có **25 ô** — 22 cầu thủ **cộng ba trọng tài** (`tepXuat.ts:129`). Khoá thứ tư vì thế cấp **mã mục đích cho ba điểm trọng tài**: **19.320 ô** mang một giá trị **không tra được** về danh mục mục 3.1, nằm trong **chính tệp mà AC-45.6 dùng làm nguồn đo**. Nó còn đắt hơn: 50,00 byte/hàng so với 44,00, tức **+38.624 byte**. Một tệp nói dối về mình thì rẻ hay đắt đều không dùng được. (b) **Khung dày chỉ có ở tình huống quan trọng** — ca xấu là **23 tình huống / 1.013 khung** so với **6.440 hàng mỏng**; AC-41.2 đòi *"ở **mọi mốc**"*, nên khung dày **không thoả được** AC ấy. Hai khoá kia **vẫn** được điền, nhưng chúng là phần thêm. (c) Tiết kiệm **122.387 byte** nhưng **vỡ kiểu công khai** `hang: readonly (readonly number[])[]`, và kéo theo hai phép kiểm cộng phép tra cột theo tên. (d) Rẻ nhất (**+124.505 byte**) và **bất khả thi**: `6^22 ≈ 1,32 × 10^17` vượt `2^53 ≈ 9,01 × 10^15`, nên **một số `number` không chứa nổi 22 mã** — bác bằng số học, để không ai "tối ưu" sang nó về sau. (e) `tepXuat.ts` tự ghi *"**Năm khoá gốc**, và chỉ năm"*; khoá thứ sáu là đổi hình dạng mà AC-45.5 đã đóng. **Giá của phương án đã chọn, đo chứ không ước:** 22 cột × 2,00 byte = **44,00 byte/hàng**; `6.440 × 44 + 27` byte khoá tiêu đề = **+283.387 byte**; ca xấu `5.332.957 → 5.616.344` = **51,06%** của trần 11.000.000 (trước: 48,48%). Khối mỏng `2.693.890 → 2.977.277` (+10,5%). **Kết luận một câu: mục đích ở mọi mốc tốn 2,58 điểm phần trăm của một ngưỡng còn dư 48,9 điểm. Không có vấn đề kích thước nào để giải.** |
| **D161** | ❗ **Nhịp tính KÈM NGƯỜI — đây là chỗ tiền thật nằm, và bản nháp của plan này không có một chữ về nó** | **Phép PHÂN CÔNG ai kèm ai chạy mỗi lần BÓNG ĐỔI CHỦ; ĐÍCH của người kèm đọc lại mỗi mốc.** | Phân công lại mỗi mốc, đúng như mọi thứ khác trong vòng mốc. | **Đo:** tìm đối thủ gần nhất cho 22 người là `22 × 11 = 242` lần `hypot` **mỗi mốc**; × 6.440 mốc = **1.558.480 hypot** một trận = **31,03 ms** — tức **73,3%** của toàn bộ 42,35 ms mà spec 009 thêm vào. (So sánh: cả `tachChen` trên đúng 6.440 mốc ấy là 41,69 ms.) Phân công theo **lần bóng đổi chủ** thay vì theo mốc: một pha là 40 bước (`dienPha.ts` `BUOC_MOI_CHUOI = 40`), 3 pha/phút × 99 phút = **297** lần tính thay vì 6.440 → `31,03 × 297/6.440 =` **1,43 ms**, **tiết kiệm 29,6 ms**. Đó là **5,4 lần** nhiều hơn mức tối đa mà AC-41.19 có thể mua, và AC-41.19 mua **0** (**D153**). ✅ **Và nó không mất một AC nào:** AC-41.15 đòi khoảng cách tới người cầm bóng **giảm đơn điệu qua các mốc** — thứ ấy cần **đích** cập nhật mỗi mốc (đọc chỗ người bị kèm đang đứng: **O(1)** mỗi người kèm), **không** cần phân công lại. Và người cầm bóng chỉ đổi khi bóng đổi chủ, nên phân công theo nhịp ấy là nhịp **đúng về nghĩa**, không phải một phép xấp xỉ. |
| **D162** | Số phiên bản **tệp xuất** | **`PHIEN_BAN_TEP` 1 → 2.** | Giữ 1, vì nội dung mới chỉ là "thêm thông tin". | `tepXuat.ts:54` mang hợp đồng viết bằng chữ: *"Phiên bản định dạng tệp xuất. **Tăng khi hình dạng đổi**, không khi nội dung đổi."* **D151** đổi hình dạng — một khoá tiêu đề mới và độ dài mỗi hàng từ **80 lên 102** số — nên bump là đúng hợp đồng, không phải một lựa chọn. ⚠️ **Và đây là chỗ dễ lẫn nhất của cả plan, nên nói thẳng: HAI số phiên bản, HAI nghĩa, và spec 009 bump MỘT.** `PHIEN_BAN_TEP` bump vì tệp xuất là **đường một chiều** — không có nút đấu lại nào để tước, không có đường nhập nào đọc nó. `PHIEN_BAN_ENGINE_LIEN_TUC` **không** bump (**D148**) vì bản ghi trận **có** nút đấu lại, và `matchRepo.ts:246` so bằng `!==`. |
| **D165** | ❗ **Hai bảng tỉ lệ của `viTriMet.ts` là nguyên nhân SỐ HỌC của việc ba AC khối không đạt — nên chúng phải đổi, không chỉ `phanDichCuaO`** | **Thay cả `TI_LE_DAI_MET` và `TI_LE_COT_MET` bằng một hình khối ĐỌC TRẠNG THÁI** (`hinhKhoi`): tâm dọc, tâm ngang, dải dọc, dải ngang — bốn đại lượng là **hàm của** bóng, quyền sở hữu, phút và hiệu số. | (a) Chỉ thay `phanDichCuaO`, giữ hai bảng tỉ lệ (phương án bản nháp của plan này ghi). (b) Nén bằng cách nhân toàn bộ toạ độ dọc với một hệ số. | ⚠️ **(a) bất khả thi, và đây là phép tính:** `TI_LE_DAI_MET × DAI_SAN(105)` cho tâm bốn dải **10,5 / 36,75 / 68,25 / 94,5**; trừ `LUI_VE_SAN_MINH = 6` còn **4,5 / 30,75 / 62,25 / 88,5**. Mười người ngoài thủ môn của một 4-4-2 nằm ở dải 1–2–3, tức trải **30,75 → 88,5 = 57,75 m** — so với **30–40 m** của AC-40.1 là **vượt trần 44%**. Và bề ngang `(0,78 − 0,22) × 68 =` **38,08 m** là một **hằng số không đọc ai**: nó tình cờ nằm trong dải 35–45 m của AC-40.2, nhưng **AC-40.5** đòi bề ngang khi có bóng **lớn hơn ≥ 5 m** so với khi không có bóng, và hiệu của một hằng số với chính nó là **0**. Nên hai AC ấy không đạt được **dù `phanDichCuaO` có là gì**. (b) Nhân toàn cục dời **cả tâm** về một đầu sân, nên thủ môn ra khỏi vòng cấm hoặc tiền đạo tụt về giữa sân — và nó phá `kepDichThuMon` ở đúng chỗ **AC-30.7 của spec 005** canh. **Và một bằng chứng thứ ba, độc lập với hai cái trên:** quãng đường. Với mô hình một hệ số, quãng một người đi là xấp xỉ `p ×` quãng bóng, và quãng bóng đo được là **14,88 km** một trận. Nên **AC-40.10** (9–12 km) đòi `p ≥ 0,605`; nhưng ở `p` ấy trần bề ngang của khối là `68 × (1 − 0,605) =` **26,9 m**, **dưới sàn 35 m** của AC-40.2. Hai AC ấy **không cùng đúng được** trong mô hình một hệ số — ở bất kỳ giá trị `p` nào. Trong mô hình mới, quãng đường đến từ **chuyển động có mục đích** (chạy chỗ, lùi khối, kèm người), không từ một phần quãng bóng, nên hai AC thôi tranh nhau một tham số. 📌 Lưới 12 vùng **vẫn** là đơn vị quyết định của v6 (giả định mục 10 của spec); thứ đổi là **cách quy một vùng ra mét**, không phải lưới. |
| **D152** | Mục đích được **phân công cho cả đội**, không chọn cho từng người | **`phanMucDich(boiCanhDoi) → MucDich[11]`** — một phép phân công, chạy tối đa một lần mỗi 0,5 giây mỗi bên. | Mười một lời gọi độc lập `chonMucDich(nguoi, boiCanh)`. | Ba AC và hai trường hợp biên đòi một tính chất của **tập hợp**, không của cá nhân: ít nhất một người kèm người cầm bóng (**AC-41.14**), **không hai người kèm cùng một đối thủ** (mục 6), **chỉ một người** đi vào một khoảng trống (mục 6). Mười một quyết định độc lập không thoả được chúng, và mọi cách vá sau đó là dựng lại một phép phân công bằng đường vòng. 📌 *"Mỗi cầu thủ có suy nghĩ riêng"* **vẫn đúng**: mỗi người nhận mục đích riêng và đích riêng; thứ ở cấp đội là **việc chia vai**, đúng như một đội bóng thật. |
| **D153** | AC-41.19 mua được bao nhiêu ngân sách — **đúng 0,00 ms**, và nói ra bằng số | **Thực thi cổng 0,5 giây đúng như AC viết, và ghi vào plan rằng nó tiết kiệm KHÔNG GÌ.** | Trình bày AC-41.19 như cách giải quyết việc vượt ngân sách. | **Không có bước tích phân 0,5 giây nào trong mã sản phẩm.** Phép bước cơ học sống **hoàn toàn** bên trong `thucTheTaiMoc`, và `dt` của nó là `(chiSoMoc − mocDaGhiTruoc) × DT_MOC` (`tranLienTuc.ts:676-682`) — **1 giây** ở phần thường, **0,5 giây** trong cửa sổ dày. Khối chú thích ở `moc.ts` mô tả một lưới tích phân 120 bước/phút, nhưng đó là **ý định thiết kế**, không phải nhịp gọi. **Đo:** 6.440 lần gọi một trận 99 phút; trần của AC-41.19 là `99 × 120 = 11.880`, tức chỗ gọi đang ở **54,2%** trần. Chẻ ra: 1.013 mốc dày cách 0,5 s (nhịp **bằng đúng** trần) và 5.427 mốc thường cách 1 s (**nửa** trần). Nên AC-41.19 **cấm đúng 0 trong 6.440 lần chọn**. ⚠️ Và kể cả **tắt hẳn** việc chọn mục đích cũng chỉ bớt **5,43 của 42,35 ms** thêm — tiền thật nằm ở **kèm người** (**D161**). Nói ra bằng số vì nhật ký làm rõ mục 11 đã bán AC-41.19 như cách giữ ngân sách, và nó **không giữ được một miligiây nào**. |
| **D154** | AC-41.15 *"dưới 2 m"* so với `tachChen` giữ sàn **2,0 m** | **Giữ nguyên AC, khai cách đọc ra mặt: nó thoả qua nhánh thứ hai — *"hoặc cho tới khi bóng đổi chủ"*.** | (a) Hạ `BAN_KINH_TRANH`. (b) Miễn người kèm khỏi `tachChen`. (c) Sửa lời AC. | `coHoc.ts:555` đặt `BAN_KINH_TRANH = 2.0` và `tachChen` đẩy mọi cặp về ≥ 2,0 m. ⚠️ **Nhưng nó là NỖ LỰC TỐT NHẤT, không phải một bất biến:** `SO_VONG_TACH = 24` (`coHoc.ts:575`) là trần số vòng, và khi hết vòng mà còn chèn thì hàm **trả về trạng thái còn chèn** — không ném lỗi, không báo gì (`coHoc.ts:617-648`). Nên cách nói đúng không phải *"dưới 2 m là bất khả thi"* mà: **nhánh dưới 2 m KHÔNG ĐƯỢC NHẮM TỚI**, và nếu nó xảy ra thì đó là `tachChen` **không hội tụ** — một lỗi, không phải một hành vi. (a) Hạ nó là mở lại *"bị đè lên nhau"* — câu người dùng nói ở T760, và T814 đã trả bằng một phép đo. (b) Miễn một người khỏi `tachChen` là mở đúng một lỗ cho hai hình vẽ chồng khít, và phép đo *"không hai người chồng nhau"* của spec 007 **phải còn đúng** theo mục 6 của spec. (c) Spec đã `Clarified`; sửa lời AC bây giờ là sửa một hợp đồng người dùng đã chốt. **Đọc đúng:** khoảng cách giảm **đơn điệu** tới sàn 2,0 m, và bóng đổi chủ mỗi ~20 giây, nên nhánh *"hoặc"* là một nhánh **thật**, không phải một lối thoát. Phép kiểm đo **tính đơn điệu**, không đo việc xuống dưới 2 m. |
| **D155** | Chấn thương: v6 **không có** khái niệm ấy | **Chấn thương là một trạng thái CƠ HỌC trong trận: thể lực cơ học sụt mạnh, người ấy chạy chậm — nhưng KHÔNG rời sân và KHÔNG sinh một sự kiện nào.** | (a) Chấn thương làm người rời sân. (b) Chấn thương sinh một dòng sự kiện. | Đo được: `grep 'chanThuong|chan-thuong|injur'` trên cả `src/` trả **0 kết quả** — v6 không có chấn thương, và chỉ **hai** lý do khiến người rời sân: thẻ đỏ và thay người do **người dùng**. (a) và (b) đều **thêm vào dòng sự kiện**, tức vỡ lời hứa nền ở đúng chỗ dễ vỡ nhất. ⚠️ **Cái giá, nói thẳng:** đây là chấn thương **không ai được nghỉ** — người bị chấn thương đi khập khiễng tới hết trận trừ khi người dùng tự thay anh ta ra. Nó yếu hơn nghĩa thông thường của chữ "chấn thương". Nhưng hai AC chỉ đòi đúng hai điều: trung bình 0–1 mỗi trận (**AC-40.14**) và **không ghi gì vào hồ sơ cầu thủ** (**AC-40.15**) — cả hai đạt, và AC-40.15 đạt **theo cấu trúc** vì không có đường nào từ `TrangThaiLienTuc` tới hồ sơ. |
| **D156** | Công thức "chọn vị trí" của thủ môn lấy chỉ số nào | **`phan-xa` + `bat-bong` + `quyet-doan`** — ba chỉ số **thủ môn thật sự có**. | `phan-xa` + `doc-tinh-huong`, đúng ví dụ spec nêu. | 🐞 **Ví dụ trong spec dùng một chỉ số thủ môn KHÔNG CÓ.** `attributes.ts:42-51` liệt 8 chỉ số chung mà thủ môn điền, và `doc-tinh-huong` **không** trong đó (cả `nhan-quan` cũng không). Chỉ số không điền rơi về giá trị lui ở `sucManh.ts:66`, nên công thức theo ví dụ của spec sẽ cho **mọi thủ môn một con số giống nhau** — tức AC-40.17 (*"hai thủ môn chỉ số khác nhau → đứng chỗ khác nhau"*) **đỏ**. Ba chỉ số đã chọn đều nằm trong danh sách thủ môn điền. 📌 Spec chỉ ràng *"suy ra từ các chỉ số đã có, theo một công thức ghi trong spec"*; phần trong ngoặc là **ví dụ**, không phải hợp đồng. |
| **D157** | Công thức "độ mạo hiểm" lấy chỉ số nào | **`nhan-quan` + `quyet-doan`.** | `nhan-quan` + *"bình tĩnh"*, đúng ví dụ spec nêu. | 🐞 **Chỉ số *"bình tĩnh"* KHÔNG TỒN TẠI.** Bộ chỉ số có đúng **15 + 3** mã (`types.ts:58-76`); nhóm `tinh-than` chỉ có **hai** mã: `nhan-quan` và `quyet-doan`. Không mã nào mang nghĩa composure. Thêm một chỉ số mới là chạm `types.ts`, `attributes.ts`, `completeness.ts`, `generator.ts`, `roles.ts`, `backupSchema.ts`, `BangChiSo.tsx` và **hai** file ngôn ngữ, cộng **di trú hồ sơ đã lưu** — và spec đã đặt *"Chỉ số mới cho cầu thủ"* vào **Non-goals**, lý do nguyên văn: *"thêm một chỉ số là bắt người dùng nhập lại cho mọi cầu thủ đã có"*. |
| **D158** | Hai công thức ấy **ghi ở đâu** | **Ghi ở `plan.md` mục 4**, và đọc *"một công thức ghi trong spec"* là *"ghi trong tài liệu đặc tả, không phát minh trong code"*. | Ghi công thức vào `spec.md`. | AC-40.17 và AC-41.22 nói *"theo một công thức ghi trong spec"*. Nhưng một công thức là **HOW**, và `spec.md` mở đầu bằng đúng một dòng cấm: *"Mọi chi tiết kỹ thuật thuộc về `plan.md`"*. Hai câu không cùng đúng được. **Điều AC bảo vệ** là: không có con số phép thuật nấp trong code, và **không thêm một ô nhập nào** — cả hai đạt khi công thức nằm ở `plan.md` mục 4 và có phép kiểm. Khai cách đọc ra mặt thay vì lặng lẽ chọn một bên. |
| **D166** | ❓ **AC-40.18 nói *"cùng mã trận ở thời tiết mát"*, nhưng thời tiết là HÀM THUẦN của mã trận và danh mục KHÔNG CÓ kiểu `'mát'`** | **Hai việc, cả hai khai ra mặt:** (1) *"mát"* đọc là **`'am'`** — kiểu ôn hoà nhất trong danh mục, và nó là **định nghĩa của plan**, không phải của spec; (2) phép kiểm **giữ `maTran` rồi thay `dieuKien` bằng tay** khi dựng `TrangThaiLienTuc`, thay vì đi qua `taoTranLienTuc`. | (a) Thêm kiểu `'mat'` vào `ThoiTiet`. (b) So hai **mã trận khác nhau** rồi gọi đó là so thời tiết. | `dieuKienTuMaTran` (`dieuKien.ts:154`) **không nhận `Rng`, không nhận tuỳ chọn** — thời tiết suy ra tất định từ mã trận, nên *"cùng mã trận với hai thời tiết"* **không có đường nào dựng qua đường thường**. Danh mục là `'nong' \| 'kho' \| 'am' \| 'mua' \| 'mua-to'`; **không có `'mat'`**. (a) Thêm một kiểu là đổi `TRONG_SO_THOI_TIET` (tổng phải bằng 1) và `MA_SAT_LAN_SET`, tức **đổi vật lý bóng của mọi trận** — một đường vỡ lời hứa nền ở chỗ không ai ngờ. (b) Hai mã khác nhau khác **mọi thứ**, nên nó đo thời tiết **cộng** tất cả phần còn lại; đó là một phép đo không kết luận được gì. ⚠️ Việc `'am'` là *"mát"* là **một quyết định của plan**: nếu người dùng muốn nghĩa khác thì đây là chỗ sửa, và nó ở **mục 10** chứ không nằm im trong code. |
| **D167** | ❗ **Không trận nào dài 90 phút — đo 10 mã: 94–99** | **Đọc *"trận 90 phút"* là *"trận đủ độ dài"*** (90 phút chính thức **cộng bù giờ**, tức `tongPhutTran`), và ***"15 phút cuối"* là 15 phút cuối của độ dài THẬT** — bắt đầu ở `tongPhutTran − 15`, tức phút **79–84**, không phải 75. | (a) Đo đúng chữ: chỉ trận dài **đúng** 90 phút. (b) Đổi *"15 phút cuối"* thành *"từ phút 75"*. | (a) **Tập rỗng**: `tongPhutTran` cộng bù giờ nên không mã nào cho đúng 90. Một AC đo trên tập rỗng là một AC **xanh mà không đo gì** — đúng loại lỗi mà quy ước `CHỐNG RỖNG` 37 lần của repo tồn tại để chặn, và nó đã bắt được **bốn** lần trong dự án này. (b) *"Từ phút 75"* cho **19–24 phút** thay vì 15, nên nó đổi **nghĩa** của AC-40.16 chứ không làm rõ. 📌 Cách đọc đã chọn giữ **dải 9–12 km** gắn với một trận đủ độ dài — đúng ý của AC-40.10, vốn tự mang một ⏳ nói dải ấy là **hàm của** phân bổ cường độ mà spec 010 sở hữu. |
| **D168** | ❗ ***"Người không tham gia"* của AC-41.6 chưa ai định nghĩa, và mẫu số đổi thì ngưỡng đổi nghĩa** | ***"Không tham gia"* = mọi ô người KHÔNG phải người đang chạm bóng ở mốc ấy** (tức `nguoi_giu` của mốc), đo trên **cả hai đội**. Nền tương ứng được **đo lại ở lát 0** và ghi vào plan. | (a) Để nguyên, dùng nền 28,2% của spec 007. (b) Đo trên cả 22 người không loại ai. | AC-41.6 đòi *"dưới 10%"* và spec nêu nền **28,2%**, nhưng đo trên **cả 22 người** cho **66,08%** — hai con số cách nhau **2,3 lần**, và chênh lệch ấy **hoàn toàn** là chuyện mẫu số. (a) Không dùng được: nền 28,2% của spec 007 không kèm định nghĩa, nên không ai dựng lại được phép đo ấy. (b) Gộp cả người đang chạm bóng vào mẫu số là tính một người **đang làm việc** vào tỉ lệ *"không làm gì"*. ⚠️ **Và hệ quả phải nói ra:** nếu nền thật là 66,08% thay vì 28,2% thì **AC-41.6 khó hơn hẳn** so với lúc người dùng chốt nó — từ *"giảm 2,8 lần"* thành *"giảm 6,6 lần"*. Đó là **một con số cho người dùng biết**, không phải một chỗ tự nới ngưỡng 10%. |
| **D169** | ❗ **Món nợ cơ học canh bằng TỈ LỆ kèm mẫu số, không bằng số đếm — và sáu con số cũ KHÔNG dùng được làm nền** | **`T820` đo và ghi `số vi phạm / tổng mẫu` cho từng vế trên mười mã cố định**, cả tử và mẫu. Sáu con số của bản trước bị khai là **không phải nền**. | (a) Giữ sáu con số làm nền, đúng như bản trước của plan này và `tasks.md` T820 ghi. (b) Bỏ hẳn gate nợ cơ học. | 🐞 **Đây là lỗi của chính plan này, `/analyze` ngày 2026-11-28 tìm ra.** Sáu con số `249+104 / 23+3 / 62+312 / 1 / 280+144 / 22` đến từ **hai phép đo khác cỡ mẫu**: năm con số từ bảng nợ **T742** của spec 007 (`specs/007/spec.md:611`, mẫu 1.508.250 cho AC-38.1) và **một** con số — `280+144` của AC-38.6 — đo trên **MỘT** mã, từ `T816`. Bằng chứng hệ số: `soMau['AC-38.10(c)']` là **11.958** một mã so với **120.660** ở T742 ⇒ T742 đo **~10 mã**; còn `280+144 = 424` đúng là **424 trong 450** vi phạm của một mã. (a) làm gate vỡ **hai chiều**: AC-38.1 đo được **8+1** một mã nên ngưỡng 249 cho nợ **tăng gấp ba** vẫn xanh (**cổng chết**), còn AC-38.6 trên 10 mã sẽ ra ~**2.800+1.440** nên đòi *"khớp 280+144"* là **đỏ vì cỡ mẫu**, chặn mọi task. Và mẫu số tự nó đã dịch: `soMau['AC-38.4(lùi)']` đi từ **180 xuống 21** một mã. (b) bỏ gate là bỏ lưới duy nhất canh *"nợ không tệ đi"* — một **điều kiện ra** của `spec.md` mục 8. 📌 `doCoHoc` **đã** trả `soMau` theo từng vế, nên tỉ lệ tính được **không cần hạ tầng mới**: cái thiếu chỉ là plan đã không dùng nó. |
| **D170** | ❗ **AC-41.9 KHÔNG đúng sẵn — và nó phải được dựng, không được tick** | **Trong một đoạn `'re-bong'`, quả bóng ĐI THEO NGƯỜI:** vị trí bóng dẫn xuất từ vị trí người dẫn, lệch nhiều nhất `TAM_CHAM_BONG`; còn **đích của người dẫn** là điểm đến của đoạn. | (a) Khai *"đã đúng từ T816"* — đúng như bảng phủ AC của bản trước ghi. (b) Loại `'re-bong'` khỏi `dangBay` để người dẫn lấy bóng làm đích. | 🐞 **(a) sai theo cấu trúc, truy được từng bước:** `cacDiemCuaPha` (`tranLienTuc.ts:288`) quy **mọi** hành động — `'re-bong'` trong đó — thành một điểm vùng, và `moTaDoanTaiBuoc` trả một đoạn `c${i}` cho **mọi** hành động bất kể `loai`. Nên một đoạn dẫn bóng có `quang > 0` ⇒ `dangBay = true` ⇒ `giuThucSu = KHONG_AI_GIU` ⇒ người dẫn **rơi về `dichNguoiKhongBong`**, tức **đi về chỗ đứng sơ đồ trong khi quả bóng đi**. Khoảng cách người–bóng khi ấy không có trần nào. (b) đỡ hơn nhưng **không** bảo đảm: tốc độ của đoạn **không bị** trần tốc độ của người, nên quả bóng vẫn **vượt** anh ta và khoảng cách vẫn qua 2 m. Phương án đã chọn làm AC-41.9 đúng **theo cấu trúc**, và nó đúng nguyên văn điều người dùng yêu cầu: *"dẫn bóng thì bóng sẽ đi theo người"*. ⚠️ **Cái giá, phải đo chứ không đoán:** tốc độ bóng trong pha dẫn nay bị kẹp bởi trần tốc độ **của người** (6,4–8,6 m/s, thấp hơn khi mệt) thay vì tốc độ của đoạn, nên nó **có thể** chạm vế dải tốc độ của **AC-38.6** — `T858` phải kiểm vế ấy có lọc theo loại hành động không, và **báo số**. Và `dangBay` còn nuôi hai thứ khác: neo trọng tài (`neoTrongTai`) và `duongChuyen` của AC-38.10(b) — cả hai đổi nghĩa cho pha dẫn, theo chiều **đúng hơn** (trọng tài bám quả bóng đang được dẫn, không bám một điểm đến xa). |
| **D171** | **Ai sở hữu việc ghim lại các con số tuyệt đối của `doCoHoc.test.ts`** | **Một task riêng ở lát 0 (`T857`), đi NGAY SAU `T820`.** Nó phân loại từng `toBe`: vế nào là **ngưỡng nợ** thì thành `toBeLessThanOrEqual` trên **tỉ lệ**; vế nào là **số mẫu** thì ghim lại con số mới kèm lý do. | (a) Để mỗi task tự ghim lại phần nó làm đỏ. (b) Nới hết thành `toBeGreaterThan(0)`. | 🐞 **Không task nào sở hữu việc này trong bản trước, và đó là một lỗ thật:** `doCoHoc.test.ts` ghim **bằng đẳng thức tuyệt đối** hàng chục con số đo trên **một** mã (`:129`, `:130`, `:248`, `:335`, `:374`-`:377`…). **D165** đổi hai bảng tỉ lệ, **D152** đổi đích của 22 người, `T838` hạ trần tốc độ — cả ba dời vị trí **từng mốc**, nên các `toBe` ấy đỏ. (a) rải việc ấy ra bảy lát: mỗi lát ghim lại một phần, nên **không lát nào** biết con số cuối là gì, và người đọc sau không phân biệt được *"ghim lại vì mô hình đổi"* với *"ghim lại vì nợ xấu đi"*. (b) là bỏ gate: `toBeGreaterThan(0)` xanh với mọi mức nợ. 📌 Task này đi **trước** mọi lát sửa hành vi, cùng lý lẽ của cả lát 0: một thước ghim lại **sau** khi sửa là một thước đo chính thứ mình vừa sửa. |
| **D159** | Bộ đo của spec 009 nằm ở đâu | **Một file mới `doMucDich.ts`**, theo khuôn `doCoHoc.ts` nhưng **không** nhồi vào nó. | Thêm 20 vế mới vào `doCoHoc(tep)` đang có. | `doCoHoc.ts` là **749 dòng** và xuất **đúng một** hàm đo; nó **không có registry vế**, nên mọi phép đo mới phải vào trong thân một hàm vốn đã dài. Hai bộ đo tách ra thì mỗi bộ còn đọc được, và `doCoHoc.ts` giữ nguyên vai trò **lưới canh không-tệ-đi** của sáu món nợ spec 007 — một việc khác hẳn việc đo AC mới. **Dùng lại** từ `doCoHoc.ts`: khuôn `CAC_VE` / `VE_CHUA_CO_MAU` (một vế 0 mẫu **phải** được khai kèm lý do), khuôn mệnh đề mức-trận của AC-38.9 (`o = 'TRAN'`, `giay = 0`), và `bangCot` tra cột **bằng tên** từ hàng tiêu đề — cái cuối quan trọng vì **D151 thêm một cột**, và một bộ đo tra cột bằng chỉ số sẽ lệch hết. |
| **D160** | Ngân sách thời gian của chính bộ đo | **Mười mã trận cho phép kiểm AC mới, và nói ra giá: ≈ 3,3 giây.** | (a) Hai mã như `doCoHoc.test.ts` đang làm. (b) 200 mã như `sosanh.haiCheDo.test.ts`. | Đo được: một mã trận ≈ **330 ms** cho cả dựng tệp xuất và đo. (a) Hai mã **không đủ** cho các AC dạng *"ở ít nhất 70% số mốc thoả điều kiện"* — điều kiện lọc có thể để lại quá ít mẫu ở một mã lẻ. (b) 200 mã là **66 giây**, và `doCoHoc.test.ts:393` đã **từ chối** 5 mã chính xác vì 3 giây — tiền lệ của repo là không trả giá ấy ở phép kiểm chạy mọi lượt. ⚠️ Timeout mặc định của vitest là **5.000 ms** và repo **không** đặt `testTimeout` trong `vite.config.ts`, nên mọi `it` chạy 10 mã **phải khai `timeout` riêng** — thiếu nó là một phép kiểm đỏ vì hết giờ, không vì sai. |

---

## 4. Mô hình dữ liệu

Spec 009 **không thêm một trường nào** vào bản ghi trận, tệp sao lưu hay IndexedDB. Ba chỗ đổi,
cả ba đều là **trạng thái sống trong RAM** hoặc **đầu ra một chiều**.

### 4.1 Hai danh mục đóng thành hai union

```ts
// src/engine/lienTuc/mucDich.ts
export type MucDich =
  | 'giu-vi-tri' | 'chay-cho-sau-lung' | 'kem-nguoi' | 'lui-ve-giu-khoi'
  | 'giu-khung' | 'bo-tro-hang-thu'          // chỉ thủ môn

// src/engine/lienTuc/hanhDong.ts
export type HanhDongNguoi =
  | 'khong-che' | 'chuyen-ngan' | 'chuyen-dai' | 'dan-bong' | 'dut-diem'
  | 'bat-bong' | 'pha-bong' | 'phat-bong'    // thủ môn
  | 'ap-sat' | 'cat-duong-chuyen'            // phòng ngự

export type NhanhQuyetDinh =
  | 'dut-diem' | 'chuyen-tot-hon' | 'dan-len' | 'giu-hoac-lui'   // AC-41.12
```

Union chứ không `string`: trình biên dịch bắt được một mục đích lạ, và `MA_MUC_DICH` dưới đây
là `Record<MucDich, number>` nên **thiếu một mục là lỗi biên dịch**, không phải một ô trống
trong tệp xuất.

### 4.2 Trạng thái người, mang qua biên phút

```diff
  export interface TrangThaiLienTuc {
    readonly tran: TrangThaiTran
    readonly maTran: string
    readonly chiSoMoc: number
    readonly coHoc: readonly TrangThaiCoHoc[]
    readonly dieuKien: DieuKienTran
    readonly mocDaGhiTruoc: number | null
+   /** 22 ô người; ô trọng tài và ô bóng không có. */
+   readonly nguoi: readonly TrangThaiNguoiLienTuc[]
  }

+ export interface TrangThaiNguoiLienTuc {
+   readonly mucDich: MucDich
+   /** `chiSoMoc` của lần chọn mục đích gần nhất — cổng của AC-41.19. */
+   readonly mocChonMucDich: number
+   /** Ô người đang kèm, hoặc `-1`. Giữ qua các mốc để AC-41.15 đơn điệu. */
+   readonly oDangKem: number
+   /** Thể lực CƠ HỌC, 0–100. KHÔNG phải `theLuc` của v6. */
+   readonly theLucCoHoc: number
+   /** Quãng đường tích luỹ, mét — nguồn của AC-40.10 và AC-40.11. */
+   readonly quangDuong: number
+   /** Đã dính chấn thương trong trận này chưa (AC-40.14). */
+   readonly chanThuong: boolean
+ }
```

⚠️ **Vì sao `theLucCoHoc` là một trường RIÊNG, không phải `tran.ben[x].theLuc`.** Thể lực của
v6 (`theLuc.ts`) chạy **mỗi phút**, giảm theo *chỉ số Thể lực × cường độ pressing*, và nó **ăn
vào kết cục** qua `heSoTheLuc` → `sucManh` → pha bóng. AC-40.7 đòi thể lực giảm theo **quãng
đường đã chạy**, AC-40.18 đòi thời tiết nóng làm nó giảm nhanh hơn 10–20% — sửa `theLuc.ts` để
đạt hai AC ấy là **đổi tỉ số của mọi trận**, tức vỡ đúng lời hứa nền của spec. Xem **D149**.

### 4.3 Lô mốc: một mảng mục đích RIÊNG, không nới `STRIDE`

```diff
  export interface LoMoc {
    readonly oLieu: Float32Array        // stride 8, 26 thực thể — KHÔNG đổi
    readonly oTieuDe: Int32Array        // 2 ô mỗi mốc — KHÔNG đổi
+   readonly oMucDich: Int8Array        // 22 ô mỗi mốc, mã 0..5
    soMocDaGhi: number
    readonly sucChua: number
  }
```

Giá, tính thật: `120 mốc × 22 × 1 byte = 2.640 byte` một lô — **2,6%** của 99.840 byte hiện
có. Nới `STRIDE` 8 → 9 thì giá là `120 × 26 × 4 = 12.480 byte` (**+12,5%**) và nó bắt **ba
trọng tài cộng quả bóng** mang một trường vô nghĩa. Xem **D150**.

### 4.4 Tệp xuất: một khoá thêm vào khối mỏng

`KHOA_NGUOI` **không đổi** — nó là khoá theo **ô**, và khối mỏng có **25 ô** gồm ba trọng tài
(**D151**). Mục đích đi vào một khoá tiêu đề **thứ ba**:

```diff
  export interface KhoiMocMong {
    readonly khoa_bong: readonly string[]      // ['x','y','z','nguoi_giu']
    readonly khoa_nguoi: readonly string[]     // ['x','y','huong_nguoi'] — KHÔNG đổi
+   /** 22 cột, một mã mục đích mỗi ô người. Nối SAU khối 25 ô. */
+   readonly khoa_muc_dich: readonly string[]
    readonly hang: readonly (readonly number[])[]
  }
```

```diff
  readonly dinh_dang: {
    readonly phien_ban: number                 // 1 → 2 (D162)
    …
+   /** Mã → tên mục đích. Đây là bảng tra mà AC-41.2 nói tới. */
+   readonly ma_muc_dich: Readonly<Record<string, MucDich>>
  }
```

**Độ dài một hàng thành một mệnh đề kiểm được:**

```
hang.length === 1 + 4 + 25×3 + 22 === 102          (trước: 80)
```

Cộng một phép kiểm khẳng định **ba ô trọng tài KHÔNG có mã mục đích** — vì 22 ≠ 25, và đó chính
là điều phương án (a) của **D151** làm sai.

**Giá đã đo, không ước** — nền đo ở `tepXuat.test.ts:42`, ca xấu `Z0019XQ4B`:

| | byte | % của trần 11.000.000 |
|---|---|---|
| hôm nay | 5.332.957 | 48,48% |
| **sau khi thêm 22 cột** | **5.616.344** | **51,06%** |
| nếu `muc_dich` + `hanh_dong` khung dày cũng thành chuỗi | 6.122.144 | 55,66% |

Phép tính khớp đến từng byte: `6.440 hàng × 44,00 byte + 27 byte khoá tiêu đề = 283.387`. Khối
mỏng `2.693.890 → 2.977.277` (+10,5%). AC-41.21 vẫn đòi **đo lại và báo số thật** sau khi dựng —
bảng trên là số học, chưa phải phép đo.

⚠️ **MỘT KHÁI NIỆM, HAI CÁCH MÃ HOÁ TRONG CÙNG MỘT TỆP — nên phải có một vế canh chúng khớp.**
Khối mỏng mang **mã số** `0..5`; ô `muc_dich` của khung dày khai kiểu `string | null`
(`tepXuat.ts:159`) nên nó mang **mã định danh chữ**. Cả hai **đều** được điền — giả định mục 10
của spec nói *"dữ liệu trận đã có sẵn hai chỗ trống… để trống đúng vì chờ spec này"*, và điền
một nửa là trả một nửa, để `tinh_huong` — khối người đọc **bằng mắt** — vẫn `null`. Nên
`doMucDich.ts` mang thêm một vế: **ở mọi mốc có cả hai dạng, mã số tra qua `ma_muc_dich` phải ra
đúng chuỗi của khung dày.** Vế ấy có **ca ngược bơm được** (sửa một mã số rồi đòi vi phạm), nên
nó là một vế thật chứ không phải một lời hứa.

Khung dày điền hai khoá `hanh_dong` / `muc_dich` **đang là `null`** — không thêm khoá, nên hình
dạng *"đúng tám khoá mỗi `cau_thu`"* của mục 15 còn nguyên.

### 4.5 Hai công thức suy diễn — **đây là chỗ AC-40.17 và AC-41.22 nói tới**

Hai AC đòi công thức *"ghi trong spec"*. **D158** đọc nó là *"ghi trong tài liệu đặc tả, không
phát minh trong code"*, và đây là chỗ. Cả hai **chuẩn hoá từ dải 1..20** đúng khuôn
`sucManh.ts:86` đã dùng (`(tb − 1) / (20 − 1)`), không phải 0..20 — một chi tiết nhỏ nhưng sai
nó là lệch 5% ở mọi giá trị.

```
chuanHoa(c) = (kẹp(c, 1, 20) − 1) / 19        → [0, 1]
```

**Khả năng chọn vị trí của thủ môn** (AC-40.17). Ba chỉ số, **đều nằm trong 8 chỉ số chung mà
thủ môn điền cộng 3 chỉ số riêng** (`attributes.ts:31-35`, `:42-51`):

```
chonViTri = 0,45 · chuanHoa(phan-xa)
          + 0,35 · chuanHoa(bat-bong)
          + 0,20 · chuanHoa(quyet-doan)
```

Thủ môn giỏi chọn vị trí **đứng cao hơn và lệch theo bóng nhiều hơn**: đích của `giu-khung` nội
suy giữa tâm vạch vôi và điểm chắn góc sút theo đúng `chonViTri`. ⚠️ **Không dùng
`doc-tinh-huong` hay `nhan-quan`** — thủ môn **không điền** hai chỉ số ấy, nên chúng rơi về giá
trị lui (`sucManh.ts:66`) và làm mọi thủ môn giống nhau. Đó là **D156**, và nó sửa ví dụ trong
AC.

**Độ mạo hiểm** (AC-41.22). Nhóm `tinh-than` có đúng **hai** mã, và dùng cả hai:

```
doMaoHiem = 0,60 · chuanHoa(nhan-quan)
          + 0,40 · chuanHoa(quyet-doan)
```

⚠️ **Không có chỉ số *"bình tĩnh"*** trong 18 mã của repo — đó là **D157**.

`doMaoHiem` vào **đúng một chỗ, và chỗ ấy phải chính xác** để AC-41.22 đạt mà kết cục không
đổi. Bốn `LoaiHanhDong` của v6 ánh xạ sang bốn nhánh của AC-41.12 **không phải 1:1**:

| `LoaiHanhDong` của v6 | Nhánh AC-41.12 | Có mơ hồ không |
|---|---|---|
| `sut` | `dut-diem` | Không |
| `re-bong` | `dan-len` | Không |
| `tat-canh` | `chuyen-tot-hon` | Không |
| `chuyen` | `chuyen-tot-hon` **hoặc** `giu-hoac-lui` | **Có** — và đây là chỗ duy nhất |

Với `chuyen`, nhánh phụ thuộc **hình học**: người đón (`pha.gan.nguoiChuyen`) tiến lên bao nhiêu
mét so với người chuyền. `doMaoHiem` đặt **ngưỡng** của chữ *"tốt hơn"*:

```
loiTien   = (x_người_đón − x_người_chuyền) theo hướng tấn công của họ
nguong    = NGUONG_TIEN_NEN · (1 − doMaoHiem)      // người mạo hiểm đòi ít hơn
nhánh     = loiTien > nguong ? 'chuyen-tot-hon' : 'giu-hoac-lui'
```

Nên **hai cầu thủ cùng một tình huống, độ mạo hiểm khác nhau, cho hai nhánh khác nhau** —
AC-41.22 đạt — trong khi **hành động của v6 vẫn là `chuyen`**, cùng người đón, cùng kết cục.
Thứ đổi là **tên** của quyết định, không phải quyết định.

📌 **Vì sao hai công thức này KHÔNG đổi kết cục dù chúng đọc chỉ số người dùng nhập.** Chúng
quyết **chỗ đứng** (`chonViTri`) và **tên của nhánh** (`doMaoHiem`) — xem bảng trên và hình ở
mục 3. Không con số nào trong hai công thức này đi ngược về `tran.ts`.

---

## 5. Contracts

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `phanMucDich` | `BoiCanhDoi` (đội hình, bóng, hàng thủ đối phương, kết cục chuỗi trước, phút, hiệu số, `rng`) | `readonly MucDich[]` dài 11 | Ném nếu đội hình khác 11 ô — một ô khuyết là một mốc khuyết |
| `dichTheoMucDich` | `MucDich`, `BoiCanhNguoi` (chỗ đứng, bóng, khối, hàng thủ đối phương, ô đang kèm) | `Diem` | Không ném; đích luôn được `trongSan` kẹp |
| `hinhKhoi` | `BoiCanhDoi` + `coBong: boolean` | `{ tamDoc, tamNgang, daiDoc, daiNgang }` | Không ném |
| `hangThuCuoiNgoaiThuMon` | `cacO: readonly Diem[]`, `ben: BenSan` | `number` (toạ độ dọc) | Không ném; đội dưới 2 người ngoài thủ môn → trả vạch vôi của họ |
| `kepSauHangThu` | `Diem`, `hangThuDoiPhuong: number`, `ben: BenSan` | `Diem` | Không ném |
| `phanUngMatBong` | `chiSoMoc`, `mocMatBong`, `rng` | `'ep-lai' \| 'lui-ve'` | Không ném |
| `theLucSauMotMoc` | `theLuc`, `quangDuongMoc`, `thoiTiet` | `number` trong `[0, 100]` | Không ném; kẹp hai đầu |
| `heSoTocDoTheoTheLuc` | `theLuc` | `number` trong `(0, 1]` | Không ném; bảo đảm trần ≥ `SAN_TOC_DO` |
| `chanThuongTaiMoc` | `theLucCoHoc`, `quangDuongMoc`, `rng` | `boolean` | Không ném |
| `chonViTriThuMon` | `ChiSoCauThu`, `bong: Diem`, `ben: BenSan` | `Diem` | Không ném; đi tiếp qua `kepDichThuMon` |
| `doMaoHiem` | `ChiSoCauThu` | `number` trong `[0, 1]` | Không ném; chỉ số thiếu → giá trị giữa |
| `hanhDongCuaPha` | `HanhDong` của v6, `BoiCanhHanhDong` | `HanhDongNguoi` | Không ném — tập đóng, mọi `LoaiHanhDong` có ảnh |
| `nhanhCuaHanhDong` | `HanhDong` của v6, `BoiCanhHanhDong`, `doMaoHiem` | `NhanhQuyetDinh` | Không ném |
| `nguoiDonDuongChuyen` | `KetCucPhaV6`, `chiSoHanhDong` | `number` (ô người) hoặc `KHONG_AI_GIU` | Không ném; `gan` khuyết → không ai đón |
| `maMucDich` | `MucDich` | `number` 0..5 | Lỗi **biên dịch** nếu danh mục thiếu một mục |

**Hai chữ ký đáng nói riêng.**

`phanMucDich` nhận **cả đội** và trả **cả đội**, không nhận một người trả một mục đích. Đó không
phải tiện tay: ba AC và hai trường hợp biên đòi một tính chất của **tập hợp** — ít nhất một
người kèm người cầm bóng (AC-41.14), không hai người kèm cùng một đối thủ (mục 6), chỉ một
người đi vào một khoảng trống (mục 6). Mười một quyết định độc lập không thoả được chúng.

`hangThuCuoiNgoaiThuMon` tồn tại vì định nghĩa ấy **đã có hai bản chép tay** trong repo và bản
thứ ba sắp tới: một đoạn viết thẳng trong thân vòng lặp của bộ đo (`doCoHoc.ts:627-640`, vế
AC-38.10(c)) và một `function` nội bộ **không xuất** (`tranLienTuc.ts:455`, `hangThuCuoiCua`).
AC-41.7 là **con số đầu bài của cả spec** — 99,6% — nên định nghĩa nó phải sống ở **một** chỗ mà
cả ba nơi gọi, kèm một ca ngược. Hai bản chép tay là hai chỗ để trôi khỏi nhau, và khi chúng
trôi thì AC-41.7 **báo đạt ở bộ đo mà sai trên sân**.

`nguoiDonDuongChuyen` **suy** người đón từ `pha.gan.nguoiChuyen` — danh sách v6 **đã** rút, một
id cho mỗi bước `chuyen`/`re-bong`. Nên AC-41.11 *"đúng một đồng đội"* đúng **theo cấu trúc** và
**không tiêu một lần rút nào**.

---

## 6. Ánh xạ AC → thiết kế

**36 / 36 AC có nơi được hiện thực — phủ hết.**

📌 Bản đầu của plan này ghi `36/37`: AC-40.12 không phủ được vì thứ nó đo **không tồn tại trong
ứng dụng**. Người dùng chốt ngày **2026-11-28** chuyển nội dung AC ấy sang **spec đầu tiên sở
hữu huấn luyện viên máy**, nên spec 009 còn **36 AC** và bảng dưới phủ **hết**. Số `AC-40.12`
**không được dùng lại** cho nội dung khác — xem Non-goals của `spec.md`.

### US-40 — khối đội hình và thể lực (AC-40)

*Hình dạng khối:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-40.1 | `khoiDoiHinh.ts` → `hinhKhoi(boiCanh)` trả **dải dọc đích** 30–40 m; `phanMucDich` cấp `lui-ve-giu-khoi` cho đủ người để khối co lại. Phép kiểm **P5** trong `doMucDich.ts`: đo dải dọc của 10 người ngoài thủ môn ở mọi mốc thoả điều kiện, trên nhiều mã, đòi ≥ 70% |
| AC-40.2 | Cùng `hinhKhoi`, dải ngang 35–45 m. Cùng phép đo, cột ngang |
| AC-40.3 | `tamKhoiTheoBong` — tâm ngang khối là hàm **đơn điệu tăng** của `bong.y`. Hệ số tương quan ≥ 0,6 đo trên cả trận. Tương quan là **tính chất của công thức**, không phải một hiệu ứng phụ |
| AC-40.4 | `phanUngMatBong(chiSoMoc, ketCucChuoiTruoc, rng)` — cửa sổ 3–5 s mở ở **biên chuỗi** (nơi v6 trả `mat-bong`), chọn `ep-lai` hoặc `lui-ve` từ **dòng rút 2**. Đọc được trong dữ liệu trận **qua chính cột mục đích**: `ep-lai` ⇒ ≥ 2 người `kem-nguoi`; `lui-ve` ⇒ tâm dọc khối lùi. **Không thêm một cột nào** |
| AC-40.5 | `hinhKhoi` nhận `coBong: boolean`; dải ngang khi có bóng = dải khi không có bóng **+ `GIAN_KHI_CO_BONG`**, hằng đặt ≥ 5 m và chỉ tồn tại ở một chỗ. Phép kiểm đo trung bình hai nhóm mốc trên cả trận |

*Thể lực:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-40.6 | `theLucCoHoc.ts` → `THE_LUC_CO_HOC_DAY = 100`, dùng lại đúng con số `THE_LUC_DAY` của v6. Phép kiểm đọc mốc đầu trận |
| AC-40.7 | `theLucSauMotMoc(theLuc, quangDuong, cuongDo, thoiTiet)` — **trừ**, không bao giờ cộng. Đơn điệu là tính chất của phép trừ; phép kiểm quét mọi mốc của nhiều trận đòi không mốc nào tăng |
| AC-40.8 | `heSoTocDoTheoTheLuc(theLuc)` trả **0,9** khi thể lực < 60, nhân vào `tocDoToiDa(chiSoTocDo)` ở lời gọi `buocCoHoc`. **Đây là lần đầu `tocDoToiDa` được một dòng mã sản phẩm gọi** |
| AC-40.9 | ✅ **Đạt theo cấu trúc, và nói ra thay vì nhận công.** Bậc nhảy lớn nhất mà AC-40.8 có thể sinh là `8,6 × 0,10 =` **0,86 m/s**, **dưới** trần 1 m/s của AC-40.9 — kể cả khi `heSoTocDoTheoTheLuc` là một hàm **bậc thang**. Plan vẫn làm nó **liên tục** (dốc tuyến tính quanh ngưỡng 60) vì thế rẻ hơn là chứng minh lại, nhưng phép kiểm ở lại làm **dây bẫy chống hồi quy**: nếu ai nâng mức giảm của AC-40.8 lên quá 11,6% thì AC-40.9 đỏ |
| AC-40.10 | `quangDuongCongDon` tích theo mốc; dải 9–12 km là **đích hiệu chỉnh** của `khoiDoiHinh` (**R70**). ⚠️ Đo trên **trận đủ độ dài** (`tongPhutTran`, thực tế **94–99 phút**), không trên *"đúng 90 phút"* — tập ấy **rỗng** (**D167**). 📌 Và dải này **không đạt được** trong mô hình một hệ số: 9 km đòi `p ≥ 0,605`, mà ở `p` ấy bề ngang trần là 26,9 m, dưới sàn 35 m của AC-40.2 — bằng chứng thứ ba của **D165** |
| AC-40.11 | Cùng phép đo, lọc ô thủ môn; dải 5–6 km, cùng cách đọc *"trận đủ độ dài"* (**D167**). `kepDichThuMon` đã chặn thủ môn khỏi đi xa, nên con số này là **hệ quả của phép kẹp cộng hai mục đích GK** |
| AC-40.17 | `chonViTriThuMon` — công thức ở **mục 4.5**, ba chỉ số `phan-xa` + `bat-bong` + `quyet-doan`. ⚠️ **KHÔNG** dùng `doc-tinh-huong` như ví dụ của AC nêu: thủ môn **không điền** chỉ số ấy, nên nó làm mọi thủ môn giống nhau → **D156**. Phép kiểm: hai thủ môn chỉ số khác nhau, cùng tình huống → hai điểm khác nhau |
| AC-40.13 | `SAN_TOC_DO = 4` trong `theLucCoHoc.ts`, lấy neo từ `TOC_DO_LUI_TOI_DA = 4` của spec 007 — **một con số, một chỗ**. `heSoTocDoTheoTheLuc` kẹp dưới sao cho trần không xuống dưới sàn ấy |
| AC-40.14 | `chanThuongTaiMoc(rng, theLucCoHoc)` rút từ **dòng rút 2**, xác suất đặt sao cho trung bình 0–1 mỗi trận. ⚠️ Chấn thương ở đây là **trạng thái cơ học**: người ấy chạy chậm nhưng **không rời sân** và **không sinh một sự kiện nào** — v6 không có khái niệm chấn thương, và thêm một sự kiện là vỡ lời hứa nền → **D155**. Phép kiểm đo trung bình trên ≥ 20 mã |
| AC-40.15 | Đạt **theo cấu trúc**: chấn thương sống trong `TrangThaiLienTuc` và **không có đường nào ra tới hồ sơ cầu thủ**. Canh bằng `boundaries.test.ts` đã có cộng một phép kiểm so hồ sơ trước/sau trận **từng trường** |
| AC-40.18 | `theLucSauMotMoc` nhận `thoiTiet`; `HE_SO_THOI_TIET_THE_LUC` cho `'nong'` nằm trong 1,10–1,20. ⚠️ *"Thời tiết mát"* **không có trong danh mục** — **D166** đọc nó là `'am'`, và đó là một định nghĩa của **plan**, không của spec. Phép kiểm **giữ `maTran` rồi thay `dieuKien` bằng tay** khi dựng `TrangThaiLienTuc`, vì `dieuKienTuMaTran` là hàm thuần không nhận tuỳ chọn |
| AC-40.16 | `hinhKhoi` nhận `phut` và `hieuSoBanThang`; 15 phút cuối + đang dẫn ⇒ tâm dọc lùi ≥ `LUI_KHI_DAN = 3` m. ⚠️ *"15 phút cuối"* bắt đầu ở `tongPhutTran − 15`, tức phút **79–84** — không phải 75 (**D167**). Phép kiểm so trung bình hai cửa sổ 15 phút liền nhau |

### US-41 — mục đích của từng người (AC-41)

*Mục đích, và việc nó phải khác nhau:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-41.1 | `phanMucDich(boiCanh) → readonly MucDich[11]` cho mỗi bên — một **phép phân công**, nên mỗi ô người luôn có đúng một mục đích. Kiểu TypeScript khai tường minh, không `null` |
| AC-41.2 | **Một cột mã số** thêm vào `KhoiMocMong` (mỗi hàng, mỗi ô người), danh mục khai trong `dinh_dang`. Khối mỏng phủ 100% trận nên đây là chỗ **duy nhất** thoả "mọi mốc" |
| AC-41.21 | `soByteCuaChuoi(chuoiTep(tep))` đã có từ T744/T745; phép kiểm báo số **trước và sau**, đòi < 11.000.000. Dự kiến **5.332.957 → 5.616.344** (48,48% → **51,06%** của trần) — bảng ở **mục 4.4**, và nó là số học chứ chưa phải phép đo |
| AC-41.3 | Hệ quả của `phanMucDich` cộng `phanUngMatBong`. Phép kiểm đếm số mục đích khác nhau ở mỗi mốc, đòi ≥ 3 ở ≥ 80% số mốc |
| AC-41.4 | Hệ quả của việc mỗi mục đích cho một **đích khác hướng**. Phép kiểm nhóm 22 vectơ theo ngưỡng 45°, lọc vectơ > 0,2 m, đòi ≥ 2 nhóm cách > 90° ở ≥ 70% số cặp mốc |
| AC-41.5 | Đích đổi, nhưng phép bước vẫn là `buocCoHoc` — mọi trần gia tốc, giảm tốc và quay người của spec 007 **không đổi một dòng**. Phép kiểm chạy lại bộ đo `doCoHoc.ts` đã có |
| AC-41.19 | `phanMucDich` chỉ chạy khi `chiSoMoc - mocChonTruoc >= 1` (1 bước = 0,5 s); giữa hai lần, mục đích đọc từ `TrangThaiLienTuc`. ⚠️ **Nói thẳng: AC này mua rất ít ngân sách** — xem D-số riêng |
| AC-41.20 | Mục đích và mốc hết hạn nằm trong `TrangThaiLienTuc`, mang sang phút sau đúng như `coHoc`. Phép kiểm **P5**: cùng mã trận + cùng chuỗi can thiệp → so từng khung hình |
| AC-41.6 | Hệ quả của việc mọi người luôn có một đích khác chỗ đang đứng. ⚠️ ***"Người không tham gia"* chưa ai định nghĩa**, và mẫu số quyết định con số: nền là **28,2%** (spec 007) hay **66,08%** (cả 22 người) — cách nhau **2,3 lần**. **D168** chốt định nghĩa là *"mọi ô người không phải `nguoi_giu` của mốc ấy"* và **đo lại nền** ở lát 0. Phép kiểm đếm tỉ lệ lượt dịch chuyển < ngưỡng đứng yên, đòi < 10% |

*Hình dạng so với đối phương:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-41.7 | `kepSauHangThu(dich, hangThuDoiPhuong)` — đích của `chay-cho-sau-lung` bị **kẹp** về phía sân mình so với người cuối ngoài thủ môn của đối phương. Đây là chỗ **nhận thức chéo hai đội** vào engine lần đầu; lưới 12 vùng chưa từng có nó. Phép kiểm đo tỉ lệ vượt, đòi < 20% |

*Người cầm bóng:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-41.8 | `hanhDong.ts` → `hanhDongCuaPha(loaiHanhDong, boiCanh)` — một phép **gọi tên** quyết định v6 đã ra, nên nó không thể đổi kết cục. Điền vào `hanh_dong` của khung dày (đã có, đang `null`) cộng một cột ở `nhat_ky` |
| AC-41.9 | 🐞 **KHÔNG đúng sẵn** — bản trước của bảng này ghi *"đã đúng từ T816"*, và đó là **sai theo cấu trúc**: một đoạn `'re-bong'` có `quang > 0` nên `dangBay = true` nên `giuThucSu = KHONG_AI_GIU`, nên người dẫn **đi về chỗ đứng sơ đồ trong khi quả bóng đi** (`tranLienTuc.ts:288`, `:719-725`). **D170** dựng nó: trong một đoạn dẫn, **quả bóng đi theo người**, lệch nhiều nhất `TAM_CHAM_BONG`. Phép kiểm đo khoảng cách người–bóng ở mọi mốc của pha dẫn, đòi < 2 m |
| AC-41.10 | `giuThucSu` của T816 đã làm xong việc này: bóng bay ⇒ không ai lấy bóng làm đích. Phép kiểm đo đơn điệu tăng của khoảng cách người chuyền–bóng trong quãng bay |
| AC-41.11 | `nguoiDon(pha)` — **suy từ người sở hữu chuỗi ở hành động KẾ TIẾP** mà v6 đã quyết, không phải một lựa chọn mới. Đúng một người, vì v6 chỉ nêu một. Phép kiểm đếm số người giảm khoảng cách tới `doanBong.den`, đòi đúng 1, và khoảng cách khi bóng tới < 3 m |
| AC-41.12 | `nhanhCuaHanhDong` — tập đóng bốn nhánh, ánh xạ từ bốn `LoaiHanhDong` của v6 cộng hình học. Bảng ánh xạ ở **mục 4.5**: ba loại là 1:1, chỉ `chuyen` mơ hồ và nó tách theo lợi tiến. Ghi vào `nhat_ky` |
| AC-41.13 | Phép kiểm **chống rỗng**: đếm số lần xuất hiện của cả bốn nhánh trên một trận đầy đủ, đòi mỗi nhánh > 0. Bốn nhánh sống được vì tần suất bốn kết cục của v6 đã đo: mất bóng 62,85% · ra ngoài 17,40% · phạm lỗi 14,29% · dứt điểm 5,46% |
| AC-41.22 | `doMaoHiem` — công thức ở **mục 4.5**, hai chỉ số `nhan-quan` + `quyet-doan`. ⚠️ **Chỉ số *"bình tĩnh"* mà ví dụ của AC nêu KHÔNG TỒN TẠI** trong 18 mã của repo → **D157**. Nó vào đúng **ngưỡng lợi tiến** của nhánh `chuyen`, nên hai người cùng tình huống cho hai nhánh khác nhau **trong khi hành động v6 vẫn y nguyên**. Phép kiểm dựng hai chỉ số lệch nhau rồi so nhánh |

*Phòng ngự:*

| AC | Được đáp ứng bởi |
|---|---|
| AC-41.14 | `phanMucDich` **bảo đảm theo cấu trúc**: khi đối phương cầm bóng, người gần nhất trong đội hình luôn nhận `kem-nguoi` nhắm người cầm bóng. Phép **phân công** chạy mỗi lần **bóng đổi chủ** (**D161**), và người cầm bóng chỉ đổi ở đúng nhịp ấy — nên nhịp này là nhịp **đúng về nghĩa**, không phải một phép xấp xỉ để tiết kiệm. Phép kiểm đo tỉ lệ số mốc có ≥ 1 người như vậy, đòi ≥ 90% |
| AC-41.15 | Đích của `kem-nguoi` đọc lại **mỗi mốc** — chỗ người bị kèm đang đứng, lệch về phía khung thành nhà. Đó là **O(1)** mỗi người kèm, nên nó rẻ **và** cho tính đơn điệu mà AC đòi (**D161**). ⚠️ Nhánh **dưới 2 m KHÔNG được nhắm tới**: `tachChen` đẩy mọi cặp về ≥ 2,0 m, và đạt được dưới 2 m chỉ có thể do nó **không hội tụ** trong 24 vòng — một lỗi, không phải một hành vi. AC thoả qua nhánh thứ hai *"hoặc cho tới khi bóng đổi chủ"*, và phép kiểm đo **tính đơn điệu**, không đo việc xuống dưới 2 m — xem **D154**. 📌 **Đo để khỏi tranh luận:** trên **1.381.380** cặp, khoảng cách nhỏ nhất là **1,9912 m** và **28** cặp dưới 2,0 m — cả 28 là **tạo tác làm tròn 0,01 m** của tệp xuất, không phải `tachChen` hụt |

---

## 7. Chiến lược kiểm thử

Hiến pháp mục 4: *"unit test là **bắt buộc** cho lớp `engine`"*, và mọi dòng của spec 009 ở trong
`engine`. Nên không task nào ở đây xong mà không có test — đó là cổng chặn, không phải lựa chọn.

### 7.1 Bốn tầng, và tầng nào gác cái gì

| Tầng | File | Gác cái gì |
|---|---|---|
| **Hàm thuần** | `mucDich.test.ts`, `khoiDoiHinh.test.ts`, `theLucCoHoc.test.ts`, `hanhDong.test.ts` | Từng công thức một: đích của từng mục đích, dải khối, hệ số tốc độ, bốn nhánh. Rẻ, chạy mili giây |
| **Bộ đo trên trận thật** | `doMucDich.test.ts` | **33 AC có con số**. Chạy trận đầy đủ trên nhiều mã, đo đúng đại lượng AC nói |
| **Lưới canh không-tệ-đi** | `doCoHoc.test.ts` (đã có) | Sáu món nợ cơ học của spec 007 **không tăng** so với mốc 2026-11-27 |
| **Lưới canh kết cục** | `sosanh.*.test.ts` | Dòng sự kiện và tỉ số **không đổi một ký tự** |

### 7.2 Phép kiểm rẻ nhất, và nó là phép kiểm quan trọng nhất

```
Chạy 10 mã trận cố định TRƯỚC và SAU spec 009, so dòng sự kiện và tỉ số từng ký tự.
```

Một phép kiểm, và nó chứng minh **toàn bộ** lời hứa nền *"vị trí không quyết định kết cục"*.
Nó phải chạy ở **mọi** lát cắt, không chỉ ở lát cuối — vì cái nó bắt là một **rò rỉ**, và rò rỉ
vào sớm thì sửa rẻ. Mốc so sánh: một tệp vàng (golden) sinh **trước** lát cắt 1.

⚠️ **Phép kiểm này không tự đúng.** Nó chỉ bắt được rò rỉ nếu tệp vàng được sinh từ `HEAD`
**trước** khi một dòng nào của spec 009 chạy. Sinh nó sau là ghim lại chính cái rò rỉ.

### 7.3 Chống rỗng, bắt buộc ở mọi phép đo

Đây là **quy ước có thật của repo**, không phải một lời khuyên: chuỗi `CHỐNG RỖNG` xuất hiện
**37 lần trong 15 file test** (`coHoc.test.ts` 6, `tepXuat.test.ts` 7, `tranLienTuc.test.ts` 4,
`mocVe.test.ts` 3, `viTriMet.test.ts` 2…). Dạng viết: một `it` riêng mang tiền tố
`⚠️ CHỐNG RỖNG:` đặt **trước** các `it` đo lường, khẳng định mẫu không rỗng **và** có tín hiệu
thật — khuôn ở `sosanh.haiCheDo.test.ts:101`.

Lý do nó bắt buộc ở đây, cụ thể: **bốn** AC của spec 009 đo *"ở ít nhất 70% số mốc **thoả điều
kiện**"*, và điều kiện là một phép lọc (*"bóng ở phần sân của họ"*, *"đội đang dẫn ở 15 phút
cuối"*). Nếu phép lọc không bao giờ thoả thì `0/0` và phép kiểm **xanh mà không đo gì**. Đó là
lỗi đã bắt được **bốn** lần trong dự án này — xem **R74**.

### 7.3b Ba ràng buộc hình thức của repo, và chúng được cưỡng chế

- **`vite.config.ts`, không `vitest.config.ts`.** Repo **không có** `vitest.config.ts`; cấu hình
  nằm trong khoá `test:` của `vite.config.ts` (`environment: 'node'`,
  `include: ['src/**/*.test.ts']`).
- **Không `testTimeout`.** Repo không đặt nó, nên mỗi `it` có **5.000 ms**. Một `it` chạy 10 mã
  trận (**≈ 3,3 giây**) còn vừa, nhưng sát — nên nó **phải khai `timeout` riêng** (**D160**).
  Thiếu nó là một phép kiểm đỏ **vì hết giờ**, không vì sai, và đó là loại đỏ tệ nhất.
- **Tên test mang mã AC và mã task.** `describe('AC-45.3 — hai chế độ cho hai bảng thống kê gần
  nhau (T751)')`; tên `it` là một **mệnh đề tiếng Việt khẳng định hành vi**, không phải
  `should …`. Chữ VIẾT HOA để nhấn từ then chốt.

### 7.4 Ghim con số, không chỉ ghim ngưỡng

`doCoHoc.test.ts` đã có khuôn: ghi **con số đo được** vào chú thích và cho phép kiểm đỏ khi nó
xấu đi. Áp cho mọi AC mới. Lý do: một ngưỡng *"< 20%"* xanh ở 19,8% và xanh ở 2% — hai trạng
thái rất khác nhau, và chỉ con số nói được.

### 7.5 Thủ công — lớp kiểm cuối, và nó không thay được bằng máy

Definition of Done của spec đòi: **người dùng tự xem một trận trọn vẹn** và phán rằng bốn câu
họ nói ở mục 1 không còn đúng. Đó là tiền lệ của spec 005, 006 và 007, và nó đã bắt được hai
thứ mà mọi phép kiểm đều xanh: *"11 cặp khiêu vũ"* (T814) và *"giật cục"* (T817). Kịch bản:

1. Mở một trận ở chế độ liên tục, xem trọn, ở cả sân 2D và sa bàn.
2. Nhìn **một** cầu thủ không cầm bóng suốt một phút — anh ta có đi vì một lý do không?
3. Nhìn **tiền đạo** — anh ta có còn đứng sau lưng hàng thủ cả trận không?
4. Nhìn **hai người cạnh nhau** — họ có lúc nào đi hai hướng khác nhau không?
5. Phút 80 — có ai chạy chậm hơn rõ rệt không?

---

## 8. Rủi ro & phương án lùi

Số R tiếp nối spec 011 (dừng ở **R67**, trong đó R67 là một tham chiếu treo ở spec 007 — nên
spec 009 bắt từ **R68** cho sạch).

| # | Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| **R68** | **Ngân sách thời gian vỡ thêm — và bây giờ có số.** Nền thật **110,84 ms** (ca xấu **129,44**), không phải 100 ms. Spec 009 thêm **≈ 42,35 ms** nếu làm theo cách thẳng nhất: kèm người 31,03 · chọn mục đích 5,43 · quãng đường + thể lực 3,92 · khối đội hình 1,97 | **Cao** — và nó đã vỡ **×1,40 trước** khi spec bắt đầu | `110,84 → ≈ 153 ms` (ca xấu `≈ 172`), tức **×1,94–×2,18** ngân sách 78,95 ms | **D161** cắt **29,6 ms** của khoản ấy bằng cách phân công kèm người theo **lần bóng đổi chủ** (297 lần) thay vì theo mốc (6.440 lần) → `≈ 123 ms`, **×1,56**. **D153** nói thẳng AC-41.19 cắt **0,00 ms**. Lát 5 **đo và báo số**. ❗Và **mục 10.4** hỏi một câu đứng trước tất cả: **78,95 ms có phải ngân sách của chế độ liên tục không?** Không một ngưỡng nào được hạ ở đây |
| **R78** | **Mô hình chỗ đứng mới làm sáu món nợ cơ học của spec 007 tệ hơn.** Thay `phanDichCuaO` là đổi toạ độ của **cả 22 người ở mọi mốc**, nên mọi trần cơ học bị thử lại từ đầu | **Cao** — một mô hình đích mới chạy nhanh hơn thì AC-38.1/38.2/38.3 đỏ thêm ngay | Vỡ một **điều kiện ra** của `spec.md` mục 8 | `T820` đo **tỉ lệ `vi phạm / mẫu`** của từng vế trên **đủ 10 mã** và ghi **cả tử lẫn mẫu** làm nền, rồi `T857` ghim lại các con số tuyệt đối của `doCoHoc.test.ts` — cả hai **trước** khi `viTriMet.ts` bị chạm (**D169**, **D171**). Giá: **≈ 3,3 giây** mỗi lượt chạy test, và lần này **trả** giá ấy, khác `doCoHoc.test.ts:393` đã từ chối nó cho 5 mã. ⚠️ **Sáu con số cũ KHÔNG dùng được làm nền** — chúng trộn hai cỡ mẫu, xem **D169**; dùng chúng là dựng một cổng vừa chết vừa đỏ sai. Trần tốc độ mới thấp hơn (`tocDoToiDa` 6,4–8,6 thay cho `TRAN_TOC_DO_TUYET_DOI` 9) nên nó **có thể** làm nợ tốt lên — nhưng đó là một **phỏng đoán**, và chỉ phép đo nói được |
| **R80** | **Mô hình chỗ đứng mới làm vỡ AC-49.6 / AC-49.7 của spec 011** — hai AC người dùng đã **xem bằng mắt rồi phán đạt** ngày 2026-11-26, và **AC-40.1 đòi nén khối**, tức đẩy đúng chiều xấu | **Cao** | Phá hai AC của một spec **đang mở**, và phá đúng thứ người dùng vừa nói là *"nhìn hơn"* | Ba dây bẫy ở `src/ui/batBienSaBan.test.ts` chạy **mỗi lượt** `npm test`, nên chúng đỏ ngay — lề là **hơn hai lần** (8,8–10,9% so với 0,2) và **năm lần** (0,041% so với 0,002). Nên rủi ro là **đỏ ồn ào**, không phải vỡ âm thầm. `tachChen` vẫn là lưới cuối (**R76**). Và lát 1 **cho người dùng xem ngay**, vì hai AC ấy vốn được đóng bằng mắt |
| **R79** | **Một mốc tiêu quá `RUT_MOI_MOC = 64` lần rút**, và cổng canh `throw` **giữa lúc mô phỏng** | Trung bình | Trận ném lỗi giữa đường; và nếu dải bị nới **sau** khi trận đầu tiên được lưu thì `hatGiongMoc` của mọi mốc `k > 0` dịch | **D164** đặt một task **CHẶN**: thay `const daRut = 0` bằng bộ đếm thật, **đo** số lần rút lớn nhất một mốc trên 10 mã, **báo số**, rồi mới ghim. **D152** giữ nhu cầu rút thấp theo thiết kế: phân công mục đích **tất định theo thứ tự ô**, nên 22 người tiêu **0** lần rút. Nếu đo ra vượt: nới lên **256** (`11.508 × 256 ≪ 2^30`), và nó đổi **vị trí** chứ không đổi **tỉ số** |
| **R69** | **Rò rỉ kết cục.** Một dòng đọc vị trí mét rồi cho nó ảnh hưởng tới một quyết định của v6 — rất dễ xảy ra **vô tình** khi `tranLienTuc.ts` đã có cả hai thứ trong cùng một hàm | **Cao** | Phá **lời hứa nền** của cả spec, và phá nó **âm thầm** — tỉ số đổi mà không AC nào đỏ | Phép kiểm tệp vàng ở **mục 7.2**: 10 mã, so dòng sự kiện và tỉ số **từng ký tự**, chạy ở **mọi** lát cắt. Tệp vàng sinh ở **lát 0**, trước khi một dòng nào của spec 009 chạy. Cộng `rutMoiMoc` đã có sẵn: nó đếm số lần rút mỗi mốc và ném khi quá 64 |
| **R70** | **Quãng đường 9–12 km không ra.** Đó là một bài hiệu chỉnh, không phải một bài cấu trúc: trung bình phải đúng **1,85 m/s** trên 90 phút | **Cao** | AC-40.10 và AC-40.11 đỏ | Đo **sớm**, ở lát 0, để biết nền là bao nhiêu (hôm nay gần như chắc chắn thấp hơn nhiều: 28,2% số lượt đứng im hoàn toàn). Nếu dải không ra: **hỏi người dùng**, và nhớ rằng chính AC-40.10 tự ghi *"⏳ hợp đồng có ngày hết hạn"* — spec 010 sở hữu phân bổ cường độ, và tổng quãng đường là **hàm của** nó |
| **R71** | **Hai con số thể lực trôi khỏi nhau** và người đọc code sau này gộp chúng lại | Trung bình | `theLucCoHoc` rò vào v6 → R69 | **D149** đặt hai tên khác nhau rõ, và mỗi file mang một khối chú thích trỏ sang file kia nói **vì sao** chúng phải tách. `theLuc.ts` **không đổi một dòng**, nên một lần sửa nó là một dòng diff dễ thấy khi review |
| **R72** | ✅ **ĐÃ XỬ — không còn là rủi ro.** AC-40.12 đo *"thay người do máy"*, thứ v6 không có (`kiemTraCanThiep`, `tran.ts:1095`), nên mẫu là `0/0` | **Chắc chắn** — đã đo | AC-40.12 xanh **vô nghĩa** (0/0), hoặc đỏ vì phép kiểm chống rỗng | Người dùng chốt **2026-11-28**: chuyển nội dung AC sang **spec đầu tiên sở hữu huấn luyện viên máy**. Giữ hàng này trong bảng thay vì xoá, vì nó ghi lại **vì sao** một AC rời khỏi spec — và vì nó nêu tên cái bẫy đã bị từ chối: tự thêm thay người do máy là **sinh một dòng sự kiện** (→ **R69**) |
| **R73** | **Phép phân công mục đích không tất định** vì nó đi qua một `Map` hoặc một `sort` không bền | Trung bình | **P1** vỡ, AC-41.20 đỏ, và nó chỉ lộ ra ở một mã trận lẻ | `phanMucDich` xếp theo **chỉ số ô đội hình** (0..10), đúng khuôn `choDungDoiHinhMet` đã làm — chú thích của nó ghi *"thứ tự đầu vào là thứ tự `doiHinhTrenSan`, nên hàm **tất định**"*. Phép kiểm chạy hai lần cùng đầu vào và so từng phần tử |
| **R74** | **Hai AC mới cho 0 mẫu** vì điều kiện lọc không bao giờ thoả (*"bóng ở phần sân của họ"*, *"đội đang dẫn ở 15 phút cuối"*) | Trung bình | Một AC xanh mà không đo gì — lỗi đã bắt được **bốn** lần trong dự án này | Khuôn `VE_CHUA_CO_MAU` của `doCoHoc.ts`: một vế 0 mẫu **phải** được khai kèm lý do, không được im lặng. Cộng một `it` **⚠️ CHỐNG RỖNG** riêng cho **mỗi** phép đo tỉ lệ, đúng quy ước 37 lần trong 15 file |
| **R75** | **Cột mới của tệp xuất làm `doCoHoc.ts` lệch cột** | Thấp | Sáu món nợ cơ học báo sai, và lưới canh không-tệ-đi thành vô dụng | `doCoHoc.ts:290` `bangCot` tra cột **bằng tên** từ hàng tiêu đề, không bằng chỉ số — nên **D151** an toàn theo cấu trúc. Vẫn chạy `doCoHoc.test.ts` ở lát 4 để khẳng định |
| **R76** | **`phanMucDich` làm hai người cùng nhắm một chỗ**, mở lại *"bị đè lên nhau"* mà T814 đã trả | Trung bình | Phá một phép đo đã đạt của spec 007, và phá đúng câu người dùng đã nói | `tachChen` vẫn là **lưới cuối** và nó không đổi một dòng. Cộng: phép đo *"không hai người chồng nhau"* của spec 007 chạy ở **mọi** lát cắt, và **mục 6 của spec** nêu nó thành một trường hợp biên |
| **R77** | **Mục đích đúng nhưng nhìn vẫn sai.** Mọi phép đo xanh mà người dùng xem trận vẫn thấy máy móc | Trung bình | Lát 6 không qua, và spec không đóng được | Đây là rủi ro **không giảm được bằng máy** — tiền lệ: *"11 cặp khiêu vũ"* (T814) và *"giật cục"* (T817) đều xanh hết phép kiểm. Giảm thiểu duy nhất: **cho người dùng xem sớm**, ngay cuối lát 1, không đợi lát 6 |

**Rollback:** từng lát cắt lùi được độc lập, và lùi **sạch** vì spec 009 không di trú một dữ liệu nào.

- **Lát 0** (tệp vàng + bộ đo): chỉ thêm file test. `git revert` là xong.
- **Lát 1–3** (mục đích, khối, thể lực): lùi là trả `viTriMet.ts` về `phanDichCuaO`/
  `dichNguoiKhongBong` và bỏ `TrangThaiLienTuc.nguoi`. **Không** chạm bản ghi trận, **không**
  bump phiên bản (**D148**), nên **không trận đã lưu nào biết chuyện gì xảy ra**.
- **Lát 4** (tệp xuất): bỏ một khoá khỏi `KHOA_NGUOI`. Tệp xuất là **đường một chiều** — không
  có đường nhập nào đọc nó, nên bỏ một cột không làm hỏng một tệp sao lưu nào (**P7**).
- **Lát 5–6**: không có code để lùi.

⚠️ **Thứ KHÔNG lùi được, và vì thế nó không được làm:** bump `PHIEN_BAN_ENGINE_LIEN_TUC`. Một
khi trận mới lưu với 102, hạ về 101 là tước nút đấu lại của **chúng**. **D148** không bump chính
vì lý do này.

---

## 9. Thứ tự triển khai

Chia theo **lát cắt dọc chạy được**, không theo tầng. Mỗi lát xong là **xem được một trận** và
nhìn thấy đúng thứ lát ấy mang lại.

### Lát 0 — ba cái thước, và không một hành vi nào đổi

Lát này **không sửa gì cả**, và nó là lát không được bỏ: một thước dựng **sau** khi sửa là một
thước đo chính thứ mình vừa sửa. Ba việc, và **việc thứ ba CHẶN mọi lát sau**:

**0a. Bảng vân tay của chế độ liên tục.** 10 mã của `MA_TRAN_CO_DINH`
(`src/engine/__fixtures__/doiMau.ts`), ghim **dòng sự kiện và tỉ số** theo đúng khuôn `MOC_V6`
của `tuongThichEngine.test.ts`. ⚠️ Khuôn ấy hôm nay **chỉ phủ chế độ cổ điển**, nên chế độ liên
tục **chưa có** bảng vân tay nào — tức câu *"không đổi một ký tự"* hôm nay **không kiểm được**.
Dựng nó **trước** là điều kiện để câu ấy có nghĩa.

**0b. Nền nợ cơ học của spec 007: TỈ LỆ, trên đủ 10 mã.** `doCoHoc` cho AC-38.1, 38.2, 38.3,
38.4, 38.6, 38.11 — ghi **`số vi phạm / tổng mẫu`** của từng vế, **cả tử lẫn mẫu**, rồi đòi tỉ lệ
**không tăng**. Giá: **≈ 3,3 giây** mỗi lượt chạy test (**R78**).

⚠️ **Sáu con số `249+104 / 23+3 / 62+312 / 1 / 280+144 / 22` KHÔNG phải nền** — chúng trộn hai
cỡ mẫu (năm con số từ `T742`, một con số từ `T816` trên **một** mã), nên dùng chúng là dựng một
cổng **vừa chết vừa đỏ sai**. Xem **D169**; `spec.md` mục 8 đã được sửa cùng ngày.

**0e. ❗ Ghim lại các con số tuyệt đối của `doCoHoc.test.ts`.** File ấy ghim **bằng đẳng thức**
hàng chục con số đo trên **một** mã, và D165 + D152 + trần tốc độ mới dời vị trí **từng mốc** nên
chúng đỏ. Không task nào sở hữu việc này trong bản trước của plan — xem **D171**. Phân loại từng
`toBe`: vế nào là **ngưỡng nợ** thì thành `toBeLessThanOrEqual` trên tỉ lệ, vế nào là **số mẫu**
thì ghim lại con số mới **kèm lý do**.

**0c. ❗ Bộ đếm lần rút THẬT.** Thay `const daRut = 0` (`tranLienTuc.ts:896`) bằng một bộ đếm
thật, rồi **đo và báo số** số lần rút lớn nhất một mốc đối chiếu `RUT_MOI_MOC = 64`. **Đây là
task chặn:** cho tới khi nó xong, cổng `if (daRut > RUT_MOI_MOC)` là **mã chết** và dải 64
**không có ai canh** — xem **D164** và **R79**.

**0d. Bốn con số nền của US-40 mà `spec.md` KHÔNG có.** AC-41.3/41.4/41.6/41.7 đều mang một dòng
*"hôm nay con số này là X"*; **AC-40.1/40.2/40.3/40.5 không mang dòng nào**. Đo chúng trên 10 mã
hiện tại và ghi bốn con số vào plan, đúng như spec đã làm cho US-41.

📌 **Dự báo bằng số học, và nó phải được kiểm chứ không được tin** — xem **D165**:

| AC | dự báo | vì sao |
|---|---|---|
| AC-40.1 dải dọc 30–40 m | ❌ **≈ 57,75 m** | tâm dải 30,75 → 88,5 sau khi trừ `LUI_VE_SAN_MINH` |
| AC-40.2 dải ngang 35–45 m | ✅ **≈ 38,08 m** | `(0,78 − 0,22) × 68` — **đạt sẵn, bằng một hằng số** |
| AC-40.3 tương quan ≥ 0,6 | ✅ **≈ 1** | `đích_i = (1−p_i)·chỗ_i + p_i·bóng` là **affine** theo bóng, nên tâm ngang khối cũng affine — tương quan Pearson xấp xỉ 1 |
| AC-40.5 chênh ≥ 5 m | ❌ **0 m** | bề ngang là hằng số, và hiệu của một hằng số với chính nó là 0 |
| AC-40.9 không nhảy quá 1 m/s | ✅ **≤ 0,86 m/s** | `8,6 × 0,10` là bậc lớn nhất AC-40.8 sinh được — **đạt sẵn** |
| AC-41.6 tỉ lệ đứng im | ⏳ **28,2% hay 66,08%?** | mẫu số chưa định nghĩa — **D168** chốt rồi đo lại |

⚠️ **Hai AC đạt sẵn thì phải nói ra, không được nhận công.** Nếu phép đo khẳng định AC-40.2 và
AC-40.3 đạt **trước** spec 009, mục 6 ghi đúng điều đó và phép kiểm của chúng ở lại làm **dây
bẫy chống hồi quy** — vì **D165** thay chính cái hằng số đang làm AC-40.2 đạt, nên nó rất có thể
làm AC ấy đỏ.

Cộng khung `doMucDich.ts` với các phép đo **đo được ngay hôm nay** (dải khối, số mục đích, nhóm
hướng, tỉ lệ đứng im, tỉ lệ việt vị, quãng đường), chạy và **ghi con số nền vào chú thích**.

**Xong khi:** `npm test` xanh · bảng vân tay 10 mã tồn tại và ghim · **tỉ lệ nợ 007 của sáu vế,
cả tử lẫn mẫu**, ghi vào chú thích · các `toBe` tuyệt đối của `doCoHoc.test.ts` đã được phân loại
và ghim lại · bộ đếm rút báo một con số thật · bốn con số nền của US-40 ghi vào plan · bộ đo in
ra sáu con số nền khớp bảng `spec.md` mục 1.

### Lát 1 — mục đích, và 22 người đi bốn hướng khác nhau

`mucDich.ts` + `khoiDoiHinh.ts`, cắm vào `tranLienTuc.ts` thay đường
`dichNguoiKhongBong`/`phanDichCuaO`. Mở rộng `TrangThaiLienTuc.nguoi`.

Đây là lát **đổi nhiều nhất** và trả **năm AC nặng nhất**: AC-41.1, AC-41.3, AC-41.4, AC-41.7,
AC-41.14. Hết lát này người dùng mở trận là thấy ngay — hoặc thấy ngay là chưa được.

**Xong khi:** bộ đo cho ≥ 3 mục đích ở ≥ 80% mốc, ≥ 2 nhóm hướng ở ≥ 70% cặp mốc, việt vị
< 20%; tệp vàng **khớp từng ký tự**; sáu món nợ cơ học không tăng.

### Lát 2 — khối có hình dạng và phản ứng mất bóng

Hoàn thiện `khoiDoiHinh.ts`: dải dọc/ngang, tương quan theo bóng, giãn khi có bóng, cửa sổ 3–5 s
sau mất bóng, lùi khối khi đang dẫn ở 15 phút cuối.

**Xong khi:** AC-40.1 → 40.5 và AC-40.16 đo đạt; tệp vàng khớp.

### Lát 3 — thể lực cơ học và trần tốc độ theo chỉ số

`theLucCoHoc.ts`; gọi `tocDoToiDa(chiSoTocDo)` từ mã sản phẩm **lần đầu**; chấn thương.

Lát này là lần đầu **chỉ số tốc độ do người dùng nhập** ảnh hưởng tới chuyển động ở chế độ liên
tục — tức lần đầu giá trị cốt lõi ở hiến pháp mục 1 (*"kết quả phản ánh chỉ số do người dùng
nhập"*) đúng ở tầng vị trí.

**Xong khi:** AC-40.6 → 40.13, AC-40.17, AC-40.18 đo đạt; quãng đường trong 9–12 km (5–6 km thủ
môn); tệp vàng khớp.

### Lát 4 — hành động, bốn nhánh, và tệp xuất

`hanhDong.ts`; cột mã mục đích vào khối mỏng; điền `hanh_dong`/`muc_dich` khung dày; sửa hai
chú thích lạc hậu của `tepXuat.ts`.

**Xong khi:** AC-41.2, AC-41.8 → 41.13, AC-41.21, AC-41.22 đo đạt; kích thước tệp **báo số
trước/sau** và dưới 11.000.000 byte.

### Lát 5 — đo và báo số ngân sách, rồi hỏi

Đo thời gian một trận liên tục, đối chiếu 78,95 ms, **báo số**. Nếu vượt: **một câu hỏi cho
người dùng**, không phải một chỗ tự nới.

**Xong khi:** con số được ghi vào `plan.md` và người dùng đọc nó.

### Lát 6 — người dùng xem và phán

Lớp kiểm cuối của Definition of Done. Không code.

---

## 10. Việc cần người dùng chốt trước khi `/tasks`

**Một câu hỏi còn chờ, và nó KHÔNG chặn `/tasks`.** Năm việc, theo đúng khuôn mục 10 của plan 011:

- [x] **AC-40.17 nêu ví dụ một chỉ số thủ môn KHÔNG điền** → plan chọn ba chỉ số thủ môn thật sự
  có (**D156**). Là **ví dụ** trong ngoặc, không phải thân AC, nên plan xử được — chỉ báo.
- [x] **AC-41.22 nêu ví dụ một chỉ số KHÔNG TỒN TẠI** → plan dùng `nhan-quan` + `quyet-doan`
  (**D157**). Cũng là ví dụ — chỉ báo.
- [x] **"Một công thức ghi trong spec" — ghi ở đâu** → mục 4.5 của plan này (**D158**).
- [x] ❓ **AC-40.12 không có một phần tử nào để đo** → **người dùng chốt 2026-11-28: chuyển nội
  dung AC sang spec đầu tiên sở hữu huấn luyện viên máy**, giữ nguyên số và nguyên lời. Spec 009
  còn **36 AC**, và mục 6 phủ **hết**. Đã ghi vào Non-goals và Nhật ký làm rõ của `spec.md`.
- [ ] ❓ **78,95 ms có phải ngân sách của chế độ liên tục không.** Xem **10.4**.
  **Cần người dùng chốt** — nhưng nó **không** chặn việc đo.

Ba việc đầu là **dữ kiện spec nói sai**, không phải lựa chọn: tôi đã chọn đường duy nhất còn lại
và ghi thành quyết định; chỗ này chỉ để người dùng biết. Việc thứ tư là một **câu hỏi thật** và
nó **đã được trả lời**, nên **`/tasks` chạy được**. Việc thứ năm cũng là một câu hỏi thật, nhưng
nó **không chặn** gì: lát 5 đo và báo số dù nó được trả lời thế nào.

### 10.1 ⚠️ Hai chỉ số mà ví dụ trong spec nêu KHÔNG tồn tại *(đã xử, chỉ báo)*

- AC-40.17 nêu ví dụ *"phản xạ và đọc tình huống"* cho thủ môn. `doc-tinh-huong` **không nằm
  trong 8 chỉ số chung mà thủ môn điền** (`attributes.ts:42-51`), nên nó rơi về giá trị lui và
  **mọi thủ môn sẽ ra một con số giống nhau** — tức AC-40.17 đỏ. → **D156** dùng
  `phan-xa` + `bat-bong` + `quyet-doan`.
- AC-41.22 nêu ví dụ *"tầm nhìn và bình tĩnh"*. **Không có chỉ số nào tên "bình tĩnh"** trong
  18 mã của `types.ts:58-76`. → **D157** dùng `nhan-quan` + `quyet-doan`.

Cả hai AC chỉ ràng *"suy ra từ các chỉ số đã có"*; phần trong ngoặc là **ví dụ**. Nên đây không
phải một lần sửa AC, và không cần người dùng chốt — nhưng nó phải được **nói ra**, vì nếu người
dùng đọc ví dụ ấy như một yêu cầu thì họ sẽ thấy plan làm khác.

### 10.2 ⚠️ *"Một công thức ghi trong spec"* — ghi ở đâu *(đã xử, chỉ báo)*

AC-40.17 và AC-41.22 đòi công thức *"ghi trong spec"*, nhưng `spec.md` mở đầu bằng một dòng cấm
mọi chi tiết kỹ thuật. **D158** đọc nó là *"ghi trong tài liệu đặc tả, không phát minh trong
code"* và đặt công thức ở `plan.md` mục 4.

### 10.3 ✅ AC-40.12 không có phần tử nào để đo — **người dùng chốt 2026-11-28: (b)**

> AC-40.12 — KHI một cầu thủ được thay ra THÌ người vào sân PHẢI có thể lực từ 90 trở lên và
> người rời sân PHẢI có thể lực từ 70 trở xuống, ở ít nhất **80% số lượt thay người do máy
> quyết định**.

**Dữ kiện đo được:** v6 **không có thay người do máy**. `kiemTraCanThiep` (`tran.ts:1095`) chặn
thẳng — `canThiep.doi !== tt.doiCuaNguoiDung` → `'khong-phai-doi-cua-ban'` — nên **đội đối
phương không bao giờ thay người**. Mọi lần thay người đều do **người dùng** bấm
(`TrangTran.tsx:729` → `useMatch.ts:335`) hoặc do phát lại bản ghi. Và `theLuc` **không xuất
hiện trong một điều kiện nào** của việc thay người.

Nên AC-40.12 có **mẫu rỗng**: `0/0`. Nó xanh một cách vô nghĩa, và phép kiểm chống rỗng mà mục
7.3 đòi sẽ làm nó **đỏ**.

**Ba đường, và cái giá của từng đường:**

| | Đường | Cái giá |
|---|---|---|
| **(a)** | **Dựng thay người do máy** trong spec 009 | Một lần thay người là một **dòng sự kiện mới** → **vỡ lời hứa nền** *"dòng sự kiện và tỉ số không đổi một ký tự"*, và vỡ nó ở đúng chỗ R69 canh. Còn phải mở cổng `kiemTraCanThiep` cho máy, tức đổi một hợp đồng của v6 |
| **(b)** | **Chuyển AC-40.12 sang spec sau** (nơi sở hữu huấn luyện viên máy) | Spec 009 mất một AC. Nhưng spec đã có một Non-goal cùng hướng — *"Huấn luyện viên máy đổi sơ đồ giữa trận… cần một tác nhân ra quyết định ở cấp **đội**, không phải cấp **người**. Để lại cho một spec sau"* — và thay người do máy là **đúng tác nhân ấy** |
| **(c)** | **Đọc lại AC là về thay người do NGƯỜI DÙNG**, và đo trên một chuỗi can thiệp dựng sẵn | AC đổi nghĩa: *"do máy quyết định"* thành *"do người dùng"*. Nó đo được, nhưng nó đo **người dùng chơi có hợp lý không**, không đo ứng dụng |

✅ **Người dùng chọn (b) ngày 2026-11-28.** Nội dung AC-40.12 chuyển sang **spec đầu tiên sở hữu
huấn luyện viên máy**, giữ **nguyên số** và **nguyên lời**.

**Đã làm, trong cùng một commit:**

- Gỡ AC-40.12 khỏi mục 4 của `spec.md`. Spec 009 còn **36 AC** (17 ở US-40, 19 ở US-41).
- Ghi nó thành một **món nợ có tên** trong Non-goals của `spec.md`, gắn vào đúng dòng Non-goal
  đã đẩy *"huấn luyện viên máy đổi sơ đồ giữa trận"* sang một spec sau — **cùng tác nhân cấp
  đội**, nên nó về cùng một chỗ thay vì mở một món nợ thứ hai.
- Ghi vào **Nhật ký làm rõ** của `spec.md`, lượt bốn, kèm cái giá: spec mất một AC, đổi lấy lời
  hứa 🔒 còn nguyên.
- Mục 6 của plan này nay phủ **36/36**.

⚠️ **Số `AC-40.12` coi như ĐÃ CẤP.** Nó **không được dùng lại** cho một nội dung khác; khi spec
kia tới, nó nhận lại đúng số này cùng đúng lời này. Đó là tiền lệ của **AC-40.4** — số spec 007
cấp cho *"3–5 giây phản pressing"* và spec 009 phải trả lại sau khi một bản nháp lấy mất nó.

📌 **Và một việc plan này KHÔNG làm:** nó không tự đặt số cho spec kia. Repo có 001–007, 009,
011; spec sở hữu huấn luyện viên máy **chưa có số**, và đoán một số là dựng ra một con trỏ tới
chỗ trống — đúng lỗi mà `spec.md` mục 4 đã phải ghi lại một lần.

### 10.4 ❓ **78,95 ms có phải ngân sách của chế độ liên tục không** — cần người dùng chốt

Con số **78,95 ms** không được viết ra ở đâu cả. Nó **suy ra** từ hiến pháp mục 3:

> *"một mùa 20 đội (380 trận) MUST mô phỏng xong trong < 30 giây"* → `30.000 / 380 = 78,947`

Nhưng đó là ngân sách của **mô phỏng mùa giải**, và mô phỏng một mùa **không cần toạ độ mét của
26 thực thể** — nó cần tỉ số. Engine v6 làm đúng việc ấy ở **9,0 ms** một trận, tức
`9,0 × 380 = 3,42 giây`, **dư 8,8 lần**.

Chế độ liên tục tồn tại để **người dùng xem một trận**. Ngân sách của *việc ấy* là một con số
khác, và nó cũng có trong hiến pháp mục 3: *"Giả lập trọn một trận ở chế độ chạy ngay: **< 3
giây**"*. Ở 153 ms, chế độ liên tục **dư 19,6 lần** so với ngân sách ấy.

| | ngân sách | spec 009 ở ~153 ms | kết luận |
|---|---|---|---|
| **Mùa giải** (380 trận < 30 s) | 78,95 ms/trận | **×1,94 vượt** | vỡ — nếu mùa giải chạy chế độ liên tục |
| **Một trận xem được** (< 3 s) | 3.000 ms | **×19,6 dư** | không vỡ |

**Câu hỏi:** khi vòng lặp sự nghiệp tới, một mùa 380 trận sẽ mô phỏng bằng **v6** (9,0 ms, dư
8,8 lần) hay bằng **chế độ liên tục**? Nếu là v6 thì 78,95 ms **buộc v6**, không buộc chế độ
liên tục, và **R68 không phải một rủi ro** — nó là một phép đo của một thứ không ai dùng.

⚠️ **Tôi không tự trả lời câu này**, và đặc biệt không dùng nó làm lý do để bỏ việc đo. Lát 5
**vẫn** đo và báo số dù câu hỏi được trả lời thế nào. Nhưng nếu câu trả lời là *"mùa giải chạy
v6"* thì plan này không phải đi xin sửa hiến pháp, và đó là một khác biệt đáng hỏi **trước**
`/tasks` chứ không phải sau.
