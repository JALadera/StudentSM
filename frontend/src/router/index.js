// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router"
import { authService } from "@/services/api/auth.js"

// Auth Views
import LoginView from "@/views/auth/LoginView.vue"
import ProfileView from "@/views/auth/ProfileView.vue"
import DashboardView from "@/views/dashboard/DashboardView.vue"
import StudentListView from "@/views/students/StudentListView.vue"
import StudentDetailView from "@/views/students/StudentDetailView.vue"
import SubjectsView from "@/views/subjects/SubjectsView.vue"
import SubjectDetailView from "@/views/subjects/SubjectDetailView.vue"

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { requiresGuest: true }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/students",
    name: "StudentList",
    component: StudentListView,
    meta: { requiresAuth: true },
  },
  {
    path: "/students/:id",
    name: "student-detail",
    component: StudentDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: "/grades",
    name: "GradeBook",
    component: () => import("@/views/grades/GradeBookView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/assessments",
    name: "Assessments",
    component: () => import("@/views/grades/AssessmentView.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/subjects",
    name: "Subjects",
    component: SubjectsView,
    meta: { requiresAuth: true },
  },
  {
    path: "/subjects/:id",
    name: "SubjectDetail",
    component: SubjectDetailView,
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    authService.redirectToLogin()
    return
  } 
  
  if (to.meta.requiresGuest && isAuthenticated) {
    next("/dashboard")
    return
  }
  
  next()
})

export default router
