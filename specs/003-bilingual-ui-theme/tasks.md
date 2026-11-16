# Tasks: Giao diện song ngữ, theme bóng đá và bộ biểu tượng

| | |
|---|---|
| **Spec** | `./spec.md` |
| **Plan** | `./plan.md` |
| **Phạm vi** | 36 AC (US-17 → US-23) |
| **Tiến độ** | 29/45 |
| **Sửa đổi** | 2026-11-16 — chẻ lần đầu từ plan, rồi sửa theo cả 8 phát hiện của `/analyze`; thêm T341–T342 lúc làm Phase 23; thêm T343–T344 lúc làm Phase 25 |

> Quy ước: `[P]` = có thể làm song song (khác file, không phụ thuộc nhau).
> Mỗi task phải: chạm file cụ thể + có cách kiểm chứng + đủ nhỏ để làm trong một lần.

Số task bắt đầu từ **T300** để không lẫn với T001–T136 của spec 001 và
T200–T224 của spec 002. Bảy phase dưới đây là bảy lát cắt dọc ở `plan.md`
mục 9; mỗi phase kết thúc là một ứng dụng chạy được (hiến pháp P6), và là
một commit.

**Một task không phải việc của tôi:** T323 là cổng chặn chờ **người dùng
duyệt theme**. Không có nó thì T326 áp theme ra 27 file còn lại rồi mới biết có đúng
ý hay không — đúng rủi ro R32.

---

## Phase 22 — Lát 22: Hạ tầng ngôn ngữ và một màn hình chạy thật

- [x] **T300** — Hai tuỳ chọn mới trong `tuyChonRepo`
  - File: sửa `src/services/tuyChonRepo.ts`, sửa `src/services/tuyChonRepo.test.ts`
  - Xong khi: test xanh — chưa có giá trị thì đọc ra `'vi'` và `'sang'`; ghi rồi đọc lại ra đúng thứ vừa ghi; đọc lỗi thì rơi về mặc định **không ném**, còn ghi lỗi thì ném. Bám đúng pattern `docHienSan2D`/`datHienSan2D` đã có (D71).
  - AC: AC-17.4, AC-17.7, AC-20.8, AC-20.9
  - Phụ thuộc: —

- [x] **T301** — Ngôn ngữ và chế độ vào store
  - File: sửa `src/store/appStore.ts`
  - Xong khi: store giữ `ngonNgu` và `cheDo`, nạp từ `tuyChonRepo` lúc mở ứng dụng; đổi giá trị thì mọi component đang đọc được vẽ lại.
  - AC: AC-17.2
  - Phụ thuộc: T300

- [x] **T302** — Khung bảng chuỗi hai bản, chuyển **một** khối
  - File: tạo `src/ui/ngonNgu/vi.ts`, `src/ui/ngonNgu/en.ts`, `src/ui/ngonNgu/index.ts`; sửa `src/ui/strings.ts`
  - Xong khi: khối `CHUNG` có đủ hai bản, bản EN khai kiểu `typeof` bản VI (D66); `tsc` sạch; **xoá thử một khoá khỏi `en.ts` thì `tsc` đỏ** — đây là phép chứng minh lớp lưới thứ nhất hoạt động.
  - AC: AC-22.2 *(lớp 1)*
  - Phụ thuộc: —

- [x] **T303** — Hook `useChuoi()`
  - File: tạo `src/hooks/useNgonNgu.ts`, sửa `src/ui/ngonNgu/index.ts`
  - Xong khi: component gọi `useChuoi()` nhận đúng bộ chuỗi của ngôn ngữ đang chọn; đổi ngôn ngữ trong store thì giá trị trả về đổi theo.
  - AC: AC-17.1
  - Phụ thuộc: T301, T302

- [x] **T304** — Nút đổi ngôn ngữ
  - File: tạo `src/ui/components/ChonNgonNgu.tsx`, sửa `src/App.tsx`
  - Xong khi: bấm nút thì chữ của khối `CHUNG` đổi ngay **không tải lại trang**; Tab tới được nút bằng bàn phím; đóng mở lại ứng dụng vẫn giữ ngôn ngữ vừa chọn.
  - AC: AC-17.2, AC-17.3, AC-17.4, AC-17.6
  - Phụ thuộc: T303

- [x] **T305** — Trang danh sách đội chuyển trọn sang `useChuoi()`
  - File: sửa `src/ui/pages/DanhSachDoi.tsx`
  - Xong khi: đi hết trang danh sách đội ở cả hai ngôn ngữ, **không sót một chữ nào** của ngôn ngữ kia; tên đội do người dùng nhập giữ nguyên.
  - AC: AC-19.4
  - Phụ thuộc: T304

---

## Phase 23 — Lát 23: 99 nhãn rời khỏi `domain/`

