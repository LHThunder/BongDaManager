import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../__fixtures__/doiMau'
import {
  CAC_TRANG_THAI,
  dungTepXuat,
  KHOA_BONG,
  KHOA_NGUOI,
  MA_TRONG_TAI,
  maNganCuaNguoi,
  PHIEN_BAN_TEP,
  trangThaiCuaNguoi,
  type TepXuat,
} from './tepXuat'
import { buocPhutLienTuc, taoTranLienTuc } from './tranLienTuc'

/*
  Tệp xuất JSON (T740, AC-45.5 + AC-45.6, quyết định D125).

  Dựng một tệp đầy đủ tốn ~375 ms, nên khối này dựng **một** tệp rồi hỏi nó
  nhiều câu, thay vì dựng lại ở mỗi `it`.
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
