import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { ATTRIBUTES } from '../domain/attributes'
import type { AttributeValues } from '../domain/types'
import { DB_NAME, dongDb, moDb } from '../storage/db'
import { SCHEMA_VERSION } from '../storage/migrations'
import * as backup from './backupService'
import * as playerRepo from './playerRepo'
import * as teamRepo from './teamRepo'

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

function chiSoDayDu(giaTri = 12): AttributeValues {
  const ra: Record<string, number> = {}
  for (const a of ATTRIBUTES) ra[a.id] = giaTri
  return ra as AttributeValues
}

/** Dựng một bộ dữ liệu có đủ đội, cầu thủ và ảnh để xuất/nhập có cái mà làm. */
async function dungDuLieuMau(tenDoi = 'Đội A') {
  const db = await moDb()
  const anhId = crypto.randomUUID()
  await db.put('images', {
    id: anhId,
    blob: new Blob([new Uint8Array([1, 2, 3, 4, 5])], { type: 'image/jpeg' }),
    width: 64,
    height: 64,
    byteSize: 5,
  })

  const doi = await teamRepo.create({ name: tenDoi, logoImageId: anhId })
  const cauThu = await playerRepo.save({
    teamId: doi.id,
    name: 'Nguyễn Văn A',
    shirtNumber: 7,
    age: 25,
    preferredFoot: 'phai',
    positions: ['DC', 'DM'],
    attributes: chiSoDayDu(),
    gkAttributes: null,
  })

  return { doi, cauThu, anhId }
}

async function demTatCa() {
  const db = await moDb()
  return {
    teams: await db.count('teams'),
    players: await db.count('players'),
    images: await db.count('images'),
  }
}

describe('xuất tệp (AC-4.3)', () => {
  it('xuất ra một tệp JSON duy nhất có đủ ba phần', async () => {
    await dungDuLieuMau()
    const blob = await backup.exportAll()

    expect(blob.type).toBe('application/json')
    const noiDung = JSON.parse(await blob.text())
    expect(noiDung.schemaVersion).toBe(SCHEMA_VERSION)
    expect(noiDung.teams).toHaveLength(1)
    expect(noiDung.players).toHaveLength(1)
    expect(noiDung.images).toHaveLength(1)
    expect(typeof noiDung.exportedAt).toBe('string')
  })

  it('ảnh được mã hoá base64 trong tệp', async () => {
    await dungDuLieuMau()
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    expect(noiDung.images[0].mime).toBe('image/jpeg')
    expect(noiDung.images[0].data).toMatch(/^[A-Za-z0-9+/=]+$/)
  })

  it('database rỗng thì vẫn xuất được tệp hợp lệ', async () => {
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    expect(noiDung.teams).toEqual([])
    expect(await backup.inspect(await backup.exportAll())).toMatchObject({
      soDoi: 0,
      soCauThu: 0,
      soAnh: 0,
    })
  })

  it('tên tệp có ngày giờ để nhiều lần xuất không ghi đè nhau', () => {
    const ten = backup.tenTepSaoLuu(new Date(2026, 9, 27, 8, 5))
    expect(ten).toBe('bongda-20261027-0805.json')
  })
})

describe('kích thước ước tính (AC-4.8)', () => {
  it('tính được mà không dựng tệp', async () => {
    expect(await backup.uocTinhKichThuoc()).toBeGreaterThan(0)
  })

  it('càng nhiều ảnh thì ước tính càng lớn', async () => {
    const truoc = await backup.uocTinhKichThuoc()
    const db = await moDb()
    await db.put('images', {
      id: crypto.randomUUID(),
      blob: new Blob([new Uint8Array(60_000)], { type: 'image/jpeg' }),
      width: 256,
      height: 256,
      byteSize: 60_000,
    })
    expect(await backup.uocTinhKichThuoc()).toBeGreaterThan(truoc + 50_000)
  })
})

