import { describe, expect, it } from 'vitest'
import {
  chayChuoiBong,
  SO_BUOC_TOI_DA,
  type KetCucChuoi,
} from './chuoiBong'
import { HE_SO_TRUNG_TINH } from './chiThi'
import { taoRng } from './rng'
import { CAC_VUNG, keNhau, layVung } from './vung'

/*
  Bối cảnh trung tính: hai đội ngang sức, chỉ thị mặc định. Những bất biến
  dưới đây phải đúng với MỌI bối cảnh, nên dùng bối cảnh đơn giản nhất.
*/
const BOI_CANH_TRUNG_TINH = {
  heSoCong: HE_SO_TRUNG_TINH,
  heSoThu: HE_SO_TRUNG_TINH,
  sucManhCong: 0.5,
  sucManhThu: 0.5,
}

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
    chayChuoiBong(CAC_VUNG[i % CAC_VUNG.length], rng, BOI_CANH_TRUNG_TINH),
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
      const kq = chayChuoiBong(batDau, rng, BOI_CANH_TRUNG_TINH)

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
    const a = chayChuoiBong(layVung('giua', 1), taoRng('TAT DINH'), BOI_CANH_TRUNG_TINH)
    const b = chayChuoiBong(layVung('giua', 1), taoRng('TAT DINH'), BOI_CANH_TRUNG_TINH)
    expect(b).toEqual(a)
  })

  it('cả một dãy chuỗi liên tiếp cũng lặp lại y nguyên', () => {
    const chay = () => {
      const rng = taoRng('DAY CHUOI')
      return Array.from({ length: 50 }, (_, i) =>
        chayChuoiBong(CAC_VUNG[i % CAC_VUNG.length], rng, BOI_CANH_TRUNG_TINH),
      )
    }
    expect(chay()).toEqual(chay())
  })

  it('hai mã trận khác nhau cho hai dãy chuỗi khác nhau', () => {
    const chay = (ma: string) => {
      const rng = taoRng(ma)
      return Array.from({ length: 50 }, () =>
        chayChuoiBong(layVung('giua', 1), rng, BOI_CANH_TRUNG_TINH),
      )
    }
    expect(chay('MA B')).not.toEqual(chay('MA A'))
  })
})


describe('chuyền nhiều hơn rê bóng, và không ai ôm bóng qua cả sân (T625)', () => {
  /*
    **Người dùng xem bản chạy ở T617 và bắt được điều này bằng mắt**, đúng như
    T518 của spec 005 đã từng: *"tần suất chuyền nhiều lên"* và *"một cầu thủ
    không thể rê từ đầu sân đến cuối sân hoặc từ trái sang phải thường xuyên
    được"*.

    Luật cũ gọi **mọi** bước tiến lên là rê bóng, nên rê (58,4%) nhiều hơn chuyền
    (41,6%) — ngược hẳn bóng đá thật — và 28 lần trong 10 trận một người ôm bóng
    qua ba dải. Xem chú thích ở `chuoiBong.ts` cho cả bảng số và cho ba đường đã
    kiểm để chắc rằng đổi nhãn này không đổi một kết quả nào.

    Phép kiểm canh **tính chất**, không canh con số chính xác: tỉ lệ đúng phụ
    thuộc bối cảnh, nhưng "chuyền nhiều hơn rê" thì phải đúng ở mọi bối cảnh.
  */
  function demLoai() {
    const dem = { chuyen: 0, 're-bong': 0, 'tat-canh': 0, sut: 0 }
    const chuoiRe: number[] = []
    for (const kq of nhieuChuoi(600)) {
      let chay = 0
      for (const h of kq.cacHanhDong) {
        dem[h.loai] += 1
        if (h.loai === 're-bong') chay += 1
        else {
          if (chay > 0) chuoiRe.push(chay)
          chay = 0
        }
      }
      if (chay > 0) chuoiRe.push(chay)
    }
    return { dem, chuoiRe }
  }

  it('chuyền nhiều hơn rê bóng', () => {
    const { dem } = demLoai()
    const tong = dem.chuyen + dem['re-bong']
    const tiLeRe = (100 * dem['re-bong']) / tong
    console.log(
      `rê ${dem['re-bong']} (${tiLeRe.toFixed(1)}%) · chuyền ${dem.chuyen} (${(100 - tiLeRe).toFixed(1)}%) · tạt ${dem['tat-canh']} · sút ${dem.sut}`,
    )
    expect(dem.chuyen, 'số đường chuyền').toBeGreaterThan(dem['re-bong'])
    /*
      Dải chứ không phải một con số: tỉ lệ đổi theo bối cảnh, nhưng rê bóng
      chiếm quá một phần ba số lần chạm bóng thì không còn là bóng đá nữa.
    */
    expect(tiLeRe, 'tỉ lệ rê bóng').toBeLessThan(35)
    expect(tiLeRe, 'tỉ lệ rê bóng').toBeGreaterThan(5)
  })

  it('một bước rê bóng luôn giữ nguyên cột — tiến lên mà đổi cột là một đường chuyền', () => {
    const rng = taoRng('RE GIU COT')
    for (let i = 0; i < 300; i += 1) {
      const kq = chayChuoiBong(CAC_VUNG[i % CAC_VUNG.length], rng, BOI_CANH_TRUNG_TINH)
      const duongDi = [...kq.cacHanhDong.map((h) => h.vung), kq.vungKetThuc]
      for (let j = 0; j < kq.cacHanhDong.length; j += 1) {
        const h = kq.cacHanhDong[j]
        const sau = duongDi[j + 1]
        if (!h || !sau || h.loai !== 're-bong') continue
        expect(sau.cot, `chuỗi ${i} bước ${j}: rê từ ${h.vung.id} sang ${sau.id}`).toBe(h.vung.cot)
        expect(sau.dai, `chuỗi ${i} bước ${j}`).toBeGreaterThan(h.vung.dai)
      }
    }
  })

  it('không ai ôm bóng đi hết chiều dài sân', () => {
    const { chuoiRe } = demLoai()
    const dem: Record<number, number> = {}
    for (const c of chuoiRe) dem[c] = (dem[c] ?? 0) + 1
    const daiNhat = Math.max(...chuoiRe)
    console.log(`chuỗi rê liên tiếp: ${JSON.stringify(dem)} — dài nhất ${daiNhat}`)
    /*
      Sân có **bốn dải**, nên một chuỗi rê ba bước là đi từ dải 0 tới dải 3 —
      đúng cảnh "rê từ đầu sân đến cuối sân" mà người dùng nói. Ba bước vẫn có
      thể xảy ra, nhưng phải là chuyện hiếm chứ không phải vài lần mỗi trận.
    */
    expect(daiNhat, 'chuỗi rê dài nhất').toBeLessThanOrEqual(3)
    const soBaBuoc = dem[3] ?? 0
    expect(soBaBuoc, 'số chuỗi rê ba bước trên 600 chuỗi').toBeLessThan(
      chuoiRe.length / 20,
    )
  })
})
