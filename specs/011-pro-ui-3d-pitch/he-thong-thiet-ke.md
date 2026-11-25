# Hệ thống thiết kế — màn hình xem trận

| | |
|---|---|
| **Spec** | `011-pro-ui-3d-pitch` |
| **Task** | T792 (bảng màu) · T793 (trần bão hoà và ba thang) · T794 (cặp màu dễ lẫn) |
| **Phạm vi** | **Chỉ màn hình xem trận** — quyết định 10 của `spec.md` mục 10 |
| **Ngày** | 2026-11-25 |

> **Tài liệu này KHÔNG đổi một màu nào.** Nó ghi lại bảng màu **đang có** của spec 003 (42
> biến) và đặt tên cho các quy tắc mà repo vẫn đang giữ *từng chỗ một*. Việc chỉnh biến là
> **T796**, và nó đi **sau** phép kiểm **T795** — đúng thứ tự mà **R63** dặn.

> **Phương pháp lấy từ `my-game/design/art/art-bible.md`, con số thì KHÔNG.** Người dùng chốt
> *"chỉ lấy phương pháp"* (quyết định 10). Khuôn mẫu ấy đặt trần *thế giới ≤ 65% S, tín hiệu
> ≥ 75% S*. Áp nguyên vào repo này thì thứ vượt trần nặng nhất lại là **chính mặt cỏ**
> (`--co-nen-dam`, S = 88) — xem mục 2, nơi ghi vì sao hai tầng ở đây được định nghĩa **theo
> vai trò**, không theo một con số nhập khẩu.

---

## 1. Bảng màu — bốn cột

Mọi giá trị đọc thẳng từ `src/index.css`; **S** và **L** là độ bão hoà và độ sáng HSL, đo
bằng máy ngày 2026-11-25. Cột **tối** là giá trị ghi đè ở `:root[data-che-do='toi']`;
`—` nghĩa là chủ đề tối **dùng chung** giá trị sáng.

### 1.1 Nền, viền, chữ — tầng **thế giới**

| Tên | Giá trị (sáng) | Tối | S/L | Nghĩa | Được phép dùng ở |
|---|---|---|---|---|---|
| `--nen` | `#f6f8f5` | `#0e1512` | 18/97 | Nền trang | Nền ngoài cùng của trang |
| `--nen-the` | `#ffffff` | `#16211c` | 0/100 | Nền thẻ nổi lên khỏi trang | `bg-nen-the` cho thẻ, bảng, hộp |
| `--nen-nhan` | `#eaefe8` | `#1e2b25` | 18/92 | Nền chìm xuống dưới trang | Ô nhập, nút tắt, vùng phụ |
| `--vien` | `#d4dbd1` | `#2c3b33` | 12/84 | Đường chia nhẹ | Viền giữa hai hàng cùng nhóm |
| `--vien-dam` | `#b7c0b3` | `#3d5047` | 9/73 | Đường chia rõ | Viền ngoài của thẻ, bảng |
| `--chu` | `#16261c` | `#eef2ef` | 27/12 | Chữ chính | Mọi chữ mang tin |
| `--chu-phu` | `#4a5a50` | `#a8b7ae` | 10/32 | Chữ phụ | Nhãn, chú thích, đơn vị |
| `--lop-phu` | `rgba(13,26,18,0.55)` | `rgba(0, 0, 0, 0.66)` | 33/8 | Màn phủ sau hộp thoại | `bg-lop-phu`, chỉ cho modal |

### 1.2 Màu chủ đạo — tầng **thế giới**

| Tên | Giá trị (sáng) | Tối | S/L | Nghĩa | Được phép dùng ở |
|---|---|---|---|---|---|
| `--chinh` | `#146b3a` | `#3fae6a` | 69/25 | Màu thương hiệu, hành động chính | Nút chính, liên kết |
| `--chinh-dam` | `#0e5129` | `#5cc483` | 71/19 | Trạng thái nhấn/di chuột | Chỉ đi kèm `--chinh` |
| `--chinh-nhat` | `#e6f2ea` | `#15291d` | 32/93 | Nền nhạt của màu chính | `bg-chinh-nhat` cho vùng được chọn |
| `--chu-tren-chinh` | `#ffffff` | `#06160d` | 0/100 | Chữ đặt trên `--chinh` | **Chỉ** trên `--chinh`/`--chinh-dam` |

