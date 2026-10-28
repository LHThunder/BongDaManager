import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Player } from '../../domain/types'
import { TRANG_CHIEN_THUAT } from '../strings'
import { AnhThayThe } from './AnhThayThe'

/** Id droppable của vùng ngoài sân; kéo vào đây là đưa cầu thủ ra khỏi sân. */
export const ID_NGOAI_SAN = 'ngoai-san'

/** Id draggable của một cầu thủ, dù họ đang ở trên sân hay ngoài sân. */
export function idKeo(playerId: string): string {
  return `cau-thu:${playerId}`
}

export interface DuLieuKeo {
  readonly playerId: string
  /** Ô mà cầu thủ đang đứng; `null` nghĩa là đang ở ngoài sân. */
  readonly slotId: string | null
}

interface MucProps {
  readonly cauThu: Player
  readonly mauAo: string
}

function MucNgoaiSan({ cauThu, mauAo }: MucProps) {
  const duLieu: DuLieuKeo = { playerId: cauThu.id, slotId: null }
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: idKeo(cauThu.id),
      data: duLieu,
      attributes: { roleDescription: TRANG_CHIEN_THUAT.moTaKeoDuoc },
    })

  return (
    <li>
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        style={
          transform
            ? {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              }
            : undefined
        }
        className={`flex w-full touch-none items-center gap-3 px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 ${
          isDragging ? 'relative z-10 opacity-80 shadow-lg' : ''
        }`}
      >
        <AnhThayThe
          anhId={cauThu.portraitImageId}
          ten={cauThu.name}
          mauNen={mauAo}
          kichThuoc="nho"
        />
        <span className="flex-1 truncate text-sm text-slate-900">
          {cauThu.name}
        </span>
        <span className="text-xs text-slate-500">
          {TRANG_CHIEN_THUAT.soAo(cauThu.shirtNumber)}
        </span>
      </button>
    </li>
  )
}

interface Props {
  readonly cauThu: readonly Player[]
  readonly mauAo: string
  /** true khi đội chưa có cầu thủ nào, để phân biệt với "ai cũng ở trên sân". */
  readonly doiRong: boolean
}

/**
 * Danh sách cầu thủ ngoài sân (AC-5.3, AC-5.6).
 *
 * Cả danh sách là một vùng thả: kéo một cầu thủ từ sân vào đây thì ô của họ
 * thành trống và họ quay về danh sách này.
 */
export function DanhSachNgoaiSan({ cauThu, mauAo, doiRong }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: ID_NGOAI_SAN })

  return (
    <section>
      <h3 className="text-lg font-semibold text-slate-900">
        {TRANG_CHIEN_THUAT.tieuDeNgoaiSan}
      </h3>

      <div
        ref={setNodeRef}
        className={`mt-2 rounded-lg border bg-white ${
          isOver ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
        }`}
      >
        {doiRong ? (
          <p className="px-3 py-4 text-sm text-slate-500">
            {TRANG_CHIEN_THUAT.chuaCoCauThu}
          </p>
        ) : cauThu.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500">
            {TRANG_CHIEN_THUAT.ngoaiSanTrong}
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {cauThu.map((p) => (
              <MucNgoaiSan key={p.id} cauThu={p} mauAo={mauAo} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
