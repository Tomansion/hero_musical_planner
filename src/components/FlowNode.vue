<script setup lang="ts">
import { computed } from 'vue'
import { mdiDramaMasks, mdiHumanFemaleDance, mdiMusicNote } from '@mdi/js'
import type { NodeOption } from '../data/steps'

const props = defineProps<{
  option: NodeOption
  nodeKey: string
  selected: boolean
  /** Another option of the same level is selected. */
  sibling: boolean
  enabled: boolean
  reason?: string
  /** Part of the next choice to make. */
  pulse?: boolean
  /** A future step, shown for context only. */
  upcoming?: boolean
  /** Section inside a song structure. */
  small?: boolean
  /** What the option is about at this point (e.g. "sur le héros"). */
  note?: string
}>()

const emit = defineEmits<{
  select: []
  blocked: [reason: string]
  hover: [key: string | null]
}>()

const BADGES = { tune: mdiMusicNote, scene: mdiDramaMasks, dance: mdiHumanFemaleDance }

const tip = computed(() => (props.enabled || props.upcoming ? props.option.hint : props.reason ?? ''))

function onClick() {
  if (props.upcoming) return
  if (props.enabled) emit('select')
  else emit('blocked', props.reason ?? 'Indisponible ici')
}
</script>

<template>
  <v-tooltip :text="tip" max-width="240">
    <template #activator="{ props: act }">
      <button
        v-bind="act"
        type="button"
        class="node"
        :class="[option.kind, { selected, sibling, pulse, upcoming, small, 'has-note': !!note, disabled: !enabled && !upcoming }]"
        :tabindex="upcoming ? -1 : 0"
        :aria-pressed="selected"
        :aria-disabled="!enabled"
        :aria-label="`${option.label}${enabled ? '' : ' (indisponible)'}`"
        @click="onClick"
        @mouseenter="emit('hover', nodeKey)"
        @mouseleave="emit('hover', null)"
        @focus="emit('hover', nodeKey)"
        @blur="emit('hover', null)"
      >
        <span class="orb" :data-node="nodeKey">
          <v-icon :icon="option.icon" :size="small ? (option.kind === 'skip' ? 14 : 16) : option.kind === 'skip' ? 18 : 22" />
          <span v-if="option.kind !== 'skip' && !small" class="badge">
            <v-icon :icon="BADGES[option.kind]" size="10" />
          </span>
        </span>
        <span class="label">{{ option.label }}</span>
        <span v-if="note" class="note">{{ note }}</span>
      </button>
    </template>
  </v-tooltip>
</template>

<style scoped>
.node {
  --accent: var(--v-theme-tune);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 70px;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  color: rgb(var(--v-theme-on-background));
  font: inherit;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.node.scene {
  --accent: var(--v-theme-scene);
}
.node.skip {
  --accent: var(--v-theme-muted);
}
.node.dance {
  --accent: var(--v-theme-dance);
}

.orb {
  position: relative;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  border: 1.5px solid rgba(var(--accent), 0.55);
  color: rgb(var(--accent));
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease, transform 0.25s ease;
}
.scene .orb,
.dance .orb {
  border-radius: 15px;
}
.skip .orb {
  width: 34px;
  height: 34px;
  margin: 8px 0;
  border-style: dashed;
}

.badge {
  position: absolute;
  right: -5px;
  bottom: -5px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--accent), 0.4);
  color: rgb(var(--accent));
}

.label {
  max-width: 100%;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--node-bg, rgb(var(--v-theme-background)));
  font-size: 12px;
  line-height: 1.25;
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.01em;
  color: rgba(var(--v-theme-on-background), 0.78);
}

.node:hover:not(.disabled) .orb,
.node:focus-visible .orb {
  transform: translateY(-2px);
  border-color: rgb(var(--accent));
  box-shadow: 0 6px 18px -6px rgba(var(--accent), 0.55);
}
.node:focus-visible {
  outline: none;
}
.node:focus-visible .label {
  outline: 2px solid rgba(var(--accent), 0.6);
}

.node.selected .orb {
  background: rgb(var(--accent));
  border-color: rgb(var(--accent));
  color: #fff;
  box-shadow:
    0 0 0 5px rgba(var(--v-theme-water), 0.18),
    0 8px 22px -8px rgba(var(--accent), 0.8);
}
.node.selected .label {
  color: rgb(var(--v-theme-on-background));
  font-weight: 650;
}

.node.sibling:not(:hover) {
  opacity: 0.55;
}

.node.pulse .orb::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 2px solid rgba(var(--accent), 0.55);
  pointer-events: none;
  animation: pulse 2s ease-out infinite;
}
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  70%,
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .node.pulse .orb::after {
    animation: none;
    opacity: 0.5;
  }
}

.node.upcoming {
  opacity: 0.3;
  cursor: default;
}
.node.upcoming .orb {
  transform: none !important;
  box-shadow: none !important;
}

.node.disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
.node.disabled .orb {
  border-style: dashed;
  border-color: rgba(var(--v-theme-on-background), 0.35);
  color: rgba(var(--v-theme-on-background), 0.6);
}
.node.disabled .badge {
  border-color: rgba(var(--v-theme-on-background), 0.25);
  color: rgba(var(--v-theme-on-background), 0.5);
}

/* Sections inside a song */
.node.small {
  width: 62px;
  gap: 4px;
}
.node.small.has-note {
  width: 86px;
}
.note {
  margin-top: -3px;
  max-width: 100%;
  padding: 0 4px;
  border-radius: 5px;
  background: var(--node-bg, rgb(var(--v-theme-background)));
  font-size: 10.5px;
  line-height: 1.2;
  font-style: italic;
  text-align: center;
  color: rgba(var(--v-theme-on-background), 0.5);
}
.small .orb {
  width: 34px;
  height: 34px;
  border-width: 1.25px;
}
.small.scene .orb,
.small.dance .orb {
  border-radius: 10px;
}
.small.skip .orb {
  width: 26px;
  height: 26px;
  margin: 4px 0;
}
.small .label {
  font-size: 11px;
  padding: 0 4px;
}
.node.small.selected .orb {
  box-shadow:
    0 0 0 3px rgba(var(--v-theme-water), 0.18),
    0 6px 16px -8px rgba(var(--accent), 0.8);
}

@media (max-width: 600px) {
  .node {
    width: 64px;
  }
  .node.small {
    width: 58px;
  }
  .orb {
    width: 44px;
    height: 44px;
  }
  .scene .orb {
    border-radius: 13px;
  }
  .label {
    font-size: 11px;
    padding: 1px 3px;
  }
}
</style>
