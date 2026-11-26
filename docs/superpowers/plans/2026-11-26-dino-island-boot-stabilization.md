# Dino Island Boot Stabilization Implementation Plan

> **For agentic workers:** Execute tasks in order; keep each task independently testable.

**Goal:** Make the existing Dino Island page start reliably, handle missing Three.js/WebGL without a dead button, and establish regression tests for movement and resource reset.

**Architecture:** Keep the current GitHub Pages deployment and Three.js. Extract testable pure logic where necessary, while keeping browser boot and rendering behind small adapters. This plan deliberately covers only the stabilization milestone; survival systems and new art are separate milestones after this foundation is verified.

**Tech Stack:** Three.js 0.160.0, vanilla JavaScript, Node.js built-in test runner, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-26-dino-island-rebuild-design.md`

## Global Constraints
- No heavy framework or physics engine.
- Keep the static GitHub Pages deployment working.
- Do not add paid external assets or services.
- UI remains usable when Three.js or WebGL is unavailable.
- No claim of Android verification without a real device test.

## Review Focus
- Three.js CDN missing or blocked: show a usable error screen and retry path.
- WebGL unavailable or renderer constructor throws: start button must not become dead.
- User taps start repeatedly: only one animation loop may run.
- Device rotates/resizes or tab resumes after a pause: camera and delta time remain valid.
- Resource indices overlap across instance groups: collecting and resetting each resource restores the correct object.

---

### Task 1: Add regression test harness

**Files:**
- Create: `package.json`
- Create: `tests/game-logic.test.js`
- Create: `src/game-logic.js` (pure helpers only)

**Interfaces:**
- Produces: `movementVector(yaw, forward, strafe)` and resource-state helpers that do not depend on Three.js or DOM.

- [ ] Write tests for forward/strafe movement at yaw 0, π/2, π and -π/2, including normalized diagonals.
- [ ] Run `npm test`; verify the tests fail because the module/API is not implemented.
- [ ] Implement the smallest pure helpers matching the tests.
- [ ] Run `npm test`; verify all movement tests pass.
- [ ] Commit the test harness and helpers.

### Task 2: Make browser boot fail-safe

**Files:**
- Modify: `index.html`
- Create or modify: `src/boot.js` only if it can be loaded reliably from the static root.

**Interfaces:**
- UI boot states: `loading`, `ready`, `playing`, `error`.
- A single guarded `startGame()` entry point; renderer initialization returns a success/failure result.

- [ ] Add tests for the boot-state controller using injected Three.js/renderer adapters.
- [ ] Run the tests and confirm the missing-library and renderer-throw cases fail before implementation.
- [ ] Register start/retry UI handlers before attempting WebGL initialization.
- [ ] Check `window.THREE` and WebGL availability; catch renderer construction errors.
- [ ] Keep a visible error message and retry action; do not start input or the animation loop until initialization succeeds.
- [ ] Guard animation-loop startup so repeated taps cannot create duplicate loops.
- [ ] Run `npm test` and `node --check` for every JavaScript file.

### Task 3: Fix resource lifecycle and restart

**Files:**
- Modify: `src/game-logic.js`
- Modify: `index.html` or extracted resource module.
- Test: `tests/game-logic.test.js`

**Interfaces:**
- Each resource stores its own mesh reference, instance index, original transform and optional linked instance references; indices are never inferred from a different resource array.

- [ ] Write failing tests for collecting one item of each resource type and restoring all items after reset.
- [ ] Run tests and confirm the current mixed-index behavior is represented by a failing regression.
- [ ] Implement resource records with correct per-mesh indices and deterministic reset.
- [ ] Run tests; verify every collected instance returns to its original transform after reset.

### Task 4: Verify static delivery and report limitations

**Files:**
- Modify: `index.html` and project docs only if needed.

- [ ] Run all tests and syntax checks from a clean checkout state.
- [ ] Inspect the final diff for unintended files and regressions.
- [ ] Verify the GitHub Pages URL can serve the updated entry point if deployment status is available.
- [ ] Report what was tested in automation and what still requires the user's Android device.

---

## Scope boundary

This milestone does not yet add new dinosaur models, crafting UI, day/night, or expanded survival mechanics. Those follow only after boot, controls, resource lifecycle, and restart have passed their checks.
