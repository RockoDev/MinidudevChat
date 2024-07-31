<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'

const isWriting = ref(false)
const $messages = ref<HTMLDivElement | null>(null)

const { messages, input, handleSubmit, isLoading } = useChat({
  onResponse: () => { isWriting.value = true },
  onFinish: () => { isWriting.value = false },
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

const onSubmit = (event: Event) => {
  event.preventDefault()
  if ( !isLoading.value ) handleSubmit(event)
}
</script>

<template>
  <div class="grid mx-auto xs:p-8 w-full h-[100dvh] max-w-md grid-cols-1 grid-rows-1">
    <div class="grid py-4 grid-cols-1 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden xs:rounded-3xl xs:shadow-xl bg-white">
      <div class="grid grid-cols-[auto_1fr_auto] items-center">
        <div></div>
        <div>
          <img class="block mx-auto w-20 h-20 rounded-full" src="/midudev-avatar.jpg" />
        </div>
        <div></div>
        <div class="grid grid-cols-1 col-span-3">
          <span class="text-center text-sm font-bold text-gray-800">Miguel Durán</span>
          <span class="text-center text-xs text-gray-600">@midudev</span>
        </div>
      </div>
      <div ref="$messages" class="flex flex-col pl-4 pr-1 items-start gap-4 overflow-y-scroll scrollbar-w-thin scrollbar-black/10">
        <ChatMessage v-for="message in items" :key="message.id" :message />
      </div>
      <div class="px-4 h-12">
        <form autocomplete="off" @submit="onSubmit">
          <div class="flex items-center gap-2">
            <input type="text" v-model="input" autofocus role="textbox" autocomplete="off" autocapitalize="off" aria-autocomplete="none" autocorrect="off" placeholder="Pregunta algo..." class="py-2 px-4 w-full h-12 flex-1 rounded-3xl outline-cyan-500 bg-[#f3f4f6]" />
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
    </div>
  </div>
</template>
