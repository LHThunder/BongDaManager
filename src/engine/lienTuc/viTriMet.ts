import type { PositionId } from '../../domain/types'
import { DAI_SAN, RONG_SAN, trongSan, type BenSan } from '../hinhHocSan'
import { vungCuaViTri, type VungSan } from '../vung'
import type { Diem } from './coHoc'

/*
  Quy lưới 12 vùng ra toạ độ MÉT (T725).

  Engine v6 nghĩ bằng **vùng**: 3 cột × 4 dải, và chú thích đầu `vung.ts` nói
  thẳng vì sao — mô phỏng toạ độ liên tục là "một bài toán lớn hơn nhiều và
  không AC nào đòi" **ở thời điểm ấy**. Spec 007 đòi, nên phải có một chỗ nối
  hai cách nghĩ: vùng là thứ v6 quyết, mét là thứ chế độ liên tục vẽ.

  ⚠️ **MÔ HÌNH ĐÍCH Ở ĐÂY LÀ TỐI THIỂU CÓ CHỦ Ý.** Spec 007 không có AC nào đòi
  hình khối đội hình: AC-38.x đều là trần cơ học, AC-37.6 là ai giữ bóng. Khối
  phòng ngự 30–40 m, hai tuyến cách 10–15 m, pressing và lùi khối là **US-40
  của spec 009** — làm chúng ở đây là lấn phạm vi và sẽ phải gỡ khi 009 tới.
  Thứ file này làm là đủ để chuyển động **có thật và đo được**, không hơn.
*/

/**
 * Tâm bốn dải, theo tỉ lệ chiều dài sân, tính từ khung thành của **chính đội**.
 *
 * Dải 0 là sân nhà của đội ấy, dải 3 là vòng cấm đối phương — đúng quy ước mà
 * `vung.ts` đặt. Bốn số không chia đều: hai dải giữa rộng hơn hai dải đầu, vì
 * dải 0 và dải 3 là vùng cấm địa, nơi người ta đứng sát khung thành hơn.
 */
export const TI_LE_DAI_MET: readonly [number, number, number, number] = [
  0.1, 0.35, 0.65, 0.9,
]

/** Tâm ba cột, theo tỉ lệ chiều rộng sân. */
export const TI_LE_COT_MET: Readonly<Record<VungSan['cot'], number>> = {
  trai: 0.22,
  giua: 0.5,
  phai: 0.78,
}

/**
 * Tâm một vùng, tính bằng **mét**, theo hướng tấn công của `ben`.
 *
 * `'nha'` giữ khung thành ở `x = 0`, nên dải 0 của họ nằm ở `x` nhỏ. `'khach'`
 * giữ khung thành ở `x = DAI_SAN`, nên dải của họ lật lại.
 */
export function tamVungMet(vung: VungSan, ben: BenSan): Diem {
  const tiDai = TI_LE_DAI_MET[vung.dai]
  const x = ben === 'nha' ? tiDai * DAI_SAN : (1 - tiDai) * DAI_SAN
  return { x, y: TI_LE_COT_MET[vung.cot] * RONG_SAN }
}

/** Chỗ đứng theo sơ đồ của một ô chiến thuật, tính bằng mét. */
export function choDungMet(viTriO: PositionId, ben: BenSan): Diem {
  return tamVungMet(vungCuaViTri(viTriO), ben)
}

/**
 * Phần khoảng cách mà một người **không** cầm bóng dịch về phía bóng.
 *
 * ⚠️ Đây là **sàn tối thiểu**, không phải một mô hình chiến thuật. Nó tồn tại
 * để chuyển động có thật — không có nó thì 20 trong 22 người đứng im cả trận và
 * cả lớp cơ học của Phase 54 không bao giờ bị thử. Hình khối thật là **US-40
 * của spec 009**, và lúc ấy hằng số này được thay chứ không được cộng thêm.
 */
export const PHAN_DICH_THEO_BONG = 0.25

