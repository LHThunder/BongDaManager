# Plan: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Approved (2026-11-19) |
| **Updated** | 2026-11-19 |

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

> **Quyết định đánh số tiếp spec 005:** spec 005 dùng D89–D100, Phase 37–46, T500–T526.
> Spec này dùng **D101 trở đi**, **Phase 47 trở đi**, **T600 trở đi**.

## 1. Kiểm tra hiến pháp (Constitution check)

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1 Giả lập tái lập được | ✅ | Trường mới của `SuKien` là **dẫn xuất thuần** từ `cacHanhDong` mà `chayChuoiBong` đã tính xong — đúng như `duongBongCuaChuoi` đang làm. **Không một lần `rng.next()` nào được thêm**, nên dãy số của trận không lệch một bước. Lớp pha bóng ở giao diện là hàm thuần của (sự kiện, nhịp, tỉ lệ đã trôi) |
| P2 Luật bóng đá tách khỏi giao diện | ✅ (có lập luận, xem dưới) | Engine **không** học thêm luật nào; nó chỉ **thôi vứt** một thứ nó đã quyết. Mọi suy diễn về trình bày (ai giữ bóng, đi vòng qua ai) nằm ở `src/ui/` |
| P3 Dữ liệu người dùng bất khả xâm phạm | ✅ | `DB_VERSION` giữ **3**. `SuKienDaLuu` trong `backupSchema.ts` là `.passthrough()` và **không validate `duongBong`**, nên tệp sao lưu cũ đọc được bằng bản mới và ngược lại. Bản ghi cũ thiếu trường mới → rơi về cách vẽ của spec 005 (D110) |
| P4 Offline, không gọi mạng | ✅ | Không thêm phụ thuộc nào; SVG viết tay như cũ |
| P5 AC so sánh phải có test | ✅ | AC-34.4 (mọi con số không đổi) được `tuongThichV5.test.ts` chứng minh — nó so **từng ký tự** của mọi dòng tường thuật với mốc đã đóng băng; AC-35.4 và AC-36.5 là so sánh bằng số, có test riêng |
| P6 Mỗi giai đoạn tự chạy được | ✅ | Sáu lát ở mục 9; **lát 47 đã xem được ngay**: đường chuyền vụt đi còn pha rê bóng đi chậm hơn |
| P7 Lưu trữ / sao lưu | ✅ | Không chạm `src/storage/` ngoài việc kiểu `SuKien` rộng ra; không đổi định dạng tệp |
| P8 Song ngữ trong cùng commit | ✅ | Hai chuỗi mới: nhãn mức tốc độ thứ năm, và nhãn cho trình đọc màn hình của người giữ bóng |
| P9 Bàn phím, tương phản, không chỉ dựa màu | ✅ | Mức mới là một `<input type="radio">` trong `fieldset` sẵn có; vòng sáng người giữ bóng là **hình**, không phải màu (D108) |
| P10 Quy mô sự nghiệp | — | Không liên quan: spec này thuộc vòng lặp 1 |

**P2 — lập luận đầy đủ, vì đây là chỗ dễ vi phạm nhất và là chỗ người dùng vừa vạch
ranh giới.** Spec này **chạm `src/engine/`**, điều mà bốn spec trước cấm. Nó hợp lệ
theo đúng ba nghĩa kiểm được:

1. **Không rút thêm số ngẫu nhiên.** `chayChuoiBong` đã tạo `cacHanhDong` đầy đủ rồi
   mới return; `duongBongCuaChuoi` chỉ `map` nó. Thêm `loai` vào cùng phép `map` ấy
   không chạm `rng`. Kiểm được bằng cách đọc diff: nếu diff có `rng` thì sai.
2. **Không đổi một kết cục nào.** `tuongThichV5.test.ts` so từng ký tự mọi dòng tường
   thuật với mốc đóng băng từ spec 002. Nếu trường mới lỡ làm lệch dãy số thì dòng
   tường thuật đổi và phép kiểm đỏ ngay.
3. **Engine không học luật mới.** Nó không quyết định thêm điều gì; nó chỉ chuyển ra
   ngoài một thứ nó **đã** quyết từ spec 001 và đang vứt đi.

