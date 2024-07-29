<script setup>
const props = defineProps(['message'])

const isUser = computed(() => props?.message?.role === 'user')
const isThinking = computed(() => props?.message?.role === 'thinking')
const message = computed(() => props?.message?.content?.trim?.() ?? '')
</script>

<template>
  <div v-if="isUser" class="flex w-full items-start justify-end">
    <div class="inline-block p-2 rounded-md text-sm whitespace-pre-wrap bg-cyan-500 text-white">
      {{ message }}
    </div>
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
      <div class="inline-block p-2 rounded-md text-sm whitespace-pre-wrap bg-gray-100">
        {{ message }}
      </div>
    </div>
  </div>
</template>
