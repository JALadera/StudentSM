// Mock implementation of vue-router
export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      name: 'Home',
      params: {},
      query: {}
    }
  }
}))

export const useRoute = vi.fn(() => ({
  path: '/',
  name: 'Home',
  params: {},
  query: {}
}))

export const RouterLink = {
  template: '<a :href="to" v-bind="$attrs"><slot/></a>',
  props: {
    to: {
      type: [String, Object],
      required: true
    }
  }
}

export default {
  install(app) {
    app.component('RouterLink', RouterLink)
  }
}