/*
  ====================================================================
  MỘT HỆ SỐ CHO CẢ HAI MƯƠI HAI NGƯỜI LÀ MỘT KHỐI CỨNG (T815).
  ====================================================================

  🧮 **Đây không phải phép đo, đây là ĐẠI SỐ.** Với một hệ số `p` duy nhất:

      đích_i = chỗ_i + p · (bóng − chỗ_i) = (1 − p)·chỗ_i + p·bóng

  nên giữa hai mốc liên tiếp:

      Δđích_i = p · Δbóng,   **giống hệt nhau với mọi i**

  Hai mươi hai vectơ dịch chuyển **bằng nhau từng số**. Trường đích không chỉ
  *trông như* một khối — nó **là** một phép tịnh tiến cứng, chứng minh được bằng
  hai dòng, không cần đo. Đó chính là chữ *"dính liền đến nhau"* của người dùng
  ở `T760`.

  📐 **Thước đo đã chốt cho T815** (thay cho thước đo cũ đã bị rút lại vì nó lấy
  tán xạ của một lỗi khác làm mẫu số):

  1. **Độ tản mạn của trường đích** — lệch chuẩn của 22 vectơ `Δđích` chia cho
     độ dài trung bình. Mô hình một-hệ-số cho **đúng 0**, mọi mốc, mọi trận.
  2. **Số ô lưới** — trung bình số giá trị `x` khác nhau (làm tròn 0,5 m) trong
     22 vị trí, và số giá trị `y`. Đo trên 5 mã trận, 30.240 mốc, trước T815:
     **9,15 / 22** theo `x` và **5,56 / 22** theo `y`. Tức quá nửa số người
     đứng chung toạ độ với một người khác — cái lưới ô vuông nhìn thấy trên
     bản chạy.

  ⛔ **Và đây vẫn KHÔNG phải mô hình chiến thuật của spec 009.** Chú thích đầu
  file rào khối phòng ngự, hai tuyến, pressing cho **US-40**. Thứ dưới đây
  không thêm vai trò, không đọc chỉ số, không nhìn pha bóng: nó chỉ nói rằng
  **một hằng số cho 22 người là một giả định, không phải một sự thật**, và thay
  hằng số ấy bằng một dải **có trung bình đúng bằng nó**.

  📊 **KẾT QUẢ, và biên độ được chọn từ một đường đánh đổi chứ không từ cảm
  tính.** Giãn dải rộng ra thì lưới vỡ tốt hơn, nhưng người bắt đầu đè nhau trở
  lại — vì hai người hệ số khác nhau thì chỗ đứng của họ trượt qua nhau. Đo
  trên 5 mã, 30.240 mốc:

  | biên độ | lưới `x` | lưới `y` | cặp đè | mốc có cặp đè |
  |---|---|---|---|---|
  | **0** *(trước T815)* | 9,15 | 5,56 | 0,041% | **8,8%** |
  | 0,04 | 18,49 | 9,52 | 0,041% | 8,9% |
  | **0,06** ← chọn | **18,85** | **9,97** | **0,041%** | **9,0%** |
  | 0,08 | 19,16 | 10,10 | 0,047% | 10,1% |
  | 0,10 | 19,73 | 10,18 | 0,077% | **16,2%** |

  `0,06` lấy **gần hết** phần lưới vỡ được mà **không** mất một phần nghìn nào
  của `T814`: 9,0% so với 8,8%. `0,10` đổi thêm 0,9 giá trị `x` lấy **16,2%** —
  gần gấp đôi, và nó đẩy phép đo trở lại đúng vùng chông chênh quanh ngưỡng 20%
  mà bản giãn 3,5 m đã mắc. Đường cong có một **khuỷu rõ** ở 0,06–0,08.

  🧮 **Độ tản mạn của trường đích sau T815 cũng là đại số, không phải phép đo:**
  `Δđích_i = p_i · Δbóng`, nên lệch chuẩn chia trung bình của 22 vectơ **đúng
  bằng hệ số biến thiên của dãy `p`** — `0` trước, **`0,1434`** sau. Một con số
  đóng, kiểm được bằng số học, không phụ thuộc mẫu trận nào.

  ⚠️ **Thứ T815 KHÔNG chữa, và phải nói ra:** 22 vectơ dịch chuyển vẫn **song
  song** với nhau — chỉ khác độ dài. Đội hình nay **co giãn** theo bóng thay vì
  **trượt cứng**, nhưng không ai đi hướng riêng của mình. Hướng riêng cần độ trễ
  phản ứng hoặc vai trò, và cả hai đều là **US-40 của spec 009**.
*/

/** Biên độ của dải hệ số bám bóng, quanh `PHAN_DICH_THEO_BONG`. */
export const BIEN_DO_PHAN_DICH = 0.06

/** Tỉ lệ vàng — dùng để rải 11 ô đều trên đoạn `[0, 1)` mà không cần bảng tra. */
const TI_LE_VANG = 0.6180339887498949

/** Số ô trong một đội hình. */
const SO_O = 11

/**
 * Trung bình của `frac(o · φ)` trên 11 ô — tính ra chứ không viết tay.
 *
 * ⚠️ Không có nó thì dải lệch tâm: dãy thô có trung bình **0,4538**, không phải
 * 0,5, nên hệ số trung bình sẽ tụt còn **0,2408** và **cả hai đội lùi sâu hơn**
 * so với trước T815. Trừ đi đúng con số này giữ lời hứa quan trọng nhất của
 * task: **trung bình không đổi**, chỉ có tản mạn là mới.
 */
