import type { OptionId } from './steps'
import type { SectionEntry } from './sections'

export interface PresetStep {
  id: OptionId
  title: string
  description: string
  structure?: SectionEntry[]
}

export interface MoviePreset {
  id: string
  title: string
  year: number
  steps: PresetStep[]
}

export const MOVIES: MoviePreset[] = [
  {
    id: 'aladdin',
    title: 'Aladdin',
    year: 1992,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-happy', title: 'Nuits d’Arabie', description: 'Un colporteur nous accueille à Agrabah, une ville du désert animée, pleine de magie et de mystère.' },
      { id: 'duo', structure: [{ id: 'v-vs' }], title: 'Je vole', description: 'Aladdin et Abu échappent aux gardes du palais et aux marchands qui le traitent de vaurien.' },
      { id: 'i-wish', title: 'Je vole (reprise)', description: 'Seul sur son toit, Aladdin rêve qu’un jour les gens verront qu’il vaut bien plus que ça.' },
      { id: 'messenger', title: 'Le vieux prisonnier', description: 'Jafar, déguisé en vieux prisonnier, attire Aladdin dans la Caverne aux merveilles, où il trouve la lampe magique.' },
      { id: 'mentor', structure: [{ id: 'v-mentor' }], title: 'Je suis ton meilleur ami', description: 'Le Génie jaillit de la lampe et montre à Aladdin ce que trois vœux peuvent faire pour lui.' },
      { id: 'gatekeeper', title: 'Le premier vœu', description: 'Le Génie prévient Aladdin qu’il ne peut forcer personne à tomber amoureux, puis exauce son premier vœu : devenir prince.' },
      { id: 'new-world', title: 'Prince Ali', description: 'Aladdin entre dans Agrabah sous le nom de Prince Ali Ababwa, le Génie en tête d’un cortège d’éléphants, de chameaux et de danseurs.' },
    ],
  },
  {
    id: 'little-mermaid',
    title: 'La Petite Sirène',
    year: 1989,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-happy', title: 'Les Filles de Triton', description: 'La cour du roi Triton se réunit pour le concert de ses filles, mais le coquillage d’Ariel est vide : elle est partie explorer.' },
      { id: 'i-wish', title: 'Partir là-bas', description: 'Dans sa grotte secrète remplie de trésors humains, Ariel confie à Polochon qu’elle rêve de vivre parmi les humains.' },
      { id: 'messenger', title: 'La tempête', description: 'Ariel espionne le navire du prince Éric ; quand une tempête le fait sombrer, elle le sauve et tombe amoureuse.' },
      { id: 'mentor', structure: [{ id: 'v-anti' }], title: 'Sous l’océan', description: 'Sébastien le crabe essaie de convaincre Ariel que la vie sous la mer vaut mieux que tout ce qu’il y a sur terre.' },
      { id: 'other', title: 'Pauvres âmes en perdition', description: 'Chanson de la méchante : la sorcière des mers Ursula offre à Ariel des jambes humaines pour trois jours, en échange de sa voix.' },
      { id: 'gatekeeper', title: 'Le contrat', description: 'Ariel signe le contrat d’Ursula ; sa voix lui est prise et elle est entraînée vers la surface, devenue humaine.' },
      { id: 'new-world', title: 'Embrasse-la', description: 'Sans voix sur la terre ferme, Ariel traverse un lagon en barque avec Éric, pendant que Sébastien et les animaux tentent de le pousser à l’embrasser.' },
    ],
  },
  {
    id: 'moana',
    title: 'Vaiana',
    year: 2016,
    steps: [
      { id: 'prologue', title: 'La légende de Grand-mère Tala', description: 'Grand-mère Tala raconte aux enfants de l’île comment Maui a volé le cœur de Te Fiti ; l’océan choisit alors la petite Vaiana.' },
      { id: 'opening-happy', title: 'Where You Are', description: 'Le chef Tui et les villageois de Motunui chantent que tout ce dont Vaiana a besoin se trouve ici, sur l’île.' },
      { id: 'i-wish', title: 'Le Bleu Lumière', description: 'Sur la plage, Vaiana avoue que l’horizon ne cesse de l’appeler, au-delà du récif qu’elle n’a pas le droit de franchir.' },
      { id: 'messenger', title: 'Le fléau', description: 'Pêcheurs et cultivateurs signalent des noix de coco pourries et des filets vides : les ténèbres libérées par Maui ont atteint Motunui.' },
      { id: 'refusal', title: 'Retour au village', description: 'Après le chavirage de sa pirogue sur le récif, Vaiana abandonne et va accepter son avenir de cheffe.' },
      { id: 'mentor', structure: [{ id: 'v-mentor' }], title: 'L’Explorateur', description: 'Grand-mère Tala lui révèle une grotte cachée remplie de pirogues ; Vaiana apprend que ses ancêtres étaient des navigateurs.' },
      { id: 'duo', structure: [{ id: 'v-vs' }], title: 'Pour les hommes', description: 'Vaiana trouve le demi-dieu Maui, qui se vante de ses exploits, puis l’enferme dans une grotte et lui vole sa pirogue.' },
      { id: 'gatekeeper', title: 'Les Kakamoras', description: 'Des pirates en armure de noix de coco attaquent la pirogue ; Vaiana les repousse et Maui accepte à contrecœur de se joindre à la quête.' },
      { id: 'new-world', title: 'Bling-bling', description: 'À Lalotai, le royaume des monstres, le crabe géant Tamatoa exhibe son trésor, hameçon de Maui compris.' },
    ],
  },
  {
    id: 'sweeney-todd',
    title: 'Sweeney Todd',
    year: 1979,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-dark', title: 'The Ballad of Sweeney Todd', description: 'La troupe met le public en garde contre Sweeney Todd, le barbier diabolique de Fleet Street.' },
      { id: 'duo', structure: [{ id: 'v-vs' }], title: 'No Place Like London', description: 'En débarquant, le jeune marin Anthony fait l’éloge de Londres, tandis que Sweeney répond que la ville est un trou rempli de vermine.' },
      { id: 'other', title: 'The Worst Pies in London', description: 'Numéro comique : Mrs Lovett avoue que ses tourtes sont les pires de Londres, car la viande est si difficile à trouver.' },
      { id: 'messenger', title: 'Le récit de Mrs Lovett', description: 'Mrs Lovett raconte à Sweeney comment le juge Turpin a perdu sa femme Lucy et pris sa fille Johanna sous sa tutelle.' },
      { id: 'i-wish', title: 'My Friends', description: 'Retrouvant ses rasoirs d’argent, Sweeney attend avec impatience le jour où il pourra s’en servir sur le juge.' },
      { id: 'gatekeeper', title: 'Le juge Turpin', description: 'Le juge s’assoit enfin dans le fauteuil de Sweeney, mais Anthony fait irruption et le juge s’échappe ; Sweeney jure de se venger de toute l’humanité.' },
      { id: 'new-world', title: 'A Little Priest', description: 'Mrs Lovett propose de mettre les victimes de Sweeney dans ses tourtes, et ensemble ils imaginent le goût de chaque métier.' },
    ],
  },
  {
    id: 'les-miserables',
    title: 'Les Misérables',
    year: 1985,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-dark', title: 'Work Song', description: 'Des bagnards triment sous l’œil de Javert, qui libère sur parole le prisonnier 24601, Jean Valjean, après dix-neuf ans.' },
      { id: 'other', title: 'On Parole', description: 'Marqué par son passeport jaune, Valjean est chassé de chaque auberge et de chaque ferme où il se présente.' },
      { id: 'messenger', title: 'L’argenterie volée', description: 'Hébergé pour la nuit par l’évêque de Digne, Valjean vole son argenterie et s’enfuit ; les gendarmes le ramènent.' },
      { id: 'mentor', structure: [{ id: 'v-mentor' }], title: 'Valjean Forgiven', description: 'L’évêque le couvre, ajoute ses chandeliers à l’argenterie et dit à Valjean de s’en servir pour devenir un honnête homme.' },
      { id: 'i-wish', title: 'What Have I Done?', description: 'Bouleversé par cette clémence, Valjean aspire à fuir l’homme haineux qu’il est devenu et à recommencer sa vie.' },
      { id: 'gatekeeper', title: 'Le passeport jaune', description: 'Valjean déchire ses papiers : Javert et la loi le traqueront désormais comme un fugitif.' },
      { id: 'new-world', title: 'At the End of the Day', description: 'Huit ans plus tard, sous un nouveau nom, Valjean est maire et patron d’usine à Montreuil-sur-Mer, tandis que ses ouvriers luttent pour survivre.' },
    ],
  },
]
