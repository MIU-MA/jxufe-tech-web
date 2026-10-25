/** Keep the visible question intact while fitting an excerpt into the API's 2000-character limit. */
export function buildChatMessage(question: string, context?: string): string {
  if (!context) return question;
  const prefix = "参考资料（节选，仅供回答当前问题）：\n";
  const suffix = `\n\n用户问题：${question}`;
  const available = 2000 - prefix.length - suffix.length;
  if (available <= 0) return question;
  return prefix + context.slice(0, available) + suffix;
}
