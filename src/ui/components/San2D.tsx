import { mauChuTuongPhan } from '../../domain/colors'
import { laySoDo } from '../../domain/formations'
import { layViTri } from '../../domain/positions'
import type { PositionId } from '../../domain/types'
import type { BenDoi, SuKien } from '../../engine/suKien'
import type { BenTran } from '../../engine/tran'
import { latVung, vungCuaViTri, type VungSan } from '../../engine/vung'
import { SAN_2D } from '../strings'

/*
  Sân 2D dạng điểm (US-10, quyết định D41).

  SVG viết tay, KHÔNG thư viện đồ hoạ (P4) và KHÔNG vòng lặp animation: mỗi
  điểm là một `<g>` có `transform`, di chuyển bằng CSS transition. 22 điểm
  tròn không cần canvas, mà vòng lặp animation chính là thứ sẽ phá ngân sách 3
  giây của AC-10.5 ở chế độ chạy hết trận.

  Toạ độ suy từ lưới 12 vùng của D23, không phải một bảng toạ độ riêng — nhờ
  vậy chỗ bóng mà engine báo và chỗ người mà sân vẽ luôn nói cùng một thứ
  tiếng.

  KHUNG TOẠ ĐỘ CHUNG là khung của ĐỘI NHÀ: dải 0 là khung thành đội nhà, dải 3
  là khung thành đội khách. Vùng của đội khách — cả vị trí đứng lẫn vùng trong
  sự kiện của họ — phải `latVung` trước khi vẽ, đúng cách engine làm.
*/

const RONG = 100
const CAO = 64

/** Tâm theo trục dọc sân cho từng dải, trong khung của đội nhà. */
const X_THEO_DAI: readonly number[] = [9, 32, 56, 79]

/** Tâm theo trục ngang sân cho từng cột. */
const Y_THEO_COT: Readonly<Record<VungSan['cot'], number>> = {
  trai: 13,
  giua: 32,
  phai: 51,
}

/** Độ cao đội hình đẩy cả đội lên hay xuống theo hướng tấn công của họ. */
const DICH_THEO_DO_CAO: Readonly<Record<string, number>> = {
  thap: -5,
  'trung-binh': 0,
  cao: 5,
}

const BAN_KINH = 3.4

/** Khoảng giãn giữa hai người cùng ĐỘI đứng cùng một vùng. */
const BUOC_GIAN = 8

/**
 * Đẩy hai đội lệch nhau theo trục dọc, mỗi đội về phía khung thành của mình.
 *
 * Cần thiết vì lưới vùng cố tình cho hai đội đứng CHUNG vùng: tiền đạo đội
 * khách (dải 3 của họ) lật sang chính là dải 0 của đội nhà, tức ngay trước
 * khung thành đội nhà — đúng bóng đá. Nhưng vẽ đúng một toạ độ thì hai điểm
 * nằm đè lên nhau và sân chỉ hiện 13 điểm thay vì 22. Lệch 4 đơn vị mỗi bên
 * cho khoảng cách 8, lớn hơn đường kính 6,8 của một điểm.
 */
const LECH_DOI = 4

interface NguoiTrenSan {
  readonly playerId: string
  readonly vung: VungSan
  readonly viTriO: PositionId
}

/** Ai đang đứng ở vùng nào, đã quy về khung của đội nhà. */
function cacNguoiTrenSan(
  ben: BenTran,
  laDoiNha: boolean,
): readonly NguoiTrenSan[] {
  const viTriTheoSlot = new Map(
    laySoDo(ben.chienThuatHienTai.formationId).oVien.map((o) => [
      o.slotId,
      o.viTri,
    ]),
  )
  const dangTrenSan = new Set(ben.trenSan)

  const ra: NguoiTrenSan[] = []
  for (const o of ben.chienThuatHienTai.oVien) {
    if (!o.playerId || !dangTrenSan.has(o.playerId)) continue
    const viTriO = viTriTheoSlot.get(o.slotId)
    if (!viTriO) continue

    const vungRieng = vungCuaViTri(viTriO)
    ra.push({
      playerId: o.playerId,
      viTriO,
      vung: laDoiNha ? vungRieng : latVung(vungRieng),
    })
  }
  return ra
}