**Ngoại lệ xin miễn trừ:** Không. `PHIEN_BAN_ENGINE` giữ **5** — và đó là điều phải
chứng minh chứ không phải điều được giả định, nên nó là tiêu chí xong của lát 47.

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** React 18 + TypeScript strict + Vite, Vitest ở `environment: 'node'`.
- **Phụ thuộc mới:** **Không**.
- **Vùng code bị chạm:**
  - `src/engine/suKien.ts` — kiểu `SuKien` rộng thêm một trường.
  - `src/engine/tran.ts` — `duongBongCuaChuoi` trả thêm loại; hai chỗ gọi nó.
  - `src/ui/phaBong.ts` *(mới)* — lớp thuần dựng dòng thời gian của một pha bóng.
  - `src/ui/phaBong.test.ts` *(mới)*.
  - `src/ui/components/San2D.tsx` — lớp vẽ dùng dòng thời gian ấy.
  - `src/ui/san2D.test.ts`, `src/ui/noiSuy.test.ts` — lưới hiện có, phải mở rộng.
  - `src/hooks/useMatch.ts`, `src/ui/components/BangDieuKhienTran.tsx`,
    `src/ui/ngonNgu/{vi,en}.ts` — mức tốc độ thứ năm.
  - `src/engine/tuongThichV5.test.ts` — **không sửa**, chỉ chạy. Nó là lưới.

## 3. Kiến trúc giải pháp

Engine đã biết mọi thứ cần biết. Việc của spec này là **thôi vứt** nó đi, rồi dựng
một dòng thời gian ở giao diện.

