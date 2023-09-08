// store/playerStore.ts

import { defineStore } from 'pinia';
import axios from 'axios';
import { useUserStore } from './userStore';
import { usePageStore } from './pageStore';
import Swal from "sweetalert2";

interface LoopOptions {
  active: boolean;
  start_ms: number;
  end_ms: number;
}

interface PlayerState {
  activePlayer: SpotifyCurrentlyPlaying | null;
  loopOptions: LoopOptions;
  updateProgressBarInterval: any | null;
  updatePlayerInterval: any | null;
}

interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

interface SpotifyExternalUrls {
  spotify: string;
}

interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface SpotifyAlbum {
  album_type: string;
  artists: SpotifyArtist[];
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

interface SpotifyTrack {
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  supports_volume: boolean;
  type: string;
  volume_percent: number;
}

interface SpotifyContext {
  external_urls: SpotifyExternalUrls;
  href: string;
  type: string;
  uri: string;
}

interface SpotifyDisallows {
  pausing: boolean;
}

interface SpotifyActions {
  disallows: SpotifyDisallows;
}

interface SpotifyCurrentlyPlaying {
  device: SpotifyDevice;
  shuffle_state: boolean;
  repeat_state: string;
  timestamp: number;
  context: SpotifyContext;
  progress_ms: number;
  item: SpotifyTrack;
  currently_playing_type: string;
  actions: SpotifyActions;
  is_playing: boolean;
}

export const usePlayerStore = defineStore('playerStore', {
  state: (): PlayerState => ({
    activePlayer: null,
    loopOptions: {
      active: false,
      start_ms: 0,
      end_ms: 0
    },
    updateProgressBarInterval: null,
    updatePlayerInterval: null,
  }),

  actions: {

    updateIntervals() {

      clearInterval(this.updateProgressBarInterval);
      clearInterval(this.updatePlayerInterval);

      if (this.isPlaying === false) return;

      this.updateProgressBarInterval = setInterval(() => {
        if (this.activePlayer === null) {
          clearInterval(this.updateProgressBarInterval);
          return;
        }
        this.activePlayer.progress_ms = Number(this.activePlayer.progress_ms) + 1000;

        if (this.activePlayer.progress_ms >= this.activePlayer.item.duration_ms) {
          this.updateCurrentPlayerState();
        }

        if (this.activePlayer.progress_ms >= this.loopOptions.end_ms && this.isLoopActive) {
          this.setPlayerToPosition(this.loopOptions.start_ms);
        }

      }, 1000);

      this.updatePlayerInterval = setInterval(() => {
        if (this.activePlayer === null) {
          clearInterval(this.updatePlayerInterval);
          return;
        }
        this.updateCurrentPlayerState();
      }, 15000);

    },

    async updateCurrentPlayerState(retry: boolean = false) {

      const userStore = useUserStore();

      const songIdBefore = this.activePlayer ? this.activePlayer.item.id : null;

      try {
        
        const response = await axios({
          method: 'GET',
          url: 'https://api.spotify.com/v1/me/player',
          headers: {
            'Authorization': `Bearer ${userStore.getToken}`
          }
        });
  
        if (typeof response.data === 'object' && typeof response.data.item === 'object') {
          this.activePlayer = response.data as SpotifyCurrentlyPlaying;
        } else {
          this.activePlayer = null;
        }
  
        if (this.activePlayer !== null && songIdBefore !== this.activePlayer.item.id) {
          this.stopLoop();
          this.setCurrentLoopStart(0);
          this.setCurrentLoopEnd(this.activePlayer.item.duration_ms);
        }
  
        if (this.activePlayer !== null) {
          this.updateIntervals();
        }
  
        if (this.isPlaying === false) {
          this.stopLoop();
        }

      } catch (error) {

        if (retry === true) {
          Swal.fire({
            icon: 'error',
            title: 'Fehler',
            text: 'Es gaben einen Fehler beim Update des Player-Status.',
          })
        } else {
          await userStore.refreshAccessToken();
          await this.updateCurrentPlayerState(true);
        }

      }

    },
    setLoopOptions(options: LoopOptions) {
      this.loopOptions = options;
    },

    hasAlbumCover(): boolean {
      if (this.isPlaying === false) return false;
      return this.activePlayer !== null && this.activePlayer.item && this.activePlayer.item.album && this.activePlayer.item.album.images && this.activePlayer.item.album.images.length > 0;
    },

    getCurrentAlbumCoverUrl(): string {
      if (this.activePlayer && this.activePlayer.item && this.activePlayer.item.album && this.activePlayer.item.album.images) {
        return this.activePlayer.item.album.images[0].url;
      } else {
        return '';
      }
    },
    setCurrentLoopStart(ms: number) {
      this.loopOptions.start_ms = ms;
    },
    setCurrentLoopEnd(ms: number) {
      this.loopOptions.end_ms = ms;
    },
    async startLoop() {
      this.loopOptions.active = true;
      this.setPlayerToPosition(this.loopOptions.start_ms);
    },
    stopLoop() {
      this.loopOptions.active = false;
    },
    async setPlayerToPosition(position_ms: number) {

      await this.updateCurrentPlayerState();

      if (
        this.activePlayer === null ||
        this.isPlaying === false ||
        this.isLoopActive === false
      ) {
        return;
      }

      const userStore = useUserStore();
      await axios({
        method: 'PUT',
        url: `https://api.spotify.com/v1/me/player/seek?position_ms=${position_ms}`,
        headers: {
          'Authorization': `Bearer ${userStore.getToken}`
        }
      })

      this.activePlayer.progress_ms = position_ms;
    },
    async stopPlayer() {

      if (this.activePlayer === null) return;

      this.stopLoop();

      clearInterval(this.updateProgressBarInterval);
      clearInterval(this.updatePlayerInterval);

      const userStore = useUserStore();

      await axios({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/player/pause',
        headers: {
          'Authorization': `Bearer ${userStore.getToken}`
        }
      })

      await this.updateCurrentPlayerState();

    },
    async skipPrevious() {

      if (this.activePlayer === null) return;
      this.stopLoop();

      const pageStore = usePageStore();
      pageStore.startLoading();

      const userStore = useUserStore();

      await axios({
        method: 'POST',
        url: 'https://api.spotify.com/v1/me/player/previous',
        headers: {
          'Authorization': `Bearer ${userStore.getToken}`
        }
      })

      setTimeout(() => {
        this.updateCurrentPlayerState();
        pageStore.stopLoading();
      }, 500)

    },
    async skipNext() {

      if (this.activePlayer === null) return;
      this.stopLoop();

      const pageStore = usePageStore();
      pageStore.startLoading();

      const userStore = useUserStore();

      await axios({
        method: 'POST',
        url: 'https://api.spotify.com/v1/me/player/next',
        headers: {
          'Authorization': `Bearer ${userStore.getToken}`
        }
      })

      setTimeout(() => {
        this.updateCurrentPlayerState();
        pageStore.stopLoading();
      }, 500)

    }
  },
  getters: {
    isPlaying(): boolean {
      return this.activePlayer !== null && this.activePlayer.is_playing;
    },
    isLoopActive(): boolean {
      return this.loopOptions.active === true;
    },
    getCurrentDevice(): SpotifyDevice | null {
      return this.activePlayer && this.activePlayer.device;
    },
    getCurrentProgress(): string {
      if (this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.activePlayer.progress_ms / 60000)
      const seconds = ((this.activePlayer.progress_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getTotalDuration(): string {
      if (this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.activePlayer.item.duration_ms / 60000)
      const seconds = ((this.activePlayer.item.duration_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getTotalDurationMs(): number {
      if (this.activePlayer === null) return 0;
      return this.activePlayer.item.duration_ms;
    },
    getPercentageProgress(): string {
      if (this.activePlayer === null) return '0';
      return (this.activePlayer.progress_ms / this.activePlayer.item.duration_ms * 100).toFixed(2)
    },
    getCurrentTrackame(): string {
      if (this.activePlayer === null) return '';
      return this.activePlayer.item.name;
    },
    getCurrentTrackId(): string {
      if (this.activePlayer === null) return '';
      return this.activePlayer.item.id;
    },
    getCurrentArtist(): string {
      if (this.activePlayer === null) return '';
      return this.activePlayer.item.artists.map((artist) => artist.name).join(', ');
    },
    getCurrentLoopStart(): number {
      if (this.activePlayer === null) return 0;
      return this.loopOptions.start_ms
    },
    getCurrentLoopStartFormatted(): string {
      if (this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.loopOptions.start_ms / 60000)
      const seconds = ((this.loopOptions.start_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getCurrentLoopEnd(): number {
      if (this.activePlayer === null) return 0;
      return this.loopOptions.end_ms
    },
    getCurrentLoopEndFormatted(): string {
      if (this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.loopOptions.end_ms / 60000)
      const seconds = ((this.loopOptions.end_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getCurrentLoopDuration(): number {
      if (this.activePlayer === null) return 0;
      return this.loopOptions.end_ms - this.loopOptions.start_ms
    },
    getCurrentLoopDurationFormatted(): string {
      if (this.activePlayer === null) return '0:00';
      const minutes = Math.floor((this.loopOptions.end_ms - this.loopOptions.start_ms) / 60000)
      const seconds = (((this.loopOptions.end_ms - this.loopOptions.start_ms) % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    }
  }
});