describe('nhập lại đúng dữ liệu đã xuất (AC-4.4)', () => {
  it('vòng tròn xuất rồi nhập cho ra dữ liệu bằng chính nó, kể cả ảnh', async () => {
    const mau = await dungDuLieuMau()
    const tep = await backup.exportAll()

    // Xoá sạch rồi nhập lại, giống như làm trên máy khác.
    await dongDb()
    await xoaDatabase()
    expect(await demTatCa()).toEqual({ teams: 0, players: 0, images: 0 })

    const baoCao = await backup.importAll(tep, 'thay-the')
    expect(baoCao).toMatchObject({ cheDo: 'thay-the', soDoi: 1, soCauThu: 1 })

    const db = await moDb()
    const doi = await db.get('teams', mau.doi.id)
    const cauThu = await db.get('players', mau.cauThu.id)
    const anh = await db.get('images', mau.anhId)

    expect(doi).toMatchObject({ name: 'Đội A', logoImageId: mau.anhId })
    expect(cauThu).toMatchObject({
      name: 'Nguyễn Văn A',
      shirtNumber: 7,
      positions: ['DC', 'DM'],
    })
    expect(cauThu?.attributes).toEqual(mau.cauThu.attributes)

    expect(anh).toBeDefined()
    const bytes = new Uint8Array((await anh?.blob.arrayBuffer()) as ArrayBuffer)
    expect([...bytes]).toEqual([1, 2, 3, 4, 5])
    expect(anh?.blob.type).toBe('image/jpeg')
  })

  it('chế độ thay thế xoá hết dữ liệu cũ', async () => {
    await dungDuLieuMau('Đội cũ')
    const tep = await backup.exportAll()

    await dongDb()
    await xoaDatabase()
    await dungDuLieuMau('Đội khác hẳn')

    await backup.importAll(tep, 'thay-the')
    const db = await moDb()
    const ten = (await db.getAll('teams')).map((d) => d.name)
    expect(ten).toEqual(['Đội cũ'])
  })
})

describe('tính TẤT CẢ-HOẶC-KHÔNG-GÌ (AC-4.5, hiến pháp P3)', () => {
  it('tệp lỗi ở BẢN GHI CUỐI thì dữ liệu cũ còn nguyên 100%', async () => {
    // Dựng một tệp HỢP LỆ của dữ liệu khác, rồi làm hỏng bản ghi CUỐI CÙNG.
    // Lỗi ở cuối tệp là trường hợp xấu nhất: nếu code ghi dần trong lúc đọc
    // thì các bản ghi trước đó đã lọt vào database rồi.
    await dungDuLieuMau('Đội trong tệp')
    await dungDuLieuMau('Đội trong tệp 2')
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    noiDung.players[noiDung.players.length - 1].positions = ['KHONG_CO_THAT']
    const tepHong = new Blob([JSON.stringify(noiDung)], {
      type: 'application/json',
    })

    // Giờ dựng lại đúng trạng thái "dữ liệu đang có trên máy người dùng"
    await dongDb()
    await xoaDatabase()
    const dangCo = await dungDuLieuMau('Đội đang có')
    const truoc = await demTatCa()

    await expect(backup.importAll(tepHong, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
    })

    // Không mất gì, và không có bản ghi nào của tệp mới lọt vào
    expect(await demTatCa()).toEqual(truoc)
    const db = await moDb()
    expect((await db.getAll('teams')).map((d) => d.name)).toEqual([
      'Đội đang có',
    ])
    expect(await db.get('teams', dangCo.doi.id)).toBeDefined()
    expect(await db.get('players', dangCo.cauThu.id)).toBeDefined()
    expect(await db.get('images', dangCo.anhId)).toBeDefined()
  })

  it('chế độ gộp với tệp lỗi cũng không ghi gì', async () => {
    await dungDuLieuMau('Đội đang có')
    const truoc = await demTatCa()

    const tepHong = new Blob([
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        teams: [],
        players: [],
        images: [{ id: 'a', mime: 'image/jpeg', data: 'khong-phai-base64!!!' }],
      }),
    ])

    await expect(backup.importAll(tepHong, 'gop')).rejects.toBeDefined()
    expect(await demTatCa()).toEqual(truoc)
  })

  it('ảnh base64 hỏng bị bắt trước khi ghi', async () => {
    await dungDuLieuMau()
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    noiDung.images[0].data = '!!!khong-the-giai-ma!!!'
    const tepHong = new Blob([JSON.stringify(noiDung)])

    const truoc = await demTatCa()
    await expect(backup.importAll(tepHong, 'thay-the')).rejects.toBeDefined()
    expect(await demTatCa()).toEqual(truoc)
  })
})

