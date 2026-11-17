import { BieuTuong } from '../components/BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useMemo, useState } from 'react'
import { hoSoHoanTat } from '../../domain/completeness'
import { POSITIONS } from '../../domain/positions'
import { viTriTotNhat } from '../../domain/rating'
import { CHI_SO_MAX, CHI_SO_MIN } from '../../domain/types'
import type {
  Player,
  PositionId,
  PreferredFoot,
  Team,
} from '../../domain/types'
import { usePlayers } from '../../hooks/usePlayers'
import * as teamRepo from '../../services/teamRepo'

import { AnhThayThe } from '../components/AnhThayThe'
import { FormCauThu } from '../components/FormCauThu'
import { HopXacNhan } from '../components/HopXacNhan'

interface Props {
  readonly teamId: string
  readonly onQuayLai: () => void
  readonly onMoChienThuat: (teamId: string) => void
}

type KhoaSapXep = 'ten' | 'soAo' | 'tuoi' | 'viTri'

type HopDangMo =
  | { readonly loai: 'khong' }
  | { readonly loai: 'them' }
  | { readonly loai: 'sua'; readonly cauThu: Player }
  | { readonly loai: 'xoa'; readonly cauThu: Player }

const THU_TU_VI_TRI = new Map(POSITIONS.map((p, i) => [p.id, i]))

const CAC_CHAN_THUAN: readonly PreferredFoot[] = ['phai', 'trai', 'ca-hai']

/** Dải tuổi của ô lọc. Rộng hơn dải sinh ngẫu nhiên, vì người dùng tự nhập. */
const TUOI_LOC_MIN = 14
const TUOI_LOC_MAX = 50

interface BoLoc {
  readonly ten: string
  readonly viTri: PositionId | ''
  readonly chanThuan: PreferredFoot | ''
  readonly tuoiTu: number
  readonly tuoiDen: number
  readonly chiSoTu: number
  readonly chiSoDen: number
}

const BO_LOC_RONG: BoLoc = {
  ten: '',
  viTri: '',
  chanThuan: '',
  tuoiTu: TUOI_LOC_MIN,
  tuoiDen: TUOI_LOC_MAX,
  chiSoTu: CHI_SO_MIN,
  chiSoDen: CHI_SO_MAX,
}

function coLocNao(boLoc: BoLoc): boolean {
  return (
    boLoc.ten.trim() !== '' ||
    boLoc.viTri !== '' ||
    boLoc.chanThuan !== '' ||
    boLoc.tuoiTu !== BO_LOC_RONG.tuoiTu ||
    boLoc.tuoiDen !== BO_LOC_RONG.tuoiDen ||
    boLoc.chiSoTu !== BO_LOC_RONG.chiSoTu ||
    boLoc.chiSoDen !== BO_LOC_RONG.chiSoDen
  )
}

/** Khoảng chỉ số tổng có bị thu hẹp so với dải đầy đủ hay không. */
function coLocChiSo(boLoc: BoLoc): boolean {
  return (
    boLoc.chiSoTu !== BO_LOC_RONG.chiSoTu ||
    boLoc.chiSoDen !== BO_LOC_RONG.chiSoDen
  )
}

/**
 * Chỉ số tổng dùng để lọc: đo ở **vị trí tốt nhất** của cầu thủ (AC-26.5).
 *
 * Đây đúng con số đang hiện ở cột Chỉ số tổng, nên người dùng lọc theo chính
 * thứ họ đang đọc. Lấy một vị trí khác thì danh sách sẽ loại người mà con số
 * trên màn hình vẫn nằm trong khoảng — không ai hiểu nổi vì sao.
 */
function diemDeLoc(p: Player): number | null {
  return (
    viTriTotNhat(
      { attributes: p.attributes, gkAttributes: p.gkAttributes },
      p.positions,
    )?.diem ?? null
  )
}

