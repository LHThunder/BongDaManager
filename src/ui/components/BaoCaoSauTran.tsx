import { useChuoi } from '../../hooks/useNgonNgu'
import type { BaoCaoTran, ChiTieuBen } from '../../engine/baoCao'
import type { BenDoi } from '../../engine/suKien'

import { BangDiemCauThu } from './BangDiemCauThu'
import { DanhSachGhiBan } from './DanhSachGhiBan'

interface Props {
  readonly baoCao: BaoCaoTran
  readonly tenCauThu: (playerId: string) => string
  readonly tenDoi: (ben: BenDoi) => string
  readonly onDauLaiCungMa: () => void
  readonly onDauLaiMaMoi: () => void
}

/**
 * Sáu chỉ tiêu của AC-11.2, theo đúng thứ tự spec liệt kê.
 *
 * Xuất ra để khối so sánh của màn rẽ nhánh dùng CHUNG (T434): hai danh sách
 * chỉ tiêu song song sẽ có ngày lệch nhau, và lúc ấy hai bảng nói hai chuyện
 * khác nhau về cùng một trận.
 */
/*
  Bảng này chỉ còn phần CẤU TRÚC — khoá và cờ phần trăm. Nhãn tra theo khoá
  lúc vẽ, vì `chiTieu` của hai bảng chuỗi dùng đúng tập khoá ấy (P8).
*/
export const CAC_CHI_TIEU: readonly {
  readonly khoa: keyof ChiTieuBen
  readonly phanTram?: boolean
}[] = [
  { khoa: 'cuSut' },
  { khoa: 'sutTrungDich' },
  { khoa: 'kiemSoatBong', phanTram: true },
  { khoa: 'coHoiRoRang' },
  { khoa: 'theVang' },
  { khoa: 'theDo' },
]

/**
 * Báo cáo sau trận: tỉ số, người ghi bàn, sáu chỉ tiêu mỗi bên, điểm từng
 * cầu thủ, và hai nút đấu lại (AC-11.1 → AC-11.3, AC-11.5, AC-11.6).
 *
 * Mọi con số đến từ `dungBaoCao` của engine — component này không tính gì
 * (P2), nó chỉ xếp chữ.
 */
export function BaoCaoSauTran({
  baoCao,
  tenCauThu,
  tenDoi,
  onDauLaiCungMa,
  onDauLaiMaMoi,
}: Props) {
  const { BAO_CAO_SAU_TRAN } = useChuoi()
  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <h3 className="text-lg font-semibold text-chu">
        {BAO_CAO_SAU_TRAN.tieuDe}
      </h3>

      <p className="mt-1 text-center font-mono text-2xl font-bold text-chu">
        {tenDoi('nha')} {baoCao.tiSo.nha} – {baoCao.tiSo.khach}{' '}
        {tenDoi('khach')}
      </p>

      <div className="mt-4">
        <h4 className="text-base font-semibold text-chu">
          {BAO_CAO_SAU_TRAN.tieuDeGhiBan}
        </h4>
        <div className="mt-2">
          <DanhSachGhiBan
            nguoiGhiBan={baoCao.nguoiGhiBan}
            tenCauThu={tenCauThu}
            tenDoi={tenDoi}
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-base font-semibold text-chu">
          {BAO_CAO_SAU_TRAN.tieuDeChiTieu}
        </h4>
        <table className="mt-2 w-full max-w-lg text-sm">
          <thead>
            <tr className="text-chu-phu">
              <th className="text-left font-medium">{tenDoi('nha')}</th>
              <th className="font-medium">{BAO_CAO_SAU_TRAN.cotChiTieu}</th>
              <th className="text-right font-medium">{tenDoi('khach')}</th>
            </tr>
          </thead>
          <tbody className="text-chu">
            {CAC_CHI_TIEU.map((ct) => {
              const hien = (x: number) =>
                ct.phanTram ? BAO_CAO_SAU_TRAN.phanTram(x) : String(x)
              return (
                <tr key={ct.khoa}>
                  <td className="py-0.5 text-left font-mono font-semibold">
                    {hien(baoCao.theoBen.nha[ct.khoa])}
                  </td>
                  <td className="py-0.5 text-center text-chu-phu">
                    {BAO_CAO_SAU_TRAN.chiTieu[ct.khoa]}
                  </td>
                  <td className="py-0.5 text-right font-mono font-semibold">
                    {hien(baoCao.theoBen.khach[ct.khoa])}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {(['nha', 'khach'] as const).map((doi) => (
        <div key={doi} className="mt-4">
          <h4 className="text-base font-semibold text-chu">
            {BAO_CAO_SAU_TRAN.tieuDeDiem} — {tenDoi(doi)}
          </h4>
          {doi === 'nha' && (
            <p className="mt-0.5 text-sm text-chu-phu">
              {BAO_CAO_SAU_TRAN.moTaDiem}
            </p>
          )}
          <div className="mt-2">
            <BangDiemCauThu
              diemCauThu={baoCao.diemCauThu.filter((x) => x.doi === doi)}
              tenCauThu={tenCauThu}
            />
          </div>
        </div>
      ))}

      <div className="mt-4 border-t border-vien pt-4">
        <h4 className="text-base font-semibold text-chu">
          {BAO_CAO_SAU_TRAN.tieuDeDauLai}
        </h4>
        <p className="mt-0.5 text-sm text-chu-phu">
          {BAO_CAO_SAU_TRAN.moTaDauLai}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDauLaiCungMa}
            className="rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {BAO_CAO_SAU_TRAN.dauLaiCungMa}
          </button>
          <button
            type="button"
            onClick={onDauLaiMaMoi}
            className="rounded-md border border-vien-dam px-3 py-1.5 text-sm font-medium text-chu hover:bg-nen-nhan"
          >
            {BAO_CAO_SAU_TRAN.dauLaiMaMoi}
          </button>
        </div>
      </div>
    </section>
  )
}
