# Plan: Sân 2D sống như một trận thật

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Approved (2026-11-18) |
| **Updated** | 2026-11-18 |
| **Sửa đổi** | 2026-11-18 — spec thêm US-32 (quả bóng luôn hiện, hiệu ứng bàn thắng) → thêm **D98–D100**, thêm lát 41, lát đóng spec thành 42 |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

> **D94 đã hỏi và đã chốt ngày 2026-11-18.** Mục 9 của spec dặn phải dừng và
> hỏi trước khi đổi cách tính vị trí tại mốc, và AC-30.4 buộc đổi đúng chỗ
> ấy. Người dùng chọn **làm trong `hinhSan`** — xem mục 10. Giả định ở mục 9
> của spec đã được sửa theo, không sửa ngược những gì đã đóng.

## 1. Kiểm tra hiến pháp (Constitution check)

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập tái lập được | ✅ | Nhịp lặng sau bàn thắng (D100) đổi **nhịp đồng hồ thật**, không đổi thứ tự hay số lượng phút engine bước qua, nên kết quả trận không đổi một dòng. Không chạm `src/engine/`. Lớp chuyển động không gọi `Math.random`: dao động chờ là hàm thuần của `(playerId, thời điểm trận)` — xem **D90**. Cùng một trận xem lại ở cùng nhịp cho cùng chuyển động |
| P2 Luật bóng đá tách khỏi giao diện | ✅ (có lập luận, xem dưới) | Nghiêng khối và giữ hàng ngang là **trình bày**, không phải luật |
| P3 Dữ liệu người dùng bất khả xâm phạm | ✅ | Không ghi gì. Mức tốc độ không được lưu xuống đĩa (nó là `useState` trong `useMatch`), nên đổi mặc định không cần migration |
| P4 Offline, không gọi mạng | ✅ | Không thêm phụ thuộc nào; SVG viết tay như cũ |
| P5 AC so sánh phải có test | ✅ | AC-30.6 là AC so sánh (kiệt sức so với sung sức) → có test; AC-30.3 và AC-28.4 cũng so sánh được bằng số |
| P6 Mỗi giai đoạn tự chạy được | ✅ | Năm lát cắt dọc ở mục 9; lát đầu tiên đã làm người dùng thấy khác ngay |
| P7 (lưu trữ/sao lưu) | ✅ | Không chạm `src/storage/`; định dạng bản ghi và tệp sao lưu không đổi |
| P8 Song ngữ trong cùng commit | ✅ | Mức tốc độ mới có nhãn Việt–Anh ngay trong commit của lát 37 |
| P9 Bàn phím, tương phản, không chỉ dựa màu | ✅ | Mức mới là một `<input type="radio">` trong `fieldset` sẵn có nên đi được bằng Tab; nhãn chữ "Kiệt sức" trong tường thuật giữ nguyên, nên chuyển động không phải kênh duy nhất |
| P10 Quy mô sự nghiệp | — | Không liên quan: spec này thuộc vòng lặp 1 |

**P2 — lập luận đầy đủ, vì đây là chỗ dễ vi phạm nhất.** "Khối đội hình nghiêng
theo bóng" và "hàng ngang giữ ngang hàng" nghe như luật bóng đá, nhưng chúng là
trình bày theo đúng ba nghĩa kiểm được: (1) chúng **không đi vào engine** — không
một hàm nào trong `src/engine/` biết chúng tồn tại; (2) chúng **không đổi một con
số nào** của trận: tỉ số, dòng tường thuật, chỉ tiêu, điểm cầu thủ đều do engine
tính xong trước khi sân vẽ, và AC-31.2 là phép kiểm của chính điều đó; (3) **tắt
hẳn chúng đi thì kết quả trận không khác**, đúng như chế độ giảm chuyển động đang
chứng minh mỗi ngày. Chúng là cách VẼ một trạng thái engine đã quyết, cùng loại
với việc `hinhSan` đang dịch đội hình theo chỉ thị "độ cao đội hình" — việc đã có
từ spec 002 và chưa ai coi là vi phạm P2.

**Ngoại lệ xin miễn trừ:** Không.

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** React 18.3.1 + TypeScript strict + Vite, SVG viết tay,
  không thư viện đồ hoạ.
