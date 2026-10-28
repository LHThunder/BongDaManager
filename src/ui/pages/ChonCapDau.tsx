import { useCallback, useEffect, useMemo, useState } from 'react'
import { trungMauAo } from '../../domain/colors'
import { xepLaiKhiDoiSoDo } from '../../domain/lineup'
import type { Player, Tactic } from '../../domain/types'
import {
  SO_CAU_THU_CHINH,
  SO_CAU_THU_DU_BI,
  type LyDoKhongBatDau,
} from '../../engine/batDau'
import { taoMaTran } from '../../engine/rng'
import type { CauHinhTran, DangKyBen } from '../../engine/tran'
import { useMatch } from '../../hooks/useMatch'
import { useTeams } from '../../hooks/useTeams'
import * as playerRepo from '../../services/playerRepo'
import * as tacticRepo from '../../services/tacticRepo'
import { useAppStore } from '../../store/appStore'
import { AnhThayThe } from '../components/AnhThayThe'
import {
  DangKyDoiHinh,
  type VaiTroDangKy,
} from '../components/DangKyDoiHinh'
import {
  CHON_CAP_DAU,
  CHUNG,
  LY_DO_KHONG_BAT_DAU,
  TINH_TRANG_DOI_HINH,
} from '../strings'

interface Props {
  readonly onQuayLai: () => void
  readonly onDaBatDau: () => void
}

interface DuLieuDoi {
  readonly cauThu: readonly Player[]
  readonly chienThuat: Tactic
}

/** Nguồn ngẫu nhiên THẬT, tạo ở lớp giao diện — engine không được tự gọi (P1). */
const RNG_THAT = { next: () => Math.random() }

/**
 * Đăng ký mặc định: lấy trước những người đã được xếp trong chiến thuật, rồi
 * bù cho đủ 11 từ danh sách đội, rồi 7 dự bị.
 *
 * Phần bù là bắt buộc chứ không phải cho đẹp: đội vừa tạo có bộ chiến thuật
 * mặc định với 11 ô TRỐNG, nên nếu chỉ lấy theo chiến thuật thì màn này mở ra
 * với 0/11 chính và người dùng phải tự bấm đủ 11 lần.
 */
function dangKyMacDinh(
  cauThu: readonly Player[],
  chienThuat: Tactic,
): Record<string, VaiTroDangKy> {
  const trongSoDo = new Set(
    chienThuat.oVien
      .map((o) => o.playerId)
      .filter((id): id is string => id !== null),
  )

  const ra: Record<string, VaiTroDangKy> = {}
  let soChinh = 0

  for (const p of cauThu) {
    if (trongSoDo.has(p.id) && soChinh < SO_CAU_THU_CHINH) {
      ra[p.id] = 'chinh'
      soChinh += 1
    }
  }

  let soDuBi = 0
  for (const p of cauThu) {
    if (ra[p.id]) continue
    if (soChinh < SO_CAU_THU_CHINH) {
      ra[p.id] = 'chinh'
      soChinh += 1
    } else if (soDuBi < SO_CAU_THU_DU_BI) {
      ra[p.id] = 'du-bi'
      soDuBi += 1
    } else {
      ra[p.id] = 'ngoai'
    }
  }

  return ra
}

