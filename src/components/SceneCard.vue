<script setup lang="ts">
import { computed } from 'vue'
import { mdiAccountPlusOutline, mdiChevronDown, mdiClose } from '@mdi/js'
import type { Cue } from '../data/steps'
import { RELATION_AXES, UNKNOWN_LABEL, sceneParts, type Relation, type SceneInfo } from '../data/scene'

const props = defineProps<{
  cue: Cue
  scene?: SceneInfo
  nodeKey: string
}>()
const emit = defineEmits<{
  toggle: []
  update: [patch: Partial<Pick<SceneInfo, 'where' | 'what'>>]
  add: []
  updateRelation: [k: number, patch: Partial<Relation>]
  removeRelation: [k: number]
}>()

const open = computed(() => !!props.scene?.open)
const summary = computed(() => sceneParts(props.scene))

const value = (e: Event) => (e.target as HTMLInputElement).value
</script>

<template>
  <div class="scene" :class="{ open, optional: cue.optional && !summary.length && !open }" :data-node="nodeKey">
    <button type="button" class="head" :aria-expanded="open" @click="emit('toggle')">
      <v-icon :icon="mdiChevronDown" size="15" class="chev" />
      <span>
        <strong>{{ cue.label }}</strong><span v-if="cue.detail"> · {{ cue.detail }}</span>
      </span>
    </button>

    <div v-if="!open && summary.length" class="summary">
      <div v-for="line in summary" :key="line">{{ line }}</div>
    </div>

    <div v-if="open && scene" class="body">
      <div class="field">
        <div class="flabel">Qui</div>
        <div class="who">
          <div v-for="(r, k) in scene.who" :key="k" class="rel">
            <div class="rline">
              <input
                class="input"
                :value="r.name"
                placeholder="Personnage"
                maxlength="60"
                @input="emit('updateRelation', k, { name: value($event) })"
              />
              <button type="button" class="remove" aria-label="Retirer ce personnage" @click="emit('removeRelation', k)">
                <v-icon :icon="mdiClose" size="13" />
              </button>
            </div>
            <div class="axes">
              <template v-for="a in RELATION_AXES" :key="a.key">
                <div class="aname">{{ a.name }}</div>
                <div class="seg" role="radiogroup" :aria-label="a.name">
                  <button
                    v-for="o in a.options"
                    :key="o.id"
                    type="button"
                    class="opt"
                    role="radio"
                    :aria-checked="r[a.key] === o.id"
                    :class="{ on: r[a.key] === o.id }"
                    :style="r[a.key] === o.id ? { background: o.color, borderColor: o.color } : undefined"
                    @click="emit('updateRelation', k, { [a.key]: o.id })"
                  >
                    {{ o.label }}
                  </button>
                  <button
                    type="button"
                    class="opt unknown"
                    role="radio"
                    aria-label="Inconnu"
                    :aria-checked="r[a.key] === null"
                    :class="{ on: r[a.key] === null }"
                    @click="emit('updateRelation', k, { [a.key]: null })"
                  >
                    {{ UNKNOWN_LABEL }}
                  </button>
                </div>
              </template>
            </div>
          </div>
          <button type="button" class="add" @click="emit('add')">
            <v-icon :icon="mdiAccountPlusOutline" size="14" />
            <span>Ajouter un personnage</span>
          </button>
        </div>
      </div>

      <div class="field">
        <div class="flabel">Quoi</div>
        <input
          class="input"
          :value="scene.what"
          placeholder="L’action, ce qui se passe"
          maxlength="160"
          @input="emit('update', { what: value($event) })"
        />
      </div>

      <div class="field">
        <div class="flabel">Où</div>
        <input
          class="input"
          :value="scene.where"
          placeholder="Le lieu"
          maxlength="100"
          @input="emit('update', { where: value($event) })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene {
  width: min(100%, 420px);
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.4;
  color: rgba(var(--v-theme-on-background), 0.75);
  background: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-theme-on-background), 0.14);
  transition: border-color 0.15s ease;
}
.scene:hover,
.scene.open {
  border-color: rgba(var(--v-theme-scene), 0.55);
}
.scene.optional {
  border-style: dashed;
  opacity: 0.6;
}
.scene.optional:hover {
  opacity: 1;
}
.scene.open {
  width: min(100%, 460px);
  background: color-mix(in srgb, rgb(var(--v-theme-scene)) 6%, rgb(var(--v-theme-background)));
}
.head {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 6px 14px;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: center;
  cursor: pointer;
}
.head strong {
  font-weight: 700;
  color: rgb(var(--v-theme-on-background));
}
.chev {
  flex: none;
  margin-top: 1px;
  color: rgb(var(--v-theme-scene));
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}
.scene.open .chev {
  transform: none;
}
.summary {
  padding: 0 14px 7px;
  font-size: 11.5px;
  text-align: center;
  color: rgb(var(--v-theme-scene));
}

.body {
  display: grid;
  gap: 10px;
  padding: 4px 14px 12px;
  text-align: left;
  border-top: 1px dashed rgba(var(--v-theme-scene), 0.3);
}
.field {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: start;
  gap: 8px;
  padding-top: 6px;
}
.flabel {
  padding-top: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-scene));
}
.input {
  width: 100%;
  min-width: 0;
  height: 26px;
  padding: 0 8px;
  border: 1px solid rgba(var(--v-theme-on-background), 0.12);
  border-radius: 7px;
  outline: none;
  background: rgb(var(--v-theme-surface));
  font: inherit;
  font-size: 12.5px;
  color: rgb(var(--v-theme-on-background));
}
.input:focus {
  border-color: rgba(var(--v-theme-scene), 0.7);
}
.input::placeholder {
  color: rgba(var(--v-theme-on-background), 0.3);
}

.who {
  display: grid;
  gap: 8px;
}
.rel {
  display: grid;
  gap: 5px;
}
.rline {
  display: flex;
  align-items: center;
  gap: 4px;
}
.axes {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 4px 8px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-background), 0.03);
}
.aname {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-background), 0.45);
}
/* Segmented control: the two values share the width, the unknown stays small. */
.seg {
  display: grid;
  grid-template-columns: 1fr 1fr 30px;
  gap: 3px;
}
.opt {
  height: 26px;
  padding: 0 6px;
  border: 1px solid rgba(var(--v-theme-on-background), 0.16);
  border-radius: 7px;
  background: rgb(var(--v-theme-surface));
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-background), 0.7);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.opt:hover {
  border-color: rgba(var(--v-theme-on-background), 0.4);
  color: rgb(var(--v-theme-on-background));
}
.opt.on {
  color: #fff;
}
/* Unknown: the default, kept discreet. */
.opt.unknown {
  padding: 0;
  border-color: transparent;
  background: none;
  font-weight: 500;
  color: rgba(var(--v-theme-on-background), 0.3);
}
.opt.unknown.on {
  background: rgba(var(--v-theme-on-background), 0.08);
  color: rgba(var(--v-theme-on-background), 0.55);
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
  color: rgba(var(--v-theme-on-background), 0.35);
}
.remove:hover {
  color: rgb(var(--v-theme-on-background));
  background: rgba(var(--v-theme-on-background), 0.06);
}
.add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-self: start;
  padding: 2px 8px 2px 4px;
  border: 0;
  border-radius: 8px;
  background: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-scene));
  cursor: pointer;
}
.add:hover {
  background: rgba(var(--v-theme-scene), 0.1);
}
</style>
