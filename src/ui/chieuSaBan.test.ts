import { describe, expect, it } from 'vitest'
import { DAI_SAN, RONG_SAN, TAM_X, TAM_Y } from '../engine/hinhHocSan'
import {
  GOC_SA_BAN,
  HE_SO_CAO,
  chieuDiem,
  chieuMatSan,
  doCaoVe,
  thuTuDoSau,
  tiSaBan,
  viTriBongLienTuc,
} from './chieuSaBan'
import { CHI_SO_BONG, SO_THUC_THE } from '../engine/lienTuc/moc'
import { KHONG_AI_GIU_O, type AnhChupMet } from './viTriVe'
import type { KhungAnh } from './quyDoiMet'

/*
  Phép chiếu sa bàn (T765, AC-46.1 + AC-46.3, rủi ro R60).

  File này tồn tại vì một lý do hẹp và cụ thể: một dấu trừ sai hoặc một `sin`
  đổi thành `cos` trong `chieuSaBan.ts` vẫn vẽ ra hình, và hình ấy vẫn trông
  như một sa bàn. Mắt không bắt được. Nên ở đây canh CÔNG THỨC, không canh
  diện mạo — đúng lý do D131 từ chối để phép chiếu nằm trong một file `.tsx`.

  Khung dưới đây khai LẠI ba con số của `San2D.tsx` thay vì import, đúng quy
  ước `quyDoiMet.test.ts` đã đặt: import từ `San2D.tsx` là kéo cả React vào
  `environment: 'node'`.
*/
const KHUNG: KhungAnh = { rong: 100, cao: 64, le: 2.6 }

/** Giá trị `z` lớn nhất trong cả engine (quả tạt cao nhất của spec 007). */
const Z_CAO_NHAT = 5.26

/** Bán kính quả bóng, đơn vị ảnh — ngưỡng "thấy được" của AC-46.1. */
const BAN_KINH_BONG = 1.7

/** Bán kính đĩa cầu thủ; khai lại `BAN_KINH` của `San2D.tsx:270`. */
const BAN_KINH_DIA = 2.6

/** Khung thành dựng ra ngoài biên ngang bao nhiêu mét (`San2D.tsx:106`). */
const SAU_KHUNG_THANH_MET = 2

describe('tiSaBan — hệ tỉ lệ riêng của sa bàn (D144)', () => {
  it('là cao/RONG_SAN, KHÔNG phải tiLeMet', () => {
    expect(tiSaBan(KHUNG)).toBeCloseTo(64 / 68, 12)
    expect(tiSaBan(KHUNG)).toBeCloseTo(0.941176, 6)

    // tiLeMet của sân 2D là 0,864706. Nếu ai đó "dọn dẹp" bằng cách cho sa bàn
    // dùng lại nó thì ba con số spec đã công bố tụt hết, và phép kiểm
    // `doCaoVe(1 m) ≥ bán kính bóng` dưới đây đỏ. Đó là chủ ý.
    const tiLeMet2D = Math.min((100 - 5.2) / DAI_SAN, (64 - 5.2) / RONG_SAN)
    expect(tiSaBan(KHUNG)).toBeGreaterThan(tiLeMet2D)
  })

  it('khung 100 đơn vị KHÔNG đủ bề ngang — nên sa bàn phải rộng hơn sân 2D', () => {
    /*
      Đo trên bản chạy ngày 2026-11-25: trong khung rộng 100 thì hai khung thành
      rơi ra `x = −1,29` và `x = 99,41`, tức NGOÀI khung ảnh, và chúng không vẽ
      ra — trong khi T767 đòi thấy chúng. `tiSaBan` đưa 105 m thành 98,82 đơn
      vị, nên chỉ còn 0,59 đơn vị mỗi bên.

      Phép kiểm này là chỗ giữ lời: ai đặt `viewBox` của sa bàn về 100 cho
      "gọn như sân 2D" sẽ đỏ ở đây trước khi kịp thấy khung thành biến mất.
    */
    const rongDaChieu = DAI_SAN * tiSaBan(KHUNG)
    expect(rongDaChieu).toBeCloseTo(98.82, 2)
    expect((KHUNG.rong - rongDaChieu) / 2).toBeLessThan(SAU_KHUNG_THANH_MET * tiSaBan(KHUNG))
  })

  it('bề ngang tối thiểu = mặt cỏ đã chiếu + một bán kính đĩa mỗi bên', () => {
    // Đúng công thức `RONG_SA_BAN` của `San3D.tsx`. Hạ `tiSaBan` cho vừa khung
    // 100 là phương án bị loại: nó kéo tụt cả năm con số dọc của spec.
    const toiThieu = DAI_SAN * tiSaBan(KHUNG) + 2 * BAN_KINH_DIA
    expect(toiThieu).toBeCloseTo(104.02, 2)

    const khungSaBan: KhungAnh = { rong: toiThieu, cao: KHUNG.cao, le: BAN_KINH_DIA }
    // Khung thành dựng NGOÀI biên ngang vẫn còn trong ảnh, hai đầu.
    expect(chieuDiem(khungSaBan, -SAU_KHUNG_THANH_MET, 0, 0).x).toBeGreaterThanOrEqual(0)
    expect(
      chieuDiem(khungSaBan, DAI_SAN + SAU_KHUNG_THANH_MET, 0, 0).x,
    ).toBeLessThanOrEqual(toiThieu)
    // Và lề ra đúng bán kính đĩa, đúng điều `tiLeMet` hứa cho sân 2D.
    expect(chieuDiem(khungSaBan, 0, 0, 0).x).toBeCloseTo(BAN_KINH_DIA, 10)
  })
})

