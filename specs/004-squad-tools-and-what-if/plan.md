# Plan: Dựng đội nhanh, sân sống động, và đấu lại từ một phút bất kỳ

| | |
|---|---|
| **Spec** | `./spec.md` (Clarified 2026-11-17, 4 user story, 37 AC) |
| **Status** | Approved (2026-11-17) |
| **Hiến pháp** | 3.0.1 |
| **Quyết định** | D77 → D88 |
| **Phase** | 29 → 35 (tiếp sau Phase 22–28 của spec 003) |

> Tài liệu này mô tả **HOW**. Hành vi quan sát được nằm ở `spec.md`.

## 0. Kết luận khảo sát code — đọc trước khi đọc phần còn lại

Spec đặt một ràng buộc cứng: **engine không đổi**. Trước khi thiết kế gì,
tôi kiểm xem bốn nhóm tính năng có dựng được trên engine hiện có không.
Kết quả, kiểm ngày **2026-11-17**:

| Câu hỏi | Trả lời | Căn cứ |
|---|---|---|
| Engine chạy lại được một trận với chuỗi can thiệp KHÁC không? | **Được, không sửa gì** | `tran.ts` phơi ra ba hàm thuần: `taoTran(cauHinh)`, `buocTiep(tt)` một phút một bước, và `apDungCanThiep(tt, ct)`. `CanThiep` có trường `phut`, nên phát lại = xếp đúng can thiệp vào đúng phút rồi `buocTiep` |
| Dựng lại cấu hình trận từ bản ghi đã lưu được không? | **Được, gần như ánh xạ thẳng** | `BenDaLuu` (ở `storage/db.ts`) **trùng hình dạng** `DangKyBen` (ở `engine/tran.ts`): cùng `teamId`, `chienThuatXuatPhat`, `trenSan`, `duBi`, `cacCauThu`. Bản ghi còn giữ `maTran`, `sanTrungLap`, `doiCuaNguoiDung`, `quanSo`, `thoiLuong` |
| Giao diện đọc được thể lực từng người lúc trận đang chạy không? | **Được** | `San2D` nhận `DoiTrenSan.ben: BenTran`, mà `BenTran` có `theLuc: Record<playerId, number>` và `daBaoKietSuc` |
| Lớp sinh chỉ số đã đúng P1 chưa? | **Rồi** | `sinhChiSo(muc, positions, rng)` nhận nguồn ngẫu nhiên qua tham số, và chú thích của nó đã cam kết thứ tự lấy số cố định |
| Lưu nhiều bản ghi nguyên khối được không? | **Được, đã có nếp** | `teamRepo.create` đang ghi `teams` + `tactics` trong **một** `db.transaction([...], 'readwrite')` |
| Chỉ số tổng tính theo gì? | **Theo VỊ TRÍ** | `domain/rating.ts: chiSoTongTheoViTri(hoSo, positionId)`; bảng trọng số là `POSITION_WEIGHTS` |
| Lớp xếp đội hình có chọn được 11 người từ một đội 18 không? | **Không trực tiếp** | `xepLaiKhiDoiSoDo(soDoMoi, oVienCu, cacCauThu)` lấy danh sách người **từ `oVienCu`**, không từ `cacCauThu` — `tacticRepo.ts:171` ở tình huống đội chưa có bộ chiến thuật truyền `[]` và nhận về đội hình toàn ô trống. Xem D83 |
| Lớp xếp có đọc chỉ số để phá hoà không? | **Không** | `chiPhi()` trong `lineup.ts` chỉ đọc `mucSaiViTri` + `MUC_TRU_HIEU_SUAT`; file không import `rating.ts`. Luật phá hoà là "giữ người đứng trước trong danh sách", có test khẳng định (`lineup.test.ts`). Xem D84 |

**Hệ quả quan trọng nhất:** US-27 — thứ nghe có vẻ khó nhất của spec — là
phần **không cần code mới ở tầng sâu**. Nó là một vòng lặp gọi ba hàm thuần
đã có. Phần khó thật của nó nằm ở giao diện: chọn phút và hiển thị so sánh.

