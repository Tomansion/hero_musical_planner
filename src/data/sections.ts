import {
  mdiArrowDownThin,
  mdiBridge,
  mdiContentCut,
  mdiFlagCheckered,
  mdiFormatQuoteOpen,
  mdiFountain,
  mdiHandFrontRightOutline,
  mdiHandshakeOutline,
  mdiHumanHandsup,
  mdiMusicNoteEighth,
  mdiPlaylistMusic,
  mdiRepeat,
  mdiRotate360,
  mdiScaleBalance,
  mdiSchoolOutline,
  mdiShuffleVariant,
  mdiSwapVertical,
  mdiSwordCross,
  mdiTextLong,
  mdiTimerSandComplete,
} from '@mdi/js'
import type { NodeOption, OptionId, StepKind } from './steps'

/*
 * Inside a song: each song type has its own structure, walked like the main
 * path (one choice per level). A structure is a list of section entries.
 */

export type SectionId =
  // versions (first level of Mentor / You & / vs me)
  | 'v-mentor'
  | 'v-anti'
  | 'v-both'
  | 'v-and'
  | 'v-vs'
  // verses and refrains
  | 'verse'
  | 'tagline'
  | 'refrain'
  | 'bridge'
  // dance break
  | 'brick-v'
  | 'brick-fountain'
  | 'tr-front-back'
  | 'tr-circle'
  | 'tr-shuffle'
  | 'dance-end'
  | 'no-dance'
  // coda
  | 'coda'
  | 'no-coda'
  | 'coda-done'
  // endings
  | 'end'
  | 'codette'
  | 'pose'
  | 'reality'
  | 'end-hold'
  | 'end-cut'

export interface SectionOption extends NodeOption {
  id: SectionId
}

/** Ten bowling pins seen from above, head pin at the bottom: the V formation. */
const mdiPinsV = (() => {
  const r = 2
  const rows = [[4.2, 9.4, 14.6, 19.8], [6.8, 12, 17.2], [9.4, 14.6], [12]]
  return rows
    .flatMap((xs, i) => xs.map((x) => `M${x - r},${4.5 + i * 4.8}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`))
    .join('')
})()

/** A comic-book burst: the explosion of coming back to reality. */
const mdiBurst = (() => {
  const radii = [11, 5.5, 9.5, 6, 11.5, 5, 10, 6.5, 11, 5.5, 9, 6, 11.5, 5, 10, 6]
  const pts = radii.map((r, i) => {
    const a = (i / radii.length) * 2 * Math.PI - Math.PI / 2
    return `${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`
  })
  return `M${pts.join('L')}Z`
})()

const s = (id: SectionId, label: string, kind: StepKind, icon: string, hint: string): SectionOption => ({
  id,
  label,
  kind,
  icon,
  hint,
})

export const SECTIONS: Record<SectionId, SectionOption> = {
  'v-mentor': s('v-mentor', 'Mentor', 'tune', mdiSchoolOutline, 'Un guide apprend au héros ce qu’il a besoin d’entendre.'),
  'v-anti': s('v-anti', 'Anti-mentor', 'tune', mdiHandFrontRightOutline, 'Un tentateur donne au héros de mauvais conseils séduisants.'),
  'v-both': s('v-both', 'Mentor & Anti-mentor', 'tune', mdiScaleBalance, 'Le guide et le tentateur se disputent le héros.'),
  'v-and': s('v-and', 'You & me', 'tune', mdiHandshakeOutline, 'Deux personnages découvrent qu’ils sont du même côté.'),
  'v-vs': s('v-vs', 'You vs me', 'tune', mdiSwordCross, 'Deux personnages s’opposent sur des visions contraires.'),

  'verse': s('verse', 'Couplet', 'tune', mdiTextLong, 'Un couplet.'),
  'tagline': s('tagline', 'Tagline', 'tune', mdiFormatQuoteOpen, 'Des taglines à la place des couplets ; les refrains deviennent des bridges.'),
  'refrain': s('refrain', 'Refrain', 'tune', mdiRepeat, 'Le refrain.'),
  'bridge': s('bridge', 'Bridge', 'tune', mdiBridge, 'Un bridge à la place du refrain (mode tagline).'),

  'brick-v': s('brick-v', 'En V', 'dance', mdiPinsV, 'Brique de danse : formation en V.'),
  'brick-fountain': s('brick-fountain', 'Fontaine', 'dance', mdiFountain, 'Brique de danse : la fontaine.'),
  'tr-front-back': s('tr-front-back', 'Avant passe derrière', 'dance', mdiSwapVertical, 'Transition : l’avant passe derrière.'),
  'tr-circle': s('tr-circle', 'En cercle', 'dance', mdiRotate360, 'Transition en cercle.'),
  'tr-shuffle': s('tr-shuffle', 'Shuffle', 'dance', mdiShuffleVariant, 'Transition : shuffle.'),
  'dance-end': s('dance-end', 'Fin du dance break', 'skip', mdiArrowDownThin, 'Terminer le dance break et revenir au refrain.'),
  'no-dance': s('no-dance', 'Pas de dance break', 'skip', mdiArrowDownThin, 'Passer directement au refrain suivant, sans dance break.'),

  'coda': s('coda', 'Coda', 'tune', mdiPlaylistMusic, 'Une coda : mélodique, histoire ou répétition.'),
  'no-coda': s('no-coda', 'Sans coda', 'skip', mdiArrowDownThin, 'Pas de coda, aller directement à la fin.'),
  'coda-done': s('coda-done', 'Fin des codas', 'skip', mdiArrowDownThin, 'Plus de coda, aller à la fin.'),

  'end': s('end', 'Fin', 'tune', mdiFlagCheckered, 'La fin du morceau.'),
  'codette': s('codette', 'Codette', 'tune', mdiMusicNoteEighth, 'Une codette en guise de fin (possible après une coda).'),
  'pose': s('pose', 'Pose', 'dance', mdiHumanHandsup, 'La pose finale.'),
  'reality': s('reality', 'Retour à la réalité', 'tune', mdiBurst, 'Le héros revient à la réalité.'),
  'end-hold': s('end-hold', 'Durée', 'tune', mdiTimerSandComplete, 'La dernière note est tenue.'),
  'end-cut': s('end-cut', 'Cut', 'tune', mdiContentCut, 'Fin coupée net.'),
}

