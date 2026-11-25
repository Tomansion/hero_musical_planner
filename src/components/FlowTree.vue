<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mdiWater, mdiWaves } from '@mdi/js'
import FlowNode from './FlowNode.vue'
import StepDetail from './StepDetail.vue'
import SectionDetail from './SectionDetail.vue'
import SceneCard from './SceneCard.vue'
import { entryLabel, usePlanner, type LevelView, type PathEntry } from '../composables/usePlanner'
import { OPTIONS, type OptionId } from '../data/steps'
import { SECTIONS, hasStructure } from '../data/sections'

const emit = defineEmits<{ message: [text: string] }>()

const {
  state,
  levels,
  upcoming,
  finished,
  choose,
  update,
  truncate,
  toggleOpen,
  sections,
  structureDone,
  chooseSection,
  truncateSection,
  updateSection,
  cuesBefore,
  toggleScene,
  updateScene,
  addRelation,
  updateRelation,
  removeRelation,
} = usePlanner()

const root = ref<HTMLElement | null>(null)
const size = ref({ w: 0, h: 0 })
const hovered = ref<string | null>(null)

interface Segment {
  key: string
  /** Key of the target node, used for hover highlight. */
  to: string
  d: string
  active: boolean
  delay: number
  /** Stream inside a song structure. */
  small: boolean
}
const segments = ref<Segment[]>([])
/** Fill delay of each active segment, kept stable while it stays active. */
let activeDelays = new Map<string, number>()

const nodeKey = (level: number, id: string) => `${level}:${id}`
const subKey = (level: number, j: number, id: string) => `${level}.${j}:${id}`
/** Where the water leaves an unfolded song structure. */
const exitKey = (level: number) => `${level}:exit`

/** Staging cue k shown before level i. */
const cueKey = (level: number, k: number) => `${level}:cue${k}`

const isOpen = (e: PathEntry | null | undefined): e is PathEntry => !!e && hasStructure(e.id) && !!e.open

/** Key of the node the water leaves step i from. */
function afterKey(i: number): string | null {
  const e = state.path[i]
  if (!e) return null
  return isOpen(e) ? exitKey(i) : nodeKey(i, e.id)
}

/** Key of the node the water comes from when entering level i (through its cues). */
function sourceKey(i: number): string | null {
  if (i === 0) return 'src'
  const prev = afterKey(i - 1)
  if (!prev) return null
  const n = cuesBefore(i).length
  return n ? cueKey(i, n - 1) : prev
}

/** Index of the closing cues, after the last step of a finished path. */
const endIndex = computed(() => state.path.length)

function measure() {
  const el = root.value
  if (!el) return
  const box = el.getBoundingClientRect()
  size.value = { w: box.width, h: el.scrollHeight }

  const center = (key: string) => {
    const n = el.querySelector<HTMLElement>(`[data-node="${key}"]`)
    if (!n) return null
    const r = n.getBoundingClientRect()
    return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 }
  }
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const k = Math.max(24, (b.y - a.y) * 0.55)
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${(a.y + k).toFixed(1)}, ${b.x.toFixed(1)} ${(b.y - k).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
  }

  const out: Segment[] = []
  const nowActive = new Map<string, number>()
  let fresh = 0

  const push = (fromKey: string, toKey: string, active: boolean, small = false) => {
    const a = center(fromKey)
    const b = center(toKey)
    if (!a || !b) return
    const key = `${fromKey}>${toKey}`
    let delay = 0
    if (active) {
      delay = activeDelays.get(key) ?? fresh++ * 0.14
      nowActive.set(key, delay)
    }
    out.push({ key, to: toKey, d: curve(a, b), active, delay, small })
  }

  /** Water runs through the cues before level i, from the previous step. */
  const pushCues = (i: number) => {
    let from = afterKey(i - 1)
    if (!from) return
    cuesBefore(i).forEach((_, k) => {
      push(from!, cueKey(i, k), true)
      from = cueKey(i, k)
    })
  }

  levels.value.forEach((lv: LevelView) => {
    if (lv.index > 0) pushCues(lv.index)
    const from = sourceKey(lv.index)
    if (!from) return
    for (const c of lv.level.choices) {
      if (!c.enabled) continue
      push(from, nodeKey(lv.index, c.option.id), lv.selected?.id === c.option.id)
    }
    // The stream runs through an unfolded song, then leaves by its exit.
    const e = lv.selected
    if (!isOpen(e) || !e.structure) return
    const st = e.structure
    for (const sv of sections(lv.index)) {
      const src = sv.index === 0 ? nodeKey(lv.index, e.id) : subKey(lv.index, sv.index - 1, st[sv.index - 1].id)
      for (const id of sv.level.choices) push(src, subKey(lv.index, sv.index, id), sv.selected?.id === id, true)
    }
    if (structureDone(e) && st.length) {
      push(subKey(lv.index, st.length - 1, st[st.length - 1].id), exitKey(lv.index), true, true)
    }
  })
  if (finished.value && state.path.length) {
    const i = endIndex.value
    pushCues(i)
    push(sourceKey(i)!, 'end', true)
  }

  activeDelays = nowActive
  // Inactive channels first so the stream is drawn on top.
  segments.value = [...out.filter((s) => !s.active), ...out.filter((s) => s.active)]
}

