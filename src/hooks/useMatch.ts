import { useCallback, useEffect, useRef, useState } from 'react'
import { LoiCauHinhTran, type LyDoKhongBatDau } from '../engine/batDau'
import {
  buocTiep,
  chayHetTran,
  taoTran,
  type CauHinhTran,

} from '../engine/tran'
import { useAppStore } from '../store/appStore'

/*
  Đồng hồ trận đấu nằm Ở ĐÂY, không nằm trong engine (quyết định D21).

  Engine chỉ là bộ bước thuần `buocTiep`. Nhờ tách như vậy, tạm dừng (AC-9.2),
  đổi tốc độ (AC-9.3) và chạy hết trận ngay (AC-9.4) đều chỉ là gọi `buocTiep`
  nhanh hay chậm — không đụng một dòng nào của engine.
*/

export type MucTocDo = 'thuong' | 'nhanh' | 'rat-nhanh'

/** Mili-giây thực tế cho mỗi phút trận. Mức thường lấy từ spec mục 6. */
export const MS_MOI_PHUT: Readonly<Record<MucTocDo, number>> = {
  thuong: 200,
  nhanh: 70,
  'rat-nhanh': 20,
}

export const CAC_MUC_TOC_DO: readonly MucTocDo[] = [
  'thuong',
  'nhanh',
  'rat-nhanh',
]

export function useMatch() {
  const tran = useAppStore((s) => s.tran)
  const dangChay = useAppStore((s) => s.tranDangChay)
  const datDangChay = useAppStore((s) => s.datTranDangChay)
  const [tocDo, datTocDo] = useState<MucTocDo>('thuong')
  const [lyDoKhongBatDau, datLyDoKhongBatDau] = useState<
    readonly LyDoKhongBatDau[]
  >([])

  /*
    Giữ mức tốc độ trong ref để đổi tốc độ áp dụng NGAY ở nhịp kế tiếp, không
    phải chờ dựng lại bộ đếm giờ.
  */
  const tocDoRef = useRef(tocDo)
  tocDoRef.current = tocDo

  const batDauTran = useCallback((cauHinh: CauHinhTran): boolean => {
    try {
      useAppStore.getState().datTran(taoTran(cauHinh))
      datLyDoKhongBatDau([])
      datDangChay(true)
      return true
    } catch (loi) {
      if (loi instanceof LoiCauHinhTran) {
        datLyDoKhongBatDau(loi.cacLyDo)
        return false
      }
      throw loi
    }
  }, [])

  const tamDung = useCallback(() => datDangChay(false), [])
  const tiepTuc = useCallback(() => datDangChay(true), [])

  const chayHet = useCallback(() => {
    const hienTai = useAppStore.getState().tran
    if (!hienTai) return
    datDangChay(false)
    useAppStore.getState().datTran(chayHetTran(hienTai))
  }, [])

  const roiTran = useCallback(() => {
    datDangChay(false)
    useAppStore.getState().datTran(null)
  }, [])

  /*
    Mỗi nhịp đọc trạng thái MỚI NHẤT từ store thay vì đóng gói `tran` vào
    closure: nếu đóng gói thì mỗi lần trạng thái đổi lại phải dựng lại bộ đếm
    giờ, và trận sẽ giật từng nhịp.
  */
  useEffect(() => {
    if (!dangChay) return

    let dung = false
    let hanGio: ReturnType<typeof setTimeout>

    const nhip = () => {
      if (dung) return
      const hienTai = useAppStore.getState().tran
      if (!hienTai || hienTai.ketThuc) {
        datDangChay(false)
        return
      }
      useAppStore.getState().datTran(buocTiep(hienTai))
      hanGio = setTimeout(nhip, MS_MOI_PHUT[tocDoRef.current])
    }

    hanGio = setTimeout(nhip, MS_MOI_PHUT[tocDoRef.current])
    return () => {
      dung = true
      clearTimeout(hanGio)
    }
  }, [dangChay])

  return {
    tran,
    dangChay,
    tocDo,
    datTocDo,
    lyDoKhongBatDau,
    batDauTran,
    tamDung,
    tiepTuc,
    chayHet,
    roiTran,
  }
}
