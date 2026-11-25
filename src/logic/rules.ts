import {
  OPENINGS,
  OPTIONS,
  REPEATABLE,
  REFUSAL_NEEDS_MENTOR_AFTER,
  SONG_COUNT,
  SONGS,
  isMentorish,
  isSong,
  type OptionId,
  type StepOption,
} from '../data/steps'

/*
 * A path is a flat list of option ids:
 *   [prologue | no-prologue, opening-*, ...beats, gatekeeper, new-world]
 * "Beats" are the middle part: 3 songs + 1 messenger (+ optional refusal right after it).
 */

export type LevelKind = 'prologue' | 'opening' | 'beat' | 'gatekeeper' | 'new-world'

export interface Choice {
  option: StepOption
  enabled: boolean
  reason?: string
}

export interface Level {
  kind: LevelKind
  /** Displayed step number (prologue is -1, opening is 0). */
  step: number
  name: string
  choices: Choice[]
}

const BEAT_ALPHABET: OptionId[] = [...SONGS, 'messenger', 'refusal']

/** Is this a complete, valid sequence of beats? */
function isValidBeats(beats: OptionId[]): boolean {
  const songs = beats.filter(isSong)
  if (songs.length !== SONG_COUNT) return false
  const unique = songs.filter((s) => !REPEATABLE.includes(s))
  if (new Set(unique).size !== unique.length) return false
  if (!songs.includes('i-wish')) return false
  if (beats.filter((b) => b === 'messenger').length !== 1) return false
  const refusals = beats.filter((b) => b === 'refusal').length
  if (refusals > 1) return false
  if (refusals === 1) {
    const r = beats.indexOf('refusal')
    if (beats[r - 1] !== 'messenger') return false
    if (beats.slice(0, r).some(isMentorish)) return false
    if (REFUSAL_NEEDS_MENTOR_AFTER && !beats.slice(r + 1).some(isMentorish)) return false
  }
  return true
}

/** Every valid beat sequence, enumerated once (a few hundred at most). */
const VALID_BEATS: OptionId[][] = (() => {
  const out: OptionId[][] = []
  const maxLen = SONG_COUNT + 2
  const walk = (seq: OptionId[]) => {
    if (isValidBeats(seq)) out.push(seq)
    if (seq.length >= maxLen) return
    for (const b of BEAT_ALPHABET) walk([...seq, b])
  }
  walk([])
  return out
})()

const startsWith = (seq: OptionId[], prefix: OptionId[]) =>
  prefix.length <= seq.length && prefix.every((p, i) => seq[i] === p)

const canComplete = (beats: OptionId[]) => VALID_BEATS.some((v) => startsWith(v, beats))
const isComplete = (beats: OptionId[]) => isValidBeats(beats)

/** Human-readable reason why `c` can't come after `beats`. */
function beatReason(beats: OptionId[], c: OptionId): string {
  const songs = beats.filter(isSong)
  if (c === 'refusal') {
    if (beats.some(isMentorish)) return 'Impossible après la chanson Mentor'
    return 'La chanson Mentor doit encore suivre un refus'
  }
  if (isSong(c)) {
    const left = SONG_COUNT - songs.length
    if (left === 1 && !songs.includes('i-wish') && c !== 'i-wish') return 'La dernière chanson doit être le I wish'
    const r = beats.indexOf('refusal')
    if (r >= 0 && REFUSAL_NEEDS_MENTOR_AFTER && !beats.slice(r + 1).some(isMentorish)) {
      return 'Après un refus, il faut encore la chanson Mentor'
    }
  }
  return 'Mène à une impasse'
}

const choice = (id: OptionId, enabled: boolean, reason?: string): Choice => ({
  option: OPTIONS[id],
  enabled,
  reason: enabled ? undefined : reason,
})

/**
 * The level that comes after `prefix` (the options for the next step),
 * or null when the path is finished.
 */