**Một chỗ spec ghi nhầm, đã sửa khi lập plan:** AC-26.5 bản chốt viết "chỉ
số tổng tính theo *vai trò*". Code tính theo **vị trí**. Đã sửa câu chữ của
AC và dòng tương ứng trong nhật ký làm rõ — đây là sửa lỗi dùng từ của
chính tôi lúc `/clarify`, không phải đổi phạm vi.

## 1. Kiểm tra hiến pháp (Constitution check)

| Nguyên tắc | Kết quả | Lý do |
|---|---|---|
| P1. Giả lập tái lập được | ✅ | `sinhChiSo` đã nhận `Rng` qua tham số; lớp sinh tên và sinh đội cũng sẽ nhận `Rng` qua tham số, không gọi `Math.random` trong `domain`. Nguồn ngẫu nhiên THẬT dựng ở tầng giao diện, đúng nếp `taoMaTran(RNG_THAT)` đang có. US-27 **dựa vào** P1 chứ không thách thức nó: phần trước điểm rẽ giống hệt chính là vì engine tất định |
| P2. Luật bóng đá tách khỏi giao diện | ✅ | Không công thức bóng đá nào vào `ui`. Nội suy chuyển động là **hình học hiển thị**, không phải luật bóng đá — nó không đổi vị trí tại mốc, chỉ vẽ xen giữa hai mốc |
| P3. Dữ liệu người dùng bất khả xâm phạm | ✅ | Sinh đội và nhân bản đội chạy trong **một transaction**, hỏng thì không để lại gì (AC-24.7). Trận rẽ nhánh không ghi vào lưu trữ nên không có đường nào đụng dữ liệu cũ (D79) |
| P4. Chạy offline | ✅ | Kho tên nằm trong repo. Không tài nguyên mới nào phải tải |
| P5. AC so sánh phải có test | ✅ | AC-27.2 (phần trước điểm rẽ giống hệt) và AC-27.4 (không đổi gì thì ra y hệt) là đúng loại AC mà P5 nói tới, và cả hai đã nằm trong Definition of Done với test riêng |
| P6. Mỗi lát cắt tự chạy được | ✅ | Bảy lát ở mục 9, lát nào xong cũng dùng thử được ngay |
| P7. Sao lưu mở lại được | ✅ | **Không đổi định dạng tệp sao lưu.** Đội nhân bản là đội bình thường; trận rẽ nhánh không vào tệp. Đây là hệ quả trực tiếp của quyết định "không lưu rẽ nhánh" ở `/clarify` |
| P8. Song ngữ, mỗi ngôn ngữ trọn vẹn | ⚠️ *có một chỗ phải cẩn thận* | Mọi chuỗi mới đi qua lớp ngôn ngữ như thường. Nhưng **kho tên KHÔNG phải nhãn giao diện** — nó là dữ liệu sinh ra, và tên đã sinh thì giữ nguyên khi đổi ngôn ngữ (AC-24.8). Vì thế nó không vào `ui/ngonNgu`. Xem D80 |
| P9. Bàn phím và tương phản | ⚠️ *rủi ro thật, có phương án bù* | Chuyển động theo thể lực là **thông tin truyền bằng chuyển động** — đúng thứ P9 cấm làm kênh duy nhất. Phương án bù đã thành AC-25.8, và ứng dụng vốn đã có nhãn chữ "kiệt sức" trong dòng tường thuật. D88 làm kênh chuyển động **yếu đi** so với ý ban đầu (độ trễ chứ không phải tốc độ), nên nhãn chữ càng là kênh chính, không phải kênh bù |
| P10. Quy mô sự nghiệp | — | Không áp dụng: spec này thuộc vòng lặp huấn luyện viên |

## 2. Bối cảnh kỹ thuật

- **Không thêm phụ thuộc mới.** Cả bốn nhóm tính năng dựng được bằng những
  gì repo đã có. Nội suy đường cong tự viết bằng vài chục dòng toán, rẻ hơn
  kéo vào một thư viện animation chỉ để vẽ 22 điểm.
