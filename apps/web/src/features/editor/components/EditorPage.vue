<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CurrentDocument } from '@md2img/shared'
import { getCurrentDocument, saveCurrentDocument } from '@/features/editor/api'
import EditorPreview from '@/features/editor/components/EditorPreview.vue'
import EditorStatusBadge from '@/features/editor/components/EditorStatusBadge.vue'
import { deriveDocumentTitle, renderMarkdownHtml } from '@/features/editor/utils/markdown'

type SaveState = 'saved' | 'dirty' | 'saving' | 'save-error'

const markdownContent = ref('')
const savedMarkdownContent = ref('')
const isLoading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saveState = ref<SaveState>('saved')

const isDirty = computed(() => markdownContent.value !== savedMarkdownContent.value)
const title = computed(() => deriveDocumentTitle(markdownContent.value))
const previewHtml = computed(() => renderMarkdownHtml(markdownContent.value))
const isPreviewEmpty = computed(() => !markdownContent.value.trim())

const statusMeta = computed(() => {
  if (isLoading.value) {
    return { label: '加载中', tone: 'default' as const }
  }

  if (saveState.value === 'saving') {
    return { label: '保存中', tone: 'default' as const }
  }

  if (saveState.value === 'save-error') {
    return { label: '保存失败', tone: 'danger' as const }
  }

  if (isDirty.value) {
    return { label: '未保存', tone: 'warning' as const }
  }

  return { label: '已保存', tone: 'success' as const }
})

watch(markdownContent, () => {
  if (isLoading.value || saveState.value === 'saving') {
    return
  }

  if (isDirty.value) {
    saveState.value = 'dirty'
    return
  }

  saveError.value = ''
  saveState.value = 'saved'
})

function applyDocument(document: CurrentDocument) {
  markdownContent.value = document.markdownContent
  savedMarkdownContent.value = document.markdownContent
  saveError.value = ''
  saveState.value = 'saved'
}

async function loadDocument() {
  isLoading.value = true
  loadError.value = ''

  try {
    const document = await getCurrentDocument()
    applyDocument(document)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!isDirty.value || saveState.value === 'saving') {
    return
  }

  saveState.value = 'saving'
  saveError.value = ''

  try {
    const document = await saveCurrentDocument(markdownContent.value)
    applyDocument(document)
  } catch (error) {
    saveState.value = 'save-error'
    saveError.value = error instanceof Error ? error.message : '保存失败，请稍后重试'
  }
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!isDirty.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  void loadDocument()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <main class="editor-page">
    <header class="editor-header">
      <div>
        <p class="editor-eyebrow">Markdown 编辑器</p>
        <h1 class="editor-title">{{ title }}</h1>
      </div>

      <div class="editor-actions">
        <EditorStatusBadge :label="statusMeta.label" :tone="statusMeta.tone" />
        <button class="save-button" :disabled="isLoading || !isDirty || saveState === 'saving'" @click="handleSave">
          {{ saveState === 'saving' ? '保存中...' : '保存' }}
        </button>
      </div>
    </header>

    <p v-if="loadError" class="message message-error">
      {{ loadError }}
      <button class="text-button" @click="loadDocument">重试</button>
    </p>

    <p v-else-if="saveError" class="message message-error">{{ saveError }}</p>

    <section class="editor-layout">
      <section class="panel">
        <header class="panel-header">Markdown 编辑区</header>
        <div v-if="isLoading" class="empty-state">正在加载文档...</div>
        <textarea
          v-else
          v-model="markdownContent"
          class="editor-textarea"
          placeholder="# 在这里开始编写\n\n输入 Markdown 或安全的 HTML 片段"
          spellcheck="false"
        />
      </section>

      <EditorPreview :html="previewHtml" :is-empty="isPreviewEmpty" />
    </section>
  </main>
</template>

<style scoped>
.editor-page {
  min-height: 100vh;
  padding: 24px;
  background: #f3f4f6;
  color: #111827;
  box-sizing: border-box;
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.editor-eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.editor-title {
  margin: 0;
  font-size: 32px;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-button,
.text-button {
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.save-button {
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.text-button {
  padding: 0;
  margin-left: 8px;
  color: inherit;
  background: transparent;
  text-decoration: underline;
}

.message {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: 12px;
}

.message-error {
  background: #fee2e2;
  color: #991b1b;
}

.editor-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-height: calc(100vh - 160px);
}

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

.editor-textarea {
  flex: 1;
  min-height: 420px;
  padding: 16px;
  border: none;
  resize: none;
  outline: none;
  font: inherit;
  line-height: 1.6;
  color: #111827;
  background: transparent;
  box-sizing: border-box;
}

@media (max-width: 960px) {
  .editor-page {
    padding: 16px;
  }

  .editor-header {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-actions {
    justify-content: space-between;
  }

  .editor-layout {
    grid-template-columns: 1fr;
  }
}
</style>
