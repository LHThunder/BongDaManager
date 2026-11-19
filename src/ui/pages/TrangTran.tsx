import { BieuTuong } from '../components/BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useRef, useState } from 'react'
import { dungBaoCao } from '../../engine/baoCao'
import type { SuKien } from '../../engine/suKien'
import {
  dongSuKien,
  khungThanhCoThuMon,
  nguoiTrongKhung,
  phutHienThi,
  type NoiDungCanThiep,
} from '../../engine/tran'
import { MS_MOI_PHUT, useMatch } from '../../hooks/useMatch'
import * as playerRepo from '../../services/playerRepo'
import * as tuyChonRepo from '../../services/tuyChonRepo'
import { aoDangDung, mauAoRaSan } from '../mauAo'
import { useAppStore } from '../../store/appStore'
import { AnhThayThe } from '../components/AnhThayThe'
import { BangDieuKhienTran } from '../components/BangDieuKhienTran'
import { BaoCaoSauTran } from '../components/BaoCaoSauTran'
import { San2D } from '../components/San2D'
import { ChiThiDoi } from '../components/ChiThiDoi'
import { DongTuongThuat } from '../components/DongTuongThuat'
import { ThayNguoi } from '../components/ThayNguoi'


interface Props {
  readonly onRoiTran: () => void
}

/**
 * Trang trận đấu: dòng tường thuật chạy theo phút, tỉ số và phút luôn nhìn
 * thấy, tạm dừng / đổi tốc độ / chạy hết trận (AC-9.1 → AC-9.4).
 *
 * Trận sống trong bộ nhớ: rời trang là mất (AC-9.10, quyết định D32).
 */
