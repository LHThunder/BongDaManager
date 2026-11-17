import { describe, expect, it } from 'vitest'

import { dungBaoCao } from '../engine/baoCao'
import {
  benMauQuanSo,
  cauHinhMau,
  MA_TRAN_CO_DINH,
} from '../engine/__fixtures__/doiMau'
import {
  apDungCanThiep,
  buocTiep,
  dangKyTuTrangThai,
  dongSuKien,
  phutHienThi,
  taoTran,
  tongPhutTran,
  type CanThiep,
  type CauHinhTran,
  type TrangThaiTran,
} from '../engine/tran'
import type { AnhChupDoi, TranDaLuu } from '../storage/db'

import {
  cauHinhTuBanGhi,
  chayNotTuDiemRe,
  dongSuKienNhanh,
  khoangPhutRe,
  khoangPhutReHienThi,
  phatLaiToiPhut,
  phutReDuoc,
  phutThucTe,
  reNhanh,
  trangThaiDauTran,
} from './phatLai'

/*
  Phát lại và rẽ nhánh (US-27).

  Hai phép kiểm XƯƠNG SỐNG của lát này là T429 và T430, và chúng đáng tin
  được vì bản ghi dùng để phát lại **không phải bản ghi viết tay**: nó được
  dựng từ một trận chạy thật, bằng đúng phép ánh xạ mà `useMatch.dungBanGhi`
  dùng khi lưu vào lịch sử. Viết tay một `TranDaLuu` thì test sẽ xanh kể cả
  khi lớp lưu trữ đánh mất một trường mà phát lại cần.
*/

function apBuoc(tt: TrangThaiTran, ct: CanThiep): TrangThaiTran {
  const kq = apDungCanThiep(tt, ct)
  return kq.thanhCong ? kq.trangThai : tt
}

function anhChup(teamId: string): AnhChupDoi {
  return {
    teamId,
    ten: teamId,
    mauChinh: '#334155',
    mauPhu: '#f8fafc',
    logoImageId: null,
  }
}

/** Những can thiệp mà trận mẫu sẽ thực hiện, tính theo trạng thái lúc đó. */
type KeHoachCanThiep = (tt: TrangThaiTran) => readonly CanThiep[]

/** Trận mẫu: chạy thật, rồi gói lại thành bản ghi đúng như ứng dụng lưu. */
function tranDaLuuMau(
  maTran: string,
  keHoach: KeHoachCanThiep = () => [],
  ghiDe: Partial<CauHinhTran> = {},
): TranDaLuu {
  let tt = taoTran(cauHinhMau(maTran, ghiDe))
  const chanCung = tongPhutTran(tt) + 2

  for (let i = 0; i < chanCung && !tt.ketThuc; i += 1) {
    for (const ct of keHoach(tt)) {
      if (ct.phut === tt.phut) tt = apBuoc(tt, ct)
    }
    tt = buocTiep(tt)
  }

  return {
    id: `luu-${maTran}`,
    maTran: tt.maTran,
    phienBanEngine: tt.phienBanEngine,
    ketThucLuc: 0,
    tiSo: tt.tiSo,
    quanSo: tt.quanSo,
    thoiLuong: tt.thoiLuong,
    doiChuNha: anhChup(tt.ben.nha.teamId),
    doiKhach: anhChup(tt.ben.khach.teamId),
    sanTrungLap: tt.sanTrungLap,
    doiCuaNguoiDung: tt.doiCuaNguoiDung,
    nha: dangKyTuTrangThai(tt.ben.nha),
    khach: dangKyTuTrangThai(tt.ben.khach),
    canThiep: tt.canThiep,
    cacSuKien: dongSuKien(tt),
    baoCao: dungBaoCao(tt),
  }
}

