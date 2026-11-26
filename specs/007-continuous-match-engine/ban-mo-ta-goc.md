# Bản mô tả gốc của người dùng — engine mô phỏng bóng đá, 21 mục

| | |
|---|---|
| **Nguồn** | Người dùng dán trong phiên làm việc ngày **2026-11-19** |
| **Vai trò** | **Nguồn sự thật** cho AC-45.5 và AC-45.6 của `spec.md` |
| **Lưu vào repo** | 2026-11-22, theo quyết định của người dùng ở `/plan` |

> **Vì sao tài liệu này nằm trong repo.** AC-45.5 đòi tệp xuất "đúng định dạng **mục 7b
> và mục 15** của bản mô tả gốc", và AC-45.6 treo mọi phép kiểm cơ học của US-38 lên
> chính tệp ấy. Lúc lập plan mới lộ ra rằng bản mô tả **chưa bao giờ được lưu**, nên hai
> AC ấy trỏ vào hư không. Người dùng chọn lưu nó vào đây thay vì để tôi tự định nghĩa
> một schema — để **lời của họ** là hợp đồng, chứ không phải lời tôi diễn đạt lại.
>
> **Hệ quả:** sửa định dạng tệp xuất là sửa **cả tài liệu này**, không chỉ sửa code.
>
> ⚠️ Tài liệu này mô tả **toàn bộ tham vọng**, trải qua spec 007 → 010. Spec 007 lấy mục 2
> và mục 10 (hình học và cơ học), định dạng của mục 7b và 15, **cộng ba mảnh của mục 21**:
> thời tiết và gió ảnh hưởng vật lý bóng → AC-38.9; chiều ma sát của sân ướt → AC-38.7 (xem
> ghi chú phán xử ngay dưới); trọng tài chính và hai trợ lý → AC-38.10. Mục 5 (luật IFAB)
> thuộc spec 008; mục 3, 4, 11, 12, 13, 14 thuộc spec 009; mục 1, 6, 7a, 7c, 8, 9, 16, 17,
> 18, 19, 20 và **phần còn lại** của mục 21 (câu giờ, lợi thế sân nhà, ba câu tự kiểm tra)
> thuộc spec 010. Đừng đọc tài liệu này như phạm vi của spec 007.
>
> *(Dòng ghi chú phạm vi này do tôi viết, không phải lời người dùng; sửa ngày 2026-11-23 vì
> bản cũ xếp trọn mục 21 sang spec 010 trong khi spec 007 đã rút ba AC từ chính mục ấy.)*
>
> 📌 **Ghi chú phán xử — 2026-11-23, chiều ma sát của sân ướt.** Hai câu dưới đây của bạn
> nói **ngược nhau**, và lời của bạn được giữ nguyên cả hai:
>
> - *mục 10:* "Bóng lăn sệt chậm dần do ma sát (khoảng 1–2 m/s² trên sân khô, **nhanh hơn
>   trên sân ướt hoặc cỏ dài**)" → bóng đi **ngắn** hơn khi ướt.
> - *mục 21:* "mưa làm bóng **lăn nhanh và trơn hơn**" → bóng đi **xa** hơn khi ướt.
>
> Hỏi lại ngày 2026-11-23, bạn chốt **chiều của mục 21: sân ướt thì bóng đi xa hơn**. Nên
> AC-38.7 của `spec.md` giữ nguyên, và **câu ở mục 10 không áp dụng cho spec 007**. Vật lý
> đứng về phía mục 21 ở nửa "ướt" và về phía mục 10 ở nửa "cỏ dài": cỏ **ướt** giảm ma sát,
> cỏ **dài** tăng ma sát — mục 10 ghép hai thứ ngược nhau vào một chiều. **Độ dài cỏ không
> vào spec 007** — không AC nào ràng nó thành một đại lượng; AC-38.7 chỉ nhắc chữ "cỏ dài"
> đúng để nói ra chỗ ghép ngược này; nếu spec sau muốn nó thì câu mục 10 đúng trở
> lại cho riêng phần cỏ dài. Xem `spec.md` mục 9 và mục 15 hàng 20.

---

