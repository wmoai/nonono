import { NonogramSolver } from "./NonogramSolver";

// テスト用の決定的な擬似乱数生成器（線形合同法）。Math.random ではなく
// 固定シードを使い、性能回帰テストの再現性を保つ。
function createDeterministicPuzzle(size: number, density: number, seed: number) {
  let state = seed;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  const toHints = (line: boolean[]): number[] => {
    const blocks: number[] = [];
    let current = 0;
    for (const cell of line) {
      if (cell) {
        current++;
      } else if (current > 0) {
        blocks.push(current);
        current = 0;
      }
    }
    if (current > 0) blocks.push(current);
    return blocks.length > 0 ? blocks : [0];
  };

  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => next() < density),
  );
  const rowHints = grid.map(toHints);
  const colHints = Array.from({ length: size }, (_, col) => toHints(grid.map((row) => row[col])));

  return { rowHints, colHints };
}

describe("NonogramSolver", () => {
  it("ヒントが矛盾する盤面は解なしと判定する", () => {
    const solver = new NonogramSolver({
      rowHints: [
        [2, 1],
        [1, 1],
        [5],
        [1, 1],
        [2, 1],
      ],
      colHints: [[5], [1, 1], [1], [1, 1], [5]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(0);
    expect(result.hasUniqueSolution).toBe(false);
    expect(result.solution).toBeNull();
  });

  it("複数解を持つ盤面は2件目を検出した時点で非一意と判定する", () => {
    const solver = new NonogramSolver({
      rowHints: [[0], [1], [1], [1], [0]],
      colHints: [[0], [1], [1], [1], [0]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(2);
    expect(result.hasUniqueSolution).toBe(false);
  });

  it("階段状の盤面は複数解を持つと判定し、解の1つを返す", () => {
    const solver = new NonogramSolver({
      rowHints: [
        [3],
        [1, 1],
        [1, 1],
        [1, 1],
        [3],
      ],
      colHints: [
        [3],
        [1, 1],
        [1, 1],
        [1, 1],
        [3],
      ],
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
      rowHints: [[2], [2]],
      colHints: [[2], [2]],
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
      rowHints: [[1], [1]],
      colHints: [[1], [1]],
    });

    const result = solver.checkUniqueSolution();

    expect(result.solutionCount).toBe(2);
    expect(result.hasUniqueSolution).toBe(false);
  });

  it("全マス白の盤面は一意解と判定する", () => {
    const solver = new NonogramSolver({
      rowHints: [[0], [0]],
      colHints: [[0], [0]],
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

      expect(elapsed).toBeLessThan(15_000);
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