/**
 * Lọc danh sách cầu thủ ở **tầng giao diện** (quyết định D87).
 *
 * Một đội tối đa 30 người và đã nằm sẵn trong bộ nhớ, nên thêm chỉ mục
 * IndexedDB là tăng `DB_VERSION` cộng một đường migration cho một việc mà
 * vòng lặp `filter` làm xong trong micro-giây.
 *
 * Mọi điều kiện AND với nhau (AC-26.4). So tên không phân biệt chữ hoa.
 */
function locCauThu(cauThu: readonly Player[], boLoc: BoLoc): Player[] {
  const ten = boLoc.ten.trim().toLocaleLowerCase('vi')
  const locChiSo = coLocChiSo(boLoc)

  return cauThu.filter((p) => {
    if (ten !== '' && !p.name.toLocaleLowerCase('vi').includes(ten)) {
      return false
    }
    if (boLoc.viTri !== '' && !p.positions.includes(boLoc.viTri)) return false
    if (boLoc.chanThuan !== '' && p.preferredFoot !== boLoc.chanThuan) {
      return false
    }
    if (p.age < boLoc.tuoiTu || p.age > boLoc.tuoiDen) return false

    if (locChiSo) {
      /*
        Người chưa đủ chỉ số thì KHÔNG có con số nào để so. Loại họ ra khi
        khoảng đã bị thu hẹp — và nói rõ ngay dưới ô lọc là đã loại bao
        nhiêu người vì lý do ấy, chứ không để họ biến mất im lặng.
      */
      const diem = diemDeLoc(p)
      if (diem === null) return false
      if (diem < boLoc.chiSoTu || diem > boLoc.chiSoDen) return false
    }

    return true
  })
}

function sapXep(cauThu: readonly Player[], khoa: KhoaSapXep): Player[] {
  const ra = [...cauThu]
  switch (khoa) {
    case 'ten':
      return ra.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    case 'soAo':
      return ra.sort((a, b) => a.shirtNumber - b.shirtNumber)
    case 'tuoi':
      return ra.sort((a, b) => a.age - b.age)
    case 'viTri':
      return ra.sort(
        (a, b) =>
          (THU_TU_VI_TRI.get(a.positions[0] ?? 'ST') ?? 99) -
          (THU_TU_VI_TRI.get(b.positions[0] ?? 'ST') ?? 99),
      )
  }
}

