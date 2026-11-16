import { BieuTuong } from '../components/BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useState } from 'react'
import { PHIEN_BAN_ENGINE } from '../../engine/tran'
import * as matchRepo from '../../services/matchRepo'
import * as playerRepo from '../../services/playerRepo'
import { useAppStore } from '../../store/appStore'
import type { AnhChupDoi, TomTatTran, TranDaLuu } from '../../storage/db'
import { BangDiemCauThu } from '../components/BangDiemCauThu'
import { DanhSachGhiBan } from '../components/DanhSachGhiBan'
import { DongTuongThuat } from '../components/DongTuongThuat'


interface Props {
  readonly onQuayLai: () => void
  /** Bắt đầu lại đúng cặp đấu này; màn trận do `App` mở (AC-11.6). */
  readonly onDauLai: (tran: TranDaLuu) => void
}

/*
  Lịch sử 20 trận gần nhất (AC-11.7), xem lại được báo cáo và toàn bộ dòng sự
  kiện của từng trận (AC-11.4), và còn nguyên sau khi đóng mở lại ứng dụng
  (AC-4.2).

  TÊN ĐỘI phân giải từ đội ĐANG SỐNG nếu đội còn tồn tại, nên đổi tên đội thì
  lịch sử đổi theo (AC-1.5); đội đã bị xoá thì rơi về ảnh chụp lúc trận diễn
  ra, nên trận cũ vẫn xem lại được với tên lúc đó (spec mục 5). Đó là lý do
  bản ghi giữ cả `teamId` lẫn ảnh chụp — quyết định D46.
*/

