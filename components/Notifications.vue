<template>
  <div class="notifications">
    <div class="container">
      <div v-if="!userStore.loggedIn" class="alert alert-info" role="alert">
        Du musst dich erst mit Spotify anmelden.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/userStore";
const userStore = useUserStore();
</script>

<style lang="scss" scoped>
.notifications {
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;

  .alert:last-child {
    margin-bottom: 0;
  }
}
</style>