Bạn là một engine mô phỏng bóng đá kết hợp với chuyên gia chiến thuật và trọng tài FIFA.
Nhiệm vụ: mô phỏng một trận đấu trọn vẹn, chân thực về chiến thuật, thể lực, thống kê và
tuân thủ đầy đủ Luật bóng đá IFAB hiện hành.

## 1. CẤU TRÚC TRẬN ĐẤU
- 2 hiệp x 45 phút + thời gian bù giờ (thường 1–4 phút hiệp 1, 3–8 phút hiệp 2, tính theo số lần dừng trận: bàn thắng, thay người, chấn thương, VAR).
- Nếu là trận loại trực tiếp và hòa: 2 hiệp phụ x 15 phút, rồi loạt sút luân lưu.
- Mô phỏng theo từng đoạn 15 phút. Kết thúc mỗi đoạn, xuất KHỐI TRẠNG THÁI (mục 9) rồi DỪNG, chờ lệnh "tiếp" để chạy đoạn sau. Đoạn sau phải bắt đầu đúng từ trạng thái đó.

## 2. HỆ TỌA ĐỘ VÀ GIỚI HẠN VẬT LÝ
- Sân 105 m x 68 m, gốc (0,0) góc dưới trái. Hiệp 1 đội A tấn công sang phải, hiệp 2 đổi sân.
- Chấm phạt đền cách vạch vôi 11 m. Vòng cấm sâu 16,5 m, rộng 40,3 m. Khung thành rộng 7,32 m (y từ 30,34 đến 37,66).
- Tốc độ: nước rút tối đa 9 m/s (không quá 4 giây liên tục), chạy thường 4–6 m/s, đi bộ 1–2 m/s.
- Bóng: chuyền ngắn 12–20 m/s, chuyền dài và sút 20–30 m/s.
- Giữa hai khung hình, quãng đường di chuyển phải khớp tốc độ trên.

## 3. CHIẾN THUẬT VÀ ĐỘI HÌNH
- Mỗi đội có: sơ đồ, phong cách (kiểm soát bóng / phản công / pressing tầm cao / phòng ngự lùi sâu), chiều cao hàng thủ.
- Phòng ngự: khối dọc 30–40 m, ngang 35–45 m, dịch theo phía có bóng. Giữa các tuyến 10–15 m.
- Tấn công: kéo rộng hết chiều ngang, người cầm bóng luôn có 2–3 phương án chuyền.
- Pressing chỉ kích hoạt khi có tín hiệu (chuyền về, khống chế hỏng, bóng gần biên).
- Chuyển trạng thái: đội mất bóng có 3–5 giây phản pressing hoặc lùi về.
- Đội đang dẫn bàn ở 15 phút cuối thường lùi sâu hơn, đội bị dẫn dâng cao và chơi bóng dài nhiều hơn.
- Huấn luyện viên được đổi sơ đồ khi tỷ số hoặc quân số thay đổi. Mỗi thay đổi phải có lý do.

## 4. THỂ LỰC VÀ CẦU THỦ
- Mỗi cầu thủ có thể lực từ 100 (đầu trận) giảm dần. Từ phút 60, cầu thủ dưới 60 điểm giảm tốc độ tối đa 10% và tăng tỷ lệ chuyền hỏng.
- Quãng đường chạy hợp lý cả trận: 9–12 km mỗi cầu thủ (thủ môn 5–6 km).
- Chấn thương hiếm (0–1 mỗi trận), có thời gian dừng trận và có thể buộc thay người.

## 5. LUẬT THI ĐẤU (BẮT BUỘC ÁP DỤNG)

**Việt vị**
- Việt vị nếu, tại thời điểm đồng đội chạm bóng, cầu thủ đứng ở phần sân đối phương và gần đường biên ngang hơn cả bóng lẫn cầu thủ đối phương thứ hai từ cuối lên (thường là hậu vệ cuối cùng, vì thủ môn tính là một).
- Ngang hàng = không việt vị. Tay và cánh tay không tính.
- Chỉ bị thổi phạt khi tham gia vào tình huống (chơi bóng, cản trở đối phương, hưởng lợi từ vị trí).
- Không việt vị khi nhận bóng trực tiếp từ quả phát bóng lên, ném biên, phạt góc.
- Phạt: đá phạt gián tiếp tại vị trí phạm lỗi.

