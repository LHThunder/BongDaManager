# Tasks: Đội hình linh hoạt 5 tới 11 người

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 33 AC (US-12 → US-16) |
| **Tiến độ** | 2/24 |
| **Sửa đổi** | 2026-11-01 — chẻ lần đầu từ plan (D64 phát sinh lúc chẻ), rồi sửa theo cả 7 phát hiện của `/analyze` |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Số task bắt đầu từ **T200** để không lẫn với T001–T136 của spec 001. Bốn phase
dưới đây là bốn lát cắt dọc ở `plan.md` mục 9; mỗi phase kết thúc là một ứng
dụng chạy được (hiến pháp P6), và là một commit.

---

## Phase 18 — Lát 18: Quân số vào engine

> Lát này **đo rủi ro cao nhất trước khi xây gì lên trên nó**. T205 là phép đo
> R25; nếu nó đỏ thì dừng cả phase, vì mọi thứ sau đều dựa vào giả định mà nó
> đang kiểm.

- [x] **T200** — Quân số thành tham số của trận
  - File: sửa `src/engine/tran.ts`, sửa `src/engine/tran.test.ts`
  - Xong khi: `CauHinhTran` và `TrangThaiTran` mang `quanSo`; `taoTran` nhận và cất; `dangKyTuTrangThai` và `cauHinhDauLai` dựng lại đúng giá trị; `npx tsc --noEmit` sạch; test xanh — tạo trận `quanSo: 5` thì `tt.quanSo === 5`, và trận không khai quân số thì mặc định 11.
  - AC: AC-12.1, AC-12.1b
  - Phụ thuộc: —

- [x] **T206** — Mô hình sơ đồ nhận nhiều quân số *(chuyển từ Phase 19 lên)*
  - File: sửa `src/domain/formations.ts`, sửa `src/domain/formations.test.ts`, sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: `Formation.soNguoi` suy từ `oVien.length`; `soDoTheoQuanSo(n)` lọc đúng; test bất biến chạy cho **mọi** sơ đồ trong bảng thay vì đóng cứng 11 ô và tổng `cacDai` bằng 10 — đúng một ô thủ môn, tổng `cacDai` bằng `soNguoi - 1`, mọi `x`/`y` trong 0..100, `slotId` không trùng trong một sơ đồ, `id` không trùng trên toàn bảng. Danh sách sơ đồ ở trang chiến thuật **chỉ hiện sơ đồ cùng quân số với bộ đang mở**, để sơ đồ 5 ô không lọt vào giao diện 11 người.
  - AC: AC-13.1
  - Phụ thuộc: T200

- [ ] **T201** — Sơ đồ `2-2` và fixture đội hình theo quân số
  - File: sửa `src/domain/formations.ts`, sửa `src/engine/__fixtures__/doiMau.ts`
  - Xong khi: sơ đồ `2-2` có đủ 5 ô kèm toạ độ và vai trò; `benMauQuanSo(teamId, n)` dựng được đăng ký cho **n = 5 và n = 11**; test xanh — `chayHetTran` ở n=5 cho ra một trận có người trên sân và có dòng sự kiện, không phải sân trống.
  - AC: — *(hạ tầng cho T202–T205)*
  - Phụ thuộc: T206
  - **Sửa sau khi /implement đụng code thật.** Bản đầu viết "fixture KHÔNG đọc bảng `FORMATIONS`" — không làm được: `doiHinhTrenSan` (`tran.ts:412`) lấy vị trí của từng ô **từ bảng sơ đồ**, còn bộ chiến thuật chỉ giữ `slotId → playerId`. Đăng ký trỏ tới một `formationId` không có trong bảng sẽ cho `doiHinhTrenSan` trả mảng **rỗng** — trận 5 người không có ai trên sân, mà không ném lỗi nào. Nên phải có đúng một sơ đồ 5 ô trước khi đo được R25; mười một sơ đồ còn lại vẫn ở lát 19.

