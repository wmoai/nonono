import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const HHead: FC<Props> = ({ children }) => {
  return (
    <th className="px-2 py-0 text-end">
      <div className="min-w-24">{children}</div>
    </th>
  );
};