- [x] **T306** [P] — Nhãn vị trí rời khỏi domain
  - File: sửa `src/domain/positions.ts`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: `Position` không còn `ten`/`vietTat`; hai bảng `Record<PositionId, {ten, vietTat}>` phủ đủ 12 vị trí; `tsc` sạch — thiếu một vị trí là lỗi biên dịch (D68).
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T302

- [x] **T307** [P] — Nhãn vai trò rời khỏi domain (46 nhãn)
  - File: sửa `src/domain/roles.ts`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: như T306, phủ đủ 23 vai trò × (tên + mô tả); `tsc` sạch.
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T302

- [x] **T308** [P] — Nhãn chỉ thị rời khỏi domain (23 nhãn)
  - File: sửa `src/domain/instructions.ts`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: như T306, phủ đủ 6 chỉ thị và mọi mức của chúng; `tsc` sạch.
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T302

- [x] **T309** [P] — Nhãn chỉ số rời khỏi domain (18 nhãn)
  - File: sửa `src/domain/attributes.ts`, sửa `src/ui/ngonNgu/vi.ts`, sửa `src/ui/ngonNgu/en.ts`
  - Xong khi: như T306; `strings.ts` **thôi import** `tenChiSo` từ `domain` — đây là mối nối cuối cùng giữa hai lớp.
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T302

- [x] **T310** — Dời các phép kiểm nhãn sang lớp ngôn ngữ
  - File: sửa `src/domain/positions.test.ts`, `src/domain/roles.test.ts`, `src/domain/instructions.test.ts`, `src/domain/attributes.test.ts`; tạo `src/ui/ngonNgu/nhan.test.ts`
  - Xong khi: không test nào trong `domain/` còn khẳng định trên `.ten`; test mới khẳng định mỗi bảng nhãn phủ đủ id **ở cả hai ngôn ngữ** và không nhãn nào rỗng. Rủi ro R31 nói những phép kiểm này **đi theo nhãn**, không bị xoá.
  - AC: AC-19.1
  - Phụ thuộc: T306, T307, T308, T309

- [x] **T311** — Trang chiến thuật và trang cầu thủ dùng nhãn mới
  - File: sửa `src/ui/pages/TrangChienThuat.tsx`, `src/ui/pages/TrangDoi.tsx`, `src/ui/components/FormCauThu.tsx`, `src/ui/components/OViTri.tsx`, `src/ui/components/ChiThiDoi.tsx`, `src/ui/components/ChonVaiTro.tsx`
  - Xong khi: mở hai trang này ở cả hai ngôn ngữ, mọi tên vị trí/vai trò/chỉ thị/chỉ số đều đúng thuật ngữ bóng đá của ngôn ngữ đó; **chỉ số tổng và mức sai vị trí không đổi một con số nào** khi đổi ngôn ngữ.
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T310

- [x] **T312** — Giữ nguyên `FORMATIONS.ten`, ghi rõ vì sao
  - File: sửa `src/domain/formations.ts` *(chỉ thêm chú thích)*
  - Xong khi: có chú thích nói rõ "4-4-2" là **ký hiệu, không phải nhãn cần dịch** (D75), nên nó ở lại `domain/` một cách có chủ ý; lần soát P8 sau này không ai gỡ nhầm nó.
  - AC: —
  - Phụ thuộc: T306


- [x] **T336** — Payload lỗi thôi mang nhãn tiếng Việt
  - File: sửa `src/services/playerRepo.ts`, sửa `src/services/errors.ts` *(chú thích)*, sửa `src/ui/ngonNgu/{vi,en}.ts`, sửa `src/services/playerRepo.test.ts`
  - Xong khi: `InvalidAttributeValue` mang **mã chỉ số** (`'dut-diem'`) thay cho tên tiếng Việt; lớp `ui` tra chữ khi dựng câu lỗi; test xanh — ném lỗi với một chỉ số sai thì `chiTiet.truong` là mã, không phải chữ. Đây là khôi phục quy ước sẵn có: mọi chỗ khác trong repo đã dùng mã máy (D76).
  - AC: AC-22.1, AC-22.3
  - Phụ thuộc: T309

- [x] **T337** — `chiSoThieuChoVaiTro` thôi trả nhãn
  - File: sửa `src/domain/roles.ts`, sửa `src/domain/roles.test.ts`, sửa nơi dùng trong `src/ui/components/`
  - Xong khi: hàm trả `{ chiSo, giaTri }` — **bỏ trường `ten`**; giao diện tra nhãn từ lớp ngôn ngữ; không hàm nào trong `domain/` còn **sinh ra** chữ hiển thị, không chỉ là không **chứa** chữ.
  - AC: AC-19.1, AC-19.2
  - Phụ thuộc: T309


