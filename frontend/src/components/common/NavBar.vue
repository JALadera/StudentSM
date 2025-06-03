<!-- frontend/src/components/common/NavBar.vue -->
<template>
  <nav class="bg-base fixed w-full z-50 transition-all duration-300 h-16">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex items-center">
            <span class="text-red-600 text-2xl font-bold">StudentMS</span>
          </router-link>
        </div>

        <!-- Center - Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path"
            class="text-muted hover:text-base theme-transition"
            :class="{ 'text-base font-medium': isActivePath(link.path) }"
          >
            {{ link.name }}
          </router-link>
        </div>

        <!-- Right side -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            class="p-2 text-muted hover:text-base rounded-full hover:bg-elevated theme-transition"
          >
            <!-- Sun icon for dark mode -->
            <svg
              v-if="themeStore.isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <!-- Moon icon for light mode -->
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- User Menu Button - existing code -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center text-gray-300 hover:text-white"
            >
              <div class="h-8 w-8 rounded bg-red-600 flex items-center justify-center">
                <span class="text-sm font-medium">
                  {{ userInitials }}
                </span>
              </div>
            </button>

            <!-- Desktop Dropdown Menu -->
            <div v-if="showUserMenu"
                 class="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-md shadow-lg py-1 border border-gray-800">
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                @click="showUserMenu = false"
              >
                Profile
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button - existing code -->
        <div class="flex items-center md:hidden">
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="text-gray-400 hover:text-white focus:outline-none"
          >
            <svg 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                v-if="!isMobileMenuOpen"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden">
      <div class="bg-[#1a1a1a] border-t border-gray-800 pt-2 pb-3">
        <!-- Mobile Navigation Links -->
        <router-link 
          v-for="link in navLinks" 
          :key="link.path"
          :to="link.path"
          class="block px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          :class="{ 'bg-[#2a2a2a] text-white': isActivePath(link.path) }"
          @click="isMobileMenuOpen = false"
        >
          {{ link.name }}
        </router-link>

        <!-- Mobile User Menu Items -->
        <div class="border-t border-gray-800 mt-2 pt-2">
          <router-link
            to="/profile"
            class="block px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            @click="isMobileMenuOpen = false"
          >
            Profile
          </router-link>
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/api/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const route = useRoute()
const showUserMenu = ref(false)
const isMobileMenuOpen = ref(false)
const scrolled = ref(false)
const user = ref(authService.getCurrentUser())
const themeStore = useThemeStore()

const navLinks = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Students', path: '/students' },
  { name: 'Subjects', path: '/subjects' },
  { name: 'Grades', path: '/grades' }
]

const userInitials = computed(() => {
  if (!user.value?.first_name) return 'U'
  return user.value.first_name.charAt(0).toUpperCase()
})

const isActivePath = (path) => {
  return route.path.startsWith(path)
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
    try {
        await authService.logout()
        router.push('/login')
    } catch (error) {
        console.error('Logout error:', error)
        // Still redirect to login even if API call fails
        router.push('/login')
    }
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 0
}

const toggleTheme = themeStore.toggleTheme

// Click outside to close menus
const handleClickOutside = (event) => {
  const menu = document.querySelector('.relative')
  if (menu && !menu.contains(event.target)) {
    showUserMenu.value = false
  }
  
  // Close mobile menu when clicking outside
  const mobileMenu = document.querySelector('.md\\:hidden')
  const mobileMenuButton = document.querySelector('.md\\:hidden button')
  if (!mobileMenuButton?.contains(event.target) && !mobileMenu?.contains(event.target)) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>
