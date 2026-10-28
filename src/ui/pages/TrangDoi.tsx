import { useEffect, useMemo, useState } from 'react'
import { hoSoHoanTat } from '../../domain/completeness'
import { layViTri, POSITIONS } from '../../domain/positions'
import { viTriTotNhat } from '../../domain/rating'
import type { Player, Team } from '../../domain/types'
import { usePlayers } from '../../hooks/usePlayers'
import * as teamRepo from '../../services/teamRepo'
import {
  CHAN_THUAN,
  CHUNG,
  TRANG_CHIEN_THUAT,
  TRANG_DOI,
  XOA_CAU_THU,
} from '../strings'
import { AnhThayThe } from '../components/AnhThayThe'
import { FormCauThu } from '../components/FormCauThu'
import { HopXacNhan } from '../components/HopXacNhan'

interface Props {
  readonly teamId: string
  readonly onQuayLai: () => void
  readonly onMoChienThuat: (teamId: string) => void
}

type KhoaSapXep = 'ten' | 'soAo' | 'tuoi' | 'viTri'

type HopDangMo =
  | { readonly loai: 'khong' }
  | { readonly loai: 'them' }
  | { readonly loai: 'sua'; readonly cauThu: Player }
  | { readonly loai: 'xoa'; readonly cauThu: Player }

const THU_TU_VI_TRI = new Map(POSITIONS.map((p, i) => [p.id, i]))

function sapXep(cauThu: readonly Player[], khoa: KhoaSapXep): Player[] {
  const ra = [...cauThu]
  switch (khoa) {
    case 'ten':
      return ra.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    case 'soAo':
      return ra.sort((a, b) => a.shirtNumber - b.shirtNumber)
    case 'tuoi':
      return ra.sort((a, b) => a.age - b.age)
    case 'viTri':
      return ra.sort(
        (a, b) =>
          (THU_TU_VI_TRI.get(a.positions[0] ?? 'ST') ?? 99) -
          (THU_TU_VI_TRI.get(b.positions[0] ?? 'ST') ?? 99),
      )
  }
}

/** Trang của một đội: thông tin đội và danh sách cầu thủ (AC-2.7, AC-2.8). */
export function TrangDoi({ teamId, onQuayLai, onMoChienThuat }: Props) {
  const [doi, datDoi] = useState<Team | null>(null)
  const { cauThu, napCauThu, xoaCauThu } = usePlayers(teamId)
  const [khoa, datKhoa] = useState<KhoaSapXep>('soAo')
  const [hop, datHop] = useState<HopDangMo>({ loai: 'khong' })

  useEffect(() => {
    let conHieuLuc = true
    void teamRepo.get(teamId).then(
      (t) => {
        if (conHieuLuc) datDoi(t)
      },
      () => {
        if (conHieuLuc) onQuayLai()
      },
    )
    return () => {
      conHieuLuc = false
    }
  }, [teamId, onQuayLai])

  useEffect(() => {
    void napCauThu()
  }, [napCauThu])

  const daSapXep = useMemo(() => sapXep(cauThu, khoa), [cauThu, khoa])

  if (!doi) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AnhThayThe
            anhId={doi.logoImageId}
            ten={doi.name}
            mauNen={doi.primaryColor}
            kichThuoc="lon"
          />
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {TRANG_DOI.doiNay}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{doi.name}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMoChienThuat(teamId)}
          className="rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {TRANG_CHIEN_THUAT.moChienThuat}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">
          {TRANG_DOI.danhSachCauThu}
        </h3>
        <div className="flex items-center gap-3">
          {cauThu.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              {TRANG_DOI.sapXepTheo}
              <select
                value={khoa}
                onChange={(e) => datKhoa(e.target.value as KhoaSapXep)}
                className="rounded border border-slate-300 px-2 py-1 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="soAo">{TRANG_DOI.sapXep.soAo}</option>
                <option value="ten">{TRANG_DOI.sapXep.ten}</option>
                <option value="tuoi">{TRANG_DOI.sapXep.tuoi}</option>
                <option value="viTri">{TRANG_DOI.sapXep.viTri}</option>
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => datHop({ loai: 'them' })}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {TRANG_DOI.themCauThu}
          </button>
        </div>
      </div>

      {cauThu.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h4 className="text-base font-medium text-slate-900">
            {TRANG_DOI.chuaCoCauThuTieuDe}
          </h4>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {TRANG_DOI.chuaCoCauThuMoTa}
          </p>
          <button
            type="button"
            onClick={() => datHop({ loai: 'them' })}
            className="mt-6 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {TRANG_DOI.themCauThuDauTien}
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">{TRANG_DOI.cotSoAo}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotTen}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotTuoi}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotViTri}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotChanThuan}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotChiSoTong}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {daSapXep.map((p) => {
                const tinhTrang = hoSoHoanTat({
                  positions: p.positions,
                  attributes: p.attributes,
                  gkAttributes: p.gkAttributes,
                })
                const totNhat = viTriTotNhat(
                  { attributes: p.attributes, gkAttributes: p.gkAttributes },
                  p.positions,
                )

                return (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {p.shirtNumber}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <AnhThayThe
                          anhId={p.portraitImageId}
                          ten={p.name}
                          mauNen={doi.primaryColor}
                          kichThuoc="nho"
                        />
                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                      </span>
                      {!tinhTrang.hoanTat && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                          {TRANG_DOI.chuaHoanTat}
                          {' · '}
                          {TRANG_DOI.chuaHoanTatChiTiet(tinhTrang.soChiSoThieu)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{p.age}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {p.positions.map((v) => layViTri(v).vietTat).join(', ')}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {CHAN_THUAN[p.preferredFoot]}
                    </td>
                    <td className="px-3 py-2">
                      {totNhat ? (
                        <span className="font-semibold text-slate-900">
                          {totNhat.diem}
                          <span className="ml-1 text-xs font-normal text-slate-500">
                            {layViTri(totNhat.viTri).vietTat}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {TRANG_DOI.chuaTinhDuocChiSoTong}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'sua', cauThu: p })}
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          {TRANG_DOI.suaCauThu}
                        </button>
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'xoa', cauThu: p })}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          {TRANG_DOI.xoaCauThu}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {hop.loai === 'them' && (
        <FormCauThu
          teamId={teamId}
          mauDoi={doi.primaryColor}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'sua' && (
        <FormCauThu
          teamId={teamId}
          mauDoi={doi.primaryColor}
          cauThuDangSua={hop.cauThu}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'xoa' && (
        <HopXacNhan
          tieuDe={XOA_CAU_THU.tieuDe}
          moTa={XOA_CAU_THU.moTa(hop.cauThu.name, hop.cauThu.shirtNumber)}
          nhanXacNhan={XOA_CAU_THU.xacNhan}
          nguyHiem
          onXacNhan={() => {
            const id = hop.cauThu.id
            datHop({ loai: 'khong' })
            void xoaCauThu(id)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}
    </div>
  )
}