- **Những thứ tái sử dụng:** `engine/tran.ts` (ba hàm thuần cho US-27),
  `engine/rng.ts` (`RNG_THAT`, `mulberry32`), `domain/generator.ts`
  (`sinhChiSo`, `CAC_MUC_DO`), `domain/rating.ts` (`chiSoTongTheoViTri`),
  `domain/lineup.ts` (`xepLaiKhiDoiSoDo`, `tinhTrangDoiHinh`),
  `services/teamRepo.ts` (nếp transaction nhiều store),
  `ui/components/San2D.tsx` (`hinhSan`, `thoiGianChuyen`).
- **Quy ước giữ nguyên:** định danh tiếng Việt, luồng `ui → hooks → services
  → lưu trữ` và `ui → engine`, test bắt buộc cho `engine` và lớp dữ liệu.

## 3. Kiến trúc giải pháp

| # | Quyết định | Chọn | Loại bỏ | Lý do |
|---|---|---|---|---|
| **D77** | Cách chạy lại trận để rẽ nhánh | Vòng lặp ở tầng **services/hooks** gọi ba hàm thuần đã có: `taoTran` → lặp `buocTiep`, xếp can thiệp cũ đúng phút → tới phút rẽ thì xếp can thiệp MỚI → `chayHetTran` | (a) Thêm API "chạy từ trạng thái" vào engine; (b) lưu ảnh chụp trạng thái từng phút vào bản ghi trận | (a) là **đổi engine** — bump phiên bản, mọi trận đã lưu mất nút đấu lại, đúng thứ spec cấm. (b) phình tệp sao lưu và đổi schema, trong khi chạy lại 90 phút chỉ tốn ~11ms (đo từ `sosanh.doiManhHon.test.ts`: 200 trận / 2,2 giây) |
| **D78** | Dựng `CauHinhTran` từ bản ghi đã lưu | Một **hàm thuần mới ở `services`**, ánh xạ `TranDaLuu` → `CauHinhTran` | Nới `cauHinhDauLai` của engine để nhận cả hai kiểu | `BenDaLuu` đã trùng hình dạng `DangKyBen` nên ánh xạ là việc vặt. Nới hàm engine là bắt lớp trong cùng biết về kiểu của lớp lưu trữ — ngược luồng phụ thuộc |
| **D79** | Trận rẽ nhánh sống ở đâu | **Chỉ trong bộ nhớ** (state của màn hình), không chạm IndexedDB | (a) Ghi vào lưu trữ rồi xoá khi rời; (b) ghi kèm cờ "là nhánh" | (a) có cửa sổ để lại rác nếu tab chết giữa chừng — P3 không thích. (b) đã bị `/clarify` loại vì đổi schema và tệp sao lưu. Để trong bộ nhớ là cách DUY NHẤT thoả AC-27.9 mà không đụng P7 |
| **D80** | Kho tên hư cấu nằm ở đâu | `src/domain/tenNgauNhien.ts`, hai kho tách theo thứ tiếng, hàm `sinhTen(kho, rng)` nhận kho làm **tham số** | (a) Đặt trong `ui/ngonNgu`; (b) đặt trong `domain` nhưng tự đọc ngôn ngữ đang chọn | Kho tên **không phải nhãn giao diện**: tên đã sinh thì giữ nguyên khi đổi ngôn ngữ (AC-24.8), nên nó là *dữ liệu*, không phải *bản dịch*. (b) bắt `domain` import `services/tuyChonRepo` — ngược luồng phụ thuộc. Truyền kho vào giữ `domain` thuần và vẫn cho `ui` chọn kho theo ngôn ngữ |
| **D81** | Cách sinh tên | **Ghép từ hai danh sách** (họ + tên) theo từng thứ tiếng | (a) Ghép âm tiết tự do; (b) một danh sách tên đầy đủ viết sẵn | (a) cho ra tên lạ tai — chính phương án người dùng đã loại ở câu 2 của `/clarify`. (b) ít tổ hợp nên một đội 18 người sẽ trùng tên. Ghép hai danh sách cho hàng nghìn tổ hợp từ vài chục mục |
| **D82** | Nhân bản đội | **Một** `db.transaction(['teams','players','tactics'],'readwrite')`, theo đúng nếp `teamRepo.create` | Gọi lần lượt `teamRepo.create` rồi vòng lặp `playerRepo.save` | Gọi lần lượt thì hỏng giữa chừng để lại đội có nửa số cầu thủ — vi phạm AC-24.7 và P3. Ảnh **không chép**: bản sao để trống `portraitImageId`/`logoImageId` (quyết định `/clarify` câu 6) |
| **D83** | Sinh cả một đội | Sinh người bằng `sinhChiSo`, rồi **dùng lại `xepLaiKhiDoiSoDo`** để sinh bộ chiến thuật kèm theo — truyền cả đội vừa sinh vào làm **`oVienCu` giả** (một phần tử một người), vì hàm ấy lấy danh sách người từ tham số đó chứ không từ `cacCauThu`. Ô nào thuật toán không xếp nổi thì **lấp bằng người còn lại**, đúng cách `chonTheoSoDo` đang làm, để đội sinh ra đá được ngay. Tất cả trong một transaction như D82 | (a) Sinh người xong để người dùng tự xếp; (b) truyền `oVienCu = []` như `tacticRepo.ts:171` làm khi đội chưa có bộ chiến thuật | `/clarify` câu 1 đã chốt "sinh xong đá được ngay", nên (a) hỏng. (b) hỏng theo một cách lặng lẽ hơn: hàm sẽ trả về đội hình **toàn ô trống** — đã kiểm ở mục 0. Repo vốn có hai lối chọn người (`xepLaiKhiDoiSoDo` từ chối xếp ai vào ô sai mức `nang`; `chonTheoSoDo` ở `ChonCapDau.tsx:65` vét cho đủ quân số), nên việc ở đây là **chọn một** rồi nói rõ, chứ không phải viết lối thứ ba |
| **D84** | "Lý do chọn" của đội hình tự chọn | Lớp chọn ở `domain` trả thêm **mã lý do** cho từng ô; `ui` tra chữ. Bộ mã **đúng bằng** những gì thuật toán hiện tại phân biệt được: `'dung-so-truong'`, `'xep-sai-nhe'`, `'xep-sai-vua'`, `'lap-cho-trong'`, `'thieu-nguoi'` | (a) Trả thẳng câu tiếng Việt từ `domain`; (b) thêm mã `'chi-so-cao-nhat'` | (a) phạm P8 — nhãn hiển thị nằm trong `domain`, đúng cái bẫy mà D76 của spec 003 vừa dọn xong. (b) là mã **thuật toán không bao giờ sinh ra được**: `chiPhi()` chỉ đọc mức sai vị trí, không đọc chỉ số (mục 0). Sinh được nó đòi đổi luật phá hoà "giữ người đứng trước" — một luật có test khẳng định và có **ba** nơi gọi (`useTactic.ts:129`, `tacticRepo.ts:171`, `ChonCapDau.tsx:258`), nên đó là một spec khác, không phải một mã lý do |
| **D85** | Nội suy chuyển động | Tự viết: đường cong trơn qua các mốc, chạy theo nhịp vẽ của trình duyệt trong `San2D`; tốc độ mỗi điểm giãn theo `ben.theLuc` của người đó | (a) Thư viện animation; (b) CSS transition như hiện nay | (a) là một phụ thuộc mới cho 22 điểm — không đáng. (b) chính là thứ đang gây giật: CSS chỉ nội suy **thẳng** giữa hai giá trị, không cho đường cong và không cho mỗi điểm một tốc độ riêng |
| **D86** | Ngân sách của AC-25.9 | **Đo HAI đường, không một** | Chỉ đo đường "chạy ngay" như bản plan đầu | Bản đầu kết luận "đạt theo cấu trúc" vì `chayHetTran` là vòng lặp thuần engine, không vẽ gì ([useMatch.ts:151](../../src/hooks/useMatch.ts) gọi một lần rồi vẽ một lần) — kết luận ấy **đúng nhưng vô ích**: nó nói rằng con đường được đo là con đường duy nhất mà nội suy không chạy. `/analyze` ngày 2026-11-17 bắt chỗ này. Nên ngân sách thật gồm hai phép đo: (1) chạy ngay < 3 giây, giữ như cũ; (2) **đang phát theo đồng hồ** với 22 điểm nội suy — công việc mỗi khung gọn trong một nhịp ở mức Thường, không rơi nhịp ở mức Nhanh. Phép (2) mới là phép đo cái giá của phương án người dùng đã chọn |
| **D87** | Lọc danh sách cầu thủ | Lọc ở **tầng giao diện** trên mảng đã nạp | Thêm chỉ mục IndexedDB và lọc ở tầng lưu trữ | Một đội tối đa 30 người, đã nằm sẵn trong bộ nhớ. Thêm chỉ mục là tăng `DB_VERSION` và viết migration cho một việc mà vòng lặp `filter` làm xong trong micro-giây |
| **D88** | Thể lực thể hiện bằng gì trong chuyển động (AC-25.7) | Thể lực đổi **dáng** của cú chuyển chỗ, **không** đổi thời lượng: người kiệt sức xuất phát muộn hơn và đi phần lớn quãng đường sau người khoẻ, nhưng cả hai cùng tới đích đúng một lúc — tức đổi hàm giảm tốc (easing) chứ không đổi `thoiGianChuyen` | (a) Kéo dài thời lượng cú chuyển chỗ theo thể lực — cách đọc tự nhiên nhất của chữ "chậm hơn"; (b) rút ngắn quãng đường người kiệt sức đi được trong một nhịp | (a) **không khả thi**: `thoiGianChuyen` đã bằng 90% một nhịp đồng hồ, cụ thể 180ms / 63ms / **18ms** ở ba mức tốc độ, nên mọi hệ số lớn hơn 1,11 lần đều đẩy điểm sang quá tình huống kế tiếp và phá AC-25.3; ở mức Rất nhanh chỉ còn 2ms dư. (b) phá AC-25.2 — vị trí tại mốc phải đúng, không được "đi chưa tới". Lối còn lại là dáng chuyển động, và nó đủ: mắt đọc được độ trễ giữa hai điểm cùng xuất phát rõ hơn đọc được tốc độ tuyệt đối của một điểm |

