import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH, MAU_RONG } from '../__fixtures__/doiMau'
import { dongSuKien } from '../tran'
import {
  CAC_TRANG_THAI,
  chuoiTep,
  dungTepXuat,
  KHOA_BONG,
  KHOA_NGUOI,
  MA_TRONG_TAI,
  maNganCuaNguoi,
  PHIEN_BAN_TEP,
  soByteCuaChuoi,
  trangThaiCuaNguoi,
  type TepXuat,
} from './tepXuat'
import {
  buocPhutLienTuc,
  chayHetTranLienTuc,
  taoTranLienTuc,
} from './tranLienTuc'
import { TAM_CHAM_BONG } from './coHoc'
import { KHONG_AI_GIU as KHONG_AI_GIU_TRONG_TEP } from './loMoc'
import { LE_TRON_MET } from './doCoHoc'

/*
  ====================================================================
  KÍCH THƯỚC THẬT CỦA TỆP XUẤT — ĐO, KHÔNG ƯỚC (T744, AC-45.11).
  ====================================================================

  **Mẫu:** 20 mã đầu của `MAU_RONG` (`Z0000XQ4B` … `Z0019XQ4B`), trận 11 người
  90 phút, đội mẫu A/B, sân không trung lập. **Ngày đo:** 2026-11-27.
  **Phép đo:** `soByteCuaChuoi(chuoiTep(dungTepXuat(cauHinhMau(ma))))`, tức
  `new TextEncoder().encode(…).byteLength` trên **chính chuỗi sẽ được ghi ra
  tệp** — không ước lượng từ số mốc.

  | | byte | MB (thập phân) | MiB | tình huống | hàng mỏng |
  |---|---|---|---|---|---|
  | nhỏ nhất (`Z0017XQ4B`) | 3.489.133 | **3,489** | 3,327 | 9 | 5.940 |
  | trung vị (`Z0018XQ4B`) | 3.970.120 | **3,970** | 3,786 | 13 | 6.020 |
  | **trung bình, 20 mã** | **4.058.571** | **4,059** | **3,871** | — | — |
  | **ca xấu (`Z0019XQ4B`)** | **5.332.957** | **5,333** | **5,086** | **23** | 6.440 |

  **Ca xấu dư 51,5% so với ngưỡng 11.000.000 byte của AC-45.11.**

  📌 **Ca xấu nhích 5.332.429 → 5.332.957 byte (+528) ngày 2026-11-27 vì `T816`:**
  `nguoi_giu` nay là `-1` suốt quãng bóng bay, và `-1` dài hơn một chữ số. Ba
  hàng còn lại của bảng đo **trước** T816 nên chúng nhỏ hơn thực tế cùng một
  bậc ấy; giữ nguyên vì chênh lệch là **một phần vạn** và không đổi kết luận
  nào.

  ⚠️ **HAI CƠ SỐ, VÀ ĐÓ KHÔNG PHẢI SỰ CẨN THẬN THỪA.** `src/ui/ngonNgu/soLieu.ts`
  `coTep(byte)` chia `1024·1024` rồi in nhãn **"MB"** — tức repo đang in **MiB
  dưới nhãn MB**. AC-45.11 chốt **thập phân**. Ở ngưỡng 11 MB hai cơ số lệch
  **534.336 byte = 4,9%**, đủ để một tệp 11,3 MB xanh ở phép kiểm MiB mà **vi
  phạm** AC. Nên bảng trên báo cả hai, và `T745` canh **byte**, không canh MB.

  📌 **Con số này hoà giải hai con số mà D125 ghi là CHƯA hoà giải:** ~11,3 MB
  của hội đồng thiết kế và 7,2 / 8,0 / 9,0 MB của plan mục 10. Thực tế **thấp
  hơn cả hai** — ca xấu nhất trong 20 mã mới 5,33 MB. D125 nói nếu số đo ra
  11,3 thì đó là **một câu phải hỏi người dùng**; không phải hỏi nữa.

  📌 **Thứ quyết định kích thước là SỐ TÌNH HUỐNG, không phải số hàng mỏng.**
  Hàng mỏng chỉ đi từ 5.940 lên 6.440 (**+8%**) trong khi tệp đi từ 3,49 lên
  5,33 MB (**+53%**); tình huống đi từ 9 lên 23 (**×2,6**). Khối **dày** mới là
  chỗ co giãn.

  **Lệnh dựng lại được:**

      npx vitest run src/engine/lienTuc/tepXuat.test.ts

  (khối "ngưỡng 11 MB" in lại con số của ca xấu ở mỗi lượt chạy)

  ---

  Tệp xuất JSON (T740, AC-45.5 + AC-45.6, quyết định D125).

  Dựng một tệp đầy đủ tốn ~230 ms *(đo lại T744; ghi chú cũ nói 375 ms)*, nên
  khối này dựng **một** tệp rồi hỏi nó nhiều câu, thay vì dựng lại ở mỗi `it`.
*/
const MA = MA_TRAN_CO_DINH[0]!
const TEP: TepXuat = dungTepXuat(cauHinhMau(MA))

