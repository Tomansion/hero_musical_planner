<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { mdiChevronDown, mdiClose } from '@mdi/js'
import { OPTIONS } from '../data/steps'
import type { PathEntry } from '../composables/usePlanner'

const MAX = 240

const props = defineProps<{
  entry: PathEntry
  removable: boolean
  /** Set when the step has a song structure. */
  structure?: { open: boolean; done: boolean }
}>()
const emit = defineEmits<{
  update: [patch: Partial<Pick<PathEntry, 'title' | 'description'>>]
  remove: []
  toggle: []
}>()

const opt = computed(() => OPTIONS[props.entry.id])
const isTune = computed(() => opt.value.kind === 'tune')

const area = ref<HTMLTextAreaElement | null>(null)
const focused = ref(false)

function autosize() {
  const el = area.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
onMounted(autosize)
watch(() => props.entry.description, () => nextTick(autosize))
</script>

<template>
  <div class="detail" :class="opt.kind">
    <div class="line">
      <input
        v-if="opt.kind !== 'skip'"
        class="title"
        :value="entry.title"
        :placeholder="isTune ? 'Titre de la chanson' : 'Qui / quoi'"
        maxlength="80"
        @input="emit('update', { title: ($event.target as HTMLInputElement).value })"
      />
      <span v-else class="skipped">Passé</span>
      <v-tooltip v-if="removable" text="Supprimer cette étape et les suivantes">
        <template #activator="{ props: act }">
          <button v-bind="act" type="button" class="remove" aria-label="Supprimer l’étape" @click="emit('remove')">
            <v-icon :icon="mdiClose" size="14" />
          </button>
        </template>
      </v-tooltip>
    </div>

    <template v-if="opt.kind !== 'skip'">
      <textarea
        ref="area"
        class="desc"
        rows="1"
        :value="entry.description"
        :maxlength="MAX"
        placeholder="Ce qui se passe, en une ou deux phrases"
        @input="emit('update', { description: ($event.target as HTMLTextAreaElement).value }); autosize()"
        @focus="focused = true"
        @blur="focused = false"
      />
      <div v-if="focused" class="count">{{ entry.description.length }} / {{ MAX }}</div>
    </template>

    <button
      v-if="structure"
      type="button"
      class="unfold"
      :class="{ open: structure.open }"
      :aria-expanded="structure.open"
      @click="emit('toggle')"
    >
      <v-icon :icon="mdiChevronDown" size="15" class="chev" />
      <span>{{ structure.open ? 'Replier la structure' : 'Structure' }}</span>
      <span v-if="!structure.open" class="state" :class="{ done: structure.done }">
        {{ structure.done ? 'complète' : 'à choisir' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.detail {
  position: relative;
}
.line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title,
.desc {
  display: block;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  padding: 0;
}
.title {
  flex: 1;
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-background), 0.75);
}
.desc {
  resize: none;
  overflow: hidden;
  margin-top: 1px;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(var(--v-theme-on-background), 0.5);
  min-height: 19px;
}
.title:focus,
.desc:focus {
  color: rgb(var(--v-theme-on-background));
}
.title::placeholder,
.desc::placeholder {
  color: rgba(var(--v-theme-on-background), 0.28);
  font-weight: 400;
}
.skipped {
  flex: 1;
  font-size: 13px;
  color: rgba(var(--v-theme-on-background), 0.35);
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
.detail:hover .remove,
.detail:focus-within .remove,
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

.unfold {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px 0 0 -4px;
  padding: 2px 8px 2px 4px;
  border: 0;
  border-radius: 8px;
  background: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-water));
  cursor: pointer;
  transition: background 0.15s ease;
}
.unfold:hover {
  background: rgba(var(--v-theme-water), 0.1);
}
.chev {
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}
.unfold.open .chev {
  transform: none;
}
.state {
  font-weight: 500;
  color: rgba(var(--v-theme-on-background), 0.45);
}
.state::before {
  content: '·';
  margin-right: 4px;
}
.state.done {
  color: rgba(var(--v-theme-on-background), 0.45);
}
.count {
  font-size: 11px;
  color: rgba(var(--v-theme-on-background), 0.35);
  font-variant-numeric: tabular-nums;
}
</style>
