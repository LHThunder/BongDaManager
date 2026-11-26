import { describe, expect, it } from 'vitest'
import type { LoaiSuKien, SuKien } from '../suKien'
import { layVung } from '../vung'
import {
  chuCuaDoi,
  dongCuaSuKien,
  dungNhatKy,
  LOAI_BO_TRONG,
  LOAI_ENGINE_SANG_NHAT_KY,
  LOAI_MO_RONG,
  LOAI_NHAT_KY,
  phutDangChuoi,
} from './nhatKy'

/*
  Kênh nhật ký riêng (T741, AC-45.5 + AC-45.6).

  ⚠️⚠️ **Phép kiểm xương sống của khối này đỏ ở `tsc`, không ở `vitest`.**

  `MOI_LOAI_SU_KIEN` dưới đây là một `Record<LoaiSuKien, true>`, nên TypeScript
  **bắt buộc** nó liệt đủ mọi giá trị của `LoaiSuKien`. Thêm một giá trị vào
  kiểu ấy là file này **đỏ ngay lúc biên dịch**.

  Đó là điều mà hai danh sách viết tay trong repo **không** làm được:
  `tuongThuat.test.ts` liệt 15 giá trị, `phaBong.test.ts` liệt 16 — **hai danh
  sách đã lệch nhau sẵn**, và vì viết tay nên chúng âm thầm phủ thiếu mãi mãi.
  Một `Record` thì không thể lệch.
*/
const MOI_LOAI_SU_KIEN: Readonly<Record<LoaiSuKien, true>> = {
  'bat-dau': true,
  'ban-thang': true,
  'co-hoi': true,
  'cuu-thua': true,
  'tat-canh': true,
  'cuop-bong-cao': true,
  'thoat-xuong': true,
  'mat-bong': true,
  'pham-loi': true,
  'the-vang': true,
  'the-do': true,
  'thay-nguoi': true,
  'kiet-suc': true,
  'het-hiep': true,
  'ket-thuc': true,
  'huy-tran': true,
}

const CAC_LOAI_SU_KIEN = Object.keys(MOI_LOAI_SU_KIEN) as LoaiSuKien[]

function suKienMau(loai: LoaiSuKien, nguoi = 'p1'): SuKien {
  return {
    phut: 23,
    buGio: false,
    loai,
    doi: 'nha',
    cacCauThu: [nguoi],
    vung: layVung('giua', 2),
    duongBong: [],
  } as unknown as SuKien
}

const MA_NGAN = new Map([['p1', 'A9']])

describe('bảng ánh xạ ĐẦY ĐỦ hai chiều (T741)', () => {
  it('mọi loại của ENGINE hoặc có chỗ trong 7b, hoặc được khai là bỏ trống', () => {
    const thieu: string[] = []
    for (const loai of CAC_LOAI_SU_KIEN) {
      const co7b = LOAI_ENGINE_SANG_NHAT_KY[loai] !== undefined
      const khaiTrong = LOAI_BO_TRONG.includes(loai)
      if (co7b === khaiTrong) thieu.push(`${loai} (${co7b ? 'cả hai' : 'không chỗ nào'})`)
    }
    expect(thieu, `loại chưa xếp:\n${thieu.join('\n')}`).toEqual([])
    // ⚠️ CHỐNG RỖNG: `Record` giữ danh sách đủ, nhưng vẫn khẳng định nó không rỗng.
    expect(CAC_LOAI_SU_KIEN.length, 'số loại của engine').toBe(16)
  })

  it('mọi loại của 7b hoặc là đích của bảng, hoặc được khai là mở rộng', () => {
    const dich = new Set(Object.values(LOAI_ENGINE_SANG_NHAT_KY))
    const thieu: string[] = []
    for (const loai of LOAI_NHAT_KY) {
      const laDich = dich.has(loai)
      const khaiMoRong = LOAI_MO_RONG.includes(loai)
      if (laDich === khaiMoRong) thieu.push(loai)
    }
    expect(thieu, `loại 7b chưa xếp: ${thieu.join(', ')}`).toEqual([])
    expect(LOAI_NHAT_KY.length, 'số loại của mục 7b').toBe(18)
  })

  /*
    Hai chỗ **nhiều-về-một** là lựa chọn, không phải sơ suất: `co-hoi` và
    `cuu-thua` đều ra `sut`, vì cả hai **là** một cú sút. Chúng khác nhau ở
    **kết quả**, và kết quả đi vào khoá `ket_qua`.
  */
  it('cơ hội và cứu thua cùng ra `sut`, khác nhau ở `ket_qua`', () => {
    expect(LOAI_ENGINE_SANG_NHAT_KY['co-hoi']).toBe('sut')
    expect(LOAI_ENGINE_SANG_NHAT_KY['cuu-thua']).toBe('sut')
    expect(dongCuaSuKien(suKienMau('co-hoi'), MA_NGAN).ket_qua).toBe('truot')
    expect(dongCuaSuKien(suKienMau('cuu-thua'), MA_NGAN).ket_qua).toBe('cuu_thua')
    expect(dongCuaSuKien(suKienMau('ban-thang'), MA_NGAN).ket_qua).toBe('ban_thang')
    expect(dongCuaSuKien(suKienMau('pham-loi'), MA_NGAN).ket_qua).toBe(null)
  })

  it('và mọi đích của bảng đều là một loại 7b thật', () => {
    for (const [engine, log] of Object.entries(LOAI_ENGINE_SANG_NHAT_KY)) {
      expect(LOAI_NHAT_KY, `${engine} → ${log}`).toContain(log)
    }
  })
})

