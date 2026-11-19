# Tasks: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 21 AC (US-33 → US-36), 16 quyết định D101–D116 |
| **Tiến độ** | 18/23 — T609 và T610 **bị bỏ** ngày 2026-11-19, xem Phase 50 |
| **Sửa đổi** | 2026-11-19 — chẻ lần đầu từ plan |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Số task bắt đầu từ **T600** để không lẫn với T001–T136 (spec 001), T200–T224 (002),
T300–T344 (003), T400–T441 (004) và T500–T526 (005). Sáu phase dưới đây là sáu lát cắt
dọc ở `plan.md` mục 9; mỗi phase kết thúc là một ứng dụng xem được (hiến pháp P6), và
là một commit.

> ⚠️ **Ràng buộc xuyên suốt: KHÔNG ĐỔI KẾT QUẢ TRẬN.** Spec này **được phép chạm**
> `src/engine/`, điều bốn spec trước cấm — nhưng chỉ để cho dữ liệu **đã tính sẵn** đi
> kèm ra ngoài. `PHIEN_BAN_ENGINE` giữ **5**, `DB_VERSION` giữ **3**, và
> **`git diff src/engine/` không được chứa chữ `rng`**.

> ⚠️ **Bốn thứ KHÔNG ĐƯỢC SỬA** trong cả spec này:
> 1. `src/engine/tuongThichV5.test.ts` — lưới so từng ký tự mọi dòng tường thuật.
> 2. `src/services/phatLai.test.ts` — lưới của đường phát lại.
> 3. Describe **"toạ độ tại mốc không bao giờ sai"** trong `src/ui/noiSuy.test.ts` (R38).
> 4. Ba phép kiểm bất biến trong `src/ui/san2D.test.ts`: không chồng khít trên 10 mã
>    trận; thủ môn trong một phần ba sân; tám hàng xen kẽ ở chín tổ hợp độ cao.
>
> Ba cái cuối phải **chạy lại ở MỖI lát**, vì R48 nói người không bóng di chuyển mạnh
> hơn là thứ làm vỡ trật tự tám hàng vừa sửa ở T523.

---

## Phase 47 — Lát 47: Bóng biết mình đang là gì

- [x] **T600** — `cacBuocBong` đi từ engine ra ngoài
  - File: sửa `src/engine/suKien.ts`, sửa `src/engine/tran.ts`, sửa `src/engine/suKien.test.ts`
  - Xong khi: `SuKien` có trường **tuỳ chọn** `cacBuocBong?: readonly { vung: VungSan; loai: LoaiHanhDong | null }[]`; `duongBongCuaChuoi` trả cả loại trong **cùng một phép map**; phép kiểm mới chứng minh `cacBuocBong.map(b => b.vung)` khớp `duongBong` **từng phần tử** trên 10 mã trận × 7 quân số, và phần tử cuối có `loai` là `null` đúng khi nó là `vungKetThuc` được nối thêm.
  - Xong khi (R46, bắt buộc kiểm bằng mắt): `tuongThichV5.test.ts` và `phatLai.test.ts` **xanh mà không sửa một dòng**; `PHIEN_BAN_ENGINE` vẫn 5; `DB_VERSION` vẫn 3; `git diff -U0 -- src/engine/ ':!*.test.ts'` **không chứa chữ `rng`** — xem ghi chú Phase 47 về lý do phải có `-U0`.
  - Bằng chứng: **số**.
  - AC: AC-34.4
  - Phụ thuộc: —
  - ⚠️ **Tuỳ chọn chứ không bắt buộc**, và đó là một quyết định chứ không phải lười: bản ghi trận cũ trong IndexedDB **thiếu** trường này, nên kiểu phải nói thật điều đó để giao diện buộc phải gác (D110). Phụ phẩm: `suKien.test.ts` và `tuongThuat.test.ts` — ba chỗ dựng `SuKien` bằng tay — **không cần sửa**; nếu chúng đỏ thì nghĩa là trường đã bị khai bắt buộc.

- [x] **T601** — Module thuần `phaBong.ts`: dòng thời gian của một pha bóng
  - File: tạo `src/ui/phaBong.ts`, tạo `src/ui/phaBong.test.ts`
  - Xong khi: `dongThoiGianPhaBong` nhận (sự kiện, toạ độ các vùng, nhịp) và trả danh sách **đoạn** `{ tu, den, loai, tiLeBatDau, tiLeKetThuc }`; tổng thời lượng **không vượt một nhịp** kể cả pha 12 bước (`SO_BUOC_TOI_DA`); thiếu `cacBuocBong` → trả **đúng một đoạn** bằng cách vẽ của spec 005 (D110); hàm thuần — thay `Math.random` và `Date.now` thành hàm ném lỗi rồi gọi vẫn chạy.
  - Bằng chứng: **số**.
  - AC: AC-34.3
  - Phụ thuộc: T600

- [x] **T602** — Lớp vẽ dùng dòng thời gian: chuyền và sút vụt đi, rê bóng thì không
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: đoạn `chuyen` / `tat-canh` / `sut` dùng thời lượng `msChuyen / BONG_NHANH_GAP` như D95; đoạn `re-bong` dùng thời lượng **của người**; cú sút kết thúc ở vùng dứt điểm của dòng; ba phép kiểm bất biến vẫn xanh.
  - Xong khi (hiến pháp P5, phát hiện số 5 của `/analyze`): **phép kiểm thuần** cho `thoiLuongDoan` — cùng một quãng đường thì đoạn `chuyen`/`sut` nhanh hơn đoạn `re-bong` **ít nhất ba lần**, ở **cả năm mức tốc độ**. AC-35.1 và AC-35.4 là AC dạng so sánh nên **không được chỉ đo trên bản build**; con số đo trên build là bằng chứng thứ hai, không phải thứ nhất.
  - Bằng chứng: **số** cho tỉ lệ ba lần; **mắt** cho "nhìn ra đó là một đường chuyền".
  - AC: AC-35.1, AC-35.3, AC-35.4, AC-35.5
  - Phụ thuộc: T601

---

## Phase 48 — Lát 48: Nhìn ra ai đang giữ bóng

- [x] **T603** — `nguoiGiuBong`: quy tắc tất định theo từng loại sự kiện
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: hàm trả người giữ bóng theo **đúng bảng 3.1 của plan**, và phép kiểm phủ **từng** `LoaiSuKien` trong mười bốn loại — kể cả ba loại trả `null` (`bat-dau`, `het-hiep`, sau `ban-thang`) và hai loại lấy **phần tử thứ hai** (`cuu-thua` lấy thủ môn, `mat-bong` lấy người cướp được).
  - Xong khi (D112, phát hiện số 1 của `/analyze`): `nguoiNhanChuyen` trả **đồng đội đứng gần vùng đích của bước nhất**, trừ chính người vừa chuyền; hòa thì lấy `playerId` nhỏ hơn nên luật **tất định**; phép kiểm: gọi hai lần trên cùng một đầu vào ra cùng một người, và người ấy **luôn thuộc đội đang cầm bóng**.
  - ⚠️ **Người nhận là một SUY DIỄN, không phải sự thật của trận** — engine chưa bao giờ tính ra anh ta. Nó được phép tồn tại **chỉ trong lớp vẽ**: không được vào dòng tường thuật, không vào thống kê, không lưu xuống đĩa.
  - Bằng chứng: **số**.
  - AC: AC-33.5, AC-35.2
  - Phụ thuộc: T601

- [x] **T604** — Xương sống: quyền giữ bóng KHÔNG nhảy giữa hai nhịp
  - File: sửa `src/ui/phaBong.test.ts`
  - Xong khi: chạy hết một trận trên 10 mã trận × 7 quân số, áp `nguoiGiuBong` cho từng dòng theo thứ tự; đếm số lần quyền giữ bóng đổi **mà dòng ấy không nêu ai mới** — phải là **0**; và mọi dòng `the-vang` / `the-do` / `thay-nguoi` / `kiet-suc` đều giữ nguyên người cũ.
  - Bằng chứng: **số**.
  - AC: AC-33.5
  - Phụ thuộc: T603
  - ⚠️ Đây là lưới của **R50**. Không nhét vào T603: một phép kiểm "hàm trả đúng giá trị" và một phép kiểm "chuỗi giá trị qua cả trận không giật" là hai điều khác nhau, và cái thứ hai mới là thứ người xem thấy.

