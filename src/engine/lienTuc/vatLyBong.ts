import type { LoaiHanhDong } from '../chuoiBong'
import { TRAN_TOC_DO_TUYET_DOI, type Diem } from './coHoc'

/*
  ====================================================================
  VẬT LÝ QUẢ BÓNG (T720, AC-38.6, quyết định D129).
  ====================================================================

  Trước lát này quả bóng đi **như một người**: ô 25 của lô mốc bước qua chính
  `buocCoHoc` với một trần tạm 25 m/s, mà `buocCoHoc` lại kẹp lại
  `TRAN_TOC_DO_TUYET_DOI` = 9 m/s. Đo T716 đọc ra tốc độ bóng lớn nhất **đúng
  9,00 m/s** — tức một đường chuyền dài bay chậm hơn người chạy, và cả AC-38.6
  không có một đường nào dựng nó.

  Module này là **hàm thuần, không một lần rút**, và nó **chưa được nối** vào
  vòng phút: T720 chỉ khai báo các file của chính nó. Mối nối là việc của lát
  sau, đúng cách `coHoc.ts` đã sống bốn lát trước khi T725 nối.

  ⚠️ **BA QUYẾT ĐỊNH CỦA LÁT NÀY, và lý do loại phương án khác.**

  **1. `tocDoDuongBong` là tốc độ NGANG, không phải tốc độ dọc theo quỹ đạo.**
  Quả bóng bổng có thêm thành phần thẳng đứng, và thành phần ấy **không** làm
  thay đổi tốc độ ngang. Nhờ thế `thoiGianBay = d / v` đúng **theo định nghĩa**
  với MỌI góc phát — đúng điều AC-38.6 đòi ("thời gian bay phải khớp khoảng
  cách chia tốc độ").
  *Phương án bị loại:* lấy `v` làm tốc độ dọc theo quỹ đạo. Lúc ấy tốc độ ngang
  là `v·cos(góc)` nên thời gian bay thành `d / (v·cos góc)`, và AC-38.6 chỉ còn
  đúng **gần đúng** ở các quả tạt — tức một AC tuyệt đối biến thành một AC có
  sai số, mà chẳng đổi lấy thứ gì.

  **2. Quỹ đạo tính bằng CÔNG THỨC ĐÓNG, không tích phân từng bước.**
  `bongTaiThoiDiem(phat, t)` nhận thời điểm và trả trạng thái, nên lấy mốc nào
  cũng **không tích luỹ sai số**.
  *Phương án bị loại:* một `buocBayBong(truoc, dt)` kiểu Euler như `buocCoHoc`.
  Hai lý do: (a) `loMoc.ts` đã dặn thẳng rằng engine **không bao giờ đọc lại
  vận tốc từ lô** vì lô là `Float32Array` — tích phân từng bước qua 11.400 bước
  một trận là đúng thứ nó cảnh báo; (b) `zKhiToi` của **T721** phải **chọn** góc
  phát để độ cao lúc tới nằm trong [1,5; 2,8] m, và việc chọn ấy cần một công
  thức giải được, không phải một vòng lặp dò.

  **3. `re-bong` KHÔNG phải một quả bóng được đánh đi.** Nó là quả bóng trong
  chân người dẫn, nên tốc độ của nó là tốc độ của NGƯỜI, và dải 12–30 m/s của
  AC-38.6 không nói về nó. Con số trả về vì thế **lấy lại**
  `TRAN_TOC_DO_TUYET_DOI` của `coHoc.ts` chứ không gõ số 9 lần thứ hai.
*/

/** Gia tốc trọng trường, m/s². */
export const G_TRONG_TRUONG = 9.81

/**
 * Quãng chia đôi chuyền NGẮN và chuyền DÀI, mét — con số của D129.
 *
 * Quyết bằng **quãng mét thật** giữa hai người chứ không bằng cặp vùng: một dải
 * vùng sâu 26,25 m không nói được hai người cách nhau bao xa, còn mét thì nói.
 */
export const NGUONG_CHUYEN_DAI = 25

/** Đáy và đỉnh dải chuyền NGẮN, m/s — hai con số của AC-38.6. */
export const TOC_DO_CHUYEN_NGAN_THAP = 12
export const TOC_DO_CHUYEN_NGAN_CAO = 20

