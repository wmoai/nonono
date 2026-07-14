function canBeBlack(cell: boolean | null): boolean {
  return cell !== false;
}

function canBeWhite(cell: boolean | null): boolean {
  return cell !== true;
}

function isBlockCompatible(line: (boolean | null)[], start: number, end: number): boolean {
  for (let pos = start; pos < end; pos++) {
    if (!canBeBlack(line[pos])) {return false;}
  }
  return true;
}

// dp[position][blockIndex]: 先頭position マスを、先頭blockIndex 個のブロックと末尾の余白で埋められるか
function isFeasible(line: (boolean | null)[], hints: number[]): boolean {
  const length = line.length;
  const blockCount = hints.length;
  const dp: boolean[][] = Array.from({ length: length + 1 }, () =>
    Array(blockCount + 1).fill(false),
  );
  dp[0][0] = true;

  for (let position = 1; position <= length; position++) {
    for (let blockIndex = 0; blockIndex <= blockCount; blockIndex++) {
      if (dp[position - 1][blockIndex] && canBeWhite(line[position - 1])) {
        dp[position][blockIndex] = true;
        continue;
      }

      if (blockIndex === 0) {continue;}

      const blockSize = hints[blockIndex - 1];
      const start = position - blockSize;
      if (start < 0 || !isBlockCompatible(line, start, position)) {continue;}

      if (blockIndex === 1) {
        dp[position][blockIndex] = dp[start][0];
      } else {
        const gapPos = start - 1;
        dp[position][blockIndex] =
          gapPos >= 0 && canBeWhite(line[gapPos]) && dp[gapPos][blockIndex - 1];
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
    if (cell !== null) {return cell;}

    const blackIsPossible = isPossibleAs(index, true);
    const whiteIsPossible = isPossibleAs(index, false);

    if (blackIsPossible && !whiteIsPossible) {return true;}
    if (!blackIsPossible && whiteIsPossible) {return false;}
    return null;
  });

  return { pattern, feasible: true };
}
