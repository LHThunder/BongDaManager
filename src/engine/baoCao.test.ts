import { describe, expect, it } from 'vitest'
import {
  benMauQuanSo,
  cauHinhMau,
  MA_TRAN_CO_DINH,
} from './__fixtures__/doiMau'
import { soDoTheoQuanSo } from '../domain/formations'
import { dungBaoCao } from './baoCao'
import { DIEM_TOI_DA, DIEM_TOI_THIEU } from './diemCauThu'
import {
  apDungCanThiep,
  buocTiep,
  CAC_QUAN_SO,
  chayHetTran,
  taoTran,
  type TrangThaiTran,
} from './tran'

/*
  Báo cáo sau trận (AC-11.1 → AC-11.5).

  `dungBaoCao` phải THUẦN: Phase 18 sẽ lưu thẳng kết quả này xuống đĩa thay vì
  tính lại, nên gọi hai lần trên cùng một trạng thái mà ra hai kết quả khác
  nhau là lỗi chết người — có phép kiểm riêng cho đúng điều đó.
*/

const CAC_MA: readonly string[] = [
  ...MA_TRAN_CO_DINH,
  ...MA_TRAN_CO_DINH.map((ma) => `${ma.slice(0, 9)}Z`),
]

function chay(ma: string) {
  return chayHetTran(taoTran(cauHinhMau(ma)))
}

describe('hàm thuần, gọi lại ra đúng cùng kết quả', () => {
  it('hai lần dựng báo cáo trên cùng trạng thái cho kết quả giống hệt', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      const tt = chay(ma)
      expect(dungBaoCao(tt), ma).toEqual(dungBaoCao(tt))
    }
  })
})

describe('tỉ số và người ghi bàn (AC-11.1)', () => {
  it('số người ghi bàn bằng đúng tổng tỉ số', () => {
    for (const ma of CAC_MA) {
      const tt = chay(ma)
      const bc = dungBaoCao(tt)
      expect(bc.nguoiGhiBan.length, ma).toBe(tt.tiSo.nha + tt.tiSo.khach)
    }
  })

  it('mỗi bên có đúng số người ghi bàn bằng số bàn của bên đó', () => {
    for (const ma of CAC_MA) {
      const bc = dungBaoCao(chay(ma))
      for (const doi of ['nha', 'khach'] as const) {
        const soBan = bc.nguoiGhiBan.filter((x) => x.doi === doi).length
        expect(soBan, `${ma}/${doi}`).toBe(bc.tiSo[doi])
      }
    }
  })

  it('mỗi bàn thắng có phút và có tên người ghi', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      for (const ban of dungBaoCao(chay(ma)).nguoiGhiBan) {
        expect(ban.playerId, ma).toBeTruthy()
        expect(ban.phut, ma).toBeGreaterThan(0)
      }
    }
  })

  it('người ghi bàn luôn thuộc đội đã ghi bàn đó', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      const tt = chay(ma)
      for (const ban of dungBaoCao(tt).nguoiGhiBan) {
        const hopLe = new Set(tt.ben[ban.doi].cacCauThu.map((c) => c.id))
        expect(hopLe.has(ban.playerId), `${ma}/${ban.playerId}`).toBe(true)
      }
    }
  })
})

describe('sáu chỉ tiêu mỗi bên (AC-11.2)', () => {
  it('hai tỉ lệ kiểm soát bóng cộng lại đúng 100', () => {
    for (const ma of CAC_MA) {
      const { theoBen } = dungBaoCao(chay(ma))
      expect(theoBen.nha.kiemSoatBong + theoBen.khach.kiemSoatBong, ma).toBe(
        100,
      )
    }
  })

  it('cơ hội rõ ràng và sút trúng đích không vượt số cú sút', () => {
    for (const ma of CAC_MA) {
      const bc = dungBaoCao(chay(ma))
      for (const doi of ['nha', 'khach'] as const) {
        const ct = bc.theoBen[doi]
        expect(ct.coHoiRoRang, `${ma}/${doi}`).toBeLessThanOrEqual(ct.cuSut)
        expect(ct.sutTrungDich, `${ma}/${doi}`).toBeLessThanOrEqual(ct.cuSut)
        expect(ct.sutTrungDich, `${ma}/${doi}`).toBeGreaterThanOrEqual(
          bc.tiSo[doi],
        )
      }
    }
  })

  it('chỉ tiêu lấy từ thongKe, không đếm lại từ dòng sự kiện', () => {
    /*
      Dòng sự kiện đã bị bộ lọc mật độ của D27 cắt xuống 60–100 dòng, nên nếu
      báo cáo đếm lại từ đó thì số cú sút sẽ THẤP HƠN con số thật.
    */
    for (const ma of CAC_MA.slice(0, 5)) {
      const tt = chay(ma)
      const bc = dungBaoCao(tt)
      expect(bc.theoBen.nha.cuSut, ma).toBe(tt.ben.nha.thongKe.cuSut)
      expect(bc.theoBen.khach.theVang, ma).toBe(tt.ben.khach.thongKe.theVang)
    }
  })
})