- [ ] **T202** — `batDau` kiểm theo quân số, dự bị 0 tới 7
  - File: sửa `src/engine/batDau.ts`, sửa `src/engine/batDau.test.ts`
  - Xong khi: `SO_CAU_THU_CHINH` nhường chỗ cho `cauHinh.quanSo`; dự bị chỉ bị chặn khi **nhiều hơn 7**; test xanh — n=5 với 5 chính + 0 dự bị bắt đầu được, 8 dự bị bị chặn, thiếu thủ môn vẫn bị chặn ở mọi n, và thiếu người chính thì báo đúng `soCo`/`soCan`.
  - AC: AC-12.3, AC-14.1, AC-14.1b, AC-14.2
  - Phụ thuộc: T201

- [ ] **T203** [P] — Lượt thay người bằng số dự bị
  - File: sửa `src/engine/tran.ts`, sửa `src/engine/canThiep.test.ts`
  - Xong khi: `SO_LAN_THAY_TOI_DA` bị **xoá hẳn**, số lượt còn lại suy từ `duBi.length`; test xanh — đăng ký 2 dự bị thì lượt thứ 3 bị từ chối, đăng ký 0 dự bị thì mọi yêu cầu thay người bị từ chối ngay với lý do rõ.
  - AC: AC-14.3, AC-14.3b *(phần engine)*
  - Phụ thuộc: T201

- [ ] **T204** [P] — Huỷ trận khi một bên còn dưới 60% quân số
  - File: sửa `src/engine/tran.ts`, sửa `src/engine/suKien.ts`, sửa `src/engine/the.test.ts`
  - Xong khi: `nguongHuyTran(quanSo)` và điều kiện `trenSan.length < 0.6 * quanSo`; loại sự kiện `huy-tran` kèm mẫu câu; cờ trên trạng thái để giao diện biết; test xanh — n=11 dừng khi còn 6 người và **không** dừng ở 7, n=5 dừng khi còn 2 và **không** dừng ở 3; thẻ đỏ ở mọi quân số vẫn là đá thiếu người chứ không được thay bù.
  - AC: AC-14.4, AC-14.5, AC-14.6
  - Phụ thuộc: T201

- [ ] **T205** — **Đo R25**: quân số thấp hơn có nhiều cơ hội hơn không
  - File: tạo `src/engine/sosanh.quanSo.test.ts`
  - Xong khi: cùng một bộ mã trận, chạy ở n=5 và n=11 trên sân trung lập, **in ra** số cú sút và số cơ hội rõ ràng trung bình mỗi trận ở từng quân số; test khẳng định n thấp hơn cho con số **cao hơn**. Mẫu bắt đầu 40 mã; chưa tách thì **rộng mẫu, không hạ ngưỡng**.
  - AC: AC-15.4
  - Phụ thuộc: T201, T202
  - **Nếu test này đỏ thì DỪNG phase và báo người dùng.** Đó chính là R25 hiện ra: engine không tự nhiên cho ra chiều mà spec đã chốt, và cách chữa (thêm hệ số khoảng trống theo quân số vào `chuoiBong.ts`) là một thay đổi engine phải được đồng ý trước, không phải thứ tiện tay làm.

---

## Phase 19 — Lát 19: Sơ đồ cho mọi quân số

- [ ] **T207** [P] — Năm sơ đồ còn lại cho quân số 5, 6, 7
  - File: sửa `src/domain/formations.ts`
  - Xong khi: `1-2-1`, `2-3`, `3-2`, `2-3-1`, `3-2-1` có đủ toạ độ và vai trò từng ô (`2-2` đã làm ở T201); test bất biến của T206 xanh; mở trang chiến thuật nhìn thấy hình sơ đồ cân đối, không ô nào đè ô nào.
  - AC: AC-13.2, AC-13.4, AC-13.5
  - Phụ thuộc: T206

- [ ] **T208** [P] — Sáu sơ đồ cho quân số 8, 9, 10
  - File: sửa `src/domain/formations.ts`
  - Xong khi: `3-3-1`, `2-3-2`, `3-3-2`, `3-4-1`, `4-3-2`, `3-4-2` có đủ toạ độ và vai trò; test bất biến xanh; kiểm mắt như T207.
  - AC: AC-13.2, AC-13.4, AC-13.5
  - Phụ thuộc: T206

