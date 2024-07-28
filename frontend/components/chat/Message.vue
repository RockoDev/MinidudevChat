<script setup>
const props = defineProps(['message'])

const isUser = computed(() => props?.message?.role === 'user')
const message = computed(() => props?.message?.content?.trim?.() ?? '')
</script>

<template>
  <div v-if="isUser" class="flex w-full items-start justify-end">
    <div class="inline-block p-2 rounded-md text-sm whitespace-pre-wrap bg-blue-500 text-white">
      {{ message }}
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
