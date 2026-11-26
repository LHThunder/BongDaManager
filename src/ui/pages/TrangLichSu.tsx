import { BieuTuong } from '../components/BieuTuong'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useEffect, useMemo, useState } from 'react'
import type { SuKien } from '../../engine/suKien'
import * as matchRepo from '../../services/matchRepo'
import * as phatLai from '../../services/phatLai'
import * as playerRepo from '../../services/playerRepo'
import { useAppStore } from '../../store/appStore'
import type { AnhChupDoi, TomTatTran, TranDaLuu } from '../../storage/db'
import { BangDiemCauThu } from '../components/BangDiemCauThu'
import { DanhSachGhiBan } from '../components/DanhSachGhiBan'
import { DongTuongThuat } from '../components/DongTuongThuat'
import { RePhatLai } from '../components/RePhatLai'


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
  /** Phút người dùng đã chọn để rẽ nhánh; `null` là chưa rẽ (US-27). */
  const [phutRe, datPhutRe] = useState<phatLai.PhutHienThi | null>(null)
  const [tenTheoId, datTenTheoId] = useState<ReadonlyMap<string, string>>(
    new Map(),
  )

  /*
    Vì sao trận đang mở không chạy lại được, nếu không chạy lại được (D35,
    spec mục 5).

    Tính MỘT lần ở đây rồi dùng cho cả hai lối — "đấu lại" và "rẽ nhánh" —
    vì cả hai đều là chạy lại engine, nên hai lối không được phép có hai câu
    trả lời khác nhau cho cùng một trận (AC-27.5, AC-27.6).
  */
  /*
    ⚠️ Số phiên bản phải hỏi theo CHẾ ĐỘ của chính trận ấy, không đặt cứng.

    Dòng này từng truyền thẳng `PHIEN_BAN_ENGINE` (= 6). Từ spec 007 có hai
    engine và hai số: v6 mang **6**, engine liên tục mang **101**. Đặt cứng 6
    thì **mọi** trận liên tục đã lưu rơi vào `khac-phien-ban-engine` và mất cả
    hai nút — mà đây là chỗ DUY NHẤT trong ứng dụng gọi `lyDoKhongDauLai`, nên
    engine có đóng dấu 101 đúng tới đâu cũng vô ích nếu cửa này còn hỏi sai.
  */
  const lyDoTuBanGhi = dangMo
    ? matchRepo.lyDoKhongDauLai(
        dangMo,
        matchRepo.phienBanEngineHienTaiCua(matchRepo.cheDoCua(dangMo)),
        (teamId) => teams.some((d) => d.id === teamId),
      )
    : null

  /*
    Khoảng phút rẽ nhánh được của trận đang mở.

    Phải dựng trạng thái đầu trận mới biết bù giờ hai hiệp dài bao nhiêu, nên
    nhớ lại theo bản ghi: một `taoTran` cho mỗi lần mở một trận, không phải
    mỗi lần vẽ.

    `thuTrangThaiDauTran` chứ không `trangThaiDauTran` (T440): dựng trận từ
    một bản ghi CÓ THỂ bị engine từ chối — bản ghi lưu bằng bản ứng dụng cũ
    của một đội hơn 18 người ghi quá nhiều dự bị. Phép dựng ấy ném, mà ở đây
    nó nằm trong một `useMemo`, nên trước Phase 35 một bản ghi như vậy tháo cả
    cây React: trang trắng, phải tải lại. Nay nó thành lý do thứ ba, đứng cùng
    chỗ với hai lý do đã có.
  */
  const thuDungTran = useMemo(
    () =>
      dangMo && lyDoTuBanGhi === null
        ? phatLai.thuTrangThaiDauTran(dangMo)
        : null,
    [dangMo, lyDoTuBanGhi],
  )

  /** Ba lý do, một chỗ: hai từ `matchRepo` và một từ phép dựng trận. */
  type LyDoKhongChayLai =
    | matchRepo.LyDoKhongDauLai
    | phatLai.LyDoKhongDungTran

  const lyDoKhongChayLai: LyDoKhongChayLai | null =
    lyDoTuBanGhi ??
    (thuDungTran && !thuDungTran.dungDuoc ? thuDungTran.lyDo : null)

  const tranDauCuaBanGhi =
    thuDungTran && thuDungTran.dungDuoc ? thuDungTran.trangThai : null

  const chonPhutDuoc = (sk: SuKien): boolean =>
    tranDauCuaBanGhi !== null &&
    phatLai.phutReDuoc(
      tranDauCuaBanGhi,
      phatLai.phutThucTe(tranDauCuaBanGhi, sk),
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
    datPhutRe(null)
    datDangMo(await matchRepo.doc(tomTat.id))
  }

  const dongTran = () => {
    datPhutRe(null)
    datDangMo(null)
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
              onClick={dongTran}
              className="text-sm text-chinh underline hover:text-chinh-dam"
            >
              {LICH_SU.dong}
            </button>
          </div>

          {/*
            Hai lời cảnh báo, mỗi cái cho một lý do khác nhau vì sao trận này
            không đấu lại được như cũ (quyết định D35 và spec mục 5).
          */}
{/*
            "Xem lại" luôn làm được vì bản ghi mang dòng sự kiện đầy đủ.
            "Đấu lại" và "rẽ nhánh" thì không phải lúc nào cũng được — và khi
            không được thì phải nói VÌ SAO, chứ không im lặng ẩn nút đi.
          */}
          <div className="mt-2">
            {lyDoKhongChayLai && (
              <>
                <p className="rounded border border-vien-dam bg-canh-bao-nen p-2 text-sm text-canh-bao-chu">
                  {LICH_SU.lyDoKhongDauLai[lyDoKhongChayLai] ??
                    lyDoKhongChayLai}
                </p>
                <p
                  role="status"
                  className="mt-2 rounded border border-vien-dam bg-canh-bao-nen p-2 text-sm text-canh-bao-chu"
                >
                  {LICH_SU.lyDoKhongReNhanh[lyDoKhongChayLai] ??
                    lyDoKhongChayLai}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => onDauLai(dangMo)}
              disabled={lyDoKhongChayLai !== null}
              className="mt-2 rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:cursor-not-allowed disabled:bg-nen-nhan disabled:text-chu-phu"
            >
              {LICH_SU.dauLai}
            </button>
          </div>

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
            {tranDauCuaBanGhi && (
              <p className="mt-0.5 text-sm text-chu-phu">
                {LICH_SU.moTaReNhanh}
              </p>
            )}
            <div className="mt-2">
              <DongTuongThuat
                cacSuKien={dangMo.cacSuKien}
                tenCauThu={(id) => tenTheoId.get(id) ?? id}
                tenDoi={(ben) =>
                  tenDoiCua(
                    ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach,
                  ).ten
                }
                /*
                  Nút rẽ nhánh chỉ mọc ở dòng tường thuật của LỊCH SỬ. Trang
                  trận đang chạy gọi `DongTuongThuat` mà không truyền prop này
                  nên nó hiện đúng như cũ (T432).
                */
                chonPhut={
                  tranDauCuaBanGhi
                    ? {
                        nhan: LICH_SU.nutReNhanh,
                        nhanCuaDong: LICH_SU.reNhanhTuPhut,
                        chonDuoc: chonPhutDuoc,
                        onChon: (sk) =>
                          datPhutRe({ phut: sk.phut, buGio: sk.buGio }),
                      }
                    : undefined
                }
              />
            </div>
          </div>

          {/*
            Màn rẽ nhánh sống NGAY dưới trận gốc, không phải một trang khác:
            người dùng cần thấy trận gốc còn nguyên ở trên trong lúc đọc
            nhánh (AC-27.7).
          */}
          {phutRe && (
            <RePhatLai
              banGhi={dangMo}
              phutRe={phutRe}
              tenCauThu={(id) => tenTheoId.get(id) ?? id}
              tenDoi={(ben) =>
                tenDoiCua(ben === 'nha' ? dangMo.doiChuNha : dangMo.doiKhach)
                  .ten
              }
              onRoi={() => datPhutRe(null)}
            />
          )}
        </section>
      )}
    </div>
  )
}
