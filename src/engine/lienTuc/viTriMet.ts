import type { PositionId } from '../../domain/types'
import { DAI_SAN, RONG_SAN, type BenSan } from '../hinhHocSan'
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