describe('năm khoá gốc, và chỉ năm (T740, AC-45.5)', () => {
  it('đúng năm khoá gốc, đúng tên ấy', () => {
    expect(Object.keys(TEP).sort()).toEqual(
      ['dinh_dang', 'khoi_dau', 'moc', 'nhat_ky', 'tinh_huong'].sort(),
    )
  })

  it('khối đầu nói rõ đơn vị, để người đọc tệp không phải đoán', () => {
    expect(TEP.dinh_dang.phien_ban).toBe(PHIEN_BAN_TEP)
    expect(TEP.dinh_dang.don_vi_do_dai).toBe('met')
    expect(TEP.dinh_dang.don_vi_thoi_gian).toBe('giay')
  })
})

describe('khối MỎNG: tuple cộng hàng tiêu đề (T740)', () => {
  it('mỗi hàng dài đúng bằng tiêu đề nói', () => {
    const dai = 1 + KHOA_BONG.length + TEP.khoi_dau.o.length * KHOA_NGUOI.length
    expect(TEP.moc.khoa_bong).toEqual([...KHOA_BONG])
    expect(TEP.moc.khoa_nguoi).toEqual([...KHOA_NGUOI])
    for (const hang of TEP.moc.hang) {
      expect(hang).toHaveLength(dai)
    }
    // ⚠️ CHỐNG RỖNG: khối mỏng phải phủ cả trận, không phải một phút.
    expect(TEP.moc.hang.length, 'số hàng').toBeGreaterThan(5_000)
  })

  it('mọi số trong khối mỏng đều hữu hạn — không NaN lọt vào tệp', () => {
    let soSo = 0
    for (const hang of TEP.moc.hang) {
      for (const so of hang) {
        expect(Number.isFinite(so)).toBe(true)
        soSo += 1
      }
    }
    expect(soSo, 'số ô đã kiểm').toBeGreaterThan(400_000)
  })

  /*
    Hai mươi lăm ô: 22 cầu thủ rồi **ba** trọng tài. Ba điểm ấy phải có trong
    tệp dù sân 2D không vẽ chúng (AC-38.10) — không có chúng thì `doCoHoc` của
    T742 không đo được mệnh đề nào của AC-38.10.
  */
  it('và thứ tự ô có ba trọng tài ở cuối', () => {
    expect(TEP.khoi_dau.o).toHaveLength(25)
    expect(TEP.khoi_dau.o.slice(-3)).toEqual([...MA_TRONG_TAI])
  })
})

