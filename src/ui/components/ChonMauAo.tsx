import {
  laMauHopLe,
  nenDamBaoTuongPhan,
  trungMauAo,
} from '../../domain/colors'
import { CHON_MAU_AO } from '../strings'
import { chuCaiDau } from './AnhThayThe'

export interface DoiDeSoMau {
  readonly id: string
  readonly name: string
  readonly primaryColor: string
}

interface Props {
  readonly tenDoi: string
  readonly mauChinh: string
  readonly mauPhu: string
  /** Các đội khác, để cảnh báo trùng màu áo (AC-3.7). */
  readonly doiKhac: readonly DoiDeSoMau[]
  readonly onDoi: (mauChinh: string, mauPhu: string) => void
}

function ChipXemTruoc({ ten, mau }: { ten: string; mau: string }) {
  const { nen, chu } = nenDamBaoTuongPhan(laMauHopLe(mau) ? mau : '#64748B')
  return (
    <span
      className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold"
      style={{ backgroundColor: nen, color: chu }}
    >
      {chuCaiDau(ten)}
      <span className="font-normal">{ten}</span>
    </span>
  )
}

/**
 * Chọn màu áo chính và áo phụ (AC-3.6), kèm ba cảnh báo:
 * trùng màu với đội khác (AC-3.7), áo chính và áo phụ giống nhau, và màu nằm
 * trong dải không đủ tương phản nên nền hiển thị bị điều chỉnh (AC-3.8).
 */
export function ChonMauAo({
  tenDoi,
  mauChinh,
  mauPhu,
  doiKhac,
  onDoi,
}: Props) {
  const hopLe = laMauHopLe(mauChinh) && laMauHopLe(mauPhu)

  const doiTrungMau = hopLe
    ? doiKhac.filter(
        (d) => laMauHopLe(d.primaryColor) && trungMauAo(mauChinh, d.primaryColor),
      )
    : []

  const chinhVaPhuGiongNhau = hopLe && trungMauAo(mauChinh, mauPhu)
  const nenDaDieuChinh = hopLe && nenDamBaoTuongPhan(mauChinh).daDieuChinh

  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          {CHON_MAU_AO.nhanMauChinh}
          <input
            type="color"
            value={laMauHopLe(mauChinh) ? mauChinh : '#1E40AF'}
            onChange={(e) => onDoi(e.target.value.toUpperCase(), mauPhu)}
            className="mt-1 block h-10 w-full cursor-pointer rounded-md border border-slate-300"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          {CHON_MAU_AO.nhanMauPhu}
          <input
            type="color"
            value={laMauHopLe(mauPhu) ? mauPhu : '#F8FAFC'}
            onChange={(e) => onDoi(mauChinh, e.target.value.toUpperCase())}
            className="mt-1 block h-10 w-full cursor-pointer rounded-md border border-slate-300"
          />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {CHON_MAU_AO.xemTruoc}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <ChipXemTruoc ten={tenDoi || '?'} mau={mauChinh} />
          <ChipXemTruoc ten={tenDoi || '?'} mau={mauPhu} />
        </div>
      </div>

      {doiTrungMau.length > 0 && (
        <p role="alert" className="mt-3 text-sm text-amber-800">
          {CHON_MAU_AO.canhBaoTrungMauDoiKhac(
            doiTrungMau.map((d) => d.name).join(', '),
          )}
        </p>
      )}

      {chinhVaPhuGiongNhau && (
        <p role="alert" className="mt-2 text-sm text-amber-800">
          {CHON_MAU_AO.canhBaoChinhVaPhuGiongNhau}
        </p>
      )}

      {nenDaDieuChinh && (
        <p className="mt-2 text-xs text-slate-500">
          {CHON_MAU_AO.canhBaoNenDaDieuChinh}
        </p>
      )}
    </div>
  )
}