- **Phụ thuộc mới:** **Không.**
- **Vùng code bị chạm:**
  - `src/ui/components/San2D.tsx` — file chịu thay đổi nặng nhất (hiện 689 dòng):
    `thoiGianChuyen`, vòng khung hình, `hinhSan`, chỗ vẽ bóng.
  - `src/ui/noiSuy.ts` + `src/ui/noiSuy.test.ts` — làm mượt, thể lực.
  - `src/ui/daoDong.ts` + `src/ui/daoDong.test.ts` — **mới**, lớp dao động chờ.
  - `src/ui/san2D.test.ts` — bốn phép kiểm `thoiGianChuyen` phải sửa theo công thức mới.
  - `src/hooks/useMatch.ts` — `MucTocDo`, `MS_MOI_PHUT`, `CAC_MUC_TOC_DO`, mặc định.
  - `src/ui/components/BangDieuKhienTran.tsx` — `KHOA_TOC_DO` thêm một khoá.
  - `src/ui/pages/TrangTran.tsx` — truyền hai prop mới xuống `San2D`. **Đây là
    nơi DUY NHẤT dựng `<San2D>`** (đã grep: `TrangLichSu` không vẽ sân), nên
    đường dẫn trạng thái chỉ phải nối một chỗ.
  - `src/ui/ngonNgu/vi.ts`, `src/ui/ngonNgu/en.ts` — khối `TRAN_DAU.tocDo`, và
    một chuỗi mới cho hiệu ứng bàn thắng (US-32).
  - `src/hooks/useMatch.ts` — thêm nhịp lặng sau bàn thắng trong vòng đồng hồ
    (US-32). Đây là lần duy nhất spec này chạm vào vòng đồng hồ.
- **KHÔNG chạm:** `src/engine/`, `src/domain/`, `src/storage/`, `src/services/`.

## 3. Kiến trúc giải pháp

Ba lớp xếp trên nhau, mỗi lớp một việc, và **thứ tự này là một phần của thiết
kế** vì nó là thứ giữ AC-28.3:

```
hinhSan(DuLieuVe)                     -> toạ độ TẠI MỐC của 22 điểm + đường bóng
   |                                     (hàm thuần, được test gọi thẳng)
   |  (+ nghiêng khối theo bóng, chỉ cho người KHÔNG tham gia tình huống — D94)
   v
viTriTaiThoiDiem(tu, den, t, ...)     -> chỗ điểm đang ở GIỮA hai mốc
   |                                     bất biến: t=0 và t=1 trả ĐÚNG mốc
   v
lechDaoDong(playerId, thoiDiemTran)   -> cộng thêm một lệch NHỎ, có biên
   |                                     (lớp mới, không ai được gộp vào trên)
   v
<g transform="translate(x y)">         -> vẽ
```

