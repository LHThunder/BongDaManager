import { describe, expect, it } from 'vitest'
import type { KetCucChuoi } from '../chuoiBong'
import {
  boCucPha,
  BUOC_BONG_CHET,
  BUOC_KET_CUC,
  BUOC_MOI_CHUOI,
  phaConCuaBuoc,
  type TenPhaCon,
  TOI_THIEU_HANH_DONG,
} from './dienPha'
import { BUOC_MOI_PHUT, MOC_MOI_CHUOI } from './moc'
import { SO_CHUOI_MOI_PHUT } from '../tran'

/*
  Lấp 20 giây một pha bóng (T706, D126, AC-37.4 + AC-37.7).

  Phép kiểm xương sống là cái đầu: bốn pha con LUÔN cộng đúng 40 bước, với mọi
  kết cục và mọi số hành động. Nếu nó sai thì tổng thời lượng một phút không
  còn khớp 60 giây, và cả lưới mốc mất nghĩa.

  Phép kiểm đáng nói thứ hai là cái chứng minh PHÉP CẮT CÓ HIỆU LỰC. Bảng bóng
  chết của plan không vừa cửa sổ 20 giây ở hai trong bốn kết cục; nếu phép cắt
  im lặng thì `pham-loi` sẽ chiếm trọn cửa sổ và hành động còn 0 giây.
*/

const BON_KET_CUC: readonly KetCucChuoi[] = [
  'mat-bong',
  'bong-ra-ngoai',
  'pham-loi',
  'dut-diem',
]

/*
  Tần suất bốn kết cục, đo trên 20.000 chuỗi.

  Lệnh dựng lại được: chạy `quyetKetCucChuoi(ben.nha, ben.khach, true, 11, rng)`
  với `rng = taoRngTuHatGiong(706)`, hai bên lấy từ `taoTran(cauHinhMau(ma))`,
  rồi đếm `pha.kq.ketCuc`. Số hành động trung bình một chuỗi: **1,928**; số
  chuỗi một trận: **289,2**.
*/
const TAN_SUAT: Readonly<Record<KetCucChuoi, number>> = {
  'mat-bong': 0.6285,
  'bong-ra-ngoai': 0.174,
  'pham-loi': 0.1429,
  'dut-diem': 0.0546,
}

