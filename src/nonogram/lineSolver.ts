function canBeBlack(cell: boolean | null): boolean {
  return cell !== false;
}

function canBeWhite(cell: boolean | null): boolean {
  return cell !== true;
}

function isBlockCompatible(line: (boolean | null)[], start: number, end: number): boolean {
  for (let i = start; i < end; i++) {
    if (!canBeBlack(line[i])) return false;
  }
  return true;
}

// dp[i][j]: 先頭i マスを、先頭j 個のブロックと末尾の余白で埋められるか
function isFeasible(line: (boolean | null)[], hints: number[]): boolean {
  const length = line.length;
  const blockCount = hints.length;
  const dp: boolean[][] = Array.from({ length: length + 1 }, () =>
    Array(blockCount + 1).fill(false),
  );
  dp[0][0] = true;

  for (let i = 1; i <= length; i++) {
    for (let j = 0; j <= blockCount; j++) {
      if (dp[i - 1][j] && canBeWhite(line[i - 1])) {
        dp[i][j] = true;
        continue;
      }

      if (j === 0) continue;

      const blockSize = hints[j - 1];
      const start = i - blockSize;
      if (start < 0 || !isBlockCompatible(line, start, i)) continue;

      if (j === 1) {
        dp[i][j] = dp[start][0];
      } else {
        const gapPos = start - 1;
        dp[i][j] = gapPos >= 0 && canBeWhite(line[gapPos]) && dp[gapPos][j - 1];
      }
    }
  }

  return dp[length][blockCount];
}

export interface LineSolveResult {
  pattern: (boolean | null)[];
  feasible: boolean;
}

// 行（または列）のヒントから、両立する全ての配置に共通するマスのみを確定させる
export function solveLine(line: (boolean | null)[], hints: number[]): LineSolveResult {
  if (!isFeasible(line, hints)) {
    return { pattern: line, feasible: false };
  }

  const scratch = [...line];
  const isPossibleAs = (index: number, value: boolean) => {
    scratch[index] = value;
    const result = isFeasible(scratch, hints);
    scratch[index] = null;
    return result;
  };

  const pattern = line.map((cell, index) => {
    if (cell !== null) return cell;

    const blackIsPossible = isPossibleAs(index, true);
    const whiteIsPossible = isPossibleAs(index, false);

    if (blackIsPossible && !whiteIsPossible) return true;
    if (!blackIsPossible && whiteIsPossible) return false;
    return null;
  });

  return { pattern, feasible: true };
}