**Phạm lỗi và kỷ luật**
- Đá phạt trực tiếp: đá, ngáng, xô đẩy, chèn, đánh, phạm lỗi khi tranh bóng, giữ người, cố ý chơi bóng bằng tay. Nếu xảy ra trong vòng cấm của đội phạm lỗi → phạt đền.
- Đá phạt gián tiếp: lối chơi nguy hiểm, cản trở không tiếp xúc, thủ môn bắt bóng bằng tay từ đường chuyền về chủ ý bằng chân hoặc từ quả ném biên của đồng đội.
- Thủ môn giữ bóng trong tay quá 8 giây → đối phương được hưởng phạt góc.
- Phép lợi thế: trọng tài cho chơi tiếp nếu đội bị phạm lỗi đang có cơ hội, vẫn rút thẻ sau khi bóng chết.
- Thẻ vàng: phạm lỗi thiếu thận trọng, phá tấn công triển vọng, phản ứng, câu giờ, không giữ khoảng cách.
- Thẻ đỏ: chơi xấu nghiêm trọng, hành vi bạo lực, ngăn cản cơ hội ghi bàn rõ ràng (DOGSO) bằng lỗi không tranh bóng hoặc bằng tay, thẻ vàng thứ hai. Nếu DOGSO trong vòng cấm mà cầu thủ có ý định tranh bóng → phạt đền + thẻ vàng thay vì đỏ.
- Đội bị đuổi người chơi với 10 người đến hết trận và phải điều chỉnh đội hình. Dưới 7 người → trận đấu bị hủy.

**Tình huống cố định**
- Giao bóng: đầu mỗi hiệp và sau bàn thắng, mọi cầu thủ ở phần sân mình, đối phương cách bóng 9,15 m.
- Đá phạt: hàng rào cách bóng 9,15 m. Khi hàng rào có từ 3 người, cầu thủ đội tấn công phải đứng cách hàng rào ít nhất 1 m.
- Phạt đền: thủ môn ít nhất một chân chạm hoặc ngang vạch vôi khi bóng được sút, các cầu thủ khác ở ngoài vòng cấm và cách chấm phạt 9,15 m.
- Ném biên: hai tay, từ sau đầu, hai chân chạm đất ở trên hoặc ngoài đường biên.
- Phát bóng lên: bóng vào cuộc khi được đá và di chuyển rõ ràng, đồng đội được nhận bóng ngay trong vòng cấm.
- Phạt góc, thả bóng (sau khi trọng tài dừng trận mà không có lỗi).

**Thay người**
- Tối đa 5 người, trong tối đa 3 lần dừng trận (không tính giờ nghỉ giữa hiệp). Thêm 1 người nếu có hiệp phụ.
- Cầu thủ đã ra sân không được vào lại.

**VAR**
- Chỉ can thiệp khi có sai sót rõ ràng ở 4 loại tình huống: bàn thắng, phạt đền, thẻ đỏ trực tiếp, nhầm người.
- Mỗi lần kiểm tra mất 1–3 phút, cộng vào bù giờ.

**Loạt sút luân lưu**
- Mỗi đội 5 lượt luân phiên, dừng sớm nếu một đội không thể đuổi kịp. Hòa sau 5 lượt → đá luân lưu từng cặp.
- Chỉ cầu thủ còn trên sân khi hết giờ được sút. Tỷ lệ thành công thực tế khoảng 70–80%.

## 6. THỐNG KÊ THỰC TẾ CẦN BÁM THEO (cả trận, hai đội cộng lại)
- Bàn thắng: trung bình 2–3 (0 bàn và 5+ bàn đều có thể nhưng hiếm).
- Cú sút: 20–30 (khoảng 1/3 trúng đích). Mỗi bàn thắng phải có cơ hội tương xứng (xG).
- Phạm lỗi: 20–28. Thẻ vàng: 3–5. Thẻ đỏ: 0–1.
- Phạt góc: 8–12. Việt vị: 2–6. Ném biên: 40–50.
- Đường chuyền mỗi đội: 350–650, tỷ lệ chính xác 75–90% tùy phong cách.
- Kết quả không được đoán trước: đội mạnh hơn thắng nhiều hơn nhưng không phải luôn luôn.

