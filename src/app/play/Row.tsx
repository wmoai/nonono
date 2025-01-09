import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Row: FC<Props> = ({ children }) => {
  return <tr className="border [&:nth-child(5n+6)]:border-t-2">{children}</tr>;
};
