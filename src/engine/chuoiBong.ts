import type { Rng } from '../domain/types'
import type { HeSoChiThi } from './chiThi'
import {
  cacVungKe,
  laDaiCao,
  laVungBien,
  laVungDutDiem,
  type VungSan,
} from './vung'

/*
  Một chuỗi kiểm soát bóng: đội đang giữ bóng đưa bóng đi cho tới khi mất
  bóng, bị phạm lỗi, bóng ra ngoài, hoặc dứt điểm.

  Xác suất mỗi bước được cân bởi BA thứ, và cả ba đều cần cho một AC cụ thể:
    - hệ số chỉ thị của đội cầm bóng      -> AC-8.3 (biên vs trung lộ)
    - hệ số chỉ thị của đội phòng ngự     -> AC-8.4 (pressing hai chiều)
    - sức mạnh hai bên trong tình huống   -> AC-8.5, AC-8.8

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

export interface BoiCanhChuoi {
  /** Hệ số chỉ thị của đội đang cầm bóng. */
  readonly heSoCong: HeSoChiThi
  /** Hệ số chỉ thị của đội phòng ngự — pressing của họ ảnh hưởng ở đây. */
  readonly heSoThu: HeSoChiThi
  /** Sức mạnh trung bình bên cầm bóng, 0..~1. */
  readonly sucManhCong: number
  /** Sức mạnh trung bình bên phòng ngự, 0..~1. */
  readonly sucManhThu: number
}

/*
  Chặn cứng số bước. Không có nó thì một bộ xác suất chỉnh lệch có thể làm
  chuỗi chạy mãi — và lỗi đó hiện ra dưới dạng "ứng dụng treo", kiểu lỗi khó
  lần nhất.
*/
export const SO_BUOC_TOI_DA = 12

const XAC_SUAT_NEN = {
  matBong: 0.22,
  phamLoi: 0.05,
  raNgoai: 0.06,
  sutKhiTrongVungDutDiem: 0.55,
  tatKhiODaiBien: 0.22,
} as const

/** Chênh lệch sức mạnh quy về hệ số nhân quanh 1. */
function heSoTuongQuan(sucManhCong: number, sucManhThu: number): number {
  return (sucManhThu + 0.5) / (sucManhCong + 0.5)
}

function kep(p: number, toiThieu = 0.01, toiDa = 0.9): number {
  return Math.min(Math.max(p, toiThieu), toiDa)
}

/** Chọn một phần tử theo trọng số; tất định với cùng nguồn và cùng danh sách. */
function chonTheoTrongSo<T>(
  cac: readonly T[],
  trongSo: readonly number[],
  rng: Rng,
): T {
  let tong = 0
  for (const w of trongSo) tong += w

  if (tong <= 0) {
    const i = Math.min(Math.floor(rng.next() * cac.length), cac.length - 1)
    return cac[i]
  }

  let moc = rng.next() * tong
  for (let i = 0; i < cac.length; i += 1) {
    moc -= trongSo[i]
    if (moc <= 0) return cac[i]
  }
  return cac[cac.length - 1]
}

/**
 * Chạy một chuỗi kiểm soát bóng từ `vungBatDau`.
 *
 * Luôn kết thúc ở đúng một kết cục trong tập đóng `KetCucChuoi`, luôn dừng
 * trong `SO_BUOC_TOI_DA` bước, và bóng chỉ dịch sang **vùng kề**.
 */
