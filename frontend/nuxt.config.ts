// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    openai: {
      // apikey: process.env.OPENAI_API_KEY,
    },
    ollama: {
      base_url: process.env.OLLAMA_BASE_URL,
    },
    mongodb: {
      uri: process.env.MONGODB_URI,
    },
    embeddings: {
      provider: process.env.EMBEDDINGS_PROVIDER,
      model: process.env.EMBEDDINGS_MODEL,
    },
    ai: {
      provider: process.env.AI_PROVIDER,
      model: process.env.AI_MODEL,
    },
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, interactive-widget=resizes-content' },
      ],
    },
  },
})
