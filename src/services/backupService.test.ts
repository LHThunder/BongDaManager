import 'fake-indexeddb/auto'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
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

const BYTE_ANH = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])

async function dungDuLieuMau(tenDoi = 'Đội A') {
  const db = await moDb()
  const anhId = crypto.randomUUID()
  await db.put('images', {
    id: anhId,
    blob: new Blob([BYTE_ANH], { type: 'image/jpeg' }),
    width: 64,
    height: 64,
    byteSize: BYTE_ANH.length,
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

// --- trợ giúp đọc/ghi tệp ---------------------------------------------------

async function docZip(tep: Blob): Promise<Record<string, Uint8Array>> {
  return unzipSync(new Uint8Array(await tep.arrayBuffer()))
}

async function docManifest(tep: Blob): Promise<Record<string, never>> {
  const muc = await docZip(tep)
  const m = muc[backup.TEN_MANIFEST]
  if (!m) throw new Error('tệp không có manifest')
  return JSON.parse(strFromU8(m))
}

function taoZip(
  manifest: unknown,
  anh: Record<string, Uint8Array> = {},
): Blob {
  return new Blob(
    [
      zipSync({
        [backup.TEN_MANIFEST]: strToU8(JSON.stringify(manifest)),
        ...anh,
      }),
    ],
    { type: 'application/zip' },
  )
}

/** Dựng một tệp theo ĐỊNH DẠNG CŨ v1 (JSON thuần, ảnh base64) từ database. */
async function taoTepV1(): Promise<Blob> {
  const db = await moDb()
  const teams = await db.getAll('teams')
  const players = await db.getAll('players')
  const images = await db.getAll('images')

  const sangBase64 = async (blob: Blob): Promise<string> => {
    const by = new Uint8Array(await blob.arrayBuffer())
    let s = ''
    for (const b of by) s += String.fromCharCode(b)
    return btoa(s)
  }

  return new Blob(
    [
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        teams,
        players,
        images: await Promise.all(
          images.map(async (a) => ({
            id: a.id,
            mime: a.blob.type || 'image/jpeg',
            data: await sangBase64(a.blob),
          })),
        ),
      }),
    ],
    { type: 'application/json' },
  )
}

// ---------------------------------------------------------------------------

describe('xuất tệp ZIP (AC-4.3)', () => {
  it('xuất ra một tệp ZIP duy nhất có manifest và thư mục ảnh', async () => {
    await dungDuLieuMau()
    const tep = await backup.exportAll()

    expect(tep.type).toBe('application/zip')
    const muc = await docZip(tep)
    expect(Object.keys(muc)).toContain(backup.TEN_MANIFEST)
    expect(Object.keys(muc).filter((k) => k.startsWith('images/'))).toHaveLength(
      1,
    )
  })

  it('manifest khai phiên bản 2 và có đủ ba phần', async () => {
    await dungDuLieuMau()
    const m = (await docManifest(await backup.exportAll())) as unknown as {
      schemaVersion: number
      teams: unknown[]
      players: unknown[]
      images: { id: string; mime: string; duongDan: string; data?: string }[]
    }
    expect(m.schemaVersion).toBe(2)
    expect(m.teams).toHaveLength(1)
    expect(m.players).toHaveLength(1)
    expect(m.images).toHaveLength(1)
  })

  it('manifest KHÔNG còn trường base64 nào', async () => {
    await dungDuLieuMau()
    const tep = await backup.exportAll()
    const muc = await docZip(tep)
    const chuoiManifest = strFromU8(muc[backup.TEN_MANIFEST] as Uint8Array)

    expect(chuoiManifest).not.toContain('"data"')
    expect(chuoiManifest).toContain('"duongDan"')
  })

  it('byte ảnh trong ZIP khớp từng byte với blob trong database', async () => {
    await dungDuLieuMau()
    const tep = await backup.exportAll()
    const muc = await docZip(tep)
    const duongDanAnh = Object.keys(muc).find((k) => k.startsWith('images/'))
    expect(duongDanAnh).toBeDefined()
    expect([...(muc[duongDanAnh as string] as Uint8Array)]).toEqual([
      ...BYTE_ANH,
    ])
  })

  it('đường dẫn ảnh có đuôi theo kiểu ảnh, để mở ZIP ra xem được', async () => {
    await dungDuLieuMau()
    const muc = await docZip(await backup.exportAll())
    expect(
      Object.keys(muc).some((k) => k.startsWith('images/') && k.endsWith('.jpg')),
    ).toBe(true)
  })

  it('database rỗng thì vẫn xuất được tệp ZIP hợp lệ', async () => {
    const tep = await backup.exportAll()
    const m = (await docManifest(tep)) as unknown as { teams: unknown[] }
    expect(m.teams).toEqual([])
    expect(await backup.inspect(await backup.exportAll())).toMatchObject({
      soDoi: 0,
      soCauThu: 0,
      soAnh: 0,
    })
  })

  it('tên tệp có đuôi .zip và có ngày giờ', () => {
    expect(backup.tenTepSaoLuu(new Date(2026, 9, 27, 8, 5))).toBe(
      'bongda-20261027-0805.zip',
    )
  })

  /*
    Đây là lý do tồn tại của cả Phase 6: ở mốc dữ liệu spec cam kết, tệp v1 là
    43,7MB vì base64 phình 4/3 ở phần ảnh. Test này giữ cho định dạng mới
    không bao giờ to hơn định dạng cũ.
  */
  it('tệp ZIP NHỎ HƠN tệp JSON base64 của cùng dữ liệu', async () => {
    const db = await moDb()
    const to = new Uint8Array(40_000).map((_, i) => (i * 7) % 251)
    await db.put('images', {
      id: 'anh-to',
      blob: new Blob([to], { type: 'image/jpeg' }),
      width: 256,
      height: 256,
      byteSize: to.length,
    })
    await teamRepo.create({ name: 'Đội A', logoImageId: 'anh-to' })

    const zip = await backup.exportAll()
    const json = await taoTepV1()

    expect(zip.size).toBeLessThan(json.size)
    expect(zip.size).toBeLessThan(to.length * 1.2)
  })
})

describe('kích thước ước tính (AC-4.8)', () => {
  it('tính được mà không dựng tệp', async () => {
    expect(await backup.uocTinhKichThuoc()).toBeGreaterThan(0)
  })

  it('ước tính không còn cộng thêm phần phình 4/3 của base64', async () => {
    const db = await moDb()
    const co = 60_000
    await db.put('images', {
      id: crypto.randomUUID(),
      blob: new Blob([new Uint8Array(co)], { type: 'image/jpeg' }),
      width: 256,
      height: 256,
      byteSize: co,
    })
    const uocTinh = await backup.uocTinhKichThuoc()

    expect(uocTinh).toBeGreaterThan(co)
    // Công thức cũ sẽ ra ít nhất co * 4/3 = 80.000
    expect(uocTinh).toBeLessThan(co * 4 / 3)
  })
})

describe('nhập lại đúng dữ liệu đã xuất (AC-4.4)', () => {
  it('vòng tròn xuất rồi nhập cho ra dữ liệu bằng chính nó, kể cả ảnh', async () => {
    const mau = await dungDuLieuMau()
    const tep = await backup.exportAll()

    await dongDb()
    await xoaDatabase()
    expect(await demTatCa()).toEqual({ teams: 0, players: 0, images: 0 })

    const baoCao = await backup.importAll(tep, 'thay-the')
    expect(baoCao).toMatchObject({ cheDo: 'thay-the', soDoi: 1, soCauThu: 1 })

    const db = await moDb()
    expect(await db.get('teams', mau.doi.id)).toMatchObject({
      name: 'Đội A',
      logoImageId: mau.anhId,
    })
    const cauThu = await db.get('players', mau.cauThu.id)
    expect(cauThu).toMatchObject({ shirtNumber: 7, positions: ['DC', 'DM'] })
    expect(cauThu?.attributes).toEqual(mau.cauThu.attributes)

    const anh = await db.get('images', mau.anhId)
    expect([
      ...new Uint8Array((await anh?.blob.arrayBuffer()) as ArrayBuffer),
    ]).toEqual([...BYTE_ANH])
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
    expect((await db.getAll('teams')).map((d) => d.name)).toEqual(['Đội cũ'])
  })
})

describe('tương thích ngược với tệp v1 (hiến pháp P7)', () => {
  it('nhập tệp v1 JSON base64 vẫn ra đúng dữ liệu, kể cả ảnh', async () => {
    const mau = await dungDuLieuMau('Đội từ tệp cũ')
    const tepV1 = await taoTepV1()

    await dongDb()
    await xoaDatabase()

    const baoCao = await backup.importAll(tepV1, 'thay-the')
    expect(baoCao).toMatchObject({ soDoi: 1, soCauThu: 1, soAnh: 1 })

    const db = await moDb()
    expect(await db.get('teams', mau.doi.id)).toMatchObject({
      name: 'Đội từ tệp cũ',
    })
    const anh = await db.get('images', mau.anhId)
    expect([
      ...new Uint8Array((await anh?.blob.arrayBuffer()) as ArrayBuffer),
    ]).toEqual([...BYTE_ANH])
  })

  it('inspect tệp v1 báo đúng phiên bản 1 và đúng số lượng', async () => {
    await dungDuLieuMau()
    const tepV1 = await taoTepV1()
    expect(await backup.inspect(tepV1)).toMatchObject({
      schemaVersion: 2, // manifest đã được nâng lên hình dạng hiện tại
      soDoi: 1,
      soCauThu: 1,
      soAnh: 1,
    })
  })

  it('nhận dạng theo NỘI DUNG, không theo tên tệp', async () => {
    await dungDuLieuMau()
    const v1 = await taoTepV1()
    const v2 = await backup.exportAll()

    // Tệp v1 bị đặt tên .zip, và tệp v2 bị đặt tên .json
    const v1DoiTen = new File([v1], 'bongda.zip', { type: 'application/zip' })
    const v2DoiTen = new File([v2], 'bongda.json', {
      type: 'application/json',
    })

    await expect(backup.inspect(v1DoiTen)).resolves.toMatchObject({ soDoi: 1 })
    await expect(backup.inspect(v2DoiTen)).resolves.toMatchObject({ soDoi: 1 })
  })

  it('tệp v1 có base64 hỏng bị bắt trước khi ghi', async () => {
    await dungDuLieuMau()
    const noiDung = JSON.parse(await (await taoTepV1()).text())
    noiDung.images[0].data = '!!!khong-the-giai-ma!!!'

    const truoc = await demTatCa()
    await expect(
      backup.importAll(new Blob([JSON.stringify(noiDung)]), 'thay-the'),
    ).rejects.toBeDefined()
    expect(await demTatCa()).toEqual(truoc)
  })

  it('tệp JSON thuần khai phiên bản 2 bị từ chối, vì v2 phải là ZIP', async () => {
    const tep = new Blob([
      JSON.stringify({
        schemaVersion: 2,
        exportedAt: 'x',
        teams: [],
        players: [],
        images: [],
      }),
    ])
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
    })
  })
})

