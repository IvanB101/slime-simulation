"use client";

import { Dispatch, RefObject, SetStateAction } from "react";
import Section from "@/components/Section";
import NumericVariable from "@/components/Slider";

import alertIcon from "@/public/icons/alert.svg";
import {
  defaults,
  mins,
  maxs as staticMaxs,
  type Config,
  type SlimeConfig,
} from "@/lib/webgpu/slime";

const labels: { [key: string]: string } = {
  nAgents: "Number of agents",
  width: "Width",
  height: "Height",
  sensoryAngle: "Sensory Angle",
  sensoryOffset: "Sensory Offset",
  decay: "Decay",
  turnRate: "Turn Rate",
  deposition: "Desposition",
  stepSize: "Step Size",
};

const requiresReload: { [key: string]: boolean } = {
  nAgents: true,
  width: true,
  heigth: true,
};

const integer: { [key: string]: boolean } = {
  nAgents: true,
  width: true,
  heigth: true,
};

export default function Config({
  startConfig,
  canvasRef,
  needsRestart,
  setNeedsRestartAction,
}: {
  startConfig: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
  needsRestart: boolean;
  setNeedsRestartAction: Dispatch<SetStateAction<boolean>>;
}) {
  const maxs = {
    ...staticMaxs,
    width: screen.width,
    height: screen.height,
  } as SlimeConfig;

  function saveConfig() {
    localStorage.setItem("config", JSON.stringify(startConfig));
  }

  function toggleDisplay(event: React.FormEvent<HTMLInputElement>) {
    const classes = ["size-[100vmin]"];
    if (!canvasRef.current) return;

    if (event.currentTarget.checked) {
      canvasRef.current.classList.add(...classes);
    } else {
      canvasRef.current.classList.remove(...classes);
    }
  }

  return (
    <div
      className="
        flex flex-col py-2 bg-black
        md:border-r-1 md:border-gray-500 md:min-w-[300px] md:w-[300px]
        md:relative top-0 left-0
    "
    >
      <Section title="Display">
        <div className="flex px-2 py-[2px] gap-3">
          <input
            type="checkbox"
            id="display-stretch"
            name="display-stretch"
            onInput={toggleDisplay}
          />
          <label htmlFor="display-stretch">Fit simulation</label>
        </div>
      </Section>
      <Section title="Simulation">
        {needsRestart && (
          <div className=" flex gap-2 text-yellow-200 px-2 py-1 items-center justify-around">
            <div
              dangerouslySetInnerHTML={{
                __html: alertIcon,
              }}
              className="size-10 fill-white flex items-center"
            />
            Some changes require the simulation to be restarted
          </div>
        )}
        <div className="w-full h-full grid grid-cols-12 gap-x-2 px-2">
          {Object.keys(mins).map((field) => (
            <NumericVariable
              key={field}
              label={labels[field]}
              field={field}
              values={{
                min: mins[field] as number,
                value: startConfig[field] as number,
                max: maxs[field] as number,
                def: defaults[field] as number,
              }}
              object={startConfig}
              action={requiresReload[field] ? setNeedsRestartAction : undefined}
              integer={integer[field]}
            />
          ))}
          <div className="col-span-full flex justify-center pt-2">
            <button
              onClick={saveConfig}
              className="py-1 px-2 outline-gray-500 border-1 rounded-xl hover:bg-gray-900"
            >
              Save Config
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
