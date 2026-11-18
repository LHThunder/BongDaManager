import { NGUONG_KIET_SUC, THE_LUC_DAY } from '../engine/theLuc'

/*
  Nội suy chuyển động cho sân 2D (T421, AC-25.1, AC-25.2, AC-25.7).

  HAI ĐIỀU LÀM NÊN CẢ FILE NÀY:

  1. **Toạ độ tại mốc không thuộc về đây.** `hinhSan` quyết định một điểm
     đứng ở đâu tại mỗi tình huống; file này chỉ vẽ phần XEN GIỮA hai mốc.
     Vì thế mọi hàm ở đây trả về ĐÚNG mốc tại tỉ lệ 0 và 1 — không gần đúng,
     không làm tròn. Đó là điều giữ AC-25.2: tình huống xảy ra ở đâu thì
     người tham gia phải có mặt ở đó, không phải "gần đó".

  2. **Thể lực đổi DÁNG, không đổi THỜI LƯỢNG** (quyết định D88). Cách đọc
     tự nhiên của "người kiệt sức di chuyển chậm hơn" là kéo dài cú chuyển
     chỗ — và nó không khả thi: `thoiGianChuyen` đã bằng 90% một nhịp đồng
     hồ, cụ thể 180ms ở mức Thường, 63ms ở Nhanh và **18ms** ở Rất nhanh,
     nên mọi hệ số lớn hơn 1,11 lần đều đẩy điểm sang quá tình huống kế
     tiếp và phá AC-25.3. Ở mức Rất nhanh chỉ còn 2ms dư.

     Lối ra: người kiệt sức xuất phát muộn hơn và đi phần lớn quãng đường
     sau người khoẻ, nhưng cả hai cùng tới đích đúng một lúc. Mắt đọc được
     độ TRỄ giữa hai điểm cùng xuất phát rõ hơn nhiều so với đọc tốc độ
     tuyệt đối của một điểm, nên kênh thông tin vẫn còn — chỉ là nó không
     mua bằng thời gian mà spec không có.
*/

export interface Diem {
  readonly x: number
  readonly y: number
}

/** Khung sân, để chuyển động không vọt ra ngoài mặt cỏ. */
export interface KhungKep {
  readonly xTu: number
  readonly xDen: number
  readonly yTu: number
  readonly yDen: number
}

function kep01(t: number): number {
  if (!Number.isFinite(t)) return 0
  return t < 0 ? 0 : t > 1 ? 1 : t
}

function kep(giaTri: number, tu: number, den: number): number {
  return giaTri < tu ? tu : giaTri > den ? den : giaTri
}

function kepVaoKhung(d: Diem, khung: KhungKep | null): Diem {
  if (!khung) return d
  return {
    x: kep(d.x, khung.xTu, khung.xDen),
    y: kep(d.y, khung.yTu, khung.yDen),
  }
}

/** Phần đầu chặng dành cho việc rứt chân khỏi chỗ đứng yên. */
const DOAN_RA_KHOI_DUNG_YEN = 0.25

/**
 * Tỉ lệ cho một điểm **xuất phát từ đứng yên** (T503).
 *
 * Smoothstep cũ (`t²(3−2t)`) bị bỏ vì nó có vận tốc 0 ở **cả hai** đầu — đúng
 * cú phanh mà AC-30.1 cấm. Hàm này chỉ êm ở đầu: một đoạn tăng tốc ngắn rồi
 * chuyển sang đi đều, nên tại cuối chặng tốc độ xấp xỉ tốc độ đều (hệ số
 * 1/(1−a/2) ≈ 1,14) — đủ gần để chặng sau nối vào không thấy gẫy.
 *
 * Hai đầu vẫn **đúng tuyệt đối**: `f(0) = 0` và `f(1) = 1`, nhờ phép chuẩn hoá
 * chia cho `1 − a/2`. Đó là điều giữ AC-28.3 (và AC-25.2 của spec 004).
 *
 * Chỉ dùng khi điểm KHÔNG có tốc độ vào: chặng đầu tiên, vừa mở sân, hoặc
 * vừa hết tạm dừng. Còn lại thì đi đều.
 */
export function tiLeRoiDungYen(t: number): number {
  const u = kep01(t)
  if (u <= 0) return 0
  if (u >= 1) return 1
  const a = DOAN_RA_KHOI_DUNG_YEN
  const tho = u < a ? (u * u) / (2 * a) : u - a / 2
  return tho / (1 - a / 2)
}

