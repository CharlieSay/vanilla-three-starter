export class TerrainGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.seed = Math.random() * 1000;
  }

  generate() {
    const tiles = [];
    
    for (let z = 0; z < this.height; z++) {
      for (let x = 0; x < this.width; x++) {
        const height = this.getHeight(x, z);
        const type = this.getTileType(x, z, height);
        tiles.push({ x, z, type, height });
      }
    }

    return tiles;
  }

  getHeight(x, z) {
    // Simple noise-based heightmap
    const scale = 0.1;
    const height = Math.sin(x * scale + this.seed) * Math.cos(z * scale + this.seed) * 0.3;
    return height;
  }

  getTileType(x, z, height) {
    // Create some water areas
    const waterNoise = Math.sin(x * 0.2 + this.seed) * Math.cos(z * 0.2 + this.seed);
    if (waterNoise > 0.3 && height < 0.1) {
      return 'water';
    }

    // Create some stone areas
    const stoneNoise = Math.sin(x * 0.15 + this.seed * 2) * Math.cos(z * 0.15 + this.seed * 2);
    if (stoneNoise > 0.5) {
      return 'stone';
    }

    // Create some dirt patches
    const dirtNoise = Math.sin(x * 0.25 + this.seed * 3) * Math.cos(z * 0.25 + this.seed * 3);
    if (dirtNoise > 0.2 && dirtNoise < 0.4) {
      return 'dirt';
    }

    // Default to grass
    return 'grass';
  }

  // Generate town areas (flat, grass)
  generateTownArea(centerX, centerZ, radius) {
    const tiles = [];
    for (let z = -radius; z <= radius; z++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= radius) {
          tiles.push({
            x: centerX + x,
            z: centerZ + z,
            type: 'grass',
            height: 0,
          });
        }
      }
    }
    return tiles;
  }
}
