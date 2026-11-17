import type { Rng } from './types'

/*
  Kho tên hư cấu để sinh cầu thủ ngẫu nhiên (AC-24.8, quyết định D80, D81).

  BA ĐIỀU CẦN NÓI RÕ, vì file này trông như một lớp ngôn ngữ mà không phải:

  1. **Đây là DỮ LIỆU, không phải nhãn giao diện.** P8 bắt mọi chữ người
     dùng nhìn thấy đi qua lớp tra cứu ngôn ngữ, nhưng tên một cầu thủ sinh
     ra là tên của *cầu thủ ấy* — đổi ngôn ngữ giao diện thì nó phải GIỮ
     NGUYÊN, đúng như AC-24.8 đòi. Thứ gì đổi theo ngôn ngữ thì thuộc
     `ui/ngonNgu`; thứ gì sinh ra một lần rồi thành dữ liệu người dùng thì
     thuộc `domain`. Vì thế hàm nhận **kho làm tham số**: `ui` chọn kho theo
     ngôn ngữ đang hiện, `domain` không cần biết ngôn ngữ nào đang chọn và
     không phải import `services/tuyChonRepo` (ngược luồng phụ thuộc).

  2. **Tên hư cấu, không phải tên người thật.** Ràng buộc bản quyền ở mục 3
     hiến pháp: dữ liệu đóng gói trong repo MUST là hư cấu hoặc tự sinh. Hai
     kho dưới đây ghép từ những thành phần tên thông dụng — không mục nào là
     tên đầy đủ của một cầu thủ có thật, và kho tiếng Anh cố ý dùng những họ
     nghe như tên địa danh để không va vào tên cầu thủ nào đang chơi. Muốn
     có cầu thủ thật thì người dùng tự nhập, đúng như từ spec 001.

  3. **Kích thước kho là một yêu cầu, không phải tuỳ hứng.** Một đội sinh ra
     là 18 người, và người dùng sẽ sinh nhiều đội. Số tổ hợp phải đủ lớn để
     tỉ lệ trùng tên thấp — 30 họ × 60 tên = 1.800 tổ hợp mỗi kho, nên sinh
     200 tên chỉ trùng khoảng 5%. Rút bớt một danh sách là làm tỉ lệ ấy xấu
     đi theo bình phương; `tenNgauNhien.test.ts` canh con số này.
*/

/** Thứ tự ghép hai thành phần của một kho. */
export type ThuTuTen =
  /** Việt: họ đứng trước — "Nguyễn Minh Khoa". */
  | 'ho-truoc'
  /** Anh: tên gọi đứng trước — "Oscar Pemberton". */
  | 'ten-truoc'

export interface KhoTen {
  readonly ho: readonly string[]
  readonly ten: readonly string[]
  readonly thuTu: ThuTuTen
}

/*
  Họ thông dụng của người Việt, cộng tên hai âm tiết. Không mục nào tự nó
  là tên một người; tổ hợp mới thành tên, và tổ hợp là do nguồn ngẫu nhiên
  chọn chứ không có sẵn trong repo.
*/
export const KHO_TEN_VIET: KhoTen = {
  thuTu: 'ho-truoc',
  ho: [
    'Nguyễn',
    'Trần',
    'Lê',
    'Phạm',
    'Hoàng',
    'Huỳnh',
    'Phan',
    'Vũ',
    'Võ',
    'Đặng',
    'Bùi',
    'Đỗ',
    'Hồ',
    'Ngô',
    'Dương',
    'Lý',
    'Đinh',
    'Trương',
    'Mai',
    'Tạ',
    'Lương',
    'Chu',
    'Cao',
    'Thái',
    'Quách',
    'Khuất',
    'Trịnh',
    'Lại',
    'Vương',
    'Tống',
  ],
  /*
    Danh sách này đã được soát MỘT LƯỢT RIÊNG để không ghép ra tên tuyển thủ
    Việt Nam có thật. Bản đầu có 'Tuấn Anh', 'Xuân Trường', 'Tiến Dũng',
    'Ngọc Hải', 'Đình Trọng'… — mỗi cái tự nó chỉ là một tên gọi, nhưng ghép
    với 30 họ thông dụng ở trên thì kho **sinh ra được** đúng tên đầy đủ của
    những cầu thủ đang chơi. Ràng buộc ở mục 3 hiến pháp cấm đóng gói tên
    cầu thủ thật vào repo, và một kho ghép được ra tên thật thì cũng phạm
    điều ấy, dù không mục nào trong repo là tên thật.

    Vì thế: thêm tên mới vào đây phải tự hỏi "ghép với 30 họ kia có ra một
    cầu thủ thật không?", không phải chỉ "mục này có phải tên thật không?".
  */
  ten: [
    'Minh Khoa',
    'Quang Vinh',
    'Tuấn Kiệt',
    'Đức Thắng',
    'Hoài Nam',
    'Bá Tùng',
    'Chí Công',
    'Duy Khánh',
    'Gia Bảo',
    'Hữu Nghị',
    'Khắc Thành',
    'Mạnh Dũng',
    'Ngọc Sơn',
    'Phi Long',
    'Quốc Việt',
    'Sỹ Mạnh',
    'Thanh Bình',
    'Trọng Nhân',
    'Văn An',
    'Xuân Lộc',
    'Anh Quân',
    'Bảo Toàn',
    'Công Thành',
    'Đình Khôi',
    'Hải Đăng',
    'Hùng Cường',
    'Kiên Trung',
    'Lâm Phong',
    'Nhật Minh',
    'Phúc Lâm',
    'Quyết Thắng',
    'Sơn Hà',
    'Thái Sơn',
    'Tiến Đạt',
    'Tuấn Tài',
    'Việt Hoàng',
    'Vĩnh Khang',
    'Xuân Hoà',
    'An Khang',
    'Bình Minh',
    'Cao Cường',
    'Đắc Lộc',
    'Hạo Nhiên',
    'Hoàng Giang',
    'Khánh Hoà',
    'Lập Nghiệp',
    'Nam Sơn',
    'Như Thuần',
    'Phong Vũ',
    'Phú Quý',
    'Thế Vinh',
    'Thiên Trường',
    'Trung Kiên',
    'Tường Lâm',
    'Uy Dũng',
    'Vạn Xuân',
    'Vỹ Hào',
    'Yên Bình',
    'Chấn Hưng',
    'Đại Nghĩa',
  ],
}

