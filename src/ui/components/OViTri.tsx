import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { OViTriSoDo } from '../../domain/formations'
import { MUC_TRU_HIEU_SUAT, type MucSai } from '../../domain/misplacement'
import { useChuoi } from '../../hooks/useNgonNgu'
import { chiSoChuaDat, type RoleId } from '../../domain/roles'
import type { Player } from '../../domain/types'

import { AnhThayThe } from './AnhThayThe'
import { idKeo, type DuLieuKeo } from './DanhSachNgoaiSan'

interface Props {
  readonly o: OViTriSoDo
  /** `null` là ô trống. */
  readonly cauThu: Player | null
  readonly mauAo: string
  /** Mức sai vị trí của cầu thủ đang đứng ở ô; `null` khi ô trống. */
  readonly mucSai: MucSai | null
  /** Vai trò gắn với ô này (AC-6.2, AC-6.6). */
  readonly roleId: RoleId
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
  dung: 'border-co-vien',
  nhe: 'border-sai-nhe',
  vua: 'border-sai-vua',
  nang: 'border-sai-nang',
}

/** Một ô trong đội hình trên sân (AC-5.1, AC-5.3, AC-5.4, AC-5.5). */
export function OViTri({
  o,
  cauThu,
  mauAo,
  mucSai,
  roleId,
  dangChon = false,
  onChon,
}: Props) {
  const { NHAN_VI_TRI, NHAN_VAI_TRO, SAI_VI_TRI, TRANG_CHIEN_THUAT, VAI_TRO } = useChuoi()
  const nhanViTri = NHAN_VI_TRI[o.viTri]

  // Cảnh báo ngay tại ô khi cầu thủ chưa đáp ứng vai trò (AC-6.4); chi tiết
  // từng chỉ số nằm trong bảng chọn vai trò.
  const chuaDat = cauThu === null ? [] : chiSoChuaDat(roleId, cauThu)

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
      ? TRANG_CHIEN_THUAT.nhanO(nhanViTri.ten)
      : TRANG_CHIEN_THUAT.oCoNguoi(
          nhanViTri.ten,
          cauThu.name,
          cauThu.shirtNumber,
        )

  const vien =
    mucSai === null ? 'border-co-vien-mo border-dashed' : VIEN_THEO_MUC[mucSai]

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
          isOver ? 'ring-2 ring-co-noi-bat ring-offset-2 ring-offset-co-nen' : ''
        } ${
          dangChon
            ? 'ring-2 ring-co-noi-bat ring-offset-2 ring-offset-co-nen'
            : ''
        } ${
          isDragging ? 'z-10 opacity-80' : ''
        } bg-co-o px-1 text-co-chu focus:ring-co-noi-bat focus:ring-offset-2 focus:ring-offset-co-nen`}
      >
        {cauThu === null ? (
          <>
            <span className="text-sm font-bold">{nhanViTri.vietTat}</span>
            <span className="text-[10px] leading-none text-co-chu-phu">
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
        <span className="max-w-full truncate text-center text-[11px] font-medium text-co-chu">
          {cauThu.name}
        </span>
      )}

      <span className="max-w-full truncate text-center text-[10px] leading-tight text-co-chu-phu">
        {NHAN_VAI_TRO[roleId].ten}
      </span>

      {chuaDat.length > 0 && (
        <span className="rounded bg-co-canh-bao-nen px-1 text-center text-[10px] leading-tight text-co-canh-bao-chu">
          {VAI_TRO.canhBaoNganTaiO(chuaDat.length)}
        </span>
      )}

      {mucSai !== null && mucSai !== 'dung' && (
        <span className="rounded bg-co-nhan-nen px-1 text-center text-[10px] leading-tight text-co-nhan-chu">
          {SAI_VI_TRI.nhan(mucSai, Math.round(MUC_TRU_HIEU_SUAT[mucSai] * 100))}
        </span>
      )}
    </div>
  )
}
