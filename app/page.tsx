"use client";

import Background from "@/components/Background";
import Config from "@/components/config";
import { defaultDisplayConfig, defaultSlimeConfig } from "@/lib/webgpu/slime";
import { useRef, useState } from "react";

export default function RootLayout() {
  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const [config, setConfig] = useState({
    slime: {
      ...defaultSlimeConfig,
    },
    display: {
      ...defaultDisplayConfig,
    },
  });

  return (
    <div className="flex size-full">
      <Config action={setConfig} config={config} canvasRef={canvasRef} />
      <Background config={config} canvasRef={canvasRef} />
    </div>
  );
}