const TRUNG_BINH_PHAN: number = (() => {
  let tong = 0
  for (let o = 0; o < SO_O; o += 1) tong += (o * TI_LE_VANG) % 1
  return tong / SO_O
})()

/**
 * Hệ số bám bóng của **ô thứ `o`** trong đội hình, `o` lấy theo mod 11.
 *
 * ⚠️ **Dãy này KHÔNG mang một nghĩa chiến thuật nào, và đó là chủ ý.** Nó là
 * một dãy tỉ-lệ-vàng: rải đều, tất định, không cần bảng tra, không tiêu một
 * lần rút ngẫu nhiên nào (tiêu một lần rút là đổi **dòng sự kiện**, vỡ P1/P2).
 * Ai bám nhiều hơn ai là **chưa có ai quyết** — đó là việc của **US-40 spec
 * 009**, và khi ấy hàm này bị **thay**, không phải cộng thêm.
 *
 * 📌 Một trùng hợp đáng ghi: ô 0 là **thủ môn** và nhận hệ số **thấp nhất**
 * (0,159). Tôi không thiết kế điều đó — `frac(0 · φ) = 0` nên ô 0 luôn ở đáy
 * dải. Nêu ra để không ai đọc ngược thành một lập luận bóng đá.
 *
 * Hai đội dùng **cùng** dãy (`o % 11`), nên không bên nào được lợi.
 */
export function phanDichCuaO(o: number): number {
  const f = ((o % SO_O) * TI_LE_VANG) % 1
  return PHAN_DICH_THEO_BONG + (f - TRUNG_BINH_PHAN) * 2 * BIEN_DO_PHAN_DICH
}

/**
 * Đích của một người **không** cầm bóng: chỗ đứng theo sơ đồ, dịch một phần về
 * phía bóng.
 *
 * Dịch **theo tỉ lệ khoảng cách**, nên người đứng đúng chỗ bóng không dịch một
 * mét nào — cùng lý lẽ đã giữ AC-30.5 ở lớp vẽ: một lực kéo **đều tay** sẽ dồn
 * mọi người lại một chỗ, còn lực kéo tỉ lệ thì không.
 *
 * `phan` mặc định là `PHAN_DICH_THEO_BONG` để mọi nơi gọi cũ giữ nguyên nghĩa;
 * đường chạy thật truyền `phanDichCuaO(o)` (T815).
 */
export function dichNguoiKhongBong(
  choDung: Diem,
  bong: Diem,
  phan: number = PHAN_DICH_THEO_BONG,
): Diem {
  return {
    x: choDung.x + (bong.x - choDung.x) * phan,
    y: choDung.y + (bong.y - choDung.y) * phan,
  }
}

/*
  ====================================================================
  HAI NGƯỜI KHÔNG ĐƯỢC CÙNG MỘT ĐIỂM ĐÍCH (T814).
  ====================================================================

  🐞 **Lưới 12 vùng chỉ cho 8 điểm đích cho 22 người, và đó là cả hai lỗi mà
  người dùng thấy ở `T760`.** Đo trên đội hình mẫu:

  | điểm | số người cùng nhắm |
  |---|---|
  | `36,8 ; 34,0` | **4** — hai `DC` nhà và hai `MC` khách |
  | `68,3 ; 34,0` | **4** — hai `MC` nhà và hai `DC` khách |
  | `10,5 ; 34,0` | **3** — `GK` nhà và hai `ST` khách |
  | `94,5 ; 34,0` | **3** — hai `ST` nhà và `GK` khách |
  | bốn điểm cánh | **2** mỗi điểm |

  **22 trong 231 cặp (9,5%) nhắm ĐÚNG MỘT ĐIỂM.** Và phép đo trên 6.789.700 cặp
  của 5 trận cho **9,53%** số cặp có đĩa vẽ chồng nhau — hai con số trùng tới
  hai chữ số thập phân, vì chúng là **cùng một tập cặp**.

  Hệ quả là cả hai câu người dùng nói, từ **một** nguyên nhân:

  - *"bị đè lên nhau"* — `tachChen` đẩy chúng ra rồi để chúng đứng **đúng** ở
    2,0 m: phân bố khoảng cách có một **bức tường** ở 2,000 m với **6,23%** số
    cặp nằm ngay trên tường (phân vị 1% = 2,000 m).
  - *"dính liền đến nhau"* — cùng đích **cộng** cùng phép cơ học thì hai người
    dịch **y hệt nhau** từng mốc. Họ không chỉ gần nhau; họ là **một khối**.

  ⚠️ **Tôi đã khoanh sai nguyên nhân khi mở `T814`.** Task ấy viết *"`tachChen`
  tách theo mét và rõ ràng chưa đủ"*. Không phải: `tachChen` làm **đúng** việc
  của nó — nó giữ 2,0 m, không hụt một milimét nào. Lỗi nằm **trước** nó, ở chỗ
  phát đích.

  ⚠️ **Và đây KHÔNG phải mô hình chiến thuật của spec 009.** Chú thích đầu file
  này đã rào: khối phòng ngự, hai tuyến, pressing là **US-40**. Thứ dưới đây chỉ
  làm một việc mà không AC nào cần cho phép: **không đặt hai người lên cùng một
  điểm**. Nó không thêm vai trò, không thêm pha, không đọc chỉ số nào.
*/

