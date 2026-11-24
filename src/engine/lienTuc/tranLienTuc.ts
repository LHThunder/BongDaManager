import type { LoaiHanhDong } from '../chuoiBong'
import { TAM_X, TAM_Y } from '../hinhHocSan'
import {
  dieuKienTuMaTran,
  gioCoAnVaoDuongBong,
  type DieuKienTran,
} from './dieuKien'
import {
  bongTaiThoiDiem,
  dinhQuyDao,
  gocPhatTatCanh,
  phatBong,
  quangLechGio,
  thoiGianBay,
  tocDoDuongBong,
  type TrangThaiBayBong,
} from './vatLyBong'
import {
  buocCoHoc,
  tachChen,
  TRAN_TOC_DO_TUYET_DOI,
  viTriTrongTai,
  type Diem,
  type TrangThaiCoHoc,
} from './coHoc'
import { choDungMet, dichNguoiKhongBong, tamVungMet } from './viTriMet'
import {
  buocTiep,
  type CauHinhTran,
  CHE_DO_MAC_DINH,
  type CheDoMoPhong,
  doiHinhTrenSan,
  type KetCucPhaV6,
  taoTran,
  tongPhutTran,
  type TrangThaiTran,
} from '../tran'
import {
  type BoCucPha,
  boCucPha,
  BUOC_MOI_CHUOI,
  BUOC_MOI_HANH_DONG,
  dienChuoiRaMoc,
} from './dienPha'
import { hatGiongDong, RUT_MOI_MOC } from './hatGiong'
import {
  CHI_SO_BONG,
  CHI_SO_TRO_LY_1,
  CHI_SO_TRO_LY_2,
  CHI_SO_TRONG_TAI,
  BUOC_MOI_PHUT,
  SO_THUC_THE,
} from './moc'
import {
  KHONG_AI_GIU,
  type LoMoc,
  taoLoMoc,
  type ThucTheTaiMoc,
} from './loMoc'

/*
  Vòng ngoài của engine liên tục: MỘT PHÚT một bước (T704, D119 + D136).

  CÁCH NÓ CHẠY, và vì sao không có một dòng luật nào ở đây:

  `taoTranLienTuc` gọi `taoTran` của v6 rồi đặt `hatGiong` về **dòng rút 1**
  (`hatGiongDong(ma, 1)`). `buocPhutLienTuc` gọi thẳng `buocTiep`, kèm một
  **callback quan sát** nhận `KetCucPhaV6` của từng pha bóng.

  Nhờ vậy hai chế độ chạy **cùng một code luật** trên **hai dòng rút khác
  nhau**: mọi luật — huỷ trận (AC-14.5), dòng riêng cho huỷ trận (AC-14.6),
  hết hiệp, kiệt sức, thẻ, thống kê — là đúng code của v6, không phải một bản
  gần giống rồi sẽ trôi. Và vì hai dòng rút khác nhau, một trận cụ thể ra tỉ số
  khác — đúng như **AC-45.3** phát biểu.

  Vì sao đặt hạt giống được: `maTran` chỉ dùng để rút ở **đúng một chỗ** trong
  `tran.ts` (`taoTran`), còn `buocTiep` lấy hạt giống **thuần từ `tt.hatGiong`**.
  Nên bù giờ và dòng mở đầu giống chế độ phút (cùng độ dài trận), còn từ pha
  bóng đầu tiên thì hai chế độ rẽ nhau.

  ⚠️ CHUYỂN ĐỘNG CHƯA CÓ Ở ĐÂY. Vị trí thực thể đến từ Phase 54 (cơ học) và
  T706 (bốn pha con lấp 20 giây). T704 dựng **lưới mốc, lô, đồng hồ và dòng
  rút**; mốc phát ra hôm nay mang toạ độ 0 và chỉ `coMat` là thật. Trường
  `rutMoiMoc` dưới đây là **dụng cụ đo** cho dải rút, cài sẵn từ bây giờ để khi
  chuyển động đến thì ngưỡng 64 có người canh.
*/

/** Engine liên tục mang số phiên bản RIÊNG, không đụng `PHIEN_BAN_ENGINE`. */
export const PHIEN_BAN_ENGINE_LIEN_TUC = 101

/**
 * Chế độ mô phỏng đã sinh ra một trạng thái trận.
 *
 * **Dẫn xuất, không cất.** `TrangThaiTran` đóng băng ở đúng 16 trường (D119),
 * nên chế độ không vào được trạng thái; và cất nó ở store sẽ là nguồn sự thật
 * thứ hai. `phienBanEngine` đã có sẵn trong trạng thái, đã đi vào bản ghi, và
 * **đã là** thứ `lyDoKhongDauLai` so — nên nó là chỗ hợp lẽ nhất để hỏi.
 *
 * Hệ quả cố ý: bản ghi nói ĐÚNG engine nào đã chạy, chứ không nói người dùng
 * đã bấm gì. Hôm nay `batDauTranNgay` còn gọi `taoTran` cho cả hai chế độ, nên
 * một trận người dùng chọn "liên tục" vẫn lưu ra `co-dien` — và đó là sự thật,
 * vì engine liên tục chưa được nối vào giao diện (T733). Nếu thay vào đó ta ghi
 * thẳng lựa chọn của người dùng thì bản ghi sẽ nói "liên tục" trong khi mang số
 * 6, và nó **không đấu lại được** — một bản ghi nói dối về chính nó.
 */
