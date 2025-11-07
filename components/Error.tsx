"use client";

import { WebGPUError } from "@/lib/webgpu";

import alertIcon from "@/public/icons/alert.svg";

export default function Error({ error }: { error: WebGPUError }) {
  let msg;
  if (error.handled) {
    switch (error.error) {
      case "not supported": {
        msg = (
          <div>
            <div>Error: this browser does not support WebGPU</div>
            <a
              href="https://caniuse.com/webgpu"
              className="underline text-blue-500"
            >
              Check supported browsers
            </a>
          </div>
        );
        break;
      }
      case "not enabled": {
        msg = "Error: WebGPU is not enabled in this browser";
        break;
      }
    }
  } else {
    msg = `Unexpected error: ${error.error}`;
  }

  return (
    <div className="bg-black w-screen h-screen flex justify-center items-center">
      <div className="flex gap-2 items-center text-red-500 md:text-xl">
        <div
          dangerouslySetInnerHTML={{ __html: alertIcon }}
          className="size-10 fill-red-500"
        />
        {msg}
      </div>
    </div>
  );
}
