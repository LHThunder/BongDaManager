import { useEffect, useState } from 'react'
import { nenDamBaoTuongPhan } from '../../domain/colors'
import { docAnh, giaiPhongUrl, taoUrlAnh } from '../../services/imageService'

interface Props {
  /** Id ảnh đã lưu; `null` thì hiện hình thay thế bằng chữ cái đầu. */
  readonly anhId: string | null
  /** Tên cầu thủ hoặc tên đội, để lấy chữ cái đầu. */
  readonly ten: string
  /** Màu áo chính của đội, dùng làm nền cho hình thay thế. */
  readonly mauNen: string
  readonly kichThuoc?: 'nho' | 'vua' | 'lon'
}

const CO_CHU: Record<NonNullable<Props['kichThuoc']>, string> = {
  nho: 'h-8 w-8 text-xs',
  vua: 'h-12 w-12 text-base',
  lon: 'h-14 w-14 text-xl',
}

/**
 * Chữ cái đầu của tên: chữ đầu của từ đầu và của từ cuối.
 * "Quế Ngọc Hải" -> "QH"; "Pelé" -> "P".
 *
 * Dấu câu bị lọc bỏ trước khi lấy chữ, nếu không một cái tên như
 * "Dũng (dự bị)" sẽ cho ra chữ cái đầu là dấu ngoặc.
 */
export function chuCaiDau(ten: string): string {
  const tu = ten
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)

  if (tu.length === 0) return '?'
  const dau = tu[0]?.[0] ?? ''
  const cuoi = tu.length > 1 ? (tu[tu.length - 1]?.[0] ?? '') : ''
  return (dau + cuoi).toUpperCase()
}

/**
 * Ảnh đại diện của cầu thủ hoặc đội.
 *
 * Có ảnh thì hiện ảnh; chưa có thì hiện hình tròn gồm chữ cái đầu trên nền
 * màu áo chính (AC-3.4). Màu chữ và nền lấy từ `nenDamBaoTuongPhan` nên chữ
 * luôn đọc được, kể cả với màu áo mà người dùng tự chọn (AC-3.8, P9).
 */
export function AnhThayThe({ anhId, ten, mauNen, kichThuoc = 'vua' }: Props) {
  const [url, datUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!anhId) {
      datUrl(null)
      return
    }

    let conHieuLuc = true
    let urlDaTao: string | null = null

    void docAnh(anhId).then(
      (blob) => {
        if (!conHieuLuc || !blob) return
        urlDaTao = taoUrlAnh(blob)
        datUrl(urlDaTao)
      },
      () => {
        // Không đọc được ảnh thì rơi về hình thay thế, không làm vỡ giao diện.
        if (conHieuLuc) datUrl(null)
      },
    )

    return () => {
      conHieuLuc = false
      if (urlDaTao) giaiPhongUrl(urlDaTao)
    }
  }, [anhId])

  const co = CO_CHU[kichThuoc]

  if (url) {
    return (
      <img
        src={url}
        alt={ten}
        className={`${co} shrink-0 rounded-full object-cover`}
      />
    )
  }

  const { nen, chu } = nenDamBaoTuongPhan(mauNen)

  return (
    <div
      aria-hidden="true"
      title={ten}
      className={`${co} flex shrink-0 items-center justify-center rounded-full font-semibold`}
      style={{ backgroundColor: nen, color: chu }}
    >
      {chuCaiDau(ten)}
    </div>
  )
}
