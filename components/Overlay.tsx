"use client";

import Link from "next/link";

import reloadIcon from "@/public/icons/reload.svg";
import pauseIcon from "@/public/icons/pause.svg";
import playIcon from "@/public/icons/play.svg";
import infoIcon from "@/public/icons/information.svg";
import { Dispatch, SetStateAction, useState } from "react";

export default function Overlay({
  state,
  restartSimAction,
  setNeedsRestartAction,
}: {
  state: { paused: boolean };
  restartSimAction: () => void;
  setNeedsRestartAction: Dispatch<SetStateAction<boolean>>;
}) {
  const [paused, setPaused] = useState(state.paused);

  function togglePause() {
    state.paused = !paused;
    setPaused(!paused);
  }

  return (
    <>
      <Link
        href="/info"
        className="absolute p-4 right-0 top-0"
        title="Information"
      >
        <div
          dangerouslySetInnerHTML={{ __html: infoIcon }}
          className="size-8 fill-white"
        />
      </Link>
      <div className="flex absolute left-0 p-4 gap-4 top-0">
        <button
          onClick={() => {
            restartSimAction();
            setNeedsRestartAction(false);
          }}
          title="Restart"
        >
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
    </>
  );
}