export function cheDoCuaTrangThai(tt: TrangThaiTran): CheDoMoPhong {
  return tt.phienBanEngine === PHIEN_BAN_ENGINE_LIEN_TUC
    ? 'lien-tuc'
    : CHE_DO_MAC_DINH
}

/** Trạng thái trận ở chế độ liên tục: **bọc** trạng thái v6, thêm đồng hồ mốc. */
export interface TrangThaiLienTuc {
  /** Trạng thái v6, nhưng chạy trên dòng rút 1. */
  readonly tran: TrangThaiTran
  readonly maTran: string
  /** Số nửa giây đã trôi từ tiếng còi khai cuộc. */
  readonly chiSoMoc: number
  /**
   * Trạng thái cơ học của **26 thực thể**, mang qua từng phút (T725).
   *
   * Phải sống ở đây chứ không dựng lại mỗi phút: một người đang chạy 7 m/s ở
   * giây cuối của phút 10 vẫn đang chạy 7 m/s ở giây đầu của phút 11. Dựng lại
   * từ 0 mỗi phút là cho cả sân **đứng khựng rồi lao đi** 90 lần một trận, và
   * phép kẹp gia tốc của AC-38.2 sẽ vỡ ở đúng ranh giới phút.
   *
   * KHÔNG vào bản ghi trận: AC-45.4 nói rõ vị trí **không được lưu**, nó sinh
   * lại từ mã trận. Đây là trạng thái lúc chạy, không phải dữ liệu.
   */
  readonly coHoc: readonly TrangThaiCoHoc[]
  /**
   * Thời tiết và gió của trận — dẫn xuất từ mã trận, **không** vào bản ghi.
   *
   * Mang theo thay vì băm lại ở mỗi mốc: một trận có ~5.400 mốc, và hàm băm là
   * thuần nên băm lại luôn ra đúng con số ấy — mang theo chỉ để khỏi băm 5.400
   * lần. `DB_VERSION` giữ 3, đúng AC-45.4.
   */
  readonly dieuKien: DieuKienTran
}

/** Một phút đã mô phỏng: trạng thái sau, lô mốc, và số lần rút mỗi mốc. */
export interface MotPhutLienTuc {
  readonly tt: TrangThaiLienTuc
  readonly lo: LoMoc
  /** Số lần rút dòng CƠ HỌC mà mỗi mốc trong lô đã tiêu. */
  readonly rutMoiMoc: readonly number[]
  /** Kết cục ba pha bóng của phút này, theo đúng thứ tự. */
  readonly cacPha: readonly KetCucPhaV6[]
}

export function taoTranLienTuc(cauHinh: CauHinhTran): TrangThaiLienTuc {
  const tran = taoTran(cauHinh)
  return {
    /*
      ⚠️ `phienBanEngine` phải đổi theo, không chỉ `hatGiong`.

      Bản đầu của T704 chỉ đè hạt giống, nên trạng thái liên tục mang số **6**
      của v6. Mà `phienBanEngineHienTaiCua('lien-tuc')` trả **101** và
      `lyDoKhongDauLai` so bằng `!==` — nên MỌI trận liên tục vừa lưu xong là
      mất ngay nút đấu lại, đúng thứ mà hai số phiên bản riêng sinh ra để
      tránh. Phép kiểm ở `matchRepo.test.ts` đã ĐỎ trước khi dòng này tồn tại.

      Và nó là chỗ DUY NHẤT nói "trạng thái này do engine nào sinh ra":
      `TrangThaiTran` đóng băng ở đúng 16 trường (D119) nên không nhận thêm
      một trường chế độ, còn nhớ chế độ ở store là dựng nguồn sự thật thứ
      hai — rồi hai nguồn ấy lệch nhau mà không ai biết.
    */
    tran: {
      ...tran,
      hatGiong: hatGiongDong(cauHinh.maTran, 1),
      phienBanEngine: PHIEN_BAN_ENGINE_LIEN_TUC,
    },
    maTran: cauHinh.maTran,
    chiSoMoc: 0,
    coHoc: coHocXuatPhat(tran),
    dieuKien: dieuKienTuMaTran(tran.maTran),
  }
}


/*
  ====================================================================
  NỐI CƠ HỌC VÀO VÒNG PHÚT (T725).
  ====================================================================

  Trước lát này, `dienChuoiRaMoc` ghi vào lô bằng `thucTheRong` — 26 ô mang
  `x = y = 0` ở **mọi** mốc. Cả lớp cơ học của Phase 54 (`coHoc.ts`) không có
  một người gọi nào: `grep -rn "buocCoHoc" src/` ngoài chính file nó và test
  của nó ra **rỗng**. Ba thứ đứng trên chỗ nối này — điều kiện ra của **T716**,
  vòng rAF của **T733**, và phép đo của **T742**.

  ⚠️ **Mô hình đích ở đây là TỐI THIỂU có chủ ý** — xem khối chú thích đầu
  `viTriMet.ts`. Hình khối đội hình là **US-40 của spec 009**.
*/

