# Tasks: Dựng đội nhanh, sân sống động, và đấu lại từ một phút bất kỳ

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 37 AC (US-24 → US-27) |
| **Tiến độ** | 39/40 |
| **Sửa đổi** | 2026-11-17 — chẻ lần đầu từ plan; cùng ngày sửa theo `/analyze` (1 CRITICAL + 4 HIGH); T439 bị chặn, xem ghi chú Phase 35 |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Số task bắt đầu từ **T400** để không lẫn với T001–T136 của spec 001,
T200–T224 của spec 002 và T300–T344 của spec 003. Bảy phase dưới đây là bảy
lát cắt dọc ở `plan.md` mục 9; mỗi phase kết thúc là một ứng dụng chạy được
(hiến pháp P6), và là một commit.

> ⚠️ **Ràng buộc xuyên suốt: KHÔNG đổi engine.** `PHIEN_BAN_ENGINE` giữ
> nguyên 5. Task nào chạm gần `src/engine/` đều có dòng này trong tiêu chí
> xong. Gặp chỗ tưởng như buộc phải đổi engine thì **dừng và hỏi người
> dùng**, không tự đổi — đổi là mọi trận đã lưu mất nút đấu lại (rủi ro R33,
> rủi ro có hậu quả cao nhất của spec).

---

## Phase 29 — Lát 29: Kho tên và sinh MỘT cầu thủ

- [x] **T400** — Kho tên hư cấu hai thứ tiếng
  - File: tạo `src/domain/tenNgauNhien.ts`
  - Xong khi: hai kho tên (Việt, Anh) nằm trong `domain`, mỗi kho là hai danh sách họ và tên ghép được (D81); hàm sinh nhận **kho và nguồn ngẫu nhiên qua tham số**, không gọi `Math.random` (P1); `domain` KHÔNG import gì từ `services` hay `ui` (D80).
  - AC: AC-24.8
  - Phụ thuộc: —

- [x] **T401** — Test kho tên
  - File: tạo `src/domain/tenNgauNhien.test.ts`
  - Xong khi: test xanh — cùng một nguồn ngẫu nhiên cho ra cùng tên; hai kho cho ra tên khác nhau về bộ ký tự; sinh 200 tên từ một kho thì tỉ lệ trùng thấp hơn 10%.
  - AC: AC-24.8
  - Phụ thuộc: T400

- [x] **T402** — Sinh một cầu thủ đầy đủ ở `domain`
  - File: sửa `src/domain/generator.ts`
  - Xong khi: hàm mới sinh đủ tên, tuổi, số áo, vị trí sở trường và chỉ số cho **một** cầu thủ, dùng lại `sinhChiSo` đã có; nhận danh sách số áo đang dùng để tránh trùng; nhận `Rng` và kho tên qua tham số.
  - AC: AC-24.1, AC-24.2, AC-24.3
  - Phụ thuộc: T400

- [x] **T403** — Test sinh một cầu thủ
  - File: sửa `src/domain/generator.test.ts`
  - Xong khi: test xanh — không trường bắt buộc nào trống; chỉ số nằm đúng dải của mức đã chọn và mức cao hơn cho chỉ số tổng cao hơn ở cùng vị trí; số áo không trùng với danh sách truyền vào; cùng nguồn ngẫu nhiên cho cùng kết quả.
  - AC: AC-24.1, AC-24.2, AC-24.3
  - Phụ thuộc: T402

- [x] **T404** — Nút sinh cầu thủ trong form, và chuỗi hai ngôn ngữ
  - File: sửa `src/ui/components/FormCauThu.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: trong form cầu thủ có nút sinh toàn bộ hồ sơ (không chỉ chỉ số như hiện nay); nguồn ngẫu nhiên thật dựng ở tầng giao diện đúng nếp `taoMaTran(RNG_THAT)`; kho tên chọn theo ngôn ngữ đang chọn; bấm hai lần ra hai người khác nhau; **mọi chuỗi mới có đủ hai ngôn ngữ trong cùng commit** (P8).
  - AC: AC-24.1, AC-24.5, AC-24.6, AC-24.8
  - Phụ thuộc: T402

---

## Phase 30 — Lát 30: Sinh CẢ ĐỘI kèm chiến thuật

- [x] **T405** — Sinh cả đội ở `domain`
  - File: sửa `src/domain/generator.ts`
  - Xong khi: hàm mới sinh đủ người cho một quân số cho trước cộng tối đa 7 dự bị (sân 11 ra 18 người), bảo đảm mỗi vị trí của sơ đồ có ít nhất một người đá đúng sở trường, số áo không trùng nhau trong đội.
  - AC: AC-24.4
  - Phụ thuộc: T402

- [x] **T406** — Test sinh cả đội
  - File: sửa `src/domain/generator.test.ts`
  - Xong khi: test xanh — đủ số người; mọi vị trí của sơ đồ được phủ; không hai cầu thủ nào trùng số áo; cùng nguồn ngẫu nhiên cho cùng một đội.
  - AC: AC-24.4
  - Phụ thuộc: T405

- [x] **T407** — Lưu đội sinh ra trong MỘT transaction
  - File: sửa `src/services/teamRepo.ts`
  - Xong khi: hàm lưu đội sinh ra ghi `teams` + `players` + `tactics` trong **một** `db.transaction([...], 'readwrite')` theo đúng nếp `create` đang có (D82); bộ chiến thuật kèm theo đã xếp đủ ô của sơ đồ, dùng lại `xepLaiKhiDoiSoDo` chứ không viết thuật toán xếp thứ hai (D83); **`DB_VERSION` không đổi**.
  - Cách dùng lại cho đúng (D83, đã kiểm trên code): `xepLaiKhiDoiSoDo` lấy
    danh sách người **từ tham số `oVienCu`**, không từ `cacCauThu` — truyền
    `[]` như `tacticRepo.ts:171` làm khi đội chưa có bộ chiến thuật thì nhận
    về đội hình **toàn ô trống**. Nên phải truyền cả đội vừa sinh vào làm
    `oVienCu` giả. Ô nào thuật toán từ chối xếp (mức sai `nang`) thì **lấp
    bằng người còn lại**, đúng cách `chonTheoSoDo` ở `ChonCapDau.tsx:65` làm
    — đội sinh ra phải đá được ngay (AC-24.4), không được để ô trống.
  - AC: AC-24.4, AC-24.7
  - Phụ thuộc: T405

- [x] **T408** — Test lưu đội sinh ra là tất-cả-hoặc-không-gì
  - File: sửa `src/services/teamRepo.test.ts`
  - Xong khi: test xanh — lưu thành công thì có đủ đội, cầu thủ và chiến thuật; ép lỗi giữa chừng thì **không** còn lại đội, cầu thủ hay chiến thuật nào.
  - AC: AC-24.7
  - Phụ thuộc: T407

- [x] **T409** — Nút sinh cả đội trên màn danh sách đội
  - File: sửa `src/ui/pages/DanhSachDoi.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: bấm một nút, chọn mức độ và quân số, ra một đội **đá được ngay**; mở trang chiến thuật của đội ấy thấy đội hình đã xếp đủ ô; chuỗi đủ hai ngôn ngữ.
  - AC: AC-24.4, AC-24.6
  - Phụ thuộc: T407

