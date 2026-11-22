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
  'rat-cham': 'ratCham',
  cham: 'cham',
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
        className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
      >
        {dangChay ? TRAN_DAU.tamDung : TRAN_DAU.tiepTuc}
      </button>

      <button
        type="button"
        onClick={onChayHet}
        disabled={daKetThuc}
        className="rounded-md border border-chinh px-4 py-2 text-sm font-medium text-chinh hover:bg-chinh-nhat disabled:cursor-not-allowed disabled:border-vien disabled:text-chu-phu"
      >
        {TRAN_DAU.chayHet}
      </button>

      <fieldset className="flex items-center gap-2">
        <legend className="sr-only">{TRAN_DAU.nhanTocDo}</legend>
        <span className="text-sm text-chu-phu">{TRAN_DAU.nhanTocDo}</span>
        {CAC_MUC_TOC_DO.map((m) => (
          <label
            key={m}
            className={`cursor-pointer rounded-md border px-2 py-1 text-sm focus-within:ring-2 focus-within:ring-chinh ${
              m === tocDo
                ? 'border-chinh bg-chinh-nhat font-medium text-chinh-dam'
                : 'border-vien text-chu hover:bg-nen-nhan'
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
