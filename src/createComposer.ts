import { Vector2, WebGLRenderTarget, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

const bufferSize = new Vector2();
export const createComposer = (renderer: WebGLRenderer) => {
  let renderTarget = undefined;
  const size = renderer.getDrawingBufferSize(bufferSize);
  renderTarget = new WebGLRenderTarget(size.width, size.height, {
    samples: 8,
  });
  return {
    composer: new EffectComposer(renderer, renderTarget),
    target: renderTarget,
  };
};
