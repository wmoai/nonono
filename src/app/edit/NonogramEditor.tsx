"use client";

import { ChangeEventHandler, FC, useCallback, useState } from "react";

import {
  NonogramCell,
  NonogramPuzzle,
  NonogramSize,
  nonogramSizes,
} from "@/nonogram/NonogramPuzzle";

import { NonogramUI } from "./NonogramUI";

export const NonogramEditor: FC = () => {
  const [size, setSize] = useState<NonogramSize>(nonogramSizes[1]);
  const [puzzle, setPuzzle] = useState<NonogramPuzzle>(NonogramPuzzle.createBlank(size));
  const [drawCell, setDrawCell] = useState<NonogramCell>(null);

  const handleChangeSize: ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
    const size = Number(e.target.value) as NonogramSize;
    setSize(size);
    setPuzzle(NonogramPuzzle.createBlank(size));
  }, []);

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
          setPuzzle(puzzle.setCell({ x, y, cell: newCell }).updateHintByGrid());
          setDrawCell(newCell);
        }}
        onPushMove={({ x, y }) => {
          setPuzzle(puzzle.setCell({ x, y, cell: drawCell }).updateHintByGrid());
        }}
      />
    </div>
  );
};
