import { defineNuxtPlugin } from '#app'

const STORAGE_KEY = 'multiatendimento-theme'

export default defineNuxtPlugin(() => {
  const savedTheme = localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : prefersDark ? 'dark' : 'light'

  document.documentElement.classList.toggle('dark', theme === 'dark')
})