export function TrangTran({ onRoiTran }: Props) {
  const {
    NHAN_VI_TRI,
    CAN_THIEP_GIUA_TRAN,
    CHON_CAP_DAU,
    CHUNG,
    SAN_2D,
    SO_SANH_TRAN,
    TRAN_DAU,
    VAO_BAT_GON,
    LICH_SU,
    LY_DO_TU_CHOI_CAN_THIEP,
  } = useChuoi()
  const {
    tran,
    dangChay,
    tocDo,
    datTocDo,
    tamDung,
    tiepTuc,
    chayHet,
    canThiep,
    roiTran,
    dauLai,
    daLoaiTranCu,
    xoaBaoDaLoai,
  } = useMatch()

  const [loiCanThiep, datLoiCanThiep] = useState<string | null>(null)
  const [nguoiVaoGon, datNguoiVaoGon] = useState('')

  /*
    Tuỳ chọn ẩn/hiện sân 2D (AC-10.6, quyết định D51). Lưu trong store `meta`
    nên nó sống qua một lần tải lại trang.
  */
  const [hienSan, datHienSan] = useState<boolean | null>(null)
  useEffect(() => {
    let conHieuLuc = true
    void tuyChonRepo.docHienSan2D().then((x) => {
      if (conHieuLuc) datHienSan(x)
    })
    return () => {
      conHieuLuc = false
    }
  }, [])

  const doiHienSan = () => {
    const moi = !(hienSan ?? true)
    datHienSan(moi)
    void tuyChonRepo.datHienSan2D(moi).catch(() => {
      // Lỗi ghi tuỳ chọn hiển thị không nên chặn người xem trận.
    })
  }

  /*
    Chụp kết quả lần trước NGAY LÚC VÀO TRANG, không đọc thẳng từ store khi
    vẽ bảng: trang này cũng là nơi GHI kết quả lần chạy này vào đúng ô đó.
    Đọc thẳng thì tới lúc vẽ, ô kia đã mang số của chính trận vừa xong, và
    bảng so sánh đem trận này so với chính nó — hai cột luôn bằng nhau.

    Trang trận được dựng lại cho từng trận (rời trận là mất, quyết định D32),
    nên đọc một lần ở lượt vẽ đầu là đúng thời điểm.
  */
  const ketQuaTruoc = useRef(useAppStore.getState().ketQuaTruoc).current

  /*
    Cất kết quả lại NGAY khi trận kết thúc, để lần chạy sau cùng mã trận có
    cái mà so (AC-8.12). Cất đúng một lần cho mỗi trận.
  */
  const daKetThuc = tran?.ketThuc ?? false
  const daCat = useRef(false)
  useEffect(() => {
    if (!tran || !daKetThuc || daCat.current) return
    daCat.current = true
    useAppStore.getState().datKetQuaTruoc({
      maTran: tran.maTran,
      tiSo: tran.tiSo,
      cuSut: {
        nha: tran.ben.nha.thongKe.cuSut,
        khach: tran.ben.khach.thongKe.cuSut,
      },
      coHoi: {
        nha: tran.ben.nha.thongKe.coHoiRoRang,
        khach: tran.ben.khach.thongKe.coHoiRoRang,
      },
    })
  }, [tran, daKetThuc])

  const teams = useAppStore((s) => s.teams)

  /*
    Cảnh báo trước khi rời trang khi trận ĐANG chạy (AC-9.10). Trận đã kết
    thúc thì không hỏi nữa — hỏi lúc đó chỉ làm phiền.
  */
  const dangDienRa = tran !== null && !tran.ketThuc
  useEffect(() => {
    if (!dangDienRa) return

    const canhBao = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = TRAN_DAU.canhBaoRoiTrang
    }
    window.addEventListener('beforeunload', canhBao)
    return () => window.removeEventListener('beforeunload', canhBao)
  }, [dangDienRa])

  /*
    Tên cầu thủ là thứ của GIAO DIỆN: engine chỉ làm việc với id (P2). Trang
    này tra tên để dòng tường thuật đọc được, thay vì hiện ra id.
  */
  const [tenTheoId, datTenTheoId] = useState<ReadonlyMap<string, string>>(
    new Map(),
  )
  /* Số áo để in vào từng điểm trên sân 2D (AC-10.1). */
  const [soAoTheoId, datSoAoTheoId] = useState<ReadonlyMap<string, number>>(
    new Map(),
  )
  const idNha = tran?.ben.nha.teamId
  const idKhach = tran?.ben.khach.teamId

  useEffect(() => {
    if (!idNha || !idKhach) return
    let conHieuLuc = true

    void Promise.all([
      playerRepo.listByTeam(idNha),
      playerRepo.listByTeam(idKhach),
    ]).then(([a, b]) => {
      if (!conHieuLuc) return
      datTenTheoId(new Map([...a, ...b].map((p) => [p.id, p.name])))
      datSoAoTheoId(new Map([...a, ...b].map((p) => [p.id, p.shirtNumber])))
    })

    return () => {
      conHieuLuc = false
    }
  }, [idNha, idKhach])

  if (!tran) {
    return <p className="text-chu-phu">{CHUNG.dangTai}</p>
  }

  const doiNha = teams.find((d) => d.id === tran.ben.nha.teamId)
  const doiKhach = teams.find((d) => d.id === tran.ben.khach.teamId)
  const tenDoi = (ben: SuKien['doi']) =>
    (ben === 'nha' ? doiNha?.name : doiKhach?.name) ?? ''

  const ht = phutHienThi(tran, Math.max(tran.phut, 1))
  const cacSuKien = dongSuKien(tran)

  const benCuaNguoiDung =
    tran.doiCuaNguoiDung === 'nha' ? tran.ben.nha : tran.ben.khach

  const dangTamDung = !dangChay && !tran.ketThuc
  const dangBatGon = nguoiTrongKhung(benCuaNguoiDung)

  /*
    Sân 2D (US-10). Màu áo lấy từ `ui/mauAo.ts`, cùng nguồn với màn chọn cặp
    đấu, nên hai đội trùng màu áo vẫn phân biệt được trên sân (AC-3.7).

    VỀ AC-10.5 (chạy hết trận không bị sân làm chậm): kiến trúc của D21 đã lo
    sẵn chỗ này, không cần thêm cờ chặn vẽ. `chayHet` gọi `chayHetTran` MỘT
    lần, đồng bộ, rồi đặt trạng thái cuối vào store — nên React chỉ vẽ **một
    lần**, không vẽ 97 trạng thái trung gian. Quyết định D43 lo đúng chuyện
    này nhưng hoá ra không có gì phải chặn; việc còn lại của T118 là **đo
    thật** để chứng minh, chứ không phải thêm một cờ không làm gì.
  */
  const mauAo = doiNha && doiKhach ? aoDangDung(doiNha, doiKhach) : null
  const suKienDangXem = cacSuKien[cacSuKien.length - 1] ?? null
  const conLuotThay = benCuaNguoiDung.duBi.length

  /*
    So hai lần chạy CÙNG một mã trận (AC-8.12). Kết quả cũ được giữ trong
    phiên làm việc; phần bền thuộc Giai đoạn 4 (quyết định D31).
  */
  const soSanh =
    tran.ketThuc && ketQuaTruoc && ketQuaTruoc.maTran === tran.maTran
      ? [
          {
            ten: SO_SANH_TRAN.tiSo,
            cu: SO_SANH_TRAN.hai(
              ketQuaTruoc.tiSo.nha,
              ketQuaTruoc.tiSo.khach,
            ),
            moi: SO_SANH_TRAN.hai(tran.tiSo.nha, tran.tiSo.khach),
          },
          {
            ten: SO_SANH_TRAN.cuSut,
            cu: SO_SANH_TRAN.hai(
              ketQuaTruoc.cuSut.nha,
              ketQuaTruoc.cuSut.khach,
            ),
            moi: SO_SANH_TRAN.hai(
              tran.ben.nha.thongKe.cuSut,
              tran.ben.khach.thongKe.cuSut,
            ),
          },
          {
            ten: SO_SANH_TRAN.coHoi,
            cu: SO_SANH_TRAN.hai(
              ketQuaTruoc.coHoi.nha,
              ketQuaTruoc.coHoi.khach,
            ),
            moi: SO_SANH_TRAN.hai(
              tran.ben.nha.thongKe.coHoiRoRang,
              tran.ben.khach.thongKe.coHoiRoRang,
            ),
          },
        ]
      : null

  const guiCanThiep = (noiDung: NoiDungCanThiep) => {
    const lyDo = canThiep({
      phut: tran.phut,
      doi: tran.doiCuaNguoiDung,
      noiDung,
    })
    datLoiCanThiep(lyDo ? (LY_DO_TU_CHOI_CAN_THIEP[lyDo] ?? lyDo) : null)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          roiTran()
          onRoiTran()
        }}
        className="text-sm text-chinh underline hover:text-chinh-dam"
      >
        {TRAN_DAU.quayLai}
      </button>

      {/* Tỉ số và phút luôn nhìn thấy được (AC-9.1). */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 rounded-lg border border-vien bg-nen-the p-4">
        <div className="flex items-center gap-3">
          {doiNha && (
            <AnhThayThe
              anhId={doiNha.logoImageId}
              ten={doiNha.name}
              mauNen={doiNha.primaryColor}
              kichThuoc="vua"
            />
          )}
          <span className="text-lg font-semibold text-chu">
            {tenDoi('nha')}
          </span>
        </div>

        <div className="text-center">
          <p className="font-mono text-3xl font-bold text-chu">
            {tran.tiSo.nha} – {tran.tiSo.khach}
          </p>
          <p className="font-mono text-sm text-chu-phu">
            {tran.phut === 0
              ? TRAN_DAU.chuaBatDau
              : tran.ketThuc
                ? TRAN_DAU.daKetThuc
                : TRAN_DAU.phut(ht.phut, ht.buGio)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-chu">
            {tenDoi('khach')}
          </span>
          {doiKhach && (
            <AnhThayThe
              anhId={doiKhach.logoImageId}
              ten={doiKhach.name}
              mauNen={doiKhach.primaryColor}
              kichThuoc="vua"
            />
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-chu-phu">
        {CHON_CAP_DAU.nhanMaTran}:{' '}
        <code className="font-mono">{tran.maTran}</code>
      </p>

      <div className="mt-4">
        <BangDieuKhienTran
          dangChay={dangChay}
          daKetThuc={tran.ketThuc}
          tocDo={tocDo}
          onTamDung={tamDung}
          onTiepTuc={tiepTuc}
          onChayHet={chayHet}
          onDoiTocDo={datTocDo}
        />
      </div>

      {/*
        Lịch sử đủ 20 trận thì trận cũ nhất rời đi — báo đúng MỘT lần
        (spec mục 5), và người dùng tự đóng.
      */}
      {daLoaiTranCu !== null && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-lg border border-vien-dam bg-canh-bao-nen p-3 text-sm text-canh-bao-chu"
        >
          <span className="flex-1">{LICH_SU.daLoaiTranCu(daLoaiTranCu)}</span>
          <button
            type="button"
            onClick={xoaBaoDaLoai}
            className="shrink-0 font-medium underline"
          >
            {LICH_SU.dongBaoDaLoai}
          </button>
        </div>
      )}

      {/*
        Báo cáo sau trận chỉ hiện khi trận đã kết thúc (AC-11.1 → AC-11.3,
        AC-11.5, AC-11.6). `dungBaoCao` là hàm thuần của engine nên gọi ngay
        trong lượt vẽ là an toàn — nó không đọc đồng hồ và không chạm lưu trữ.
      */}
      {tran.ketThuc && (
        <div className="mt-4">
          <BaoCaoSauTran
            baoCao={dungBaoCao(tran)}
            tenCauThu={(id) => tenTheoId.get(id) ?? id}
            tenDoi={tenDoi}
            onDauLaiCungMa={() => dauLai(true)}
            onDauLaiMaMoi={() => dauLai(false)}
          />
        </div>
      )}

      {soSanh && (
        <section className="mt-4 rounded-lg border border-vien bg-nen-the p-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-chu">
            <BieuTuong ten="tran" co="nho" />
            {SO_SANH_TRAN.tieuDe}
          </h3>
          <p className="mt-0.5 text-sm text-chu-phu">{SO_SANH_TRAN.moTa}</p>
          <table className="mt-2 w-full max-w-md text-sm">
            <thead>
              <tr className="text-left text-chu-phu">
                <th className="font-medium">{SO_SANH_TRAN.cotChiTieu}</th>
                <th className="font-medium">{SO_SANH_TRAN.cotLanTruoc}</th>
                <th className="font-medium">{SO_SANH_TRAN.cotLanNay}</th>
              </tr>
            </thead>
            <tbody className="text-chu">
              {soSanh.map((d) => (
                <tr key={d.ten}>
                  <td className="py-0.5">{d.ten}</td>
                  <td className="py-0.5 font-mono">{d.cu}</td>
                  <td className="py-0.5 font-mono">{d.moi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Sân 2D, ẩn/hiện được và nhớ lựa chọn (AC-10.1 → AC-10.6). */}
      <section className="mt-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-chu">
            <BieuTuong ten="san" co="nho" />
            {SAN_2D.tieuDe}
          </h3>
          <button
            type="button"
            onClick={doiHienSan}
            aria-pressed={hienSan ?? true}
            className="text-sm text-chinh underline hover:text-chinh-dam"
          >
            {(hienSan ?? true) ? SAN_2D.an : SAN_2D.hien}
          </button>
        </div>

        {(hienSan ?? true) && mauAo && doiNha && doiKhach && (
          <div className="mt-2">
            <San2D
              nha={{
                ben: tran.ben.nha,
                ten: doiNha.name,
                mauAo: mauAoRaSan(doiNha, mauAo.nha),
              }}
              khach={{
                ben: tran.ben.khach,
                ten: doiKhach.name,
                mauAo: mauAoRaSan(doiKhach, mauAo.khach),
              }}
              suKien={suKienDangXem}
              msMoiPhut={MS_MOI_PHUT[tocDo]}
              dangChay={dangChay}
              tenCauThu={(id) => tenTheoId.get(id) ?? id}
              soAo={(id) => soAoTheoId.get(id) ?? null}
              nhanViTri={(v) => NHAN_VI_TRI[v].ten}
              moTaDiem={SAN_2D.moTaDiem}
            />
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <DongTuongThuat
          cacSuKien={cacSuKien}
          tenCauThu={(id) => tenTheoId.get(id) ?? id}
          tenDoi={tenDoi}
        />

        {/* Can thiệp giữa trận, chỉ với đội của người dùng (AC-9.8). */}
        <div className="space-y-4">
          {/*
            Thủ môn nhận thẻ đỏ (spec mục 5). Khối này chỉ hiện khi khung thành
            KHÔNG có thủ môn thực thụ — vừa lúc khung bỏ trống, vừa lúc một cầu
            thủ sân đang chữa cháy và thủ môn dự bị đã vào sân chờ nhận găng.
          */}
          {!tran.ketThuc && !khungThanhCoThuMon(benCuaNguoiDung) && (
            <section className="rounded-lg border-2 border-vien-dam bg-canh-bao-nen p-4">
              <h3 className="text-base font-semibold text-canh-bao-chu">
                {dangBatGon === null
                  ? VAO_BAT_GON.tieuDeTrong
                  : VAO_BAT_GON.tieuDeChuaChay(
                      tenTheoId.get(dangBatGon) ?? dangBatGon,
                    )}
              </h3>
              <p className="mt-0.5 text-sm text-canh-bao-chu">
                {VAO_BAT_GON.moTa}
              </p>
              <p className="mt-1 text-sm text-canh-bao-chu">
                {conLuotThay > 0
                  ? VAO_BAT_GON.conLuotThay(conLuotThay)
                  : VAO_BAT_GON.hetLuotThay}
              </p>

              {!dangTamDung && (
                <p className="mt-2 text-sm text-canh-bao-chu">
                  {VAO_BAT_GON.canTamDung}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="text-sm text-canh-bao-chu">
                  <span className="block">{VAO_BAT_GON.nhanChon}</span>
                  <select
                    value={nguoiVaoGon}
                    onChange={(e) => datNguoiVaoGon(e.target.value)}
                    disabled={!dangTamDung}
                    className="mt-1 rounded border border-vien-dam px-2 py-1 disabled:bg-nen-nhan"
                  >
                    <option value="">{VAO_BAT_GON.chonCauThu}</option>
                    {benCuaNguoiDung.trenSan
                      .filter((id) => id !== dangBatGon)
                      .map((id) => (
                        <option key={id} value={id}>
                          {tenTheoId.get(id) ?? id}
                        </option>
                      ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    guiCanThiep({
                      loai: 'vao-bat-gon',
                      playerId: nguoiVaoGon,
                    })
                    datNguoiVaoGon('')
                  }}
                  disabled={!dangTamDung || nguoiVaoGon === ''}
                  className="rounded-md bg-canh-bao-manh px-3 py-1.5 text-sm font-medium text-chu-tren-canh-bao hover:bg-canh-bao-manh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
                >
                  {VAO_BAT_GON.thucHien}
                </button>
              </div>
            </section>
          )}

          <ThayNguoi
            ben={benCuaNguoiDung}
            tenCauThu={(id) => tenTheoId.get(id) ?? id}
            tamDung={dangTamDung}
            loi={loiCanThiep}
            onThay={(ra, vao) =>
              guiCanThiep({ loai: 'thay-nguoi', ra, vao })
            }
          />

          <section className="rounded-lg border border-vien bg-nen-the p-4">
            <h3 className="text-base font-semibold text-chu">
              {CAN_THIEP_GIUA_TRAN.tieuDeChiThi}
            </h3>
            <p className="mt-0.5 text-sm text-chu-phu">
              {CAN_THIEP_GIUA_TRAN.moTa}
            </p>
            <div className="mt-3">
              <ChiThiDoi
                chiThi={benCuaNguoiDung.chienThuatHienTai.chiThi}
                onDoi={(chiThi) =>
                  guiCanThiep({ loai: 'doi-chi-thi', chiThi })
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
