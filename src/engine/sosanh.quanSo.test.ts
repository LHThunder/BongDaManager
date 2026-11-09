import { describe, expect, it } from 'vitest'
import { soDoTheoQuanSo } from '../domain/formations'
import { benMauQuanSo } from './__fixtures__/doiMau'
import { chayHetTran, taoTran } from './tran'

/*
  AC-15.4 — đá ít người hơn thì thế trận phải khác, theo chiều đã chốt ở
  `/clarify`: **số cú sút và số cơ hội rõ ràng trung bình mỗi trận TĂNG khi
  quân số GIẢM**, vì ít người thì khoảng trống nhiều.

  Đây là AC dạng so sánh duy nhất của spec 002, nên theo P5 nó phải có một
  test riêng in ra số đo thật — không được chứng minh bằng cách đọc code.

  Và đây cũng là **rủi ro R25**: lưới vùng của engine không đổi theo quân số
  (quyết định D55), còn sức mạnh đội tính trung bình theo đầu người, nên
  không có gì bảo đảm sẵn rằng engine cho ra đúng chiều này. Test này tồn tại
  để trả lời câu đó bằng số, trước khi bất cứ thứ gì được xây lên trên nó.
*/

/** Mã trận cố định riêng cho phép đo này, để số đo lặp lại được. */
function maDo(i: number): string {
  return `Q${String(i).padStart(4, '0')}XQ4B`
}

const SO_MA = 40

interface SoDo {
  readonly cuSut: number
  readonly coHoi: number
  readonly banThang: number
}

/** Trung bình mỗi trận, cộng cả hai bên, qua `SO_MA` mã trận. */
function doTheoQuanSo(n: number): SoDo {
  let cuSut = 0
  let coHoi = 0
  let banThang = 0

  for (let i = 0; i < SO_MA; i += 1) {
    const tt = chayHetTran(
      taoTran({
        maTran: maDo(i),
        quanSo: n,
        nha: benMauQuanSo('A', n),
        khach: benMauQuanSo('B', n),
        sanTrungLap: true,
      }),
    )

    for (const ben of [tt.ben.nha, tt.ben.khach]) {
      cuSut += ben.thongKe.cuSut
      coHoi += ben.thongKe.coHoiRoRang
    }
    banThang += tt.tiSo.nha + tt.tiSo.khach
  }

  return {
    cuSut: cuSut / SO_MA,
    coHoi: coHoi / SO_MA,
    banThang: banThang / SO_MA,
  }
}

describe('quân số nhỏ cho thế trận thoáng hơn (AC-15.4)', () => {
  it('sân 5 có nhiều cú sút và cơ hội rõ ràng hơn sân 11', () => {
    const nam = doTheoQuanSo(5)
    const muoiMot = doTheoQuanSo(11)

    console.log(
      `trung bình mỗi trận qua ${SO_MA} mã —\n` +
        `  sân 5 : cú sút ${nam.cuSut.toFixed(1)}, cơ hội rõ ràng ${nam.coHoi.toFixed(1)}, bàn thắng ${nam.banThang.toFixed(2)}\n` +
        `  sân 11: cú sút ${muoiMot.cuSut.toFixed(1)}, cơ hội rõ ràng ${muoiMot.coHoi.toFixed(1)}, bàn thắng ${muoiMot.banThang.toFixed(2)}`,
    )

    expect(nam.cuSut).toBeGreaterThan(muoiMot.cuSut)
    expect(nam.coHoi).toBeGreaterThan(muoiMot.coHoi)
  })

  /*
    Cả dải phải đi một chiều, không được nhấp nhô. Một hệ số đúng ở hai đầu mà
    sai ở giữa thì người dùng đổi từ sân 7 sang sân 8 sẽ thấy trận đấu đổi
    theo hướng không ai giải thích được.
  */
  it('cú sút tăng đều khi quân số giảm, suốt dải 5 tới 11', () => {
    /*
      Chỉ đo những quân số ĐÃ CÓ sơ đồ. Hôm nay là 5 và 11; khi lát 19 dựng
      xong 11 sơ đồ còn lại thì phép kiểm này tự phủ cả dải mà không phải sửa
      một dòng nào — và nó sẽ đỏ ngay nếu một quân số mới làm đường cong gãy.
    */
    const cacQuanSo = [11, 10, 9, 8, 7, 6, 5].filter(
      (n) => soDoTheoQuanSo(n).length > 0,
    )
    expect(cacQuanSo.length).toBeGreaterThanOrEqual(2)

    const soDo = cacQuanSo.map((n) => ({ n, ...doTheoQuanSo(n) }))

    for (const d of soDo) {
      console.log(
        `  sân ${String(d.n).padStart(2)}: cú sút ${d.cuSut.toFixed(1)}, cơ hội ${d.coHoi.toFixed(1)}, bàn thắng ${d.banThang.toFixed(2)}`,
      )
    }

    for (let i = 1; i < soDo.length; i += 1) {
      expect(
        soDo[i].cuSut,
        `sân ${soDo[i].n} phải nhiều cú sút hơn sân ${soDo[i - 1].n}`,
      ).toBeGreaterThan(soDo[i - 1].cuSut)
    }
  })
})
