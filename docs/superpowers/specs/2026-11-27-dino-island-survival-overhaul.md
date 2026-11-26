# Dino Island — survival overhaul specification

**Target:** Android-first browser 3D survival game on Three.js and GitHub Pages.
**Base:** current main branch; keep vanilla JS and static hosting.
**Quality rule:** every system must be playable and saved; avoid fake buttons and cosmetic-only features.

## Current defects and root causes
- Camera is positioned at player minus (sin(yaw), cos(yaw)) and looks at the player. At yaw 0, camera-forward points toward world -Z, while movement currently maps forward to +Z. The player moves opposite the camera heading.
- The island consists of three flat circles. There is no height field, collision world or navigation. The player can walk through trees, rocks and dinosaurs and can leave the circular land.
- Only three creatures exist; only the hostile rex can be hit. AI is simplistic.
- HUD only shows resource counters and two meters. No inventory, crafting, building, progression or persistent world.
- The game is a large inline module. New systems should be split into small pure modules where possible.

## Design goals
1. Correct camera-relative movement tested against actual screen-forward and screen-right directions.
2. Solid collision and island boundaries with player, creature and building blockers.
3. A visibly larger, varied, non-flat island with several biomes and landmarks.
4. More creatures with varied behavior and non-hostile damage/reaction rules.
5. Useful mobile-first UI with functional inventory, crafting, building and progression.
6. Persistent save/load for player, inventory, XP, structures and world state.
7. Android performance remains a hard constraint; measure before adding effects.