```
engine (KHÔNG đổi hành vi)
  chayChuoiBong -> cacHanhDong: [{ loai: chuyen|re-bong|tat-canh|sut, vung }]
        |  (đã có từ spec 001; duongBongCuaChuoi đang map bỏ `loai`)
        v
  SuKien.cacBuocBong: [{ vung, loai | null }]   <- TRƯỜNG MỚI, dẫn xuất thuần
        |
        v  giao diện
  hinhSan(...)            -> chỗ đứng TẠI MỐC của 22 điểm (KHÔNG đổi ngữ nghĩa)
        |
        v
  phaBong(suKien, hinhSan, nhịp)   <- LỚP MỚI, thuần
        |   -> dòng thời gian: ai giữ bóng ở từng đoạn, bóng đi đường nào,
        |      đoạn nào là dẫn bóng, đoạn nào là đường chuyền
        v
  viTriTaiThoiDiem / diemTrenDuong  -> chỗ vẽ giữa hai mốc (bất biến t=0,1 GIỮ NGUYÊN)
        |
        v
  lechDaoDong  -> cộng lệch nhỏ, như spec 005
        v
  <g transform=...>  -> vẽ
```

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D101** | Hình dạng của dữ liệu loại bước | **Trường MỚI, KHAI TUẾ CHỌN: `cacBuocBong?: readonly BuocBong[]`** với `BuocBong = { vung: VungSan; loai: LoaiHanhDong \| null }`. `duongBong` **giữ nguyên** | (a) Đổi kiểu phần tử của `duongBong`; (b) một mảng loại song song | (a) phá mọi chỗ đang đọc `duongBong` — `San2D.tsx` bốn chỗ, và mọi bản ghi trận đã lưu; (b) hai mảng chỉ khớp nhau bằng chỉ số là chỗ dễ lệch nhất. **Tuỳ chọn chứ không bắt buộc**, vì bản ghi trận cũ trong IndexedDB **thiếu** trường này: kiểu phải nói thật điều ấy để giao diện **buộc phải gác** (D110). Phụ phẩm kiểm được: ba chỗ dựng `SuKien` bằng tay trong `suKien.test.ts` và `tuongThuat.test.ts` **không cần sửa**. `loai` để `null` ở **phần tử cuối** khi nó là `vungKetThuc` được nối thêm — chuỗi mất bóng / phạm lỗi / ra ngoài return **trước** khi push hành động, nên phần tử cuối ấy không có hành động nào |
| **D102** | Lớp pha bóng sống ở đâu | **Module thuần mới `src/ui/phaBong.ts`**, nhận (sự kiện, kết quả `hinhSan`, nhịp) và trả một **dòng thời gian**; `San2D` chỉ đọc | (a) Nhét vào `hinhSan`; (b) nhét vào `noiSuy.ts` | (a) `hinhSan` trả **một bộ toạ độ**, và chín phép kiểm thuần đang đọc đúng hình dạng ấy — đổi nó thành dòng thời gian là viết lại cả lưới; (b) phá bất biến "tỉ lệ 0 và 1 trả đúng mốc" của `noiSuy.ts`, thứ đang giữ AC-28.3 và AC-25.2 của spec 004. Tách riêng còn cho tắt độc lập ở mức Rất nhanh và khi giảm chuyển động |
| **D103** | Ai giữ bóng | **Quy tắc tất định theo loại sự kiện**, bảng ở mục 3.1 | Chọn người gần bóng nhất | Người gần nhất đổi theo từng nhịp nên quyền giữ bóng nhảy lung tung — đúng thứ spec này sinh ra để chữa. Quy tắc theo loại sự kiện đọc được từ `cacCauThu`, mà thứ tự của nó do `nguoiThamGiaTinhHuong` quy định rõ |
| **D104** | Bóng đi theo người hay người đi theo bóng | **Trong một đoạn `re-bong`, người giữ bóng đi theo ĐƯỜNG CỦA BÓNG**; ở các đoạn khác, bóng tự bay còn người đi chặng của mình. **Khi nhịp KHÔNG có pha bóng nào** (`thay-nguoi`, `kiet-suc`, hay dòng có `duongBong` rỗng), bóng **bám chân người giữ bóng**, kể cả lớp dao động của anh ta — bóng đứng im cả nhịp chính là nguồn của con số **3144ms** mà spec này sinh ra để chữa (phát hiện số 2 của `/analyze`) | Bóng bám chân người (bóng là hàm của người) | Bóng bám chân thì nó không bao giờ đi hết đường chuyền — mất đúng thứ T524 vừa làm được. Chiều ngược lại giữ cả hai: bóng đi đường thật, người dẫn bóng bám nó |
| **D105** | Người giữ bóng về mốc của mình thế nào | **Đoạn cuối của anh ta là một đường thẳng từ chỗ rời bóng về đúng mốc `hinhSan`** của chính anh ta | Để anh ta đứng lại chỗ bóng | Bất biến "tại tỉ lệ 1, mọi điểm ở đúng mốc" là thứ giữ AC-28.3; phá nó là phá cả lưới của spec 004 và 005 |
| **D106** | Hai nhóm di chuyển khác nhau | **Mở rộng `nghiengKhoiTheoBong` thêm một tham số vai trò**: đồng đội của người giữ bóng được kéo thêm về phía khung thành đối phương, đối phương được kéo thêm về **khung thành của chính họ** (sửa 2026-11-23 — xem khối ghi chú ngay dưới bảng). **Hai lớp có trần RIÊNG**: co khối 1/6 và vai trò 1/6 | Một lớp "di chuyển không bóng" riêng | Đã có sẵn một lớp làm đúng việc ấy với một biên đã chứng minh; thêm lớp thứ hai là thêm một nguồn dịch chuyển nữa mà trật tự tám hàng (AC-30.8) phải chịu |

