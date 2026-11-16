import { useChuoi } from '../../hooks/useNgonNgu'
import type { BoChuoi } from '../ngonNgu'
import { useState } from 'react'
import type { DiemCuaCauThu } from '../../engine/baoCao'
import { DIEM_NEN } from '../../engine/diemCauThu'


interface Props {
  readonly diemCauThu: readonly DiemCuaCauThu[]
  readonly tenCauThu: (playerId: string) => string
}

/** Câu mô tả khoảng thời gian một người có mặt trên sân (AC-11.5). */
function khoangThoiGian(
  x: DiemCuaCauThu,
  chu: BoChuoi['BAO_CAO_SAU_TRAN'],
): string {
  const phan: string[] = []
  if (x.phutVao !== null) phan.push(chu.vaoSanPhut(x.phutVao))
  if (x.phutRa !== null) phan.push(chu.raSanPhut(x.phutRa))
  return phan.length === 0 ? chu.daTronTran : phan.join(', ')
}

function soLieuHienThi(
  tieuChi: string,
  soLieu: number,
  chu: BoChuoi['BAO_CAO_SAU_TRAN'],
): string {
  return chu.tieuChiTheoPhanTram.has(tieuChi)
    ? chu.phanTram(soLieu)
    : String(soLieu)
}

function dauCuaDiem(diemCong: number): string {
  return diemCong > 0 ? `+${diemCong.toFixed(1)}` : diemCong.toFixed(1)
}

/**
 * Điểm từng cầu thủ, mở ra xem được những số liệu đã dẫn tới điểm đó
 * (AC-11.3), kèm phút vào/ra sân (AC-11.5).
 *
 * Mở ra bằng `<button>` thường nên đi được bằng bàn phím (P9), và điểm luôn
 * có **nhãn chữ** đi kèm chứ không chỉ dựa vào màu.
 */
export function BangDiemCauThu({ diemCauThu, tenCauThu }: Props) {
  const { NHAN_VI_TRI, BAO_CAO_SAU_TRAN } = useChuoi()
  const [dangMo, datDangMo] = useState<string | null>(null)

  const theoDiem = [...diemCauThu].sort((a, b) => b.diem - a.diem)

  return (
    <div className="space-y-1">
      <div className="flex gap-2 border-b border-vien pb-1 text-xs font-medium text-chu-phu">
        <span className="flex-1">{BAO_CAO_SAU_TRAN.cotCauThu}</span>
        <span className="w-16">{BAO_CAO_SAU_TRAN.cotViTri}</span>
        <span className="w-12 text-right">{BAO_CAO_SAU_TRAN.cotDiem}</span>
      </div>

      {theoDiem.map((x) => {
        const moRa = dangMo === x.playerId
        return (
          <div key={x.playerId} className="border-b border-vien pb-1">
            <button
              type="button"
              onClick={() => datDangMo(moRa ? null : x.playerId)}
              aria-expanded={moRa}
              className="flex w-full gap-2 rounded px-1 py-1 text-left text-sm hover:bg-nen-nhan"
            >
              <span className="flex-1 text-chu">
                {tenCauThu(x.playerId)}
                <span className="ml-2 text-xs text-chu-phu">
                  {khoangThoiGian(x, BAO_CAO_SAU_TRAN)}
                </span>
              </span>
              <span className="w-16 text-chu-phu">
                {NHAN_VI_TRI[x.viTriDaDa].vietTat}
              </span>
              <span className="w-12 text-right font-mono font-semibold text-chu">
                {x.diem.toFixed(1)}
              </span>
            </button>

            {moRa && (
              <div className="mt-1 rounded bg-nen-nhan p-2 text-xs">
                <div className="flex gap-2 text-chu-phu">
                  <span className="flex-1">{BAO_CAO_SAU_TRAN.diemNen}</span>
                  <span className="w-16" />
                  <span className="w-16 text-right font-mono">
                    {DIEM_NEN.toFixed(1)}
                  </span>
                </div>

                {x.cacThanhPhan.length === 0 ? (
                  <p className="mt-1 text-chu-phu">
                    {BAO_CAO_SAU_TRAN.khongCoSoLieu}
                  </p>
                ) : (
                  <>
                    <div className="mt-1 flex gap-2 font-medium text-chu-phu">
                      <span className="flex-1">
                        {BAO_CAO_SAU_TRAN.cotChiTieu}
                      </span>
                      <span className="w-16 text-right">
                        {BAO_CAO_SAU_TRAN.cotSoLieu}
                      </span>
                      <span className="w-16 text-right">
                        {BAO_CAO_SAU_TRAN.cotGopDiem}
                      </span>
                    </div>
                    {x.cacThanhPhan.map((tp) => (
                      <div
                        key={tp.tieuChi}
                        className="flex gap-2 text-chu"
                      >
                        <span className="flex-1">
                          {BAO_CAO_SAU_TRAN.tieuChi[tp.tieuChi] ?? tp.tieuChi}
                        </span>
                        <span className="w-16 text-right font-mono">
                          {soLieuHienThi(tp.tieuChi, tp.soLieu, BAO_CAO_SAU_TRAN)}
                        </span>
                        <span className="w-16 text-right font-mono">
                          {dauCuaDiem(tp.diemCong)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
