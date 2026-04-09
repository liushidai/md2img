import { eden } from '@/lib/eden'
import type { CurrentDocument } from '@md2img/shared'

function ensureDocument(data: CurrentDocument | null, action: string): CurrentDocument {
  if (!data) {
    throw new Error(`${action}响应为空`)
  }

  return data
}

export async function getCurrentDocument(): Promise<CurrentDocument> {
  const { data, error } = await eden.api.documents.current.get()

  if (error) {
    throw new Error(`加载失败（HTTP ${error.status}）`)
  }

  return ensureDocument(data, '加载文档')
}

export async function saveCurrentDocument(markdownContent: string): Promise<CurrentDocument> {
  const { data, error } = await eden.api.documents.current.put({ markdownContent })

  if (error) {
    throw new Error(`保存失败（HTTP ${error.status}）`)
  }

  return ensureDocument(data, '保存文档')
}
