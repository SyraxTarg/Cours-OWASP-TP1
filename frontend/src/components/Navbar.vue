<template>
  <nav class="navbar">
    <router-link to="/">SecureBlog</router-link>
    <template v-if="user">
      <router-link to="/">Home</router-link>
      <router-link to="/articles/create">New Article</router-link>
      <router-link v-if="user.role === 'admin'" to="/admin">Admin</router-link>
    </template>

    <div v-if="!user" class="ml-auto">
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </div>

    <div v-else class="ml-auto">
      <span>Salut, {{ user.username }}!</span>
      <button @click="logout">Déconnexion</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { user, clearUser } from '../store/user'
import api from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
  }
  clearUser()
  router.push('/login')
}
</script>

<style scoped>
.ml-auto {
  margin-left: auto;
}
span, button {
  background: none;
  border: none;
  color: #fff;
  font: inherit;
  margin-left: 1rem;
  user-select: none;
}
button:hover {
  text-decoration: underline;
}
</style>
