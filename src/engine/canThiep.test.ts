import { describe, expect, it } from 'vitest'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  apDungCanThiep,
  buocTiep,
  chayHetTran,
  dongSuKien,
  SO_LAN_THAY_TOI_DA,
  taoTran,
  type CanThiep,
  type TrangThaiTran,
} from './tran'

const MA = MA_TRAN_CO_DINH[0]

function tranOPhut(phut: number): TrangThaiTran {
  let tt = taoTran(cauHinhMau(MA))
  for (let i = 0; i < phut; i += 1) tt = buocTiep(tt)
  return tt
}

/**
 * Thay người thứ `i` của đội nhà. Người VÀO luôn lấy đầu danh sách dự bị, vì
 * danh sách đó ngắn đi sau mỗi lần thay — lấy theo `i` thì tới lần thứ năm là
 * trỏ ra ngoài mảng.
 */
function thayNguoi(tt: TrangThaiTran, i = 0): CanThiep {
  return {
    phut: tt.phut,
    doi: 'nha',
    noiDung: {
      loai: 'thay-nguoi',
      ra: tt.ben.nha.trenSan[i],
      vao: tt.ben.nha.duBi[0],
    },
  }
}

function ap(tt: TrangThaiTran, ct: CanThiep): TrangThaiTran {
  const kq = apDungCanThiep(tt, ct)
  if (!kq.thanhCong) throw new Error(`can thiệp bị từ chối: ${kq.lyDo}`)
  return kq.trangThai
}

describe('thay người (AC-9.5)', () => {
  it('người vào sân thay người ra, và dự bị bớt một', () => {
    let tt = tranOPhut(30)
    const ra = tt.ben.nha.trenSan[0]
    const vao = tt.ben.nha.duBi[0]

    tt = buocTiep(ap(tt, thayNguoi(tt)))

    expect(tt.ben.nha.trenSan).toContain(vao)
    expect(tt.ben.nha.trenSan).not.toContain(ra)
    expect(tt.ben.nha.duBi).not.toContain(vao)
    expect(tt.ben.nha.soLanThay).toBe(1)
  })

  it('người vào sân chiếm đúng ô của người ra, giữ nguyên vai trò', () => {
    let tt = tranOPhut(30)
    const ra = tt.ben.nha.trenSan[0]
    const vao = tt.ben.nha.duBi[0]
    const oCu = tt.ben.nha.chienThuatHienTai.oVien.find(
      (o) => o.playerId === ra,
    )

    tt = buocTiep(ap(tt, thayNguoi(tt)))

    const oMoi = tt.ben.nha.chienThuatHienTai.oVien.find(
      (o) => o.playerId === vao,
    )
    expect(oMoi?.slotId).toBe(oCu?.slotId)
    expect(oMoi?.roleId).toBe(oCu?.roleId)
  })

  it('dòng sự kiện có dòng thay người tại đúng phút', () => {
    let tt = tranOPhut(30)
    const vao = tt.ben.nha.duBi[0]
    tt = buocTiep(ap(tt, thayNguoi(tt)))

    const dong = dongSuKien(tt).find((s) => s.loai === 'thay-nguoi')
    expect(dong).toBeTruthy()
    expect(dong?.cacCauThu).toContain(vao)
    expect(dong?.phut).toBe(31)
  })

  it('các phút sau tính theo người mới: người ra không còn xuất hiện', () => {
    let tt = tranOPhut(20)
    const ra = tt.ben.nha.trenSan[0]
    tt = buocTiep(ap(tt, thayNguoi(tt)))
    const soUngVienSauThay = tt.ungVien.length

    tt = chayHetTran(tt)

    for (const uv of tt.ungVien.slice(soUngVienSauThay)) {
      if (uv.suKien.doi !== 'nha') continue
      expect(uv.suKien.cacCauThu, `phút ${uv.suKien.phut}`).not.toContain(ra)
    }
  })
})

describe('hết lượt thay người (AC-9.6)', () => {
  it('lần thay thứ 6 bị từ chối', () => {
    let tt = tranOPhut(10)

    for (let i = 0; i < SO_LAN_THAY_TOI_DA; i += 1) {
      tt = buocTiep(ap(tt, thayNguoi(tt, i)))
    }
    expect(tt.ben.nha.soLanThay).toBe(SO_LAN_THAY_TOI_DA)

    const lanThu6 = apDungCanThiep(tt, thayNguoi(tt, 5))
    expect(lanThu6).toEqual({ thanhCong: false, lyDo: 'het-luot-thay' })
  })
})

