import { describe, expect, it } from 'vitest'
import {
  cacViTriConChonDuoc,
  kiemTraToHopViTri,
  laThuMon,
  layViTri,
  POSITIONS,
} from './positions'
import type { PositionId, PositionLine, PositionSide } from './types'

const TUYEN_HOP_LE: PositionLine[] = [
  'thu-mon',
  'phong-ngu',
  'tien-ve',
  'tan-cong',
]
const BEN_HOP_LE: PositionSide[] = ['trai', 'giua', 'phai']

describe('bảng 12 vị trí (AC-2.1)', () => {
  it('có đúng 12 vị trí', () => {
    expect(POSITIONS).toHaveLength(12)
  })

  it('không có id trùng lặp', () => {
    const ids = POSITIONS.map((p) => p.id)
    expect(new Set(ids).size).toBe(12)
  })

  it('mỗi vị trí có tên tiếng Việt và tên viết tắt không rỗng', () => {
    for (const p of POSITIONS) {
      expect(p.ten.trim(), `vị trí ${p.id} thiếu tên`).not.toBe('')
      expect(p.vietTat.trim(), `vị trí ${p.id} thiếu viết tắt`).not.toBe('')
    }
  })

  it('mỗi vị trí thuộc đúng một tuyến hợp lệ', () => {
    for (const p of POSITIONS) {
      expect(TUYEN_HOP_LE, `vị trí ${p.id} có tuyến lạ`).toContain(p.tuyen)
    }
  })

  it('mỗi vị trí có bên xác định', () => {
    for (const p of POSITIONS) {
      expect(BEN_HOP_LE, `vị trí ${p.id} có bên lạ`).toContain(p.ben)
    }
  })

  it('chỉ có duy nhất một vị trí thuộc tuyến thủ môn', () => {
    const thuMon = POSITIONS.filter((p) => p.tuyen === 'thu-mon')
    expect(thuMon.map((p) => p.id)).toEqual(['GK'])
  })

  it('có đủ cặp đối xứng trái/phải ở ba tuyến ngoài thủ môn', () => {
    for (const [trai, phai] of [
      ['DL', 'DR'],
      ['ML', 'MR'],
      ['AML', 'AMR'],
    ] as [PositionId, PositionId][]) {
      expect(layViTri(trai).ben).toBe('trai')
      expect(layViTri(phai).ben).toBe('phai')
      expect(layViTri(trai).tuyen).toBe(layViTri(phai).tuyen)
    }
  })

  it('layViTri báo lỗi với id không tồn tại', () => {
    expect(() => layViTri('XX' as PositionId)).toThrow()
  })
})

describe('tổ hợp vị trí: thủ môn không kiêm vị trí sân (AC-2.1b)', () => {
  it('nhận một vị trí sân', () => {
    expect(kiemTraToHopViTri(['DC'])).toEqual({ hopLe: true })
  })

  it('nhận nhiều vị trí sân', () => {
    expect(kiemTraToHopViTri(['DC', 'DM', 'DR'])).toEqual({ hopLe: true })
  })

  it('nhận thủ môn khi đứng một mình', () => {
    expect(kiemTraToHopViTri(['GK'])).toEqual({ hopLe: true })
  })

  it('từ chối thủ môn kèm một vị trí sân', () => {
    expect(kiemTraToHopViTri(['GK', 'DC'])).toEqual({
      hopLe: false,
      loi: 'thu-mon-kiem-vi-tri-san',
    })
  })

  it('từ chối thủ môn kèm nhiều vị trí sân, bất kể thứ tự', () => {
    expect(kiemTraToHopViTri(['ST', 'GK'])).toEqual({
      hopLe: false,
      loi: 'thu-mon-kiem-vi-tri-san',
    })
  })

  it('từ chối danh sách rỗng', () => {
    expect(kiemTraToHopViTri([])).toEqual({
      hopLe: false,
      loi: 'chua-chon-vi-tri',
    })
  })

  it('từ chối vị trí trùng lặp', () => {
    expect(kiemTraToHopViTri(['DC', 'DC'])).toEqual({
      hopLe: false,
      loi: 'vi-tri-trung-lap',
    })
  })

  it('laThuMon đúng cho cả hai phía', () => {
    expect(laThuMon(['GK'])).toBe(true)
    expect(laThuMon(['DC', 'DM'])).toBe(false)
  })
})

describe('các vị trí còn chọn được (để vô hiệu hoá lựa chọn xung đột)', () => {
  it('chưa chọn gì thì chọn được cả 12 vị trí', () => {
    expect(cacViTriConChonDuoc([])).toHaveLength(12)
  })

  it('đã chọn thủ môn thì không thêm được vị trí nào', () => {
    expect(cacViTriConChonDuoc(['GK'])).toEqual([])
  })

  it('đã chọn vị trí sân thì thủ môn bị loại khỏi danh sách', () => {
    const conLai = cacViTriConChonDuoc(['DC'])
    expect(conLai).not.toContain('GK')
    expect(conLai).not.toContain('DC')
    expect(conLai).toContain('DM')
    expect(conLai).toHaveLength(10)
  })
})