/** Trang của một đội: thông tin đội và danh sách cầu thủ (AC-2.7, AC-2.8). */
export function TrangDoi({ teamId, onQuayLai, onMoChienThuat }: Props) {
  const { NHAN_VI_TRI, CHAN_THUAN, CHUNG, TRANG_DOI, XOA_CAU_THU, TRANG_CHIEN_THUAT } = useChuoi()
  const [doi, datDoi] = useState<Team | null>(null)
  const { cauThu, napCauThu, xoaCauThu } = usePlayers(teamId)
  const [khoa, datKhoa] = useState<KhoaSapXep>('soAo')
  const [boLoc, datBoLoc] = useState<BoLoc>(BO_LOC_RONG)
  const [hop, datHop] = useState<HopDangMo>({ loai: 'khong' })

  useEffect(() => {
    let conHieuLuc = true
    void teamRepo.get(teamId).then(
      (t) => {
        if (conHieuLuc) datDoi(t)
      },
      () => {
        if (conHieuLuc) onQuayLai()
      },
    )
    return () => {
      conHieuLuc = false
    }
  }, [teamId, onQuayLai])

  useEffect(() => {
    void napCauThu()
  }, [napCauThu])

  const daLoc = useMemo(() => locCauThu(cauThu, boLoc), [cauThu, boLoc])
  const daSapXep = useMemo(() => sapXep(daLoc, khoa), [daLoc, khoa])

  /** Số người bị khoảng chỉ số loại vì chưa tính được chỉ số tổng. */
  const soChuaTinhDuoc = useMemo(
    () =>
      coLocChiSo(boLoc)
        ? cauThu.filter((p) => diemDeLoc(p) === null).length
        : 0,
    [cauThu, boLoc],
  )

  const dangLoc = coLocNao(boLoc)

  if (!doi) {
    return <p className="text-chu-phu">{CHUNG.dangTai}</p>
  }

  return (
    <div>
      <button
        type="button"
        onClick={onQuayLai}
        className="text-sm text-chinh underline hover:text-chinh-dam"
      >
        {CHUNG.quayLai}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AnhThayThe
            anhId={doi.logoImageId}
            ten={doi.name}
            mauNen={doi.primaryColor}
            kichThuoc="lon"
          />
          <div>
            <p className="flex items-center gap-1.5 text-sm uppercase tracking-wide text-chu-phu">
              <BieuTuong ten="doi" co="nho" />
              {TRANG_DOI.doiNay}
            </p>
            <h2 className="text-2xl font-bold text-chu">{doi.name}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onMoChienThuat(teamId)}
          className="flex items-center gap-2 rounded-md border border-chinh px-4 py-2 text-sm font-medium text-chinh hover:bg-chinh-nhat"
        >
          <BieuTuong ten="chienThuat" co="nho" />
          {TRANG_CHIEN_THUAT.moChienThuat}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-chu">
          <BieuTuong ten="cauThu" />
          {TRANG_DOI.danhSachCauThu}
        </h3>
        <div className="flex items-center gap-3">
          {cauThu.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-chu-phu">
              {TRANG_DOI.sapXepTheo}
              <select
                value={khoa}
                onChange={(e) => datKhoa(e.target.value as KhoaSapXep)}
                className="rounded border border-vien-dam px-2 py-1"
              >
                <option value="soAo">{TRANG_DOI.sapXep.soAo}</option>
                <option value="ten">{TRANG_DOI.sapXep.ten}</option>
                <option value="tuoi">{TRANG_DOI.sapXep.tuoi}</option>
                <option value="viTri">{TRANG_DOI.sapXep.viTri}</option>
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() => datHop({ loai: 'them' })}
            className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {TRANG_DOI.themCauThu}
          </button>
        </div>
      </div>

      {cauThu.length > 0 && (
        <fieldset className="mt-4 rounded-lg border border-vien bg-nen-the p-4">
          <legend className="px-1 text-sm font-medium text-chu">
            {TRANG_DOI.locTieuDe}
          </legend>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm text-chu">
              {TRANG_DOI.locTen}
              <input
                type="text"
                value={boLoc.ten}
                onChange={(e) =>
                  datBoLoc({ ...boLoc, ten: e.target.value })
                }
                placeholder={TRANG_DOI.locTenGoiY}
                className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-1.5 text-chu"
              />
            </label>

            <label className="block text-sm text-chu">
              {TRANG_DOI.locViTri}
              <select
                value={boLoc.viTri}
                onChange={(e) =>
                  datBoLoc({
                    ...boLoc,
                    viTri: e.target.value as PositionId | '',
                  })
                }
                className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-1.5 text-chu"
              >
                <option value="">{TRANG_DOI.locMoiViTri}</option>
                {POSITIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {NHAN_VI_TRI[p.id].ten}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-chu">
              {TRANG_DOI.locChanThuan}
              <select
                value={boLoc.chanThuan}
                onChange={(e) =>
                  datBoLoc({
                    ...boLoc,
                    chanThuan: e.target.value as PreferredFoot | '',
                  })
                }
                className="mt-1 block w-full rounded-md border border-vien-dam px-3 py-1.5 text-chu"
              >
                <option value="">{TRANG_DOI.locMoiChanThuan}</option>
                {CAC_CHAN_THUAN.map((c) => (
                  <option key={c} value={c}>
                    {CHAN_THUAN[c]}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="text-sm text-chu">{TRANG_DOI.locTuoi}</legend>
              <div className="mt-1 flex items-center gap-2">
                <label className="flex-1 text-xs text-chu-phu">
                  {TRANG_DOI.locTu}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={TUOI_LOC_MIN}
                    max={TUOI_LOC_MAX}
                    value={boLoc.tuoiTu}
                    onChange={(e) =>
                      datBoLoc({ ...boLoc, tuoiTu: Number(e.target.value) })
                    }
                    className="mt-0.5 block w-full rounded-md border border-vien-dam px-2 py-1.5 text-chu"
                  />
                </label>
                <label className="flex-1 text-xs text-chu-phu">
                  {TRANG_DOI.locDen}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={TUOI_LOC_MIN}
                    max={TUOI_LOC_MAX}
                    value={boLoc.tuoiDen}
                    onChange={(e) =>
                      datBoLoc({ ...boLoc, tuoiDen: Number(e.target.value) })
                    }
                    className="mt-0.5 block w-full rounded-md border border-vien-dam px-2 py-1.5 text-chu"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm text-chu">
                {TRANG_DOI.locChiSoTong}
              </legend>
              <div className="mt-1 flex items-center gap-2">
                <label className="flex-1 text-xs text-chu-phu">
                  {TRANG_DOI.locTu}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={CHI_SO_MIN}
                    max={CHI_SO_MAX}
                    step="0.1"
                    value={boLoc.chiSoTu}
                    onChange={(e) =>
                      datBoLoc({ ...boLoc, chiSoTu: Number(e.target.value) })
                    }
                    className="mt-0.5 block w-full rounded-md border border-vien-dam px-2 py-1.5 text-chu"
                  />
                </label>
                <label className="flex-1 text-xs text-chu-phu">
                  {TRANG_DOI.locDen}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={CHI_SO_MIN}
                    max={CHI_SO_MAX}
                    step="0.1"
                    value={boLoc.chiSoDen}
                    onChange={(e) =>
                      datBoLoc({ ...boLoc, chiSoDen: Number(e.target.value) })
                    }
                    className="mt-0.5 block w-full rounded-md border border-vien-dam px-2 py-1.5 text-chu"
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-chu-phu">
                {TRANG_DOI.locChiSoTongGiaiThich}
              </p>
            </fieldset>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-chu-phu" aria-live="polite">
              {TRANG_DOI.locDangHien(daLoc.length, cauThu.length)}
              {soChuaTinhDuoc > 0 && (
                <>
                  {' '}
                  {TRANG_DOI.locBoQuaChuaTinhDuoc(soChuaTinhDuoc)}
                </>
              )}
            </p>
            {dangLoc && (
              <button
                type="button"
                onClick={() => datBoLoc(BO_LOC_RONG)}
                className="rounded-md border border-vien-dam px-3 py-1.5 text-sm text-chu hover:bg-nen-nhan"
              >
                {TRANG_DOI.locXoaBoLoc}
              </button>
            )}
          </div>
        </fieldset>
      )}

      {cauThu.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-vien-dam bg-nen-the p-10 text-center">
          <h4 className="text-base font-medium text-chu">
            {TRANG_DOI.chuaCoCauThuTieuDe}
          </h4>
          <p className="mx-auto mt-2 max-w-lg text-sm text-chu-phu">
            {TRANG_DOI.chuaCoCauThuMoTa}
          </p>
          <button
            type="button"
            onClick={() => datHop({ loai: 'them' })}
            className="mt-6 rounded-md bg-chinh px-5 py-2.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {TRANG_DOI.themCauThuDauTien}
          </button>
        </div>
      ) : daSapXep.length === 0 ? (
        /* Lọc không khớp ai (AC-26.7) — nói rõ, và cho một đường về. */
        <div className="mt-4 rounded-lg border border-dashed border-vien-dam bg-nen-the p-10 text-center">
          <h4 className="text-base font-medium text-chu">
            {TRANG_DOI.locKhongKhopTieuDe}
          </h4>
          <p className="mx-auto mt-2 max-w-lg text-sm text-chu-phu">
            {TRANG_DOI.locKhongKhopMoTa}
          </p>
          <button
            type="button"
            onClick={() => datBoLoc(BO_LOC_RONG)}
            className="mt-6 rounded-md bg-chinh px-5 py-2.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {TRANG_DOI.locXoaBoLoc}
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-vien bg-nen-the">
          <table className="w-full text-sm">
            <thead className="bg-nen-nhan text-left text-xs uppercase tracking-wide text-chu-phu">
              <tr>
                <th className="px-3 py-2">{TRANG_DOI.cotSoAo}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotTen}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotTuoi}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotViTri}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotChanThuan}</th>
                <th className="px-3 py-2">{TRANG_DOI.cotChiSoTong}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {daSapXep.map((p) => {
                const tinhTrang = hoSoHoanTat({
                  positions: p.positions,
                  attributes: p.attributes,
                  gkAttributes: p.gkAttributes,
                })
                const totNhat = viTriTotNhat(
                  { attributes: p.attributes, gkAttributes: p.gkAttributes },
                  p.positions,
                )

                return (
                  <tr key={p.id} className="border-t border-vien">
                    <td className="px-3 py-2 font-medium text-chu">
                      {p.shirtNumber}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <AnhThayThe
                          anhId={p.portraitImageId}
                          ten={p.name}
                          mauNen={doi.primaryColor}
                          kichThuoc="nho"
                        />
                        <span className="font-medium text-chu">
                          {p.name}
                        </span>
                      </span>
                      {!tinhTrang.hoanTat && (
                        <span className="ml-2 rounded-full bg-canh-bao-nen px-2 py-0.5 text-xs text-canh-bao-chu">
                          {TRANG_DOI.chuaHoanTat}
                          {' · '}
                          {TRANG_DOI.chuaHoanTatChiTiet(tinhTrang.soChiSoThieu)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-chu-phu">{p.age}</td>
                    <td className="px-3 py-2 text-chu-phu">
                      {p.positions.map((v) => NHAN_VI_TRI[v].vietTat).join(', ')}
                    </td>
                    <td className="px-3 py-2 text-chu-phu">
                      {CHAN_THUAN[p.preferredFoot]}
                    </td>
                    <td className="px-3 py-2">
                      {totNhat ? (
                        <span className="font-semibold text-chu">
                          {totNhat.diem}
                          <span className="ml-1 text-xs font-normal text-chu-phu">
                            {NHAN_VI_TRI[totNhat.viTri].vietTat}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-chu-phu">
                          {TRANG_DOI.chuaTinhDuocChiSoTong}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'sua', cauThu: p })}
                          className="rounded-md border border-vien-dam px-2.5 py-1 text-chu hover:bg-nen-nhan"
                        >
                          {TRANG_DOI.suaCauThu}
                        </button>
                        <button
                          type="button"
                          onClick={() => datHop({ loai: 'xoa', cauThu: p })}
                          className="rounded-md border border-loi-chu px-2.5 py-1 text-loi-chu hover:bg-loi-nen"
                        >
                          {TRANG_DOI.xoaCauThu}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {hop.loai === 'them' && (
        <FormCauThu
          teamId={teamId}
          mauDoi={doi.primaryColor}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'sua' && (
        <FormCauThu
          teamId={teamId}
          mauDoi={doi.primaryColor}
          cauThuDangSua={hop.cauThu}
          onXong={() => datHop({ loai: 'khong' })}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}

      {hop.loai === 'xoa' && (
        <HopXacNhan
          tieuDe={XOA_CAU_THU.tieuDe}
          moTa={XOA_CAU_THU.moTa(hop.cauThu.name, hop.cauThu.shirtNumber)}
          nhanXacNhan={XOA_CAU_THU.xacNhan}
          nguyHiem
          onXacNhan={() => {
            const id = hop.cauThu.id
            datHop({ loai: 'khong' })
            void xoaCauThu(id)
          }}
          onHuy={() => datHop({ loai: 'khong' })}
        />
      )}
    </div>
  )
}