Lớp dao động nằm **sau cùng và cộng thêm**, nên bất biến "t=0 và t=1 trả đúng
mốc" của `noiSuy.ts` không bị nới lỏng một chút nào. Đó là lý do AC-28.3 (và
AC-25.2 của spec 004) vẫn đúng sau khi sân "luôn luôn động".

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D89** | Dao động chờ đặt ở đâu, và biên độ bao nhiêu | Một module thuần mới `src/ui/daoDong.ts`, trả về một **lệch** được cộng vào sau cùng, ngay trước khi vẽ. Biên độ **bất đẳng hướng, một phần tám khoảng giãn mỗi trục** (siết lại ngày 2026-11-18 sau `/analyze`: một nửa như bản chốt đầu làm hai người cùng hàng lệch gấp bốn ngưỡng AC-30.3, và cho hai người cùng vùng trùng khít — phá AC-30.5 và AC-15.2 của spec 002) | (a) Cộng vào trong `hinhSan`; (b) gộp vào `viTriTaiThoiDiem` | (a) phá bất biến "toạ độ tại mốc" mà `san2D.test.ts` đang kiểm, và làm mô tả cho trình đọc màn hình nói một chỗ khác chỗ đang vẽ; (b) phá đúng bất biến mà `noiSuy.test.ts:32` giữ. Tách riêng còn cho phép tắt độc lập: giảm chuyển động và tạm dừng chỉ cần bỏ một lớp |
| **D90** | Nguồn thời gian cho dao động | **Đồng hồ TRẬN**: `thoiDiemTran = phutDongHo + tỉ lệ đã đi trong nhịp`. Pha riêng từng người suy từ `playerId` | (a) `performance.now()`; (b) `suKien.phut` | (a) xem cùng một trận hai lần ra hai chuyển động khác nhau — không đạt mục 6 của spec; (b) **bẫy đã biết từ spec 004**: `SuKien.phut` là phút HIỂN THỊ và nó không nhích khi một phút không có tình huống nào, nên dao động sẽ đứng chết hàng giây — phá đúng AC-28.1. `phutDongHo` là prop mới, lấy từ `tran.phut` |
| **D91** | Thời lượng một cú di chuyển | Bỏ trần cứng: `thoiGianChuyen = round(msMoiPhut × 0,9)`, và trả **0** khi nhịp dưới 40ms | Giữ `min(280, ms × 0,9)` | Ở nhịp 1000ms, trần 280 cho 280ms đi + **720ms đứng im** — đúng cái bẫy spec mục 1 đã ghi. Trần ấy sinh ra để chữa lỗi "đặt cứng 280ms dài hơn khoảng cách hai mốc" (chú thích `San2D.tsx:277`); công thức theo tỉ lệ **không bao giờ** vượt nhịp nên lý do tồn tại của trần đã hết. 10% chừa lại ở nhịp 1000ms là 100ms — dưới ngưỡng đứng im 300ms, và lớp dao động phủ nốt |
| **D92** | Bỏ cú phanh ở mốc (AC-30.1) | Thời gian **đi đều** (bỏ smoothstep cho cầu thủ), còn độ mềm của đường đi vẫn do Hermite lo; tiếp tuyến vào mốc được chuẩn theo **tốc độ của chặng trước** nên tốc độ liên tục qua mốc. Chỉ làm mượt lúc **xuất phát từ trạng thái đứng yên** (chặng đầu, vừa mở sân, vừa hết tạm dừng) | (a) Giữ smoothstep; (b) spline Catmull-Rom đi qua ba mốc liên tiếp | (a) smoothstep có vận tốc 0 ở **cả hai** đầu — chính cú phanh AC-30.1 cấm; (b) spline cần biết mốc **kế tiếp**, mà engine chỉ tiết lộ tình huống sau khi nó xảy ra. Không có lookahead, nên tính liên tục chỉ làm được theo chiều **nhìn về sau** — đúng việc tham số `huongVao` của `noiSuyCong` đang làm |
| **D93** | Hai chế độ thể lực (AC-30.6) | Nhịp **≥ 500ms** là "có dư": người sung sức dùng 75% nhịp, người kiệt sức tới 95% → chênh ~25%, mắt đọc được. Nhịp < 500ms giữ đúng **D88**: cùng thời lượng, khác dáng | Áp một chế độ cho mọi nhịp | Ở nhịp 70ms, 75% so với 95% là chênh 14ms — không ai thấy, mà rủi ro điểm còn bay dở khi nhịp sau tới thì tăng. Ở nhịp 20ms thì vô nghĩa hoàn toàn. Hai chế độ là cái giá của việc mở lại D88, và phép kiểm của D88 **sửa chứ không bỏ**: nó vẫn là lưới duy nhất bắt lỗi "kéo dài thời lượng ở nhịp không có dư" |
| **D94** | Nghiêng khối theo bóng và giữ hàng ngang làm ở đâu | **Trong `hinhSan`** (chốt ngày 2026-11-18 sau khi hỏi), và chỉ dịch những người **KHÔNG tham gia** tình huống | (a) Lớp lệch chỉ-để-vẽ, không đụng `hinhSan`; (b) bỏ AC-30.4 khỏi spec | Chỗ đứng tại mốc đúng nghĩa là việc của `hinhSan`: làm ngoài nó thì chỗ VẼ khác chỗ mà phép kiểm "điểm không chồng khít" (`san2D.test.ts:155`) và mô tả cho trình đọc màn hình đang dùng — hai điểm có thể chồng nhau mà không test nào thấy. Chỉ dịch người không tham gia là thứ giữ AC-28.3 đúng tuyệt đối: người tham gia vẫn được đặt thẳng vào vùng của tình huống. **Nhưng** mục 9 của spec dặn phải hỏi trước khi đổi cách tính toạ độ tại mốc |
| **D95** | Bóng (AC-30.2) | Bóng có chặng riêng: **đường thẳng**, thời lượng `msChuyen / 3` | Giữ nguyên (bóng nhảy tức thì); hoặc cho bóng đi đường cong như người | Hiện bóng được vẽ thẳng bằng `cx`/`cy` tại toạ độ thô (`San2D.tsx:621`) nên nó **nhảy** — không đạt AC-30.2. Một đường chuyền không cong như một người chạy, nên Hermite ở đây là sai về chất |
| **D96** | Vòng khung hình (AC-28.1, AC-28.5, AC-31.7) | **Tách hai việc:** một effect khoá theo `khoaMoc` dựng dữ liệu chặng (như hiện nay), một effect khác giữ vòng `requestAnimationFrame` **chạy liên tục** khi trận đang chạy, khoá theo `[dangChay, giamChuyenDong]` | Một effect làm cả hai như hiện nay | Vòng hiện tại thoát khi hết `msChuyen`, nên không thể "luôn luôn động". Tách ra thì giữ nguyên tính chất quý nhất của code cũ: vẽ lại vì đổi ngôn ngữ hay đổi màu **không** làm các điểm chạy lại từ đầu, vì dữ liệu chặng chỉ dựng lại khi toạ độ đích đổi. Tạm dừng là `dangChay = false` → vòng tắt, sân đóng băng |
| **D97** | Mức tốc độ mới | Thêm `cham: 1000` vào `MS_MOI_PHUT`, xếp đầu `CAC_MUC_TOC_DO`, và `useState<MucTocDo>('cham')` làm mặc định. Mức `rat-nhanh` thôi nội suy nhờ `thoiGianChuyen` trả 0 (D91) | Thêm nhãn riêng cho "tắt nội suy" | Đường `msChuyen <= 0` **đã có** trong `San2D.tsx:523` và nghĩa của nó đúng là "vẽ một lần, không nội suy". Tái dùng nó thì không thêm nhánh nào, và lớp dao động cũng tắt theo cùng điều kiện — ở nhịp 20ms các điểm vốn đã đổi chỗ mỗi 20ms nên dao động thêm là vô nghĩa |

