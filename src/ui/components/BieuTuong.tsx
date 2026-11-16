/*
  Bộ biểu tượng (T329, US-21).

  Mười khái niệm lặp đi lặp lại của ứng dụng, mỗi khái niệm một biểu tượng
  riêng (AC-21.1), tất cả lấy từ **cùng một bộ** — Tabler Icons, giấy phép
  MIT — nên cùng khổ 24×24 và cùng độ dày nét 2 (AC-21.2). Nguồn gốc và
  giấy phép ghi ở `THIRD-PARTY-LICENSES.md`.

  Tệp SVG gốc nằm nguyên vẹn trong `src/ui/bieuTuong/`, chép thẳng từ bộ
  Tabler kể cả phần chú thích đầu tệp. `import.meta.glob(..., '?raw')` nhúng
  nội dung chúng VÀO bundle lúc build, nên lúc chạy không có lời gọi mạng
  nào (AC-21.4, hiến pháp P4) — và cũng không có hai bản chép tay của cùng
  một đường nét để lệch nhau.

  `stroke="currentColor"` của Tabler được giữ nguyên: biểu tượng lấy màu của
  chữ ngay cạnh nó, nên nó tự đúng ở cả chế độ sáng lẫn tối mà không cần
  token riêng.
*/

/*
  CỐ Ý không có `aria-label`.

  AC-21.3 đòi thông tin của biểu tượng phải ĐỒNG THỜI có mặt dưới dạng chữ —
  cho cả người nhìn lẫn người dùng trình đọc màn hình. Một prop `aria-label`
  sẽ chỉ lo được vế thứ hai, và sẽ mở đường cho những nút chỉ-có-biểu-tượng
  mà người nhìn phải tự đoán nghĩa.

  Nên component này luôn là TRANG TRÍ: `aria-hidden`, và chỗ nào đặt nó thì
  chữ phải nằm ngay cạnh. Khái niệm nào không có chỗ cho chữ thì dùng chữ,
  không dùng biểu tượng.
*/

const TEP = import.meta.glob('../bieuTuong/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Readonly<Record<string, string>>

/** Khái niệm → tên tệp trong bộ Tabler. */
const TEN_TEP = {
  doi: 'shield',
  cauThu: 'user',
  san: 'soccer-field',
  tran: 'ball-football',
  chienThuat: 'chess',
  lichSu: 'history',
  saoLuu: 'database-export',
  the: 'rectangle-vertical',
  banThang: 'target-arrow',
  thayNguoi: 'arrows-exchange',
} as const

export type TenBieuTuong = keyof typeof TEN_TEP

/*
  Rút các đường nét ra MỘT lần lúc nạp module, không phải mỗi lần vẽ.

  Cả mười biểu tượng đã chọn chỉ gồm thẻ `<path>` — đã kiểm lúc chép. Nếu
  sau này thêm một biểu tượng có `<circle>` hay `<rect>` thì nó sẽ hiện ra ở
  đây dưới dạng thiếu nét, nên phép đếm dưới đây chặn trước: số `d=` phải
  khớp số thẻ con.
*/
function rutDuongNet(ten: string): readonly string[] {
  const duong = `../bieuTuong/${ten}.svg`
  const noiDung = TEP[duong]
  if (noiDung === undefined) {
    throw new Error(`Thiếu tệp biểu tượng ${duong}`)
  }
  const than = noiDung.slice(noiDung.indexOf('>', noiDung.indexOf('<svg')) + 1)
  const net = [...than.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1])
  const soThe = (than.match(/<[a-z]/g) ?? []).length
  if (net.length !== soThe) {
    throw new Error(
      `Biểu tượng ${ten} có thẻ không phải <path>: ${soThe} thẻ, ${net.length} đường nét`,
    )
  }
  return net
}

const DUONG_NET: Readonly<Record<TenBieuTuong, readonly string[]>> =
  Object.fromEntries(
    Object.entries(TEN_TEP).map(([khai, tep]) => [khai, rutDuongNet(tep)]),
  ) as Readonly<Record<TenBieuTuong, readonly string[]>>

interface Props {
  readonly ten: TenBieuTuong
  /** Khổ hiển thị; mặc định hợp với một dòng chữ thường. */
  readonly co?: 'nho' | 'vua' | 'lon'
}

const KHO: Readonly<Record<NonNullable<Props['co']>, string>> = {
  nho: 'h-4 w-4',
  vua: 'h-5 w-5',
  lon: 'h-6 w-6',
}

export function BieuTuong({ ten, co = 'vua' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${KHO[co]} shrink-0`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {DUONG_NET[ten].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
