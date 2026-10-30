# Đo hai ngân sách hiển thị (T035)

> Việc này **phải làm trong trình duyệt thật của bạn**, không làm hộ được từ
> môi trường của Claude: khung Browser trong ứng dụng Claude bị ẩn thì trình
> duyệt không vẽ trang, nên `first-contentful-paint` và
> `largest-contentful-paint` hoặc trả về rỗng, hoặc trả về thời điểm khung
> được hiện lên (đo thật: **152.440ms**) chứ không phải thời điểm trang vẽ
> xong. Mọi phần KHÔNG dính tới việc vẽ thì đã đo xong, xem T035 trong
> `tasks.md`.

Hai con số cần lấy, theo spec mục 6:

| # | Đo cái gì | Ngân sách |
|---|---|---|
| 1 | Mở ứng dụng với trọn bộ dữ liệu | dưới **2 giây** |
| 2 | Danh sách **30 cầu thủ** của một đội hiện đầy đủ | dưới **300ms** |

---

## Chuẩn bị

**1. Chạy BẢN BUILD, không phải `npm run dev`.** Bản dev biên dịch từng module
lúc chạy nên số bị thổi lên — đo thật: `loadEventEnd` **381ms** ở bản dev so
với **87ms** ở bản build, chênh khoảng 4 lần. Ngân sách của spec nói về thứ
người dùng thật sự mở.

```
npm run build
npx vite preview --port 5173
```

Dùng đúng cổng mà dữ liệu của bạn đang nằm. IndexedDB tách theo **origin**,
nên bản build chạy ở `localhost:5173` thấy đúng dữ liệu mà bạn vẫn dùng ở
`localhost:5173`; đổi sang cổng khác là một kho dữ liệu rỗng khác.

**2. Dựng một đội 30 cầu thủ.** Ngân sách số 2 viết cho **30**, mà các đội
thử hiện có mỗi đội 18 người. Đo với 18 vẫn ra một con số, nhưng đó là cận
dưới, không đóng được task.

**3. Mở `localhost:5173` trong trình duyệt của bạn**, rồi F12 → tab Console.

---

## Đoạn 1 — mở ứng dụng

Tải lại trang (Ctrl+R), chờ danh sách đội hiện ra, rồi dán:

```js
const nav = performance.getEntriesByType('navigation')[0]
const fcp = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')
let lcp = null
await new Promise(res => { new PerformanceObserver(l => { const e = l.getEntries(); lcp = e[e.length - 1].startTime; res() }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(res, 1000) })
console.table({ 'DOM sẵn sàng': Math.round(nav.domContentLoadedEventEnd), 'Tải xong': Math.round(nav.loadEventEnd), 'Vẽ nội dung đầu (FCP)': Math.round(fcp?.startTime ?? -1), 'Khối lớn nhất (LCP)': Math.round(lcp ?? -1) })
```

Con số đối chiếu với ngân sách 2 giây là **LCP** — lúc khối nội dung lớn nhất
(danh sách đội) hiện xong. Cả bốn số đều do trình duyệt tự ghi, nên không phụ
thuộc vào lúc bạn dán đoạn này.

## Đoạn 2 — danh sách cầu thủ

Đứng ở màn hình danh sách đội, sửa tên đội ở dòng đầu cho khớp đội 30 người
rồi dán:

```js
const TEN_DOI = 'Đội 30 người'
const li = [...document.querySelectorAll('li')].find(x => x.innerText.includes(TEN_DOI))
const nut = [...li.querySelectorAll('button')].find(b => b.textContent.trim() === 'Mở đội')
const t0 = performance.now()
nut.click()
let hang = 0
for (let i = 0; i < 300; i++) { await new Promise(r => setTimeout(r, 4)); hang = document.querySelectorAll('main tbody tr').length; if (hang >= 30) break }
const tDom = performance.now() - t0
await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
console.table({ 'Số hàng': hang, 'DOM dựng xong (ms)': Math.round(tDom), 'Vẽ xong (ms)': Math.round(performance.now() - t0) })
```

Con số đối chiếu với 300ms là **"Vẽ xong"**. Hai `requestAnimationFrame` lồng
nhau là chỗ mấu chốt: nó đợi qua đúng khung hình chứa lần vẽ, nên bạn đo tới
lúc **nhìn thấy** chứ không chỉ tới lúc DOM có đủ hàng.

---

## Ba cái bẫy đã làm hỏng số đo

1. **Tab phải đang hiển thị.** Trình duyệt không vẽ trang nền — đây đúng là
   lý do môi trường của Claude không đo được. Đừng bấm sang tab khác giữa
   chừng.
2. **Đo lần tải thứ hai trở đi**, hoặc tải lại vài lần rồi lấy số nhỏ nhất.
   Lần đầu còn tính thời gian đọc tài nguyên từ đĩa.
3. **Tắt tiện ích mở rộng** (cửa sổ ẩn danh là nhanh nhất). React DevTools và
   các tiện ích khác cộng thêm vào mọi lần vẽ.

---

## Lấy số xong thì ghi vào đâu

Ghi thẳng vào mục **T035** trong `tasks.md`: hai con số, kèm **cấu hình đã
đo** (bản build hay dev, bao nhiêu đội, mỗi đội bao nhiêu cầu thủ, có ảnh
không) và ngày đo. Không có cấu hình đi kèm thì con số vô nghĩa — nhanh ở 1
đội không nói gì về 20 đội.

Nếu một trong hai vượt ngân sách, **đừng vội kết luận là hỏng**: ngân sách
của spec gắn với mốc 20 đội × 30 cầu thủ. Chậm ở một bộ dữ liệu lớn hơn mốc
đó là chuyện khác hẳn với chậm ở đúng mốc.