describe('một dòng nhật ký, tám khoá (T741, AC-45.5)', () => {
  it('đúng tám khoá, và KHÔNG có khoá chỉ số kỳ vọng', () => {
    const d = dongCuaSuKien(suKienMau('ban-thang'), MA_NGAN)
    expect(Object.keys(d).sort()).toEqual(
      ['cau_thu', 'doi', 'ghi_chu', 'ket_qua', 'loai', 'phut', 'x', 'y'].sort(),
    )
    expect(Object.keys(d)).toHaveLength(8)
  })

  it('đội thành chữ A/B, và toạ độ thành MÉT', () => {
    expect(chuCuaDoi('nha')).toBe('A')
    expect(chuCuaDoi('khach')).toBe('B')
    const d = dongCuaSuKien(suKienMau('ban-thang'), MA_NGAN)
    expect(d.doi).toBe('A')
    expect(d.cau_thu).toBe('A9')
    expect(d.x).not.toBeNull()
    expect(d.y).not.toBeNull()
    expect(d.x!).toBeGreaterThan(0)
    expect(d.x!).toBeLessThan(105)
  })

  /*
    Người không có mã ngắn thì để `null`, **không** in uuid: một uuid 36 ký tự
    trong nhật ký làm tệp phình mà không nói thêm gì, và bảng tra ở
    `khoi_dau.nguoi` đã là chỗ của nó.
  */
  it('người lạ để null chứ không in uuid', () => {
    const d = dongCuaSuKien(suKienMau('ban-thang', 'khong-co-trong-bang'), MA_NGAN)
    expect(d.cau_thu).toBe(null)
  })

  it('phút dạng mm:ss, và phút bù giờ có dấu', () => {
    expect(phutDangChuoi(7, false)).toBe('07:00')
    expect(phutDangChuoi(23, false)).toBe('23:00')
    expect(phutDangChuoi(45, true)).toBe('45:00+')
  })
})

describe('KHÔNG CẮT: mọi sự kiện đều thành một dòng (T741)', () => {
  /*
    ⚠️ Đây là mệnh đề mà cả task đứng trên. Dòng tường thuật của giao diện đi
    qua một phép chọn giữ 60–100 dòng một trận; kênh này **không** lọc.
  */
  it('số dòng ra bằng đúng số sự kiện vào, với MỌI loại', () => {
    const vao = CAC_LOAI_SU_KIEN.map((l) => suKienMau(l))
    const ra = dungNhatKy(vao, MA_NGAN)
    expect(ra).toHaveLength(vao.length)
    expect(ra).toHaveLength(16)
  })

  it('và loại ngoài từ vựng 7b VẪN có dòng, mang tên engine và một ghi chú', () => {
    let soBoTrong = 0
    for (const loai of LOAI_BO_TRONG) {
      const d = dongCuaSuKien(suKienMau(loai), MA_NGAN)
      expect(d.loai, `${loai}`).toBe(loai)
      expect(d.ghi_chu, `${loai}`).toContain(loai)
      soBoTrong += 1
    }
    expect(soBoTrong, 'số loại bỏ trống').toBeGreaterThan(0)
  })

  it('còn loại có chỗ trong 7b thì KHÔNG mang ghi chú', () => {
    for (const loai of CAC_LOAI_SU_KIEN) {
      if (LOAI_BO_TRONG.includes(loai)) continue
      const d = dongCuaSuKien(suKienMau(loai), MA_NGAN)
      expect(d.ghi_chu, `${loai}`).toBe(null)
      expect(LOAI_NHAT_KY, `${loai}`).toContain(d.loai)
    }
  })

  it('danh sách rỗng ra nhật ký rỗng, không ném', () => {
    expect(dungNhatKy([], MA_NGAN)).toEqual([])
  })
})
