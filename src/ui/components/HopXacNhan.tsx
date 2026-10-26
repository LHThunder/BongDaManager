import { useEffect, useRef } from 'react'
import { CHUNG } from '../strings'

interface Props {
  readonly tieuDe: string
  readonly moTa: string
  readonly nhanXacNhan: string
  readonly nguyHiem?: boolean
  readonly onXacNhan: () => void
  readonly onHuy: () => void
}

/**
 * Hộp xác nhận cho những việc không hoàn tác được (AC-1.6).
 * Đóng được bằng Esc, và nút Huỷ được focus sẵn để một lần Enter vô tình
 * không xoá mất dữ liệu của người dùng (P3).
 */
export function HopXacNhan({
  tieuDe,
  moTa,
  nhanXacNhan,
  nguyHiem = false,
  onXacNhan,
  onHuy,
}: Props) {
  const nutHuy = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    nutHuy.current?.focus()
  }, [])

  useEffect(() => {
    function xuLy(e: KeyboardEvent) {
      if (e.key === 'Escape') onHuy()
    }
    window.addEventListener('keydown', xuLy)
    return () => window.removeEventListener('keydown', xuLy)
  }, [onHuy])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hop-xac-nhan-tieu-de"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2
          id="hop-xac-nhan-tieu-de"
          className="text-lg font-semibold text-slate-900"
        >
          {tieuDe}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{moTa}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={nutHuy}
            type="button"
            onClick={onHuy}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {CHUNG.huy}
          </button>
          <button
            type="button"
            onClick={onXacNhan}
            className={
              nguyHiem
                ? 'rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400'
                : 'rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400'
            }
          >
            {nhanXacNhan}
          </button>
        </div>
      </div>
    </div>
  )
}
