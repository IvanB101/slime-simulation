"use client";

import { Dispatch, RefObject, SetStateAction } from "react";
import { type Config } from "@/lib/webgpu/slime";
import Section from "@/components/Section";
import Slider from "@/components/Slider";

import reloadIcon from "@/public/icons/reload.svg";

export default function Config({
  config,
  canvasRef,
  action,
}: {
  config: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
  action: Dispatch<SetStateAction<Config>>;
}) {
  let newConfig = {};

  function toggleDisplay(event: React.FormEvent<HTMLInputElement>) {
    const classes = ["size-[100vmin]"];
    if (!canvasRef.current) return;

    if (event.currentTarget.checked) {
      canvasRef.current.classList.add(...classes);
    } else {
      canvasRef.current.classList.remove(...classes);
    }
  }

  function restartSim() {
    newConfig = { ...config, ...newConfig };
    action(newConfig as Config);
  }

  return (
    <div className="flex flex-col bg-black border-r-1 border-gray-500">
      <button
        onClick={restartSim}
        className="flex px-2 py-1 justify-between cursor-pointer"
      >
        <div>Restart</div>
        <div
          dangerouslySetInnerHTML={{ __html: reloadIcon }}
          className="size-7 p-1 fill-white"
        />
      </button>
      <Section title="Display">
        <div className="flex p-2">
          <input
            type="checkbox"
            id="display-stretch"
            name="display-stretch"
            onInput={toggleDisplay}
          />
          <label htmlFor="display-stretch">Stretch</label>
        </div>
      </Section>
      <Section title="Simulation">
        <Slider
          label="Sensory offset"
          field="sensoryOffset"
          range={[1, config.slime.sensoryOffset, 50]}
          object={config.slime}
          numberInput
        />
        <Slider
          label="Step size"
          field="stepSize"
          range={[0.1, config.slime.stepSize, 5]}
          step={0.05}
          object={config.slime}
          numberInput
        />
        <Slider
          label="Sensory Angle"
          field="sensoryAngle"
          range={[Math.PI / 8, config.slime.sensoryAngle, Math.PI / 2]}
          step={0.05}
          object={config.slime}
          numberInput
        />
        <Slider
          label="Turn rate"
          field="turnRate"
          range={[Math.PI / 8, config.slime.turnRate, Math.PI / 2]}
          step={0.05}
          object={config.slime}
          numberInput
        />
      </Section>
    </div>
  );
  // nAgents: number;
  // size: [number, number];
  // decay: number;
  // deposition: number;
}
