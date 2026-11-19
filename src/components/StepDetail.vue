<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { mdiClose } from '@mdi/js'
import { OPTIONS } from '../data/steps'
import type { PathEntry } from '../composables/usePlanner'

const MAX = 240

const props = defineProps<{ entry: PathEntry; removable: boolean }>()
const emit = defineEmits<{
  update: [patch: Partial<Pick<PathEntry, 'title' | 'description'>>]
  remove: []
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
        :placeholder="isTune ? 'Name of the tune' : 'Who / what'"
        maxlength="80"
        @input="emit('update', { title: ($event.target as HTMLInputElement).value })"
      />
      <span v-else class="skipped">Skipped</span>
      <v-tooltip v-if="removable" text="Remove this step and the ones after it">
        <template #activator="{ props: act }">
          <button v-bind="act" type="button" class="remove" aria-label="Remove step" @click="emit('remove')">
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
        placeholder="What happens, in one or two sentences"
        @input="emit('update', { description: ($event.target as HTMLTextAreaElement).value }); autosize()"
        @focus="focused = true"
        @blur="focused = false"
      />
      <div v-if="focused" class="count">{{ entry.description.length }} / {{ MAX }}</div>
    </template>
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

.count {
  font-size: 11px;
  color: rgba(var(--v-theme-on-background), 0.35);
  font-variant-numeric: tabular-nums;
}
</style>
