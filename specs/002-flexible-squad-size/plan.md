# Plan: Đội hình linh hoạt 5 tới 11 người

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Status** | Draft |
| **Updated** | 2026-11-01 |

> Sửa 2026-11-01 sau khi chẻ task: thêm **D64** cho chuyện một đội đá nhiều
> quân số thì bộ chiến thuật lưu ở đâu — lỗ hổng mà `/specify`, `/clarify` và
> bản đầu của plan đều không thấy.

> Tài liệu này mô tả **HOW**. Không thêm yêu cầu mới — nếu cần thì quay lại sửa `spec.md`.

Plan này đứng riêng trong thư mục của spec 002. `specs/001-football-team-sim/plan.md`
giữ nguyên là hồ sơ của spec 001; mọi quyết định D1–D51 ở đó **vẫn còn hiệu lực**
trừ chỗ plan này nói khác, và các quyết định mới đánh số tiếp từ **D52**.

## 1. Kiểm tra hiến pháp (Constitution check)

| Nguyên tắc | Tuân thủ? | Ghi chú |
|---|---|---|
| P1. Giả lập phải tái lập được | ⚠️ | Quân số thành tham số của trận nên **thứ tự và số lần tiêu thụ `Rng` đổi** — mã trận lưu từ trước không còn phát lại ra đúng trận cũ. Đây là ngoại lệ đã khai báo, bù bằng `PHIEN_BAN_ENGINE` lên 6 và giao diện chặn nút đấu lại kèm lý do (AC-16.3), đúng cách D35 đã xử hai lần trong spec 001. Tính tái lập **trong cùng một phiên bản** vẫn tuyệt đối. |
| P2. Luật bóng đá tách khỏi giao diện | ✅ | Quân số, thời lượng, ngưỡng huỷ trận, số lượt thay đều là luật → nằm trong `engine/` và `domain/`. Giao diện chỉ chọn và hiển thị. Bộ sơ đồ mới nằm ở `domain/formations.ts` như 8 sơ đồ hiện có. |
| P3. Dữ liệu người dùng là bất khả xâm phạm | ✅ | Không xoá, không ghi đè bản ghi nào. Đội và cầu thủ không đổi hình dạng. Trận đã lưu thiếu hai trường mới thì **đọc ra mặc định 11 người / 90 phút**, không sửa bản ghi cũ. |
| P4. Chạy offline, dữ liệu không ra khỏi máy | ✅ | Không thêm phụ thuộc mạng nào. |
| P5. Mỗi AC dạng so sánh phải có một test chứng minh | ⚠️ | Spec này sinh ra **một** AC dạng so sánh mới: AC-15.4 (quân số thấp hơn → nhiều cú sút và cơ hội rõ ràng hơn). Phải có test riêng in ra số đo, như `sosanh.*.test.ts` của spec 001. Đánh dấu ⚠️ vì đây là rủi ro thiết kế cao nhất — xem R25. |
| P6. Mỗi giai đoạn bàn giao phải tự chạy được | ✅ | Bốn lát cắt dọc ở mục 9, lát nào xong cũng cho ra một ứng dụng chạy được và dùng thử được. |
| P7. Tệp sao lưu phải mở lại được sau khi ứng dụng lớn lên | ✅ | `SCHEMA_VERSION` lên 5 kèm một bước migration điền 11 người / 90 phút cho trận cũ (AC-16.4). Khung migration đã có sẵn từ spec 001. |
| P8. Giao diện và thuật ngữ bằng tiếng Việt | ✅ | Mọi chữ mới vào `ui/strings.ts`. Tên sơ đồ là dãy số nên không phải dịch. |
| P9. Không bắt buộc phải dùng chuột, và chữ phải đọc được | ✅ | Ô chọn quân số và ô chọn thời lượng là `<select>` chuẩn, thao tác được bằng bàn phím. Sân 2D nhỏ lại vẫn giữ `<title>` từng điểm và dấu ▲ cho người tham gia. |

**Ngoại lệ xin miễn trừ:** P1 — đổi thứ tự tiêu thụ `Rng`. Phương án bù: tăng
`PHIEN_BAN_ENGINE`, chặn đấu lại với trận cũ kèm câu giải thích, và **không**
đụng tới bản ghi đã lưu để chúng vẫn xem lại được nguyên vẹn.