describe('chieuDiem — tâm sân cho tâm mặt cỏ, ở MỌI khung', () => {
  const khungKhac: readonly KhungAnh[] = [
    KHUNG,
    { rong: 100, cao: 64, le: 1.7 },
    { rong: 200, cao: 128, le: 5.2 },
    { rong: 320, cao: 100, le: 3 },
  ]

  it('(52,5 ; 34 ; 0) nằm đúng giữa biên gần và biên xa', () => {
    for (const khung of khungKhac) {
      const gan = chieuDiem(khung, TAM_X, 0, 0)
      const xa = chieuDiem(khung, TAM_X, RONG_SAN, 0)
      const tam = chieuDiem(khung, TAM_X, TAM_Y, 0)

      expect(tam.y).toBeCloseTo((gan.y + xa.y) / 2, 10)
      expect(tam.x).toBeCloseTo((khung.rong + 0) / 2, 10)
    }
  })

  it('biên GẦN trùng đúng y vẽ mà sân 2D cho y = 0 m', () => {
    // 61,400 là con số `quyDoiMet.ts` đã ghi sẵn cho `y = 0 m` ở khung chuẩn.
    expect(chieuDiem(KHUNG, TAM_X, 0, 0).y).toBeCloseTo(61.4, 10)
  })
})

describe('dấu từng trục — hai trục cùng đi LÊN màn hình', () => {
  it('xa hơn trên sân thì cao hơn trên ảnh (y vẽ nhỏ hơn)', () => {
    const gan = chieuDiem(KHUNG, TAM_X, 10, 0)
    const xa = chieuDiem(KHUNG, TAM_X, 60, 0)
    expect(xa.y).toBeLessThan(gan.y)
  })

  it('bay cao hơn thì cao hơn trên ảnh (y vẽ nhỏ hơn)', () => {
    const satDat = chieuDiem(KHUNG, TAM_X, TAM_Y, 0)
    const trenKhong = chieuDiem(KHUNG, TAM_X, TAM_Y, 4)
    expect(trenKhong.y).toBeLessThan(satDat.y)
  })

  it('x KHÔNG bị dẹt, và KHÔNG đổi theo y hay z (yaw 0)', () => {
    const a = chieuDiem(KHUNG, 20, 5, 0)
    const b = chieuDiem(KHUNG, 20, 65, 5)
    expect(b.x).toBeCloseTo(a.x, 12)
  })

  it('tăng yMet và tăng zMet KHÔNG cho cùng một kết quả', () => {
    // Chỗ dễ sai nhất của cả spec: hai trục cùng hướng lên, nên một phép chiếu
    // lẫn chúng vẫn vẽ ra hình. Một mét chiều sâu và một mét độ cao phải đi
    // được hai đoạn KHÁC nhau.
    const theoChieuSau = chieuDiem(KHUNG, TAM_X, TAM_Y + 1, 0)
    const theoDoCao = chieuDiem(KHUNG, TAM_X, TAM_Y, 1)
    const goc = chieuDiem(KHUNG, TAM_X, TAM_Y, 0)

    expect(goc.y - theoChieuSau.y).toBeGreaterThan(0)
    expect(goc.y - theoDoCao.y).toBeGreaterThan(0)
    expect(theoChieuSau.y).not.toBeCloseTo(theoDoCao.y, 6)
  })
})

