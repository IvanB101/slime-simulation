"use client";

import SlimeSim from "@/components/Background";
import Config from "@/components/config";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { WebGPUError } from "@/lib/webgpu";
import { config } from "@/lib/webgpu/slime";
import { useEffect, useRef, useState } from "react";

// TODO:
// - Explanation

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WebGPUError | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const [startConfig, setStartConfig] = useState(config.default);

  useEffect(() => {
    const savedConfig = localStorage.getItem("config");
    if (savedConfig) {
      setStartConfig(JSON.parse(savedConfig));
    }
    setLoading(false);
  }, []);

  if (error) return <Error error={error} />;

  if (!loading)
    return (
      <div className="flex size-full">
        <Config
          action={setStartConfig}
          startConfig={startConfig}
          canvasRef={canvasRef}
        />
        <SlimeSim
          config={startConfig}
          canvasRef={canvasRef}
          action={setError}
        />
      </div>
    );

  return <Loader />;
}
