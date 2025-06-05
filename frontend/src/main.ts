import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { fetchUser } from './store/user'

fetchUser().finally(() => {
  createApp(App)
    .use(router)
    .mount('#app')
})
