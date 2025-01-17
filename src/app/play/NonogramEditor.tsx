"use client";

import { FC, useState } from "react";

import { Nonogram } from "./Nonogram";

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
      <Nonogram
        size={size}
        hints={{
          h: [
            [1, 11],
            [1, 1, 1],
          ],
          v: [
            [1, 11],
            [1, 1, 1],
          ],
        }}
      />
    </div>
  );
};
