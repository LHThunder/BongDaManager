import { useEffect, useState } from 'react'
import { PHIEN_BAN_ENGINE } from '../../engine/tran'
import * as matchRepo from '../../services/matchRepo'
import * as playerRepo from '../../services/playerRepo'
import { useAppStore } from '../../store/appStore'
import type { AnhChupDoi, TomTatTran, TranDaLuu } from '../../storage/db'
import { BangDiemCauThu } from '../components/BangDiemCauThu'
import { DanhSachGhiBan } from '../components/DanhSachGhiBan'
import { DongTuongThuat } from '../components/DongTuongThuat'
import { BAO_CAO_SAU_TRAN, CHUNG, LICH_SU } from '../strings'

interface Props {
  readonly onQuayLai: () => void
  /** Bắt đầu lại đúng cặp đấu này; màn trận do `App` mở (AC-11.6). */
  readonly onDauLai: (tran: TranDaLuu) => void
}

/*
  Lịch sử 20 trận gần nhất (AC-11.7), xem lại được báo cáo và toàn bộ dòng sự
  kiện của từng trận (AC-11.4), và còn nguyên sau khi đóng mở lại ứng dụng
  (AC-4.2).

  TÊN ĐỘI phân giải từ đội ĐANG SỐNG nếu đội còn tồn tại, nên đổi tên đội thì
  lịch sử đổi theo (AC-1.5); đội đã bị xoá thì rơi về ảnh chụp lúc trận diễn
  ra, nên trận cũ vẫn xem lại được với tên lúc đó (spec mục 5). Đó là lý do
  bản ghi giữ cả `teamId` lẫn ảnh chụp — quyết định D46.
*/

function ngayGio(mocMs: number): string {
  return new Date(mocMs).toLocaleString('vi-VN')
}

