import { useCallback, useMemo, useState } from 'react'

import { dungBaoCao, type BaoCaoTran } from '../engine/baoCao'
import type { SuKien } from '../engine/suKien'
import type { BoChiThi } from '../domain/instructions'
import type { CanThiep, TrangThaiTran } from '../engine/tran'
import * as phatLai from '../services/phatLai'
import type { TranDaLuu } from '../storage/db'

/*
  Điều phối một lần rẽ nhánh (US-27, T431).

  HAI ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Không có một đường ghi nào.** Hook này chỉ gọi những hàm THUẦN của
     `services/phatLai` — không `moDb`, không `matchRepo.luu`, không gì chạm
     IndexedDB (quyết định D79). Nhờ vậy trận gốc trong lịch sử còn nguyên
     (AC-27.7) và trận nhánh mất đi khi rời màn hình (AC-27.9) **vì nó chưa
     bao giờ ở đâu khác ngoài bộ nhớ**, không phải vì có ai nhớ xoá.

  2. **Phút rẽ đi vào bằng phút HIỂN THỊ.** Người dùng chỉ điểm rẽ bằng cách
     bấm một dòng tường thuật, mà dòng ấy mang phút người đọc thấy — hiệp hai
     đã bị trừ bù giờ hiệp một. Hook đổi về phút đồng hồ ở đúng một chỗ
     (`phutThucTe`), nên không chỗ nào trong giao diện phải tự nhớ hai loại
     phút khác nhau.

  Phạm vi quyết định đổi được đúng như spec nói: MỘT bộ chỉ thị toàn đội,
  HOẶC một lần thay người (AC-27.1). Giữ hai thứ ấy thành hai ô state riêng
  thay vì một mảng can thiệp tự do: đổi chỉ thị ba lần thì chỉ lần cuối có
  nghĩa, mà một mảng tự do sẽ xếp cả ba vào hàng đợi và người dùng không
  hiểu vì sao hai lần đầu "không có tác dụng".
*/

export interface ThayNguoiMoi {
  readonly ra: string
  readonly vao: string
}

export interface KetQuaNhanh {
  readonly cuoiTran: TrangThaiTran
  /** Dòng ghép: tới điểm rẽ là trận gốc, sau đó là nhánh (AC-27.2). */
  readonly cacSuKien: readonly SuKien[]
  readonly baoCao: BaoCaoTran
}

export interface DieuPhoiRePhatLai {
  /** Khoảng phút rẽ được, nói bằng phút người dùng đọc (AC-27.8). */
  readonly khoangPhut: phatLai.KhoangPhutRe
  /** `null` khi phút được chọn nằm ngoài khoảng. */
  readonly lyDo: phatLai.LyDoKhongRe | null
  /** Trạng thái trận tại điểm rẽ, để giao diện cho đổi quyết định. */
  readonly taiDiemRe: TrangThaiTran | null
  readonly chiThiMoi: BoChiThi | null
  readonly thayNguoiMoi: ThayNguoiMoi | null
  readonly canThiepMoi: readonly CanThiep[]
  readonly daDoiQuyetDinh: boolean
  readonly ketQua: KetQuaNhanh | null
  readonly datChiThi: (chiThi: BoChiThi) => void
  readonly datThayNguoi: (ra: string, vao: string) => void
  readonly boThayNguoi: () => void
  readonly chay: () => void
  readonly datLai: () => void
}

/**
 * Rẽ nhánh một trận đã lưu tại một phút trong dòng tường thuật.
 *
 * `phutReHienThi` là phút NGƯỜI DÙNG ĐỌC cùng cờ bù giờ — đúng cặp mà một
 * dòng tường thuật mang.
 */