| **D98** | Quả bóng luôn có mặt (AC-32.1 → AC-32.3) | Bóng có **chỗ riêng được nhớ lại**: dòng mang đường bóng thì lấy điểm cuối của đường ấy; dòng khai cuộc / hết hiệp đưa bóng về điểm giao bóng; dòng còn lại (thay người, kiệt sức) **giữ chỗ cũ** | (a) Luôn giữ chỗ cuối; (b) để nguyên như hiện tại | Hiện bóng chỉ được vẽ khi dòng đang hiện có đường bóng, mà `thay-nguoi`, `kiet-suc`, khai cuộc và hết hiệp đều truyền đường bóng rỗng — nên bóng biến mất ở những dòng ấy, kể cả 5 dòng kiệt sức một trận. (a) đơn giản hơn nhưng để bóng nằm lệch lúc khai cuộc, mà điểm giao bóng là thứ người xem biết trước |
| **D99** | Hiệu ứng bàn thắng (AC-32.4, AC-32.6) | Vẽ trong `San2D` bằng SVG sẵn có: một vòng tròn bán kính lớn dần từ chỗ ghi bàn, điểm người ghi bàn tăng bán kính, và một dòng chữ trên mặt sân. Nhận ra bàn thắng từ `loai === 'ban-thang'` của dòng đang hiện; chỗ ghi bàn từ `vung`, người ghi từ phần tử đầu của `cacCauThu`. Giảm chuyển động → **chỉ còn chữ** | (a) Một lớp HTML phủ lên sân; (b) rung khung sân | (a) phải tự định vị theo pixel, trong khi SVG đã có đúng hệ toạ độ của sân và đã co theo quân số; (b) bị loại từ lúc hỏi — dễ gây chóng mặt. Chữ là kênh thứ hai, nên P9 đạt bằng cấu trúc chứ không bằng cẩn thận |
| **D100** | Nhịp lặng 1,5 giây sau bàn thắng (AC-32.5) | **Kéo dài riêng nhịp kế tiếp** của vòng đồng hồ trong `useMatch`: phút vừa mô phỏng có bàn thắng thì hẹn giờ cho phút sau dài thêm ~1500ms. **KHÔNG** đổi `dangChay` | (a) Gọi `tamDung()` rồi `tiepTuc()` sau 1,5 giây | (a) làm nút Tạm dừng / Tiếp tục đổi trạng thái ngay trước mắt người dùng — đúng điều AC-32.5 cấm. Kéo dài một nhịp thì trạng thái "đang chạy" không đổi một giây nào, nên AC-32.5 đạt bằng cấu trúc. Nhịp lặng không phụ thuộc việc sân đang hiện hay ẩn: dòng tường thuật và tỉ số cũng cần một nhịp để đọc, và gắn nó vào một công tắc hiển thị là buộc vòng đồng hồ biết một việc nó không nên biết |

## 4. Mô hình dữ liệu

**Không đổi.** Không chạm `src/storage/`, không đổi `DB_VERSION` (3), không đổi
định dạng bản ghi trận hay tệp sao lưu. Mức tốc độ sống trong bộ nhớ như hiện
nay, nên việc đổi mặc định sang "Chậm" không cần migration và không ghi gì xuống
đĩa.

