import { useChuoi } from '../../hooks/useNgonNgu'
import type { BoChuoi } from '../ngonNgu'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { laySoDo } from '../../domain/formations'
import { MUC_SAI_TOI_DA_KHI_XEP, xepLaiKhiDoiSoDo } from '../../domain/lineup'
import {
  mucSaiViTri,
  MUC_TRU_HIEU_SUAT,
  THU_TU_MUC_SAI,
} from '../../domain/misplacement'
import type { Player, Tactic } from '../../domain/types'
import {
  SO_CAU_THU_CHINH,
  SO_CAU_THU_DU_BI_TOI_DA,
  type LyDoKhongBatDau,
} from '../../engine/batDau'
import { DO_DAI_MA_TRAN, laMaTranHopLe, taoMaTran } from '../../engine/rng'
import {
  CAC_QUAN_SO,
  CAC_THOI_LUONG,
  CHE_DO_MAC_DINH,
  QUAN_SO_MAC_DINH,
  THOI_LUONG_MAC_DINH,
  type CauHinhTran,
  type CheDoMoPhong,
  type DangKyBen,
} from '../../engine/tran'
import { useMatch } from '../../hooks/useMatch'
import { aoDangDung } from '../mauAo'
import { useTeams } from '../../hooks/useTeams'
import * as playerRepo from '../../services/playerRepo'
import * as tacticRepo from '../../services/tacticRepo'
import { useAppStore } from '../../store/appStore'
import { AnhThayThe } from '../components/AnhThayThe'
import {
  DangKyDoiHinh,
  type VaiTroDangKy,
} from '../components/DangKyDoiHinh'


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
 * Chọn người cho từng Ô của sơ đồ: mỗi ô lấy người khớp vị trí nhất còn lại.
 *
 * Đây là chỗ bản đầu của T215 làm sai, và nó chỉ lộ ra khi quân số nhỏ. Lúc
 * ấy hàm này lấy `quanSo` người ĐẦU DANH SÁCH — mà một đội thật xếp theo số
 * áo thì đầu danh sách là thủ môn rồi hậu vệ. Sân 5 với sơ đồ 2-2 cần hai
 * tiền đạo, nên năm người đầu (thủ môn + bốn hậu vệ) chỉ xếp được 3/5 ô:
 * người dùng chọn "5 người" rồi bị chặn ngay, không hiểu vì sao. Đo trên một
 * đội 18 người xếp đúng tuyến: bốn trong bảy quân số không khởi động được.
 *
 * Thứ tự quét là thứ tự ô của sơ đồ, và khi hai người ngang điểm thì giữ
 * người đứng trước trong danh sách — không có nguồn ngẫu nhiên nào, nên bấm
 * hai lần ra đúng một kết quả (P1).
 */
function chonTheoSoDo(
  cauThu: readonly Player[],
  chienThuat: Tactic,
  quanSo: number,
): readonly string[] {
  const nguongSai = THU_TU_MUC_SAI.indexOf(MUC_SAI_TOI_DA_KHI_XEP)
  const conLai = new Set(cauThu.map((p) => p.id))
  const hoSo = new Map(cauThu.map((p) => [p.id, p]))
  const chon: string[] = []

  for (const o of laySoDo(chienThuat.formationId).oVien) {
    if (chon.length >= quanSo) break

    let totNhat: string | null = null
    let diemTot = Number.POSITIVE_INFINITY

    for (const id of conLai) {
      const muc = mucSaiViTri(o.viTri, hoSo.get(id)?.positions ?? [])
      if (THU_TU_MUC_SAI.indexOf(muc) > nguongSai) continue
      const diem = MUC_TRU_HIEU_SUAT[muc]
      if (diem < diemTot) {
        diemTot = diem
        totNhat = id
      }
    }

    if (totNhat !== null) {
      chon.push(totNhat)
      conLai.delete(totNhat)
    }
  }

  // Ô nào không ai xếp nổi thì vẫn lấy thêm người cho đủ quân số: màn này
  // phải nói "thiếu bao nhiêu" (AC-12.3), không phải tự ý đăng ký ít đi.
  for (const p of cauThu) {
    if (chon.length >= quanSo) break
    if (conLai.has(p.id)) {
      chon.push(p.id)
      conLai.delete(p.id)
    }
  }

  return chon
}

