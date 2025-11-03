"use client";

import { useEffect } from "react";
import Loader from "./Loader";
import { initWebGPU, WebGPUContext } from "@/lib/webgpu";
import { slime } from "@/lib/webgpu/slime";

async function initBg(
  context: WebGPUContext,
  canvas: HTMLCanvasElement,
): Promise<() => void> {
  const pixels = 400 * 300;
  const aspect = window.innerWidth / window.innerHeight;

  const size: [number, number] = [
    Math.round(Math.sqrt(pixels * aspect)),
    Math.round(Math.sqrt(pixels / aspect)),
  ];
  const surface = slime(context, canvas, {
    size,
    nAgents: 100000,
  });
  canvas.width = size[0];
  canvas.height = size[1];

  // TODO: add checks for fps
  var handleAnimationFrame: number;
  (function loop() {
    surface.update();
    surface.render();
    handleAnimationFrame = requestAnimationFrame(() => loop());
  })();

  (document.getElementById("main-loader") as HTMLElement).classList.add(
    "hidden",
  );

  return () => {
    cancelAnimationFrame(handleAnimationFrame);
    surface.destroy();
  };
}

export default function Background({ dummy }: { dummy: boolean }) {
  let context: WebGPUContext;
  let cleanup = () => {};

  useEffect(() => {
    (async () => {
      try {
        cleanup();
        context = await initWebGPU();
        const canvas = document.getElementById(
          "main-canvas",
        ) as HTMLCanvasElement;

        cleanup = await initBg(context, canvas);
      } catch (e) {
        // TODO: raise error
        alert(e);
      }
    })();
  }, []);

  return (
    <div key={dummy + ""}>
      <Loader id="main-loader" />
      <canvas id="main-canvas"></canvas>
    </div>
  );
}
