import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const VHead: FC<Props> = ({ children }) => {
  return (
    <th className="px-0 py-2 border [&:nth-child(5n+2)]:border-l-2">
      <div className="min-w-4 min-h-24">{children}</div>
    </th>
  );
};
