"use client";

import { FC, useState } from "react";
import { Row } from "./Row";
import { Cell } from "./Cell";
import { CellButton } from "./CellButton";
import { VHead } from "./VHead";
import { HHead } from "./HHead";

const sizes = [5, 10, 15, 20];

export const NonogramEditor: FC = () => {
  const [size, setSize] = useState(sizes[2]);

  return (
    <div>
      <div>
        size:
        <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
          {sizes.map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <table className="border-2 border-solid select-none [&_th]:bg-slate-200">
        <thead className="border-b-2">
          <Row>
            <VHead />
            {[...Array(size)].map((_, col) => (
              <VHead key={col}></VHead>
            ))}
          </Row>
        </thead>
        <tbody>
          {[...Array(size)].map((_, row) => (
            <Row key={row}>
              <HHead></HHead>
              {[...Array(size)].map((_, col) => (
                <Cell key={col}>
                  <CellButton></CellButton>
                </Cell>
              ))}
            </Row>
          ))}
        </tbody>
      </table>
    </div>
  );
};
