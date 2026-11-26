import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import type { KetCucPhaV6 } from '../tran'
import { boCucPha, BUOC_MOI_CHUOI, phaConCuaBuoc } from './dienPha'
import { docMoc } from './loMoc'
import {
  cacPhaDay,
  laMocDuocPhat,
  MOC_MOI_CHUOI_DAY,
  soMocCuaPhut,
} from './mocChuoi'
import { BUOC_MOI_PHUT, laMocThuong, MOC_MOI_CHUOI, MOC_MOI_PHUT } from './moc'
import { buocPhutLienTuc, taoTranLienTuc } from './tranLienTuc'

/*
  Cửa sổ mốc dày ở tình huống quan trọng (T731, AC-37.4 + AC-37.5 + AC-37.7).
*/

/** Một kết cục pha đủ dùng cho phép thử — chỉ bốn trường mà `cacPhaDay` đọc. */
function phaThu(
  ketCuc: KetCucPhaV6['kq']['ketCuc'],
  dau: Partial<Pick<KetCucPhaV6, 'coBan' | 'coHoiRoRang' | 'biCuu'>> = {},
): KetCucPhaV6 {
  return {
    kq: { ketCuc },
    coBan: dau.coBan ?? false,
    coHoiRoRang: dau.coHoiRoRang ?? false,
    biCuu: dau.biCuu ?? false,
  } as unknown as KetCucPhaV6
}

describe('laMocDuocPhat — phần thường thưa, cửa sổ dày đủ (T731)', () => {
  it('phần thường chỉ phát bước CHẴN, cửa sổ dày phát MỌI bước', () => {
    let soChan = 0
    for (let m = 0; m < 40; m += 1) {
      expect(laMocDuocPhat(m, false), `thường ${m}`).toBe(laMocThuong(m))
      expect(laMocDuocPhat(m, true), `dày ${m}`).toBe(true)
      if (laMocThuong(m)) soChan += 1
    }
    // ⚠️ CHỐNG RỖNG: nếu `laMocThuong` hỏng thành "luôn đúng" thì hai dòng trên
    // vẫn xanh mà phần thường đã **thành dày**.
    expect(soChan, 'số bước chẵn trong 40').toBe(20)
  })

  it('và dày đúng GẤP ĐÔI thưa, không hơn', () => {
    expect(MOC_MOI_CHUOI_DAY).toBe(2 * MOC_MOI_CHUOI)
    expect(MOC_MOI_CHUOI_DAY).toBe(BUOC_MOI_CHUOI)
  })

  /*
    Lô mốc đủ chỗ cho ca xấu nhất: **cả ba** pha của một phút đều dày. Đây là
    đẳng thức, không phải một khoảng dư — `taoLoMoc(BUOC_MOI_PHUT)` vừa khít.
  */
  it('ba pha dày cả ba thì vừa ĐÚNG sức chứa của lô', () => {
    const soPha = MOC_MOI_PHUT / MOC_MOI_CHUOI
    expect(soMocCuaPhut(0, soPha)).toBe(MOC_MOI_PHUT)
    expect(soMocCuaPhut(soPha, soPha)).toBe(BUOC_MOI_PHUT)
    expect(soMocCuaPhut(1, soPha)).toBe(MOC_MOI_PHUT + MOC_MOI_CHUOI)
  })
})

describe('cacPhaDay — pha nào được làm dày (T731, AC-37.8)', () => {
  it('bàn thắng, cơ hội rõ ràng và cứu thua đều làm dày', () => {
    const cac = [
      phaThu('dut-diem', { coBan: true }),
      phaThu('dut-diem', { coHoiRoRang: true }),
      phaThu('dut-diem', { biCuu: true }),
      phaThu('mat-bong'),
    ]
    expect(cacPhaDay(cac, false)).toEqual([true, true, true, false])
  })

  /*
    Thẻ đỏ quy cho pha **phạm lỗi** của phút ấy — phép xấp xỉ **thừa chứ không
    thiếu**, vì `quanSatPha` chạy trước khi thẻ được rút nên không pha nào tự
    biết. Phép kiểm canh cả hai nửa: có thẻ thì pha phạm lỗi dày, và thẻ **không
    lan** sang pha khác.
  */
  it('thẻ đỏ làm dày pha PHẠM LỖI, và chỉ pha ấy', () => {
    const cac = [phaThu('pham-loi'), phaThu('mat-bong'), phaThu('bong-ra-ngoai')]
    expect(cacPhaDay(cac, true)).toEqual([true, false, false])
    expect(cacPhaDay(cac, false)).toEqual([false, false, false])
  })

  it('phút không có gì xảy ra thì không pha nào dày', () => {
    const cac = [phaThu('mat-bong'), phaThu('bong-ra-ngoai'), phaThu('mat-bong')]
    expect(cacPhaDay(cac, false)).toEqual([false, false, false])
  })

  /*
    ⚠️ **Mọi pha được làm dày đều có `bongChet > 0`, và đó là cái neo thứ hai
    của AC-37.4** ("khung cuối của cửa sổ là mốc `bongChet` của chính pha ấy").

    Nó đúng **theo cấu trúc** chứ không nhờ may: `coBan`, `coHoiRoRang` và
    `biCuu` đều đòi `ketCuc === 'dut-diem'` (xem `tran.ts:1543`), còn thẻ đỏ chỉ
    quy cho `pham-loi`. Cả hai kết cục ấy đều có bảng bóng chết khác 0.
  */
  it('mọi kết cục LÀM DÀY ĐƯỢC đều có bóng chết khác 0', () => {
    for (const ketCuc of ['dut-diem', 'pham-loi'] as const) {
      const boCuc = boCucPha(ketCuc, 2)
      expect(boCuc.bongChet, ketCuc).toBeGreaterThan(0)
      // Và bước cuối của cửa sổ nằm trong pha con `bongChet`.
      expect(phaConCuaBuoc(boCuc, BUOC_MOI_CHUOI - 1), ketCuc).toBe('bongChet')
    }
  })
})

