import { useEffect, useState } from 'react'

/*
  Hook giảm chuyển động, dùng chung cho mọi lớp vẽ sân (T812, quyết định D143).

  Hàm này sống ở `San2D.tsx:1039` cho tới ngày 2026-11-25 và nó **không được
  export**, nên `San3D` không import được. `/analyze` bắt được điều đó, và nó
  được bóc ra đây NGUYÊN VẸN — không một dòng logic nào đổi.

  Vì sao không nhân bản sang `San3D.tsx`: giảm chuyển động là yêu cầu
  accessibility của **P9**, không phải một tuỳ chọn trang trí. Hai nguồn cho một
  hành vi là cách chắc nhất để một nguồn lệch đi mà không ai thấy.

  File này **cố ý không có file test đi kèm**: nó đọc `window.matchMedia`, thứ
  không tồn tại ở `environment: 'node'` mà `vitest.config` đang dùng. Điều nó
  hứa được canh bằng chỗ gọi, đúng như trước khi bóc.
*/

/**
 * Người dùng có bật chế độ giảm chuyển động của hệ điều hành không (AC-25.6).
 *
 * Bắt đầu bằng `false` rồi mới hỏi trong effect: `matchMedia` không tồn tại
 * khi file gọi được một test chạy ở môi trường node import vào, và `hinhSan`
 * thì đang được kiểm đúng kiểu ấy.
 */
export function useGiamChuyenDong(): boolean {
  const [giam, datGiam] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const hoi = window.matchMedia('(prefers-reduced-motion: reduce)')
    datGiam(hoi.matches)
    const nghe = () => datGiam(hoi.matches)
    hoi.addEventListener('change', nghe)
    return () => hoi.removeEventListener('change', nghe)
  }, [])

  return giam
}