- [x] **T341** [P] — Nhãn bốn mức sinh nhanh chỉ số
  - File: sửa `src/domain/generator.ts`, sửa `src/ui/ngonNgu/{vi,en}.ts`, sửa `src/ui/components/FormCauThu.tsx`
  - Xong khi: `CAC_MUC_DO` còn đúng `{ id }`; bốn nhãn *Ngôi sao / Khá / Trung bình / Yếu* nằm ở lớp ngôn ngữ dưới dạng `Record<MucDo, string>`; form cầu thủ hiện đúng bốn mức ở cả hai ngôn ngữ.
  - AC: AC-19.1, AC-22.1
  - Phụ thuộc: T302

- [x] **T342** [P] — Ba câu cảnh báo xung đột chỉ thị
  - File: sửa `src/domain/instructions.ts`, sửa `src/ui/ngonNgu/{vi,en}.ts`, sửa `src/ui/components/ChiThiDoi.tsx`, sửa `src/domain/instructions.test.ts`
  - Xong khi: `XungDot` mang **mã** xung đột thay cho câu chữ; ba câu cảnh báo của AC-7.3 nằm ở lớp ngôn ngữ; dựng một bộ chỉ thị có xung đột rồi xem ở cả hai ngôn ngữ, câu cảnh báo đúng thứ tiếng đang chọn.
  - AC: AC-19.1, AC-22.1
  - Phụ thuộc: T302

---

## Phase 24 — Lát 24: Câu tường thuật hai ngôn ngữ

- [x] **T313** — Tách `MAU` thành hai bảng
  - File: tạo `src/ui/ngonNgu/mauCau.vi.ts`, `src/ui/ngonNgu/mauCau.en.ts`; sửa `src/ui/tuongThuat.ts`
  - Xong khi: `MAU_VI` mang nguyên 62 mẫu hiện có; `MAU_EN` khai kiểu buộc **cùng khoá và cùng độ dài mỗi loại** với `MAU_VI` (D69); `tsc` đỏ nếu một loại lệch số mẫu.
  - Ghi chú: `SO_MAU_CAU` hiện là export **chết** — chú thích nói "dùng cho test" nhưng không test nào dùng. Task này quyết định số phận nó: cho test đếm độ dài hai bảng dùng, hoặc xoá.
  - AC: AC-18.3
  - Phụ thuộc: T302

- [x] **T314** — Viết 62 mẫu câu tiếng Anh
  - File: sửa `src/ui/ngonNgu/mauCau.en.ts`
  - Xong khi: mỗi mẫu viết theo ngữ pháp tiếng Anh, **không dịch tại chỗ**; pha phạm lỗi đặt người phạm lỗi làm chủ ngữ (`B fouls A`), không phải người bị phạm lỗi.
  - AC: AC-18.1
  - Phụ thuộc: T313

- [x] **T315** — Test so sánh hai ngôn ngữ trên cùng một trận
  - File: tạo `src/ui/tuongThuat.songNgu.test.ts`
  - Xong khi: test xanh — cùng một mã trận dựng dòng tường thuật ở hai ngôn ngữ cho **cùng số dòng, cùng thứ tự, cùng phút, cùng danh sách cầu thủ**; chỉ trường chữ khác. Đây là AC dạng so sánh duy nhất của spec, hiến pháp P5 đòi nó có test riêng.
  - AC: AC-18.2, AC-18.3
  - Phụ thuộc: T314

- [x] **T316** — Trang trận đấu và trang lịch sử kể bằng ngôn ngữ đang chọn
  - File: sửa `src/ui/pages/TrangTran.tsx`, `src/ui/pages/TrangLichSu.tsx`, `src/ui/components/DongTuongThuat.tsx`
  - Xong khi: đá một trận ở tiếng Anh, đọc được trọn dòng tường thuật; **đổi ngôn ngữ giữa lúc trận đang chạy** thì trận chạy tiếp đúng phút và mọi dòng đã hiện được kể lại bằng ngôn ngữ mới; mở một trận cũ trong lịch sử cũng theo ngôn ngữ đang chọn.
  - AC: AC-17.5, AC-18.4
  - Phụ thuộc: T314

---

## Phase 25 — Lát 25: Quét nốt giao diện và dựng hai lớp lưới

- [x] **T317** [P] — Nhóm màn hình đội và cầu thủ
  - File: sửa `src/ui/pages/TrangDoi.tsx`, `src/ui/components/{FormDoi,FormCauThu,ChonMauAo,ChonAnh,AnhThayThe,DanhSachNgoaiSan}.tsx`
  - Xong khi: đi hết nhóm này ở cả hai ngôn ngữ, không sót chữ; tên đội và tên cầu thủ người dùng gõ **giữ nguyên đúng như đã gõ**.
  - AC: AC-19.4, AC-22.1
  - Phụ thuộc: T303