/*
  Kho tiếng Anh: họ nghe như tên địa danh Anh — kiểu tên có thật trong tiếng
  Anh nhưng không trùng tên cầu thủ nào đang chơi. Đây là chỗ ràng buộc bản
  quyền ở mục 3 hiến pháp dễ bị phạm nhất, nên nó được chọn có ý.
*/
export const KHO_TEN_ANH: KhoTen = {
  thuTu: 'ten-truoc',
  ho: [
    'Ashworth',
    'Bramley',
    'Carrow',
    'Denholm',
    'Eastwood',
    'Fairbrook',
    'Granger',
    'Haldane',
    'Inglis',
    'Kinsley',
    'Lambourne',
    'Merrick',
    'Norbury',
    'Ollerton',
    'Pemberton',
    'Quillan',
    'Radcliffe',
    'Stanmore',
    'Thornley',
    'Upton',
    'Vance',
    'Westbrook',
    'Yarrow',
    'Birkdale',
    'Calloway',
    'Hollingworth',
    'Marchant',
    'Redfern',
    'Sheldrake',
    'Whitcombe',
  ],
  ten: [
    'Alfie',
    'Bertie',
    'Callum',
    'Dominic',
    'Elliot',
    'Felix',
    'Gareth',
    'Harvey',
    'Isaac',
    'Joel',
    'Keaton',
    'Lewis',
    'Miles',
    'Nathan',
    'Oscar',
    'Perry',
    'Quentin',
    'Rory',
    'Spencer',
    'Toby',
    'Vincent',
    'Wilfred',
    'Archie',
    'Blake',
    'Conor',
    'Dexter',
    'Eddie',
    'Finlay',
    'Gilbert',
    'Hugo',
    'Ivor',
    'Jasper',
    'Kieran',
    'Lachlan',
    'Marcus',
    'Nolan',
    'Owen',
    'Patrick',
    'Reuben',
    'Seth',
    'Tristan',
    'Victor',
    'Wesley',
    'Adam',
    'Barnaby',
    'Cedric',
    'Duncan',
    'Ewan',
    'Fraser',
    'Graham',
    'Hamish',
    'Ignatius',
    'Jerome',
    'Kenton',
    'Leopold',
    'Malcolm',
    'Neville',
    'Osmond',
    'Rupert',
    'Sidney',
  ],
}

/**
 * Bốc một phần tử của danh sách bằng nguồn ngẫu nhiên được truyền vào.
 *
 * `Rng.next()` cam kết trả số trong `[0, 1)`, nhưng vẫn kẹp chỉ số lại: một
 * nguồn giả trong test có thể trả đúng 1 và một phần tử `undefined` lọt ra
 * đây sẽ thành một tên trống trên màn hình người dùng, chứ không thành lỗi.
 */
function boc(danh: readonly string[], rng: Rng): string {
  const i = Math.min(danh.length - 1, Math.floor(rng.next() * danh.length))
  return danh[i] as string
}

/**
 * Sinh một tên từ một kho (AC-24.8).
 *
 * Thứ tự lấy số từ `rng` là **cố định**: họ trước, tên sau — không phụ thuộc
 * `thuTu`, vì `thuTu` chỉ quyết định cách ghép chữ chứ không quyết định thứ
 * tự bốc. Nhờ vậy cùng một nguồn ngẫu nhiên luôn cho cùng một tên (P1).
 */
export function sinhTen(kho: KhoTen, rng: Rng): string {
  const ho = boc(kho.ho, rng)
  const ten = boc(kho.ten, rng)
  return kho.thuTu === 'ho-truoc' ? `${ho} ${ten}` : `${ten} ${ho}`
}

/** Số tổ hợp của một kho — dùng để kiểm kho còn đủ lớn hay không. */
export function soToHop(kho: KhoTen): number {
  return kho.ho.length * kho.ten.length
}
