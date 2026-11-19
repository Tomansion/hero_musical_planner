import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

export default createVuetify({
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#f6f7fb',
          surface: '#ffffff',
          primary: '#2563eb',
          water: '#0ea5e9',
          tune: '#7c3aed',
          scene: '#e8590c',
          muted: '#64748b',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#0b1220',
          surface: '#121a2b',
          primary: '#60a5fa',
          water: '#38bdf8',
          tune: '#a78bfa',
          scene: '#fb923c',
          muted: '#94a3b8',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'text', rounded: 'lg' },
    VTextField: { variant: 'plain', density: 'compact', hideDetails: 'auto' },
    VTextarea: { variant: 'plain', density: 'compact', hideDetails: 'auto' },
    VTooltip: { location: 'top', openDelay: 250 },
  },
})
