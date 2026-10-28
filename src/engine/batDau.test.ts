import { describe, expect, it } from 'vitest'
import { benMau, cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  kiemTraBatDauDuoc,
  LoiCauHinhTran,
  SO_CAU_THU_CHINH,
  SO_CAU_THU_DU_BI,
  type LyDoKhongBatDau,
} from './batDau'
import { taoTran, type CauHinhTran } from './tran'

const MA = MA_TRAN_CO_DINH[0]

function cacLoaiLyDo(cauHinh: CauHinhTran): LyDoKhongBatDau['loai'][] {
  const kq = kiemTraBatDauDuoc(cauHinh)
  return kq.batDauDuoc ? [] : kq.cacLyDo.map((l) => l.loai)
}

describe('cấu hình hợp lệ thì bắt đầu được', () => {
  it('đội hình mẫu đầy đủ qua được mọi phép kiểm', () => {
    expect(kiemTraBatDauDuoc(cauHinhMau(MA))).toEqual({ batDauDuoc: true })
  })

  it('đúng 11 chính và đúng 7 dự bị là con số AC-9.9 đòi', () => {
    expect(SO_CAU_THU_CHINH).toBe(11)
    expect(SO_CAU_THU_DU_BI).toBe(7)
  })
})

describe('hai bên cùng một đội (AC-8.10)', () => {
  it('không bắt đầu được', () => {
    const cauHinh = cauHinhMau(MA, { khach: benMau('A') })
    expect(cacLoaiLyDo(cauHinh)).toContain('cung-mot-doi')
  })

  it('hai đội khác nhau thì không báo lý do này', () => {
    expect(cacLoaiLyDo(cauHinhMau(MA))).not.toContain('cung-mot-doi')
  })
})

describe('đăng ký 11 chính và 7 dự bị (AC-9.9)', () => {
  it('thiếu cầu thủ chính thì không bắt đầu được', () => {
    const ben = benMau('A')
    const cauHinh = cauHinhMau(MA, {
      nha: { ...ben, trenSan: ben.trenSan.slice(0, 10) },
    })
    expect(cacLoaiLyDo(cauHinh)).toContain('chua-du-chinh')
  })

  it('dự bị ít hơn 7 thì không bắt đầu được', () => {
    const ben = benMau('A')
    const cauHinh = cauHinhMau(MA, {
      nha: { ...ben, duBi: ben.duBi.slice(0, 5) },
    })
    expect(cacLoaiLyDo(cauHinh)).toContain('chua-dung-du-bi')
  })

  it('dự bị NHIỀU hơn 7 cũng không được — AC nói ĐÚNG 7', () => {
    const ben = benMau('A')
    const cauHinh = cauHinhMau(MA, {
      nha: { ...ben, duBi: [...ben.duBi, 'A-99'] },
    })
    expect(cacLoaiLyDo(cauHinh)).toContain('chua-dung-du-bi')
  })

  it('lý do nêu rõ đội nào và thiếu bao nhiêu', () => {
    const ben = benMau('A')
    const kq = kiemTraBatDauDuoc(
      cauHinhMau(MA, { nha: { ...ben, trenSan: ben.trenSan.slice(0, 9) } }),
    )
    expect(kq.batDauDuoc).toBe(false)
    if (kq.batDauDuoc) return

    const ly = kq.cacLyDo.find((l) => l.loai === 'chua-du-chinh')
    expect(ly).toMatchObject({ doi: 'nha', soCo: 9, soCan: 11 })
  })
})

