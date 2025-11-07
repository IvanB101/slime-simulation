"use client";

import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { config, type Config } from "@/lib/webgpu/slime";
import Section from "@/components/Section";
import Slider from "@/components/Slider";
import { state } from "@/components/Background";

import reloadIcon from "@/public/icons/reload.svg";
import pauseIcon from "@/public/icons/pause.svg";
import playIcon from "@/public/icons/play.svg";
import alertIcon from "@/public/icons/alert.svg";

export default function Config({
  startConfig,
  canvasRef,
  action,
}: {
  startConfig: Config;
  canvasRef: RefObject<HTMLCanvasElement | undefined>;
  action: Dispatch<SetStateAction<Config>>;
}) {
  const [showMsg, setShowMsg] = useState(false);
  const [paused, setPaused] = useState(state.paused);
  let temp = {
    size: startConfig.size[0],
    nAgents: startConfig.nAgents,
  };

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

  function restartSim() {
    const side = temp.size;
    const newConfig = { ...startConfig };
    newConfig.size = [side, side];
    newConfig.nAgents = temp.nAgents;
    action(newConfig);
    setShowMsg(false);
  }

  function togglePause() {
    state.paused = !paused;
    setPaused(!paused);
  }

  function NoReloadSlider({ field, label }: { field: string; label: string }) {
    return (
      <Slider
        label={label}
        field={field}
        range={[
          config.mins[field] as number,
          startConfig[field] as number,
          config.maxs[field] as number,
          config.default[field] as number,
        ]}
        object={startConfig}
      />
    );
  }

  return (
    <div className="flex flex-col py-2 bg-black border-r-1 border-gray-500 min-w-[300px] w-[300px] relative top-0 left-0">
      <div className="flex absolute left-full p-4 gap-4 top-0">
        <button onClick={restartSim} title="Restart">
          <div
            dangerouslySetInnerHTML={{ __html: reloadIcon }}
            className="size-8 fill-white"
          />
        </button>
        <button onClick={togglePause} title={paused ? "Play" : "Pause"}>
          <div
            dangerouslySetInnerHTML={{ __html: paused ? playIcon : pauseIcon }}
            className="size-8 fill-white"
          />
        </button>
      </div>

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
        {showMsg && (
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
          <NoReloadSlider label="Sensory offset" field="sensoryOffset" />
          <NoReloadSlider label="Step size" field="stepSize" />
          <NoReloadSlider label="Sensory Angle" field="sensoryAngle" />
          <NoReloadSlider label="Turn rate" field="turnRate" />
          <NoReloadSlider label="Decay" field="decay" />
          <NoReloadSlider label="Deposition" field="deposition" />
          <Slider
            label="Number of agents"
            field="nAgents"
            range={[
              config.mins.nAgents,
              startConfig.nAgents,
              config.maxs.nAgents,
              config.default.nAgents,
            ]}
            object={temp}
            action={setShowMsg}
            integer
          />
          <Slider
            label="Size (square side)"
            field="size"
            range={[
              config.mins.size[0],
              startConfig.size[0],
              window.screen.height,
              config.default.size[0],
            ]}
            object={temp}
            action={setShowMsg}
            integer
          />
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
