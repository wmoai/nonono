import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

// return <tr className="border [&:nth-child(5n+6)]:border-t-2">{children}</tr>;
export const Row: FC<Props> = ({ children }) => {
  return (
    <tr className="relative after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-border [&:nth-child(5n+1)]:after:h-[2px] [&:nth-child(5n+2)]:after:-left-px">
      {children}
    </tr>
  );
};
