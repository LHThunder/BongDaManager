import type { KetCucChuoi } from '../chuoiBong'
import type { KetCucPhaV6 } from '../tran'
import { ghiMoc, KHONG_AI_GIU, type LoMoc, type ThucTheTaiMoc } from './loMoc'
import { laMocDuocPhat } from './mocChuoi'
import { SO_THUC_THE } from './moc'

/*
  Lấp 20 giây của một pha bóng (T706 của spec 007, quyết định D126).

  `chayChuoiBong` sinh trung bình **1,928 hành động** một chuỗi (đo trên 20.000
  chuỗi), mà một chuỗi chiếm **20 giây** = 40 bước nửa giây. Phần dư phải đi đâu
  đó, nếu không thì bóng đứng yên và người xem thấy đúng cái "teleport" mà spec
  này sinh ra để chữa.

  BỐN PHA CON CÓ TÊN, tính bằng BƯỚC NỬA GIÂY và luôn cộng đúng 40:

    lenBong  — luân chuyển ở phần sân nhà. Pha con này HẤP THỤ PHẦN DƯ.
    chuoi    — các hành động mà `chayChuoiBong` sinh ra.
    ketCuc   — hành động cuối: cú sút, đường chuyền quyết định, pha phạm lỗi.
    bongChet — thời gian bóng không lăn sau kết cục.

  ⚠️ BẢNG BÓNG CHẾT CỦA `plan.md` MỤC 3.1 KHÔNG VỪA CỬA SỔ 20 GIÂY, và đây là
  số đo. Bảng ấy cho `pham-loi` **20 giây** và `dut-diem` **30 giây**:

    • `pham-loi` 20 giây = TRỌN cửa sổ, nên hành động còn **0 giây**.
    • `dut-diem` 30 giây **vượt** cả cửa sổ 10 giây.

  Tần suất đo được trên 20.000 chuỗi: mất bóng 62,85% | bóng ra ngoài 17,40% |
  phạm lỗi 14,29% | dứt điểm 5,46%. Nên **19,75% số pha — một phần năm — không
  vừa cửa sổ của nó.**

  Kỳ vọng thì bảng ấy ĐÚNG: 0,1740·15 + 0,1429·20 + 0,0546·30 = **7,11 giây**
  một pha, khớp con số 7,35 mà plan ghi, và cho bóng lăn ~61,6 trong 95,9 phút.
  Chỗ sai không phải giá trị trung bình, mà là **bố cục từng pha**.

  CÁCH XỬ ĐÃ CHỌN — **cắt theo cửa sổ**: `bongChet` bị kẹp xuống
  `40 − TOI_THIEU_HANH_DONG` bước. Hai phương án kia bị loại:

    (a) **Tràn sang chuỗi sau** — biên chuỗi thôi đều 20 giây. Nó phá ba thứ đã
        viết và đã có test: `chuoiCuaMoc` của `moc.ts`, đơn vị "cả cửa sổ chuỗi
        20 giây" của D124/T731, và lô một phút của `loMoc`.
    (b) **Đổi bốn con số cho vừa** — nhưng người dùng vừa chốt (câu 1,
        2026-11-23) là giữ bốn số ấy trong plan, và spec 008 sẽ THAY cả định
        nghĩa "bóng chết" khi mang luật IFAB vào.

  CÁI GIÁ CỦA PHÉP CẮT, bằng số: kỳ vọng bóng chết tụt từ 7,11 xuống **5,77
  giây** một pha, nên bóng lăn tăng từ ~61,6 lên **~68,1 phút**. Spec 010 muốn
  **55–60 phút**, nên phép cắt đẩy con số **xa hơn** khỏi đích ấy. Đó là một
  con số để báo, không phải một chỗ tự nới — spec 010 sở hữu nó.
*/

/** Số bước nửa giây của một chuỗi bóng. 20 giây. */
export const BUOC_MOI_CHUOI = 40

/** Pha con `ketCuc` luôn chiếm đúng bấy nhiêu bước. 2 giây. */
export const BUOC_KET_CUC = 4

/** Mỗi hành động của `chuoi` muốn bấy nhiêu bước, khi còn đủ chỗ. 2 giây. */
export const BUOC_MOI_HANH_DONG = 4

/**
 * Hành động phải còn ít nhất bấy nhiêu bước, bất kể bóng chết dài bao nhiêu.
 *
 * Đây là con số làm phép cắt có hiệu lực: nó bảo đảm `lenBong + chuoi + ketCuc`
 * không bao giờ bằng 0, nên không pha nào biến thành 20 giây bóng chết trơn.
 */
export const TOI_THIEU_HANH_DONG = 8

/**
 * Bảng bóng chết của `plan.md` mục 3.1, tính bằng BƯỚC nửa giây.
 *
 * Đây là con số **mong muốn**, chưa cắt. `boCucPha` mới là chỗ cắt nó cho vừa
 * cửa sổ — xem khối chú thích đầu file.
 */
export const BUOC_BONG_CHET: Readonly<Record<KetCucChuoi, number>> = {
  'mat-bong': 0,
  'bong-ra-ngoai': 30,
  'pham-loi': 40,
  'dut-diem': 60,
}

