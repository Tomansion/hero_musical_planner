import { MOVIES, type MoviePreset } from './movies'
import type { Relation, SceneInfo } from './scene'

/*
 * Stories we played on stage. Like the movie presets, each is a full path; a
 * `scene` describes the new scene right after its step.
 */

const who = (name: string, side: Relation['side'] = null, touch: Relation['touch'] = null, depth: Relation['depth'] = null): Relation => ({
  name,
  side,
  touch,
  depth,
})
const scene = (s: Partial<SceneInfo>): SceneInfo => ({ who: [], where: '', what: '', ...s })

export const PLAYED: MoviePreset[] = [
  {
    id: 'pirate-cook',
    title: 'Le pirate cuistot',
    steps: [
      { id: 'prologue', title: 'En cuisine', description: 'Le héros fait la cuisine sur le bateau pirate et rend explicite son rêve.' },
      {
        id: 'opening-happy',
        title: 'Les pirates',
        description: 'Les différents pirates se présentent, on parle du bateau. Avec un dance break.',
        scene: scene({ where: 'Sur le bateau', what: 'Le héros et son meilleur copain', who: [who('Le meilleur copain', 'friend')] }),
      },
      {
        id: 'duo',
        structure: [{ id: 'v-and' }],
        title: 'Meilleurs copains',
        description: 'Le héros et son copain chantent le fait d’être les meilleurs copains.',
        scene: scene({ where: 'Sur le bateau', what: 'Le capitaine a une nouvelle pour le héros', who: [who('Le capitaine', 'friend', 'tactile', 'intimate')] }),
      },
      {
        id: 'mentor',
        structure: [{ id: 'v-mentor' }],
        title: 'Le capitaine',
        description: 'Le capitaine est heureux d’avoir trouvé les fonds pour que le héros puisse réaliser son rêve.',
        scene: scene({ where: 'Sur les quais' }),
      },
      {
        id: 'messenger',
        title: 'Le scorbut',
        description: 'Sur les quais, on annonce qu’à cause du scorbut, on cherche à former des cuisiniers pour les cuisines du roi.',
      },
      {
        id: 'i-wish',
        title: '',
        description: 'Le héros chante son rêve immédiatement après l’annonce.',
        scene: scene({ where: 'Sur les quais' }),
      },
      {
        id: 'gatekeeper',
        title: 'L’omelette',
        description: 'Sur les quais, on met le héros à l’épreuve.',
        challenge: 'Faire une omelette',
        scene: scene({ where: 'Les cuisines du roi', who: [who('Les cuisiniers'), who('Le plongeur')] }),
      },
      { id: 'new-world', title: 'Les cuisines du roi', description: 'Le héros entre dans les cuisines du roi, avec les cuisiniers et le plongeur.' },
    ],
  },
  {
    id: 'box-stacker',
    title: 'L’empileur de boîtes',
    steps: [
      { id: 'prologue', title: 'Empilage', description: 'Le héros empile des boîtes et rêve de la tour Eiffel.' },
      {
        id: 'opening-happy',
        title: 'Le supermarché',
        description: 'Dans un supermarché : un laveur de vitres, une comptable…',
        scene: scene({ where: 'Le salon', who: [who('La conjointe', 'friend', null, 'intimate')] }),
      },
      {
        id: 'i-wish',
        title: 'Dans le salon',
        description: 'Le héros chante son rêve, sa conjointe l’encourage.',
        scene: scene({ who: [who('Les employés manuels', 'friend')] }),
      },
      {
        id: 'duo',
        structure: [{ id: 'v-and' }],
        title: 'Les copains',
        description: 'Les employés manuels, copains.',
        scene: scene({ who: [who('Les employés manuels', 'friend'), who('Les bureaucrates', 'enemy')] }),
      },
      {
        id: 'other',
        title: 'Manuels contre bureaucrates',
        description: 'Un You vs me entre les employés manuels et les bureaucrates (joué en Autre : le flow n’a pas été suivi).',
        scene: scene({ where: 'Devant la boutique' }),
      },
      {
        id: 'messenger',
        title: 'L’appel à projet',
        description: 'Devant la boutique, on montre des affiches pour un appel à projet.',
      },
      {
        id: 'gatekeeper',
        title: 'La structure humaine',
        description: '',
        challenge: 'Construire une structure humaine',
        scene: scene({ where: 'L’école d’architecture' }),
      },
      { id: 'new-world', title: 'L’école d’architecture', description: '' },
    ],
  },
  {
    id: 'factory-leader',
    title: 'Le leader de l’usine',
    steps: [
      { id: 'no-prologue', title: '', description: '', scene: scene({ where: 'L’usine', what: 'Le travail à la chaîne' }) },
      {
        id: 'opening-dark',
        structure: [{ id: 'tagline', count: 1 }, { id: 'bridge' }, { id: 'tagline', count: 1 }, { id: 'bridge' }],
        title: 'L’usine',
        description: 'Travail à la chaîne dans l’usine. En taglines 1, avec bridges.',
        scene: scene({ where: 'Un bar', who: [who('Le barman', 'friend')] }),
      },
      {
        id: 'mentor',
        structure: [{ id: 'v-mentor' }],
        title: 'Le barman',
        description: 'Dans un bar, le barman encourage le héros.',
        scene: scene({ where: 'La salle à manger', what: 'Les enfants mangent des boulons', who: [who('Les enfants')] }),
      },
      {
        id: 'duo',
        structure: [{ id: 'v-and' }],
        title: 'À table',
        description: 'Dans la salle à manger, les enfants mangent des boulons.',
        scene: scene({ where: 'L’usine' }),
      },
      { id: 'i-wish', title: '', description: 'Le I wish commence dans l’usine.' },
      { id: 'messenger', title: '', description: '' },
      {
        id: 'gatekeeper',
        title: 'Le jury',
        description: 'Un jury d’évaluation met le héros à l’épreuve.',
        challenge: 'Trouver une solution à différentes situations',
        scene: scene({ where: 'L’école de gestion' }),
      },
      { id: 'new-world', title: 'L’école de gestion', description: '' },
    ],
  },
  {
    id: 'sea-man',
    title: 'L’homme marin',
    steps: [
      {
        id: 'no-prologue',
        title: '',
        description: '',
        scene: scene({ where: 'Un sous-marin à quai', who: [who('Le commandant'), who('L’équipage')] }),
      },
      {
        id: 'opening-happy',
        title: 'Le sous-marin',
        description: 'Dans un sous-marin à quai, un commandant et son équipage.',
        scene: scene({ where: 'Le sous-marin', who: [who('Le mécano')] }),
      },
      {
        id: 'mentor',
        structure: [{ id: 'v-anti' }],
        title: 'Le mécano',
        description: 'Le mécano dit au héros qu’il a sa place ici : il n’a pas besoin d’équipement pour nager.',
        scene: scene({ where: 'Un zodiac', who: [who('L’équipage'), who('Les plongeurs'), who('Le capitaine')] }),
      },
      {
        id: 'duo',
        structure: [{ id: 'v-vs' }],
        title: 'L’équipage contre le zodiac',
        description: 'L’équipage qui travaille face aux autres, sur un zodiac avec les plongeurs et le capitaine.',
      },
      {
        id: 'i-wish',
        title: '(pas de I wish)',
        description: 'Pas joué : le flow n’a pas été suivi.',
        scene: scene({ where: 'Sous l’eau', who: [who('Les poissons')] }),
      },
      { id: 'messenger', title: 'Les poissons', description: 'Des poissons annoncent au héros qu’il est le prince.', scene: scene({ where: 'Sous l’eau' }) },
      {
        id: 'gatekeeper',
        title: 'L’épreuve des poissons',
        description: 'Les poissons font passer une épreuve au héros.',
        challenge: 'Respirer sous l’eau',
        scene: scene({ where: 'Les fonds marins' }),
      },
      { id: 'new-world', title: 'Les fonds marins', description: '' },
    ],
  },
]

/** Every preset, famous and played. */
export const ALL_STORIES: MoviePreset[] = [...MOVIES, ...PLAYED]