describe('tính TẤT CẢ-HOẶC-KHÔNG-GÌ (AC-4.5, hiến pháp P3)', () => {
  it('tệp lỗi ở BẢN GHI CUỐI thì dữ liệu cũ còn nguyên 100%', async () => {
    // Dựng một tệp HỢP LỆ của dữ liệu khác, rồi làm hỏng bản ghi CUỐI CÙNG.
    await dungDuLieuMau('Đội trong tệp')
    await dungDuLieuMau('Đội trong tệp 2')
    const tepGoc = await backup.exportAll()
    const muc = await docZip(tepGoc)
    const manifest = JSON.parse(
      strFromU8(muc[backup.TEN_MANIFEST] as Uint8Array),
    )
    manifest.players[manifest.players.length - 1].positions = ['KHONG_CO_THAT']

    const anh: Record<string, Uint8Array> = {}
    for (const [k, v] of Object.entries(muc)) {
      if (k !== backup.TEN_MANIFEST) anh[k] = v
    }
    const tepHong = taoZip(manifest, anh)

    // Dựng lại trạng thái "dữ liệu đang có trên máy người dùng"
    await dongDb()
    await xoaDatabase()
    const dangCo = await dungDuLieuMau('Đội đang có')
    const truoc = await demTatCa()

    await expect(backup.importAll(tepHong, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
    })

    expect(await demTatCa()).toEqual(truoc)
    const db = await moDb()
    expect((await db.getAll('teams')).map((d) => d.name)).toEqual([
      'Đội đang có',
    ])
    expect(await db.get('players', dangCo.cauThu.id)).toBeDefined()
    expect(await db.get('images', dangCo.anhId)).toBeDefined()
  })

  it('manifest trỏ tới ảnh KHÔNG có trong ZIP thì bị từ chối, không ghi gì', async () => {
    await dungDuLieuMau('Đội đang có')
    const truoc = await demTatCa()

    // ZIP chỉ có manifest, thiếu hẳn mục ảnh
    const tepThieuAnh = taoZip({
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      teams: [],
      players: [],
      images: [
        { id: 'a', mime: 'image/jpeg', duongDan: 'images/a.jpg' },
      ],
    })

    await expect(
      backup.importAll(tepThieuAnh, 'thay-the'),
    ).rejects.toMatchObject({ ma: 'SchemaInvalid' })
    expect(await demTatCa()).toEqual(truoc)
  })

  it('chế độ gộp với tệp lỗi cũng không ghi gì', async () => {
    await dungDuLieuMau('Đội đang có')
    const truoc = await demTatCa()

    const tepHong = taoZip({
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      teams: [{ id: 'a', name: 'X', logoImageId: null, primaryColor: 'đỏ' }],
      players: [],
      images: [],
    })

    await expect(backup.importAll(tepHong, 'gop')).rejects.toBeDefined()
    expect(await demTatCa()).toEqual(truoc)
  })
})

