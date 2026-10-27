import { moDb } from '../storage/db'
import { LoiUngDung, chuanHoaLoiLuuTru } from './errors'

/*
  Cắt, thu nhỏ và nén ảnh (AC-3.1, AC-3.2, AC-3.3).

  Không dùng thư viện nén nào: canvas của trình duyệt đã làm được việc này
  (quyết định D5 của plan).

  Phần phụ thuộc canvas được tách ra sau một interface `BoXuLyAnh`. Nhờ vậy
  phần dễ sai — chính sách hạ dần chất lượng rồi hạ kích thước cho tới khi đạt
  giới hạn, phép cắt khung vuông, và việc quy lỗi — được test không cần canvas
  thật; còn lớp canvas mỏng thì kiểm bằng mắt trên trình duyệt.
*/

/** Cạnh ảnh mong muốn, tính theo điểm ảnh. */
export const CANH_CHAN_DUNG = 256
export const CANH_LOGO = 256

/** Giới hạn dung lượng theo spec mục 6. */
export const GIOI_HAN_CHAN_DUNG = 100 * 1024
export const GIOI_HAN_LOGO = 50 * 1024

/** Thử hạ chất lượng trước, vì nó giữ được độ phân giải. */
export const CAC_MUC_CHAT_LUONG = [0.9, 0.8, 0.72, 0.64, 0.56, 0.45] as const

/*
  Chỉ hạ cạnh khi hạ hết chất lượng mà vẫn chưa đạt giới hạn.

  Trước đây đây là một thang tỉ lệ cố định, và test bắt được chỗ sai: với ảnh
  rất lớn, đáy thang đạt giới hạn 100KB của ảnh chân dung nhưng vẫn vượt giới
  hạn 50KB của logo. Một thang cố định không bao giờ bảo đảm được cho mọi giới
  hạn, nên giờ cạnh được hạ dần CHO TỚI KHI đạt, có sàn để luôn kết thúc.
*/
export const TI_LE_HA_CANH = 0.75
export const CANH_TOI_THIEU = 24

export interface KhungCat {
  readonly x: number
  readonly y: number
  readonly canh: number
}

export interface AnhDaGiaiMa {
  readonly width: number
  readonly height: number
}

/** Lớp phụ thuộc trình duyệt, tách ra để test được phần chính sách. */
export interface BoXuLyAnh {
  giaiMa(tep: Blob): Promise<AnhDaGiaiMa>
  veVaNen(
    anh: AnhDaGiaiMa,
    tep: Blob,
    khung: KhungCat,
    canhDich: number,
    chatLuong: number,
  ): Promise<Blob>
}

export interface AnhDaXuLy {
  readonly blob: Blob
  readonly width: number
  readonly height: number
  readonly byteSize: number
}

export function laTepAnh(tep: Blob): boolean {
  return typeof tep.type === 'string' && tep.type.startsWith('image/')
}

/** Khung vuông lớn nhất, căn giữa — dùng cho logo và khi không có khung do người dùng chọn. */
export function khungVuongGiua(anh: AnhDaGiaiMa): KhungCat {
  const canh = Math.min(anh.width, anh.height)
  return {
    x: Math.round((anh.width - canh) / 2),
    y: Math.round((anh.height - canh) / 2),
    canh,
  }
}

async function chuanBi(
  tep: Blob,
  khungDoNguoiDungChon: KhungCat | null,
  canhGoc: number,
  gioiHan: number,
  bo: BoXuLyAnh,
): Promise<AnhDaXuLy> {
  if (!laTepAnh(tep)) {
    throw new LoiUngDung('NotAnImage', { giaTri: tep.type || '(không rõ)' })
  }

  let anh: AnhDaGiaiMa
  try {
    anh = await bo.giaiMa(tep)
  } catch (nguyenNhan) {
    throw new LoiUngDung('DecodeFailed', {}, nguyenNhan)
  }

  if (anh.width <= 0 || anh.height <= 0) {
    throw new LoiUngDung('DecodeFailed', { truong: 'kichThuoc' })
  }

  const khung = khungDoNguoiDungChon ?? khungVuongGiua(anh)

  let nhoNhat: AnhDaXuLy | null = null
  let canhDich = canhGoc

  for (;;) {
    for (const chatLuong of CAC_MUC_CHAT_LUONG) {
      const blob = await bo.veVaNen(anh, tep, khung, canhDich, chatLuong)
      const ketQua: AnhDaXuLy = {
        blob,
        width: canhDich,
        height: canhDich,
        byteSize: blob.size,
      }

      if (blob.size <= gioiHan) {
        return ketQua
      }
      if (nhoNhat === null || blob.size < nhoNhat.byteSize) {
        nhoNhat = ketQua
      }
    }

    if (canhDich <= CANH_TOI_THIEU) break
    canhDich = Math.max(CANH_TOI_THIEU, Math.round(canhDich * TI_LE_HA_CANH))
  }

  // Chỉ xảy ra nếu ngay cả ảnh 24px cũng vượt giới hạn — khi đó trả bản nhỏ
  // nhất đạt được thay vì bắt người dùng tự xử lý (AC-3.2).
  if (nhoNhat === null) {
    throw new LoiUngDung('DecodeFailed', { truong: 'nen' })
  }
  return nhoNhat
}

