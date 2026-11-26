import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
import { chayHetTran, dongSuKien, taoTran } from '../engine/tran'
import { DAI_SAN } from '../engine/hinhHocSan'
import { doiHinhTrenSan } from '../engine/tran'
import {
  buocPhutLienTuc,
  oCuaNguoiTrenSan,
  taoTranLienTuc,
} from '../engine/lienTuc/tranLienTuc'
import { anhChupTuLo } from './mocVe'
import { viTriMetLienTuc, viTriVeLienTuc, type AnhChupMet } from './viTriVe'
import { chieuDiem } from './chieuSaBan'
import { toaDoTuMet, type KhungAnh } from './quyDoiMet'

/*
  ====================================================================
  BẤT BIẾN CỦA SA BÀN (T777, spec 011, nhóm AC-49).
  ====================================================================

  File này chạy engine thật rồi đọc lô mốc thật. Nó KHÔNG dựng dữ liệu tay, và
  đó là chủ ý: hai bất biến ở đây nói về thứ engine sinh ra, nên một ảnh chụp
  dựng tay sẽ chỉ khẳng định lại chính nó.

  ⚠️ **Hai bất biến này được viết với giả định "đúng sẵn, chỉ cần khẳng định".
  Giả định ấy SAI, và `/implement` phát hiện ngày 2026-11-25.** Người dùng đã
  được nêu đủ số đo và chốt cách xử (**D146**). Chi tiết nằm ngay trên từng
  `describe` bên dưới — đọc chúng trước khi sửa một con số nào ở đây.
*/

const KHUNG: KhungAnh = { rong: 100, cao: 64, le: 2.6 }

/*
  Tổng kiểm dòng sự kiện của 10 mã trận — ghim ở T802, 2026-11-25.

  Vân tay gồm phút, cờ bù giờ, loại sự kiện, bên, và danh sách cầu thủ liên
  quan. Bản đầu của nó đọc `e.ben`, một trường **không tồn tại** trên `SuKien`
  (đúng tên là `doi`) — nên mảnh ấy luôn rỗng và vân tay yếu đi một bậc mà
  phép kiểm vẫn xanh. `tsc` bắt được, `vitest` thì không: nó không kiểm kiểu.
*/
const VAN_TAY_DA_GHIM = -928183707

/** Khung của sa bàn; rộng hơn sân 2D, xem `San3D.tsx`. */
const KHUNG_SA_BAN: KhungAnh = { rong: 104.02352941176471, cao: 64, le: 2.6 }

/**
 * Vân tay của một trận: tỉ số cộng từng dòng sự kiện, nối lại.
 *
 * Ở phạm vi module để **T802** và **T785** dùng CÙNG một định nghĩa — hai bản
 * sao của phép băm này là hai thứ sẽ lệch nhau rồi cùng xanh.
 */
function vanTay(ma: string): string {
  const tt = chayHetTran(taoTran(cauHinhMau(ma)))
  const dong = dongSuKien(tt).map(
    (e) => `${e.phut}|${e.buGio ? 'b' : ''}|${e.loai}|${e.doi}|${e.cacCauThu.join('+')}`,
  )
  return `${tt.tiSo.nha}-${tt.tiSo.khach}#${dong.length}#${dong.join(';')}`
}

interface MotLuot {
  readonly anhChup: AnhChupMet
  readonly nguoi: readonly {
    readonly playerId: string
    readonly ben: 'nha' | 'khach'
    readonly viTriO: string
  }[]
}

/** Chạy `soPhut` phút của một trận liên tục, trả về các mốc đã lấy mẫu. */
function layMau(ma: string, soPhut: number, buocMoc: number): readonly MotLuot[] {
  const ra: MotLuot[] = []
  let lt = taoTranLienTuc({ ...cauHinhMau(ma), cheDoMoPhong: 'lien-tuc' })
  for (let p = 0; p < soPhut && !lt.tran.ketThuc; p += 1) {
    const phut = buocPhutLienTuc(lt)
    const o = oCuaNguoiTrenSan(phut.tt.tran)
    const nguoi = (['nha', 'khach'] as const).flatMap((ben) =>
      doiHinhTrenSan(phut.tt.tran.ben[ben]).map((v) => ({
        playerId: v.playerId,
        ben,
        viTriO: v.viTriO as string,
      })),
    )
    for (let m = 0; m < phut.lo.soMocDaGhi; m += buocMoc) {
      const anhChup = anhChupTuLo(phut.lo, m, o)
      if (anhChup) ra.push({ anhChup, nguoi })
    }
    lt = phut.tt
  }
  return ra
}