export function TrangLichSu({ onQuayLai, onDauLai }: Props) {
  const teams = useAppStore((s) => s.teams)
  const lichSu = useAppStore((s) => s.lichSu)
  const datLichSu = useAppStore((s) => s.datLichSu)

  const [dangMo, datDangMo] = useState<TranDaLuu | null>(null)
  const [tenTheoId, datTenTheoId] = useState<ReadonlyMap<string, string>>(
    new Map(),
  )

  useEffect(() => {
    let conHieuLuc = true
    void matchRepo.danhSach().then((ds) => {
      if (conHieuLuc) datLichSu(ds)
    })
    return () => {
      conHieuLuc = false
    }
  }, [datLichSu])

  /* Tên cầu thủ là thứ của giao diện: bản ghi chỉ giữ id (P2). */
  useEffect(() => {
    if (!dangMo) return
    let conHieuLuc = true

    void Promise.all([
      playerRepo.listByTeam(dangMo.nha.teamId),
      playerRepo.listByTeam(dangMo.khach.teamId),
    ]).then(([a, b]) => {
      if (conHieuLuc) {
        datTenTheoId(new Map([...a, ...b].map((p) => [p.id, p.name])))
      }
    })

    return () => {
      conHieuLuc = false
    }
  }, [dangMo])

  /** Tên hiện tại của đội, hay tên lúc đó nếu đội đã bị xoá. */
  const tenDoiCua = (anh: AnhChupDoi): { ten: string; daXoa: boolean } => {
    const dangSong = teams.find((d) => d.id === anh.teamId)
    return dangSong
      ? { ten: dangSong.name, daXoa: false }
      : { ten: anh.ten, daXoa: true }
  }

  const moTran = async (tomTat: TomTatTran) => {
    datDangMo(await matchRepo.doc(tomTat.id))
  }

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CHUNG.quayLai}
      </button>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">
        {LICH_SU.tieuDe}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {LICH_SU.moTa(matchRepo.SO_TRAN_GIU_LAI)}
      </p>

      {lichSu.length === 0 ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {LICH_SU.chuaCoTran}
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {lichSu.map((t) => {
            const nha = tenDoiCua(t.doiChuNha)
            const khach = tenDoiCua(t.doiKhach)
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-100 py-2 text-sm"
              >
                <span className="w-40 shrink-0 text-slate-500">
                  {ngayGio(t.ketThucLuc)}
                </span>
                <span className="flex-1 text-slate-900">
                  {nha.ten}
                  {nha.daXoa && (
                    <span className="ml-1 text-xs text-amber-800">
                      ({LICH_SU.doiDaXoa})
                    </span>
                  )}{' '}
                  <span className="font-mono font-semibold">
                    {t.tiSo.nha} – {t.tiSo.khach}
                  </span>{' '}
                  {khach.ten}
                  {khach.daXoa && (
                    <span className="ml-1 text-xs text-amber-800">
                      ({LICH_SU.doiDaXoa})
                    </span>
                  )}
                </span>
                <code className="font-mono text-xs text-slate-500">
                  {t.maTran}
                </code>
                <button
                  type="button"
                  onClick={() => void moTran(t)}
                  className="text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {LICH_SU.moLink}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {dangMo && (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {tenDoiCua(dangMo.doiChuNha).ten} {dangMo.tiSo.nha} –{' '}
              {dangMo.tiSo.khach} {tenDoiCua(dangMo.doiKhach).ten}
            </h3>
            <button
              type="button"
              onClick={() => datDangMo(null)}
              className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {LICH_SU.dong}
            </button>
          </div>

          {/*
            Hai lời cảnh báo, mỗi cái cho một lý do khác nhau vì sao trận này
            không đấu lại được như cũ (quyết định D35 và spec mục 5).
          */}
{(() => {
            /*
              "Xem lại" luôn làm được vì bản ghi mang dòng sự kiện đầy đủ.
              "Đấu lại" thì không phải lúc nào cũng được — và khi không được
              thì phải nói VÌ SAO, chứ không im lặng ẩn nút đi.
            */
            const lyDo = matchRepo.lyDoKhongDauLai(
              dangMo,
              PHIEN_BAN_ENGINE,
              (teamId) => teams.some((d) => d.id === teamId),
            )
            return (
              <div className="mt-2">
                {lyDo && (
                  <p className="rounded border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">
                    {LICH_SU.lyDoKhongDauLai[lyDo] ?? lyDo}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onDauLai(dangMo)}
                  disabled={lyDo !== null}
                  className="mt-2 rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {LICH_SU.dauLai}
                </button>
              </div>
            )
          })()}

          <div className="mt-4">
            <h4 className="text-base font-semibold text-slate-900">
              {BAO_CAO_SAU_TRAN.tieuDeGhiBan}
            </h4>
            <div className="mt-2">
              <DanhSachGhiBan
                nguoiGhiBan={dangMo.baoCao.nguoiGhiBan}
                tenCauThu={(id) => tenTheoId.get(id) ?? id}
                tenDoi={(ben) =>
                  tenDoiCua(
                    ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach,
                  ).ten
                }
              />
            </div>
          </div>

          {(['nha', 'khach'] as const).map((doi) => (
            <div key={doi} className="mt-4">
              <h4 className="text-base font-semibold text-slate-900">
                {BAO_CAO_SAU_TRAN.tieuDeDiem} —{' '}
                {tenDoiCua(doi === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach)
                  .ten}
              </h4>
              <div className="mt-2">
                <BangDiemCauThu
                  diemCauThu={dangMo.baoCao.diemCauThu.filter(
                    (x) => x.doi === doi,
                  )}
                  tenCauThu={(id) => tenTheoId.get(id) ?? id}
                />
              </div>
            </div>
          ))}

          <div className="mt-4">
            <h4 className="text-base font-semibold text-slate-900">
              {LICH_SU.tieuDeDienBien}
            </h4>
            <div className="mt-2">
              <DongTuongThuat
                cacSuKien={dangMo.cacSuKien}
                tenCauThu={(id) => tenTheoId.get(id) ?? id}
                tenDoi={(ben) =>
                  tenDoiCua(
                    ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach,
                  ).ten
                }
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
