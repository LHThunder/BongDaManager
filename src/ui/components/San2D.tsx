import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { mauChuTuongPhan } from '../../domain/colors'
import { laySoDo, soNguoiCuaSoDo } from '../../domain/formations'
import type { PositionId } from '../../domain/types'
import type { BenDoi, LoaiSuKien, SuKien } from '../../engine/suKien'
import type { BenTran } from '../../engine/tran'
import { latVung, vungCuaViTri, type VungSan } from '../../engine/vung'
import { MS_LANG_SAU_BAN_THANG } from '../../hooks/useMatch'
import { useChuoi } from '../../hooks/useNgonNgu'
import { bienDoTuKhoangGian, lechDaoDong } from '../daoDong'
import {
  cuaSoGiuBong,
  dongThoiGianPhaBong,
  ganNguoiGiuBong,
  nguoiGiuBong,
  nguoiGiuBongLucNay,
  viTriBongTrongPha,
  viTriNguoiGiuBong,
  type BuocDaQuyDoi,
  type DoanCoNguoi,
  type NguoiTrenSan as NguoiChoLuatNhan,
} from '../phaBong'
import {
  doMetTuTheLuc,
  huongRaKhoiMoc,
  QUANG_CHUAN,
  thoiLuongCuaNguoi,
  viTriTaiThoiDiem,
  type Diem,
  type KhungKep,
} from '../noiSuy'
import type { BoChuoi } from '../ngonNgu'

/*
  Sân 2D dạng điểm (US-10, quyết định D41).

  SVG viết tay, KHÔNG thư viện đồ hoạ (P4): mỗi điểm là một `<g>` có
  `transform`. 22 điểm tròn không cần canvas.

  **CÓ vòng lặp animation, từ spec 004.** Câu cũ ở đây ghi "KHÔNG vòng lặp
  animation... vòng lặp chính là thứ sẽ phá ngân sách 3 giây" — sai từ lúc lát 33
  thêm nội suy, và spec 005 làm nó sai hơn nữa vì vòng giờ chạy liên tục. Ngân
  sách 3 giây không bị đe doạ: chế độ "chạy hết trận" chạy engine một lèo rồi
  vẽ MỘT lần, không đi qua vòng khung hình nào.

  Toạ độ suy từ lưới 12 vùng của D23, không phải một bảng toạ độ riêng — nhờ
  vậy chỗ bóng mà engine báo và chỗ người mà sân vẽ luôn nói cùng một thứ
  tiếng.

  KHUNG TOẠ ĐỘ CHUNG là khung của ĐỘI NHÀ: dải 0 là khung thành đội nhà, dải 3
  là khung thành đội khách. Vùng của đội khách — cả vị trí đứng lẫn vùng trong
  sự kiện của họ — phải `latVung` trước khi vẽ, đúng cách engine làm.
*/

/*
  Hệ toạ độ của ảnh SVG. KHÔNG đổi theo quân số: giữ nó cố định thì bán kính
  điểm, khoảng giãn và cỡ chữ đều là số pixel như nhau ở mọi định dạng —
  cầu thủ sân 5 không phình to ra chỉ vì sân của họ nhỏ.
*/
export const RONG = 100
export const CAO = 64

/** Khung sân vẽ bên trong hệ toạ độ trên. */
export interface KhungSan {
  readonly rong: number
  readonly cao: number
}

/*
  Khung sân theo quân số (AC-15.6, quyết định D56).

  Bảng tra, không công thức: công thức cho ra những con số không ai kiểm được
  bằng mắt, còn bảng thì chỉnh tay được từng định dạng. Sân 11 giữ đúng
  100×64 của spec 001 nên mọi trận 11 người vẽ y như trước.

  Co cả hai chiều, và co ÍT hơn tỉ lệ sân thật (futsal chỉ rộng ~40×20 so với
  105×68): co đúng thật thì sân 5 bé tới mức mười cái điểm chen nhau không
  đọc nổi số áo, mà AC-15.1 lại đếm điểm.
*/
export const KHUNG_SAN: Readonly<Record<number, KhungSan>> = {
  11: { rong: 100, cao: 64 },
  10: { rong: 96, cao: 62 },
  9: { rong: 92, cao: 59 },
  8: { rong: 87, cao: 56 },
  7: { rong: 82, cao: 53 },
  6: { rong: 76, cao: 50 },
  5: { rong: 70, cao: 46 },
}

export function khungSan(quanSo: number): KhungSan {
  return KHUNG_SAN[quanSo] ?? KHUNG_SAN[11]
}

/**
 * ĐỘ SÂU của bốn dải, tính từ **khung thành của chính đội ấy**, theo tỉ lệ chiều
 * dài khung: thủ môn, hậu vệ, tiền vệ, tiền đạo.
 *
 * **Bảng này là của MỘT ĐỘI, không phải của cả sân** (T523) — đó là khác biệt với
 * bản của spec 001, và là thứ sửa được một lỗi bố cục đã sống qua bốn spec.
 *
 * Bản cũ dùng **một** bảng cho cả hai đội và lật đội khách bằng **chỉ số dải**
 * (`latVung`: dải 3 ↔ dải 0). Hệ quả: dải tấn công của đội này lật thành đúng dải
 * **thủ môn** của đội kia, nên tiền đạo đội khách đứng ở `x = 13` trong khi hậu vệ
 * đội nhà đứng ở `x = 28` — tiền đạo nằm **sau lưng** hàng thủ suốt trận, trong
 * vòng 5m50. Người dùng gọi đúng tên ở T518: "hậu vệ luôn đứng trên tiền đạo
 * đối phương".
 *
 * Bốn số này chọn để **tám hàng của hai đội xen kẽ đều** (AC-30.8). Với `t` là bảng
 * này, đội nhà đứng ở `t`, đội khách ở `1 - t`, nên thứ tự dọc sân thành:
 *
 *     TM nhà 6 | HV nhà 20 | TĐ khách 32 | TV nhà 44 | TV khách 56 | TĐ nhà 68 | HV khách 80 | TM khách 94
 *
 * — đúng thứ tự của một trận thật, và cách đều 12 đơn vị giữa hai hàng kề nhau.
 */
const TI_LE_DAI: readonly number[] = [0.06, 0.2, 0.44, 0.68]

/** Tâm theo trục ngang sân cho từng cột, theo tỉ lệ chiều rộng khung. */
const TI_LE_COT: Readonly<Record<VungSan['cot'], number>> = {
  trai: 13 / 64,
  giua: 0.5,
  phai: 51 / 64,
}

/** Độ cao đội hình đẩy cả đội lên hay xuống theo hướng tấn công của họ. */
const DICH_THEO_DO_CAO: Readonly<Record<string, number>> = {
  thap: -3,
  'trung-binh': 0,
  cao: 3,
}

/**
 * Bán kính một điểm cầu thủ, trong khung sân 11 (100 × 64).
 *
 * **Thu từ 3,4 xuống 2,6 ngày 2026-11-22** theo yêu cầu của người dùng sau khi
 * xem bản chạy: *"tôi muốn vòng tròn hiển thị cầu thủ nhỏ đi"*. Ở 3,4 một điểm
 * rộng 6,8 trên một sân dài 100 — tức gần **bảy mét** cho một cầu thủ.
 *
 * Thu điểm lại **nới lỏng** mọi ràng buộc về khoảng cách chứ không siết chúng:
 * sàn "hai điểm gần nhau nhất" đo bằng **bán kính**, nên bán kính nhỏ đi thì
 * con số ấy lớn lên. Xem `SAN_HAI_DIEM_GAN_NHAT`.
 *
 * Ba thứ đi theo nó và **phải đổi cùng lúc**, nếu không thì chữ số áo tràn ra
 * ngoài vòng tròn: cỡ chữ số áo, đường chân chữ, và `SAN_HAI_DIEM_GAN_NHAT`.
 * Quả bóng **cố tình giữ nguyên 1,7**: người dùng xin thu *điểm cầu thủ*, và
 * bóng to hơn so với người thì càng dễ nhìn theo — đúng điều AC-32.1 muốn.
 */
export const BAN_KINH = 2.6

/** Khoảng giãn giữa hai người cùng ĐỘI đứng cùng một vùng. */
const BUOC_GIAN = 8

/*
  `LECH_DOI` đã bỏ ở T523.

  Nó sinh ra để chữa đúng triệu chứng của bảng dải cũ: hai đội dùng chung một
  bảng nên có những cặp đứng trùng toạ độ, và nó đẩy mỗi đội 4 đơn vị về phía
  khung thành của mình cho hai điểm rời nhau. Nhưng cái phải sửa là **bảng dải**,
  và cú đẩy ấy còn làm nặng thêm chuyện tiền đạo nằm sau lưng hậu vệ: nó kéo
  hậu vệ nhà xuống 28 và đẩy tiền đạo khách lên 13. Bảng dải riêng từng đội
  đã cho mọi cặp cách nhau 12 đơn vị, nên không còn gì để chữa.
*/

/** Lề tối thiểu từ tâm điểm tới mép khung, đủ cho bán kính 3,4. */
const LE_TOI_THIEU = 5

/**
 * Tỉ lệ của khung sân so với khung sân 11 (AC-15.2).
 *
 * MỌI số đo tuyệt đối ở trên — bán kính, khoảng giãn, độ lệch hai đội, cỡ
 * chữ — đều nhân với số này, nên sân quân số nhỏ là một **mô hình thu nhỏ**
 * đúng tỉ lệ của sân 11, không phải sân 11 bị bóp lại quanh những cái điểm
 * vẫn to như cũ.
 *
 * Bản đầu của T214 chỉ co khung mà để nguyên các số đo ấy. Đo ra: khoảng
 * cách gần nhất giữa hai điểm tụt từ 4,00 (sân 11) xuống 1,30 ở sân 5 — nhỏ
 * hơn một nửa bán kính, tức hai người chỉ còn là một vệt. Chính là thứ
 * AC-15.2 cấm, và nó chỉ xuất hiện ở quân số nhỏ nên sân 11 không hề báo.
 */
function tiLeKhung(khung: KhungSan): number {
  return khung.rong / RONG
}

interface NguoiTrenSan {
  readonly playerId: string
  readonly vung: VungSan
  readonly viTriO: PositionId
}

/** Ai đang đứng ở vùng nào, đã quy về khung của đội nhà. */
export function cacNguoiTrenSan(
  ben: BenTran,
  laDoiNha: boolean,
): readonly NguoiTrenSan[] {
  const viTriTheoSlot = new Map(
    laySoDo(ben.chienThuatHienTai.formationId).oVien.map((o) => [
      o.slotId,
      o.viTri,
    ]),
  )
  const dangTrenSan = new Set(ben.trenSan)

  const ra: NguoiTrenSan[] = []
  for (const o of ben.chienThuatHienTai.oVien) {
    if (!o.playerId || !dangTrenSan.has(o.playerId)) continue
    const viTriO = viTriTheoSlot.get(o.slotId)
    if (!viTriO) continue

    const vungRieng = vungCuaViTri(viTriO)
    ra.push({
      playerId: o.playerId,
      viTriO,
      vung: laDoiNha ? vungRieng : latVung(vungRieng),
    })
  }
  return ra
}

/** Quy một vùng trong sự kiện về khung của đội nhà. */
export function vungTrenSan(vung: VungSan, doi: BenDoi): VungSan {
  return doi === 'nha' ? vung : latVung(vung)
}

function kep(v: number, tu: number, den: number): number {
  return Math.min(Math.max(v, tu), den)
}

/** Ai đang dùng bảng dải nào: đội nhà, đội khách, hay **trung lập**. */
export type BenVe = 'nha' | 'khach' | 'trung-lap'

/**
 * Toạ độ dọc của một dải, theo bảng của đội đang hỏi (T523, AC-30.8).
 *
 * `dai` luôn là chỉ số **đã quy về khung đội nhà** — `cacNguoiTrenSan` và
 * `vungTrenSan` đã lật sẵn. Ba câu trả lời khác nhau cho cùng một chỉ số:
 *
 * - `'nha'`: độ sâu đếm từ khung thành bên trái → `TI_LE_DAI[dai]`.
 * - `'khach'`: đội khách đá ngược, và chỉ số đã bị lật một lần, nên phải lật lại
 *   rồi soí từ bên phải → `1 - TI_LE_DAI[3 - dai]`.
 * - `'trung-lap'`: một **chỗ trên sân**, không thuộc đội nào — dành cho quả bóng
 *   và cho những người được **kéo tới tình huống**: một pha tranh chấp phải
 *   diễn ra ở đúng một chỗ cho cả hai bên. Lấy trung điểm của hai bảng trên,
 *   nên nó đối xứng qua giữa sân.
 */
/**
 * Bốn chỗ **trung lập** của sân: nơi quả bóng và một pha tranh chấp diễn ra.
 *
 * **Không** phải trung bình của hai bảng đội: lấy trung bình thì chỗ của bóng rơi
 * cách một hàng đúng **1 đơn vị**, và đo trên 10 mã trận ra hai điểm cách nhau
 * **0,87** trên bán kính 3,4. Bốn chỗ này rơi vào **giữa hai hàng** của trật tự
 * xen kẽ, mỗi chỗ cách hàng gần nhất 6–7 đơn vị:
 *
 *     6 TM nhà | **13** | 20 HV nhà | 32 TĐ khách | **38** | 44 TV nhà |
 *     56 TV khách | **62** | 68 TĐ nhà | 80 HV khách | **87** | 94 TM khách
 */
