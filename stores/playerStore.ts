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
  updatePlayerTimeout: any | null;
  loopInterval: any | null;
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
    updatePlayerTimeout: null,
    loopInterval: null
  }),

  actions: {

    afterActivePlayerUpdate() {

      if(this.updateProgressBarInterval !== null) {
        clearInterval(this.updateProgressBarInterval);
      }

      if(this.isPlaying === false) return;
      if(this.activePlayer === null) return;

      this.updateProgressBarInterval = setInterval(() => {
        console.log('updatePlayerState')
        if(this.activePlayer === null) {
          clearInterval(this.updateProgressBarInterval);
          return;
        }
        this.activePlayer.progress_ms += 500;
      }, 500);

      const timeoutDuration = this.activePlayer.item.duration_ms - this.activePlayer.progress_ms + 250;
      this.updatePlayerTimeout = setTimeout(() => {
        this.getActivePlayer(true);
      }, timeoutDuration);

      if(this.loopOptions.active === true) return;
      this.loopOptions.start_ms = 0;
      this.loopOptions.end_ms = this.activePlayer.item.duration_ms;

    },

    async getActivePlayer(silent = false): Promise<any> {
      const userStore = useUserStore();
      const pageStore = usePageStore();

      clearInterval(this.updateProgressBarInterval);

      if(silent === false) {
        pageStore.startLoading();
      }
      
      try {
        const response = await axios({
          method: 'GET',
          url: 'https://api.spotify.com/v1/me/player',
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        });

        console.log('response.data', response.data)
        if(typeof response.data === 'object' && typeof response.data.item === 'object') {
          this.activePlayer = response.data as SpotifyCurrentlyPlaying;          
        }

        this.afterActivePlayerUpdate();

      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Fehler',
          text: 'Es gaben einen Fehler beim Update des Player-Status.',
        })
      }
      
      if(silent === false) {
        pageStore.stopLoading();
      }
    },

    setLoopOptions(options: LoopOptions) {
      this.loopOptions = options;
    },

    hasAlbumCover(): boolean {
      if(this.isPlaying === false) return false;
      return this.activePlayer !== null && this.activePlayer.item && this.activePlayer.item.album && this.activePlayer.item.album.images && this.activePlayer.item.album.images.length > 0;
    },

    getCurrentAlbumCoverUrl (): string {
      if (this.activePlayer && this.activePlayer.item && this.activePlayer.item.album && this.activePlayer.item.album.images) {
        console.log('this.activePlayer.item.album.images[0].url', this.activePlayer.item.album.images[0].url)
        return this.activePlayer.item.album.images[0].url;
      } else {
        return '';
      }
    },
    setCurrentLoopStart (ms: number) {
      this.loopOptions.start_ms = ms;
    },
    setCurrentLoopEnd (ms: number) {
      this.loopOptions.end_ms = ms;
    },
    async startLoop() {

      if(this.loopInterval !== null) {
        clearTimeout(this.loopInterval);
      }
      this.loopOptions.active = true;
      
      this.setPlayerToPosition(this.loopOptions.start_ms);
      this.loopInterval = setTimeout(() => {
        if(this.activePlayer === null) return;
        this.startLoop();
      }, this.getCurrentLoopDuration + 1000);
    },
    stopLoop() {
      this.loopOptions.active = false;
      if(this.loopInterval !== null) {
        clearTimeout(this.loopInterval);
      }
    },
    async setPlayerToPosition(position_ms: number) {
      if(this.activePlayer === null) return;
      const userStore = useUserStore();
      await axios({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        },
        data: {
          uris: [
            this.activePlayer.item.uri
          ],
          position_ms: position_ms
        }
      })
      this.activePlayer.progress_ms = this.loopOptions.start_ms;
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
      if(this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.activePlayer.progress_ms / 60000)
      const seconds = ((this.activePlayer.progress_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getTotalDuration(): string {
      if(this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.activePlayer.item.duration_ms / 60000)
      const seconds = ((this.activePlayer.item.duration_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getTotalDurationMs(): number {
      if(this.activePlayer === null) return 0;
      return this.activePlayer.item.duration_ms;
    },
    getPercentageProgress(): string {
      if(this.activePlayer === null) return '0';
      return (this.activePlayer.progress_ms / this.activePlayer.item.duration_ms * 100).toFixed(2)
    },
    getCurrentTrackame(): string {
      if(this.activePlayer === null) return '';
      return this.activePlayer.item.name;
    },
    getCurrentArtist(): string {
      if(this.activePlayer === null) return '';
      return this.activePlayer.item.artists.map((artist) => artist.name).join(', ');
    },
    getCurrentLoopStart(): number {
      if(this.activePlayer === null) return 0;
      return this.loopOptions.start_ms
    },
    getCurrentLoopStartFormatted(): string {
      if(this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.loopOptions.start_ms / 60000)
      const seconds = ((this.loopOptions.start_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getCurrentLoopEnd(): number {
      if(this.activePlayer === null) return 0;
      return this.loopOptions.end_ms
    },
    getCurrentLoopEndFormatted(): string {
      if(this.activePlayer === null) return '0:00';
      const minutes = Math.floor(this.loopOptions.end_ms / 60000)
      const seconds = ((this.loopOptions.end_ms % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    },
    getCurrentLoopDuration(): number {
      if(this.activePlayer === null) return 0;
      return this.loopOptions.end_ms - this.loopOptions.start_ms
    },
    getCurrentLoopDurationFormatted(): string {
      if(this.activePlayer === null) return '0:00';
      const minutes = Math.floor((this.loopOptions.end_ms - this.loopOptions.start_ms) / 60000)
      const seconds = (((this.loopOptions.end_ms - this.loopOptions.start_ms) % 60000) / 1000).toFixed(0)
      return `${minutes}:${(Number(seconds) < 10 ? '0' : '')}${seconds}`
    }
  }
});
