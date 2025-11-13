import { Object3D } from 'three';
import { component } from '@/canvas/dispatcher';
import scene from '@/canvas/scene';
import { TerrainGenerator } from './TerrainGenerator';
import { Chunk } from './Chunk';

export class World extends component(Object3D, {
  raf: {
    renderPriority: 0,
    fps: Infinity,
  },
}) {
  constructor(width = 64, height = 64, chunkSize = 16) {
    super();
    this.width = width;
    this.height = height;
    this.chunkSize = chunkSize;
    this.chunks = new Map();
    this.tileMap = new Map();
    this.generator = new TerrainGenerator(width, height);
  }

  init() {
    this.generateWorld();
    scene.add(this);
  }

  generateWorld() {
    const tileData = this.generator.generate();
    
    // Store tiles in a map for quick lookup
    tileData.forEach(({ x, z, type, height }) => {
      const key = `${x},${z}`;
      this.tileMap.set(key, { x, z, type, height, walkable: type !== 'water' });
    });

    // Organize tiles into chunks
    const chunksData = new Map();
    
    tileData.forEach(({ x, z, type, height }) => {
      const chunkX = Math.floor(x / this.chunkSize);
      const chunkZ = Math.floor(z / this.chunkSize);
      const chunkKey = `${chunkX},${chunkZ}`;
      
      if (!chunksData.has(chunkKey)) {
        chunksData.set(chunkKey, []);
      }
      
      chunksData.get(chunkKey).push({ x, z, type, height });
    });

    // Create chunk components
    chunksData.forEach((tiles, chunkKey) => {
      const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
      const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, tiles);
      this.chunks.set(chunkKey, chunk);
      this.add(chunk);
    });
  }

  getTileAt(x, z) {
    const key = `${Math.floor(x)},${Math.floor(z)}`;
    return this.tileMap.get(key);
  }

  isWalkable(x, z) {
    const tile = this.getTileAt(x, z);
    return tile ? tile.walkable && !tile.occupied : false;
  }

  worldToTile(worldX, worldZ) {
    return {
      x: Math.floor(worldX),
      z: Math.floor(worldZ),
    };
  }

  tileToWorld(tileX, tileZ) {
    return {
      x: tileX + 0.5,
      z: tileZ + 0.5,
    };
  }
}
