<!-- frontend/src/App.vue -->
<template>
  <div class="min-h-screen transition-colors duration-200" :class="{ 'dark': themeStore.isDark }">
    <NavBar v-if="showNavBar" />
    <div class="pt-16"> <!-- Add padding-top to account for fixed navbar -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/common/NavBar.vue'
import { authService } from '@/services/api/auth.js'
import { useThemeStore } from '@/stores/theme'
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const themeStore = useThemeStore()

const showNavBar = computed(() => {
  return route.path !== '/login' && authService.isAuthenticated()
})

watch(() => themeStore.isDark, (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

onMounted(() => {
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style>

</style>
