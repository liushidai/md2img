import type {
  CreateDocumentRequest,
  CreateDocumentResponse,
  GetDocumentResponse,
  ListDocumentsResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
} from '@md2img/shared'

const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL is not set')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = `请求失败（HTTP ${response.status}）`

    try {
      const data = (await response.json()) as { message?: string }
      if (data.message) {
        message = data.message
      }
    } catch {
      // 忽略非 JSON 错误体
    }

    throw new Error(message)
  }

  return (await response.json()) as T
}

export function listDocuments(): Promise<ListDocumentsResponse> {
  return request<ListDocumentsResponse>('/api/documents')
}

export function createDocument(
  payload: CreateDocumentRequest = {},
): Promise<CreateDocumentResponse> {
  return request<CreateDocumentResponse>('/api/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getDocument(id: number): Promise<GetDocumentResponse> {
  return request<GetDocumentResponse>(`/api/documents/${id}`)
}

export function updateDocument(
  id: number,
  payload: UpdateDocumentRequest,
): Promise<UpdateDocumentResponse> {
  return request<UpdateDocumentResponse>(`/api/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
