import { useEffect, useState } from 'react'
import type { Team } from '../../domain/types'
import * as teamRepo from '../../services/teamRepo'
import { CHUNG, TRANG_DOI } from '../strings'

interface Props {
  readonly teamId: string
  readonly onQuayLai: () => void
}

/**
 * Trang của một đội.
 *
 * Giai đoạn 1 chỉ dựng khung: tên đội và đường về danh sách, đủ để AC-1.2
 * ("đưa người dùng vào trang quản lý đội vừa tạo") thoả được ngay trong
 * Phase 1. Danh sách cầu thủ do T023 bổ sung vào chính file này.
 */
export function TrangDoi({ teamId, onQuayLai }: Props) {
  const [doi, datDoi] = useState<Team | null>(null)

  useEffect(() => {
    let conHieuLuc = true
    void teamRepo.get(teamId).then(
      (t) => {
        if (conHieuLuc) datDoi(t)
      },
      () => {
        if (conHieuLuc) onQuayLai()
      },
    )
    return () => {
      conHieuLuc = false
    }
  }, [teamId, onQuayLai])

  if (!doi) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
  }

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CHUNG.quayLai}
      </button>

      <div className="mt-4 flex items-center gap-4">
        <div
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
          style={{ backgroundColor: doi.primaryColor }}
        >
          {doi.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            {TRANG_DOI.doiNay}
          </p>
          <h2 className="text-2xl font-bold text-slate-900">{doi.name}</h2>
        </div>
      </div>
    </div>
  )
}