describe('chấm điểm cầu thủ trong báo cáo (AC-11.3)', () => {
  it('chấm cho đúng những người đã ra sân, không chấm người ngồi ngoài', () => {
    for (const ma of CAC_MA.slice(0, 5)) {
      const tt = chay(ma)
      const bc = dungBaoCao(tt)

      for (const doi of ['nha', 'khach'] as const) {
        const cham = bc.diemCauThu.filter((x) => x.doi === doi)
        // Không thay người nên đúng 11 người đá chính được chấm.
        expect(cham, `${ma}/${doi}`).toHaveLength(11)

        const daChinh = new Set(
          tt.ben[doi].chienThuatXuatPhat.oVien.map((o) => o.playerId),
        )
        for (const x of cham) {
          expect(daChinh.has(x.playerId), `${ma}/${x.playerId}`).toBe(true)
        }
      }
    }
  })

  it('mọi điểm nằm trong 1–10 và có bảng thành phần', () => {
    for (const ma of CAC_MA) {
      for (const x of dungBaoCao(chay(ma)).diemCauThu) {
        expect(x.diem, `${ma}/${x.playerId}`).toBeGreaterThanOrEqual(
          DIEM_TOI_THIEU,
        )
        expect(x.diem, `${ma}/${x.playerId}`).toBeLessThanOrEqual(DIEM_TOI_DA)
        expect(Array.isArray(x.cacThanhPhan)).toBe(true)
      }
    }
  })

  /*
    Phép đúng là "ghi bàn thì ĐƯỢC CỘNG", không phải "ghi bàn thì điểm cao hơn
    trung bình đội".

    Bản đầu của test khẳng định cái sau và đỏ thật: A-3, một trung vệ, ghi bàn
    nhưng chỉ được 5.8 trong khi trung bình đội là 5.82 — vì anh ta mất bóng
    và phạm lỗi đủ để bù hết phần cộng. Đó là engine chạy ĐÚNG: AC-11.3 cân
    bảy tiêu chí, không để bàn thắng lấn hết. Một người ghi bàn mà chơi tệ
    phần còn lại thì điểm thấp là hợp lý.
  */
  it('ghi bàn luôn được cộng điểm, và cộng theo đúng số bàn', () => {
    let soKiem = 0

    for (const ma of CAC_MA) {
      const bc = dungBaoCao(chay(ma))
      for (const ban of bc.nguoiGhiBan) {
        const nguoi = bc.diemCauThu.find(
          (x) => x.doi === ban.doi && x.playerId === ban.playerId,
        )
        const thanhPhan = nguoi?.cacThanhPhan.find(
          (x) => x.tieuChi === 'ban-thang',
        )

        expect(thanhPhan, `${ma}/${ban.playerId}`).toBeDefined()
        expect(thanhPhan?.diemCong, `${ma}/${ban.playerId}`).toBeGreaterThan(0)

        const soBanCuaNguoi = bc.nguoiGhiBan.filter(
          (x) => x.doi === ban.doi && x.playerId === ban.playerId,
        ).length
        expect(thanhPhan?.soLieu, `${ma}/${ban.playerId}`).toBe(soBanCuaNguoi)
        soKiem += 1
      }
    }

    console.log(`số bàn thắng đã kiểm thành phần điểm: ${soKiem}`)
    expect(soKiem).toBeGreaterThan(0)
  })

  it('vị trí dùng để chấm là vị trí của Ô, không phải sở trường', () => {
    const tt = chay(CAC_MA[0])
    const bc = dungBaoCao(tt)
    const thuMon = bc.diemCauThu.find(
      (x) => x.doi === 'nha' && x.playerId === 'A-1',
    )
    expect(thuMon?.viTriDaDa).toBe('GK')
  })
})

describe('phút vào và phút ra trong báo cáo (AC-11.5)', () => {
  it('người đá trọn trận có cả hai mốc là null', () => {
    for (const x of dungBaoCao(chay(CAC_MA[0])).diemCauThu) {
      expect(x.phutVao, x.playerId).toBeNull()
      expect(x.phutRa, x.playerId).toBeNull()
    }
  })

  it('thay người thì báo cáo có 12 người được chấm, kèm hai mốc đúng', () => {
    let tt: TrangThaiTran = taoTran(cauHinhMau(CAC_MA[0]))
    while (tt.phut < 60) tt = buocTiep(tt)

    const ra = tt.ben.nha.trenSan[5]
    const vao = tt.ben.nha.duBi[0]
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: { loai: 'thay-nguoi', ra, vao },
    })
    if (!kq.thanhCong) throw new Error(`bị từ chối: ${kq.lyDo}`)
    tt = kq.trangThai
    while (!tt.ketThuc) tt = buocTiep(tt)

    const cham = dungBaoCao(tt).diemCauThu.filter((x) => x.doi === 'nha')
    expect(cham).toHaveLength(12)

    const nguoiRa = cham.find((x) => x.playerId === ra)
    const nguoiVao = cham.find((x) => x.playerId === vao)
    expect(nguoiRa?.phutRa).toBe(61)
    expect(nguoiVao?.phutVao).toBe(61)
    expect(nguoiVao?.phutRa).toBeNull()
  })
})

