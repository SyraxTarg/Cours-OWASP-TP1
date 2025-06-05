<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label>Username<input v-model="username" required /></label>
      </div>
      <div class="form-group">
        <label>Password<input type="password" v-model="password" required /></label>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';
import { setUser, user } from '../store/user'
import { useRouter } from 'vue-router';

const router = useRouter()
const username = defineModel('username')
const password = defineModel('password')
const error = ref(null)

async function login() {
  try {
    const me = await api.post('/auth/login', { username: username.value, password: password.value })
    setUser(me.data)
    error.value = null
    router.push('/')
  } catch (e) {
    error.value = e.response.data.error
  }
}

</script>
