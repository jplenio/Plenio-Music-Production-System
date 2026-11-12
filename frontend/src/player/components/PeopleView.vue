<script setup lang="ts">
/**
 * People & access (phase 6.2, PD §9.1): who comes in and what each may do, on one page - *My devices* (the player
 * on your own phone, tablet, laptop), *Party* (guests scan a code, no account), *People* (accounts, invited by a QR
 * code). The grid binds each cell to a setting that exists (people.ts); three starting points set them together.
 * *Start a party* asks three things and switches on what a party needs; *End the party* puts it back (phase 6.3).
 */
import { computed, onMounted, ref, watch } from 'vue'

import { canAdmin, GROUPS, type Group, type Invite, inviteSomeone, listInvites, listUsers, me, session, type Account, withdrawInvite } from '../account'
import { api, type NetworkStatus } from '../api'
import { guestBig, guestStatus, loadGuests, setGuests } from '../guests'
import { startLive, stopLive } from '../live'
import { loadMake, makeApi, makeStatus } from '../make/state'
import { cellValue, type Changes, endChanges, GRID, PARTY_DEFAULT, type PartyPlan, partyChanges, roleOfGroup, ROLES, type Settings, type Start, startChanges, startOf, STARTS } from '../people'
import { go, say, settings as playerSettings } from '../store'
import AccountsPanel from './AccountsPanel.vue'
import { INTROS, introShown } from '../intro'
import Icon from './Icon.vue'
import MakeSettings from './MakeSettings.vue'
import NetworkAccess from './NetworkAccess.vue'
import QrCode from './QrCode.vue'

const busy = ref(false)
const intro = introShown('people')
const network = ref<NetworkStatus | null>(null)
const users = ref<Account[]>([])
const invites = ref<Invite[]>([])
const showDevices = ref(false)

const now = computed<Settings | null>(() => {
  const g = guestStatus.value
  const m = makeStatus.value?.settings
  return g && m ? { guests: { on: g.on, mode: g.mode, reactions: g.reactions }, make: m } : null
})
const start = computed(() => (now.value ? startOf(now.value) : null))
const party = computed(() => playerSettings.party)
const myRole = computed(() => (me.value?.admin ? 'Host' : me.value ? roleOfGroup(me.value.group) : 'Party guest'))

async function read(): Promise<void> {
  await Promise.all([loadGuests(), loadMake()])
  try {
    network.value = await api.network()
  } catch {
    network.value = null
  }
  if (canAdmin.value && session.value?.login) {
    users.value = await listUsers().catch(() => [])
    invites.value = await listInvites().catch(() => [])
  }
}
onMounted(() => void read())
// the login answers after the page opened: read the people once the host is known
watch(canAdmin, (admin) => admin && void read())

/** Apply the changes of a cell, a starting point or the party: the guests' access, then the party songs. */
async function apply(changes: Changes, done = ''): Promise<void> {
  busy.value = true
  try {
    if (changes.guests && Object.keys(changes.guests).length) await setGuests(changes.guests)
    if (changes.make && Object.keys(changes.make).length) await makeApi.settings(changes.make)
    await loadMake()
    if (done) say(done, 2500)
  } catch (e) {
    say(e instanceof Error ? e.message : String(e), 5000)
  } finally {
    busy.value = false
  }
}

function toggle(rowId: string, role: string, on: boolean): void {
  const row = GRID.find((r) => r.id === rowId)
  const cell = row?.cells[role as keyof typeof row.cells]
  if (!cell || cell.kind !== 'setting' || !now.value) return
  void apply(cell.write(on, now.value))
}

function chooseStart(id: Start): void {
  void apply(startChanges(id), `${STARTS.find((s) => s.id === id)?.name}: set`)
}

// --- invitations -----------------------------------------------------------------------------------------------
const inviteName = ref('')
const inviteGroup = ref<Group>('maker')
const made = ref<{ name: string; link: string; until: number } | null>(null)

/** The address a phone reaches the player by: the link of *My devices* (it lets the browser in), else this page's. */
function joinLink(code: string): string {
  const base = network.value?.on && network.value.url ? network.value.url : `${location.origin}/`
  return `${base}#/join/${code}`
}

async function invite(): Promise<void> {
  busy.value = true
  try {
    const answer = await inviteSomeone(inviteName.value, inviteGroup.value)
    made.value = { name: answer.invite.name, link: joinLink(answer.code), until: answer.invite.until }
    inviteName.value = ''
    invites.value = await listInvites()
  } catch (e) {
    say(e instanceof Error ? e.message : String(e), 5000)
  } finally {
    busy.value = false
  }
}

async function takeBack(id: string): Promise<void> {
  await withdrawInvite(id).catch(() => undefined)
  invites.value = await listInvites().catch(() => [])
}

const minutesLeft = (until: number): number => Math.max(0, Math.round((until * 1000 - Date.now()) / 60000))

// --- the party (6.3) ----------------------------------------------------------------------------------------------
const planning = ref<PartyPlan | null>(null)
const step = ref(1)

