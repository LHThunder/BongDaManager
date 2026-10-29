import type { BenDoi } from '../../engine/suKien'
import type { NguoiGhiBan } from '../../engine/baoCao'
import { BAO_CAO_SAU_TRAN } from '../strings'

interface Props {
  readonly nguoiGhiBan: readonly NguoiGhiBan[]
  readonly tenCauThu: (playerId: string) => string
  readonly tenDoi: (ben: BenDoi) => string
}

/**
 * Người ghi bàn của cả hai đội, kèm phút ghi bàn (AC-11.1).
 *
 * Xếp theo phút chứ không gom theo đội: người xem muốn đọc lại trận theo
 * trình tự nó đã diễn ra.
 */
export function DanhSachGhiBan({ nguoiGhiBan, tenCauThu, tenDoi }: Props) {
  if (nguoiGhiBan.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {BAO_CAO_SAU_TRAN.chuaCoBanThang}
      </p>
    )
  }

  const theoPhut = [...nguoiGhiBan].sort((a, b) => a.phut - b.phut)

  return (
    <ul className="space-y-1 text-sm text-slate-900">
      {theoPhut.map((ban, i) => (
        <li key={`${ban.playerId}-${ban.phut}-${i}`} className="flex gap-2">
          <span className="w-12 shrink-0 font-mono text-slate-600">
            {BAO_CAO_SAU_TRAN.phut(ban.phut, ban.buGio)}
          </span>
          <span className="font-medium">{tenCauThu(ban.playerId)}</span>
          <span className="text-slate-500">({tenDoi(ban.doi)})</span>
        </li>
      ))}
    </ul>
  )
}
