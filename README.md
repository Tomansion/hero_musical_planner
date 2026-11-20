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
| -1 | Prologue (optional short song by the hero). If chosen, the opening must be Happy. |
| 0 | Opening number: Happy, Dark or HappyDark. |
| 1+ | Exactly 3 songs among I wish, Mentor, You & / vs me, Conditional love, Other (villain song, comic song...). Each song is used once, except Other which can repeat. I wish is mandatory. |
| | The Messenger scene goes once anywhere among the songs (right after the opening, between two songs, or after the last one). |
| | An optional Refusal scene can follow the Messenger, only if the Mentor song was not played yet and is still to come. |
| then | Gatekeeper (scene), then New world (tune). Steps with a single possible option are filled in automatically. |

## Song structures

Every song except Other can be unfolded to plan its sections, with the same
one-choice-per-level flow. Notes (e.g. "sur le héros") describe what a section
is about at that point.

| Song | Structure |
| --- | --- |
| Prologue | Verse (hero). |
| Openings and New world | Verse (shared), refrain (Bienvenue !), verse (shared), refrain, dance break (optional), refrain, coda (0 to 3, each melodic, story or repetition), end (or codette after a coda), pose. The dance break chains bricks (En V, Fontaine) with transitions (Avant passe derrière, En cercle, Shuffle) between them. |
| I wish | Verse (past life), refrain (the dream), verse (future life), refrain, end (no gesture), back to reality. |
| Mentor | Version (Mentor, Anti-mentor, both), verse, refrain (on the hero), verse, refrain (on the hero), end (hold or cut). |
| You & / vs me | Version (You & me, You vs me), verse, refrain, verse, refrain, end (hold or cut). Verses and refrains are about being together (You & me) or opposed (You vs me). |
| Conditional love | Verse (why it is impossible), refrain (insurmountable love), verse (what it could be), refrain, end (hold or cut). |

Tagline mode (openings, New world, Mentor, You & / vs me): every verse becomes a
tagline and every refrain a bridge. All taglines of a song share one number
(1 to 6). Every refrain can add a choreographic move, harmony, counter-melody or
first-beat step; bridges take no options. All refrains (and bridges) of a song
share the same note.

Main rules live in `src/data/steps.ts` (catalog, `REFUSAL_NEEDS_MENTOR_AFTER`)
and `src/logic/rules.ts`; song structures in `src/data/sections.ts`. Movie
presets are in `src/data/movies.ts`. The interface is in French.

The current path is saved in the browser (localStorage).
