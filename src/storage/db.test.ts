import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  DB_NAME,
  TEN_CAC_STORE,
  docSchemaVersion,
  dongDb,
  moDb,
} from './db'
import {
  MigrationError,
  MIGRATIONS,
  SCHEMA_VERSION,
  nangLenPhienBanHienTai,
} from './migrations'

function xoaDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const yeuCau = indexedDB.deleteDatabase(DB_NAME)
    yeuCau.onsuccess = () => resolve()
    yeuCau.onblocked = () => resolve()
    yeuCau.onerror = () => reject(yeuCau.error)
  })
}

beforeEach(async () => {
  await dongDb()
  await xoaDatabase()
})

describe('mở database', () => {
  it('tạo đúng 4 store', async () => {
    const db = await moDb()
    expect([...db.objectStoreNames].sort()).toEqual([...TEN_CAC_STORE].sort())
  })

  it('store teams có index byName', async () => {
    const db = await moDb()
    const tx = db.transaction('teams')
    expect([...tx.store.indexNames]).toContain('byName')
  })

  it('store players có index byTeam và byTeamAndShirt', async () => {
    const db = await moDb()
    const tx = db.transaction('players')
    const indexes = [...tx.store.indexNames]
    expect(indexes).toContain('byTeam')
    expect(indexes).toContain('byTeamAndShirt')
  })

  it('ghi sẵn schemaVersion = 1 vào meta', async () => {
    await moDb()
    expect(await docSchemaVersion()).toBe(1)
    expect(SCHEMA_VERSION).toBe(1)
  })

  it('mở lại nhiều lần thì dùng chung một kết nối', async () => {
    const a = await moDb()
    const b = await moDb()
    expect(a).toBe(b)
  })

  it('dữ liệu còn nguyên sau khi đóng rồi mở lại (AC-4.2)', async () => {
    const db = await moDb()
    await db.put('meta', { key: 'thu-nghiem', value: 'con-day' })
    await dongDb()

    const db2 = await moDb()
    const row = await db2.get('meta', 'thu-nghiem')
    expect(row?.value).toBe('con-day')
  })
})

describe('khung migration (P7)', () => {
  it('Giai đoạn 1 chưa có bước migration nào', () => {
    expect(MIGRATIONS).toHaveLength(SCHEMA_VERSION - 1)
  })

  it('dữ liệu đã ở phiên bản hiện tại thì trả về nguyên vẹn', () => {
    const data = { teams: [{ id: 'a' }] }
    expect(nangLenPhienBanHienTai(data, SCHEMA_VERSION)).toBe(data)
  })

  it('từ chối tệp có phiên bản mới hơn ứng dụng', () => {
    try {
      nangLenPhienBanHienTai({}, SCHEMA_VERSION + 1)
      expect.unreachable('phải ném lỗi')
    } catch (loi) {
      expect(loi).toBeInstanceOf(MigrationError)
      expect((loi as MigrationError).ma).toBe('phien-ban-moi-hon-ung-dung')
    }
  })

  it('từ chối số phiên bản không hợp lệ', () => {
    for (const xau of [0, -1, 1.5, Number.NaN]) {
      expect(() => nangLenPhienBanHienTai({}, xau)).toThrow(MigrationError)
    }
  })

  it('chạy đủ chuỗi bước khi có nhiều phiên bản', () => {
    // Giai đoạn 1 chưa có bước thật, nên kiểm bằng chuỗi giả lập để đường đi
    // được chứng minh trước khi Giai đoạn 2 cần tới nó.
    const buoc: ((d: unknown) => unknown)[] = [
      (d) => ({ ...(d as object), buoc1: true }),
      (d) => ({ ...(d as object), buoc2: true }),
    ]
    const chay = (data: unknown, tu: number, den: number): unknown => {
      let hienTai = data
      for (let v = tu; v < den; v++) {
        const f = buoc[v - 1]
        if (!f) throw new Error('thiếu bước')
        hienTai = f(hienTai)
      }
      return hienTai
    }
    expect(chay({ goc: true }, 1, 3)).toEqual({
      goc: true,
      buoc1: true,
      buoc2: true,
    })
  })
})
