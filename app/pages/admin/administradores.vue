<script setup lang="ts">
import { definePageMeta, useFetch, $fetch } from '#imports'
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-guard',
})

const novoEmailAdmin = ref('')
const isAdding = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const { data: admins, pending, refresh } = useFetch('/api/admin/administradores', {
  lazy: false,
})

async function adicionarAdmin() {
  if (!novoEmailAdmin.value || !novoEmailAdmin.value.includes('@')) {
    errorMessage.value = 'Digite um endereço de e-mail válido.'
    return
  }

  isAdding.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $fetch('/api/admin/administradores', {
      method: 'POST',
      body: { email: novoEmailAdmin.value },
    })

    successMessage.value = `Administrador ${novoEmailAdmin.value} adicionado com sucesso! Ao fazer login, ele terá acesso total ao painel.`
    novoEmailAdmin.value = ''
    await refresh()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Erro ao cadastrar administrador.'
  } finally {
    isAdding.value = false
  }
}

async function removerAdmin(userId: string, email: string) {
  if (!confirm(`Tem certeza que deseja remover as permissões de administrador de ${email}?`)) return
  try {
    await $fetch('/api/admin/administradores', {
      method: 'DELETE',
      body: { user_id: userId },
    })
    await refresh()
  } catch (err: any) {
    alert(err?.statusMessage || 'Erro ao remover administrador.')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-[#003B70]">Gestão de Acessos</span>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mt-1">Administradores do Sistema</h1>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
        @click="refresh()"
      >
        <span>🔄 Atualizar Lista</span>
      </button>
    </div>

    <!-- Card de Cadastro de Novo Admin -->
    <div class="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
      <div>
        <h2 class="text-lg font-black text-slate-900">Conceder Permissão de Administrador</h2>
        <p class="text-xs text-slate-500 font-medium mt-0.5">
          Informe o e-mail do usuário. Quando ele fizer login com este e-mail e acessar a rota <code class="bg-slate-100 px-1.5 py-0.5 rounded font-bold">/admin</code>, ele terá acesso total.
        </p>
      </div>

      <!-- Feedback Messages -->
      <div v-if="errorMessage" class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        {{ successMessage }}
      </div>

      <form class="flex flex-col sm:flex-row items-center gap-3 pt-2" @submit.prevent="adicionarAdmin">
        <div class="relative flex-1 w-full">
          <input
            v-model="novoEmailAdmin"
            type="email"
            placeholder="Digite o e-mail do novo administrador..."
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#003B70]"
          />
        </div>

        <button
          type="submit"
          :disabled="isAdding || !novoEmailAdmin"
          class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#003B70] text-white font-extrabold text-xs shadow-md hover:bg-[#002B54] transition disabled:opacity-50 shrink-0"
        >
          {{ isAdding ? 'Concedendo...' : '+ Conceder Acesso Admin' }}
        </button>
      </form>
    </div>

    <!-- Tabela de Administradores Cadastrados -->
    <div class="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-extrabold text-slate-800">Administradores Autorizados</h3>
        <span class="text-xs font-semibold text-slate-400">Total: {{ admins?.length || 0 }}</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[550px]">
          <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
            <tr>
              <th class="py-3.5 px-6">Administrador</th>
              <th class="py-3.5 px-6">User ID</th>
              <th class="py-3.5 px-6">Data de Cadastro</th>
              <th class="py-3.5 px-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <tr v-for="adm in (admins || [])" :key="adm.user_id" class="hover:bg-slate-50/50 transition">
              <td class="py-4 px-6 font-bold text-slate-900">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-full bg-[#003B70]/10 text-[#003B70] font-black flex items-center justify-center text-xs">
                    🛡️
                  </div>
                  <span>{{ adm.email }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-xs text-slate-500 font-mono">
                {{ adm.user_id }}
              </td>
              <td class="py-4 px-6 text-xs text-slate-500">
                {{ adm.created_at ? new Date(adm.created_at).toLocaleString('pt-BR') : '-' }}
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  type="button"
                  class="text-xs font-bold text-red-500 hover:text-red-700 hover:underline"
                  @click="removerAdmin(adm.user_id, adm.email)"
                >
                  Remover Acesso
                </button>
              </td>
            </tr>

            <tr v-if="!admins || admins.length === 0">
              <td colspan="4" class="py-8 px-6 text-center text-xs font-medium text-slate-400">
                Nenhum administrador cadastrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