/** Bốn pha con của một pha bóng, tính bằng bước nửa giây. */
export interface BoCucPha {
  readonly lenBong: number
  readonly chuoi: number
  readonly ketCuc: number
  readonly bongChet: number
  /** Bóng chết mong muốn theo bảng, trước khi cắt — để đo được phép cắt. */
  readonly bongChetMongMuon: number
}

/**
 * Chia 20 giây của một pha bóng thành bốn pha con.
 *
 * Luôn cộng đúng `BUOC_MOI_CHUOI`. Thứ tự cấp chỗ: bóng chết (đã cắt) → kết cục
 * → chuỗi → phần dư cho `lenBong`.
 */
export function boCucPha(
  ketCuc: KetCucChuoi,
  soHanhDong: number,
): BoCucPha {
  const mongMuon = BUOC_BONG_CHET[ketCuc]
  const bongChet = Math.min(mongMuon, BUOC_MOI_CHUOI - TOI_THIEU_HANH_DONG)

  const conLai = BUOC_MOI_CHUOI - bongChet - BUOC_KET_CUC
  const muonChoChuoi = soHanhDong * BUOC_MOI_HANH_DONG
  const chuoi = Math.max(0, Math.min(muonChoChuoi, conLai))

  return {
    lenBong: conLai - chuoi,
    chuoi,
    ketCuc: BUOC_KET_CUC,
    bongChet,
    bongChetMongMuon: mongMuon,
  }
}

/** Pha con nào đang diễn ra ở bước thứ `b` (0-based) của chuỗi. */
export type TenPhaCon = 'lenBong' | 'chuoi' | 'ketCuc' | 'bongChet'

export function phaConCuaBuoc(boCuc: BoCucPha, b: number): TenPhaCon {
  if (b < boCuc.lenBong) return 'lenBong'
  if (b < boCuc.lenBong + boCuc.chuoi) return 'chuoi'
  if (b < boCuc.lenBong + boCuc.chuoi + boCuc.ketCuc) return 'ketCuc'
  return 'bongChet'
}

/** Thực thể chưa có chuyển động: đứng ở gốc, chỉ `coMat` là thật. */
function thucTheRong(coMat: number): ThucTheTaiMoc {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat }
}

/**
 * Diễn một pha bóng ra các mốc của nó, và ghi vào lô.
 *
 * ⚠️ TOẠ ĐỘ CHƯA CÓ. Cơ học chuyển động là Phase 54 và vật lý bóng là Phase 55;
 * hôm nay mốc mang toạ độ 0. Thứ task này mang lại là **bố cục thời gian** và
 * **ai đang giữ bóng ở từng mốc** (AC-37.6) — trong `bongChet` thì không ai
 * giữ, trong ba pha con kia thì người của bên tổ chức giữ.
 *
 * Chữ ký của `plan.md` mục 5 ghi `(kq, boiCanh, rng, lo)`. Ở đây nó là
 * `(pha, chiSoMocDau, lo, chiSoNguoiGiu)`: `boiCanh` đã nằm trong `pha`, và
 * `rng` chưa có việc gì làm khi chưa có chuyển động — nó vào khi Phase 54 tới.
 */
/**
 * Nguồn thực thể cho một mốc — **mối hàn của T725**.
 *
 * Không khai thì lô mang thực thể rỗng, đúng hành vi của T706. Khai thì vòng
 * phút tự bước cơ học và trả về 26 ô có toạ độ thật. Tách ra thành tham số chứ
 * không nhồi cơ học vào đây: file này sở hữu **bố cục thời gian** của một pha,
 * còn cơ học là của `coHoc.ts` — gộp hai thứ là buộc chúng sửa cùng nhau mãi.
 */
export type ThucTheCuaMoc = (
  chiSoMoc: number,
  phaCon: TenPhaCon,
  nguoiGiu: number,
) => readonly ThucTheTaiMoc[]

export function dienChuoiRaMoc(
  pha: KetCucPhaV6,
  chiSoMocDau: number,
  lo: LoMoc,
  chiSoNguoiGiu: number,
  coMatCuaO: readonly number[],
  thucTheCuaMoc?: ThucTheCuaMoc,
  day = false,
): BoCucPha {
  if (coMatCuaO.length !== SO_THUC_THE) {
    throw new Error(
      `coMatCuaO có ${coMatCuaO.length} ô, phải đúng ${SO_THUC_THE}`,
    )
  }

  const boCuc = boCucPha(pha.kq.ketCuc, pha.kq.cacHanhDong.length)
  const cacThucThe = coMatCuaO.map((c) => thucTheRong(c))

  for (let b = 0; b < BUOC_MOI_CHUOI; b += 1) {
    const chiSoMoc = chiSoMocDau + b
    if (!laMocDuocPhat(chiSoMoc, day)) continue

    const phaCon = phaConCuaBuoc(boCuc, b)
    const nguoiGiu = phaCon === 'bongChet' ? KHONG_AI_GIU : chiSoNguoiGiu
    ghiMoc(
      lo,
      chiSoMoc,
      nguoiGiu,
      thucTheCuaMoc ? thucTheCuaMoc(chiSoMoc, phaCon, nguoiGiu) : cacThucThe,
    )
  }

  return boCuc
}
