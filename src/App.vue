<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'
import {
  mdiCheck,
  mdiChevronDown,
  mdiContentCopy,
  mdiMovieOpenOutline,
  mdiRestore,
  mdiThemeLightDark,
} from '@mdi/js'
import FlowTree from './components/FlowTree.vue'
import { usePlanner } from './composables/usePlanner'
import { MOVIES, type MoviePreset } from './data/movies'

const theme = useTheme()
const { state, loadMovie, restore, reset, asText } = usePlanner()

const current = computed(() => MOVIES.find((m) => m.id === state.source) ?? null)

const snack = ref({ show: false, text: '', undo: null as null | (() => void) })
function notify(text: string, undo: null | (() => void) = null) {
  snack.value = { show: false, text, undo }
  requestAnimationFrame(() => (snack.value.show = true))
}

function pickMovie(m: MoviePreset) {
  const previous = loadMovie(m)
  window.scrollTo({ top: 0, behavior: 'smooth' })
  notify(`Path set to ${m.title}`, previous.path.length ? () => restore(previous) : null)
}

function resetAll() {
  if (!state.path.length) return
  const previous = reset()
  notify('Path cleared', () => restore(previous))
}

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(asText())
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    notify('Could not access the clipboard')
  }
}

function toggleTheme() {
  theme.toggle(['light', 'dark'])
}
</script>

<template>
  <v-app>
    <header class="topbar">
      <div class="wrap bar">
        <div class="brand">
          <svg class="logo" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#22d3ee" />
                <stop offset="1" stop-color="#4f46e5" />
              </linearGradient>
            </defs>
            <path d="M10 4 C10 14, 22 12, 22 20 S14 26, 16 29" stroke="url(#lg)" stroke-width="3.5" fill="none" stroke-linecap="round" />
          </svg>
          <div>
            <div class="name">Hero's Journey</div>
            <div class="sub">Improvised musical planner</div>
          </div>
        </div>
        <div class="actions">
          <v-menu location="bottom end" offset="6">
            <template #activator="{ props: act }">
              <button v-bind="act" type="button" class="story-btn" :class="{ active: !!current }" aria-label="Follow a story">
                <v-icon :icon="mdiMovieOpenOutline" size="18" />
                <span class="story-label">{{ current ? current.title : 'Follow a story' }}</span>
                <span v-if="current && state.edited" class="edited">edited</span>
                <v-icon :icon="mdiChevronDown" size="16" class="chev" />
              </button>
            </template>
            <v-list density="compact" min-width="250" rounded="lg" class="story-list" elevation="6">
              <v-list-subheader>Follow a story</v-list-subheader>
              <v-list-item
                v-for="m in MOVIES"
                :key="m.id"
                :title="m.title"
                :active="state.source === m.id"
                color="water"
                rounded="md"
                @click="pickMovie(m)"
              >
                <template #append>
                  <span class="year">{{ m.year }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-tooltip :text="copied ? 'Copied' : 'Copy path as text'">
            <template #activator="{ props: act }">
              <v-btn v-bind="act" :icon="copied ? mdiCheck : mdiContentCopy" size="small" :disabled="!state.path.length" aria-label="Copy path" @click="copy" />
            </template>
          </v-tooltip>
          <v-tooltip text="Clear the path">
            <template #activator="{ props: act }">
              <v-btn v-bind="act" :icon="mdiRestore" size="small" :disabled="!state.path.length" aria-label="Clear path" @click="resetAll" />
            </template>
          </v-tooltip>
          <v-tooltip text="Light / dark">
            <template #activator="{ props: act }">
              <v-btn v-bind="act" :icon="mdiThemeLightDark" size="small" aria-label="Toggle theme" @click="toggleTheme" />
            </template>
          </v-tooltip>
        </div>
      </div>
    </header>

    <v-main>
      <div class="wrap page">
        <FlowTree @message="notify($event)" />
      </div>
    </v-main>

    <v-snackbar v-model="snack.show" :timeout="4000" location="bottom" rounded="lg">
      {{ snack.text }}
      <template v-if="snack.undo" #actions>
        <v-btn color="water" @click="snack.undo?.(); snack.show = false">Undo</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top, 0px);
  background: rgba(var(--v-theme-background), 0.8);
  backdrop-filter: saturate(1.4) blur(12px);
  -webkit-backdrop-filter: saturate(1.4) blur(12px);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 28px;
  height: 28px;
}
.name {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.01em;
  line-height: 1.1;
}
.sub {
  font-size: 12px;
  color: rgba(var(--v-theme-on-background), 0.5);
}
.actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.page {
  padding-top: 12px;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
}
.story-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  margin-right: 6px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: rgba(var(--v-theme-on-background), 0.7);
  font: inherit;
  font-size: 13.5px;
  font-weight: 550;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.story-btn:hover,
.story-btn[aria-expanded='true'] {
  background: rgba(var(--v-theme-on-background), 0.06);
  color: rgb(var(--v-theme-on-background));
}
.story-btn.active {
  color: rgb(var(--v-theme-on-background));
}
.story-btn.active .v-icon:first-child {
  color: rgb(var(--v-theme-water));
}
.chev {
  opacity: 0.5;
}
.edited {
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-water));
}
.year {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 600px) {
  .story-label,
  .edited,
  .sub {
    display: none;
  }
  .story-btn {
    margin-right: 0;
    padding: 0 8px;
  }
}
</style>
