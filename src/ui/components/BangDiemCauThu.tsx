import { useState } from 'react'
import { layViTri } from '../../domain/positions'
import type { DiemCuaCauThu } from '../../engine/baoCao'
import { DIEM_NEN } from '../../engine/diemCauThu'
import { BAO_CAO_SAU_TRAN } from '../strings'

interface Props {
  readonly diemCauThu: readonly DiemCuaCauThu[]
  readonly tenCauThu: (playerId: string) => string
}

/** Câu mô tả khoảng thời gian một người có mặt trên sân (AC-11.5). */
function khoangThoiGian(x: DiemCuaCauThu): string {
  const phan: string[] = []
  if (x.phutVao !== null) phan.push(BAO_CAO_SAU_TRAN.vaoSanPhut(x.phutVao))
  if (x.phutRa !== null) phan.push(BAO_CAO_SAU_TRAN.raSanPhut(x.phutRa))
  return phan.length === 0 ? BAO_CAO_SAU_TRAN.daTronTran : phan.join(', ')
}

function soLieuHienThi(tieuChi: string, soLieu: number): string {
  return BAO_CAO_SAU_TRAN.tieuChiTheoPhanTram.has(tieuChi)
    ? BAO_CAO_SAU_TRAN.phanTram(soLieu)
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
  const [dangMo, datDangMo] = useState<string | null>(null)

  const theoDiem = [...diemCauThu].sort((a, b) => b.diem - a.diem)

  return (
    <div className="space-y-1">
      <div className="flex gap-2 border-b border-slate-200 pb-1 text-xs font-medium text-slate-600">
        <span className="flex-1">{BAO_CAO_SAU_TRAN.cotCauThu}</span>
        <span className="w-16">{BAO_CAO_SAU_TRAN.cotViTri}</span>
        <span className="w-12 text-right">{BAO_CAO_SAU_TRAN.cotDiem}</span>
      </div>

      {theoDiem.map((x) => {
        const moRa = dangMo === x.playerId
        return (
          <div key={x.playerId} className="border-b border-slate-100 pb-1">
            <button
              type="button"
              onClick={() => datDangMo(moRa ? null : x.playerId)}
              aria-expanded={moRa}
              className="flex w-full gap-2 rounded px-1 py-1 text-left text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <span className="flex-1 text-slate-900">
                {tenCauThu(x.playerId)}
                <span className="ml-2 text-xs text-slate-500">
                  {khoangThoiGian(x)}
                </span>
              </span>
              <span className="w-16 text-slate-600">
                {layViTri(x.viTriDaDa).vietTat}
              </span>
              <span className="w-12 text-right font-mono font-semibold text-slate-900">
                {x.diem.toFixed(1)}
              </span>
            </button>

            {moRa && (
              <div className="mt-1 rounded bg-slate-50 p-2 text-xs">
                <div className="flex gap-2 text-slate-600">
                  <span className="flex-1">{BAO_CAO_SAU_TRAN.diemNen}</span>
                  <span className="w-16" />
                  <span className="w-16 text-right font-mono">
                    {DIEM_NEN.toFixed(1)}
                  </span>
                </div>

                {x.cacThanhPhan.length === 0 ? (
                  <p className="mt-1 text-slate-500">
                    {BAO_CAO_SAU_TRAN.khongCoSoLieu}
                  </p>
                ) : (
                  <>
                    <div className="mt-1 flex gap-2 font-medium text-slate-600">
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
                        className="flex gap-2 text-slate-900"
                      >
                        <span className="flex-1">
                          {BAO_CAO_SAU_TRAN.tieuChi[tp.tieuChi] ?? tp.tieuChi}
                        </span>
                        <span className="w-16 text-right font-mono">
                          {soLieuHienThi(tp.tieuChi, tp.soLieu)}
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
