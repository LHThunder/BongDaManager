import { describe, expect, it } from 'vitest'
import { cauHinhMau } from './__fixtures__/doiMau'
import type { SuKien } from './suKien'
import { chayHetTran, dongSuKien, PHIEN_BAN_ENGINE, taoTran } from './tran'

/*
  BẢNG MỐC CỦA ENGINE: engine có còn phát lại đúng những gì nó đã từng phát
  không (T223).

  Đây là CỔNG QUYẾT ĐỊNH, không phải một phép kiểm tính năng. Mỗi dòng được
  rút gọn thành:
    phút | bù giờ | loại | đội | cầu thủ | mẫu câu | tỉ số sau đó
  Bảy trường này là TOÀN BỘ thứ người dùng đọc được trên một dòng tường thuật,
  nên hai dòng trùng nhau ở cả bảy là hai dòng không phân biệt được.

  === BẢNG NÀY ĐÃ ĐƯỢC SINH LẠI MỘT LẦN, NGÀY 2026-11-22 ===

  Từ spec 001 tới spec 006, bảng này giữ **409 dòng của engine v5** và nhiệm vụ
  của nó là chứng minh engine KHÔNG đổi: spec 002 sửa engine ở nhiều chỗ, và
  bảng này là thứ cho phép `PHIEN_BAN_ENGINE` giữ nguyên 5 qua năm spec liên
  tiếp. Câu "tăng thừa không phải là cẩn thận" ở `tran.ts` nói về đúng việc ấy.

  Ngày 2026-11-22, người dùng chốt **sửa phễu dứt điểm** — một thay đổi CỐ Ý
  của mô hình xác suất, không phải một tai nạn. Đo được trước khi sửa: engine
  cho **3,95 bàn một trận** so với 2,82–3,28 của giải Ngoại hạng Anh, và **70%**
  số cú sút đi trúng đích so với **49%** thật. Nguyên nhân: mô hình cũ không có
  tầng "đi đúng hướng", nên một cú sút chỉ có thể thành bàn hoặc bị cứu.

  Sửa phễu làm đổi cả thứ tự rút lẫn kết quả, nên `PHIEN_BAN_ENGINE` lên **6**
  và bảng này được sinh lại — **393 dòng**. Người dùng biết và chấp nhận cái
  giá trước khi tôi sửa: **20 trận đã lưu mất nút "đấu lại"**, tuy vẫn xem lại
  được vì bản ghi lưu sẵn dòng sự kiện.

  Bảng mới có đúng cùng nhiệm vụ với bảng cũ: đóng băng đầu ra của engine để
  lần đổi SAU phải là một quyết định, không phải một tai nạn.

  *(File này từng tên là `tuongThichV5.test.ts`. Các spec đã đóng vẫn gọi nó
  bằng tên cũ — đó là hồ sơ của lúc ấy, không sửa ngược.)*
*/

/** Dòng tường thuật rút gọn, đủ để so từng dòng một. */
function rutGon(sk: SuKien): string {
  return [
    sk.phut,
    sk.buGio ? 'b' : '-',
    sk.loai,
    sk.doi,
    sk.cacCauThu.join('+'),
    sk.mauCau,
    `${sk.tiSoSauDo.nha}-${sk.tiSoSauDo.khach}`,
  ].join('|')
}

