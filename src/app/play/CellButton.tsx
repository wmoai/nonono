import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const CellButton: FC<Props> = ({ children }) => {
  return (
    <button type="button" className="size-6 aria-pressed:bg-black">
      {children}
    </button>
  );
};
