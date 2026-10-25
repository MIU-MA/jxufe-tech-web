import { inject, ref, type InjectionKey } from "vue";

export interface AssistantContext {
  title: string;
  content: string;
}
export function createAssistant() {
  const isOpen = ref(false);
  const activated = ref(false);
  const draft = ref("");
  const context = ref<AssistantContext | null>(null);
  function open(question?: string, source?: AssistantContext) {
    if (question !== undefined) draft.value = question;
    if (source !== undefined) context.value = source;
    activated.value = true;
    isOpen.value = true;
  }
  return {
    isOpen,
    activated,
    draft,
    context,
    open,
    close: () => {
      isOpen.value = false;
    },
  };
}
export const assistantKey: InjectionKey<ReturnType<typeof createAssistant>> =
  Symbol("assistant");
export function useAssistant() {
  const assistant = inject(assistantKey);
  if (!assistant) throw new Error("Assistant provider is missing");
  return assistant;
}