- [x] **T605** — Bóng dính chân, và vòng nét đứt quanh người giữ bóng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`, sửa `src/ui/san2D.test.ts`
  - Xong khi: khi bóng không đang bay, nó cách tâm người giữ bóng **dưới một bán kính điểm**, đo trên 10 mã trận; vòng **nét đứt** quanh người ấy, bán kính lớn hơn viền "tham gia tình huống" nên không lẫn, tương phản với mặt cỏ **≥ 4,5:1** ở cả hai chế độ màu; chuỗi cho trình đọc màn hình đủ Việt–Anh (P8); ba phép kiểm bất biến vẫn xanh.
  - Xong khi (phát hiện số 2 của `/analyze`): ở nhịp **không có pha bóng nào** (`thay-nguoi`, `kiet-suc`, dòng có đường bóng rỗng), bóng **bám chân người giữ bóng kể cả lớp dao động** của anh ta — nếu không thì bóng đứng im cả nhịp, đúng nguồn của **3144ms** mà spec này sinh ra để chữa.
  - Xong khi (R45 của spec 005, phát hiện số 4 của `/analyze`): bán kính vòng bị chặn dưới **sàn đã đo 1,80 bán kính** (khoảng cách gần nhất giữa hai điểm, đo trên 10 mã trận × 7 quân số sau T523), và phép kiểm "điểm không chồng khít" chạy **ở trạng thái đang có vòng**.
  - ⚠️ Spec 005 mắc đúng lỗi "phì to một điểm mà không đặt biên" **hai lần** ở R45. Một vòng quanh điểm cũng là phì to dấu chân của nó.
  - Bằng chứng: **số** cho khoảng cách và tương phản; **mắt** cho "không lẫn với dấu ▲".
  - AC: AC-33.1, AC-33.4, AC-33.5
  - Phụ thuộc: T603

---

## Phase 49 — Lát 49: Chạy với bóng trong chân

- [x] **T606** — Người giữ bóng đi theo đường của bóng, rồi về mốc của mình
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/components/San2D.tsx`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: trong một đoạn `re-bong`, người giữ bóng và quả bóng dùng **chung một đường** (D104); đoạn cuối của anh ta là **một đường thẳng về đúng mốc `hinhSan`** của chính anh ta (D105); đo trên bản build: khoảng cách người–bóng trong suốt đoạn rê luôn dưới một bán kính.
  - Xong khi (AC-35.2, D112): khi một đoạn `chuyen` kết thúc, bóng ở **trong một bán kính** quanh người nhận đã suy ra, và quyền giữ bóng chuyển sang anh ta **đúng lúc ấy** — không sớm hơn một khung nào; đo bằng chính dòng thời gian, không đo bằng mắt.
  - Bằng chứng: **số**.
  - AC: AC-33.2, AC-34.1, AC-35.2
  - Phụ thuộc: T605

- [x] **T607** — Xương sống: tại tỉ lệ 1, MỌI điểm vẫn ở đúng mốc — kể cả người dẫn bóng
  - File: sửa `src/ui/san2D.test.ts`
  - Xong khi: phép kiểm chạy 10 mã trận × 7 quân số × mọi dòng; tại tỉ lệ 1 của mỗi nhịp, toạ độ **từng** điểm khớp `hinhSan` tới 10 chữ số — **kể cả** điểm của người đang dẫn bóng; describe "toạ độ tại mốc không bao giờ sai" của `noiSuy.test.ts` **không sửa một dòng**.
  - Bằng chứng: **số**.
  - AC: AC-34.3
  - Phụ thuộc: T606
  - ⚠️ Lưới của **R47**, và nó giữ luôn AC-28.3 của spec 005 cùng AC-25.2 của spec 004. Phải nằm ngay sau T606 chứ không để tới lát cuối: lát 50 và 51 đều dịch chỗ người, và nếu bất biến này vỡ thì phải biết nó vỡ từ lát nào.

- [x] **T619** — Bóng lăn về chấm giao bóng sau một bàn thắng
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: dòng `ban-thang` có thêm một bước cuối tới **chấm giao bóng**, và dòng thời gian của riêng dòng ấy trải trên `msMoiPhut + MS_LANG_SAU_BAN_THANG` (D113); đo trên bản build: không còn quãng đứng im nào của bóng rơi vào một dòng bàn thắng.
  - Xong khi (R47): ba phép kiểm bất biến của `san2D.test.ts` và phép kiểm xương sống T607 **vẫn xanh** — bước thêm vào là bước của **đường VẼ**, `duongBong` và `bongTaiMoc` không đổi một phần tử nào.
  - Bằng chứng: **số**.
  - AC: AC-33.3
  - Phụ thuộc: T606
  - ⚠️ Phát sinh từ số đo của T608, không có trong bản chẻ đầu. Ba quãng đứng im dài nhất cả trận đều là bàn thắng.

- [x] **T620** — Đồng hồ của lớp dao động thôi đóng băng
  - File: sửa `src/ui/components/San2D.tsx`
  - Xong khi: `thoiDiemTran` là một **bộ cộng dồn trong vòng khung hình**, không còn `Math.min(1, …)` và không còn đọc `phutDongHo` (D114); đo trên bản build: trong mọi quãng bóng đứng im, tổng toạ độ của cả 23 nhóm vẽ **đổi khác 0**.
  - Xong khi (AC-28.5, AC-10.4 của spec 001): tạm dừng thì sân vẫn đóng băng — vòng khung hình tắt thì không ai cộng nữa, nên điều này đúng **bằng cấu trúc**, không cần thêm nhánh.
  - Bằng chứng: **số**.
  - AC: AC-33.3
  - Phụ thuộc: —
  - ⚠️ **Sửa một quyết định của spec 005** (D90, Phase 39). Người dùng đã chốt sửa ngày 2026-11-19 sau khi đọc số đo của lát 49.

