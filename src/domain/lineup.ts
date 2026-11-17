import { hoSoHoanTat, type HoSoCanKiem } from './completeness'
import { laySoDo, type FormationId, type OViTriSoDo } from './formations'
import {
  laThuMonThucThu,
  MUC_TRU_HIEU_SUAT,
  mucSaiViTri,
  THU_TU_MUC_SAI,
  type MucSai,
} from './misplacement'
import type { PositionId } from './types'

/*
  Xếp lại người khi đổi sơ đồ (AC-5.8), và kiểm tình trạng đội hình (AC-5.7).

  Thuật toán theo quyết định D14: tham lam theo mức sai vị trí, rồi lặp những
  lượt thử đổi chỗ từng cặp cho tới khi không cải thiện được nữa. Không dùng
  nguồn ngẫu nhiên nào — P1 đòi kết quả tái lập được, và người dùng cũng không
  nên thấy hai kết quả khác nhau khi bấm cùng một nút hai lần.

  MỘT LUẬT CẦN NÓI RÕ: không xếp ai vào ô mà mức sai là `nang`. `nang` nghĩa là
  thủ môn ra sân, cầu thủ sân vào khung, hoặc lệch từ hai tuyến trở lên — xếp
  tiền đạo làm trung vệ thì tệ hơn là để trống ô đó và nói cho người dùng biết.
  Đây chính là chỗ "bị đẩy ra ngoài" của AC-5.8 phát sinh: hai sơ đồ đều có 11
  ô, nên nếu cái gì cũng xếp được thì sẽ không bao giờ có ai bị đẩy ra.
*/

/** Mức sai nặng nhất mà thuật toán còn chấp nhận xếp vào ô. */
export const MUC_SAI_TOI_DA_KHI_XEP: MucSai = 'vua'

const KHONG_XEP_DUOC = Number.POSITIVE_INFINITY

export interface CauThuDeXep {
  readonly id: string
  readonly positions: readonly PositionId[]
}

export interface OTrongDoiHinh {
  readonly slotId: string
  readonly playerId: string | null
}

export interface NguoiXepSai {
  readonly playerId: string
  readonly slotId: string
  readonly viTriO: PositionId
  readonly mucSai: MucSai
}

/*
  Mã lý do cho từng ô (T416, AC-26.8, AC-26.9, quyết định D84).

  Trả MÃ, không trả câu: P8 cấm nhãn hiển thị nằm trong `domain`, và cùng một
  mã phải dựng được câu ở cả hai thứ tiếng.

  Bộ mã này đúng bằng những gì thuật toán **thật sự phân biệt được**. Nó chỉ
  đọc mức sai vị trí (`chiPhi`), không đọc chỉ số, nên không có mã nào kiểu
  "chọn vì chỉ số cao nhất" — sinh ra một mã như thế là nói với người dùng
  một lý do mà máy không hề dùng để quyết định.
*/
export type MaLyDoXep =
  /** Người ở ô này đá đúng vị trí sở trường. */
  | 'dung-so-truong'
  /** Lệch nhẹ: cùng tuyến, khác bên — không còn ai đúng sở trường. */
  | 'xep-sai-nhe'
  /** Lệch vừa: khác tuyến liền kề — lựa chọn ít tệ nhất còn lại. */
  | 'xep-sai-vua'
  /** Ô trống dù đội còn người: ai còn lại cũng lệch quá nặng cho ô này. */
  | 'khong-ai-xep-duoc'
  /** Ô trống vì đội đã hết người (AC-26.9). */
  | 'thieu-nguoi'

export interface LyDoXepO {
  readonly slotId: string
  readonly ma: MaLyDoXep
}

export interface KetQuaXepLai {
  /** Đúng số ô của sơ đồ MỚI, theo đúng thứ tự ô của nó. */
  readonly oVien: readonly OTrongDoiHinh[]
  /** Cầu thủ không còn chỗ nào xếp được — nêu tên cho người dùng (AC-5.8). */
  readonly nguoiBiDayRa: readonly string[]
  /** Cầu thủ vẫn ở trên sân nhưng không đúng vị trí sở trường (AC-5.8). */
  readonly nguoiXepSai: readonly NguoiXepSai[]
  /**
   * Lý do của TỪNG ô, cùng thứ tự với `oVien` (AC-26.8).
   *
   * Trường THÊM, không thay thế gì: ba trường trên giữ nguyên ý nghĩa và
   * giữ nguyên giá trị, nên bốn nơi đang gọi `xepLaiKhiDoiSoDo` không phải
   * sửa một dòng.
   */
  readonly lyDo: readonly LyDoXepO[]
}