describe('khối DÀY: nguyên văn mục 15 (T740, AC-45.5)', () => {
  const cacKhung = TEP.tinh_huong.flatMap((t) => t.khung)

  it('có tình huống dày, và chúng cách nhau đúng nửa giây', () => {
    // ⚠️ CHỐNG RỖNG: không có khung dày thì cả khối này vô nghĩa.
    expect(TEP.tinh_huong.length, 'số đoạn dày').toBeGreaterThan(0)
    expect(cacKhung.length, 'số khung dày').toBeGreaterThan(100)
    for (const tinhHuong of TEP.tinh_huong) {
      for (let i = 1; i < tinhHuong.khung.length; i += 1) {
        expect(
          tinhHuong.khung[i]!.t - tinhHuong.khung[i - 1]!.t,
          `đoạn phút ${tinhHuong.phut}`,
        ).toBeCloseTo(0.5, 9)
      }
    }
  })

  it('mỗi khung đúng BỐN khoá gốc', () => {
    for (const k of cacKhung) {
      expect(Object.keys(k).sort()).toEqual(['bong', 'cau_thu', 'su_kien', 't'])
    }
  })

  it('`bong` đúng BẢY khoá, `cau_thu` đúng TÁM khoá', () => {
    let soNguoi = 0
    for (const k of cacKhung) {
      expect(Object.keys(k.bong)).toHaveLength(7)
      for (const c of k.cau_thu) {
        expect(Object.keys(c)).toHaveLength(8)
        soNguoi += 1
      }
    }
    expect(soNguoi, 'số bản ghi cầu thủ').toBeGreaterThan(2_000)
  })

  /*
    Enum **ĐÓNG**. Phép kiểm canh "mọi giá trị phát ra đều thuộc enum", không
    canh "đủ 14 đều xuất hiện" — một phép kiểm như thế sẽ ép người viết **bịa
    ra** tám trạng thái mà engine không có cơ sở để phát.
  */
  it('mọi `trang_thai` đều nằm trong enum đóng 14 giá trị', () => {
    expect(CAC_TRANG_THAI).toHaveLength(14)
    const daThay = new Set<string>()
    for (const k of cacKhung) {
      for (const c of k.cau_thu) {
        expect(CAC_TRANG_THAI, `trạng thái ${c.trang_thai}`).toContain(
          c.trang_thai,
        )
        daThay.add(c.trang_thai)
      }
    }
    // ⚠️ CHỐNG RỖNG: phải có **nhiều hơn một** trạng thái, không thì một hàm
    // trả hằng số cũng xanh.
    expect(daThay.size, `các trạng thái đã phát: ${[...daThay].join(',')}`).toBeGreaterThan(
      2,
    )
  })

  it('và mã người trong khung dày tra được ở bảng `khoi_dau.nguoi`', () => {
    const coTrongBang = new Set(TEP.khoi_dau.nguoi.map((n) => n.ma))
    for (const k of cacKhung.slice(0, 50)) {
      for (const c of k.cau_thu) {
        expect(coTrongBang, `mã ${c.id}`).toContain(c.id)
      }
      if (k.bong.nguoi_giu !== null) {
        expect(coTrongBang, `người giữ ${k.bong.nguoi_giu}`).toContain(
          k.bong.nguoi_giu,
        )
      }
    }
  })
})

describe('hai lần xuất cùng mã trận GIỐNG TỪNG BYTE (T740, AC-37.5)', () => {
  it('chuỗi JSON của hai lượt trùng khít', () => {
    const a = JSON.stringify(TEP)
    const b = JSON.stringify(dungTepXuat(cauHinhMau(MA)))
    expect(b.length, 'độ dài chuỗi').toBe(a.length)
    expect(b).toBe(a)
  })

  /*
    ⚠️ **Mã ngắn gán từ BẢN GHI, không từ thứ tự duyệt — và đây là lý do.**
    `cacCauThu` không đổi suốt trận, còn `trenSan` thì đổi mỗi lượt thay người
    và mỗi thẻ đỏ. Gán theo người đang trên sân thì một lượt thay người làm mọi
    mã sau đó **trượt đi**, và tệp của hôm nay không còn so được với tệp của
    hôm qua.
  */
  it('mã ngắn theo thứ tự danh sách ĐĂNG KÝ, không theo người trên sân', () => {
    const lt = taoTranLienTuc({
      ...cauHinhMau(MA),
      cheDoMoPhong: 'lien-tuc',
    })
    const ma = maNganCuaNguoi(lt.tran)

    for (const [chu, ben] of [
      ['A', lt.tran.ben.nha],
      ['B', lt.tran.ben.khach],
    ] as const) {
      ben.cacCauThu.forEach((c, i) => {
        expect(ma.get(c.id), `${chu}${i + 1}`).toBe(`${chu}${i + 1}`)
      })
      // Danh sách đăng ký RỘNG HƠN sân: có cả dự bị, nên mã không trượt khi thay người.
      expect(ben.cacCauThu.length).toBeGreaterThan(ben.trenSan.length)
    }
    expect(ma.size, 'số người có mã').toBe(
      lt.tran.ben.nha.cacCauThu.length + lt.tran.ben.khach.cacCauThu.length,
    )
  })

  /*
    Và mã ấy **sống qua một lượt thay người**: chạy trận tới khi đội hình đổi
    rồi hỏi lại, mã của từng người phải y nguyên. Đây là ca mà "gán theo thứ tự
    duyệt" sẽ hỏng, còn "gán theo bản ghi" thì không.
  */
  it('và mã KHÔNG đổi sau khi đội hình trên sân đã đổi', () => {
    let lt = taoTranLienTuc({ ...cauHinhMau(MA), cheDoMoPhong: 'lien-tuc' })
    const dau = maNganCuaNguoi(lt.tran)
    for (let p = 0; p < 40 && !lt.tran.ketThuc; p += 1) {
      lt = buocPhutLienTuc(lt).tt
    }
    const sau = maNganCuaNguoi(lt.tran)
    expect(sau.size).toBe(dau.size)
    for (const [id, m] of dau) {
      expect(sau.get(id), `người ${id}`).toBe(m)
    }
  })
})

