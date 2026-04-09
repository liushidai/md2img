<script setup lang="ts">
defineProps<{
  label: string
  tone: 'default' | 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <span class="status-badge" :data-tone="tone">{{ label }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  background: #e5e7eb;
  color: #374151;
}

.status-badge[data-tone='success'] {
  background: #dcfce7;
  color: #166534;
}

.status-badge[data-tone='warning'] {
  background: #fef3c7;
  color: #92400e;
}

.status-badge[data-tone='danger'] {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
