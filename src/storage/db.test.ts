import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { laySoDo, SO_DO_MAC_DINH } from '../domain/formations'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { vaiTroMacDinh } from '../domain/roles'
import * as teamRepo from '../services/teamRepo'
import {
  DB_NAME,
  DB_VERSION,
  TEN_CAC_STORE,
  docSchemaVersion,
  dongDb,
  moDb,
  taoChienThuatMacDinh,
  yeuCauLuuTruBen,
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
  it('tạo đúng 5 store', async () => {
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

  it('ghi sẵn schemaVersion hiện tại vào meta', async () => {
    await moDb()
    expect(await docSchemaVersion()).toBe(SCHEMA_VERSION)
    expect(SCHEMA_VERSION).toBe(4)
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

describe('ghi xuyên thẳng, không có nút Lưu (AC-4.1, quyết định D4)', () => {
  it('một hành động rời rạc được ghi xuống ngay trong cùng lượt gọi', async () => {
    const doi = await teamRepo.create({ name: 'Ghi ngay' })

    // Đóng kết nối rồi mở lại: nếu dữ liệu chỉ nằm trong bộ nhớ thì nó mất.
    await dongDb()
    const db = await moDb()
    expect(await db.get('teams', doi.id)).toMatchObject({ name: 'Ghi ngay' })
  })

  it('một chuỗi thay đổi liên tiếp không mất bản ghi nào', async () => {
    const ten = ['Đội 1', 'Đội 2', 'Đội 3', 'Đội 4', 'Đội 5']
    for (const t of ten) {
      await teamRepo.create({ name: t })
    }

    await dongDb()
    const db = await moDb()
    const daLuu = (await db.getAll('teams')).map((d) => d.name).sort()
    expect(daLuu).toEqual([...ten].sort())
  })

  it('đổi tên rồi đóng mở lại thì tên mới vẫn còn', async () => {
    const doi = await teamRepo.create({ name: 'Tên cũ' })
    await teamRepo.rename(doi.id, 'Tên mới')

    await dongDb()
    const db = await moDb()
    expect((await db.get('teams', doi.id))?.name).toBe('Tên mới')
  })

  it('xoá rồi đóng mở lại thì đội không quay lại', async () => {
    const doi = await teamRepo.create({ name: 'Sắp xoá' })
    await teamRepo.remove(doi.id)

    await dongDb()
    const db = await moDb()
    expect(await db.get('teams', doi.id)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Nâng cấp lên phiên bản 2 (AC-5.10, AC-7.4)
// ---------------------------------------------------------------------------

/*
  `moDb()` giờ yêu cầu phiên bản 2, nên nó KHÔNG mở được một database phiên
  bản 1 nữa. Muốn chứng minh bước nâng cấp thì test phải tự dựng database v1
  bằng tay: tạo 4 store cũ, nhét dữ liệu, ĐÓNG kết nối, rồi mới gọi `moDb()`.
  Không đóng trước thì `moDb()` bị chặn; không dựng v1 trước thì nó chỉ mở
  một database v2 mới toanh và test chẳng chứng minh điều gì.
*/

interface DoiV1 {
  id: string
  name: string
  logoImageId: string | null
  primaryColor: string
  secondaryColor: string
  createdAt: number
  updatedAt: number
}

const DOI_V1: DoiV1[] = [
  {
    id: 'doi-1',
    name: 'Đội Một',
    logoImageId: 'anh-1',
    primaryColor: '#112233',
    secondaryColor: '#ffffff',
    createdAt: 1000,
    updatedAt: 2000,
  },
  {
    id: 'doi-2',
    name: 'Đội Hai',
    logoImageId: null,
    primaryColor: '#445566',
    secondaryColor: '#000000',
    createdAt: 3000,
    updatedAt: 4000,
  },
]

const CAU_THU_V1 = [
  {
    id: 'ct-1',
    teamId: 'doi-1',
    name: 'Cầu thủ Một',
    shirtNumber: 9,
    age: 25,
    preferredFoot: 'phai',
    positions: ['ST'],
    attributes: { 'dut-diem': 15 },
    gkAttributes: null,
    portraitImageId: null,
    createdAt: 1000,
    updatedAt: 1000,
  },
]

function dungDatabaseV1(): Promise<void> {
  return new Promise((resolve, reject) => {
    const yeuCau = indexedDB.open(DB_NAME, 1)

    yeuCau.onupgradeneeded = () => {
      const db = yeuCau.result
      db.createObjectStore('meta', { keyPath: 'key' })
      const teams = db.createObjectStore('teams', { keyPath: 'id' })
      teams.createIndex('byName', 'name')
      const players = db.createObjectStore('players', { keyPath: 'id' })
      players.createIndex('byTeam', 'teamId')
      players.createIndex('byTeamAndShirt', ['teamId', 'shirtNumber'])
      db.createObjectStore('images', { keyPath: 'id' })
    }

    yeuCau.onerror = () => reject(yeuCau.error)

    yeuCau.onsuccess = () => {
      const db = yeuCau.result
      const tx = db.transaction(
        ['meta', 'teams', 'players', 'images'],
        'readwrite',
      )

      tx.objectStore('meta').put({ key: 'schemaVersion', value: 2 })
      for (const doi of DOI_V1) {
        tx.objectStore('teams').put(doi)
      }
      for (const ct of CAU_THU_V1) {
        tx.objectStore('players').put(ct)
      }
      tx.objectStore('images').put({
        id: 'anh-1',
        blob: new Blob([new Uint8Array([1, 2, 3])], { type: 'image/webp' }),
        width: 64,
        height: 64,
        byteSize: 3,
      })

      tx.oncomplete = () => {
        // Phải đóng, không thì yêu cầu nâng cấp của `moDb()` bị chặn.
        db.close()
        resolve()
      }
      tx.onerror = () => reject(tx.error)
    }
  })
}

describe('nâng cấp database v1 lên v2 (AC-5.10, AC-7.4)', () => {
  beforeEach(async () => {
    await dungDatabaseV1()
  })

  it('sau nâng cấp có đủ 5 store và tactics có index byTeam', async () => {
    const db = await moDb()

    expect(db.version).toBe(DB_VERSION)
    expect([...db.objectStoreNames].sort()).toEqual([...TEN_CAC_STORE].sort())
    expect([...db.transaction('tactics').store.indexNames]).toContain('byTeam')
  })

  it('không mất bản ghi nào: đội, cầu thủ và ảnh còn đủ', async () => {
    const db = await moDb()

    expect(await db.count('teams')).toBe(DOI_V1.length)
    expect(await db.count('players')).toBe(CAU_THU_V1.length)
    expect(await db.count('images')).toBe(1)

    const anh = await db.get('images', 'anh-1')
    expect(anh?.byteSize).toBe(3)
    expect(await db.get('players', 'ct-1')).toMatchObject({
      name: 'Cầu thủ Một',
      shirtNumber: 9,
    })
  })

  it('bước nâng cấp chỉ THÊM activeTacticId, không sửa trường nào khác', async () => {
    const db = await moDb()

    for (const goc of DOI_V1) {
      const sau = await db.get('teams', goc.id)
      expect(sau, goc.id).toMatchObject(goc)
      expect(sau?.activeTacticId, goc.id).toBeTruthy()
    }
  })

  it('mỗi đội có đúng một chiến thuật, và activeTacticId trỏ đúng vào nó', async () => {
    const db = await moDb()

    expect(await db.count('tactics')).toBe(DOI_V1.length)

    for (const goc of DOI_V1) {
      const cuaDoi = await db.getAllFromIndex('tactics', 'byTeam', goc.id)
      expect(cuaDoi, goc.id).toHaveLength(1)

      const doi = await db.get('teams', goc.id)
      expect(doi?.activeTacticId, goc.id).toBe(cuaDoi[0].id)
    }
  })

  it('chiến thuật mặc định là 4-4-2, 11 ô trống, vai trò mặc định, chỉ thị cân bằng', async () => {
    const db = await moDb()
    const chienThuat = (await db.getAllFromIndex('tactics', 'byTeam', 'doi-1'))[0]

    expect(chienThuat.ten).toBeNull()
    expect(chienThuat.formationId).toBe(SO_DO_MAC_DINH)
    expect(chienThuat.chiThi).toEqual(CHI_THI_MAC_DINH)
    expect(chienThuat.oVien).toEqual(
      laySoDo(SO_DO_MAC_DINH).oVien.map((o) => ({
        slotId: o.slotId,
        playerId: null,
        roleId: vaiTroMacDinh(o.viTri),
      })),
    )
  })

  /*
    Trước Giai đoạn 4, phép này khẳng định bước nâng cấp KHÔNG chạm hàng
    `meta.schemaVersion` — nên máy đã có dữ liệu sẽ mãi mang số cũ sau khi
    `SCHEMA_VERSION` tăng, và `docSchemaVersion()` thành một câu nói sai.

    Bước lên phiên bản 3 ghi lại hàng đó, nên khẳng định đúng bây giờ là:
    nâng cấp xong thì số trong database khớp số mà bản ứng dụng này phát hành.
  */
  it('nâng cấp xong thì schemaVersion trong meta khớp bản hiện tại', async () => {
    await moDb()
    expect(await docSchemaVersion()).toBe(SCHEMA_VERSION)
  })

  it('mở lại lần nữa không sinh thêm chiến thuật nào', async () => {
    const db = await moDb()
    const lanDau = (await db.getAll('tactics')).map((c) => c.id).sort()
    await dongDb()

    const db2 = await moDb()
    const lanHai = (await db2.getAll('tactics')).map((c) => c.id).sort()

    expect(lanHai).toEqual(lanDau)
    expect(lanHai).toHaveLength(DOI_V1.length)
  })
})

describe('bộ chiến thuật mặc định (AC-7.4)', () => {
  it('mỗi lần gọi ra một id khác nhau', () => {
    const a = taoChienThuatMacDinh('doi-x')
    const b = taoChienThuatMacDinh('doi-x')
    expect(a.id).not.toBe(b.id)
  })

  it('gắn đúng đội, chưa có tên, và createdAt bằng updatedAt', () => {
    const c = taoChienThuatMacDinh('doi-x', 777)
    expect(c.teamId).toBe('doi-x')
    expect(c.ten).toBeNull()
    expect(c.createdAt).toBe(777)
    expect(c.updatedAt).toBe(777)
  })

  it('đúng 11 ô, không ô nào có người, slotId không trùng', () => {
    const c = taoChienThuatMacDinh('doi-x')
    expect(c.oVien).toHaveLength(11)
    expect(c.oVien.every((o) => o.playerId === null)).toBe(true)
    expect(new Set(c.oVien.map((o) => o.slotId)).size).toBe(11)
  })
})

describe('xin quyền lưu trữ bền (AC-4.9)', () => {
  it('môi trường không có navigator.storage thì trả khong-ho-tro', async () => {
    // Trong test chạy trên node không có Storage API — hàm phải trả về gọn
    // gàng chứ không được ném lỗi làm chết đường nạp dữ liệu.
    expect(await yeuCauLuuTruBen()).toBe('khong-ho-tro')
  })
})

describe('khung migration (P7)', () => {
  it('có đúng một bước migration cho mỗi lần tăng phiên bản', () => {
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
