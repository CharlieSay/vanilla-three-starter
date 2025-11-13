# Phase 1 Testing Guide

## How to Start

1. **Install dependencies** (if not already done):
   ```bash
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm run dev
   ```

3. **Open your browser**:
   - The server will start on `http://localhost:4000` (or the port shown in terminal)
   - Open that URL in your browser

## What to Test

### Visual Checks
- ✅ You should see a **top-down view** of a procedurally generated world
- ✅ The world should have different colored tiles:
  - **Green** = Grass
  - **Brown** = Dirt
  - **Blue** = Water (non-walkable)
  - **Gray** = Stone
- ✅ A **blue cylinder** (player character) should be visible at the center of the world
- ✅ **Sky blue background** should be visible

### Functionality Tests

1. **Click-to-Move**:
   - Click anywhere on the ground tiles
   - The player should smoothly move to that location
   - The camera should follow the player

2. **Pathfinding**:
   - Try clicking on the other side of a water tile
   - The player should pathfind around the water (not walk through it)
   - Movement should be smooth and follow a logical path

3. **Camera Following**:
   - Move the player around
   - The camera should smoothly follow the player's position
   - The view should remain top-down

4. **World Generation**:
   - The terrain should be different each time you refresh
   - Water tiles should be scattered throughout the world
   - The world should be 64x64 tiles (you can see the full extent by moving around)

## Debug Mode

The game runs with debug mode enabled by default. You should see:
- **Stats panel** (FPS counter) in the top-left corner
- **lil-gui** debug panel (if configured)

## Troubleshooting

### If the game doesn't load:
1. Check the browser console (F12) for errors
2. Make sure all dependencies are installed: `pnpm install`
3. Check that the dev server is running on the correct port

### If clicking doesn't work:
1. Make sure you're clicking on walkable tiles (not water)
2. Check browser console for JavaScript errors
3. Try refreshing the page

### If performance is poor:
1. The world is 64x64 tiles (4096 tiles total) - this is intentional for testing JS limitations
2. Check the FPS counter in the stats panel
3. Try reducing world size in `src/main.js` (change `new World(64, 64, 16)` to smaller values)

## Expected Performance

- **Target FPS**: 60 FPS
- **World Size**: 64x64 tiles (4096 tiles)
- **Chunk Size**: 16x16 tiles per chunk
- **Player Speed**: 3 tiles per second

## Next Steps

Once Phase 1 is verified working, you can proceed to Phase 2 (NPCs & AI).
