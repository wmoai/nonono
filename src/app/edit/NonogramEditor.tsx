"use client";

import { ChangeEventHandler, FC, useCallback, useState } from "react";

import { NonogramUI } from "./NonogramUI";
import { Cell as CellType, Nonogram } from "./nonogram";

const sizes = [10, 15, 20];

export const NonogramEditor: FC = () => {
  const [size, setSize] = useState(sizes[2]);
  const [nonogram, setNonogram] = useState<Nonogram>(Nonogram.fromSize(size));
  const [drawState, setDrawState] = useState<CellType["state"]>(null);

  const handleChangeSize: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      const size = Number(e.target.value);
      setSize(size);
      setNonogram(Nonogram.fromSize(size));
    },
    []
  );

  return (
    <div>
      <div>
        size:
        <select value={size} onChange={handleChangeSize}>
          {sizes.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <NonogramUI
        size={size}
        hints={nonogram.hints}
        board={nonogram.board}
        onPushStart={(cell) => {
          const state = cell.state === "o" ? null : "o";
          setNonogram(nonogram.setCell(cell.x, cell.y, state));
          setDrawState(state);
        }}
        onPushMove={(cell) => {
          setNonogram(nonogram.setCell(cell.x, cell.y, drawState));
        }}
      />
    </div>
  );
};
