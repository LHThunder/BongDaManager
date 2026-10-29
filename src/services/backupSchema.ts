import { z } from 'zod'
import type { TranDaLuu } from '../storage/db'
import { ATTRIBUTES, GK_ATTRIBUTES } from '../domain/attributes'
import { FORMATIONS } from '../domain/formations'
import {
  CHI_THI,
  THU_TU_CHI_THI,
  type ChiThiId,
} from '../domain/instructions'
import { kiemTraToHopViTri, POSITIONS } from '../domain/positions'
import { ROLES, vaiTroApDungDuoc, type RoleId } from '../domain/roles'
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

/** v1: ảnh nhúng base64 ngay trong JSON. */
const AnhV1 = z.object({
  id: z.string().min(1),
  mime: z.string().startsWith('image/'),
  data: z.string().min(1),
})

/** v2: ảnh nằm ngoài JSON, manifest chỉ trỏ tới mục trong tệp ZIP. */
const AnhV2 = z.object({
  id: z.string().min(1),
  mime: z.string().startsWith('image/'),
  duongDan: z.string().min(1),
})

/** v3: đội mang thêm bộ chiến thuật đang dùng. */
const DoiV3 = Doi.extend({
  activeTacticId: z.string().min(1).nullable(),
})

const ID_SO_DO = FORMATIONS.map((s) => s.id)
const ID_VAI_TRO = ROLES.map((v) => v.id)

const MucCuaChiThi = Object.fromEntries(
  THU_TU_CHI_THI.map((id) => [
    id,
    z.enum(
      CHI_THI[id].cacMuc.map((m) => m.muc as string) as [string, ...string[]],
    ),
  ]),
) as Record<ChiThiId, z.ZodEnum<[string, ...string[]]>>

const ChiThi = z.object(MucCuaChiThi)

const OChienThuat = z.object({
  slotId: z.string().min(1),
  playerId: z.string().min(1).nullable(),
  roleId: z.enum(ID_VAI_TRO as [string, ...string[]]),
})

const ChienThuat = z.object({
  id: z.string().min(1),
  teamId: z.string().min(1),
  ten: z.string().min(1).nullable(),
  formationId: z.enum(ID_SO_DO as [string, ...string[]]),
  oVien: z.array(OChienThuat),
  chiThi: ChiThi,
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
})

const PHAN_CHUNG = {
  exportedAt: z.string().min(1),
  teams: z.array(Doi),
  players: z.array(CauThu),
}

const ThanTepV1 = z.object({
  schemaVersion: z.literal(1),
  ...PHAN_CHUNG,
  images: z.array(AnhV1),
})

const ThanTepV2 = z.object({
  schemaVersion: z.literal(2),
  ...PHAN_CHUNG,
  images: z.array(AnhV2),
})

const ThanTepV3 = z.object({
  schemaVersion: z.literal(3),
  exportedAt: z.string().min(1),
  teams: z.array(DoiV3),
  players: z.array(CauThu),
  images: z.array(AnhV2),
  tactics: z.array(ChienThuat),
})


/*
  Lịch sử trận đấu trong tệp sao lưu (AC-11.7, quyết định D48).

  MỨC KIỂM: phần tóm tắt — thứ mà trang lịch sử đọc để vẽ danh sách — được
  kiểm CHẶT; phần nặng (đội hình, can thiệp, dòng sự kiện, báo cáo) chỉ kiểm
  đúng những trường mà giao diện thật sự đọc tới.

  Vì sao không kiểm sâu tới từng trường: bản ghi trận ôm gần như toàn bộ kiểu
  của engine, nên một schema zod đầy đủ sẽ là bản sao thứ hai của chúng — và
  hai bản sao sẽ có ngày lệch nhau. Đổi lại, mọi trường mà giao diện đọc đều
  được kiểm, nên một tệp hỏng không thể làm trang lịch sử vỡ.
*/
const AnhChupDoiSchema = z.object({
  teamId: z.string().min(1),
  ten: z.string(),
  mauChinh: z.string().min(1),
  mauPhu: z.string().min(1),
  logoImageId: z.string().min(1).nullable(),
})

const SuKienDaLuu = z
  .object({
    phut: z.number().int().nonnegative(),
    buGio: z.boolean(),
    loai: z.string().min(1),
    doi: z.enum(['nha', 'khach']),
    cacCauThu: z.array(z.string()),
    mauCau: z.number().int().nonnegative(),
  })
  .passthrough()

const ThanhPhanDiemDaLuu = z.object({
  tieuChi: z.string().min(1),
  soLieu: z.number(),
  diemCong: z.number(),
})