/** Ba can thiệp khác loại ở ba phút khác nhau, như một trận có người điều khiển. */
const BA_CAN_THIEP: KeHoachCanThiep = (tt) => {
  if (tt.phut === 20) {
    return [
      {
        phut: 20,
        doi: 'nha',
        noiDung: {
          loai: 'thay-nguoi',
          ra: tt.ben.nha.trenSan[3],
          vao: tt.ben.nha.duBi[0],
        },
      },
    ]
  }
  if (tt.phut === 40) {
    return [
      {
        phut: 40,
        doi: 'nha',
        noiDung: {
          loai: 'doi-chi-thi',
          chiThi: {
            ...tt.ben.nha.chienThuatHienTai.chiThi,
            'cuong-do-pressing': 'cao',
          },
        },
      },
    ]
  }
  if (tt.phut === 70) {
    return [
      {
        phut: 70,
        doi: 'nha',
        noiDung: {
          loai: 'thay-nguoi',
          ra: tt.ben.nha.trenSan[7],
          vao: tt.ben.nha.duBi[0],
        },
      },
    ]
  }
  return []
}

/** Một bộ chỉ thị khác hẳn, để quyết định mới chắc chắn tạo ra khác biệt. */
function chiThiKhac(tt: TrangThaiTran): CanThiep['noiDung'] {
  return {
    loai: 'doi-chi-thi',
    chiThi: {
      ...tt.ben.nha.chienThuatHienTai.chiThi,
      'cuong-do-pressing': 'cao',
      'do-cao-doi-hinh': 'cao',
      'toc-do-chuyen-bong': 'nhanh',
    },
  }
}

describe('dựng cấu hình từ bản ghi đã lưu (T427, AC-27.1)', () => {
  it('mang đúng mã trận, hai đội, quân số, thời lượng và cờ sân trung lập', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0])
    const cauHinh = cauHinhTuBanGhi(banGhi)

    expect(cauHinh.maTran).toBe(banGhi.maTran)
    expect(cauHinh.nha.teamId).toBe(banGhi.nha.teamId)
    expect(cauHinh.khach.teamId).toBe(banGhi.khach.teamId)
    expect(cauHinh.nha.trenSan).toEqual(banGhi.nha.trenSan)
    expect(cauHinh.khach.duBi).toEqual(banGhi.khach.duBi)
    expect(cauHinh.nha.cacCauThu).toEqual(banGhi.nha.cacCauThu)
    expect(cauHinh.quanSo).toBe(banGhi.quanSo)
    expect(cauHinh.thoiLuong).toBe(banGhi.thoiLuong)
    expect(cauHinh.sanTrungLap).toBe(banGhi.sanTrungLap)
    expect(cauHinh.doiCuaNguoiDung).toBe(banGhi.doiCuaNguoiDung)
  })

  it('sân trung lập và đội khách điều khiển cũng đi qua nguyên vẹn', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[1], () => [], {
      sanTrungLap: true,
      doiCuaNguoiDung: 'khach',
    })
    const cauHinh = cauHinhTuBanGhi(banGhi)

    expect(cauHinh.sanTrungLap).toBe(true)
    expect(cauHinh.doiCuaNguoiDung).toBe('khach')
  })

  /*
    Bản ghi lưu TRƯỚC spec 002 không có `quanSo`/`thoiLuong`. Lúc ấy ứng dụng
    chỉ đá được 11 người 90 phút, nên hai con số là sự thật chắc chắn — và
    chỗ điền chúng chỉ được có MỘT, là `matchRepo` (AC-16.1, AC-16.2).
  */
  it('bản ghi cũ thiếu quân số và thời lượng thì được điền 11 và 90', () => {
    const day = tranDaLuuMau(MA_TRAN_CO_DINH[2])
    const cu: TranDaLuu = { ...day, quanSo: undefined, thoiLuong: undefined }

    const cauHinh = cauHinhTuBanGhi(cu)
    expect(cauHinh.quanSo).toBe(11)
    expect(cauHinh.thoiLuong).toBe(90)
  })

  it('trận 7 người 45 phút giữ đúng quân số và thời lượng của nó', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[3], () => [], {
      quanSo: 7,
      thoiLuong: 45,
      nha: benMauQuanSo('A', 7),
      khach: benMauQuanSo('B', 7),
    })

    const cauHinh = cauHinhTuBanGhi(banGhi)
    expect(cauHinh.quanSo).toBe(7)
    expect(cauHinh.thoiLuong).toBe(45)
    expect(cauHinh.nha.trenSan).toHaveLength(7)
  })
})

