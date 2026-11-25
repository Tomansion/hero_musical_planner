import {
  mdiArrowDownThin,
  mdiBookOpenPageVariantOutline,
  mdiEarth,
  mdiEmailFastOutline,
  mdiGate,
  mdiHandBackLeftOutline,
  mdiHandshakeOutline,
  mdiHeartHalfFull,
  mdiMusicNotePlus,
  mdiSchoolOutline,
  mdiStarShooting,
  mdiWeatherNight,
  mdiWeatherPartlyCloudy,
  mdiWeatherSunny,
} from '@mdi/js'

/**
 * tune  = a song, performed musically
 * scene = a step played by the comedians (no song)
 * dance = a choreographic part (only inside a song structure)
 * skip  = "nothing here" (used to skip an optional step)
 */
export type StepKind = 'tune' | 'scene' | 'dance' | 'skip'

/** What a flow node needs to be drawn (main steps and song sections alike). */
export interface NodeOption {
  label: string
  kind: StepKind
  icon: string
  hint: string
}

export type SongId = 'mentor' | 'duo' | 'conditional-love' | 'i-wish' | 'other'

export type OptionId =
  | 'prologue'
  | 'no-prologue'
  | 'opening-happy'
  | 'opening-dark'
  | 'opening-bittersweet'
  | SongId
  | 'messenger'
  | 'refusal'
  | 'gatekeeper'
  | 'new-world'

export interface StepOption extends NodeOption {
  id: OptionId
  /** Who sings (or how the hero takes part), for songs that have a fixed rule. */
  voice?: string
}

const o = (id: OptionId, label: string, kind: StepKind, icon: string, hint: string, voice?: string): StepOption => ({
  id,
  label,
  kind,
  icon,
  hint,
  voice,
})

const OPENING_VOICE = 'Tout le monde chante · le héros présente son rêve dans son couplet'

export const OPTIONS: Record<OptionId, StepOption> = {
  'prologue': o('prologue', 'Prologue', 'tune', mdiBookOpenPageVariantOutline, 'Une courte chanson du héros avant l’opening. Impose un opening Happy.', 'Le héros chante seul'),
  'no-prologue': o('no-prologue', 'Sans prologue', 'skip', mdiArrowDownThin, 'Commencer directement par l’opening.'),

  'opening-happy': o('opening-happy', 'Happy', 'tune', mdiWeatherSunny, 'Un opening entraînant qui présente le monde et ses habitants.', OPENING_VOICE),
  'opening-dark': o('opening-dark', 'Dark', 'tune', mdiWeatherNight, 'Un opening lourd et inquiétant.', OPENING_VOICE),
  'opening-bittersweet': o('opening-bittersweet', 'HappyDark', 'tune', mdiWeatherPartlyCloudy, 'Un sujet sombre, mais traité avec humour.', OPENING_VOICE),

  'mentor': o('mentor', 'Mentor', 'tune', mdiSchoolOutline, 'Un guide, un tentateur, ou les deux, parlent au héros. La version se choisit dans la structure.', 'Le héros ne chante pas, il peut réagir'),
  'duo': o('duo', 'You & / vs me', 'tune', mdiHandshakeOutline, 'Deux personnages se découvrent du même côté (You & me) ou s’opposent (You vs me). La version se choisit dans la structure.'),
  'conditional-love': o('conditional-love', 'Amour conditionnel', 'tune', mdiHeartHalfFull, 'Un amour qui n’est donné qu’à certaines conditions.'),
  'i-wish': o('i-wish', 'I wish', 'tune', mdiStarShooting, 'Le héros chante ce à quoi il aspire. Toujours présent dans le parcours.', 'Le héros chante seul'),
  'other': o('other', 'Autre', 'tune', mdiMusicNotePlus, 'N’importe quel autre numéro : chanson du méchant, chanson comique, numéro de groupe...'),

  'messenger': o('messenger', 'Messager', 'scene', mdiEmailFastOutline, 'Le messager présente une opportunité : l’appel à l’aventure.'),
  'refusal': o('refusal', 'Refus', 'scene', mdiHandBackLeftOutline, 'Le héros refuse l’appel. Seulement avant la chanson Mentor.'),

  'gatekeeper': o('gatekeeper', 'Gate keeper', 'scene', mdiGate, 'Le gate keeper fait passer au héros une épreuve difficile (mais pas impossible) qu’il doit réussir, avec un enjeu fort.'),
  'new-world': o('new-world', 'Nouveau monde', 'tune', mdiEarth, 'Le héros découvre le nouveau monde. Même structure que l’opening.', 'Identique à l’opening · le héros attend le 2ᵉ refrain pour chanter'),
}

export const SONGS: SongId[] = ['i-wish', 'mentor', 'duo', 'conditional-love', 'other']
export const OPENINGS: OptionId[] = ['opening-happy', 'opening-dark', 'opening-bittersweet']

export const SONG_COUNT = 3

/** Songs that may appear more than once in a path. */
export const REPEATABLE: SongId[] = ['other']

/**
 * Refusal rule. true: a refusal must be followed later by the Mentor song
 * (the mentor gets the hero moving again). false: a refusal is allowed as long as the
 * Mentor song has not been played yet.
 */
export const REFUSAL_NEEDS_MENTOR_AFTER = true

