// CS405 · Lab 1 — your first triangle in WebGPU (starter)
// Work through the TODOs in order. After each one, check the matching
// checkpoint on the lab slides. The reference solution is in ../lab1-solution/.

const canvas = document.querySelector('canvas');

// ---------------------------------------------------------------------------
// TODO 1 — get a device and configure the canvas
//   a) check navigator.gpu exists, throw a clear error if not
//   b) const adapter = await navigator.gpu.requestAdapter()
//   c) const device  = await adapter.requestDevice()
//   d) const ctx     = canvas.getContext('webgpu')
//   e) const format  = navigator.gpu.getPreferredCanvasFormat()
//   f) ctx.configure({ device, format, alphaMode: 'opaque' })
//   g) console.log('WebGPU ready:', format)
// ---------------------------------------------------------------------------

if (!navigator.gpu) {
  throw new Error('No WebGPU adapter!');
}
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
const ctx = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
ctx.configure({ device, format, alphaMode: 'opaque' });
console.log('WebGPU ready:', format);

// ---------------------------------------------------------------------------
// TODO 2 — a shader module and a render pipeline
//   The vertex shader returns clip-space positions for vertex_index 0, 1, 2.
//   The fragment shader returns a solid colour.
//   Then: device.createRenderPipeline({ layout: 'auto', vertex, fragment })
// ---------------------------------------------------------------------------

const response = await fetch('./shader.wgsl');
const shaderCode = await response.text();
const module = device.createShaderModule({ code: shaderCode });
const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module, entryPoint: "vs"
  },
  fragment: {
    module, entryPoint: "fs", targets: [{ format }]
  }
})

// ---------------------------------------------------------------------------
// TODO 3 — a colour per vertex
//   Return a struct from the vertex shader with @location(0) colour,
//   take it as the fragment shader's input, and watch it interpolate.
// ---------------------------------------------------------------------------


const ubuf = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
});

const bind = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: ubuf } }]
});

// ---------------------------------------------------------------------------
// TODO 4 — a uniform buffer with the time, and rotate the triangle
//   size 16 bytes, usage UNIFORM | COPY_DST
//   bind group from pipeline.getBindGroupLayout(0)
//   device.queue.writeBuffer(...) every frame
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TODO 5 — your turn: a square (two triangles), correct aspect ratio,
//   and the shape following the mouse.
// ---------------------------------------------------------------------------

const t0 = performance.now();

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
}
window.addEventListener('resize', resize);
resize();

let lastTime = 0;

let x = 0, y = 0;
window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
});

function frame() {
  // TODO 1 (continued): create a command encoder, begin a render pass that
  // clears the canvas, end it, and submit it to device.queue.

  const t = (performance.now() - t0) / 1000;
  device.queue.writeBuffer(ubuf, 0, new Float32Array([t, 0, x, y]));

  const enc = device.createCommandEncoder();
  const pass = enc.beginRenderPass({
    colorAttachments: [{
      view: ctx.getCurrentTexture().createView(),
      clearValue: { r: 0.6, g: 0.7, b: 0.9, a: 1 },
      loadOp: 'clear',
      storeOp: 'store',
    }]});


  // R=49 G=51 B=153
  // TODO 2 (continued): pass.setPipeline(pipeline); pass.draw(3);

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bind);
  pass.draw(6);

  pass.end();
  device.queue.submit([enc.finish()]);
  // TODO 4 (continued): writeBuffer + pass.setBindGroup(0, bind);
  document.querySelector("p").textContent = `Speed: ${(1000 / (performance.now() - lastTime)).toFixed(2)} fps, Mouse: (${x.toFixed(2)}, ${y.toFixed(2)}), Distance: ${(Math.sqrt(x*x + y*y)).toFixed(2)}`;
  lastTime = performance.now();
  requestAnimationFrame(frame);
}
frame();