/*
  Phút hiển thị ↔ phút đồng hồ.

  Người dùng chọn điểm rẽ bằng cách bấm một dòng tường thuật, mà dòng tường
  thuật mang phút HIỂN THỊ — hiệp hai của nó đã bị trừ đi bù giờ hiệp một.
  Lấy thẳng con số ấy làm phút rẽ là rẽ sớm hơn tới 5 phút, một cách im lặng.
*/
describe('đổi phút hiển thị về phút đồng hồ', () => {
  it('là phép nghịch đảo đúng của phutHienThi, ở mọi phút của trận', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 4)) {
      const tt0 = trangThaiDauTran(tranDaLuuMau(ma))
      for (let phut = 1; phut <= tongPhutTran(tt0); phut += 1) {
        expect(phutThucTe(tt0, phutHienThi(tt0, phut)), `${ma} phút ${phut}`).toBe(
          phut,
        )
      }
    }
  })

  it('bù giờ hiệp một và đầu hiệp hai không lẫn vào nhau', () => {
    const tt0 = trangThaiDauTran(tranDaLuuMau(MA_TRAN_CO_DINH[0]))
    const buGio1 = tt0.buGio.hiep1

    // "45+1" là phút đồng hồ 46; còn "46" không bù giờ là phút 46 + bù giờ hiệp một.
    expect(phutThucTe(tt0, { phut: 46, buGio: true })).toBe(46)
    expect(phutThucTe(tt0, { phut: 46, buGio: false })).toBe(46 + buGio1)
    // "90+1" nằm sau toàn bộ bù giờ hiệp một.
    expect(phutThucTe(tt0, { phut: 91, buGio: true })).toBe(91 + buGio1)
  })

  it('khoảng phút rẽ nói bằng phút người dùng đọc, không bằng phút đồng hồ', () => {
    const tt0 = trangThaiDauTran(tranDaLuuMau(MA_TRAN_CO_DINH[0]))
    const hien = khoangPhutReHienThi(tt0)

    expect(hien.tu).toBe(1)
    expect(hien.den).toBe(khoangPhutRe(tt0).den - tt0.buGio.hiep1)
  })
})

describe('khoảng phút rẽ nhánh được (AC-27.8)', () => {
  it('từ phút 1 tới phút cuối trừ một, tính cả bù giờ', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0])
    const tt0 = trangThaiDauTran(banGhi)
    const khoang = khoangPhutRe(tt0)

    expect(khoang.tu).toBe(1)
    expect(khoang.den).toBe(tongPhutTran(tt0) - 1)
    // Bù giờ hai hiệp luôn ít nhất 1 phút mỗi hiệp, nên trận 90 phút dài hơn 90.
    expect(khoang.den).toBeGreaterThan(90)
  })

  it('phút 0, phút âm, phút quá trận và phút lẻ đều bị từ chối', () => {
    const tt0 = trangThaiDauTran(tranDaLuuMau(MA_TRAN_CO_DINH[0]))
    const den = khoangPhutRe(tt0).den

    expect(phutReDuoc(tt0, 0)).toBe(false)
    expect(phutReDuoc(tt0, -5)).toBe(false)
    expect(phutReDuoc(tt0, den + 1)).toBe(false)
    expect(phutReDuoc(tt0, 10.5)).toBe(false)
    expect(phutReDuoc(tt0, Number.NaN)).toBe(false)

    expect(phutReDuoc(tt0, 1)).toBe(true)
    expect(phutReDuoc(tt0, den)).toBe(true)
  })

  it('reNhanh từ chối phút ngoài khoảng và vẫn nói ra khoảng chọn được', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0])
    const kq = reNhanh(banGhi, 999, [])

    expect(kq.reDuoc).toBe(false)
    if (kq.reDuoc) throw new Error('phải bị từ chối')
    expect(kq.lyDo).toBe('phut-ngoai-khoang')
    expect(kq.khoangPhut.tu).toBe(1)
    expect(kq.khoangPhut.den).toBeGreaterThan(1)
  })
})

