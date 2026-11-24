import type { KetCucPhaV6 } from '../tran'
import { laMocThuong, MOC_MOI_CHUOI } from './moc'
import { dauHieuCuaPha, laTinhHuongQuanTrong } from './tinhHuong'

/*
  ====================================================================
  CỬA SỔ MỐC DÀY Ở TÌNH HUỐNG QUAN TRỌNG (T731, AC-37.4 + AC-37.7).
  ====================================================================

  Phần thường phát **1 giây một mốc** (bước chẵn). Ở tình huống quan trọng,
  **cả cửa sổ chuỗi** phát thêm bước lẻ, thành **0,5 giây một mốc** — gấp đôi.

  ⚠️ **Làm dày là một quyết định CHỈ Ở ĐẦU RA, và đó là cả lý do nó an toàn.**
  Lưới tích phân vẫn là 0,5 giây **luôn luôn** (`BUOC_MOI_PHUT = 120`), nên làm
  dày **không dịch một hạt giống nào**: `AC-37.5` ("mỗi mốc tái lập được một
  mình") và `taiLap.test.ts` giữ nguyên từng con số. Nếu lưới tích phân đổi theo
  độ dày thì mọi mốc sau một tình huống quan trọng sẽ lệch, và hai chế độ thôi
  so được với nhau.

  ⚠️ **Cửa sổ là CẢ pha bóng, không phải một khoảng `[t−6; t]` quanh sự kiện.**
  Hai cái neo của AC-37.4 vì thế là hai đầu của **cửa sổ chuỗi**: nó bắt đầu ở
  mốc mở đầu cửa sổ và kết thúc ở mốc `bongChet` của chính pha ấy. Lý do neo
  theo cửa sổ thay vì theo một khoảng tương đối: một phát biểu kiểu "cửa sổ chứa
  `[t−6; t]`" **không thoả được** khi `ketCuc` rơi trước giây thứ 6 của pha —
  lúc ấy không có 6 giây nào trước nó để chứa.
*/

/**
 * Số mốc phát ra trong một chuỗi bóng ở cửa sổ **dày**: mỗi bước một mốc.
 *
 * ⚠️ **Định nghĩa từ `MOC_MOI_CHUOI`, KHÔNG từ `BUOC_MOI_CHUOI` của
 * `dienPha.ts`** — dù hai con số ấy bằng nhau. `dienPha.ts` nhập `laMocDuocPhat`
 * từ file này, nên nhập ngược lại là một **vòng nhập**: đã thử, và nó làm hằng
 * số này thành `undefined` lúc nạp module chứ không báo lỗi gì. `mocChuoi.test.ts`
 * giữ đẳng thức `MOC_MOI_CHUOI_DAY === BUOC_MOI_CHUOI` bằng một phép kiểm, tức
 * đúng chỗ phát hiện được khi hai bên trôi khỏi nhau.
 */
export const MOC_MOI_CHUOI_DAY = 2 * MOC_MOI_CHUOI

/**
 * Mốc này có được phát ra không.
 *
 * Đây là **toàn bộ** phép làm dày: ở cửa sổ dày thì mọi bước đều phát, ở phần
 * thường thì chỉ bước chẵn. Không có đường nào khác đổi theo độ dày.
 */
export function laMocDuocPhat(chiSoMoc: number, day: boolean): boolean {
  return day || laMocThuong(chiSoMoc)
}

/**
 * Pha nào của phút này được làm dày.
 *
 * ⚠️ **Thẻ đỏ được quy cho pha PHẠM LỖI của phút ấy, và phép quy ấy là một phép
 * XẤP XỈ có chủ ý.** `quanSatPha` được gọi **trước** `congPhaVaoTran`, tức
 * trước khi thẻ được rút, nên không pha nào tự biết nó có kéo theo thẻ đỏ hay
 * không. Thứ đọc được ở tầng phút là **hiệu số thẻ đỏ** của cả phút.
 *
 * Quy cho **mọi** pha `pham-loi` của phút là phép xấp xỉ **thừa chứ không
 * thiếu**: một phút có hai pha phạm lỗi và một thẻ đỏ sẽ làm dày cả hai cửa sổ.
 * Giá của nó là vài chục mốc; giá của phép xấp xỉ ngược lại — bỏ sót — là mất
 * đúng tình huống mà AC-37.4 sinh ra để giữ.
 */
export function cacPhaDay(
  cacPha: readonly KetCucPhaV6[],
  coTheDoTrongPhut: boolean,
): readonly boolean[] {
  return cacPha.map((pha) =>
    laTinhHuongQuanTrong(
      dauHieuCuaPha(pha, coTheDoTrongPhut && pha.kq.ketCuc === 'pham-loi'),
    ),
  )
}

/**
 * Số mốc một phút phát ra, theo số pha được làm dày.
 *
 * Dùng để nói rằng lô mốc **đủ chỗ**: ba pha dày cả ba thì vừa đúng sức chứa.
 */
export function soMocCuaPhut(soPhaDay: number, soPha: number): number {
  return (soPha - soPhaDay) * MOC_MOI_CHUOI + soPhaDay * MOC_MOI_CHUOI_DAY
}
