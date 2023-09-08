<template>
  <div class="player-controls" v-if="playerStore.isPlaying">
    <a href="javascript:" class="btn btn-light circle-btn" @click="playerStore.skipPrevious">
      <BootstrapIcon name="skip-start-fill" />
    </a>
    <a href="javascript:" class="btn btn-light circle-btn" @click="playerStore.stopPlayer">
      <BootstrapIcon name="stop-fill" />
    </a>
    <a href="javascript:" class="btn btn-light circle-btn" @click="playerStore.skipNext">
      <BootstrapIcon name="skip-end-fill" />
    </a>
</div>
</template>

<script setup lang="ts">

import { useUserStore } from "@/stores/userStore";
import { usePlayerStore } from "@/stores/playerStore";

const userStore = useUserStore();
const playerStore = usePlayerStore();

</script>

<style lang="scss" scoped>

.player-controls {
  width: 100%;
  height: 48px;

  position: absolute;
  bottom: 10px;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 10px;

  a {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    font-size: 24px;
  }

}

</style>