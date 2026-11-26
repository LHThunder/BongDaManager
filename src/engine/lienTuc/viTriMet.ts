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

/**
 * Đích của một người **không** cầm bóng: chỗ đứng theo sơ đồ, dịch một phần về
 * phía bóng.
 *
 * Dịch **theo tỉ lệ khoảng cách**, nên người đứng đúng chỗ bóng không dịch một
 * mét nào — cùng lý lẽ đã giữ AC-30.5 ở lớp vẽ: một lực kéo **đều tay** sẽ dồn
 * mọi người lại một chỗ, còn lực kéo tỉ lệ thì không.
 */
export function dichNguoiKhongBong(choDung: Diem, bong: Diem): Diem {
  return {
    x: choDung.x + (bong.x - choDung.x) * PHAN_DICH_THEO_BONG,
    y: choDung.y + (bong.y - choDung.y) * PHAN_DICH_THEO_BONG,
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