### 1.3 Trạng thái — tầng **tín hiệu**

| Tên | Giá trị (sáng) | Tối | S/L | Nghĩa | Được phép dùng ở |
|---|---|---|---|---|---|
| `--canh-bao-nen` | `#fdf3d6` | `#3a2f0c` | 91/92 | Nền cảnh báo | Hộp cảnh báo |
| `--canh-bao-chu` | `#6b4a05` | `#f5d98a` | 91/22 | Chữ cảnh báo | **Chỉ** trên `--canh-bao-nen` |
| `--canh-bao-manh` | `#8a5a06` | `#e8c069` | 92/28 | Cảnh báo đặc | Nút/nhãn cảnh báo |
| `--canh-bao-manh-dam` | `#6b4a05` | `#f5d98a` | 91/22 | Cảnh báo đặc, nhấn | Chỉ đi kèm trên |
| `--chu-tren-canh-bao` | `#ffffff` | `#241a03` | 0/100 | Chữ trên cảnh báo đặc | **Chỉ** trên hai biến trên |
| `--loi-nen` | `#fde8e6` | `#3b1613` | 85/95 | Nền lỗi | Hộp lỗi |
| `--loi-chu` | `#8c1d16` | `#f6b3ad` | 73/32 | Chữ lỗi | **Chỉ** trên `--loi-nen` |
| `--loi-manh` | `#b3261e` | `#f0837a` | 71/41 | Lỗi đặc | Nút phá huỷ |
| `--loi-manh-dam` | `#8c1d16` | `#f6b3ad` | 73/32 | Lỗi đặc, nhấn | Chỉ đi kèm trên |
| `--chu-tren-loi` | `#ffffff` | `#2a0b08` | 0/100 | Chữ trên lỗi đặc | **Chỉ** trên hai biến trên |
| `--tot-nen` | `#e3f3e8` | `#10291a` | 40/92 | Nền thành công | Hộp xác nhận |
| `--tot-chu` | `#10542c` | `#8fdcaa` | 68/20 | Chữ thành công | **Chỉ** trên `--tot-nen` |
| `--sai-nhe` | `#fcd34d` | — | 97/65 | Lệch vị trí **nhẹ** | Viền ô đội hình |
| `--sai-vua` | `#fb923c` | — | 96/61 | Lệch vị trí **vừa** | Viền ô đội hình |
| `--sai-nang` | `#f87171` | — | 91/71 | Lệch vị trí **nặng** | Viền ô đội hình |

### 1.4 Mặt cỏ — nhóm riêng, **giống nhau ở cả hai chủ đề**

Sân vẫn xanh trong một căn phòng tối, nên nhóm này **không** có bản ghi đè. Đó là lý do
`theme.test.ts` đo nó **một lần** thay vì hai.

| Tên | Giá trị | S/L | Nghĩa | Được phép dùng ở |
|---|---|---|---|---|
| `--co-nen` | `#15663a` | 66/24 | Mặt cỏ, nhánh theo phút | Nền sân ở chế độ cổ điển |
| `--co-nen-dam` | `#065f46` | 88/20 | Mặt cỏ, nhánh liên tục | Nền sân 2D và **sa bàn** |
| `--co-o` | `rgba(5,46,25,0.72)` | 80/10 | Ô lưới vùng sân | `bg-co-o`, chỉ ở lớp vùng |
| `--co-chu` | `#ffffff` | 0/100 | Chữ và **quả bóng** trên cỏ | Số áo, tên, quả bóng |
| `--co-chu-phu` | `rgba(255,255,255,0.78)` | 0/100 | Chữ phụ trên cỏ | Nhãn nhỏ trên sân |
| `--co-vien` | `rgba(255,255,255,0.7)` | 0/100 | Viền sáng trên cỏ | **Dấu chiếu quả bóng** (T790) |
| `--co-vien-mo` | `rgba(255,255,255,0.4)` | 0/100 | Viền sáng mờ | Đường phụ, không mang tin |
| `--co-net` | `#111827` | 39/11 | Nét tối trên cỏ | Viền quả bóng, chữ trên nền sáng |
| `--co-net-mo` | `rgba(17,24,39,0.7)` | 39/11 | Nét tối mờ | Bóng đổ nhẹ |
| `--co-vang` | `#fde047` | 98/64 | **Thẻ vàng** | Chỉ thẻ phạt |
| `--co-noi-bat` | `#bae6fd` | 94/86 | Vòng nhấn người đang xem | `ring-co-noi-bat` |
| `--co-nhan-nen` | `rgba(8,20,13,0.84)` | 43/5 | Nền nhãn nổi trên cỏ | Hộp nhãn trên sân |
| `--co-nhan-chu` | `#fde68a` | 97/77 | Chữ trên nhãn ấy | **Chỉ** trên `--co-nhan-nen` |
| `--co-canh-bao-nen` | `rgba(253,230,138,0.94)` | 97/77 | Nền cảnh báo trên cỏ | Hộp cảnh báo trên sân |
| `--co-canh-bao-chu` | `#422006` | 83/14 | Chữ trên nền ấy | **Chỉ** trên `--co-canh-bao-nen` |

