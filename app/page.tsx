"use client";

import Background from "@/components/Background";
import Config from "@/components/config";
import Loader from "@/components/Loader";
import { config } from "@/lib/webgpu/slime";
import { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const [startConfig, setStartConfig] = useState(config.default);

  useEffect(() => {
    const savedConfig = localStorage.getItem("config");
    if (savedConfig) {
      setStartConfig(JSON.parse(savedConfig));
      setLoading(false);
    }
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className="flex size-full">
      <Config
        action={setStartConfig}
        startConfig={startConfig}
        canvasRef={canvasRef}
      />
      <Background config={startConfig} canvasRef={canvasRef} />
    </div>
  );
}
