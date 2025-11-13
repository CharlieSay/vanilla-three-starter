import { OrthographicCamera, Vector3 } from 'three';

import { component } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';

class Camera extends component(OrthographicCamera, {
  raf: {
    renderPriority: 5,
    fps: 60,
  },
}) {
  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    const viewSize = 20;
    super(-viewSize * aspect, viewSize * aspect, viewSize, -viewSize, 0.1, 1000);
  }

  init() {
    // Top-down view
    this.position.set(0, 30, 0);
    this.lookAt(new Vector3(0, 0, 0));
    this.rotation.x = -Math.PI / 2;
    this.followTarget = null;
  }

  setFollowTarget(target) {
    this.followTarget = target;
  }

  onRaf() {
    if (this.followTarget) {
      // Follow target smoothly
      const targetX = this.followTarget.position.x;
      const targetZ = this.followTarget.position.z;
      
      this.position.x += (targetX - this.position.x) * 0.1;
      this.position.z += (targetZ - this.position.z) * 0.1;
      
      this.updateProjectionMatrix();
    }
  }

  onResize({ width, height, ratio }) {
    const viewSize = 20;
    this.left = -viewSize * ratio;
    this.right = viewSize * ratio;
    this.top = viewSize;
    this.bottom = -viewSize;
    this.updateProjectionMatrix();
  }
}

export default new Camera();
