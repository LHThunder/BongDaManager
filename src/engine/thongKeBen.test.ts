import { describe, expect, it } from 'vitest'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { benMau, cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, taoTran, xacSuatCoHoiRoRang } from './tran'

/*
  Ba chỉ tiêu của mỗi bên mà AC-11.2 đòi: số cú sút, số cú sút trúng đích, và
  số cơ hội rõ ràng.

  Lý do file này tồn tại: tới hết Giai đoạn 3, `cuSut` và `coHoiRoRang` được
  cộng bằng ĐÚNG MỘT điều kiện nên hai con số luôn bằng nhau — bảng so sánh
  hiện ra hai dòng trông như hai chỉ tiêu nhưng thực chất là một. Không test
  nào bắt được, vì không test nào so hai bộ đếm đó với nhau.

  `/analyze` còn bắt thêm một cái bẫy: phương án sửa đầu tiên (chỉ đếm cú sút
  "từ trong vùng dứt điểm") là một phép KHÔNG LÀM GÌ, vì `chuoiBong.ts` chỉ
  trả về `dut-diem` khi bóng đã ở trong vùng dứt điểm. Phép kiểm "nhỏ hơn hẳn"
  dưới đây là thứ bắt được cả hai kiểu lỗi đó.
*/

/** 20 mã: 10 mã cố định cộng 10 mã dẫn xuất, như `hieuNang.test.ts`. */
const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

function chay(ma: string) {
  return chayHetTran(taoTran(cauHinhMau(ma)))
}

describe('ba chỉ tiêu dứt điểm của mỗi bên (AC-11.2)', () => {
  it('bàn thắng ≤ cơ hội rõ ràng ≤ cú sút, ở mọi trận và cả hai bên', () => {
    for (const ma of CAC_MA) {
      const tt = chay(ma)

      for (const ben of ['nha', 'khach'] as const) {
        const tk = tt.ben[ben].thongKe
        const banThang = tt.tiSo[ben]

        expect(tk.coHoiRoRang, `${ma}/${ben}`).toBeLessThanOrEqual(tk.cuSut)
        expect(tk.coHoiRoRang, `${ma}/${ben}`).toBeGreaterThanOrEqual(banThang)
      }
    }
  })

  it('sút trúng đích ≤ cú sút, và không nhỏ hơn số bàn thắng', () => {
    for (const ma of CAC_MA) {
      const tt = chay(ma)

      for (const ben of ['nha', 'khach'] as const) {
        const tk = tt.ben[ben].thongKe
        expect(tk.sutTrungDich, `${ma}/${ben}`).toBeLessThanOrEqual(tk.cuSut)
        expect(tk.sutTrungDich, `${ma}/${ben}`).toBeGreaterThanOrEqual(
          tt.tiSo[ben],
        )
      }
    }
  })

  /*
    Phép quan trọng nhất của file: hai bộ đếm phải TÁCH THẬT. Nếu chúng bằng
    nhau ở gần như mọi trận thì lỗi cũ vẫn còn, dù code trông như đã sửa.
  */
  it('cơ hội rõ ràng nhỏ hơn hẳn cú sút ở ít nhất 15 trong 20 trận', () => {
    let nhoHon = 0
    let tongSut = 0
    let tongCoHoi = 0

    for (const ma of CAC_MA) {
      const tt = chay(ma)
      const a = tt.ben.nha.thongKe
      const b = tt.ben.khach.thongKe

      if (a.coHoiRoRang < a.cuSut || b.coHoiRoRang < b.cuSut) nhoHon += 1
      tongSut += a.cuSut + b.cuSut
      tongCoHoi += a.coHoiRoRang + b.coHoiRoRang
    }

    console.log(
      `20 trận — tổng cú sút ${tongSut}, tổng cơ hội rõ ràng ${tongCoHoi} (${((tongCoHoi / tongSut) * 100).toFixed(0)}%), số trận có tách ${nhoHon}/20`,
    )

    expect(nhoHon).toBeGreaterThanOrEqual(15)
    expect(tongCoHoi).toBeLessThan(tongSut)
  })
})

