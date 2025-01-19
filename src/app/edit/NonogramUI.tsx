import { FC, useState } from "react";

import { Cell } from "./Cell";
import { HHead } from "./HHead";
import { Row } from "./Row";
import { VHead } from "./VHead";
import { Nonogram, Cell as CellType } from "./nonogram";

type Props = {
  size: number;
  hints?: Nonogram["hints"];
  board: Nonogram["board"];
  onPushStart?: (cell: CellType) => void;
  onPushMove?: (cell: CellType) => void;
  onPushEnd?: (cell?: CellType) => void;
};

export const NonogramUI: FC<Props> = ({
  size,
  hints,
  board,
  onPushStart,
  onPushEnd,
  onPushMove,
}) => {
  const [isPushing, setIsPushing] = useState(false);

  return (
    <table
      className="select-none border-2 border-solid [&_th]:bg-slate-200 [&_th]:font-normal"
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
          {[...Array(size)].map((_, col) => (
            <VHead key={col}>
              {hints?.v.at(col)?.map((num, i) => (
                <div key={i}>{num}</div>
              ))}
            </VHead>
          ))}
        </Row>
      </thead>
      <tbody>
        {[...Array(size)].map((_, row) => (
          <Row key={row}>
            <HHead>
              {hints?.h.at(row)?.map((num, i) => (
                <div key={i} className="w-3.5 text-center">
                  {num}
                </div>
              ))}
            </HHead>
            {[...Array(size)].map((_, col) => {
              const cellState = board.at(row)?.at(col);
              const cell = {
                x: row,
                y: col,
                state: cellState ?? null,
              };
              return (
                <Cell
                  key={col}
                  state={cellState}
                  onPointerDown={() => {
                    setIsPushing(true);
                    onPushStart?.(cell);
                  }}
                  onPointerOver={() => {
                    if (isPushing) {
                      onPushMove?.(cell);
                    }
                  }}
                  onPointerUp={() => {
                    setIsPushing(false);
                    onPushEnd?.(cell);
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
