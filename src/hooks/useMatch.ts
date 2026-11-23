import { useCallback, useEffect, useRef, useState } from 'react'
import { LoiCauHinhTran, type LyDoKhongBatDau } from '../engine/batDau'
import { chuanHoaLoiLuuTru } from '../services/errors'
import { dungBaoCao } from '../engine/baoCao'
import { cheDoCuaTrangThai } from '../engine/lienTuc/tranLienTuc'
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

export type MucTocDo =
  | 'rat-cham'
  | 'cham'
  | 'thuong'
  | 'nhanh'
  | 'rat-nhanh'

/**
 * Mili-giây thực tế cho mỗi phút trận.
 *
 * `cham` là mức của spec 005 (T500): một phút trận dài **1000ms**, nên trận 90
 * phút xem hết trong khoảng một phút rưỡi. Nhịp này mới đủ dài để mắt theo
 * được một cầu thủ chạy từ chỗ cũ tới chỗ mới: ở 200ms, cả quãng đường có thể
 * bằng một phần ba sân phải gói trong 180ms, nên mọi cú di chuyển đều thành cú
 * rướn.
 *
 * `rat-nhanh` giữ nguyên 20ms, nhưng ở nhịp ấy `thoiGianChuyen` trả 0 — thôi
 * nội suy hoàn toàn (AC-29.4): 18ms không đủ cho mắt đọc một chuyển động nào, nên
 * vẽ đường đi chỉ sinh ra cú giật.
 *
 * `rat-cham` là mức thứ năm, thêm ở spec 006 (T614, quyết định D107): một phút
 * trận dài **2000ms**, nên trận 90 phút xem hết trong khoảng ba phút. Lý do nó
 * tồn tại không phải để xem cho thong thả, mà để **xem cho ra lỗi**: suốt spec
 * 005 và 006, bảy lỗi người dùng bắt được bằng mắt đều là lỗi của chuyển động
 * giữa hai mốc, và ở 1000ms một phút thì một pha dẫn bóng chỉ chiếm vài trăm
 * mili-giây. Gấp đôi nhịp lên là gấp đôi thời gian mắt có để đọc nó.
 *
 * **Mặc định vẫn là `cham`**, không phải mức mới: 2000ms × 90 phút là ba phút
 * ngồi xem, và đó phải là lựa chọn của người dùng chứ không phải cái họ gặp
 * khi chưa chọn gì.
 */
export const MS_MOI_PHUT: Readonly<Record<MucTocDo, number>> = {
  'rat-cham': 2000,
  cham: 1000,
  thuong: 200,
  nhanh: 70,
  'rat-nhanh': 20,
}

/*
  Thứ tự này là thứ tự các nút hiện trên màn hình, và nó là **thang chậm → nhanh**
  theo đúng một chiều. Trước spec 006 thì `cham` đứng đầu VÀ là mức mặc định, nên
  hai tính chất ấy trùng nhau và lý lẽ ghi ở đây là "để mức mặc định nằm giữa dãy
  thì người dùng khó đọc ra mình đang ở đâu".

  T614 thêm `rat-cham` vào **đầu** thang, nên hai tính chất ấy tách ra: mức mặc
  định giờ là phần tử **thứ hai**. Thang một chiều thắng, vì một thang tốc độ mà
  thứ tự không đơn điệu thì không đọc được; và mức đang chọn vẫn luôn nhận ra
  được, vì nút của nó được tô khác và `aria-checked` nói ra điều đó (P9).
*/
/**
 * Một nhịp lặng sau bàn thắng, mực thời gian thật (AC-32.5, T515).
 *
 * Đủ để xem hết hiệu ứng trên sân và đọc dòng tường thuật vừa hiện, như khi
 * truyền hình dừng lại một nhịp ở bàn thắng. Không phụ thuộc mức tốc độ: mắt
 * người cần một khoảng thời gian thật, không phải một số phút trận.
 */
export const MS_LANG_SAU_BAN_THANG = 1500

export const CAC_MUC_TOC_DO: readonly MucTocDo[] = [
  'rat-cham',
  'cham',
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
    /*
      Chế độ ĐỌC RA từ trạng thái, không nhận từ ngoài (AC-45.1, AC-45.4).

      `dungBanGhi` chỉ có `TrangThaiTran` trong tay, mà kiểu ấy đóng băng ở
      đúng 16 trường (D119) nên không mang chế độ. Nhận chế độ qua tham số thì
      phải nhớ nó ở đâu đó suốt trận — một nguồn sự thật thứ hai, và nó sẽ lệch
      khỏi engine thật sự đã chạy. `cheDoCuaTrangThai` hỏi `phienBanEngine`,
      thứ đã nằm sẵn trong trạng thái và đã là thứ `lyDoKhongDauLai` so.
    */
    cheDoMoPhong: cheDoCuaTrangThai(tt),
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
  /*
    Mặc định là `cham`, không `thuong` (AC-29.5, T500). Mở một trận ra là thấy
    ngay nhịp giống một trận đấu; ai chỉ cần tỉ số thì đã có "Chạy hết trận".
    Mức này KHÔNG được lưu xuống đĩa, nên mỗi trận lại bắt đầu từ đây — đúng
    như AC-29.5 viết, và là một trong những phát hiện MEDIUM còn mở của
    `/analyze` nếu sau này muốn nhớ lựa chọn.
  */
  const [tocDo, datTocDo] = useState<MucTocDo>('cham')
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
      const moi = buocTiep(hienTai)
      useAppStore.getState().datTran(moi)

      /*
        MỘT NHẬP LẮNG SAU BÀN THẮNG (T515, AC-32.5).

        Cách làm: **kéo dài riêng nhịp kế tiếp**, không gọi `tamDung()` rồi
        `tiepTuc()`. Đường kia sẽ làm nút Tạm dừng / Tiếp tục đổi chữ ngay
        trước mắt người dùng — đúng điều AC-32.5 cấm. Trạng thái "đang chạy"
        ở đây không đổi một giây nào, nên AC-32.5 đạt bằng cấu trúc.

        Nhận ra bàn thắng bằng việc **tỉ số đổi**, không bằng cách đi tìm dòng
        sự kiện: tỉ số chỉ đổi khi có bàn, và nó là hai con số có sẵn ở đây.

        Nhịp lặng xảy ra **kể cả khi đang ẩn sân**: dòng tường thuật và tỉ số
        cũng cần một nhịp để đọc, và gắn nó vào một công tắc hiển thị là buộc
        vòng đồng hồ biết một việc nó không nên biết (quyết định D100).
      */
      const coBanThang =
        moi.tiSo.nha !== hienTai.tiSo.nha ||
        moi.tiSo.khach !== hienTai.tiSo.khach

      hanGio = setTimeout(
        nhip,
        MS_MOI_PHUT[tocDoRef.current] + (coBanThang ? MS_LANG_SAU_BAN_THANG : 0),
      )
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
    /*
      Đấu lại giữ nguyên CHẾ ĐỘ của trận đang xem (tham số thứ ba của T705).
      Bỏ trống thì một trận liên tục đấu lại ra một trận cổ điển — đổi cả tỉ số,
      vì hai chế độ chạy trên hai dòng rút khác nhau (D118).
    */
    return batDauTran(
      cauHinhDauLai(hienTai, ma, cheDoCuaTrangThai(hienTai)),
    )
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