const TI_LE_DAI_TRUNG_LAP: readonly number[] = [0.13, 0.38, 0.62, 0.87]

export function tiLeCuaDai(dai: number, ben: BenVe): number {
  const nha = TI_LE_DAI[dai]
  const khachTho = TI_LE_DAI[TI_LE_DAI.length - 1 - dai]
  if (nha == null || khachTho == null) return 0.5
  if (ben === 'nha') return nha
  if (ben === 'khach') return 1 - khachTho
  return TI_LE_DAI_TRUNG_LAP[dai] ?? 0.5
}

/**
 * Toạ độ tâm của một vùng, đã kẹp vào mặt cỏ.
 *
 * Xuất ra ngoài để phép kiểm tính được **chỗ đúng ra phải đứng** của một người
 * tham gia tình huống, thay vì chỉ so các điểm với nhau — AC-28.3 là phát biểu về
 * **vùng**, nên phép kiểm phải biểu diễn được vùng thành toạ độ.
 */
export function toaDo(
  vung: VungSan,
  dichX: number,
  khung: KhungSan,
  ben: BenVe = 'trung-lap',
): { x: number; y: number } {
  const tiLe = tiLeKhung(khung)
  const le = LE_TOI_THIEU * tiLe
  const leX = (RONG - khung.rong) / 2
  const leY = (CAO - khung.cao) / 2
  const x = leX + tiLeCuaDai(vung.dai, ben) * khung.rong + dichX
  return {
    x: kep(x, leX + le, leX + khung.rong - le),
    y: leY + TI_LE_COT[vung.cot] * khung.cao,
  }
}

/**
 * Lệch trục ngang cho những người ĐỨNG CÙNG một vùng, để họ không chồng nhau.
 *
 * Sơ đồ 4-4-2 có hai trung vệ, hai tiền vệ trung tâm và hai tiền đạo cùng ô
 * giữa, nên nếu không giãn thì sân chỉ hiện 8 điểm thay vì 11 — và AC-10.1
 * đếm điểm.
 */
function lechTrongVung(
  cac: readonly NguoiTrenSan[],
  buocGian: number,
): ReadonlyMap<string, number> {
  const theoVung = new Map<string, NguoiTrenSan[]>()
  for (const x of cac) {
    const danh = theoVung.get(x.vung.id) ?? []
    danh.push(x)
    theoVung.set(x.vung.id, danh)
  }

  const ra = new Map<string, number>()
  for (const danh of theoVung.values()) {
    const dau = -((danh.length - 1) * buocGian) / 2
    danh.forEach((x, i) => ra.set(x.playerId, dau + i * buocGian))
  }
  return ra
}

/**
 * Khối đội hình nghiêng theo bóng tối đa bao nhiêu: **một phần sáu chiều dài sân**
 * (D116, nới từ một phần mười của AC-30.4 / D94).
 *
 * **Ngưỡng này là của người dùng, cả hai lần.** Họ chốt một phần mười ở
 * `/clarify` của spec 005, rồi nới lên một phần sáu ngày 2026-11-19 sau khi đọc số đo
 * của lát 51: phần đội hình dâng lên do **vai trò** chỉ được 0,5–1,2 đơn vị, vì cái
 * trần cũ đã bị lớp co khối dùng gần hết.
 *
 * **Cái giá đã đo, không phải đoán**: sàn "hai điểm gần nhau nhất" tụt từ
 * **1,4923** xuống **1,3108** bán kính, và vì thế vòng "đang giữ bóng" phải thu lại
 * theo — xem `VONG_GIU_BONG_THEM`, nơi `Math.min` chuyển từ biên dấu ▲ sang biên sàn.
 * Bốn dải cách nhau ~0,23 chiều dài, nên 1/6 vẫn **dưới** khoảng giữa hai dải: một
 * hàng bốn không trôi sang chỗ của hàng bên.
 */
const BIEN_NGHIENG_KHOI = 1 / 6

/**
 * Khoảng cách lớn nhất có thể có giữa một người và dải có bóng, theo tỉ lệ
 * chiều dài: thủ môn (0,06 bằng bảng đội mình) và bóng ở dải tấn công xa nhất
 * (0,87 bằng bảng trung lập) — **0,81**. Dùng để chuẩn hoá độ co khối về đúng
 * biên `BIEN_NGHIENG_KHOI`.
 */
const KHOANG_TOI_DA_TOI_BONG = 0.81

/** Hệ số co khối: dịch bao nhiêu phần của khoảng cách tới dải có bóng. */
const PHAN_CO_KHOI = BIEN_NGHIENG_KHOI / KHOANG_TOI_DA_TOI_BONG

/**
 * Vai trò của một người so với người đang giữ bóng (D106).
 *
 * `chua-ro` là khi chưa biết ai giữ bóng — dòng mốc, hay trước giờ bóng lăn.
 * Lúc ấy chỉ có lớp co khối của D94, không có lực kéo theo vai trò.
 */
export type VaiTroTheoBong = 'dong-doi' | 'doi-phuong' | 'chua-ro'

/*
  ======================================================================
  HAI KHỐI DỊCH VỀ CÙNG MỘT PHÍA (sửa 2026-11-23, người dùng chốt).
  ======================================================================

  Người dùng nói họ **không thấy** đội tấn công dâng lên. Số đo nói họ đúng:
  phần dâng lên riêng của lớp vai trò chỉ được **2,881 đơn vị** trên sân dài
  100 — hơn nửa bề ngang một chấm cầu thủ (5,2) một chút, và bằng **20%**
  khoảng cách giữa hai dải đội hình (14,0). Hai nguyên nhân, cả hai đã đo:

  **(1) Một phép kẹp CHUNG cho hai lớp.** Lớp co khối một mình đã chạm trần
  `BIEN_NGHIENG_KHOI` ở cặp dải xa nhất, nên lớp vai trò chỉ còn phần thừa.
  Nới trần chung thì cả hai lớp cùng được lợi và tỉ lệ vẫn thế — đó là vì sao
  lần nới 1/10 → 1/6 ngày 19/11 không đổi được gì. Nay mỗi lớp có trần riêng.

  **(2) Hướng kéo của đối phương SAI so với điều người dùng mô tả.** Bản cũ kéo
  đối phương **về phía bóng** ("vây quanh quả bóng"). Người dùng muốn khối phòng
  ngự **lùi về khung thành nhà**. Hai thứ ngược nhau khi bóng còn ở sân nhà của
  đội tấn công. Nhật ký làm rõ của spec 006 (dòng 5) đã cho phép **cả hai**:
  "đối phương lùi về **hoặc** ép theo bóng" — nên đây là chọn nhánh còn lại,
  không phải sửa một AC.

  Và nhánh ấy còn **an toàn hơn**, đo trên 10 mã × 7 quân số × mọi dòng:

      thiết kế                        dâng     lùi     sàn chồng điểm
      nền (đối phương ép theo bóng)   2,881    2,881   1,4696
      ép theo bóng, tỉ lệ /3          5,556    5,556   0,4474  ← ĐỎ
      cùng chiều /4 /3                4,167    5,556   1,6746
      cùng chiều /2 /1,5  ← chọn      8,333   11,111   1,5163
      cùng chiều /1,5 /1             11,111   16,667   1,3580  ← vỡ vòng nét đứt

  Ngưỡng đỏ của sàn là **1,0 bán kính** (`khoangPhanBiet`). Mức đã chọn cho sàn
  **1,5163 — CAO HƠN cả nền 1,4696**: kéo hai đội **hội tụ vào bóng** mới là thứ
  ăn hết biên chống chồng điểm, còn dịch cả hai khối **về cùng một phía** thì giữ
  nguyên khoảng cách giữa chúng. Mức mạnh hơn nữa không vỡ AC-30.5 mà vỡ
  **AC-33.1**: vòng nét đứt quanh người giữ bóng trùm lên tâm một người khác.
*/

/**
 * Lực kéo thêm cho **đồng đội** của người giữ bóng: cả đội dâng lên.
 *
 * Vẫn **tỉ lệ** với khoảng cách tới dải có bóng, nên nó nhỏ dần liên tục về không
 * khi người ta tiến tới dải ấy. (Không cặp dải nào cho khoảng cách bằng đúng không:
 * bảng dải của ĐỘI và bảng TRUNG LẬP không trùng nhau ở điểm nào — T523.)
 * Tính tỉ lệ không phải thẩm mỹ mà là thứ giữ **AC-30.5**: người tham gia tình huống
 * được đặt thẳng vào vùng của tình huống và không nhận lực kéo nào, nên một lực
 * kéo **đều tay** sẽ triệt tiêu đúng khoảng lệch tách họ khỏi người không tham gia
 * đứng cùng dải — hai bản đầu của T510 đã làm hỏng đúng kiểu ấy. Tách trần thì
 * được; bỏ tính tỉ lệ thì không.
 */
const PHAN_DONG_DOI = PHAN_CO_KHOI / 2

/**
 * Lực kéo thêm cho **đối phương**: lùi về khung thành nhà, **mạnh hơn** đồng đội.
 *
 * Mạnh hơn vì đó là hình ảnh thật của một khối phòng ngự: nó lùi sâu hơn mức đội
 * tấn công dâng lên, nên pha bóng dồn vào một phần ba sân của đội đang phòng ngự —
 * đúng điều người dùng mô tả. Cùng chiều với đồng đội, nên khoảng cách giữa hai
 * khối không co lại và sàn chồng điểm không xấu đi.
 */
const PHAN_DOI_PHUONG = PHAN_CO_KHOI / 1.5

/**
 * Trần **riêng** của lớp vai trò, tách khỏi `BIEN_NGHIENG_KHOI`.
 *
 * Tổng dịch lớn nhất vì thế là `BIEN_NGHIENG_KHOI + BIEN_VAI_TRO` = một phần ba
 * chiều dài sân. Nghe nhiều, nhưng hai lớp chỉ cộng dồn hết cỡ ở những cặp dải xa
 * nhau nhất, và cả ba bất biến đã đo đều còn nguyên: sàn chồng điểm 1,5163 bán
 * kính, thủ môn vẫn trong một phần ba sân nhà, tám hàng vẫn xen kẽ đúng thứ tự.
 */
const BIEN_VAI_TRO = 1 / 6

/**
 * Một người KHÔNG tham gia dịch bao nhiêu theo trục dọc, vì bóng đang ở dải
 * nào (AC-30.4, quyết định D94).
 *
 * **Cả khối CO VỀ phía bóng, không phải cả khối trượt theo bóng** — dịch của mỗi
 * người tỉ lệ với khoảng cách từ chỗ anh ta tới dải có bóng, nên người đứng
 * **đúng chỗ bóng không dịch một đơn vị nào**. Đó không phải thẩm mỹ: hai bản
 * trước của T510 dịch **cả khối một lượng như nhau** và đều phá AC-30.5, hai kiểu
 * khác nhau, cả hai chỉ lộ ra khi đo trên 10 mã trận:
 * - Dịch theo tỉ lệ đều → triệt tiêu khoảng lệch duy nhất tách một người không
 *   tham gia khỏi người tham gia đứng cùng dải: hai điểm còn cách **0,57** đơn vị.
 * - Dịch nguyên `r/10` theo dấu → đẩy người ở dải ngoài cùng vào **phép kẹp mặt
 *   cỏ**, mà phép kẹp dồn mọi người bị kẹp về **đúng một toạ độ**: hai điểm cách
 *   nhau **0,00** đơn vị.
 *
 * Trả 0 khi không biết bóng ở đâu (chưa có dòng nào, hay dòng không mang vùng):
 * đứng theo sơ đồ là câu trả lời đúng khi chưa có thông tin.
 */
