import React, { HTMLAttributes } from "react";

import { ArrowUp, ArrowDown } from "lucide-react";

import type {
  CharacterSorting,
  MediaSorting,
  SortingOrder,
} from "~/utils/types.ts";

const Sort = ({
  name,
  order,
  sorting,
  setSorting,
  setOrder,
  children,
  ...props
}: {
  name: CharacterSorting | MediaSorting;
  sorting: CharacterSorting | MediaSorting;
  order: SortingOrder;
  setSorting: (value: CharacterSorting & MediaSorting) => void;
  setOrder: (value: SortingOrder) => void;
} & HTMLAttributes<HTMLElement>) => {
  return (
    <i
      className={"basis-full flex flex-row gap-1 cursor-pointer"}
      {...props}
      onClick={() => {
        if (sorting !== name) {
          setOrder("desc");
        } else {
          setOrder(order === "asc" ? "desc" : "asc");
        }

        setSorting(name as CharacterSorting & MediaSorting);
      }}
    >
      {children}
      {sorting === name ? (
        order === "desc" ? (
          <ArrowDown className={"w-[18px] h-auto"} />
        ) : (
          <ArrowUp className={"w-[18px] h-auto"} />
        )
      ) : undefined}
    </i>
  );
};

export default Sort;
