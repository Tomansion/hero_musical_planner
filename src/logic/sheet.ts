import type { OptionId, StepKind } from '../data/steps'
import { RELATION_AXES, UNKNOWN_LABEL, type SceneInfo } from '../data/scene'

/*
 * The story sheet: a printable page laid out like the paper script (a column of
 * boxes, songs as coloured panels with their sections in a row). Built from the
 * planner state, opened in a new tab; the browser prints it to PDF.
 */

export type SectionTone = 'verse' | 'refrain' | 'dance' | 'coda' | 'end'

export interface SheetSection {
  label: string
  detail?: string
  tone: SectionTone
}

export type SheetItem =
  | { type: 'cue'; label: string; detail?: string; tone?: 'black' | 'final'; scene?: SceneInfo }
  | {
      type: 'step'
      id: OptionId
      kind: StepKind
      heading: string
      title: string
      description: string
      voice?: string
      challenge?: string
      sections: SheetSection[]
    }

/** Panel colour of each song, close to the paper script. */
const SONG_COLORS: Partial<Record<OptionId, string>> = {
  'prologue': '#8a6d3b',
  'opening-happy': '#c27c21',
  'opening-dark': '#5b4a7a',
  'opening-bittersweet': '#a0613a',
  'mentor': '#4a6a94',
  'duo': '#6d5bd0',
  'conditional-love': '#b5465f',
  'i-wish': '#b0546c',
  'other': '#5f6b7a',
  'new-world': '#3b8263',
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function relations(scene: SceneInfo): string {
  const rows = scene.who.filter((r) => r.name.trim() || r.side || r.touch || r.depth)
  if (!rows.length) return ''
  const items = rows
    .map((r) => {
      const tags = RELATION_AXES.map((a) => {
        const o = a.options.find((x) => x.id === r[a.key])
        return o
          ? `<span class="tag" style="background:${o.color}">${esc(o.label)}</span>`
          : `<span class="tag unknown">${esc(a.name)} ${UNKNOWN_LABEL}</span>`
      }).join('')
      return `<li><b>${esc(r.name.trim() || 'Quelqu’un')}</b>${tags}</li>`
    })
    .join('')
  return `<div class="kv"><span class="k">Qui</span><ul class="who">${items}</ul></div>`
}

function sceneDetails(scene: SceneInfo | undefined): string {
  if (!scene) return ''
  const parts = [
    relations(scene),
    scene.what.trim() ? `<div class="kv"><span class="k">Quoi</span><span>${esc(scene.what.trim())}</span></div>` : '',
    scene.where.trim() ? `<div class="kv"><span class="k">Où</span><span>${esc(scene.where.trim())}</span></div>` : '',
  ].join('')
  return parts ? `<div class="scene">${parts}</div>` : ''
}

function cue(item: Extract<SheetItem, { type: 'cue' }>): string {
  const detail = item.detail ? ` · ${esc(item.detail)}` : ''
  return `<div class="box cue ${item.tone ?? ''}"><b>${esc(item.label)}</b>${detail}${sceneDetails(item.scene)}</div>`
}

function texts(title: string, description: string): string {
  return [
    title ? `<div class="title">${esc(title)}</div>` : '',
    description ? `<div class="desc">${esc(description)}</div>` : '',
  ].join('')
}

function step(item: Extract<SheetItem, { type: 'step' }>): string {
  const color = SONG_COLORS[item.id]
  if (item.kind !== 'tune' || !color) {
    const challenge = item.challenge ? `<div class="kv"><span class="k">Épreuve</span><span>${esc(item.challenge)}</span></div>` : ''
    return `<div class="box step"><div class="label">${esc(item.heading)}</div>${texts(item.title, item.description)}${challenge}</div>`
  }
  const voice = item.voice ? ` · <span class="voice">${esc(item.voice)}</span>` : ''
  const sections = item.sections.length
    ? `<div class="sections">${item.sections
        .map((s) => `<div class="sec ${s.tone}"><b>${esc(s.label)}</b>${s.detail ? `<span>${esc(s.detail)}</span>` : ''}</div>`)
        .join('<i class="link"></i>')}</div>`
    : ''
  return `<section class="song" style="--c:${color}">
    <div class="head"><span class="name">${esc(item.heading)}</span>${voice}</div>
    ${texts(item.title, item.description)}
    ${sections}
  </section>`
}

export function renderSheet(title: string, items: SheetItem[]): string {
  const body = items.map((it) => (it.type === 'cue' ? cue(it) : step(it))).join('<div class="stem"></div>')
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 28px 16px 48px;
    font: 13px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: #2b2a26;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
  .top { width: 100%; display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
  h1 { margin: 0; font-size: 20px; }
  .kicker { font-size: 12px; color: #8a8578; }
  button.print {
    border: 1px solid #d8d4c8; background: #faf9f6; border-radius: 8px;
    padding: 6px 14px; font: inherit; cursor: pointer;
  }
  .stem { width: 1px; height: 14px; background: #8a8578; flex: none; }
  .box {
    width: min(100%, 480px);
    padding: 8px 14px;
    border: 1px solid #d8d4c8;
    border-radius: 6px;
    text-align: center;
    background: #fff;
    break-inside: avoid;
  }
  .cue.black { background: #000; color: #fff; border-color: #000; }
  .cue.final { background: #2b2a26; color: #fff; border-color: #2b2a26; font-size: 14px; }
  .step { width: min(100%, 560px); }
  .step .label { font-weight: 700; }
  .title { font-weight: 700; margin-top: 2px; }
  .desc { color: #5b5850; }
  .scene, .step .kv { margin-top: 6px; text-align: left; display: grid; gap: 3px; }
  .kv { display: grid; grid-template-columns: 68px 1fr; gap: 8px; align-items: baseline; }
  .k { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #c2410c; }
  .who { margin: 0; padding: 0; list-style: none; display: grid; gap: 3px; }
  .who li { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
  .who b { margin-right: 4px; }
  .tag { padding: 0 7px; border-radius: 999px; color: #fff; font-size: 11px; line-height: 18px; }
  .tag.unknown { color: #9a958a; background: #f1efe9; }
  .song {
    width: 100%;
    padding: 10px 12px 12px;
    border: 1px solid var(--c);
    border-radius: 8px;
    background: color-mix(in srgb, var(--c) 7%, #fff);
    break-inside: avoid;
  }
  .song .head { font-size: 12px; color: #5b5850; }
  .song .name { font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--c); }
  .song .voice { font-weight: 600; color: #2b2a26; }
  .song .title { font-size: 14px; }
  .sections { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 0; margin-top: 10px; }
  .link { width: 10px; height: 1px; background: #8a8578; }
  .sec {
    min-width: 84px; max-width: 140px; min-height: 52px;
    padding: 6px 8px; border-radius: 5px;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; font-size: 12px;
    border: 1px solid var(--c); background: #fff;
  }
  .sec span { font-size: 10.5px; opacity: .8; }
  .sec.refrain { background: var(--c); color: #fff; }
  .sec.dance { border-style: dashed; background: color-mix(in srgb, var(--c) 25%, #fff); }
  .sec.coda { background: color-mix(in srgb, var(--c) 14%, #fff); }
  .sec.end { border-color: #d8d4c8; background: #ebe7e0; }
  @media print {
    body { padding: 0; }
    .print { display: none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="top">
    <div><div class="kicker">Le voyage du héros</div><h1>${esc(title)}</h1></div>
    <button class="print" onclick="window.print()">Imprimer / PDF</button>
  </div>
  ${body}
</div>
</body>
</html>`
}

/** Opens the sheet in a new tab. */
export function openSheet(title: string, items: SheetItem[]) {
  const url = URL.createObjectURL(new Blob([renderSheet(title, items)], { type: 'text/html' }))
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
