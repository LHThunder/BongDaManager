/** @type {import('tailwindcss').Config} */

/*
  Token màu và phông của theme (T323, quyết định D70).

  Mỗi token trỏ tới một biến CSS khai ở `src/index.css`; đổi chế độ sáng/tối
  là đổi giá trị biến, không đổi class. Vì thế 28 file giao diện chỉ viết
  `bg-nen-the` hay `text-chu-phu` MỘT lần và tự đúng ở cả hai bảng màu —
  phương án rải `dark:` khắp mọi chỗ có màu đã bị D70 loại, vì nó buộc sửa
  hai chỗ cho mỗi màu và buộc kiểm tay từng chỗ cho AC-20.2.

  Tên token là VAI TRÒ, không phải màu: `chinh` là "màu hành động chính",
  không phải "xanh lá". Nhờ vậy đọc một component là biết ý nghĩa của màu,
  và đổi gam màu sau này không phải đổi tên class.
*/
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  /*
    Không có class `dark:` nào trong repo — biến CSS đã lo việc đổi màu. Khai
    `darkMode` ở đây chỉ để nếu sau này cần một ngoại lệ thật (ví dụ một ảnh
    phải đổi hẳn chứ không đổi màu được) thì biến thể ấy nhắm đúng thuộc tính
    `data-che-do` mà ứng dụng dùng, chứ không nhắm `prefers-color-scheme` của
    hệ điều hành — AC-20.9 đòi lần đầu mở LUÔN là chế độ sáng.
  */
  darkMode: ['selector', ':root[data-che-do="toi"]'],

  theme: {
    extend: {
      colors: {
        nen: 'var(--nen)',
        'nen-the': 'var(--nen-the)',
        'nen-nhan': 'var(--nen-nhan)',
        vien: 'var(--vien)',
        'vien-dam': 'var(--vien-dam)',
        chu: 'var(--chu)',
        'chu-phu': 'var(--chu-phu)',
        chinh: 'var(--chinh)',
        'chinh-dam': 'var(--chinh-dam)',
        'chinh-nhat': 'var(--chinh-nhat)',
        'chu-tren-chinh': 'var(--chu-tren-chinh)',
        'canh-bao-nen': 'var(--canh-bao-nen)',
        'canh-bao-chu': 'var(--canh-bao-chu)',
        'loi-nen': 'var(--loi-nen)',
        'loi-chu': 'var(--loi-chu)',
        'tot-nen': 'var(--tot-nen)',
        'tot-chu': 'var(--tot-chu)',
        'loi-manh': 'var(--loi-manh)',
        'loi-manh-dam': 'var(--loi-manh-dam)',
        'chu-tren-loi': 'var(--chu-tren-loi)',
        'canh-bao-manh': 'var(--canh-bao-manh)',
        'canh-bao-manh-dam': 'var(--canh-bao-manh-dam)',
        'chu-tren-canh-bao': 'var(--chu-tren-canh-bao)',
        'lop-phu': 'var(--lop-phu)',

        /* Sân chiến thuật — bảng riêng, giống nhau ở cả hai chế độ. */
        'co-nen': 'var(--co-nen)',
        'co-nen-dam': 'var(--co-nen-dam)',
        'co-vien-mo': 'var(--co-vien-mo)',
        'co-vang': 'var(--co-vang)',
        'co-o': 'var(--co-o)',
        'co-chu': 'var(--co-chu)',
        'co-chu-phu': 'var(--co-chu-phu)',
        'co-vien': 'var(--co-vien)',
        'co-noi-bat': 'var(--co-noi-bat)',
        'co-nhan-nen': 'var(--co-nhan-nen)',
        'co-nhan-chu': 'var(--co-nhan-chu)',
        'co-canh-bao-nen': 'var(--co-canh-bao-nen)',
        'co-canh-bao-chu': 'var(--co-canh-bao-chu)',
        'sai-nhe': 'var(--sai-nhe)',
        'sai-vua': 'var(--sai-vua)',
        'sai-nang': 'var(--sai-nang)',
      },
      fontFamily: {
        chinh: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        /*
          Phông tiêu đề hẹp và đậm, kiểu chữ trên áo và trên bảng tỉ số sân
          bóng. Chỉ dùng cho tiêu đề và con số lớn, không dùng cho chữ thường
          — chữ hẹp đọc câu dài thì mỏi mắt.
        */
        tieuDe: ['Barlow Condensed', 'Impact', 'Haettenschweiler', 'sans-serif'],
      },
    },
  },

  plugins: [],
}