/**
 * Số ô NGƯỜI trong lô: 22, tức 11 mỗi bên.
 *
 * Dẫn xuất từ chỉ số ô trọng tài chứ không gõ tay 22: bố cục 26 ô là quy ước
 * của `moc.ts`, và viết lại một con số của nó ở đây là dựng nguồn sự thật thứ
 * hai — đúng thứ sẽ lệch ở lần sửa bố cục sau.
 */
const SO_NGUOI_TREN_SAN = CHI_SO_TRONG_TAI

/** Bước tích phân, nửa giây — đúng lưới mốc của D119. */
const DT_MOC = 0.5

/*
  ====================================================================
  QUẢ BÓNG ĐI THEO VẬT LÝ CỦA NÓ, KHÔNG ĐI NHƯ MỘT NGƯỜI (T726).
  ====================================================================

  Trước lát này ô bóng bước qua chính `buocCoHoc` với một trần tạm 25 m/s, mà
  `buocCoHoc` kẹp lại `TRAN_TOC_DO_TUYET_DOI` = 9 m/s — tức **một đường chuyền
  dài bay chậm hơn người chạy**, cột `z`/`vz` của cả 26 ô là **0 ở mọi mốc**, và
  nợ của T706 ("không đường chuyền nào dưới sàn 12 m/s của AC-38.6") treo nguyên.

  ⚠️ **MỘT ĐOẠN GIAO BÓNG LÀ MỘT LẦN RỜI CHÂN, VÀ NÓ TỚI ĐÍCH ĐÚNG GIÂY `d/v`.**
  Trong một đoạn, quả bóng đi **tốc độ không đổi** — không có ma sát mặt sân —
  vì AC-38.6 nói thời gian bay **phải khớp** khoảng cách chia tốc độ, và đó là
  một mệnh đề **tuyệt đối**. Một quả bóng vừa bị ma sát hãm vừa phải tới đúng
  giây `d/v` là hai điều không cùng đúng được.

  ⚠️ **Hệ quả phải nói thẳng: `MA_SAT_LAN_SET` của AC-38.7 CHƯA có người gọi
  trong vòng phút.** Mô hình pha bóng của `dienPha.ts` không có trạng thái "bóng
  lăn tự do": mỗi hành động **giao** bóng tới một vùng, và `vungKetThuc` là chỗ
  pha bóng kết thúc **theo định nghĩa**. Ma sát chỉ có việc khi có một quả bóng
  **không ai điều khiển** — thứ spec 008 mang vào cùng luật IFAB (ném biên, phát
  bóng, bóng bật ra). Hôm nay nó được canh ở mức **hàm thuần**, 5 phép kiểm
  trong `vatLyBong.test.ts`, và **T742** đo lại trên tệp xuất.

  Gió thì **có** người gọi: quả tạt dài hơn 25 m và bổng hơn 1,5 m đi lệch
  `HE_SO_GIO × tocDoGio × thờiGianBay`.
*/

/** Một đoạn giao bóng: một lần rời chân, và đích của nó. */
interface DoanGiaoBong {
  /**
   * Định danh đoạn — đổi mã nghĩa là một lần **rời chân** mới.
   *
   * Mang theo **chỉ số pha**, không chỉ tên đoạn. 🐞 Bản đầu đặt lại
   * `doanBong = null` ở đầu mỗi pha để hai pha liền nhau không dùng chung mã
   * `'len'`; một phép đột biến xoá dòng ấy mà **29/29 phép kiểm vẫn xanh**, vì
   * mọi pha đều kết ở đoạn `'ket'` nên mã **tình cờ** luôn khác. Một dòng chỉ
   * đúng nhờ may là một dòng không ai canh: mã có chỉ số pha thì nó đúng **theo
   * cấu trúc**, và dòng đặt lại biến mất.
   */
  readonly ma: string
  readonly den: Diem
  readonly phat: TrangThaiBayBong
  /** Bước (nửa giây) trong pha mà đoạn này bắt đầu. */
  readonly buocBatDau: number
  readonly quang: number
  readonly giayBay: number
  /** Quãng gió thổi lệch trong cả đoạn, mét — 0 nếu hai cửa gió không mở. */
  readonly lechGioCuoi: number
}

/**
 * Dãy điểm quả bóng đi qua trong một pha: mỗi hành động một điểm, rồi điểm kết.
 *
 * `cacHanhDong[i]` là một hành động **xảy ra tại** `vung[i]`, nên đoạn thứ `i`
 * mang bóng từ điểm `i` sang điểm `i + 1`, và đoạn cuối mang nó tới
 * `vungKetThuc`. Pha không có hành động nào thì chỉ còn đúng điểm kết.
 */
function cacDiemCuaPha(pha: KetCucPhaV6): readonly Diem[] {
  return [
    ...pha.kq.cacHanhDong.map((h) => tamVungMet(h.vung, pha.doi)),
    tamVungMet(pha.kq.vungKetThuc, pha.doi),
  ]
}

