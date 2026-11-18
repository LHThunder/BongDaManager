import { useCallback, useEffect, useRef, useState } from 'react'
import { LoiCauHinhTran, type LyDoKhongBatDau } from '../engine/batDau'
import { chuanHoaLoiLuuTru } from '../services/errors'
import { dungBaoCao } from '../engine/baoCao'
import { taoMaTran } from '../engine/rng'
import {
  apDungCanThiep,
  buocTiep,
  cauHinhDauLai,
  chayHetTran,
  dongSuKien,
  taoTran,
  type CanThiep,
  type CauHinhTran,
  type LyDoTuChoiCanThiep,
  type TrangThaiTran,
} from '../engine/tran'
import * as matchRepo from '../services/matchRepo'
import { dangKyDeLuu } from '../services/phatLai'
import type { TeamSummary } from '../services/teamRepo'
import type { AnhChupDoi, TranDaLuu } from '../storage/db'
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

/** Nguồn ngẫu nhiên THẬT, tạo ở ngoài engine — engine không được tự gọi (P1). */
const RNG_THAT = { next: () => Math.random() }


/*
  Lưu trận vào lịch sử khi nó kết thúc (AC-11.7, quyết định D45 và D46).

  Bản ghi giữ CẢ `teamId` lẫn ảnh chụp tên/màu/logo lúc đó: còn đội thì tên
  phân giải từ đội đang sống nên đổi tên đội là lịch sử đổi theo (AC-1.5);
  đội đã bị xoá thì rơi về ảnh chụp, nên trận cũ vẫn xem lại được với tên lúc
  đó (spec mục 5). Giữ một trong hai là mất một trong hai yêu cầu.
*/
function anhChupDoi(teamId: string, teams: readonly TeamSummary[]): AnhChupDoi {
  const doi = teams.find((d) => d.id === teamId)
  return {
    teamId,
    ten: doi?.name ?? '',
    mauChinh: doi?.primaryColor ?? '#334155',
    mauPhu: doi?.secondaryColor ?? '#f8fafc',
    logoImageId: doi?.logoImageId ?? null,
  }
}

function dungBanGhi(
  tt: TrangThaiTran,
  id: string,
  teams: readonly TeamSummary[],
): TranDaLuu {
  return {
    id,
    maTran: tt.maTran,
    phienBanEngine: tt.phienBanEngine,
    ketThucLuc: Date.now(),
    tiSo: tt.tiSo,
    quanSo: tt.quanSo,
    thoiLuong: tt.thoiLuong,
    doiChuNha: anhChupDoi(tt.ben.nha.teamId, teams),
    doiKhach: anhChupDoi(tt.ben.khach.teamId, teams),
    sanTrungLap: tt.sanTrungLap,
    doiCuaNguoiDung: tt.doiCuaNguoiDung,
    /*
      `dangKyDeLuu`, KHÔNG phải `dangKyTuTrangThai` (T441).

      Hàm của engine suy băng ghế bằng "cả danh sách hồ sơ trừ người xuất
      phát", mà danh sách hồ sơ ở đây là CẢ ĐỘI. Đội 30 người vì thế lưu ra
      bản ghi có 19 dự bị — quá trần 7 — và bản ghi ấy không dựng lại được
      thành một trận, nên trước Phase 35 mở nó trong lịch sử là trắng cả
      trang. Chi tiết và bất biến dựa vào: `services/phatLai.ts`.
    */
    nha: dangKyDeLuu(tt.ben.nha),
    khach: dangKyDeLuu(tt.ben.khach),
    canThiep: tt.canThiep,
    cacSuKien: dongSuKien(tt),
    baoCao: dungBaoCao(tt),
  }
}

/**
 * Bắt đầu một trận, KHÔNG phải hook.
 *
 * Tách khỏi `useMatch` vì mỗi lần gọi hook là thêm một đồng hồ: hook đăng ký
 * một `setTimeout` lặp để đi từng phút, nên hai component cùng gọi `useMatch`
 * trong lúc trận đang chạy sẽ làm trận đi **hai phút mỗi nhịp**. `App` chỉ
 * cần mở một trận từ lịch sử, không cần đồng hồ, nên nó gọi hàm này.
 *
 * Trả về danh sách lý do nếu không bắt đầu được, hay `null` khi đã bắt đầu.
 */
export function batDauTranNgay(
  cauHinh: CauHinhTran,
): readonly LyDoKhongBatDau[] | null {
  try {
    useAppStore.getState().datTran(taoTran(cauHinh))
    // Mỗi lần bắt đầu là một lần chạy mới, kể cả khi đấu lại cùng mã trận.
    useAppStore.getState().datIdLanChay(crypto.randomUUID())
    useAppStore.getState().datTranDangChay(true)
    return null
  } catch (loi) {
    if (loi instanceof LoiCauHinhTran) return loi.cacLyDo
    throw loi
  }
}

