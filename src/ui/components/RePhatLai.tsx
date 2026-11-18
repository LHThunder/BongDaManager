import { useState } from 'react'

import type { BenDoi, SuKien } from '../../engine/suKien'
import { useChuoi } from '../../hooks/useNgonNgu'
import { useRePhatLai } from '../../hooks/useRePhatLai'
import { phutThucTe, type PhutHienThi } from '../../services/phatLai'
import type { TranDaLuu } from '../../storage/db'

import { CAC_CHI_TIEU } from './BaoCaoSauTran'
import { ChiThiDoi } from './ChiThiDoi'
import { DongTuongThuat } from './DongTuongThuat'
import { HopXacNhan } from './HopXacNhan'
import { ThayNguoi } from './ThayNguoi'

interface Props {
  readonly banGhi: TranDaLuu
  /** Phút người dùng đã bấm trong dòng tường thuật, kèm cờ bù giờ. */
  readonly phutRe: PhutHienThi
  readonly tenCauThu: (playerId: string) => string
  readonly tenDoi: (ben: BenDoi) => string
  readonly onRoi: () => void
}

/*
  Màn hình rẽ nhánh: đổi một quyết định tại một phút rồi chạy nốt (US-27).

  BA ĐIỀU VỀ MÀN HÌNH NÀY:

  1. **Nó không có lối rẽ nhánh của riêng nó** (AC-27.10). Dòng tường thuật ở
     đây được gọi KHÔNG kèm `chonPhut`, và câu `khongReTiep` nói thẳng lý do:
     mỗi lần rẽ nhánh đều xuất phát từ một trận trong lịch sử. Ẩn nút mà
     không nói gì thì người dùng sẽ đi tìm.

  2. **Lời cảnh báo "không được lưu" đứng NGAY ở đầu**, không chờ tới lúc rời
     đi (AC-27.9). Hộp xác nhận lúc rời chỉ là lưới thứ hai, và nó chỉ hiện
     khi thật sự có cái để mất.

  3. **Không có phép tính bóng đá nào ở đây** (P2). Mọi con số đến từ
     `useRePhatLai` → `services/phatLai` → engine; component này xếp chữ.
*/
export function RePhatLai({
  banGhi,
  phutRe,
  tenCauThu,
  tenDoi,
  onRoi,
}: Props) {
  const { BAO_CAO_SAU_TRAN, RE_PHAT_LAI, TRAN_DAU } = useChuoi()
  const dieuPhoi = useRePhatLai(banGhi, phutRe)
  const [hoiTruocKhiRoi, datHoiTruocKhiRoi] = useState(false)

  // Nhãn phút viết đúng cách dòng tường thuật viết — "45+2", không phải "46".
  const nhanPhut = TRAN_DAU.phut(phutRe.phut, phutRe.buGio)
  const doi = banGhi.doiCuaNguoiDung

  const thuRoi = () => {
    // Chỉ hỏi khi có cái để mất; không thì hỏi là làm phiền vô ích.
    if (dieuPhoi.ketQua || dieuPhoi.daDoiQuyetDinh) datHoiTruocKhiRoi(true)
    else onRoi()
  }

  if (dieuPhoi.lyDo !== null || !dieuPhoi.taiDiemRe) {
    /*
      Hai lý do khác hẳn nhau nên phải nói khác nhau (T440): "phút ngoài
      khoảng" là chọn lại một phút khác là xong, còn "bản ghi không dựng được"
      thì không phút nào cứu được — nói khoảng phút lúc ấy là chỉ sai đường.
    */
    return (
      <section className="mt-6 rounded-lg border border-vien bg-nen-the p-4">
        <p role="status" className="text-sm text-canh-bao-chu">
          {dieuPhoi.lyDo === 'ban-ghi-khong-dung-duoc'
            ? RE_PHAT_LAI.banGhiKhongDungDuoc
            : RE_PHAT_LAI.phutNgoaiKhoang(
                dieuPhoi.khoangPhut.tu,
                dieuPhoi.khoangPhut.den,
              )}
        </p>
        <button
          type="button"
          onClick={onRoi}
          className="mt-3 text-sm text-chinh underline hover:text-chinh-dam"
        >
          {RE_PHAT_LAI.nutRoi}
        </button>
      </section>
    )
  }

  const taiDiemRe = dieuPhoi.taiDiemRe
  const benNguoiDung = taiDiemRe.ben[doi]
  const ketQua = dieuPhoi.ketQua
  const phutDongHo = phutThucTe(taiDiemRe, phutRe)
  /** Dòng đầu tiên thuộc phần nhánh, để đặt mốc "từ đây trở đi khác". */
  const dongDauNhanh =
    ketQua?.cacSuKien.find(
      (sk) => phutThucTe(ketQua.cuoiTran, sk) > phutDongHo,
    ) ?? null

  return (
    <section className="mt-6 rounded-lg border border-vien bg-nen-the p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-tieuDe text-lg font-bold uppercase tracking-wide text-chu">
            {RE_PHAT_LAI.tieuDe}
          </h3>
          <p className="mt-1 text-sm text-chu-phu">
            {RE_PHAT_LAI.moTa(nhanPhut)}
          </p>
        </div>
        <button
          type="button"
          onClick={thuRoi}
          className="text-sm text-chinh underline hover:text-chinh-dam"
        >
          {RE_PHAT_LAI.nutRoi}
        </button>
      </div>

      {/* Hai hạn chế người dùng không đoán được, nói ngay từ đầu. */}
      <p className="mt-3 rounded border border-vien-dam bg-canh-bao-nen p-2 text-sm text-canh-bao-chu">
        {RE_PHAT_LAI.khongLuu}
      </p>
      <p className="mt-2 text-sm text-chu-phu">{RE_PHAT_LAI.khongReTiep}</p>

      <div className="mt-4 border-t border-vien pt-4">
        <h4 className="font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
          {RE_PHAT_LAI.tieuDeQuyetDinh} — {tenDoi(doi)}
        </h4>
        <p className="mt-0.5 text-sm text-chu-phu">
          {RE_PHAT_LAI.moTaQuyetDinh}
        </p>

        <div className="mt-3 space-y-3">
          <ChiThiDoi
            chiThi={
              dieuPhoi.chiThiMoi ?? benNguoiDung.chienThuatHienTai.chiThi
            }
            onDoi={dieuPhoi.datChiThi}
          />

          <ThayNguoi
            ben={benNguoiDung}
            tenCauThu={tenCauThu}
            tamDung
            onThay={dieuPhoi.datThayNguoi}
            loi={null}
          />
        </div>

        <div className="mt-3 space-y-1 text-sm">
          {dieuPhoi.chiThiMoi && (
            <p className="text-chu">{RE_PHAT_LAI.daDoiChiThi}</p>
          )}
          {dieuPhoi.thayNguoiMoi && (
            <p className="flex flex-wrap items-center gap-2 text-chu">
              {RE_PHAT_LAI.daChonThayNguoi(
                tenCauThu(dieuPhoi.thayNguoiMoi.ra),
                tenCauThu(dieuPhoi.thayNguoiMoi.vao),
              )}
              <button
                type="button"
                onClick={dieuPhoi.boThayNguoi}
                className="text-chinh underline hover:text-chinh-dam"
              >
                {RE_PHAT_LAI.boThayNguoi}
              </button>
            </p>
          )}
          {!dieuPhoi.daDoiQuyetDinh && (
            <p className="text-chu-phu">{RE_PHAT_LAI.chuaDoiGi}</p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={dieuPhoi.chay}
            className="rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
          >
            {ketQua ? RE_PHAT_LAI.nutChayLai : RE_PHAT_LAI.nutChay}
          </button>
          {dieuPhoi.daDoiQuyetDinh && (
            <button
              type="button"
              onClick={dieuPhoi.datLai}
              className="rounded-md border border-vien-dam px-3 py-1.5 text-sm font-medium text-chu hover:bg-nen-nhan"
            >
              {RE_PHAT_LAI.nutDatLai}
            </button>
          )}
        </div>
      </div>

      {ketQua && (
        <>
          {/*
            Khối so sánh (AC-27.3).

            Dùng lại `CAC_CHI_TIEU` của báo cáo sau trận chứ không khai một
            danh sách chỉ tiêu thứ hai: hai danh sách sẽ có ngày lệch nhau, và
            lúc ấy người dùng đọc hai bảng nói hai chuyện khác nhau về cùng
            một trận.
          */}
          <div className="mt-5 border-t border-vien pt-4">
            <h4 className="font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
              {RE_PHAT_LAI.tieuDeSoSanh}
            </h4>
            <p className="mt-0.5 text-sm text-chu-phu">
              {RE_PHAT_LAI.moTaSoSanh}
            </p>

            <table className="mt-3 w-full max-w-xl text-sm">
              <caption className="sr-only">
                {RE_PHAT_LAI.tieuDeSoSanh}
              </caption>
              <thead>
                <tr className="text-chu-phu">
                  <th scope="col" className="text-left font-medium">
                    {RE_PHAT_LAI.cotChiTieu}
                  </th>
                  <th scope="col" className="text-right font-medium">
                    {RE_PHAT_LAI.cotGoc}
                  </th>
                  <th scope="col" className="text-right font-medium">
                    {RE_PHAT_LAI.cotNhanh}
                  </th>
                </tr>
              </thead>
              <tbody className="text-chu">
                <tr className="border-b border-vien">
                  <th scope="row" className="py-1 text-left font-medium">
                    {RE_PHAT_LAI.hangTiSo}
                  </th>
                  <td className="py-1 text-right font-mono font-semibold">
                    {RE_PHAT_LAI.tiSo(
                      banGhi.baoCao.tiSo.nha,
                      banGhi.baoCao.tiSo.khach,
                    )}
                  </td>
                  <td className="py-1 text-right font-mono font-semibold">
                    {RE_PHAT_LAI.tiSo(
                      ketQua.baoCao.tiSo.nha,
                      ketQua.baoCao.tiSo.khach,
                    )}
                  </td>
                </tr>

                {(['nha', 'khach'] as const).map((ben) =>
                  CAC_CHI_TIEU.map((ct) => {
                    const cu = banGhi.baoCao.theoBen[ben][ct.khoa]
                    const moi = ketQua.baoCao.theoBen[ben][ct.khoa]
                    const hien = (x: number) =>
                      ct.phanTram
                        ? BAO_CAO_SAU_TRAN.phanTram(x)
                        : String(x)
                    return (
                      <tr key={`${ben}-${ct.khoa}`}>
                        <th
                          scope="row"
                          className="py-0.5 text-left font-normal text-chu-phu"
                        >
                          {tenDoi(ben)} — {BAO_CAO_SAU_TRAN.chiTieu[ct.khoa]}
                        </th>
                        <td className="py-0.5 text-right font-mono">
                          {hien(cu)}
                        </td>
                        <td className="py-0.5 text-right font-mono font-semibold">
                          {hien(moi)}
                          {/*
                            Khác biệt được nói bằng CHỮ, không chỉ bằng đậm
                            nhạt hay màu (P9).
                          */}
                          <span className="ml-1 text-xs font-normal text-chu-phu">
                            {cu === moi
                              ? RE_PHAT_LAI.giongTranGoc
                              : RE_PHAT_LAI.khacTranGoc}
                          </span>
                        </td>
                      </tr>
                    )
                  }),
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 border-t border-vien pt-4">
            <h4 className="font-tieuDe text-base font-bold uppercase tracking-wide text-chu">
              {RE_PHAT_LAI.tieuDeDienBien}
            </h4>
            <div className="mt-2">
              <DongTuongThuat
                cacSuKien={ketQua.cacSuKien}
                tenCauThu={tenCauThu}
                tenDoi={tenDoi}
                mocRe={{
                  nhan: RE_PHAT_LAI.mocRe(nhanPhut),
                  // So bằng THAM CHIẾU với dòng đầu tiên sau điểm rẽ: tìm một
                  // lần ở ngoài, không tìm lại ở từng dòng.
                  batDauTu: (sk: SuKien) => sk === dongDauNhanh,
                }}
              />
            </div>
          </div>
        </>
      )}

      {hoiTruocKhiRoi && (
        <HopXacNhan
          tieuDe={RE_PHAT_LAI.xacNhanRoiTieuDe}
          moTa={RE_PHAT_LAI.xacNhanRoiMoTa}
          nhanXacNhan={RE_PHAT_LAI.xacNhanRoiNhan}
          onXacNhan={onRoi}
          onHuy={() => datHoiTruocKhiRoi(false)}
        />
      )}
    </section>
  )
}
