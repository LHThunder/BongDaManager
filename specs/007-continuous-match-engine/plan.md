# Plan: Engine mô phỏng liên tục — toạ độ mét và cơ học chuyển động

| | |
|---|---|
| **Spec** | `specs/007-continuous-match-engine/spec.md` (Status `Planned`, **30 AC** sau lượt hỏi 2026-11-23) |
| **Status** | Approved — tám câu mục 10 đã được người dùng trả lời **2026-11-23** |
| **Created** | 2026-11-23 |
| **Hiến pháp** | 3.0.1 |
| **Nền đo** | commit `f537d7d`, engine v6, 1.304 test xanh, 63 file test |

> **Đánh số liên tục.** Spec 006 dùng T600–T628, Phase 47–52, quyết định D101–D116, rủi ro
> R46–R50. Spec 007 dùng **T700+**, **Phase 53+**, **D117–D134**, **R51–R64**.

> **Luật dẫn chứng của plan này.** Hợp đồng là **TÊN HÀM**, không phải số dòng. Mọi số dòng
> dưới đây đo trên `f537d7d` và chỉ là chỉ dẫn đọc; chúng sẽ trôi ngay khi T701 bóc 129 dòng
> khỏi `tran.ts`. Bảng số dòng nằm ở **đúng một chỗ** (mục 2.4) và được sửa sau T701. Mọi con
> số thời gian phải kèm **lệnh dựng lại được** (`npx vitest run <file>`) và điều kiện đo viết
> thành chữ — không trích một số trơ.

---

## 0. Hợp nhất: một lưới mốc, một đồng hồ, một hình dạng bộ đệm

Mục này đi **trước** mục hiến pháp vì sáu quyết định bên dưới đều trích về nó. Trong lúc lập
plan, hội đồng thiết kế đẻ ra **ba đơn vị vòng ngoài và bốn hình dạng bộ nhớ** cho cùng một
việc; đây là chỗ chốt **một**. Mọi quyết định khác **trích về đây**, không tự khai lại.

| Đại lượng | Giá trị chốt | Hằng số sống ở |
|---|---|---|
| Đơn vị vòng ngoài | **một phút trận** (`buocPhutLienTuc`) | — |
| Bước tích phân | **0,5 giây, luôn luôn** (`BUOC_MOI_PHUT = 120`) | `lienTuc/moc.ts` |
| Lưới mốc **phát ra** phần thường | **1 giây** (`MOC_MOI_PHUT = 60`) — phát mốc chẵn | `lienTuc/moc.ts` |
| Lưới mốc phát ra ở tình huống quan trọng | **0,5 giây** — phát thêm mốc lẻ | `lienTuc/moc.ts` |
| Đơn vị `chiSoMoc` | **số nửa giây tuyệt đối** từ tiếng còi khai cuộc | `lienTuc/moc.ts` |
| Số thực thể | **26** = 22 cầu thủ + 3 trọng tài + bóng | `lienTuc/moc.ts` |
| Hình dạng bộ đệm | **một lô mỗi phút**, `Float32Array` stride 8 + header `Int32Array` 2 ô/mốc | `lienTuc/loMoc.ts` |
| Chặn cứng | `tongPhutTran(tt) + 2`, **dùng nguyên khuôn** `chayHetTran` (tran.ts:1734) | — |
| Tua ngược | **KHÔNG CÓ** trong spec 007 | — |

