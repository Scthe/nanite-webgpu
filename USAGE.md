# Nanite WebGPU - usage

## Camera control

Use the `[W, S, A, D]` keys to move and `[Z, SPACEBAR]` to fly up or down. `[Shift]` to move faster. `[E]` to toggle depth pyramid debug mode.

## Stats

Some stats and buttons are only available when Nanite culling is performed on CPU or GPU.

* **FPS and timings.** A rough estimate of frame timings. Browsers have VSync, so might not be accurate. **Click the "Profile" button instead** for a better breakdown.
* **Camera position and rotation.** Can be copy&pasted into [constants.ts](src/constants.ts).
* **Memory** taken by various buffers. You can compare this value for different scenes. Shown buffers differ depending if Nanite culling is performed on CPU or GPU.
* **Geometry.**
    * **Preprocessing.** Time spent preparing the scene.
    * **Scene meshlets.** Total meshlets summed over all objects and instances.
    * **Scene triangles.** Total triangles in the scene.
    * `[GPU only]` **Rendered impostors.** Amount of instances that passed instance culling but were so small they were rendered as an impostor billboard.
    * **Rendered meshlets/triangles**. This number only includes actually rendered (after culling) meshlets and triangles (not counting impostors).
        * `[GPU only]` **HW:** denotes stats for hardware rasterization.
        * `[GPU only]` **SW:** denotes stats for software rasterization.
        * `[GPU only]` Click the **"Get GPU visibility stats" button** to download the buffers from the GPU to the CPU and get the above values.
    * `[CPU only]` **Drawn instances.** Drawn instances after culling. CPU flow does not have impostors, advanced culling, etc.



## GUI