> **Tổng: 42 biến, đủ bốn cột.** Không biến nào trong `src/index.css` thiếu một dòng ở đây.

---

## 2. Trần bão hoà — hai tầng

### 2.1 Hai tầng được định nghĩa theo VAI TRÒ, không theo một con số nhập khẩu

**Tầng thế giới** là thứ luôn có mặt: nền, viền, chữ, mặt cỏ, màu thương hiệu.
**Tầng tín hiệu** là thứ chỉ xuất hiện khi có chuyện: cảnh báo, lỗi, thẻ phạt, mức lệch
vị trí.

Khuôn mẫu đặt trần tuyệt đối *thế giới ≤ 65%, tín hiệu ≥ 75%*. **Repo này không dùng được
con số ấy**, và lý do đo được chứ không phải ý kiến:

| Biến | Tầng | S | Theo trần nhập khẩu |
|---|---|---|---|
| `--co-nen-dam` | thế giới (mặt cỏ) | **88** | vượt trần 65 |
| `--co-o` | thế giới (ô lưới) | **80** | vượt trần 65 |
| `--co-nen` | thế giới (mặt cỏ) | 66 | vượt trần 65 |
| `--chinh-dam` | thế giới (thương hiệu) | 71 | vượt trần 65 |
| `--loi-chu` | tín hiệu | 73 | **thiếu** sàn 75 |
| `--tot-chu` | tín hiệu | 68 | **thiếu** sàn 75 |

Hạ mặt cỏ xuống 65% là đổi bề mặt lớn nhất và dễ thấy nhất của cả ứng dụng, để chiều một con
số mượn từ một trò chơi Unity có bảng màu khác hẳn. Đó là làm hỏng thứ đang đúng.

### 2.2 Quy tắc thật sự cần — **trang trí không được rực hơn thông tin**

Vấn đề mà `spec.md` mục 1 nêu là: *"không có trần bão hoà, nên một mảng trang trí có thể rực
hơn một con số quan trọng — và mắt người đi theo thứ rực nhất."* Nên trần được phát biểu
**tương đối, theo vùng**, chứ không tuyệt đối:

- **TT-1.** Trong cùng một vùng màn hình, biến **trang trí** MUST NOT có `S` cao hơn biến
  **mang tin** đặt trên nó.
- **TT-2.** Biến tầng **tín hiệu** MUST NOT xuất hiện ở vai trò nền hay trang trí. Một màu
  chỉ nói "có chuyện" khi nó **hiếm**; dùng nó để trang trí là tiêu hết sức mạnh của nó.
- **TT-3.** Hai màu đặt cạnh nhau mà cùng mang tin MUST cách nhau **≥ 15 điểm độ sáng (L)** —
  đây là phần phương pháp lấy nguyên từ khuôn mẫu, vì nó không phụ thuộc bảng màu.

> **TT-2 là mệnh đề mà T795 kiểm được bằng máy**, và nó là mệnh đề đáng kiểm nhất: nó không
> cần biết bảng màu nào đúng, chỉ cần biết **vai trò** của từng biến — thứ mà mục 1 đã ghi.

