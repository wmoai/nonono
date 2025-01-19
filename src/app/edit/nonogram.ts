export type Cell = {
  x: number;
  y: number;
  state: null | "o" | "x";
};

export class Nonogram {
  readonly hints?: {
    h: number[][];
    v: number[][];
  };
  readonly board: Array<Array<Cell["state"]>>;
  readonly size: number;

  private constructor(args: {
    hints: Nonogram["hints"];
    board: Nonogram["board"];
    size: Nonogram["size"];
  }) {
    this.hints = args.hints;
    this.board = args.board;
    this.size = args.size;
  }

  static fromSize(size: number) {
    return new Nonogram({
      hints: {
        h: [...Array(size)].map(() => [0]),
        v: [...Array(size)].map(() => [0]),
      },
      board: [...Array(size)].map(() => [...Array(size)].map(() => null)),
      size,
    });
  }

  private clone(): Nonogram {
    return new Nonogram({
      hints: this.hints,
      board: this.board,
      size: this.size,
    });
  }

  setCell(x: number, y: number, state: Cell["state"]) {
    this.board[x][y] = state;
    return this.clone();
  }
}