/*
  Phần này đóng nốt AC-5.7: luật "đội hình đủ điều kiện chưa" không viết lại
  ở engine mà gọi thẳng `tinhTrangDoiHinh` của domain — cùng hàm mà dải tình
  trạng ở trang chiến thuật đang dùng.
*/
describe('đội hình chưa đủ điều kiện (AC-8.9, đóng nốt AC-5.7)', () => {
  it('ô thủ môn trống thì không bắt đầu được', () => {
    const ben = benMau('A')
    const khongThuMon = {
      ...ben,
      chienThuatXuatPhat: {
        ...ben.chienThuatXuatPhat,
        oVien: ben.chienThuatXuatPhat.oVien.map((o, i) =>
          i === 0 ? { ...o, playerId: null } : o,
        ),
      },
    }
    expect(cacLoaiLyDo(cauHinhMau(MA, { nha: khongThuMon }))).toContain(
      'doi-hinh-chua-du',
    )
  })

  it('có cầu thủ hồ sơ chưa hoàn tất thì không bắt đầu được', () => {
    const ben = benMau('A')
    const thieuChiSo = {
      ...ben,
      cacCauThu: ben.cacCauThu.map((c, i) =>
        i === 5 ? { ...c, attributes: {} } : c,
      ),
    }
    expect(cacLoaiLyDo(cauHinhMau(MA, { nha: thieuChiSo }))).toContain(
      'doi-hinh-chua-du',
    )
  })

  it('lý do mang theo đúng danh sách lý do của domain', () => {
    const ben = benMau('A')
    const kq = kiemTraBatDauDuoc(
      cauHinhMau(MA, {
        nha: {
          ...ben,
          chienThuatXuatPhat: {
            ...ben.chienThuatXuatPhat,
            oVien: ben.chienThuatXuatPhat.oVien.map((o) => ({
              ...o,
              playerId: null,
            })),
          },
        },
      }),
    )
    expect(kq.batDauDuoc).toBe(false)
    if (kq.batDauDuoc) return

    const ly = kq.cacLyDo.find((l) => l.loai === 'doi-hinh-chua-du')
    expect(ly && 'cacLyDo' in ly && ly.cacLyDo.length).toBeGreaterThan(0)
  })
})

describe('mọi lý do được trả về cùng lúc', () => {
  it('không dừng ở lý do đầu tiên', () => {
    const ben = benMau('A')
    const hong = {
      ...ben,
      trenSan: ben.trenSan.slice(0, 8),
      duBi: ben.duBi.slice(0, 3),
    }
    const loai = cacLoaiLyDo(
      cauHinhMau(MA, { nha: hong, khach: benMau('A') }),
    )

    expect(loai).toContain('cung-mot-doi')
    expect(loai).toContain('chua-du-chinh')
    expect(loai).toContain('chua-dung-du-bi')
  })

  it('lỗi của cả hai đội đều được nêu', () => {
    const benA = benMau('A')
    const benB = benMau('B')
    const kq = kiemTraBatDauDuoc(
      cauHinhMau(MA, {
        nha: { ...benA, duBi: [] },
        khach: { ...benB, duBi: [] },
      }),
    )
    expect(kq.batDauDuoc).toBe(false)
    if (kq.batDauDuoc) return

    const cacDoi = kq.cacLyDo
      .filter((l) => l.loai === 'chua-dung-du-bi')
      .map((l) => ('doi' in l ? l.doi : null))
    expect(cacDoi).toContain('nha')
    expect(cacDoi).toContain('khach')
  })
})

describe('taoTran từ chối cấu hình chưa bắt đầu được', () => {
  it('ném LoiCauHinhTran kèm đủ lý do', () => {
    const ben = benMau('A')
    const cauHinh = cauHinhMau(MA, {
      nha: { ...ben, trenSan: ben.trenSan.slice(0, 7) },
    })

    try {
      taoTran(cauHinh)
      expect.unreachable('phải ném lỗi')
    } catch (loi) {
      expect(loi).toBeInstanceOf(LoiCauHinhTran)
      expect((loi as LoiCauHinhTran).cacLyDo.length).toBeGreaterThan(0)
    }
  })

  it('cấu hình hợp lệ thì không ném', () => {
    expect(() => taoTran(cauHinhMau(MA))).not.toThrow()
  })
})
