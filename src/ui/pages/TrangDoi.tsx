import { BieuTuong } from '../components/BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useMemo, useState } from 'react'
import { hoSoHoanTat } from '../../domain/completeness'
import { POSITIONS } from '../../domain/positions'
import { viTriTotNhat } from '../../domain/rating'
import type { Player, Team } from '../../domain/types'
import { usePlayers } from '../../hooks/usePlayers'
import * as teamRepo from '../../services/teamRepo'

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
  const { NHAN_VI_TRI, CHAN_THUAN, CHUNG, TRANG_DOI, XOA_CAU_THU, TRANG_CHIEN_THUAT } = useChuoi()
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
    return <p className="text-chu-phu">{CHUNG.dangTai}</p>
  }

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-chinh underline hover:text-chinh-dam"
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
            <p className="flex items-center gap-1.5 text-sm uppercase tracking-wide text-chu-phu">
              <BieuTuong ten="doi" co="nho" />
              {TRANG_DOI.doiNay}
            </p>
            <h2 className="text-2xl font-bold text-chu">{doi.name}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMoChienThuat(teamId)}
          className="flex items-center gap-2 rounded-md border border-chinh px-4 py-2 text-sm font-medium text-chinh hover:bg-chinh-nhat"
        >
          <BieuTuong ten="chienThuat" co="nho" />
          {TRANG_CHIEN_THUAT.moChienThuat}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-chu">
          <BieuTuong ten="cauThu" />
          {TRANG_DOI.danhSachCauThu}
        </h3>
        <div className="flex items-center gap-3">
          {cauThu.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-chu-phu">
              {TRANG_DOI.sapXepTheo}
              <select
                value={khoa}
                onChange={(e) => datKhoa(e.target.value as KhoaSapXep)}
                className="rounded border border-vien-dam px-2 py-1"
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
            className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {TRANG_DOI.themCauThu}
          </button>
        </div>
      </div>

      {cauThu.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-vien-dam bg-nen-the p-10 text-center">
          <h4 className="text-base font-medium text-chu">
            {TRANG_DOI.chuaCoCauThuTieuDe}
          </h4>
          <p className="mx-auto mt-2 max-w-lg text-sm text-chu-phu">
            {TRANG_DOI.chuaCoCauThuMoTa}
          </p>
          <button
            type="button"
            onClick={() => datHop({ loai: 'them' })}
            className="mt-6 rounded-md bg-chinh px-5 py-2.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {TRANG_DOI.themCauThuDauTien}
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-vien bg-nen-the">
          <table className="w-full text-sm">
            <thead className="bg-nen-nhan text-left text-xs uppercase tracking-wide text-chu-phu">
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
                  <tr key={p.id} className="border-t border-vien">
                    <td className="px-3 py-2 font-medium text-chu">
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
                        <span className="font-medium text-chu">
                          {p.name}
                        </span>
                      </span>
                      {!tinhTrang.hoanTat && (
                        <span className="ml-2 rounded-full bg-canh-bao-nen px-2 py-0.5 text-xs text-canh-bao-chu">
                          {TRANG_DOI.chuaHoanTat}
                          {' · '}
                          {TRANG_DOI.chuaHoanTatChiTiet(tinhTrang.soChiSoThieu)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-chu-phu">{p.age}</td>
                    <td className="px-3 py-2 text-chu-phu">
                      {p.positions.map((v) => NHAN_VI_TRI[v].vietTat).join(', ')}
                    </td>
                    <td className="px-3 py-2 text-chu-phu">
                      {CHAN_THUAN[p.preferredFoot]}
                    </td>
                    <td className="px-3 py-2">
                      {totNhat ? (
                        <span className="font-semibold text-chu">
                          {totNhat.diem}
                          <span className="ml-1 text-xs font-normal text-chu-phu">
                            {NHAN_VI_TRI[totNhat.viTri].vietTat}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-chu-phu">
                          {TRANG_DOI.chuaTinhDuocChiSoTong}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'sua', cauThu: p })}
                          className="rounded-md border border-vien-dam px-2.5 py-1 text-chu hover:bg-nen-nhan"
                        >
                          {TRANG_DOI.suaCauThu}
                        </button>
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'xoa', cauThu: p })}
                          className="rounded-md border border-loi-chu px-2.5 py-1 text-loi-chu hover:bg-loi-nen"
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
