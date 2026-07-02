type Cell = 0 | 1 | null; // 0 = 白, 1 = 黒
type Pattern = Cell[];
type Grid = Cell[][];

/**
 * ヒント（例: [3,1]）から、行の全パターンを生成
 */
const generateRowPatterns = (hint: number[], length: number): Pattern[] => {
  const results: Pattern[] = [];

  const backtrack = (blockIndex: number, pos: number, row: Cell[]) => {
    if (blockIndex === hint.length) {
      // 残りはすべて白で埋める
      const filled = row.concat(Array(length - row.length).fill(0));
      results.push(filled as Pattern);
      return;
    }

    const blockSize = hint[blockIndex];
    for (let start = pos; start + blockSize <= length; start++) {
      // 現在位置に blockSize 個の黒を置く
      const newRow = row.concat(
        Array(start - row.length).fill(0), // 白マスで埋める
        Array(blockSize).fill(1), // 黒マス
      );
      if (newRow.length < length) {
        newRow.push(0); // 次のブロックのために最低1つ白を入れる
      }
      backtrack(blockIndex + 1, newRow.length, newRow);
    }
  };

  backtrack(0, 0, []);
  return results;
};

/**
 * 行を追加したときに列が矛盾しないか確認
 */
const isConsistent = (grid: Grid, rowIndex: number, pattern: Pattern): boolean => {
  for (let col = 0; col < pattern.length; col++) {
    const val = pattern[col];
    if (grid[rowIndex][col] !== null && grid[rowIndex][col] !== val) {
      return false;
    }
  }
  return true;
};

/**
 * 完成した盤面が列ヒントを満たすかをチェック
 */
const checkColumns = (grid: Grid, colHints: number[][]): boolean => {
  const nRows = grid.length;
  const nCols = grid[0].length;

  for (let col = 0; col < nCols; col++) {
    const sequence: number[] = [];
    let count = 0;
    for (let row = 0; row < nRows; row++) {
      if (grid[row][col] === 1) {
        count++;
      } else if (count > 0) {
        sequence.push(count);
        count = 0;
      }
    }
    if (count > 0) {
      sequence.push(count);
    }

    const expected = colHints[col];
    if (sequence.length !== expected.length) {
      return false;
    }
    for (let i = 0; i < sequence.length; i++) {
      if (sequence[i] !== expected[i]) {
        return false;
      }
    }
  }
  return true;
};

/**
 * ノノグラムソルバー
 * @returns "解なし" | "一意解" | "複数解"
 */
export const solveNonogram = (rowHints: number[][], colHints: number[][]): string => {
  const nRows = rowHints.length;
  const nCols = colHints.length;

  const rowCandidates = rowHints.map((hint) => generateRowPatterns(hint, nCols));
  console.log(rowCandidates);

  const grid: Grid = Array.from({ length: nRows }, () => Array(nCols).fill(null));

  let solutionCount = 0;

  const backtrack = (rowIndex: number) => {
    if (solutionCount > 1) return; // 複数解判定で打ち切り

    if (rowIndex === nRows) {
      if (checkColumns(grid, colHints)) {
        solutionCount++;
      }
      console.log("@@@@@@@@EOL");
      return;
    }

    for (const pattern of rowCandidates[rowIndex]) {
      console.log(rowIndex, grid);
      if (!isConsistent(grid, rowIndex, pattern)) {
        console.log("not");
        continue;
      }
      grid[rowIndex] = pattern;
      backtrack(rowIndex + 1);
    }
  };

  backtrack(0);

  if (solutionCount === 0) return "解なし";
  if (solutionCount === 1) return "一意解";
  return "複数解";
};

export const hoge = () => {
  // --- 使用例 ---
  // 5x5 のシンプルな例
  const rowHints = [[1], [3], [5], [3], [1]];
  const colHints = [[1], [3], [5], [3], [1]];
  console.log(solveNonogram(rowHints, colHints)); // -> "一意解"

  // console.log(
  //   checkColumns(
  //     [
  //       [0, 0, 1, 0, 0],
  //       [0, 1, 1, 1, 0],
  //       [1, 1, 1, 1, 1],
  //       [0, 1, 1, 1, 0],
  //       // [0, 0, 1, 0, 0],
  //       [null, null, null, null, null],
  //     ],
  //     [[1], [3], [5], [3], [1]]
  //   )
  // );
};
