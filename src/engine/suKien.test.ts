import { describe, expect, it } from 'vitest'
import {
  chonSuKien,
  LOAI_BAT_BUOC,
  SO_DONG_TOI_DA,
  type LoaiSuKien,
  type SuKien,
  type UngVienSuKien,
} from './suKien'
import { cauHinhMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, dongSuKien, taoTran } from './tran'
import { keNhau, layVung } from './vung'

const TI_SO_0 = { nha: 0, khach: 0 }

function suKien(
  phut: number,
  loai: LoaiSuKien,
  mauCau = 0,
): SuKien {
  return {
    phut,
    buGio: false,
    loai,
    doi: 'nha',
    cacCauThu: ['p1'],
    vung: layVung('giua', 2),
    duongBong: [layVung('giua', 1), layVung('giua', 2)],
    mauCau,
    tiSoSauDo: TI_SO_0,
  }
}

function ungVien(
  phut: number,
  loai: LoaiSuKien,
  diemDangKe: number,
): UngVienSuKien {
  return { suKien: suKien(phut, loai, phut), diemDangKe }
}

/** N ứng viên tuỳ chọn, điểm đáng kể xoay vòng để có thứ tự rõ ràng. */
function nhieuUngVien(n: number, loai: LoaiSuKien = 'co-hoi'): UngVienSuKien[] {
  return Array.from({ length: n }, (_, i) => ungVien(i + 1, loai, (i % 10) + 1))
}

describe('bước chọn mật độ dòng sự kiện (AC-8.15)', () => {
  it('từ 300 ứng viên trả về không quá 100 dòng', () => {
    const ketQua = chonSuKien(nhieuUngVien(300))
    expect(ketQua.length).toBeLessThanOrEqual(SO_DONG_TOI_DA)
    expect(ketQua).toHaveLength(SO_DONG_TOI_DA)
  })

  it('chỉ có 40 ứng viên thì trả hết 40, không bịa thêm', () => {
    const ketQua = chonSuKien(nhieuUngVien(40))
    expect(ketQua).toHaveLength(40)
  })

  it('danh sách rỗng trả về rỗng', () => {
    expect(chonSuKien([])).toEqual([])
  })

  it('giữ lại những ứng viên điểm cao nhất', () => {
    const cacUngVien: UngVienSuKien[] = [
      ...Array.from({ length: 150 }, (_, i) => ungVien(i + 1, 'co-hoi', 1)),
      ungVien(200, 'tat-canh', 99),
    ]
    const ketQua = chonSuKien(cacUngVien)
    expect(ketQua.some((s) => s.phut === 200)).toBe(true)
  })

  it('trả về theo đúng thứ tự thời gian của trận', () => {
    const ketQua = chonSuKien(nhieuUngVien(300))
    const cacPhut = ketQua.map((s) => s.phut)
    expect([...cacPhut].sort((a, b) => a - b)).toEqual(cacPhut)
  })
})

describe('sự kiện bắt buộc không bao giờ bị cắt', () => {
  it('bàn thắng, thẻ, thay người và mốc hiệp luôn được giữ', () => {
    const batBuoc: UngVienSuKien[] = [
      ungVien(10, 'ban-thang', 0),
      ungVien(20, 'the-vang', 0),
      ungVien(30, 'the-do', 0),
      ungVien(40, 'thay-nguoi', 0),
      ungVien(45, 'het-hiep', 0),
      ungVien(90, 'ket-thuc', 0),
    ]
    // 300 ứng viên tuỳ chọn điểm cao hơn hẳn, cố tình chen chỗ.
    const cacUngVien = [
      ...batBuoc,
      ...Array.from({ length: 300 }, (_, i) => ungVien(i + 1, 'co-hoi', 50)),
    ]

    const ketQua = chonSuKien(cacUngVien)
    for (const bb of batBuoc) {
      expect(
        ketQua.some(
          (s) => s.loai === bb.suKien.loai && s.phut === bb.suKien.phut,
        ),
        bb.suKien.loai,
      ).toBe(true)
    }
  })

  it('dù điểm đáng kể bằng 0 cũng không bị loại', () => {
    const cacUngVien = [
      ungVien(5, 'ban-thang', 0),
      ...Array.from({ length: 200 }, (_, i) => ungVien(i + 10, 'co-hoi', 100)),
    ]
    expect(chonSuKien(cacUngVien).some((s) => s.loai === 'ban-thang')).toBe(
      true,
    )
  })

  it('sự kiện bắt buộc nhiều hơn trần thì GIỮ HẾT, chấp nhận vượt trần', () => {
    // Trận 120 bàn thắng là phi lý, nhưng mất một dòng bàn thắng còn tệ hơn
    // vượt trần — nên luật là giữ hết, và test chốt luôn lựa chọn đó.
    const cacUngVien = Array.from({ length: 120 }, (_, i) =>
      ungVien(i + 1, 'ban-thang', 1),
    )
    expect(chonSuKien(cacUngVien)).toHaveLength(120)
  })

  it('tập loại bắt buộc có đủ những loại người dùng không được phép mất', () => {
    for (const loai of [
      'ban-thang',
      'the-do',
      'thay-nguoi',
      'ket-thuc',
    ] as LoaiSuKien[]) {
      expect(LOAI_BAT_BUOC.has(loai), loai).toBe(true)
    }
    expect(LOAI_BAT_BUOC.has('co-hoi')).toBe(false)
  })
})

