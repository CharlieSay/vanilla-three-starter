import { component } from '@/canvas/dispatcher';
import { NPC } from './NPC';

export class NPCManager extends component(null, {
  raf: {
    renderPriority: 1,
    fps: 10, // Update spawn/despawn less frequently
  },
}) {
  constructor(world, player) {
    super();
    this.world = world;
    this.player = player;
    this.npcs = new Map();
    this.spawnDistance = 15; // Spawn NPCs within 15 tiles
    this.despawnDistance = 20; // Despawn NPCs beyond 20 tiles
    this.maxNPCsPerArea = 3; // Max NPCs per spawn area
    this.spawnAreas = [];
  }

  init() {
    this.generateSpawnAreas();
    this.updateNPCs();
  }

  generateSpawnAreas() {
    // Create spawn areas around the world (avoid water)
    const attempts = 50;
    let areasCreated = 0;

    for (let i = 0; i < attempts && areasCreated < 10; i++) {
      const x = Math.floor(Math.random() * this.world.width);
      const z = Math.floor(Math.random() * this.world.height);

      if (this.world.isWalkable(x, z)) {
        // Check if area is far enough from other areas
        let tooClose = false;
        for (const area of this.spawnAreas) {
          const distance = Math.sqrt(
            Math.pow(x - area.x, 2) + Math.pow(z - area.z, 2)
          );
          if (distance < 10) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          this.spawnAreas.push({
            x,
            z,
            npcCount: 0,
            type: this.getRandomNPCType(),
          });
          areasCreated++;
        }
      }
    }
  }

  getRandomNPCType() {
    const types = ['villager', 'villager', 'villager', 'guard', 'merchant'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getDistanceToPlayer(worldX, worldZ) {
    const playerTile = this.world.worldToTile(
      this.player.position.x,
      this.player.position.z
    );
    return Math.sqrt(
      Math.pow(worldX - playerTile.x, 2) + Math.pow(worldZ - playerTile.z, 2)
    );
  }

  spawnNPC(area) {
    if (area.npcCount >= this.maxNPCsPerArea) return;

    // Find a walkable tile near the spawn area
    let spawnX = area.x;
    let spawnZ = area.z;
    let attempts = 0;
    
    while (!this.world.isWalkable(spawnX, spawnZ) && attempts < 10) {
      spawnX = area.x + Math.floor((Math.random() - 0.5) * 4);
      spawnZ = area.z + Math.floor((Math.random() - 0.5) * 4);
      attempts++;
    }

    if (!this.world.isWalkable(spawnX, spawnZ)) {
      return; // Couldn't find walkable tile
    }

    const npcId = `npc_${area.x}_${area.z}_${area.npcCount}_${Date.now()}`;
    const npc = new NPC(this.world, spawnX, spawnZ, area.type);
    this.npcs.set(npcId, { npc, area });
    area.npcCount++;
  }

  despawnNPC(npcId) {
    const npcData = this.npcs.get(npcId);
    if (!npcData) return;

    npcData.npc.dispose();
    npcData.area.npcCount--;
    this.npcs.delete(npcId);
  }

  updateNPCs() {
    const playerTile = this.world.worldToTile(
      this.player.position.x,
      this.player.position.z
    );

    // Check existing NPCs for despawning
    const npcsToDespawn = [];
    for (const [npcId, { npc, area }] of this.npcs.entries()) {
      const npcTile = this.world.worldToTile(npc.position.x, npc.position.z);
      const distance = Math.sqrt(
        Math.pow(npcTile.x - playerTile.x, 2) + Math.pow(npcTile.z - playerTile.z, 2)
      );

      if (distance > this.despawnDistance) {
        npcsToDespawn.push(npcId);
      }
    }

    // Despawn distant NPCs
    npcsToDespawn.forEach((npcId) => this.despawnNPC(npcId));

    // Spawn NPCs in nearby areas
    for (const area of this.spawnAreas) {
      const distance = this.getDistanceToPlayer(area.x, area.z);

      if (distance <= this.spawnDistance) {
        // Spawn NPCs if needed
        while (area.npcCount < this.maxNPCsPerArea) {
          this.spawnNPC(area);
        }
      }
    }
  }

  onRaf() {
    this.updateNPCs();
  }

  dispose() {
    // Despawn all NPCs
    for (const npcId of this.npcs.keys()) {
      this.despawnNPC(npcId);
    }
    super.dispose();
  }
}