describe('sin vs cos — phép kiểm chốt riêng cho R60', () => {
  it('CHIỀU SÂU đi theo sin(50°), không phải cos', () => {
    const doSau = chieuDiem(KHUNG, TAM_X, 0, 0).y - chieuDiem(KHUNG, TAM_X, RONG_SAN, 0).y
    const theoSin = RONG_SAN * tiSaBan(KHUNG) * Math.sin((GOC_SA_BAN * Math.PI) / 180)
    const theoCos = RONG_SAN * tiSaBan(KHUNG) * Math.cos((GOC_SA_BAN * Math.PI) / 180)

    expect(doSau).toBeCloseTo(theoSin, 10)
    expect(doSau).not.toBeCloseTo(theoCos, 2)
  })

  it('ĐỘ CAO đi theo cos(50°), không phải sin', () => {
    const motMet = doCaoVe(KHUNG, 1)
    const theoCos = HE_SO_CAO * tiSaBan(KHUNG) * Math.cos((GOC_SA_BAN * Math.PI) / 180)
    const theoSin = HE_SO_CAO * tiSaBan(KHUNG) * Math.sin((GOC_SA_BAN * Math.PI) / 180)

    expect(motMet).toBeCloseTo(theoCos, 10)
    expect(motMet).not.toBeCloseTo(theoSin, 2)
  })

  it('ở 50° thì chiều sâu LỚN hơn độ cao cho cùng một mét — vì 50° > 45°', () => {
    // Phép kiểm này đỏ ngay nếu hai hàm bị đảo, và nó không cần biết con số
    // nào: nó chỉ dùng việc GOC_SA_BAN nằm trên 45°.
    expect(GOC_SA_BAN).toBeGreaterThan(45)
    const motMetChieuSau = tiSaBan(KHUNG) * Math.sin((GOC_SA_BAN * Math.PI) / 180)
    const motMetDoCaoChuaPhongDai = doCaoVe(KHUNG, 1) / HE_SO_CAO
    expect(motMetChieuSau).toBeGreaterThan(motMetDoCaoChuaPhongDai)
  })
})

