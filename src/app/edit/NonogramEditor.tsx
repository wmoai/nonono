"use client";

import { ChangeEventHandler, FC, useCallback, useState } from "react";

import {
  NonogramCell,
  NonogramPuzzle,
  NonogramSize,
  nonogramSizes,
} from "@/nonogram/NonogramPuzzle";
import { NonogramSolver } from "@/nonogram/NonogramSolver";

import { NonogramUI } from "./NonogramUI";

export const NonogramEditor: FC = () => {
  const [size, setSize] = useState<NonogramSize>(nonogramSizes[1]);
  const [puzzle, setPuzzle] = useState<NonogramPuzzle>(NonogramPuzzle.createBlank(size));
  const [drawCell, setDrawCell] = useState<NonogramCell>(null);
  const [history, setHistory] = useState<NonogramPuzzle["grid"][]>([]);

  const handleChangeSize: ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
    const size = Number(e.target.value) as NonogramSize;
    setSize(size);
    setPuzzle(NonogramPuzzle.createBlank(size));
    setHistory([]);
  }, []);

  const handleUndo = () => {
    const previousGrid = history.at(-1);
    if (!previousGrid) {
      return;
    }

    setHistory(history.slice(0, -1));
    setPuzzle(puzzle.setGrid(previousGrid));
    setDrawCell(null);
  };

  return (
    <div>
      <div>
        size:
        <select value={size} onChange={handleChangeSize}>
          {nonogramSizes.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <NonogramUI
        puzzle={puzzle}
        onPushStart={({ x, y, cell }) => {
          const newCell = cell === "o" ? null : "o";
          setHistory([...history, puzzle.grid]);
          setPuzzle(puzzle.setCell({ x, y, cell: newCell }).updateHintByGrid());
          setDrawCell(newCell);
        }}
        onPushMove={({ x, y }) => {
          setPuzzle(puzzle.setCell({ x, y, cell: drawCell }).updateHintByGrid());
        }}
      />
      <button type="button" onClick={handleUndo} disabled={history.length === 0}>
        元に戻す
      </button>
      <button
        type="button"
        onClick={() => {
          const solver = new NonogramSolver(puzzle.hint);
          console.time("solver");
          console.log(solver.checkUniqueSolution());
          console.timeEnd("solver");
        }}
      >
        解析
      </button>
    </div>
  );
};
