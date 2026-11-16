import { useChuoi } from '../../hooks/useNgonNgu'
import type { SuKien } from '../../engine/suKien'

import { useAppStore } from '../../store/appStore'
import { dungCauTuongThuat } from '../tuongThuat'

interface Props {
  readonly cacSuKien: readonly SuKien[]
  readonly tenCauThu: (playerId: string) => string
  readonly tenDoi: (ben: SuKien['doi']) => string
}

/*
  Nhãn chữ cho những sự kiện cần nhận ra ngay, không chỉ bằng màu (P9).

  Ở tầng module chỉ giữ được KHOÁ: nhãn phụ thuộc ngôn ngữ đang chọn nên
  phải tra lúc vẽ, trong thân component (P8).
*/
const KHOA_NHAN: Partial<
  Record<SuKien['loai'], 'nhanTheVang' | 'nhanTheDo' | 'nhanKietSuc'>
> = {
  'the-vang': 'nhanTheVang',
  'the-do': 'nhanTheDo',
  'kiet-suc': 'nhanKietSuc',
}

const MAU_NHAN: Partial<Record<SuKien['loai'], string>> = {
  'ban-thang': 'bg-emerald-100 text-emerald-900',
  'the-vang': 'bg-amber-100 text-amber-900',
  'the-do': 'bg-red-100 text-red-900',
  'kiet-suc': 'bg-slate-200 text-slate-800',
}

/**
 * Dòng tường thuật chạy theo phút (AC-9.1).
 *
 * Nằm trong vùng `aria-live` để trình đọc màn hình cũng theo được trận đấu —
 * bài học từ Giai đoạn 2, khi phần đọc màn hình của @dnd-kit còn bằng tiếng
 * Anh mà chỉ chạy thử mới lộ ra.
 */
export function DongTuongThuat({ cacSuKien, tenCauThu, tenDoi }: Props) {
  const { TRAN_DAU } = useChuoi()
  const nhanLoai = (loai: SuKien['loai']): string | undefined => {
    const khoa = KHOA_NHAN[loai]
    return khoa === undefined ? undefined : TRAN_DAU[khoa]
  }
  /*
    Đọc ngôn ngữ từ store chứ không nhận qua prop: dòng tường thuật được
    dựng LẠI mỗi lần vẽ, nên đổi ngôn ngữ giữa trận là mọi dòng đã hiện
    được kể lại bằng thứ tiếng mới (AC-17.5).
  */
  const ngonNgu = useAppStore((s) => s.ngonNgu)
  return (
    <section>
      <h3 className="text-lg font-semibold text-slate-900">
        {TRAN_DAU.tieuDeDienBien}
      </h3>

      <ol
        aria-live="polite"
        aria-label={TRAN_DAU.tieuDeDienBien}
        className="mt-2 max-h-[28rem] space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3"
      >
        {cacSuKien.length === 0 && (
          <li className="text-sm text-slate-500">{TRAN_DAU.chuaBatDau}</li>
        )}

        {cacSuKien.map((sk, i) => (
          <li
            key={`${sk.phut}-${sk.loai}-${i}`}
            className="flex gap-2 text-sm leading-relaxed"
          >
            <span className="w-10 shrink-0 font-mono text-xs text-slate-500">
              {TRAN_DAU.phut(sk.phut, sk.buGio)}
            </span>
            <span className="flex-1 text-slate-800">
              {nhanLoai(sk.loai) && (
                <span
                  className={`mr-1 rounded px-1 text-xs font-medium ${
                    MAU_NHAN[sk.loai] ?? 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {nhanLoai(sk.loai)}
                </span>
              )}
              {dungCauTuongThuat(sk, tenCauThu, tenDoi, ngonNgu)}
            </span>
            {sk.loai === 'ban-thang' && (
              <span className="shrink-0 font-mono text-xs font-semibold text-emerald-800">
                {sk.tiSoSauDo.nha}-{sk.tiSoSauDo.khach}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