describe('trangThaiCuaNguoi — bốn dải tốc độ và hai vai trò (T740)', () => {
  it('bốn dải tốc độ xếp đúng thứ tự', () => {
    expect(trangThaiCuaNguoi(0, false, 0)).toBe('dung_yen')
    expect(trangThaiCuaNguoi(1, false, 0)).toBe('di_bo')
    expect(trangThaiCuaNguoi(4, false, 0)).toBe('chay')
    expect(trangThaiCuaNguoi(8, false, 0)).toBe('nuoc_rut')
  })

  it('người giữ bóng là `dan_bong`, và `danh_dau` khi bóng ở tầm đầu', () => {
    expect(trangThaiCuaNguoi(4, true, 0)).toBe('dan_bong')
    expect(trangThaiCuaNguoi(4, true, 2.15)).toBe('danh_dau')
    // Bóng trên tầm đầu thì không phải đánh đầu nữa.
    expect(trangThaiCuaNguoi(4, true, 5)).toBe('dan_bong')
  })

  it('và mọi giá trị nó phát ra đều thuộc enum đóng', () => {
    for (const toc of [0, 0.5, 2, 5, 9]) {
      for (const giu of [true, false]) {
        for (const z of [0, 2, 5]) {
          expect(CAC_TRANG_THAI).toContain(trangThaiCuaNguoi(toc, giu, z))
        }
      }
    }
  })
})

