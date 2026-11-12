/** The Plenio Player's page (built into plenio/player/static, served by ``python -m plenio.player``). */
import { createApp } from 'vue'

import { begin, joining, loginShown } from './account'
import App from './App.vue'
import { load } from './store'
import { renderPosters } from './visuals/posters'
import './styles.css'

// #/posters: a still of every visual for tools/visual_posters.mjs (the sheet beside the page), not the player
if (location.hash === '#/posters') {
  void renderPosters().then((posters) => ((window as unknown as { __plenioPosters?: unknown }).__plenioPosters = posters))
} else {
  createApp(App).mount('#app')
}
// who listens, before the state is read: a login on this device, a guest's choice - or the login page
if (location.hash !== '#/posters') void begin().then((known) => {
  if (joining.value) return // an invitation opened: the join page first (App.vue)
  if (known) void load()
  else loginShown.value = true
})
