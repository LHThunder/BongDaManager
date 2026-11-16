import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { DB_NAME, dongDb, moDb } from '../storage/db'
import {
  CHE_DO_MAC_DINH,
  datCheDo,
  datHienSan2D,
  datNgonNgu,
  docCheDo,
  docHienSan2D,
  docNgonNgu,
  HIEN_SAN_2D_MAC_DINH,
  NGON_NGU_MAC_DINH,
} from './tuyChonRepo'

/*
  Tuỳ chọn ẩn/hiện sân 2D (AC-10.6, quyết định D51).

  Lưu trong store `meta` đã có chứ không `localStorage`, nên nó cũng phải có
  test như mọi đường đọc/ghi dữ liệu khác (hiến pháp mục 4).
*/

function xoaDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const yc = indexedDB.deleteDatabase(DB_NAME)
    yc.onsuccess = () => resolve()
    yc.onblocked = () => resolve()
    yc.onerror = () => reject(yc.error)
  })
}

beforeEach(async () => {
  await dongDb()
  await xoaDatabase()
})

describe('đọc và ghi tuỳ chọn hiện sân 2D', () => {
  it('chưa đặt gì thì trả về mặc định', async () => {
    expect(await docHienSan2D()).toBe(HIEN_SAN_2D_MAC_DINH)
  })

  it('mặc định là HIỆN sân — AC-10.6 cho ẩn, không bắt tự bật', () => {
    expect(HIEN_SAN_2D_MAC_DINH).toBe(true)
  })

  it('ghi rồi đọc lại ra đúng giá trị', async () => {
    await datHienSan2D(false)
    expect(await docHienSan2D()).toBe(false)

    await datHienSan2D(true)
    expect(await docHienSan2D()).toBe(true)
  })

  /*
    Đây là phần người dùng thật sự cảm nhận: ẩn sân, tải lại trang, sân vẫn
    ẩn. `dongDb` cắt kết nối đúng như lúc trang được tải lại.
  */
  it('giá trị sống qua một lần mở lại database', async () => {
    await datHienSan2D(false)
    await dongDb()
    expect(await docHienSan2D()).toBe(false)
  })
})

/*
  Ngôn ngữ và chế độ sáng/tối (AC-17.4, AC-17.7, AC-20.8, AC-20.9).

  Cùng đường lưu với `hienSan2D` nên cùng bộ phép kiểm. Thêm một phép mà
  `hienSan2D` không cần: giá trị **hỏng** trong store phải rơi về mặc định,
  vì `hienSan2D` là boolean còn hai thứ này là chuỗi có tập giá trị hữu hạn
  — một chuỗi lạ lọt vào lớp tra cứu sẽ cho ra màn hình trắng chữ.
*/
describe('đọc và ghi ngôn ngữ giao diện', () => {
  it('chưa đặt gì thì trả về tiếng Việt (AC-17.7)', async () => {
    expect(await docNgonNgu()).toBe('vi')
    expect(NGON_NGU_MAC_DINH).toBe('vi')
  })

  it('ghi rồi đọc lại ra đúng giá trị', async () => {
    await datNgonNgu('en')
    expect(await docNgonNgu()).toBe('en')

    await datNgonNgu('vi')
    expect(await docNgonNgu()).toBe('vi')
  })

  it('giá trị sống qua một lần mở lại database (AC-17.4)', async () => {
    await datNgonNgu('en')
    await dongDb()
    expect(await docNgonNgu()).toBe('en')
  })

  it('giá trị hỏng trong store thì rơi về mặc định', async () => {
    const db = await moDb()
    await db.put('meta', { key: 'ngonNgu', value: 'klingon' })
    expect(await docNgonNgu()).toBe('vi')
  })
})

describe('đọc và ghi chế độ sáng/tối', () => {
  it('chưa đặt gì thì trả về chế độ sáng (AC-20.9)', async () => {
    expect(await docCheDo()).toBe('sang')
    expect(CHE_DO_MAC_DINH).toBe('sang')
  })

  it('ghi rồi đọc lại ra đúng giá trị', async () => {
    await datCheDo('toi')
    expect(await docCheDo()).toBe('toi')

    await datCheDo('sang')
    expect(await docCheDo()).toBe('sang')
  })

  it('giá trị sống qua một lần mở lại database (AC-20.8)', async () => {
    await datCheDo('toi')
    await dongDb()
    expect(await docCheDo()).toBe('toi')
  })

  it('giá trị hỏng trong store thì rơi về mặc định', async () => {
    const db = await moDb()
    await db.put('meta', { key: 'cheDo', value: 'hong' })
    expect(await docCheDo()).toBe('sang')
  })
})

/*
  Hai tuỳ chọn KHÔNG được giẫm lên nhau, và cũng không giẫm lên `hienSan2D`:
  ba khoá khác nhau trong cùng một store `meta`, nên nhầm khoá là một lỗi
  rất dễ xảy ra mà chỉ lộ ra khi người dùng đổi thứ này thấy thứ kia đổi.
*/
describe('ba tuỳ chọn độc lập với nhau', () => {
  it('đổi ngôn ngữ không làm đổi chế độ hay tuỳ chọn sân', async () => {
    await datCheDo('toi')
    await datHienSan2D(false)
    await datNgonNgu('en')

    expect(await docCheDo()).toBe('toi')
    expect(await docHienSan2D()).toBe(false)
    expect(await docNgonNgu()).toBe('en')
  })
})
