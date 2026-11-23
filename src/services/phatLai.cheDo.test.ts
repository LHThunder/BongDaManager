import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import {
  buocTiep,
  CHE_DO_MAC_DINH,
  dongSuKien,
  taoTran,
  tongPhutTran,
} from '../engine/tran'
import { dungBaoCao } from '../engine/baoCao'
import type { AnhChupDoi, TranDaLuu } from '../storage/db'
import { cauHinhTuBanGhi, dangKyDeLuu } from './phatLai'

/*
  Chế độ mô phỏng đi qua đường DỰNG LẠI CẤU HÌNH TỪ BẢN GHI (T705 của spec
  007, D122).

  Vì sao file này tồn tại thay vì thêm ca vào `phatLai.test.ts`: file ấy nằm
  trong ba file mà `plan.md` mục 7 tuyên **0 dòng sửa** — nó là một trong ba
  lưới giữ AC-45.2, và sửa nó là tự bỏ lưới. Hiến pháp mục 4 thì bắt buộc unit
  test cho lớp đọc/ghi dữ liệu, nên ca mới phải có nhà riêng.

  Bản ghi ở đây được dựng từ một trận CHẠY THẬT, đúng lý lẽ mà
  `phatLai.test.ts` đã viết: một `TranDaLuu` viết tay sẽ xanh kể cả khi lớp lưu
  trữ đánh mất một trường mà phát lại cần.
*/

function anhChup(teamId: string): AnhChupDoi {
  return {
    teamId,
    ten: teamId,
    mauChinh: '#334155',
    mauPhu: '#f8fafc',
    logoImageId: null,
  }
}

/** Một bản ghi thật, chạy hết trận rồi gói lại như ứng dụng lưu. */
function banGhiThat(maTran: string): TranDaLuu {
  let tt = taoTran(cauHinhMau(maTran))
  const chanCung = tongPhutTran(tt) + 2
  for (let i = 0; i < chanCung && !tt.ketThuc; i += 1) tt = buocTiep(tt)

  return {
    id: `luu-${maTran}`,
    maTran: tt.maTran,
    phienBanEngine: tt.phienBanEngine,
    ketThucLuc: 0,
    tiSo: tt.tiSo,
    quanSo: tt.quanSo,
    thoiLuong: tt.thoiLuong,
    doiChuNha: anhChup(tt.ben.nha.teamId),
    doiKhach: anhChup(tt.ben.khach.teamId),
    sanTrungLap: tt.sanTrungLap,
    doiCuaNguoiDung: tt.doiCuaNguoiDung,
    nha: dangKyDeLuu(tt.ben.nha),
    khach: dangKyDeLuu(tt.ben.khach),
    canThiep: tt.canThiep,
    cacSuKien: dongSuKien(tt),
    baoCao: dungBaoCao(tt),
  }
}

const MA = MA_TRAN_CO_DINH[0]!

describe('cauHinhTuBanGhi mang chế độ (T705, AC-45.1 + AC-45.2)', () => {
  it('truyền chế độ nào thì cấu hình mang chế độ ấy', () => {
    const banGhi = banGhiThat(MA)
    for (const cheDo of ['co-dien', 'lien-tuc'] as const) {
      expect(cauHinhTuBanGhi(banGhi, cheDo).cheDoMoPhong, cheDo).toBe(cheDo)
    }
  })

  it('không truyền thì điền mặc định — bản ghi cũ không có trường ấy (P7)', () => {
    const banGhi = banGhiThat(MA)
    expect(cauHinhTuBanGhi(banGhi).cheDoMoPhong).toBe(CHE_DO_MAC_DINH)
    expect(cauHinhTuBanGhi(banGhi).cheDoMoPhong).toBe('co-dien')
  })

  it('và nó không làm rơi một trường nào khác của bản ghi', () => {
    const banGhi = banGhiThat(MA)
    const cauHinh = cauHinhTuBanGhi(banGhi, 'lien-tuc')

    expect(cauHinh.maTran).toBe(banGhi.maTran)
    expect(cauHinh.quanSo).toBe(banGhi.quanSo)
    expect(cauHinh.thoiLuong).toBe(banGhi.thoiLuong)
    expect(cauHinh.sanTrungLap).toBe(banGhi.sanTrungLap)
    expect(cauHinh.doiCuaNguoiDung).toBe(banGhi.doiCuaNguoiDung)
    expect(cauHinh.nha.teamId).toBe(banGhi.nha.teamId)
    expect(cauHinh.khach.teamId).toBe(banGhi.khach.teamId)
  })

  /*
    Bản ghi chưa mang chế độ ở T705 — `TomTatTran` nhận trường ấy ở **T708**.
    Phép kiểm này ghi lại đúng trạng thái hôm nay, và nó CỐ Ý sẽ phải đọc lại
    khi T708 đến: lúc ấy `cheDoCua(tran)` mới là nguồn, và chỗ gọi thôi phải
    tự biết chế độ.
  */
  it('hôm nay bản ghi KHÔNG mang chế độ — nguồn là chỗ gọi, tới T708 mới đổi', () => {
    const banGhi = banGhiThat(MA)
    expect(Object.keys(banGhi)).not.toContain('cheDoMoPhong')
  })
})
