<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import type { DocumentDetail, DocumentSummary } from '@md2img/shared'
import EditorPreview from '@/features/editor/components/EditorPreview.vue'
import EditorStatusBadge from '@/features/editor/components/EditorStatusBadge.vue'
import {
  createDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from '@/features/document-workspace/api'
import { renderMarkdownHtml } from '@/features/editor/utils/markdown'

type SaveState = 'saved' | 'dirty' | 'saving' | 'save-error'

const route = useRoute()
const router = useRouter()

const documents = ref<DocumentSummary[]>([])
const title = ref('')
const markdownContent = ref('')
const savedTitle = ref('')
const savedMarkdownContent = ref('')
const isListLoading = ref(true)
const isDocumentLoading = ref(true)
const isCreating = ref(false)
const loadError = ref('')
const saveError = ref('')
const listError = ref('')
const saveState = ref<SaveState>('saved')
const allowNextRouteChange = ref(false)
let loadRequestToken = 0
let saveRequestToken = 0

const currentDocumentId = computed(() => {
  const value = Number(route.params.id)
  return Number.isFinite(value) ? value : null
})

const isDirty = computed(
  () => title.value !== savedTitle.value || markdownContent.value !== savedMarkdownContent.value,
)
const previewHtml = computed(() => renderMarkdownHtml(markdownContent.value))
const isPreviewEmpty = computed(() => !markdownContent.value.trim())

const statusMeta = computed(() => {
  if (isDocumentLoading.value) {
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

watch([title, markdownContent], () => {
  if (isDocumentLoading.value || saveState.value === 'saving') {
    return
  }

  if (isDirty.value) {
    saveState.value = 'dirty'
    return
  }

  saveError.value = ''
  saveState.value = 'saved'
})

function applyDocument(document: DocumentDetail) {
  title.value = document.title
  markdownContent.value = document.markdownContent
  savedTitle.value = document.title
  savedMarkdownContent.value = document.markdownContent
  saveError.value = ''
  saveState.value = 'saved'
}

function mergeDocumentSummary(document: DocumentDetail) {
  const summary: DocumentSummary = {
    id: document.id,
    title: document.title,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }

  const nextDocuments = documents.value.filter((item) => item.id !== document.id)
  nextDocuments.unshift(summary)
  nextDocuments.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  documents.value = nextDocuments
}

async function loadDocuments() {
  isListLoading.value = true
  listError.value = ''

  try {
    documents.value = await listDocuments()
  } catch (error) {
    listError.value = error instanceof Error ? error.message : '加载文档列表失败'
  } finally {
    isListLoading.value = false
  }
}

async function loadCurrentDocument(id: number) {
  const requestToken = ++loadRequestToken
  isDocumentLoading.value = true
  loadError.value = ''

  try {
    const document = await getDocument(id)

    if (requestToken !== loadRequestToken || currentDocumentId.value !== id) {
      return
    }

    applyDocument(document)
    mergeDocumentSummary(document)
  } catch (error) {
    if (requestToken !== loadRequestToken || currentDocumentId.value !== id) {
      return
    }

    loadError.value = error instanceof Error ? error.message : '加载文档失败'
  } finally {
    if (requestToken === loadRequestToken && currentDocumentId.value === id) {
      isDocumentLoading.value = false
    }
  }
}

function confirmDiscardChanges() {
  if (saveState.value === 'saving') {
    window.alert('当前文档正在保存，请稍候再切换。')
    return false
  }

  if (!isDirty.value) {
    return true
  }

  return window.confirm('当前文档有未保存修改，确认放弃并切换吗？')
}

async function navigateToDocument(id: number) {
  if (currentDocumentId.value === id) {
    return
  }

  if (!confirmDiscardChanges()) {
    return
  }

  allowNextRouteChange.value = true
  await router.push({ name: 'document-workspace', params: { id: String(id) } })
}

async function handleCreateDocument() {
  if (isCreating.value) {
    return
  }

  if (!confirmDiscardChanges()) {
    return
  }

  isCreating.value = true
  listError.value = ''

  try {
    const document = await createDocument()
    mergeDocumentSummary(document)
    allowNextRouteChange.value = true
    await router.push({ name: 'document-workspace', params: { id: String(document.id) } })
  } catch (error) {
    listError.value = error instanceof Error ? error.message : '新建文档失败'
  } finally {
    isCreating.value = false
  }
}

async function handleSave() {
  if (!currentDocumentId.value || !isDirty.value || saveState.value === 'saving') {
    return
  }

  const targetDocumentId = currentDocumentId.value
  const requestToken = ++saveRequestToken
  saveState.value = 'saving'
  saveError.value = ''

  try {
    const document = await updateDocument(targetDocumentId, {
      title: title.value,
      markdownContent: markdownContent.value,
    })

    if (requestToken !== saveRequestToken || currentDocumentId.value !== targetDocumentId) {
      return
    }

    applyDocument(document)
    mergeDocumentSummary(document)
  } catch (error) {
    if (requestToken !== saveRequestToken || currentDocumentId.value !== targetDocumentId) {
      return
    }

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

watch(
  currentDocumentId,
  (id) => {
    if (!id) {
      loadError.value = '文档地址无效'
      return
    }

    void loadCurrentDocument(id)
  },
  { immediate: true },
)

onBeforeRouteUpdate((to) => {
  if (allowNextRouteChange.value) {
    allowNextRouteChange.value = false
    return true
  }

  if (to.params.id === route.params.id) {
    return true
  }

  return confirmDiscardChanges()
})

onBeforeRouteLeave(() => {
  if (allowNextRouteChange.value) {
    allowNextRouteChange.value = false
    return true
  }

  return confirmDiscardChanges()
})

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  void loadDocuments()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <main class="workspace-page">
    <aside class="workspace-sidebar">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-eyebrow">多文档工作台</p>
          <h1 class="sidebar-title">文档</h1>
        </div>

        <button class="primary-button" :disabled="isCreating" @click="handleCreateDocument">
          {{ isCreating ? '新建中...' : '新建文档' }}
        </button>
      </div>

      <p v-if="listError" class="message message-error">{{ listError }}</p>

      <div v-if="isListLoading" class="sidebar-empty">正在加载文档列表...</div>
      <div v-else-if="documents.length === 0" class="sidebar-empty">暂无文档</div>
      <nav v-else class="document-list" aria-label="文档列表">
        <button
          v-for="document in documents"
          :key="document.id"
          class="document-item"
          :class="{ 'is-active': document.id === currentDocumentId }"
          @click="navigateToDocument(document.id)"
        >
          <span class="document-item-title">{{ document.title }}</span>
          <span class="document-item-time">{{ document.updatedAt }}</span>
        </button>
      </nav>
    </aside>

    <section class="workspace-main">
      <header class="editor-header">
        <div class="editor-meta">
          <p class="editor-eyebrow">Markdown 编辑器</p>
          <input v-model="title" class="title-input" placeholder="请输入文档标题" />
        </div>

        <div class="editor-actions">
          <EditorStatusBadge :label="statusMeta.label" :tone="statusMeta.tone" />
          <button class="primary-button" :disabled="isDocumentLoading || !isDirty || saveState === 'saving'" @click="handleSave">
            {{ saveState === 'saving' ? '保存中...' : '保存' }}
          </button>
        </div>
      </header>

      <p v-if="loadError" class="message message-error">
        {{ loadError }}
        <button class="text-button" @click="currentDocumentId && loadCurrentDocument(currentDocumentId)">
          重试
        </button>
      </p>
      <p v-else-if="saveError" class="message message-error">{{ saveError }}</p>

      <section class="editor-layout">
        <section class="panel">
          <header class="panel-header">Markdown 编辑区</header>
          <div v-if="isDocumentLoading" class="empty-state">正在加载文档...</div>
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
    </section>
  </main>
</template>

<style scoped>
.workspace-page {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 100vh;
  background: #f3f4f6;
  color: #111827;
}

.workspace-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-eyebrow,
.editor-eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.sidebar-title {
  margin: 0;
  font-size: 28px;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
}

.document-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.document-item.is-active {
  border-color: #2563eb;
  background: #eff6ff;
}

.document-item-title {
  font-weight: 600;
  color: #111827;
}

.document-item-time {
  font-size: 12px;
  color: #6b7280;
}

.sidebar-empty,
.empty-state {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6b7280;
  text-align: center;
}

.workspace-main {
  min-width: 0;
  padding: 24px;
  box-sizing: border-box;
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.editor-meta {
  flex: 1;
  min-width: 0;
}

.title-input {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  outline: none;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.primary-button,
.text-button {
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.primary-button {
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
}

.primary-button:disabled {
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

@media (max-width: 1120px) {
  .workspace-page {
    grid-template-columns: 1fr;
  }

  .workspace-sidebar {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 960px) {
  .workspace-sidebar,
  .workspace-main {
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
