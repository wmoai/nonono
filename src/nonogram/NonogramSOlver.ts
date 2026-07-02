interface NonogramPuzzle {
  rowHints: number[][];
  colHints: number[][];
}

interface SolutionResult {
  hasUniqueSolution: boolean;
  solutionCount: number;
  solution: boolean[][] | null;
  logicallyDetermined?: number; // 論理的に確定したセルの数
}

interface LinePattern {
  pattern: (boolean | null)[];
  isComplete: boolean;
}

class NonogramSolver {
  private rowCount: number;
  private colCount: number;
  private rowHints: number[][];
  private colHints: number[][];
  private grid: (boolean | null)[][];
  private solutionCount: number = 0;
  private firstSolution: boolean[][] | null = null;
  private logicallyDeterminedCount: number = 0;

  constructor(puzzle: NonogramPuzzle) {
    this.rowHints = puzzle.rowHints;
    this.colHints = puzzle.colHints;
    this.rowCount = puzzle.rowHints.length;
    this.colCount = puzzle.colHints.length;
    this.grid = Array(this.rowCount)
      .fill(null)
      .map(() => Array(this.colCount).fill(null));
  }

  // メイン関数：解の一意性を判定
  public checkUniqueSolution(): SolutionResult {
    this.solutionCount = 0;
    this.firstSolution = null;
    this.logicallyDeterminedCount = 0;

    // 論理的推論による初期確定
    this.performLogicalDeduction();

    // 残りの未確定セルをバックトラッキングで探索
    const firstUnknown = this.findFirstUnknownCell();
    if (firstUnknown) {
      this.backtrack(firstUnknown.row, firstUnknown.col);
    } else {
      // 全て論理的に確定した場合
      if (this.isValidSolution()) {
        this.solutionCount = 1;
        this.firstSolution = this.grid.map((row) => row.map((cell) => cell === true));
      }
    }

    return {
      hasUniqueSolution: this.solutionCount === 1,
      solutionCount: this.solutionCount,
      solution: this.firstSolution,
      logicallyDetermined: this.logicallyDeterminedCount,
    };
  }

