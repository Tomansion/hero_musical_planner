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
  mdiHandFrontRightOutline,
  mdiStarShooting,
  mdiSwordCross,
  mdiWeatherNight,
  mdiWeatherPartlyCloudy,
  mdiWeatherSunny,
} from '@mdi/js'

/**
 * tune  = a song, performed musically
 * scene = a step played by the comedians (no song)
 * skip  = "nothing here" (used to skip an optional step)
 */
export type StepKind = 'tune' | 'scene' | 'skip'

export type SongId =
  | 'mentor'
  | 'anti-mentor'
  | 'you-and-me'
  | 'you-vs-me'
  | 'conditional-love'
  | 'i-wish'
  | 'other'

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

export interface StepOption {
  id: OptionId
  label: string
  kind: StepKind
  icon: string
  hint: string
}

const o = (id: OptionId, label: string, kind: StepKind, icon: string, hint: string): StepOption => ({
  id,
  label,
  kind,
  icon,
  hint,
})

export const OPTIONS: Record<OptionId, StepOption> = {
  'prologue': o('prologue', 'Prologue', 'tune', mdiBookOpenPageVariantOutline, 'A short song the hero sings before the opening. Forces a happy opening.'),
  'no-prologue': o('no-prologue', 'No prologue', 'skip', mdiArrowDownThin, 'Start straight with the opening number.'),

  'opening-happy': o('opening-happy', 'Happy', 'tune', mdiWeatherSunny, 'Upbeat opening number introducing the world and its people.'),
  'opening-dark': o('opening-dark', 'Dark', 'tune', mdiWeatherNight, 'A heavy, grim opening number.'),
  'opening-bittersweet': o('opening-bittersweet', 'Bittersweet', 'tune', mdiWeatherPartlyCloudy, 'Dark subject, but played for laughs.'),

  'mentor': o('mentor', 'Mentor', 'tune', mdiSchoolOutline, 'A guide teaches the hero what they need to hear.'),
  'anti-mentor': o('anti-mentor', 'Anti-mentor', 'tune', mdiHandFrontRightOutline, 'A tempter gives the hero seductive, bad advice.'),
  'you-and-me': o('you-and-me', 'You & me', 'tune', mdiHandshakeOutline, 'Two characters find out they are on the same side.'),
  'you-vs-me': o('you-vs-me', 'You vs me', 'tune', mdiSwordCross, 'Two characters clash over opposite views.'),
  'conditional-love': o('conditional-love', 'Conditional love', 'tune', mdiHeartHalfFull, 'Love that is only given on certain terms.'),
  'i-wish': o('i-wish', 'I wish', 'tune', mdiStarShooting, 'The hero sings what they long for. Always in the path.'),
  'other': o('other', 'Other', 'tune', mdiMusicNotePlus, 'Any other number: villain song, comic song, ensemble...'),

  'messenger': o('messenger', 'Messenger', 'scene', mdiEmailFastOutline, 'Someone or something brings the call to adventure.'),
  'refusal': o('refusal', 'Refusal', 'scene', mdiHandBackLeftOutline, 'The hero refuses the call. Only before a Mentor or Anti-mentor song.'),

  'gatekeeper': o('gatekeeper', 'Gatekeeper', 'scene', mdiGate, 'A guardian tests the hero at the threshold of the new world.'),
  'new-world': o('new-world', 'New world', 'tune', mdiEarth, 'The hero discovers the new world.'),
}

export const SONGS: SongId[] = ['i-wish', 'mentor', 'anti-mentor', 'you-and-me', 'you-vs-me', 'conditional-love', 'other']
export const OPENINGS: OptionId[] = ['opening-happy', 'opening-dark', 'opening-bittersweet']

/** Pairs of songs that can never be in the same path. */
export const EXCLUSIVE: Partial<Record<SongId, SongId>> = {
  'mentor': 'anti-mentor',
  'anti-mentor': 'mentor',
  'you-and-me': 'you-vs-me',
  'you-vs-me': 'you-and-me',
}

export const SONG_COUNT = 3

/** Songs that may appear more than once in a path. */
export const REPEATABLE: SongId[] = ['other']

/**
 * Refusal rule. true: a refusal must be followed later by a Mentor or Anti-mentor song
 * (the mentor gets the hero moving again). false: a refusal is allowed as long as no
 * Mentor / Anti-mentor song has been played yet.
 */
export const REFUSAL_NEEDS_MENTOR_AFTER = true

export const isSong = (id: OptionId): id is SongId => (SONGS as OptionId[]).includes(id)
export const isMentorish = (id: OptionId) => id === 'mentor' || id === 'anti-mentor'
