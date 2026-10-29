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