## 7. ĐẦU RA CHO MỖI ĐOẠN 15 PHÚT

**a) Tóm tắt** 3–5 câu: diễn biến, đội nào làm chủ, thay đổi chiến thuật.

**b) Nhật ký sự kiện** (JSON), mỗi sự kiện đáng kể một dòng:

```json
{"phut": "23:41", "loai": "sut", "doi": "A", "cau_thu": "A9", "x": 92, "y": 30, "ket_qua": "trung_dich", "xG": 0.18, "ghi_chu": "..."}
```

Các loại sự kiện: giao_bong, chuyen_quyet_dinh, sut, ban_thang, pham_loi, the_vang, the_do, viet_vi, phat_goc, nem_bien, phat_bong, da_phat, phat_den, thay_nguoi, chan_thuong, VAR, doi_so_do, het_hiep.

**c) Khung hình chi tiết** chỉ cho tình huống quan trọng (bàn thắng, phạt đền, thẻ đỏ, cơ hội xG > 0,3): từ 6–10 giây trước đến khi bóng chết, mỗi 0,5 giây:

```json
{"t": 0.0, "bong": {"x": 0, "y": 0, "nguoi_giu": "A10"}, "cau_thu": [{"id": "A1", "vai_tro": "GK", "x": 0, "y": 0}, ...], "su_kien": "..."}
```

## 8. TỰ KIỂM TRA TRƯỚC KHI XUẤT
- Có cầu thủ nào vượt tốc độ tối đa không?
- Mọi tình huống việt vị đã được kiểm tra tại thời điểm chuyền chưa?
- Số người trên sân, số lần thay người, số thẻ có khớp luật không? Cầu thủ đã ra sân có xuất hiện lại không?
- Thống kê tích lũy có đang lệch khỏi mức thực tế ở mục 6 không?

Nếu có lỗi thì sửa trước khi trả kết quả.

## 9. KHỐI TRẠNG THÁI (cuối mỗi đoạn)

```json
{"phut": "30:00", "ty_so": "1-0", "so_do": {"A": "4-3-3", "B": "4-4-2"}, "tren_san": {...}, "the_lua": {"A4": 72, ...}, "the_phat": {"A6": "vang"}, "thay_nguoi_con_lai": {"A": {"nguoi": 5, "lan": 3}, "B": {...}}, "thong_ke": {...}, "bu_gio_tich_luy": "1:30"}
```

## THÔNG TIN TRẬN ĐẤU
- Đội A: [tên, sơ đồ, phong cách, 11 cầu thủ chính + dự bị, điểm mạnh/yếu]
- Đội B: [tương tự]
- Loại trận: [vòng bảng / loại trực tiếp]
- Điều kiện: [thời tiết, sân nhà/sân khách]

## 10. CƠ HỌC CHUYỂN ĐỘNG

**Tăng tốc và giảm tốc**
- Gia tốc khi xuất phát: 4–6 m/s², giảm dần khi gần tốc độ tối đa. Mất khoảng 3–4 giây để đạt tốc độ tối đa từ trạng thái đứng.
- Phanh tối đa: 6–8 m/s². Cầu thủ đang chạy 8 m/s cần khoảng 5 m để dừng hẳn.
- Không có cầu thủ nào đổi từ đứng yên sang 9 m/s, hoặc ngược lại, trong một khung hình.

**Đổi hướng**
- Đổi hướng dưới 45°: giữ được tốc độ.
- Đổi hướng 45–90°: giảm còn khoảng 60% tốc độ.
- Đổi hướng trên 90° hoặc quay người: phải giảm xuống dưới 3 m/s trước.
- Đường chạy tốc độ cao là đường cong, không phải góc gãy.

**Hướng người và tầm nhìn**
- Mỗi cầu thủ có hướng cơ thể (0–360°). Cầu thủ chỉ phản ứng ngay với những gì trong tầm nhìn khoảng 180° phía trước.
- Cầu thủ giỏi "quét" (ngoái nhìn) trước khi nhận bóng, nên nhận bóng mở người được. Cầu thủ không quét phải nhận bóng quay lưng.
- Thời gian phản ứng: 0,2–0,3 giây sau khi bóng được chuyền hoặc đối phương đổi hướng.
- Chạy lùi tối đa 3–4 m/s, chạy ngang 4–5 m/s.

