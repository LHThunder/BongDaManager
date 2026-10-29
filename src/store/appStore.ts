import { create } from 'zustand'
import type { TrangThaiTran } from '../engine/tran'
import type { TomTatTran } from '../storage/db'

/** Tóm tắt một lần chạy, đủ để so hai lần cùng mã trận (AC-8.12). */
export interface KetQuaDaChay {
  readonly maTran: string
  readonly tiSo: { readonly nha: number; readonly khach: number }
  readonly cuSut: { readonly nha: number; readonly khach: number }
  readonly coHoi: { readonly nha: number; readonly khach: number }
}
import type { Player, Tactic } from '../domain/types'
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
  /** true khi trình duyệt từ chối đánh dấu dữ liệu là lưu trữ bền (AC-4.9). */
  readonly luuTruKhongBen: boolean

  /** Cầu thủ của đội đang mở; rỗng khi không mở đội nào. */
  readonly cauThu: readonly Player[]
  readonly doiDangMo: string | null
  readonly dangTaiCauThu: boolean

  /** Bộ chiến thuật đang mở, và đội mà nó thuộc về. */
  readonly chienThuat: Tactic | null
  readonly doiCuaChienThuat: string | null

  datDanhSachDoi(teams: readonly TeamSummary[]): void
  datDangTai(dangTai: boolean): void
  themDoi(doi: TeamSummary): void
  capNhatTenDoi(id: string, ten: string): void
  capNhatDoiTrongStore(id: string, phan: Partial<TeamSummary>): void
  boDoi(id: string): void
  datSoCauThu(id: string, soCauThu: number): void
  datLoiLuuTru(loi: LoiUngDung | null): void
  datLuuTruKhongBen(khongBen: boolean): void

  datCauThu(teamId: string, cauThu: readonly Player[]): void
  datDangTaiCauThu(dangTai: boolean): void
  luuCauThu(cauThu: Player): void
  boCauThu(id: string): void

  datChienThuat(teamId: string, chienThuat: Tactic | null): void

  /** Trận đang chạy; chỉ sống trong bộ nhớ (quyết định D32). */
  readonly tran: TrangThaiTran | null
  datTran(tran: TrangThaiTran | null): void

  /*
    Đồng hồ trận nằm ở store chứ không ở state của hook: `useMatch` được gọi
    từ HAI trang khác nhau — màn chọn cặp đấu bật trận rồi chuyển trang, trang
    trận mới là nơi chạy nó. Để trong hook thì mỗi trang có một cờ riêng và
    trận đứng im ở phút 0.
  */
  readonly tranDangChay: boolean
  datTranDangChay(dangChay: boolean): void

  /*
    Kết quả lần chạy trước của cùng một mã trận, để so sánh (AC-8.12).
    Chỉ giữ TRONG PHIÊN làm việc — phần bền thuộc Giai đoạn 4 (quyết định
    D31), nên đóng app là mất.
  */
  readonly ketQuaTruoc: KetQuaDaChay | null
  datKetQuaTruoc(kq: KetQuaDaChay | null): void

  /*
    Hai lát phục vụ việc lưu trận vào lịch sử (AC-11.7).

    `idLanChay` sinh mới mỗi lần bắt đầu một trận, kể cả khi đấu lại CÙNG mã
    trận — hai lần chạy cùng mã vẫn là hai trận trong lịch sử.

    `idDaLuu` là chốt chặn chạy-một-lần: `useMatch` được gọi từ hai trang khác
    nhau, nên nếu không có chốt thì trận kết thúc sẽ được lưu hai lần. Chốt
    được đặt TRƯỚC khi chờ ghi đĩa, để lần gọi thứ hai bỏ cuộc ngay.
  */
  readonly idLanChay: string | null
  datIdLanChay(id: string | null): void
  readonly idDaLuu: string | null
  datIdDaLuu(id: string | null): void

  /** Danh sách trận đã lưu, để trang lịch sử vẽ mà không đọc lại đĩa. */
  readonly lichSu: readonly TomTatTran[]
  datLichSu(ds: readonly TomTatTran[]): void
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

  luuTruKhongBen: false,
  datLuuTruKhongBen: (khongBen) => set({ luuTruKhongBen: khongBen }),

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

  chienThuat: null,
  doiCuaChienThuat: null,

  datChienThuat: (teamId, chienThuat) =>
    set({ doiCuaChienThuat: teamId, chienThuat }),

  tran: null,
  datTran: (tran) => set({ tran }),

  tranDangChay: false,
  datTranDangChay: (tranDangChay) => set({ tranDangChay }),

  ketQuaTruoc: null,
  datKetQuaTruoc: (ketQuaTruoc) => set({ ketQuaTruoc }),

  idLanChay: null,
  datIdLanChay: (idLanChay) => set({ idLanChay }),
  idDaLuu: null,
  datIdDaLuu: (idDaLuu) => set({ idDaLuu }),

  lichSu: [],
  datLichSu: (lichSu) => set({ lichSu }),
}))

/** Trạng thái ban đầu, dùng để test dọn store giữa các lần chạy. */
export function datLaiStore(): void {
  useAppStore.setState({
    teams: [],
    dangTaiDanhSachDoi: false,
    loiLuuTru: null,
    luuTruKhongBen: false,
    cauThu: [],
    doiDangMo: null,
    dangTaiCauThu: false,
    chienThuat: null,
    doiCuaChienThuat: null,
    tran: null,
    tranDangChay: false,
    ketQuaTruoc: null,
    idLanChay: null,
    idDaLuu: null,
    lichSu: [],
  })
}
