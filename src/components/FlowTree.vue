<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { mdiWater, mdiWaves } from '@mdi/js'
import FlowNode from './FlowNode.vue'
import StepDetail from './StepDetail.vue'
import { usePlanner, type LevelView } from '../composables/usePlanner'
import { OPTIONS } from '../data/steps'

const emit = defineEmits<{ message: [text: string] }>()

const { state, levels, upcoming, finished, choose, update, truncate } = usePlanner()

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
}
const segments = ref<Segment[]>([])
/** Fill delay of each active segment, kept stable while it stays active. */
let activeDelays = new Map<string, number>()

const nodeKey = (level: number, id: string) => `${level}:${id}`

/** Key of the node the water comes from when entering level i. */
function sourceKey(i: number): string | null {
  if (i === 0) return 'src'
  const prev = state.path[i - 1]
  return prev ? nodeKey(i - 1, prev.id) : null
}

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

  const push = (fromKey: string, toKey: string, active: boolean) => {
    const a = center(fromKey)
    const b = center(toKey)
    if (!a || !b) return
    const key = `${fromKey}>${toKey}`
    let delay = 0
    if (active) {
      delay = activeDelays.get(key) ?? fresh++ * 0.14
      nowActive.set(key, delay)
    }
    out.push({ key, to: toKey, d: curve(a, b), active, delay })
  }

  levels.value.forEach((lv: LevelView) => {
    const from = sourceKey(lv.index)
    if (!from) return
    for (const c of lv.level.choices) {
      if (!c.enabled) continue
      push(from, nodeKey(lv.index, c.option.id), lv.selected?.id === c.option.id)
    }
  })
  if (finished.value && state.path.length) {
    const last = state.path.length - 1
    push(nodeKey(last, state.path[last].id), 'end', true)
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

const stepLabel = (n: number) => `Step ${n}`
const chosenLabel = (lv: LevelView) => {
  if (!lv.selected) return null
  const o = OPTIONS[lv.selected.id]
  return lv.level.kind === 'opening' ? `${o.label} opening` : o.label
}

function currentHint(lv: LevelView): string {
  const open = lv.level.choices.filter((c) => c.enabled).map((c) => c.option.id)
  switch (lv.level.kind) {
    case 'prologue':
      return 'Start with a short prologue song, or go straight to the opening number.'
    case 'opening':
      return 'What is the mood of the opening number?'
    case 'gatekeeper':
      return 'Every song is placed. Time for the threshold.'
    case 'new-world':
      return 'The hero crosses into the new world.'
    default:
      if (open.includes('gatekeeper')) return 'Optionally add a refusal, or move on to the gatekeeper.'
      if (open.length === 1 && open[0] === 'messenger') return 'Bring in the messenger.'
      if (open.includes('messenger')) return 'Pick the next song, or bring in the messenger.'
      if (open.includes('refusal')) return 'Pick the next song, or let the hero refuse the call.'
      return 'Pick the next song.'
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
          :class="{ hover: hovered === s.to }"
          :d="s.d"
        />
        <template v-else>
          <path class="glow" :d="s.d" filter="url(#glow)" :style="{ animationDelay: `${s.delay}s` }" />
          <path class="stream" :d="s.d" pathLength="1" :style="{ animationDelay: `${s.delay}s` }" />
          <path class="ripple" :d="s.d" :style="{ animationDelay: `${s.delay + 0.5}s, 0s` }" />
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

    <section
      v-for="lv in levels"
      :key="`${lv.index}-${lv.level.kind}`"
      class="row"
      :class="{ open: !lv.selected }"
    >
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
          @select="choose(lv.index, c.option.id)"
          @blocked="emit('message', $event)"
          @hover="hovered = $event"
        />
      </div>

      <div class="side">
        <StepDetail
          v-if="lv.selected"
          :entry="lv.selected"
          :removable="lv.level.choices.length > 1"
          @update="update(lv.index, $event)"
          @remove="truncate(lv.index)"
        />
        <p v-else class="hint">{{ currentHint(lv) }}</p>
      </div>
    </section>

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

    <div class="row edge">
      <div class="meta" />
      <div class="nodes">
        <div class="pool" :class="{ dim: !finished }" data-node="end">
          <v-icon :icon="mdiWaves" size="18" />
          <span>End of the journey, for now</span>
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
