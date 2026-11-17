import { BieuTuong } from '../components/BieuTuong'
import { useEffect, useState } from 'react'
import { SO_CAU_THU_DU_BI_TOI_DA } from '../../engine/batDau'
import { CAC_QUAN_SO } from '../../engine/tran'
import { soDoTheoQuanSo } from '../../domain/formations'
import { CAC_MUC_DO, sinhDoi, type MucDo } from '../../domain/generator'
import { KHO_TEN_ANH, KHO_TEN_VIET } from '../../domain/tenNgauNhien'
import type { Rng } from '../../domain/types'
import { ghiNhanLoiLuuTru } from '../../hooks/useBackup'
import { coTranDangDien, useTeams } from '../../hooks/useTeams'
import { laLoiUngDung, type LoiUngDung } from '../../services/errors'
import * as teamRepo from '../../services/teamRepo'
import type { TeamSummary } from '../../services/teamRepo'
import { useAppStore } from '../../store/appStore'
import { useChuoi } from '../../hooks/useNgonNgu'
import { AnhThayThe } from '../components/AnhThayThe'
import { FormDoi } from '../components/FormDoi'
import { HopXacNhan } from '../components/HopXacNhan'
import { SaoLuu } from '../components/SaoLuu'

interface Props {
  readonly onMoDoi: (teamId: string) => void
}

type HopDangMo =
  | { readonly loai: 'khong' }
  | { readonly loai: 'tao' }
  | { readonly loai: 'sinh' }
  | { readonly loai: 'sua'; readonly doi: TeamSummary }
  | { readonly loai: 'nhanBan'; readonly doi: TeamSummary }
  | { readonly loai: 'xoa'; readonly doi: TeamSummary }

/** Nguồn ngẫu nhiên thật, tạo ở lớp giao diện — domain không được tự gọi (P1). */
const RNG_THAT: Rng = { next: () => Math.random() }

/**
 * Hộp sinh một đội ngẫu nhiên (AC-24.4, AC-24.6).
 *
 * `SO_CAU_THU_DU_BI_TOI_DA` được đọc **ở đây** rồi truyền xuống `domain`:
 * hằng số ấy ở tầng `engine`, và `domain` import `engine` là phụ thuộc vòng.
 * `ui` thì đọc được cả hai tầng, nên đây là chỗ đúng để hai con số gặp nhau.
 */
