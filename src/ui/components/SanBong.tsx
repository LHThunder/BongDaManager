import type { ReactNode } from 'react'
import type { Formation, OViTriSoDo } from '../../domain/formations'

interface Props {
  readonly soDo: Formation
  /** Vẽ nội dung cho một ô; `SanBong` chỉ lo đặt nó vào đúng toạ độ. */
  readonly renderO: (o: OViTriSoDo) => ReactNode
}

/*
  Sân bóng nhìn dọc: khung thành đội mình ở DƯỚI, khung thành đối thủ ở TRÊN.

  Toạ độ ô trong `formations.ts` có `y = 0` là khung thành đội mình, còn CSS
  thì `top: 0` là mép trên — nên phải lật: `top = 100 - y`.

  Mọi thứ vẽ bằng CSS và SVG nội tuyến, KHÔNG tải tài nguyên nào từ ngoài
  (P4: ứng dụng chạy offline, không gọi mạng lúc chạy).

  Tỉ lệ sân giữ cố định 68:105 — kích thước thật của một sân bóng — nên ô
  không bị méo khi khung co giãn.
*/
export function SanBong({ soDo, renderO }: Props) {
  return (
    <div className="relative aspect-[68/105] w-full overflow-hidden rounded-lg bg-emerald-700">
      {/* Vạch sân. aria-hidden vì đây là hình trang trí: thông tin thật
          nằm trong từng ô, dạng chữ. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 68 105"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="rgb(255 255 255 / 0.45)"
        strokeWidth="0.4"
      >
        <rect x="1.5" y="1.5" width="65" height="102" />
        <line x1="1.5" y1="52.5" x2="66.5" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <circle cx="34" cy="52.5" r="0.5" fill="rgb(255 255 255 / 0.45)" />

        {/* Khung thành đội mình (dưới) */}
        <rect x="13.85" y="87.5" width="40.3" height="16" />
        <rect x="24.85" y="98" width="18.3" height="5.5" />
        <circle cx="34" cy="92.5" r="0.5" fill="rgb(255 255 255 / 0.45)" />

        {/* Khung thành đối thủ (trên) */}
        <rect x="13.85" y="1.5" width="40.3" height="16" />
        <rect x="24.85" y="1.5" width="18.3" height="5.5" />
        <circle cx="34" cy="12.5" r="0.5" fill="rgb(255 255 255 / 0.45)" />
      </svg>

      {soDo.oVien.map((o) => (
        <div
          key={o.slotId}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${o.x}%`, top: `${100 - o.y}%` }}
        >
          {renderO(o)}
        </div>
      ))}
    </div>
  )
}
