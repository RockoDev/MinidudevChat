<script setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if ( 'target' in node ) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const props = defineProps(['message'])

const isUser = computed(() => props?.message?.role === 'user')
const isThinking = computed(() => props?.message?.role === 'thinking')
const message = computed(() => {
  const m = props?.message?.content?.trim?.() ?? ''
  if ( isUser.value ) return m
  return DOMPurify.sanitize(marked.parse(m))
})
</script>

<template>
  <div v-if="isUser" class="flex w-full items-start justify-end">
    <div class="inline-block p-2 rounded-md text-sm whitespace-nowrap bg-cyan-500 text-white">{{ message }}</div>
  </div>
  <div v-else-if="isThinking" class="grid grid-cols-[auto_1fr] gap-4">
    <div>
      <img class="size-8 rounded-full" src="/midudev-avatar.jpg" alt="midudev" />
    </div>
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="size-8 text-slate-400 stroke-current fill-current">
        <circle stroke-width="15" r="15" cx="40" cy="100">
          <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
        </circle>
        <circle stroke-width="15" r="15" cx="100" cy="100">
          <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
        </circle>
        <circle stroke-width="15" r="15" cx="160" cy="100">
          <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
        </circle>
      </svg>
    </div>
  </div>
  <div v-else class="grid grid-cols-[auto_1fr] gap-4">
    <div>
      <img class="size-8 rounded-full" src="/midudev-avatar.jpg" alt="midudev" />
    </div>
    <div>
      <div class="inline-block p-2 rounded-md text-sm bg-gray-100 message" v-html="message"></div>
    </div>
  </div>
</template>
