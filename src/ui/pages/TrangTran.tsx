import { useEffect, useState } from 'react'
import type { SuKien } from '../../engine/suKien'
import { dongSuKien, phutHienThi } from '../../engine/tran'
import { useMatch } from '../../hooks/useMatch'
import * as playerRepo from '../../services/playerRepo'
import { useAppStore } from '../../store/appStore'
import { AnhThayThe } from '../components/AnhThayThe'
import { BangDieuKhienTran } from '../components/BangDieuKhienTran'
import { DongTuongThuat } from '../components/DongTuongThuat'
import { CHON_CAP_DAU, CHUNG, TRAN_DAU } from '../strings'

interface Props {
  readonly onRoiTran: () => void
}

/**
 * Trang trận đấu: dòng tường thuật chạy theo phút, tỉ số và phút luôn nhìn
 * thấy, tạm dừng / đổi tốc độ / chạy hết trận (AC-9.1 → AC-9.4).
 *
 * Trận sống trong bộ nhớ: rời trang là mất (AC-9.10, quyết định D32).
 */
export function TrangTran({ onRoiTran }: Props) {
  const {
    tran,
    dangChay,
    tocDo,
    datTocDo,
    tamDung,
    tiepTuc,
    chayHet,
    roiTran,
  } = useMatch()

  const teams = useAppStore((s) => s.teams)

  /*
    Cảnh báo trước khi rời trang khi trận ĐANG chạy (AC-9.10). Trận đã kết
    thúc thì không hỏi nữa — hỏi lúc đó chỉ làm phiền.
  */
  const dangDienRa = tran !== null && !tran.ketThuc
  useEffect(() => {
    if (!dangDienRa) return

    const canhBao = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = TRAN_DAU.canhBaoRoiTrang
    }
    window.addEventListener('beforeunload', canhBao)
    return () => window.removeEventListener('beforeunload', canhBao)
  }, [dangDienRa])

  /*
    Tên cầu thủ là thứ của GIAO DIỆN: engine chỉ làm việc với id (P2). Trang
    này tra tên để dòng tường thuật đọc được, thay vì hiện ra id.
  */
  const [tenTheoId, datTenTheoId] = useState<ReadonlyMap<string, string>>(
    new Map(),
  )
  const idNha = tran?.ben.nha.teamId
  const idKhach = tran?.ben.khach.teamId

  useEffect(() => {
    if (!idNha || !idKhach) return
    let conHieuLuc = true

    void Promise.all([
      playerRepo.listByTeam(idNha),
      playerRepo.listByTeam(idKhach),
    ]).then(([a, b]) => {
      if (!conHieuLuc) return
      datTenTheoId(new Map([...a, ...b].map((p) => [p.id, p.name])))
    })

    return () => {
      conHieuLuc = false
    }
  }, [idNha, idKhach])

  if (!tran) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
  }

  const doiNha = teams.find((d) => d.id === tran.ben.nha.teamId)
  const doiKhach = teams.find((d) => d.id === tran.ben.khach.teamId)
  const tenDoi = (ben: SuKien['doi']) =>
    (ben === 'nha' ? doiNha?.name : doiKhach?.name) ?? ''

  const ht = phutHienThi(tran, Math.max(tran.phut, 1))
  const cacSuKien = dongSuKien(tran)

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          roiTran()
          onRoiTran()
        }}
        className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {TRAN_DAU.quayLai}
      </button>

      {/* Tỉ số và phút luôn nhìn thấy được (AC-9.1). */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          {doiNha && (
            <AnhThayThe
              anhId={doiNha.logoImageId}
              ten={doiNha.name}
              mauNen={doiNha.primaryColor}
              kichThuoc="vua"
            />
          )}
          <span className="text-lg font-semibold text-slate-900">
            {tenDoi('nha')}
          </span>
        </div>

        <div className="text-center">
          <p className="font-mono text-3xl font-bold text-slate-900">
            {tran.tiSo.nha} – {tran.tiSo.khach}
          </p>
          <p className="font-mono text-sm text-slate-600">
            {tran.phut === 0
              ? TRAN_DAU.chuaBatDau
              : tran.ketThuc
                ? TRAN_DAU.daKetThuc
                : TRAN_DAU.phut(ht.phut, ht.buGio)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">
            {tenDoi('khach')}
          </span>
          {doiKhach && (
            <AnhThayThe
              anhId={doiKhach.logoImageId}
              ten={doiKhach.name}
              mauNen={doiKhach.primaryColor}
              kichThuoc="vua"
            />
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500">
        {CHON_CAP_DAU.nhanMaTran}:{' '}
        <code className="font-mono">{tran.maTran}</code>
      </p>

      <div className="mt-4">
        <BangDieuKhienTran
          dangChay={dangChay}
          daKetThuc={tran.ketThuc}
          tocDo={tocDo}
          onTamDung={tamDung}
          onTiepTuc={tiepTuc}
          onChayHet={chayHet}
          onDoiTocDo={datTocDo}
        />
      </div>

      <div className="mt-6">
        <DongTuongThuat
          cacSuKien={cacSuKien}
          tenCauThu={(id) => tenTheoId.get(id) ?? id}
          tenDoi={tenDoi}
        />
      </div>
    </div>
  )
}
