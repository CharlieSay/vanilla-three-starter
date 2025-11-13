# RuneScape Knockoff Implementation Plan

## Overview
Transform this Three.js starter into a minimal RuneScape-like game to test JavaScript limitations around performance, memory management, and single-threaded execution.

## Core Systems

### 1. World/Map System
- **Tile-based world** (64x64 tiles = ~4096 tiles)
- **Chunk system** for LOD/culling (16x16 tile chunks)
- **Terrain generation**: Simple heightmap with grass/water/dirt tiles
- **Town placement**: 2-3 small towns with building clusters

### 2. Player System
- **Top-down/isometric camera** (fixed angle, follows player)
- **Click-to-move** pathfinding (A* or simple grid-based)
- **Player sprite/model**: Simple animated character
- **Movement speed**: Configurable tiles/second

### 3. NPC System
- **Walking NPCs**: 10-20 NPCs per town
- **Simple AI**: Random walk patterns, pathfinding around obstacles
- **NPC types**: Guards, merchants, villagers
- **Spawn/despawn**: Based on distance from player

### 4. Skills System
- **Mining**: Click rocks → mine → gain XP → level up
- **Woodcutting**: Click trees → chop → gain XP → level up
- **Combat**: Click NPCs/monsters → attack → gain XP
- **Skill UI**: XP bars, levels, progress indicators

### 5. Buildings & Towns
- **Town structures**: 2-3 small towns (5-10 buildings each)
- **Building types**: Shops, houses, town halls
- **Interior system**: Simple (optional, can skip for MVP)

### 6. UI System
- **Skill panel**: Shows active skills with XP bars
- **Inventory**: Simple item storage (optional for MVP)
- **Minimap**: Top-right corner showing world overview
- **Action queue**: Shows current action (mining, walking, etc.)

## Technical Architecture

### Component Structure
```
src/
├── game/
│   ├── world/
│   │   ├── World.js          # Main world manager
│   │   ├── Tile.js           # Individual tile component
│   │   ├── Chunk.js          # Chunk manager for LOD
│   │   └── TerrainGenerator.js
│   ├── entities/
│   │   ├── Player.js         # Player entity
│   │   ├── NPC.js            # NPC base class
│   │   └── NPCManager.js     # Handles NPC spawning/despawning
│   ├── skills/
│   │   ├── Skill.js          # Base skill class
│   │   ├── Mining.js
│   │   ├── Woodcutting.js
│   │   └── Combat.js
│   ├── towns/
│   │   ├── Town.js           # Town data/structure
│   │   ├── Building.js       # Building component
│   │   └── TownManager.js
│   ├── camera/
│   │   └── GameCamera.js     # Top-down camera controller
│   └── ui/
│       ├── SkillPanel.js
│       ├── Minimap.js
│       └── ActionQueue.js
```

### JS Limitation Testing Areas

1. **Performance Testing**
   - Many moving entities (NPCs) updating simultaneously
   - Pathfinding calculations in main thread
   - Frequent object creation/destruction (items, particles)

2. **Memory Management**
   - Chunk loading/unloading
   - NPC spawn/despawn cycles
   - Asset management (textures, geometries)

3. **Single-threaded Bottlenecks**
   - Pathfinding blocking main thread
   - Skill calculations during actions
   - World generation/updates

## Implementation Phases

### Phase 1: Foundation (World + Player)
- [ ] Create tile-based world system
- [ ] Implement terrain generation (simple heightmap)
- [ ] Add top-down camera with player follow
- [ ] Implement click-to-move player movement
- [ ] Basic pathfinding (grid-based A*)

### Phase 2: NPCs & AI
- [ ] Create NPC component with simple mesh/sprite
- [ ] Implement random walk AI
- [ ] Add pathfinding for NPCs
- [ ] NPC spawn/despawn system based on distance
- [ ] NPC manager for batch updates

### Phase 3: Skills System
- [ ] Create base Skill class
- [ ] Implement Mining skill (click rocks, gain XP)
- [ ] Implement Woodcutting skill
- [ ] Implement Combat skill
- [ ] Skill UI panel with XP bars

### Phase 4: Towns & Buildings
- [ ] Define town layouts (2-3 towns)
- [ ] Create building components
- [ ] Place buildings in towns
- [ ] Add NPCs to towns with appropriate AI

### Phase 5: Polish & Testing
- [ ] Minimap implementation
- [ ] Action queue UI
- [ ] Performance profiling hooks
- [ ] Memory usage monitoring
- [ ] Stress testing (many NPCs, long play sessions)

## Technical Decisions

### Camera
- Switch from OrbitControls to fixed top-down view
- Camera follows player smoothly
- Zoom level configurable

### Rendering
- Use instanced rendering for tiles where possible
- Batch NPC rendering
- Frustum culling for chunks

### Pathfinding
- Grid-based A* algorithm
- Cache paths where possible
- Limit pathfinding calculations per frame

### Performance Targets
- 60 FPS with 50 NPCs active
- Smooth movement at 30+ tiles/second
- <100ms pathfinding calculations
- Memory usage <500MB for full world

## Assets Needed

### Models/Sprites
- Player character (simple animated mesh or sprite)
- NPC models (3-4 variants)
- Building models (house, shop, town hall)
- Resource nodes (rock, tree)

### Textures
- Terrain textures (grass, dirt, water, stone)
- Building textures
- UI elements

### Audio (Optional)
- Footstep sounds
- Skill action sounds
- Ambient town sounds

## Next Steps

1. Start with Phase 1: World + Player foundation
2. Test performance early with basic systems
3. Iterate on NPC count and complexity
4. Add skills incrementally
5. Build towns last (they're mostly visual)
