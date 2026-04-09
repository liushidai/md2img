<script setup lang="ts">
defineProps<{
  html: string
  isEmpty: boolean
}>()
</script>

<template>
  <section class="panel">
    <header class="panel-header">HTML 预览</header>
    <div v-if="isEmpty" class="empty-state">请输入 Markdown 内容，预览会显示在这里。</div>
    <article v-else class="preview-content" v-html="html" />
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6b7280;
  text-align: center;
}

.preview-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  color: #111827;
  line-height: 1.7;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.preview-content :deep(h1:first-child),
.preview-content :deep(h2:first-child),
.preview-content :deep(h3:first-child),
.preview-content :deep(p:first-child) {
  margin-top: 0;
}

.preview-content :deep(pre),
.preview-content :deep(code) {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.preview-content :deep(pre) {
  overflow: auto;
  padding: 12px;
  border-radius: 8px;
  background: #111827;
  color: #f9fafb;
}

.preview-content :deep(blockquote) {
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #d1d5db;
  color: #4b5563;
}

.preview-content :deep(table) {
  border-collapse: collapse;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
}

.preview-content :deep(img) {
  max-width: 100%;
}
</style>
