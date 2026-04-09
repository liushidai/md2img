import { createRouter, createWebHistory } from 'vue-router'
import DocumentWorkspacePage from '@/features/document-workspace/components/DocumentWorkspacePage.vue'
import { createDocument, listDocuments } from '@/features/document-workspace/api'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      async beforeEnter() {
        const documents = await listDocuments()

        if (documents.length > 0) {
          const latestDocument = documents[0]

          return {
            name: 'document-workspace',
            params: { id: String(latestDocument!.id) },
          }
        }

        const createdDocument = await createDocument()

        return {
          name: 'document-workspace',
          params: { id: String(createdDocument.id) },
        }
      },
      component: { template: '<div />' },
    },
    {
      path: '/documents/:id(\\d+)',
      name: 'document-workspace',
      component: DocumentWorkspacePage,
    },
  ],
})