/*
  ====================================================================
  NHẬT KÝ TRONG TỆP LÀ KÊNH **KHÔNG CẮT** (T741, AC-45.6).
  ====================================================================
*/
describe('nhật ký trong tệp không đi qua phép chọn mật độ (T741)', () => {
  /*
    🐞 **Phép kiểm đầu của tôi ở đây SAI, và phép đo bác nó ngay.** Tôi đòi nhật
    ký **dài hơn** dòng tường thuật, và nó ra **70 so với 70**. Lý do: `chonSuKien`
    chỉ cắt khi số ứng viên **vượt trần** 60–100 dòng, mà `gomUngVienCuaPhut` đã
    tỉa trước nên một trận 90 phút chỉ còn ~70 ứng viên — trần không bao giờ
    chạm tới.

    Đo trên ba thời lượng, 5 mã mỗi mức:

      - **20 phút**: 121 ứng viên → **108** dòng, **2/5 trận bị cắt** (trần
        [13; 22] theo `khoangSoDong`);
      - **45 phút**: 205 → 205, không trận nào bị cắt;
      - **90 phút**: 383 → 383, không trận nào bị cắt.

    Nên ca chứng minh phải là trận **ngắn**, nơi phép cắt thật sự xảy ra. Một
    phép kiểm chỉ chạy ở 90 phút sẽ **xanh mãi mãi** dù nhật ký có đi qua phép
    cắt hay không.
  */
  it('trận NGẮN: dòng màn hình bị cắt, nhật ký của tệp thì không', () => {
    let soTranBiCat = 0
    let soTran = 0
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const cauHinh = { ...cauHinhMau(ma), thoiLuong: 20 }
      const lt = chayHetTranLienTuc(
        taoTranLienTuc({ ...cauHinh, cheDoMoPhong: 'lien-tuc' }),
      )
      const soUngVien = lt.tran.ungVien.length
      const choManHinh = dongSuKien(lt.tran).length
      const tep = dungTepXuat(cauHinh)

      // Nhật ký của tệp giữ **đủ** số ứng viên, không bớt một dòng nào.
      expect(tep.nhat_ky.length, `${ma}`).toBe(soUngVien)
      expect(choManHinh, `${ma}`).toBeLessThanOrEqual(soUngVien)
      if (choManHinh < soUngVien) soTranBiCat += 1
      soTran += 1
    }
    /*
      ⚠️ CHỐNG RỖNG, và đây là mệnh đề cả task đứng trên: phải CÓ trận mà màn
      hình bị cắt. Không có thì hai kênh không phân biệt được, và "kênh riêng"
      chỉ là một cách đổi tên.
    */
    expect(soTran).toBe(5)
    expect(soTranBiCat, 'số trận mà dòng màn hình bị cắt').toBeGreaterThan(0)
  })

  it('trận đầy đủ: nhật ký giữ đúng số ứng viên, và không ít hơn màn hình', () => {
    const lt = chayHetTranLienTuc(
      taoTranLienTuc({ ...cauHinhMau(MA), cheDoMoPhong: 'lien-tuc' }),
    )
    expect(TEP.nhat_ky.length).toBe(lt.tran.ungVien.length)
    expect(TEP.nhat_ky.length).toBeGreaterThanOrEqual(
      dongSuKien(lt.tran).length,
    )
    expect(TEP.nhat_ky.length, 'số dòng nhật ký').toBeGreaterThan(50)
  })

  it('và mỗi dòng vẫn đúng tám khoá', () => {
    for (const d of TEP.nhat_ky.slice(0, 50)) {
      expect(Object.keys(d)).toHaveLength(8)
    }
  })

  /*
    Và chỗ dựng tệp **không gọi** phép chọn mật độ. Đây là nửa còn lại: phép đo
    ở trên nói "hôm nay nó không cắt", còn phép quét này nói "nó **không thể**
    cắt" — hai mệnh đề khác nhau, và AC-45.6 cần cả hai.
  */
  it('và tepXuat.ts không gọi phép chọn mật độ', () => {
    const nguon = Object.values(
      import.meta.glob('./tepXuat.ts', {
        query: '?raw',
        import: 'default',
        eager: true,
      }) as Record<string, string>,
    )
    expect(nguon).toHaveLength(1)
    const code = nguon[0]!
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    expect(code.includes('chonSuKien')).toBe(false)
    expect(code.includes('dongSuKien')).toBe(false)
  })
})

/*
  ====================================================================
  NGƯỠNG 11 MB — VÀ MỘT CA NGƯỢC CHỨNG MINH NÓ ĐỎ ĐƯỢC (T745, AC-45.11).
  ====================================================================

  Khối này canh **ngưỡng**; khối số đo ở đầu file **báo con số**. Hai việc khác
  nhau, và `T744`/`T745` tách đôi đúng ở chỗ ấy.

  ⚠️ **Ca xấu được GHIM theo tên, không dò lại mỗi lượt chạy.** `Z0019XQ4B` là
  mã nặng nhất trong 20 mã đã đo (23 tình huống). Dò lại cả 20 mã ở mỗi lượt
  tốn **~5 giây** mỗi lần ai đó chạy bộ test, để mua đúng một thứ: phòng khi
  một mã khác vượt lên nặng hơn. Cái giá ấy không đáng, và nếu mô hình đổi tới
  mức thứ tự nặng-nhẹ đảo thì **khối số đo ở đầu file phải được đo lại** — đó
  mới là chỗ chịu trách nhiệm.
*/
const MA_CA_XAU = MAU_RONG[19]!
const NGUONG_BYTE = 11_000_000

