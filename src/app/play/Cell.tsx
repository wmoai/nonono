import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Cell: FC<Props> = ({ children }) => {
  return (
    <td className="border p-0 [&:nth-child(5n+7)]:border-l-2">
      <div className="flex">{children}</div>
    </td>
  );
};