`PHIEN_BAN_ENGINE` giữ **5**: `git diff src/engine/` của cả spec này phải rỗng.

## 5. Contracts

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `thoiGianChuyen(msMoiPhut)` *(sửa)* | `number` | `number` — ms, **0** nghĩa là không nội suy | Không ném; nhịp ≤ 0 trả 0 |
| `lechDaoDong(playerId, thoiDiemTran, bienDo)` *(mới)* | `string, number, number` | `Diem` — lệch, không phải toạ độ | Không ném; thuần, không đọc đồng hồ toàn cục |
| `phaCuaNguoi(playerId)` *(mới)* | `string` | `number` trong `[0, 2π)` | Không ném; băm tất định từ chuỗi id |
| `viTriTaiThoiDiem(...)` *(sửa)* | thêm `tocDoVao?: number`, `duThoiGian?: boolean` | `Diem` | Không ném; bất biến t=0/t=1 **giữ nguyên** |
| `<San2D>` *(sửa)* | thêm `phutDongHo: number`, `dangChay: boolean` | — | — |
| `MucTocDo` *(sửa)* | — | thêm giá trị `'cham'` | Trình biên dịch sẽ chỉ ra mọi `Record<MucTocDo, …>` còn thiếu khoá — đó là lưới an toàn, không phải phiền hà |

## 6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-28.1 luôn luôn di chuyển, không đứng im > 300ms **ở những mức còn nội suy** | D89 lớp dao động + D96 vòng chạy liên tục. Ở mức Rất nhanh, D97 tắt cả nội suy lẫn dao động nên AC này không áp dụng — đã ghi vào chính AC sau `/analyze`. Test: với thời điểm trận nhích đều, lệch của một người đổi trong mọi cửa sổ 300ms |
| AC-28.2 người ngoài tình huống vẫn động, không rời vùng | D89, biên độ kẹp trong hộp vùng của vị trí ấy |
| AC-28.3 tại mốc, người tham gia đúng vùng | Thứ tự ba lớp ở mục 3 + D94 chỉ dịch người KHÔNG tham gia. Bất biến `noiSuy.test.ts:32` giữ nguyên, không sửa một dòng |
| AC-28.4 hai người gần nhau không trùng nhịp | D90 `phaCuaNguoi` băm từ `playerId`. Test: hai id khác nhau cho hai pha khác nhau |
| AC-28.5 tạm dừng thì đóng băng | D96 (`dangChay = false` → vòng tắt) + giữ thời điểm trận trong ref để lúc tiếp tục không nhảy |
| AC-29.1 cú di chuyển chiếm gần hết khoảng giữa hai tình huống | D91 |
| AC-29.2 thời lượng giãn theo nhịp, không thêm quãng đứng im | D91 (bỏ trần). Test: `thoiGianChuyen(1000) === 900` |
| AC-29.3 đổi tốc độ giữa trận không giật | Code hiện có đã xuất phát "từ chỗ điểm ĐANG ĐỨNG" (`San2D.tsx:503`) — giữ nguyên, cộng D92 |
| AC-29.4 mức nhanh nhất thôi nội suy | D97 + D91 trả 0 |
| AC-29.5 mặc định là mức chậm | D97 |
| AC-30.1 không phanh ở mốc | D92 |
| AC-30.2 bóng thẳng, nhanh ~3 lần | D95 |
| AC-30.3 hàng ngang giữ ngang hàng | **Phần lớn đã đúng sẵn**: người cùng một hàng có cùng `dai` nên cùng toạ độ ngang. Việc của plan là **giữ** nó đúng sau khi thêm hai lớp kia: biên độ dao động bị chặn ở **một phần tám** khoảng giãn mỗi trục (D89), nên hai người cùng hàng lệch nhau tối đa một phần tư — đúng ngưỡng; độ nghiêng khối áp **đều** cho cả hàng nên không làm lệch hàng. Test: một hàng bốn, chạy qua nhiều thời điểm, độ lệch luôn dưới ngưỡng |
| AC-30.4 khối nghiêng theo bóng ~1/10 chiều dài sân | D94 |
| AC-30.5 không ra ngoài biên, không chồng khít | `gioiHan` đã kẹp (`San2D.tsx:463`) + `lechTrongVung` đã giãn + biên độ dao động bị chặn dưới khoảng giãn |
| AC-30.6 kiệt sức đi chậm thật khi nhịp có dư | D93 |
| AC-31.1 giảm chuyển động tắt cả hai lớp | `useGiamChuyenDong` đã có, thêm một điều kiện cho lớp dao động |
| AC-31.2 mọi con số không đổi | Không chạm engine; `tuongThichV5.test.ts` và `phatLai.test.ts` hiện có là lưới |
| AC-31.3 chạy ngay < 3 giây | Chế độ chạy ngay không vẽ trong lúc chạy (`useMatch.ts:151` gọi `chayHetTran` một lèo rồi vẽ một lần) — đường ấy không có vòng khung hình, nên không bị ảnh hưởng. Vẫn đo lại ở lát 41 |
| AC-31.4 mỗi khung gọn trong một nhịp ở MỌI mức | Lát 41 đo; nền đã có từ Phase 35 spec 004 |
| AC-31.5 nhãn mức mới hai thứ tiếng, đi được bằng bàn phím | D97 + `fieldset` radio sẵn có |
| AC-31.6 kiệt sức vẫn có nhãn chữ | Không chạm dòng tường thuật |
| AC-32.1 bóng luôn có mặt | D98 |
| AC-32.2 khai cuộc / hết hiệp: bóng ở giữa sân | D98, phân loại theo `loai` của dòng đang hiện |
| AC-32.3 dòng khác: bóng giữ chỗ cũ | D98, chỗ cuối giữ trong một ref |
| AC-32.4 ba phần của hiệu ứng + chữ hai thứ tiếng | D99 |
| AC-32.5 nhịp lặng 1,5 giây, không đổi nghĩa nút Tạm dừng | D100 |
| AC-32.6 giảm chuyển động thì chỉ còn chữ, đồng hồ vẫn lặng | D99 + D100 (nhịp lặng không phải chuyển động nên không tắt theo) |
| AC-32.7 tạm dừng / hết trận bóng vẫn có mặt | D98 độc lập với vòng khung hình của D96 |
| AC-31.7 ẩn/hiện sân không chạy lại chặng cũ | D96: lúc dựng lại, `dang.current` rỗng nên chặng mới bắt đầu từ chính toạ độ mốc hiện tại |

