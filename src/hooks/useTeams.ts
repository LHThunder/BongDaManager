import { useCallback } from 'react'
import type { Team } from '../domain/types'
import { laLoi, type LoiUngDung } from '../services/errors'
import * as teamRepo from '../services/teamRepo'
import { yeuCauLuuTruBen } from '../storage/db'
import { useAppStore } from '../store/appStore'

/*
  Hook điều phối: gọi `services`, rồi cập nhật `store`.

  Không có nút Lưu nào ở đây — mọi hành động rời rạc ghi xuống lưu trữ ngay
  trong cùng lượt gọi (AC-4.1, quyết định D4 của plan).

  Lỗi hết dung lượng được đẩy vào store để hiện ở MỘT chỗ duy nhất (AC-4.7),
  đồng thời vẫn ném tiếp để form đang mở biết là việc vừa rồi đã thất bại.
*/

function ghiNhanLoiLuuTru(loi: unknown): never {
  if (laLoi(loi, 'QuotaExceeded') || laLoi(loi, 'StorageUnavailable')) {
    useAppStore.getState().datLoiLuuTru(loi as LoiUngDung)
  }
  throw loi
}

export function useTeams() {
  const teams = useAppStore((s) => s.teams)
  const dangTai = useAppStore((s) => s.dangTaiDanhSachDoi)

  const napDanhSachDoi = useCallback(async (): Promise<void> => {
    const { datDangTai, datDanhSachDoi } = useAppStore.getState()
    datDangTai(true)
    try {
      // Xin quyền lưu trữ bền ngay lần nạp đầu (AC-4.9, giảm thiểu rủi ro R2).
      // Không chặn việc nạp dữ liệu nếu trình duyệt từ chối.
      void yeuCauLuuTruBen()
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

  const taoDoi = useCallback(async (ten: string): Promise<Team> => {
    try {
      const doi = await teamRepo.create({ name: ten })
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
  }, [])

  const doiTenDoi = useCallback(
    async (id: string, ten: string): Promise<Team> => {
      try {
        const doi = await teamRepo.rename(id, ten)
        useAppStore.getState().capNhatTenDoi(id, doi.name)
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
    doiTenDoi,
    xoaDoi,
  }
}
