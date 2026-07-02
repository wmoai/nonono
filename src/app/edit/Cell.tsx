import { FC } from "react";

import { NonogramCell } from "@/nonogram/NonogramPuzzle";

import { VBorder } from "./VBorder";

type Props = {
  cell: NonogramCell;
  onPointerDown?: () => void;
  onPointerOver?: () => void;
  onPointerUp?: () => void;
};

export const Cell: FC<Props> = ({
  cell,
  onPointerDown,
  onPointerOver,
  onPointerUp,
}) => {
  return (
    <td className="group relative p-0">
      <VBorder />
      <div className="flex">
        <button
          type="button"
          className="relative size-6"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerOver}
          onPointerUp={onPointerUp}
        >
          {cell === "o" && <div className="absolute inset-0 bg-mark" />}
          {cell === "x" && (
            <div className="*:absolute *:inset-x-0 *:h-px *:bg-mark">
              <div className="skew-y-[-45deg]" />
              <div className="skew-y-45" />
            </div>
          )}
        </button>
      </div>
    </td>
  );
};
