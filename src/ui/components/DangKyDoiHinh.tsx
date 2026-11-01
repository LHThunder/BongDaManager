import { layViTri } from '../../domain/positions'
import type { Player } from '../../domain/types'
import { SO_CAU_THU_CHINH, SO_CAU_THU_DU_BI_TOI_DA } from '../../engine/batDau'
import { DANG_KY_DOI_HINH, TRANG_CHIEN_THUAT } from '../strings'

export type VaiTroDangKy = 'chinh' | 'du-bi' | 'ngoai'

interface Props {
  readonly tenDoi: string
  readonly cauThu: readonly Player[]
  readonly dangKy: Readonly<Record<string, VaiTroDangKy>>
  readonly onDoi: (playerId: string, vaiTro: VaiTroDangKy) => void
}

/**
 * Đăng ký đúng 11 chính và đúng 7 dự bị trước trận (AC-9.9).
 *
 * Người ngoài 18 không dùng được trong trận đó — ở đây họ đơn giản là không
 * được đưa vào `trenSan` hay `duBi` khi dựng cấu hình trận.
 */
export function DangKyDoiHinh({ tenDoi, cauThu, dangKy, onDoi }: Props) {
  const dem = (v: VaiTroDangKy) =>
    cauThu.filter((p) => dangKy[p.id] === v).length

  const soChinh = dem('chinh')
  const soDuBi = dem('du-bi')

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">{tenDoi}</h3>
      <p className="mt-0.5 text-sm text-slate-500">{DANG_KY_DOI_HINH.moTa}</p>

      <p className="mt-2 flex gap-3 text-sm">
        <span
          className={
            soChinh === SO_CAU_THU_CHINH ? 'text-emerald-700' : 'text-amber-700'
          }
        >
          {DANG_KY_DOI_HINH.demChinh(soChinh, SO_CAU_THU_CHINH)}
        </span>
        <span
          className={
            soDuBi <= SO_CAU_THU_DU_BI_TOI_DA ? 'text-emerald-700' : 'text-amber-700'
          }
        >
          {DANG_KY_DOI_HINH.demDuBi(soDuBi, SO_CAU_THU_DU_BI_TOI_DA)}
        </span>
      </p>

      <ul className="mt-3 max-h-72 divide-y divide-slate-200 overflow-y-auto">
        {cauThu.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-1.5">
            <span className="w-8 shrink-0 text-xs text-slate-500">
              {p.shirtNumber}
            </span>
            <span className="flex-1 truncate text-sm text-slate-900">
              {p.name}
            </span>
            <span className="w-12 shrink-0 text-xs text-slate-500">
              {layViTri(p.positions[0] ?? 'MC').vietTat}
            </span>
            <label className="sr-only" htmlFor={`dk-${p.id}`}>
              {TRANG_CHIEN_THUAT.nhanO(p.name)}
            </label>
            <select
              id={`dk-${p.id}`}
              value={dangKy[p.id] ?? 'ngoai'}
              onChange={(e) => onDoi(p.id, e.target.value as VaiTroDangKy)}
              className="rounded border border-slate-300 px-1 py-0.5 text-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="chinh">{DANG_KY_DOI_HINH.nhanChinh}</option>
              <option value="du-bi">{DANG_KY_DOI_HINH.nhanDuBi}</option>
              <option value="ngoai">{DANG_KY_DOI_HINH.nhanNgoai}</option>
            </select>
          </li>
        ))}
      </ul>
    </section>
  )
}
