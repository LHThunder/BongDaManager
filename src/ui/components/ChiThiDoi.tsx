import {
  CHI_THI,
  THU_TU_CHI_THI,
  cacXungDot,
  type BoChiThi,
  type ChiThiId,
  type MucTheoChiThi,
} from '../../domain/instructions'
import { useChuoi } from '../../hooks/useNgonNgu'
import { nhanMucChiThi } from '../ngonNgu'


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
  const { NHAN_CHI_THI, CANH_BAO_XUNG_DOT, CHI_THI_DOI } = useChuoi()
  const xungDot = cacXungDot(chiThi)
  const chiThiCoXungDot = new Set(xungDot.flatMap((x) => x.cacChiThi))

  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <h3 className="text-lg font-semibold text-chu">
        {CHI_THI_DOI.tieuDe}
      </h3>
      <p className="mt-0.5 text-sm text-chu-phu">{CHI_THI_DOI.moTa}</p>

      <div className="mt-4 space-y-4">
        {THU_TU_CHI_THI.map((id) => {
          const mo = CHI_THI[id]
          const nhan = NHAN_CHI_THI[id]
          const mucDangChon = chiThi[id]
          /*
            Nhãn tra theo MÃ MỨC, không tìm trong mảng nữa: kiểu
            `NhanChiThi` đã bảo đảm mọi mức của mọi chỉ thị đều có nhãn, nên
            ở đây không còn khả năng "không tìm thấy" để phải phòng.
          */
          const nhanMuc = nhanMucChiThi(NHAN_CHI_THI, id, mucDangChon)

          return (
            <fieldset key={id}>
              <legend
                className={`text-sm font-medium ${
                  chiThiCoXungDot.has(id) ? 'text-canh-bao-chu' : 'text-chu'
                }`}
              >
                {nhan.ten}
              </legend>

              <div className="mt-1.5 flex flex-wrap gap-2">
                {mo.cacMuc.map((m) => {
                  const dangChon = m.muc === mucDangChon
                  return (
                    <label
                      key={m.muc}
                      className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm focus-within:ring-2 focus-within:ring-chinh ${
                        dangChon
                          ? 'border-chinh bg-chinh-nhat font-medium text-chinh-dam'
                          : 'border-vien text-chu hover:bg-nen-nhan'
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
                      {nhanMucChiThi(NHAN_CHI_THI, id, m.muc).ten}
                    </label>
                  )
                })}
              </div>

              {/* Câu đánh đổi của ĐÚNG mức đang chọn (AC-7.2). */}
              <p className="mt-1.5 text-sm text-chu-phu">
                {nhanMuc.danhDoi}
              </p>
            </fieldset>
          )
        })}
      </div>

      {xungDot.length > 0 && (
        <div role="status" className="mt-4 rounded-md bg-canh-bao-nen p-3">
          <p className="text-sm font-medium text-canh-bao-chu">
            {CHI_THI_DOI.tieuDeXungDot}
          </p>
          <ul className="mt-1 space-y-1 text-sm text-canh-bao-chu">
            {xungDot.map((x) => (
              <li key={x.cacChiThi.join('+')}>{CANH_BAO_XUNG_DOT[x.ma]}</li>
            ))}
          </ul>
          <p className="mt-1 text-sm text-canh-bao-chu">
            {CHI_THI_DOI.ghiChuXungDot}
          </p>
        </div>
      )}
    </section>
  )
}