describe('ngưỡng 11 MB của AC-45.11 (T745)', () => {
  const tepXau = dungTepXuat(cauHinhMau(MA_CA_XAU))
  const soByte = soByteCuaChuoi(chuoiTep(tepXau))

  it('ca xấu trong 20 mã nằm DƯỚI 11.000.000 byte, và in ra con số', () => {
    console.log(
      `AC-45.11 — ${MA_CA_XAU}: ${soByte} byte = ` +
        `${(soByte / 1_000_000).toFixed(3)} MB = ` +
        `${(soByte / (1024 * 1024)).toFixed(3)} MiB, ` +
        `dư ${(((NGUONG_BYTE - soByte) / NGUONG_BYTE) * 100).toFixed(1)}% ` +
        `(${tepXau.tinh_huong.length} tình huống, ${tepXau.moc.hang.length} hàng mỏng)`,
    )
    /*
      ⚠️ CHỐNG RỖNG. Một tệp rỗng cũng "dưới 11 MB". Khẳng định nó là một tệp
      **thật** trước đã: trên 3 MB, có khối dày, có đủ hàng mỏng của 90 phút.
    */
    expect(soByte).toBeGreaterThan(3_000_000)
    expect(tepXau.tinh_huong.length).toBeGreaterThan(5)
    expect(tepXau.moc.hang.length).toBeGreaterThan(5_000)

    expect(soByte).toBeLessThanOrEqual(NGUONG_BYTE)
  })

  it('và ngưỡng ấy ĐỎ ĐƯỢC: bơm thêm tình huống cho tới khi vượt', () => {
    /*
      Nhân bản **khối dày** — đúng thứ đã đo được là chỗ co giãn của tệp (số
      tình huống đi ×2,6 thì tệp đi +53%, còn hàng mỏng chỉ +8%). Nếu phép
      khẳng định ở trên là một câu nói suông thì vòng này sẽ chạy hết 20 lượt
      mà không bao giờ vượt, và phép kiểm đỏ.
    */
    let tinhHuong = [...tepXau.tinh_huong]
    let vuot = 0
    let lan = 0
    for (; lan < 20; lan += 1) {
      tinhHuong = [...tinhHuong, ...tepXau.tinh_huong]
      vuot = soByteCuaChuoi(chuoiTep({ ...tepXau, tinh_huong: tinhHuong }))
      if (vuot > NGUONG_BYTE) break
    }
    console.log(
      `ca ngược: ${lan + 1} lần nhân bản khối dày → ${vuot} byte, ` +
        `vượt ngưỡng ${(((vuot - NGUONG_BYTE) / NGUONG_BYTE) * 100).toFixed(1)}%`,
    )
    expect(vuot).toBeGreaterThan(NGUONG_BYTE)
    // Và nó vượt vì khối DÀY phình, không vì cái gì khác.
    expect(tinhHuong.length).toBeGreaterThan(tepXau.tinh_huong.length)
  })
})