- [x] **T621** — Người giữ bóng đã rời sân thì bỏ qua anh ta
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`, sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `nguoiGiuBong` nhận thêm một vị tệ `conTrenSan` **tuỳ chọn**; thiếu nó thì hàm cho **đúng bảng 3.1** như trước — kiểm được bằng việc mười một phép kiểm cũ của T603 và T604 **không phải sửa một dòng**.
  - Xong khi (D115): có vị tệ thì luật bỏ qua người đã rời sân và lấy người kế tiếp **trong chính dòng ấy**, rồi mới tới người giữ bóng cũ; phép kiểm phủ cả ba bước lùi.
  - Xong khi (số đo): trong phép kiểm vòng nét đứt trên 10 mã trận × 7 quân số, tỉ lệ dòng có người giữ bóng **không còn điểm trên sân** về **đúng 0** (trước: 2,82%, tức 148/5246).
  - Bằng chứng: **số**.
  - AC: AC-33.1, AC-33.3, AC-33.5
  - Phụ thuộc: T606
  - ⚠️ Phát sinh từ số đo của lát 49b. Đây là **nguyên nhân thứ ba** của việc bóng đứng im, và là cái cuối cùng còn lại trước khi chốt T608.

- [x] **T622** — Thủ môn không chạy theo đường bóng ra khỏi dải của mình
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: người mở một pha bóng chỉ là người giữ bóng của nhịp trước khi anh ta **thuộc đội của dòng ấy**; không thì suy lại bằng D112.
  - Xong khi (AC-30.7 của spec 005): toạ độ vẽ của thủ môn bị **kẹp vào `daiThuMon`** kể cả khi anh ta đang cầm bóng; phép kiểm dựng lại đúng phép tính của lớp vẽ trên 10 mã trận × 7 quân số × năm tỉ lệ nhịp.
  - Bằng chứng: **số** (đo được: thủ môn cầm bóng **3485 lần**, không kẹp thì ra ngoài dải **2318 lần**, xa nhất **61,7 đơn vị** trên sân dài 100) và **mắt** (người dùng).
  - AC: AC-30.7 (spec 005), AC-33.2
  - Phụ thuộc: T606
  - ⚠️ **Lỗi do người dùng bắt được bằng mắt trong khi 1291 phép kiểm đều xanh**: "thủ môn số 19 chạy loạn xạ khắp sân". Phép kiểm AC-30.7 cũ canh toạ độ của `hinhSan`, còn T606 kéo người giữ bóng đi ở **lớp vẽ** — chỗ mà bộ kiểm chạy ở `environment: 'node'` không nhìn tới.

- [x] **T623** — Người chuyền bóng không bay theo đường chuyền
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: cửa sổ cầm bóng chỉ kéo hết những đoạn bóng **còn trong chân** (`re-bong`, `giu`); đoạn `chuyen` / `tat-canh` / `sut` thì **bóng tự bay còn người đi chặng của mình** — đúng chữ của D104.
  - Xong khi: người nhận bóng rồi chuyền ngay có cửa sổ **rỗng** `[tA, tA]` — vẫn chạy tới điểm nhận bóng rồi về mốc, chỉ là không dính vào quả bóng.
  - Bằng chứng: **số** cho cửa sổ; **mắt** cho "hết giật cục".
  - AC: AC-33.2, AC-34.1, AC-30.10 (spec 005)
  - Phụ thuộc: T606
  - ⚠️ **Lỗi do người dùng bắt được bằng mắt**: "di chuyển đôi khi hơi nhanh… giật cục và không liền mạch". Bản đầu của T606 kéo cửa sổ qua cả đoạn chuyền, vì người chuyền vẫn là `nguoiGiu` của đoạn ấy — anh ta là người **rời** bóng ở đó. Hậu quả: anh ta bay theo đường chuyền ở tốc độ của bóng — **nhanh gấp ba tốc độ người** — rồi giật ngược về mốc.

- [ ] **T608** — Đo: quả bóng không còn đứng yên
  - File: — *(đo trên bản build)*
  - Xong khi: một trận trọn vẹn ở mức Chậm, quả bóng **không đứng yên quá 300ms** liên tục (trước spec này đo được **3144ms**, và tỉ lệ khung có bóng di chuyển là 35,5%); ghi cả hai con số mới vào mô tả commit.
  - Xong khi (phát hiện số 2 của `/analyze`): đo **riêng một phút `kiet-suc`** và **một phút `thay-nguoi`** — hai loại dòng không mang pha bóng nào, và là chỗ con số 3144ms sinh ra. Đo trung bình cả trận sẽ giấu đúng hai phút ấy.
  - Bằng chứng: **số**.
  - AC: AC-33.3
  - Phụ thuộc: T606

---

## Phase 50 — Lát 50: Qua người — ⚠️ **BỊ BỎ ngày 2026-11-19**

> **Người dùng chốt bỏ cả hai task của lát này** ở `/clarify` của spec 007 (câu 6 của
> nhật ký làm rõ, `specs/007-continuous-match-engine/spec.md`).
>
> **Lý do:** "đi vòng qua đối thủ" ở đây được dựng bằng cách **lách điểm ở tầng giao
> diện** — một phép lệch vuông góc áp lên đường rê bóng. Engine liên tục của spec 007 có
> **toạ độ mét thật** và cơ học chuyển động, nên ở đó việc đi vòng qua một người là **hệ
> quả tự nhiên** của mô hình, không phải một phép lệch bù vào sau. Làm T609 và T610 bây
> giờ là làm một việc biết trước là sẽ xoá.
>
> **Hệ quả phải nói rõ: AC-34.2 của spec 006 ĐÓNG MÀ CHƯA LÀM.** Nó được **hoãn sang
> spec 007**, không phải xong. Phần "hai điểm không được chồng khít" của AC-34.2 thì vẫn
> đang được giữ, vì nó chính là AC-30.5 của spec 005 và AC-15.2 của spec 002 — ba phép
> kiểm bất biến vẫn canh điều đó ở mọi lát.
>
> T611 có ghi `Phụ thuộc: T610`, nhưng Phase 51 đã **làm xong trước** Phase 50 nên phụ
> thuộc ấy chưa bao giờ chặn gì; bỏ Phase 50 không làm lệch lát nào đã đóng.

- [~] **T609** — ~~`lechTranhNguoi`: hàm thuần, có biên~~ — **BỎ** (xem đầu Phase 50)
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: nếu một điểm đối phương nằm trong hành lang quanh đoạn đang rê thì trả một lệch **vuông góc** với đoạn ấy, độ lớn bị chặn ở **một nửa khoảng cách hai hàng**; không ai cản thì trả `{0,0}`; đầu vào vô lý (`NaN`, đoạn dài 0, hai điểm trùng) không ném và không trả `NaN`.
  - Bằng chứng: **số**.
  - AC: AC-34.2
  - Phụ thuộc: T601

- [~] **T610** — ~~Áp vào lớp vẽ: người dẫn bóng đi vòng, không đi xuyên~~ — **BỎ** (xem đầu Phase 50)
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: đo trên bản build một trận trọn vẹn — trong các đoạn rê bóng, **không lượt cặp nào** (người dẫn bóng ↔ một đối thủ) nằm dưới một bán kính quá **300ms** liên tục, đo theo đúng cách đã dùng ở Phase 40 (theo dõi danh tính từng cặp); ba phép kiểm bất biến vẫn xanh.
  - Bằng chứng: **số**.
  - AC: AC-34.2
  - Phụ thuộc: T609, T607

---

## Phase 51 — Lát 51: Hai đội cùng sống theo bóng

- [x] **T611** — Hai nhóm, hai nguyên tắc
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `nghiengKhoiTheoBong` nhận thêm **vai trò** (đồng đội của người giữ bóng / đối phương); đồng đội được kéo thêm về phía khung thành đối phương, đối phương được kéo thêm về phía bóng; **tổng mọi lực kéo vẫn bị chặn ở một phần mười chiều dài sân** (AC-30.4 của spec 005), chứng minh bằng phép kiểm trên cả hai vai trò × bốn dải × hai đội.
  - Bằng chứng: **số**.
  - AC: AC-36.2, AC-36.3, AC-36.6
  - Phụ thuộc: T610

- [x] **T612** — Ba phép kiểm bất biến chạy lại, và chúng là tiêu chí xong
  - File: sửa `src/ui/san2D.test.ts`
  - Xong khi: sau T611, ba phép kiểm vẫn xanh **không nới một ngưỡng nào** — không chồng khít trên 10 mã trận; thủ môn không rời một phần ba sân nhà; tám hàng xen kẽ đúng thứ tự ở **chín tổ hợp độ cao đội hình**; nếu một cái đỏ thì **siết lực kéo của T611**, không nới ngưỡng.
  - Bằng chứng: **số**.
  - AC: AC-36.4
  - Phụ thuộc: T611
  - ⚠️ Lưới của **R48**. Câu "nếu đỏ thì siết cái vừa thêm, không nới cái đã có" là bài học của T511 ở spec 005.

- [x] **T624** — Nới trần nghiêng khối lên một phần sáu
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `BIEN_NGHIENG_KHOI` là **1/6** (D116); hai phép kiểm của T510 và phép kiểm trần của T611 canh con số mới, kèm chú thích vì sao đổi.
  - Xong khi (R48): ba phép kiểm bất biến **vẫn xanh**; sàn hai điểm gần nhau nhất đo lại là **1,3108 bán kính**, và `VONG_GIU_BONG_THEM` **tự thu lại** từ 1,2 xuống **1,054** đơn vị vì `Math.min` chuyển biên ràng từ dấu ▲ sang sàn.
  - Bằng chứng: **số**.
  - AC: AC-36.2, AC-36.3, AC-36.6
  - Phụ thuộc: T611
  - ⚠️ **Đổi một con số của AC-30.4 (spec 005)**. Spec 005 đã đóng nên AC của nó không sửa ngược; D116 thay con số đang chạy. Người dùng chốt 2026-11-19 sau khi đọc số đo của lát 51.

- [x] **T613** — Đo: mọi điểm di chuyển có mục đích
  - File: — *(đo trên bản build)*
  - Xong khi: một trận ở mức Chậm — trong **mỗi nhịp**, **mọi** điểm đổi chỗ theo một hướng có nghĩa, đo bằng quãng đi được mỗi nhịp của từng người (trước spec này: trung vị **2,3** đơn vị); và với mỗi pha người giữ bóng tiến lên, đếm được **ít nhất một đồng đội** cũng tiến lên trong cùng nhịp.
  - Bằng chứng: **số**.
  - AC: AC-36.1, AC-36.2
  - Phụ thuộc: T611

---

## Phase 52 — Lát 52: Xem chậm, đo ngân sách, đóng spec

- [x] **T614** [P] — Mức tốc độ thứ năm: Rất chậm, 2000ms một phút trận
  - File: sửa `src/hooks/useMatch.ts`, sửa `src/ui/components/BangDieuKhienTran.tsx`, sửa `src/ui/pages/TrangTran.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: `rat-cham: 2000` xếp **đầu** `CAC_MUC_TOC_DO`, **mặc định vẫn là `cham`** (D107); nhãn đủ hai thứ tiếng; chọn được bằng bàn phím; `noiSuy.test.ts` và `san2D.test.ts` tự động phủ mức mới qua ba phép kiểm duyệt `Object.entries(MS_MOI_PHUT)` và **vẫn xanh**.
  - Bằng chứng: **số**.
  - AC: AC-33.6
  - Phụ thuộc: —
  - ⚠️ **Phạm vi thật là năm file, không phải ba.** Đã grep: `MucTocDo` xuất hiện ở `useMatch.ts` (6), `BangDieuKhienTran.tsx` (7) và **`TrangTran.tsx` (2)** — file thứ ba này là chỗ dễ quên nhất. Hai file test **không sửa**: chúng tự duyệt bảng nên tự phủ mức mới; nếu phải sửa chúng thì nghĩa là mức mới phá một tính chất, không phải thiếu phép kiểm.
  - ✅ **Làm xong 2026-11-19, và phạm vi thật hoá ra là BỐN file, không phải năm.** `TrangTran.tsx` đọc `tocDo` nhưng **không còn gọi tên kiểu `MucTocDo`** — T620 (D114) đã gỡ `phutDongHo` khỏi `Props` của sân, và hai chỗ gọi tên kiểu ấy đi theo. Con số "năm file" trong bản chẻ là đúng **lúc chẻ**; nó cũ đi vì một task sau đó.
  - ✅ **Hai file test không phải sửa một dòng**, đúng như tiêu chí đặt ra: **năm vòng duyệt** `Object.entries(MS_MOI_PHUT)` (bốn ở `noiSuy.test.ts`, một ở `san2D.test.ts`) tự phủ mức mới và vẫn xanh. 1299 phép kiểm xanh, `npx tsc --noEmit` sạch.
  - ✅ Kiểm trên bản dev: nút **"Very slow" / "Rất chậm"** hiện **đầu** thang, mặc định vẫn là Chậm, `thoiGianChuyen(2000)` = **1800ms** (đúng 90% một nhịp, cùng tỉ lệ như mọi mức khác).
  - ⚠️ **Một lý lẽ cũ phải viết lại, không phải xoá.** Chú thích của `CAC_MUC_TOC_DO` nói "`cham` đứng đầu: nó là mức mặc định". Thêm `rat-cham` vào đầu thang làm hai tính chất ấy tách ra — mức mặc định giờ là phần tử **thứ hai**. Thang một chiều thắng, vì một thang tốc độ không đơn điệu thì không đọc được; chú thích mới ghi cả lý lẽ cũ và vì sao nó đổi.