let ro: ResizeObserver | null = null
let raf = 0
const schedule = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(measure)
}
onMounted(() => {
  ro = new ResizeObserver(schedule)
  if (root.value) ro.observe(root.value)
  window.addEventListener('resize', schedule)
  document.fonts?.ready.then(schedule)
  schedule()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(raf)
})
watch(
  () => [levels.value, finished.value],
  () => nextTick(schedule),
  { deep: true },
)

const stepLabel = (n: number) => `Étape ${n}`
const chosenLabel = (lv: LevelView) => {
  if (!lv.selected) return null
  const o = OPTIONS[lv.selected.id]
  return lv.level.kind === 'opening' ? `Opening ${o.label}` : entryLabel(lv.selected)
}

/** Clicking the chosen song again folds / unfolds its structure. */
function select(lv: LevelView, id: OptionId) {
  if (lv.selected?.id === id) toggleOpen(lv.index)
  else choose(lv.index, id)
}

function currentHint(lv: LevelView): string {
  const open = lv.level.choices.filter((c) => c.enabled).map((c) => c.option.id)
  switch (lv.level.kind) {
    case 'prologue':
      return 'Commencer par une courte chanson de prologue, ou passer directement à l’opening.'
    case 'opening':
      return 'Quelle est l’ambiance de l’opening ?'
    case 'gatekeeper':
      return 'Toutes les chansons sont placées. Place au seuil.'
    case 'new-world':
      return 'Le héros entre dans le nouveau monde.'
    default:
      if (open.includes('gatekeeper')) return 'Ajouter un refus si besoin, ou passer au gate keeper.'
      if (open.length === 1 && open[0] === 'messenger') return 'Faire entrer le messager.'
      if (open.includes('messenger')) return 'Choisir la chanson suivante, ou faire entrer le messager.'
      if (open.includes('refusal')) return 'Choisir la chanson suivante, ou laisser le héros refuser l’appel.'
      return 'Choisir la chanson suivante.'
  }
}
</script>

