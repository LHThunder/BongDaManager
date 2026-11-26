import { describe, expect, it } from 'vitest'

/*
  Lưới DUY NHẤT của R54 (T718 của spec 007).

  R54: từ spec 007 trở đi tồn tại HAI bảng thống kê cho cùng một đội, mãi mãi.
  Chúng chỉ còn so được với nhau — tức AC-45.3 chỉ còn nghĩa — **nếu** hai chế
  độ dùng chung một mô hình xác suất. Phép bóc T701 và T719 làm điều đó bằng
  cấu trúc; phép kiểm này canh để không ai lặng lẽ phá nó bằng cách viết lại mô
  hình trong `lienTuc/`.

  NĂM CÁI TÊN BỊ CẤM là năm cửa vào của mô hình xác suất v6. Một file trong
  `lienTuc/` nhắc chúng nghĩa là nó đang tự quyết kết cục thay vì đi qua
  `quyetKetCucChuoi`.

  ⚠️ CẤM TRONG MÃ, KHÔNG CẤM TRONG CHÚ THÍCH — và đây là một chỗ `plan.md` mục
  7 bị sửa, 2026-11-23. Plan viết "kể cả trong chú thích". Nhưng chú thích
  không chạy, còn một chú thích giải thích VÌ SAO một quyết định được chốt là
  thứ làm code đọc được: `hatGiong.ts` phải dẫn `nguoiTaiVung` để nói vì sao
  dòng kết cục KHÔNG có dải rút cố định (nó `return null` trước `rng.next()`,
  nên số rút mỗi pha không phải hằng — lý do loại (c) của D118). Cấm cả chú
  thích là buộc xoá đúng cái lý lẽ ấy, nên lệnh cấm thu về đúng phần có hiệu
  lực: **mã**. Repo đã có tiền lệ cho cách này — `rng.test.ts` dùng `chiCode()`
  để bóc chú thích trước khi quét.

  ⚠️ PHÉP KIỂM TỰ MIỄN CHÍNH NÓ. File này nằm trong `lienTuc/` và **buộc phải**
  chứa năm cái tên ấy để mà quét, nên nó bỏ qua đúng đường dẫn của mình. Tiền
  lệ: `boundaries.test.ts` dùng `laFileTest()` cho đúng việc này.
*/

const NGUON = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Năm cửa vào của mô hình xác suất v6. */
const TEN_BI_CAM = [
  'chayChuoiBong',
  'xacSuatTrungDich',
  'xacSuatBiCuu',
  'xacSuatCoHoiRoRang',
  'nguoiTaiVung',
] as const

/** Chính file này — nó phải chứa năm cái tên để mà quét. */
const TU_MIEN = './khongChepModel.test.ts'

/** Bóc chú thích khối và chú thích dòng, đúng khuôn `chiCode` của `rng.test.ts`. */
function chiCode(nguon: string): string {
  return nguon.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

describe('không chép mô hình xác suất vào lienTuc/ (R54, T718)', () => {
  it('đọc được source của mọi file trong lienTuc/', () => {
    const duongDan = Object.keys(NGUON)
    expect(duongDan.length, 'không đọc được file nào').toBeGreaterThan(5)
    expect(duongDan).toContain('./hatGiong.ts')
    expect(duongDan).toContain('./tranLienTuc.ts')
  })

  it('và glob TỰ LOẠI chính file này — nên lệnh cấm không tự cắn nó', () => {
    /*
      Đo được, không phải đoán: `import.meta.glob` của Vite **không** trả về
      module đang gọi nó. Vì thế cái bẫy "phép kiểm quét chính nó rồi đỏ ngay
      lúc sinh ra" KHÔNG tồn tại ở cơ chế này — khác `boundaries.test.ts`, nơi
      glob chạy từ một file khác nên nó phải tự lọc bằng `laFileTest()`.

      Dòng `if (duongDan === TU_MIEN) continue` ở phép kiểm dưới vì thế là lớp
      đệm, không phải thứ đang gánh. Giữ nó để nếu một ngày Vite đổi hành vi
      thì phép kiểm này đỏ ở ĐÂY — chỗ nói rõ lý do — chứ không đỏ ở chỗ kia.
    */
    expect(Object.keys(NGUON)).not.toContain(TU_MIEN)
  })

  it('không file nào trong lienTuc/ nhắc năm cái tên ấy TRONG MÃ', () => {
    for (const [duongDan, nguon] of Object.entries(NGUON)) {
      if (duongDan === TU_MIEN) continue
      const code = chiCode(nguon)
      for (const ten of TEN_BI_CAM) {
        expect(
          code.includes(ten),
          `${duongDan} nhắc \`${ten}\` trong mã — mô hình xác suất chỉ được vào qua quyetKetCucChuoi`,
        ).toBe(false)
      }
    }
  })

  /*
    Ca NGƯỢC: chứng minh phép kiểm trên đỏ được. Không có ca này thì một lỗi
    trong `chiCode` hay trong đường dẫn tự miễn sẽ làm phép kiểm xanh vĩnh viễn
    — đúng họ lỗi "rỗng là thoả" mà spec này đã gặp ba lần.
  */
  it('và phép kiểm ấy ĐỎ được — thử trên một chuỗi giả', () => {
    const giaViPham = 'const x = nguoiTaiVung(a, b, c, false, rng)\n'
    expect(chiCode(giaViPham).includes('nguoiTaiVung')).toBe(true)

    const giaChuThich = '/* nói về nguoiTaiVung */\nconst x = 1\n'
    expect(chiCode(giaChuThich).includes('nguoiTaiVung')).toBe(false)

    const giaChuThichDong = '// nói về xacSuatBiCuu\nconst x = 1\n'
    expect(chiCode(giaChuThichDong).includes('xacSuatBiCuu')).toBe(false)
  })

  it('năm cái tên ấy có thật trong engine gốc, không phải năm chuỗi chết', () => {
    /*
      Nếu ai đổi tên một hàm của mô hình mà quên sửa danh sách này, lệnh cấm sẽ
      canh một cái tên không còn tồn tại và `lienTuc/` được tự do chép hàm mới.
    */
    const goc = import.meta.glob('../*.ts', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>
    const tatCa = Object.values(goc).join('\n')
    for (const ten of TEN_BI_CAM) {
      expect(
        tatCa.includes(`function ${ten}`),
        `\`${ten}\` không còn là một hàm của engine gốc — sửa danh sách TEN_BI_CAM`,
      ).toBe(true)
    }
  })
})
