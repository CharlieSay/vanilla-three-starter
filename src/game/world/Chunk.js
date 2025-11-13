import { Object3D } from 'three';
import { component } from '@/canvas/dispatcher';
import { Tile } from './Tile';

export class Chunk extends component(Object3D) {
  constructor(chunkX, chunkZ, chunkSize, tiles) {
    super();
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.chunkSize = chunkSize;
    this.tiles = [];
    this.loaded = false;
    this.tileData = tiles;
  }

  init() {
    this.load();
  }

  load() {
    if (this.loaded) return;

    this.tileData.forEach(({ x, z, type, height }) => {
      const tile = new Tile(x, z, type, height);
      this.tiles.push(tile);
      this.add(tile);
    });

    this.loaded = true;
  }

  unload() {
    if (!this.loaded) return;

    this.tiles.forEach((tile) => {
      tile.dispose();
    });
    this.tiles = [];
    this.clear();
    this.loaded = false;
  }

  getTileAt(worldX, worldZ) {
    return this.tiles.find(
      (tile) => tile.tileX === worldX && tile.tileZ === worldZ
    );
  }

  dispose() {
    this.unload();
    super.dispose();
  }
}
