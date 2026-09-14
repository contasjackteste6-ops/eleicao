// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  supabase: {
    useSsrCookies: true,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [
        '/login',
        '/esquecisenha',
        '/redefinirsenha',
      ],
    },
  },
})