/** Đáy và đỉnh dải chuyền DÀI và sút, m/s — hai con số còn lại của AC-38.6. */
export const TOC_DO_CHUYEN_DAI_THAP = 20
export const TOC_DO_CHUYEN_DAI_CAO = 30

/**
 * Quãng mà một đường chuyền đạt đỉnh dải, mét.
 *
 * 60 m chứ không phải đường chéo sân (125,1 m): một quả phát bóng 60 m đã là
 * quả dài nhất người ta đánh **hết lực**, nên xa hơn nữa cũng không nhanh hơn.
 * Lấy đường chéo thì một quả 60 m chỉ ra 23,5 m/s — chậm hơn thực tế.
 */
export const QUANG_CHUYEN_DAI_NHAT = 60

/**
 * Quãng mà một cú sút đạt đỉnh dải, mét.
 *
 * Ngắn hơn của chuyền, vì một cú sút 30 m **là** cú sút hết lực; còn một cú
 * đệm trong vòng 5,5 m thì không ai đánh 30 m/s.
 */
export const QUANG_SUT_MANH_NHAT = 30

/** Quả bóng trên không: sáu số đầu của một ô lô mốc, không `huong`/`coMat`. */
export interface TrangThaiBayBong {
  readonly x: number
  readonly y: number
  readonly z: number
  readonly vx: number
  readonly vy: number
  readonly vz: number
}

/** Nội suy tuyến tính, phần đã kẹp vào [0; 1]. */
function noiSuy(thap: number, cao: number, phan: number): number {
  return thap + (cao - thap) * Math.min(1, Math.max(0, phan))
}

/**
 * Tốc độ NGANG của đường bóng, m/s — mệnh đề thứ nhất của AC-38.6.
 *
 * Hai dải, chia bằng `NGUONG_CHUYEN_DAI`, và **liền nhau ở chỗ chia**: đỉnh dải
 * ngắn bằng đáy dải dài (cùng 20 m/s), nên một đường chuyền 24,9 m và một đường
 * 25,1 m không chênh nhau một bước nhảy. Cú sút **luôn** ở dải dài, kể cả cú
 * đệm gần — AC-38.6 xếp "chuyền dài **và sút**" vào cùng một dải.
 */
export function tocDoDuongBong(quangMet: number, loai: LoaiHanhDong): number {
  // Quả bóng trong chân người dẫn: tốc độ của NGƯỜI, không của một cú đánh.
  if (loai === 're-bong') return TRAN_TOC_DO_TUYET_DOI

  const quang = Math.max(0, quangMet)
  if (loai !== 'sut' && quang < NGUONG_CHUYEN_DAI) {
    return noiSuy(
      TOC_DO_CHUYEN_NGAN_THAP,
      TOC_DO_CHUYEN_NGAN_CAO,
      quang / NGUONG_CHUYEN_DAI,
    )
  }

  const phan =
    loai === 'sut'
      ? quang / QUANG_SUT_MANH_NHAT
      : (quang - NGUONG_CHUYEN_DAI) /
        (QUANG_CHUYEN_DAI_NHAT - NGUONG_CHUYEN_DAI)
  return noiSuy(TOC_DO_CHUYEN_DAI_THAP, TOC_DO_CHUYEN_DAI_CAO, phan)
}

/**
 * Thời gian bay, giây — mệnh đề thứ hai của AC-38.6, và nó là **định nghĩa**.
 *
 * `tocDo` là tốc độ NGANG (xem quyết định 1 ở đầu file), nên phép chia này đúng
 * với mọi góc phát chứ không chỉ với đường sệt. `tocDo` luôn dương vì nó đến từ
 * `tocDoDuongBong`, và hàm ấy không trả gì nhỏ hơn `TRAN_TOC_DO_TUYET_DOI`.
 */
export function thoiGianBay(quangMet: number, tocDo: number): number {
  return quangMet / tocDo
}