/** Quy một vùng trong sự kiện về khung của đội nhà. */
export function vungTrenSan(vung: VungSan, doi: BenDoi): VungSan {
  return doi === 'nha' ? vung : latVung(vung)
}

function toaDo(vung: VungSan, dichX: number): { x: number; y: number } {
  const x = X_THEO_DAI[vung.dai] + dichX
  return { x: Math.min(Math.max(x, 5), RONG - 5), y: Y_THEO_COT[vung.cot] }
}

/**
 * Lệch trục ngang cho những người ĐỨNG CÙNG một vùng, để họ không chồng nhau.
 *
 * Sơ đồ 4-4-2 có hai trung vệ, hai tiền vệ trung tâm và hai tiền đạo cùng ô
 * giữa, nên nếu không giãn thì sân chỉ hiện 8 điểm thay vì 11 — và AC-10.1
 * đếm điểm.
 */
function lechTrongVung(
  cac: readonly NguoiTrenSan[],
): ReadonlyMap<string, number> {
  const theoVung = new Map<string, NguoiTrenSan[]>()
  for (const x of cac) {
    const danh = theoVung.get(x.vung.id) ?? []
    danh.push(x)
    theoVung.set(x.vung.id, danh)
  }

  const ra = new Map<string, number>()
  for (const danh of theoVung.values()) {
    const dau = -((danh.length - 1) * BUOC_GIAN) / 2
    danh.forEach((x, i) => ra.set(x.playerId, dau + i * BUOC_GIAN))
  }
  return ra
}

interface DiemCauThu {
  readonly playerId: string
  readonly x: number
  readonly y: number
  readonly mauNen: string
  readonly mauChu: string
  readonly nhan: string
  readonly moTa: string
  readonly noiBat: boolean
}

export interface DoiTrenSan {
  readonly ben: BenTran
  readonly ten: string
  readonly mauAo: string
}

interface Props {
  readonly nha: DoiTrenSan
  readonly khach: DoiTrenSan
  /** Sự kiện đang hiển thị; `null` khi trận chưa chạy. */
  readonly suKien: SuKien | null
  readonly tenCauThu: (playerId: string) => string
  readonly soAo: (playerId: string) => number | null
}

