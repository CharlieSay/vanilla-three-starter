import { Mesh, CylinderGeometry, MeshStandardMaterial, Color } from 'three';
import { component } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';
import camera from '@/canvas/camera';
import { AStar } from '../pathfinding/AStar';

export class Player extends component(Mesh, {
  raf: {
    renderPriority: 10,
    fps: 60,
  },
}) {
  constructor(world) {
    const geometry = new CylinderGeometry(0.3, 0.3, 1, 8);
    const material = new MeshStandardMaterial({
      color: new Color(0.2, 0.6, 0.9),
      roughness: 0.7,
      metalness: 0.2,
    });

    super(geometry, material);

    this.world = world;
    this.pathfinder = new AStar(world);
    this.path = [];
    this.currentPathIndex = 0;
    this.speed = 3; // tiles per second
    this.targetPosition = null;
    this.isMoving = false;

    // Start at center of world
    const startX = Math.floor(world.width / 2);
    const startZ = Math.floor(world.height / 2);
    const startWorld = world.tileToWorld(startX, startZ);
    this.position.set(startWorld.x, 0.5, startWorld.z);
    this.updateMatrix();
  }

  init() {
    renderer.compileAsync(this, scene).then(() => {
      scene.add(this);
      this.setupClickHandler();
    });
  }

  setupClickHandler() {
    const onMouseClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // For orthographic camera, convert mouse coords to world coords
      // Camera is at y=30 looking down, so we need to project mouse to world plane
      const worldX = camera.position.x + (mouseX * (camera.right - camera.left) / 2);
      const worldZ = camera.position.z + (mouseY * (camera.top - camera.bottom) / 2);

      this.moveTo(worldX, worldZ);
    };

    renderer.domElement.addEventListener('click', onMouseClick);
    this.clickHandler = onMouseClick;
  }

  moveTo(worldX, worldZ) {
    const tile = this.world.worldToTile(worldX, worldZ);
    const currentTile = this.world.worldToTile(this.position.x, this.position.z);

    if (tile.x === currentTile.x && tile.z === currentTile.z) {
      return;
    }

    const path = this.pathfinder.findPath(
      currentTile.x,
      currentTile.z,
      tile.x,
      tile.z
    );

    if (path && path.length > 0) {
      this.path = path.map((p) => {
        const world = this.world.tileToWorld(p.x, p.z);
        return { x: world.x, z: world.z };
      });
      this.currentPathIndex = 0;
      this.isMoving = true;
    }
  }

  onRaf({ delta }) {
    if (!this.isMoving || this.path.length === 0) return;

    const target = this.path[this.currentPathIndex];
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.1) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.path.length) {
        this.isMoving = false;
        this.path = [];
        return;
      }
      return;
    }

    const moveDistance = this.speed * delta;
    const moveRatio = Math.min(moveDistance / distance, 1);

    this.position.x += dx * moveRatio;
    this.position.z += dz * moveRatio;

    // Look at movement direction
    if (dx !== 0 || dz !== 0) {
      const angle = Math.atan2(dx, dz);
      this.rotation.y = angle;
    }

    this.updateMatrix();
  }

  dispose() {
    if (this.clickHandler) {
      renderer.domElement.removeEventListener('click', this.clickHandler);
    }
    super.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