- [x] **T318** [P] — Nhóm màn hình trận đấu
  - File: sửa `src/ui/pages/{ChonCapDau,TrangChienThuat,TrangTran,TrangDoi,TrangLichSu}.tsx`, `src/ui/components/{DangKyDoiHinh,BangDieuKhienTran,ThayNguoi,BaoCaoSauTran,BangDiemCauThu,DanhSachGhiBan,OViTri,ChonVaiTro,ChiThiDoi,BoChienThuat,DanhSachNgoaiSan,DongTuongThuat,HopXacNhan}.tsx` — 18 khối trong `ngonNgu/{en,index}.ts`
  - Xong khi: dựng và đá trọn một trận ở cả hai ngôn ngữ, không sót chữ.
  - AC: AC-22.1
  - Phụ thuộc: T303

- [x] **T319** [P] — Chữ trong sân 2D
  - File: sửa `src/ui/components/San2D.tsx`, `src/ui/pages/TrangTran.tsx`, `src/ui/san2D.test.ts`; khối `SAN_2D` rời `strings.ts` sang `ngonNgu/{vi,en,index}.ts`. `SanBong.tsx` KHÔNG có chữ hiển thị nào — nó chỉ vẽ khung sân cho trang chiến thuật, nhãn do `OViTri` đưa vào.
  - Xong khi: mô tả từng điểm và nhãn trong ảnh SVG theo ngôn ngữ đang chọn — P8 nêu đích danh "kể cả chữ trong SVG".
  - AC: AC-22.4
  - Phụ thuộc: T303

- [x] **T320** [P] — Sao lưu, thông báo lỗi, và khung ứng dụng
  - File: sửa `src/ui/components/{SaoLuu,HopXacNhan}.tsx`, sửa `src/App.tsx`, sửa `src/ui/ngonNgu/{vi,en}.ts` phần câu lỗi và hai nhãn điều hướng
  - Xong khi: mọi thông báo lỗi — tệp hỏng, sai sơ đồ, hết dung lượng — hiện bằng ngôn ngữ đang chọn; xuất tệp ở một ngôn ngữ rồi nhập lại ở ngôn ngữ kia vẫn vào đủ; **hai nút điều hướng ở đầu trang** ("Lịch sử trận đấu", "Bắt đầu một trận") và dải báo lỗi lưu trữ cũng theo ngôn ngữ đang chọn.
  - Ghi chú: câu "hết dung lượng" nằm trong nhóm này chính là đường mà **AC-4.7 của spec 001** phủ. Dịch nó sang tiếng Anh **không** làm AC-4.7 tick được — nó vẫn không quan sát được đầu-cuối.
  - Ghi chú: `src/App.tsx` được thêm vào đây lúc làm Phase 22 — nó là file duy nhất có chữ hiển thị mà **không task nào nhận**, và chữ của nó nằm trên *mọi* màn hình nên bỏ sót là AC-22.1 trượt ở khắp nơi. `cauLoi` vốn đã thuộc nhóm này nên đây là chỗ đúng của nó.
  - AC: AC-19.3, AC-22.1, AC-22.3
  - Phụ thuộc: T303

- [x] **T321** — Lớp lưới 1: test quét khoá toàn bộ
  - File: tạo `src/ui/ngonNgu/ngonNgu.test.ts`
  - Xong khi: test xanh — mọi khối chuỗi có **đủ và đúng** tập khoá ở cả hai ngôn ngữ, không khoá nào rỗng. Kiểu `typeof` đã chặn phần lớn; test này bắt những chỗ kiểu không với tới.
  - AC: AC-22.1, AC-22.2
  - Phụ thuộc: T317, T318, T319, T320

- [x] **T322** — Lớp lưới 2: dấu hiệu thấy được lúc chạy
  - File: sửa `src/ui/ngonNgu/index.ts`
  - Xong khi: tra một khoá không có bản dịch thì trả về chuỗi đánh dấu thấy được *(ví dụ `⟨thiếu: CHUNG.huy⟩`)*, **không rơi về ngôn ngữ kia** và **không ném lỗi** làm vỡ màn hình; có test cho đúng hành vi đó.
  - AC: AC-22.2
  - Phụ thuộc: T321

---

## Phase 26 — Lát 26: Theme và chế độ tối

- [x] **T323** — Token màu và phông, cấu hình `darkMode`
  - File: sửa `tailwind.config.js`, sửa `src/index.css`; thêm `public/phong/` (4 tệp woff2 + GIAY-PHEP.md)
  - Xong khi: biến CSS khai ở `:root` và `:root[data-che-do='toi']`; token Tailwind trỏ tới biến (D70); phông nhúng trong repo, **chạy offline không mất chữ**.
  - AC: AC-20.4
  - Phụ thuộc: —