describe('phát lại tới một phút (T428, AC-27.1)', () => {
  it('dừng đúng ở phút đã chỉ định và chưa kết thúc', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const tt = phatLaiToiPhut(trangThaiDauTran(banGhi), banGhi.canThiep, 35)

    expect(tt.phut).toBe(35)
    expect(tt.ketThuc).toBe(false)
  })

  it('can thiệp trước điểm dừng đã được áp, can thiệp sau thì chưa', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    expect(banGhi.canThiep.length).toBe(3)

    const tt = phatLaiToiPhut(trangThaiDauTran(banGhi), banGhi.canThiep, 50)

    // Lần thay người phút 20 và lần đổi chỉ thị phút 40 đã vào.
    expect(tt.ben.nha.soLanThay).toBe(1)
    expect(tt.ben.nha.chienThuatHienTai.chiThi['cuong-do-pressing']).toBe('cao')
    // Lần thay người phút 70 thì chưa.
    expect(tt.canThiep.map((ct) => ct.phut)).toEqual([20, 40])
  })

  /*
    Phút rẽ là phút mà can thiệp của CHÍNH nó chưa được xếp — đó là chỗ người
    dùng chen quyết định mới vào. Nếu phát lại đã xếp sẵn can thiệp cũ của
    phút ấy thì quyết định mới sẽ đứng sau một quyết định cũ cùng phút và
    người dùng không hiểu vì sao bộ chỉ thị của mình không có tác dụng.
  */
  it('can thiệp của đúng phút rẽ chưa được xếp', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const tt = phatLaiToiPhut(trangThaiDauTran(banGhi), banGhi.canThiep, 20)

    expect(tt.phut).toBe(20)
    expect(tt.canThiep).toEqual([])
    expect(tt.ben.nha.soLanThay).toBe(0)
  })

  /*
    So bằng TÌNH HUỐNG (`ungVien`), không bằng dòng tường thuật đã lọc.

    `chonSuKien` chặn trần 100 dòng bằng cách xếp hạng tình huống trên CẢ
    trận, nên dòng tường thuật của một trận đang dở KHÔNG phải tiền tố của
    dòng tường thuật trận đầy đủ — trận dở có ít tình huống hơn nên bộ lọc
    giữ lại một tập khác. Thứ phải giống hệt là tình huống engine sinh ra, và
    đó cũng đúng là thứ AC-27.2 nói về khi trận nhánh đã chạy xong.
  */
  it('mọi tình huống tới phút rẽ giống hệt trận gốc, từng cái một', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[4], BA_CAN_THIEP)
    const day = chayNotTuDiemRe(
      phatLaiToiPhut(trangThaiDauTran(banGhi), banGhi.canThiep, 60),
      banGhi.canThiep,
      [],
    )
    const toi60 = phatLaiToiPhut(trangThaiDauTran(banGhi), banGhi.canThiep, 60)

    expect(toi60.ungVien).toEqual(day.ungVien.slice(0, toi60.ungVien.length))
  })
})

