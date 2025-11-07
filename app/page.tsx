"use client";

import SlimeSim from "@/components/Background";
import Config from "@/components/config";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { WebGPUError } from "@/lib/webgpu";
import { config } from "@/lib/webgpu/slime";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import infoIcon from "@/public/icons/information.svg";

// TODO:
// - Responsive

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
      <div className="flex size-full relative">
        <Link
          href="/info"
          className="absolute p-4 right-0 top-0"
          title="Information"
        >
          <div
            dangerouslySetInnerHTML={{ __html: infoIcon }}
            className="size-8 fill-white"
          />
        </Link>
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
