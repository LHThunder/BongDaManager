# Phông chữ nhúng trong repo

Hiến pháp **P4** cấm mọi lời gọi mạng lúc chạy, nên phông không được tải từ
dịch vụ phông bên ngoài. Bốn tệp `.woff2` ở thư mục này là bản **tự lưu**,
chép vào repo một lần và đi cùng bản build (AC-20.4).

| Tệp | Phông | Giấy phép |
|---|---|---|
| `inter-latin.woff2`, `inter-vietnamese.woff2` | Inter | SIL Open Font License 1.1 |
| `barlow-condensed-700-latin.woff2`, `barlow-condensed-700-vietnamese.woff2` | Barlow Condensed | SIL Open Font License 1.1 |

- Inter — <https://github.com/rsms/inter>, giấy phép tại
  <https://github.com/rsms/inter/blob/master/LICENSE.txt>
- Barlow — <https://github.com/jpt/barlow>, giấy phép tại
  <https://github.com/jpt/barlow/blob/main/OFL.txt>

OFL 1.1 cho phép dùng, nhúng và phát hành lại kèm sản phẩm, miễn không bán
riêng bản thân phông và không đặt tên phông đã sửa trùng tên gốc. Repo này
không sửa gì trong hai phông.

## Vì sao chỉ bốn tệp

Mỗi phông có hai tập ký tự: `latin` và `vietnamese`. Tập `vietnamese` chứa
đúng những dấu mà tiếng Việt cần (`U+1EA0-1EF9`, `U+0102-0103`, `U+01A0-01B0`…),
nên **không tải nó là mất dấu** — chỗ dễ sai nhất khi tự lưu phông. Trình
duyệt chỉ tải tập nào thật sự có ký tự đang hiện, nhờ `unicode-range` khai
trong `src/index.css`.

Inter là phông **biến** (variable): một tệp cho mọi độ đậm từ 100 đến 900,
nên ba độ đậm đang dùng (400, 600, 700) chỉ tốn một tệp mỗi tập ký tự.
Barlow Condensed chỉ dùng ở độ đậm 700 cho tiêu đề, nên lấy bản tĩnh.

Tổng cộng 92 KB, và lần mở đầu thường chỉ tải `inter-*` (~58 KB) vì tiêu đề
Barlow chỉ xuất hiện khi màn hình có tiêu đề lớn.