describe('doCaoVe — đơn điệu và thấy được (AC-46.1, AC-46.3)', () => {
  it('z = 0 cho đúng 0', () => {
    expect(doCaoVe(KHUNG, 0)).toBe(0)
  })

  it('tăng NGHIÊM NGẶT trên dải [0 ; 5,26]', () => {
    let truoc = doCaoVe(KHUNG, 0)
    for (let z = 0.01; z <= Z_CAO_NHAT + 1e-9; z += 0.01) {
      const nay = doCaoVe(KHUNG, z)
      expect(nay).toBeGreaterThan(truoc)
      truoc = nay
    }
  })

  it('đã nhân HE_SO_CAO, không nhân thiếu không nhân thừa', () => {
    expect(doCaoVe(KHUNG, 2) / doCaoVe(KHUNG, 1)).toBeCloseTo(2, 12)
    const chuaPhongDai = doCaoVe(KHUNG, 1) / HE_SO_CAO
    expect(doCaoVe(KHUNG, 1)).toBeCloseTo(chuaPhongDai * HE_SO_CAO, 12)
  })

  it('z = 1 m nhấc quả bóng lên HƠN một bán kính của chính nó', () => {
    // Đây là lời hứa trung tâm của US-1, và là lý do HE_SO_CAO tồn tại. Ở tỉ lệ
    // thật con số này là 0,19–0,42 lần bán kính — mắt không thấy.
    const motMet = doCaoVe(KHUNG, 1)
    expect(motMet).toBeGreaterThanOrEqual(BAN_KINH_BONG)
    expect(motMet).toBeCloseTo(1.815, 3)
    expect(motMet / BAN_KINH_BONG).toBeCloseTo(1.07, 2)
  })

  it('z = 5,26 m cho 9,5 đơn vị, tức 14,9% chiều cao ảnh', () => {
    const dinh = doCaoVe(KHUNG, Z_CAO_NHAT)
    expect(dinh).toBeCloseTo(9.5, 1)
    expect((dinh / KHUNG.cao) * 100).toBeCloseTo(14.9, 1)
  })
})

describe('biên — quả bóng cao nhất còn trong KHUNG ẢNH', () => {
  it('z = 5,26 m ở biên xa vẫn còn 0 ≤ y ≤ cao', () => {
    /*
      ⚠️ Kiểm "còn trong KHUNG ẢNH", KHÔNG kiểm "còn trong `GioiHanVe`".
      `viTriVe.ts` ghi rõ `GioiHanVe` là "khung an toàn của MẶT CỎ", và một quả
      bóng bay cao PHẢI vượt khỏi nó — đó đúng là mục đích của trục `z`. Bản đầu
      của T765 viết sai tên khung, `/analyze` bắt được ngày 2026-11-25.
    */
    for (const yMet of [0, TAM_Y, RONG_SAN]) {
      const diem = chieuDiem(KHUNG, TAM_X, yMet, Z_CAO_NHAT)
      expect(diem.y).toBeGreaterThanOrEqual(0)
      expect(diem.y).toBeLessThanOrEqual(KHUNG.cao)
    }
  })

  it('mặt cỏ cộng đỉnh bóng vừa trong 64 đơn vị, còn lề thật', () => {
    const cheNhat = chieuDiem(KHUNG, TAM_X, RONG_SAN, Z_CAO_NHAT).y
    expect(cheNhat).toBeGreaterThan(0)
    expect(cheNhat).toBeCloseTo(2.8, 1)
  })
})

