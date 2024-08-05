<script setup lang="ts">
const emit = defineEmits(['show-screen'])

const onStart = () => {
  const token = window.localStorage.getItem('openai-token')
  const hasToken = token && token.length > 0
  const nextScreen = hasToken ? SCREEN.CHAT : SCREEN.SETTINGS
  emit('show-screen', nextScreen)
}
</script>

<template>
  <div>
    <NuxtLayout name="chat">
      <template #content>
        <div class="flex flex-col items-center justify-center gap-4">
          <img src="/midudev-this-is-fine.png" class="w-28" alt="This is fine - Midudev" />
          <h1 class="text-2xl font-bold text-center">Minidudev Chat</h1>
          <ul class="list-disc mx-4 px-4">
            <li class="pb-1 text-sm">¿Tienes dudas sobre programación?</li>
            <li class="pb-1 text-sm">¿Quieres aprender más de tu streamer favorito?</li>
            <li class="pb-1 text-sm">¿Alguna vez has querido preguntarle algo a Midudev y te ha ignorado? 🥲</li>
          </ul>
          <p class="mb-4 px-4 text-sm">Estás en el lugar indicado. Aquí podrás hacerle preguntas directamente a Midudev y obtener respuestas rápidas y precisas gracias a nuestro avanzado sistema de clonación de conciencia ™.</p>
          <button type="button" @click.prevent="onStart" class="py-2 px-4 bg-blue-500 text-white rounded">¡Comenzar!</button>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>
