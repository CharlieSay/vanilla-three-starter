export class AStar {
  constructor(world) {
    this.world = world;
  }

  findPath(startX, startZ, endX, endZ) {
    const start = { x: Math.floor(startX), z: Math.floor(startZ) };
    const end = { x: Math.floor(endX), z: Math.floor(endZ) };

    if (!this.world.isWalkable(end.x, end.z)) {
      return null;
    }

    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${start.x},${start.z}`;
    const endKey = `${end.x},${end.z}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, end));

    while (openSet.length > 0) {
      // Find node with lowest fScore
      let current = openSet[0];
      let currentIndex = 0;
      const currentKey = `${current.x},${current.z}`;

      for (let i = 1; i < openSet.length; i++) {
        const node = openSet[i];
        const nodeKey = `${node.x},${node.z}`;
        if ((fScore.get(nodeKey) || Infinity) < (fScore.get(currentKey) || Infinity)) {
          current = node;
          currentIndex = i;
        }
      }

      if (`${current.x},${current.z}` === endKey) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.splice(currentIndex, 1);

      const neighbors = this.getNeighbors(current.x, current.z);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.z}`;
        const tentativeGScore = (gScore.get(currentKey) || Infinity) + 1;

        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));

          if (!openSet.some((n) => `${n.x},${n.z}` === neighborKey)) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return null; // No path found
  }

  getNeighbors(x, z) {
    const neighbors = [];
    const directions = [
      { dx: 0, dz: -1 }, // North
      { dx: 1, dz: 0 },  // East
      { dx: 0, dz: 1 },  // South
      { dx: -1, dz: 0 }, // West
      { dx: 1, dz: -1 }, // NE
      { dx: 1, dz: 1 },  // SE
      { dx: -1, dz: 1 }, // SW
      { dx: -1, dz: -1 }, // NW
    ];

    for (const dir of directions) {
      const nx = x + dir.dx;
      const nz = z + dir.dz;
      if (this.world.isWalkable(nx, nz)) {
        neighbors.push({ x: nx, z: nz });
      }
    }

    return neighbors;
  }

  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = `${current.x},${current.z}`;

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      path.unshift(current);
      currentKey = `${current.x},${current.z}`;
    }

    return path;
  }
}
