import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  BU_GIO_TOI_DA,
  BU_GIO_TOI_THIEU,
  buocTiep,
  chayHetTran,
  dongSuKien,
  hiepCuaPhut,
  PHUT_MOI_HIEP,
  phutHienThi,
  taoTran,
  tongPhutHiep1,
  tongPhutTran,
} from './tran'
import { SO_DONG_TOI_DA, SO_DONG_TOI_THIEU } from './suKien'

const MA = 'K7M2R9XQ4B'

describe('tạo trận và thời lượng (AC-8.1)', () => {
  it('trận mới ở phút 0, tỉ số 0-0, chưa kết thúc', () => {
    const tt = taoTran(cauHinhMau(MA))
    expect(tt.phut).toBe(0)
    expect(tt.tiSo).toEqual({ nha: 0, khach: 0 })
    expect(tt.ketThuc).toBe(false)
  })

  it('bù giờ mỗi hiệp nằm trong 1..5 và chốt ngay lúc tạo', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = taoTran(cauHinhMau(ma))
      for (const bu of [tt.buGio.hiep1, tt.buGio.hiep2]) {
        expect(bu, ma).toBeGreaterThanOrEqual(BU_GIO_TOI_THIEU)
        expect(bu, ma).toBeLessThanOrEqual(BU_GIO_TOI_DA)
      }
      // Chạy hết trận không được làm đổi bù giờ đã chốt.
      expect(chayHetTran(tt).buGio).toEqual(tt.buGio)
    }
  })

  it('buocTiep tiến đúng một phút', () => {
    let tt = taoTran(cauHinhMau(MA))
    for (let i = 1; i <= 10; i += 1) {
      tt = buocTiep(tt)
      expect(tt.phut).toBe(i)
    }
  })

  it('chayHetTran dừng đúng sau 90 phút cộng bù giờ hai hiệp', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      expect(tt.ketThuc, ma).toBe(true)
      expect(tt.phut, ma).toBe(tongPhutTran(tt))
      expect(tt.phut, ma).toBe(
        PHUT_MOI_HIEP * 2 + tt.buGio.hiep1 + tt.buGio.hiep2,
      )
    }
  })

  it('trận đã kết thúc thì buocTiep trả nguyên trạng', () => {
    const xong = chayHetTran(taoTran(cauHinhMau(MA)))
    expect(buocTiep(xong)).toBe(xong)
  })

  it('trận hoà kết thúc là hoà, không có hiệp phụ', () => {
    const cacHoa = MA_TRAN_CO_DINH.map((ma) =>
      chayHetTran(taoTran(cauHinhMau(ma))),
    ).filter((tt) => tt.tiSo.nha === tt.tiSo.khach)

    expect(cacHoa.length, 'bộ mã cố định không ra trận hoà nào').toBeGreaterThan(
      0,
    )
    for (const tt of cacHoa) {
      expect(tt.ketThuc).toBe(true)
      expect(tt.phut).toBe(tongPhutTran(tt))
    }
  })
})

describe('phút hiển thị theo hiệp', () => {
  it('hiệp 1 chạy 1..45 rồi sang phút bù', () => {
    const tt = taoTran(cauHinhMau(MA))
    expect(phutHienThi(tt, 1)).toEqual({ phut: 1, buGio: false })
    expect(phutHienThi(tt, PHUT_MOI_HIEP)).toEqual({
      phut: PHUT_MOI_HIEP,
      buGio: false,
    })
    expect(phutHienThi(tt, PHUT_MOI_HIEP + 1)).toEqual({
      phut: PHUT_MOI_HIEP + 1,
      buGio: true,
    })
  })

  it('hiệp 2 bắt đầu lại từ phút 46, không bị bù giờ hiệp 1 đẩy lên', () => {
    const tt = taoTran(cauHinhMau(MA))
    const phutDauHiep2 = tongPhutHiep1(tt) + 1
    expect(hiepCuaPhut(tt, phutDauHiep2)).toBe(2)
    expect(phutHienThi(tt, phutDauHiep2)).toEqual({ phut: 46, buGio: false })
  })

  it('phút bù giờ hiệp 2 vượt qua mốc 90', () => {
    const tt = taoTran(cauHinhMau(MA))
    const phutCuoi = tongPhutTran(tt)
    const ht = phutHienThi(tt, phutCuoi)
    expect(ht.buGio).toBe(true)
    expect(ht.phut).toBeGreaterThan(PHUT_MOI_HIEP * 2)
  })

  it('mọi phút của trận đều hiển thị ra số dương tăng dần trong từng hiệp', () => {
    const tt = taoTran(cauHinhMau(MA))
    let truocHiep1 = 0
    let truocHiep2 = 0
    for (let p = 1; p <= tongPhutTran(tt); p += 1) {
      const ht = phutHienThi(tt, p)
      expect(ht.phut).toBeGreaterThan(0)
      if (hiepCuaPhut(tt, p) === 1) {
        expect(ht.phut).toBeGreaterThan(truocHiep1)
        truocHiep1 = ht.phut
      } else {
        expect(ht.phut).toBeGreaterThan(truocHiep2)
        truocHiep2 = ht.phut
      }
    }
  })
})