## 4. Mô hình dữ liệu

**Không đổi `DB_VERSION`. Không đổi định dạng tệp sao lưu.**

| Thực thể | Đổi gì |
|---|---|
| `Team`, `Player`, `Tactic` | Không đổi. Đội nhân bản và đội sinh ngẫu nhiên là bản ghi **bình thường**, không có cờ nào đánh dấu nguồn gốc |
| `TranDaLuu` | Không đổi. Trận rẽ nhánh không vào đây (D79) |
| Trận rẽ nhánh | Không phải thực thể lưu trữ. Nó là một `TrangThaiTran` trong bộ nhớ cộng một tham chiếu tới trận gốc để so sánh |
| Kho tên | Hằng số trong mã nguồn, không phải dữ liệu người dùng |

## 5. Contracts

Những chữ ký mới đáng chú ý (chi tiết thuộc về lúc code):

- `domain/tenNgauNhien.ts` — hai kho tên theo thứ tiếng; `sinhTen(kho, rng)`.
- `domain/generator.ts` — thêm lớp sinh **một cầu thủ đầy đủ** (tên, tuổi,
  số áo, vị trí, chỉ số) và sinh **cả đội**; tất cả nhận `Rng` qua tham số.
- `domain/lineup.ts` — lớp chọn đội hình trả thêm **mã lý do** cho từng ô.
- `services/` — ánh xạ `TranDaLuu` → `CauHinhTran` (D78); nhân bản đội trong
  một transaction (D82); sinh đội trong một transaction (D83).
