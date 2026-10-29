import type { PositionId } from '../domain/types'
import { laySoDo } from '../domain/formations'
import { chamDiem, type ThanhPhanDiem } from './diemCauThu'
import type { BenDoi, TiSo } from './suKien'
import {
  dongSuKien,
  THONG_KE_CAU_THU_RONG,
  type BenTran,
  type TrangThaiTran,
} from './tran'

/*
  Báo cáo sau trận (AC-11.1 → AC-11.5, quyết định D49).

  `dungBaoCao` là hàm THUẦN: vào là trạng thái trận đã kết thúc, ra là mọi con
  số mà màn báo cáo cần. Không I/O, không đọc đồng hồ, không chạm giao diện —
  nhờ vậy `matchRepo` của Phase 18 lưu được thẳng kết quả này xuống đĩa mà
  không phải tính lại, và tính lại cũng không ra số khác.

  Mọi con số lấy từ `thongKe`, KHÔNG đếm lại từ dòng sự kiện: dòng sự kiện đã
  bị bộ lọc mật độ của D27 cắt xuống 60–100 dòng nên nó không phải bản ghi đầy
  đủ. Ngoại lệ duy nhất là danh sách người ghi bàn, vì nó cần PHÚT ghi bàn mà
  `thongKe` không giữ — và bàn thắng nằm trong `LOAI_BAT_BUOC` nên không bao
  giờ bị bộ lọc bỏ.
*/

/** Sáu chỉ tiêu mỗi bên mà AC-11.2 liệt kê. */
export interface ChiTieuBen {
  readonly cuSut: number
  readonly sutTrungDich: number
  /** Phần trăm, làm tròn tới số nguyên; hai bên cộng lại bằng 100. */
  readonly kiemSoatBong: number
  readonly coHoiRoRang: number
  readonly theVang: number
  readonly theDo: number
}

export interface NguoiGhiBan {
  readonly doi: BenDoi
  readonly playerId: string
  readonly phut: number
  readonly buGio: boolean
}

export interface DiemCuaCauThu {
  readonly doi: BenDoi
  readonly playerId: string
  /** Vị trí của Ô họ đã đá, là thước dùng để chấm (AC-11.3). */
  readonly viTriDaDa: PositionId
  readonly diem: number
  readonly cacThanhPhan: readonly ThanhPhanDiem[]
  /** `null` nghĩa là đá từ đầu / tới hết trận (AC-11.5). */
  readonly phutVao: number | null
  readonly phutRa: number | null
}

export interface BaoCaoTran {
  readonly maTran: string
  readonly tiSo: TiSo
  readonly nguoiGhiBan: readonly NguoiGhiBan[]
  readonly theoBen: Readonly<Record<BenDoi, ChiTieuBen>>
  readonly diemCauThu: readonly DiemCuaCauThu[]
}

/**
 * Vị trí của ô mà mỗi cầu thủ đã đá.
 *
 * Tra `chienThuatHienTai` trước, rồi `chienThuatXuatPhat`: người bị thay ra
 * không còn ô nào ở cuối trận, nên chỉ nhìn đội hình hiện tại là mất họ. Ai
 * không có trong cả hai thì rơi về vị trí sở trường đầu tiên của chính họ —
 * đường lui này chỉ chạm tới nếu một ô bị bỏ trống bất thường.
 */
function viTriDaDaCuaBen(ben: BenTran): ReadonlyMap<string, PositionId> {
  const ra = new Map<string, PositionId>()

  for (const chienThuat of [ben.chienThuatXuatPhat, ben.chienThuatHienTai]) {
    const viTriTheoSlot = new Map(
      laySoDo(chienThuat.formationId).oVien.map((o) => [o.slotId, o.viTri]),
    )
    for (const o of chienThuat.oVien) {
      const viTri = viTriTheoSlot.get(o.slotId)
      if (o.playerId && viTri) ra.set(o.playerId, viTri)
    }
  }

  for (const hoSo of ben.cacCauThu) {
    if (!ra.has(hoSo.id) && hoSo.positions[0]) {
      ra.set(hoSo.id, hoSo.positions[0])
    }
  }
  return ra
}