describe('bốn pha con LUÔN cộng đúng một cửa sổ', () => {
  it('với mọi kết cục và mọi số hành động từ 0 tới 12', () => {
    for (const ketCuc of BON_KET_CUC) {
      for (let n = 0; n <= 12; n += 1) {
        const b = boCucPha(ketCuc, n)
        expect(
          b.lenBong + b.chuoi + b.ketCuc + b.bongChet,
          `${ketCuc} / ${n} hành động`,
        ).toBe(BUOC_MOI_CHUOI)
        expect(b.lenBong, `${ketCuc} / ${n}`).toBeGreaterThanOrEqual(0)
        expect(b.chuoi, `${ketCuc} / ${n}`).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('nên tổng thời lượng MỘT PHÚT khớp đúng 60 giây', () => {
    // Ba chuỗi một phút, mỗi chuỗi một cửa sổ, mỗi bước nửa giây.
    expect(BUOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT).toBe(BUOC_MOI_PHUT)
    expect((BUOC_MOI_CHUOI * SO_CHUOI_MOI_PHUT) / 2).toBe(60)
  })

  it('và một cửa sổ phát đúng MOC_MOI_CHUOI mốc thường', () => {
    expect(BUOC_MOI_CHUOI / 2).toBe(MOC_MOI_CHUOI)
  })

  it('hành động không bao giờ còn 0 giây', () => {
    for (const ketCuc of BON_KET_CUC) {
      for (let n = 0; n <= 12; n += 1) {
        const b = boCucPha(ketCuc, n)
        expect(
          b.lenBong + b.chuoi + b.ketCuc,
          `${ketCuc} / ${n}`,
        ).toBeGreaterThanOrEqual(TOI_THIEU_HANH_DONG)
      }
    }
  })

  it('lenBong hấp thụ phần dư, và nó không quá 8 giây', () => {
    for (const ketCuc of BON_KET_CUC) {
      for (let n = 0; n <= 12; n += 1) {
        // 8 giây = 16 bước; `mat-bong` với 0 hành động là ca dư nhiều nhất.
        expect(boCucPha(ketCuc, n).lenBong, `${ketCuc} / ${n}`).toBeLessThanOrEqual(
          BUOC_MOI_CHUOI - BUOC_KET_CUC,
        )
      }
    }
    // Ca dư nhiều nhất: không bóng chết, không hành động.
    expect(boCucPha('mat-bong', 0).lenBong).toBe(BUOC_MOI_CHUOI - BUOC_KET_CUC)
  })
})

describe('phép cắt theo cửa sổ CÓ hiệu lực, và nó bắt đúng hai kết cục', () => {
  it('pham-loi và dut-diem bị cắt; hai kết cục kia thì không', () => {
    for (const ketCuc of BON_KET_CUC) {
      const b = boCucPha(ketCuc, 2)
      const biCat = b.bongChet < b.bongChetMongMuon
      expect(biCat, `${ketCuc} có bị cắt?`).toBe(
        ketCuc === 'pham-loi' || ketCuc === 'dut-diem',
      )
    }
  })

  it('bảng mong muốn đúng là bảng của plan mục 3.1, tính bằng bước', () => {
    expect(BUOC_BONG_CHET['mat-bong'] / 2).toBe(0)
    expect(BUOC_BONG_CHET['bong-ra-ngoai'] / 2).toBe(15)
    expect(BUOC_BONG_CHET['pham-loi'] / 2).toBe(20)
    expect(BUOC_BONG_CHET['dut-diem'] / 2).toBe(30)
  })

  it('hai con số của plan KHÔNG vừa cửa sổ — đây là chỗ nói ra bằng số', () => {
    // `pham-loi` muốn trọn cửa sổ; `dut-diem` muốn vượt nó 10 giây.
    expect(BUOC_BONG_CHET['pham-loi']).toBe(BUOC_MOI_CHUOI)
    expect(BUOC_BONG_CHET['dut-diem']).toBeGreaterThan(BUOC_MOI_CHUOI)

    // Và 19,75% số pha rơi vào hai kết cục ấy — khoảng một phần năm.
    const phanKhongVua = TAN_SUAT['pham-loi'] + TAN_SUAT['dut-diem']
    expect(phanKhongVua).toBeCloseTo(0.1975, 4)
  })

  it('cái giá của phép cắt, bằng số: bóng lăn nhiều hơn plan tưởng', () => {
    const kyVong = (lay: (k: KetCucChuoi) => number) =>
      BON_KET_CUC.reduce((s, k) => s + TAN_SUAT[k] * lay(k), 0)

    // Trước khi cắt: đúng con số ~7,1 giây mà plan mục 3.1 ghi.
    const truoc = kyVong((k) => BUOC_BONG_CHET[k] / 2)
    expect(truoc).toBeCloseTo(7.11, 2)

    // Sau khi cắt, với số hành động trung bình 1,928 → làm tròn 2.
    const sau = kyVong((k) => boCucPha(k, 2).bongChet / 2)
    expect(sau).toBeCloseTo(5.77, 2)
    expect(sau).toBeLessThan(truoc)

    /*
      289,2 chuỗi một trận, trận 95,9 phút. Bóng lăn = 95,9 − (289,2 · kỳ vọng)/60.
      Trước: ~61,6 phút. Sau: ~68,1 phút. Spec 010 muốn 55–60, nên phép cắt đẩy
      con số XA HƠN khỏi đích — một con số để báo, không phải chỗ tự nới.
    */
    const bongLan = (kv: number) => 95.9 - (289.2 * kv) / 60
    expect(bongLan(truoc)).toBeCloseTo(61.6, 1)
    expect(bongLan(sau)).toBeCloseTo(68.1, 1)
  })
})

describe('phaConCuaBuoc phủ kín cửa sổ, không lỗ, đúng thứ tự', () => {
  it('mỗi bước thuộc đúng một pha con, và bốn pha con đi đúng thứ tự', () => {
    for (const ketCuc of BON_KET_CUC) {
      for (const n of [0, 1, 2, 5, 12]) {
        const b = boCucPha(ketCuc, n)
        const thuTu: TenPhaCon[] = ['lenBong', 'chuoi', 'ketCuc', 'bongChet']
        let viTri = 0
        for (let i = 0; i < BUOC_MOI_CHUOI; i += 1) {
          const ten = phaConCuaBuoc(b, i)
          const j = thuTu.indexOf(ten)
          expect(j, `${ketCuc}/${n} bước ${i}`).toBeGreaterThanOrEqual(viTri)
          viTri = j
        }
      }
    }
  })

  it('số bước của từng pha con khớp đúng bố cục', () => {
    for (const ketCuc of BON_KET_CUC) {
      const b = boCucPha(ketCuc, 3)
      const dem: Record<TenPhaCon, number> = {
        lenBong: 0,
        chuoi: 0,
        ketCuc: 0,
        bongChet: 0,
      }
      for (let i = 0; i < BUOC_MOI_CHUOI; i += 1) dem[phaConCuaBuoc(b, i)] += 1
      expect(dem.lenBong, ketCuc).toBe(b.lenBong)
      expect(dem.chuoi, ketCuc).toBe(b.chuoi)
      expect(dem.ketCuc, ketCuc).toBe(b.ketCuc)
      expect(dem.bongChet, ketCuc).toBe(b.bongChet)
    }
  })

  it('mat-bong không có bóng chết — bóng đổi chân, không ngắt nhịp', () => {
    const b = boCucPha('mat-bong', 2)
    expect(b.bongChet).toBe(0)
    for (let i = 0; i < BUOC_MOI_CHUOI; i += 1) {
      expect(phaConCuaBuoc(b, i)).not.toBe('bongChet')
    }
  })
})