export function nghiengKhoiTheoBong(
  vungNguoi: VungSan,
  benNguoi: BenVe,
  vungBong: VungSan | null,
  khung: KhungSan,
  vaiTro: VaiTroTheoBong = 'chua-ro',
): number {
  if (vungBong == null) return 0
  const tiNguoi = tiLeCuaDai(vungNguoi.dai, benNguoi)
  const tiBong = tiLeCuaDai(vungBong.dai, 'trung-lap')
  const cach = tiBong - tiNguoi

  /*
    HAI NHÓM, HAI NGUYÊN TẮC (D106, AC-36.2, AC-36.3).

    - **Đồng đội của người giữ bóng** được kéo thêm về phía khung thành đối
      phương: cả đội dâng lên khi đang cầm bóng.
    - **Đối phương** được kéo thêm về **khung thành của chính họ**, mạnh hơn: cả
      khối phòng ngự lùi sâu. (Trước 2026-11-23 nhánh này kéo họ *về phía bóng*;
      xem khối chú thích ở `PHAN_DONG_DOI` để biết vì sao đổi và cái giá đã đo.)

    **Hai lực cùng một chiều** — về khung thành của đội đang phòng ngự — nên pha
    bóng dồn vào một phần ba sân của họ, mà khoảng cách giữa hai khối không co lại.

    **Cả hai lực đều tỉ lệ với khoảng cách tới dải có bóng, nên chúng bằng KHÔNG
    ở đúng dải ấy.** Đó không phải thẩm mỹ: người **tham gia tình huống** được
    đặt thẳng vào vùng của tình huống và **không nhận lực kéo nào**, nên một lực
    kéo đều tay sẽ triệt tiêu đúng khoảng lệch tách họ khỏi người không tham gia
    đứng cùng dải — hai bản đầu của T510 đã làm hỏng AC-30.5 đúng kiểu ấy.

    Tổng mọi lực kéo vẫn bị chặn ở `BIEN_NGHIENG_KHOI` (AC-30.4 của spec 005).
  */
  const huongTanCong = benNguoi === 'khach' ? -1 : 1
  /*
    Chiều của CẢ HAI nhóm là chiều tấn công của người đang giữ bóng. Với một
    đồng đội thì đó là chiều tấn công của chính anh ta; với một đối phương thì
    đó là chiều ngược lại — tức lùi về khung thành nhà.
  */
  const huongNguoiGiuBong =
    vaiTro === 'doi-phuong' ? -huongTanCong : huongTanCong
  const phanTheoVaiTro =
    vaiTro === 'dong-doi'
      ? PHAN_DONG_DOI
      : vaiTro === 'doi-phuong'
        ? PHAN_DOI_PHUONG
        : 0
  const them = phanTheoVaiTro * Math.abs(cach) * huongNguoiGiuBong

  /*
    HAI PHÉP KẸP RIÊNG. Một phép kẹp chung nghĩa là lớp co khối — thứ chạm trần
    ở cặp dải xa nhất — ăn hết ngân sách và lớp vai trò chỉ còn phần thừa, đúng
    cái lỗi mà khối chú thích ở `PHAN_DONG_DOI` kể.
  */
  const coKhoi = Math.max(
    -BIEN_NGHIENG_KHOI,
    Math.min(BIEN_NGHIENG_KHOI, PHAN_CO_KHOI * cach),
  )
  const theoVaiTro = Math.max(-BIEN_VAI_TRO, Math.min(BIEN_VAI_TRO, them))
  return (coKhoi + theoVaiTro) * khung.rong
}

/**
 * Một phần ba sân của đội: thủ môn không được rời khỏi đó (AC-30.7, T521).
 *
 * **Ngoại lệ duy nhất của AC-28.3**, và nó đến từ mắt người dùng ở T518 chứ không
 * từ một phép kiểm: đo trên bản dev, thủ môn đội khách chạy từ `x = 54,5` tới
 * `85,2` trong một trận — ra tới gần giữa sân. Hai thứ cộng lại: engine có lúc liệt
 * kê thủ môn là người tham gia một tình huống ở xa khung thành (và AC-28.3 bắt đặt
 * người tham gia vào đúng vùng ấy), và lớp co khối của T510 kéo thêm.
 *
 * Dải bị thu lại đúng một biên độ dao động (`BUOC_GIAN / 8`), vì lớp dao động cộng
 * vào **sau** `hinhSan`: trừ sẵn thì chỗ **được vẽ** mới thật sự nằm trong một phần
 * ba sân, chứ không phải chỉ có toạ độ tại mốc.
 */
export function daiThuMon(
  laDoiNha: boolean,
  khung: KhungSan,
): { readonly tu: number; readonly den: number } {
  const tiLe = tiLeKhung(khung)
  const le = LE_TOI_THIEU * tiLe
  const leX = (RONG - khung.rong) / 2
  const mot3 = khung.rong / 3
  const chuaDao = (BUOC_GIAN * tiLe) / 8
  return laDoiNha
    ? { tu: leX + le, den: leX + mot3 - chuaDao }
    : { tu: leX + khung.rong - mot3 + chuaDao, den: leX + khung.rong - le }
}

export interface DiemCauThu {
  readonly playerId: string
  /** Thủ môn được đối xử riêng — xem `daiThuMon` và AC-30.7. */
  readonly laThuMon: boolean
  /**
   * Điểm này thuộc đội nhà?
   *
   * Luật suy người nhận một đường chuyền (D112) chỉ được lấy **đồng đội**, mà
   * màu nền thì không nói được điều đó: hai đội có thể chọn trùng màu áo.
   */
  readonly laDoiNha: boolean
  readonly x: number
  readonly y: number
  readonly mauNen: string
  readonly mauChu: string
  readonly nhan: string
  readonly moTa: string
  readonly noiBat: boolean
}

export interface DoiTrenSan {
  readonly ben: BenTran
  readonly ten: string
  readonly mauAo: string
}

/** Những gì `hinhSan` cần để tính toạ độ — không có gì liên quan tới nhịp vẽ. */
interface DuLieuVe {
  readonly nha: DoiTrenSan
  readonly khach: DoiTrenSan
  /** Sự kiện đang hiển thị; `null` khi trận chưa chạy. */
  readonly suKien: SuKien | null
  readonly tenCauThu: (playerId: string) => string
  readonly soAo: (playerId: string) => number | null
  /**
   * Tên vị trí để dựng mô tả từng điểm.
   *
   * Đi vào bằng THAM SỐ, đúng cách `tenCauThu` và `soAo` vẫn đi: `hinhSan`
   * là hàm thuần và được test gọi thẳng, nên nó không được tự đi tra lớp
   * ngôn ngữ — làm vậy là buộc mọi test phải dựng sẵn một ngôn ngữ (D68).
   */
  readonly nhanViTri: (viTri: PositionId) => string
  /**
   * Câu mô tả một điểm, cho trình đọc màn hình.
   *
   * Cũng đi vào bằng THAM SỐ, đúng lý do của `nhanViTri` ngay trên: hàm
   * thuần không được tự đi tra lớp ngôn ngữ (D68).
   */
  readonly moTaDiem: BoChuoi['SAN_2D']['moTaDiem']
  /**
   * Ai đang giữ bóng, để mô tả điểm nói được điều ấy (AC-33.4, P9).
   *
   * Đi vào bằng **tham số** vì `hinhSan` không tự suy ra được: quy tắc của bảng
   * 3.1 có bốn loại dòng "giữ nguyên người cũ", mà `hinhSan` chỉ thấy MỘT dòng
   * — nó không có "người cũ" nào để giữ. Phép gấp ấy thuộc lớp vẽ.
   *
   * Tuỳ chọn: phép kiểm hình học không soi tới mô tả điểm (D68), nên chúng
   * không phải dựng sẵn một người giữ bóng chỉ để gọi được hàm.
   */
  readonly nguoiGiuBong?: string | null
}

interface Props extends DuLieuVe {
  /** Nhịp đồng hồ trận: bao nhiêu mili-giây cho một phút chơi. */
  readonly msMoiPhut: number
  /*
    `phutDongHo` đã bỏ ở T620.

    Nó sinh ra ở T508 để lớp dao động có một đồng hồ của trận (D90). Nay đồng hồ
    ấy là một bộ cộng dồn trong vòng khung hình (D114), nên sân không còn cần biết
    phút đồng hồ là bao nhiêu. Giữ một prop không ai đọc là giữ một lời hứa sai về
    thứ thành phần này phụ thuộc vào.
  */
  /** Trận đang chạy hay đang tạm dừng — tạm dừng thì đóng băng cả sân (AC-28.5). */
  readonly dangChay: boolean
}

/**
 * Chừa lại 10% để cú chuyển chỗ KẾT THÚC trước khi tình huống sau tới.
 * Mốc tình huống cách nhau trung bình ~1,15 phút trận, nên 0,9 là biên an
 * toàn kể cả ở những đoạn dày sự kiện nhất.
 */
const TI_LE_KIP = 0.9

/**
 * Dưới nhịp này thì thôi nội suy hẳn (AC-29.4, quyết định D97).
 *
 * Ở mức Rất nhanh (20ms một phút trận) một cú di chuyển chỉ dài 18ms — khoảng
 * một khung hình 60Hz. Mắt không đọc được chuyển động nào trong khoảng ấy, nên
 * vẽ đường đi không mang lại gì mà chỉ làm điểm bị giật khi khung hình rơi.
 */
const NHIP_TOI_THIEU_DE_NOI_SUY = 40

/**
 * Thời gian một điểm đi từ chỗ cũ tới chỗ mới, buộc theo nhịp đồng hồ trận.
 *
 * Bản đầu đặt cứng 280ms. Đo ra thì ở CẢ BA mức tốc độ, con số ấy dài hơn
 * khoảng cách giữa hai lần đổi chỗ — Thường ~220ms, Nhanh ~77ms, Rất nhanh
 * ~22ms — nên không cú di chuyển nào kịp tới đích: điểm luôn đang bay dở thì
 * bị giật sang đích mới. Ở mức Nhanh nó bị giật bốn lần trước khi tới nơi
 * được một lần.
 *
 * Lỗi này có từ spec 001 nhưng chìm ở sân 11, vì mỗi tình huống chỉ kéo ~17%
 * đội hình đi. Sân 5 cũng ~1,88 người mỗi tình huống nhưng trên một đội hình
 * năm người, tức **37%** — mắt đọc chuyển động theo tỉ lệ, không theo số
 * tuyệt đối, nên cùng một lỗi ở sân 5 thành ra loạn.
 *
 * **Trần cứng 280ms đã bị bỏ (T501, quyết định D91).** Nó sinh ra để chữa đúng
 * lỗi ở trên — một con số đặt cứng dài hơn khoảng cách giữa hai mốc — nhưng
 * công thức theo tỉ lệ thì **không bao giờ** vượt nhịp, nên lý do tồn tại của
 * trần đã hết. Giữ nó thì ở nhịp 1000ms một cú di chuyển dài 280ms rồi điểm
 * **đứng im 720ms** — chậm hơn nhưng giật hơn, đúng cái bẫy spec 005 mục 1 ghi.
 */
export function thoiGianChuyen(msMoiPhut: number): number {
  if (!(msMoiPhut >= NHIP_TOI_THIEU_DE_NOI_SUY)) return 0
  return Math.round(msMoiPhut * TI_LE_KIP)
}

export interface HinhSan {
  readonly khung: KhungSan
  /** Bán kính một điểm trong khung này — đã co theo tỉ lệ. */
  readonly banKinh: number
  readonly cacDiem: readonly DiemCauThu[]
  readonly duongBong: readonly { readonly x: number; readonly y: number }[]
  /**
   * Từng bước của pha bóng, đã quy về toạ độ, **kèm loại** (spec 006, T602).
   *
   * Rỗng nghĩa là nhịp này không có pha bóng nào — hoặc vì dòng không kể pha
   * bóng, hoặc vì đây là **bản ghi trận cũ** thiếu dữ liệu loại bước (D110).
   */
  readonly cacBuocBong: readonly BuocDaQuyDoi[]
  /**
   * Chỗ của quả bóng mà **dòng này** nói ra, hay `null` khi nó không nói gì (T513).
   *
   * `null` **không** có nghĩa là "không có bóng": nó có nghĩa là "dòng này không
   * kể một pha bóng nào, hãy để bóng ở chỗ nó đang ở" — thay người, kiệt sức,
   * tiếng còi mãn cuộc đều như vậy (AC-32.3). Trước T513 những dòng ấy làm quả
   * bóng **biến mất** khỏi sân, và riêng "kiệt sức" là năm dòng một trận.
   */
  readonly bongTaiMoc: Diem | null
}

/**
 * Những dòng đưa bóng về điểm giao bóng giữa sân (AC-32.2).
 *
 * Đúng hai loại, và đó là hai lúc bóng thật sự được đặt lại giữa sân. Tiếng
 * còi mãn cuộc **không** nằm đây: trận hết thì bóng ở chỗ nó đang ở, đúng
 * hơn là bị dọn về giữa.
 */
const MOC_GIAO_BONG: readonly LoaiSuKien[] = ['bat-dau', 'het-hiep']

/**
 * Toàn bộ hình học của sân — tách khỏi phần vẽ để kiểm được bằng test.
 *
 * Bộ test của repo chạy ở `environment: 'node'` và chỉ nhận `*.test.ts`, nên
 * không có đường nào render một component React. AC-15.1 (đếm đúng 2n điểm)
 * và AC-15.2 (không điểm nào đè khít điểm khác) đều là phát biểu về toạ độ,
 * nên hàm này là chỗ chứng minh chúng.
 */