## 7. Chiến lược kiểm thử

- **Unit — `daoDong.test.ts` (mới):** cùng `playerId` và cùng thời điểm trận cho
  cùng lệch (P1); hai `playerId` khác nhau cho hai pha khác nhau (AC-28.4); lệch
  luôn nằm trong biên độ đã cho; lệch đổi trong mọi cửa sổ 300ms khi thời điểm
  trận nhích đều (AC-28.1); không gọi `Math.random` — kiểm bằng cách thay
  `Math.random` thành hàm ném lỗi rồi gọi (đúng cách `generator.test.ts` và
  `tenNgauNhien.test.ts` đang làm).
- **Unit — `noiSuy.test.ts` (sửa):** describe "toạ độ tại mốc không bao giờ sai"
  **không sửa một dòng** — nó là lưới của AC-28.3. Describe "thể lực đổi DÁNG"
  đổi thành hai nhánh theo D93. Describe "không điểm nào còn đang đi khi tình
  huống kế tiếp tới (AC-25.3)" đổi tên và đổi nội dung thành AC mới: không điểm
  nào bị **giật**, tức mọi chặng kết thúc trước nhịp sau **ở cả hai chế độ thể
  lực**. Thêm: tốc độ tại mốc không về 0 khi có tốc độ vào (AC-30.1).
- **Unit — `san2D.test.ts` (sửa):** bốn phép kiểm `thoiGianChuyen` theo công
  thức mới (`1000 → 900`, `200 → 180`, `70 → 63`, `20 → 0`); phép kiểm "ở mọi
  mức, cú chuyển chỗ kết thúc trước nhịp kế tiếp" giữ nguyên ý và vẫn phải xanh;
  thêm phép kiểm hàng ngang (AC-30.3) và phép kiểm nghiêng khối không đẩy ai ra
  ngoài vùng (AC-28.3) nếu D94 được chốt.
- **Integration:** không có tầng server; "integration" ở đây là `TrangTran`
  truyền đủ hai prop mới — trình biên dịch bắt, không cần test riêng.
- **Thủ công (lát 41), và đây là phần quyết định:** bốn tổ hợp ngôn ngữ × chế độ
  màu; một lượt với giảm chuyển động đang bật; đo hai ngân sách ở **cả bốn** mức
  tốc độ; và **người dùng tự xem một trận rồi phán "tự nhiên" hay chưa**. Không
  phép kiểm nào thay được mục cuối.