## 2. Bối cảnh kỹ thuật

- **Ngôn ngữ/runtime:** không đổi — React 18 + TypeScript strict + Vite + Vitest, IndexedDB qua `idb`.
- **Phụ thuộc mới:** **Không.** Mọi thứ dựng được từ thư viện đang có.
- **Vùng code bị chạm:**
  - `src/domain/formations.ts` — bộ sơ đồ mới cho quân số 5–10
  - `src/domain/lineup.ts` — xếp lại khi đổi sơ đồ, hiện giả định 11 ô
  - `src/services/tacticRepo.ts` — lấy/sinh bộ chiến thuật theo quân số (D64)
  - `src/ui/pages/TrangChienThuat.tsx` — ô chọn quân số
  - `src/engine/batDau.ts` — `SO_CAU_THU_CHINH`, `SO_CAU_THU_DU_BI`
  - `src/engine/tran.ts` — thời lượng hiệp, lượt thay, ngưỡng huỷ trận, phiên bản engine
  - `src/engine/suKien.ts` — mật độ dòng theo thời lượng
  - `src/ui/components/San2D.tsx` — khung sân theo quân số
  - `src/ui/pages/ChonCapDau.tsx` — ô chọn quân số và thời lượng
  - `src/storage/db.ts`, `src/services/matchRepo.ts`, `src/services/backupSchema.ts` — hai trường mới trong bản ghi trận
  - `src/ui/pages/TrangLichSu.tsx` — hiển thị quân số và thời lượng

## 3. Kiến trúc giải pháp

Hướng chung: **không có hệ thống mới nào**. Spec này gỡ bốn con số đang đóng
cứng — quân số, số dự bị, số lượt thay, thời lượng hiệp — rồi đẩy chúng thành
tham số đi theo `CauHinhTran`, và bổ sung dữ liệu sơ đồ cho các quân số mới.

```
Người dùng chọn quân số n + thời lượng T  (ChonCapDau)
            │
            ▼
   CauHinhTran { quanSo: n, thoiLuongHiep: T/2, ... }
            │
            ├─► batDau.kiemTra     : cần đúng n chính, 0..7 dự bị
            ├─► domain/formations  : chỉ những sơ đồ có đúng n ô
            ├─► engine/tran        : hiệp dài T/2; lượt thay = duBi.length;
            │                        huỷ trận khi trenSan.length < 0.6·n
            ├─► engine/suKien      : trần/sàn số dòng nhân (T/90)
            └─► ui/San2D           : khung sân tra theo n
                        │
                        ▼
              TranDaLuu { quanSo, thoiLuong } → lịch sử hiển thị
```

**Quyết định thiết kế:**