- `hooks/` — một hook điều phối rẽ nhánh: dựng lại tới phút X, nhận can
  thiệp mới, chạy nốt, giữ kết quả trong bộ nhớ.
- `ui/components/San2D.tsx` — `hinhSan` giữ nguyên chữ ký thuần; phần nội
  suy là một lớp vẽ bọc ngoài, nhận thêm thể lực.

## 6. Ánh xạ AC → thiết kế

| AC | Thiết kế đáp ứng |
|---|---|
| AC-24.1, AC-24.2 | Lớp sinh một cầu thủ đầy đủ, dựng trên `sinhChiSo` sẵn có (D83) |
| AC-24.3 | Lớp sinh nhận danh sách số áo đang dùng và loại trừ |
| AC-24.4 | Sinh người + `xepLaiKhiDoiSoDo` với cả đội làm `oVienCu` giả, ô không xếp nổi thì lấp bằng người còn lại (D83) |
| AC-24.5 | Nguồn ngẫu nhiên thật dựng ở `ui` mỗi lần bấm, đúng nếp `taoMaTran(RNG_THAT)` |
| AC-24.6 | Không có cờ "sinh ra" trên bản ghi; mọi màn hình sửa hiện có dùng được ngay (mục 4) |
| AC-24.7 | Một transaction duy nhất (D82, D83) |
| AC-24.8 | `ui` chọn kho tên theo ngôn ngữ đang chọn rồi truyền vào `domain` (D80) |
| AC-25.1 | Đường cong trơn qua các mốc (D85) |
| AC-25.2 | Nội suy chỉ vẽ **xen giữa** hai mốc; toạ độ tại mốc vẫn do `hinhSan` quyết định, không đổi |
| AC-25.3 | Thời lượng nội suy buộc theo nhịp đồng hồ trận, dùng lại `thoiGianChuyen` đã có |
| AC-25.4, AC-25.5 | Engine không đổi; nội suy nằm hoàn toàn ở lớp vẽ (D85, D86) |
| AC-25.6 | Kiểm thiết lập giảm chuyển động của hệ điều hành; bật thì bỏ nội suy, giữ nhảy theo mốc như hiện nay |
| AC-25.7 | Đổi **dáng** chuyển động của mỗi điểm theo `ben.theLuc` của chính người đó, giữ nguyên thời lượng (D88; thể lực đọc được từ trạng thái trận — khảo sát mục 0) |
| AC-25.8 | Nhãn chữ "kiệt sức" đã có sẵn trong dòng tường thuật; phương án bù của P9 |
| AC-25.9 | Hai phép đo ở lát cắt cuối: chạy ngay, **và** đang phát theo đồng hồ với 22 điểm nội suy (D86) |
| AC-26.1, AC-26.2 | Nhân bản tạo bản ghi **mới** hoàn toàn, không dùng chung id nào (D82) |
| AC-26.3 | Bản sao để trống ảnh; câu giải thích nằm ở lớp ngôn ngữ |
| AC-26.4, AC-26.6, AC-26.7 | Lọc ở tầng giao diện bằng `useMemo` (D87) |
| AC-26.5 | Dùng `chiSoTongTheoViTri`; giao diện nêu rõ đang tính theo vị trí nào |
| AC-26.8, AC-26.9 | Lớp chọn trả mã lý do cho từng ô và mã cho trường hợp thiếu người (D84) |
| AC-26.10 | Kết quả tự chọn ghi vào đúng chỗ mà thao tác tay vẫn ghi, nên sửa lại là việc đã có |
| AC-27.1 | Màn hình rẽ nhánh dựng từ bản ghi đã lưu (D78) + vòng lặp phát lại (D77) |
| AC-27.2, AC-27.4 | Hệ quả trực tiếp của P1: cùng đầu vào, cùng đầu ra. Có test riêng |
| AC-27.3 | Khối so sánh dùng lại cấu trúc báo cáo sau trận đã có |
| AC-27.5 | Dùng lại `matchRepo.lyDoKhongDauLai` — đã biết phân biệt phiên bản engine |
| AC-27.6 | Cùng chỗ trên: đã biết trường hợp đội bị xoá |
| AC-27.7 | Rẽ nhánh không ghi gì vào lưu trữ (D79) |
| AC-27.8 | Chặn ở lớp điều phối: phút hợp lệ nằm trong khoảng phút của trận gốc |
| AC-27.9 | Trạng thái chỉ trong bộ nhớ, cộng một lời hỏi trước khi rời màn hình |
| AC-27.10 | Màn hình rẽ nhánh không phơi ra lối vào rẽ nhánh lần nữa |