> **Sửa D106 ngày 2026-11-23, người dùng chốt.** Hai chỗ đổi, vì người dùng nói họ
> **không thấy** đội tấn công dâng lên — và số đo nói họ đúng: phần dâng riêng của
> lớp vai trò chỉ được **2,881 đơn vị** trên sân dài 100, bằng hơn nửa bề ngang một
> chấm cầu thủ (5,2) một chút, và bằng 20% khoảng cách giữa hai dải đội hình.
>
> 1. **Trần riêng cho mỗi lớp.** Một phép kẹp chung nghĩa là lớp co khối — thứ chạm
>    trần ở cặp dải xa nhất — ăn hết ngân sách, lớp vai trò chỉ còn phần thừa. Nới
>    trần chung thì cả hai lớp cùng được lợi và tỉ lệ vẫn thế, nên lần nới 1/10 → 1/6
>    ngày 19/11 không giải quyết được gì.
> 2. **Đối phương lùi về khung thành NHÀ**, không ép theo bóng, và mạnh hơn mức đồng
>    đội dâng lên. Nhật ký làm rõ của spec 006 (dòng 5) đã cho phép cả hai nhánh —
>    đối phương "lùi về **hoặc** ép theo bóng" — nên đây là chọn nhánh còn lại, chứ
>    không phải sửa một AC đã đóng.
>
> Đo trên 10 mã × 7 quân số × mọi dòng (dâng / lùi / sàn chồng điểm; ngưỡng đỏ của
> sàn là 1,0 bán kính):
>
> | thiết kế | dâng | lùi | sàn |
> |---|---|---|---|
> | nền (ép theo bóng) | 2,881 | 2,881 | 1,4696 |
> | ép theo bóng, tỉ lệ /3 | 5,556 | 5,556 | **0,4474 ĐỎ** |
> | cùng chiều /4 /3 | 4,167 | 5,556 | 1,6746 |
> | **cùng chiều /2 /1,5 — đã chọn** | **8,333** | **11,111** | **1,5163** |
> | cùng chiều /1,5 /1 | 11,111 | 16,667 | 1,3580 — **vỡ AC-33.1** |
>
> Điều đáng ghi nhất: mức đã chọn cho sàn **CAO HƠN cả nền**. Kéo hai đội **hội tụ
> vào bóng** mới là thứ ăn hết biên chống chồng điểm; dịch cả hai khối **về cùng một
> phía** thì giữ nguyên khoảng cách giữa chúng. Mức mạnh hơn nữa không vỡ AC-30.5 mà
> vỡ **AC-33.1**: vòng nét đứt quanh người giữ bóng trùm lên tâm một người khác.
>
> Phép kiểm cũ không bắt được chuyện này vì nó chỉ đòi "không bao giờ ngược hướng" và
> "có hơn 16 cặp dâng thêm" — cả hai đều xanh ở mức 2,881. Nay có thêm một ca đo
> **ĐỘ LỚN** (dâng ≥ 7, lùi ≥ 9, và lùi phải sâu hơn dâng), đã đột biến kiểm: đưa tỉ
> lệ về /4 thì đúng ca ấy đỏ.
| **D107** | Mức tốc độ thứ năm | Thêm `rat-cham: 2000` vào `MS_MOI_PHUT`, xếp **đầu** `CAC_MUC_TOC_DO`; **mặc định giữ `cham`** | Đổi mặc định sang mức mới | Mặc định `cham` là quyết định D97 của spec 005, người dùng đã xem và nói "vừa"; đổi mặc định là đổi một thứ đã được phán |
| **D108** | Dấu người giữ bóng | **Một vòng tròn mảnh, nét đứt, quanh điểm**, bán kính lớn hơn viền "tham gia tình huống" | (a) Đổi màu điểm; (b) dùng lại dấu ▲ | (a) phá P9; (b) dấu ▲ đã có nghĩa "đang tham gia tình huống" từ spec 001 — đổi nghĩa một dấu đang dùng là làm hỏng hồ sơ của nó. Nét đứt phân biệt được với viền liền mà không cần màu |
| **D109** | Đi vòng qua đối thủ | **Hàm thuần trong `phaBong.ts`**: nếu một điểm đối phương nằm trong hành lang quanh đoạn đang rê, đường của người dẫn bóng **lệch sang bên** một lượng bị chặn ở **một nửa khoảng cách hai hàng** | Né bằng cách đổi mốc đến | Đổi mốc là đổi chỗ đứng tại mốc — phá AC-28.3. Lệch có biên giữ được cả AC-30.5 lẫn AC-30.8 |
| **D110** | Trận lưu từ trước | **Thiếu `cacBuocBong` → rơi về cách vẽ của spec 005**: bóng đi hết `duongBong`, không dẫn bóng, không vòng sáng | Đoán loại bước từ vùng | Đoán sẽ cho trận cũ xem ra một pha **khác** với thứ engine đã kể lúc chạy thật. Người dùng đã chốt: xem như bây giờ |
| **D111** | Mức Rất nhanh và giảm chuyển động | **Tắt cả lớp pha bóng**, dùng lại đúng điều kiện `msChuyen <= 0` và `giamChuyenDong` đã có | Giữ một dạng rút gọn | Ở nhịp 20ms không có gì đọc được bằng mắt; thêm một nhánh là thêm một chỗ phải test cho một mức dùng để tua |
| **D112** | Ai nhận một đường chuyền (mục 3.2) | **Đồng đội đứng gần vùng đích của bước ấy nhất**, hòa thì lấy `playerId` nhỏ hơn | (a) Giữ nguyên người giữ bóng tới mốc cuối; (b) rút thêm dữ liệu từ engine | (a) là bản đầu của plan này, và nó **tự vô hiệu hoá AC-35.2** — `/analyze` bắt đúng chỗ ấy; (b) phải rút thêm số ngẫu nhiên, tức **đổi kết quả trận** — ranh giới người dùng vừa vạch. Luật suy là tất định, hợp lý theo hình, và không đổi một con số nào |
| **D113** | Quả bóng sau một bàn thắng | **Bóng vào lưới rồi lăn về chấm giao bóng**, trải trên **cả nhịp lắng** `msMoiPhut + MS_LANG_SAU_BAN_THANG` | (a) Để bóng nằm trong lưới; (b) cho một cầu thủ đội thủng lưới giữ bóng | (a) là thứ đo được ở lát 49: **ba quãng đứng im dài nhất cả trận đều là bàn thắng** (3503, 2512, 1487ms), vì bảng 3.1 nói sau bàn thắng thì không ai giữ bóng. (b) phải sửa bảng 3.1 và thêm một luật suy nữa cho một trường hợp duy nhất. Lăn về chấm giao bóng là điều **thực sự xảy ra** trên sân bóng, không đổi bảng 3.1 một dòng nào, và nối liền với dòng giao bóng kế tiếp |
| **D114** | Đồng hồ của lớp dao động | **Một bộ cộng dồn chạy trong vòng khung hình**, tiến đúng một đơn vị mỗi `msMoiPhut`, **đơn điệu và không bao giờ bão hoà** | (a) Giữ `phutDongHo + Math.min(1, …)` (D90 của spec 005); (b) bỏ `Math.min` nhưng giữ công thức cũ | (a) là nguồn của việc **cả sân đóng băng**: đo ở lát 49, trong một quãng 1265ms thì tổng toạ độ của cả 23 nhóm vẽ đổi đúng **0,2 đơn vị**. Một nhịp kéo dài hơn `msMoiPhut` — nhịp lắng sau bàn thắng, hay `setTimeout` trôi dưới tải — làm con số bão hoà và lớp dao động đứng lại. (b) làm đồng hồ **nhảy lùi** đúng phần vượt ở mỗi ranh giới phút, tức hai mươi hai điểm giật cùng lúc. Bộ cộng dồn nằm trong vòng khung hình nên **tạm dừng vẫn đóng băng bằng cấu trúc** (AC-28.5): vòng tắt thì không ai cộng nữa |
| **D115** | Người giữ bóng đã rời sân | **Bỏ qua anh ta, lấy người kế tiếp trong chính dòng ấy còn trên sân**, rồi mới tới người giữ bóng cũ | (a) Để nguyên, lớp vẽ gác bằng `cacDiem.find`; (b) chọn người gần quả bóng nhất | (a) là thứ đo được: **2,82% số dòng** có người giữ bóng không còn điểm nào trên sân — thẻ đỏ, hay bị thay ra — và ở những phút ấy bóng đứng im, đo được một quãng **2002ms trên 127 mẫu**. (b) cần toạ độ, mà toạ độ chỉ có sau khi `hinhSan` chạy xong, nên luật sẽ phải sống ở lớp vẽ và **câu cho trình đọc màn hình không nói theo được** (P9). Danh sách `cacCauThu` đã xếp theo vai trò, nên "người kế tiếp" là một lựa chọn có nghĩa chứ không phải một cái tên bắt đại; luật vẫn **thuần** và **tất định**, và với vị tệ mặc định "ai cũng còn trên sân" nó cho **đúng bảng 3.1** |
| **D116** | Trần nghiêng khối đội hình | **Nới từ một phần mười lên một phần sáu chiều dài sân** | (a) Giữ 1/10 của AC-30.4; (b) tăng riêng lực kéo theo vai trò mà giữ trần | (a) làm phần đội hình dâng lên do **vai trò** chỉ còn **0,5–1,2 đơn vị** trọng tâm, trong khi cả khối đu gần **20 đơn vị** vì lớp co khối — người dùng xem và nói không đủ rõ. (b) không giúp được: trần chặn **tổng**, nên tăng một thành phần chỉ đẩy nó chạm trần sớm hơn. **Người dùng chốt 2026-11-19**, sau khi đọc số đo của lát 51. Cái giá đã đo: sàn hai điểm gần nhau nhất **1,4923 → 1,3108 bán kính**, và vòng "đang giữ bóng" thu từ 1,2 xuống **1,054** đơn vị. Spec 005 đã đóng nên AC-30.4 của nó **không sửa ngược**; quyết định này thay con số đang chạy, và ba phép kiểm bất biến vẫn xanh |

