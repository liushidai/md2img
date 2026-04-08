<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHealth } from './features/health/api'

const message = ref('loading...')

onMounted(async () => {
  try {
    const data = await getHealth()
    message.value = JSON.stringify(data, null, 2)
  } catch (error) {
    message.value = `request failed: ${error instanceof Error ? error.message : String(error)}`
  }
})
</script>

<template>
  <main style="padding: 24px">
    <h1>md2img</h1>
    <pre>{{ message }}</pre>
  </main>
</template>
