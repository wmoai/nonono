export type NonogramCell = "o" | "x" | null;

export type NonogramHint = {
  row: number[][];
  col: number[][];
};
export const nonogramSizes = [10, 15, 20] as const;
export type NonogramSize = (typeof nonogramSizes)[number];

export class NonogramPuzzle {
  readonly size: NonogramSize;
  readonly hint: NonogramHint;
  readonly grid: NonogramCell[][];

  constructor({
    size,
    hint,
    grid,
  }: {
    size: NonogramSize;
    hint: NonogramHint;
    grid: NonogramCell[][];
  }) {
    this.size = size;
    this.grid = grid;
    this.hint = hint;
  }

  static createPuzzle(hint: NonogramHint) {
    const size = hint.row.length as NonogramSize;
    const grid = [...Array(size)].map(() => [...Array(size)].map(() => null));
    return new NonogramPuzzle({ size, hint, grid });
  }

  static createBlank(size: NonogramSize) {
    const hint = {
      row: Array(size).fill([0]),
      col: Array(size).fill([0]),
    };
    const grid = [...Array(size)].map(() => [...Array(size)].map(() => null));
    return new NonogramPuzzle({ size, hint, grid });
  }

  private clone() {
    return new NonogramPuzzle({
      ...this,
    });
  }

  setCell({ x, y, cell }: { x: number; y: number; cell: NonogramCell }) {
    this.grid[y][x] = cell;
    return this.clone();
  }

  updateHintByGrid() {
    // 行ヒント
    this.hint.row = this.grid.map((row) => lineToHint(row));
    // 列ヒント
    const cols = [...Array(this.size)].map((_, index) =>
      this.grid.map((row) => row[index])
    );
    this.hint.col = cols.map((col) => lineToHint(col));
    return this.clone();
  }
}

const lineToHint = (line: NonogramCell[]): number[] => {
  const result: number[] = [];
  let count = 0;
  line.forEach((cell) => {
    if (cell === "o") {
      count++;
    } else if (count > 0) {
      result.push(count);
      count = 0;
    }
  });
  return result.length === 0 ? [0] : result;
};