- [ ] **T615** — Kiểm tay bốn tổ hợp và bảng trường hợp biên
  - File: — *(kiểm trên bản build)*
  - Xong khi: đi hết màn hình trận ở **bốn tổ hợp** ngôn ngữ × chế độ màu, không sót chữ, không chỗ nào tương phản dưới 4,5:1; một lượt với giảm chuyển động đang bật (không dẫn bóng, không vòng sáng, vị trí tại mốc vẫn đúng); và đi hết bảng mục 5 của spec — phút 0, dòng không kể pha bóng, bàn thắng, hết hiệp, thẻ đỏ cho người đang giữ bóng, thay chính người đang giữ bóng, bóng đang bay mà hết nhịp, hai pha xa nhau, tạm dừng, ẩn/hiện sân, sân 5 người, **trận lưu từ trước spec này**.
  - Bằng chứng: **số** cho tương phản và chuỗi; **mắt** cho phần còn lại.
  - AC: AC-33.5, AC-35.2
  - Phụ thuộc: T613, T614

- [ ] **T616** — Đo hai ngân sách ở **cả năm** mức, và hai con số của spec 005
  - File: — *(đo trên bản build)*
  - Xong khi: chạy hết một trận ở chế độ chạy ngay vẫn **< 3 giây** với sân bật (nền spec 005: 57ms); công việc mỗi khung vẽ gọn trong một nhịp ở **cả năm** mức và không tác vụ nào chiếm luồng chính quá 50ms (nền: 0,1ms mỗi khung, 59 khung/giây); **dải tốc độ vẫn dưới 4 lần** và **độ vòng vẫn dưới 5** (AC-30.10, AC-30.11 của spec 005); ghi số đo **và điều kiện đo** vào mô tả commit.
  - Bằng chứng: **số**.
  - AC: AC-36.5
  - Phụ thuộc: T615

- [ ] **T617** — Người dùng tự xem một trận và phán
  - File: — *(người dùng tự xem, trên trình duyệt của mình)*
  - Xong khi: người dùng xem trọn một trận ở mức **Rất chậm** rồi một trận ở mức **Chậm**, trên trình duyệt thường của họ, và nói ra: có nhìn ra ai đang giữ bóng không; pha dẫn bóng có ra dẫn bóng không; đường chuyền có khác cú sút không; hai đội có cùng sống theo bóng không; và **cảm giác teleport còn không**.
  - Bằng chứng: **MẮT NGƯỜI DÙNG — không phép kiểm nào thay được task này.**
  - AC: AC-33.1, AC-34.1, AC-34.2, AC-35.4, AC-36.1, AC-36.6 *(phần cảm giác)*
  - Phụ thuộc: T616
  - ⚠️ Ở spec 005, đúng task này bắt được **bốn lỗi mà 1239 phép kiểm không thấy** và đẻ ra bảy task sửa. Lần này nó nằm trong kế hoạch từ đầu: nếu nó lại đẻ ra một lát nữa thì đó là **việc bình thường**, không phải sự cố.

- [ ] **T618** — Tick 21 AC và đóng spec
  - File: sửa `specs/006-ball-carrier-motion/spec.md`
  - Xong khi: mọi AC ở mục 3 được tick **có căn cứ** (ghi rõ test nào hay kiểm tay thấy gì, như mục 12 của spec 005); Definition of Done đủ mục; `Status` đổi thành **Done**; xác nhận `PHIEN_BAN_ENGINE` vẫn 5 và `DB_VERSION` vẫn 3; và **15 AC của spec 005 cộng hai AC của spec 001/002 ở mục 10 được kiểm lại từng cái**, không AC nào rơi.
  - AC: toàn bộ
  - Phụ thuộc: T617

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-33.1 | T605, T617 |
| AC-33.2 | T606 |
| AC-33.3 | T608 |
| AC-33.4 | T605 |
| AC-33.5 | T603, T604, T605, T615 |
| AC-33.6 | T614 |
| AC-34.1 | T606, T617 |
| AC-34.2 | ~~T609, T610~~ **hoãn sang spec 007**; T617 (phần cảm giác) |
| AC-34.3 | T601, T607 |
| AC-34.4 | T600 |
| AC-35.1 | T602 |
| AC-35.2 | T603, T606, T615 |
| AC-35.3 | T602 |
| AC-35.4 | T602, T617 |
| AC-35.5 | T602 |
| AC-36.1 | T611, T613, T617 |
| AC-36.2 | T611, T613 |
| AC-36.3 | T611 |
| AC-36.4 | T612 |
| AC-36.5 | T616 |
| AC-36.6 | T611, T617 |

## Ghi chú thực thi

- **Chuỗi phụ thuộc dài nhất** là 14 mắt: T600 → T601 → T602 → T603 → T605 → T606 →
  T607 → T610 → T611 → T612 → T613 → T615 → T616 → T617 → T618. Lý do không phải
  logic mà là **một file**: `San2D.tsx` (~1300 dòng) bị năm lát cùng chạm, nên các
  task sửa nó phải đi tuần tự dù về mặt AC chúng độc lập.
- **Chạy song song được thật:** chỉ **T614** (mức tốc độ thứ năm — chạm `useMatch.ts`,
  `BangDieuKhienTran.tsx`, `TrangTran.tsx`, hai file ngôn ngữ) là hoàn toàn độc lập
  với mọi task khác. T609 chạm `phaBong.ts` nên **không** song song được với T606.
- **Hiến pháp mục 4** đòi test cho lớp engine và lớp dữ liệu: T600 chạm `src/engine/`
  nên nó phải có phép kiểm của chính nó (khớp `duongBong` từng phần tử) **cộng** hai
  lưới cũ chạy nguyên trạng. `phaBong.ts` có `phaBong.test.ts` ngay từ T601, không để
  sang lát sau.
- **Ba phép kiểm xương sống** nằm ở T604 (quyền giữ bóng không nhảy — R50), T607 (toạ
  độ tại mốc vẫn đúng — R47) và T612 (ba bất biến của spec 005 — R48). Không cái nào
  được nhét vào task khác.
- **Một con số để tự kiểm lúc làm T602:** `SO_BUOC_TOI_DA` = 12, nên một pha bóng có
  tối đa 12 bước. Nếu dòng thời gian sinh ra nhiều đoạn hơn thế thì có gì đó sai.
- **Hai chuỗi mới, cùng commit với code** (P8): nhãn mức "Rất chậm" / "Very slow"
  (T614), và chuỗi cho trình đọc màn hình của người giữ bóng (T605).
- **Không tạo file nào ngoài danh sách trên.** Phát sinh thêm → dừng, cập nhật
  `plan.md` / `tasks.md` trước. Hai file mới duy nhất của spec này là
  `src/ui/phaBong.ts` và `src/ui/phaBong.test.ts`.

## Phase 47 — ba thứ chỉ biết được khi làm thật

