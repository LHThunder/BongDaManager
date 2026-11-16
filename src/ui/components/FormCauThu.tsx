import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GK_CHI_SO_CHUNG } from '../../domain/attributes'
import { hoSoHoanTat } from '../../domain/completeness'
import { CAC_MUC_DO, sinhChiSo, type MucDo } from '../../domain/generator'
import {
  cacViTriConChonDuoc,
  laThuMon,
  POSITIONS,
} from '../../domain/positions'
import { chiSoTongTheoViTri } from '../../domain/rating'
import type {
  AttributeId,
  AttributeValues,
  GkAttributeValues,
  Player,
  PositionId,
  PreferredFoot,
  Rng,
} from '../../domain/types'
import { usePlayers } from '../../hooks/usePlayers'
import { laLoiUngDung } from '../../services/errors'

import { BangChiSo } from './BangChiSo'
import { ChonAnh } from './ChonAnh'

interface Props {
  readonly teamId: string
  /** Màu áo chính của đội, dùng làm nền cho hình thay thế khi chưa có ảnh. */
  readonly mauDoi: string
  /** Có giá trị khi sửa hồ sơ một cầu thủ đã có. */
  readonly cauThuDangSua?: Player
  readonly onXong: () => void
  readonly onHuy: () => void
}

/** Nguồn ngẫu nhiên thật, tạo ở lớp giao diện — domain không được tự gọi (P1). */
const RNG_THAT: Rng = { next: () => Math.random() }

const CAC_CHAN_THUAN: readonly PreferredFoot[] = ['phai', 'trai', 'ca-hai']

