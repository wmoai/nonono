import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const HHead: FC<Props> = ({ children }) => {
  return (
    <th className="py-0 px-2 border border-r-2 text-end ">
      <div className="min-w-24">{children}</div>
    </th>
  );
};
