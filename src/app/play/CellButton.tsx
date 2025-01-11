import { FC } from "react";

type Props = {
  state?: "o" | "x";
  onPointerDown?: () => void;
  onPointerOver?: () => void;
  onPointerUp?: () => void;
};

export const CellButton: FC<Props> = ({
  state,
  onPointerDown,
  onPointerOver,
  onPointerUp,
}) => {
  return (
    <button
      type="button"
      className="relative size-6"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerOver}
      onPointerUp={onPointerUp}
    >
      {state === "o" && <div className="absolute inset-0 bg-black" />}
      {state === "x" && (
        <div className="[&>*]:absolute [&>*]:inset-x-0 [&>*]:h-px [&>*]:bg-black">
          <div className="skew-y-[-45deg]" />
          <div className="skew-y-[45deg]" />
        </div>
      )}
    </button>
  );
};
