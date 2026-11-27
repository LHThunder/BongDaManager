import { describe, expect, it } from 'vitest'
import { benMau, MAU_RONG, SO_MA_RONG } from './__fixtures__/doiMau'
import {
  chayHetTranLienTuc,
  taoTranLienTuc,
} from './lienTuc/tranLienTuc'
import { chayHetTran, taoTran, type CauHinhTran } from './tran'

/*
  ====================================================================
  AC-45.3 — HAI CHẾ ĐỘ, 200 MÃ, HAI NGƯỠNG (T751).
  ====================================================================

  AC-45.3 đúng từng chữ: *"hiệu số bàn thắng trung bình giữa hai chế độ PHẢI
  không lệch quá **0,5 bàn**, và tỉ lệ thắng của đội mạnh hơn PHẢI không lệch
  quá **10 điểm phần trăm**"* — trên **200 mã**, cùng hai đội, cùng chiến thuật.

  ⚠️ **VÌ SAO 200 CHỨ KHÔNG 100, VÀ ĐÓ LÀ MỘT SỐ ĐO CHỨ KHÔNG PHẢI MỘT SỞ
  THÍCH.** Bản Draft của spec viết 100 mã. Chính repo này đã đo nhiễu lấy mẫu
  **12 điểm phần trăm ở 60 mã** — lớn hơn ngưỡng 10 điểm mà AC đặt ra, tức ở
  mẫu nhỏ phép kiểm sẽ đỏ vì **nhiễu** chứ không vì mô hình. Người dùng nới mẫu
  ngày 2026-11-22 và **giữ nguyên hai ngưỡng**. Hai file `sosanh.*` cũ đã trả
  đúng cái giá ấy trước đó, và chú thích của chúng còn nguyên.

  ⚠️ **HAI CHẾ ĐỘ KHÔNG BẮT BUỘC RA CÙNG TỈ SỐ Ở MỘT TRẬN CỤ THỂ**, và AC nói
  thẳng điều đó. Chúng rút ngẫu nhiên ở **hai dòng cách nhau 2³⁰** (D118), nên
  đòi giống từng trận là đòi một điều không thể. Thứ AC đòi là hai **bảng thống
  kê** gần nhau — và chúng chỉ còn so được với nhau vì cả hai chế độ dùng
  **chung một mô hình xác suất** (`khongChepModel.test.ts` canh đúng điều đó).

  📏 **Cái giá đã đo trước khi viết file này:** v6 **9,0 ms** một trận, liên tục
  **100,0 ms** — tức 200 mã ở cả hai chế độ tốn **~22 giây**. Đắt, và nó được
  nói ra thay vì giấu: đó là lý do cả file chỉ đo **một lượt** rồi hai `it` đọc
  chung kết quả, chứ không mỗi `it` một lượt.
*/

/** Lệch tối đa của **hiệu số bàn thắng trung bình** giữa hai chế độ. */
const LECH_HIEU_SO_TOI_DA = 0.5

/** Lệch tối đa của **tỉ lệ thắng** của đội mạnh hơn, theo đơn vị tỉ lệ (0–1). */
const LECH_TI_LE_THANG_TOI_DA = 0.1

function cauHinh(maTran: string): CauHinhTran {
  return {
    maTran,
    nha: benMau('A', { chiSo: 15 }),
    khach: benMau('B', { chiSo: 10 }),
    sanTrungLap: true,
  }
}

interface Bang {
  readonly soTran: number
  readonly thang: number
  readonly hoa: number
  readonly thua: number
  readonly tiLeThang: number
  readonly hieuSoTrungBinh: number
  readonly tongBan: number
}

function dungBang(ketQua: readonly { nha: number; khach: number }[]): Bang {
  let thang = 0
  let hoa = 0
  let thua = 0
  let hieu = 0
  let tongBan = 0
  for (const ts of ketQua) {
    if (ts.nha > ts.khach) thang += 1
    else if (ts.nha === ts.khach) hoa += 1
    else thua += 1
    hieu += ts.nha - ts.khach
    tongBan += ts.nha + ts.khach
  }
  return {
    soTran: ketQua.length,
    thang,
    hoa,
    thua,
    tiLeThang: thang / ketQua.length,
    hieuSoTrungBinh: hieu / ketQua.length,
    tongBan,
  }
}

/*
  MỘT lượt đo cho CẢ HAI `it`.

  `vitest` chạy thân `describe` một lần, nên hai hằng dưới đây được tính đúng
  một lần dù có bao nhiêu `it` đọc chúng. Đo lại ở mỗi `it` là nhân đôi 22 giây
  để mua đúng không gì cả.
*/
const CO_DIEN = dungBang(
  MAU_RONG.map((ma) => chayHetTran(taoTran(cauHinh(ma))).tiSo),
)
const LIEN_TUC = dungBang(
  MAU_RONG.map((ma) => chayHetTranLienTuc(taoTranLienTuc(cauHinh(ma))).tran.tiSo),
)

describe('AC-45.3 — hai chế độ cho hai bảng thống kê gần nhau (T751)', () => {
  it('⚠️ CHỐNG RỖNG: 200 mã THẬT chạy ở CẢ HAI chế độ, và cả hai có bàn thắng', () => {
    /*
      Một phép so hai trung bình là một phép so **rỗng** nếu một trong hai bảng
      không có trận nào, hoặc mọi trận đều 0–0. Khẳng định mẫu trước, so sau.
    */
    expect(CO_DIEN.soTran).toBe(SO_MA_RONG)
    expect(LIEN_TUC.soTran).toBe(SO_MA_RONG)
    expect(CO_DIEN.tongBan).toBeGreaterThan(100)
    expect(LIEN_TUC.tongBan).toBeGreaterThan(100)
    console.log(
      `cổ điển : ${CO_DIEN.thang}-${CO_DIEN.hoa}-${CO_DIEN.thua}, ` +
        `thắng ${(CO_DIEN.tiLeThang * 100).toFixed(1)}%, ` +
        `hiệu số ${CO_DIEN.hieuSoTrungBinh.toFixed(3)}, ${CO_DIEN.tongBan} bàn`,
    )
    console.log(
      `liên tục: ${LIEN_TUC.thang}-${LIEN_TUC.hoa}-${LIEN_TUC.thua}, ` +
        `thắng ${(LIEN_TUC.tiLeThang * 100).toFixed(1)}%, ` +
        `hiệu số ${LIEN_TUC.hieuSoTrungBinh.toFixed(3)}, ${LIEN_TUC.tongBan} bàn`,
    )
  })

  it('hiệu số bàn thắng trung bình lệch không quá 0,5 bàn', () => {
    const lech = Math.abs(CO_DIEN.hieuSoTrungBinh - LIEN_TUC.hieuSoTrungBinh)
    console.log(`lệch hiệu số: ${lech.toFixed(3)} bàn (trần ${LECH_HIEU_SO_TOI_DA})`)
    expect(lech).toBeLessThanOrEqual(LECH_HIEU_SO_TOI_DA)
  })

  it('tỉ lệ thắng của đội mạnh hơn lệch không quá 10 điểm phần trăm', () => {
    const lech = Math.abs(CO_DIEN.tiLeThang - LIEN_TUC.tiLeThang)
    console.log(
      `lệch tỉ lệ thắng: ${(lech * 100).toFixed(1)} điểm phần trăm ` +
        `(trần ${LECH_TI_LE_THANG_TOI_DA * 100})`,
    )
    expect(lech).toBeLessThanOrEqual(LECH_TI_LE_THANG_TOI_DA)
  })
})