/** Mô tả đoạn đang diễn ở bước `b`, hoặc `null` khi bóng đã nằm yên. */
function moTaDoanTaiBuoc(
  pha: KetCucPhaV6,
  boCuc: BoCucPha,
  b: number,
  chiSoPha: number,
): { ma: string; den: Diem; loai: LoaiHanhDong; buocBatDau: number } | null {
  const cac = pha.kq.cacHanhDong
  const diem = cacDiemCuaPha(pha)

  if (b < boCuc.lenBong) {
    return {
      ma: `${chiSoPha}:len`,
      den: diem[0]!,
      loai: 'chuyen',
      buocBatDau: 0,
    }
  }
  if (b < boCuc.lenBong + boCuc.chuoi && cac.length > 0) {
    const i = Math.min(
      cac.length - 1,
      Math.floor((b - boCuc.lenBong) / BUOC_MOI_HANH_DONG),
    )
    return {
      ma: `${chiSoPha}:c${i}`,
      den: diem[i + 1]!,
      loai: cac[i]!.loai,
      buocBatDau: boCuc.lenBong + i * BUOC_MOI_HANH_DONG,
    }
  }
  if (b < boCuc.lenBong + boCuc.chuoi + boCuc.ketCuc) {
    /*
      Kết cục là **lần giao cuối**: nó mang bóng tới `vungKetThuc`. Nếu đoạn
      chuỗi đã đưa bóng tới đó rồi thì quãng bằng 0 và quả bóng chỉ nằm yên —
      không phải một ca riêng, chỉ là một đoạn dài 0 mét.
    */
    return {
      ma: `${chiSoPha}:ket`,
      den: diem[diem.length - 1]!,
      loai: pha.kq.ketCuc === 'dut-diem' ? 'sut' : 'chuyen',
      buocBatDau: boCuc.lenBong + boCuc.chuoi,
    }
  }
  // Bóng chết: quả bóng nằm đúng chỗ nó dừng, không ai giữ (AC-37.6).
  return null
}

/** Dựng một đoạn giao bóng từ chỗ bóng đang nằm tới đích của đoạn. */
function dungDoan(
  moTa: { ma: string; den: Diem; loai: LoaiHanhDong; buocBatDau: number },
  tu: Diem,
  dieuKien: DieuKienTran,
): DoanGiaoBong {
  const quang = Math.hypot(moTa.den.x - tu.x, moTa.den.y - tu.y)
  const v = tocDoDuongBong(quang, moTa.loai)
  /*
    Chỉ quả tạt được nâng lên. D129 đã **đo** rồi mới chốt: `tat-canh` là hành
    động duy nhất có `z` vượt 1,5 m (3.138/37.202 bước không-sút = 8,4%).
  */
  const goc = moTa.loai === 'tat-canh' ? gocPhatTatCanh(quang, v) : 0
  const phat = phatBong(tu, moTa.den, moTa.loai, goc)
  const giayBay = quang === 0 ? 0 : thoiGianBay(quang, v)
  const coGio = gioCoAnVaoDuongBong(dinhQuyDao(phat), quang)
  return {
    ma: moTa.ma,
    den: moTa.den,
    phat,
    buocBatDau: moTa.buocBatDau,
    quang,
    giayBay,
    lechGioCuoi: coGio ? quangLechGio(dieuKien, giayBay) : 0,
  }
}

/**
 * Quả bóng ở giây thứ `giay` của một đoạn giao bóng.
 *
 * Tới đích rồi thì **nằm ở đích** — quả bóng đã vào chân người nhận, nó không
 * lăn tiếp qua chân anh ta. Gió cộng vào theo **thời gian trên không**, nên chỗ
 * nằm cuối đoạn cũng mang đủ phần lệch ấy: không có bước nhảy ở giây `d/v`.
 */
function bongTrongDoan(
  doan: DoanGiaoBong,
  giay: number,
  dieuKien: DieuKienTran,
): TrangThaiBayBong {
  const t = Math.min(Math.max(0, giay), doan.giayBay)
  const bay = bongTaiThoiDiem(doan.phat, t)
  const phanGio =
    doan.giayBay === 0 ? 0 : (doan.lechGioCuoi * t) / doan.giayBay
  const gocGio = (dieuKien.huongGio * Math.PI) / 180
  const daToi = giay >= doan.giayBay
  return {
    x: bay.x + Math.cos(gocGio) * phanGio,
    y: bay.y + Math.sin(gocGio) * phanGio,
    z: bay.z,
    vx: daToi ? 0 : bay.vx,
    vy: daToi ? 0 : bay.vy,
    vz: daToi ? 0 : bay.vz,
  }
}

/** Một thực thể đứng yên tại chỗ, hướng nhìn về phía trước sân. */
function dung(x: number, y: number, huong = 0): TrangThaiCoHoc {
  return { x, y, vx: 0, vy: 0, huong }
}

