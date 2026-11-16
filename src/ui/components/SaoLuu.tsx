import { useEffect, useRef, useState } from 'react'
import { useBackup } from '../../hooks/useBackup'
import { laLoiUngDung } from '../../services/errors'
import type { CheDoNhap, TomTatTep } from '../../services/backupService'
import { useChuoi } from '../../hooks/useNgonNgu'
import { coTep } from '../strings'

interface Props {
  /** Gọi sau khi nhập xong để màn hình nạp lại dữ liệu. */
  readonly onDaNhap: () => void
}

/**
 * Xuất và nhập tệp sao lưu (AC-4.3, AC-4.5, AC-4.6, AC-4.8, AC-4.9).
 *
 * Chọn tệp KHÔNG nhập ngay: trước tiên xem tệp có gì, rồi người dùng mới chọn
 * thay thế hay gộp. Chưa chọn thì chưa có gì thay đổi (AC-4.6).
 */
export function SaoLuu({ onDaNhap }: Props) {
  const { CHUNG, LOI, SAO_LUU } = useChuoi()
  const { luuTruKhongBen, uocTinhKichThuoc, xuatTep, xemTruocTep, nhapTep } =
    useBackup()

  const [kichThuoc, datKichThuoc] = useState<number | null>(null)
  const [dangXuat, datDangXuat] = useState(false)
  const [dangDoc, datDangDoc] = useState(false)
  const [tepDangCho, datTepDangCho] = useState<File | null>(null)
  const [tomTat, datTomTat] = useState<TomTatTep | null>(null)
  const [loi, datLoi] = useState<string | null>(null)
  const [thongBao, datThongBao] = useState<string | null>(null)
  const oTep = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let conHieuLuc = true
    void uocTinhKichThuoc().then(
      (co) => {
        if (conHieuLuc) datKichThuoc(co)
      },
      () => {
        if (conHieuLuc) datKichThuoc(null)
      },
    )
    return () => {
      conHieuLuc = false
    }
  }, [uocTinhKichThuoc, thongBao])

  async function xuat() {
    datLoi(null)
    datDangXuat(true)
    try {
      await xuatTep()
    } catch (e) {
      datLoi(laLoiUngDung(e) ? LOI.cau(e) : String(e))
    } finally {
      datDangXuat(false)
    }
  }

  async function chonTep(tep: File | undefined) {
    datLoi(null)
    datThongBao(null)
    datTomTat(null)
    datTepDangCho(null)
    if (!tep) return

    datDangDoc(true)
    try {
      datTomTat(await xemTruocTep(tep))
      datTepDangCho(tep)
    } catch (e) {
      datLoi(laLoiUngDung(e) ? LOI.cau(e) : String(e))
    } finally {
      datDangDoc(false)
    }
  }

  async function nhap(cheDo: CheDoNhap) {
    if (!tepDangCho) return
    datLoi(null)
    try {
      const baoCao = await nhapTep(tepDangCho, cheDo)
      const cau =
        cheDo === 'thay-the'
          ? SAO_LUU.daNhapThayThe(baoCao.soDoi, baoCao.soCauThu, baoCao.soTran)
          : SAO_LUU.daNhapGop(baoCao.soDoi, baoCao.soCauThu)
      datThongBao(
        baoCao.soTranBoQua > 0
          ? `${cau} ${SAO_LUU.gopBoQuaLichSu(baoCao.soTranBoQua)}`
          : cau,
      )
      datTepDangCho(null)
      datTomTat(null)
      onDaNhap()
    } catch (e) {
      datLoi(laLoiUngDung(e) ? LOI.cau(e) : String(e))
    }
  }

  return (
    <section className="mt-10 rounded-lg border border-vien bg-nen-the p-5">
      <h3 className="text-base font-semibold text-chu">
        {SAO_LUU.tieuDe}
      </h3>
      <p className="mt-1 max-w-2xl text-sm text-chu-phu">{SAO_LUU.moTa}</p>

      {luuTruKhongBen && (
        <p role="alert" className="mt-3 rounded-md bg-canh-bao-nen p-3 text-sm text-canh-bao-chu">
          {SAO_LUU.canhBaoKhongBen}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={dangXuat}
          onClick={() => void xuat()}
          className="rounded-md bg-chinh px-4 py-2 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam disabled:opacity-50"
        >
          {dangXuat ? SAO_LUU.dangDungTep : SAO_LUU.nutXuat}
        </button>

        {kichThuoc !== null && (
          <span className="text-sm text-chu-phu">
            {SAO_LUU.kichThuocUocTinh(coTep(kichThuoc))}
          </span>
        )}

        <input
          ref={oTep}
          type="file"
          // Nhận cả tệp v2 (.zip) và tệp v1 đã phát hành (.json) — P7.
          accept="application/zip,.zip,application/json,.json"
          className="hidden"
          onChange={(e) => {
            void chonTep(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={dangDoc}
          onClick={() => oTep.current?.click()}
          className="rounded-md border border-vien-dam px-4 py-2 text-sm font-medium text-chu hover:bg-nen-nhan disabled:opacity-50"
        >
          {dangDoc ? SAO_LUU.dangDocTep : SAO_LUU.nutNhap}
        </button>
      </div>

      {loi !== null && (
        <p role="alert" className="mt-3 text-sm text-loi-chu">
          {loi}
        </p>
      )}

      {thongBao !== null && (
        <p role="status" className="mt-3 text-sm text-tot-chu">
          {thongBao}
        </p>
      )}

      {tomTat !== null && tepDangCho !== null && (
        <div className="mt-4 rounded-md border border-chinh bg-chinh-nhat p-4">
          <p className="text-sm text-chu">
            {SAO_LUU.tomTatTep(tomTat.soDoi, tomTat.soCauThu, tomTat.soAnh)}
          </p>
          <p className="mt-2 text-sm font-medium text-chu">
            {SAO_LUU.hoiCheDo}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-vien bg-nen-the p-3">
              <button
                type="button"
                onClick={() => void nhap('thay-the')}
                className="rounded-md bg-loi-manh px-3 py-1.5 text-sm font-medium text-chu-tren-loi hover:bg-loi-manh-dam"
              >
                {SAO_LUU.nutThayThe}
              </button>
              <p className="mt-2 text-xs text-chu-phu">
                {SAO_LUU.moTaThayThe}
              </p>
            </div>

            <div className="rounded-md border border-vien bg-nen-the p-3">
              <button
                type="button"
                onClick={() => void nhap('gop')}
                className="rounded-md bg-chinh px-3 py-1.5 text-sm font-medium text-chu-tren-chinh hover:bg-chinh-dam"
              >
                {SAO_LUU.nutGop}
              </button>
              <p className="mt-2 text-xs text-chu-phu">{SAO_LUU.moTaGop}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              datTepDangCho(null)
              datTomTat(null)
            }}
            className="mt-3 text-sm text-chu-phu underline"
          >
            {CHUNG.huy}
          </button>
        </div>
      )}
    </section>
  )
}
