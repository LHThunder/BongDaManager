import { useCallback } from 'react'
import type { FormationId } from '../domain/formations'
import { xepLaiKhiDoiSoDo, type KetQuaXepLai } from '../domain/lineup'
import { vaiTroMacDinh, type RoleId } from '../domain/roles'
import { laySoDo } from '../domain/formations'
import type { BoChiThi } from '../domain/instructions'
import type { Tactic } from '../domain/types'
import * as tacticRepo from '../services/tacticRepo'
import { useAppStore } from '../store/appStore'
import { ghiNhanLoiLuuTru } from './useBackup'

/*
  Hook chiến thuật: gọi `services`, rồi cập nhật `store`.

  Mỗi thay đổi được ghi xuống lưu trữ NGAY trong cùng lượt gọi — không có nút
  Lưu (AC-4.1 vẫn áp dụng cho giai đoạn này). Store được cập nhật trước để
  giao diện phản hồi tức thì, rồi `tacticRepo.luu` ghi xuống; ghi thất bại thì
  `ghiNhanLoiLuuTru` đưa cảnh báo ra chỗ duy nhất của ứng dụng (AC-4.7).
*/

export function useTactic(teamId: string) {
  /*
    Selector trả `null` khi chiến thuật trong store thuộc đội khác. `null` là
    giá trị nguyên thuỷ nên zustand so sánh bằng Object.is thấy không đổi —
    không như một object hay mảng viết trực tiếp trong selector, vốn là thứ
    từng gây vòng lặp render vô tận ở T020.
  */
  const chienThuat = useAppStore((s) =>
    s.doiCuaChienThuat === teamId ? s.chienThuat : null,
  )

  const napChienThuat = useCallback(async (): Promise<void> => {
    try {
      const bo = await tacticRepo.layChienThuatDangDung(teamId)
      useAppStore.getState().datChienThuat(teamId, bo)
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    }
  }, [teamId])

  /** Ghi một bộ đã sửa: cập nhật store trước, rồi ghi xuống lưu trữ. */
  const ghi = useCallback(
    async (bo: Tactic): Promise<void> => {
      useAppStore.getState().datChienThuat(teamId, bo)
      try {
        const daGhi = await tacticRepo.luu(bo)
        useAppStore.getState().datChienThuat(teamId, daGhi)
      } catch (loi) {
        // Lưu thất bại: nạp lại từ lưu trữ để giao diện không hiện thứ chưa
        // thật sự được ghi.
        void napChienThuat()
        ghiNhanLoiLuuTru(loi)
      }
    },
    [teamId, napChienThuat],
  )

  /**
   * Đặt một cầu thủ vào ô (AC-5.3, AC-5.4).
   *
   * - Ô trống, người từ ngoài sân: đặt vào.
   * - Người đang ở ô khác: hai ô ĐỔI CHỖ cho nhau.
   * - Ô đã có người, người từ ngoài sân: người cũ về ngoài sân.
   *
   * Không trường hợp nào làm mất cầu thủ: người bị thay luôn còn trong đội,
   * chỉ là không còn trên sân.
   */
  const datCauThuVaoO = useCallback(
    async (slotId: string, playerId: string): Promise<void> => {
      if (!chienThuat) return

      const oDich = chienThuat.oVien.find((o) => o.slotId === slotId)
      if (!oDich || oDich.playerId === playerId) return

      const oNguon = chienThuat.oVien.find((o) => o.playerId === playerId)
      const nguoiBiThay = oDich.playerId

      const oVien = chienThuat.oVien.map((o) => {
        if (o.slotId === slotId) return { ...o, playerId }
        if (oNguon && o.slotId === oNguon.slotId) {
          return { ...o, playerId: nguoiBiThay }
        }
        return o
      })

      await ghi({ ...chienThuat, oVien })
    },
    [chienThuat, ghi],
  )

  /** Đưa một cầu thủ ra ngoài sân; ô của họ thành trống (AC-5.6). */
  const boKhoiSan = useCallback(
    async (playerId: string): Promise<void> => {
      if (!chienThuat) return
      if (!chienThuat.oVien.some((o) => o.playerId === playerId)) return

      const oVien = chienThuat.oVien.map((o) =>
        o.playerId === playerId ? { ...o, playerId: null } : o,
      )
      await ghi({ ...chienThuat, oVien })
    },
    [chienThuat, ghi],
  )

  /** Làm trống một ô cụ thể. */
  const xoaNguoiKhoiO = useCallback(
    async (slotId: string): Promise<void> => {
      if (!chienThuat) return
      const o = chienThuat.oVien.find((x) => x.slotId === slotId)
      if (!o || o.playerId === null) return
      await boKhoiSan(o.playerId)
    },
    [chienThuat, boKhoiSan],
  )

  /**
   * Đổi sơ đồ: giữ lại người đang trên sân và tự xếp vào ô của sơ đồ mới
   * (AC-5.8). Trả về kết quả xếp lại để trang hiện thông báo ai bị ảnh hưởng.
   *
   * Mọi ô của sơ đồ mới đều nhận vai trò mặc định của vị trí, nên người dùng
   * không phải tự gán 11 vai trò (AC-6.5).
   */
  const doiSoDo = useCallback(
    async (formationId: FormationId): Promise<KetQuaXepLai | null> => {
      if (!chienThuat || chienThuat.formationId === formationId) return null

      const { cauThu } = useAppStore.getState()
      const ketQua = xepLaiKhiDoiSoDo(
        formationId,
        chienThuat.oVien.map((o) => ({
          slotId: o.slotId,
          playerId: o.playerId,
        })),
        cauThu.map((p) => ({ id: p.id, positions: p.positions })),
      )

      const viTriTheoSlot = new Map(
        laySoDo(formationId).oVien.map((o) => [o.slotId, o.viTri]),
      )

      await ghi({
        ...chienThuat,
        formationId,
        oVien: ketQua.oVien.map((o) => ({
          slotId: o.slotId,
          playerId: o.playerId,
          roleId: vaiTroMacDinh(viTriTheoSlot.get(o.slotId) ?? 'MC'),
        })),
      })

      return ketQua
    },
    [chienThuat, ghi],
  )

  /**
   * Gán vai trò cho một ô. Vai trò gắn với Ô, không gắn với cầu thủ, nên đổi
   * người ở ô không làm đổi vai trò (AC-6.6).
   */
  const datVaiTroChoO = useCallback(
    async (slotId: string, roleId: RoleId): Promise<void> => {
      if (!chienThuat) return
      const oVien = chienThuat.oVien.map((o) =>
        o.slotId === slotId ? { ...o, roleId } : o,
      )
      await ghi({ ...chienThuat, oVien })
    },
    [chienThuat, ghi],
  )

  /** Đổi bộ chỉ thị toàn đội (AC-7.1). */
  const datChiThi = useCallback(
    async (chiThi: BoChiThi): Promise<void> => {
      if (!chienThuat) return
      await ghi({ ...chienThuat, chiThi })
    },
    [chienThuat, ghi],
  )

  return {
    chienThuat,
    napChienThuat,
    datCauThuVaoO,
    boKhoiSan,
    xoaNguoiKhoiO,
    doiSoDo,
    datVaiTroChoO,
    datChiThi,
  }
}
