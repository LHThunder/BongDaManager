import { describe, expect, it } from 'vitest'
import { CHI_THI_MAC_DINH } from '../domain/instructions'
import { benMau, MA_TRAN_CO_DINH } from './__fixtures__/doiMau'
import { chayHetTran, dongSuKien, taoTran, type CauHinhTran } from './tran'
import { heSoTheLuc, HE_SO_PHAT_KIET_SUC } from './sucManh'
import { NGUONG_KIET_SUC } from './theLuc'

/*
  Kiệt sức (AC-8.7).

  Cầu thủ thể lực trung bình đá pressing trung bình thì HẾT trận vẫn chưa
  kiệt sức — đó là chuyện đúng về bóng đá, không phải thiếu sót. Nên test
  dựng hẳn một đội thể lực kém đá pressing cao để đi vào đúng đường đó.
*/
function cauHinhKietSuc(maTran: string): CauHinhTran {
  const yeu = {
    chiSo: 3,
    chiThi: { ...CHI_THI_MAC_DINH, 'cuong-do-pressing': 'cao' as const },
  }
  return {
    maTran,
    nha: benMau('A', yeu),
    khach: benMau('B', yeu),
    sanTrungLap: true,
  }
}

describe('phạt hiệu suất khi kiệt sức (AC-8.7)', () => {
  it('qua ngưỡng kiệt sức thì sức mạnh bị nhân hệ số phạt', () => {
    const vuaDu = heSoTheLuc(NGUONG_KIET_SUC)
    const vuaThieu = heSoTheLuc(NGUONG_KIET_SUC - 0.5)
    expect(vuaThieu).toBeLessThan(vuaDu * HE_SO_PHAT_KIET_SUC + 0.001)
  })
})

describe('báo kiệt sức cho người dùng (AC-8.7)', () => {
  it('đội thể lực kém đá pressing cao thì có cầu thủ kiệt sức', () => {
    const tt = chayHetTran(taoTran(cauHinhKietSuc(MA_TRAN_CO_DINH[0])))
    const soDong = dongSuKien(tt).filter((s) => s.loai === 'kiet-suc')
    expect(soDong.length).toBeGreaterThan(0)
  })

  it('mỗi cầu thủ chỉ được báo kiệt sức ĐÚNG MỘT LẦN mỗi trận', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const tt = chayHetTran(taoTran(cauHinhKietSuc(ma)))
      const daBao = dongSuKien(tt)
        .filter((s) => s.loai === 'kiet-suc')
        .flatMap((s) => s.cacCauThu)

      // Nếu phát lại mỗi phút thì một mình nó ăn hết dải 60..100 dòng
      // của AC-8.15.
      expect(new Set(daBao).size, ma).toBe(daBao.length)
    }
  })

  it('người được báo kiệt sức thật sự ở dưới ngưỡng lúc hết trận', () => {
    const tt = chayHetTran(taoTran(cauHinhKietSuc(MA_TRAN_CO_DINH[1])))
    for (const ben of [tt.ben.nha, tt.ben.khach]) {
      for (const id of ben.daBaoKietSuc) {
        expect(ben.theLuc[id], id).toBeLessThan(NGUONG_KIET_SUC)
      }
    }
  })

  it('đội sung sức đá pressing thấp thì không ai bị báo kiệt sức', () => {
    const khoe = {
      chiSo: 19,
      chiThi: { ...CHI_THI_MAC_DINH, 'cuong-do-pressing': 'thap' as const },
    }
    const tt = chayHetTran(
      taoTran({
        maTran: MA_TRAN_CO_DINH[2],
        nha: benMau('A', khoe),
        khach: benMau('B', khoe),
        sanTrungLap: true,
      }),
    )
    expect(dongSuKien(tt).filter((s) => s.loai === 'kiet-suc')).toEqual([])
  })
})
