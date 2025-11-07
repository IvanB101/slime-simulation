import { throws } from "assert";

export interface WebGPUContext {
  device: GPUDevice;
  adapter: GPUAdapter;
}

type HandledErrors = "not supported" | "not enabled";

export type WebGPUError =
  | {
      handled: true;
      error: HandledErrors;
    }
  | {
      handled: false;
      error: string;
    };

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: WebGPUError;
    };

function ok<T>(val: T): Result<T> {
  return {
    ok: true,
    value: val,
  };
}

function handledError<T>(err: HandledErrors): Result<T> {
  return {
    ok: false,
    error: {
      handled: true,
      error: err,
    },
  };
}

function error<T>(err: string): Result<T> {
  return {
    ok: false,
    error: {
      handled: false,
      error: err,
    },
  };
}

type Map<T> = {
  [key: string]: T;
};

export type Struct = {
  [key: string]: number | number[] | Map<number | number[]>;
};

export async function initWebGPU(): Promise<Result<WebGPUContext>> {
  if (!navigator.gpu) {
    return handledError("not supported");
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return handledError("not enabled");
  }

  const device = (await adapter.requestDevice()) as GPUDevice;
  device.lost.then((info) => {
    return error(`WebGPU device was lost: ${info.message}`);
    // TODO: handle losing the device (restart)
    // if (info.reason !== 'destroyed') { }
  });

  return ok({ device, adapter });
}

export function initCanvasContext(
  { device }: WebGPUContext,
  canvas: HTMLCanvasElement,
): Result<GPUCanvasContext> {
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  if (!context) {
    return error("could not create canvas context");
  }
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  return ok(context);
}
