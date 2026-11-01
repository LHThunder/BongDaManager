import { tinhTrangDoiHinh, type LyDoChuaDuDieuKien } from '../domain/lineup'
import type { BenDoi } from './suKien'
import type { CauHinhTran, DangKyBen } from './tran'

/*
  Điều kiện bắt đầu một trận (AC-8.9, AC-8.10, AC-9.9).

  Phần "đội hình có đủ điều kiện không" KHÔNG viết lại ở đây: nó gọi thẳng
  `tinhTrangDoiHinh` của `domain/lineup.ts`, chính hàm mà dải tình trạng ở
  trang chiến thuật đang dùng (AC-5.7). Hai chỗ cùng một luật thì không bao
  giờ nói hai điều khác nhau — và đây là phần đóng nốt AC-5.7.

  Trả về MỌI lý do cùng lúc, không dừng ở lý do đầu: người dùng nên thấy hết
  việc cần sửa trong một lần.
*/

/**
 * Quân số mặc định khi cấu hình không khai — giữ nguyên hành vi spec 001.
 * Số người chính thật sự của một trận nằm ở `CauHinhTran.quanSo` (D52).
 */
export const SO_CAU_THU_CHINH = 11

/**
 * Trần số dự bị. Spec 002 đổi luật từ "đúng 7" thành **0 tới 7** (AC-14.1):
 * nhóm 8 người phải đá được sân 7 với một dự bị, mà luật cũ đòi đủ 7 ghế thì
 * chính cái đau spec này sinh ra để chữa vẫn còn nguyên.
 */
export const SO_CAU_THU_DU_BI_TOI_DA = 7

export type LyDoKhongBatDau =
  | { readonly loai: 'cung-mot-doi' }
  | {
      readonly loai: 'chua-du-chinh'
      readonly doi: BenDoi
      readonly soCo: number
      readonly soCan: number
    }
  | {
      readonly loai: 'chua-dung-du-bi'
      readonly doi: BenDoi
      readonly soCo: number
      readonly soCan: number
    }
  | {
      readonly loai: 'doi-hinh-chua-du'
      readonly doi: BenDoi
      readonly cacLyDo: readonly LyDoChuaDuDieuKien[]
    }

export type KetQuaKiemTraBatDau =
  | { readonly batDauDuoc: true }
  | { readonly batDauDuoc: false; readonly cacLyDo: readonly LyDoKhongBatDau[] }

function kiemTraMotBen(
  ben: DangKyBen,
  doi: BenDoi,
  quanSo: number,
): readonly LyDoKhongBatDau[] {
  const ra: LyDoKhongBatDau[] = []

  if (ben.trenSan.length !== quanSo) {
    ra.push({
      loai: 'chua-du-chinh',
      doi,
      soCo: ben.trenSan.length,
      soCan: quanSo,
    })
  }

  if (ben.duBi.length > SO_CAU_THU_DU_BI_TOI_DA) {
    ra.push({
      loai: 'chua-dung-du-bi',
      doi,
      soCo: ben.duBi.length,
      soCan: SO_CAU_THU_DU_BI_TOI_DA,
    })
  }

  const hoSoTheoId = new Map(ben.cacCauThu.map((c) => [c.id, c]))
  const tinhTrang = tinhTrangDoiHinh(
    ben.chienThuatXuatPhat.formationId,
    ben.chienThuatXuatPhat.oVien.map((o) => ({
      slotId: o.slotId,
      playerId: o.playerId,
    })),
    ben.cacCauThu.filter((c) => hoSoTheoId.has(c.id)),
  )

  if (!tinhTrang.duDieuKien) {
    ra.push({ loai: 'doi-hinh-chua-du', doi, cacLyDo: tinhTrang.cacLyDo })
  }

  return ra
}

/** Trận này bắt đầu được chưa, và nếu chưa thì vì những lý do nào. */
export function kiemTraBatDauDuoc(
  cauHinh: CauHinhTran,
): KetQuaKiemTraBatDau {
  const quanSo = cauHinh.quanSo ?? SO_CAU_THU_CHINH
  const cacLyDo: LyDoKhongBatDau[] = [
    ...(cauHinh.nha.teamId === cauHinh.khach.teamId
      ? [{ loai: 'cung-mot-doi' } as const]
      : []),
    ...kiemTraMotBen(cauHinh.nha, 'nha', quanSo),
    ...kiemTraMotBen(cauHinh.khach, 'khach', quanSo),
  ]

  return cacLyDo.length === 0
    ? { batDauDuoc: true }
    : { batDauDuoc: false, cacLyDo }
}

/** Lỗi ném ra khi `taoTran` nhận một cấu hình chưa bắt đầu được. */
export class LoiCauHinhTran extends Error {
  readonly cacLyDo: readonly LyDoKhongBatDau[]

  constructor(cacLyDo: readonly LyDoKhongBatDau[]) {
    super(`Không bắt đầu được trận: ${cacLyDo.map((l) => l.loai).join(', ')}`)
    this.name = 'LoiCauHinhTran'
    this.cacLyDo = cacLyDo
  }
}
