<template>
  <div class="container">

    <div class="row" v-if="!userStore.isAuthenticated">
      <div class="col-12">  
        <div class="alert alert-info" role="alert">
          Du musst dich erst mit Spotify anmelden.
        </div>
      </div>
      <div class="col-12">
      </div>
    </div>

    <div class="row" v-else>


    </div>

    <div class="row" v-if=0>
      <div class="col-12">
        <p>Code: {{ store.code }}</p>
        <p>Token: {{ store.token }}</p>
        <p>Refresh Token: {{ store.refresh_token }}</p>
      </div>
    </div>

    <div class="row" v-if="0">

      <div class="col-6">
        Aktueller Player
      </div>
      <div class="col-6">
        <button class="btn btn-primary" @click="updatePlayerState">Update Player State</button>
      </div>

      <div class="col-12">
        <p>Is Playing: {{ playerState.is_playing }}</p>
      </div>

    </div>

    <div class="row" v-if="playerState.is_playing">
      <div class="col-3">
        <strong>Track</strong>
      </div>
      <div class="col-9">{{ playerState.item.name }}</div>

      <div class="col-9">

        <p>Range: {{ loopifySettings.range }}</p>

      </div>

      <div class="col-3">
      </div>
    </div>

  </div>
</template>

<script setup>
import axios from 'axios';
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const store = reactive({
  code: null,
  token: null,
  refresh_token: null
})

const playerState = reactive({
  is_playing: false,
  device: null,
  item: null,
  uri: null
})

const loopifySettings = reactive({
  range: null
})

const startLoop = async () => {

  const playFeedback = await axios({
    method: 'PUT',
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: {
      'Authorization': `Bearer ${store.token}`,
      'Content-Type': 'application/json'
    },
    data: {
      uris: [
        playerState.uri
      ],
      position_ms: loopifySettings.range[0] * 1000
    }
  })

  console.log('playFeedback', playFeedback)

}

const saveStoreToLocalStorage = () => {
  localStorage.setItem('loopifyStore', JSON.stringify(store))
}

const checkIfTokenInLocalStorage = () => {
  const storeFromLocalStorage = localStorage.getItem('loopifyStore')
  if (storeFromLocalStorage !== null) {
    const storeFromLocalStorageParsed = JSON.parse(storeFromLocalStorage)
    store.code = storeFromLocalStorageParsed.code
    store.token = storeFromLocalStorageParsed.token
    store.refresh_token = storeFromLocalStorageParsed.refresh_token
  }
}

const updatePlayerState = async () => {

  const playerData = await axios({
    method: 'GET',
    url: 'https://api.spotify.com/v1/me/player',
    headers: {
      'Authorization': `Bearer ${store.token}`
    }
  })

  playerState.is_playing = playerData.data.is_playing
  playerState.device = playerData.data.device
  playerState.item = playerData.data.item
  playerState.uri = playerData.data.item.uri

  loopifySettings.range = [0, computedCurrentTrackLength.value]

}

const computedCurrentTrackLength = computed(() => {
  return Math.ceil(playerState.item.duration_ms / 1000)
})

</script>