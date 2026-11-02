import { useState } from 'react'
import type { BenTran } from '../../engine/tran'
import { THAY_NGUOI } from '../strings'

interface Props {
  readonly ben: BenTran
  readonly tenCauThu: (playerId: string) => string
  readonly tamDung: boolean
  readonly onThay: (ra: string, vao: string) => void
  readonly loi: string | null
}

/**
 * Thay người giữa trận (AC-9.5, AC-9.6).
 *
 * Chỉ làm được khi trận đang tạm dừng — đổi người giữa lúc dòng tường thuật
 * đang chạy thì người dùng không kịp đọc chuyện gì vừa xảy ra.
 */
export function ThayNguoi({ ben, tenCauThu, tamDung, onThay, loi }: Props) {
  const [ra, datRa] = useState('')
  const [vao, datVao] = useState('')

  /*
    Lượt thay còn lại CHÍNH LÀ số người còn trên ghế (D57): mỗi lần thay lấy
    một người khỏi ghế. Tổng lượt của cả trận là số dự bị lúc đăng ký, suy
    lại bằng cách cộng số đã thay.
  */
  const conLuot = ben.duBi.length
  const tongLuot = ben.soLanThay + ben.duBi.length
  const hetLuot = conLuot <= 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-900">
        {THAY_NGUOI.tieuDe}
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">
        {THAY_NGUOI.conLuot(conLuot, tongLuot)}
      </p>

      {!tamDung && (
        <p className="mt-2 text-sm text-amber-800">{THAY_NGUOI.canTamDung}</p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-sm text-slate-700">
          <span className="block">{THAY_NGUOI.nhanRa}</span>
          <select
            value={ra}
            onChange={(e) => datRa(e.target.value)}
            disabled={!tamDung || hetLuot}
            className="mt-1 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">{THAY_NGUOI.chonCauThu}</option>
            {ben.trenSan.map((id) => (
              <option key={id} value={id}>
                {tenCauThu(id)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          <span className="block">{THAY_NGUOI.nhanVao}</span>
          <select
            value={vao}
            onChange={(e) => datVao(e.target.value)}
            disabled={!tamDung || hetLuot}
            className="mt-1 rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">{THAY_NGUOI.chonCauThu}</option>
            {ben.duBi.map((id) => (
              <option key={id} value={id}>
                {tenCauThu(id)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            onThay(ra, vao)
            datRa('')
            datVao('')
          }}
          disabled={!tamDung || hetLuot || ra === '' || vao === ''}
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {THAY_NGUOI.thucHien}
        </button>
      </div>

      {hetLuot && (
        <p role="status" className="mt-2 text-sm font-medium text-amber-900">
          {THAY_NGUOI.hetLuot}
        </p>
      )}

      {loi && (
        <p role="status" className="mt-2 text-sm font-medium text-amber-900">
          {loi}
        </p>
      )}
    </section>
  )
}
