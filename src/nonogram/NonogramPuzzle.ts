type Cell = "o" | "x" | null;

export type NonogramHint = {
  row: number[][];
  col: number[][];
};
type Size = 5 | 10 | 15;

export class NonogramPuzzle {
  readonly size: 5 | 10 | 15;
  readonly hint: NonogramHint;
  private readonly grid: Cell[][];

  constructor({
    size,
    hint,
    grid,
  }: {
    size: Size;
    hint: NonogramHint;
    grid: Cell[][];
  }) {
    this.size = size;
    this.grid = grid;
    this.hint = hint;
  }

  static createPuzzle(hint: NonogramHint) {
    const size = hint.row.length as Size;
    const grid = Array(size).fill(Array(size).fill(null));
    return new NonogramPuzzle({ size, hint, grid });
  }

  static createBlank(size: Size) {
    const hint = {
      row: Array(size).fill([0]),
      col: Array(size).fill([0]),
    };
    const grid = Array(size).fill(Array(size).fill(null));
    return new NonogramPuzzle({ size, hint, grid });
  }

  setCell({ x, y, cell }: { x: number; y: number; cell: Cell }) {
    this.grid[y][x] = cell;
  }
}