  // 論理的推論による確定処理
  private performLogicalDeduction(): void {
    let changed = true;
    let iterations = 0;
    const maxIterations = 100; // 無限ループ防止

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // 各行を処理
      for (let row = 0; row < this.rowCount; row++) {
        const newPattern = this.deduceLinePattern(
          this.grid[row],
          this.normalizeHints(this.rowHints[row]),
        );

        if (this.applyPattern(row, -1, newPattern.pattern)) {
          changed = true;
        }
      }

      // 各列を処理
      for (let col = 0; col < this.colCount; col++) {
        const column = this.grid.map((row) => row[col]);
        const newPattern = this.deduceLinePattern(column, this.normalizeHints(this.colHints[col]));

        if (this.applyPattern(-1, col, newPattern.pattern)) {
          changed = true;
        }
      }
    }
  }

  // 一行（または一列）に対する論理的推論
  private deduceLinePattern(currentLine: (boolean | null)[], hints: number[]): LinePattern {
    const length = currentLine.length;

    // 全ての可能な配置を生成
    const validPatterns = this.generateValidPatterns(length, hints);

    // 現在の状態と矛盾しない配置のみを抽出
    const compatiblePatterns = validPatterns.filter((pattern) =>
      this.isPatternCompatible(pattern, currentLine),
    );

    if (compatiblePatterns.length === 0) {
      // 矛盾している場合（通常は発生しない）
      return { pattern: currentLine, isComplete: false };
    }

    // 全ての互換性のある配置で共通して確定している部分を抽出
    const deducedPattern: (boolean | null)[] = Array(length).fill(null);

    for (let i = 0; i < length; i++) {
      const values = compatiblePatterns.map((pattern) => pattern[i]);
      const allSame = values.every((val) => val === values[0]);

      if (allSame) {
        deducedPattern[i] = values[0];
      } else {
        deducedPattern[i] = currentLine[i]; // 既存の値を保持
      }
    }

    return {
      pattern: deducedPattern,
      isComplete: compatiblePatterns.length === 1,
    };
  }

  // 指定された長さとヒントに対する全ての有効な配置を生成
  private generateValidPatterns(length: number, hints: number[]): boolean[][] {
    if (hints.length === 0) {
      return [Array(length).fill(false)];
    }

    const patterns: boolean[][] = [];
    this.generatePatternsRecursive(length, hints, 0, [], patterns);
    return patterns;
  }

  // 再帰的にパターンを生成
  private generatePatternsRecursive(
    length: number,
    hints: number[],
    hintIndex: number,
    currentPattern: boolean[],
    allPatterns: boolean[][],
  ): void {
    if (hintIndex === hints.length) {
      // 全てのヒントを配置完了
      const pattern = [...currentPattern, ...Array(length - currentPattern.length).fill(false)];
      allPatterns.push(pattern);
      return;
    }

    const blockSize = hints[hintIndex];
    const remainingHints = hints.slice(hintIndex + 1);
    const minSpaceNeeded =
      remainingHints.reduce((sum, size) => sum + size, 0) + remainingHints.length;
    const maxStartPos = length - blockSize - minSpaceNeeded;

    for (let startPos = currentPattern.length; startPos <= maxStartPos; startPos++) {
      const newPattern = [...currentPattern];

      // 空白を追加
      while (newPattern.length < startPos) {
        newPattern.push(false);
      }

      // ブロックを追加
      for (let i = 0; i < blockSize; i++) {
        newPattern.push(true);
      }

      // 次のブロックとの間に最低1つの空白を確保（最後のブロックでなければ）
      if (hintIndex < hints.length - 1) {
        newPattern.push(false);
      }

      this.generatePatternsRecursive(length, hints, hintIndex + 1, newPattern, allPatterns);
    }
  }

  // パターンが現在の状態と矛盾しないかチェック
  private isPatternCompatible(pattern: boolean[], currentLine: (boolean | null)[]): boolean {
    return pattern.every((val, i) => currentLine[i] === null || currentLine[i] === val);
  }

  // パターンをグリッドに適用
  private applyPattern(row: number, col: number, pattern: (boolean | null)[]): boolean {
    let changed = false;

    if (row >= 0) {
      // 行に適用
      for (let c = 0; c < this.colCount; c++) {
        if (this.grid[row][c] === null && pattern[c] !== null) {
          this.grid[row][c] = pattern[c];
          this.logicallyDeterminedCount++;
          changed = true;
        }
      }
    } else if (col >= 0) {
      // 列に適用
      for (let r = 0; r < this.rowCount; r++) {
        if (this.grid[r][col] === null && pattern[r] !== null) {
          this.grid[r][col] = pattern[r];
          this.logicallyDeterminedCount++;
          changed = true;
        }
      }
    }

    return changed;
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

  // バックトラッキング実装（改良版）
  private backtrack(row: number, col: number): void {
    // 2つ以上解が見つかったら早期終了
    if (this.solutionCount >= 2) return;

    // 次の未確定セルを探す
    const nextUnknown = this.findNextUnknownCell(row, col);

    if (!nextUnknown) {
      // 全セル確定、解をチェック
      if (this.isValidSolution()) {
        this.solutionCount++;
        if (this.solutionCount === 1) {
          this.firstSolution = this.grid.map((row) => row.map((cell) => cell === true));
        }
      }
      return;
    }

    const { row: nextRow, col: nextCol } = nextUnknown;

    // セルを黒（true）にする場合を試行
    this.grid[nextRow][nextCol] = true;
    if (this.isValidPartial(nextRow, nextCol)) {
      this.backtrack(nextRow, nextCol);
    }

    // 2つ以上解が見つかったら早期終了
    if (this.solutionCount >= 2) {
      this.grid[nextRow][nextCol] = null;
      return;
    }

    // セルを白（false）にする場合を試行
    this.grid[nextRow][nextCol] = false;
    if (this.isValidPartial(nextRow, nextCol)) {
      this.backtrack(nextRow, nextCol);
    }

    // バックトラック
    this.grid[nextRow][nextCol] = null;
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

  // 部分的な状態での妥当性チェック
  private isValidPartial(row: number, col: number): boolean {
    // 現在の行の妥当性をチェック（部分的な場合も考慮）
    if (!this.isRowPartiallyValid(row)) return false;

    // 現在の列の妥当性をチェック（部分的な場合も考慮）
    if (!this.isColPartiallyValid(col)) return false;

    return true;
  }

  // 行の部分的な妥当性チェック
  private isRowPartiallyValid(row: number): boolean {
    const line = this.grid[row];
    const hints = this.normalizeHints(this.rowHints[row]);

    // 行が完全に確定している場合は完全チェック
    if (line.every((cell) => cell !== null)) {
      return this.isRowValid(row);
    }

    // 部分的な場合は、現在の状態が有効な配置の一部になりうるかチェック
    const validPatterns = this.generateValidPatterns(this.colCount, hints);
    return validPatterns.some((pattern) => this.isPatternCompatible(pattern, line));
  }

  // 列の部分的な妥当性チェック
  private isColPartiallyValid(col: number): boolean {
    const line = this.grid.map((row) => row[col]);
    const hints = this.normalizeHints(this.colHints[col]);

    // 列が完全に確定している場合は完全チェック
    if (line.every((cell) => cell !== null)) {
      return this.isColValid(col);
    }

    // 部分的な場合は、現在の状態が有効な配置の一部になりうるかチェック
    const validPatterns = this.generateValidPatterns(this.rowCount, hints);
    return validPatterns.some((pattern) => this.isPatternCompatible(pattern, line));
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