**1. Tiêu chí "diff không chứa chữ `rng`" sai hai lần trước khi đúng.** `/analyze` đã
bắt lần thứ nhất (phát hiện LOW số 9): diff tính cả `src/engine/*.test.ts`, mà file
test chứa chữ ấy một cách chính đáng. Lần thứ hai lộ ra khi chạy thật: `git diff`
mặc định in **ba dòng ngữ cảnh** quanh mỗi thay đổi, và một trong những dòng ấy là
`Math.floor(rng.next() * 1000)` — dòng **không hề đổi**. Tiêu chí đúng phải là
`git diff -U0`, tức **chỉ dòng đã đổi**. Chạy lại: **0 dòng**.

**2. Tốc độ của một đường chuyền phải đo theo NGƯỜI, không theo đồng hồ.** Bản
đầu của `thoiLuongDoan` cho đoạn chuyền tốn `nhịp / 3`. Nhưng người không đi hết
một nhịp — từ T525 thời lượng của anh ta tỉ lệ với quãng đường và thể lực — nên
tỉ lệ thật ra chỉ **2,7 lần**, dưới ngưỡng ba lần của AC-35.1. Sửa: chuyền tốn
`thời lượng của người / 3`. Câu "bóng nhanh gấp ba **người**" phải đo bằng người.

**3. Phép kiểm so hai dòng thời gian khác nhau là phép kiểm sai.** Bản đầu của phép
kiểm P5 dựng **hai** pha bóng — một rê, một chuyền — rồi so đoạn đầu của hai bên.
Nó đỏ với tỉ lệ **1**, và đỏ đúng: một pha một đoạn thì đoạn ấy **là đoạn cuối**,
mà đoạn cuối luôn được kéo tới hết nhịp để bóng không biến mất khỏi dòng thời
gian. Và pha dài hơn một nhịp còn bị co đều, nên tỉ lệ giữa **hai dòng** không nói
lên điều gì. Phép kiểm đúng so **hai đoạn trong cùng một dòng**, cùng quãng đường,
và bỏ đoạn cuối ra.

**Số đo thật của lát 47** (bản dev, mức Chậm, rAF thay bằng `setTimeout`, 1182 mẫu):
- **Tốc độ của bóng giờ có dải**: phân vị 10 là **39,1** đơn vị/giây, phân vị 90 là
  **436,9** — tỉ lệ **11,2 lần**. Trước lát này mọi đoạn của bóng dùng chung một luật
  thời lượng, nên một đường chuyền và một pha rê bóng trông y hệt nhau.
- **29 khúc cua** của quả bóng (trước: 17) — nhiều bước của pha bóng được đi qua hơn.
- Bóng di chuyển ở **42,9%** số khung (trước: 35,5%).
- **Quãng đứng im lâu nhất vẫn 3504ms** — **chưa sửa, và đúng kế hoạch**: nó là việc
  của T605 (bóng bám chân người giữ bóng) và T608 ở lát 48–49.
- `tuongThichV5.test.ts` và `phatLai.test.ts` **xanh mà không sửa một dòng**;
  `PHIEN_BAN_ENGINE` 5; `DB_VERSION` 3; 1256 test xanh.

## Phase 48 — ba thiếu sót của tài liệu, lộ ra khi đo

**1. Bảng 3.1 của plan bỏ sót hai loại dòng.** Nó liệt mười bốn loại, và T603
chép lại con số ấy ("mười bốn loại"). `LoaiSuKien` có **mười sáu**: thiếu
`ket-thuc` và `huy-tran`. Cả hai là dòng mốc đóng trận, nên chúng theo đúng
`het-hiep` — không ai giữ bóng nữa. Không phải một lựa chọn thiết kế mới: hàm
`nguoiGiuBong` phải **toàn phần** với cả mười sáu, vì một `undefined` lọt ra khỏi
nó sẽ thành một quả bóng không biết ở chân ai. Phép kiểm duyệt đủ mười sáu và
chốt `size === 16` để thêm một loại nữa là đỏ ngay.

**2. Sàn "1,80 bán kính" KHÔNG phải sàn toàn sân — bài học R45 lặp lại lần thứ ba.**
T605 nói bán kính vòng "bị chặn dưới sàn đã đo 1,80 bán kính". Bản đầu của phép
kiểm chốt đúng con số ấy và **đỏ**: đo ra **1,5468**. Lý do: 1,80 là sàn đo quanh
**người ghi bàn** ở T514, không phải quanh mọi cặp điểm. Đo lại trên 5835 dòng
(10 mã trận × 7 quân số):

| Đo quanh ai | Sàn (bán kính) |
|---|---|
| Người ghi bàn (T514) | 1,80 |
| **Người giữ bóng** | **1,5468** |
| **Mọi cặp điểm** | **1,5468** |

Hai dòng cuối bằng nhau tới 15 chủ số, tức **cặp chật nhất của cả sân luôn có
người giữ bóng là một nửa**. Biên quanh anh ta vì thế bị ràng thật. May là biên
ràng thật của vòng lại là biên khác: **dấu ▲** đặt ở `banKinh + 1,2`, nên vòng
đứng ở **1,353 bán kính** — dưới cả 1,5468. `Math.min` trong
`VONG_GIU_BONG_THEM` viết ra cả hai biên để đổi `BAN_KINH` không làm biên kìa
lặng lẽ biến mất.

**3. 2,82% số dòng có người giữ bóng không còn điểm nào trên sân** (148/5246).
Anh ta nhận thẻ đỏ, hoặc bị thay ra ngay sau pha bóng của mính, mà quy tắc "dòng
không nêu ai thì giữ nguyên người cũ" không biết điều ấy — nó đọc một dòng sự
kiện, không đọc đội hình. Lớp vẽ gác bằng `cacDiem.find`: những phút ấy không vẽ
vòng nào và bóng giữ đúng chỗ của dòng, tức xem như spec 005. Con số này được
đếm trong phép kiểm với ngưỡng 5% — để bắt được việc nó vọt lên, chứ không
để hợp lệ hoá nó.

**4. Hai lỗi mà 1274 phép kiểm không thấy, chỉ số đo trên bản build bắt được.**

*(a) "Nhịp không có pha bóng nào" chỉ là **3 trong 65 nhịp**.* Bản đầu của T605
chỉ cho bóng bám chân ở đúng những nhịp ấy — đúng chữ của tiêu chí thứ hai, và đo
ra quãng bóng đứng im **6064ms**, tức **tệ hơn** trước. Lý do: phần lớn thời gian
bóng đứng yên không nằm ở những nhịp không có pha bóng, mà nằm ở **sau khi pha
bóng đã xong** — một dòng được hiển thị lâu hơn một nhịp vì nhiều phút liền không
có tình huống. Tiêu chí **thứ nhất** của T605 nói "**khi bóng không đang bay**", rộng
hơn hẳn, nên luật bám chân được viết theo câu ấy: bắt đầu bám ở tỉ lệ nhịp `0`
khi không có pha bóng, ở `1` khi pha bóng vừa xong.

*(b) Bóng nhảy thẳng sang chân người giữ bóng MỚI trong đúng một khung.* React vẽ
**trước** rồi mới chạy effect, nên ở khung đầu của một dòng mới thì `aiGiuBong` đã
là người mới trong khi `batDau` và dòng thời gian vẫn là của nhịp cũ — tỉ lệ nhịp
lúc ấy đã vượt 1 nên bóng bám **hết mức** vào người mới. Tệ hơn: effect ghi chính
chỗ đã nhảy ấy làm điểm xuất phát của chặng mới, nên cú nhảy thành vĩnh viễn chứ
không phải một khung nháy. Sửa: chặng của bóng nhớ **người giữ bóng mà nó được
dựng cho** (`aiGiuBongVe`), đặt trong effect chứ không đọc thẳng `aiGiuBong`.

Cả hai đều là lỗi của **lớp vẽ**, mà bộ kiểm chạy ở `environment: 'node'` không có
đường nào render component — đúng chỗ mù đã làm spec 005 để lọt bốn lỗi tới mắt
người dùng ở T518.

**Một quyết định của lớp vẽ không có trong plan:** `PHAN_NHIP_BAM_CHAN` = **một phần
tư nhịp**. Ở nhịp không có pha bóng nào, không đặt bóng **thẳng** vào chân người
giữ bóng ngay khung đầu: chỗ bóng được thấy lần cuối là vùng pha bóng trước dừng,
còn điểm của anh ta đã bị giãn ra khỏi vùng đó để hai điểm không chồng nhau — nhảy
cái khoảng ấy trong một khung là **đúng cú teleport** người dùng gọi tên ở T518.
Bóng về chân trong một phần tư nhịp, rồi ba phần tư còn lại đi theo chân — **kể cả
lớp dao động**, vì nó lấy `viTriVe` chứ không lấy toạ độ mốc.

