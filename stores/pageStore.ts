import { defineStore } from 'pinia';

interface PageState {
  activeLoaders: boolean[];
  initialLoad: boolean;
}

export const usePageStore = defineStore('pageStore', {
  state: (): PageState => ({
    activeLoaders: [],
    initialLoad: false
  }),

  getters: {
    isLoadingState(): boolean {
      return this.activeLoaders.length > 0;
    }
  },

  actions: {
    startLoading() {
      this.activeLoaders.push(true);
    },
    stopLoading() {
      this.activeLoaders.pop();
    },
    setInitialLoadState(loading: boolean) {
      this.initialLoad = loading;
    }
  }
});
