import { describe, expect, it } from 'vitest'
import type { PositionId } from '../domain/types'
import { benMau } from './__fixtures__/doiMau'
import { chayHetTran, taoTran } from './tran'

/*
  AC-8.5 — cầu thủ bị xếp sai vị trí phải đóng góp ít hơn so với khi xếp đúng
  sở trường, mọi yếu tố khác giữ nguyên, và mức giảm nặng dần theo ba mức sai
  của AC-5.5.

  Cùng mã trận, chỉ đổi VỊ TRÍ SỞ TRƯỜNG của đúng một cầu thủ — chỉ số, vai
  trò của ô, đối thủ, sân bãi đều y nguyên. Đọc `thongKe.dongGopTheoCauThu`.
*/

/*
  MẪU PHẢI RỘNG. `dongGopTheoCauThu` của MỘT cầu thủ là con số nhiễu: đo trên
  10 mã thì thứ tự bốn mức đảo lộn thuần do may mắn (đo thật: 57.2 / 34.0 /
  38.3 / 37.2 — "nhẹ" thấp hơn "vừa"), còn trên 40 mã thì giảm dần nghiêm
  ngặt (44.5 / 35.2 / 31.9 / 27.9) và trên 100 mã cũng vậy (42.7 / 39.2 /
  35.9 / 25.2).

  Bản đầu của test dùng 10 mã cố định và xanh nhờ may. Ngưỡng "giảm dần
  nghiêm ngặt" KHÔNG đổi — chỉ mẫu rộng ra, nên test mạnh lên chứ không nhẹ đi.

  **T130 làm tín hiệu yếu đi thật, nên mẫu phải rộng thêm.** Từ khi người kết
  thúc tình huống được rút theo VÙNG, ô tiền đạo chỉ còn tranh với vài người ở
  gần thay vì với cả đội, nên phần của anh ta vừa lớn hơn vừa nhiễu hơn. Đo
  lại ngày 2026-10-30, vẫn đúng ngưỡng cũ:

    40 mã:  61.4 / 65.1 / 36.6 / 30.6  ← "nhẹ" VƯỢT "đúng", test đỏ
    120 mã: 54.5 / 52.7 / 39.8 / 32.9  ← đúng thứ tự, nhưng chỉ cách nhau 3,3%
    200 mã: 53.2 / 49.0 / 39.3 / 31.0  ← cách nhau 8%, khoảng cách GIÃN ra

  Chọn 200. Khoảng cách giãn ra khi mẫu rộng thêm là dấu hiệu của tín hiệu
  thật; nếu chỉ là nhiễu thì nó phải co lại.
*/
const SO_MA = 200

/*
  Phép kiểm thứ hai có biên 15% nên không cần mẫu rộng như vậy — tách ra để
  không trả giá 200 mã cho một câu hỏi dễ hơn hẳn.
*/
const SO_MA_BIEN_RONG = 60

function maDo(i: number): string {
  return `S${String(i).padStart(4, '0')}XQ4B`
}

/** Ô số 10 của sơ đồ 4-4-2 là tiền đạo. */
const SO_AO = 10
const ID = `A-${SO_AO}`

function dongGopKhiSoTruong(viTri: PositionId, soMa: number = SO_MA): number {
  let tong = 0
  for (let i = 0; i < soMa; i += 1) {
    const ma = maDo(i)
    const tt = chayHetTran(
      taoTran({
        maTran: ma,
        nha: benMau('A', { ghiDeViTri: { [SO_AO]: [viTri] } }),
        khach: benMau('B'),
        sanTrungLap: true,
      }),
    )
    tong += tt.ben.nha.thongKe.dongGopTheoCauThu[ID] ?? 0
  }
  return tong / soMa
}

describe('xếp sai vị trí làm giảm đóng góp (AC-8.5)', () => {
  it('bốn mức sai cho bốn con số giảm dần nghiêm ngặt', () => {
    // Ô là tiền đạo (ST).
    const dung = dongGopKhiSoTruong('ST')
    const nhe = dongGopKhiSoTruong('AML')
    const vua = dongGopKhiSoTruong('MC')
    const nang = dongGopKhiSoTruong('DC')

    console.log(
      `đóng góp trung bình — đúng: ${dung.toFixed(1)}, nhẹ: ${nhe.toFixed(1)}, vừa: ${vua.toFixed(1)}, nặng: ${nang.toFixed(1)}`,
    )

    expect(dung).toBeGreaterThan(nhe)
    expect(nhe).toBeGreaterThan(vua)
    expect(vua).toBeGreaterThan(nang)
  })

  it('người xếp sai nặng đóng góp ít hơn hẳn, không chỉ nhỉnh hơn nhiễu', () => {
    const dung = dongGopKhiSoTruong('ST', SO_MA_BIEN_RONG)
    const nang = dongGopKhiSoTruong('DC', SO_MA_BIEN_RONG)
    expect(nang).toBeLessThan(dung * 0.85)
  })
})