/**
 * Chỗ đứng xuất phát của 26 thực thể, theo sơ đồ hai đội.
 *
 * Ô 0–10 đội nhà, 11–21 đội khách, 22–24 trọng tài, 25 quả bóng — đúng bố cục
 * mà `moc.ts` đặt. Ô của người đã rời sân vẫn có chỗ đứng; `coMat` mới là thứ
 * nói họ có trên sân hay không.
 */
function coHocXuatPhat(tran: TrangThaiTran): readonly TrangThaiCoHoc[] {
  const ra: TrangThaiCoHoc[] = []
  for (const ben of ['nha', 'khach'] as const) {
    const doiHinh = doiHinhTrenSan(tran.ben[ben])
    for (let o = 0; o < 11; o += 1) {
      const v = doiHinh[o]
      const cho = v
        ? choDungMet(v.viTriO, ben)
        : { x: ben === 'nha' ? 1 : DAI_SAN_TAM * 2 - 1, y: TAM_Y }
      ra.push(dung(cho.x, cho.y, ben === 'nha' ? 0 : 180))
    }
  }
  /*
    Ba điểm trọng tài bắt đầu ở ĐÚNG CHỖ của họ, không ở giữa sân (T716).

    Hai trợ lý xuất phát ngang hàng thủ của đội mình phụ trách. Cho họ bắt đầu ở
    giữa sân thì mệnh đề (c) của AC-38.10 vỡ suốt mấy chục giây đầu: họ chạy 9
    m/s mà phải vượt gần 30 m, và đo được **lệch tới 14,6 m**.
  */
  const dauTran = viTriTrongTai(
    { x: TAM_X, y: TAM_Y },
    null,
    hangThuCuoiCua(ra),
    { x: TAM_X, y: TAM_Y },
  )
  ra.push(dung(dauTran.trongTai.x, dauTran.trongTai.y))
  ra.push(dung(dauTran.troLy1.x, dauTran.troLy1.y))
  ra.push(dung(dauTran.troLy2.x, dauTran.troLy2.y))
  // Quả bóng ở chấm giao bóng.
  ra.push(dung(TAM_X, TAM_Y))
  return ra
}

/** Tâm sân theo trục dọc, để khỏi import thêm một hằng số chỉ dùng một lần. */
const DAI_SAN_TAM = TAM_X

/**
 * `x` của **hậu vệ thứ hai từ dưới lên** của mỗi đội — mệnh đề (c) của AC-38.10.
 *
 * Thứ HAI chứ không phải thứ nhất, vì người sâu nhất là **thủ môn**: trợ lý
 * biên bám hậu vệ cuối cùng **ngoài thủ môn**, đó là đường việt vị của bóng đá
 * thật. Lấy người sâu nhất thì hai trợ lý đứng cạnh hai khung thành cả trận.
 */
function hangThuCuoiCua(
  coHoc: readonly TrangThaiCoHoc[],
): { nha: number; khach: number } {
  const xNha = coHoc.slice(0, 11).map((t) => t.x).sort((a, b) => a - b)
  const xKhach = coHoc.slice(11, 22).map((t) => t.x).sort((a, b) => b - a)
  return {
    nha: xNha[1] ?? xNha[0] ?? TAM_X,
    khach: xKhach[1] ?? xKhach[0] ?? TAM_X,
  }
}
/**
 * Ô của người đang giữ bóng trong một pha, theo bố cục 26 ô của `loMoc`.
 *
 * Ô 0–10 là người trên sân của đội NHÀ, 11–21 của đội KHÁCH. Tra trong
 * `pha.benCong.trenSan` — tức đội hình **lúc pha ấy diễn ra** — chứ không
 * trong trạng thái cuối phút: một thẻ đỏ ở chuỗi thứ nhất sẽ làm danh sách
 * cuối phút ngắn hơn, và tra ở đó là tra lệch ô.
 *
 * Không tìm thấy thì trả `KHONG_AI_GIU`: người kết thúc có thể là `null` khi
 * danh sách ứng viên rỗng — `nguoiTaiVung` trả `null` trước khi rút, đúng lý
 * do loại (c) của D118.
 */
function oCuaNguoiGiu(pha: KetCucPhaV6): number {
  const id = pha.gan.nguoiKetThuc
  if (id === null) return KHONG_AI_GIU

  const viTri = pha.benCong.trenSan.indexOf(id)
  if (viTri < 0 || viTri >= 11) return KHONG_AI_GIU
  return pha.doi === 'nha' ? viTri : 11 + viTri
}

/** Thực thể chưa có chuyển động: đứng ở gốc, chỉ `coMat` là thật. */
function thucTheRong(coMat: number): ThucTheTaiMoc {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, huong: 0, coMat }
}

/**
 * 26 thực thể của một mốc.
 *
 * Ô 0–10 là người trên sân của đội nhà, 11–21 của đội khách, 22–24 ba trọng
 * tài, 25 quả bóng. `coMat = 0` ở ô không có ai — sau một thẻ đỏ thì một ô của
 * bên ấy tắt, và đó là thứ duy nhất ở mốc hôm nay mang tin thật.
 */