/*
  XƯƠNG SỐNG 1 (T429, AC-27.4).

  Không đổi gì thì trận rẽ nhánh phải ra Y HỆT trận gốc. Phép kiểm này là
  lưới duy nhất bắt được hai lỗi lặng lẽ nhất của cả lát: xếp can thiệp lệch
  một phút, và bỏ sót can thiệp nằm SAU điểm rẽ.

  So từng dòng một bằng `toEqual` trên cả mảng, không so tỉ số: hai trận khác
  nhau hoàn toàn vẫn có thể cùng tỉ số 1-1 và cùng số dòng.
*/
describe('XƯƠNG SỐNG 1 — không đổi gì thì ra y hệt (T429, AC-27.4)', () => {
  it('trận không có can thiệp nào: rẽ ở năm phút khác nhau đều ra trận cũ', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const banGhi = tranDaLuuMau(ma)
      for (const phut of [1, 20, 45, 60, 88]) {
        const kq = reNhanh(banGhi, phut, [])
        expect(kq.reDuoc, `${ma} phút ${phut}`).toBe(true)
        if (!kq.reDuoc) continue

        expect(kq.cuoiTran.tiSo, `${ma} phút ${phut}`).toEqual(banGhi.tiSo)
        expect(dongSuKien(kq.cuoiTran), `${ma} phút ${phut}`).toEqual(
          banGhi.cacSuKien,
        )
      }
    }
  })

  it('trận CÓ can thiệp: rẽ trước, giữa và sau các can thiệp đều ra trận cũ', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const banGhi = tranDaLuuMau(ma, BA_CAN_THIEP)
      expect(banGhi.canThiep.length, ma).toBe(3)

      // Trước can thiệp đầu, giữa hai can thiệp, đúng phút can thiệp, và sau cả ba.
      for (const phut of [10, 20, 30, 40, 55, 70, 80]) {
        const kq = reNhanh(banGhi, phut, [])
        expect(kq.reDuoc, `${ma} phút ${phut}`).toBe(true)
        if (!kq.reDuoc) continue

        expect(kq.cuoiTran.tiSo, `${ma} phút ${phut}`).toEqual(banGhi.tiSo)
        expect(dongSuKien(kq.cuoiTran), `${ma} phút ${phut}`).toEqual(
          banGhi.cacSuKien,
        )
      }
    }
  })

  it('cả báo cáo sau trận cũng trùng, không chỉ phần hiển thị', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const kq = reNhanh(banGhi, 50, [])
    if (!kq.reDuoc) throw new Error('phải rẽ được')

    expect(dungBaoCao(kq.cuoiTran)).toEqual(banGhi.baoCao)
  })

  /*
    Phép kiểm canh phép kiểm: nếu xếp can thiệp lệch một phút thì hai phép
    kiểm trên vẫn xanh với trận KHÔNG có can thiệp. Dòng dưới khẳng định bản
    ghi mẫu thật sự mang can thiệp, và rằng bỏ chúng đi thì trận KHÁC — nên
    hai phép kiểm trên không xanh vì may.
  */
  it('bỏ chuỗi can thiệp đã lưu thì trận khác đi', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const khongCanThiep: TranDaLuu = { ...banGhi, canThiep: [] }

    const kq = reNhanh(khongCanThiep, 10, [])
    if (!kq.reDuoc) throw new Error('phải rẽ được')
    expect(dongSuKien(kq.cuoiTran)).not.toEqual(banGhi.cacSuKien)
  })
})

