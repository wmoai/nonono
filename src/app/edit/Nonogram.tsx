import { FC } from "react";

import { Cell } from "./Cell";
import { CellButton } from "./CellButton";
import { HHead } from "./HHead";
import { Row } from "./Row";
import { VHead } from "./VHead";

type Props = {
  size: number;
  hints?: {
    h: number[][];
    v: number[][];
  };
};

export const Nonogram: FC<Props> = ({ size, hints }) => {
  return (
    <table className="select-none border-2 border-solid [&_th]:bg-slate-200 [&_th]:font-normal">
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
                <div key={i} className="w-4 text-center">
                  {num}
                </div>
              ))}
            </HHead>
            {[...Array(size)].map((_, col) => (
              <Cell key={col}>
                <CellButton />
              </Cell>
            ))}
          </Row>
        ))}
      </tbody>
    </table>
  );
};