- [ ] **T209** — Xếp lại đội hình khi số ô đổi
  - File: sửa `src/domain/lineup.ts`, sửa `src/domain/lineup.test.ts`
  - Xong khi: test xanh — đổi từ sơ đồ 11 ô sang 5 ô giữ lại 5 người khớp vị trí nhất và nêu đúng 6 người bị đẩy ra ngoài; chú thích sai "Đúng 11 ô" của `KetQuaXepLai` được sửa.
  - AC: AC-13.3, AC-13.3b
  - Phụ thuộc: T206
  - **`/analyze` soát ra: hàm này KHÔNG phải sửa logic.** `xepLaiKhiDoiSoDo` và `tinhTrangDoiHinh` đã lấy số ô từ `laySoDo(...).oVien`, chỉ chú thích là nói sai. Rủi ro R27 của plan đã bị gỡ.

- [ ] **T210** — Bộ chiến thuật theo quân số
  - File: sửa `src/services/tacticRepo.ts`, sửa `src/services/tacticRepo.test.ts`
  - Xong khi: `layHoacTao(teamId, quanSo)` trả bộ của đúng quân số đó; chưa có thì sinh bộ mặc định với sơ đồ đầu tiên của quân số **và khớp sẵn người từ đội hình đang có** (AC-13.3) thay vì để rỗng trơn; test xanh — gọi hai lần cùng `(đội, quân số)` ra cùng một bộ, bộ sân 5 và bộ sân 11 của cùng một đội là **hai bản ghi khác nhau và không đụng vào nhau**, và bộ sân 5 sinh lần đầu đã có sẵn 5 người hợp lý.
  - AC: AC-13.6, AC-13.7
  - Phụ thuộc: T206
  - Theo D64: quân số của một bộ **suy từ `formationId`**, không thêm trường nào, không đổi cấu trúc lưu trữ.

- [ ] **T211** — Trang chiến thuật chọn quân số
  - File: sửa `src/ui/pages/TrangChienThuat.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: có ô chọn quân số; đổi quân số thì mở bộ của quân số đó; danh sách sơ đồ chỉ hiện sơ đồ đúng quân số; **xếp đội hình sân 5 rồi quay lại sân 11 thấy đội hình 11 người còn nguyên** — kiểm tay.
  - AC: AC-13.1, AC-13.6
  - Phụ thuộc: T207, T208, T209, T210

---

## Phase 20 — Lát 20: Giao diện trận, thời lượng, sân 2D

- [ ] **T212** — Thời lượng trận vào engine
  - File: sửa `src/engine/tran.ts`, sửa `src/engine/tran.test.ts`
  - Xong khi: `phutMoiHiep` là trường của trạng thái thay cho hằng số; tổng thời lượng bằng mức đã chọn, hiệp hai gánh phần lẻ; test xanh — mức 45 cho hiệp 1 dài 22 và hiệp 2 dài 23, mức 90 giữ **nguyên vẹn** mọi số đo cũ.
  - AC: AC-12.5 *(phần engine)*
  - Phụ thuộc: T200

- [ ] **T213** — Mật độ dòng tường thuật co theo thời lượng
  - File: sửa `src/engine/suKien.ts`, sửa `src/engine/suKien.test.ts`
  - Xong khi: `khoangSoDong(thoiLuong)` thay hai hằng số; test xanh — 90 phút cho 60–100 dòng, 45 phút cho 30–50, và một trận 20 phút chạy thật sinh ra số dòng nằm trong khoảng của chính nó.
  - AC: AC-15.5
  - Phụ thuộc: T212

- [ ] **T214** [P] — Khung sân 2D theo quân số
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: bảng tra `KHUNG_SAN[n]`; sân n=5 ngắn và hẹp hơn sân n=11; đếm đúng **2n** điểm, không điểm nào đè khít điểm khác; kiểm mắt trên một trận sân 5 thật.
  - **`/analyze` soát ra:** phần đếm 2n điểm **không phải sửa code** — `San2D` đã vẽ theo `oVien` lọc bởi `trenSan`. AC-15.1 và AC-15.2 chỉ cần test chứng minh; việc thật chỉ là khung sân (AC-15.6).
  - AC: AC-15.1, AC-15.2, AC-15.6
  - Phụ thuộc: T200

- [ ] **T215** — Màn chọn cặp đấu: quân số và thời lượng
  - File: sửa `src/ui/pages/ChonCapDau.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: hai ô chọn với mặc định **11 người** và **90 phút**; chọn quân số thì lấy đúng bộ chiến thuật của quân số đó cho cả hai đội; đội thiếu người thì báo rõ đội nào thiếu bao nhiêu và chặn bắt đầu.
  - AC: AC-12.1, AC-12.2, AC-12.3, AC-12.5
  - Phụ thuộc: T202, T210, T212

