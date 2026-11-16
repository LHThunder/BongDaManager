/*
  Định dạng số liệu — phần KHÔNG phụ thuộc ngôn ngữ (T343).

  `coTep` chỉ sinh ký hiệu đơn vị B/KB/MB, viết y hệt ở cả tiếng Việt lẫn
  tiếng Anh, nên nó là hàm thuần chứ không nằm trong bảng chuỗi: đưa nó qua
  `useChuoi()` là tạo một bảng tra có hai cột giống hệt nhau, đúng thứ D75
  đã bác khi bàn về tên sơ đồ.

  Chữ ĐI KÈM con số thì vẫn thuộc lớp ngôn ngữ — ví dụ
  `SAO_LUU.kichThuocUocTinh('32 KB')` dựng cả câu quanh nó.
*/
export function coTep(byte: number): string {
  if (byte < 1024) return `${byte} B`
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`
}
