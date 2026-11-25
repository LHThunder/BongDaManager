import { describe, expect, it } from 'vitest'
import { cauHinhMau, MA_TRAN_CO_DINH } from '../engine/__fixtures__/doiMau'
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

/** Khung của sa bàn; rộng hơn sân 2D, xem `San3D.tsx`. */
const KHUNG_SA_BAN: KhungAnh = { rong: 104.02352941176471, cao: 64, le: 2.6 }

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
  ⛔ AC-49.1 (thủ môn trong một phần ba sân nhà) KHÔNG có phép kiểm ở đây, và
  đó là một quyết định, không phải một chỗ quên.

  Đo bằng máy ngày 2026-11-25 trên 10 mã trận × 45 phút × mọi mốc — 56.640 lượt
  đo — cho **2,06%** số lượt nằm ngoài một phần ba sân nhà, lệch xa nhất
  **31,72 m**, p90 **8,09 m**. Lệch 31,72 m đặt thủ môn ở `x ≈ 66,7`, tức **qua
  vạch giữa sân**.

  Đây là tính chất của **engine spec 007**, không phải của lớp vẽ: engine kẹp
  **ĐÍCH** của thủ môn chứ không kẹp **VỊ TRÍ** (`coHoc.test.ts:660`), nên quán
  tính đưa anh ta vượt qua. Chính là lỗi mà spec 005 sinh ra AC-30.7 để chặn —
  xem `viTriVe.ts:11`, nơi ghi rằng lỗi "thủ môn chạy tới giữa sân" từng lọt
  suốt một lát cắt với 1.291 phép kiểm xanh.

  Người dùng chốt ngày 2026-11-25: **mở task ở spec 007** (`T813`) thay vì để
  spec 011 đặt một ngưỡng 32 m rồi gọi đó là phép kiểm. Spec 011 **MUST NOT**
  thêm kẹp ở lớp vẽ — `viTriVeLienTuc` đã cố ý tắt đúng phép kẹp ấy.

  AC-49.1 vì thế **đang bị CHẶN**, không phải đã đạt. Phép kiểm cho nó thuộc
  `coHoc.test.ts` của spec 007, không thuộc file này.
*/

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
