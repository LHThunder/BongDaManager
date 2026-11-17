import { useCallback, useState } from 'react'
import type { FormationId } from '../domain/formations'
import { xepLaiKhiDoiSoDo, type KetQuaXepLai } from '../domain/lineup'
import { vaiTroMacDinh, type RoleId } from '../domain/roles'
import { laySoDo } from '../domain/formations'
import type { BoChiThi } from '../domain/instructions'
import type { Tactic } from '../domain/types'
import { QUAN_SO_MAC_DINH } from '../engine/tran'
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

/**
 * Kết quả của một lần bấm "tự chọn đội hình".
 *
 * Phân biệt "đội rỗng" với "chưa sẵn sàng" vì chúng là hai câu khác nhau với
 * người dùng: một cái bảo họ thêm cầu thủ, một cái chỉ là trang chưa nạp
 * xong. Trường hợp đội rỗng là trường hợp biên ở spec mục 5.
 */
export type KetQuaTuChon =
  | { readonly loai: 'xong'; readonly ketQua: KetQuaXepLai }
  | { readonly loai: 'doi-rong' }
  | { readonly loai: 'chua-san-sang' }

export function useTactic(teamId: string, quanSo = QUAN_SO_MAC_DINH) {
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
      const bo = await tacticRepo.layChienThuatTheoQuanSo(teamId, quanSo)
      useAppStore.getState().datChienThuat(teamId, bo)
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    }
  }, [teamId, quanSo])

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
   * Tự chọn đội hình cho sơ đồ đang dùng, kèm lý do từng ô (AC-26.8, AC-26.9).
   *
   * **Cân nhắc TOÀN ĐỘI, không chỉ người đang trên sân.** `xepLaiKhiDoiSoDo`
   * lấy danh sách người từ tham số `oVienCu`, nên cả đội đi vào dưới dạng
   * một `oVienCu` giả — truyền đội hình hiện tại thì nó chỉ xáo lại 11 người
   * đang đứng đó, tức không phải "tự chọn" mà là "xếp lại".
   *
   * **Giữ nguyên vai trò của từng ô.** Vai trò là lựa chọn chiến thuật của
   * người dùng và gắn với Ô, không gắn với cầu thủ (AC-6.6); tự chọn người
   * thì không được tiện tay đặt lại vai trò.
   */
  const tuChonDoiHinh = useCallback(async (): Promise<KetQuaTuChon> => {
    if (!chienThuat) return { loai: 'chua-san-sang' }

    const { cauThu } = useAppStore.getState()
    if (cauThu.length === 0) return { loai: 'doi-rong' }

    const ketQua = xepLaiKhiDoiSoDo(
      chienThuat.formationId,
      cauThu.map((p, i) => ({ slotId: `ca-doi-${i}`, playerId: p.id })),
      cauThu.map((p) => ({ id: p.id, positions: p.positions })),
    )

    const nguoiTheoSlot = new Map(
      ketQua.oVien.map((o) => [o.slotId, o.playerId]),
    )

    await ghi({
      ...chienThuat,
      oVien: chienThuat.oVien.map((o) => ({
        ...o,
        playerId: nguoiTheoSlot.get(o.slotId) ?? null,
      })),
    })

    return { loai: 'xong', ketQua }
  }, [chienThuat, ghi])

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

  // ---------------------------------------------------------------------
  // Bộ chiến thuật có tên (AC-7.5, AC-7.6)
  // ---------------------------------------------------------------------

  /*
    Danh sách bộ có tên giữ ở ngay hook này chứ không vào store dùng chung:
    chỉ trang chiến thuật cần tới nó, và store chỉ nên giữ thứ mà nhiều màn
    hình cùng đọc.
  */
  const [cacBo, datCacBo] = useState<readonly Tactic[]>([])

  const napDanhSachBo = useCallback(async (): Promise<void> => {
    try {
      datCacBo(await tacticRepo.danhSachBo(teamId))
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    }
  }, [teamId])

  const luuThanhBo = useCallback(
    async (ten: string): Promise<void> => {
      try {
        await tacticRepo.luuThanhBo(teamId, ten)
        datCacBo(await tacticRepo.danhSachBo(teamId))
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [teamId],
  )

  const apDungBo = useCallback(
    async (tacticId: string): Promise<void> => {
      try {
        const bo = await tacticRepo.apDungBo(teamId, tacticId)
        useAppStore.getState().datChienThuat(teamId, bo)
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [teamId],
  )

  return {
    chienThuat,
    napChienThuat,
    datCauThuVaoO,
    boKhoiSan,
    xoaNguoiKhoiO,
    doiSoDo,
    tuChonDoiHinh,
    datVaiTroChoO,
    datChiThi,
    cacBo,
    napDanhSachBo,
    luuThanhBo,
    apDungBo,
  }
}
