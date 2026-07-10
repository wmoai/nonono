import { solveLine } from "./lineSolver";

describe("solveLine", () => {
  it("空ヒントの行は全マス白で確定する", () => {
    const result = solveLine([null, null, null, null], []);
    expect(result).toEqual({ pattern: [false, false, false, false], feasible: true });
  });

  it("空ヒントの行に黒マスが既知だと矛盾する", () => {
    const result = solveLine([null, true, null], []);
    expect(result.feasible).toBe(false);
  });

  it("1ブロックが行を完全に占める場合は全マス確定する", () => {
    const result = solveLine([null, null, null], [3]);
    expect(result).toEqual({ pattern: [true, true, true], feasible: true });
  });

  it("自由度ゼロの複数ブロックは全マス確定する", () => {
    const result = solveLine([null, null, null, null], [2, 1]);
    expect(result).toEqual({ pattern: [true, true, false, true], feasible: true });
  });

  it("自由度がある場合は共通して確定するマスのみ確定する", () => {
    const result = solveLine([null, null, null, null, null], [2, 1]);
    expect(result).toEqual({ pattern: [null, true, null, null, null], feasible: true });
  });

  it("両端が既知の場合、両立する配置が1つに絞られる", () => {
    const result = solveLine([true, null, null, null, true], [2, 1]);
    expect(result).toEqual({ pattern: [true, true, false, false, true], feasible: true });
  });

  it("既知マスと両立する配置が存在しない場合は矛盾する", () => {
    const result = solveLine([true, false, null, null, null], [3]);
    expect(result.feasible).toBe(false);
  });

  it("自由度が大きい場合は何も確定しないこともある", () => {
    const result = solveLine([null, null, null, null, null], [1, 1]);
    expect(result).toEqual({
      pattern: [null, null, null, null, null],
      feasible: true,
    });
  });

  it("長さ1でヒントなしは白マスに確定する", () => {
    const result = solveLine([null], []);
    expect(result).toEqual({ pattern: [false], feasible: true });
  });

  it("長さ1で1マスブロックは黒マスに確定する", () => {
    const result = solveLine([null], [1]);
    expect(result).toEqual({ pattern: [true], feasible: true });
  });

  it("長さ1で既知マスと矛盾する場合は矛盾する", () => {
    const result = solveLine([false], [1]);
    expect(result.feasible).toBe(false);
  });
});
