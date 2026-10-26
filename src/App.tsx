import { useCallback, useState } from 'react'
import { useAppStore } from './store/appStore'
import { CHUNG, cauLoi } from './ui/strings'
import { DanhSachDoi } from './ui/pages/DanhSachDoi'
import { TrangDoi } from './ui/pages/TrangDoi'

type Khung =
  | { readonly loai: 'danh-sach-doi' }
  | { readonly loai: 'trang-doi'; readonly teamId: string }

export default function App() {
  const [khung, datKhung] = useState<Khung>({ loai: 'danh-sach-doi' })
  const loiLuuTru = useAppStore((s) => s.loiLuuTru)
  const datLoiLuuTru = useAppStore((s) => s.datLoiLuuTru)

  const moDoi = useCallback((teamId: string) => {
    datKhung({ loai: 'trang-doi', teamId })
  }, [])

  const veDanhSach = useCallback(() => {
    datKhung({ loai: 'danh-sach-doi' })
  }, [])

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
        {khung.loai === 'danh-sach-doi' ? (
          <DanhSachDoi onMoDoi={moDoi} />
        ) : (
          <TrangDoi teamId={khung.teamId} onQuayLai={veDanhSach} />
        )}
      </main>
    </div>
  )
}
