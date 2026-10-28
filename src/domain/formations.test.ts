import { describe, expect, it } from 'vitest'
import {
  FORMATIONS,
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

describe('bảng 8 sơ đồ (AC-5.2)', () => {
  it('có đúng 8 sơ đồ, đúng những sơ đồ đã chốt', () => {
    expect(FORMATIONS).toHaveLength(8)
    expect(FORMATIONS.map((s) => s.id).sort()).toEqual([...ID_MONG_DOI].sort())
  })

  it('tên hiển thị trùng với id', () => {
    for (const soDo of FORMATIONS) {
      expect(soDo.ten).toBe(soDo.id)
    }
  })

  it('mỗi sơ đồ có đúng 11 ô và slotId không trùng', () => {
    for (const soDo of FORMATIONS) {
      expect(soDo.oVien, soDo.id).toHaveLength(11)
      const ids = soDo.oVien.map((o) => o.slotId)
      expect(new Set(ids).size, soDo.id).toBe(11)
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
      expect(new Set(toaDo).size, soDo.id).toBe(11)
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

  it('tổng cacDai bằng 10 — 11 người trừ thủ môn', () => {
    for (const soDo of FORMATIONS) {
      const tong = soDo.cacDai.reduce((a, b) => a + b, 0)
      expect(tong, soDo.id).toBe(10)
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
