import { useEffect, useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import type { TeamSummary } from '../../services/teamRepo'
import { CHUNG, DANH_SACH_DOI, XOA_DOI } from '../strings'
import { AnhThayThe } from '../components/AnhThayThe'
import { FormDoi } from '../components/FormDoi'
import { HopXacNhan } from '../components/HopXacNhan'
import { SaoLuu } from '../components/SaoLuu'

interface Props {
  readonly onMoDoi: (teamId: string) => void
}

type HopDangMo =
  | { readonly loai: 'khong' }
  | { readonly loai: 'tao' }
  | { readonly loai: 'sua'; readonly doi: TeamSummary }
  | { readonly loai: 'xoa'; readonly doi: TeamSummary }

/**
 * Trạng thái trống và danh sách đội (AC-1.1, AC-1.4), kèm lối vào tạo, sửa
 * tên và xoá đội.
 */
export function DanhSachDoi({ onMoDoi }: Props) {
  const { teams, dangTai, napDanhSachDoi, xoaDoi } = useTeams()
  const [hop, datHop] = useState<HopDangMo>({ loai: 'khong' })

  useEffect(() => {
    void napDanhSachDoi()
  }, [napDanhSachDoi])

  if (dangTai && teams.length === 0) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {DANH_SACH_DOI.tieuDe}
        </h2>
        {teams.length > 0 && (
          <button
            type="button"
            onClick={() => datHop({ loai: 'tao' })}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {DANH_SACH_DOI.taoDoi}
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="text-lg font-medium text-slate-900">
            {DANH_SACH_DOI.trongTieuDe}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {DANH_SACH_DOI.trongMoTa}
          </p>
          <button
            type="button"
            onClick={() => datHop({ loai: 'tao' })}
            className="mt-6 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {DANH_SACH_DOI.taoDoiDauTien}
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {teams.map((doi) => (
            <li
              key={doi.id}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <AnhThayThe
                anhId={doi.logoImageId}
                ten={doi.name}
                mauNen={doi.primaryColor}
                kichThuoc="vua"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{doi.name}</p>
                <p className="text-sm text-slate-500">
                  {doi.soCauThu === 0
                    ? DANH_SACH_DOI.chuaCoCauThu
                    : DANH_SACH_DOI.soCauThu(doi.soCauThu)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onMoDoi(doi.id)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {DANH_SACH_DOI.moDoi}
                </button>
                <button
                  type="button"
                  onClick={() => datHop({ loai: 'sua', doi })}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {CHUNG.suaTen}
                </button>
                <button
                  type="button"
                  onClick={() => datHop({ loai: 'xoa', doi })}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {CHUNG.xoa}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SaoLuu onDaNhap={() => void napDanhSachDoi()} />

      {hop.loai === 'tao' && (
        <FormDoi
          onXong={(teamId) => {
            datHop({ loai: 'khong' })
            onMoDoi(teamId)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'sua' && (
        <FormDoi
          doiDangSua={hop.doi}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'xoa' && (
        <HopXacNhan
          tieuDe={XOA_DOI.tieuDe}
          moTa={XOA_DOI.moTa(hop.doi.name, hop.doi.soCauThu)}
          nhanXacNhan={XOA_DOI.xacNhan}
          nguyHiem
          onXacNhan={() => {
            const id = hop.doi.id
            datHop({ loai: 'khong' })
            void xoaDoi(id)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}
    </div>
  )
}