- [x] **T324** — Áp theme lên **một** màn hình mẫu
  - File: sửa `src/ui/pages/TrangLichSu.tsx`
  - Xong khi: trang Lịch sử mang trọn theme mới — bảng, nút, chữ phụ, trạng thái rỗng, khối chi tiết mở ra (D74). Bố cục **không xê dịch** so với trước.
  - AC: AC-20.1, AC-20.6
  - Phụ thuộc: T323

- [ ] **T325** — 🚦 **CỔNG CHẶN: người dùng duyệt màn hình mẫu**
  - File: — *(không sửa file nào)*
  - Xong khi: người dùng xem trang Lịch sử với theme mới và **nói rõ là được**, hoặc nêu chỗ cần sửa và tôi sửa rồi hỏi lại. Chưa có câu trả lời thì **không được làm T326**.
  - AC: AC-20.1
  - Phụ thuộc: T324

- [ ] **T326** — Áp theme: nhóm đội và cầu thủ
  - File: sửa `src/ui/pages/TrangDoi.tsx`, `src/ui/components/{FormDoi,FormCauThu,ChonMauAo,ChonAnh,AnhThayThe,DanhSachNgoaiSan,BangChiSo}.tsx`
  - Xong khi: nhóm này dùng token màu chung, **không còn một màu viết cứng nào**; bố cục không xê dịch; chức năng giữ nguyên.
  - AC: AC-20.1, AC-20.3, AC-20.6
  - Phụ thuộc: **T325**

- [ ] **T338** [P] — Áp theme: nhóm trận đấu
  - File: sửa `src/ui/pages/{ChonCapDau,TrangTran}.tsx`, `src/ui/components/{DangKyDoiHinh,BangDieuKhienTran,ThayNguoi,BaoCaoSauTran,BangDiemCauThu,DanhSachGhiBan,DongTuongThuat}.tsx`
  - Xong khi: như T326, cho nhóm này.
  - AC: AC-20.1, AC-20.3, AC-20.6
  - Phụ thuộc: **T325**

- [ ] **T339** [P] — Áp theme: sân 2D, sao lưu, hộp thoại
  - File: sửa `src/ui/components/{San2D,SanBong,SaoLuu,HopXacNhan,OViTri}.tsx`
  - Xong khi: như T326. Riêng sân 2D: màu cỏ và màu vạch theo token, **nhưng màu áo người dùng chọn giữ nguyên** — nó là dữ liệu, không phải theme.
  - AC: AC-20.1, AC-20.3, AC-20.6
  - Phụ thuộc: **T325**

- [ ] **T340** — Áp theme: các trang còn lại, và quét màu viết cứng
  - File: sửa `src/ui/pages/{DanhSachDoi,TrangChienThuat}.tsx`, `src/App.tsx`, `src/ui/components/{BoChienThuat,ChiThiDoi,ChonVaiTro}.tsx`
  - Xong khi: grep toàn bộ `src/ui` và `src/App.tsx` **không còn mã màu viết cứng nào** ngoài token; cả 28 file đã qua theme.
  - AC: AC-20.1, AC-20.3, AC-20.6
  - Phụ thuộc: T326, T338, T339

- [ ] **T327** — Nút đổi chế độ sáng/tối
  - File: tạo `src/ui/components/ChonCheDo.tsx`, sửa `src/App.tsx`
  - Xong khi: bấm nút thì cả ứng dụng đổi bảng màu **không tải lại trang** và việc đang làm dở còn nguyên; Tab tới được bằng bàn phím; đóng mở lại vẫn giữ chế độ vừa chọn; lần đầu mở là chế độ sáng.
  - AC: AC-20.7, AC-20.8, AC-20.9, AC-20.10
  - Phụ thuộc: T340

- [ ] **T328** — Test tương phản cho cả hai bảng màu
  - File: tạo `src/ui/theme.test.ts`
  - Xong khi: test xanh — mọi cặp (chữ, nền) trong cả hai bảng đạt ≥ 4.5:1; và màu áo do người dùng chọn đặt trên nền của **cả hai** chế độ vẫn cho chữ đạt 4.5:1, dùng lại `mauChuTuongPhan` đã có.
  - AC: AC-20.2, AC-20.5
  - Phụ thuộc: T327

---

## Phase 27 — Lát 27: Bộ biểu tượng

- [ ] **T329** — Chép bộ icon và dựng component `BieuTuong`
  - File: tạo `src/ui/components/BieuTuong.tsx`, tạo `src/ui/bieuTuong/*.svg`, tạo `THIRD-PARTY-LICENSES.md`
  - Xong khi: 10 icon Tabler cho 10 khái niệm ở AC-21.1 nằm trong repo dưới dạng SVG nội tuyến; **giấy phép MIT và nguồn gốc ghi lại trong repo**; chạy offline hiện đủ. Khái niệm nào bộ Tabler không có thì dùng chữ, **không trộn bộ khác** (AC-21.2).
  - AC: AC-21.1, AC-21.2, AC-21.4
  - Phụ thuộc: —