function HopSinhDoi({
  onXong,
  onHuy,
}: {
  readonly onXong: (teamId: string) => void
  readonly onHuy: () => void
}) {
  const { CHUNG, DANH_SACH_DOI, NHAN_MUC_DO, LOI, NHAN_CHI_SO } = useChuoi()
  const ngonNgu = useAppStore((s) => s.ngonNgu)

  const [ten, datTen] = useState(DANH_SACH_DOI.sinhDoiTenMacDinh)
  const [muc, datMuc] = useState<MucDo>('kha')
  const [quanSo, datQuanSo] = useState(11)
  const [dangLam, datDangLam] = useState(false)
  const [loi, datLoi] = useState<LoiUngDung | string | null>(null)

  async function gui() {
    datLoi(null)
    datDangLam(true)
    try {
      const soDo = soDoTheoQuanSo(quanSo)[0]
      if (!soDo) throw new Error(`Không có sơ đồ cho quân số ${quanSo}`)

      const cacCauThu = sinhDoi(
        {
          muc,
          kho: ngonNgu === 'vi' ? KHO_TEN_VIET : KHO_TEN_ANH,
          soDo,
          soDuBi: SO_CAU_THU_DU_BI_TOI_DA,
        },
        RNG_THAT,
      )

      const doi = await teamRepo.taoDoiSinhRa({
        name: ten,
        cacCauThu,
        formationId: soDo.id,
      })
      onXong(doi.id)
    } catch (e) {
      datLoi(laLoiUngDung(e) ? e : String(e))
      datDangLam(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-lop-phu p-4">
      <form
        className="my-8 w-full max-w-lg rounded-lg bg-nen-the p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault()
          void gui()
        }}
      >
        <h2 className="text-lg font-semibold text-chu">
          {DANH_SACH_DOI.sinhDoiTieuDe}
        </h2>
        <p className="mt-1 text-sm text-chu-phu">
          {DANH_SACH_DOI.sinhDoiMoTa}
        </p>

        <label className="mt-4 block text-sm font-medium text-chu">
          {DANH_SACH_DOI.sinhDoiNhanTen}
          <input
            type="text"
            value={ten}
            onChange={(e) => {
              datTen(e.target.value)
              datLoi(null)
            }}
            className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-2 text-chu"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-chu">
          {DANH_SACH_DOI.sinhDoiNhanMucDo}
          <select
            value={muc}
            onChange={(e) => datMuc(e.target.value as MucDo)}
            className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-2 text-chu"
          >
            {CAC_MUC_DO.map((m) => (
              <option key={m.id} value={m.id}>
                {NHAN_MUC_DO[m.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-medium text-chu">
          {DANH_SACH_DOI.sinhDoiNhanQuanSo}
          <select
            value={quanSo}
            onChange={(e) => datQuanSo(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-2 text-chu"
          >
            {CAC_QUAN_SO.map((n) => (
              <option key={n} value={n}>
                {DANH_SACH_DOI.sinhDoiQuanSo(n, SO_CAU_THU_DU_BI_TOI_DA)}
              </option>
            ))}
          </select>
        </label>

        {loi !== null && (
          <p role="alert" className="mt-3 text-sm text-loi-chu">
            {typeof loi === 'string'
              ? loi
              : LOI.cau(loi, (id) => NHAN_CHI_SO[id])}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onHuy}
            className="rounded-md border border-vien-dam px-4 py-2 text-sm font-medium text-chu hover:bg-nen-nhan"
          >
            {CHUNG.huy}
          </button>
          <button
            type="submit"
            disabled={dangLam}
            className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:bg-nen-nhan disabled:text-chu-phu"
          >
            {dangLam
              ? DANH_SACH_DOI.sinhDoiDangLam
              : DANH_SACH_DOI.sinhDoiXacNhan}
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * Trạng thái trống và danh sách đội (AC-1.1, AC-1.4), kèm lối vào tạo, sửa
 * tên và xoá đội.
 */
export function DanhSachDoi({ onMoDoi }: Props) {
  const { CHUNG, DANH_SACH_DOI, XOA_DOI } = useChuoi()

  const { teams, dangTai, napDanhSachDoi, xoaDoi } = useTeams()
  const tran = useAppStore((s) => s.tran)
  const [hop, datHop] = useState<HopDangMo>({ loai: 'khong' })

  /**
   * Nhân bản một đội rồi nạp lại danh sách (AC-26.1).
   *
   * Lỗi lưu trữ đi qua `ghiNhanLoiLuuTru` để hiện ở **một chỗ duy nhất** của
   * ứng dụng (AC-4.7), đúng cách `useTeams` làm — không mọc thêm một ô báo
   * lỗi thứ hai trên màn hình này.
   */
  async function nhanBanDoi(doi: TeamSummary): Promise<void> {
    try {
      await teamRepo.nhanBan(doi.id, DANH_SACH_DOI.nhanBanTenMoi(doi.name))
      await napDanhSachDoi()
    } catch (loi) {
      ghiNhanLoiLuuTru(loi)
    }
  }

  useEffect(() => {
    void napDanhSachDoi()
  }, [napDanhSachDoi])

  if (dangTai && teams.length === 0) {
    return <p className="text-chu-phu">{CHUNG.dangTai}</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-chu">
          <BieuTuong ten="doi" />
          {DANH_SACH_DOI.tieuDe}
        </h2>
        {teams.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => datHop({ loai: 'sinh' })}
              className="rounded-md border border-vien-dam px-4 py-2 text-sm font-medium text-chu hover:bg-nen-nhan"
            >
              {DANH_SACH_DOI.sinhDoi}
            </button>
            <button
              type="button"
              onClick={() => datHop({ loai: 'tao' })}
              className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
            >
              {DANH_SACH_DOI.taoDoi}
            </button>
          </div>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-vien-dam bg-nen-the p-10 text-center">
          <h3 className="text-lg font-medium text-chu">
            {DANH_SACH_DOI.trongTieuDe}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-chu-phu">
            {DANH_SACH_DOI.trongMoTa}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => datHop({ loai: 'tao' })}
              className="rounded-md bg-chinh px-5 py-2.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
            >
              {DANH_SACH_DOI.taoDoiDauTien}
            </button>
            <button
              type="button"
              onClick={() => datHop({ loai: 'sinh' })}
              className="rounded-md border border-vien-dam px-5 py-2.5 text-sm font-medium text-chu hover:bg-nen-nhan"
            >
              {DANH_SACH_DOI.sinhDoi}
            </button>
          </div>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {teams.map((doi) => (
            <li
              key={doi.id}
              className="flex items-center gap-4 rounded-lg border border-vien bg-nen-the p-4"
            >
              <AnhThayThe
                anhId={doi.logoImageId}
                ten={doi.name}
                mauNen={doi.primaryColor}
                kichThuoc="vua"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-chu">{doi.name}</p>
                <p className="text-sm text-chu-phu">
                  {doi.soCauThu === 0
                    ? DANH_SACH_DOI.chuaCoCauThu
                    : DANH_SACH_DOI.soCauThu(doi.soCauThu)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onMoDoi(doi.id)}
                  className="rounded-md border border-vien-dam px-3 py-1.5 text-sm text-chu hover:bg-nen-nhan"
                >
                  {DANH_SACH_DOI.moDoi}
                </button>
                <button
                  type="button"
                  onClick={() => datHop({ loai: 'sua', doi })}
                  className="rounded-md border border-vien-dam px-3 py-1.5 text-sm text-chu hover:bg-nen-nhan"
                >
                  {CHUNG.suaTen}
                </button>
                <button
                  type="button"
                  onClick={() => datHop({ loai: 'nhanBan', doi })}
                  className="rounded-md border border-vien-dam px-3 py-1.5 text-sm text-chu hover:bg-nen-nhan"
                >
                  {DANH_SACH_DOI.nhanBan}
                </button>
                <button
                  type="button"
                  onClick={() => datHop({ loai: 'xoa', doi })}
                  className="rounded-md border border-loi-chu px-3 py-1.5 text-sm text-loi-chu hover:bg-loi-nen"
                >
                  {CHUNG.xoa}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SaoLuu onDaNhap={() => void napDanhSachDoi()} />

      {hop.loai === 'tao' && (
        <FormDoi
          onXong={(teamId) => {
            datHop({ loai: 'khong' })
            onMoDoi(teamId)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'sinh' && (
        <HopSinhDoi
          onXong={(teamId) => {
            datHop({ loai: 'khong' })
            void napDanhSachDoi()
            onMoDoi(teamId)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'sua' && (
        <FormDoi
          doiDangSua={hop.doi}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'nhanBan' && (
        <HopXacNhan
          tieuDe={DANH_SACH_DOI.nhanBanTieuDe}
          moTa={
            DANH_SACH_DOI.nhanBanMoTa(hop.doi.name, hop.doi.soCauThu) +
            ' ' +
            DANH_SACH_DOI.nhanBanKhongAnh
          }
          nhanXacNhan={DANH_SACH_DOI.nhanBanXacNhan}
          onXacNhan={() => {
            const doi = hop.doi
            datHop({ loai: 'khong' })
            void nhanBanDoi(doi)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'xoa' && (
        <HopXacNhan
          tieuDe={XOA_DOI.tieuDe}
          moTa={
            XOA_DOI.moTa(hop.doi.name, hop.doi.soCauThu) +
            (coTranDangDien(tran, hop.doi.id) ? XOA_DOI.tranDangDien : '')
          }
          nhanXacNhan={XOA_DOI.xacNhan}
          nguyHiem
          onXacNhan={() => {
            const id = hop.doi.id
            datHop({ loai: 'khong' })
            void xoaDoi(id)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}
    </div>
  )
}