export function San2D({ nha, khach, suKien, tenCauThu, soAo }: Props) {
  const thamGia = new Set(suKien?.cacCauThu ?? [])
  const vungSuKien = suKien?.vung
    ? vungTrenSan(suKien.vung, suKien.doi)
    : null

  /*
    Người tham gia dồn về CÙNG một vùng, nên phải giãn họ ra y như đã giãn
    những người đứng chung một ô (T132). Không giãn thì hai điểm nằm khít
    lên nhau và người xem chỉ thấy MỘT — pha tranh chấp hay bàn thắng có
    kiến tạo lại trông y hệt một mình một người.

    Giãn theo đúng thứ tự `cacCauThu`: người mà câu tường thuật nói tới đứng
    đầu danh sách, nên chỗ của anh ta không nhảy lung tung giữa các phút.
  */
  const dsThamGia = suKien?.cacCauThu ?? []
  const dauThamGia = -((dsThamGia.length - 1) * BUOC_GIAN) / 2
  const lechThamGia = new Map(
    dsThamGia.map((id, i) => [id, dauThamGia + i * BUOC_GIAN]),
  )

  const cacDiem: DiemCauThu[] = []

  for (const [doi, doiTren] of [
    ['nha', nha],
    ['khach', khach],
  ] as const) {
    const laDoiNha = doi === 'nha'
    const huong = laDoiNha ? 1 : -1
    const doCao = doiTren.ben.chienThuatHienTai.chiThi['do-cao-doi-hinh']
    const dichX = (DICH_THEO_DO_CAO[doCao] ?? 0) * huong - LECH_DOI * huong

    const tren = cacNguoiTrenSan(doiTren.ben, laDoiNha)
    const lech = lechTrongVung(tren)
    const mauChu = mauChuTuongPhan(doiTren.mauAo)

    for (const x of tren) {
      // Người tham gia tình huống dịch TỚI chỗ bóng; người khác giữ chỗ.
      const noiBat = thamGia.has(x.playerId)
      const diChuyen = noiBat && vungSuKien !== null
      const { x: cx, y: cy } = toaDo(
        diChuyen && vungSuKien ? vungSuKien : x.vung,
        diChuyen ? 0 : dichX,
      )
      const lechY = diChuyen
        ? (lechThamGia.get(x.playerId) ?? 0)
        : (lech.get(x.playerId) ?? 0)
      const so = soAo(x.playerId)

      cacDiem.push({
        playerId: x.playerId,
        x: cx,
        y: Math.min(Math.max(cy + lechY, 5), CAO - 5),
        mauNen: doiTren.mauAo,
        mauChu,
        nhan: so === null ? '' : String(so),
        noiBat,
        moTa: SAN_2D.moTaDiem(
          tenCauThu(x.playerId),
          so,
          layViTri(x.viTriO).ten,
          doiTren.ten,
          noiBat,
        ),
      })
    }
  }

  const duongBong = (suKien?.duongBong ?? []).map((v) =>
    toaDo(vungTrenSan(v, suKien?.doi ?? 'nha'), 0),
  )
  const bong = duongBong[duongBong.length - 1]

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${RONG} ${CAO}`}
        className="w-full rounded-lg border border-slate-300 bg-emerald-800"
        role="img"
        aria-label={SAN_2D.moTaSan(nha.ten, khach.ten)}
      >
        {/* Vạch sân: chỉ những vạch giúp định hướng, không vẽ cho đẹp. */}
        <g
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth={0.4}
          aria-hidden="true"
        >
          <rect x={2} y={2} width={RONG - 4} height={CAO - 4} />
          <line x1={RONG / 2} y1={2} x2={RONG / 2} y2={CAO - 2} />
          <circle cx={RONG / 2} cy={CAO / 2} r={8} />
          <rect x={2} y={CAO / 2 - 14} width={12} height={28} />
          <rect x={RONG - 14} y={CAO / 2 - 14} width={12} height={28} />
        </g>

        {/* Đường đi của bóng (AC-10.2, quyết định D40). */}
        {duongBong.length > 1 && (
          <polyline
            points={duongBong.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#fde047"
            strokeWidth={0.8}
            strokeDasharray="2 1.5"
            aria-hidden="true"
          />
        )}
        {bong && (
          <circle
            cx={bong.x}
            cy={bong.y}
            r={1.5}
            fill="#fde047"
            stroke="#111827"
            strokeWidth={0.3}
            aria-hidden="true"
          />
        )}

        {cacDiem.map((d) => (
          <g
            key={d.playerId}
            transform={`translate(${d.x} ${d.y})`}
            style={{ transition: 'transform 280ms ease-out' }}
          >
            <title>{d.moTa}</title>
            <circle
              r={BAN_KINH}
              fill={d.mauNen}
              stroke={d.noiBat ? '#fde047' : 'rgba(17,24,39,0.7)'}
              strokeWidth={d.noiBat ? 1.4 : 0.5}
            />
            <text
              x={0}
              y={1.3}
              textAnchor="middle"
              fontSize={3.4}
              fontWeight={d.noiBat ? 800 : 500}
              fill={d.mauChu}
            >
              {d.nhan}
            </text>
            {/*
              Dấu hình chữ cho người đang tham gia tình huống: P9 cấm truyền
              đạt thông tin quan trọng CHỈ bằng màu, mà nền ở đây là màu áo
              người dùng tự chọn nên tương phản không kiểm soát được. Viền dày
              cộng dấu này là hai tín hiệu không phụ thuộc màu.
            */}
            {d.noiBat && (
              <text
                x={0}
                y={-BAN_KINH - 1.2}
                textAnchor="middle"
                fontSize={3.6}
                fontWeight={800}
                fill="#fde047"
                stroke="#111827"
                strokeWidth={0.25}
              >
                {SAN_2D.dauThamGia}
              </text>
            )}
          </g>
        ))}
      </svg>
    </figure>
  )
}