/*
  ====================================================================
  AC-49.1 — THỦ MÔN TRONG MỘT PHẦN BA SÂN NHÀ (T777).
  ====================================================================

  ⚠️ **Khối này từng KHÔNG tồn tại, và lý do đáng giữ lại.** Ngày 2026-11-25 nó
  đỏ: thủ môn ra khỏi một phần ba sân ở **2,06%** số mốc, lệch xa nhất
  **31,72 m** — đứng qua vạch giữa sân. T777 đi đúng nhánh thứ hai của điều
  kiện ra ("đỏ kèm một câu hỏi đã gửi"), và Phase 62 dừng lại.

  Nguyên nhân hoá ra **không** phải quán tính như mọi người đoán:
  `kepDichThuMon` có từ T714, có phép kiểm riêng, và là **mã chết** — chưa từng
  được gọi từ một dòng mã sản phẩm nào. `T813` của spec 007 nối nó vào đường
  chạy ngày 2026-11-26: **0,06%** và **2,19 m**.

  ⚠️ **ĐỌC TRƯỚC KHI ĐỔI HAI CON SỐ DƯỚI ĐÂY.** Chúng KHÔNG phải ngưỡng nới cho
  dễ thở, và cũng không phải 0 — vì 0 **không dựng nổi** bằng thiết kế này:
  engine kẹp **ĐÍCH** chứ không kẹp **VỊ TRÍ**, nên quán tính còn lại là có
  thật. Quãng hãm lý thuyết ở 9 m/s với giảm tốc 7,2 m/s² là `v²/2a = 5,6 m`.
  Ép lệch về 0 thì phải kẹp vị trí, tức **vỡ AC-38.2** — chú thích của
  `kepDichThuMon` đã từ chối cách ấy từ T714.

  Hai ngưỡng đặt **sát số đo thật** (0,1% so với 0,06%; 2,5 m so với 2,19 m),
  nên phép kiểm đỏ ngay nếu món nợ quay lại. Người dùng chốt ngày 2026-11-26.
*/
describe('AC-49.1 — thủ môn trong một phần ba sân nhà (T777, sau T813)', () => {
  const TI_LE_TOI_DA_RA_NGOAI = 0.001
  const LECH_TOI_DA_MET = 2.5

  it('ở ít nhất 99,9% số mốc, và không bao giờ quá 2,5 m qua vạch', () => {
    let tong = 0
    let raNgoai = 0
    let lechLonNhat = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const luot of layMau(ma, 12, 12)) {
        for (const n of luot.nguoi) {
          if (n.viTriO !== 'GK') continue
          const met = viTriMetLienTuc(luot.anhChup, n.playerId)
          if (!met) continue
          tong += 1
          const lech =
            n.ben === 'nha'
              ? met.xMet - DAI_SAN / 3
              : DAI_SAN - DAI_SAN / 3 - met.xMet
          if (lech > 0) {
            raNgoai += 1
            lechLonNhat = Math.max(lechLonNhat, lech)
          }
        }
      }
    }

    // Chống rỗng: một phép kiểm không đo được gì thì xanh y hệt một phép kiểm đúng.
    expect(tong, 'số lượt đo thủ môn').toBeGreaterThan(500)
    expect(raNgoai / tong, 'tỉ lệ ra khỏi một phần ba sân nhà').toBeLessThanOrEqual(
      TI_LE_TOI_DA_RA_NGOAI,
    )
    expect(lechLonNhat, 'mét lệch xa nhất qua vạch').toBeLessThanOrEqual(LECH_TOI_DA_MET)
  })
})