export function chayChuoiBong(
  vungBatDau: VungSan,
  rng: Rng,
  boiCanh: BoiCanhChuoi,
): KetQuaChuoi {
  const cacHanhDong: HanhDong[] = []
  let vung = vungBatDau

  const tuongQuan = heSoTuongQuan(boiCanh.sucManhCong, boiCanh.sucManhThu)

  for (let buoc = 0; buoc < SO_BUOC_TOI_DA; buoc += 1) {
    /*
      Mất bóng: đội mạnh hơn giữ bóng tốt hơn; chỉ thị chuyền chậm giữ bóng
      tốt hơn; và ở dải cao thì pressing của đối thủ làm mất bóng nhiều hơn —
      đó là chiều thứ nhất của AC-8.4.
    */
    const pressingDoiThu = laDaiCao(vung)
      ? boiCanh.heSoThu.cuopBongDaiCao
      : 1
    const pMatBong = kep(
      (XAC_SUAT_NEN.matBong * tuongQuan * pressingDoiThu) /
        boiCanh.heSoCong.giuBong,
    )

    const q = rng.next()
    if (q < pMatBong) {
      return { ketCuc: 'mat-bong', vungKetThuc: vung, cacHanhDong }
    }
    if (q < pMatBong + XAC_SUAT_NEN.phamLoi) {
      return { ketCuc: 'pham-loi', vungKetThuc: vung, cacHanhDong }
    }
    if (q < pMatBong + XAC_SUAT_NEN.phamLoi + XAC_SUAT_NEN.raNgoai) {
      return { ketCuc: 'bong-ra-ngoai', vungKetThuc: vung, cacHanhDong }
    }

    /*
      Khi đã vào được vùng dứt điểm, hàng thủ dâng cao để lại khoảng trống
      sau lưng, nên cơ hội rõ hơn hẳn. Đây là chiều THỨ HAI của AC-8.4, và
      nó phải nằm ở ĐÂY chứ không chỉ ở trọng số di chuyển: hệ số cướp bóng
      của pressing cao giết chuỗi bóng trước khi nó kịp thành cú sút, nên nếu
      cái "mất" chỉ thể hiện qua đường đi thì nó không bao giờ hiện ra.
    */
    if (
      laVungDutDiem(vung) &&
      rng.next() <
        kep(
          (XAC_SUAT_NEN.sutKhiTrongVungDutDiem * boiCanh.heSoThu.biThoatXuong) /
            tuongQuan,
        )
    ) {
      cacHanhDong.push({ loai: 'sut', vung })
      return { ketCuc: 'dut-diem', vungKetThuc: vung, cacHanhDong }
    }

    // Tạt cánh: chỉ từ hành lang biên, và chỉ thị hướng tấn công cân ở đây
    // (chiều đo được của AC-8.3).
    if (
      laVungBien(vung) &&
      rng.next() < kep(XAC_SUAT_NEN.tatKhiODaiBien * boiCanh.heSoCong.tatCanh)
    ) {
      cacHanhDong.push({ loai: 'tat-canh', vung })
      const vungTrong = cacVungKe(vung).filter((v) => v.cot === 'giua')
      if (vungTrong.length > 0) {
        vung = chonTheoTrongSo(
          vungTrong,
          vungTrong.map((v) => (v.dai >= vung.dai ? 2 : 1)),
          rng,
        )
        continue
      }
    }

    const keTiep = cacVungKe(vung)
    const trongSo = keTiep.map((v) => {
      let w = 1
      // Hướng tấn công: biên hay trung lộ (AC-8.3).
      w *= laVungBien(v) ? boiCanh.heSoCong.huongBien : 1
      // Tốc độ chuyển bóng: đẩy lên dải trên hay chuyền ngang.
      if (v.dai > vung.dai) w *= boiCanh.heSoCong.lenBongNhanh
      // Pressing của đối thủ hở lưng: dễ thoát xuống dải cao hơn —
      // chiều thứ hai của AC-8.4.
      if (v.dai > vung.dai && laDaiCao(v)) w *= boiCanh.heSoThu.biThoatXuong
      return w
    })

    const vungMoi = chonTheoTrongSo(keTiep, trongSo, rng)
    cacHanhDong.push({
      loai: vungMoi.dai > vung.dai ? 're-bong' : 'chuyen',
      vung,
    })
    vung = vungMoi
  }

  // Hết số bước cho phép mà chưa ngã ngũ: coi như mất bóng.
  return { ketCuc: 'mat-bong', vungKetThuc: vung, cacHanhDong }
}
