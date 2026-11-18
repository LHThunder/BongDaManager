import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { mauChuTuongPhan } from '../../domain/colors'
import { laySoDo, soNguoiCuaSoDo } from '../../domain/formations'
import type { PositionId } from '../../domain/types'
import type { BenDoi, LoaiSuKien, SuKien } from '../../engine/suKien'
import type { BenTran } from '../../engine/tran'
import { latVung, vungCuaViTri, type VungSan } from '../../engine/vung'
import { useChuoi } from '../../hooks/useNgonNgu'
import { bienDoTuKhoangGian, lechDaoDong } from '../daoDong'
import {
  doMetTuTheLuc,
  huongRaKhoiMoc,
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
 * Tâm theo trục dọc sân cho từng dải, tính theo TỈ LỆ chiều dài khung.
 *
 * Toạ độ ô vốn đã là phần trăm sân (D15), nên đổi khung là đủ — không cần
 * một bảng toạ độ riêng cho mỗi quân số. Nhân với 100 ra lại đúng bộ số
 * 9/32/56/79 của spec 001.
 */
const TI_LE_DAI: readonly number[] = [0.09, 0.32, 0.56, 0.79]

/** Tâm theo trục ngang sân cho từng cột, theo tỉ lệ chiều rộng khung. */
const TI_LE_COT: Readonly<Record<VungSan['cot'], number>> = {
  trai: 13 / 64,
  giua: 0.5,
  phai: 51 / 64,
}

/** Độ cao đội hình đẩy cả đội lên hay xuống theo hướng tấn công của họ. */
const DICH_THEO_DO_CAO: Readonly<Record<string, number>> = {
  thap: -5,
  'trung-binh': 0,
  cao: 5,
}

const BAN_KINH = 3.4

/** Khoảng giãn giữa hai người cùng ĐỘI đứng cùng một vùng. */
const BUOC_GIAN = 8

/**
 * Đẩy hai đội lệch nhau theo trục dọc, mỗi đội về phía khung thành của mình.
 *
 * Cần thiết vì lưới vùng cố tình cho hai đội đứng CHUNG vùng: tiền đạo đội
 * khách (dải 3 của họ) lật sang chính là dải 0 của đội nhà, tức ngay trước
 * khung thành đội nhà — đúng bóng đá. Nhưng vẽ đúng một toạ độ thì hai điểm
 * nằm đè lên nhau và sân chỉ hiện 13 điểm thay vì 22. Lệch 4 đơn vị mỗi bên
 * cho khoảng cách 8, lớn hơn đường kính 6,8 của một điểm.
 *
 */
const LECH_DOI = 4

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
function cacNguoiTrenSan(
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

/**
 * Toạ độ tâm của một vùng, đã kẹp vào mặt cỏ.
 *
 * Xuất ra ngoài để phép kiểm của T510 tính được **chỗ đúng ra phải đứng** của một
 * người tham gia tình huống, thay vì chỉ so các điểm với nhau — AC-28.3 là phát
 * biểu về **vùng**, nên phép kiểm phải biểu diễn được vùng thành toạ độ.
 */
export function toaDo(
  vung: VungSan,
  dichX: number,
  khung: KhungSan,
): { x: number; y: number } {
  const tiLe = tiLeKhung(khung)
  const le = LE_TOI_THIEU * tiLe
  const leX = (RONG - khung.rong) / 2
  const leY = (CAO - khung.cao) / 2
  const x = leX + TI_LE_DAI[vung.dai] * khung.rong + dichX
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
 * Khối đội hình nghiêng theo bóng tối đa bao nhiêu: **một phần mười chiều dài
 * sân** (AC-30.4, quyết định D94).
 *
 * Ngưỡng này là do người dùng chốt lúc `/clarify`: đủ để thấy đội đang dồn lên
 * hay lùi về, mà sơ đồ vẫn nhận ra được. Bốn dải cách nhau ~0,23 chiều dài, nên
 * 0,1 là **chưa đầy một nửa** khoảng giữa hai dải: một hàng bốn không bao giờ trôi
 * sang chỗ của hàng bên.
 */
const BIEN_NGHIENG_KHOI = 1 / 10

/**
 * Hệ số co khối: dịch bao nhiêu phần của khoảng cách từ một dải tới dải có bóng.
 *
 * Chọn sao cho người ở dải **xa bóng nhất** dịch đúng `BIEN_NGHIENG_KHOI` chiều
 * dài sân: hai dải ngoài cùng cách nhau 0,7 chiều dài, nên 0,1 / 0,7 = 1/7.
 */
const PHAN_CO_KHOI =
  BIEN_NGHIENG_KHOI /
  ((TI_LE_DAI[TI_LE_DAI.length - 1] as number) - (TI_LE_DAI[0] as number))

/**
 * Một người KHÔNG tham gia dịch bao nhiêu theo trục dọc, vì bóng đang ở dải
 * nào (AC-30.4, quyết định D94).
 *
 * **Cả khối CO VỀ phía bóng, không phải cả khối trượt theo bóng** — dịch của mỗi
 * người tỉ lệ với khoảng cách từ dải của anh ta tới dải có bóng, nên người đứng
 * **đúng dải có bóng không dịch một đơn vị nào**. Đó không phải thẩm mỹ: hai bản
 * trước của T510 dịch **cả khối một lượng như nhau** và đều phá AC-30.5, hai kiểu
 * khác nhau, cả hai chỉ lộ ra khi đo trên 10 mã trận:
 * - Dịch theo tỉ lệ đều → hai dải giữa cho dịch **3,43**, đúng bằng `LECH_DOI` = 4,
 *   tức triệt tiêu khoảng lệch duy nhất tách một người không tham gia khỏi người
 *   tham gia đứng cùng dải: hai điểm còn cách **0,57** đơn vị.
 * - Dịch nguyên `r/10` theo dấu → đẩy những người ở dải ngoài cùng vào **phép kẹp
 *   mặt cỏ**, mà phép kẹp thì dồn mọi người bị kẹp về **đúng một toạ độ**: thủ
 *   môn đội nhà và một tiền đạo đội khách cách nhau **0,00** đơn vị.
 *
 * Co về phía bóng tránh được cả hai bằng cấu trúc, không bằng cẩn thận: mọi dịch
 * đều **hướng vào trong**, nên không ai bị đẩy ra mép cỏ; dịch bằng 0 ở đúng dải
 * có bóng, nên khoảng lệch với người tham gia không hề bị ăn; và hệ số < 1 nên
 * thứ tự các dải không đảo — 4-4-2 vẫn ra 4-4-2, chỉ gọn lại một phần bảy.
 *
 * Trả 0 khi không biết bóng ở đâu (chưa có dòng nào, hay dòng không mang vùng):
 * đứng theo sơ đồ là câu trả lời đúng khi chưa có thông tin.
 */
export function nghiengKhoiTheoBong(
  vungNguoi: VungSan,
  vungBong: VungSan | null,
  khung: KhungSan,
): number {
  if (vungBong == null) return 0
  const tiBong = TI_LE_DAI[vungBong.dai]
  const tiNguoi = TI_LE_DAI[vungNguoi.dai]
  if (tiBong == null || tiNguoi == null) return 0
  return PHAN_CO_KHOI * (tiBong - tiNguoi) * khung.rong
}

export interface DiemCauThu {
  readonly playerId: string
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
}

interface Props extends DuLieuVe {
  /** Nhịp đồng hồ trận: bao nhiêu mili-giây cho một phút chơi. */
  readonly msMoiPhut: number
  /**
   * Phút ĐỒNG HỒ của trận (T508).
   *
   * **Không phải `suKien.phut`.** Đó là phút HIỂN THỊ, và nó không nhích khi
   * một phút không có tình huống nào — bẫy đã biết từ spec 004, ghi ở D90.
   * Dao động chờ bám vào con số này, nên bám sai là sân đứng chết hàng giây.
   */
  readonly phutDongHo: number
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
      ((DICH_THEO_DO_CAO[doCao] ?? 0) * huong - LECH_DOI * huong) * tiLe

    const tren = cacNguoiTrenSan(doiTren.ben, laDoiNha)
    const lech = lechTrongVung(tren, buocGian)
    const mauChu = mauChuTuongPhan(doiTren.mauAo)

    for (const x of tren) {
      // Người tham gia tình huống dịch TỚI chỗ bóng; người khác giữ chỗ.
      const noiBat = thamGia.has(x.playerId)
      const diChuyen = noiBat && vungSuKien !== null
      const { x: cx, y: cy } = toaDo(
        diChuyen && vungSuKien ? vungSuKien : x.vung,
        diChuyen
          ? 0
          : dichX + nghiengKhoiTheoBong(x.vung, vungSuKien, khung),
        khung,
      )
      const lechY = diChuyen
        ? (lechThamGia.get(x.playerId) ?? 0)
        : (lech.get(x.playerId) ?? 0)
      const so = soAo(x.playerId)

      cacDiem.push({
        playerId: x.playerId,
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
        ),
      })
    }
  }

  const duongBong = (suKien?.duongBong ?? []).map((v) =>
    toaDo(vungTrenSan(v, suKien?.doi ?? 'nha'), 0, khung),
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
 * Bóng nhanh gấp mấy lần người (AC-30.2, T505).
 *
 * Bóng đi hết chặng của nó trong `msChuyen / 3`, nên nó tới đích trong khoảng
 * một phần ba đầu — mắt theo bóng trước, người theo sau, đúng như một đường
 * chuyền. Trước T505 bóng được vẽ thắng tại toạ độ mốc, tức **nhảy tức thời**.
 */
const BONG_NHANH_GAP = 3

/** Hiệu ứng bàn thắng chạy bao lâu, mực thời gian thật (AC-32.4). */
const THOI_GIAN_HIEU_UNG_BAN_THANG = 1500

/** Vòng sáng nở tối đa gấp mấy lần bán kính một điểm. */
const VONG_SANG_NO_GAP = 7

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
 * Điểm trên đường THẮNG từ `tu` tới `den`.
 *
 * Bóng không đi đường cong như người: một đường chuyền là đường thẳng, và
 * cho bóng vòng cung thì nó trông như một cầu thủ thứ 23.
 */
function diemThang(tu: Diem, den: Diem, tiLe: number): Diem {
  const t = tiLe < 0 ? 0 : tiLe > 1 ? 1 : tiLe
  return { x: tu.x + (den.x - tu.x) * t, y: tu.y + (den.y - tu.y) * t }
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
function vanTocCuaChang(
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
interface ChuyenDiemDang {
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
  const { nha, khach, suKien, msMoiPhut, phutDongHo, dangChay } = props
  const msChuyen = thoiGianChuyen(msMoiPhut)
  const { khung, banKinh, cacDiem, duongBong, bongTaiMoc } = hinhSan(props)
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
  /** Chặng đang đi của bóng — riêng, vì bóng đi thẳng và nhanh gấp ba (T505). */
  const bongDang = useRef<{ readonly tu: Diem; readonly den: Diem } | null>(
    null,
  )
  /**
   * Chỗ bóng được thấy lần cuối (T513).
   *
   * Đọc ref này ngay trong lúc vẽ là cố ý: chỉ cần giá trị của lần vẽ trước,
   * và nhờ vậy "giữ chỗ cũ" không cần thêm một vòng vẽ nào.
   */
  const bongMocCuoi = useRef<Diem | null>(null)

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
        thoiLuong: thoiLuongCuaNguoi(msMoiPhut, msChuyen, met),
      })
    }

    /*
      Chặng của bóng dựng cùng một lúc và dùng cùng một mốc thời gian với
      người (T505), nên không có chuyện bóng và người đếm giờ lệch nhau.
      Chỉ khác ở **thời lượng** — bóng xong trong một phần ba — và ở **hình
      đường đi**: thẳng, không cong.
    */
    const cuBong = bongDang.current
    const msBong = msChuyen / BONG_NHANH_GAP
    const troiBong = msBong <= 0 ? 1 : (bayGio - batDau.current) / msBong
    bongDang.current = {
      tu: cuBong
        ? diemThang(cuBong.tu, cuBong.den, troiBong)
        : { x: bong.x, y: bong.y },
      den: { x: bong.x, y: bong.y },
    }
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
    const buoc = () => {
      veLai()
      yeuCau = requestAnimationFrame(buoc)
    }
    yeuCau = requestAnimationFrame(buoc)
    return () => cancelAnimationFrame(yeuCau)
  }, [dangChay, giamChuyenDong, msChuyen])

  /*
    Mốc thời gian thật của lần đổi phút gần nhất, để suy ra "thời điểm trận"
    liên tục cho lớp dao động (T508, D90). Phải dùng mốc riêng chứ không dùng
    `batDau` của chặng: nhiều phút liền có thể không đổi toạ độ nào, lúc ấy
    `batDau` đứng im và dao động sẽ đứng im theo.
  */
  const batDauPhut = useRef(0)
  useEffect(() => {
    batDauPhut.current = performance.now()
  }, [phutDongHo])

  /*
    Tỉ lệ đã đi được của cú di chuyển hiện tại — tính MỘT lần cho cả 22 điểm,
    để chúng không lệch nhau vài phần nghìn giây chỉ vì thứ tự vòng lặp.
  */
  const bayGioVe = performance.now()

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
    if (giamChuyenDong) return { x: bong.x, y: bong.y }
    const tt = bongDang.current
    if (!tt) return { x: bong.x, y: bong.y }
    const msBong = msChuyen / BONG_NHANH_GAP
    const troiBong =
      msBong <= 0 ? 1 : (performance.now() - batDau.current) / msBong
    return diemThang(tt.tu, tt.den, troiBong)
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
    "Thời điểm trận" liên tục, tính bằng phút: phút đồng hồ cộng phần đã trôi
    trong nhịp. Đây là thứ duy nhất lớp dao động biết về thời gian, và nó là
    thời gian CỦA TRẬN — nên xem lại cùng một trận ở cùng một nhịp thì chuyển
    động giống hệt (P1, mục 6 của spec).
  */
  const thoiDiemTran =
    phutDongHo +
    (msMoiPhut > 0
      ? Math.min(1, (performance.now() - batDauPhut.current) / msMoiPhut)
      : 0)

  /** Biên độ dao động chờ, đo theo khoảng giãn đã co theo khung sân (AC-28.2). */
  const bienDoDao = bienDoTuKhoangGian(BUOC_GIAN * tiLe)

  function viTriVe(d: DiemCauThu): Diem {
    if (giamChuyenDong) return { x: d.x, y: d.y }
    const tt = dang.current.get(d.playerId)
    const goc = tt
      ? viTriTaiThoiDiem(tt.tu, tt.den, troiQuaCua(tt), {
          huongVao: tt.huongVao,
          doMet: doMetTheoNguoi.get(d.playerId) ?? 0,
          gioiHan,
        })
      : { x: d.x, y: d.y }

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

        {/* Đường đi của bóng (AC-10.2, quyết định D40). */}
        {duongBong.length > 1 && (
          <polyline
            points={duongBong.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--co-vang)"
            strokeWidth={0.8 * tiLe}
            strokeDasharray={`${2 * tiLe} ${1.5 * tiLe}`}
            aria-hidden="true"
          />
        )}
        {(
          <circle
            cx={viTriBongVe().x}
            cy={viTriBongVe().y}
            r={1.5 * tiLe}
            fill="var(--co-vang)"
            stroke="var(--co-net)"
            strokeWidth={0.3 * tiLe}
            aria-hidden="true"
          />
        )}

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
              y={1.3 * tiLe}
              textAnchor="middle"
              fontSize={3.4 * tiLe}
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
      </svg>
    </figure>
  )
}
