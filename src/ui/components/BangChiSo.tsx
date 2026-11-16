import { useChuoi } from '../../hooks/useNgonNgu'
import { useState } from 'react'
import {
  ATTRIBUTES,
  GK_ATTRIBUTES,
} from '../../domain/attributes'
import { chiSoCanCo } from '../../domain/completeness'
import type {
  AttributeGroup,
  AttributeId,
  AttributeValues,
  GkAttributeId,
  GkAttributeValues,
  PositionId,
} from '../../domain/types'
import { CHI_SO_MAX, CHI_SO_MIN } from '../../domain/types'


interface Props {
  readonly positions: readonly PositionId[]
  readonly attributes: AttributeValues
  readonly gkAttributes: GkAttributeValues | null
  readonly onDoiChiSo: (chiSo: AttributeValues) => void
  readonly onDoiChiSoThuMon: (chiSo: GkAttributeValues) => void
}

const THU_TU_NHOM: readonly AttributeGroup[] = [
  'ky-thuat',
  'phong-ngu',
  'the-chat',
  'tinh-than',
]

/** Giá trị gõ vào có dùng được không: rỗng = chưa điền, còn lại phải 1..20. */
function docGiaTri(
  thoVao: string,
): { hopLe: true; giaTri: number | undefined } | { hopLe: false } {
  if (thoVao.trim() === '') {
    return { hopLe: true, giaTri: undefined }
  }

  const so = Number(thoVao)
  if (
    !Number.isInteger(so) ||
    so < CHI_SO_MIN ||
    so > CHI_SO_MAX
  ) {
    return { hopLe: false }
  }

  return { hopLe: true, giaTri: so }
}

/**
 * Bảng nhập chỉ số (AC-2.2, AC-2.3, AC-2.4).
 *
 * Bảng được dựng theo đúng danh sách mà `chiSoCanCo` trả về, nên thủ môn
 * thấy 8 ô chung + 3 ô riêng và KHÔNG thấy các chỉ số chung còn lại — không
 * có chỗ nào trong component này tự quyết định danh sách đó.
 */
export function BangChiSo({
  positions,
  attributes,
  gkAttributes,
  onDoiChiSo,
  onDoiChiSoThuMon,
}: Props) {
  const { NHAN_CHI_SO, BANG_CHI_SO } = useChuoi()
  const [loiO, datLoiO] = useState<string | null>(null)

  const canCo = chiSoCanCo(positions)
  const duocPhep = new Set<string>(canCo.attributes)

  function doiChung(id: AttributeId, thoVao: string) {
    const doc = docGiaTri(thoVao)
    if (!doc.hopLe) {
      // Bỏ qua giá trị sai, giữ nguyên giá trị hợp lệ trước đó (AC-2.4).
      datLoiO(BANG_CHI_SO.loiNgoaiKhoang(NHAN_CHI_SO[id]))
      return
    }

    datLoiO(null)
    const moi: Record<string, number> = { ...attributes } as Record<
      string,
      number
    >
    if (doc.giaTri === undefined) delete moi[id]
    else moi[id] = doc.giaTri
    onDoiChiSo(moi as AttributeValues)
  }

  function doiThuMon(id: GkAttributeId, thoVao: string) {
    const doc = docGiaTri(thoVao)
    if (!doc.hopLe) {
      datLoiO(BANG_CHI_SO.loiNgoaiKhoang(NHAN_CHI_SO[id]))
      return
    }

    datLoiO(null)
    const moi: Record<string, number> = { ...(gkAttributes ?? {}) } as Record<
      string,
      number
    >
    if (doc.giaTri === undefined) delete moi[id]
    else moi[id] = doc.giaTri
    onDoiChiSoThuMon(moi as GkAttributeValues)
  }

  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-semibold text-chu">
        {BANG_CHI_SO.tieuDe}
      </legend>
      <p className="mt-1 text-xs text-chu-phu">{BANG_CHI_SO.khoangHopLe}</p>

      {loiO !== null && (
        <p role="alert" className="mt-2 text-sm text-loi-chu">
          {loiO}
        </p>
      )}

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {THU_TU_NHOM.map((nhom) => {
          const trongNhom = ATTRIBUTES.filter(
            (a) => a.nhom === nhom && duocPhep.has(a.id),
          )
          if (trongNhom.length === 0) return null

          return (
            <div key={nhom} className="rounded-md border border-vien p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-chu-phu">
                {BANG_CHI_SO.nhomTen[nhom]}
              </h4>
              <div className="mt-2 space-y-1.5">
                {trongNhom.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-chu">{NHAN_CHI_SO[a.id]}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={CHI_SO_MIN}
                      max={CHI_SO_MAX}
                      step={1}
                      value={attributes[a.id] ?? ''}
                      onChange={(e) => doiChung(a.id, e.target.value)}
                      className="w-16 rounded border border-vien-dam px-2 py-1 text-right text-chu"
                    />
                  </label>
                ))}
              </div>
            </div>
          )
        })}

        {canCo.gkAttributes.length > 0 && (
          <div className="rounded-md border border-chinh bg-chinh-nhat p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-chinh-dam">
              {BANG_CHI_SO.nhomTen['thu-mon']}
            </h4>
            <div className="mt-2 space-y-1.5">
              {GK_ATTRIBUTES.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-chu">{NHAN_CHI_SO[a.id]}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={CHI_SO_MIN}
                    max={CHI_SO_MAX}
                    step={1}
                    value={gkAttributes?.[a.id] ?? ''}
                    onChange={(e) => doiThuMon(a.id, e.target.value)}
                    className="w-16 rounded border border-vien-dam px-2 py-1 text-right text-chu"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </fieldset>
  )
}
