import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const HeadCell: FC<Props> = ({ children }) => {
  return (
    <th className="p-0 border bg-slate-200 [&:nth-child(5n+7)]:border-l-2 first:border-r-2 first:px-2 first:text-end [&:not(:first-child)]:py-1 ">
      {children}
    </th>
  );
};
