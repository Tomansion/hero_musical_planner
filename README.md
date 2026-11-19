# Hero's Journey · Musical Planner

A small Vue 3 + Vuetify app to plan the possible routes of an improvised musical
following the steps of the hero's journey. Pick a step at each level and the
"water" flows down the path you chose; every chosen step gets a title and a
one or two sentence description.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## Docker

```bash
docker compose up --build   # http://localhost:8080
# or
docker build -t hero-musical-planner .
docker run --rm -p 8080:80 hero-musical-planner
```

## Rules

| Step | Content |
| --- | --- |
| -1 | Prologue (optional short song by the hero). If chosen, the opening must be happy. |
| 0 | Opening number: happy, dark or bittersweet. |
| 1+ | Exactly 3 songs among Mentor, Anti-mentor, You & me, You vs me, Conditional love, I wish, Other (villain song, comic song...). Each song type is used once, except Other which can repeat. I wish is mandatory; Mentor excludes Anti-mentor; You & me excludes You vs me. |
| | The Messenger scene goes once anywhere among the songs (right after the opening, between two songs, or after the last one). |
| | An optional Refusal scene can follow the Messenger, only if no Mentor / Anti-mentor song was played yet and one is still to come. |
| then | Gatekeeper (scene), then New world (tune). Steps with a single possible option are filled in automatically. |

Rules live in `src/data/steps.ts` (catalog, exclusions, `REFUSAL_NEEDS_MENTOR_AFTER`)
and `src/logic/rules.ts`. Movie presets are in `src/data/movies.ts`.

The current path is saved in the browser (localStorage).