export function useRePhatLai(
  banGhi: TranDaLuu,
  phutReHienThi: phatLai.PhutHienThi,
): DieuPhoiRePhatLai {
  const tt0 = useMemo(() => phatLai.trangThaiDauTran(banGhi), [banGhi])

  const khoangPhut = useMemo(() => phatLai.khoangPhutReHienThi(tt0), [tt0])

  const phutRe = useMemo(
    () => phatLai.phutThucTe(tt0, phutReHienThi),
    [tt0, phutReHienThi],
  )

  const reDuoc = phatLai.phutReDuoc(tt0, phutRe)

  /*
    Phát lại tới điểm rẽ chạy MỘT lần cho mỗi phút được chọn: đo từ
    `sosanh.doiManhHon.test.ts` thì 200 trận mất 2,2 giây, nên một lần phát
    lại 90 phút khoảng 11ms — đủ nhanh để không cần chỉ báo chờ, nhưng không
    đủ nhanh để chạy lại mỗi lần vẽ.
  */
  const taiDiemRe = useMemo(
    () =>
      reDuoc ? phatLai.phatLaiToiPhut(tt0, banGhi.canThiep, phutRe) : null,
    [reDuoc, tt0, banGhi, phutRe],
  )

  const [chiThiMoi, datChiThiMoi] = useState<BoChiThi | null>(null)
  const [thayNguoiMoi, datThayNguoiMoi] = useState<ThayNguoiMoi | null>(null)
  const [ketQua, datKetQua] = useState<KetQuaNhanh | null>(null)

  const doiCuaNguoiDung = banGhi.doiCuaNguoiDung

  const canThiepMoi = useMemo<readonly CanThiep[]>(() => {
    const cac: CanThiep[] = []
    if (chiThiMoi) {
      cac.push({
        phut: phutRe,
        doi: doiCuaNguoiDung,
        noiDung: { loai: 'doi-chi-thi', chiThi: chiThiMoi },
      })
    }
    if (thayNguoiMoi) {
      cac.push({
        phut: phutRe,
        doi: doiCuaNguoiDung,
        noiDung: {
          loai: 'thay-nguoi',
          ra: thayNguoiMoi.ra,
          vao: thayNguoiMoi.vao,
        },
      })
    }
    return cac
  }, [chiThiMoi, thayNguoiMoi, phutRe, doiCuaNguoiDung])

  /*
    Đổi quyết định xong thì kết quả cũ không còn nói về quyết định đang hiện
    trên màn hình nữa, nên nó bị xoá — thà bắt người dùng bấm "chạy" lần nữa
    còn hơn để họ đọc một khối so sánh thuộc về một quyết định khác.
  */
  const datChiThi = useCallback((chiThi: BoChiThi) => {
    datChiThiMoi(chiThi)
    datKetQua(null)
  }, [])

  const datThayNguoi = useCallback((ra: string, vao: string) => {
    datThayNguoiMoi({ ra, vao })
    datKetQua(null)
  }, [])

  const boThayNguoi = useCallback(() => {
    datThayNguoiMoi(null)
    datKetQua(null)
  }, [])

  const chay = useCallback(() => {
    if (!taiDiemRe) return
    const cuoiTran = phatLai.chayNotTuDiemRe(
      taiDiemRe,
      banGhi.canThiep,
      canThiepMoi,
    )
    datKetQua({
      cuoiTran,
      cacSuKien: phatLai.dongSuKienNhanh(banGhi, cuoiTran, phutRe),
      baoCao: dungBaoCao(cuoiTran),
    })
  }, [taiDiemRe, banGhi, canThiepMoi, phutRe])

  const datLai = useCallback(() => {
    datChiThiMoi(null)
    datThayNguoiMoi(null)
    datKetQua(null)
  }, [])

  return {
    khoangPhut,
    lyDo: reDuoc ? null : 'phut-ngoai-khoang',
    taiDiemRe,
    chiThiMoi,
    thayNguoiMoi,
    canThiepMoi,
    daDoiQuyetDinh: canThiepMoi.length > 0,
    ketQua,
    datChiThi,
    datThayNguoi,
    boThayNguoi,
    chay,
    datLai,
  }
}
