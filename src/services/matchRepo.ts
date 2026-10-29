import { moDb, type TomTatTran, type TranDaLuu } from '../storage/db'
import { chuanHoaLoiLuuTru } from './errors'

/*
  Lịch sử trận đấu (AC-11.7, quyết định D44, D44b, D45).

  Ba điều quan trọng nhất của file này:

  1. Ghi trận mới VÀ xoá trận cũ nhất nằm trong CÙNG một transaction. Xoá
     trước rồi ghi mà ghi lỗi thì người dùng mất một trận cũ và không được gì
     thêm — P3 đòi tất-cả-hoặc-không-gì.

  2. Hai store `matches` và `matchSummaries` cũng được ghi trong cùng
     transaction đó, nên chúng không bao giờ lệch nhau.

  3. `danhSach` chỉ đọc store NHẸ. IndexedDB giải tuần tự cả hàng, nên đọc
     store nặng để dựng danh sách là kéo hàng trăm KB dòng sự kiện chỉ để in
     ra 20 cái tỉ số.
*/

export const SO_TRAN_GIU_LAI = 20

export interface KetQuaLuuTran {
  /** Id những trận bị loại khỏi lịch sử để giữ trần 20 (spec mục 5). */
  readonly daLoaiBo: readonly string[]
}

/**
 * Lưu một trận đã kết thúc, rồi cắt lịch sử còn `SO_TRAN_GIU_LAI` trận mới
 * nhất.
 */
export async function luu(tran: TranDaLuu): Promise<KetQuaLuuTran> {
  try {
    const db = await moDb()
    const tx = db.transaction(['matches', 'matchSummaries'], 'readwrite')
    const nang = tx.objectStore('matches')
    const nhe = tx.objectStore('matchSummaries')

    await nang.put(tran)
    await nhe.put(tomTatCua(tran))

    const daLoaiBo = await catTrongTx(nhe, nang)
    await tx.done
    return { daLoaiBo }
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Cắt lịch sử còn 20 trận mới nhất.
 *
 * Dùng sau khi NHẬP GỘP một tệp sao lưu: gộp 20 trận vào máy đang có 20 trận
 * ra 40, mà AC-11.7 nói lịch sử giữ 20 (quyết định D48).
 */
export async function catConHaiMuoi(): Promise<KetQuaLuuTran> {
  try {
    const db = await moDb()
    const tx = db.transaction(['matches', 'matchSummaries'], 'readwrite')
    const daLoaiBo = await catTrongTx(
      tx.objectStore('matchSummaries'),
      tx.objectStore('matches'),
    )
    await tx.done
    return { daLoaiBo }
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** 20 trận gần nhất, mới nhất trước. Chỉ đọc store nhẹ (D44b). */
export async function danhSach(): Promise<readonly TomTatTran[]> {
  try {
    const db = await moDb()
    const cac = await db.getAllFromIndex('matchSummaries', 'byKetThucLuc')
    return cac.reverse()
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Một trận đầy đủ, chỉ đọc khi người dùng thật sự mở nó ra. */
export async function doc(id: string): Promise<TranDaLuu | null> {
  try {
    const db = await moDb()
    return (await db.get('matches', id)) ?? null
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Xoá mọi trận có một đội nào đó — **CỐ TÌNH KHÔNG GỌI Ở ĐÂU**.
 *
 * Mục 5 của spec nói xoá đội thì trận cũ **vẫn xem lại được với tên đội lúc
 * đó**. Hàm này được khai ra để lần sau không ai "tiện tay" dọn lịch sử khi
 * xoá đội và tưởng đó là việc đúng; có test khẳng định xoá đội không làm mất
 * trận nào.
 */
export async function xoaTheoDoi(teamId: string): Promise<void> {
  const db = await moDb()
  const tx = db.transaction(['matches', 'matchSummaries'], 'readwrite')
  for (const tomTat of await tx.objectStore('matchSummaries').getAll()) {
    if (
      tomTat.doiChuNha.teamId !== teamId &&
      tomTat.doiKhach.teamId !== teamId
    ) {
      continue
    }
    await tx.objectStore('matches').delete(tomTat.id)
    await tx.objectStore('matchSummaries').delete(tomTat.id)
  }
  await tx.done
}

export function tomTatCua(tran: TranDaLuu): TomTatTran {
  return {
    id: tran.id,
    maTran: tran.maTran,
    phienBanEngine: tran.phienBanEngine,
    ketThucLuc: tran.ketThucLuc,
    tiSo: tran.tiSo,
    doiChuNha: tran.doiChuNha,
    doiKhach: tran.doiKhach,
  }
}

/** Phần cắt dùng chung, chạy BÊN TRONG một transaction đang mở. */
async function catTrongTx(
  nhe: {
    getAll: () => Promise<TomTatTran[]>
    delete: (id: string) => Promise<void>
  },
  nang: { delete: (id: string) => Promise<void> },
): Promise<readonly string[]> {
  const cac = await nhe.getAll()
  if (cac.length <= SO_TRAN_GIU_LAI) return []

  // Cũ nhất trước, rồi bỏ đi phần vượt trần.
  const theoThoiGian = [...cac].sort((a, b) => a.ketThucLuc - b.ketThucLuc)
  const loaiBo = theoThoiGian.slice(0, cac.length - SO_TRAN_GIU_LAI)

  for (const x of loaiBo) {
    await nang.delete(x.id)
    await nhe.delete(x.id)
  }
  return loaiBo.map((x) => x.id)
}

export type LyDoKhongDauLai = 'khac-phien-ban-engine' | 'doi-da-bi-xoa'

/**
 * Trận này có đấu lại được không, và nếu không thì vì sao (quyết định D35).
 *
 * "Đấu lại" ở đây nghĩa là CHẠY LẠI engine, khác hẳn với "xem lại" — xem lại
 * luôn làm được vì bản ghi mang theo dòng sự kiện đầy đủ.
 *
 * Hai lý do từ chối, hai chuyện khác nhau:
 *   - khác phiên bản engine: chạy lại cùng mã trận sẽ ra một trận KHÁC, nên
 *     hứa "đấu lại" là hứa sai;
 *   - đội đã bị xoá: không còn hồ sơ để dựng lại cặp đấu (spec mục 5).
 */
export function lyDoKhongDauLai(
  tran: TomTatTran,
  phienBanEngineHienTai: number,
  teamIdConTonTai: (teamId: string) => boolean,
): LyDoKhongDauLai | null {
  if (tran.phienBanEngine !== phienBanEngineHienTai) {
    return 'khac-phien-ban-engine'
  }
  if (
    !teamIdConTonTai(tran.doiChuNha.teamId) ||
    !teamIdConTonTai(tran.doiKhach.teamId)
  ) {
    return 'doi-da-bi-xoa'
  }
  return null
}