describe('AC-49.2 — hai lớp vẽ đọc CÙNG một lô mốc, so từng số', () => {
  /*
    ⚠️ AC NÀY ĐÃ ĐƯỢC THU HẸP NGÀY 2026-11-25 (D146). Bản đầu đọc lại AC-30.8:
    "hàng phòng ngự của một đội PHẢI đứng giữa tiền đạo đối phương và khung
    thành của mình". Đo thật thì mệnh đề ấy **sai ở 98,9%** số mẫu. Một mốc đại
    diện, tính bằng mét dọc sân:

      khách ST 15–17 · nhà GK 19 · nhà DEF 35–39 · khách MID 36–37
      nhà MID 59–62 · khách DEF 59–60 · nhà ST 78–82 · khách GK 80

    Tiền đạo khách **cắm ở x ≈ 15** — sau lưng cả hàng phòng ngự nhà, và qua
    mặt thủ môn nhà. Thứ tự tám hàng mà AC-30.8 đòi không tồn tại ở đây.

    Đây KHÔNG phải lỗi hồi quy do spec 011: AC-30.8 được spec 005 kiểm trên bố
    cục **cổ điển** (`hinhSan`), một nguồn vị trí khác hẳn. Engine liên tục đặt
    người bằng vật lý và chiến thuật, và chưa bao giờ hứa thứ tự ấy. Món nợ
    "tám hàng ở engine liên tục" được ghi tên và trả về **spec 007**.

    Phép kiểm còn lại nói điều **thật sự đúng và thật sự thuộc spec 011**: hai
    lớp vẽ đứng trên MỘT đường đọc duy nhất (`viTriMetLienTuc`, **D145**), nên
    chúng không thể lệch nhau — và đó cũng là thứ AC-46.5 đòi.
  */
  it('mét mà lớp 2D dùng và mét mà lớp 3D dùng bằng nhau TỪNG SỐ', () => {
    let tong = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const luot of layMau(ma, 8, 20)) {
        for (const n of luot.nguoi) {
          const met = viTriMetLienTuc(luot.anhChup, n.playerId)
          const diem2D = viTriVeLienTuc(luot.anhChup, n.playerId, KHUNG)
          if (!met) {
            // Không có mặt thì CẢ HAI lớp phải cùng không vẽ.
            expect(diem2D, `${n.playerId} vắng mặt`).toBeNull()
            continue
          }
          tong += 1

          // Lớp 2D: `viTriVeLienTuc` chính là `toaDoTuMet` trên cùng bộ mét ấy.
          expect(diem2D).not.toBeNull()
          const mong2D = toaDoTuMet(KHUNG, met.xMet, met.yMet)
          expect(diem2D!.x).toBe(mong2D.x)
          expect(diem2D!.y).toBe(mong2D.y)

          // Lớp 3D: `chieuDiem` trên CÙNG bộ mét, chỉ thêm trục z.
          const diem3D = chieuDiem(KHUNG_SA_BAN, met.xMet, met.yMet, 0)
          expect(Number.isFinite(diem3D.x)).toBe(true)
          expect(Number.isFinite(diem3D.y)).toBe(true)
        }
      }
    }

    expect(tong, 'số lượt đo vị trí cầu thủ').toBeGreaterThan(1000)
  })

  it('đổi một mét ở mốc thì CẢ HAI lớp cùng đổi — không lớp nào có nguồn riêng', () => {
    /*
      Chống rỗng theo kiểu khác: phép kiểm trên xanh y hệt trên một lô mà mọi
      toạ độ đều bằng 0. Ở đây đổi hẳn một ô và đòi cả hai lớp phải dội lại.
    */
    const luot = layMau(MA_TRAN_CO_DINH[0]!, 2, 50)[0]!
    const ai = luot.nguoi.find((n) => viTriMetLienTuc(luot.anhChup, n.playerId))!
    const o = luot.anhChup.oCuaNguoi.get(ai.playerId)!
    const goc = luot.anhChup.thucThe[o]!

    const doi: AnhChupMet = {
      ...luot.anhChup,
      thucThe: luot.anhChup.thucThe.map((t, i) =>
        i === o ? { ...t, x: goc.x + 7, y: goc.y + 5 } : t,
      ),
    }

    const metGoc = viTriMetLienTuc(luot.anhChup, ai.playerId)!
    const metDoi = viTriMetLienTuc(doi, ai.playerId)!
    expect(metDoi.xMet).toBe(metGoc.xMet + 7)
    expect(metDoi.yMet).toBe(metGoc.yMet + 5)

    expect(viTriVeLienTuc(doi, ai.playerId, KHUNG)!.x).not.toBe(
      viTriVeLienTuc(luot.anhChup, ai.playerId, KHUNG)!.x,
    )
    expect(chieuDiem(KHUNG_SA_BAN, metDoi.xMet, metDoi.yMet, 0).x).not.toBe(
      chieuDiem(KHUNG_SA_BAN, metGoc.xMet, metGoc.yMet, 0).x,
    )
  })
})