function cacThucTheCuaMoc(tran: TrangThaiTran): readonly ThucTheTaiMoc[] {
  const ra: ThucTheTaiMoc[] = []
  for (const ben of [tran.ben.nha, tran.ben.khach]) {
    for (let i = 0; i < 11; i += 1) {
      ra.push(thucTheRong(i < ben.trenSan.length ? 1 : 0))
    }
  }
  /*
    Ba trọng tài và quả bóng. Khẳng định chỉ số từng ô thay vì chỉ `push`: nó
    biến bố cục lô thành một bất biến ĐƯỢC KIỂM, nên nếu ai đổi một hằng số ở
    `moc.ts` mà quên chỗ này thì nó ném lỗi ngay thay vì ghi lệch ô.
  */
  for (const chiSo of [
    CHI_SO_TRONG_TAI,
    CHI_SO_TRO_LY_1,
    CHI_SO_TRO_LY_2,
    CHI_SO_BONG,
  ]) {
    if (ra.length !== chiSo) {
      throw new Error(
        `ô thứ ${ra.length} không khớp hằng số ${chiSo} của moc.ts`,
      )
    }
    ra.push(thucTheRong(1))
  }

  if (ra.length !== SO_THUC_THE) {
    throw new Error(`dựng ${ra.length} thực thể, phải đúng ${SO_THUC_THE}`)
  }
  return ra
}

/**
 * Mô phỏng MỘT phút trận và trả lô mốc của phút ấy.
 *
 * Trận đã kết thúc thì trả lô rỗng, đúng khuôn `buocTiep` trả `ttVao` khi
 * `ketThuc` — không ném lỗi, để vòng ngoài khỏi phải kiểm hai lần.
 */