const BaoCaoDaLuu = z
  .object({
    tiSo: z.object({
      nha: z.number().int().nonnegative(),
      khach: z.number().int().nonnegative(),
    }),
    nguoiGhiBan: z.array(
      z.object({
        doi: z.enum(['nha', 'khach']),
        playerId: z.string().min(1),
        phut: z.number().int().nonnegative(),
        buGio: z.boolean(),
      }),
    ),
    theoBen: z.record(z.string(), z.record(z.string(), z.number())),
    diemCauThu: z.array(
      z
        .object({
          doi: z.enum(['nha', 'khach']),
          playerId: z.string().min(1),
          viTriDaDa: z.string().min(1),
          diem: z.number(),
          cacThanhPhan: z.array(ThanhPhanDiemDaLuu),
          phutVao: z.number().int().nonnegative().nullable(),
          phutRa: z.number().int().nonnegative().nullable(),
        })
        .passthrough(),
    ),
  })
  .passthrough()

const BenDaLuuSchema = z
  .object({
    teamId: z.string().min(1),
    trenSan: z.array(z.string()),
    duBi: z.array(z.string()),
  })
  .passthrough()

const TranDaLuuSchema = z
  .object({
    id: z.string().min(1),
    maTran: z.string().min(1),
    phienBanEngine: z.number().int().positive(),
    ketThucLuc: z.number().int().nonnegative(),
    tiSo: z.object({
      nha: z.number().int().nonnegative(),
      khach: z.number().int().nonnegative(),
    }),
    doiChuNha: AnhChupDoiSchema,
    doiKhach: AnhChupDoiSchema,
    sanTrungLap: z.boolean(),
    doiCuaNguoiDung: z.enum(['nha', 'khach']),
    nha: BenDaLuuSchema,
    khach: BenDaLuuSchema,
    canThiep: z.array(z.unknown()),
    cacSuKien: z.array(SuKienDaLuu),
    baoCao: BaoCaoDaLuu,
  })
  .passthrough()

const ThanTepV4 = z.object({
  schemaVersion: z.literal(4),
  exportedAt: z.string().min(1),
  teams: z.array(DoiV3),
  players: z.array(CauThu),
  images: z.array(AnhV2),
  tactics: z.array(ChienThuat),
  matches: z.array(TranDaLuuSchema),
})

export type TepSaoLuuV1 = z.infer<typeof ThanTepV1>
export type TepSaoLuuV2 = z.infer<typeof ThanTepV2>
export type TepSaoLuuV3 = z.infer<typeof ThanTepV3>
export type TepSaoLuuV4 = z.infer<typeof ThanTepV4>
/**
 * Hình dạng hiện tại mà phần còn lại của ứng dụng làm việc với.
 *
 * `matches` dùng thẳng kiểu `TranDaLuu` của lớp lưu trữ chứ không dùng kiểu
 * zod suy ra: schema zod ở trên là **cổng kiểm dữ liệu vào**, cố tình chỉ
 * kiểm tới mức giao diện cần, nên kiểu nó suy ra lỏng hơn kiểu thật. Phần
 * còn lại của ứng dụng phải làm việc với kiểu thật.
 */
export type ManifestHienTai = Omit<TepSaoLuuV4, 'matches'> & {
  readonly matches: readonly TranDaLuu[]
}

function idTrungLap(cacId: readonly string[]): string | null {
  const daThay = new Set<string>()
  for (const id of cacId) {
    if (daThay.has(id)) return id
    daThay.add(id)
  }
  return null
}

/**
 * Phần kiểm toàn vẹn tham chiếu, dùng chung cho mọi phiên bản: chỉ cần ảnh có
 * `id` là kiểm được, không phụ thuộc việc byte ảnh nằm ở đâu.
 */
function kiemToanVen(
  tep: {
    teams: TepSaoLuuV1['teams']
    players: TepSaoLuuV1['players']
    images: { id: string }[]
  },
  ctx: z.RefinementCtx,
): void {
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
}

/**
 * Phần kiểm riêng của v3: chiến thuật phải trỏ đúng chỗ.
 *
 * Một tệp "đúng hình dạng" mà có ô trỏ tới cầu thủ của đội khác, hay
 * `activeTacticId` trỏ vào bộ không tồn tại, thì sau khi nhập sẽ cho ra một
 * bộ chiến thuật `tacticRepo` từ chối nạp — tức là người dùng mất chiến
 * thuật dù tệp nhập "thành công". P3 không cho phép điều đó.
 */
