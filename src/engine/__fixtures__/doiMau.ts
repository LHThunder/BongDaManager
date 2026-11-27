import { ATTRIBUTES, GK_ATTRIBUTES, GK_CHI_SO_CHUNG } from '../../domain/attributes'
import {
  laySoDo,
  SO_DO_MAC_DINH,
  soDoTheoQuanSo,
  type FormationId,
} from '../../domain/formations'
import { CHI_THI_MAC_DINH, type BoChiThi } from '../../domain/instructions'
import { vaiTroMacDinh } from '../../domain/roles'
import type {
  AttributeValues,
  GkAttributeValues,
  PositionId,
  Tactic,
} from '../../domain/types'
import type { HoSoCauThu } from '../sucManh'
import type { CauHinhTran, DangKyBen } from '../tran'

/*
  Đội mẫu cho test engine.

  File này CHỈ test dùng. Nó nằm trong `engine/` để phép canh biên giới của
  T072 cũng soi nó — một bộ dựng đội mà lỡ import `services` thì test engine
  đã kéo theo cả tầng lưu trữ mà không ai biết.
*/

export interface TuyChonDoi {
  /** Giá trị đặt cho mọi chỉ số; mặc định 12. */
  readonly chiSo?: number
  readonly chiThi?: BoChiThi
  /** Ghi đè chỉ số cho riêng một cầu thủ, theo số áo (1-based). */
  readonly ghiDeChiSo?: Readonly<Record<number, AttributeValues>>
  /** Ghi đè vị trí sở trường của một cầu thủ, theo số áo. */
  readonly ghiDeViTri?: Readonly<Record<number, readonly PositionId[]>>
  /**
   * Giá trị cho RIÊNG ba chỉ số của thủ môn (Phản xạ, Bắt bóng, Phát động)
   * và các chỉ số chung của người đứng trong khung.
   *
   * Có mặt để đo được "thủ môn giỏi cứu được nhiều hơn" (AC-11.2, AC-11.3):
   * `chiSo` đổi cả đội nên không tách được phần của thủ môn, còn `ghiDeChiSo`
   * chỉ với tới bộ chỉ số chung.
   */
  readonly chiSoThuMon?: number
}

function chiSoSan(giaTri: number): AttributeValues {
  const ra: Record<string, number> = {}
  for (const a of ATTRIBUTES) ra[a.id] = giaTri
  return ra as AttributeValues
}

function chiSoThuMonChung(giaTri: number): AttributeValues {
  const ra: Record<string, number> = {}
  for (const id of GK_CHI_SO_CHUNG) ra[id] = giaTri
  return ra as AttributeValues
}

function chiSoThuMonRieng(giaTri: number): GkAttributeValues {
  const ra: Record<string, number> = {}
  for (const a of GK_ATTRIBUTES) ra[a.id] = giaTri
  return ra as GkAttributeValues
}

/**
 * 18 cầu thủ: 11 người đầu khớp đúng 11 ô của sơ đồ mặc định, 7 người sau là
 * dự bị. Người số 1 là thủ môn, mang bộ chỉ số riêng của thủ môn.
 */
export function cacCauThuMau(
  teamId: string,
  tuyChon: TuyChonDoi = {},
): readonly HoSoCauThu[] {
  return cacCauThuTheoSoDo(teamId, SO_DO_MAC_DINH, 7, tuyChon)
}

/**
 * Cầu thủ cho MỘT sơ đồ bất kỳ, kèm số dự bị tuỳ ý (spec 002).
 *
 * Vị trí sở trường lấy từ chính ô của sơ đồ, nên đội mẫu luôn là đội xếp
 * đúng sở trường — mọi test đo hiệu suất đều đứng trên cùng một mốc.
 */
