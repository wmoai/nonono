interface NonogramPuzzle {
  rowHints: number[][];
  colHints: number[][];
}

interface SolutionResult {
  hasUniqueSolution: boolean;
  solutionCount: number;
  solution: boolean[][] | null;
}

class NonogramSolver {
  private rows: number;
  private cols: number;
  private rowHints: number[][];
  private colHints: number[][];
  private grid: (boolean | null)[][];
  private solutionCount: number = 0;
  private firstSolution: boolean[][] | null = null;

  constructor(puzzle: NonogramPuzzle) {
    this.rowHints = puzzle.rowHints;
    this.colHints = puzzle.colHints;
    this.rows = puzzle.rowHints.length;
    this.cols = puzzle.colHints.length;
    this.grid = Array(this.rows)
      .fill(null)
      .map(() => Array(this.cols).fill(null));
  }

  public checkUniqueSolution(): SolutionResult {
    this.solutionCount = 0;
    this.firstSolution = null;

    this.backtrack(0, 0);

    return {
      hasUniqueSolution: this.solutionCount === 1,
      solutionCount: this.solutionCount,
      solution: this.firstSolution,
    };
  }

  private backtrack(row: number, col: number): void {
    // 2つ以上解が見つかったら早期終了
    if (this.solutionCount >= 2) {
      return;
    }

    // 全セルを処理完了した場合
    if (row === this.rows) {
      if (this.isValidSolution()) {
        this.solutionCount++;
        if (this.solutionCount === 1) {
          // 最初の解を保存
          this.firstSolution = this.grid.map((row) => row.map((cell) => cell === true));
        }
      }
      return;
    }

    // 次のセルの座標を計算
    const nextRow = col === this.cols - 1 ? row + 1 : row;
    const nextCol = col === this.cols - 1 ? 0 : col + 1;

    // セルを黒（true）にする場合を試行
    this.grid[row][col] = true;
    if (this.isValidPartial(row, col)) {
      this.backtrack(nextRow, nextCol);
    }

    // 2つ以上解が見つかったら早期終了
    if (this.solutionCount >= 2) {
      return;
    }

    // セルを白（false）にする場合を試行
    this.grid[row][col] = false;
    if (this.isValidPartial(row, col)) {
      this.backtrack(nextRow, nextCol);
    }

    // バックトラック：セルを未確定状態に戻す
    this.grid[row][col] = null;
  }

  // 部分的な状態での妥当性チェック
  private isValidPartial(row: number, col: number): boolean {
    // 現在の行が完成している場合、行のヒントをチェック
    if (col === this.cols - 1) {
      if (!this.isRowValid(row)) return false;
    }

    // 現在の列が完成している場合、列のヒントをチェック
    if (row === this.rows - 1) {
      if (!this.isColValid(col)) return false;
    }

    return true;
  }

  // 完全な解の妥当性チェック
  private isValidSolution(): boolean {
    // 全ての行をチェック
    for (let row = 0; row < this.rows; row++) {
      if (!this.isRowValid(row)) return false;
    }

    // 全ての列をチェック
    for (let col = 0; col < this.cols; col++) {
      if (!this.isColValid(col)) return false;
    }

    return true;
  }

  // 行のヒントとの一致をチェック
  private isRowValid(row: number): boolean {
    const blocks = this.getBlocks(this.grid[row]);
    const normalizedHints = this.normalizeHints(this.rowHints[row]);
    return this.arraysEqual(blocks, normalizedHints);
  }

  // 列のヒントとの一致をチェック
  private isColValid(col: number): boolean {
    const column = this.grid.map((row) => row[col]);
    const blocks = this.getBlocks(column);
    const normalizedHints = this.normalizeHints(this.colHints[col]);
    return this.arraysEqual(blocks, normalizedHints);
  }

  // セルの配列から連続する黒いブロックの長さを取得
  private getBlocks(line: (boolean | null)[]): number[] {
    const blocks: number[] = [];
    let currentBlock = 0;

    for (const cell of line) {
      if (cell === true) {
        currentBlock++;
      } else if (currentBlock > 0) {
        blocks.push(currentBlock);
        currentBlock = 0;
      }
    }

    if (currentBlock > 0) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  // ヒントを正規化（[0] を [] に変換）
  private normalizeHints(hints: number[]): number[] {
    if (hints.length === 1 && hints[0] === 0) {
      return [];
    }
    return hints;
  }

  // 配列の比較
  private arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  }

  // グリッドの表示用（デバッグ用）
  public printSolution(): void {
    if (!this.firstSolution) {
      console.log("解が見つかりませんでした");
      return;
    }

    console.log("解:");
    for (const row of this.firstSolution) {
      console.log(row.map((cell) => (cell ? "■" : "□")).join(""));
    }
  }
}

// 使用例
export function example() {
  // 5x5の簡単なパズル例
  const puzzle: NonogramPuzzle = {
    // rowHints: [[1], [3], [5], [3], [1]],
    // colHints: [[1], [3], [5], [3], [1]],
    rowHints: [[0], [1], [1], [1], [0]],
    colHints: [[0], [1], [1], [1], [0]],
  };

  const solver = new NonogramSolver(puzzle);
  const result = solver.checkUniqueSolution();

  console.log(`解の数: ${result.solutionCount}`);
  console.log(`一意解?: ${result.hasUniqueSolution}`);

  if (result.solution) {
    solver.printSolution();
  }

  return result;
}

export { NonogramSolver };