| # | Quyết định | Phương án đã chọn | Phương án loại bỏ | Lý do |
|---|---|---|---|---|
| **D52** | Quân số và thời lượng sống ở đâu | Hai trường mới của `CauHinhTran`, đi theo trận | Thuộc tính của `Team`; một store cấu hình riêng | Spec chốt quân số là của TRẬN. Để ở `CauHinhTran` thì `taoTran` nhận được ngay, `dangKyTuTrangThai` và `cauHinhDauLai` dựng lại được, và không bản ghi đội nào phải đổi hình dạng |
| **D53** | Sơ đồ quân số nhỏ lấy từ đâu | **Khai tay theo bảng**, dùng lại nguyên mô hình `Formation` hiện có (`cacDai` + `dai` + `x`/`y` phần trăm) | Sinh thuật toán từ số người; để người dùng tự đặt ô | Mô hình hiện có đã đủ diễn đạt; sinh thuật toán cho ra sơ đồ không tên và không hồn, mà tên sơ đồ chính là thứ người chơi bóng dùng để nói chuyện. Tự đặt ô đã bị spec loại |
| **D54** | `FormationId` khi có nhiều quân số | Giữ id là **tên sơ đồ trần** (`'2-2'`, `'2-3-1'`), thêm trường `soNguoi` suy từ `oVien.length`, và một test khẳng định id duy nhất toàn cục | Tiền tố quân số trong id (`'7:2-3-1'`) | Id trần nghĩa là **không phải migrate** bộ chiến thuật nào đang lưu — `'4-4-2'` cũ vẫn trỏ đúng. Tiền tố thì phải cắt chuỗi mỗi lần hiển thị và phải nâng cấp mọi bản ghi `Tactic` |
| **D55** | Lưới vùng của engine | **Giữ nguyên 3 cột × 4 dải** cho mọi quân số | Lưới co theo quân số | Mọi hằng số xác suất của `chuoiBong.ts` đã hiệu chỉnh trên lưới này. Đổi lưới là hiệu chỉnh lại toàn bộ engine, và AC-15.4 sẽ không còn so sánh được giữa hai quân số vì hai bên đo trên hai thước khác nhau |
| **D56** | Hình sân 2D nhỏ lại thế nào | Bảng tra `KHUNG_SAN[n] = { rong, cao }`, giữ nguyên `X_THEO_DAI`/`Y_THEO_COT` dạng **tỉ lệ** của khung | Vẽ cùng một khung cho mọi n; tính khung theo công thức | Toạ độ ô vốn đã là phần trăm (D15), nên chỉ cần đổi khung. Bảng tra đọc được và chỉnh tay được; công thức cho ra những con số không ai kiểm bằng mắt |
| **D57** | Dự bị và lượt thay | `SO_CAU_THU_DU_BI` thành **khoảng 0..7**; `SO_LAN_THAY_TOI_DA` bỏ hẳn, thay bằng `duBi.length` | Giữ hằng số 5 lượt; thêm một hằng số lượt thay theo quân số | Spec chốt lượt thay bằng đúng số dự bị. Bỏ hằng số đi thì không bao giờ còn cảnh báo "còn 5 lượt" khi ghế chỉ có 2 người |
| **D58** | Ngưỡng huỷ trận | Điều kiện `trenSan.length < 0.6 * quanSo` | Bảng tra ngưỡng theo từng quân số; một con số cố định | Một bất đẳng thức duy nhất cho ra đúng luật thật ở cả hai đầu dải: n=11 → dừng khi còn dưới 6,6 tức ≤ 6 (luật FIFA: dưới 7); n=5 → dừng khi còn dưới 3 (luật futsal). Không cần bảng tra nào |
| **D59** | Thời lượng vào engine thế nào | `PHUT_MOI_HIEP` từ hằng số thành trường `phutMoiHiep` của trạng thái trận; bù giờ giữ nguyên 1–5 phút mỗi hiệp | Giữ 90 phút rồi nhân tỉ lệ lúc hiển thị | Nhân lúc hiển thị là nói dối: dòng sự kiện vẫn sinh ra cho 90 phút, thể lực vẫn tụt theo 90 phút. Thời lượng phải thật từ trong engine |
| **D60** | Mật độ dòng khi thời lượng đổi | `SO_DONG_TOI_THIEU`/`SO_DONG_TOI_DA` thành hàm của thời lượng, nhân hệ số `T/90` rồi làm tròn | Giữ 60–100 cho mọi T | Spec chốt co theo tỉ lệ. Giữ nguyên thì trận 20 phút dày đặc sự kiện, đọc như bản highlight chứ không như một trận đấu |
| **D61** | Trận đã lưu thiếu hai trường mới | Đọc ra **mặc định 11 người / 90 phút**, không sửa bản ghi cũ; `DB_VERSION` **không tăng** | Tăng `DB_VERSION` và ghi lại toàn bộ bản ghi cũ | Thêm trường vào bản ghi không đòi đổi store hay index, nên IndexedDB không cần lên phiên bản. Mỗi lần tăng `DB_VERSION` là một lần không lùi được bằng `git revert` — tránh được thì tránh |
| **D62** | Tệp sao lưu | `SCHEMA_VERSION` lên **5**, bước nâng điền 11 người / 90 phút cho mọi trận trong tệp cũ | Không tăng, để trường khuyết | P7 đòi tệp cũ mở lại được **và** đúng nghĩa. Điền tường minh thì về sau không ai phải đoán trường khuyết nghĩa là gì |
| **D64** | Bộ chiến thuật cho nhiều quân số | **Suy từ chính sơ đồ của bộ**: "bộ của quân số n" là bộ có `formationId` trỏ tới sơ đồ `soNguoi === n`. Không thêm trường nào; `activeTacticId` vẫn là bộ 11 người, giữ tương thích ngược | Thêm trường `quanSo` vào `Tactic`; thêm bảng "bộ đang dùng theo quân số" vào `Team` | Kho `tactics` đã có index `byTeam` và vốn chứa nhiều bộ mỗi đội, nên cấu trúc lưu trữ **không phải đổi gì**. Thêm trường là thêm một nguồn sự thật thứ hai có thể lệch với `formationId` |
| **D63** | Bộ sơ đồ cần dựng | 12 sơ đồ mới cho quân số 5–10, cộng 8 sơ đồ 11 người đã có | Chỉ làm 5 và 7 rồi suy ra phần còn lại | Spec đòi ít nhất hai sơ đồ cho **mỗi** giá trị n từ 5 tới 11. Không có giá trị nào được bỏ trống, nếu không ô chọn quân số sẽ có những mức chọn vào là bế tắc |

