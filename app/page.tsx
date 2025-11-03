"use client";

import Background from "@/components/Background";
import Config from "@/components/Config";
import { useState } from "react";

export default function RootLayout() {
  const [dummy, setDummy] = useState(false);

  return (
    <>
      <Config setDummy={setDummy} />
      <Background dummy={dummy} />
    </>
  );
}
