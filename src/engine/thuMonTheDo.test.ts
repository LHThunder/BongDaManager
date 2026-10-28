import { describe, expect, it } from 'vitest'
import { mucSaiViTri } from '../domain/misplacement'
import { benMau, cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import {
  apDungCanThiep,
  buocTiep,
  khungThanhCoThuMon,
  nguoiTrongKhung,
  taoTran,
  type BenTran,
  type CanThiep,
  type TrangThaiTran,
} from './tran'

/*
  Thủ môn nhận thẻ đỏ (spec mục 5, task T096).

  Dòng của spec: "Người dùng phải chọn một cầu thủ trên sân vào bắt gôn, bị trừ
  hiệu suất ở mức sai nặng; nếu còn lượt thay người thì được đưa thủ môn dự bị
  vào thay một cầu thủ khác."

  Test KHÔNG chờ engine tự rút thẻ đỏ cho thủ môn — chuyện đó có xác suất rất
  nhỏ và phụ thuộc mã trận. Thay vào đó dựng đúng cái trạng thái mà thẻ đỏ để
  lại: người giữ khung không còn trong `trenSan`, còn ô thủ môn vẫn mang tên họ.
*/

const MA = MA_TRAN_CO_DINH[0]

/** Số áo 12 (người dự bị đầu tiên) là thủ môn thực thụ. */
function cauHinhCoThuMonDuBi() {
  return cauHinhMau(MA, {
    nha: benMau('A', { ghiDeViTri: { 12: ['GK'] } }),
  })
}

/** Dựng lại thế trận ngay sau khi thủ môn đội nhà bị đuổi. */
function sauTheDoThuMon(tt: TrangThaiTran): TrangThaiTran {
  const thuMon = nguoiTrongKhung(tt.ben.nha)
  if (thuMon === null) throw new Error('đội mẫu phải có thủ môn trong khung')

  const nha: BenTran = {
    ...tt.ben.nha,
    trenSan: tt.ben.nha.trenSan.filter((id) => id !== thuMon),
    the: { ...tt.ben.nha.the, [thuMon]: 'do' },
    thongKe: { ...tt.ben.nha.thongKe, theDo: tt.ben.nha.thongKe.theDo + 1 },
  }
  return { ...tt, ben: { ...tt.ben, nha } }
}

function vaoBatGon(tt: TrangThaiTran, playerId: string): CanThiep {
  return { phut: tt.phut, doi: 'nha', noiDung: { loai: 'vao-bat-gon', playerId } }
}

function ap(tt: TrangThaiTran, ct: CanThiep): TrangThaiTran {
  const kq = apDungCanThiep(tt, ct)
  if (!kq.thanhCong) throw new Error(`can thiệp bị từ chối: ${kq.lyDo}`)
  return kq.trangThai
}

function tuChoi(tt: TrangThaiTran, ct: CanThiep): string {
  const kq = apDungCanThiep(tt, ct)
  if (kq.thanhCong) throw new Error('can thiệp lẽ ra phải bị từ chối')
  return kq.lyDo
}

function tranOPhut(phut: number, cauHinh = cauHinhMau(MA)): TrangThaiTran {
  let tt = taoTran(cauHinh)
  for (let i = 0; i < phut; i += 1) tt = buocTiep(tt)
  return tt
}

/** slotId của ô mà một cầu thủ đang đứng, hay null khi họ không ở ô nào. */
function oCuaNguoi(ben: BenTran, playerId: string): string | null {
  return (
    ben.chienThuatHienTai.oVien.find((o) => o.playerId === playerId)?.slotId ??
    null
  )
}

describe('khung thành sau thẻ đỏ của thủ môn', () => {
  it('đội còn đủ thủ môn thì khung thành không bỏ trống', () => {
    const tt = tranOPhut(20)
    expect(nguoiTrongKhung(tt.ben.nha)).toBe('A-1')
    expect(khungThanhCoThuMon(tt.ben.nha)).toBe(true)
  })

  it('thủ môn rời sân thì khung thành bỏ trống, dù ô vẫn mang tên họ', () => {
    const tt = sauTheDoThuMon(tranOPhut(20))

    expect(oCuaNguoi(tt.ben.nha, 'A-1')).not.toBeNull()
    expect(nguoiTrongKhung(tt.ben.nha)).toBeNull()
    expect(khungThanhCoThuMon(tt.ben.nha)).toBe(false)
  })
})

describe('chọn một cầu thủ trên sân vào bắt gôn (spec mục 5)', () => {
  it('người được chọn đứng vào ô thủ môn và bỏ trống ô cũ của mình', () => {
    const truoc = sauTheDoThuMon(tranOPhut(20))
    const chuaChay = truoc.ben.nha.trenSan[5]
    const oCu = oCuaNguoi(truoc.ben.nha, chuaChay)

    const tt = buocTiep(ap(truoc, vaoBatGon(truoc, chuaChay)))

    expect(nguoiTrongKhung(tt.ben.nha)).toBe(chuaChay)
    // Đội chỉ còn 10 người, nên đúng là phải còn một ô trống.
    expect(
      tt.ben.nha.chienThuatHienTai.oVien.find((o) => o.slotId === oCu)
        ?.playerId,
    ).toBeNull()
    expect(tt.ben.nha.trenSan).toHaveLength(10)
  })

  it('người bắt gôn chữa cháy bị tính mức sai nặng', () => {
    const truoc = sauTheDoThuMon(tranOPhut(20))
    const chuaChay = truoc.ben.nha.trenSan[5]
    const hoSo = truoc.ben.nha.cacCauThu.find((c) => c.id === chuaChay)

    expect(hoSo).toBeDefined()
    expect(mucSaiViTri('GK', hoSo?.positions ?? [])).toBe('nang')

    // Và khung thành vẫn được coi là KHÔNG có thủ môn thực thụ.
    const tt = buocTiep(ap(truoc, vaoBatGon(truoc, chuaChay)))
    expect(khungThanhCoThuMon(tt.ben.nha)).toBe(false)
  })

  it('can thiệp này không tốn lượt thay người', () => {
    const truoc = sauTheDoThuMon(tranOPhut(20))
    const tt = buocTiep(ap(truoc, vaoBatGon(truoc, truoc.ben.nha.trenSan[5])))

    expect(tt.ben.nha.soLanThay).toBe(0)
  })
})

describe('những lúc không cho chọn người bắt gôn', () => {
  it('khung thành còn thủ môn thực thụ thì từ chối', () => {
    const tt = tranOPhut(20)
    expect(tuChoi(tt, vaoBatGon(tt, tt.ben.nha.trenSan[5]))).toBe(
      'khung-thanh-da-co-thu-mon',
    )
  })

  it('chọn người không có trên sân thì từ chối', () => {
    const tt = sauTheDoThuMon(tranOPhut(20))
    expect(tuChoi(tt, vaoBatGon(tt, tt.ben.nha.duBi[0]))).toBe(
      'cau-thu-khong-tren-san',
    )
    // Kể cả chính thủ môn vừa bị đuổi.
    expect(tuChoi(tt, vaoBatGon(tt, 'A-1'))).toBe('cau-thu-khong-tren-san')
  })

  it('chọn đúng người đang bắt gôn thì từ chối', () => {
    const truoc = sauTheDoThuMon(tranOPhut(20))
    const chuaChay = truoc.ben.nha.trenSan[5]
    const tt = buocTiep(ap(truoc, vaoBatGon(truoc, chuaChay)))

    expect(tuChoi(tt, vaoBatGon(tt, chuaChay))).toBe('cau-thu-da-bat-gon')
  })

  it('đội còn lại không chọn được gì', () => {
    const tt = sauTheDoThuMon(tranOPhut(20))
    const kq = apDungCanThiep(tt, {
      phut: tt.phut,
      doi: 'khach',
      noiDung: { loai: 'vao-bat-gon', playerId: tt.ben.khach.trenSan[5] },
    })

    expect(kq.thanhCong).toBe(false)
  })
})

describe('đưa thủ môn dự bị vào thay một cầu thủ khác (spec mục 5)', () => {
  it('thủ môn dự bị vào sân rồi nhận lại khung thành, người chữa cháy ra ô ngoài', () => {
    const cauHinh = cauHinhCoThuMonDuBi()
    const thuMonDuBi = 'A-12'

    // Bước 1: thủ môn bị đuổi, một cầu thủ sân vào bắt gôn chữa cháy.
    const sauThe = sauTheDoThuMon(tranOPhut(20, cauHinh))
    const chuaChay = sauThe.ben.nha.trenSan[5]
    let tt = buocTiep(ap(sauThe, vaoBatGon(sauThe, chuaChay)))
    expect(nguoiTrongKhung(tt.ben.nha)).toBe(chuaChay)

    // Bước 2: đổi một cầu thủ sân khác lấy thủ môn dự bị.
    const nguoiRa = tt.ben.nha.trenSan.filter((id) => id !== chuaChay)[0]
    tt = buocTiep(
      ap(tt, {
        phut: tt.phut,
        doi: 'nha',
        noiDung: { loai: 'thay-nguoi', ra: nguoiRa, vao: thuMonDuBi },
      }),
    )
    const oCuaThuMonDuBi = oCuaNguoi(tt.ben.nha, thuMonDuBi)
    expect(tt.ben.nha.trenSan).toContain(thuMonDuBi)
    expect(tt.ben.nha.soLanThay).toBe(1)

    // Bước 3: thủ môn dự bị nhận găng; người chữa cháy nhận lại ô vừa trống.
    tt = buocTiep(ap(tt, vaoBatGon(tt, thuMonDuBi)))

    expect(nguoiTrongKhung(tt.ben.nha)).toBe(thuMonDuBi)
    expect(khungThanhCoThuMon(tt.ben.nha)).toBe(true)
    expect(oCuaNguoi(tt.ben.nha, chuaChay)).toBe(oCuaThuMonDuBi)
    expect(tt.ben.nha.trenSan).toHaveLength(10)
  })

  it('hết lượt thay thì vẫn chữa cháy được bằng người trên sân', () => {
    let tt = sauTheDoThuMon(tranOPhut(20))
    tt = { ...tt, ben: { ...tt.ben, nha: { ...tt.ben.nha, soLanThay: 5 } } }

    const chuaChay = tt.ben.nha.trenSan[5]
    tt = buocTiep(ap(tt, vaoBatGon(tt, chuaChay)))

    expect(nguoiTrongKhung(tt.ben.nha)).toBe(chuaChay)
  })
})

describe('phát lại trận có người vào bắt gôn (AC-8.11)', () => {
  it('cùng chuỗi can thiệp thì ra đúng cùng diễn biến', () => {
    function chay() {
      let tt = sauTheDoThuMon(tranOPhut(20))
      tt = ap(tt, vaoBatGon(tt, tt.ben.nha.trenSan[5]))
      while (!tt.ketThuc) tt = buocTiep(tt)
      return tt
    }

    const a = chay()
    const b = chay()

    expect(a.canThiep).toHaveLength(1)
    expect(b.tiSo).toEqual(a.tiSo)
    expect(b).toEqual(a)
  })
})