function planParty(): void {
  planning.value = { ...PARTY_DEFAULT, name: `Party ${new Date().toLocaleDateString()}` }
  step.value = 1
}

async function startParty(): Promise<void> {
  if (!planning.value || !now.value) return
  const plan = planning.value
  const { changes, before } = partyChanges(plan, now.value, !!playerSettings.live?.on)
  await apply(changes)
  playerSettings.party = { name: plan.name.trim() || 'Party', since: Date.now(), before }
  if (!playerSettings.live.on) await startLive()
  planning.value = null
  guestBig.value = true
  say(`${playerSettings.party.name} has started - the code is on the screen`, 4000)
}

async function endParty(): Promise<void> {
  const current = playerSettings.party
  if (!current || !window.confirm(`End ${current.name}? What the party switched on goes back as it was.`)) return
  const { changes, live } = endChanges(current.before)
  await apply(changes)
  if (!live && playerSettings.live.on) stopLive()
  guestBig.value = false
  playerSettings.party = null
  say('The party has ended - everything as before', 3500)
}

const groupName = (g: Group | undefined): string => GROUPS.find(([id]) => id === g)?.[1] ?? 'Maker'
</script>

<template>
  <div class="people">
    <header class="head">
      <h1>People &amp; access</h1>
      <p class="lead">You are <b>{{ myRole }}</b> here.<template v-if="intro"> {{ INTROS.people }}</template></p>
    </header>

    <template v-if="canAdmin">
      <div class="cards">
        <section class="card">
          <h2><Icon name="home" /> My devices</h2>
          <p>Your player on your phone, tablet, laptop - you, on another screen. Not a role of its own.</p>
          <p class="state">{{ network?.on ? 'On: your devices in this network can open the player' : 'Off' }}</p>
          <button class="ghost" @click="showDevices = !showDevices">{{ showDevices ? 'Hide' : 'Show the code' }}</button>
        </section>
        <section class="card">
          <h2><Icon name="guests" /> Party</h2>
          <p>Guests scan a code and join in - no account. They see what plays, react, and (as you decide) add and make songs.</p>
          <template v-if="party">
            <p class="state">{{ party.name }} - since {{ new Date(party.since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
            <div class="row">
              <button class="ghost" @click="guestBig = true">Show the code</button>
              <button class="ghost danger" :disabled="busy" @click="endParty">End the party</button>
            </div>
          </template>
          <button v-else class="primary" :disabled="busy || !now" @click="planParty">Start a party</button>
        </section>
        <section class="card">
          <h2><Icon name="user" /> People</h2>
          <p>Family and friends with accounts: their own playlists and likes on every device.</p>
          <ul v-if="users.length" class="users">
            <li v-for="u in users" :key="u.id">{{ u.name }} · <span class="role">{{ groupName(u.group) }}</span></li>
          </ul>
          <form class="invite" @submit.prevent="invite">
            <input v-model="inviteName" placeholder="Name" maxlength="40" required aria-label="The name of the person you invite" />
            <select v-model="inviteGroup" aria-label="Their role">
              <option v-for="[id, name] in GROUPS" :key="id" :value="id">{{ name }}</option>
            </select>
            <button class="primary" type="submit" :disabled="busy || !inviteName.trim()">Invite someone</button>
          </form>
          <ul v-if="invites.length" class="invites">
            <li v-for="i in invites" :key="i.id">
              {{ i.name }} · {{ groupName(i.group) }} - invited, {{ minutesLeft(i.until) }} min left
              <button class="link" @click="takeBack(i.id)">Take back</button>
            </li>
          </ul>
        </section>
      </div>

      <div v-if="showDevices" class="devices"><NetworkAccess /></div>

      <section class="starts">
        <h2>Start from</h2>
        <div class="row">
          <button v-for="s in STARTS" :key="s.id" class="start" :class="{ on: start === s.id }" :disabled="busy || !now" @click="chooseStart(s.id)">
            <b>{{ s.name }}</b><span>{{ s.text }}</span>
          </button>
        </div>
      </section>
    </template>

    <section class="grid-box">
      <h2>What each may do</h2>
      <table v-if="now" class="grid">
        <thead>
          <tr><th /><th v-for="r in ROLES" :key="r.id" :title="r.how">{{ r.name }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in GRID" :key="row.id">
            <th scope="row">{{ row.label }}</th>
            <td v-for="r in ROLES" :key="r.id">
              <template v-if="row.cells[r.id].kind === 'fixed'">
                <span v-if="cellValue(row.cells[r.id], now) === null" class="none" title="does not apply">-</span>
                <span v-else-if="cellValue(row.cells[r.id], now)" class="yes" title="always">✓</span>
                <span v-else class="none" title="never">-</span>
              </template>
              <input
                v-else
                type="checkbox"
                :checked="!!cellValue(row.cells[r.id], now)"
                :disabled="busy || !canAdmin"
                :aria-label="`${r.name}: ${row.label}`"
                @change="toggle(row.id, r.id, ($event.target as HTMLInputElement).checked)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="lead">Reading the settings …</p>
      <p class="note">☑ ☐ you decide · ✓ - fixed. A cell that two columns share is one setting (covers, approval, the party’s page).</p>
    </section>

    <details v-if="canAdmin" class="more">
      <summary>All the settings of people and party songs</summary>
      <section v-if="session?.login" class="block"><AccountsPanel /></section>
      <MakeSettings />
    </details>
    <p v-if="!canAdmin" class="lead">The host sets who may do what. <a @click="go('/help')">Help</a></p>

    <div v-if="planning" class="dialog-veil" @click.self="planning = null">
      <form class="dialog" @submit.prevent="step < 3 ? step++ : startParty()">
        <h2>Start a party · {{ step }} of 3</h2>
        <label v-if="step === 1" class="field">The party’s name
          <input v-model="planning.name" maxlength="60" required autofocus />
        </label>
        <div v-else-if="step === 2" class="checks">
          <p>What guests may do:</p>
          <label><input v-model="planning.add" type="checkbox" /> add songs to the live playlist</label>
          <label><input v-model="planning.make" type="checkbox" /> make songs</label>
          <label><input v-model="planning.approve" type="checkbox" :disabled="!planning.make" /> their songs play after you approved them</label>
          <label><input v-model="planning.react" type="checkbox" /> react to the song that plays</label>
        </div>
        <div v-else class="checks">
          <p>Starting switches on the guests’ access, Live Play{{ planning.make ? ' and song making for guests' : '' }}. The code then shows big on this screen; <i>End the party</i> puts everything back.</p>
          <QrCode v-if="guestStatus?.url" :text="guestStatus.url" :size="140" />
        </div>
        <div class="row end">
          <button type="button" class="ghost" @click="step > 1 ? step-- : (planning = null)">{{ step > 1 ? 'Back' : 'Cancel' }}</button>
          <button type="submit" class="primary" :disabled="busy">{{ step < 3 ? 'Next' : 'Start the party' }}</button>
        </div>
      </form>
    </div>

    <div v-if="made" class="dialog-veil" @click.self="made = null">
      <div class="dialog">
        <h2>Invite {{ made.name }}</h2>
        <p>{{ made.name }} scans this code with their phone and chooses a password or a PIN. It works once, for {{ minutesLeft(made.until) }} minutes.</p>
        <QrCode :text="made.link" :size="220" />
        <p class="link-text">{{ made.link }}</p>
        <p v-if="!network?.on" class="warn">My devices is off: a phone reaches this address only on this computer. Switch on My devices first, or open the link here.</p>
        <div class="row end"><button class="primary" @click="made = null">Done</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.people {
  display: grid;
  gap: 22px;
  padding: 24px clamp(16px, 3vw, 40px) 40px;
}
.head h1 {
  margin: 0;
}
.lead {
  margin: 4px 0 0;
  color: var(--muted);
}
.cards {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.card {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 18px;
  border-radius: 16px;
  background: var(--panel, #ffffff0d);
  border: 1px solid var(--line, #ffffff1a);
}
.card h2,
.starts h2,
.grid-box h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.1rem;
}
.card p {
  margin: 0;
  color: var(--muted);
}
.card .state {
  color: var(--text);
  font-weight: 600;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.row.end {
  justify-content: flex-end;
}
.users,
.invites {
  margin: 0;
  padding-left: 18px;
}
.role {
  color: var(--muted);
}
.invite {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.invite input {
  flex: 1 1 120px;
  min-width: 0;
}
.start {
  flex: 1 1 200px;
  display: grid;
  gap: 4px;
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line, #ffffff1a);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.start span {
  color: var(--muted);
  font-size: 0.9rem;
}
.start.on {
  border-color: var(--accent, #8a7cff);
  background: color-mix(in srgb, var(--accent, #8a7cff) 14%, transparent);
}
.grid-box {
  overflow-x: auto;
}
.grid {
  border-collapse: collapse;
  min-width: 560px;
}
.grid th,
.grid td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--line, #ffffff14);
  text-align: center;
}
.grid tbody th {
  text-align: left;
  font-weight: 500;
}
.yes {
  color: var(--accent, #8a7cff);
  font-weight: 700;
}
.none {
  color: var(--muted);
}
.note {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}
.more summary {
  cursor: pointer;
  font-weight: 600;
}
.dialog-veil {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: #0008;
}
.dialog {
  width: min(460px, 100%);
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 18px;
  background: var(--panel-solid, #1b1828);
  border: 1px solid var(--line, #ffffff1a);
}
.dialog h2 {
  margin: 0;
}
.checks {
  display: grid;
  gap: 8px;
}
.checks p {
  margin: 0;
}
.field {
  display: grid;
  gap: 6px;
}
.link-text {
  word-break: break-all;
  font-size: 0.85rem;
  color: var(--muted);
}
.warn {
  color: #ffb36b;
}
.link {
  background: none;
  border: 0;
  color: var(--accent, #8a7cff);
  cursor: pointer;
  text-decoration: underline;
}
</style>
