import type { MauCau } from './mauCau.vi'
import type { MAU_VI } from './mauCau.vi'

/*
  Mẫu câu tường thuật tiếng Anh (T314, quyết định D69).

  **Viết lại, không dịch tại chỗ.** Trật tự chủ–vị của hai thứ tiếng khác
  nhau ở đúng những chỗ quan trọng nhất:

    - pha phạm lỗi: tiếng Việt kể từ phía NGƯỜI BỊ PHẠM LỖI ("A bị B phạm
      lỗi"), tiếng Anh kể từ phía NGƯỜI PHẠM LỖI ("B fouls A"). Mẫu nào
      ghép mảnh dùng chung cho cả hai cũng sẽ sai ở một bên.
    - pha cướp bóng: cả hai thứ tiếng đều khen đội ĐOẠT được bóng, tức
      `ten2` và `tenDoiKia` — giữ nguyên quy ước của bản tiếng Việt.

  Số mẫu mỗi loại phải BẰNG ĐÚNG bản tiếng Việt (AC-18.3). Kiểu `CungSoMau`
  ở dưới ép điều đó lúc biên dịch, nên không cần nhớ.
*/

/**
 * Cùng tập khoá và **cùng số mẫu mỗi khoá** với bảng tiếng Việt.
 *
 * `MAU_VI` khai `as const` nên mỗi mảng của nó là một tuple có độ dài cố
 * định; ánh xạ `[I in keyof T[K]]` giữ nguyên độ dài ấy. Thêm hay bớt một
 * mẫu ở bảng này mà không làm điều tương ứng bên kia là lỗi biên dịch.
 */
/*
  `DoiKieu` nhận MỘT tham số kiểu trần, nên phép ánh xạ là **đồng cấu** và
  TypeScript giữ nguyên hình dạng tuple. Viết lồng thẳng `[I in keyof T[K]]`
  thì không đồng cấu: nó quét cả `length`, `toString` và mọi phương thức của
  mảng, rồi đòi chúng cũng phải là `MauCau`.
*/
type DoiKieu<A> = { [I in keyof A]: MauCau }

type CungSoMau<T> = {
  readonly [K in keyof T]: DoiKieu<T[K]>
}