/*
  XƯƠNG SỐNG 2 (T430, AC-27.2).

  Đổi một quyết định tại phút X: mọi dòng TRƯỚC X phải giống hệt trận gốc,
  từ X trở đi được phép khác. Phần "được phép khác" cũng được kiểm — một phép
  phát lại bỏ quên can thiệp mới sẽ thoả nửa đầu của AC mà không thoả nửa sau.
*/
describe('XƯƠNG SỐNG 2 — phần trước điểm rẽ giống hệt (T430, AC-27.2)', () => {
  function reVoiChiThiKhac(banGhi: TranDaLuu, phut: number) {
    const tt0 = trangThaiDauTran(banGhi)
    const taiDiemRe = phatLaiToiPhut(tt0, banGhi.canThiep, phut)
    const cuoiTran = chayNotTuDiemRe(taiDiemRe, banGhi.canThiep, [
      { phut, doi: 'nha', noiDung: chiThiKhac(taiDiemRe) },
    ])
    return { taiDiemRe, cuoiTran }
  }

  it('mọi dòng trước phút rẽ giống hệt, ở nhiều phút rẽ khác nhau', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const banGhi = tranDaLuuMau(ma, BA_CAN_THIEP)

      for (const phut of [15, 35, 60]) {
        const { cuoiTran } = reVoiChiThiKhac(banGhi, phut)
        const nhanh = dongSuKienNhanh(banGhi, cuoiTran, phut)

        const truoc = (cac: readonly { phut: number; buGio: boolean }[]) =>
          cac.filter((sk) => phutThucTe(cuoiTran, sk) < phut)
        expect(truoc(nhanh), `${ma} phút ${phut}`).toEqual(
          truoc(banGhi.cacSuKien),
        )
      }
    }
  })

  /*
    VÌ SAO phải ghép, bằng một ca THẬT — không phải lo xa.

    Quét 10 mã trận × 10 phút rẽ tìm được đúng một ca, và nó đủ để nói hết
    vấn đề: `W5H4J2YD9F` rẽ ở phút 70. Cả trận gốc lẫn trận nhánh đều chạm
    đúng trần 100 dòng, nhưng nhánh sinh tình huống điểm cao hơn ở phần sau,
    nên bộ lọc mật độ đẩy **ba dòng TRƯỚC điểm rẽ** ra ngoài trần: 65 dòng
    thay vì 68. Đọc trên màn hình thì đó đúng là thứ AC-27.2 cấm — ba dòng
    trước điểm rẽ biến mất, trong khi engine không hề chạy khác một nhịp.

    Nếu một ngày phép kiểm này đỏ vì hai con số không còn lệch, đừng tưởng
    là tin tốt: nó nghĩa là trần thôi cắt, và `dongSuKienNhanh` mất ca thử
    duy nhất chứng minh nó cần thiết.
  */
  it('dòng tường thuật của riêng nhánh thì KHÔNG đủ — trần dòng cắt mất dòng trước điểm rẽ', () => {
    const banGhi = tranDaLuuMau('W5H4J2YD9F', BA_CAN_THIEP)
    const { cuoiTran } = reVoiChiThiKhac(banGhi, 70)
    const truoc = (cac: readonly { phut: number; buGio: boolean }[]) =>
      cac.filter((sk) => phutThucTe(cuoiTran, sk) < 70)

    const gocTruoc = truoc(banGhi.cacSuKien)
    expect(truoc(dongSuKien(cuoiTran)).length).toBeLessThan(gocTruoc.length)

    // Còn dòng GHÉP thì khớp, đúng từng dòng.
    expect(truoc(dongSuKienNhanh(banGhi, cuoiTran, 70))).toEqual(gocTruoc)
  })

  /*
    Dòng ở ĐÚNG phút rẽ cũng còn nguyên: can thiệp mới chỉ có hiệu lực từ đầu
    phút kế tiếp (D30b), nên phút X đã diễn ra xong trước khi quyết định mới
    kịp đổi bất cứ điều gì.
  */
  it('dòng ở đúng phút rẽ cũng giống hệt trận gốc', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const { cuoiTran } = reVoiChiThiKhac(banGhi, 35)
    const ghep = dongSuKienNhanh(banGhi, cuoiTran, 35)

    const toiPhutRe = (cac: readonly { phut: number; buGio: boolean }[]) =>
      cac.filter((sk) => phutThucTe(cuoiTran, sk) <= 35)
    expect(toiPhutRe(ghep)).toEqual(toiPhutRe(banGhi.cacSuKien))
  })

  /*
    Lớp lưới CHẮC nhất của AC-27.2, và vì sao cần nó bên cạnh phép kiểm trên.

    Phép kiểm trên so dòng tường thuật ĐÃ LỌC. Bộ lọc `chonSuKien` chặn trần
    100 dòng bằng cách xếp hạng tình huống trên cả trận, nên về lý thuyết một
    nhánh có nhiều tình huống điểm cao ở nửa sau có thể đẩy một dòng TRƯỚC
    điểm rẽ ra khỏi trần — và lúc ấy AC-27.2 vỡ mà không ai sửa gì sai.

    Phép kiểm này so TÌNH HUỐNG, thứ engine sinh ra trước khi lọc: tiền tố
    trước điểm rẽ phải giống hệt, luôn luôn, không phụ thuộc trần.
  */
  it('tiền tố TÌNH HUỐNG trước điểm rẽ giống hệt, không phụ thuộc trần dòng', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const banGhi = tranDaLuuMau(ma, BA_CAN_THIEP)
      const phut = 35
      const tt0 = trangThaiDauTran(banGhi)
      const taiDiemRe = phatLaiToiPhut(tt0, banGhi.canThiep, phut)
      const { cuoiTran } = reVoiChiThiKhac(banGhi, phut)

      expect(
        cuoiTran.ungVien.slice(0, taiDiemRe.ungVien.length),
        ma,
      ).toEqual(taiDiemRe.ungVien)
    }
  })

  /*
    Dòng tường thuật ghép (`dongSuKienNhanh`) làm AC-27.2 đúng bằng CẤU TRÚC.

    Trần 100 dòng CÓ cắt thật: trận `W5H4J2YD9F` có can thiệp chạm đúng
    100/100 dòng, trong khi trận không can thiệp chỉ 74–87 dòng. Quét 10 mã ×
    7 phút rẽ chưa gặp dòng nào trước điểm rẽ bị trần đẩy ra, nhưng phép ghép
    làm câu hỏi ấy không còn tồn tại — nên phép kiểm dưới không cần may.
  */
  it('dòng ghép: phần tới điểm rẽ LÀ bản ghi gốc, từng dòng một', () => {
    for (const ma of MA_TRAN_CO_DINH) {
      const banGhi = tranDaLuuMau(ma, BA_CAN_THIEP)

      for (const phut of [12, 35, 70]) {
        const { cuoiTran } = reVoiChiThiKhac(banGhi, phut)
        const ghep = dongSuKienNhanh(banGhi, cuoiTran, phut)

        const gocToiDo = banGhi.cacSuKien.filter(
          (sk) => phutThucTe(cuoiTran, sk) <= phut,
        )
        expect(
          ghep.slice(0, gocToiDo.length),
          `${ma} phút ${phut}`,
        ).toEqual(gocToiDo)
      }
    }
  })

  it('dòng ghép đi theo thứ tự thời gian và không lặp mốc nào', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[2], BA_CAN_THIEP)
    const { cuoiTran } = reVoiChiThiKhac(banGhi, 35)
    const ghep = dongSuKienNhanh(banGhi, cuoiTran, 35)
    const phutThat = ghep.map((sk) => phutThucTe(cuoiTran, sk))
    expect(phutThat).toEqual([...phutThat].sort((a, b) => a - b))
    expect(ghep.filter((sk) => sk.loai === 'ket-thuc')).toHaveLength(1)
    expect(ghep.filter((sk) => sk.loai === 'bat-dau')).toHaveLength(1)
  })

  it('reNhanh trả luôn dòng ghép ấy', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const kq = reNhanh(banGhi, 35, [])
    if (!kq.reDuoc) throw new Error('phải rẽ được')

    // Không đổi gì thì dòng ghép trùng luôn bản ghi gốc (AC-27.4).
    expect(kq.cacSuKien).toEqual(banGhi.cacSuKien)
  })

  it('từ phút rẽ trở đi thì trận thật sự khác đi', () => {
    const khac: string[] = []
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const banGhi = tranDaLuuMau(ma, BA_CAN_THIEP)
      const { cuoiTran } = reVoiChiThiKhac(banGhi, 15)

      const goc = banGhi.cacSuKien.filter((sk) => sk.phut > 15)
      const nhanh = dongSuKien(cuoiTran).filter((sk) => sk.phut > 15)
      if (JSON.stringify(nhanh) !== JSON.stringify(goc)) khac.push(ma)
    }
    // Đổi ba chỉ thị ở phút 15 phải đổi được diễn biến của cả ba trận.
    expect(khac.length).toBe(3)
  })

  it('bộ chỉ thị mới thắng bộ chỉ thị cũ ở cùng một phút', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    // Phút 40 trận gốc đã đổi pressing sang 'cao'; quyết định mới đặt 'thap'.
    const tt0 = trangThaiDauTran(banGhi)
    const taiDiemRe = phatLaiToiPhut(tt0, banGhi.canThiep, 40)
    const cuoiTran = chayNotTuDiemRe(taiDiemRe, banGhi.canThiep, [
      {
        phut: 40,
        doi: 'nha',
        noiDung: {
          loai: 'doi-chi-thi',
          chiThi: {
            ...taiDiemRe.ben.nha.chienThuatHienTai.chiThi,
            'cuong-do-pressing': 'thap',
          },
        },
      },
    ])

    expect(cuoiTran.ben.nha.chienThuatHienTai.chiThi['cuong-do-pressing']).toBe(
      'thap',
    )
  })

  it('thay một người tại phút rẽ cũng đi vào trận nhánh', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[1])
    const tt0 = trangThaiDauTran(banGhi)
    const taiDiemRe = phatLaiToiPhut(tt0, banGhi.canThiep, 30)
    const ra = taiDiemRe.ben.nha.trenSan[5]
    const vao = taiDiemRe.ben.nha.duBi[0]

    const cuoiTran = chayNotTuDiemRe(taiDiemRe, banGhi.canThiep, [
      { phut: 30, doi: 'nha', noiDung: { loai: 'thay-nguoi', ra, vao } },
    ])

    expect(cuoiTran.ben.nha.soLanThay).toBe(1)
    expect(cuoiTran.ben.nha.trenSan).toContain(vao)
    expect(dongSuKien(cuoiTran)).not.toEqual(banGhi.cacSuKien)
  })
})

