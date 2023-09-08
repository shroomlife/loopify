<template>
  <Head>
    <Title>loopify</Title>
  </Head>
  <div>
    <Notifications />

    <div class="container">
      <div class="d-flex flex-column align-items-center justify-content-start">
        <AlbumCover />
      </div>

      <div class="d-grid justify-content-center" v-if="!userStore.loggedIn">
        <button
          type="button"
          class="btn btn-primary btn-block login-btn"
          @click="userStore.doLogin"
        >
          Login mit Spotify
        </button>
      </div>

      <template v-if="userStore.loggedIn">
        <div class="d-flex justify-content-between mb-3">
          <span class="badge text-bg-primary">Aktueller Player</span>
          <span v-if="!playerStore.isPlaying" class="badge text-bg-danger"
            >Inaktiv</span
          >
          <span
            v-if="playerStore.isPlaying && playerStore.getCurrentDevice"
            class="badge text-bg-light"
          >
            Device: {{ playerStore.getCurrentDevice.name }}
          </span>
        </div>

        <template v-if="playerStore.isPlaying">
          <div class="player-progress">
            <div class="player-progress-bar">
              <div
                class="player-progress-current"
                :style="computedPlayerProgressStyle"
              ></div>
            </div>

            <div class="player-times">
              <span class="player-time-current">
                {{ playerStore.getCurrentProgress }}
              </span>
              <span class="player-time-total">
                {{ playerStore.getTotalDuration }}
              </span>
            </div>
          </div>

          <div class="item-details">
            <span class="item-name">
              {{ playerStore.getCurrentTrackame }}
            </span>
            <span class="item-artist">
              {{ playerStore.getCurrentArtist }}
            </span>
          </div>

          <!-- Loop Features -->

          <div class="d-flex justify-content-between mb-3">
            <span class="badge text-bg-primary">Aktueller Loop</span>
            <span v-if="!playerStore.isLoopActive" class="badge text-bg-danger"
              >Inaktiv</span
            >
            <span v-else class="badge text-bg-success"> Aktiv </span>
          </div>

          <div class="d-flex flex-column loop-controls mb-2">
            <div class="d-flex justify-content-between mb-1">
              <label for="rangeStart">Start</label>
              <input
                type="range"
                class="form-range"
                id="rangeStart"
                :value="computedRangeStart"
                @input="updateRangeStart"
                :min="0"
                :max="playerStore.getTotalDurationMs"
                :disabled="playerStore.isLoopActive"
              />
              <span>
                {{ playerStore.getCurrentLoopStartFormatted }}
              </span>
            </div>
            <div class="d-flex justify-content-start">
              <label for="rangeEnd">Ende</label>
              <input
                :key="playerStore.getCurrentTrackId"
                type="range"
                class="form-range"
                id="rangeEnd"
                :value="computedRangeEnd"
                @input="updateRangeEnd"
                :min="0"
                :max="playerStore.getTotalDurationMs"
                :disabled="playerStore.isLoopActive"
              />
              <span>
                {{ playerStore.getCurrentLoopEndFormatted }}
              </span>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between">
            <span>Länge: {{ computedLoopLength }}</span>
            <button
              v-if="!playerStore.isLoopActive"
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="!computedIsLoopAvailable"
              @click="playerStore.startLoop"
            >
              Start Loop
            </button>
            <button
              v-else
              type="button"
              class="btn btn-secondary btn-sm"
              @click="playerStore.stopLoop"
            >
              Stop Loop
            </button>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/userStore";
import { usePlayerStore } from "@/stores/playerStore";
import { usePageStore } from "~/stores/pageStore";

const userStore = useUserStore();
const playerStore = usePlayerStore();
const pageStore = usePageStore();

const computedPlayerProgressStyle = computed(() => {
  return `width: ${playerStore.getPercentageProgress}%;`;
});

const updateRangeStart = (event: any) => {
  playerStore.setCurrentLoopStart(event.target.value);
};

const updateRangeEnd = (event: any) => {
  playerStore.setCurrentLoopEnd(event.target.value);
};

const computedRangeStart = computed(() => {
  return playerStore.getCurrentLoopStart;
});

const computedRangeEnd = computed(() => {
  return playerStore.getCurrentLoopEnd;
});

const computedIsLoopAvailable = computed(() => {
  return playerStore.getCurrentLoopDuration > 5000;
});

const computedLoopLength = computed(() => {
  if (computedIsLoopAvailable.value === false) {
    return "zu kurz";
  }

  return playerStore.getCurrentLoopDurationFormatted;
});
</script>

<style lang="scss" scoped>

.container {
  max-width: 640px;
  padding: 30px;
}
.player-progress {
  margin-bottom: 10px;

  .player-progress-bar {
    width: 100%;
    height: 3px;
    flex-shrink: 0;
    border-radius: 5px;
    background: #d9d9d9;
    margin-bottom: 3px;

    .player-progress-current {
      width: 0px;
      height: 100%;
      background-color: $dark-green;
      transition: width 0.5s;
    }
  }

  .player-times {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .player-time-current,
    .player-time-total {
      width: 50px;
      color: $black;
      font-family: Roboto;
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
    }

    .player-time-total {
      text-align: right;
    }
  }
}

.item-details {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

  .item-name,
  .item-artist {
    color: $black;
    font-family: Roboto;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  .item-artist {
    color: $light-gray;
  }
}

.loop-controls {
  label {
    width: 80px;
    text-align: left;
  }
  span {
    display: block;
    width: 80px;
    text-align: right;
  }
}

.login-btn {
  width: 300px;
}
</style>