describe('chieuMatSan — hai con số spec đã công bố (T766)', () => {
  const matSan = chieuMatSan(KHUNG)

  it('mặt cỏ chiếm 49,0 đơn vị chiều cao ảnh, tức 77% của 64', () => {
    const gan = matSan.gocMatCo[0]
    const xa = matSan.gocMatCo[3]
    const chieuSau = gan.y - xa.y

    expect(chieuSau).toBeCloseTo(49.0, 1)
    expect((chieuSau / KHUNG.cao) * 100).toBeCloseTo(77, 0)
    expect(matSan.bien.cao).toBeCloseTo(chieuSau, 10)
  })

  it('sân cộng đỉnh bóng ở z = 5,26 là 58,6 và nó ≤ 64', () => {
    const gan = matSan.gocMatCo[0]
    const dinhBong = chieuDiem(KHUNG, TAM_X, RONG_SAN, Z_CAO_NHAT)
    const tong = gan.y - dinhBong.y

    expect(tong).toBeCloseTo(58.6, 1)
    expect(tong).toBeLessThanOrEqual(KHUNG.cao)
    // Còn lề thật, không vừa khít rồi tràn ở số thứ hai sau dấu phẩy.
    expect(KHUNG.cao - tong).toBeCloseTo(5.4, 1)
  })

  it('bốn góc mặt cỏ đúng thứ tự gần-trái → gần-phải → xa-phải → xa-trái', () => {
    const [ganTrai, ganPhai, xaPhai, xaTrai] = matSan.gocMatCo
    expect(ganTrai.x).toBeLessThan(ganPhai.x)
    expect(xaTrai.x).toBeCloseTo(ganTrai.x, 10)
    expect(xaPhai.x).toBeCloseTo(ganPhai.x, 10)
    expect(xaTrai.y).toBeLessThan(ganTrai.y)
    expect(ganTrai.y).toBeCloseTo(ganPhai.y, 10)
  })

  it('vòng tròn giữa là ELLIPSE: ry nhỏ hơn rx đúng hệ số sin', () => {
    const { rx, ry } = matSan.vongGiua
    expect(ry).toBeLessThan(rx)
    expect(ry / rx).toBeCloseTo(Math.sin((GOC_SA_BAN * Math.PI) / 180), 10)
  })

  it('vạch giữa chia đúng đôi chiều dài, và cao đúng bằng mặt cỏ', () => {
    expect(matSan.vachGiua.x).toBeCloseTo(KHUNG.rong / 2, 10)
    expect(matSan.vachGiua.y2 - matSan.vachGiua.y1).toBeCloseTo(matSan.bien.cao, 10)
  })

  it('hai vòng cấm đối xứng, và khung thành dựng NGOÀI biên ngang', () => {
    const [trai, phai] = matSan.vongCam
    expect(trai.rong).toBeCloseTo(phai.rong, 10)
    expect(trai.cao).toBeCloseTo(phai.cao, 10)
    expect(trai.x).toBeCloseTo(matSan.gocMatCo[0].x, 10)
    expect(phai.x + phai.rong).toBeCloseTo(matSan.gocMatCo[1].x, 10)

    const [ktTrai, ktPhai] = matSan.khungThanh
    expect(ktTrai.x).toBeLessThan(matSan.gocMatCo[0].x)
    expect(ktPhai.x).toBeCloseTo(matSan.gocMatCo[1].x, 10)
  })

  it('mọi vạch sân còn trong khung ảnh theo chiều dọc', () => {
    const moiY = [
      ...matSan.gocMatCo.map((g) => g.y),
      matSan.bien.y,
      matSan.bien.y + matSan.bien.cao,
      ...matSan.vongCam.flatMap((o) => [o.y, o.y + o.cao]),
      ...matSan.khungThanh.flatMap((o) => [o.y, o.y + o.cao]),
      ...matSan.chamPhatDen.map((c) => c.y),
    ]
    for (const y of moiY) {
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(KHUNG.cao)
    }
  })
})

/** Một ảnh chụp dựng tay, chỉ để nói về quả bóng. */
function anhChupVoiBong(x: number, y: number, z: number, coMat = 1): AnhChupMet {
  const trong = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat: 1 }
  const thucThe = Array.from({ length: SO_THUC_THE }, () => ({ ...trong }))
  thucThe[CHI_SO_BONG] = { ...trong, x, y, z, coMat }
  return { thucThe, oCuaNguoi: new Map(), nguoiGiuBong: KHONG_AI_GIU_O }
}

