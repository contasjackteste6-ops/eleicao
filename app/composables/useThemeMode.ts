import { computed, onMounted, ref, watch } from 'vue'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'multiatendimento-theme'
const mode = ref<ThemeMode>('light')

export function useThemeMode() {
  const label = computed(() => mode.value === 'dark' ? 'Modo dark' : 'Modo light')

  function setTheme(value: ThemeMode): void {
    mode.value = value
  }

  function toggleTheme(): void {
    setTheme(mode.value === 'dark' ? 'light' : 'dark')
  }

  watch(mode, (value) => {
    document.documentElement.classList.toggle('dark', value === 'dark')
    localStorage.setItem(STORAGE_KEY, value)
  }, { flush: 'post' })

  onMounted(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY)

    mode.value = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  return {
    label,
    mode,
    setTheme,
    toggleTheme,
  }
}
