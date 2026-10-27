import { useCallback } from 'react'
import type { Player } from '../domain/types'
import * as playerRepo from '../services/playerRepo'
import { useAppStore } from '../store/appStore'
import { ghiNhanLoiLuuTru } from './useBackup'

/*
  Hook cầu thủ: gọi `services`, rồi cập nhật `store`.

  Mỗi lần số cầu thủ của đội đổi, con số trên danh sách đội cũng được cập
  nhật ngay — nó đọc từ cùng một store nên không có hai nguồn sự thật
  (AC-1.4, AC-2.7).
*/

/*
  Mảng rỗng CỐ ĐỊNH, không tạo mới mỗi lần gọi selector.

  zustand so sánh kết quả selector bằng Object.is. Nếu selector trả `[]` viết
  trực tiếp thì mỗi lần gọi là một mảng mới, zustand luôn thấy "đã đổi" và
  render lại vô tận — React báo "Maximum update depth exceeded".
*/
const KHONG_CO_CAU_THU: readonly Player[] = []

export function usePlayers(teamId: string) {
  const cauThu = useAppStore((s) =>
    s.doiDangMo === teamId ? s.cauThu : KHONG_CO_CAU_THU,
  )
  const dangTai = useAppStore((s) => s.dangTaiCauThu)

  const napCauThu = useCallback(async (): Promise<void> => {
    const { datDangTaiCauThu, datCauThu, datSoCauThu } = useAppStore.getState()
    datDangTaiCauThu(true)
    try {
      const ds = await playerRepo.listByTeam(teamId)
      datCauThu(teamId, ds)
      datSoCauThu(teamId, ds.length)
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    } finally {
      datDangTaiCauThu(false)
    }
  }, [teamId])

  const luuCauThu = useCallback(
    async (input: playerRepo.LuuCauThuInput): Promise<Player> => {
      try {
        const p = await playerRepo.save(input)
        const store = useAppStore.getState()
        store.luuCauThu(p)
        store.datSoCauThu(teamId, useAppStore.getState().cauThu.length)
        return p
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [teamId],
  )

  const xoaCauThu = useCallback(
    async (id: string): Promise<void> => {
      try {
        await playerRepo.remove(id)
        const store = useAppStore.getState()
        store.boCauThu(id)
        store.datSoCauThu(teamId, useAppStore.getState().cauThu.length)
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [teamId],
  )

  return { cauThu, dangTai, napCauThu, luuCauThu, xoaCauThu }
}
