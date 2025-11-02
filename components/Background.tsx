"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import { initWebGPU, WebGPUContext } from "@/lib/webgpu";
import { slime } from "@/lib/webgpu/slime";

type State = "fallback" | "ready" | "initializing" | "checking support";

async function initBg(
  context: WebGPUContext,
  setState: Dispatch<SetStateAction<State>>,
  canvas: HTMLCanvasElement,
) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // const pixels = 800 * 600;
  const pixels = 400 * 300;
  const aspect = width / height;

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

  var frameTime = 10000;
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    surface.update();
    surface.render();
    await context.device.queue.onSubmittedWorkDone();
    const finish = performance.now();
    frameTime = Math.min(frameTime, finish - start);
  }
  if (frameTime > 35) {
    setState("fallback");
    return;
  }

  document.documentElement.style.cssText = `--slime-width: ${width}px`;
  document.documentElement.style.cssText = `--slime-height: ${height}px`;

  (function loop() {
    surface.update();
    surface.render();
    requestAnimationFrame(() => loop());
  })();
  (document.getElementById("bg-loader") as HTMLElement).classList.add(
    "[display:none]",
  );
  setState("ready");
}

export default function Background() {
  const [state, setState] = useState<State>("checking support");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: WebGPUContext;

  useEffect(() => {
    (async () => {
      if (state !== "checking support") return;

      try {
        context = await initWebGPU();
        setState("initializing");

        await initBg(context, setState, canvasRef.current as HTMLCanvasElement);
      } catch (e) {
        setState("fallback");
      }
    })();
  }, []);

  if (state === "fallback") {
    return (
      <img
        src="/fallback.png"
        alt="background"
        className="w-screen h-screen fixed overflow-hidden z-[-1] left-0 top-0"
      />
    );
  }

  return (
    <>
      <Loader />)
      <canvas
        ref={canvasRef}
        className="
              w-[var(--slime-width)] h-[var(--slime-height)]
              fixed overflow-hidden z-[-1] left-0 top-0 blur-xs
          "
      ></canvas>
    </>
  );
}
