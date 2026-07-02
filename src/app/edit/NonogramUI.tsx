import { FC, useState } from "react";

import { NonogramCell, NonogramPuzzle } from "@/nonogram/NonogramPuzzle";

import { Cell } from "./Cell";
import { HHead } from "./HHead";
import { Row } from "./Row";
import { VHead } from "./VHead";

type PositionCell = {
  x: number;
  y: number;
  cell: NonogramCell;
};

type Props = {
  puzzle: NonogramPuzzle;
  onPushStart?: (args: PositionCell) => void;
  onPushMove?: (args: PositionCell) => void;
  onPushEnd?: (args?: PositionCell) => void;
};

export const NonogramUI: FC<Props> = ({ puzzle, onPushStart, onPushEnd, onPushMove }) => {
  const [isPushing, setIsPushing] = useState(false);

  return (
    <table
      className="border-2 border-solid select-none [&_th]:bg-slate-200 [&_th]:font-normal"
      onPointerLeave={() => {
        if (isPushing) {
          setIsPushing(false);
          onPushEnd?.();
        }
      }}
    >
      <thead className="">
        <Row>
          <VHead />
          {[...Array(puzzle.size)].map((_, col) => (
            <VHead key={col}>
              {puzzle.hint.col.at(col)?.map((num, i) => (
                <div key={i}>{num}</div>
              ))}
            </VHead>
          ))}
        </Row>
      </thead>
      <tbody>
        {[...Array(puzzle.size)].map((_, row) => (
          <Row key={row}>
            <HHead>
              {puzzle.hint.row.at(row)?.map((num, i) => (
                <div key={i} className="w-3.5 text-center">
                  {num}
                </div>
              ))}
            </HHead>
            {[...Array(puzzle.size)].map((_, col) => {
              const position = {
                x: col,
                y: row,
              };
              const cell = puzzle.grid.at(row)?.at(col) ?? null;

              return (
                <Cell
                  key={col}
                  cell={cell}
                  onPointerDown={() => {
                    setIsPushing(true);
                    onPushStart?.({ ...position, cell });
                  }}
                  onPointerOver={() => {
                    if (isPushing) {
                      onPushMove?.({ ...position, cell });
                    }
                  }}
                  onPointerUp={() => {
                    setIsPushing(false);
                    onPushEnd?.({ ...position, cell });
                  }}
                />
              );
            })}
          </Row>
        ))}
      </tbody>
    </table>
  );
};
