"use client";

import { FC, useState } from "react";

import { Cell } from "./Cell";
import { CellButton } from "./CellButton";
import { HHead } from "./HHead";
import { Row } from "./Row";
import { VHead } from "./VHead";

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
      <table className="select-none border-2 border-solid [&_th]:bg-slate-200">
        <thead className="">
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
                  <CellButton />
                </Cell>
              ))}
            </Row>
          ))}
        </tbody>
      </table>
    </div>
  );
};
