/*
 * A new scene (qui, quoi, où): the characters on stage and their relation to
 * the hero, the place and the action. Stored on the step the scene follows.
 */

/** One relation axis: two opposite values, or unknown (null). */
export interface RelationAxis {
  key: 'side' | 'touch' | 'depth'
  /** Short name of the axis. */
  name: string
  options: [AxisOption, AxisOption]
}
export interface AxisOption {
  id: string
  label: string
  /** Colour of the value when chosen. */
  color: string
}

export const RELATION_AXES: RelationAxis[] = [
  {
    key: 'side',
    name: 'Camp',
    options: [
      { id: 'friend', label: 'Ami', color: '#16a34a' },
      { id: 'enemy', label: 'Ennemi', color: '#dc2626' },
    ],
  },
  {
    key: 'touch',
    name: 'Contact',
    options: [
      { id: 'tactile', label: 'Tactile', color: '#e8590c' },
      { id: 'reserved', label: 'Pudique', color: '#0284c7' },
    ],
  },
  {
    key: 'depth',
    name: 'Lien',
    options: [
      { id: 'intimate', label: 'Intime', color: '#db2777' },
      { id: 'casual', label: 'Superficiel', color: '#64748b' },
    ],
  },
]

/** Label of the unknown value of an axis. */
export const UNKNOWN_LABEL = '?'

export interface Relation {
  /** The character. */
  name: string
  side: 'friend' | 'enemy' | null
  touch: 'tactile' | 'reserved' | null
  depth: 'intimate' | 'casual' | null
}

export interface SceneInfo {
  /** Unfolded in the tree. */
  open?: boolean
  /** Qui: the characters and their relation to the hero. */
  who: Relation[]
  /** Où. */
  where: string
  /** Quoi. */
  what: string
}

export const emptyScene = (): SceneInfo => ({ who: [], where: '', what: '' })
export const emptyRelation = (): Relation => ({ name: '', side: null, touch: null, depth: null })

/** Repair a saved scene (missing fields). */
export function normalizeScene(s: Partial<SceneInfo> | undefined): SceneInfo | undefined {
  if (!s) return undefined
  return {
    open: !!s.open,
    where: s.where ?? '',
    what: s.what ?? '',
    who: (s.who ?? []).map((r) => ({ ...emptyRelation(), ...r })),
  }
}

const axisLabel = (axis: RelationAxis, value: string | null) =>
  axis.options.find((o) => o.id === value)?.label.toLowerCase() ?? null

/** "Jafar (ennemi, pudique)": known values only. */
export function relationText(r: Relation): string {
  const known = RELATION_AXES.map((a) => axisLabel(a, r[a.key])).filter(Boolean)
  const name = r.name.trim() || 'Quelqu’un'
  return known.length ? `${name} (${known.join(', ')})` : name
}

export const sceneIsEmpty = (s: SceneInfo | undefined) =>
  !s || (!s.where.trim() && !s.what.trim() && !s.who.some((r) => r.name.trim() || r.side || r.touch || r.depth))

/** The filled-in parts of a scene, e.g. ["Qui : Jafar (ennemi)", "Où : le palais"]. */
export function sceneParts(s: SceneInfo | undefined): string[] {
  if (!s) return []
  const who = s.who.filter((r) => r.name.trim() || r.side || r.touch || r.depth)
  return [
    who.length ? `Qui : ${who.map(relationText).join(', ')}` : '',
    s.what.trim() ? `Quoi : ${s.what.trim()}` : '',
    s.where.trim() ? `Où : ${s.where.trim()}` : '',
  ].filter(Boolean)
}