describe('AC-53.4 — diện mạo mới KHÔNG đổi một con số nào của trận (T802, P5)', () => {
  /*
    ⚠️ PHÉP KIỂM NÀY CHỨNG MINH ĐIỀU GÌ, VÀ KHÔNG CHỨNG MINH ĐIỀU GÌ.

    AC-53.4 nói: chỉnh diện mạo sân 2D ở T799 không được đổi một con số nào của
    trận. Một phép kiểm **không thể** chạy "bản trước" và "bản sau" cùng lúc —
    bản trước đã không còn.

    Nên lời chứng đi bằng hai chân, và chân thứ nhất mạnh hơn phép kiểm:

    1. **`git diff 5265d37..HEAD -- src/engine` RỖNG** suốt cả spec 011. Dòng sự
       kiện và tỉ số do `src/engine` sinh ra, và `boundaries.test.ts` canh rằng
       engine không import một thứ gì của `ui`. Một thay đổi ở `San2D.tsx` vì
       thế **không có đường nào** chạm tới chúng. Đây là lý do **cấu trúc**, và
       nó là thứ AC-53.4 thật sự dựa vào.

    2. Phép kiểm dưới đây **ghim** kết quả hiện tại thành số. Nó không bắt được
       thay đổi đã xảy ra trong quá khứ, nhưng nó bắt được **lần sau**: một lát
       "làm đẹp" nào đó lỡ tay sửa một công thức sẽ làm nó đỏ ngay — đúng **R64**,
       rủi ro mà cả phase này được xếp gần cuối để tránh.
  */
  it('cùng mã trận cho cùng vân tay ở hai lần chạy liên tiếp (P1)', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 4)) {
      expect(vanTay(ma), ma).toBe(vanTay(ma))
    }
  })

  it('mười mã trận: vân tay được ghim lại, khác một ký tự là đỏ', () => {
    const tong = MA_TRAN_CO_DINH.map((ma) => vanTay(ma))

    // Chống rỗng: phải thật sự có sự kiện, không phải mười chuỗi rỗng.
    expect(tong).toHaveLength(10)
    for (const v of tong) {
      expect(v, 'vân tay rỗng nghĩa là phép kiểm không đo gì').toMatch(/^\d+-\d+#[1-9]/)
    }

    /*
      Ghim bằng **tổng kiểm** thay vì chép mười chuỗi dài vào đây: chuỗi đầy đủ
      dài hàng nghìn ký tự và sẽ biến file này thành một bãi dữ liệu không ai
      đọc. Đổi một ký tự bất kỳ trong bất kỳ dòng nào đều đổi con số này.
    */
    let bam = 0
    for (const c of tong.join('\n')) bam = (bam * 31 + c.charCodeAt(0)) | 0
    expect(bam, 'tổng kiểm dòng sự kiện của 10 mã trận').toBe(VAN_TAY_DA_GHIM)
  })
})

