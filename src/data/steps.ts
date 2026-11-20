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
}

const o = (id: OptionId, label: string, kind: StepKind, icon: string, hint: string): StepOption => ({
  id,
  label,
  kind,
  icon,
  hint,
})

export const OPTIONS: Record<OptionId, StepOption> = {
  'prologue': o('prologue', 'Prologue', 'tune', mdiBookOpenPageVariantOutline, 'Une courte chanson du héros avant l’ouverture. Impose une ouverture Happy.'),
  'no-prologue': o('no-prologue', 'Sans prologue', 'skip', mdiArrowDownThin, 'Commencer directement par le numéro d’ouverture.'),

  'opening-happy': o('opening-happy', 'Happy', 'tune', mdiWeatherSunny, 'Une ouverture entraînante qui présente le monde et ses habitants.'),
  'opening-dark': o('opening-dark', 'Dark', 'tune', mdiWeatherNight, 'Une ouverture lourde et inquiétante.'),
  'opening-bittersweet': o('opening-bittersweet', 'HappyDark', 'tune', mdiWeatherPartlyCloudy, 'Un sujet sombre, mais traité avec humour.'),

  'mentor': o('mentor', 'Mentor', 'tune', mdiSchoolOutline, 'Un guide, un tentateur, ou les deux, parlent au héros. La version se choisit dans la structure.'),
  'duo': o('duo', 'You & / vs me', 'tune', mdiHandshakeOutline, 'Deux personnages se découvrent du même côté (You & me) ou s’opposent (You vs me). La version se choisit dans la structure.'),
  'conditional-love': o('conditional-love', 'Amour conditionnel', 'tune', mdiHeartHalfFull, 'Un amour qui n’est donné qu’à certaines conditions.'),
  'i-wish': o('i-wish', 'I wish', 'tune', mdiStarShooting, 'Le héros chante ce à quoi il aspire. Toujours présent dans le parcours.'),
  'other': o('other', 'Autre', 'tune', mdiMusicNotePlus, 'N’importe quel autre numéro : chanson du méchant, chanson comique, numéro de groupe...'),

  'messenger': o('messenger', 'Messager', 'scene', mdiEmailFastOutline, 'Quelqu’un ou quelque chose apporte l’appel à l’aventure.'),
  'refusal': o('refusal', 'Refus', 'scene', mdiHandBackLeftOutline, 'Le héros refuse l’appel. Seulement avant la chanson Mentor.'),

  'gatekeeper': o('gatekeeper', 'Gardien', 'scene', mdiGate, 'Un gardien met le héros à l’épreuve au seuil du nouveau monde.'),
  'new-world': o('new-world', 'Nouveau monde', 'tune', mdiEarth, 'Le héros découvre le nouveau monde.'),
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
