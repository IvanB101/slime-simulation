"use client";

import { ReactNode, useState } from "react";
import downArrow from "@/public/icons/down-arrow.svg";
import upArrow from "@/public/icons/up-arrow.svg";

export default function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div className="flex justify-between">
        <div className="font-bold text-xl px-2">{title}</div>
        <button onClick={() => setOpen(!open)}>
          <div
            className="size-6 mx-2"
            dangerouslySetInnerHTML={{ __html: open ? upArrow : downArrow }}
          ></div>
        </button>
      </div>
      {open && children}
      <div className="h-[1px] mx-2 my-2 bg-gray-500"></div>
    </div>
  );
}
