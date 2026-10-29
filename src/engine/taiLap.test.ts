import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  apDungCanThiep,
  buocTiep,
  chayHetTran,
  dongSuKien,
  dangKyTuTrangThai,
  PHIEN_BAN_ENGINE,
  taoTran,
  type CanThiep,
  type TrangThaiTran,
} from './tran'

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

describe('phiên bản engine đóng vào trận (quyết định D35)', () => {
  it('taoTran đặt đúng số, và chayHetTran không làm nó đổi', () => {
    const tt = taoTran(cauHinhMau(MA_TRAN_CO_DINH[0]))
    expect(tt.phienBanEngine).toBe(PHIEN_BAN_ENGINE)
    expect(chay(MA_TRAN_CO_DINH[0]).phienBanEngine).toBe(PHIEN_BAN_ENGINE)
  })

  /*
    Vì sao con số này tồn tại: Giai đoạn 4 rút thêm số từ `Rng` để gán hành
    động cho từng cầu thủ, nên mã trận lưu từ Giai đoạn 3 không còn phát lại
    ra đúng trận cũ. P1 hứa cùng đầu vào cho cùng kết quả "ở mọi lần chạy và
    mọi máy", không hứa qua mọi phiên bản — nhưng người dùng phải được nói,
    nên lịch sử trận đấu mang theo số này (T124).
  */
  it('số phiên bản lớn hơn 1, vì Giai đoạn 3 là phiên bản 1', () => {
    expect(PHIEN_BAN_ENGINE).toBeGreaterThan(1)
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

/*
  Phát lại một trận CÓ CAN THIỆP (AC-8.11, quyết định D30).

  P1 định nghĩa phát lại bằng *(mã trận + hai đội + chiến thuật xuất phát hai
  bên + đội chủ nhà + chuỗi can thiệp)*. Phép kiểm dưới đây dựng lại đầu vào
  **từ chính `TrangThaiTran`**, không từ biến cục bộ của test: nếu lấy từ biến
  cục bộ thì test vẫn xanh kể cả khi trạng thái trận đã đánh mất chiến thuật
  xuất phát — đúng cái bẫy mà `/analyze` chỉ ra.
*/

describe('phát lại trận có can thiệp (AC-8.11)', () => {
  /** Chạy một trận và rải ba can thiệp khác loại ở ba phút khác nhau. */
  function chayCoCanThiep(ma: string) {
    let tt = taoTran(cauHinhMau(ma))

    while (!tt.ketThuc) {
      if (tt.phut === 20) {
        tt = apBuoc(tt, {
          phut: tt.phut,
          doi: 'nha',
          noiDung: {
            loai: 'thay-nguoi',
            ra: tt.ben.nha.trenSan[3],
            vao: tt.ben.nha.duBi[0],
          },
        })
      }
      if (tt.phut === 40) {
        tt = apBuoc(tt, {
          phut: tt.phut,
          doi: 'nha',
          noiDung: {
            loai: 'doi-chi-thi',
            chiThi: {
              ...tt.ben.nha.chienThuatHienTai.chiThi,
              'cuong-do-pressing': 'cao',
            },
          },
        })
      }
      if (tt.phut === 60) {
        const o = tt.ben.nha.chienThuatHienTai.oVien.find(
          (x) => x.roleId === 'tien-dao-cat-mat',
        )
        if (o) {
          tt = apBuoc(tt, {
            phut: tt.phut,
            doi: 'nha',
            noiDung: {
              loai: 'doi-vai-tro',
              slotId: o.slotId,
              roleId: 'tien-dao-muc-tieu',
            },
          })
        }
      }
      tt = buocTiep(tt)
    }

    return tt
  }

  function apBuoc(tt: TrangThaiTran, ct: CanThiep): TrangThaiTran {
    const kq = apDungCanThiep(tt, ct)
    return kq.thanhCong ? kq.trangThai : tt
  }

  /** Dựng lại trận từ chính trạng thái cuối, rồi áp lại đúng nhật ký. */
  function phatLaiTu(xong: TrangThaiTran): TrangThaiTran {
    let tt = taoTran({
      maTran: xong.maTran,
      sanTrungLap: xong.sanTrungLap,
      doiCuaNguoiDung: xong.doiCuaNguoiDung,
      nha: dangKyTuTrangThai(xong.ben.nha),
      khach: dangKyTuTrangThai(xong.ben.khach),
    })

    const conLai = [...xong.canThiep]
    while (!tt.ketThuc) {
      while (conLai.length > 0 && conLai[0].phut === tt.phut) {
        const ct = conLai.shift()
        if (ct) tt = apBuoc(tt, ct)
      }
      tt = buocTiep(tt)
    }
    return tt
  }

  it('cùng mã trận và cùng chuỗi can thiệp ra đúng từng dòng', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const goc = chayCoCanThiep(ma)
      expect(goc.canThiep.length, ma).toBeGreaterThanOrEqual(3)

      const phatLai = phatLaiTu(goc)

      expect(phatLai.tiSo, ma).toEqual(goc.tiSo)
      expect(dongSuKien(phatLai), ma).toEqual(dongSuKien(goc))
    }
  })

  it('bỏ một can thiệp khỏi chuỗi thì trận khác đi', () => {
    const goc = chayCoCanThiep(MA_TRAN_CO_DINH[0])
    const thieu: TrangThaiTran = {
      ...goc,
      canThiep: goc.canThiep.slice(1),
    }

    expect(dongSuKien(phatLaiTu(thieu))).not.toEqual(dongSuKien(goc))
  })
})
