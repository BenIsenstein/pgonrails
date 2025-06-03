import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      autoInstall: true,
    //   collections: {
    //     logos: () => import('@iconify-json/logos/icons.json').then(i => i.default as any),
    //   },
    }),
  ]
})
