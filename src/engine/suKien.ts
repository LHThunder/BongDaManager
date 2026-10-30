import type { VungSan } from './vung'

/*
  Sự kiện trận đấu, và bước chọn mật độ 60–100 dòng (AC-8.15, quyết định D27).

  Engine KHÔNG dựng câu tiếng Việt (quyết định D22): nó phát ra sự kiện có cấu
  trúc kèm `mauCau` — chỉ số mẫu câu do chính `Rng` của trận chọn. Giao diện
  tra bảng mẫu câu. Nhờ vậy phát lại cùng mã trận ra đúng từng chữ, chứ không
  phải mỗi lần xem lại ra một câu khác (AC-8.11).
*/

export type LoaiSuKien =
  | 'bat-dau'
  | 'ban-thang'
  | 'co-hoi'
  | 'cuu-thua'
  | 'tat-canh'
  | 'cuop-bong-cao'
  | 'thoat-xuong'
  | 'mat-bong'
  /*
    Chuỗi kết thúc bằng phạm lỗi từng KHÔNG có loại riêng nên nó mượn
    `mat-bong`, và bị kể thành "để mất bóng trong chân" về một cầu thủ mà
    bảng thống kê ghi `matBong` bằng 0 — engine chỉ ghi `matBong` cho kết cục
    `mat-bong` (T135).

    Kết cục `bong-ra-ngoai` CỐ TÌNH không có loại riêng: `diemCuaChuoi` cho nó
    1 điểm, dưới `NGUONG_DANG_KE`, nên nó không bao giờ lọt vào dòng tường
    thuật. Thêm loại cho nó là thêm code chết — xem T136.
  */
  | 'pham-loi'
  | 'the-vang'
  | 'the-do'
  | 'thay-nguoi'
  | 'kiet-suc'
  | 'het-hiep'
  | 'ket-thuc'

export type BenDoi = 'nha' | 'khach'

export interface TiSo {
  readonly nha: number
  readonly khach: number
}

export interface SuKien {
  readonly phut: number
  /** true khi sự kiện xảy ra trong phút bù giờ. */
  readonly buGio: boolean
  readonly loai: LoaiSuKien
  readonly doi: BenDoi
  /** Người liên quan, theo thứ tự vai trò trong tình huống. */
  readonly cacCauThu: readonly string[]
  readonly vung: VungSan | null
  /**
   * Đường bóng đi qua trong tình huống, theo thứ tự (quyết định D40).
   *
   * Sân 2D của AC-10.2 phải "thể hiện đường đi của bóng", mà chỉ có `vung`
   * thì vẽ được một điểm chứ không vẽ được đường. Lấy từ các bước của chính
   * chuỗi bóng nên không tốn thêm lần rút nào — chạy lại cùng mã trận vẫn ra
   * đúng từng phần tử. Rỗng với các sự kiện mốc.
   */
  readonly duongBong: readonly VungSan[]
  /** Chỉ số mẫu câu, engine chọn bằng Rng của trận (D22). */
  readonly mauCau: number
  readonly tiSoSauDo: TiSo
}

/** Sự kiện kèm điểm đáng kể, trước khi đi qua bước chọn mật độ. */
export interface UngVienSuKien {
  readonly suKien: SuKien
  /** Càng cao càng đáng đưa vào dòng tường thuật. */
  readonly diemDangKe: number
}

export const SO_DONG_TOI_THIEU = 60
export const SO_DONG_TOI_DA = 100

/*
  Những loại KHÔNG BAO GIỜ bị cắt. Một dòng tường thuật thiếu bàn thắng thì
  vô dụng, nên khi cần chọn giữa "đúng trần 100 dòng" và "giữ đủ bàn thắng",
  ta giữ bàn thắng.
*/
export const LOAI_BAT_BUOC: ReadonlySet<LoaiSuKien> = new Set<LoaiSuKien>([
  'bat-dau',
  'ban-thang',
  'the-vang',
  'the-do',
  'thay-nguoi',
  'het-hiep',
  'ket-thuc',
])

/**
 * Chọn những tình huống đáng đưa vào dòng tường thuật (AC-8.15).
 *
 * Bước này CHỈ chặn trần. Sàn 60 dòng là việc engine phải sinh đủ tình huống
 * đáng kể — ở đây không bịa thêm dòng nào, vì bịa ra thì chính thứ AC-8.15
 * muốn ("chỉ ghi những tình huống có ý nghĩa") là thứ bị mất đầu tiên.
 *
 * Tất định hoàn toàn: thứ tự chọn dựa trên điểm, rồi phút, rồi vị trí ban đầu
 * trong danh sách — không có chỗ nào cho thứ tự duyệt của `Map` hay `Set` lọt
 * vào (rủi ro R13).
 */
export function chonSuKien(
  cacUngVien: readonly UngVienSuKien[],
): readonly SuKien[] {
  const batBuoc: number[] = []
  const tuyChon: number[] = []

  cacUngVien.forEach((uv, i) => {
    if (LOAI_BAT_BUOC.has(uv.suKien.loai)) {
      batBuoc.push(i)
    } else {
      tuyChon.push(i)
    }
  })

  const conTrong = SO_DONG_TOI_DA - batBuoc.length

  const themVao =
    conTrong <= 0
      ? []
      : [...tuyChon]
          .sort((a, b) => {
            const uvA = cacUngVien[a]
            const uvB = cacUngVien[b]
            if (uvB.diemDangKe !== uvA.diemDangKe) {
              return uvB.diemDangKe - uvA.diemDangKe
            }
            if (uvA.suKien.phut !== uvB.suKien.phut) {
              return uvA.suKien.phut - uvB.suKien.phut
            }
            return a - b
          })
          .slice(0, conTrong)

  // Trả về theo đúng thứ tự thời gian của trận.
  return [...batBuoc, ...themVao]
    .sort((a, b) => a - b)
    .map((i) => cacUngVien[i].suKien)
}
