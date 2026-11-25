# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vue 3 + Vuetify 4 + TypeScript single-page app (Vite) for planning routes through an improvised musical that follows the hero's journey. The user picks one option per level; each chosen step gets a free-text title and description. There is no backend: state lives in `localStorage` under the key `hero-musical-planner.v1`.

The UI is in French. Strings are hardcoded in the components and data files (no i18n library); code identifiers and `OptionId`s stay in English. Vuetify's own strings use its `fr` locale (`src/plugins/vuetify.ts`).

## Commands

```bash
npm install
npm run dev        # Vite dev server on http://localhost:5173 (--host)
npm run build      # production build to dist/
npm run preview    # serve dist/
npm start          # vite preview on 0.0.0.0:$PORT (default 4173); used by Nixpacks deploys
docker compose up --build   # nginx-served build on http://localhost:8080
```

There is no test suite, linter or type-check script. `vite build` does not type-check; `vue-tsc` is not installed, so `npx tsc --noEmit` only covers `.ts` files, not `.vue` SFCs. Node 22 (`.nvmrc`).

Deployment: either the multi-stage `Dockerfile` (build, then nginx with `nginx.conf` doing SPA fallback and long-caching `/assets/`) or Nixpacks (`nixpacks.toml` → `npm start`, which relies on `preview.allowedHosts: true` in `vite.config.ts`).

## Architecture

The rule engine is the core; the UI only renders what it returns.

- **`src/data/steps.ts`**: the option catalog (`OPTIONS`, keyed by `OptionId`) and every rule knob: `SONGS`, `OPENINGS`, `SONG_COUNT`, `REPEATABLE`, `REFUSAL_NEEDS_MENTOR_AFTER`. Options may carry a `voice` (who sings, shown in `StepDetail`). Staging cues (`CUES`, `CUES_BEFORE`, `CUES_AFTER`, `cuesBetween`) are non-interactive stage directions drawn between steps; before an open level only the cues shared by all its enabled options show. `usePlanner().cuesBefore(i)` is what the tree and `asText()` use. Scene cues (`cue.scene`: new scene, threshold scene) unfold in `SceneCard.vue`; their data (`SceneInfo` in `src/data/scene.ts`: who/what/where, relations with tri-state axes, `null` = unknown) is stored on the path entry the scene *follows* (`PathEntry.scene`). The gate keeper entry has a `challenge`. Each option has a `kind`: `tune` (sung), `scene` (acted), `dance` (sections only), or `skip`. Mentor/Anti-mentor and You & me/You vs me are single songs (`mentor`, `duo`) whose version is the first level of their structure.
- **`src/logic/rules.ts`**: a path is a flat `OptionId[]`: `[prologue|no-prologue, opening-*, ...beats, gatekeeper, new-world]`. "Beats" are the middle section (3 songs + 1 messenger + an optional refusal right after the messenger).
  - `isValidBeats` encodes the beat rules. At module load, `VALID_BEATS` brute-force enumerates every valid beat sequence, and `ALL_PATHS` enumerates every complete path by walking `nextLevel`. Choices are enabled/disabled by checking whether any valid sequence still starts with the prefix (`canComplete`), so a choice that leads to a dead end is greyed out with a reason from `beatReason`.
  - `nextLevel(prefix)` returns the next level's choices (or `null` when the path is complete). It is the single source of truth for the main path.
  - `upcomingLevels(prefix)` derives the faded "future" rows from `ALL_PATHS`.
  - `isValidPath` validates a whole path (used for movie presets).
- **`src/composables/usePlanner.ts`**: module-level singleton reactive state (`path`, `source` movie id, `edited` flag) persisted to localStorage via a deep `watch`. On load and on `choose()`, it keeps only the prefix of the old path that still passes `nextLevel`, so changing an early step preserves later steps when they remain valid. `autoFill` takes levels with a single enabled choice (gatekeeper, new world) automatically. Section functions (`sections`, `chooseSection`, ...) do the same for a step's structure. `normalize` migrates V1 saved ids (`anti-mentor`, `you-and-me`, `you-vs-me`) to the merged songs. `asText()` produces the clipboard export.
- **`src/data/sections.ts`**: song structures (V2). Each song with a structure has a grammar `(prefix: SectionId[]) => SectionLevel | null` in `GRAMMARS`, mirroring `nextLevel`: most are `linear([...])`, openings are a small state machine (taglines-or-verses mode, dance break brick/transition loop, up to `CODA_MAX` codas). Section ids are generic (`verse`, `tagline`, `refrain`, `bridge`, `coda`...); what a section is about at a given position is a level `note` (shown under the node label), not a separate id. Tagline mode (`taglineMode`) turns every later verse into a tagline and every refrain into a bridge. Refrain notes are one constant per song (all refrains of a tune share it). A `PathEntry.structure` is a `SectionEntry[]` (id + optional tagline `count`, shared by all taglines of the song, `extras` on any `refrain`, `coda` type); `validPrefix` and `autoFillSections` keep it valid and take single-choice levels; `migrateSection` maps ids from the first V2 draft. `songVersion` gives the Mentor/duo version used as the step's label.
- **`src/data/stories.ts`**: presets of stories played on stage (`PLAYED`) and `ALL_STORIES` (famous + played), which is what the planner and menu look presets up in. Presets can set `scene` (the scene after that step) and `challenge`. A played story may break the flow (e.g. a You vs me played as `other`, a placeholder I wish); it still has to pass the rules.
- **`src/logic/sheet.ts`**: the printable story sheet. `usePlanner().sheetItems()` builds boxes (cues, steps, sections; dance bricks/transitions merged into one dance break); `openSheet` opens it as a Blob URL in a new tab, and the browser prints to PDF.
- **`src/data/movies.ts`**: presets (Disney films) expressed as full paths with titles and descriptions. In dev mode, `usePlanner` warns in the console if a preset violates the rules, so check the console after changing rules or presets.
- **Components**: `App.vue` (top bar, movie menu, undo snackbar, copy, theme toggle) → `FlowTree.vue` (renders levels/upcoming rows and the "water" flow) → `FlowNode.vue` (one option, `small` inside structures; emits `select` or `blocked`), `StepDetail.vue` (title/description editor + structure toggle) and `SectionDetail.vue` (tagline number / coda type / refrain extras chips).
- **Water flow**: `FlowTree.measure()` draws every segment in one SVG by locating `[data-node]` elements. Keys: `${level}:${id}` for main nodes, `${level}.${j}:${id}` for sections, `${level}:exit` for the exit of an unfolded song, `${level}:cue${k}` for staging cues before a level (the stream from the previous step runs through them, then fans out to the level's choices; closing cues use level = path length). When a song is unfolded, the stream goes through its sections as thin violet (`small`) segments and the next main level starts from its exit node. The song row and its sections are wrapped in a `.group.unfolded` block tinted with the `tune` color; it sets `--node-bg` so node labels mask the streams with the tinted background.
- Icons come from `@mdi/js` (SVG path strings passed to `v-icon :icon`), not an icon font. Vuetify components are auto-imported by `vite-plugin-vuetify`; theme setup is in `src/plugins/vuetify.ts`.

When changing the rules or structures, update `steps.ts`/`rules.ts`/`sections.ts`, the `hint` texts, the tables in `README.md`, and verify the presets in `movies.ts` still pass.
