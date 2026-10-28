import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { buocTiep, chayHetTran, dongSuKien, taoTran } from './tran'

/*
  Tính tái lập (P1, AC-8.11).

  Hiến pháp đặt câu hỏi review thẳng thừng: "chạy lại cùng mã trận hai lần,
  diff dòng sự kiện — có khác nhau một ký tự nào không?". Những test dưới đây
  là câu trả lời bằng máy cho đúng câu hỏi đó.

  So bằng `toEqual` trên CẢ MẢNG sự kiện, không chỉ so độ dài hay so tỉ số:
  hai trận khác nhau hoàn toàn có thể cùng tỉ số 1-1 và cùng 74 dòng.
*/

function chay(ma: string) {
  return chayHetTran(taoTran(cauHinhMau(ma)))
}

describe('chạy lại cùng mã trận (AC-8.11)', () => {
  it('hai lần chạy cho cùng tỉ số và cùng từng dòng sự kiện', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const a = chay(ma)
      const b = chay(ma)

      expect(b.tiSo, ma).toEqual(a.tiSo)
      expect(dongSuKien(b), ma).toEqual(dongSuKien(a))
    }
  })

  it('toàn bộ trạng thái cuối trận giống hệt, không chỉ phần hiển thị', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      expect(chay(ma), ma).toEqual(chay(ma))
    }
  })

  it('đi từng phút một cũng ra đúng trạng thái như chạy hết một lèo', () => {
    const ma = MA_TRAN_CO_DINH[0]

    let tungPhut = taoTran(cauHinhMau(ma))
    while (!tungPhut.ketThuc) {
      tungPhut = buocTiep(tungPhut)
    }

    expect(tungPhut).toEqual(chay(ma))
  })

  it('tạm dừng giữa chừng rồi chạy tiếp không làm đổi kết quả', () => {
    const ma = MA_TRAN_CO_DINH[1]

    // Giả lập việc người dùng tạm dừng ở phút 30 rồi mới bấm chạy hết.
    let tt = taoTran(cauHinhMau(ma))
    for (let i = 0; i < 30; i += 1) tt = buocTiep(tt)
    const sauKhiTamDung = chayHetTran(tt)

    expect(sauKhiTamDung).toEqual(chay(ma))
  })
})

describe('mã trận thật sự quyết định trận đấu', () => {
  it('đổi một ký tự trong mã thì dòng sự kiện khác đi', () => {
    const a = chay('K7M2R9XQ4B')
    const b = chay('K7M2R9XQ4C')

    expect(dongSuKien(b)).not.toEqual(dongSuKien(a))
  })

  it('mười mã trận cố định cho mười trận khác nhau', () => {
    const vanTay = MA_TRAN_CO_DINH.map((ma) =>
      JSON.stringify(dongSuKien(chay(ma))),
    )
    expect(new Set(vanTay).size).toBe(MA_TRAN_CO_DINH.length)
  })

  it('cùng mã trận nhưng khác đội thì khác trận', () => {
    const ma = MA_TRAN_CO_DINH[2]
    const a = chayHetTran(taoTran(cauHinhMau(ma)))
    const b = chayHetTran(
      taoTran(
        cauHinhMau(ma, {
          nha: {
            ...cauHinhMau(ma).nha,
            trenSan: Array.from({ length: 11 }, (_, i) => `KHAC-${i + 1}`),
          },
        }),
      ),
    )

    // Cùng hạt giống nên diễn biến giống nhau, nhưng tên người phải khác.
    const tenA = dongSuKien(a).flatMap((s) => s.cacCauThu)
    const tenB = dongSuKien(b).flatMap((s) => s.cacCauThu)
    expect(tenB).not.toEqual(tenA)
  })
})
