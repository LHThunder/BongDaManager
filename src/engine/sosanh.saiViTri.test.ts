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
*/
const SO_MA = 40

function maDo(i: number): string {
  return `S${String(i).padStart(4, '0')}XQ4B`
}

/** Ô số 10 của sơ đồ 4-4-2 là tiền đạo. */
const SO_AO = 10
const ID = `A-${SO_AO}`

function dongGopKhiSoTruong(viTri: PositionId): number {
  let tong = 0
  for (let i = 0; i < SO_MA; i += 1) {
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
  return tong / SO_MA
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
    const dung = dongGopKhiSoTruong('ST')
    const nang = dongGopKhiSoTruong('DC')
    expect(nang).toBeLessThan(dung * 0.85)
  })
})
