import { computed, reactive, watch } from 'vue'
import { MOVIES, type MoviePreset } from '../data/movies'
import { OPTIONS, type OptionId } from '../data/steps'
import { isValidPath, nextLevel, upcomingLevels, type Level } from '../logic/rules'

export interface PathEntry {
  id: OptionId
  title: string
  description: string
}

interface PlannerState {
  path: PathEntry[]
  /** Movie the path was loaded from, if any. */
  source: string | null
  /** True once the user changed a loaded movie path. */
  edited: boolean
}

const STORAGE_KEY = 'hero-musical-planner.v1'

function load(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as PlannerState
      const ids = s.path.map((e) => e.id)
      // Keep only the part of the saved path that is still valid.
      const keep: PathEntry[] = []
      for (let i = 0; i < ids.length; i++) {
        const lvl = nextLevel(ids.slice(0, i))
        if (!lvl?.choices.some((c) => c.enabled && c.option.id === ids[i])) break
        keep.push(s.path[i])
      }
      return { path: keep, source: s.source ?? null, edited: !!s.edited }
    }
  } catch {
    /* storage unavailable or corrupted: start fresh */
  }
  return { path: [], source: null, edited: false }
}

const state = reactive<PlannerState>(load())

watch(
  state,
  (s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      /* ignore */
    }
  },
  { deep: true },
)

if (import.meta.env.DEV) {
  for (const m of MOVIES) {
    if (!isValidPath(m.steps.map((s) => s.id))) console.warn(`[planner] preset "${m.title}" breaks the rules`)
  }
}

export interface LevelView {
  index: number
  level: Level
  selected: PathEntry | null
}

export function usePlanner() {
  const ids = computed(() => state.path.map((e) => e.id))

  /** All chosen levels plus the next open one. */
  const levels = computed<LevelView[]>(() => {
    const out: LevelView[] = []
    for (let i = 0; i <= state.path.length; i++) {
      const level = nextLevel(ids.value.slice(0, i))
      if (!level) break
      out.push({ index: i, level, selected: state.path[i] ?? null })
    }
    return out
  })

  const finished = computed(() => nextLevel(ids.value) === null)
  /** Steps after the open one, shown faded. */
  const upcoming = computed(() => upcomingLevels(ids.value))

  function choose(index: number, id: OptionId) {
    if (state.path[index]?.id === id) return
    const old = state.path
    const next: PathEntry[] = [...old.slice(0, index), { id, title: '', description: '' }]
    // Keep the following steps as long as they still fit the rules.
    for (let j = index + 1; j < old.length; j++) {
      const lvl = nextLevel(next.map((e) => e.id))
      if (!lvl?.choices.some((c) => c.enabled && c.option.id === old[j].id)) break
      next.push(old[j])
    }
    autoFill(next)
    state.path = next
    markEdited()
  }

  /** Steps with a single possible option (gatekeeper, new world) are taken directly. */
  function autoFill(path: PathEntry[]) {
    for (;;) {
      const lvl = nextLevel(path.map((e) => e.id))
      if (!lvl || lvl.choices.length !== 1 || !lvl.choices[0].enabled) return
      path.push({ id: lvl.choices[0].option.id, title: '', description: '' })
    }
  }

  function truncate(index: number) {
    state.path = state.path.slice(0, index)
    markEdited()
  }

  function update(index: number, patch: Partial<Pick<PathEntry, 'title' | 'description'>>) {
    const e = state.path[index]
    if (!e) return
    Object.assign(e, patch)
    markEdited()
  }

  function markEdited() {
    if (state.source) state.edited = true
  }

  function loadMovie(m: MoviePreset): PlannerState {
    const previous = snapshot()
    state.path = m.steps.map((s) => ({ ...s }))
    state.source = m.id
    state.edited = false
    return previous
  }

  function snapshot(): PlannerState {
    return JSON.parse(JSON.stringify(state))
  }

  function restore(s: PlannerState) {
    state.path = s.path
    state.source = s.source
    state.edited = s.edited
  }

  function reset() {
    const previous = snapshot()
    state.path = []
    state.source = null
    state.edited = false
    return previous
  }

  const sourceMovie = computed(() => MOVIES.find((m) => m.id === state.source) ?? null)

  function asText(): string {
    const lines: string[] = []
    if (sourceMovie.value) lines.push(`${sourceMovie.value.title}${state.edited ? ' (edited)' : ''}`, '')
    for (const v of levels.value) {
      if (!v.selected || v.selected.id === 'no-prologue') continue
      const opt = OPTIONS[v.selected.id]
      const what = v.level.kind === 'opening' ? `Opening (${opt.label.toLowerCase()})` : opt.label
      const kind = opt.kind === 'tune' ? 'tune' : 'scene'
      const title = v.selected.title ? ` · ${v.selected.title}` : ''
      lines.push(`${v.level.step}. ${what} [${kind}]${title}`)
      if (v.selected.description) lines.push(`   ${v.selected.description}`)
    }
    return lines.join('\n')
  }

  return {
    state,
    levels,
    finished,
    upcoming,
    sourceMovie,
    choose,
    truncate,
    update,
    loadMovie,
    restore,
    reset,
    asText,
  }
}