/** Extras that can be added to any refrain (not to bridges). */
export type ExtraId = 'gesture' | 'harmony' | 'counter-melody' | 'first-beat-step'
export const EXTRAS: { id: ExtraId; label: string }[] = [
  { id: 'gesture', label: 'Geste chorégraphique' },
  { id: 'harmony', label: 'Harmonie' },
  { id: 'counter-melody', label: 'Contre-chant' },
  { id: 'first-beat-step', label: 'Step premier temps' },
]

export type CodaType = 'melodic' | 'story' | 'repeat'
export const CODA_TYPES: { id: CodaType; label: string }[] = [
  { id: 'melodic', label: 'Mélodique' },
  { id: 'story', label: 'Histoire' },
  { id: 'repeat', label: 'Répétition' },
]

export const TAGLINE_MAX = 6
export const CODA_MAX = 3

export interface SectionEntry {
  id: SectionId
  /** Tagline parameter (1 to TAGLINE_MAX), the same for every tagline of a song. */
  count?: number
  /** Refrain extras. */
  extras?: ExtraId[]
  /** Kind of coda. */
  coda?: CodaType
}

export interface SectionLevel {
  name: string
  hint: string
  choices: SectionId[]
  /** What a choice is about at this point of the song (shown under its label). */
  notes?: Partial<Record<SectionId, string>>
}

const lv = (name: string, hint: string, choices: SectionId[], notes?: Partial<Record<SectionId, string>>): SectionLevel => ({
  name,
  hint,
  choices,
  notes,
})

type Grammar = (prefix: SectionId[]) => SectionLevel | null

/** A fixed list of levels; each level may depend on the choices before it. */
const linear =
  (levels: ((p: SectionId[]) => SectionLevel)[]): Grammar =>
  (p) =>
    p.length < levels.length ? levels[p.length](p) : null

/* Verses and refrains. In tagline mode every verse is a tagline and every refrain a bridge. */
const taglineMode = (p: SectionId[]) => p.includes('tagline')

/** What verses (and taglines when `onTaglines`) are about in a song. */
interface VerseNote {
  text: string
  onTaglines?: boolean
}
const verseNotes = (n?: VerseNote) => (n ? { verse: n.text, ...(n.onTaglines ? { tagline: n.text } : {}) } : undefined)

const verse1 = (taglines: boolean, note?: VerseNote) => () =>
  taglines
    ? lv('Couplet 1', 'Un couplet, ou des taglines (et des bridges) pour tout le morceau ?', ['verse', 'tagline'], verseNotes(note))
    : lv('Couplet 1', note ? `Couplet ${note.text}.` : 'Un couplet.', ['verse'], verseNotes(note))

const verse2 = (note?: VerseNote) => (p: SectionId[]) =>
  taglineMode(p)
    ? lv('Couplet 2', 'Une tagline, comme le premier couplet.', ['tagline'], verseNotes(note))
    : lv('Couplet 2', note ? `Couplet ${note.text}.` : 'Un couplet.', ['verse'], verseNotes(note))