export const isSong = (id: OptionId): id is SongId => (SONGS as OptionId[]).includes(id)
export const isMentorish = (id: OptionId) => id === 'mentor'

/*
 * Staging cues: what happens on stage between two steps (punchlines, black-outs,
 * scene changes...). They are not choices, just reminders drawn on the flow.
 * A scene cue can be unfolded to describe who / what / where (see scene.ts).
 */
export type CueId =
  | 'platform'
  | 'punchline-opening'
  | 'punchline-mentor'
  | 'punchline-duo'
  | 'punchline-i-wish'
  | 'punchline-welcome'
  | 'reality'
  | 'blackout'
  | 'new-scene'
  | 'optional-scene'
  | 'threshold-scene'
  | 'hero-alone'
  | 'hero-succeeds'
  | 'curtain-call'

export interface Cue {
  id: CueId
  /** Main words, shown in bold. */
  label: string
  detail?: string
  /** black: a black-out; final: the curtain call. */
  tone?: 'black' | 'final'
  /** A new scene, which can be unfolded to set who / what / where. */
  scene?: boolean
  /** May be left out (shown discreetly, skipped in exports when empty). */
  optional?: boolean
}

const NEW_SCENE_DETAIL = 'qui, quoi, où · le héros reste sur scène'
const punchline = (id: CueId, detail: string): Cue => ({ id, label: 'Punchline', detail })

export const CUES: Record<CueId, Cue> = {
  'platform': { id: 'platform', label: 'Plateforme', detail: 'dans l’ancien monde · qui, quoi, où', scene: true },
  'punchline-opening': punchline('punchline-opening', 'lancement du numéro'),
  'punchline-mentor': punchline('punchline-mentor', '« Tu peux ou tu peux pas »'),
  'punchline-duo': punchline('punchline-duo', '« On est amis » / « On est opposés »'),
  'punchline-i-wish': punchline('punchline-i-wish', '« Si seulement… »'),
  'punchline-welcome': punchline('punchline-welcome', '« Bienvenue… ! »'),
  'reality': { id: 'reality', label: 'Retour brutal', detail: 'à la réalité' },
  'blackout': { id: 'blackout', label: 'Noir', detail: 'projecteur', tone: 'black' },
  'new-scene': { id: 'new-scene', label: 'Nouvelle scène', detail: NEW_SCENE_DETAIL, scene: true },
  'optional-scene': {
    id: 'optional-scene',
    label: 'Nouvelle scène',
    detail: `optionnelle · ${NEW_SCENE_DETAIL}`,
    scene: true,
    optional: true,
  },
  'threshold-scene': {
    id: 'threshold-scene',
    label: 'Nouvelle scène',
    detail: `${NEW_SCENE_DETAIL}, sur le point d’entrer dans un endroit qui va l’aider à réaliser son rêve`,
    scene: true,
  },
  'hero-alone': { id: 'hero-alone', label: 'On laisse le héros seul' },
  'hero-succeeds': { id: 'hero-succeeds', label: 'Le héros réussit', detail: 'l’épreuve du gate keeper' },
  'curtain-call': { id: 'curtain-call', label: 'Salut public', tone: 'final' },
}

const OPENING_BEFORE: CueId[] = ['platform', 'punchline-opening']
const AFTER_SONG: CueId[] = ['blackout', 'new-scene']

/** Cues played right before a step (the punchline always comes last). */
const CUES_BEFORE: Partial<Record<OptionId, CueId[]>> = {
  'opening-happy': OPENING_BEFORE,
  'opening-dark': OPENING_BEFORE,
  'opening-bittersweet': OPENING_BEFORE,
  'mentor': ['punchline-mentor'],
  'duo': ['punchline-duo'],
  'i-wish': ['hero-alone', 'punchline-i-wish'],
  'gatekeeper': ['threshold-scene'],
}

/** Cues played right after a step. */
const CUES_AFTER: Partial<Record<OptionId, CueId[]>> = {
  'opening-happy': AFTER_SONG,
  'opening-dark': AFTER_SONG,
  'opening-bittersweet': AFTER_SONG,
  ...Object.fromEntries(SONGS.map((id) => [id, AFTER_SONG])),
  'i-wish': ['reality', ...AFTER_SONG],
  'gatekeeper': ['hero-succeeds', 'new-scene', 'punchline-welcome'],
  'new-world': ['blackout', 'curtain-call'],
}

/**
 * Cues between step `prev` and the next step. `next` lists the possible next
 * options (only the cues shared by all of them are kept), or is empty at the end.
 * There is at most one scene cue between two steps.
 */
export function cuesBetween(prev: OptionId | null, next: OptionId[]): Cue[] {
  const after = prev ? CUES_AFTER[prev] ?? [] : []
  // After a prologue the hero is already on stage: no platform, no punchline.
  const lists = next.map((id) => (prev === 'prologue' ? [] : CUES_BEFORE[id] ?? []))
  const before = lists.length ? lists[0].filter((c) => lists.every((l) => l.includes(c))) : []
  // Right after the messenger, the I wish may start in a new scene, or not.
  if (prev === 'messenger' && next.length === 1 && next[0] === 'i-wish') before.unshift('optional-scene')
  // The threshold scene replaces the generic new scene.
  const ids = [...after.filter((c) => !(c === 'new-scene' && before.includes('threshold-scene'))), ...before]
  return ids.map((id) => CUES[id])
}