## 7. Chiến lược kiểm thử

- **Bắt buộc có test** (hiến pháp mục 4): lớp sinh ngẫu nhiên và lớp chọn
  đội hình ở `domain`; ánh xạ bản ghi → cấu hình trận và nhân bản đội ở
  `services`.
- **Ba test là xương sống của spec này:**
  1. Phát lại tới phút X rồi chạy nốt **không đổi gì** → dòng sự kiện giống
     hệt trận gốc, từng dòng (AC-27.4).
  2. Phát lại có đổi → phần **trước** điểm rẽ giống hệt (AC-27.2).
  3. Trận lưu từ trước spec này đấu lại bằng cùng mã trận → đúng kết quả cũ
     (AC-25.4). Đây là lưới duy nhất bắt được việc ai đó lỡ tay đụng engine.
- **Sinh ngẫu nhiên:** cùng một nguồn ngẫu nhiên cho ra cùng kết quả (P1);
  chỉ số nằm đúng dải của mức; số áo không trùng.
- **Giao diện** vẫn kiểm bằng tay, và lát cắt cuối đi đủ bốn tổ hợp
  2 ngôn ngữ × 2 chế độ.

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Hậu quả | Phương án |
|---|---|---|---|---|
| **R33** | Ai đó sửa engine để chiều một tính năng, làm mọi trận đã lưu mất nút đấu lại | Trung bình | **Cao** | Test số 3 ở mục 7 đỏ ngay. Spec và plan đều nói: gặp chỗ buộc phải đổi engine thì **dừng và hỏi**, không tự đổi |
| **R34** | Nội suy làm sai vị trí tại mốc, khiến tình huống "xảy ra" ở sai chỗ | Trung bình | Trung bình | AC-25.2 là phép kiểm tay riêng; nội suy chỉ được phép vẽ xen, không được quyền đổi toạ độ mốc do `hinhSan` tính |
| **R35** | Chuyển động theo thể lực thành kênh thông tin duy nhất, phạm P9 | Thấp | Trung bình | AC-25.8 cộng nhãn chữ "kiệt sức" đã có sẵn |
| **R36** | Sinh đội ra một đội vô lý (toàn tiền đạo, trùng số áo, tên lặp) | Trung bình | Thấp | AC-24.3, AC-24.4 có test; D81 cho đủ tổ hợp tên |
| **R37** | Người dùng tưởng trận rẽ nhánh đã được lưu, rời màn hình rồi mất | **Cao** | Trung bình | AC-27.9 bắt hỏi TRƯỚC khi rời. Đây là rủi ro về kỳ vọng, không phải về code — và là cái giá đã biết của quyết định "không lưu" |
| **R38** | Nhân bản đội không ảnh làm hai đội khó phân biệt khi đứng cạnh nhau | Trung bình | Thấp | Tên đội khác nhau (AC-26.1) và màu áo vẫn được chép; AC-26.3 bắt nói trước |

