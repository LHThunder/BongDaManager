# Tasks: Bóng trong chân người — dẫn, qua người, chuyền và sút

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 21 AC (US-33 → US-36), 11 quyết định D101–D111 |
| **Tiến độ** | 0/19 |
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

- [ ] **T600** — `cacBuocBong` đi từ engine ra ngoài
  - File: sửa `src/engine/suKien.ts`, sửa `src/engine/tran.ts`, sửa `src/engine/suKien.test.ts`
  - Xong khi: `SuKien` có trường **tuỳ chọn** `cacBuocBong?: readonly { vung: VungSan; loai: LoaiHanhDong | null }[]`; `duongBongCuaChuoi` trả cả loại trong **cùng một phép map**; phép kiểm mới chứng minh `cacBuocBong.map(b => b.vung)` khớp `duongBong` **từng phần tử** trên 10 mã trận × 7 quân số, và phần tử cuối có `loai` là `null` đúng khi nó là `vungKetThuc` được nối thêm.
  - Xong khi (R46, bắt buộc kiểm bằng mắt): `tuongThichV5.test.ts` và `phatLai.test.ts` **xanh mà không sửa một dòng**; `PHIEN_BAN_ENGINE` vẫn 5; `DB_VERSION` vẫn 3; `git diff src/engine/` **không chứa chữ `rng`**.
  - Bằng chứng: **số**.
  - AC: AC-34.4
  - Phụ thuộc: —
  - ⚠️ **Tuỳ chọn chứ không bắt buộc**, và đó là một quyết định chứ không phải lười: bản ghi trận cũ trong IndexedDB **thiếu** trường này, nên kiểu phải nói thật điều đó để giao diện buộc phải gác (D110). Phụ phẩm: `suKien.test.ts` và `tuongThuat.test.ts` — ba chỗ dựng `SuKien` bằng tay — **không cần sửa**; nếu chúng đỏ thì nghĩa là trường đã bị khai bắt buộc.

- [ ] **T601** — Module thuần `phaBong.ts`: dòng thời gian của một pha bóng
  - File: tạo `src/ui/phaBong.ts`, tạo `src/ui/phaBong.test.ts`
  - Xong khi: `dongThoiGianPhaBong` nhận (sự kiện, toạ độ các vùng, nhịp) và trả danh sách **đoạn** `{ tu, den, loai, tiLeBatDau, tiLeKetThuc }`; tổng thời lượng **không vượt một nhịp** kể cả pha 12 bước (`SO_BUOC_TOI_DA`); thiếu `cacBuocBong` → trả **đúng một đoạn** bằng cách vẽ của spec 005 (D110); hàm thuần — thay `Math.random` và `Date.now` thành hàm ném lỗi rồi gọi vẫn chạy.
  - Bằng chứng: **số**.
  - AC: AC-34.3
  - Phụ thuộc: T600

- [ ] **T602** — Lớp vẽ dùng dòng thời gian: chuyền và sút vụt đi, rê bóng thì không
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: đoạn `chuyen` / `tat-canh` / `sut` dùng thời lượng `msChuyen / BONG_NHANH_GAP` như D95; đoạn `re-bong` dùng thời lượng **của người**; cú sút kết thúc ở vùng dứt điểm của dòng; ba phép kiểm bất biến vẫn xanh.
  - Xong khi (hiến pháp P5, phát hiện số 5 của `/analyze`): **phép kiểm thuần** cho `thoiLuongDoan` — cùng một quãng đường thì đoạn `chuyen`/`sut` nhanh hơn đoạn `re-bong` **ít nhất ba lần**, ở **cả năm mức tốc độ**. AC-35.1 và AC-35.4 là AC dạng so sánh nên **không được chỉ đo trên bản build**; con số đo trên build là bằng chứng thứ hai, không phải thứ nhất.
  - Bằng chứng: **số** cho tỉ lệ ba lần; **mắt** cho "nhìn ra đó là một đường chuyền".
  - AC: AC-35.1, AC-35.3, AC-35.4, AC-35.5
  - Phụ thuộc: T601

---

## Phase 48 — Lát 48: Nhìn ra ai đang giữ bóng

- [ ] **T603** — `nguoiGiuBong`: quy tắc tất định theo từng loại sự kiện
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: hàm trả người giữ bóng theo **đúng bảng 3.1 của plan**, và phép kiểm phủ **từng** `LoaiSuKien` trong mười bốn loại — kể cả ba loại trả `null` (`bat-dau`, `het-hiep`, sau `ban-thang`) và hai loại lấy **phần tử thứ hai** (`cuu-thua` lấy thủ môn, `mat-bong` lấy người cướp được).
  - Xong khi (D112, phát hiện số 1 của `/analyze`): `nguoiNhanChuyen` trả **đồng đội đứng gần vùng đích của bước nhất**, trừ chính người vừa chuyền; hòa thì lấy `playerId` nhỏ hơn nên luật **tất định**; phép kiểm: gọi hai lần trên cùng một đầu vào ra cùng một người, và người ấy **luôn thuộc đội đang cầm bóng**.
  - ⚠️ **Người nhận là một SUY DIỄN, không phải sự thật của trận** — engine chưa bao giờ tính ra anh ta. Nó được phép tồn tại **chỉ trong lớp vẽ**: không được vào dòng tường thuật, không vào thống kê, không lưu xuống đĩa.
  - Bằng chứng: **số**.
  - AC: AC-33.5, AC-35.2
  - Phụ thuộc: T601