**Phần trợ lý KHÔNG tự kiểm được, nói trước để không ai tưởng là đã xong:** pane
trình duyệt của phiên làm việc không được vẽ nên `requestAnimationFrame` không
chạy một khung nào (đo thẳng ở Phase 35: 0 khung trong 1,5 giây). Trợ lý chứng
minh được toạ độ, thời lượng, biên độ, chi phí mỗi khung — tất cả bằng số, kể cả
bằng cách thay rAF bằng `setTimeout` như Phase 35 đã làm. Nhưng độ mềm, độ "sống"
và câu "giống một trận thật" thì phải mắt người dùng.

## 8. Rủi ro & phương án lùi

| Rủi ro | Khả năng | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|
| **R38** Sửa `noiSuy` để nối tốc độ (D92) làm hỏng bất biến "t=1 trả đúng mốc" → AC-28.3 và AC-25.2 của spec 004 vỡ **im lặng** | TB | **Cao nhất** | Describe đầu của `noiSuy.test.ts` không được sửa một dòng; thêm phép kiểm tốc-độ-vào cho mọi tiếp tuyến, kể cả tiếp tuyến lớn |
| **R39** Nhịp 1000ms xem thử thấy sốt ruột | TB | TB | Nhịp là một hằng số và mặc định là một dòng; nhật ký làm rõ đã ghi đây là chỗ đổi lại đầu tiên |
| **R40** Dao động làm sân trông như thạch / đang bơi | TB | TB | Biên độ là một hằng số, có biên và có test; lát 39 giao cho người dùng xem trước khi làm lát 40 |
| **R41** Vòng chạy liên tục ở nhịp 1000ms: một chặng dài gấp 5 lần nên số khung mỗi chặng tăng ~5 lần, và duty cycle lên 100% | Thấp | TB | Công việc **mỗi khung** không đổi (cùng 22 điểm, cùng phép tính), nên tổng việc mỗi giây xấp xỉ như cũ — nhịp dài hơn thì ít chặng hơn. Nền đo được: ≤0,3ms mỗi khung ở Thường. AC-31.4 bắt đo lại ở cả bốn mức |
| **R42** Ai đó "dọn" đường `msChuyen <= 0` ở mức Rất nhanh vì tưởng là code chết | Thấp | Thấp | Chú thích tại chỗ + phép kiểm `thoiGianChuyen(20) === 0` |
| **R43** `MucTocDo` thêm một giá trị làm vỡ một `Record` nào chưa thấy | Thấp | Thấp | Đây là lỗi biên dịch, không phải lỗi chạy: `tsc --noEmit` bắt hết trước khi commit |
| **R44** Người dùng tưởng nhịp lặng 1,5 giây là ứng dụng treo | TB | Thấp | Hiệu ứng chạy trong đúng nhịp ấy nên có thứ để nhìn; D100 không đổi `dangChay` nên nút và chữ trên nút không nhấp nháy. Khi ẩn sân thì vẫn có dòng tường thuật mới để đọc |
| **R45** Điểm người ghi bàn phóng to rồi chồng lên điểm bên cạnh — phá AC-30.5 | TB | Thấp | Bán kính phóng to bị chặn dưới khoảng giãn giữa hai người cùng vùng, và phép kiểm "điểm không chồng khít" chạy cả ở trạng thái đang có hiệu ứng |
| **R33** (kế thừa) Ai đó sửa engine để chiều một tính năng hiển thị | Thấp | **Cao** | `git diff src/engine/` phải rỗng ở mọi lát; ghi vào tiêu chí xong của từng task chạm gần engine |

**Rollback:** mọi thứ đi qua hai công tắc đã có — `useGiamChuyenDong` (tắt cả
chuyển động) và mức tốc độ. Lùi từng lát là `git revert` một commit; lùi riêng
cảm giác chuyển động mà giữ nhịp chậm thì chỉ cần đặt biên độ dao động về 0.

## 9. Thứ tự triển khai

