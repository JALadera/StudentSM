<template>
  <div class="flex items-center justify-center min-h-screen bg-base">
    <div class="w-full max-w-md space-y-8 p-8 card">
      <!-- Logo/Brand -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-brand mb-2">StudentMS</h1>
        <p class="text-muted">Sign in to your account</p>
      </div>

      <!-- Credentials Info (for demo) -->
      <div class="p-4 rounded-lg bg-red-600/10 border border-red-600/20">
        <p class="text-sm text-muted mb-2">Demo Credentials:</p>
        <div class="text-sm space-y-1">
          <p class="text-base">Username: <span class="text-brand">admin</span></p>
          <p class="text-base">Password: <span class="text-brand">admin</span></p>
        </div>
      </div>

      <!-- Add success message -->
      <div v-if="successMessage" 
           class="p-4 bg-green-900/30 text-green-400 rounded-lg mb-4 text-sm text-center">
        {{ successMessage }}
      </div>

      <!-- Login Form -->
      <LoginForm @success="handleLoginSuccess" />

      <!-- Registration Link -->
      <div class="text-center">
        <p class="text-muted">
          Don't have an account?
          <router-link to="/register" class="text-brand hover:text-red-500 font-medium">
            Register here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'

const route = useRoute()
const router = useRouter()
const successMessage = ref('')

onMounted(() => {
  if (route.query.registered) {
    successMessage.value = 'Registration successful! Please log in.'
  }
})

const handleLoginSuccess = () => {
  router.push('/dashboard')
}
</script>