/** Màn chọn cặp đấu, chỉ định chủ nhà và đăng ký 11+7 (AC-8.9, AC-8.10, AC-9.9). */
export function ChonCapDau({ onQuayLai, onDaBatDau }: Props) {
  const teams = useAppStore((s) => s.teams)
  const { napDanhSachDoi } = useTeams()
  const { batDauTran, lyDoKhongBatDau } = useMatch()

  const [idNha, datIdNha] = useState('')
  const [idKhach, datIdKhach] = useState('')
  const [sanTrungLap, datSanTrungLap] = useState(false)
  const [maTran, datMaTran] = useState(() => taoMaTran(RNG_THAT))
  const [duLieu, datDuLieu] = useState<Record<string, DuLieuDoi>>({})
  const [dangKy, datDangKy] = useState<
    Record<string, Record<string, VaiTroDangKy>>
  >({})

  useEffect(() => {
    void napDanhSachDoi()
  }, [napDanhSachDoi])

  // Nạp cầu thủ và chiến thuật của đội vừa được chọn.
  const napDoi = useCallback(
    async (teamId: string) => {
      if (teamId === '' || duLieu[teamId]) return
      const [cauThu, chienThuat] = await Promise.all([
        playerRepo.listByTeam(teamId),
        tacticRepo.layChienThuatDangDung(teamId),
      ])
      datDuLieu((cu) => ({ ...cu, [teamId]: { cauThu, chienThuat } }))
      datDangKy((cu) => ({
        ...cu,
        [teamId]: dangKyMacDinh(cauThu, chienThuat),
      }))
    },
    [duLieu],
  )

  useEffect(() => {
    void napDoi(idNha)
  }, [idNha, napDoi])
  useEffect(() => {
    void napDoi(idKhach)
  }, [idKhach, napDoi])

  const doiNha = teams.find((d) => d.id === idNha)
  const doiKhach = teams.find((d) => d.id === idKhach)

  const trungMau = useMemo(
    () =>
      doiNha && doiKhach
        ? trungMauAo(doiNha.primaryColor, doiKhach.primaryColor)
        : false,
    [doiNha, doiKhach],
  )

  const dungBen = (teamId: string): DangKyBen | null => {
    const dl = duLieu[teamId]
    const dk = dangKy[teamId]
    if (!dl || !dk) return null

    const theoVaiTro = (v: VaiTroDangKy) =>
      dl.cauThu.filter((p) => dk[p.id] === v).map((p) => p.id)

    const trenSan = theoVaiTro('chinh')

    /*
      11 người vừa đăng ký phải được XẾP THẬT vào 11 ô của sơ đồ: ô mới là
      nơi mang vị trí và vai trò, và `tinhTrangDoiHinh` đọc từ đó. Nếu chỉ
      ghi tên vào `trenSan` thì màn này báo "11/11 chính" trong khi đội hình
      vẫn rỗng — hai câu trái ngược nhau trên cùng một màn.

      Dùng lại `xepLaiKhiDoiSoDo` của domain, chính hàm mà trang chiến thuật
      dùng khi đổi sơ đồ, nên cách xếp ở hai chỗ không bao giờ lệch nhau.
    */
    const hoSoTheoId = new Map(dl.cauThu.map((p) => [p.id, p]))

    /*
      `xepLaiKhiDoiSoDo` lấy danh sách người TỪ đội hình truyền vào, nên phải
      gieo 11 người đã đăng ký vào ô trước — ô nào cũng được — rồi nó mới
      tráo lại cho khớp vị trí sở trường. Gieo theo thứ tự ô là đủ, vì bước
      sau sẽ sắp lại hết.
    */
    const gieo = dl.chienThuat.oVien.map((o, i) => ({
      slotId: o.slotId,
      playerId: trenSan[i] ?? null,
    }))

    const ketQuaXep = xepLaiKhiDoiSoDo(
      dl.chienThuat.formationId,
      gieo,
      trenSan.map((id) => ({
        id,
        positions: hoSoTheoId.get(id)?.positions ?? [],
      })),
    )
    const vaiTroTheoSlot = new Map(
      dl.chienThuat.oVien.map((o) => [o.slotId, o.roleId]),
    )

    return {
      teamId,
      chienThuatXuatPhat: {
        ...dl.chienThuat,
        oVien: ketQuaXep.oVien.map((o) => ({
          slotId: o.slotId,
          playerId: o.playerId,
          roleId:
            vaiTroTheoSlot.get(o.slotId) ??
            dl.chienThuat.oVien[0].roleId,
        })),
      },
      trenSan,
      duBi: theoVaiTro('du-bi'),
      cacCauThu: dl.cauThu.map((p) => ({
        id: p.id,
        positions: p.positions,
        attributes: p.attributes,
        gkAttributes: p.gkAttributes,
      })),
    }
  }

  const batDau = () => {
    const nha = dungBen(idNha)
    const khach = dungBen(idKhach)
    if (!nha || !khach) return

    const cauHinh: CauHinhTran = { maTran, nha, khach, sanTrungLap }
    if (batDauTran(cauHinh)) onDaBatDau()
  }

  const tenDoi = (ben: 'nha' | 'khach') =>
    (ben === 'nha' ? doiNha?.name : doiKhach?.name) ?? ''

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {CHUNG.quayLai}
      </button>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">
        {CHON_CAP_DAU.tieuDe}
      </h2>

      {teams.length < 2 ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {CHON_CAP_DAU.canHaiDoi}
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ['nha', CHON_CAP_DAU.nhanDoiNha, idNha, datIdNha, doiNha],
                [
                  'khach',
                  CHON_CAP_DAU.nhanDoiKhach,
                  idKhach,
                  datIdKhach,
                  doiKhach,
                ],
              ] as const
            ).map(([ben, nhan, giaTri, dat, doi]) => (
              <label key={ben} className="text-sm text-slate-700">
                <span className="block font-medium">{nhan}</span>
                <span className="mt-1 flex items-center gap-2">
                  {doi && (
                    <AnhThayThe
                      anhId={doi.logoImageId}
                      ten={doi.name}
                      mauNen={doi.primaryColor}
                      kichThuoc="nho"
                    />
                  )}
                  <select
                    value={giaTri}
                    onChange={(e) => dat(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2 py-1 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">{CHON_CAP_DAU.chonDoi}</option>
                    {teams.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            ))}
          </div>

          {trungMau && doiKhach && (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {CHON_CAP_DAU.doiTrungMauAo(doiKhach.name)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={sanTrungLap}
                onChange={(e) => datSanTrungLap(e.target.checked)}
                className="h-4 w-4"
              />
              <span>
                <span className="block font-medium">
                  {CHON_CAP_DAU.sanTrungLap}
                </span>
                <span className="block text-xs text-slate-500">
                  {CHON_CAP_DAU.moTaSanTrungLap}
                </span>
              </span>
            </label>

            <div className="text-sm text-slate-700">
              <span className="block font-medium">
                {CHON_CAP_DAU.nhanMaTran}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">
                  {maTran}
                </code>
                <button
                  type="button"
                  onClick={() => datMaTran(taoMaTran(RNG_THAT))}
                  className="text-xs text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {CHON_CAP_DAU.maTranMoi}
                </button>
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {CHON_CAP_DAU.moTaMaTran}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {([idNha, idKhach] as const).map((id, i) =>
              id && duLieu[id] ? (
                <DangKyDoiHinh
                  key={id}
                  tenDoi={tenDoi(i === 0 ? 'nha' : 'khach')}
                  cauThu={duLieu[id].cauThu}
                  dangKy={dangKy[id] ?? {}}
                  onDoi={(playerId, vaiTro) =>
                    datDangKy((cu) => ({
                      ...cu,
                      [id]: { ...(cu[id] ?? {}), [playerId]: vaiTro },
                    }))
                  }
                />
              ) : null,
            )}
          </div>

          {lyDoKhongBatDau.length > 0 && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <p className="text-sm font-medium text-amber-900">
                {CHON_CAP_DAU.tieuDeChuaBatDauDuoc}
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-amber-900">
                {lyDoKhongBatDau.map((ly, i) => (
                  <li key={`${ly.loai}-${i}`}>{cauLyDo(ly, tenDoi)}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={batDau}
            disabled={idNha === '' || idKhach === ''}
            className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {CHON_CAP_DAU.batDau}
          </button>
        </>
      )}
    </div>
  )
}

/** Câu tiếng Việt cho một lý do không bắt đầu được. */
function cauLyDo(
  ly: LyDoKhongBatDau,
  tenDoi: (ben: 'nha' | 'khach') => string,
): string {
  switch (ly.loai) {
    case 'cung-mot-doi':
      return LY_DO_KHONG_BAT_DAU.cungMotDoi
    case 'chua-du-chinh':
      return LY_DO_KHONG_BAT_DAU.chuaDuChinh(
        tenDoi(ly.doi),
        ly.soCo,
        ly.soCan,
      )
    case 'chua-dung-du-bi':
      return LY_DO_KHONG_BAT_DAU.chuaDungDuBi(
        tenDoi(ly.doi),
        ly.soCo,
        ly.soCan,
      )
    case 'doi-hinh-chua-du':
      return ly.cacLyDo
        .map((l) => {
          switch (l.loai) {
            case 'thieu-thu-mon':
              return LY_DO_KHONG_BAT_DAU.thieuThuMon(tenDoi(ly.doi))
            case 'thieu-nguoi':
              return TINH_TRANG_DOI_HINH.thieuNguoi(l.soONhanNguoi, 11)
            case 'ho-so-chua-hoan-tat':
              return LY_DO_KHONG_BAT_DAU.hoSoChuaHoanTat(
                tenDoi(ly.doi),
                l.cacPlayerId,
              )
          }
        })
        .join(' ')
  }
}