/** A refrain (a bridge in tagline mode). Every refrain of a song shares the same note. */
const chorus = (name: string, note?: string) => (p: SectionId[]) => {
  const notes = note ? { refrain: note, bridge: note } : undefined
  return taglineMode(p)
    ? lv(name, 'En mode tagline, le refrain devient un bridge.', ['bridge'], notes)
    : lv(name, 'Le refrain, avec des options si besoin.', ['refrain'], notes)
}

const END_HOLD_OR_CUT = () => lv('Fin', 'Une note tenue, ou une fin coupée net ?', ['end-hold', 'end-cut'])

const prologue = linear([() => lv('Couplet', 'Le héros chante seul.', ['verse'], { verse: 'du héros' })])

const I_WISH_REFRAIN = 'sur le rêve'
const iWish = linear([
  verse1(false, { text: 'sur la vie passée' }),
  chorus('Refrain 1', I_WISH_REFRAIN),
  verse2({ text: 'sur la vie future' }),
  chorus('Refrain 2', I_WISH_REFRAIN),
  () => lv('Fin', 'Une fin sans geste.', ['end'], { end: 'sans geste' }),
  () => lv('Retour', 'Retour à la réalité.', ['reality']),
])

const MENTOR_REFRAIN = 'sur le héros'
const mentor = linear([
  () => lv('Version', 'Mentor, Anti-mentor, ou les deux ?', ['v-mentor', 'v-anti', 'v-both']),
  verse1(true),
  chorus('Refrain 1', MENTOR_REFRAIN),
  verse2(),
  chorus('Refrain 2', MENTOR_REFRAIN),
  END_HOLD_OR_CUT,
])

/** You & me: verses and refrains are about being together; You vs me: about being opposed. */
const duoNote = (p: SectionId[]) => (p[0] === 'v-vs' ? 'opposés' : 'ensemble')
const duo = linear([
  () => lv('Version', 'Du même côté, ou opposés ?', ['v-and', 'v-vs']),
  (p) => verse1(true, { text: duoNote(p), onTaglines: true })(),
  (p) => chorus('Refrain 1', duoNote(p))(p),
  (p) => verse2({ text: duoNote(p), onTaglines: true })(p),
  (p) => chorus('Refrain 2', duoNote(p))(p),
  END_HOLD_OR_CUT,
])

const CONDITIONAL_REFRAIN = 'sur l’amour insurmontable'
const conditionalLove = linear([
  verse1(false, { text: 'sur pourquoi c’est impossible' }),
  chorus('Refrain 1', CONDITIONAL_REFRAIN),
  verse2({ text: 'sur ce que ça pourrait être' }),
  chorus('Refrain 2', CONDITIONAL_REFRAIN),
  END_HOLD_OR_CUT,
])

const BRICKS: SectionId[] = ['brick-v', 'brick-fountain']
const TRANSITIONS: SectionId[] = ['tr-front-back', 'tr-circle', 'tr-shuffle']

/**
 * Openings and new world: verse, refrain, verse, refrain, dance break, refrain,
 * up to 3 codas, end, pose. Verses can all be taglines (then refrains are bridges).
 * The dance break can be skipped at its first brick.
 */
const OPENING_REFRAIN = 'Bienvenue !'
const opening: Grammar = (p) => {
  type Phase = 'v1' | 'r1' | 'v2' | 'r2' | 'brick' | 'transition' | 'r3' | 'coda' | 'end' | 'pose' | 'done'
  let phase: Phase = 'v1'
  let bricks = 0
  let codas = 0
  for (const id of p) {
    switch (phase) {
      case 'v1': phase = 'r1'; break
      case 'r1': phase = 'v2'; break
      case 'v2': phase = 'r2'; break
      case 'r2': phase = 'brick'; break
      case 'brick':
        if (id === 'no-dance') phase = 'r3'
        else { bricks++; phase = 'transition' }
        break
      case 'transition': phase = id === 'dance-end' ? 'r3' : 'brick'; break
      case 'r3': phase = 'coda'; break
      case 'coda':
        if (id === 'coda') codas++
        phase = id === 'coda' && codas < CODA_MAX ? 'coda' : 'end'
        break
      case 'end': phase = 'pose'; break
      case 'pose': phase = 'done'; break
    }
  }
  switch (phase) {
    case 'v1': return verse1(true, { text: 'partagé' })()
    case 'r1': return chorus('Refrain 1', OPENING_REFRAIN)(p)
    case 'v2': return verse2({ text: 'partagé' })(p)
    case 'r2': return chorus('Refrain 2', OPENING_REFRAIN)(p)
    case 'brick': return bricks
      ? lv(`Dance break ${bricks + 1}`, 'Choisir une brique de danse.', BRICKS)
      : lv('Dance break 1', 'Choisir une première brique de danse, ou pas de dance break.', [...BRICKS, 'no-dance'])
    case 'transition': return lv(`Transition ${bricks}`, 'Une transition vers une autre brique, ou la fin du dance break.', [...TRANSITIONS, 'dance-end'])
    case 'r3': return chorus('Refrain 3', OPENING_REFRAIN)(p)
    case 'coda': return codas
      ? lv(`Coda ${codas + 1}`, 'Une autre coda, ou passer à la fin ?', ['coda', 'coda-done'])
      : lv('Coda', 'Une coda en option.', ['coda', 'no-coda'])
    case 'end': return lv('Fin', codas ? 'Fin simple, ou codette ?' : 'La fin.', codas ? ['end', 'codette'] : ['end'])
    case 'pose': return lv('Pose', 'La pose finale.', ['pose'])
    case 'done': return null
  }
}