/** Độ mệt 0 → sung sức, 1 → kiệt sức hoàn toàn. */
export function doMetTuTheLuc(theLuc: number | undefined): number {
  if (theLuc === undefined || !Number.isFinite(theLuc)) return 0
  const tren = THE_LUC_DAY
  const duoi = NGUONG_KIET_SUC
  if (theLuc >= tren) return 0
  if (theLuc <= duoi) return 1
  return (tren - theLuc) / (tren - duoi)
}

/**
 * Phần dáng "mệt" được trộn vào khi đã kiệt sức hoàn toàn (T503).
 *
 * Phần còn lại là tuyến tính, và chính phần ấy giữ cho vận tốc ở hai đầu
 * chặng không bao giờ về 0 — xem chú thích trong `tiLeTheoDoMet`.
 */
export const TRON_TOI_DA = 0.8

/** Mũ lớn nhất khi đã kiệt sức — chọn để độ trễ nhìn thấy được mà không giật. */
export const MU_KIET_SUC = 2.8

/**
 * Đổi dáng chuyển động theo độ mệt (D88).
 *
 * `t ** mu` giữ nguyên cả hai đầu với mọi `mu > 0`, nên người kiệt sức vẫn
 * tới đúng vị trí mốc đúng lúc người khoẻ tới — chỉ là anh ta ở phía sau
 * trong gần suốt quãng đường.
 */
export function tiLeTheoDoMet(t: number, doMet: number): number {
  const u = kep01(t)
  if (u === 0 || u === 1) return u
  const met = kep01(doMet)
  const mu = 1 + met * (MU_KIET_SUC - 1)
  /*
    PHA TRỘN thay vì `u ** mu` thuần (T503).

    `u ** mu` với `mu > 1` có đạo hàm **bằng 0** tại `u = 0`, nên người kiệt
    sức vẫn xuất phát từ vận tốc 0 ở MỊI mốc — đúng cú phanh mà AC-30.1 cấm,
    chỉ lần này chỉ xảy ra với người mệt nên còn khó thấy hơn. Trộn một phần
    tuyến tính vào thì đạo hàm ở hai đầu luôn `≥ 1 − TRON_TOI_DA > 0`, mà đoạn
    giữa vẫn tụt lại sau người sung sức đúng như D88 đòi.
  */
  const tron = met * TRON_TOI_DA
  return (1 - tron) * u + tron * Math.pow(u, mu)
}

/**
 * Nhịp từ đâu trở lên thì coi là **có dư thời gian** (quyết định D93).
 *
 * Dưới ngưỡng này, 75% so với 95% một nhịp là chên nhau vài chục mili giây —
 * không ai thấy, mà rủi ro điểm còn bay dở khi nhịp sau tới thì tăng. Ở nhịp
 * 20ms thì vô nghĩa hoàn toàn.
 */
export const NHIP_CO_DU = 500

/** Người sung sức dùng bao nhiêu phần nhịp, khi nhịp có dư (D93). */
export const PHAN_NHIP_SUNG_SUC = 0.75

/** Người kiệt sức dùng bao nhiêu phần nhịp, khi nhịp có dư (D93). */
export const PHAN_NHIP_KIET_SUC = 0.95

/**
 * Quãng đường lấy làm chuẩn cho một chặng "dài", theo đơn vị sân 100×64.
 *
 * Đo trên ứng dụng: quãng một người đi trong một nhịp có trung vị **2,3** đơn vị,
 * phân vị 90 là **9,2**, và lớn nhất **47,4**. Lấy 40 làm chuẩn thì những cú băng
 * nửa sân dùng gần trọn nhịp, còn các cú xê dịch nhỏ xong sớm.
 */
export const QUANG_CHUAN = 40

/**
 * Mũ của luật "quãng dài thì ĐI LÂU HƠN, không phải đi NHANH HƠN" (AC-30.10).
 *
 * Thời lượng tỉ lệ với `quãng ^ 0,75`, nên tốc độ tỉ lệ với `quãng ^ 0,25`: quãng
 * chênh nhau **11 lần** thì tốc độ chỉ chênh **1,8 lần**. Mũ 1 là tốc độ **đúng bằng
 * nhau**, nhưng lúc ấy cú xê dịch 2 đơn vị chỉ còn 45ms — mắt không kịp thấy nó là
 * một cú di chuyển.
 */
export const MU_QUANG_DUONG = 0.75

/** Phần nhỏ nhất của nhịp mà một chặng được phép dùng, dù quãng ngắn tới đâu. */
export const PHAN_NHIP_TOI_THIEU = 0.12