- [ ] **T216** [P] — Vô hiệu hoá thay người khi ghế trống
  - File: sửa `src/ui/components/ThayNguoi.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: đăng ký 0 dự bị thì khối thay người hiện câu giải thích và nút bị vô hiệu hoá, chứ không im lặng từ chối; còn lượt thì vẫn báo đúng số lượt còn lại.
  - AC: AC-14.3b
  - Phụ thuộc: T203

---

## Phase 21 — Lát 21: Lưu trữ, lịch sử, đóng spec

- [ ] **T217** — Hai trường mới trong bản ghi trận
  - File: sửa `src/storage/db.ts`, sửa `src/services/matchRepo.ts`, sửa `src/hooks/useMatch.ts`, sửa `src/services/matchRepo.test.ts`
  - Xong khi: `TomTatTran` mang `quanSo?` và `thoiLuong?`; bản ghi cũ thiếu hai trường thì **đọc ra 11 và 90**; `DB_VERSION` **giữ nguyên 3** (D61); test xanh — ghi một bản ghi thiếu hai trường rồi đọc ra đúng mặc định, và vòng tròn lưu/đọc một trận sân 5 không mất gì.
  - AC: AC-12.4, AC-12.6, AC-16.1, AC-16.2
  - Phụ thuộc: T200, **T219**
  - **Phải đi sau T219** (soát ra ở `/analyze`): `TranDaLuuSchema` là `z.object` nên zod lặng lẽ cắt khoá lạ. Ghi hai trường mới khi schema còn ở v4 thì xuất tệp rồi nhập lại là **mất trắng hai trường mà không báo gì**.

- [ ] **T218** [P] — Lịch sử hiển thị quân số và thời lượng
  - File: sửa `src/ui/pages/TrangLichSu.tsx`, sửa `src/ui/strings.ts`
  - Xong khi: mỗi dòng lịch sử hiện quân số và thời lượng; trận cũ hiện "11 người · 90 phút"; mở một trận sân 5 xem lại được đầy đủ báo cáo và dòng sự kiện.
  - AC: AC-12.4, AC-12.6
  - Phụ thuộc: T217

- [ ] **T219** [P] — Tệp sao lưu phiên bản 5
  - File: sửa `src/services/backupSchema.ts`, sửa `src/storage/migrations.ts`, sửa `src/services/backupService.ts`, sửa `src/services/backupService.test.ts`
  - Xong khi: `SCHEMA_VERSION` lên 5 kèm `nangV4LenV5` điền 11 người / 90 phút cho mọi trận trong tệp cũ; test xanh — nhập một tệp v4 thật rồi đọc ra đúng hai giá trị mặc định, và vòng tròn xuất/nhập v5 không mất trường nào.
  - AC: AC-16.4
  - Phụ thuộc: T200

- [ ] **T220** — Báo cáo sau trận ở quân số nhỏ
  - File: sửa `src/engine/baoCao.test.ts`
  - Xong khi: test xanh — chạy một trận n=5, bảng điểm cầu thủ có **đúng** những người đã ra sân của trận đó, không thừa không thiếu, và tổng theo từng cầu thủ khớp tổng theo bên.
  - AC: AC-15.3
  - Phụ thuộc: T202
  - Plan nói `dungBaoCao` vốn dựng từ `theoCauThu` nên có thể **không phải sửa code** — task này tồn tại để chứng minh điều đó, chứ không phải để tin vào nó.

- [ ] **T223** — Đo xem dòng sự kiện ở n=11 có thật sự đổi không
  - File: tạo `src/engine/tuongThichV5.test.ts`
  - Xong khi: chạy một bộ mã trận cố định ở **n=11, 90 phút, không thẻ đỏ tới ngưỡng huỷ**, rồi đối chiếu **từng dòng** với kết quả đã chốt của engine v5 (lưu thành bảng hằng trong chính test). Test in ra số dòng khớp và số dòng lệch.
  - AC: — *(cổng quyết định cho T221)*
  - Phụ thuộc: T212, T213, T214
  - **Phát sinh từ `/analyze`.** Bản đầu của plan mặc định là `Rng` đổi nên phải bump. Soát lại thì ở n=11 không chỗ nào đổi số lần hay thứ tự rút: lượt thay chỉ đổi trần can thiệp, huỷ trận cần từ 5 thẻ đỏ. Nếu giống hệt thì **không bump** — bump thừa là tự tay tước nút đấu lại của mọi trận sẽ lưu từ nay.

- [ ] **T221** — `PHIEN_BAN_ENGINE`: bump hay không, theo số đo
  - File: sửa `src/engine/tran.ts`
  - Xong khi: **T223 đỏ** → lên 6 kèm chú thích nói rõ dòng nào đã đổi; **T223 xanh** → giữ nguyên 5 và ghi vào plan rằng bump không cần thiết, kèm số đo. Dù theo nhánh nào cũng kiểm tay: mở một trận đã lưu, nút đấu lại hành xử đúng như lý do mà ứng dụng nói ra.
  - AC: AC-16.3
  - Phụ thuộc: **T223**
  - Để **cuối cùng trong các thay đổi engine**: tăng sớm thì mỗi lần sửa engine tiếp theo lại phải tự hỏi có cần tăng nữa không.

- [ ] **T222** — Kiểm tay từng quân số và đóng spec
  - File: `specs/002-flexible-squad-size/spec.md`
  - Xong khi: **mỗi quân số từ 5 tới 11 chạy trọn một trận trên ứng dụng đang chạy** (Definition of Done của spec đòi), cộng kiểm tay bốn việc chỉ kiểm tay mới thấy — xếp đội hình sân 5 rồi quay lại sân 11 thấy đội hình cũ còn nguyên; đá một trận 20 phút đếm số dòng tường thuật; ép một trận tới ngưỡng huỷ; mở một trận cũ trong lịch sử. Tick 32 AC và đổi `Status` thành **Done**.
  - AC: toàn bộ
  - Phụ thuộc: T211, T215, T216, T218, T219, T220, T221, T223

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-12.1 | T200, T215 |
| AC-12.1b | T200 |
| AC-12.2 | T215 |
| AC-12.3 | T202, T215 |
| AC-12.4 | T217, T218 |
| AC-12.5 | T212, T215 |
| AC-12.6 | T217, T218 |
| AC-13.1 | T206, T211 |
| AC-13.2 | T207, T208 |
| AC-13.3 | T209, T210 |
| AC-13.3b | T209 |
| AC-13.4 | T207, T208 |
| AC-13.5 | T207, T208 |
| AC-13.6 | T210, T211 |
| AC-13.7 | T210 |
| AC-14.1 | T202 |
| AC-14.1b | T202 |
| AC-14.2 | T202 |
| AC-14.3 | T203 |
| AC-14.3b | T203, T216 |
| AC-14.4 | T204 |
| AC-14.5 | T204 |
| AC-14.6 | T204 |
| AC-15.1 | T214 |
| AC-15.2 | T214 |
| AC-15.3 | T220 |
| AC-15.4 | **T205** |
| AC-15.5 | T213 |
| AC-15.6 | T214 |
| AC-16.1 | T217 |
| AC-16.2 | T217 |
| AC-16.3 | T221 |
| AC-16.4 | T219 |

**33/33 AC đều có task.** AC-15.4 in đậm vì nó là AC dạng so sánh duy nhất của
spec này — theo P5 nó phải có một test riêng in ra số đo, và test ấy là T205.

## Ghi chú thực thi

- Không tạo file nào ngoài danh sách trên. Phát sinh thêm → dừng, cập nhật plan/tasks trước.
- Mỗi task hoàn thành là một commit, thông điệp nêu rõ mã task (hiến pháp mục 4). Không commit khi ứng dụng không build được.
- Task thuộc `src/domain/`, `src/engine/`, `src/services/`, `src/storage/` chưa có test thì **chưa xong**. Task thuộc `src/ui/` được xác nhận bằng cách tự bấm thử.
- Kết thúc mỗi phase, ứng dụng phải chạy trọn luồng của phase đó (P6) trước khi sang phase sau.
- **T205 là cổng chặn của cả spec.** Nó đứng ở phase đầu tiên vì nếu giả định của AC-15.4 sai thì mọi thứ xây lên trên đều phải làm lại.