### 3.1 Quy tắc "ai đang giữ bóng" (D103)

`nguoiThamGiaTinhHuong` ở `tran.ts` quy định thứ tự `cacCauThu`, nên quy tắc dưới đây
**đọc được từ dữ liệu đã có**, không đoán:

| Loại sự kiện | `cacCauThu[0]` là ai | Người giữ bóng **sau** dòng ấy |
|---|---|---|
| `ban-thang` | người ghi bàn (kế tiếp là người kiến tạo) | không ai — bóng trong lưới, rồi về giao bóng |
| `co-hoi`, `thoat-xuong`, `tat-canh` | người kết thúc pha | chính anh ta |
| `cuu-thua` | người sút (kế tiếp là thủ môn cứu) | **thủ môn** — phần tử thứ hai |
| `mat-bong`, `cuop-bong-cao` | người **để mất** bóng | **người cướp được** — phần tử kế tiếp, thuộc đội kia |
| `pham-loi` | người bị phạm lỗi / để mất | người của đội được hưởng |
| `the-vang`, `the-do`, `thay-nguoi`, `kiet-suc` | người liên quan, **không phải pha bóng** | **giữ nguyên người cũ** (đã chốt ở `/clarify`) |
| `bat-dau`, `het-hiep` | không ai | không ai; bóng ở điểm giao bóng |

