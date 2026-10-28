import { useState } from 'react'
import type { Tactic } from '../../domain/types'
import { BO_CHIEN_THUAT, TEN_SO_DO } from '../strings'

interface Props {
  readonly cacBo: readonly Tactic[]
  /** Id bộ đang dùng, để đánh dấu trong danh sách (AC-7.6). */
  readonly idDangDung: string | null
  readonly onLuuThanhBo: (ten: string) => void
  readonly onApDung: (tacticId: string) => void
}

/** Lưu bộ chiến thuật dưới một tên và chọn lại sau (AC-7.5, AC-7.6). */
export function BoChienThuat({
  cacBo,
  idDangDung,
  onLuuThanhBo,
  onApDung,
}: Props) {
  const [ten, datTen] = useState('')
  const tenGon = ten.trim()

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-slate-900">
        {BO_CHIEN_THUAT.tieuDe}
      </h3>

      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (tenGon === '') return
          onLuuThanhBo(tenGon)
          datTen('')
        }}
      >
        <label className="flex-1 text-sm text-slate-700">
          <span className="block">{BO_CHIEN_THUAT.nhanTenBo}</span>
          <input
            type="text"
            value={ten}
            onChange={(e) => datTen(e.target.value)}
            placeholder={BO_CHIEN_THUAT.gidanhTenBo}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </label>
        <button
          type="submit"
          disabled={tenGon === ''}
          className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {BO_CHIEN_THUAT.luuThanhBo}
        </button>
      </form>

      {cacBo.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          {BO_CHIEN_THUAT.chuaCoBo}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-200">
          {cacBo.map((bo) => {
            const dangDung = bo.id === idDangDung
            return (
              <li
                key={bo.id}
                className="flex items-center gap-3 py-2 first:pt-0"
              >
                <span className="flex-1">
                  <span className="block text-sm font-medium text-slate-900">
                    {bo.ten}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {TEN_SO_DO[bo.formationId]}
                  </span>
                </span>

                {dangDung ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                    {BO_CHIEN_THUAT.dangDung}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApDung(bo.id)}
                    className="rounded-md border border-blue-700 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {BO_CHIEN_THUAT.apDung}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
