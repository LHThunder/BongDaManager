import { laySoDo, SO_DO_MAC_DINH } from '../../domain/formations'
import { CHI_THI_MAC_DINH } from '../../domain/instructions'
import { vaiTroMacDinh } from '../../domain/roles'
import type { Tactic } from '../../domain/types'
import type { CauHinhTran, DangKyBen } from '../tran'

/*
  Đội mẫu cho test engine.

  File này CHỈ test dùng. Nó nằm trong `engine/` để phép canh biên giới của
  T072 cũng soi nó — một bộ dựng đội mà lỡ import `services` thì test engine
  đã kéo theo cả tầng lưu trữ mà không ai biết.
*/

export function chienThuatMau(teamId: string): Tactic {
  return {
    id: `ct-${teamId}`,
    teamId,
    ten: null,
    formationId: SO_DO_MAC_DINH,
    oVien: laySoDo(SO_DO_MAC_DINH).oVien.map((o) => ({
      slotId: o.slotId,
      playerId: null,
      roleId: vaiTroMacDinh(o.viTri),
    })),
    chiThi: CHI_THI_MAC_DINH,
    createdAt: 0,
    updatedAt: 0,
  }
}

/** Một bên đăng ký đủ 11 chính + 7 dự bị, id cầu thủ có tiền tố riêng. */
export function benMau(teamId: string): DangKyBen {
  return {
    teamId,
    chienThuatXuatPhat: chienThuatMau(teamId),
    trenSan: Array.from({ length: 11 }, (_, i) => `${teamId}-${i + 1}`),
    duBi: Array.from({ length: 7 }, (_, i) => `${teamId}-db${i + 1}`),
  }
}

export function cauHinhMau(
  maTran: string,
  ghiDe: Partial<CauHinhTran> = {},
): CauHinhTran {
  return {
    maTran,
    nha: benMau('A'),
    khach: benMau('B'),
    sanTrungLap: false,
    ...ghiDe,
  }
}

/** Bộ mã trận cố định cho những test chạy nhiều trận rồi so trung bình. */
export const MA_TRAN_CO_DINH: readonly string[] = [
  'K7M2R9XQ4B',
  'P3V8N1TZ6C',
  'W5H4J2YD9F',
  'R8K3M7QX2N',
  'T6B9V4CZ1P',
  'H2N5W8JY3R',
  'M4T7K1XQ9B',
  'C9P2R6NV5H',
  'Y3J8T4MZ7W',
  'B5X1H9KQ2T',
]