<template>
  <div ref="root" class="tree">
    <svg class="flow" :width="size.w" :height="size.h" :viewBox="`0 0 ${size.w} ${size.h}`" aria-hidden="true">
      <defs>
        <linearGradient id="water" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" :y2="size.h || 1">
          <stop offset="0" stop-color="#22d3ee" />
          <stop offset="0.55" stop-color="#3b82f6" />
          <stop offset="1" stop-color="#4f46e5" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g v-for="s in segments" :key="s.key">
        <path
          v-if="!s.active"
          class="channel"
          :class="{ hover: hovered === s.to, small: s.small }"
          :d="s.d"
        />
        <template v-else>
          <path class="glow" :class="{ small: s.small }" :d="s.d" filter="url(#glow)" :style="{ animationDelay: `${s.delay}s` }" />
          <path class="stream" :class="{ small: s.small }" :d="s.d" pathLength="1" :style="{ animationDelay: `${s.delay}s` }" />
          <path class="ripple" :class="{ small: s.small }" :d="s.d" :style="{ animationDelay: `${s.delay + 0.5}s, 0s` }" />
        </template>
      </g>
    </svg>

    <!-- Spring -->
    <div class="row edge">
      <div class="meta" />
      <div class="nodes">
        <div class="spring" data-node="src"><v-icon :icon="mdiWater" size="16" /></div>
      </div>
      <div class="side" />
    </div>

    <template v-for="lv in levels" :key="`${lv.index}-${lv.level.kind}`">
      <div v-for="(c, k) in cuesBefore(lv.index)" :key="`${lv.index}-${c.id}`" class="row cue-row">
        <div class="meta" />
        <div class="nodes">
          <SceneCard
            v-if="c.scene"
            :cue="c"
            :scene="state.path[lv.index - 1]?.scene"
            :node-key="cueKey(lv.index, k)"
            @toggle="toggleScene(lv.index - 1)"
            @update="updateScene(lv.index - 1, $event)"
            @add="addRelation(lv.index - 1)"
            @update-relation="(j, patch) => updateRelation(lv.index - 1, j, patch)"
            @remove-relation="removeRelation(lv.index - 1, $event)"
          />
          <div v-else class="cue" :class="c.tone" :data-node="cueKey(lv.index, k)">
            <strong>{{ c.label }}</strong><span v-if="c.detail"> · {{ c.detail }}</span>
          </div>
        </div>
        <div class="side" />
      </div>
      <div class="group" :class="{ unfolded: isOpen(lv.selected) }">
        <section class="row" :class="{ open: !lv.selected }">
          <div class="meta">
            <div class="step">{{ stepLabel(lv.level.step) }}</div>
            <div class="lname">{{ chosenLabel(lv) ?? lv.level.name }}</div>
          </div>

          <div class="nodes">
            <FlowNode
              v-for="c in lv.level.choices"
              :key="c.option.id"
              :option="c.option"
              :node-key="nodeKey(lv.index, c.option.id)"
              :selected="lv.selected?.id === c.option.id"
              :sibling="!!lv.selected && lv.selected.id !== c.option.id"
              :enabled="c.enabled"
              :reason="c.reason"
              :pulse="!lv.selected && c.enabled"
              @select="select(lv, c.option.id)"
              @blocked="emit('message', $event)"
              @hover="hovered = $event"
            />
          </div>

          <div class="side">
            <StepDetail
              v-if="lv.selected"
              :entry="lv.selected"
              :removable="lv.level.choices.length > 1"
              :structure="hasStructure(lv.selected.id) ? { open: !!lv.selected.open, done: structureDone(lv.selected) } : undefined"
              @update="update(lv.index, $event)"
              @remove="truncate(lv.index)"
              @toggle="toggleOpen(lv.index)"
            />
            <p v-else class="hint">{{ currentHint(lv) }}</p>
          </div>
        </section>

        <div v-if="isOpen(lv.selected)" class="nest">
          <section
            v-for="sv in sections(lv.index)"
            :key="`${lv.index}.${sv.index}-${sv.level.name}`"
            class="row sub"
            :class="{ open: !sv.selected }"
          >
            <div class="meta">
              <div class="lname">{{ sv.level.name }}</div>
            </div>
            <div class="nodes">
              <FlowNode
                v-for="id in sv.level.choices"
                :key="id"
                small
                :option="SECTIONS[id]"
                :node-key="subKey(lv.index, sv.index, id)"
                :selected="sv.selected?.id === id"
                :sibling="!!sv.selected && sv.selected.id !== id"
                :enabled="true"
                :pulse="!sv.selected"
                :note="sv.level.notes?.[id]"
                @select="chooseSection(lv.index, sv.index, id)"
                @hover="hovered = $event"
              />
            </div>
            <div class="side">
              <SectionDetail
                v-if="sv.selected"
                :entry="sv.selected"
                  :removable="sv.level.choices.length > 1"
                @update="updateSection(lv.index, sv.index, $event)"
                @remove="truncateSection(lv.index, sv.index)"
              />
              <p v-else class="hint">{{ sv.level.hint }}</p>
            </div>
          </section>
          <div class="row sub edge">
            <div class="meta" />
            <div class="nodes">
              <div class="exit" :class="{ dim: !structureDone(lv.selected) }" :data-node="exitKey(lv.index)" />
            </div>
            <div class="side" />
          </div>
        </div>
      </div>
    </template>

    <section v-for="(f, k) in upcoming" :key="`future-${f.step}-${k}`" class="row future">
      <div class="meta">
        <div class="step">{{ stepLabel(f.step) }}</div>
        <div class="lname">{{ f.name }}</div>
      </div>
      <div class="nodes">
        <FlowNode
          v-for="c in f.choices"
          :key="c.option.id"
          :option="c.option"
          :node-key="`f${k}:${c.option.id}`"
          :selected="false"
          :sibling="false"
          :enabled="false"
          upcoming
        />
      </div>
      <div class="side" />
    </section>

    <template v-if="finished">
      <div v-for="(c, k) in cuesBefore(endIndex)" :key="`end-${c.id}`" class="row cue-row">
        <div class="meta" />
        <div class="nodes">
          <SceneCard
            v-if="c.scene"
            :cue="c"
            :scene="state.path[endIndex - 1]?.scene"
            :node-key="cueKey(endIndex, k)"
            @toggle="toggleScene(endIndex - 1)"
            @update="updateScene(endIndex - 1, $event)"
            @add="addRelation(endIndex - 1)"
            @update-relation="(j, patch) => updateRelation(endIndex - 1, j, patch)"
            @remove-relation="removeRelation(endIndex - 1, $event)"
          />
          <div v-else class="cue" :class="c.tone" :data-node="cueKey(endIndex, k)">
            <strong>{{ c.label }}</strong><span v-if="c.detail"> · {{ c.detail }}</span>
          </div>
        </div>
        <div class="side" />
      </div>
    </template>

    <div class="row edge">
      <div class="meta" />
      <div class="nodes">
        <div class="pool" :class="{ dim: !finished }" data-node="end">
          <v-icon :icon="mdiWaves" size="18" />
          <span>Fin du voyage, pour l’instant</span>
        </div>
      </div>
      <div class="side" />
    </div>
  </div>
