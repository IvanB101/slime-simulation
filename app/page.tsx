"use client";

import SlimeSim from "@/components/SlimeSim";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { WebGPUError } from "@/lib/webgpu";
import { defaults } from "@/lib/webgpu/slime";
import { useEffect, useState } from "react";

let config = defaults;

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WebGPUError | undefined>(undefined);

  useEffect(() => {
    const savedConfig = localStorage.getItem("config");
    if (savedConfig) {
      config = JSON.parse(savedConfig);
    }
    setLoading(false);
  }, []);

  if (error) return <Error error={error} />;

  if (!loading)
    return (
      <div className="flex size-full relative">
        <SlimeSim config={config} setErrorAction={setError} />
      </div>
    );

  return <Loader />;
}
