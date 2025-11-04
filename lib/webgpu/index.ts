export interface WebGPUContext {
  device: GPUDevice;
  adapter: GPUAdapter;
}

export async function initWebGPU(): Promise<WebGPUContext> {
  if (!navigator.gpu) {
    throw Error("WebGPU not supported on this browser.");
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw Error("this browser supports webgpu but it appears disabled");
  }

  const device = (await adapter.requestDevice()) as GPUDevice;
  device.lost.then((info) => {
    console.error(`WebGPU device was lost: ${info.message}`);
    // TODO: handle losing the device (restart)
    // if (info.reason !== 'destroyed') { }
    throw Error(`WebGPU device was lost: ${info.message}`);
  });

  return { device, adapter };
}

export function initCanvasContext(
  { device }: WebGPUContext,
  canvas: HTMLCanvasElement,
): GPUCanvasContext {
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  if (!context) {
    throw Error("could not create context");
  }
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  return context;
}

type Map<T> = {
  [key: string]: T;
};

export type Struct = {
  [key: string]: number | number[] | Map<number | number[]>;
};