describe('tệp không dùng được (AC-4.5)', () => {
  it('tệp không phải JSON cũng không phải ZIP thì ném NotJson', async () => {
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

  it('ZIP thiếu manifest.json thì ném SchemaInvalid, nêu đúng tên tệp thiếu', async () => {
    const tep = new Blob([zipSync({ 'ghichu.txt': strToU8('xin chao') })])
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
      chiTiet: { duongDan: backup.TEN_MANIFEST },
    })
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
    const tep = taoZip({
      schemaVersion: 2,
      exportedAt: 'hôm nay',
      teams: [{ id: 'a', name: 'X', logoImageId: null, primaryColor: 'đỏ' }],
      players: [],
      images: [],
    })
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'SchemaInvalid',
      chiTiet: { duongDan: expect.stringContaining('teams') },
    })
  })

  it('cầu thủ trỏ tới đội không có trong tệp thì bị từ chối', async () => {
    await dungDuLieuMau()
    const muc = await docZip(await backup.exportAll())
    const manifest = JSON.parse(
      strFromU8(muc[backup.TEN_MANIFEST] as Uint8Array),
    )
    manifest.players[0].teamId = 'doi-khong-ton-tai'
    await expect(
      backup.importAll(taoZip(manifest), 'thay-the'),
    ).rejects.toMatchObject({ ma: 'SchemaInvalid' })
  })

  it('hai cầu thủ cùng số áo trong một đội thì bị từ chối', async () => {
    await dungDuLieuMau()
    const muc = await docZip(await backup.exportAll())
    const manifest = JSON.parse(
      strFromU8(muc[backup.TEN_MANIFEST] as Uint8Array),
    )
    manifest.players.push({ ...manifest.players[0], id: 'cau-thu-2' })
    await expect(
      backup.importAll(taoZip(manifest), 'thay-the'),
    ).rejects.toMatchObject({ ma: 'SchemaInvalid' })
  })

  it('tệp từ bản ứng dụng mới hơn thì ném VersionTooNew', async () => {
    const tep = taoZip({
      schemaVersion: SCHEMA_VERSION + 1,
      exportedAt: 'x',
      teams: [],
      players: [],
      images: [],
    })
    await expect(backup.importAll(tep, 'thay-the')).rejects.toMatchObject({
      ma: 'VersionTooNew',
    })
  })
})