/*
  Trận gốc còn nguyên (AC-27.7).

  Bản ghi là một object đóng băng về kiểu nhưng không về thực thi, nên phép
  kiểm này soi THẬT: rẽ nhánh xong, từng trường của bản ghi còn đúng như
  trước. Lớp này không ghi đĩa (D79) nên rủi ro duy nhất là sửa ngay trên
  object — và đó chính là thứ được canh ở đây.
*/
describe('trận gốc không bị sửa (AC-27.7)', () => {
  it('rẽ nhánh nhiều lần không làm đổi một trường nào của bản ghi', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[0], BA_CAN_THIEP)
    const truoc = JSON.stringify(banGhi)

    const tt0 = trangThaiDauTran(banGhi)
    for (const phut of [10, 40, 75]) {
      const taiDiemRe = phatLaiToiPhut(tt0, banGhi.canThiep, phut)
      chayNotTuDiemRe(taiDiemRe, banGhi.canThiep, [
        { phut, doi: 'nha', noiDung: chiThiKhac(taiDiemRe) },
      ])
    }

    expect(JSON.stringify(banGhi)).toBe(truoc)
  })

  it('rẽ nhánh hai lần từ cùng một bản ghi cho cùng một kết quả', () => {
    const banGhi = tranDaLuuMau(MA_TRAN_CO_DINH[2], BA_CAN_THIEP)
    const lan1 = reNhanh(banGhi, 30, [])
    const lan2 = reNhanh(banGhi, 30, [])

    if (!lan1.reDuoc || !lan2.reDuoc) throw new Error('phải rẽ được')
    expect(dongSuKien(lan2.cuoiTran)).toEqual(dongSuKien(lan1.cuoiTran))
  })
})