---

## 3. Ba thang

Mỗi thang là một danh sách bậc **hữu hạn**. Số trong ngoặc là số chỗ dùng thật, đếm bằng máy
trên `src/**/*.tsx` ngày 2026-11-25 — nên "ngoài thang" ở đây là danh sách việc có thật cho
**T797**, không phải lời than chung chung.

### 3.1 Thang cỡ chữ — **6 bậc**

| Bậc | Lớp | Dùng cho | Số chỗ |
|---|---|---|---|
| 1 | `text-xs` | Chú thích, đơn vị, nhãn phụ | 57 |
| 2 | `text-sm` | **Bậc nền** — mọi chữ thường | 211 |
| 3 | `text-base` | Chữ cần nhỉnh hơn trong thẻ | 22 |
| 4 | `text-lg` | Tiêu đề mục | 17 |
| 5 | `text-2xl` | Số lớn trong thẻ, tiêu đề màn hình | 5 |
| 6 | `text-3xl` | **Chỉ tỉ số** — số lớn nhất màn hình | 1 |

> ⚠️ **Bản đầu của tài liệu này viết 5 bậc và gọi `text-3xl` là "ngoài thang".** Sai: khi
> T797 đi xem nó nằm ở đâu thì đó chính là **tỉ số trận đấu** (`TrangTran.tsx:379`) — thứ
> đáng to nhất màn hình. Thang thiếu một bậc, chứ mã không lệch. Đếm số chỗ dùng rồi gọi
> cái hiếm là ngoại lệ là một cách sai: thứ hiếm nhất ở đây lại là thứ quan trọng nhất.

**Thang con — chữ trong khung đại diện** (`AnhThayThe.tsx`). Ba bậc này gắn với **cỡ hộp**
chứ không với thang chữ ở trên, nên `text-xl` ở bậc `lon` **không** phải ngoài thang:

| Bậc | Hộp | Chữ |
|---|---|---|
| `nho` | `h-8 w-8` | `text-xs` |
| `vua` | `h-12 w-12` | `text-base` |
| `lon` | `h-14 w-14` | `text-xl` |

### 3.2 Thang khoảng cách — **6 bậc**

| Bậc | Lớp | Dùng cho | Số chỗ |
|---|---|---|---|
| 0 | `*-0` | Gỡ khoảng cách mặc định | 32 |
| 1 | `*-1` | Dính nhau, cùng một thứ | 130 |
| 2 | `*-2` | **Bậc nền** — giữa hai thứ cùng nhóm | 181 |
| 3 | `*-3` | Giữa hai nhóm nhỏ | 146 |
| 4 | `*-4` | Giữa hai khối | 116 |
| 6 | `*-6` | Giữa hai mục lớn | 23 |

**Ngoài thang, toàn repo:** `*-5` (9 chỗ), `*-8` (3 chỗ), `*-10` (4 chỗ) — 16 chỗ.
**Trong phạm vi màn hình xem trận** (10 file) chỉ có **2**: `mt-5` ở `BaoCaoSauTran.tsx` và
`space-y-5` ở `ChiThiDoi.tsx`. **T797 đã đưa cả hai về `*-4`.** 14 chỗ còn lại nằm ở màn hình
khác, ngoài phạm vi quyết định 10.

### 3.3 Thang độ dày đường kẻ — **3 bậc**

| Bậc | Lớp / giá trị | Dùng cho | Số chỗ |
|---|---|---|---|
| 1 | `border` (1px) | **Bậc nền** — mọi viền | 263 |
| 2 | `border-2` (2px) | Viền nhấn mạnh | 2 |
| 3 | `ring-2` | Vòng tiêu điểm và vòng nhấn | 5 |

Trong SVG, độ dày tính bằng **đơn vị viewBox** và có thang riêng ba bậc: `0,3` (viền hình
cầu thủ và quả bóng) · `0,4` (vạch sân, dấu chiếu) · `0,5` (nét nhấn). Mọi giá trị khác —
`1.2 * tiLe`, `0.35 * tiLe`, `2` — là **ngoài thang**, việc của T797.

---

