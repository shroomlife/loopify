import { defineStore } from 'pinia';
import { usePlayerStore } from './playerStore';
import { usePageStore } from './pageStore';
import Swal from 'sweetalert2';

interface UserState {
  token: string | null;
  refreshToken: string | null;
  tokenValidated: boolean;
}

function getRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const localStorageIdentifier = {
  token: 'loopifyUserToken',
  refreshToken: 'loopifyUserRefreshToken'
}

export const useUserStore = defineStore('userStore', {
  state: (): UserState => ({
    token: localStorage.getItem(localStorageIdentifier.token),
    refreshToken: localStorage.getItem(localStorageIdentifier.refreshToken),
    tokenValidated: false
  }),

  getters: {
    loggedIn(): boolean {
      return !!this.tokenValidated;
    },
    getToken(): string | null {
      return this.token;
    }
  },

  actions: {

    doLogin() {

      const config = useRuntimeConfig();

      const pageStore = usePageStore();
      pageStore.startLoading();

      const clientId = config.spotify.clientId;
      const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
      const redirectUri = config.public.spotifyRedirectUrl;
      const state = getRandomString(16);
    
      let params = new URLSearchParams();
      params.append('response_type', 'code');
      params.append('client_id', clientId);
      params.append('scope', scope);
      params.append('redirect_uri', redirectUri);
      params.append('state', state);

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
      pageStore.stopLoading();

    },

    async getAccessTokenFromCode(code: string) {

      const { data } = await useFetch('/api/spotify/auth', {
        method: 'POST',
        body: {
          code: code
        }
      })
    
      if (typeof data.value.access_token !== 'undefined') {
        this.setToken(data.value.access_token);
        this.setRefreshToken(data.value.refresh_token);
      }

    },

    async refreshAccessToken(): Promise<boolean> {
      try {

        const { data } = await useFetch('/api/spotify/refresh', {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken
          }
        })

        if (typeof data.value.access_token !== 'undefined') {
          this.setToken(data.value.access_token);
        }

        const playerStore = usePlayerStore();
        await playerStore.updateCurrentPlayerState();
        return true;

      } catch (err) {
        this.logout();
      }

      return false
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem(localStorageIdentifier.token, token);
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
      localStorage.setItem(localStorageIdentifier.refreshToken, refreshToken);
    },

    async validateToken(): Promise<boolean> {

      if (!this.getToken) {
        if (this.refreshToken) {
          await this.refreshAccessToken();
        } else {
          return false;
        }
      }

      const playerStore = usePlayerStore();
      
      try {
        this.tokenValidated = true;
        await playerStore.updateCurrentPlayerState();
        return true;

      } catch (err: any) {
        if (this.refreshToken) {
          return this.refreshAccessToken();
        }
        return false;
      }
    },

    logout() {

      const pageStore = usePageStore();
      pageStore.startLoading();

      this.token = null;
      this.refreshToken = null;
      localStorage.removeItem(localStorageIdentifier.token);
      localStorage.removeItem(localStorageIdentifier.refreshToken);

      const playerStore = usePlayerStore();
      playerStore.activePlayer = null;
      playerStore.stopLoop();

      this.tokenValidated = false;

      pageStore.stopLoading();

      Swal.fire({
        icon: 'success',
        title: 'Logout',
        text: 'Du wurdest erfolgreich ausgeloggt.',
      })

    }
  }
});