- [ ] **T330** — Đặt biểu tượng vào các màn hình chính
  - File: sửa `src/ui/pages/DanhSachDoi.tsx`, `TrangDoi.tsx`, `TrangLichSu.tsx`, `TrangTran.tsx`, `TrangChienThuat.tsx`
  - Xong khi: mỗi khái niệm lặp lại có biểu tượng riêng, **luôn kèm nhãn chữ hoặc `aria-label`** — biểu tượng không bao giờ là cách duy nhất để hiểu; đổi ngôn ngữ thì biểu tượng giữ nguyên, chỉ chữ đổi.
  - AC: AC-21.1, AC-21.3, AC-21.5
  - Phụ thuộc: T329, T340

---

## Phase 28 — Lát 28: Hai lỗi treo, hai chỗ dọn, kiểm tay, đóng spec

- [ ] **T331** [P] — Màn đăng ký đội hình đếm theo quân số thật
  - File: sửa `src/ui/components/DangKyDoiHinh.tsx`, sửa `src/ui/ngonNgu/{vi,en}.ts`
  - Xong khi: trận sân 5 hiện **"5/5 chính"** chứ không phải "5/11 chính"; câu hướng dẫn nêu đúng số người chính và khoảng số dự bị của trận đó, ở cả hai ngôn ngữ.
  - AC: AC-23.1
  - Phụ thuộc: T318

- [ ] **T332** [P] — Câu lỗi nêu tên cầu thủ thay vì mã định danh
  - File: sửa `src/ui/pages/ChonCapDau.tsx`
  - Xong khi: trận không bắt đầu được vì thiếu chỉ số thì thông báo nêu **tên** những cầu thủ đó, không phải chuỗi mã thô.
  - AC: AC-23.2
  - Phụ thuộc: T318

- [ ] **T343** [P] — Dọn `strings.ts`: xoá những tái xuất đã chết
  - File: xoá `src/ui/strings.ts`, chuyển `coTep()` sang `src/ui/ngonNgu/soLieu.ts`; sửa `src/ui/components/SaoLuu.tsx` cho đúng đường nhập mới
  - Xong khi: `grep -r "ui/strings" src/` không ra kết quả nào; `tsc` sạch và cả bộ test xanh. `coTep()` ở lại dạng hàm thuần, không qua `useChuoi()`, vì nó chỉ sinh ký hiệu đơn vị B/KB/MB — viết y hệt ở hai ngôn ngữ, cùng lý do đã cho tên sơ đồ (D75).
  - Ghi chú: tìm ra lúc làm T320. Suốt Phase 22–25 mỗi khối rời đi đều để lại một dòng `export const X = X_VI` để những file chưa chuyển vẫn biên dịch được; chuyển xong hết thì 140 dòng ấy thành rác. Lớp lưới của T321 quét theo **khối trong `BO_CHUOI`** nên không thấy chúng, và `tsc` cũng không, vì tái xuất không dùng tới không phải lỗi.
  - AC: — *(không phục vụ AC nào; là nợ kỹ thuật do chính cách chuyển dần từng khối sinh ra, nên trả trước khi đóng spec)*
  - Phụ thuộc: T332

- [ ] **T344** [P] — Mốc thời gian theo ngôn ngữ đang chọn
  - File: sửa `src/ui/pages/TrangLichSu.tsx`, sửa `src/ui/ngonNgu/{vi,en,index}.ts`
  - Xong khi: ở tiếng Anh, mốc thời gian của một trận trong lịch sử hiện theo lối Anh (ví dụ `16 Nov 2026, 16:28`) chứ không phải `16:28:13 16/11/2026`; ở tiếng Việt vẫn như cũ. Mã vùng (`vi-VN`/`en-GB`) nằm trong bảng chuỗi chứ không đặt cứng trong component.
  - Ghi chú: tìm ra lúc kiểm tay T320. `toLocaleString('vi-VN')` đặt cứng là chỗ **duy nhất** còn lại trong `src/` phụ thuộc vùng miền — đã `grep` `toLocale|Intl\.|vi-VN` để chắc. Không AC nào nói về định dạng ngày, nhưng một màn hình tiếng Anh in ngày kiểu Việt là đúng cái P8 cấm: một màn hình không trộn hai ngôn ngữ.
  - AC: AC-22.1
  - Phụ thuộc: T303

- [ ] **T333** — Kiểm tay 2 ngôn ngữ × 2 chế độ
  - File: — *(kiểm trên ứng dụng đang chạy)*
  - Xong khi: đi hết **mọi** màn hình ở bốn tổ hợp, kể cả màn hình trống và màn hình lỗi, không sót chữ và không chỗ nào tương phản kém. Đọc trọn một trận ở tiếng Anh, soi từng dòng về ngữ pháp và chủ ngữ. Xuất rồi nhập lại một tệp sao lưu ở ngôn ngữ khác.
  - AC: AC-17.5, AC-18.4, AC-19.3, AC-19.4, AC-22.1
  - Phụ thuộc: T328, T330, T331, T332, T343, T344

