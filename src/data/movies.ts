import type { OptionId } from './steps'

export interface PresetStep {
  id: OptionId
  title: string
  description: string
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
      { id: 'opening-happy', title: 'Arabian Nights', description: 'A peddler welcomes us to Agrabah, a bustling desert city full of magic and mystery.' },
      { id: 'you-vs-me', title: 'One Jump Ahead', description: 'Aladdin and Abu outrun the palace guards and the merchants who call him a street rat.' },
      { id: 'i-wish', title: 'One Jump Ahead (Reprise)', description: 'Alone on his rooftop, Aladdin dreams that one day people will see there is so much more to him.' },
      { id: 'messenger', title: 'The old prisoner', description: 'Jafar, disguised as an old prisoner, lures Aladdin to the Cave of Wonders, where he finds the magic lamp.' },
      { id: 'mentor', title: 'Friend Like Me', description: 'The Genie bursts out of the lamp and shows Aladdin what three wishes can do for him.' },
      { id: 'gatekeeper', title: 'The first wish', description: 'The Genie warns Aladdin he can\'t make anyone fall in love, then grants his first wish: to become a prince.' },
      { id: 'new-world', title: 'Prince Ali', description: 'Aladdin parades into Agrabah as Prince Ali Ababwa, with the Genie leading a procession of elephants, camels and dancers.' },
    ],
  },
  {
    id: 'little-mermaid',
    title: 'The Little Mermaid',
    year: 1989,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-happy', title: 'Daughters of Triton', description: 'King Triton\'s court gathers for his daughters\' concert, but Ariel\'s shell is empty: she is off exploring.' },
      { id: 'i-wish', title: 'Part of Your World', description: 'In her secret grotto full of human treasures, Ariel tells Flounder she longs to live among humans.' },
      { id: 'messenger', title: 'The storm', description: 'Ariel spies on Prince Eric\'s ship; when a storm wrecks it, she saves him and falls in love.' },
      { id: 'anti-mentor', title: 'Under the Sea', description: 'Sebastian the crab tries to convince Ariel that life under the sea beats anything on land.' },
      { id: 'other', title: 'Poor Unfortunate Souls', description: 'Villain song: the sea witch Ursula offers Ariel human legs for three days in exchange for her voice.' },
      { id: 'gatekeeper', title: 'The contract', description: 'Ariel signs Ursula\'s contract; her voice is taken and she is pulled to the surface, now human.' },
      { id: 'new-world', title: 'Kiss the Girl', description: 'Voiceless on land, Ariel rows across a lagoon with Eric while Sebastian and the animals try to make him kiss her.' },
    ],
  },
  {
    id: 'moana',
    title: 'Moana',
    year: 2016,
    steps: [
      { id: 'prologue', title: 'Gramma Tala\'s legend', description: 'Gramma Tala tells the island\'s children how Maui stole the heart of Te Fiti; the ocean then chooses baby Moana.' },
      { id: 'opening-happy', title: 'Where You Are', description: 'Chief Tui and the villagers of Motunui sing that everything Moana needs is right here on the island.' },
      { id: 'i-wish', title: 'How Far I\'ll Go', description: 'On the beach, Moana confesses that the horizon keeps calling her, beyond the reef she is not allowed to cross.' },
      { id: 'messenger', title: 'The blight', description: 'Fishermen and farmers report rotting coconuts and empty nets: the darkness Maui unleashed has reached Motunui.' },
      { id: 'refusal', title: 'Back to the village', description: 'After her canoe capsizes on the reef, Moana gives up and goes to accept her future as chief.' },
      { id: 'mentor', title: 'We Know the Way', description: 'Gramma Tala reveals a hidden cave of voyaging canoes; Moana learns her ancestors were wayfinders.' },
      { id: 'you-vs-me', title: 'You\'re Welcome', description: 'Moana finds the demigod Maui, who boasts about his deeds, then traps her in a cave and steals her canoe.' },
      { id: 'gatekeeper', title: 'The Kakamora', description: 'Coconut-armoured pirates attack the canoe; Moana fights them off and Maui reluctantly joins the quest.' },
      { id: 'new-world', title: 'Shiny', description: 'In Lalotai, the realm of monsters, the giant crab Tamatoa shows off his treasure hoard, Maui\'s hook included.' },
    ],
  },
  {
    id: 'sweeney-todd',
    title: 'Sweeney Todd',
    year: 1979,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-dark', title: 'The Ballad of Sweeney Todd', description: 'The company warns the audience about Sweeney Todd, the demon barber of Fleet Street.' },
      { id: 'you-vs-me', title: 'No Place Like London', description: 'Arriving by ship, young sailor Anthony praises London while Sweeney answers that the city is a pit full of vermin.' },
      { id: 'other', title: 'The Worst Pies in London', description: 'Comic number: Mrs Lovett admits her pies are the worst in London, because meat is so hard to come by.' },
      { id: 'messenger', title: 'Mrs Lovett\'s story', description: 'Mrs Lovett tells Sweeney how Judge Turpin ruined his wife Lucy and took his daughter Johanna as his ward.' },
      { id: 'i-wish', title: 'My Friends', description: 'Reunited with his silver razors, Sweeney longs for the day he can use them on the Judge.' },
      { id: 'gatekeeper', title: 'Judge Turpin', description: 'The Judge finally sits in Sweeney\'s chair, but Anthony bursts in and the Judge escapes; Sweeney swears revenge on all of mankind.' },
      { id: 'new-world', title: 'A Little Priest', description: 'Mrs Lovett suggests baking Sweeney\'s victims into her pies, and together they imagine how each trade would taste.' },
    ],
  },
  {
    id: 'les-miserables',
    title: 'Les Misérables',
    year: 1985,
    steps: [
      { id: 'no-prologue', title: '', description: '' },
      { id: 'opening-dark', title: 'Work Song', description: 'Convicts toil under the watch of Javert, who releases prisoner 24601, Jean Valjean, on parole after nineteen years.' },
      { id: 'other', title: 'On Parole', description: 'Branded by his yellow ticket of leave, Valjean is turned away by every inn and farm he tries.' },
      { id: 'messenger', title: 'The stolen silver', description: 'Taken in for the night by the Bishop of Digne, Valjean steals his silver and flees; constables drag him back.' },
      { id: 'mentor', title: 'Valjean Forgiven', description: 'The Bishop covers for him, adds his candlesticks to the silver and tells Valjean to use them to become an honest man.' },
      { id: 'i-wish', title: 'What Have I Done?', description: 'Shaken by this mercy, Valjean longs to escape the hateful man he has become and start his life again.' },
      { id: 'gatekeeper', title: 'The yellow ticket', description: 'Valjean tears up his parole papers: Javert and the law will now hunt him as a fugitive.' },
      { id: 'new-world', title: 'At the End of the Day', description: 'Eight years later, under a new name, Valjean is mayor and factory owner in Montreuil-sur-Mer, while his workers struggle to survive.' },
    ],
  },
]