describe('tỉ lệ kiểm soát bóng (AC-11.2, quyết định D36)', () => {
  it('hai bên đều giữ bóng, và hai tỉ lệ cộng lại bằng 100%', () => {
    for (const ma of CAC_MA) {
      const tt = chay(ma)
      const a = tt.ben.nha.thongKe.soBuocGiuBong
      const b = tt.ben.khach.thongKe.soBuocGiuBong

      expect(a, ma).toBeGreaterThan(0)
      expect(b, ma).toBeGreaterThan(0)
      expect(a / (a + b) + b / (a + b)).toBeCloseTo(1)
    }
  })

  /*
    Phép chứng minh con số kiểm soát bóng KHÔNG phải 50/50 cố định: cùng một
    đội, cùng đối thủ, chỉ đổi chỉ thị tốc độ chuyển bóng. `cham` cho
    `giuBong: 1.1` nên chuỗi sống dài hơn, tức nhiều bước hơn.

    Nếu đếm theo SỐ CHUỖI thay vì số bước thì phép này đỏ, vì bên cầm bóng mỗi
    chuỗi do `rng.next() < 0.5` quyết, không liên quan gì tới chỉ thị.
  */
  it('chỉ thị chuyền chậm giữ bóng nhiều hơn chuyền nhanh', () => {
    function tiLeGiuBong(tocDo: 'cham' | 'nhanh'): number {
      let cuaTa = 0
      let tong = 0

      for (const ma of CAC_MA) {
        const tt = chayHetTran(
          taoTran({
            maTran: ma,
            nha: benMau('A', {
              chiThi: { ...CHI_THI_MAC_DINH, 'toc-do-chuyen-bong': tocDo },
            }),
            khach: benMau('B'),
            sanTrungLap: true,
          }),
        )
        cuaTa += tt.ben.nha.thongKe.soBuocGiuBong
        tong +=
          tt.ben.nha.thongKe.soBuocGiuBong +
          tt.ben.khach.thongKe.soBuocGiuBong
      }
      return cuaTa / tong
    }

    const cham = tiLeGiuBong('cham')
    const nhanh = tiLeGiuBong('nhanh')
    console.log(
      `kiểm soát bóng — chuyền chậm: ${(cham * 100).toFixed(1)}%, chuyền nhanh: ${(nhanh * 100).toFixed(1)}%`,
    )

    expect(cham).toBeGreaterThan(nhanh)
  })
})

describe('cơ hội rõ ràng phản ánh sức mạnh (AC-11.2, nối với AC-8.8)', () => {
  it('xác suất tăng theo sức mạnh và luôn nằm trong khoảng kẹp', () => {
    expect(xacSuatCoHoiRoRang(0.8)).toBeGreaterThan(xacSuatCoHoiRoRang(0.3))
    for (const s of [-5, 0, 0.5, 1, 99]) {
      expect(xacSuatCoHoiRoRang(s)).toBeGreaterThanOrEqual(0.1)
      expect(xacSuatCoHoiRoRang(s)).toBeLessThanOrEqual(0.85)
    }
  })

  it('đội mạnh hơn có tỉ lệ cơ hội rõ ràng trên tổng cú sút cao hơn', () => {
    let sutManh = 0
    let coHoiManh = 0
    let sutYeu = 0
    let coHoiYeu = 0

    for (const ma of CAC_MA) {
      const tt = chayHetTran(
        taoTran({
          maTran: ma,
          nha: benMau('A', { chiSo: 17 }),
          khach: benMau('B', { chiSo: 8 }),
          sanTrungLap: true,
        }),
      )
      sutManh += tt.ben.nha.thongKe.cuSut
      coHoiManh += tt.ben.nha.thongKe.coHoiRoRang
      sutYeu += tt.ben.khach.thongKe.cuSut
      coHoiYeu += tt.ben.khach.thongKe.coHoiRoRang
    }

    const tiLeManh = coHoiManh / sutManh
    const tiLeYeu = coHoiYeu / sutYeu
    console.log(
      `tỉ lệ cơ hội rõ ràng — đội 17 điểm: ${(tiLeManh * 100).toFixed(1)}%, đội 8 điểm: ${(tiLeYeu * 100).toFixed(1)}%`,
    )

    expect(tiLeManh).toBeGreaterThan(tiLeYeu)
  })
})
