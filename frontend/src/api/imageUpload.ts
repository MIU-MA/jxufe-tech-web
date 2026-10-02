import { adminFetch } from './adminAuth'

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp'
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/bmp': 'bmp', 'image/x-ms-bmp': 'bmp',
}
const IMAGE_EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', bmp: 'image/bmp',
}

export async function uploadArticleImage(file: File, token: string, signal: AbortSignal): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('单张图片不能超过 10 MB')
  if (!file.size) throw new Error('图片文件为空')
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined
  const mime = file.type || (extension ? IMAGE_EXTENSIONS[extension] : '')
  if (!IMAGE_TYPES[mime] || (extension && !IMAGE_EXTENSIONS[extension])) {
    throw new Error('只支持 JPG、PNG、WebP、GIF、BMP 图片')
  }
  if (!token) throw new Error('请先登录管理后台')

  const filename = extension ? file.name : `${file.name || 'image'}.${IMAGE_TYPES[mime]}`
  const image = file.type ? file : new File([file], filename, { type: mime })
  const form = new FormData()
  form.append('image', image, filename)
  const response = await adminFetch('/api/upload/image', {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form, signal,
  })
  const data = await response.json().catch(() => null) as { url?: unknown; message?: unknown } | null
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message
      : Array.isArray(data?.message) ? data.message.filter(item => typeof item === 'string').join('；') : ''
    throw new Error(message || (response.status === 413 ? '图片过大，请使用小于 10 MB 的图片' : `上传失败（${response.status}），请重试`))
  }
  if (typeof data?.url !== 'string' || !/^\/uploads\/[\w-]+\.(?:jpe?g|png|webp|gif|bmp)$/i.test(data.url)) {
    throw new Error('上传响应缺少有效的图片地址，请重试')
  }
  return data.url
}