/** Mốc đã chốt của engine v5, một dòng một phần tử. */
const MOC_V6: Readonly<Record<string, string>> = {
  K7M2R9XQ4B: `
    0|-|bat-dau|nha||685|0-0
    3|-|cuop-bong-cao|nha|A-6+B-2|124|0-0
    4|-|cuop-bong-cao|khach|B-3+A-9|200|0-0
    5|-|cuop-bong-cao|nha|A-7+B-3|647|0-0
    6|-|pham-loi|nha|A-4+B-7|116|0-0
    7|-|co-hoi|nha|A-6|189|0-0
    8|-|cuop-bong-cao|khach|B-3+A-6|967|0-0
    10|-|pham-loi|nha|A-4+B-9|494|0-0
    12|-|ban-thang|nha|A-9+A-7|749|1-0
    12|-|cuop-bong-cao|khach|B-4+A-7|832|1-0
    14|-|pham-loi|nha|A-2+B-10|887|1-0
    17|-|pham-loi|khach|B-9+A-9|733|1-0
    18|-|pham-loi|nha|A-8+B-3|364|1-0
    19|-|pham-loi|khach|B-9+A-5|252|1-0
    20|-|pham-loi|khach|B-7+A-8|740|1-0
    22|-|cuop-bong-cao|khach|B-5+A-8|451|1-0
    24|-|pham-loi|khach|B-5+A-7|911|1-0
    25|-|pham-loi|nha|A-6+B-11|768|1-0
    26|-|ban-thang|khach|B-7+B-6|191|1-1
    27|-|cuop-bong-cao|nha|A-11+B-1|756|1-1
    28|-|pham-loi|khach|B-11+A-4|415|1-1
    29|-|co-hoi|khach|B-11|899|1-1
    30|-|pham-loi|nha|A-11+B-1|994|1-1
    31|-|the-vang|nha|A-5|786|1-1
    31|-|pham-loi|khach|B-1+A-5|922|1-1
    32|-|pham-loi|nha|A-4+B-9|838|1-1
    34|-|cuop-bong-cao|khach|B-6+A-3|251|1-1
    35|-|pham-loi|khach|B-10+A-4|289|1-1
    36|-|cuop-bong-cao|nha|A-5+B-3|971|1-1
    37|-|cuu-thua|nha|A-7+B-1|205|1-1
    38|-|cuop-bong-cao|nha|A-7+B-2|609|1-1
    39|-|tat-canh|khach|B-6+A-8|6|1-1
    40|-|co-hoi|nha|A-11|101|1-1
    44|-|cuop-bong-cao|khach|B-1+A-6|593|1-1
    46|b|cuop-bong-cao|nha|A-7+B-7|87|1-1
    47|b|pham-loi|nha|A-5+B-11|778|1-1
    47|b|het-hiep|nha||997|1-1
    46|-|cuop-bong-cao|khach|B-8+A-9|680|1-1
    48|-|cuop-bong-cao|khach|B-3+A-3|522|1-1
    49|-|pham-loi|nha|A-2+B-9|419|1-1
    51|-|cuop-bong-cao|khach|B-6+A-5|166|1-1
    52|-|pham-loi|khach|B-2+A-3|584|1-1
    53|-|cuop-bong-cao|nha|A-3+B-3|66|1-1
    54|-|pham-loi|nha|A-3+B-3|385|1-1
    56|-|cuop-bong-cao|khach|B-5+A-7|13|1-1
    57|-|tat-canh|nha|A-5+B-6|651|1-1
    59|-|cuop-bong-cao|nha|A-1+B-7|530|1-1
    60|-|cuop-bong-cao|khach|B-4+A-1|871|1-1
    62|-|cuop-bong-cao|nha|A-8+B-7|405|1-1
    63|-|cuu-thua|khach|B-8+A-1|922|1-1
    65|-|pham-loi|nha|A-2+B-4|71|1-1
    67|-|cuop-bong-cao|nha|A-5+B-7|481|1-1
    68|-|pham-loi|nha|A-2+B-6|814|1-1
    69|-|cuu-thua|nha|A-10+B-1|699|1-1
    70|-|cuop-bong-cao|khach|B-7+A-3|440|1-1
    71|-|cuu-thua|khach|B-11+A-1|623|1-1
    72|-|cuop-bong-cao|khach|B-10+A-1|219|1-1
    73|-|the-vang|khach|B-10|411|1-1
    73|-|tat-canh|nha|A-3+B-10|963|1-1
    74|-|cuop-bong-cao|khach|B-6+A-5|328|1-1
    75|-|cuop-bong-cao|nha|A-4+B-8|723|1-1
    76|-|ban-thang|khach|B-11+B-7|978|1-2
    77|-|cuop-bong-cao|khach|B-6+A-5|981|1-2
    79|-|pham-loi|nha|A-6+B-3|465|1-2
    80|-|pham-loi|nha|A-8+B-10|12|1-2
    82|-|ban-thang|nha|A-10+A-9|228|2-2
    83|-|cuop-bong-cao|nha|A-3+B-7|935|2-2
    85|-|cuop-bong-cao|khach|B-1+A-9|853|2-2
    86|-|ban-thang|khach|B-6+B-7|779|2-3
    87|-|cuop-bong-cao|khach|B-11+A-5|433|2-3
    89|-|pham-loi|khach|B-8+A-7|327|2-3
    90|-|pham-loi|nha|A-9+B-1|181|2-3
    91|b|cuop-bong-cao|khach|B-7+A-9|82|2-3
    92|b|cuop-bong-cao|khach|B-6+A-7|333|2-3
    92|b|ket-thuc|nha||879|2-3
`,
  P3V8N1TZ6C: `
    0|-|bat-dau|nha||158|0-0
    3|-|the-vang|khach|B-2|620|0-0
    3|-|pham-loi|nha|A-7+B-3|419|0-0
    4|-|cuop-bong-cao|khach|B-1+A-7|439|0-0
    7|-|cuop-bong-cao|nha|A-9+B-3|201|0-0
    8|-|cuop-bong-cao|khach|B-3+A-7|214|0-0
    9|-|cuu-thua|nha|A-6+B-1|31|0-0
    10|-|cuop-bong-cao|nha|A-3+B-1|649|0-0
    11|-|cuu-thua|nha|A-7+B-1|404|0-0
    12|-|ban-thang|nha|A-9+A-8|925|1-0
    12|-|cuop-bong-cao|khach|B-1+A-7|218|1-0
    13|-|cuop-bong-cao|khach|B-5+A-1|129|1-0
    14|-|co-hoi|nha|A-6|23|1-0
    15|-|cuop-bong-cao|nha|A-3+B-1|971|1-0
    16|-|cuop-bong-cao|nha|A-4+B-5|466|1-0
    18|-|pham-loi|nha|A-4+B-3|318|1-0
    19|-|cuop-bong-cao|khach|B-6+A-4|638|1-0
    20|-|cuop-bong-cao|nha|A-8+B-1|972|1-0
    21|-|the-do|khach|B-2|486|1-0
    21|-|pham-loi|nha|A-3+B-11|806|1-0
    24|-|cuop-bong-cao|nha|A-4+B-1|986|1-0
    25|-|ban-thang|nha|A-8+A-11|859|2-0
    26|-|cuop-bong-cao|khach|B-6+A-8|444|2-0
    27|-|cuop-bong-cao|khach|B-7+A-6|630|2-0
    31|-|cuop-bong-cao|nha|A-5+B-3|752|2-0
    32|-|pham-loi|nha|A-4+B-7|875|2-0
    33|-|ban-thang|khach|B-8+B-10|976|2-1
    34|-|cuop-bong-cao|khach|B-8+A-1|940|2-1
    37|-|cuop-bong-cao|nha|A-1+B-5|460|2-1
    38|-|cuop-bong-cao|nha|A-3+B-4|112|2-1
    42|-|cuop-bong-cao|nha|A-7+B-3|646|2-1
    43|-|the-do|nha|A-7|270|2-1
    43|-|pham-loi|khach|B-4+A-7|168|2-1
    45|-|cuop-bong-cao|nha|A-1+B-1|149|2-1
    46|b|cuop-bong-cao|nha|A-8+B-6|846|2-1
    47|b|cuop-bong-cao|nha|A-2+B-3|396|2-1
    48|b|ban-thang|nha|A-10+A-8|207|3-1
    49|b|cuop-bong-cao|nha|A-2+B-4|78|3-1
    50|b|cuop-bong-cao|khach|B-10+A-4|495|3-1
    50|b|het-hiep|nha||869|3-1
    46|-|co-hoi|nha|A-11|274|3-1
    47|-|cuop-bong-cao|khach|B-8+A-5|465|3-1
    48|-|co-hoi|khach|B-9|530|3-1
    50|-|co-hoi|khach|B-11|736|3-1
    52|-|cuop-bong-cao|nha|A-8+B-5|83|3-1
    53|-|pham-loi|nha|A-3+B-8|865|3-1
    54|-|ban-thang|khach|B-9+B-10|31|3-2
    55|-|cuop-bong-cao|khach|B-9+A-5|11|3-2
    56|-|co-hoi|khach|B-7|958|3-2
    57|-|cuop-bong-cao|nha|A-8+B-5|599|3-2
    58|-|pham-loi|khach|B-5+A-11|157|3-2
    59|-|pham-loi|khach|B-7+A-6|192|3-2
    62|-|cuu-thua|khach|B-9+A-1|538|3-2
    63|-|cuop-bong-cao|khach|B-6+A-6|823|3-2
    64|-|cuop-bong-cao|khach|B-7+A-9|582|3-2
    65|-|cuop-bong-cao|nha|A-3+B-5|867|3-2
    66|-|cuop-bong-cao|khach|B-6+A-1|722|3-2
    68|-|pham-loi|nha|A-4+B-10|344|3-2
    69|-|pham-loi|nha|A-9+B-6|603|3-2
    70|-|cuop-bong-cao|nha|A-8+B-6|607|3-2
    71|-|pham-loi|nha|A-4+B-9|200|3-2
    73|-|cuop-bong-cao|nha|A-2+B-7|329|3-2
    74|-|cuop-bong-cao|khach|B-6+A-8|412|3-2
    77|-|the-vang|nha|A-11|664|3-2
    77|-|pham-loi|khach|B-8+A-2|178|3-2
    78|-|cuop-bong-cao|nha|A-8+B-1|973|3-2
    79|-|co-hoi|nha|A-9|180|3-2
    81|-|cuop-bong-cao|nha|A-8+B-3|324|3-2
    83|-|cuop-bong-cao|nha|A-1+B-9|226|3-2
    84|-|pham-loi|nha|A-8+B-1|106|3-2
    86|-|pham-loi|khach|B-5+A-9|162|3-2
    87|-|pham-loi|nha|A-4+B-6|497|3-2
    88|-|cuu-thua|khach|B-11+A-1|252|3-2
    89|-|cuu-thua|khach|B-11+A-1|171|3-2
    90|-|cuop-bong-cao|khach|B-3+A-3|995|3-2
    91|b|the-vang|khach|B-4|752|3-2
    91|b|pham-loi|nha|A-6+B-4|280|3-2
    92|b|cuop-bong-cao|khach|B-4+A-1|93|3-2
    93|b|cuop-bong-cao|khach|B-8+A-5|855|3-2
    94|b|pham-loi|khach|B-7+A-3|136|3-2
    94|b|ket-thuc|nha||838|3-2
`,
  W5H4J2YD9F: `
    0|-|bat-dau|nha||805|0-0
    2|-|the-vang|nha|A-11|341|0-0
    2|-|cuop-bong-cao|khach|B-7+A-8|141|0-0
    3|-|the-vang|khach|B-6|253|0-0
    3|-|ban-thang|khach|B-6+B-11|366|0-1
    3|-|pham-loi|nha|A-3+B-6|150|0-0
    5|-|cuu-thua|nha|A-10+B-1|926|0-1
    6|-|pham-loi|khach|B-5+A-8|579|0-1
    7|-|pham-loi|nha|A-3+B-11|379|0-1
    8|-|cuop-bong-cao|khach|B-10+A-1|94|0-1
    9|-|the-vang|nha|A-5|27|0-1
    9|-|pham-loi|khach|B-6+A-5|243|0-1
    12|-|cuop-bong-cao|khach|B-5+A-2|348|0-1
    14|-|cuop-bong-cao|khach|B-7+A-5|379|0-1
    16|-|cuu-thua|nha|A-8+B-1|170|0-1
    17|-|cuop-bong-cao|nha|A-9+B-3|359|0-1
    18|-|cuu-thua|nha|A-6+B-1|63|0-1
    20|-|cuop-bong-cao|nha|A-8+B-1|330|0-1
    21|-|tat-canh|khach|B-7+A-4|887|0-1
    22|-|pham-loi|nha|A-10+B-3|706|0-1
    25|-|co-hoi|nha|A-6|85|0-1
    26|-|pham-loi|nha|A-8+B-4|29|0-1
    28|-|pham-loi|khach|B-9+A-8|16|0-1
    31|-|cuu-thua|khach|B-7+A-1|656|0-1
    32|-|cuop-bong-cao|nha|A-7+B-1|300|0-1
    33|-|co-hoi|khach|B-7|69|0-1
    34|-|pham-loi|nha|A-8+B-8|693|0-1
    35|-|pham-loi|khach|B-8+A-4|119|0-1
    36|-|cuu-thua|nha|A-10+B-1|876|0-1
    37|-|cuu-thua|nha|A-11+B-1|966|0-1
    38|-|cuop-bong-cao|khach|B-2+A-4|70|0-1
    39|-|cuop-bong-cao|khach|B-2+A-5|826|0-1
    40|-|cuop-bong-cao|khach|B-6+A-3|768|0-1
    41|-|cuop-bong-cao|khach|B-3+A-9|525|0-1
    42|-|cuop-bong-cao|nha|A-2+B-4|540|0-1
    43|-|cuop-bong-cao|khach|B-8+A-6|690|0-1
    44|-|cuop-bong-cao|khach|B-5+A-1|403|0-1
    45|-|cuop-bong-cao|nha|A-2+B-3|452|0-1
    47|b|the-vang|nha|A-9|343|0-1
    47|b|cuop-bong-cao|nha|A-4+B-8|319|0-1
    47|b|het-hiep|nha||82|0-1
    46|-|cuop-bong-cao|nha|A-4+B-7|612|0-1
    47|-|cuop-bong-cao|khach|B-3+A-1|657|0-1
    48|-|cuop-bong-cao|nha|A-5+B-8|472|0-1
    49|-|tat-canh|nha|A-1+B-6|811|0-1
    51|-|co-hoi|khach|B-10|465|0-1
    52|-|cuu-thua|khach|B-10+A-1|115|0-1
    53|-|co-hoi|khach|B-11|898|0-1
    56|-|tat-canh|khach|B-10+A-1|344|0-1
    57|-|cuop-bong-cao|nha|A-1+B-4|547|0-1
    58|-|co-hoi|khach|B-7|363|0-1
    59|-|pham-loi|khach|B-1+A-10|865|0-1
    60|-|co-hoi|nha|A-8|676|0-1
    61|-|pham-loi|nha|A-7+B-9|311|0-1
    62|-|cuop-bong-cao|khach|B-6+A-1|285|0-1
    63|-|cuop-bong-cao|khach|B-2+A-3|921|0-1
    64|-|pham-loi|khach|B-4+A-7|816|0-1
    65|-|pham-loi|nha|A-7+B-4|536|0-1
    67|-|cuop-bong-cao|khach|B-10+A-3|237|0-1
    68|-|cuop-bong-cao|nha|A-6+B-4|394|0-1
    69|-|cuop-bong-cao|khach|B-3+A-2|47|0-1
    70|-|cuop-bong-cao|khach|B-1+A-3|586|0-1
    71|-|pham-loi|khach|B-9+A-6|180|0-1
    73|-|co-hoi|nha|A-6|594|0-1
    75|-|pham-loi|khach|B-11+A-2|498|0-1
    76|-|cuop-bong-cao|nha|A-7+B-4|927|0-1
    77|-|cuop-bong-cao|khach|B-1+A-9|841|0-1
    78|-|cuop-bong-cao|nha|A-3+B-4|250|0-1
    80|-|cuop-bong-cao|khach|B-5+A-4|136|0-1
    81|-|cuop-bong-cao|khach|B-10+A-1|70|0-1
    82|-|the-vang|khach|B-9|740|0-1
    82|-|tat-canh|nha|A-6+B-9|673|0-1
    83|-|pham-loi|nha|A-7+B-11|755|0-1
    84|-|cuop-bong-cao|nha|A-5+B-4|840|0-1
    85|-|cuop-bong-cao|khach|B-8+A-5|218|0-1
    86|-|cuop-bong-cao|khach|B-4+A-3|536|0-1
    89|-|the-vang|nha|A-2|512|0-1
    89|-|tat-canh|khach|B-2+A-2|715|0-1
    90|-|cuop-bong-cao|khach|B-1+A-3|867|0-1
    91|b|pham-loi|nha|A-7+B-7|250|0-1
    92|b|cuop-bong-cao|khach|B-8+A-8|791|0-1
    94|b|cuu-thua|nha|A-8+B-1|796|0-1
    95|b|co-hoi|nha|A-10|494|0-1
    95|b|ket-thuc|nha||726|0-1
`,
  R8K3M7QX2N: `
    0|-|bat-dau|nha||22|0-0
    1|-|pham-loi|nha|A-6+B-3|954|0-0
    3|-|pham-loi|khach|B-1+A-7|113|0-0
    5|-|pham-loi|nha|A-3+B-4|30|0-0
    6|-|cuu-thua|nha|A-11+B-1|942|0-0
    7|-|cuop-bong-cao|khach|B-2+A-7|236|0-0
    11|-|cuop-bong-cao|khach|B-4+A-9|369|0-0
    12|-|tat-canh|khach|B-8+A-11|334|0-0
    13|-|cuop-bong-cao|khach|B-7+A-6|799|0-0
    14|-|pham-loi|khach|B-3+A-8|721|0-0
    15|-|co-hoi|khach|B-9|616|0-0
    16|-|co-hoi|khach|B-8|431|0-0
    17|-|pham-loi|khach|B-8+A-6|259|0-0
    18|-|cuu-thua|nha|A-10+B-1|471|0-0
    19|-|cuop-bong-cao|nha|A-9+B-5|231|0-0
    20|-|tat-canh|nha|A-5+B-10|227|0-0
    21|-|co-hoi|nha|A-8|807|0-0
    22|-|co-hoi|khach|B-9|274|0-0
    23|-|cuu-thua|nha|A-7+B-1|118|0-0
    27|-|pham-loi|nha|A-4+B-4|570|0-0
    28|-|cuop-bong-cao|nha|A-6+B-3|648|0-0
    29|-|pham-loi|nha|A-3+B-9|594|0-0
    30|-|cuop-bong-cao|nha|A-8+B-1|651|0-0
    36|-|cuop-bong-cao|khach|B-7+A-3|646|0-0
    37|-|tat-canh|nha|A-3+B-5|330|0-0
    38|-|pham-loi|khach|B-9+A-10|63|0-0
    40|-|cuop-bong-cao|nha|A-6+B-1|289|0-0
    41|-|pham-loi|khach|B-6+A-2|497|0-0
    42|-|cuop-bong-cao|nha|A-2+B-8|811|0-0
    43|-|cuop-bong-cao|nha|A-7+B-3|930|0-0
    44|-|pham-loi|nha|A-3+B-7|463|0-0
    45|-|pham-loi|khach|B-4+A-8|974|0-0
    46|b|het-hiep|nha||138|0-0
    49|-|cuu-thua|nha|A-9+B-1|63|0-0
    50|-|pham-loi|nha|A-2+B-8|521|0-0
    52|-|tat-canh|khach|B-4+A-5|774|0-0
    53|-|cuop-bong-cao|khach|B-4+A-7|37|0-0
    55|-|cuop-bong-cao|khach|B-5+A-7|56|0-0
    56|-|pham-loi|nha|A-9+B-7|634|0-0
    57|-|pham-loi|nha|A-6+B-4|464|0-0
    58|-|cuop-bong-cao|nha|A-3+B-8|358|0-0
    59|-|pham-loi|nha|A-1+B-8|37|0-0
    61|-|the-vang|nha|A-3|754|0-0
    61|-|cuu-thua|khach|B-6+A-1|198|0-0
    62|-|pham-loi|khach|B-11+A-6|522|0-0
    63|-|ban-thang|khach|B-7+B-11|357|0-1
    64|-|tat-canh|khach|B-8+A-4|643|0-1
    65|-|pham-loi|nha|A-2+B-7|257|0-1
    66|-|pham-loi|nha|A-6+B-8|259|0-1
    67|-|pham-loi|khach|B-7+A-4|963|0-1
    68|-|cuop-bong-cao|khach|B-11+A-4|195|0-1
    69|-|cuop-bong-cao|khach|B-10+A-2|610|0-1
    70|-|the-vang|nha|A-7|889|0-1
    70|-|cuu-thua|nha|A-9+B-1|805|0-1
    71|-|cuop-bong-cao|nha|A-2+B-3|494|0-1
    72|-|cuop-bong-cao|nha|A-11+B-5|304|0-1
    73|-|the-vang|nha|A-6|568|0-1
    73|-|cuop-bong-cao|nha|A-7+B-7|593|0-1
    74|-|cuop-bong-cao|khach|B-4+A-7|924|0-1
    75|-|cuop-bong-cao|khach|B-5+A-8|520|0-1
    76|-|cuop-bong-cao|nha|A-7+B-4|14|0-1
    77|-|tat-canh|khach|B-2+A-6|127|0-1
    78|-|co-hoi|nha|A-8|90|0-1
    80|-|co-hoi|khach|B-6|624|0-1
    81|-|cuop-bong-cao|nha|A-8+B-1|694|0-1
    83|-|cuop-bong-cao|khach|B-9+A-4|752|0-1
    84|-|cuu-thua|khach|B-10+A-1|394|0-1
    85|-|ban-thang|nha|A-10+A-7|732|1-1
    86|-|pham-loi|khach|B-8+A-8|595|1-1
    87|-|pham-loi|khach|B-6+A-4|427|1-1
    93|b|cuop-bong-cao|nha|A-7+B-9|530|1-1
    94|b|cuop-bong-cao|nha|A-3+B-4|740|1-1
    94|b|ket-thuc|nha||905|1-1
`,
  T6B9V4CZ1P: `
    0|-|bat-dau|nha||346|0-0
    2|-|cuu-thua|khach|B-9+A-1|203|0-0
    3|-|pham-loi|nha|A-2+B-6|525|0-0
    4|-|the-vang|nha|A-10|97|0-0
    4|-|pham-loi|khach|B-3+A-10|675|0-0
    5|-|pham-loi|khach|B-8+A-2|286|0-0
    7|-|pham-loi|khach|B-3+A-10|962|0-0
    8|-|cuop-bong-cao|nha|A-6+B-1|486|0-0
    9|-|cuop-bong-cao|nha|A-2+B-6|740|0-0
    10|-|cuu-thua|nha|A-7+B-1|590|0-0
    11|-|cuop-bong-cao|khach|B-3+A-1|635|0-0
    12|-|cuop-bong-cao|nha|A-2+B-9|750|0-0
    13|-|cuop-bong-cao|nha|A-1+B-3|381|0-0
    14|-|cuu-thua|nha|A-7+B-1|161|0-0
    15|-|cuop-bong-cao|nha|A-4+B-6|167|0-0
    17|-|cuop-bong-cao|nha|A-8+B-2|434|0-0
    18|-|cuop-bong-cao|khach|B-6+A-5|407|0-0
    20|-|pham-loi|khach|B-1+A-6|671|0-0
    22|-|cuop-bong-cao|khach|B-4+A-4|302|0-0
    23|-|cuop-bong-cao|khach|B-7+A-3|242|0-0
    24|-|cuu-thua|nha|A-7+B-1|254|0-0
    25|-|pham-loi|khach|B-4+A-11|991|0-0
    26|-|the-vang|khach|B-8|82|0-0
    26|-|cuop-bong-cao|khach|B-7+A-4|884|0-0
    28|-|cuop-bong-cao|khach|B-7+A-5|400|0-0
    31|-|ban-thang|nha|A-7+A-8|563|1-0
    32|-|pham-loi|khach|B-5+A-6|300|1-0
    33|-|cuop-bong-cao|khach|B-10+A-4|740|1-0
    34|-|cuop-bong-cao|nha|A-7+B-2|267|1-0
    35|-|cuop-bong-cao|khach|B-7+A-3|357|1-0
    37|-|cuu-thua|khach|B-8+A-1|196|1-0
    38|-|pham-loi|khach|B-2+A-10|293|1-0
    39|-|cuop-bong-cao|nha|A-4+B-9|573|1-0
    40|-|tat-canh|khach|B-3+A-8|967|1-0
    41|-|cuop-bong-cao|nha|A-6+B-2|377|1-0
    43|-|ban-thang|nha|A-10+A-6|380|2-0
    43|-|cuu-thua|khach|B-8+A-1|60|2-0
    45|-|cuop-bong-cao|nha|A-4+B-1|797|2-0
    46|b|cuop-bong-cao|khach|B-9+A-8|213|2-0
    47|b|cuop-bong-cao|nha|A-9+B-7|68|2-0
    48|b|cuop-bong-cao|khach|B-4+A-9|362|2-0
    48|b|het-hiep|nha||649|2-0
    48|-|cuop-bong-cao|khach|B-8+A-6|704|2-0
    49|-|cuop-bong-cao|khach|B-5+A-1|539|2-0
    55|-|pham-loi|khach|B-4+A-7|187|2-0
    56|-|the-vang|khach|B-9|652|2-0
    56|-|pham-loi|nha|A-3+B-7|637|2-0
    57|-|cuop-bong-cao|khach|B-8+A-9|483|2-0
    58|-|cuop-bong-cao|nha|A-9+B-4|574|2-0
    60|-|pham-loi|khach|B-9+A-11|162|2-0
    61|-|cuop-bong-cao|nha|A-7+B-5|596|2-0
    62|-|cuop-bong-cao|khach|B-9+A-3|381|2-0
    63|-|cuop-bong-cao|khach|B-1+A-4|71|2-0
    64|-|cuop-bong-cao|khach|B-3+A-7|96|2-0
    66|-|pham-loi|khach|B-2+A-5|757|2-0
    68|-|the-vang|nha|A-8|32|2-0
    68|-|pham-loi|nha|A-1+B-9|716|2-0
    69|-|cuop-bong-cao|khach|B-10+A-3|674|2-0
    70|-|cuop-bong-cao|khach|B-3+A-1|281|2-0
    72|-|pham-loi|nha|A-9+B-9|732|2-0
    73|-|cuop-bong-cao|nha|A-7+B-3|205|2-0
    74|-|cuu-thua|nha|A-11+B-1|674|2-0
    75|-|cuop-bong-cao|khach|B-8+A-3|776|2-0
    76|-|cuop-bong-cao|nha|A-7+B-1|441|2-0
    78|-|tat-canh|nha|A-6+B-1|427|2-0
    79|-|cuop-bong-cao|nha|A-10+B-2|424|2-0
    80|-|pham-loi|nha|A-2+B-5|729|2-0
    82|-|cuop-bong-cao|nha|A-3+B-7|803|2-0
    83|-|pham-loi|nha|A-1+B-7|509|2-0
    84|-|pham-loi|nha|A-4+B-7|128|2-0
    85|-|pham-loi|khach|B-4+A-8|187|2-0
    87|-|pham-loi|nha|A-7+B-3|525|2-0
    88|-|cuop-bong-cao|nha|A-6+B-5|769|2-0
    90|-|cuop-bong-cao|khach|B-7+A-3|842|2-0
    91|b|cuu-thua|nha|A-7+B-1|219|2-0
    92|b|cuop-bong-cao|khach|B-7+A-1|679|2-0
    93|b|cuop-bong-cao|nha|A-3+B-6|567|2-0
    94|b|pham-loi|nha|A-8+B-3|252|2-0
    95|b|pham-loi|nha|A-2+B-11|227|2-0
    95|b|ket-thuc|nha||965|2-0
`,
}

