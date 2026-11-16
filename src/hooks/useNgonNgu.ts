import { useCallback, useEffect } from 'react'
import { chuanHoaLoiLuuTru } from '../services/errors'
import * as tuyChonRepo from '../services/tuyChonRepo'
import type { CheDo, NgonNgu } from '../services/tuyChonRepo'
import { useAppStore } from '../store/appStore'
import { layBoChuoi, type BoChuoi } from '../ui/ngonNgu'

/*
  Ngôn ngữ giao diện và chế độ sáng/tối (AC-17.2, AC-17.4, AC-20.7, AC-20.8).

  Hook nằm ở tầng `hooks` vì nó chạm `services`; `ui` chỉ gọi hook, đúng luồng
  phụ thuộc một chiều của hiến pháp mục 3.

  Hai việc tách bạch:
    - `useChuoi()` chỉ ĐỌC — mọi component đều gọi, nên nó phải rẻ và không
      có tác dụng phụ.
    - `useTuyChonHienThi()` mới là nơi ghi và nạp, và chỉ một chỗ gọi.
*/

/** Bộ chữ của ngôn ngữ đang chọn. Mọi component lấy chữ qua đây (D67). */
export function useChuoi(): BoChuoi {
  const ngonNgu = useAppStore((s) => s.ngonNgu)
  return layBoChuoi(ngonNgu)
}

export interface TuyChonHienThi {
  readonly ngonNgu: NgonNgu
  readonly cheDo: CheDo
  doiNgonNgu(ngonNgu: NgonNgu): void
  doiCheDo(cheDo: CheDo): void
}

/**
 * Nạp hai tuỳ chọn lúc mở ứng dụng, và ghi lại khi người dùng đổi.
 *
 * Đổi là **đặt vào store trước, ghi đĩa sau**: màn hình phải đổi ngay trong
 * cùng một nhịp vẽ (AC-17.2 đòi "không phải tải lại trang"), còn việc ghi
 * một hàng khoá-giá trị thì người dùng không cần đứng chờ. Ghi hỏng thì rơi
 * vào `loiLuuTru` — chỗ duy nhất báo lỗi lưu trữ của ứng dụng (AC-4.7) —
 * chứ không nuốt im lặng: người dùng có quyền biết lựa chọn của mình sẽ
 * không còn ở lần mở sau.
 */
export function useTuyChonHienThi(): TuyChonHienThi {
  const ngonNgu = useAppStore((s) => s.ngonNgu)
  const cheDo = useAppStore((s) => s.cheDo)
  const datNgonNguTrongStore = useAppStore((s) => s.datNgonNguTrongStore)
  const datCheDoTrongStore = useAppStore((s) => s.datCheDoTrongStore)
  const datLoiLuuTru = useAppStore((s) => s.datLoiLuuTru)

  useEffect(() => {
    void tuyChonRepo.docNgonNgu().then(datNgonNguTrongStore)
    void tuyChonRepo.docCheDo().then(datCheDoTrongStore)
  }, [datNgonNguTrongStore, datCheDoTrongStore])

  const doiNgonNgu = useCallback(
    (moi: NgonNgu) => {
      datNgonNguTrongStore(moi)
      void tuyChonRepo.datNgonNgu(moi).catch((loi: unknown) => {
        datLoiLuuTru(chuanHoaLoiLuuTru(loi))
      })
    },
    [datNgonNguTrongStore, datLoiLuuTru],
  )

  const doiCheDo = useCallback(
    (moi: CheDo) => {
      datCheDoTrongStore(moi)
      void tuyChonRepo.datCheDo(moi).catch((loi: unknown) => {
        datLoiLuuTru(chuanHoaLoiLuuTru(loi))
      })
    },
    [datCheDoTrongStore, datLoiLuuTru],
  )

  return { ngonNgu, cheDo, doiNgonNgu, doiCheDo }
}
