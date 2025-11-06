import "client-only";

import shaders from "@/shaders/slime.wgsl";
import type { WebGPUContext } from "@/lib/webgpu";
import { makeShaderDataDefinitions, makeStructuredView } from "webgpu-utils";
import { colorHexToVec3f } from "@/lib/math";

export interface Slime {
  render: () => void;
  update: () => void;
}

export type DisplayConfig = {
  color: [number, number, number];
};

type NoReloadConfig = {
  sensoryAngle: number;
  sensoryOffset: number;
  decay: number;
  turnRate: number;
  deposition: number;
  stepSize: number;
};

type ReloadConfig = {
  nAgents: number;
  size: [number, number];
};

type SlimeConfig = NoReloadConfig &
  ReloadConfig & { [idx: string]: number | number[] };

export type Config = SlimeConfig & DisplayConfig;

export const config: {
  default: Config;
  mins: SlimeConfig;
  maxs: SlimeConfig;
} = {
  default: {
    color: colorHexToVec3f("#0C3B82"),
    nAgents: 100000,
    size: [400, 400],
    sensoryAngle: Math.PI / 4,
    sensoryOffset: 5,
    decay: 0.7,
    turnRate: Math.PI / 8,
    deposition: 1,
    stepSize: 1,
  },
  mins: {
    nAgents: 1000,
    size: [400, 400],
    sensoryAngle: Math.PI / 8,
    sensoryOffset: 1,
    decay: 0.01,
    turnRate: Math.PI / 8,
    deposition: 0.01,
    stepSize: 0.1,
  },
  maxs: {
    nAgents: 1000000,
    size: [4000, 4000],
    sensoryAngle: Math.PI / 2,
    sensoryOffset: 50,
    decay: 1,
    turnRate: Math.PI / 2,
    deposition: 1,
    stepSize: 5,
  },
};

type InitConfig = {
  seed: number;
  nAgents: number;
  size: [number, number];
};

type RenderConfig = {
  size: [number, number];
  color: [number, number, number];
};

const defs = makeShaderDataDefinitions(shaders);
const uniform = makeStructuredView(defs.uniforms.ubo);

function initRender(
  device: GPUDevice,
  context: GPUCanvasContext,
  medium: GPUBuffer,
  config: RenderConfig,
): () => void {
  const module = device.createShaderModule({
    label: "slime module",
    code: shaders,
  });
  const pipeline = device.createRenderPipeline({
    label: "slime pipeline",
    layout: "auto",
    vertex: {
      module,
    },
    fragment: {
      module,
      targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
    },
  });
  const renderPassDescriptor: GPURenderPassDescriptor = {
    label: "slime render pass",
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        // clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  const uniformBuffer = device.createBuffer({
    size: uniform.arrayBuffer.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  uniform.set(config);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer } },
      { binding: 1, resource: medium },
    ],
  });

  function render() {
    uniform.set(config);
    uniform.set({
      time: performance.now(),
    });
    device.queue.writeBuffer(uniformBuffer, 0, uniform.arrayBuffer);

    (
      renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[]
    )[0].view = context.getCurrentTexture().createView();

    const encoder = device.createCommandEncoder({
      label: "slime render encoder",
    });
    const pass = encoder.beginRenderPass(renderPassDescriptor);
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  return render;
}

export function slime(
  { device }: WebGPUContext,
  context: GPUCanvasContext,
  config: Config,
): Slime {
  const defs = makeShaderDataDefinitions(shaders);
  const time = performance.now();
  const initConfig: InitConfig = {
    seed: time,
    nAgents: config.nAgents,
    size: config.size,
  };
  const renderConfig: RenderConfig = {
    size: config.size,
    color: config.color,
  };

  const module = device.createShaderModule({
    label: "slime simulation module",
    code: shaders,
  });

  const initAgentsPipeline = device.createComputePipeline({
    label: "slime update agents pipeline",
    layout: "auto",
    compute: { module, entryPoint: "initAgents" },
  });

  const updateAgentsPipeline = device.createComputePipeline({
    label: "slime update agents pipeline",
    layout: "auto",
    compute: { module, entryPoint: "updateAgents" },
  });
  const updateMediumPipeline = device.createComputePipeline({
    label: "slime update agents pipeline",
    layout: "auto",
    compute: { module, entryPoint: "updateMedium" },
  });

  const agentBuf = device.createBuffer({
    size: config.nAgents * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const size = config.size[0] * config.size[1] * 16;
  const mediumBufs = [
    device.createBuffer({
      size,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    }),
    device.createBuffer({
      size,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    }),
  ];

  {
    // Agents initialization
    const view = makeStructuredView(defs.uniforms.iconfig);
    const iconfig = device.createBuffer({
      size: view.arrayBuffer.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    view.set(initConfig);
    device.queue.writeBuffer(iconfig, 0, view.arrayBuffer);

    var initBindGroup = device.createBindGroup({
      layout: initAgentsPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: iconfig } },
        { binding: 1, resource: { buffer: agentBuf } },
        { binding: 2, resource: { buffer: mediumBufs[1] } },
      ],
    });

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass({
      label: "slime init agents compute pass",
    });
    pass.setPipeline(initAgentsPipeline);
    pass.setBindGroup(0, initBindGroup);
    pass.dispatchWorkgroups(Math.ceil(config.nAgents / 64));
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  const configView = makeStructuredView(defs.uniforms.config);
  const configBuf = device.createBuffer({
    size: configView.arrayBuffer.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  configView.set(config);

  const agentBindGroup = device.createBindGroup({
    layout: updateAgentsPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: configBuf } },
      { binding: 1, resource: { buffer: mediumBufs[0] } },
      { binding: 2, resource: { buffer: mediumBufs[1] } },
      { binding: 3, resource: { buffer: agentBuf } },
    ],
  });
  const mediumBindGroup = device.createBindGroup({
    layout: updateMediumPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: configBuf } },
      { binding: 1, resource: { buffer: mediumBufs[0] } },
      { binding: 2, resource: { buffer: mediumBufs[1] } },
    ],
  });

  function update() {
    configView.set(config);
    configView.set({ time: performance.now() });
    device.queue.writeBuffer(configBuf, 0, configView.arrayBuffer);

    var encoder = device.createCommandEncoder();

    var pass = encoder.beginComputePass({
      label: "slime update medium compute pass",
    });
    pass.setBindGroup(0, mediumBindGroup);
    pass.setPipeline(updateMediumPipeline);
    pass.dispatchWorkgroups(Math.ceil((config.size[0] * config.size[1]) / 64));
    pass.end();
    device.queue.submit([encoder.finish()]);

    encoder = device.createCommandEncoder();
    encoder.copyBufferToBuffer(mediumBufs[1], mediumBufs[0]);
    pass = encoder.beginComputePass({
      label: "slime update agents compute pass",
    });
    pass.setBindGroup(0, agentBindGroup);
    pass.setPipeline(updateAgentsPipeline);
    pass.dispatchWorkgroups(Math.ceil(config.nAgents / 64));
    pass.end();
    device.queue.submit([encoder.finish()]);
  }
  const render = initRender(device, context, mediumBufs[0], renderConfig);

  return {
    render,
    update,
  };
}