function dongCuaMoc(ma: string): readonly string[] {
  return MOC_V6[ma]
    .split('\n')
    .map((d) => d.trim())
    .filter((d) => d !== '')
}

describe('engine phát lại đúng bảng mốc đã chốt (T223)', () => {
  it('mọi dòng tường thuật khớp từng ký tự với mốc đã chốt', () => {
    let tongKhop = 0
    let tongLech = 0
    const baoCao: string[] = []

    for (const ma of Object.keys(MOC_V6)) {
      const mong = dongCuaMoc(ma)
      const thuc = dongSuKien(chayHetTran(taoTran(cauHinhMau(ma)))).map(rutGon)

      let khop = 0
      const lech: string[] = []
      for (let i = 0; i < Math.max(mong.length, thuc.length); i += 1) {
        if (mong[i] === thuc[i]) khop += 1
        else lech.push(`      dòng ${i}: mốc ${mong[i] ?? "(trống)"} / nay ${thuc[i] ?? "(trống)"}`)
      }

      tongKhop += khop
      tongLech += lech.length
      baoCao.push(
        `  ${ma}: ${khop}/${mong.length} dòng khớp, ${lech.length} lệch`,
        ...lech.slice(0, 5),
      )
    }

    console.log(
      [`T223 — đối chiếu engine v5, quân số 11, 90 phút:`, ...baoCao].join("\n"),
    )

    expect(tongLech, `tổng ${tongKhop} dòng khớp, ${tongLech} dòng lệch`).toBe(0)
  })

  /*
    Phiên bản engine phải đi CÙNG kết luận của phép trên. Hai khẳng định
    nằm cạnh nhau trong một file để lần sau ai sửa engine mà làm đỏ phép
    trên thì thấy ngay con số nào phải tăng theo.
  */
  it('dòng sự kiện ĐÃ ĐỔI nên PHIEN_BAN_ENGINE là 6 (AC-16.3)', () => {
    expect(PHIEN_BAN_ENGINE).toBe(6)
  })
})

