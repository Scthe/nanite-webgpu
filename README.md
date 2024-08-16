# Nanite WebGPU

> TL;DR: [Demo scene Jinx](https://scthe.github.io/nanite-webgpu/?scene_file=jinxCombined&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.1) (640m triangles). [Sample scene with many objects](https://scthe.github.io/nanite-webgpu/?scene_file=manyObjects2&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=1.0) (1.7b triangles). White triangles in the Jinx scene are software-rasterized. **WebGPU is only available on Chrome!**

This project contains a [Nanite](https://youtu.be/qC5KtatMcUw?si=IOWaVk0sQNra_R6O&t=97) implementation in a web browser using WebGPU. This includes the meshlet LOD hierarchy, software rasterizer (at least as far as possible given the current state of WGSL), and billboard impostors. Culling on both per-instance and per-meshlet basis (frustum and occlusion culling in both cases). Supports textures and per-vertex normals. Possibly every statistic you can think of. There is a slider or a checkbox for every setting imaginable. Also works offline using Deno.

First, we will see some screenshots, then there is (not even complete) list of features. Afterward, I will link you to a couple of **demo scenes** you can play with. In the FAQ section, you can read **my thoughts about Nanite**. Since this file got a bit long, I've moved usability-oriented stuff (stats/GUI explanation, build process, and unit test setup) into a separate [USAGE.md](USAGE.md).

> EDIT 16-08-2024: I've rewritten significant parts of this README once I had more time to look through it. And I've written [Frostbitten hair WebGPU](https://github.com/Scthe/frostbitten-hair-webgpu) meantime #self-promo.


![scene-multiobject](https://github.com/user-attachments/assets/ef4c8476-bf30-4241-96d0-a354efa0dea1)


*[Sample scene](https://scthe.github.io/nanite-webgpu/?scene_file=manyObjects2&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=1.0) containing 1.7b triangles. Nearly 98% of the triangles are software rasterized, as it's much faster than hardware.*

![scene-jinx](https://github.com/user-attachments/assets/4eef5e85-03dd-43f3-9a99-afbce59407f0)

*My [primary test scene](https://scthe.github.io/nanite-webgpu/?scene_file=jinxCombined&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.1). [Arcane - Jinx](https://sketchfab.com/3d-models/arcane-jinx-b74f25a5ee6e43efbe9766b9fbebc705) 3D model by sketchfab user [Craft Tama](https://sketchfab.com/rizky08). Unfortunately, the best simplification we get is from 44k to 3k triangles. The white triangles are software-rasterized triangles (between hardware-rasterized ones and the impostors in the far back). WebGPU does not support `atomic<u64>`, so I had to compress the data to fit into 32 bits (u16 for depth, 2\*u8 for octahedron-encoded normals). It's a painful limitation, but at least you can see the entire system is working.*

## Features

* Nanite
    * **Meshlet LOD hierarchy.**
        * Mesh preprocessing executes in the browser, using WebAssembly for [meshoptimizer](https://github.com/zeux/meshoptimizer) and [METIS](http://glaros.dtc.umn.edu/gkhome/metis/metis/overview). While it might raise eyebrows, this was one of the goals.
        * There is a file exporter too, if you don't like to wait between page refreshes.
    * **Software rasterizer.**
        * WebGPU does not have the `atomic<u64>` needed to implement this feature efficiently. Currently, I'm packing depth (`u16`) and octahedron-encoded normals (`2 * u8`) into 32 bits. It's enough to show that the rasterizer works.
        * With only 32 bits, we are butchering the precision. My only concern here is to show that the rasterization works. If you see the software rasterized bunny model in the background it will be white and it will have *reasonable* shading. Reprojecting depth and "compressing" normals is enough to get something.. not offending.
        * This also affects the depth pyramid used for occlusion culling.
        * There are other algorithms to do this. PPLL, or something with tiles, or double rasterization (1st pass writes depth, 2nd does compareExchange). But the 32-bit limitation is only in WebGPU, so I choose to stick to UE5's solution instead.
    * **Billboard impostors.** 12 images around the UP-axis, blended (with dithering) based on the camera position. Does not handle up/down views. Contains both diffuse and normals, so we can do nice shading at a runtime. UE5 [uses](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf#page=97) a more advanced version integrated with a visibility buffer.
        * [Impostors preview demo scene](https://scthe.github.io/nanite-webgpu/?scene_file=jinxCombined&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.1&impostors_forceonlybillboards&impostors_texturesize=512). For this demo, I've increased the impostor texture size. This way you can see more details.
* Culling:
    * **Per-instance:** frustum and occlusion culling.
    * **Per-meshlet:** frustum and occlusion culling.
    * **Per-triangle:** hardware backface culling and ofc. z-buffer. WebGPU does not have early-z.
        * I have no idea how early-z works in WebGPU (it does not).
    * I've also tried per-meshlet backface cone culling. It worked fine, but I cut it from the final release. See FAQ below for more details.
    * Occlusion culling is just a depth pyramid from the previous frame's depth buffer. No reprojection and no two-pass. The current implementation is enough to cull a lot of triangles (**A LOT!**) and to judge the performance impact (big improvement!). I expect someone will want to read the code, and they will be grateful this feature was not added.
* Switch between **GPU-driven rendering** and a **naive CPU implementation**. I have not spent much time optimizing the CPU version. It works, you can step through it with the debugger.
* Supports **textured models** and **many different objects** at the same time.
* Controls to **change parameters at runtime**. Debug views. "Freeze culling" allows the camera to move and inspect only what was drawn last frame.
* A lot of **stats**. Memory, geometry. Total scene meshlets, triangles. Drawn meshlets, triangles (split between hardware and software rasterizer). Impostor count. Dedicated profiler button to get the timings.
* **Custom file format** so you don't have to preprocess the mesh every time. This is optional, you **can also use an OBJ file**.
* Vertex **position quantization** (vec2u), **octahedron encoded normals** (vec2f).
    * Position quantization is off by default. Toggle `CONFIG.useVertexQuantization` to enable. There are *funny* things happening to the numbers there, but everything *should* be handled correctly.
* Handles window resize. It's a web browser after all.
* The whole app also **runs offline in [Deno](https://deno.com/)**. I've written shader unit tests this way.
* Tons of WebGPU and WGSL code that you can copy to your own project. If you want to do something, I've either attempted to do it or discovered that it does not work.

### Goals

There were 2 primary goals for this project:

1. **Simplicity.** We start with an OBJ file and everything is done in the app. No magic pre-processing steps, Blender exports, etc. You set the breakpoint at `loadObjFile()` and F10 your way till the first frame finishes.
2. **Experimentation.** I could have built this with Vulkan and Rust. None would touch it. Instead, it's a webpage. You click the link, uncheck the checkbox and the FPS tanks 40%. And you think to yourself: "OK, that was an important checkbox. But what about this slider?". Or: "How does scene X affect memory allocation?". Right now I know that a lot of code can be optimized. Yet it would not matter till the simplification problem is solved.

## Demo Scenes

* [Jinx](https://scthe.github.io/nanite-webgpu/?scene_file=jinxCombined&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.1) (120\*120 instances, 640m triangles). A single Jinx is 44k triangles simplified to 3k at 59 root meshlets. Uses an OBJ file.
* [Lucy and dragons](https://scthe.github.io/nanite-webgpu/?scene_file=manyObjects2&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=1.0) (both objects at 70\*70 instances, 1.7b triangles). See below for per-object details.
* [Lucy](https://scthe.github.io/nanite-webgpu/?scene_file=lucy1b&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.5) (110\*110 instances, 1.2b triangles). A single Lucy statue is 100k triangles simplified to 86 at a single root meshlet. Uses binary file.
* [Dragons](https://scthe.github.io/nanite-webgpu/?scene_file=dragonJson&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.5) (70\*70 instances, 1.2b triangles). A single dragon is 250k triangles simplified to 102 at a single root meshlet. Uses binary file.
* [Bunnies](https://scthe.github.io/nanite-webgpu/?scene_file=bunny1b&impostors_threshold=1000&softwarerasterizer_threshold=2400) (500\*500 instances, 1.2b triangles). A single bunny is 5k triangles simplified to 96 at a single root meshlet. Uses an OBJ file. Bunnies are so small most are frustum culled.
* [Impostors preview](https://scthe.github.io/nanite-webgpu/?scene_file=jinxCombined&impostors_threshold=4000&softwarerasterizer_threshold=1360&nanite_errorthreshold=0.1&impostors_forceonlybillboards&impostors_texturesize=512). For this demo, I've increased the impostor texture size. This way you can see more details.

## Usage

You can find details in [USAGE.md](USAGE.md). Short version:

* Use the `[W, S, A, D]` keys to move and `[Z, SPACEBAR]` to fly up or down. `[Shift]` to move faster.
* If there is something weird, toggle culling options on/off. There are some minor bugs in the implementation.
* The white triangles are software-rasterized triangles (between hardware-rasterized ones and the impostors in the far back). WebGPU does not support `atomic<u64>`, so I had to compress data to fit into 32 bits (u16 for depth, 2\*u8 for octahedron encoded normals).
    * 16-bit depth is.. not a great idea. It produces **tons** of artifacts like z-fighting or leaks. Turn the software rasterizer off to easier inspect raw Nanite meshlets. Be prepared for a major performance hit!
* FPS might fluctuate due to the browser's enforced VSync. Use the "Profile" button instead.

## FAQ

### What are the major differences compared to UE5's Nanite?

* Error metric is just a simple projected simplification error (read below).
* Meshlet simplification is.. simplistic.
* No two-pass occlusion culling.
    * This would not be complicated to add, just tedious to debug. Unfortunately, it also has some interactions with the GUI settings. ATM some parts of the code are riddled with `ifs` for certain user settings. For example, you could press "Freeze culling" to stop updating the list of drawn meshlets. This includes software rasterized meshlets. Move the camera in this mode and all 10+ million 1 px-sized software rasterized triangles might become fullscreen. Adding two-pass occlusion culling might expose more such interactions. It would also make the code harder to read, which goes against my goals.
* No work queue in shaders. For meshlet culling and LOD selection, I dispatch thread per-meshlet.
* No VRAM eviction of unused LODs and streaming.
    * Theoretically, to load new meshlet data, you would write requested `meshletIds` into a separate GPUBuffer. Download it to RAM and load the content. Keep LRU (timestamp per-meshlet, visible from CPU) to manage evictions. In practice, I suspect you might also want to add a priority system.
* No visibility buffer. It's not possible with the `atomic<u64>` limitation that I have.
    * BTW if you render material data into a GBuffer, you get Nanite integration with your material system for free.
* No built-in shadows/multiview.
* My implementation focuses on using a predictable amount of memory for demo cases. This means it's not scalable if you have many **different** objects (not instances). You would have to know the upper bound of the drawn meshlets to preallocate buffers that hold data between the stages. The naive solutions like `bottomLevelMeshletsCount * instanceCount` easily end up in GBs of VRAM!
* No BVH for instances (or any other hierarchical implementation). I just take all instances and frustum + occlusion cull them.
* I don't have a GPU profiler on the web/Deno. Or a debugger, or printf for that matter.
    * ITWouldGenerate_DX_CODE_THATIWOULDHAVE_TO_READ_ANYWAY_SONOiGUESS.

### Does xxx billions of triangles mean anything?

There was a video on YouTube showing how Nanite handles 120 billion triangles. Yet most of them were frustum culled? Performance depends on a lot of factors.

#### Dense meshes

Having a lot of dense meshes up close could have a negative performance impact. Unless you are so close to them that they cover 50% of the screen. Then, the occlusion culling kicks in. Dense geometry also means that meshlets are small. 128 triangles in a 20,000,000 triangle mesh? They do not take much space on the screen and are easily occlusion/cone culled.

#### Instance count

What about millions of instances? Each has its own mat4x3 transform matrix. This consumes VRAM. Obligatory link to [swallowing the elephant (part 2)](https://pharr.org/matt/blog/2018/07/09/moana-island-pbrt-2). During the frame, you also need to store a list of things to render. In the worst-case scenario, each instance will render its most dense meshlets. In my implementation, this allocates `instanceCount * bottomLevelMeshletsCount * sizeof(vec2u)` bytes. A 5k triangle bunny might have only 56 fine-level meshlets (out of 159 total), but what if I want to render 100,000 of them? This is not a scalable memory allocation. In Chrome, WebGPU has a 128MB limit for storage buffers (can be raised if needed). You might notice that the demo scenes above were tuned to reflect that.

#### Scene arrangement

The scenes in my app have objects arranged in a square. For far objects, only a small part will be visible. But they will use coarse meshlet LOD, that contains more than just a visible part. The visible part passes occlusion culling and leads to a lot of overdraw for the rest of the meshlet. This is not an optimal scene arrangement. You would also think that a dense grid placement (objects close to each other) is bad. It certainly renders more triangles close to the camera. But it also means that there are no huge differences in depth between them. This is a dream for occlusion culling. You could build a wall from high-poly meshes and it's actually one of the most performant scenarios. Objects far from each other mean that a random distant pixel pollutes the depth pyramid (the [Swiss cheese theory](https://www.youtube.com/@MentourPilot/videos)). Does your scene have a floor? Can you [merge](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf#page=96) far objects into one?

#### In practice

This leads to the **Jinx test scene**. The character is skinny. Looking down each row/column of the grid you can see the gaps. There is space between her arm and torso. This kills occlusion culling. The model does not simplify well. 3k triangles in the most coarse LOD (see below for more details). It's death by thousands of 1-pixel triangles. Software rasterizer helps a lot. Yet given the scene arrangement, most of the instances are rendered as impostors. Up close, the hardware rasterizer takes over. All 3 systems have different strengths.

> With UE5's simplification algorithm, the balance is probably shifted. Much more software rasterizer, and less hardware one. And I wager a bet they don't have to rely on impostors as much. Their coarse LOD would be less than 3k tris (again, see below).

Basically, there are a lot of use cases. If you want a **stable** Nanite implementation, you have to test each one. But if you want a big triangle count, there are ways to cheat that too.

### What surprised you about Nanite?

1) The goal of the DAG is not to "use fewer triangles for far objects". The goal is to have a consistent 1 pixel == 1 triangle across the entire screen. A triangle is our "unit of data". The artist imports a sculpture from ZBrush. We need to need a way (through an error metric) to display it no matter if it's 1m or 500m from the camera. This is not possible with discrete LOD meshes (each LOD level is a separate geometry). Sometimes you would want an LOD between 2 levels. You need continuous LODs. This is the reason for the meshlet hierarchy. It allows you to "sample" geometry at any detail level you choose.
2) You spend more time working on culling and meshlets instead of Nanite itself. You **WILL** reimplement both ["Optimizing the Graphics Pipeline with Compute"](https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2016/Presentations/Wihlidal_Graham_OptimizingTheGraphics.pdf) and ["GPU-Driven Rendering Pipelines"](https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf).
3) Meshlet LOD hierarchy is quite easy to get working. Praise [meshoptimizer](https://github.com/zeux/meshoptimizer) and [METIS](http://glaros.dtc.umn.edu/gkhome/metis/metis/overview)! But if you want to do it efficiently, [it will be a pain](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf#page=50). See next question for full story. I just went with the simplest option.
4) If your mesh does not simplify cleanly, you end up with e.g. ~3000 triangles that cover a single pixel (Jinx scene). The efficiency scales with your mesh simplification code. And if you want pixel-sized triangles (the main selling point for most people), you **need** a software rasterizer. The billboard impostors are also a good stability-oriented fallback. As mentioned above, the whole system should work cohesively.


### What about mesh simplification?

> Remember, we are not doing a simple "take a mesh and return something that has X% of the triangles". We are doing the simplification in the context of meshlets and METIS.

UE5 has its own mesh simplification code. It's the first thing that happens in the asset pipeline. Thus, everything saved here will have avalanche-like benefits for the rest of the system. It was also a problem with the Jinx model. On [slide 95](https://advances.realtimerendering.com/s2021/Karis_Nanite_SIGGRAPH_Advances_2021_final.pdf#page=95) Brian Karis states that **all** their LOD graphs end at a **single** root cluster. So no matter the model you provide, they can simplify it to 128 triangles. It makes you less reliant on the impostors. In my app, I could e.g. increase meshoptimizer's `target_error` parameter. But consider the following story:

1. My first test model was a bunny with 5k triangles. Easy to debug (check for holes, etc.). It simplified into a single 128 tris meshlet. Nice!
2. I've tried to load the Jinx model. At some point, the simplification stopped. You gave it X triangles and received the same X triangles. This crashed my app on an assertion.
3. OK, so if the model does not simplify beyond some level, I will allow the DAG to have many roots. If you failed to remove at least 6+% of the triangles, stop the algorithm for this part of the mesh.
4. The Jinx model now works correctly. It stops simplifying beyond 7-9 LOD levels, but this only means there are many hierarchy roots.
5. I load the bunny again and it no longer simplifies to a single root meshlet. Turns out, **a lot of the meshlets did not reduce triangles that much**. But with enough iterations, for such a simple model, we were able to reduce it to only 128 triangles. The whole time we were getting the <6% simplification for some meshlets (so 94% of triangles were left untouched). We just did not know about it. And a lot of meshlets were also not "full". They contained less than 128 triangles.

> To reproduce, use `const SCENE_FILE: SceneName = 'singleBunny';` and set `CONFIG.nanite.preprocess.simplificationFactorRequirement: 0.94`. This option requires triangle reduction by at least 6%. We end up with 512 triangles. Then, set `simplificationFactorRequirement: 0.97` (require reducing triangle count by at least 3%, which is much more lenient). You end up with a single root that has 116 tris.

It was my first time using meshoptimizer, so you can probably tune it better. In the offline setting, it's possible to retry simplification with a bigger `target_error`. Or increase `target_error` for more coarse meshlet levels? From my experiments, both of these changes do not matter. You could also allow the hierarchy to have the bottom children on different levels (probably? there are some issues with this approach e.g. non-uniform mesh density). Maybe generate conservative (with a bigger triangle count than usual), discrete LOD levels in an old way and then use them if the algorithm gets stuck? This makes the error metric and the entire hierarchy pointless. Introduce new custom vertices? Merge more meshlets than 4? Smaller meshlets? Replace meshoptimizer? UE5 also has special weights for METIS partitioning. **Most important, can your (METIS-enchanced) simplification, guarantee that splitting 256 triangles into 128 triangles, will ALWAYS result in 128 triangles?** I think that once you have this guarantee, the simplification (while still not trivial), is significantly easier. With it, you no longer have to think about the concept of triangles in your meshlet hierarchy. You can start thinking only about DAG and nodes. This highlights the need for goor bottom-level meshlets.

You may need someone to dedicate their time only to simplification. Personally, I just got it to work and moved on.

![simplification](https://github.com/user-attachments/assets/157866eb-88e9-4896-895a-9400915478a4)

*Trying to Nanite-simplify [Modular Mecha Doll Neon Mask](https://sketchfab.com/3d-models/modular-mecha-doll-neon-mask-1e0dcf3e016f4bc897d4b39819220732) (910k tris) 3D model by Sketchfab user [Chambersu1996](https://sketchfab.com/chambersu1996). After the 5th hierarchy level, the simplification stops with 180k triangles left. This would be inefficient to render, but still manageable if we switched to impostors **quickly**. A better solution would be to actually spend X hours investigating the simplification process.*

### What about error metric?

Assume you have a mesh that has 20,000,000 triangles. With meshlet hierarchy, you can render it at any triangle count you would have wanted (with a minimum of 128 triangles - 1 meshlet). How do you choose the right meshlets? What does the *right meshlet* mean? At the end of the day, **THIS** is exactly what Nanite is. Everything else (simplification, meshlet DAG, software rasterizer, etc.) is just a prerequisite to actually start working on this problem. I admit, as the author of this repo, it's a bit disheartening.

A few days ago, SIGGRAPH 2024 presentations were published. In ["Seamless rendering on mobile"](https://advances.realtimerendering.com/s2024/content/Cao-NanoMesh/AdavanceRealtimeRendering_NanoMesh0810.pdf), Shun Cao from Tencent Games provided the following metric (slide 12):

```js
device_factor = device_power * device_level
// from the slightly blurred graph image it seems to be:
// decay_factor(x) = 1 / (1 + exp(-(x-5000) / 1000)) from 0 to 9000
decay_factor = 1 / (1 + exp(distance_to_view / decay_distance))
threshold = projected_area * device_factor * decay_factor
```

*[Wolfram alpha for decay_factor](https://www.wolframalpha.com/input?i=f%28x%29+%3D+1+%2F+%281+%2B+exp%28-%28x-5000%29+%2F+1000%29%29+from+0+to+9000) as far as I was able to decipher from the function image.*

I have used projected simplification error (as provided by meshoptimizer). It's not a great metric for Nanite. I think that other vertex attributes have to be part of this function too. You should be able to assign different weights on a per-attribute basis. Normals on Jinx's face were a huge problem. In my app, I could just move the LOD error threshold slider to the left. I can say that this approach has an educational value. You will have to find something better.


### Should you write your own implementation of Nanite?

Depends. The simplest answer is to just use UE5. You will not beat UE5 in its own game. Looking at Steam's front page, most of the games are simple enough to not need it. It's interesting that (at the time of the writing) the 2 most known Nanite titles are Fortnite and Senua's Saga: Hellblade II. Both have opposite objectives and tones. I recommend the Digital Foundry's ["Inside Senua's Saga: Hellblade 2 - An Unreal Engine 5 Masterpiece - The Ninja Theory Breakdown"](https://www.youtube.com/watch?v=u-zmFVzUmPc). E.g. they've mentioned a separate Houdini pipeline to extract transparency from static meshes. And while both games are different, both were developed by excellent engineering and visual teams.

If you want to write your own implementation as a side project, then don't let me stop you. But unless you tackle simplification and error metric problems, you will end up with code similar to mine. You will still learn a lot.

If you want to add this tech to the existing engine, I'm not a person you should be asking (I don't work in the industry). In my opinion, you should start by implementing ["Optimizing the Graphics Pipeline with Compute"](https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2016/Presentations/Wihlidal_Graham_OptimizingTheGraphics.pdf) and ["GPU-Driven Rendering Pipelines"](https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf) first. This is already quite a complex task. Multi-step culling is tricky. You have to handle scene and world chunk management. Animated meshes. And that's just the beginning. But with these incremental steps, you will have something that works and can be tested at every step of the transition. Once this is stable, you can try a software rasterizer. Even if you don't end up shipping it, there is a lot to learn. Depending on the codebase, it can be surprisingly easy to add. Only after you have done the above steps you should try adding Nanite-like tech. As the various sliders in my app can tell you, they are all required for Nanite to be performant. The basic meshlet hierarchy for a toy renderer is a weekend project. Real implementation will have to deal with simplification and error metric issues.


### Is per-meshlet backface cone culling worth it?

I've implemented the basics, but the gains are limited. Check the comment in [constants.ts](https://github.com/Scthe/nanite-webgpu/blob/8c15e85b32d8b890ef573f58f1fbb782544f972c/src/constants.ts#L160) for implementation details.

1. It works best if you have a dense mesh where all triangles in a cluster have similar normals. Dense meshes are something that Nanite was designed for. Yet coarse LOD levels will have normals pointing in different directions. Arseny Kapoulkine had [similar observations](https://zeux.io/2023/04/28/triangle-backface-culling/#estimating-culling-efficiency).
2. There is some duplication with occlusion culling. Backfaces are behind front faces in the z-buffer.
3. Computing the cone is done on a per-meshlet level. For me, this means a WebAssembly call every time. This took 30% of the whole preprocessing step. Preprocessing all models offline would solve this problem. Yet it goes against my goals for this project. I want you to take the simplest possible 3D object format and see that my program works. That's why this app is a webpage and not Rust+Vulkan. No one would have cloned the repo to run the code. But everyone has clicked the demo links above (right?).


## Honourable mentions

* Arseny Kapoulkine. This app is only possible due to [meshoptimizer](https://github.com/zeux/meshoptimizer). I've also watched a few of niagara videos and read its source code. And read his blog.
    * [Newer meshoptimizer versions](https://github.com/zeux/meshoptimizer/pull/704) have `meshopt_SimplifySparse` specifically for Nanite clones. I've not updated to this version as I am moving on from this app. I want to leave it in a state that I've tested during development.
* Folks from Epic Games. Not only for creating Nanite but also for being open on how it works under the hood.
* ["Optimizing the Graphics Pipeline with Compute"](https://ubm-twvideo01.s3.amazonaws.com/o1/vault/gdc2016/Presentations/Wihlidal_Graham_OptimizingTheGraphics.pdf) by Graham Wihlidal.
* ["GPU-Driven Rendering Pipelines"](https://advances.realtimerendering.com/s2015/aaltonenhaar_siggraph2015_combined_final_footer_220dpi.pdf) by Ulrich Haar and Sebastian Aaltonen.
* [METIS](http://glaros.dtc.umn.edu/gkhome/metis/metis/overview).
* [Emscripten](https://emscripten.org/). Used to run both meshoptimizer and METIS in the browser.
    * [Webassembly Tutorial](https://marcoselvatici.github.io/WASM_tutorial/) by Marco Selvatici.
* [Arcane - Jinx](https://sketchfab.com/3d-models/arcane-jinx-b74f25a5ee6e43efbe9766b9fbebc705) 3D model by sketchfab user [Craft Tama](https://sketchfab.com/rizky08). Used under [CC Attribution](https://creativecommons.org/licenses/by/4.0/) license.
    * I've merged the textures, adjusted UVs, and removed the weapon.
