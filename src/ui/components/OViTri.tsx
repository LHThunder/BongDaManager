import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { OViTriSoDo } from '../../domain/formations'
import { MUC_TRU_HIEU_SUAT, type MucSai } from '../../domain/misplacement'
import { layViTri } from '../../domain/positions'
import type { Player } from '../../domain/types'
import { SAI_VI_TRI, TRANG_CHIEN_THUAT } from '../strings'
import { AnhThayThe } from './AnhThayThe'
import { idKeo, type DuLieuKeo } from './DanhSachNgoaiSan'

interface Props {
  readonly o: OViTriSoDo
  /** `null` là ô trống. */
  readonly cauThu: Player | null
  readonly mauAo: string
  /** Mức sai vị trí của cầu thủ đang đứng ở ô; `null` khi ô trống. */
  readonly mucSai: MucSai | null
  readonly dangChon?: boolean
  readonly onChon?: () => void
}

/** Id droppable của một ô trên sân. */
export function idO(slotId: string): string {
  return `o:${slotId}`
}

export interface DuLieuO {
  readonly slotId: string
}

/*
  Viền chỉ là dấu hiệu PHỤ. Mức sai vị trí luôn được nói bằng chữ ngay dưới ô
  (P9: không truyền thông tin chỉ bằng màu).
*/
const VIEN_THEO_MUC: Readonly<Record<MucSai, string>> = {
  dung: 'border-white/70',
  nhe: 'border-amber-300',
  vua: 'border-orange-400',
  nang: 'border-red-500',
}

/** Một ô trong đội hình trên sân (AC-5.1, AC-5.3, AC-5.4, AC-5.5). */
export function OViTri({
  o,
  cauThu,
  mauAo,
  mucSai,
  dangChon = false,
  onChon,
}: Props) {
  const viTri = layViTri(o.viTri)

  const duLieuO: DuLieuO = { slotId: o.slotId }
  const { setNodeRef: datNodeTha, isOver } = useDroppable({
    id: idO(o.slotId),
    data: duLieuO,
  })

  /*
    Ô trống không có gì để kéo đi, nhưng hook phải được gọi ở mọi lần render
    (luật hook của React), nên `useDraggable` luôn được gọi — chỉ `disabled`
    đổi theo việc ô có người hay không.
  */
  const duLieuKeo: DuLieuKeo = {
    playerId: cauThu?.id ?? '',
    slotId: o.slotId,
  }
  const {
    attributes,
    listeners,
    setNodeRef: datNodeKeo,
    transform,
    isDragging,
  } = useDraggable({
    id: idKeo(cauThu?.id ?? `trong:${o.slotId}`),
    data: duLieuKeo,
    disabled: cauThu === null,
    attributes: { roleDescription: TRANG_CHIEN_THUAT.moTaKeoDuoc },
  })

  const nhan =
    cauThu === null
      ? TRANG_CHIEN_THUAT.nhanO(viTri.ten)
      : TRANG_CHIEN_THUAT.oCoNguoi(viTri.ten, cauThu.name, cauThu.shirtNumber)

  const vien =
    mucSai === null ? 'border-white/40 border-dashed' : VIEN_THEO_MUC[mucSai]

  return (
    <div ref={datNodeTha} className="flex w-20 flex-col items-center gap-1">
      <button
        ref={datNodeKeo}
        type="button"
        onClick={onChon}
        aria-label={nhan}
        // `aria-pressed` thuộc về @dnd-kit (nó dùng để báo trạng thái đang
        // kéo), nên trạng thái "ô đang chọn" dùng `aria-current`.
        aria-current={dangChon ? 'true' : undefined}
        {...listeners}
        {...attributes}
        style={
          transform
            ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
            : undefined
        }
        className={`flex h-16 w-16 touch-none flex-col items-center justify-center gap-0.5 rounded-full border-2 ${vien} ${
          isOver ? 'ring-2 ring-sky-200 ring-offset-2 ring-offset-emerald-700' : ''
        } ${
          dangChon
            ? 'ring-2 ring-sky-300 ring-offset-2 ring-offset-emerald-700'
            : ''
        } ${
          isDragging ? 'z-10 opacity-80' : ''
        } bg-emerald-900/70 px-1 text-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-emerald-700`}
      >
        {cauThu === null ? (
          <>
            <span className="text-sm font-bold">{viTri.vietTat}</span>
            <span className="text-[10px] leading-none text-white/70">
              {TRANG_CHIEN_THUAT.oTrong}
            </span>
          </>
        ) : (
          <>
            <AnhThayThe
              anhId={cauThu.portraitImageId}
              ten={cauThu.name}
              mauNen={mauAo}
              kichThuoc="nho"
            />
            <span className="text-[10px] font-semibold leading-none">
              {cauThu.shirtNumber}
            </span>
          </>
        )}
      </button>

      {cauThu !== null && (
        <span className="max-w-full truncate text-center text-[11px] font-medium text-white">
          {cauThu.name}
        </span>
      )}

      {mucSai !== null && mucSai !== 'dung' && (
        <span className="rounded bg-slate-900/80 px-1 text-center text-[10px] leading-tight text-amber-200">
          {SAI_VI_TRI.nhan(mucSai, Math.round(MUC_TRU_HIEU_SUAT[mucSai] * 100))}
        </span>
      )}
    </div>
  )
}
