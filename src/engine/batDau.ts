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
  /**
   * Chế độ liên tục chỉ chạy được ở sân 11 (AC-45.8, quyết định D122).
   *
   * Vì sao KHOÁ chứ không co sân: AC-37.1 và AC-37.2 chỉ định nghĩa hình học
   * **105×68 của sân 11** — vòng cấm 16,5 m, khung thành 7,32 m, chấm phạt đền
   * 11 m đều là số của sân 11. Co sân theo quân số thì mọi con số ấy phải co
   * theo, trong khi cơ học của US-38 (9 m/s, gia tốc 6 m/s²) **không co** vì
   * người vẫn là người — tỉ lệ người trên sân đổi hẳn.
   *
   * Engine liên tục là **lối vào thứ hai**, nên nó được phép có điều kiện
   * riêng. Cái giá đã nói trước khi chốt: người chơi sân 7 không bao giờ thấy
   * chuyển động mới, và giao diện **phải** giải thích vì sao nút bị khoá.
   */
  | {
      readonly loai: 'lien-tuc-chi-san-11'
      readonly quanSo: number
      readonly quanSoCan: number
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
    ...(cauHinh.cheDoMoPhong === 'lien-tuc' && quanSo !== SO_CAU_THU_CHINH
      ? [
          {
            loai: 'lien-tuc-chi-san-11',
            quanSo,
            quanSoCan: SO_CAU_THU_CHINH,
          } as const,
        ]
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