### 3.2 Ai nhận một đường chuyền (D112)

Trong **một** pha bóng, quyền giữ bóng đi theo các bước: một đoạn `chuyen` hay
`tat-canh` chuyển bóng sang **người nhận**, mà engine không nói người nhận là ai.

**Luật suy (D112):** người nhận là **đồng đội đứng gần vùng đích của bước ấy nhất**,
theo toạ độ `hinhSan` của chính nhịp đó, trừ chính người vừa chuyền; hòa thì lấy
`playerId` nhỏ hơn để luật **tất định**. Bước cuối cùng của pha không áp luật này:
người giữ bóng sau cùng do **bảng 3.1** quyết, vì đó là thứ engine có nói.

Đây đúng là loại "suy ở tầng giao diện" mà người dùng đã chấp nhận ở câu hỏi 1 của
`/clarify`, và **giá của nó phải nói thật**: người nhận là một **suy diễn**, không phải
một sự thật của trận — engine chưa bao giờ tính ra anh ta. Nó tất định, nó hợp lý theo
hình, và nó **không đổi một con số nào** của trận. Không được viết vào dòng tường
thuật, không được vào thống kê, không được lưu xuống đĩa.

*(Phát hiện số 1 của `/analyze` ngày 2026-11-19: bản đầu của mục này viết "giữ nguyên
người giữ bóng cho tới mốc cuối", tức AC-35.2 không bao giờ đạt — một AC đã hứa mà
plan tự vô hiệu hoá.)*

## 4. Mô hình dữ liệu

**Không đổi schema lưu trữ.** `DB_VERSION` giữ **3**.

```
SuKien {
  phut, buGio, loai, doi, cacCauThu, vung, duongBong, mauCau, tiSoSauDo   // y nguyên
+ cacBuocBong: readonly { vung: VungSan; loai: LoaiHanhDong | null }[]    // MỚI
}
```

- `backupSchema.ts` khai `SuKienDaLuu` là `.passthrough()` và **không** validate
  `duongBong`, nên tệp sao lưu cũ và mới đọc được lẫn nhau — không cần migration (P3).
- Bản ghi trận cũ trong IndexedDB thiếu trường này; giao diện xử lý theo **D110**.