/**
 * Đăng ký mặc định: `quanSo` người khớp sơ đồ nhất làm chính, rồi tới dự bị.
 *
 * Mở màn ra là đăng ký sẵn chứ không để trống: đội vừa tạo có bộ chiến thuật
 * mặc định với toàn ô TRỐNG, nên nếu chỉ lấy theo chiến thuật thì màn này mở
 * ra với 0 người chính và người dùng phải tự bấm đủ từng ấy lần.
 */
function dangKyMacDinh(
  cauThu: readonly Player[],
  chienThuat: Tactic,
  quanSo: number,
): Record<string, VaiTroDangKy> {
  const chinh = new Set(chonTheoSoDo(cauThu, chienThuat, quanSo))

  const ra: Record<string, VaiTroDangKy> = {}
  let soDuBi = 0

  for (const p of cauThu) {
    if (chinh.has(p.id)) {
      ra[p.id] = 'chinh'
    } else if (soDuBi < SO_CAU_THU_DU_BI_TOI_DA) {
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
  const { CHON_CAP_DAU, CHUNG, LY_DO_KHONG_BAT_DAU, TINH_TRANG_DOI_HINH } = useChuoi()
  const teams = useAppStore((s) => s.teams)
  const { napDanhSachDoi } = useTeams()
  const { batDauTran, lyDoKhongBatDau } = useMatch()

  const [idNha, datIdNha] = useState('')
  const [idKhach, datIdKhach] = useState('')
  const [sanTrungLap, datSanTrungLap] = useState(false)
  /*
    Quân số và thời lượng thuộc về TRẬN, không thuộc về đội (D52, D59), nên
    chúng sống ở màn này chứ không phải ở hồ sơ đội. Mặc định 11 người và 90
    phút: mở màn ra mà không chạm gì thì vẫn đúng một trận như spec 001.
  */
  const [quanSo, datQuanSo] = useState(QUAN_SO_MAC_DINH)
  const [thoiLuong, datThoiLuong] = useState(THOI_LUONG_MAC_DINH)
  /*
    Chế độ mô phỏng (AC-45.1, quyết định D122 và D134).

    `cheDoDaChon` là điều người dùng BẤM; `cheDoDung` là điều thật sự đi vào
    cấu hình. Hai thứ khác nhau vì chế độ liên tục chỉ chạy được ở sân 11
    (AC-45.8): người dùng chọn "liên tục" ở sân 11 rồi hạ quân số xuống 7 thì
    lựa chọn cũ **không được** theo họ xuống — `taoTran` sẽ NÉM LỖI (T707).

    Dẫn xuất thay vì đồng bộ bằng `useEffect`: một effect sẽ vẽ một khung với
    trạng thái sai trước khi sửa, và còn mở đường cho chuỗi cập nhật vòng.
  */
  const [cheDoDaChon, datCheDo] = useState<CheDoMoPhong>(CHE_DO_MAC_DINH)
  const lienTucDuocPhep = quanSo === SO_CAU_THU_CHINH
  const cheDoDung: CheDoMoPhong = lienTucDuocPhep
    ? cheDoDaChon
    : CHE_DO_MAC_DINH
  /*
    Mã trận SỬA ĐƯỢC, và mở ra với mã của lần chạy trước nếu phiên này đã chạy
    một trận (AC-8.11, AC-8.12).

    Nếu màn này chỉ sinh mã mới mỗi lần mở thì người dùng không bao giờ chạy
    lại được cùng một mã, nên bảng so sánh của AC-8.12 không có đường nào tới
    được — engine tái lập đúng nhưng người dùng không với tới.
  */
  const maLanTruoc = useAppStore((s) => s.ketQuaTruoc?.maTran)
  const [maTran, datMaTran] = useState(
    () => maLanTruoc ?? taoMaTran(RNG_THAT),
  )
  const maHopLe = laMaTranHopLe(maTran)
  const [duLieu, datDuLieu] = useState<Record<string, DuLieuDoi>>({})
  const [dangKy, datDangKy] = useState<
    Record<string, Record<string, VaiTroDangKy>>
  >({})

  useEffect(() => {
    void napDanhSachDoi()
  }, [napDanhSachDoi])

  /*
    Đổi quân số là đổi sang một bộ chiến thuật KHÁC của cùng đội (D64), nên
    phải quên những gì đã nạp — giữ lại thì màn này đăng ký 5 người vào một
    sơ đồ 11 ô.
  */
  useEffect(() => {
    datDuLieu({})
    datDangKy({})
  }, [quanSo])

  // Nạp cầu thủ và chiến thuật của đội vừa được chọn, đúng quân số đang chọn.
  const napDoi = useCallback(
    async (teamId: string) => {
      if (teamId === '' || duLieu[teamId]) return
      const [cauThu, chienThuat] = await Promise.all([
        playerRepo.listByTeam(teamId),
        tacticRepo.layChienThuatTheoQuanSo(teamId, quanSo),
      ])
      datDuLieu((cu) => ({ ...cu, [teamId]: { cauThu, chienThuat } }))
      datDangKy((cu) => ({
        ...cu,
        [teamId]: dangKyMacDinh(cauThu, chienThuat, quanSo),
      }))
    },
    [duLieu, quanSo],
  )

  useEffect(() => {
    void napDoi(idNha)
  }, [idNha, napDoi])
  useEffect(() => {
    void napDoi(idKhach)
  }, [idKhach, napDoi])

  const doiNha = teams.find((d) => d.id === idNha)
  const doiKhach = teams.find((d) => d.id === idKhach)

  /*
    Quyết định đổi áo nằm trọn ở `ui/mauAo.ts` (quyết định D39), dùng chung
    với sân 2D, nên hai chỗ không bao giờ vẽ hai đội với hai bộ màu khác nhau.
  */
  const mauAo = useMemo(
    () => (doiNha && doiKhach ? aoDangDung(doiNha, doiKhach) : null),
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

    const cauHinh: CauHinhTran = {
      maTran,
      nha,
      khach,
      quanSo,
      thoiLuong,
      sanTrungLap,
      cheDoMoPhong: cheDoDung,
    }
    if (batDauTran(cauHinh)) onDaBatDau()
  }

  const tenDoi = (ben: 'nha' | 'khach') =>
    (ben === 'nha' ? doiNha?.name : doiKhach?.name) ?? ''

  /*
    Tên cầu thủ cho câu lỗi "còn cầu thủ thiếu chỉ số" (AC-23.2).

    Lỗi do engine phát ra chỉ mang MÃ ĐỊNH DANH — đúng như D76 muốn, vì mã
    là thứ duy nhất không phụ thuộc ngôn ngữ. Việc đổi mã thành tên là việc
    của tầng giao diện, và đây là chỗ có đủ dữ liệu để làm: cả hai đội đã
    nạp xong hồ sơ cầu thủ.

    Tìm ở CẢ HAI đội vì câu lỗi không nói mã ấy thuộc bên nào. Không thấy
    thì giữ nguyên mã — thà hiện một chuỗi khó đọc còn hơn hiện chuỗi rỗng
    và để người dùng không biết thiếu ai.
  */
  const tenCauThu = (playerId: string): string => {
    for (const id of [idNha, idKhach]) {
      const p = duLieu[id]?.cauThu.find((x) => x.id === playerId)
      if (p) return p.name
    }
    return playerId
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

      <h2 className="mt-4 text-2xl font-bold text-chu">
        {CHON_CAP_DAU.tieuDe}
      </h2>

      {teams.length < 2 ? (
        <p className="mt-4 rounded-lg border border-vien-dam bg-canh-bao-nen p-3 text-sm text-canh-bao-chu">
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
              <label key={ben} className="text-sm text-chu">
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
                    className="flex-1 rounded border border-vien-dam px-2 py-1"
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

          {mauAo?.doiDoiAo && (
            <p className="mt-3 rounded-lg border border-vien bg-nen-nhan p-3 text-sm text-chu">
              {CHON_CAP_DAU.doiTrungMauAo(mauAo.doiDoiAo)}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="text-sm text-chu">
              <span className="block font-medium">
                {CHON_CAP_DAU.nhanQuanSo}
              </span>
              <select
                value={quanSo}
                onChange={(e) => datQuanSo(Number(e.target.value))}
                className="mt-1 rounded border border-vien-dam px-2 py-1"
              >
                {CAC_QUAN_SO.map((n) => (
                  <option key={n} value={n}>
                    {CHON_CAP_DAU.nhanNguoi(n)}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-chu-phu">
                {CHON_CAP_DAU.moTaQuanSo}
              </span>
            </label>

            <label className="text-sm text-chu">
              <span className="block font-medium">
                {CHON_CAP_DAU.nhanThoiLuong}
              </span>
              <select
                value={thoiLuong}
                onChange={(e) => datThoiLuong(Number(e.target.value))}
                className="mt-1 rounded border border-vien-dam px-2 py-1"
              >
                {CAC_THOI_LUONG.map((t) => (
                  <option key={t} value={t}>
                    {CHON_CAP_DAU.nhanPhut(t)}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-chu-phu">
                {CHON_CAP_DAU.moTaThoiLuong}
              </span>
            </label>

            {/*
              Nhóm radio, không phải `<select>` có `<option disabled>` (D134):
              repo chưa từng khoá một `<option>` nào — 40 chỗ `disabled` trong
              `src/ui`, không một chỗ nào trên `<option>` — nên không có mẫu để
              chép, và trạng thái khoá của `<option>` khó đọc bằng trình đọc màn
              hình.

              Khoá thì phải nói VÌ SAO chứ không im lặng ẩn đi — đúng nguyên tắc
              đã ghi ở `TrangLichSu.tsx:266-271`, và câu giải thích dùng lại đúng
              chuỗi mà engine phát ra cho lý do ấy, nên chỉ có MỘT bản dịch.
            */}
            <div
              role="radiogroup"
              aria-labelledby="nhan-che-do"
              className="text-sm text-chu"
            >
              <span id="nhan-che-do" className="block font-medium">
                {CHON_CAP_DAU.nhanCheDo}
              </span>
              <label className="mt-1 flex items-center gap-2">
                <input
                  type="radio"
                  name="cheDoMoPhong"
                  value="co-dien"
                  checked={cheDoDung === 'co-dien'}
                  onChange={() => datCheDo('co-dien')}
                  className="h-4 w-4"
                />
                <span>
                  <span className="block">{CHON_CAP_DAU.cheDoCoDien}</span>
                  <span className="block text-xs text-chu-phu">
                    {CHON_CAP_DAU.moTaCheDoCoDien}
                  </span>
                </span>
              </label>
              <label className="mt-1 flex items-center gap-2">
                <input
                  type="radio"
                  name="cheDoMoPhong"
                  value="lien-tuc"
                  checked={cheDoDung === 'lien-tuc'}
                  disabled={!lienTucDuocPhep}
                  onChange={() => datCheDo('lien-tuc')}
                  className="h-4 w-4"
                />
                <span className={lienTucDuocPhep ? undefined : 'text-chu-phu'}>
                  <span className="block">{CHON_CAP_DAU.cheDoLienTuc}</span>
                  <span className="block text-xs text-chu-phu">
                    {CHON_CAP_DAU.moTaCheDoLienTuc}
                  </span>
                </span>
              </label>
              {!lienTucDuocPhep && (
                <p
                  role="status"
                  className="mt-2 rounded border border-vien-dam bg-canh-bao-nen p-2 text-xs text-canh-bao-chu"
                >
                  {LY_DO_KHONG_BAT_DAU.lienTucChiSan11(
                    quanSo,
                    SO_CAU_THU_CHINH,
                  )}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-chu">
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
                <span className="block text-xs text-chu-phu">
                  {CHON_CAP_DAU.moTaSanTrungLap}
                </span>
              </span>
            </label>

            <div className="text-sm text-chu">
              <span className="block font-medium">
                {CHON_CAP_DAU.nhanMaTran}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={maTran}
                  onChange={(e) =>
                    datMaTran(
                      e.target.value.toUpperCase().slice(0, DO_DAI_MA_TRAN),
                    )
                  }
                  maxLength={DO_DAI_MA_TRAN}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label={CHON_CAP_DAU.nhanMaTran}
                  aria-invalid={!maHopLe}
                  className={`w-32 rounded border px-2 py-1 font-mono text-sm uppercase ${
                    maHopLe
                      ? 'border-vien-dam'
                      : 'border-loi-chu bg-loi-nen'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => datMaTran(taoMaTran(RNG_THAT))}
                  className="text-xs text-chinh underline"
                >
                  {CHON_CAP_DAU.maTranMoi}
                </button>
              </span>
              <span className="mt-1 block text-xs text-chu-phu">
                {CHON_CAP_DAU.moTaMaTran}
              </span>
              {!maHopLe && (
                <span
                  role="status"
                  className="mt-1 block text-xs font-medium text-loi-chu"
                >
                  {CHON_CAP_DAU.maTranKhongHopLe}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {([idNha, idKhach] as const).map((id, i) =>
              id && duLieu[id] ? (
                <DangKyDoiHinh
                  key={id}
                  tenDoi={tenDoi(i === 0 ? 'nha' : 'khach')}
                  quanSo={quanSo}
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
              className="mt-4 rounded-lg border border-vien-dam bg-canh-bao-nen p-3"
            >
              <p className="text-sm font-medium text-canh-bao-chu">
                {CHON_CAP_DAU.tieuDeChuaBatDauDuoc}
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-canh-bao-chu">
                {lyDoKhongBatDau.map((ly, i) => (
                  <li key={`${ly.loai}-${i}`}>
                    {cauLyDo(
                      ly,
                      tenDoi,
                      tenCauThu,
                      quanSo,
                      LY_DO_KHONG_BAT_DAU,
                      TINH_TRANG_DOI_HINH,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={batDau}
            disabled={idNha === '' || idKhach === '' || !maHopLe}
            className="mt-4 rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
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
  tenCauThu: (playerId: string) => string,
  quanSo: number,
  LY_DO_KHONG_BAT_DAU: BoChuoi['LY_DO_KHONG_BAT_DAU'],
  TINH_TRANG_DOI_HINH: BoChuoi['TINH_TRANG_DOI_HINH'],
): string {
  switch (ly.loai) {
    case 'cung-mot-doi':
      return LY_DO_KHONG_BAT_DAU.cungMotDoi
    case 'lien-tuc-chi-san-11':
      return LY_DO_KHONG_BAT_DAU.lienTucChiSan11(ly.quanSo, ly.quanSoCan)
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
              return TINH_TRANG_DOI_HINH.thieuNguoi(l.soONhanNguoi, quanSo)
            case 'ho-so-chua-hoan-tat':
              return LY_DO_KHONG_BAT_DAU.hoSoChuaHoanTat(
                tenDoi(ly.doi),
                l.cacPlayerId.map(tenCauThu),
              )
          }
        })
        .join(' ')
  }
}
