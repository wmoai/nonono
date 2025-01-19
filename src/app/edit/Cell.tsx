import { FC } from "react";

import { VBorder } from "./VBorder";
import { Cell as CellType } from "./nonogram";

type Props = {
  state?: CellType["state"];
  onPointerDown?: () => void;
  onPointerOver?: () => void;
  onPointerUp?: () => void;
};

export const Cell: FC<Props> = ({
  state,
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
          {state === "o" && <div className="absolute inset-0 bg-mark" />}
          {state === "x" && (
            <div className="[&>*]:absolute [&>*]:inset-x-0 [&>*]:h-px [&>*]:bg-mark">
              <div className="skew-y-[-45deg]" />
              <div className="skew-y-[45deg]" />
            </div>
          )}
        </button>
      </div>
    </td>
  );
};