export function cacCauThuTheoSoDo(
  teamId: string,
  soDoId: FormationId,
  soDuBi: number,
  tuyChon: TuyChonDoi = {},
): readonly HoSoCauThu[] {
  const giaTri = tuyChon.chiSo ?? 12
  const oVien = laySoDo(soDoId).oVien

  const chinh = oVien.map((o, i) => {
    const so = i + 1
    const laThuMon = o.viTri === 'GK'
    const giaTriCuaNguoi =
      laThuMon && tuyChon.chiSoThuMon !== undefined
        ? tuyChon.chiSoThuMon
        : giaTri
    return {
      id: `${teamId}-${so}`,
      positions: tuyChon.ghiDeViTri?.[so] ?? [o.viTri],
      attributes: {
        ...(laThuMon
          ? chiSoThuMonChung(giaTriCuaNguoi)
          : chiSoSan(giaTri)),
        ...(tuyChon.ghiDeChiSo?.[so] ?? {}),
      },
      gkAttributes: laThuMon ? chiSoThuMonRieng(giaTriCuaNguoi) : null,
    } satisfies HoSoCauThu
  })

  const duBi = Array.from({ length: soDuBi }, (_, i) => {
    const so = oVien.length + 1 + i
    return {
      id: `${teamId}-${so}`,
      positions: tuyChon.ghiDeViTri?.[so] ?? (['MC'] as PositionId[]),
      attributes: {
        ...chiSoSan(giaTri),
        ...(tuyChon.ghiDeChiSo?.[so] ?? {}),
      },
      gkAttributes: null,
    } satisfies HoSoCauThu
  })

  return [...chinh, ...duBi]
}

/** Chiến thuật 4-4-2 với 11 ô trỏ đúng 11 cầu thủ chính. */
export function chienThuatMau(
  teamId: string,
  tuyChon: TuyChonDoi = {},
): Tactic {
  return chienThuatTheoSoDo(teamId, SO_DO_MAC_DINH, tuyChon)
}

/** Chiến thuật theo MỘT sơ đồ bất kỳ, mỗi ô trỏ đúng một cầu thủ chính. */
export function chienThuatTheoSoDo(
  teamId: string,
  soDoId: FormationId,
  tuyChon: TuyChonDoi = {},
): Tactic {
  return {
    id: `ct-${teamId}-${soDoId}`,
    teamId,
    ten: null,
    formationId: soDoId,
    oVien: laySoDo(soDoId).oVien.map((o, i) => ({
      slotId: o.slotId,
      playerId: `${teamId}-${i + 1}`,
      roleId: vaiTroMacDinh(o.viTri),
    })),
    chiThi: tuyChon.chiThi ?? CHI_THI_MAC_DINH,
    createdAt: 0,
    updatedAt: 0,
  }
}

export function benMau(teamId: string, tuyChon: TuyChonDoi = {}): DangKyBen {
  return benMauTheoSoDo(teamId, SO_DO_MAC_DINH, 7, tuyChon)
}

/** Đăng ký một bên theo MỘT sơ đồ bất kỳ, kèm số dự bị tuỳ ý (spec 002). */
export function benMauTheoSoDo(
  teamId: string,
  soDoId: FormationId,
  soDuBi: number,
  tuyChon: TuyChonDoi = {},
): DangKyBen {
  const soO = laySoDo(soDoId).oVien.length
  const cacCauThu = cacCauThuTheoSoDo(teamId, soDoId, soDuBi, tuyChon)
  return {
    teamId,
    chienThuatXuatPhat: chienThuatTheoSoDo(teamId, soDoId, tuyChon),
    trenSan: cacCauThu.slice(0, soO).map((c) => c.id),
    duBi: cacCauThu.slice(soO).map((c) => c.id),
    cacCauThu,
  }
}

/**
 * Đăng ký một bên cho quân số `n`, dùng sơ đồ ĐẦU TIÊN của quân số đó.
 *
 * Phải đi qua bảng sơ đồ chứ không dựng ô tự do: `doiHinhTrenSan` lấy vị trí
 * của từng ô **từ bảng sơ đồ**, nên một đăng ký trỏ tới sơ đồ không có trong
 * bảng sẽ cho ra sân trống mà không báo lỗi gì.
 */