Năm lát dọc, mỗi lát xong là một ứng dụng xem được (P6). **Lát 37 cố tình nằm
đầu**: nó một mình đã giải quyết phần lớn điều người dùng phàn nàn ("rất nhanh,
không tự nhiên"), nên nếu chỉ làm tới đó rồi dừng thì vẫn đáng.

1. **Phase 37 — Nhịp xem được.** Mức `cham` 1000ms, thành mặc định; bỏ trần
   280ms cho thời lượng di chuyển; mức Rất nhanh thôi nội suy. Nhãn Việt–Anh.
   Sửa bốn phép kiểm `thoiGianChuyen`. → Người dùng mở trận là thấy khác ngay.
   (AC-29.1 → AC-29.5, AC-31.5)
2. **Phase 38 — Hết phanh, và bóng đi như bóng.** Tốc độ liên tục qua mốc; bóng
   đường thẳng nhanh gấp ba. (AC-30.1, AC-30.2)
3. **Phase 39 — Ai cũng sống.** Lớp `daoDong.ts` + test; vòng khung hình chạy
   liên tục; tạm dừng đóng băng; giảm chuyển động tắt cả hai lớp; hai prop mới
   xuống `San2D`. (AC-28.1 → AC-28.5, AC-31.1, AC-31.7)
4. **Phase 40 — Đội hình có tổ chức.** Nghiêng khối theo bóng và giữ hàng ngang
   (D94); hai chế độ thể lực. (AC-30.3, AC-30.4, AC-30.6)
5. **Phase 41 — Thấy bóng, thấy bàn thắng.** Quả bóng luôn có mặt và đứng
   đúng chỗ theo loại dòng; hiệu ứng bàn thắng ba phần; nhịp lặng 1,5 giây.
   Chuỗi mới đủ hai thứ tiếng. (AC-32.1 → AC-32.7)
6. **Phase 42 — Kiểm tay, đo ngân sách, đóng spec.** Bốn tổ hợp; một lượt giảm
   chuyển động; đo hai ngân sách ở bốn mức tốc độ; người dùng xem và phán;
   tick 30 AC. (AC-31.2 → AC-31.4, AC-31.6)

**Chạy song song được:** lát 37 và lát 38 chạm hai chỗ khác nhau của
`San2D.tsx` nên nên làm tuần tự để tránh xung đột; lát 39 độc lập với lát 40 về
mặt AC nhưng cùng chạm `San2D.tsx`. Chuỗi phụ thuộc dài nhất là 37 → 38 → 39 →
40 → 42, tức sáu mắt. Lát 41 (bóng và bàn thắng) **độc lập** với lát 38 → 40: nó
chỉ cần lát 37 (để có nhịp chậm mà xem hiệu ứng), nên làm sớm hơn cũng được
nếu muốn thấy thêm một thứ rõ rệt ngay sau lát đầu.

## 10. D94 — đã hỏi, đã chốt

Mục 9 của spec ghi: *"Vị trí tại mốc do lớp hiện có quyết định, và spec này
không đổi cách tính ấy… Nếu lúc lập plan thấy buộc phải đổi cách tính vị trí tại
mốc thì đó là một spec khác, phải dừng và hỏi."*

AC-30.4 (khối đội hình nghiêng theo bóng) **buộc phải đổi đúng chỗ ấy**: nghiêng
khối nghĩa là người không tham gia tình huống đứng lệch đi so với chỗ `hinhSan`
đang tính. Đã hỏi ngày **2026-11-18**; người dùng chọn **đường (a)**. Ba đường
đã cân:

- **(a) Làm trong `hinhSan`** — **ĐÃ CHỌN** (cũng là khuyến nghị). Chỗ đứng tại mốc là việc của nó;
  phép kiểm "điểm không chồng khít" và mô tả cho trình đọc màn hình đều đọc từ
  đó, nên làm ở đây thì không có chỗ nào nói khác chỗ nào. Cái giá: giả định ở
  mục 9 của spec phải sửa một câu, và `san2D.test.ts` cần thêm phép kiểm rằng
  nghiêng khối không đẩy ai ra ngoài vùng của mình.
- **(b) Lớp lệch chỉ-để-vẽ**, không đụng `hinhSan`. Giữ nguyên giả định mục 9.
  Cái giá: chỗ vẽ khác chỗ mà hai thứ kia đang dùng, nên hai điểm có thể chồng
  khít lên nhau mà không phép kiểm nào thấy — đúng loại lỗi `san2D.test.ts:155`
  sinh ra để chặn.
- **(c) Bỏ AC-30.4** khỏi spec 005, làm 22 AC còn lại. Cái giá: mất một trong
  những thứ làm sân trông "có tổ chức", và phải sửa `spec.md` trước khi `/tasks`.

**Hệ quả của việc chọn (a), ghi ra để lát 40 không phải đoán lại:** giả định
ở mục 9 của `spec.md` đã được sửa một câu (ghi trong nhật ký làm rõ, dòng 12);
`hinhSan` được phép dịch chỗ đứng, nhưng **chỉ của người không tham gia tình
huống**, **có biên một phần mười chiều dài sân**, và vẫn đi qua phép kẹp vào
mặt cỏ đã có. `san2D.test.ts` phải thêm một phép kiểm rằng nghiêng khối không
đẩy ai ra khỏi vùng của mình — đó là lưới giữ AC-28.3 và AC-30.5.
