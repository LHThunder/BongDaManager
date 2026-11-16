import { useChuoi } from '../../hooks/useNgonNgu'
import type { BoChuoi } from '../ngonNgu'
import { CAC_MUC_TOC_DO, type MucTocDo } from '../../hooks/useMatch'


interface Props {
  readonly dangChay: boolean
  readonly daKetThuc: boolean
  readonly tocDo: MucTocDo
  readonly onTamDung: () => void
  readonly onTiepTuc: () => void
  readonly onChayHet: () => void
  readonly onDoiTocDo: (tocDo: MucTocDo) => void
}

/*
  Ở tầng module chỉ giữ được KHOÁ, không giữ được nhãn: nhãn phụ thuộc ngôn
  ngữ đang chọn nên phải tra lúc vẽ, trong thân component (P8).
*/
const KHOA_TOC_DO: Readonly<
  Record<MucTocDo, keyof BoChuoi['TRAN_DAU']['tocDo']>
> = {
  thuong: 'thuong',
  nhanh: 'nhanh',
  'rat-nhanh': 'ratNhanh',
}

/** Tạm dừng, đổi tốc độ và chạy hết trận (AC-9.2, AC-9.3, AC-9.4). */
export function BangDieuKhienTran({
  dangChay,
  daKetThuc,
  tocDo,
  onTamDung,
  onTiepTuc,
  onChayHet,
  onDoiTocDo,
}: Props) {
  const { TRAN_DAU } = useChuoi()
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={dangChay ? onTamDung : onTiepTuc}
        disabled={daKetThuc}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {dangChay ? TRAN_DAU.tamDung : TRAN_DAU.tiepTuc}
      </button>

      <button
        type="button"
        onClick={onChayHet}
        disabled={daKetThuc}
        className="rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
      >
        {TRAN_DAU.chayHet}
      </button>

      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">{TRAN_DAU.nhanTocDo}</legend>
        <span className="text-sm text-slate-600">{TRAN_DAU.nhanTocDo}</span>
        {CAC_MUC_TOC_DO.map((m) => (
          <label
            key={m}
            className={`cursor-pointer rounded-md border px-2 py-1 text-sm focus-within:ring-2 focus-within:ring-blue-400 ${
              m === tocDo
                ? 'border-blue-600 bg-blue-50 font-medium text-blue-900'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="toc-do"
              value={m}
              checked={m === tocDo}
              onChange={() => onDoiTocDo(m)}
              className="sr-only"
            />
            {TRAN_DAU.tocDo[KHOA_TOC_DO[m]]}
          </label>
        ))}
      </fieldset>
    </div>
  )
}