**Bộ sơ đồ dự kiến (D63)** — mỗi dòng là `tên (các dải ngoài sân)`:

| Quân số | Sơ đồ 1 | Sơ đồ 2 |
|---|---|---|
| 5 | `2-2` | `1-2-1` |
| 6 | `2-3` | `3-2` |
| 7 | `2-3-1` | `3-2-1` |
| 8 | `3-3-1` | `2-3-2` |
| 9 | `3-3-2` | `3-4-1` |
| 10 | `4-3-2` | `3-4-2` |
| 11 | *(8 sơ đồ đã có)* | |

## 4. Mô hình dữ liệu

Không có store mới, không có index mới, **`DB_VERSION` giữ nguyên 3** (D61).

```
CauHinhTran            + quanSo: number          // 5..11
                       + phutMoiHiep: number     // 10 | 15 | 22.5? -> xem dưới

TrangThaiTran          + quanSo: number
                       + phutMoiHiep: number

TomTatTran (lưu trữ)   + quanSo?: number         // khuyết => 11
                       + thoiLuong?: number      // khuyết => 90

Formation              + soNguoi: number         // suy từ oVien.length
FormationId            mở rộng union thêm 12 tên sơ đồ mới
```

**Thời lượng và hiệp:** các mức spec chốt là 20, 30, 45, 60, 90 phút. Chia đôi
cho hai hiệp thì 45 phút ra 22,5 — số lẻ. Phương án: lưu **tổng thời lượng**
là con số người dùng chọn, còn `phutMoiHiep = Math.floor(T / 2)` và hiệp hai
gánh phần lẻ. Mức 45 phút thành hiệp 1 dài 22 phút, hiệp 2 dài 23 phút. Đây là
chi tiết kỹ thuật, không đổi gì trong spec.

**Migration tệp sao lưu:** `nangV4LenV5` điền `quanSo: 11`, `thoiLuong: 90` cho
mọi trận trong tệp cũ.

## 5. Contracts (API / Server Actions / types)

| Tên | Input | Output | Lỗi có thể xảy ra |
|---|---|---|---|
| `soDoTheoQuanSo(n)` | `number` | `readonly Formation[]` | — (n ngoài 5..11 thì trả mảng rỗng, giao diện không cho chọn) |
| `kiemTraBatDau(cauHinh)` | `CauHinhTran` | `KetQuaKiemTraBatDau` | `chua-du-chinh`, `chua-dung-du-bi` *(đổi nghĩa: nay là "quá 7")*, `doi-hinh-chua-du`, `cung-mot-doi` |
| `xepLaiKhiDoiSoDo(...)` | thêm tham số số ô đích | `KetQuaXepLai` | — |
| `nguongHuyTran(quanSo)` | `number` | `number` | — |
| `khoangSoDong(thoiLuong)` | `number` | `{ toiThieu, toiDa }` | — |
| `khungSan(quanSo)` | `number` | `{ rong, cao }` | — |

## 6. Ánh xạ AC → thiết kế

