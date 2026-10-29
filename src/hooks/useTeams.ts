import { useCallback } from 'react'
import type { Team } from '../domain/types'
import type { TrangThaiTran } from '../engine/tran'
import * as teamRepo from '../services/teamRepo'
import { useAppStore } from '../store/appStore'
import { ghiNhanLoiLuuTru } from './useBackup'

/*
  Hook điều phối: gọi `services`, rồi cập nhật `store`.

  Không có nút Lưu nào ở đây — mọi hành động rời rạc ghi xuống lưu trữ ngay
  trong cùng lượt gọi (AC-4.1, quyết định D4 của plan).

  Lỗi hết dung lượng được đẩy vào store để hiện ở MỘT chỗ duy nhất (AC-4.7)
  qua `ghiNhanLoiLuuTru` của `useBackup`, đồng thời vẫn ném tiếp để form đang
  mở biết là việc vừa rồi đã thất bại.
*/

/**
 * Đội này có đang đá một trận dở trong bộ nhớ không (spec mục 5).
 *
 * Chỉ nói về trận ĐANG CHẠY. Trận trong lịch sử không tính: mục 5 nói trận cũ
 * vẫn phải xem lại được sau khi xoá đội.
 */
export function coTranDangDien(
  tran: TrangThaiTran | null,
  teamId: string,
): boolean {
  if (!tran) return false
  return tran.ben.nha.teamId === teamId || tran.ben.khach.teamId === teamId
}

export function useTeams() {
  const teams = useAppStore((s) => s.teams)
  const dangTai = useAppStore((s) => s.dangTaiDanhSachDoi)

  const napDanhSachDoi = useCallback(async (): Promise<void> => {
    const { datDangTai, datDanhSachDoi } = useAppStore.getState()
    datDangTai(true)
    try {
      datDanhSachDoi(await teamRepo.list())
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    } finally {
      datDangTai(false)
    }
  }, [])

  const kiemTraTrungTen = useCallback(
    async (ten: string): Promise<Team[]> => {
      try {
        return await teamRepo.findByName(ten)
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [],
  )

  const taoDoi = useCallback(
    async (input: teamRepo.TaoDoiInput): Promise<Team> => {
      try {
        const doi = await teamRepo.create(input)
        useAppStore.getState().themDoi({
          id: doi.id,
          name: doi.name,
          logoImageId: doi.logoImageId,
          primaryColor: doi.primaryColor,
          secondaryColor: doi.secondaryColor,
          soCauThu: 0,
        })
        return doi
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [],
  )

  const capNhatDoi = useCallback(
    async (id: string, thayDoi: teamRepo.ThayDoiDoi): Promise<Team> => {
      try {
        const doi = await teamRepo.capNhat(id, thayDoi)
        useAppStore.getState().capNhatDoiTrongStore(id, {
          name: doi.name,
          logoImageId: doi.logoImageId,
          primaryColor: doi.primaryColor,
          secondaryColor: doi.secondaryColor,
        })
        return doi
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [],
  )

  const xoaDoi = useCallback(
    async (id: string): Promise<teamRepo.KetQuaXoaDoi> => {
      try {
        const ketQua = await teamRepo.remove(id)
        useAppStore.getState().boDoi(id)

        /*
          Trận dở của đội vừa xoá bị BỎ, không vào lịch sử (spec mục 5) — một
          trong hai bên không còn hồ sơ thì trận ấy không còn ý nghĩa gì.
          Người dùng đã được hộp xác nhận nói trước việc này.
        */
        const st = useAppStore.getState()
        if (coTranDangDien(st.tran, id)) {
          st.datTranDangChay(false)
          st.datTran(null)
        }
        return ketQua
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [],
  )

  return {
    teams,
    dangTai,
    napDanhSachDoi,
    kiemTraTrungTen,
    taoDoi,
    capNhatDoi,
    xoaDoi,
  }
}
