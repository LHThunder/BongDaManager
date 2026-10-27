import { z } from 'zod'
import { ATTRIBUTES, GK_ATTRIBUTES } from '../domain/attributes'
import { kiemTraToHopViTri, POSITIONS } from '../domain/positions'
import type { PositionId } from '../domain/types'
import { CHI_SO_MAX, CHI_SO_MIN } from '../domain/types'

/*
  Hình dạng của tệp sao lưu, theo từng phiên bản dữ liệu.

  Mỗi lần `SCHEMA_VERSION` tăng thì THÊM một schema mới cạnh schema cũ, không
  sửa schema cũ — nguyên tắc P7: tệp xuất từ bản trước vẫn phải nhập lại được.

  Ngoài việc kiểm hình dạng, schema còn kiểm tính toàn vẹn tham chiếu: cầu thủ
  trỏ tới đội có thật, ảnh có thật, không trùng id, không trùng số áo trong
  cùng đội. Nếu bỏ qua những việc đó thì một tệp "đúng hình dạng" vẫn có thể
  làm hỏng dữ liệu sau khi nhập, mà P3 cấm điều đó.
*/

const VI_TRI_HOP_LE = new Set<string>(POSITIONS.map((p) => p.id))
const CHI_SO_HOP_LE = new Set<string>(ATTRIBUTES.map((a) => a.id))
const CHI_SO_THU_MON_HOP_LE = new Set<string>(GK_ATTRIBUTES.map((a) => a.id))

const MauHex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'phải là mã màu dạng #RRGGBB')

const GiaTriChiSo = z
  .number()
  .int()
  .min(CHI_SO_MIN)
  .max(CHI_SO_MAX)

const BangChiSo = z.record(z.string(), GiaTriChiSo)

const Doi = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logoImageId: z.string().min(1).nullable(),
  primaryColor: MauHex,
  secondaryColor: MauHex,
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
})

const CauThu = z.object({
  id: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  shirtNumber: z.number().int(),
  age: z.number().int(),
  preferredFoot: z.enum(['trai', 'phai', 'ca-hai']),
  positions: z.array(z.string()).min(1),
  attributes: BangChiSo,
  gkAttributes: BangChiSo.nullable(),
  portraitImageId: z.string().min(1).nullable(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
})

const Anh = z.object({
  id: z.string().min(1),
  mime: z.string().startsWith('image/'),
  data: z.string().min(1),
})

const ThanTepV1 = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string().min(1),
  teams: z.array(Doi),
  players: z.array(CauThu),
  images: z.array(Anh),
})

export type TepSaoLuuV1 = z.infer<typeof ThanTepV1>

function idTrungLap(cacId: readonly string[]): string | null {
  const daThay = new Set<string>()
  for (const id of cacId) {
    if (daThay.has(id)) return id
    daThay.add(id)
  }
  return null
}

export const SchemaSaoLuuV1 = ThanTepV1.superRefine((tep, ctx) => {
  const idDoi = new Set(tep.teams.map((d) => d.id))
  const idAnh = new Set(tep.images.map((a) => a.id))

  const doiTrung = idTrungLap(tep.teams.map((d) => d.id))
  if (doiTrung) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['teams'],
      message: `có hai đội cùng id "${doiTrung}"`,
    })
  }

  const cauThuTrung = idTrungLap(tep.players.map((p) => p.id))
  if (cauThuTrung) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['players'],
      message: `có hai cầu thủ cùng id "${cauThuTrung}"`,
    })
  }

  const anhTrung = idTrungLap(tep.images.map((a) => a.id))
  if (anhTrung) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['images'],
      message: `có hai ảnh cùng id "${anhTrung}"`,
    })
  }

  tep.teams.forEach((doi, i) => {
    if (doi.logoImageId !== null && !idAnh.has(doi.logoImageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['teams', i, 'logoImageId'],
        message: 'trỏ tới một ảnh không có trong tệp',
      })
    }
  })

  const soAoDaDung = new Set<string>()

  tep.players.forEach((cauThu, i) => {
    if (!idDoi.has(cauThu.teamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['players', i, 'teamId'],
        message: 'trỏ tới một đội không có trong tệp',
      })
    }

    const viTriLa = cauThu.positions.filter((v) => !VI_TRI_HOP_LE.has(v))
    if (viTriLa.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['players', i, 'positions'],
        message: `vị trí không hợp lệ: ${viTriLa.join(', ')}`,
      })
    } else {
      const toHop = kiemTraToHopViTri(cauThu.positions as PositionId[])
      if (!toHop.hopLe) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['players', i, 'positions'],
          message: `tổ hợp vị trí không hợp lệ: ${toHop.loi}`,
        })
      }
    }

    for (const khoa of Object.keys(cauThu.attributes)) {
      if (!CHI_SO_HOP_LE.has(khoa)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['players', i, 'attributes', khoa],
          message: 'không phải một chỉ số hợp lệ',
        })
      }
    }

    for (const khoa of Object.keys(cauThu.gkAttributes ?? {})) {
      if (!CHI_SO_THU_MON_HOP_LE.has(khoa)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['players', i, 'gkAttributes', khoa],
          message: 'không phải một chỉ số thủ môn hợp lệ',
        })
      }
    }

    if (
      cauThu.portraitImageId !== null &&
      !idAnh.has(cauThu.portraitImageId)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['players', i, 'portraitImageId'],
        message: 'trỏ tới một ảnh không có trong tệp',
      })
    }

    const khoaSoAo = `${cauThu.teamId}#${cauThu.shirtNumber}`
    if (soAoDaDung.has(khoaSoAo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['players', i, 'shirtNumber'],
        message: `số áo ${cauThu.shirtNumber} bị dùng hai lần trong cùng đội`,
      })
    }
    soAoDaDung.add(khoaSoAo)
  })
})

/** Schema theo từng phiên bản; `/plan` P7 nói thêm bản mới cạnh bản cũ. */
export const SCHEMA_THEO_PHIEN_BAN = {
  1: SchemaSaoLuuV1,
} as const

/** Đường dẫn tới trường sai, dạng người đọc được, cho thông báo ở AC-4.5. */
export function duongDanLoi(loi: z.ZodError): string {
  const dau = loi.issues[0]
  if (!dau) return ''
  return dau.path.length > 0 ? dau.path.join('.') : ''
}