describe('dòng sự kiện (AC-8.2, AC-8.15)', () => {
  it('mỗi trận có từ 60 đến 100 dòng, trên 20 mã trận khác nhau', () => {
    const soDong: number[] = []
    for (let i = 0; i < 20; i += 1) {
      const tt = chayHetTran(taoTran(cauHinhMau(`MAU${i}XQ4B`)))
      soDong.push(dongSuKien(tt).length)
    }

    for (const n of soDong) {
      expect(n, `số dòng: ${JSON.stringify(soDong)}`).toBeGreaterThanOrEqual(
        SO_DONG_TOI_THIEU,
      )
      expect(n, `số dòng: ${JSON.stringify(soDong)}`).toBeLessThanOrEqual(
        SO_DONG_TOI_DA,
      )
    }
  })

  it('mọi sự kiện đều mang cầu thủ đang trên sân của đúng đội đó', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      const trenSan = {
        nha: new Set(tt.ben.nha.trenSan),
        khach: new Set(tt.ben.khach.trenSan),
      }

      for (const sk of dongSuKien(tt)) {
        for (const id of sk.cacCauThu) {
          expect(trenSan[sk.doi].has(id), `${ma} / ${sk.loai} / ${id}`).toBe(
            true,
          )
        }
      }
    }
  })

  it('dòng sự kiện có mốc hết hiệp và mốc kết thúc', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    const cacLoai = dongSuKien(tt).map((s) => s.loai)
    expect(cacLoai).toContain('bat-dau')
    expect(cacLoai).toContain('het-hiep')
    expect(cacLoai).toContain('ket-thuc')
  })

  it('mọi bàn thắng đều có mặt trong dòng sự kiện', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const tt = chayHetTran(taoTran(cauHinhMau(ma)))
      const soDongBanThang = dongSuKien(tt).filter(
        (s) => s.loai === 'ban-thang',
      ).length
      expect(soDongBanThang, ma).toBe(tt.tiSo.nha + tt.tiSo.khach)
    }
  })

  it('dòng sự kiện đi theo thứ tự thời gian trong từng hiệp', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    const cacDong = dongSuKien(tt)
    const hiep1 = cacDong.filter((s) => s.phut <= PHUT_MOI_HIEP + 10 && !s.buGio)
    const phut = hiep1.map((s) => s.phut)
    expect([...phut].sort((a, b) => a - b)).toEqual(phut)
  })
})

/*
  Đây là phép kiểm mà `/analyze` đòi thêm: nếu hạt giống sống trong closure
  bên ngoài thì hai lần gọi trên CÙNG một trạng thái sẽ ra hai kết quả khác
  nhau, và React gọi đúp là trận lệch — xem ghi chú (1) ở plan III.4.
*/
describe('buocTiep là hàm thuần', () => {
  it('gọi hai lần trên cùng một trạng thái ra hai kết quả giống hệt', () => {
    let tt = taoTran(cauHinhMau(MA))
    for (let i = 0; i < 25; i += 1) {
      const a = buocTiep(tt)
      const b = buocTiep(tt)
      expect(b, `phút ${tt.phut + 1}`).toEqual(a)
      tt = a
    }
  })

  it('không làm đổi trạng thái được truyền vào', () => {
    const tt = taoTran(cauHinhMau(MA))
    const banSao = structuredClone(tt)
    buocTiep(tt)
    expect(tt).toEqual(banSao)
  })

  it('hạt giống đi theo trạng thái và đổi sau mỗi phút', () => {
    const tt = taoTran(cauHinhMau(MA))
    const sau = buocTiep(tt)
    expect(typeof sau.hatGiong).toBe('number')
    expect(sau.hatGiong).not.toBe(tt.hatGiong)
  })
})

describe('thống kê thô, không đi qua bộ lọc mật độ', () => {
  it('số cú sút trong thống kê lớn hơn số dòng cơ hội hiện ra', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    const soDongCoHoi = dongSuKien(tt).filter(
      (s) => s.loai === 'co-hoi',
    ).length
    const tongCuSut = tt.ben.nha.thongKe.cuSut + tt.ben.khach.thongKe.cuSut

    // Nếu hai số này bằng nhau thì thống kê đang bị cắt theo bộ lọc hiển thị
    // — đúng thứ mà `/analyze` cảnh báo (ghi chú (3) plan III.4).
    expect(tongCuSut).toBeGreaterThan(soDongCoHoi)
  })

  it('số bàn thắng khớp với sút trúng đích đã ghi nhận', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    expect(tt.ben.nha.thongKe.sutTrungDich).toBe(tt.tiSo.nha)
    expect(tt.ben.khach.thongKe.sutTrungDich).toBe(tt.tiSo.khach)
  })

  it('đóng góp được ghi theo từng cầu thủ', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    const dongGop = tt.ben.nha.thongKe.dongGopTheoCauThu
    expect(Object.keys(dongGop).length).toBeGreaterThan(0)
    for (const id of Object.keys(dongGop)) {
      expect(tt.ben.nha.trenSan).toContain(id)
    }
  })
})

describe('chiến thuật xuất phát giữ nguyên, tách khỏi bản hiện tại', () => {
  it('sau khi chạy hết trận, bộ xuất phát vẫn là bộ lúc đăng ký', () => {
    const cauHinh = cauHinhMau(MA)
    const tt = chayHetTran(taoTran(cauHinh))
    expect(tt.ben.nha.chienThuatXuatPhat).toEqual(
      cauHinh.nha.chienThuatXuatPhat,
    )
    expect(tt.ben.khach.chienThuatXuatPhat).toEqual(
      cauHinh.khach.chienThuatXuatPhat,
    )
  })
})
