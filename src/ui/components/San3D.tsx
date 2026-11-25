import { useEffect, useReducer, useRef, type ComponentProps } from 'react'
import { useChuoi } from '../../hooks/useNgonNgu'
import {
  chieuDiem,
  chieuMatSan,
  thuTuDoSau,
  tiSaBan,
  viTriBongLienTuc,
} from '../chieuSaBan'
import { anhChupTuLo, mocVeTaiThoiDiem } from '../mocVe'
import { viTriMetLienTuc, type AnhChupMet } from '../viTriVe'
import { mauChuTuongPhan } from '../../domain/colors'
import type { KhungAnh } from '../quyDoiMet'
import { DAI_SAN, RONG_SAN } from '../../engine/hinhHocSan'
import { BAN_KINH, CAO, San2D } from './San2D'

/*
  ====================================================================
  SA BÀN: SÂN NHÌN XIÊN, SONG SONG VỚI SÂN 2D (T767, spec 011).
  ====================================================================

  Component này **không thay thế** `San2D`. Hai lớp vẽ sống cạnh nhau và người
  dùng đổi qua lại; sân 2D vẫn là mặc định. Cái giá của "song song" đã được ghi
  thẳng vào `spec.md`: hai lớp vẽ phải cùng đúng mãi mãi, và US-4 là nơi trả
  giá ấy bằng ba nhóm bất biến.

  Vì sao nó là một file riêng chứ không phải một cờ trong `San2D` (quyết định
  **D130**): `San2D.tsx` đã gần 2.000 dòng và là chủ sở hữu của hàng chục AC đã
  đóng ở spec 002/004/005/006. Thêm một nhánh `if` xuyên qua nó là đặt mọi AC ấy
  vào đường đi của mã mới.

  Phép chiếu KHÔNG ở trong file này — nó ở `src/ui/chieuSaBan.ts`, là hàm thuần
  và có phép kiểm riêng (**D131**). Lý do hẹp: `vitest.config` chỉ nhận
  `*.test.ts` dưới `src/`, nên một hàm toán nằm trong `.tsx` là một hàm **bộ kiểm
  không gọi tới được** — và đây đúng là vùng mà một dấu trừ sai vẫn vẽ ra hình.
*/

/**
 * Props **giống hệt** `San2D`, không thêm một prop nào.
 *
 * Lấy bằng `ComponentProps` thay vì khai lại mười hai trường: khai lại là tạo
 * ra hai bản để lệch nhau. Cách này biến "giống hệt" thành một bảo đảm của
 * **kiểu** — `San2D` thêm hay bỏ prop thì file này đỏ ngay lúc biên dịch.
 *
 * File này có phụ thuộc lúc chạy sang `San2D` thật, nhưng **không** vì dòng
 * `type` này: nó vì ba hằng `RONG`, `CAO`, `BAN_KINH` được dùng lại thay vì
 * khai lại. Ba con số ấy định nghĩa `viewBox` chung của hai góc nhìn, nên khai
 * lại là mở đường cho hai góc nhìn vẽ trên hai khung khác nhau.
 */
type Props = ComponentProps<typeof San2D>

/**
 * Chiều NGANG hệ toạ độ của sa bàn: mặt cỏ đã chiếu cộng đúng một bán kính đĩa
 * cầu thủ mỗi bên.
 *
 * ⚠️ **Rộng hơn `RONG = 100` của sân 2D, và đó là bắt buộc.** `tiSaBan` =
 * `cao / RONG_SAN` (**D144**) đưa 105 m thành **98,82** đơn vị, nên trong khung
 * 100 chỉ còn **0,59** đơn vị mỗi bên — trong khi khung thành dựng ra NGOÀI
 * đường biên ngang 2 m, tức **1,88** đơn vị. Đo trên bản chạy ngày 2026-11-25:
 * hai khung thành nằm ở `x = −1,29` và `x = 99,41`, tức **ngoài khung ảnh**, và
 * chúng không vẽ ra. Đĩa cầu thủ (2,6) còn thiếu chỗ hơn nữa.
 *
 * Nới chiều ngang là cách duy nhất chữa được điều ấy mà **không đụng tới một
 * con số nào người dùng đã chốt**: cả năm con số của spec (chiều sâu 49,0 ·
 * đỉnh bóng 9,5 · 14,9% · 1,07 lần bán kính bóng · tổng 58,6) đều là con số
 * **dọc**, và `tiSaBan` chỉ đọc `cao`. Phương án bị loại là hạ `tiSaBan` cho
 * vừa bề ngang — nó kéo tụt cả năm.
 *
 * Con số này được TÍNH, không đặt tay, nên nó không thể lệch khỏi `tiSaBan`.
 * Lề ra đúng `BAN_KINH`, đúng điều `tiLeMet` hứa cho sân 2D: một người đứng
 * sát vạch vôi thì đĩa của anh ta còn nằm trong ảnh.
 */
