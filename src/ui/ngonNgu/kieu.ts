/*
  Kiểu dùng chung cho hai bảng chuỗi.

  Bảng tiếng Việt khai `as const`, nên mỗi giá trị của nó là một kiểu LITERAL
  — `'Huỷ'`, không phải `string`. Nếu bản tiếng Anh khai thẳng
  `typeof CHUNG_VI` thì TypeScript đòi nó cũng phải là đúng chữ `'Huỷ'`, tức
  cấm luôn việc dịch.

  `BanDich` nới literal thành `string` mà **giữ nguyên tập khoá và kiểu của
  từng khoá**: khoá nào là hàm thì vẫn phải là hàm đúng chữ ký ấy. Thiếu
  khoá, thừa khoá, hay đổi một chuỗi thành hàm — cả ba đều là lỗi biên dịch.
  Đó là đúng mức chặt mà AC-22.2 cần: kiểm **hình dạng**, không kiểm nội
  dung (quyết định D66).
*/
/*
  Đệ quy, vì vài khối có object LỒNG — `TRANG_DOI.sapXep`, `BANG_CHI_SO.nhomTen`.
  Bản đầu chỉ nới một tầng, nên những khoá lồng vẫn mang kiểu literal tiếng
  Việt và bản tiếng Anh không gán được.

  Thứ tự ba nhánh có ý: `string` trước, vì một chuỗi cũng thoả hình dạng của
  object rỗng; rồi hàm, để giữ nguyên chữ ký; còn lại mới đệ quy.
*/
export type BanDich<T> = {
  readonly [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends (...args: never[]) => unknown
      ? T[K]
      : BanDich<T[K]>
}
