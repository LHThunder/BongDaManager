import {
  DndContext,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FORMATIONS, soDoTheoQuanSo, type FormationId } from '../../domain/formations'
import {
  CAC_QUAN_SO,
  QUAN_SO_MAC_DINH,
} from '../../engine/tran'
import {
  tinhTrangDoiHinh,
  type LyDoChuaDuDieuKien,
} from '../../domain/lineup'
import { mucSaiViTri } from '../../domain/misplacement'
import { vaiTroMacDinh } from '../../domain/roles'
import { layViTri } from '../../domain/positions'
import type { Player } from '../../domain/types'
import { usePlayers } from '../../hooks/usePlayers'
import { useTactic } from '../../hooks/useTactic'
import { useTeams } from '../../hooks/useTeams'
import { useAppStore } from '../../store/appStore'
import { AnhThayThe } from '../components/AnhThayThe'
import {
  DanhSachNgoaiSan,
  ID_NGOAI_SAN,
  type DuLieuKeo,
} from '../components/DanhSachNgoaiSan'
import { OViTri, type DuLieuO } from '../components/OViTri'
import { SanBong } from '../components/SanBong'
import { BoChienThuat } from '../components/BoChienThuat'
import { ChiThiDoi } from '../components/ChiThiDoi'
import { ChonVaiTro } from '../components/ChonVaiTro'
import {
  CHUNG,
  DOI_SO_DO,
  MUC_SAI_VI_TRI,
  TEN_SO_DO,
  TINH_TRANG_DOI_HINH,
  TRANG_CHIEN_THUAT,
} from '../strings'

interface Props {
  readonly teamId: string
  readonly onQuayLai: () => void
}

/*
  Phím mũi tên NHẢY GIỮA CÁC ĐÍCH THẢ, không đẩy từng 25px như mặc định của
  @dnd-kit (AC-5.9).

  Mặc định hợp với danh sách xếp hàng; ở đây 11 ô nằm rải trên sân theo toạ độ
  phần trăm, nên đẩy từng ít một làm người dùng phải nhấn chục lần mới sang
  được ô bên cạnh. Hàm này tìm đích gần nhất về phía mũi tên rồi trả thẳng
  toạ độ của nó.

  Đây là điểm mở rộng CÓ SẴN của `KeyboardSensor`, không phải cơ chế bàn phím
  thứ hai tự viết.
*/
const nhayGiuaCacO: KeyboardCoordinateGetter = (
  su,
  { currentCoordinates, context },
) => {
  const huong = {
    [KeyboardCode.Down]: [0, 1],
    [KeyboardCode.Up]: [0, -1],
    [KeyboardCode.Left]: [-1, 0],
    [KeyboardCode.Right]: [1, 0],
  }[su.code as string]

  if (!huong) return undefined

  const goc = context.collisionRect
  if (!goc) return undefined

  const [dx, dy] = huong
  const tamGoc = { x: goc.left + goc.width / 2, y: goc.top + goc.height / 2 }

  let tot: { x: number; y: number } | null = null
  let khoangCachTot = Number.POSITIVE_INFINITY

  for (const [id, dich] of context.droppableContainers) {
    if (dich.disabled) continue
    const r = context.droppableRects.get(id)
    if (!r) continue

    const tam = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    const lechX = tam.x - tamGoc.x
    const lechY = tam.y - tamGoc.y

    // Chỉ nhận đích nằm về phía mũi tên, và phải nhích được một quãng thật.
    const theoHuong = lechX * dx + lechY * dy
    if (theoHuong <= 8) continue

    // Lệch ngang quá nhiều so với quãng đi tới thì không coi là cùng hướng.
    const lechNgang = Math.abs(dx === 0 ? lechX : lechY)
    if (lechNgang > theoHuong * 1.5) continue

    const khoangCach = Math.hypot(lechX, lechY)
    if (khoangCach < khoangCachTot) {
      khoangCachTot = khoangCach
      tot = tam
    }
  }

  if (!tot) return undefined

  /*
    Căn TÂM với tâm, không căn góc trên-trái: mục kéo từ danh sách ngoài sân
    rộng gần 300px còn ô trên sân chỉ 80px, nên căn góc sẽ để tâm mục kéo lệch
    hẳn ra ngoài ô và `closestCenter` lại chọn đúng vùng vừa rời đi.
  */
  return {
    x: currentCoordinates.x + (tot.x - tamGoc.x),
    y: currentCoordinates.y + (tot.y - tamGoc.y),
  }
}

