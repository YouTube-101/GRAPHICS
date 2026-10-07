struct U {time: f32, aspect: f32, pad: vec2f};
@group(0) @binding(0) var<uniform> u: U;
struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec4f,
}
@vertex fn vs(@builtin(vertex_index) i: u32) -> VSOut {
  var p = array<vec2f, 6>(
    vec2f(-0.5, -0.5),
    vec2f(0.5, -0.5),
    vec2f(-0.5, 0.5),
    vec2f(0.5, 0.5),
    vec2f(0.5, -0.5),
    vec2f(-0.5, 0.5),
  );
  let dist: f32 = sqrt(u.pad.x * u.pad.x + u.pad.y * u.pad.y);
  var c = array<vec4f, 6>(
    vec4f(1.0, 0.0 + (dist), 0.0 + (dist), 1.0),
    vec4f(0.0 + (dist), 1.0, 0.0 + (dist), 1.0),
    vec4f(0.0 + (dist), 0.0 + (dist), 1.0, 1.0),
    vec4f(1.0, 1.0, 0.0 + (dist), 1.0),
    vec4f(0.0 + (dist), 1.0, 0.0 + (dist), 1.0),
    vec4f(0.0 + (dist), 0.0 + (dist), 1.0, 1.0)
  );
  let a = u.time;
  let rotationSpeed = 1.0 + dist * 5.0; // Adjust the multiplier to control the speed
  let q = vec2f(p[i].x * cos(a * rotationSpeed) - p[i].y * sin(a * rotationSpeed), p[i].x * sin(a * rotationSpeed) + p[i].y * cos(a * rotationSpeed));
  var out: VSOut;
  let offset = vec2f(u.pad.x, u.pad.y);
  out.pos = vec4f(q + offset, 0.0, 1.0);
  out.color = c[i];
  return out;
}

@fragment fn fs(in: VSOut) -> @location(0) vec4f {
  return in.color;
}