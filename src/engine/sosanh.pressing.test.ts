import { describe, expect, it } from 'vitest'
import { CHI_THI_MAC_DINH, type BoChiThi } from '../domain/instructions'
import { benMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, taoTran } from './tran'

/*
  AC-8.4 — pressing cường độ cao phải làm ĐỒNG THỜI hai việc ngược chiều:
  giành lại bóng ở khu vực cao nhiều hơn, VÀ để đối thủ thoát xuống sau hàng
  phòng ngự nhiều hơn.

  Phải khẳng định CẢ HAI chiều trong cùng một test. Chỉ kiểm chiều có lợi thì
  một engine chỉnh ẩu — pressing cao chỉ toàn ưu điểm — vẫn qua được, mà đó
  đúng là thứ AC-8.4 muốn chặn.

  Đọc từ `thongKe`, không đếm từ dòng sự kiện đã qua bộ lọc mật độ.
*/

function trungBinhCuaMucPressing(muc: BoChiThi['cuong-do-pressing']) {
  const chiThi: BoChiThi = { ...CHI_THI_MAC_DINH, 'cuong-do-pressing': muc }
  let cuop = 0
  let thoat = 0

  for (const ma of MA_TRAN_CO_DINH) {
    const tt = chayHetTran(
      taoTran({
        maTran: ma,
        nha: benMau('A', { chiThi }),
        khach: benMau('B'),
        sanTrungLap: true,
      }),
    )
    cuop += tt.ben.nha.thongKe.cuopBongDaiCao
    thoat += tt.ben.nha.thongKe.biThoatXuong
  }

  const n = MA_TRAN_CO_DINH.length
  return { cuop: cuop / n, thoat: thoat / n }
}

describe('pressing cao so với pressing thấp (AC-8.4)', () => {
  it('cướp bóng ở dải cao TĂNG, và bị thoát xuống CŨNG TĂNG', () => {
    const cao = trungBinhCuaMucPressing('cao')
    const thap = trungBinhCuaMucPressing('thap')

    console.log(
      `pressing cao  — cướp bóng dải cao: ${cao.cuop.toFixed(1)}, bị thoát xuống: ${cao.thoat.toFixed(1)}`,
    )
    console.log(
      `pressing thấp — cướp bóng dải cao: ${thap.cuop.toFixed(1)}, bị thoát xuống: ${thap.thoat.toFixed(1)}`,
    )

    expect(cao.cuop).toBeGreaterThan(thap.cuop)
    expect(cao.thoat).toBeGreaterThan(thap.thoat)
  })

  it('mức trung bình nằm giữa hai cực ở cả hai chiều', () => {
    const cao = trungBinhCuaMucPressing('cao')
    const giua = trungBinhCuaMucPressing('trung-binh')
    const thap = trungBinhCuaMucPressing('thap')

    expect(giua.cuop).toBeGreaterThan(thap.cuop)
    expect(giua.cuop).toBeLessThan(cao.cuop)
    expect(giua.thoat).toBeGreaterThan(thap.thoat)
    expect(giua.thoat).toBeLessThan(cao.thoat)
  })
})
