import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import { dungBaoCao } from '../engine/baoCao'
import {
  chayHetTran,
  dangKyTuTrangThai,
  dongSuKien,
  taoTran,
  type TrangThaiTran,
} from '../engine/tran'
import { DB_NAME, dongDb, type AnhChupDoi, type TranDaLuu } from '../storage/db'
import * as matchRepo from './matchRepo'

/*
  Lịch sử trận đấu (AC-11.7, quyết định D44, D44b, D45).

  Ba thứ phải đúng, và cả ba đều là chuyện mất dữ liệu nếu sai:
    - giữ đúng 20 trận, loại đúng trận CŨ NHẤT;
    - hai store không bao giờ lệch nhau;
    - xoá đội KHÔNG làm mất trận cũ (spec mục 5).
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

function anhChup(teamId: string, ten: string): AnhChupDoi {
  return {
    teamId,
    ten,
    mauChinh: '#1d4ed8',
    mauPhu: '#f8fafc',
    logoImageId: null,
  }
}

/** Dựng một bản ghi trận từ một trận đã chạy thật. */
function tranDaLuu(
  tt: TrangThaiTran,
  id: string,
  ketThucLuc: number,
): TranDaLuu {
  return {
    id,
    maTran: tt.maTran,
    phienBanEngine: tt.phienBanEngine,
    ketThucLuc,
    tiSo: tt.tiSo,
    doiChuNha: anhChup(tt.ben.nha.teamId, 'Đội Nhà'),
    doiKhach: anhChup(tt.ben.khach.teamId, 'Đội Khách'),
    sanTrungLap: tt.sanTrungLap,
    doiCuaNguoiDung: tt.doiCuaNguoiDung,
    nha: dangKyTuTrangThai(tt.ben.nha),
    khach: dangKyTuTrangThai(tt.ben.khach),
    canThiep: tt.canThiep,
    cacSuKien: dongSuKien(tt),
    baoCao: dungBaoCao(tt),
  }
}

function tranThu(i: number): TranDaLuu {
  const ma = MA_TRAN_CO_DINH[i % MA_TRAN_CO_DINH.length]
  const tt = chayHetTran(taoTran(cauHinhMau(ma)))
  // Mốc thời gian tăng dần để "cũ nhất" là một khái niệm xác định.
  return tranDaLuu(tt, `tran-${String(i).padStart(3, '0')}`, 1_000 + i)
}

describe('vòng tròn lưu và đọc', () => {
  it('đọc lại ra đúng từng dòng sự kiện', async () => {
    const goc = tranThu(0)
    await matchRepo.luu(goc)

    const doc = await matchRepo.doc(goc.id)
    expect(doc).not.toBeNull()
    expect(doc?.cacSuKien).toEqual(goc.cacSuKien)
    expect(doc?.baoCao).toEqual(goc.baoCao)
    expect(doc?.tiSo).toEqual(goc.tiSo)
  })

  it('đọc một id không có thì trả về null, không ném lỗi', async () => {
    expect(await matchRepo.doc('khong-co')).toBeNull()
  })

  it('danh sách xếp mới nhất trước', async () => {
    for (let i = 0; i < 5; i += 1) await matchRepo.luu(tranThu(i))

    const ds = await matchRepo.danhSach()
    expect(ds.map((x) => x.id)).toEqual([
      'tran-004',
      'tran-003',
      'tran-002',
      'tran-001',
      'tran-000',
    ])
  })

  it('danh sách KHÔNG mang theo dòng sự kiện (quyết định D44b)', async () => {
    await matchRepo.luu(tranThu(0))
    const ds = await matchRepo.danhSach()

    expect(ds).toHaveLength(1)
    expect('cacSuKien' in ds[0]).toBe(false)
    expect('baoCao' in ds[0]).toBe(false)
  })
})

describe('giữ đúng 20 trận gần nhất (AC-11.7)', () => {
  it('lưu 21 trận thì còn 20, và trận CŨ NHẤT bị loại', async () => {
    for (let i = 0; i < 20; i += 1) await matchRepo.luu(tranThu(i))
    expect(await matchRepo.danhSach()).toHaveLength(20)

    const kq = await matchRepo.luu(tranThu(20))

    expect(kq.daLoaiBo).toEqual(['tran-000'])
    const ds = await matchRepo.danhSach()
    expect(ds).toHaveLength(20)
    expect(ds.map((x) => x.id)).not.toContain('tran-000')
    expect(ds[0].id).toBe('tran-020')
  })

  it('trận bị loại cũng mất khỏi store nặng, không để lại rác', async () => {
    for (let i = 0; i < 21; i += 1) await matchRepo.luu(tranThu(i))
    expect(await matchRepo.doc('tran-000')).toBeNull()
  })

  it('chưa đủ 20 thì không loại ai', async () => {
    for (let i = 0; i < 19; i += 1) {
      const kq = await matchRepo.luu(tranThu(i))
      expect(kq.daLoaiBo).toEqual([])
    }
  })

  it('hai store luôn khớp nhau về số lượng', async () => {
    for (let i = 0; i < 25; i += 1) await matchRepo.luu(tranThu(i))

    const ds = await matchRepo.danhSach()
    expect(ds).toHaveLength(20)
    for (const x of ds) {
      expect(await matchRepo.doc(x.id), x.id).not.toBeNull()
    }
  })
})

