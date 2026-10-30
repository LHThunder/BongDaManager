import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { buocTiep, chayHetTran, taoTran, type ThongKeCauThu } from './tran'

/*
  Gán hành động cho cầu thủ cụ thể (AC-11.3, quyết định D34 và D34c).

  `chuoiBong.ts` cố tình không biết tới đội hình, nên việc gán người xảy ra ở
  `tran.ts` sau khi chuỗi đã chạy. Hai thứ phải đúng:

  1. Người được gán phải ở GẦN chỗ bóng, cân theo sức mạnh — rút đều tay thì
     trung vệ kiến tạo nhiều như tiền vệ cánh và điểm cầu thủ thành vô nghĩa.
  2. Mọi id được gán phải đang ở trên sân tại đúng phút đó.

  Ô của sơ đồ 4-4-2 theo số áo: 1 thủ môn · 2 HVT · 3,4 trung vệ · 5 HVP ·
  6 TVCT · 7,8 TVTT · 9 TVCP · 10,11 tiền đạo.
*/

const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

/** Tổng một chỉ tiêu của một nhóm số áo, cộng qua 20 trận. */
function tongCuaNhom(
  khoa: keyof ThongKeCauThu,
  cacSoAo: readonly number[],
): number {
  let tong = 0
  for (const ma of CAC_MA) {
    const tt = chayHetTran(taoTran(cauHinhMau(ma)))
    for (const so of cacSoAo) {
      const giaTri = tt.ben.nha.thongKe.theoCauThu[`A-${so}`]?.[khoa]
      if (typeof giaTri === 'number') tong += giaTri
    }
  }
  return tong
}

describe('ai làm gì thì đúng người đó được ghi (AC-11.3)', () => {
  it('tiền vệ cánh kiến tạo nhiều hơn trung vệ', () => {
    const canh = tongCuaNhom('kienTao', [6, 9])
    const trungVe = tongCuaNhom('kienTao', [3, 4])

    console.log(`kiến tạo qua 20 trận — tiền vệ cánh ${canh}, trung vệ ${trungVe}`)
    expect(canh).toBeGreaterThan(trungVe)
  })

  /*
    Phép này tách YẾU, và đó là đúng theo thiết kế chứ không phải lỗi.

    Bóng luôn bắt đầu ở dải 1, nên phần lớn pha mất bóng xảy ra ở dải 1–2. Lật
    vùng sang bên phòng ngự thì ở dải 1 gần như CẢ đội hình đều "ở gần" — chỉ
    thủ môn là không. Vùng chỉ siết chặt ở dải 3, tức trong vòng cấm, và đó
    cũng là nơi nó cần siết: kiến tạo tách 9 so với 0, còn đường chuyền tách
    hơn ba lần (xem hai phép dưới).

    Nói cách khác: một pha mất bóng ở giữa sân thì ai giành lại cũng hợp lý —
    model không nên khẳng định hơn thế.
  */
  it('trung vệ cướp bóng nhiều hơn tiền đạo', () => {
    const trungVe = tongCuaNhom('cuopBong', [3, 4])
    const tienDao = tongCuaNhom('cuopBong', [10, 11])

    console.log(
      `cướp bóng qua 20 trận — trung vệ ${trungVe}, tiền đạo ${tienDao}`,
    )
    expect(trungVe).toBeGreaterThan(tienDao)
  })

  /*
    Thủ môn không được ghi bàn như cầu thủ sân (T130, AC-8.2).

    Trước T130, người kết thúc tình huống được rút trong CẢ đội và chỉ cân
    theo sức mạnh, nên thủ môn dứt điểm ngang một tiền đạo — kiểm tay còn bắt
    được một khung hình có CẢ HAI thủ môn cùng sáng lên ở dải 3, một người
    sút và một người cứu. Rút theo vùng thì thủ môn chỉ còn kết thúc tình
    huống khi bóng ở ngay khu vực của mình, mà bóng ở đó thì gần như không
    bao giờ thành bàn cho đội anh ta.

    Ngưỡng đặt ở "ít hơn một phần mười" chứ không phải "bằng 0": thủ môn vẫn
    có quyền chạm bóng, và một engine bóng đá cấm tiệt điều gì đó thường là
    một engine đang nói dối.
  */
  it('thủ môn ghi bàn ít hơn hẳn tiền đạo', () => {
    const thuMon = tongCuaNhom('banThang', [1])
    const tienDao = tongCuaNhom('banThang', [10, 11])

    console.log(
      `bàn thắng qua ${CAC_MA.length} trận — thủ môn ${thuMon}, hai tiền đạo ${tienDao}`,
    )
    expect(tienDao).toBeGreaterThan(0)
    expect(thuMon).toBeLessThan(tienDao / 10)
  })

  it('thủ môn cũng không dứt điểm như cầu thủ sân', () => {
    const thuMon = tongCuaNhom('cuSut', [1])
    const tienDao = tongCuaNhom('cuSut', [10, 11])

    console.log(
      `cú sút qua ${CAC_MA.length} trận — thủ môn ${thuMon}, hai tiền đạo ${tienDao}`,
    )
    expect(thuMon).toBeLessThan(tienDao / 10)
  })

  it('tổng kiến tạo không bao giờ vượt tổng số bàn thắng', () => {
    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      for (const ben of ['nha', 'khach'] as const) {
        const kienTao = Object.values(tt.ben[ben].thongKe.theoCauThu).reduce(
          (s, x) => s + x.kienTao,
          0,
        )
        expect(kienTao, `${ma}/${ben}`).toBeLessThanOrEqual(tt.tiSo[ben])
      }
    }
  })
})

