import { BieuTuong, type TenBieuTuong } from './BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import type { SuKien } from '../../engine/suKien'

import { useAppStore } from '../../store/appStore'
import { dungCauTuongThuat } from '../tuongThuat'

/**
 * Lối chọn một phút từ dòng tường thuật (US-27, T432).
 *
 * Gom thành MỘT prop tuỳ chọn, và chữ đi vào từ ngoài: trang gọi quyết định
 * nút ấy tên gì và phút nào chọn được, còn component này chỉ vẽ. Vắng prop
 * thì dòng tường thuật hiện đúng như cũ — trang trận đang chạy không mọc
 * thêm nút nào.
 */
export interface LoiChonPhut {
  /** Chữ trên nút. */
  readonly nhan: string
  /** Nhãn cho trình đọc màn hình, nói rõ nút này thuộc dòng nào (P9). */
  readonly nhanCuaDong: (phutHienThi: string) => string
  readonly chonDuoc: (suKien: SuKien) => boolean
  readonly onChon: (suKien: SuKien) => void
}

interface Props {
  readonly cacSuKien: readonly SuKien[]
  readonly tenCauThu: (playerId: string) => string
  readonly tenDoi: (ben: SuKien['doi']) => string
  readonly chonPhut?: LoiChonPhut
  /**
   * Dòng mở đầu phần rẽ nhánh, chèn ngay trước sự kiện đầu tiên thoả nó
   * (AC-27.2): người đọc phải thấy ranh giới "tới đây giống trận gốc".
   */
  readonly mocRe?: {
    readonly nhan: string
    readonly batDauTu: (suKien: SuKien) => boolean
  }
}

/*
  Nhãn chữ cho những sự kiện cần nhận ra ngay, không chỉ bằng màu (P9).

  Ở tầng module chỉ giữ được KHOÁ: nhãn phụ thuộc ngôn ngữ đang chọn nên
  phải tra lúc vẽ, trong thân component (P8).
*/
/*
  Biểu tượng đi kèm nhãn CHỮ của dòng tường thuật.

  Chỉ hai loại có mặt ở đây, và đó là tất cả những gì hiện được: chip này
  chỉ vẽ khi sự kiện có nhãn chữ, mà bảng nhãn (`KHOA_NHAN` ngay dưới) chỉ
  có thẻ vàng, thẻ đỏ và kiệt sức. Thêm 'ban-thang' hay 'thay-nguoi' vào
  đây là thêm cấu hình chết — chúng không có nhãn chữ nên chip không bao
  giờ vẽ.

  `kiet-suc` thì CÓ nhãn chữ, nhưng bộ Tabler không có biểu tượng nào đúng
  nghĩa, nên nó chỉ có chữ: spec chốt rõ là thiếu thì dùng chữ, KHÔNG trộn
  biểu tượng từ bộ khác (AC-21.2).
*/
const BIEU_TUONG_NHAN: Partial<Record<SuKien['loai'], TenBieuTuong>> = {
  'the-vang': 'the',
  'the-do': 'the',
}

const KHOA_NHAN: Partial<
  Record<SuKien['loai'], 'nhanTheVang' | 'nhanTheDo' | 'nhanKietSuc'>
> = {
  'the-vang': 'nhanTheVang',
  'the-do': 'nhanTheDo',
  'kiet-suc': 'nhanKietSuc',
}

const MAU_NHAN: Partial<Record<SuKien['loai'], string>> = {
  'ban-thang': 'bg-tot-nen text-tot-chu',
  'the-vang': 'bg-canh-bao-nen text-canh-bao-chu',
  'the-do': 'bg-loi-nen text-loi-chu',
  'kiet-suc': 'bg-nen-nhan text-chu',
}

/**
 * Dòng tường thuật chạy theo phút (AC-9.1).
 *
 * Nằm trong vùng `aria-live` để trình đọc màn hình cũng theo được trận đấu —
 * bài học từ Giai đoạn 2, khi phần đọc màn hình của @dnd-kit còn bằng tiếng
 * Anh mà chỉ chạy thử mới lộ ra.
 */
export function DongTuongThuat({
  cacSuKien,
  tenCauThu,
  tenDoi,
  chonPhut,
  mocRe,
}: Props) {
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
      <h3 className="text-lg font-semibold text-chu">
        {TRAN_DAU.tieuDeDienBien}
      </h3>

      <ol
        aria-live="polite"
        aria-label={TRAN_DAU.tieuDeDienBien}
        className="mt-2 max-h-[28rem] space-y-1 overflow-y-auto rounded-lg border border-vien bg-nen-the p-3"
      >
        {cacSuKien.length === 0 && (
          <li className="text-sm text-chu-phu">{TRAN_DAU.chuaBatDau}</li>
        )}

        {cacSuKien.map((sk, i) => (
          <li
            key={`${sk.phut}-${sk.loai}-${i}`}
            className="flex gap-2 text-sm leading-relaxed"
          >
            {mocRe && mocRe.batDauTu(sk) && (
              <span className="mb-1 mt-2 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wide text-chu-phu">
                <span className="h-px flex-1 bg-vien-dam" />
                {mocRe.nhan}
                <span className="h-px flex-1 bg-vien-dam" />
              </span>
            )}
            <span className="w-10 shrink-0 font-mono text-xs text-chu-phu">
              {TRAN_DAU.phut(sk.phut, sk.buGio)}
            </span>
            <span className="flex-1 text-chu">
              {nhanLoai(sk.loai) && (
                <span
                  className={`mr-1 inline-flex items-center gap-1 rounded px-1 text-xs font-medium ${
                    MAU_NHAN[sk.loai] ?? 'bg-nen-nhan text-chu'
                  }`}
                >
                  {BIEU_TUONG_NHAN[sk.loai] !== undefined && (
                    <BieuTuong ten={BIEU_TUONG_NHAN[sk.loai]!} co="nho" />
                  )}
                  {nhanLoai(sk.loai)}
                </span>
              )}
              {dungCauTuongThuat(sk, tenCauThu, tenDoi, ngonNgu)}
            </span>
            {sk.loai === 'ban-thang' && (
              <span className="shrink-0 font-mono text-xs font-semibold text-tot-chu">
                {sk.tiSoSauDo.nha}-{sk.tiSoSauDo.khach}
              </span>
            )}
            {chonPhut && chonPhut.chonDuoc(sk) && (
              <button
                type="button"
                onClick={() => chonPhut.onChon(sk)}
                aria-label={chonPhut.nhanCuaDong(
                  TRAN_DAU.phut(sk.phut, sk.buGio),
                )}
                className="shrink-0 rounded border border-vien-dam px-1.5 text-xs text-chinh hover:bg-nen-nhan"
              >
                {chonPhut.nhan}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