**Bóng**
- Bóng lăn sệt chậm dần do ma sát (khoảng 1–2 m/s² trên sân khô, nhanh hơn trên sân ướt hoặc cỏ dài).
- Bóng bổng theo quỹ đạo parabol, có độ cao z (mét). Cầu thủ chỉ đánh đầu được khi z từ 1,5 đến 2,8 m, chỉ khống chế bằng chân hoặc ngực khi z dưới 1,5 m.
- Thời gian bóng bay phải khớp với khoảng cách và tốc độ.

## 11. DI CHUYỂN KHÔNG BÓNG

Mỗi cầu thủ không cầm bóng luôn có một mục đích. Chọn từ danh sách sau:
- **Chạy chơi sau lưng**: lao vào khoảng trống sau hàng thủ, canh thời điểm để không việt vị.
- **Lùi về nhận bóng**: kéo trung vệ đối phương theo, mở khoảng trống phía sau.
- **Chồng biên (overlap)**: hậu vệ cánh chạy vòng ngoài cầu thủ chạy cánh.
- **Chồng trong (underlap)**: chạy vào hành lang giữa cánh và trung lộ.
- **Người thứ ba**: chạy sẵn để nhận bóng sau pha phối hợp một-hai của hai đồng đội.
- **Chạy nghi binh**: kéo hậu vệ đi để mở khoảng trống cho người khác.
- **Giữ chiều rộng / giữ vị trí**: đứng yên có chủ đích để kéo giãn đội hình đối phương.
- **Bọc lót, che đường chuyền, kèm người, giữ khu vực** (khi phòng ngự).
- **Chạy cắt mặt trước cột gần / chạy vào cột xa** khi có tạt bóng.

## 12. DANH MỤC HÀNH ĐỘNG CÓ BÓNG

**Khống chế**: một chạm hướng về phía trước, khống chế dừng, khống chế bằng ngực/đùi, để bóng chạy qua người.

**Chuyền**: chuyền sệt ngắn, chuyền xuyên tuyến, chuyền bổng dài, đổi cánh, tạt bóng (sớm / từ đường biên ngang / vào cột gần / cột xa), chuyền một chạm, phối hợp một-hai, đánh gót.

**Dẫn bóng và qua người**: dẫn bóng tốc độ (chạm dài), dẫn bóng trong phạm vi hẹp (chạm ngắn), đảo chân, ngoặt bóng, đẩy bóng qua người rồi chạy, che bóng.

**Dứt điểm**: sút căng, sút cuộn má trong, sút chéo góc, đặt lòng, sút xa, vô lê, đánh đầu, đá nảy, lốp bóng qua thủ môn.

**Phòng ngự**: áp sát, chặn đường chuyền, tắc bóng đứng, xoạc bóng, tranh chấp vai, phá bóng, chặn cú sút, không chiến.

**Thủ môn**: bắt bóng, đấm bóng, đẩy bóng ra biên, lao ra khép góc, quét ra ngoài vòng cấm, ra vào bắt bóng bổng, phát bóng nhanh bằng tay hoặc chân.

## 13. RA QUYẾT ĐỊNH

Tại mỗi lần chạm bóng, cầu thủ đánh giá các lựa chọn theo thứ tự:
1. Có cơ hội dứt điểm tốt không (khoảng cách, góc sút, số người cản)?
2. Có đồng đội ở vị trí tốt hơn mà đường chuyền an toàn không?
3. Có khoảng trống để dẫn bóng tiến lên không?
4. Nếu không có gì: giữ bóng, chuyền về hoặc chuyền ngang.

- Áp lực đối phương càng gần (dưới 2 m), thời gian quyết định càng ngắn và chọn lựa càng an toàn.
- Tính cách cầu thủ ảnh hưởng quyết định: cầu thủ sáng tạo mạo hiểm hơn, cầu thủ phòng ngự đơn giản hơn.

## 14. XÁC ĐỊNH KẾT QUẢ HÀNH ĐỘNG

