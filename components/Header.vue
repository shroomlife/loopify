<template>
  <header>
    <div class="container">
      <NuxtLink class="home-link" to="/">
        <Logo />
      </NuxtLink>
      <a href="javascript:" class="user-link" @click="onClickUserIcon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.25 7C7.25 4.381 9.381 2.25 12 2.25C14.619 2.25 16.75 4.381 16.75 7C16.75 9.619 14.619 11.75 12 11.75C9.381 11.75 7.25 9.619 7.25 7ZM15 13.25H9C5.83 13.25 3.25 15.83 3.25 19C3.25 20.517 4.483 21.75 6 21.75H18C19.517 21.75 20.75 20.517 20.75 19C20.75 15.83 18.17 13.25 15 13.25Z"
            :fill="computedFilledColor"
          />
        </svg>
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/userStore";
const userStore = useUserStore();

const computedFilledColor = computed(() => {
  return userStore.loggedIn ? "#1DB954" : "#fff";
});

const onClickUserIcon = () => {
  if (userStore.loggedIn) {
    userStore.logout();
  }
};
</script>

<style lang="scss" scoped>
header {
  position: fixed;
  background-color: $black;
  width: 100vw;
  height: 60px;
  padding: 14px;
  top: 0;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a.home-link {
    color: #fff;

    svg {
      height: 30px;
    }
  }

  a.user-link {
    color: #fff;

    svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
  }
}
</style>
