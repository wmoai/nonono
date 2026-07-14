import { NonogramPuzzle } from "./NonogramPuzzle";

describe("NonogramPuzzle", () => {
  it("setCell は以前に取得したインスタンスの grid を変化させない", () => {
    const before = NonogramPuzzle.createBlank(10);
    const after = before.setCell({ x: 0, y: 0, cell: "o" });

    expect(before.grid[0][0]).toBeNull();
    expect(after.grid[0][0]).toBe("o");
  });

  it("updateHintByGrid は以前に取得したインスタンスの hint を変化させない", () => {
    const before = NonogramPuzzle.createBlank(10).setCell({ x: 0, y: 0, cell: "o" });
    const after = before.updateHintByGrid();

    expect(before.hint.row[0]).toEqual([0]);
    expect(after.hint.row[0]).toEqual([1]);
  });
});
