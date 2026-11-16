import { useChuoi, useTuyChonHienThi } from '../../hooks/useNgonNgu'
import type { NgonNgu } from '../../services/tuyChonRepo'

/*
  Nút đổi ngôn ngữ (AC-17.2, AC-17.6).

  Dùng hai `<button>` thật thay cho một `<select>`: chỉ có hai lựa chọn, nên
  bày sẵn cả hai thì người dùng thấy ngay mình đang ở đâu và đi đâu được,
  không phải mở ra mới biết. Hai nút cũng vào được bằng Tab mà không cần
  thêm gì — `<select>` thì trên vài trình duyệt phải mở danh sách mới chọn
  được bằng bàn phím.

  `aria-pressed` cho người dùng trình đọc màn hình biết nút nào đang bật;
  phần nhìn thì ngoài màu còn có viền đậm, vì P9 cấm truyền đạt thông tin
  chỉ bằng màu.
*/

const CAC_NGON_NGU: readonly NgonNgu[] = ['vi', 'en']

export function ChonNgonNgu() {
  const { NGON_NGU } = useChuoi()
  const { ngonNgu, doiNgonNgu } = useTuyChonHienThi()

  return (
    <div className="flex items-center gap-1">
      <span className="sr-only" id="nhan-ngon-ngu">
        {NGON_NGU.nhan}
      </span>
      <div
        role="group"
        aria-labelledby="nhan-ngon-ngu"
        className="flex overflow-hidden rounded-md border border-vien-dam"
      >
        {CAC_NGON_NGU.map((n) => {
          const dangChon = n === ngonNgu
          return (
            <button
              key={n}
              type="button"
              onClick={() => doiNgonNgu(n)}
              aria-pressed={dangChon}
              className={`px-2 py-1 text-xs font-medium ${
                dangChon
                  ? 'bg-chinh text-chu-tren-chinh'
                  : 'bg-nen-the text-chu hover:bg-nen-nhan'
              }`}
            >
              {NGON_NGU[n]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
