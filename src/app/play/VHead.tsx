import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const VHead: FC<Props> = ({ children }) => {
  return (
    <th className="px-0 py-2 [&:nth-child(5n+2)]:border-l-2">
      <div className="min-h-24 min-w-4">{children}</div>
    </th>
  );
};