export function benMauQuanSo(
  teamId: string,
  n: number,
  soDuBi = 3,
  tuyChon: TuyChonDoi = {},
): DangKyBen {
  const soDo = soDoTheoQuanSo(n)[0]
  if (!soDo) throw new Error(`chưa có sơ đồ nào cho quân số ${n}`)
  return benMauTheoSoDo(teamId, soDo.id, soDuBi, tuyChon)
}

export function cauHinhMau(
  maTran: string,
  ghiDe: Partial<CauHinhTran> = {},
): CauHinhTran {
  return {
    maTran,
    nha: benMau('A'),
    khach: benMau('B'),
    sanTrungLap: false,
    ...ghiDe,
  }
}

/** Bộ mã trận cố định cho những test chạy nhiều trận rồi so trung bình. */
export const MA_TRAN_CO_DINH: readonly string[] = [
  'K7M2R9XQ4B',
  'P3V8N1TZ6C',
  'W5H4J2YD9F',
  'R8K3M7QX2N',
  'T6B9V4CZ1P',
  'H2N5W8JY3R',
  'M4T7K1XQ9B',
  'C9P2R6NV5H',
  'Y3J8T4MZ7W',
  'B5X1H9KQ2T',
]

/*
  ====================================================================
  MẪU RỘNG 200 MÃ (T750).
  ====================================================================

  ⚠️ **Hàm này từng tồn tại HAI bản, chép tay, ở hai file.**
  `sosanh.doiManhHon.test.ts` khai `maRong(i)`; `sosanh.sanNha.test.ts` viết
  thẳng cùng một biểu thức template vào trong `Array.from`. Hai bản ấy **trùng
  nhau từng ký tự** hôm nay — và đó đúng là lớp lỗi mà một ngày ai đó sửa một
  bản sẽ làm hai bảng thống kê không còn so được với nhau.

  Nâng lên đây vì **AC-45.3 đòi 200 mã ở CẢ HAI chế độ**: `sosanh.haiCheDo`
  (T751) phải chạy trên **đúng** bộ mã mà hai file cũ đã chạy, nếu không thì
  "hai chế độ cho kết quả gần nhau" là một câu so hai mẫu khác nhau.

  📌 **Hai con số phải giữ nguyên sau phép nâng này**, và chúng là điều kiện ra
  của T750: `sosanh.doiManhHon` in **174-17-9** và **76-47-77**.
*/

/**
 * Mã trận thứ `i` của mẫu rộng — **tất định**, không một nguồn ngẫu nhiên nào.
 *
 * Dạng `Z0000XQ4B`: bốn chữ số đệm 0 nên thứ tự từ vựng trùng thứ tự số, và
 * đuôi `XQ4B` giữ đúng hình dạng 10 ký tự của một mã trận thật.
 */
export function maRong(i: number): string {
  return `Z${String(i).padStart(4, '0')}XQ4B`
}

/**
 * Số mã của mẫu rộng.
 *
 * **200, không phải 60** — hai chú thích ở hai file `sosanh.*` đã trả giá cho
 * con số này: ở 60 mã, hiệu số sân nhà dao động tới **+1,02 bàn** (vượt trần
 * "nhỏ hơn 1 bàn" của chính phép kiểm) và tỉ lệ thắng của hai đội bằng nhau
 * tụt xuống **28%** (dưới ngưỡng 33%). Nới mẫu, **không** nới ngưỡng.
 *
 * Nó cũng đúng bằng con số **AC-45.3** đòi, nên T751 dùng lại chính mẫu này.
 */
export const SO_MA_RONG = 200

/** Mẫu rộng 200 mã, dựng một lần và dùng chung. */
export const MAU_RONG: readonly string[] = Array.from(
  { length: SO_MA_RONG },
  (_, i) => maRong(i),
)
