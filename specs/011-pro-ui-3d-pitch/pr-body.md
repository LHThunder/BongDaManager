Sa bàn 3D song song với sân 2D, cộng một hệ thống thiết kế có tên cho màn hình xem trận.

**Nhánh nền phải là `007-continuous-match-engine`, không phải `main`** — spec 011 đứng trên
engine liên tục của spec 007, thứ `main` chưa có.

## Trạng thái

| | |
|---|---|
| Task | **36/50** |
| AC | **40/52** |
| Bộ kiểm | **86 file / 1.809 phép kiểm xanh** |
| `src/engine` | **0 dòng đổi** |
| `package.json` | **0 dòng đổi** — không thêm một phụ thuộc nào |
| Status của spec | **Planned** — cố ý chưa `Done` |

## Làm được gì

- **Hiến pháp 4.0.0**: gỡ đúng một dòng khỏi Non-goals (*"Đồ hoạ 3D; mọi hiển thị sân là 2D
  dạng điểm"*), theo khuôn lần 3.0.0.
- **Sa bàn chạy được**: phép chiếu trực giao góc cố định viết tay trên chính lớp SVG đang có,
  22 cầu thủ, quả bóng **có độ cao**, thứ tự che theo độ sâu, số áo cỡ cố định.
- **Nút đổi góc nhìn** nhớ lựa chọn, ẩn hẳn ở trận cổ điển, bàn phím tới được.
- **Hệ thống thiết kế**: 42/42 biến màu đủ bốn cột, ba thang, bảng bảy cặp màu dễ lẫn kèm cue
  phụ bắt buộc.
- **Hai món nợ tương phản đã trả**: vạch sân `2,72 → 3,30:1`, số áo trên `#0077DD`
  `4,48 → 4,89:1`.

## Số đo thật

- Quả tạt: `z ≈ 2,15 m` vẽ cao hơn dấu chiếu **2,3 lần bán kính bóng**, dấu chiếu lệch ngang
  **đúng 0**.
- Đổi góc nhìn giữa trận: đồng hồ **26′ → 26′**, không lùi, không nhảy phút.
- Chạy hết trận ở sa bàn: **0,05 s** / ngân sách **3 s**.
- `0` tác vụ vượt 50 ms · `0` lời gọi ra host ngoài.
- Tương phản xám: tỉ số và tên đội **15,81:1**, phút và tường thuật **7,32:1**.
- Cửa sổ 382×446: **0 trên 33 hình** tràn khung.

## Hai thứ chặn phần còn lại

**1. `T813` của spec 007 — một lỗi engine thật, phát hiện khi viết phép kiểm bất biến.**
Thủ môn ra khỏi một phần ba sân nhà ở **2,06%** số mốc (56.640 lượt đo), lệch xa nhất
**31,72 m** — tức đứng qua vạch giữa sân. Engine kẹp **đích** chứ không kẹp **vị trí**. Đây
đúng là lỗi mà spec 005 sinh ra AC-30.7 để chặn. Spec 011 chỉ đọc engine và **không được**
kẹp lại ở lớp vẽ, nên Phase 62 dừng ở T777 và AC-49.1 để mở. Đã mở task ở spec 007; `spec.md`
của spec 007 **không bị đụng một dòng nào**.

**2. Môi trường đo không vẽ khung ở nhịp thật.** Trần ~**30 fps** cho **cả hai** lớp vẽ, và
có lúc **5 khung trong 4 giây với 0 tác vụ dài** — nếu ứng dụng chậm thì `longtask` đã bắt
được. AC-51.1, AC-51.4, AC-51.5 vì thế **không đo được**, và không con số nào bị bịa ra.

## Nợ có tên còn lại

- Ba màu mức lệch cách nhau **4** và **10** điểm độ sáng (dưới ngưỡng 15) — ở màn hình chiến
  thuật, ngoài phạm vi spec này; cue phụ bắt buộc đã có và là **chữ**.
- Chồng lấn giữa các đĩa cầu thủ trên sa bàn — `phanBietDuoc` và viền tách thuộc Phase 62.
- **Một phép kiểm chập chờn**: 1 lần đỏ trên 4 lần chạy cả bộ, chưa bắt được tên. Điều kiện RA
  của mọi task là "bộ kiểm xanh", nên đây là chuyện phải nói.

## Năm con số tôi phải sửa công khai trong lúc làm

`sin` vs `cos` (64% → **77%**) · "bốn mức tốc độ" → **năm** · thủ môn (0,96%/2,01 m →
**2,06%/31,72 m**, sai 15 lần và đổi hẳn một quyết định) · 18/42 giá trị chế độ tối viết từ
trí nhớ thay vì đọc file · thang cỡ chữ gọi `text-3xl` là ngoại lệ, hoá ra đó là **tỉ số**.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
