import * as lineSolverModule from "./lineSolver";
import { lineToHint } from "./NonogramPuzzle";
import { NonogramSolver } from "./NonogramSolver";

// テスト用の決定的な擬似乱数生成器（線形合同法）。Math.random ではなく
// 固定シードを使い、性能回帰テストの再現性を保つ。
function createDeterministicPuzzle(size: number, density: number, seed: number) {
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => next() < density),
  );
  const rowHints = grid.map(lineToHint);
  const colHints = Array.from({ length: size }, (_, col) =>
    lineToHint(grid.map((row) => row[col])),
  );

  return { row: rowHints, col: colHints };
}

describe("NonogramSolver", () => {
  it("ヒントが矛盾する盤面は解なしと判定する", () => {
    const solver = new NonogramSolver({
      row: [[2, 1], [1, 1], [5], [1, 1], [2, 1]],
      col: [[5], [1, 1], [1], [1, 1], [5]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(0);
    expect(result.hasUniqueSolution).toBe(false);
    expect(result.solution).toBeNull();
  });

  it("複数解を持つ盤面は2件目を検出した時点で非一意と判定する", () => {
    const solver = new NonogramSolver({
      row: [[0], [1], [1], [1], [0]],
      col: [[0], [1], [1], [1], [0]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(2);
    expect(result.hasUniqueSolution).toBe(false);
  });

  it("階段状の盤面は複数解を持つと判定し、解の1つを返す", () => {
    const solver = new NonogramSolver({
      row: [[3], [1, 1], [1, 1], [1, 1], [3]],
      col: [[3], [1, 1], [1, 1], [1, 1], [3]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(2);
    expect(result.hasUniqueSolution).toBe(false);
    expect(result.solution).toEqual([
      [true, true, true, false, false],
      [true, false, false, true, false],
      [true, false, false, false, true],
      [false, true, false, false, true],
      [false, false, true, true, true],
    ]);
  });

  it("全マス黒の盤面は一意解と判定する", () => {
    const solver = new NonogramSolver({
      row: [[2], [2]],
      col: [[2], [2]],
    });

    const result = solver.checkUniqueSolution();

    expect(result).toMatchObject({
      solutionCount: 1,
      hasUniqueSolution: true,
      solution: [
        [true, true],
        [true, true],
      ],
    });
  });

  it("2x2の順列盤面は複数解と判定する", () => {
    const solver = new NonogramSolver({
      row: [[1], [1]],
      col: [[1], [1]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(2);
    expect(result.hasUniqueSolution).toBe(false);
  });

  it("logicallyDeterminedはバックトラック（推測）を一切伴わない、最初のpropagate()だけで確定したセル数を表す", () => {
    // 階段状の盤面：バックトラックによる仮決定と棄却が発生する。
    // 採用・棄却を問わずバックトラック中の確定はすべて巻き戻されるため、
    // 最終的な値は盤面の総セル数（25）を超えない。
    const solver = new NonogramSolver({
      row: [[3], [1, 1], [1, 1], [1, 1], [3]],
      col: [[3], [1, 1], [1, 1], [1, 1], [3]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.logicallyDetermined).toBeLessThanOrEqual(5 * 5);
  });

  it("全マス白の盤面は一意解と判定する", () => {
    const solver = new NonogramSolver({
      row: [[0], [0]],
      col: [[0], [0]],
    });

    const result = solver.checkUniqueSolution();

    expect(result).toMatchObject({
      solutionCount: 1,
      hasUniqueSolution: true,
      solution: [
        [false, false],
        [false, false],
      ],
    });
  });

  it("propagateはバックトラックの各手番で変化した行/列のみ再計算する", () => {
    const solveLineSpy = vi.spyOn(lineSolverModule, "solveLine");
    const puzzle = createDeterministicPuzzle(10, 0.4, 1);
    const solver = new NonogramSolver(puzzle);

    solver.checkUniqueSolution();

    // 全ノードで全行全列(10+10=20)を再計算する旧実装では393回に達する（実測）。
    // 変化した行/列のみ再処理する実装では125回程度（実測）に収まる。
    expect(solveLineSpy.mock.calls.length).toBeLessThan(200);
    solveLineSpy.mockRestore();
  });

  describe("性能回帰", () => {
    // 伝播（propagate）による枝刈りを導入する前は、自由度の高い15x15盤面で
    // 全パターン列挙のやり直しとバックトラックの分岐爆発が重なり、
    // 数分経ってもフリーズすることを実測で確認している。
    it("15x15の低密度盤面を妥当な時間内に解く", () => {
      const puzzle = createDeterministicPuzzle(15, 0.4, 2);
      const solver = new NonogramSolver(puzzle);

      const start = performance.now();
      solver.checkUniqueSolution();
      const elapsed = performance.now() - start;

      // 実測1.1〜1.2s（ローカルで安定）に対し約6倍のマージン。
      // CI等の遅い/ノイズの多い環境でも誤って落ちないよう余裕を持たせている。
      expect(elapsed).toBeLessThan(7_000);
    });

    it("10x10の低密度盤面を高速に解く", () => {
      const puzzle = createDeterministicPuzzle(10, 0.4, 1);
      const solver = new NonogramSolver(puzzle);

      const start = performance.now();
      solver.checkUniqueSolution();
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(1_000);
    });
  });
});