/**
 * Hệ số thời lượng theo quãng đường phải đi (AC-30.10, T525).
 *
 * **Vì sao cần nó:** trước T525 mọi chặng dùng **cùng một thời lượng**, nên tốc độ
 * tỉ lệ thẳng với quãng: một người xê dịch 2 đơn vị đi 4 đơn vị/giây trong khi
 * người băng nửa sân đi 162. Đo trên ứng dụng ở mức Chậm: tỉ lệ giữa phân vị 99
 * và phân vị 10 của tốc độ là **38,7 lần**. Đó là con số đằng sau câu người dùng
 * nói ở T518: "đôi khi quá nhanh đôi khi quá chậm".
 *
 * Trả một hệ số trong `[PHAN_NHIP_TOI_THIEU; 1]`, nhân vào thời lượng nền.
 */
export function heSoTheoQuang(quang: number, quangChuan: number): number {
  if (!(quang > 0) || !(quangChuan > 0)) return PHAN_NHIP_TOI_THIEU
  const ti = Math.pow(quang / quangChuan, MU_QUANG_DUONG)
  return ti < PHAN_NHIP_TOI_THIEU ? PHAN_NHIP_TOI_THIEU : ti > 1 ? 1 : ti
}

/**
 * Một người đi hết chặng của mình trong bao lâu (AC-30.6, D93).
 *
 * **Hai chế độ, và đó là cái giá của việc mở lại D88:**
 *
 * - Nhịp **có dư** (≥ `NHIP_CO_DU`): người kiệt sức **đi chậm thật** — dùng tới 95%
 *   nhịp trong khi người sung sức chỉ dùng 75%, nên anh ta tới đích **muộn hơn**
 *   thấy được. Vẫn **trước** nhịp sau, vì 95% < 100%.
 * - Nhịp **không dư**: mọi người cùng một thời lượng, đúng D88 — độ chênh chỉ
 *   còn ở **dáng** (`tiLeTheoDoMet`), không ở thời lượng.
 *
 * `thoiLuongChung` là thời lượng mà lớp vẽ đã tính cho nhịp này; 0 nghĩa là mức
 * này thôi nội suy (AC-29.4), lúc ấy không có "thời lượng" nào để nói tới.
 */
export function thoiLuongCuaNguoi(
  msMoiPhut: number,
  thoiLuongChung: number,
  doMet: number,
  quang = QUANG_CHUAN,
  quangChuan = QUANG_CHUAN,
): number {
  if (!(thoiLuongChung > 0)) return 0
  const heSo = heSoTheoQuang(quang, quangChuan)
  if (!(msMoiPhut >= NHIP_CO_DU)) {
    return Math.max(1, Math.round(thoiLuongChung * heSo))
  }
  const met = kep01(doMet)
  const phan =
    PHAN_NHIP_SUNG_SUC + met * (PHAN_NHIP_KIET_SUC - PHAN_NHIP_SUNG_SUC)
  return Math.max(1, Math.round(msMoiPhut * phan * heSo))
}

/**
 * Hệ số kéo tiếp tuyến vào: 0 là gãy góc, 1 là nối đúng tốc độ chặng trước.
 *
 * T503 đưa nó từ **0,55 lên 1**. 0,55 làm đường đi mềm về **hướng** nhưng cắt
 * 45% độ lớn của vận tốc ngay tại mốc, tức điểm vẫn **chậm lại thấy được** mỗi
 * lần qua mốc — AC-30.1 đòi tốc độ **không đổi đột** ở đó, không chỉ đòi
 * hướng liền. Với hệ số 1 và hai chặng cùng thời lượng, vận tốc cuối chặng
 * trước **bằng đúng** vận tốc đầu chặng sau.
 *
 * Cái giá: đường cong vòng rộng hơn. Phép kẹp vào khung sân vẫn chặn nó ở
 * mẽp cỏ, và đây là **một con số duy nhất** để điều chỉnh nếu mắt người dùng
 * thấy vòng quá rộng ở T518.
 */
const KEO_TIEP_TUYEN = 1

/**
 * Hướng đi ra khỏi một mốc, để cú di chuyển SAU nối mượt vào cú này.
 *
 * Không có nó thì mỗi mốc là một góc gãy: điểm lao thẳng tới mốc rồi quặt
 * ngay sang hướng mới — đúng thứ AC-25.1 cấm.
 */
export function huongRaKhoiMoc(tu: Diem, den: Diem): Diem {
  return { x: den.x - tu.x, y: den.y - tu.y }
}

