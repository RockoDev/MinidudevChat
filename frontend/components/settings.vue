<script setup lang="ts">
const emit = defineEmits(['show-screen'])

const token = computed({
  get: () => window.localStorage.getItem('openai-token') ?? '',
  set: (value: string) => window.localStorage.setItem('openai-token', value),
})

const onBack = () => {
  const token = window.localStorage.getItem('openai-token')
  const hasToken = (token?.length ?? 0) > 0
  const nextScreen = hasToken ? SCREEN.CHAT : SCREEN.SPLASH
  emit('show-screen', nextScreen)
}
</script>

<template>
  <div>
    <NuxtLayout name="chat">
      <template #header-button-left>
        <button type="button" @click.prevent="onBack" class="size-8 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-full">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M5 12l14 0" />
            <path d="M5 12l6 6" />
            <path d="M5 12l6 -6" />
          </svg>
        </button>
      </template>
      <template #header-center>
        <div>
          <h3 class="text-xl font-bold text-gray-800">Configuración</h3>
        </div>
      </template>
      <template #content>
        <div class="p-4">
          <p class="mb-4 text-sm">Para empezar, solo necesitas ingresar tu <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" class="font-bold">token de acceso de OpenAI</a> y estarás listo para interactuar.</p>
          <p class="mb-4 text-xs">Por seguridad, te recomendamos crear uno nuevo y eliminarlo cuando termines de usar el chatbot.</p>
          <form @submit.prevent="onBack">
            <div class="flex flex-col gap-4">
              <input type="password" name="token" v-model="token" autocomplete="minidudev-token" placeholder="Token de OpenAI" class="p-2 px-4 border border-gray-300 rounded" />
              <button class="p-2 bg-blue-500 text-white rounded">Guardar</button>
            </div>
          </form>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>