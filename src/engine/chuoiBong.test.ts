import { describe, expect, it } from 'vitest'
import {
  chayChuoiBong,
  SO_BUOC_TOI_DA,
  type KetCucChuoi,
} from './chuoiBong'
import { taoRng } from './rng'
import { CAC_VUNG, keNhau, layVung } from './vung'

const KET_CUC_HOP_LE: KetCucChuoi[] = [
  'dut-diem',
  'mat-bong',
  'pham-loi',
  'bong-ra-ngoai',
]

/** Chạy nhiều chuỗi từ nhiều mã trận, để kiểm bất biến chứ không kiểm may rủi. */
function nhieuChuoi(soLan = 400) {
  const rng = taoRng('CHUOI BONG')
  return Array.from({ length: soLan }, (_, i) =>
    chayChuoiBong(CAC_VUNG[i % CAC_VUNG.length], rng),
  )
}

describe('một chuỗi kiểm soát bóng', () => {
  it('luôn kết thúc ở đúng một kết cục trong tập đóng', () => {
    for (const kq of nhieuChuoi()) {
      expect(KET_CUC_HOP_LE).toContain(kq.ketCuc)
    }
  })

  it('không chạy vô hạn — số hành động không vượt chặn cứng', () => {
    for (const kq of nhieuChuoi()) {
      expect(kq.cacHanhDong.length).toBeLessThanOrEqual(SO_BUOC_TOI_DA)
    }
  })

  it('bóng chỉ dịch sang vùng kề, không nhảy cóc qua sân', () => {
    const rng = taoRng('NHAY COC')
    for (let i = 0; i < 300; i += 1) {
      const batDau = CAC_VUNG[i % CAC_VUNG.length]
      const kq = chayChuoiBong(batDau, rng)

      // Mỗi hành động ghi lại vùng xuất phát của nó; dãy vùng đi qua phải
      // là một đường liền, mỗi bước sang vùng kề.
      const duongDi = [...kq.cacHanhDong.map((h) => h.vung), kq.vungKetThuc]
      expect(duongDi[0], `chuỗi ${i}`).toEqual(batDau)
      for (let j = 1; j < duongDi.length; j += 1) {
        const truoc = duongDi[j - 1]
        const sau = duongDi[j]
        if (truoc.id === sau.id) continue
        expect(keNhau(truoc, sau), `${truoc.id} -> ${sau.id}`).toBe(true)
      }
    }
  })

  it('dứt điểm chỉ xảy ra ở vùng dứt điểm', () => {
    for (const kq of nhieuChuoi(600)) {
      if (kq.ketCuc === 'dut-diem') {
        expect(kq.vungKetThuc.dai, kq.vungKetThuc.id).toBe(3)
      }
    }
  })

  it('quả tạt chỉ sinh ra từ hành lang biên', () => {
    for (const kq of nhieuChuoi(600)) {
      for (const hd of kq.cacHanhDong) {
        if (hd.loai === 'tat-canh') {
          expect(hd.vung.cot, hd.vung.id).not.toBe('giua')
        }
      }
    }
  })

  it('qua nhiều lần chạy, cả bốn kết cục đều xuất hiện', () => {
    const daThay = new Set(nhieuChuoi(600).map((kq) => kq.ketCuc))
    for (const kc of KET_CUC_HOP_LE) {
      expect(daThay.has(kc), `chưa bao giờ thấy ${kc}`).toBe(true)
    }
  })
})

describe('tất định (P1)', () => {
  it('cùng nguồn ngẫu nhiên và cùng vùng bắt đầu ra cùng kết quả', () => {
    const a = chayChuoiBong(layVung('giua', 1), taoRng('TAT DINH'))
    const b = chayChuoiBong(layVung('giua', 1), taoRng('TAT DINH'))
    expect(b).toEqual(a)
  })

  it('cả một dãy chuỗi liên tiếp cũng lặp lại y nguyên', () => {
    const chay = () => {
      const rng = taoRng('DAY CHUOI')
      return Array.from({ length: 50 }, (_, i) =>
        chayChuoiBong(CAC_VUNG[i % CAC_VUNG.length], rng),
      )
    }
    expect(chay()).toEqual(chay())
  })

  it('hai mã trận khác nhau cho hai dãy chuỗi khác nhau', () => {
    const chay = (ma: string) => {
      const rng = taoRng(ma)
      return Array.from({ length: 50 }, () =>
        chayChuoiBong(layVung('giua', 1), rng),
      )
    }
    expect(chay('MA B')).not.toEqual(chay('MA A'))
  })
})