/*
  Báo cáo sau trận ở quân số nhỏ (AC-15.3).

  `dungBaoCao` vốn dựng bảng điểm từ `theoCauThu` chứ không từ một con số 11
  cứng ở đâu đó, nên về lý thì nó đúng sẵn cho mọi quân số. Khối này tồn tại
  để CHỨNG MINH điều đó, không phải để tin vào nó: một con số 11 lẩn trong
  đường dựng báo cáo sẽ không lộ ra ở bất kỳ phép kiểm nào khác, vì mọi phép
  kiểm khác đều chạy trận 11 người.
*/
describe('báo cáo sau trận ở quân số nhỏ (AC-15.3)', () => {
  const QUAN_SO_CHAY_DUOC = CAC_QUAN_SO.filter(
    (n) => soDoTheoQuanSo(n).length > 0,
  )

  function chayQuanSo(n: number, ma: string): TrangThaiTran {
    return chayHetTran(
      taoTran(
        cauHinhMau(ma, {
          quanSo: n,
          nha: benMauQuanSo('A', n),
          khach: benMauQuanSo('B', n),
        }),
      ),
    )
  }

  it('bảng điểm có ĐÚNG những người đã ra sân, không thừa không thiếu', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      const tt = chayQuanSo(n, MA_TRAN_CO_DINH[0])
      const bc = dungBaoCao(tt)

      for (const doi of ['nha', 'khach'] as const) {
        const cham = bc.diemCauThu.filter((x) => x.doi === doi)
        // Không thay người, nên đúng n người đá chính được chấm.
        expect(cham, `quân số ${n}/${doi}`).toHaveLength(n)

        const daChinh = new Set(
          tt.ben[doi].chienThuatXuatPhat.oVien.map((o) => o.playerId),
        )
        for (const x of cham) {
          expect(daChinh.has(x.playerId), `${n}/${x.playerId}`).toBe(true)
        }

        // Không ai bị chấm hai lần.
        const ids = new Set(cham.map((x) => x.playerId))
        expect(ids.size, `quân số ${n}/${doi}`).toBe(n)
      }
    }
  })

  /*
    Phép quan trọng nhất của khối: tổng theo TỪNG CẦU THỦ phải khớp tổng theo
    BÊN. Hai con số ấy đi hai đường khác nhau trong `dungBaoCao` — một đường
    qua `theoCauThu`, một đường qua `thongKe` của bên — nên nếu đường nào
    còn một con số 11 cứng thì ở quân số 5 chúng sẽ lệch nhau.
  */
  it('tổng bàn thắng theo từng cầu thủ khớp tổng theo bên', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
        const bc = dungBaoCao(chayQuanSo(n, ma))

        for (const doi of ['nha', 'khach'] as const) {
          const banCuaNguoi = bc.nguoiGhiBan.filter((g) => g.doi === doi).length
          expect(banCuaNguoi, `quân số ${n}/${doi}/${ma}`).toBe(bc.tiSo[doi])
        }
      }
    }
  })

  it('mọi điểm vẫn nằm trong 1–10 ở quân số nhỏ', () => {
    for (const n of QUAN_SO_CHAY_DUOC) {
      for (const x of dungBaoCao(chayQuanSo(n, MA_TRAN_CO_DINH[1])).diemCauThu) {
        expect(x.diem, `${n}/${x.playerId}`).toBeGreaterThanOrEqual(
          DIEM_TOI_THIEU,
        )
        expect(x.diem, `${n}/${x.playerId}`).toBeLessThanOrEqual(DIEM_TOI_DA)
      }
    }
  })

  /*
    Người vào sân từ ghế dự bị ở trận sân nhỏ cũng phải được chấm — đây là
    chỗ một con số 11 cứng dễ lẩn nhất, vì nó chỉ lộ khi số người được chấm
    vượt quá quân số xuất phát.
  */
  it('người được thay vào ở trận sân 5 vẫn có mặt trong bảng điểm', () => {
    const n = 5
    let tt: TrangThaiTran = taoTran(
      cauHinhMau(MA_TRAN_CO_DINH[0], {
        quanSo: n,
        nha: benMauQuanSo('A', n, 2),
        khach: benMauQuanSo('B', n, 2),
      }),
    )
    while (tt.phut < 10) tt = buocTiep(tt)

    const ra = tt.ben.nha.trenSan[2]
    const vao = tt.ben.nha.duBi[0]
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: { loai: 'thay-nguoi', ra, vao },
    })
    if (!kq.thanhCong) throw new Error(`bị từ chối: ${kq.lyDo}`)

    const cham = dungBaoCao(chayHetTran(kq.trangThai)).diemCauThu.filter(
      (x) => x.doi === 'nha',
    )
    expect(cham).toHaveLength(n + 1)
    // Can thiệp ở phút p có hiệu lực từ phút p+1, y như AC-11.5 của spec 001.
    expect(cham.find((x) => x.playerId === vao)?.phutVao).toBe(11)
    expect(cham.find((x) => x.playerId === ra)?.phutRa).toBe(11)
  })
})
