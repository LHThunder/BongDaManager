import { create } from 'zustand'
import type { Player } from '../domain/types'
import type { LoiUngDung } from '../services/errors'
import type { TeamSummary } from '../services/teamRepo'

/*
  Trạng thái giao diện và dữ liệu đã nạp.

  Store này KHÔNG gọi `services` hay `storage` — nó chỉ giữ dữ liệu và nhận
  lệnh cập nhật từ `hooks` (plan mục 3, phần bổ sung sau khi soát chéo).
  Nhờ vậy nó test được mà không cần mở database, và không có luật bóng đá nào
  lọt vào đây (P2).

  Tên đội chỉ tồn tại ở MỘT chỗ: mảng `teams`. Không giữ thêm bản sao nào,
  vì hai bản sao là hai thứ sẽ lệch nhau (AC-1.5).
*/

function theoTen(a: TeamSummary, b: TeamSummary): number {
  return a.name.localeCompare(b.name, 'vi')
}

function theoSoAo(a: Player, b: Player): number {
  return a.shirtNumber - b.shirtNumber
}

export interface AppState {
  readonly teams: readonly TeamSummary[]
  readonly dangTaiDanhSachDoi: boolean
  /** Lỗi lưu trữ cần báo cho người dùng ở một chỗ duy nhất (AC-4.7). */
  readonly loiLuuTru: LoiUngDung | null

  /** Cầu thủ của đội đang mở; rỗng khi không mở đội nào. */
  readonly cauThu: readonly Player[]
  readonly doiDangMo: string | null
  readonly dangTaiCauThu: boolean

  datDanhSachDoi(teams: readonly TeamSummary[]): void
  datDangTai(dangTai: boolean): void
  themDoi(doi: TeamSummary): void
  capNhatTenDoi(id: string, ten: string): void
  capNhatDoiTrongStore(id: string, phan: Partial<TeamSummary>): void
  boDoi(id: string): void
  datSoCauThu(id: string, soCauThu: number): void
  datLoiLuuTru(loi: LoiUngDung | null): void

  datCauThu(teamId: string, cauThu: readonly Player[]): void
  datDangTaiCauThu(dangTai: boolean): void
  luuCauThu(cauThu: Player): void
  boCauThu(id: string): void
}

export const useAppStore = create<AppState>((set) => ({
  teams: [],
  dangTaiDanhSachDoi: false,
  loiLuuTru: null,

  datDanhSachDoi: (teams) => set({ teams: [...teams].sort(theoTen) }),

  datDangTai: (dangTai) => set({ dangTaiDanhSachDoi: dangTai }),

  themDoi: (doi) =>
    set((s) => ({ teams: [...s.teams, doi].sort(theoTen) })),

  capNhatTenDoi: (id, ten) =>
    set((s) => ({
      teams: s.teams
        .map((d) => (d.id === id ? { ...d, name: ten } : d))
        .sort(theoTen),
    })),

  capNhatDoiTrongStore: (id, phan) =>
    set((s) => ({
      teams: s.teams
        .map((d) => (d.id === id ? { ...d, ...phan } : d))
        .sort(theoTen),
    })),

  boDoi: (id) => set((s) => ({ teams: s.teams.filter((d) => d.id !== id) })),

  datSoCauThu: (id, soCauThu) =>
    set((s) => ({
      teams: s.teams.map((d) => (d.id === id ? { ...d, soCauThu } : d)),
    })),

  datLoiLuuTru: (loi) => set({ loiLuuTru: loi }),

  cauThu: [],
  doiDangMo: null,
  dangTaiCauThu: false,

  datCauThu: (teamId, cauThu) =>
    set({ doiDangMo: teamId, cauThu: [...cauThu].sort(theoSoAo) }),

  datDangTaiCauThu: (dangTai) => set({ dangTaiCauThu: dangTai }),

  luuCauThu: (cauThu) =>
    set((s) => {
      const daCo = s.cauThu.some((p) => p.id === cauThu.id)
      const moi = daCo
        ? s.cauThu.map((p) => (p.id === cauThu.id ? cauThu : p))
        : [...s.cauThu, cauThu]
      return { cauThu: moi.sort(theoSoAo) }
    }),

  boCauThu: (id) => set((s) => ({ cauThu: s.cauThu.filter((p) => p.id !== id) })),
}))

/** Trạng thái ban đầu, dùng để test dọn store giữa các lần chạy. */
export function datLaiStore(): void {
  useAppStore.setState({
    teams: [],
    dangTaiDanhSachDoi: false,
    loiLuuTru: null,
    cauThu: [],
    doiDangMo: null,
    dangTaiCauThu: false,
  })
}