describe('mọi id được gán đều đang trên sân', () => {
  it('không bản ghi nào thuộc người chưa từng vào sân', () => {
    for (const ma of CAC_MA) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      for (const ben of ['nha', 'khach'] as const) {
        const hopLe = new Set(tt.ben[ben].cacCauThu.map((c) => c.id))
        for (const id of Object.keys(tt.ben[ben].thongKe.theoCauThu)) {
          expect(hopLe.has(id), `${ma}/${ben}/${id}`).toBe(true)
        }
      }
    }
  })

  /*
    Phép chặt hơn: đi từng phút một và đối chiếu với đội hình ở ĐẦU phút đó.
    Người nhận thẻ đỏ ở phút 70 vẫn hợp lệ trong các dòng của phút 1..70, nên
    so với `trenSan` cuối trận là so sai.
  */
  it('mỗi phút chỉ ghi cho người có mặt ở đầu phút đó', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      let tt = taoTran(cauHinhMau(ma))

      while (!tt.ketThuc) {
        const coMat = {
          nha: new Set(tt.ben.nha.trenSan),
          khach: new Set(tt.ben.khach.trenSan),
        }
        const truoc = {
          nha: { ...tt.ben.nha.thongKe.theoCauThu },
          khach: { ...tt.ben.khach.thongKe.theoCauThu },
        }

        tt = buocTiep(tt)

        for (const ben of ['nha', 'khach'] as const) {
          const sau = tt.ben[ben].thongKe.theoCauThu
          for (const [id, moi] of Object.entries(sau)) {
            const cu = truoc[ben][id]
            const doi = cu === undefined || !bangNhau(cu, moi)
            if (doi) {
              expect(coMat[ben].has(id), `${ma} phút ${tt.phut} / ${id}`).toBe(
                true,
              )
            }
          }
        }
      }
    }
  })
})

function bangNhau(a: ThongKeCauThu, b: ThongKeCauThu): boolean {
  return (Object.keys(a) as (keyof ThongKeCauThu)[]).every(
    (k) => a[k] === b[k],
  )
}

describe('đường chuyền thuộc về từng bước, không chỉ bốn vai (D34c)', () => {
  /*
    Đây là phép bắt đúng lỗ hổng `/analyze` tìm ra: nếu chỉ gán bốn vai mỗi
    chuỗi thì 9 trong 11 người có `chuyenThanhCong = 0` và `chuyenHong = 0`
    suốt trận, nên tỉ lệ chuyền chính xác của họ không xác định — mà AC-11.3
    liệt kê nó là một trong bảy tiêu chí chấm điểm.
  */
  it('cả 11 người trên sân đều có đường chuyền sau một trận', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))

      for (const ben of ['nha', 'khach'] as const) {
        const bang = tt.ben[ben].thongKe.theoCauThu
        const xuatPhat = tt.ben[ben].chienThuatXuatPhat.oVien
          .map((o) => o.playerId)
          .filter((id): id is string => id !== null)

        for (const id of xuatPhat) {
          const tk = bang[id]
          const soChuyen = (tk?.chuyenThanhCong ?? 0) + (tk?.chuyenHong ?? 0)
          expect(soChuyen, `${ma}/${ben}/${id}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('tiền vệ trung tâm chuyền nhiều hơn tiền đạo', () => {
    const giua = tongCuaNhom('chuyenThanhCong', [7, 8])
    const tienDao = tongCuaNhom('chuyenThanhCong', [10, 11])

    console.log(
      `đường chuyền qua 20 trận — tiền vệ trung tâm ${giua}, tiền đạo ${tienDao}`,
    )
    expect(giua).toBeGreaterThan(tienDao)
  })
})
