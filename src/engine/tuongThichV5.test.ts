import { describe, expect, it } from 'vitest'
import { cauHinhMau } from './__fixtures__/doiMau'
import type { SuKien } from './suKien'
import { chayHetTran, dongSuKien, PHIEN_BAN_ENGINE, taoTran } from './tran'

/*
  Engine v5 có còn phát lại đúng trận 11 người của spec 001 không (T223).

  Đây là CỔNG QUYẾT ĐỊNH cho T221, không phải một phép kiểm tính năng. Spec
  002 sửa engine ở nhiều chỗ — hệ số khoảng trống theo quân số, thời lượng
  trận, huỷ trận khi thiếu người, trần số dòng tường thuật. Câu hỏi là: ở
  **quân số 11, 90 phút**, những thay đổi ấy có làm đổi một dòng nào không?

  Nếu KHÔNG thì `PHIEN_BAN_ENGINE` phải giữ nguyên 5. Tăng thừa là tự tay
  tước nút "đấu lại" của mọi trận đã lưu — ứng dụng sẽ nói với người dùng
  rằng trận cũ chạy bằng engine khác, trong khi nó chạy bằng đúng engine này.

  Bảng mốc dưới đây được sinh từ engine tại commit cuối của spec 001 (nhánh
  `main`, `PHIEN_BAN_ENGINE = 5`), mỗi dòng rút gọn thành:
    phút | bù giờ | loại | đội | cầu thủ | mẫu câu | tỉ số sau đó
  Bảy trường này là TOÀN BỘ thứ người dùng đọc được trên một dòng tường
  thuật, nên hai dòng trùng nhau ở cả bảy là hai dòng không phân biệt được.
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
const MOC_V5: Readonly<Record<string, string>> = {
  K7M2R9XQ4B: `
    0|-|bat-dau|nha||685|0-0
    3|-|cuop-bong-cao|nha|A-6+B-2|124|0-0
    4|-|cuop-bong-cao|khach|B-3+A-9|200|0-0
    5|-|cuop-bong-cao|nha|A-7+B-3|647|0-0
    6|-|pham-loi|nha|A-4+B-7|116|0-0
    7|-|cuu-thua|nha|A-6+B-1|483|0-0
    9|-|cuop-bong-cao|khach|B-1+A-7|983|0-0
    10|-|cuop-bong-cao|nha|A-5+B-1|601|0-0
    11|-|pham-loi|nha|A-9+B-8|565|0-0
    12|-|ban-thang|nha|A-9+A-11|768|1-0
    13|-|cuop-bong-cao|khach|B-1+A-4|979|1-0
    14|-|cuop-bong-cao|nha|A-2+B-1|927|1-0
    15|-|pham-loi|khach|B-5+A-7|184|1-0
    16|-|cuu-thua|nha|A-8+B-1|511|1-0
    18|-|pham-loi|khach|B-9+A-9|733|1-0
    19|-|pham-loi|nha|A-8+B-3|364|1-0
    20|-|pham-loi|khach|B-9+A-5|252|1-0
    21|-|pham-loi|khach|B-7+A-8|740|1-0
    23|-|cuop-bong-cao|khach|B-5+A-8|451|1-0
    25|-|pham-loi|khach|B-5+A-7|911|1-0
    26|-|pham-loi|nha|A-6+B-11|768|1-0
    27|-|ban-thang|khach|B-7+B-10|526|1-1
    27|-|pham-loi|nha|A-4+B-8|763|1-1
    29|-|pham-loi|khach|B-11+A-4|415|1-1
    30|-|co-hoi|khach|B-11|691|1-1
    31|-|pham-loi|nha|A-11+B-1|994|1-1
    32|-|the-vang|nha|A-5|786|1-1
    32|-|pham-loi|khach|B-1+A-5|922|1-1
    33|-|pham-loi|nha|A-4+B-9|838|1-1
    35|-|cuop-bong-cao|khach|B-6+A-3|251|1-1
    36|-|pham-loi|khach|B-10+A-4|289|1-1
    37|-|cuop-bong-cao|nha|A-5+B-3|971|1-1
    38|-|ban-thang|nha|A-7+A-8|254|2-1
    38|-|cuop-bong-cao|nha|A-3+B-1|832|2-1
    39|-|tat-canh|khach|B-6+A-8|6|2-1
    40|-|cuu-thua|nha|A-11+B-1|359|2-1
    41|-|cuop-bong-cao|khach|B-11+A-2|50|2-1
    43|-|cuu-thua|nha|A-6+B-1|807|2-1
    44|-|cuop-bong-cao|khach|B-3+A-4|888|2-1
    46|b|tat-canh|nha|A-5+B-7|910|2-1
    47|b|cuop-bong-cao|nha|A-7+B-7|87|2-1
    47|b|het-hiep|nha||171|2-1
    46|-|ban-thang|nha|A-10+A-11|311|3-1
    46|-|tat-canh|nha|A-2+B-7|620|3-1
    48|-|cuop-bong-cao|nha|A-9+B-5|705|3-1
    49|-|cuop-bong-cao|nha|A-7+B-9|443|3-1
    51|-|cuop-bong-cao|khach|B-6+A-3|566|3-1
    52|-|cuu-thua|nha|A-11+B-1|931|3-1
    53|-|cuop-bong-cao|khach|B-6+A-5|166|3-1
    54|-|pham-loi|khach|B-2+A-3|584|3-1
    55|-|cuop-bong-cao|nha|A-3+B-3|66|3-1
    56|-|pham-loi|nha|A-3+B-3|385|3-1
    58|-|cuop-bong-cao|khach|B-5+A-7|13|3-1
    59|-|tat-canh|nha|A-5+B-6|651|3-1
    61|-|cuop-bong-cao|nha|A-1+B-7|530|3-1
    62|-|cuop-bong-cao|khach|B-4+A-1|871|3-1
    64|-|cuop-bong-cao|nha|A-8+B-7|405|3-1
    65|-|ban-thang|khach|B-8+B-7|189|3-2
    66|-|the-vang|nha|A-10|14|3-2
    66|-|pham-loi|khach|B-1+A-10|307|3-2
    67|-|tat-canh|nha|A-3+B-4|982|3-2
    68|-|cuop-bong-cao|nha|A-10+B-3|98|3-2
    71|-|cuop-bong-cao|khach|B-2+A-5|106|3-2
    72|-|co-hoi|khach|B-11|623|3-2
    73|-|cuop-bong-cao|khach|B-10+A-1|219|3-2
    74|-|the-vang|khach|B-10|411|3-2
    74|-|tat-canh|nha|A-3+B-10|963|3-2
    75|-|cuop-bong-cao|khach|B-6+A-5|328|3-2
    76|-|cuop-bong-cao|nha|A-4+B-8|723|3-2
    77|-|ban-thang|khach|B-11+B-9|329|3-3
    78|-|cuop-bong-cao|khach|B-2+A-4|97|3-3
    80|-|cuop-bong-cao|khach|B-1+A-9|346|3-3
    81|-|pham-loi|nha|A-1+B-5|719|3-3
    82|-|cuu-thua|nha|A-10+B-1|228|3-3
    83|-|cuop-bong-cao|nha|A-3+B-7|935|3-3
    85|-|cuop-bong-cao|khach|B-1+A-9|853|3-3
    86|-|cuu-thua|khach|B-6+A-1|779|3-3
    88|-|cuop-bong-cao|khach|B-11+A-5|433|3-3
    89|-|pham-loi|khach|B-8+A-7|327|3-3
    91|b|pham-loi|nha|A-9+B-1|181|3-3
    92|b|cuop-bong-cao|khach|B-7+A-9|82|3-3
    92|b|ket-thuc|nha||778|3-3
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
    11|-|ban-thang|nha|A-7+A-6|125|1-0
    11|-|cuop-bong-cao|khach|B-7+A-1|144|0-0
    12|-|ban-thang|nha|A-9+A-11|39|2-0
    13|-|cuop-bong-cao|khach|B-5+A-1|129|2-0
    14|-|co-hoi|nha|A-6|460|2-0
    15|-|cuop-bong-cao|nha|A-8+B-1|109|2-0
    17|-|cuop-bong-cao|khach|B-6+A-4|638|2-0
    19|-|cuop-bong-cao|nha|A-8+B-1|972|2-0
    20|-|the-do|khach|B-2|486|2-0
    20|-|pham-loi|nha|A-3+B-11|806|2-0
    23|-|cuop-bong-cao|nha|A-4+B-1|986|2-0
    24|-|co-hoi|nha|A-8|859|2-0
    25|-|cuop-bong-cao|nha|A-4+B-3|598|2-0
    26|-|cuop-bong-cao|nha|A-2+B-3|891|2-0
    29|-|cuop-bong-cao|nha|A-5+B-3|752|2-0
    31|-|pham-loi|nha|A-4+B-7|875|2-0
    32|-|cuu-thua|khach|B-8+A-1|976|2-0
    35|-|cuop-bong-cao|nha|A-1+B-5|460|2-0
    36|-|cuop-bong-cao|khach|B-3+A-2|969|2-0
    37|-|cuop-bong-cao|nha|A-3+B-4|112|2-0
    41|-|cuop-bong-cao|nha|A-7+B-3|646|2-0
    42|-|the-do|nha|A-7|270|2-0
    42|-|pham-loi|khach|B-4+A-7|168|2-0
    43|-|cuop-bong-cao|nha|A-1+B-1|149|2-0
    44|-|pham-loi|nha|A-9+B-8|327|2-0
    45|-|cuop-bong-cao|nha|A-8+B-6|846|2-0
    46|b|cuu-thua|nha|A-10+B-1|207|2-0
    47|b|cuop-bong-cao|nha|A-2+B-4|78|2-0
    48|b|cuop-bong-cao|khach|B-10+A-4|495|2-0
    49|b|cuop-bong-cao|khach|B-6+A-4|585|2-0
    50|b|pham-loi|khach|B-6+A-3|929|2-0
    50|b|het-hiep|nha||159|2-0
    46|-|cuop-bong-cao|khach|B-8+A-2|465|2-0
    47|-|cuu-thua|khach|B-9+A-1|551|2-0
    49|-|co-hoi|khach|B-11|185|2-0
    51|-|cuop-bong-cao|nha|A-11+B-3|922|2-0
    52|-|cuop-bong-cao|khach|B-3+A-2|83|2-0
    53|-|pham-loi|nha|A-3+B-8|865|2-0
    54|-|co-hoi|khach|B-9|31|2-0
    55|-|cuop-bong-cao|khach|B-9+A-5|11|2-0
    56|-|cuu-thua|khach|B-7+A-1|674|2-0
    57|-|pham-loi|khach|B-7+A-4|251|2-0
    58|-|cuop-bong-cao|nha|A-1+B-8|968|2-0
    59|-|the-vang|nha|A-11|359|2-0
    59|-|cuop-bong-cao|khach|B-5+A-5|753|2-0
    61|-|pham-loi|khach|B-7+A-6|192|2-0
    64|-|cuu-thua|khach|B-9+A-1|538|2-0
    65|-|cuop-bong-cao|nha|A-8+B-1|327|2-0
    66|-|cuop-bong-cao|nha|A-3+B-5|867|2-0
    68|-|cuop-bong-cao|khach|B-6+A-1|722|2-0
    69|-|pham-loi|nha|A-4+B-10|344|2-0
    71|-|cuop-bong-cao|nha|A-8+B-6|607|2-0
    72|-|pham-loi|nha|A-4+B-9|200|2-0
    74|-|cuop-bong-cao|nha|A-2+B-7|329|2-0
    75|-|cuop-bong-cao|khach|B-6+A-8|412|2-0
    76|-|cuop-bong-cao|khach|B-4+A-3|928|2-0
    78|-|pham-loi|khach|B-8+A-2|178|2-0
    79|-|the-do|nha|A-11|664|2-0
    79|-|pham-loi|khach|B-4+A-11|204|2-0
    80|-|cuu-thua|nha|A-9+B-1|56|2-0
    81|-|cuop-bong-cao|khach|B-3+A-2|856|2-0
    82|-|cuop-bong-cao|nha|A-9+B-7|63|2-0
    83|-|the-vang|nha|A-8|795|2-0
    83|-|pham-loi|khach|B-3+A-8|271|2-0
    85|-|pham-loi|khach|B-5+A-9|162|2-0
    86|-|pham-loi|nha|A-4+B-6|497|2-0
    87|-|cuu-thua|khach|B-11+A-1|252|2-0
    88|-|ban-thang|khach|B-11+B-7|909|2-1
    88|-|cuop-bong-cao|nha|A-9+B-8|439|2-1
    89|-|cuop-bong-cao|khach|B-3+A-3|995|2-1
    90|-|the-vang|khach|B-4|752|2-1
    90|-|pham-loi|nha|A-6+B-4|280|2-1
    91|b|cuop-bong-cao|khach|B-4+A-1|93|2-1
    92|b|cuop-bong-cao|khach|B-8+A-5|855|2-1
    93|b|pham-loi|khach|B-7+A-3|136|2-1
    94|b|ket-thuc|nha||523|2-1
  `,
  W5H4J2YD9F: `
    0|-|bat-dau|nha||805|0-0
    2|-|the-vang|nha|A-11|341|0-0
    2|-|cuop-bong-cao|khach|B-7+A-8|141|0-0
    3|-|the-vang|khach|B-6|253|0-0
    3|-|co-hoi|khach|B-6|366|0-0
    5|-|co-hoi|nha|A-10|926|0-0
    6|-|pham-loi|khach|B-5+A-8|579|0-0
    7|-|pham-loi|nha|A-3+B-11|379|0-0
    8|-|cuop-bong-cao|khach|B-10+A-1|94|0-0
    9|-|the-vang|nha|A-5|27|0-0
    9|-|pham-loi|khach|B-6+A-5|243|0-0
    12|-|cuop-bong-cao|khach|B-5+A-2|348|0-0
    14|-|cuop-bong-cao|khach|B-7+A-5|379|0-0
    16|-|ban-thang|nha|A-8+A-10|551|1-0
    16|-|pham-loi|nha|A-8+B-3|261|0-0
    17|-|the-vang|khach|B-7|798|1-0
    17|-|cuop-bong-cao|nha|A-9+B-3|359|1-0
    18|-|cuu-thua|nha|A-6+B-1|63|1-0
    20|-|cuop-bong-cao|nha|A-8+B-1|330|1-0
    21|-|tat-canh|khach|B-7+A-4|887|1-0
    22|-|pham-loi|nha|A-10+B-3|706|1-0
    25|-|cuu-thua|nha|A-6+B-1|194|1-0
    26|-|cuop-bong-cao|khach|B-8+A-3|801|1-0
    27|-|pham-loi|khach|B-9+A-8|16|1-0
    30|-|cuu-thua|khach|B-7+A-1|656|1-0
    31|-|cuop-bong-cao|nha|A-7+B-1|300|1-0
    32|-|cuu-thua|khach|B-7+A-1|637|1-0
    33|-|the-vang|nha|A-4|602|1-0
    33|-|cuop-bong-cao|nha|A-8+B-1|148|1-0
    34|-|pham-loi|khach|B-11+A-7|435|1-0
    35|-|cuop-bong-cao|khach|B-2+A-8|611|1-0
    36|-|co-hoi|nha|A-11|565|1-0
    37|-|cuop-bong-cao|khach|B-9+A-1|529|1-0
    39|-|cuop-bong-cao|khach|B-6+A-3|768|1-0
    40|-|cuop-bong-cao|nha|A-2+B-4|540|1-0
    41|-|cuop-bong-cao|nha|A-6+B-4|886|1-0
    42|-|cuop-bong-cao|khach|B-8+A-6|690|1-0
    43|-|cuop-bong-cao|khach|B-5+A-1|403|1-0
    45|-|cuop-bong-cao|nha|A-4+B-8|319|1-0
    46|b|the-vang|nha|A-9|343|1-0
    46|b|cuop-bong-cao|nha|A-3+B-5|676|1-0
    47|b|het-hiep|nha||925|1-0
    46|-|cuop-bong-cao|nha|A-7+B-8|521|1-0
    47|-|pham-loi|nha|A-3+B-6|811|1-0
    48|-|pham-loi|khach|B-3+A-4|830|1-0
    50|-|cuu-thua|khach|B-10+A-1|188|1-0
    51|-|cuu-thua|khach|B-7+A-1|468|1-0
    52|-|ban-thang|nha|A-6+A-10|983|2-0
    52|-|co-hoi|khach|B-6|903|2-0
    54|-|cuop-bong-cao|khach|B-3+A-5|168|2-0
    55|-|tat-canh|khach|B-10+A-1|344|2-0
    56|-|cuop-bong-cao|nha|A-1+B-4|547|2-0
    57|-|co-hoi|khach|B-7|454|2-0
    58|-|cuop-bong-cao|khach|B-2+A-4|215|2-0
    59|-|tat-canh|khach|B-8+A-2|895|2-0
    60|-|cuu-thua|nha|A-8+B-1|618|2-0
    61|-|ban-thang|khach|B-11+B-10|862|2-1
    61|-|pham-loi|khach|B-9+A-4|171|2-1
    63|-|cuop-bong-cao|khach|B-6+A-1|285|2-1
    64|-|pham-loi|khach|B-2+A-7|55|2-1
    65|-|pham-loi|nha|A-10+B-7|388|2-1
    68|-|cuop-bong-cao|khach|B-10+A-3|237|2-1
    69|-|pham-loi|nha|A-9+B-8|444|2-1
    70|-|cuop-bong-cao|khach|B-3+A-2|47|2-1
    71|-|cuop-bong-cao|khach|B-1+A-3|586|2-1
    73|-|pham-loi|nha|A-9+B-10|751|2-1
    74|-|co-hoi|nha|A-6|989|2-1
    75|-|pham-loi|nha|A-9+B-3|52|2-1
    76|-|cuop-bong-cao|nha|A-7+B-4|927|2-1
    77|-|cuop-bong-cao|khach|B-1+A-9|841|2-1
    78|-|cuop-bong-cao|nha|A-3+B-4|250|2-1
    80|-|cuop-bong-cao|khach|B-5+A-4|136|2-1
    81|-|cuop-bong-cao|khach|B-10+A-1|70|2-1
    82|-|the-vang|khach|B-9|740|2-1
    82|-|tat-canh|nha|A-6+B-9|673|2-1
    83|-|pham-loi|nha|A-7+B-11|755|2-1
    84|-|cuop-bong-cao|nha|A-5+B-4|840|2-1
    85|-|cuop-bong-cao|khach|B-8+A-5|218|2-1
    86|-|cuop-bong-cao|khach|B-4+A-3|536|2-1
    89|-|the-vang|nha|A-2|512|2-1
    89|-|tat-canh|khach|B-2+A-2|715|2-1
    90|-|cuop-bong-cao|khach|B-1+A-3|867|2-1
    91|b|pham-loi|nha|A-7+B-7|250|2-1
    92|b|cuop-bong-cao|khach|B-8+A-8|791|2-1
    94|b|cuu-thua|nha|A-8+B-1|796|2-1
    95|b|co-hoi|nha|A-10|726|2-1
    95|b|ket-thuc|nha||681|2-1
  `,
  R8K3M7QX2N: `
    0|-|bat-dau|nha||22|0-0
    1|-|pham-loi|nha|A-6+B-3|954|0-0
    3|-|pham-loi|khach|B-1+A-7|113|0-0
    5|-|pham-loi|nha|A-3+B-4|30|0-0
    6|-|ban-thang|nha|A-11+A-8|265|1-0
    6|-|pham-loi|khach|B-6+A-9|763|1-0
    7|-|cuop-bong-cao|khach|B-10+A-5|664|1-0
    8|-|cuop-bong-cao|nha|A-4+B-7|605|1-0
    9|-|cuop-bong-cao|nha|A-8+B-3|252|1-0
    10|-|cuop-bong-cao|khach|B-4+A-9|369|1-0
    11|-|tat-canh|khach|B-8+A-11|334|1-0
    12|-|cuop-bong-cao|khach|B-7+A-6|799|1-0
    13|-|pham-loi|khach|B-3+A-8|721|1-0
    15|-|co-hoi|khach|B-9|323|1-0
    16|-|pham-loi|khach|B-8+A-6|259|1-0
    17|-|cuop-bong-cao|khach|B-11+A-3|129|1-0
    18|-|cuu-thua|nha|A-10+B-1|471|1-0
    19|-|cuop-bong-cao|nha|A-9+B-5|231|1-0
    20|-|cuu-thua|nha|A-8+B-1|715|1-0
    21|-|cuop-bong-cao|nha|A-7+B-6|812|1-0
    22|-|pham-loi|khach|B-2+A-9|885|1-0
    26|-|pham-loi|nha|A-4+B-4|570|1-0
    27|-|cuop-bong-cao|nha|A-6+B-3|648|1-0
    28|-|pham-loi|nha|A-3+B-9|594|1-0
    29|-|cuop-bong-cao|nha|A-8+B-1|651|1-0
    35|-|cuop-bong-cao|khach|B-7+A-3|646|1-0
    36|-|tat-canh|nha|A-3+B-5|330|1-0
    37|-|pham-loi|khach|B-8+A-3|490|1-0
    38|-|pham-loi|khach|B-9+A-10|63|1-0
    39|-|cuop-bong-cao|nha|A-6+B-1|289|1-0
    40|-|pham-loi|khach|B-6+A-2|497|1-0
    41|-|cuop-bong-cao|nha|A-2+B-8|811|1-0
    43|-|cuop-bong-cao|nha|A-7+B-3|930|1-0
    44|-|tat-canh|khach|B-11+A-1|176|1-0
    46|b|cuop-bong-cao|nha|A-3+B-5|64|1-0
    46|b|het-hiep|nha||696|1-0
    48|-|cuu-thua|nha|A-9+B-1|63|1-0
    49|-|pham-loi|nha|A-2+B-8|521|1-0
    52|-|cuop-bong-cao|khach|B-4+A-7|37|1-0
    53|-|cuop-bong-cao|nha|A-6+B-8|181|1-0
    54|-|cuop-bong-cao|khach|B-5+A-7|56|1-0
    55|-|cuop-bong-cao|nha|A-4+B-4|548|1-0
    56|-|pham-loi|nha|A-6+B-4|464|1-0
    57|-|tat-canh|nha|A-4+B-9|739|1-0
    58|-|cuop-bong-cao|nha|A-3+B-8|358|1-0
    59|-|pham-loi|nha|A-1+B-8|37|1-0
    60|-|the-vang|nha|A-3|754|1-0
    60|-|cuu-thua|khach|B-6+A-1|198|1-0
    61|-|pham-loi|khach|B-11+A-6|522|1-0
    63|-|co-hoi|khach|B-7|357|1-0
    65|-|pham-loi|nha|A-2+B-7|257|1-0
    66|-|pham-loi|khach|B-5+A-2|507|1-0
    67|-|pham-loi|khach|B-7+A-4|963|1-0
    68|-|cuop-bong-cao|khach|B-11+A-4|195|1-0
    69|-|the-vang|nha|A-7|889|1-0
    69|-|co-hoi|nha|A-9|805|1-0
    70|-|cuop-bong-cao|nha|A-2+B-3|494|1-0
    71|-|cuop-bong-cao|nha|A-11+B-5|304|1-0
    72|-|cuop-bong-cao|nha|A-7+B-7|593|1-0
    73|-|the-vang|nha|A-6|568|1-0
    73|-|cuop-bong-cao|khach|B-4+A-7|924|1-0
    75|-|cuop-bong-cao|khach|B-5+A-8|520|1-0
    76|-|tat-canh|khach|B-2+A-6|127|1-0
    78|-|co-hoi|nha|A-8|238|1-0
    79|-|cuu-thua|nha|A-10+B-1|363|1-0
    81|-|co-hoi|khach|B-6|573|1-0
    82|-|cuop-bong-cao|nha|A-11+B-4|371|1-0
    85|-|cuop-bong-cao|khach|B-2+A-4|480|1-0
    86|-|co-hoi|khach|B-10|394|1-0
    87|-|cuop-bong-cao|khach|B-11+A-2|604|1-0
    88|-|pham-loi|khach|B-9+A-2|863|1-0
    89|-|pham-loi|khach|B-1+A-8|519|1-0
    94|b|cuop-bong-cao|nha|A-7+B-9|530|1-0
    94|b|ket-thuc|nha||85|1-0
  `,
  T6B9V4CZ1P: `
    0|-|bat-dau|nha||346|0-0
    2|-|co-hoi|khach|B-9|203|0-0
    3|-|pham-loi|nha|A-2+B-6|525|0-0
    4|-|the-vang|nha|A-10|97|0-0
    4|-|pham-loi|khach|B-3+A-10|675|0-0
    5|-|pham-loi|khach|B-8+A-2|286|0-0
    7|-|pham-loi|khach|B-3+A-10|962|0-0
    8|-|cuop-bong-cao|nha|A-6+B-1|486|0-0
    9|-|cuop-bong-cao|nha|A-2+B-6|740|0-0
    10|-|ban-thang|nha|A-7+A-9|782|1-0
    12|-|cuop-bong-cao|nha|A-4+B-9|392|1-0
    14|-|cuop-bong-cao|nha|A-1+B-3|381|1-0
    15|-|co-hoi|nha|A-7|161|1-0
    17|-|cuop-bong-cao|khach|B-10+A-8|741|1-0
    18|-|cuop-bong-cao|nha|A-8+B-2|434|1-0
    21|-|pham-loi|khach|B-1+A-6|671|1-0
    23|-|cuop-bong-cao|khach|B-4+A-4|302|1-0
    24|-|cuu-thua|nha|A-7+B-1|254|1-0
    25|-|pham-loi|khach|B-4+A-11|991|1-0
    26|-|the-vang|khach|B-8|82|1-0
    26|-|pham-loi|nha|A-8+B-4|985|1-0
    27|-|cuop-bong-cao|khach|B-7+A-4|884|1-0
    28|-|pham-loi|khach|B-3+A-7|976|1-0
    29|-|cuop-bong-cao|khach|B-7+A-5|400|1-0
    31|-|cuu-thua|nha|A-7+B-1|563|1-0
    32|-|pham-loi|khach|B-5+A-6|300|1-0
    33|-|cuop-bong-cao|khach|B-10+A-4|740|1-0
    34|-|cuop-bong-cao|nha|A-7+B-2|257|1-0
    35|-|cuop-bong-cao|nha|A-7+B-5|114|1-0
    37|-|ban-thang|khach|B-8+B-7|750|1-1
    39|-|the-vang|nha|A-7|114|1-1
    39|-|cuop-bong-cao|nha|A-11+B-2|807|1-1
    40|-|pham-loi|nha|A-4+B-9|222|1-1
    41|-|cuu-thua|khach|B-9+A-1|835|1-1
    43|-|ban-thang|nha|A-7+A-8|437|2-1
    44|-|pham-loi|nha|A-5+B-11|66|2-1
    45|-|pham-loi|khach|B-10+A-3|754|2-1
    46|b|cuop-bong-cao|nha|A-9+B-7|68|2-1
    48|b|cuop-bong-cao|nha|A-3+B-6|338|2-1
    48|b|het-hiep|nha||328|2-1
    46|-|pham-loi|khach|B-6+A-7|254|2-1
    47|-|co-hoi|nha|A-6|313|2-1
    48|-|cuop-bong-cao|nha|A-3+B-1|674|2-1
    49|-|cuop-bong-cao|nha|A-7+B-7|291|2-1
    50|-|cuu-thua|khach|B-6+A-1|775|2-1
    51|-|cuop-bong-cao|nha|A-7+B-9|877|2-1
    53|-|pham-loi|khach|B-9+A-8|140|2-1
    54|-|pham-loi|nha|A-4+B-8|741|2-1
    55|-|pham-loi|khach|B-1+A-11|726|2-1
    56|-|ban-thang|nha|A-8+A-11|648|3-1
    56|-|pham-loi|khach|B-8+A-5|395|3-1
    57|-|pham-loi|nha|A-4+B-11|268|3-1
    59|-|cuop-bong-cao|nha|A-9+B-4|574|3-1
    61|-|pham-loi|khach|B-9+A-11|162|3-1
    62|-|cuop-bong-cao|nha|A-7+B-5|596|3-1
    63|-|cuop-bong-cao|khach|B-9+A-3|381|3-1
    64|-|cuop-bong-cao|khach|B-1+A-4|71|3-1
    65|-|cuop-bong-cao|khach|B-3+A-7|96|3-1
    67|-|pham-loi|khach|B-2+A-5|757|3-1
    69|-|the-vang|nha|A-8|32|3-1
    69|-|pham-loi|nha|A-1+B-9|716|3-1
    70|-|cuop-bong-cao|khach|B-10+A-3|674|3-1
    71|-|cuop-bong-cao|khach|B-3+A-1|281|3-1
    73|-|pham-loi|nha|A-9+B-9|732|3-1
    74|-|cuop-bong-cao|nha|A-7+B-3|205|3-1
    75|-|co-hoi|nha|A-11|674|3-1
    76|-|cuop-bong-cao|khach|B-8+A-3|776|3-1
    77|-|cuop-bong-cao|nha|A-7+B-1|441|3-1
    79|-|tat-canh|nha|A-6+B-1|427|3-1
    80|-|cuop-bong-cao|nha|A-10+B-2|424|3-1
    81|-|pham-loi|nha|A-2+B-5|729|3-1
    83|-|cuop-bong-cao|nha|A-3+B-7|803|3-1
    84|-|pham-loi|nha|A-1+B-7|509|3-1
    85|-|pham-loi|nha|A-4+B-7|128|3-1
    86|-|pham-loi|khach|B-4+A-8|187|3-1
    88|-|pham-loi|nha|A-7+B-3|525|3-1
    89|-|cuop-bong-cao|nha|A-6+B-5|769|3-1
    91|b|cuop-bong-cao|khach|B-7+A-3|842|3-1
    92|b|ban-thang|nha|A-7+A-10|803|4-1
    93|b|cuop-bong-cao|nha|A-3+B-6|567|4-1
    94|b|pham-loi|nha|A-8+B-3|252|4-1
    95|b|ket-thuc|nha||148|4-1
  `,
}

function dongCuaMoc(ma: string): readonly string[] {
  return MOC_V5[ma]
    .split('\n')
    .map((d) => d.trim())
    .filter((d) => d !== '')
}

describe('engine v5 phát lại đúng trận 11 người của spec 001 (T223)', () => {
  it('mọi dòng tường thuật khớp từng ký tự với mốc đã chốt', () => {
    let tongKhop = 0
    let tongLech = 0
    const baoCao: string[] = []

    for (const ma of Object.keys(MOC_V5)) {
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
  it('dòng sự kiện không đổi thì PHIEN_BAN_ENGINE giữ nguyên 5 (AC-16.3)', () => {
    expect(PHIEN_BAN_ENGINE).toBe(5)
  })
})