</template>

<style scoped>
.tree {
  position: relative;
  isolation: isolate;
}
.flow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.channel {
  fill: none;
  stroke: rgba(var(--v-theme-on-background), 0.16);
  stroke-width: 1.5;
  stroke-dasharray: 3 6;
  stroke-linecap: round;
  transition: stroke 0.2s ease, stroke-width 0.2s ease;
}
.channel.hover {
  stroke: rgba(var(--v-theme-water), 0.7);
  stroke-width: 2.5;
}
.glow {
  fill: none;
  stroke: url(#water);
  stroke-width: 14;
  opacity: 0;
  animation: glow-in 0.8s ease-out forwards;
}
.stream {
  fill: none;
  stroke: url(#water);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: fill 0.65s cubic-bezier(0.5, 0, 0.3, 1) forwards;
}
.ripple {
  fill: none;
  stroke: rgba(255, 255, 255, 0.75);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 1.5 16;
  opacity: 0;
  animation:
    fade-in 0.4s ease forwards,
    flow 1.1s linear infinite;
}
.channel.small {
  stroke-width: 1;
  stroke-dasharray: 2 5;
}
.channel.small {
  stroke: rgba(var(--v-theme-tune), 0.3);
}
.channel.small.hover {
  stroke: rgba(var(--v-theme-tune), 0.8);
  stroke-width: 2;
}
.glow.small {
  stroke: rgb(var(--v-theme-tune));
  stroke-width: 7;
}
.stream.small {
  stroke: rgb(var(--v-theme-tune));
  stroke-width: 3;
}
.ripple.small {
  stroke-width: 1.25;
}
@keyframes fill {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes glow-in {
  to {
    opacity: 0.35;
  }
}
@keyframes fade-in {
  to {
    opacity: 0.8;
  }
}
@keyframes flow {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -17.5;
  }
}
@media (prefers-reduced-motion: reduce) {
  .stream,
  .glow,
  .ripple {
    animation: none;
    stroke-dashoffset: 0;
    opacity: 0.6;
  }
  .ripple {
    display: none;
  }
}

/* Layout */
.row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr) 300px;
  column-gap: 24px;
  align-items: center;
  padding: 14px 0;
}
.row.edge {
  padding: 4px 0;
}
.row.open::before {
  content: '';
  position: absolute;
  inset: 2px -12px;
  z-index: -1;
  border-radius: 18px;
  background: rgba(var(--v-theme-water), 0.07);
  border: 1px solid rgba(var(--v-theme-water), 0.18);
}
/* Text outside the graph stays quiet; it comes back while you work on a row. */
.meta,
.side {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}
.row:hover > .meta,
.row:hover > .side,
.row:focus-within > .meta,
.row:focus-within > .side {
  opacity: 1;
}
.row.future > .meta {
  opacity: 0.2;
}
.row.open :deep(.label) {
  background: transparent;
}
.meta {
  text-align: right;
}
.step {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-background), 0.45);
}
.lname {
  font-size: 15px;
  font-weight: 600;
  margin-top: 2px;
}
.row.open .lname {
  color: rgb(var(--v-theme-water));
}