describe('tất định (P1, rủi ro R13)', () => {
  it('chạy hai lần trên cùng đầu vào ra cùng danh sách', () => {
    const cacUngVien = nhieuUngVien(300)
    expect(chonSuKien(cacUngVien)).toEqual(chonSuKien(cacUngVien))
  })

  it('ứng viên bằng điểm và bằng phút thì giữ nguyên thứ tự ban đầu', () => {
    const cacUngVien: UngVienSuKien[] = Array.from({ length: 200 }, () =>
      ungVien(30, 'co-hoi', 5),
    )
    const a = chonSuKien(cacUngVien)
    const b = chonSuKien(cacUngVien)
    expect(b).toEqual(a)
    expect(a).toHaveLength(SO_DONG_TOI_DA)
  })
})

/*
  Đường bóng cho sân 2D (AC-10.2, quyết định D40).

  Chỉ có `vung` thì vẽ được một điểm chứ không vẽ được đường, nên sự kiện mang
  thêm danh sách vùng mà bóng đã đi qua. Nó được dẫn xuất từ các bước của
  chính chuỗi bóng, KHÔNG rút thêm số nào — nên phép cuối của khối này là phép
  quan trọng nhất: chạy lại cùng mã trận phải ra đúng từng phần tử.
*/
describe('đường bóng trong sự kiện (AC-10.2)', () => {
  it('mọi vùng trong đường bóng đều kề nhau theo luật lưới sân', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      for (const sk of dongSuKien(chayHetTran(taoTran(cauHinhMau(ma))))) {
        for (let i = 1; i < sk.duongBong.length; i += 1) {
          const truoc = sk.duongBong[i - 1]
          const sau = sk.duongBong[i]
          const lienTuc = truoc.id === sau.id || keNhau(truoc, sau)
          expect(lienTuc, `${ma} phút ${sk.phut}: ${truoc.id} -> ${sau.id}`).toBe(
            true,
          )
        }
      }
    }
  })

  it('vùng cuối của đường bóng trùng với vùng của sự kiện', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      for (const sk of dongSuKien(chayHetTran(taoTran(cauHinhMau(ma))))) {
        if (sk.duongBong.length === 0) continue
        expect(sk.duongBong[sk.duongBong.length - 1].id, ma).toBe(sk.vung?.id)
      }
    }
  })

  it('sự kiện mốc không có đường bóng', () => {
    const MOC: readonly LoaiSuKien[] = ['bat-dau', 'het-hiep', 'ket-thuc']
    for (const sk of dongSuKien(chayHetTran(taoTran(cauHinhMau('K7M2R9XQ4B'))))) {
      if (!MOC.includes(sk.loai)) continue
      expect(sk.duongBong, sk.loai).toHaveLength(0)
    }
  })

  it('chạy lại cùng mã trận ra đúng từng phần tử của đường bóng', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      const a = dongSuKien(chayHetTran(taoTran(cauHinhMau(ma)))).map((s) =>
        s.duongBong.map((v) => v.id),
      )
      const b = dongSuKien(chayHetTran(taoTran(cauHinhMau(ma)))).map((s) =>
        s.duongBong.map((v) => v.id),
      )
      expect(b, ma).toEqual(a)
    }
  })
})
