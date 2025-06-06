<!-- frontend/src/App.vue -->
<template>
  <div class="min-h-screen transition-colors duration-200" :class="{ 'dark': themeStore.isDark }">
    <NavBar v-if="showNavBar" />
    <div class="pt-16"> <!-- Add padding-top to account for fixed navbar -->
      <router-view />
    </div>
    <Toast />
  </div>
</template>

<style>
/* Custom toast styles */
.Vue-Toastification__toast {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.Vue-Toastification__toast--success {
  background-color: #10B981;
  color: white;
}

.Vue-Toastification__toast--error {
  background-color: #EF4444;
  color: white;
}

.Vue-Toastification__toast--warning {
  background-color: #F59E0B;
  color: #1F2937;
}

.Vue-Toastification__toast--info {
  background-color: #3B82F6;
  color: white;
}
</style>

<script setup>
import NavBar from '@/components/common/NavBar.vue'
import { authService } from '@/services/api/auth.js'
import { useThemeStore } from '@/stores/theme'
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// Initialize toast
const toast = useToast()

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
