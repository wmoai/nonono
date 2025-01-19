import { FC, ReactNode } from "react";

import { VBorder } from "./VBorder";

type Props = {
  children?: ReactNode;
};

export const VHead: FC<Props> = ({ children }) => {
  return (
    <th className="group relative px-0 py-0.5 tracking-tighter">
      <VBorder />
      <div className="flex min-h-24 min-w-4 flex-col justify-end text-xs leading-4">
        {children}
      </div>
    </th>
  );
};