/** Ảnh chân dung cầu thủ: vuông, tối đa 100KB (AC-3.1, AC-3.2). */
export function chuanBiAnhChanDung(
  tep: Blob,
  khung: KhungCat | null,
  bo: BoXuLyAnh = boXuLyTrinhDuyet,
): Promise<AnhDaXuLy> {
  return chuanBi(tep, khung, CANH_CHAN_DUNG, GIOI_HAN_CHAN_DUNG, bo)
}

/** Logo đội: vuông, tối đa 50KB. */
export function chuanBiLogo(
  tep: Blob,
  bo: BoXuLyAnh = boXuLyTrinhDuyet,
): Promise<AnhDaXuLy> {
  return chuanBi(tep, null, CANH_LOGO, GIOI_HAN_LOGO, bo)
}

// ---------------------------------------------------------------------------
// Lớp canvas của trình duyệt
// ---------------------------------------------------------------------------

async function veLenCanvas(
  tep: Blob,
  khung: KhungCat,
  canhDich: number,
  chatLuong: number,
): Promise<Blob> {
  const bitmap = await createImageBitmap(tep)
  try {
    if (typeof OffscreenCanvas === 'function') {
      const canvas = new OffscreenCanvas(canhDich, canhDich)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Không lấy được ngữ cảnh 2d')
      ctx.drawImage(
        bitmap,
        khung.x,
        khung.y,
        khung.canh,
        khung.canh,
        0,
        0,
        canhDich,
        canhDich,
      )
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: chatLuong })
    }

    const canvas = document.createElement('canvas')
    canvas.width = canhDich
    canvas.height = canhDich
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Không lấy được ngữ cảnh 2d')
    ctx.drawImage(
      bitmap,
      khung.x,
      khung.y,
      khung.canh,
      khung.canh,
      0,
      0,
      canhDich,
      canhDich,
    )
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('canvas.toBlob trả về null')),
        'image/jpeg',
        chatLuong,
      )
    })
  } finally {
    bitmap.close()
  }
}

export const boXuLyTrinhDuyet: BoXuLyAnh = {
  async giaiMa(tep) {
    const bitmap = await createImageBitmap(tep)
    const kichThuoc = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return kichThuoc
  },
  veVaNen(_anh, tep, khung, canhDich, chatLuong) {
    return veLenCanvas(tep, khung, canhDich, chatLuong)
  },
}

// ---------------------------------------------------------------------------
// Đọc ảnh đã lưu để hiển thị
// ---------------------------------------------------------------------------

/** Lưu ảnh đã xử lý vào store `images`, trả về id để gắn vào đội hoặc cầu thủ. */
export async function luuAnh(anh: AnhDaXuLy): Promise<string> {
  const id = crypto.randomUUID()
  try {
    const db = await moDb()
    await db.put('images', {
      id,
      blob: anh.blob,
      width: anh.width,
      height: anh.height,
      byteSize: anh.byteSize,
    })
    return id
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

export async function docAnh(id: string): Promise<Blob | null> {
  try {
    const db = await moDb()
    const anh = await db.get('images', id)
    return anh?.blob ?? null
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/** Xoá một ảnh không còn ai tham chiếu tới, ví dụ sau khi thay ảnh mới. */
export async function xoaAnh(id: string): Promise<void> {
  try {
    const db = await moDb()
    await db.delete('images', id)
  } catch (loi) {
    throw chuanHoaLoiLuuTru(loi)
  }
}

/**
 * Tạo URL tạm cho một Blob ảnh. Phải gọi `giaiPhongUrl` khi không dùng nữa,
 * nếu không trình duyệt giữ Blob trong bộ nhớ cho tới khi tải lại trang.
 */
export function taoUrlAnh(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function giaiPhongUrl(url: string): void {
  URL.revokeObjectURL(url)
}
