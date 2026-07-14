import { solveLine } from "./lineSolver";
import { lineToHint } from "./NonogramPuzzle";

interface NonogramPuzzle {
  rowHints: number[][];
  colHints: number[][];
}

interface SolutionResult {
  hasUniqueSolution: boolean;
  solutionCount: number;
  solution: boolean[][] | null;
  logicallyDetermined?: number; // バックトラック（推測）を一切伴わない、最初のpropagate()だけで確定したセル数
}

class NonogramSolver {
  private rowCount: number;
  private colCount: number;
  private grid: (boolean | null)[][];
  private solutionCount: number = 0;
  private firstSolution: boolean[][] | null = null;
  private logicallyDeterminedCount: number = 0;
  private readonly normalizedRowHints: number[][];
  private readonly normalizedColHints: number[][];

  constructor(puzzle: NonogramPuzzle) {
    this.rowCount = puzzle.rowHints.length;
    this.colCount = puzzle.colHints.length;
    this.grid = Array(this.rowCount)
      .fill(null)
      .map(() => Array(this.colCount).fill(null));
    this.normalizedRowHints = puzzle.rowHints.map((hints) => this.normalizeHints(hints));
    this.normalizedColHints = puzzle.colHints.map((hints) => this.normalizeHints(hints));
  }

  // メイン関数：解の一意性を判定
  public checkUniqueSolution(): SolutionResult {
    this.solutionCount = 0;
    this.firstSolution = null;
    this.logicallyDeterminedCount = 0;

    // 論理的推論による初期確定。矛盾があれば探索するまでもなく解なし
    if (this.propagate()) {
      const firstUnknown = this.findFirstUnknownCell();
      if (firstUnknown) {
        this.backtrack(firstUnknown.row, firstUnknown.col);
      } else {
        this.recordSolutionIfValid();
      }
    }

    return {
      hasUniqueSolution: this.solutionCount === 1,
      solutionCount: this.solutionCount,
      solution: this.firstSolution,
      logicallyDetermined: this.logicallyDeterminedCount,
    };
  }

  // 論理的推論による確定処理。dirtyRows/dirtyColsが変化しうる行/列（省略時は全行/全列）。
  // 変化した行/列だけを次の波で再処理するワークリスト方式のため、各セルは高々1回しか
  // 未確定→確定にならず反復は有限回で収束する。行/列のいずれかが矛盾したら false を返す
  private propagate(dirtyRows?: Iterable<number>, dirtyCols?: Iterable<number>): boolean {
    let rowsToProcess = new Set<number>(
      dirtyRows ?? Array.from({ length: this.rowCount }, (_, row) => row),
    );
    let colsToProcess = new Set<number>(
      dirtyCols ?? Array.from({ length: this.colCount }, (_, col) => col),
    );

    while (rowsToProcess.size > 0 || colsToProcess.size > 0) {
      const nextDirtyCols = new Set<number>();
      for (const row of rowsToProcess) {
        const { pattern, feasible } = solveLine(this.grid[row], this.normalizedRowHints[row]);
        if (!feasible) return false;

        this.applyPattern(row, -1, pattern, nextDirtyCols);
      }

      const nextDirtyRows = new Set<number>();
      for (const col of colsToProcess) {
        const column = this.grid.map((row) => row[col]);
        const { pattern, feasible } = solveLine(column, this.normalizedColHints[col]);
        if (!feasible) return false;

        this.applyPattern(-1, col, pattern, nextDirtyRows);
      }

      rowsToProcess = nextDirtyRows;
      colsToProcess = nextDirtyCols;
    }

    return true;
  }

  // パターンをグリッドに適用し、新たに確定したセルの直交方向インデックスをdirtyに追加する
  private applyPattern(
    row: number,
    col: number,
    pattern: (boolean | null)[],
    dirty: Set<number>,
  ): void {
    if (row >= 0) {
      // 行に適用
      for (let colIndex = 0; colIndex < this.colCount; colIndex++) {
        if (this.grid[row][colIndex] === null && pattern[colIndex] !== null) {
          this.grid[row][colIndex] = pattern[colIndex];
          this.logicallyDeterminedCount++;
          dirty.add(colIndex);
        }
      }
    } else if (col >= 0) {
      // 列に適用
      for (let rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
        if (this.grid[rowIndex][col] === null && pattern[rowIndex] !== null) {
          this.grid[rowIndex][col] = pattern[rowIndex];
          this.logicallyDeterminedCount++;
          dirty.add(rowIndex);
        }
      }
    }
  }