/*
  Nhận kiểu CHUNG của v3 và v4 thay vì riêng v3: hai phiên bản khác nhau đúng
  một trường `matches`, mà phép kiểm này không đọc tới nó. Ép về `TepSaoLuuV3`
  thì `schemaVersion: 4` không khớp kiểu literal.
*/
type PhanChienThuatCanKiem = Omit<TepSaoLuuV3, 'schemaVersion'>

function kiemChienThuat(
  tep: PhanChienThuatCanKiem,
  ctx: z.RefinementCtx,
): void {
  const idDoi = new Set(tep.teams.map((d) => d.id))
  const doiCuaCauThu = new Map(tep.players.map((p) => [p.id, p.teamId]))
  const idChienThuat = new Set(tep.tactics.map((c) => c.id))

  const trung = idTrungLap(tep.tactics.map((c) => c.id))
  if (trung) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tactics'],
      message: `có hai bộ chiến thuật cùng id "${trung}"`,
    })
  }

  tep.tactics.forEach((bo, i) => {
    if (!idDoi.has(bo.teamId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tactics', i, 'teamId'],
        message: 'trỏ tới một đội không có trong tệp',
      })
      return
    }

    const soDo = FORMATIONS.find((s) => s.id === bo.formationId)
    if (!soDo) return

    const viTriTheoSlot = new Map(soDo.oVien.map((o) => [o.slotId, o.viTri]))
    if (bo.oVien.length !== soDo.oVien.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tactics', i, 'oVien'],
        message: `sơ đồ ${bo.formationId} cần ${soDo.oVien.length} ô, tệp có ${bo.oVien.length}`,
      })
      return
    }

    const daGap = new Set<string>()
    bo.oVien.forEach((o, j) => {
      const viTri = viTriTheoSlot.get(o.slotId)
      if (viTri === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tactics', i, 'oVien', j, 'slotId'],
          message: `không phải ô của sơ đồ ${bo.formationId}`,
        })
        return
      }

      if (!vaiTroApDungDuoc(o.roleId as RoleId, viTri)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tactics', i, 'oVien', j, 'roleId'],
          message: 'vai trò không dùng được cho vị trí của ô',
        })
      }

      if (o.playerId === null) return

      if (doiCuaCauThu.get(o.playerId) !== bo.teamId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tactics', i, 'oVien', j, 'playerId'],
          message: 'cầu thủ không thuộc đội của bộ chiến thuật này',
        })
      }

      if (daGap.has(o.playerId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tactics', i, 'oVien', j, 'playerId'],
          message: 'một cầu thủ được xếp vào hai ô',
        })
      }
      daGap.add(o.playerId)
    })
  })

  tep.teams.forEach((doi, i) => {
    if (doi.activeTacticId === null) return
    if (!idChienThuat.has(doi.activeTacticId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['teams', i, 'activeTacticId'],
        message: 'trỏ tới một bộ chiến thuật không có trong tệp',
      })
      return
    }
    const bo = tep.tactics.find((c) => c.id === doi.activeTacticId)
    if (bo && bo.teamId !== doi.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['teams', i, 'activeTacticId'],
        message: 'trỏ tới bộ chiến thuật của đội khác',
      })
    }
  })
}

export const SchemaSaoLuuV1 = ThanTepV1.superRefine(kiemToanVen)
export const SchemaSaoLuuV2 = ThanTepV2.superRefine(kiemToanVen)
export const SchemaSaoLuuV3 = ThanTepV3.superRefine((tep, ctx) => {
  kiemToanVen(tep, ctx)
  kiemChienThuat(tep, ctx)
})
export const SchemaSaoLuuV4 = ThanTepV4.superRefine((tep, ctx) => {
  kiemToanVen(tep, ctx)
  kiemChienThuat(tep, ctx)
})

/**
 * Schema theo từng phiên bản. P7: thêm bản mới CẠNH bản cũ, không sửa bản cũ —
 * schema v1 phải giữ nguyên để tệp đã phát hành còn nhập được.
 */
export const SCHEMA_THEO_PHIEN_BAN = {
  1: SchemaSaoLuuV1,
  2: SchemaSaoLuuV2,
  3: SchemaSaoLuuV3,
  4: SchemaSaoLuuV4,
} as const

export type PhienBanTep = keyof typeof SCHEMA_THEO_PHIEN_BAN

/** Đường dẫn tới trường sai, dạng người đọc được, cho thông báo ở AC-4.5. */
export function duongDanLoi(loi: z.ZodError): string {
  const dau = loi.issues[0]
  if (!dau) return ''
  return dau.path.length > 0 ? dau.path.join('.') : ''
}
