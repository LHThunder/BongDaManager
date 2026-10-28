import type { Rng } from '../domain/types'
import {
  cacVungKe,
  laVungBien,
  laVungDutDiem,
  type VungSan,
} from './vung'

/*
  Một chuỗi kiểm soát bóng: đội đang giữ bóng đưa bóng đi cho tới khi mất
  bóng, bị phạm lỗi, bóng ra ngoài, hoặc dứt điểm.

  Giai đoạn này chuỗi chạy bằng xác suất phẳng. Sức mạnh cầu thủ, thể lực,
  thẻ và bảng hệ số chỉ thị được nối vào ở T077 (lát 10) — tách làm hai bước
  để khi lát 10 làm lệch tính tất định thì test T071 chỉ ra ngay chỗ lệch.

  Mọi ngẫu nhiên đến từ `rng` truyền vào. Không có `Math.random` ở đây (P1).
*/

export type KetCucChuoi =
  | 'dut-diem'
  | 'mat-bong'
  | 'pham-loi'
  | 'bong-ra-ngoai'

export type LoaiHanhDong = 'chuyen' | 're-bong' | 'tat-canh' | 'sut'

export interface HanhDong {
  readonly loai: LoaiHanhDong
  readonly vung: VungSan
}

export interface KetQuaChuoi {
  readonly ketCuc: KetCucChuoi
  readonly vungKetThuc: VungSan
  readonly cacHanhDong: readonly HanhDong[]
}

/*
  Chặn cứng số bước. Không có nó thì một bộ xác suất chỉnh lệch có thể làm
  chuỗi chạy mãi — và lỗi đó sẽ hiện ra dưới dạng "ứng dụng treo", kiểu lỗi
  khó lần nhất.
*/
export const SO_BUOC_TOI_DA = 12

/** Xác suất phẳng của giai đoạn này; lát 10 thay bằng số tính từ chiến thuật. */
const XAC_SUAT = {
  /** Mất bóng ở mỗi bước. */
  matBong: 0.22,
  /** Bị phạm lỗi ở mỗi bước. */
  phamLoi: 0.05,
  /** Bóng ra ngoài ở mỗi bước. */
  raNgoai: 0.06,
  /** Dứt điểm khi đã ở vùng dứt điểm. */
  sutKhiTrongVungDutDiem: 0.55,
  /** Tạt vào trong khi đang ở hành lang biên. */
  tatKhiODaiBien: 0.3,
} as const

/** Chọn một phần tử theo `rng`, tất định với cùng nguồn và cùng danh sách. */
function chonMot<T>(cac: readonly T[], rng: Rng): T {
  const i = Math.min(Math.floor(rng.next() * cac.length), cac.length - 1)
  return cac[i]
}

/**
 * Chạy một chuỗi kiểm soát bóng từ `vungBatDau`.
 *
 * Luôn kết thúc ở đúng một kết cục trong tập đóng `KetCucChuoi`, và luôn
 * dừng trong `SO_BUOC_TOI_DA` bước. Bóng chỉ dịch sang **vùng kề** — không
 * nhảy từ sân nhà thẳng vào vòng cấm đối phương.
 */
export function chayChuoiBong(
  vungBatDau: VungSan,
  rng: Rng,
): KetQuaChuoi {
  const cacHanhDong: HanhDong[] = []
  let vung = vungBatDau

  for (let buoc = 0; buoc < SO_BUOC_TOI_DA; buoc += 1) {
    const q = rng.next()

    if (q < XAC_SUAT.matBong) {
      return { ketCuc: 'mat-bong', vungKetThuc: vung, cacHanhDong }
    }
    if (q < XAC_SUAT.matBong + XAC_SUAT.phamLoi) {
      return { ketCuc: 'pham-loi', vungKetThuc: vung, cacHanhDong }
    }
    if (q < XAC_SUAT.matBong + XAC_SUAT.phamLoi + XAC_SUAT.raNgoai) {
      return { ketCuc: 'bong-ra-ngoai', vungKetThuc: vung, cacHanhDong }
    }

    if (laVungDutDiem(vung) && rng.next() < XAC_SUAT.sutKhiTrongVungDutDiem) {
      cacHanhDong.push({ loai: 'sut', vung })
      return { ketCuc: 'dut-diem', vungKetThuc: vung, cacHanhDong }
    }

    if (laVungBien(vung) && rng.next() < XAC_SUAT.tatKhiODaiBien) {
      cacHanhDong.push({ loai: 'tat-canh', vung })
      // Quả tạt đưa bóng vào trung lộ cùng dải, hoặc dải trên nếu đã ở biên cao.
      const vungTrong = cacVungKe(vung).filter((v) => v.cot === 'giua')
      if (vungTrong.length > 0) {
        vung = chonMot(vungTrong, rng)
        continue
      }
    }

    const keTiep = cacVungKe(vung)
    const vungMoi = chonMot(keTiep, rng)
    cacHanhDong.push({
      loai: vungMoi.dai > vung.dai ? 're-bong' : 'chuyen',
      vung,
    })
    vung = vungMoi
  }

  // Hết số bước cho phép mà chưa ngã ngũ: coi như mất bóng.
  return { ketCuc: 'mat-bong', vungKetThuc: vung, cacHanhDong }
}
