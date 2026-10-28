import { describe, expect, it } from 'vitest'
import { CHI_THI_MAC_DINH, type BoChiThi } from '../domain/instructions'
import { benMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, taoTran } from './tran'

/*
  AC-8.3 — tấn công biên phải tạo nhiều tình huống tạt cánh hơn tấn công
  trung lộ ít nhất 50%, tính trung bình qua 10 lần giả lập, cùng đội hình và
  cùng đối thủ.

  Đếm từ `thongKe.tatCanh` chứ KHÔNG đếm từ dòng sự kiện: dòng sự kiện đã đi
  qua bộ lọc mật độ của D27 nên đếm ở đó là đo màn hình, không đo giả lập.
  Đây đúng là chỗ `/analyze` cảnh báo.
*/

function trungBinhTatCanh(chiThi: BoChiThi): number {
  let tong = 0
  for (const ma of MA_TRAN_CO_DINH) {
    const tt = chayHetTran(
      taoTran({
        maTran: ma,
        nha: benMau('A', { chiThi }),
        khach: benMau('B'),
        sanTrungLap: true,
      }),
    )
    tong += tt.ben.nha.thongKe.tatCanh
  }
  return tong / MA_TRAN_CO_DINH.length
}

describe('tấn công biên so với trung lộ (AC-8.3)', () => {
  it('tạt cánh nhiều hơn ít nhất 50%', () => {
    const bien = trungBinhTatCanh({
      ...CHI_THI_MAC_DINH,
      'huong-tan-cong': 'bien',
    })
    const trungLo = trungBinhTatCanh({
      ...CHI_THI_MAC_DINH,
      'huong-tan-cong': 'trung-lo',
    })

    // In ra để lần sau chỉnh cân bằng còn biết đang đứng ở đâu.
    console.log(
      `tạt cánh trung bình — biên: ${bien.toFixed(1)}, trung lộ: ${trungLo.toFixed(1)}, tỉ lệ: ${(bien / trungLo).toFixed(2)}`,
    )

    expect(trungLo).toBeGreaterThan(0)
    expect(bien).toBeGreaterThanOrEqual(trungLo * 1.5)
  })

  it('bộ mặc định nằm giữa hai cực', () => {
    const bien = trungBinhTatCanh({
      ...CHI_THI_MAC_DINH,
      'huong-tan-cong': 'bien',
    })
    const canBang = trungBinhTatCanh(CHI_THI_MAC_DINH)
    const trungLo = trungBinhTatCanh({
      ...CHI_THI_MAC_DINH,
      'huong-tan-cong': 'trung-lo',
    })

    expect(canBang).toBeLessThan(bien)
    expect(canBang).toBeGreaterThan(trungLo)
  })
})
