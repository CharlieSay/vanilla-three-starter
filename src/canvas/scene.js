import { Scene, DirectionalLight, AmbientLight, Color } from 'three';

const scene = /* @__PURE__ */ new Scene();
scene.background = new Color(0x87ceeb); // Sky blue background

// Add lighting
const ambientLight = new AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

export default scene
