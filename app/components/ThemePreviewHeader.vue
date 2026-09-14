<template>
  <header class="rounded-2xl border border-border bg-surface p-6 shadow-soft dark:border-border-dark dark:bg-surface-dark">
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <p class="text-sm font-semibold uppercase text-primary-600 dark:text-primary-300">
          Multiatendimento WhatsApp
        </p>
        <h1 class="mt-2 text-3xl font-bold">
          Teste rapido do Tailwind
        </h1>
        <p class="mt-3 max-w-2xl text-sm text-foreground-lightSecondary dark:text-foreground-darkSecondary">
          Uma pagina inicial temporaria para validar cores, espacamentos, bordas, sombras e estados do tema.
        </p>
      </div>
      <slot name="actions" />
    </div>

    <div class="mt-5 flex flex-wrap gap-3">
      <button class="min-h-touch rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600">
        Nova conversa
      </button>
      <button class="min-h-touch rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-foreground-lightSecondary transition hover:bg-surface-hover dark:border-border-dark dark:bg-surface-dark dark:text-foreground-darkSecondary dark:hover:bg-surface-dark-hover">
        Ver fila
      </button>
    </div>
  </header>
</template>