/**
 * Trạng thái quả bóng lúc **rời chân**, nhắm tới `den`.
 *
 * `gocPhat` tính bằng **độ**, 0 là đường sệt. Thành phần thẳng đứng dẫn xuất từ
 * tốc độ NGANG: `vz = v · tan(góc)` — nhờ thế tốc độ ngang giữ đúng `v` và
 * `thoiGianBay` không đổi theo góc. T721 là chỗ **chọn** góc ấy cho quả tạt.
 */
export function phatBong(
  tu: Diem,
  den: Diem,
  loai: LoaiHanhDong,
  gocPhat = 0,
): TrangThaiBayBong {
  const dx = den.x - tu.x
  const dy = den.y - tu.y
  const quang = Math.hypot(dx, dy)
  const v = tocDoDuongBong(quang, loai)
  /*
    Quãng 0 thì không có hướng nào để chuẩn hoá — chia cho 0 ở đây là chỗ sinh
    `NaN` rồi lan ra toàn bộ lô mốc.
  */
  const huongX = quang === 0 ? 0 : dx / quang
  const huongY = quang === 0 ? 0 : dy / quang
  return {
    x: tu.x,
    y: tu.y,
    z: 0,
    vx: huongX * v,
    vy: huongY * v,
    vz: v * Math.tan((gocPhat * Math.PI) / 180),
  }
}

/**
 * Giây mà quả bóng **chạm đất**, giải từ `z(t) = 0`.
 *
 * Nghiệm dương của `z0 + vz·t − g·t²/2 = 0`. Đường **sệt** (z0 = 0, vz = 0) cho
 * đúng `0` — tức nó đã ở trên mặt đất ngay từ lúc rời chân, và đó là chỗ `z ≡ 0`
 * của AC-38.5 đúng **theo cấu trúc** chứ không nhờ một phép so sánh nào.
 */
export function giayChamDat(phat: TrangThaiBayBong): number {
  const duoiCan = phat.vz * phat.vz + 2 * G_TRONG_TRUONG * phat.z
  return (phat.vz + Math.sqrt(Math.max(0, duoiCan))) / G_TRONG_TRUONG
}

/**
 * Trạng thái quả bóng ở giây thứ `t` sau khi rời chân — **công thức đóng**.
 *
 * Không tích luỹ sai số, nên lấy mốc nào cũng ra cùng một số, và mốc dày của
 * T731 không lệch so với mốc thường.
 *
 * ⚠️ **Mặt đất là một SÀN, không phải một gợi ý.** Bản đầu để công thức parabol
 * chạy tự do, và một đường chuyền sệt (góc phát 0) **tụt xuống dưới mặt sân**
 * ngay ở mốc đầu: z = −0,049 m ở giây 0,1. AC-38.5 đòi `chuyen` và `re-bong` có
 * `z ≡ 0`, nên quả bóng sệt phải **nằm trên** mặt đất chứ không rơi xuyên qua
 * nó — trọng lực không kéo nổi một quả bóng đang lăn.
 *
 * Phép kẹp này **không phá tính nửa nhóm**: sau khi chạm đất, trạng thái là
 * `z = 0, vz = 0`, và `giayChamDat` của chính nó lại ra 0, nên mọi bước sau đều
 * giữ `z = 0`. Chia một bước dài thành bao nhiêu bước ngắn cũng ra cùng số, kể
 * cả bước **băng qua** đúng lúc chạm đất.
 *
 * Sau khi chạm đất quả bóng **giữ nguyên tốc độ ngang**: ma sát lăn sệt là
 * AC-38.7, và nó thuộc **T723** cùng với bảng `MA_SAT_LAN_SET` của `dieuKien.ts`.
 * Cũng **không có nảy** — không AC nào của spec 007 đòi quả bóng nảy lên.
 */
export function bongTaiThoiDiem(
  phat: TrangThaiBayBong,
  t: number,
): TrangThaiBayBong {
  const tDat = giayChamDat(phat)
  const tBay = Math.min(t, tDat)
  const daDat = t >= tDat
  return {
    x: phat.x + phat.vx * t,
    y: phat.y + phat.vy * t,
    z: daDat
      ? 0
      : phat.z + phat.vz * tBay - (G_TRONG_TRUONG * tBay * tBay) / 2,
    vx: phat.vx,
    vy: phat.vy,
    vz: daDat ? 0 : phat.vz - G_TRONG_TRUONG * t,
  }
}