/*
  Lưới an toàn của spec 004 (T420, AC-25.4, AC-25.5).

  Spec 004 đặt một ràng buộc cứng: engine KHÔNG đổi. Rủi ro R33 — ai đó sửa
  engine để chiều một tính năng giao diện — là rủi ro có hậu quả cao nhất của
  spec, vì đổi `PHIEN_BAN_ENGINE` là mọi trận đã lưu mất nút đấu lại.

  Khối mốc phía trên đã là lưới cho AC-25.4: một trận dựng từ cấu hình cố
  định phải cho đúng từng dòng của bảng đã đóng băng từ spec 002. File này
  được GIỮ NGUYÊN và dùng lại chứ không tạo bản thứ hai — hai bảng mốc cùng
  nói một điều là hai chỗ phải sửa khi engine đổi thật, và chỗ thứ hai sẽ là
  chỗ bị quên.

  Phần thêm dưới đây canh một đường khác mà Phase 33 và 34 có thể phá: tính
  THUẦN của engine. Sân 2D vẽ lại mỗi khung hình và màn hình rẽ nhánh chạy
  lại trận nhiều lần từ cùng một trạng thái — cả hai đều sai nếu `chayHetTran`
  lén sửa trạng thái được truyền vào.
*/
describe('engine giữ nguyên khi spec 004 dựng trên nó (AC-25.4, AC-25.5)', () => {
  const MA = 'K7M2R9XQ4B'

  it('chayHetTran KHÔNG sửa trạng thái được truyền vào', () => {
    const batDau = taoTran(cauHinhMau(MA))
    const chupTruoc = JSON.stringify(batDau)

    chayHetTran(batDau)

    expect(
      JSON.stringify(batDau),
      'chayHetTran đã sửa trạng thái đầu vào — sân 2D vẽ lại mỗi khung hình, và màn hình rẽ nhánh chạy lại từ cùng một trạng thái nhiều lần',
    ).toBe(chupTruoc)
  })

  it('cùng một trạng thái chạy hết hai lần cho kết quả giống hệt', () => {
    const batDau = taoTran(cauHinhMau(MA))

    const lan1 = chayHetTran(batDau)
    const lan2 = chayHetTran(batDau)

    expect(dongSuKien(lan2).map(rutGon)).toEqual(dongSuKien(lan1).map(rutGon))
    expect(lan2.tiSo).toEqual(lan1.tiSo)
  })

  it('đọc dòng sự kiện nhiều lần không làm nó đổi', () => {
    /*
      Sân 2D gọi `dongSuKien` ở mỗi khung hình trong lúc phát. Nếu hàm ấy
      lọc tại chỗ hay nhớ trạng thái giữa các lần gọi thì tường thuật sẽ
      trôi dần đi trong khi trận đang chạy — và không ai nghĩ đó là lỗi của
      engine.
    */
    const xong = chayHetTran(taoTran(cauHinhMau(MA)))
    const a = dongSuKien(xong).map(rutGon)
    const b = dongSuKien(xong).map(rutGon)
    const c = dongSuKien(xong).map(rutGon)

    expect(b).toEqual(a)
    expect(c).toEqual(a)
    expect(a.length).toBeGreaterThan(20)
  })

  it('phiên bản engine là 6 từ 2026-11-22 (ràng buộc R33 của spec 004)', () => {
    /*
      R33 của spec 004 cấm đổi engine ĐỂ CHIỀU MỘT TÍNH NĂNG GIAO DIỆN, và lệnh
      cấm ấy vẫn nguyên giá trị: suốt spec 004, 005 và 006 con số này giữ 5.

      Lần tăng này không phải chiều giao diện. Người dùng chốt sửa phễu dứt
      điểm sau khi đo engine cho 3,95 bàn một trận so với 2,82–3,28 thật, và
      họ chấp nhận cái giá — 20 trận đã lưu mất nút đấu lại — TRƯỚC khi sửa.
    */
    expect(
      PHIEN_BAN_ENGINE,
      'đổi engine là mọi trận đã lưu mất nút đấu lại; chỉ tăng khi kết quả THẬT SỰ đổi',
    ).toBe(6)
  })
})
