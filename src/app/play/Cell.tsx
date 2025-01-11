import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Cell: FC<Props> = ({ children }) => {
  return (
    <td className="relative p-0 after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-border first:after:hidden [&:nth-child(5n+2)]:after:-left-px [&:nth-child(5n+2)]:after:w-[2px]">
      <div className="flex">{children}</div>
    </td>
  );
};
