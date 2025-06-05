<template>
  <div v-if="article">
    <h1>Edit Article</h1>
    <form @submit.prevent="update">
      <div class="form-group">
        <label>Title<input v-model="article.title" required /></label>
      </div>
      <div class="form-group">
        <label>Content<textarea v-model="article.content" required></textarea></label>
      </div>
      <button type="submit">Save</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
  <p v-else>Loading…</p>
</template>

<script>
import api from '../services/api';
export default {
  props: ['id'],
  data() { return { article: null, error: '' }; },
  async created() {
    const res = await api.get(`/articles/${this.id}`);
    this.article = res.data;
  },
  methods: {
    async update() {
      try {
        await api.put(`/articles/${this.id}`, {
          title: this.article.title,
          content: this.article.content
        });
        this.$router.push(`/articles/${this.id}`);
      } catch (e) {
        this.error = e.response?.data?.error || 'Update failed';
      }
    }
  }
};
</script>
