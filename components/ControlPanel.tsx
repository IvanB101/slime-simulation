"use client";

import { ReactNode, RefObject, useEffect, useState } from "react";
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

import reloadIcon from "@/public/icons/reload.svg";
import pauseIcon from "@/public/icons/pause.svg";
import playIcon from "@/public/icons/play.svg";
import infoIcon from "@/public/icons/information.svg";
import configIcon from "@/public/icons/config.svg";
import closeIcon from "@/public/icons/close.svg";
import Link from "next/link";

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

export default function ControlPanel({
  state,
  config,
  canvasRef,
  restartSimAction,
}: {
  state: { paused: boolean };
  config: Config;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  restartSimAction: () => void;
}) {
  const maxs = {
    ...staticMaxs,
    width: screen.width,
    height: screen.height,
  } as SlimeConfig;

  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [needsRestart, setNeedsRestart] = useState(false);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(state.paused);

  function togglePaused() {
    setPaused(!paused);
    state.paused = !paused;
  }

  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  function saveConfig() {
    localStorage.setItem("config", JSON.stringify(config));
  }

  function toggleDisplay(event: React.FormEvent<HTMLInputElement>) {
    const clazz = "fit-canvas";
    if (!canvasRef.current) return;

    if (event.currentTarget.checked) {
      canvasRef.current.classList.add(clazz);
    } else {
      canvasRef.current.classList.remove(clazz);
    }
  }

  const configOptions = (
    <>
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
                value: config[field] as number,
                max: maxs[field] as number,
                def: defaults[field] as number,
              }}
              object={config}
              action={requiresReload[field] ? setNeedsRestart : undefined}
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
    </>
  );

  function Controls({ children }: { children?: ReactNode }) {
    return (
      <div className="flex flex-col  relative top-0 left-0">
        <div className="flex p-4 gap-4 justify-around">
          <button
            onClick={() => setOpen(!open)}
            title="Configuration"
            className="md:hidden"
          >
            <div
              dangerouslySetInnerHTML={{
                __html: open ? closeIcon : configIcon,
              }}
              className="size-8 fill-white"
            />
          </button>
          <Link href="/info" title="Information">
            <div
              dangerouslySetInnerHTML={{ __html: infoIcon }}
              className="size-8 fill-white"
            />
          </Link>
          <button
            onClick={() => {
              restartSimAction();
              setNeedsRestart(false);
            }}
            title="Restart"
          >
            <div
              dangerouslySetInnerHTML={{ __html: reloadIcon }}
              className="size-8 fill-white"
            />
          </button>
          <button onClick={togglePaused} title={paused ? "Play" : "Pause"}>
            <div
              dangerouslySetInnerHTML={{
                __html: paused ? playIcon : pauseIcon,
              }}
              className="size-8 fill-white"
            />
          </button>
        </div>
        {children}
      </div>
    );
  }

  return mobile ? (
    <div className="flex flex-col bg-black relative ">
      <div className="border-b-1 border-gray-500">
        <Controls>
          {open && (
            <div className="absolute top-full w-full pt-2 mt-[1px] bg-black">
              {configOptions}
            </div>
          )}
        </Controls>
      </div>
    </div>
  ) : (
    <div className=" flex flex-col py-2 bg-black border-r-1 border-gray-500 min-w-[300px] w-[300px] ">
      <Controls />
      <div className="h-[1px] mx-2 my-2 bg-gray-500"></div>
      {configOptions}
    </div>
  );
}