## Core systems and interfaces
- src/game-logic.js: pure camera-relative movement, circle/AABB collision, collision resolution, inventory stack rules, crafting affordability/consumption, XP/level calculations.
- src/world-generation.js: seeded deterministic height sampling, biome sampling and spawn candidates; no Three.js dependency.
- src/save-system.js: versioned save serialization, validation, migration defaults and safe localStorage adapter.
- src/boot-controller.js: retain guarded boot state machine.
- src/ui-state.js: inventory, crafting, building and progression view state; UI controls must perform real game actions.
- tests/*.test.js: Node built-in tests for pure logic and save/load.
- index.html: renderer, scene, input, entity visuals and UI wiring; progressively move logic into modules.

## Movement and collisions
- Derive movement basis from camera yaw: forward is camera view-forward projected onto XZ; screen-right is camera local +X projected onto XZ.
- Joystick up moves camera-forward; joystick right moves screen-right. Keyboard WASD follows the same basis.
- Normalize diagonals and use delta-time movement.
- Player capsule is approximated by a circle/capsule in XZ. Static blockers include trunks, rocks, large bushes, cliffs and placed structures. Creatures use soft separation and solid proximity.
- Resolve movement axis-by-axis or with swept-circle collision to avoid tunneling; do not only clamp final position.
- Island boundary follows terrain/shoreline, not square bounds. Player cannot enter deep water or climb near-vertical slopes.
- Gathering and melee use proximity/aim checks; collision must not prevent interaction.

## World and terrain
- Replace flat disks with seeded heightfield terrain and multiple height/color zones.
- Increase traversable land substantially (initial design target radius 100 world units; tune after mobile profiling).
- Zones: beach, meadow, dense forest, rocky hills, mountain ridge and a small swamp/river basin.
- Landmarks: waterfall, cave entrance, ruins/abandoned camp, elevated lookout and resource-rich grove.
- Rivers and lakes use low-cost geometry; vegetation density is tiered by device capability.
- Seeded generation keeps map and resource nodes stable across sessions.
- Terrain mesh has controlled vertex count and distance visibility; never rebuild terrain every frame.

## Creatures and combat
- Data-driven roster: role, health, speed, damage, detection radius, diet, aggression and drops.
- Initial roster: small herbivore, herd herbivore, armored herbivore, small scavenger, flying creature, pack predator and apex predator.
- Behaviors: idle, wander, graze, flee, defend, hunt, attack, return-home and sleep.
- Any creature can be attacked if its species has a damage response; herbivores flee/defend, predators retaliate, small creatures flee. Drops are species-specific.
- AI updates less often at distance; distant entities use low-frequency simulation.
- Spawn caps and biome/time-of-day tables prevent overcrowding and frame spikes.

## Survival, inventory and crafting
- Player stats: health, stamina, hunger, thirst and temperature exposure; sleep/rest can follow later.
- Inventory grid with stack limits, categories, item details, equipment slots and quickbar.
- Gathering yield depends on equipped tool; tools have durability.
- Crafting stations unlock advanced recipes. First recipes: stone axe, spear, campfire, storage box, workbench and basic wall/foundation.
- Recipe UI shows ingredients and explains why crafting is unavailable.
- Items are data-driven; icons may start as lightweight SVG/CSS placeholders.

## Building
- Build mode with ghost preview, snap grid, rotate, place, cancel and demolish.
- Initial pieces: foundation, wall, doorway, window wall, roof, stairs, fence, campfire, storage box and workbench.
- Validate terrain slope, collision overlap, player distance and material cost before placement.
- Structures persist in save data and restore after reload.
- Reuse low-poly geometries/materials and instance where practical.

## Progression
- XP from exploration, gathering, crafting, building and creature encounters.
- Level-up awards skill points.
- Branches: Survival (health/stamina/hunger), Gathering (yield/tool durability), Combat (damage/defense), Builder (cost/structure durability).
- Skill effects are real gameplay modifiers and persist.

## UI and controls
- Compact HUD: health, stamina, hunger, thirst, XP/level, quickbar, interaction prompt and creature status.
- Large touch targets, safe-area support, menus do not obscure controls.
- Panels: Inventory, Crafting, Build, Skills, Map, Journal/Quests and Settings.
- Pause panel with resume/save/settings.
- Every button has working behavior; no decorative placeholders.
- Right-side camera drag must not trigger when interacting with panels/buttons. Menus pause world simulation.

## Save and stability
- Versioned localStorage save with schema validation, migration and recovery from malformed JSON.
- Save player location/stats, inventory, XP/skills, structures, collected resources and world seed.
- Autosave at safe intervals and explicit save; show save status.
- No duplicate animation loops on resume/restart. Clamp delta time after tab suspension.
- WebGL context loss shows recovery UI; do not claim full restoration unless tested.

## Performance budgets
- Target stable 30 FPS on lower-end Android and up to 60 FPS where possible; targets are not guarantees until measured.
- Device tiers control pixel ratio, view distance, vegetation density, creature cap, shadows and effects.
- Instancing, shared geometry/materials, pooled effects, distance-based AI and simple collision primitives.
- Avoid expensive real-time shadows or physics engine in first pass.
- Measure frame time and entity counts; diagnostics toggle for FPS/active creatures/draw calls where available.

## Delivery milestones
A. Correct controls and robust collision, verified by unit tests and a test arena.
B. Terrain/biomes/landmarks and world scale, verified with bounds and generation tests.
C. Creature roster, AI state machine, combat and drops.
D. Inventory, survival stats, crafting and save/load.
E. Build mode, placement validation and structure persistence.
F. Progression, quests/map, polished UI and mobile performance pass.

## Acceptance criteria
- At yaw 0, pi/2, pi and -pi/2, joystick up always moves camera-forward and joystick right always moves screen-right.
- Diagonal speed equals straight-line speed.
- Player cannot walk through trunks, rocks or walls, nor leave land; sliding along blockers is possible.
- Terrain visibly varies in height and has at least four recognizable zones.
- At least seven creature archetypes have distinct behavior; all have valid hit/reaction logic.
- Inventory, crafting, build, progression and save/load are operable, not mock UI.
- Reload restores structures and progress.
- Automated tests and syntax checks pass; Android FPS is reported only after device testing.