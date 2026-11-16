import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useRef } from 'react'


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
  const { CHUNG } = useChuoi()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lop-phu p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hop-xac-nhan-tieu-de"
        className="w-full max-w-md rounded-lg bg-nen-the p-6 shadow-xl"
      >
        <h2
          id="hop-xac-nhan-tieu-de"
          className="text-lg font-semibold text-chu"
        >
          {tieuDe}
        </h2>
        <p className="mt-2 text-sm text-chu-phu">{moTa}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={nutHuy}
            type="button"
            onClick={onHuy}
            className="rounded-md border border-vien-dam px-4 py-2 text-sm font-medium text-chu hover:bg-nen-nhan"
          >
            {CHUNG.huy}
          </button>
          <button
            type="button"
            onClick={onXacNhan}
            className={
              nguyHiem
                ? 'rounded-md bg-loi-manh px-4 py-2 text-sm font-medium text-chu-tren-loi hover:bg-loi-manh-dam'
                : 'rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam   '
            }
          >
            {nhanXacNhan}
          </button>
        </div>
      </div>
    </div>
  )
}
