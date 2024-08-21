// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@pinia/nuxt',
    'nuxt-bootstrap-icons'
  ],
  ssr: false,
  devServer: {
    port: 8080,
  },
  typescript: {
    strict: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/variables.scss";',
        },
      },
    },
  },
  runtimeConfig: {
    spotify: {
      clientId: process.env.NUXT_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.NUXT_SPOTIFY_CLIENT_SECRET
    },
    public: {
      spotifyRedirectUrl: process.env.NUXT_PUBLIC_SPOTIFY_REDIRECT_URL || 'http://localhost:8080',
    }
  }
})
