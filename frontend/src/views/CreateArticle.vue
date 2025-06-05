<template>
  <div>
    <h1>New Article</h1>
    <form @submit.prevent="create">
      <div class="form-group">
        <label>Title<input v-model="title" required /></label>
      </div>
      <div class="form-group">
        <label>Content<textarea v-model="content" required></textarea></label>
      </div>
      <button type="submit">Create</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import api from '../services/api';
export default {
  data() {
    return { title: '', content: '', error: '' };
  },
  methods: {
    async create() {
      try {
        const res = await api.post('/articles', { title: this.title, content: this.content });
        this.$router.push(`/articles/${res.data.id}`);
      } catch (e) {
        this.error = e.response?.data?.error || 'Creation failed';
      }
    }
  }
};
</script>
