import { FC, ReactNode } from "react";

import { VBorder } from "./VBorder";

type Props = {
  children?: ReactNode;
};

export const Cell: FC<Props> = ({ children }) => {
  return (
    <td className="group relative p-0">
      <VBorder />
      <div className="flex">{children}</div>
    </td>
  );
};