const RONG_SA_BAN = DAI_SAN * (CAO / RONG_SAN) + 2 * BAN_KINH

/**
 * Khung ảnh của sa bàn. Cùng chiều CAO với sân 2D, rộng hơn theo chiều ngang.
 *
 * `le` ở đây chỉ dùng để **đặt** mặt cỏ (biên gần ở `cao − le`) và để tính lề
 * ngang, không dùng để tính tỉ lệ: tỉ lệ là `tiSaBan`, xem **D144**.
 */
const KHUNG: KhungAnh = { rong: RONG_SA_BAN, cao: CAO, le: BAN_KINH }

/** Độ dày vạch sân, theo cùng tỉ lệ mà sân 2D dùng (`0,4 × tỉ lệ`). */
const DAY_VACH = 0.4 * tiSaBan(KHUNG)

/** Màu vạch sân: cùng một chuỗi với sân 2D, không hằng màu mới. */
const MAU_VACH = 'rgba(255,255,255,0.45)'

/** Bán kính đĩa cầu thủ trên sa bàn — cùng con số với sân 2D. */
const BAN_KINH_NGUOI = BAN_KINH

/** Bán kính quả bóng, đơn vị ảnh. Chính con số mà AC-46.1 lấy làm ngưỡng. */
const BAN_KINH_BONG = 1.7

/**
 * Cạnh hình vuông của đội khách, chọn để **cùng diện tích** với đĩa chủ nhà.
 *
 * `a = r·√π` cho `a² = π·r²`. Cùng diện tích thì hai đội "nặng" như nhau trên
 * màn hình — một bên to hơn sẽ thành một thứ bậc thị giác mà không AC nào đòi.
 */
const CANH_KHACH = BAN_KINH_NGUOI * Math.sqrt(Math.PI)

/** Cỡ chữ số áo, **cố định** trong hệ viewBox — xem T787 ở chỗ vẽ. */
const CO_SO_AO = 2.8

