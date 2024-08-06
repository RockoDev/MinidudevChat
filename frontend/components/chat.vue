<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'

const emit = defineEmits(['show-screen'])

const isWriting = ref(false)
const $messages = ref<HTMLDivElement | null>(null)
const $input = ref<HTMLInputElement | null>(null)

const { messages, input, handleSubmit, isLoading } = useChat({
  onResponse: () => { isWriting.value = true },
  onFinish: () => { isWriting.value = false },
  // streamProtocol: 'text',
  streamMode: 'text',
  initialMessages: [
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy Midudev. ¿En qué puedo ayudarte?',
    },
  ],
})

const isThinking = computed(() => isLoading.value && !isWriting.value)

const items = computed(() => isThinking.value ? [
  ...messages.value,
  { id: 'thinking', role: 'thinking' },
] : messages.value)

watch(messages, () => {
  setTimeout(() => {
    $messages.value?.scrollTo({
      top: $messages.value?.scrollHeight,
      behavior: 'smooth',
    })
  }, 100)
})

watch($input, () => $input.value?.focus())

onBeforeMount(() => {
  const token = window.localStorage.getItem('openai-token')
  const hasToken = token && token.length > 0
  if ( !hasToken ) emit('show-screen', SCREEN.SETTINGS)
})

const onSubmit = (event: Event) => {
  event.preventDefault()
  if ( !isLoading.value ) handleSubmit(event, {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('openai-token')}`,
    },
  })
}
</script>

<template>
  <div>
    <NuxtLayout name="chat">
      <template #header-button-left>
        <button type="button" @click.prevent="emit('show-screen', SCREEN.SPLASH)" class="size-8 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-full">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M5 12l14 0" />
            <path d="M5 12l6 6" />
            <path d="M5 12l6 -6" />
          </svg>
        </button>
      </template>
      <template #header-center>
        <div class="grid grid-cols-1">
          <img class="block mx-auto w-20 h-20 rounded-full" src="/midudev-avatar.jpg" />
          <span class="text-center text-sm font-bold text-gray-800">Miguel Durán</span>
          <span class="text-center text-xs text-gray-600">@midudev</span>
        </div>
      </template>
      <template #header-button-right>
        <button type="button" @click.prevent="emit('show-screen', SCREEN.SETTINGS)" class="size-8 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-full">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </svg>
        </button>
      </template>
      <template #content>
        <div ref="$messages" class="flex flex-col pl-4 pr-1 items-start gap-4 overflow-y-scroll scrollbar-w-thin scrollbar-black/10">
          <ChatMessage v-for="message in items" :key="message.id" :message />
        </div>
      </template>
      <template #footer>
        <div class="px-4 h-12">
          <form autocomplete="off" @submit="onSubmit">
            <div class="flex items-center gap-2">
              <input ref="$input" type="text" v-model="input" autofocus role="textbox" autocomplete="off" autocapitalize="off" aria-autocomplete="none" autocorrect="off" placeholder="Pregunta algo..." class="py-2 px-4 border border-solid w-full h-12 flex-1 rounded-3xl border-black outline-cyan-500 bg-[#f3f4f6]" />
              <button type="submit" class="p-2 rounded-full text-white bg-cyan-500" :class="{'opacity-25': isLoading}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-8">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" />
                  <path d="M6.5 12h14.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>
