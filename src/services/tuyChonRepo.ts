import { moDb } from '../storage/db'
import { chuanHoaLoiLuuTru } from './errors'

/*
  Tuỳ chọn hiển thị của người dùng (AC-10.6, quyết định D51).

  Lưu trong store `meta` đã có, không dùng `localStorage`: ứng dụng hiện có
  ĐÚNG MỘT chỗ lưu dữ liệu là IndexedDB, và thêm `localStorage` là thêm một
  chỗ thứ hai mà tệp sao lưu không biết tới và P7 không phủ.

  Tầng `ui` không được chạm `storage` (hiến pháp mục 3), nên dù việc chỉ là
  đọc/ghi một hàng khoá-giá trị thì nó vẫn phải đi qua một file ở `services`.
*/

const KHOA_HIEN_SAN_2D = 'hienSan2D'
const KHOA_NGON_NGU = 'ngonNgu'
const KHOA_CHE_DO = 'cheDo'

/** Hai ngôn ngữ giao diện (hiến pháp P8 từ bản 2.0.0). */
export type NgonNgu = 'vi' | 'en'

/** Hai bảng màu (AC-20.7). */
export type CheDo = 'sang' | 'toi'

/**
 * Mặc định tiếng Việt, **không** đọc thiết lập trình duyệt (AC-17.7).
 *
 * Đoán theo `navigator.language` thì máy đặt thứ tiếng thứ ba — tiếng Pháp
 * chẳng hạn — vẫn phải rơi về một trong hai, nên vẫn cần một luật rơi về;
 * mà nút đổi chỉ cách một cú bấm, nên cái giá của việc đoán sai gần như
 * bằng không. Chọn thứ đoán được.
 */
export const NGON_NGU_MAC_DINH: NgonNgu = 'vi'

/** Mặc định chế độ sáng (AC-20.9). */
export const CHE_DO_MAC_DINH: CheDo = 'sang'

/** Mặc định HIỆN sân: AC-10.6 cho phép ẩn, không bắt phải tự bật lên. */
export const HIEN_SAN_2D_MAC_DINH = true

export async function docHienSan2D(): Promise<boolean> {
  try {
    const db = await moDb()
    const hang = await db.get('meta', KHOA_HIEN_SAN_2D)
    return typeof hang?.value === 'boolean'
      ? hang.value
      : HIEN_SAN_2D_MAC_DINH
  } catch (loi) {
    /*
      Đọc một tuỳ chọn hiển thị mà thất bại thì KHÔNG nên chặn người dùng xem
      trận: rơi về mặc định. Khác hẳn đường GHI bên dưới, nơi lỗi phải nổi lên
      cho người dùng biết là thay đổi chưa được lưu (AC-4.7).
    */
    void loi
    return HIEN_SAN_2D_MAC_DINH
  }
}

export async function datHienSan2D(hien: boolean): Promise<void> {
  try {
    const db = await moDb()
    await db.put('meta', { key: KHOA_HIEN_SAN_2D, value: hien })
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/*
  Ngôn ngữ và chế độ sáng/tối đi đúng con đường của `hienSan2D` ở trên, kể
  cả cách xử lý lỗi: ĐỌC hỏng thì rơi về mặc định vì một tuỳ chọn hiển thị
  không đáng chặn người dùng dùng ứng dụng; GHI hỏng thì ném lên để người
  dùng biết lựa chọn của mình chưa được lưu.

  Hai hàm đọc còn kiểm cả GIÁ TRỊ chứ không chỉ kiểu: một hàng `meta` hỏng
  mang chuỗi lạ sẽ rơi về mặc định thay vì đẩy một ngôn ngữ không tồn tại
  vào lớp tra cứu (hiến pháp mục 4 — dữ liệu đọc lại từ lưu trữ phải được
  kiểm trước khi vào ứng dụng).
*/
export async function docNgonNgu(): Promise<NgonNgu> {
  try {
    const db = await moDb()
    const hang = await db.get('meta', KHOA_NGON_NGU)
    return hang?.value === 'vi' || hang?.value === 'en'
      ? hang.value
      : NGON_NGU_MAC_DINH
  } catch (loi) {
    void loi
    return NGON_NGU_MAC_DINH
  }
}

export async function datNgonNgu(ngonNgu: NgonNgu): Promise<void> {
  try {
    const db = await moDb()
    await db.put('meta', { key: KHOA_NGON_NGU, value: ngonNgu })
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function docCheDo(): Promise<CheDo> {
  try {
    const db = await moDb()
    const hang = await db.get('meta', KHOA_CHE_DO)
    return hang?.value === 'sang' || hang?.value === 'toi'
      ? hang.value
      : CHE_DO_MAC_DINH
  } catch (loi) {
    void loi
    return CHE_DO_MAC_DINH
  }
}

export async function datCheDo(cheDo: CheDo): Promise<void> {
  try {
    const db = await moDb()
    await db.put('meta', { key: KHOA_CHE_DO, value: cheDo })
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}