export function hinhSan({
  nha,
  khach,
  suKien,
  tenCauThu,
  soAo,
  nhanViTri,
  moTaDiem,
  nguoiGiuBong: aiGiuBong = null,
}: DuLieuVe): HinhSan {
  /*
    Quân số suy từ SƠ ĐỒ đang dùng, không từ `trenSan`: thẻ đỏ làm số người
    trên sân tụt xuống, mà khung sân thì không được co lại giữa trận.
  */
  const quanSo = soNguoiCuaSoDo(
    laySoDo(nha.ben.chienThuatHienTai.formationId),
  )
  const khung = khungSan(quanSo)
  const tiLe = tiLeKhung(khung)
  const buocGian = BUOC_GIAN * tiLe
  const le = LE_TOI_THIEU * tiLe
  const leY = (CAO - khung.cao) / 2

  const thamGia = new Set(suKien?.cacCauThu ?? [])

  /*
    ĐỘI NÀO ĐANG GIỮ BÓNG — để hai nhóm di chuyển theo hai nguyên tắc (D106).

    Lấy **đội của người giữ bóng**, không lấy `suKien.doi`: hai thứ ấy khác nhau
    ở đúng những dòng đáng kể nhất — một pha cứu thủa hay một pha mất bóng thì
    dòng nói về đội tấn công, còn bóng đã sang chân đội kia.
  */
  const benGiuBong: BenVe | null =
    aiGiuBong == null
      ? null
      : cacNguoiTrenSan(nha.ben, true).some((x) => x.playerId === aiGiuBong)
        ? 'nha'
        : cacNguoiTrenSan(khach.ben, false).some(
              (x) => x.playerId === aiGiuBong,
            )
          ? 'khach'
          : null
  const vungSuKien = suKien?.vung ? vungTrenSan(suKien.vung, suKien.doi) : null

  /*
    Khối đội hình co về phía bóng (AC-30.4, D94) áp **chỉ** cho người KHÔNG tham
    gia tình huống: người tham gia vẫn được đặt thẳng vào vùng của tình huống,
    không xê dịch một đơn vị nào — đó là thứ giữ AC-28.3 đúng tuyệt đối, và
    cũng là giới hạn mà D94 đặt ra cho quyền đổi cách tính toạ độ tại mốc.
  */

  /*
    Người tham gia dồn về CÙNG một vùng, nên phải giãn họ ra y như đã giãn
    những người đứng chung một ô (T132). Không giãn thì hai điểm nằm khít
    lên nhau và người xem chỉ thấy MỘT — pha tranh chấp hay bàn thắng có
    kiến tạo lại trông y hệt một mình một người.

    Giãn theo đúng thứ tự `cacCauThu`: người mà câu tường thuật nói tới đứng
    đầu danh sách, nên chỗ của anh ta không nhảy lung tung giữa các phút.
  */
  const dsThamGia = suKien?.cacCauThu ?? []
  const dauThamGia = -((dsThamGia.length - 1) * buocGian) / 2
  const lechThamGia = new Map(
    dsThamGia.map((id, i) => [id, dauThamGia + i * buocGian]),
  )

  const cacDiem: DiemCauThu[] = []

  for (const [doi, doiTren] of [
    ['nha', nha],
    ['khach', khach],
  ] as const) {
    const laDoiNha = doi === 'nha'
    const huong = laDoiNha ? 1 : -1
    const doCao = doiTren.ben.chienThuatHienTai.chiThi['do-cao-doi-hinh']
    const dichX =
      (DICH_THEO_DO_CAO[doCao] ?? 0) * huong * tiLe

    const tren = cacNguoiTrenSan(doiTren.ben, laDoiNha)
    const lech = lechTrongVung(tren, buocGian)
    const mauChu = mauChuTuongPhan(doiTren.mauAo)

    for (const x of tren) {
      // Người tham gia tình huống dịch TỚI chỗ bóng; người khác giữ chỗ.
      const noiBat = thamGia.has(x.playerId)
      /*
        **Thủ môn không bao giờ bị dịch đi đâu cả** (AC-30.7, T521): anh ta
        đứng ở vùng của mình, kể cả khi dòng tường thuật liệt kê anh ta là
        người tham gia. Một cú cứu thùa thì vốn đã diễn ra ở vùng của anh ta,
        nên không mất gì; còn những dòng liệt kê anh ta ở xa khung thành là
        thứ đã kéo thủ môn đội khách ra tới `x = 85,2` trước T521.
      */
      const laThuMon = x.viTriO === 'GK'
      const diChuyen = noiBat && vungSuKien !== null && !laThuMon
      /*
        Thủ môn cũng **không co theo khối**, và còn bị kẹp vào một phần ba sân
        của mình — phép kẹp ấy hiện không ràng vào đâu, nó là lưới giữ AC-30.7
        đúng nếu sau này có sơ đồ đặt thủ môn ở một dải khác.
      */
      const { x: xTho, y: cy } = toaDo(
        diChuyen && vungSuKien ? vungSuKien : x.vung,
        diChuyen
          ? 0
          : dichX +
            (laThuMon
              ? 0
              : nghiengKhoiTheoBong(
                  x.vung,
                  laDoiNha ? 'nha' : 'khach',
                  vungSuKien,
                  khung,
                  benGiuBong == null
                    ? 'chua-ro'
                    : laDoiNha === (benGiuBong === 'nha')
                      ? 'dong-doi'
                      : 'doi-phuong',
                )),
        khung,
        /*
          Người được kéo tới tình huống dùng bảng **trung lập**: một pha
          tranh chấp phải diễn ra ở đúng một chỗ cho cả hai bên, không thể
          mỗi người đứng theo bảng của đội mình. Còn người đứng theo sơ đồ
          thì dùng bảng của đội anh ta — đó là cả ý nghĩa của T523.
        */
        diChuyen ? 'trung-lap' : laDoiNha ? 'nha' : 'khach',
      )
      const dai = laThuMon ? daiThuMon(laDoiNha, khung) : null
      const cx = dai ? kep(xTho, dai.tu, dai.den) : xTho
      const lechY = diChuyen
        ? (lechThamGia.get(x.playerId) ?? 0)
        : (lech.get(x.playerId) ?? 0)
      const so = soAo(x.playerId)

      cacDiem.push({
        playerId: x.playerId,
        laThuMon,
        laDoiNha,
        x: cx,
        y: kep(cy + lechY, leY + le, leY + khung.cao - le),
        mauNen: doiTren.mauAo,
        mauChu,
        nhan: so === null ? '' : String(so),
        noiBat,
        moTa: moTaDiem(
          tenCauThu(x.playerId),
          so,
          nhanViTri(x.viTriO),
          doiTren.ten,
          noiBat,
          x.playerId === aiGiuBong,
        ),
      })
    }
  }

  const duongBong = (suKien?.duongBong ?? []).map((v) =>
    toaDo(vungTrenSan(v, suKien?.doi ?? 'nha'), 0, khung),
  )

  /*
    Từng bước kèm loại, dùng **bảng trung lập** như đường bóng: một chỗ trên
    sân không thuộc đội nào. Thiếu `cacBuocBong` — bản ghi trận cũ — thì để rỗng,
    và lớp vẽ rơi về cách của spec 005 (D110).
  */
  const cacBuocBong: readonly BuocDaQuyDoi[] = (suKien?.cacBuocBong ?? []).map(
    (b) => ({
      diem: toaDo(vungTrenSan(b.vung, suKien?.doi ?? 'nha'), 0, khung),
      loai: b.loai,
    }),
  )

  const cuoiDuongBong = duongBong[duongBong.length - 1]
  /*
    Điểm giao bóng là giữa khung ảnh, không phải giữa khung sân — hai thứ này
    bằng nhau vì `hinhSan` luôn đặt sân giữa ảnh, và viết theo khung ảnh thì
    không phải đi qua lề hai bên.
  */
  const bongTaiMoc: Diem | null =
    cuoiDuongBong ??
    (suKien && MOC_GIAO_BONG.includes(suKien.loai)
      ? { x: RONG / 2, y: CAO / 2 }
      : null)

  return {
    khung,
    banKinh: BAN_KINH * tiLe,
    cacDiem,
    duongBong,
    cacBuocBong,
    bongTaiMoc,
  }
}

/**
 * Người dùng có bật chế độ giảm chuyển động của hệ điều hành không (AC-25.6).
 *
 * Bắt đầu bằng `false` rồi mới hỏi trong effect: `matchMedia` không tồn tại
 * khi file này được một test chạy ở môi trường node import vào, và `hinhSan`
 * thì đang được kiểm đúng kiểu ấy.
 */
function useGiamChuyenDong(): boolean {
  const [giam, datGiam] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const hoi = window.matchMedia('(prefers-reduced-motion: reduce)')
    datGiam(hoi.matches)
    const nghe = () => datGiam(hoi.matches)
    hoi.addEventListener('change', nghe)
    return () => hoi.removeEventListener('change', nghe)
  }, [])

  return giam
}

/** Bước thời gian để đo vận tốc bằng sai phân, theo tỉ lệ chặng. */
const BUOC_DO_VAN_TOC = 0.01

/**
 * Bóng nhanh gấp mấy lần người (AC-30.2, AC-35.1, AC-35.4).
 *
 * Bóng đi hết chặng của nó trong `msChuyen / 2`, nên nó tới đích trong khoảng
 * **nửa đầu** của chặng — mắt theo bóng trước, người theo sau, đúng như một
 * đường chuyền. Trước T505 bóng được vẽ thẳng tại toạ độ mốc, tức **nhảy tức
 * thời**.
 *
 * **Ba → hai, người dùng chốt ngày 2026-11-22** (T628) sau khi xem bản chạy:
 * *"đường bóng chậm hơn nữa"*. Số đo ở mức Chậm trước khi đổi: tốc độ bóng mỗi
 * đoạn trung vị **152 đơn vị/giây** trên một sân rộng 100 — tức quả bóng băng
 * hết chiều ngang sân trong **0,66 giây**, p90 là 342 và lớn nhất 728.
 *
 * **Cái giá đã nói trước khi chốt**: đây là tỉ lệ của AC-35.1, và hạ nó làm một
 * đường chuyền trông **gần giống một pha rê bóng hơn** — đúng thứ người dùng
 * từng xin phân biệt được ở `/clarify`. Hai lần vẫn là hai lần, nên khác biệt
 * còn thấy được; nhưng nếu sau này nó mờ đi thì đây là chỗ đầu tiên nên nhìn.
 *
 * Một chi tiết đã đo và **không** sửa được bằng hằng số này: **41,2% số pha có
 * hơn ba đoạn**, và `dongThoiGianPhaBong` nén mọi đoạn cho vừa một nhịp. Đó mới
 * là chỗ sinh ra đuôi 342–728, chứ không phải tỉ lệ.
 */
const BONG_NHANH_GAP = 2

/** Hiệu ứng bàn thắng chạy bao lâu, mực thời gian thật (AC-32.4). */
const THOI_GIAN_HIEU_UNG_BAN_THANG = 1500

/** Vòng sáng nở tối đa gấp mấy lần bán kính một điểm. */
const VONG_SANG_NO_GAP = 7

/**
 * Hai điểm gần nhau nhất trên sân cách nhau bao nhiêu bán kính — **số ĐO ĐƯỢC**,
 * không phải số suy ra (T605).
 *
 * Đo trên 10 mã trận × 7 quân số × mọi dòng tường thuật — 5835 dòng, mọi cặp
 * điểm: sàn là **4,457 ĐƠN VỊ**. Viết theo bán kính thì nó là 1,3108 khi bán kính
 * còn 3,4, và **1,71** từ khi T627 thu bán kính xuống 2,6 — **cùng một khoảng cách
 * thật**, chỉ khác thước đo. Đó là lý do con số ở đây đổi mà không có gì trên sân
 * đổi cả.
 *
 * **Nó đã tụt hai lần, và cả hai đều đo được** (tính theo bán kính 3,4 của lúc ấy):
 * 1,5468 → 1,4923 khi T611 thêm lực
 * kéo theo vai trò (D106), rồi 1,4923 → 1,3108 khi T624 nới trần lên một phần sáu
 * (D116). Lý do của cả hai là một: **mọi lực kéo đều kéo về phía bóng**, nên chúng
 * đều làm hai điểm xích lại — đúng điều R48 báo trước.
 *
 * Lần thứ nhất trả bằng cách siết lực kéo theo vai trò từ một nửa xuống một phần
 * tư lớp co khối. Lần thứ hai **không siết**, vì chính người dùng muốn thấy đội
 * hình dâng lên rõ hơn; cái trả giá là vòng "đang giữ bóng" thu lại.
 *
 * **Không phải 1,80.** Con số 1,80 ghi ở phép kiểm R45 là sàn **quanh người ghi
 * bàn**, không phải sàn toàn sân — đo lại trên mọi cặp thì chật hơn hẳn. Và đo
 * riêng quanh **người giữ bóng** ra đúng 1,5468: tức cặp chật nhất của cả sân
 * **luôn có người giữ bóng là một nửa**. Biên quanh anh ta vì thế bị ràng thật,
 * không phải một biên cho có — đúng bài học R45 lặp lại lần thứ ba: sàn phụ
 * thuộc vào việc đo quanh ai.
 */
const SAN_HAI_DIEM_GAN_NHAT = 1.46

/**
 * Điểm người ghi bàn được phì thêm tối đa bao nhiêu (AC-32.4, rủi ro R45).
 *
 * **Con số này là số học, không phải thẩm mỹ**, và nó đã sai hai lần trước khi
 * đúng — cả hai lần đều vì suy từ cấu trúc mà không đo.
 *
 * Ngưỡng thật là **khoảng cách gần nhất giữa hai điểm bất kỳ trên sân**, không
 * phải khoảng giãn giữa hai người cùng một vùng: cặp chật nhất lại là một cặp
 * **khác vùng**, nơi hai đội chỉ lệch nhau `LECH_DOI` = 4. Đo trên 5905 khung
 * (10 mã trận × 7 quân số × mọi dòng tường thuật): sàn là **đúng 4,0 đơn vị**,
 * tức 1,176 bán kính — và đo riêng 330 bàn thắng thì chính người ghi bàn là một
 * nửa của cặp chật nhất ấy, nên biên này thật sự bị ràng.
 *
 * Chỗ trống tối đa vì thế là `BUOC_GIAN / 2 - BAN_KINH` = 0,6, và biên này chỉ lấy
 * **ba phần tư** chỗ trống đó. Hai lý do: đứng đúng sàn thì viền điểm người ghi
 * bàn chạm **đúng** tâm điểm gần nhất, không còn một pixel nào dữ; và hai lớp
 * đứng sau `hinhSan` — dao động (Phase 39) và nghiêng khối (Phase 40) — còn
 * dịch tâm điểm lúc vẽ, mà phép kiểm ở `san2D.test.ts` chỉ thấy toạ độ của
 * `hinhSan`.
 *
 * Hai bản sai trước đó: `min(BAN_KINH, BUOC_GIAN/2)` = 3,4 (gần sáu lần mức cho
 * phép), rồi `BUOC_GIAN - 2 * BAN_KINH` = 1,2 (gần gấp đôi) — bản sau suy từ khoảng
 * trống giữa hai người **cùng vùng** mà bỏ quên cặp khác vùng chật hơn.
 */
