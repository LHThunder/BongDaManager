import { useChuoi } from '../../hooks/useNgonNgu'
import { tenChiSo } from '../../domain/attributes'
import {
  chiSoChuaDat,
  vaiTroChoViTri,
  type RoleId,
} from '../../domain/roles'
import type { Player, PositionId } from '../../domain/types'
import { CHUNG, VAI_TRO } from '../strings'

interface Props {
  readonly viTri: PositionId
  readonly vaiTroHienTai: RoleId
  /** Cầu thủ đang đứng ở ô; `null` thì không có gì để cảnh báo. */
  readonly cauThu: Player | null
  readonly onChon: (roleId: RoleId) => void
  readonly onDong: () => void
}

/**
 * Bảng chọn vai trò cho một ô (AC-6.1, AC-6.3), kèm cảnh báo cầu thủ chưa
 * đáp ứng vai trò (AC-6.4).
 */
export function ChonVaiTro({
  viTri,
  vaiTroHienTai,
  cauThu,
  onChon,
  onDong,
}: Props) {
  const { NHAN_VI_TRI } = useChuoi()
  const cacVaiTro = vaiTroChoViTri(viTri)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {VAI_TRO.tieuDe}
          </h3>
          <p className="text-sm text-slate-500">{NHAN_VI_TRI[viTri].ten}</p>
        </div>
        <button
          type="button"
          onClick={onDong}
          className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CHUNG.dong}
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {cacVaiTro.map((v) => {
          const dangChon = v.id === vaiTroHienTai
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onChon(v.id)}
                aria-current={dangChon ? 'true' : undefined}
                className={`w-full rounded-md border p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  dangChon
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block font-medium text-slate-900">
                  {v.ten}
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  {v.moTa}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {VAI_TRO.chiSoQuanTrong}:{' '}
                  {v.chiSoQuanTrong.map((id) => tenChiSo(id)).join(', ')}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {cauThu !== null && (
        <CanhBaoChuaDat cauThu={cauThu} vaiTroId={vaiTroHienTai} />
      )}
    </section>
  )
}

interface CanhBaoProps {
  readonly cauThu: Player
  readonly vaiTroId: RoleId
}

/**
 * Cảnh báo chỉ số chưa đạt của vai trò đang chọn (AC-6.4).
 *
 * Chỉ số CHƯA ĐIỀN không bị báo là "không đạt": hồ sơ còn dở thì nói rõ là
 * chưa đánh giá được. Báo "không đạt" cho một ô người dùng chưa kịp điền là
 * nói sai về chính dữ liệu của họ.
 */
function CanhBaoChuaDat({ cauThu, vaiTroId }: CanhBaoProps) {
  const chuaDat = chiSoChuaDat(vaiTroId, cauThu)
  const chuaDien = chuaDat.filter((c) => c.giaTri === null)
  const thapHon = chuaDat.filter((c) => c.giaTri !== null)

  if (chuaDat.length === 0) {
    return (
      <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">
        {VAI_TRO.datHet}
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-md bg-amber-50 p-3">
      <p className="text-sm font-medium text-amber-900">
        {chuaDien.length > 0 && thapHon.length === 0
          ? VAI_TRO.chuaDanhGiaDuoc
          : VAI_TRO.tieuDeChuaDat}
      </p>
      <ul className="mt-1 space-y-0.5 text-sm text-amber-900">
        {thapHon.map((c) => (
          <li key={c.chiSo}>{VAI_TRO.chiSoChuaDat(c.ten, c.giaTri ?? 0)}</li>
        ))}
        {chuaDien.map((c) => (
          <li key={c.chiSo}>{VAI_TRO.chiSoChuaDien(c.ten)}</li>
        ))}
      </ul>
    </div>
  )
}