export function FormCauThu({
  teamId,
  mauDoi,
  cauThuDangSua,
  onXong,
  onHuy,
}: Props) {
  const {
    NHAN_VI_TRI,
    NHAN_CHI_SO,
    NHAN_MUC_DO,
    CHAN_THUAN,
    CHUNG,
    FORM_CAU_THU,
    LOI,
    TRANG_DOI,
  } = useChuoi()
  const { luuCauThu } = usePlayers(teamId)
  const dangSua = cauThuDangSua !== undefined

  const [ten, datTen] = useState(cauThuDangSua?.name ?? '')
  const [soAo, datSoAo] = useState(String(cauThuDangSua?.shirtNumber ?? ''))
  const [tuoi, datTuoi] = useState(String(cauThuDangSua?.age ?? ''))
  const [chanThuan, datChanThuan] = useState<PreferredFoot>(
    cauThuDangSua?.preferredFoot ?? 'phai',
  )
  const [viTri, datViTri] = useState<readonly PositionId[]>(
    cauThuDangSua?.positions ?? [],
  )
  const [chiSo, datChiSo] = useState<AttributeValues>(
    cauThuDangSua?.attributes ?? {},
  )
  const [chiSoThuMon, datChiSoThuMon] = useState<GkAttributeValues | null>(
    cauThuDangSua?.gkAttributes ?? null,
  )
  const [anhId, datAnhId] = useState<string | null>(
    cauThuDangSua?.portraitImageId ?? null,
  )

  const [loi, datLoi] = useState<string | null>(null)
  const [canhBaoDoiSangThuMon, datCanhBaoDoiSangThuMon] = useState(false)
  const [nhacChonViTri, datNhacChonViTri] = useState(false)
  const [viTriXem, datViTriXem] = useState<PositionId | null>(
    cauThuDangSua?.positions[0] ?? null,
  )
  const [dangGui, datDangGui] = useState(false)
  const oTen = useRef<HTMLInputElement>(null)

  useEffect(() => {
    oTen.current?.focus()
  }, [])

  const conChonDuoc = useMemo(
    () => new Set<PositionId>(cacViTriConChonDuoc(viTri)),
    [viTri],
  )

  const tinhTrangHoSo = useMemo(() => {
    if (viTri.length === 0) return null
    return hoSoHoanTat({
      positions: viTri,
      attributes: chiSo,
      gkAttributes: chiSoThuMon,
    })
  }, [viTri, chiSo, chiSoThuMon])

  const diemTaiViTri = useMemo(() => {
    if (!viTriXem || !viTri.includes(viTriXem)) return null
    return chiSoTongTheoViTri(
      { attributes: chiSo, gkAttributes: chiSoThuMon },
      viTriXem,
    )
  }, [viTriXem, viTri, chiSo, chiSoThuMon])

  /** Những chỉ số đã điền sẽ không còn dùng tới nếu cầu thủ thành thủ môn. */
  function coChiSoSeMat(): boolean {
    const chophep = new Set<string>(GK_CHI_SO_CHUNG)
    return (Object.keys(chiSo) as AttributeId[]).some(
      (id) => !chophep.has(id) && chiSo[id] !== undefined,
    )
  }

  function apDungViTri(moi: readonly PositionId[]) {
    datViTri(moi)
    datNhacChonViTri(false)
    datLoi(null)
    if (!moi.includes(viTriXem as PositionId)) {
      datViTriXem(moi[0] ?? null)
    }
    if (!laThuMon(moi)) {
      datChiSoThuMon(null)
    }
  }

  function doiViTri(id: PositionId) {
    if (viTri.includes(id)) {
      apDungViTri(viTri.filter((v) => v !== id))
      return
    }

    // Chọn Thủ môn khi đã có chỉ số của cầu thủ sân: hỏi xác nhận trước,
    // vì bộ chỉ số sẽ đổi (trường hợp biên ở spec mục 5).
    if (id === 'GK' && coChiSoSeMat()) {
      datCanhBaoDoiSangThuMon(true)
      return
    }

    apDungViTri([...viTri, id])
  }

  function xacNhanDoiSangThuMon() {
    datCanhBaoDoiSangThuMon(false)
    const giuLai: Record<string, number> = {}
    for (const id of GK_CHI_SO_CHUNG) {
      const v = chiSo[id]
      if (v !== undefined) giuLai[id] = v
    }
    datChiSo(giuLai as AttributeValues)
    apDungViTri(['GK'])
  }

  function sinhNhanh(muc: MucDo) {
    if (viTri.length === 0) {
      datNhacChonViTri(true)
      return
    }
    const ra = sinhChiSo(muc, viTri, RNG_THAT)
    datChiSo(ra.attributes)
    datChiSoThuMon(ra.gkAttributes)
    datLoi(null)
  }

  async function gui() {
    datLoi(null)
    datDangGui(true)
    try {
      await luuCauThu({
        id: cauThuDangSua?.id,
        teamId,
        name: ten,
        shirtNumber: Number(soAo),
        age: Number(tuoi),
        preferredFoot: chanThuan,
        positions: viTri,
        attributes: chiSo,
        gkAttributes: chiSoThuMon,
        portraitImageId: anhId,
      })
      onXong()
    } catch (e) {
      /*
        Truyền bảng tra nhãn vào `cauLoi`: payload lỗi nay mang MÃ chỉ số
        (D76), nên chỉ chỗ này mới dựng được câu có tên chỉ số. Đây cũng
        là nơi duy nhất sinh ra `InvalidAttributeValue`.
      */
      datLoi(
        laLoiUngDung(e) ? LOI.cau(e, (id) => NHAN_CHI_SO[id]) : String(e),
      )
      datDangGui(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4">
      <form
        className="my-8 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault()
          void gui()
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {dangSua ? FORM_CAU_THU.tieuDeSua : FORM_CAU_THU.tieuDeThem}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            {FORM_CAU_THU.nhanTen}
            <input
              ref={oTen}
              type="text"
              value={ten}
              onChange={(e) => {
                datTen(e.target.value)
                datLoi(null)
              }}
              placeholder={FORM_CAU_THU.gidanhTen}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {FORM_CAU_THU.nhanSoAo}
            <input
              type="number"
              inputMode="numeric"
              value={soAo}
              onChange={(e) => {
                datSoAo(e.target.value)
                datLoi(null)
              }}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            {FORM_CAU_THU.nhanTuoi}
            <input
              type="number"
              inputMode="numeric"
              value={tuoi}
              onChange={(e) => datTuoi(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>
        </div>

        <div className="mt-4">
          <ChonAnh
            loai="chan-dung"
            anhId={anhId}
            ten={ten || '?'}
            mauNen={mauDoi}
            onDaChon={datAnhId}
          />
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700">
            {FORM_CAU_THU.nhanChanThuan}
          </legend>
          <div className="mt-1 flex gap-4">
            {CAC_CHAN_THUAN.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="chan-thuan"
                  checked={chanThuan === c}
                  onChange={() => datChanThuan(c)}
                />
                {CHAN_THUAN[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700">
            {FORM_CAU_THU.nhanViTri}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {POSITIONS.map((p) => {
              const daChon = viTri.includes(p.id)
              const voHieu = !daChon && !conChonDuoc.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={daChon}
                  disabled={voHieu}
                  onClick={() => doiViTri(p.id)}
                  className={
                    daChon
                      ? 'rounded-full bg-blue-700 px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
                      : voHieu
                        ? 'cursor-not-allowed rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-400'
                        : 'rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400'
                  }
                >
                  {NHAN_VI_TRI[p.id].ten}
                </button>
              )
            })}
          </div>

          {viTri.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {laThuMon(viTri)
                ? FORM_CAU_THU.giaiThichThuMon
                : FORM_CAU_THU.giaiThichViTriSan}
            </p>
          )}
          {nhacChonViTri && (
            <p role="alert" className="mt-2 text-sm text-amber-800">
              {FORM_CAU_THU.canChonViTriTruoc}
            </p>
          )}
        </fieldset>

        {canhBaoDoiSangThuMon && (
          <div className="mt-4 rounded-md bg-amber-50 p-3">
            <p className="text-sm text-amber-900">
              {FORM_CAU_THU.canhBaoDoiSangThuMon}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={xacNhanDoiSangThuMon}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {FORM_CAU_THU.xacNhanDoiSangThuMon}
              </button>
              <button
                type="button"
                onClick={() => datCanhBaoDoiSangThuMon(false)}
                className="rounded-md border border-amber-300 px-3 py-1.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {CHUNG.huy}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-700">
            {FORM_CAU_THU.sinhNhanh}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {FORM_CAU_THU.sinhNhanhMoTa}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CAC_MUC_DO.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => sinhNhanh(m.id)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {NHAN_MUC_DO[m.id]}
              </button>
            ))}
          </div>
        </div>

        {viTri.length > 0 && (
          <BangChiSo
            positions={viTri}
            attributes={chiSo}
            gkAttributes={chiSoThuMon}
            onDoiChiSo={datChiSo}
            onDoiChiSoThuMon={datChiSoThuMon}
          />
        )}

        {tinhTrangHoSo !== null && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {tinhTrangHoSo.hoanTat ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                {TRANG_DOI.cotChiSoTong}
                {': '}
                {diemTaiViTri?.tinhDuoc ? diemTaiViTri.diem : '—'}
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                {TRANG_DOI.chuaHoanTat}
                {' · '}
                {TRANG_DOI.chuaHoanTatChiTiet(tinhTrangHoSo.soChiSoThieu)}
              </span>
            )}

            {viTri.length > 0 && (
              <label className="flex items-center gap-2 text-slate-700">
                {FORM_CAU_THU.chiSoTongTaiViTri(
                  viTriXem ? NHAN_VI_TRI[viTriXem].ten : '',
                )}
                <select
                  value={viTriXem ?? ''}
                  onChange={(e) => datViTriXem(e.target.value as PositionId)}
                  className="rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {viTri.map((v) => (
                    <option key={v} value={v}>
                      {NHAN_VI_TRI[v].ten}
                    </option>
                  ))}
                </select>
                <strong className="text-slate-900">
                  {diemTaiViTri?.tinhDuoc
                    ? diemTaiViTri.diem
                    : TRANG_DOI.chuaTinhDuocChiSoTong}
                </strong>
              </label>
            )}
          </div>
        )}

        {loi !== null && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {loi}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onHuy}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {CHUNG.huy}
          </button>
          <button
            type="submit"
            disabled={dangGui}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            {dangSua ? FORM_CAU_THU.nutLuuSua : FORM_CAU_THU.nutThem}
          </button>
        </div>
      </form>
    </div>
  )
}