## 5. Contracts (types / hàm thuần mới)

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `duongBongCuaChuoi` *(sửa)* | `KetQuaChuoi` | `{ duong, cacBuoc }` | Không ném; chuỗi rỗng trả mảng rỗng |
| `nguoiGiuBong(suKien, nguoiCu)` | `SuKien \| null`, `string \| null` | `string \| null` | Không ném; không rõ thì trả `nguoiCu` |
| `dongThoiGianPhaBong(...)` | sự kiện, các mốc `hinhSan`, nhịp | các đoạn `{ tu, den, loai, nguoiGiuBong, tiLeBatDau, tiLeKetThuc }` | Không ném; thiếu `cacBuocBong` trả **một đoạn** = cách vẽ spec 005 |
| `lechTranhNguoi(doan, cacDiemDoiThu)` | đoạn + toạ độ đối thủ | `Diem` lệch, có biên | Không ném; không ai cản trả `{0,0}` |
| `thoiLuongDoan(loai, quang, nhịp)` | loại bước, quãng, nhịp | ms | Không ném; chặn trong một nhịp |

## 6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-33.1 | `dongThoiGianPhaBong` gán người giữ bóng cho từng đoạn; lớp vẽ đặt bóng cách tâm người ấy dưới một bán kính |
| AC-33.2 | D104: trong đoạn `re-bong`, người và bóng dùng **chung một đường** |
| AC-33.3 | Mỗi bước của pha bóng là một đoạn; **và ở nhịp không có pha bóng, bóng bám chân người giữ bóng kể cả lớp dao động** (D104) — đó mới là chỗ sinh ra 3144ms |
| AC-33.4 | D108 — vòng nét đứt, kèm chuỗi cho trình đọc màn hình (P8) |
| AC-33.5 | `nguoiGiuBong` trả `null` ở `bat-dau` / `het-hiep` / sau bàn thắng; lớp vẽ vẫn vẽ bóng |
| AC-33.6 | D107 — mức `rat-cham: 2000` |
| AC-34.1 | D104 + D105 |
| AC-34.2 | D109 — `lechTranhNguoi`, có biên |
| AC-34.3 | `phaBong.ts` là hàm thuần của (sự kiện, nhịp, tỉ lệ) — không `Math.random`, không `performance.now()` |
| AC-34.4 | `tuongThichV5.test.ts` **không sửa, chỉ chạy**: so từng ký tự mọi dòng tường thuật; cộng `PHIEN_BAN_ENGINE === 5` |
| AC-35.1, AC-35.4 | `thoiLuongDoan`: đoạn `chuyen`/`sut` dùng `msChuyen / 3` như D95 của spec 005; đoạn `re-bong` dùng thời lượng của **người**, nên chênh đúng ba lần |
| AC-35.2 | **D112** (luật suy người nhận, mục 3.2) + đoạn `chuyen` kết thúc ở vùng của bước kế tiếp; người giữ bóng đổi **đúng lúc** đoạn ấy xong |
| AC-35.3 | Bước `sut` có `vung` là vùng dứt điểm; đích là khung thành của đội bị sút, lấy từ `vungKetThuc` |
| AC-35.5 | `thoiLuongDoan` + đích đến; **không** thêm hình vẽ nào |
| AC-36.1 | D106 — mọi người không bóng đều nhận một lực kéo khác 0 khi bóng đổi vùng |
| AC-36.2 | D106, nhánh "đồng đội của người giữ bóng" |
| AC-36.3 | D106, nhánh "đối phương", áp từ nhịp kế tiếp |
| AC-36.4 | Ba phép kiểm sẵn có chạy lại: không chồng khít (10 mã trận), thủ môn trong một phần ba sân, tám hàng xen kẽ ở chín tổ hợp độ cao |
| AC-36.5 | `noiSuy.test.ts` (dải tốc độ < 4 lần) và đo độ vòng như Phase 46 |

## 7. Chiến lược kiểm thử

- **Unit — `phaBong.test.ts` (mới):** quy tắc người giữ bóng cho **từng** `LoaiSuKien`
  (bảng 3.1); dòng thời gian của một pha nhiều bước có đúng số đoạn và tổng thời lượng
  không vượt một nhịp; thiếu `cacBuocBong` thì trả đúng **một** đoạn (D110); hàm thuần
  — thay `Math.random` và `Date.now` thành hàm ném lỗi rồi gọi; `lechTranhNguoi` có
  biên với mọi đầu vào kể cả `NaN`.
