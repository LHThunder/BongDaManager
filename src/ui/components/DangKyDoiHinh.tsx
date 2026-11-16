import { useChuoi } from '../../hooks/useNgonNgu'
import type { Player } from '../../domain/types'
import { SO_CAU_THU_DU_BI_TOI_DA } from '../../engine/batDau'


export type VaiTroDangKy = 'chinh' | 'du-bi' | 'ngoai'

interface Props {
  readonly tenDoi: string
  /**
   * Số người chính của TRẬN NÀY.
   *
   * Trước đây màn này đếm cứng theo `SO_CAU_THU_CHINH` (11), nên một trận
   * sân 5 vẫn hiện "5/11 chính" và câu hướng dẫn vẫn đòi 11 người — đúng
   * lỗi AC-23.1 treo lại từ spec 002. Quân số thật nằm ở
   * `CauHinhTran.quanSo` (D52), nên nó phải đi vào từ màn chọn cặp đấu.
   */
  readonly quanSo: number
  readonly cauThu: readonly Player[]
  readonly dangKy: Readonly<Record<string, VaiTroDangKy>>
  readonly onDoi: (playerId: string, vaiTro: VaiTroDangKy) => void
}

/**
 * Đăng ký đủ người chính và tối đa 7 dự bị trước trận (AC-9.9, AC-23.1).
 *
 * Người ngoài 18 không dùng được trong trận đó — ở đây họ đơn giản là không
 * được đưa vào `trenSan` hay `duBi` khi dựng cấu hình trận.
 */
export function DangKyDoiHinh({
  tenDoi,
  quanSo,
  cauThu,
  dangKy,
  onDoi,
}: Props) {
  const { NHAN_VI_TRI, DANG_KY_DOI_HINH, TRANG_CHIEN_THUAT } = useChuoi()
  const dem = (v: VaiTroDangKy) =>
    cauThu.filter((p) => dangKy[p.id] === v).length

  const soChinh = dem('chinh')
  const soDuBi = dem('du-bi')

  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <h3 className="text-base font-semibold text-chu">{tenDoi}</h3>
      <p className="mt-0.5 text-sm text-chu-phu">
        {DANG_KY_DOI_HINH.moTa(quanSo, SO_CAU_THU_DU_BI_TOI_DA)}
      </p>

      <p className="mt-2 flex gap-3 text-sm">
        <span
          className={
            soChinh === quanSo ? 'text-tot-chu' : 'text-canh-bao-chu'
          }
        >
          {DANG_KY_DOI_HINH.demChinh(soChinh, quanSo)}
        </span>
        <span
          className={
            soDuBi <= SO_CAU_THU_DU_BI_TOI_DA ? 'text-tot-chu' : 'text-canh-bao-chu'
          }
        >
          {DANG_KY_DOI_HINH.demDuBi(soDuBi, SO_CAU_THU_DU_BI_TOI_DA)}
        </span>
      </p>

      <ul className="mt-3 max-h-72 divide-y divide-vien overflow-y-auto">
        {cauThu.map((p) => (
          <li key={p.id} className="flex items-center gap-2 py-1.5">
            <span className="w-8 shrink-0 text-xs text-chu-phu">
              {p.shirtNumber}
            </span>
            <span className="flex-1 truncate text-sm text-chu">
              {p.name}
            </span>
            <span className="w-12 shrink-0 text-xs text-chu-phu">
              {NHAN_VI_TRI[p.positions[0] ?? 'MC'].vietTat}
            </span>
            <label className="sr-only" htmlFor={`dk-${p.id}`}>
              {TRANG_CHIEN_THUAT.nhanO(p.name)}
            </label>
            <select
              id={`dk-${p.id}`}
              value={dangKy[p.id] ?? 'ngoai'}
              onChange={(e) => onDoi(p.id, e.target.value as VaiTroDangKy)}
              className="rounded border border-vien-dam px-1 py-0.5 text-xs"
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
