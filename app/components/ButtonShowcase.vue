<template>
  <section class="rounded-2xl border border-border bg-surface p-5 shadow-panel dark:border-border-dark dark:bg-surface-dark">
    <div class="flex flex-col gap-1">
      <h2 class="text-xl font-semibold">
        Botoes do tema
      </h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        Variacoes principais para testar estados, cores e contraste.
      </p>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <div class="flex flex-wrap gap-3">
        <button class="min-h-touch rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white shadow-focus transition hover:bg-primary-600">
          Primary
        </button>
        <button class="min-h-touch rounded-lg bg-secondary-500 px-5 text-sm font-semibold text-white transition hover:bg-secondary-600">
          Secondary
        </button>
        <button class="min-h-touch rounded-lg bg-success-500 px-5 text-sm font-semibold text-white transition hover:bg-success-600">
          Success
        </button>
        <button class="min-h-touch rounded-lg bg-info-500 px-5 text-sm font-semibold text-white transition hover:bg-info-600">
          Info
        </button>
        <button class="min-h-touch rounded-lg bg-warning-500 px-5 text-sm font-semibold text-white transition hover:bg-warning-600">
          Warning
        </button>
        <button class="min-h-touch rounded-lg bg-danger-500 px-5 text-sm font-semibold text-white shadow-focus-danger transition hover:bg-danger-600">
          Danger
        </button>
      </div>

      <div class="flex flex-wrap gap-3">
        <button class="min-h-touch rounded-lg border border-primary-500 bg-transparent px-5 text-sm font-semibold text-primary-600 transition hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950">
          Outline primary
        </button>
        <button class="min-h-touch rounded-lg border border-border bg-surface px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-border-dark dark:bg-surface-dark dark:text-neutral-100 dark:hover:bg-surface-dark-muted">
          Outline neutral
        </button>
        <button class="min-h-touch rounded-lg px-5 text-sm font-semibold text-primary-600 transition hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-950">
          Ghost primary
        </button>
        <button class="min-h-touch rounded-lg px-5 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-900">
          Ghost danger
        </button>
        <button class="min-h-touch rounded-lg bg-neutral-200 px-5 text-sm font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          Disabled
        </button>
      </div>
    </div>
  </section>
</template>
