<script setup lang="ts">
import { mdiClose } from '@mdi/js'
import { CODA_TYPES, EXTRAS, TAGLINE_MAX, type ExtraId, type SectionEntry } from '../data/sections'

const props = defineProps<{ entry: SectionEntry; removable: boolean }>()
const emit = defineEmits<{
  update: [patch: Partial<Pick<SectionEntry, 'count' | 'extras' | 'coda'>>]
  remove: []
}>()

function toggleExtra(id: ExtraId) {
  const cur = props.entry.extras ?? []
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
  // Keep the catalog order.
  emit('update', { extras: EXTRAS.map((e) => e.id).filter((x) => next.includes(x)) })
}
</script>

<template>
  <div class="sdetail">
    <div v-if="entry.id === 'tagline'" class="chips" role="radiogroup" aria-label="Tagline">
      <button
        v-for="n in TAGLINE_MAX"
        :key="n"
        type="button"
        class="chip num"
        role="radio"
        :aria-checked="entry.count === n"
        :class="{ on: entry.count === n }"
        @click="emit('update', { count: n })"
      >
        {{ n }}
      </button>
    </div>
    <div v-else-if="entry.id === 'coda'" class="chips" role="radiogroup" aria-label="Type de coda">
      <button
        v-for="c in CODA_TYPES"
        :key="c.id"
        type="button"
        class="chip"
        role="radio"
        :aria-checked="entry.coda === c.id"
        :class="{ on: entry.coda === c.id }"
        @click="emit('update', { coda: entry.coda === c.id ? undefined : c.id })"
      >
        {{ c.label }}
      </button>
      <span v-if="!entry.coda" class="todo">à choisir</span>
    </div>
    <div v-else-if="entry.id === 'refrain'" class="chips">
      <button
        v-for="x in EXTRAS"
        :key="x.id"
        type="button"
        class="chip"
        :aria-pressed="!!entry.extras?.includes(x.id)"
        :class="{ on: entry.extras?.includes(x.id) }"
        @click="toggleExtra(x.id)"
      >
        {{ x.label }}
      </button>
    </div>
    <div v-else class="spacer" />
    <v-tooltip v-if="removable" text="Retirer cette section et les suivantes">
      <template #activator="{ props: act }">
        <button v-bind="act" type="button" class="remove" aria-label="Retirer la section" @click="emit('remove')">
          <v-icon :icon="mdiClose" size="13" />
        </button>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.sdetail {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chips {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.todo {
  align-self: center;
  margin-left: 2px;
  font-size: 11.5px;
  color: rgba(var(--v-theme-on-background), 0.4);
}
.spacer {
  flex: 1;
}
.chip {
  height: 24px;
  padding: 0 9px;
  border: 1px solid rgba(var(--v-theme-on-background), 0.14);
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 11.5px;
  color: rgba(var(--v-theme-on-background), 0.6);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.chip.num {
  width: 24px;
  padding: 0;
  font-variant-numeric: tabular-nums;
}
.chip:hover {
  border-color: rgba(var(--v-theme-tune), 0.6);
  color: rgb(var(--v-theme-on-background));
}
.chip.on {
  background: rgb(var(--v-theme-tune));
  border-color: rgb(var(--v-theme-tune));
  color: #fff;
}
.remove {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  border: 0;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-background), 0.3);
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.sdetail:hover .remove,
.sdetail:focus-within .remove,
.remove:focus-visible {
  opacity: 1;
}
.remove:hover {
  color: rgb(var(--v-theme-on-background));
  background: rgba(var(--v-theme-on-background), 0.06);
}
@media (hover: none) {
  .remove {
    opacity: 1;
  }
}
</style>
