<script setup lang="ts">
import { ref, inject, type Ref } from 'vue'
import { fetchArticles, type Article } from '../../../api/articles'
import ArticleEditor from './ArticleEditor.vue'
import ArticleTable from './ArticleTable.vue'
import MarkdownUploader from './MarkdownUploader.vue'
import DeleteModal from '../DeleteModal.vue'

const token = inject<Ref<string>>('token')!

// ==================== Articles ====================
const articles = ref<Article[]>([])
const articlesLoading = ref(false)
const articlesError = ref('')

async function loadArticles() {
  articlesLoading.value = true; articlesError.value = ''
  try { articles.value = await fetchArticles() } catch { articlesError.value = '加载失败' } finally { articlesLoading.value = false }
}

// ==================== Editor ====================
const editorMode = ref<'create' | 'edit'>('create')
const editingArticle = ref<Article | null>(null)
const saving = ref(false)
const saveError = ref('')

function openCreate() { editorMode.value = 'create'; editingArticle.value = null; saveError.value = '' }
function openEdit(article: Article) { editorMode.value = 'edit'; editingArticle.value = article; saveError.value = '' }
function closeEditor() { editorMode.value = 'create'; editingArticle.value = null }

async function handleSave(payload: { title: string; content: string; summary: string | null; publishedAt: string | null }) {
  saving.value = true; saveError.value = ''
  try {
    if (editorMode.value === 'create') {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('创建失败')
    } else if (editingArticle.value) {
      const res = await fetch(`/api/articles/${editingArticle.value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('更新失败')
    }
    closeEditor()
    await loadArticles()
  } catch (e: any) { saveError.value = e.message || '保存失败' } finally { saving.value = false }
}

// ==================== Delete ====================
const deleting = ref(false)
const deleteError = ref('')
const deleteConfirmId = ref<number | null>(null)
const deleteTargetName = ref('')

function confirmDelete(article: Article) { deleteConfirmId.value = article.id; deleteTargetName.value = article.title; deleteError.value = '' }

async function doDelete() {
  if (deleteConfirmId.value === null) return
  deleting.value = true; deleteError.value = ''
  try {
    const res = await fetch(`/api/articles/${deleteConfirmId.value}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.value}` } })
    if (!res.ok) throw new Error('删除失败')
    deleteConfirmId.value = null
    await loadArticles()
  } catch (e: any) { deleteError.value = e.message || '删除失败' } finally { deleting.value = false }
}

// ====== 初始加载 ======
loadArticles()
</script>

<template>
  <div>
    <!-- 顶栏按钮 -->
    <div class="flex gap-2.5 flex-wrap mb-6">
      <button
        class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer text-white transition-opacity duration-200 hover:opacity-85"
        :style="{ backgroundColor: 'var(--color-primary)' }"
        @click="openCreate"
      >+ 新建文章</button>
      <button
        class="border-none rounded-lg py-2.5 px-6 text-[0.92em] cursor-pointer transition-opacity duration-200 hover:opacity-80"
        :style="{ backgroundColor: 'var(--color-bg-alt)', color: 'var(--color-text-secondary)' }"
        @click="loadArticles"
      >刷新</button>
    </div>

    <!-- 加载 / 错误 -->
    <p v-if="articlesLoading" class="text-center py-10" :style="{ color: 'var(--color-text-muted)' }">加载中…</p>
    <p v-else-if="articlesError" class="text-[#c0392b] text-[0.9em] mt-1">{{ articlesError }}</p>

    <template v-else>
      <ArticleEditor
        v-if="editorMode === 'create' || editingArticle"
        :mode="editorMode"
        :article="editingArticle"
        :saving="saving"
        :error="saveError"
        @save="handleSave"
        @cancel="closeEditor"
      />
      <MarkdownUploader :token="token" @done="loadArticles" />
      <ArticleTable :articles="articles" @edit="openEdit" @delete="confirmDelete" />
    </template>

    <DeleteModal
      v-if="deleteConfirmId !== null"
      :target-name="deleteTargetName"
      :deleting="deleting"
      :error="deleteError"
      @confirm="doDelete"
      @cancel="deleteConfirmId = null"
    />
  </div>
</template>
