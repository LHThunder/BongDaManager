import { BieuTuong } from './BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useState } from 'react'
import type { BenTran } from '../../engine/tran'


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
  const { THAY_NGUOI } = useChuoi()
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
  /*
    Đăng ký 0 dự bị là HỢP LỆ từ spec 002 (AC-14.1) — nhóm vừa đủ người đá
    sân 7 thì không còn ai ngồi ghế. Phải phân biệt với "đã dùng hết lượt":
    câu "Đã hết lượt thay người" nói sai sự thật với đội chưa từng có lượt
    nào, và người dùng sẽ đi tìm xem mình đã thay ai (AC-14.3b).
  */
  const khongCoGhe = tongLuot === 0

  return (
    <section className="rounded-lg border border-vien bg-nen-the p-4">
      <h3 className="flex items-center gap-2 text-base font-semibold text-chu">
        <BieuTuong ten="thayNguoi" />
        {THAY_NGUOI.tieuDe}
      </h3>
      {khongCoGhe ? (
        <p role="status" className="mt-0.5 text-sm text-chu">
          {THAY_NGUOI.khongCoDuBi}
        </p>
      ) : (
        <p className="mt-0.5 text-sm text-chu-phu">
          {THAY_NGUOI.conLuot(conLuot, tongLuot)}
        </p>
      )}

      {!tamDung && !khongCoGhe && (
        <p className="mt-2 text-sm text-canh-bao-chu">{THAY_NGUOI.canTamDung}</p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-sm text-chu">
          <span className="block">{THAY_NGUOI.nhanRa}</span>
          <select
            value={ra}
            onChange={(e) => datRa(e.target.value)}
            disabled={!tamDung || hetLuot}
            className="mt-1 rounded border border-vien-dam px-2 py-1 disabled:bg-nen-nhan"
          >
            <option value="">{THAY_NGUOI.chonCauThu}</option>
            {ben.trenSan.map((id) => (
              <option key={id} value={id}>
                {tenCauThu(id)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-chu">
          <span className="block">{THAY_NGUOI.nhanVao}</span>
          <select
            value={vao}
            onChange={(e) => datVao(e.target.value)}
            disabled={!tamDung || hetLuot}
            className="mt-1 rounded border border-vien-dam px-2 py-1 disabled:bg-nen-nhan"
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
          className="rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
        >
          {THAY_NGUOI.thucHien}
        </button>
      </div>

      {hetLuot && !khongCoGhe && (
        <p role="status" className="mt-2 text-sm font-medium text-canh-bao-chu">
          {THAY_NGUOI.hetLuot}
        </p>
      )}

      {loi && (
        <p role="status" className="mt-2 text-sm font-medium text-canh-bao-chu">
          {loi}
        </p>
      )}
    </section>
  )
}
