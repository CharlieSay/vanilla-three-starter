import { Mesh, PlaneGeometry, MeshStandardMaterial, Color } from 'three';
import { component } from '@/canvas/dispatcher';
import renderer from '@/canvas/renderer';
import scene from '@/canvas/scene';

export class Tile extends component(Mesh) {
  constructor(x, z, type = 'grass', height = 0) {
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshStandardMaterial({
      color: Tile.getColorForType(type),
      roughness: 0.8,
      metalness: 0.1,
    });

    super(geometry, material);

    this.tileX = x;
    this.tileZ = z;
    this.type = type;
    this.height = height;
    this.walkable = type !== 'water';
    this.occupied = false;

    this.rotation.x = -Math.PI / 2;
    this.position.set(x, height, z);
    this.updateMatrix();
  }

  static getColorForType(type) {
    const colors = {
      grass: new Color(0.4, 0.7, 0.3),
      dirt: new Color(0.6, 0.5, 0.3),
      water: new Color(0.2, 0.4, 0.8),
      stone: new Color(0.5, 0.5, 0.5),
      sand: new Color(0.9, 0.8, 0.6),
    };
    return colors[type] || colors.grass;
  }

  init() {
    renderer.compileAsync(this, scene).then(() => {
      scene.add(this);
    });
  }

  setOccupied(value) {
    this.occupied = value;
  }

  dispose() {
    super.dispose();
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