/** Câu tiếng Việt cho một lý do đội hình chưa đủ điều kiện (AC-5.7). */
function cauLyDo(
  ly: LyDoChuaDuDieuKien,
  cauThu: readonly Player[],
  soO: number,
): string {
  switch (ly.loai) {
    case 'thieu-nguoi':
      return TINH_TRANG_DOI_HINH.thieuNguoi(ly.soONhanNguoi, soO)
    case 'thieu-thu-mon':
      return TINH_TRANG_DOI_HINH.thieuThuMon
    case 'ho-so-chua-hoan-tat':
      return TINH_TRANG_DOI_HINH.hoSoChuaHoanTat(
        ly.cacPlayerId.map(
          (id) => cauThu.find((p) => p.id === id)?.name ?? id,
        ),
      )
  }
}

/*
  Trang chiến thuật của một đội (AC-5.1).

  Tên đội và màu áo đọc từ store dùng chung — KHÔNG giữ bản sao riêng của
  đội ở đây. Đổi tên đội ở danh sách đội thì trang này thấy tên mới ngay
  (AC-1.5). Hai selector dưới đây đều trả giá trị nguyên thuỷ, nên zustand
  so sánh bằng Object.is không bị render lặp.
*/
export function TrangChienThuat({ teamId, onQuayLai }: Props) {
  const tenDoi = useAppStore(
    (s) => s.teams.find((d) => d.id === teamId)?.name ?? null,
  )
  const mauAo = useAppStore(
    (s) => s.teams.find((d) => d.id === teamId)?.primaryColor ?? '#1E40AF',
  )
  const logoId = useAppStore(
    (s) => s.teams.find((d) => d.id === teamId)?.logoImageId ?? null,
  )

  /*
    Quân số đang mở (AC-13.6). Mỗi quân số có bộ chiến thuật RIÊNG, nên đổi
    con số này là mở sang một bộ khác chứ không phải sửa bộ đang có — đội
    hình đã xếp ở quân số kia còn nguyên (quyết định D64).
  */
  const [quanSo, datQuanSo] = useState<number>(QUAN_SO_MAC_DINH)

  const { napDanhSachDoi } = useTeams()
  const { cauThu, napCauThu } = usePlayers(teamId)
  const {
    chienThuat,
    napChienThuat,
    doiSoDo,
    datCauThuVaoO,
    boKhoiSan,
    datVaiTroChoO,
    datChiThi,
    cacBo,
    napDanhSachBo,
    luuThanhBo,
    apDungBo,
  } = useTactic(teamId, quanSo)

  /** Ô đang mở bảng chọn vai trò; `null` là không mở ô nào. */
  const [oDangChon, datODangChon] = useState<string | null>(null)
  /** Thông báo sau khi đổi sơ đồ (AC-5.8); tự mất khi đổi sơ đồ lần sau. */
  const [baoDoiSoDo, datBaoDoiSoDo] = useState<readonly string[]>([])

  /*
    Ngưỡng 5px: không có nó thì mỗi cú bấm chuột đều bị tính là bắt đầu kéo,
    và nút trong ô sẽ không còn bấm được (Giai đoạn 3 cần cú bấm đó để mở
    bảng chọn vai trò).
  */
  const boCamBien = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: nhayGiuaCacO }),
  )

  /*
    Tên dễ đọc của một đích thả, để thông báo cho trình đọc màn hình nói
    "ô Trung vệ" chứ không phải "o:o3".
  */
  const tenDich = useCallback(
    (id: string | number | undefined): string => {
      if (id === undefined) return ''
      if (id === ID_NGOAI_SAN) return TRANG_CHIEN_THUAT.tenVungNgoaiSan
      const slotId = String(id).replace(/^o:/, '')
      const oSoDo = chienThuat?.oVien.find((o) => o.slotId === slotId)
      if (!oSoDo) return String(id)
      const soDoHienTai = FORMATIONS.find(
        (s) => s.id === chienThuat?.formationId,
      )
      const viTri = soDoHienTai?.oVien.find((o) => o.slotId === slotId)?.viTri
      return viTri ? TRANG_CHIEN_THUAT.nhanO(layViTri(viTri).ten) : String(id)
    },
    [chienThuat],
  )

  const tenNguoiKeo = useCallback(
    (id: string | number | undefined): string => {
      const playerId = String(id ?? '').replace(/^cau-thu:/, '')
      return cauThu.find((p) => p.id === playerId)?.name ?? ''
    },
    [cauThu],
  )

  const thongBao = useMemo(
    () => ({
      onDragStart: ({ active }: { active: { id: string | number } }) =>
        TRANG_CHIEN_THUAT.baoNhacLen(tenNguoiKeo(active.id)),
      onDragOver: ({ over }: { over: { id: string | number } | null }) =>
        over ? TRANG_CHIEN_THUAT.baoDangOTren(tenDich(over.id)) : undefined,
      onDragEnd: ({ over }: { over: { id: string | number } | null }) =>
        over
          ? TRANG_CHIEN_THUAT.baoDatXuong(tenDich(over.id))
          : TRANG_CHIEN_THUAT.baoDatLaiChoCu,
      onDragCancel: () => TRANG_CHIEN_THUAT.baoThoiNhac,
    }),
    [tenDich, tenNguoiKeo],
  )

  /**
   * Đổi sơ đồ rồi nói rõ ai bị ảnh hưởng (AC-5.8): ai không còn ô phù hợp và
   * phải ra ngoài, ai vẫn trên sân nhưng đang đá sai vị trí sở trường.
   */
  const khiDoiSoDo = useCallback(
    async (formationId: FormationId) => {
      const ketQua = await doiSoDo(formationId)
      datODangChon(null)
      if (!ketQua) {
        datBaoDoiSoDo([])
        return
      }

      const ten = (id: string) =>
        cauThu.find((p) => p.id === id)?.name ?? id
      const cau: string[] = [DOI_SO_DO.daXepLai(TEN_SO_DO[formationId])]

      if (ketQua.nguoiBiDayRa.length > 0) {
        cau.push(DOI_SO_DO.biDayRa(ketQua.nguoiBiDayRa.map(ten)))
      }
      if (ketQua.nguoiXepSai.length > 0) {
        cau.push(
          DOI_SO_DO.biXepSai(
            ketQua.nguoiXepSai.map(
              (s) => `${ten(s.playerId)} (${MUC_SAI_VI_TRI[s.mucSai]})`,
            ),
          ),
        )
      }

      datBaoDoiSoDo(cau)
    },
    [cauThu, doiSoDo],
  )

  const khiThaXong = useCallback(
    (su: DragEndEvent) => {
      const keo = su.active.data.current as DuLieuKeo | undefined
      if (!keo?.playerId || !su.over) return

      if (su.over.id === ID_NGOAI_SAN) {
        void boKhoiSan(keo.playerId)
        return
      }

      const oDich = su.over.data.current as DuLieuO | undefined
      if (oDich?.slotId) {
        void datCauThuVaoO(oDich.slotId, keo.playerId)
      }
    },
    [boKhoiSan, datCauThuVaoO],
  )

  // Mở thẳng trang này (ví dụ sau khi tải lại) thì store có thể chưa có đội.
  useEffect(() => {
    if (tenDoi === null) void napDanhSachDoi()
  }, [tenDoi, napDanhSachDoi])

  useEffect(() => {
    void napCauThu()
  }, [napCauThu])

  useEffect(() => {
    void napChienThuat()
  }, [napChienThuat])

  useEffect(() => {
    void napDanhSachBo()
  }, [napDanhSachBo])

  const cauThuTheoId = useMemo(
    () => new Map(cauThu.map((p) => [p.id, p])),
    [cauThu],
  )

  const idTrenSan = useMemo(
    () =>
      new Set(
        (chienThuat?.oVien ?? [])
          .map((o) => o.playerId)
          .filter((id): id is string => id !== null),
      ),
    [chienThuat],
  )

  const ngoaiSan = useMemo(
    () => cauThu.filter((p) => !idTrenSan.has(p.id)),
    [cauThu, idTrenSan],
  )

  if (!chienThuat) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
  }

  const soDo = FORMATIONS.find((s) => s.id === chienThuat.formationId)
  if (!soDo) {
    return <p className="text-slate-500">{CHUNG.dangTai}</p>
  }

  const nguoiTheoSlot = new Map<string, Player | null>(
    chienThuat.oVien.map((o) => [
      o.slotId,
      o.playerId === null ? null : (cauThuTheoId.get(o.playerId) ?? null),
    ]),
  )

  const vaiTroTheoSlot = new Map(
    chienThuat.oVien.map((o) => [o.slotId, o.roleId]),
  )

  const tinhTrang = tinhTrangDoiHinh(
    chienThuat.formationId,
    chienThuat.oVien,
    cauThu,
  )

  const oMoBang = oDangChon
    ? soDo.oVien.find((o) => o.slotId === oDangChon)
    : undefined

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CHUNG.quayLai}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AnhThayThe
            anhId={logoId}
            ten={tenDoi ?? ''}
            mauNen={mauAo}
            kichThuoc="lon"
          />
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              {TRANG_CHIEN_THUAT.tieuDe}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              {tenDoi ?? CHUNG.dangTai}
            </h2>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          {TRANG_CHIEN_THUAT.nhanChonQuanSo}
          <select
            value={quanSo}
            onChange={(e) => {
              datQuanSo(Number(e.target.value))
              datBaoDoiSoDo([])
            }}
            className="rounded border border-slate-300 px-2 py-1 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {CAC_QUAN_SO.map((n) => (
              <option key={n} value={n}>
                {TRANG_CHIEN_THUAT.nhanQuanSo(n)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          {TRANG_CHIEN_THUAT.nhanChonSoDo}
          <select
            value={chienThuat.formationId}
            onChange={(e) => {
              void khiDoiSoDo(e.target.value as FormationId)
            }}
            className="rounded border border-slate-300 px-2 py-1 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {/*
              Chỉ những sơ đồ CÙNG QUÂN SỐ với bộ đang mở (AC-13.1). Bảng sơ
              đồ từ spec 002 chứa cả sơ đồ 5 tới 10 người, mà đổi sang một sơ
              đồ khác số ô thì đội hình đang xếp không còn chỗ cho người.
            */}
            {soDoTheoQuanSo(soDo.oVien.length).map((s) => (
              <option key={s.id} value={s.id}>
                {TEN_SO_DO[s.id]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Dải tình trạng đội hình (AC-5.7, phần chặn giả lập thuộc GĐ3). */}
      <div
        role="status"
        className={`mt-4 rounded-lg border p-3 ${
          tinhTrang.duDieuKien
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        {tinhTrang.duDieuKien ? (
          <p className="text-sm text-emerald-900">
            {TINH_TRANG_DOI_HINH.sanSang}
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-amber-900">
              {TINH_TRANG_DOI_HINH.tieuDeChuaDu}
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-amber-900">
              {tinhTrang.cacLyDo.map((ly) => (
                <li key={ly.loai}>{cauLyDo(ly, cauThu, soDo.oVien.length)}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {baoDoiSoDo.length > 0 && (
        <div
          role="status"
          className="mt-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          {baoDoiSoDo.map((c) => (
            <p key={c} className="text-sm text-slate-700">
              {c}
            </p>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-slate-500">
        {TRANG_CHIEN_THUAT.huongDanBanPhim}
      </p>

      <DndContext
        sensors={boCamBien}
        collisionDetection={closestCenter}
        onDragEnd={khiThaXong}
        accessibility={{
          announcements: thongBao,
          screenReaderInstructions: {
            draggable: TRANG_CHIEN_THUAT.huongDanDocManHinh,
          },
        }}
      >
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <SanBong
              soDo={soDo}
              renderO={(o) => {
                const nguoi = nguoiTheoSlot.get(o.slotId) ?? null
                return (
                  <OViTri
                    o={o}
                    cauThu={nguoi}
                    mauAo={mauAo}
                    mucSai={
                      nguoi === null
                        ? null
                        : mucSaiViTri(o.viTri, nguoi.positions)
                    }
                    roleId={vaiTroTheoSlot.get(o.slotId) ?? vaiTroMacDinh(o.viTri)}
                    dangChon={oDangChon === o.slotId}
                    onChon={() =>
                      datODangChon((hienTai) =>
                        hienTai === o.slotId ? null : o.slotId,
                      )
                    }
                  />
                )
              }}
            />
          </div>

          <div className="space-y-6">
            {oMoBang && (
              <ChonVaiTro
                viTri={oMoBang.viTri}
                vaiTroHienTai={
                  vaiTroTheoSlot.get(oMoBang.slotId) ?? vaiTroMacDinh(oMoBang.viTri)
                }
                cauThu={nguoiTheoSlot.get(oMoBang.slotId) ?? null}
                onChon={(roleId) => {
                  void datVaiTroChoO(oMoBang.slotId, roleId)
                }}
                onDong={() => datODangChon(null)}
              />
            )}

            <DanhSachNgoaiSan
              cauThu={ngoaiSan}
              mauAo={mauAo}
              doiRong={cauThu.length === 0}
            />
          </div>
        </div>
      </DndContext>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChiThiDoi
          chiThi={chienThuat.chiThi}
          onDoi={(chiThi) => {
            void datChiThi(chiThi)
          }}
        />

        <BoChienThuat
          cacBo={cacBo}
          idDangDung={chienThuat.id}
          onLuuThanhBo={(ten) => {
            void luuThanhBo(ten)
          }}
          onApDung={(id) => {
            datODangChon(null)
            datBaoDoiSoDo([])
            void apDungBo(id)
          }}
        />
      </div>
    </div>
  )
}