**Số đo thật của lát 48** (bản dev, mức Chậm, một trận trọn vẹn, 6245 mẫu / 109 giây;
rAF thay bằng `setTimeout`):

| | Trước lát 48 | Sau lát 48 |
|---|---|---|
| Quãng bóng đứng im lâu nhất | **6064ms** | **1558ms** |
| Tỉ lệ khung có bóng di chuyển | 60,5% | **84,3%** |

Cột "trước" đo lại code của lát 47 **bằng đúng phương pháp này**, không lấy con số
3504ms đã ghi ở lát 47: con số ấy đo trên một mẫu 19 giây, mà mẫu càng dài thì quãng
đứng im dài nhất càng dễ lộ. **So hai con số đo bằng hai phương pháp là một cách tự
khen thưởng.**

Khoảng cách bóng ↔ người giữ bóng ở cuối mỗi nhịp: trung vị **1,31 bán kính**,
32,4% số nhịp dưới một bán kính. **Chưa đạt** AC-33.1, và đúng kế hoạch: nhịp dài
đúng một nhịp thì luật bám chân chưa kịp bắt đầu, và bóng dừng ở cuối pha trong khi
người giữ bóng đứng cách đó đúng khoảng giãn của hai điểm. Đó là việc của **T606**
(người giữ bóng đi theo đường của bóng rồi về mốc của mình) ở lát 49. Riêng nhịp
không có pha bóng nào: **1,34 bán kính** (trước khi sửa lỗi (b): 9,28).

1274 phép kiểm xanh; `tuongThichV5.test.ts`, `phatLai.test.ts`, describe "toạ độ tại
mốc không bao giờ sai" và ba phép kiểm bất biến của `san2D.test.ts` đều xanh;
`git diff src/engine/` **rỗng hoàn toàn** — lát này không chạm một file engine nào.

## Phase 49 — ba thứ chỉ biết được khi đo

**1. Bất biến R47 phải đúng bằng CẤU TRÚC, không bằng may mắn.** `viTriNguoiGiuBong`
mở đầu bằng `if (t >= 1) return moc`. Đó không phải một câu gác thừa: một người
dẫn bóng tới tận khi nhịp hết thì cửa sổ của anh ta kéo tới 1, và nhánh "đang cầm
bóng" sẽ trả `viTriBong(1)` — đúng mốc **chỉ nếu** lớp vẽ còn làm đúng việc thay
điểm cuối của đường bóng. Một bất biến đang giữ AC-28.3 của spec 005 và AC-25.2
của spec 004 thì không được phụ thuộc vào một lớp khác còn làm đúng.

**2. Điểm cuối của đường bóng phải là CHỖ ĐỨNG của người giữ bóng, không phải
tâm vùng.** Engine nói bóng dừng ở **vùng** nào; `hinhSan` lại giãn những người tham
gia ra khỏi tâm vùng để hai điểm không chồng nhau — đó chính là **1,31 bán kính**
đo được ở lát 48. Cho bước cuối tới thẳng chân anh ta thu được hai thứ cùng lúc:
AC-33.1, và bất biến R47 không còn phải trả giá bằng một cú giật ở khung cuối.
**Không đổi một con số nào của trận**: `duongBong` và `bongTaiMoc` vẫn là vùng
engine kể; chỉ đường **vẽ** của quả bóng kết thúc ở chân người.

**3. Bảng 3.1 không nói ai MỞ một pha bóng.** Nó chỉ nói ai giữ bóng **sau** một
dòng. Sau mỗi bàn thắng, sau mỗi hiệp và ở dòng đầu trận nó trả **không ai**, nên
pha kế tiếp không có người dẫn bóng nào cho tới khi có một đường chuyền — quả
bóng tự đi một mình, đúng cách vẽ của spec 005 mà spec này sinh ra để chữa. Người
mở pha được suy bằng **đúng luật D112** đã dùng cho người nhận: đồng đội đứng gần
chỗ pha bóng bắt đầu nhất.

**Số đo thật của lát 49** (bản dev, mức Chậm, một trận trọn vẹn, 6280 mẫu / 108
giây, rAF thay bằng `setTimeout`):

| | Lát 47 | Lát 48 | Lát 49 |
|---|---|---|---|
| Khoảng cách bóng ↔ người giữ bóng, trung vị | — | 1,31 bán kính | **0,227 bán kính** |
| — phân vị 90 | — | 5,62 | **0,374** |
| — tỉ lệ khung dưới một bán kính | — | 32,4% | **98,1%** |
| Tỉ lệ khung có bóng di chuyển | 42,9% | 84,3% | 83,5% |

**AC-33.1 và AC-34.1 đạt**: 98,1% số khung có quả bóng nằm trong một bán kính quanh
tâm người giữ bóng, trung vị **0,227 bán kính** — tức bóng ở **trong lòng điểm** của
anh ta, không phải cạnh anh ta.

### AC-33.3 CHƯA ĐẠT, và cả hai nguyên nhân đều nằm NGOÀI tầm của T606

Cả trận chỉ có **7 quãng đứng im quá 300ms** trên tổng **335 quãng**. Soi từng cái
một — kèm **tổng chuyển động của cả 23 nhóm vẽ** trong chính quãng ấy — thì không
cái nào là lỗi của quả bóng:

| Quãng | Có người giữ bóng? | Cả sân có động? | Là gì |
|---|---|---|---|
| 3503ms, 2512ms, 1487ms | **không** | có | **ba bàn thắng** |
| 1265ms, 1231ms, 582ms | có | **0,2 / 0,3 / 2,5 đơn vị** | **cả sân đóng băng** |
| 1233ms | có | 122,9 | dòng phút **90'**, vắt qua lúc trận kết thúc |

**Nguyên nhân (a) — bàn thắng: bảng 3.1 nói sau một bàn thắng thì KHÔNG AI giữ
bóng**, nên bóng nằm trong lưới suốt nhịp lắng 1,5 giây của AC-32.5. Đó là hệ quả
trực tiếp của **D103**, một quyết định đã chốt.

**Nguyên nhân (b) — cả sân đóng băng, không riêng quả bóng.** Đo được: trong quãng
1265ms ấy, tổng toạ độ của **cả 23 nhóm vẽ** đổi đúng **0,2 đơn vị** — hai mươi hai
cầu thủ cũng đứng im như quả bóng. Nguồn là `thoiDiemTran` ở `San2D.tsx`:

```
phutDongHo + Math.min(1, (performance.now() - batDauPhut.current) / msMoiPhut)
```

`Math.min(1, …)` đến từ **Phase 39 của spec 005** (D90). Khi một nhịp kéo dài hơn
`msMoiPhut` — nhịp lắng sau bàn thắng, hay đơn giản là `setTimeout` trôi dưới tải — thì
con số này **bão hoà**, và lớp dao động đứng lại cho tới phút sau. Cả sân hết thở.

Sửa nó là sửa **một quyết định của spec 005**, không nằm trong danh sách task của
spec này — nên nó đứng lại ở đây, chờ người dùng quyết.

### Một việc T608 đòi mà không đo được

T608 bảo đo riêng **một phút `thay-nguoi`**. Không có phút nào như vậy để đo:
`tran.ts:1365` chỉ phát dòng `thay-nguoi` từ `canThiepChoAp`, tức **từ một lần thay
người do người dùng bấm** — engine không tự thay người bao giờ. Hai trận đã đo
không có dòng nào.

Dòng `kiet-suc` thì có, nhưng cả hai trận đều rơi vào **phút 90'**, vắt qua lúc trận
kết thúc, nên không tách được khỏi việc sân đóng băng lúc hết giờ. Điều đo được thay
cho nó: **mọi nhịp không có pha bóng nào khác đều có bóng di chuyển** — không một
quãng đứng im nào trên 300ms rơi vào một nhịp như vậy khi sân còn sống.

1289 phép kiểm xanh; `tuongThichV5.test.ts`, `phatLai.test.ts`, describe "toạ độ tại
mốc không bao giờ sai" và ba phép kiểm bất biến của `san2D.test.ts` đều xanh;
`git diff src/engine/` **rỗng hoàn toàn**.

## Phase 49b — sửa hai nguyên nhân, và lộ ra nguyên nhân thứ ba

Người dùng đọc số đo của lát 49 rồi chốt "sửa cả hai" (2026-11-19). D113 và D114
sinh ra từ đó, kèm T619 và T620.

**Cả hai đều làm đúng việc của nó** (một trận trọn vẹn, mức Chậm, 5445 mẫu /
106 giây, ngưỡng "đứng im" siết về **đúng bằng không**):