describe('viTriBongLienTuc — cả ba trục từ MỘT mốc (T769, D142, AC-46.8)', () => {
  it('bóng sát đất: chỗ vẽ trùng đúng dấu chiếu', () => {
    const b = viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, 0), KHUNG)
    expect(b).not.toBeNull()
    expect(b!.zMet).toBe(0)
    expect(b!.chieu.x).toBeCloseTo(b!.matSan.x, 12)
    expect(b!.chieu.y).toBeCloseTo(b!.matSan.y, 12)
  })

  it('bóng trên không: chỗ vẽ CAO hơn dấu chiếu, và cùng một x', () => {
    const b = viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, 3), KHUNG)!
    expect(b.chieu.y).toBeLessThan(b.matSan.y)
    // Cùng x: bóng rơi thẳng xuống dấu của nó, không lệch ngang.
    expect(b.chieu.x).toBeCloseTo(b.matSan.x, 12)
    // Và đúng bằng `doCaoVe` — không có con số thứ hai ở đâu khác.
    expect(b.matSan.y - b.chieu.y).toBeCloseTo(doCaoVe(KHUNG, 3), 12)
  })

  it('z mang NGUYÊN giá trị của mốc — giao diện không tự đặt con số nào', () => {
    for (const z of [0, 0.4, 1, 2.5, Z_CAO_NHAT]) {
      expect(viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, z), KHUNG)!.zMet).toBe(z)
    }
  })

  it('ba trục ĐẾN TỪ CÙNG một ô — đổi x, y hay z đều dội vào chỗ vẽ', () => {
    const goc = viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, 1), KHUNG)!
    const doiX = viTriBongLienTuc(anhChupVoiBong(TAM_X + 10, TAM_Y, 1), KHUNG)!
    const doiY = viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y + 10, 1), KHUNG)!
    const doiZ = viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, 4), KHUNG)!

    expect(doiX.chieu.x).toBeGreaterThan(goc.chieu.x)
    expect(doiY.chieu.y).toBeLessThan(goc.chieu.y)
    expect(doiZ.chieu.y).toBeLessThan(goc.chieu.y)
    // Dấu chiếu KHÔNG đổi theo z — nó là bóng đổ trên mặt cỏ.
    expect(doiZ.matSan.y).toBeCloseTo(goc.matSan.y, 12)
  })

  it('ô bóng không có mặt thì trả null — người gọi hiểu là không vẽ bóng', () => {
    expect(viTriBongLienTuc(anhChupVoiBong(TAM_X, TAM_Y, 2, 0), KHUNG)).toBeNull()
  })

  it('quả tạt cao nhất của engine vẫn còn trong khung ảnh', () => {
    const b = viTriBongLienTuc(anhChupVoiBong(TAM_X, RONG_SAN, Z_CAO_NHAT), KHUNG)!
    expect(b.chieu.y).toBeGreaterThan(0)
    expect(b.chieu.y).toBeLessThanOrEqual(KHUNG.cao)
    // Và nó cao hơn dấu của nó ĐÚNG 9,5 đơn vị — con số spec đã công bố.
    expect(b.matSan.y - b.chieu.y).toBeCloseTo(9.5, 1)
  })
})

describe('thuTuDoSau — xa vẽ trước, gần vẽ sau (T770, D137)', () => {
  it('trả chỉ số theo thứ tự XA → GẦN', () => {
    // `y` vẽ nhỏ = ở xa. Vào lộn xộn, ra phải tăng dần theo `y`.
    const diem = [
      { x: 0, y: 50 },
      { x: 0, y: 10 },
      { x: 0, y: 30 },
    ]
    expect(thuTuDoSau(diem)).toEqual([1, 2, 0])
  })

  it('dựng từ toạ độ sân thật: người ở biên xa đứng đầu danh sách', () => {
    const gan = chieuDiem(KHUNG, TAM_X, 2, 0)
    const giua = chieuDiem(KHUNG, TAM_X, TAM_Y, 0)
    const xa = chieuDiem(KHUNG, TAM_X, RONG_SAN - 2, 0)
    expect(thuTuDoSau([gan, giua, xa])).toEqual([2, 1, 0])
  })

  it('ỔN ĐỊNH: hai độ sâu bằng nhau thì giữ nguyên thứ tự vào', () => {
    /*
      Đây là mệnh đề chống NHẤP NHÁY, không phải chống xấu. Hai người đứng
      ngang nhau mà thứ tự đảo qua lại giữa hai khung hình thì hai đĩa chồng
      nhau chớp liên tục — và nó chỉ xảy ra đúng lúc khó lần ra nhất.
    */
    const ngang = Array.from({ length: 6 }, () => ({ x: 0, y: 25 }))
    expect(thuTuDoSau(ngang)).toEqual([0, 1, 2, 3, 4, 5])

    // Gọi nhiều lần trên cùng một đầu vào cho đúng một kết quả.
    const lan1 = thuTuDoSau(ngang)
    const lan2 = thuTuDoSau(ngang)
    expect(lan2).toEqual(lan1)
  })

  it('ổn định cả khi chỉ MỘT phần bằng nhau', () => {
    const diem = [
      { x: 0, y: 20 },
      { x: 0, y: 10 },
      { x: 0, y: 20 },
      { x: 0, y: 10 },
    ]
    expect(thuTuDoSau(diem)).toEqual([1, 3, 0, 2])
  })

  it('KHÔNG sửa mảng vào, và danh sách rỗng cho danh sách rỗng', () => {
    const diem = [
      { x: 0, y: 9 },
      { x: 0, y: 1 },
    ]
    const banSao = [...diem]
    thuTuDoSau(diem)
    expect(diem).toEqual(banSao)
    expect(thuTuDoSau([])).toEqual([])
  })

  it('là một HOÁN VỊ: mỗi chỉ số xuất hiện đúng một lần', () => {
    const diem = Array.from({ length: 22 }, (_, i) => chieuDiem(KHUNG, i * 4, (i * 7) % 68, 0))
    const thuTu = thuTuDoSau(diem)
    expect(thuTu).toHaveLength(22)
    expect([...thuTu].sort((a, b) => a - b)).toEqual(Array.from({ length: 22 }, (_, i) => i))
  })
})