---

## Phase 31 — Lát 31: Nhân bản đội và lọc danh sách

- [x] **T410** — Nhân bản đội ở `services`
  - File: sửa `src/services/teamRepo.ts`
  - Xong khi: hàm nhân bản tạo đội mới với **id mới cho mọi bản ghi**, chép chỉ số và màu áo, **bỏ ảnh** chân dung và logo (quyết định `/clarify` câu 6); tất cả trong một transaction; **`DB_VERSION` không đổi**.
  - AC: AC-26.1, AC-26.3
  - Phụ thuộc: —

- [x] **T411** — Test nhân bản đội
  - File: sửa `src/services/teamRepo.test.ts`
  - Xong khi: test xanh — bản sao có đủ số cầu thủ và chỉ số giống hệt; **không id nào dùng chung** với đội gốc; sửa bản sao thì gốc không đổi và ngược lại; bản sao không mang ảnh nào.
  - AC: AC-26.1, AC-26.2, AC-26.3
  - Phụ thuộc: T410

- [x] **T412** — Nút nhân bản trên màn danh sách đội
  - File: sửa `src/ui/pages/DanhSachDoi.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: mỗi đội có một nút nhân bản; bản sao mang tên phân biệt được; **trước khi nhân bản, màn hình nói rõ bản sao sẽ không có ảnh** (AC-26.3); chuỗi đủ hai ngôn ngữ.
  - AC: AC-26.1, AC-26.3
  - Phụ thuộc: T410

- [x] **T413** — Lọc danh sách cầu thủ
  - File: sửa `src/ui/pages/TrangDoi.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: lọc được theo **tên, vị trí sở trường, khoảng chỉ số tổng, tuổi, chân thuận** và các bộ lọc kết hợp được; khoảng chỉ số tổng nêu rõ đang tính theo **vị trí nào** (dùng `chiSoTongTheoViTri`); danh sách nói rõ đang hiện bao nhiêu trên tổng bao nhiêu; lọc ở tầng giao diện, **không** thêm chỉ mục database (D87).
  - AC: AC-26.4, AC-26.5, AC-26.6
  - Phụ thuộc: —

- [x] **T414** — Trạng thái rỗng khi lọc không ra ai
  - File: sửa `src/ui/pages/TrangDoi.tsx`, `src/ui/ngonNgu/{vi,en}.ts`
  - Xong khi: lọc không khớp ai thì hiện thông báo không có kết quả kèm một thao tác xoá bộ lọc; bấm vào trở lại danh sách đầy đủ.
  - AC: AC-26.7
  - Phụ thuộc: T413

- [x] **T415** — Bàn phím và tương phản cho phần lọc
  - File: sửa `src/ui/pages/TrangDoi.tsx`
  - Xong khi: Tab đi được qua mọi ô lọc; đo tương phản chữ/nền của phần lọc ở **cả hai chế độ** sáng và tối, đều ≥ 4.5:1.
  - AC: AC-26.4
  - Phụ thuộc: T413

---

## Phase 32 — Lát 32: Tự chọn đội hình kèm LÝ DO

- [x] **T416** — Lớp chọn trả thêm mã lý do
  - File: sửa `src/domain/lineup.ts`
  - Xong khi: `KetQuaXepLai` mang thêm **mã lý do** cho từng ô — đúng bộ mã
    mà thuật toán hiện tại phân biệt được: `'dung-so-truong'`,
    `'xep-sai-nhe'`, `'xep-sai-vua'`, `'lap-cho-trong'`, `'thieu-nguoi'`;
    **không một chuỗi hiển thị nào** nằm trong `domain` (P8, D84).
  - ⚠️ **Thêm trường, KHÔNG đổi hành vi.** Luật phá hoà hiện tại là "giữ
    người đứng trước trong danh sách" và có test khẳng định
    (`lineup.test.ts`); `chiPhi()` **không đọc chỉ số** và `lineup.ts`
    không import `rating.ts`. Vì thế mã `'chi-so-cao-nhat'` của bản plan đầu
    đã bị bỏ (D84): sinh được nó là đổi luật phá hoà, tức đổi kết quả của
    **ba** nơi gọi — `useTactic.ts:129`, `tacticRepo.ts:171`,
    `ChonCapDau.tsx:258`. Muốn đổi thì quay lại `/specify`.
  - ⚠️ **Không đổi engine.** `tinhTrangDoiHinh` cùng file này **được
    `src/engine/batDau.ts` import**. Chỉ thêm trường vào `KetQuaXepLai`;
    `tinhTrangDoiHinh` giữ nguyên chữ ký và `PHIEN_BAN_ENGINE` vẫn là 5.
  - AC: AC-26.8, AC-26.9
  - Phụ thuộc: —

- [x] **T417** — Test mã lý do
  - File: sửa `src/domain/lineup.test.ts`
  - Xong khi: test xanh — người đá đúng sở trường nhận mã khác người được lấp chỗ trống; đội thiếu người thì số ô điền được đúng bằng số người có và phần thiếu có mã riêng; và **mọi test cũ của `lineup.test.ts` vẫn xanh không phải sửa một dòng** — đó là bằng chứng luật phá hoà chưa bị đụng (xem cảnh báo ở T416).
  - AC: AC-26.8, AC-26.9
  - Phụ thuộc: T416