export function buocPhutLienTuc(ttVao: TrangThaiLienTuc): MotPhutLienTuc {
  const lo = taoLoMoc(BUOC_MOI_PHUT)

  if (ttVao.tran.ketThuc) {
    return { tt: ttVao, lo, rutMoiMoc: [], cacPha: [] }
  }

  const cacPha: KetCucPhaV6[] = []
  const tranSau = buocTiep(ttVao.tran, (pha) => {
    cacPha.push(pha)
  })

  /*
    Phát mốc, một cửa sổ chuỗi mỗi lần, qua `dienChuoiRaMoc` của T706.

    Hôm nay chỉ phát mốc THƯỜNG (bước chẵn, 1 giây một mốc); mốc lẻ của tình
    huống quan trọng là T731, và nó là quyết định CHỈ Ở ĐẦU RA nên nó không dịch
    một lần rút nào.
  */
  const rutMoiMoc: number[] = []
  const mocDau = ttVao.chiSoMoc
  const coMat = cacThucTheCuaMoc(tranSau).map((t) => t.coMat)

  /*
    Chỗ đứng theo sơ đồ của 22 ô người, tính MỘT lần cho cả phút.

    Lấy từ đội hình **sau** khi phút ấy chạy xong: một người bị thẻ đỏ giữa
    phút không còn trong danh sách, và ô của anh ta rơi về chỗ đứng cũ — đúng,
    vì `coMat` mới là thứ nói anh ta còn trên sân hay không.
  */
  const choDung: Diem[] = []
  for (const ben of ['nha', 'khach'] as const) {
    const doiHinh = doiHinhTrenSan(tranSau.ben[ben])
    for (let o = 0; o < 11; o += 1) {
      const v = doiHinh[o]
      choDung.push(
        v ? choDungMet(v.viTriO, ben) : { x: TAM_X, y: TAM_Y },
      )
    }
  }

  /** Trạng thái cơ học đang chạy — bước qua từng mốc, mang sang phút sau. */
  let coHoc = [...ttVao.coHoc]

  /*
    Quả bóng có trạng thái **riêng**, không nằm trong `coHoc`, vì nó có thêm `z`
    và `vz` mà một ô người không có. Nó khởi từ đúng chỗ ô bóng của phút trước
    đang đứng, nên không có bước nhảy ở ranh giới phút.
  */
  const oBongVao = ttVao.coHoc[CHI_SO_BONG]
  let bong: TrangThaiBayBong = {
    x: oBongVao?.x ?? TAM_X,
    y: oBongVao?.y ?? TAM_Y,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
  }
  /** Đoạn giao bóng đang diễn; `null` ở đầu mỗi pha và khi bóng chết. */
  let doanBong: DoanGiaoBong | null = null

  /*
    ⚠️ **Chỉ số mốc ĐÃ GHI gần nhất, để biết một bước cơ học dài bao nhiêu giây.**

    🐞 Đây là chỗ một lỗi thật sống từ T725 tới giờ. `thucTheTaiMoc` chỉ được gọi
    ở những mốc **được ghi**, mà ở phần thường chúng cách nhau **1 giây** (120
    bước tích phân mỗi phút nhưng chỉ 60 mốc được ghi) — trong khi phép bước lại
    dùng cứng `DT_MOC = 0,5`. Hệ quả đo được trên 3 trận: quãng một người đi giữa
    hai mốc chỉ bằng **0,478** lần `v × Δt`, tức **đúng một nửa**. Vận tốc ghi
    trong lô nói 9 m/s còn vị trí thì đi 4,5.

    Nó không vỡ một AC nào — trần tốc độ vẫn 9, trần gia tốc vẫn đạt — nên không
    phép kiểm nào thấy. Nhưng **T731 làm nó lộ ra ngay**: cửa sổ dày gọi hàm này
    ở **mọi** bước, nên người sẽ **chạy nhanh gấp đôi** ở đúng những pha quan
    trọng. Và **T742** sẽ đo `Δquãng/Δt` **trên tệp xuất** rồi thấy nó bằng nửa
    cột vận tốc.

    Chữa bằng cách lấy `dt` từ **khoảng cách thật giữa hai mốc đã ghi**, nên nó
    đúng cho cả phần thường lẫn cửa sổ dày mà không cần biết mình đang ở đâu.
  */
  let mocDaGhiTruoc: number | null = null

  /**
   * Một mốc: tính đích cho 26 ô, bước cơ học, tách chen, trả thực thể.
   *
   * Thứ tự ba việc là có nghĩa. `tachChen` chạy **sau** phép bước, vì nó sửa
   * chỗ đứng chứ không sửa ý định — đặt nó trước thì phép bước lại dồn người
   * vào nhau ngay trong cùng một mốc. Và nó chỉ chạy trên **ô người**: đẩy quả
   * bóng ra xa chân người là xoá đúng thứ AC-37.6 nói.
   */
  function thucTheTaiMoc(
    pha: KetCucPhaV6,
    boCuc: BoCucPha,
    b: number,
    nguoiGiu: number,
    chiSoPha: number,
    chiSoMoc: number,
  ): readonly ThucTheTaiMoc[] {
    /*
      Một bước cơ học dài đúng bằng khoảng cách tới mốc đã ghi **gần nhất**:
      1 giây ở phần thường, 0,5 giây trong cửa sổ dày của T731. Mốc đầu tiên của
      một phút không có mốc trước trong phút ấy, và nó cách mốc cuối của phút
      trước đúng một nhịp thường.
    */
    const dt =
      mocDaGhiTruoc === null
        ? DT_MOC * 2
        : (chiSoMoc - mocDaGhiTruoc) * DT_MOC
    mocDaGhiTruoc = chiSoMoc
    /*
      1. QUẢ BÓNG trước, vì mọi đích khác đều đọc chỗ nó đang nằm.

      Đổi mã đoạn nghĩa là một lần **rời chân** mới, và lần ấy xuất phát từ chỗ
      quả bóng **đang nằm** chứ không từ tâm vùng — nhờ thế không có bước nhảy
      nào ở ranh giới hai hành động, kể cả khi đoạn trước chưa kịp tới đích.
    */
    const moTa = moTaDoanTaiBuoc(pha, boCuc, b, chiSoPha)
    if (moTa === null) {
      bong = { ...bong, vx: 0, vy: 0, vz: 0 }
    } else {
      if (doanBong === null || doanBong.ma !== moTa.ma) {
        doanBong = dungDoan(moTa, { x: bong.x, y: bong.y }, ttVao.dieuKien)
      }
      bong = bongTrongDoan(
        doanBong,
        (b - doanBong.buocBatDau) * DT_MOC,
        ttVao.dieuKien,
      )
    }
    const dBong: Diem = { x: bong.x, y: bong.y }

    /*
      2. BA ĐIỂM TRỌNG TÀI. Đường chuyền để mệnh đề (b) của AC-38.10 trỏ vào nay
      là **chính đoạn giao bóng đang bay**, không còn là một phép xấp xỉ theo
      phần trăm pha — đoạn ấy biết cả chỗ rời chân lẫn đích của nó.
    */
    const dangBay =
      doanBong !== null &&
      moTa !== null &&
      doanBong.quang > 0 &&
      (b - doanBong.buocBatDau) * DT_MOC < doanBong.giayBay
    const duongChuyen =
      dangBay && doanBong !== null
        ? { tu: { x: doanBong.phat.x, y: doanBong.phat.y }, den: doanBong.den }
        : null

    /*
      ⚠️ **Trọng tài bám CHỖ PHA BÓNG SẮP TỚI, không bám quả bóng đang bay** —
      người dùng chốt 2026-11-24 (câu 26). Một trọng tài thật **đọc trận**: khi
      quả bóng rời chân bay 60 m, ông ta chạy về chỗ nó sắp tới chứ không đuổi
      theo nó giữa đường. Đo trên 10 mã: lệch lớn nhất **46,5 → 37,9 m**, và
      lúc bóng nằm yên **42,7 → 34,7 m** — mọi phân vị đều tốt lên.
    */
    const neoTrongTai: Diem =
      dangBay && doanBong !== null ? doanBong.den : dBong
    const dichTo = viTriTrongTai(
      neoTrongTai,
      duongChuyen,
      hangThuCuoiCua(coHoc),
      coHoc[CHI_SO_TRONG_TAI] ?? dBong,
    )
    const dichCuaO: Readonly<Record<number, Diem>> = {
      [CHI_SO_TRONG_TAI]: dichTo.trongTai,
      [CHI_SO_TRO_LY_1]: dichTo.troLy1,
      [CHI_SO_TRO_LY_2]: dichTo.troLy2,
    }

    // 3. Hai mươi hai ô NGƯỜI, cộng ba điểm trọng tài, đi qua cùng một phép bước.
    const sau: TrangThaiCoHoc[] = coHoc.map((tt, o) => {
      if (o === CHI_SO_BONG) {
        /*
          Ô bóng KHÔNG bước qua `buocCoHoc` nữa: một quả bóng không có trần
          9 m/s, không có trần quay người, và không chạy lùi chậm hơn chạy tới.
          Nó vẫn được ghi vào `coHoc` để `hangThuCuoiCua` và vòng trọng tài đọc
          được chỗ nó đang nằm.
        */
        return { x: bong.x, y: bong.y, vx: bong.vx, vy: bong.vy, huong: tt.huong }
      }
      const dichTrongTai = dichCuaO[o]
      if (dichTrongTai) {
        return buocCoHoc(tt, dichTrongTai, TRAN_TOC_DO_TUYET_DOI, dt)
      }
      if (o >= SO_NGUOI_TREN_SAN) return tt
      const dich =
        o === nguoiGiu
          ? dBong
          : dichNguoiKhongBong(choDung[o] ?? { x: TAM_X, y: TAM_Y }, dBong)
      return buocCoHoc(tt, dich, TRAN_TOC_DO_TUYET_DOI, dt)
    })

    const daTach = tachChen(sau.slice(0, SO_NGUOI_TREN_SAN))
    for (let o = 0; o < SO_NGUOI_TREN_SAN; o += 1) {
      const d = daTach[o]!
      sau[o] = { ...sau[o]!, x: d.x, y: d.y }
    }

    coHoc = sau
    return sau.map((t, o) => ({
      x: t.x,
      y: t.y,
      z: o === CHI_SO_BONG ? bong.z : 0,
      vx: t.vx,
      vy: t.vy,
      vz: o === CHI_SO_BONG ? bong.vz : 0,
      huong: t.huong,
      coMat: coMat[o] ?? 1,
    }))
  }

  for (let i = 0; i < cacPha.length; i += 1) {
    const pha = cacPha[i]!
    const truocKhiGhi = lo.soMocDaGhi
    const mocDauChuoi = mocDau + i * BUOC_MOI_CHUOI
    const boCuc = boCucPha(pha.kq.ketCuc, pha.kq.cacHanhDong.length)
    dienChuoiRaMoc(
      pha,
      mocDauChuoi,
      lo,
      oCuaNguoiGiu(pha),
      coMat,
      (chiSoMoc, _phaCon, nguoiGiu) =>
        thucTheTaiMoc(pha, boCuc, chiSoMoc - mocDauChuoi, nguoiGiu, i, chiSoMoc),
    )

    /*
      Số lần rút dòng cơ học mà mỗi mốc vừa ghi đã tiêu. Hôm nay là 0 — chuyển
      động chưa tồn tại — và `tranLienTuc.test.ts` khẳng định đúng con số 0 ấy,
      CỐ Ý: khi Phase 54 làm nó khác 0 thì phép kiểm kia đỏ và buộc người sửa
      nhìn lại ngưỡng `RUT_MOI_MOC`. Một ngưỡng không ai canh là ngưỡng vô dụng.
    */
    for (let m = truocKhiGhi; m < lo.soMocDaGhi; m += 1) {
      const daRut = 0
      if (daRut > RUT_MOI_MOC) {
        throw new Error(
          `mốc thứ ${m} tiêu ${daRut} lần rút, quá dải ${RUT_MOI_MOC}`,
        )
      }
      rutMoiMoc.push(daRut)
    }
  }

  return {
    tt: {
      tran: tranSau,
      maTran: ttVao.maTran,
      chiSoMoc: mocDau + BUOC_MOI_PHUT,
      coHoc,
      dieuKien: ttVao.dieuKien,
    },
    lo,
    rutMoiMoc,
    cacPha,
  }
}

/**
 * Chạy hết trận ở chế độ liên tục.
 *
 * Chặn cứng `tongPhutTran + 2`, **dùng nguyên khuôn** `chayHetTran` của v6: một
 * vòng `for` có trần chứ không `while (!ketThuc)`, nên một lỗi trong điều kiện
 * dừng là một trận dài hơn hai phút, không phải một vòng lặp vô tận.
 *
 * KHÔNG giữ lô: lô là đầu ra của từng phút, và giữ cả trận là đúng hình dạng bộ
 * đệm 3,4 MB mà D119 đã loại. Ai cần lô thì gọi `buocPhutLienTuc` từng phút.
 */
export function chayHetTranLienTuc(tt: TrangThaiLienTuc): TrangThaiLienTuc {
  let hienTai = tt
  const chanCung = tongPhutTran(tt.tran) + 2
  for (let i = 0; i < chanCung && !hienTai.tran.ketThuc; i += 1) {
    hienTai = buocPhutLienTuc(hienTai).tt
  }
  return hienTai
}