describe('chỉ can thiệp được đội của mình (AC-9.8)', () => {
  it('thay người của đội khách bị từ chối', () => {
    const tt = tranOPhut(10)
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'khach',
      noiDung: {
        loai: 'thay-nguoi',
        ra: tt.ben.khach.trenSan[0],
        vao: tt.ben.khach.duBi[0],
      },
    })
    expect(kq).toEqual({ thanhCong: false, lyDo: 'khong-phai-doi-cua-ban' })
  })

  it('đổi chỉ thị của đội khách cũng bị từ chối', () => {
    const tt = tranOPhut(10)
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'khach',
      noiDung: { loai: 'doi-chi-thi', chiThi: CHI_THI_MAC_DINH },
    })
    expect(kq.thanhCong).toBe(false)
  })
})

describe('can thiệp không hợp lệ bị từ chối', () => {
  it('người ra không có trên sân', () => {
    const tt = tranOPhut(10)
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'thay-nguoi',
        ra: 'khong-ton-tai',
        vao: tt.ben.nha.duBi[0],
      },
    })
    expect(kq).toEqual({ thanhCong: false, lyDo: 'cau-thu-khong-tren-san' })
  })

  it('người vào không nằm trong 7 dự bị', () => {
    const tt = tranOPhut(10)
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'thay-nguoi',
        ra: tt.ben.nha.trenSan[0],
        vao: 'nguoi-la',
      },
    })
    expect(kq).toEqual({
      thanhCong: false,
      lyDo: 'cau-thu-khong-trong-du-bi',
    })
  })

  it('vai trò không dùng được cho vị trí của ô', () => {
    const tt = tranOPhut(10)
    const oThuMon = tt.ben.nha.chienThuatHienTai.oVien[0]
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'doi-vai-tro',
        slotId: oThuMon.slotId,
        roleId: 'tien-dao-cat-mat',
      },
    })
    expect(kq).toEqual({ thanhCong: false, lyDo: 'vai-tro-khong-phu-hop' })
  })

  it('trận đã kết thúc thì không can thiệp được', () => {
    const tt = chayHetTran(taoTran(cauHinhMau(MA)))
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'thay-nguoi',
        ra: tt.ben.nha.trenSan[0],
        vao: tt.ben.nha.duBi[0],
      },
    })
    expect(kq).toEqual({ thanhCong: false, lyDo: 'tran-da-ket-thuc' })
  })
})

/*
  AC-9.7 là chỗ dễ sai nhất: can thiệp chỉ được ảnh hưởng từ phút hiện tại
  trở đi, còn những phút đã qua phải giữ nguyên không bị tính lại.
*/
describe('can thiệp chỉ ảnh hưởng từ phút hiện tại trở đi (AC-9.7)', () => {
  it('các dòng sự kiện đã phát không đổi một dòng', () => {
    let tt = tranOPhut(40)
    const truoc = dongSuKien(tt)

    tt = ap(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'doi-chi-thi',
        chiThi: { ...CHI_THI_MAC_DINH, 'cuong-do-pressing': 'cao' },
      },
    })
    tt = buocTiep(tt)

    expect(dongSuKien(tt).slice(0, truoc.length)).toEqual(truoc)
  })

  it('đổi chỉ thị rồi thì các phút sau chạy theo cấu hình mới', () => {
    let tt = tranOPhut(10)
    tt = ap(tt, {
      phut: tt.phut,
      doi: 'nha',
      noiDung: {
        loai: 'doi-chi-thi',
        chiThi: { ...CHI_THI_MAC_DINH, 'huong-tan-cong': 'bien' },
      },
    })
    tt = buocTiep(tt)

    expect(tt.ben.nha.chienThuatHienTai.chiThi['huong-tan-cong']).toBe('bien')
    // Bộ XUẤT PHÁT không đổi — đó là một vế của đầu vào phát lại (P1).
    expect(tt.ben.nha.chienThuatXuatPhat.chiThi['huong-tan-cong']).toBe(
      'can-bang',
    )
  })

  it('đổi vai trò chỉ chạm đúng ô được chỉ định', () => {
    let tt = tranOPhut(10)
    const oTienDao = tt.ben.nha.chienThuatHienTai.oVien.find(
      (o) => o.roleId === 'tien-dao-cat-mat',
    )
    expect(oTienDao).toBeTruthy()
    if (!oTienDao) return

    const truoc = tt.ben.nha.chienThuatHienTai.oVien.map((o) => o.roleId)
    tt = buocTiep(
      ap(tt, {
        phut: tt.phut,
        doi: 'nha',
        noiDung: {
          loai: 'doi-vai-tro',
          slotId: oTienDao.slotId,
          roleId: 'tien-dao-muc-tieu',
        },
      }),
    )

    const sau = tt.ben.nha.chienThuatHienTai.oVien
    expect(
      sau.find((o) => o.slotId === oTienDao.slotId)?.roleId,
    ).toBe('tien-dao-muc-tieu')
    expect(
      sau.filter((o, i) => o.slotId !== oTienDao.slotId && o.roleId !== truoc[i]),
    ).toEqual([])
  })

  it('can thiệp được ghi vào nhật ký kèm phút', () => {
    let tt = tranOPhut(25)
    tt = ap(tt, thayNguoi(tt))

    expect(tt.canThiep).toHaveLength(1)
    expect(tt.canThiep[0].phut).toBe(25)
    expect(tt.canThiep[0].noiDung.loai).toBe('thay-nguoi')
  })

  it('hàng đợi được dọn sau khi áp, không áp lại lần hai', () => {
    let tt = tranOPhut(25)
    tt = buocTiep(ap(tt, thayNguoi(tt)))

    expect(tt.canThiepChoAp).toEqual([])
    tt = buocTiep(tt)
    expect(tt.ben.nha.soLanThay).toBe(1)
  })
})

