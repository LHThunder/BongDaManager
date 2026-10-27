import { useEffect, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { LoiUngDung, laLoiUngDung } from '../../services/errors'
import {
  chuanBiAnhChanDung,
  chuanBiLogo,
  giaiPhongUrl,
  laTepAnh,
  luuAnh,
  taoUrlAnh,
  type KhungCat,
} from '../../services/imageService'
import { CHON_ANH, CHUNG, cauLoi } from '../strings'
import { AnhThayThe } from './AnhThayThe'

interface Props {
  readonly loai: 'chan-dung' | 'logo'
  readonly anhId: string | null
  readonly ten: string
  readonly mauNen: string
  readonly onDaChon: (anhId: string | null) => void
}

/**
 * Chọn, cắt và lưu ảnh (AC-3.1, AC-3.2, AC-3.3).
 *
 * Ảnh chân dung đi qua khung cắt vuông do người dùng kéo; logo thì cắt giữa
 * tự động. Tệp không phải ảnh hoặc ảnh hỏng thì báo bằng tiếng Việt và ảnh cũ
 * được giữ nguyên.
 */
export function ChonAnh({ loai, anhId, ten, mauNen, onDaChon }: Props) {
  const [tepDangCat, datTepDangCat] = useState<File | null>(null)
  const [urlXemTruoc, datUrlXemTruoc] = useState<string | null>(null)
  const [viTriCat, datViTriCat] = useState({ x: 0, y: 0 })
  const [phongTo, datPhongTo] = useState(1)
  const [vungCat, datVungCat] = useState<Area | null>(null)
  const [loi, datLoi] = useState<string | null>(null)
  const [dangXuLy, datDangXuLy] = useState(false)
  const oTep = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (urlXemTruoc) giaiPhongUrl(urlXemTruoc)
    }
  }, [urlXemTruoc])

  function dong() {
    if (urlXemTruoc) giaiPhongUrl(urlXemTruoc)
    datUrlXemTruoc(null)
    datTepDangCat(null)
    datVungCat(null)
    datViTriCat({ x: 0, y: 0 })
    datPhongTo(1)
    datDangXuLy(false)
  }

  async function nhanTep(tep: File | undefined) {
    datLoi(null)
    if (!tep) return

    if (!laTepAnh(tep)) {
      // Giữ nguyên ảnh cũ, chỉ báo lỗi (AC-3.3).
      datLoi(cauLoi(new LoiUngDung('NotAnImage', { giaTri: tep.type || '' })))
      return
    }

    if (loai === 'logo') {
      // Logo không cần khung cắt do người dùng chọn: cắt giữa tự động.
      datDangXuLy(true)
      try {
        const daXuLy = await chuanBiLogo(tep)
        onDaChon(await luuAnh(daXuLy))
      } catch (e) {
        datLoi(laLoiUngDung(e) ? cauLoi(e) : String(e))
      } finally {
        datDangXuLy(false)
      }
      return
    }

    datTepDangCat(tep)
    datUrlXemTruoc(taoUrlAnh(tep))
  }

  async function xacNhanCat() {
    if (!tepDangCat) return
    datDangXuLy(true)
    datLoi(null)
    try {
      const khung: KhungCat | null = vungCat
        ? {
            x: Math.round(vungCat.x),
            y: Math.round(vungCat.y),
            canh: Math.round(Math.min(vungCat.width, vungCat.height)),
          }
        : null

      const daXuLy = await chuanBiAnhChanDung(tepDangCat, khung)
      onDaChon(await luuAnh(daXuLy))
      dong()
    } catch (e) {
      datLoi(laLoiUngDung(e) ? cauLoi(e) : String(e))
      datDangXuLy(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-700">
        {loai === 'logo' ? CHON_ANH.nhanLogoDoi : CHON_ANH.nhanAnhCauThu}
      </p>

      <div className="mt-2 flex items-center gap-3">
        <AnhThayThe anhId={anhId} ten={ten} mauNen={mauNen} kichThuoc="vua" />

        <input
          ref={oTep}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void nhanTep(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <button
          type="button"
          disabled={dangXuLy}
          onClick={() => oTep.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
        >
          {anhId ? CHON_ANH.doiAnh : CHON_ANH.chonAnh}
        </button>

        {anhId && (
          <button
            type="button"
            disabled={dangXuLy}
            onClick={() => onDaChon(null)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          >
            {CHON_ANH.xoaAnh}
          </button>
        )}

        {dangXuLy && (
          <span className="text-sm text-slate-500">{CHON_ANH.dangXuLy}</span>
        )}
      </div>

      {loi !== null && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {loi}
        </p>
      )}

      {tepDangCat && urlXemTruoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              {CHON_ANH.tieuDeCat}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {CHON_ANH.huongDanCat}
            </p>

            <div className="relative mt-3 h-72 w-full overflow-hidden rounded-md bg-slate-900">
              <Cropper
                image={urlXemTruoc}
                crop={viTriCat}
                zoom={phongTo}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={datViTriCat}
                onZoomChange={datPhongTo}
                onCropComplete={(_vung, vungTheoDiemAnh) =>
                  datVungCat(vungTheoDiemAnh)
                }
              />
            </div>

            <label className="mt-3 block text-sm text-slate-700">
              {CHON_ANH.phongTo}
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={phongTo}
                onChange={(e) => datPhongTo(Number(e.target.value))}
                className="mt-1 block w-full"
              />
            </label>

            {loi !== null && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {loi}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={dong}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {CHUNG.huy}
              </button>
              <button
                type="button"
                disabled={dangXuLy}
                onClick={() => void xacNhanCat()}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                {CHON_ANH.xacNhanCat}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
