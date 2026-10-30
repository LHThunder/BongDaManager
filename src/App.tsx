import { useCallback, useEffect, useState } from 'react'
import { ngheBiChanNangCap, ngheNhuongDuongNangCap } from './storage/db'
import { useAppStore } from './store/appStore'
import { CHON_CAP_DAU, CHUNG, LICH_SU, cauLoi } from './ui/strings'
import { ChonCapDau } from './ui/pages/ChonCapDau'
import { DanhSachDoi } from './ui/pages/DanhSachDoi'
import { TrangChienThuat } from './ui/pages/TrangChienThuat'
import { TrangDoi } from './ui/pages/TrangDoi'
import { batDauTranNgay } from './hooks/useMatch'
import type { TranDaLuu } from './storage/db'
import { TrangLichSu } from './ui/pages/TrangLichSu'
import { TrangTran } from './ui/pages/TrangTran'

type Khung =
  | { readonly loai: 'danh-sach-doi' }
  | { readonly loai: 'trang-doi'; readonly teamId: string }
  | { readonly loai: 'trang-chien-thuat'; readonly teamId: string }
  | { readonly loai: 'chon-cap-dau' }
  | { readonly loai: 'tran-dau' }
  | { readonly loai: 'lich-su' }

export default function App() {
  const [khung, datKhung] = useState<Khung>({ loai: 'danh-sach-doi' })
  const loiLuuTru = useAppStore((s) => s.loiLuuTru)
  const datLoiLuuTru = useAppStore((s) => s.datLoiLuuTru)

  /*
    Nâng cấp kho dữ liệu đang chờ các tab cũ đóng (T131). Nghe thẳng từ
    `storage` chứ không qua store: đây là trạng thái của chính kết nối
    database, không phải dữ liệu của ứng dụng, và nó xảy ra TRƯỚC khi có
    kết nối để nạp bất cứ thứ gì vào store.
  */
  const [biChanNangCap, datBiChanNangCap] = useState(false)
  useEffect(() => ngheBiChanNangCap(datBiChanNangCap), [])

  /*
    Mặt kia: tab này vừa nhường kết nối cho một tab khác nâng cấp (T133).
    Nặng hơn dải trên, vì từ lúc này mọi thao tác ghi ở đây đều hỏng.
  */
  const [daNhuongKetNoi, datDaNhuongKetNoi] = useState(false)
  useEffect(() => ngheNhuongDuongNangCap(datDaNhuongKetNoi), [])

  const moDoi = useCallback((teamId: string) => {
    datKhung({ loai: 'trang-doi', teamId })
  }, [])

  const veDanhSach = useCallback(() => {
    datKhung({ loai: 'danh-sach-doi' })
  }, [])

  const moChienThuat = useCallback((teamId: string) => {
    datKhung({ loai: 'trang-chien-thuat', teamId })
  }, [])

  const moChonCapDau = useCallback(() => {
    datKhung({ loai: 'chon-cap-dau' })
  }, [])

  const moTranDau = useCallback(() => {
    datKhung({ loai: 'tran-dau' })
  }, [])

  const moLichSu = useCallback(() => {
    datKhung({ loai: 'lich-su' })
  }, [])

  /*
    Đấu lại một trận trong lịch sử (AC-11.6): dựng lại cấu hình từ bản ghi
    rồi mở thẳng màn trận — không bắt người dùng chọn lại đội hay đăng ký
    lại 11+7.
  */
  /*
    Dùng `batDauTranNgay` chứ KHÔNG gọi `useMatch` ở đây: mỗi lần gọi hook là
    thêm một đồng hồ trận, nên `App` gọi hook thì trận sẽ đi hai phút mỗi
    nhịp khi màn trận cũng đang mở.
  */
  const dauLaiTuLichSu = useCallback(
    (tran: TranDaLuu) => {
      const loi = batDauTranNgay({
        maTran: tran.maTran,
        sanTrungLap: tran.sanTrungLap,
        doiCuaNguoiDung: tran.doiCuaNguoiDung,
        nha: tran.nha,
        khach: tran.khach,
      })
      if (loi === null) datKhung({ loai: 'tran-dau' })
    },
    [],
  )

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            {CHUNG.tenUngDung}
          </h1>
        </div>
      </header>

      {/*
        Đã nhường đường thì tab này không ghi được gì nữa, nên dải báo phải
        đứng trên cùng và nặng hơn mọi dải khác (T133). Không tự tải lại hộ
        người dùng: họ có thể đang đọc dở một báo cáo sau trận, và tự ý tải
        lại là lấy mất thứ đang xem mà không hỏi.
      */}
      {daNhuongKetNoi && (
        <div role="alert" className="border-b border-red-300 bg-red-100">
          <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-3">
            <p className="flex-1 text-sm font-medium text-red-900">
              {CHUNG.daNhuongKetNoi}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-md border border-red-700 px-3 py-1 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CHUNG.taiLaiTrang}
            </button>
          </div>
        </div>
      )}

      {/*
        Nâng cấp bị chặn thì KHÔNG có kết nối database, nên mọi màn hình bên
        dưới chỉ hiện được "Đang tải…". Dải này nằm trên cùng và có nút tải
        lại, để người dùng đóng tab cũ xong là xử lý được ngay tại chỗ.
      */}
      {biChanNangCap && (
        <div role="alert" className="border-b border-amber-300 bg-amber-100">
          <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-3">
            <p className="flex-1 text-sm font-medium text-amber-900">
              {CHUNG.chanNangCapDuLieu}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-md border border-amber-700 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {CHUNG.taiLaiTrang}
            </button>
          </div>
        </div>
      )}

      {/*
        Cảnh báo lưu trữ hiện ở một chỗ duy nhất cho cả ứng dụng (AC-4.7).
        T031 nối thêm phần xử lý tập trung khi lưu thất bại giữa lúc nhập liệu.
      */}
      {loiLuuTru !== null && (
        <div role="alert" className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-5xl items-start gap-4 px-4 py-3">
            <p className="flex-1 text-sm text-amber-900">{cauLoi(loiLuuTru)}</p>
            <button
              type="button"
              onClick={() => datLoiLuuTru(null)}
              className="shrink-0 text-sm font-medium text-amber-900 underline focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CHUNG.dong}
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        {khung.loai === 'danh-sach-doi' && (
          <>
            <div className="mb-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={moLichSu}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {LICH_SU.tieuDe}
              </button>
              <button
                type="button"
                onClick={moChonCapDau}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {CHON_CAP_DAU.tieuDe}
              </button>
            </div>
            <DanhSachDoi onMoDoi={moDoi} />
          </>
        )}

        {khung.loai === 'chon-cap-dau' && (
          <ChonCapDau onQuayLai={veDanhSach} onDaBatDau={moTranDau} />
        )}

        {khung.loai === 'tran-dau' && <TrangTran onRoiTran={veDanhSach} />}

        {khung.loai === 'lich-su' && (
          <TrangLichSu onQuayLai={veDanhSach} onDauLai={dauLaiTuLichSu} />
        )}

        {khung.loai === 'trang-doi' && (
          <TrangDoi
            teamId={khung.teamId}
            onQuayLai={veDanhSach}
            onMoChienThuat={moChienThuat}
          />
        )}

        {khung.loai === 'trang-chien-thuat' && (
          <TrangChienThuat
            teamId={khung.teamId}
            onQuayLai={() => moDoi(khung.teamId)}
          />
        )}
      </main>
    </div>
  )
}
