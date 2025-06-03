<!-- frontend/src/components/auth/LoginForm.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-4">
          <!-- Username field -->
          <div>
            <label for="username" class="block text-sm font-medium text-muted">
              Username
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="input"
              :disabled="loading"
              autocomplete="username"
            />
          </div>

          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              :disabled="loading"
              autocomplete="current-password"
            />
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading || !isValid"
          class="btn btn-primary w-full"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authService } from '@/services/api/auth'

const emit = defineEmits(['success'])

const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const isValid = computed(() => {
  return form.value.username.length > 0 && form.value.password.length > 0
})

const handleLogin = async () => {
  if (!isValid.value) return
  
  loading.value = true
  error.value = ''
  
  try {
    await authService.login(form.value)
    emit('success')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
