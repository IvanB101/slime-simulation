"use client";

import { Dispatch, SetStateAction, useRef } from "react";
import Loader from "./Loader";
import {
  initCanvasContext,
  initWebGPU,
  WebGPUContext,
  WebGPUError,
} from "@/lib/webgpu";
import { slime, type Config } from "@/lib/webgpu/slime";
import ControlPanel from "@/components/ControlPanel";

const simState = {
  paused: false,
};

function initBg(
  context: WebGPUContext,
  canvasContext: GPUCanvasContext,
  config: Config,
) {
  const surface = slime(context, canvasContext, config);

  var handleAnimationFrame: number;
  (function loop() {
    if (!simState.paused) {
      surface.update();
      surface.render();
    }
    handleAnimationFrame = requestAnimationFrame(() => loop());
  })();
  (document.getElementById("bg-loader") as HTMLElement).classList.add("hidden");

  return () => {
    cancelAnimationFrame(handleAnimationFrame);
  };
}

let context: WebGPUContext | undefined;
let canvasContext: GPUCanvasContext | undefined;
type State = "started" | "initializing" | "ready";
let state: State = "started";
let cleanup = () => {};

export default function SlimeSim({
  config,
  setErrorAction,
}: {
  config: Config;
  setErrorAction: Dispatch<SetStateAction<WebGPUError | undefined>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function restartSim() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (document.getElementById("bg-loader") as HTMLElement).classList.remove(
      "hidden",
    );

    canvas.width = config.width;
    canvas.height = config.height;
    cleanup();

    if (context && canvasContext) {
      cleanup = initBg(context, canvasContext, config);
      return;
    }
  }

  function setCanvasRef(canvas: HTMLCanvasElement) {
    if (!canvas || state === "initializing") return;
    state = "initializing";

    canvasRef.current = canvas;
    canvas.width = config.width;
    canvas.height = config.height;

    (async () => {
      canvasRef.current = canvas;
      if (!context) {
        const contextRes = await initWebGPU();
        if (!contextRes.ok) {
          setErrorAction(contextRes.error);
          return;
        }
        context = contextRes.value;
      }
      cleanup();
      const canvasContextRes = initCanvasContext(context, canvas);
      if (!canvasContextRes.ok) {
        setErrorAction(canvasContextRes.error);
        return;
      }
      canvasContext = canvasContextRes.value;
      cleanup = initBg(context, canvasContext, config);
      state = "ready";
    })();
  }

  function setContainerRef(container: HTMLDivElement) {
    if (!container) return;

    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const canvasAspect = canvas.width / canvas.height;
      const containerAspect = container.clientWidth / container.clientHeight;
      if (canvasAspect > containerAspect) {
        document.documentElement.style.cssText = `--canvas-width: ${container.clientWidth}px`;
      } else {
        document.documentElement.style.cssText = `--canvas-height: ${container.clientHeight}px`;
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }

  return (
    <div
      className="flex bg-black relative w-screen h-screen
      flex-col
      md:flex-row 
    "
    >
      <Loader />
      <ControlPanel
        state={simState}
        config={config}
        canvasRef={canvasRef}
        restartSimAction={restartSim}
      />
      <div
        ref={setContainerRef}
        className="flex flex-1 justify-center items-center overflow-hidden"
      >
        <canvas
          ref={setCanvasRef}
          className="border-1 border-gray-500"
        ></canvas>
      </div>
    </div>
  );
}