![freeze-culling](https://github.com/user-attachments/assets/a3327cd0-bd97-48fc-8b9a-de8f01d3abbe)

*"Freeze culling" in action. The right side of the Jinx grid was frustum culled. The instances/meshlets in the middle were occlusion culled. You can see that even for the closest Jinx, only the torso was rendered. This is where the camera was located.*


* `[IMPORTANT]` **"Profile" button.** Shows timings per pass in the bottom left corner. Much more accurate than the FPS and timings from stats.
* `[IMPORTANT, GPU only]` **"Get GPU stats" button**. Download the GPU buffers to the CPU to check what was actually rendered.
* **Nanite.**
    * `[IMPORTANT]` **Nanite device.** Switch the Nanite calculation device. GPU has instance and occlusion culling (and impostors). It's much faster. CPU option is provided as a reference.
    * `[IMPORTANT]` **Error threshold.** Max error when deciding which LOD level is acceptable for meshlets. We aim to render most coarse meshlets that have an error less than the threshold.
    * **Shading mode.** Debug display normals, triangles, meshlets, or Nanite LOD levels.
        * HW/SW/Impostor mode visualizes the rendering technique. It's red, green and blue color respectively.
    * `[IMPORTANT, GPU only]` **Freeze culling.** Stops updating culling data. With this button, you can preserve currently rendered triangles and still move the camera. You can check what was actually rendered during the particular frame. This is **THE** debug button for this app. Allows to verify both instance and meshlet culling, Nanite, and impostors.
        * Disables software rasterizer so you cannot show once 1-px sized triangle at fullscreen. This is done for your own safety.
    * `[IMPORTANT, GPU only]` **Software rasterizer options**. Enable/disable. Set the pixel threshold where a software rasterizer is used instead of a hardware one.
* `[GPU only]` **Instance culling.**
    * Enable instance culling. It's required for billboard impostors.
    * Enable/disable **instance frustum/occlusion culling**.
    * `[IMPORTANT]` Decide **impostor pixel threshold** after which instance is using billboard  instead of Nanite mesh. You can also force to use only impostors if you are interested in that subsystem.
    * **Billboard dithering** for a smoother transition between subsequent impostors' images. By default, there is an image taken every 30 degrees around the Y-axis. The result is a mix between the closest images w.r.t the camera position with a bit of dithering on top.
* `[GPU only]` **Meshlet culling.**
    * Enable/disable **meshlet frustum/occlusion culling**.
    * You can also force depth pyramid level for occlusion culling. Useful for testing.
* **Color mgmt.** Gamma, exposure, dithering.
* **DEBUG.** Various debug/misc stuff I've implemented.
    * Background color, ground rendering.
    * **Display mode** `DBG: depth pyramid` has a **"Pyramid level" slider** to preview particular mipmap. Red means 1.0. This mode is also accessible using the `e` key.
    * **"Reset camera" button**. It's actually quite useful if you get lost in the sea of instances. Everything looks the same!

## Running the app locally

WebGPU does not work on Firefox. On Chrome, it requires HTTPS even during development.

1. `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`. Move both files to `./static`.
2. `yarn install`.
3. `yarn dev`. Start a dev server that watches and compiles the code into `./build`. It also copies stuff from `./static`.
4. `yarn serve` in a separate terminal. Starts `http-server`. It's not included in `package.json`, but let's be honest - you already have it installed globally.

Or `yarn build` for prod build.

### Running the app in Deno incl. object export

Node.js does not support WebGPU. Deno does (since [version 1.39](https://deno.com/blog/v1.39), December 14, 2023 - 7 months ago). Internally, it uses Firefox's [wgpu](https://github.com/gfx-rs/wgpu).

1. Download the `.zip` file from [deno/releases](https://github.com/denoland/deno/releases).
2. Run unit tests:
    1. `"<path-to-unzipped-deno>/deno.exe" task test`.
3. Render to `./output.png`:
    1. `"<path-to-unzipped-deno>/deno.exe" task start`. Render default scene.
    2. `"<path-to-unzipped-deno>/deno.exe" task start <sceneName>` to render selected scene e.g. "bunnyRow".
4. Export processed Nanite objects into a `.json` and `.bin`:
    1. `"<path-to-unzipped-deno>/deno.exe" task start <sceneName> --export`. E.g. `deno.exe task start lucy --export`.
    2. Afterward, add the `.json` file into `OBJECTS` inside [sceneFiles.ts](src/scene/sceneFiles.ts). Then, a few lines below, define  a scene using the newly created object. Render it with `deno.exe task start <yourNewSceneName>`. Or, to use in the web browser, set the `?scene_file=<yourNewSceneName>` query param.


## FAQ - usage

### What are simplification warnings/errors?

Ideally, we would be able to reduce a mesh into a single meshlet (124 triangles). This way it would be cheap to render from far away. Unfortunately, it's not possible for almost any non-trivial mesh. Some objects contain unconnected parts, have smooth groups or complex UV islands. UE5 [reduces](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf#page=95) each object into DAG with 1 root cluster. In my implementation, once the simplifier gets "stuck", I terminate the subtree early. This produces many DAG roots, but it's easier to code. Each such event produces a warning in the console. This is OK, especially if it happened on the high LOD level.

There is 1 exception. E.g. imagine flat shading. All 3 triangle vertices share the same normal. A triangle next to it has a different normal, so another 3 **different** vertices. Yes, 2 neighboring triangles can contain 6 different unique vertices (instead of 4 like you have thought)! This is "impossible" to simplify. Usually happens if you have such "duplicated" vertices. Common causes are flat shading or tons of UV islands.`

> By "impossible to simplify" I mean I would have to actually write the code to handle this special case.


### When do I get the "software rasterizer disabled" banner?

This banner does not happen during normal usage. Only when:

1. "Freeze culling" is ON. It allows you to move the camera and inspect what was drawn in the last frame. This preserves a list of software-rasterized triangles. You could then move the camera so that the triangle that was rendered as 1 px is now fullscreen. Yet it is still software rasterized (cause "Freeze culling"). This is slow. And it could affect tens of millions of software-rasterized triangles at the same time.
    1. Let's just say it's a mistake you only do once.
2. You have disabled all culling, both for instances and meshlets. While the nanite LOD selection is unaffected, this could still be slow. You are rendering tens of millions of triangles, a lot of them smaller than a pixel. This case was optimized for Chrome process killing.


### Why do I have framerate fluctuations?

All browsers have enforced VSync. I have 2 monitors, one 144Hz, the other 60Hz. For me, chrome **always** aims for 144Hz. For comparison, [winit](https://github.com/rust-windowing/winit) on Windows switches this based on the screen where the app window is. 144Hz is not a lot of time per frame. Read more in [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).

The FPS in the top left corner is based on the wall clock time between `requestAnimationFrame()`. Instead, click the "Profile" button to get accurate timings per each pass.


### Why don't you XXX?

Does XXX:

* Fix the simplification problem?
* Give more insight on Nanite?
* Fix some bugs?

If not, then IMO it's not worth doing. This includes e.g. increasing performance and triangle throughput.


### Is WebGPU good?

See the [previous chapter](https://github.com/Scthe/gaussian-splatting-webgpu?tab=readme-ov-file#is-webgpu-good) in my last project. Updates:

* No `atomic<u64>`.
    * WGPU [might soon get it](https://github.com/gfx-rs/wgpu/commit/abba12ae4e5488b08d9e189fc37dab5e1755b443). But WGPU is designed for Firefox. The browser that does not have WebGPU in release builds (only nightly and canary). So Chrome, the browser that **has** WebGPU enabled will not support it.
* Storage with `array<vec3f>`. I'd say this code should just not compile.
* Do I have early-z? Who knows?
* Chrome's WGSL compiler accepts code that does not compile in [Naga](https://github.com/gfx-rs/wgpu/tree/trunk/naga). This app was developed using Chrome. My unit tests are written using Deno, which has wgpu under the hood. I know some of the people reading this just had glsl flashbacks. Sorry!
    * Getting the full app working on Deno required going shader-by-shader and fixing these issues. Not all shaders are unit-tested.
    * Typical errors: i32 where u32 is expected, pointer types that Chrome automatically casts, "the expression may only be indexed by a constant" (happens for const arrays).
* Connect RenderDoc or NVIDIA Nsight with the browser. Could be as an exporter replay file or something.
* [select(valueIfFalse, valueIfTrue, condition)](https://gpuweb.github.io/gpuweb/wgsl/#select-builtin) instead of ternary operator. The order of the parameters is..
* Push constants.
* Translating GLSL from my [WebFX](https://github.com/Scthe/WebFX) was not enjoyable. Whole ~200 LOC.

On a positive note, God bless [Deno's support for WebGPU](https://deno.com/blog/v1.39). This project would not be possible without unit tests. There are issues (1. keep tests short, 2. sometimes `GPUDevice.destroy()` hangs, etc.). The biggest selling point is saving PNG framebuffer previews. Actually amazing when developing software rasterizer and impostor rendering.



### What are your specs?

* RTX 3060
* Windows 11
* Chrome 126.0.6478.127
* Deno 1.43.5 (release, x86_64-pc-windows-msvc), uses: v8 12.4.254.13, typescript 5.4.5