export const PHI_THEM_NGUOI_GHI_BAN = ((BUOC_GIAN / 2 - BAN_KINH) * 3) / 4

/**
 * Vòng nét đứt quanh người giữ bóng rộng hơn bán kính điểm bao nhiêu
 * (AC-33.4, D108).
 *
 * **Một vòng quanh điểm cũng là phì to dấu chân của nó**, và spec 005 mắc đúng
 * lỗi "phì to một điểm mà không đặt biên" hai lần ở R45. Hai biên, và vòng phải
 * nằm dưới **cả hai**:
 *
 * 1. **Sàn đã đo**: hai điểm gần nhau nhất cách nhau **1,46 bán kính** (đo lại
 *    2026-11-22 sau khi phễu dứt điểm đổi engine lên v6; trước đó là 1,71), xem
 *    `SAN_HAI_DIEM_GAN_NHAT`. Vòng rộng hơn thế là trùm tâm người khác, tức
 *    đếm sai số người trên sân — điều AC-15.2 cấm.
 * 2. **Dấu ▲** đặt ở `-banKinh - 1,2 · tiLe`. Vòng cao hơn thế là đi xuyên dấu
 *    ▲, mà hai dấu phải đọc ra được riêng rẽ — ▲ đã có nghĩa "đang tham gia
 *    tình huống" từ spec 001.
 *
 * **Biên nào chặt hơn đã đổi HAI LẦN, và `Math.min` chịu được cả hai mà không ai
 * phải nhớ sửa nó.** T624 nới trần nghiêng khối lên 1/6, sàn tụt, nên biên thật
 * chuyển từ dấu ▲ sang **sàn** (0,31 · 3,4 = 1,054 so với 1,2). T627 thu bán kính
 * điểm xuống 2,6, sàn tính theo bán kính lại **lớn lên** (0,71 · 2,6 = 1,856), nên
 * biên thật quay về **dấu ▲ = 1,2**. Đó chính là lý do chỗ này viết ra cả hai thay
 * vì chốt một con số.
 */
export const VONG_GIU_BONG_THEM = Math.min(
  BAN_KINH * (SAN_HAI_DIEM_GAN_NHAT - 1),
  1.2,
)

/** Vạch và khoảng trống của vòng nét đứt, theo tỉ lệ khung. */
const VACH_VONG_GIU_BONG = 1.6

/**
 * Bóng về đúng chân người giữ bóng trong bao nhiêu phần của nhịp (AC-33.1).
 *
 * Không đặt bóng thẳng vào chân anh ta ngay khung đầu: chỗ bóng được thấy lần
 * cuối là vùng pha bóng trước dừng, còn điểm của anh ta đã bị giãn ra khỏi vùng
 * đó để hai điểm không chồng nhau — nhảy cái khoảng ấy trong một khung là một
 * cú teleport, đúng thứ người dùng gọi tên ở T518. Một phần tư nhịp là đủ để
 * mắt thấy bóng được **nhận**, rồi ba phần tư còn lại bóng đi theo chân.
 */
const PHAN_NHIP_BAM_CHAN = 0.25

/**
 * Điểm trên đường THẮNG từ `tu` tới `den`.
 *
 * Bóng không đi đường cong như người: một đường chuyền là đường thẳng, và
 * cho bóng vòng cung thì nó trông như một cầu thủ thứ 23.
 */
function diemThang(tu: Diem, den: Diem, tiLe: number): Diem {
  const t = tiLe < 0 ? 0 : tiLe > 1 ? 1 : tiLe
  return { x: tu.x + (den.x - tu.x) * t, y: tu.y + (den.y - tu.y) * t }
}