const GRAMMARS: Partial<Record<OptionId, Grammar>> = {
  'prologue': prologue,
  'opening-happy': opening,
  'opening-dark': opening,
  'opening-bittersweet': opening,
  'i-wish': iWish,
  'mentor': mentor,
  'duo': duo,
  'conditional-love': conditionalLove,
  'new-world': opening,
}

export const hasStructure = (id: OptionId) => id in GRAMMARS

/** The level after `prefix` in the structure of `song`, or null when it is complete. */
export function nextSection(song: OptionId, prefix: SectionId[]): SectionLevel | null {
  return GRAMMARS[song]?.(prefix) ?? null
}

/** Longest valid prefix of `entries` for this song. */
export function validPrefix(song: OptionId, entries: SectionEntry[]): SectionEntry[] {
  const out: SectionEntry[] = []
  for (const e of entries) {
    const lvl = nextSection(song, out.map((x) => x.id))
    if (!lvl?.choices.includes(e.id)) break
    out.push(e)
  }
  return out
}

/** Takes every level that has a single possible choice. */
export function autoFillSections(song: OptionId, entries: SectionEntry[]): SectionEntry[] {
  const out = [...entries]
  for (;;) {
    const lvl = nextSection(song, out.map((x) => x.id))
    if (!lvl || lvl.choices.length !== 1) return out
    out.push(newSection(lvl.choices[0], out))
  }
}

/** A fresh entry; a tagline takes the parameter shared by the song's taglines. */
export function newSection(id: SectionId, before: SectionEntry[]): SectionEntry {
  if (id !== 'tagline') return { id }
  return { id, count: before.find((e) => e.id === 'tagline')?.count ?? 1 }
}

/** Section ids from the first V2 draft, mapped to the current ones. */
const LEGACY_SECTIONS: Record<string, SectionEntry> = {
  'hero-verse': { id: 'verse' },
  'shared-verse': { id: 'verse' },
  'past-verse': { id: 'verse' },
  'future-verse': { id: 'verse' },
  'impossible-verse': { id: 'verse' },
  'could-be-verse': { id: 'verse' },
  'dream-refrain': { id: 'refrain' },
  'hero-refrain': { id: 'refrain' },
  'together-refrain': { id: 'refrain' },
  'apart-refrain': { id: 'refrain' },
  'end-still': { id: 'end' },
  'coda-melodic': { id: 'coda', coda: 'melodic' },
  'coda-story': { id: 'coda', coda: 'story' },
  'coda-repeat': { id: 'coda', coda: 'repeat' },
}
export const migrateSection = (e: SectionEntry): SectionEntry => {
  const m = LEGACY_SECTIONS[e.id as string]
  return m ? { ...e, ...m } : e
}

const VERSIONS: SectionId[] = ['v-mentor', 'v-anti', 'v-both', 'v-and', 'v-vs']

/** The version picked inside the song (Mentor / Anti-mentor..., You & me / You vs me), if any. */
export function songVersion(structure: SectionEntry[] | undefined): SectionOption | null {
  const first = structure?.[0]?.id
  return first && VERSIONS.includes(first) ? SECTIONS[first] : null
}

/** One-line description of a section, with its note and parameters. */
export function sectionText(e: SectionEntry, note?: string): string {
  let t = SECTIONS[e.id].label
  if (e.id === 'tagline' && e.count) t += ` ${e.count}`
  const details = [
    note,
    e.coda && CODA_TYPES.find((c) => c.id === e.coda)?.label.toLowerCase(),
    ...(e.extras ?? []).map((x) => EXTRAS.find((d) => d.id === x)?.label.toLowerCase()),
  ].filter(Boolean)
  return details.length ? `${t} (${details.join(', ')})` : t
}