| AC | Được đáp ứng bởi |
|---|---|
| AC-12.1 | Ô chọn quân số ở `ChonCapDau`, ghi vào `CauHinhTran.quanSo`, áp cho cả hai bên |
| AC-12.1b | D52 — quân số không nằm trong `Team` nên đội nào cũng đá được mọi quân số |
| AC-12.2 | Giá trị mặc định `quanSo = 11` của ô chọn |
| AC-12.3 | `batDau.kiemTraBatDau` trả `chua-du-chinh` kèm `soCo`/`soCan`, giao diện dựng câu |
| AC-12.4 | `TomTatTran.quanSo` + cột mới ở `TrangLichSu` |
| AC-12.5 | Ô chọn thời lượng ở `ChonCapDau`, năm mức dựng sẵn, mặc định 90 |
| AC-12.6 | `TomTatTran.thoiLuong` + cột mới ở `TrangLichSu` |
| AC-13.1 | `soDoTheoQuanSo(n)` lọc theo `Formation.soNguoi`; `TM` của mỗi sơ đồ đúng một ô |
| AC-13.2 | D63 — bảng 12 sơ đồ mới, cộng test đếm ≥ 2 sơ đồ cho mỗi n |
| AC-13.3 | `xepLaiKhiDoiSoDo` hiện có, mở rộng để nhận số ô đích khác 11 |
| AC-13.4 | Mỗi ô trong bảng sơ đồ khai `viTri` như 8 sơ đồ hiện có |
| AC-13.5 | Trường `ten` của `Formation`, vốn đã là dãy số |
| AC-13.6 | Ô chọn quân số ở `TrangChienThuat`; `tacticRepo` lấy bộ theo `(teamId, quanSo)` (D64) |
| AC-13.7 | `tacticRepo.layHoacTao(teamId, n)` — sinh bộ mặc định với sơ đồ đầu tiên của quân số n |
| AC-14.1 | `SO_CAU_THU_CHINH` → `cauHinh.quanSo`; dự bị kiểm theo khoảng 0..7 |
| AC-14.1b | Bỏ điều kiện `duBi.length !== 7`, thay bằng `duBi.length > 7` |
| AC-14.2 | `tinhTrangDoiHinh` của `domain/lineup.ts` — không đổi, đã kiểm thủ môn |
| AC-14.3 | Bỏ `SO_LAN_THAY_TOI_DA`, lượt thay đọc từ `duBi.length` (D57) |
| AC-14.3b | `ThayNguoi` vô hiệu hoá khi `duBi.length === 0`, kèm câu ở `strings.ts` |
| AC-14.4 | Luật thẻ đỏ hiện có, không đổi |
| AC-14.5 | `nguongHuyTran` + kiểm trong `buocTiep` sau khi áp thẻ đỏ (D58) |
| AC-14.6 | Loại sự kiện mới `huy-tran` + cờ trên `TrangThaiTran`, `matchRepo.luu` vẫn lưu như trận thường |
| AC-15.1 | `San2D` vẽ theo `ben.trenSan` thay vì giả định 11 |
| AC-15.2 | `lechTrongVung` hiện có đã giãn người cùng vùng; test đếm số điểm phân biệt được |
| AC-15.3 | `dungBaoCao` dựng từ `theoCauThu`, vốn đã theo người thật |
| AC-15.4 | **Test so sánh riêng** `sosanh.quanSo.test.ts` (P5) |
| AC-15.5 | `khoangSoDong(thoiLuong)` thay hai hằng số của `suKien.ts` (D60) |
| AC-15.6 | `khungSan(quanSo)` (D56) |
| AC-16.1 | Không đụng store nào; `DB_VERSION` giữ nguyên (D61) |
| AC-16.2 | Bản ghi cũ đọc ra với mặc định 11/90, dòng sự kiện giữ nguyên |
| AC-16.3 | `lyDoKhongDauLai` hiện có, so `phienBanEngine` — chỉ cần tăng lên 6 |
| AC-16.4 | `nangV4LenV5` (D62) |

**32/32 AC đều có chỗ hiện thực.**

## 7. Chiến lược kiểm thử

- **Unit:**
  - `formations`: mỗi sơ đồ có đúng một ô thủ môn, tổng `cacDai` bằng `soNguoi - 1`, mọi `x`/`y` trong 0..100, `slotId` không trùng trong một sơ đồ, `id` không trùng trên toàn bảng, mỗi n từ 5 tới 11 có ≥ 2 sơ đồ.
  - `batDau`: đủ/thiếu người chính theo từng quân số; 0 dự bị hợp lệ; 8 dự bị bị chặn.
  - `tran`: lượt thay bằng số dự bị; huỷ trận đúng ngưỡng ở n=5 và n=11; thời lượng hiệp đúng với từng mức.
  - `suKien`: số dòng co đúng tỉ lệ ở từng mức thời lượng.