/*
  Mốc thời gian theo ngôn ngữ đang chọn (T344).

  Mã vùng đi vào bằng THAM SỐ, không đặt cứng: đây là hàm thuần ở tầng
  module nên nó không được tự tra lớp ngôn ngữ — cùng cách `hinhSan()` và
  `cauLyDo()` vẫn nhận chữ (D68).
*/
function ngayGio(mocMs: number, maVung: string): string {
  return new Date(mocMs).toLocaleString(maVung, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TrangLichSu({ onQuayLai, onDauLai }: Props) {
  const { BAO_CAO_SAU_TRAN, CHUNG, DINH_DANG, LICH_SU } = useChuoi()
  const teams = useAppStore((s) => s.teams)
  const lichSu = useAppStore((s) => s.lichSu)
  const datLichSu = useAppStore((s) => s.datLichSu)

  const [dangMo, datDangMo] = useState<TranDaLuu | null>(null)
  const [tenTheoId, datTenTheoId] = useState<ReadonlyMap<string, string>>(
    new Map(),
  )

  useEffect(() => {
    let conHieuLuc = true
    void matchRepo.danhSach().then((ds) => {
      if (conHieuLuc) datLichSu(ds)
    })
    return () => {
      conHieuLuc = false
    }
  }, [datLichSu])

  /* Tên cầu thủ là thứ của giao diện: bản ghi chỉ giữ id (P2). */
  useEffect(() => {
    if (!dangMo) return
    let conHieuLuc = true

    void Promise.all([
      playerRepo.listByTeam(dangMo.nha.teamId),
      playerRepo.listByTeam(dangMo.khach.teamId),
    ]).then(([a, b]) => {
      if (conHieuLuc) {
        datTenTheoId(new Map([...a, ...b].map((p) => [p.id, p.name])))
      }
    })

    return () => {
      conHieuLuc = false
    }
  }, [dangMo])

  /** Tên hiện tại của đội, hay tên lúc đó nếu đội đã bị xoá. */
  const tenDoiCua = (anh: AnhChupDoi): { ten: string; daXoa: boolean } => {
    const dangSong = teams.find((d) => d.id === anh.teamId)
    return dangSong
      ? { ten: dangSong.name, daXoa: false }
      : { ten: anh.ten, daXoa: true }
  }

  const moTran = async (tomTat: TomTatTran) => {
    datDangMo(await matchRepo.doc(tomTat.id))
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

      <h2 className="mt-4 flex items-center gap-2 font-tieuDe text-2xl font-bold uppercase tracking-wide text-chu">
        <BieuTuong ten="lichSu" co="lon" />
        {LICH_SU.tieuDe}
      </h2>
      <p className="mt-1 text-sm text-chu-phu">
        {LICH_SU.moTa(matchRepo.SO_TRAN_GIU_LAI)}
      </p>

      {lichSu.length === 0 ? (
        <p className="mt-4 rounded-lg border border-vien bg-nen-nhan p-3 text-sm text-chu-phu">
          {LICH_SU.chuaCoTran}
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {lichSu.map((t) => {
            const nha = tenDoiCua(t.doiChuNha)
            const khach = tenDoiCua(t.doiKhach)
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded border-b border-vien py-2 text-sm hover:bg-nen-nhan"
              >
                <span className="w-40 shrink-0 text-chu-phu">
                  {ngayGio(t.ketThucLuc, DINH_DANG.maVung)}
                </span>
                <span className="flex-1 text-chu">
                  {nha.ten}
                  {nha.daXoa && (
                    <span className="ml-1 text-xs text-canh-bao-chu">
                      ({LICH_SU.doiDaXoa})
                    </span>
                  )}{' '}
                  <span className="font-tieuDe text-base font-bold tracking-wide text-chu">
                    {t.tiSo.nha} – {t.tiSo.khach}
                  </span>{' '}
                  {khach.ten}
                  {khach.daXoa && (
                    <span className="ml-1 text-xs text-canh-bao-chu">
                      ({LICH_SU.doiDaXoa})
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-chu-phu">
                  {LICH_SU.dinhDangTran(
                    matchRepo.quanSoCua(t),
                    matchRepo.thoiLuongCua(t),
                  )}
                </span>
                <code className="font-mono text-xs text-chu-phu">
                  {t.maTran}
                </code>
                <button
                  type="button"
                  onClick={() => void moTran(t)}
                  className="text-chinh underline hover:text-chinh-dam"
                >
                  {LICH_SU.moLink}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {dangMo && (
        <section className="mt-6 rounded-lg border border-vien bg-nen-the p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <h3 className="font-tieuDe text-lg font-bold uppercase tracking-wide text-chu">
              {tenDoiCua(dangMo.doiChuNha).ten} {dangMo.tiSo.nha} –{' '}
              {dangMo.tiSo.khach} {tenDoiCua(dangMo.doiKhach).ten}
              <span className="ml-2 font-chinh text-sm font-normal normal-case tracking-normal text-chu-phu">
                {LICH_SU.dinhDangTran(
                  matchRepo.quanSoCua(dangMo),
                  matchRepo.thoiLuongCua(dangMo),
                )}
              </span>
            </h3>
            <button
              type="button"
              onClick={() => datDangMo(null)}
              className="text-sm text-chinh underline hover:text-chinh-dam"
            >
              {LICH_SU.dong}
            </button>
          </div>

          {/*
            Hai lời cảnh báo, mỗi cái cho một lý do khác nhau vì sao trận này
            không đấu lại được như cũ (quyết định D35 và spec mục 5).
          */}
{(() => {
            /*
              "Xem lại" luôn làm được vì bản ghi mang dòng sự kiện đầy đủ.
              "Đấu lại" thì không phải lúc nào cũng được — và khi không được
              thì phải nói VÌ SAO, chứ không im lặng ẩn nút đi.
            */
            const lyDo = matchRepo.lyDoKhongDauLai(
              dangMo,
              PHIEN_BAN_ENGINE,
              (teamId) => teams.some((d) => d.id === teamId),
            )
            return (
              <div className="mt-2">
                {lyDo && (
                  <p className="rounded border border-vien-dam bg-canh-bao-nen p-2 text-sm text-canh-bao-chu">
                    {LICH_SU.lyDoKhongDauLai[lyDo] ?? lyDo}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onDauLai(dangMo)}
                  disabled={lyDo !== null}
                  className="mt-2 rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
                >
                  {LICH_SU.dauLai}
                </button>
              </div>
            )
          })()}

          <div className="mt-4">
            <h4 className="flex items-center gap-2 font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
              <BieuTuong ten="banThang" co="nho" />
              {BAO_CAO_SAU_TRAN.tieuDeGhiBan}
            </h4>
            <div className="mt-2">
              <DanhSachGhiBan
                nguoiGhiBan={dangMo.baoCao.nguoiGhiBan}
                tenCauThu={(id) => tenTheoId.get(id) ?? id}
                tenDoi={(ben) =>
                  tenDoiCua(
                    ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach,
                  ).ten
                }
              />
            </div>
          </div>

          {(['nha', 'khach'] as const).map((doi) => (
            <div key={doi} className="mt-4">
              <h4 className="font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
                {BAO_CAO_SAU_TRAN.tieuDeDiem} —{' '}
                {tenDoiCua(doi === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach)
                  .ten}
              </h4>
              <div className="mt-2">
                <BangDiemCauThu
                  diemCauThu={dangMo.baoCao.diemCauThu.filter(
                    (x) => x.doi === doi,
                  )}
                  tenCauThu={(id) => tenTheoId.get(id) ?? id}
                />
              </div>
            </div>
          ))}

          <div className="mt-4">
            <h4 className="font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
              {LICH_SU.tieuDeDienBien}
            </h4>
            <div className="mt-2">
              <DongTuongThuat
                cacSuKien={dangMo.cacSuKien}
                tenCauThu={(id) => tenTheoId.get(id) ?? id}
                tenDoi={(ben) =>
                  tenDoiCua(
                    ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach,
                  ).ten
                }
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
