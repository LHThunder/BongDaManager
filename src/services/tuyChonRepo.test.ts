import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { DB_NAME, dongDb } from '../storage/db'
import {
  datHienSan2D,
  docHienSan2D,
  HIEN_SAN_2D_MAC_DINH,
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