- [x] **T418** — Nút tự chọn đội hình trên trang chiến thuật
  - File: sửa `src/hooks/useTactic.ts`, `src/ui/pages/TrangChienThuat.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: một nút điền đủ các ô của sơ đồ đang dùng; mỗi ô đọc được lý do bằng chữ ở ngôn ngữ đang chọn; đội thiếu người thì điền được bao nhiêu hay bấy nhiêu và nói rõ còn thiếu mấy người.
  - AC: AC-26.8, AC-26.9
  - Phụ thuộc: T416

- [x] **T419** — Sửa lại từng ô sau khi tự chọn
  - File: sửa `src/ui/pages/TrangChienThuat.tsx`
  - Xong khi: sau khi tự chọn, kéo-thả và thao tác bàn phím đổi người ở từng ô vẫn chạy như trước; đổi xong thì lý do của ô ấy biến mất hoặc cập nhật, không để lại lý do cũ nói sai.
  - AC: AC-26.10
  - Phụ thuộc: T418

---

## Phase 33 — Lát 33: Nội suy chuyển động trên sân 2D

> Lát này độc lập với 29–32. `San2D.tsx` hiện ~540 dòng và là file chịu
> thay đổi nặng nhất của spec.

- [x] **T420** [P] — Lưới an toàn: trận cũ vẫn đấu lại đúng
  - File: tạo `src/engine/tuongThichV5.test.ts` *(hoặc nối vào test tương thích đã có nếu tên trùng)*
  - Xong khi: test xanh — một trận dựng từ cấu hình cố định, chạy hết, cho đúng tỉ số và đúng từng dòng sự kiện như bản ghi tham chiếu; `PHIEN_BAN_ENGINE` vẫn là 5. **Task này nằm SỚM có chủ đích**: nó là lưới duy nhất bắt được việc ai đó lỡ tay đụng engine ở Phase 33 hay 34 (rủi ro R33).
  - AC: AC-25.4, AC-25.5
  - Phụ thuộc: —

- [x] **T421** — Lớp nội suy đường cong
  - File: tạo `src/ui/noiSuy.ts`, tạo `src/ui/noiSuy.test.ts`
  - Xong khi: hàm thuần nhận hai mốc và một tỉ lệ 0→1, trả toạ độ trên đường cong trơn; test xanh — tại tỉ lệ 0 và 1 trả **đúng** toạ độ hai mốc (đây là điều giữ AC-25.2); đường đi không vọt ra ngoài khung sân.
  - AC: AC-25.1, AC-25.2
  - Phụ thuộc: —

- [x] **T422** — Sân 2D vẽ theo nhịp, dùng lớp nội suy
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: các điểm di chuyển liên tục theo đường cong giữa hai tình huống, không nhảy; `hinhSan` **giữ nguyên chữ ký thuần** và vẫn là nơi quyết định toạ độ tại mốc; `src/ui/san2D.test.ts` vẫn xanh không phải sửa; **không đụng `src/engine/`**.
  - AC: AC-25.1, AC-25.2
  - Phụ thuộc: T421

- [x] **T423** — Dáng chuyển động theo thể lực
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/noiSuy.ts`
  - Xong khi: điểm của người đã xuống thể lực **trễ hơn rõ rệt** một người
    cùng lúc còn sung sức — xuất phát muộn hơn, đi phần lớn quãng đường sau
    người kia — nhưng **cả hai cùng tới đích đúng một lúc**; thể lực đọc từ
    `ben.theLuc` của trạng thái trận đang chạy; **không** thêm trường nào vào
    `SuKien` và **không đụng engine**.
  - ⚠️ **Thời lượng là bất biến, không phải tham số.** D88: thể lực đổi hàm
    giảm tốc, **không** đổi `thoiGianChuyen`. Kéo dài thời lượng theo thể lực
    là phá AC-25.3 — `thoiGianChuyen` đã bằng 90% một nhịp đồng hồ (180ms ở
    mức Thường, 63ms ở Nhanh, **18ms** ở Rất nhanh), nên mọi hệ số lớn hơn
    1,11 lần là điểm còn bay dở khi tình huống kế tiếp tới. T425 là lưới bắt
    lỗi này.
  - Xong khi (phần kiểm): ở **cả ba** mức tốc độ, điểm kiệt sức vẫn tới đúng
    toạ độ mốc trước nhịp kế tiếp — không có mức nào được miễn.
  - AC: AC-25.7
  - Phụ thuộc: T422

- [x] **T424** — Thể lực vẫn phải có mặt bằng CHỮ
  - File: — *(kiểm trên ứng dụng đang chạy)*
  - Xong khi: xác nhận nhãn chữ "kiệt sức" trong dòng tường thuật vẫn hiện đúng lúc, nên tốc độ di chuyển **không** phải kênh duy nhất báo thể lực (P9). Thiếu thì bổ sung nhãn chữ, không bỏ AC-25.7.
  - AC: AC-25.8
  - Phụ thuộc: T423

- [x] **T425** — Theo kịp khi đổi tốc độ trận
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: đổi tốc độ ở cả ba mức, không điểm nào còn đang di chuyển dở
    khi tình huống kế tiếp tới — **kể cả điểm của người đã kiệt sức**, là chỗ
    duy nhất mà AC-25.3 và AC-25.7 có thể đánh nhau (D88); dùng lại
    `thoiGianChuyen` đã có chứ không đặt cứng con số mới.
  - AC: AC-25.3
  - Phụ thuộc: T423 *(làm sau T423 có chủ đích: đây là lưới bắt đúng cái lỗi mà T423 dễ gây ra)*

- [x] **T426** — Tôn trọng chế độ giảm chuyển động
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: bật giảm chuyển động ở hệ điều hành (hoặc giả lập trong trình duyệt) thì sân thôi nội suy mà vẫn hiển thị đúng vị trí tại từng mốc.
  - AC: AC-25.6
  - Phụ thuộc: T422

---

## Phase 34 — Lát 34: Đấu lại từ một phút bất kỳ

> Lát này độc lập với 29–33.

- [x] **T427** [P] — Dựng lại cấu hình trận từ bản ghi đã lưu
  - File: tạo `src/services/phatLai.ts`, tạo `src/services/phatLai.test.ts`
  - Xong khi: hàm thuần ánh xạ `TranDaLuu` → `CauHinhTran` (D78); test xanh — cấu hình dựng lại mang đúng `maTran`, hai đội, quân số, thời lượng, cờ sân trung lập; **không sửa gì trong `src/engine/`**.
  - AC: AC-27.1
  - Phụ thuộc: —

- [x] **T428** — Vòng lặp phát lại tới phút X
  - File: sửa `src/services/phatLai.ts`
  - Xong khi: hàm chạy `taoTran` rồi lặp `buocTiep`, xếp từng can thiệp đã lưu vào **đúng phút** của nó, dừng ở phút chỉ định; chỉ gọi hàm thuần đã có của engine (D77); **không sửa `src/engine/`**.
  - AC: AC-27.1, AC-27.2
  - Phụ thuộc: T427

- [x] **T429** — Test xương sống 1: không đổi gì thì ra y hệt
  - File: sửa `src/services/phatLai.test.ts`
  - Xong khi: test xanh — phát lại tới một phút rồi chạy nốt **mà không thêm can thiệp nào** cho ra dòng sự kiện và tỉ số **giống hệt** trận gốc, từng dòng một.
  - AC: AC-27.4
  - Phụ thuộc: T428

- [x] **T430** — Test xương sống 2: phần trước điểm rẽ giống hệt
  - File: sửa `src/services/phatLai.test.ts`
  - Xong khi: test xanh — phát lại tới phút X, thêm một can thiệp mới, chạy nốt; mọi dòng sự kiện **trước** phút X giống hệt trận gốc; từ phút X trở đi được phép khác.
  - AC: AC-27.2
  - Phụ thuộc: T428

- [x] **T431** — Hook điều phối rẽ nhánh, giữ trong bộ nhớ
  - File: tạo `src/hooks/useRePhatLai.ts`
  - Xong khi: hook nhận bản ghi trận, phút rẽ và can thiệp mới, trả kết quả rẽ nhánh; kết quả sống **chỉ trong bộ nhớ**, không gọi bất kỳ hàm ghi nào của `services` (D79); chặn phút nằm ngoài khoảng của trận gốc.
  - AC: AC-27.1, AC-27.7, AC-27.8
  - Phụ thuộc: T428

- [x] **T432** — Chọn phút trong dòng tường thuật
  - File: sửa `src/ui/components/DongTuongThuat.tsx`, `src/ui/pages/TrangLichSu.tsx`, `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: mở một trận trong lịch sử, chọn được một phút từ dòng tường thuật; đi được bằng bàn phím; chuỗi đủ hai ngôn ngữ. Dòng tường thuật ở **trang trận đang chạy** vẫn hiển thị như cũ, không mọc thêm nút.
  - AC: AC-27.1
  - Phụ thuộc: T431

- [x] **T433** — Màn hình rẽ nhánh: đổi quyết định rồi chạy tiếp
  - File: tạo `src/ui/components/RePhatLai.tsx`, sửa `src/ui/pages/TrangLichSu.tsx`, sửa `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: tại phút đã chọn, đổi được một chỉ thị toàn đội hoặc thay một người, rồi chạy nốt; màn hình này **không** phơi ra lối rẽ nhánh lần nữa và nói rõ mỗi lần rẽ nhánh đều xuất phát từ một trận trong lịch sử.
  - AC: AC-27.1, AC-27.10
  - Phụ thuộc: T431

