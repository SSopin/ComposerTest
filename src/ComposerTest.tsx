import { useEffect, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { TAARenderPass } from "three/examples/jsm/postprocessing/TAARenderPass";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import { useWindowSize } from "./useWindowResize";
import { createComposer } from "./createComposer";
import { FpsStats } from "./FpsStats";

type PostProcessingPasses = {
  outputPass: OutputPass;
  renderPass: RenderPass;
  taaPass: TAARenderPass;
};

type Props = {
  canvas: HTMLCanvasElement;
};

export function ComposerTest({ canvas }: Props) {
  const [width, height] = useWindowSize();

  const camera = useMemo(
    () => new THREE.PerspectiveCamera(45, width / height, 10, 200),
    [],
  );
  const renderer = useMemo(() => createRenderer(canvas), []);
  const scene = useMemo(() => new THREE.Scene(), []);
  const group = useMemo(() => new THREE.Group(), []);
  scene.background = useMemo(() => new THREE.Color(0xffffff), []);
  const [avgFps, setAvgFps] = useState({ fps: 0, measurements: 0 });

  useEffect(() => {
    if (WebGL.isWebGL2Available() === false) {
      document.body.appendChild(WebGL.getWebGL2ErrorMessage());
      return;
    }

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 5);
    hemiLight.position.set(1, 1, 1);
    scene.add(hemiLight);

    const geometry = new THREE.SphereGeometry(10, 64, 40);
    const material = new THREE.MeshLambertMaterial({
      color: 0xee0808,
      polygonOffset: true,
      polygonOffsetFactor: 1, // positive value pushes polygon further away
      polygonOffsetUnits: 1,
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(Math.random() + 20);
      group.add(mesh);

      const mesh2 = new THREE.Mesh(geometry, material2);
      mesh2.position.copy(mesh.position);
      mesh2.rotation.copy(mesh.rotation);
      mesh2.scale.copy(mesh.scale);
      group.add(mesh2);
    }

    scene.add(group);
  }, []);

  /** ======================================= *
   * ====== ↓ COMPOSER TEST IS HERE ↓  ====== *
   * ======================================== */

  // Uncomment one of the lines below, refresh the page and see the result. (One at a time)
  const composerAndTarget = createComposer(renderer); // Fast
  // const composerAndTarget = useMemo(() => createComposer(renderer), []); // Slow

  /** ======================================= *
   * ====== ↑ COMPOSER TEST IS HERE ↑  ====== *
   * ======================================== */

  const postPasses = useMemo(() => initPostprocessingPasses(scene, camera), []);

  useCallback(
    (composer: EffectComposer, postPasses: PostProcessingPasses) =>
      initPostprocessing(composer, postPasses),
    [composerAndTarget],
  )(composerAndTarget.composer, postPasses);

  useCallback(
    (
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      canvas: HTMLCanvasElement,
      composerTarget: {
        composer: EffectComposer;
        target: THREE.WebGLRenderTarget;
      },
      width: number,
      height: number,
    ) => updateSize(camera, renderer, canvas, composerTarget, width, height),
    [composerAndTarget, width, height],
  )(camera, renderer, canvas, composerAndTarget, width, height);

  const stats2 = useMemo(() => new FpsStats(), []);

  let fps2: number = 0;

  renderer.setAnimationLoop(() => {
    group.rotation.y += 0.002;

    stats2.begin();
    composerAndTarget.composer.render();
    fps2 = stats2.end();
    if (fps2 > 0) {
      const mesasurementsNum = avgFps.measurements + 1;
      setAvgFps({ fps: avgFps.fps + fps2, measurements: mesasurementsNum });
      console.log("Current FPS : " + fps2);
    }
  });

  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          fontSize: "36pt",
        }}
      >
        {"AVG FPS: " + avgFps.fps / avgFps.measurements}
      </div>
    </div>
  );
}

const createRenderer = (canvas: HTMLCanvasElement) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  // Setting max to 2 due to performance considerations.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, true);

  return renderer;
};

const initPostprocessingPasses = (
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): PostProcessingPasses => {
  return {
    taaPass: new TAARenderPass(scene, camera),
    outputPass: new OutputPass(),
    renderPass: new RenderPass(scene, camera),
  };
};

const initPostprocessing = (
  composer: EffectComposer,
  postprocessingPasses: PostProcessingPasses,
) => {
  postprocessingPasses.taaPass.sampleLevel = 3;

  composer.addPass(postprocessingPasses.renderPass);
  composer.addPass(postprocessingPasses.taaPass);
  composer.addPass(postprocessingPasses.outputPass);
};

const updateSize = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  canvas: HTMLCanvasElement,
  composerTarget: { composer: EffectComposer; target: THREE.WebGLRenderTarget },
  width: number,
  height: number,
) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composerTarget.target.dispose();
  composerTarget.target.setSize(width, height);
  composerTarget.composer.setSize(width, height);

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.style.left = 0 + "px";
  canvas.style.top = 0 + "px";
};
