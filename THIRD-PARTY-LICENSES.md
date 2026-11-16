# Giấy phép của những thứ lấy từ bên ngoài

Hiến pháp **P4** cấm mọi lời gọi mạng lúc chạy, nên mọi thứ lấy từ bên ngoài
đều được **chép vào repo** và đi cùng bản build. Tệp này ghi lại chúng đến
từ đâu và dùng được theo giấy phép nào.

---

## Biểu tượng — Tabler Icons (MIT)

- Nguồn: <https://github.com/tabler/tabler-icons>
- Giấy phép: MIT
- Nằm ở: `src/ui/bieuTuong/*.svg`, chép nguyên vẹn kể cả chú thích đầu tệp
  (tên nhóm, phiên bản, mã unicode), để sau này đối chiếu được với bản gốc.

Mười tệp, mỗi tệp cho một khái niệm lặp lại của ứng dụng (AC-21.1):

| Khái niệm | Tệp Tabler |
|---|---|
| Đội | `shield.svg` |
| Cầu thủ | `user.svg` |
| Sân đấu | `soccer-field.svg` |
| Trận đấu | `ball-football.svg` |
| Chiến thuật | `chess.svg` |
| Lịch sử | `history.svg` |
| Sao lưu | `database-export.svg` |
| Thẻ phạt | `rectangle-vertical.svg` |
| Bàn thắng | `target-arrow.svg` |
| Thay người | `arrows-exchange.svg` |

Ba khái niệm không có biểu tượng đúng nghĩa trong bộ Tabler và đã phải chọn
cái gần nhất, ghi lại ở đây để sau này ai đọc không tưởng là tuỳ tiện:

- **Chiến thuật** — Tabler không có `strategy`. `chess.svg` là ẩn dụ quen
  thuộc nhất cho việc bày thế trận.
- **Thẻ phạt** — không có biểu tượng thẻ trọng tài. `rectangle-vertical.svg`
  đúng hình dạng tấm thẻ; màu do chỗ dùng quyết định.
- **Bàn thắng** — không có `goal` hay `net`. `ball-football.svg` đã dành cho
  "trận đấu", nên bàn thắng lấy `target-arrow.svg` — mũi tên trúng đích.

Quy tắc của spec khi bộ icon thiếu một khái niệm: **dùng chữ, KHÔNG trộn
biểu tượng từ bộ khác** (AC-21.2). Ba chỗ trên vẫn nằm trong bộ Tabler nên
không phạm quy tắc ấy.

### Giấy phép MIT (Tabler Icons)

```
MIT License

Copyright (c) 2020-2024 Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Phông chữ — Inter và Barlow Condensed (SIL OFL 1.1)

Nằm ở `public/phong/`; chi tiết và lý do chọn đúng bốn tệp ghi ở
`public/phong/GIAY-PHEP.md`.

| Phông | Nguồn | Giấy phép |
|---|---|---|
| Inter | <https://github.com/rsms/inter> | SIL Open Font License 1.1 |
| Barlow Condensed | <https://github.com/jpt/barlow> | SIL Open Font License 1.1 |

OFL 1.1 cho phép dùng, nhúng và phát hành lại kèm sản phẩm, miễn không bán
riêng bản thân phông và không đặt tên phông đã sửa trùng tên gốc. Repo này
không sửa gì trong hai phông.
