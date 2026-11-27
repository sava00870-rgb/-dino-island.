# Dino Island Survival Overhaul Implementation Plan

> Implement tasks in order with test-first changes. Keep each milestone playable and independently verifiable.

**Goal:** Transform Dino Island from a tiny flat demo into an Android-friendly survival game with correct controls, collisions, a varied island, creatures, inventory, crafting, building and progression.
**Architecture:** Keep Three.js and GitHub Pages. Extract pure gameplay systems into ES modules so Node's built-in test runner can verify movement, collision, inventory, crafting, progression and save data without WebGL. Wire each system into the browser scene only after its logic is tested.
**Tech Stack:** Three.js 0.160.0, vanilla ES modules, Node.js built-in test runner, GitHub Actions.
**Spec:** docs/superpowers/specs/2026-11-27-dino-island-survival-overhaul.md

## Global Constraints
- Preserve static GitHub Pages hosting and Android-first touch controls.
- No heavyweight framework, physics engine or paid asset dependency in the first pass.
- All buttons in new panels must perform real actions.
- Every gameplay system persists through a versioned save.
- Never claim mobile FPS without real Android measurements.

## Review Focus
- Camera yaw changes and joystick/keyboard inputs must preserve screen-relative directions.
- Fast movement must not tunnel through thin obstacles.
- Resource collision and interaction ranges must not conflict.
- Seeded world generation must produce stable spawn and save identifiers.
- Menus and touch controls must not leak pointer events into camera look or movement.

---

### Task 1: Correct camera-relative movement
**Files:** modify src/game-logic.js, tests/game-logic.test.js and index.html.
**Interface:** movementVector(yaw, forward, strafe) returns a normalized world XZ vector; positive forward is camera view-forward and positive strafe is camera screen-right.
- [ ] Add failing tests for forward and screen-right basis at yaw 0, pi/2, pi and -pi/2.
- [ ] Test joystick up, joystick right and diagonal normalization.
- [ ] Run npm test and confirm current helper fails camera-forward assertions.
- [ ] Implement correct basis and update keyboard/joystick mapping.
- [ ] Run full npm test and inline syntax checks.

### Task 2: Collision primitives and player movement
**Files:** create src/collision.js and tests/collision.test.js; modify index.html.
**Interface:** resolveCircleMovement(position, delta, radius, obstacles, bounds) returns a collision-resolved XZ position and collision flags. Obstacles are circles or axis-aligned boxes; island bounds use a circle and terrain constraints.
- [ ] Test free movement, circle blocking, AABB blocking, wall sliding, island boundary and diagonal collision.
- [ ] Verify tests fail before implementation.
- [ ] Implement swept/axis-separated circle resolution with deterministic ordering.
- [ ] Connect trunks, rocks and large bushes to blocker data; add player body radius.
- [ ] Add creature separation and building blockers.
- [ ] Verify collision does not prevent nearby resource interaction.

### Task 3: Seeded terrain and biome layout
**Files:** create src/world-generation.js and tests/world-generation.test.js; modify index.html.
**Interface:** createWorld(seed, config) returns deterministic height/biome samplers and stable spawn/resource records; sampleHeight(x,z), sampleBiome(x,z), isLand(x,z).
- [ ] Test determinism, bounds, height variation, biome coverage and safe spawn placement.
- [ ] Implement seeded noise using lightweight deterministic value noise; no dependency.
- [ ] Replace flat disks with a finite-resolution terrain mesh and shoreline transition.
- [ ] Add beach, meadow, forest, rocky hills and mountain zones; add river/swamp basin and landmarks.
- [ ] Add device-tier vegetation density and distance-based visibility.

### Task 4: Creature roster and behavior state machine
**Files:** create src/creatures.js and tests/creatures.test.js; modify index.html.
**Interface:** species definitions contain role, stats, biome/time spawn weights, aggression, drops and hit reaction. updateCreatureAI(creature, context, dt) returns state and movement/attack intent.
- [ ] Test herbivore flee/defend, predator pursuit/attack/return, passive creature flee, health and drop tables.
- [ ] Implement data-driven species and AI state machine.
- [ ] Add at least seven creature archetypes with spawn caps and distance-based update frequency.
- [ ] Make melee target any valid creature and apply species-specific reaction.

### Task 5: Inventory, survival, crafting and save data
**Files:** create src/inventory.js, src/save-system.js, tests/inventory.test.js and tests/save-system.test.js; modify index.html.
**Interface:** inventory supports add/remove/stack/equip with explicit result reasons. Crafting consumes ingredients atomically only when affordable. Save schema is versioned and validates player, inventory, skills, world seed and structures.
- [ ] Test stack limits, partial add, remove, crafting affordability/consumption, malformed save recovery and migration.
- [ ] Implement pure inventory/crafting/save logic.
- [ ] Add hunger, thirst and survival HUD.
- [ ] Add usable inventory and crafting panels, quickbar and item tooltips.
- [ ] Persist player, resources and progression through localStorage.

### Task 6: Building system
**Files:** create src/building.js and tests/building.test.js; modify index.html.
**Interface:** validatePlacement(piece, transform, world) returns valid/reason; createStructure(pieceId, transform) returns serializable structure data.
- [ ] Test slope, overlap, distance, resource cost and valid snapping.
- [ ] Implement placement validation and grid snapping.
- [ ] Add ghost preview, rotate/place/cancel/demolish interactions.
- [ ] Add foundations, walls, doorway, window, roof, stairs, fence, campfire, chest and workbench.
- [ ] Save and restore structures.

### Task 7: Progression, quests, map and UI polish
**Files:** create src/progression.js and tests/progression.test.js; modify index.html.
**Interface:** XP thresholds, level-up points, skill branches and modifiers are pure data. UI state exposes open panel, selected slot, selected recipe, selected build piece and pause state.
- [ ] Test XP thresholds, skill point allocation, modifier effects and invalid allocations.
- [ ] Implement Survival/Gathering/Combat/Builder branches.
- [ ] Add map, journal, starter quests and achievements.
- [ ] Replace minimal HUD with responsive mobile-first panels and large touch controls.
- [ ] Ensure UI pointer events do not rotate camera or move player.

### Task 8: Integration, optimization and release candidate
**Files:** modify gameplay modules, index.html and .github/workflows/checks.yml.
- [ ] Run full npm test and JavaScript syntax checks.
- [ ] Add integration tests for save/reload, building persistence, combat and collision interactions.
- [ ] Verify no duplicate animation loops and bounded entity counts.
- [ ] Profile draw calls, entity count and frame time with available browser tooling.
- [ ] Verify GitHub Pages route and report real Android testing as pending until performed.

## Scope note
This is a staged overhaul, not a promise that every feature ships in one unverified commit. Each milestone should remain playable. New 3D art packs or paid generation are not required for the first implementation; use optimized procedural assets until a specific asset pack is separately approved.