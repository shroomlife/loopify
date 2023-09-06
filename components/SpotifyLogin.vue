<template>
  <div>
    <a v-if="!userStore.isAuthenticated" :href="computedSpotifyLoginLink" class="spotify-button">Login mit
      Spotify</a>
    <a v-else href="javascript:" class="btn btn-secondary" @click="userStore.doLogout">Logout</a>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

function getRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const computedSpotifyLoginLink = computed(() => {
  const clientId = 'a4404ccecd5d4823b9d41ee6d538086e';
  const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const redirectUri = 'http://localhost:8080';
  const state = getRandomString(16);

  let params = new URLSearchParams();
  params.append('response_type', 'code');
  params.append('client_id', clientId);
  params.append('scope', scope);
  params.append('redirect_uri', redirectUri);
  params.append('state', state);

  return `https://accounts.spotify.com/authorize?${params.toString()}`
})

const checkIfCodeFromSpotify = () => {
  const route = useRoute()
  if (typeof route.query !== 'undefined' && typeof route.query.code !== 'undefined') {
    const code = String(route.query.code)
    router.replace({ query: {} })
    getAccessTokenFromCode(code)
  }
}

const getAccessTokenFromCode = async (code) => {
  console.log('code', code)
  const { data } = await useFetch('/api/spotify/auth', {
    method: 'POST',
    body: {
      code: code
    }
  })

  console.log('data', data)

  if (typeof data.value.access_token !== 'undefined') {
    userStore.doLogin({
      name: 'Test',
      token: data.value.access_token,
      refreshToken: data.value.refresh_token
    })
  }
}

onMounted(async () => {

  userStore.load()
  if(!userStore.isAuthenticated) {
    await checkIfCodeFromSpotify()
  }

})

</script>

<style scoped>
.spotify-button {
  display: inline-block;
  font-family: Arial, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: #ffffff;
  text-decoration: none;
  padding: 7px 16px;
  background-color: #1DB954;
  border-radius: 500px;
  transition: background-color 0.3s ease;
}

.spotify-button:hover {
  background-color: #189A36;
}
</style>