- [x] **T434** — Khối so sánh với trận gốc
  - File: sửa `src/ui/components/RePhatLai.tsx`, sửa `src/ui/ngonNgu/{vi,en}.ts`
  - Xong khi: hiện cạnh nhau tỉ số và các chỉ tiêu hai đội của trận gốc và trận rẽ nhánh; dùng lại cấu trúc báo cáo sau trận đã có chứ không dựng bảng thứ hai.
  - AC: AC-27.3
  - Phụ thuộc: T433

- [x] **T435** — Từ chối rẽ nhánh khi không rẽ được
  - File: sửa `src/ui/pages/TrangLichSu.tsx`, sửa `src/ui/ngonNgu/{vi,en}.ts`
  - Xong khi: trận chạy bằng engine cũ hơn, hoặc trận có đội đã bị xoá, thì lối rẽ nhánh bị chặn kèm lý do bằng chữ; dùng lại `matchRepo.lyDoKhongDauLai` đã biết phân biệt hai trường hợp này.
  - AC: AC-27.5, AC-27.6
  - Phụ thuộc: T433

- [x] **T436** — Hỏi trước khi rời màn hình rẽ nhánh
  - File: sửa `src/ui/components/RePhatLai.tsx`, sửa `src/ui/ngonNgu/{vi,en}.ts`
  - Xong khi: rời màn hình rẽ nhánh thì được hỏi trước, nói rõ kết quả sẽ mất vì nó không được lưu; đồng ý thì về lịch sử và **trận gốc còn nguyên**.
  - AC: AC-27.7, AC-27.9
  - Phụ thuộc: T433

---

## Phase 35 — Lát 35: Kiểm tay, đo ngân sách, đóng spec

- [x] **T437** — Kiểm tay 2 ngôn ngữ × 2 chế độ
  - File: — *(kiểm trên ứng dụng đang chạy)*
  - Xong khi: đi hết mọi màn hình mới ở bốn tổ hợp, kể cả màn hình lỗi và trạng thái rỗng của phần lọc; không sót chữ, không chỗ nào tương phản dưới 4.5:1, không dấu hiệu thiếu bản dịch. Và với sân 2D đang nội suy: tỉ số, dòng tường thuật, chỉ tiêu hai đội và điểm từng cầu thủ **không đổi** so với trước spec này (AC-25.5 — T420 chứng minh engine không đổi, nhưng chỉ phép kiểm tay này nhìn thấy màn hình có nội suy).
  - AC: AC-24.8, AC-25.5, AC-26.3, AC-26.7
  - Phụ thuộc: T404, T409, T412, T414, T415, T419, T425, T426, T434, T435, T436
  - *Sửa theo `/analyze`: danh sách cũ (T409, T412, T414, T418, T426, T436) bỏ sót sáu task tạo màn hình mới — T404, T415, T419, T425, T434, T435. T434 và T435 là **em** của T433 chứ không phải tổ tiên của T436, nên chúng không nằm trong cây phụ thuộc cũ.*

- [x] **T438** — Đo lại các ngân sách ở spec mục 6
  - File: — *(đo trên bản build)*
  - Xong khi: sinh một đội < 2 giây; nhân bản đội 30 cầu thủ < 2 giây; gõ ô lọc cập nhật < 100ms; chạy hết một trận < 3 giây **với sân 2D bật** (AC-25.9, phép đo 1); chạy tiếp một trận rẽ nhánh < 3 giây. Ghi số đo vào mô tả commit, và nói rõ số đo là thời gian tới lúc DOM đổi hay tới lúc nhìn thấy.
  - **Phép đo 2 — đang phát theo đồng hồ, bắt buộc.** 22 điểm đang nội suy
    thì công việc mỗi khung vẽ **gọn trong một nhịp** ở mức Thường (200ms một
    phút trận) và **không rơi nhịp** ở mức Nhanh (70ms). Đây mới là phép đo
    cái giá của đường cong: chế độ chạy ngay gọi `chayHetTran` một lèo rồi
    vẽ một lần (`useMatch.ts:151`), nên phép đo 1 đi đúng con đường mà nội
    suy **không** chạy — bản plan đầu kết luận "đạt theo cấu trúc" chính vì
    lẽ đó, và `/analyze` đã bắt chỗ ấy (D86).
  - Vật cản đã biết: `requestAnimationFrame` **không chạy khi pane trình
    duyệt bị ẩn** — đúng vật cản của T035 spec 001. Đo với pane đang hiện,
    và ghi rõ điều kiện đo vào mô tả commit.
  - AC: AC-25.9
  - Phụ thuộc: T437

- [ ] **T439** — Tick 37 AC và đóng spec *(CHẶN: xem ghi chú Phase 35 — một đường đi của US-27 làm trắng ứng dụng, chưa đóng spec được)*
  - File: sửa `specs/004-squad-tools-and-what-if/spec.md`
  - Xong khi: mọi AC ở mục 3 được tick có căn cứ; Definition of Done đủ chín mục; `Status` đổi thành **Done**; xác nhận `PHIEN_BAN_ENGINE` vẫn là 5 và định dạng tệp sao lưu không đổi.
  - AC: toàn bộ
  - Phụ thuộc: T438

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-24.1 | T402, T403, T404 |
| AC-24.2 | T402, T403 |
| AC-24.3 | T402, T403 |
| AC-24.4 | T405, T406, T407, T409 |
| AC-24.5 | T404 |
| AC-24.6 | T404, T409 |
| AC-24.7 | T407, T408 |
| AC-24.8 | T400, T401, T404, T437 |
| AC-25.1 | T421, T422 |
| AC-25.2 | T421, T422 |
| AC-25.3 | T425 |
| AC-25.4 | T420 |
| AC-25.5 | T420, T437 |
| AC-25.6 | T426 |
| AC-25.7 | T423 |
| AC-25.8 | T424 |
| AC-25.9 | T438 |
| AC-26.1 | T410, T411, T412 |
| AC-26.2 | T411 |
| AC-26.3 | T410, T411, T412, T437 |
| AC-26.4 | T413, T415 |
| AC-26.5 | T413 |
| AC-26.6 | T413 |
| AC-26.7 | T414, T437 |
| AC-26.8 | T416, T417, T418 |
| AC-26.9 | T416, T417, T418 |
| AC-26.10 | T419 |
| AC-27.1 | T427, T428, T431, T432, T433 |
| AC-27.2 | T428, T430 |
| AC-27.3 | T434 |
| AC-27.4 | T429 |
| AC-27.5 | T435 |
| AC-27.6 | T435 |
| AC-27.7 | T431, T436 |
| AC-27.8 | T431 |
| AC-27.9 | T436 |
| AC-27.10 | T433 |

## Phase 34 — hai thứ chỉ lộ ra khi làm thật

