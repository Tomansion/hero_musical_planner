<script setup lang="ts">
import { computed } from 'vue'
import { mdiDramaMasks, mdiMusicNote } from '@mdi/js'
import type { StepOption } from '../data/steps'

const props = defineProps<{
  option: StepOption
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
}>()

const emit = defineEmits<{
  select: []
  blocked: [reason: string]
  hover: [key: string | null]
}>()

const tip = computed(() => (props.enabled || props.upcoming ? props.option.hint : props.reason ?? ''))

function onClick() {
  if (props.upcoming) return
  if (props.enabled) emit('select')
  else emit('blocked', props.reason ?? 'Not available here')
}
</script>

<template>
  <v-tooltip :text="tip" max-width="240">
    <template #activator="{ props: act }">
      <button
        v-bind="act"
        type="button"
        class="node"
        :class="[option.kind, { selected, sibling, pulse, upcoming, disabled: !enabled && !upcoming }]"
        :tabindex="upcoming ? -1 : 0"
        :aria-pressed="selected"
        :aria-disabled="!enabled"
        :aria-label="`${option.label}${enabled ? '' : ' (unavailable)'}`"
        @click="onClick"
        @mouseenter="emit('hover', nodeKey)"
        @mouseleave="emit('hover', null)"
        @focus="emit('hover', nodeKey)"
        @blur="emit('hover', null)"
      >
        <span class="orb" :data-node="nodeKey">
          <v-icon :icon="option.icon" :size="option.kind === 'skip' ? 18 : 22" />
          <span v-if="option.kind !== 'skip'" class="badge">
            <v-icon :icon="option.kind === 'tune' ? mdiMusicNote : mdiDramaMasks" size="10" />
          </span>
        </span>
        <span class="label">{{ option.label }}</span>
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
.scene .orb {
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
  background: rgb(var(--v-theme-background));
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

@media (max-width: 600px) {
  .node {
    width: 64px;
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
