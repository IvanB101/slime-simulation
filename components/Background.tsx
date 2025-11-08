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
import Overlay from "./Overlay";

const state = {
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
let initializing = false;
let cleanup = () => {};

export default function SlimeSim({
  config,
  canvasRef,
  setErrorAction,
  setNeedsRestartAction,
}: {
  config: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
  setErrorAction: Dispatch<SetStateAction<WebGPUError | undefined>>;
  setNeedsRestartAction: Dispatch<SetStateAction<boolean>>;
}) {
  function restartSim() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = config.width;
    canvas.height = config.height;
    cleanup();

    if (context && canvasContext) {
      cleanup = initBg(context, canvasContext, config);
      return;
    }
  }

  function setCanvasRef(canvas: HTMLCanvasElement) {
    if (!canvas || initializing) return;
    canvas.width = config.width;
    canvas.height = config.height;
    initializing = true;

    (async () => {
      try {
        canvasRef.current = canvas;
        const contextRes = await initWebGPU();
        if (!contextRes.ok) {
          setErrorAction(contextRes.error);
          return;
        }
        context = contextRes.value;
        const canvasContextRes = initCanvasContext(context, canvas);
        if (!canvasContextRes.ok) {
          setErrorAction(canvasContextRes.error);
          return;
        }
        canvasContext = canvasContextRes.value;
        cleanup = initBg(context, canvasContext, config);
      } catch (e) {}
    })();
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center h-screen bg-black relative">
      <Loader />
      <Overlay
        state={state}
        restartSimAction={restartSim}
        setNeedsRestartAction={setNeedsRestartAction}
      />
      <canvas ref={setCanvasRef} className="border-1 border-gray-500"></canvas>
    </div>
  );
}
