import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const HHead: FC<Props> = ({ children }) => {
  return (
    <th className="py-0 text-end">
      <div className="flex min-w-24 justify-end text-xs">{children}</div>
    </th>
  );
};
