import { Mesh, CylinderGeometry, MeshStandardMaterial, Color } from 'three';
import { component } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';
import { AStar } from '../pathfinding/AStar';

export class NPC extends component(Mesh, {
  raf: {
    renderPriority: 10,
    fps: 30, // Lower FPS for NPCs to reduce load
  },
}) {
  constructor(world, x, z, type = 'villager') {
    const geometry = new CylinderGeometry(0.25, 0.25, 0.8, 8);
    const material = new MeshStandardMaterial({
      color: NPC.getColorForType(type),
      roughness: 0.7,
      metalness: 0.2,
    });

    super(geometry, material);

    this.world = world;
    this.pathfinder = new AStar(world);
    this.type = type;
    this.path = [];
    this.currentPathIndex = 0;
    this.speed = 1.5 + Math.random() * 0.5; // 1.5-2 tiles per second
    this.isMoving = false;
    this.idleTime = 0;
    this.maxIdleTime = 2 + Math.random() * 3; // 2-5 seconds idle
    this.wanderRadius = 5 + Math.random() * 5; // 5-10 tile radius
    this.homeX = x;
    this.homeZ = z;
    this.state = 'idle'; // 'idle', 'wandering', 'returning'

    // Start position
    const worldPos = world.tileToWorld(x, z);
    this.position.set(worldPos.x, 0.4, worldPos.z);
    this.updateMatrix();
  }

  static getColorForType(type) {
    const colors = {
      villager: new Color(0.8, 0.6, 0.4), // Beige
      guard: new Color(0.5, 0.5, 0.7), // Gray-blue
      merchant: new Color(0.7, 0.5, 0.3), // Brown
    };
    return colors[type] || colors.villager;
  }

  init() {
    renderer.compileAsync(this, scene).then(() => {
      scene.add(this);
    });
  }

  findRandomWalkableTile(centerX, centerZ, radius) {
    const attempts = 20;
    for (let i = 0; i < attempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = Math.floor(centerX + Math.cos(angle) * distance);
      const z = Math.floor(centerZ + Math.sin(angle) * distance);

      if (this.world.isWalkable(x, z)) {
        return { x, z };
      }
    }
    return null;
  }

  startWandering() {
    const currentTile = this.world.worldToTile(this.position.x, this.position.z);
    const targetTile = this.findRandomWalkableTile(
      this.homeX,
      this.homeZ,
      this.wanderRadius
    );

    if (!targetTile) {
      // If can't find target, just idle longer
      this.idleTime = 0;
      this.maxIdleTime = 3 + Math.random() * 2;
      return;
    }

    const path = this.pathfinder.findPath(
      currentTile.x,
      currentTile.z,
      targetTile.x,
      targetTile.z
    );

    if (path && path.length > 0) {
      this.path = path.map((p) => {
        const world = this.world.tileToWorld(p.x, p.z);
        return { x: world.x, z: world.z };
      });
      this.currentPathIndex = 0;
      this.isMoving = true;
      this.state = 'wandering';
    } else {
      // Path not found, stay idle
      this.idleTime = 0;
      this.maxIdleTime = 2 + Math.random() * 2;
    }
  }

  returnHome() {
    const currentTile = this.world.worldToTile(this.position.x, this.position.z);
    const homeWorld = this.world.tileToWorld(this.homeX, this.homeZ);
    const homeTile = this.world.worldToTile(homeWorld.x, homeWorld.z);

    if (currentTile.x === homeTile.x && currentTile.z === homeTile.z) {
      this.state = 'idle';
      return;
    }

    const path = this.pathfinder.findPath(
      currentTile.x,
      currentTile.z,
      homeTile.x,
      homeTile.z
    );

    if (path && path.length > 0) {
      this.path = path.map((p) => {
        const world = this.world.tileToWorld(p.x, p.z);
        return { x: world.x, z: world.z };
      });
      this.currentPathIndex = 0;
      this.isMoving = true;
      this.state = 'returning';
    } else {
      // Can't pathfind home, try wandering instead
      this.startWandering();
    }
  }

  onRaf({ delta, elapsedTime }) {
    // Update AI state
    if (this.state === 'idle') {
      this.idleTime += delta;
      if (this.idleTime >= this.maxIdleTime) {
        this.idleTime = 0;
        this.maxIdleTime = 2 + Math.random() * 3;
        this.startWandering();
      }
    } else if (this.state === 'wandering' && !this.isMoving) {
      // Finished wandering, decide to return home or wander more
      const distanceFromHome = Math.sqrt(
        Math.pow(this.position.x - this.world.tileToWorld(this.homeX, this.homeZ).x, 2) +
        Math.pow(this.position.z - this.world.tileToWorld(this.homeX, this.homeZ).z, 2)
      );

      if (distanceFromHome > this.wanderRadius * 1.5) {
        this.returnHome();
      } else if (Math.random() < 0.3) {
        // 30% chance to return home
        this.returnHome();
      } else {
        // Continue wandering
        this.startWandering();
      }
    } else if (this.state === 'returning' && !this.isMoving) {
      this.state = 'idle';
    }

    // Handle movement
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
    super.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