describe('HE_SO_CAO sống ở ĐÚNG MỘT chỗ (T791, AC-46.6, D133)', () => {
  /*
    Hệ số phóng đại là con số DUY NHẤT trong dự án cố ý nói sai sự thật về hình
    học. Một bản sao thứ hai của nó là chỗ để màn hình nói ×3 trong khi phép
    chiếu vẽ ×2 — và không gì đỏ.

    Đọc nguồn thật bằng `import.meta.glob` + `?raw`, đúng khuôn `coHoc.test.ts`
    đã đặt: chép lại danh sách file vào đây là tạo thêm một bản sao nữa.
  */
  const NGUON = import.meta.glob('../**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  /** Bóc chú thích, đúng khuôn `chiCode` của `coHoc.test.ts`. */
  function chiCode(nguon: string): string {
    return nguon
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
  }

  /** Lấy nguồn theo HẬU TỐ đường dẫn — khoá của `import.meta.glob` đã chuẩn hoá. */
  function nguonCua(duoi: string): string {
    const khoa = Object.keys(NGUON).find((k) => k.endsWith(duoi))
    expect(khoa, `không tìm thấy nguồn kết thúc bằng ${duoi}`).toBeDefined()
    return NGUON[khoa!]!
  }

  it('chỉ MỘT file gán giá trị cho HE_SO_CAO', () => {
    const ganO = Object.entries(NGUON)
      .filter(([, m]) => /HE_SO_CAO\s*=\s*\d/.test(chiCode(m)))
      .map(([f]) => f.replace(/^.*\//, ''))
    expect(ganO).toEqual(['chieuSaBan.ts'])
  })

  it('và chỉ gán ĐÚNG MỘT lần trong file ấy', () => {
    const soLan = (chiCode(nguonCua('/chieuSaBan.ts')).match(/HE_SO_CAO\s*=\s*\d/g) ?? [])
      .length
    expect(soLan).toBe(1)
  })

  it('chống rỗng: phép kiểm có thật sự đọc được nguồn không', () => {
    expect(Object.keys(NGUON).length).toBeGreaterThan(50)
    expect(nguonCua('/chieuSaBan.ts')).toContain('HE_SO_CAO')
  })

  it('hai tệp ngôn ngữ KHÔNG viết thẳng hệ số vào câu chữ', () => {
    /*
      `doCaoDaPhongDai` nhận hệ số bằng THAM SỐ. Viết thẳng "×3" vào `vi.ts` và
      `en.ts` là đẻ thêm hai bản sao mà phép kiểm trên không bắt được, vì chúng
      không có chữ `HE_SO_CAO` nào.
    */
    for (const f of ['/ngonNgu/vi.ts', '/ngonNgu/en.ts']) {
      expect(chiCode(nguonCua(f)), f).not.toMatch(/[×x]\s*3\b/)
    }
  })
})
