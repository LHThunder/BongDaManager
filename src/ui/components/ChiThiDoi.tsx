import {
  CHI_THI,
  THU_TU_CHI_THI,
  cacXungDot,
  type BoChiThi,
  type ChiThiId,
  type MucTheoChiThi,
} from '../../domain/instructions'
import { CHI_THI_DOI } from '../strings'

interface Props {
  readonly chiThi: BoChiThi
  readonly onDoi: (chiThi: BoChiThi) => void
}

/*
  Đổi một mức của một chỉ thị. Phép ghép khoá động không giữ được quan hệ
  "khoá này đi với tập mức này" nên phải ép kiểu — gom vào đúng một hàm ở đây
  thay vì rải khắp JSX.
*/
function datMuc<K extends ChiThiId>(
  bo: BoChiThi,
  id: K,
  muc: MucTheoChiThi[K],
): BoChiThi {
  return { ...bo, [id]: muc } as BoChiThi
}

/**
 * Sáu chỉ thị toàn đội (AC-7.1), mỗi mức kèm câu đánh đổi (AC-7.2) và cảnh
 * báo khi hai chỉ thị chống nhau (AC-7.3).
 *
 * Cảnh báo KHÔNG chặn: bộ có xung đột vẫn lưu được. Chơi đội hình thấp mà
 * vẫn bật bẫy việt vị là một lựa chọn tồi, nhưng là lựa chọn của người dùng.
 */
export function ChiThiDoi({ chiThi, onDoi }: Props) {
  const xungDot = cacXungDot(chiThi)
  const chiThiCoXungDot = new Set(xungDot.flatMap((x) => x.cacChiThi))

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-slate-900">
        {CHI_THI_DOI.tieuDe}
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">{CHI_THI_DOI.moTa}</p>

      <div className="mt-4 space-y-5">
        {THU_TU_CHI_THI.map((id) => {
          const mo = CHI_THI[id]
          const mucDangChon = chiThi[id]
          const mucHienTai = mo.cacMuc.find((m) => m.muc === mucDangChon)

          return (
            <fieldset key={id}>
              <legend
                className={`text-sm font-medium ${
                  chiThiCoXungDot.has(id) ? 'text-amber-800' : 'text-slate-900'
                }`}
              >
                {mo.ten}
              </legend>

              <div className="mt-1.5 flex flex-wrap gap-2">
                {mo.cacMuc.map((m) => {
                  const dangChon = m.muc === mucDangChon
                  return (
                    <label
                      key={m.muc}
                      className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-blue-400 ${
                        dangChon
                          ? 'border-blue-600 bg-blue-50 font-medium text-blue-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={id}
                        value={m.muc}
                        checked={dangChon}
                        onChange={() => onDoi(datMuc(chiThi, id, m.muc))}
                        className="sr-only"
                      />
                      {m.ten}
                    </label>
                  )
                })}
              </div>

              {/* Câu đánh đổi của ĐÚNG mức đang chọn (AC-7.2). */}
              <p className="mt-1.5 text-sm text-slate-600">
                {mucHienTai?.danhDoi}
              </p>
            </fieldset>
          )
        })}
      </div>

      {xungDot.length > 0 && (
        <div role="status" className="mt-4 rounded-md bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            {CHI_THI_DOI.tieuDeXungDot}
          </p>
          <ul className="mt-1 space-y-1 text-sm text-amber-900">
            {xungDot.map((x) => (
              <li key={x.cacChiThi.join('+')}>{x.canhBao}</li>
            ))}
          </ul>
          <p className="mt-1 text-sm text-amber-800">
            {CHI_THI_DOI.ghiChuXungDot}
          </p>
        </div>
      )}
    </section>
  )
}
