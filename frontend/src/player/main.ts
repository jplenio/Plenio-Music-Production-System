/** The Plenio Player's page (built into plenio/player/static, served by ``python -m plenio.player``). */
import { createApp } from 'vue'

import { begin, joining, loginShown } from './account'
import App from './App.vue'
import { load } from './store'
import './styles.css'

createApp(App).mount('#app')
// who listens, before the state is read: a login on this device, a guest's choice - or the login page
void begin().then((known) => {
  if (joining.value) return // an invitation opened: the join page first (App.vue)
  if (known) void load()
  else loginShown.value = true
})