describe('xem trước tệp trước khi chọn chế độ (AC-4.6)', () => {
  it('inspect trả số đội, số cầu thủ, số ảnh và phiên bản', async () => {
    await dungDuLieuMau()
    expect(await backup.inspect(await backup.exportAll())).toMatchObject({
      schemaVersion: 2,
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

    expect((await backup.importAll(tep, 'gop')).cheDo).toBe('gop')

    const db = await moDb()
    expect((await db.getAll('teams')).map((d) => d.name)).toEqual([
      'Sông Lam',
      'Sông Lam',
    ])
    expect(await db.count('players')).toBe(2)
    expect(await db.count('images')).toBe(2)
  })

  it('gộp đánh id mới nên không ghi đè bản ghi nào đang có', async () => {
    const mau = await dungDuLieuMau('Đội gốc')
    await backup.importAll(await backup.exportAll(), 'gop')

    const db = await moDb()
    expect(await db.get('teams', mau.doi.id)).toMatchObject({ name: 'Đội gốc' })
    expect(await db.get('players', mau.cauThu.id)).toBeDefined()
    expect(await db.get('images', mau.anhId)).toBeDefined()
  })

  it('gộp tệp v1 cũ cũng đánh id mới, không ghi đè', async () => {
    const mau = await dungDuLieuMau('Đội gốc')
    await backup.importAll(await taoTepV1(), 'gop')

    const db = await moDb()
    expect(await db.count('teams')).toBe(2)
    expect(await db.get('teams', mau.doi.id)).toMatchObject({ name: 'Đội gốc' })
  })

  it('gộp nhiều lần thì cộng dồn, không mất lần nào', async () => {
    await dungDuLieuMau('Đội gốc')
    const tep = await backup.exportAll()

    await backup.importAll(tep, 'gop')
    await backup.importAll(tep, 'gop')

    expect(await demTatCa()).toEqual({ teams: 3, players: 3, images: 3 })
  })
})
