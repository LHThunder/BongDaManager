import { beforeEach, describe, expect, it } from 'vitest'
import type { TeamSummary } from '../services/teamRepo'
import { datLaiStore, useAppStore } from './appStore'

function doi(id: string, name: string, soCauThu = 0): TeamSummary {
  return {
    id,
    name,
    logoImageId: null,
    primaryColor: '#1E40AF',
    secondaryColor: '#F8FAFC',
    soCauThu,
  }
}

beforeEach(() => {
  datLaiStore()
})

describe('store danh sách đội', () => {
  it('nạp danh sách và sắp xếp theo tên', () => {
    useAppStore.getState().datDanhSachDoi([doi('2', 'Xuân Thành'), doi('1', 'An Giang')])
    expect(useAppStore.getState().teams.map((d) => d.name)).toEqual([
      'An Giang',
      'Xuân Thành',
    ])
  })

  it('đổi tên đội thì giá trị đọc ra từ store là tên mới (AC-1.5)', () => {
    const s = useAppStore.getState()
    s.datDanhSachDoi([doi('1', 'Tên cũ'), doi('2', 'Đội khác')])

    useAppStore.getState().capNhatTenDoi('1', 'Tên mới')

    const sau = useAppStore.getState().teams
    expect(sau.find((d) => d.id === '1')?.name).toBe('Tên mới')
  })

  it('không còn bản sao nào của tên cũ trong store sau khi đổi tên', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'Tên cũ')])
    useAppStore.getState().capNhatTenDoi('1', 'Tên mới')

    // Quét toàn bộ trạng thái, không chỉ mảng teams: nếu có chỗ nào giữ thêm
    // một bản sao tên đội thì nó sẽ lệch với mảng teams từ lúc này.
    const chuoi = JSON.stringify(useAppStore.getState())
    expect(chuoi).not.toContain('Tên cũ')
    expect(chuoi).toContain('Tên mới')
  })

  it('đổi tên xong thì danh sách vẫn đúng thứ tự', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'An Giang'), doi('2', 'Bình Dương')])
    useAppStore.getState().capNhatTenDoi('1', 'Cần Thơ')
    expect(useAppStore.getState().teams.map((d) => d.name)).toEqual([
      'Bình Dương',
      'Cần Thơ',
    ])
  })

  it('đổi tên một id không có trong store thì không làm gì', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'Đội A')])
    useAppStore.getState().capNhatTenDoi('khong-co', 'Tên lạ')
    expect(useAppStore.getState().teams.map((d) => d.name)).toEqual(['Đội A'])
  })

  it('thêm đội mới vào đúng vị trí theo tên', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'An Giang'), doi('3', 'Cần Thơ')])
    useAppStore.getState().themDoi(doi('2', 'Bình Dương'))
    expect(useAppStore.getState().teams.map((d) => d.name)).toEqual([
      'An Giang',
      'Bình Dương',
      'Cần Thơ',
    ])
  })

  it('bỏ đội khỏi store', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'Đội A'), doi('2', 'Đội B')])
    useAppStore.getState().boDoi('1')
    expect(useAppStore.getState().teams.map((d) => d.id)).toEqual(['2'])
  })

  it('cập nhật số cầu thủ của một đội', () => {
    useAppStore.getState().datDanhSachDoi([doi('1', 'Đội A', 0)])
    useAppStore.getState().datSoCauThu('1', 18)
    expect(useAppStore.getState().teams[0]?.soCauThu).toBe(18)
  })
})