/** Những người ĐÃ RA SÂN: đá chính, hoặc vào sân từ băng ghế. */
function nguoiDaRaSan(ben: BenTran): readonly string[] {
  const daChinh = new Set(
    ben.chienThuatXuatPhat.oVien
      .map((o) => o.playerId)
      .filter((id): id is string => id !== null),
  )
  for (const [id, tk] of Object.entries(ben.thongKe.theoCauThu)) {
    if (tk.phutVao !== null) daChinh.add(id)
  }
  return [...daChinh]
}

function chiTieuCuaBen(ben: BenTran, buocCuaDoiKia: number): ChiTieuBen {
  const tk = ben.thongKe
  const tong = tk.soBuocGiuBong + buocCuaDoiKia

  return {
    cuSut: tk.cuSut,
    sutTrungDich: tk.sutTrungDich,
    kiemSoatBong:
      tong === 0 ? 50 : Math.round((tk.soBuocGiuBong / tong) * 100),
    coHoiRoRang: tk.coHoiRoRang,
    theVang: tk.theVang,
    theDo: tk.theDo,
  }
}

/** Báo cáo đầy đủ của một trận đã kết thúc (AC-11.1 → AC-11.5). */
export function dungBaoCao(tt: TrangThaiTran): BaoCaoTran {
  const buocNha = tt.ben.nha.thongKe.soBuocGiuBong
  const buocKhach = tt.ben.khach.thongKe.soBuocGiuBong

  /*
    Hai tỉ lệ phải cộng lại thành đúng 100: làm tròn riêng từng bên có thể ra
    49 + 50. Nên lấy một bên làm tròn, bên còn lại là phần bù.
  */
  const nha = chiTieuCuaBen(tt.ben.nha, buocKhach)
  const khachTho = chiTieuCuaBen(tt.ben.khach, buocNha)
  const khach: ChiTieuBen = {
    ...khachTho,
    kiemSoatBong: 100 - nha.kiemSoatBong,
  }

  const nguoiGhiBan: NguoiGhiBan[] = dongSuKien(tt)
    .filter((s) => s.loai === 'ban-thang' && s.cacCauThu.length > 0)
    .map((s) => ({
      doi: s.doi,
      playerId: s.cacCauThu[0],
      phut: s.phut,
      buGio: s.buGio,
    }))

  const diemCauThu: DiemCuaCauThu[] = []
  for (const doi of ['nha', 'khach'] as const) {
    const ben = tt.ben[doi]
    const viTri = viTriDaDaCuaBen(ben)

    for (const playerId of nguoiDaRaSan(ben)) {
      /*
        Người đã ra sân thì PHẢI có điểm, kể cả khi họ không kịp làm gì — một
        người vào sân phút 89 vẫn là người đã ra sân theo AC-11.3. Bỏ qua họ
        thì báo cáo thiếu người mà không ai biết, nên chỗ này rơi về bản ghi
        rỗng (điểm nền 6.0) chứ không `continue`.
      */
      const tk = ben.thongKe.theoCauThu[playerId] ?? THONG_KE_CAU_THU_RONG
      const viTriDaDa = viTri.get(playerId)
      if (!viTriDaDa) continue

      const { diem, cacThanhPhan } = chamDiem(tk, viTriDaDa)
      diemCauThu.push({
        doi,
        playerId,
        viTriDaDa,
        diem,
        cacThanhPhan,
        phutVao: tk.phutVao,
        phutRa: tk.phutRa,
      })
    }
  }

  return {
    maTran: tt.maTran,
    tiSo: tt.tiSo,
    nguoiGhiBan,
    theoBen: { nha, khach },
    diemCauThu,
  }
}
