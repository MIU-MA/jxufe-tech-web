/** 站点公告日期固定为北京时间，确保构建机与浏览器输出一致。 */
export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso))
}

/** datetime-local 使用浏览器本地时间，不接受 UTC 时间。 */
export function toLocalDateTime(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function toPublishedAt(value: string, original?: string | null): string | null {
  if (!value) return null
  // 只改标题/正文时保留原始秒数和毫秒，避免时间精度丢失。
  if (original && value === toLocalDateTime(original)) return original
  return new Date(value).toISOString()
}