describe('tệp không dùng được (AC-4.5)', () => {
  it('tệp không phải JSON thì ném NotJson', async () => {
    const tep = new Blob(['đây không phải json'], { type: 'text/plain' })
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'NotJson',
    })
  })

  it('JSON nhưng không phải đối tượng thì ném NotJson', async () => {
    await expect(
      backup.importAll(new Blob(['[1,2,3]']), 'thay-the'),
    ).rejects.toMatchObject({ ma: 'NotJson' })
  })

  it('thiếu schemaVersion thì ném SchemaInvalid, nêu đúng trường', async () => {
    await expect(
      backup.importAll(new Blob(['{"teams":[]}']), 'thay-the'),
    ).rejects.toMatchObject({
      ma: 'SchemaInvalid',
      chiTiet: { duongDan: 'schemaVersion' },
    })
  })

  it('sai hình dạng thì ném SchemaInvalid kèm đường dẫn tới trường sai', async () => {
    const tep = new Blob([
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        exportedAt: 'hôm nay',
        teams: [{ id: 'a', name: 'X', logoImageId: null, primaryColor: 'đỏ' }],
        players: [],
        images: [],
      }),
    ])
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
    })
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      chiTiet: { duongDan: expect.stringContaining('teams') },
    })
  })

  it('cầu thủ trỏ tới đội không có trong tệp thì bị từ chối', async () => {
    await dungDuLieuMau()
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    noiDung.players[0].teamId = 'doi-khong-ton-tai'
    await expect(
      backup.importAll(new Blob([JSON.stringify(noiDung)]), 'thay-the'),
    ).rejects.toMatchObject({ ma: 'SchemaInvalid' })
  })

  it('hai cầu thủ cùng số áo trong một đội thì bị từ chối', async () => {
    await dungDuLieuMau()
    const noiDung = JSON.parse(await (await backup.exportAll()).text())
    const nhanBan = { ...noiDung.players[0], id: 'cau-thu-2' }
    noiDung.players.push(nhanBan)
    await expect(
      backup.importAll(new Blob([JSON.stringify(noiDung)]), 'thay-the'),
    ).rejects.toMatchObject({ ma: 'SchemaInvalid' })
  })

  it('tệp từ bản ứng dụng mới hơn thì ném VersionTooNew', async () => {
    const tep = new Blob([
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION + 1,
        exportedAt: 'x',
        teams: [],
        players: [],
        images: [],
      }),
    ])
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'VersionTooNew',
    })
  })
})

describe('xem trước tệp trước khi chọn chế độ (AC-4.6)', () => {
  it('inspect trả số đội, số cầu thủ, số ảnh và phiên bản', async () => {
    await dungDuLieuMau()
    const tep = await backup.exportAll()
    expect(await backup.inspect(tep)).toMatchObject({
      schemaVersion: SCHEMA_VERSION,
      soDoi: 1,
      soCauThu: 1,
      soAnh: 1,
    })
  })

  it('inspect KHÔNG thay đổi dữ liệu đang có', async () => {
    await dungDuLieuMau('Đội đang có')
    const tep = await backup.exportAll()
    const truoc = await demTatCa()

    await backup.inspect(tep)
    expect(await demTatCa()).toEqual(truoc)
  })

  it('inspect với tệp hỏng cũng báo lỗi như khi nhập', async () => {
    await expect(
      backup.inspect(new Blob(['khong phai json'])),
    ).rejects.toMatchObject({ ma: 'NotJson' })
  })
})

describe('chế độ gộp giữ cả hai khi trùng (AC-4.6, spec mục 5)', () => {
  it('gộp tệp có đội trùng tên thì giữ CẢ HAI đội', async () => {
    await dungDuLieuMau('Sông Lam')
    const tep = await backup.exportAll()

    const baoCao = await backup.importAll(tep, 'gop')
    expect(baoCao.cheDo).toBe('gop')

    const db = await moDb()
    const ten = (await db.getAll('teams')).map((d) => d.name)
    expect(ten).toEqual(['Sông Lam', 'Sông Lam'])
    expect(await db.count('players')).toBe(2)
    expect(await db.count('images')).toBe(2)
  })

  it('gộp đánh id mới nên không ghi đè bản ghi nào đang có', async () => {
    const mau = await dungDuLieuMau('Đội gốc')
    const tep = await backup.exportAll()

    await backup.importAll(tep, 'gop')

    const db = await moDb()
    // Bản ghi gốc vẫn còn nguyên với đúng id cũ
    expect(await db.get('teams', mau.doi.id)).toMatchObject({
      name: 'Đội gốc',
    })
    expect(await db.get('players', mau.cauThu.id)).toBeDefined()
    expect(await db.get('images', mau.anhId)).toBeDefined()
  })

  it('cầu thủ gộp vào trỏ đúng đội mới, không trỏ sang đội cũ', async () => {
    const mau = await dungDuLieuMau('Đội gốc')
    const tep = await backup.exportAll()
    await backup.importAll(tep, 'gop')

    const db = await moDb()
    const cauThu = await db.getAll('players')
    const doiCuaCauThu = cauThu.map((p) => p.teamId)

    expect(new Set(doiCuaCauThu).size).toBe(2)
    expect(doiCuaCauThu).toContain(mau.doi.id)
  })

  it('gộp nhiều lần thì cộng dồn, không mất lần nào', async () => {
    await dungDuLieuMau('Đội gốc')
    const tep = await backup.exportAll()

    await backup.importAll(tep, 'gop')
    await backup.importAll(tep, 'gop')

    expect(await demTatCa()).toEqual({ teams: 3, players: 3, images: 3 })
  })
})