.nodes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 4px;
}

.hint {
  margin: 0;
  font-size: 13px;
  color: rgba(var(--v-theme-on-background), 0.55);
}

/* Unfolded song: the song row and its sections form one tinted block. */
.group.unfolded {
  --node-bg: color-mix(in srgb, rgb(var(--v-theme-tune)) 7%, rgb(var(--v-theme-background)));
  position: relative;
  margin: 8px 0 12px;
}
.group.unfolded::before {
  content: '';
  position: absolute;
  inset: 0 -12px;
  z-index: -1;
  border-radius: 20px;
  background: rgba(var(--v-theme-tune), 0.07);
  border: 1px solid rgba(var(--v-theme-tune), 0.25);
}
.group.unfolded > .row:first-child .lname {
  color: rgb(var(--v-theme-tune));
}
.nest {
  position: relative;
  margin: 0 0 4px;
}
.nest::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-top: 1px dashed rgba(var(--v-theme-tune), 0.3);
}
.row.sub {
  padding: 7px 0;
}
.row.sub.edge {
  padding: 2px 0 8px;
}
.row.sub.open::before {
  inset: 1px -4px;
  border-radius: 14px;
  background: rgba(var(--v-theme-tune), 0.1);
  border-color: rgba(var(--v-theme-tune), 0.35);
}
.sub .lname,
.row.sub.open .lname {
  color: rgb(var(--v-theme-tune));
}
.sub .lname {
  font-size: 12.5px;
  font-weight: 600;
  margin: 0;
}
.sub .nodes {
  gap: 8px 2px;
}
.sub .hint {
  font-size: 12px;
}
.exit {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(180deg, #7c3aed, #3b82f6);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.18);
  transition: opacity 0.4s ease, filter 0.4s ease;
}
.exit.dim {
  opacity: 0.3;
  filter: grayscale(1);
  box-shadow: none;
}

/* Staging cues: stage directions sitting on the stream, like the boxes of the script. */
.row.cue-row {
  padding: 5px 0;
}
.cue {
  max-width: min(100%, 420px);
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.4;
  text-align: center;
  color: rgba(var(--v-theme-on-background), 0.75);
  background: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-theme-on-background), 0.14);
}
.cue strong {
  font-weight: 700;
  color: rgb(var(--v-theme-on-background));
}
.cue.black,
.cue.final {
  color: rgba(255, 255, 255, 0.75);
  background: #000;
  border-color: rgba(255, 255, 255, 0.18);
}
.cue.final {
  background: #2b2a26;
  padding: 8px 24px;
}
.cue.black strong,
.cue.final strong {
  color: #fff;
}

.spring {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(180deg, #22d3ee, #3b82f6);
  box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.15);
}
.pool {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  background: linear-gradient(90deg, #3b82f6, #4f46e5);
  box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.7);
  transition: opacity 0.4s ease, filter 0.4s ease;
}
.pool.dim {
  opacity: 0.3;
  filter: grayscale(1);
  box-shadow: none;
}

@media (max-width: 1000px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 8px;
    padding: 12px 0;
  }
  .row.open::before {
    inset: 2px -8px;
  }
  .row.open .meta {
    background: none;
  }
  .meta {
    text-align: left;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .lname {
    font-size: 14px;
    margin: 0;
  }
  .row.edge .meta,
  .row.edge .side {
    display: none;
  }
  .side {
    width: 100%;
    max-width: 520px;
    justify-self: center;
  }
  .side:not(:empty) {
    padding: 6px 10px;
    border-radius: 10px;
    background: rgba(var(--v-theme-background), 0.88);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .row.open .side {
    background: none;
    backdrop-filter: none;
  }
  .row.future .side {
    display: none;
  }
  .hint {
    text-align: center;
  }
  .meta {
    padding: 2px 8px;
    justify-self: start;
    border-radius: 8px;
    background: rgb(var(--v-theme-background));
  }
}
</style>