/*
  Bất biến mà `/analyze` đòi thêm: AC-8.2 chỉ được kiểm ở T070, trước khi có
  thẻ đỏ và thay người. Ở đây kiểm lại trên trận CÓ CẢ HAI.
*/
describe('không dòng nào nhắc tên người đã rời sân (AC-8.2)', () => {
  it('mọi cầu thủ trong sự kiện đều đang trên sân tại đúng phút đó', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      let tt = taoTran(cauHinhMau(ma))
      let daThay = 0

      while (!tt.ketThuc) {
        // Rải vài lần thay người dọc trận để chắc chắn đi qua đường đó.
        if (daThay < 3 && tt.phut > 0 && tt.phut % 20 === 0) {
          const kq = apDungCanThiep(tt, thayNguoi(tt, daThay))
          if (kq.thanhCong) {
            tt = kq.trangThai
            daThay += 1
          }
        }

        /*
          Ảnh chụp phải tính CẢ người vào sân ở đầu phút này.

          `buocTiep` áp hàng đợi can thiệp TRƯỚC khi mô phỏng (quyết định
          D30b), nên người vừa vào sân có mặt thật trong các tình huống của
          chính phút đó — và họ hợp lệ trong MỌI loại dòng, không riêng dòng
          thay người. Bản đầu của phép kiểm miễn trừ theo *loại sự kiện* thay
          vì theo *người*, nên nó đỏ ngay khi một người mới vào sân kịp cướp
          được bóng trong phút đó.
        */
        const vaoSanPhutNay = {
          nha: new Set<string>(),
          khach: new Set<string>(),
        }
        for (const ct of tt.canThiepChoAp) {
          if (ct.noiDung.loai === 'thay-nguoi') {
            vaoSanPhutNay[ct.doi].add(ct.noiDung.vao)
          }
        }

        const truocKhiChay = {
          nha: new Set([...tt.ben.nha.trenSan, ...vaoSanPhutNay.nha]),
          khach: new Set([...tt.ben.khach.trenSan, ...vaoSanPhutNay.khach]),
        }
        const soCu = tt.ungVien.length
        tt = buocTiep(tt)

        for (const uv of tt.ungVien.slice(soCu)) {
          for (const id of uv.suKien.cacCauThu) {
            /*
              Người ĐÃ RỜI SÂN thì không được xuất hiện ở bất cứ dòng nào.

              Hỏi cả hai đội chứ không riêng đội của dòng: từ T132 một pha
              tranh chấp mang theo cả người đoạt bóng bên kia. Dòng thay
              người là ngoại lệ vì nó nhắc đúng người vừa rời sân.
            */
            const hopLe =
              truocKhiChay.nha.has(id) ||
              truocKhiChay.khach.has(id) ||
              uv.suKien.loai === 'thay-nguoi'
            expect(
              hopLe,
              `${ma} phút ${tt.phut} / ${uv.suKien.loai} / ${id}`,
            ).toBe(true)
          }
        }
      }

      expect(daThay, ma).toBeGreaterThan(0)
    }
  })
})
