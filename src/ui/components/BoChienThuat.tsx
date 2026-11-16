import { useChuoi } from '../../hooks/useNgonNgu'
import { useState } from 'react'
import type { Tactic } from '../../domain/types'


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
  const { BO_CHIEN_THUAT, TEN_SO_DO } = useChuoi()
  const [ten, datTen] = useState('')
  const tenGon = ten.trim()

  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <h3 className="text-lg font-semibold text-chu">
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
        <label className="flex-1 text-sm text-chu">
          <span className="block">{BO_CHIEN_THUAT.nhanTenBo}</span>
          <input
            type="text"
            value={ten}
            onChange={(e) => datTen(e.target.value)}
            placeholder={BO_CHIEN_THUAT.gidanhTenBo}
            className="mt-1 w-full rounded border border-vien-dam px-2 py-1"
          />
        </label>
        <button
          type="submit"
          disabled={tenGon === ''}
          className="rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan"
        >
          {BO_CHIEN_THUAT.luuThanhBo}
        </button>
      </form>

      {cacBo.length === 0 ? (
        <p className="mt-3 text-sm text-chu-phu">
          {BO_CHIEN_THUAT.chuaCoBo}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-vien">
          {cacBo.map((bo) => {
            const dangDung = bo.id === idDangDung
            return (
              <li
                key={bo.id}
                className="flex items-center gap-3 py-2 first:pt-0"
              >
                <span className="flex-1">
                  <span className="block text-sm font-medium text-chu">
                    {bo.ten}
                  </span>
                  <span className="block text-xs text-chu-phu">
                    {TEN_SO_DO[bo.formationId]}
                  </span>
                </span>

                {dangDung ? (
                  <span className="rounded bg-tot-nen px-2 py-0.5 text-xs font-medium text-tot-chu">
                    {BO_CHIEN_THUAT.dangDung}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApDung(bo.id)}
                    className="rounded-md border border-chinh px-2 py-1 text-xs font-medium text-chinh hover:bg-chinh-nhat"
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