function chiPhi(o: OViTriSoDo, cauThu: CauThuDeXep): number {
  const muc = mucSaiViTri(o.viTri, cauThu.positions)
  const quaNang =
    THU_TU_MUC_SAI.indexOf(muc) >
    THU_TU_MUC_SAI.indexOf(MUC_SAI_TOI_DA_KHI_XEP)
  return quaNang ? KHONG_XEP_DUOC : MUC_TRU_HIEU_SUAT[muc]
}

/**
 * Xếp lại những cầu thủ đang trên sân vào các ô của sơ đồ mới (AC-5.8).
 *
 * `oVienCu` là đội hình hiện tại; chỉ những ô có người được mang sang. Cầu thủ
 * nào không có trong `cacCauThu` thì bị bỏ qua — ô treo không nên làm hàm này
 * ném lỗi, vì `playerRepo` đã có việc dọn ô (AC-2.7).
 */
export function xepLaiKhiDoiSoDo(
  soDoMoi: FormationId,
  oVienCu: readonly OTrongDoiHinh[],
  cacCauThu: readonly CauThuDeXep[],
): KetQuaXepLai {
  const theoId = new Map(cacCauThu.map((c) => [c.id, c]))

  /*
    Thứ tự này quyết định kết quả khi có nhiều cách xếp ngang điểm nhau, nên nó
    phải là thứ tự của dữ liệu đầu vào chứ không phải thứ tự duyệt Map hay Set.
  */
  const nguoi: CauThuDeXep[] = []
  const daThay = new Set<string>()
  for (const o of oVienCu) {
    if (o.playerId === null || daThay.has(o.playerId)) continue
    const cauThu = theoId.get(o.playerId)
    if (!cauThu) continue
    daThay.add(o.playerId)
    nguoi.push(cauThu)
  }

  const oMoi = laySoDo(soDoMoi).oVien
  // Chỉ số của người được xếp vào từng ô; -1 là ô trống.
  const xep: number[] = oMoi.map(() => -1)
  const daXep = new Set<number>()

  // Lượt tham lam: đi lần lượt từng ô, chọn người rẻ nhất còn lại.
  oMoi.forEach((o, iO) => {
    let tot = -1
    let chiPhiTot = KHONG_XEP_DUOC

    nguoi.forEach((cauThu, iNguoi) => {
      if (daXep.has(iNguoi)) return
      const c = chiPhi(o, cauThu)
      // So sánh "nhỏ hơn hẳn" nên khi bằng điểm thì giữ người có chỉ số nhỏ.
      if (c < chiPhiTot) {
        chiPhiTot = c
        tot = iNguoi
      }
    })

    if (tot !== -1) {
      xep[iO] = tot
      daXep.add(tot)
    }
  })

  /*
    Lượt đổi cặp: tham lam đi theo thứ tự ô nên nó có thể trao ô đầu cho một
    cầu thủ đa năng, để lại cầu thủ chuyên biệt không còn ô đúng. Đổi chỗ hai
    người đó thì cả hai đều khớp hơn. Lặp tới khi không cải thiện được nữa.
  */
  let coCaiThien = true
  while (coCaiThien) {
    coCaiThien = false

    for (let a = 0; a < oMoi.length; a += 1) {
      for (let b = a + 1; b < oMoi.length; b += 1) {
        const nA = xep[a]
        const nB = xep[b]
        if (nA === -1 && nB === -1) continue

        const truoc =
          (nA === -1 ? 0 : chiPhi(oMoi[a], nguoi[nA])) +
          (nB === -1 ? 0 : chiPhi(oMoi[b], nguoi[nB]))
        const sau =
          (nB === -1 ? 0 : chiPhi(oMoi[a], nguoi[nB])) +
          (nA === -1 ? 0 : chiPhi(oMoi[b], nguoi[nA]))

        if (sau < truoc) {
          xep[a] = nB
          xep[b] = nA
          coCaiThien = true
        }
      }
    }
  }

  const oVien: OTrongDoiHinh[] = oMoi.map((o, i) => ({
    slotId: o.slotId,
    playerId: xep[i] === -1 ? null : nguoi[xep[i]].id,
  }))

  const daDung = new Set(xep.filter((i) => i !== -1))
  const nguoiBiDayRa = nguoi
    .map((c, i) => (daDung.has(i) ? null : c.id))
    .filter((id): id is string => id !== null)

  const nguoiXepSai: NguoiXepSai[] = []
  oMoi.forEach((o, i) => {
    if (xep[i] === -1) return
    const cauThu = nguoi[xep[i]]
    const muc = mucSaiViTri(o.viTri, cauThu.positions)
    if (muc !== 'dung') {
      nguoiXepSai.push({
        playerId: cauThu.id,
        slotId: o.slotId,
        viTriO: o.viTri,
        mucSai: muc,
      })
    }
  })

  /*
    Lý do từng ô. Hai trường hợp ô TRỐNG được phân biệt, vì với người dùng
    chúng là hai câu trả lời khác nhau:

      - còn người chưa xếp mà ô vẫn trống ⇒ ai còn lại cũng lệch quá nặng,
        và thuật toán thà để trống còn hơn xếp một tiền đạo vào khung thành
        (luật đã ghi ở đầu file);
      - không còn ai ⇒ đội thiếu người, đúng điều AC-26.9 đòi phải nói rõ.

    Phân biệt bằng `daXep.size` so với số người có, không phải bằng việc đếm
    ô trống: một đội đủ người vẫn có thể để trống ô, và một đội thiếu người
    vẫn có thể lấp đầy những ô đầu.
  */
  const conNguoiChuaXep = daXep.size < nguoi.length
  const lyDo: LyDoXepO[] = oMoi.map((o, i) => {
    const iNguoi = xep[i]
    if (iNguoi === -1) {
      return {
        slotId: o.slotId,
        ma: conNguoiChuaXep ? 'khong-ai-xep-duoc' : 'thieu-nguoi',
      }
    }
    const muc = mucSaiViTri(o.viTri, nguoi[iNguoi].positions)
    return {
      slotId: o.slotId,
      ma:
        muc === 'dung'
          ? 'dung-so-truong'
          : muc === 'nhe'
            ? 'xep-sai-nhe'
            : 'xep-sai-vua',
    }
  })

  return { oVien, nguoiBiDayRa, nguoiXepSai, lyDo }
}

