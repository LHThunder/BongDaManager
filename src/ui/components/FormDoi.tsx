import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useRef, useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import { laLoiUngDung, type LoiUngDung } from '../../services/errors'
import { MAU_AO_MAC_DINH, type TeamSummary } from '../../services/teamRepo'

import { ChonAnh } from './ChonAnh'
import { ChonMauAo } from './ChonMauAo'

/*
  Lỗi giữ nguyên DẠNG LỖI trong state, câu chữ chỉ dựng lúc vẽ.

  Dựng câu ngay lúc bắt lỗi thì câu ấy đóng băng ở thứ tiếng lúc đó: đổi
  ngôn ngữ xong, cả màn hình đổi mà riêng dòng báo lỗi đứng im (AC-17.5).
  Lỗi KHÔNG phải `LoiUngDung` thì không có gì để dịch, nên nó vẫn là chuỗi.
*/
type LoiHienThi = LoiUngDung | string | null

interface Props {
  /** Có giá trị khi đang sửa một đội có sẵn; bỏ trống khi tạo đội mới. */
  readonly doiDangSua?: TeamSummary
  readonly onXong: (teamId: string) => void
  readonly onHuy: () => void
}

/**
 * Tạo đội mới hoặc sửa đội: tên, logo và màu áo
 * (AC-1.2, AC-1.3, AC-1.5, AC-1.7, AC-3.5, AC-3.6, AC-3.7).
 */
export function FormDoi({ doiDangSua, onXong, onHuy }: Props) {
  const { CHUNG, FORM_DOI, LOI } = useChuoi()
  const { teams, taoDoi, capNhatDoi, kiemTraTrungTen } = useTeams()
  const dangSua = doiDangSua !== undefined

  const [ten, datTen] = useState(doiDangSua?.name ?? '')
  const [logoId, datLogoId] = useState<string | null>(
    doiDangSua?.logoImageId ?? null,
  )
  const [mauChinh, datMauChinh] = useState(
    doiDangSua?.primaryColor ?? MAU_AO_MAC_DINH.chinh,
  )
  const [mauPhu, datMauPhu] = useState(
    doiDangSua?.secondaryColor ?? MAU_AO_MAC_DINH.phu,
  )

  const [loi, datLoi] = useState<LoiHienThi>(null)
  const [canhBaoTrungTen, datCanhBaoTrungTen] = useState<string | null>(null)
  const [dangGui, datDangGui] = useState(false)
  const oTen = useRef<HTMLInputElement>(null)

  useEffect(() => {
    oTen.current?.focus()
  }, [])

  const doiKhac = teams.filter((d) => d.id !== doiDangSua?.id)

  async function luu(boQuaCanhBaoTrungTen: boolean) {
    datLoi(null)
    datDangGui(true)
    try {
      if (dangSua) {
        const doi = await capNhatDoi(doiDangSua.id, {
          name: ten,
          logoImageId: logoId,
          primaryColor: mauChinh,
          secondaryColor: mauPhu,
        })
        onXong(doi.id)
        return
      }

      if (!boQuaCanhBaoTrungTen) {
        const trung = await kiemTraTrungTen(ten)
        if (trung.length > 0) {
          datCanhBaoTrungTen(ten.trim())
          datDangGui(false)
          return
        }
      }

      const doi = await taoDoi({
        name: ten,
        logoImageId: logoId,
        primaryColor: mauChinh,
        secondaryColor: mauPhu,
      })
      onXong(doi.id)
    } catch (e) {
      datLoi(laLoiUngDung(e) ? e : String(e))
      datDangGui(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-lop-phu p-4">
      <form
        className="my-8 w-full max-w-lg rounded-lg bg-nen-the p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault()
          void luu(false)
        }}
      >
        <h2 className="text-lg font-semibold text-chu">
          {dangSua ? FORM_DOI.tieuDeSua : FORM_DOI.tieuDeTao}
        </h2>

        <label className="mt-4 block text-sm font-medium text-chu">
          {FORM_DOI.nhanTen}
          <input
            ref={oTen}
            type="text"
            value={ten}
            onChange={(e) => {
              datTen(e.target.value)
              datLoi(null)
              datCanhBaoTrungTen(null)
            }}
            placeholder={FORM_DOI.gidanhTen}
            aria-invalid={loi !== null}
            className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-2 text-chu"
          />
        </label>

        <div className="mt-4">
          <ChonAnh
            loai="logo"
            anhId={logoId}
            ten={ten || '?'}
            mauNen={mauChinh}
            onDaChon={datLogoId}
          />
        </div>

        <ChonMauAo
          tenDoi={ten}
          mauChinh={mauChinh}
          mauPhu={mauPhu}
          doiKhac={doiKhac}
          onDoi={(chinh, phu) => {
            datMauChinh(chinh)
            datMauPhu(phu)
          }}
        />

        {loi !== null && (
          <p role="alert" className="mt-3 text-sm text-loi-chu">
            {typeof loi === 'string' ? loi : LOI.cau(loi)}
          </p>
        )}

        {canhBaoTrungTen !== null && (
          <div className="mt-3 rounded-md bg-canh-bao-nen p-3">
            <p className="text-sm text-canh-bao-chu">
              {FORM_DOI.canhBaoTrungTen(canhBaoTrungTen)}
            </p>
            <button
              type="button"
              onClick={() => void luu(true)}
              className="mt-2 rounded-md bg-canh-bao-manh px-3 py-1.5 text-sm font-medium text-chu-tren-canh-bao hover:bg-canh-bao-manh-dam"
            >
              {FORM_DOI.xacNhanTrungTen}
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onHuy}
            className="rounded-md border border-vien-dam px-4 py-2 text-sm font-medium text-chu hover:bg-nen-nhan"
          >
            {CHUNG.huy}
          </button>
          <button
            type="submit"
            disabled={dangGui}
            className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:opacity-50"
          >
            {dangSua ? FORM_DOI.nutDoiTen : FORM_DOI.nutTao}
          </button>
        </div>
      </form>
    </div>
  )
}
