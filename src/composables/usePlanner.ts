import { computed, reactive, watch } from 'vue'
import { MOVIES, type MoviePreset } from '../data/movies'
import { OPTIONS, type OptionId } from '../data/steps'
import {
  autoFillSections,
  hasStructure,
  migrateSection,
  newSection,
  nextSection,
  sectionText,
  songVersion,
  validPrefix,
  type SectionEntry,
  type SectionId,
  type SectionLevel,
} from '../data/sections'
import { isValidPath, nextLevel, upcomingLevels, type Level } from '../logic/rules'

export interface PathEntry {
  id: OptionId
  title: string
  description: string
  /** Sections of the song, for steps that have a structure. */
  structure?: SectionEntry[]
  /** Structure unfolded in the tree. */
  open?: boolean
}

interface PlannerState {
  path: PathEntry[]
  /** Movie the path was loaded from, if any. */
  source: string | null
  /** True once the user changed a loaded movie path. */
  edited: boolean
}

const STORAGE_KEY = 'hero-musical-planner.v1'

/** Ids from V1, before Mentor / Anti-mentor and You & me / You vs me were merged. */
const LEGACY: Record<string, { id: OptionId; version: SectionId }> = {
  'anti-mentor': { id: 'mentor', version: 'v-anti' },
  'you-and-me': { id: 'duo', version: 'v-and' },
  'you-vs-me': { id: 'duo', version: 'v-vs' },
}

/** Fill in, repair or migrate an entry so its structure fits its song. */
function normalize(e: PathEntry): PathEntry {
  const legacy = LEGACY[e.id as string]
  if (legacy) e = { ...e, id: legacy.id, structure: [{ id: legacy.version }] }
  // A V1 'mentor' (saved before versions existed) was the Mentor version.
  else if (e.id === 'mentor' && !e.structure) e = { ...e, structure: [{ id: 'v-mentor' }] }
  if (!hasStructure(e.id)) {
    const { structure: _s, open: _o, ...rest } = e
    return rest
  }
  const structure = (e.structure ?? []).map(migrateSection)
  return { ...e, structure: autoFillSections(e.id, validPrefix(e.id, structure)), open: !!e.open }
}

function load(): PlannerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as PlannerState
      const path = s.path.map(normalize)
      const ids = path.map((e) => e.id)
      // Keep only the part of the saved path that is still valid.
      const keep: PathEntry[] = []
      for (let i = 0; i < ids.length; i++) {
        const lvl = nextLevel(ids.slice(0, i))
        if (!lvl?.choices.some((c) => c.enabled && c.option.id === ids[i])) break
        keep.push(path[i])
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
    for (const s of m.steps) {
      if (s.structure && validPrefix(s.id, s.structure).length !== s.structure.length) {
        console.warn(`[planner] preset "${m.title}": structure of "${s.id}" breaks the rules`)
      }
    }
  }
}

export interface LevelView {
  index: number
  level: Level
  selected: PathEntry | null
}

export interface SectionView {
  index: number
  level: SectionLevel
  selected: SectionEntry | null
}

/** Main label of a step, using the version chosen inside the song when there is one. */
export function entryLabel(e: PathEntry): string {
  return songVersion(e.structure)?.label ?? OPTIONS[e.id].label
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
    const next: PathEntry[] = [...old.slice(0, index), normalize({ id, title: '', description: '', structure: [] })]
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
      path.push(normalize({ id: lvl.choices[0].option.id, title: '', description: '', structure: [] }))
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

  // --- Song structures ---

  function toggleOpen(index: number) {
    const e = state.path[index]
    if (e && hasStructure(e.id)) e.open = !e.open
  }

  /** Chosen sections of step `index` plus the next open one. */
  function sections(index: number): SectionView[] {
    const e = state.path[index]
    if (!e?.structure) return []
    const out: SectionView[] = []
    for (let j = 0; j <= e.structure.length; j++) {
      const level = nextSection(e.id, e.structure.slice(0, j).map((x) => x.id))
      if (!level) break
      out.push({ index: j, level, selected: e.structure[j] ?? null })
    }
    return out
  }

  const structureDone = (e: PathEntry) => !!e.structure && !nextSection(e.id, e.structure.map((x) => x.id))

  function chooseSection(index: number, j: number, id: SectionId) {
    const e = state.path[index]
    if (!e?.structure || e.structure[j]?.id === id) return
    const old = e.structure
    const head = old.slice(0, j)
    // Keep the following sections as long as they still fit the structure.
    const next = validPrefix(e.id, [...head, newSection(id, head), ...old.slice(j + 1)])
    e.structure = autoFillSections(e.id, next)
    markEdited()
  }

  function truncateSection(index: number, j: number) {
    const e = state.path[index]
    if (!e?.structure) return
    e.structure = e.structure.slice(0, j)
    markEdited()
  }

  function updateSection(index: number, j: number, patch: Partial<Pick<SectionEntry, 'count' | 'extras' | 'coda'>>) {
    const st = state.path[index]?.structure
    const s = st?.[j]
    if (!st || !s) return
    Object.assign(s, patch)
    // Every tagline of a song shares the same parameter.
    if (s.id === 'tagline' && patch.count) for (const t of st) if (t.id === 'tagline') t.count = patch.count
    markEdited()
  }

  function markEdited() {
    if (state.source) state.edited = true
  }

  function loadMovie(m: MoviePreset): PlannerState {
    const previous = snapshot()
    state.path = m.steps.map((s) => normalize(JSON.parse(JSON.stringify(s))))
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
    if (sourceMovie.value) lines.push(`${sourceMovie.value.title}${state.edited ? ' (modifié)' : ''}`, '')
    for (const v of levels.value) {
      const e = v.selected
      if (!e || e.id === 'no-prologue') continue
      const opt = OPTIONS[e.id]
      const what = v.level.kind === 'opening' ? `Ouverture (${opt.label})` : entryLabel(e)
      const kind = opt.kind === 'tune' ? 'chanson' : 'scène'
      const title = e.title ? ` · ${e.title}` : ''
      lines.push(`${v.level.step}. ${what} [${kind}]${title}`)
      if (e.description) lines.push(`   ${e.description}`)
      const secs = sections(v.index)
        .filter((sv) => sv.selected && (sv.index > 0 || !songVersion([sv.selected])))
        .map((sv) => sectionText(sv.selected!, sv.level.notes?.[sv.selected!.id]))
      if (secs.length) lines.push(`   Structure : ${secs.join(' → ')}`)
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
    toggleOpen,
    sections,
    structureDone,
    chooseSection,
    truncateSection,
    updateSection,
    loadMovie,
    restore,
    reset,
    asText,
  }
}