// ---------------------------------------------------------------------------
// Tình trạng đội hình (AC-5.7)
// ---------------------------------------------------------------------------

export type LyDoChuaDuDieuKien =
  | { readonly loai: 'thieu-nguoi'; readonly soONhanNguoi: number }
  | { readonly loai: 'thieu-thu-mon' }
  | {
      readonly loai: 'ho-so-chua-hoan-tat'
      readonly cacPlayerId: readonly string[]
    }

export interface TinhTrangDoiHinh {
  readonly duDieuKien: boolean
  /** Rỗng khi đủ điều kiện. Tên cầu thủ do tầng UI tra (P8). */
  readonly cacLyDo: readonly LyDoChuaDuDieuKien[]
}

export interface CauThuDeKiem extends CauThuDeXep, HoSoCanKiem {}

/**
 * Đội hình này có đủ điều kiện vào trận chưa (AC-5.7). Trả về MỌI lý do còn
 * thiếu, không dừng ở lý do đầu: người dùng nên thấy hết việc cần sửa trong
 * một lần thay vì sửa một chỗ rồi lại bị chặn vì chỗ khác.
 */
export function tinhTrangDoiHinh(
  soDo: FormationId,
  oVien: readonly OTrongDoiHinh[],
  cacCauThu: readonly CauThuDeKiem[],
): TinhTrangDoiHinh {
  const theoId = new Map(cacCauThu.map((c) => [c.id, c]))
  const oTheoSlot = new Map(oVien.map((o) => [o.slotId, o]))
  const oMoi = laySoDo(soDo).oVien

  const cacLyDo: LyDoChuaDuDieuKien[] = []

  const nguoiTrenSan = oMoi
    .map((o) => oTheoSlot.get(o.slotId)?.playerId ?? null)
    .map((id) => (id === null ? null : (theoId.get(id) ?? null)))

  const soCoNguoi = nguoiTrenSan.filter((c) => c !== null).length
  if (soCoNguoi < oMoi.length) {
    cacLyDo.push({ loai: 'thieu-nguoi', soONhanNguoi: soCoNguoi })
  }

  const oThuMon = oMoi.findIndex((o) => o.viTri === 'GK')
  const nguoiGiuKhung = oThuMon === -1 ? null : nguoiTrenSan[oThuMon]
  if (!nguoiGiuKhung || !laThuMonThucThu(nguoiGiuKhung.positions)) {
    cacLyDo.push({ loai: 'thieu-thu-mon' })
  }

  const chuaHoanTat = nguoiTrenSan
    .filter((c): c is CauThuDeKiem => c !== null)
    .filter((c) => !hoSoHoanTat(c).hoanTat)
    .map((c) => c.id)
  if (chuaHoanTat.length > 0) {
    cacLyDo.push({ loai: 'ho-so-chua-hoan-tat', cacPlayerId: chuaHoanTat })
  }

  return { duDieuKien: cacLyDo.length === 0, cacLyDo }
}