## 4. Cặp màu dễ lẫn và cue phụ **bắt buộc**

P9 của hiến pháp đòi *"không chỉ dựa màu"*. Bảng này nói **chỗ nào** điều đó có nguy cơ vỡ, và
**cue phụ** nào là bắt buộc ở đó. Mỗi dòng ghi kiểu mù màu mà cặp ấy lẫn vào.

| # | Cặp màu | Lẫn với kiểu mù màu | Cue phụ **bắt buộc** |
|---|---|---|---|
| 1 | `--sai-nhe` ↔ `--sai-vua` ↔ `--sai-nang` | **Protanopia, Deuteranopia** — vàng/cam/đỏ xám đi thành ba sắc gần nhau | **Chữ**: bốn mức đã có nhãn *Đúng vị trí / Lệch nhẹ / Lệch vừa / Sai nặng* (`MUC_SAI_VI_TRI_VI`) |
| 2 | `--loi-manh` ↔ `--tot-chu` | **Deuteranopia** — đỏ và xanh lá cùng về nâu xám | **Icon** đi kèm hộp, cộng chữ trạng thái |
| 3 | `--canh-bao-manh` ↔ `--loi-manh` | **Protanopia** — cam đậm và đỏ gần trùng | **Chữ** trong hộp phải nói rõ *cảnh báo* hay *lỗi* |
| 4 | `--co-vang` (thẻ vàng) ↔ `--co-noi-bat` | **Tritanopia** — vàng và xanh nhạt xích lại | **Hình dạng**: thẻ là hình chữ nhật đứng, vòng nhấn là vòng tròn |
| 5 | Màu áo đội nhà ↔ màu áo đội khách | **Mọi kiểu** — người dùng tự chọn, có thể chọn hai màu cùng độ sáng | **Hình dạng (T788)**: chủ nhà **đĩa tròn**, khách **vuông bo góc**, cùng diện tích |
| 6 | `--co-chu` (quả bóng) ↔ màu áo sáng | **Mọi kiểu** — cùng là mảng sáng trên cỏ | **Hình dạng + viền**: bóng nhỏ hơn đĩa người và có viền `--co-net`; dấu chiếu là vòng **rỗng ruột** |
| 7 | Viền tách hai hình sát nhau (**T782**) ↔ viền trạng thái | — (không phải chuyện mù màu, mà là **nghĩa**) | Xem **R65** ngay dưới |

### 4.1 Dòng 7 — viền của T782, và vì sao nó nguy hiểm (**R65**)

**R65** nói viền là một tín hiệu hình **dễ bị đọc nhầm thành trạng thái cầu thủ** — thẻ phạt,
kiệt sức, sai vị trí. Nên viền tách hình của T782 chịu một ràng buộc mạnh hơn mọi dòng trên:

- Viền MUST là thuộc tính **thường trực của mọi hình**, không bật/tắt theo trạng thái. Một
  viền *đôi khi* xuất hiện **là** một tín hiệu, dù người viết không định thế.
- Viền MUST dùng màu **phái sinh từ chính màu áo** (`mauChuTuongPhan`), không dùng một biến
  mang nghĩa nào ở mục 1.3. Dùng `--co-vang` làm viền tách là nói "thẻ vàng" cho 22 người.
- Mọi trạng thái thật của cầu thủ MUST dùng một kênh **khác** viền hình: icon, chữ, hoặc một
  vòng riêng tách khỏi đường bao.

---

## 5. Những gì tài liệu này CHƯA làm

- **Chưa chỉnh một biến nào.** Danh sách biến vượt trần do **T795** sinh ra, việc chỉnh là
  **T796**, và ba khối tương phản đang có của `theme.test.ts` phải **xanh trong cùng commit**.
- **Chưa áp ba thang vào màn hình.** 19 chỗ ngoài thang đã đếm được ở mục 3 là việc của
  **T797**.
- **Hai món nợ tương phản đã có tên** từ T790 và **chưa trả**: vạch sân `2,72:1` (cần 3) và
  số áo trên `#0077DD` `4,48:1` (cần 4,5). Cả hai là thứ `San2D` đang dùng, nên chúng thuộc
  **Phase 65**, không thuộc phase này.
