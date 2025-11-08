"use client";

import SlimeSim from "@/components/Background";
import Config from "@/components/config";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { WebGPUError } from "@/lib/webgpu";
import { defaults } from "@/lib/webgpu/slime";
import { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [needsRestart, setNeedsRestart] = useState(false);
  const [error, setError] = useState<WebGPUError | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const [startConfig, setStartConfig] = useState(defaults);

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
      <div className="flex size-full relative">
        <Config
          startConfig={startConfig}
          canvasRef={canvasRef}
          needsRestart={needsRestart}
          setNeedsRestartAction={setNeedsRestart}
        />
        <SlimeSim
          config={startConfig}
          canvasRef={canvasRef}
          setErrorAction={setError}
          setNeedsRestartAction={setNeedsRestart}
        />
      </div>
    );

  return <Loader />;
}