- [ ] **T604** — Xương sống: quyền giữ bóng KHÔNG nhảy giữa hai nhịp
  - File: sửa `src/ui/phaBong.test.ts`
  - Xong khi: chạy hết một trận trên 10 mã trận × 7 quân số, áp `nguoiGiuBong` cho từng dòng theo thứ tự; đếm số lần quyền giữ bóng đổi **mà dòng ấy không nêu ai mới** — phải là **0**; và mọi dòng `the-vang` / `the-do` / `thay-nguoi` / `kiet-suc` đều giữ nguyên người cũ.
  - Bằng chứng: **số**.
  - AC: AC-33.5
  - Phụ thuộc: T603
  - ⚠️ Đây là lưới của **R50**. Không nhét vào T603: một phép kiểm "hàm trả đúng giá trị" và một phép kiểm "chuỗi giá trị qua cả trận không giật" là hai điều khác nhau, và cái thứ hai mới là thứ người xem thấy.

- [ ] **T605** — Bóng dính chân, và vòng nét đứt quanh người giữ bóng
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

- [ ] **T606** — Người giữ bóng đi theo đường của bóng, rồi về mốc của mình
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/components/San2D.tsx`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: trong một đoạn `re-bong`, người giữ bóng và quả bóng dùng **chung một đường** (D104); đoạn cuối của anh ta là **một đường thẳng về đúng mốc `hinhSan`** của chính anh ta (D105); đo trên bản build: khoảng cách người–bóng trong suốt đoạn rê luôn dưới một bán kính.
  - Xong khi (AC-35.2, D112): khi một đoạn `chuyen` kết thúc, bóng ở **trong một bán kính** quanh người nhận đã suy ra, và quyền giữ bóng chuyển sang anh ta **đúng lúc ấy** — không sớm hơn một khung nào; đo bằng chính dòng thời gian, không đo bằng mắt.
  - Bằng chứng: **số**.
  - AC: AC-33.2, AC-34.1, AC-35.2
  - Phụ thuộc: T605

- [ ] **T607** — Xương sống: tại tỉ lệ 1, MỌI điểm vẫn ở đúng mốc — kể cả người dẫn bóng
  - File: sửa `src/ui/san2D.test.ts`
  - Xong khi: phép kiểm chạy 10 mã trận × 7 quân số × mọi dòng; tại tỉ lệ 1 của mỗi nhịp, toạ độ **từng** điểm khớp `hinhSan` tới 10 chữ số — **kể cả** điểm của người đang dẫn bóng; describe "toạ độ tại mốc không bao giờ sai" của `noiSuy.test.ts` **không sửa một dòng**.
  - Bằng chứng: **số**.
  - AC: AC-34.3
  - Phụ thuộc: T606
  - ⚠️ Lưới của **R47**, và nó giữ luôn AC-28.3 của spec 005 cùng AC-25.2 của spec 004. Phải nằm ngay sau T606 chứ không để tới lát cuối: lát 50 và 51 đều dịch chỗ người, và nếu bất biến này vỡ thì phải biết nó vỡ từ lát nào.

- [ ] **T608** — Đo: quả bóng không còn đứng yên
  - File: — *(đo trên bản build)*
  - Xong khi: một trận trọn vẹn ở mức Chậm, quả bóng **không đứng yên quá 300ms** liên tục (trước spec này đo được **3144ms**, và tỉ lệ khung có bóng di chuyển là 35,5%); ghi cả hai con số mới vào mô tả commit.
  - Xong khi (phát hiện số 2 của `/analyze`): đo **riêng một phút `kiet-suc`** và **một phút `thay-nguoi`** — hai loại dòng không mang pha bóng nào, và là chỗ con số 3144ms sinh ra. Đo trung bình cả trận sẽ giấu đúng hai phút ấy.
  - Bằng chứng: **số**.
  - AC: AC-33.3
  - Phụ thuộc: T606

---

## Phase 50 — Lát 50: Qua người

- [ ] **T609** — `lechTranhNguoi`: hàm thuần, có biên
  - File: sửa `src/ui/phaBong.ts`, sửa `src/ui/phaBong.test.ts`
  - Xong khi: nếu một điểm đối phương nằm trong hành lang quanh đoạn đang rê thì trả một lệch **vuông góc** với đoạn ấy, độ lớn bị chặn ở **một nửa khoảng cách hai hàng**; không ai cản thì trả `{0,0}`; đầu vào vô lý (`NaN`, đoạn dài 0, hai điểm trùng) không ném và không trả `NaN`.
  - Bằng chứng: **số**.
  - AC: AC-34.2
  - Phụ thuộc: T601

- [ ] **T610** — Áp vào lớp vẽ: người dẫn bóng đi vòng, không đi xuyên
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: đo trên bản build một trận trọn vẹn — trong các đoạn rê bóng, **không lượt cặp nào** (người dẫn bóng ↔ một đối thủ) nằm dưới một bán kính quá **300ms** liên tục, đo theo đúng cách đã dùng ở Phase 40 (theo dõi danh tính từng cặp); ba phép kiểm bất biến vẫn xanh.
  - Bằng chứng: **số**.
  - AC: AC-34.2
  - Phụ thuộc: T609, T607

---

## Phase 51 — Lát 51: Hai đội cùng sống theo bóng

- [ ] **T611** — Hai nhóm, hai nguyên tắc
  - File: sửa `src/ui/components/San2D.tsx`, sửa `src/ui/san2D.test.ts`
  - Xong khi: `nghiengKhoiTheoBong` nhận thêm **vai trò** (đồng đội của người giữ bóng / đối phương); đồng đội được kéo thêm về phía khung thành đối phương, đối phương được kéo thêm về phía bóng; **tổng mọi lực kéo vẫn bị chặn ở một phần mười chiều dài sân** (AC-30.4 của spec 005), chứng minh bằng phép kiểm trên cả hai vai trò × bốn dải × hai đội.
  - Bằng chứng: **số**.
  - AC: AC-36.2, AC-36.3, AC-36.6
  - Phụ thuộc: T610

- [ ] **T612** — Ba phép kiểm bất biến chạy lại, và chúng là tiêu chí xong
  - File: sửa `src/ui/san2D.test.ts`
  - Xong khi: sau T611, ba phép kiểm vẫn xanh **không nới một ngưỡng nào** — không chồng khít trên 10 mã trận; thủ môn không rời một phần ba sân nhà; tám hàng xen kẽ đúng thứ tự ở **chín tổ hợp độ cao đội hình**; nếu một cái đỏ thì **siết lực kéo của T611**, không nới ngưỡng.
  - Bằng chứng: **số**.
  - AC: AC-36.4
  - Phụ thuộc: T611
  - ⚠️ Lưới của **R48**. Câu "nếu đỏ thì siết cái vừa thêm, không nới cái đã có" là bài học của T511 ở spec 005.

- [ ] **T613** — Đo: mọi điểm di chuyển có mục đích
  - File: — *(đo trên bản build)*
  - Xong khi: một trận ở mức Chậm — trong **mỗi nhịp**, **mọi** điểm đổi chỗ theo một hướng có nghĩa, đo bằng quãng đi được mỗi nhịp của từng người (trước spec này: trung vị **2,3** đơn vị); và với mỗi pha người giữ bóng tiến lên, đếm được **ít nhất một đồng đội** cũng tiến lên trong cùng nhịp.
  - Bằng chứng: **số**.
  - AC: AC-36.1, AC-36.2
  - Phụ thuộc: T611

---

## Phase 52 — Lát 52: Xem chậm, đo ngân sách, đóng spec

- [ ] **T614** [P] — Mức tốc độ thứ năm: Rất chậm, 2000ms một phút trận
  - File: sửa `src/hooks/useMatch.ts`, sửa `src/ui/components/BangDieuKhienTran.tsx`, sửa `src/ui/pages/TrangTran.tsx`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: `rat-cham: 2000` xếp **đầu** `CAC_MUC_TOC_DO`, **mặc định vẫn là `cham`** (D107); nhãn đủ hai thứ tiếng; chọn được bằng bàn phím; `noiSuy.test.ts` và `san2D.test.ts` tự động phủ mức mới qua ba phép kiểm duyệt `Object.entries(MS_MOI_PHUT)` và **vẫn xanh**.
  - Bằng chứng: **số**.
  - AC: AC-33.6
  - Phụ thuộc: —
  - ⚠️ **Phạm vi thật là năm file, không phải ba.** Đã grep: `MucTocDo` xuất hiện ở `useMatch.ts` (6), `BangDieuKhienTran.tsx` (7) và **`TrangTran.tsx` (2)** — file thứ ba này là chỗ dễ quên nhất. Hai file test **không sửa**: chúng tự duyệt bảng nên tự phủ mức mới; nếu phải sửa chúng thì nghĩa là mức mới phá một tính chất, không phải thiếu phép kiểm.

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
| AC-34.2 | T609, T610, T617 |
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