describe('cắt còn 20 sau khi nhập gộp (quyết định D48)', () => {
  it('gộp lên 30 trận rồi cắt thì còn đúng 20 trận mới nhất', async () => {
    /*
      Nhập gộp ghi thẳng vào database chứ không đi qua `luu`, nên lịch sử có
      thể vượt trần. `catConHaiMuoi` là đường dọn sau đó.
    */
    const db = await (await import('../storage/db')).moDb()
    for (let i = 0; i < 30; i += 1) {
      const t = tranThu(i)
      await db.put('matches', t)
      await db.put('matchSummaries', matchRepo.tomTatCua(t))
    }
    expect(await matchRepo.danhSach()).toHaveLength(30)

    const kq = await matchRepo.catConHaiMuoi()

    expect(kq.daLoaiBo).toHaveLength(10)
    const ds = await matchRepo.danhSach()
    expect(ds).toHaveLength(20)
    expect(ds[ds.length - 1].id).toBe('tran-010')
  })

  it('đang dưới trần thì không cắt gì', async () => {
    await matchRepo.luu(tranThu(0))
    expect((await matchRepo.catConHaiMuoi()).daLoaiBo).toEqual([])
  })
})

describe('xoá đội KHÔNG làm mất trận cũ (spec mục 5)', () => {
  /*
    `xoaTheoDoi` được khai ra nhưng cố tình không gọi ở đâu. Phép kiểm này
    tồn tại để lần sau không ai nối nó vào đường xoá đội và tưởng đó là việc
    đúng: mục 5 nói trận cũ vẫn phải xem lại được với tên đội lúc đó.
  */
  it('không chỗ nào trong services gọi xoaTheoDoi', async () => {
    const cacFile = import.meta.glob('./*.ts', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>

    for (const [ten, nguon] of Object.entries(cacFile)) {
      if (ten.includes('matchRepo')) continue
      expect(nguon.includes('xoaTheoDoi'), ten).toBe(false)
    }
  })

  it('ảnh chụp tên đội nằm trong bản ghi, nên trận cũ vẫn đọc được tên', async () => {
    const t = tranThu(0)
    await matchRepo.luu(t)

    const ds = await matchRepo.danhSach()
    expect(ds[0].doiChuNha.ten).toBe('Đội Nhà')
    expect(ds[0].doiKhach.ten).toBe('Đội Khách')
    // Và cả teamId, để còn phân giải tên MỚI khi đội vẫn tồn tại (AC-1.5).
    expect(ds[0].doiChuNha.teamId).toBe(t.nha.teamId)
  })
})

describe('bản ghi đủ để phát lại (AC-11.7 nối với AC-8.11)', () => {
  it('dựng lại trận từ bản ghi ra đúng từng dòng sự kiện', async () => {
    const goc = tranThu(0)
    await matchRepo.luu(goc)
    const daLuu = await matchRepo.doc(goc.id)
    if (!daLuu) throw new Error('phải đọc được trận vừa lưu')

    const phatLai = chayHetTran(
      taoTran({
        maTran: daLuu.maTran,
        sanTrungLap: daLuu.sanTrungLap,
        doiCuaNguoiDung: daLuu.doiCuaNguoiDung,
        nha: daLuu.nha,
        khach: daLuu.khach,
      }),
    )

    expect(phatLai.tiSo).toEqual(daLuu.tiSo)
    expect(dongSuKien(phatLai)).toEqual(daLuu.cacSuKien)
  })

  it('bản ghi mang phiên bản engine đã chạy nó', async () => {
    const goc = tranThu(0)
    await matchRepo.luu(goc)
    const ds = await matchRepo.danhSach()
    expect(ds[0].phienBanEngine).toBe(goc.phienBanEngine)
  })
})

/*
  Chặn đấu lại khi không còn đấu lại đúng được (quyết định D35, AC-11.7).

  Lịch sử trận đấu ra đời ở chính Giai đoạn 4, nên KHÔNG BAO GIỜ tồn tại một
  bản ghi thật mang phiên bản engine cũ — bản ghi ấy phải dựng tay ở đây. Đó
  cũng là lý do rủi ro R16 được hạ từ Cao xuống Trung bình: không có gì trong
  lịch sử bị hỏng, chỉ mã trận người dùng chép tay ra ngoài là hết phát lại
  đúng.
*/
describe('chặn đấu lại khi không còn đấu lại đúng được', () => {
  const conTonTai = () => true

  it('cùng phiên bản engine và hai đội còn sống thì đấu lại được', () => {
    const t = tranThu(0)
    expect(
      matchRepo.lyDoKhongDauLai(t, t.phienBanEngine, conTonTai),
    ).toBeNull()
  })

  it('khác phiên bản engine thì bị chặn, kèm đúng lý do', () => {
    const t = { ...tranThu(0), phienBanEngine: 1 }
    expect(matchRepo.lyDoKhongDauLai(t, 2, conTonTai)).toBe(
      'khac-phien-ban-engine',
    )
  })

  it('một đội đã bị xoá thì bị chặn, kèm đúng lý do', () => {
    const t = tranThu(0)
    const chiConDoiNha = (id: string) => id === t.doiChuNha.teamId
    expect(
      matchRepo.lyDoKhongDauLai(t, t.phienBanEngine, chiConDoiNha),
    ).toBe('doi-da-bi-xoa')
  })

  it('phiên bản engine xét TRƯỚC, vì nó đúng cho mọi trận trong tệp cũ', () => {
    const t = { ...tranThu(0), phienBanEngine: 1 }
    expect(matchRepo.lyDoKhongDauLai(t, 2, () => false)).toBe(
      'khac-phien-ban-engine',
    )
  })

  it('trận khác phiên bản vẫn ĐỌC LẠI được nguyên vẹn', async () => {
    const cu = { ...tranThu(0), id: 'tran-cu', phienBanEngine: 1 }
    await matchRepo.luu(cu)

    const daDoc = await matchRepo.doc('tran-cu')
    expect(daDoc?.cacSuKien).toEqual(cu.cacSuKien)
    expect(daDoc?.baoCao).toEqual(cu.baoCao)
  })
})