## 9. Thứ tự triển khai

Bảy lát cắt dọc, mỗi lát xong là dùng thử được ngay (P6).

| Lát | Nội dung | Xong thì dùng được gì |
|---|---|---|
| **29** | Kho tên + sinh **một** cầu thủ ngẫu nhiên, có test | Bấm một nút ra một cầu thủ đầy đủ trong form |
| **30** | Sinh **cả đội** kèm bộ chiến thuật, trong một transaction | Dựng xong một đội đá được từ màn hình danh sách đội |
| **31** | Nhân bản đội + lọc danh sách cầu thủ | Có đối chứng để so chiến thuật, và tìm được người |
| **32** | Tự chọn đội hình **kèm lý do** từng ô | Điền đội hình một nút, đọc được vì sao |
| **33** | Nội suy chuyển động trên sân 2D | Xem trận như một trận bóng |
| **34** | Đấu lại từ một phút bất kỳ + khối so sánh | Hỏi được "nếu lúc đó tôi làm khác" |
| **35** | Đi tay 4 tổ hợp, đo ngân sách mục 6, đóng spec | Spec 004 Done |

Hai lát **33** và **34** độc lập với nhau và với 29–32, nên thứ tự giữa
chúng đổi được nếu muốn thấy phần hấp dẫn sớm hơn.