export const MAU_EN: CungSoMau<typeof MAU_VI> = {
  'bat-dau': [
    () => 'The referee blows for kick-off.',
    () => 'The ball is rolling, and we are under way.',
    () => 'Both sides are out, and the match begins.',
    () => 'The whistle goes, and the match is officially under way.',
  ],
  'ban-thang': [
    (c) => `IN! ${c.ten} finishes neatly, and ${c.tenDoi} have their goal.`,
    (c) => `${c.ten} strikes it beyond the keeper — a goal for ${c.tenDoi}!`,
    (c) => `The ball nestles in the net! ${c.ten} scores for ${c.tenDoi}.`,
    (c) => `${c.ten} arrives to finish precisely, and ${c.tenDoi} celebrate.`,
    (c) => `The keeper is helpless against ${c.ten}. A goal for ${c.tenDoi}!`,
  ],
  'co-hoi': [
    (c) => `${c.ten} shoots, but it drifts wide of the post.`,
    (c) => `A chance for ${c.tenDoi}! ${c.ten} cannot reach it.`,
    (c) => `${c.ten} finds space, but the shot lacks accuracy.`,
    (c) => `${c.ten} gets the shot away and it flies over the bar.`,
    (c) => `${c.ten} is well placed, but his finishing lets him down.`,
  ],
  'cuu-thua': [
    (c) => `The keeper flies across to keep out ${c.ten}'s shot.`,
    (c) => `${c.ten} is sure he has scored, but the keeper pushes it away.`,
    (c) => `A fine save to deny ${c.ten}.`,
    (c) => `${c.ten}'s effort is blocked right on the line.`,
  ],
  'tat-canh': [
    (c) => `${c.ten} pulls it back from the flank, and the defence clears.`,
    (c) => `${c.ten}'s cross fails to find a team-mate.`,
    (c) => `${c.tenDoi} work the flank, and ${c.ten} hangs the ball up.`,
    (c) => `${c.ten} puts it into the box, but nobody gets on the end of it.`,
  ],
  'cuop-bong-cao': [
    (c) =>
      c.ten2
        ? `${c.tenDoiKia} swarm forward inside their opponents' half, and ${c.ten2} wins it back.`
        : `${c.tenDoiKia} swarm forward inside their opponents' half and win the ball back.`,
    (c) =>
      c.ten2
        ? `${c.ten2} presses and steals the ball high up the pitch.`
        : `${c.tenDoiKia} press and steal the ball high up the pitch.`,
    (c) =>
      c.ten2
        ? `An effective press from ${c.tenDoiKia}, with ${c.ten2} leading it.`
        : `An effective press from ${c.tenDoiKia}.`,
    (c) =>
      c.ten2
        ? `${c.ten2} cuts out the build-up deep in ${c.tenDoi}'s half.`
        : `${c.tenDoiKia} cut out the build-up deep in their opponents' half.`,
  ],
  'thoat-xuong': [
    (c) => `${c.ten} breaks in behind the back line.`,
    (c) => `The defence pushes up and leaves space, and ${c.ten} runs into it.`,
    (c) => `${c.ten} times it perfectly and beats the trap.`,
    (c) => `A through ball picks out ${c.ten} behind the defence.`,
  ],
  /*
    Đây là chỗ phải viết lại chứ không dịch: tiếng Việt kể "A bị B phạm
    lỗi", tiếng Anh kể "B fouls A". `ten` là người bị phạm lỗi, `ten2` là
    người phạm lỗi — thứ tự ấy giữ nguyên, chỉ câu đổi chiều.
  */
  'pham-loi': [
    (c) =>
      c.ten2
        ? `${c.ten2} gives away a foul, and the referee stops play.`
        : `The referee stops play for a foul by ${c.tenDoiKia}.`,
    (c) =>
      c.ten2 && c.ten
        ? `${c.ten2} fouls ${c.ten}, and ${c.tenDoi} have a free kick.`
        : `${c.tenDoi} have a free kick.`,
    (c) =>
      c.ten2
        ? `${c.ten2} goes in late and the match has to stop.`
        : `A challenge from ${c.tenDoiKia} forces the match to stop.`,
    (c) =>
      c.ten
        ? `${c.tenDoi}'s move forward is halted by a foul on ${c.ten}.`
        : `${c.tenDoi}'s move forward is halted by a foul.`,
  ],
  'the-vang': [
    (c) => `${c.ten} is booked for a late challenge.`,
    (c) => `The referee shows ${c.ten} a yellow card.`,
    (c) => `${c.ten} commits a tactical foul and goes into the book.`,
    (c) => `A yellow card for ${c.ten} of ${c.tenDoi}.`,
  ],
  'the-do': [
    (c) => `Red card! ${c.ten} is off, and ${c.tenDoi} are down to ten men.`,
    (c) => `${c.ten} is sent off and walks down the tunnel.`,
    (c) => `The referee does not hesitate — a red card for ${c.ten}.`,
    (c) => `${c.tenDoi} lose a man: ${c.ten} is dismissed.`,
  ],
  'thay-nguoi': [
    (c) => `A change for ${c.tenDoi}: ${c.ten} comes on.`,
    (c) => `An adjustment from the ${c.tenDoi} bench, and ${c.ten} is brought on.`,
    (c) =>
      c.ten2
        ? `${c.ten2} makes way for ${c.ten} of ${c.tenDoi}.`
        : `${c.tenDoi} bring on fresh legs: ${c.ten} comes on.`,
    (c) =>
      c.ten2
        ? `The board goes up, and ${c.tenDoi} replace ${c.ten2} with ${c.ten}.`
        : `The board goes up, and ${c.tenDoi} make a change.`,
  ],
  'kiet-suc': [
    (c) => `${c.ten} is visibly running out of legs.`,
    (c) => `${c.ten} has his hands on his knees, almost spent.`,
    (c) => `The ${c.tenDoi} bench should keep an eye on ${c.ten} — he is exhausted.`,
    (c) => `${c.ten} has slowed right down, a sign that he has overdone it.`,
  ],
  'het-hiep': [
    () => 'That is the end of the first half, and the sides head for the tunnel.',
    () => 'The whistle brings the first half to a close.',
    () => 'The first half is over.',
    () => 'The referee sends them in for the break.',
  ],
  'huy-tran': [
    (c) => `The referee stops the match: ${c.tenDoi} no longer have enough players.`,
    (c) =>
      `The match cannot continue — ${c.tenDoi} have lost too many men to red cards.`,
    (c) =>
      `An early whistle: ${c.tenDoi} are below the minimum number of players, and the match is abandoned.`,
    (c) =>
      `${c.tenDoi} are down to too few players, and the referee has to stop the match here.`,
  ],
  'ket-thuc': [
    () => 'Full time! The match is over.',
    () => 'The final whistle goes.',
    () => 'That brings the match to an end.',
    () => 'There is no time left, and the referee blows for full time.',
  ],
}

export const CAU_LUI_EN: MauCau = (c) =>
  c.ten
    ? `${c.ten} loses the ball, and ${c.tenDoiKia} have it.`
    : `${c.tenDoi} lose the ball.`
