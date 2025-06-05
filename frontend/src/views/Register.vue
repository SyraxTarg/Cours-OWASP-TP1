<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label>Username<input v-model="username" required /></label>
      </div>
      <div class="form-group">
        <label>Password<input type="password" v-model="password" required /></label>
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from '../services/api';
export default {
  data() {
    return { username: '', password: '', error: '' };
  },
  methods: {
    async register() {
      this.error = '';
      try {
        await api.post('/auth/register', { username: this.username, password: this.password });
        this.$router.push('/login');
      } catch (e) {
        this.error = e.response?.data?.error || 'Registration failed';
      }
    }
  }
};
</script>
