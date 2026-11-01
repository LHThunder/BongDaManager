import { describe, expect, it } from 'vitest'
import {
  FORMATIONS,
  soDoTheoQuanSo,
  soNguoiCuaSoDo,
  laySoDo,
  SO_DO_MAC_DINH,
  type FormationId,
} from './formations'
import { POSITIONS } from './positions'

const ID_MONG_DOI: FormationId[] = [
  '4-4-2',
  '4-4-1-1',
  '4-3-3',
  '4-2-3-1',
  '4-1-4-1',
  '3-5-2',
  '3-4-3',
  '5-3-2',
]

const ID_VI_TRI = new Set(POSITIONS.map((p) => p.id))

describe('bảng sơ đồ (AC-5.2, AC-13.1)', () => {
  it('đủ 8 sơ đồ 11 người đã chốt ở spec 001', () => {
    const muoiMot = soDoTheoQuanSo(11).map((s) => s.id)
    expect(muoiMot.sort()).toEqual([...ID_MONG_DOI].sort())
  })

  it('soNguoi của mỗi sơ đồ đúng bằng số ô', () => {
    for (const soDo of FORMATIONS) {
      expect(soNguoiCuaSoDo(soDo), soDo.id).toBe(soDo.oVien.length)
    }
  })

  it('soDoTheoQuanSo chỉ trả về sơ đồ đúng quân số', () => {
    for (let n = 5; n <= 11; n += 1) {
      for (const soDo of soDoTheoQuanSo(n)) {
        expect(soNguoiCuaSoDo(soDo), soDo.id).toBe(n)
      }
    }
  })

  it('id không trùng trên toàn bảng', () => {
    const ids = FORMATIONS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tên hiển thị trùng với id', () => {
    for (const soDo of FORMATIONS) {
      expect(soDo.ten).toBe(soDo.id)
    }
  })

  it('slotId không trùng trong một sơ đồ', () => {
    for (const soDo of FORMATIONS) {
      const ids = soDo.oVien.map((o) => o.slotId)
      expect(new Set(ids).size, soDo.id).toBe(soDo.oVien.length)
    }
  })

  it('mỗi sơ đồ có đúng một ô thủ môn, và ô đó có dai bằng 0', () => {
    for (const soDo of FORMATIONS) {
      const thuMon = soDo.oVien.filter((o) => o.viTri === 'GK')
      expect(thuMon, soDo.id).toHaveLength(1)
      expect(thuMon[0].dai, soDo.id).toBe(0)
    }
  })

  it('không ô nào ngoài ô thủ môn có dai bằng 0', () => {
    for (const soDo of FORMATIONS) {
      for (const o of soDo.oVien) {
        if (o.viTri !== 'GK') {
          expect(o.dai, `${soDo.id}/${o.slotId}`).toBeGreaterThanOrEqual(1)
        }
      }
    }
  })

  it('mọi viTri của ô thuộc 12 vị trí của POSITIONS', () => {
    for (const soDo of FORMATIONS) {
      for (const o of soDo.oVien) {
        expect(ID_VI_TRI.has(o.viTri), `${soDo.id}/${o.slotId}`).toBe(true)
      }
    }
  })

  it('toạ độ x và y đều nằm trong 0..100', () => {
    for (const soDo of FORMATIONS) {
      for (const o of soDo.oVien) {
        expect(o.x, `${soDo.id}/${o.slotId}.x`).toBeGreaterThanOrEqual(0)
        expect(o.x, `${soDo.id}/${o.slotId}.x`).toBeLessThanOrEqual(100)
        expect(o.y, `${soDo.id}/${o.slotId}.y`).toBeGreaterThanOrEqual(0)
        expect(o.y, `${soDo.id}/${o.slotId}.y`).toBeLessThanOrEqual(100)
      }
    }
  })

  it('không có hai ô trùng hoàn toàn toạ độ', () => {
    for (const soDo of FORMATIONS) {
      const toaDo = soDo.oVien.map((o) => `${o.x},${o.y}`)
      expect(new Set(toaDo).size, soDo.id).toBe(soDo.oVien.length)
    }
  })
})

/*
  Ba phép kiểm dưới đây là lý do `dai` tồn tại: chúng đối chiếu bảng toạ độ
  viết tay với chính cái tên sơ đồ, nên gõ lệch một ô là test đỏ (xem D15b).
*/
describe('cacDai khớp tên sơ đồ (AC-5.2)', () => {
  it('cacDai đúng bằng các con số trong tên', () => {
    for (const soDo of FORMATIONS) {
      const tuTen = soDo.id.split('-').map(Number)
      expect(soDo.cacDai, soDo.id).toEqual(tuTen)
    }
  })

  it('tổng cacDai bằng số người trừ thủ môn', () => {
    for (const soDo of FORMATIONS) {
      const tong = soDo.cacDai.reduce((a, b) => a + b, 0)
      expect(tong, soDo.id).toBe(soNguoiCuaSoDo(soDo) - 1)
    }
  })

  it('số ô của mỗi dải đúng bằng số tương ứng trong cacDai', () => {
    for (const soDo of FORMATIONS) {
      soDo.cacDai.forEach((soNguoi, i) => {
        const dai = i + 1
        const soO = soDo.oVien.filter((o) => o.dai === dai).length
        expect(soO, `${soDo.id} dải ${dai}`).toBe(soNguoi)
      })
    }
  })

  it('không có ô nào mang dai vượt quá số dải', () => {
    for (const soDo of FORMATIONS) {
      for (const o of soDo.oVien) {
        expect(o.dai, `${soDo.id}/${o.slotId}`).toBeLessThanOrEqual(
          soDo.cacDai.length,
        )
      }
    }
  })
})

describe('tra cứu sơ đồ', () => {
  it('laySoDo trả đúng sơ đồ theo id', () => {
    expect(laySoDo('4-2-3-1').cacDai).toEqual([4, 2, 3, 1])
  })

  it('laySoDo ném lỗi với id không tồn tại', () => {
    expect(() => laySoDo('9-9-9' as FormationId)).toThrow()
  })

  it('sơ đồ mặc định có thật trong bảng', () => {
    expect(() => laySoDo(SO_DO_MAC_DINH)).not.toThrow()
  })
})