**Vì sao tích phân 0,5 giây nhưng phát 1 giây.** Nếu lưới tích phân đổi khi một tình huống
được làm dày thì hạt giống của mọi mốc sau đó dịch, và AC-37.5 ("mỗi mốc tái lập được một
mình") chết. Tích phân ở bước nhỏ nhất mà spec đòi (0,5 giây, AC-37.7) rồi **thưa đầu ra** biến
việc làm dày thành một quyết định **chỉ ở đầu ra** — không một lần rút nào dịch. Giá đo được:
+11.508 bước thay vì 5.754, tức **+13,6 đến +21,1 ms một trận** (điều kiện đo ở mục 2.3).

**Vì sao lô theo phút, không phải bộ đệm trọn trận và không phải bộ đệm vòng.** Lô một phút ở
trường hợp xấu nhất (cả phút dày 0,5 giây) là 120 × 26 × 8 × 4 B = **99.840 byte ≈ 97,5 KiB**,
cộng header 120 × 2 × 4 B = 960 byte. Bộ đệm trọn trận là 3,09–3,43 MB; bộ đệm vòng 1024 bước
là 922 KiB **cộng** một phép đánh chỉ số có quấn vòng cộng một file test riêng cho nó, và nó
mua đúng không gì cả hôm nay (mốc neo là tiền đặt cọc cho spec 008–010). Lô theo phút trùng
đúng nhịp `setTimeout` đang có của `useMatch` (một lần nổ = một phút = một lần ghi store).

**Bộ đệm là ĐẦU RA CHỈ-GHI.** Trạng thái mô phỏng sống trong biến `float64` cục bộ và **không
bao giờ đọc lại** từ `Float32Array`. Nếu đọc `v(n−1)` ra từ đó thì bố cục bộ đệm thành một phần
hợp đồng của engine, và đổi stride về sau là đổi kết quả mọi trận đã lưu.

**Stride 8 có tên:** `x, y, z, vx, vy, vz, huong, coMat`. `vz` vì khối JSON mục 15 của
`ban-mo-ta-goc.md` ghi thẳng nó cho `bong`; `coMat` vì không có ô ấy thì người bị thẻ đỏ đứng
mãi ở toạ độ cuối. Header `Int32Array` hai ô mỗi mốc: `[chiSoMoc, nguoiGiu]` — ô thứ nhất là
chốt chống đọc mốc chưa ghi, ô thứ hai là nhà duy nhất của AC-37.6 trong bộ đệm.

**Phép kiểm canh mục này** (một dòng, đỏ ở CON SỐ chứ không ở triệu chứng):
`soBuoc === tongPhutTran(tt) * BUOC_MOI_PHUT` và `MOC_MOI_PHUT * 2 === BUOC_MOI_PHUT`.

---

## 1. Kiểm tra hiến pháp (Constitution check)

| Nguyên tắc | | Lý do |
|---|---|---|
| **P1** giả lập tái lập được | ✅ | Đây là chỗ plan mạnh nhất. Mọi hạt giống là **hàm thuần của mã trận**; độ lệch giữa các dòng rút là một **đẳng thức số học**, không phải một kết quả quét (D118). Thời tiết tiêu **0 lần rút** theo cấu trúc — chữ ký nhận `string`, không nhận `Rng` (D130). `boundaries.test.ts` quét `./**/*.ts` nên `src/engine/lienTuc/` **tự** vào phạm vi cấm `Math.random`/`Date.now`/`performance.now`/`setTimeout`, không phải bật gì. |
| **P2** luật bóng đá tách khỏi giao diện | ✅ | Mọi cơ học ở `src/engine/lienTuc/`; `CAM_IMPORT` có `/\.\.\/ui/` nên engine không gọi về được. Hình học sân đặt ở **gốc** `src/engine/` (D128) chứ không ở `domain/`: `src/domain/boundaries.test.ts` quét token **viết tay theo từng file**, nên một file mới không vào lưới nào; lưới engine thì glob. |
| **P3** dữ liệu người dùng bất khả xâm phạm | ✅ | `DB_VERSION` giữ **3**, `PHIEN_BAN_ENGINE` giữ **6**, `MOC_V6` không sửa một ký tự. Engine liên tục mang số **riêng** 101 (D122), nên 20 trận cũ **không** bị tước nút đấu lại lần thứ hai trong hai spec liên tiếp. Không ghi lại một bản ghi nào trên đĩa: mọi phép điền mặc định là phép **đọc**. |
| **P4** offline | ✅ | Thời tiết và gió dẫn xuất từ mã trận, không gọi mạng. **Không một dependency mới nào** (mục 2.2). Tệp xuất là JSON thô, không dùng `fflate` (`CAM_IMPORT` chặn đúng nó ở engine). |
| **P5** AC so sánh phải có test | ⚠️ | **Ba chỗ chưa đủ, và plan khai thẳng.** (a) AC-45.3 có test thật (D131) — đạt. (b) AC-38.1→38.7, **38.9, 38.10, 38.11** đo trên **chính tệp xuất** qua `doCoHoc` — **mười** AC, có bộ test **ngược** cho mỗi ngưỡng — đạt. *(Trước 2026-11-23 chỉ có chín: AC-38.10 nằm ngoài vì dải 15–25 m bất khả thi.)* (c) **AC-38.8** là ngoại lệ đã chốt của AC-45.6, và plan phải đặt phép kiểm ấy ở một file **có tên** với một ngưỡng **quy từ** hằng số engine (T735), nếu không hai tầng nói hai ngưỡng. (d) **AC-31.4 không có đường kiểm nào** — hạ xuống hai thứ đo được trong node (R56). (e) ✅ **AC-38.10 đã giải 2026-11-23** — người dùng nới dải thành **15–35 m** (câu 6), nên nó vào `doCoHoc` như mọi AC khác và P5 không còn khuyết ở đây. Hai dấu ⚠️ còn lại của hàng này là (c) và (d). |
| **P6** mỗi lát bàn giao tự chạy được | ✅ | Phase 53 bao đủ để chọn chế độ, bắt đầu trận, xem sân 2D chạy theo giây, lưu trận — luồng mục 4 của spec đi hết ở **cả hai** chế độ ngay sau lát đầu. **Phép bóc nằm CÙNG lát** với lát đầu tiên xem được: bóc riêng rồi bàn giao là một đợt refactor không có gì bấm thử, và đó là vi phạm P6. |
| **P7** tệp sao lưu mở lại được | ⚠️ | `SCHEMA_VERSION` **giữ 5** (D122) theo tiền lệ `quanSo?`. Cái giá phải canh: `kiemTheoSchema` chỉ đọc `kq.success` rồi nâng cấp trên **JSON thô**, nên không chỗ nào kiểm **giá trị** trường mới — một tệp sửa tay đi qua cổng. Bắt buộc: một test nhập tệp v5 ở chế độ **`'thay-the'`** (ở `'gop'` không trận nào vào được, test xanh mà rỗng) chứa một trận có đủ `quanSo` + `thoiLuong` mà **không** có `cheDoMoPhong`, và mặc định đặt **trước** spread. |
| **P8** song ngữ Việt–Anh cùng commit | ✅ | Nhãn chế độ, nhãn thời tiết, lý do khoá **nhồi vào các khối chuỗi đã có** (`CHON_CAP_DAU`, `TRAN_DAU`, `LyDoKhongBatDau`) — 2 file mỗi lần, **0 chỗ** sửa `ngonNgu/index.ts`. Hai cảnh báo: khai nhãn bằng **khoá literal** chứ không `Readonly<Record<string,string>>` (`BanDich<T>` chỉ bắt thiếu/thừa cho khoá literal; `Record` tụt vào đúng cái lỗ của `LY_DO_TU_CHOI_CAN_THIEP` và thiếu bản dịch chỉ lộ ra trên màn hình dưới dạng `⟨thiếu: …⟩` vì Proxy **không ném**); và mọi bảng tra-bằng-mã mới cần một test lúc chạy. |
| **P9** bàn phím + tương phản 4,5:1 + không chỉ dựa màu | ⚠️ | Hai món có tên. (a) Trạng thái khoá của chế độ liên tục hiện bằng **CHỮ** (một câu nói rõ vì sao), theo tiền lệ `TrangLichSu.tsx:271-292`; vì repo **chưa từng** khoá một `<option>` nào, chốt **nhóm radio** thay vì `select` (D134). (b) Nhãn thời tiết và nút xuất tệp vào được bằng bàn phím, dùng token màu đã có để không nợ thêm cặp tương phản nào trong `theme.test.ts`. **Phải nói ra:** không một test nào canh phần này (`include` là `src/**/*.test.ts`, không `.test.tsx`, không jsdom) — nó là **kiểm bằng tay**, không phải một dòng để tick. |
| **P10** không lặng lẽ cắt bớt | ⚠️ | Bản ghi trận chỉ phình **+19 byte một trận** (+380 byte cho cả 20 trận) vì vị trí **sinh lại** chứ không lưu. Hai chỗ phải canh: (a) nếu số tình huống của một trận vượt trần thì **báo lỗi kèm số đếm thật**, không cắt — cắt một tình huống là làm AC-37.4 ("không khuyết mốc nào") hỏng đúng chỗ bị cắt; (b) nhật ký trong tệp xuất **không được** dùng `TranDaLuu.cacSuKien` (bản **đã lọc** 60–100 dòng) — dùng bản đã lọc là làm AC-45.6 **xanh giả**. |

**Không có ngoại lệ nào phải xin.** Bốn dấu ⚠️ là **nợ có tên kèm phương án bù**, không phải vi
phạm: P5 → T735 + R56 + D133; P7 → test nhập tệp v5 ở `'thay-the'`; P9 → T761 kiểm bằng mắt có
danh sách; P10 → kênh nhật ký riêng + lỗi-không-cắt.

---

## 2. Bối cảnh kỹ thuật

### 2.1 Ngôn ngữ & runtime

Không đổi: React 18.3.1 + TypeScript strict + Vite + Tailwind. Vitest `environment: 'node'`,
`include: ['src/**/*.test.ts']`. Cổng: `npx tsc --noEmit` + `npx vitest run` + `npm run build`.

**Hệ quả chặn thiết kế, phải nhớ suốt plan:** không jsdom, không `@testing-library`, **0 test
component**, **0 test cho `src/hooks`** (7 file, không một `.test.ts`). Một file `.test.tsx`
sẽ bị **bỏ qua trong im lặng**. Nên mọi **luật** phải nằm trong hàm thuần export được, và mọi
chỗ nối dây `useEffect` còn lại chỉ là phép truyền tham số (R54).

### 2.2 Dependency mới

**Không có.** `Float32Array`/`Int32Array` là built-in — chúng sẽ là typed array **đầu tiên**
trong `src/engine`. Tệp xuất là JSON thô qua `JSON.stringify`, không nén.

**Tuyên bố ngay bây giờ, và plan khai rằng tuyên bố này không có test đỡ:** engine liên tục
**thuần tính toán**; đưa bộ đệm vào `Worker` hay `SharedArrayBuffer` thuộc tầng giao diện và
**ngoài spec 007**. `CAM_IMPORT` hiện **không** chặn `Worker`, `SharedArrayBuffer`, `node:*`,
`zod`, `@dnd-kit/core` — nên một task sau muốn `Worker` thì phải kèm việc mở rộng `CAM_IMPORT`
(R62).

### 2.3 Số đo nền, kèm điều kiện đo

| Đại lượng | Số | Điều kiện đo |
|---|---|---|
| v6 một trận | **7,4 ms trung bình / 12,6 ms lớn nhất** | `npx vitest run src/engine/hieuNang.test.ts`, 20 mã, có lượt khởi động |
| Cơ học thuần 11.508 bước | **13,64 / 17,67 / 21,13 ms** (min/trung vị/max) | Node, tiến trình mới, 200.000 bước khởi động, một luồng, 20 lượt |
| Một trận liên tục (ước) | **25,1 ms trung vị / 33,7 ms lớn nhất** | tổng hai dòng trên, cùng điều kiện |
| Bộ nhớ lô một phút | **97,5 KiB** | `process.memoryUsage().arrayBuffers` (đo `heapUsed` là đo nhầm quầy — nó báo 0,00 MB) |
| Toàn suite | **27,34 s** / 63 file / 1.304 test | `npx vitest run`, máy này |
| `src/ui/san2D.test.ts` chạy riêng | **8,16 s** / 55 test | `npx vitest run src/ui/san2D.test.ts`, tiến trình mới |
| Số mốc một trận | **5.520–6.000, trung bình 5.754** | `tongPhutTran = thoiLuong + buGio.hiep1 + buGio.hiep2`, bù giờ 1–5 phút mỗi hiệp |
| v6, A15 vs B10, 200 mã, sân trung lập | **174–17–9 = 87,0% thắng, hiệu số +2,255 bàn** | `npx vitest run src/engine/sosanh.doiManhHon.test.ts` in đúng 174-17-9 |

**Ba ngân sách, và plan nói rõ nó viết cho cái nào.** AC-31.3 "một trận < 3 giây" → dư **89
lần**. `hieuNang.test.ts` 200 ms → dư **5,9 lần**. Mùa giải 380 trận < 30 giây = **78,95 ms một
trận** → dư 2,3 lần ở điều kiện **tốt nhất**, nhưng dưới hệ số nở 3,5 lần đã đo giữa chạy riêng
và suite song song thì 33,7 × 3,5 = **118 ms, ngân sách mùa giải VỠ**. Plan **báo con số, không
kết luận** (nghĩa vụ mục 6 của spec), và T753 là task đo-và-báo, **không** có task tối ưu để
lọt ngưỡng.

**Hằng số không được chạm.** `PHIEN_BAN_ENGINE = 6`, `DB_VERSION = 3`, `SCHEMA_VERSION = 5`,
bảng `MOC_V6` (393 dòng), `BAN_KINH = 2.6`, `RONG = 100`, `CAO = 64`, thân `toaDo`, thân bốn
hàm vòng lặp của `tran.ts`.

### 2.4 Bảng số dòng (đo trên `f537d7d`, sửa lại sau T701)

| Ký hiệu | Vị trí | Lệnh dựng lại |
|---|---|---|
| `SO_CHUOI_MOI_PHUT = 3` | tran.ts:313 | `grep -n "SO_CHUOI_MOI_PHUT =" src/engine/tran.ts` |
| `nguoiTaiVung` khai | tran.ts:664 | `grep -n "^function nguoiTaiVung" src/engine/tran.ts` |
| `giamTheLuc` khai / gọi | tran.ts:951 / **1372–1373** | `grep -n "giamTheLuc(" src/engine/tran.ts` |
| `thuRutThe` khai / gọi | tran.ts:977 / **1584** | `grep -n "thuRutThe(" src/engine/tran.ts` |
| `apHangDoi` khai / gọi | tran.ts:1230 / **1365** | `grep -n "apHangDoi(" src/engine/tran.ts` |
| `PHIEN_BAN_ENGINE = 6` | tran.ts:1316 | `grep -n "PHIEN_BAN_ENGINE =" src/engine/tran.ts` |
| `buocTiep` | tran.ts:1361 | `grep -n "export function buocTiep" src/engine/tran.ts` |
| Thân vòng chuỗi (khoảng bóc) | tran.ts:**1414–1543** | `sed -n '1414,1543p' src/engine/tran.ts` |
| `gan: GanHanhDong` (hết khoảng bóc) | tran.ts:1535 | `grep -n "const gan: GanHanhDong" src/engine/tran.ts` |
| `chayHetTran` / `chanCung` | tran.ts:1732 / 1734 | `grep -n "const chanCung" src/engine/tran.ts` |
| `TrangThaiTran` 16 trường `readonly` | tran.ts:234–267 | `sed -n '234,268p' src/engine/tran.ts \| grep -c readonly` |
| `CAM_IMPORT` | boundaries.test.ts:36 | `grep -n "CAM_IMPORT" src/engine/boundaries.test.ts` |
| `raNgoaiEngine` | boundaries.test.ts:64–75 | `grep -n "function raNgoaiEngine" src/engine/boundaries.test.ts` |
| `RONG = 100` / `CAO = 64` / `BAN_KINH = 2.6` | San2D.tsx:60 / 61 / 147 | `grep -n "const RONG =\|const CAO =\|const BAN_KINH =" src/ui/components/San2D.tsx` |
| `LE_TOI_THIEU = 5` | San2D.tsx:164 | `grep -n "LE_TOI_THIEU =" src/ui/components/San2D.tsx` |
| `toaDo` | San2D.tsx:273–287 | `grep -n "function toaDo" src/ui/components/San2D.tsx` |
| `interface Props extends DuLieuVe` | San2D.tsx:509 | `grep -n "interface Props" src/ui/components/San2D.tsx` |
| Cổng vòng rAF | San2D.tsx:1449 | `grep -n "dangChay || giamChuyenDong" src/ui/components/San2D.tsx` |
| Bất biến "hai điểm, theo bán kính ≥ 1,46" | san2D.test.ts:874 | `grep -n "theo bán kính" src/ui/san2D.test.ts` |
| Bất biến "sàn hai điểm ≥ 4 **đơn vị**" | san2D.test.ts:1003 | `grep -n "theo đơn vị khung sân" src/ui/san2D.test.ts` |
| `dienMacDinh` cửa thoát sớm | matchRepo.ts:36 | `grep -n "thoiLuong !== undefined) return tran" src/services/matchRepo.ts` |
| `laLoiNghiemTrong` (đã export) | the.ts:53 | `grep -n "export function laLoiNghiemTrong" src/engine/the.ts` |

---

## 3. Kiến trúc giải pháp

```
                            ┌──────────────────────── src/engine (gốc, độ sâu 0) ───┐
   mã trận ──► hatGiongTuMaTran ──► nhayRut(h, i·2^30)                              │
                                       │                                            │
                            i=0 ───────┼──► rng v6 ──► buocTiep ──► TrangThaiTran   │
                            i=1 ───────┤          (KHÔNG AI CHẠM)                   │
                            i=2 ───────┤                                            │
                                       │    hinhHocSan.ts (mét: 105×68, 16,5, 7,32) │
                                       │    the.ts / sucManh.ts / chuoiBong.ts      │
                                       │    quyetKetCucChuoi  ◄── BÓC từ buocTiep   │
                                       │    thuRutThe (chỉ thêm `export`)           │
                                       └────────────┬───────────────────────────────┘
                                                    │ interface NguonQuyetDinh
   ┌──── src/engine/lienTuc (ĐÚNG MỘT cấp sâu) ─────▼──────────────────────────────┐
   │  moc.ts        BUOC_MOI_PHUT=120  MOC_MOI_PHUT=60  SO_THUC_THE=26             │
   │  hatGiong.ts   hatGiongDong(ma, dong)  hatGiongMoc(ma, chiSoMoc)  RUT_MOI_MOC │
   │  dieuKien.ts   dieuKienTuMaTran(ma: string)   ← 0 lần rút, bảo đảm bằng chữ ký│
   │  quyetDinh.ts  nguonV6 ── hiện thực DUY NHẤT của NguonQuyetDinh                │
   │  tinhHuong.ts  laTinhHuongQuanTrong(kq)   mocChuoi.ts  mocBongChet(chiSoChuoi) │
   │  coHoc.ts      buocCoHoc  tocDoToiDa  kepVanToc  phanLoaiHuong  viTriTrongTai  │
   │  vatLyBong.ts  tocDoDuongBong  zKhiToi  maSatLan  gio                          │
   │  dienPha.ts    lenBong → chuoi → ketCuc → bongChet  (lấp 20 giây, D126)        │
   │  loMoc.ts      Float32Array stride 8  +  Int32Array [chiSoMoc, nguoiGiu]       │
   │  tranLienTuc.ts  taoTranLienTuc  buocPhutLienTuc  chayHetTranLienTuc           │
   │  tepXuat.ts    dựng cấu trúc JSON      doCoHoc.ts đo 10 AC trên chính tệp      │
   └──────────────┬──────────────────────────────────────────────┬──────────────────┘
                  │ TrangThaiLienTuc (bọc TrangThaiTran)         │ object đã parse
                  ▼                                             ▼
   src/hooks/useMatch.ts ── một lần nổ setTimeout = MỘT PHÚT = một lần ghi store
            │  lô 60/120 mốc đi qua REF NGOÀI REACT (không qua datTran)
            ▼
   src/ui/mocVe.ts     mocDangVe(msTroi, msMoiPhut, soMoc) → { chiSo, phan }
   src/ui/quyDoiMet.ts toaDoTuMet(m, anh, banKinh)   TI_LE_MET = 0,864706
   src/ui/viTriVe.ts   hợp vị trí vẽ (hàm thuần, cờ `lienTuc`)
            ▼
   San2D.tsx  Props += anhChup?: AnhChupMet | null     MỘT vòng rAF (cổng nới)
```

### Bảng quyết định

| # | Quyết định | Phương án đã chọn | Phương án đã loại | Lý do loại |
|---|---|---|---|---|
| **D117** | Engine liên tục sống ở đâu, và dùng lại mô hình xác suất của v6 thế nào | **Bóc một hàm, vòng ngoài là phút.** `src/engine/lienTuc/` (đúng **một** cấp sâu). Bóc thân vòng chuỗi `tran.ts:1414–1543` thành `export function quyetKetCucChuoi(benNha, benKhach, sanTrungLap, quanSo, rng): KetCucPhaV6` nằm **ngay trong `tran.ts`**; thêm `export` cho `thuRutThe`, `giamTheLuc`, `apHangDoi`. Mối hàn `interface NguonQuyetDinh`, spec 007 cài **đúng một** hiện thực `nguonV6`. | (a) Engine liên tục **tự viết lại** lớp gán người và hàm phễu. (b) Bóc rộng tới hết `congThongKeCong`/`congThongKeThu` (~190 dòng). (c) Đặt hàm bóc ở file mới `src/engine/chuoiDayDu.ts`. | (a) Hai cách trả lời "ai làm việc này" → **hai bảng điểm cầu thủ không so được với nhau**, mà AC-45.3 chỉ ràng hiệu số bàn và tỉ lệ thắng nên chỗ lệch ấy **đi qua cổng rồi lộ ra bằng mắt** (R67). Người dùng này đã bắt bảy lỗi bằng mắt ở spec 005–006 mà 1.299 phép kiểm không thấy. (b) Chạm nhiều hơn vào khối `MOC_V6` canh, và nếu lệch một lần rút thì 20 trận đã lưu mất nút đấu lại **lần thứ hai trong hai spec liên tiếp**. Không cần: `laLoiNghiemTrong` đã export ở `the.ts:53`, và thêm `export` cho `thuRutThe` (tran.ts:977) đủ cho loại thứ tư của AC-37.8 mà **không di chuyển một dòng nào**. (c) Hàm đọc 9 ký hiệu riêng tư của `tran.ts`; dời ra là phải export cả chín. |
| **D118** | Dòng rút riêng, và cách chứng minh nó không đụng dãy của v6 | **Ba dòng cách đều `LECH_DONG = 2 ** 30`**, dẫn xuất bằng một phép nhảy số học: i=0 v6 (không ai chạm), i=1 **kết cục**, i=2 **cơ học**. Thêm **đúng hai** ký hiệu vào `rng.ts`: `BUOC_HAT_GIONG = 0x6d2b79f5` và `nhayRut(hatGiong, soLan)`. Phần riêng ở `lienTuc/hatGiong.ts`: `hatGiongDong(ma, dong)`, `hatGiongMoc(ma, chiSoMoc)`, `RUT_MOI_MOC = 64` — **dải rút cố định, chỉ cho dòng cơ học**. | (a) Hạt giống bằng **hậu tố chuỗi** `hatGiongTuMaTran(ma + '-LIEN-TUC')`. (b) **Bốn** dòng (thêm một dòng thời tiết). (c) Dải rút cố định cho **cả** dòng kết cục. | (a) **Có phản ví dụ đo được:** với mã `5M3AAY65ZN` độ lệch chỉ **569 lần rút**, và mười số đầu của nó khớp **đúng** số thứ 569–578 của v6. Quét 300.000 mã: 134 mã lệch dưới một triệu, 2 mã dưới mười nghìn — trong khi 10 mã fixture có đáy 43,6 triệu, nên **một test chỉ chạy trên fixture sẽ xanh mà sai**. (b) Thời tiết không cần một dòng rút nào (D130), nên dòng thứ tư là thừa. (c) **Không dựng nổi:** `nguoiTaiVung` (tran.ts:664) `return null` ở 686 **trước** `rng.next()` ở 690, nên năm bước gán người tiêu **0 lần rút** khi danh sách ứng viên rỗng — xảy ra thật khi thẻ đỏ làm một bên còn ít người. Số rút mỗi chuỗi **không phải hằng**. |
| **D119** | Lưới mốc, bước tích phân, hình dạng bộ đệm, tua ngược | **Xem mục 0.** Tích phân 0,5 giây luôn; phát 1 giây (dày 0,5 giây ở tình huống quan trọng); **một lô mỗi phút** stride 8 + header 2 ô; **không có tua ngược**. | (a) Bộ đệm **trọn trận** `Float32Array` (3,09–3,43 MB). (b) **Bộ đệm vòng** 1024 bước + mốc neo mỗi phút (922 KiB). (c) Tích phân 1 giây, làm dày bằng cách nâng lưới lên 0,5 giây tại chỗ. | (a) 3,4 MB thường trú để xem một trận, trong khi lô theo phút cần **97,5 KiB** — và nó không mua thêm một AC nào vì spec 007 không có tua ngược. (b) Thêm một phép đánh chỉ số có quấn vòng cộng một file test riêng, và mốc neo **mua đúng không gì cả hôm nay** (tiền đặt cọc cho spec 008–010). (c) **Phá AC-37.5:** đổi lưới tích phân giữa trận thì hạt giống của mọi mốc sau đó dịch; làm dày một tình huống sẽ đổi chuyển động của phần còn lại của trận. |
| **D120** | Thừa mốc: mốc engine so với khung vẽ, ở cả **năm** mức tốc độ | **Một hàm thuần** `mocDangVe(msTroi, msMoiPhut, soMoc) → { chiSo, phan }` ở `src/ui/mocVe.ts`. `chiSo` là cơ chế **bỏ mốc**, `phan` là cơ chế **nội suy** — hai cơ chế nằm trong **một phép chia**, không có câu `if (tỉ lệ > 1)` nào. Engine **không bao giờ** biết mức tốc độ. **Nới cổng của đúng MỘT vòng rAF** (San2D.tsx:1449); mốc thời gian đặt lại **ngay trong vòng rAF** theo số lô. | (a) **Bộ cộng dồn** `tienDongHo(dh, msTroi, msMoiPhut)` giữ `duNo` trong một ref. (b) Thêm một **vòng rAF thứ ba**, giữ 1449 nguyên byte. (c) Hai nhánh code riêng cho "thừa mốc" và "thiếu mốc". | (a) Nó **trôi** và không có biên nào kéo về; hàm dẫn xuất tự đồng bộ lại ở **mỗi biên phút**. (b) Hai vòng rAF trong một component với cổng chồng nhau là đúng lớp lỗi **không có test nào canh** (R54), và cái bẫy cụ thể đã tìm được: `batDau.current` nằm trong effect có `khoaMoc` làm dep, mà `khoaMoc` là chuỗi dựng từ toạ độ **mọi** điểm — ở chế độ liên tục nó đổi **mỗi khung**, effect nổ mỗi khung, **đồng hồ đứng vĩnh viễn ở 0 mà màn hình vẫn có 22 điểm**. (c) Ranh giới ở mức `cham` (1,00 mốc/khung) là **hiện tượng của con số**, không phải một nhánh code; viết thành nhánh là tạo hai đường chạy cho một phép chia. |
| **D121** | Quy đổi mét → đơn vị viewBox, và hai hình dạng trong **một** `San2D` | **Một hệ số đẳng hướng** `TI_LE_MET = min((RONG−2·BAN_KINH)/105 ; (CAO−2·BAN_KINH)/68) = min(0,902857 ; 0,864706) = **0,864706** đơn vị/mét`. Sân 105×68 m → ảnh 90,794 × 58,800 đơn vị; hai tâm trùng đúng tâm ảnh (52,5 m → x = 50,000; 34 m → y = 32,000) — **hai đẳng thức này là phép kiểm có răng**. Hàm ở file riêng `src/ui/quyDoiMet.ts`, **nhận khung ảnh làm tham số**. `San2D` đón hai hình dạng bằng `readonly anhChup?: AnhChupMet | null`. | (a) **Hai hệ số** 100/105 = 0,952381 và 64/68 = 0,941176 (méo 1,190%). (b) Đổi `CAO` thành 64,7619 hoặc nới viewBox. (c) Đặt `toaDoTuMet` ngay trong `San2D.tsx` cạnh `toaDo`. (d) Hard-code bốn số mép trong `quyDoiMet.ts`. (e) `Props` thành **union có thẻ phân biệt**. | (a) **AC-38.8 có ngưỡng GÓC** và nó là ngoại lệ duy nhất của AC-45.6 (đo trên toạ độ **đã vẽ**): dưới hai hệ số, một hướng 45° trong mét vẽ ra **44,661°**, nên ngưỡng đo được không còn là ngưỡng AC phát biểu; cộng việc mọi vòng tròn thật phải thành `<ellipse>`. (b) Phải sửa bảng `KHUNG_SAN` 7 dòng + sáu chỗ `leY` + đo lại ba hằng số dẫn xuất, và **vẫn còn méo 2,320%** vì inset cứng 2 đơn vị (San2D.tsx:1770-1775) vẫn ở đó. (c) `San2D.tsx` đã 1.968 dòng, và **không ký hiệu nào trong đó export được**, nên một `.test.ts` không gọi tới được — đúng lớp lỗi mà `environment: 'node'` không với tới. (d) Hai bản sao sẽ lệch; truyền tham số là quy ước D68 mà `DuLieuVe` đã dùng. (e) **Chín trong mười** prop cần ở cả hai chế độ (nơi gọi duy nhất `TrangTran.tsx:415-433`), nên hai nhánh union phải liệt lại cùng chín trường; và `suKien` phải **ở lại phần dùng chung** vì khối hiệu ứng bàn thắng đọc `suKien.loai === 'ban-thang'` ở San2D.tsx:1609-1614 — nhánh liên tục không mang `suKien` thì **AC-32.4 tắt lặng lẽ**. Cái giá của `anhChup?`: nó **không** phát biểu được "chế độ liên tục bắt buộc có mốc" lúc biên dịch → nợ có tên, bù bằng một cổng lúc chạy. |
| **D122** | Trường chế độ, bản ghi, tệp sao lưu (P7), đường đấu lại | `cheDoMoPhong?: CheDoMoPhong`, `type CheDoMoPhong = 'co-dien' \| 'lien-tuc'`, khai ở `tran.ts`. **Ba con số đi ba đường:** `DB_VERSION` **giữ 3**; `SCHEMA_VERSION` **giữ 5**; `PHIEN_BAN_ENGINE` **giữ 6** và engine liên tục mang số **riêng** `PHIEN_BAN_ENGINE_LIEN_TUC = 101`. Trường **không** vào `TrangThaiTran` (giữ đúng 16 trường); `dungBanGhi` (useMatch.ts) — chỗ sản phẩm **duy nhất** dựng `TranDaLuu` — điền cả `cheDoMoPhong` và `phienBanEngine`. Mở cửa thoát sớm của `dienMacDinh` (matchRepo.ts:36) và thêm `cheDoCua(tran)`. `App.tsx` ngừng tự dựng cấu hình 5 trường, gọi `phatLai.cauHinhTuBanGhi`. | (a) Tên `cheDo`. (b) Bump `PHIEN_BAN_ENGINE` lên 7. (c) `SCHEMA_VERSION` lên 6 + `nangV5LenV6` + `superRefine` chéo. (d) Thêm trường thứ 17 vào `TrangThaiTran`. | (a) **Tên đã bị chiếm hai lần:** `CheDo = 'sang' \| 'toi'` (tuyChonRepo.ts) và `CheDoNhap = 'thay-the' \| 'gop'` (backupService.ts); chuỗi `cheDo` xuất hiện 33 lần trong `src/` và `ChonCheDo.tsx` đã tồn tại. (b) Bump là **tước nút đấu lại** của mọi trận đã lưu (`lyDoKhongDauLai` so `!==` tuyệt đối) — 20 trận vừa mất nút ấy một lần khi engine lên 6; mất lần thứ hai trong hai spec liên tiếp là phá P3. Dải 101+ rời hẳn dải 1…6 nên **một** trường `phienBanEngine: number` vẫn đủ. (c) Tiền lệ **D61** (`quanSo?` giữ `DB_VERSION` ở 3) nói ngược; lý do duy nhất đáng bump là `superRefine` chéo "lien-tuc ⇒ quanSo 11", mà bất biến ấy **đã** được `kiemTraBatDauDuoc` canh lúc bắt đầu trận, nên schema check là bản sao thứ hai. Cộng: tệp do bản này xuất bị **mọi bản cũ hơn từ chối** (`MigrationError('phien-ban-moi-hon-ung-dung')`). (d) Giết câu "bọc, không chạm 16 trường" của D117; và chế độ là tính chất của **cách trận được chạy**, chỉ cần biết ở lúc lưu và ở tầng ui. |
| **D123** | Cơ học US-38: **chặn bằng cấu trúc** hay đo bằng phép kiểm | **Chặn bằng cấu trúc, ở tầng ý định:** một hàm thuần `buocCoHoc` trong `lienTuc/coHoc.ts` kẹp gia tốc / tốc độ / góc quay **trước** khi tích phân. Tích phân **Euler** để `(x'−x)/dt ≡ v'` đúng tuyệt đối. **Cổng quay ba băng:** dưới 3,0 m/s Δθ **tự do** (kể cả 180°); 3,0–6,0 m/s Δθ ≤ 85° kèm hệ số 0,57 sau quay > 45°; trên 6,0 m/s ≤ `TOC_QUAY_NHANH = 30°/giây`. Lề dưới trần AC: gia tốc 5,2 (AC cho 6), giảm tốc 7,2 (AC cho 8). `src/ui/san2D.test.ts` sửa **0 ký tự**; phép kiểm mới ở file mới. | (a) Để engine tự do rồi **đo** bằng phép kiểm, sửa khi đỏ. (b) Phát biểu lại AC-38.3 **trên cửa sổ 2 giây**. (c) Kẹp đúng giá trị AC (9 / 6 / 8), không lề. | (a) Tám AC cơ học thành tám cuộc đi tìm hằng số, và mỗi lần engine đổi thì đo lại — đúng cái giá spec 006 vừa trả ba lần. (b) Nó **đổi đại lượng mà AC đo** — luật chơi cấm thêm/sửa yêu cầu ở bước plan. Và cổng quay ba băng chữa đúng chỗ ấy **bằng cấu trúc**: với gia tốc pháp tuyến thuần (|aN| ≤ 6), góc quay một bước là `atan(aN·dt/|v|)` < 90° với **mọi** v > 0, nên AC-38.3 vế một sẽ **xanh vô nghĩa** — không mốc nào thử nó. Cho quay tự do dưới 3,0 m/s làm những cú quay > 90° **quan sát được**, và khẳng định được mốc trước luôn dưới 3,0 m/s. (c) Phép kiểm trên tệp đo tốc độ bằng Δquãng/Δt; ghim đúng trần thì nó đỏ vì **làm tròn** chứ không vì mô hình, nhất là khi mốc dày lên 0,5 giây. |
| **D124** | Tình huống quan trọng: phát hiện **trước** hay đánh dấu **sau** | **Phát hiện trước, ở phạm vi MỘT CHUỖI.** Ba bước trong cùng một lần lặp: `quyetKetCucChuoi` → `laTinhHuongQuanTrong(kq)` → `dienChuoiRaMoc`. **Đơn vị dày là cả cửa sổ chuỗi**: 60 mốc ÷ `SO_CHUOI_MOI_PHUT`(3) = **20 giây**, chuỗi nào có tình huống thì cả 20 giây chạy ở 0,5 giây. `laTinhHuongQuanTrong` có **đúng bốn** toán hạng `coBan \|\| coHoiRoRang \|\| biCuu \|\| theSauDo === 'do'`, **không** `xG`. | (a) Nhìn trước **cả trận** rồi đánh dấu. (b) Cửa sổ **đo lùi 6–10 giây** từ sự kiện. (c) Nguồn tình huống là `tt.ungVien`. | (a) Không cần: vấn đề nhân quả **không tồn tại ở cấp chuỗi** — `chayChuoiBong` trả `{ketCuc, vungKetThuc, cacHanhDong}` **trọn vẹn** tại tran.ts:1422, và cả bốn loại của AC-37.8 là biến cục bộ đã có giá trị **trước** khi chuỗi được diễn một mốc nào. (b) Cửa sổ đo lùi **vắt qua biên phút** và spec không nói xử ra sao; cửa sổ chuỗi là một khối con của một phút nên **không bao giờ vắt biên**, và 20 ≥ 10 nên mệnh đề "6–10 giây trước" của AC-37.4 thừa **10–14 giây biên**, còn "không khuyết mốc nào" đúng vì đơn vị dày là một khối **liền**. (c) `tt.ungVien` đã qua **hai tầng lọc** (`gomUngVienCuaPhut` + `chonSuKien` với trần `khoangSoDong`), nên dùng nó là bỏ sót đúng những tình huống bị cắt. |
| **D125** | Tệp xuất JSON | **Một tệp `.json` thô**, gốc đúng **năm** khoá: `dinh_dang`, `khoi_dau`, `nhat_ky`, `moc`, `tinh_huong`. **Hai khối khung hình:** `moc` (mỏng, 1 giây, phủ **100%** trận, dạng **tuple** + hàng tiêu đề `khoa_bong`/`khoa_nguoi`) và `tinh_huong` (dày, 0,5 giây, khung **nguyên văn mục 15**: đúng bốn khoá gốc `t`/`bong`/`cau_thu`/`su_kien`, `bong` 7 khoá, mỗi `cau_thu` 8 khoá, `trang_thai` trong enum **đóng** 14 giá trị). Mã ngắn `A1..A16`/`B1..B16`/`REF`/`AR1`/`AR2`, bảng tra uuid+vai_tro đặt **một lần** ở `khoi_dau.nguoi`. Bộ dựng và bộ đo đều **thuần**, trong `lienTuc/`; Blob ở `services`; tải về ở `hooks`. **Ngân sách đã chốt: 11 MB** (câu 2, 2026-11-23) → `AC-45.11`; T744 chỉ còn là phép **đo xác nhận**, T745 là phép kiểm ngưỡng. | (a) Khung hình dạng **object** cho cả trận (nguyên mục 15 trên 100% mốc). (b) **Nén** gzip/zip. (c) Chỉ một khối dày cho tình huống, không có khối mỏng. (d) Dùng `TranDaLuu.cacSuKien` làm `nhat_ky`. (e) Dùng uuid 36 ký tự làm khoá người. | (a) Đo được **23,0 MB thô**; dạng tuple + hàng khoá cho **cùng lượng thông tin** rẻ hơn ~5 MB, và tổng hai khối về ~11,3 MB. (b) `fflate` bị `CAM_IMPORT` chặn ở engine, `zipSync` là **đồng bộ**, và tệp nén thì `jq`/`node -e` không mở trực tiếp — mà "đọc được bằng công cụ thường" là chính giá trị AC-45.5 đòi. (c) **AC-45.6 đòi đo cơ học trên tệp**: chỉ có khối dày thì chín AC cơ học chỉ gác được ~10% thời lượng trận. (d) `cacSuKien` là bản **đã lọc** 60–100 dòng (`SO_DONG_TOI_THIEU`/`TOI_DA`), trong khi mục 6 của bản mô tả gốc muốn 40–50 quả ném biên — dùng bản đã lọc là làm **AC-45.6 xanh giả**. (e) uuid làm tệp phình **20%**. |
| **D126** | Lấp **20 giây** của một pha bóng | **Bốn pha con có tên** trong `lienTuc/dienPha.ts`: `lenBong` (luân chuyển ở phần sân nhà, 0–8 giây, **hấp thụ toàn bộ phần dư**) → `chuoi` (diễn 1,92 hành động: mỗi hành động = dắt 8–12 m ở 4–6 m/s + chuyền 15–22 m + khống chế 0,5 s) → `ketCuc` → `bongChet` (bảng tra theo `kq.ketCuc`, mục 3.1). Một bước **vùng** (dải sâu 26,25 m) **không** phải một đường chuyền: nó chẻ thành dắt + chuyền. | (a) Giãn 1,92 hành động ra đủ 20 giây. (b) Tăng `SO_CHUOI_MOI_PHUT` để có nhiều hành động hơn. | (a) Một đường chuyền 20 m kéo 10 giây là **1–2 m/s** — dưới sàn AC-38.6 (12 m/s) sáu lần, và nó là đúng cái "teleport rồi đứng chờ" mà spec 007 ra đời để xoá. (b) Đổi `SO_CHUOI_MOI_PHUT` là **đổi mô hình xác suất của v6**, tức đổi tỉ số mọi trận — vi phạm quyết định 8 của `/clarify` và làm AC-45.3 mất nghĩa. |
| **D127** | Thể lực và can thiệp ở độ phân giải giây | **Thể lực trừ ở BIÊN PHÚT**, đúng một lần mỗi phút, bằng chính `giamTheLuc`/`theLucSauMotPhut`; 60 mốc trong cùng phút đọc **cùng một** giá trị. **Can thiệp** giữ `CanThiep` nguyên ba trường `{phut, doi, noiDung}`, áp bằng chính `apHangDoi(tt, phut+1)` tại mốc mở đầu phút, **trước** khi tạo `Rng`. Giao diện dùng lại **nguyên văn** cặp song ngữ `CAN_THIEP_GIUA_TRAN.moTa` đã có, đặt thêm ở khối **Thay người**. | (a) Thêm hàm tiêu thể lực theo giây. (b) Thêm trường `giay`/`moc` vào `CanThiep` + hàng đợi thứ hai. (c) Một đồng hồ đếm ngược nói rõ phút có hiệu lực. | (a) Chạy `theLucSauMotPhut` mỗi giây là tiêu thể lực **gấp 60 lần**; đường cong thể lực đổi thì AC-45.3 **không còn hai chế độ nào để so**. (b) `apHangDoi` chạy ở tran.ts:1365, **trước** `taoRngTuHatGiong` ở 1367, nên nó tiêu **0 lần rút** — giữ đúng biên ấy làm AC-45.4 đúng theo **cấu trúc** chứ không theo lời hứa. (c) Đó là một **AC mới** của US-45 và plan không có quyền thêm. ⚠️ Bản trước trỏ món này sang "câu hỏi cho người dùng (mục 10)", nhưng nó **chưa bao giờ nằm trong tám câu** đã hỏi ngày 2026-11-23 — một con trỏ treo. Nên hôm nay nó đứng ở chỗ đúng của nó: **ngoài phạm vi spec 007**, và nếu người dùng muốn một đồng hồ đếm ngược thì đó là một AC mới phải hỏi riêng. |
| **D128** | Hiệp, hướng tấn công, chủ sở hữu hình học sân | **Hình học sân ở `src/engine/hinhHocSan.ts`** — gốc engine, độ sâu 0, chỉ hằng số mét và hàm thuần, **không import gì**. **Hướng tấn công là hàm dẫn xuất**, không phải trường: `huongTanCong(ben, hiep): 1 \| -1 = (ben === 'nha' ? 1 : -1) * (hiep === 1 ? 1 : -1)`. **Mốc hết hiệp định nghĩa bằng số mốc**, bắc trên hai hàm đã có test: `mocHetHiep1(tt) = tongPhutHiep1(tt) * MOC_MOI_PHUT`. | (a) `src/domain/hinhHocSan.ts`. (b) `src/engine/lienTuc/hinhHocSan.ts`. (c) Thêm trường `hiep`/`huongTanCong` vào trạng thái. | (a) `src/domain/boundaries.test.ts` quét token **viết tay theo từng file** (`generator.test.ts`, `lineup.test.ts`, `tenNgauNhien.test.ts`), nên một file mới **không vào lưới nào** cho tới khi ai đó nhớ thêm nó; `src/engine/boundaries.test.ts` thì `import.meta.glob('./**/*.ts')` — tự phủ. (b) Hằng số mét cũng cần cho nhánh vẽ của **chế độ phút** và cho bộ đo AC-45.6, không chỉ cho lớp liên tục; cộng cạm bẫy `raNgoaiEngine` tính độ sâu bằng tay, nên ở `lienTuc/` phải viết `'../../domain/types'` còn ở gốc là `'../domain/types'` (chính test tự kiểm điều đó ở :119). (c) Một trường là một chỗ **lệch được** với đồng hồ; hàm dẫn xuất thì không có bước "lật hướng" nào để sai. |
| **D129** | Chỉ số cầu thủ quy ra m/s, bóng bổng, dải chuyền | `tocDoToiDa(chiSoTocDo: number \| undefined): number` theo đúng khuôn `xacSuatAnThe`/`heSoTheoChiSo`: kẹp vào [1,20], `TOC_DO_TOI_DA_THAP = 6.4` → `TOC_DO_TOI_DA_CAO = 8.6`; chỉ số trống → `?? 10` → 7,442 m/s. `TRAN_TOC_DO_TUYET_DOI = 9` là **chỗ duy nhất** con số 9 của AC-38.1 tồn tại. **`tocDoToiDa` KHÔNG nhận thể lực.** Độ cao: `tat-canh` là hành động **duy nhất** có z vượt 1,5 m (đo 3.138/37.202 bước không-sút = 8,4%); `zKhiToi` chọn tham số để rơi trong [1,5; 2,8] và **chính hàm ấy** phát `trang_thai: 'danh_dau'`. Chuyền: quyết bằng **quãng mét thật** giữa hai người, `NGUONG_CHUYEN_DAI = 25` m, `thoiGianBay = d/v` là **định nghĩa**. | (a) `tranRieng = (6,5 + …) × heSoTheLuc(theLuc)` → 3,87–5,24 m/s khi kiệt. (b) Ghim trần đúng 9,0 m/s. (c) Quyết chuyền ngắn/dài bằng **cặp vùng**. (d) Nối thêm chỉ số `khong-chien` cho pha tranh chấp trên không. | (a) Nó nhập **thể lực × tốc độ**, là yêu cầu của spec 009 (spec.md:500-501) — ngoài phạm vi; và sàn tụt về 3,87 m/s nên **AC-38.8 (chỉ ràng pha trên 6 m/s) có thể không có mẫu nào ở cuối trận**. Sàn 6,4 > 6 nghĩa là **mọi** cầu thủ vào được vùng AC-38.8 canh. (b) Không còn một ly margin cho phép kiểm Δquãng/Δt; 8,6 để lại 4,4%. (c) Một dải vùng sâu 26,25 m không nói được quãng thật giữa hai người; mét thì nói. (d) `grep 'khong-chien'` trong `src/engine` ra **rỗng**, và AC-38.5 chỉ đòi một **cửa độ cao**, không đòi một pha tranh chấp. |
| **D130** | Thời tiết và gió | **Hàm thuần của mã trận, tiêu 0 lần rút:** `dieuKienTuMaTran(maTran: string): DieuKienTran` ở `lienTuc/dieuKien.ts`, hằng trộn `0x9e3779b9` (cố tình khác bước tiến mulberry32). **Không cất ở đâu bền** — mang trong `TrangThaiLienTuc.dieuKien`, `DB_VERSION` giữ 3. Bảng `MA_SAT_LAN_SET` (m/s²) ở **đúng một chỗ**: nong 1,85 \| kho 1,60 \| am 1,30 \| mua 0,95 \| mua-to 0,75. Gió: `heSoGio = 0,08 s⁻¹`, **chỉ** áp khi `z > 1,5 m` **và** quãng ngang ≥ 25 m. Nhãn hiện cạnh **mã trận** ở `TrangTran.tsx`, chuỗi nhồi vào khối `TRAN_DAU` đã có. | (a) Rút một lần trên dòng liên tục lúc mở trận. (b) Thêm trường thời tiết vào bản ghi. (c) Treo nhãn lên `San2D.tsx`. | (a) Nó cột thời tiết vào **số lần rút đứng trước nó**, nên thêm một lần rút ở đâu đó là đổi thời tiết của mọi trận. Chữ ký nhận `string` làm bất biến "không chen vào dòng RNG" được **chữ ký bảo vệ**, kiểm bằng số học thay vì bằng lấy mẫu. (b) Phá AC-45.4 ("bản ghi chỉ lưu mã trận và…") và buộc bump schema cho một thứ **dẫn xuất được**. (c) Thời tiết dẫn xuất từ mã trận thì đứng cạnh mã trận; `San2D` đã 1.968 dòng. |
| **D131** | Phép kiểm AC-45.3 | File mới `src/engine/sosanh.haiCheDo.test.ts` (họ `sosanh.*` ở gốc `src/engine/`, cạnh **sáu** file so sánh đã có), dùng lại `benMau` của `__fixtures__/doiMau.ts` và khuôn `doTrenMau()` của `sosanh.sanNha.test.ts` (đã trả đúng `{hieu, tiLeThang}`). **Cặp đấu plan tự chốt:** `benMau('A',{chiSo:15})` vs `benMau('B',{chiSo:10})`, **`sanTrungLap: true`**, 200 mã. **Hai hằng số ở đầu đúng file đó:** `LECH_HIEU_SO_TOI_DA = 0.5`, `LECH_TI_LE_THANG_TOI_DA = 0.10`. | (a) Để `sanTrungLap: false`. (b) Sinh lại dãy 200 mã trong file mới. (c) Ràng **tổng bàn** thay vì hiệu số. | (a) Lợi thế sân nhà đo được **+0,58 bàn** — **lớn hơn cả ngưỡng 0,5 bàn của chính AC**, nên một số hạng không liên quan tới hai engine chiếm trọn ngân sách. (b) `maRong` và `MAU_RONG` là hàm và hằng **cục bộ, không export**, nên "dùng lại" sẽ sinh **bản sao thứ ba** của cùng dãy và "cùng mẫu" chỉ là trùng hợp → T750 nâng chúng lên `__fixtures__` **trước**, điều kiện ra là hai file cũ còn in đúng 174-17-9 và 76-47-77. (c) AC-45.3 ràng **hiệu số giữa hai chế độ** và **tỉ lệ thắng của đội mạnh hơn**, không ràng tổng bàn. **Chốt 2026-11-23 (câu 7): file này nằm TRONG `npm test` mặc định**, vì AC-45.3 là lưới duy nhất canh "hai chế độ ra cùng một kết quả", tức canh P1. Cái giá đã nói: suite có thể từ ~27 giây lên ~68 giây ở nhánh xấu nhất — file này một mình thêm 46–54%. |
| **D132** | Giảm chuyển động, và AC-34.2 hoãn từ spec 006 | Đồng hồ **mốc** (mô phỏng) ở `useMatch.ts`, cổng chỉ gồm `dangChay` + chế độ — **không** có `giamChuyenDong`. Đồng hồ **vẽ xen giữa** (thẩm mỹ) là vòng rAF đã có, và `dongHoDao` chỉ cộng khi `!giamChuyenDong`. **AC-34.2 thuộc spec 007**, chỉ cho chế độ liên tục (trả ở T713 qua `tranhNguoi`/`tachChen`); ở chế độ phút nó ở lại làm **nợ có tên** vì Phase 50 của spec 006 bị bỏ có chủ ý. | (a) Giữ đúng hành vi hôm nay (chỉ vẽ mốc cuối mỗi phút). (b) Tắt cả đồng hồ mốc khi giảm chuyển động. | (a) Người bật giảm chuyển động **không nhận một phần nào** của spec 007, trong khi AC-31.1 chỉ nói "không nội suy, không dao động" — nó **không** nói "ít chuyển động hơn". (b) Ở chế độ liên tục mốc đi qua ref chứ không qua `datTran`, nên nếu vòng vẽ tắt thì **không còn ai gọi vẽ lại**: trận chạy mà sân đóng băng. Đó khác AC-28.5 (tạm dừng thì `dangChay = false` nên cả hai đồng hồ tắt, đóng băng đúng như cũ). **Chốt 2026-11-23 (câu 5): phương án của D132 được chọn, và nó thành `AC-45.9` mới trong `spec.md`** — kèm đúng câu nói thẳng rằng ở riêng chỗ đường chuyền dài, người bật giảm chuyển động thấy **tệ hơn hôm nay**. Phương án (c) "chia đường chuyền thành nhiều chặng ngắn" cũng bị loại khi hỏi: đó là nội suy dưới tên khác, nên nó buộc **viết lại AC-31.1 của spec 005** chứ không chỉ thêm AC mới. |
| **D133** | Trọng tài và hai trợ lý (AC-38.10) | **Có chủ sở hữu:** `viTriTrongTai(bong, hangThuCuoi, huong)` trong `lienTuc/coHoc.ts`, đi qua chính `kepVanToc` nên trọng tài **không teleport**. Con số dải cũ **15–25 m là bất khả thi về số học** với AC-38.1/38.2, nên nó đã vào danh sách hỏi. **Chốt 2026-11-23 (câu 6): dải nới thành 15–35 m**, và `doCoHoc` vì thế gộp AC-38.10 vào mảng `viPham` như mọi AC khác — **không còn** dải riêng nhãn "chưa chốt". Dải mới dựng được bằng một phép kiểm **tuyệt đối**. Hai mệnh đề còn lại của AC ("không nằm trên đường chuyền", "ngang hàng hậu vệ cuối cùng") **không đổi** và D133 là chủ sở hữu của chúng; nếu một trong hai cũng không dựng nổi thì xử đúng mục 9 — hỏi lại, không tự hạ ngưỡng. | (a) Tự nới dải thành 15–35 m. (b) Cho trọng tài vượt trần cơ học. (c) Bỏ ba trọng tài khỏi dữ liệu khung hình. | (a)(b) Mục 9 của spec ràng thẳng: "con số không dựng nổi thì **quay lại hỏi người dùng, KHÔNG tự hạ ngưỡng**". Phép tính: một quả phát bóng 70 m ở 25 m/s bay 2,8 giây, trọng tài phải dịch ≥ 20 m nhưng tối đa đi được 9·2,8 − 6,75 = **18,45 m** — thiếu 1,55 m ở trường hợp **thuận lợi nhất**. Không có cách nào xanh cả AC-38.10 và AC-38.1. (c) AC-38.10 đòi họ **có trong dữ liệu**; bỏ là bỏ một AC. |
| **D134** | Control chọn chế độ (AC-45.1) | **Nhóm radio** trong `ChonCapDau.tsx`, chèn vào khối `flex flex-wrap items-end gap-4` đang có; nhãn nhồi vào khối `CHON_CAP_DAU` (2 file song ngữ, **0** chỗ trong `index.ts`). Khi quân số ≠ 11, lựa chọn "liên tục" bị khoá **kèm một câu giải thích hiện bằng chữ**, theo tiền lệ `TrangLichSu.tsx:271-292` (`disabled` + `<p role="status">`). | (a) `<select>` có `<option disabled>`. (b) Ẩn lựa chọn khi quân số ≠ 11. | (a) Repo **chưa từng** khoá một `<option>` nào (40 lần `disabled` trong `src/ui`, **không một lần** nào trên `<option>`) — không có mẫu để chép, và trạng thái khoá của `<option>` khó đọc bằng trình đọc màn hình. (b) Phá đúng nguyên tắc đã ghi ở `TrangLichSu.tsx:266-271`: "khi không được thì phải nói **VÌ SAO**, chứ không im lặng ẩn nút đi". |

### 3.1 Lấp 20 giây: bảng bóng chết (D126 — **số của plan, không của spec**)

`SO_CHUOI_MOI_PHUT = 3` nên một chuỗi chiếm **20 giây**, nhưng `chayChuoiBong` chỉ sinh **1,92
hành động** trung bình (đo trên 5.000 chuỗi). Phần dư phải đi đâu đó.

| `kq.ketCuc` | Tần suất đo | Thời lượng bóng chết | Vì sao |
|---|---|---|---|
| `mat-bong` | 61,5% | **0 giây** | Bóng đổi chân, không ngắt nhịp |
| `bong-ra-ngoai` | — | **15 giây** | Đi lấy bóng + ném biên |
| `pham-loi` | — | **20 giây** | Trọng tài + xếp hàng rào |
| `dut-diem` | — | **30 giây** | Phát bóng lên hoặc ăn mừng |

Kỳ vọng **7,35 giây** một pha, bóng lăn **60,7 phút** trong 95,9 phút. Phần còn lại của 20 giây
do `lenBong` hấp thụ.

> ⚠️ **Bốn con số này chưa có AC nào, và spec 010 sở hữu con số cuối.** `KetCucChuoi` chỉ bốn
> giá trị và **không mang thời gian**; mức thật ("bóng chỉ lăn 55–60 phút") là nguyên văn phạm
> vi spec 010 (`ban-mo-ta-goc.md:17-20`). Nên phép kiểm chỉ khẳng định **tính nhất quán** (tổng
> thời lượng mỗi phút khớp 60 giây; tỉ lệ bóng lăn trong một dải), **không** khẳng định giá trị.
> Khi spec 008 mang luật IFAB vào, "bóng chết" có nghĩa thật (ném biên, phạt góc, phát bóng) và
> định nghĩa này bị **thay**, không phải mở rộng.
>
> ✅ **Chốt 2026-11-23 (câu 1).** Người dùng để bốn con số **ở lại trong plan, KHÔNG thành
> AC** — đúng vì lý do trên. Phép kiểm vì thế canh **tính nhất quán** (tổng thời lượng mỗi
> phút khớp 60 giây; tỉ lệ bóng lăn nằm trong một dải), **không** canh giá trị. Cái giá đã
> nói trước khi chốt: bốn số này không có AC nào canh, nên chọn sai thì không test nào bắt.

Định nghĩa kỹ thuật kèm theo: **`bóng chết` = mốc cuối của cửa sổ chuỗi**, tức mốc ngay trước
khi bóng được đặt lại về `giua-1` cho chuỗi sau. Một hàm, một chỗ:
`mocBongChet(chiSoChuoi) = (chiSoChuoi + 1) * MOC_MOI_CHUOI - 1` trong `lienTuc/mocChuoi.ts`.
Chỗ ngắt ấy là chỗ ngắt **duy nhất đã tồn tại thật** trong code (tran.ts:1422 khởi động **mọi**
chuỗi ở `layVung('giua', 1)` bất kể kết cục trước đó), **287,7 lần một trận**.

### 3.2 Ai đang giữ bóng ở từng mốc (AC-37.6)

`quyetKetCucChuoi` chỉ trả `gan` ở mức **chuỗi** (`nguoiKetThuc`, `nguoiKienTao`, `nguoiChuyen`…),
không trả một chuỗi 20 mốc. Luật gán cho từng mốc, theo bốn pha con của D126:

| Pha con | `nguoiGiu` |
|---|---|
| `lenBong` | `nguoiChuyen[0]` nếu có, nếu không thì thủ môn của bên đang giữ bóng. **Không bao giờ `-1`** — bóng ở chân một người suốt pha này |
| `chuoi`, mốc bóng ở chân | người chuyền của bước ấy (`nguoiChuyen[k]`, **giữ null**) |
| `chuoi`, mốc bóng đang bay | **`-1`** (AC-37.6 cho phép "không ai", và ở đây là đúng sự thật) |
| `ketCuc` | `nguoiKetThuc` |
| `bongChet` | **`-1`** |

Hai phép kiểm chống tầm thường: tỉ lệ mốc có `nguoiGiu === -1` nằm trong **30–45%** (dải suy từ
bảng 3.1), và **mọi phút** có ít nhất một mốc với `nguoiGiu >= 0`.

> **Cạm bẫy phải ghi vào task:** `if (id) nguoiChuyen.push(id)` **bỏ null**, nên `nguoiChuyen[k]`
> **lệch chỉ số** với `cacHanhDong[k]` ngay khi một `nguoiTaiVung` trả null. Hàm bóc ra phải trả
> mảng người **giữ null**, dài bằng số hành động không phải sút. Người nhận null → điểm rơi là
> tâm vùng đích.

### 3.3 Ba bất biến của lớp vẽ: cái nào áp cho chế độ nào

| Bất biến | Chế độ phút | Chế độ liên tục |
|---|---|---|
| Không hai điểm chồng khít (`chatNhat >= 1.46` **bán kính**, san2D.test.ts:874) | giữ nguyên | **phát biểu lại theo CHỮ của AC-15.2**: "chồng khít" = trùng tâm, ngưỡng tâm-tâm ≥ 0,30 m |
| Sàn hai điểm `>= 4` **đơn vị khung sân 11** (san2D.test.ts:1003) | giữ nguyên | **phải phát biểu lại** — ngưỡng theo **đơn vị** không co theo bán kính, và 2,0 m = 1,73 đơn vị ở `TI_LE_MET` đã chốt |
| Thủ môn trong một phần ba sân nhà (AC-30.7) | giữ nguyên | giữ, nhưng kẹp **ĐÍCH** thủ môn ở engine, **không** kẹp vị trí ở lớp vẽ (`daiThuMon` tắt) |
| Tám hàng xen kẽ (AC-30.8) | giữ nguyên | **mất nghĩa** — nó là phép kiểm hình học trên vùng dựng tay, không đọc một trận nào. Khai là nợ có tên |
| AC-28.3 (người tham gia ở đúng `suKien.vung`) | giữ nguyên | **mất nghĩa** — không có `suKien.vung`; thay bằng "mọi người tham gia nằm trong 15 m quanh bóng ở mốc sự kiện" |

**Năm lớp sinh vị trí phải tắt ở chế độ liên tục**, và `return` sớm trong effect **không** chạm
tới chúng vì chúng sống trong **thân render**:

| Lớp | Vị trí | Hậu quả nếu để nguyên |
|---|---|---|
| `lechDaoDong` | San2D.tsx:1734 | Lớp vẽ nói **sai vị trí engine 1,636 m**, mỗi người, mọi khung |
| Phép bám chân bóng trong `viTriBongVe` | :1580-1597 | Với `cacBuocBong: []` thì `batDauBam = 0`, nên **75% thời lượng mỗi mốc** quả bóng được vẽ ở **tâm người giữ bóng** chứ không ở toạ độ mét engine nói |
| `cuaSoGiuBong` + `viTriNguoiGiuBong` | :1694-1706 (`phaBong.ts:421`, `:497`) | Ghi đè vị trí **người** giữ bóng cho anh ta đi theo đường bóng |
| `aiGiuBongLucNay` | :1670-1673 | Vòng nét đứt và phép bám chân nói **hai người khác nhau** → phải đọc thẳng `anhChup.nguoiGiuBong` |
| `nghiengKhoiTheoBong` + `daiThuMon` | :379, :433 (áp **hai lần**: `hinhSan` và `viTriVe`) | Lớp vẽ tự bịa ~19,3 m dịch khối trên **đầu** toạ độ mét của engine |

Vì cả năm sống trong closure của component (**không export được**, và `environment: 'node'`
không render được React), chúng **không thể kiểm từ một `.test.ts`**. Nên T714 **tách phần hợp
vị trí vẽ ra `src/ui/viTriVe.ts`** thành hàm thuần export, hai chế độ cùng gọi, một cờ
`lienTuc: boolean`. Rủi ro thấp một cách kiểm chứng được: `viTriVe` **không** được export hôm
nay và nó **không có** trong danh sách import của `san2D.test.ts`, nên 55 phép kiểm của file ấy
không có đường nào gọi tới.

---

## 4. Mô hình dữ liệu

### 4.1 Diff schema

```diff
  // src/engine/tran.ts
+ export type CheDoMoPhong = 'co-dien' | 'lien-tuc'
  interface CauHinhTran {
    ...
+   readonly cheDoMoPhong?: CheDoMoPhong      // thiếu = 'co-dien', đúng khuôn quanSo?
  }
  interface TrangThaiTran { /* GIỮ ĐÚNG 16 TRƯỜNG readonly — không thêm gì */ }
+ export function quyetKetCucChuoi(...): KetCucPhaV6      // bóc từ thân vòng chuỗi
- function thuRutThe(...)
+ export function thuRutThe(...)                          // chỉ thêm `export`
- function giamTheLuc(...)      → + export
- function apHangDoi(...)       → + export

  // src/engine/lienTuc/tranLienTuc.ts (MỚI)
+ interface TrangThaiLienTuc {
+   readonly phut: TrangThaiTran           // BỌC, không sửa
+   readonly moc: number                   // chỉ số nửa giây tuyệt đối
+   readonly hatGiongCoHoc: number
+   readonly dieuKien: DieuKienTran
+ }

  // src/storage/db.ts — DB_VERSION GIỮ 3
  interface TomTatTran {
    ...
+   readonly cheDoMoPhong?: CheDoMoPhong
  }

  // src/services/backupSchema.ts — SCHEMA_VERSION GIỮ 5
+ TranDaLuuSchemaV5 thêm  cheDoMoPhong: z.enum(['co-dien','lien-tuc']).optional()
  // (schema trận là .passthrough() nên tệp cũ đi qua không cần migration)

  // src/services/matchRepo.ts
- if (tran.quanSo !== undefined && tran.thoiLuong !== undefined) return tran
+ if (tran.quanSo !== undefined && tran.thoiLuong !== undefined
+     && tran.cheDoMoPhong !== undefined) return tran
+ export function cheDoCua(tran: TomTatTran): CheDoMoPhong
+ export function phienBanEngineHienTaiCua(cheDo: CheDoMoPhong): number   // 6 hoặc 101
  // tomTatCua là DANH SÁCH TRẮNG liệt từng trường → thêm trường + test so Object.keys

  // src/ui/components/San2D.tsx
  interface Props extends DuLieuVe {
    ...
+   readonly anhChup?: AnhChupMet | null    // != null LÀ thẻ phân biệt
  }
```

### 4.2 Trận liên tục lưu dưới hình dạng gì

**Có dòng sự kiện kiểu cũ, y nguyên.** `TranDaLuu` đòi `cacSuKien: readonly SuKien[]` và
`baoCao: BaoCaoTran`, cả hai **không tuỳ chọn**, và cả trang lịch sử lẫn đường xem lại dùng
chung cho hai chế độ. Nên trận liên tục lưu đúng ba khối như trận cổ điển.

**Mốc 1 giây KHÔNG phải ứng viên sự kiện:** chỉ bốn loại tình huống của AC-37.8 vào `ungVien`,
rồi qua đúng hai tầng lọc đang có. `SuKien.vung` vẫn là ô lưới 12 vùng, nên engine liên tục
**lượng tử mét về `VungSan`** khi phát sự kiện — **mét không bao giờ vào bản ghi**.

Mọi thứ mét / giây / `z` / `huong_nguoi` chỉ sống trong **tệp xuất** AC-45.5, sinh theo yêu cầu,
không lưu. Đo được: một bản ghi 61.954 byte với 75 sự kiện; 20 trận 1.239.080 byte; trường chế
độ **+19 byte/trận** = +380 byte cho cả lịch sử.

---

## 5. Contracts (types / hàm thuần mới)

| Ký hiệu | Nơi | Chữ ký |
|---|---|---|
| `nhayRut` | `engine/rng.ts` | `(hatGiong: number, soLan: number) => number` |
| `BUOC_HAT_GIONG` | `engine/rng.ts` | `0x6d2b79f5` |
| `quyetKetCucChuoi` | `engine/tran.ts` | `(benNha, benKhach, sanTrungLap: boolean, quanSo: number\|undefined, rng: RngCoTrangThai) => KetCucPhaV6` |
| `DAI_SAN`, `RONG_SAN`, `SAU_VONG_CAM`, … | `engine/hinhHocSan.ts` | `105`, `68`, `16.5`, `40.3`, `11`, `7.32`, `9.15` (mét) |
| `trongVongCam`, `khoangToiKhungThanh` | `engine/hinhHocSan.ts` | hàm thuần trên mét |
| `BUOC_MOI_PHUT`, `MOC_MOI_PHUT`, `MOC_MOI_CHUOI`, `SO_THUC_THE` | `lienTuc/moc.ts` | `120`, `60`, `20`, `26` |
| `mocHetHiep1`, `hiepCuaMoc`, `soMoc` | `lienTuc/moc.ts` | `(tt) => number`, `(tt, moc) => 1\|2`, `(tt) => number` |
| `hatGiongDong`, `hatGiongMoc`, `LECH_DONG`, `RUT_MOI_MOC` | `lienTuc/hatGiong.ts` | `(ma, dong) => number`, `(ma, chiSoMoc) => number`, `2**30`, `64` |
| `dieuKienTuMaTran`, `MA_SAT_LAN_SET`, `HE_SO_GIO` | `lienTuc/dieuKien.ts` | `(maTran: string) => DieuKienTran` |
| `NguonQuyetDinh`, `nguonV6` | `lienTuc/quyetDinh.ts` | `{ quyetPha(boiCanh, rng): KetCucPha }` |
| `laTinhHuongQuanTrong` | `lienTuc/tinhHuong.ts` | `(kq: KetCucPhaV6) => boolean` — đúng bốn toán hạng |
| `mocBongChet`, `THOI_LUONG_BONG_CHET` | `lienTuc/mocChuoi.ts` | `(chiSoChuoi: number) => number`, bảng 3.1 |
| `buocCoHoc`, `kepVanToc`, `tocDoToiDa`, `phanLoaiHuong`, `huongNguoiMocSau`, `tachChen`, `viTriTrongTai` | `lienTuc/coHoc.ts` | xem D123/D129/D133 |
| `TRAN_TOC_DO_TUYET_DOI`, `TRAN_GIA_TOC`, `TRAN_GIAM_TOC`, `TOC_QUAY_NHANH`, `GOC_QUAY_TOI_DA_MOI_MOC` | `lienTuc/coHoc.ts` | `9`, `5.2`, `7.2`, `30`, — |
| `tocDoDuongBong`, `zKhiToi`, `NGUONG_CHUYEN_DAI` | `lienTuc/vatLyBong.ts` | `(quangMet, loai) => number`, `(d, v0, gocPhat) => number`, `25` |
| `dienChuoiRaMoc` | `lienTuc/dienPha.ts` | `(kq, boiCanh, rng, lo: LoMoc) => void` |
| `taoLoMoc`, `ghiMoc`, `docMoc` | `lienTuc/loMoc.ts` | `Float32Array` stride 8 + `Int32Array` header |
| `taoTranLienTuc`, `buocPhutLienTuc`, `chayHetTranLienTuc` | `lienTuc/tranLienTuc.ts` | `(cauHinh) => TrangThaiLienTuc`, `(tt) => { tt, lo }`, `(tt) => tt` |
| `PHIEN_BAN_ENGINE_LIEN_TUC` | `lienTuc/tranLienTuc.ts` | `101` |
| `dungTepXuat` | `lienTuc/tepXuat.ts` | `(tt, cacLo) => TepXuatTran` (thuần, không Blob) |
| `doCoHoc` | `lienTuc/doCoHoc.ts` | `(tep: TepXuatTran) => readonly ViPham[]` — **một mảng duy nhất**. Mảng thứ hai `chuaChot` đã bị bỏ 2026-11-23: nó chỉ tồn tại để chứa AC-38.10 lúc dải 15–25 m còn bất khả thi, và dải 15–35 m thì canh tuyệt đối được |
| `tiLeMet`, `toaDoTuMet`, `metTuDonVi`, `metSangDonVi` | `ui/quyDoiMet.ts` | nhận khung ảnh làm tham số |
| `mocDangVe` | `ui/mocVe.ts` | `(msTroi, msMoiPhut, soMoc) => { chiSo: number; phan: number }` |
| `hopViTriVe` | `ui/viTriVe.ts` | hàm thuần, cờ `lienTuc: boolean` |
| `cheDoCua`, `phienBanEngineHienTaiCua` | `services/matchRepo.ts` | `(tran) => CheDoMoPhong`, `(cheDo) => number` |
| `dungChuoiXuat`, `taoBlobXuat` | `services/xuatTranService.ts` | `(tep) => { chuoi, soByte }` **rồi mới** `(chuoi) => Blob` |

---

## 6. Ánh xạ AC → thiết kế (30/30)

| AC | Thiết kế đáp ứng | Kiểm bằng |
|---|---|---|
| **AC-37.1** toạ độ mét, thời gian giây | `hinhHocSan.ts` (`DAI_SAN 105`, `RONG_SAN 68`) + `loMoc` stride 8 mang mét; `quyDoiMet.ts` đảo dấu y cho gốc góc dưới trái | `doCoHoc` trên tệp xuất: mọi toạ độ trong [0,105]×[0,68] |
| **AC-37.2** mốc hình học sân | `hinhHocSan.ts` hằng số 16,5 / 40,3 / 11 / 7,32 + hai số **suy ra** 30,34–37,66 kiểm bằng **quan hệ** chứ bằng giá trị | test thuần trên `hinhHocSan.ts`; phần **vẽ** là T736, nhánh phút là nợ có tên |
| **AC-37.3** đổi phần sân ở hiệp 2 | `huongTanCong(ben, hiep)` **hàm dẫn xuất** (D128) + `mocHetHiep1(tt) = tongPhutHiep1(tt) * 60` | test thuần: dấu hướng của hai bên ở hai hiệp, 4 tổ hợp; và `doCoHoc` đo trung bình x của hai đội trước/sau mốc hết hiệp |
| **AC-37.4** dày 0,5 giây ở tình huống quan trọng, 6–10 giây trước, tới khi bóng chết, không khuyết mốc | **D124**: đơn vị dày là cả cửa sổ chuỗi 20 giây → 20 ≥ 10 nên biên thừa 10–14 giây, và cửa sổ **không bao giờ vắt biên phút**; không khuyết vì nó là khối liền. Tích phân 0,5 giây luôn (mục 0) nên làm dày **không dịch** hạt giống mốc nào | `doCoHoc`: trong `tinh_huong[]`, `Δt` giữa hai khung liền nhau luôn = 0,5; độ dài cửa sổ ≥ 10 giây; không lỗ |
| **AC-37.5** mỗi mốc tái lập được một mình | **D118** `hatGiongMoc(ma, chiSoMoc)` dải cố định `RUT_MOI_MOC = 64` cho dòng cơ học + **D119** bộ đệm là đầu ra **chỉ-ghi** + **D120** engine không bao giờ biết mức tốc độ | `taiLap`-style: chạy hai lần cùng mã → tệp xuất **giống từng byte**; và "không mốc nào tiêu quá dải của nó" |
| **AC-37.6** ai đang giữ bóng, hoặc không ai | Chỗ cất: header `Int32Array` ô thứ hai (`-1` = không ai). Chỗ đọc: `anhChup.nguoiGiuBong`, **tắt** lớp suy ra `phaBong.ts`. **Luật**: mục 3.2 | Hai phép kiểm chống tầm thường ở mục 3.2 |
| **AC-37.7** mốc 1 giây / 0,5 giây | `MOC_MOI_PHUT = 60` ở **đúng một chỗ**; số mốc dẫn `tongPhutTran(tt)` làm nguồn, **cấm hằng 5.400** | `soBuoc === tongPhutTran * BUOC_MOI_PHUT`; `doCoHoc` đo `Δt` của khối mỏng ≡ 1 |
| **AC-37.8** định nghĩa bằng **loại sự kiện** | `laTinhHuongQuanTrong(kq)` đúng bốn toán hạng `coBan \|\| coHoiRoRang \|\| biCuu \|\| theSauDo === 'do'`, **không** `xG`. Loại thứ tư có đường vì **D117** thêm `export` cho `thuRutThe` | test thuần: 4 toán hạng × bật/tắt = 16 tổ hợp; và `grep -c xG` trong `lienTuc/` = 0 |
| **AC-38.1** ≤ 9 m/s, trên 7 m/s không quá 4 giây | `tocDoToiDa` 6,4→8,6 + `TRAN_TOC_DO_TUYET_DOI = 9` (chỗ **duy nhất** số 9 tồn tại) + **quỹ nước rút** `giayNuocRut` cho mệnh đề hai | `doCoHoc` trên 100% mốc + test ngược (bơm một mốc 9,5 m/s → đúng một `ViPham`) |
| **AC-38.2** gia tốc ≤ 6, giảm tốc ≤ 8 | Kẹp **vector** `\|Δv\| ≤ TRAN_GIA_TOC·dt` / `TRAN_GIAM_TOC·dt`, lề 5,2/7,2; tích phân Euler nên `(x'−x)/dt ≡ v'` | `doCoHoc` + test tính chất trên 100.000 bộ đầu vào đối nghịch |
| **AC-38.3** đổi hướng > 90° thì tốc độ trước < 3 m/s | **Cổng quay ba băng** (D123): dưới 3,0 m/s Δθ **tự do** — đây là chỗ vế một của AC **có răng** thay vì xanh vô nghĩa | `doCoHoc`: với mọi cặp mốc có Δθ > 90°, `\|v\|` ở mốc trước < 3,0 |
| **AC-38.4** lùi ≤ 4 m/s, ngang ≤ 5 m/s | `phanLoaiHuong(huongNguoi, huongDiChuyen)` → `'tien'\|'ngang'\|'lui'`; trần 3,8 / 4,8 **suy ra từ hình học** | `doCoHoc` dùng chính `phanLoaiHuong` đọc từ tệp |
| **AC-38.5** z theo mét, khống chế chỉ khi 1,5–2,8 m | `tat-canh` là hành động **duy nhất** có z > 1,5 m; `zKhiToi` chọn tham số để rơi trong dải và **chính hàm ấy** phát `trang_thai: 'danh_dau'` → bất biến **dựng được**, không phải xác suất | `doCoHoc`: mọi khung có `trang_thai === 'danh_dau'` thì `bong.z ∈ [1,5; 2,8]`; `chuyen`/`re-bong` có z ≡ 0 |
| **AC-38.6** 12–20 / 20–30 m/s, thời gian bay khớp | `tocDoDuongBong` quyết bằng **quãng mét thật**, `NGUONG_CHUYEN_DAI = 25`; `thoiGianBay = d/v` là **định nghĩa** | `doCoHoc` chia lại hai trường tệp đã mang |
| **AC-38.7** sân khô 1–2 m/s², sân ướt ít hơn | `MA_SAT_LAN_SET` năm giá trị ở **đúng một chỗ** (kho 1,60 và nong 1,85 trong dải; mua 0,95 và mua-to 0,75 **dưới 1,00** nên nhỏ hơn mọi giá trị khô bất kể đọc dải thế nào) | test đơn điệu nghiêm ngặt + `doCoHoc` đo quãng bóng lăn. ✅ **Chiều của bảng đã chốt 2026-11-23 (câu 4): sân ướt thì bóng đi XA hơn**, đúng chiều năm giá trị của D130 đang viết, nên bảng không đổi một số nào |
| **AC-38.8** pha trên 6 m/s vẽ thành đường cong | Engine: `TOC_QUAY_NHANH = 30°/giây` (một **tốc độ góc**, nên bán kính cong R ≈ v/ω không phụ thuộc dt → R ≥ 11,5 m ở 6 m/s). Lớp vẽ: **T735** thêm một describe vào `src/ui/noiSuy.test.ts` đo góc đổi hướng giữa hai điểm nội suy liền nhau, ngưỡng **quy từ** `TOC_QUAY_NHANH` qua `TI_LE_MET` | **Ngoại lệ đã chốt của AC-45.6** → phép kiểm thuần ở lớp vẽ (T735). Hệ số đẳng hướng (D121) là điều kiện để ngưỡng góc không bị méo |
| **AC-38.9** thời tiết và gió tất định từ mã trận | `dieuKienTuMaTran(maTran: string)` — chữ ký nhận **chuỗi**, nên **không thể** rút một lần nào | Phép kiểm số học: hàm là thuần, cùng mã → cùng kết quả; và `taoTran` vẫn tiêu **đúng 3** lần rút |
| **AC-38.10** trọng tài + 2 trợ lý trong dữ liệu khung hình | **D133**: `SO_THUC_THE = 26` nên họ **có trong** mọi khung; `viTriTrongTai` đi qua `kepVanToc` nên không teleport | `doCoHoc` canh **tuyệt đối** dải **15–35 m** (người dùng nới 2026-11-23, câu 6) và gộp vào `viPham` như mọi AC khác. Dải cũ 15–25 m bất khả thi về số học — thiếu 1,55 m ở ca thuận lợi nhất. ⚠️ Hai mệnh đề "không nằm trên đường chuyền" và "ngang hàng hậu vệ cuối cùng" **chưa có cơ chế**, D133 là chủ sở hữu |
| **AC-38.11** hướng người 0–360°, lùi/ngang chậm hơn | `huongNguoiMocSau(huongCu, vx, vy)` quay về `atan2(vy,vx)` bị chặn bởi `GOC_QUAY_TOI_DA_MOI_MOC`; khi \|v\| dưới ngưỡng đứng yên thì **giữ giá trị mốc trước** | `doCoHoc`: `huong ∈ [0,360)` ở mọi khung; và **không** phải ai đứng im cũng nhìn về +x (nếu lấy `atan2(0,0)=0` thì AC thoả bằng một con số giả) |
| **AC-45.1** chọn được hai chế độ | **D134** nhóm radio trong `ChonCapDau.tsx` + **D122** `cheDoMoPhong` đi hết đường `CauHinhTran` → `TomTatTran` → `tomTatCua` → `dienMacDinh` → `cauHinhTuBanGhi` | test `tomTatCua` so `Object.keys`; test `cheDoCua` trên bản ghi thiếu trường. Phần giao diện: **T761 kiểm bằng mắt** |
| **AC-45.2** trận cũ mở lại, xem lại, đấu lại y nguyên | `PHIEN_BAN_ENGINE` **giữ 6**, `MOC_V6` 393 dòng không sửa một ký tự, `DB_VERSION` giữ 3; engine liên tục mang số **riêng 101** | `tuongThichEngine.test.ts` + `taiLap.test.ts` + `phatLai.test.ts` — **điều kiện ra của mọi task** chạm `src/engine/` |
| **AC-45.3** 200 mã, hai chế độ, hiệu số ≤ 0,5 bàn, tỉ lệ thắng lệch ≤ 10 điểm | **D131** `sosanh.haiCheDo.test.ts`, A15 vs B10, `sanTrungLap: true`, hai hằng số ở đúng một chỗ. Mốc nền v6 đo lại: **+2,255 bàn / 87,0%** → dải hợp lệ hiệu số ∈ [1,755; 2,755], tỉ lệ thắng ∈ [77,0%; 97,0%] | Chính file test ấy. T750 nâng `maRong` + mẫu 200 mã lên `__fixtures__` **trước** |
| **AC-45.4** bản ghi chỉ lưu mã trận + định danh, không lưu vị trí | **D122** bản ghi thêm **đúng một** trường tuỳ chọn (+19 byte/trận); **D127** `CanThiep` giữ nguyên ba trường, áp ở biên phút nên độ phân giải can thiệp **không** phải lên giây | test đếm `Object.keys` của `TranDaLuu`; `grep` trong `storage/` cho `x`/`y`/`moc` = 0 |
| **AC-45.5** xuất tệp đọc được bằng công cụ thường | **D125** năm khoá gốc, khối dày là mục 15 **không sửa một khoá**; `dungChuoiXuat` trả `{chuoi, soByte}` **trước** `taoBlobXuat` để nói kích thước và cho huỷ | Test thuần trên cấu trúc: 5 khoá gốc; `tinh_huong[].khung[]` đúng 4 khoá gốc, `bong` 7 khoá, `cau_thu` 8 khoá, `trang_thai` trong enum đóng 14 giá trị |
| **AC-45.6** mọi phép kiểm cơ học đo trên **chính tệp** | **D125** `doCoHoc` nhận một object **đã parse** nên chạy được từ cả vitest `environment: node` lẫn giao diện; `dt` lấy từ khoá `t` của hai mốc liền nhau chứ **không** viết cứng 1; đọc chỉ số cột qua `khoa_nguoi.indexOf` | Bộ test **ngược**: bơm một mốc sai cho **mỗi** ngưỡng, đòi đúng một `ViPham`; cộng một test **độc lập với thứ tự cột** |
| **AC-45.7** mọi tính ngẫu nhiên đến từ mã trận | **D118** + **D130** + cổng đã có: `boundaries.test.ts` quét `./**/*.ts` nên `lienTuc/` **tự** vào phạm vi | Chính `boundaries.test.ts`, không thêm một dòng cấu hình nào |
| **AC-45.8** quân số ≠ 11 thì chế độ liên tục bị khoá, **kèm lý do** | **D122** nhánh thứ năm của `LyDoKhongBatDau` kiểm trong `kiemTraBatDauDuoc`; **D134** hiện lý do bằng **chữ** | test thuần trên `kiemTraBatDauDuoc` cho 7 giá trị `CAC_QUAN_SO`; chuỗi vi/en cùng commit. Phần hiện ra màn hình: **T761** |
| **AC-45.9** giảm chuyển động: đồng hồ mốc chạy, nội suy + dao động tắt | **D132** cổng của đồng hồ **mốc** chỉ gồm `dangChay` + chế độ (**không** `giamChuyenDong`); `dongHoDao` chỉ cộng khi `!giamChuyenDong`; vòng rAF đã có được **nới**, không thêm effect thứ ba (R52) | Hàm thuần `viTriVe.test.ts`: với `giamChuyenDong = true`, toạ độ trả về **trùng khít** một mốc đã phát trên 100 bộ đầu vào — `environment: 'node'` không chạy được test component, nên luật phải nằm ở hàm thuần. **T734** nối dây, **T737** phép kiểm |
| **AC-45.10** "tua" chỉ nghĩa là tua **TỚI** | Không có cơ chế mới: *Chạy hết trận* + năm mức tốc độ đã có ở `useMatch.ts`; **D119** giữ "không tua ngược" nên bộ đệm vẫn là **một lô mỗi phút**, không phải cả trận | Phép kiểm **phủ định**: `lienTuc/` và `useMatch.ts` không có một đường nào đặt `chiSoMoc` **giảm**; cộng T738 kiểm bằng mắt rằng không có thanh thời gian nào trong giao diện |
| **AC-45.11** tệp xuất ≤ 11 MB cho trận 90 phút | **D125** `dungChuoiXuat` đã trả `{chuoi, soByte}` **trước** `taoBlobXuat`, nên kích thước thật có sẵn mà không phải dựng Blob | `lienTuc/tepXuat.test.ts`: `soByte <= 11 * 1024 * 1024` trên trận 90 phút **ca xấu** (nhiều tình huống quan trọng nhất trong 20 mã), cộng một ca **ngược** chứng minh ngưỡng đỏ được (T745) |

**AC của spec trước phải giữ** (mục 10 của spec): AC-15.2, AC-28.3, AC-28.5, AC-30.4, AC-30.5,
AC-30.7, AC-30.8, AC-31.1, AC-31.3, AC-31.4, AC-32.1, AC-34.2, AC-40.4 — xử ở mục 3.3, D132,
R56 và T754.

---

## 7. Chiến lược kiểm thử

**Nguyên tắc trùm:** mọi **luật** nằm trong hàm thuần export được; mọi chỗ nối dây `useEffect`
chỉ là phép truyền tham số. Lý do: `environment: 'node'`, không jsdom, **0 test component**,
**0 test cho `src/hooks`** — một lỗi nối dây sẽ **xanh**.

| Tầng | File | Canh gì |
|---|---|---|
| Ranh giới | `engine/boundaries.test.ts` (đã có, **0 dòng sửa**) | `lienTuc/` tự vào phạm vi; cấm `Math.random`/`Date.now`/`performance.now`/`setTimeout` |
| Dòng rút | `lienTuc/hatGiong.test.ts` | Đẳng thức `khoảng cách(i,j) = (j−i)·2^30 mod 2^32` trên 20.000 mã do `taoMaTran` sinh; "không mốc nào tiêu quá dải của nó" |
| Không chép mô hình | `lienTuc/khongChepModel.test.ts` | Cấm mọi file trong `lienTuc/` nhắc `chayChuoiBong`, `xacSuatTrungDich`, `xacSuatBiCuu`, `xacSuatCoHoiRoRang`, `nguoiTaiVung` — **trừ đúng một dòng import** ở `quyetDinh.ts` |
| Tương thích v6 | `tuongThichEngine.test.ts` + `taiLap.test.ts` + `phatLai.test.ts` (**0 dòng sửa**) | Điều kiện **ra** của mọi task chạm `src/engine/` |
| Lưới mốc | `lienTuc/moc.test.ts` | `soBuoc === tongPhutTran * BUOC_MOI_PHUT`; `MOC_MOI_PHUT * 2 === BUOC_MOI_PHUT`; `MOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT === MOC_MOI_PHUT` |
| Cơ học | `lienTuc/coHoc.test.ts` | Test **tính chất** trên 100.000 bộ đầu vào đối nghịch; hội tụ tới đích |
| Đo trên tệp | `lienTuc/doCoHoc.test.ts` | **Mười** AC cơ học (AC-38.1→38.7, 38.9, **38.10**, 38.11 — AC-38.8 là ngoại lệ đo ở lớp vẽ) + **bộ test ngược** cho **mỗi** ngưỡng, gồm một ca bơm trọng tài ra **36 m** + độc lập thứ tự cột |
| Tình huống quan trọng | `lienTuc/tinhHuong.test.ts` | **T730** — bảng này trước đây bỏ sót: 4 toán hạng × bật/tắt = 16 tổ hợp, và `grep -c xG` trong `lienTuc/` = 0 |
| Không tua ngược | `lienTuc/tuaToi.test.ts` | **T738** — cũng bị bỏ sót: quét mã nguồn `lienTuc/` và `useMatch.ts`, không một đường nào đặt `chiSoMoc` giảm |
| Hai chế độ | `sosanh.haiCheDo.test.ts` | AC-45.3, hai đại lượng, hai hằng số, 200 mã |
| Ngân sách | `lienTuc/hieuNangLienTuc.test.ts` | **Một** ngưỡng, chốt **sau** T700; cộng một **số đếm thuần** (số lần gọi mô hình xác suất một trận) vì nó **không phụ thuộc tải máy** |
| Lớp vẽ | `ui/mocVe.test.ts`, `ui/quyDoiMet.test.ts`, `ui/viTriVe.test.ts`, `ui/noiSuy.test.ts` (+1 describe) | Hàm thuần; hai đẳng thức tâm (52,5 m → x = 50; 34 m → y = 32); AC-38.8 ở lớp vẽ |
| P7 | `backupService.test.ts` (+1 ca) | Nhập tệp v5 ở chế độ **`'thay-the'`**, trận có đủ `quanSo`+`thoiLuong` mà **không** có `cheDoMoPhong` → đọc ra `'co-dien'` |
| Giảm chuyển động | `ui/viTriVe.test.ts` (+1 describe) | **AC-45.9**: `giamChuyenDong = true` → toạ độ trả về trùng khít một mốc đã phát, không bao giờ là giá trị giữa hai mốc. Luật ở hàm thuần vì `environment: 'node'` **không** chạy được test component |
| Ngân sách tệp xuất | `lienTuc/tepXuat.test.ts` (+2 ca) | **AC-45.11**: `soByte <= 11 MiB` trên trận 90 phút ca xấu, **cộng một ca ngược** chứng minh ngưỡng đỏ được (một ngân sách không bao giờ đỏ được thì vô dụng) |

**Ba lệnh cấm viết vào plan:**

1. **CẤM** mọi phép kiểm kiểu "mỗi pha tiêu đúng N lần rút" — `nguoiTaiVung` `return null`
   **trước** `rng.next()`, nên năm bước gán người tiêu **0 lần rút** khi ứng viên rỗng.
2. **CẤM** dẫn chú thích tự khai thứ tự rút ở `tran.ts` làm hợp đồng (nó thiếu **bốn** nhóm:
   đồng xu chọn bên, mọi lần rút trong `chayChuoiBong`, mẫu câu, hai lần rút thẻ). Chứng minh
   duy nhất được nhận là `MOC_V6` 393 dòng + `taiLap.test.ts`.
3. **CẤM** trích một con số thời gian không kèm lệnh dựng lại được và điều kiện đo.

---

## 8. Rủi ro & phương án lùi

| # | Rủi ro | Khả năng | Hậu quả | Giảm thiểu |
|---|---|---|---|---|
| **R51** | Phép bóc chạm đúng file mang dòng rút của v6 | Trung bình | Lệch một lần rút → **20 trận đã lưu mất nút đấu lại lần thứ hai trong hai spec liên tiếp**, phá P3 | T701 chỉ **di chuyển** dòng, không viết lại dòng nào; `thuRutThe`/`giamTheLuc`/`apHangDoi` chỉ **thêm `export`**. Điều kiện ra là một **lệnh** (`MOC_V6` nguyên ký tự + `toBe(6)`), không một lời hứa |
| **R52** | Lớp nối dây (`useEffect` ở `useMatch.ts` và `San2D.tsx`) **không có một phép kiểm nào** canh | Chắc chắn | Một lỗi nối dây sẽ **xanh**. Bẫy cụ thể: `batDau.current` trong effect có `khoaMoc` làm dep → ở chế độ liên tục `khoaMoc` đổi **mỗi khung**, đồng hồ đứng vĩnh viễn ở 0 mà màn hình **vẫn có 22 điểm** | Mọi **luật** trong hàm thuần export được; đặt lại mốc thời gian **ngay trong vòng rAF** theo số lô, **không** qua effect. T761 là danh sách kiểm bằng mắt **có tên** |
| **R53** | Chuyển động của chế độ liên tục là **sân khấu dựng trên một kết quả đã quyết** | Chắc chắn — hệ quả trực tiếp của quyết định 8 của `/clarify` | Sẽ có mốc mà người rê bóng đi vòng gọn qua một đối thủ rồi **vẫn mất bóng**, hoặc đi xuyên giữa hai người mà không ai với được. Người dùng này bắt bảy lỗi bằng mắt ở spec 005–006 | **Nói ra trong plan, không che.** Mối hàn `NguonQuyetDinh` là chỗ spec 008/009 đảo chiều nhân quả bằng cách thay **một hiện thực**, không bằng cách đập bỏ thân `lienTuc/` — và khi đảo thì AC-45.3 hết hiệu lực **theo đúng thiết kế** |
| **R54** | Từ spec 007 trở đi tồn tại **hai bảng thống kê** cho cùng một đội, mãi mãi | Chắc chắn — đã nói trước ở quyết định 1 của `/clarify` | Bảng điểm cầu thủ, báo cáo trận và mọi so sánh chiến thuật có hai nguồn | Phép bóc giữ hai chế độ dùng **chung** `quyetKetCucChuoi`, nên cùng `nguoiTaiVung`, cùng `loaiCuaChuoi`, cùng `diemCuaChuoi` — hai bảng **còn so được**. `khongChepModel.test.ts` canh điều đó bằng một lệnh cấm |
| **R55** | **AC-38.10 bất khả thi về số học** với AC-38.1/38.2 | Chắc chắn, và nó lộ ra đúng ở phép kiểm AC-45.6 | Hoặc `doCoHoc` báo vi phạm AC-38.10 ở **mọi** quả phát bóng dài, hoặc trọng tài vượt trần cơ học và `doCoHoc` báo vi phạm AC-38.1. **Không có cách nào xanh cả hai** | **Đã giải 2026-11-23:** người dùng nới dải thành **15–35 m** (câu 6), nên `doCoHoc` canh AC-38.10 **tuyệt đối** và gộp vào `viPham`. Rủi ro còn lại hẹp hơn hẳn: hai mệnh đề "không nằm trên đường chuyền" và "ngang hàng hậu vệ cuối cùng" vẫn chưa có cơ chế, và nếu chúng cũng bất khả thi thì hỏi lại chứ không tự hạ ngưỡng |
| **R56** | **AC-31.4 không có đường kiểm nào.** `hieuNang.test.ts` là phép kiểm hiệu năng **duy nhất** của repo; `environment: 'node'` nên không có rAF thật; `boundaries.test.ts` cấm `performance.now` | Chắc chắn | DoD của spec đòi test tự động cho mọi AC dạng khoảng số và P5 đòi test cho mọi AC so sánh. Viết như thể đã có test thì `/analyze` bắt, hoặc tệ hơn nó được tick bằng mắt | Hạ xuống **hai thứ đo được trong node** và nói rõ đó là một phần: (i) ngân sách **tính toán** thuần cho số mốc của một khung ở mức nhanh nhất; (ii) hàm thuần `mocDangVe` kiểm bằng test node. Phần "mỗi khung **vẽ**" khai thẳng là **nợ kiểm bằng mắt**, đúng cách spec 006 đã làm ba lần |
| **R57** | Ngân sách mùa giải có thể **vỡ**: 33,7 ms × hệ số nở 3,5 = **118 ms** so với 78,95 ms | Cao | Plan hứa hai điều trái nhau, hoặc một ngưỡng được nới lặng lẽ và thôi là một cái gác | Chốt **một** ngưỡng sau T700, và chốt một **luật** thay cho một giá trị. Cổng quan trọng hơn là **số đếm thuần**. Về mùa giải: plan **BÁO con số, không kết luận**; T753 là task đo-và-báo, **không** có task tối ưu để lọt ngưỡng |
| **R58** | Bán kính điểm vẽ và AC-15.2 chống nhau ở chế độ liên tục. Ngưỡng `>= 1.46` bán kính quy ra **3,99 m** ở bán kính 2,6, trong khi bóng đá thật có hậu vệ kèm trong 1–2 m | Chắc chắn — đây là ràng buộc chật nhất của sân 2D, và là lý do spec 007 **từ chối vẽ** trọng tài | Giữ 2,6: hai người tranh chấp vẽ thành hai đĩa chồng **71–89%**, số áo không đọc được. Hạ xuống 1,30: ba hằng số dẫn xuất đổi (`VONG_GIU_BONG_THEM`, `PHI_THEM_NGUOI_GHI_BAN` phình 1,93 lần, cỡ chữ số áo giảm một nửa) và `san2D.test.ts:1003` (sàn **4 đơn vị**, không theo bán kính) cũng vỡ | Plan viết theo **giữ 2,6** và phát biểu lại bất biến liên tục theo **chữ** của AC-15.2; chốt bán kính tránh người **2,0 m** ở engine (đầu vào của câu trả lời). **Chốt 2026-11-23 (câu 3): giữ 2,6.** Nên hai đĩa chồng 71–89% là hệ quả **đã được chấp nhận có hiểu biết**, và việc còn lại là phát biểu lại bất biến theo **đúng chữ** của AC-15.2 — người dùng vẫn là lớp kiểm cuối ở T761 |
| **R59** | "Bóng chết" và bốn con số thời lượng là **số của plan**, không của spec | Chắc chắn | Dẫn chúng như thể spec đòi thì `/analyze` bắt là yêu cầu ngoài spec; không có con số nào thì 20 giây một pha **không khép được** | Bảng **tạm có tên** ở đúng một chỗ (mục 3.1), chú thích "chưa có AC, spec 010 sở hữu con số cuối"; phép kiểm chỉ khẳng định **tính nhất quán**, không khẳng định giá trị. **Đã giải 2026-11-23 (câu 1): bốn con số ở lại trong plan, KHÔNG thành AC** — nên rủi ro "dẫn chúng như thể spec đòi" vẫn còn, và nó được chặn bằng đúng chú thích ấy |
| **R60** | Tệp xuất có thể vượt ngân sách, và **hiến pháp không có dòng nào** về kích thước tệp xuất | Trung bình–cao | Hoặc ngân sách đỏ ngay ở task đầu, hoặc nó được nới lặng lẽ | **Đã giải 2026-11-23 (câu 2): 11 MB, chỉ trong spec 007 → `AC-45.11`; hiến pháp KHÔNG đổi.** Ô Rủi ro bên trái vẫn đúng y nguyên sau quyết định — vì quyết định chính là *không* thêm dòng hiến pháp nào. Phần kỹ thuật giữ nguyên: đo ở tầng services trên số byte UTF-8 thật (`TextEncoder`), **không** trên `chuoi.length` |
| **R61** | Người bật **giảm chuyển động** nhận ít hơn plan nghĩ, và ở một chỗ nhận **tệ hơn** hôm nay: bóng tới 30 m/s nên một đường chuyền dài là một bước nhảy **~26,0 đơn vị** ở `TI_LE_MET` đã chốt — lớn hơn bước nhảy lớn nhất của người (7,78 đơn vị) **3,3 lần** | Chắc chắn | Một yêu cầu accessibility (AC-31.1, **không** phải tuỳ chọn) được thoả đúng từng chữ mà người dùng nó phục vụ lại thấy tệ hơn | Ghi cả ba món **ĐƯỢC** (tần số cập nhật ×60; bước nhảy lớn nhất của **người** nhỏ hơn 6,1 lần và được bảo đảm bằng AC-38.1 chứ bằng lớp vẽ; vòng sáng người giữ bóng **thôi đoán**) và món **MẤT** bằng số. **Chốt 2026-11-23 (câu 5) → `AC-45.9` mới**, nên món MẤT ấy giờ nằm trong spec bằng chữ chứ không chỉ trong bảng rủi ro của plan |
| **R62** | Có những vùng **không được canh** mà plan sẽ bước vào: `CAM_IMPORT` **không** có `Worker`, `SharedArrayBuffer`, `node:*`, `zod`. Cộng: `Float32Array` sẽ là typed array **đầu tiên** trong `src/engine` | Trung bình | Một task sau đẩy bộ đệm vào `Worker` để lấy headroom, và **không test nào chặn**. Lúc ấy engine thôi thuần tính toán và P1/P2 **mất lưới** | Plan **tuyên bố** ở mục 2.2, và nói thẳng rằng tuyên bố ấy **không có test đỡ**. Task nào muốn `Worker` phải kèm việc mở rộng `CAM_IMPORT` |
| **R63** | Số dòng trong plan sẽ **trôi**, và T701 làm nó trôi thêm | Chắc chắn | Người thực thi mở sai dòng; tệ hơn, một phép review "đã kiểm dòng X" đi qua một chỗ không phải nó | Hợp đồng là **tên hàm**; bảng số dòng ở **đúng một chỗ** (mục 2.4) kèm lệnh `grep -n` dựng lại được, sửa sau T701 |
| **R64** | Hai hằng số bằng nhau **một cách tình cờ** và thiết kế dựa vào việc chúng bằng nhau: `MS_LANG_SAU_BAN_THANG = 1500` (useMatch.ts) và `THOI_GIAN_HIEU_UNG_BAN_THANG = 1500` (San2D.tsx, **không export**) | Cao | Lệch nhau thì mốc đứng và vòng sáng ăn mừng **lệch pha**, và không test nào báo | Một dòng `const THOI_GIAN_HIEU_UNG_BAN_THANG = MS_LANG_SAU_BAN_THANG` (San2D.tsx đã import từ useMatch) — rẻ nhất, không đổi hành vi. Chú thích trỏ nhau thì kém hơn vì **chú thích không đỏ** |

---

## 9. Thứ tự triển khai (lát cắt dọc)

| Lát | Nội dung | Xem được gì ngay |
|---|---|---|
| **Phase 53** — Nền tất định, phép bóc, và một trận liên tục xem được ở độ phân giải giây | **T700** đo lại mốc nền v6 bằng chính `npx vitest run` kèm điều kiện đo viết thành chữ, ghi dòng kết quả vào đầu các file ngân sách. **T701** bóc `quyetKetCucChuoi` + thêm `export` cho `thuRutThe`/`giamTheLuc`/`apHangDoi` — **bốn ký hiệu**, không một dòng nào bị viết lại. **T702** `nhayRut` + `BUOC_HAT_GIONG` vào `rng.ts`, ba dòng rút, phép kiểm **đẳng thức**. **T703** `engine/hinhHocSan.ts` + `ui/quyDoiMet.ts` (đảo dấu y). **T704** `lienTuc/moc.ts` + `buocPhutLienTuc` trả lô + `loMoc` stride 8, 26 thực thể; lô đi qua **ref ngoài React**. **T705** `cheDoMoPhong` vào kiểu + `CauHinhTran` + **hai đường dựng lại cấu hình** (`cauHinhTuBanGhi`, `cauHinhDauLai` nhận tham số thứ ba). **T706** `lienTuc/dienPha.ts` — bốn pha con của **D126**; ⚠️ **task này là một lỗ của plan đã vá 2026-11-23**: `dienPha.ts` được nhắc ở sơ đồ mục 3, ở D126 và ở bảng Contracts, nhưng mục 9 **chưa từng gán task nào tạo nó**. **T707** khoá quân số ≠ 11 ở `batDau.ts`. **T708** chế độ vào bản ghi + tệp sao lưu + `cheDoCua`/`phienBanEngineHienTaiCua`. **T709** nhóm radio + chuỗi song ngữ + `San2D` đón `anhChup?`. *(T705 cũ khai 12 file trải 5 tầng nên `/tasks` chẻ nó thành bốn — xem `tasks.md`.)* | Ở màn chọn cặp đấu có thêm hai lựa chọn chế độ, và "liên tục" bị khoá **kèm một câu giải thích** khi quân số khác 11. Bấm bắt đầu: sân 2D vẽ 22 điểm và quả bóng đổi chỗ **mỗi giây trận** thay vì mỗi phút, bóng ở toạ độ engine nói chứ không ở chỗ lớp vẽ đoán, tỉ số và dòng tường thuật **y hệt** chế độ phút. Chuyển động còn **thô** (chưa có trần tốc độ, chưa có đường cong) — **phải nói trước** |
| **Phase 54** — Cơ học của một cơ thể người | **T710** `tocDoToiDa` (**không** nhân thể lực). **T711** kẹp vector gia tốc/giảm tốc + cổng quay ba băng + tích phân Euler. **T712** trần theo hướng mặt + `huongNguoi` có trần quay. **T713** `tranhNguoi` + `tachChen` (bán kính tránh **2,0 m**) — **đây là chỗ AC-34.2 hoãn từ spec 006 được trả**. **T714** tách `ui/viTriVe.ts` thành hàm thuần export **trước**, rồi gắn năm cổng: tắt `lechDaoDong`, phép bám chân bóng, `cuaSoGiuBong`, `aiGiuBongLucNay`, `nghiengKhoiTheoBong`+`daiThuMon`; kẹp **ĐÍCH** thủ môn ở engine. **T715** test tính chất 100.000 bộ đối nghịch | Cầu thủ chạy, tăng tốc và **phanh** trong mức người thật làm được; không ai còn nhảy một đoạn; người rê bóng đi **vòng qua** đối thủ thay vì xuyên qua; thủ môn không bị lớp vẽ kéo về mà **tự** ở lại sân nhà; mỗi điểm có một **hướng nhìn**. Sân sẽ trông **TĨNH hơn** trước vì lớp dao động đã tắt — **phải báo trước** |
| **Phase 55** — Bóng có độ cao, và điều kiện trận | **T720** `vatLyBong.ts`: `z`/`vz`, `tocDoDuongBong` theo quãng mét thật, `thoiGianBay = d/v`. **T721** `zKhiToi` cho `tat-canh` rơi trong [1,5; 2,8] và **chính hàm ấy** phát `trang_thai: 'danh_dau'`. **T722** `dieuKien.ts`: thời tiết và gió là hàm băm thuần, **0 lần rút**; `MA_SAT_LAN_SET` ở một chỗ. **T723** ma sát lăn sệt + gió **chỉ** ăn vào bóng bổng dài, kèm phép kiểm **chống mã chết** (gió 0 so với 7,75 m/s trên một đường sệt phải ra vị trí **giống hệt**). **T724** nhãn thời tiết song ngữ nhồi vào khối `TRAN_DAU`, hiện cạnh mã trận | Bóng **bay bổng** ở các quả tạt và **có người đánh đầu**; đường chuyền ngắn trông khác đường chuyền dài; bóng lăn xa hơn khi trời mưa; cạnh mã trận có một dòng chữ nói thời tiết và gió của trận, bằng ngôn ngữ đang chọn |
| **Phase 56** — Mốc dày ở tình huống quan trọng, và lớp phát ở cả **năm** mức tốc độ | **T730** `tinhHuong.ts`: `laTinhHuongQuanTrong` đúng bốn toán hạng; nguồn là kết quả **tại chỗ sinh**, **không** phải `tt.ungVien`. **T731** làm dày cả cửa sổ chuỗi lên 0,5 giây; bảng bóng chết ở **đúng một chỗ** kèm chú thích "chưa có AC". **T732** `ui/mocVe.ts` — một phép chia, không nhánh theo tên mức tốc độ, kiểm bằng `Object.entries(MS_MOI_PHUT)`. **T733** **nới cổng của đúng MỘT vòng rAF** và đặt lại mốc thời gian theo số lô **ngay trong vòng rAF**. **T734** giảm chuyển động (**AC-45.9**): phần **nối dây** — cổng đồng hồ mốc không nhận `giamChuyenDong`, `dongHoDao` chỉ cộng khi `!giamChuyenDong`. **T737** phần **phép kiểm** của AC-45.9: +1 describe thuần ở `ui/viTriVe.test.ts`, **sau T734**, vì `environment: node` không chạy được test component nên luật phải nằm ở hàm thuần. **T738** phép kiểm **phủ định** của **AC-45.10**: không một đường nào trong `lienTuc/` và `useMatch.ts` làm `chiSoMoc` giảm. **T735** phép kiểm AC-38.8 ở lớp vẽ, ngưỡng **quy từ** `TOC_QUAY_NHANH`. **T736** vẽ lại vạch sân ở **nhánh liên tục** (vòng cấm, vòng tròn giữa, chấm phạt đền, khung thành), nhánh phút là nợ có tên | Ở các bàn thắng, cơ hội rõ ràng, cứu thua và thẻ đỏ, chuyển động **dày lên gấp đôi** và nhìn thấy rõ pha dẫn tới tình huống. Chạy trơn ở **cả năm** mức tốc độ, kể cả mức nhanh nhất (hôm nay vòng rAF chạy **0 khung** ở mức ấy). Người bật giảm chuyển động **vẫn thấy trận tiến theo giây**. Vòng cấm và khung thành vẽ đúng mét |
| **Phase 57** — Tệp xuất JSON và bộ đo cơ học chạy trên chính tệp | **T740** `tepXuat.ts`: năm khoá gốc, khối mỏng tuple + hàng tiêu đề, khối dày là mục 15 **không sửa một khoá**, mã ngắn gán từ **bản ghi** nên hai lần xuất giống từng byte. **T741** **kênh nhật ký RIÊNG không cắt** của engine liên tục (**không** dùng `TranDaLuu.cacSuKien` hay `tt.ungVien`), bảng ánh xạ loại hai chiều + hai danh sách khai (`loai_mo_rong`, `loai_bo_trong`). **T742** `doCoHoc.ts` + bộ test **ngược** + test độc lập thứ tự cột. **T743** `xuatTranService.ts` tách `dungChuoiXuat` khỏi `taoBlobXuat`; `useXuatTran.ts`. **T744** **đo và báo** kích thước thật (`TextEncoder`, ca trung bình + ca xấu) rồi **đối chiếu với 11 MB của `AC-45.11`** — **không** đặt lại ngưỡng, đúng khuôn T753 đã dùng cho ngân sách mùa giải. **T745** phép kiểm ngưỡng: `soByte <= 11 MiB` trên trận 90 phút ca xấu, cộng một **ca ngược** chứng minh ngưỡng đỏ được | Có một nút **xuất tệp** ở màn trận, nói rõ **kích thước** và cho **huỷ trước khi ghi**; tệp mở ra bằng `jq` hay `node -e` đọc được; và `npx vitest run` chứng minh **mười** AC cơ học đo **trên chính tệp ấy** thay vì trên một bản đo dựng riêng |
| **Phase 58** — Hai chế độ so được bằng số, và trả các món nợ có tên | **T750** nâng `maRong` + mẫu 200 mã lên `__fixtures__/doiMau.ts`, điều kiện ra là hai file `sosanh.*` cũ còn in đúng **174-17-9** và **76-47-77**. **T751** `sosanh.haiCheDo.test.ts`: hai `it` cho hai đại lượng, một lượt đo **có ghi nhớ**, hai hằng số ở đúng một chỗ. **T752** `hieuNangLienTuc.test.ts` với **một** ngưỡng đã chốt + cổng **số đếm thuần**. **T753** task **ĐO VÀ BÁO** ngân sách mùa giải — báo con số thật, **không** có task tối ưu để lọt ngưỡng. **T754** ba món nợ văn bản: chú thích D23 ở `vung.ts:4-18` (spec 007 **đảo** nó), `suKien.ts:88` ("giữ nguyên 5" — sai từ khi engine lên 6), và ba bất biến lớp vẽ ghi rõ "chỉ áp cho chế độ nào" + sửa chú thích sàn 1,71→1,46 ở `San2D.tsx:862-881` | Không có gì mới trên hình, nhưng `npm test` **nói được bằng số** rằng hai chế độ cho cùng tương quan lực, và plan có một **con số thật** cho ngân sách mùa giải để người dùng quyết nới hiến pháp hay cho mùa giải chạy chế độ phút |
| **Phase 59** — Lớp kiểm cuối của DoD | **T760** người dùng xem **trọn một trận** ở chế độ liên tục, ở ít nhất **ba** mức tốc độ, bật và tắt giảm chuyển động, rồi phán xem **ba câu họ nói ở mục 1 của spec** còn đúng không. **T761** danh sách kiểm bằng mắt cho đúng những chỗ `environment: node` không với tới: nhánh JSX vạch sân, bốn chỗ nối dây `useEffect`, nhãn thời tiết hiện và **không** hiện ở chế độ phút, nhóm radio đi được bằng bàn phím. **T762** đóng spec bằng bảng AC **đạt / chưa đạt / nợ có tên** trên **cả 30 AC** *(nhiệm vụ "ghi câu trả lời cho sáu món treo" đã xong trước khi code: tám câu được trả lời 2026-11-23, nhật ký ở `spec.md` mục 15)* — **không tick cái nào bằng mắt mà spec đòi test** | Người dùng đã xem bản chạy và nói ra được chỗ nào còn "teleport" hoặc "giật cục"; mỗi món còn nợ có **một tên** và **một spec sở hữu** nó |

**Ba AC mới của lượt hỏi 2026-11-23 vào hai lát đã có, không sinh lát mới.** Và chúng
**không** được cấp số mới cho việc đã có số: **AC-45.9** đã có chủ ở **T734** (phần nối dây),
nên nó chỉ thêm **T737** là phần *phép kiểm* (+1 describe thuần, **sau T734**) — hai task, hai
điều kiện ra phân biệt được. **AC-45.10** thêm **T738** (phép kiểm phủ định "không đường nào
làm `chiSoMoc` giảm"). **AC-45.11** đã có **T744** là phép *đo*, nên nó thêm **T745** là phép
*kiểm ngưỡng*, và T744 bị viết lại để **thôi tự chốt ngưỡng**. Cả bốn số nằm trong lát đã có
nên **chuỗi phụ thuộc dài nhất không đổi**.

**Chuỗi phụ thuộc dài nhất:** `T701 → T704 → T732 → T733 → T734 → T736 → T754 → T760 →
T761 → T762` (**10 task**). ⚠️ Bản trước của dòng này khai `T700 → T701 → T704 → T710 →
T711 → T731 → T740 → T742 → T751 → T762`, và nó **không phải một đường đi thật**: **T701
không phụ thuộc T700** (phép bóc hàm không cần con số nền nào), và **T762 phụ thuộc T761**
chứ không phụ thuộc T751. Chuỗi đúng được `/tasks` tính lại từ đồ thị phụ thuộc ngày
2026-11-23. Phase 54 và Phase 55 chạm cùng `lienTuc/` nhưng khác file, nên chúng **song
song được một phần**; Phase 56 phụ thuộc cả hai.

---

## 10. Tám câu đã hỏi — và tám câu trả lời (2026-11-23)

> ✅ **Người dùng trả lời cả tám trong hai lượt ngày 2026-11-23, cả tám theo phương án được
> khuyến nghị.** Bảng dưới là quyết định. Phần lập luận gốc của từng câu **giữ nguyên bên
> dưới**, để sau này đọc lại còn thấy plan đã đặt câu hỏi với những con số nào. Nhật ký chính
> thức là `spec.md` mục 15.

| Câu | Quyết định | Đổi gì trong repo |
|---|---|---|
| 1 — "bóng chết" và 20 giây một pha | Bốn con số **ở lại trong plan**, không thành AC | Không đổi AC. Mục 3.1 ghi chốt; phép kiểm canh **nhất quán**, không canh giá trị |
| 2 — ngân sách tệp xuất | **11 MB**, **chỉ** trong spec 007 | `AC-45.11` mới + một câu ở mục 6 của spec. **Hiến pháp không đổi** |
| 3 — bán kính điểm vẽ | **Giữ 2,6** | Không đổi AC. R58 ghi chốt; bất biến phải phát biểu lại theo **chữ** của AC-15.2 |
| 4 — chiều ma sát sân ướt | **Sân ướt thì bóng đi XA hơn** (chiều mục 21). Độ dài cỏ **không** vào spec 007 | `AC-38.7` **không đổi**; spec mục 9 ghi xác nhận; `ban-mo-ta-goc.md` nhận **một ghi chú phán xử** có ngày, **không sửa một câu nào của người dùng** |
| 5 — giảm chuyển động | **Đồng hồ mốc chạy, tắt nội suy + dao động** (phương án của D132) | `AC-45.9` mới, **T737** |
| 6 — AC-38.10 | **Nới dải thành 15–35 m**, giữ phép kiểm tuyệt đối | `AC-38.10` sửa số; D133 và R55 bỏ dải "chưa chốt"; hai mệnh đề còn lại không đổi |
| 7 — chỗ đặt phép kiểm AC-45.3 | **Trong `npm test` mặc định** | Không đổi AC. D131 ghi chốt kèm cái giá (+46–54% mỗi lần `npm test`) |
| 8 — chữ "tua" | **Tua TỚI thôi**, không tua ngược, không thanh thời gian | `AC-45.10` mới + mục 4 bước 3 của spec viết lại, **T738** |

### Bối cảnh khi hỏi — giữ nguyên nguyên văn

Plan **không tự trả lời** sáu câu dưới đây. Năm câu đầu có một khuyến nghị kèm cái giá bằng số;
câu 6 thì spec đã ràng cách xử ("con số không dựng nổi thì **quay lại hỏi người dùng, KHÔNG tự
hạ ngưỡng**").

1. **"Bóng chết" nghĩa là gì, và 20 giây một pha chia thế nào.** Khuyến nghị: biên giữa hai
   chuỗi (chỗ ngắt **duy nhất đã có thật** trong code, 287,7 lần một trận) + bảng **tạm có tên**
   ở mục 3.1. Lựa chọn khác: chốt bốn con số **bây giờ** thành AC mới → `spec.md` phải sửa.
2. **Ngân sách kích thước tệp xuất, và nó có vào hiến pháp không.** Đo được ở hình dạng đề nghị:
   ~7,2 MB ca trung bình, 8,0 MB ca xấu, ~9,0 MB sau khi spec 009 điền hai trường còn `null`.
   Khuyến nghị **11 MB** (dư 37% hôm nay, 22% sau spec 009, và **vẫn đỏ được**). Món đổi nếu
   muốn nhỏ hơn: bỏ `trang_thai` khỏi khối mỏng → ~6,6 MB, nhưng AC-38.5 chỉ gác được **7%**
   thời lượng trận thay vì 100%.
3. **Bán kính điểm cầu thủ ở chế độ liên tục.** Khuyến nghị **giữ 2,6** và phát biểu lại bất
   biến theo chữ của AC-15.2 — cái giá: hai người tranh chấp vẽ thành hai đĩa chồng **71–89%**,
   số áo không đọc được. Lựa chọn khác: hạ xuống 1,30 — cái giá: cỡ chữ số áo giảm một nửa,
   `PHI_THEM_NGUOI_GHI_BAN` phình 1,93 lần, và `san2D.test.ts:1003` (sàn **4 đơn vị**) cũng vỡ.
   Người dùng vừa xin thu bán kính 3,4 → 2,6 ở T627, nên đã ở biên của việc đọc được số áo.
4. **Chiều ma sát của sân ướt — bản mô tả gốc nói ngược nhau.** Mục 10 viết bóng "chậm dần nhanh
   hơn trên sân ướt" (đi **ngắn** hơn); mục 21 viết "mưa làm bóng lăn nhanh và trơn hơn" (đi
   **xa** hơn). `spec.md:382-384` đã chọn chiều mục 21 và plan viết theo nó. Nếu ý người dùng là
   chiều kia thì phải sửa: bảng 5 hằng số, hai phép kiểm, câu chữ AC-38.7, **và một trong hai
   câu của chính `ban-mo-ta-goc.md`**. Có thể cả hai đều đúng cho hai thứ khác nhau (cỏ **ướt**
   giảm ma sát, cỏ **dài** tăng); nếu vậy thì độ dài cỏ có vào spec 007 không? Hôm nay không AC
   nào nhắc tới cỏ, nên mặc định của plan là **KHÔNG**.
5. **Người bật "giảm chuyển động" thấy gì ở chế độ liên tục.** AC-31.1 nói "không nội suy, không
   dao động" — nó **không** nói "ít chuyển động hơn", nên ba cách đọc đều thoả đúng từng chữ.
   Khuyến nghị: **đồng hồ mốc chạy, chỉ tắt nội suy và dao động** (D132). Phải nói thẳng một chỗ
   **tệ hơn hôm nay** ở cả ba cách: bóng tới 30 m/s nên một đường chuyền dài là một bước nhảy
   ~26,0 đơn vị, lớn hơn bước nhảy lớn nhất của người 3,3 lần. Dù chọn cách nào, spec cũng cần
   **một AC mới**, vì hiện không AC nào nói họ thấy gì ở chế độ liên tục.
6. **AC-38.10 đòi một con số không dựng nổi.** AC đòi trọng tài chính cách bóng **15–25 m ở mọi
   khung hình**, trong khi AC-38.1 cho người tối đa 9 m/s và AC-38.2 cho gia tốc tối đa 6 m/s².
   Phép tính: một quả phát bóng 70 m ở 25 m/s bay 2,8 giây; trọng tài phải dịch tối thiểu 20 m
   nhưng tối đa đi được 9·2,8 − 6,75 = **18,45 m** — thiếu 1,55 m ở trường hợp **thuận lợi
   nhất**. Ba đường: (a) nới dải thành 15–35 m; (b) giữ 15–25 m nhưng phát biểu theo **phần
   trăm** số mốc (ví dụ ≥ 95%); (c) chuyển AC-38.10 sang spec 008 cùng luật IFAB. Hai mệnh đề
   còn lại của AC — "không nằm trên đường chuyền" và "mỗi trợ lý ngang hàng hậu vệ cuối cùng" —
   hiện **cũng chưa có cơ chế nào**, nên dù chọn đường nào chúng cũng cần một quyết định riêng.

**Hai câu nữa, nhỏ hơn, nhưng cũng của người dùng:**

7. **Phép kiểm AC-45.3 tốn 400 trận — nó nằm trong `npm test` mặc định hay chạy theo yêu cầu?**
   Suite hiện là 63 file / 1.304 test / ~27 s. Nửa v6 đo được 1,2 s khi chạy riêng nhưng ~11 s
   trong suite song song. Nửa liên tục chưa tồn tại, nên có **ba phép nhân cách nhau 14 lần**:
   ~2,9 s nếu giữ số lần gọi mô hình xác suất ở mức ~288 lần một trận như hôm nay, ~35 s nếu gọi
   một lần mỗi mốc, ~41 s ở ngân sách 200 ms một trận. Ở hai nhánh sau, **file này một mình thêm
   46–54%** vào mỗi lần `npm test`.
8. **Chữ "tua" ở mục 4 bước 3 của spec nghĩa là gì.** Spec viết "Người dùng xem sân 2D, **dừng
   và tua được**", nhưng **không một AC nào** trong 27 AC định nghĩa "tua", và hôm nay trong app
   chỉ có nút *Chạy hết trận*. Plan đọc **HẸP**: "tua" = tua **TỚI**, và spec 007 **không có tua
   ngược**. Nếu ý người dùng là một thanh thời gian tua về giây thứ N thì đó là một tính năng
   giao diện mới trọn vẹn **cộng** một đường dữ liệu mới, và spec 007 phải có thêm một AC cho nó
   **trước khi `/tasks` chạy**.

---

## 11. Hai chỗ `spec.md` đã lạc hậu — **người dùng cho sửa 2026-11-23**

Plan **nêu** hai chỗ này và không tự sửa, vì sửa chúng đổi **lập luận** của spec. Người dùng
cho sửa trong cùng ngày; `spec.md` mục 15 là nhật ký chính thức (hàng 25 và 26).

1. **Bốn chỗ viết "Engine v5", và câu "20 trận đã lưu ĐẤU LẠI y nguyên".** Code là
   `PHIEN_BAN_ENGINE = 6` (`tran.ts:1316`) từ `f537d7d`, và `lyDoKhongDauLai` trả
   `'khac-phien-ban-engine'` khi phiên bản khác (`matchRepo.ts:202`) — nên trận lưu bằng v5
   **mở và xem lại được** (bản ghi mang dòng sự kiện đầy đủ) nhưng **không đấu lại được**.
   ✅ Đã sửa ở `spec.md`: khối mở đầu, non-goal "thay thế engine", ghi chú lớp suy ra. Lời hứa
   đúng của spec vẫn là **AC-45.2**, vốn đã viết "bằng engine **hiện tại**" ngay từ đầu.

   ⚠️ **Và danh sách "bốn chỗ" ở trên đã THIẾU.** Soát chéo sau khi sửa tìm thêm **ba chỗ**
   mang đúng lời hứa ấy mà không mang chữ "v5", nên một lần grep `"Engine v5"` không thấy:
   hàng **P3 của mục 10** trong spec (nặng nhất — mục 10 mở đầu bằng "Mọi AC dưới đây PHẢI
   còn đúng khi spec 007 đóng", và DoD đòi chạy lại chúng cho xanh, nên đó là yêu cầu **còn
   sống**); hàng tình huống biên "mở lại một trận cũ mà engine đã đổi kể từ đó", vốn nói
   "chuyển động có thể khác" trong khi sự thật là **đấu lại bị từ chối thẳng**; và quyết định
   1 của nhật ký 2026-11-19 (giữ nguyên lời cũ, chỉ thêm con trỏ sang bản sửa). Bài học cho
   các spec sau: **grep theo lời hứa, không grep theo con số phiên bản.**

2. **Cảnh báo "hợp đồng tạm" của AC-45.3 ghim vào 3,95 bàn một trận của v5.**
   ⚠️ **Và bản trước của chính mục 11 này đã kết luận SAI.** Nó viết v6 đo được "**2,475 bàn
   một trận** — đã nằm trong dải 2–3", rồi bảo hợp đồng tạm "đã hết hạn sớm". Con số ấy
   **không dựng lại được**, và kết luận thì **ngược**. Đo lại 2026-11-23 (200 mã do `taoMaTran`
   sinh, bốn hạt giống 1/2/7/99, sân trung lập, `benMau` + `chayHetTran`):

   | Cặp đấu | Bàn một trận (4 mẫu × 200 mã) | Dải 2–3 của spec 010 |
   |---|---|---|
   | Hai đội **bằng nhau** (chỉ số 12) | 2,495 / 2,565 / 2,760 / 2,870 | **trong dải** |
   | **A15 vs B10** — cặp mà **D131** chọn cho phép kiểm AC-45.3 | 3,110 / 3,230 / 3,285 / 3,390 | **trên dải, cả bốn mẫu** |

   2,475 là mức của hai đội **bằng nhau**; phép kiểm thật sự dùng cặp **lệch chỉ số**. Nên
   cảnh báo **còn hiệu lực**, chỉ nhẹ hơn: khoảng cách tới dải co từ ~0,95 bàn xuống
   ~0,2–0,4 bàn, và spec 010 **vẫn phải phá** AC-45.3. ✅ Đã sửa ở `spec.md`: cảnh báo được
   **giữ lại và viết lại bằng số của v6** thay vì bị xoá.

   > **Một hệ quả để người dùng biết, plan KHÔNG tự quyết:** cặp A15 vs B10 của D131 được
   > chọn vì lý do khác (tách lợi thế sân nhà khỏi ngân sách 0,5 bàn), và nó tình cờ là cặp
   > **ghi nhiều bàn nhất** trong các cặp đã đo. Nếu sau này muốn AC-45.3 nằm sẵn trong dải
   > của spec 010 thì phải đổi cặp đấu — nhưng đổi cặp là đổi **ý nghĩa** của phép kiểm, nên
   > nó là một câu hỏi, không phải một phép tối ưu. Hôm nay D131 **giữ nguyên**.

   > **Lỗi này đúng loại mà chính plan đã đặt lệnh cấm số 3 ở mục 7 để chặn:** trích một con
   > số mà không kèm lệnh dựng lại được và điều kiện đo. Lệnh cấm ấy viết cho số **thời
   > gian**; từ đây nó áp cho **mọi** con số đo được.