/** Tổng chiều dài một đường gấp khúc. */
export function chieuDaiDuong(duong: readonly Diem[]): number {
  let tong = 0
  for (let i = 1; i < duong.length; i += 1) {
    const a = duong[i - 1] as Diem
    const b = duong[i] as Diem
    tong += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return tong
}

/**
 * Chỗ quả bóng đang ở trên **cả đường chuyền**, ở tỉ lệ `tiLe` của chiều dài
 * (T524, AC-30.9).
 *
 * **Đây là chỗ khác hẳn với T505.** Trước đó bóng chỉ đi **một đoạn thẳng**
 * từ chỗ cũ tới điểm cuối của pha bóng, bỏ qua mọi vùng nó đi qua — nên một pha
 * ba nhịp chỉ còn là một cú băng chéo sân, và phải vẽ thêm một **đường kẻ vàng**
 * để người xem đoán ra nó đã đi đường nào. Nay bóng **đi hết đường ấy**, nên
 * đường kẻ không còn việc gì để làm.
 *
 * Tham số là tỉ lệ của **chiều dài**, không phải của số đoạn: nhờ vậy bóng đi
 * **đều một tốc độ** suốt cả pha, không chậm lại ở đoạn ngắn rồi vọt lên ở đoạn
 * dài — một đường chuyền không đổi tốc độ giữa đường.
 */
export function diemTrenDuong(duong: readonly Diem[], tiLe: number): Diem {
  const dau = duong[0]
  const cuoi = duong[duong.length - 1]
  if (dau == null || cuoi == null) return { x: RONG / 2, y: CAO / 2 }
  if (duong.length === 1) return dau

  const t = tiLe < 0 ? 0 : tiLe > 1 ? 1 : Number.isFinite(tiLe) ? tiLe : 1
  const tong = chieuDaiDuong(duong)
  if (!(tong > 0)) return cuoi

  let con = t * tong
  for (let i = 1; i < duong.length; i += 1) {
    const a = duong[i - 1] as Diem
    const b = duong[i] as Diem
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    if (d <= 0) continue
    if (con <= d) return diemThang(a, b, con / d)
    con -= d
  }
  return cuoi
}

/**
 * Vận tốc **tức thời** của một chặng tại tỉ lệ `troi` (T504).
 *
 * Trước T504, chặng mới nhận tiếp tuyến là **dây cung** của chặng cũ
 * (`den − tu`). Với một chặng chạy hết thì hai thứ đó bằng nhau, nhưng với một
 * chặng **bị cắt giữa đường** — đổi tốc độ, hay hai tình huống dồn sát nhau —
 * thì dây cung trỏ về cái đích cũ, không phải hướng điểm đang thực sự bay. Kết
 * quả là một cú gật ở đúng chỗ đáng ra phải liền nhất.
 *
 * Đo bằng sai phân trên chính đường cong cũ nên không cần thêm một hàm đạo
 * hàm vào lớp nội suy: hai lần gọi `viTriTaiThoiDiem` là đủ, và nó tự đúng với
 * mọi thay đổi sau này của lớp ấy — kể cả dáng theo thể lực.
 */
export function vanTocCuaChang(
  truoc: ChuyenDiemDang | undefined,
  troi: number,
  doMet: number,
  gioiHan: KhungKep,
): Diem | null {
  if (!truoc) return null

  const t1 = Math.min(1, Math.max(0, troi))
  const t0 = Math.max(0, t1 - BUOC_DO_VAN_TOC)
  if (t1 <= t0) return huongRaKhoiMoc(truoc.tu, truoc.den)

  const tuyChon = { huongVao: truoc.huongVao, doMet, gioiHan }
  const p0 = viTriTaiThoiDiem(truoc.tu, truoc.den, t0, tuyChon)
  const p1 = viTriTaiThoiDiem(truoc.tu, truoc.den, t1, tuyChon)
  const dt = t1 - t0
  return { x: (p1.x - p0.x) / dt, y: (p1.y - p0.y) / dt }
}

/** Một điểm đang đi từ đâu tới đâu, và nó vào mốc đầu theo hướng nào. */
export interface ChuyenDiemDang {
  readonly tu: Diem
  readonly den: Diem
  readonly huongVao: Diem | null
  /**
   * Chặng này dài bao lâu, **riêng của người này** (AC-30.6, D93).
   *
   * Trước T512 cả 22 điểm dùng chung một `msChuyen`. Giờ người kiệt sức có
   * chặng dài hơn ở những nhịp có dư, nên tỉ lệ đã đi được phải chia theo
   * thời lượng của chính anh ta — chia theo một con số chung thì hai chế độ
   * của D93 không khác gì nhau.
   */
  readonly thoiLuong: number
}

export function San2D(props: Props) {
  const { SAN_2D } = useChuoi()
  const { nha, khach, suKien, msMoiPhut, dangChay } = props
  const msChuyen = thoiGianChuyen(msMoiPhut)

  /*
    AI ĐANG GIỮ BÓNG (T603, T605, bảng 3.1 của plan).

    Là một **phép gấp qua các nhịp**, không phải một hàm của dòng đang hiện:
    bốn loại dòng — thẻ vàng, thẻ đỏ, thay người, kiệt sức — **giữ nguyên
    người cũ**, nên phải có chỗ nhớ "người cũ" là ai.

    Tính ngay trong lúc vẽ chứ không trong `useEffect`, và **khoá theo dòng**:
    vẽ lại vì đổi ngôn ngữ hay đổi chế độ màu thì khoá không đổi nên không gấp
    lại, còn nếu để trong effect thì khung đầu của một phút mới sẽ còn vẽ vòng
    quanh người của phút trước.
  */
  /**
   * Ai còn có **điểm trên sân** — vị tệ của luật giữ bóng (D115, T621).
   *
   * Dùng đúng `cacNguoiTrenSan` mà `hinhSan` dùng để dựng điểm, nên "còn trên sân"
   * ở đây và "có một điểm để đeo vòng" là **cùng một câu hỏi**. Suy từ
   * `ben.trenSan` thôi thì hụt: một người có thể ở trong danh sách ấy mà không có
   * ô nào trong sơ đồ, và lúc đó anh ta không được vẽ.
   */
  const trenSan = useMemo(
    () =>
      new Set([
        ...cacNguoiTrenSan(nha.ben, true).map((x) => x.playerId),
        ...cacNguoiTrenSan(khach.ben, false).map((x) => x.playerId),
      ]),
    [nha.ben, khach.ben],
  )

  const khoaDong =
    suKien == null
      ? null
      : `${suKien.phut}|${suKien.buGio ? 'b' : ''}|${suKien.loai}|${suKien.cacCauThu.join(',')}`
  const giuBong = useRef<{
    khoa: string | null
    ai: string | null
    truoc: string | null
  }>({ khoa: null, ai: null, truoc: null })
  if (giuBong.current.khoa !== khoaDong) {
    giuBong.current = {
      khoa: khoaDong,
      truoc: giuBong.current.ai,
      ai: nguoiGiuBong(suKien, giuBong.current.ai, (id) => trenSan.has(id)),
    }
  }
  const aiGiuBong = giuBong.current.ai
  /** Ai cầm bóng khi nhịp này **bắt đầu** — đầu vào của `ganNguoiGiuBong`. */
  const aiGiuBongDauNhip = giuBong.current.truoc ?? aiGiuBong

  const { khung, banKinh, cacDiem, duongBong, cacBuocBong, bongTaiMoc } =
    hinhSan({ ...props, nguoiGiuBong: aiGiuBong })
  const tiLe = tiLeKhung(khung)

  const leX = (RONG - khung.rong) / 2
  const leY = (CAO - khung.cao) / 2
  const giuaX = leX + khung.rong / 2
  const giuaY = leY + khung.cao / 2
  const sauVongTron = khung.cao / 8
  const sauVongCam = khung.rong * 0.12
  const caoVongCam = khung.cao * 0.4375

  // -----------------------------------------------------------------------
  // Chuyển động liên tục (T422, T423, T425, T426)
  // -----------------------------------------------------------------------

  const giamChuyenDong = useGiamChuyenDong()

  /*
    Mép mà điểm không được vượt qua, lấy đúng lề mà `hinhSan` đã dùng cho
    toạ độ tại mốc. Đường cong có thể vòng ra ngoài mặt cỏ nếu không kẹp —
    và một cầu thủ chạy ngoài vạch biên trông như một lỗi vẽ.
  */
  const le = LE_TOI_THIEU * tiLe
  const gioiHan = {
    xTu: leX + le,
    xDen: leX + khung.rong - le,
    yTu: leY + le,
    yDen: leY + khung.cao - le,
  }

  /** Độ mệt của từng người, đọc từ trạng thái trận ĐANG CHẠY (AC-25.7). */
  const doMetTheoNguoi = useMemo(() => {
    const bang = new Map<string, number>()
    for (const ben of [nha.ben, khach.ben]) {
      for (const [playerId, theLuc] of Object.entries(ben.theLuc)) {
        bang.set(playerId, doMetTuTheLuc(theLuc))
      }
    }
    return bang
  }, [nha.ben, khach.ben])

  const dang = useRef(new Map<string, ChuyenDiemDang>())
  /**
   * Pha bóng đang đi: **cả đường chuyền**, kèm thời lượng của riêng nó (T524).
   *
   * Bóng đi nhanh gấp ba người (T505) nhưng nay đi **hết đường**, nên thời
   * lượng phụ thuộc số đoạn chứ không còn là một hằng số.
   */
  const bongDang = useRef<readonly DoanCoNguoi[] | null>(null)
  /**
   * Chỗ bóng được thấy lần cuối (T513).
   *
   * Đọc ref này ngay trong lúc vẽ là cố ý: chỉ cần giá trị của lần vẽ trước,
   * và nhờ vậy "giữ chỗ cũ" không cần thêm một vòng vẽ nào.
   */
  const bongMocCuoi = useRef<Diem | null>(null)
  /**
   * Chỗ bóng được **VẼ** lần cuối (T605).
   *
   * Khác `bongMocCuoi`, vốn giữ toạ độ **mốc** của dòng. Từ lúc bóng biết bám
   * chân người giữ bóng, hai thứ đó không còn bằng nhau: cuối một nhịp bóng ở
   * chân anh ta, còn mốc của dòng là chỗ pha bóng dừng. Dựng chặng mới từ **mốc**
   * là cho bóng nhảy ngược về đó trong một khung — đúng cú giật AC-29.3 cấm.
   */
  const bongVeCuoi = useRef<Diem | null>(null)
  /**
   * Dòng thời gian đang chạy trải trên bao nhiêu mili-giây (T619, D113).
   *
   * Thường là `msMoiPhut`. Riêng dòng **bàn thắng** thì dài hơn: nhịp ấy được kéo
   * thêm `MS_LANG_SAU_BAN_THANG` để người xem kịp đọc (AC-32.5), và quả bóng phải
   * có đủ chỗ để vào lưới rồi lăn về chấm giao bóng trong suốt quãng ấy.
   */
  const nhipBong = useRef(0)

  /*
    Chỗ của bóng ở **mọi** dòng (AC-32.1): dòng này nói gì thì theo, không nói
    gì thì giữ chỗ cũ, và chưa bao giờ thấy bóng thì đặt giữa sân — đúng chỗ
    một quả bóng nằm trước giờ bóng lăn. **Không bao giờ `null`**, nên không có
    dòng nào làm bóng biến mất nữa.
  */
  const bong: Diem =
    bongTaiMoc ?? bongMocCuoi.current ?? { x: RONG / 2, y: CAO / 2 }
  const batDau = useRef(0)
  const [, veLai] = useReducer((n: number) => n + 1, 0)

  /*
    Khoá của một bộ mốc: chỉ khi toạ độ ĐÍCH đổi mới bắt đầu một cú di
    chuyển mới. Vẽ lại vì lý do khác — đổi ngôn ngữ, đổi chế độ màu — không
    được làm các điểm chạy lại từ đầu.
  */
  /*
    Toạ độ bóng nằm trong khoá (T505): bóng có thể đổi chỗ mà không ai đổi
    chỗ, và nếu khoá không để ý tới nó thì chặng của bóng không bao giờ được
    dựng lại.
  */
  const khoaMoc =
    cacDiem.map((d) => `${d.playerId}:${d.x},${d.y}`).join('|') +
    `|bong:${bong.x},${bong.y}`

  useEffect(() => {
    const bayGio = performance.now()
    const cu = dang.current

    const moi = new Map<string, ChuyenDiemDang>()
    for (const d of cacDiem) {
      const truoc = cu.get(d.playerId)
      const met = doMetTheoNguoi.get(d.playerId) ?? 0
      // Tỉ lệ đã đi của chặng CŨ, theo thời lượng của chính chặng ấy (D93).
      const troi =
        truoc && truoc.thoiLuong > 0
          ? (bayGio - batDau.current) / truoc.thoiLuong
          : 1
      /*
        Xuất phát từ chỗ điểm ĐANG ĐỨNG, không từ mốc trước: đổi tốc độ hay
        có tình huống dồn dập thì cú trước có thể chưa đi hết, và bắt nó
        quay về mốc cũ rồi đi lại là một cú giật (AC-25.3).
      */
      const tuDau = truoc
        ? viTriTaiThoiDiem(truoc.tu, truoc.den, troi, {
            huongVao: truoc.huongVao,
            doMet: met,
            gioiHan,
          })
        : { x: d.x, y: d.y }

      moi.set(d.playerId, {
        tu: tuDau,
        den: { x: d.x, y: d.y },
        huongVao: vanTocCuaChang(truoc, troi, met, gioiHan),
        /*
          Thời lượng còn phụ thuộc **quãng phải đi** (T525, AC-30.10): quãng dài
          thì đi lâu hơn chứ không đi nhanh hơn. Trước T525 mọi chặng cùng một
          thời lượng, nên tốc độ tỉ lệ thẳng với quãng và dải tốc độ trên sân rộng
          tới **38,7 lần** (đo ở mức Chậm, phân vị 99 so với phân vị 10).
        */
        thoiLuong: thoiLuongCuaNguoi(
          msMoiPhut,
          msChuyen,
          met,
          Math.hypot(d.x - tuDau.x, d.y - tuDau.y),
          QUANG_CHUAN * tiLe,
        ),
      })
    }

    /*
      Chặng của bóng dựng cùng một lúc và dùng cùng một mốc thời gian với
      người (T505), nên không có chuyện bóng và người đếm giờ lệch nhau.
      Chỉ khác ở **thời lượng** — bóng xong trong một phần ba — và ở **hình
      đường đi**: thẳng, không cong.
    */
    /*
      DÒNG THờI GIAN CỦA PHA BÓNG (T602, spec 006).

      Trước đây lớp vẽ tự dựng một đường gấp khúc rồi cho bóng đi đều trên đó:
      mọi bước giống nhau, nên một đường chuyền và một pha rê bóng trông y hệt.
      Nay `phaBong.ts` dựng từng **đoạn** kèm loại, và loại quyết tốc độ: bóng rời
      chân thì bay, bóng trong chân thì chạy cùng người.
    */
    /*
      Xuất phát từ chỗ bóng ĐANG ĐƯỢC VẼ, không từ toạ độ trên dòng thời
      gian: từ T605 bóng còn bám chân người giữ bóng sau khi pha bóng xong, nên
      hai chỗ ấy lệch nhau. Đây là cùng một lý lẽ đã dùng cho người ở T425:
      chặng mới bắt đầu từ chỗ đang đứng, không từ cái mốc cũ.
    */
    const cuBong = bongDang.current
    const choBongBatDau =
      bongVeCuoi.current ??
      (cuBong
        ? viTriBongTrongPha(cuBong, (bayGio - batDau.current) / msMoiPhut)
        : { x: bong.x, y: bong.y })

    /*
      BẢN GHI TRẬN CŨ (D110): thiếu `cacBuocBong` thì dựng tạm từ `duongBong`
      với loại `chuyen` — tức **đúng cách vẽ của spec 005**: bóng đi hết đường
      của nó ở tốc độ bóng. Không đoán bước nào là rê bóng: trận cũ xem ra
      như bây giờ, không hơn không kém.
    */
    const buocTho: readonly BuocDaQuyDoi[] =
      cacBuocBong.length > 0
        ? cacBuocBong
        : duongBong.length > 0
          ? duongBong.map((d) => ({ diem: d, loai: 'chuyen' as const }))
          : []

    /*
      ĐIỂM CUỐI CỦA ĐƯỜNG BÓNG LÀ CHỖ ĐỨNG CỦA NGƯỜI GIỮ BÓNG SAU CÙNG (T606).

      Engine nói bóng dừng ở **vùng** nào; `hinhSan` lại giãn những người tham gia
      ra khỏi tâm vùng để hai điểm không chồng nhau, nên chỗ đứng của người giữ
      bóng lệch khỏi tâm vùng đúng khoảng giãn ấy — đo ở lát 48: trung vị **1,31
      bán kính**. Cho bước cuối tới thẳng chân anh ta thay vì tới tâm vùng thu được
      hai thứ cùng lúc: AC-33.1 (bóng ở chân người giữ bóng) và bất biến R47
      (người dẫn bóng tới hết nhịp vẫn đứng đúng mốc của mình). **Không đổi một
      con số nào của trận**: `duongBong` và `bongTaiMoc` vẫn là vùng engine kể.
    */
    const diemNguoiCuoi = aiGiuBong
      ? cacDiem.find((d) => d.playerId === aiGiuBong)
      : undefined
    const cuoiTho = buocTho[buocTho.length - 1]
    const buocTheoNguoi: readonly BuocDaQuyDoi[] =
      diemNguoiCuoi && cuoiTho
        ? [
            ...buocTho.slice(0, -1),
            { diem: { x: diemNguoiCuoi.x, y: diemNguoiCuoi.y }, loai: cuoiTho.loai },
          ]
        : buocTho

    /*
      SAU MỘT BÀN THẮNG, BÓNG LĂN VỀ CHẤM GIAO BÓNG (T619, D113).

      Bảng 3.1 nói sau một bàn thắng thì **không ai** giữ bóng — đúng, bóng nằm
      trong lưới. Nhưng nhịp ấy còn được kéo thêm `MS_LANG_SAU_BAN_THANG`, nên
      nếu để nguyên thì quả bóng đứng im suốt 2,5 giây: đo ở lát 49, **ba quãng
      đứng im dài nhất cả trận đều là bàn thắng** (3503, 2512, 1487ms).

      Cho nó lăn về chấm giao bóng — điều thực sự xảy ra trên sân bóng — và trải
      cả dòng thời gian trên **trọn nhịp lắng**, nên bóng tới chấm đúng lúc dòng
      giao bóng kế tiếp nhận việc. **Không đổi bảng 3.1 một dòng nào**, và cũng
      không đổi `duongBong` hay `bongTaiMoc`: bước thêm vào là bước của đường **vẽ**.
    */
    const laBanThang = suKien?.loai === 'ban-thang'
    const cacBuoc: readonly BuocDaQuyDoi[] =
      laBanThang && buocTheoNguoi.length > 0
        ? [
            ...buocTheoNguoi,
            { diem: { x: RONG / 2, y: CAO / 2 }, loai: null },
          ]
        : buocTheoNguoi

    const nhipNay =
      msMoiPhut + (laBanThang ? MS_LANG_SAU_BAN_THANG : 0)
    nhipBong.current = nhipNay

    const duongThoiGian = dongThoiGianPhaBong({
      batDau: choBongBatDau,
      cacBuoc,
      msNhip: nhipNay,
      msNguoi: msChuyen,
      nhanhGap: BONG_NHANH_GAP,
    })

    /*
      Quyền giữ bóng đi theo từng đoạn (D112): một đoạn rê không đổi người, một
      đoạn làm bóng rời chân thì chuyển sang đồng đội gần đích nhất. Đồng đội ở
      đây là đồng đội của đội **mà dòng này nói về** — cả chuỗi bóng thuộc một đội,
      chỉ người giữ bóng **sau cùng** mới có thể thuộc đội kia (mất bóng, cứu thủa).
    */
    const benCamBong = suKien?.doi ?? 'nha'
    const cacNguoi: readonly NguoiChoLuatNhan[] = cacDiem.map((d) => ({
      playerId: d.playerId,
      diem: { x: d.x, y: d.y },
      laDongDoi: d.laDoiNha === (benCamBong === 'nha'),
    }))

    /*
      NGƯỜI MỞ PHA PHẢI THUỘC ĐỘI CỦA DÒNG NÀY (T622).

      `aiGiuBongDauNhip` là người giữ bóng của nhịp trước, và anh ta rất hay
      thuộc **đội kia**: sau một pha cứu thủa thì người giữ bóng là **thủ môn**,
      sau một pha mất bóng là người cướp được. Giao cho anh ta đoạn mở của pha
      bóng kế tiếp — pha của đội kia — là kéo anh ta chạy dọc theo đường bóng
      của người khác. Người dùng gọi đúng tên nó: "thủ môn số 19 chạy loạn xạ
      khắp sân".

      Không thuộc đội của dòng thì để `null`, và `ganNguoiGiuBong` suy người mở
      pha bằng đúng luật D112 — đồng đội đứng gần chỗ pha bóng bắt đầu nhất.
    */
    /*
      VÀ THỦ MÔN KHÔNG MỞ PHA BÓNG, TRỪ KHI CHÍNH DÒNG NÀY NÊU TÊN ANH TA
      (T626).

      T622 ở trên chỉ chặn được nửa chuyện: thủ môn thuộc **đội kia**. Nửa còn
      lại là thủ môn thuộc **đúng đội của dòng này** — sau một pha cứu thua anh
      ta là người giữ bóng, rồi những dòng sau **không nêu ai cả** nên luật "dòng
      không nêu ai thì giữ nguyên người cũ" (D115) để anh ta làm người mở pha của
      chuỗi kế tiếp. Anh ta bị kéo chạy dọc theo đường bóng của cả đội.

      Người dùng xem bản chạy ngày 2026-11-22 và nói: *"lúc phát bóng thủ môn lên
      quá cao"*. Đo trên 10 trận, thủ môn vào cửa sổ cầm bóng **378 lần**, và
      **229 lần trong số đó (61%) là ở dòng KHÔNG nêu tên anh ta** — tức anh ta
      cầm bóng chỉ vì thừa kế, không vì tình huống. Hệ quả đo được: anh ta đi tới
      **74,4 đơn vị trong một nhịp** và lên tới **32,3** trên sân rộng 100.

      **Vì sao chặn ở đây chứ không kẹp anh ta vào vòng cấm.** Đã thử kẹp cả hai
      trục vào vòng cấm: quãng đi lớn nhất tụt 74,4 → 31,8 và chỗ cao nhất 32,3 →
      13,0, **nhưng tỉ lệ "bóng sát chân người giữ bóng" tụt 74,0% → 51,5%** —
      tức đổi một lỗi nhìn thấy được lấy một lỗi nhìn thấy được khác, vì quả bóng
      đi theo đường của engine chứ không theo cái hộp. Chặn ở gốc thì không có
      đánh đổi ấy: lúc anh ta không phải người giữ bóng thì quả bóng **vốn dĩ
      không nên ở chân anh ta**.

      Dòng **có** nêu tên anh ta (149 lần — pha cứu thua, pha anh ta thật sự chạm
      bóng) thì anh ta vẫn mở pha như cũ.
    */
    const laThuMonThuaKe =
      aiGiuBongDauNhip != null &&
      cacDiem.some((d) => d.playerId === aiGiuBongDauNhip && d.laThuMon) &&
      !(suKien?.cacCauThu ?? []).includes(aiGiuBongDauNhip)

    const moPhaHopLe =
      aiGiuBongDauNhip != null &&
      !laThuMonThuaKe &&
      cacNguoi.some(
        (x) => x.playerId === aiGiuBongDauNhip && x.laDongDoi,
      )

    bongDang.current = ganNguoiGiuBong({
      cacDoan: duongThoiGian,
      nguoiBatDau: moPhaHopLe ? aiGiuBongDauNhip : null,
      nguoiKetThuc: aiGiuBong,
      cacNguoi,
    })
    bongMocCuoi.current = { x: bong.x, y: bong.y }

    dang.current = moi
    batDau.current = bayGio
    veLai()
    // `gioiHan` và `cacDiem` dựng lại mỗi lần vẽ; `khoaMoc` mới là thứ quyết
    // định có bắt đầu cú di chuyển mới hay không.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khoaMoc, msChuyen, giamChuyenDong])

  /*
    Vòng khung hình, TÁCH khỏi việc dựng chặng (T508).

    Trước T508, vòng này nằm trong cùng effect với việc dựng chặng và **tự
    thoát** khi hết `msChuyen`, nên sau mỗi cú di chuyển là mọi điểm đứng im cho
    tới tình huống sau — đo ở lát 37: tới **2114ms**. Tách ra thì vòng chạy
    liên tục trong khi trận chạy, mà dự liệu chặng vẫn chỉ dựng lại khi toạ độ
    đích đổi — nên vẽ lại vì đổi ngôn ngữ hay đổi chế độ màu vẫn **không**
    làm các điểm chạy lại từ đầu, đúng tính chất quý nhất của code cũ.

    Tạm dừng là `dangChay = false`: vòng tắt, không khung nào được xin, sân đóng
    băng ở đúng khung cuối (AC-28.5, và AC-10.4 của spec 001 vẫn đúng).
  */
  useEffect(() => {
    if (!dangChay || giamChuyenDong || msChuyen <= 0) return

    let yeuCau = 0
    let truoc = performance.now()
    const buoc = () => {
      /*
        ĐỒNG HỒ CỦA LỚP DAO ĐỘNG CỘNG DỒN Ở ĐÂY (T620, D114).

        Nó tiến đúng một đơn vị mỗi `msMoiPhut`, **đơn điệu và không bao giờ bão
        hoà**. Bản trước là `phutDongHo + Math.min(1, …)` (D90 của spec 005), và câu
        `Math.min` ấy chính là nguồn của việc **cả sân đóng băng**: một nhịp kéo dài
        hơn `msMoiPhut` — nhịp lắng sau bàn thắng, hay `setTimeout` trôi dưới tải — làm
        con số bão hoà và hai mươi hai điểm đứng lại cho tới phút sau. Đo ở lát 49:
        trong một quãng 1265ms, tổng toạ độ của cả 23 nhóm vẽ đổi đúng **0,2 đơn vị**.

        Bỏ `Math.min` mà giữ công thức cũ thì tệ hơn: mỗi ranh giới phút đồng hồ sẽ
        **nhảy lùi** đúng phần vượt, tức cả sân giật cùng một lúc.

        Đặt trong vòng khung hình chứ không trong lúc vẽ, vì hai lý do: một khung
        cộng đúng một lần dù React vẽ lại mấy bận; và **tạm dừng đóng băng bằng cấu
        trúc** (AC-28.5) — vòng tắt thì không ai cộng nữa, không cần thêm một nhánh nào.
      */
      const bayGio = performance.now()
      if (msMoiPhut > 0) {
        // Chặn một khung dài bất thường — tab bị ẩn rồi hiện lại — thành một cú nhảy.
        const troi = Math.min(bayGio - truoc, msMoiPhut)
        dongHoDao.current += troi / msMoiPhut
      }
      truoc = bayGio
      veLai()
      yeuCau = requestAnimationFrame(buoc)
    }
    yeuCau = requestAnimationFrame(buoc)
    return () => cancelAnimationFrame(yeuCau)
  }, [dangChay, giamChuyenDong, msChuyen, msMoiPhut])

  /**
   * Đồng hồ của lớp dao động, tính bằng **nhịp** (T620, D114).
   *
   * Vòng khung hình cộng vào nó; chỗ này chỉ đọc. Xem chú thích trong vòng ấy về
   * lý do nó không còn là `phutDongHo + Math.min(1, …)`.
   */
  const dongHoDao = useRef(0)

  /*
    Tỉ lệ đã đi được của cú di chuyển hiện tại — tính MỘT lần cho cả 22 điểm,
    để chúng không lệch nhau vài phần nghìn giây chỉ vì thứ tự vòng lặp.
  */
  const bayGioVe = performance.now()

  /** Tỉ lệ đã đi được của **nhịp**, mốc thời gian của cả pha bóng. */
  function tiLeNhipVe(): number {
    const nhip = nhipBong.current > 0 ? nhipBong.current : msMoiPhut
    if (!(nhip > 0)) return 1
    return (bayGioVe - batDau.current) / nhip
  }

  /** Tỉ lệ đã đi được của một người, theo thời lượng riêng của anh ta (D93). */
  function troiQuaCua(tt: ChuyenDiemDang): number {
    if (!(tt.thoiLuong > 0)) return 1
    return (bayGioVe - batDau.current) / tt.thoiLuong
  }

  /**
   * Chỗ vẽ của bóng ở thời điểm này (T505, AC-30.2).
   *
   * Giảm chuyển động thì về đúng toạ độ mốc, như mọi thứ khác trên sân này.
   */
  function viTriBongVe(): Diem {
    if (giamChuyenDong) {
      bongVeCuoi.current = null
      return { x: bong.x, y: bong.y }
    }
    const cacDoan = bongDang.current
    const tiLeNhip = tiLeNhipVe()
    const theoDoan =
      cacDoan == null || cacDoan.length === 0
        ? { x: bong.x, y: bong.y }
        : viTriBongTrongPha(cacDoan, tiLeNhip)

    /*
      BÓNG KHÔNG ĐANG BAY THÌ NÓ Ở CHÂN NGƯỜI GIỮ BÓNG (AC-33.1, T605).

      Hai lúc bóng không bay, và cả hai đều là nguồn của những quãng bóng đứng
      im đo được ở lát 47:

      1. **Nhịp không có pha bóng nào** — `thay-nguoi`, `kiet-suc`, hay một dòng
         engine không kể pha bóng. Dòng thời gian lúc ấy chỉ có đúng một đoạn
         `giu` đứng tại chỗ, nên bóng nằm yên cả nhịp. Bắt đầu bám ngay: `0`.
      2. **Sau khi pha bóng đã xong** — một dòng được hiển thị lâu hơn một nhịp
         (nhiều phút liền không có tình huống nào), và đây mới là phần lớn của
         thời gian bóng đứng yên: chỉ **3 trong 65 nhịp** của một trận là nhịp
         không có pha bóng. Bắt đầu bám khi dòng thời gian đã hết: `1`.

      Lấy `viTriVe` chứ không lấy toạ độ mốc, nên bóng đi theo **cả lớp dao
      động** của anh ta: một quả bóng ở chân người đang nhún nhảy thì cũng
      nhún nhảy, chứ không đứng yên cách đó một bán kính.
    */
    /*
      Bám **người giữ bóng LÚC NÀY**, không bám người giữ bóng cuối dòng.

      Hai thứ đó khác nhau, và đo ở lát 49 mới thấy cái giá: ở dòng giao bóng
      thì bảng 3.1 trả **không ai** làm người giữ bóng cuối dòng, trong khi vòng
      nét đứt vẫn vẽ quanh người mở pha đã suy ra — màn hình nói một đằng, quả
      bóng đứng im một nẻo: đo được **1004ms** ở đúng phút 0.

      `aiGiuBongLucNay` còn an toàn về chuyện lệch khung — cái bẫy đã sập một lần
      ở lát 48: React vẽ **trước** rồi mới chạy effect, nên đọc thẳng `aiGiuBong`
      thì khung đầu của một dòng mới đã là người MỚI trong khi dòng thời gian vẫn
      của nhịp CŨ. `aiGiuBongLucNay` suất phát từ chính `bongDang.current`, mà ref
      ấy chỉ đổi trong effect, nên nó không bao giờ đi trước dòng thời gian.
    */
    const nguoi = aiGiuBongLucNay
      ? cacDiem.find((d) => d.playerId === aiGiuBongLucNay)
      : undefined
    if (nguoi == null) {
      bongVeCuoi.current = theoDoan
      return theoDoan
    }

    /*
      MỘT PHA BÓNG KHÔNG LÀM QUẢ BÓNG NHÚC NHÍCH THÌ KHÔNG PHẢI MỘT PHA BÓNG.

      Engine kể các bước theo **vùng**, và một pha ngắn — một pha cướp bóng, chẳng
      hạn — có thể có mọi bước rơi vào cùng một vùng. Lúc ấy mọi đoạn dài bằng
      không, bóng nằm yên cả nhịp, và luật bám chân lại đợi tới khi dòng thời gian
      hết mới bắt đầu — đo được **1200ms** ở một pha như vậy. Bắt đầu bám ngay.
    */
    const daiDuongBong = cacDoan
      ? cacDoan.reduce(
          (t, d) => t + Math.hypot(d.den.x - d.tu.x, d.den.y - d.tu.y),
          0,
        )
      : 0
    const batDauBam =
      (cacBuocBong.length > 0 || duongBong.length > 0) &&
      daiDuongBong > banKinh / 4
        ? 1
        : 0
    const chan = viTriVe(nguoi)
    const u = Math.min(
      1,
      Math.max(0, (tiLeNhip - batDauBam) / PHAN_NHIP_BAM_CHAN),
    )
    const ra = {
      x: theoDoan.x + (chan.x - theoDoan.x) * u,
      y: theoDoan.y + (chan.y - theoDoan.y) * u,
    }
    bongVeCuoi.current = ra
    return ra
  }

  /*
    Hiệu ứng bàn thắng (T514, AC-32.4).

    Nhận ra từ loại của dòng đang hiện, và **mỗi bàn một lần**: khoá gồm cả
    phút và người ghi, nên hai bàn liền nhau thì hiệu ứng thứ hai **thay** hiệu
    ứng đang chạy chứ không xếp hàng (trường hợp biên ở mục 5 của spec).
  */
  const khoaBanThang =
    suKien && suKien.loai === 'ban-thang'
      ? `${suKien.phut}|${suKien.cacCauThu[0] ?? ''}`
      : null

  /*
    Hiệu ứng sống theo ĐỒNG HỒ CỦA NÓ, không theo dòng đang hiển thị.

    Bản đầu của T514 gắn đời sống hiệu ứng vào `suKien.loai === 'ban-thang'`, và
    nó **không hiện lên được**: một dòng chỉ được hiển thị trong một nhịp — 70ms
    ở mức Nhanh — rồi dòng sau đẩy nó đi, trong khi hiệu ứng phải chạy 1,5 giây.
    Đo trên một trận có bàn thắng: 0 trong 383 mẫu thấy nó.

    Nay chỗ ghi bàn, người ghi và mốc thời gian được **chụp lại** vào một ref
    ngay lúc dòng bàn thắng xuất hiện, nên hiệu ứng chạy đủ 1,5 giây dù dòng
    tường thuật đã sang chuyện khác.
  */
  const anMung = useRef<{
    readonly batDau: number
    readonly nguoi: string | null
    readonly diem: Diem
  } | null>(null)
  const khoaAnMungCu = useRef<string | null>(null)
  if (khoaBanThang !== null && khoaBanThang !== khoaAnMungCu.current) {
    khoaAnMungCu.current = khoaBanThang
    anMung.current = {
      batDau: performance.now(),
      nguoi: suKien?.cacCauThu[0] ?? null,
      diem: { x: bong.x, y: bong.y },
    }
  }

  const tienHieuUng = anMung.current
    ? Math.min(
        1,
        (performance.now() - anMung.current.batDau) /
          THOI_GIAN_HIEU_UNG_BAN_THANG,
      )
    : 1
  /** Có đang trong 1,5 giây của một bàn thắng hay không. */
  const dangAnMung = tienHieuUng < 1
  const nguoiGhiBan = dangAnMung ? (anMung.current?.nguoi ?? null) : null
  const diemAnMung = anMung.current?.diem ?? bong

  /*
    "Thời điểm trận" liên tục, tính bằng nhịp — thứ duy nhất lớp dao động biết
    về thời gian (D90, nay là D114). Nó chạy theo **nhịp của trận**: đổi mức tốc
    độ thì nó chạy nhanh hay chậm theo, và tạm dừng thì nó đứng.
  */
  const thoiDiemTran = dongHoDao.current

  /** Biên độ dao động chờ, đo theo khoảng giãn đã co theo khung sân (AC-28.2). */
  const bienDoDao = bienDoTuKhoangGian(BUOC_GIAN * tiLe)

  /**
   * Ai đang giữ bóng **ngay lúc này** — dấu vòng nét đứt bám vào con số này.
   *
   * Khác `aiGiuBong`, vốn là người giữ bóng **sau cùng** của cả dòng. Trong một
   * pha nhiều bước, quyền giữ bóng đi qua mấy người (D112), và vòng phải đi theo:
   * một dấu nói "anh ta đang có bóng" mà đứng im suốt pha trong khi bóng đã qua
   * chân hai người khác là một dấu nói sai.
   */
  const aiGiuBongLucNay =
    giamChuyenDong || msChuyen <= 0 || bongDang.current == null
      ? aiGiuBong
      : nguoiGiuBongLucNay(bongDang.current, tiLeNhipVe())

  function viTriVe(d: DiemCauThu): Diem {
    if (giamChuyenDong) return { x: d.x, y: d.y }
    const tt = dang.current.get(d.playerId)
    const thuong = tt
      ? viTriTaiThoiDiem(tt.tu, tt.den, troiQuaCua(tt), {
          huongVao: tt.huongVao,
          doMet: doMetTheoNguoi.get(d.playerId) ?? 0,
          gioiHan,
        })
      : { x: d.x, y: d.y }

    /*
      NGƯỜI ĐANG CÓ BÓNG ĐI THEO ĐƯỜNG CỦA BÓNG (D104, D105, T606).

      Chiều này chứ không chiều ngược lại: bóng bám chân người thì nó không
      bao giờ đi hết một đường chuyền nữa — mất đúng thứ T524 vừa làm được.
      Cho người đi theo bóng thì giữ cả hai: bóng đi đường thật của nó, còn người
      dẫn bóng bám lấy nó.
    */
    const cacDoan = bongDang.current
    const cuaSo =
      msChuyen > 0 && cacDoan ? cuaSoGiuBong(cacDoan, d.playerId) : null
    const theoBong =
      cuaSo && cacDoan
        ? viTriNguoiGiuBong({
            cuaSo,
            tiLe: tiLeNhipVe(),
            viTriBong: (t) => viTriBongTrongPha(cacDoan, t),
            viTriThuong: thuong,
            moc: { x: d.x, y: d.y },
          })
        : thuong

    /*
      THỦ MÔN KHÔNG RỜI MỘT PHẦN BA SÂN CỦA MÌNH, KỂ CẢ KHI ĐANG CẦM BÓNG
      (AC-30.7 của spec 005, T622).

      `hinhSan` đã kẹp thủ môn vào dải của anh ta từ T521, và một phép kiểm
      duyệt mọi dòng của 10 mã trận × 7 quân số canh điều đó. Nhưng T606 cho
      người giữ bóng đi theo đường của bóng ở **lớp vẽ**, mà bộ kiểm chạy ở
      `environment: 'node'` không có đường nào nhìn tới lớp ấy — nên cả 1291 phép
      kiểm vẫn xanh trong khi thủ môn chạy tới giữa sân. Mắt người dùng bắt được.

      Kẹp ở đây, không phải bỏ hẳn luật đi theo bóng: thủ môn có bóng trong chân
      thì vẫn nhúch nhích theo nó, chỉ là không bước qua vạch một phần ba sân.
    */
    const goc = d.laThuMon
      ? (() => {
          const dai = daiThuMon(d.laDoiNha, khung)
          return { x: kep(theoBong.x, dai.tu, dai.den), y: theoBong.y }
        })()
      : theoBong

    /*
      Dao động cộng vào SAU CÙNG, và chỉ cộng cho người — không cho bóng:
      một quả bóng nằm yên thì nằm yên. Vị trí tại mốc của lớp nội suy
      không bị đụng tới, nên bất biến của nó còn nguyên (D89).
    */
    const lech = lechDaoDong(d.playerId, thoiDiemTran, bienDoDao)
    return {
      x: kep(goc.x + lech.x, gioiHan.xTu, gioiHan.xDen),
      y: kep(goc.y + lech.y, gioiHan.yTu, gioiHan.yDen),
    }
  }

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${RONG} ${CAO}`}
        className="w-full rounded-lg border border-vien-dam bg-nen-nhan"
        role="img"
        aria-label={SAN_2D.moTaSan(nha.ten, khach.ten)}
      >
        {/*
          Mặt sân là một hình riêng, không phải màu nền của cả ảnh: khung co
          lại theo quân số (AC-15.6) thì phải THẤY nó co — nền phủ kín ảnh
          làm sân 5 trông y hệt sân 11.
        */}
        <rect
          x={leX}
          y={leY}
          width={khung.rong}
          height={khung.cao}
          fill="var(--co-nen-dam)"
          aria-hidden="true"
        />

        {/* Vạch sân: chỉ những vạch giúp định hướng, không vẽ cho đẹp. */}
        <g
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={0.4 * tiLe}
          aria-hidden="true"
        >
          <rect
            x={leX + 2}
            y={leY + 2}
            width={khung.rong - 4}
            height={khung.cao - 4}
          />
          <line x1={giuaX} y1={leY + 2} x2={giuaX} y2={leY + khung.cao - 2} />
          <circle cx={giuaX} cy={giuaY} r={sauVongTron} />
          <rect
            x={leX + 2}
            y={giuaY - caoVongCam / 2}
            width={sauVongCam}
            height={caoVongCam}
          />
          <rect
            x={leX + khung.rong - 2 - sauVongCam}
            y={giuaY - caoVongCam / 2}
            width={sauVongCam}
            height={caoVongCam}
          />
        </g>

        {/*
          ĐƯỜNG KẺ VÀNG ĐÃ BỎ (T524).

          Nó có từ spec 001 (AC-10.2, D40) vì bóng không đi đường của mình: bóng
          nhảy thẳng tới điểm cuối, nên phải vẽ lại đường đã đi cho người xem đoán
          ra. Nay bóng đi hết đường ấy, nên một đường kẻ đứng yên chỉ còn làm
          rối mặt sân — người dùng nói thẳng ở T518 là không cần nữa.
          `duongBong` vẫn nằm trong `HinhSan`: nó là **đường đi của bóng**, giờ
          được dùng để bóng đi chứ không để vẽ.
        */}
        {/*
          Vòng sáng lan ra từ chỗ ghi bàn (AC-32.4). Giảm chuyển động thì
          không vẽ — chỉ còn chữ, đúng AC-32.6.
        */}
        {dangAnMung && !giamChuyenDong && (
          <circle
            cx={diemAnMung.x}
            cy={diemAnMung.y}
            r={banKinh * (1 + VONG_SANG_NO_GAP * tienHieuUng)}
            fill="none"
            stroke="var(--co-vang)"
            strokeWidth={1.2 * tiLe * (1 - tienHieuUng)}
            opacity={1 - tienHieuUng}
            aria-hidden="true"
          />
        )}

        {cacDiem.map((d) => {
          /*
            Toạ độ vẽ do lớp nội suy quyết định, KHÔNG còn do CSS transition.
            CSS chỉ nội suy THẲNG giữa hai giá trị và cho mọi điểm đúng một
            nhịp, nên nó không dựng được đường cong (AC-25.1) và cũng không
            cho mỗi người một dáng riêng theo thể lực (AC-25.7).
          */
          const v = viTriVe(d)
          return (
          <g
            key={d.playerId}
            transform={`translate(${v.x} ${v.y})`}
          >
            <title>{d.moTa}</title>
            <circle
              r={
                /*
                  Điểm người ghi bàn phóng to (AC-32.4), nhưng chặn ở đúng khoảng
                  trống giữa hai viền — xem `PHI_THEM_NGUOI_GHI_BAN`.
                */
                d.playerId === nguoiGhiBan && dangAnMung && !giamChuyenDong
                  ? banKinh +
                    PHI_THEM_NGUOI_GHI_BAN * tiLe * (1 - tienHieuUng)
                  : banKinh
              }
              fill={d.mauNen}
              stroke={d.noiBat ? 'var(--co-vang)' : 'var(--co-net-mo)'}
              strokeWidth={(d.noiBat ? 1.4 : 0.5) * tiLe}
            />
            <text
              x={0}
              y={BAN_KINH * 0.38 * tiLe}
              textAnchor="middle"
              fontSize={BAN_KINH * tiLe}
              fontWeight={d.noiBat ? 800 : 500}
              fill={d.mauChu}
            >
              {d.nhan}
            </text>
            {/*
              Dấu hình chữ cho người đang tham gia tình huống: P9 cấm truyền
              đạt thông tin quan trọng CHỈ bằng màu, mà nền ở đây là màu áo
              người dùng tự chọn nên tương phản không kiểm soát được. Viền dày
              cộng dấu này là hai tín hiệu không phụ thuộc màu.
            */}
            {/*
              VÒNG NÉT ĐẮT quanh người đang giữ bóng (AC-33.4, D108).

              **Nét đứt là một HÌNH, không phải một màu** (P9): nền điểm mang
              màu áo do người dùng tự chọn nên không kiểm soát được tương phản,
              và đổi màu điểm thì người không phân biệt màu không thấy gì. Vẽ
              **trước** dấu ▲ để dấu ấy luôn nằm trên, và bán kính bị chặn bởi
              `VONG_GIU_BONG_THEM` nên nó không trùm tâm ai và không đụng dấu ▲.
            */}
            {d.playerId === aiGiuBongLucNay && (
              <circle
                r={banKinh + VONG_GIU_BONG_THEM * tiLe}
                fill="none"
                stroke="var(--co-chu)"
                strokeWidth={0.5 * tiLe}
                strokeDasharray={`${VACH_VONG_GIU_BONG * tiLe} ${VACH_VONG_GIU_BONG * tiLe}`}
                aria-hidden="true"
              />
            )}
            {d.noiBat && (
              <text
                x={0}
                y={-banKinh - 1.2 * tiLe}
                textAnchor="middle"
                fontSize={3.6 * tiLe}
                fontWeight={800}
                fill="var(--co-vang)"
                stroke="var(--co-net)"
                strokeWidth={0.25 * tiLe}
              >
                {SAN_2D.dauThamGia}
              </text>
            )}
          </g>
          )
        })}

        {/*
          QUẢ BÓNG VẼ SAU CÁC ĐIỂM NGƯỜI (T520, AC-32.1).

          Trong SVG, vẽ sau là nằm trên. Bản đầu của T513 vẽ bóng ngay sau
          đường bóng, tức **trước** 22 điểm cầu thủ — đo trên bản build một
          trận trọn vẹn: **40,5% số khung** có tâm bóng nằm trong lòng một điểm,
          tức bị che hẳn. Mắt người dùng bắt được ở T518, gọi đúng tên là "bóng
          đang bị chìm". Quả bóng là thứ mắt người xem bám vào, nên nó phải nằm
          trên cùng — cùng với kênh chữ của hiệu ứng bàn thắng, vì một dòng chữ
          bị điểm đè lên cũng là một kênh thông tin bị mất (P9).
        */}
        <g
          transform={`translate(${viTriBongVe().x} ${viTriBongVe().y})`}
          aria-hidden="true"
        >
          {/*
            Quả bóng vẽ ra **quả bóng** (AC-32.8, T522): đĩa trắng, viền sẫm, một
            mảng đen giữa và năm mảng nhỏ quanh — đú ba mảng đen là đủ để mắt
            đọc ra quả bóng ở cỡ này. Trắng trên mặt cỏ cho tương phản 7,2:1,
            và **không màu áo nào của người dùng trùng được với trắng-đen có họa
            tiết**, nên bóng không lẫn vào một điểm cầu thủ.
          */}
          <circle
            r={1.7 * tiLe}
            fill="#ffffff"
            stroke="var(--co-net)"
            strokeWidth={0.35 * tiLe}
          />
          <circle r={0.52 * tiLe} fill="var(--co-net)" />
          {[0, 1, 2, 3, 4].map((i) => {
            const goc = (i / 5) * Math.PI * 2 - Math.PI / 2
            return (
              <circle
                key={i}
                cx={Math.cos(goc) * 1.12 * tiLe}
                cy={Math.sin(goc) * 1.12 * tiLe}
                r={0.34 * tiLe}
                fill="var(--co-net)"
              />
            )
          })}
        </g>

        {/*
          KÊNH CHỮ của hiệu ứng (AC-32.4, AC-32.6, hiến pháp P9).

          Nó **không** tắt khi giảm chuyển động: một dòng chữ đứng yên không
          phải là chuyển động, và nó là thứ duy nhất còn lại ở chế độ ấy — nên
          thông tin "vừa có bàn thắng" không đi qua một kênh duy nhất là hình.
        */}
        {dangAnMung && (
          <text
            x={giuaX}
            y={leY + khung.cao * 0.3}
            textAnchor="middle"
            fontSize={7 * tiLe}
            fontWeight={800}
            fill="var(--co-vang)"
            stroke="var(--co-net)"
            strokeWidth={0.4 * tiLe}
            opacity={giamChuyenDong ? 1 : 1 - tienHieuUng * 0.3}
          >
            {SAN_2D.hieuUngBanThang}
          </text>
        )}
      </svg>
    </figure>
  )
}
