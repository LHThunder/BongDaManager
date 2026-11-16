import { useChuoi } from '../../hooks/useNgonNgu'
import {
  chiSoChuaDat,
  vaiTroChoViTri,
  type RoleId,
} from '../../domain/roles'
import type { Player, PositionId } from '../../domain/types'


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
  const { NHAN_VAI_TRO, NHAN_CHI_SO, NHAN_VI_TRI, CHUNG, VAI_TRO } = useChuoi()
  const cacVaiTro = vaiTroChoViTri(viTri)

  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-chu">
            {VAI_TRO.tieuDe}
          </h3>
          <p className="text-sm text-chu-phu">{NHAN_VI_TRI[viTri].ten}</p>
        </div>
        <button
          type="button"
          onClick={onDong}
          className="text-sm text-chinh underline hover:text-chinh-dam"
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
                className={`w-full rounded-md border p-3 text-left ${
                  dangChon
                    ? 'border-chinh bg-chinh-nhat'
                    : 'border-vien hover:bg-nen-nhan'
                }`}
              >
                <span className="block font-medium text-chu">
                  {NHAN_VAI_TRO[v.id].ten}
                </span>
                <span className="mt-0.5 block text-sm text-chu-phu">
                  {NHAN_VAI_TRO[v.id].moTa}
                </span>
                <span className="mt-1 block text-xs text-chu-phu">
                  {VAI_TRO.chiSoQuanTrong}:{' '}
                  {v.chiSoQuanTrong.map((id) => NHAN_CHI_SO[id]).join(', ')}
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
  const { NHAN_CHI_SO, VAI_TRO } = useChuoi()
  const chuaDat = chiSoChuaDat(vaiTroId, cauThu)
  const chuaDien = chuaDat.filter((c) => c.giaTri === null)
  const thapHon = chuaDat.filter((c) => c.giaTri !== null)

  if (chuaDat.length === 0) {
    return (
      <p className="mt-3 rounded-md bg-tot-nen p-3 text-sm text-tot-chu">
        {VAI_TRO.datHet}
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-md bg-canh-bao-nen p-3">
      <p className="text-sm font-medium text-canh-bao-chu">
        {chuaDien.length > 0 && thapHon.length === 0
          ? VAI_TRO.chuaDanhGiaDuoc
          : VAI_TRO.tieuDeChuaDat}
      </p>
      <ul className="mt-1 space-y-0.5 text-sm text-canh-bao-chu">
        {thapHon.map((c) => (
          <li key={c.chiSo}>{VAI_TRO.chiSoChuaDat(NHAN_CHI_SO[c.chiSo], c.giaTri ?? 0)}</li>
        ))}
        {chuaDien.map((c) => (
          <li key={c.chiSo}>{VAI_TRO.chiSoChuaDien(NHAN_CHI_SO[c.chiSo])}</li>
        ))}
      </ul>
    </div>
  )
}
