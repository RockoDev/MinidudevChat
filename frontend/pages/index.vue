<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'

const { messages, input, handleSubmit } = useChat()
</script>

<template>
  <div class="grid mx-auto xs:p-8 w-full h-[100dvh] max-w-md grid-cols-1 grid-rows-1">
    <div class="grid py-4 grid-cols-1 grid-rows-[auto_1fr_auto] overflow-hidden xs:rounded-3xl xs:shadow-xl bg-white">
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
      <div class="flex flex-col p-4 items-start gap-4 overflow-y-scroll">
        <ChatMessage v-for="message in messages" :key="message.id" :message />
      </div>
      <div class="px-4 h-12">
        <form @submit="handleSubmit">
          <input v-model="input" placeholder="Say something..." class="py-2 px-4 w-full h-12 rounded-3xl bg-[#f3f4f6]" />
        </form>
      </div>
    </div>
  </div>
</template>