- [ ] **T334** — Đo lại bốn ngân sách hiệu năng
  - File: — *(đo trên bản build)*
  - Xong khi: mở danh sách 25 cầu thủ < 300ms; kéo-thả < 100ms; giả lập trọn trận < 3 giây; mở ứng dụng 20 đội + 20 trận < 2 giây. Thêm: đổi ngôn ngữ < 200ms, đổi chế độ < 200ms. **Phông và icon mới không được đẩy lần mở đầu vượt 2 giây.**
  - Gộp luôn **T035 của spec 001** — task cuối cùng còn mở của spec ấy, đo hai ngân sách hiển thị và cần đúng trình duyệt của người dùng. T333 đã bắt mở trình duyệt rồi nên đo thêm hai con số này không tốn lượt nào. Đo xong thì tick T035 bên `specs/001-football-team-sim/tasks.md`.
  - AC: —
  - Phụ thuộc: T333

- [ ] **T335** — Tick 36 AC và đóng spec
  - File: sửa `specs/003-bilingual-ui-theme/spec.md`
  - Xong khi: mọi AC ở mục 3 được tick có căn cứ; Definition of Done đủ chín mục; `Status` đổi thành **Done**.
  - AC: toàn bộ
  - Phụ thuộc: T334

---

## Bảng phủ AC

| AC | Task |
|---|---|
| AC-17.1 | T303 |
| AC-17.2 | T301, T304 |
| AC-17.3 | T304 |
| AC-17.4 | T300, T304 |
| AC-17.5 | T316, T333 |
| AC-17.6 | T304 |
| AC-17.7 | T300 |
| AC-18.1 | T314 |
| AC-18.2 | T315 |
| AC-18.3 | T313, T315 |
| AC-18.4 | T316, T333 |
| AC-19.1 | T306, T307, T308, T309, T310, T311, T337, T341, T342 |
| AC-19.2 | T306, T307, T308, T309, T311, T337 |
| AC-19.3 | T320, T333 |
| AC-19.4 | T305, T317, T333 |
| AC-20.1 | T324, T325, T326, T338, T339, T340 |
| AC-20.2 | T328 |
| AC-20.3 | T326, T338, T339, T340 |
| AC-20.4 | T323 |
| AC-20.5 | T328 |
| AC-20.6 | T324, T326, T338, T339, T340 |
| AC-20.7 | T327 |
| AC-20.8 | T300, T327 |
| AC-20.9 | T300, T327 |
| AC-20.10 | T327 |
| AC-21.1 | T329, T330 |
| AC-21.2 | T329 |
| AC-21.3 | T330 |
| AC-21.4 | T329 |
| AC-21.5 | T330 |
| AC-22.1 | T317, T318, T320, T321, T333, T336, T341, T342, T344 |
| AC-22.2 | T302, T321, T322 |
| AC-22.3 | T320, T336 |
| AC-22.4 | T319 |
| AC-23.1 | T331 |
| AC-23.2 | T332 |

## Ghi chú thực thi

- **Chuỗi phụ thuộc dài nhất** (10 mắt, và nó là đường găng): T323 → T324 →
  **T325** → T326 → T340 → T327 → T328 → T333 → T334 → T335. Đường găng đi qua
  một cổng chặn không nằm trong tay tôi — T325 chờ người dùng duyệt. Nhánh
  ngôn ngữ ngắn hơn: T300 → T301 → T303 → T318 → T331 → T333 → T334 → T335 (8).
- **Làm song song được:** T306–T309 (bốn file domain khác nhau);
  T317–T320 và T326/T338/T339 (nhóm màn hình khác nhau); T331–T332; và cả
  nhánh theme T323–T324 chạy song song với nhánh ngôn ngữ T313–T316.
- **Tám phát hiện của `/analyze` đã xử lý:** T336–T337 đóng phát hiện
  CRITICAL (nhãn lọt ra ngoài `ui`); AC-18.3 siết lại trong spec; bốn đường
  dẫn file sai đã sửa; T326 chẻ thành T326/T338/T339/T340; con số "31 màn"
  sửa thành 28 file; `SO_MAU_CAU` ghi vào T313; T035 gộp vào T334; AC-4.7
  ghi vào T320.
- **T318 chạm 19 file, không phải 8.** Danh sách file của task chỉ kể nhóm
  "màn hình trận đấu", nhưng 18 khối của nó còn được đọc ở trang chiến thuật,
  trang đội, trang lịch sử, hộp xác nhận và dòng tường thuật. Lần thứ tư
  cùng một kiểu sai: danh sách file trong tasks.md được viết theo TÊN KHỐI,
  còn phạm vi thật là MỌI NƠI ĐỌC KHỐI ẤY — phải `grep` tên khối trước khi
  chốt danh sách file.