/**
 * Giãn cách giữa hai người **cùng một vùng**, mét — dọc theo trục ngang sân.
 *
 * 10 m đủ để hai đĩa vẽ rời nhau ở **cả hai** góc nhìn: đĩa rộng nhất là
 * `2,6` đơn vị của sân 2D, tức **3,01 m**, nên hai tâm cần hơn **6,01 m** mới
 * không chồng. Và 10 m vẫn nằm gọn trong một cột rộng `68/3 = 22,7 m`.
 */
export const GIAN_TRONG_VUNG = 10

/**
 * Lùi về phía khung thành **của chính mình**, mét.
 *
 * Bốn điểm giữa sân bị **hai bên** cùng nhắm, vì dải 1 của nhà là dải 2 của
 * khách. Lùi mỗi bên về sân mình tách hai bên ra **gấp đôi** con số này, và nó
 * cũng là điều một hậu vệ thật làm: đứng **phía khung thành** so với người anh
 * ta kèm.
 *
 * ⚠️ **3,5 → 6,0 ngày 2026-11-26, và lý do là MẮT chứ không phải phép đo.**
 * `3,5 m` đủ để qua ngưỡng đếm-ra-hai (7 m > 6,01 m) và mọi phép kiểm đều
 * xanh — nhưng người dùng nhìn bản chạy và thấy **11 cặp khiêu vũ**: mỗi cầu
 * thủ nhà đứng sát đúng một cầu thủ khách, vì 7 m chỉ hơn **một** đường kính
 * đĩa vẽ (6,01 m) có 1 cm. `6,0 m` cho **12 m** giữa hai tuyến đối diện —
 * **hai** đường kính đĩa — và đó là khoảng một hậu vệ thật giữ với tiền vệ đối
 * phương. Người dùng chốt ngày 2026-11-26 sau khi xem.
 */
export const LUI_VE_SAN_MINH = 6

/**
 * Chỗ đứng của **cả đội hình**, mét, đã bảo đảm không hai người cùng một điểm.
 *
 * Nhận cả danh sách thay vì một ô, vì việc giãn cách là một tính chất của
 * **tập hợp**: phải biết ai khác cũng ở vùng ấy mới biết giãn bao nhiêu. Thứ tự
 * đầu vào là thứ tự `doiHinhTrenSan`, nên hàm **tất định** — cùng đội hình ra
 * cùng kết quả, đúng điều **P1** đòi.
 *
 * Người thứ `i` trong một nhóm `k` người cùng vùng lệch
 * `(i − (k−1)/2) × GIAN_TRONG_VUNG` theo trục `y`. Nhóm một người lệch **0**,
 * nên đội hình không bị xô lệch chỉ vì hàm này tồn tại.
 */
export function choDungDoiHinhMet(
  cacViTriO: readonly PositionId[],
  ben: BenSan,
): readonly Diem[] {
  const nhom = new Map<string, number[]>()
  for (let i = 0; i < cacViTriO.length; i += 1) {
    const id = vungCuaViTri(cacViTriO[i]!).id
    const ds = nhom.get(id) ?? []
    ds.push(i)
    nhom.set(id, ds)
  }

  const ra: Diem[] = cacViTriO.map((viTriO) => choDungMet(viTriO, ben))
  for (const ds of nhom.values()) {
    for (let k = 0; k < ds.length; k += 1) {
      const i = ds[k]!
      const goc = ra[i]!
      const lech = (k - (ds.length - 1) / 2) * GIAN_TRONG_VUNG
      const x = ben === 'nha' ? goc.x - LUI_VE_SAN_MINH : goc.x + LUI_VE_SAN_MINH
      const y = goc.y + lech
      ra[i] = trongSan(x, y) ? { x, y } : goc
    }
  }
  return ra
}