  // 最初の未確定セルを見つける
  private findFirstUnknownCell(): { row: number; col: number } | null {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        if (this.grid[row][col] === null) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // バックトラッキング実装。1マス仮決定するたびに伝播で波及的に確定・矛盾検出する
  private backtrack(row: number, col: number): void {
    // 2つ以上解が見つかったら早期終了
    if (this.solutionCount >= 2) return;

    // 次の未確定セルを探す
    const nextUnknown = this.findNextUnknownCell(row, col);

    if (!nextUnknown) {
      this.recordSolutionIfValid();
      return;
    }

    const { row: nextRow, col: nextCol } = nextUnknown;

    for (const value of [true, false]) {
      if (this.solutionCount >= 2) return;

      const wasNull = this.snapshotNullCells();
      // 採用・棄却を問わず、この分岐で確定したセルはループの最後で必ず巻き戻す。
      // これによりlogicallyDeterminedCountは推測を一切伴わない確定数のみを表し続ける。
      const determinedBeforeGuess = this.logicallyDeterminedCount;
      this.grid[nextRow][nextCol] = value;

      if (this.propagate([nextRow], [nextCol])) {
        const filled = this.findFirstUnknownCell();
        if (filled) {
          this.backtrack(filled.row, filled.col);
        } else {
          this.recordSolutionIfValid();
        }
      }

      this.restoreNullCells(wasNull);
      this.logicallyDeterminedCount = determinedBeforeGuess;
    }
  }

  // 解として確定した場合にカウント・記録する
  private recordSolutionIfValid(): void {
    if (this.isValidSolution()) {
      this.solutionCount++;
      if (this.solutionCount === 1) {
        this.firstSolution = this.grid.map((row) => row.map((cell) => cell === true));
      }
    }
  }

  // 未確定セルのスナップショットを取る（伝播で新たに確定したセルのアンドゥ用）
  private snapshotNullCells(): boolean[][] {
    return this.grid.map((row) => row.map((cell) => cell === null));
  }

  // スナップショット時点で未確定だったセルのみ null に戻す
  private restoreNullCells(wasNull: boolean[][]): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        if (wasNull[row][col]) {
          this.grid[row][col] = null;
        }
      }
    }
  }

  // 指定位置以降の次の未確定セルを探す
  private findNextUnknownCell(
    startRow: number,
    startCol: number,
  ): { row: number; col: number } | null {
    for (let row = startRow; row < this.rowCount; row++) {
      const colStart = row === startRow ? startCol : 0;
      for (let col = colStart; col < this.colCount; col++) {
        if (this.grid[row][col] === null) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // 完全な解の妥当性チェック
  private isValidSolution(): boolean {
    // 全ての行をチェック
    for (let row = 0; row < this.rowCount; row++) {
      if (!this.isRowValid(row)) return false;
    }

    // 全ての列をチェック
    for (let col = 0; col < this.colCount; col++) {
      if (!this.isColValid(col)) return false;
    }

    return true;
  }

  // 行のヒントとの一致をチェック
  private isRowValid(row: number): boolean {
    const blocks = this.normalizeHints(lineToHint(this.grid[row].map((cell) => cell === true)));
    return this.arraysEqual(blocks, this.normalizedRowHints[row]);
  }

  // 列のヒントとの一致をチェック
  private isColValid(col: number): boolean {
    const column = this.grid.map((row) => row[col]);
    const blocks = this.normalizeHints(lineToHint(column.map((cell) => cell === true)));
    return this.arraysEqual(blocks, this.normalizedColHints[col]);
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

  // 現在のグリッド状態を表示（デバッグ用）
  public printCurrentGrid(): void {
    console.log("現在のグリッド状態:");
    for (const row of this.grid) {
      console.log(row.map((cell) => (cell === true ? "■" : cell === false ? "□" : "?")).join(""));
    }
  }
}

// 使用例
export function example() {
  // テストケース1: 複雑なパズル
  const puzzle1: NonogramPuzzle = {
    rowHints: [[2, 1], [1, 1], [5], [1, 1], [2, 1]],
    colHints: [[5], [1, 1], [1], [1, 1], [5]],
  };

  // テストケース2: 空のヒント（[0]）を含むパズル
  const puzzle2: NonogramPuzzle = {
    rowHints: [[0], [1], [1], [1], [0]],
    colHints: [[0], [1], [1], [1], [0]],
  };

  // テストケース3: より大きなパズル
  const puzzle3: NonogramPuzzle = {
    rowHints: [[3], [1, 1], [1, 1], [1, 1], [3]],
    colHints: [[3], [1, 1], [1, 1], [1, 1], [3]],
  };

  console.log("=== テストケース1 ===");
  const solver1 = new NonogramSolver(puzzle1);
  const result1 = solver1.checkUniqueSolution();
  console.log(`解の数: ${result1.solutionCount}`);
  console.log(`一意解?: ${result1.hasUniqueSolution}`);
  console.log(`論理的に確定: ${result1.logicallyDetermined}セル`);

  console.log("\n=== テストケース2 ===");
  const solver2 = new NonogramSolver(puzzle2);
  const result2 = solver2.checkUniqueSolution();
  console.log(`解の数: ${result2.solutionCount}`);
  console.log(`一意解?: ${result2.hasUniqueSolution}`);
  console.log(`論理的に確定: ${result2.logicallyDetermined}セル`);

  console.log("\n=== テストケース3 ===");
  const solver3 = new NonogramSolver(puzzle3);
  const result3 = solver3.checkUniqueSolution();
  console.log(`解の数: ${result3.solutionCount}`);
  console.log(`一意解?: ${result3.hasUniqueSolution}`);
  console.log(`論理的に確定: ${result3.logicallyDetermined}セル`);

  if (result3.solution) {
    solver3.printSolution();
  }

  return { result1, result2, result3 };
}

// テスト実行
example();

export { NonogramSolver };