Mỗi cầu thủ có chỉ số 1–100: tốc độ, sức bền, sức mạnh, chuyền, rê bóng, dứt điểm, đánh đầu, phòng ngự, tầm nhìn, bình tĩnh (thủ môn thêm: phản xạ, bắt bóng, chọn vị trí).

Xác suất thành công phụ thuộc:
- Chỉ số liên quan của người thực hiện so với người đối đầu.
- Áp lực: có đối phương trong bán kính 2 m thì giảm 15–30%.
- Độ khó: chuyền 40 m khó hơn 10 m, sút chân không thuận khó hơn chân thuận, bóng bổng khó hơn bóng sệt.
- Thể lực hiện tại (mục 4).

Tham khảo tỷ lệ thực tế: chuyền ngắn không áp lực 90–95%, chuyền dài 50–65%, qua người 1-1 khoảng 45–55%, tắc bóng thành công 60–70%, tạt bóng thành công 20–30%.

## 15. ĐỊNH DẠNG KHUNG HÌNH CHI TIẾT (thay cho mục 7c)

```json
{
  "t": 0.0,
  "bong": {"x": 0, "y": 0, "z": 0, "vx": 0, "vy": 0, "vz": 0, "nguoi_giu": "A10"},
  "cau_thu": [
    {
      "id": "A10",
      "x": 0, "y": 0,
      "huong_nguoi": 90,
      "toc_do": 5.2,
      "trang_thai": "dan_bong",
      "hanh_dong": "dao_chan",
      "muc_dich": "tim khoang trong de chuyen xuyen tuyen cho A9"
    }
  ],
  "su_kien": "..."
}
```

Giá trị `trang_thai`: dung_yen, di_bo, chay, nuoc_rut, giam_toc, quay_nguoi, nhay, nga, dan_bong, chuyen, sut, tac_bong, danh_dau, bat_bong.

Bổ sung vào phần tự kiểm tra:
- Gia tốc giữa hai khung hình có vượt 6 m/s² (tăng) hoặc 8 m/s² (giảm) không?
- Có cầu thủ nào đổi hướng gắt ở tốc độ cao không?
- Đánh đầu có đúng với độ cao z của bóng không?
- Mọi cầu thủ không cầm bóng đều có "muc_dich" hợp lý chưa?

## 16. NHỊP TRẬN ĐẤU THẬT
- Thời gian bóng thực sự lăn chỉ khoảng 55–60 phút trên 90 phút. Phần còn lại là bóng chết.
- Thời gian thực hiện tình huống cố định: ném biên 8–15 giây, phát bóng lên 10–20 giây, phạt góc 20–40 giây, đá phạt gần vòng cấm 40–90 giây, ăn mừng bàn thắng 40–70 giây.
- Đội đang dẫn bàn ở cuối trận kéo dài các tình huống này thêm 30–50%.
- Cường độ không đều: có những giai đoạn một đội ép sân liên tục 5–10 phút, xen kẽ những giai đoạn hai đội chuyền bóng chậm ở giữa sân.
- Sau bàn thắng, đội vừa thủng lưới thường dâng cao hơn trong 5–10 phút tiếp theo.

## 17. PHÂN BỔ CƯỜNG ĐỘ CHẠY

Một cầu thủ thật không chạy liên tục. Phân bổ thời gian cả trận:
- Đứng yên và đi bộ: 35–45%
- Chạy chậm: 35–45%
- Chạy nhanh: 10–15%
- Nước rút: 2–5% (khoảng 20–40 pha nước rút mỗi trận, phần lớn ngắn dưới 20 m)

Hành vi theo khoảng cách tới bóng:
- Bóng cách trên 40 m: đi bộ hoặc chạy chậm để điều chỉnh vị trí.
- Bóng cách 20–40 m: chạy chậm, sẵn sàng tăng tốc.
- Bóng cách dưới 20 m hoặc tình huống chuyển trạng thái: chạy nhanh, nước rút.
- Sau một pha nước rút, cầu thủ cần 10–30 giây cường độ thấp để hồi phục.
- Tiền đạo thường không lùi hết về phòng ngự. Sau pha tấn công thất bại, cầu thủ chạy chậm về vị trí chứ không nước rút.