- **Unit — `phaBong.test.ts`, AC dạng so sánh (hiến pháp P5):** `thoiLuongDoan` với
  **cùng một quãng đường** phải cho đoạn `chuyen`/`sut` nhanh hơn đoạn `re-bong`
  **ít nhất ba lần**, ở cả năm mức tốc độ. P5 bắt buộc AC so sánh có test tự động,
  không được chỉ đo trên bản build (phát hiện số 5 của `/analyze`).
- **Unit — `san2D.test.ts` (sửa):** ba phép kiểm bất biến chạy lại nguyên trạng; thêm
  phép kiểm "bóng cách người giữ bóng dưới một bán kính" trên 10 mã trận.
- **Unit — `noiSuy.test.ts` (sửa):** mức thứ năm tự động vào ba phép kiểm duyệt
  `Object.entries(MS_MOI_PHUT)` — **grep trước khi sửa**, đã biết từ ghi chú Phase 38.
- **Lưới không được sửa:** `tuongThichV5.test.ts`, `phatLai.test.ts`, và describe
  "toạ độ tại mốc" của `noiSuy.test.ts` (R38 của spec 005).
- **Thủ công:** xem một trận ở mức Rất chậm và mức Chậm, hai ngôn ngữ, hai chế độ màu,
  một lượt giảm chuyển động; đo hai ngân sách trên bản build.

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Hậu quả | Giảm thiểu |
|---|---|---|---|---|
| **R46** | Thêm trường vào `SuKien` lỡ làm lệch dãy số của trận | Thấp | **Cao nhất** — mọi trận đã lưu sai | `tuongThichV5.test.ts` so từng ký tự; tiêu chí xong của lát 47 bắt buộc chạy nó, và diff của `src/engine/` **không được chứa chữ `rng`** |
| **R47** | Lớp pha bóng phá bất biến "tại tỉ lệ 1 mọi điểm ở đúng mốc" | TB | Cao — phá AC-28.3 và cả lưới spec 004 | D105 buộc đoạn cuối về đúng mốc; describe "toạ độ tại mốc" không được sửa một dòng |
| **R48** | Người không bóng di chuyển mạnh hơn làm vỡ trật tự tám hàng | **Cao** | TB | D106 dùng lại biên một phần mười đã chứng minh; phép kiểm tám hàng ở chín tổ hợp độ cao chạy lại ở **mỗi** lát |
| **R49** | Ngân sách vẽ: pha bóng có tới `SO_BUOC_TOI_DA` = 12 bước | TB | TB | Số đoạn do engine quyết nhưng **tổng thời lượng bị chặn trong một nhịp**; đo lại hai ngân sách ở lát cuối, so với nền của spec 005 (0,1ms mỗi khung, 0 tác vụ quá 50ms) |
| **R50** | Quyền giữ bóng nhảy giữa hai nhịp làm bóng giật | TB | TB | Bảng 3.1 là tất định; "dòng không nêu ai thì giữ nguyên người cũ"; phép kiểm riêng cho tính ổn định ấy |

## 9. Thứ tự triển khai (lát cắt dọc)

| Lát | Nội dung | Xem được gì ngay |
|---|---|---|
| **Phase 47** | `cacBuocBong` đi từ engine ra ngoài; lớp vẽ cho đoạn `chuyen`/`sut` nhanh gấp ba đoạn `re-bong` | Đường chuyền **vụt đi**, pha rê bóng đi chậm hơn hẳn |
| **Phase 48** | Người giữ bóng (bảng 3.1) + vòng nét đứt + bóng dính chân | Nhìn ra **ai đang có bóng** |
| **Phase 49** | Dẫn bóng: người giữ bóng đi theo đường của bóng rồi về mốc | Cầu thủ **chạy với bóng trong chân** |
| **Phase 50** | Đi vòng qua đối thủ | Pha rê **qua người** |
| **Phase 51** | Hai nhóm di chuyển khác nhau | Cả hai đội cùng sống theo bóng |
| **Phase 52** | Mức Rất chậm 2000ms, kiểm tay bốn tổ hợp, đo hai ngân sách, đóng spec | Xem chậm để soi, và đóng hồ sơ |

Phase 47 và Phase 52 là hai đầu bắt buộc. Phase 50 **độc lập** với 48–49 về dữ liệu
nhưng chạm cùng file, nên làm tuần tự.