/*
  ====================================================================
  AI ĐANG GIỮ BÓNG — VÀ AI THÌ KHÔNG (T816, AC-37.6).
  ====================================================================

  `AC-37.6` đòi hệ thống biết **ai đang giữ bóng** ở mỗi khoảnh khắc, *"hoặc
  nói rõ **không ai** (bóng đang bay, bóng chết)"*. Khối này canh đúng vế thứ
  hai — vế đã hỏng suốt từ T706 và không ai thấy, vì nó hỏng theo kiểu **nói
  thừa** chứ không nói thiếu.

  🐞 **Số đo trước T816**, 3 mã, 18.380 hàng: `-1` chỉ xuất hiện lúc **bóng
  chết** (31,9%); trong 2.523 bước mà bóng bay trên 5 m, `nguoi_giu` **không
  đổi người lần nào** và **không lần nào là `-1`**; **37,0%** số hàng có nêu
  người giữ thì người ấy cách bóng **từ 5 m trở lên**, xa nhất **68,9 m**.
  Người dùng nhìn thấy nó trước khi tôi đo, và gọi đúng tên: *"chuyền bóng thì
  người ở lại, bóng di chuyển"* — hôm ấy thì ngược lại.

  **Sau T816:** `-1` chiếm **70,1%**; **không một hàng nào** nêu người giữ cách
  bóng quá **1,00 m** (`TAM_CHAM_BONG`), và 97,3% trong số đó dưới 0,5 m.
*/
describe('AC-37.6 — "không ai giữ" phải nói đúng lúc bóng bay (T816)', () => {
  const MA_BA = MA_TRAN_CO_DINH.slice(0, 3)
  const CAC_TEP = MA_BA.map((ma) => dungTepXuat(cauHinhMau(ma)))
  const COT_GIU = 4
  const COT_BONG_X = 1
  const COT_BONG_Y = 2

  function oCua(chiSo: number): number {
    return 5 + chiSo * 3
  }

  it('không hàng nào nêu một người "đang giữ" cách bóng quá TAM_CHAM_BONG', () => {
    let coGiu = 0
    let xaNhat = 0
    let tong = 0
    for (const tep of CAC_TEP) {
      for (const h of tep.moc.hang) {
        tong += 1
        const g = h[COT_GIU]!
        if (g === KHONG_AI_GIU_TRONG_TEP) continue
        coGiu += 1
        const o = oCua(g)
        const cach = Math.hypot(h[o]! - h[COT_BONG_X]!, h[o + 1]! - h[COT_BONG_Y]!)
        if (cach > xaNhat) xaNhat = cach
      }
    }
    /*
      ⚠️ CHỐNG RỖNG. Một tệp mà **mọi** hàng đều nói "không ai giữ" cũng thoả
      mệnh đề trên mà chẳng chứng minh gì — và nó sẽ là một hồi quy nặng hơn
      cái T816 vừa sửa. Nên khẳng định có hàng nêu tên người, trước đã.
    */
    expect(tong).toBeGreaterThan(15_000)
    expect(coGiu).toBeGreaterThan(4_000)
    expect(xaNhat).toBeLessThanOrEqual(TAM_CHAM_BONG + LE_TRON_MET)
  })

  it('bóng BAY thì không ai giữ — trên hơn 2.000 bước bóng đi quá 5 m', () => {
    let buocBay = 0
    let coNguoiGiuKhiBay = 0
    let xaNhatBongDi = 0
    for (const tep of CAC_TEP) {
      const h = tep.moc.hang
      for (let i = 1; i < h.length; i += 1) {
        const a = h[i - 1]!
        const b = h[i]!
        const quang = Math.hypot(
          b[COT_BONG_X]! - a[COT_BONG_X]!,
          b[COT_BONG_Y]! - a[COT_BONG_Y]!,
        )
        if (quang <= 5) continue
        buocBay += 1
        if (quang > xaNhatBongDi) xaNhatBongDi = quang
        if (a[COT_GIU]! !== KHONG_AI_GIU_TRONG_TEP && b[COT_GIU]! !== KHONG_AI_GIU_TRONG_TEP) {
          coNguoiGiuKhiBay += 1
        }
      }
    }
    // ⚠️ CHỐNG RỖNG: phải CÓ đường chuyền dài thật trong mẫu.
    expect(buocBay).toBeGreaterThan(2_000)
    expect(xaNhatBongDi).toBeGreaterThan(20)

    expect(coNguoiGiuKhiBay).toBe(0)
  })

  it('và nhiều nhất MỘT người chạm bóng ở một mốc — tính chất của TAM_CHAM_BONG', () => {
    /*
      `TAM_CHAM_BONG = BAN_KINH_TRANH / 2` được chọn **vì** tính chất này:
      `tachChen` giữ hai người bất kỳ cách nhau ít nhất `BAN_KINH_TRANH`, nên
      hai người cùng nằm trong `TAM_CHAM_BONG` của một điểm là điều không dựng
      nổi. Đây là phép kiểm biến lập luận ấy thành một con số.
    */
    let mocCoHaiNguoiCham = 0
    let tongMoc = 0
    for (const tep of CAC_TEP) {
      for (const h of tep.moc.hang) {
        tongMoc += 1
        let gan = 0
        for (let i = 0; i < 22; i += 1) {
          const o = oCua(i)
          const cach = Math.hypot(h[o]! - h[COT_BONG_X]!, h[o + 1]! - h[COT_BONG_Y]!)
          if (cach <= TAM_CHAM_BONG) gan += 1
        }
        if (gan > 1) mocCoHaiNguoiCham += 1
      }
    }
    expect(tongMoc).toBeGreaterThan(15_000)
    expect(mocCoHaiNguoiCham).toBe(0)
  })
})
