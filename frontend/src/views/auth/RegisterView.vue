<template>
  <div class="flex items-center justify-center min-h-screen bg-base">
    <div class="w-full max-w-md space-y-8 p-8 card">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-brand mb-2">Create Account</h1>
        <p class="text-muted">Register as a new teacher</p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- Personal Information -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted">First Name</label>
              <input v-model="form.first_name" type="text" required class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-muted">Last Name</label>
              <input v-model="form.last_name" type="text" required class="input" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted">Username</label>
            <input v-model="form.username" type="text" required class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-muted">Email</label>
            <input v-model="form.email" type="email" required class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-muted">Password</label>
            <input v-model="form.password" type="password" required class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-muted">Confirm Password</label>
            <input v-model="form.confirm_password" type="password" required class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-muted">Phone (Optional)</label>
            <input v-model="form.phone" type="tel" class="input" />
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="p-4 bg-red-900/30 text-red-400 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Validation errors -->
        <div v-if="validationErrors.length > 0" class="p-4 bg-red-900/30 rounded-lg">
          <ul class="list-disc list-inside text-red-400">
            <li v-for="err in validationErrors" :key="err" class="text-sm">
              {{ err }}
            </li>
          </ul>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="btn btn-primary w-full disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <!-- Login link -->
        <div class="text-center">
          <p class="text-muted">
            Already have an account?
            <router-link to="/login" class="text-brand hover:text-red-500 font-medium">
              Sign in here
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/api/auth'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const validationErrors = ref([])

const form = ref({
  username: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: ''
})

const validateForm = () => {
  validationErrors.value = []
  
  // Required fields
  const requiredFields = ['username', 'password', 'confirm_password', 'email', 'first_name', 'last_name']
  for (const field of requiredFields) {
    if (!form.value[field]) {
      validationErrors.value.push(`${field.replace('_', ' ')} is required`)
    }
  }

  // Password validation
  const passwordValidation = authService.validatePassword(form.value.password)
  if (!passwordValidation.isValid) {
    validationErrors.value.push(...passwordValidation.errors)
  }

  // Password match
  if (form.value.password !== form.value.confirm_password) {
    validationErrors.value.push('Passwords do not match')
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    validationErrors.value.push('Invalid email format')
  }

  return validationErrors.value.length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authService.register(form.value)
    router.push('/login?registered=true')
  } catch (err) {
    error.value = err.message || 'Registration failed'
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}
</script>