**1. "Phút" trong ứng dụng này là HAI thứ khác nhau.** `CanThiep.phut` và
`TrangThaiTran.phut` là phút ĐỒNG HỒ, đếm liên tục và tính cả bù giờ;
`SuKien.phut` là phút NGƯỜI ĐỌC THẤY, hiệp hai bị trừ đi bù giờ hiệp một để
"46" vẫn là 46. Người dùng chọn điểm rẽ bằng cách bấm một dòng tường thuật,
nên lấy thẳng `SuKien.phut` làm phút rẽ là rẽ sớm hơn đúng số phút bù giờ
hiệp một — lệch tới 5 phút, và lệch im lặng. Trận 30 phút kiểm tay có đủ cả
hai mặt: dòng tường thuật đi `16'+`, `17'+`, rồi `16'`, `17'`. Phép đổi nằm
ở `phutThucTe` trong `services/phatLai.ts`, có phép kiểm khẳng định nó là
nghịch đảo đúng của `phutHienThi` ở MỌI phút của trận.

**2. Trần 100 dòng của `chonSuKien` đẩy được dòng TRƯỚC điểm rẽ ra ngoài.**
Bộ lọc mật độ xếp hạng tình huống trên cả trận, nên nhánh sinh tình huống
điểm cao hơn ở phần sau sẽ hất mất dòng ở phần trước — `W5H4J2YD9F` rẽ ở
phút 70 mất **ba dòng** trước điểm rẽ (65 thay vì 68), trong khi engine
không chạy khác một nhịp. Đọc trên màn hình thì đó đúng là thứ AC-27.2 cấm.
Lối ra: `dongSuKienNhanh` ghép phần tới điểm rẽ LẤY NGUYÊN từ bản ghi gốc,
phần sau mới lấy từ nhánh — AC-27.2 đúng bằng cấu trúc, không bằng may. Ca
`W5H4J2YD9F`/phút 70 được pin lại thành phép kiểm để không ai "dọn" phép
ghép ấy đi.

