<script setup lang="ts">
const screen = ref('splash')
const onShowScreen = (value: string) => screen.value = value

import Chat from '@/components/chat.vue'
import Settings from '@/components/settings.vue'
import Splash from '@/components/splash.vue'

const component = computed(() => (({
  chat: Chat,
  settings: Settings,
})[screen.value] ?? Splash))
</script>

<template>
  <component :is="component" @show-screen="onShowScreen" />
</template>