- **Integration:** vòng tròn lưu → đọc một trận quân số nhỏ; nhập tệp sao lưu v4 rồi đọc ra 11/90.
- **So sánh (P5):** `sosanh.quanSo.test.ts` — cùng cặp đội, cùng bộ mã trận, chạy ở n=5 và n=11, in ra số cú sút và số cơ hội rõ ràng trung bình mỗi trận. Mẫu bắt đầu từ 40 mã; nếu hai con số chưa tách thì **rộng mẫu, không hạ ngưỡng**, đúng kỷ luật của spec 001.
- **Thủ công:** mỗi quân số từ 5 tới 11 chạy trọn một trận (Definition of Done đòi); xem sân 2D ở n=5 đếm đủ 10 điểm; thay người khi ghế trống; ép một trận tới ngưỡng huỷ.

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Mức | Phương án lùi |
|---|---|---|---|
| **R23** | 12 bộ toạ độ dựng tay — sai một ô thì sơ đồ méo mà test thường không thấy | Trung bình | Test đối chiếu `cacDai` với tên sơ đồ và khoảng toạ độ; kiểm tay bằng mắt trên trang chiến thuật cho từng sơ đồ mới |
| **R24** | Mã trận cũ hết phát lại đúng | Thấp | Đã chấp nhận; bù bằng `PHIEN_BAN_ENGINE` 6 và câu giải thích. Lịch sử vẫn xem lại được |
| **R25** | **AC-15.4 có thể không tự nhiên đúng chiều** — engine chưa chắc cho ra nhiều cơ hội hơn khi ít người, vì lưới vùng không đổi và sức mạnh đội tính trung bình theo đầu người | **Cao** | Nếu đo ra sai chiều: thêm một hệ số "khoảng trống theo quân số" vào `chuoiBong.ts`, giảm xác suất mất bóng khi n nhỏ. Phải đo **trước** khi viết giao diện, ở ngay lát 1 |
| **R26** | Trận 20 phút có thể không sinh đủ dòng cho sàn đã co | Trung bình | `SO_CHUOI_MOI_PHUT` nâng theo quân số nhỏ, hoặc hạ sàn cho các mức thời lượng ngắn — quyết sau khi đo |
| **R27** | `xepLaiKhiDoiSoDo` đang giả định 11 ô ở nhiều chỗ, sửa sót một chỗ thì mất người lúc đổi sơ đồ | Trung bình | Đổi chữ ký hàm để số ô là **tham số bắt buộc**, không có giá trị mặc định — trình biên dịch sẽ chỉ ra mọi chỗ gọi |

## 9. Thứ tự triển khai (lát cắt dọc)

| Lát | Nội dung | Chạy được gì sau lát này |
|---|---|---|
| **Lát 18** | Quân số vào engine: `CauHinhTran.quanSo`, `batDau` theo quân số, dự bị 0..7, lượt thay theo ghế, ngưỡng huỷ trận. **Kèm `sosanh.quanSo.test.ts` để đo R25 ngay** | Engine chạy được trận 5–11 người qua test; giao diện chưa đổi |
| **Lát 19** | 12 sơ đồ mới + lọc sơ đồ theo quân số + `xepLaiKhiDoiSoDo` nhận số ô | Trang chiến thuật xếp được đội hình mọi quân số |
| **Lát 20** | Giao diện trận: ô chọn quân số và thời lượng, thời lượng vào engine, mật độ dòng co theo tỉ lệ, sân 2D theo khung | Chơi trọn một trận sân 5 từ giao diện |
| **Lát 21** | Lưu trữ và lịch sử: hai trường mới, hiển thị, migration tệp v5, `PHIEN_BAN_ENGINE` lên 6, kiểm tay từng quân số | Đóng spec 002 |

Rủi ro cao nhất (R25) được đo ở **lát đầu tiên**, trước khi bất cứ thứ gì phụ
thuộc vào nó được xây — nếu engine không cho ra đúng chiều thì phải chỉnh hệ số
ngay, lúc chưa có giao diện nào phải sửa theo.