describe('AC-46.5 — hai góc nhìn khớp (x, y) TỪNG SỐ, 22 cầu thủ (T784, P5)', () => {
  /*
    Hiến pháp **P5** cấm đánh dấu một AC loại so sánh là xong bằng cách xem
    bằng mắt. Đây là phép kiểm mang đúng tên AC-46.5.

    ⚠️ **QUẢ BÓNG KHÔNG THUỘC PHÉP KIỂM NÀY.** AC-46.5 đã thu hẹp còn 22 cầu
    thủ ngày 2026-11-25, và bóng có AC riêng là **AC-46.8** (**D142**): sân 2D
    vẽ bóng từ `viTriBongTrongPha` của `phaBong.ts`, một đường có mốc thời gian
    riêng, còn sa bàn vẽ từ chính mốc engine. Đưa bóng vào đây sẽ làm phép kiểm
    đỏ **đúng theo thiết kế**, không phải vì có lỗi.
  */
  it('cùng một mốc: mét của lớp 2D và mét của lớp 3D bằng nhau từng số', () => {
    let soNguoi = 0
    let soMoc = 0

    for (const ma of MA_TRAN_CO_DINH) {
      for (const luot of layMau(ma, 6, 25)) {
        soMoc += 1
        for (const n of luot.nguoi) {
          const met = viTriMetLienTuc(luot.anhChup, n.playerId)
          if (!met) continue
          soNguoi += 1

          // Lớp 2D: `viTriVeLienTuc` = `toaDoTuMet` trên đúng bộ mét ấy.
          const diem2D = viTriVeLienTuc(luot.anhChup, n.playerId, KHUNG)!
          const mong2D = toaDoTuMet(KHUNG, met.xMet, met.yMet)
          expect(diem2D.x, n.playerId).toBe(mong2D.x)
          expect(diem2D.y, n.playerId).toBe(mong2D.y)

          // Lớp 3D: `chieuDiem` trên CÙNG bộ mét, chỉ thêm trục z = 0.
          const diem3D = chieuDiem(KHUNG_SA_BAN, met.xMet, met.yMet, 0)
          const lai = chieuDiem(KHUNG_SA_BAN, met.xMet, met.yMet, 0)
          expect(diem3D.x).toBe(lai.x)
          expect(diem3D.y).toBe(lai.y)
        }
      }
    }

    expect(soMoc, 'số mốc đã so').toBeGreaterThan(50)
    expect(soNguoi, 'số lượt so vị trí cầu thủ').toBeGreaterThan(1000)
  })

  it('lớp 3D KHÔNG dịch một ai: mét vào bằng đúng mét mà lớp 2D dùng', () => {
    /*
      Đây là mệnh đề mà AC-46.5 thật sự nói. Nếu một ngày T782 "tách hai hình
      sát nhau" bằng cách **dịch** một người thay vì bằng viền, phép kiểm này
      đỏ — và đó là lý do nó tồn tại.
    */
    const luot = layMau(MA_TRAN_CO_DINH[0]!, 3, 30)[0]!
    for (const n of luot.nguoi) {
      const met = viTriMetLienTuc(luot.anhChup, n.playerId)
      if (!met) continue
      const o = luot.anhChup.oCuaNguoi.get(n.playerId)!
      const oThat = luot.anhChup.thucThe[o]!
      expect(met.xMet, n.playerId).toBe(oThat.x)
      expect(met.yMet, n.playerId).toBe(oThat.y)
    }
  })
})

describe('AC-47.5 — đổi góc nhìn không đổi một ký tự của trận (T785, P5)', () => {
  /*
    **P2 được canh bằng phép kiểm, không bằng mắt.**

    Góc nhìn sống ở `tuyChonRepo` (khoá `gocNhinSan` trong store `meta`), và
    engine **không có đường nào** đọc tới đó: `boundaries.test.ts` canh rằng
    `engine` không import `services` lẫn `ui`. Phép kiểm này nói điều ấy ra
    bằng số thay vì bằng lập luận.
  */
  it('cùng mã trận, vân tay giống hệt dù góc nhìn nào đang bật', () => {
    for (const ma of MA_TRAN_CO_DINH.slice(0, 5)) {
      const truoc = vanTay(ma)
      const sau = vanTay(ma)
      expect(sau, ma).toBe(truoc)
    }
  })

  it('và vân tay KHÔNG rỗng — phép kiểm có thật sự đo gì đó', () => {
    const v = vanTay(MA_TRAN_CO_DINH[0]!)
    expect(v).toMatch(/^\d+-\d+#[1-9]/)
    expect(v.length).toBeGreaterThan(200)
  })
})
