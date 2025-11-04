"use client";

import { RefObject } from "react";
import Loader from "./Loader";
import { initCanvasContext, initWebGPU, WebGPUContext } from "@/lib/webgpu";
import { slime, type Config } from "@/lib/webgpu/slime";

let active = true;
function toggleLoader() {
  const loader = document.getElementById("bg-loader") as HTMLElement;
  active = !active;
  if (active) {
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
  }
}

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
    surface.update();
    surface.render();
    handleAnimationFrame = requestAnimationFrame(() => loop());
  })();
  toggleLoader();

  return () => {
    cancelAnimationFrame(handleAnimationFrame);
  };
}

let context: WebGPUContext | undefined;
let canvasContext: GPUCanvasContext | undefined;
let cleanup = () => {};

export default function Background({
  config,
  canvasRef,
}: {
  config: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
}) {
  function setCanvasRef(canvas: HTMLCanvasElement) {
    cleanup();
    if (context && canvasContext) {
      cleanup = initBg(context, canvasContext, config);
      return;
    }

    (async () => {
      try {
        canvasRef.current = canvas;
        context = await initWebGPU();
        canvasContext = initCanvasContext(context, canvas);
        canvas.width = config.slime.size[0];
        canvas.height = config.slime.size[1];
        cleanup = initBg(context, canvasContext, config);
      } catch (e) {
        // TODO: raise error
        alert(e);
      }
    })();
  }

  return (
    <div className="flex flex-1 flex-col justify-center items-center h-screen bg-black">
      <Loader id="bg-loader" />
      <canvas ref={setCanvasRef} className="border-1 border-gray-500"></canvas>
    </div>
  );
}