describe('cửa sổ dày trên một TRẬN THẬT (T731, AC-37.4)', () => {
  it('10 mã: trong cửa sổ dày Δt = 0,5 giây, ở phần thường Δt = 1 — và không lỗ', () => {
    let soMocDay = 0
    let soMocThuong = 0
    let soPhutCoDay = 0
    let soPhut = 0

    for (const ma of MA_TRAN_CO_DINH) {
      let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      for (let p = 0; p < 95 && !lt.tran.ketThuc; p += 1) {
        const phut = buocPhutLienTuc(lt)
        soPhut += 1

        const cac: number[] = []
        for (let i = 0; i < phut.lo.soMocDaGhi; i += 1) {
          cac.push(docMoc(phut.lo, i).chiSoMoc)
        }

        // Không trùng, và luôn tiến — không bao giờ lùi (AC-45.10 cũng đứng đây).
        expect(new Set(cac).size, `${ma} phút ${p}`).toBe(cac.length)
        for (let i = 1; i < cac.length; i += 1) {
          const buoc = cac[i]! - cac[i - 1]!
          /*
            Chỉ hai khoảng được phép: **1 bước** (0,5 giây, trong cửa sổ dày) và
            **2 bước** (1 giây, phần thường). Một khoảng 3 trở lên là một **lỗ**.
          */
          expect([1, 2], `${ma} phút ${p}, mốc ${i}`).toContain(buoc)
          if (buoc === 1) soMocDay += 1
          else soMocThuong += 1
        }

        if (phut.lo.soMocDaGhi > MOC_MOI_PHUT) soPhutCoDay += 1
        // Lô không bao giờ tràn, kể cả khi cả ba pha đều dày.
        expect(phut.lo.soMocDaGhi, `${ma} phút ${p}`).toBeLessThanOrEqual(
          BUOC_MOI_PHUT,
        )
        expect(phut.lo.soMocDaGhi, `${ma} phút ${p}`).toBeGreaterThanOrEqual(
          MOC_MOI_PHUT,
        )
        lt = phut.tt
      }
    }

    /*
      ⚠️ CHỐNG RỖNG, và đây là mệnh đề quan trọng nhất của cả khối: cửa sổ dày
      phải **thật sự xảy ra** trên trận thật. Thiếu nó thì một `cacPhaDay` trả
      toàn `false` vẫn xanh mọi dòng ở trên.
    */
    expect(soPhut, 'số phút đã đo').toBeGreaterThan(800)
    expect(soPhutCoDay, 'số phút có cửa sổ dày').toBeGreaterThan(50)
    expect(soMocDay, 'số cặp mốc cách nhau 0,5 giây').toBeGreaterThan(1_000)
    expect(soMocThuong, 'số cặp mốc cách nhau 1 giây').toBeGreaterThan(10_000)
  })

  /*
    ⚠️ **Làm dày là quyết định CHỈ Ở ĐẦU RA.** Hai trận cùng mã phải ra cùng
    tỉ số và cùng dòng tường thuật dù cửa sổ nào được làm dày — `taiLap.test.ts`
    canh điều ấy ở mức cả trận, còn đây canh nó ở mức **hạt giống từng phút**.
  */
  it('và nó KHÔNG dịch một hạt giống nào', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 3)) {
      let a = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      let b = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
      for (let p = 0; p < 20; p += 1) {
        a = buocPhutLienTuc(a).tt
        b = buocPhutLienTuc(b).tt
        expect(a.tran.hatGiong, `${ma} phút ${p}`).toBe(b.tran.hatGiong)
        expect(a.tran.tiSo, `${ma} phút ${p}`).toEqual(b.tran.tiSo)
      }
    }
  })
})