- **Ba chỗ bảng ở tầng module giữ nhãn.** `NHAN_TOC_DO` (BangDieuKhienTran),
  `CAC_CHI_TIEU` (BaoCaoSauTran) và `NHAN_THEO_LOAI` (DongTuongThuat) dựng
  nhãn ngay lúc nạp module, tức trước khi biết ngôn ngữ. Cả ba đã đổi thành
  bảng chỉ giữ KHOÁ, nhãn tra trong thân component. Hai hàm trợ giúp ở tầng
  module (`cauLyDo` ở hai trang, `khoangThoiGian`/`soLieuHienThi`) nhận bảng
  chuỗi làm tham số — cùng cách đã dùng cho `hinhSan()` ở T214.
- **Hiến pháp mục 4:** T300 chạm lớp đọc/ghi dữ liệu nên **chưa có test là
  chưa xong**. T315, T321, T322, T328 là test, không phải việc phụ.
- **Rủi ro R31** đã thành T310: test nhãn **đi theo nhãn**, không bị xoá.
- **Sửa lúc làm Phase 23:** còn hai chỗ nhãn trong `domain/` mà không task
  nào nhận — bốn mức sinh nhanh ở `generator.ts`, và ba câu cảnh báo xung
  đột ở `instructions.ts` (trường tên là `canhBao`). Thành T341 và T342.
  Cả hai lọt vì cùng một lý do đã làm con số "23 nhãn" của T308 sai: con số
  99 đến từ một `grep` bắt `ten:`/`moTa:`/`nhan:`, nên nó bỏ sót `danhDoi`
  và `canhBao`. **Đếm nhãn bằng tên trường là cách đếm sai** — phải đếm mọi
  chuỗi có dấu tiếng Việt trong `domain/`.
- **Sửa lúc làm Phase 22:** `src/App.tsx` có ba chuỗi hiển thị mà không task
  nào nhận — hai nhãn điều hướng và dải báo lỗi lưu trữ. Đã thêm vào T320.
  Lỗ hổng loại này không lộ ra ở bảng phủ AC, vì bảng ấy soát theo **AC**
  chứ không theo **file**; nó chỉ lộ khi mở ứng dụng lên nhìn.
- **Hai thứ không task nào nhận, tìm ra khi làm T320** — nay đã thành
  **T343** và **T344** trong Phase 28, theo quyết định của người dùng:
  1. `src/ui/strings.ts` giờ chỉ còn `coTep()` là thật sự có người gọi; 140
     dòng còn lại là tái xuất chết (`export const X = X_VI`) từ lúc chuyển
     dần từng khối. Lớp lưới của T321 quét theo KHỐI nên không bắt được, và
     `tsc` cũng không, vì tái xuất không dùng tới không phải lỗi. → **T343**.
  2. `TrangLichSu.tsx` định dạng mốc thời gian bằng
     `toLocaleString('vi-VN')` đặt cứng, nên ở chế độ tiếng Anh ngày vẫn
     hiện kiểu Việt (16:28:13 16/11/2026). Không AC nào nói về định dạng
     ngày, nhưng trộn hai ngôn ngữ trên một màn hình là đúng cái P8 cấm.
     → **T344**.
- **`coTep()` KHÔNG qua lớp ngôn ngữ, có chủ ý.** Nó chỉ sinh KÝ HIỆU đơn
  vị (B/KB/MB), viết y hệt ở hai ngôn ngữ — cùng lý do đã cho tên sơ đồ
  (D75) và dấu "▲" của sân 2D. T343 chuyển nó sang `ngonNgu/soLieu.ts` để
  `strings.ts` biến mất hẳn, nhưng nó vẫn là hàm thuần, không đọc ngôn ngữ.
- **Một ngoại lệ thật của phép kiểm "tiếng Anh không còn chữ Việt" (T321):**
  `NGON_NGU.vi` phải là "Tiếng Việt" ở CẢ HAI bản. Tên một ngôn ngữ viết
  bằng chính ngôn ngữ ấy; dịch thành "Vietnamese" là làm nút chuyển khó tìm
  hơn cho đúng người cần nó. Đã ghi vào danh sách ký hiệu dùng chung cùng
  `TEN_SO_DO` và `SAN_2D.dauThamGia`.
- **Tự kiểm của T321, kiểu như T302 đã làm:** xoá một khoá của bảng chỉ mục
  (`LY_DO_TU_CHOI_CAN_THIEP['o-khong-ton-tai']`) khỏi `en.ts` → `tsc` im
  lặng hoàn toàn, test đỏ 2 chỗ. Đó đúng là khoảng trống mà lớp lưới này
  sinh ra để lấp. Đã khôi phục.