export function useMatch() {
  const tran = useAppStore((s) => s.tran)
  const dangChay = useAppStore((s) => s.tranDangChay)
  const datDangChay = useAppStore((s) => s.datTranDangChay)
  const [tocDo, datTocDo] = useState<MucTocDo>('thuong')
  const [lyDoKhongBatDau, datLyDoKhongBatDau] = useState<
    readonly LyDoKhongBatDau[]
  >([])
  /* Số trận cũ vừa bị loại khỏi lịch sử — báo đúng MỘT lần (spec mục 5). */
  const [daLoaiTranCu, datDaLoaiTranCu] = useState<number | null>(null)

  /*
    Giữ mức tốc độ trong ref để đổi tốc độ áp dụng NGAY ở nhịp kế tiếp, không
    phải chờ dựng lại bộ đếm giờ.
  */
  const tocDoRef = useRef(tocDo)
  tocDoRef.current = tocDo

  const batDauTran = useCallback((cauHinh: CauHinhTran): boolean => {
    const loi = batDauTranNgay(cauHinh)
    datLyDoKhongBatDau(loi ?? [])
    return loi === null
  }, [])

  const tamDung = useCallback(() => datDangChay(false), [])
  const tiepTuc = useCallback(() => datDangChay(true), [])

  const chayHet = useCallback(() => {
    const hienTai = useAppStore.getState().tran
    if (!hienTai) return
    datDangChay(false)
    useAppStore.getState().datTran(chayHetTran(hienTai))
  }, [])

  /**
   * Xếp một can thiệp vào hàng đợi của trận. Trả về lý do nếu bị từ chối,
   * `null` nếu nhận.
   */
  const canThiep = useCallback((ct: CanThiep): LyDoTuChoiCanThiep | null => {
    const hienTai = useAppStore.getState().tran
    if (!hienTai) return 'tran-da-ket-thuc'

    const kq = apDungCanThiep(hienTai, ct)
    if (!kq.thanhCong) return kq.lyDo

    useAppStore.getState().datTran(kq.trangThai)
    return null
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

  /*
    Đấu lại đúng cặp đấu vừa rồi (AC-11.6).

    Dựng lại cấu hình TỪ trạng thái trận đang có, nên người dùng không phải
    chọn lại hai đội hay đăng ký lại 11+7 — đó là chỗ "không phải cấu hình
    lại từ đầu" mà AC nói tới (quyết định D47).

    Nguồn ngẫu nhiên THẬT nằm ở đây chứ không trong engine (P1): mã trận mới
    do tầng này sinh ra rồi truyền vào.
  */
  /*
    Lưu trận ngay khi nó kết thúc (AC-11.7).

    Chốt `idDaLuu` được đặt TRƯỚC khi chờ ghi đĩa: `useMatch` được gọi từ hai
    trang khác nhau, nên không có chốt thì một trận kết thúc sẽ vào lịch sử
    hai lần. Đây đúng cái bẫy đã làm trận đứng im ở phút 0 hồi Giai đoạn 3,
    khi cờ `dangChay` còn là state riêng của hook.
  */
  const daKetThuc = tran?.ketThuc ?? false
  useEffect(() => {
    if (!daKetThuc) return

    const st = useAppStore.getState()
    const tt = st.tran
    const id = st.idLanChay
    if (!tt || !tt.ketThuc || !id || st.idDaLuu === id) return

    st.datIdDaLuu(id)
    void matchRepo
      .luu(dungBanGhi(tt, id, st.teams))
      .then(async ({ daLoaiBo }) => {
        useAppStore.getState().datLichSu(await matchRepo.danhSach())
        if (daLoaiBo.length > 0) {
          datDaLoaiTranCu(daLoaiBo.length)
        }
      })
      .catch((loi: unknown) => {
        /*
          Ghi lịch sử hỏng thì phải NÓI (AC-4.7): người dùng cần biết trận vừa
          xem không được lưu, và còn đường xuất tệp sao lưu.
        */
        useAppStore.getState().datLoiLuuTru(chuanHoaLoiLuuTru(loi))
        useAppStore.getState().datIdDaLuu(null)
      })
  }, [daKetThuc])

  const dauLai = useCallback((dungMaCu: boolean): boolean => {
    const hienTai = useAppStore.getState().tran
    if (!hienTai) return false

    const ma = dungMaCu ? hienTai.maTran : taoMaTran(RNG_THAT)
    return batDauTran(cauHinhDauLai(hienTai, ma))
  }, [batDauTran])

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
    canThiep,
    roiTran,
    dauLai,
    daLoaiTranCu,
    xoaBaoDaLoai: () => datDaLoaiTranCu(null),
  }
}
