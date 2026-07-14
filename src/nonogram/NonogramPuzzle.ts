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

  setCell({ x, y, cell }: { x: number; y: number; cell: NonogramCell }) {
    const grid = this.grid.map((row, rowIndex) => {
      if (rowIndex !== y) {
        return row;
      }
      return row.map((current, colIndex) => {
        if (colIndex !== x) {
          return current;
        }
        return cell;
      });
    });
    return new NonogramPuzzle({ size: this.size, hint: this.hint, grid });
  }

  updateHintByGrid() {
    // 行ヒント
    const row = this.grid.map((line) => lineToHint(line.map(isBlackCell)));
    // 列ヒント
    const cols = [...Array(this.size)].map((_, index) => this.grid.map((line) => line[index]));
    const col = cols.map((line) => lineToHint(line.map(isBlackCell)));
    return new NonogramPuzzle({ size: this.size, hint: { row, col }, grid: this.grid });
  }

  setGrid(grid: NonogramCell[][]) {
    return new NonogramPuzzle({ size: this.size, hint: this.hint, grid }).updateHintByGrid();
  }
}

const isBlackCell = (cell: NonogramCell): boolean => cell === "o";

// 行（または列）から連続する黒マスの長さを連長エンコードしたヒントを求める
export const lineToHint = (line: boolean[]): number[] => {
  const result: number[] = [];
  let count = 0;
  line.forEach((isBlack) => {
    if (isBlack) {
      count++;
    } else if (count > 0) {
      result.push(count);
      count = 0;
    }
  });
  if (count > 0) {
    result.push(count);
  }
  return result.length === 0 ? [0] : result;
};