## 18. SỰ KHÔNG HOÀN HẢO

Đội hình hoàn hảo trông giả. Phải có:
- Hàng thủ lệch nhau 1–3 m, không thẳng tuyệt đối.
- Khoảng cách giữa các cầu thủ dao động, đôi khi có lỗ hổng do một người lên muộn.
- Đường chuyền không trúng chân hoàn hảo: người nhận phải điều chỉnh 0,5–2 m.
- Khống chế hỏng khoảng 5–10% số lần nhận bóng, bóng bật ra 1–3 m.
- Cú sút trúng đích không phải lúc nào cũng vào góc: phần lớn đi về giữa khung thành hoặc sát thủ môn.
- Sai lầm cá nhân dẫn đến bàn thua có thể xảy ra (chuyền về hụt, thủ môn bắt dính bóng hỏng), nhưng hiếm.
- Trọng tài cũng sai: bỏ qua một số lỗi nhỏ, thổi phạt một số pha tiếp xúc nhẹ.

## 19. HÀNH VI NGOÀI BÓNG
- Cầu thủ chỉ tay, ra hiệu cho đồng đội dâng lên hoặc kèm người.
- Hậu vệ giơ tay xin việt vị khi đối phương chạy chơi sau lưng.
- Cầu thủ phản ứng với trọng tài sau quyết định gây tranh cãi (theo luật hiện hành, chỉ đội trưởng được tiếp cận trọng tài).
- Cầu thủ bị phạm lỗi nằm sân 5–30 giây, có thể cần đội y tế vào sân.
- Thay người: cầu thủ rời sân ở điểm gần nhất trên đường biên, cầu thủ vào sân ở đường giữa sân.
- Ăn mừng bàn thắng: người ghi bàn chạy về phía góc sân hoặc khán đài, đồng đội tụ lại, sau đó cả đội về phần sân mình.
- Thủ môn la hét chỉ đạo hàng thủ, đặc biệt trong tình huống cố định.

## 20. TÌNH HUỐNG CỐ ĐỊNH CHI TIẾT

**Phạt góc phòng ngự**: chọn kèm khu vực (4–6 người đứng thành hàng ở vạch 5,5 m và chấm phạt đền), kèm người, hoặc kết hợp. Thường có 1 người ở cột gần, 1–2 người ở rìa vòng cấm chờ bóng bật ra, 1–2 người ở lại phía trên để phản công.

**Phạt góc tấn công**: các phương án tạt vào cột gần (có người đánh đầu chuyển hướng), cột xa, tạt vào giữa, phạt góc ngắn. Cầu thủ to cao (thường là trung vệ) lên tham gia. Cầu thủ chạy chỗ bắt đầu khi người đá phạt chạy đà.

**Đá phạt gần vòng cấm**: hàng rào 3–5 người tùy góc độ, có thể có 1 người nằm sau hàng rào. 1–2 cầu thủ đứng cạnh bóng để đánh lừa.

**Ném biên gần vòng cấm**: có đội ném biên dài như một quả tạt.

## 21. TRỌNG TÀI VÀ NGOẠI CẢNH
- Trọng tài chính: di chuyển theo đường chéo sân, cách bóng 15–25 m, không cản đường chuyền.
- Hai trợ lý trọng tài: mỗi người phụ trách nửa sân dọc một đường biên, luôn ngang hàng với hậu vệ cuối cùng để bắt việt vị.
- Thêm trọng tài và trợ lý vào khung hình với id "REF", "AR1", "AR2".
- Thời tiết: mưa làm bóng lăn nhanh và trơn hơn, tăng lỗi khống chế. Gió ảnh hưởng bóng bổng dài. Nắng nóng làm thể lực giảm nhanh hơn 10–20%.
- Sân nhà: đội chủ nhà có lợi thế nhẹ (tinh thần, trọng tài dễ thổi phạt cho chủ nhà hơn một chút).

Bổ sung vào phần tự kiểm tra:
- Phân bổ cường độ chạy có khớp mục 17 không, hay cầu thủ đang chạy quá nhiều?
- Đội hình có trông quá hoàn hảo không?
- Thời gian bóng chết có hợp lý không?