| | Trước T619/T620 | Sau |
|---|---|---|
| Quãng đứng im > 300ms rơi vào một dòng bàn thắng | **3** (tới 3503ms) | **0** |
| Quãng đứng im > 300ms mà **cả sân** cũng đóng băng | **3** | **0** |
| Tỉ lệ khung có bóng di chuyển | 83,5% | **92,2%** |
| Khoảng cách bóng ↔ người giữ bóng, trung vị | 0,259 bán kính | **0,249** |

**Một bài học về chính cách đo.** Ba quãng còn lại trên 300ms, soi kĩ thì **hai
cái chỉ dài đúng BA MẮU**: bộ lấy mẫu `setInterval(16)` bị đói — trung vị khoảng
cách hai mẫu là 16ms, nhưng có **20 lần vượt 100ms**, lần lâu nhất 1010ms. Hai mẫu
cách nhau nửa giây mà bóng trùng toạ độ thì không chứng minh được gì — **đếm số
mẫu của mỗi quãng phải là một cột trong bảng đo**, không phải thứ nghĩ ra sau.

### Nguyên nhân thứ ba, chưa sửa

Còn đúng **một** quãng đứng im thật trong cả trận: **2002ms trên 127 mẫu**, ở một
dòng `pham-loi`, và **không có vòng nét đứt nào** trong suốt quãng ấy. Đó chính là
trường hợp **2,82% đã đo ở lát 48**: người giữ bóng **không còn điểm nào trên
sân** — anh ta nhận thẻ đỏ, hoặc bị thay ra — nên lớp vẽ gác bằng `cacDiem.find`,
không vẽ vòng và bóng giữ đúng chỗ của dòng.

Cách sửa nằm sẵn: lùi về **đúng luật D112** đã dùng cho người nhận — người gần
quả bóng nhất trong đội của dòng ấy nhặt bóng lên. **Chưa làm**: nó không nằm
trong danh sách task, và nó lộ ra sau khi người dùng đã chốt hai việc kia.

**T608 vì thế vẫn để ngỏ**: AC-33.3 đòi không quãng nào quá 300ms, và còn một
quãng 2002ms.

## Phase 51 — hai nhóm di chuyển khác nhau, và cái trần chặn nó lại

**1. R48 xảy ra đúng như đã báo, và cách xử lý đã viết sẵn trong T612.** Thêm lực
kéo theo vai trò bằng **một nửa** lớp co khối thì sàn "hai điểm gần nhau nhất" tụt
từ **1,5468** xuống **1,4379** bán kính — vì **mọi lực kéo đều kéo về phía bóng**, nên
chúng đều làm hai điểm xích lại. Siết xuống **một phần tư**: sàn về **1,4923**.
Siết cái vừa thêm, không nới cái đã có — đúng bài học của T511.

**2. Lực kéo phải TỈ LỆ với khoảng cách tới dải có bóng, không được đều tay.**
Người tham gia tình huống được đặt thẳng vào vùng của tình huống và **không nhận
lực kéo nào**, nên một lực đều tay sẽ triệt tiêu đúng khoảng lệch tách họ khỏi
người không tham gia đứng cùng chỗ — hai bản đầu của T510 đã làm hỏng AC-30.5
đúng kiểu ấy. Phép kiểm canh thẳng **tính tỉ lệ**: lực kéo thêm luôn bằng đúng một
phần tư lớp co khối về độ lớn, nên nó tự bằng không ở chỗ lớp co khối bằng không.

**3. Không cặp dải nào cho lớp co khối bằng đúng không.** Bảng dải của đội và
bảng trung lập không trùng nhau ở điểm nào (T523), nên phép kiểm "người đứng
đúng dải có bóng không dịch" **không dựng được** — bản đầu của nó đỏ vì chính
điều đó, chứ không phải vì code sai.

**Số đo thật của lát 51** (bản dev, mức Chậm, một trận trọn vẹn, 1921 mẫu), trọng
tâm theo trục dọc của mỗi đội:

| | Khi ĐỘI MÌNH giữ bóng | Khi ĐỘI KIA giữ bóng | Lệch |
|---|---|---|---|
| Đội nhà (tấn công sang phải) | **40,25** | 39,74 | **+0,51** |
| Đội khách (tấn công sang trái) | **60,71** | 61,88 | **−1,17** |

**Đúng chiều, nhưng nhỏ.** Cả khối đội nhà đu từ 31,9 tới 51,3 trong trận — gần 20
đơn vị — nhưng phần do **vai trò** chỉ chiếm dưới một đơn vị rưỡi. Lý do không nằm ở
cách làm mà nằm ở **cái trần**: AC-30.4 chặn **tổng mọi lực kéo** ở một phần mười
chiều dài sân, và lớp co khối của D94 đã dùng gần hết chỗ ấy. Muốn thấy đội hình
dâng lên rõ hơn thì phải **nới chính cái trần 1/10** — một ngưỡng người dùng chốt ở
`/clarify` của spec 005 — và trả giá bằng sàn hai điểm gần nhau nhất. **Chưa làm**:
đó là quyết định của người dùng, không phải của tôi.

1299 phép kiểm xanh; ba phép kiểm bất biến của T612 xanh **không nới một ngưỡng
nào**; `git diff src/engine/` rỗng hoàn toàn.

## Phase 51b — nới trần lên 1/6, và hai thứ số đo dạy được

Người dùng chốt nới trần nghiêng khối lên **một phần sáu** (D116, T624).

**Số đo của chính lực kéo theo vai trò**, tách khỏi lớp co khối — so
`nghiengKhoiTheoBong` có vai trò với chính nó không vai trò, trên **79.340 lượt**
(10 mã trận × 7 quân số × mọi dòng × mọi người):

| | Trung bình | Lớn nhất |
|---|---|---|
| Đồng đội của người giữ bóng | **1,02 đơn vị** | **2,88** |
| Đối phương | **1,39 đơn vị** | **2,88** |

Ở trần cũ những con số này nhỏ hơn đúng tỉ lệ trần: **1,67 lần yếu hơn**.

**1. "Trọng tâm đội khi mình giữ bóng" là một PHÉP ĐO SAI.** Bản đầu của T613 đo
nó trên bản build và ra **+0,51** cho đội nhà; đo lại ở trần 1/6 thì ra **−0,28** —
ngược chiều. Không phải code sai: con số ấy bị **chỗ quả bóng hay nằm** làm nhiễu,
vì lớp co khối kéo cả đội về phía bóng và đội đang cầm bóng thường xây từ sân
nhà. Hai lần đo còn là **hai trận khác nhau**, vì mã trận sinh mới mỗi lần bấm.
Phép đo đúng là đo **chính lực kéo**, như bảng trên.

**2. Hai điểm CÓ lúc gần như trùng nhau ở giữa nhịp — và điều đó CÓ TỪ TRƯỚC.** Đo
sàn hai điểm gần nhau nhất **ở lớp vẽ** (dựng lại cả nội suy, lớp dao động, luật đi
theo bóng và phép kẹp thủ môn, ở sáu tỉ lệ nhịp):

| Trần | Sàn ở lớp vẽ |
|---|---|
| 1/10 | **0,0055 bán kính** |
| 1/6 | **0,0043 bán kính** |

Tức nới trần **không sinh ra** chuyện này. Mọi phép kiểm AC-15.2 và AC-30.5 từ spec
002 tới nay đều đo **toạ độ tại MỐC**, nơi sàn là 1,31 bán kính; **chưa phép kiểm nào
đo giữa hai mốc**, và ở giữa thì đường đi của hai người có lúc cắt nhau. **Chưa sửa,
và nói ra chứ không tự làm**: nó là tính chất của lớp nội suy spec 005, không nằm
trong danh sách task, và còn phải hỏi xem hai cầu thủ chạy sát nhau một khoảnh khắc
có thực sự là lỗi không.

## Phase 50 bị bỏ — và điều đó đổi nghĩa của "đóng spec 006"

Ngày **2026-11-19**, sau khi `/clarify` của spec 007 chốt rằng engine liên tục sẽ có toạ
độ mét thật, người dùng chốt **bỏ Phase 50**. Spec 006 vì thế đóng với **23 task**, không
phải 25.

**Phần còn lại của spec 006 là đúng hai việc:**

1. **T608** — đo lại trên bản build: một trận trọn vẹn ở mức Chậm, bóng **không đứng yên
   quá 300ms** (AC-33.3), cộng một phút `kiet-suc` và một phút `thay-nguoi` riêng. Lượt đo
   cuối của nó bị cắt ngang khi người dùng báo lỗi thủ môn, và từ đó code đã đổi bốn lần
   (T621, T622, T623, T624) nên số cũ không dùng được nữa. Lưu ý đã biết: engine chỉ phát
   `thay-nguoi` khi người dùng tự thay, nên phút ấy chỉ tồn tại nếu thay người qua giao diện.
