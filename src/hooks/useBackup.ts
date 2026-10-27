import { useCallback, useEffect } from 'react'
import * as backup from '../services/backupService'
import { laLoi, type LoiUngDung } from '../services/errors'
import { yeuCauLuuTruBen } from '../storage/db'
import { useAppStore } from '../store/appStore'

/*
  Sao lưu và phục hồi (AC-4.3 → AC-4.9).

  Đây cũng là chỗ DUY NHẤT quy lỗi lưu trữ về cảnh báo cho người dùng
  (AC-4.7). `useTeams` và `usePlayers` dùng lại `ghiNhanLoiLuuTru` ở đây thay
  vì mỗi hook tự xử lý, để một mã lỗi chỉ có một cách báo trên toàn ứng dụng.
*/

/**
 * Ghi nhận lỗi lưu trữ vào store để cảnh báo hiện ở một chỗ, rồi ném tiếp
 * để chỗ gọi (form đang mở) biết việc vừa rồi đã thất bại.
 */
export function ghiNhanLoiLuuTru(loi: unknown): never {
  if (laLoi(loi, 'QuotaExceeded') || laLoi(loi, 'StorageUnavailable')) {
    useAppStore.getState().datLoiLuuTru(loi as LoiUngDung)
  }
  throw loi
}

export function useBackup() {
  const luuTruKhongBen = useAppStore((s) => s.luuTruKhongBen)

  // Kiểm tình trạng lưu trữ bền một lần khi ứng dụng mở (AC-4.9).
  useEffect(() => {
    let conHieuLuc = true
    void yeuCauLuuTruBen().then((ketQua) => {
      if (conHieuLuc) {
        useAppStore.getState().datLuuTruKhongBen(ketQua === 'bi-tu-choi')
      }
    })
    return () => {
      conHieuLuc = false
    }
  }, [])

  const uocTinhKichThuoc = useCallback(async (): Promise<number> => {
    try {
      return await backup.uocTinhKichThuoc()
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    }
  }, [])

  /** Dựng tệp rồi kích hoạt tải về. */
  const xuatTep = useCallback(async (): Promise<void> => {
    let url: string | null = null
    try {
      const blob = await backup.exportAll()
      url = URL.createObjectURL(blob)

      const lienKet = document.createElement('a')
      lienKet.href = url
      lienKet.download = backup.tenTepSaoLuu()
      document.body.appendChild(lienKet)
      lienKet.click()
      lienKet.remove()
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    } finally {
      if (url) URL.revokeObjectURL(url)
    }
  }, [])

  const xemTruocTep = useCallback(
    (tep: Blob): Promise<backup.TomTatTep> => backup.inspect(tep),
    [],
  )

  const nhapTep = useCallback(
    async (tep: Blob, cheDo: backup.CheDoNhap): Promise<backup.BaoCaoNhap> => {
      try {
        const baoCao = await backup.importAll(tep, cheDo)
        // Dữ liệu trong store không còn đúng nữa, nạp lại từ lưu trữ.
        useAppStore.getState().datCauThu('', [])
        return baoCao
      } catch (loi) {
        ghiNhanLoiLuuTru(loi)
      }
    },
    [],
  )

  return {
    luuTruKhongBen,
    uocTinhKichThuoc,
    xuatTep,
    xemTruocTep,
    nhapTep,
  }
}