export function nextLevel(prefix: OptionId[]): Level | null {
  if (prefix.length === 0) {
    return {
      kind: 'prologue',
      step: -1,
      name: 'Prologue',
      choices: [choice('prologue', true), choice('no-prologue', true)],
    }
  }
  if (prefix.length === 1) {
    const hasPrologue = prefix[0] === 'prologue'
    return {
      kind: 'opening',
      step: 0,
      name: 'Opening',
      choices: OPENINGS.map((id) =>
        choice(id, !hasPrologue || id === 'opening-happy', 'Après un prologue, l’opening doit être Happy'),
      ),
    }
  }

  const rest = prefix.slice(2)
  const step = rest.length + 1
  const last = rest[rest.length - 1]
  if (last === 'new-world') return null
  if (last === 'gatekeeper') {
    return { kind: 'new-world', step, name: 'Nouveau monde', choices: [choice('new-world', true)] }
  }

  const beats = rest
  const songsDone = beats.filter(isSong).length >= SONG_COUNT
  const candidates: OptionId[] = songsDone ? [] : SONGS.filter((s) => REPEATABLE.includes(s) || !beats.includes(s))
  if (!beats.includes('messenger')) candidates.push('messenger')
  if (last === 'messenger') candidates.push('refusal')

  const choices = candidates.map((c) => {
    const ok = canComplete([...beats, c])
    return choice(c, ok, ok ? undefined : beatReason(beats, c))
  })

  if (isComplete(beats)) {
    const open = choices.filter((c) => c.enabled)
    if (open.length === 0) {
      return { kind: 'gatekeeper', step, name: 'Gate keeper', choices: [choice('gatekeeper', true)] }
    }
    // Optional extra beat (e.g. a refusal) or move on to the gatekeeper.
    return { kind: 'beat', step, name: 'Étape suivante', choices: [...open, choice('gatekeeper', true)] }
  }

  const name = choices.some((c) => c.enabled && isSong(c.option.id)) ? 'Chanson' : 'Étape suivante'
  return { kind: 'beat', step, name, choices }
}

/** Every complete path, enumerated once. */
const ALL_PATHS: OptionId[][] = (() => {
  const out: OptionId[][] = []
  const walk = (p: OptionId[]) => {
    const lvl = nextLevel(p)
    if (!lvl) return void out.push(p)
    for (const c of lvl.choices) if (c.enabled) walk([...p, c.option.id])
  }
  walk([])
  return out
})()

const CATALOG_ORDER: OptionId[] = [
  'prologue',
  'no-prologue',
  ...OPENINGS,
  ...SONGS,
  'messenger',
  'refusal',
  'gatekeeper',
  'new-world',
]

function levelName(ids: OptionId[]): { kind: LevelKind; name: string } {
  if (ids.every((id) => OPENINGS.includes(id))) return { kind: 'opening', name: 'Opening' }
  if (ids.every((id) => id === 'gatekeeper')) return { kind: 'gatekeeper', name: 'Gate keeper' }
  if (ids.every((id) => id === 'new-world')) return { kind: 'new-world', name: 'Nouveau monde' }
  if (ids.every(isSong)) return { kind: 'beat', name: 'Chanson' }
  if (ids.includes('messenger') && ids.some(isSong)) return { kind: 'beat', name: 'Chanson ou messager' }
  return { kind: 'beat', name: 'Étape suivante' }
}

/**
 * The steps still to come after the open level, with every option that could
 * still land there. Assumes no extra refusal (it would only add one row).
 */
export function upcomingLevels(prefix: OptionId[]): Level[] {
  const hasRefusal = prefix.includes('refusal')
  const paths = ALL_PATHS.filter((p) => startsWith(p, prefix) && (hasRefusal || !p.includes('refusal')))
  if (!paths.length) return []
  const len = Math.max(...paths.map((p) => p.length))
  const out: Level[] = []
  for (let k = prefix.length + 1; k < len; k++) {
    const ids = new Set(paths.map((p) => p[k]).filter(Boolean))
    const ordered = CATALOG_ORDER.filter((id) => ids.has(id))
    out.push({
      ...levelName(ordered),
      step: k - 1,
      choices: ordered.map((id) => ({ option: OPTIONS[id], enabled: false })),
    })
  }
  return out
}

/** Check a whole path (used for movie presets). */
export function isValidPath(path: OptionId[]): boolean {
  for (let i = 0; i < path.length; i++) {
    const lvl = nextLevel(path.slice(0, i))
    if (!lvl?.choices.some((c) => c.enabled && c.option.id === path[i])) return false
  }
  return nextLevel(path) === null
}