/**
 * Toạ độ tại tỉ lệ `tiLe` trên đường cong từ `tu` tới `den` (AC-25.1).
 *
 * Dùng Hermite bậc ba. Tiếp tuyến ở đầu là `huongVao` — hướng mà điểm đang
 * đi khi cú di chuyển trước kết thúc — nên đường mới rời mốc theo đúng
 * hướng cũ rồi mới cong dần về đích. `huongVao` là `null` (cú đầu tiên, hay
 * điểm vừa xuất hiện) thì hai tiếp tuyến bằng nhau và công thức rút về
 * đúng đường thẳng.
 *
 * **Tại `tiLe` 0 và 1 trả về ĐÚNG hai mốc**, bất kể tiếp tuyến nào: hàm cơ
 * sở Hermite triệt tiêu hết ở hai đầu. Đây là điều giữ AC-25.2.
 */
export function noiSuyCong(
  tu: Diem,
  den: Diem,
  tiLe: number,
  huongVao: Diem | null = null,
  gioiHan: KhungKep | null = null,
): Diem {
  const t = kep01(tiLe)
  if (t <= 0) return kepVaoKhung(tu, gioiHan)
  if (t >= 1) return kepVaoKhung(den, gioiHan)

  const dx = den.x - tu.x
  const dy = den.y - tu.y

  /*
    TIẾP TUYẾN BỊ CHẶN THEO CHÍNH DÂY CUNG CỦA CHẶNG NÀY (T525).

    `huongVao` là vận tốc của chặng TRƯỚC. Khi chặng trước dài mà chặng này
    ngắn, một tiếp tuyến lớn hơn dây cung làm đường Hermite **phồng ra** thành
    một vòng cung rộng: đo trên ứng dụng, có chặng đi chỉ **3,9 đơn vị** theo
    đường chim bay nhưng điểm chạy hết **37,2 đơn vị** — gấp **9,6 lần**. Đó là
    một phần của cảm giác "teleport" mà người dùng nói ở T518: điểm không bay
    tới đích, nó bay một vòng.

    Chặn độ lớn (giữ nguyên HƯỚNG) ở đúng một dây cung là cách chữa bằng số
    học: hướng vào vẫn liền nên không có góc gãy (AC-30.1), mà đường cong không
    còn dài hơn dây cung quá một phần nhỏ. Người đang chạy nhanh mà chỉ cần xê
    dịch hai bước thì giảm tốc — đó cũng là điều người thật làm.
  */
  const dayCung = Math.hypot(dx, dy)
  const doVao = huongVao ? Math.hypot(huongVao.x, huongVao.y) : 0
  const chan =
    huongVao && doVao > dayCung && dayCung > 0 ? dayCung / doVao : 1

  const m0x = huongVao ? huongVao.x * KEO_TIEP_TUYEN * chan : dx
  const m0y = huongVao ? huongVao.y * KEO_TIEP_TUYEN * chan : dy
  const m1x = dx
  const m1y = dy

  const t2 = t * t
  const t3 = t2 * t
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 = t3 - t2

  return kepVaoKhung(
    {
      x: h00 * tu.x + h10 * m0x + h01 * den.x + h11 * m1x,
      y: h00 * tu.y + h10 * m0y + h01 * den.y + h11 * m1y,
    },
    gioiHan,
  )
}

/**
 * Toạ độ của MỘT điểm tại một thời khắc, đã tính cả độ mượt và thể lực.
 *
 * Gộp ba bước vào một chỗ để `San2D` chỉ gọi một hàm cho mỗi điểm mỗi khung
 * hình, và để thứ tự ba bước ấy có đúng một định nghĩa.
 */
export function viTriTaiThoiDiem(
  tu: Diem,
  den: Diem,
  tiLe: number,
  tuyChon: {
    readonly huongVao?: Diem | null
    readonly doMet?: number
    readonly gioiHan?: KhungKep | null
  } = {},
): Diem {
  const t = kep01(tiLe)
  if (t <= 0) return kepVaoKhung(tu, tuyChon.gioiHan ?? null)
  if (t >= 1) return kepVaoKhung(den, tuyChon.gioiHan ?? null)

  /*
    Có tốc độ vào thì đi ĐỀU (tỉ lệ dùng thẳng `t`), không làm mượt hai đầu
    nữa: làm mượt hai đầu chính là cú phanh ở mốc (AC-30.1, T503). Chỉ khi
    điểm đang đứng yên mới có đoạn tăng tốc — một người đứng rồi chạy thì
    đúng là phải rứt chân.
  */
  const tiLeDi =
    tuyChon.huongVao == null ? tiLeRoiDungYen(t) : t
  const theoSuc = tiLeTheoDoMet(tiLeDi, tuyChon.doMet ?? 0)
  return noiSuyCong(
    tu,
    den,
    theoSuc,
    tuyChon.huongVao ?? null,
    tuyChon.gioiHan ?? null,
  )
}
