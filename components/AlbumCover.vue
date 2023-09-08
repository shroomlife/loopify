<template>
  <div class="album-cover" ref="albumCover" :style="{ height: computedHeight }">

    <a v-if="userStore.loggedIn" href="javascript:" class="btn btn-light circle-btn reload-btn" @click="playerStore.updateCurrentPlayerState">
      <BootstrapIcon name="arrow-clockwise" />
    </a>

    <PlayerControls />

    <img v-if="playerStore.hasAlbumCover()" :src="playerStore.getCurrentAlbumCoverUrl()" />
    <div v-else class="album-loading">
      <svg
        width="136"
        height="136"
        viewBox="0 0 136 136"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120.133 27.2H115.6V15.8666C115.6 14.5066 114.693 13.6 113.333 13.6H108.8V2.26658C108.8 0.906578 107.893 0 106.533 0H29.4666C28.1066 0 27.2 0.906578 27.2 2.26658V13.6H22.6666C21.3066 13.6 20.4 14.5066 20.4 15.8666V27.2H15.8666C14.5066 27.2 13.6 28.1066 13.6 29.4666V133.733C13.6 135.093 14.5066 136 15.8666 136H120.133C121.493 136 122.4 135.093 122.4 133.733V29.4666C122.4 28.1066 121.493 27.2 120.133 27.2ZM31.7334 4.53342H104.267V13.6H31.7334V4.53342ZM24.9334 18.1334H29.4668H106.533H111.067V27.2H24.9334V18.1334ZM117.867 131.467H18.1334V31.7334H22.6668H113.333H117.867V131.467H117.867Z"
          fill="#DCDDE0"
        />
        <path
          d="M94.7466 49.8666L53.9466 56.6666C53.04 56.8932 52.1332 57.8 52.1332 58.9332V70.2666V93.5335C49.7224 91.7442 46.5418 90.6666 43.0666 90.6666C35.5866 90.6666 29.4666 95.6532 29.4666 102C29.4666 108.347 35.5866 113.333 43.0666 113.333C50.5466 113.333 56.6666 108.347 56.6666 102V72.2311L92.9332 66.1866V82.2001C90.5224 80.4108 87.3418 79.3332 83.8666 79.3332C76.3866 79.3332 70.2666 84.3197 70.2666 90.6666C70.2666 97.0132 76.3866 102 83.8666 102C91.3466 102 97.4666 97.0134 97.4666 90.6666V63.4666V52.1332C97.4666 51.4532 97.0132 50.7732 96.56 50.3197C96.1066 49.8666 95.4266 49.8666 94.7466 49.8666ZM43.0666 108.8C38.08 108.8 34 105.853 34 102C34 98.1466 38.08 95.2 43.0666 95.2C48.0532 95.2 52.1332 98.1466 52.1332 102C52.1334 105.853 48.0534 108.8 43.0666 108.8ZM56.6666 60.7466L92.9332 54.6266V61.4266L56.6666 67.5466V60.7466ZM83.8666 97.4666C78.88 97.4666 74.8 94.52 74.8 90.6666C74.8 86.8132 78.88 83.8666 83.8666 83.8666C88.8532 83.8666 92.9332 86.8132 92.9332 90.6666C92.9334 94.52 88.8534 97.4666 83.8666 97.4666Z"
          fill="#DCDDE0"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from "~/stores/playerStore";
import { useUserStore } from "~/stores/userStore";
const playerStore = usePlayerStore();
const userStore = useUserStore();


const albumCover: Ref<HTMLElement | null> = ref(null);  // reference to the DOM element

// Dynamically compute height based on width
const computedHeight = computed(() => {
  if (albumCover.value) {
    return `${albumCover.value.clientWidth}px`;
  }
  return 'auto';
});

const handleResize = () => {
  // Force reactivity system to re-evaluate the computed property
  computedHeight.value;
};

// To make sure computedHeight is evaluated after the component is mounted
onMounted(() => {
  watchEffect(() => computedHeight.value);
  window.addEventListener('resize', handleResize);
});

// Cleanup: remove event listener when component is destroyed/unmounted
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

</script>

<style lang="scss" scoped>
.album-cover {
  width: 100%;
  max-width: 640px;
  max-height: 640px;
  min-width: 300px;
  min-height: 300px;

  margin-bottom: 30px;
  position: relative;

  img {
    width: 100%;
    height: auto;
  }

  .album-loading {

    background-color: #F2F2F2;

    width: 100%;
    height: 100%;

    // max-width: 640px;
    // max-height: 640px;

    // min-width: 100%;
    // min-height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      width: 136px;
      height: 136px;
    }

  }

  .reload-btn {
    top: 10px;
    right: 10px;
    position: absolute;
  }

}
</style>