**Lệch khỏi danh sách file của T434, một từ:** thêm `export` cho
`CAC_CHI_TIEU` trong `src/ui/components/BaoCaoSauTran.tsx` để khối so sánh
dùng chung đúng một danh sách sáu chỉ tiêu. Khai danh sách thứ hai trong
`RePhatLai.tsx` thì đúng danh sách file nhưng sai tinh thần T434 ("không
dựng bảng thứ hai").

**Chưa kiểm được bằng mắt: AC-27.5** (trận chạy bằng engine cũ hơn). Không
có đường nào qua giao diện để làm ra một bản ghi `phienBanEngine` khác, nên
nó dựa vào `matchRepo.lyDoKhongDauLai` (đã có test từ spec 001) và vào việc
lý do kia — đội đã bị xoá — đã được kiểm tay trên cùng một đường code: hai
câu từ chối hiện ra, không còn nút "Rẽ nhánh" nào, nút "Đấu lại" tắt, mà
trận vẫn xem lại được 18 dòng. T437 nên thử nốt AC-27.5 bằng một tệp sao lưu
sửa tay nếu muốn phủ kín.

**Đã kiểm tay trên ứng dụng đang chạy** (trận 30 phút, hai đội 18 người):
chạy nhánh mà không đổi gì → tỉ số và cả 12 chỉ tiêu đều "Giống trận gốc"
(AC-27.4); đổi pressing sang Cao tại phút 16 hiệp hai → 25 dòng đầu giống
hệt, lệch từ phút 23, tỉ số 3–1 thay vì 3–0 (AC-27.2, AC-27.3); mốc "TỪ PHÚT
16' TRỞ ĐI LÀ NHÁNH KHÁC" đứng đúng chỗ; màn nhánh không có nút rẽ nhánh nào
(AC-27.10); rời màn hình thì bị hỏi trước, focus sẵn ở "Huỷ", đồng ý thì
trận gốc còn nguyên 33 dòng và 31 nút rẽ nhánh (AC-27.7, AC-27.9); không lỗi
console; cả hai ngôn ngữ không có dấu thiếu bản dịch.

---

## Phase 35 — số đo thật, và một lỗi chặn việc đóng spec

### Lỗi chặn: mở một trận đã lưu của đội hơn 18 người làm TRẮNG cả ứng dụng

Ba thao tác tái lập: sinh một đội rồi thêm người cho tới 29–30 (hoặc nhân bản
một đội như thế) → đá một trận 11 người giữa hai đội ấy → Lịch sử → "Mở lại".
Kết quả: `#root` còn 0 phần tử, trang trắng, phải tải lại. Console ghi
`Uncaught LoiCauHinhTran: Không bắt đầu được trận: chua-dung-du-bi,
chua-dung-du-bi`, ném từ trong một `useMemo`.

Chuỗi nguyên nhân, đã đi hết tới tận bản ghi trong IndexedDB:

1. `ui/pages/ChonCapDau.tsx:284` đăng ký `cacCauThu` = CẢ ĐỘI (29/30 người),
   còn `duBi` = đúng 7 người đã chọn. Hợp lệ, vì engine cần hồ sơ của mọi
   người có thể vào sân.
2. `engine/tran.ts:1274 dangKyTuTrangThai` dựng LẠI `duBi` = `cacCauThu` trừ
   người xuất phát → 18/19 dự bị, dù `BenTran.duBi` (dòng 178) đang giữ sẵn
   đúng 7 người.
3. `hooks/useMatch.ts:87-88` dùng hàm ấy để dựng bản ghi đem lưu → bản ghi
   trong store `matches` có `duBi` = 18 và 19 (đã đọc tận IndexedDB).
4. Phase 34 `services/phatLai.ts:68 cauHinhTuBanGhi` chép y nguyên rồi gọi
   `taoTran` → `kiemTraMotBen` từ chối `chua-dung-du-bi` bằng cách NÉM → không
   ai bắt → cả cây React bị tháo.

**Vì sao không test nào bắt được:** mọi fixture (`benMau`, `benMauTheoSoDo`)
đăng ký đúng 11 + 7 = 18 người, nên `cacCauThu` trừ người xuất phát luôn ra
đúng 7. Quét 60 trận fixture: không ca nào lệch. Lỗi chỉ hiện khi đội có
**nhiều hơn quânSố + 7** người — mà spec 004 vừa biến việc đó thành một cú bấm.

**Phase 34 làm nó từ im lặng thành chết màn hình.** Trước Phase 34 trang lịch
sử chỉ hiển thị bản ghi; T432 thêm `tranDauCuaBanGhi` useMemo gọi `taoTran`
ngay khi mở một trận, nên những bản ghi hỏng sẵn kia giờ giết cả trang. Vì thế
T439 chưa làm: AC-27.1 và AC-27.3 không đi được trên loại bản ghi ấy, và trường
hợp biên mục 5 ("từ chối kèm lý do") đang bị thay bằng trang trắng.

Ba hướng sửa, chưa làm vì nằm ngoài danh sách file của Phase 35 và một hướng
chạm engine (ràng buộc cứng của spec — phải hỏi, không tự đổi):

- **(a) Chặn sập** (`phatLai.ts` / `useRePhatLai.ts` / `TrangLichSu.tsx`): bắt
  `LoiCauHinhTran` và từ chối kèm lý do, đúng như đã làm cho "đội đã bị xoá" và
  "engine cũ hơn". Bắt buộc có, dù chọn hướng nào — nhưng một mình nó thì đội
  lớn vẫn không rẽ nhánh được.
- **(b) Thôi sinh ra bản ghi hỏng** (`useMatch.ts:87-88`): lưu đúng băng ghế đã
  đăng ký thay vì tính lại. Không chạm engine. Chỉ cứu trận mới; trận đã lưu
  vẫn phải nhờ (a). Lưu ý `BenTran.duBi` lúc hết trận là băng ghế CUỐI trận,
  không phải lúc đăng ký, nên muốn đúng tuyệt đối còn phải cộng lại những người
  đã vào sân.
- **(c) Sửa gốc** (`engine/tran.ts:1284`, một dòng: `duBi: ben.duBi`): chữa cả
  nút "Đấu lại cùng mã trận" ở trang trận. Hàm này không tham gia mô phỏng nên
  `PHIEN_BAN_ENGINE` vẫn là 5 — nhưng nó NẰM TRONG `src/engine/`, nên theo đúng
  ràng buộc xuyên suốt của spec thì phải dừng và hỏi.

### T438 — số đo (bản build `vite preview`, cổng 4173)

Mốc đo: từ lúc bấm (`click` thật, bắt ở capture-phase) tới lúc
`MutationObserver` trên `#root` **lặng 300ms** — tức tới lúc DOM đổi xong,
không phải tới lúc nhìn thấy; pane không được vẽ nên không đo được thời điểm
nhìn thấy.

| Ngân sách spec mục 6 | Đo được | Giới hạn |
|---|---|---|
| Sinh một đội | 31,0 / 53,8 / 99,4 ms (ba lần, đội 18 người) | < 2 s |
| Nhân bản đội 30 cầu thủ | 86,8 ms | < 2 s |
| Gõ ô lọc, đội 30 người | 1,3 ms (từ sự kiện `input` tới DOM lặng) | < 100 ms |
| Chạy hết trận 90 phút, **sân 2D bật** | 62,7 ms tới chữ "Trận đã kết thúc"; 255,8 ms tới lúc DOM lặng (báo cáo + 86 dòng) | < 3 s |
| Chạy nốt một trận rẽ nhánh | 64,6 ms (một lần commit của React, có cả bảng so sánh) | < 3 s |

### T438 phép đo 2 — công việc mỗi khung vẽ

Đo khi trận **đang phát theo đồng hồ**, 22 điểm cùng nội suy, trong cùng một
trận để hai cửa sổ đo so được với nhau:

- Thân `requestAnimationFrame` mỗi khung: p50 **0,1 ms**, p95 0,2 ms, max
  **0,3 ms** ở mức Thường (nhịp 200 ms); p50 0,1 ms, p95 0,3 ms, max **1,0 ms**
  ở mức Nhanh (nhịp 70 ms). Tức ≤ 0,15% và ≤ 1,4% một nhịp.
- Bộ đo nghẽn luồng chính (vòng `setTimeout(0)`, nền bị kẹp ~15 ms): **ẩn sân**
  p95 21,3 ms / max 27,7 ms; **hiện sân** p95 17,7 ms / max 25,5 ms. Không tác
  vụ nào quá 50 ms ở cả hai. Bật sân không làm số nào xấu đi — chênh lệch nằm
  trong nhiễu.
- Trong 1,6 s lấy mẫu, 22 điểm đi qua **51–52 trạng thái toạ độ khác nhau**,
  tức chúng thật sự chạy qua các điểm trung gian chứ không nhảy mốc.

**Điều kiện đo, phải ghi rõ:** pane trình duyệt của phiên này không được hiển
thị trong cửa sổ nào, nên `requestAnimationFrame` **không chạy một khung nào**
(đo thẳng: 0 khung trong 1,5 s dù `visibilityState` là `visible`) — đúng vật
cản đã chặn T035 spec 001 và Phase 33. Để đo được, `requestAnimationFrame` bị
thay bằng `setTimeout(16ms)`, và nhịp thật ra ~31 ms vì bị kẹp. Vậy con số trên
là **công việc JS mỗi khung**, không phải chi phí vẽ/ghép ảnh thật, và phần
"không rơi nhịp" theo nghĩa màn hình vẫn phải xem trên trình duyệt thật.

### T437 — kiểm được bằng mắt, bốn tổ hợp (Việt/Anh × Sáng/Tối)

- **Tương phản:** quét 468 nút văn bản đang hiện, tính tỉ số WCAG của màu chữ
  trên màu nền thật (đã gộp mọi lớp nền trong suốt), ngưỡng 4,5:1 và 3:1 cho
  chữ lớn: **0 chỗ dưới ngưỡng** ở cả bốn tổ hợp (nền sáng `rgb(246,248,245)`,
  nền tối `rgb(14,21,18)`).
- **Thiếu bản dịch:** ở giao diện Anh, quét mọi nút văn bản có dấu tiếng Việt →
  96 chuỗi, tất cả là **dữ liệu người dùng**: tên đội, tên cầu thủ, và câu
  tường thuật mẫu tiếng Anh có chèn tên Việt. Không một nhãn giao diện nào.
- **AC-24.1/24.3/24.5/24.6:** sinh cả hồ sơ điền đủ 23 ô, không ô nào
  `readOnly` hay `disabled`; 30 số áo trong một đội đều khác nhau; hai lần sinh
  ra hai đội khác nhau.
- **AC-24.4:** đội 18 người sinh ra có sẵn đội hình đủ 11 ô + 7 ngoài sân và
  câu "Đội hình đã đủ điều kiện thi đấu".
- **AC-24.8 cả hai nửa:** giao diện Việt sinh tên Việt; giao diện Anh sinh
  "Kieran Haldane", "Rupert Whitcombe", đội mặc định "Random team"; đổi ngôn
  ngữ thì tên đã sinh **giữ nguyên**. Hậu tố "(bản sao)" cũng đóng băng theo
  ngôn ngữ lúc nhân bản — đúng tinh thần ấy.
- **AC-26.1/26.2:** 30 dòng của bản sao khớp đội gốc từng ô (số áo, tên, tuổi,
  vị trí, chân thuận, chỉ số tổng); xoá một người ở đội gốc thì bản sao vẫn 30,
  sửa tên ở bản sao thì đội gốc không có chữ nào đổi.
- **AC-26.3:** hộp nhân bản nói trước, bằng cả hai thứ tiếng, rằng bản sao
  không mang ảnh chân dung và logo, kèm "Đây là chủ đích, không phải lỗi".
- **AC-26.4/26.5/26.6/26.7:** lọc tên + vị trí + chân thuận + tuổi + chỉ số
  tổng kết hợp được (TĐ + chân phải + 18–30 tuổi + ≥15 → 1 trên 30); câu "Đo ở
  vị trí tốt nhất của từng cầu thủ"; "Đang hiện N trên M"; không ai khớp thì
  "KHÔNG CÓ CẦU THỦ NÀO KHỚP" + "Xoá bộ lọc", bấm vào thì về đủ 30.
- **AC-26.8/26.9/26.10:** mỗi ô ghi "Chọn vì đúng sở trường" (Anh: "Chosen:
  this is their own position"); đội 3 người → "Đã xếp 3 ô" + "còn 8 ô trống vì
  đội không đủ người" + mỗi ô trống ghi "Để trống: đội đã hết người"; đội rỗng
  → "Đội chưa có cầu thủ nào…", không màn hình trống; sau khi tự chọn, cả 11 ô
  vẫn `tabIndex=0` và không `disabled`.
- **AC-25.5:** cùng một mã trận chạy hai lần, một lần sân bật một lần sân ẩn →
  văn bản trang **giống nhau từng ký tự** (8841 ký tự): tỉ số, từng dòng tường
  thuật, 12 chỉ tiêu, điểm từng cầu thủ. Cộng với `git diff` của cả spec trên
  `src/engine/` chỉ có đúng một file test (+68 dòng, chính T420), còn
  `src/storage/` **rỗng hoàn toàn**.
- **AC-25.6:** giả lập hệ điều hành bật giảm chuyển động (`matchMedia` trả
  `matches: true`) → **0 khung** trong 1,75 s phát trực tiếp, trong khi cùng
  cửa sổ ấy lúc bình thường có 55–64 khung; vị trí vẫn đổi 8 lần, tức vẫn đúng
  mốc, chỉ không nội suy. Đây là thứ Phase 33 chưa nhìn thấy được.
- **AC-25.7:** trong MỘT chặng chuyển động, cùng một thời điểm, sáu điểm có di
  chuyển đã đi được **12%, 12%, 25%, 28%, 57%, 58%** quãng đường của mình. Một
  hàm giảm tốc dùng chung sẽ cho sáu con số bằng nhau; chênh gần 5 lần chính là
  dáng chuyển động theo thể lực (D88). Cả sáu cùng tới đích trong chặng.
- **AC-25.8:** nhãn chữ "Kiệt sức" có mặt trong tường thuật (5 dòng một trận),
  nên tốc độ di chuyển không phải kênh duy nhất báo thể lực.
- **AC-27.1/27.2/27.3/27.7/27.9/27.10:** rẽ nhánh ở phút 51, đổi pressing sang
  Cao → **41 dòng tới phút 51 giống trận gốc từng chữ** (so bằng mã, lệch đầu
  tiên: không có), mốc "TỪ PHÚT 51' TRỞ ĐI LÀ NHÁNH KHÁC" đứng đúng chỗ, bảng
  so sánh 12 chỉ tiêu + tỉ số 0–1 → 1–0 kèm nhãn chữ "Giống/Khác trận gốc";
  **0 nút "Rẽ nhánh"** trong phần tường thuật của nhánh; rời màn hình thì bị
  hỏi trước, focus sẵn ở "Huỷ", đồng ý thì khối nhánh mất hẳn mà trận gốc còn
  đủ 85 dòng và 79 nút rẽ nhánh.
- **AC-27.5 — nay đã kiểm được bằng mắt.** Hạ `phienBanEngine` của một bản ghi
  xuống 4 ngay trong IndexedDB (đúng việc "sửa tay một bản ghi" mà Phase 34 đề
  nghị), mở lại: hai câu từ chối hiện ra ở cả hai thứ tiếng ("Không đấu lại
  được…", "Không rẽ nhánh được…"), nút "Đấu lại trận này" `disabled`, 0 nút rẽ
  nhánh, mà trận vẫn xem lại được. Đã trả bản ghi về 5 sau khi kiểm.
- **AC-27.8:** dòng phút 0 không có nút rẽ nhánh (79 nút cho 85 dòng), và màn
  nhánh nói rõ khoảng phút chọn được.
- Không một lỗi console nào trong cả lượt đi, trừ đúng lỗi chặn ở trên.

### Những gì môi trường này KHÔNG kiểm được

- **Độ mềm của đường cong bằng mắt người** (AC-25.1): có số (51–52 trạng thái
  trung gian, 22 điểm) nhưng không có ai nhìn, vì pane không được vẽ nên cả
  `requestAnimationFrame` lẫn ảnh chụp đều không có.
- **Kéo-thả giữa hai ô bằng bàn phím** (AC-26.10 phần bàn phím): nhấc lên và
  đặt xuống CHẠY và có thông báo cho trình đọc màn hình ("Placed in Left back
  slot."), nhưng phím mũi tên không đổi được ô đích — 5 lần sang phải, khoảng
  cách hai ô chỉ 99px, vẫn "Now over Left back slot.". Toạ độ kéo-thả của
  `@dnd-kit` cập nhật theo `requestAnimationFrame`, mà ở đây rAF không chạy,
  nên **nghi là vật cản môi trường, chưa kết luận là lỗi** — cần xem lại trên
  trình duyệt thật.
- **Xuất/nhập tệp sao lưu qua hộp thoại tệp** (Definition of Done): chưa đi
  bằng tay. Căn cứ thay thế: `git diff` của cả spec trên `src/storage/` rỗng,
  nên định dạng tệp sao lưu không đổi một byte nào.

### Ba phát hiện phụ, ngoài phạm vi spec 004 — ghi ra chứ không tự sửa

1. **`<html lang="vi">` cố định** trong `index.html:2` và không đổi khi người
   dùng sang English (`hooks/useNgonNgu.ts` chỉ đặt `data-che-do`). Trình đọc
   màn hình sẽ đọc tiếng Anh bằng giọng Việt. Thuộc spec 003.
2. **Nút "Đấu lại cùng mã trận" ở trang trận không làm gì và không nói gì** khi
   đội có hơn 18 người — cùng gốc với lỗi chặn ở trên (`cauHinhDauLai` →
   `dangKyTuTrangThai`), nhưng `TrangTran.tsx` **không vẽ** `lyDoKhongBatDau`
   (chỉ `ChonCapDau.tsx:523` vẽ), nên lời từ chối không tới được người dùng. Đã
   xác nhận `onClick` trả `false`. Cả `useMatch.ts` lẫn `TrangTran.tsx` spec 004
   không sửa một dòng.
3. **Ô lọc tên không bỏ dấu:** gõ "nguy" ra 3 người, gõ "nguyen" ra 0 người
   trong một đội đầy "Nguyễn". AC-26.4 không đòi bỏ dấu, nên không phải vi phạm
   — nhưng với người dùng Việt gõ không dấu thì đó là một cái bẫy.

## Ghi chú thực thi

- **Chuỗi phụ thuộc dài nhất** nằm ở Phase 34: T427 → T428 → T431 → T433 →
  T434/T435/T436 → T437 → T438 → T439, tức **9 mắt**. Phase 29–32 chuỗi dài
  nhất chỉ 3 mắt; Phase 33 là 4 mắt (T421 → T422 → T423 → T425) sau khi
  `/analyze` xếp T425 xuống sau T423.
- **Chạy song song được:** ba nhánh gần như độc lập — Phase 29→30 (sinh),
  Phase 31+32 (dựng đội nhanh), Phase 33 (chuyển động), Phase 34 (rẽ nhánh).
  Trong từng phase, T410 và T413 độc lập nhau; T420, T421 và T427 độc lập
  với mọi thứ khác và làm được ngay từ đầu.
- **T420 cố tình nằm sớm.** Nó không phục vụ tính năng nào — nó là lưới an
  toàn cho rủi ro R33. Làm nó trước Phase 33 và 34 thì mọi lần chạy test sau
  đó đều kiểm hộ rằng engine chưa bị đụng.
- **Hiến pháp mục 4:** T400, T402, T405 chạm `domain`; T407, T410, T427
  chạm lớp đọc/ghi dữ liệu — tất cả đều **chưa xong nếu chưa có test**
  (T401, T403, T406, T408, T411, T429/T430).
- **Phase 33 — thứ KHÔNG kiểm được bằng mắt ở môi trường này.**
  `requestAnimationFrame` không chạy khi pane trình duyệt bị ẩn, mà phiên
  làm việc này không mở được pane — đúng vật cản đã chặn T035 của spec 001.
  Vì thế **chuyển động** chưa được nhìn tận mắt: độ mềm của đường cong
  (AC-25.1), độ trễ của người kiệt sức (AC-25.7), và sự KHÁC BIỆT khi bật
  giảm chuyển động (AC-25.6) đều chỉ có bằng chứng từ test, không từ màn
  hình. T437 phải xem lại ba điều ấy trên trình duyệt của người dùng.
  Những thứ ĐÃ kiểm được trên ứng dụng đang chạy: trận chạy trọn vẹn với 22
  điểm và không lỗi console; toạ độ dừng ĐÚNG mốc và đứng yên sau đó
  (AC-25.2); nhãn chữ kiệt sức có mặt trong tường thuật, sáu dòng trong một
  trận (AC-25.8); đường giảm chuyển động chạy không lỗi và vẫn cho đúng toạ
  độ mốc. AC-25.3 và phần "thể lực không đụng vào thời lượng" của AC-25.7
  chứng minh bằng SỐ trong `noiSuy.test.ts`, không cần mắt.
- **Đổi tên một mã lý do khi làm T416.** Bộ mã ở T416 ghi `lap-cho-trong`,
  nhưng thuật toán không có trường hợp nào "lấp chỗ trống": người được xếp
  vào ô lệch đã có mã `xep-sai-nhe`/`xep-sai-vua` rồi. Trường hợp thật sự
  cần một mã riêng là ô **trống dù đội còn người** — ai còn lại cũng lệch mức
  `nang` nên thuật toán thà để trống. Mã ấy nay là `khong-ai-xep-duoc`, và nó
  phân biệt với `thieu-nguoi` (ô trống vì hết người): hai câu trả lời khác
  nhau, hai việc phải làm khác nhau. Vẫn đúng năm mã như T416 chốt.
- **Phạm vi thật của Phase 29–30 so với danh sách file:** T404 và T409
  chạm thêm `src/store/appStore.ts` ở dạng ĐỌC (`useAppStore((s) => s.ngonNgu)`)
  để chọn kho tên — đúng nếp sáu file `ui` khác đang dùng, không sửa store.
  T409 **không** phải sửa `ui/ngonNgu/index.ts`: khối `DANH_SACH_DOI` đã có
  sẵn nên thêm khoá vào `vi.ts`/`en.ts` là đủ. T409 gọi `teamRepo` trực tiếp
  từ `ui`, đúng nếp `ChonCapDau`/`TrangDoi`/`TrangLichSu`/`TrangTran`, nên
  không thêm hàm vào `hooks/useTeams.ts`.
- **Bài học của spec 003 về danh sách file:** danh sách file ở trên đã
  `grep` trước khi chốt — `sinhChiSo` và `CAC_MUC_DO` hiện chỉ có `domain/
  generator.ts` và `FormCauThu.tsx` đọc; `xepLaiKhiDoiSoDo` có `useTactic.ts`
  đọc. Nếu lúc làm thấy phạm vi rộng hơn danh sách, **ghi lại vào đây** thay
  vì lặng lẽ sửa thêm file.
- **P8 lặp lại ở 7 task** (T404, T409, T412, T413, T414, T418, T432, T433,
  T434, T435, T436): chuỗi mới phải có đủ hai ngôn ngữ **trong cùng commit**.
  Đây là cái giá cố định của mọi tính năng kể từ hiến pháp 2.0.0.

## Sửa theo `/analyze` ngày 2026-11-17

`/analyze` ra 15 phát hiện; năm mục nặng đã sửa vào ba tài liệu, mười mục
còn lại (7 MEDIUM + 3 LOW) **chưa sửa** và còn mở.

| Mức | Sửa ở đâu | Việc gì |
|---|---|---|
| CRITICAL | spec AC-25.7 + AC-25.9 + mục 6, plan **D88**, T423, T425 | AC-25.3 và AC-25.7 không thể cùng đúng: `thoiGianChuyen` đã bằng 90% một nhịp (180/63/**18**ms), nên "di chuyển chậm hơn" đẩy điểm vượt tình huống kế tiếp. Chốt: thể lực đổi **dáng** chuyển động, không đổi thời lượng |
| HIGH | plan D84, T416, T417 | Bỏ mã lý do `'chi-so-cao-nhat'` — thuật toán không đọc chỉ số nên không sinh ra được nó; sinh được là đổi luật phá hoà của ba nơi gọi. Thêm cảnh báo `lineup.ts` được `engine/batDau.ts` import |
| HIGH | spec AC-25.9 + mục 6, plan D86, T438 | Ngân sách cũ chỉ đo chế độ chạy ngay — đúng con đường mà nội suy không chạy. Thêm phép đo thứ hai lúc đang phát theo đồng hồ |
| HIGH | T437 | Phụ thuộc bỏ sót sáu task tạo màn hình mới: T404, T415, T419, T425, T434, T435 |
| HIGH | plan mục 0 + D83, T407 | `xepLaiKhiDoiSoDo` lấy người từ `oVienCu` chứ không từ `cacCauThu`; "dùng lại lớp xếp" chỉ chạy nếu truyền cả đội vào làm `oVienCu` giả |

**Mười mục còn mở** — xử lý được lúc làm đúng task đó, không chặn `/implement`:
T420 trùng với `src/engine/tuongThichV5.test.ts` đã có (508 dòng, từ T223);
T413 chưa nói xử lý người **không tính được** chỉ số tổng (`chiSoTongTheoViTri`
trả `{tinhDuoc:false}`); T405 cần `SO_CAU_THU_DU_BI_TOI_DA` mà hằng số ấy nằm
ở `engine/batDau.ts:28`, phải truyền vào qua tham số chứ không import
(`domain` → `engine` là phụ thuộc vòng, và `domain/boundaries.test.ts` **không**
chặn nên không test nào bắt được); T433 chưa nói làm gì khi engine **từ chối**
can thiệp mới (`LyDoTuChoiCanThiep`); T402 chưa nói cách rút số áo (vòng bốc
tới khi chưa trùng sẽ treo khi hết số) và trường hợp biên "hết số áo hợp lệ"
chưa có task; T411 chưa kiểm nhân bản **thất bại trọn vẹn** và nhân bản đội
rỗng; cộng ba mục LOW (số đếm "7 task" ở trên thật ra là 11; `RNG_THAT` là
const cục bộ trong `FormCauThu.tsx:47`, nên export một lần thay vì chép lần
thứ ba; `prefers-reduced-motion` chưa có ở đâu trong `src/` và `theme.test.ts`
tự phân tích `index.css`).