2. **Phase 52** — T614 (mức "Rất chậm" 2000ms), T615 (người dùng tự xem và phán), T616
   (đo ngân sách vẽ), T617 (phán quyết của người dùng), T618 (tick AC và đóng spec).

**Một AC đóng mà chưa làm, và nó được ghi thành nợ chứ không ghi thành xong:** AC-34.2
(người rê bóng đi vòng qua đối thủ). Xem mục 12 của spec 007.

## Số đo của T608 và T616 — đo ngày 2026-11-19 trên bản dev

**Điều kiện đo:** bản dev (`npm run dev`), khung xem 1400×900, Alpha FC vs Beta FC 11
người, mã trận **R6B8QRQFVT**, 90 phút, mức **Chậm**, sân 2D **đang bật**. Vì khung xem
của ứng dụng không bao giờ ghép hình, `requestAnimationFrame` được thay bằng
`setTimeout(16)` để vòng vẽ chạy được; bộ lấy mẫu `setInterval(16)` đọc `transform` của
nhóm vẽ quả bóng.

**Sức khoẻ của chính bộ lấy mẫu phải báo trước mọi con số khác** (bài học của lát 49b:
hai "quãng đứng im" hoá ra là bộ lấy mẫu bị bỏ đói): khoảng giữa hai mẫu **lớn nhất 20ms**,
**không** khoảng nào quá 100ms. Nên mọi quãng dưới đây là thật, không phải ảo.

### T608 — quả bóng không còn đứng yên

| | Trước spec 006 | Đo lại 2026-11-19 |
|---|---|---|
| Tỉ lệ khung có bóng di chuyển | **35,5%** | **93,8%** |
| Quãng bóng đứng yên lâu nhất | **3144ms** | **1009ms** — và nó là nhịp lặng sau bàn thắng |
| Quãng dài nhất **ngoài phút có bàn thắng** | — | **34ms** |

Cả trận có **331 quãng đứng im**; **330 trong số đó dài 32–34ms**, tức đúng hai nhịp lấy
mẫu — không phải một quãng đứng im mà là độ phân giải của phép đo. **Đúng một quãng** vượt
300ms.

**Đo riêng từng loại dòng không mang pha bóng** — chính chỗ con số 3144ms sinh ra:

| Loại dòng | Phút | Quãng dài nhất |
|---|---|---|
| `kiet-suc` | 82', 85', 89' | **33ms, 34ms, 32ms** |
| `the-do` | 29' | **33ms** |
| `the-vang` | 10', 15', 50', 75' | **33ms** |
| `thay-nguoi` | 8' (trận 20 phút riêng, thay người qua giao diện) | **32ms** |

**Phụ phẩm: AC-28.5 được xác nhận bằng quan sát, không phải bằng lập luận.** Trong trận
đo `thay-nguoi`, lúc tạm dừng để thay người, sân đứng im **13.957ms** liên tục (869 mẫu) —
đúng điều phải xảy ra, và là bằng chứng trực tiếp rằng bộ cộng dồn của T620 đóng băng theo
cấu trúc.

**Một quãng duy nhất vượt ngưỡng, và nó là một xung đột giữa hai AC chứ không phải một
lỗi.** Phút 38 có bàn thắng; quả bóng chạy từ chỗ cú sút **về chấm giao bóng** (50, 32) rồi
**nằm đó 1009ms** chờ giao bóng lại. Đó chính là nhịp lặng `MS_LANG_SAU_BAN_THANG` mà
**AC-32.5 của spec 005 cố tình đặt ra**, và cũng là điều một quả bóng thật làm. Nhưng
AC-33.3 viết "bóng PHẢI không đứng yên quá 300ms liên tục", nên đọc đúng chữ thì nó vỡ.

Đáng chú ý: **bàn thắng còn lại, phút 21, KHÔNG sinh quãng nào** — ở đó quả bóng trôi
*qua* chấm giao bóng rồi đi luôn vào pha của phút 22 (50 → 49,1 → … → 38,4). Nên hành vi
sau bàn thắng **không đồng nhất**: một bàn thì bóng dừng một giây trên chấm, bàn kia thì
không. **Chưa sửa, và nói ra chứ không tự làm** — ngưỡng của AC-33.3 là của người dùng, và
chọn giữa "nhịp lặng sau bàn thắng" và "bóng không bao giờ đứng quá 300ms" là quyết định
của họ.

### T616 — hai ngân sách

| Phép đo | Ngưỡng | Đo được |
|---|---|---|
| Chạy hết một trận ở chế độ chạy ngay, **sân đang bật** | < 3 giây | **32ms** (nền spec 005: 57ms) |
| Tác vụ chiếm luồng chính quá 50ms | 0 | **0** |

Công việc mỗi khung vẽ, 4 giây mỗi mức:

| Mức | Nhịp | Khung/giây | Trung vị | Lớn nhất | Gọn trong một nhịp |
|---|---|---|---|---|---|
| Rất chậm | 2000ms | 59,3 | 0,1ms | **0,2ms** | ✅ |
| Chậm | 1000ms | 59,3 | 0,1ms | **0,3ms** | ✅ |
| Thường | 200ms | 59,6 | 0,1ms | **0,2ms** | ✅ |
| Nhanh | 70ms | 59,2 | 0,1ms | **0,3ms** | ✅ |
| Rất nhanh | 20ms | — | — | — | **không có vòng vẽ** |

Nền của spec 005 là 0,1ms mỗi khung và 59 khung/giây — **không đổi**, kể cả ở mức Rất chậm
mới. Mức Rất nhanh không có số vì ở 20ms `thoiGianChuyen` trả 0 nên **thôi nội suy hoàn
toàn** (AC-29.4): không có vòng vẽ để đo, và đó là thiết kế chứ không phải thiếu số.

**AC-30.10 (dải tốc độ dưới bốn lần): giữ được, bằng phép kiểm thuần.** Phép kiểm của T525
ở `noiSuy.test.ts` đo đúng tỉ lệ ấy và xanh; nó duyệt `Object.entries(MS_MOI_PHUT)` nên
**giờ phủ cả mức Rất chậm** mà không phải sửa một dòng.

**AC-30.11 (độ vòng dưới năm lần): KHÔNG đo được đáng tin trên bản build. Báo ra, không
tự sửa.**

Trung vị đo được là **1,53** — **khớp đúng con số 1,53 mà spec 005 ghi**, nên cách đo không
sai về nguyên tắc. Nhưng **giá trị lớn nhất** thì không dùng được:

| Lọc theo quãng chim bay | Số cặp | Trung vị | Lớn nhất | Số vượt 5 |
|---|---|---|---|---|
| ≥ 1 đơn vị | 443 | 1,82 | 86,7 | 53 |
| ≥ 2 đơn vị | 350 | **1,53** | 24,2 | 17 |
| ≥ 9,2 đơn vị (phân vị 90 của quãng thật) | 147 | 1,28 | 10,7 | 3 |

**Lý do con số lớn nhất không dùng được, nói thẳng:** AC-30.11 đo "đường đi của một điểm
**trong một nhịp**", mà **tôi không lấy được mốc đầu–cuối của một nhịp từ DOM**. Lớp dao
động của spec 005 làm mọi điểm **không bao giờ đứng im**, nên không thể tìm biên nhịp bằng
cách tìm chỗ điểm nghỉ; và tìm cực tiểu của tổng dịch chuyển thì ra chu kỳ **208ms** của
chính lớp dao động, không phải 1000ms của nhịp. Phải bó tạm theo **phút của dòng tường
thuật**, nên bất kỳ bó nào trùm hơn một nhịp đều cho đường đi dài mà đường chim bay ngắn —
và tỉ số phồng lên.

**Một giả thuyết của tôi đã bị số liệu bác bỏ, ghi lại để không ai đi lại đường ấy:** tôi
đoán các điểm vòng nhiều là **người đang giữ bóng**, vì D104 cho anh ta đi theo đúng đường
của quả bóng. Đo ra thì ngược: nhóm vượt 5 cách bóng trung bình **19,4 đơn vị**, nhóm dưới 5
cách **24,3** — gần như không khác nhau, và cặp vòng nhất (24,2) cách bóng 5,4 đơn vị còn
cặp thứ hai (22,1) cách **34,3**. Vậy nó **không** phải người giữ bóng.

Hai đường đi tiếp, và cả hai cần người dùng chốt vì cả hai là việc ngoài danh sách task:
(a) viết một **phép kiểm thuần ở lớp vẽ** dựng lại nội suy + lớp dao động + luật đi theo
bóng rồi đo độ vòng — biên nhịp khi ấy **biết theo cấu trúc**, và đây đúng là cách T607,
T611 và T622 đã làm; (b) cho ứng dụng lộ ra pha của nhịp để đo được từ ngoài.
