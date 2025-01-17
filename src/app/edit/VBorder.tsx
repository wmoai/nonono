import { FC } from "react";

export const VBorder: FC = () => (
  <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-border group-first:hidden group-[&:nth-child(5n+2)]:-left-px group-[&:nth-child(5n+2)]:w-[2px]" />
);
