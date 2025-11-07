"use client";

import { Dispatch, RefObject, SetStateAction } from "react";
import Loader from "./Loader";
import {
  initCanvasContext,
  initWebGPU,
  WebGPUContext,
  WebGPUError,
} from "@/lib/webgpu";
import { slime, type Config } from "@/lib/webgpu/slime";

export const state = {
  paused: false,
};

function initBg(
  context: WebGPUContext,
  canvasContext: GPUCanvasContext,
  config: Config,
) {
  // const pixels = 400 * 300;
  // const aspect = window.innerWidth / window.innerHeight;
  //
  // const size: [number, number] = [
  //   Math.round(Math.sqrt(pixels * aspect)),
  //   Math.round(Math.sqrt(pixels / aspect)),
  // ];
  const surface = slime(context, canvasContext, config);

  // TODO: add checks for fps
  var handleAnimationFrame: number;
  (function loop() {
    if (!state.paused) {
      surface.update();
      surface.render();
    }
    handleAnimationFrame = requestAnimationFrame(() => loop());
  })();
  const loader = document.getElementById("bg-loader") as HTMLElement;
  loader.classList.add("hidden");

  return () => {
    cancelAnimationFrame(handleAnimationFrame);
  };
}

let context: WebGPUContext | undefined;
let canvasContext: GPUCanvasContext | undefined;
let cleanup = () => {};

export default function SlimeSim({
  config,
  canvasRef,
  action,
}: {
  config: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
  action: Dispatch<SetStateAction<WebGPUError | undefined>>;
}) {
  function setCanvasRef(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    canvas.width = config.size[0];
    canvas.height = config.size[1];
    cleanup();

    if (context && canvasContext) {
      cleanup = initBg(context, canvasContext, config);
      return;
    }

    (async () => {
      try {
        canvasRef.current = canvas;
        const contextRes = await initWebGPU();
        if (!contextRes.ok) {
          action(contextRes.error);
          return;
        }
        context = contextRes.value;
        const canvasContextRes = initCanvasContext(context, canvas);
        if (!canvasContextRes.ok) {
          action(canvasContextRes.error);
          return;
        }
        canvasContext = canvasContextRes.value;
        cleanup = initBg(context, canvasContext, config);
      } catch (e) {}
    })();
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center h-screen bg-black">
      <Loader />
      <canvas ref={setCanvasRef} className="border-1 border-gray-500"></canvas>
    </div>
  );
}
