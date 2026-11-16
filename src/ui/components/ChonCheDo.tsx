import { useChuoi, useTuyChonHienThi } from '../../hooks/useNgonNgu'
import type { CheDo } from '../../services/tuyChonRepo'

/*
  Nút đổi chế độ sáng/tối (AC-20.7 → AC-20.10).

  Dựng y hệt `ChonNgonNgu`: hai `<button>` thật bày sẵn cả hai lựa chọn chứ
  không phải một nút bập bênh. Nút bập bênh buộc người dùng suy ra mình đang
  ở đâu từ cái biểu tượng nó đang hiện — "mặt trăng" nghĩa là "đang tối" hay
  "bấm để sang tối"? Bày cả hai thì không còn câu hỏi ấy, và `aria-pressed`
  nói thẳng cho trình đọc màn hình biết nút nào đang bật.

  Hai nút `<button>` vào được bằng Tab sẵn, nên AC-20.10 đạt mà không phải
  thêm gì; viền bàn phím do `:focus-visible` ở `index.css` lo.

  Ngoài màu nền, nút đang bật còn khác ở ĐỘ ĐẬM của chữ — P9 cấm truyền đạt
  thông tin chỉ bằng màu, và đây đúng là chỗ dễ phạm nhất vì nó LÀ cái nút
  đổi màu.
*/

const CAC_CHE_DO: readonly CheDo[] = ['sang', 'toi']

export function ChonCheDo() {
  const { CHE_DO } = useChuoi()
  const { cheDo, doiCheDo } = useTuyChonHienThi()

  return (
    <div className="flex items-center gap-1">
      <span className="sr-only" id="nhan-che-do">
        {CHE_DO.nhan}
      </span>
      <div
        role="group"
        aria-labelledby="nhan-che-do"
        className="flex overflow-hidden rounded-md border border-vien-dam"
      >
        {CAC_CHE_DO.map((c) => {
          const dangChon = c === cheDo
          return (
            <button
              key={c}
              type="button"
              onClick={() => doiCheDo(c)}
              aria-pressed={dangChon}
              className={`px-2 py-1 text-xs ${
                dangChon
                  ? 'bg-chinh font-semibold text-chu-tren-chinh'
                  : 'bg-nen-the font-normal text-chu hover:bg-nen-nhan'
              }`}
            >
              {CHE_DO[c]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