export function San3D({
  nha,
  khach,
  msMoiPhut,
  dangChay,
  loMoc,
  soLo = 0,
  oCuaNguoi,
  soAo,
}: Props) {
  const { SAN_2D } = useChuoi()
  const v = chieuMatSan(KHUNG)

  const [, veLai] = useReducer((n: number) => n + 1, 0)
  const anhChupRef = useRef<AnhChupMet | null>(null)
  const soLoRef = useRef(soLo)
  const moMocRef = useRef(0)
  /** Mốc cuối vòng khung hình đã đọc — để lúc tạm dừng còn chỗ mà vẽ. */
  const chiSoRef = useRef(0)
  /** Thứ tự vẽ của khung TRƯỚC, để biết khung này có phải xếp lại không (D137). */
  const thuTuRef = useRef<readonly number[]>([])

  /*
    Mọi thứ vòng khung hình cần, qua MỘT ref được ghi lại mỗi lần render.

    Khác cách `San2D.tsx:1775` làm — nó đọc `loMoc` và `soLo` qua closure và cố
    ý để chúng ngoài mảng phụ thuộc. Lý do ở đó là R52: đưa chúng vào thì vòng
    bị huỷ rồi dựng lại MỖI PHÚT. Ref đạt đúng mục đích ấy mà không phải dựa
    vào closure để lấy giá trị mới — closure thì giữ giá trị của lần render tạo
    ra nó, nên `soLo` đọc qua closure sẽ không bao giờ khác `soLoRef`.
  */
  const duLieuRef = useRef({ loMoc, soLo, oCuaNguoi, msMoiPhut })
  duLieuRef.current = { loMoc, soLo, oCuaNguoi, msMoiPhut }

  useEffect(() => {
    // Tạm dừng thì KHÔNG chạy một vòng khung hình nào (AC-49.3, T778 canh điều này).
    if (!dangChay) return undefined

    let yeuCau = 0
    const buoc = () => {
      const bayGio = performance.now()
      const d = duLieuRef.current
      if (d.loMoc) {
        if (soLoRef.current !== d.soLo) {
          soLoRef.current = d.soLo
          moMocRef.current = bayGio
        }
        const { chiSo } = mocVeTaiThoiDiem(
          bayGio - moMocRef.current,
          d.msMoiPhut,
          d.loMoc.soMocDaGhi,
        )
        chiSoRef.current = chiSo
        anhChupRef.current = anhChupTuLo(
          d.loMoc,
          chiSo,
          d.oCuaNguoi ?? new Map<string, number>(),
        )
      }
      veLai()
      yeuCau = requestAnimationFrame(buoc)
    }
    yeuCau = requestAnimationFrame(buoc)
    return () => cancelAnimationFrame(yeuCau)
  }, [dangChay])

  /*
    Ảnh chụp để vẽ. Vòng khung hình ghi vào `anhChupRef`, nhưng vòng ấy **chỉ
    chạy khi `dangChay`** — nên trước cú phát bóng đầu tiên nó còn `null` và sa
    bàn sẽ trống trơn, trong khi sân 2D đã có 22 điểm. Đo trên bản chạy ngày
    2026-11-25: trận mở ra ở trạng thái tạm dừng ở phút 0.

    Nên khi chưa có khung nào, dựng ảnh chụp ngay trong lúc render từ mốc cuối
    đã biết. `chiSoRef` giữ mốc ấy, nên lúc tạm dừng giữa trận thì bóng và
    người **đứng yên đúng chỗ của mốc đang hiển thị**, không biến mất — đó là
    điều AC-49.4 đòi, và T778/T779 là nơi canh nó bằng phép kiểm.
  */
  const anhChup =
    anhChupRef.current ??
    (loMoc ? anhChupTuLo(loMoc, chiSoRef.current, oCuaNguoi ?? new Map<string, number>()) : null)
  const bong = anhChup ? viTriBongLienTuc(anhChup, KHUNG) : null

  /** 22 cầu thủ, đã chiếu. Vị trí đi qua ĐÚNG MỘT đường đọc: `viTriMetLienTuc`. */
  const nguoi = anhChup
    ? [nha, khach].flatMap((doi, iDoi) =>
        doi.ben.trenSan.flatMap((id) => {
          const met = viTriMetLienTuc(anhChup, id)
          if (!met) return []
          return [
            {
              id,
              mauAo: doi.mauAo,
              laChuNha: iDoi === 0,
              so: soAo(id),
              diem: chieuDiem(KHUNG, met.xMet, met.yMet, 0),
            },
          ]
        }),
      )
    : []

  /*
    THỨ TỰ VẼ THEO ĐỘ SÂU (T771, D137).

    SVG không có `z-index`, nên thứ tự tài liệu LÀ thứ tự che: muốn người ở đầu
    gần che người ở đầu xa thì phải vẽ người xa trước.

    Nhưng xếp lại danh sách mỗi khung hình là bảo React **chuyển chỗ các nút
    DOM** mỗi khung hình, 60 lần một giây, cho 22 nút — trong khi thứ tự thật
    sự đổi thì hiếm hơn thế. Nên so với thứ tự khung trước; giống thì **dùng
    lại đúng mảng cũ**, và React không phải động vào một nút nào.

    📍 **Đo thật ngày 2026-11-25, và nó không khớp điều T771 chờ đợi.** Trên một
    trận đang chạy: thứ tự đổi ở **43,9%** số khung (323 trên 736), chứ không
    phải hiếm — 22 người chạy liên tục thì gần như khung nào cũng có một cặp
    đổi chỗ sâu-nông. Cái phép so này vẫn đáng giá, nhưng vì lý do khác với lý
    do task viết ra nó: đo bằng `MutationObserver` thì nó cho **3,63 nút bị
    chuyển chỗ mỗi khung** thay vì 22 nếu xếp lại mù quáng — tức **ít hơn 84%**
    (174 nút trên 1.056). Cái được là số NÚT, không phải số KHUNG.

    Chú ý: dùng lại thứ tự cũ KHÔNG làm đóng băng vị trí — chỉ số vẫn trỏ vào
    mảng `nguoi` mới của khung này, nên `cx`/`cy` vẫn là của mốc mới. Chỉ **thứ
    tự** là cũ. Và đổi quân số (thay người) làm độ dài lệch, nên nó buộc xếp lại.
  */
  const thuTuMoi = thuTuDoSau(nguoi.map((n) => n.diem))
  const giongKhungTruoc =
    thuTuMoi.length === thuTuRef.current.length &&
    thuTuMoi.every((v, i) => v === thuTuRef.current[i])
  if (!giongKhungTruoc) thuTuRef.current = thuTuMoi
  const nguoiTheoDoSau = thuTuRef.current.flatMap((i) => {
    const n = nguoi[i]
    return n ? [n] : []
  })

  return (
    <svg
      viewBox={`0 0 ${RONG_SA_BAN} ${CAO}`}
      className="w-full rounded-lg border border-vien-dam bg-nen-nhan"
      role="img"
      aria-label={`${SAN_2D.moTaSaBan(nha.ten, khach.ten)} ${SAN_2D.tomTatSaBan(
        nguoi.length,
        bong ? bong.zMet : null,
      )}`}
      data-goc-nhin="sa-ban"
    >
      {/*
        Mặt cỏ là một tứ giác, không phải `<rect>`: dưới phép chiếu nó vẫn
        thẳng trục, nhưng vẽ bằng bốn góc đã chiếu thì chỗ này chỉ có MỘT nguồn
        hình học — `chieuMatSan` — và không có cơ hội để hai công thức lệch nhau.
      */}
      <polygon
        points={v.gocMatCo.map((g) => `${g.x},${g.y}`).join(' ')}
        fill="var(--co-nen-dam)"
        aria-hidden="true"
      />

      {/* Vạch sân: chỉ những vạch giúp định hướng, không vẽ cho đẹp. */}
      <g fill="none" stroke={MAU_VACH} strokeWidth={DAY_VACH} aria-hidden="true">
        <rect x={v.bien.x} y={v.bien.y} width={v.bien.rong} height={v.bien.cao} />
        <line x1={v.vachGiua.x} y1={v.vachGiua.y1} x2={v.vachGiua.x} y2={v.vachGiua.y2} />
        {/*
          Vòng tròn giữa là `<ellipse>`, không `<circle>`: một đường tròn thật
          bị dẹt một chiều thì thành ellipse. Ở sân 2D điều đó là MÉO và
          `quyDoiMet.ts` từ chối nó; ở sa bàn nó là chủ ý.
        */}
        <ellipse cx={v.tamSan.x} cy={v.tamSan.y} rx={v.vongGiua.rx} ry={v.vongGiua.ry} />
        {v.vongCam.map((o, i) => (
          <rect key={`cam${i}`} x={o.x} y={o.y} width={o.rong} height={o.cao} />
        ))}
        {v.khungThanh.map((o, i) => (
          <rect key={`gon${i}`} x={o.x} y={o.y} width={o.rong} height={o.cao} />
        ))}
        {[v.tamSan, ...v.chamPhatDen].map((d, i) => (
          <circle key={`cham${i}`} cx={d.x} cy={d.y} r={0.3 * tiSaBan(KHUNG)} fill={MAU_VACH} />
        ))}
      </g>

      {/*
        22 cầu thủ. Vị trí mặt sân `(x, y)` đi qua `viTriMetLienTuc` — CÙNG một
        hàm mà sân 2D dùng — rồi mới qua `chieuDiem`. Lớp 3D chỉ thêm phép
        chiếu, **không dịch một cầu thủ nào** vì bất kỳ lý do hiển thị nào
        (AC-46.5). Ô `coMat = 0` thì `viTriMetLienTuc` trả `null` và không vẽ.
      */}
      {nguoiTheoDoSau.map((n) => (
        <g key={n.id}>
          {/*
            HAI KÊNH, KHÔNG CHỈ MÀU (T788, P9).

            Chủ nhà là **đĩa tròn**, đội khách là **hình vuông bo góc** cùng
            diện tích. Hình dạng là kênh đọc được trong ảnh đen trắng, còn màu
            áo thì không — hai đội có thể chọn hai màu cùng độ sáng, và lúc ấy
            ảnh xám chỉ còn hai vệt y hệt nhau.

            Vì sao chọn hình dạng chứ không hoa văn: hoa văn chiếm chính chỗ mà
            số áo cần, còn hình dạng thì chừa trống giữa. Và hai hình cùng diện
            tích nên `phanBietDuoc` (T781) đo bằng bán kính vẫn đúng.
          */}
          {n.laChuNha ? (
            <circle
              cx={n.diem.x}
              cy={n.diem.y}
              r={BAN_KINH_NGUOI}
              fill={n.mauAo}
              stroke={mauChuTuongPhan(n.mauAo)}
              strokeWidth={0.3}
            />
          ) : (
            <rect
              x={n.diem.x - CANH_KHACH / 2}
              y={n.diem.y - CANH_KHACH / 2}
              width={CANH_KHACH}
              height={CANH_KHACH}
              rx={CANH_KHACH / 4}
              fill={n.mauAo}
              stroke={mauChuTuongPhan(n.mauAo)}
              strokeWidth={0.3}
            />
          )}

          {/*
            SỐ ÁO: CỠ CỐ ĐỊNH, KHÔNG CO THEO ĐỘ SÂU (T787, D140).

            Phép chiếu dẹt chiều sâu đi `sin 50°`, nên một chữ co theo độ sâu sẽ
            nhỏ đi ở nửa sân xa — và **AC-15.1 (đếm được từng điểm) hỏng đúng ở
            nửa ấy**. Chữ vì thế có cỡ cố định trong hệ viewBox: số ở đầu xa đọc
            được **bằng** số ở đầu gần.

            Camera yaw 0 và không quay, nên chữ dựng đứng là đã quay mặt về
            người xem; không cần phép xoay ngược nào.

            Vẽ CÙNG nhóm với hình của chính nó chứ không gom thành một lớp phủ
            trên cùng: gom lên trên thì số của người ở đầu XA sẽ đè lên đĩa của
            người ở đầu GẦN, tức lớp 3D nói dối về độ sâu.
          */}
          {n.so !== null && (
            <text
              x={n.diem.x}
              y={n.diem.y}
              fontSize={CO_SO_AO}
              textAnchor="middle"
              dominantBaseline="central"
              fill={mauChuTuongPhan(n.mauAo)}
              aria-hidden="true"
            >
              {n.so}
            </text>
          )}
        </g>
      ))}

      {/*
        Quả bóng, và dấu chiếu của nó xuống mặt cỏ.

        Bóng vẽ SAU CÙNG nên nó luôn nằm trên (D135) — SVG không có `z-index`,
        thứ tự tài liệu LÀ thứ tự che. Dấu chiếu chỉ vẽ khi `z > 0`: ở mặt đất
        nó trùng chính quả bóng và chỉ làm bẩn hình.
      */}
      {bong && (
        <g aria-hidden="true">
          {bong.zMet > 0 && (
            /*
              DẤU CHIẾU LÀ MỘT VÒNG SÁNG, KHÔNG PHẢI MỘT VỆT TỐI (T790, AC-50.2).

              Bản đầu vẽ nó bằng `rgba(0,0,0,0.35)` như một cái bóng đổ. Đo ra
              **1,50:1** trên mặt cỏ — gần như vô hình. Và đây là một con số
              **không dựng nổi** theo hướng ấy: đen **tuyền** trên mặt cỏ này
              cũng chỉ đạt **2,99:1**, tức mọi vệt tối đều dưới ngưỡng 3:1 mà
              WCAG đặt cho thành phần phi văn bản.

              AC-46.2 gọi nó là **"dấu chiếu"**, không phải bóng đổ vật lý — nên
              nó được phép sáng. `--co-vien` (biến đã có, không thêm màu mới)
              cho **4,34:1**. Vẽ rỗng ruột để nó không bị nhầm thành quả bóng
              thứ hai: bóng là đĩa đặc có viền tối, dấu chiếu là vòng rỗng.
            */
            <ellipse
              cx={bong.matSan.x}
              cy={bong.matSan.y}
              rx={BAN_KINH_BONG}
              ry={BAN_KINH_BONG * (v.vongGiua.ry / v.vongGiua.rx)}
              fill="none"
              stroke="var(--co-vien)"
              strokeWidth={0.4}
            />
          )}
          <circle
            cx={bong.chieu.x}
            cy={bong.chieu.y}
            r={BAN_KINH_BONG}
            fill="var(--co-chu)"
            stroke="var(--co-net)"
            strokeWidth={0.3}
          />
        </g>
      )}
    </svg>
  )
}
