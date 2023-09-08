<template>
  <main>
    <loading
      v-model:active="pageStore.isLoadingState"
      :can-cancel="false"
      :is-full-page="true"
    />

    <Header />

    <slot />

    <Footer />
  </main>
</template>

<script setup lang="ts">
import 'bootstrap/dist/css/bootstrap.min.css'
import "~/assets/default.scss";
import "vue-loading-overlay/dist/css/index.css";

import Loading from "vue-loading-overlay";

import { useUserStore } from "~/stores/userStore";
import { usePageStore } from "~/stores/pageStore";

const pageStore = usePageStore();
const userStore = useUserStore();

const router = useRouter();

const checkIfCodeFromSpotify = async () => {
  const route = useRoute()
  if (typeof route.query !== 'undefined' && typeof route.query.code !== 'undefined') {
    const code = String(route.query.code)
    await userStore.getAccessTokenFromCode(code)
    router.replace({ query: {} })
  }
}

onMounted(async () => {
  pageStore.startLoading();
  await checkIfCodeFromSpotify();
  await userStore.validateToken();
  pageStore.stopLoading();
});
</script>

<style lang="scss" scoped>
main {
  padding-top: $header-height;
  padding-bottom: $footer-height;

  > .container {
    padding: $default-padding;
  }
}
</style>
